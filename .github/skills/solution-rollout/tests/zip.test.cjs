"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { listEntries, readEntry, parseSolutionXml, parseCustomizations, inspectPackage } = require("../scripts/lib/zip.cjs");
const { makeZip, solutionXml, labZip } = require("./helpers.cjs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rollout-zip-"));
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

test("lists and reads stored and deflated entries", () => {
  for (const deflate of [false, true]) {
    const buf = makeZip({ "a.txt": "hello", "dir/b.txt": "world ".repeat(50) }, { deflate });
    const entries = listEntries(buf);
    assert.deepEqual(entries.map((e) => e.name), ["a.txt", "dir/b.txt"]);
    assert.equal(entries[0].method, deflate ? 8 : 0);
    assert.equal(readEntry(buf, entries[1]).toString(), "world ".repeat(50));
  }
});

test("rejects non-ZIP input and encrypted entries", () => {
  assert.throws(() => listEntries(Buffer.from("not a zip at all, definitely not")), /Not a ZIP/);
  const buf = makeZip({ "a.txt": "x" });
  const [entry] = listEntries(buf);
  assert.throws(() => readEntry(buf, { ...entry, encrypted: true }), /Encrypted/);
});

test("parses solution.xml identity", () => {
  const s = parseSolutionXml(solutionXml({ uniqueName: "LABOrders", version: "1.0.0.9", managed: true, prefix: "crc3b" }));
  assert.deepEqual(s, { uniqueName: "LABOrders", version: "1.0.0.9", managed: true, displayName: "LAB: LABOrders & friends", publisher: "CAT", publisherPrefix: "crc3b" });
  assert.throws(() => parseSolutionXml("<ImportExportXml/>"), /SolutionManifest/);
});

test("parses connection references, workflows and tables from customizations.xml", () => {
  const c = parseCustomizations(
    `<Entity><Name LocalizedName="X">cr_x</Name></Entity><Workflow WorkflowId="{ABC}" Name="Flow"><Category>5</Category></Workflow>` +
      `<connectionreference connectionreferencelogicalname="cr_a.shared_x.1"><connectionreferencedisplayname>A</connectionreferencedisplayname><connectorid>/providers/Microsoft.PowerApps/apis/shared_x</connectorid></connectionreference>`
  );
  assert.deepEqual(c.tables, ["cr_x"]);
  assert.deepEqual(c.workflows, [{ name: "Flow", id: "abc", category: 5 }]);
  assert.deepEqual(c.connectionReferences, [{ logicalName: "cr_a.shared_x.1", displayName: "A", connector: "shared_x" }]);
});

test("inspectPackage reports what a rollout needs", () => {
  for (const deflate of [false, true]) {
    const file = path.join(tmp, `lab-${deflate}.zip`);
    const buf = labZip({ uniqueName: "LabSolution", version: "1.0.0.2" }, { deflate });
    fs.writeFileSync(file, buf);
    const p = inspectPackage(file);
    assert.equal(p.file, path.basename(file));
    assert.equal(p.sha256, crypto.createHash("sha256").update(buf).digest("hex"));
    assert.equal(p.uniqueName, "LabSolution");
    assert.equal(p.version, "1.0.0.2");
    assert.equal(p.managed, false);
    assert.equal(p.publisherPrefix, "cr123");
    assert.deepEqual(p.bots, ["cr123_agent"]);
    assert.equal(p.botComponents, 2);
    assert.deepEqual(p.connectionReferences.map((r) => r.connector), ["shared_commondataserviceforapps"]);
    assert.equal(p.connectionReferences[0].displayName, "Dataverse & more");
    assert.deepEqual(p.workflows, [{ name: "Order Management Workflow", id: "aaaaaaaa-1111-2222-3333-444444444444", category: 5 }]);
    assert.deepEqual(p.tables, ["cr123_order"]);
    assert.deepEqual(p.environmentVariables, ["cr123_ApiUrl"]);
    assert.deepEqual(p.canvasApps, ["cr123_app_DocumentUri.msapp"]);
  }
});

test("inspectPackage refuses a ZIP that is not a solution export", () => {
  const file = path.join(tmp, "plain.zip");
  fs.writeFileSync(file, makeZip({ "readme.txt": "hi" }));
  assert.throws(() => inspectPackage(file), /no solution\.xml/);
});

// Optional: point ROLLOUT_TEST_ZIP at a real solution export to check the reader against it.
test("inspects a real solution package", { skip: !process.env.ROLLOUT_TEST_ZIP && "set ROLLOUT_TEST_ZIP to a solution .zip" }, () => {
  const p = inspectPackage(process.env.ROLLOUT_TEST_ZIP);
  assert.ok(p.uniqueName);
  assert.match(p.version, /^\d+(\.\d+){1,3}$/);
  assert.match(p.sha256, /^[0-9a-f]{64}$/);
  for (const r of p.connectionReferences) assert.ok(r.logicalName && r.connector, JSON.stringify(r));
});
