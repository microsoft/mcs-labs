"use strict";
// Finds and heals Copilot Studio agents from the configured packages that are stuck (never finished provisioning),
// missing (solution installed but agent row gone) or unpublished. Scan is read-only; --fix changes things.
//
// Heal order per environment, least invasive first:
//   1. delete leftover provisioning probes; skip when an import is running
//   2. leave the environment alone when the owner already changed the affected solution (their work wins)
//   3. probe: create a throwaway agent and see whether Copilot Studio can provision anything here right now
//      (not provisioned -> the environment is unhealthy; only re-assert ownership and report env-unhealthy)
//   4. PvaProvision each stuck agent in place and wait --reprov-min minutes
//   5. only with --recreate: delete the still-broken agents and re-import their package (same version)
//   6. publish anything still unpublished, then re-assign every component of those solutions to the owner
//
//   node scripts/heal-agents.cjs --config <cfg> [--only a,b] [--concurrency 16]                     scan
//   node scripts/heal-agents.cjs --config <cfg> --fix [--recreate] [--probe-only] [--probe-min 3]
//        [--reprov-min 5] [--watch-min 10] [--passes 1 --every 15] [--concurrency 6]
//   Any mode on one environment: --url https://org.crm.dynamics.com [--owner user@contoso.com]
const { parseArgs, loadConfig, pool, tally, iso, lower, sleep, writeJson } = require("./lib/core.cjs");
const { createAuth } = require("./lib/dataverse.cjs");
const ops = require("./lib/ops.cjs");
const { loadEnvs, createRunner, brief, label } = require("./lib/runner.cjs");

