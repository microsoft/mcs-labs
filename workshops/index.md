---
layout: single
title: "Workshops"
author_profile: false
description: "Browse all Microsoft Copilot Studio workshops — curated lab sequences for events and self-paced learning"
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
  color: #605e5c;
}
.ws-index-stats strong {
  font-size: 1.5em;
  display: block;
  color: #323130;
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
  border: 1px solid #e8e6e4;
  border-radius: 8px;
  padding: 1.2em 1.4em;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
}
.ws-card:hover {
  border-color: #c8c6c4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.ws-card-title {
  font-size: 1em;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.4em;
  line-height: 1.35;
}
.ws-card-title a {
  color: inherit;
  text-decoration: none;
}
.ws-card-title a:hover {
  color: #0078d4;
}

.ws-card-desc {
  font-size: 0.82em;
  color: #605e5c;
  line-height: 1.55;
  margin: 0 0 0.8em;
  flex: 1;
}

.ws-card-meta {
  display: flex;
  gap: 0.6em;
  align-items: center;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
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
  background: #deecf9;
  color: #004578;
}
.ws-idx-pill-duration {
  background: #f3f2f1;
  color: #605e5c;
}
.ws-idx-pill-levels {
  background: #e6f2e6;
  color: #0e700e;
}
</style>

{% assign all_workshops = site.workshops | sort: "order" %}

<ul class="ws-index-stats">
  <li><strong>{{ all_workshops.size }}</strong> workshops</li>
</ul>

<ul class="ws-grid">
{% for ws in all_workshops %}
  {% assign ws_duration = 0 %}
  {% assign ws_levels = "" %}
  {% for item in ws.labs %}
    {% assign lab = site.labs | where: "slug", item.slug | first %}
    {% if lab %}
      {% assign ws_duration = ws_duration | plus: lab.duration %}
      {% assign ws_levels = ws_levels | append: lab.difficulty | append: "," %}
    {% endif %}
  {% endfor %}
  {% assign ws_hours = ws_duration | divided_by: 60.0 | round: 1 %}
  {% assign levels_arr = ws_levels | split: "," | uniq | sort %}
  <li class="ws-card">
    <div class="ws-card-title"><a href="{{ ws.url | relative_url }}">{{ ws.title }}</a></div>
    <div class="ws-card-desc">{{ ws.description | strip_html | truncate: 160 }}</div>
    <div class="ws-card-meta">
      <span class="ws-idx-pill ws-idx-pill-labs">{{ ws.labs.size }} labs</span>
      <span class="ws-idx-pill ws-idx-pill-duration">~{{ ws_hours }}h</span>
      <span class="ws-idx-pill ws-idx-pill-levels">
        {%- for lvl in levels_arr -%}
          {%- if lvl != "" -%}Level {{ lvl }}{%- unless forloop.last -%}, {% endunless -%}{%- endif -%}
        {%- endfor -%}
      </span>
    </div>
  </li>
{% endfor %}
</ul>
