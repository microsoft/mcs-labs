'use strict';

module.exports = {};

const README_RE = /^labs\/([^/]+)\/README\.md$/;
const LABS_RE = /^_labs\/([^/]+)\.md$/;
const DEFAULT_STATUS = 'M';
const ADDED_STATUS_RE = /^A\d*$/;

function findUnsyncedLabs(changedFiles, { readmeSlugs } = {}) {
  const readmes = readmeSlugs || new Set();
  const changedReadmes = new Set();
  const addedReadmes = new Set();
  const changedLabs = new Set();
  for (const line of changedFiles) {
    const raw = String(line).trim();
    if (!raw) continue;
    const parts = raw.split('\t');
    const hasStatus = parts.length > 1;
    // Backward-compatibility: callers that provide plain paths (no status)
    // are treated as "modified" paths.
    const status = hasStatus ? parts[0] : DEFAULT_STATUS;
    const paths = hasStatus ? parts.slice(1) : [raw];
    for (const f of paths) {
      const r = String(f).match(README_RE);
      if (r) {
        changedReadmes.add(r[1]);
        // Match git "added" statuses (e.g., A, A100).
        if (ADDED_STATUS_RE.test(status)) addedReadmes.add(r[1]);
        continue;
      }
      const l = String(f).match(LABS_RE);
      if (l) changedLabs.add(l[1]);
    }
  }
  const violations = [];
  for (const slug of changedReadmes) {
    // Backfill scenario: README was newly added for an existing lab.
    if (addedReadmes.has(slug) && readmes.has(slug)) continue;
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
