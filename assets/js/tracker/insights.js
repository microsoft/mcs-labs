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
  renderHeatmap(data);
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
  const pts = (key) => series.map((d, i) => `${(i / (series.length - 1)) * 200},${80 - (d[key] / max) * 70}`).join(' ');
  document.querySelector('[data-tracker-trend]').innerHTML = `
    <div class="tracker-chart">
      <h3>Opened vs closed (${rangeDays}d)</h3>
      <svg width="100%" viewBox="0 0 200 90" preserveAspectRatio="none" style="height:120px;">
        <polyline fill="none" stroke="#1d76db" stroke-width="1.5" points="${pts('opened')}"/>
        <polyline fill="none" stroke="#0e8a16" stroke-width="1.5" stroke-dasharray="3,2" points="${pts('closed')}"/>
      </svg>
      <p style="font-size:0.7em;color:var(--color-fg-muted);margin:0.2em 0 0;text-align:center;">
        <span style="color:#1d76db">━ Opened</span> &nbsp; <span style="color:#0e8a16">- - Closed</span>
      </p>
    </div>`;
}

function renderHeatmap(data) {
  const open = data.issues.filter(i => i.status !== 'done');
  const ageBucket = (d) => d <= 7 ? 1 : d <= 14 ? 2 : d <= 30 ? 3 : d <= 60 ? 4 : 5;
  const rows = Object.keys(CAT_LABELS).map(k => {
    const items = open.filter(i => i.category === k).sort((a, b) => b.ageDays - a.ageDays);
    return `
      <div class="tracker-heatmap-row">
        <div class="tracker-heatmap-label">${CAT_LABELS[k]}</div>
        <div class="tracker-heatmap-cells">
          ${items.map(i => `<a href="${i.url}" target="_blank" rel="noopener" class="tracker-heatmap-cell age-${ageBucket(i.ageDays)}" data-title="#${i.number} ${escapeHtml(i.title)} — ${i.ageDays}d"></a>`).join('')}
        </div>
      </div>`;
  }).join('');
  document.querySelector('[data-tracker-heatmap]').innerHTML = `
    <div class="tracker-heatmap">
      <h3 style="font-size:0.8em;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-fg-muted);margin:0 0 0.6em;border:none;padding:0;">Aging — days waiting (darker = older)</h3>
      ${rows}
    </div>`;
  wireTooltips();
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function wireTooltips() {
  let tip = null;
  document.querySelectorAll('[data-title]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tip = document.createElement('div');
      tip.className = 'tracker-heatmap-tooltip';
      tip.textContent = el.getAttribute('data-title');
      document.body.appendChild(tip);
      const r = el.getBoundingClientRect();
      tip.style.left = `${r.left + window.scrollX}px`;
      tip.style.top = `${r.bottom + window.scrollY + 4}px`;
    });
    el.addEventListener('mouseleave', () => { tip?.remove(); tip = null; });
  });
}
