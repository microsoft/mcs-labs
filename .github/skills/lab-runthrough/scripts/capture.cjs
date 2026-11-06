#!/usr/bin/env node
'use strict';

/**
 * Drives a desktop Edge or Chrome window over the DevTools protocol for lab
 * run-throughs: launch an isolated profile, list controls, enter prompts
 * verbatim, and capture the window, including light/dark pairs.
 *
 * Raw captures stay outside the repository because they can show personal
 * data; crop_images.py turns the ones you choose into published images.
 * Uses the puppeteer copy that pa11y-ci installs (`npm ci`).
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DEFAULT_PORT = 9334;
const DEFAULT_OUT = path.join(os.tmpdir(), 'lab-runthrough');
const PROFILE_PREFIX = 'lab-runthrough-profile-';
const EDITOR = '[contenteditable="true"][role="textbox"], textarea';
const CLICKABLE = 'button,a,[role=button],[role=link],[role=tab],[role=switch],[role=checkbox],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=option]';
const CONTROLS = `${CLICKABLE},input,select,textarea,[contenteditable="true"],[role=combobox],[role=textbox]`;

const USAGE = `Usage: node capture.cjs <command> [args] [options]

Commands
  launch [url]          Start Edge or Chrome with a new temporary profile and DevTools on --port.
  close                 Close that browser and delete its temporary profile.
  pages                 List open tabs.
  goto <url>            Navigate the selected tab.
  controls [regex]      List visible controls: role, label, text, state, box (x y w h).
  text                  Print the tab's visible text.
  click <name>          Click the one visible control whose aria-label, text or title is <name>.
  clickat <x> <y>       Click a point (use a box from "controls").
  prompt <file|->       Type the prompt from a file (or stdin) verbatim and press Send.
  wait <text>           Wait until the tab shows <text> (default timeout 300000 ms).
  shot <name>           Save <out>/<name>.png.
  pair <name>           Save <out>/<name>-light.png and <name>-dark.png via prefers-color-scheme.

Options
  --port <n>            DevTools port (default ${DEFAULT_PORT}, or LAB_CDP_PORT).
  --url <prefix>        Select the tab whose URL starts with <prefix> (default: first tab).
  --out <dir>           Capture folder outside the repository (default ${DEFAULT_OUT}).
  --settle <ms>         Wait after switching color scheme (default 1500).
  --scheme-attr <name>  Fail a pair unless <html name="light|dark"> follows the switch,
                        for example data-color-scheme in Microsoft Copilot.
  --send-label <name>   Accessible name of the send button (default Send).
  --timeout <ms>        Timeout for prompt and wait.
  --browser <path>      Browser executable for launch.
  --window-size <w,h>   Window size for launch (default 1600,1000).
  --headless            Launch without a window (for testing this script).
`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const stateFile = port => path.join(os.tmpdir(), `lab-runthrough-${port}.json`);
const isAlive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };

class UsageError extends Error {}

function loadPuppeteer() {
  try {
    return require(require.resolve('puppeteer', { paths: [process.cwd(), REPO_ROOT] }));
  } catch {
    throw new Error('puppeteer is not installed. Run "npm ci" at the repository root (pa11y-ci brings it in).');
  }
}

function browserCandidates() {
  if (process.platform === 'win32') {
    const bases = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
    return bases.flatMap(base => [
      path.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    ]);
  }
  if (process.platform === 'darwin') {
    return ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  }
  return ['/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
}

async function endpointUp(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

function readState(port) {
  try { return JSON.parse(fs.readFileSync(stateFile(port), 'utf8')); } catch { return null; }
}

/** Deletes a profile only if this script created it in the temp folder. */
function removeProfile(profile) {
  const resolved = path.resolve(profile || '');
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith(PROFILE_PREFIX)) return false;
  fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  return true;
}

