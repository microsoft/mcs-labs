---
layout: single
title: "Microsoft Copilot Agents Labs"
author_profile: false
classes: wide
toc: false
header:
  overlay_image: false
---

<style>
.page__title { display: none; }
.page__meta { display: none; }
</style>

<style>
/* Hero */
.home-hero {
  background: linear-gradient(135deg,
    var(--color-lab-grad-1) 0%,
    var(--color-lab-grad-2) 50%,
    var(--color-lab-grad-3) 100%);
  color: var(--color-on-lab-header);
  padding: 3.5em 2.5em;
  border-radius: 10px;
  margin: -0.5em 0 2.5em;
  position: relative;
  overflow: hidden;
}
.home-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-lab-hero-glow) 0%, transparent 70%);
  pointer-events: none;
}
.home-hero h2 {
  font-size: 2em;
  font-weight: 700;
  margin: 0 0 0.4em;
  letter-spacing: -0.02em;
  border: none;
  padding: 0;
  color: var(--color-on-lab-header);
}
.home-hero p {
  font-size: 1.05em;
  opacity: 0.8;
  max-width: 560px;
  line-height: 1.6;
  margin: 0 0 1.5em;
}
.home-hero-actions {
  display: flex;
  gap: 0.75em;
}
.home-hero-actions a {
  font-size: 0.88em;
  font-weight: 600;
  padding: 0.6em 1.4em;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.15s;
}
.home-hero-actions .btn-primary {
  background: var(--color-accent);
  color: var(--color-accent-on);
}
.home-hero-actions .btn-primary:hover {
  background: var(--color-accent-hover);
}
.home-hero-actions .btn-outline {
  background: var(--color-lab-pill-bg-soft);
  color: var(--color-on-lab-header);
  border: 1px solid var(--color-lab-pill-border);
}
.home-hero-actions .btn-outline:hover {
  background: var(--color-lab-pill-bg);
  border-color: rgba(255,255,255,0.5);
}
.home-stats {
  display: flex;
  gap: 2.5em;
  margin-top: 2em;
  padding-top: 1.5em;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.home-stats li {
  list-style: none;
}
.home-stats strong {
  font-size: 1.6em;
  display: block;
  line-height: 1.1;
}
.home-stats span {
  font-size: 0.78em;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Section headers */
.home-section-title {
  font-size: 1em;
  font-weight: 700;
  color: var(--color-fg-strong);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--color-border-subtle);
}

/* Journey cards */
.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75em;
  margin: 0 0 2.5em;
  padding: 0;
  list-style: none;
}
.journey-card {
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 1.2em 1.3em;
  background: var(--color-bg);
  color: var(--color-fg-strong);
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.journey-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.journey-card-accent {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  margin-bottom: 0.8em;
}
.accent-blue { background: var(--color-journey-blue); }
.accent-green { background: var(--color-journey-green); }
.accent-purple { background: var(--color-journey-purple); }
.accent-orange { background: var(--color-journey-orange); }

.journey-card h3 {
  font-size: 1em;
  font-weight: 700;
  color: var(--color-fg-strong);
  margin: 0 0 0.3em;
  border: none;
  padding: 0;
}
.journey-card h3 a {
  color: inherit;
  text-decoration: none;
}
.journey-card h3 a:hover {
  color: var(--color-accent);
}
.journey-card-desc {
  font-size: 0.82em;
  color: var(--color-fg-muted);
  line-height: 1.5;
  margin: 0 0 0.8em;
  flex: 1;
}
.journey-card-meta {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.journey-pill {
  font-size: 0.68em;
  font-weight: 600;
  padding: 0.2em 0.55em;
  border-radius: 3px;
  background: var(--color-bg-elevated);
  color: var(--color-fg-muted);
  white-space: nowrap;
}
</style>

{% assign all_labs = site.labs | sort: "order" %}
{% assign total_duration = 0 %}
{% for lab in all_labs %}{% assign total_duration = total_duration | plus: lab.duration %}{% endfor %}
{% assign total_hours = total_duration | divided_by: 60.0 | round: 1 %}
{% assign levels = all_labs | map: "difficulty" | uniq %}
{% assign all_events = site.events | sort: "order" %}

<div class="home-hero">
  <h2>Hands-on labs for building AI agents</h2>
  <p>Learn Microsoft Copilot agents through guided, practical labs. From your first agent to autonomous AI — choose a path that matches your skill level.</p>
  <div class="home-hero-actions">
    <a href="{{ '/events/' | relative_url }}" class="btn-primary">Browse all events</a>
    <a href="{{ '/labs/' | relative_url }}" class="btn-outline">Browse all labs</a>
    <button type="button" class="wc-account-cta wc-account-cta--hero" data-wc-account-cta>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M19 8v6"/>
        <path d="M22 11h-6"/>
      </svg>
      Request an account
    </button>
  </div>
  <ul class="home-stats">
    <li><strong>{{ all_labs.size }}</strong><span>Labs</span></li>
    <li><strong>~{{ total_hours }}h</strong><span>Content</span></li>
    <li><strong>{{ levels.size }}</strong><span>Levels</span></li>
    <li><strong>{{ all_events.size }}</strong><span>Events</span></li>
  </ul>
</div>

{% assign accent_colors = "accent-blue,accent-green,accent-purple,accent-orange" | split: "," %}

<h2 class="home-section-title">Events</h2>
<ul class="journey-grid">
  {% for event in all_events %}
  {% assign color_idx = forloop.index0 | modulo: 4 %}
  <li class="journey-card">
    <div class="journey-card-accent {{ accent_colors[color_idx] }}"></div>
    <h3><a href="{{ event.url | relative_url }}">{{ event.title }}</a></h3>
    <div class="journey-card-desc">{{ event.description | truncate: 120 }}</div>
    <div class="journey-card-meta">
      <span class="journey-pill">Full day</span>
      <span class="journey-pill">{{ event.labs.size }} labs</span>
    </div>
  </li>
  {% endfor %}
</ul>

<p class="home-browse-all"><a href="{{ '/labs/' | relative_url }}">Browse all labs →</a></p>
