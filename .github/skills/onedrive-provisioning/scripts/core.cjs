"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const GUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function outsideRepository(file) {
  let existing = path.resolve(file);
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  for (let dir = fs.realpathSync(existing); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) throw new Error("Keep config, recipient lists and results outside repositories.");
    if (path.dirname(dir) === dir) break;
  }
}

function origin(value, suffix) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.port || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      !new RegExp(`^[a-z0-9-]+-${suffix}\\.sharepoint\\.com$`, "i").test(url.hostname)) {
    throw new Error(`Expected a commercial SharePoint ${suffix} origin.`);
  }
  return url.origin;
}

function loadConfig(file) {
  outsideRepository(file);
  const config = readJson(file);
  const base = path.dirname(path.resolve(file));
  for (const key of ["tenantId", "clientId"]) {
    if (!GUID.test(config[key]) || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(config[key])) {
      throw new Error(`${key} must identify the explicitly selected tenant or approved client.`);
    }
    config[key] = config[key].toLowerCase();
  }
  if (!/^[^@\s]+@[^@\s]+$/.test(config.adminUpn)) throw new Error("adminUpn is required.");
  config.adminUpn = config.adminUpn.toLowerCase();
  config.sharePointOrigin = origin(config.sharePointOrigin, "my");
  config.sharePointAdminOrigin = origin(config.sharePointAdminOrigin, "admin");
  if (config.sharePointOrigin.replace("-my.", "-admin.") !== config.sharePointAdminOrigin) {
    throw new Error("SharePoint personal and admin origins must belong to the same tenant hostname.");
  }
  for (const key of ["recipients", "manifest", "payloadRoot", "outDir"]) {
    if (typeof config[key] !== "string" || !config[key]) throw new Error(`${key} is required.`);
    config[key] = path.resolve(base, config[key]);
  }
  outsideRepository(config.recipients);
  outsideRepository(config.outDir);
  return config;
}

function validateRecipients(rows, sharePointOrigin) {
  if (!Array.isArray(rows) || !rows.length) throw new Error("At least one recipient is required.");
  const ids = new Set(), upns = new Set(), sites = new Set();
  return rows.map(row => {
    if (!GUID.test(row.objectId) || !/^[^@\s]+@[^@\s]+$/.test(row.upn)) throw new Error("Invalid recipient identity.");
    const objectId = row.objectId.toLowerCase(), upn = row.upn.toLowerCase();
    const site = new URL(row.siteUrl);
    if (site.origin !== sharePointOrigin || !/^\/personal\/[a-z0-9_-]+\/?$/i.test(site.pathname) ||
        site.search || site.hash || site.username || site.password) throw new Error("Invalid recipient personal site URL.");
    const siteUrl = site.href.replace(/\/$/, "");
    if (ids.has(objectId) || upns.has(upn) || sites.has(siteUrl.toLowerCase())) throw new Error("Duplicate recipient, object ID or personal site.");
    ids.add(objectId); upns.add(upn); sites.add(siteUrl.toLowerCase());
    return { objectId, upn, siteUrl };
  });
}

function remotePath(value) {
  if (typeof value !== "string" || !value || value.split("/").some(part =>
    !part || part === "." || part === ".." || /[\\:*?"<>|%\x00-\x1f]/.test(part) || /[. ]$/.test(part))) {
    throw new Error("Invalid manifest target path.");
  }
  return value;
}
const encodePath = value => remotePath(value).split("/").map(encodeURIComponent).join("/");

function buildFiles(manifest, payloadRoot) {
  if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error("Manifest must list files.");
  const root = fs.realpathSync(payloadRoot), seen = new Set();
  return manifest.files.map(entry => {
    const target = remotePath(entry.target);
    if (seen.has(target.toLowerCase())) throw new Error("Duplicate manifest target.");
    seen.add(target.toLowerCase());
    if (typeof entry.source !== "string" || path.isAbsolute(entry.source)) throw new Error("Manifest sources must be relative to payloadRoot.");
    const local = fs.realpathSync(path.resolve(root, entry.source));
    const relative = path.relative(root, local);
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("Payload source escapes payloadRoot.");
    }
    const stat = fs.statSync(local);
    // Keep verification in memory bounded; large-file upload sessions are deliberately out of scope.
    if (!stat.isFile() || stat.size > 10 * 1024 * 1024) throw new Error("Payload must be a file no larger than 10 MiB.");
    return { source: entry.source, target, local, size: stat.size, sha256: sha256(fs.readFileSync(local)) };
  });
}

function loadInputs(config) {
  const recipients = validateRecipients(readJson(config.recipients), config.sharePointOrigin);
  const files = buildFiles(readJson(config.manifest), config.payloadRoot);
  const inputsHash = sha256(JSON.stringify({ config, recipients, files }));
  return { recipients, files, inputsHash };
}

function loadPlan(config, inputs) {
  const plan = readJson(path.join(config.outDir, "plan.json"));
  if (plan.inputsHash !== inputs.inputsHash || plan.tenantId !== config.tenantId ||
      JSON.stringify(plan.recipients.map(({ objectId, upn, siteUrl }) => ({ objectId, upn, siteUrl }))) !== JSON.stringify(inputs.recipients) ||
      plan.recipients.some(row => row.identityVerified !== true)) {
    throw new Error("Plan is unverified or inputs changed; create a new reviewed plan in a new outDir.");
  }
  return plan;
}

async function save(file, value) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  for (let attempt = 0; ; attempt++) {
    try { await fs.promises.rename(tmp, file); return; }
    catch (error) {
      if (!["EPERM", "EACCES", "EBUSY"].includes(error.code) || attempt >= 7) throw error;
      await sleep(250 * (attempt + 1));
    }
  }
}

function retryDelay(header, attempt) {
  const seconds = Number(header);
  const requested = header ? (Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now()) : 0;
  return Math.max(Number.isFinite(requested) ? requested : 0, 1000 * 2 ** attempt);
}

module.exports = { sha256, readJson, sleep, loadConfig, validateRecipients, remotePath, encodePath, buildFiles, loadInputs, loadPlan, save, retryDelay };
