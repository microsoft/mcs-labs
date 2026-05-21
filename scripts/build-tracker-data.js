const LABEL_TO_CATEGORY = [
  ['type: bug', 'bug'],
  ['type: new-lab', 'newLab'],
  ['type: lab-update', 'contentUpdate'],
  ['portal-enhancement', 'portalEnhancement'],
  ['type: bootcamp-feature', 'bootcampFeature'],
];

const STATUS_LABELS = {
  'status: triage': 'triage',
  'status: backlog': 'backlog',
  'status: in-progress': 'inProgress',
};

function categorize(labels) {
  for (const [labelName, category] of LABEL_TO_CATEGORY) {
    if (labels.includes(labelName)) return category;
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

function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

function shape(rawIssues, rawEvents) {
  const now = Date.now();
  const cats = ['bug', 'newLab', 'contentUpdate', 'portalEnhancement', 'bootcampFeature'];
  const categories = Object.fromEntries(cats.map(c => [c, { open: 0, triage: 0, backlog: 0, inProgress: 0, done30d: 0 }]));

  const issues = [];
  for (const raw of rawIssues) {
    const labels = (raw.labels || []).map(l => typeof l === 'string' ? l : l.name);
    const category = categorize(labels);
    if (!category) continue;
    const status = deriveStatus({ ...raw, labels }, 90);
    if (!status) continue;
    const created = new Date(raw.createdAt).getTime();
    const issue = {
      number: raw.number,
      title: raw.title,
      url: raw.url,
      category,
      status,
      ageDays: daysBetween(created, now),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      closedAt: raw.closedAt || null,
      assignees: (raw.assignees || []).map(a => typeof a === 'string' ? a : a.login),
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

  return {
    stats,
    categories,
    trend90d,
    issues,
    recentActivity: (rawEvents || []).slice(0, 20),
  };
}

module.exports = { categorize, deriveStatus, shape };

// CLI entry: node scripts/build-tracker-data.js [out-path]
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  (async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) { console.error('GITHUB_TOKEN required'); process.exit(1); }
    const outPath = process.argv[2] || 'assets/data/issues.json';

    const query = `
      query($cursor: String) {
        repository(owner: "microsoft", name: "mcs-labs") {
          issues(first: 100, after: $cursor, states: [OPEN, CLOSED], orderBy: {field: UPDATED_AT, direction: DESC}) {
            pageInfo { hasNextPage endCursor }
            nodes {
              number title url state createdAt updatedAt closedAt
              labels(first: 30) { nodes { name } }
              assignees(first: 10) { nodes { login } }
            }
          }
        }
      }`;
    const issues = [];
    let cursor = null;
    let pages = 0;
    while (pages < 20) {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mcs-labs-tracker-data' },
        body: JSON.stringify({ query, variables: { cursor } }),
      });
      const json = await res.json();
      if (json.errors) { console.error(json.errors); process.exit(1); }
      const conn = json.data.repository.issues;
      for (const n of conn.nodes) {
        const t = new Date(n.updatedAt).getTime();
        const age = (Date.now() - t) / 86400000;
        if (age > 180 && n.state === 'CLOSED') { cursor = null; break; }
        issues.push({
          number: n.number,
          title: n.title,
          url: n.url,
          state: n.state.toLowerCase(),
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          closedAt: n.closedAt,
          labels: n.labels.nodes.map(l => l.name),
          assignees: n.assignees.nodes.map(a => a.login),
        });
      }
      if (!conn.pageInfo.hasNextPage || !cursor && pages > 0) break;
      cursor = conn.pageInfo.endCursor;
      pages++;
    }

    const data = shape(issues, []);
    data.generatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`Wrote ${issues.length} issues → ${outPath}`);
  })();
}