async function launch({ port, url = 'about:blank', browser, windowSize = '1600,1000', headless = false }) {
  const previous = readState(port);
  if (await endpointUp(port)) {
    throw new Error(`Something already listens on port ${port}. Run "close" or pick another --port.`);
  }
  if (previous) {
    removeProfile(previous.profile);
    fs.rmSync(stateFile(port), { force: true });
  }
  const exe = browser || browserCandidates().find(candidate => fs.existsSync(candidate));
  if (!exe) throw new Error('No Edge or Chrome found. Pass --browser <path>.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), PROFILE_PREFIX));
  // A separate profile keeps the learner's personal sign-ins, extensions and history out of the run.
  const args = [
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    `--window-size=${windowSize}`,
    '--no-first-run',
    '--no-default-browser-check',
  ];
  if (headless) args.push('--headless=new');
  args.push(url);
  const child = spawn(exe, args, { detached: true, stdio: 'ignore' });
  child.unref();
  fs.writeFileSync(stateFile(port), JSON.stringify({ pid: child.pid, profile, exe, started: new Date().toISOString() }, null, 2));
  for (let i = 0; i < 60; i++) {
    if (await endpointUp(port)) {
      // Managed devices can open a browser sign-in page instead of the URL; navigate past it.
      if (url !== 'about:blank') {
        const connected = await loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null, protocolTimeout: 30000 });
        const [first] = (await connected.pages()).filter(p => !p.url().startsWith('devtools://'));
        if (first && first.url() !== url) await first.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await connected.disconnect();
      }
      return { pid: child.pid, profile };
    }
    await wait(250);
  }
  throw new Error(`The browser did not open DevTools on port ${port}. Run "close" to clean up.`);
}

async function close({ port }) {
  const state = readState(port);
  if (await endpointUp(port)) {
    const browser = await loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, protocolTimeout: 30000 });
    await browser.close().catch(() => {});
  }
  if (!state) return { profileRemoved: false };
  for (let i = 0; i < 40 && isAlive(state.pid); i++) await wait(250);
  if (isAlive(state.pid)) { try { process.kill(state.pid); } catch { /* already gone */ } }
  await wait(500);
  const profileRemoved = removeProfile(state.profile);
  fs.rmSync(stateFile(port), { force: true });
  return { profileRemoved, profile: state.profile };
}

async function connectBrowser(port) {
  if (!(await endpointUp(port))) throw new Error(`No browser on port ${port}. Run "launch" first.`);
  return loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null, protocolTimeout: 30000 });
}

async function connect({ port = DEFAULT_PORT, url } = {}) {
  const browser = await connectBrowser(port);
  const pages = (await browser.pages()).filter(p => !p.url().startsWith('devtools://'));
  const page = url ? pages.find(p => p.url().startsWith(url)) : pages[0];
  if (!page) {
    const open = pages.map(p => p.url()).join(', ') || 'none';
    await browser.disconnect();
    throw new Error(url ? `No tab starts with ${url}. Open tabs: ${open}` : 'No open tab.');
  }
  page.setDefaultTimeout(20000);
  const cdp = await page.createCDPSession();
  // An unfocused window closes menus and pauses some UI; emulating focus keeps captures stable.
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  return { browser, page, cdp };
}

async function controls(page, pattern = '') {
  return page.evaluate((selector, source) => {
    const re = source ? new RegExp(source, 'i') : null;
    return [...document.querySelectorAll(selector)]
      .filter(e => {
        const box = e.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(e).visibility !== 'hidden';
      })
      .map(e => {
        const box = e.getBoundingClientRect();
        const state = [
          // Fluent switches report state through the checked property, not aria-checked.
          e.checked === true || e.getAttribute('aria-checked') === 'true' ? 'on' : '',
          e.getAttribute('aria-expanded') === 'true' ? 'expanded' : '',
          e.getAttribute('aria-selected') === 'true' || e.getAttribute('aria-current') ? 'selected' : '',
          e.disabled || e.getAttribute('aria-disabled') === 'true' ? 'disabled' : '',
        ].filter(Boolean).join(' ');
        return {
          role: e.getAttribute('role') || e.tagName.toLowerCase(),
          label: e.getAttribute('aria-label') || '',
          text: (e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 100),
          title: e.getAttribute('title') || '',
          state,
          box: [box.x, box.y, box.width, box.height].map(Math.round),
        };
      })
      .filter(c => !re || re.test(`${c.label} ${c.text} ${c.title}`));
  }, CONTROLS, pattern);
}

