#!/usr/bin/env node
'use strict';

/**
 * Drives an Edge or Chrome session over the DevTools protocol for lab
 * run-throughs: launch an isolated private profile (windowed or headless),
 * sign in a training account, list controls, enter prompts verbatim, and
 * capture the page, including light/dark pairs.
 *
 * Raw captures stay outside the repository because they can show personal
 * data; crop_images.py turns the ones you choose into published images.
 * Credentials come from a file outside the repository and are never printed.
 * Uses the puppeteer copy that pa11y-ci installs (`npm ci`).
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DEFAULT_PORT = 9334;
const DEFAULT_OUT = path.join(os.tmpdir(), 'lab-runthrough');
const DEFAULT_WINDOW = '1600,1000';
const PROFILE_PREFIX = 'lab-runthrough-profile-';
const EDITOR = '[contenteditable="true"][role="textbox"], textarea';
const CLICKABLE = 'button,a,summary,[role=button],[role=link],[role=tab],[role=switch],[role=checkbox],[role=radio],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=option],[role=treeitem]';
const CONTROLS = `${CLICKABLE},input,select,textarea,[contenteditable="true"],[role=combobox],[role=textbox]`;
const SIGN_IN_PAGE = /^https:\/\/login\.(microsoftonline|microsoft|live)\.com\//;
// Authentication and Microsoft 365 shell frames add private, irrelevant text to evidence.
const NOISE_FRAME = /webshell\.suite\.office\.com|TokenFactory|^https:\/\/login\.(microsoftonline|microsoft|live)\.com\//i;

const USAGE = `Usage: node capture.cjs <command> [args] [options]

Commands
  launch [url]          Start Edge or Chrome in a private window with a new temporary
                        profile and DevTools on --port.
  close                 Close that browser and delete its temporary profile.
  pages                 List open tabs with the index --tab uses.
  goto <url>            Navigate the selected tab.
  newtab <url>          Open a tab in the selected tab's session (same sign-in).
  login                 Sign in on the selected tab as the LAB_CREDENTIALS account.
  controls [regex]      List visible controls in every frame: role, label, text, state, box.
  text                  Print the tab's visible text, including frames.
  click <name>          Click the visible control whose aria-label, text or title is <name>.
  clickat <x> <y>       Click a point (use a box from "controls").
  typeat <x> <y> <text|-> Click a point and type the text (or stdin) verbatim.
  press <key>           Press a key, for example Enter, Escape or Tab.
  scroll <x> <y> <dy>   Scroll the element under a point by dy pixels.
  prompt <file|->       Type the prompt from a file (or stdin) verbatim and press Send.
  upload <file...>      Choose files for an upload: through the file dialog that --click or
                        --at opens, or else straight into the page's file input (--nth).
  wait <text>           Wait until the tab shows <text> (default timeout 300000 ms).
  shot <name>           Save <out>/<name>.png: the viewport, or a sharp crop with --element or --clip.
  pair <name>           Save <out>/<name>-light.png and <name>-dark.png via prefers-color-scheme.

Options
  --port <n>            DevTools port (default ${DEFAULT_PORT}, or LAB_CDP_PORT). One per parallel run.
  --url <prefix>        Select the tab whose URL starts with <prefix> (default: first tab).
  --tab <n>             Select a tab by its "pages" index.
  --out <dir>           Capture folder outside the repository (default ${DEFAULT_OUT}).
  --settle <ms>         Wait after switching color scheme (default 1500).
  --scheme-attr <name>  Fail a pair unless <html name="light|dark"> follows the switch,
                        for example data-color-scheme in Microsoft Copilot.
  --send-label <name>   Accessible name of the send button (default Send).
  --timeout <ms>        Timeout for prompt, wait and login.
  --nth <n>             Click the nth match (from 0) when several controls share a name.
  --click <name>        upload: the control that opens the file dialog.
  --at <x,y>            upload: the point that opens the file dialog.
  --clear               typeat: select and delete the field's text first.
  --enter               typeat: press Enter after typing.
  --forbid <regex>      login: fail if the page shows this text, for example your own
                        name or alias (or LAB_FORBID).
  --browser <name|path> edge, chrome or an executable. Default: Edge or Chrome windowed;
                        puppeteer's Chrome for Testing when headless.
  --window-size <w,h>   Window or headless viewport size for launch (default ${DEFAULT_WINDOW}).
  --headless            Launch without a window, in an off-the-record session.
  --scale <n>           launch: device pixels per CSS pixel. Use 2 for publishable screenshots
                        (headless default 1; windowed default: the display's scale).
  --element <name>      shot/pair: crop to the visible element whose aria-label, title or text
                        is exactly <name> (with --nth when several match).
  --up <n>              shot/pair: crop to the element's nth ancestor, for example its card or dialog.
  --clip <x,y,w,h>      shot/pair: crop to a box in CSS pixels (from "controls").
  --pad <px>            shot/pair: margin around the crop in CSS pixels (default 12).
  --zoom <n>            shot/pair: re-render the crop n times larger again (default 1). With
                        --scale 2, --zoom 1.5 gives 3 device pixels per CSS pixel.

Environment
  LAB_CREDENTIALS       JSON file outside the repository: {"username": "...", "password": "..."}.
                        "login" types them; every command masks them in its output.
`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const stateFile = port => path.join(os.tmpdir(), `lab-runthrough-${port}.json`);
const isAlive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
const displayOrigin = value => {
  try {
    const url = new URL(value);
    return url.origin === 'null' ? url.protocol : url.origin;
  } catch {
    return '(unknown origin)';
  }
};
const ownsProfile = profile => {
  const resolved = path.resolve(profile || '');
  return path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith(PROFILE_PREFIX);
};
const isEdge = exe => /msedge|microsoft[ -]edge/i.test(exe);
const insideRepo = file => { const relative = path.relative(REPO_ROOT, path.resolve(file)); return !relative.startsWith('..') && !path.isAbsolute(relative); };
const viewport = (size, scale = 1) => { const [width, height] = String(size || DEFAULT_WINDOW).split(',').map(Number); return { width, height, deviceScaleFactor: Number(scale) || 1 }; };
const escapeRe = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class UsageError extends Error {}
class NeedsPersonError extends Error {}
class WrongAccountError extends Error {}

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

/** The Chrome for Testing build that `npm ci` downloads with puppeteer, if present. */
function bundledChrome() {
  try {
    const exe = loadPuppeteer().executablePath();
    return exe && fs.existsSync(exe) ? exe : null;
  } catch {
    return null;
  }
}

