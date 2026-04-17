---
layout: single
title: "All Labs"
author_profile: false
description: "Browse all Microsoft Copilot Studio labs"
toc: false
classes: wide
---

<style>
.lab-stats {
  display: flex;
  gap: 2em;
  margin: 0 0 1.5em;
  padding: 0;
  list-style: none;
}
.lab-stats li {
  font-size: 0.88em;
  color: var(--color-fg-muted);
}
.lab-stats strong {
  font-size: 1.5em;
  display: block;
  color: var(--color-fg-strong);
  font-weight: 700;
  line-height: 1.2;
}

/* Filter bar */
.lab-filters {
  display: flex;
  gap: 0.5em;
  margin: 0 0 2em;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
  align-items: center;
}
.lab-filters-label {
  font-size: 0.78em;
  font-weight: 600;
  color: var(--color-fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-right: 0.3em;
}
.lab-filter-btn {
  font-family: inherit;
  font-size: 0.82em;
  font-weight: 500;
  padding: 0.35em 0.9em;
  border-radius: 100px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-fg-muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.lab-filter-btn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-fg-strong);
}
.lab-filter-btn.active {
  background: var(--color-fg-strong);
  border-color: var(--color-fg-strong);
  color: var(--color-bg);
}
.lab-filter-btn.active-100 {
  background: var(--color-pill-green-fg);
  border-color: var(--color-pill-green-fg);
  color: var(--color-bg);
}
.lab-filter-btn.active-200 {
  background: var(--color-pill-blue-fg);
  border-color: var(--color-pill-blue-fg);
  color: var(--color-bg);
}
.lab-filter-btn.active-300 {
  background: var(--color-pill-purple-fg);
  border-color: var(--color-pill-purple-fg);
  color: var(--color-bg);
}

