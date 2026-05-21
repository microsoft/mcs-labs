# Changelog

All notable changes to the Microsoft Copilot Studio Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- **Backlog Tracker at `/tracker/`.** New static page surfacing GitHub issues across 5 categories (Bugs, New Labs, Content Updates, Portal Enhancements, Bootcamp Features). Two tabs: **Insights** (default — KPI tiles, donut by category, opened-vs-closed trend line with date/count axes, per-category aging breakdown with stacked bucket bars + named oldest issues, top-15 oldest open issues table) and **Board** (Kanban with Triage / Backlog / In Progress / Done columns, filter chips per category, smart "+ New item" button that picks the right GitHub issue template based on the active filter). 100% public — any deeper interaction (assignees, comments, history) deep-links to the corresponding GitHub issue. **Data is fetched live from the public GitHub Issues REST API in the browser on each page load** (no scheduled workflow, no committed snapshot in the hot path) — the page shapes raw issues client-side into the five categories and lifecycle states. A manual **Refresh** button re-fetches on demand; tab switches / filter clicks / time-range changes do NOT re-fetch (they re-render from the already-loaded dataset). Time-range selector (7d / 14d / 30d / 60d / 90d) drives the Closed KPI, trend chart x-axis, and Done column window. If the live API call fails (network, 5xx, or anonymous-rate-limited at 60/hr/IP), the page falls back to a committed seed JSON at `assets/data/issues.json` and surfaces the degraded state in the header ("⚠ Cached snapshot · N min old (live API unavailable)"). Linked from the home-page footer only — not site-wide nav. Inherits `layout: single` so masthead, footer, and theme switcher are consistent with the rest of the site. Lab Assistant + "Request an account" CTA are suppressed on this page. Module split: `tracker.md` (page shell), `assets/css/tracker.css`, `assets/js/tracker/{data,insights,board,main}.js`, `_data/tracker.yml` (repo config + stale threshold), `scripts/build-tracker-data.js` (standalone Node script for occasionally regenerating the seed JSON, with Node 20 built-in test runner unit tests).
- **`Bootcamp Feature` issue template.** New `.github/ISSUE_TEMPLATE/bootcamp_feature.yml` for bootcamp process, tooling, and management work — auto-applies `type: bootcamp-feature` and `status: triage` so new submissions land in a reviewable state.
- **Labels: `type: bootcamp-feature`, `status: triage`, `status: backlog`, `status: in-progress`.** Support the Backlog Tracker's Triage → Backlog → In Progress → Done lifecycle.

### Changed
- **Issue template rename: "Redesign feedback" → "Portal Enhancements".** The air-theme redesign is now just "the site," so the template covering site-wide bugs/suggestions has been renamed and broadened. File renamed `.github/ISSUE_TEMPLATE/redesign-feedback.yml` → `portal_enhancement.yml`; label `redesign` → `portal-enhancement`. The "Which page?" dropdown now includes `Backlog tracker (/tracker/)`.
- **Label rename: `feedback` → `discussion`.** Distinguishes open-ended threads from the existing `question` label (which implies a specific answer is wanted).

### Added
- **New Orchestration with Copilot Studio lab (`_labs/mcs-orchestration.md`).** 60-minute, level-300 lab structured around three Use Cases: (1) verify the prebuilt Account Data Lookup connected agent is configured for the environment, (2) walk through where Instructions and Descriptions live across the agent (parent / child agent / tool / input) and run six demonstration prompts that surface the planner's behavior in the activity tracker, (3) build a new Sales Account Assistant, enable Enhanced Task Completion, attach Weather + Work IQ Mail + Microsoft Dataverse MCP Server tools and a `company_policies_sample.pdf` knowledge file, and run seven test prompts that exercise the Reasoning Loop (multi-tool reasoning, dynamic chaining, code-execution via Bash, train-of-thought inspection). Lab cross-references UC #1 with the Multi-Agent lab's verification UC via reciprocal skip callouts. Registered in `_events/bootcamp.md` (Lab 8) and `_data/lab-config.yml` (`bootcamp_lab_orders` key 8) and listed in the main `README.md` labs table.
- **Module 9 deck — *Lab: Orchestration* intro slide bullets rewritten** to match the lab's *What You Will Learn*: Instructions/Descriptions priority order, Activity Tracker / Get rationale as a debugger trace, Enhanced Task Completion's Reasoning Loop, and choosing between standard orchestration and ETC. Replaced the older "Compose a parent agent / Configure dynamic chaining / Verify orchestration behavior" bullets that pre-dated the V2.1 content scope. Slide 27 of `presentations/bootcamp/09. Orchestration and Dynamic Chaining Concepts_CB.pptx`.
- **`assets/js/copy-trim.js`** — wraps `navigator.clipboard.writeText` to strip trailing newlines before the OS clipboard write, fixing inadvertent Enter / form-submit when participants paste fenced-block content into chat composers. Loaded from `_includes/footer/custom.html`.

