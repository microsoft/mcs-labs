"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { loadConfig, loadInputs, loadPlan, readJson, save, sha256, encodePath, sleep } = require("./core.cjs");
const { createTokenProvider } = require("./auth.cjs");
const { createGraph } = require("./graph.cjs");

function parseArgs(argv) {
  const args = { mode: "plan" };
  const modes = new Set(["plan", "check-plan", "bootstrap", "execute", "verify"]);
  let explicitMode = false;
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, "");
    if (!argv[i].startsWith("--")) throw new Error("Expected named arguments.");
    if (modes.has(key)) {
      if (explicitMode) throw new Error("Choose exactly one mode.");
      args.mode = key; explicitMode = true;
    } else if (["config", "canary"].includes(key)) {
      if (!argv[i + 1] || argv[i + 1].startsWith("--") || args[key]) throw new Error(`Missing or duplicate --${key}.`);
      args[key] = argv[++i];
    } else throw new Error(`Unknown argument --${key}.`);
  }
  if (!args.config || (args.canary && args.mode !== "execute")) {
    throw new Error("Usage: node scripts/provision.cjs --config <file> [--plan|--check-plan|--bootstrap|--execute [--canary <object-id>]|--verify]");
  }
  return args;
}

async function identity(graph, recipient) {
  const user = (await graph(`/users/${recipient.objectId}?$select=id,userPrincipalName`)).body;
  if (user?.id?.toLowerCase() !== recipient.objectId || user?.userPrincipalName?.toLowerCase() !== recipient.upn) {
    throw new Error(`Recipient identity mismatch for object ID ${recipient.objectId}.`);
  }
}

function validateDrive(drive, recipient) {
  if (!drive?.id || drive.driveType !== "business" || drive.owner?.user?.id?.toLowerCase() !== recipient.objectId ||
      drive.webUrl?.replace(/\/$/, "").toLowerCase() !== `${recipient.siteUrl}/Documents`.toLowerCase()) {
    throw new Error("Resolved drive does not match the verified recipient and personal site.");
  }
}

async function getDrive(graph, recipient, wait = false) {
  const deadline = Date.now() + (wait ? 10 * 60000 : 0);
  for (;;) {
    const result = await graph(`/users/${recipient.objectId}/drive?$select=id,webUrl,driveType,owner`, { allowed: [200, 403, 404] });
    if (result.status === 200) { validateDrive(result.body, recipient); return result.body; }
    if (Date.now() >= deadline) throw new Error(`Drive not ready or access denied: HTTP ${result.status}. Check provisioning/access, not the upload payload.`);
    await sleep(15000);
  }
}

async function matches(graph, driveId, entry, item) {
  if (!item?.id || !item.file || item.size !== entry.size || item.name !== entry.target.split("/").at(-1)) return false;
  const downloaded = await graph(`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(item.id)}/content`, { bytes: true });
  return sha256(downloaded.bytes) === entry.sha256;
}

async function ensureParents(graph, driveId, target) {
  const parts = target.split("/").slice(0, -1);
  const root = `/drives/${encodeURIComponent(driveId)}/root`;
  for (let index = 0; index < parts.length; index++) {
    const folder = parts.slice(0, index + 1).join("/");
    const location = `${root}:/${encodePath(folder)}`;
    let current = await graph(`${location}?$select=id,folder`, { allowed: [200, 404] });
    if (current.status === 404) {
      const parent = index === 0 ? root : `${root}:/${encodePath(parts.slice(0, index).join("/"))}:`;
      try {
        await graph(`${parent}/children`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: parts[index], folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
          allowed: [201, 409],
        });
      } catch (error) {
        current = await graph(`${location}?$select=id,folder`, { allowed: [200, 404] });
        if (current.status !== 200 || !current.body?.folder) throw error;
      }
      current = await graph(`${location}?$select=id,folder`, { allowed: [200, 404] });
    }
    if (current.status !== 200 || !current.body?.folder) throw new Error(`Parent folder conflict: ${folder}.`);
  }
}

async function ensureFile(graph, driveId, entry, { execute = false, probe = false } = {}) {
  const location = `/drives/${encodeURIComponent(driveId)}/root:/${encodePath(entry.target)}`;
  const metadata = () => graph(`${location}?$select=id,name,size,file,eTag`, { allowed: [200, 404] });
  let before = await metadata(), uploaded = false, recovered = false;
  const options = {
    method: "PUT", headers: { "If-None-Match": "*", "Content-Type": "application/octet-stream" },
    allowed: [201, 409, 412],
  };
  const upload = () => {
    const body = fs.readFileSync(entry.local);
    if (sha256(body) !== entry.sha256) throw new Error("Payload changed after planning.");
    return graph(`${location}:/content?@microsoft.graph.conflictBehavior=fail`, { ...options, body });
  };
  if (before.status === 404 && execute) {
    await ensureParents(graph, driveId, entry.target);
    try { uploaded = (await upload()).status === 201; }
    catch (error) {
      // A lost write response is not a failed write. Reconcile without replaying it.
      before = await metadata();
      if (before.status !== 200 || !await matches(graph, driveId, entry, before.body)) throw error;
      recovered = true;
    }
    before = await metadata();
  }
  if (before.status === 404) return { target: entry.target, status: "missing" };
  if (!await matches(graph, driveId, entry, before.body)) return { target: entry.target, status: "conflict" };
  if (probe) {
    const result = await upload();
    if (![409, 412].includes(result.status)) throw new Error("Create-only canary guard was not honored.");
    const after = await metadata();
    if (after.status !== 200 || after.body.eTag !== before.body.eTag ||
        !await matches(graph, driveId, entry, after.body)) throw new Error("Canary conflict probe changed existing content.");
  }
  return { target: entry.target, status: "verified", itemId: before.body.id, eTag: before.body.eTag, uploaded, recovered };
}

