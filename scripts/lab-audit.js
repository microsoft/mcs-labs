#!/usr/bin/env node
/**
 * lab-audit.js: deterministic health checks for labs in both formats.
 *
 * WHY: labs drift as products change. The two copies of a lab diverge,
 * in-page anchors and images break, product names are retired, agendas point
 * at labs that moved, and missions labs carry a structured contract their
 * layout depends on. CI only guards that README and _labs change together
 * (scripts/check-lab-sync.js). This script gives authors, reviewers and the
 * .github/skills/lab-* agent skills one repeatable baseline to run before
 * human judgment.
 *
 * It is a report, not a CI gate: many findings predate it. It exits 1 when
 * it finds errors (or warnings with --strict) so it can be scripted.
 *
 * Usage:
 *   node scripts/lab-audit.js [slug ...] [--changed[=<base>]]
 *        [--format text|json|markdown] [--min-severity info|warn|error] [--strict]
 *
 * Without slugs it audits every lab. --changed audits labs touched since
 * <base> (default origin/main), plus uncommitted and untracked files.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const TERMS_FILE = path.join(__dirname, 'lab-audit-terms.json');

// Mirrors the section label map in _layouts/lab.html; other values render as a raw string.
const VALID_SECTIONS = ['core_learning_path', 'intermediate_labs', 'advanced_labs', 'specialized_labs', 'optional_labs', 'external_labs'];
const VALID_JOURNEYS = ['quick-start', 'business-user', 'developer', 'autonomous-ai'];
const VALID_DIFFICULTIES = [100, 200, 300];
const REQUIRED_KEYS = ['title', 'description', 'difficulty', 'duration', 'section', 'order', 'journeys'];
// _plugins/content_last_updated.rb derives update dates from Git, so authored dates only go stale.
const MANUAL_DATE_KEYS = ['date', 'last_updated', 'last_modified', 'updated', 'modified', 'content_last_updated'];
const SEVERITIES = ['error', 'warn', 'info'];
const READING_WPM = 200;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
// A line that explains a rename may name the retired product.
const RENAME_CONTEXT = /\b(formerly|previously|renamed|rebranded|now (?:called|named|known as)|f\.?k\.?a\.?|was called|used to be)\b/i;
const PICTOGRAPH = /\p{Extended_Pictographic}/u;
// One emoji cluster: pictographs, flags, keycaps, variation selectors and joiners.
const EMOJI_RUN = '(?:[\\p{Extended_Pictographic}\\u{1F1E6}-\\u{1F1FF}\\uFE0F\\u200D\\u20E3]|[0-9#*]\\uFE0F?\\u20E3)+';

const readText = file => { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } };
const listDir = dir => { try { return fs.readdirSync(dir); } catch { return []; } };
const isFile = file => { try { return fs.statSync(file).isFile(); } catch { return false; } };
const toPosix = (root, file) => path.relative(root, file).split(path.sep).join('/');
const escapeRe = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const preview = (text, max = 60) => {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};
const lineList = numbers => numbers.length > 8 ? `${numbers.slice(0, 8).join(', ')}, …` : numbers.join(', ');

/** 0-based index of the first body line, or 0 when there is no front matter. */
function bodyStartIndex(lines) {
  if (!/^---\s*$/.test(lines[0] || '')) return 0;
  for (let i = 1; i < lines.length; i++) if (/^(---|\.\.\.)\s*$/.test(lines[i])) return i + 1;
  return 0;
}

/**
 * Markdown lines outside fenced code and HTML comments, with 1-based file
 * line numbers. Fences may be indented because labs nest them in lists.
 */
