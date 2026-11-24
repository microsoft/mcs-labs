"use strict";
// Imports solution packages into many environments as the administrator, then makes each environment's owner the
// owner of everything in those solutions (agents, agent topics, flows, connection references, connectors, environment
// variables, ...) and publishes the imported agents. Resumable and idempotent; results under <outDir>/results.
// It never creates or binds connections and never turns flows on: those need the owner's own sign-in.
//
//   node scripts/rollout.cjs --config <cfg> --inspect-packages                         offline
//   node scripts/rollout.cjs --config <cfg> --preflight [--only a,b] [--concurrency 24] read-only
//   node scripts/rollout.cjs --config <cfg> --deploy --dry-run                         read-only plan
//   node scripts/rollout.cjs --config <cfg> --deploy [--only a,b] [--concurrency 12] [--allow-upgrade]
//        [--allow-upgrade-customized] [--allow-preparing] [--force]
//   node scripts/rollout.cjs --config <cfg> --verify                                   read-only
//   node scripts/rollout.cjs --config <cfg> --summary [--preflight|--verify|--dry-run]
//   Any mode on one environment: --url https://org.crm.dynamics.com [--owner user@contoso.com]
const { parseArgs, loadConfig, planFor, willImport, publishReason, isPublished, finalStatus, cmpVer, pool, tally, iso, lower, readJson, writeJson } = require("./lib/core.cjs");
const { createAuth } = require("./lib/dataverse.cjs");
const ops = require("./lib/ops.cjs");
const { loadEnvs, createRunner, readResults, brief, label } = require("./lib/runner.cjs");
const fs = require("node:fs");

const flowState = (s) => (s === 1 ? "On" : s === 0 ? "Off/Draft" : s === 2 ? "Suspended" : String(s));
const lookup = (obj, key) => {
  const k = Object.keys(obj || {}).find((x) => lower(x) === lower(key));
  return k ? obj[k] : undefined;
};

// --- offline -------------------------------------------------------------------------------------------------
function inspectPackages(cfg) {
  for (const p of cfg.packages) {
    console.log(`\n${p.file}  (${(p.bytes / 1024).toFixed(0)} KB, sha256 ${p.sha256.slice(0, 16)}…)`);
    console.log(`  solution    ${p.uniqueName} ${p.version} ${p.managed ? "MANAGED" : "unmanaged"} | "${p.displayName}" | publisher ${p.publisher} (prefix ${p.publisherPrefix})`);
    if (p.bots.length) console.log(`  agents      ${p.bots.join(", ")} (+${p.botComponents} agent components)`);
    if (p.workflows.length) console.log(`  flows       ${p.workflows.map((w) => `${w.name} [category ${w.category}]`).join("; ")}`);
    if (p.connectionReferences.length) console.log(`  conn refs   ${p.connectionReferences.map((r) => `${r.logicalName} -> ${r.connector}`).join("; ")}`);
    if (p.environmentVariables.length) console.log(`  env vars    ${p.environmentVariables.join(", ")}`);
    if (p.tables.length) console.log(`  tables      ${p.tables.join(", ")}`);
    if (p.canvasApps.length) console.log(`  canvas apps ${p.canvasApps.join(", ")} (owner must be changed in Power Apps; reported as manual)`);
    const notes = [];
    if (p.managed) notes.push("managed package: owners can use but not edit or publish-edit its components");
    if (p.connectionReferences.length) notes.push(`${p.connectionReferences.length} connection reference(s) arrive unbound; the owner binds them to their own connections`);
    if (p.workflows.some((w) => w.category === 5 || w.category === 6)) notes.push("flows stay Off until the owner binds the connection references and turns them on");
    if (p.environmentVariables.length) notes.push("environment variable values only travel if they are inside the package");
    for (const n of notes) console.log(`  note        ${n}`);
  }
}

