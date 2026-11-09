# Lab review: %%LAB_TITLE%% (`%%SLUG%%`)

**Verdict:** %%ready | ready with fixes | blocked%% — %%ONE_LINE_REASON%%

| Format | Duration | Events | Reviewed | Audit |
| --- | --- | --- | --- | --- |
| %%classic or missions%% | %%N%% min | %%EVENT_IDS_WITH_SLOT_MINUTES%% | %%YYYY-MM-DD%%, commit `%%SHORT_SHA%%` | %%E%% errors, %%W%% warnings, %%I%% info |

**Scope:** %%ALLOWED_CONTENT_AND_CHECKS; EXCLUSIONS_AND_OMITTED_CHECKS%%.
Report a full audit only when it was allowed and run; otherwise name the scoped checks.

## Verification boundary

| Area | Status | Evidence / limitation |
| --- | --- | --- |
| Static structure and copies | %%passed / issue%% | %%audit output%% |
| Current product behavior | %%unverified unless run-through evidence is attached%% | %%runthrough log or not live-tested%% |
| Core / optional route coverage | %%covered / incomplete / not run%% | %%tested routes and gaps%% |
| Reused evidence | %%none / identical routes only%% | %%source lab, commit/date and retained limitations%% |

## Findings

| # | Type | Severity | Location | Evidence | Proposed fix |
| --- | --- | --- | --- | --- | --- |
| 1 | %%drift / defect / suggestion%% | %%error / warn / info%% | `%%file:line%%` | %%audit code, quote or source URL%% | %%exact change%% |

## Product claims checked

| Claim in the lab | Source | Status |
| --- | --- | --- |
| %%CLAIM%% | [%%LEARN_TITLE%%](%%URL%%), %%DATE_CHECKED%% | %%current / changed / not found%% |

## Learning design

| Principle | Score (0–2) | Note |
| --- | --- | --- |
| %%PRINCIPLE%% | %%SCORE%% | %%EXAMPLE_AND_REWRITE%% |

## Proposed PRs

1. **%%PR_TITLE%%** — findings %%#, #%%; files %%FILES%%; needs screenshots: %%yes/no%%.

## Not verified

- %%WHAT_COULD_NOT_BE_CHECKED_AND_WHY (for example, needs a live run with lab-runthrough)%%
- %%AFFECTED_ROUTE, EVIDENCE, NEXT_ACTION_AND_OWNER_ROLE_FOR_EACH_BLOCKER%%