function proseLines(lines, start = 0) {
  const out = [];
  let fence = null;
  let comment = false;
  for (let i = start; i < lines.length; i++) {
    const raw = lines[i];
    const marker = raw.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && /^\s*(`{3,}|~{3,})\s*$/.test(raw)) fence = null;
      continue;
    }
    if (marker) { fence = marker[1]; continue; }
    let text = raw;
    if (comment) {
      const end = text.indexOf('-->');
      if (end < 0) continue;
      text = text.slice(end + 3);
      comment = false;
    }
    // Scan instead of a regex replace so no comment opener can survive.
    let kept = '';
    let pos = 0;
    for (;;) {
      const open = text.indexOf('<!--', pos);
      if (open < 0) { kept += text.slice(pos); break; }
      kept += text.slice(pos, open);
      const close = text.indexOf('-->', open + 4);
      if (close < 0) { comment = true; break; }
      pos = close + 3;
    }
    out.push({ text: kept, line: i + 1 });
  }
  return out;
}

const stripCodeSpans = text => text.replace(/(`+)[\s\S]*?\1/g, '');

/**
 * The text kramdown uses for an automatic heading id (auto_id_stripping):
 * link text and code span content stay; images, HTML tags and markup go.
 */
function headingRawText(text) {
  const codes = [];
  let s = text.replace(/(`+)([\s\S]*?)\1/g, (m, ticks, code) => { codes.push(code.trim()); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    // Ids drop '<' anyway; removing strays keeps nested tags from surviving.
    .replace(/</g, '')
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, '')
    // Typographic -- and --- become dashes, which ids drop.
    .replace(/-{2,3}/g, '')
    // __strong__ and _em_ at word boundaries; intraword underscores stay (GFM).
    .replace(/(^|[^\p{L}\p{N}_])__(.+?)__(?=$|[^\p{L}\p{N}_])/gu, '$1$2')
    .replace(/(^|[^\p{L}\p{N}_])_(.+?)_(?=$|[^\p{L}\p{N}_])/gu, '$1$2');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => codes[Number(i)]).trim();
}

/**
 * kramdown-parser-gfm generate_gfm_header_id: downcase, drop characters that
 * are not \p{Word}, '-', space or tab, then turn spaces and tabs into '-'.
 * Ruby \p{Word} is letters, marks, decimal digits and connector punctuation,
 * so an emoji's U+FE0F variation selector (a mark) survives: '⚙️ Setup' gives
 * '\uFE0F-setup', while '🧭 Lab Details' gives '-lab-details'.
 */
function slugifyHeading(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{M}\p{Nd}\p{Pc}\- \t]/gu, '').replace(/[ \t]/g, '-');
}

const ATX = /^\s{0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const SETEXT = /^\s{0,3}(=+|-+)\s*$/;

/** Heading ids (with GFM duplicate suffixes), IAL ids and HTML id/name attributes. */
function collectAnchors(lines, start = 0) {
  const ids = new Set();
  const headings = [];
  const counter = new Map();
  const addHeading = (text, line, level) => {
    const ial = text.match(/\s*\{:?\s*#([A-Za-z][\w-]*)[^}]*\}\s*$/);
    let id;
    if (ial) {
      id = ial[1];
      text = text.slice(0, ial.index);
    } else {
      const base = slugifyHeading(headingRawText(text));
      const n = (counter.has(base) ? counter.get(base) : -1) + 1;
      counter.set(base, n);
      id = n > 0 ? `${base}-${n}` : base;
    }
    ids.add(id);
    headings.push({ text, id, line, level });
  };
  const prose = proseLines(lines, start);
  prose.forEach((entry, i) => {
    const atx = entry.text.match(ATX);
    if (atx) addHeading(atx[2], entry.line, atx[1].length);
    const previous = prose[i - 1];
    if (!atx && SETEXT.test(entry.text) && previous && previous.line === entry.line - 1 && previous.text.trim()
      && !/^\s*([-*+>|#<]|\d+[.)]|[=-]+\s*$)/.test(previous.text)) {
      // The paragraph above was recorded as plain text; promote it to a heading.
      addHeading(previous.text.trim(), previous.line, entry.text.trim()[0] === '=' ? 1 : 2);
    }
    for (const m of entry.text.matchAll(/\{:?[^}{]*#([A-Za-z][\w-]*)[^}]*\}/g)) ids.add(m[1]);
    for (const m of entry.text.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/g)) ids.add(m[1]);
  });
  return { ids, headings };
}

/** Link and image targets outside code, with their kind and 1-based line. */
function collectTargets(lines, start = 0) {
  const targets = [];
  for (const { text, line } of proseLines(lines, start)) {
    let s = stripCodeSpans(text);
    for (const m of s.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g)) targets.push({ kind: 'image', target: m[1], line });
    for (const m of s.matchAll(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi)) targets.push({ kind: 'image', target: m[1], line });
    for (const m of s.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      for (const candidate of m[1].split(',')) {
        const target = candidate.trim().split(/\s+/)[0];
        if (target) targets.push({ kind: 'image', target, line });
      }
    }
    // Replace images first so a linked image ([![alt](img)](href)) still yields its href.
    s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, 'IMG');
    for (const m of s.matchAll(/\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g)) targets.push({ kind: m[1].startsWith('#') ? 'anchor' : 'link', target: m[1], line });
    for (const m of s.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) targets.push({ kind: m[1].startsWith('#') ? 'anchor' : 'link', target: m[1], line });
  }
  return targets;
}

/**
 * Resolves a lab-relative or site-root URL to a repository path. Both copies
 * resolve relative paths against labs/<slug>/: GitHub serves the README from
 * there, and the site page lives at /labs/<slug>/. Returns null for external
 * URLs and Liquid we cannot evaluate.
 */
function resolveLocal(root, slug, target) {
  let s = String(target).trim().replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');
  if (!s || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(s) || /\{\{|\{%/.test(s)) return null;
  s = s.split(/[?#]/)[0];
  try { s = decodeURI(s); } catch { /* keep the raw path */ }
  if (s.startsWith('/mcs-labs/')) s = s.slice('/mcs-labs'.length);
  const parts = s.split('/').filter(Boolean);
  return s.startsWith('/') ? path.join(root, ...parts) : path.join(root, 'labs', slug, ...parts);
}

/** Canvas size from a PNG or WebP header, or null for other formats. */
function imageSize(file) {
  let bytes;
  try { bytes = fs.readFileSync(file); } catch { return null; }
  if (bytes.length >= 24 && bytes.toString('ascii', 1, 4) === 'PNG') return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  if (bytes.length < 30 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8 ') return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
  return null;
}

function loadTerms(file = TERMS_FILE) {
  const raw = readText(file);
  if (!raw) return [];
  return JSON.parse(raw).terms.map(term => ({ ...term, regex: new RegExp(term.pattern, 'i') }));
}

/** Retired product names per term, ignoring URLs and lines that explain the rename. */
function findRetiredTerms(lines, terms) {
  const hits = new Map();
  lines.forEach((raw, i) => {
    if (RENAME_CONTEXT.test(raw)) return;
    const text = raw.replace(/https?:\/\/[^\s)>"'\]]+/g, ' ')
      .replace(/\]\([^)]*\)/g, ']')
      .replace(/\b(?:src|href|srcset)\s*=\s*["'][^"']*["']/gi, ' ');
    for (const term of terms) {
      if (!term.regex.test(text)) continue;
      if (!hits.has(term.term)) hits.set(term.term, { term, lines: [] });
      hits.get(term.term).lines.push(i + 1);
    }
  });
  return [...hits.values()];
}

/**
 * Text lines that must match between README and _labs copies, with their
 * file line numbers. Looser than the Zava Sales sync test, which pins one
 * lab exactly: README headings and table-of-contents link text may carry
 * emoji, their anchors gain a leading '-' (or U+FE0F then '-'), the site copy
 * links pages with Liquid while the README needs absolute URLs, and
 * indentation, blank lines and trailing spaces do not count.
 */
function comparableLines(lines, start = 0) {
  const headingEmoji = new RegExp(`^(#{1,6})[ \\t]+${EMOJI_RUN}[ \\t]+`, 'u');
  const linkEmoji = new RegExp(`\\[${EMOJI_RUN}[ \\t]+`, 'gu');
  const out = [];
  for (let i = start; i < lines.length; i++) {
    const text = lines[i].replace(/\r$/, '')
      .replace(headingEmoji, '$1 ')
      .replace(linkEmoji, '[')
      .replace(/\]\(#\uFE0F?-/g, '](#')
      // {{ '/x/' | relative_url }}, {{ site.baseurl }}/x/ and https://microsoft.github.io/mcs-labs/x/ are the same page.
      .replace(/\{\{\s*['"]([^'"]*)['"]\s*\|\s*(?:relative_url|absolute_url)\s*\}\}/g, '$1')
      .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '')
      .replace(/https?:\/\/microsoft\.github\.io\/mcs-labs(?=\/)/g, '')
      .replace(/\]\(\/mcs-labs(?=\/)/g, '](')
      // Cross-lab links: {% link _labs/x.md %}, ../x/README.md and /labs/x/ all mean lab x.
      .replace(/\{%\s*link\s+_labs\/([\w.-]+?)\.md\s*%\}/g, 'lab:$1')
      .replace(/\]\(\.\.\/([\w.-]+)\/(?:README\.md)?(?=[)#])/g, '](lab:$1')
      .replace(/\]\(\/labs\/([\w.-]+)\/?(?=[)#?])/g, '](lab:$1')
      .trim();
    if (text.trim() && !(out.length === 0 && /^---\s*$/.test(text))) out.push({ text, line: i + 1 });
  }
  return out;
}

/** Changed-line count (lines in either copy outside their longest common subsequence) and the first divergence. */
function diffStats(a, b) {
  const intern = new Map();
  const id = entry => { if (!intern.has(entry.text)) intern.set(entry.text, intern.size); return intern.get(entry.text); };
  const x = a.map(id);
  const y = b.map(id);
  let prev = new Int32Array(y.length + 1);
  let curr = new Int32Array(y.length + 1);
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) curr[j] = x[i - 1] === y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
    [prev, curr] = [curr, prev];
  }
  const common = prev[y.length];
  let first = 0;
  while (first < x.length && first < y.length && x[first] === y[first]) first++;
  return {
    changed: x.length + y.length - 2 * common,
    firstA: a[first] ? a[first].line : null,
    firstB: b[first] ? b[first].line : null,
  };
}

/** Lines of the section that starts with a heading containing `name`, up to the next heading of the same or higher level. */
function sectionLines(lines, headings, name) {
  const index = headings.findIndex(h => h.text.toLowerCase().includes(name));
  if (index < 0) return [];
  const level = headings[index].level;
  const next = headings.slice(index + 1).find(h => h.level <= level);
  return lines.slice(headings[index].line, next ? next.line - 1 : lines.length);
}

function parseLab(root, slug) {
  const lab = { slug };
  const siteFile = path.join(root, '_labs', `${slug}.md`);
  const readmeFile = path.join(root, 'labs', slug, 'README.md');
  const siteRaw = readText(siteFile);
  const readmeRaw = readText(readmeFile);
  if (siteRaw !== null) {
    const lines = siteRaw.split(/\r?\n/);
    let data = {};
    let parseError = null;
    try { data = matter(siteRaw).data; } catch (error) { parseError = error.message; }
    lab.site = { file: siteFile, rel: toPosix(root, siteFile), raw: siteRaw, lines, start: bodyStartIndex(lines), data, parseError };
  }
  if (readmeRaw !== null) {
    const lines = readmeRaw.split(/\r?\n/);
    lab.readme = { file: readmeFile, rel: toPosix(root, readmeFile), raw: readmeRaw, lines, start: bodyStartIndex(lines) };
  }
  lab.data = lab.site ? lab.site.data : {};
  lab.external = lab.data.lab_type === 'external' || lab.data.external === true || lab.data.section === 'external_labs';
  return lab;
}

const lineOf = (raw, regex) => {
  const index = raw.split(/\r?\n/).findIndex(line => regex.test(line));
  return index < 0 ? null : index + 1;
};

/**
 * Loads every lab plus the entities that reference labs. A labs/<slug>/
 * folder without README.md (for example the legacy event pages that only
 * have index.md) is not a lab.
 */
function buildContext(root = ROOT, { termsFile = TERMS_FILE } = {}) {
  const slugs = new Set(listDir(path.join(root, '_labs')).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)));
  for (const dir of listDir(path.join(root, 'labs'))) if (isFile(path.join(root, 'labs', dir, 'README.md'))) slugs.add(dir);
  const labs = new Map([...slugs].sort().map(slug => [slug, parseLab(root, slug)]));

  const modules = new Map();
  for (const f of listDir(path.join(root, '_modules')).filter(name => name.endsWith('.md'))) {
    const file = path.join(root, '_modules', f);
    const raw = readText(file) || '';
    let data = {};
    try { data = matter(raw).data; } catch { /* reported nowhere: modules are out of scope */ }
    const entry = { slug: f.slice(0, -3), file, raw, data };
    modules.set(entry.slug, entry);
    if (data.slug) modules.set(data.slug, entry);
  }

  const events = new Map();
  for (const dir of ['_events', '_workshops']) {
    for (const f of listDir(path.join(root, dir)).filter(name => name.endsWith('.md'))) {
      const file = path.join(root, dir, f);
      const raw = readText(file) || '';
      let data = {};
      try { data = matter(raw).data; } catch { /* an unreadable event cannot reference labs */ }
      const id = data.event_id || f.slice(0, -3);
      events.set(id, { id, file, raw, data, listed: data.unlisted !== true, deprecated: data.deprecated === true });
    }
  }

  // Agenda rows first; an event's own `labs:` list is the fallback when no agenda exists.
  const refs = [];
  const agendaIds = new Set();
  const agendaDir = path.join(root, '_data', 'agendas');
  for (const f of listDir(agendaDir).filter(name => /\.ya?ml$/.test(name))) {
    const file = path.join(agendaDir, f);
    const raw = readText(file) || '';
    let doc;
    try { doc = yaml.load(raw); } catch (error) { refs.push({ kind: 'parse-error', file, message: error.message }); continue; }
    const eventId = (doc && doc.event_id) || f.replace(/\.ya?ml$/, '');
    agendaIds.add(eventId);
    agendaIds.add(f.replace(/\.ya?ml$/, ''));
    for (const row of (doc && doc.schedule) || []) {
      if (!row || !row.slug) continue;
      const line = lineOf(raw, new RegExp(`^\\s*(?:-\\s*)?slug:\\s*["']?${escapeRe(row.slug)}["']?\\s*$`));
      if (row.type === 'lab') refs.push({ kind: 'lab', eventId, file, line, slug: row.slug, label: row.label, duration: row.duration });
      if (row.type === 'module') {
        refs.push({ kind: 'module', eventId, file, line, slug: row.slug, label: row.label });
        if (typeof row.lab === 'string') refs.push({ kind: 'lab', eventId, file, line, slug: row.lab, label: row.label });
      }
    }
  }
  for (const event of events.values()) {
    if (agendaIds.has(event.id) || !Array.isArray(event.data.labs)) continue;
    for (const item of event.data.labs) {
      const slug = typeof item === 'string' ? item : item && item.slug;
      if (!slug) continue;
      const line = lineOf(event.raw, new RegExp(`(?:slug:\\s*|-\\s+)["']?${escapeRe(slug)}["']?\\s*$`));
      refs.push({ kind: 'lab', eventId: event.id, file: event.file, line, slug, label: item.label });
    }
  }

  // Basename corpus for orphan detection: any mention in content or templates counts as a use.
  const corpusParts = [];
  for (const lab of labs.values()) corpusParts.push(lab.site ? lab.site.raw : '', lab.readme ? lab.readme.raw : '');
  for (const dir of ['_modules', '_events', '_workshops', '_includes', '_layouts', '_data', 'labs']) {
    const walk = folder => {
      for (const entry of listDir(folder)) {
        const full = path.join(folder, entry);
        if (/\.(md|html|ya?ml|json)$/i.test(entry)) corpusParts.push(readText(full) || '');
        else if (!path.extname(entry) && fs.statSync(full).isDirectory() && entry !== 'images') walk(full);
      }
    };
    walk(path.join(root, dir));
  }

  const testFiles = listDir(path.join(root, 'scripts')).filter(f => f.endsWith('.test.js') && f !== 'lab-audit.test.js')
    .map(f => ({ file: f, text: readText(path.join(root, 'scripts', f)) || '' }));

  return { root, labs, modules, events, refs, corpus: corpusParts.join('\n'), testFiles, terms: loadTerms(termsFile) };
}

/** Ids that _includes/lab-missions.html renders, so in-page links to missions resolve. */
function missionAnchors(data) {
  const ids = ['lab-v2-root', 'lab-main', 'lab-title', 'lab-route', 'lab-ready', 'ready-title', 'lab-finish', 'finish-title', 'lab-reflection'];
  const lab = data && data.mission_lab;
  for (const mission of (lab && Array.isArray(lab.missions) ? lab.missions : [])) {
    if (!mission || !mission.id) continue;
    ids.push(mission.id, `${mission.id}-title`);
    (mission.steps || []).forEach((step, i) => ids.push(`${mission.id}-${i + 1}-prompt`));
  }
  return ids;
}

/** Validates a site-copy link: lab, module, event and workshop pages are permalinks, not files. */
function siteLinkExists(ctx, resolved) {
  if (fs.existsSync(resolved)) return true;
  const rel = toPosix(ctx.root, resolved).replace(/\/(index\.html)?$/, '');
  const page = rel.match(/^(labs|modules|events|workshops)\/([^/]+)$/);
  if (!page) return null;
  const [, kind, name] = page;
  if (kind === 'labs') return Boolean(ctx.labs.get(name) && ctx.labs.get(name).site);
  if (kind === 'modules') return ctx.modules.has(name);
  return ctx.events.has(name) || fs.existsSync(path.join(ctx.root, `_${kind}`, `${name}.md`));
}

const tableCells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim().replace(/\*\*/g, ''));

/**
 * Label/value pairs from a Lab Details section: the house column table
 * (| Level | Persona | Duration | ... | then one value row) or "**Duration:** 30 min" lines.
 */
function detailFields(lines) {
  const fields = [];
  const rows = lines.filter(line => /^\s*\|/.test(line));
  if (rows.length >= 3 && /^[\s|:-]+$/.test(rows[1])) {
    const header = tableCells(rows[0]);
    tableCells(rows[2]).forEach((value, i) => { if (header[i]) fields.push({ label: header[i], value }); });
  }
  for (const line of lines) {
    const m = line.match(/^\s*[-*]?\s*\**([A-Za-z][\w ]{1,20}?)\**\s*:\s*\**\s*(.+)$/);
    if (m) fields.push({ label: m[1], value: m[2] });
  }
  return fields;
}

/** "45 minutes", "1 hour", "1.5 hrs", "1 h 30 min" → minutes; ranges use the first number. */
function statedMinutes(value) {
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(?:h|hrs?|hours?)\b/i);
  const mins = value.match(/(\d+)\s*(?:[-–]\s*\d+\s*)?(?:m|mins?|minutes?)\b/i);
  return (hours ? Math.round(Number(hours[1]) * 60) : 0) + (mins ? Number(mins[1]) : 0);
}

function wordCount(lines, start) {
  return proseLines(lines, start).reduce((sum, { text }) =>
    sum + (stripCodeSpans(text).replace(/<[^>]+>|!\[[^\]]*\]\([^)]*\)|\]\([^)]*\)|[#>*|_`-]/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu) || []).length, 0);
}

function auditLab(ctx, slug) {
  const findings = [];
  const add = (severity, code, file, line, message) => findings.push({ slug, severity, code, file: file || null, line: line || null, message });
  const lab = ctx.labs.get(slug);
  if (!lab) {
    add('error', 'lab-not-found', null, null, `No _labs/${slug}.md or labs/${slug}/README.md.`);
    return findings;
  }
  const { site, readme, data } = lab;
  const missions = data.lab_format === 'missions';

  // Front matter: the site copy is the only one Jekyll publishes.
  if (!site) {
    add('warn', 'copy-missing-site', `labs/${slug}/README.md`, null, `README only: create _labs/${slug}.md (front matter plus the site copy) to publish this lab.`);
  } else if (site.parseError) {
    add('error', 'fm-invalid', site.rel, 1, `Front matter does not parse: ${preview(site.parseError, 120)}`);
  } else {
    const fmLine = key => lineOf(site.raw, new RegExp(`^${escapeRe(key)}:`)) || 1;
    for (const key of REQUIRED_KEYS) if (data[key] === undefined || data[key] === null || data[key] === '') add('error', 'fm-missing', site.rel, 1, `Missing required front matter: ${key}.`);
    if (data.journeys !== undefined) {
      const journeys = Array.isArray(data.journeys) ? data.journeys : [data.journeys];
      const bad = journeys.filter(j => !VALID_JOURNEYS.includes(j));
      if (!Array.isArray(data.journeys) || bad.length) add('error', 'fm-invalid', site.rel, fmLine('journeys'), `journeys must be a list of ${VALID_JOURNEYS.join(', ')}${bad.length ? `; got ${bad.join(', ')}` : ''}.`);
    }
    if (data.difficulty !== undefined && !VALID_DIFFICULTIES.includes(data.difficulty)) add('error', 'fm-invalid', site.rel, fmLine('difficulty'), `difficulty must be 100, 200 or 300 (a number); got ${JSON.stringify(data.difficulty)}.`);
    if (data.duration !== undefined && !(Number.isInteger(data.duration) && data.duration > 0)) add('error', 'fm-invalid', site.rel, fmLine('duration'), `duration must be whole minutes; got ${JSON.stringify(data.duration)}.`);
    if (data.section !== undefined && !VALID_SECTIONS.includes(data.section)) add('warn', 'fm-invalid', site.rel, fmLine('section'), `section "${data.section}" is not one of ${VALID_SECTIONS.join(', ')}; the lab badge shows the raw value.`);
    if (data.lab_format !== undefined && !missions) add('error', 'fm-invalid', site.rel, fmLine('lab_format'), `lab_format "${data.lab_format}" is unknown; omit it for the classic layout or use "missions".`);
    if (!data.module) add('warn', 'fm-missing', site.rel, 1, 'No module: the lab will not appear on a module page or get module prev/next navigation.');
    else if (!ctx.modules.has(data.module)) add('error', 'module-missing', site.rel, fmLine('module'), `module "${data.module}" has no _modules/${data.module}.md.`);
    if (data.layout !== undefined && data.layout !== 'lab') add('warn', 'fm-layout', site.rel, fmLine('layout'), `layout "${data.layout}" bypasses the lab layout; remove it.`);
    for (const key of MANUAL_DATE_KEYS) if (data[key] !== undefined) add('warn', 'fm-manual-date', site.rel, fmLine(key), `"${key}" is derived from Git by _plugins/content_last_updated.rb; remove it.`);
    if (data.unlisted === true && (data.search !== false || data.sitemap !== false)) add('warn', 'fm-unlisted', site.rel, fmLine('unlisted'), 'unlisted labs also need search: false and sitemap: false to stay out of search and the sitemap.');
    if (data.order !== undefined) {
      const twins = [...ctx.labs.values()].filter(other => other.slug !== slug && other.site && other.data.order === data.order).map(other => other.slug);
      if (twins.length) add('info', 'fm-order-duplicate', site.rel, fmLine('order'), `order ${data.order} is shared with ${twins.join(', ')}; sorting between them is arbitrary.`);
    }
  }
  if (!readme && !lab.external) add('warn', 'copy-missing-readme', site ? site.rel : null, null, `No labs/${slug}/README.md: the lab cannot be read on GitHub and CI cannot pair edits.`);

  // The two copies must say the same thing; only README heading emoji and their anchors differ.
  if (site && readme) {
    const diff = diffStats(comparableLines(site.lines, site.start), comparableLines(readme.lines, readme.start));
    if (diff.changed) add('warn', 'copy-drift', site.rel, diff.firstA, `${diff.changed} line(s) differ from ${readme.rel} (first difference: ${site.rel}:${diff.firstA || 'end'} vs README:${diff.firstB || 'end'}).`);
  }

  const copies = [site, readme].filter(Boolean);
  for (const copy of copies) {
    const isSite = copy === site;
    const { ids, headings } = collectAnchors(copy.lines, copy.start);
    if (isSite && missions) for (const id of missionAnchors(data)) ids.add(id);
    if (isSite) {
      const emoji = headings.filter(h => PICTOGRAPH.test(h.text)).map(h => h.line);
      if (emoji.length) add('warn', 'heading-emoji', copy.rel, emoji[0], `${emoji.length} heading(s) with emoji (lines ${lineList(emoji)}); emoji belong in the README only and change anchor ids.`);
    }

    const shared = new Set();
    for (const { kind, target, line } of collectTargets(copy.lines, copy.start)) {
      if (/\{\{|\{%/.test(target)) continue;
      if (kind === 'anchor') {
        let id = target.slice(1);
        try { id = decodeURIComponent(id); } catch { /* keep the raw id */ }
        if (id && !ids.has(id)) add('error', 'anchor-broken', copy.rel, line, `In-page link ${preview(target, 50)} has no matching heading or id.`);
        continue;
      }
      const resolved = resolveLocal(ctx.root, slug, target);
      if (!resolved) continue;
      if (kind === 'image' || IMAGE_EXT.test(resolved)) {
        if (!isFile(resolved)) add('error', 'image-missing', copy.rel, line, `Image ${preview(target, 70)} does not exist (looked for ${toPosix(ctx.root, resolved)}).`);
        else if (!toPosix(ctx.root, resolved).startsWith(`labs/${slug}/`)) shared.add(toPosix(ctx.root, resolved));
        continue;
      }
      const exists = isSite ? siteLinkExists(ctx, resolved) : fs.existsSync(resolved);
      if (exists === false) add('warn', 'link-missing', copy.rel, line, `Link ${preview(target, 70)} points at ${toPosix(ctx.root, resolved)}, which does not exist.`);
    }
    if (shared.size) add('info', 'image-shared', copy.rel, null, `Uses ${shared.size} image(s) from other folders: ${[...shared].slice(0, 4).join(', ')}${shared.size > 4 ? ', …' : ''}. Recapture or move them with care.`);

    for (const { term, lines } of findRetiredTerms(copy.lines, ctx.terms)) {
      add('warn', 'term-retired', copy.rel, lines[0], `"${term.term}" is retired (${term.since}); use "${term.replacement}". Lines ${lineList(lines)}.`);
    }

    // Lab Details restates duration and level; it drifts when front matter changes.
    if (site && !site.parseError) {
      for (const { label, value } of detailFields(sectionLines(copy.lines, headings, 'lab details'))) {
        if (/duration|time/i.test(label) && Number.isInteger(data.duration)) {
          const stated = statedMinutes(value);
          if (stated && stated !== data.duration) add('warn', 'details-mismatch', copy.rel, null, `Lab Details says ${stated} minutes; front matter duration is ${data.duration}.`);
        }
        if (/level|difficulty/i.test(label) && VALID_DIFFICULTIES.includes(data.difficulty)) {
          const level = value.match(/\b(100|200|300|400)\b/);
          if (level && Number(level[1]) !== data.difficulty) add('warn', 'details-mismatch', copy.rel, null, `Lab Details says level ${level[1]}; front matter difficulty is ${data.difficulty}.`);
        }
      }
    }
  }

  // Images nobody references are capture leftovers; the corpus also covers other labs and templates.
  const imageDir = path.join(ctx.root, 'labs', slug, 'images');
  const orphans = listDir(imageDir).filter(f => IMAGE_EXT.test(f) && !ctx.corpus.includes(f));
  if (orphans.length) add('info', 'image-orphan', `labs/${slug}/images`, null, `${orphans.length} image(s) are not referenced anywhere: ${orphans.slice(0, 5).join(', ')}${orphans.length > 5 ? ', …' : ''}.`);

  // Reading time over half the lab duration is the wall of text people skip.
  if (site && !missions && Number.isInteger(data.duration)) {
    const words = wordCount(site.lines, site.start);
    const minutes = Math.round(words / READING_WPM);
    if (minutes * 2 > data.duration) add('info', 'size-words', site.rel, null, `${words} words is about ${minutes} min of reading in a ${data.duration}-min lab. Consider trimming, or the missions format.`);
  }

  if (missions && !ctx.testFiles.some(t => t.text.includes(slug))) add('warn', 'missions-test', site ? site.rel : null, null, 'No scripts/*.test.js covers this missions lab; add prompt fingerprints and contract checks like scripts/lab-missions.test.js.');
  if (missions && site && !site.parseError) findings.push(...auditMissions(ctx, lab));

  const uses = ctx.refs.filter(ref => ref.kind === 'lab' && ref.slug === slug);
  if (uses.length) {
    // One entry per event; a module row and an explicit lab row for the same lab collapse together.
    const byEvent = new Map();
    for (const ref of uses) byEvent.set(ref.eventId, byEvent.get(ref.eventId) || ref.duration);
    const summary = [...byEvent].map(([eventId, duration]) => `${eventId}${duration ? ` (${duration} min slot)` : ''}`);
    add('info', 'agenda-usage', site ? site.rel : null, null, `Used by ${summary.join(', ')}. Check those agendas when duration or scope changes.`);
  }
  return findings;
}

/** Fenced ```text blocks, de-indented, in order: the copy-ready prompts of a missions lab. */
function fencedPrompts(lines, start = 0) {
  const prompts = [];
  for (let i = start; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)```text\s*$/);
    if (!open) continue;
    const body = [];
    let j = i + 1;
    for (; j < lines.length && !/^\s*```\s*$/.test(lines[j]); j++) body.push(lines[j].startsWith(open[1]) ? lines[j].slice(open[1].length) : lines[j].trimStart());
    prompts.push(body.join('\n').replace(/\r/g, ''));
    i = j;
  }
  return prompts;
}

/**
 * The opt-in missions contract (docs/NEW_LAB_CHECKLIST.md): keys the layout
 * renders, timing, one correct answer per check, verbatim prompts in both
 * copies, and screenshots whose declared size matches the file.
 */
function auditMissions(ctx, lab) {
  const findings = [];
  const { slug, site, readme, data } = lab;
  const add = (code, message, severity = 'error', line = null) => findings.push({ slug, severity, code, file: site.rel, line, message });
  const ml = data.mission_lab;
  if (!ml || typeof ml !== 'object') {
    add('missions-contract', 'lab_format: missions needs a mission_lab block.', 'error', lineOf(site.raw, /^lab_format:/));
    return findings;
  }
  const at = text => lineOf(site.raw, new RegExp(escapeRe(text)));
  const need = (object, keys, where) => {
    for (const key of keys) {
      const value = object ? object[key] : undefined;
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) add('missions-contract', `${where} is missing ${key}.`);
    }
  };
  need(ml, ['headline', 'headline_emphasis', 'promise', 'scenario', 'prerequisites', 'pacing', 'hero_image', 'missions', 'finish'], 'mission_lab');
  if (!Array.isArray(ml.sources) || !ml.sources.length) add('missions-contract', 'mission_lab.sources should cite the docs that ground the lab and its knowledge checks.', 'warn');
  else ml.sources.forEach((source, i) => need(source, ['title', 'url'], `sources[${i + 1}]`));

  const missions = Array.isArray(ml.missions) ? ml.missions : [];
  const seen = new Set();
  let optionalSeen = false;
  const images = [];
  const prompts = [];
  if (ml.hero_image) {
    images.push({ image: ml.hero_image, where: 'hero_image', hero: true });
    if (ml.hero_image.src_dark) add('missions-image', 'hero_image must not have src_dark: the layout renders it once as the priority image.');
  }
  for (const [index, mission] of missions.entries()) {
    const where = `mission ${mission && mission.id ? `"${mission.id}"` : index + 1}`;
    if (!mission || typeof mission !== 'object') { add('missions-contract', `${where} is not a mapping.`); continue; }
    const line = mission.id ? at(`id: ${mission.id}`) : null;
    need(mission, ['id', 'verb', 'title', 'minutes', 'tool', 'brief', 'outcome', 'steps', 'reveal'], where);
    if (mission.id && !/^[a-z][a-z0-9-]*$/.test(mission.id)) add('missions-contract', `${where}: id must match ^[a-z][a-z0-9-]*$ because it becomes an anchor and progress key.`, 'error', line);
    if (mission.id && seen.has(mission.id)) add('missions-contract', `${where}: duplicate id.`, 'error', line);
    seen.add(mission.id);
    if (mission.optional) optionalSeen = true;
    else if (optionalSeen) add('missions-contract', `${where}: core missions must come before optional extensions.`, 'error', line);
    if (mission.minutes !== undefined && !(Number.isInteger(mission.minutes) && mission.minutes > 0)) add('missions-contract', `${where}: minutes must be a positive whole number.`, 'error', line);

    for (const [i, step] of (Array.isArray(mission.steps) ? mission.steps : []).entries()) {
      need(step, ['title', 'instruction'], `${where} step ${i + 1}`);
      if (step && step.prompt) prompts.push(String(step.prompt));
      if (step && step.screenshot) {
        images.push({ image: step.screenshot, where: `${where} step ${i + 1} screenshot` });
        if (!step.screenshot.title) add('missions-image', `${where} step ${i + 1} screenshot needs title: it labels the "Show me" disclosure.`);
      }
    }
    if (mission.reveal) {
      need(mission.reveal, ['title', 'line', 'explanation'], `${where} reveal`);
      if (!Array.isArray(mission.reveal.flow) || mission.reveal.flow.length < 2) add('missions-contract', `${where} reveal.flow needs at least two steps.`, 'error', line);
    }
    if (mission.check) {
      need(mission.check, ['question', 'options'], `${where} check`);
      const options = Array.isArray(mission.check.options) ? mission.check.options : [];
      const correct = options.filter(option => option && option.correct === true).length;
      if (options.length && correct !== 1) add('missions-contract', `${where} check has ${correct} correct options; exactly one must be correct: true.`, 'error', line);
      options.forEach((option, i) => {
        need(option, ['text', 'feedback'], `${where} check option ${i + 1}`);
        if (option && typeof option.correct !== 'boolean') add('missions-contract', `${where} check option ${i + 1}: correct must be true or false.`, 'error', line);
      });
    }
    (Array.isArray(mission.stuck) ? mission.stuck : []).forEach((item, i) => need(item, ['problem', 'solution'], `${where} stuck ${i + 1}`));
  }

  const core = missions.filter(mission => mission && !mission.optional).reduce((sum, mission) => sum + (Number(mission.minutes) || 0), 0);
  if (Number.isInteger(data.duration) && core !== data.duration) add('missions-minutes', `Core mission minutes add up to ${core}; front matter duration is ${data.duration}. Optional missions do not count.`, 'error', lineOf(site.raw, /^duration:/));

  if (ml.finish) {
    need(ml.finish, ['title', 'message', 'takeaways', 'reflection'], 'finish');
    (Array.isArray(ml.finish.takeaways) ? ml.finish.takeaways : []).forEach((item, i) => need(item, ['label', 'text'], `finish takeaway ${i + 1}`));
  }

  // Prompts are rendered from front matter, but GitHub readers and feed consumers only see the body.
  // A YAML block scalar may keep a trailing newline the fenced copy cannot show, so compare trimmed ends.
  const normPrompt = text => String(text).replace(/\r/g, '').replace(/\s+$/, '');
  for (const copy of [site, readme].filter(Boolean)) {
    const fenced = fencedPrompts(copy.lines, copy.start).map(normPrompt);
    let cursor = 0;
    for (const prompt of prompts.map(normPrompt)) {
      const found = fenced.indexOf(prompt, cursor);
      if (found < 0) {
        const anywhere = fenced.includes(prompt);
        findings.push({ slug, severity: 'error', code: 'missions-prompt', file: copy.rel, line: null, message: `Prompt "${preview(prompt)}" ${anywhere ? 'is out of order' : 'is missing or differs'} in the body's \`\`\`text blocks.` });
      } else cursor = found + 1;
    }
  }

  for (const { image, where, hero } of images) {
    need(image, ['src', 'alt', 'width', 'height', 'caption'], where);
    const variants = [image.src, hero ? null : image.src_dark].filter(Boolean);
    if (image.src_dark && image.src_dark === image.src) add('missions-image', `${where}: src_dark must be a separate dark capture.`);
    for (const src of variants) {
      if (!String(src).startsWith(`/labs/${slug}/images/`)) { add('missions-image', `${where}: ${src} must live under /labs/${slug}/images/ so the feed can find it.`); continue; }
      const file = path.join(ctx.root, ...String(src).split('/').filter(Boolean));
      if (!isFile(file)) { add('missions-image', `${where}: ${src} does not exist.`); continue; }
      const size = imageSize(file);
      if (size && (size[0] !== image.width || size[1] !== image.height)) add('missions-image', `${where}: ${path.posix.basename(src)} is ${size[0]}x${size[1]} but declares ${image.width}x${image.height}; layout space will be wrong.`);
      const base = path.posix.basename(src);
      for (const copy of [site, readme].filter(Boolean)) {
        if (!copy.lines.slice(copy.start).join('\n').includes(`images/${base}`)) findings.push({ slug, severity: 'error', code: 'missions-image', file: copy.rel, line: null, message: `${base} is not referenced in the body as images/${base}; feed consumers and GitHub readers will not see it.` });
      }
    }
    if (!hero && image.src_dark && image.src_dark !== image.src) {
      const pair = [image.src, image.src_dark].map(src => readBytes(path.join(ctx.root, ...String(src).split('/').filter(Boolean))));
      if (pair[0] && pair[1] && pair[0].equals(pair[1])) add('missions-image', `${where}: src and src_dark are the same bytes; capture the dark theme separately.`);
    }
  }
  return findings;
}

const readBytes = file => { try { return fs.readFileSync(file); } catch { return null; } };

/**
 * Agendas, event fallbacks and module companions that point at labs. A
 * listed event must not send attendees to an unlisted preview lab.
 * `wanted` limits findings to those slugs; null means every reference.
 */
function auditReferences(ctx, wanted) {
  const findings = [];
  const include = slug => !wanted || wanted.has(slug);
  const add = (slug, severity, code, file, line, message) => findings.push({ slug, severity, code, file: toPosix(ctx.root, file), line: line || null, message });
  for (const ref of ctx.refs) {
    if (ref.kind === 'parse-error') {
      if (!wanted) add('(agendas)', 'error', 'agenda-invalid', ref.file, null, `Agenda YAML does not parse: ${preview(ref.message, 120)}`);
      continue;
    }
    if (!include(ref.slug)) continue;
    const event = ctx.events.get(ref.eventId);
    const listed = Boolean(event && event.listed && !event.deprecated);
    if (ref.kind === 'module') {
      if (!ctx.modules.has(ref.slug)) add(ref.slug, 'error', 'agenda-unknown-module', ref.file, ref.line, `${ref.eventId} references module "${ref.slug}", which has no _modules/${ref.slug}.md.`);
      continue;
    }
    const lab = ctx.labs.get(ref.slug);
    if (!lab || !lab.site) add(ref.slug, 'error', 'agenda-unknown-lab', ref.file, ref.line, `${ref.eventId} references lab "${ref.slug}", which has no _labs/${ref.slug}.md.`);
    else if (listed && lab.data.unlisted === true) add(ref.slug, 'error', 'agenda-unlisted-lab', ref.file, ref.line, `Listed event ${ref.eventId} sends attendees to unlisted lab "${ref.slug}". Publish the lab or use it only in an unlisted preview event.`);
    else if (listed && lab.data.deprecated === true) add(ref.slug, 'warn', 'agenda-deprecated-lab', ref.file, ref.line, `Listed event ${ref.eventId} still uses deprecated lab "${ref.slug}".`);
  }
  for (const module of new Set(ctx.modules.values())) {
    const slug = module.data.lab;
    if (typeof slug !== 'string' || !include(slug)) continue;
    const lab = ctx.labs.get(slug);
    if (!lab || !lab.site) add(slug, 'error', 'module-lab-missing', module.file, lineOf(module.raw, /^lab:/), `Module "${module.slug}" names companion lab "${slug}", which has no _labs/${slug}.md.`);
  }
  return findings;
}

const severityRank = severity => SEVERITIES.indexOf(severity);

function sortFindings(findings) {
  const unique = new Map(findings.map(f => [JSON.stringify([f.slug, f.code, f.file, f.line, f.message]), f]));
  return [...unique.values()].sort((a, b) => a.slug.localeCompare(b.slug) || severityRank(a.severity) - severityRank(b.severity)
    || String(a.file).localeCompare(String(b.file)) || (a.line || 0) - (b.line || 0) || a.code.localeCompare(b.code));
}

/**
 * Audits `slugs` (null for every lab). Reference checks follow the same
 * scope unless `allReferences` is set, for example when an agenda changed.
 */
function auditAll({ root = ROOT, slugs = null, termsFile = TERMS_FILE, allReferences = false } = {}) {
  const ctx = buildContext(root, { termsFile });
  const wanted = slugs ? new Set(slugs) : null;
  const labs = wanted ? [...wanted].sort() : [...ctx.labs.keys()];
  const findings = labs.flatMap(slug => auditLab(ctx, slug));
  findings.push(...auditReferences(ctx, allReferences ? null : wanted));
  const sorted = sortFindings(findings);
  const summary = Object.fromEntries(SEVERITIES.map(s => [s, sorted.filter(f => f.severity === s).length]));
  return { labs, findings: sorted, summary };
}

const filterFindings = (findings, minSeverity) => findings.filter(f => severityRank(f.severity) <= severityRank(minSeverity));
const location = f => f.file ? `${f.file}${f.line ? `:${f.line}` : ''}` : '';
const summaryLine = (result, shown) => `Audited ${result.labs.length} lab(s): ${result.summary.error} error(s), ${result.summary.warn} warning(s), ${result.summary.info} info.${shown < result.findings.length ? ` Showing ${shown}; lower --min-severity to see the rest.` : ''}`;

function formatText(result, { minSeverity = 'info' } = {}) {
  const shown = filterFindings(result.findings, minSeverity);
  const out = [];
  let current = null;
  for (const f of shown) {
    if (f.slug !== current) { out.push(current === null ? f.slug : `\n${f.slug}`); current = f.slug; }
    out.push(`  ${f.severity.padEnd(5)}  ${f.code}  ${location(f)}${location(f) ? '  ' : ''}${f.message}`);
  }
  if (out.length) out.push('');
  out.push(summaryLine(result, shown.length));
  return out.join('\n');
}

/** A table for issue and pull request bodies. */
function formatMarkdown(result, { minSeverity = 'info' } = {}) {
  const shown = filterFindings(result.findings, minSeverity);
  const cell = text => String(text).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  const icon = { error: '🔴 error', warn: '🟡 warn', info: '⚪ info' };
  const out = ['## Lab audit', '', summaryLine(result, shown.length), ''];
  if (shown.length) {
    out.push('| Lab | Severity | Code | Location | Finding |', '| --- | --- | --- | --- | --- |');
    for (const f of shown) out.push(`| \`${f.slug}\` | ${icon[f.severity]} | \`${f.code}\` | ${location(f) ? `\`${cell(location(f))}\`` : ''} | ${cell(f.message)} |`);
  }
  return out.join('\n');
}

const USAGE = `Usage: node scripts/lab-audit.js [slug ...] [options]

Audits labs in both formats: front matter, README and _labs copies, anchors,
images, links, retired product names, agenda references and, for
lab_format: missions, the missions contract.

  slug ...                 Labs to audit (default: every lab)
  --all                    Audit every lab (the default without slugs)
  --changed[=<base>]       Labs changed since <base> (default origin/main), plus uncommitted work
  --format <text|json|markdown>
  --min-severity <info|warn|error>
                           Default: info for named or changed labs and JSON, warn otherwise
  --strict                 Exit 1 on warnings as well as errors
  -h, --help

Exit codes: 0 clean, 1 errors (or warnings with --strict), 2 usage error.`;

function parseArgs(argv) {
  const opts = { slugs: [], all: false, changed: null, format: 'text', minSeverity: null, strict: false, help: false, errors: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [flag, inline] = arg.startsWith('--') && arg.includes('=') ? [arg.slice(0, arg.indexOf('=')), arg.slice(arg.indexOf('=') + 1)] : [arg, undefined];
    const value = () => inline !== undefined ? inline : argv[++i];
    if (flag === '-h' || flag === '--help') opts.help = true;
    else if (flag === '--all') opts.all = true;
    else if (flag === '--strict') opts.strict = true;
    else if (flag === '--changed') opts.changed = inline || 'origin/main';
    else if (flag === '--format') opts.format = value();
    else if (flag === '--min-severity') opts.minSeverity = value();
    else if (flag.startsWith('-')) opts.errors.push(`Unknown option: ${arg}`);
    else {
      // Accept a slug or a path to either copy (_labs/<slug>.md, labs/<slug>/README.md).
      const fromPath = arg.match(/(?:^|[\\/])_labs[\\/]([^\\/]+?)\.md$/) || arg.match(/(?:^|[\\/])labs[\\/]([^\\/]+)/);
      opts.slugs.push(fromPath ? fromPath[1] : arg.replace(/\.md$/, ''));
    }
  }
  if (!['text', 'json', 'markdown'].includes(opts.format)) opts.errors.push(`--format must be text, json or markdown; got ${opts.format}`);
  if (opts.minSeverity !== null && !SEVERITIES.includes(opts.minSeverity)) opts.errors.push(`--min-severity must be info, warn or error; got ${opts.minSeverity}`);
  if (opts.all && opts.slugs.length) opts.errors.push('Use either --all or slugs, not both.');
  if (opts.minSeverity === null) opts.minSeverity = opts.slugs.length || opts.changed || opts.format === 'json' ? 'info' : 'warn';
  return opts;
}

/** Maps changed repo paths to lab slugs, and flags changes that can break lab references. */
function classifyChanges(root, files) {
  const slugs = new Set();
  let references = false;
  for (const file of files.map(f => f.replace(/\\/g, '/'))) {
    const site = file.match(/^_labs\/([^/]+)\.md$/);
    const folder = file.match(/^labs\/([^/]+)\/(.+)$/);
    if (site) slugs.add(site[1]);
    // labs/ also holds legacy event pages (index.md); only real lab folders count.
    else if (folder && (folder[2] === 'README.md' || isFile(path.join(root, 'labs', folder[1], 'README.md')) || isFile(path.join(root, '_labs', `${folder[1]}.md`)))) slugs.add(folder[1]);
    if (/^(_data\/agendas|_events|_workshops|_modules)\//.test(file)) references = true;
  }
  return { slugs: [...slugs].sort(), references };
}

/** Lab slugs touched since `base`, including uncommitted and untracked files, and whether references changed. */
function changedLabs(root, base) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).split(/\r?\n/).filter(Boolean);
  return classifyChanges(root, [...git(['diff', '--name-only', `${base}...HEAD`]), ...git(['diff', '--name-only', 'HEAD']), ...git(['ls-files', '--others', '--exclude-standard'])]);
}

function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  if (opts.help) { console.log(USAGE); return 0; }
  if (opts.errors.length) { console.error(`${opts.errors.join('\n')}\n\n${USAGE}`); return 2; }
  let slugs = opts.slugs.length ? opts.slugs : null;
  let allReferences = false;
  if (opts.changed) {
    let changed;
    try { changed = changedLabs(ROOT, opts.changed); } catch (error) {
      console.error(`Cannot list changes since ${opts.changed}: ${String(error.stderr || error.message).trim()}\nFetch it first (git fetch origin) or pass --changed=<base>.`);
      return 2;
    }
    slugs = [...new Set([...(slugs || []), ...changed.slugs])];
    allReferences = changed.references;
    if (!slugs.length && !allReferences) { console.log(`No lab, agenda, event or module changes since ${opts.changed}.`); return 0; }
  }
  const result = auditAll({ slugs, allReferences });
  if (opts.format === 'json') console.log(JSON.stringify({ ...result, findings: filterFindings(result.findings, opts.minSeverity) }, null, 2));
  else if (opts.format === 'markdown') console.log(formatMarkdown(result, opts));
  else console.log(formatText(result, opts));
  return result.summary.error || (opts.strict && result.summary.warn) ? 1 : 0;
}

if (require.main === module) process.exitCode = main();

module.exports = {
  SEVERITIES,
  bodyStartIndex,
  proseLines,
  headingRawText,
  slugifyHeading,
  collectAnchors,
  collectTargets,
  resolveLocal,
  imageSize,
  loadTerms,
  findRetiredTerms,
  comparableLines,
  diffStats,
  detailFields,
  statedMinutes,
  fencedPrompts,
  buildContext,
  auditLab,
  auditMissions,
  auditReferences,
  auditAll,
  formatText,
  formatMarkdown,
  parseArgs,
  classifyChanges,
  changedLabs,
  main,
};
