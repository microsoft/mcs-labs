---
layout: single
title: "About"
author_profile: false
description: "Meet the Copilot Acceleration Team (CAT) — the team behind MCS Labs"
toc: false
classes: wide
---

<style>
.page__title { display: none; }
.page__meta { display: none; }

.about-hero {
  background: linear-gradient(135deg,
    var(--color-lab-grad-1) 0%,
    var(--color-lab-grad-2) 50%,
    var(--color-lab-grad-3) 100%);
  color: var(--color-on-lab-header);
  padding: 3em 2.5em;
  border-radius: 10px;
  margin: -0.5em 0 2.5em;
  position: relative;
  overflow: hidden;
}
.about-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-lab-hero-glow) 0%, transparent 70%);
  pointer-events: none;
}
.about-hero h2 {
  font-size: 1.8em;
  font-weight: 700;
  margin: 0 0 0.4em;
  letter-spacing: -0.02em;
  border: none;
  padding: 0;
  color: var(--color-on-lab-header);
}
.about-hero p {
  font-size: 1em;
  opacity: 0.85;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
}

.about-section-title {
  font-size: 1em;
  font-weight: 700;
  color: var(--color-fg-strong);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--color-border-subtle);
}

.team-grid {
  display: flex;
  gap: 2.5em;
  margin: 0 0 2.5em;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
}

.team-card {
  text-align: center;
  transition: transform 0.2s ease;
}
.team-card:hover {
  transform: translateY(-2px);
}
.team-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.team-avatar {
  width: 72px !important;
  height: 72px !important;
  border-radius: 50% !important;
  object-fit: cover;
  margin: 0 auto 0.6em;
  display: block;
  border: none !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease;
}
.team-card:hover .team-avatar {
  box-shadow: 0 4px 20px var(--color-accent-tint-3);
}

.team-name {
  font-size: 0.82em;
  font-weight: 600;
  color: var(--color-fg-strong);
  margin: 0;
  letter-spacing: -0.01em;
}

.team-role {
  font-size: 0.72em;
  color: var(--color-fg-disabled);
  margin: 0.15em 0 0;
  line-height: 1.3;
}

.about-content {
  max-width: 720px;
  margin: 0 0 2.5em;
}
.about-content p {
  font-size: 0.92em;
  color: var(--color-fg-muted);
  line-height: 1.7;
  margin: 0 0 1em;
}
</style>

<div class="about-hero">
  <h2>About these labs</h2>
  <p>MCS Labs is built and maintained by a small team within the Copilot Acceleration Team (CAT). We create hands-on, guided labs so customers and partners can learn Copilot Studio by building real agents.</p>
</div>

<h2 class="about-section-title">Built by</h2>

<ul class="team-grid">
  {% for member in site.data.team %}
  <li class="team-card">
    <a href="https://github.com/{{ member.github }}" target="_blank" rel="noopener">
      <img class="team-avatar" src="https://github.com/{{ member.github }}.png?size=128" alt="{{ member.name }}">
      <div class="team-name">{{ member.name }}</div>
    </a>
    {% if member.role != "" %}<div class="team-role">{{ member.role }}</div>{% endif %}
  </li>
  {% endfor %}
</ul>

<h2 class="about-section-title">How the labs work</h2>

<div class="about-content">
  <p>Each lab walks you through a real-world scenario — from creating your first agent to deploying autonomous AI solutions. Labs are organized by difficulty level (100–300) and grouped into events for instructor-led sessions and self-paced learning.</p>

  <p>Whether you're a business user building your first agent or a developer integrating advanced connectors, there's a path for you. Browse <a href="{{ '/labs/' | relative_url }}">all labs</a> or pick an <a href="{{ '/events/' | relative_url }}">event</a> to get started.</p>
</div>
