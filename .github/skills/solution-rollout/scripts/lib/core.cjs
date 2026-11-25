"use strict";
// Pure helpers shared by the rollout scripts. No network access here so everything is unit-testable.
const fs = require("node:fs");
const path = require("node:path");
const { inspectPackage } = require("./zip.cjs");

const DEFAULT_CLIENT_ID = "51f81489-12ee-4a9e-aaae-a2591f45987d";
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isGuid = (s) => GUID.test(String(s || "").trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = () => new Date().toISOString();
const tally = (arr) => arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {});
const lower = (s) => String(s || "").toLowerCase();
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

function cmpVer(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  if ([...pa, ...pb].some((n) => !Number.isInteger(n) || n < 0)) throw new Error(`Invalid version: ${a} vs ${b}`);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

function parseSync(s) {
  try {
    return s ? (typeof s === "string" ? JSON.parse(s) : s) : {};
  } catch {
    return {};
  }
}
const provOf = (row) => parseSync(row && row.synchronizationstatus).currentSynchronizationState?.provisioningStatus || "unknown";
function isPublished(row) {
  const op = parseSync(row && row.synchronizationstatus).lastFinishedPublishOperation;
  return !!(row && row.publishedon) && (!op || !op.status || op.status === "Succeeded");
}

// What to do with one package in one environment, given the installed solution row (or undefined).
function planFor(pkg, installed, { allowUpgrade = false } = {}) {
  if (!installed) return { action: "import" };
  const have = installed.version;
  if (!!installed.ismanaged !== !!pkg.managed) {
    return { action: "blocked-managed-mismatch", installed: have, reason: `installed is ${installed.ismanaged ? "managed" : "unmanaged"}, package is ${pkg.managed ? "managed" : "unmanaged"}` };
  }
  const c = cmpVer(pkg.version, have);
  if (c === 0) return { action: "present", installed: have };
  if (c < 0) return { action: "newer-present", installed: have };
  return allowUpgrade ? { action: "upgrade", installed: have } : { action: "blocked-upgrade", installed: have, reason: "older version installed; pass --allow-upgrade to upgrade it" };
}
const willImport = (plan) => plan.action === "import" || plan.action === "upgrade";

// Component-level problems from importjob.data (the import can "succeed" with failed components).
function importIssues(xml) {
  const out = new Map();
  for (const m of String(xml || "").matchAll(/<(\w+)\s[^>]*?\bresult="([^"]+)"[^>]*>/gi)) {
    const [whole, el, result] = m;
    if (/^importexportxml$/i.test(el) || /^success$/i.test(result)) continue;
    const code = /\berrorcode="([^"]*)"/i.exec(whole)?.[1] || "";
    const text = (/\berrortext="([^"]*)"/i.exec(whole)?.[1] || "").slice(0, 240);
    const key = `${el} ${result}${code ? ` ${code}` : ""}${text ? `: ${text}` : ""}`;
    out.set(key, (out.get(key) || 0) + 1);
  }
  return [...out].map(([k, n]) => (n > 1 ? `${k} (x${n})` : k));
}

const RETRYABLE_IMPORT = /TooManyConcurrentRequests|exceeded limit|Connector import: FAILURE|A task was canceled|another \[?Import|Cannot start the requested operation/i;

// Why an agent from a solution we imported still needs a publish, or null if it does not.
function publishReason(row, importStartedAt) {
  if (!importStartedAt) return null;
  if (!row.publishedon) return "never published";
  const op = parseSync(row.synchronizationstatus).lastFinishedPublishOperation;
  if (op && op.status && op.status !== "Succeeded") return `last publish ${op.status}`;
  const last = Date.parse((op && op.operationStart) || row.publishedon);
  if (Number.isFinite(last) && last < Date.parse(importStartedAt) - 2 * 60000) return "published before this import";
  return null;
}

async function pool(items, n, fn) {
  let next = 0;
  const out = new Array(items.length);
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(n, items.length)) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

// --- arguments -------------------------------------------------------------------------------------------
function parseArgs(argv) {
  const flags = new Set();
  const values = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`Unexpected argument: ${a}`);
    const eq = a.indexOf("=");
    if (eq > 0) {
      values[a.slice(2, eq)] = a.slice(eq + 1);
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
      values[a.slice(2)] = argv[++i];
    } else {
      flags.add(a.slice(2));
    }
  }
  return {
    has: (n) => flags.has(n) || n in values,
    get: (n, d) => (n in values ? values[n] : d),
    num: (n, d) => {
      if (!(n in values)) return d;
      const v = Number(values[n]);
      if (!Number.isFinite(v) || v < 0) throw new Error(`--${n} must be a non-negative number`);
      return v;
    },
    list: (n) => (n in values ? values[n].split(",").map((s) => s.trim()).filter(Boolean) : []),
  };
}