async function preparePlan(graph, config, inputs) {
  const file = path.join(config.outDir, "plan.json");
  if (fs.existsSync(file)) throw new Error("A plan already exists. Resume it or use a new outDir; do not overwrite an approved plan.");
  const rows = [];
  for (const recipient of inputs.recipients) {
    await identity(graph, recipient);
    const drive = await graph(`/users/${recipient.objectId}/drive?$select=id,webUrl,driveType,owner`, { allowed: [200, 403, 404] });
    if (drive.status === 200) validateDrive(drive.body, recipient);
    rows.push({ ...recipient, identityVerified: true, driveStatus: drive.status });
  }
  await save(file, { tenantId: config.tenantId, inputsHash: inputs.inputsHash, createdAt: new Date().toISOString(), recipients: rows, files: inputs.files });
  console.log(`Read-only plan: ${rows.length} verified identities, ${inputs.files.length} files each, ${rows.filter(row => row.driveStatus === 200).length} accessible drives. No permissions or content changed.`);
}

async function run(graph, config, inputs, plan, args) {
  const canary = args.canary?.toLowerCase();
  if (canary && !inputs.recipients.some(row => row.objectId === canary)) throw new Error("Canary is outside the approved recipient set.");
  if (args.mode === "execute" && !canary) {
    const pilot = readJson(path.join(config.outDir, "canary.json"));
    if (pilot.inputsHash !== inputs.inputsHash || pilot.status !== "verified" ||
        !inputs.recipients.some(row => row.objectId === pilot.objectId)) throw new Error("A verified canary for this exact plan is required.");
  }
  const rows = inputs.recipients.map(row => ({ objectId: row.objectId, status: "unattempted", files: [] }));
  const report = { inputsHash: inputs.inputsHash, mode: args.mode, startedAt: new Date().toISOString(), recipients: rows };
  const reportFile = path.join(config.outDir, `${canary ? "canary-results" : args.mode}.json`);
  await save(reportFile, report);
  for (const recipient of plan.recipients.filter(row => !canary || row.objectId === canary)) {
    const row = rows.find(item => item.objectId === recipient.objectId);
    row.status = "in_progress";
    await save(reportFile, report);
    try {
      await identity(graph, recipient);
      const drive = await getDrive(graph, recipient, args.mode === "execute");
      for (const entry of inputs.files) {
        if (fs.existsSync(path.join(config.outDir, "stop.flag"))) throw new Error("Stopped by stop.flag; results retained.");
        let result;
        try {
          result = await ensureFile(graph, drive.id, entry, {
            execute: args.mode === "execute", probe: Boolean(canary && row.files.length === 0),
          });
        } catch (error) {
          row.files.push({ target: entry.target, status: "error", error: error.message });
          await save(reportFile, report);
          if (args.mode === "execute") throw error;
          continue;
        }
        row.files.push(result);
        await save(reportFile, report);
        if (result.status !== "verified" && args.mode === "execute") throw new Error(`${entry.target}: ${result.status}; existing content preserved.`);
      }
      row.status = row.files.every(file => file.status === "verified") ? "verified" : "blocked";
      console.log(`Recipient ${recipient.objectId}: ${row.status}, ${row.files.filter(file => file.status === "verified").length}/${inputs.files.length} files verified.`);
    } catch (error) {
      row.status = "blocked"; row.error = error.message;
      await save(reportFile, report);
      if (args.mode === "execute") throw error;
    }
    await save(reportFile, report);
  }
  if (canary && rows.find(row => row.objectId === canary).status === "verified") {
    await save(path.join(config.outDir, "canary.json"), { objectId: canary, inputsHash: inputs.inputsHash, status: "verified", at: new Date().toISOString() });
  }
  report.finishedAt = new Date().toISOString();
  await save(reportFile, report);
  if (!canary && rows.some(row => row.status !== "verified")) throw new Error("Verification incomplete; see the report for blocked and unattempted recipients.");
  console.log(`${canary ? "Canary" : "Full set"} verified. Existing differing files were not overwritten.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig(args.config);
  const inputs = loadInputs(config);
  if (args.mode === "check-plan") {
    loadPlan(config, inputs);
    console.log("Plan identity and payload fingerprints match.");
    return;
  }
  // One writer per output folder, including planning and permission preparation.
  await fs.promises.mkdir(config.outDir, { recursive: true, mode: 0o700 });
  const lock = path.join(config.outDir, "run.lock");
  const handle = await fs.promises.open(lock, "wx");
  try {
    await handle.writeFile(JSON.stringify({ pid: process.pid, mode: args.mode }));
    const plan = ["execute", "verify"].includes(args.mode) ? loadPlan(config, inputs) : null;
    const token = await createTokenProvider(config, args.mode === "bootstrap");
    if (args.mode === "bootstrap") { await token(); console.log("Administrator sign-in verified; no content changed."); return; }
    const graph = createGraph(token, config.sharePointOrigin);
    if (args.mode === "plan") await preparePlan(graph, config, inputs);
    else await run(graph, config, inputs, plan, args);
  } finally {
    await handle.close();
    await fs.promises.unlink(lock);
  }
}
module.exports = { parseArgs, identity, validateDrive, ensureFile, ensureParents, preparePlan, run };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
