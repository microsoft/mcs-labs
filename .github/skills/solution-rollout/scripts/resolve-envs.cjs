"use strict";
// Read-only. Resolves the environment list (ids or Dataverse URLs, optional per-environment owner) to Dataverse URLs,
// names, org ids and the admin API "usedBy"/"createdBy" users, and writes <outDir>/envs-resolved.json.
// Uses the administrator's cached sign-in (auth.cjs --bootstrap) for the Power Platform admin API; never prints tokens.
//
//   node scripts/resolve-envs.cjs --config <config.json> [--envs <file>] [--name "<display-name regex>"]
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs, parseEnvList, loadConfig, writeJson, tally, lower, iso } = require("./lib/core.cjs");
const { createAuth, ADMIN_API } = require("./lib/dataverse.cjs");

function checkClaims(token, adminUpn, tenantId) {
  const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  const who = lower(claims.upn || claims.unique_name || claims.preferred_username);
  if (who !== lower(adminUpn) || lower(claims.tid) !== lower(tenantId)) {
    throw new Error(`Admin API token is for ${who} in tenant ${claims.tid}, not ${adminUpn} in ${tenantId}. Run: node scripts/auth.cjs --config <config> --bootstrap`);
  }
  return who;
}

async function listAdminEnvs(token) {
  let url = `${ADMIN_API}/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments?api-version=2021-04-01`;
  const all = [];
  while (url) {
    const res = await fetch(url, { headers: { Authorization: "Bearer " + token, Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(120000) });
    const text = await res.text();
    if (!res.ok) throw new Error(`Admin API HTTP ${res.status}: ${text.slice(0, 400)}`);
    const j = JSON.parse(text);
    all.push(...(j.value || []));
    url = j.nextLink;
    if (url) {
      const u = new URL(url);
      const okHost = u.hostname === "api.bap.microsoft.com" || u.hostname.endsWith(".api.bap.microsoft.com");
      if (u.protocol !== "https:" || !okHost || (u.port && u.port !== "443")) throw new Error(`Unexpected nextLink origin: ${u.origin}`);
    }
  }
  return all;
}

function pickEnv(e) {
  const p = e.properties || {};
  const md = p.linkedEnvironmentMetadata || {};
  return {
    id: lower(e.name),
    displayName: p.displayName,
    instanceUrl: md.instanceUrl ? new URL(md.instanceUrl).origin.toLowerCase() : null,
    domainName: md.domainName,
    orgId: md.resourceId ? lower(md.resourceId) : null,
    dataverseState: md.instanceState,
    provisioningState: p.provisioningState,
    sku: p.environmentSku,
    location: e.location,
    createdBy: p.createdBy ? { id: lower(p.createdBy.id), name: p.createdBy.displayName, upn: p.createdBy.userPrincipalName, type: p.createdBy.type } : null,
    usedBy: p.usedBy ? { id: lower(p.usedBy.id), type: p.usedBy.type, tenantId: lower(p.usedBy.tenantId) } : null,
    createdTime: p.createdTime,
    adminMode: p.states?.runtime?.id,
  };
}

// URL entries are used as-is (no admin API data, so they need an owner); GUID entries are looked up.
function resolveList(requested, adminEnvs) {
  const byId = new Map(adminEnvs.map((e) => [lower(e.name), e]));
  const byUrl = new Map(adminEnvs.map(pickEnv).filter((e) => e.instanceUrl).map((e) => [e.instanceUrl, e]));
  const resolved = [];
  const missing = [];
  for (const r of requested) {
    if (r.id) {
      const e = byId.get(r.id);
      if (!e) missing.push(r.id);
      else resolved.push({ ...pickEnv(e), ...(r.owner ? { owner: r.owner } : {}) });
    } else {
      const e = byUrl.get(r.url);
      resolved.push({ ...(e || { id: null, displayName: new URL(r.url).hostname, instanceUrl: r.url }), ...(r.owner ? { owner: r.owner } : {}) });
    }
  }
  return { resolved, missing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.get("config")) throw new Error("Usage: node scripts/resolve-envs.cjs --config <config.json> [--envs <file>] [--name <regex>]");
  const cfg = loadConfig(args.get("config"), { inspect: false });
  const nameRe = args.get("name") ? new RegExp(args.get("name"), "i") : null;
  const listFile = args.get("envs") ? path.resolve(args.get("envs")) : cfg.environments;
  let requested = [];
  if (listFile) {
    const { envs, invalid } = parseEnvList(fs.readFileSync(listFile, "utf8"));
    if (invalid.length) throw new Error(`Unrecognised lines in ${listFile}:\n  ${invalid.join("\n  ")}`);
    requested = envs;
    console.log(`environment list: ${envs.length} unique entries from ${listFile}`);
  } else if (!nameRe) {
    throw new Error("No environment list: set config.environments, pass --envs <file>, or select by name with --name <regex>.");
  }

  const needAdmin = nameRe || requested.some((r) => r.id) || cfg.owner.source !== "none";
  let adminEnvs = [];
  if (needAdmin) {
    const token = await createAuth(cfg).adminToken();
    console.log(`admin token identity verified: ${checkClaims(token, cfg.adminUpn, cfg.tenantId)}`);
    adminEnvs = await listAdminEnvs(token);
    console.log(`environments visible to the admin API: ${adminEnvs.length}`);
  }
  if (nameRe) {
    const seen = new Set(requested.map((r) => r.id).filter(Boolean));
    const add = adminEnvs.filter((e) => nameRe.test(e.properties?.displayName || "") && !seen.has(lower(e.name))).map((e) => ({ id: lower(e.name) }));
    console.log(`selected by name ${nameRe}: ${add.length}`);
    requested.push(...add);
  }
  const { resolved, missing } = resolveList(requested, adminEnvs);
  const out = path.join(cfg.outDir, "envs-resolved.json");
  writeJson(out, { resolvedAt: iso(), tenantId: cfg.tenantId, resolved, missing });

  console.log(`resolved=${resolved.length} missing=${missing.length}${missing.length ? " -> " + missing.join(", ") : ""}`);
  const noUrl = resolved.filter((r) => !r.instanceUrl);
  if (noUrl.length) console.log(`no Dataverse (cannot deploy): ${noUrl.map((r) => `${r.id} ${r.displayName}`).join(", ")}`);
  console.log(`dataverseState: ${JSON.stringify(tally(resolved.map((r) => r.dataverseState || "?")))}`);
  console.log(`sku: ${JSON.stringify(tally(resolved.map((r) => r.sku || "?")))}`);
  const ownerOf = (r) => (r.owner ? "list" : cfg.owner.upn ? "config" : cfg.owner.source === "none" ? null : r[cfg.owner.source]?.id);
  const noOwner = resolved.filter((r) => !ownerOf(r));
  if (noOwner.length) console.log(`no owner (will be flagged; add ",<upn>" in the list or set owner.upn): ${noOwner.map((r) => r.id || r.instanceUrl).join(", ")}`);
  const foreign = resolved.filter((r) => !r.owner && cfg.owner.source === "usedBy" && r.usedBy && r.usedBy.tenantId && r.usedBy.tenantId !== cfg.tenantId);
  if (foreign.length) console.log(`usedBy in another tenant: ${foreign.map((r) => r.id).join(", ")}`);
  const shared = Object.entries(tally(resolved.map(ownerOf).filter(Boolean))).filter(([, n]) => n > 1);
  if (shared.length && !cfg.owner.upn) console.log(`same owner on several environments: ${JSON.stringify(shared)}`);
  if (cfg.owner.envNamePattern) {
    const re = new RegExp(cfg.owner.envNamePattern, "i");
    const odd = resolved.filter((r) => !re.test(r.displayName || ""));
    if (odd.length) console.log(`names not matching owner.envNamePattern:\n  ${odd.map((r) => `${r.id} | ${r.displayName}`).join("\n  ")}`);
  }
  console.log(`saved ${out}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(String(e.message || e).slice(0, 1200));
    process.exit(1);
  });
}

module.exports = { checkClaims, listAdminEnvs, pickEnv, resolveList };
