'use strict';

module.exports = {};

// findUnsyncedLabs is added in the next task; the CLI entry is added last.

const README_RE = /^labs\/([^/]+)\/README\.md$/;
const LABS_RE = /^_labs\/([^/]+)\.md$/;

function findUnsyncedLabs(changedFiles, { readmeSlugs } = {}) {
  const readmes = readmeSlugs || new Set();
  const changedReadmes = new Set();
  const changedLabs = new Set();
  for (const f of changedFiles) {
    const r = String(f).match(README_RE);
    if (r) { changedReadmes.add(r[1]); continue; }
    const l = String(f).match(LABS_RE);
    if (l) { changedLabs.add(l[1]); }
  }
  const violations = [];
  for (const slug of changedReadmes) {
    if (!changedLabs.has(slug)) violations.push(slug);
  }
  const warnings = [];
  for (const slug of changedLabs) {
    if (!changedReadmes.has(slug) && readmes.has(slug)) warnings.push(slug);
  }
  return { violations: violations.sort(), warnings: warnings.sort() };
}
module.exports.findUnsyncedLabs = findUnsyncedLabs;
