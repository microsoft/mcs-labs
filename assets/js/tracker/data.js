// Tracker data module — fetches live from the GitHub Issues REST API on initial load
// and on manual refresh. Falls back to the committed seed snapshot when the API call
// fails (rate limit, network, 5xx) so the page still renders something useful.
//
// Why no workflow-driven snapshot: microsoft/mcs-labs is governed by org policies that
// block both direct pushes to main (branch protection) and GitHub Actions creating PRs.
// Live API fetch sidesteps the whole publication problem.

const CONFIG = window.TRACKER_CONFIG || {};
const REPO = CONFIG.repo || { owner: 'microsoft', name: 'mcs-labs' };
const SEED_URL = '/mcs-labs/assets/data/issues.json';

let _data = null;

const LABEL_TO_CATEGORY = [
  ['type: bug', 'bug'],
  ['type: new-lab', 'newLab'],
  ['type: new-module', 'newModule'],
  ['type: lab-update', 'contentUpdate'],
  ['type: portal-enhancement', 'portalEnhancement'],
  ['type: bootcamp-feature', 'bootcampFeature'],
  ['type: documentation', 'documentation'],
  ['type: infrastructure', 'infrastructure'],
  ['type: feature', 'feature'],
];

const STATUS_LABELS = {
  'status: triage': 'triage',
  'status: backlog': 'backlog',
  'status: in-progress': 'inProgress',
};

function categorize(labels) {
  for (const [name, category] of LABEL_TO_CATEGORY) {
    if (labels.includes(name)) return category;
  }
  return null;
}

function deriveStatus(issue, windowDays = 90) {
  if (issue.state === 'closed') {
    if (!issue.closedAt) return 'open';
    const ageMs = Date.now() - new Date(issue.closedAt).getTime();
    if (ageMs / 86400000 <= windowDays) return 'done';
    return null;
  }
  for (const [label, status] of Object.entries(STATUS_LABELS)) {
    if (issue.labels.includes(label)) return status;
  }
  return 'triage';
}

function shape(rawIssues) {
  const now = Date.now();
  const cats = ['bug', 'newLab', 'newModule', 'contentUpdate', 'portalEnhancement', 'bootcampFeature', 'documentation', 'infrastructure', 'feature'];
  const categories = Object.fromEntries(cats.map(c => [c, { open: 0, triage: 0, backlog: 0, inProgress: 0, done30d: 0 }]));

  const issues = [];
  for (const raw of rawIssues) {
    const labels = (raw.labels || []).map(l => typeof l === 'string' ? l : l.name);
    const category = categorize(labels);
    if (!category) continue;
    const status = deriveStatus({ state: raw.state, closedAt: raw.closedAt, labels }, 90);
    if (!status) continue;
    const created = new Date(raw.createdAt).getTime();
    const issue = {
      number: raw.number,
      title: raw.title,
      url: raw.url,
      category,
      status,
      ageDays: Math.floor((now - created) / 86400000),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      closedAt: raw.closedAt || null,
    };
    issues.push(issue);
    if (status === 'done') {
      const closedMs = now - new Date(raw.closedAt).getTime();
      if (closedMs / 86400000 <= 30) categories[category].done30d++;
    } else {
      categories[category].open++;
      categories[category][status]++;
    }
  }

  const open = issues.filter(i => i.status !== 'done');
  const stats = {
    open: open.length,
    closed30d: issues.filter(i => i.status === 'done' && (now - new Date(i.closedAt).getTime()) / 86400000 <= 30).length,
    avgAgeDays: open.length ? Math.round(open.reduce((s, i) => s + i.ageDays, 0) / open.length) : 0,
    pctTriage: open.length ? open.filter(i => i.status === 'triage').length / open.length : 0,
    deltas: { open: 0, closed30d: 0, avgAgeDays: 0, pctTriage: 0 },
  };

  const trend90d = [];
  for (let i = 89; i >= 0; i--) {
    const day = new Date(now - i * 86400000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    trend90d.push({
      date: day.toISOString().slice(0, 10),
      opened: issues.filter(x => { const t = new Date(x.createdAt).getTime(); return t >= dayStart && t < dayEnd; }).length,
      closed: issues.filter(x => x.closedAt && (() => { const t = new Date(x.closedAt).getTime(); return t >= dayStart && t < dayEnd; })()).length,
    });
  }

  return { stats, categories, trend90d, issues, recentActivity: [] };
}

// Fetch all open + recently-closed issues from the public REST API. Paginates if needed
// (mcs-labs typically fits in one page of 100). Filters out PRs (REST mixes them in).
async function fetchFromApi() {
  const issues = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/issues?state=all&per_page=100&page=${page}&sort=updated&direction=desc`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) {
      const rateLimited = res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0';
      throw Object.assign(new Error(`GitHub API ${res.status}`), { rateLimited, status: res.status });
    }
    const batch = await res.json();
    for (const item of batch) {
      if (item.pull_request) continue; // REST mixes PRs into the issues list
      const updatedDaysAgo = (Date.now() - new Date(item.updated_at).getTime()) / 86400000;
      if (item.state === 'closed' && updatedDaysAgo > 180) {
        // Stop pulling further pages — closed items beyond this point can't affect any view.
        return issues;
      }
      issues.push({
        number: item.number,
        title: item.title,
        url: item.html_url,
        state: item.state,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        closedAt: item.closed_at,
        labels: (item.labels || []).map(l => l.name),
      });
    }
    if (batch.length < 100) break;
  }
  return issues;
}

async function loadFromSeed() {
  const res = await fetch(SEED_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`seed fetch failed: ${res.status}`);
  return await res.json();
}

export async function load() {
  const prevGeneratedAt = _data?.generatedAt;
  try {
    const raw = await fetchFromApi();
    _data = shape(raw);
    _data.generatedAt = new Date().toISOString();
    _data.source = 'live';
  } catch (e) {
    console.warn('Tracker: live API fetch failed, falling back to seed snapshot.', e);
    try {
      const seed = await loadFromSeed();
      _data = seed;
      _data.source = e.rateLimited ? 'seed-rate-limited' : 'seed-fallback';
    } catch (e2) {
      throw e2;
    }
  }
  return { data: _data, changed: prevGeneratedAt !== undefined && prevGeneratedAt !== _data.generatedAt, source: _data.source };
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

export function dataSource() {
  return _data?.source ?? 'unknown';
}

// Fetch issue templates from the GitHub API and populate the "+ New item" dropdown
export async function loadTemplates() {
  const el = document.querySelector('[data-tracker-templates]');
  if (!el) return;
  try {
    const url = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/contents/.github/ISSUE_TEMPLATE`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const files = await res.json();
    const templates = files
      .filter(f => f.name.endsWith('.yml') && f.name !== 'config.yml')
      .map(f => {
        const label = f.name.replace('.yml', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<li><a href="https://github.com/${REPO.owner}/${REPO.name}/issues/new?template=${f.name}" target="_blank" rel="noopener">${label}</a></li>`;
      });
    el.innerHTML = templates.join('');
  } catch (e) {
    // Fallback: link to the template chooser page
    console.warn('Tracker: failed to load issue templates', e);
    el.innerHTML = `<li><a href="https://github.com/${REPO.owner}/${REPO.name}/issues/new/choose" target="_blank" rel="noopener">Create issue…</a></li>`;
  }
}
