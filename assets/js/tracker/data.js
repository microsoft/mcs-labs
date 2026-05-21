const CONFIG = window.PORTAL_CONFIG || window.TRACKER_CONFIG || {};

let _data = null;

export async function load() {
  const prevGeneratedAt = _data?.generatedAt;
  const res = await fetch('/mcs-labs/assets/data/issues.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`snapshot load failed: ${res.status}`);
  _data = await res.json();
  return { data: _data, changed: prevGeneratedAt !== undefined && prevGeneratedAt !== _data.generatedAt };
}

export function get() { return _data; }

export function snapshotAgeMs() {
  if (!_data?.generatedAt) return Infinity;
  return Date.now() - new Date(_data.generatedAt).getTime();
}

export function isStale() {
  const threshold = CONFIG.snapshot?.staleThresholdMs ?? 1800000;
  return snapshotAgeMs() > threshold;
}
