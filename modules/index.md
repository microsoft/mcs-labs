---
layout: single
title: "Modules"
author_profile: false
description: "Browse all Microsoft Copilot Studio training modules — presentations, concepts, and hands-on labs"
toc: false
classes: wide
---

<style>
.mod-index-stats {
  display: flex;
  gap: 2em;
  margin: 0 0 1.5em;
  padding: 0;
  list-style: none;
}
.mod-index-stats li {
  font-size: 0.88em;
  color: var(--color-fg-muted);
}
.mod-index-stats strong {
  font-size: 1.5em;
  display: block;
  color: var(--color-fg-strong);
  font-weight: 700;
  line-height: 1.2;
}

.mod-section-heading {
  font-size: 1.15em;
  font-weight: 700;
  color: var(--color-fg-strong);
  margin: 2em 0 0.6em;
  padding-bottom: 0.4em;
  border-bottom: 2px solid var(--color-border);
}
.mod-section-desc {
  font-size: 0.82em;
  color: var(--color-fg-muted);
  margin: -0.3em 0 1em;
}

.mod-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 0.75em;
  margin: 0 0 2em;
  padding: 0;
  list-style: none;
}

.mod-card {
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1.2em 1.4em;
  background: var(--color-bg);
  color: var(--color-fg-strong);
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
}
.mod-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.mod-card-title {
  font-size: 1em;
  font-weight: 600;
  color: var(--color-fg-strong);
  margin: 0 0 0.4em;
  line-height: 1.35;
}
.mod-card-title a {
  color: inherit;
  text-decoration: none;
}
.mod-card-title a:hover {
  color: var(--color-accent);
}

.mod-card-desc {
  font-size: 0.82em;
  color: var(--color-fg-muted);
  line-height: 1.55;
  margin: 0 0 0.8em;
  flex: 1;
}

.mod-card-meta {
  display: flex;
  gap: 0.6em;
  align-items: center;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.mod-idx-pill {
  font-size: 0.7em;
  font-weight: 600;
  padding: 0.2em 0.6em;
  border-radius: 3px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.mod-idx-pill-lab {
  background: var(--color-pill-blue-bg);
  color: var(--color-pill-blue-fg);
}
.mod-idx-pill-slides {
  background: var(--color-pill-green-bg);
  color: var(--color-pill-green-fg);
}
.mod-idx-pill-duration {
  background: var(--color-bg-elevated);
  color: var(--color-fg-muted);
}
.mod-idx-pill-level {
  background: var(--color-pill-purple-bg);
  color: var(--color-pill-purple-fg);
}
</style>

{% assign all_modules = site.modules | sort: "order" %}
{% assign modules_with_labs = all_modules | where_exp: "m", "m.lab" | size %}

<ul class="mod-index-stats">
  <li><strong>{{ all_modules.size }}</strong> modules</li>
  <li><strong>{{ modules_with_labs }}</strong> with labs</li>
</ul>

{% assign section_order = "core_modules,intermediate_modules,advanced_modules,specialized_modules,external_modules,optional_modules" | split: "," %}

{% for sec in section_order %}
{% assign sec_modules = all_modules | where: "section", sec %}
{% if sec_modules.size > 0 %}
{% assign sec_key = sec | remove: "_modules" %}
{% assign sec_data = site.data.lab-config.module_sections[sec_key] %}

<h2 class="mod-section-heading">{{ sec_data.icon }} {{ sec_data.title | default: sec }}</h2>
{% if sec_data.description %}
<p class="mod-section-desc">{{ sec_data.description }}</p>
{% endif %}

<ul class="mod-grid">
{% for mod in sec_modules %}
<li class="mod-card">
<div class="mod-card-title"><a href="{{ mod.url | relative_url }}">{{ mod.title }}</a></div>
<div class="mod-card-desc">{{ mod.description | strip_html | truncate: 160 }}</div>
<div class="mod-card-meta">
{% if mod.lab %}<span class="mod-idx-pill mod-idx-pill-lab">🔬 Has Lab</span>{% endif %}
{% if mod.slides %}<span class="mod-idx-pill mod-idx-pill-slides">📊 Slides</span>{% endif %}
<span class="mod-idx-pill mod-idx-pill-duration">{{ mod.duration }} min</span>
</div>
</li>
{% endfor %}
</ul>
{% endif %}
{% endfor %}
