const test = require('node:test');
const assert = require('node:assert/strict');
const { categorize, deriveStatus, shape } = require('./build-tracker-data');

test('categorize: returns category for a typed issue', () => {
  assert.equal(categorize(['type: bug']), 'bug');
  assert.equal(categorize(['type: new-lab', 'priority: P1']), 'newLab');
  assert.equal(categorize(['type: lab-update']), 'contentUpdate');
  assert.equal(categorize(['portal-enhancement']), 'portalEnhancement');
  assert.equal(categorize(['type: bootcamp-feature']), 'bootcampFeature');
});

test('categorize: priority order resolves overlap', () => {
  assert.equal(categorize(['type: new-lab', 'type: bug']), 'bug');
});

test('categorize: returns null for issues with no relevant type label', () => {
  assert.equal(categorize(['documentation']), null);
  assert.equal(categorize([]), null);
});

test('deriveStatus: returns status from label', () => {
  assert.equal(deriveStatus({ state: 'open', labels: ['status: backlog'] }), 'backlog');
  assert.equal(deriveStatus({ state: 'open', labels: ['status: in-progress'] }), 'inProgress');
  assert.equal(deriveStatus({ state: 'open', labels: ['status: triage'] }), 'triage');
});

test('deriveStatus: open with no status label defaults to triage', () => {
  assert.equal(deriveStatus({ state: 'open', labels: ['type: bug'] }), 'triage');
});

test('deriveStatus: closed within window is done', () => {
  const closedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(deriveStatus({ state: 'closed', closedAt, labels: [] }, 30), 'done');
});

test('deriveStatus: closed outside window is excluded', () => {
  const closedAt = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(deriveStatus({ state: 'closed', closedAt, labels: [] }, 90), null);
});

test('shape: produces expected top-level keys', () => {
  const result = shape([], []);
  assert.ok(result.stats);
  assert.ok(result.categories);
  assert.ok(result.trend90d);
  assert.ok(Array.isArray(result.issues));
  assert.ok(Array.isArray(result.recentActivity));
});

test('shape: trend90d has exactly 90 daily entries', () => {
  const result = shape([], []);
  assert.equal(result.trend90d.length, 90);
});
