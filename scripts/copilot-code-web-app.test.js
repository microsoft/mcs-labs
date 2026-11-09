const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { labSourcePath } = require('./lab-files');

const root = path.resolve(__dirname, '..');
const page = matter(fs.readFileSync(labSourcePath(root, 'copilot-code-web-app'), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', 'copilot-code-web-app', 'README.md'), 'utf8');
const mission = id => page.data.mission_lab.missions.find(item => item.id === id);

test('Copilot Code uses the current bootcamp agenda in both editions', () => {
  const classic = matter(fs.readFileSync(labSourcePath(root, 'mcs-copilot-code'), 'utf8'));
  const classicReadme = fs.readFileSync(path.join(root, 'labs', 'mcs-copilot-code', 'README.md'), 'utf8');
  for (const copy of [JSON.stringify(page.data.mission_lab), page.content, readme, classic.content, classicReadme]) {
    assert.ok(copy.includes('https://microsoft.github.io/mcs-labs/events/architecture-bootcamp/'));
    assert.doesNotMatch(copy, /\/events\/bootcamp-latest\//);
  }
});

test('Copilot Code distinguishes Preview from the published app and keeps the training identity', () => {
  const step = mission('build').steps.find(item => item.title === 'Open the published app');
  for (const copy of [step.instruction, page.content, readme]) {
    assert.match(copy, /\*\*Open\*\*[\s\S]*?\*\*Preview\*\* beside the chat/);
    assert.match(copy, /\*\*Open in app\*\* arrow/);
    assert.match(copy, /Open My Bootcamp Lab Tracker in app/);
  }
  for (const copy of [step.help, page.content, readme]) {
    assert.match(copy, /Use the same lab account/);
    assert.match(copy, /\*\*Use another account\*\*/);
    assert.match(copy, /do not select the account connected to your device/);
  }
});

test('Copilot Code loads the notified published version rather than assuming reload updates it', () => {
  const step = mission('publish').steps.find(item => item.title === 'Load the published update');
  for (const copy of [step.instruction, page.content, readme]) {
    assert.match(copy, /notice is absent after publishing completes, reload the tab to check for it/);
    assert.match(copy, /notice's \*\*Refresh\*\* button/);
    assert.match(copy, /browser reload alone may retain the older version/);
  }
});

test('Copilot Code verifies completed-day styling in selected and unselected tabs', () => {
  const step = mission('publish').steps.find(item => item.title === 'Repeat the schedule and completion checks');
  for (const copy of [step.instruction, page.content, readme]) {
    assert.match(copy, /count turns green both while that tab is selected and after selecting another day/);
    assert.match(copy, /uncheck one and confirm complete-day styling reverses/);
  }
});
