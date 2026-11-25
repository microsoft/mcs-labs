---
name: copilot-credit-allocation
description: |
  Allocate, increase, reduce, deallocate, or inspect Copilot Studio Copilot Credits
  for selected Power Platform environments using the Power Platform licensing API.
  Use for "assign 5000 Copilot Credits to these environments", "remove their credit
  allocations", "deallocate credits", "return reserved capacity to the tenant pool",
  or bulk credit reallocation. Reads current settings, plans changes, preserves
  enforcement rules, and verifies each write. Not for GitHub Copilot subscription
  budgets, buying credits, changing billing policies, or setting agent-level limits.
---

# Copilot Credit allocation and deallocation

Manage the **reserved allocation** of Copilot Studio credits, represented by
`MCSMessages`, for environments explicitly selected by the user. This is an
administrative operation, not a Dataverse table update.

Loading this skill, explaining the process, or editing the skill does not authorize
sign-in or live changes. Do not reuse a tenant, account, environment list, or amount
from an earlier task. The examples below are templates, not commands to run blindly.

## 1. Establish scope and intent

Obtain only the inputs missing from the current request:

| Input | Requirement |
|---|---|
| Tenant | Explicit target tenant ID; never rely on the CLI's default subscription. |
| Account | User authorized to manage licensing/capacity in that tenant. Resolve ambiguous accounts before proceeding. |
| Environments | Explicit IDs, or names resolved uniquely through tenant environment discovery. Normalize and deduplicate, then report the count. |
| Operation | Set an absolute allocation, add/subtract an amount, remove all reserved allocation, or inspect only. |
| Amount | Whole Copilot Credits **per environment**, unless a total distribution is explicitly requested. |

These are different operations:

| Request | Target `allocated` |
|---|---|
| Set/assign 5,000 per environment | `5000`, not current allocation plus 5,000 |
| Ensure at least 5,000 per environment | `max(current, 5000)`; never reduce an existing higher allocation |
| Add 5,000 per environment | Current allocation plus `5000` |
| Remove 2,000 per environment | Current allocation minus `2000` |
| Deallocate all reserved credits | `0` |
| Reclaim only unused credits | Requires current consumption evidence and an agreed calculation; allocation alone is insufficient |

Reject negative targets, fractional values, and values above int32 maximum
`2147483647`. Never clamp an invalid subtraction to zero or divide a total across
environments without agreement. Clarify ambiguous intent before writing.

**Deallocation changes the reservation, not past consumption or the purchased
entitlement.** It does not refund usage, reset the billing period, disable agents,
unlink billing plans, or necessarily stop new consumption. Tenant-pool draw,
pay-as-you-go, or other applicable capacity can still allow usage. Reductions can
also interrupt service when no overage source is available. Surface this impact
before a reduction.

An explicit instruction to deallocate a named set authorizes that operation. Ask
for confirmation if a general allocation request would unexpectedly reduce an
existing allocation, the affected set expands, or production impact is unresolved.
Requests to stop all spending require separate controls and authorization.

## 2. Authenticate without changing tenant configuration

Commercial-cloud API base: `https://api.powerplatform.com`.
API version used by these operations: `2024-10-01`.

Use the signed-in user's existing authorized Azure CLI session when available.
Capture the token in memory; never print it or run the token command uncaptured:

```powershell
$ErrorActionPreference = 'Stop'
$TenantId = '<target-tenant-guid>'
$Api = 'https://api.powerplatform.com'
$Version = '2024-10-01'
# Pin a CLI account of the target tenant: --tenant alone uses the CLI's *default* account.
$subs = @(& az account list --all --query "[?tenantId=='$TenantId' && user.type=='user'].{id:id,user:user.name}" --output json --only-show-errors | ConvertFrom-Json)
if (@($subs.user | Sort-Object -Unique).Count -ne 1) { throw 'Expected exactly one signed-in CLI user for the target tenant.' }
$tokenJson = & az account get-access-token --subscription $subs[0].id --resource $Api --output json --only-show-errors
if ($LASTEXITCODE -ne 0) { throw 'Azure CLI token acquisition failed; resolve the reported sign-in error.' }
$auth = $tokenJson | ConvertFrom-Json
if (-not $auth.accessToken -or $auth.tenant -ne $TenantId) {
    throw 'Missing access token or unexpected tenant.'
}
$headers = @{ Authorization = "Bearer $($auth.accessToken)"; Accept = 'application/json' }
```

If the CLI default account belongs to another tenant (another session can switch it),
`--tenant` silently fails with `AADSTS50020` and the CLI waits on a hidden broker
sign-in pop-up, so scripts hang. Selecting a subscription of the target tenant, as
above, pins the right signed-in user without changing the shared default. Do not
run `az account set` or `az login` to fix it unless the user asks. Wrap scripted
token calls in a finite timeout.