// --- planning (read-only) ------------------------------------------------------------------------------------
// Adds the per-package plan; an upgrade is blocked when the owner already changed that solution (an unmanaged
// upgrade can deactivate or overwrite their work) unless --allow-upgrade-customized.
async function planEnv(c, info, cfg, opts) {
  const plans = [];
  for (const pkg of cfg.packages) {
    const installed = ops.findSol(info.solutionRows, pkg.uniqueName);
    const plan = { solution: pkg.uniqueName, version: pkg.version, ...planFor(pkg, installed, { allowUpgrade: opts.allowUpgrade }) };
    if (plan.action === "upgrade" && !opts.allowUpgradeCustomized && info.owner) {
      const got = await ops.solutionItems(c, pkg.uniqueName, cfg.assign);
      const touched = (got ? got.items : []).filter((i) => i.modifiedBy === info.owner.id || (i.t.logical === "workflow" && i.row.statecode === 1));
      if (touched.length) {
        plan.action = "blocked-customized";
        plan.reason = `owner changed or turned on: ${touched.slice(0, 5).map((i) => `${i.t.logical}:${i.name}`).join(", ")}${touched.length > 5 ? ` (+${touched.length - 5})` : ""}; pass --allow-upgrade-customized`;
      }
    }
    plans.push(plan);
  }
  return plans;
}

async function preflightEnv(env, ctx) {
  const c = ctx.auth.client(env.instanceUrl);
  const out = { env: brief(env), mode: "preflight", at: iso() };
  try {
    out.inspect = await ops.inspect(env, c, ctx.cfg, ctx.cfg.packages, ctx.opts);
    out.plan = await planEnv(c, out.inspect, ctx.cfg, ctx.opts);
    out.status = out.inspect.flags.length || out.inspect.importRunning ? "flagged" : "ok";
  } catch (e) {
    out.status = "unreachable";
    out.error = String(e.message).slice(0, 600);
  }
  delete (out.inspect || {}).solutionRows;
  writeJson(ctx.runner.resultFile(env, "preflight"), out);
  return out;
}

