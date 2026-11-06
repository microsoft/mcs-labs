# Run-through log: %%LAB TITLE%%

<!-- Keep this log outside the repository. It can contain names and tenant details. -->

| Field | Value |
| --- | --- |
| Lab | `%%SLUG%%` (classic or missions) |
| Copies | `labs/%%SLUG%%/README.md`, `_labs/%%SLUG%%.md` at commit `%%SHA%%` |
| Date | %%YYYY-MM-DD%% |
| Tenant and account | Training tenant, test user (no passwords here) |
| Browser | Edge or Chrome version, window size, display scale |
| Start URL | %%URL%% |
| Prerequisites checked | Licenses, plugins, connections, sample data |
| Audit before run | `npm run audit:labs -- %%SLUG%%`: errors, warnings |

**Verdict:** works as written / works with drift / broken. One sentence on why.

**Counts:** pass %%n%%, drift %%n%%, defect %%n%%, variance %%n%%, blocked %%n%%.

## Steps

Use the lab's own numbering: use case and step, or mission and step. Quote UI text exactly.

| # | Instruction (short) | Expected | Actual | Status | Evidence | Proposed fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | | | | pass | | |

Status is one of pass, drift, defect, variance or blocked (see `SKILL.md`).

## Timing

| Section | Stated minutes | Actual minutes | Note |
| --- | --- | --- | --- |
| | | | |

## Screenshots to replace

| Image | Used at (both copies) | Why | New capture | Crop box | Size | Personal data checked |
| --- | --- | --- | --- | --- | --- | --- |
| `images/%%name%%.webp` | `_labs/%%SLUG%%.md:L`, `README.md:L` | Label changed | `%%name%%-light.png` | `[l, t, r, b]` | `W x H` | yes |

## Product claims to recheck

Claims the run could not prove (limits, licensing, preview status) for `lab-review` to
check against Microsoft Learn.

## Cleanup

- [ ] Scheduled tasks and automations paused or deleted, confirmed after reload
- [ ] Test records and drafts removed where the lab says so
- [ ] Connections and plugins left as found
- [ ] Product theme restored
- [ ] `/cost` recorded: %%credits%%
- [ ] `capture.cjs close` run; temporary profile deleted
- [ ] Raw captures kept outside the repository

## Proposed PRs

1. **%%Title%%:** findings #, files, and whether screenshots are included.
