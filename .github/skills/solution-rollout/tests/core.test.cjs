"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const core = require("../scripts/lib/core.cjs");
const { normalizeOrigin, buildUrl, cacheKey, API_PATH } = require("../scripts/lib/dataverse.cjs");
const { resolveList, pickEnv } = require("../scripts/resolve-envs.cjs");
const { loadEnvs, envKey } = require("../scripts/lib/runner.cjs");
const { labZip } = require("./helpers.cjs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rollout-core-"));
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
const TENANT = "11111111-2222-3333-4444-555555555555";

test("cmpVer compares segment-wise, not lexically", () => {
  assert.equal(core.cmpVer("1.0.0.10", "1.0.0.9"), 1);
  assert.equal(core.cmpVer("1.0.0.9", "1.0.0.10"), -1);
  assert.equal(core.cmpVer("1.0", "1.0.0.0"), 0);
  assert.throws(() => core.cmpVer("1.a", "1.0"), /Invalid version/);
});

test("planFor covers every action", () => {
  const pkg = { version: "1.0.0.9", managed: false };
  assert.equal(core.planFor(pkg, undefined).action, "import");
  assert.equal(core.planFor(pkg, { version: "1.0.0.9", ismanaged: true }).action, "blocked-managed-mismatch");
  assert.equal(core.planFor(pkg, { version: "1.0.0.9", ismanaged: false }).action, "present");
  assert.equal(core.planFor(pkg, { version: "1.0.0.10", ismanaged: false }).action, "newer-present");
  const older = core.planFor(pkg, { version: "1.0.0.8", ismanaged: false });
  assert.equal(older.action, "blocked-upgrade");
  assert.match(older.reason, /--allow-upgrade/);
  assert.deepEqual(core.planFor(pkg, { version: "1.0.0.8", ismanaged: false }, { allowUpgrade: true }), { action: "upgrade", installed: "1.0.0.8" });
  assert.ok(core.willImport({ action: "import" }) && core.willImport({ action: "upgrade" }) && !core.willImport({ action: "present" }));
});

test("importIssues summarises failed components from importjob.data", () => {
  const xml = `<importexportxml result="success"><entity name="a" result="failure" errorcode="0x80" errortext="boom" /><entity name="b" result="failure" errorcode="0x80" errortext="boom"/><workflow result="success"/><bot result="warning"/></importexportxml>`;
  assert.deepEqual(core.importIssues(xml), ["entity failure 0x80: boom (x2)", "bot warning"]);
  assert.deepEqual(core.importIssues(""), []);
});

test("RETRYABLE_IMPORT matches throttling but not real failures", () => {
  assert.ok(core.RETRYABLE_IMPORT.test("Connector import: FAILURE TooManyConcurrentRequests"));
  assert.ok(core.RETRYABLE_IMPORT.test("Cannot start the requested operation [Import] because there is another [Import] running"));
  assert.ok(!core.RETRYABLE_IMPORT.test("Missing dependency: table account"));
});

test("provOf, isPublished and publishReason read synchronizationstatus", () => {
  const sync = (o) => JSON.stringify(o);
  const imported = "2026-05-01T10:00:00Z";
  assert.equal(core.provOf({ synchronizationstatus: sync({ currentSynchronizationState: { provisioningStatus: "Provisioned" } }) }), "Provisioned");
  assert.equal(core.provOf({ synchronizationstatus: "not json" }), "unknown");
  assert.equal(core.isPublished({ publishedon: imported }), true);
  assert.equal(core.isPublished({ publishedon: imported, synchronizationstatus: sync({ lastFinishedPublishOperation: { status: "Failed" } }) }), false);
  assert.equal(core.publishReason({}, null), null);
  assert.equal(core.publishReason({}, imported), "never published");
  assert.equal(core.publishReason({ publishedon: imported, synchronizationstatus: sync({ lastFinishedPublishOperation: { status: "Failed" } }) }, imported), "last publish Failed");
  assert.equal(core.publishReason({ publishedon: "2026-04-01T00:00:00Z" }, imported), "published before this import");
  assert.equal(core.publishReason({ publishedon: "2026-05-01T10:05:00Z" }, imported), null);
});