// --- deploy --------------------------------------------------------------------------------------------------
async function deployEnv(env, ctx) {
  const { cfg, opts, runner } = ctx;
  const dry = opts.dryRun;
  const c = ctx.auth.client(env.instanceUrl);
  const file = runner.resultFile(env, dry ? "dryrun" : "deploy");
  const prev = fs.existsSync(runner.resultFile(env, "deploy")) ? readJson(runner.resultFile(env, "deploy")) : undefined;
  const res = { env: brief(env), mode: dry ? "dry-run" : "deploy", packageSet: ctx.packageSet, startedAt: iso(), status: "running", errors: [], notes: [], imports: [], assigned: [], published: [] };
  // Solutions this tool imported (this or an earlier run). With publish "imported" only their agents are published,
  // so anything the owner imported or built themselves is never republished.
  res.importedByUs = { ...((prev && prev.importedByUs) || {}) };
  const save = () => writeJson(file, res);
  const log = (m) => runner.log(env, m);
  save();
  try {
    res.inspect = await ops.inspect(env, c, cfg, cfg.packages, opts);
  } catch (e) {
    res.status = "unreachable";
    res.errors.push(String(e.message).slice(0, 600));
    res.finishedAt = iso();
    save();
    return res;
  }
  const info = res.inspect;
  try {
    if (info.flags.length || info.importRunning) {
      res.status = "flagged";
      res.notes.push(...info.flags, ...(info.importRunning ? ["an import is already running"] : []));
      return res;
    }
    res.notes.push(...info.warnings);
    const ownerId = info.owner.id;
    res.plan = await planEnv(c, info, cfg, opts);
    for (const p of res.plan.filter((x) => !willImport(x) && x.action !== "present")) res.notes.push(`${p.solution}: ${p.action}${p.installed ? ` (${p.installed})` : ""}${p.reason ? ` - ${p.reason}` : ""}`);

    if (dry) {
      const sols = await ops.readSolutions(c, cfg.packages.map((p) => p.uniqueName));
      const { items } = await ops.readOwnables(c, await ops.readComponents(c, sols), cfg.assign);
      res.wouldImport = res.plan.filter(willImport).map((p) => `${p.solution} ${p.version} (${p.action})`);
      res.wouldAssign = items.filter((i) => !i.manual && i.owner !== ownerId).map((i) => `${i.t.logical}:${i.name}`);
      res.wouldAssignNote = res.wouldImport.length ? "plus every ownable component of the solutions above once imported" : undefined;
      res.manual = items.filter((i) => i.manual).map((i) => `${i.t.logical}:${i.name}`);
      res.status = "dry-run";
      return res;
    }

    for (const p of res.plan.filter(willImport)) {
      const pkg = cfg.packages.find((x) => x.uniqueName === p.solution);
      log(`importing ${p.solution} ${p.version} (${p.action})`);
      const r = await ops.importPackage(c, pkg, cfg.import, (attempt, waitMs) => {
        res.notes.push(`${p.solution}: import throttled (attempt ${attempt}), retried after ${Math.round(waitMs / 1000)}s`);
        log(`import ${p.solution} throttled (attempt ${attempt}); retrying in ${Math.round(waitMs / 1000)}s`);
        save();
      });
      res.imports.push({ solution: p.solution, action: p.action, ...r });
      if (r.ok) res.importedByUs[pkg.uniqueName] = r.startedAt;
      else res.errors.push(`import ${p.solution}: ${r.message || r.statuscode}`);
      log(`import ${p.solution}: ${r.ok ? "ok" : "FAILED"} ${r.seconds}s ${r.message || ""} ${(r.issues || []).join(" | ")}`);
      save();
      const pc = cfg.import.publishCustomizations;
      if (r.ok && !pkg.managed && (pc === "always" || (pc === "auto" && p.action === "upgrade" && pkg.tables.length))) {
        try {
          const s = await ops.publishAllXml(c);
          res.notes.push(`published all customizations after ${p.solution} (${s}s)`);
        } catch (e) {
          res.errors.push(`publish customizations after ${p.solution}: ${String(e.message).slice(0, 300)}`);
        }
        save();
      }
    }

    // Ownership: every ownable component of every configured solution that is installed, not just the ones imported now.
    const sols = await ops.readSolutions(c, cfg.packages.map((p) => p.uniqueName));
    const comps = await ops.readComponents(c, sols);
    let { items } = await ops.readOwnables(c, comps, cfg.assign);
    for (const it of items.filter((i) => !i.manual && i.owner !== ownerId)) {
      try {
        const how = await ops.assign(c, it, ownerId);
        res.assigned.push(`${it.t.logical}:${it.name}${how === "patch" ? " (patch)" : ""}`);
      } catch (e) {
        res.errors.push(`assign ${it.t.logical} ${it.name}: ${String(e.message).slice(0, 300)}`);
      }
    }
    log(`assigned ${res.assigned.length} component(s) to ${info.owner.fullname}`);
    save();

    if (cfg.publish !== "none") {
      ({ items } = await ops.readOwnables(c, comps, cfg.assign));
      for (const b of items.filter((i) => i.t.logical === "bot")) {
        const since = lookup(res.importedByUs, b.solution);
        const why = publishReason(b.row, since) || (cfg.publish === "all" && !isPublished(b.row) ? "not published" : null);
        if (!why) continue;
        try {
          const r = await ops.publishBot(c, b.id);
          res.published.push({ name: b.name, solution: b.solution, why, ...r });
          log(`publish ${b.name} (${why}): ${r.status} ${r.seconds}s`);
          if (r.status !== "Succeeded") res.errors.push(`publish ${b.name}: ${r.status}`);
        } catch (e) {
          res.errors.push(`publish ${b.name}: ${String(e.message).slice(0, 300)}`);
        }
        save();
      }
    }

    res.final = await ops.snapshot(c, cfg.packages, ownerId, cfg.assign);
    res.status = finalStatus(res, cfg.packages, cfg.publish);
  } catch (e) {
    res.status = "error";
    res.errors.push(String(e.message).slice(0, 600));
  } finally {
    if (res.inspect) delete res.inspect.solutionRows;
    res.finishedAt = iso();
    save();
  }
  return res;
}

