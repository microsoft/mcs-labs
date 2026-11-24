"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { sha256, validateRecipients, buildFiles, loadConfig, loadInputs, loadPlan, save } = require("../scripts/core.cjs");
const { parseArgs, ensureFile, ensureParents, identity, run } = require("../scripts/provision.cjs");
const { createGraph } = require("../scripts/graph.cjs");

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-provision-test-"));
test.after(() => fs.rmSync(directory, { recursive: true, force: true }));
const origin = "https://contoso-my.sharepoint.com";
const recipient = { objectId: "11111111-1111-1111-1111-111111111111", upn: "attendee@contoso.com", siteUrl: `${origin}/personal/attendee_contoso_com` };
const content = Buffer.from("training example");
const local = path.join(directory, "sample.txt");
fs.writeFileSync(local, content);
const entry = { target: "sample.txt", local, size: content.length, sha256: sha256(content) };

function fileGraph(initial, { loseWrite = false } = {}) {
  let stored = initial, etag = "original";
  const writes = [];
  async function graph(url, options = {}) {
    if (options.method === "PUT") {
      writes.push(options);
      assert.equal(options.headers["If-None-Match"], "*");
      assert.match(url, /conflictBehavior=fail/);
      if (stored) return { status: 412 };
      stored = options.body; etag = "created";
      if (loseWrite) throw new Error("Connection lost after write.");
      return { status: 201 };
    }
    if (options.bytes) return { status: 200, bytes: stored };
    return stored ? { status: 200, body: { id: "file-id", name: "sample.txt", size: stored.length, eTag: etag, file: {} } } : { status: 404 };
  }
  return { graph, writes };
}

test("CLI defaults to read-only plan and rejects accidental execution combinations", () => {
  assert.equal(parseArgs(["--config", "c.json"]).mode, "plan");
  assert.throws(() => parseArgs(["--config", "c.json", "--verify", "--execute"]), /exactly one/);
  assert.throws(() => parseArgs(["--config", "c.json", "--canary", recipient.objectId]), /Usage/);
  assert.throws(() => parseArgs(["--config", "c.json", "--force"]), /Unknown argument/);
});

test("recipient and manifest inputs reject collisions and escaped payloads", () => {
  assert.equal(validateRecipients([recipient], origin).length, 1);
  assert.throws(() => validateRecipients([recipient, { ...recipient, upn: recipient.upn.toUpperCase() }], origin), /Duplicate/);
  assert.throws(() => validateRecipients([{ ...recipient, siteUrl: "https://other-my.sharepoint.com/personal/a" }], origin), /Invalid recipient/);
  assert.throws(() => buildFiles({ files: [{ source: "sample.txt", target: "../bad" }] }, directory), /target path/);
  assert.throws(() => buildFiles({ files: [{ source: local, target: "file.txt" }] }, directory), /relative/);
  assert.throws(() => buildFiles({ files: [{ source: "sample.txt", target: "a.txt" }, { source: "sample.txt", target: "A.txt" }] }, directory), /Duplicate/);
  const child = path.join(directory, "child");
  fs.mkdirSync(child);
  assert.throws(() => buildFiles({ files: [{ source: `..${path.sep}sample.txt`, target: "a.txt" }] }, child), /escapes/);
  assert.equal(buildFiles({ files: [{ source: "sample.txt", target: "folder/sample.txt" }] }, directory)[0].sha256, entry.sha256);
});

test("resume fingerprint rejects changed payload even when old results were complete", async () => {
  const dir = fs.mkdtempSync(path.join(directory, "plan-"));
  fs.writeFileSync(path.join(dir, "file.txt"), "before");
  fs.writeFileSync(path.join(dir, "recipients.json"), JSON.stringify([recipient]));
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ files: [{ source: "file.txt", target: "file.txt" }] }));
  const configFile = path.join(dir, "config.json");
  fs.writeFileSync(configFile, JSON.stringify({
    tenantId: recipient.objectId, clientId: recipient.objectId, adminUpn: "admin@contoso.com",
    sharePointOrigin: origin, sharePointAdminOrigin: "https://contoso-admin.sharepoint.com",
    recipients: "recipients.json", manifest: "manifest.json", payloadRoot: ".", outDir: "out",
  }));
  const config = loadConfig(configFile), inputs = loadInputs(config);
  await save(path.join(config.outDir, "plan.json"), { tenantId: config.tenantId, inputsHash: inputs.inputsHash, recipients: [{ ...recipient, identityVerified: true }] });
  assert.doesNotThrow(() => loadPlan(config, inputs));
  fs.writeFileSync(path.join(dir, "file.txt"), "after");
  assert.throws(() => loadPlan(config, loadInputs(config)), /inputs changed/);
});

test("identity preflight rejects a recycled or mismatched UPN", async () => {
  await assert.rejects(identity(async () => ({ body: { id: recipient.objectId, userPrincipalName: "someoneelse@contoso.com" } }), recipient), /identity mismatch/);
});

test("existing content is preserved and verify never writes", async () => {
  const conflict = fileGraph(Buffer.from("different content"));
  assert.equal((await ensureFile(conflict.graph, "drive", entry, { execute: true })).status, "conflict");
  assert.equal(conflict.writes.length, 0);
  const identical = fileGraph(content);
  assert.equal((await ensureFile(identical.graph, "drive", entry)).status, "verified");
  assert.equal(identical.writes.length, 0);
  const missing = fileGraph(null);
  assert.equal((await ensureFile(missing.graph, "drive", entry)).status, "missing");
  assert.equal(missing.writes.length, 0);
});

