"use strict";
// Shared plumbing for the batch scripts: environment selection, result files and logging.
const fs = require("node:fs");
const path = require("node:path");
const { readJson, safeName, iso, lower, isGuid } = require("./core.cjs");

const envKey = (env) => env.id || safeName(new URL(env.instanceUrl).hostname);
const label = (env) => env.displayName || (env.instanceUrl ? new URL(env.instanceUrl).hostname : env.id);
const brief = (env) => ({ id: env.id, key: envKey(env), name: env.displayName, url: env.instanceUrl, orgId: env.orgId || null, owner: env.owner || null, usedBy: env.usedBy ? env.usedBy.id : null, dataverseState: env.dataverseState || null });

// --url targets one environment directly (no admin API data; pass --owner unless config.owner.upn is set).
// Otherwise environments come from <outDir>/envs-resolved.json, written by resolve-envs.cjs.
function loadEnvs(cfg, args) {
  if (args.get("url")) {
    const origin = new URL(args.get("url")).origin.toLowerCase();
    const resolvedFile = path.join(cfg.outDir, "envs-resolved.json");
    const known = fs.existsSync(resolvedFile) ? readJson(resolvedFile).resolved.find((e) => e.instanceUrl === origin) : null;
    return [known || { id: null, displayName: new URL(origin).hostname, instanceUrl: origin }];
  }
  const file = path.join(cfg.outDir, "envs-resolved.json");
  if (!fs.existsSync(file)) throw new Error(`${file} not found. Run: node scripts/resolve-envs.cjs --config ${cfg.file}  (or target one environment with --url)`);
  const data = readJson(file);
  if (data.tenantId && data.tenantId !== cfg.tenantId) throw new Error(`${file} was resolved for tenant ${data.tenantId}, not ${cfg.tenantId}.`);
  let envs = data.resolved.filter((e) => e.instanceUrl);
  const only = args.list("only").map(lower);
  if (only.length) {
    const match = (e, o) => (isGuid(o) ? e.id === o : o.startsWith("https://") ? e.instanceUrl === new URL(o).origin : lower(e.displayName) === o || lower(new URL(e.instanceUrl).hostname).startsWith(o));
    const missing = only.filter((o) => !envs.some((e) => match(e, o)));
    if (missing.length) throw new Error(`--only entries not in envs-resolved.json (or without Dataverse): ${missing.join(", ")}`);
    envs = envs.filter((e) => only.some((o) => match(e, o)));
  }
  return envs;
}

function createRunner(cfg, mode) {
  const results = path.join(cfg.outDir, "results");
  const logs = path.join(cfg.outDir, "logs");
  fs.mkdirSync(results, { recursive: true });
  fs.mkdirSync(logs, { recursive: true });
  const logFile = path.join(logs, `${mode}-${iso().replace(/[:.]/g, "-")}.log`);
  return {
    logFile,
    resultFile: (env, kind = mode) => path.join(results, `${envKey(env)}.${kind}.json`),
    log: (env, msg) => fs.appendFileSync(logFile, `${iso()} ${env ? label(env) : "-"} | ${msg}\n`),
    say: (msg) => {
      console.log(msg);
      fs.appendFileSync(logFile, msg + "\n");
    },
  };
}

function readResults(runner, envs, kind) {
  return envs
    .map((e) => runner.resultFile(e, kind))
    .filter((f) => fs.existsSync(f))
    .map((f) => readJson(f));
}

module.exports = { envKey, label, brief, loadEnvs, createRunner, readResults };