// --- verify (read-only) --------------------------------------------------------------------------------------
async function verifyEnv(env, ctx) {
  const { cfg } = ctx;
  const c = ctx.auth.client(env.instanceUrl);
  const out = { env: brief(env), mode: "verify", at: iso(), problems: [], ownerTodo: [] };
  try {
    await c.dv("GET", "WhoAmI", { timeoutMs: 60000 });
    const owner = await ops.resolveOwner(c, env, cfg, ctx.opts.cliOwner);
    if (!owner.user) throw new Error(`owner not resolved: ${owner.flags.join(", ")}`);
    out.owner = { fullname: owner.user.fullname, upn: owner.user.upn };
    out.final = await ops.snapshot(c, cfg.packages, owner.user.id, cfg.assign);
    const f = out.final;
    for (const p of cfg.packages) {
      const s = f.solutions[p.uniqueName];
      if (!s) out.problems.push(`${p.uniqueName} missing`);
      else if (cmpVer(s.version, p.version) < 0) out.problems.push(`${p.uniqueName} at ${s.version}`);
    }
    for (const n of f.notOwned) out.problems.push(`not owned by owner: ${n}`);
    if (cfg.publish !== "none") for (const b of f.bots) if (!b.publishedon || (b.lastPublish && b.lastPublish !== "Succeeded")) out.problems.push(`agent not published: ${b.name}`);
    for (const r of f.connectionReferences.filter((x) => !x.bound)) out.ownerTodo.push(`bind connection reference ${r.name} (${r.connector})`);
    for (const w of f.flows.filter((x) => x.statecode !== 1 && (x.category === 5 || x.category === 6))) out.ownerTodo.push(`turn on flow ${w.name}`);
    for (const m of f.manual) if (!m.ownedByTarget) out.ownerTodo.push(`manual: ${m.component} - ${m.why}`);
    out.status = out.problems.length ? "incomplete" : "ok";
  } catch (e) {
    out.status = "unreachable";
    out.error = String(e.message).slice(0, 400);
  }
  writeJson(ctx.runner.resultFile(env, "verify"), out);
  return out;
}

// --- summaries -----------------------------------------------------------------------------------------------
function finalTotals(say, withFinal, packages, botsOf = (r) => r.final.bots) {
  for (const p of packages) say(`${p.uniqueName} ${p.version}: ${JSON.stringify(tally(withFinal.map((r) => (r.final.solutions[p.uniqueName] ? r.final.solutions[p.uniqueName].version : "missing"))))}`);
  const bots = withFinal.flatMap(botsOf);
  say(`agents published: ${bots.filter((b) => b.publishedon && (!b.lastPublish || b.lastPublish === "Succeeded")).length} / ${bots.length}`);
  say(`components not owned by the owner: ${withFinal.reduce((n, r) => n + r.final.notOwned.length, 0)}`);
  say(`flows: ${JSON.stringify(tally(withFinal.flatMap((r) => r.final.flows.map((f) => `${f.name}=${flowState(f.statecode)}`))))}`);
  say(`connection references: ${JSON.stringify(tally(withFinal.flatMap((r) => r.final.connectionReferences.map((x) => (x.bound ? "bound" : "unbound (owner binds)")))))}`);
  const manual = withFinal.flatMap((r) => r.final.manual.filter((m) => !m.ownedByTarget).map((m) => m.component));
  if (manual.length) say(`manual follow-up (not owned by the owner): ${JSON.stringify(tally(manual))}`);
  const other = tally(withFinal.flatMap((r) => Object.keys(r.final.otherComponentTypes)));
  if (Object.keys(other).length) say(`component types without an owner (nothing to assign): ${JSON.stringify(other)}`);
}

