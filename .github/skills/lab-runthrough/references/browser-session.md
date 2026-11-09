# Browser session reference

`scripts/capture.cjs` drives Edge or Chrome over the DevTools protocol, in a private
window with a new temporary profile, either in a desktop window or headless. Each command
connects, does one thing and disconnects, so the browser and the signed-in session survive
between commands. It uses the `puppeteer` package that `npm ci` installs for pa11y-ci, and
puppeteer's Chrome for Testing build for headless runs.

Use the browser/mode the person authorized. A request for visible desktop Edge is not
permission to fall back to headless Chrome or the app's embedded browser. Keep an
isolated test profile; if the requested combination cannot work, ask before switching.

## Commands

Run from the repository root:

```bash
node .github/skills/lab-runthrough/scripts/capture.cjs <command> [args] [options]
```

| Command | What it does |
| --- | --- |
| `launch [url]` | Starts the browser in a private window with a new temporary profile and DevTools on `--port`, and opens `url`. |
| `pages` | Lists open tabs with the index `--tab` uses, origin and title; it omits paths and query strings so signed preview URLs are not copied into evidence. Indexes follow the order tabs were opened in and stay stable while the browser runs; a headless run keeps an `about:blank` tab at 1. |
| `goto <url>` | Navigates the selected tab and waits for `domcontentloaded`. |
| `newtab <url>` | Opens a tab in the selected tab's session (same sign-in), waits for sign-in redirects to settle, and prints its index. |
| `login` | Signs in on the selected tab as the `LAB_CREDENTIALS` account (see [Signing in](#signing-in)). |
| `controls [regex]` | Lists visible controls in every frame: role, label, non-input text, title, state (`on`, `expanded`, `selected`, `disabled`) and box `x y w h` in CSS pixels. It does not print typed input values. Controls inside an iframe start with `[frame n]`. |
| `text` | Prints the tab's visible text, excluding known authentication and Microsoft 365 shell frames. Use it to compare UI wording with the lab. |
| `click <name>` | Clicks the single visible control, in any frame, whose `aria-label`, text or title equals `name`. Fails if none or several match, unless `--nth` picks one. |
| `clickat <x> <y>` | Clicks a point, for controls without a usable name. |
| `typeat <x> <y> <text\|->` | Clicks a point and types the text (or stdin) verbatim. `--clear` empties the field first; `--enter` presses Enter after. |
| `press <key>` | Presses a key, for example `Enter`, `Escape` or `Tab`. |
| `scroll <x> <y> <dy>` | Scrolls the element under a point, for panes that do not scroll with the page. |
| `prompt <file\|->` | Types the prompt verbatim (line breaks kept) into the empty editor, clicks Send and waits until it is posted; it does not wait for the product response to finish. |
| `upload <file...>` | Picks files for an upload step, for example a skill `.zip` or a knowledge file. With `--click <name>` or `--at <x,y>` it clicks the control and answers the file dialog it opens, which works headless; without either it sets the files on the page's `<input type="file">` (`--nth` picks one). Use files from the lab's repo folder or a download outside the repository. |
| `wait <text>` | Waits until the top document shows `text`; it does not inspect iframe text. |
| `shot <name>` | Saves `<out>/<name>.png` and prints its size and the display scale. |
| `pair <name>` | Saves `<name>-light.png` and `<name>-dark.png` by emulating `prefers-color-scheme`, and fails if both are identical. |
| `close` | Verifies the DevTools browser PID matches the recorded process, then closes it and deletes the temporary profile. If it cannot prove ownership, it refuses to close the browser. |

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
| `--scale <n>` | 1 headless, display scale windowed | `launch`: device scale factor, kept across reconnects and new tabs. Use 2 for screenshots. |
| `--element <name>` | | `shot`, `pair`: crop to the visible element whose exact label, title or text matches, in any frame. It is scrolled into view first. Add `--nth` when several match. |
| `--up <n>` | 0 | With `--element`: crop the nth ancestor instead, for example a whole card or dialog. |
| `--clip <x,y,w,h>` | | `shot`, `pair`: crop to a viewport box in CSS pixels, as `controls` reports it. |
| `--pad <px>` | 12 | Margin around `--element` or `--clip`, clamped to the viewport. |
| `--zoom <n>` | 1 | Re-renders the crop at n times the device scale (not an upscale), for small widgets. |

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
Set the credential variable again in each fresh shell without printing the secret. The
driver omits URL paths/query strings, skips known authentication frames in `text`, and
does not print typed input values in `controls`; still inspect only the relevant visible
application frame and keep tenant identifiers or signed preview URLs out of evidence.
Screenshot masking is not automatic.

## Parallel runs

Each browser profile has separate cookies, but profiles signed in as the same training
account still share backend records, plugins, agent memory, generated files, schedules
and connections. Run related curriculum labs sequentially by default. Parallel runs are
safe only for genuinely independent accounts/assets after dependencies are checked; a
separate port is not a data-isolation guarantee. Keep credentials until the last dependent
run is complete and never delete another runner's profile, connection or assets. Use exact
lab names and prompts, with no test suffixes or tags.

Use `newtab` rather than `launch` for a second app in the same lab (for example Teams next
to Copilot Studio): the tab shares the first one's sign-in.

Streamed text or a disappearing **Processing** indicator may precede the settled reply.
Before sending, record the current turn and confirm the composer and Send control are
ready. Then require a new assistant turn and wait for any tool output for that prompt to settle.
Cumulative credits or Copy-button counts can belong to earlier turns; they are not
completion signals. Before retrying a timeout, inspect the original turn/run to avoid a
duplicate submission. Preserve per-attempt evidence before virtualized traces move.

If attachment stalls, use a bounded connection timeout and select the intended target
from current URL/target metadata, including redirects. A custom CDP connection should
filter to the required page and frames rather than attach every unrelated or frozen
target; do not persist target IDs in reusable scripts. On every reconnect or new tab,
apply the intended viewport/device scale and verify `window.devicePixelRatio` before
interaction or capture. A launch-time scale alone does not prove the reattached page
retained it. Keep unrelated browsers and profiles untouched.

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
6. Open each crop at full resolution and at its rendered size. Verify it contains the
   current response, whole filename and all required controls, not a prior table or hidden
   dialog. After every theme switch, scroll back to the target and recompute bounds before
   cropping. Use only a real light/dark capture; a theme-neutral hero may have one image.
   Check EXIF/XMP and visually inspect OCR candidates (OCR alone is not a privacy check).
   Retained old images are not fresh captures; say so. Privacy cropping/redaction is
   distinct from changing product state, names or results: prefer a fresh capture with the
   exact lab asset name and never retouch pixels to simulate a different UI result. OCR
   only identifies candidates; inspect images visually too. Compare orphan results with the
   baseline and remove only images made orphan by this branch, never untouched/shared
   images. Then copy the verified dimensions into front matter.

Choose the subject before capturing: outcome-focused hero, one relevant image per
**Show me**, and the actual supplied reference rather than its upload thumbnail. Follow
`../../lab-review/references/learning-design.md`. Check caption versus visible selection,
Preview versus published state, and full-size links with the site's theme JavaScript
loaded. Do not replay a write or disconnect a healthy connection merely to stage an image;
prefer the existing connected state or completed action. Any explicitly authorized
connection change must be restored afterward.

### High-resolution capture checklist

- Aim for at least **2 native image pixels per displayed CSS pixel**. An image displayed
  850 CSS pixels wide should retain at least 1700 pixels across after cropping.
- Prefer a 2x browser device scale at a normal desktop CSS viewport. A larger viewport
  changes layout, not pixel density; zooming out makes text smaller. Never upscale an
  existing raster image and call it a high-resolution capture.
- Launch with `--scale 2 --window-size 1440,900`, then crop at capture time with
  `shot`/`pair --element <name> [--up n]` or `--clip x,y,w,h`. The browser renders just
  that region, so the result is already cropped and sharp; use `null` in the crop spec
  to keep it whole. Add `--zoom 1.5` for a small menu or button so its text reads at the
  size of body text on the lab page. Frame the subject plus enough context to locate it.
- `controls` returns CSS pixels. Convert crop coordinates to image pixels using the
  measured scale, and use the same scale and framing for both themes.
- Keep the pixel budget through cropping and WebP/PNG output. Do not set `--max-width`
  to the page's CSS width. If a small panel lacks enough pixels to fill the column,
  constrain its displayed width or capture a suitable wider frame instead of stretching it.
- Judge text sharpness on the actual lab page as well as the full-resolution image;
  contact sheets alone cannot reveal high-DPI blur. Keep front-matter dimensions accurate.
- Improve newly captured or deliberately replaced images. Do not recapture the existing
  library unless the user requests it.

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
- `pair` can capture a frame before the theme repaints, and a theme switch may reset
  scroll. Wait for the settled state, scroll the target back into view, recompute its
  bounds and open both images before cropping.
- `controls` and `text` include accessible iframe documents, marked `[frame n]`.
  Frame control boxes are relative to that frame, not the top viewport: prefer `click`
  or `prompt` by label. For closed shadow roots or unavailable frame content, take a
  `shot`, then use `clickat` or `typeat` with viewport coordinates read from it.
- Listed controls can belong to offscreen panels or sit behind a dialog. Check visibility,
  role/aria state, viewport coordinates and overlays before clicking. Duplicate labels or
  hidden dialogs require a visible, scoped selector; do not blindly use the first match.
  A `button` role is not necessarily a native `<button>`; inspect the element before
  writing a tag-specific library selector. Bring the page forward, dismiss blocking
  toasts/teaching bubbles and verify persistence after editor blur or autosave settles.
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
- Streamed text or disappearance of **Processing** can precede a settled response. Wait
  for the product-specific settled reply control/content before recording completion.
- Teaching bubbles can appear after a menu opens. Dismiss them, reopen the menu if the
  dismissal closed it, and verify the screenshot before closing the browser. Crop out
  background account columns as well as account navigation.
- Outlook can show delayed privacy notices, contact cards, and scheduling suggestions.
  Resolve a typed recipient with **Check names** if it remains plain text, verify the
  resolved address, and dismiss overlays before selecting **Send**.
- File pickers: open the **+** or attach menu first, then `upload --click "<item>"`.
- `pages` lists origins, not full URLs. Custom inspection can still expose tenant IDs or
  signed URLs; keep those out of run logs and PRs.
- Opening a lab locally requires the `/mcs-labs/` baseurl and event-context query where
  applicable; verify both in generated HTML, not only in Markdown source.
- The missions renderer reads `mission_lab` front matter; a helpful sentence added only
  to the README/body may not appear in the rendered missions page. Put learner-critical
  instructions in supported rendered fields. Open collapsed `<details>` to verify their
  contents because `innerText` can omit closed content. Decode the currently visible
  lazy-loaded image and compare natural dimensions with front matter; close it afterward.
- Kramdown can turn a literal pipe in a Markdown instruction into an accidental table.
  Escape it as `&#124;` and inspect generated HTML; source inspection alone will miss the
  rendering defect.

## Product quirks

Seen in Microsoft Copilot and Cowork in November 2026. Products change; update this list
when a run-through finds something new, and date it.

- Managed Edge may open `edge://force-signin/` in a new profile. `launch` navigates the
  first tab to the URL; if it does not, run `goto`.
- Wait for `domcontentloaded` plus a `wait` on visible text. Copilot keeps network
  connections open, so "network idle" never comes.
- Slash commands such as `/cost` are only submitted by clicking Send, not by Enter.
- The left navigation label and the page heading read **Plugins** (2026-11-09); earlier
  runs showed **Agents & Plugins**. Labs use **Plugins** with no "also called" hedge.
  Re-capture any older screenshot that still shows the old heading.
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
  your environments here** bubble: **Got it**. Handle these during account onboarding;
  include guidance only where a learner actually needs it, not in every lab.
- Copilot Studio follows the system theme by default, so `pair` works without changing a
  setting.
- The first agent **Save** can finish provisioning and return the page to **Build**.
  Wait for that navigation to settle before opening **Preview** or entering a test
  prompt; otherwise text can land in the instructions editor instead.
- Copilot Studio's agent-name input currently limits names to 30 characters. Verify that
  the saved name matches the lab's name exactly.
- Missions help presentation can vary with the renderer version. The main `instruction`
  must be independently actionable; help is supplementary, and verify the actual rendered
  page rather than assuming whether `<details>` starts open or closed.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No browser on port …` | Run `launch`, or pass the `--port` you launched with. |
| `Expected one visible control named …, found 0` | Run `controls "<part of the name>"`; the label may have changed (log it as drift). |
| `found 2` or more | Pass `--nth`, or use `clickat` with the box of the right one. |
| `Expected the prompt editor in one frame` | The editor is in a side panel or there are two: click it and use `typeat`. |
| Exit code 3, `Sign-in needs a person` | MFA, password change or locked account: finish it in a windowed run, or ask the person. |
| Exit code 4, `Wrong account` | Forbidden page text matched; this alone does not establish the authenticated identity. Stop and have a person verify the sign-in before continuing. Never weaken the guard to retry. |
| `edge://force-signin` or Edge exits while headless | Use windowed Edge when Edge is required. Only use headless Chrome for Testing if that mode/browser is authorized. |
| `Still on the sign-in page` | Run `text` to read the error (wrong password, blocked account). |
| `The prompt editor is not empty` | Clear the editor or start a new chat; the script never appends to a draft. |
| `Light and dark captures are identical` | Set the product theme to System, or use `shot` for a theme-neutral image. |
| `Keep raw captures outside the repository` | Pass an `--out` folder outside the repo. |
| Puppeteer not found | Run `npm ci` in the repository root. |
