# Learning design for labs and modules

Labs fail when learners skim a wall of text, copy steps without understanding them, and
forget them by the next day. These principles keep the learner doing, noticing and
recalling. They apply to both formats; the guided exercise format builds most of them into its
layout.

Apply the writing rules to module descriptions, overviews and lab handoffs too.

| Principle | What it means in a lab | Check |
| --- | --- | --- |
| **Start from the task** (minimalist instruction) | Learners want to do real work immediately and skip preambles. | The first instruction is visible without scrolling past background. Concepts are a short table or a reveal, not paragraphs before step 1. |
| **Show the finish line** | A concrete goal focuses attention and gives a reason to persist. | The outcome or artifact is stated in one sentence at the top and per section. |
| **Recognize the result** | Learners distinguish generated claims from work that actually exists. | Where that distinction caused friction, optional `result_check` names observable evidence near completion (an opened artifact, persisted record or returned delegation). Reuse existing verification text; no extra checkbox, quiz gate or generic coaching. Test-run provenance belongs in maintainer logs and PRs, never in the published lab. |
| **One task per step** (segmenting) | Task-sized steps reduce cognitive load without turning every click into a checkpoint. | Group short actions toward one result. Split unrelated tasks, separate conversation turns and conditional replies. |
| **Signal, don't narrate** (signaling, coherence) | Highlight the essential and cut the decorative. | UI labels are **bold**, prompts are in their own code block, and every sentence would be missed if deleted. |
| **Guidance that fades** (worked example, then practice) | Novices need the exact path; experienced learners need room. | Default steps are complete. Extra detail sits in `help`, "Show me" screenshots or a `<details>` block, not in the main step. The exercises `instruction` must carry the step even when help is open; help is supplementary regardless of renderer default. An optional "try it yourself" follows the guided path. |
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
  duration unless the organizer approves a change. Exercise minutes are pacing estimates,
  not measured completion times. Learners see at most one plain pacing sentence naming
  the core and optional exercises: no minute arithmetic, "if time permits", or proctor and
  account notes.
- **Keep prepared and own-tenant paths separate.** Put own-tenant provisioning in
  `mission_lab.self_setup` and a closed setup disclosure in both readable copies.
  `prerequisites` contains attendee readiness, not another setup wall. Do not add copying,
  connection repair or owner checks just because the automated runner needed them.
  Prepared workflows can still require learner-created connections. Include required
  node connection setup before publication, including approval nodes and branches not
  used by the first test; do not assume an imported workflow has every connection.
- **Do not turn maintenance into learner work.** Run history, blocked/unverified coverage,
  credit measurements and screenshot provenance belong in logs and PRs. Keep real
  approvals, grounding, persistence and recovery exercises; do not strip a legitimate
  product concept or a supplied prompt merely because it uses words such as "test".
  Knowledge checks target product misconceptions, not the runner's coverage.
- **Do not prescribe work habits.** Say which service to open, not how to arrange windows.
  Omit generic headset, quiet-room and split-screen coaching. Result cues name a useful,
  observable outcome; they are not pass/fail forms or completion gates.
- **Keep cleanup contextual.** When organizers delete the training environments, omit
  shutdown, off-state verification, test-data removal and cleanup exercises from attendee
  instructions. Put any necessary own-tenant cleanup in the expandable setup guidance.
  Automated runners still stop their own schedules and protect shared assets under
  `lab-runthrough`; that operational duty is not an extra learner exercise.
- **Choose images for the step.** The hero shows the app, agent or useful result, not a
  setup/approval checkpoint. Each **Show me** shows one relevant image; a design reference
  means the actual supplied reference, not its upload thumbnail. Captions describe the
  visible state, including Preview versus published and the selected option. Full-size
  links open one picture, not a page-wide carousel.

## Writing rules

- Use **exercise** consistently in learner-facing headings, instructions,
  navigation, progress messages and cross-references. Call the format a **guided lab**.
  Keep internal compatibility names (`lab_format: missions`, `mission_lab`, `missions`,
  `mission-` filenames, CSS/data attributes, IDs and storage keys) unchanged.
- Write clear, direct sentences in plain language. Remove AI filler: promotional
  claims, grand metaphors, generic encouragement, repeated summaries and vague phrases
  such as "unlock the power" or "embark on a journey". Say what to do, where to do it
  and what result to expect; delete wording that adds none of these. Use literal
  headings and questions that name the concept: say what is included, reused or
  required instead of describing artifacts as "travelling".
