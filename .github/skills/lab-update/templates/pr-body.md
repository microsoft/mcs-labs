## %%What changed, in one sentence%%

<!-- Keep each section short. Delete a section that does not apply. -->

**Lab:** [`%%SLUG%%`](https://microsoft.github.io/mcs-labs/labs/%%SLUG%%/) (classic / missions)
**Why:** %%product change, review finding or issue%%. Fixes #%%ISSUE%%
**Events affected:** %%event ids from agenda-usage, or none%%

### Changes

| Where | Before | After | Evidence |
| --- | --- | --- | --- |
| %%Use case 2, step 4 (both copies)%% | %%"Plugins"%% | %%"Agents & Plugins"%% | %%run-through 2026-11-20 / Learn URL%% |

### Screenshots

| Image | Why | Light | Dark |
| --- | --- | --- | --- |
| `images/%%name%%.webp` | %%label changed%% | replaced | replaced / n/a |

All new images were checked for personal data outside the training scenario.

### Validation

- [ ] `npm run audit:labs -- --changed`: no new errors or warnings
- [ ] `npm test`
- [ ] Served locally: changed sections, images in light and dark, table of contents, Previous and Next with `?event=`
- [ ] Run through in the product (%%date, tenant type%%), or why not

### Run-through coverage

Core: %%passed/total%%; optional: %%passed/total%%. Status counts: passed %%n%%, drift
%%n%%, defect %%n%%, variance %%n%%, blocked %%n%%, untested %%n%%, unverified %%n%%.
State the independent outcome checks performed and what remains unverified; do not infer a
pass from a completed run, chat claim, private share dialog or hidden tool trace.

### Not changed

%%Prompts kept verbatim / timing unchanged / intentional differences between the README and site copies.%%

### Follow-ups

%%Pre-existing findings left for another PR, with audit codes.%%
