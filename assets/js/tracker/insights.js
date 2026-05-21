const CAT_COLORS = {
  bug: '#d73a4a', newLab: '#0e8a16', contentUpdate: '#8957e5',
  portalEnhancement: '#1d76db', bootcampFeature: '#d4a72c',
};
const CAT_LABELS = {
  bug: 'Bugs', newLab: 'New Labs', contentUpdate: 'Content',
  portalEnhancement: 'Portal Enh', bootcampFeature: 'Bootcamp',
};

export function render(data, { rangeDays }) {
  renderKpis(data, rangeDays);
  renderDonut(data);
  renderTrend(data, rangeDays);
  renderAgingByCategory(data);
  renderOldestIssues(data);
}

function renderKpis(data, rangeDays) {
  const closedInRange = data.issues.filter(i => i.closedAt && (Date.now() - new Date(i.closedAt).getTime()) / 86400000 <= rangeDays).length;
  const tiles = [
    { label: 'Open', value: data.stats.open, delta: data.stats.deltas.open },
    { label: `Closed ${rangeDays}d`, value: closedInRange, delta: data.stats.deltas.closed30d },
    { label: 'Avg age', value: data.stats.avgAgeDays + 'd', delta: data.stats.deltas.avgAgeDays, deltaUnit: 'd' },
    { label: '% triage', value: Math.round(data.stats.pctTriage * 100) + '%', delta: Math.round(data.stats.deltas.pctTriage * 100), deltaUnit: 'pt' },
  ];
  document.querySelector('[data-tracker-kpis]').innerHTML = `
    <div class="tracker-kpis">${tiles.map(t => `
      <div class="tracker-kpi">
        <strong>${t.value}</strong>
        <span>${t.label}</span>
        ${t.delta !== 0 ? `<div class="${t.delta > 0 ? 'delta-up' : 'delta-down'}">${t.delta > 0 ? '▲' : '▼'} ${Math.abs(t.delta)}${t.deltaUnit || ''}</div>` : ''}
      </div>`).join('')}</div>`;
}

function renderDonut(data) {
  const cats = Object.entries(data.categories);
  const total = cats.reduce((s, [, c]) => s + c.open, 0) || 1;
  let acc = 0;
  const stops = cats.map(([k, c]) => {
    const from = (acc / total) * 100;
    acc += c.open;
    const to = (acc / total) * 100;
    return `${CAT_COLORS[k]} ${from}% ${to}%`;
  });
  document.querySelector('[data-tracker-donut]').innerHTML = `
    <div class="tracker-chart">
      <h3>Open issues by category</h3>
      <div style="position:relative;width:140px;height:140px;margin:0 auto;">
        <div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(${stops.join(',')});"></div>
        <div style="position:absolute;inset:28px;background:var(--color-bg-elevated);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <strong style="font-size:1.4em;font-weight:700">${total}</strong>
          <span style="font-size:0.7em;color:var(--color-fg-muted)">open</span>
        </div>
      </div>
      <ul style="list-style:none;padding:0;margin:0.8em 0 0;font-size:0.75em;display:grid;grid-template-columns:1fr 1fr;gap:0.2em 0.6em;">
        ${cats.map(([k, c]) => `<li><span style="display:inline-block;width:8px;height:8px;background:${CAT_COLORS[k]};border-radius:2px;margin-right:0.4em;"></span>${CAT_LABELS[k]} <strong>${c.open}</strong></li>`).join('')}
      </ul>
    </div>`;
}

