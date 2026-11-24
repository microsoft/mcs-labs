"use strict";
const { sleep, retryDelay } = require("./core.cjs");

function createGraph(token, sharePointOrigin, { fetchImpl = fetch, pause = sleep, intervalMs = 500 } = {}) {
  let lastRequest = 0;
  return async function graph(target, { method = "GET", body, headers = {}, allowed = [200], bytes = false } = {}) {
    if (!target.startsWith("/") || target.startsWith("//")) throw new Error("Expected a relative Graph API path.");
    for (let attempt = 0; attempt < 5; attempt++) {
      await pause(Math.max(0, intervalMs - (Date.now() - lastRequest)));
      lastRequest = Date.now();
      const accessToken = await token();
      let response;
      try {
        response = await fetchImpl(`https://graph.microsoft.com/v1.0${target}`, {
          method, body,
          headers: { Authorization: `Bearer ${accessToken}`, ...headers },
          redirect: "manual", signal: AbortSignal.timeout(120000),
        });
      } catch (error) {
        if (method === "GET" && attempt < 4 && ["TimeoutError", "TypeError"].includes(error.name)) {
          await pause(retryDelay(null, attempt)); continue;
        }
        throw new Error(`${method} request outcome unknown (${error.name}); re-read before retrying a write.`);
      }
      if (method === "GET" && [429, 500, 502, 503, 504].includes(response.status) && attempt < 4) {
        const delay = retryDelay(response.headers.get("retry-after"), attempt);
        await response.body?.cancel();
        await pause(delay); continue;
      }
      if (bytes && [301, 302, 303, 307, 308].includes(response.status)) {
        const location = new URL(response.headers.get("location"));
        await response.body?.cancel();
        if (location.origin !== sharePointOrigin || location.username || location.password) {
          throw new Error("Unexpected download redirect origin.");
        }
        // The download URL is pre-authenticated. Never forward the Graph bearer token.
        response = await fetchImpl(location, { redirect: "error", signal: AbortSignal.timeout(120000) });
      }
      if (!allowed.includes(response.status)) {
        const id = response.headers.get("request-id") || response.headers.get("sprequestguid") || "unavailable";
        const status = response.status;
        await response.body?.cancel();
        const error = new Error(`Graph ${method} HTTP ${status}; request-id ${id}`);
        error.status = status;
        throw error;
      }
      if (bytes) return { status: response.status, bytes: Buffer.from(await response.arrayBuffer()) };
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : null };
    }
    throw new Error("Graph retry limit reached.");
  };
}
module.exports = { createGraph };