- Write descriptions and introductions like a teacher explaining the lesson:
  name the topic, explain what learners will do and say what they will learn or
  produce. Use complete, ordinary sentences, not slogans, dramatic fragments,
  futuristic claims or forced role-play. Keep necessary scenario details and
  limits, but explain unfamiliar terms. Apply this voice to catalogue descriptions,
  hero headlines, introductory summaries and scenario text, and mirror it in the
  README and site body.
- Name the actual file or artifact and the relevant step. When a supplied starter or
  earlier work can be used, state the alternatives together and explain only necessary
  compatibility requirements. Do not invent file names or add restrictions the
  exercise does not require.
- Start each step with a verb: **Select**, **Open**, **Paste**, **Confirm**.
- Group short actions that complete one task, such as creating and naming an agent
  or attaching a file and sending its prompt. Do not make each click a separate step.
  Keep separate conversation turns, conditional replies and result checks distinct.
  Say **message box**, not interface jargon, when telling learners where to type.
  If grouping guided steps changes their positions, preserve retained progress IDs
  with explicit step `id` values.
- Use the product's exact current label, in **bold**. Do not describe icons by color only.
  When an icon has no verified text label, identify its symbol, location and purpose
  rather than inventing a tooltip or menu label. Distinguish instruction sections
  from UI controls, name the tab or designer surface when needed to locate a control,
  and apply corrected labels to repeated steps and troubleshooting too.
  Distinguish tools added inside an agent from connector nodes added to a workflow.
  For run inspection, give the workflow, Activity tab, run selection and node to
  open separately; do not present a run diagram's path as a navigation menu.
  Put checks where the result can actually be observed, not before it exists.
  Distinguish temporary **Run node** test inputs from **Configure** values that must
  retain dynamic bindings. When learners confuse them, show the selected tab and
  exact test field in a focused screenshot and explicitly preserve the configuration.
  Identify the connector as well as the action when different services share a name,
  such as Office 365 Outlook and Outlook.com.
  Use the same plain, scenario-specific
  term for an input throughout the lab instead of introducing unexplained synonyms.
- Keep prompts verbatim and copyable. Do not paraphrase a prompt in prose.
  When text needs a dynamic value, provide one complete copyable block with a
  distinctive placeholder, not separate fragments to assemble around a token.
  Explain exactly which placeholder to replace, how to insert the dynamic value
  and which surrounding spaces or punctuation to keep. Make clear that the
  placeholder must be replaced, not left as literal text or filled in manually.
- Do not hard-wrap a prompt mid-sentence. Learners paste it as typed, so a source line
  break becomes a break in their prompt. Keep each sentence or paragraph on one line in
  front matter and both bodies; keep the line structure of lists, signatures, trigger
  phrases and expected output. `scripts/prompt-wrap.test.js` checks exercise prompts only,
  so check classic `text` fences by eye.
- Link a file learners download or upload to the file itself, not a preview page. On
  GitHub use `https://github.com/<owner>/<repo>/raw/refs/heads/main/<path>`, not
  `/blob/`, with the same URL in every copy. Links for reading a file in place may stay
  on `/blob/`.
- Preserve sample emails, expressions and expected-output blocks too, including unlabelled
  fences. Keep expected output out of `prompt`; compare occurrence order and duplicates
  across exercise front matter, site body and README, not only a set of prompt strings.
- State time honestly. Budgets are for the median learner, including waiting for AI output.
- Prefer one good screenshot of the decisive state over many screenshots of every click.
- Alt text describes the state that matters ("Dataverse connected to zavasalesdemo"), not
  the image type ("screenshot of settings").
- Put product facts in sources the learner can open, and recheck them when the product ships.
- Distinguish saving from publishing, including dependencies. For hooks, publish
  the workflow, then save and publish the agent after adding the hook, even if the
  agent was already published. Put this before testing each new hook; Preview does
  not remove that requirement. Keep outcomes and troubleshooting consistent.
- Reject maintenance diaries in learner copy, including expandable "What was tested"
  sections, test dates, screenshot-capture provenance and automated-runner limitations.

## Learn from corrections

For every lab or module correction:

1. Apply these best practices to the affected learner-facing text and all maintained
   copies, including rendered front matter and readable Markdown.
2. Identify the reusable lesson behind the correction. If an existing rule covers it,
   apply that rule; clarify it when the correction exposes a gap. Otherwise add a short,
   actionable rule here. Do not append a correction diary, duplicate a rule or turn
   one scenario's requirement into a universal restriction.
3. Keep affected skill instructions, creation templates, review-rubric checks and
   contract tests aligned in the same change. Preserve supplied prompts, product labels,
   URLs, internal IDs and behavior unless the correction explicitly changes them.
4. Validate the affected contracts and mention any guidance changes in the handoff.
   Read-only reviews and run-throughs propose the reusable rule for `lab-update` rather
   than editing repository files themselves.
