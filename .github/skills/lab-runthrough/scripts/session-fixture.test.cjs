'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const puppeteer = require('puppeteer');
const { verifyActiveAccount, verifyHeadlessSession } = require('./capture.cjs');

// Fulfil all page requests locally. No account, credentials, or tenant is used.
test('private headless account check uses the active control, never surrounding content', async t => {
  const browser = await puppeteer.launch({ headless: true, args: ['--host-resolver-rules=MAP * ~NOTFOUND'] });
  t.after(() => browser.close());
  const page = await (await browser.createBrowserContext()).newPage();
  await verifyHeadlessSession(browser, page);
  const defaultTab = await browser.newPage();
  await assert.rejects(verifyHeadlessSession(browser, defaultTab), /Cannot verify private headless mode/);

  const expected = 'attendee@example.invalid';
  const host = 'host@example.invalid';
  const account = value => `<div role="button" aria-label="User ${value}, Work account">Account</div>`;
  let fixture;
  await page.setRequestInterception(true);
  page.on('request', request => request.respond({ contentType: 'text/html', body: fixture }));
  async function load(controls, origin = 'https://m365.cloud.microsoft') {
    fixture = `<aside>${controls}<button>Settings and more</button><p>${host}</p></aside>
      <main><p>Document authored by ${host} for ${expected}</p><header>${account(expected)}</header></main>`;
    await page.goto(origin);
  }

  await load(account(expected.toUpperCase()));
  await verifyActiveAccount(page, expected, 'host');

  for (const controls of ['', account('assigned alias'), `<div hidden>${account(expected)}</div>`,
    account(expected) + account(host)]) {
    await load(controls);
    await assert.rejects(verifyActiveAccount(page, expected, 'host'), /Active account unverified/);
    assert.notEqual(page.url(), 'about:blank');
  }
  await load(account(expected), 'https://other.example.invalid');
  await assert.rejects(verifyActiveAccount(page, expected), /Active account unverified/);

  for (const identity of [host, `not-${expected}`, 'forbidden alias']) {
    await load(account(identity));
    await assert.rejects(verifyActiveAccount(page, expected, 'forbidden alias'), error => {
      assert.doesNotMatch(error.message, /example\.invalid|forbidden alias/);
      return /Wrong active account/.test(error.message);
    });
    assert.equal(page.url(), 'about:blank');
  }
});
