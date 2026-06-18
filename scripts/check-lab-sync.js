'use strict';

module.exports = {};

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

// CLI: read newline-separated changed files on stdin, exit 1 on violations.
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');

  let input = '';
  try { input = fs.readFileSync(0, 'utf8'); } catch { input = ''; }
  const changedFiles = input.split('\n').map((s) => s.trim()).filter(Boolean);

  const readmeSlugs = new Set();
  try {
    for (const slug of fs.readdirSync('labs')) {
      if (fs.existsSync(path.join('labs', slug, 'README.md'))) readmeSlugs.add(slug);
    }
  } catch { /* no labs/ dir — leave empty */ }

  const { violations, warnings } = findUnsyncedLabs(changedFiles, { readmeSlugs });

  for (const slug of warnings) {
    console.log(`::warning::⚠️ ${slug}: _labs/${slug}.md changed without labs/${slug}/README.md — the GitHub README may now be out of date.`);
  }
  if (violations.length) {
    for (const slug of violations) {
      console.error(`::error::❌ ${slug}: labs/${slug}/README.md changed but _labs/${slug}.md was not. The site renders from _labs/${slug}.md — update it so your change appears. (See docs/CONTENT_FEED.md.)`);
    }
    console.error(`\nlab-doc-sync: ${violations.length} lab(s) need their _labs/<slug>.md updated.`);
    process.exit(1);
  }
  console.log(`lab-doc-sync: OK${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
}
