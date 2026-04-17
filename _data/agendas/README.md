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
| `lab`     | `slug`, `label`       | `time`, `duration` (overrides the lab's own) | `slug` must match a file in `_labs/`. Links auto-resolve. |
| `session` | `title`               | `description`, `speaker`, `time`, `duration` | Instructor-led content with no lab page. |
| `break`   | `title`, `duration`   | `time`                                       | Coffee, lunch, stretch breaks. Visually lighter row. |
| `link`    | `title`, `url`        | `description`, `time`, `duration`            | External reading / resource. Opens in a new tab. |

## Adding a new event

1. Create `_events/<event_id>.md` with the usual front-matter (`title`, `description`, `event_id`, `order`). The `labs:` array is optional.
2. Create `_data/agendas/<event_id>.yml` with the full schedule, OR skip the agenda file and rely on the `labs:` fallback.
3. Rebuild. The event detail page renders the timeline, and every lab in the event gets in-lab navigation automatically.