function resolveBrowser(browser, headless) {
  if (browser && !['edge', 'chrome'].includes(browser)) return browser;
  const installed = browserCandidates().filter(candidate => fs.existsSync(candidate));
  if (browser === 'edge') return installed.find(isEdge);
  if (browser === 'chrome') return bundledChrome() || installed.find(candidate => !isEdge(candidate));
  // Managed devices can force headless Edge to a browser sign-in page (BrowserSignin policy),
  // and it then exits during the Microsoft Entra sign-in. Chrome for Testing is not affected.
  if (headless) return bundledChrome() || installed[0];
  return installed[0];
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
  if (!ownsProfile(resolved)) return false;
  fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  return true;
}

async function launch({ port, url = 'about:blank', browser, windowSize = DEFAULT_WINDOW, headless = false, scale }) {
  const previous = readState(port);
  if (await endpointUp(port)) {
    throw new Error(`Something already listens on port ${port}. Run "close" or pick another --port.`);
  }
  if (previous) {
    if (Number.isInteger(previous.pid) && isAlive(previous.pid)) {
      throw new Error(`The previous browser process ${previous.pid} is still running without its DevTools endpoint. Run "close" before reusing port ${port}.`);
    }
    removeProfile(previous.profile);
    fs.rmSync(stateFile(port), { force: true });
  }
  const exe = resolveBrowser(browser, headless);
  if (!exe) throw new Error('No Edge or Chrome found. Run "npm ci" or pass --browser <path>.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), PROFILE_PREFIX));
  // A separate profile keeps the learner's personal sign-ins, extensions and history out of the run.
  const args = [
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    '--remote-debugging-address=127.0.0.1',
    `--window-size=${windowSize}`,
    // A private window does not use the device's Windows or Entra single sign-on, so the run
    // cannot drift into the host user's own account.
    isEdge(exe) ? '--inprivate' : '--incognito',
    // Labs quote English UI labels.
    '--lang=en-US',
    '--no-first-run',
    '--no-default-browser-check',
  ];
  // Headless ignores the private-window switch, so its tab opens below in an off-the-record context.
  // A scale of 2 renders every CSS pixel as 2x2 device pixels: the same layout, with sharp text.
  // Windowed runs keep the display's own scale unless --scale is given.
  if (headless || scale !== undefined) args.push(`--force-device-scale-factor=${scale || 1}`);
  if (headless) args.push('--headless=new', 'about:blank');
  else args.push(url);
  const child = spawn(exe, args, { detached: true, stdio: 'ignore' });
  child.unref();
  fs.writeFileSync(stateFile(port), JSON.stringify({ pid: child.pid, profile, exe, headless, windowSize, scale, started: new Date().toISOString() }, null, 2));
  for (let i = 0; i < 80; i++) {
    if (await endpointUp(port)) {
      const connected = await loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null, protocolTimeout: 30000 });
      try {
        if (headless) {
          // Off-the-record contexts outlive this connection and skip ambient single sign-on.
          const context = await connected.createBrowserContext();
          const page = await context.newPage();
          rememberTab(port, page);
          await page.setViewport(viewport(windowSize, scale));
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
          const state = readState(port);
          state.captureScale = await page.evaluate(() => devicePixelRatio);
          fs.writeFileSync(stateFile(port), JSON.stringify(state, null, 2));
        } else {
          const [first] = (await connected.pages()).filter(p => !p.url().startsWith('devtools://'));
          if (first) {
            rememberTab(port, first);
            const state = readState(port);
            state.captureScale = scale === undefined ? await first.evaluate(() => devicePixelRatio) : Number(scale);
            fs.writeFileSync(stateFile(port), JSON.stringify(state, null, 2));
          }
          // Managed devices can open a browser sign-in page instead of the URL; navigate past it.
          if (first && url !== 'about:blank' && first.url() !== url) {
            await first.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
          }
        }
      } finally {
        await connected.disconnect();
      }
      return { pid: child.pid, profile, exe };
    }
    await wait(250);
  }
  throw new Error(`The browser did not open DevTools on port ${port}. Run "close" to clean up.`);
}

