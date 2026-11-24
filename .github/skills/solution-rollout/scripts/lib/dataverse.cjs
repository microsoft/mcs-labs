"use strict";
// Multi-environment Dataverse Web API client for one tenant and one administrator account.
// One MSAL public client + DPAPI-protected cache (same layout as the dataverse-auth skill, so an existing cache is
// reused). A delegated token is requested per environment origin ("<origin>/user_impersonation") and never reused
// across environments; adminToken() covers the Power Platform admin API with the same sign-in.
// Batch work is silent; only `bootstrap()` opens a browser. Tokens are never printed.
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { PublicClientApplication, InteractionRequiredAuthError } = require("@azure/msal-node");
const { PersistenceCreator, PersistenceCachePlugin, DataProtectionScope } = require("@azure/msal-node-extensions");
const { sleep } = require("./core.cjs");

const API_PATH = "/api/data/v9.2/";
const ADMIN_API = "https://api.bap.microsoft.com";

function normalizeOrigin(raw) {
  const u = new URL(String(raw).trim());
  if (u.protocol !== "https:" || u.username || u.password || u.search || u.hash || (u.pathname !== "/" && u.pathname !== "")) {
    throw new Error(`Invalid Dataverse origin: ${raw}`);
  }
  if (!/^[a-z0-9-]+\.crm\d*\.dynamics\.com$/i.test(u.hostname)) throw new Error(`Unexpected Dataverse host: ${u.hostname}`);
  return u.origin.toLowerCase();
}

function buildUrl(origin, target) {
  if (/^https?:\/\//i.test(target)) {
    const u = new URL(target);
    if (u.origin.toLowerCase() !== origin) throw new Error(`Refusing to call a different origin: ${u.origin}`);
    return u;
  }
  return new URL(API_PATH + String(target).replace(/^\/+/, ""), origin);
}

const cacheKey = (authority, clientId, origin) => crypto.createHash("sha256").update(`${authority}|${clientId}|${origin}`).digest("hex").slice(0, 32);

function openBrowser(url) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === "win32" ? "rundll32.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler", url] : [url];
    const child = spawn(cmd, args, { stdio: "ignore", detached: false });
    child.once("error", (e) => reject(new Error(`Could not open the sign-in browser: ${e.message}`)));
    child.once("spawn", () => resolve());
  });
}

