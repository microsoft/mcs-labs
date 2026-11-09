const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const skills = path.join(root, '.github', 'skills');
const read = (...parts) => fs.readFileSync(path.join(skills, ...parts), 'utf8');
const skillNames = ['lab-create', 'lab-review', 'lab-runthrough', 'lab-update'];
const values = {
  SLUG: 'example-lab',
  DURATION: '10',
  LEVEL: '200',
  ORDER: '123',
  SECTION: 'core_learning_path',
  JOURNEYS: 'developer',
  MISSION_1_MINUTES: '10',
  MISSION_2_MINUTES: '5',
  HERO_WIDTH: '1600',
  HERO_HEIGHT: '900',
  IMAGE_WIDTH: '1600',
  IMAGE_HEIGHT: '900',
  INDEPENDENT_TENANT_SETUP_ONLY: 'Prepare the example connector in your own tenant.',
};

function scaffold(file) {
  return read('lab-create', 'templates', file).replace(/%%([^%]+)%%/g, (_, placeholder) => {
    const key = placeholder.split(':')[0].trim();
    return values[key] ?? key.toLowerCase().replace(/_/g, '-');
  });
}

// Templates differ in heading emoji and author notes, not in the learner's instructions.
function normalizeBody(text) {
  return text.replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
    .replace(/\]\(#[\uFE0F-]+/g, '](#')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function fencedInputs(text) {
  return [...text.replace(/\r\n/g, '\n').matchAll(/```text\n([\s\S]*?)\n```/g)]
    .map(match => match[1]);
}

test('all four lab skills have valid metadata and use the shared learning-design rules', () => {
  const designPath = path.join(skills, 'lab-review', 'references', 'learning-design.md');
  for (const name of skillNames) {
    const text = read(name, 'SKILL.md');
    const { data } = matter(text);
    assert.equal(data.name, name);
    assert.ok(typeof data.description === 'string' && data.description.length > 0);
    const reference = text.match(/`((?:\.\.\/lab-review\/)?references\/learning-design\.md)`/);
    assert.ok(reference, `${name}: shared authoring rules must be reachable`);
    assert.equal(path.resolve(skills, name, reference[1]), designPath);
    assert.ok(fs.existsSync(designPath));
  }
});

for (const format of ['classic', 'missions']) {
  test(`${format} templates scaffold matching readable copies and closed own-tenant setup`, () => {
    const page = matter(scaffold(`${format}-site.md`));
    const readme = scaffold(`${format}-README.md`);
    assert.equal(normalizeBody(page.content), normalizeBody(readme));
    for (const copy of [page.content, readme]) {
      assert.match(copy, /<details class="lab-setup" markdown="1">/);
      assert.doesNotMatch(copy, /<details[^>]*\bopen(?:\s|=|>)/);
      assert.match(copy, /provided.*pre-provisioned/);
    }
  });
}

test('missions scaffold pins canonical identity without prefixing the public URL', () => {
  const guidance = read('lab-review', 'references', 'learning-design.md');
  for (const invariant of [
    '_labs/mission-<slug>.md', 'slug: <slug>', 'permalink: /labs/<slug>/',
    'labs/<slug>/README.md',
  ]) {
    assert.ok(guidance.includes(invariant), `shared naming rule: ${invariant}`);
  }
  const { data } = matter(scaffold('missions-site.md'));
  assert.equal(data.lab_format, 'missions');
  assert.equal(data.slug, values.SLUG);
  assert.equal(data.permalink, `/labs/${values.SLUG}/`);
});

test('missions scaffold keeps provisioning out of attendee readiness and omits runner chores', () => {
  const { data, content } = matter(scaffold('missions-site.md'));
  const lab = data.mission_lab;
  assert.equal(lab.self_setup.trim(), values.INDEPENDENT_TENANT_SETUP_ONLY);
  assert.ok(content.includes(lab.self_setup.trim()));
  assert.ok(lab.prerequisites.every(item => !item.includes(lab.self_setup.trim())));
  assert.equal(lab.validation, undefined);
  assert.equal(lab.finish.cleanup, undefined);
  assert.doesNotMatch(normalizeBody(content),
    /What was tested|Use a separate browser profile|do not use a personal or production account/);
});

test('missions scaffold preserves ordered prompts and the optional result cue in all copies', () => {
  const { data, content } = matter(scaffold('missions-site.md'));
  const readme = scaffold('missions-README.md');
  const prompts = data.mission_lab.missions.flatMap(mission =>
    mission.steps.filter(step => step.prompt).map(step => step.prompt));
  assert.deepEqual(fencedInputs(content), prompts);
  assert.deepEqual(fencedInputs(readme), prompts);
  for (const mission of data.mission_lab.missions.filter(mission => mission.result_check)) {
    for (const copy of [content, readme]) {
      assert.ok(copy.includes(`**Check your result:** ${mission.result_check}`));
    }
  }
});

test('missions scaffold puts optional extensions after required work and budgets only core time', () => {
  const { data } = matter(scaffold('missions-site.md'));
  const missions = data.mission_lab.missions;
  const firstOptional = missions.findIndex(mission => mission.optional);
  assert.ok(firstOptional > 0);
  assert.ok(missions.slice(firstOptional).every(mission => mission.optional === true));
  assert.equal(missions.filter(mission => !mission.optional)
    .reduce((sum, mission) => sum + mission.minutes, 0), data.duration);
  assert.equal(new Set(missions.map(mission => mission.id)).size, missions.length);
  for (const mission of missions.filter(mission => mission.check)) {
    assert.equal(mission.check.options.filter(option => option.correct === true).length, 1);
  }
});

test('missions scaffold references every supplied image in its readable copies', () => {
  const { data, content } = matter(scaffold('missions-site.md'));
  const readme = scaffold('missions-README.md');
  const images = [data.mission_lab.hero_image, ...data.mission_lab.missions
    .flatMap(mission => mission.steps.map(step => step.screenshot).filter(Boolean))];
  for (const image of images) {
    assert.ok(image.width > 0 && image.height > 0 && image.alt);
    for (const source of [image.src, image.src_dark].filter(Boolean)) {
      const relative = source.replace(`/labs/${values.SLUG}/`, '');
      assert.ok(content.includes(relative), `site body: ${relative}`);
      assert.ok(readme.includes(relative), `README: ${relative}`);
    }
  }
});

test('maintainer handoff templates ask for scope and reused evidence rather than assuming success', () => {
  for (const [skill, file] of [
    ['lab-runthrough', 'runthrough-log.md'],
    ['lab-review', 'review-report.md'],
    ['lab-update', 'pr-body.md'],
  ]) {
    const text = read(skill, 'templates', file);
    assert.match(text, /scope/i, file);
    assert.match(text, /reused evidence|evidence reused/i, file);
    assert.match(text, /owner.role/i, file);
  }
  assert.match(read('lab-runthrough', 'templates', 'runthrough-log.md'),
    /\| 1\.1 \| core \|.*%%STATUS%%/);
});
