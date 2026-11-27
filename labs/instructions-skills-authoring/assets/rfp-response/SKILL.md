---
name: rfp-response
description: Draft an RFP response (proposal) for Aventra Software Group from an incoming RFP, RFI, RFQ, tender, or vendor questionnaire. Match the request to an offering, answer from pre-approved material, and return a Markdown draft with a CSV review checklist. Use this skill when someone asks to "respond to this RFP", "write a proposal", "draft our bid", "we're bidding on this", or "answer these vendor questions", even if they only paste an excerpt or don't name the company.
---

# RFP Response

Turn an incoming solicitation into a proposal from **Aventra Software Group**,
grounded in what Aventra actually sells and the answers it has already approved.

Two facts about how proposals get judged should shape every decision below:

1. **Evaluators score against their own published criteria, in their own
   vocabulary.** They have a scoresheet with weights on it and often dozens of
   proposals to get through. Anything they have to hunt for loses points, so a
   response that mirrors the buyer's structure and words beats a more elegant one
   that doesn't.
2. **Every sentence is a commitment.** A proposal becomes a contract attachment.
   Claiming a certification the company doesn't hold, or a capability it can't
   staff, is worse than admitting a gap — bluffs get discovered at evaluation or,
   worse, after award.

Everything below follows from those two facts.

The skill is self-contained — no knowledge source, connector, or external system
to call. Bundled files are listed at the end; the two you'll open every time are
`references/catalog.md` (what Aventra sells) and `references/answer-library.md`
(pre-approved answers to recurring questions).

## Learn from the worked examples

`assets/` holds two complete request-and-response pairs. They are the fastest way
to see the expected depth, and they cover the two shapes a solicitation takes:

| Example | Shows |
| --- | --- |
| `example-rfp-request.md` → `example-rfp-response.md` | A buyer with no mandated format, answered in the default 12-section structure |
| `example-tender-request.md` → `example-tender-prescribed-structure.md` | A buyer who mandates their own Part A–H structure, a compliance table, and a hard budget cap the full scope doesn't fit |

Read whichever matches the solicitation in front of you before drafting. What to
notice in both: every requirement is answered in the buyer's own numbering,
commitments are lifted verbatim from the answer library, case studies are cited
concretely rather than gestured at, and the gaps are marked in the document
rather than smoothed over.

## Workflow

### 1. Read the solicitation and pull out the brief

Work through the document and capture a short working note. Read an attached
RFP directly; if it's a URL, fetch it; if the user pasted an excerpt, use what
you have and note what's missing.

Capture:

- **Buyer** — name, what kind of organization, industry, size if stated
- **The ask** — what they want built, run, or fixed, in their words
- **Requirements** — every functional, technical, security, and compliance item,
  keeping their numbering so you can answer them one for one
- **Integrations** — every system they name
- **Budget** — a stated range, a cap, or nothing
- **Dates** — questions due, proposals due, anticipated award, project start
- **Evaluation criteria and weights** — this is the scoresheet; treat it as one
- **Submission constraints** — page limits, a required section order, file format,
  a reference number to quote

Missing information is normal and is not a reason to stall. Draft with a clearly
labelled assumption, then surface it in section 12 and in your closing summary so
the user can correct it before submission.

### 2. Match the request to an offering

Read `references/catalog.md` — the index of all 15 offerings, with guidance for
telling close matches apart (that guidance exists because the near-misses are
where this goes wrong: a data warehouse and a BI dashboard answer very different
RFPs). Pick the best fit.

Then open `references/offerings-<product-line>.md` for that offering's full
detail: capabilities, integrations, differentiators, and success measures. The
index tells you which product line an offering belongs to.

A substantial RFP can legitimately span two offerings. Lead with the primary one
and present the second as a named, separately priced workstream, so the buyer can
see what each costs.

If nothing in the catalog genuinely fits, say so plainly instead of forcing a
match. A well-argued "this is adjacent to our Legacy Modernization practice, here
is what we would and wouldn't take on" is a real answer; a proposal for something
Aventra doesn't do is not.

### 3. Answer the requirements from the library

Read `references/answer-library.md` — pre-approved answers to the questions that
recur in nearly every RFP (security, hosting, SSO, accessibility, support SLAs,
pricing approach, and so on).

- **Reuse the substance exactly.** Keep every standard, timeframe, certification,
  and number as written. These are what Aventra can actually commit to; rewriting
  them from memory is how a proposal ends up promising a 15-minute SLA nobody
  agreed to.
- **Adapt the phrasing** to the buyer's vocabulary. If they say "members," don't
  say "customers." If they call it "the Permit Center," use that name.