function summarize(mode, rs, cfg, say) {
  say(`\n=== ${mode} summary (${rs.length} environments) ===`);
  say(`status: ${JSON.stringify(tally(rs.map((r) => r.status)))}`);
  const un = rs.filter((r) => r.status === "unreachable");
  if (un.length) say(`unreachable: ${un.map((r) => `${r.env.name} (${String(r.error || r.errors?.[0] || "").replace(/\[request-id:[^\]]*\]/, "").slice(0, 140)})`).join("; ")}`);
  if (mode === "preflight" || mode === "dry-run") {
    const ok = rs.filter((r) => r.inspect);
    say(`flags: ${JSON.stringify(tally(ok.flatMap((r) => r.inspect.flags)))}`);
    say(`warnings: ${JSON.stringify(tally(ok.flatMap((r) => r.inspect.warnings.map((w) => w.replace(/\d+/g, "N")))))}`);
    say(`owner resolved via: ${JSON.stringify(tally(ok.map((r) => (r.inspect.ownerHint ? r.inspect.ownerHint.from : "none"))))}`);
    say(`owner roles: ${JSON.stringify(tally(ok.filter((r) => r.inspect.owner).map((r) => r.inspect.owner.roles.slice().sort().join("+") || "(none)")))}`);
    for (const p of cfg.packages) {
      say(`${p.uniqueName} ${p.version}: ${JSON.stringify(tally(ok.filter((r) => r.plan).map((r) => { const x = r.plan.find((q) => q.solution === p.uniqueName); return x.installed ? `${x.action}@${x.installed}` : x.action; })))}`);
    }
    say(`import running now: ${ok.filter((r) => r.inspect.importRunning).map((r) => r.env.name).join(", ") || "none"}`);
    if (mode === "dry-run") say(`components to reassign now: ${rs.reduce((n, r) => n + (r.wouldAssign || []).length, 0)}`);
  } else if (mode === "deploy") {
    const withFinal = rs.filter((r) => r.final);
    finalTotals(say, withFinal, cfg.packages, (r) => r.final.bots.filter((b) => lookup(r.importedByUs, b.solution) || cfg.publish === "all"));
    say(`components reassigned this run: ${rs.reduce((n, r) => n + r.assigned.length, 0)} | agents published this run: ${rs.reduce((n, r) => n + r.published.length, 0)}`);
  } else {
    finalTotals(say, rs.filter((r) => r.final), cfg.packages);
    say(`owner to-dos: ${JSON.stringify(tally(rs.flatMap((r) => (r.ownerTodo || []).map((t) => t.replace(/\(.*\)$/, "").trim()))))}`);
  }
  for (const r of rs.filter((x) => !["ok", "done", "dry-run"].includes(x.status))) {
    say(`  ${String(r.status).toUpperCase()} ${r.env.name} (${r.env.key}): ${[...(r.notes || []), ...(r.errors || []), ...(r.problems || []), r.error || ""].filter(Boolean).join(" | ").slice(0, 400)}`);
  }
}