.lab-section {
  margin-bottom: 2.5em;
}
.lab-section.section-hidden {
  display: none;
}
.lab-section-header {
  font-size: 1.1em;
  font-weight: 700;
  color: var(--color-fg-strong);
  margin: 0 0 0.75em;
  padding-bottom: 0.4em;
  border-bottom: 2px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.lab-section-header .section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.section-core .section-dot { background: var(--color-journey-blue); }
.section-intermediate .section-dot { background: var(--color-journey-green); }
.section-advanced .section-dot { background: #d83b73; }
.section-specialized .section-dot { background: var(--color-journey-purple); }
.section-optional .section-dot { background: var(--color-journey-orange); }
.section-external .section-dot { background: var(--color-fg-muted); }

.lab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75em;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lab-card {
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1em 1.2em;
  background: var(--color-bg);
  color: var(--color-fg-strong);
  transition: border-color 0.15s, box-shadow 0.15s, opacity 0.2s;
  display: flex;
  flex-direction: column;
}
.lab-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.lab-card.card-hidden {
  display: none;
}

.lab-card-title {
  font-size: 0.92em;
  font-weight: 600;
  color: var(--color-fg-strong);
  margin: 0 0 0.4em;
  line-height: 1.35;
}
.lab-card-title a {
  color: inherit;
  text-decoration: none;
}
.lab-card-title a:hover {
  color: var(--color-accent);
}

.lab-card-desc {
  font-size: 0.8em;
  color: var(--color-fg-muted);
  line-height: 1.5;
  margin: 0 0 0.7em;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lab-card-meta {
  display: flex;
  gap: 0.6em;
  align-items: center;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.lab-pill {
  font-size: 0.7em;
  font-weight: 600;
  padding: 0.2em 0.6em;
  border-radius: 3px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.pill-duration {
  background: var(--color-bg-elevated);
  color: var(--color-fg-muted);
}
.pill-level-100 {
  background: var(--color-pill-green-bg);
  color: var(--color-pill-green-fg);
}
.pill-level-200 {
  background: var(--color-pill-blue-bg);
  color: var(--color-pill-blue-fg);
}
.pill-level-300 {
  background: var(--color-pill-purple-bg);
  color: var(--color-pill-purple-fg);
}

.lab-empty-msg {
  display: none;
  padding: 2em;
  text-align: center;
  color: var(--color-fg-disabled);
  font-size: 0.9em;
}
.lab-empty-msg.visible {
  display: block;
}
</style>

{% assign all_labs = site.labs | sort: "order" %}
{% assign total_duration = 0 %}
{% for lab in all_labs %}{% assign total_duration = total_duration | plus: lab.duration %}{% endfor %}
{% assign total_hours = total_duration | divided_by: 60.0 | round: 1 %}

<ul class="lab-stats">
  <li><strong>{{ all_labs.size }}</strong> labs</li>
  <li><strong>~{{ total_hours }}h</strong> of content</li>
  <li><strong>6</strong> sections</li>
</ul>

<div class="lab-filters">
  <button class="lab-filter-btn active" data-level="all">All levels</button>
  <button class="lab-filter-btn" data-level="100">Level 100</button>
  <button class="lab-filter-btn" data-level="200">Level 200</button>
  <button class="lab-filter-btn" data-level="300">Level 300</button>
</div>

{% assign sections = "core_learning_path,intermediate_labs,advanced_labs,specialized_labs,optional_labs,external_labs" | split: "," %}
{% assign section_labels = "Core Learning Path,Intermediate,Advanced,Specialized,Optional,External" | split: "," %}
{% assign section_classes = "section-core,section-intermediate,section-advanced,section-specialized,section-optional,section-external" | split: "," %}

{% for section_key in sections %}
{% assign section_labs = all_labs | where: "section", section_key %}
{% if section_labs.size > 0 %}
{% assign idx = forloop.index0 %}
<div class="lab-section {{ section_classes[idx] }}">
  <h2 class="lab-section-header"><span class="section-dot"></span>{{ section_labels[idx] }}</h2>
  <ul class="lab-grid">
    {% for lab in section_labs %}
    <li class="lab-card" data-difficulty="{{ lab.difficulty }}">
      <div class="lab-card-title"><a href="{{ lab.url | relative_url }}">{{ lab.title }}</a></div>
      <div class="lab-card-desc">{{ lab.description | strip_html | truncate: 120 }}</div>
      <div class="lab-card-meta">
        <span class="lab-pill pill-level-{{ lab.difficulty }}">Level {{ lab.difficulty }}</span>
        <span class="lab-pill pill-duration">{{ lab.duration }} min</span>
      </div>
    </li>
    {% endfor %}
  </ul>
</div>
{% endif %}
{% endfor %}

<div class="lab-empty-msg">No labs match this filter.</div>

<script>
(function() {
  var btns = document.querySelectorAll('.lab-filter-btn');
  var cards = document.querySelectorAll('.lab-card');
  var sections = document.querySelectorAll('.lab-section');
  var emptyMsg = document.querySelector('.lab-empty-msg');

  function applyFilter(level) {
    btns.forEach(function(b) {
      b.className = 'lab-filter-btn';
      if (b.getAttribute('data-level') === level) {
        b.classList.add(level === 'all' ? 'active' : 'active-' + level);
      }
    });

    var visibleCount = 0;
    cards.forEach(function(card) {
      if (level === 'all' || card.getAttribute('data-difficulty') === level) {
        card.classList.remove('card-hidden');
        visibleCount++;
      } else {
        card.classList.add('card-hidden');
      }
    });

    sections.forEach(function(sec) {
      var visible = sec.querySelectorAll('.lab-card:not(.card-hidden)');
      sec.classList.toggle('section-hidden', visible.length === 0);
    });

    if (emptyMsg) {
      emptyMsg.classList.toggle('visible', visibleCount === 0);
    }
  }

  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      applyFilter(btn.getAttribute('data-level'));
    });
  });

  // Apply filter from ?level= query param on page load
  var params = new URLSearchParams(window.location.search);
  var levelParam = params.get('level');
  if (levelParam && ['100', '200', '300'].indexOf(levelParam) !== -1) {
    applyFilter(levelParam);
  }
})();
</script>
