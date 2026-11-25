"use strict";
// Dataverse operations used by rollout.cjs and heal-agents.cjs. Every function takes a client from dataverse.cjs.
const crypto = require("node:crypto");
const fs = require("node:fs");
const {
  BUILTIN_TABLES,
  MANUAL_TABLES,
  FALLBACK_TABLES,
  EXTRA_COLUMNS,
  RETRYABLE_IMPORT,
  sleep,
  iso,
  lower,
  chunk,
  isGuid,
  parseSync,
  provOf,
  isPublished,
  importIssues,
  typeLabel,
  ownerNameMismatch,
} = require("./core.cjs");

const FV = { Prefer: 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"' };
const fmt = (row, f) => (row && (row[`${f}@OData.Community.Display.V1.FormattedValue`] || row[f])) || null;
const q = (s) => String(s).replace(/'/g, "''");
const findSol = (sols, unique) => sols.find((s) => lower(s.uniquename) === lower(unique));
const STALE_IMPORT_MIN = 45;
const SYSADMIN = "System Administrator";

// --- solutions and components ------------------------------------------------------------------------------
async function readSolutions(c, uniques) {
  if (!uniques.length) return [];
  const filter = uniques.map((u) => `uniquename eq '${q(u)}'`).join(" or ");
  return c.list(`solutions?$select=solutionid,uniquename,version,ismanaged,installedon,modifiedon,_createdby_value&$filter=${filter}`, { headers: FV });
}

// objectid -> { solution, type } for every component of the given installed solutions.
async function readComponents(c, sols) {
  const comps = new Map();
  for (const s of sols) {
    for (const r of await c.list(`solutioncomponents?$select=objectid,componenttype&$filter=_solutionid_value eq ${s.solutionid}`)) {
      comps.set(lower(r.objectid), { solution: s.uniquename, type: r.componenttype });
    }
  }
  return comps;
}

// Component type numbers of 10000+ are allocated per environment, so they are resolved per origin.
const typeCache = new Map();
const entityCache = new Map();

function entityMeta(c, logical) {
  const key = `${c.origin}|${logical}`;
  if (!entityCache.has(key)) {
    entityCache.set(
      key,
      (async () => {
        let meta;
        try {
          const e = (await c.dv("GET", `EntityDefinitions(LogicalName='${q(logical)}')?$select=EntitySetName,PrimaryIdAttribute,PrimaryNameAttribute,OwnershipType`)).json;
          meta = { logical, set: e.EntitySetName, pk: e.PrimaryIdAttribute, label: e.PrimaryNameAttribute, ownership: e.OwnershipType, ownable: e.OwnershipType === "UserOwned" || e.OwnershipType === "TeamOwned" };
        } catch (err) {
          const f = FALLBACK_TABLES[logical];
          meta = f ? { logical, ...f, ownership: "UserOwned (assumed)", ownable: true } : { logical, ownable: false, ownership: `unknown: ${String(err.message).slice(0, 120)}` };
        }
        if (MANUAL_TABLES[logical]) meta = { ...meta, ownable: false, manual: MANUAL_TABLES[logical] };
        return meta;
      })()
    );
  }
  return entityCache.get(key);
}

async function resolveTypes(c, types) {
  const need = [...new Set(types)].filter((t) => !typeCache.has(`${c.origin}|${t}`));
  if (need.length) {
    const logicalByType = new Map(need.filter((t) => BUILTIN_TABLES[t]).map((t) => [t, BUILTIN_TABLES[t]]));
    for (const part of chunk(need.filter((t) => !logicalByType.has(t)), 25)) {
      try {
        const rows = await c.list(`solutioncomponentdefinitions?$select=solutioncomponenttype,primaryentityname&$filter=${part.map((t) => `solutioncomponenttype eq ${t}`).join(" or ")}`);
        for (const r of rows) if (r.primaryentityname) logicalByType.set(r.solutioncomponenttype, lower(r.primaryentityname));
      } catch {
        // Unknown types are reported as non-ownable below.
      }
    }
    for (const t of need) {
      const logical = logicalByType.get(t);
      typeCache.set(`${c.origin}|${t}`, logical ? entityMeta(c, logical).then((m) => ({ ...m, type: t })) : Promise.resolve({ type: t, logical: null, ownable: false }));
    }
  }
  const out = new Map();
  for (const t of new Set(types)) out.set(t, await typeCache.get(`${c.origin}|${t}`));
  return out;
}

// Reads every ownable (and manual-follow-up) component of the given solutions with owner and last modifier.
// Also picks up agent topics/knowledge that live under a solution agent but are not themselves in the solution
// (Copilot Studio creates some at provisioning), because assigning an agent does not cascade to its components.
async function readOwnables(c, comps, { botComponentsByParent = true } = {}) {
  const byType = new Map();
  for (const [id, x] of comps) {
    if (!byType.has(x.type)) byType.set(x.type, []);
    byType.get(x.type).push(id);
  }
  const metas = await resolveTypes(c, [...byType.keys()]);
  const byTable = new Map();
  const other = {};
  for (const [type, ids] of byType) {
    const meta = metas.get(type);
    if (!meta || !meta.set || !(meta.ownable || meta.manual)) {
      const k = typeLabel(type, meta) + (meta && meta.ownership ? ` (${meta.ownership})` : "");
      other[k] = (other[k] || 0) + ids.length;
      continue;
    }
    if (!byTable.has(meta.logical)) byTable.set(meta.logical, { meta, ids: [] });
    byTable.get(meta.logical).ids.push(...ids);
  }
  const items = [];
  const readRows = async (meta, filterFor, ids, solutionOf, via) => {
    const cols = [meta.pk, meta.label, "_ownerid_value", "_modifiedby_value", ...String(EXTRA_COLUMNS[meta.logical] || "").split(",")].filter(Boolean);
    const select = [...new Set(cols)].join(",");
    for (const part of chunk(ids, 30)) {
      for (const r of await c.list(`${meta.set}?$select=${select}&$filter=${part.map(filterFor).join(" or ")}`)) {
        const id = lower(r[meta.pk]);
        if (items.some((i) => i.id === id)) continue;
        items.push({ t: meta, id, name: (meta.label && r[meta.label]) || id, owner: lower(r._ownerid_value), modifiedBy: lower(r._modifiedby_value), solution: solutionOf(r), manual: meta.manual || null, via, row: r });
      }
    }
  };
  for (const { meta, ids } of byTable.values()) await readRows(meta, (x) => `${meta.pk} eq ${x}`, ids, (r) => comps.get(lower(r[meta.pk])).solution, "solution");
  if (botComponentsByParent) {
    const bots = items.filter((i) => i.t.logical === "bot");
    if (bots.length) {
      const meta = await entityMeta(c, "botcomponent");
      const solOf = new Map(bots.map((b) => [b.id, b.solution]));
      if (meta.set) await readRows(meta, (x) => `_parentbotid_value eq ${x}`, bots.map((b) => b.id), (r) => solOf.get(lower(r._parentbotid_value)), "agent");
    }
  }
  return { items, other };
}

// --- people ------------------------------------------------------------------------------------------------
async function rolesOf(c, userId) {
  const direct = (await c.list(`systemusers(${userId})/systemuserroles_association?$select=name`)).map((r) => r.name);
  if (direct.includes(SYSADMIN)) return direct;
  const teams = await c.list(`systemusers(${userId})/teammembership_association?$select=teamid&$expand=teamroles_association($select=name)`);
  return [...new Set([...direct, ...teams.flatMap((t) => (t.teamroles_association || []).map((r) => r.name))])];
}

// Finds the user who should own the components: a UPN, an Entra object id or a systemuserid.
async function findUser(c, who) {
  const s = String(who).trim();
  const select = "$select=systemuserid,fullname,domainname,isdisabled,accessmode,azureactivedirectoryobjectid";
  if (isGuid(s)) return c.list(`systemusers?${select}&$filter=azureactivedirectoryobjectid eq ${s} or systemuserid eq ${s}`);
  if (/^[^@\s]+@[^@\s]+$/.test(s)) return c.list(`systemusers?${select}&$filter=domainname eq '${q(s)}' or internalemailaddress eq '${q(s)}'`);
  throw new Error(`Owner "${s}" is neither a UPN nor a GUID.`);
}

// Owner precedence: per-environment value from the list > --owner/config.owner.upn > admin API usedBy/createdBy.
function ownerHint(env, cfg, cliOwner) {
  if (env.owner) return { value: env.owner, from: "environment list" };
  if (cliOwner) return { value: cliOwner, from: "--owner" };
  if (cfg.owner.upn) return { value: cfg.owner.upn, from: "config.owner.upn" };
  const src = cfg.owner.source;
  const id = src === "usedBy" ? env.usedBy && env.usedBy.id : src === "createdBy" ? env.createdBy && env.createdBy.id : null;
  return id ? { value: id, from: `admin API ${src}` } : null;
}

async function resolveOwner(c, env, cfg, cliOwner) {
  const out = { flags: [], warnings: [] };
  const hint = ownerHint(env, cfg, cliOwner);
  if (!hint) {
    out.flags.push("no-owner");
    return out;
  }
  out.hint = hint;
  const users = await findUser(c, hint.value);
  out.candidates = users.map((u) => ({ id: lower(u.systemuserid), fullname: u.fullname, upn: u.domainname, disabled: u.isdisabled }));
  if (!users.length) out.flags.push("owner-not-in-env");
  else if (users.length > 1) out.flags.push("owner-ambiguous");
  else {
    const u = users[0];
    out.user = { id: lower(u.systemuserid), fullname: u.fullname, upn: u.domainname, disabled: !!u.isdisabled, accessmode: u.accessmode };
    if (u.isdisabled) out.flags.push("owner-disabled");
    if (u.accessmode !== 0) out.warnings.push(`owner access mode ${fmt(u, "accessmode") || u.accessmode} (not read-write)`);
    const mismatch = ownerNameMismatch(cfg.owner.envNamePattern, env.displayName, u.fullname);
    if (mismatch) out.flags.push(`owner-name-mismatch: ${mismatch}`);
    out.user.roles = await rolesOf(c, out.user.id);
    if (!out.user.roles.length) out.warnings.push("owner has no security role (assignment may fail; the owner cannot use the components)");
  }
  return out;
}

// --- environment inspection --------------------------------------------------------------------------------
async function openImports(c, minutes = 6 * 60) {
  const since = new Date(Date.now() - minutes * 60000).toISOString();
  const jobs = await c.list(`importjobs?$select=solutionname,progress,startedon,completedon,createdon,_createdby_value&$filter=createdon gt ${since}&$orderby=createdon desc`, { headers: FV });
  const staleBefore = Date.now() - STALE_IMPORT_MIN * 60000;
  const open = jobs.filter((j) => !j.completedon);
  return {
    recent: jobs.map((j) => ({ solution: j.solutionname, progress: j.progress, startedon: j.startedon, completedon: j.completedon, by: fmt(j, "_createdby_value") })),
    running: open.filter((j) => Date.parse(j.createdon) > staleBefore).map((j) => j.solutionname),
    stale: open.filter((j) => Date.parse(j.createdon) <= staleBefore).map((j) => `${j.solutionname} (${j.createdon})`),
  };
}

async function inspect(env, c, cfg, packages, { cliOwner, allowPreparing = false } = {}) {
  const info = { flags: [], warnings: [] };
  if (env.dataverseState && env.dataverseState !== "Ready") {
    if (allowPreparing && env.dataverseState === "PreparingInstance") info.warnings.push(`dataverse-${env.dataverseState} (continuing)`);
    else info.flags.push(`dataverse-${env.dataverseState}`);
  }
  const who = (await c.dv("GET", "WhoAmI", { timeoutMs: 60000 })).json;
  info.callerId = lower(who.UserId);
  info.orgId = lower(who.OrganizationId);
  if (env.orgId && info.orgId !== lower(env.orgId)) throw new Error(`WhoAmI organization ${info.orgId} does not match the admin API (${env.orgId}).`);
  info.callerRoles = await rolesOf(c, info.callerId);
  if (!info.callerRoles.includes(SYSADMIN)) info.flags.push("caller-not-sysadmin");

  const owner = await resolveOwner(c, env, cfg, cliOwner);
  info.flags.push(...owner.flags);
  info.warnings.push(...owner.warnings);
  info.ownerHint = owner.hint;
  info.ownerCandidates = owner.candidates;
  info.owner = owner.user;

  const sols = await readSolutions(c, packages.map((p) => p.uniqueName));
  info.solutionRows = sols;
  info.solutions = {};
  for (const p of packages) {
    const s = findSol(sols, p.uniqueName);
    if (s) info.solutions[p.uniqueName] = { version: s.version, managed: s.ismanaged, installedon: s.installedon, modifiedon: s.modifiedon, createdBy: fmt(s, "_createdby_value") };
  }
  const jobs = await openImports(c);
  info.recentImports = jobs.recent;
  info.importRunning = jobs.running.length > 0;
  for (const s of jobs.stale) info.warnings.push(`stale open import job ignored: ${s}`);

  if (info.owner) {
    const [bots, flows] = await Promise.all([
      c.list(`bots?$select=botid&$filter=_createdby_value eq ${info.owner.id}`),
      c.list(`workflows?$select=workflowid&$filter=_createdby_value eq ${info.owner.id} and category eq 5`),
    ]);
    info.ownerActivity = { agentsCreated: bots.length, cloudFlowsCreated: flows.length };
    if (bots.length || flows.length) info.warnings.push(`owner already built ${bots.length} agent(s) and ${flows.length} workflow(s) here`);
  }
  return info;
}

// --- writes ------------------------------------------------------------------------------------------------
async function assign(c, item, userId) {
  try {
    await c.dv("POST", "Assign", {
      body: {
        Target: { "@odata.type": `Microsoft.Dynamics.CRM.${item.t.logical}`, [item.t.pk]: item.id },
        Assignee: { "@odata.type": "Microsoft.Dynamics.CRM.systemuser", systemuserid: userId },
      },
    });
    return "assign";
  } catch (e1) {
    try {
      await c.dv("PATCH", `${item.t.set}(${item.id})`, { body: { "ownerid@odata.bind": `/systemusers(${userId})` }, headers: { "If-Match": "*" } });
      return "patch";
    } catch (e2) {
      throw new Error(`Assign: ${String(e1.message).slice(0, 220)} | PATCH: ${String(e2.message).slice(0, 220)}`);
    }
  }
}

const base64Cache = new Map();
function base64Of(pkg) {
  if (!base64Cache.has(pkg.path)) {
    const buf = fs.readFileSync(pkg.path);
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (sha !== pkg.sha256) throw new Error(`${pkg.file} changed on disk since it was inspected; re-run.`);
    base64Cache.set(pkg.path, buf.toString("base64"));
  }
  return base64Cache.get(pkg.path);
}

async function importOnce(c, pkg, opts = {}) {
  const importJobId = crypto.randomUUID();
  const t0 = Date.now();
  const res = await c.dv("POST", "ImportSolutionAsync", {
    body: {
      CustomizationFile: base64Of(pkg),
      OverwriteUnmanagedCustomizations: !!opts.overwriteUnmanagedCustomizations,
      PublishWorkflows: opts.publishWorkflows !== false,
      ConvertToManaged: false,
      SkipProductUpdateDependencies: false,
      HoldingSolution: false,
      ImportJobId: importJobId,
    },
    timeoutMs: 300000,
    retries: 3,
  });
  const asyncId = res.json && res.json.AsyncOperationId;
  const jobKey = (res.json && res.json.ImportJobKey) || importJobId;
  if (!asyncId) throw new Error("ImportSolutionAsync returned no AsyncOperationId.");
  let op;
  while (Date.now() - t0 < 45 * 60000) {
    await sleep(8000);
    try {
      op = (await c.dv("GET", `asyncoperations(${asyncId})?$select=statecode,statuscode,message,friendlymessage`)).json;
    } catch {
      continue;
    }
    if (op.statecode === 3) break;
  }
  const out = { startedAt: new Date(t0).toISOString(), seconds: Math.round((Date.now() - t0) / 1000), asyncId, importJobId: jobKey };
  if (!op || op.statecode !== 3) return { ...out, ok: false, statuscode: op && op.statuscode, message: "import still running after 45 minutes" };
  out.statuscode = op.statuscode;
  out.ok = op.statuscode === 30;
  if (!out.ok) out.message = String(op.friendlymessage || op.message || "").slice(0, 800);
  try {
    out.issues = importIssues((await c.dv("GET", `importjobs(${jobKey})?$select=data`)).json.data);
  } catch (e) {
    out.issues = [`could not read import job: ${String(e.message).slice(0, 160)}`];
  }
  return out;
}

// The connector service throttles imports per identity; a throttled import rolls back cleanly, so back off and retry.
async function importPackage(c, pkg, opts = {}, onRetry = () => {}) {
  for (let attempt = 1; ; attempt++) {
    let r;
    try {
      r = await importOnce(c, pkg, opts);
    } catch (e) {
      r = { ok: false, startedAt: iso(), seconds: 0, message: `submit failed: ${String(e.message).slice(0, 600)}` };
    }
    if (r.ok || attempt >= 4 || !RETRYABLE_IMPORT.test(String(r.message || ""))) return { ...r, attempts: attempt };
    const waitMs = Math.round((60 + Math.random() * 120) * 1000 * attempt);
    onRetry(attempt, waitMs, r.message);
    await sleep(waitMs);
  }
}

async function publishAllXml(c) {
  const t0 = Date.now();
  await c.dv("POST", "PublishAllXml", { body: {}, timeoutMs: 600000, retries: 2 });
  return Math.round((Date.now() - t0) / 1000);
}

// Publishes an agent and waits for the publish operation to finish. 409 means another publish (often the automatic
// post-provisioning one) is running, so wait and try again.
async function publishBot(c, id, { skipIfPublished = false } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const before = (await c.dv("GET", `bots(${id})?$select=publishedon,synchronizationstatus`)).json;
    if (skipIfPublished && isPublished(before)) return { status: "already published", seconds: 0 };
    const prevEnd = parseSync(before.synchronizationstatus).lastFinishedPublishOperation?.operationEnd;
    const t0 = Date.now();
    try {
      await c.dv("POST", `bots(${id})/Microsoft.Dynamics.CRM.PvaPublish`, { body: {}, timeoutMs: 300000, retries: 3 });
    } catch (e) {
      if (attempt < 3 && (e.status === 409 || /Conflict/i.test(String(e.message)))) {
        await sleep(45000);
        continue;
      }
      throw e;
    }
    while (Date.now() - t0 < 20 * 60000) {
      await sleep(10000);
      let b;
      try {
        b = (await c.dv("GET", `bots(${id})?$select=publishedon,synchronizationstatus`)).json;
      } catch {
        continue;
      }
      const op = parseSync(b.synchronizationstatus).lastFinishedPublishOperation;
      if (op && op.operationEnd && op.operationEnd !== prevEnd) return { status: op.status, publishedon: b.publishedon, seconds: Math.round((Date.now() - t0) / 1000) };
    }
    return { status: "Timeout", seconds: Math.round((Date.now() - t0) / 1000) };
  }
  return { status: "gave up after publish conflicts", seconds: 0 };
}

// --- agents (heal) -----------------------------------------------------------------------------------------
// expected: Map(schemaLower -> package uniqueName). Only agents of installed solutions are reported.
async function agentsState(c, expected) {
  const uniques = [...new Set(expected.values())];
  const sols = await readSolutions(c, uniques);
  const present = new Set(sols.map((s) => lower(s.uniquename)));
  const schemas = [...expected.keys()];
  const rows = [];
  for (const part of chunk(schemas, 20)) {
    rows.push(...(await c.list(`bots?$select=botid,name,schemaname,publishedon,synchronizationstatus,_ownerid_value,_modifiedby_value&$filter=${part.map((s) => `schemaname eq '${q(s)}'`).join(" or ")}`)));
  }
  const agents = [];
  for (const [schema, unique] of expected) {
    if (!present.has(lower(unique))) continue;
    const row = rows.find((r) => lower(r.schemaname) === schema);
    const state = !row ? "missing" : provOf(row) !== "Provisioned" ? "stuck" : !isPublished(row) ? "unpublished" : "ok";
    agents.push({ schema, unique, state, row, id: row && lower(row.botid), name: row ? row.name : schema, prov: row ? provOf(row) : "absent", owner: row && lower(row._ownerid_value) });
  }
  return { sols, agents };
}

async function deleteBot(c, id) {
  await c.dv("POST", `bots(${id})/Microsoft.Dynamics.CRM.PvaDeleteBot`, { body: {}, timeoutMs: 300000 });
  for (let i = 0; i < 36; i++) {
    await sleep(5000);
    if (!(await c.list(`bots?$select=botid&$filter=botid eq ${id}`)).length) return true;
  }
  return false;
}

// Can Copilot Studio provision a brand-new agent in this environment right now? Creates and always deletes a probe.
async function probe(c, { prefix, minutes = 3, configuration, log = () => {} }) {
  const sfx = crypto.randomBytes(3).toString("hex");
  const body = {
    name: `ZZ Provisioning Probe ${sfx} (temporary)`,
    schemaname: `${prefix}${sfx}`,
    language: 1033,
    template: "default-2.1.0",
    runtimeprovider: 0,
    accesscontrolpolicy: 2,
    authenticationmode: 2,
    authenticationtrigger: 1,
    ...(configuration ? { configuration } : {}),
  };
  const r = await c.dv("POST", "bots", { body, headers: { Prefer: "return=representation" }, timeoutMs: 180000 });
  const id = (r.json && r.json.botid) || /bots\(([0-9a-f-]{36})\)/i.exec(r.headers.get("odata-entityid") || "")?.[1];
  if (!id) throw new Error("probe agent create returned no id");
  const t0 = Date.now();
  let prov = "unknown";
  let deleted = false;
  try {
    while (Date.now() - t0 < minutes * 60000) {
      await sleep(15000);
      try {
        prov = provOf((await c.dv("GET", `bots(${id})?$select=synchronizationstatus`)).json);
      } catch {
        continue;
      }
      if (prov === "Provisioned") break;
    }
  } finally {
    try {
      deleted = await deleteBot(c, id);
    } catch (e) {
      log(`probe agent ${id} delete failed: ${String(e.message).slice(0, 200)}`);
    }
  }
  return { result: prov, seconds: Math.round((Date.now() - t0) / 1000), probeDeleted: deleted, probeId: id };
}

async function waitProvisioned(c, expected, schemas, minutes) {
  const t0 = Date.now();
  let st;
  while (Date.now() - t0 < minutes * 60000) {
    await sleep(15000);
    try {
      st = await agentsState(c, expected);
    } catch {
      continue;
    }
    const mine = st.agents.filter((a) => schemas.includes(a.schema));
    if (mine.length === schemas.length && mine.every((a) => a.prov === "Provisioned")) break;
  }
  return { st, seconds: Math.round((Date.now() - t0) / 1000) };
}

// Ownable components of one installed solution (plus agent children), for reassign and "did the owner edit it?".
async function solutionItems(c, unique, opts) {
  const sols = await readSolutions(c, [unique]);
  if (!sols.length) return null;
  return readOwnables(c, await readComponents(c, sols), opts);
}

async function reassignItems(c, items, userId) {
  let moved = 0;
  const failed = [];
  for (const it of items.filter((i) => !i.manual && i.owner !== userId)) {
    try {
      await assign(c, it, userId);
      moved++;
    } catch (e) {
      failed.push(`${it.t.logical}:${it.name}: ${String(e.message).slice(0, 200)}`);
    }
  }
  return { moved, failed };
}

// --- reporting ---------------------------------------------------------------------------------------------
function describe(items, other, userId) {
  return {
    counts: items.reduce((m, i) => ((m[i.t.logical] = (m[i.t.logical] || 0) + 1), m), {}),
    otherComponentTypes: other,
    notOwned: items.filter((i) => !i.manual && i.owner !== userId).map((i) => `${i.t.logical}:${i.name}`),
    manual: items.filter((i) => i.manual).map((i) => ({ component: `${i.t.logical}:${i.name}`, why: i.manual, ownedByTarget: i.owner === userId })),
    bots: items
      .filter((i) => i.t.logical === "bot")
      .map((b) => {
        const s = parseSync(b.row.synchronizationstatus);
        return { name: b.name, solution: b.solution, publishedon: b.row.publishedon, lastPublish: s.lastFinishedPublishOperation?.status, syncState: s.currentSynchronizationState?.state, provisioning: s.currentSynchronizationState?.provisioningStatus };
      }),
    flows: items.filter((i) => i.t.logical === "workflow").map((w) => ({ name: w.name, solution: w.solution, statecode: w.row.statecode, category: w.row.category })),
    connectionReferences: items
      .filter((i) => i.t.logical === "connectionreference")
      .map((r) => ({ name: r.name, solution: r.solution, connector: String(r.row.connectorid || "").split("/").pop(), bound: !!r.row.connectionid })),
  };
}

async function snapshot(c, packages, userId, opts) {
  const sols = await readSolutions(c, packages.map((p) => p.uniqueName));
  const { items, other } = await readOwnables(c, await readComponents(c, sols), opts);
  return {
    at: iso(),
    solutions: Object.fromEntries(
      packages.map((p) => {
        const s = findSol(sols, p.uniqueName);
        return [p.uniqueName, s ? { version: s.version, managed: s.ismanaged } : null];
      })
    ),
    ...describe(items, other, userId),
  };
}

module.exports = {
  FV,
  STALE_IMPORT_MIN,
  findSol,
  readSolutions,
  readComponents,
  resolveTypes,
  readOwnables,
  rolesOf,
  findUser,
  ownerHint,
  resolveOwner,
  openImports,
  inspect,
  assign,
  importPackage,
  publishAllXml,
  publishBot,
  agentsState,
  deleteBot,
  probe,
  waitProvisioned,
  solutionItems,
  reassignItems,
  describe,
  snapshot,
};
