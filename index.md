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
  background: linear-gradient(135deg, #0f1b2d 0%, #1a3a5c 50%, #0f2440 100%);
  color: #fff;
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
  background: radial-gradient(circle, rgba(0,120,212,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.home-hero h2 {
  font-size: 2em;
  font-weight: 700;
  margin: 0 0 0.4em;
  letter-spacing: -0.02em;
  border: none;
  padding: 0;
  color: #fff;
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
  background: #0078d4;
  color: #fff;
}
.home-hero-actions .btn-primary:hover {
  background: #106ebe;
}
.home-hero-actions .btn-outline {
  background: rgba(255,255,255,0.1);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
}
.home-hero-actions .btn-outline:hover {
  background: rgba(255,255,255,0.18);
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
  color: #323130;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid #e8e6e4;
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
  border: 1px solid #e8e6e4;
  border-radius: 8px;
  padding: 1.2em 1.3em;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.journey-card:hover {
  border-color: #c8c6c4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.journey-card-accent {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  margin-bottom: 0.8em;
}
.accent-blue { background: #0078d4; }
.accent-green { background: #107c10; }
.accent-purple { background: #7f39fb; }
.accent-orange { background: #ff8c00; }

.journey-card h3 {
  font-size: 1em;
  font-weight: 700;
  color: #323130;
  margin: 0 0 0.3em;
  border: none;
  padding: 0;
}
.journey-card h3 a {
  color: inherit;
  text-decoration: none;
}
.journey-card h3 a:hover {
  color: #0078d4;
}
.journey-card-desc {
  font-size: 0.82em;
  color: #605e5c;
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
  background: #f3f2f1;
  color: #605e5c;
  white-space: nowrap;
}
</style>

{% assign all_labs = site.labs | sort: "order" %}
{% assign total_duration = 0 %}
{% for lab in all_labs %}{% assign total_duration = total_duration | plus: lab.duration %}{% endfor %}
{% assign total_hours = total_duration | divided_by: 60.0 | round: 1 %}
{% assign levels = all_labs | map: "difficulty" | uniq %}
{% assign all_workshops = site.workshops | sort: "order" %}

<div class="home-hero">
  <h2>Hands-on labs for building AI agents</h2>
  <p>Learn Microsoft Copilot Studio through guided, practical labs. From your first agent to autonomous AI — choose a path that matches your skill level.</p>
  <div class="home-hero-actions">
    <a href="{{ '/labs/' | relative_url }}" class="btn-primary">Browse all labs</a>
    <a href="{{ '/workshops/bootcamp/' | relative_url }}" class="btn-outline">Start bootcamp</a>
  </div>
  <ul class="home-stats">
    <li><strong>{{ all_labs.size }}</strong><span>Labs</span></li>
    <li><strong>~{{ total_hours }}h</strong><span>Content</span></li>
    <li><strong>{{ levels.size }}</strong><span>Levels</span></li>
    <li><strong>{{ all_workshops.size }}</strong><span>Workshops</span></li>
  </ul>
</div>

<h2 class="home-section-title">Learning paths</h2>
<ul class="journey-grid">
  <li class="journey-card">
    <div class="journey-card-accent accent-blue"></div>
    <h3><a href="{{ '/labs/?level=100' | relative_url }}">Quick Start</a></h3>
    <div class="journey-card-desc">New to Copilot Studio? Essential labs to get up and running quickly.</div>
    <div class="journey-card-meta">
      <span class="journey-pill">3–4 hours</span>
      <span class="journey-pill">Beginner</span>
      <span class="journey-pill">4 labs</span>
    </div>
  </li>
  <li class="journey-card">
    <div class="journey-card-accent accent-green"></div>
    <h3><a href="{{ '/labs/' | relative_url }}">Business User</a></h3>
    <div class="journey-card-desc">Create powerful AI assistants without deep technical knowledge.</div>
    <div class="journey-card-meta">
      <span class="journey-pill">8–12 hours</span>
      <span class="journey-pill">Beginner–Intermediate</span>
      <span class="journey-pill">7 labs</span>
    </div>
  </li>
  <li class="journey-card">
    <div class="journey-card-accent accent-purple"></div>
    <h3><a href="{{ '/labs/?level=200' | relative_url }}">Developer</a></h3>
    <div class="journey-card-desc">Advanced features, integrations, and development best practices.</div>
    <div class="journey-card-meta">
      <span class="journey-pill">10–15 hours</span>
      <span class="journey-pill">Intermediate–Advanced</span>
      <span class="journey-pill">13 labs</span>
    </div>
  </li>
  <li class="journey-card">
    <div class="journey-card-accent accent-orange"></div>
    <h3><a href="{{ '/labs/?level=300' | relative_url }}">Autonomous AI</a></h3>
    <div class="journey-card-desc">Build agents that perform complex tasks with minimal human intervention.</div>
    <div class="journey-card-meta">
      <span class="journey-pill">6–8 hours</span>
      <span class="journey-pill">Advanced</span>
      <span class="journey-pill">3 labs</span>
    </div>
  </li>
</ul>

{% assign accent_colors = "accent-blue,accent-green,accent-purple,accent-orange" | split: "," %}

<h2 class="home-section-title">Workshops &amp; events</h2>
<ul class="journey-grid">
  {% for workshop in all_workshops %}
  {% assign color_idx = forloop.index0 | modulo: 4 %}
  <li class="journey-card">
    <div class="journey-card-accent {{ accent_colors[color_idx] }}"></div>
    <h3><a href="{{ workshop.url | relative_url }}">{{ workshop.title }}</a></h3>
    <div class="journey-card-desc">{{ workshop.description | truncate: 120 }}</div>
    <div class="journey-card-meta">
      <span class="journey-pill">Full day</span>
      <span class="journey-pill">{{ workshop.labs.size }} labs</span>
    </div>
  </li>
  {% endfor %}
</ul>