- **Handle gaps honestly.** If a requirement isn't covered by a library block, an
  offering's capabilities, or `references/past-performance.md`, do not invent an
  answer. Write what's true and mark it clearly, e.g. `> **[NEEDS SME INPUT]** The
  RFP requires FedRAMP Moderate authorization. No approved answer covers this —
  confirm status before submitting.` Then list every flag in your closing summary.

  Certifications deserve particular care: the list in `references/catalog.md` and
  `references/past-performance.md` is **exhaustive**. A framework not named there
  is one Aventra does not hold, and the honest answer is to say so and let the bid
  team decide — not to imply equivalence with something adjacent.

### 4. Write the proposal

**If the RFP specifies its own required structure, section order, or page limit,
follow theirs.** Compliance with submission instructions is often scored, and
occasionally a threshold requirement — a beautifully written non-compliant
proposal can be discarded unread.

Otherwise use this default structure, which matches
`assets/example-rfp-response.md`:

Open with a cover block — an H1 title (`# Proposal in Response to <their reference
number>`), the offering name as an H2 subtitle, who it's submitted by and prepared
for, and a metadata table (their reference number, submission date, vendor,
contact, proposed fee, proposed duration). Then the numbered sections:

| # | Section | What earns points |
| --- | --- | --- |
| 1 | Cover letter | Addressed to their named contact, quotes their reference number, states the fee and that it's within budget |
| 2 | Executive summary | The whole bid in under a page: what, how long, how much, which compliance frameworks |
| 3 | Understanding of your needs | Their objectives played back in their words — proof you read it |
| 4 | Proposed solution | The capabilities you'll deliver, plus each integration they named |
| 5 | Technical approach | Methodology, hosting, security, authentication, integration, QA, accessibility |
| 6 | Project plan and timeline | Phases with month ranges and milestones |
| 7 | Project team | Named roles and what each owns |
| 8 | Relevant experience | Concrete case studies from `references/past-performance.md`, matched to their industry, plus the reference policy |
| 9 | Pricing | An itemized table summing to the fixed fee, with assumptions |
| 10 | Support and service levels | What happens after launch |
| 11 | Why Aventra | Differentiators, including the offering-specific ones |
| 12 | Assumptions, exclusions, and risks | Everything you assumed, everything not included |

Before you finish, walk the evaluation criteria from step 1 and confirm each one
is visibly addressed somewhere. If "Relevant experience" carries 20% of the score,
section 8 needs real substance, not a sentence.

### 5. Run the bundled proposal checker

Save the finished draft as UTF-8 Markdown. Use `#`-style Markdown headings. Mark
unresolved subject matter questions with `NEEDS SME INPUT` and use `TBD` or an
explicit placeholder such as `[Insert submission date]` for unfinished fields.

Open the bundled `scripts/check_proposal.py` and execute that script on the actual
draft in your Python environment. Run it from the skill folder, or use the available
paths to the bundled script and saved draft:

```bash
python scripts/check_proposal.py proposal.md -o proposal-checks.csv
```

If the buyer mandates named response sections, record those headings verbatim,
one per line in a UTF-8 `required-headings.txt`, and add `--headings required-headings.txt`.
Do not infer required headings from scoring criteria alone. If no named sections
are mandated, omit the option; the report will mark that check as skipped.

Use the bundled code, not a rewritten checker or a CSV composed in chat. It needs no
package installs, browser, or network access. The CSV lists review items with draft
line numbers where applicable. It checks markers and heading presence, not factual
accuracy, section order, or compliance. Attach both the Markdown draft and the actual
`proposal-checks.csv`. If the script cannot run, report the error and attach the draft
without claiming a checklist was created.

### 6. Report back

Close with a short summary: which offering you matched and why, the fee and
duration, where the files are, and — most importantly — **every gap you flagged
and assumption you made**. That list is the difference between a draft someone can
safely submit and one that quietly commits the company to something.

## House patterns

These keep proposals consistent with each other and save you re-deriving them.
Adjust when the RFP gives you a reason to.

**Pricing.** Quote a fixed fee that sits inside both the buyer's stated budget and
the offering's indicative range. Itemize roughly:

| Line item | Share |
| --- | ---: |
| Discovery & solution design | 14% |
| Development & configuration | 42% |
| Integrations | 16% |
| Data migration & setup | 8% |
| Quality assurance & security testing | 10% |
| Training, documentation & launch | 6% |
| Project management | 4% |

If their budget sits below the offering's floor, don't quietly squeeze the number
to fit — propose a reduced or phased scope at a price that's deliverable, and say
plainly what's deferred to a later phase. Underbidding to win is how engagements
fail.

**Timeline.** Five phases: Discovery & Design (20% of the schedule), Foundation &
Integrations (25%), Core Build (30%), Testing & Hardening (15%), Launch &
Stabilization (10%). Each ends in a working, demonstrable increment.

**Team.** Engagement Director, Solution Architect, Lead Engineer, UX Designer,
Project Manager, QA & Security Lead — name each person and what they own.

**Sample-document notice.** Aventra is a fictional company used for demonstration,
so open each generated document with the notice used in
`assets/example-rfp-response.md`. It keeps a demo proposal from being mistaken for
a real bid. Drop it only if the user explicitly repoints this at a real vendor.

## Bundled files

| Path | Read it when |
| --- | --- |
| `references/catalog.md` | Always — to pick the offering, and for approved positioning language |
| `references/answer-library.md` | Always — the pre-approved answers |
| `references/offerings-<product-line>.md` | After picking an offering, for its full detail |
| `references/past-performance.md` | Section 8, and any experience or certification question |
| `references/pricing.md` | Section 9 — ranges, fee build-up, what's excluded, under-budget guidance |
| `assets/example-*.md` | Before drafting — the two worked pairs described above |
| `scripts/check_proposal.py` | After saving the draft, to produce `proposal-checks.csv` |

That is the whole skill. If a fact isn't in these files, it isn't an approved
claim — flag it rather than filling the gap from general knowledge.

Adapted for MCS Labs from [AgentDudeSamples](https://github.com/Dewain27/AgentDudeSamples/tree/7066035ce8f9b12329cb06c262f09413f7ea3e08/samples/RFP%20Skill).
