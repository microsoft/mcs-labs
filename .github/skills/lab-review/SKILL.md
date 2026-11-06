---
name: lab-review
description: Review an MCS Labs hands-on lab (classic README/_labs format or the guided missions format) for broken anchors and images, README and site copies drifting apart, invalid front matter, durations that disagree with Lab Details or event agendas, retired product names, out-of-date product claims, and wordy or hard-to-follow instructions. Produces a prioritized report with file and line evidence and proposed fixes. Use when asked to review, audit, check, QA, lint or health-check a lab, an event's labs, all labs, or a lab PR, or to find what needs updating after a product change. Read-only; hand fixes to lab-update and live testing to lab-runthrough.
---

# Review a lab

Review is read-only. It ends with a report, not edits. Start with the deterministic
audit, then add the judgment no script can make.

## 1. Pick the scope

| Request | Command |
| --- | --- |
| One or more labs | `npm run audit:labs -- <slug> [<slug> ...]` |
| Labs touched by a branch or PR | `npm run audit:labs -- --changed` (defaults to `origin/main`; pass `--changed=<base>`) |
| Everything | `npm run audit:labs -- --all` (warnings and errors only unless you add `--min-severity info`) |
| An event | Read `_data/agendas/<event_id>.yml` (or the event's `labs:` list), then audit those slugs |

Add `--format markdown` for a report table or `--format json` for further processing.
The exit code is 1 when there are errors (or warnings with `--strict`). A slug can also
be given as a path such as `_labs/<slug>.md`.

## 2. Read the audit

`references/audit-codes.md` explains every code, why it matters and how to fix it.
Do not repeat findings that are expected:

- `anchor-broken` is real even when the link looks right. GitHub keeps U+FE0F in ids, so
  `## 🛠️ Instructions` needs `#️-instructions`.
- `copy-drift` compares the two copies after removing heading emoji, anchor prefixes and
  front matter. Some labs intentionally differ; say so instead of "fixing" them.
- Info findings (`image-orphan`, `image-shared`, `fm-order-duplicate`, `size-words`,
  `agenda-usage`) are context. Mention them only when they affect the request.

## 3. Judge what the script cannot

Work through `references/review-rubric.md`. In particular:

1. **Product truth.** For each product name, UI label, limit, license or preview claim,
   check the current Microsoft Learn page (use the Microsoft Learn MCP tools when
   available, otherwise web search). Quote the source and its date. A label that changed
   is drift; a capability that changed is a content issue for the owner.
2. **Retired terms.** The audit flags names in `scripts/lab-audit-terms.json`. When you
   confirm a new rename, propose adding it there with `since` and a Microsoft `source` URL.
   Historical mentions ("formerly …") are allowed.
3. **Learning design.** Score the lab with `references/learning-design.md`: outcome
   first, action within the first screen, verbs first, one idea per step, prompts
   copyable, reveal after the experience, checks that target misconceptions.
4. **Timing.** Compare `duration`, the Lab Details row, use-case or mission minutes and
   every agenda slot that lists the lab (`agenda-usage`). A 45-minute lab in a 30-minute
   slot is a delivery risk even if the files agree.
5. **Accessibility.** Alt text describes the state shown, not "screenshot". Link text is
   meaningful. No instruction depends on color alone.
6. **Missions labs.** Prompts verbatim across front matter, `_labs` body and README;
   reveals explain *why*; one correct option per check; optional missions marked; cleanup
   stops anything recurring the lab created.

Do not run the lab here. When a step needs proof in the product, recommend
`lab-runthrough`, and say which mission or use case.

## 4. Report

Fill in `templates/review-report.md`. Rules:

- Lead with a one-line verdict: **ready**, **ready with fixes** or **blocked**.
- Every finding has severity, `file:line`, evidence (audit code, quote or source URL) and
  a concrete fix. No vague advice such as "improve clarity".
- Separate **drift** (product changed; fix the lab) from **defects** (the lab was wrong)
  from **suggestions** (better learning design).
- Group fixes into proposed PRs, one coherent change each, so `lab-update` can pick them up.
- Name what you could not verify.

Save the report outside the repository, or paste it into the conversation or PR. Do not
commit review reports.