async function close({ port }) {
  const state = readState(port);
  if (!state || !Number.isInteger(state.pid) || !ownsProfile(state.profile)) {
    return { profileRemoved: false };
  }
  if (await endpointUp(port)) {
    if (!isAlive(state.pid)) {
      throw new Error(`Port ${port} is active but its recorded browser process is not. Refusing to close an unrelated browser.`);
    }
    const browser = await loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, protocolTimeout: 30000 });
    try {
      await assertOwnedBrowser(browser, state.pid);
    } catch (error) {
      await browser.disconnect();
      throw error;
    }
    await browser.close();
  }
  for (let i = 0; i < 40 && isAlive(state.pid); i++) await wait(250);
  if (isAlive(state.pid)) {
    throw new Error(`Browser process ${state.pid} did not exit. Its temporary profile was left in place.`);
  }
  const profileRemoved = removeProfile(state.profile);
  fs.rmSync(stateFile(port), { force: true });
  return { profileRemoved, profile: state.profile };
}

async function assertOwnedBrowser(browser, expectedPid) {
  const session = await browser.target().createCDPSession();
  try {
    const { processInfo } = await session.send('SystemInfo.getProcessInfo');
    const actualPid = processInfo.find(process => process.type === 'browser')?.id;
    if (actualPid !== expectedPid) {
      throw new Error(`DevTools reported browser PID ${actualPid ?? 'unknown'}, expected ${expectedPid}. Refusing to close an unrelated browser.`);
    }
  } catch (error) {
    if (error.message.includes('Refusing to close')) throw error;
    throw new Error(`Could not verify the browser process on port; refusing to close it. ${error.message}`, { cause: error });
  } finally {
    await session.detach();
  }
}

async function connectBrowser(port) {
  if (!(await endpointUp(port))) throw new Error(`No browser on port ${port}. Run "launch" first.`);
  return loadPuppeteer().connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null, protocolTimeout: 120000 });
}

// puppeteer keeps the DevTools target id here and has no public getter for it.
const targetId = page => page.target()._targetId;

/** Records a tab at the end of the "pages" order for this port. */
function rememberTab(port, page) {
  const state = readState(port);
  const id = targetId(page);
  if (!state || !id) return;
  state.tabs = [...(state.tabs || []).filter(t => t !== id), id];
  fs.writeFileSync(stateFile(port), JSON.stringify(state, null, 2));
}

/**
 * Tabs in "pages" order, browser pages left out. browser.pages() returns a different order on
 * each connection, so the order tabs were opened in is kept in the state file and --tab indexes
 * stay stable. Tabs the state file does not know yet go last, off-the-record (headless) first.
 */
async function listPages(browser, port) {
  const pages = (await browser.pages()).filter(p => !/^(devtools|edge|chrome):\/\//.test(p.url()));
  const isDefault = p => p.browserContext() === browser.defaultBrowserContext();
  const state = port === undefined ? null : readState(port);
  const order = (state && state.tabs) || [];
  const rank = p => { const i = order.indexOf(targetId(p)); return i < 0 ? Infinity : i; };
  const known = pages.filter(p => rank(p) !== Infinity).sort((a, b) => rank(a) - rank(b));
  const unknown = pages.filter(p => rank(p) === Infinity);
  const sorted = [...known, ...unknown.filter(p => !isDefault(p)), ...unknown.filter(isDefault)];
  const ids = sorted.map(targetId);
  if (state && ids.every(Boolean) && ids.join() !== order.join()) {
    state.tabs = ids;
    fs.writeFileSync(stateFile(port), JSON.stringify(state, null, 2));
  }
  return sorted;
}

async function connect({ port = DEFAULT_PORT, url, tab } = {}) {
  const browser = await connectBrowser(port);
  const pages = await listPages(browser, port);
  let page;
  if (tab !== undefined) page = pages[tab];
  else page = url ? pages.find(p => p.url().startsWith(url)) : pages[0];
  if (!page) {
    const open = pages.map(p => p.url()).join(', ') || 'none';
    await browser.disconnect();
    throw new Error(url || tab !== undefined ? `No such tab. Open tabs: ${open}` : 'No open tab.');
  }
  page.setDefaultTimeout(20000);
  const state = readState(port);
  // Viewport overrides end with the connection that set them; headless tabs need it every time.
  if (state && state.headless) await page.setViewport(viewport(state.windowSize, state.scale));
  const cdp = await page.createCDPSession();
  // An unfocused window closes menus and pauses some UI; emulating focus keeps captures stable.
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  return { browser, page, cdp };
}

async function newTab(page, url, port) {
  // The new tab must share the selected tab's context, or a headless run loses its sign-in.
  const tab = await page.browserContext().newPage();
  rememberTab(port, tab);
  const state = readState(port);
  if (state && state.headless) await tab.setViewport(viewport(state.windowSize, state.scale));
  await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  // A signed-in session usually passes through the sign-in page and back; wait for the URL to settle.
  let last = '';
  for (let i = 0; i < 30; i++) {
    await wait(1000);
    const current = tab.url();
    if (current === last && !SIGN_IN_PAGE.test(current)) break;
    last = current;
  }
  return tab;
}

// Copilot Studio, Teams and side panels render parts of the UI in iframes, so look in every frame.
async function controls(page, pattern = '') {
  const all = [];
  for (const [index, frame] of page.frames().entries()) {
    const found = await frame.evaluate((selector, source) => {
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
            role: e.getAttribute('role') || e.tagName.toLowerCase() + (e.type ? `:${e.type}` : ''),
            label: e.getAttribute('aria-label') || e.getAttribute('placeholder') || '',
            // Never read a password field's value.
            text: e.matches('input,textarea') ? '' : (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 100),
            title: e.getAttribute('title') || '',
            state,
            box: [box.x, box.y, box.width, box.height].map(Math.round),
          };
        })
        .filter(c => !re || re.test(`${c.label} ${c.text} ${c.title}`));
    }, CONTROLS, pattern).catch(() => []);
    for (const c of found) all.push({ ...c, frame: index });
  }
  return all;
}

