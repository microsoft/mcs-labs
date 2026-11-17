const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { labSourcePath } = require('./lab-files');

const root = path.resolve(__dirname, '..');
const slug = 'hooks-knowledge-travel-policy';
const document = matter(fs.readFileSync(labSourcePath(root, slug), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
const missions = document.data.mission_lab.missions;
const steps = missions.flatMap(mission => mission.steps);
const prompts = steps.filter(step => step.prompt).map(step => step.prompt);
const classic = matter(fs.readFileSync(path.join(root, '_labs', 'mcs-hooks.md'), 'utf8'));
const classicReadme = fs.readFileSync(path.join(root, 'labs', 'mcs-hooks', 'README.md'), 'utf8');
const fences = text => [...text.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)]
  .map(match => match[1].replace(/\r\n/g, '\n'));
const indentedBlocks = (text, language) => [...text.matchAll(
  /^([ \t]*)```([^\r\n`]*)\r?\n([\s\S]*?)^\1```[ \t]*$/gm)]
  .filter(([, , info]) => info.trim() === language)
  .map(([, indent, , block]) => block.replace(/\r?\n$/, '').split(/\r?\n/)
    .map(line => line.startsWith(indent) ? line.slice(indent.length) : line).join('\n'));
const normalize = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();

test('travel policy portable copies and copyable prompts stay synchronized', () => {
  assert.equal(normalize(readme), normalize(document.content));
  for (const copy of [document.content, readme]) {
    const blocks = fences(copy);
    for (const prompt of prompts) assert.ok(blocks.includes(prompt), prompt);
  }
});

test('the shared classic context stays synchronized without changing its format', () => {
  assert.notEqual(classic.data.lab_format, 'missions');
  const context = /1\. On \*\*Return traveler profile\*\*[\s\S]*?(?=\n1\. Select \*\*Publish\*\*)/;
  const sharedContext = classic.content.match(context)?.[0];
  assert.ok(sharedContext, 'The shared context instructions must be present');
  assert.equal(sharedContext, classicReadme.match(context)?.[0]);
  // Match the existing shared-prompt contract without loading other labs, agendas or presentations.
  for (const copy of [classic.content, classicReadme]) {
    const remaining = [...prompts, ...steps.flatMap(step => indentedBlocks(step.instruction, 'output'))];
    for (const block of [...indentedBlocks(copy, 'text'), ...indentedBlocks(copy, '')]) {
      const index = remaining.indexOf(block);
      assert.ok(index >= 0, `Missing shared classic block: ${block.slice(0, 80)}`);
      remaining.splice(index, 1);
    }
  }
});

test('session context gives named destinations precedence over the profile default', () => {
  const context = steps.filter(step => step.prompt_label?.startsWith('additionalContext'));
  assert.equal(context.length, 1, 'Provide one complete copyable context');
  const prompt = context[0].prompt;
  assert.match(prompt, /The traveler's Office Location is \[OFFICE_LOCATION\]\. Use it only when the user has not named a travel destination\./);
  assert.match(prompt, /A named destination takes precedence; resolve cities to their country\./);
  assert.match(prompt, /If Office Location is missing and no destination is named, use Paris\./);
  assert.doesNotMatch(prompt, /Use this .* to determine policy/);
  for (const copy of [document.content, readme, classic.content, classicReadme]) {
    assert.equal(indentedBlocks(copy, 'text').filter(block => block === prompt).length, 1);
    assert.doesNotMatch(copy, /Paste this first segment|Paste the second segment/);
    assert.match(copy, /select and delete only `\[OFFICE_LOCATION\]`, including the brackets/);
    assert.match(copy, /Keep the space before the token and the period after it/);
  }
  assert.match(missions[0].steps[1].prompt, /Use an explicitly requested location; otherwise use the Microsoft Entra ID profile/);
});

test('current hook authoring instructions preserve the dynamic token and wait for saved bindings', () => {
  const context = steps.find(step => step.title === 'Insert the Office Location dynamic value');
  assert.match(context.instruction, /Leave the cursor there.*Insert dynamic content.*Get my profile → Office Location/);
  assert.match(context.instruction, /Insert the dynamic token rather than typing a location/);
  assert.equal(context.prompt, undefined, 'The replacement step needs no second copyable fragment');
  assert.match(steps.find(step => step.title === 'Publish the workflow and agent').instruction,
    /Your agent has been saved\./);
  assert.match(steps.find(step => step.title === 'Remove broad web knowledge').instruction,
    /Work IQ.*if it is already attached; you do not need to add it/);
});

test('each new hook requires agent publication after the workflow is published and attached', () => {
  for (const title of [
    'Publish the workflow and agent',
    'Return the redacted branch and publish',
    'Return an allow or deny decision',
  ]) {
    const instruction = steps.find(step => step.title === title).instruction;
    assert.match(instruction,
      /\*\*Publish\*\*[\s\S]*\*\*Done\*\*[\s\S]*\*\*Save\*\*[\s\S]*\*\*Publish\*\* on the agent[\s\S]*publishing to finish/);
  }
  for (const copy of [document.content, readme]) {
    assert.match(copy, /select \*\*Publish\*\* on the agent and wait for publishing to finish before opening \*\*Preview\*\*/);
    assert.equal((copy.match(/Select \*\*Publish\*\* on the agent and wait for publishing to finish before testing the hook\./g) || []).length, 2);
  }
  for (const copy of [JSON.stringify(document.data.mission_lab), document.content, readme, classic.content, classicReadme]) {
    assert.doesNotMatch(copy,
      /agent need not be published|do not need to publish the agent|saved draft agent|saved draft whose|unpublished draft|Preview tests the saved draft/);
    assert.match(copy, /saving alone does not activate the hook/);
  }
  for (const copy of [classic.content, classicReadme]) {
    assert.equal((copy.match(/Select \*\*Publish\*\* on the agent and wait for publishing to finish before testing the hook\./g) || []).length, 2);
    assert.match(copy, /\*\*Save\*\* it and select \*\*Publish\*\* on the agent\. Wait for publishing to finish, then select \*\*New chat\*\*/);
  }
});

test('the simulated tool uses the observed Description for Intelligence field label', () => {
  const tool = steps.find(step => step.title === 'Describe and attach the tool');
  assert.match(tool.instruction, /Description for Intelligence/);
  assert.equal(tool.prompt_label, 'Description for Intelligence · field value');
  for (const copy of [document.content, readme]) {
    assert.match(copy, /Description for Intelligence/);
    assert.doesNotMatch(copy, /Description for AI/);
  }
});

// Inspect the WebP header without adding an image-processing test dependency.
function webpSize(file) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.toString('ascii', 0, 4) + bytes.toString('ascii', 8, 12), 'RIFFWEBP', file);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  assert.equal(chunk, 'VP8 ', file);
  return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
}

test('retested context screenshots have matching native-size light and dark assets', () => {
  const captures = missions[0].steps.filter(step => step.screenshot).map(step => step.screenshot);
  assert.equal(captures.length, 2);
  for (const capture of captures) {
    const files = [capture.src, capture.src_dark].map(src => {
      assert.ok(src.startsWith(`/labs/${slug}/images/`));
      const file = path.join(root, ...src.split('/'));
      assert.deepEqual(webpSize(file), [capture.width, capture.height], src);
      return file;
    });
    assert.notDeepEqual(fs.readFileSync(files[0]), fs.readFileSync(files[1]));
    assert.match(capture.alt, /Office Location/);
  }
});

test('classic shared-context images reuse the genuine corrected captures', () => {
  const captures = missions[0].steps.filter(step => step.screenshot).map(step => step.screenshot);
  for (const capture of captures) {
    for (const src of [capture.src, capture.src_dark]) {
      const name = path.posix.basename(src);
      const sharedFile = path.join(root, 'labs', 'mcs-hooks', 'images', name);
      assert.deepEqual(fs.readFileSync(sharedFile), fs.readFileSync(path.join(root, ...src.split('/'))));
      for (const copy of [classic.content, classicReadme]) assert.ok(copy.includes(`images/${name}`));
    }
  }
});
