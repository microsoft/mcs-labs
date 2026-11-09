---
name: lab-runthrough
description: Run an MCS Labs hands-on lab (classic or guided missions format) step by step in a real browser on a training or demo tenant, the way an attendee would, to find steps, UI labels, prompts and screenshots that no longer match the product. Logs each step with evidence and distinguishes passed, drift, defect, variance, blocked, untested and unverified outcomes; recaptures drifted screenshots, including light and dark pairs. Runs windowed or headless in an isolated private profile, signed in by the person or as a provisioned event training account. Use when asked to test, run, walk through, dry-run, validate or smoke-test a lab or event curriculum, check whether a lab still works after a product update, or refresh a lab's screenshots. Never writes credentials into the repo, logs or chat. Hand the log to lab-update for the fix PR.
---

# Run through a lab

A run-through is the only way to know a lab still works. Follow the instructions exactly
as an attendee would, write down what really happens, and leave the tenant as you found it.

## Safety rules

These are rules for the automated runner, not steps to paste into a learner's lab.
Keep run evidence, coverage limits, credit totals, screenshot provenance and
account-specific troubleshooting in the run log and PR. Do not turn a runner's setup
problem into a required attendee step or repeat warnings supplied by the training tenant.
Hand off only necessary learner-facing corrections; independent-tenant setup belongs
in the existing expandable setup section.

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
- **Connections and approvals.** Inspect the actual owner of imported connections before
  publishing or running a tool. Repair only a copy you own with an authorized identity;
  otherwise stop and report blocked. Never alter another runner's connections or assets.
  An unresolved destination is not approval to create or upload: cancel the pending card
  if it blocks questions, verify the destination and absence of the target, then request a
  fresh fail-on-conflict action. Never overwrite data to force a test. Prefer one-time
  permissions; revoke only permissions this run introduced.
- **Cost.** Cowork and other agents consume credits. Record `/cost` (or the product's
  equivalent) in the log.
- **Raw captures stay out of the repository.** They show names, mail and chats.
  `capture.cjs` refuses an output folder inside the repo. Check every crop for personal data
  that is not part of the training scenario before it is committed.

## 1. Prepare

