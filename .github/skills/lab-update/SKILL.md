---
name: lab-update
description: Fix or refresh an existing MCS Labs hands-on lab (classic or guided missions format) and open a pull request. Applies findings from a lab-review report, a lab-runthrough log, a GitHub lab-update issue or a product change, keeps the README and _labs copies in sync, replaces drifted screenshots, keeps durations and agendas consistent, records confirmed product renames for the audit, validates, and opens a reviewable PR. Use when asked to fix, update, refresh, correct or modernize a lab, apply review findings, update screenshots, handle a product rename across labs, or open a PR for lab changes. Never merges.
---

# Update a lab

Every update is evidence, then a small coherent change to both copies, then validation,
then a PR someone else merges.

## 1. Start from evidence

Use one of these, in order of preference:

1. A `lab-runthrough` log: what really happened in the product.
2. A `lab-review` report: audit findings, product claims checked against Microsoft Learn,
   learning-design scores.
3. A GitHub issue (`gh issue view <n> --repo microsoft/mcs-labs`), usually from the Lab
   Update form.
4. A product announcement. Confirm it on Microsoft Learn or the product itself before
   changing a lab; announcements often precede rollout.

With only a vague request ("this lab is out of date"), run `lab-review` first. If the lab
depends on product UI and a training environment is available, run `lab-runthrough` too.

Agree the scope before editing when it is more than a fix: rewrites, a new format,
different prompts or a new duration need the lab owner (`git log --format='%an' --
labs/<slug> _labs/<slug>.md | sort | uniq -c | sort -rn`).

## 2. Branch

Work on a feature branch, never on `main`. One PR per coherent change: one lab's refresh,
or one rename across many labs. Do not mix a content refresh with unrelated layout or
script changes.

## 3. Edit both copies

`labs/<slug>/README.md` (GitHub) and `_labs/<slug>.md` (site) change together, in the same
commit. CI (`Lab Doc Sync`) fails a PR that changes a README without its site copy.

- **Headings.** README headings keep their emoji; `_labs` headings have none. When a
  heading changes, update the hand-written table of contents in both copies; the audit
  checks every anchor.
- **Voice and scope.** Fix what the evidence shows. Keep the lab's structure and voice;
  do not rewrite a working section to taste.
- **UI labels.** Use the label exactly as the product shows it, in bold, and quote it in
  the PR. When a label alternates between rollouts, name the destination or give both.
- **Current product, everywhere.** The live product is the source of truth: labels, menu
  paths, page and feature names, defaults, model names and URLs move and get renamed
  often. Rename them throughout the lab, not only in the steps: front matter
  `description`, intro, Lab Details, Use Cases table, targets, tips, troubleshooting and
  link text. Remove steps for UI that no longer exists (retired toggles, "new experience"
  switches) and add any new mandatory screen. When something cannot be reached live, check
  its current name on Microsoft Learn and say
  "unverified live" in the PR.
- **Lists.** Indent a code block, image or note inside a numbered step by three spaces.
  Kramdown otherwise ends the list and the site restarts numbering at 1.
- **Prerequisites.** Attendees with pre-provisioned accounts must not repeat tenant
  setup. Use the organizer-neutral template cue and do not imply that attending any event
  is enough to skip setup. Keep sign-in, downloads and safety actions visible; compact or
  collapse only self-hosting setup where supported. Replace older event-specific variants.
  In missions labs, `prerequisites:` is an always-visible attendee readiness checklist.
  Keep own-tenant setup concise and explicitly conditional ("in your own tenant only") so
  event attendees do not repeat provisioning.
- **Rendered Markdown.** Escape literal pipes in prose as `&#124;` where Kramdown could
  make an accidental table. Build the page and inspect generated HTML; source-only review
  will not catch every list or table parsing issue.
- **Prompts.** Prompts are tested content. Change one only when the run-through shows it
  no longer works, and say why in the PR. In missions labs the prompt must stay identical
  in front matter, the `_labs` body and the README. If an unchanged supplied prompt has a
  baseline retired-name warning, disclose it as pre-existing; do not rename the prompt to
  silence the audit.
- **Durations.** `duration`, the Lab Details row, use-case or mission minutes, and every
  agenda slot listing the lab (`agenda-usage`) must agree. Agenda changes affect an event,
  so name the event in the PR.
