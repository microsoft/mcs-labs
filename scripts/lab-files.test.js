const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const matter = require('gray-matter');
const { MISSION_PREFIX, labSlugFromSource, labSourcePath, sourceSlug } = require('./lab-files');

const root = path.resolve(__dirname, '..');

function tempLabs(t, names) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-files-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, '_labs'));
  for (const name of names) fs.writeFileSync(path.join(dir, '_labs', name), '---\ntitle: Lab\n---\n');
  return dir;
}

test('labSlugFromSource strips only the mission- prefix', () => {
  assert.equal(labSlugFromSource('mission-cowork-zava-sales.md'), 'cowork-zava-sales');
  assert.equal(labSlugFromSource('_labs/mission-cowork-zava-sales.md'), 'cowork-zava-sales');
  assert.equal(labSlugFromSource('mcs-workflows.md'), 'mcs-workflows');
  assert.equal(labSlugFromSource('missions-intro.md'), 'missions-intro');
});

test('labSourcePath finds the guided copy, otherwise the classic path', t => {
  const dir = tempLabs(t, ['classic.md', 'mission-guided.md']);
  assert.equal(labSourcePath(dir, 'classic'), path.join(dir, '_labs', 'classic.md'));
  assert.equal(labSourcePath(dir, 'guided'), path.join(dir, '_labs', 'mission-guided.md'));
  // A lab with no site copy yet resolves to the classic path, so callers can report it missing.
  assert.equal(labSourcePath(dir, 'new-lab'), path.join(dir, '_labs', 'new-lab.md'));
});

test('labSourcePath rejects two site copies and slugs that leave _labs/', t => {
  const dir = tempLabs(t, ['twice.md', 'mission-twice.md']);
  assert.throws(() => labSourcePath(dir, 'twice'), /Both _labs\/twice\.md and _labs\/mission-twice\.md exist/);
  for (const slug of ['', '../escape', 'a/b', 'a\\b', undefined]) {
    assert.throws(() => labSourcePath(dir, slug), /Invalid lab slug/, String(slug));
  }
});

test('sourceSlug publishes a mission- file under its unprefixed slug, or refuses it', () => {
  const pinned = { lab_format: 'missions', slug: 'guided', permalink: '/labs/guided/' };
  assert.equal(sourceSlug('labs', 'mission-guided.md', pinned), 'guided');
  assert.equal(sourceSlug('labs', 'classic.md', {}), 'classic');
  // The convention is for labs only: a module may be called mission-anything.
  assert.equal(sourceSlug('modules', 'mission-control.md', {}), 'mission-control');
  for (const broken of [
    { ...pinned, lab_format: undefined },
    { ...pinned, slug: undefined },
    { ...pinned, slug: 'mission-guided' },
    { ...pinned, permalink: undefined },
    { ...pinned, permalink: '/labs/mission-guided/' },
  ]) {
    assert.throws(() => sourceSlug('labs', 'mission-guided.md', broken),
      /_labs\/mission-guided\.md must set lab_format: missions, slug: guided and permalink: \/labs\/guided\//);
  }
});

test('repository: mission- names exactly the guided labs, each pinned to its unprefixed URL', () => {
  const slugs = new Set();
  for (const file of fs.readdirSync(path.join(root, '_labs')).filter(f => f.endsWith('.md'))) {
    const data = matter(fs.readFileSync(path.join(root, '_labs', file), 'utf8')).data;
    assert.equal(file.startsWith(MISSION_PREFIX), data.lab_format === 'missions',
      `${file}: guided labs, and only guided labs, are named ${MISSION_PREFIX}<slug>.md`);
    const slug = sourceSlug('labs', file, data);
    assert.ok(!slugs.has(slug), `${slug} has two site copies`);
    slugs.add(slug);
  }
  // README folders, images and URLs keep the public slug.
  assert.deepEqual(fs.readdirSync(path.join(root, 'labs')).filter(name => name.startsWith(MISSION_PREFIX)), []);
});
