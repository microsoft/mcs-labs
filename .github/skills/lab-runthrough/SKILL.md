---
name: lab-runthrough
description: Run an MCS Labs hands-on lab (classic or guided missions format) step by step in a real browser on a training or demo tenant, the way an attendee would, to find steps, UI labels, prompts and screenshots that no longer match the product. Logs every step as pass, drift, defect, variance or blocked with evidence, and recaptures drifted screenshots, including light and dark pairs. Runs windowed or headless in an isolated private profile, signed in by the person or as a provisioned event training account, and can run several labs in parallel. Use when asked to test, run, walk through, dry-run, validate or smoke-test a lab or a whole event curriculum, check whether a lab still works after a product update, or refresh a lab's screenshots. Never writes credentials into the repo, logs or chat. Hand the log to lab-update for the fix PR.
---

# Run through a lab

A run-through is the only way to know a lab still works. Follow the instructions exactly
as an attendee would, write down what really happens, and leave the tenant as you found it.

## Safety rules

- **Training or demo tenants only.** Never use a customer or production tenant, or your own
  work account, unless the owner explicitly says so.
- **Credentials.** Either the person signs in themselves in the launched window, or you
  use a throwaway account the event tenant provisions (`references/training-accounts.md`).
  Keep its credentials in a JSON file outside the repository and pass them through
  `LAB_CREDENTIALS`, never on a command line. Never write them to a log, commit, PR body
  or chat summary, and delete the file when the run is over.
- **Separate browser profile.** Use `scripts/capture.cjs launch`, which starts a fresh
  temporary Edge or Chrome profile in a private window, windowed or `--headless`. Do not
  use an embedded or side-panel browser: it shares your session and the script cannot
  drive it. Pass `--forbid "<host user's name or alias>"` to `login` so a run that reaches
  the host user's own account stops at once.
- **No real outreach.** Keep customer emails as drafts. Do not send messages, invites or
  posts to anyone except the signed-in test user.
- **Stop what you start.** Pause or delete scheduled tasks and automations the lab
  creates, and confirm after a page reload. Delete test records when the lab says to.
- **Connections.** Do not disconnect or delete a working connection unless the environment
  owner allows it, and restore it afterwards.
- **Cost.** Cowork and other agents consume credits. Record `/cost` (or the product's
  equivalent) in the log.
- **Raw captures stay out of the repository.** They show names, mail and chats.
  `capture.cjs` refuses an output folder inside the repo. Check every crop for personal data
  that is not part of the training scenario before it is committed.

## 1. Prepare

1. Run `npm run audit:labs -- <slug>` and fix nothing yet; note anything that already fails.
2. Read both copies: `labs/<slug>/README.md` and `_labs/<slug>.md`. For a missions lab, the
   front matter `missions` list holds the prompts, steps, checks and screenshots.
3. List the prerequisites (licenses, tenant, plugins, connections, sample data) and confirm
   with the person which tenant and account to use. For an event tenant, claim one
   training account for the whole run (`references/training-accounts.md`).
4. Copy `templates/runthrough-log.md` to a folder outside the repository (for example the
   session files folder) and fill in the header.
5. Run `npm ci` once if `node_modules/puppeteer` is missing, and `pip install pillow` if you
   will crop screenshots.

## 2. Launch and sign in

With the person signing in:

```bash
node .github/skills/lab-runthrough/scripts/capture.cjs launch "<lab start URL>"
```

Ask them to sign in to the training account in the window that opens, then confirm with
`capture.cjs pages`.

With a provisioned training account, headless:

```powershell
$env:LAB_CREDENTIALS = "<temp folder>\account.json"
node .github/skills/lab-runthrough/scripts/capture.cjs launch "<lab start URL>" --headless --port 9352
node .github/skills/lab-runthrough/scripts/capture.cjs login --port 9352 --forbid "<host user's name>|<alias>"
```

Exit code 3 means a person is needed (MFA, password change); exit code 4 means the wrong
account. Stop and tell the person either way. The first visit to a product can show
one-time dialogs; accept them once (see the product quirks) before timing a lab.
`references/browser-session.md` lists every command, the options and the quirks seen so
far.

