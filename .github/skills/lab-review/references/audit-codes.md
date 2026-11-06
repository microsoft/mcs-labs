# Lab audit codes

`npm run audit:labs` (`scripts/lab-audit.js`) reports one line per finding:
severity, code, `file:line`, message. Severities: **error** breaks the page, CI or a
delivery; **warn** misleads learners or will break soon; **info** is context.

## Copies

| Code | Severity | Meaning | Fix |
| --- | --- | --- | --- |
| `lab-not-found` | error | No `_labs/<slug>.md` or `labs/<slug>/README.md`. | Check the slug: it is the file name without `.md`. |
| `copy-missing-site` | warn | README only; nothing is published. | Create `_labs/<slug>.md` with front matter and the site copy. |
| `copy-missing-readme` | warn | Site copy only (external labs excepted). GitHub readers see nothing, and CI cannot pair edits. | Create `labs/<slug>/README.md` mirroring the site copy, with emoji headings. |
| `copy-drift` | warn | The copies differ after ignoring heading emoji, anchor prefixes, Liquid or absolute site URLs, indentation and blank lines. The message gives the first differing line in each file. | Port the newer text to the other copy. Confirm which is newer with `git log -p` before overwriting. |

## Front matter

| Code | Severity | Meaning | Fix |
| --- | --- | --- | --- |
| `fm-invalid` | error / warn | YAML does not parse, or `journeys`, `difficulty`, `duration` or `lab_format` has an invalid value (error); `section` is unknown (warn: the badge shows the raw value). | Use the values in `docs/NEW_LAB_CHECKLIST.md`. |
| `fm-missing` | error / warn | A required key is missing (error), or there is no `module` (warn). | Add the key. |
| `module-missing` | error | `module:` names a module with no `_modules/<slug>.md`. | Fix the slug or create the module. |
| `fm-layout` | warn | `layout` is not `lab`; the feed drops custom layouts. | Remove `layout`, or set it to `lab`; use `lab_format` to change rendering. |
| `fm-manual-date` | warn | A hand-written update date. Dates come from Git (`_plugins/content_last_updated.rb`). | Remove the key. |
| `fm-unlisted` | warn | `unlisted: true` without `search: false` and `sitemap: false`. | Add both. |
| `fm-order-duplicate` | info | Another lab shares `order`; sorting between them is arbitrary. | Pick a free number if the order matters. |

## Content

| Code | Severity | Meaning | Fix |
| --- | --- | --- | --- |
| `anchor-broken` | error | An in-page link has no matching heading id or HTML `id`. | Recompute the id: lowercase, drop punctuation except `-` and `_`, spaces to `-`. In a README, a leading emoji leaves a `-`, and an emoji with U+FE0F (🛠️ ⚙️ ✍️) leaves `️-`. Copy the id from GitHub's rendered heading link when in doubt. |
| `image-missing` | error | A referenced image file does not exist. | Restore or recapture it, or fix the path (paths are case-sensitive on the server). |
| `link-missing` | warn | A relative link points to a file that does not exist. | Fix the path or use the published URL. |
| `heading-emoji` | warn | Emoji in `_labs` headings. They render on the site and change anchors. | Remove them from the site copy only, then fix its anchors. |
| `details-mismatch` | warn | The Lab Details table disagrees with front matter `duration` or `difficulty`. | Decide which is true (check the agendas), then align both copies and front matter. |
| `term-retired` | warn | A retired product name from `scripts/lab-audit-terms.json`. Mentions such as "formerly …" are ignored. | Use the replacement, after checking that the step itself still applies. |
| `size-words` | info | Classic lab whose reading time exceeds half its duration. | Trim explanations, move reference material to links, or consider the missions format for a new copy. |
| `image-orphan` | info | Images in `labs/<slug>/images/` that nothing references. | Delete them in a cleanup PR after checking other labs and modules do not use them. |
| `image-shared` | info | The lab uses images from another lab's folder. | Recapturing them changes the other lab too. |

## Missions format

All are errors unless noted.

| Code | Meaning | Fix |
| --- | --- | --- |
| `missions-contract` | A required `mission_lab` key is missing, an id is not kebab-case or is duplicated, optional missions come before core ones, a reveal `flow` has fewer than two items, or a check does not have exactly one `correct: true`. Missing `sources` is a warn. | Follow "Authoring a guided mission lab" in `docs/NEW_LAB_CHECKLIST.md`. |
| `missions-minutes` | Core mission minutes do not sum to `duration`. | Rebalance minutes, or mark extensions `optional: true`. |
| `missions-prompt` | A front matter prompt is missing, different or out of order in a body's `text` fences. | Copy the front matter prompt into both bodies verbatim. Use `|-` for multiline prompts. |
| `missions-image` | A screenshot lacks `title`, lives outside `/labs/<slug>/images/`, does not exist, has the wrong declared size, has `src_dark` equal to `src` (path or bytes), or is not referenced in a body; or the hero has `src_dark`. | Recapture, fix the dimensions from the file, or add the `<picture>` line to both bodies. |
| `missions-test` (warn) | No `scripts/*.test.js` mentions the lab. | Add a contract test and update the missions allowlist in `scripts/lab-missions.test.js`. |

## Agendas and modules

| Code | Severity | Meaning | Fix |
| --- | --- | --- | --- |
| `agenda-invalid` | error | An agenda YAML file does not parse. | Fix the YAML. |
| `agenda-unknown-lab` | error | An agenda or event `labs:` list names a lab with no `_labs/<slug>.md`. | Fix the slug or restore the lab. |
| `agenda-unknown-module` | error | An agenda row names a module with no `_modules/<slug>.md`. | Fix the slug. |
| `agenda-unlisted-lab` | error | A listed (advertised) event sends attendees to an unlisted lab. | Publish the lab, or use it only in an unlisted preview event. |
| `agenda-deprecated-lab` | warn | A listed event still uses a lab marked `deprecated: true`. | Swap in the replacement lab. |
| `module-lab-missing` | error | A module's `lab:` names a lab that does not exist. | Fix the module's `lab:`. |
| `agenda-usage` | info | Which events list the lab, with slot minutes when the agenda states them. | Check those slots when duration or scope changes. |

Agenda and module findings appear for the labs you audit. With `--all`, or `--changed`
when agendas, events or modules changed, every reference is checked, including
`agenda-invalid`.
