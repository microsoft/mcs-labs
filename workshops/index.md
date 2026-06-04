---
layout: single
title: "Workshops"
author_profile: false
description: "Browse on-demand workshops — informal, customizable learning experiences built from modules and labs"
toc: false
classes: wide
---

<style>
.ws-index-stats {
  display: flex;
  gap: 2em;
  margin: 0 0 1.5em;
  padding: 0;
  list-style: none;
}
.ws-index-stats li {
  font-size: 0.88em;
  color: var(--color-fg-muted);
}
.ws-index-stats strong {
  font-size: 1.5em;
  display: block;
  color: var(--color-fg-strong);
  font-weight: 700;
  line-height: 1.2;
}

.ws-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 0.75em;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ws-card {
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1.2em 1.4em;
  background: var(--color-bg);
  color: var(--color-fg-strong);
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
}
.ws-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ws-card-title {
  font-size: 1em;
  font-weight: 600;
  color: var(--color-fg-strong);
  margin: 0 0 0.4em;
  line-height: 1.35;
}
.ws-card-title a {
  color: inherit;
  text-decoration: none;
}
.ws-card-title a:hover {
  color: var(--color-accent);
}

.ws-card-desc {
  font-size: 0.82em;
  color: var(--color-fg-muted);
  line-height: 1.55;
  margin: 0 0 0.8em;
  flex: 1;
}

.ws-empty {
  text-align: center;
  padding: 3em 1em;
  color: var(--color-fg-muted);
}

.ws-idx-pill {
  font-size: 0.7em;
  font-weight: 600;
  padding: 0.2em 0.6em;
  border-radius: 3px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.ws-idx-pill-labs {
  background: var(--color-pill-blue-bg);
  color: var(--color-pill-blue-fg);
}
.ws-idx-pill-duration {
  background: var(--color-bg-elevated);
  color: var(--color-fg-muted);
}

.ws-card-meta {
  display: flex;
  gap: 0.6em;
  align-items: center;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}
.ws-empty h3 {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--color-fg-strong);
  margin: 0 0 0.5em;
}
.ws-empty p {
  font-size: 0.88em;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.55;
}
.ws-card-accent {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  margin-bottom: 0.8em;
}
.ws-section-heading {
  font-size: 1.1em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-fg-muted);
  margin: 2rem 0 0.5rem;
}
.ws-section-desc {
  font-size: 0.88em;
  color: var(--color-fg-muted);
  margin: 0 0 1rem;
  line-height: 1.55;
}
.accent-blue { background: var(--color-journey-blue); }
.accent-green { background: var(--color-journey-green); }
.accent-purple { background: var(--color-journey-purple); }
.accent-orange { background: var(--color-journey-orange); }
</style>

{% assign all_workshops = site.workshops | sort: "order" %}
{% assign accent_colors = "accent-blue,accent-green,accent-purple,accent-orange" | split: "," %}
{% assign internal_workshops = all_workshops | where_exp: "ws", "ws.external != true" %}
{% assign external_workshops = all_workshops | where: "external", true %}

{% if all_workshops.size > 0 %}

{% if internal_workshops.size > 0 %}
<h2 class="ws-section-heading">Workshops</h2>
<ul class="ws-grid">
{% for ws in internal_workshops %}
{% assign color_idx = forloop.index0 | modulo: 4 %}
<li class="ws-card">
<div class="ws-card-accent {{ accent_colors[color_idx] }}"></div>
<div class="ws-card-title"><a href="{{ ws.url | relative_url }}">{{ ws.title }}</a></div>
<div class="ws-card-desc">{{ ws.description | strip_html | truncate: 160 }}</div>
<div class="ws-card-meta">
<span class="ws-idx-pill ws-idx-pill-labs">{{ ws.labs.size }} labs</span>
</div>
</li>
{% endfor %}
</ul>
{% endif %}

{% if external_workshops.size > 0 %}
<h2 class="ws-section-heading">External Workshops</h2>
<p class="ws-section-desc">These workshops are hosted externally and maintained by other teams. Click through to access their content.</p>
<ul class="ws-grid">
{% for ws in external_workshops %}
{% assign color_idx = forloop.index0 | modulo: 4 %}
<li class="ws-card">
<div class="ws-card-accent {{ accent_colors[color_idx] }}"></div>
<div class="ws-card-title"><a href="{{ ws.external_url }}" target="_blank" rel="noopener">{{ ws.title }} ↗</a></div>
<div class="ws-card-desc">{{ ws.description | strip_html | truncate: 160 }}</div>
<div class="ws-card-meta">
<span class="ws-idx-pill ws-idx-pill-labs">External</span>
</div>
</li>
{% endfor %}
</ul>
{% endif %}

{% else %}
<div class="ws-empty">
  <h3>No workshops available yet</h3>
  <p>Workshops are informal, on-demand learning experiences built from modules and labs. Check back soon or browse our <a href="{{ '/events/' | relative_url }}">curated events</a> for structured learning paths.</p>
</div>
{% endif %}