test("finalStatus: done, partial and error", () => {
  const packages = [{ uniqueName: "A", version: "1.0.0.2" }];
  const base = () => ({ errors: [], importedByUs: { A: {} }, final: { notOwned: [], bots: [{ solution: "A", publishedon: "x" }], solutions: { A: { version: "1.0.0.2" } } } });
  assert.equal(core.finalStatus(base(), packages, "imported"), "done");
  const behind = base();
  behind.final.solutions.A.version = "1.0.0.1";
  assert.equal(core.finalStatus(behind, packages, "imported"), "partial");
  const notOwned = base();
  notOwned.final.notOwned.push({ id: "x" });
  assert.equal(core.finalStatus(notOwned, packages, "imported"), "error");
  const unpublished = base();
  unpublished.final.bots[0].publishedon = null;
  assert.equal(core.finalStatus(unpublished, packages, "imported"), "error");
  assert.equal(core.finalStatus(unpublished, packages, "none"), "done");
  const notOurs = base();
  notOurs.importedByUs = {};
  notOurs.final.bots[0].publishedon = null;
  assert.equal(core.finalStatus(notOurs, packages, "imported"), "done");
  assert.equal(core.finalStatus(notOurs, packages, "all"), "error");
  assert.equal(core.finalStatus({ errors: ["x"], final: base().final }, packages, "none"), "error");
});

test("parseEnvList accepts ids, URLs with owners and pasted Markdown tables", () => {
  const text = [
    "# lab environments",
    "| DE54D14E-012B-EA05-944C-3AB22D1BEC0D |",
    "| --- |",
    "| bdd90fb4-32cf-e8de-acaa-4fd8df10be10 |",
    "de54d14e-012b-ea05-944c-3ab22d1bec0d   # duplicate",
    "https://Org1.crm4.dynamics.com/main.aspx, user1@contoso.com",
    "4c0051eb-9f95-eee3-bb9c-1b78e6b0f819;00000000-0000-0000-0000-00000000000a",
    "",
    "not-an-environment",
  ].join("\r\n");
  const { envs, invalid } = core.parseEnvList(text);
  assert.deepEqual(envs, [
    { id: "de54d14e-012b-ea05-944c-3ab22d1bec0d" },
    { id: "bdd90fb4-32cf-e8de-acaa-4fd8df10be10" },
    { url: "https://org1.crm4.dynamics.com", owner: "user1@contoso.com" },
    { id: "4c0051eb-9f95-eee3-bb9c-1b78e6b0f819", owner: "00000000-0000-0000-0000-00000000000a" },
  ]);
  assert.deepEqual(invalid, ["not-an-environment"]);
});

test("parseArgs handles flags, values, = values, lists and numbers", () => {
  const a = core.parseArgs(["--config", "c.json", "--dry-run", "--only=a, b,", "--concurrency", "4"]);
  assert.equal(a.get("config"), "c.json");
  assert.ok(a.has("dry-run") && a.has("config") && !a.has("force"));
  assert.deepEqual(a.list("only"), ["a", "b"]);
  assert.equal(a.num("concurrency", 12), 4);
  assert.equal(a.num("passes", 1), 1);
  assert.throws(() => core.parseArgs(["stray"]), /Unexpected argument/);
  assert.throws(() => core.parseArgs(["--every", "-1"]).num("every", 1), /non-negative/);
});

test("ownerNameMismatch checks the environment name against the owner", () => {
  const re = "^DEV - (.+)$";
  assert.equal(core.ownerNameMismatch(null, "anything", "x"), null);
  assert.equal(core.ownerNameMismatch(re, "DEV - User SWILJ8LB", "user swilj8lb"), null);
  assert.match(core.ownerNameMismatch(re, "DEV - User SWILJ8LB", "User OTHER"), /owner is "User OTHER"/);
  assert.match(core.ownerNameMismatch(re, "Sandbox", "User OTHER"), /does not match/);
});

