---
layout: single
title: "Backlog Tracker"
permalink: /tracker/
toc: false
classes: wide
author_profile: false
sitemap: false
header:
  overlay_image: false
---

<style>
.page__title { display: none; }
.page__meta { display: none; }
</style>

<main class="tracker" data-tracker>
  <header class="tracker-header">
    <div class="tracker-header-row">
      <h2 class="tracker-title">Backlog Tracker</h2>
      <button class="tracker-refresh" data-tracker-refresh title="Refresh snapshot now (auto-refresh runs every 15 min on the server)">
        <span class="tracker-updated" data-tracker-updated>Loading…</span>
        <svg class="tracker-refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <polyline points="3 4 3 10 9 10" />
        </svg>
      </button>
    </div>
    <p class="tracker-subtitle">Status of bootcamp work across the labs project.</p>
    <div class="tracker-controls">
      <nav class="tracker-tabs" role="tablist">
        <button class="tracker-tab is-active" data-tab="insights" role="tab" aria-selected="true">Insights</button>
        <button class="tracker-tab" data-tab="board" role="tab" aria-selected="false">Board</button>
      </nav>
      <label class="tracker-range">
        Range:
        <select data-tracker-range>
          <option value="7">7d</option>
          <option value="14">14d</option>
          <option value="30" selected>30d</option>
          <option value="60">60d</option>
          <option value="90">90d</option>
        </select>
      </label>
      <details class="tracker-newissue">
        <summary>+ New item</summary>
        <ul data-tracker-templates>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=bug_report.yml">Bug</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=new_lab.yml">New Lab</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=enhancement.yml">Content Update</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=portal_enhancement.yml">Portal Enhancement</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=bootcamp_feature.yml">Bootcamp Feature</a></li>
        </ul>
      </details>
    </div>
  </header>

  <section class="tracker-tabpanel" data-tabpanel="insights" role="tabpanel">
    <div data-tracker-kpis></div>
    <div class="tracker-charts">
      <div data-tracker-donut></div>
      <div data-tracker-trend></div>
    </div>
    <div data-tracker-aging></div>
    <div data-tracker-oldest></div>
  </section>

  <section class="tracker-tabpanel is-hidden" data-tabpanel="board" role="tabpanel">
    <div class="tracker-filters" data-tracker-filters></div>
    <div class="tracker-kanban" data-tracker-kanban></div>
  </section>
</main>

<link rel="stylesheet" href="{{ '/assets/css/tracker.css' | relative_url }}">
<script type="module" src="{{ '/assets/js/tracker/main.js' | relative_url }}"></script>