function createAuth({ tenantId, clientId, adminUpn, bootstrapOrigin }) {
  if (!bootstrapOrigin) throw new Error("config.bootstrapOrigin is required (any environment URL in the tenant; it keys the token cache).");
  const tenant = String(tenantId).toLowerCase();
  const account = String(adminUpn).toLowerCase();
  const authority = `https://login.microsoftonline.com/${tenant}`;
  const anchor = normalizeOrigin(bootstrapOrigin);
  const key = cacheKey(authority, clientId, anchor);
  const baseDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "dataverse-auth");
  const cachePath = process.env.DATAVERSE_TOKEN_CACHE || path.join(baseDir, `${key}.bin`);

  let appPromise;
  function getApp({ create = false } = {}) {
    if (!appPromise) {
      appPromise = (async () => {
        if (!create && !fs.existsSync(cachePath)) throw new Error(`Token cache not found (${cachePath}). Run: node scripts/auth.cjs --config <config> --bootstrap`);
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
        const persistence = await PersistenceCreator.createPersistence({
          cachePath,
          dataProtectionScope: DataProtectionScope.CurrentUser,
          serviceName: "dataverse-auth",
          accountName: key,
          usePlaintextFileOnLinux: false,
        });
        return new PublicClientApplication({ auth: { clientId, authority }, cache: { cachePlugin: new PersistenceCachePlugin(persistence) } });
      })().catch((e) => {
        appPromise = undefined;
        throw e;
      });
    }
    return appPromise;
  }

  // MSAL cache access is serialized so concurrent environments never race on the cache file lock.
  let chain = Promise.resolve();
  const serialized = (fn) => {
    const p = chain.then(fn, fn);
    chain = p.catch(() => {});
    return p;
  };

  const tokens = new Map();
  const MARGIN_MS = 10 * 60 * 1000;
  const cached = (origin) => {
    const t = tokens.get(origin);
    return t && t.expiresOn - Date.now() > MARGIN_MS ? t.token : undefined;
  };

  function checkIdentity(result) {
    if (!result || !result.accessToken) throw new Error("Authentication did not return an access token.");
    if (String(result.account?.username || "").toLowerCase() !== account || String(result.tenantId).toLowerCase() !== tenant) {
      throw new Error(`Signed-in identity (${result.account?.username}, tenant ${result.tenantId}) is not ${account} in ${tenant}.`);
    }
  }

  const getToken = (origin) => tokenFor(origin, `${origin}/user_impersonation`);
  // Power Platform admin API (environment list, usedBy/createdBy); same cached sign-in, no az CLI needed.
  const adminToken = () => tokenFor("admin-api", `${ADMIN_API}//.default`);

  async function tokenFor(slot, scope) {
    const hit = cached(slot);
    if (hit) return hit;
    return serialized(async () => {
      const again = cached(slot);
      if (again) return again;
      const app = await getApp();
      let accounts = (await app.getTokenCache().getAllAccounts()).filter((a) => String(a.username || "").toLowerCase() === account);
      if (accounts.length > 1) accounts = accounts.filter((a) => String(a.tenantId).toLowerCase() === tenant);
      if (accounts.length !== 1) throw new Error(`Expected one cached account for ${account}; found ${accounts.length}. Run auth.cjs --bootstrap.`);
      let result;
      try {
        result = await app.acquireTokenSilent({ scopes: [scope], account: accounts[0] });
      } catch (e) {
        if (e instanceof InteractionRequiredAuthError) throw new Error(`Interactive sign-in required (${e.errorCode}). Run auth.cjs --bootstrap in an attended session.`);
        throw e;
      }
      checkIdentity(result);
      tokens.set(slot, { token: result.accessToken, expiresOn: result.expiresOn ? result.expiresOn.getTime() : Date.now() + 30 * 60000 });
      return result.accessToken;
    });
  }

  // Attended, one-time: opens the default browser for the administrator, then batch runs stay silent.
  async function bootstrap() {
    const app = await getApp({ create: true });
    const result = await app.acquireTokenInteractive({
      scopes: [`${anchor}/user_impersonation`],
      loginHint: account,
      prompt: "select_account",
      openBrowser,
      successTemplate: "Signed in. You can close this tab and return to the terminal.",
      errorTemplate: "Sign-in failed: {error}. Return to the terminal.",
    });
    checkIdentity(result);
    tokens.set(anchor, { token: result.accessToken, expiresOn: result.expiresOn ? result.expiresOn.getTime() : Date.now() + 30 * 60000 });
    return { account: result.account.username, tenantId: result.tenantId, cachePath };
  }

  // Retries: 429/503 (request rejected, honours Retry-After) for any method; network errors, 502/504 and a single
  // fresh-token 401 only for reads. Writes are never replayed after an ambiguous failure.
  async function request(origin, method, target, { body, headers = {}, timeoutMs = 120000, retries = 5 } = {}) {
    const url = buildUrl(origin, target);
    const isRead = method === "GET";
    let refreshed = false;
    for (let attempt = 0; ; attempt++) {
      const token = await getToken(origin);
      const init = {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { Authorization: "Bearer " + token, Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0", ...headers },
      };
      if (body !== undefined) {
        init.body = typeof body === "string" ? body : JSON.stringify(body);
        init.headers["Content-Type"] = "application/json; charset=utf-8";
      }
      let res;
      let text;
      try {
        res = await fetch(url, init);
        text = await res.text();
      } catch (e) {
        if (isRead && attempt < retries) {
          await sleep(3000 * (attempt + 1));
          continue;
        }
        const err = new Error(`${method} ${url.pathname}: ${e.name === "TimeoutError" ? "request timed out" : e.message}`);
        err.network = true;
        throw err;
      }
      const retryable = res.status === 429 || res.status === 503 || (isRead && (res.status === 502 || res.status === 504));
      if (retryable && attempt < retries) {
        const ra = Number(res.headers.get("retry-after"));
        await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra, 300) * 1000 : 5000 * (attempt + 1));
        continue;
      }
      if (res.status === 401 && isRead && !refreshed) {
        refreshed = true;
        tokens.delete(origin);
        continue;
      }
      let json;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch {
        json = undefined;
      }
      if (!res.ok) {
        const err = json && json.error;
        const reqId = res.headers.get("x-ms-service-request-id") || res.headers.get("req_id") || res.headers.get("x-ms-correlation-request-id") || "";
        const e = new Error(`HTTP ${res.status} ${(err && err.code) || ""} ${String((err && err.message) || text || "").slice(0, 600)} [request-id: ${reqId}]`);
        e.status = res.status;
        e.code = err && err.code;
        throw e;
      }
      return { status: res.status, headers: res.headers, json, text };
    }
  }

  async function list(origin, target, opts) {
    const out = [];
    let next = target;
    while (next) {
      const { json } = await request(origin, "GET", next, opts);
      out.push(...((json && json.value) || []));
      next = json && json["@odata.nextLink"];
    }
    return out;
  }

  function client(rawOrigin) {
    const origin = normalizeOrigin(rawOrigin);
    return {
      origin,
      dv: (method, target, opts) => request(origin, method, target, opts),
      list: (target, opts) => list(origin, target, opts),
    };
  }

  return { client, bootstrap, getToken, adminToken, cachePath, account, tenant, anchor };
}

module.exports = { createAuth, normalizeOrigin, buildUrl, cacheKey, API_PATH, ADMIN_API };
