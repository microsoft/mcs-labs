const test = require('node:test');
const assert = require('node:assert/strict');
const { findUnsyncedLabs } = require('./check-lab-sync');

const slugs = (s) => new Set(s); // readmeSlugs helper

test('README changed without _labs → violation', () => {
  const r = findUnsyncedLabs(['labs/demo/README.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, ['demo']);
  assert.deepEqual(r.warnings, []);
});

test('README and _labs changed together → clean', () => {
  const r = findUnsyncedLabs(['labs/demo/README.md', '_labs/demo.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('_labs changed without README (README exists) → warning, no violation', () => {
  const r = findUnsyncedLabs(['_labs/demo.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, ['demo']);
});

test('_labs changed for a README-less lab → clean (no warning)', () => {
  const r = findUnsyncedLabs(['_labs/mcs-orchestration.md'], { readmeSlugs: slugs([]) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('image-only change → clean', () => {
  const r = findUnsyncedLabs(['labs/demo/images/x.png'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('new README added without _labs → violation', () => {
  const r = findUnsyncedLabs(['labs/newlab/README.md'], { readmeSlugs: slugs(['newlab']) });
  assert.deepEqual(r.violations, ['newlab']);
});

test('multiple labs evaluated independently', () => {
  const r = findUnsyncedLabs(
    ['labs/a/README.md', 'labs/b/README.md', '_labs/b.md', '_labs/c.md'],
    { readmeSlugs: slugs(['a', 'b', 'c']) }
  );
  assert.deepEqual(r.violations, ['a']);   // a: README only
  assert.deepEqual(r.warnings, ['c']);     // c: _labs only, README exists
});

test('unrelated files are ignored', () => {
  const r = findUnsyncedLabs(['scripts/foo.js', 'README.md', '_data/x.yml'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});
