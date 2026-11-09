## %%What changed, in one sentence%%

<!-- Keep each section short. Delete a section that does not apply. -->

**Lab:** [`%%SLUG%%`](https://microsoft.github.io/mcs-labs/labs/%%SLUG%%/) (classic / missions)
**Why:** %%product change, review finding or issue%%. Fixes #%%ISSUE%%
**Events affected:** %%event ids from agenda-usage, or none%%

### Changes

| Where | Before | After | Evidence |
| --- | --- | --- | --- |
| %%Use case 2, step 4 (both copies)%% | %%"Agents & Plugins"%% | %%"Plugins"%% | %%run-through 2026-11-20 / Learn URL%% |

### Screenshots

| Image | Why | Light | Dark |
| --- | --- | --- | --- |
| `images/%%name%%.webp` | %%label changed%% | replaced | replaced / n/a |

All new images were checked for personal data outside the training scenario.

### Validation

<!-- Choose commands after checking scope. Named audit slugs still scan repository-wide
     context. Do not run full audits/tests/builds when they access excluded modules or
     presentations. List exact scoped checks and omissions; do not imply a full pass. -->

- [ ] %%EXACT_AUDIT_OR_SCOPED_CHECKS%%: no new errors or warnings
- [ ] %%EXACT_NAMED_TESTS_OR_FULL_SUITE_IF_ALLOWED%%: %%RESULT_AND_BASELINE_FAILURES%%
- [ ] %%SCOPED_RENDER_OR_SITE_PREVIEW%%: changed sections, images, anchors and allowed navigation checks
- [ ] Run through in the product (%%date, tenant type%%), or why not

### Run-through coverage

Core: %%passed/total%%; optional: %%passed/total%%. Status counts: passed %%n%%, drift
%%n%%, defect %%n%%, variance %%n%%, blocked %%n%%, untested %%n%%, unverified %%n%%.
State the independent outcome checks performed and what remains unverified; do not infer a
pass from a completed run, chat claim, private share dialog or hidden tool trace.
Identify any reused evidence by source lab and commit/date, and explain which routes are
identical. Reuse does not turn earlier evidence into a fresh run or erase its blockers.

### Not changed

%%Creator scenario and ordered prompts/inputs/outputs preserved / timing unchanged /
stable slugs and public URLs / intentional differences between the README and site copies.%%

### Follow-ups

%%Pre-existing findings and blockers left for another PR, with evidence, affected route,
next action and owner role (organizer, lab creator or product owner).%%
