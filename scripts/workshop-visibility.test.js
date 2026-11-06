const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('workshop listings filter unlisted entries before counting or splitting them', () => {
  const homepage = read('index.md');
  const catalogue = read('workshops/index.md');
  const filteredAssignment = /assign all_workshops = site\.workshops \| where_exp: "ws", "ws\.unlisted != true" \| sort: "order"/;

  assert.match(homepage, filteredAssignment);
  assert.match(homepage, /{{ all_workshops\.size }}<\/strong><span>Workshops<\/span>/);
  assert.equal((homepage.match(/for ws in all_workshops/g) || []).length, 2);
  assert.match(catalogue, filteredAssignment);
  assert.match(catalogue, /assign internal_workshops = all_workshops \| where_exp:/);
  assert.match(catalogue, /assign external_workshops = all_workshops \| where:/);
});
