# Event agendas

One YAML file per event, named `<event_id>.yml`. The site falls back to the event's `labs:` array in its markdown front-matter when no agenda file exists, so adding agenda data is opt-in per event.

## Schema

```yaml
event_id: bootcamp
schedule:
  - type: session
    title: "Welcome & orientation"
    description: "Meet your instructors and review the day."
    time: "09:00"
    duration: 30
    speaker: "Dewain Robinson"

  - type: lab
    slug: agent-builder-m365
    label: "Lab 1"
    time: "09:30"
    duration: 45

  - type: break
    title: "Coffee break"
    time: "10:15"
    duration: 15

  - type: lab
    slug: core-concepts-agent-knowledge-tools
    label: "Lab 2"
    time: "10:30"
    duration: 60

  - type: link
    title: "Optional reading: Agent orchestration patterns"
    url: "https://learn.microsoft.com/..."
    description: "Deep dive for attendees who finish early."
    time: "12:00"
    duration: 0
```

## Item types

| `type`    | Required fields       | Optional fields                              | Notes |
|-----------|-----------------------|----------------------------------------------|-------|
| `module`  | `slug`, `label`       | `title`, `description`, `time`, `duration`, `slides`, `lab` | `slug` must match a file in `_modules/`. Set `lab: false` when the companion lab has its own explicit row or is not delivered. |
| `lab`     | `slug`, `label`       | `title`, `time`, `duration` (overrides the lab's own) | `slug` must match a file in `_labs/`. Links auto-resolve. |
| `session` | `title`               | `description`, `speaker`, `time`, `duration` | Instructor-led content with no lab page. |
| `break`   | `title`, `duration`   | `time`                                       | Coffee, lunch, stretch breaks. Visually lighter row. |
| `link`    | `title`, `url`        | `description`, `time`, `duration`            | External reading / resource. Opens in a new tab. |

## Adding a new event

1. Create `_events/<event_id>.md` with the usual front-matter (`title`, `description`, `event_id`, `order`). The `labs:` array is optional.
2. Create `_data/agendas/<event_id>.yml` with the full schedule, OR skip the agenda file and rely on the `labs:` fallback.
3. Rebuild. The event detail page renders the timeline, and every lab in the event gets in-lab navigation automatically.

## Bootcamp Latest

The canonical event ID, event document basename, agenda basename, and
presentation directory use `bootcamp-latest`. Public links use
`/events/bootcamp-latest/` and `?event=bootcamp-latest`. The former versioned
event URL redirects to the current event. Legacy module/lab context links also
resolve to their current counterparts; old presentation download URLs remain
retired.

`bootcamp-latest.yml` is the source of truth for 17 modules and 11 labs. Its day
boundaries are 09:00-16:00, 09:00-18:00 (including the social), and 09:00-16:00.
Module and lab titles and durations are mirrored into the linked entity files,
except for the shared Hooks lab: Lab 7 uses `mcs-hooks` with a 30-minute event
slot while the standalone lab remains 45 minutes. Lab 6 uses
`mcs-skills-authoring` with a 30-minute core lab; Skill creation is optional
extra credit outside that timebox.

Lab slugs follow `mcs-<module-slug>`. The standalone Copilot Code lab has no
dedicated module row and uses `mcs-copilot-code`. The shared Skills and Hooks
labs retain their `mcs-skills-authoring` and `mcs-hooks` slugs and their
`instructions-skills-runtime-and-sandbox` and `metadata-and-hooks-deep-dive`
module associations, respectively.
Keep the event's fallback
`labs:` list in `_events/bootcamp-latest.md` in the same order as the agenda.
Explicit lab rows are authoritative for hero counts and timing, so preceding
companion-module rows use `lab: false`.

Module 17, Copilot Agent Kit, runs on Day 3 at 15:00 for 30 minutes, followed
by General Q&A at 15:30 for 30 minutes. It has no companion lab.

### Legacy event links

The [event alias definitions](../event-aliases.yml) map the former event ID and
renamed module/lab slugs to the current curriculum. Instructions and Skills
module links resolve to the combined topic, while lab links resolve to
Instructions and Skills Authoring. Items no longer scheduled in the latest
agenda resolve to the event overview instead of an unrelated replacement.

Compatibility pages use the [redirect layout](../../_layouts/redirect.html)
outside the event/lab collections, so they do not create duplicate catalog
entries. The former Standard Harness lab URL also has a compatibility page.
Redirects preserve query parameters and fragment anchors when JavaScript is
enabled; the standalone pages provide a no-JavaScript refresh and clickable
fallback. GitHub Pages serves these as HTML redirects, not HTTP 301 responses.

Event navigation rewrites only configured legacy event IDs. Saved legacy
context is normalized when the current item is still in the latest agenda;
unrelated standalone pages are not redirected by saved context. Other event
and workshop contexts retain their existing behavior.

These aliases do not restore old presentation download paths or redirects on
GitHub's raw/media hosts.

### Shared content and delivery dependencies

| Other delivery | Shared content / original lab slugs |
| --- | --- |
| Agent in a Day V3 (`agent-in-a-day-v3`) | Modules `agents-workflows-making-them-real`, `m365-copilot`, `cowork`, `harnesses-and-component-models`, `copilot-harness`, and `github-copilot-harness`; original labs `m365-copilot-frontier-agents`, `cowork-hands-on`, `mcs-github-harness`, and `mcs-workflows`; original `workflows` module. |
| Advanced Agent in a Day (`advanced-agent-in-a-day`) | Original `workflows` module and labs `mcs-tools` and `mcs-workflows`. |
| GHCP in a Day (`ghcp-in-a-day`) | Original `workflows` module and `mcs-workflows` lab; shared `mcs-github-harness` lab links back to the standalone `github-copilot-harness` module, while the agenda uses its own dedicated module and deck. |
| Original Bootcamp (`bootcamp`) | Original `mcs-tools` lab. |

Bootcamp-specific lab copies preserve the original shared Markdown files:

| Original shared lab | Bootcamp Latest lab |
| --- | --- |
| `m365-copilot-chat-work-iq` (derived from `m365-copilot-frontier-agents`; Researcher and Analyst as extra credit) | `mcs-m365-copilot-latest` |
| `cowork-hands-on` | `cowork-zava-sales` (new scenario; the classic `mcs-cowork-latest` remains available) |
| `mcs-tools` | `mcs-knowledge-and-tools-deep-dive` |
| `mcs-workflows` | `mcs-workflows-latest` |

The Zava Sales lab has its own images and opts into guided missions; other labs
retain their classic rendering. Before delivering it, verify that the assigned
account can find the Northstar renewal through **Chat business-data search** and
can connect the **Cowork Dataverse plugin** to the training CRM. These are separate
capabilities: a working Dataverse connection does not establish Chat grounding.
The optional Friday exercise needs real accessible feedback to demonstrate skill
improvement; configuring a schedule alone is not evidence that it has run.

The other copied labs reuse images and downloads from their original lab folders via
relative links; those asset folders remain dependencies. Do not remove them
when editing or retiring an original lab. Workflows also has a Bootcamp-only
module, `workflows-latest`, to avoid changing the shared module's duration.
Both `mcs-workflows` and `mcs-workflows-latest` now have a 30-minute core
(Use Cases 1–3). Inventory management and the price-quote specialist are
optional extra credit outside that allocation. CAT-led events prepare the
prerequisites; independent learners follow the self-guided setup in each lab.
The shared and Bootcamp-only module durations remain separate from lab pacing.

The six shared source modules retain their previous titles, durations, and
companion associations. Bootcamp Latest uses `-latest` copies of those modules,
including the opening ecosystem module, M365 Copilot, Cowork, Copilot harness,
Harnesses/Orchestration, and Workflows. Other deliveries keep their original
module and lab slugs. Only slide links change to follow the renamed, otherwise
unchanged deck files.

### Presentations and placeholders

Modules 1-16 link to their numbered `M01`-`M16` decks under
`presentations/bootcamp-latest/`. Module 17 retains the existing
`Copilot Studio Kit.pptx` filename in that directory. Renaming a deck requires updating every active
`slides:` reference, including other workshop agendas. Existing deck contents
are preserved; renumbering does not rewrite the titles inside the slides.

Empty `.pptx` placeholders are valid PowerPoint packages with no slides for:

- M09 Customer Conversation Harness
- M10 Managed Apps
- M12 Agent Integration
- M16 Agent Identity

M07 Instructions & Skills now contains the original 10-slide Instructions &
Descriptions deck. The separate Skills deck is still a merge source; do not
treat the combined filename as a completed merge.

Standalone modules use byte-preserved copies in `presentations/shared/` so
merging the Bootcamp Latest decks does not change other deliveries:

| Standalone module | Preserved filename in `presentations/shared/` |
| --- | --- |
| `instructions-and-descriptions` | `M05. Deep Dive - Instructions and Descriptions.pptx` |
| `agent-skills` | `M06. Deep Dive - Skills.pptx` |
| `github-copilot-harness` | `M10. GitHub Copilot Harness Component Model.pptx` |
| `creation-github-harness` | `M11. Creation GitHub Harness from UX and from Chat.pptx` |
| `governance-and-agent-365` | `M17. Governance Managed Environment and Agent 365.pptx` |

M06 uses the scheduled New Copilot Studio Harnesses deck; its two former
GitHub Harness merge-source files have been removed. Keep the remaining Latest
authoring sources in place for their planned merges: Skills uses `M07` and
Multi-Agent uses `M12`. Standalone modules must not link to these working merge
sources or adopt a composite deck without an explicit content decision.

The Latest Multi-Agent merge source has no active references. The shared
`multi-agent` module, used by the original Bootcamp, keeps its original deck in
`presentations/bootcamp/`. The Governance deck has moved to
`presentations/shared/` and remains linked from its standalone module, but is
not scheduled in Bootcamp Latest.

Placeholder module/lab pages explicitly state that content is coming soon.
The Knowledge, Tools & Hooks lab currently carries the Tools/MCP exercises;
knowledge and hooks exercises are pending. Shortened lab slots do not silently
shorten reference exercises: pacing notes identify the longer reference
duration, selected core exercises where defined, and follow-up work. M365
Copilot Chat and Standard Harness still need an instructor-selected subset.