const PROBE_NAME = "ZZ Provisioning Probe";
const q = (s) => String(s).replace(/'/g, "''");
const RETRY = ["env-unhealthy", "still-stuck", "error", "import-running", "unreachable"];

function expectedAgents(cfg) {
  const m = new Map();
  for (const p of cfg.packages) for (const s of p.bots) m.set(lower(s), p.uniqueName);
  return m;
}

async function probeLeftovers(c, prefix) {
  return c.list(`bots?$select=botid,name,schemaname&$filter=startswith(schemaname,'${q(prefix)}') or startswith(name,'${PROBE_NAME}')`);
}

async function scanEnv(env, ctx) {
  const out = { env: brief(env), at: iso() };
  try {
    const c = ctx.auth.client(env.instanceUrl);
    const st = await ops.agentsState(c, ctx.expected);
    out.agents = st.agents.map((a) => ({ name: a.name, solution: a.unique, state: a.state, prov: a.prov }));
    out.probeLeftovers = (await probeLeftovers(c, ctx.prefix)).length;
    out.needs = st.agents.some((a) => a.state !== "ok") || out.probeLeftovers > 0;
  } catch (e) {
    out.error = String(e.message).slice(0, 300);
  }
  return out;
}

async function healEnv(env, ctx) {
  const { cfg, opts, runner } = ctx;
  const c = ctx.auth.client(env.instanceUrl);
  const res = { env: brief(env), startedAt: iso(), status: "running", actions: [], errors: [] };
  const say = (m) => {
    res.actions.push(m);
    runner.log(env, m);
  };
  const save = () => writeJson(runner.resultFile(env, "heal"), res);
  const reassign = async (uniques) => {
    for (const unique of uniques) {
      const got = await ops.solutionItems(c, unique, cfg.assign);
      if (!got) continue;
      const { moved, failed } = await ops.reassignItems(c, got.items, res.owner.id);
      if (moved || failed.length) say(`${unique}: re-assigned ${moved} component(s) to ${res.owner.fullname}${failed.length ? `, ${failed.length} FAILED` : ""}`);
      for (const f of failed) res.errors.push(`assign ${f}`);
    }
  };
  try {
    const owner = await ops.resolveOwner(c, env, cfg, opts.cliOwner);
    if (!owner.user || owner.flags.length) throw new Error(`owner not usable: ${owner.flags.join(", ") || "not found"}`);
    res.owner = { id: owner.user.id, fullname: owner.user.fullname, upn: owner.user.upn };

    for (const b of await probeLeftovers(c, ctx.prefix)) say(`deleted leftover probe ${b.schemaname}: ${(await ops.deleteBot(c, b.botid)) ? "gone" : "STILL PRESENT"}`);

    const jobs = await ops.openImports(c);
    if (jobs.running.length) {
      res.status = "import-running";
      say(`skipped: import running (${jobs.running.join(", ")})`);
      return res;
    }

    let st = await ops.agentsState(c, ctx.expected);
    res.before = st.agents.map((a) => ({ name: a.name, state: a.state, prov: a.prov }));
    const broken = st.agents.filter((a) => a.state === "stuck" || a.state === "missing");
    const brokenSolutions = [...new Set(broken.map((a) => a.unique))];
    if (broken.length) {
      for (const unique of brokenSolutions) {
        const got = await ops.solutionItems(c, unique, cfg.assign);
        const hit = got && got.items.find((i) => i.modifiedBy === res.owner.id);
        if (hit) {
          res.status = "skipped-target-modified";
          say(`not touching ${unique}: ${hit.t.logical} ${hit.name} was modified by ${res.owner.fullname}`);
          return res;
        }
      }
      const donor = st.agents.find((a) => a.row);
      const configuration = donor ? (await c.dv("GET", `bots(${donor.id})?$select=configuration`)).json.configuration : undefined;
      runner.log(env, `broken: ${broken.map((a) => `${a.name}(${a.state}/${a.prov})`).join(", ")}; probing (${opts.probeMin} min)`);
      res.probe = await ops.probe(c, { prefix: ctx.prefix, minutes: opts.probeMin, configuration, log: (m) => runner.log(env, m) });
      say(`probe -> ${res.probe.result} in ${res.probe.seconds}s (probe agent ${res.probe.probeDeleted ? "deleted" : "NOT deleted"})`);
      if (res.probe.result !== "Provisioned") {
        await reassign(brokenSolutions);
        res.status = "env-unhealthy";
        return res;
      }
      if (opts.probeOnly) {
        res.status = "env-healthy";
        return res;
      }

      let still = broken;
      const inPlace = broken.filter((a) => a.state === "stuck" && a.id);
      if (inPlace.length && opts.reprovMin > 0) {
        for (const a of inPlace) {
          try {
            await c.dv("POST", `bots(${a.id})/Microsoft.Dynamics.CRM.PvaProvision`, { body: {}, timeoutMs: 120000, retries: 0 });
            say(`PvaProvision ${a.name}: accepted`);
          } catch (e) {
            say(`PvaProvision ${a.name}: ${String(e.message).slice(0, 200)}`);
          }
        }
        const w = await ops.waitProvisioned(c, ctx.expected, inPlace.map((a) => a.schema), opts.reprovMin);
        const now = w.st ? w.st.agents : [];
        still = broken.filter((a) => {
          const cur = now.find((x) => x.schema === a.schema);
          return !cur || cur.state === "stuck" || cur.state === "missing";
        });
        const fixed = inPlace.filter((a) => !still.includes(a));
        say(`in-place re-provision after ${w.seconds}s: ${fixed.length ? `fixed ${fixed.map((a) => a.name).join(", ")}` : "no change"}`);
      }

      if (still.length && !opts.recreate) say(`still broken: ${still.map((a) => a.name).join(", ")} (re-run with --recreate to delete and re-import them)`);
      for (const unique of opts.recreate ? [...new Set(still.map((a) => a.unique))] : []) {
        for (const a of still.filter((x) => x.unique === unique && x.id)) {
          const gone = await ops.deleteBot(c, a.id);
          say(`deleted broken ${a.name}: ${gone ? "gone" : "STILL PRESENT"}`);
          if (!gone) throw new Error(`could not delete ${a.name}`);
        }
        const pkg = cfg.packages.find((p) => p.uniqueName === unique);
        const imp = await ops.importPackage(c, pkg, cfg.import, (n, ms) => say(`re-import ${unique} throttled (attempt ${n}); retrying in ${Math.round(ms / 1000)}s`));
        say(`re-import ${unique}: ${imp.ok ? "ok" : "FAILED"} ${imp.seconds}s ${imp.message || ""}`.trim());
        if (!imp.ok) {
          res.errors.push(`import ${unique}: ${imp.message || imp.statuscode}`);
          continue;
        }
        const schemas = [...ctx.expected].filter(([, u]) => u === unique).map(([s]) => s);
        const w = await ops.waitProvisioned(c, ctx.expected, schemas, opts.watchMin);
        say(`provisioning after ${w.seconds}s: ${(w.st ? w.st.agents.filter((a) => schemas.includes(a.schema)) : []).map((a) => `${a.name}=${a.prov}`).join(", ")}`);
      }
    }

    // A just-provisioned agent usually auto-publishes; give it two minutes, then publish what is still unpublished.
    st = await ops.agentsState(c, ctx.expected);
    const until = Date.now() + (broken.length ? 120000 : 0);
    while (Date.now() < until && st.agents.some((a) => a.state === "unpublished")) {
      await sleep(15000);
      st = await ops.agentsState(c, ctx.expected);
    }
    for (const a of st.agents.filter((x) => x.state === "unpublished")) {
      try {
        const r = await ops.publishBot(c, a.id, { skipIfPublished: true });
        say(`publish ${a.name}: ${r.status} (${r.seconds}s)`);
        if (r.status !== "Succeeded" && r.status !== "already published") res.errors.push(`publish ${a.name}: ${r.status}`);
      } catch (e) {
        res.errors.push(`publish ${a.name}: ${String(e.message).slice(0, 300)}`);
      }
    }
    await reassign([...new Set(st.agents.map((a) => a.unique))]);

    st = await ops.agentsState(c, ctx.expected);
    res.after = st.agents.map((a) => ({ name: a.name, state: a.state, prov: a.prov, ownedByTarget: a.owner === res.owner.id }));
    const allOk = st.agents.every((a) => a.state === "ok" && a.owner === res.owner.id);
    const anyBroken = st.agents.some((a) => a.state === "stuck" || a.state === "missing");
    res.status = res.errors.length ? "error" : allOk ? (broken.length ? "healed" : res.actions.length ? "fixed" : "ok") : anyBroken ? "still-stuck" : "incomplete";
  } catch (e) {
    res.status = "error";
    res.errors.push(String(e.message).slice(0, 600));
  } finally {
    res.finishedAt = iso();
    save();
  }
  return res;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.get("config")) throw new Error("Usage: node scripts/heal-agents.cjs --config <config.json> [--fix] [options]; see SKILL.md");
  const cfg = loadConfig(args.get("config"));
  const expected = expectedAgents(cfg);
  if (!expected.size) throw new Error("None of the configured packages contains a Copilot Studio agent; nothing to heal.");
  const opts = {
    fix: args.has("fix"),
    recreate: args.has("recreate"),
    probeOnly: args.has("probe-only"),
    probeMin: args.num("probe-min", 3),
    reprovMin: args.num("reprov-min", 5),
    watchMin: args.num("watch-min", 10),
    cliOwner: args.get("owner"),
  };
  let envs = loadEnvs(cfg, args);
  if (opts.cliOwner && envs.length !== 1) throw new Error("--owner applies to a single environment; use --url or --only <one>.");
  if (opts.cliOwner) envs = envs.map((e) => ({ ...e, owner: undefined }));
  const runner = createRunner(cfg, opts.fix ? "heal" : "heal-scan");
  const ctx = { cfg, opts, runner, expected, auth: createAuth(cfg), prefix: cfg.heal.probePrefix || `${cfg.packages[0].publisherPrefix || "new"}_ZZProvProbe` };
  const passes = opts.fix ? args.num("passes", 1) : 1;
  const everyMin = args.num("every", 15);
  const conc = args.num("concurrency", opts.fix ? 6 : 16);
  runner.say(`heal ${opts.fix ? "fix" : "scan"} ${iso()} | environments=${envs.length} | agents ${[...expected.keys()].join(", ")} | log ${runner.logFile}`);

  for (let pass = 1; pass <= passes && envs.length; pass++) {
    if (pass > 1) {
      runner.say(`--- waiting ${everyMin} min before pass ${pass} (${envs.length} environment(s)) ---`);
      await sleep(everyMin * 60000);
    }
    const scans = await pool(envs, 16, (e) => scanEnv(e, ctx));
    const unreachable = scans.filter((s) => s.error);
    const needy = scans.filter((s) => s.needs);
    runner.say(`pass ${pass}: scanned ${scans.length} | need work ${needy.length} | unreachable ${unreachable.length}`);
    runner.say(`agent states: ${JSON.stringify(tally(scans.flatMap((s) => (s.agents || []).map((a) => a.state))))}`);
    for (const s of needy) runner.say(`  ${s.env.name}: ${s.agents.filter((a) => a.state !== "ok").map((a) => `${a.name}=${a.state}/${a.prov}`).join(", ")}${s.probeLeftovers ? ` +${s.probeLeftovers} probe leftover(s)` : ""}`);
    for (const s of unreachable) runner.say(`  ${s.env.name}: UNREACHABLE ${s.error}`);
    if (!opts.fix) return;

    const byKey = new Map(envs.map((e) => [brief(e).key, e]));
    let n = 0;
    const results = await pool(needy, conc, async (s) => {
      const env = byKey.get(s.env.key);
      const r = await healEnv(env, ctx);
      runner.say(`[${++n}/${needy.length}] ${label(env)}: ${r.status} | ${[...r.actions, ...r.errors.map((x) => "ERROR " + x)].join(" | ").slice(0, 600)}`);
      return r;
    });
    runner.say(`pass ${pass} summary: ${JSON.stringify(tally(results.map((r) => r.status)))}`);
    const retry = new Set([...results.filter((r) => RETRY.includes(r.status)).map((r) => r.env.key), ...unreachable.map((s) => s.env.key)]);
    envs = envs.filter((e) => retry.has(brief(e).key));
    if (envs.length && pass < passes) runner.say(`still to heal: ${envs.map(label).join(", ")}`);
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(`FATAL: ${String((e && e.message) || e).slice(0, 1200)}`);
    process.exit(1);
  });
}

module.exports = { expectedAgents, scanEnv, healEnv };