Before any request, check the selected identity, token audience, tenant, and
expiry. JWT decoding can inspect claims locally but is not signature validation.
Never log the whole JWT, authentication response, headers, refresh tokens, or
cache contents. Pass tokens through in-process HTTP headers, not command-line
arguments. Reacquire from the credential provider before expiry in long batches.

Start with a read-only allocation and availability probe. An existing first-party
CLI session has successfully performed these operations even when its visible
`scp` list did not contain licensing scope names. That is an observation, **not an
authorization guarantee**: respect actual API responses and do not assume GET
success grants write permission.

For an approved delegated application, the permission reference lists
`Licensing.Allocations.Read` and `Licensing.Allocations.ReadWrite`; request
`https://api.powerplatform.com/.default` with the application's consented
permissions. The user must have Power Platform Administrator, Global Administrator,
or equivalent authorized capacity-management access.

If existing authentication is unavailable, use an approved client and an attended
browser sign-in. The `dataverse-auth` skill is a useful **authentication pattern**
for MSAL, protected persistence, account selection, and silent refresh; do not copy
its Dataverse audience, `user_impersonation` scope, or sample client into this
management API flow. Use a redirect URI compatible with the approved client and
chosen browser flow. Use the user's main Edge browser, not a side-pane browser.

Do not create registrations, grant consent, add roles, modify Conditional Access,
or switch identities to work around a denial without explicit authorization.
Do not use password authentication or scrape browser tokens. Keep token caches in
OS-protected per-user storage, outside repositories, shared skills, and OneDrive.
Unattended execution must fail clearly if interactive sign-in is needed.
Service-principal or sovereign-cloud support requires separate verified API,
authority, and permission/RBAC configuration; do not assume this delegated
commercial-cloud recipe applies unchanged.

## 3. Survey and save the pre-change state

Read each selected environment:

```http
GET https://api.powerplatform.com/licensing/allocationsByEnvironment/<environment-id>?api-version=2024-10-01
```

Read allocatable capacity using the **URL-encoded** filter:

