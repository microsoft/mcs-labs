"use strict";
// Minimal, dependency-free reader for Dataverse solution packages (.zip). Solution exports are plain
// stored/deflated ZIPs well under 4 GB, so ZIP64 is rejected rather than half-supported.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

function listEntries(buf) {
  const minStart = Math.max(0, buf.length - 0xffff - 22);
  let eocd = -1;
  for (let i = buf.length - 22; i >= minStart; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a ZIP file (no end-of-central-directory record).");
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOffset === 0xffffffff || cdSize === 0xffffffff) throw new Error("ZIP64 archives are not supported.");
  if (cdOffset + cdSize > buf.length) throw new Error("Corrupt ZIP: central directory is out of range.");
  const entries = [];
  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== CEN_SIG) throw new Error("Corrupt ZIP: bad central directory entry.");
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const size = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString(flags & 0x800 ? "utf8" : "latin1", p + 46, p + 46 + nameLen).replace(/\\/g, "/");
    entries.push({ name, method, compressedSize, size, localOffset, encrypted: !!(flags & 1) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntry(buf, entry) {
  if (entry.encrypted) throw new Error(`Encrypted ZIP entry: ${entry.name}`);
  const p = entry.localOffset;
  if (buf.readUInt32LE(p) !== LOC_SIG) throw new Error(`Corrupt ZIP: bad local header for ${entry.name}`);
  const start = p + 30 + buf.readUInt16LE(p + 26) + buf.readUInt16LE(p + 28);
  const data = buf.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return Buffer.from(data);
  if (entry.method === 8) return zlib.inflateRawSync(data);
  throw new Error(`Unsupported compression method ${entry.method} for ${entry.name}`);
}

function textOf(buf, entries, name) {
  const e = entries.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!e) return null;
  let s = readEntry(buf, e).toString("utf8");
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s;
}

const decode = (s) =>
  String(s)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

function tag(xml, name) {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml || "");
  return m ? decode(m[1].trim()) : null;
}

function blocks(xml, name) {
  return [...String(xml || "").matchAll(new RegExp(`<${name}(\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "gi"))].map((m) => ({ attrs: m[1] || "", body: m[2] }));
}

function attr(attrs, name) {
  const m = new RegExp(`\\b${name}="([^"]*)"`, "i").exec(attrs || "");
  return m ? decode(m[1]) : null;
}

function parseSolutionXml(xml) {
  const manifest = /<SolutionManifest[\s>][\s\S]*<\/SolutionManifest>/i.exec(xml || "");
  if (!manifest) throw new Error("solution.xml has no SolutionManifest.");
  const m = manifest[0];
  const localized = /<LocalizedNames>[\s\S]*?<LocalizedName\s[^>]*description="([^"]*)"/i.exec(m);
  const publisher = /<Publisher>([\s\S]*?)<\/Publisher>/i.exec(m);
  return {
    uniqueName: tag(m, "UniqueName"),
    version: tag(m, "Version"),
    managed: tag(m, "Managed") === "1",
    displayName: localized ? decode(localized[1]) : null,
    publisher: publisher ? tag(publisher[1], "UniqueName") : null,
    publisherPrefix: publisher ? tag(publisher[1], "CustomizationPrefix") : null,
  };
}

function parseCustomizations(xml) {
  const connectionReferences = blocks(xml, "connectionreference").map((b) => ({
    logicalName: attr(b.attrs, "connectionreferencelogicalname"),
    displayName: tag(b.body, "connectionreferencedisplayname"),
    connector: String(tag(b.body, "connectorid") || "").split("/").pop() || null,
  }));
  const workflows = blocks(xml, "Workflow").map((b) => ({
    name: attr(b.attrs, "Name"),
    id: String(attr(b.attrs, "WorkflowId") || "").replace(/[{}]/g, "").toLowerCase() || null,
    category: Number(tag(b.body, "Category")),
  }));
  const tables = [...String(xml || "").matchAll(/<Entity>\s*<Name\b[^>]*>([^<]+)<\/Name>/g)].map((m) => decode(m[1].trim()));
  return { connectionReferences, workflows, tables };
}

// Reads what a rollout needs from a package without importing it: identity, version, managed flag, publisher
// prefix, and the agents, connection references, flows and environment variables it carries.
function inspectPackage(file) {
  const abs = path.resolve(file);
  const buf = fs.readFileSync(abs);
  const entries = listEntries(buf);
  const solutionXml = textOf(buf, entries, "solution.xml");
  if (!solutionXml) throw new Error(`${path.basename(abs)} has no solution.xml at its root; is it a solution export?`);
  const solution = parseSolutionXml(solutionXml);
  if (!solution.uniqueName || !solution.version) throw new Error(`${path.basename(abs)}: solution.xml lacks UniqueName or Version.`);
  const custom = parseCustomizations(textOf(buf, entries, "customizations.xml") || "");
  const folders = (prefix) => [...new Set(entries.filter((e) => e.name.toLowerCase().startsWith(prefix)).map((e) => e.name.split("/")[1]).filter(Boolean))];
  return {
    path: abs,
    file: path.basename(abs),
    bytes: buf.length,
    sha256: crypto.createHash("sha256").update(buf).digest("hex"),
    ...solution,
    bots: folders("bots/"),
    botComponents: folders("botcomponents/").length,
    connectionReferences: custom.connectionReferences,
    workflows: custom.workflows,
    tables: custom.tables,
    environmentVariables: folders("environmentvariabledefinitions/"),
    canvasApps: entries.filter((e) => /^canvasapps\/[^/]+\.msapp$/i.test(e.name)).map((e) => e.name.split("/")[1]),
  };
}

module.exports = { listEntries, readEntry, parseSolutionXml, parseCustomizations, inspectPackage };