### Changed
- **Multi-Agent lab UC #3 split into UC #3 + UC #4.** UC #3 now covers verification only (Dataverse Search, table indexes, publish the Account Data Lookup Agent) and UC #4 covers wiring the connected agent into the parent. The verification half is the same content as the Orchestration lab's UC #1; both labs carry reciprocal *"skip this if you completed it in the other lab"* callouts so V2.1 attendees who run the bootcamp in agenda order don't repeat the setup.
- **Bootcamp Day 2 agenda — Tools before Orchestration.** Module 8 = *Tools* and Module 9 = *Orchestration and Dynamic Chaining Concepts* (was Module 8 = Orchestration, Module 9 = Tools). PPTX files renamed via `git mv` (`08. Orchestration… → 09.`; `09. Copilot Studio Tools… → 08.`). Lab labels and slug mappings flipped to match across `_data/agendas/bootcamp.yml`, `_events/bootcamp.md`, `_data/lab-config.yml`, and `_labs/{mcs-tools,mcs-orchestration}.md` (`bootcamp_order`). Body cross-references in the Orchestration lab updated from *Module 8* to *Module 9* (three occurrences).
- **Orchestration lab promoted to level 300 and 60 minutes** (was 200 / 45). UC effort reallocated to 10 / 20 / 30 minutes across the three Use Cases. Day 2 15:30 coffee break removed so Lab 8 (Orchestration) gets the full hour from 15:30 to 16:30; Networking & Happy Hour still starts at 16:30.
- **Multi-Agent UC #2 "Set the X to:" lines standardized.** US version was bold (`**US Product Information Agent**`); UK was inline code; both now use fenced ` ```text ``` ` blocks so the values render with a Copy button consistent with the rest of the lab. Removed a stray trailing backtick on line 362 (UK instructions block) that would have copied with the literal value.

### Fixed
- **Table CSS in `assets/css/main.scss` — three site-wide rendering bugs.** (1) Header `th` horizontal padding now uses `1.25em` to compensate for `font-size: 0.8em` so cells line up with `tbody td` (was 11.264px header / 14.08px body — now both 14.08px). (2) Row separators switched from `var(--color-bg-elevated)` to `var(--color-divider)` for better dark-theme contrast (the elevated tone was nearly invisible against the dark page bg). (3) Tables now declare `display: table; width: 100%` to override the upstream minimal-mistakes `display: block` so cells stretch to fill the content column instead of shrinking to the longest line and visually stopping short of the heading rule.

### Fixed
- **Inline `code` is now readable in Dark / High-Contrast themes site-wide.** Minimal-mistakes' `_page.scss` hardcodes `.page__content :not(pre) > code { background: $code-background-color }` (≈ #fafafa) at SCSS compile time, so inline-code pills stayed near-white in non-light themes — most visibly the `US` / `UK` chips on the Multi-Agent lab UC#2 rendered as invisible white boxes in Dark mode. Added a same-specificity override in `assets/css/main.scss` that routes both background and text through `--color-bg-elevated` and `--color-fg-strong` (plus a subtle border) so the pills stay legible across Light, Dark, and HC.
- **Site-wide ordered-list numbering — only headings reset numbering.** Across 22 lab files (361 line edits) flush-left or under-indented (0–2 space) images, blockquotes (incl. `> [!IMPORTANT]`/`[!TIP]`/`[!NOTE]`), code fences, and bullet lists between two `1.` ordered-list items in the same heading scope were re-indented to 4 spaces so they nest under the preceding step. Kramdown auto-numbering now flows continuously within each `####` section. Notable: Multi-Agent UC#3 (Ensure indexes are in place) had a missing period on `1 In the left menu...`, multiple flush-left images, and a section-leading IMPORTANT block at 4-space indent (rendered as a code block) — all corrected.

### Added
- **GitHub-flavored alert callouts (`> [!IMPORTANT]` / `[!TIP]` / `[!NOTE]` / `[!WARNING]` / `[!CAUTION]`) now render as styled callouts site-wide.** Kramdown leaves these as plain blockquotes with the literal `[!TYPE]` marker text, which had been showing as raw text inside an unstyled blockquote across every lab. New `assets/js/github-alerts.js` (loaded from `_includes/footer/custom.html`) walks `.page__content blockquote`s on page load, strips the marker, tags the element with `github-alert github-alert--<variant>`, and inserts a `.github-alert__header` label. Matching CSS in `main.scss` paints each variant with its own accent (Note = brand blue, Tip = success green, Important = purple, Warning = amber, Caution = red), routes through theme tokens for Light / Dark / HC compatibility, and bumps accent intensity in Dark mode for legibility on `--color-bg-elevated`.