// --- environment list --------------------------------------------------------------------------------------
// One environment per line: "<envId|https://org.crm.dynamics.com>" optionally followed by ",<owner>" where owner is a
// UPN, an Entra object id or a systemuserid. Blank lines, "#" comments and Markdown table pipes are ignored, so a pasted
// table works. GUID entries are resolved through the Power Platform admin API; URL entries skip it and need an owner.
function parseEnvList(text) {
  const out = [];
  const seen = new Set();
  const bad = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").replace(/\|/g, " ").trim();
    if (!line || /^[-:]+$/.test(line.replace(/\s/g, ""))) continue;
    const [first, owner] = line.split(/[,;\t ]+/).filter(Boolean);
    let entry;
    if (isGuid(first)) {
      entry = { id: first.toLowerCase() };
    } else if (/^https:\/\//i.test(first)) {
      try {
        entry = { url: new URL(first).origin.toLowerCase() };
      } catch {
        entry = null;
      }
    }
    if (!entry) {
      bad.push(raw.trim());
      continue;
    }
    const key = entry.id || entry.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(owner ? { ...entry, owner } : entry);
  }
  return { envs: out, invalid: bad };
}

// --- configuration -----------------------------------------------------------------------------------------
function loadConfig(file, { inspect = true } = {}) {
  const abs = path.resolve(file);
  const dir = path.dirname(abs);
  const raw = JSON.parse(fs.readFileSync(abs, "utf8"));
  const rel = (p) => (p ? path.resolve(dir, p) : p);
  if (!isGuid(raw.tenantId)) throw new Error("config.tenantId must be the tenant GUID.");
  if (!/^[^@\s]+@[^@\s]+$/.test(raw.adminUpn || "")) throw new Error("config.adminUpn must be the administrator UPN.");
  if (!Array.isArray(raw.packages) || !raw.packages.length) throw new Error("config.packages must list at least one solution .zip.");
  const cfg = {
    file: abs,
    tenantId: raw.tenantId.toLowerCase(),
    adminUpn: raw.adminUpn.toLowerCase(),
    clientId: raw.clientId || DEFAULT_CLIENT_ID,
    bootstrapOrigin: raw.bootstrapOrigin,
    environments: rel(raw.environments),
    outDir: rel(raw.outDir || "out"),
    owner: { source: "usedBy", upn: null, envNamePattern: null, ...(raw.owner || {}) },
    import: { overwriteUnmanagedCustomizations: false, publishWorkflows: true, publishCustomizations: "auto", ...(raw.import || {}) },
    publish: raw.publish || "imported",
    assign: { botComponentsByParent: true, ...(raw.assign || {}) },
    heal: { probePrefix: null, ...(raw.heal || {}) },
    packages: raw.packages.map((p) => (typeof p === "string" ? { path: p } : p)).map((p) => ({ ...p, path: rel(p.path) })),
  };
  if (!["imported", "all", "none"].includes(cfg.publish)) throw new Error('config.publish must be "imported", "all" or "none".');
  if (!["auto", "always", "never"].includes(cfg.import.publishCustomizations)) throw new Error('config.import.publishCustomizations must be "auto", "always" or "never".');
  if (!["usedBy", "createdBy", "none"].includes(cfg.owner.source)) throw new Error('config.owner.source must be "usedBy", "createdBy" or "none".');
  if (cfg.owner.envNamePattern) new RegExp(cfg.owner.envNamePattern, "i");
  if (inspect) cfg.packages = cfg.packages.map(loadPackage);
  const names = cfg.packages.map((p) => lower(p.uniqueName)).filter(Boolean);
  const dup = names.find((n, i) => names.indexOf(n) !== i);
  if (dup) throw new Error(`Two packages carry the same solution (${dup}); keep one version per solution.`);
  return cfg;
}

function loadPackage(p) {
  if (!fs.existsSync(p.path)) throw new Error(`Package not found: ${p.path}`);
  const info = inspectPackage(p.path);
  if (p.sha256 && lower(p.sha256) !== info.sha256) throw new Error(`sha256 mismatch for ${info.file}`);
  return { ...info, expectedSha256: p.sha256 || null };
}