async function pageText(page) {
  const parts = [];
  for (const [index, frame] of page.frames().entries()) {
    if (index > 0 && NOISE_FRAME.test(frame.url())) continue;
    const text = await frame.evaluate(() => (document.body ? document.body.innerText : '')).catch(() => '');
    if (text.trim()) parts.push(index === 0 ? text : `\n--- frame ${index} ---\n${text}`);
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

async function click(page, name, nth) {
  const matches = [];
  for (const frame of page.frames()) {
    const list = await frame.evaluateHandle((selector, wanted) => {
      const norm = v => (v || '').trim().replace(/\s+/g, ' ');
      return [...document.querySelectorAll(selector)].filter(e => {
        const box = e.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(e).visibility !== 'hidden'
          && [e.getAttribute('aria-label'), e.innerText, e.getAttribute('title')].some(v => norm(v) === wanted);
      });
    }, CLICKABLE, name).catch(() => null);
    if (!list) continue;
    for (const property of (await list.getProperties()).values()) {
      const element = property.asElement();
      if (element) matches.push(element); else await property.dispose();
    }
    await list.dispose();
  }
  try {
    if (nth === undefined && matches.length !== 1) {
      throw new Error(`Expected one visible control named "${name}", found ${matches.length}. Run "controls" to see names, or pass --nth.`);
    }
    const target = matches[nth || 0];
    if (!target) throw new Error(`No match ${nth} for "${name}"; found ${matches.length}.`);
    await target.click();
  } finally {
    await Promise.all(matches.map(m => m.dispose().catch(() => {})));
  }
}

// Headless browsers have no file dialog to click through, so files are handed to the
// chooser the page opens, or set on its <input type="file"> when nothing opens one.
async function upload(page, files, { click: name, at, nth, timeout = 15000 } = {}) {
  const resolved = files.map(file => path.resolve(file));
  for (const file of resolved) if (!fs.existsSync(file)) throw new UsageError(`No such file: ${file}`);
  if (name !== undefined || at !== undefined) {
    const chooser = page.waitForFileChooser({ timeout });
    if (name !== undefined) await click(page, name, nth);
    else { const [x, y] = String(at).split(',').map(Number); await page.mouse.click(x, y); }
    await (await chooser).accept(resolved);
    return 'file dialog';
  }
  const inputs = [];
  for (const frame of page.frames()) inputs.push(...await frame.$$('input[type=file]').catch(() => []));
  try {
    const input = inputs[nth || 0];
    if (!input) throw new Error(`Found ${inputs.length} file inputs. Pass --click or --at for the control that opens the file dialog.`);
    await input.uploadFile(...resolved);
    return `file input ${nth || 0} of ${inputs.length}`;
  } finally {
    await Promise.all(inputs.map(i => i.dispose().catch(() => {})));
  }
}

async function clearField(page) {
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
  await page.keyboard.down(modifier);
  await page.keyboard.press('a');
  await page.keyboard.up(modifier);
  await page.keyboard.press('Backspace');
}

async function typeAt(page, x, y, text, { clear = false, enter = false } = {}) {
  await page.mouse.click(x, y);
  if (clear) await clearField(page);
  // insertText keeps line breaks and characters exactly as written in the lab.
  await page.keyboard.sendCharacter(text);
  if (enter) await page.keyboard.press('Enter');
}

async function submitPrompt(page, text, { sendLabel = 'Send', timeout = 120000 } = {}) {
  const editorCount = frame => frame.evaluate(selector => [...document.querySelectorAll(selector)]
    .filter(e => e.getBoundingClientRect().width > 0).length, EDITOR).catch(() => 0);
  const frames = [];
  for (const frame of page.frames()) if (await editorCount(frame)) frames.push(frame);
  if (frames.length !== 1) throw new Error(`Expected the prompt editor in one frame, found ${frames.length}. Use "typeat" instead.`);
  const [frame] = frames;
  await frame.evaluate(selector => {
    const editors = [...document.querySelectorAll(selector)].filter(e => e.getBoundingClientRect().width > 0);
    if (editors.length !== 1) throw new Error(`Expected one prompt editor, found ${editors.length}. Use "typeat" instead.`);
    const current = editors[0].value !== undefined ? editors[0].value : editors[0].innerText;
    if (current.replace(/[\u200b\u200c]/g, '').trim()) throw new Error('The prompt editor is not empty.');
    editors[0].focus();
  }, EDITOR);
  // insertText keeps line breaks and characters exactly as written in the lab.
  await page.keyboard.sendCharacter(text);
  await frame.waitForFunction(label => [...document.querySelectorAll('button')]
    .some(b => b.getAttribute('aria-label') === label && !b.disabled && b.getBoundingClientRect().width > 0),
  { timeout: 15000, polling: 250 }, sendLabel);
  await click(page, sendLabel);
  const firstLine = text.split('\n').find(line => line.trim()).trim();
  await frame.waitForFunction((selector, line) => {
    const editor = [...document.querySelectorAll(selector)].find(e => e.getBoundingClientRect().width > 0);
    const current = editor ? (editor.value !== undefined ? editor.value : editor.innerText) : '';
    return !current.replace(/[\u200b\u200c]/g, '').trim() && document.body.innerText.includes(line);
  }, { timeout, polling: 1000 }, EDITOR, firstLine);
}

async function waitForText(page, text, timeout = 300000) {
  await page.waitForFunction(t => document.body.innerText.includes(t), { timeout, polling: 1000 }, text);
}

/** Reads LAB_CREDENTIALS. Returns null when unset unless required. */
function readCredentials(required = false) {
  const file = process.env.LAB_CREDENTIALS;
  if (!file) {
    if (required) throw new UsageError('Set LAB_CREDENTIALS to a JSON file outside the repository with "username" and "password".');
    return null;
  }
  if (insideRepo(file)) throw new UsageError('Keep the LAB_CREDENTIALS file outside the repository.');
  const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const { username, password } = data;
  if (required && (!username || !password)) throw new UsageError(`${file} needs "username" and "password".`);
  // Earlier passwords (after a forced change) and any extra "redact" terms are masked too.
  const secrets = Object.entries(data)
    .filter(([key, value]) => /password/i.test(key) && typeof value === 'string')
    .map(([, value]) => value);
  return { username, password, secrets, redact: Array.isArray(data.redact) ? data.redact : [] };
}

/** Masks the training account in anything this script prints: logs and run notes get shared. */
function redact(text) {
  let out = String(text == null ? '' : text);
  let credentials = null;
  try { credentials = readCredentials(); } catch { /* reported by the command that needs it */ }
  const redactQuery = value => value.replace(
    /([?&])([^=?&\s#]+)=([^&\s#]*)/gi,
    (match, separator, name) => /^(?:sig|signature|x-amz-signature|x-goog-signature|token|access_token|id_token|auth_token|authorization|client_secret|secret|code|code_verifier|key|api_key|credential|capability)$/i.test(name)
      ? `${separator}${name}=[REDACTED]`
      : match,
  );
  if (!credentials) return redactQuery(out).replace(/([?&]login_hint=)[^&\s]+/gi, '$1[LAB_USER]');
  for (const secret of new Set(credentials.secrets)) {
    if (secret.length >= 4) out = out.replace(new RegExp(escapeRe(secret), 'g'), '[PASSWORD]');
  }
  const user = credentials.username || '';
  const local = user.split('@')[0];
  // Provisioned accounts often repeat a tag from the sign-in name in the display name,
  // for example "User AB12CD34", so mask the name's distinctive parts as well.
  const terms = [user, encodeURIComponent(user), local, ...local.split(/[^A-Za-z0-9]+/), ...(local.match(/[A-Z0-9]{6,}/g) || []), ...credentials.redact]
    .filter(term => term && term.length >= 6)
    .sort((a, b) => b.length - a.length);
  for (const term of new Set(terms)) out = out.replace(new RegExp(escapeRe(term), 'gi'), '[LAB_USER]');
  return redactQuery(out).replace(/([?&]login_hint=)[^&\s]+/gi, '$1[LAB_USER]');
}

async function fill(page, selector, value) {
  await page.click(selector);
  // Sign-in pages can prefill the field (login_hint), so replace rather than append.
  await clearField(page);
  await page.keyboard.sendCharacter(value);
  await page.keyboard.press('Enter');
}

/**
 * Completes a Microsoft Entra sign-in on the selected tab as the training account.
 * Stops for a person on MFA, password change or a locked account. Some apps
 * (Copilot Studio) send the tab back to sign-in once after their first load, so
 * this keeps watching for a few seconds after the app opens.
 */
async function login(page, { username, password }, { forbid, timeout = 120000 } = {}) {
  const deadline = Date.now() + timeout;
  let settled = 0;
  while (Date.now() < deadline && settled < 3) {
    if (!SIGN_IN_PAGE.test(page.url())) {
      settled += 1;
      await wait(4000);
      continue;
    }
    settled = 0;
    const state = await page.evaluate(user => {
      const text = document.body ? document.body.innerText : '';
      const visible = selector => [...document.querySelectorAll(selector)]
        .some(e => { const box = e.getBoundingClientRect(); return box.width > 100 && box.height > 20; });
      const person = /Approve sign in request|Enter code|Verify your identity|More information required|Update your password|account has been locked/i.exec(text);
      if (person) return `person:${person[0]}`;
      if (visible('input[type=password]')) return 'password';
      if (visible('input[type=email]')) return 'email';
      if (/Stay signed in\?/i.test(text)) return 'stay';
      if (/Pick an account/i.test(text)) {
        // Only ever choose the training account; anything else may be the host user's own sign-in.
        const tiles = [...document.querySelectorAll('[role=button],[role=listitem] *,div.table')];
        const own = tiles.find(e => (e.innerText || '').toLowerCase().includes(user.toLowerCase())
          && e.getBoundingClientRect().height > 20 && e.getBoundingClientRect().height < 140);
        const other = [...document.querySelectorAll('[role=button],div,a,button')]
          .find(e => (e.innerText || '').trim() === 'Use another account' && e.getBoundingClientRect().height > 0);
        if (own || other) { (own || other).click(); return 'picked'; }
      }
      return 'waiting';
    }, username).catch(() => 'waiting');
    if (state.startsWith('person:')) {
      throw new NeedsPersonError(`Sign-in needs a person ("${state.slice(7)}"). Finish it in a windowed run, then run "login" again.`);
    }
    if (state === 'email') await fill(page, 'input[type=email]', username);
    else if (state === 'password') await fill(page, 'input[type=password]', password);
    else if (state === 'stay') await page.click('#idSIButton9').catch(() => {});
    await wait(3000);
  }
  if (SIGN_IN_PAGE.test(page.url())) throw new Error('Still on the sign-in page. Run "text" to see why.');
  if (forbid) {
    const re = new RegExp(forbid, 'i');
    if (re.test(await pageText(page))) {
      await page.goto('about:blank').catch(() => {});
      throw new WrongAccountError('Wrong account: the page showed the --forbid text. The tab was cleared; stop and check the sign-in.');
    }
  }
  return displayOrigin(page.url());
}

const pngSize = buffer => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

// "controls" boxes are CSS pixels; captures are device pixels. On a scaled display, crop boxes need the ratio.
async function scaleNote(page) {
  const ratio = await page.evaluate(() => window.devicePixelRatio);
  return ratio === 1 ? 'Scale 1: control boxes are capture pixels.' : `Scale ${ratio}: multiply control boxes by ${ratio} for crop specs.`;
}

async function shot(cdp, file, clip, captureScale, { restoreMetrics = true } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // CDP screenshot clips use CSS pixels; scale the clip itself to retain native pixels.
  // Coordinates are in the document, so add the current viewport scroll offset.
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: 'JSON.stringify([visualViewport.pageLeft, visualViewport.pageTop, innerWidth, innerHeight, devicePixelRatio])',
    returnByValue: true,
  });
  const [left, top, width, height, dpr] = JSON.parse(result.value);
  const scale = Number(captureScale) || dpr;
  const source = clip
    ? { ...clip, scale: clip.scale === undefined ? scale : clip.scale }
    : { x: 0, y: 0, width, height, scale };
  const params = {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
    clip: { ...source, x: source.x + left, y: source.y + top },
  };
  let response;
  try {
    // Normalize DPR so CDP's clip scale produces the same pixel density on every capture.
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    response = await cdp.send('Page.captureScreenshot', params);
  } finally {
    if (restoreMetrics) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
    }
  }
  const { data } = response;
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(file, buffer);
  return { file, buffer, ...pngSize(buffer) };
}

/**
 * Works out the clip for --clip x,y,w,h or --element <name> (CSS pixels, frames
 * included), widened by --pad and kept inside the viewport. --up climbs to an
 * ancestor, for example from a dialog's title to the whole dialog.
 */
async function region(page, { clip, element, nth, up = 0, pad = 12, zoom = 1, captureScale } = {}) {
  if (clip === undefined && element === undefined) return null;
  let box;
  if (clip !== undefined) {
    const [x, y, width, height] = String(clip).split(',').map(Number);
    if (![x, y, width, height].every(Number.isFinite)) throw new UsageError('--clip needs x,y,w,h in CSS pixels.');
    box = { x, y, width, height };
  } else {
    const matches = [];
    for (const frame of page.frames()) {
      const list = await frame.evaluateHandle((wanted, levels) => {
        const norm = v => (v || '').trim().replace(/\s+/g, ' ');
        const visible = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
        // Exact label, title or own text; the innermost match wins so a name picks its own control.
        const hits = [...document.querySelectorAll('body *')].filter(e => visible(e)
          && [e.getAttribute('aria-label'), e.getAttribute('title'), e.innerText].some(v => norm(v) === wanted));
        return hits.filter(e => !hits.some(other => other !== e && e.contains(other))).map(e => {
          let target = e;
          for (let i = 0; i < levels && target.parentElement; i++) target = target.parentElement;
          return target;
        });
      }, element, Number(up)).catch(() => null);
      if (!list) continue;
      for (const property of (await list.getProperties()).values()) {
        const handle = property.asElement();
        if (handle) matches.push(handle); else await property.dispose();
      }
      await list.dispose();
    }
    try {
      if (nth === undefined && matches.length !== 1) throw new Error(`Expected one visible element named "${element}", found ${matches.length}. Pass --nth, or use --clip.`);
      const target = matches[nth || 0];
      if (!target) throw new Error(`No match ${nth} for "${element}"; found ${matches.length}.`);
      // Crops cannot reach past the viewport, so bring the element into view first.
      await target.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }));
      await wait(400);
      box = await target.boundingBox();
      if (!box) throw new Error(`"${element}" has no box on screen.`);
    } finally {
      await Promise.all(matches.map(m => m.dispose().catch(() => {})));
    }
  }
  const view = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }));
  const p = Number(pad);
  const x = Math.max(0, box.x - p);
  const y = Math.max(0, box.y - p);
  const width = Math.min(view.width, box.x + box.width + p) - x;
  const height = Math.min(view.height, box.y + box.height + p) - y;
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    scale: (Number(captureScale) || view.deviceScaleFactor) * (Number(zoom) || 1),
  };
}

