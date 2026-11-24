---
name: solution-rollout
description: Bulk-import one or more Dataverse solution packages (.zip) into many Power Platform environments as an administrator, then make each environment's owner (for example the lab attendee of a "DEV - User X" environment) the owner of everything inside them - Copilot Studio agents and their topics/components, cloud flows and Copilot Studio workflows, connection references, connectors, environment variables and other user-owned rows - publish the imported agents, verify the result and heal agents stuck in provisioning. Use for workshop/lab environment preparation, "import these solutions into all these environments", "assign the solution to the environment owner", "reassign connection references/flows/agents to the user", "repeat on all these envs", or "fix agents stuck provisioning after a bulk import". Solutions, environments and owners are inputs, never hard-coded. Do NOT use for production ALM promotion (use plan-alm / import-solution) or for creating or binding connections on a user's behalf.
---

# Solution rollout

Admin-driven, resumable rollout of any set of solution packages to any list of environments, with ownership handed to each environment's user. Every step uses the Dataverse Web API and the Power Platform admin API under the administrator's own delegated sign-in. No app registration, secret, az CLI, PAC CLI or impersonation is needed, and tokens are never printed.

All commands run from this skill directory (`<skill-dir>` = the folder holding this file). Every script prints usage when it gets wrong arguments; run it before composing an unusual command.

The repository copy is maintained under `.github/skills/solution-rollout`.
See [Workshop preparation](../../../docs/WORKSHOP_PREPARATION.md) for coordinating
solutions, credits and OneDrive content. Loading or editing this skill does not
authorize authentication or a live rollout.

## What it does, and what it cannot do

For each environment it performs these steps in order:

1. **Inspect.** Confirm that the caller is a System Administrator and resolve the owner (see [Owner resolution](#owner-resolution)). It also reads the installed solution versions, imports that are already running, and what the owner has built.
2. **Plan each package.** Possible actions:
   - `import`, `upgrade` or `present`;
   - `newer-present`;
   - blocked, as `blocked-upgrade`, `blocked-customized` or `blocked-managed-mismatch`.
3. **Import** with `ImportSolutionAsync`. `OverwriteUnmanagedCustomizations` is off by default and `PublishWorkflows` is on. When the connector service throttles an import, the rollout backs off and retries, because a throttled import rolls back cleanly. After an unmanaged upgrade that carries tables, it runs `PublishAllXml` (`import.publishCustomizations: "auto"`).
4. **Reassign** every ownable component of every configured solution that is installed, not only the ones just imported. It uses the `Assign` action, falls back to `PATCH ownerid`, and handles each component as described in [What gets reassigned](#what-gets-reassigned).
5. **Publish** agents (`PvaPublish`). A 409 conflict usually means Copilot Studio's own post-provisioning publish is running, so the rollout waits and tries again. It waits for the publish operation to finish.
6. **Snapshot** the result: versions, owners, agent publish state, flow state, connection reference binding and owner to-dos.

**It cannot do these things for the owner, by design:**

| Owner to-do | Why an administrator cannot do it |
|---|---|
| Create their own connections and bind each **connection reference** | A connection belongs to the person who signs in to it. Owning a connection reference does not bind it. |
| Turn on **flows** that use those connections | Only the owner of a connection can turn on a flow that uses it. Flows stay Off until the reference is bound. |
| Change the owner of **canvas apps** | Canvas app ownership lives in the Power Apps service, not in Dataverse. These apps are reported as `manual`. |
| Set **environment variable values** | Values arrive only if the package carries them; definitions are reassigned. |

`--verify` lists the owner to-dos in each environment, so you can hand the attendee an exact checklist.

## Setup (once)

Requires Node 22 or later.

```powershell
cd <skill-dir>
npm install
Copy-Item config.example.json C:\work\my-rollout\config.json   # keep config and results outside the skill folder
Copy-Item envs.example.txt   C:\work\my-rollout\envs.txt
node scripts/auth.cjs --config C:\work\my-rollout\config.json --bootstrap   # opens the browser once; sign in as adminUpn
node scripts/auth.cjs --config C:\work\my-rollout\config.json --check       # silent WhoAmI
```

- The sign-in uses the MSAL public client `51f81489-12ee-4a9e-aaae-a2591f45987d`.
- It stores a DPAPI-protected token cache under `%LOCALAPPDATA%\dataverse-auth\`, shared with the `dataverse-auth` skill.
- The same sign-in silently covers every environment in the tenant and the admin API.
- After the bootstrap, everything else runs unattended.
- Never read or print the cache file.

Results contain user names and IDs. Keep the working folder outside repositories
and synced folders. Files request owner-only POSIX permissions; on Windows, use a
private folder with an appropriate ACL because file modes do not enforce Windows ACLs.

## Configuration

`config.json` (relative paths resolve from the config file's folder):

| Key | Required | Meaning |
|---|---|---|
| `tenantId` | yes | Tenant GUID. Every token is checked against it and against `adminUpn`. |
| `adminUpn` | yes | Administrator who signs in; needs System Administrator in each environment and Power Platform admin rights. |
| `bootstrapOrigin` | yes | Any Dataverse URL in the tenant the administrator can open (keys the token cache). |
| `packages` | yes | Solution `.zip` paths, or `{ "path", "sha256" }` to pin the exact file. Packages import in the listed order, so put dependencies first. One version per solution. |
| `environments` | no | Default environment list file (`--envs` overrides it). |
| `outDir` | no | Results and logs folder (default `out`). |
| `owner.source` | no | `usedBy` (default; the admin API's assigned user of a developer environment), `createdBy`, or `none`. |
| `owner.upn` | no | One owner for every environment (overrides `source`). |
| `owner.envNamePattern` | no | Safety check. A regex whose first group must equal the owner's full name, for example `^DEV - (.+)$` for "DEV - User SWILJ8LB". When the names differ, the environment is flagged and skipped. |
| `import.overwriteUnmanagedCustomizations` | no | Default `false`. Keep it off for labs, or attendee work can be overwritten. |
| `import.publishWorkflows` | no | Default `true`. |
| `import.publishCustomizations` | no | `auto` (default, after unmanaged upgrades that carry tables), `always` or `never`. |
| `publish` | no | `imported` (default): publish agents of solutions this tool imported, only when they have not published since. `all`: also publish any unpublished agent in the configured solutions. `none`. |
| `assign.botComponentsByParent` | no | Default `true`. Also reassign agent components found through their parent agent. |
| `heal.probePrefix` | no | Schema prefix for throwaway probe agents (default `<publisherPrefix>_ZZProvProbe`). |

### Environment list

Put one environment on each line, as an environment ID or a Dataverse URL. You can add `,owner` to a line, where the owner is a UPN, an Entra object ID or a `systemuserid`. `#` comments are ignored, and so are Markdown table pipes, so a pasted table works as-is. See `envs.example.txt`.

### Owner resolution

The owner is taken from the first source that gives one:

1. the owner on that environment's line in the list;
2. `--owner`;
3. `config.owner.upn`;
4. the admin API `usedBy` or `createdBy` field.

The value is matched to an enabled `systemuser` in that environment. An environment is flagged and skipped on any of these:

- `no-owner`
- `owner-not-in-env`
- `owner-ambiguous`
- `owner-disabled`
- `owner-name-mismatch`
- `caller-not-sysadmin`
- Dataverse is not `Ready`

## Workflow

Run each step and read its summary before the next. Each step writes `<outDir>/results/<env>.<kind>.json` and a log under `<outDir>/logs/`.

```powershell
$cfg = "C:\work\my-rollout\config.json"
node scripts/rollout.cjs     --config $cfg --inspect-packages     # offline: what each zip carries and the owner to-dos it implies
node scripts/resolve-envs.cjs --config $cfg                       # read-only: env list -> URLs, org ids, usedBy (writes out/envs-resolved.json)
node scripts/rollout.cjs     --config $cfg --preflight            # read-only: owner, roles, versions, plan, flags
node scripts/rollout.cjs     --config $cfg --deploy --dry-run     # read-only: exactly what would be imported and reassigned
node scripts/rollout.cjs     --config $cfg --deploy --only <one-env>   # canary first
node scripts/rollout.cjs     --config $cfg --deploy               # the rest (resumable)
node scripts/rollout.cjs     --config $cfg --verify               # read-only: versions, ownership, publish state, owner to-dos
node scripts/heal-agents.cjs --config $cfg                        # read-only scan for stuck/missing/unpublished agents
```

Useful options:

| Option | Effect |
|---|---|
| `--only a,b` | Targets a subset. Each entry can be an environment ID, URL, display name or host prefix. |
| `--url https://org.crm.dynamics.com [--owner upn]` | Targets one environment without `resolve-envs`. |
| `--concurrency N` | Deploy defaults to 12. Imports are throttled per identity: this is a shared budget across concurrent sessions, not a per-process allowance. Start lower when another rollout uses the same administrator. |
| `--force` | Redoes environments already `done` with the same package set. By default they are skipped. |
| `--allow-upgrade` | Upgrades older installed versions. Off by default; the plan shows `blocked-upgrade`. |
| `--allow-upgrade-customized` | Also upgrades when the owner already modified a component of that solution, or turned on one of its flows. **Risky:** an unmanaged upgrade can deactivate or overwrite their work, even with overwrite off. |
| `--allow-preparing` | Continues on environments whose Dataverse is still `PreparingInstance`. |
| `--summary [--preflight\|--verify\|--dry-run]` | Re-prints the last summary from saved results. |

Deploy statuses:

| Status | Meaning |
|---|---|
| `done` | All packages are at the target version, everything is owned by the owner, and the agents are published. |
| `partial` | A package is behind, for example blocked. |
| `flagged` | Skipped. The reason is in `notes`. |
| `error` | Read `errors`. |
| `unreachable` | The environment could not be reached. |

Re-running deploy skips saved `done` environments with the same package set.
Always run `--verify` against the **entire requested set**, including those skips:
old results do not prove current ownership or publish state. If verification finds
drift, inspect it and use `--force --only <affected-env>` to reassert ownership.
Do not run two writers against the same environment.

An import-complete result is not attendee-ready. The 2026-11-23 Workshop Hub
runs still required attendees to bind their connections and activate the workflow
after all agents were published. Preserve that distinction in the handoff.

## What gets reassigned

Reassignment covers every row behind a solution component whose table is user- or team-owned, resolved through `solutioncomponentdefinitions` and the table metadata. That includes:

| Component | Notes |
|---|---|
| Agents (`bot`) | Reassigned to the owner. |
| Agent components (`botcomponent`) | Topics, knowledge, tools and skills, **by parent agent as well as by solution membership**. `Assign` on an agent does not cascade, and Copilot Studio creates some components at provisioning that are not in the solution. |
| Flows and workflows (`workflow`) | Cloud flows, Copilot Studio workflows (category 5), classic workflows and business rules. |
| Connection references | Reassigned so the owner can edit and bind them. |
| Connectors | Custom connectors and MCP servers. |
| Environment variable definitions | Values are not set; see the owner to-dos above. |
| Any other user- or team-owned row the solution carries | Found through the table metadata. |

Organization-owned and metadata components need no owner and are counted as `component types without an owner`. Canvas apps are reported as manual.

## Healing stuck agents

After a bulk import, an agent sometimes never finishes provisioning: `synchronizationstatus` shows no provisioned state, and the agent cannot publish. You may also see an agent that is missing even though its solution is installed.

```powershell
node scripts/heal-agents.cjs --config $cfg                         # scan (read-only)
node scripts/heal-agents.cjs --config $cfg --fix --only <env>      # heal one first
node scripts/heal-agents.cjs --config $cfg --fix --passes 3 --every 15   # retry transient states
```

`--fix` works on each environment from the least invasive step to the most:

1. Delete leftover probe agents. If an import is running, skip the environment.
2. If the owner has already modified the affected solution, leave the environment alone (`skipped-target-modified`).
3. Create a throwaway probe agent. If it cannot provision either, the environment itself is unhealthy. In that case, only re-assert ownership and report `env-unhealthy`, then retry later with `--passes`.
4. Run `PvaProvision` on each stuck agent in place and wait (`--reprov-min`, default 5).
5. **Only with `--recreate`:** delete the still-broken agents and re-import their package.
6. Publish anything that is still unpublished, then reassign every component.

Heal statuses:

| Status | Meaning |
|---|---|
| `healed`, `fixed`, `ok` | Healthy. |
| `still-stuck`, `env-unhealthy` | Retry later. |
| `skipped-target-modified` | The owner's work wins; not touched. |
| `import-running` | An import was running; retried by `--passes`. |
| `error` | Read the result file. |

## Rules

- **Read-only steps first.** Before writing to a new set of environments, always run `--preflight` and `--deploy --dry-run`, then deploy one canary environment. Show the user the dry-run summary before the full deploy.
- **Never import into production.** Packages are imported as they are; this tool is meant for lab, training or development environments.
- **Never set `overwriteUnmanagedCustomizations`, `--allow-upgrade-customized` or `--recreate` without asking.** Each can destroy attendee work.
- **Never create, share or bind connections, and never turn flows on, as another user.** Hand the owner to-dos from `--verify` to the attendees instead.
- **Before changing a lab environment someone is using**, check `owner already built N agent(s)` and `blocked-customized` in the plan.
- Keep `config.json`, environment lists and `out/` out of source control. The skill's `.gitignore` covers its own folder.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Token cache not found` or `Interactive sign-in required` | Run `auth.cjs --bootstrap` again, attended. |
| `Admin API token is for X` | You signed in with the wrong account. Run the bootstrap again as `adminUpn`. |
| `owner-not-in-env` | The user has not been added to that environment yet. Add them, or give an owner in the list. |
| `owner-name-mismatch` | The environment's display name does not name the resolved owner. Fix the list, or remove `envNamePattern`. |
| Import fails with `TooManyConcurrentRequests`, `exceeded limit` or `Connector import: FAILURE` | The rollout already tries up to four times, with backoff of one to three minutes per attempt. If it still fails, lower `--concurrency`. |
| Import succeeds but has component issues | They are listed in `imports[].issues` in the deploy result, from `importjob.data`. |
| Agent stays unpublished | Run `heal-agents.cjs` (scan, then `--fix`). |
| Flow turned off after an upgrade | The owner had customized it. Ask them to turn it back on. A plain `--allow-upgrade` avoids this by blocking customized solutions. |

## Tests

`npm test` runs the offline unit tests (`tests/`). The ZIP test also inspects a real package if `ROLLOUT_TEST_ZIP` points to one.