// Optional sanity check that the environment's display name names the owner, e.g. "^DEV - (.+)$" vs fullname.
function ownerNameMismatch(pattern, displayName, fullname) {
  if (!pattern) return null;
  const m = new RegExp(pattern, "i").exec(displayName || "");
  if (!m) return `environment name "${displayName}" does not match ${pattern}`;
  const want = (m[1] || "").trim().toLowerCase();
  return want && want !== lower(fullname).trim() ? `environment names "${m[1]}" but the owner is "${fullname}"` : null;
}

// --- solution component types ------------------------------------------------------------------------------
// Classic component types are not in solutioncomponentdefinitions; map the ownable ones explicitly.
// Canvas apps are owned through the Power Apps service, so they are reported for manual follow-up.
const CLASSIC_TYPES = {
  1: "Entity",
  2: "Attribute",
  3: "Relationship",
  9: "OptionSet",
  10: "EntityRelationship",
  14: "EntityKey",
  20: "Role",
  26: "SavedQuery (view)",
  29: "Workflow",
  31: "Report",
  36: "EmailTemplate",
  59: "Chart",
  60: "SystemForm",
  61: "WebResource",
  62: "SiteMap",
  65: "HierarchyRule",
  66: "CustomControl",
  80: "AppModule",
  90: "PluginType",
  91: "PluginAssembly",
  92: "SdkMessageProcessingStep",
  95: "ServiceEndpoint",
  300: "CanvasApp",
  371: "Connector",
  372: "Connector",
};
const BUILTIN_TABLES = {
  29: "workflow",
  371: "connector",
  372: "connector",
  300: "canvasapp",
};
const MANUAL_TABLES = { canvasapp: "canvas app owner is set in Power Apps (Share > change owner or the admin API), not by Dataverse Assign" };
// Proven during the lab rollout; used when table metadata cannot be read.
const FALLBACK_TABLES = {
  bot: { set: "bots", pk: "botid", label: "name" },
  botcomponent: { set: "botcomponents", pk: "botcomponentid", label: "name" },
  connectionreference: { set: "connectionreferences", pk: "connectionreferenceid", label: "connectionreferencedisplayname" },
  connector: { set: "connectors", pk: "connectorid", label: "name" },
  workflow: { set: "workflows", pk: "workflowid", label: "name" },
  environmentvariabledefinition: { set: "environmentvariabledefinitions", pk: "environmentvariabledefinitionid", label: "schemaname" },
};
const EXTRA_COLUMNS = {
  bot: "schemaname,publishedon,synchronizationstatus,statecode,statuscode",
  botcomponent: "_parentbotid_value",
  connectionreference: "connectorid,connectionid,connectionreferencelogicalname",
  connector: "displayname",
  workflow: "statecode,category",
};
const typeLabel = (type, meta) => (meta && meta.logical ? meta.logical : CLASSIC_TYPES[type] || `type ${type}`);

// Overall result for one environment after deploy.
function finalStatus(res, packages, publishMode) {
  const f = res.final;
  if (!f || res.errors.length || f.notOwned.length) return "error";
  if (publishMode !== "none") {
    const ours = new Set((publishMode === "all" ? packages.map((p) => p.uniqueName) : Object.keys(res.importedByUs || {})).map(lower));
    if (f.bots.some((b) => ours.has(lower(b.solution)) && (!b.publishedon || (b.lastPublish && b.lastPublish !== "Succeeded")))) return "error";
  }
  const behind = packages.filter((p) => !f.solutions[p.uniqueName] || cmpVer(f.solutions[p.uniqueName].version, p.version) < 0);
  return behind.length ? "partial" : "done";
}

function safeName(s) {
  return String(s).replace(/[^a-z0-9._-]+/gi, "_").slice(0, 120);
}

// Results can contain user names and ids, so files are written owner-only.
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (fallback !== undefined && e.code === "ENOENT") return fallback;
    throw e;
  }
}

module.exports = {
  DEFAULT_CLIENT_ID,
  CLASSIC_TYPES,
  BUILTIN_TABLES,
  MANUAL_TABLES,
  FALLBACK_TABLES,
  EXTRA_COLUMNS,
  RETRYABLE_IMPORT,
  isGuid,
  sleep,
  iso,
  tally,
  lower,
  chunk,
  cmpVer,
  parseSync,
  provOf,
  isPublished,
  planFor,
  willImport,
  importIssues,
  publishReason,
  pool,
  parseArgs,
  parseEnvList,
  loadConfig,
  loadPackage,
  ownerNameMismatch,
  typeLabel,
  finalStatus,
  safeName,
  writeJson,
  readJson,
};
