"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { sha256 } = require("./core.cjs");

async function createTokenProvider(config, interactive = false) {
  if (process.platform !== "win32" || !process.env.LOCALAPPDATA) {
    throw new Error("This authentication adapter requires Windows and a DPAPI-protected local cache.");
  }
  const { PublicClientApplication, InteractionRequiredAuthError } = require("@azure/msal-node");
  const { PersistenceCreator, PersistenceCachePlugin, DataProtectionScope } = require("@azure/msal-node-extensions");
  const authority = `https://login.microsoftonline.com/${config.tenantId}`;
  const scopes = ["https://graph.microsoft.com/Files.ReadWrite.All", "https://graph.microsoft.com/User.ReadBasic.All"];
  const key = sha256(`${authority}|${config.clientId}|${config.adminUpn}|graph`);
  const directory = path.join(process.env.LOCALAPPDATA, "workshop-provisioning-auth");
  await fs.promises.mkdir(directory, { recursive: true });
  const persistence = await PersistenceCreator.createPersistence({
    cachePath: path.join(directory, `${key}.cache`),
    dataProtectionScope: DataProtectionScope.CurrentUser,
    serviceName: "workshop-provisioning",
    accountName: key,
  });
  const app = new PublicClientApplication({
    auth: { clientId: config.clientId, authority },
    cache: { cachePlugin: new PersistenceCachePlugin(persistence) },
  });
  const matches = (await app.getTokenCache().getAllAccounts()).filter(account =>
    account.username.toLowerCase() === config.adminUpn && account.tenantId.toLowerCase() === config.tenantId);
  if (matches.length > 1) throw new Error("Ambiguous cached administrator identity.");
  let account = matches[0], current;
  async function acquire() {
    if (current && current.expiresOn.getTime() - Date.now() > 120000) return current.accessToken;
    let result;
    if (account) {
      try { result = await app.acquireTokenSilent({ scopes, account }); }
      catch (error) {
        if (!(error instanceof InteractionRequiredAuthError)) throw new Error(`Authentication failed: ${error.errorCode || error.name}`);
      }
    }
    if (!result) {
      if (!interactive) throw new Error("Attended sign-in is required. Run provision.cjs --config <file> --bootstrap.");
      const browser = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles]
        .filter(Boolean).map(root => path.join(root, "Microsoft", "Edge", "Application", "msedge.exe")).find(fs.existsSync);
      if (!browser) throw new Error("Microsoft Edge was not found; resolve the browser setup before signing in.");
      const timer = setTimeout(() => { console.error("Sign-in timed out."); process.exit(1); }, 600000);
      try {
        result = await app.acquireTokenInteractive({
          scopes, loginHint: config.adminUpn, prompt: "select_account",
          openBrowser: url => new Promise((resolve, reject) => {
            const child = spawn(browser, [url], { stdio: "ignore" });
            child.once("error", reject);
            child.once("spawn", resolve);
          }),
        });
      } catch (error) {
        throw new Error(`Interactive authentication failed: ${error.errorCode || error.name}`);
      } finally { clearTimeout(timer); }
    }
    if (!result?.accessToken || result.account?.username.toLowerCase() !== config.adminUpn ||
        result.tenantId?.toLowerCase() !== config.tenantId || !result.expiresOn ||
        result.expiresOn.getTime() - Date.now() <= 120000) throw new Error("Unexpected token identity, tenant or expiry.");
    account = result.account;
    current = result;
    interactive = false;
    return result.accessToken;
  }
  // MSAL persistence transactions on this client must not overlap.
  let pending;
  return () => {
    if (!pending) pending = acquire().finally(() => { pending = undefined; });
    return pending;
  };
}
module.exports = { createTokenProvider };
