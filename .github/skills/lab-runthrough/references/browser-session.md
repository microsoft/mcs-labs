# Browser session reference

`scripts/capture.cjs` drives Edge or Chrome over the DevTools protocol, in a private
window with a new temporary profile, either in a desktop window or headless. Each command
connects, does one thing and disconnects, so the browser and the signed-in session survive
between commands. It uses the `puppeteer` package that `npm ci` installs for pa11y-ci, and
puppeteer's Chrome for Testing build for headless runs.

## Commands

Run from the repository root:

```bash
node .github/skills/lab-runthrough/scripts/capture.cjs <command> [args] [options]
```

| Command | What it does |
| --- | --- |
| `launch [url]` | Starts the browser in a private window with a new temporary profile and DevTools on `--port`, and opens `url`. |
| `pages` | Lists open tabs with the index `--tab` uses, URL and title. Indexes follow the order tabs were opened in and stay stable while the browser runs; a headless run keeps an `about:blank` tab at 1. |
| `goto <url>` | Navigates the selected tab and waits for `domcontentloaded`. |
| `newtab <url>` | Opens a tab in the selected tab's session (same sign-in), waits for sign-in redirects to settle, and prints its index. |
| `login` | Signs in on the selected tab as the `LAB_CREDENTIALS` account (see [Signing in](#signing-in)). |
| `controls [regex]` | Lists visible controls in every frame: role, label, text, title, state (`on`, `expanded`, `selected`, `disabled`) and box `x y w h` in CSS pixels. Controls inside an iframe start with `[frame n]`. |
| `text` | Prints the tab's visible text, including iframes. Use it to compare UI wording with the lab. |
| `click <name>` | Clicks the single visible control, in any frame, whose `aria-label`, text or title equals `name`. Fails if none or several match, unless `--nth` picks one. |
| `clickat <x> <y>` | Clicks a point, for controls without a usable name. |
| `typeat <x> <y> <text\|->` | Clicks a point and types the text (or stdin) verbatim. `--clear` empties the field first; `--enter` presses Enter after. |
| `press <key>` | Presses a key, for example `Enter`, `Escape` or `Tab`. |
| `scroll <x> <y> <dy>` | Scrolls the element under a point, for panes that do not scroll with the page. |
| `prompt <file\|->` | Types the prompt verbatim (line breaks kept) into the empty editor, clicks Send and waits until it is posted. |
| `upload <file...>` | Picks files for an upload step, for example a skill `.zip` or a knowledge file. With `--click <name>` or `--at <x,y>` it clicks the control and answers the file dialog it opens, which works headless; without either it sets the files on the page's `<input type="file">` (`--nth` picks one). Use files from the lab's repo folder or a download outside the repository. |
| `wait <text>` | Waits until the top document shows `text`; it does not inspect iframe text. |
| `shot <name>` | Saves `<out>/<name>.png` and prints its size and the display scale. |
| `pair <name>` | Saves `<name>-light.png` and `<name>-dark.png` by emulating `prefers-color-scheme`, and fails if both are identical. |
| `close` | Closes the browser and deletes the temporary profile. |

| Option | Default | Notes |
| --- | --- | --- |
| `--port <n>` | 9334 or `LAB_CDP_PORT` | One port per browser. Use a different port for each parallel run. |
| `--url <prefix>` | first tab | Selects the tab whose URL starts with the prefix. |
| `--tab <n>` | | Selects a tab by its `pages` index. |
| `--out <dir>` | `<temp>/lab-runthrough` | Must be outside the repository. |
| `--settle <ms>` | 1500 | Wait after each theme switch in `pair`. |
| `--scheme-attr <name>` | none | Makes `pair` check `<html name="light\|dark">`. Microsoft Copilot uses `data-color-scheme`. |
| `--send-label <name>` | `Send` | Accessible name of the send button. |
| `--timeout <ms>` | 120000 for `prompt` and `login`, 300000 for `wait` | |
| `--nth <n>` | | `click`, `upload`: use the nth match (from 0). |
| `--click <name>`, `--at <x,y>` | | `upload`: the control or point that opens the file dialog. |
| `--clear`, `--enter` | off | `typeat` only. |
| `--forbid <regex>` | `LAB_FORBID` | `login`: fail with exit code 4 and blank the tab if the page shows this text. Pass the host user's own name or alias. |
| `--browser <name\|path>` | Edge, then Chrome; Chrome for Testing when headless | `edge`, `chrome` (Chrome for Testing if installed) or an executable path. |
| `--window-size <w,h>` | 1600,1000 | Window size, or the viewport when headless. Keep it stable across a lab so crops line up. |
| `--headless` | off | No window. The tab opens in an off-the-record session; sign in with `login`. |

Exit codes: 0 success, 1 failure (message on stderr), 2 usage error, 3 a person is needed
(MFA, password change, locked account), 4 wrong account.

## Signing in

There are two ways to get a signed-in session, and both keep the run out of the host
user's own accounts.

- **The person signs in.** `launch` without `--headless`, and ask them to sign in to the
  training account in the window that opens. Use this when the tenant needs MFA or you have
  no credentials.
- **A provisioned training account.** Event and demo tenants hand out throwaway accounts
  (see `training-accounts.md`). Save the credentials as JSON outside the repository, for
  example `<temp>/<run>/account.json` with `username` and `password`, and point
  `LAB_CREDENTIALS` at it. `login` types them into the Microsoft sign-in page, picks only
  that account in **Pick an account**, answers **Stay signed in?**, and then keeps watching
  for a few seconds because some apps send the tab back to sign-in once more.

  ```powershell
  $env:LAB_CREDENTIALS = "$env:TEMP\mcs-run\account.json"
  node .github/skills/lab-runthrough/scripts/capture.cjs launch https://copilotstudio.microsoft.com --headless --port 9352
  node .github/skills/lab-runthrough/scripts/capture.cjs login --port 9352 --forbid "<your name>|<your alias>"
  ```

  `login` stops with exit code 3 on MFA, **Update your password**, **More information
  required** or a locked account. Finish that step in a windowed run (or ask the person
  to), then run `login` again.

When each tool command starts a fresh PowerShell process, set `LAB_CREDENTIALS` again
in every call before invoking the driver, including inspection and capture commands.
An unset variable does not mean the credential file is missing or sign-in has failed:
check file presence without displaying its contents, set the variable, and run `login`
before reporting an authentication blocker.

While `LAB_CREDENTIALS` is set, every command masks the user name, its distinctive parts
(provisioned display names often repeat them, such as "User AB12CD34"), every
`*password*` value in the file and any `login_hint` in its output. Add a `redact` array to
the file for other terms. Screenshots are not masked: crop or avoid the account menu.

## Parallel runs

Headless runs are independent: give each lab its own `--port` (for example 9352, 9353, …),
its own `--out` folder and its own `close`. Each `launch` creates a separate temporary
profile, so the sessions do not share cookies. Several runs can sign in as the same
training account at once, but they share its data: avoid labs that edit the same agent,
record or setting at the same time, and name what you create after the lab. Three or four
concurrent browsers are comfortable on a 16 GB machine.

Use `newtab` rather than `launch` for a second app in the same lab (for example Teams next
to Copilot Studio): the tab shares the first one's sign-in.

## Library use

For longer sequences, require the module and keep one connection:

```js
const cap = require('./.github/skills/lab-runthrough/scripts/capture.cjs');

(async () => {
  const { browser, page, cdp } = await cap.connect({ port: 9334, url: 'https://copilot.cloud.microsoft' });
  try {
    console.table(await cap.controls(page, 'cowork|plugins'));
    await cap.click(page, 'Cowork');
    await cap.submitPrompt(page, promptText, { timeout: 180000 });
    await cap.waitForText(page, 'Northstar');
    await cap.pair(page, cdp, outDir, 'pipeline-plan', { schemeAttr: 'data-color-scheme' });
  } finally {
    await cdp.detach();
    await browser.disconnect();
  }
})();
```

`launch({ port, url, headless })`, `close({ port })`, `login(page, { username, password }, { forbid })`,
`newTab(page, url, port)`, `typeAt`, `pageText` and `redact` are exported too.

## Screenshot workflow

1. Keep the window size fixed for the whole run.
2. Capture with `shot` (single) or `pair` (light and dark).
3. Find the crop box with `controls`. If `shot` reports a scale other than 1, multiply the
   box by it: captures are in device pixels.
4. Write the spec as JSON: `{"<name>": [left, top, right, bottom], "<other>": null}`.
   `null` keeps the whole capture.
5. Run `scripts/crop_images.py <spec> <out> labs/<slug>/images --format webp|png
   [--max-width N] [--sheets <out>/sheets]`. It reads `<name>-light.png` and
   `<name>-dark.png`, or `<name>.png`, and writes `<name>.<ext>` and `<name>-dark.<ext>`.
   It fails when a file is missing, a box falls outside the capture, or a light and dark
   crop are identical.
6. Review the contact sheets, then copy the printed width and height into the missions
   front matter.

Missions screenshots are declared in front matter and rendered by the mission layout:

```yaml
screenshot:
  title: Dataverse connection
  src: /labs/<slug>/images/<name>.webp
  src_dark: /labs/<slug>/images/<name>-dark.webp
  alt: Describe the state shown, not "screenshot".
  width: 480
  height: 226
  caption: Optional one-line caption.
```

The README copy uses
`<picture><source media="(prefers-color-scheme: dark)" srcset="images/<name>-dark.webp"><img src="images/<name>.webp" alt="..."></picture>`.
Omit `src_dark` (and the `<source>`) when the image looks the same in both themes, such as
a slide render.

Classic labs reference `images/<file>` with the same relative path in both copies. Keep the
file name and format so neither copy changes.

## Browser and sign-in quirks

Seen on a managed Windows device in November 2026.

- **Headless Edge cannot sign in on a managed device.** Policies such as `BrowserSignin`
  open `edge://force-signin/` and ignore `--inprivate` when headless, and the browser
  exits during the Microsoft Entra sign-in. That is why `--headless` defaults to
  puppeteer's Chrome for Testing. Windowed `--inprivate` Edge works.
- **Single sign-on leaks the host account.** Device policies (Chrome `CloudAPAuthEnabled`,
  Windows accounts in Edge) sign a normal profile in as the host user. `launch` always uses
  a private window, and headless tabs open in an off-the-record context. **Pick an
  account** can still list the host user's accounts: `login` only picks the training
  account or **Use another account**, and `--forbid` is the backstop.
- Headless pages need an explicit viewport; `launch`, `connect` and `newtab` set it from
  `--window-size`. Every command reapplies it, so a narrow-screen check needs its own
  `launch --window-size`, on another port.
- Off-the-record contexts survive disconnects, but not `close`.
- Apps that open on a landing page (Microsoft 365 Copilot, some Power Platform sites)
  only redirect to sign-in after you choose **Sign in**. Click it, then run `login`.
- `pair` can capture a frame before the theme repaints. Scroll or move the pointer first,
  and open both images before cropping.
- `controls` and `text` include accessible iframe documents, marked `[frame n]`.
  Frame control boxes are relative to that frame, not the top viewport: prefer `click`
  or `prompt` by label. For closed shadow roots or unavailable frame content, take a
  `shot`, then use `clickat` or `typeat` with viewport coordinates read from it.
- Listed controls can belong to offscreen panels or sit behind a dialog. Check their
  viewport coordinates and dismiss the covering surface before clicking. A `button`
  role is not necessarily a native `<button>`; inspect the element before writing a
  tag-specific library selector.
- Check both `disabled` and `aria-disabled="true"` before sending. A click on a disabled
  control can return without submitting anything; verify the editor closes or clears
  before recording success, and check delivery before retrying.
- `wait` only checks the top document. A timeout does not prove that an embedded chat
  failed: inspect `text`, or use the library with a wait scoped to the chat frame.
  Customer Conversation child-agent turns may await the user's confirmation before
  an **Execution summary** appears, so that summary is not a per-reply readiness signal.
- `prompt` refuses when the page has two editors (for example a chat next to a side
  panel). Click the right one and use `typeat`; pass `-` to read multiline text from stdin.
- In Microsoft Copilot chat, a finished reply shows **Copy** or **Copy Response**, and
  **Stop** disappears. Other previews have different controls: inspect the actual reply
  and activity rather than assuming these labels exist everywhere.
- Teaching bubbles can appear after a menu opens. Dismiss them, reopen the menu if the
  dismissal closed it, and verify the screenshot before closing the browser. Crop out
  background account columns as well as account navigation.
- Outlook can show delayed privacy notices, contact cards, and scheduling suggestions.
  Resolve a typed recipient with **Check names** if it remains plain text, verify the
  resolved address, and dismiss overlays before selecting **Send**.
- File pickers: open the **+** or attach menu first, then `upload --click "<item>"`.
- `pages` lists full URLs, which can carry the tenant id (sometimes base64-encoded).
  Keep them out of run logs and PRs.

## Product quirks

Seen in Microsoft Copilot and Cowork in November 2026. Products change; update this list
when a run-through finds something new, and date it.

- Managed Edge may open `edge://force-signin/` in a new profile. `launch` navigates the
  first tab to the URL; if it does not, run `goto`.
- Wait for `domcontentloaded` plus a `wait` on visible text. Copilot keeps network
  connections open, so "network idle" never comes.
- Slash commands such as `/cost` are only submitted by clicking Send, not by Enter.
- The left navigation label alternates between **Plugins** and **Agents & Plugins**.
  Labs should name the destination ("the plugins page") or show both.
- The Zava Sales plugin needs the **Microsoft Business apps (preview)** plugin enabled first.
- Fluent switches report on/off through the `checked` property; `controls` shows `[on]`.
- An unfocused window closes menus and pauses rendering. `connect` turns on focus
  emulation, so captures work while you use another window.
- The Copilot theme setting (Settings and more > Settings > General > Preferences > Theme)
  overrides `prefers-color-scheme` unless it is **System**.
- Dataverse create and update actions show an approval card. **Always allow** applies to
  that task only. Prefer **Allow** during a run-through so each write is visible in the
  log, and never approve a write the lab does not ask for.
- A draft scheduled task stays inactive until you choose **Activate** (or **Activate and
  run now**). Check the Automations list after a reload.
- Copilot Studio sends a new session back to sign-in once, a few seconds after the first
  load (`sso_reload=true`). `login` waits for it; if you signed in by hand, sign in again.
- Copilot Studio shows a one-time **Welcome from your admin** dialog to a new tenant user:
  tick **I have read and agree to the Terms of use**, then **Close**. Next comes a **Find
  your environments here** bubble: **Got it**. Labs should mention both in their first
  sign-in step.
- Copilot Studio follows the system theme by default, so `pair` works without changing a
  setting.
- The first agent **Save** can finish provisioning and return the page to **Build**.
  Wait for that navigation to settle before opening **Preview** or entering a test
  prompt; otherwise text can land in the instructions editor instead.
- Copilot Studio's agent-name input currently limits names to 30 characters. Shorten a
  shared-account test name before adding a suffix; verify that the saved name retained it.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No browser on port …` | Run `launch`, or pass the `--port` you launched with. |
| `Expected one visible control named …, found 0` | Run `controls "<part of the name>"`; the label may have changed (log it as drift). |
| `found 2` or more | Pass `--nth`, or use `clickat` with the box of the right one. |
| `Expected the prompt editor in one frame` | The editor is in a side panel or there are two: click it and use `typeat`. |
| Exit code 3, `Sign-in needs a person` | MFA, password change or locked account: finish it in a windowed run, or ask the person. |
| Exit code 4, `Wrong account` | Forbidden page text matched; this alone does not establish the authenticated identity. Stop and have a person verify the sign-in before continuing. Never weaken the guard to retry. |
| `edge://force-signin` or Edge exits while headless | Drop `--browser edge`; headless uses Chrome for Testing. |
| `Still on the sign-in page` | Run `text` to read the error (wrong password, blocked account). |
| `The prompt editor is not empty` | Clear the editor or start a new chat; the script never appends to a draft. |
| `Light and dark captures are identical` | Set the product theme to System, or use `shot` for a theme-neutral image. |
| `Keep raw captures outside the repository` | Pass an `--out` folder outside the repo. |
| Puppeteer not found | Run `npm ci` in the repository root. |
