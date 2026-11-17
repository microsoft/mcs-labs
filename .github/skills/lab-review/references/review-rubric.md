# Review rubric

Use after the audit. Mark each item **pass**, **issue** (with evidence) or **n/a**.

## Product truth

- [ ] Product, feature and connector names match current Microsoft Learn pages. Since 2026: **Microsoft Copilot**, **Microsoft Copilot Chat** and the **Microsoft Copilot harness** (see `scripts/lab-audit-terms.json`); license SKU names stay as the price list shows them.
- [ ] UI labels in **bold** match the product today, or the review says they could not be verified.
- [ ] Repeated steps and troubleshooting use the same corrected labels. Tabs and
      designer surfaces locate controls clearly; instruction sections are not
      described as UI controls.
- [ ] Agent tools are added in the agent settings, not as workflow connector nodes.
      Activity instructions identify the workflow, run and node to inspect, and
      distinguish navigation from the run diagram. Checks follow observable results.
- [ ] Node-test samples explicitly belong in **Run node**, not **Configure**;
      dynamic bindings stay intact, and a focused screenshot identifies the tab
      and test field when that distinction has caused learner errors.
- [ ] License, credit, preview, region and admin prerequisites are current and complete.
- [ ] Prerequisites use an organizer-neutral cue for attendees with pre-provisioned accounts; own-tenant setup stays in the expandable section, while required sign-in and exercise downloads remain visible.
- [ ] Required node connections are set up before publishing prepared workflows,
      including approval nodes and untested branches. Actions shared by multiple
      services name the intended connector.
- [ ] Learner copy contains no maintainer test reports, run dates, screenshot provenance, repeated tenant warnings, or runner-specific ownership/connection/sender checks. Keep these in run logs and PRs; report provisioning defects to organizers.
- [ ] Renamed or moved features are updated everywhere, including description, intro, tables, tips and troubleshooting, not just the steps.
- [ ] Links resolve to the intended page (not a redirect to a generic landing page).
- [ ] Statements about limits, costs or availability cite a source in the lab.
- [ ] Literal pipes in Markdown prose are escaped (`&#124;`) where Kramdown could parse a table; generated HTML preserves the intended wording and list structure.

## Instructions

- [ ] Learner-facing text uses **exercise** consistently, while internal format
      names, IDs and storage keys remain unchanged.
- [ ] Wording is clear and direct: no AI filler, promotional claims, grand metaphors,
      generic encouragement or repeated summaries. Starter files and reusable prior
      work are named accurately, with alternatives and necessary requirements together.
- [ ] Descriptions and introductions explain the topic, activity and learning result
      in a teacher's plain voice. Catalogue copy, hero text, scenario and readable
      copies use ordinary sentences, not slogans, futuristic claims or forced role-play.
- [ ] Steps are in the order the product requires; no step depends on a later one.
- [ ] Save and publish steps distinguish the agent from its workflows. Each new hook
      is followed by agent publication or republication before testing, and no
      outcome or troubleshooting note claims a saved draft alone activates it.
- [ ] A conversion preserves the creator's scenario, use-case and teaching-step order,
      exact names, and ordered prompt/input/output occurrences, including duplicates.
      Only trailing extensions become optional; earlier exercises are not moved.
- [ ] Each step starts with a verb and completes one task. Related clicks are grouped,
      not split into microsteps; separate conversation turns and conditional replies
      remain distinct. Text-entry instructions say "message box".
- [ ] Every value to type (URL, name, prompt) is in a code block or `code`.
- [ ] Text with dynamic values is one complete copyable block, with a clear
      placeholder and exact replacement instructions, not fragments to assemble.
- [ ] Prompts are not hard-wrapped mid-sentence in any copy; lists, signatures and
      expected output keep their intended line breaks.
- [ ] Files to download or upload link to the file itself (GitHub `/raw/` URL), not a
      `/blob/` preview page, with the same URL in every copy.
- [ ] The learner can tell when a step succeeded (visible state, message or artifact).
- [ ] Risky or costly actions (sending email, writing records, schedules, credits) are explicit and reversible.
- [ ] Organizer-disposed environments have no attendee shutdown or cleanup chores.
      Necessary own-tenant cleanup stays expandable; the runner's separate cleanup duty
      remains in its run log.
- [ ] Instructions do not prescribe window arrangements, headset/quiet-room habits or
      maintainer reporting. Result cues are informative, not completion gates.
- [ ] When learners check results in a business app (system of record), the lab links it in the prerequisites and Lab Details and says what to check there.
- [ ] Learner notes are never described as saved to the site or an account. Guided labs keep the layout's local-storage note and **Save a PDF copy**.

## Copies and structure

- [ ] README and `_labs` copies say the same thing (`copy-drift` clean, or the difference is intentional).
- [ ] The table of contents matches the headings in both copies.
- [ ] Classic labs keep the house sections; guided labs keep the contract in `docs/NEW_LAB_CHECKLIST.md`. Learner-critical guidance exists in rendered front matter fields, and closed details and lazy images are verified in the rendered page.
- [ ] Guided site filenames use `mission-` with pinned `slug` and `permalink`; README
      folders, assets and canonical URLs keep the unprefixed slug. No duplicate site copy.
- [ ] Own-tenant setup is in `mission_lab.self_setup` and matching closed disclosures in
      both readable copies; attendee readiness and required downloads remain visible.
- [ ] Exercise/step IDs and readiness positions remain stable when refreshing a guided
      page. The curriculum title is the H1; the scenario headline is a secondary tagline.

## Timing and delivery

- [ ] `duration`, Lab Details and section or exercise minutes agree.
- [ ] Every agenda slot that lists the lab fits its duration.
- [ ] Optional parts are labeled and excluded from the core time.
- [ ] An existing advertised duration is unchanged unless explicitly approved; exercise
      minutes are pacing estimates, not measured completion-time claims.
- [ ] Facilitator prerequisites (tenant, data, plugins, accounts) are named.

## Accessibility

- [ ] Every image has alt text that describes the state shown.
- [ ] Link text makes sense out of context.
- [ ] Nothing relies on color, position or icon shape alone.
- [ ] Screenshots are legible at the published width; product UI has light and dark variants in guided labs.
- [ ] Screenshots show the current state and exact asset name, contain required controls, use genuine theme captures, retain native pixel density and have alt text limited to the visible state. Provenance and privacy evidence stay in the maintainer report.
- [ ] Heroes show the useful result; each **Show me** answers that step with one relevant
      image. Supplied references show the actual reference, not an upload thumbnail.
      Captions match visible state and selection. Theme-neutral/supplied images need no
      fabricated dark variant. Full-size links show one picture with theme JavaScript loaded.
- [ ] Generated app checks cover source-data comparison, boundary values, keyboard/accessibility names, reduced motion, narrow width, persistence/undo and recovery as applicable. DOM checks are not described as spoken screen-reader verification.

## Learning design

Score 0–2 for each principle in `learning-design.md` (0 absent, 1 partial, 2 clear) and
report the three lowest with a concrete rewrite of one example step.

- [ ] Each correction has been checked for a reusable lesson. Missing or unclear shared
      guidance and affected template/check updates are proposed in the handoff, without
      duplicating existing rules or editing files during the review.

For any live claims, identify the account/tenant boundary and distinguish passed, drift,
defect, variance, blocked, untested and unverified. A report that did not run the lab must
not imply product behavior was tested.
