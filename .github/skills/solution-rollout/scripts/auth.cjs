"use strict";
// Delegated sign-in for the administrator in config.adminUpn (MSAL public client + DPAPI-protected token cache,
// shared with the dataverse-auth skill when the tenant, client id and bootstrap origin match). Tokens are never printed.
//
//   node scripts/auth.cjs --config <cfg> --bootstrap          attended: opens the browser once
//   node scripts/auth.cjs --config <cfg> --check [--url <environment url>]   silent WhoAmI
const { parseArgs, loadConfig } = require("./lib/core.cjs");
const { createAuth, normalizeOrigin } = require("./lib/dataverse.cjs");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.get("config") || !(args.has("bootstrap") || args.has("check"))) throw new Error("Usage: node scripts/auth.cjs --config <config.json> --bootstrap | --check [--url <environment url>]");
  const cfg = loadConfig(args.get("config"), { inspect: false });
  const auth = createAuth(cfg);
  if (args.has("bootstrap")) {
    const r = await auth.bootstrap();
    console.log(`Signed in as ${r.account} (tenant ${r.tenantId}). Token cache: ${r.cachePath}`);
  }
  const origin = args.get("url") ? normalizeOrigin(args.get("url")) : auth.anchor;
  const who = (await auth.client(origin).dv("GET", "WhoAmI", { timeoutMs: 60000 })).json;
  console.log(`OK ${origin} | caller systemuserid ${who.UserId} | organization ${who.OrganizationId}`);
}

main().catch((e) => {
  console.error(`FATAL: ${String((e && e.message) || e).slice(0, 1200)}`);
  process.exit(1);
});
