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

.feed-url {
  display: inline-block;
  font-family: var(--monospace, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 0.85em;
  background: var(--color-code-bg, #f3f3f3);
  color: var(--color-fg-strong);
  border: 1px solid var(--color-border-subtle);
  border-radius: 6px;
  padding: 0.5em 0.8em;
  margin: 0.3em 0 1.2em;
  word-break: break-all;
}
.feed-steps {
  max-width: 720px;
  margin: 0 0 1.2em;
  padding: 0;
  list-style: none;
  counter-reset: feed;
}
.feed-steps li {
  position: relative;
  padding: 0 0 0.9em 2.2em;
  font-size: 0.92em;
  color: var(--color-fg-muted);
  line-height: 1.7;
}
.feed-steps li::before {
  counter-increment: feed;
  content: counter(feed);
  position: absolute;
  left: 0;
  top: 0;
  width: 1.5em;
  height: 1.5em;
  line-height: 1.5em;
  text-align: center;
  font-size: 0.85em;
  font-weight: 700;
  color: var(--color-on-lab-header);
  background: var(--color-lab-grad-2);
  border-radius: 50%;
}
</style>

<div class="about-hero">
  <h2>About MCS Labs</h2>
  <p>MCS Labs is a collection of hands-on training content created and maintained by the Copilot Acceleration Team (CAT) and the CAPE organization. The labs, modules, and events on this site are designed for instructor-led training delivered through our event training tenant.</p>
</div>

<h2 class="about-section-title">Important — Training Tenant Required</h2>

<div class="about-content">
  <p>These labs are built to be used within our dedicated event training tenant. To complete them, you will need an account provisioned in that tenant. Many of the key resources, instructions, and artifacts needed to work through a lab are available in the GitHub repository for each lab, but the labs themselves were designed for instructor-led events delivered by the CAT or CAPE organization.</p>

  <p>You are welcome to explore the content and attempt the labs on your own, however please be aware that this content was not designed to be consumed in a self-service manner. Some steps may require environment-specific configuration or resources that are only available during scheduled training events.</p>

  <p>If you are interested in finding out more about CAT-delivered events, visit the <a href="https://microsoft.github.io/cat/programs/architecture-bootcamp.html" target="_blank" rel="noopener">CAT Architecture Bootcamp</a> page.</p>
</div>

<h2 class="about-section-title">How the content is organized</h2>

<div class="about-content">
  <p><strong>Modules</strong> are the core building blocks — each one corresponds to a presentation deck and optionally includes a hands-on lab. Modules are organized by difficulty level (100–300).</p>

  <p><strong>Events</strong> are curated, scheduled training experiences with a fixed agenda of modules. They are consistently delivered and follow a structured format.</p>

  <p><strong>Workshops</strong> are less formal and are typically delivered on-demand. They also follow an agenda but are not as rigidly structured as events.</p>

  <p>Browse <a href="{{ '/modules/' | relative_url }}">all modules</a>, pick an <a href="{{ '/events/' | relative_url }}">event</a>, or explore a <a href="{{ '/workshops/' | relative_url }}">workshop</a> to learn more.</p>
</div>

<h2 class="about-section-title">Syndicate our content</h2>

<div class="about-content">
  <p>Everything on this site — modules, events, workshops, and labs — is also published as a machine-readable <strong>content feed</strong>. If you run your own portal or learning system, you can pull our content directly instead of copying it by hand, and it stays current as we update it. The feed is public; no account or API key is required.</p>

  <p>Start from the discovery document, which lists every available feed:</p>

  <span class="feed-url">{{ site.url }}{{ site.baseurl }}/feed/index.json</span>

  <p>To pull our content into another <strong>mcs-labs–style portal</strong>, add a subscription that points at the feed and let your build consume it:</p>

  <ol class="feed-steps">
    <li>Add an entry to <code>_data/feed_subscriptions.yml</code> with <code>url: {{ site.url }}{{ site.baseurl }}/feed</code> and <code>feed: all</code>.</li>
    <li>Run the feed pipeline (<code>build-feed</code> → <code>consume-feed</code>) on your next build; our items are materialized alongside your own.</li>
    <li>Our content renders with your theme, each item carrying a <em>“Syndicated”</em> badge so visitors know where it came from. Use filtering to pull only the parts you want.</li>
  </ol>

  <p>Building any other kind of consumer? Read each feed's <code>manifest.json</code> and fetch only the items whose <code>content_hash</code> changed. Full guides: <a href="https://github.com/microsoft/mcs-labs/blob/main/docs/CONSUMING_FEEDS.md" target="_blank" rel="noopener">Consuming feeds</a>, <a href="https://github.com/microsoft/mcs-labs/blob/main/docs/feed/FEED_FORMAT.md" target="_blank" rel="noopener">feed format</a>, and <a href="https://github.com/microsoft/mcs-labs/blob/main/docs/FILTERING.md" target="_blank" rel="noopener">filtering</a>.</p>
</div>
