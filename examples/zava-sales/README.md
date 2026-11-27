# Zava Sales

Edit these sources on a branch and submit a pull request. The four components work together, but have separate build and release targets. Changing this repository does not deploy anything or grant access to a tenant.

| Source | What to edit |
| --- | --- |
| [`zava-sales/`](zava-sales/) | Managed Runtime React app: CRM screens, delegated Dataverse access, concurrency checks and the host side of the chat handshake. `generated/` contains the connector types and services. |
| [`zava-copilot-pane/`](zava-copilot-pane/) | Separately hosted Copilot Studio chat: `chat/` is the app; `public/` at the top level is the static frame-check page, **not** the chat build. |
| [`zava-app-mcp/appPackage/`](zava-app-mcp/appPackage/) | Microsoft 365 declarative agent: catalog manifest, instructions, conversation starters, Remote MCP tool definitions and catalog icons. This is not the Copilot Studio chat agent. |
| [`solutions/ZavaCRM/`](solutions/ZavaCRM/) | Unpacked unmanaged Dataverse solution: model-driven app, tables, forms, views, dashboard, participant role, search, Copilot Studio bot and invoker connection references. |

## Prepare a private build

Use Git, Python 3.9+, Node.js 24+ with npm, and Power Platform CLI (`pac`). Use a trusted checkout on a private, non-synced disk. An environment owner supplies the approved **existing** deployment values; there is no default environment. Do not put passwords, tokens, connection strings, user lists, exports or populated bindings in Git, issues or PRs.

1. From this directory create `.local/<profile>/`. Copy `bindings.example.json` there as `bindings.json`. Fill it from the existing app projects and authorized environment settings:

   | Binding | Source |
   | --- | --- |
   | `TENANT_ID`, `ENVIRONMENT_ID` | Directory and environment used by both the app and its companion agent. |
   | `RUNTIME_APP_ID`, `CONNECTION_REFERENCE_ID` | Existing Managed Runtime project's `ms.config.json`: `appId` and the **key** under `connectionReferences`. Do not supply a user's connection ID or a shared connection. |
   | `MODEL_APP_ID`, `ACTIVITY_VIEW_ID` | Existing model-driven app ID (also the catalog ID for this package) and the **My Activities** view ID in its generated declarative agent. The four solution-owned default view IDs stay in source. |
   | `PANE_CLIENT_ID` | Public client ID of the companion's enrolled SPA. Not a secret. Keep the registered redirect/relay pages and delegated scope unchanged. |
   | `DATAVERSE_ORIGIN`, `AGENT_API_ORIGIN` | Exact Dataverse organization origin and the environment-specific Power Platform API origin from the generated App MCP URL. |
   | `APP_ORIGIN`, `PANE_ORIGIN`, `SHELL_ORIGIN` | Exact origins of the Managed Runtime app, separately hosted chat, and enclosing platform shell. Use the existing approved frame policy. The shell is a permitted ancestor, **not** a trusted message sender. |
   | `APP_ROLE_IDS` | Nonempty list of approved app module role GUIDs from the existing app's `AppModuleRoleMaps`. Preserve the target's assignments; do not substitute a user, group, or guessed role. The participant role *definition* remains in the solution. |

   Use plain GUIDs without braces and lowercase HTTPS origins without paths, wildcards or trailing slashes. Copy the matching Managed Runtime project's `.ms/schemas/commondataserviceforapps/commondataserviceforapps.Schema.json` into the same private directory as `connector.schema.json`. This generated connector description contains infrastructure-specific metadata; it is not the portable TypeScript service in `generated/`.

2. Run `python prepare.py <profile>` (on Windows, `py -3` also works). It reads the tracked source files from the working tree, renders `*.in` with the private bindings, restores the connector schema, writes the companion's local Vite client ID and packages the Microsoft 365 agent. Source files you have just added must be tracked. The result is `.local/<profile>/build/`; the script refuses to overwrite a previous build. Make edits **here in the tracked source**, not in the generated copy. To rebuild, move or discard only the old generated `build/` first.

3. From the generated `build/` directory, run:

   ```sh
   npm --prefix zava-sales ci
   npm --prefix zava-sales run lint
   npm --prefix zava-sales run build
   npm --prefix zava-sales test
   npm --prefix zava-copilot-pane test
   npm --prefix zava-copilot-pane/chat ci
   npm --prefix zava-copilot-pane/chat run lint
   npm --prefix zava-copilot-pane/chat run build
   npm --prefix zava-copilot-pane/chat test
   pac solution pack --folder solutions/ZavaCRM --zipfile ZavaCRM.zip --packagetype Unmanaged
   pac solution unpack --zipfile ZavaCRM.zip --folder roundtrip --packagetype Unmanaged
   ```

   The lockfiles pin versions and integrity without pinning a registry. Use your approved npm registry; do not add registry credentials to the project. Do not override `VITE_ZAVA_PANE_CLIENT_ID` in your shell when building the configured companion.

## Review the outputs

- **Managed Runtime**: `zava-sales/dist/` and the generated `zava-sales/ms.config.json` belong to the same app. Retain `repoType: "none"` and delegated OAuth. The host and companion must agree on message version and exact origins; build and test both after protocol changes.
- **Companion**: `zava-copilot-pane/chat/dist/` includes its own `staticwebapp.config.json`, redirect and relay pages. Keep the CSP and tenant/user checks; do not broaden the origin list to make local development easier.
- **Microsoft 365**: `ZavaSalesHub.zip` contains the three JSON files and two icons at the ZIP root. Preserve the existing catalog identity and increment the manifest version for an approved update. When regenerating the App MCP contract, merge changes into the tracked templates rather than copying a bound package into Git.
- **Dataverse**: `ZavaCRM.zip` is the unmanaged solution. Keep component IDs, publisher, schema names, role privileges, bot authentication and invoker references intact. Target environments need the dependencies listed in `Other/Solution.xml`. Packing and unpacking do not import, assign a role, bind a connection or publish an agent.

Only an authorized releaser should use the private artifacts in the existing release process. Neither the configured build tree nor its ZIPs belong on a public branch or in a GitHub release.

**Known validation difference:** the App MCP export omits `runtimes[0].auth` in `ai-plugin.json`. The published v2.4 plugin schema requires that field. The source preserves the export; creating the ZIP is not a claim that it passes that schema or will be accepted by the catalog. Confirm the supported contract with the catalog owner before a release. Do not guess an authentication mode or add a consent grant to silence a validator.