test("loadConfig applies defaults, resolves paths and inspects packages", () => {
  const dir = fs.mkdtempSync(path.join(tmp, "cfg-"));
  fs.writeFileSync(path.join(dir, "a.zip"), labZip({ uniqueName: "SolA", version: "1.0.0.1" }));
  fs.writeFileSync(path.join(dir, "b.zip"), labZip({ uniqueName: "SolB", version: "2.0.0.0" }));
  fs.writeFileSync(path.join(dir, "a2.zip"), labZip({ uniqueName: "SOLA", version: "1.0.0.2" }));
  const write = (o) => {
    const f = path.join(dir, "config.json");
    fs.writeFileSync(f, JSON.stringify({ tenantId: TENANT.toUpperCase(), adminUpn: "Admin@Contoso.com", bootstrapOrigin: "https://org.crm.dynamics.com", ...o }));
    return f;
  };
  const cfg = core.loadConfig(write({ packages: ["a.zip", { path: "b.zip" }], environments: "envs.txt" }));
  assert.equal(cfg.tenantId, TENANT);
  assert.equal(cfg.adminUpn, "admin@contoso.com");
  assert.equal(cfg.clientId, core.DEFAULT_CLIENT_ID);
  assert.equal(cfg.environments, path.join(dir, "envs.txt"));
  assert.equal(cfg.outDir, path.join(dir, "out"));
  assert.deepEqual(cfg.owner, { source: "usedBy", upn: null, envNamePattern: null });
  assert.deepEqual(cfg.import, { overwriteUnmanagedCustomizations: false, publishWorkflows: true, publishCustomizations: "auto" });
  assert.equal(cfg.publish, "imported");
  assert.deepEqual(cfg.packages.map((p) => `${p.uniqueName}@${p.version}`), ["SolA@1.0.0.1", "SolB@2.0.0.0"]);

  assert.throws(() => core.loadConfig(write({ packages: ["a.zip", "a2.zip"] })), /same solution \(sola\)/);
  assert.throws(() => core.loadConfig(write({ packages: [{ path: "a.zip", sha256: "00" }] })), /sha256 mismatch/);
  assert.throws(() => core.loadConfig(write({ packages: ["missing.zip"] })), /Package not found/);
  assert.throws(() => core.loadConfig(write({ packages: [] })), /at least one/);
  assert.throws(() => core.loadConfig(write({ packages: ["a.zip"], publish: "some" })), /config.publish/);
  assert.throws(() => core.loadConfig(write({ packages: ["a.zip"], owner: { source: "manager" } })), /owner.source/);
  assert.throws(() => core.loadConfig(write({ packages: ["a.zip"], tenantId: "contoso" })), /tenantId/);
  assert.doesNotThrow(() => core.loadConfig(write({ packages: ["missing.zip"] }), { inspect: false }));
});

test("writeJson writes atomically and readJson falls back only for missing files", () => {
  const f = path.join(tmp, "nested", "r.json");
  core.writeJson(f, { a: 1 });
  assert.deepEqual(core.readJson(f), { a: 1 });
  assert.deepEqual(core.readJson(path.join(tmp, "none.json"), []), []);
  assert.throws(() => core.readJson(path.join(tmp, "none.json")));
});

test("pool runs every item with bounded concurrency and keeps order", async () => {
  let active = 0;
  let peak = 0;
  const out = await core.pool([1, 2, 3, 4, 5], 2, async (n) => {
    peak = Math.max(peak, ++active);
    await core.sleep(5);
    active--;
    return n * 10;
  });
  assert.deepEqual(out, [10, 20, 30, 40, 50]);
  assert.equal(peak, 2);
});

test("normalizeOrigin and buildUrl only allow Dataverse origins", () => {
  assert.equal(normalizeOrigin("https://Org1.CRM4.dynamics.com/"), "https://org1.crm4.dynamics.com");
  for (const bad of ["http://org.crm.dynamics.com", "https://org.crm.dynamics.com/main.aspx", "https://u:p@org.crm.dynamics.com", "https://evil.example.com", "https://org.crm.dynamics.com/?x=1"]) {
    assert.throws(() => normalizeOrigin(bad), /Invalid Dataverse origin|Unexpected Dataverse host/, bad);
  }
  const origin = "https://org.crm.dynamics.com";
  assert.equal(buildUrl(origin, "/solutions?$top=1").href, `${origin}${API_PATH}solutions?$top=1`);
  assert.equal(buildUrl(origin, `${origin}/api/data/v9.2/bots`).href, `${origin}/api/data/v9.2/bots`);
  assert.throws(() => buildUrl(origin, "https://other.crm.dynamics.com/api/data/v9.2/bots"), /different origin/);
});

test("cacheKey matches the dataverse-auth cache layout", () => {
  const want = crypto.createHash("sha256").update(`https://login.microsoftonline.com/${TENANT}|cid|https://org.crm.dynamics.com`).digest("hex").slice(0, 32);
  assert.equal(cacheKey(`https://login.microsoftonline.com/${TENANT}`, "cid", "https://org.crm.dynamics.com"), want);
});

