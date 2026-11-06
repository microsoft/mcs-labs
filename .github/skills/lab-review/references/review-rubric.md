# Review rubric

Use after the audit. Mark each item **pass**, **issue** (with evidence) or **n/a**.

## Product truth

- [ ] Product, feature and connector names match current Microsoft Learn pages.
- [ ] UI labels in **bold** match the product today, or the review says they could not be verified.
- [ ] License, credit, preview, region and admin prerequisites are current and complete.
- [ ] Links resolve to the intended page (not a redirect to a generic landing page).
- [ ] Statements about limits, costs or availability cite a source in the lab.

## Instructions

- [ ] Steps are in the order the product requires; no step depends on a later one.
- [ ] Each step has one action and starts with a verb.
- [ ] Every value to type (URL, name, prompt) is in a code block or `code`.
- [ ] The learner can tell when a step succeeded (visible state, message or artifact).
- [ ] Risky or costly actions (sending email, writing records, schedules, credits) are explicit and reversible.
- [ ] Cleanup removes anything recurring or shared the lab created.

## Copies and structure

- [ ] README and `_labs` copies say the same thing (`copy-drift` clean, or the difference is intentional).
- [ ] The table of contents matches the headings in both copies.
- [ ] Classic labs keep the house sections; missions labs keep the contract in `docs/NEW_LAB_CHECKLIST.md`.

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

## Learning design

Score 0–2 for each principle in `learning-design.md` (0 absent, 1 partial, 2 clear) and
report the three lowest with a concrete rewrite of one example step.
