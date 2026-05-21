---
---
import { load, get, isStale, snapshotAgeMs } from './data.js';
import { render as renderInsights } from './insights.js';
import { render as renderBoard } from './board.js';

window.TRACKER_CONFIG = window.TRACKER_CONFIG || {
  repo: { owner: '{{ site.data.tracker.repo.owner }}', name: '{{ site.data.tracker.repo.name }}' },
  snapshot: { staleThresholdMs: {{ site.data.tracker.snapshot.staleThresholdMs }} },
};

let _rangeDays = +(localStorage.getItem('tracker.range') || 30);

async function init() {
  try { await load(); }
  catch (e) {
    document.querySelector('[data-tracker]').innerHTML = `<p style="padding:2em;text-align:center;color:var(--color-fg-muted);">Issue tracker data not available yet — check back shortly.</p>`;
    return;
  }

  document.querySelector('[data-tracker-range]').value = _rangeDays;
  document.querySelector('[data-tracker-range]').addEventListener('change', e => {
    _rangeDays = +e.target.value;
    localStorage.setItem('tracker.range', _rangeDays);
    rerender();
  });

  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab'))));

  rerender();
}

function rerender() {
  const data = get(); if (!data) return;
  updateTimestamp();
  renderInsights(data, { rangeDays: _rangeDays });
  renderBoard(data, { rangeDays: _rangeDays });
}

function updateTimestamp() {
  const el = document.querySelector('[data-tracker-updated]');
  const min = Math.round(snapshotAgeMs() / 60000);
  el.textContent = isStale() ? `⚠ Snapshot ${min} min old` : `Updated ${min} min ago`;
}

function switchTab(name) {
  document.querySelectorAll('[data-tab]').forEach(b => {
    const on = b.getAttribute('data-tab') === name;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('[data-tabpanel]').forEach(p => {
    p.classList.toggle('is-hidden', p.getAttribute('data-tabpanel') !== name);
  });
}

init();