async function click(page, name) {
  const handle = await page.evaluateHandle((selector, wanted) => {
    const matches = [...document.querySelectorAll(selector)].filter(e => {
      const box = e.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(e).visibility !== 'hidden'
        && [e.getAttribute('aria-label'), e.innerText, e.getAttribute('title')].some(v => (v || '').trim() === wanted);
    });
    return matches.length === 1 ? matches[0] : `Expected one visible control named "${wanted}", found ${matches.length}. Run "controls" to see names.`;
  }, CLICKABLE, name);
  const element = handle.asElement();
  if (!element) {
    const message = await handle.jsonValue();
    await handle.dispose();
    throw new Error(message);
  }
  await element.click();
  await element.dispose();
}

async function submitPrompt(page, text, { sendLabel = 'Send', timeout = 120000 } = {}) {
  await page.evaluate(selector => {
    const editors = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0);
    if (editors.length !== 1) throw new Error(`Expected one prompt editor, found ${editors.length}.`);
    const current = editors[0].value !== undefined ? editors[0].value : editors[0].innerText;
    if (current.replace(/[\u200b\u200c]/g, '').trim()) throw new Error('The prompt editor is not empty.');
    editors[0].focus();
  }, EDITOR);
  // insertText keeps line breaks and characters exactly as written in the lab.
  await page.keyboard.sendCharacter(text);
  await page.waitForFunction(label => [...document.querySelectorAll('button')]
    .some(b => b.getAttribute('aria-label') === label && !b.disabled && b.getBoundingClientRect().width > 0),
  { timeout: 15000, polling: 250 }, sendLabel);
  await click(page, sendLabel);
  const firstLine = text.split('\n').find(line => line.trim()).trim();
  await page.waitForFunction((selector, line) => {
    const editor = [...document.querySelectorAll(selector)].find(e => e.getBoundingClientRect().width > 0);
    const current = editor ? (editor.value !== undefined ? editor.value : editor.innerText) : '';
    return !current.replace(/[\u200b\u200c]/g, '').trim() && document.body.innerText.includes(line);
  }, { timeout, polling: 1000 }, EDITOR, firstLine);
}

async function waitForText(page, text, timeout = 300000) {
  await page.waitForFunction(t => document.body.innerText.includes(t), { timeout, polling: 1000 }, text);
}

const pngSize = buffer => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

// "controls" boxes are CSS pixels; captures are device pixels. On a scaled display, crop boxes need the ratio.
async function scaleNote(page) {
  const ratio = await page.evaluate(() => window.devicePixelRatio);
  return ratio === 1 ? 'Scale 1: control boxes are capture pixels.' : `Scale ${ratio}: multiply control boxes by ${ratio} for crop specs.`;
}

async function shot(cdp, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(file, buffer);
  return { file, buffer, ...pngSize(buffer) };
}

/**
 * Captures the same state in both themes. The product must follow the system
 * theme (its own theme setting on "System") for prefers-color-scheme to apply.
 */
async function pair(page, cdp, outDir, name, { settle = 1500, schemeAttr } = {}) {
  const shots = [];
  try {
    for (const value of ['light', 'dark']) {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value }]);
      await wait(settle);
      if (schemeAttr) {
        const actual = await page.evaluate(attr => document.documentElement.getAttribute(attr), schemeAttr);
        if (actual !== value) throw new Error(`Expected <html ${schemeAttr}="${value}">, found "${actual}". Set the product theme to System, or omit --scheme-attr.`);
      }
      shots.push(await shot(cdp, path.join(outDir, `${name}-${value}.png`)));
    }
  } finally {
    await page.emulateMediaFeatures([]);
  }
  if (shots[0].buffer.equals(shots[1].buffer)) {
    throw new Error('Light and dark captures are identical: the page ignores prefers-color-scheme. Set the product theme to System.');
  }
  return shots;
}

function outDir(dir) {
  const resolved = path.resolve(dir);
  const relative = path.relative(REPO_ROOT, resolved);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
    throw new UsageError(`Keep raw captures outside the repository (${resolved}): they can show personal data. crop_images.py writes the published images.`);
  }
  return resolved;
}

