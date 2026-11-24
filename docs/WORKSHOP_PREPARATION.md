# Workshop preparation skills

The operator skills used for Workshop Hub preparation are source-controlled in
**microsoft/mcs-labs** under `.github/skills/`. They are administrator tooling, not
learner labs, and Jekyll excludes them from the published site.

| Skill | Purpose | Included implementation |
| --- | --- | --- |
| [solution-rollout](../.github/skills/solution-rollout/SKILL.md) | Import packages, assign components, publish and inspect agents | Node scripts, example config and offline tests |
| [copilot-credit-allocation](../.github/skills/copilot-credit-allocation/SKILL.md) | Inspect, allocate or release reserved Copilot Credits without changing enforcement policy | API procedure; no tenant-bound batch script |
| [onedrive-provisioning](../.github/skills/onedrive-provisioning/SKILL.md) | Provision personal sites and distribute a create-only file pack | Configurable Node uploader, opt-in SharePoint preparation and offline tests |

These checked-in copies are the maintainable source. To use them from another
repository or a personal skills folder, copy the relevant skill directory from
a reviewed commit. Do not copy `node_modules`, runtime configs, recipient lists,
logs, outputs or token caches. Restore dependencies inside each copied skill.
Personal copies are not automatically synchronized by this change; make future
improvements here first and deliberately update installed copies to avoid drift.

## One roster, three separately authorized operations

Keep the event roster and all run artifacts in a private, non-synced working
folder outside the repository. Use stable Entra object IDs and environment IDs;
verify the UPN mapping rather than relying on display names. Record the source
commit, exact package hashes and file manifest with the run.

1. Establish tenant, administrator and exact target set. Identify what "usual
   solutions" and "usual files" mean for this event; never infer them from a prior run.
2. Check identities, environment readiness, current solutions, credit records and
   drive access. Do not start a smaller batch silently when some checks fail.
3. Review each dry-run plan. Show upgrades, ownership changes, allocation
   increases/decreases, missing personal sites and any required admin grants.
4. Run a representative canary per operation, then proceed with bounded workloads.
   Coordinate the shared administrator's throttle budget across sessions. Use
   separate result folders for independent cohorts and never overlap writers.
5. Verify the **entire requested set** from live state, including entries that
   were already correct or skipped on resume. Keep unresolved outcomes visible.
6. Hand attendees their remaining connection bindings and flow activation steps.
   Report retained site-admin grants and ask separately before access cleanup.

Loading a skill or maintaining its source is not authorization to authenticate,
deploy, allocate credits, provision a drive or change permissions.

## Lessons from the 2026-11-23 Workshop Hub runs

These are observations from the session records and scripts, not a new live test
or a guarantee of service behavior in every tenant.

| Observation | Reusable improvement |
| --- | --- |
| Valid environments returned licensing 404 until their first allocation was created | Confirm environment identity, allocation-index absence and inherited policy before planning initialization; never equate every 404 with zero |
| "At least 3,000" was the requested credit target | Use `max(current, minimum)`; preserve higher allocations and distinguish reserved allocation from tenant-pool draw |
| Environment-group policy supplied tenant-pool behavior | Preserve inheritance; do not convert it into an explicit local override or remove a rule to bypass a policy lock |
| Solution deployments completed while attendee connection/flow work remained | Separate "admin preparation verified" from "attendee ready"; publish the exact owner to-dos |
| Two cohorts used the same administrator for rollout | Share one throttle budget, pin accounts without changing CLI defaults, and avoid overlapping environment writers |
| OneDrive provisioning and Graph access became ready at different times | Verify identity before provisioning, then use bounded readiness polling rather than blind upload retries |
| The OneDrive scripts depended on old session folders and fixed user/file counts | Move code and dependency manifests into the skill, derive counts from approved inputs, freeze hashes and revalidate live content on resume |
| Windows checkpoint writes could encounter transient file locks | Use bounded atomic-rename retries; never discard a checkpoint or report success after a failed save |
| Site-collection admin access remained after uploading | Record pre-existing versus newly granted access and report retention; cleanup needs separate approval |

The previous OneDrive run used a session-specific file pack. Its files, private
manifests and recipient lists are intentionally **not included** here. The new
manifest example illustrates the contract, not an event's content selection.

## Contributor checks

From the repository root:

```powershell
npm --prefix .github\skills\solution-rollout ci
npm --prefix .github\skills\onedrive-provisioning ci
npm run test:workshop-skills
```

On macOS/Linux use `/` path separators. The offline tests are portable; the
OneDrive authentication/access adapters currently require Windows. `npm test`
continues to cover the site scripts and Ruby date resolver; the separate command
keeps the skills' Node 22 and native authentication dependencies out of the site's
Node 20 toolchain. Live canaries are manual, explicitly authorized checks, never CI.

Commit only source, synthetic examples, dependency lockfiles and offline tests.
Do not publish logs or authentication artifacts as evidence. No part of these
skills needs a secret in Git.