test("canary verifies create-only guards and a lost PUT response is reconciled", async () => {
  const canary = fileGraph(null);
  assert.equal((await ensureFile(canary.graph, "drive", entry, { execute: true, probe: true })).status, "verified");
  assert.equal(canary.writes.length, 2);
  const lost = fileGraph(null, { loseWrite: true });
  const result = await ensureFile(lost.graph, "drive", entry, { execute: true });
  assert.equal(result.status, "verified");
  assert.equal(result.recovered, true);
  assert.equal(lost.writes.length, 1);
});

test("nested folders are create-only and a file blocking a folder stops the upload", async () => {
  const folders = new Set(), posts = [];
  await ensureParents(async (url, options = {}) => {
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      assert.equal(body["@microsoft.graph.conflictBehavior"], "fail");
      posts.push(url); folders.add(body.name);
      return { status: 201 };
    }
    const name = url.split("?")[0].split("/").at(-1);
    return folders.has(name) ? { status: 200, body: { id: name, folder: {} } } : { status: 404 };
  }, "drive", "Workshop/Notes/file.txt");
  assert.deepEqual(posts, ["/drives/drive/root/children", "/drives/drive/root:/Workshop:/children"]);
  await assert.rejects(ensureParents(async () => ({ status: 200, body: { file: {} } }), "drive", "Workshop/file.txt"), /folder conflict/);
});

test("Graph throttled reads honor Retry-After and writes are never blindly retried", async () => {
  const pauses = [];
  let calls = 0;
  const graph = createGraph(async () => "fake", origin, {
    intervalMs: 0, pause: async ms => pauses.push(ms),
    fetchImpl: async () => ++calls === 1 ? new Response("", { status: 429, headers: { "Retry-After": "3" } }) : new Response("{}", { status: 200 }),
  });
  await graph("/users/id");
  assert.equal(calls, 2);
  assert.ok(pauses.includes(3000));
  calls = 0;
  await assert.rejects(graph("/users/id", { method: "PUT" }), /HTTP 429/);
  assert.equal(calls, 1);
});

test("download redirect never receives Graph authorization and other origins are rejected", async () => {
  const requests = [];
  const graph = createGraph(async () => "fake", origin, {
    intervalMs: 0, pause: async () => {},
    fetchImpl: async (url, options) => {
      requests.push({ url: String(url), options });
      return requests.length === 1 ? new Response(null, { status: 302, headers: { Location: `${origin}/download` } }) : new Response(content);
    },
  });
  assert.deepEqual((await graph("/drives/id/content", { bytes: true })).bytes, content);
  assert.equal(requests[1].options.headers, undefined);
  const bad = createGraph(async () => "fake", origin, {
    intervalMs: 0, pause: async () => {},
    fetchImpl: async () => new Response(null, { status: 302, headers: { Location: "https://example.com/download" } }),
  });
  await assert.rejects(bad("/content", { bytes: true }), /redirect origin/);
});

test("full verification re-reads recipients and derives counts from the manifest", async () => {
  const outDir = fs.mkdtempSync(path.join(directory, "verify-"));
  const config = { outDir }, inputs = { inputsHash: "fixture", recipients: [recipient], files: [entry] };
  await save(path.join(outDir, "execute.json"), { recipients: [{ objectId: recipient.objectId, status: "verified" }] });
  const remote = fileGraph(content);
  let identities = 0;
  const graph = async (url, opts) => {
    if (url.includes("userPrincipalName")) { identities++; return { body: { id: recipient.objectId, userPrincipalName: recipient.upn } }; }
    if (url.includes("/drive?")) return { status: 200, body: {
      id: "drive", driveType: "business", owner: { user: { id: recipient.objectId } }, webUrl: `${recipient.siteUrl}/Documents`,
    } };
    return remote.graph(url, opts);
  };
  await run(graph, config, inputs, { recipients: [recipient] }, { mode: "verify" });
  assert.equal(identities, 1);
  assert.equal(remote.writes.length, 0);
  const result = JSON.parse(fs.readFileSync(path.join(outDir, "verify.json")));
  assert.equal(result.recipients[0].files.length, 1);
  assert.equal(result.recipients[0].status, "verified");
});

test("verification continues through all files after a conflict", async () => {
  const outDir = fs.mkdtempSync(path.join(directory, "partial-"));
  const config = { outDir }, inputs = {
    inputsHash: "fixture", recipients: [recipient], files: [{ ...entry, target: "missing.txt" }, entry],
  };
  const remote = fileGraph(content);
  const graph = async (url, opts) => {
    if (url.includes("userPrincipalName")) return { body: { id: recipient.objectId, userPrincipalName: recipient.upn } };
    if (url.includes("/drive?")) return { status: 200, body: {
      id: "drive", driveType: "business", owner: { user: { id: recipient.objectId } }, webUrl: `${recipient.siteUrl}/Documents`,
    } };
    if (url.includes("missing.txt")) return { status: 404 };
    return remote.graph(url, opts);
  };
  await assert.rejects(run(graph, config, inputs, { recipients: [recipient] }, { mode: "verify" }), /Verification incomplete/);
  const result = JSON.parse(fs.readFileSync(path.join(outDir, "verify.json")));
  assert.deepEqual(result.recipients[0].files.map(file => file.status), ["missing", "verified"]);
  assert.equal(result.recipients[0].status, "blocked");
  assert.equal(remote.writes.length, 0);
});
