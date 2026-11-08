'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const capture = require('../.github/skills/lab-runthrough/scripts/capture.cjs');

test('paired element crops are remeasured after each theme switch', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-test-'));
  let theme = 'light';
  const element = {
    evaluate: async action => action({ scrollIntoView: () => {} }),
    boundingBox: async () => ({ x: 10, y: theme === 'light' ? 20 : 100, width: 50, height: 25 }),
    dispose: async () => {},
  };
  const frame = {
    evaluateHandle: async () => ({
      getProperties: async () => new Map([['0', { asElement: () => element, dispose: async () => {} }]]),
      dispose: async () => {},
    }),
  };
  const page = {
    frames: () => [frame],
    evaluate: async () => ({ width: 800, height: 600, deviceScaleFactor: 2 }),
    emulateMediaFeatures: async features => { if (features.length) theme = features[0].value; },
  };
  const captures = [];
  const cdp = {
    send: async (method, params) => {
      if (method === 'Runtime.evaluate') return { result: { value: '[3,7,800,600,2]' } };
      if (method === 'Emulation.setDeviceMetricsOverride') return {};
      captures.push(params.clip);
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0y8AAAAASUVORK5CYII=', 'base64');
      return { data: Buffer.concat([png, Buffer.from(theme)]).toString('base64') };
    },
  };

  try {
    await capture.pair(page, cdp, directory, 'reply', {
      settle: 0,
      regionOptions: { element: 'Response', pad: 0, zoom: 2 },
    });
    assert.deepEqual(captures, [
      { x: 13, y: 27, width: 50, height: 25, scale: 4 },
      { x: 13, y: 107, width: 50, height: 25, scale: 4 },
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('redacts training credentials and signed URL query values', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-redact-test-'));
  const credentialFile = path.join(directory, 'account.json');
  const previous = process.env.LAB_CREDENTIALS;
  fs.writeFileSync(credentialFile, JSON.stringify({
    username: 'qa.runner@training.example',
    password: 'ExamplePassword!42',
    oldPassword: 'PreviousPassword!42',
    redact: ['AB12CD34'],
  }));
  process.env.LAB_CREDENTIALS = credentialFile;

  try {
    const output = capture.redact(
      'qa.runner@training.example ExamplePassword!42 PreviousPassword!42 AB12CD34 ' +
      'https://example.test/preview?sig=signed-value&token=token-value&safe=visible',
    );
    for (const secret of ['qa.runner@training.example', 'ExamplePassword!42', 'PreviousPassword!42', 'AB12CD34', 'signed-value', 'token-value']) {
      assert.equal(output.includes(secret), false);
    }
    assert.match(output, /safe=visible/);
  } finally {
    if (previous === undefined) delete process.env.LAB_CREDENTIALS;
    else process.env.LAB_CREDENTIALS = previous;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('close does not touch a browser when this driver has no owned profile state', async () => {
  const port = 20000 + Math.floor(Math.random() * 40000);
  assert.deepEqual(await capture.close({ port }), { profileRemoved: false });
});

test('browser close ownership requires the recorded DevTools process id', async () => {
  const browserWithPid = pid => ({
    target: () => ({
      createCDPSession: async () => ({
        send: async () => ({ processInfo: [{ type: 'browser', id: pid }] }),
        detach: async () => {},
      }),
    }),
  });

  await capture.assertOwnedBrowser(browserWithPid(1234), 1234);
  await assert.rejects(
    capture.assertOwnedBrowser(browserWithPid(5678), 1234),
    /Refusing to close an unrelated browser/,
  );
});