function parseArgs(argv) {
  const opts = { port: Number(process.env.LAB_CDP_PORT) || DEFAULT_PORT, out: DEFAULT_OUT, settle: 1500 };
  const flags = new Set(['headless', 'help']);
  const valued = new Set(['port', 'url', 'out', 'settle', 'scheme-attr', 'send-label', 'timeout', 'browser', 'window-size']);
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(argv[i]);
    if (!match) { positional.push(argv[i]); continue; }
    const [, key, inline] = match;
    if (flags.has(key)) { opts[key] = true; continue; }
    if (!valued.has(key)) throw new UsageError(`Unknown option --${key}.`);
    const value = inline !== undefined ? inline : argv[++i];
    if (value === undefined) throw new UsageError(`--${key} needs a value.`);
    opts[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  if (positional[0] === '-h') opts.help = true;
  for (const key of ['port', 'settle', 'timeout']) {
    if (opts[key] !== undefined && !Number.isFinite(Number(opts[key]))) throw new UsageError(`--${key} must be a number.`);
    if (opts[key] !== undefined) opts[key] = Number(opts[key]);
  }
  const [command, ...args] = positional;
  return { command, args, opts };
}

function need(args, count, usage) {
  if (args.length < count) throw new UsageError(`Usage: ${usage}`);
  return args;
}

async function main(argv) {
  const { command, args, opts } = parseArgs(argv);
  if (!command || opts.help) { process.stdout.write(USAGE); return; }

  if (command === 'launch') {
    const { pid, profile } = await launch({ ...opts, url: args[0] });
    console.log(`Browser ${pid} on port ${opts.port}, temporary profile ${profile}`);
    console.log('Sign in to the training tenant in that window, then continue. Run "close" when done.');
    return;
  }
  if (command === 'close') {
    const { profileRemoved, profile } = await close(opts);
    console.log(profileRemoved ? `Closed and deleted ${profile}` : 'Closed. No temporary profile recorded for this port.');
    return;
  }
  if (command === 'pages') {
    const browser = await connectBrowser(opts.port);
    for (const p of await browser.pages()) console.log(`${p.url()}\t${await p.title()}`);
    await browser.disconnect();
    return;
  }

  const known = new Set(['goto', 'controls', 'text', 'click', 'clickat', 'prompt', 'wait', 'shot', 'pair']);
  if (!known.has(command)) throw new UsageError(`Unknown command "${command}".`);
  const captures = ['shot', 'pair'].includes(command) ? outDir(opts.out) : null;
  const { browser, page, cdp } = await connect(opts);
  try {
    switch (command) {
      case 'goto':
        await page.goto(need(args, 1, 'goto <url>')[0], { waitUntil: 'domcontentloaded' });
        console.log(page.url());
        break;
      case 'controls':
        for (const c of await controls(page, args[0])) {
          console.log([c.role, c.label && `label="${c.label}"`, c.text && `text="${c.text}"`, c.title && `title="${c.title}"`, c.state && `[${c.state}]`, `@ ${c.box.join(' ')}`].filter(Boolean).join('  '));
        }
        break;
      case 'text':
        console.log(await page.evaluate(() => document.body.innerText));
        break;
      case 'click':
        await click(page, need(args, 1, 'click <name>')[0]);
        break;
      case 'clickat': {
        const [x, y] = need(args, 2, 'clickat <x> <y>').map(Number);
        await page.mouse.click(x, y);
        break;
      }
      case 'prompt': {
        const source = need(args, 1, 'prompt <file|->')[0];
        const text = fs.readFileSync(source === '-' ? 0 : source, 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');
        await submitPrompt(page, text, { sendLabel: opts.sendLabel, timeout: opts.timeout });
        console.log(`Sent at ${new Date().toISOString()}: ${text.split('\n')[0]}`);
        break;
      }
      case 'wait':
        await waitForText(page, need(args, 1, 'wait <text>')[0], opts.timeout);
        break;
      case 'shot': {
        const s = await shot(cdp, path.join(captures, `${need(args, 1, 'shot <name>')[0]}.png`));
        console.log(`${s.file}  ${s.width} x ${s.height}`);
        console.log(await scaleNote(page));
        break;
      }
      case 'pair':
        for (const s of await pair(page, cdp, captures, need(args, 1, 'pair <name>')[0], opts)) console.log(`${s.file}  ${s.width} x ${s.height}`);
        console.log(await scaleNote(page));
        break;
    }
  } finally {
    await cdp.detach().catch(() => {});
    await browser.disconnect();
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.message);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  });
}

module.exports = { launch, close, connect, controls, click, submitPrompt, waitForText, shot, pair };
