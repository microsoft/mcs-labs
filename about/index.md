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
  background: linear-gradient(135deg, #0f1b2d 0%, #1a3a5c 50%, #0f2440 100%);
  color: #fff;
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
  background: radial-gradient(circle, rgba(0,120,212,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.about-hero h2 {
  font-size: 1.8em;
  font-weight: 700;
  margin: 0 0 0.4em;
  letter-spacing: -0.02em;
  border: none;
  padding: 0;
  color: #fff;
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
  color: #323130;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid #e8e6e4;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75em;
  margin: 0 0 2.5em;
  padding: 0;
  list-style: none;
}

.team-card {
  border: 1px solid #e8e6e4;
  border-radius: 8px;
  padding: 1.4em 1.3em;
  background: #fff;
  text-align: center;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.team-card:hover {
  border-color: #c8c6c4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.team-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #deecf9;
  color: #0078d4;
  font-size: 1.5em;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.8em;
}

.team-name {
  font-size: 0.92em;
  font-weight: 600;
  color: #323130;
  margin: 0 0 0.2em;
}

.team-role {
  font-size: 0.78em;
  color: #605e5c;
  margin: 0;
  line-height: 1.4;
}

.about-content {
  max-width: 720px;
  margin: 0 0 2.5em;
}
.about-content p {
  font-size: 0.92em;
  color: #605e5c;
  line-height: 1.7;
  margin: 0 0 1em;
}
</style>

<div class="about-hero">
  <h2>Copilot Acceleration Team</h2>
  <p>We help Microsoft customers and partners unlock the full potential of Copilot Studio through hands-on enablement, technical guidance, and reusable lab content.</p>
</div>

<h2 class="about-section-title">The team</h2>

<ul class="team-grid">
  <li class="team-card">
    <div class="team-avatar">PL</div>
    <div class="team-name">Pratap Ladhani</div>
    <div class="team-role">Principal PM Lead</div>
  </li>
  <li class="team-card">
    <div class="team-avatar">TM</div>
    <div class="team-name">Team Member</div>
    <div class="team-role">Role</div>
  </li>
  <li class="team-card">
    <div class="team-avatar">TM</div>
    <div class="team-name">Team Member</div>
    <div class="team-role">Role</div>
  </li>
  <li class="team-card">
    <div class="team-avatar">TM</div>
    <div class="team-name">Team Member</div>
    <div class="team-role">Role</div>
  </li>
  <li class="team-card">
    <div class="team-avatar">TM</div>
    <div class="team-name">Team Member</div>
    <div class="team-role">Role</div>
  </li>
  <li class="team-card">
    <div class="team-avatar">TM</div>
    <div class="team-name">Team Member</div>
    <div class="team-role">Role</div>
  </li>
</ul>

<h2 class="about-section-title">About these labs</h2>

<div class="about-content">
  <p>MCS Labs is a collection of hands-on, guided labs for building AI agents with Microsoft Copilot Studio. Each lab walks you through a real-world scenario — from creating your first agent to deploying autonomous AI solutions.</p>

  <p>Labs are organized by difficulty level (100–300) and grouped into workshops for instructor-led events and self-paced learning. All content is open-source and maintained by the Copilot Acceleration Team within Microsoft Customer Success.</p>

  <p>Whether you're a business user building your first agent or a developer integrating advanced connectors, there's a learning path for you. Browse <a href="{{ '/labs/' | relative_url }}">all labs</a> or pick a <a href="{{ '/workshops/' | relative_url }}">workshop</a> to get started.</p>
</div>