async function restoreDeviceMetrics(page, cdp, metrics) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: metrics.width,
    height: metrics.height,
    deviceScaleFactor: metrics.deviceScaleFactor,
    mobile: false,
  });
}

async function prepareCaptureScale(page, cdp, port) {
  const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }));
  const state = readState(port);
  const scale = Number(state && state.captureScale) || metrics.deviceScaleFactor;
  if (scale !== metrics.deviceScaleFactor) {
    await restoreDeviceMetrics(page, cdp, { ...metrics, deviceScaleFactor: scale });
  }
  return scale;
}

/**
 * Captures the same state in both themes. The product must follow the system
 * theme (its own theme setting on "System") for prefers-color-scheme to apply.
 */
async function pair(page, cdp, outDir, name, { settle = 1500, schemeAttr, clip, regionOptions, captureScale } = {}) {
  const shots = [];
  const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio }));
  const scale = Number(captureScale) || metrics.deviceScaleFactor;
  await restoreDeviceMetrics(page, cdp, { ...metrics, deviceScaleFactor: 1 });
  try {
    for (const value of ['light', 'dark']) {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value }]);
      await wait(settle);
      if (schemeAttr) {
        const actual = await page.evaluate(attr => document.documentElement.getAttribute(attr), schemeAttr);
        if (actual !== value) throw new Error(`Expected <html ${schemeAttr}="${value}">, found "${actual}". Set the product theme to System, or omit --scheme-attr.`);
      }
      // Theme changes can reset scroll or move the target; remeasure element crops per theme.
      const currentClip = regionOptions ? await region(page, { ...regionOptions, captureScale: scale }) : clip;
      shots.push(await shot(cdp, path.join(outDir, `${name}-${value}.png`), currentClip, scale, { restoreMetrics: false }));
    }
  } finally {
    await page.emulateMediaFeatures([]);
    await restoreDeviceMetrics(page, cdp, metrics);
  }
  if (shots[0].buffer.equals(shots[1].buffer)) {
    throw new Error('Light and dark captures are identical: the page ignores prefers-color-scheme. Set the product theme to System.');
  }
  return shots;
}

