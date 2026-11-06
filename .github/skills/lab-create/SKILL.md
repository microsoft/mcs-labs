---
name: lab-create
description: Create a new MCS Labs hands-on lab in the classic format (README plus _labs page with a long-form use-case walkthrough) or the guided missions format (lab_format missions with copyable prompts, reveals and knowledge checks), then wire it to its module and event agendas, preview it unlisted and validate it. Use when asked to create, add, draft or scaffold a lab, turn prompts or a demo script into a lab, convert a lab to missions, or add a new lab to a bootcamp or event. Not for fixing an existing lab (use lab-update) or auditing one (use lab-review).
---

# Create a lab

A lab is two hand-written copies plus images. `labs/<slug>/README.md` is what GitHub
readers see; `_labs/<slug>.md` is the published page and carries the front matter.
CI (`scripts/check-lab-sync.js`) fails a PR that changes the README without the
`_labs` copy. The authoring contract is `docs/NEW_LAB_CHECKLIST.md`: read it first and
treat it as the source of truth. This skill adds the decisions and the order of work.

## 1. Choose the format

| Choose | When |
| --- | --- |
| **Missions** (`lab_format: missions`) | A product tour driven by prompts and UI choices, 20–45 minutes, where each section should end with a "why it worked" reveal and a quick check. The reference lab is `cowork-zava-sales`. |
| **Classic** (default) | Long builds with many configuration steps, code or large tables; labs that several deliveries share; external labs (front matter stub only). |

Missions is opt-in per lab and must not change other labs. Do not convert a shared lab
in place: copy it to a new slug for the delivery that needs the new format.

## 2. Gather inputs before writing

Ask for anything missing, one question at a time:

- Slug (kebab-case, unique across `_labs/` and `labs/`), title, one-sentence description.
- Persona and level (100, 200 or 300), journeys, section, duration in minutes.
- Parent module slug, and which events or agendas should list the lab.
- The **finish line**: the artifact the learner leaves with.
- Prompts the requester supplied. Keep supplied prompts **verbatim**; never "improve" them.
- Environment: tenant, accounts, licenses, connectors or plugins the facilitator prepares.

Confirm with the requester before adding a lab to an advertised (listed) event or
replacing a lab in an existing agenda.

## 3. Design for doing, not reading

Apply `../lab-review/references/learning-design.md` while drafting. In short:

- One outcome per section, stated up front; the learner acts within the first screen.
- Steps start with a verb and name the exact UI label in **bold**.
- Every prompt sits alone in a `text` code fence so it can be copied.
- Explain *why* after the learner has seen it work (the reveal), not before.
- Mark what is optional. Budget minutes per section; they must add up to `duration`.
- Attendees of a CAT-led event use a pre-set-up environment. Classic prerequisites open
  with the template's "Skip this section" callout; missions `prerequisites:` list only
  what the attendee does to get ready, never tenant setup. Put downloads in the step
  that uses them.
- Ground every product claim in a current Microsoft Learn page and cite it.

## 4. Scaffold the files

Templates are in `templates/`. Replace every `%%PLACEHOLDER%%` and delete every
`TEMPLATE NOTE` comment; `grep -rnE '%%|TEMPLATE NOTE' labs/<slug> _labs/<slug>.md`
must return nothing before you commit.

| Format | `labs/<slug>/README.md` | `_labs/<slug>.md` |
| --- | --- | --- |
| Classic | `templates/classic-README.md` | `templates/classic-site.md` |
| Missions | `templates/missions-README.md` | `templates/missions-site.md` |

Then:

1. **Headings.** README headings carry an emoji (house style); `_labs` headings never do.
   The hand-written table of contents must use the ids each renderer generates:
   `## 🧭 Lab Details` is `#-lab-details` on GitHub and `## Lab Details` is `#lab-details`
   on the site. An emoji with a variation selector (🛠️, ⚙️, ✍️) keeps U+FE0F in the GitHub
   id, so the link is `#️-instructions-by-use-case`. Do not guess: the audit checks every
   anchor.
2. **Order.** `order` is one global sort. Pick a free number next to the labs it should
   sit beside (`grep -H '^order:' _labs/*.md`); the audit reports duplicates as
   `fm-order-duplicate`.
3. **Module.** `module: <slug>` needs `_modules/<slug>.md`, and that module's `lab:` should
   name this lab when it is the companion lab.
4. **Images.** Put them in `labs/<slug>/images/` and link them relatively
   (`images/name.webp`) from both copies. Capture product screenshots with the
   `lab-runthrough` skill: WebP, with light and dark pairs for product UI.
5. **Missions only.** Follow "Authoring a guided mission lab" in the checklist, and:
   - Core mission `minutes` must sum to `duration`; extensions get `optional: true`.
   - Each prompt appears identically in front matter, the `_labs` body and the README,
     in order. Use `|-` for multiline prompts so YAML adds no trailing newline.
   - Each `check` has exactly one option with `correct: true`.
   - Each step screenshot has `title`, `alt`, `caption`, and `width` and `height` that
     match the file; add `src_dark` for product UI and a `<picture>` element in both
     bodies. The hero has no `src_dark`.
   - `scripts/lab-missions.test.js` asserts which labs use missions. Add the new slug to
     that allowlist and add a contract test for the new lab modeled on the Zava Sales
     tests (prompts verbatim in all copies, copies in sync, mission contract).

## 5. Preview without touching the public site

- While the lab is in review, give it `unlisted: true`, `search: false` and
  `sitemap: false`. The URL is public but not advertised or indexed.
- List it in a preview event (for example `_data/agendas/bootcamp-preview.yml`) rather than
  an advertised one. An unlisted lab in a listed agenda is an `agenda-unlisted-lab` error.
- To ship into an advertised event later: remove the three preview flags, swap the agenda
  row's `slug`, keep the event's fallback `labs:` list in agenda order, and set `lab: false`
  on a companion module row when an explicit lab row follows it
  (`_data/agendas/README.md`).

## 6. Validate

```bash
npm run audit:labs -- <slug>      # no errors; read every warning and info line
npm test                          # unit tests, including the missions contract tests
bash tools/run.sh                 # or .\tools\run.ps1; open /mcs-labs/labs/<slug>/
```

In the browser, check images, the table of contents, Previous and Next with
`?event=<id>`, and light and dark themes. For missions also check keyboard use, a mobile
width and the page with JavaScript disabled. Then run the `lab-review` skill, and
`lab-runthrough` when a training environment is available.

## 7. Hand off

Commit both copies, images, and module and agenda changes together on a feature branch.
Add the slug to the **Which lab?** dropdown in `.github/ISSUE_TEMPLATE/lab_update.yml`
(alphabetical) so people can report problems with it. Open the PR with
`../lab-update/templates/pr-body.md`. Never merge your own PR.
