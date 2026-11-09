# Run-through log: %%LAB TITLE%%

<!-- Keep this log outside the repository. It can contain names and tenant details. -->

| Field | Value |
| --- | --- |
| Lab | `%%SLUG%%` (classic or missions) |
| Copies | `labs/%%SLUG%%/README.md`, `_labs/[mission-]%%SLUG%%.md` at commit `%%SHA%%` |
| Date | %%YYYY-MM-DD%% |
| Tenant and account | Training tenant, person's account or provisioned training account (no user names or passwords here) |
| Browser | Edge or Chrome version, windowed or headless, `--port`, window size, display scale |
| Start URL | %%URL%% |
| Scope and exclusions | %%ALLOWED_DOCUMENTS_AND_ROUTES; OMITTED_CONTENT_AND_CHECKS%% |
| Prerequisites checked | Licenses, plugins, connections, sample data |
| Checks before run | %%EXACT_ALLOWED_COMMANDS_AND_RESULTS; FULL_AUDIT_ONLY_IF_IN_SCOPE%% |

<!-- Replace [mission-] with the actual filename. Keep credentials and signed URLs out of this log. -->

**Coverage summary:** Core %%covered%%/%%total%% steps; optional %%covered%%/%%total%%.
State incomplete coverage explicitly. Do not use an unconditional verdict when any core
step is blocked, untested or unverified.

**Counts:** passed %%n%%, drift %%n%%, defect %%n%%, variance %%n%%, blocked %%n%%,
untested %%n%%, unverified %%n%%.

Use the status definitions and independent-verification checklist in
`../references/runthrough-evidence.md`.

## Evidence reused

%%NONE, OR SOURCE_LAB_AND_COMMIT_DATE, MATCHED_INSTRUCTIONS_PROMPTS_ASSETS_PREREQUISITES_OUTCOMES, AND_RETAINED_LIMITATIONS%%

Reused coverage is not a fresh run. Do not retest an identical shared route just because
its event title changed; test meaningful differences and preserve blocked/untested routes.

## Steps

Use the lab's own numbering: use case and step, or mission and step. Quote UI text exactly.

| # | Core/optional | Instruction (short) | Expected | Actual | Status | Evidence and independent check | Proposed fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | core | | | | %%STATUS%% | | |

Status is passed, drift, defect, variance, blocked, untested or unverified. Record what
was actually checked; an agent's claim or hidden trace is not independent evidence.
Give each attempt a distinct evidence filename before the next turn; retain failed
attempts alongside retries. Separate the new reply/tool result from the source check,
and record positive and rejected paths independently.

## Timing

| Section | Stated minutes | Actual minutes | Note |
| --- | --- | --- | --- |
| | | | |

## Screenshots to replace

| Image | Used at (both copies) | Why | New capture | Crop box | Size | Personal data checked |
| --- | --- | --- | --- | --- | --- | --- |
| `images/%%name%%.webp` | `_labs/[mission-]%%SLUG%%.md:L`, `README.md:L` | Label changed | `%%name%%-light.png` | `[l, t, r, b]` | `W x H` | yes |

## Product claims to recheck

Claims the run could not prove (limits, licensing, preview status) for `lab-review` to
check against Microsoft Learn.

## Independent outcomes

| Outcome | Source checked | Required fields/state | Result |
| --- | --- | --- | --- |
| Generated file, record, draft, schedule or connected tool | | | passed / unverified / blocked / n/a |

For records, include ownership, relationships and timezone where applicable. Distinguish
actuals from projections; confirm drafts remain unsent and schedules are saved before
reporting success.

## Blockers and follow-up

| Route | Symptom and evidence | Instruction / provisioning / product issue | Next action and owner role |
| --- | --- | --- | --- |
| %%ROUTE%% | %%OBSERVED_LIMITATION%% | %%CLASSIFICATION%% | %%ACTION_AND_ROLE%% |

## Cleanup

Runner-only duties; do not copy this checklist into attendee instructions.

- [ ] Scheduled tasks and automations paused or deleted, confirmed after reload
- [ ] Test records and drafts removed where the lab says so
- [ ] Connections and plugins left as found
- [ ] Product theme restored
- [ ] `/cost` recorded: %%credits%%
- [ ] `capture.cjs close` run; temporary profile deleted
- [ ] Training-account credentials file deleted once no run needs it
- [ ] Raw captures kept outside the repository

## Proposed PRs

1. **%%Title%%:** findings #, files, and whether screenshots are included.
