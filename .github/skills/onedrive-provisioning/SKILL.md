---
name: onedrive-provisioning
description: Prepare workshop attendees' OneDrives and upload an explicitly selected file or Cowork skill pack without overwriting existing content. Use for bulk OneDrive lab provisioning, preload workshop files, or load a training file pack for selected users. Verifies recipient identities, freezes a manifest, requires a canary, and verifies file contents. Not for adding a OneDrive connector to an app, syncing personal OneDrive folders, or distributing files outside the approved recipient list.
---

# OneDrive workshop provisioning

Create-only distribution to a named set of training users. Adapted from the
Workshop Hub provisioning runs; no tenant, account, recipient list, file pack,
fixed batch size or dependency path is inherited from those runs.

**Loading or editing this skill authorizes no sign-in or live action.** First
obtain the tenant, administrator, approved delegated Graph client, exact
recipients (UPN, Entra object ID and personal site URL), and desired file pack.
Never interpret "usual files" as permission to reuse old session paths silently:
identify the pack, show the manifest, then obtain approval.

See the [shared operator guide](../../../docs/WORKSHOP_PREPARATION.md).

## Boundaries

- Windows, Node 22+, commercial Microsoft 365. The authentication adapter uses
  MSAL browser/loopback sign-in in the main Edge browser and a DPAPI-protected
  cache under `%LOCALAPPDATA%\workshop-provisioning-auth`. No passwords, device
  code automation, browser-token scraping or tokens on command lines.
- Supply an existing approved public-client application configured for loopback
  browser sign-in and delegated Graph `Files.ReadWrite.All` and
  `User.ReadBasic.All`. Do not create registrations, grant consent or change
  tenant policy to bypass a denial. Bootstrap is attended; later runs fail if
  interactive sign-in is needed.
- The optional SharePoint preparation step needs the
  `Microsoft.Online.SharePoint.PowerShell` module and an authorized SharePoint
  administrator. Run it in a supported PowerShell host (Windows PowerShell 5.1
  if the installed module requires it). Never hard-code a local module version.
- SharePoint provisioning and site-collection admin grants require **separate
  explicit authorization**. Existing grants are reused. New grants remain until
  separately approved cleanup; report them. This tool never revokes pre-existing
  access or silently retains access without reporting it.
- Files are limited to 10 MiB each; large-file upload sessions are not implemented.
  Targets are relative to the recipient's **drive root**, not their personal-site
  root. `Documents/Cowork/...` therefore creates a `Documents` subfolder inside
  the drive; use that path only when the selected pack explicitly requires it.
- No overwrite, rename-on-conflict, deletion, sharing link or connection binding.
  Identical files are verified; different content is preserved and blocks the
  write batch. Resolve conflicts with the user, not by silently dropping recipients.

## Prepare a private working folder

Run commands from this skill's directory. Restore its dependencies with `npm ci`.
Copy `config.example.json`, `recipients.example.json` and `manifest.example.json`
to a private folder **outside Git repositories and OneDrive**, renaming them
to `config.json`, `recipients.json` and `manifest.json`.

Replace every placeholder. The client ID is required, not a suggested default.
`sharePointOrigin` and `sharePointAdminOrigin` must be the selected tenant's
matching `-my.sharepoint.com` and `-admin.sharepoint.com` origins.
All local paths resolve relative to `config.json`; file `source` paths resolve
relative to `payloadRoot`. Use the host OS's path separator for local paths and
`/` for remote Graph target paths.

The manifest lists `{ "source": "relative local file", "target": "remote/path" }`.
Hashes and sizes are computed before planning and checked again on resume and
before every upload. Duplicate recipients, target collisions, traversal and
symlink escapes outside the payload root are rejected.

Use a fresh `outDir` per run. The plan, identity checks, access outcomes and
per-file results are private runtime data, not source files. On Windows set the
working folder's ACL appropriately; POSIX `mode: 0600` does not enforce a Windows
ACL. The tools reject config, recipient and output paths inside a Git repository;
the operator must also keep them out of synced folders.

## Inspect, canary, apply, verify

```powershell
$cfg = "C:\work\private-workshop\config.json"
node scripts\provision.cjs --config $cfg --bootstrap
node scripts\provision.cjs --config $cfg --plan
```

`--plan` is the default. It reads every supplied object ID, compares its live UPN,
checks drive state, and writes a frozen plan. A 403 or 404 from the drive endpoint
does **not** mean the user is missing: all user identities must first be verified.
Read the plan and show recipient/file counts and inaccessible drives before writing.

If an approved canary needs provisioning or access, use the following only after
the user approves the applicable switches:

```powershell
$canary = "<one approved Entra object ID>"
.\scripts\prepare-access.ps1 -Config $cfg -OnlyObjectId $canary
# Dry run above opens no sign-in and changes nothing.
.\scripts\prepare-access.ps1 -Config $cfg -OnlyObjectId $canary -Execute -AllowProvisioning -AllowAdminAccess
node scripts\provision.cjs --config $cfg --execute --canary $canary
```

Omit `-AllowProvisioning` or `-AllowAdminAccess` unless that action is authorized.
The script verifies the site owner before granting access and polls new personal
sites for up to ten minutes. Graph access may lag SharePoint readiness; the uploader
also waits up to ten minutes. Persistent 403s are permission/policy blockers,
not a reason to keep retrying indefinitely.

The canary compares downloaded bytes and deliberately repeats one identical-file
upload with create-only guards, requiring a conflict response and unchanged eTag.
Only a fully verified canary unlocks the remaining set:

```powershell
.\scripts\prepare-access.ps1 -Config $cfg -Execute -AllowProvisioning -AllowAdminAccess
node scripts\provision.cjs --config $cfg --execute
node scripts\provision.cjs --config $cfg --verify
```

Skip permission preparation when all target drives are already accessible.
Permission changes and uploads are sequential and separately resumable: do not
start multiple writers for the same people, even from different working folders.
Throttling is shared across sessions using the same identity.

## Resume and report

Both executable paths use an exclusive `run.lock`. If a process crashes, confirm
its PID is no longer running before removing that **one** stale lock file.
Create `stop.flag` in the private output folder to stop between operations.

Keep the same config, roster and payload when resuming. Every run re-reads
identities, drive ownership and remote content; it does not skip recipients
because an old result says "complete". Changed inputs need a fresh reviewed plan
and canary in a new output folder.

`execute.json`, `verify.json` and `canary-results.json` record each target and
per-file result. Verification reads the entire requested set without writing
remote content. An ambiguous PUT response is reconciled by reading content
before any retry. Failure exits nonzero and preserves blocked/unattempted rows.

Report verified recipients/files against the manifest-derived expected totals,
conflicts, missing files, blocked and unattempted recipients, and access that was
newly granted or retained. An upload response, size match, old checkpoint or a
single user's spot check is not full-set verification. Access cleanup is a
separately authorized operation using the recorded before-state; preserve that
report when resuming.

## Offline tests

`npm test` uses temporary synthetic payloads and mocked Graph responses. It
does not authenticate or call Microsoft 365. Live compatibility still requires
an authorized canary in the target tenant.