function outDir(dir) {
  const resolved = path.resolve(dir);
  if (insideRepo(resolved)) {
    throw new UsageError(`Keep raw captures outside the repository (${resolved}): they can show personal data. crop_images.py writes the published images.`);
  }
  return resolved;
}

function parseArgs(argv) {
  const opts = { port: Number(process.env.LAB_CDP_PORT) || DEFAULT_PORT, out: DEFAULT_OUT, settle: 1500, forbid: process.env.LAB_FORBID };
  const flags = new Set(['headless', 'help', 'clear', 'enter']);
  const valued = new Set(['port', 'url', 'tab', 'out', 'settle', 'scheme-attr', 'send-label', 'timeout', 'nth', 'forbid', 'browser', 'window-size', 'click', 'at', 'scale', 'clip', 'element', 'up', 'pad', 'zoom']);
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
  for (const key of ['port', 'tab', 'settle', 'timeout', 'nth', 'scale', 'up', 'pad', 'zoom']) {
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

const print = text => console.log(redact(text));
const readInput = source => fs.readFileSync(source === '-' ? 0 : source, 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');

async function main(argv) {
  const { command, args, opts } = parseArgs(argv);
  if (!command || opts.help) { process.stdout.write(USAGE); return; }

  if (command === 'launch') {
    const { pid, profile, exe } = await launch({ ...opts, url: args[0] });
    print(`${path.basename(exe)} ${pid} on port ${opts.port}${opts.headless ? ' (headless)' : ''}, temporary profile ${profile}`);
    print(opts.headless
      ? 'Run "login" with LAB_CREDENTIALS set to sign in. Run "close" when done.'
      : 'Sign in to the training tenant in that window (or run "login"), then continue. Run "close" when done.');
    return;
  }
  if (command === 'close') {
    const { profileRemoved, profile } = await close(opts);
    print(profileRemoved ? `Closed and deleted ${profile}` : 'Closed. No temporary profile recorded for this port.');
    return;
  }
  if (command === 'pages') {
    const browser = await connectBrowser(opts.port);
    for (const [i, p] of (await listPages(browser, opts.port)).entries()) print(`${i}\t${displayOrigin(p.url())}\t${await p.title()}`);
    await browser.disconnect();
    return;
  }

  const known = new Set(['goto', 'newtab', 'login', 'controls', 'text', 'click', 'clickat', 'typeat', 'press', 'scroll', 'prompt', 'upload', 'wait', 'shot', 'pair']);
  if (!known.has(command)) throw new UsageError(`Unknown command "${command}".`);
  const captures = ['shot', 'pair'].includes(command) ? outDir(opts.out) : null;
  const credentials = command === 'login' ? readCredentials(true) : null;
  const { browser, page, cdp } = await connect(opts);
  try {
    switch (command) {
      case 'goto':
        await page.goto(need(args, 1, 'goto <url>')[0], { waitUntil: 'domcontentloaded', timeout: 90000 });
        print(displayOrigin(page.url()));
        break;
      case 'newtab': {
        const tab = await newTab(page, need(args, 1, 'newtab <url>')[0], opts.port);
        const index = (await listPages(browser, opts.port)).indexOf(tab);
        print(`${index}\t${displayOrigin(tab.url())}${SIGN_IN_PAGE.test(tab.url()) ? '\t(sign-in page: run "login --tab ' + index + '")' : ''}`);
        break;
      }
      case 'login':
        print(`Signed in: ${await login(page, credentials, { forbid: opts.forbid, timeout: opts.timeout })}`);
        break;
      case 'controls':
        for (const c of await controls(page, args[0])) {
          print([c.frame ? `[frame ${c.frame}]` : '', c.role, c.label && `label="${c.label}"`, c.text && `text="${c.text}"`, c.title && `title="${c.title}"`, c.state && `[${c.state}]`, `@ ${c.box.join(' ')}`].filter(Boolean).join('  '));
        }
        break;
      case 'text':
        print(await pageText(page));
        break;
      case 'click':
        await click(page, need(args, 1, 'click <name>')[0], opts.nth);
        break;
      case 'clickat': {
        const [x, y] = need(args, 2, 'clickat <x> <y>').map(Number);
        await page.mouse.click(x, y);
        break;
      }
      case 'typeat': {
        const [x, y, source] = need(args, 3, 'typeat <x> <y> <text|->');
        await typeAt(page, Number(x), Number(y), source === '-' ? readInput('-') : source, opts);
        break;
      }
      case 'press':
        await page.keyboard.press(need(args, 1, 'press <key>')[0]);
        break;
      case 'scroll': {
        const [x, y, dy] = need(args, 3, 'scroll <x> <y> <dy>').map(Number);
        await page.mouse.move(x, y);
        await page.mouse.wheel({ deltaY: dy });
        break;
      }
      case 'prompt': {
        const text = readInput(need(args, 1, 'prompt <file|->')[0]);
        await submitPrompt(page, text, { sendLabel: opts.sendLabel, timeout: opts.timeout });
        print(`Sent at ${new Date().toISOString()}: ${text.split('\n')[0]}`);
        break;
      }
      case 'upload': {
        const files = need(args, 1, 'upload <file...> [--click <name> | --at <x,y>]');
        print(`Uploaded ${files.map(f => path.basename(f)).join(', ')} through the ${await upload(page, files, opts)}`);
        break;
      }
      case 'wait':
        await waitForText(page, need(args, 1, 'wait <text>')[0], opts.timeout);
        break;
      case 'shot': {
        const scale = await prepareCaptureScale(page, cdp, opts.port);
        const s = await shot(
          cdp,
          path.join(captures, `${need(args, 1, 'shot <name>')[0]}.png`),
          await region(page, { ...opts, captureScale: scale }),
          scale,
        );
        print(`${s.file}  ${s.width} x ${s.height}`);
        print(await scaleNote(page));
        break;
      }
      case 'pair': {
        const scale = await prepareCaptureScale(page, cdp, opts.port);
        const regionOptions = opts.element === undefined && opts.clip === undefined ? null : { ...opts, captureScale: scale };
        for (const s of await pair(page, cdp, captures, need(args, 1, 'pair <name>')[0], { ...opts, captureScale: scale, regionOptions })) print(`${s.file}  ${s.width} x ${s.height}`);
        print(await scaleNote(page));
        break;
      }
    }
  } finally {
    await cdp.detach().catch(() => {});
    await browser.disconnect();
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(redact(error.message));
    process.exitCode = error instanceof UsageError ? 2
      : error instanceof NeedsPersonError ? 3
        : error instanceof WrongAccountError ? 4 : 1;
  });
}

module.exports = { launch, close, connect, newTab, login, controls, pageText, click, typeAt, submitPrompt, upload, waitForText, shot, pair, region, redact, assertOwnedBrowser };