### Changed
- **Lab-intro slide overviews + timer alignment across all lab decks.** Every lab-intro slide now carries a 3-bullet "what you'll learn" overview text box at a uniform position (L=2.84", T=4.39", W=8.80", Segoe UI 24pt, auto-fit, gold-standard from Agent Builder Lab 1), and the timer chip group (Timer label + duration text + background) sits in the same top-right anchor (`Timer` at L=10.20"/T=0.45", duration at L=9.44"/T=1.01"). Durations match each lab's actual length per `_data/lab-config.yml` — fixed Labs 3, 6, 9, 11 which previously displayed the wrong minute count. The Orchestration deck (Module 8) and Multi-Agent deck (Module 13) gained brand-new `Lab: …` intro slides inserted before their existing recap slides; both reuse the layout of an adjacent slide so they blend with the deck. Applied to bootcamp decks 01, 02-04, 06, 07, 08, 09, 11, 13, 14 and the duplicates in mcs-in-a-day (01, 02-04).
- **Bootcamp Host Deck — V2.1 schedule + cleanup.** Day 1 / Day 2 / Day 3 agenda tables (slides 6, 7, 8) rewritten to match `_data/agendas/bootcamp.yml`, replacing the stale schedule that still referenced Module 12 SDK and the old "Azure Integration" slot for Module 15. Six duplicate / outdated schedule slides removed (slides 21, 24, 36, 39, 42, 43), shrinking the deck from 43 to 37 slides. Theme, master and template untouched — only table cell content updated.
- **MCS-in-a-day Host Deck — single-day agenda.** Slide 6 retitled "Day 1 Agenda" → "Agenda" since this is a one-day event, and the eight schedule slides irrelevant for a single-day flow removed (Day 2, Day 3, plus six duplicates). Deck shrank from 43 to 35 slides; the kept agenda's table content already matched `_data/agendas/mcs-in-a-day.yml` so cells were left as-is.
- **Module 8 Orchestration — Enhanced Task Completion section recolor.** The cyan/teal accent palette in slides 20–28 (the new *Enhanced Task Completion* section) was remapped to the bootcamp brand pink/blue: `#4CCBED` → `#C83FB2` (vivid pink) and `#0B556A` → `#0078D4` (Microsoft blue), matching the recolor rules used on the Module 15 deck. Slides 1–19 and 29–30 untouched. Card fills, body grays, yellow/purple/orange accents, and the template/master are all preserved.
- **Per-event presentation folders.** Decks now live under `presentations/<event_id>/` instead of a single flat `presentations/` directory. Each event folder is self-contained — decks shared between events are duplicated in each so the agendas can list the same deck at different slot numbers without collisions. The Host Deck is shared across `bootcamp/` and `mcs-in-a-day/` and is renamed from the bootcamp-specific *"00. Host Deck - Copilot Studio Architecture Bootcamp.pptx"* to a generic *"00. Host Deck.pptx"*. All `slides:` paths in `_data/agendas/bootcamp.yml` and `_data/agendas/mcs-in-a-day.yml` were updated to point into the new subfolders. The slides URL-rewrite block in `_layouts/event.html` is path-prefix-agnostic so it picks up the nested structure unchanged. Resolves the V2.1 collision where bootcamp's *15. Skills for Copilot Studio* and mcs-in-a-day's *15. Licensing* both lived as `15.`-prefixed siblings in the flat folder.
- **Archived decks no longer in any agenda.** `12. SDK_CB.pptx` (dropped from the V2.1 bootcamp agenda — Module 12 is no longer a session) moved to `presentations/archived/SDK_CB.pptx`. Archived decks lose their leading order numbers since they no longer correspond to an agenda slot.

### Fixed
- Bootcamp Day 2 evening event title corrected: *Networking HH* → *Networking and Happy Hour* in `_data/agendas/bootcamp.yml` so the rendered agenda no longer abbreviates the social-hour label.

### Added
- **Lab Assistant discoverability boost.** The right-edge pull tag now paints in the brand accent color (was muted gray on white) and pulses once per session on first appearance — a one-time visual cue that fades away after the user has seen the assistant. A speech-bubble nudge balloon also fades in next to the tag on the first visit per browser session, introducing what the assistant can help with: *"Hi! I can help you get your account, find labs, or troubleshoot setup."* The nudge is dismissable via × or by clicking its body (which also opens the chat); clicking the tag itself dismisses the nudge too, since the user has now found the assistant. Both the pulse and the nudge gate on `sessionStorage['mcs-labs.assistant-pulse.v1']` and `['mcs-labs.assistant-nudge.v1']` so returning visitors aren't nagged. The pull tag is now reachable on phones too — the previous `@media (max-width: 480px) { .wc-tag { display: none; } }` rule has been dropped.
- **"Request account" CTAs.** A small accent-colored pill in the masthead and a distinct success-green button in the home hero (next to *Browse all events* / *Browse all labs*), each opens the chat panel via `data-wc-account-cta` so users on the home or any page can reach the assistant directly when they're trying to get a Microsoft 365 account. The masthead pill is hidden below 480 px to keep the nav compact; the hero button goes full-width on mobile.
- **Back-to-top button on lab pages.** A floating accent-colored button at the bottom-right of the viewport appears once the user has scrolled past 400 px and smooth-scrolls to the top on click. Hides while the chat panel is open so it doesn't fight the panel for the bottom-right corner. Sized at 44×44 on desktop, bumped to 48×48 with 16 px inset on mobile (≤ 640 px) for a comfortable tap target. Lab layout only.
- **Design tokens for success-color text and hover.** New `--color-on-success` and `--color-success-hover` tokens in `_tokens.scss` across all four palettes (Light / Dark / HC / system) so success-themed surfaces (currently the hero "Request an account" button) follow the active theme instead of hardcoding white-on-dark-green.
- **Event-aware navigation.** Labs opened from an event page now show an in-lab rail below the header with the event name, `Lab X of Y` position, Previous / Next lab buttons, and an expandable agenda popover. A matching pair of Previous / Next cards renders at the bottom of the lab. Breadcrumbs override to `Home / Events / <Event> / <Lab>` when an event context is active. Event context sticks via `sessionStorage['mcs-labs.event-context.v1']` so the user keeps in-event navigation even when they click internal links that don't carry `?event=`.
- **Event agenda data model (`_data/agendas/<event_id>.yml`).** Each event can now declare a full schedule with labs, sessions, breaks, and external links. The event detail page renders this as a timeline; non-lab items (welcome, Q&A, lunch, etc.) display inline. Events without an agenda file fall back to the existing `labs:` array — no migration required.
- **Slides download chips on session rows.** Session entries in an agenda can declare `slides:` pointing to a file in `/presentations/`; the event timeline renders a small accent-tint "Slides" chip below the session title that downloads the deck when tapped. Wired to all Bootcamp + MCS in a Day modules.
- Homepage "Browse all labs →" link replacing the Learning paths grid.

- Accessibility settings menu in the masthead: theme switcher (Light, Dark, High contrast, Match system) and 3-step text size (A−, A, A+). Preferences persist in `localStorage` under `mcs-labs.prefs.v1`. A pre-paint inline script applies the stored theme before CSS loads, preventing any flash of wrong theme on reload.
- Dark-mode Rouge syntax highlighting (Monokai-like palette) and high-contrast code blocks under `[data-theme="hc"]`.
- Design-token layer (`assets/css/_tokens.scss`): all site colors now resolve through CSS custom properties with Light, Dark, and High contrast palettes plus a `System` option that follows `prefers-color-scheme`.
- Global `prefers-reduced-motion` block that neutralizes panel slide, typing-dot pulse, and send-button transitions for motion-sensitive users.
- Continuous a11y coverage on pull requests: `pa11y-ci` at WCAG 2.1 AA (`.github/workflows/a11y.yml`, `.pa11yci.json`) and Lighthouse CI requiring an accessibility score ≥ 95 (`.github/workflows/lighthouse.yml`, `lighthouserc.json`).

### Changed
- **Event-rail repainted with the brand accent + theme-aware text.** The in-lab event navigation rail (event name, *Lab X of Y* pill, Prev / Next / agenda buttons) now uses `var(--color-accent)` as the background and `var(--color-accent-on)` for every text and tint, so it recolors automatically under Light / Dark / HC. Translucent surfaces (hover background, position pill, expanded-agenda toggle) use `color-mix(in srgb, var(--color-accent-on) X%, transparent)` so they stay tinted relative to the foreground. Bolder labels (font-weight 700) and `stroke-width: 2.5` on chevrons for legibility against the lighter dark-theme accent. Disabled buttons (e.g. *Prev* on Lab 1) drop saturation but keep the hue via `color-mix` instead of blanket `opacity: 0.4`, so they read as part of the same surface.
- **Event navigation is now sticky.** The × button that exited the event context has been removed (CSS `display: none`; the JS handler reference stays intact). Once a learner enters via `?event=`, the rail and breadcrumb stay through the lab path until the session ends or they navigate away from event-linked pages.
- **Masthead stays full-width when the Lab Assistant is open.** Previously the body's `padding-right: 480px` (applied at ≥ 1024 px when the panel is open) also squeezed the masthead, triggering the greedy-nav to collapse links into the *More* overflow menu. The masthead now gets a compensating `margin-right: -480px` so the nav links stay visible. Page content below still shifts left for the panel as before.
- Lab Assistant chat persists across in-tab page navigation using `sessionStorage` (no cookies). Token, Direct Line conversation, and transcript are preserved; state clears when the tab closes. Open/closed panel state also survives navigation.
- Lab Assistant panel no longer overlaps the site masthead on small screens — panel top now tracks the masthead's live height.
- Lab Assistant now shifts main content instead of overlaying it at viewports ≥ 1024 px. Below 1024 px the panel continues to overlay; at 1440 px+ both the TOC and the panel stay on-screen. The TOC collapses when the panel is open between 1024–1440 px to keep the content column readable.
- Lab Assistant pull-handle is now a native `<button>`; gains automatic keyboard activation and focus semantics.
- Pinned `minimal-mistakes-jekyll` to `= 4.27.3` to protect the new `_includes/masthead.html` shadow from silent upstream drift.

### Fixed
- **Duplicate title + description block hidden at the top of every lab.** Lab markdown files repeat `# <Title>` and the description right after the front matter — between two `---` rules — which produces a leading `<hr><h1><p><hr>` quartet inside `.page__content`. The colorful `.lab-header` above already renders `page.title` + `page.description`, so this prefix was duplicate content. A `:has()`-based CSS rule in `_layouts/lab.html` hides the four elements when the pattern matches; labs that don't follow the convention are untouched. Markdown content is unchanged.
- **Inline "## Table of Contents" section hidden in labs.** The right-sidebar *On this page* nav already provides the same navigation, so the inline TOC was duplicate scaffolding. Hidden via CSS targeting `h2#table-of-contents` plus the list and trailing `<hr>`. The corresponding *Table of Contents* entry in the sidebar nav is also hidden via `.toc__menu li:has(> a[href="#table-of-contents"])` so the auto-built sidebar doesn't surface it either.
- Cross-lab prerequisite links across `_labs/*.md` were rendered as `../<slug>/README.md`, which 404s on the deployed Jekyll site (`labs/*/README.md` is excluded from the build per `_config.yml`). Replaced with Jekyll-canonical `{% link _labs/<slug>.md %}` form so they resolve to the live lab page URL. Touched `_labs/agent-builder-sharepoint.md`, `_labs/core-concepts-analytics-evaluations.md` (two links), and `_labs/core-concepts-variables-agents-channels.md` (#274).
- `core-concepts-analytics-evaluations` lab: standardized terminology to **"test method"** to match the *Edit test case* panel in the current Copilot Studio UI. Renamed the Core Concepts entry from *Evaluation Methods* → *Test Methods* with a note that older docs use the prior name. Updated five inline references (Summary of Targets, Use Cases table, UC#2 sub-table, *General Quality* description in UC#3 results, *Choose Test Methods Wisely* and *Test Methods Matter* lessons-learned bullets). Left the *Evaluation Test Sets* concept and headings unchanged — those still match Copilot Studio's "evaluation" / "evaluations" labels (#174).
- `agent-builder-m365` lab Use Case #3 *Deep analysis with the Researcher agent*: corrected the Researcher panel location from *"right-side panel"* to *"left-side panel"* (line 567); converted hardcoded list markers (`2.`, `3.`, `4.`, `5.`, `6.`, `7.`, `8.`) to Markdown's auto-numbered `1.` so each sub-section's list renders cleanly instead of restarting awkwardly across `####` headings (#238); added a NOTE under Prompt 1 warning learners that Researcher may ask a follow-up about report length and that replying `go ahead` accepts the default (#236); added a step under Prompt 2 calling out the **Convert to** menu (Infographic / HTML / YAML / C# / etc.) so learners discover that capability.
- `autonomous-account-news` lab UC#4: renamed the global variables from `searchResults` and `relevantNewsForOpportunities` (which collided with same-named topic input variables and tripped Copilot Studio's *"variable name already exists"* validation) to `globalSearchResults` and `globalRelevantNewsForOpportunities`. Updated the YAML snippets and all later `Global.*` references throughout the lab. Tightened the *"select Formula, then type Topic.Formula"* set-variable wording (which implied a non-existent `Topic.Formula` variable) to *"click the **fx** (formula) option and enter `Topic.<name>`."* — and added a TIP explaining the global/topic same-name validation rule (#216, #217).
- `agent-builder-m365` lab Use Case #1: removed the *"If the proposed agent has a name other than Copilot Teacher…"* conditional. Beginners had no way to check the proposed name yet (the Configure tab where the name is visible isn't introduced until later in the lab), so the conditional was unanswerable. Step is now unconditional — applying the prompt is harmless if the proposed name was already correct (#284).
- `agent-builder-m365` lab Use Case #1: split the dual-URL knowledge-source prompt (*"Use … and … as knowledge sources"*) into two sequential single-URL prompts. Agent Builder was observed to register only one of the URLs when both appeared in a single prompt; splitting them is reliable per the reporter (#283).
- `core-concepts-variables-agents-channels` lab UC3: the Channels page entry was renamed from *"Teams and Microsoft 365 Copilot"* to **"Microsoft 365 and Microsoft Teams"**, and the *"Turn on Teams" / "Enable"* control was replaced with a *"Make agent available in Microsoft 365 Copilot"* checkbox. Updated the Channels page reference, replaced the obsolete activation step with the checkbox action, and inserted the previously-missing step to re-select the channel after the in-panel publish so the activation flow makes sense (#285).
- `core-concepts-analytics-evaluations` lab: prerequisites previously claimed *"even test conversations count for analytics data"* — they don't. Rewrote the prereq to require a **published** agent used through a **deployed channel**, and added a NOTE clarifying that test-canvas conversations may not populate analytics so learners can prep their data before Use Case #1 (#287).
- `core-concepts-analytics-evaluations` lab: Use Case #2 *Manually Create Test Cases from Test Canvas* — removed the obsolete *"Select New evaluation"* and *"In More ways to start, select Use your test chat conversation"* steps that no longer match the current UI (Copilot Studio now jumps straight from **Evaluate** to the new test-set view). Renumbered the surviving "Change the test set name" step from a leftover hardcoded `21.` to a continuous `1.` so the rendered list flows cleanly. Added a NOTE explaining the UI change for learners following older instructions (#286).
- `mcs-tools` lab: replaced four occurrences of *"Turn off / disable **Use general knowledge**"* with *"Turn off / disable **Allow ungrounded responses**"* to match the renamed Copilot Studio toggle. Updated surrounding NOTE / "Lessons learned" lines to use the new toggle name; left a brief historical reference to the prior label in one NOTE so existing learners can match what they remember (#288).
- `mcs-governance` lab: Yellow Zone (Part 2) and Red Zone agent-creation flows previously told learners to "double-check that the correct **Solution** is selected" before any Solution had been created in the `Bootcamp Yellow` / `Bootcamp Red` environments — Solutions are environment-scoped, so the Green Zone Solution was not available. Mirrored the Green Zone pattern by inserting a **Create a Solution** sub-section in each zone (using the same `<username>` naming convention) and rewording the agent-creation step to "select the Solution you just created" (#289).
- Lab Assistant greeting-card "topic starter" tiles (Product / Pricing / How-To) were unreadable in Dark and High-contrast themes — Adaptive Card SDK baked a near-white inline `background-color` on the tile while the site's `.ac-textBlock` override forced the label to white, producing white text on white. Repaint the tile with `--color-bg-elevated` in Dark / HC / system-dark and invert the bundled monochrome tile icons so they stay visible.
- Restore lab content overwritten by the redesign merge (PR #265). The `_labs/*.md` collection was frozen at 2026-03-06 and missed subsequent content PRs (#215, #224, #225, #234, #242, #244, #245, #248, #249, #250, #251, #252, #253, #254, #255, #256, #257, #258). Rewrote every lab body from the authoritative `labs/*/README.md` source.
- Re-apply PR #246 orphan-lab removal: delete `public-website-agent` and `ask-me-anything-30-mins` (lab files and navigation entries) that returned after the redesign merge.
- Secondary-gray text tokens (TOC titles, timestamps, placeholders, hints) darkened to pass WCAG 2.1 AA contrast; previously several fell between 1.8:1 and 3.3:1.
- Visible keyboard focus ring on the Lab Assistant send input; previously `outline: none !important` stripped it with no fallback.
- Lab Assistant decorative SVG icons now carry `aria-hidden="true" focusable="false"` so screen readers skip them.
- Lab Assistant send input is now associated with a `<label>` (`Message Lab Assistant`) — placeholder alone was not sufficient for assistive tech.
- Lab Assistant panel announces with `role="dialog"` + `aria-labelledby` and exposes `aria-expanded` on its trigger; previously announced as a generic complementary region with no expanded state.

## 3.2.0 - 2026-03-20

### Added
- Presentation decks added to presentations folder (#227)
- Presentations folder structure (#205)

## 3.1.0 - 2026-02-26

### Added
- Optional Work tab experience steps to agent-builder-m365 lab (#190)
- Bug Bash guide for reporting lab issues (#151)
- Report Issue button to site navigation (#152)
- mcs-governance lab, mcs-in-a-day-v2 event (#149, #150)
- Required solution files for labs (#145)
- New ALM consolidated lab combining setup-for-success and pipelines (#143)
- Copilot Studio Tools lab (#142)
- Dataverse MCP Connector lab (#140)
- New Component Collections lab (#139)
- Dataverse search steps (#137)
- Copilot Studio bootcamp labs (#129)

### Changed
- Use README as source of truth for lab durations (#161)
- Update BUG-BASH.md portal link to point to bootcamp event page (#160)
- Refine instructions for Copilot Studio agent creation (#157)
- Updates from testing (#155, #156)
- Update component collection name and contents in Component Collections lab (#147)
- Update root README with all labs (#146)
- Update core-concepts-variables-agents-channels from testing (#144)
- Update multi-agent lab copy (#128)
- Update licensing guide and file size (#130)
- Refactor core concepts into three focused labs (#131)

### Fixed
- Fix note callout formatting in governance lab (#199)
- Revise prompt for visual sales chart in README (#169)
- Refine summary of prompt in README (#170)
- Update governance lab agent URLs and fix Dockerfile multi-arch support (#197)
- Add missing mcs-governance lab to README table (#154)
- Fix mcs-ALM 404 by renaming folder to lowercase mcs-alm (#153)
- Fix grammar and spelling throughout multi-agent lab (#138)
- Restore multi-agent indexing (#136)

## 3.0.0 - 2026-01-28

### Added
- New multi-agent lab (#122)
- Human-in-the-loop lab — expense claims with approvals (#118)
- Setup-for-success added to buildathon 1-month journey (#113)
- Workflow concurrency controls (#112)

### Changed
- Update top-level docs for multi-agent lab (#124)
- Multi-agent lab: Remove indexing instructions (#123)
- Update bootcamp docs (#119)
- Update AI builder labs (#111)

### Fixed
- Add .gitignore for data config (#121)
- Fix typo in lab instructions (#120)
- Add tip to Ask Me Anything lab (#116)
- Fix minor typos (#110)

## Unreleased

### Added
- Simplified single-source configuration format (ADR-012)
  - Labs now defined once in `labs:` section with all properties (title, difficulty, duration, section, order, journeys, events)
  - Adding a new lab requires ONE entry instead of 3-6
  - Automatic conversion layer maintains backward compatibility with Jekyll templates
- Enhanced configuration audit in Check-LabConfigs.ps1
  - Duplicate lab ID detection
  - Journey card vs left navigation count validation
  - Multi-line YAML array parsing support
- Agent Academy external lab integration
  - Links to microsoft/agent-academy Recruit Level curriculum
  - 13-lesson curriculum covering agents, LLMs, and deployment
- YAML export function in Generate-Labs.ps1
  - Serializes converted config to `_data/` for Jekyll templates
  - Handles PowerShell hashtables, arrays, and List types

### Changed
- **Rebranded "Copilot Studio Lite" to "Agent Builder in Microsoft 365"**
  - Renamed lab folder `copilot-studio-lite` → `agent-builder-m365`
  - Updated all lab titles, descriptions, and references across the codebase
  - Updated Microsoft docs links to new URL slugs
- Generate-Labs.ps1 now calls Check-LabConfigs.ps1 directly instead of embedding audit logic
- Order numbering scheme updated to 100-699 range (all 3-digit)
- NEW_LAB_CHECKLIST.md simplified to reflect single-entry workflow

### Fixed
- Duplicate lab counting in card vs nav validation (reset currentLab after section exit)
- List type serialization in YAML export (handles System.Collections.Generic.List)
- External lab order not being applied (was always 999, now reads from config)

## 2.6.0 - 2025-11-19

### Added
- Events dropdown navigation system for improved scalability (#89)
  - Replaced flat event links with collapsible dropdown in header
  - Added support for 5 events: Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon (1 day), Agent Build-A-Thon (1 month)
  - Implemented JavaScript toggle behavior (click, outside click, ESC key)
  - Added ARIA attributes for accessibility
- Two new Build-A-Thon event pages (#89)
  - Agent Build-A-Thon (1 day) with 2 labs
  - Agent Build-A-Thon (1 month) with 8 labs including autonomous AI agents
- Event context banner system (#89)
  - Dynamic banner shows current event context when viewing labs with `?event=` parameter
  - Left navigation title changes to "Event Navigation" in event context
- Comprehensive CHANGELOG.md documenting project history from June 2025 to present (#90)

### Changed
- Improved button styling across all theme variants (#89)
  - Added `--text-on-accent` CSS variable to Rich and Minimal themes
  - Fixed text contrast issues in all 4 theme combinations

### Fixed
- Button text contrast issues across all 4 theme variants (#89)
- Duplicate emoji display in event context banner (#89)

## 2.5.0 - 2025-10-27

### Added
- Guild Hall Custom MCP lab with Windows curl syntax (#54, #78, #81, #86)
- PR merge verification step in workflow documentation (#76)

### Changed
- Updated BYOM lab to focus on Chit Chat Generator with grok-3-mini (#80)
- Switched Azure AI Workshop lab order - Data Fabric Agent now Lab 4, Guild Hall MCP now Lab 5 (#79)
- Enhanced Dataverse MCP connector lab content (#77)

### Fixed
- TOC regex capturing all content after horizontal rules (#85)
- TOC anchors with emoji headings preserving leading dashes (#84)
- Minor formatting and clarification improvements (#83)
- Broken image references and Azure region updates (#82)
- Standardized lab resource placeholders in contract-alerts-azure-ai (#87)

## 2.4.0 - 2025-10-26

### Added
- MCS in a Day event page with unified event system (#67)
- Automated lab configuration auditing system (#74)
- Copilot Studio Lite progressive learning lab (#63)

### Changed
- Enhanced BYOM lab with screenshots and improved instructions (#75)

### Fixed
- Consistent header layout between rich and minimal themes (#75)
- Correct image filename reference in dataverse-mcp-connector lab (#75)

## 2.3.0 - 2025-10-25

### Added
- Bring Your Own Model (BYOM) lab (#65)
- Contract Alerts Azure AI lab with Azure setup reference and accessibility improvements (#64)
- Automated H2-only TOC generation with truncation bug fix (#66)

## 2.2.0 - 2025-10-24

### Added
- Data Fabric Agent lab with CSS improvements (#55)

### Fixed
- Removed duplicate script block causing redundant function definitions (#56)
- Escaped pipes in markdown link text to prevent table parsing (#59)
- Added missing HTML comment opening tag in default layout (#60)
- Updated callout wording in dataverse-mcp-connector lab (#61)

## 2.1.0 - 2025-10-23

### Added
- Guild Hall MCP lab (#54)

## 2.0.0 - 2025-10-17

### Added
- Markdown detection feature and improved fenced code block formatting (#52)

### Changed
- Complete apostrophe spacing resolution with Kramdown configuration (#50)

### Fixed
- Apostrophe spacing issues in HTML rendering (#48)

## 1.9.0 - 2025-10-16

### Added
- Comprehensive bootcamp navigation system with section filtering (#45)

### Changed
- Enhanced lab instructions for Lab 4 and other bootcamp labs (#46, #47, #49)

## 1.8.0 - 2025-10-15

### Added
- Scroll-to-top button on lab pages (#42)
- Web portal link to README for better user experience (#43)

### Changed
- Complete theme system overhaul with major infrastructure cleanup (#41)

### Fixed
- Hide lab numbers from both lab cards and left navigation (#44)

## 1.7.0 - 2025-10-13

### Fixed
- Major navigation fixes and UX improvements for lab browser (#39)

## 1.6.0 - 2025-10-06

### Added
- Comprehensive documentation pipeline for GitHub Pages enhancement (#37)

### Fixed
- Markdown formatting issues in autonomous-account-news lab (#38)

## 1.5.0 - 2025-10-03

### Changed
- Revised Dataverse connector configuration (#36)
- Updated autonomous lab instructions (#34, #35)
- Revised topic addition steps in README (#33)

## 1.4.0 - 2025-10-02

### Added
- 30-minute version of Ask Me Anything lab (#33)

### Changed
- Updated labs to add tips and place Teams chat as extra challenge (#32)

## 1.3.0 - 2025-10-01

### Changed
- Revised Nova AI setup and interaction instructions (#28)
- Clarified connector names and commit message examples (#27)
- Updated agent configuration and file handling instructions (#26, #25)

### Fixed
- Fixed URLs and improved step instructions (#29)

## 1.2.0 - 2025-09-29

### Changed
- Updated CUA lab to use hosted browser instead of hosted machine (#24)
- Renamed "Agent Builder" to "Copilot Studio Lite" (#23)

## 1.1.0 - 2025-09-22

### Changed
- Modified Excel knowledge to file upload in contract alerts lab (#22)
- August retrospective updates for workshop agent (#21)

## 1.0.0 - 2025-08-18

### Changed
- Replaced poem by city in lab content (#15)

## 0.4.0 - 2025-07-24

### Fixed
- Documentation updates and README improvements (#13, #14)

## 0.3.0 - 2025-07-15

### Added
- Autonomous agents with CUA lab (#12)
- MCP Qualify Lead lab (#11)

## 0.2.0 - 2025-06-30

### Added
- Standard Orchestration lab (#9)

## 0.1.0 - 2025-06-20

### Added
- MBR prep SharePoint agent lab (#7)
- Account news autonomous agent lab (#4)

### Fixed
- Blockquote formatting (#5)

### Security
- Added Microsoft SECURITY.MD (#2)

## 0.0.1 - 2025-06-11

### Added
- Initial repository setup with Microsoft mandatory files
- Agent Builder Web lab
- Ask Me Anything lab
- Setup for Success lab
- Lab template for contributors
- Journey-based navigation (Quick Start, Business User, Developer, Autonomous AI)
- Multi-theme system (Rich/Minimal × Light/Dark)
- Automated PDF generation from markdown
- Docker-based development environment
- PowerShell automation scripts for lab generation
- README with project overview and setup instructions
- LICENSE file