```powershell
$EnvironmentId = '<selected-environment-id>'
$filter = [uri]::EscapeDataString("environmentId eq '$EnvironmentId' and EntitlementId in ('MCSMessages')")
$availabilityUri = "$Api/licensing/allocationsV2/availability?api-version=$Version&`$filter=$filter"
$availability = Invoke-RestMethod -Method Get -Uri $availabilityUri -Headers $headers -MaximumRedirection 0 -TimeoutSec 60
```

The relevant availability fields are:

```json
{
  "scope": { "tenantId": "<tenant-id>", "environmentId": "<environment-id>" },
  "entitlementAllocationsAvailable": [
    { "entitlementId": "MCSMessages", "availableQuantity": 12345, "unit": "NotSpecified" }
  ]
}
```

Verify the response scope. Do not sum availability across environments: repeated
responses can describe the same tenant capacity. Treat missing, malformed, or
unreadable availability as unknown, not zero or unlimited.

For decreases, record consumption context. Tenant-wide figures come from
`GET /licensing/entitlements/MCSMessages?api-version=2024-10-01`
(`entitlement.capacity.consumed.value`, `consumptionType` such as `MonthToDate`,
and `lastUpdatedOn`, which is refreshed daily). The documented per-environment
`GET /licensing/environments/<id>/entitlements` returned 404 on every supported API
version in one tested tenant. Treat per-environment consumption as unknown unless it
responds, and say so instead of implying that a decrease is safe.

Persist a timestamped JSON snapshot containing the tenant, environment IDs, UTC
capture time, availability response, per-environment HTTP status, and complete
allocation response. Use a private session artifact directory, **not this skill's
shared folder or a repository**. Exclude credentials and token claims that are
not needed for the audit.

Check every requested environment before starting the batch. Do not silently drop
404s, access failures, or malformed responses and continue with a smaller set.
Resolve them or obtain approval for a clearly identified subset. A missing
`MCSMessages` entry is not automatically equivalent to a verified zero allocation:
establish initialization/default behavior before writing it.

### Distinguish an uninitialized allocation from a missing environment

In the 2026-11-23 Workshop Hub run, 48 valid environments returned 404 because
they had no allocation records. Initializing them with the same PATCH endpoint
succeeded, without changing their environment-group tenant-pool policy. This is
an observed service behavior, **not permission to treat every 404 as zero**.

Before proposing a first allocation:

1. Confirm the exact environment exists, is enabled, and belongs to the requested
   tenant using the admin environment API. A licensing 404 alone proves none of these.
2. Read the allocation index, `GET /licensing/allocationsByEnvironment?api-version=2024-10-01`,
   following pagination if supplied. Confirm the environment has no record there
   either. An incomplete or unreadable index is unresolved, not evidence of absence.
3. Read the environment's group membership, policy assignments and effective
   credit rules. Record inherited settings separately from explicit overrides.
   If inheritance cannot be established, stop instead of inventing rules.
4. Save this evidence and plan a **first allocation**, not a reduction from an
   assumed balance. Check availability for the entire planned increase.
5. Recheck absence and policy immediately before an approved canary. Use the
   existing PATCH contract with `currencyType` and `allocated` only when there
   are no explicit currency settings to preserve. **Omit `enforcementRules`**:
   do not send an empty array, copy a group rule as a local override, or set
   `TenantPool: false`. A policy lock is not a reason to remove settings.
6. Read back the canary allocation, check that no unexpected currencies or explicit
   overrides appeared, and re-read group policy before the remaining initializations.
   Survey the complete requested set afterwards.

If any record appears during this process, switch to the normal existing-record
comparison and preservation path. A missing `MCSMessages` entry in an otherwise
existing record also uses that path; never discard its other currencies.

Zero reserved allocation and permission to draw from the tenant pool are separate
facts. A PPAC spot check on one environment cannot establish the before-state of
the rest of a batch.

## 4. Build a dry-run plan

For every environment, record the current allocation, target, delta, and unchanged
enforcement rules. Skip writes already at the target. Preserve all returned
`Alert`, `TenantPool`, `PayGo`, and `Deny` settings, including absent versus explicit
false values; do not fill in rules from an example.

Calculate:

```text
credits_to_add = sum(max(target - current, 0))
allocation_to_release = sum(max(current - target, 0))
```

Show the environment count, already-correct count, increases, decreases, totals,
and any unresolved errors. A dry run performs no writes.

Check available capacity against **increases**, not final allocation totals.
Do not count planned reductions as spendable until they have succeeded and a
fresh availability read confirms capacity. If capacity is insufficient, stop
before writing and ask for a different allocation or an explicit staged transfer.
Do not purchase capacity, enable overage, or partially allocate automatically.

For a transfer, agree the release-first sequence and its possible service impact,
verify the reductions, refresh availability, then plan the increases. This is not
an atomic cross-environment transaction.

## 5. Apply an absolute allocation, preserving everything else

Use this endpoint for both allocation and deallocation:

```http
PATCH https://api.powerplatform.com/licensing/allocationsByEnvironment?api-version=2024-10-01
Content-Type: application/json
```

Example **only when the current rules are exactly as shown**:

```json
{
  "environmentId": "<environment-id>",
  "currencyAllocations": [
    {
      "currencyType": "MCSMessages",
      "allocated": 5000,
      "enforcementRules": [
        { "ruleType": "TenantPool", "enabled": false }
      ]
    }
  ]
}
```

For full deallocation, the same request sets `"allocated": 0`; a partial
deallocation sets the computed lower absolute target. Do not send a negative
delta, delete the environment, delete its settings, or invent a DELETE endpoint.
If the service rejects a reduction because of consumption or other constraints,
report the actual error; do not claim capacity was reclaimed.

Build the payload from the latest GET response, changing only `MCSMessages.allocated`.
Preserve other currencies' writable configuration unchanged if present; do not
assume an omitted array entry survives a PATCH. Include `currencyType`, `allocated`,
and the existing `enforcementRules` when present. Do not write `autoAllocated` or
copy response-only fields into the request. Stop for unexpected schema rather
than guessing. Verify all unaffected currencies and rules afterwards.

The tutorial also documents `PUT /licensing/allocationsV2`, whose body uses
`scope`, `allocatedEntitlements`, `entitlementId`, and `allocation.quantity`.
It is a different contract. Do not mix that body with this PATCH endpoint or
switch APIs merely to evade an error.

For a bulk run:

1. Persist the plan and all before-states before the first write. Require an
   explicit execution switch in any generated script; default to dry-run. Require
   an additional decrease acknowledgement when the plan includes reductions.
2. Immediately before each write, re-read configuration and compare it with the
   plan. If allocation or rules changed, pause and replan rather than overwriting
   a concurrent administrator's changes. These endpoints are not a documented
   atomic compare-and-swap; retain that limitation in the implementation.
3. Check current availability before increases. Apply one representative canary
   from the approved set, then read it back and verify the allocation, every rule,
   and other currencies before continuing.
4. Apply the remaining changes sequentially or with conservative bounded
   concurrency. Write per-environment outcomes incrementally to a separate
   results artifact. Stop on a verification mismatch or shared auth/capacity/
   policy failure; report completed and unattempted environments explicitly.

## 6. Verify, report, and recover

A PATCH 200 alone is insufficient. Re-read each changed environment and require:

- The absolute `MCSMessages.allocated` equals the target.
- The complete rule set and values match the approved before-state, ignoring only
  rule ordering, unless the user separately authorized a rule change.
- All unaffected currencies' writable settings remain unchanged.

Do not mark an environment successful merely because the allocation matches while
its rules changed. Record `autoAllocated` for context; investigate a difference
without treating this service-managed field as a manually restorable allocation.

After a bulk run, perform a fresh read-only survey of the **entire requested set**,
including already-correct entries, and refresh availability. Allow only bounded
read retries for propagation. Report verified successes, unchanged environments,
failures, unknown outcomes, unattempted environments, total reserved allocation,
and the measured remaining availability. Availability can also change through
consumption or concurrent administrators; do not promise an exact pool increase
from a reduction or treat an unexplained difference as a successful refund.

Resume from live state, not just a success log. For a delta request, retain the
original planned absolute targets: rerunning "add 5,000" against the new balance
would double-allocate. Replan only with awareness of the original intent.

Rollback is a separate authorized operation using each environment's own saved
allocation and rules, not a blanket reset to zero. Re-read, compare with the state
this run left behind, recheck capacity for restorations that increase allocations,
and apply the same canary and verification process. Never overwrite newer changes
or promise atomic rollback.

## Error handling and safety boundaries

| Condition | Required behavior |
|---|---|
| 401 | Inspect audience, tenant, expiry, and sign-in; one fresh-token retry of a read can be appropriate. Re-read before considering a write retry. |
| 403 | Surface the actual permission/policy error. Repeated sign-ins do not grant authorization. An **empty-body 403** from `allocationsByEnvironment` has been observed for **deleted** environments: check the admin environment list before reporting a permission problem, and report deleted environments as out of scope rather than failures. |
| Token command hangs | Usually a hidden interactive prompt (for example `AADSTS50020` from the wrong default CLI account). Stop the hung processes and pin the target tenant's account (section 2). Never wait indefinitely. |
| 404 | Verify environment ID and tenant, then use the initialization checks above for a missing allocation record. Never recreate or substitute an environment. |
| `TenantPoolLockedByPolicy` | Stop and report the environment-group policy. Do not silently strip the rule and retry, change the group, or remove membership. Any remediation requires separate authorization. |
| 429 | Honor `Retry-After` with bounded retries/backoff. Re-read state and availability before a write retry. |
| GET timeout/5xx | Bounded retry with backoff; then an explicit read failure. |
| PATCH timeout/5xx/connection loss | Outcome is unknown, not necessarily failed. Read back before retrying; do not repeat a delta or launch a second batch blindly. |
| Redirect | Reject it. Keep authenticated requests on the confirmed API origin. |
| Missing data/schema mismatch | Stop and surface the problem; never substitute success-shaped defaults. |

Capture safe API error codes, messages, HTTP statuses, and request/correlation IDs.
Do not log authorization headers or full authentication failures containing
sensitive data. Configure finite HTTP timeouts. Avoid unbounded parallelism,
broad catch-and-continue handlers, or silently successful exit codes after partial
failure.

Allocation changes are not permission to toggle `TenantPool`, `PayGo`, `Alert`, or
`Deny`. The governance blog's enforcement settings are illustrative, not defaults.
New environments can draw from the tenant pool by default; zero reserved capacity
is therefore especially unsuitable as proof that consumption is blocked.

## Sources

- [Cost control and governance in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)
- [Tutorial: Manage Copilot credit allocations programmatically](https://learn.microsoft.com/en-us/power-platform/admin/programmability-tutorial-manage-copilot-credit-allocations)
- [Get allocations by environment](https://learn.microsoft.com/en-us/rest/api/power-platform/licensing/allocations-by-environment/get-allocations-by-environment)
- [Update allocations by environment](https://learn.microsoft.com/en-us/rest/api/power-platform/licensing/allocations-by-environment/update-allocations-by-environment)
- [Power Platform API authentication](https://learn.microsoft.com/en-us/power-platform/admin/programmability-authentication-v2)
- [Power Platform API permission reference](https://learn.microsoft.com/en-us/power-platform/admin/programmability-permission-reference)
- [Manage Copilot Credits and capacity](https://learn.microsoft.com/en-us/power-platform/admin/manage-copilot-studio-copilot-credits-capacity)
