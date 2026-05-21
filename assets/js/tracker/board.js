const CAT_LABELS = {
  bug: 'Bugs', newLab: 'New Labs', contentUpdate: 'Content',
  portalEnhancement: 'Portal Enh', bootcampFeature: 'Bootcamp',
};
const CAT_TEMPLATE = {
  bug: 'bug_report.yml', newLab: 'new_lab.yml', contentUpdate: 'enhancement.yml',
  portalEnhancement: 'portal_enhancement.yml', bootcampFeature: 'bootcamp_feature.yml',
};
const COLUMNS = [['triage', 'Triage'], ['backlog', 'Backlog'], ['inProgress', 'In Progress'], ['done', 'Done']];

let _state = { activeCategory: 'all', rangeDays: 30 };

export function render(data, { rangeDays }) {
  _state.rangeDays = rangeDays;
  renderFilters(data);
  renderKanban(data);
}

function renderFilters(data) {
  const total = Object.values(data.categories).reduce((s, c) => s + c.open, 0);
  const chips = [['all', 'All', total], ...Object.entries(data.categories).map(([k, c]) => [k, CAT_LABELS[k], c.open])];
  const el = document.querySelector('[data-tracker-filters]');
  el.innerHTML = `
    ${chips.map(([k, label, n]) => `<button class="tracker-chip ${k === _state.activeCategory ? 'is-active' : ''}" data-cat="${k}">${label} · ${n}</button>`).join('')}
    <a class="tracker-chip tracker-newissue-smart" data-newissue-smart href="${smartUrl()}" target="_blank" rel="noopener">+ New issue</a>
  `;
  el.querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => {
    _state.activeCategory = btn.getAttribute('data-cat');
    renderFilters(data);
    renderKanban(data);
  }));
}

function smartUrl() {
  const base = 'https://github.com/microsoft/mcs-labs/issues/new';
  if (_state.activeCategory === 'all') return base + '/choose';
  return `${base}?template=${CAT_TEMPLATE[_state.activeCategory]}`;
}

function renderKanban(data) {
  const filtered = _state.activeCategory === 'all' ? data.issues : data.issues.filter(i => i.category === _state.activeCategory);
  const byStatus = Object.fromEntries(COLUMNS.map(([s]) => [s, []]));
  for (const i of filtered) if (byStatus[i.status]) byStatus[i.status].push(i);
  byStatus.done = byStatus.done.filter(i => i.closedAt && (Date.now() - new Date(i.closedAt).getTime()) / 86400000 <= _state.rangeDays);

  document.querySelector('[data-tracker-kanban]').innerHTML = COLUMNS.map(([s, label]) => `
    <div class="tracker-col">
      <div class="tracker-col-head"><span>${label}</span><span>${byStatus[s].length}</span></div>
      ${byStatus[s].slice(0, 30).map(i => `
        <a class="tracker-card cat-${i.category}" href="${i.url}" target="_blank" rel="noopener">
          #${i.number} ${escapeHtml(i.title)}
          <div class="tracker-card-meta">${i.ageDays}d</div>
        </a>`).join('')}
      ${byStatus[s].length > 30 ? `<div class="tracker-card-meta" style="text-align:center;">+ ${byStatus[s].length - 30} more</div>` : ''}
    </div>`).join('');
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
