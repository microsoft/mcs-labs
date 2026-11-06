# Browser session reference

`scripts/capture.cjs` drives a normal desktop Edge or Chrome window over the DevTools
protocol. Each command connects, does one thing and disconnects, so the browser and the
signed-in session survive between commands. It uses the `puppeteer` package that
`npm ci` installs for pa11y-ci.

## Commands

Run from the repository root:

```bash
node .github/skills/lab-runthrough/scripts/capture.cjs <command> [args] [options]
```

| Command | What it does |
| --- | --- |
| `launch [url]` | Starts the browser with a new temporary profile and DevTools on `--port`, and opens `url`. |
| `pages` | Lists open tabs (URL and title). |
| `goto <url>` | Navigates the selected tab and waits for `domcontentloaded`. |
| `controls [regex]` | Lists visible controls: role, label, text, title, state (`on`, `expanded`, `selected`, `disabled`) and box `x y w h` in CSS pixels. |
| `text` | Prints the tab's visible text. Use it to compare UI wording with the lab. |
| `click <name>` | Clicks the single visible control whose `aria-label`, text or title equals `name`. Fails if none or several match. |
| `clickat <x> <y>` | Clicks a point, for controls without a usable name. |
| `prompt <file\|->` | Types the prompt verbatim (line breaks kept) into the empty editor, clicks Send and waits until it is posted. |
| `wait <text>` | Waits until the page shows `text`. |
| `shot <name>` | Saves `<out>/<name>.png` and prints its size and the display scale. |
| `pair <name>` | Saves `<name>-light.png` and `<name>-dark.png` by emulating `prefers-color-scheme`, and fails if both are identical. |
| `close` | Closes the browser and deletes the temporary profile. |

| Option | Default | Notes |
| --- | --- | --- |
| `--port <n>` | 9334 or `LAB_CDP_PORT` | Use a different port per parallel run. |
| `--url <prefix>` | first tab | Selects the tab whose URL starts with the prefix. |
| `--out <dir>` | `<temp>/lab-runthrough` | Must be outside the repository. |
| `--settle <ms>` | 1500 | Wait after each theme switch in `pair`. |
| `--scheme-attr <name>` | none | Makes `pair` check `<html name="light\|dark">`. Microsoft Copilot uses `data-color-scheme`. |
| `--send-label <name>` | `Send` | Accessible name of the send button. |
| `--timeout <ms>` | 120000 for `prompt`, 300000 for `wait` | |
| `--browser <path>` | Edge, then Chrome | |
| `--window-size <w,h>` | 1600,1000 | Keep it stable across a lab so crops line up. |
| `--headless` | off | Only for testing the script; nobody can sign in. |

Exit codes: 0 success, 1 failure (message on stderr), 2 usage error.

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

`launch({ port, url })` and `close({ port })` are exported too.

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

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No browser on port …` | Run `launch`, or pass the `--port` you launched with. |
| `Expected one visible control named …, found 0` | Run `controls "<part of the name>"`; the label may have changed (log it as drift). |
| `found 2` or more | Use `clickat` with the box of the right one. |
| `The prompt editor is not empty` | Clear the editor or start a new chat; the script never appends to a draft. |
| `Light and dark captures are identical` | Set the product theme to System, or use `shot` for a theme-neutral image. |
| `Keep raw captures outside the repository` | Pass an `--out` folder outside the repo. |
| Puppeteer not found | Run `npm ci` in the repository root. |