- **Dates.** Do not add update dates; the site derives them from Git.
- **Missions labs.** Keep the contract: core `minutes` sum to `duration`, each check has
  exactly one correct option, optional missions are marked, and cleanup stops anything
  recurring. `npm test` enforces it.
- **Retired names.** Current names (check `scripts/lab-audit-terms.json` for the full
  list): **Microsoft Copilot** and **Microsoft Copilot Chat** since August 2026 (formerly
  Microsoft 365 Copilot and Microsoft 365 Copilot Chat), and the **Microsoft Copilot
  harness** in Copilot Studio since October 2026 (formerly GitHub Copilot harness). Keep
  license SKU names, such as Microsoft 365 Copilot (add-on), as the price list shows them,
  and UI labels exactly as the product shows them.
  When a rename is confirmed, add it to `scripts/lab-audit-terms.json`
  with `term`, `pattern` (JavaScript regular expression, case-insensitive), `replacement`,
  `since` and an official Microsoft `source` URL. Then run `npm run audit:labs -- --all
  --format markdown` and list other affected labs as follow-ups, or fix them in a separate
  rename PR.

## 4. Replace screenshots

Use the captures and crop sizes from the `lab-runthrough` log. Keep the file name and
format so neither copy's Markdown changes. For missions labs, update `width`, `height` and
`alt` in the front matter, keep `src` and `src_dark` pairs together and keep the
`<picture>` element in both bodies. Use genuine current product captures at native
resolution; never retouch pixels to alter a name, result or product state. Recheck target
position after each theme switch, and verify both crops contain the current response,
whole filename and required controls. Inspect at full and rendered size, check EXIF/XMP
and visually review OCR candidates. A single theme-neutral hero is valid; do not create an
unused dark variant. Mark retained old images as not freshly verified.

Compare the orphan scan with the baseline. Delete only images newly orphaned by this
branch and only after checking references (`git grep <file name>`); never delete
untouched-lab or shared assets (`image-shared`).

## 5. Validate

```bash
npm run audit:labs -- --changed   # no new errors or warnings in the labs you touched
npm test                          # not run by CI; run it locally
bash tools/run.sh                 # or .\tools\run.ps1; open /mcs-labs/labs/<slug>/
```

In the browser check the changed sections, images in light and dark themes, the table of
contents links, and Previous and Next with `?event=<id>` for each event that lists the
lab. Verify the generated HTML, including literal pipes escaped as `&#124;`, rendered
mission instructions/help, lazy image dimensions and baseurl/event-context links. Compare
the audit with `main` when the lab already had findings: the PR should not add any.

## 6. Open the PR

1. Review `git status` and stage only the intended files. Preserve concurrent edits;
   never amend a commit unless the user explicitly asks. Use the configured GitHub
   noreply commit identity rather than a private email, and do not put account identities
   or tokens into this skill. Do not reset or discard upstream wording to resolve a
   conflict; reconcile it with the requested change and retain a backup before resolving
   dirty work.
2. Commit both copies, images and any terms or agenda changes, with a message such as
   `fix(<slug>): update Cowork plugin steps for the new Agents & Plugins page`.
3. Before pushing, verify the authenticated GitHub account, target repo, head repo and
   branch. Push only after local validation. Open the PR against `microsoft/mcs-labs`
   `main` with `gh pr create` and a current body from `templates/pr-body.md`; include
   coverage qualifications and link the issue with `Fixes #<n>`.
4. Check CI (`gh pr checks <n>`): Lab Doc Sync, Accessibility and Lighthouse. Verify that
   the remote head matches the intended local commit and that the PR is open and unmerged
   before changing its ready state. Push, readiness and content freshness are separate
   gates; never describe an unpushed PR as current. Refresh the PR body with the latest
   evidence and qualification before marking it ready.

Check native command exit codes explicitly. In PowerShell, a semicolon or pipeline can
leave a successful final command hiding a failed `git`/`npm` command; inspect `$LASTEXITCODE`
or use a command runner that preserves it before reporting validation success.
5. Never merge your own PR, and never push to `main`.

## Recurring maintenance

When asked to keep labs current after a product release:

1. `npm run audit:labs -- --all --format markdown` for the static picture.
2. `lab-review` on labs about the changed product, checking claims on Microsoft Learn.
3. `lab-runthrough` on labs in upcoming events first (`_data/agendas/*.yml`).
4. One PR per lab or per rename. Put pre-existing findings you did not fix under
   "Follow-ups" in the PR body rather than widening the PR.