### Several labs at once

To run a curriculum, give each lab its own `--port`, `--out` folder and log, and launch
three or four at a time: each `launch` gets its own profile, so the sessions are
independent. They can share one training account, but avoid running labs that change the
same agent, record or setting together. Create every asset with the exact name the lab
gives: never add a test suffix or tag, because screenshots must match the instructions
word for word. If two labs would create assets with the same name, run them one after the
other instead. If you hand labs to sub-agents, give each one its
port, its output folder, the credentials file path (not its contents), the `--forbid`
text and these safety rules, and keep shared files (tests, agendas, issue templates) for
yourself to edit afterwards.

## 3. Execute every step as written

For each step or mission, in order:

1. Do exactly what the text says. Use `controls "<regex>"` to find a control by its
   accessible name and `click "<name>"` to use it. If the label in the lab is not on screen,
   that is a finding: do not quietly use the new label.
2. Enter prompts verbatim from the lab: save the prompt text to a file outside the repo and
   run `prompt <file>`, then `wait "<text you expect>"`.
3. Compare the result with the lab's expected outcome, screenshot, check answer or reveal.
4. Log one row: instruction, expected, actual, status, evidence (`shot <name>`, quoted UI
   text) and a proposed fix.

| Status | Meaning | Example |
| --- | --- | --- |
| pass | Works as written | Button and result match |
| drift | The product changed; the lab is now wrong | "Plugins" is now "Agents & Plugins" |
| defect | The lab was wrong or unclear all along | Step skips a required toggle |
| variance | AI output differs but meets the goal | Different wording, same three slides |
| blocked | The environment stopped you | Missing license, plugin not installed |

Variance is normal for generative output; only log drift when the lab's claim or
screenshot would mislead an attendee. Work around a blocked step only if the lab offers a
path for it; otherwise log it and continue where possible. Time each mission or use case
against its stated minutes.

## 4. Recapture screenshots that drifted

1. Find the screenshot's file name in both copies; reuse it so no Markdown changes.
2. Missions labs publish light and dark WebP pairs (`src` and `src_dark`). Set the product
   theme to **System** first: `pair` emulates the operating-system color scheme, which an
   explicit Light or Dark setting overrides. (Microsoft Copilot, November 2026:
   bottom-left **Settings and more** gear > **Settings** > **General** > **Preferences** >
   **Theme**.) Then run `pair <name> --scheme-attr data-color-scheme`, and restore the
   person's theme afterwards. Classic labs use a single image, usually PNG: run
   `shot <name>`.
3. Write a crop spec (`{"<name>": [left, top, right, bottom]}`) using control boxes from
   `controls`, then crop into the lab folder in the format the lab already uses:

   ```bash
   python .github/skills/lab-runthrough/scripts/crop_images.py spec.json <raw folder> labs/<slug>/images --format webp --sheets <raw folder>/sheets
   ```

   Use `--format png --light-only` for classic PNG images, and `--max-width` when the
   capture is wider than the page needs. When a lab has both a classic and a missions
   version, capture each step once with `pair`, then crop it twice: `--light-only` PNG
   for the classic lab and WebP pairs for the missions lab.
4. Open the contact sheets and crops. Check: the step's subject is visible and legible,
   both themes frame the same content, no personal data outside the scenario.
5. Note the printed width and height. Missions front matter needs `width` and `height` to
   match the file. Update `alt` when the state shown changed.

Recapturing is part of the fix, so hand the new files to `lab-update` rather than committing
them here.

## 5. Clean up and hand off

1. Pause or delete scheduled tasks and automations; reload and confirm.
2. Remove test records and drafts the lab says to delete; leave connections as you found
   them.
3. Record `/cost` if the lab used credits.
4. Run `capture.cjs close` (with each `--port` you used) to shut the browser and delete its
   temporary profile. Delete the credentials file when the last run is done.
5. Finish the log: verdict, counts per status, screenshots to replace, and proposed PRs.
   Hand it to `lab-update`. Do not commit the log or raw captures.
