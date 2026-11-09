'use strict';

// Copyable prompts are pasted verbatim into Copilot, so they should read as a
// person would type them. A hard wrap in the middle of a sentence (a long line
// with no closing punctuation followed by a lowercase continuation) leaks the
// source file's line length into the learner's prompt.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const labsDir = path.join(root, '_labs');

function midSentenceWraps(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const hits = [];
  for (let i = 1; i < lines.length; i++) {
    const prev = lines[i - 1].trim();
    const cur = lines[i].trim();
    if (prev.length < 40 || !cur) continue;
    if (/[.!?:;]["')\]]?$/.test(prev)) continue;
    if (/^[a-z]/.test(cur) && !/^https?:/.test(cur)) hits.push(`${prev} ⏎ ${cur}`);
  }
  return hits;
}

function prompts(node, out = []) {
  if (Array.isArray(node)) node.forEach(n => prompts(n, out));
  else if (node && typeof node === 'object') {
    if (typeof node.prompt === 'string') out.push(node.prompt);
    Object.values(node).forEach(v => prompts(v, out));
  }
  return out;
}

for (const file of fs.readdirSync(labsDir).filter(f => f.endsWith('.md'))) {
  const text = fs.readFileSync(path.join(labsDir, file), 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) continue;
  const data = yaml.load(match[1]);
  if (!data || !data.mission_lab) continue;
  test(`${file}: mission prompts have no mid-sentence hard wraps`, () => {
    const hits = prompts(data.mission_lab).flatMap(midSentenceWraps);
    assert.deepEqual(hits, []);
  });
}