1. Run `npm run audit:labs -- <slug>` and fix nothing yet; note anything that already fails.
   If modules/presentations are excluded, use the
   [scoped validation guidance](../lab-update/SKILL.md#5-validate) instead: named slugs
   alone do not prevent repository-wide audit scans.
2. Read both copies: `labs/<slug>/README.md` and `_labs/<slug>.md`
   (`_labs/mission-<slug>.md` for a missions lab). For a missions lab, the front matter
   `missions` list holds the prompts, steps, checks and screenshots.
3. List the prerequisites (licenses, tenant, plugins, connections, sample data) and confirm
   with the person which tenant and account to use. For an event tenant, use one training
   account for the whole dependent sequence (`references/training-accounts.md`). Separate
   browser profiles isolate cookies only; they do not isolate backend records, plugins,
   agent memory, generated files, schedules or connections.
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

### Curriculum sequencing

Default to running related Chat, Cowork, Code and Studio labs sequentially with one
training account. Before each handoff, record which person owns the agent, record, file,
schedule or connection, whether a run is in flight, and whether it is safe for the next
lab to change it. Keep shared credentials until the last dependent run is complete. Use
the exact asset names and prompts in the lab; do not add test suffixes or tags. Do not
delete another runner's browser profile, connection or assets.

Parallelize only when the accounts and assets are genuinely independent and you have
checked dependencies. Separate `--port`, `--out` and logs per browser; this prevents
cookie collisions, not shared backend state. If delegation is used, give each runner the
specific isolated account/assets, port, output folder, credentials file path (never its
contents), `--forbid` text and the ownership/handoff rules. Keep shared files (tests,
agendas, issue templates) with one editor.

## 3. Execute every step as written

For each step or mission, in order:

1. Do exactly what the text says. Use `controls "<regex>"` to find a control by its
   accessible name and `click "<name>"` to use it. If the label in the lab is not on screen,
   that is a finding: do not quietly use the new label.
2. Enter prompts verbatim from the lab: save the prompt text to a file outside the repo and
   run `prompt <file>`, then `wait "<text you expect>"`.
3. Verify the learner-visible outcome, not just the prompt or chat claim. Download and
   inspect cited source documents and generated files; check business records in their
   system of record, including required fields, ownership, relationships and timezone.
   Separate actuals from projections and record known-missing values or failed fields.
   Confirm Outlook drafts exist and remain unsent; verify a schedule's saved time/timezone
   after save settles and reloads. A scheduled draft is not execution, a save warning is
   not proof a plugin loaded, and a node-only classifier test is not end-to-end success.
4. Log one row: instruction, expected, actual, status and evidence (`shot <name>`, exact
   UI text, artifact or system-of-record check). Use the vocabulary and coverage rules in
   `references/runthrough-evidence.md`; do not mark untested or unverified behavior as
   passed, or force drift/variance into failure.

| Status | Meaning | Example |
| --- | --- | --- |
| passed | Works as written | Button and result match |
| drift | The product changed; the lab is now wrong | "Plugins" is now "Agents & Plugins" |
| defect | The lab was wrong or unclear all along | Step skips a required toggle |
| variance | AI output differs but meets the goal | Different wording, same three slides |
| blocked | The environment stopped you | Missing license, plugin not installed |

Variance is normal for generative output; only log drift when the lab's claim or
screenshot would mislead an attendee. Routing to a specialist does not prove a required
confirmation or clean user-facing output. Voice without supplied speech is untested, not
failed. Retained instructions at a user's request are not a fresh pass. Work around a
blocked step only if the lab offers a path for it; otherwise log it and continue where
possible. Time each mission or use case against its stated minutes. Test core and optional
paths separately; an optional route failing must not erase a passing core route or support
an unconditional overall verdict.

## 4. Recapture screenshots that drifted

For future captures, target **2x the final displayed width in native pixels**. Keep the
CSS viewport stable and prefer browser device-scale emulation over zooming out to fit
more UI. Never upscale an existing image to simulate resolution. Launch with `--scale 2`
and crop at capture time with `--element`, `--clip` and `--zoom`; see the
high-resolution checklist in `references/browser-session.md`. This guidance
does not request a bulk recapture of existing screenshots.

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

   Use `--format png --light-only` for classic PNG images. If using `--max-width`, keep
   at least twice the intended displayed width; do not downsample to the CSS width.
   When a lab has both a classic and a missions
   version, capture each step once with `pair`, then crop it twice: `--light-only` PNG
   for the classic lab and WebP pairs for the missions lab.
4. After every theme switch, scroll the target back into view and recompute its bounds;
   theme changes can reset scroll. Open both crops at full resolution and at their actual
   size on the lab page, not just contact sheets. Check the current response, whole
   filename and all required controls are present in both crops; do not accept a previous
   response, table or hidden dialog. Retake from the product with the exact lab name rather
   than editing pixels to change names, results or product state.
5. Note the printed width and height. Missions front matter needs `width` and `height` to
   match the file. Update `alt` when the state shown changed. OCR is only a way to find
   candidate sensitive text: inspect dark images, avatars and full-resolution crops
   visually, and check image metadata (EXIF/XMP). Cropping is not automatic masking.

Recapturing is part of the fix, so hand the new files to `lab-update` rather than committing
them here.

## 5. Clean up and hand off

1. Pause or delete only scheduled tasks and automations this run created; reload and
   confirm. Wait for save to settle before reload. Check the source switch directly rather
   than trusting an agent's claim that it searched a disabled source.
2. Remove only test records and drafts the lab says to delete; leave others' connections
   and assets untouched. Revoke only permissions introduced by this run.
3. Record `/cost` if the lab used credits.
4. Run `capture.cjs close` (with each `--port` you used) to shut the browser and delete its
   temporary profile. Delete the credentials file when the last run is done.
5. Finish the log: core and optional coverage, counts per status, outcomes verified,
   blockers and unverified boundaries, screenshots to replace, and proposed PRs. Do not
   issue an unconditional verdict if coverage is incomplete. Hand it to `lab-update`. Do
   not commit the log or raw captures.