// --- main ----------------------------------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const MODES = ["inspect-packages", "preflight", "deploy", "verify", "summary"];
  const mode = MODES.find((m) => args.has(m) && (m !== "preflight" && m !== "verify" ? true : !args.has("summary")));
  if (!args.get("config") || !mode) throw new Error(`Usage: node scripts/rollout.cjs --config <config.json> --${MODES.join("|--")} [options]; see SKILL.md`);
  const cfg = loadConfig(args.get("config"));
  if (mode === "inspect-packages") return inspectPackages(cfg);

  const opts = {
    dryRun: args.has("dry-run"),
    allowUpgrade: args.has("allow-upgrade") || args.has("allow-upgrade-customized"),
    allowUpgradeCustomized: args.has("allow-upgrade-customized"),
    allowPreparing: args.has("allow-preparing"),
    force: args.has("force"),
    cliOwner: args.get("owner"),
  };
  let envs = loadEnvs(cfg, args);
  if (opts.cliOwner && envs.length !== 1) throw new Error("--owner applies to a single environment; use --url or --only <one>, or put owners in the environment list.");
  if (opts.cliOwner) envs = envs.map((e) => ({ ...e, owner: undefined }));

  const runMode = mode === "deploy" && opts.dryRun ? "dry-run" : mode;
  const runner = createRunner(cfg, runMode === "summary" ? "summary" : runMode);
  if (mode === "summary") {
    const kind = args.has("preflight") ? "preflight" : args.has("verify") ? "verify" : args.has("dry-run") ? "dryrun" : "deploy";
    return summarize(kind === "dryrun" ? "dry-run" : kind, readResults(runner, envs, kind), cfg, runner.say);
  }

  const packageSet = cfg.packages.map((p) => `${p.uniqueName}@${p.version}#${p.sha256.slice(0, 12)}`);
  if (mode === "deploy" && !opts.dryRun && !opts.force) {
    const before = envs.length;
    envs = envs.filter((e) => {
      const f = runner.resultFile(e, "deploy");
      if (!fs.existsSync(f)) return true;
      const prev = readJson(f);
      return !(prev.status === "done" && JSON.stringify(prev.packageSet) === JSON.stringify(packageSet));
    });
    if (before !== envs.length) runner.say(`skipping ${before - envs.length} environment(s) already done with these packages (use --force to redo)`);
  }
  const auth = createAuth(cfg);
  const ctx = { cfg, opts, runner, auth, packageSet };
  const conc = args.num("concurrency", mode === "deploy" && !opts.dryRun ? 12 : 24);
  runner.say(`${runMode} start ${iso()} | environments=${envs.length} concurrency=${conc} | packages ${packageSet.map((s) => s.split("#")[0]).join(", ")} | log ${runner.logFile}`);

  const results = [];
  let done = 0;
  const t0 = Date.now();
  await pool(envs, conc, async (env) => {
    const s = Date.now();
    const r = mode === "preflight" ? await preflightEnv(env, ctx) : mode === "verify" ? await verifyEnv(env, ctx) : await deployEnv(env, ctx);
    results.push(r);
    done++;
    const mins = ((Date.now() - s) / 60000).toFixed(1);
    if (mode === "deploy") {
      const marks = cfg.packages
        .map((p) => {
          const i = r.imports.find((x) => x.solution === p.uniqueName);
          const plan = r.plan && r.plan.find((x) => x.solution === p.uniqueName);
          return `${p.uniqueName}${i ? (i.ok ? "+" : "!") : plan ? (plan.action === "present" ? "=" : plan.action.startsWith("blocked") ? "x" : willImport(plan) ? ">" : "~") : "?"}`;
        })
        .join(" ");
      const extra = [...r.notes, ...r.errors].join(" | ").slice(0, 220);
      runner.say(`[${done}/${envs.length}] ${label(env)}: ${r.status} | ${marks} | ${opts.dryRun ? `would assign ${(r.wouldAssign || []).length}` : `assigned ${r.assigned.length} | published ${r.published.length}`} | ${mins}m${extra ? " | " + extra : ""}`);
    } else if (r.status !== "ok" || done % 25 === 0 || envs.length <= 25) {
      runner.say(`[${done}/${envs.length}] ${label(env)}: ${r.status}${r.error ? " | " + r.error.slice(0, 200) : ""}${r.inspect && r.inspect.flags.length ? " | " + r.inspect.flags.join(",") : ""}${r.problems && r.problems.length ? " | " + r.problems.join(" | ").slice(0, 200) : ""}`);
    }
  });
  runner.say(`${runMode} finished in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  summarize(runMode, results, cfg, runner.say);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(`FATAL: ${String((e && e.message) || e).slice(0, 1200)}`);
    process.exit(1);
  });
}

module.exports = { planEnv, deployEnv, verifyEnv, preflightEnv, summarize, inspectPackages };
