# Learning design for labs

Labs fail when learners skim a wall of text, copy steps without understanding them, and
forget them by the next day. These principles keep the learner doing, noticing and
recalling. They apply to both formats; the missions format builds most of them into its
layout.

| Principle | What it means in a lab | Check |
| --- | --- | --- |
| **Start from the task** (minimalist instruction) | Learners want to do real work immediately and skip preambles. | The first instruction is visible without scrolling past background. Concepts are a short table or a reveal, not paragraphs before step 1. |
| **Show the finish line** | A concrete goal focuses attention and gives a reason to persist. | The outcome or artifact is stated in one sentence at the top and per section. |
| **Recognize the result** | Learners distinguish generated claims from work that actually exists. | Where that distinction caused friction, optional `result_check` names observable evidence near completion (an opened artifact, persisted record or returned delegation). Reuse existing verification text; no extra checkbox, quiz gate or generic coaching. Test-run provenance belongs in maintainer logs and PRs, never in the published lab. |
| **One idea per step** (segmenting) | Small steps reduce cognitive load and make errors local. | Each numbered step has one action and at most one thing to notice. Long steps are split. |
| **Signal, don't narrate** (signaling, coherence) | Highlight the essential and cut the decorative. | UI labels are **bold**, prompts are in their own code block, and every sentence would be missed if deleted. |
| **Guidance that fades** (worked example, then practice) | Novices need the exact path; experienced learners need room. | Default steps are complete. Extra detail sits in `help`, "Show me" screenshots or a `<details>` block, not in the main step. The missions `instruction` must carry the step even when help is open; help is supplementary regardless of renderer default. An optional "try it yourself" follows the guided path. |
| **Experience before explanation** | Explanations stick when they answer a question the learner now has. | The "why it worked" reveal follows the result it explains. |
| **Retrieval and misconceptions** | Answering a question strengthens memory more than rereading does. | A short check targets a likely misconception, with feedback for each option. |
| **Recover from errors** | Learners stall when the product does something unexpected. | Each risky step has a "stuck?" note: symptom, likely cause, safe next action. |
| **Transfer** | Learning lasts when learners connect it to their own work. | The lab ends with takeaways and one reflection question about the learner's job. Learners can keep their answer: it is stored only in their browser, and they can save a PDF copy. |
| **Respect the learner's context** | Attendees start with prepared training assets. | Keep necessary actions and expected results. Explain approvals when they are part of the exercise. Do not repeat tenant warnings or add runner-specific ownership, connection or sender-check gates. Independent-tenant setup stays expandable; use the cleanup rule below. |

## Shared authoring and review rules

Apply these when creating, converting, updating or reviewing either lab format:

- **Separate source names from public identity.** Guided site copies use
  `_labs/mission-<slug>.md` with `slug: <slug>` and `permalink: /labs/<slug>/`;
  classic copies use `_labs/<slug>.md`. Keep `labs/<slug>/README.md`, asset folders,
  agenda references and public URLs unprefixed. Never start the canonical slug with
  `mission-` or keep both site copies. A display-name refresh does not rename URLs.
- **Preserve the creator's walkthrough.** Keep the scenario, use-case and teaching-step
  order, exact asset names and ordered prompt occurrences. Mark only trailing extensions
  optional; keep an earlier exercise required rather than moving it. Preserve advertised
  duration unless the organizer approves a change. Mission minutes are pacing estimates,
  not measured completion times. Learners see at most one plain pacing sentence naming
  the core and optional missions: no minute arithmetic, "if time permits", or proctor and
  account notes.
- **Keep prepared and own-tenant paths separate.** Put own-tenant provisioning in
  `mission_lab.self_setup` and a closed setup disclosure in both readable copies.
  `prerequisites` contains attendee readiness, not another setup wall. Do not add copying,
  connection repair or owner checks just because the automated runner needed them.
- **Do not turn maintenance into learner work.** Run history, blocked/unverified coverage,
  credit measurements and screenshot provenance belong in logs and PRs. Keep real
  approvals, grounding, persistence and recovery exercises; do not strip a legitimate
  product concept or a supplied prompt merely because it uses words such as "test".
  Knowledge checks target product misconceptions, not the runner's coverage.
- **Do not prescribe work habits.** Say which service to open, not how to arrange windows.
  Omit generic headset, quiet-room and split-screen coaching. Result cues name a useful,
  observable outcome; they are not pass/fail forms or completion gates.
- **Keep cleanup contextual.** When organizers delete the training environments, omit
  shutdown, off-state verification, test-data removal and cleanup missions from attendee
  instructions. Put any necessary own-tenant cleanup in the expandable setup guidance.
  Automated runners still stop their own schedules and protect shared assets under
  `lab-runthrough`; that operational duty is not an extra learner exercise.
- **Choose images for the step.** The hero shows the app, agent or useful result, not a
  setup/approval checkpoint. Each **Show me** shows one relevant image; a design reference
  means the actual supplied reference, not its upload thumbnail. Captions describe the
  visible state, including Preview versus published and the selected option. Full-size
  links open one picture, not a page-wide carousel.

## Writing rules

- Start each step with a verb: **Select**, **Open**, **Paste**, **Confirm**.
- Use the product's exact current label, in **bold**. Do not describe icons by color only.
- Keep prompts verbatim and copyable. Do not paraphrase a prompt in prose.
- Preserve sample emails, expressions and expected-output blocks too, including unlabelled
  fences. Keep expected output out of `prompt`; compare occurrence order and duplicates
  across mission front matter, site body and README, not only a set of prompt strings.
- State time honestly. Budgets are for the median learner, including waiting for AI output.
- Prefer one good screenshot of the decisive state over many screenshots of every click.
- Alt text describes the state that matters ("Dataverse connected to zavasalesdemo"), not
  the image type ("screenshot of settings").
- Put product facts in sources the learner can open, and recheck them when the product ships.
- Reject maintenance diaries in learner copy, including expandable "What was tested"
  sections, test dates, screenshot-capture provenance and automated-runner limitations.