function renderTrend(data, rangeDays) {
  const series = data.trend90d.slice(-rangeDays);
  const max = Math.max(1, ...series.map(d => Math.max(d.opened, d.closed)));
  // chart canvas: 480x180, with margins for axes
  const W = 480, H = 180, ML = 32, MR = 8, MT = 12, MB = 28;
  const plotW = W - ML - MR, plotH = H - MT - MB;
  const x = i => ML + (series.length > 1 ? (i / (series.length - 1)) * plotW : plotW / 2);
  const y = v => MT + plotH - (v / max) * plotH;
  const pts = (key) => series.map((d, i) => `${x(i)},${y(d[key])}`).join(' ');

  // y-axis ticks: 0, max/2, max (rounded)
  const yTicks = [0, Math.ceil(max / 2), max];
  // x-axis labels: first, middle, last day
  const fmtDate = d => d.slice(5).replace('-', '/'); // "MM/DD"
  const xLabels = series.length >= 3
    ? [[0, series[0].date], [Math.floor(series.length / 2), series[Math.floor(series.length / 2)].date], [series.length - 1, series[series.length - 1].date]]
    : series.map((d, i) => [i, d.date]);

  document.querySelector('[data-tracker-trend]').innerHTML = `
    <div class="tracker-chart">
      <h3>Opened vs closed (${rangeDays}d)</h3>
      <svg viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block;font-family:inherit;">
        ${yTicks.map(t => `
          <line x1="${ML}" y1="${y(t)}" x2="${W - MR}" y2="${y(t)}" stroke="var(--color-border-subtle)" stroke-width="0.5" stroke-dasharray="${t === 0 ? '0' : '2,2'}"/>
          <text x="${ML - 6}" y="${y(t) + 3}" text-anchor="end" font-size="10" fill="var(--color-fg-muted)">${t}</text>
        `).join('')}
        ${xLabels.map(([i, date]) => `
          <text x="${x(i)}" y="${H - MB + 14}" text-anchor="middle" font-size="10" fill="var(--color-fg-muted)">${fmtDate(date)}</text>
        `).join('')}
        <line x1="${ML}" y1="${MT}" x2="${ML}" y2="${H - MB}" stroke="var(--color-border-subtle)" stroke-width="0.5"/>
        <polyline fill="none" stroke="#1d76db" stroke-width="1.5" points="${pts('opened')}"/>
        <polyline fill="none" stroke="#0e8a16" stroke-width="1.5" stroke-dasharray="3,2" points="${pts('closed')}"/>
      </svg>
      <p style="font-size:0.7em;color:var(--color-fg-muted);margin:0.4em 0 0;text-align:center;">
        <span style="color:#1d76db">━ Opened</span> &nbsp; <span style="color:#0e8a16">- - Closed</span>
      </p>
    </div>`;
}

const AGE_BUCKETS = [
  { key: 1, label: '≤7d', max: 7 },
  { key: 2, label: '8–14d', max: 14 },
  { key: 3, label: '15–30d', max: 30 },
  { key: 4, label: '31–60d', max: 60 },
  { key: 5, label: '>60d', max: Infinity },
];
const bucketIndex = (days) => AGE_BUCKETS.findIndex(b => days <= b.max);

function renderAgingByCategory(data) {
  const open = data.issues.filter(i => i.status !== 'done');
  const rows = Object.keys(CAT_LABELS).map(cat => {
    const items = open.filter(i => i.category === cat).sort((a, b) => b.ageDays - a.ageDays);
    const counts = [0, 0, 0, 0, 0];
    items.forEach(i => { counts[bucketIndex(i.ageDays)]++; });
    return { cat, label: CAT_LABELS[cat], items, counts, oldest: items[0] };
  });

  const body = rows.map(r => {
    if (r.items.length === 0) {
      return `
        <div class="tracker-aging-row">
          <div class="tracker-aging-head">
            <span class="tracker-aging-cat">${r.label}</span>
            <span class="tracker-aging-empty">no open issues</span>
          </div>
        </div>`;
    }
    const segments = r.counts.map((n, i) => n > 0 ? `<div class="tracker-aging-b age-${i + 1}" style="flex:${n}" title="${AGE_BUCKETS[i].label}: ${n}">${n}</div>` : '').join('');
    return `
      <div class="tracker-aging-row">
        <div class="tracker-aging-head">
          <span class="tracker-aging-cat">${r.label}</span>
          <span class="tracker-aging-summary">${r.items.length} open · oldest ${r.oldest.ageDays}d</span>
        </div>
        <div class="tracker-aging-buckets">${segments}</div>
        <div class="tracker-aging-oldest">Oldest: <a href="${r.oldest.url}" target="_blank" rel="noopener">#${r.oldest.number} ${escapeHtml(r.oldest.title)}</a></div>
      </div>`;
  }).join('');

  const legend = AGE_BUCKETS.map(b => `<span><i class="age-${b.key}"></i>${b.label}</span>`).join('');

  document.querySelector('[data-tracker-aging]').innerHTML = `
    <div class="tracker-aging">
      <h3>Aging by category</h3>
      ${body}
      <div class="tracker-aging-legend">${legend}</div>
    </div>`;
}

function renderOldestIssues(data) {
  const open = data.issues
    .filter(i => i.status !== 'done')
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 15);

  const body = open.length === 0
    ? `<div class="tracker-oldest-empty">No open issues — all clear.</div>`
    : open.map(i => `
        <a class="tracker-oldest-row" href="${i.url}" target="_blank" rel="noopener">
          <span class="tracker-oldest-num">#${i.number}</span>
          <span class="tracker-oldest-cat cat-${i.category}">${CAT_LABELS[i.category]}</span>
          <span class="tracker-oldest-title">${escapeHtml(i.title)}</span>
          <span class="tracker-oldest-age ${i.ageDays > 60 ? 'old' : ''}">${i.ageDays}d</span>
        </a>`).join('');

  document.querySelector('[data-tracker-oldest]').innerHTML = `
    <div class="tracker-oldest">
      <h3>Oldest open issues (top 15)</h3>
      ${body}
    </div>`;
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
