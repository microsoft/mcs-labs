"use strict";
// Builds small solution ZIPs in memory so the tests need no real package.
const zlib = require("node:zlib");

function makeZip(files, { deflate = false } = {}) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = Buffer.from(content, "utf8");
    const data = deflate ? zlib.deflateRawSync(raw) : raw;
    const nameBuf = Buffer.from(name, "utf8");
    const crc = zlib.crc32(raw);
    const method = deflate ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, data);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  const count = Object.keys(files).length;
  eocd.writeUInt16LE(count, 8);
  eocd.writeUInt16LE(count, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

function solutionXml({ uniqueName = "LabSolution", version = "1.0.0.1", managed = false, prefix = "cr123" } = {}) {
  return `\uFEFF<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.2" SolutionPackageVersion="9.2">
  <SolutionManifest>
    <UniqueName>${uniqueName}</UniqueName>
    <LocalizedNames><LocalizedName description="LAB: ${uniqueName} &amp; friends" languagecode="1033" /></LocalizedNames>
    <Version>${version}</Version>
    <Managed>${managed ? 1 : 0}</Managed>
    <Publisher>
      <UniqueName>CAT</UniqueName>
      <CustomizationPrefix>${prefix}</CustomizationPrefix>
    </Publisher>
  </SolutionManifest>
</ImportExportXml>`;
}

const CUSTOMIZATIONS = `<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml>
  <Entities>
    <Entity><Name LocalizedName="Order" OriginalName="Order">cr123_order</Name></Entity>
  </Entities>
  <Workflows>
    <Workflow WorkflowId="{AAAAAAAA-1111-2222-3333-444444444444}" Name="Order Management Workflow">
      <Category>5</Category>
    </Workflow>
  </Workflows>
  <connectionreferences>
    <connectionreference connectionreferencelogicalname="cr123_lab.shared_commondataserviceforapps.abc">
      <connectionreferencedisplayname>Dataverse &amp; more</connectionreferencedisplayname>
      <connectorid>/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps</connectorid>
    </connectionreference>
  </connectionreferences>
</ImportExportXml>`;

function labZip(opts = {}, zipOpts = {}) {
  return makeZip(
    {
      "solution.xml": solutionXml(opts),
      "customizations.xml": CUSTOMIZATIONS,
      "[Content_Types].xml": "<Types/>",
      "bots/cr123_agent/bot.xml": "<bot/>",
      "bots/cr123_agent/configuration.json": "{}",
      "botcomponents/cr123_agent.topic.Greeting/botcomponent.xml": "<botcomponent/>",
      "botcomponents/cr123_agent.topic.Goodbye/botcomponent.xml": "<botcomponent/>",
      "environmentvariabledefinitions/cr123_ApiUrl/environmentvariabledefinition.xml": "<x/>",
      "CanvasApps/cr123_app_DocumentUri.msapp": "app",
    },
    zipOpts
  );
}

module.exports = { makeZip, solutionXml, labZip };