const ADMIN_ENVS = [
  {
    name: "DE54D14E-012B-EA05-944C-3AB22D1BEC0D",
    location: "europe",
    properties: {
      displayName: "DEV - User ABC",
      environmentSku: "Developer",
      linkedEnvironmentMetadata: { instanceUrl: "https://org1.crm4.dynamics.com/", resourceId: "ORG-1", instanceState: "Ready", domainName: "org1" },
      usedBy: { id: "U-1", type: "User", tenantId: TENANT },
      createdBy: { id: "C-1", displayName: "Admin", userPrincipalName: "admin@contoso.com", type: "User" },
    },
  },
  { name: "bdd90fb4-32cf-e8de-acaa-4fd8df10be10", properties: { displayName: "No Dataverse" } },
];

test("pickEnv and resolveList map admin API environments", () => {
  const e = pickEnv(ADMIN_ENVS[0]);
  assert.equal(e.id, "de54d14e-012b-ea05-944c-3ab22d1bec0d");
  assert.equal(e.instanceUrl, "https://org1.crm4.dynamics.com");
  assert.equal(e.orgId, "org-1");
  assert.deepEqual(e.usedBy, { id: "u-1", type: "User", tenantId: TENANT });
  assert.equal(pickEnv(ADMIN_ENVS[1]).instanceUrl, null);

  const { resolved, missing } = resolveList(
    [
      { id: "de54d14e-012b-ea05-944c-3ab22d1bec0d", owner: "x@contoso.com" },
      { id: "4c0051eb-9f95-eee3-bb9c-1b78e6b0f819" },
      { url: "https://org1.crm4.dynamics.com" },
      { url: "https://elsewhere.crm.dynamics.com", owner: "y@contoso.com" },
    ],
    ADMIN_ENVS
  );
  assert.deepEqual(missing, ["4c0051eb-9f95-eee3-bb9c-1b78e6b0f819"]);
  assert.equal(resolved[0].owner, "x@contoso.com");
  assert.equal(resolved[1].displayName, "DEV - User ABC");
  assert.deepEqual(resolved[2], { id: null, displayName: "elsewhere.crm.dynamics.com", instanceUrl: "https://elsewhere.crm.dynamics.com", owner: "y@contoso.com" });
});

test("runner.loadEnvs selects environments from envs-resolved.json", () => {
  const outDir = fs.mkdtempSync(path.join(tmp, "out-"));
  const cfg = { outDir, tenantId: TENANT, file: "config.json" };
  assert.throws(() => loadEnvs(cfg, core.parseArgs([])), /envs-resolved\.json not found/);
  const { resolved } = resolveList([{ id: "de54d14e-012b-ea05-944c-3ab22d1bec0d" }, { id: "bdd90fb4-32cf-e8de-acaa-4fd8df10be10" }, { url: "https://org2.crm.dynamics.com" }], ADMIN_ENVS);
  core.writeJson(path.join(outDir, "envs-resolved.json"), { tenantId: TENANT, resolved, missing: [] });

  assert.equal(loadEnvs(cfg, core.parseArgs([])).length, 2, "environments without Dataverse are dropped");
  for (const only of ["DE54D14E-012B-EA05-944C-3AB22D1BEC0D", "dev - user abc", "org1", "https://org1.crm4.dynamics.com/main.aspx"]) {
    assert.deepEqual(loadEnvs(cfg, core.parseArgs(["--only", only])).map((e) => e.displayName), ["DEV - User ABC"], only);
  }
  assert.throws(() => loadEnvs(cfg, core.parseArgs(["--only", "nope"])), /--only entries not in/);
  assert.equal(envKey(loadEnvs(cfg, core.parseArgs(["--only", "org2"]))[0]), "org2.crm.dynamics.com");
  assert.equal(loadEnvs(cfg, core.parseArgs(["--url", "https://org1.crm4.dynamics.com/"]))[0].displayName, "DEV - User ABC");
  assert.equal(loadEnvs(cfg, core.parseArgs(["--url", "https://new.crm.dynamics.com"]))[0].displayName, "new.crm.dynamics.com");

  core.writeJson(path.join(outDir, "envs-resolved.json"), { tenantId: "99999999-2222-3333-4444-555555555555", resolved, missing: [] });
  assert.throws(() => loadEnvs(cfg, core.parseArgs([])), /resolved for tenant/);
});
