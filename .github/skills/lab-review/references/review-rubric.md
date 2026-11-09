# Review rubric

Use after the audit. Mark each item **pass**, **issue** (with evidence) or **n/a**.

## Product truth

- [ ] Product, feature and connector names match current Microsoft Learn pages. Since 2026: **Microsoft Copilot**, **Microsoft Copilot Chat** and the **Microsoft Copilot harness** (see `scripts/lab-audit-terms.json`); license SKU names stay as the price list shows them.
- [ ] UI labels in **bold** match the product today, or the review says they could not be verified.
- [ ] License, credit, preview, region and admin prerequisites are current and complete.
- [ ] Prerequisites use an organizer-neutral cue for attendees with pre-provisioned accounts; own-tenant setup stays in the expandable section, while required sign-in and exercise downloads remain visible.
- [ ] Learner copy contains no maintainer test reports, run dates, screenshot provenance, repeated tenant warnings, or runner-specific ownership/connection/sender checks. Keep these in run logs and PRs; report provisioning defects to organizers.
- [ ] Renamed or moved features are updated everywhere, including description, intro, tables, tips and troubleshooting, not just the steps.
- [ ] Links resolve to the intended page (not a redirect to a generic landing page).
- [ ] Statements about limits, costs or availability cite a source in the lab.
- [ ] Literal pipes in Markdown prose are escaped (`&#124;`) where Kramdown could parse a table; generated HTML preserves the intended wording and list structure.

## Instructions

- [ ] Steps are in the order the product requires; no step depends on a later one.
- [ ] Each step has one action and starts with a verb.
- [ ] Every value to type (URL, name, prompt) is in a code block or `code`.
- [ ] The learner can tell when a step succeeded (visible state, message or artifact).
- [ ] Risky or costly actions (sending email, writing records, schedules, credits) are explicit and reversible.
- [ ] Cleanup removes anything recurring or shared the lab created.
- [ ] When learners check results in a business app (system of record), the lab links it in the prerequisites and Lab Details and says what to check there.
- [ ] Learner notes are never described as saved to the site or an account. Missions labs keep the layout's local-storage note and **Save a PDF copy**.

## Copies and structure

- [ ] README and `_labs` copies say the same thing (`copy-drift` clean, or the difference is intentional).
- [ ] The table of contents matches the headings in both copies.
- [ ] Classic labs keep the house sections; missions labs keep the contract in `docs/NEW_LAB_CHECKLIST.md`. Learner-critical guidance exists in rendered front matter fields, and closed details and lazy images are verified in the rendered page.

## Timing and delivery

- [ ] `duration`, Lab Details and section or mission minutes agree.
- [ ] Every agenda slot that lists the lab fits its duration.
- [ ] Optional parts are labeled and excluded from the core time.
- [ ] Facilitator prerequisites (tenant, data, plugins, accounts) are named.

## Accessibility

- [ ] Every image has alt text that describes the state shown.
- [ ] Link text makes sense out of context.
- [ ] Nothing relies on color, position or icon shape alone.
- [ ] Screenshots are legible at the published width; product UI has light and dark variants in missions labs.
- [ ] Screenshots show the current state and exact asset name, contain required controls, use genuine theme captures, retain native pixel density and have alt text limited to the proven state; provenance and privacy checks are explicit.
- [ ] Generated app checks cover source-data comparison, boundary values, keyboard/accessibility names, reduced motion, narrow width, persistence/undo and recovery as applicable. DOM checks are not described as spoken screen-reader verification.

## Learning design

Score 0–2 for each principle in `learning-design.md` (0 absent, 1 partial, 2 clear) and
report the three lowest with a concrete rewrite of one example step.

For any live claims, identify the account/tenant boundary and distinguish passed, drift,
defect, variance, blocked, untested and unverified. A report that did not run the lab must
not imply product behavior was tested.
