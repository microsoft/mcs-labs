---
layout: lab
title: "Copilot Code: build a managed app"
order: 116
duration: 30
difficulty: 100
lab_type: local
section: core_learning_path
journeys: ["business-user", "developer"]
description: "Use Copilot Code to generate, test, and refine a multi-day Bootcamp Lab Tracker from a plain-language prompt and the published agenda."
---

# Copilot Code: build a managed app

Use Copilot Code to turn a plain-language specification and the published bootcamp agenda into a working Bootcamp Lab Tracker without writing code manually.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 100 | Maker | 30 minutes | Generate an interactive app from a supplied prompt, check its behavior, and refine it with follow-up prompts. |

---

## Table of Contents

- [Why This Matters](#why-this-matters)
- [Introduction](#introduction)
- [Core Concepts Overview](#core-concepts-overview)
- [Documentation and Additional Training Links](#documentation-and-additional-training-links)
- [Prerequisites](#prerequisites)
- [Summary of Targets](#summary-of-targets)
- [Use Cases Covered](#use-cases-covered)
- [Instructions by Use Case](#instructions-by-use-case)
- [Use Case #1: Build and Verify Your Tracker](#use-case-1-build-and-verify-your-tracker)
- [Use Case #2: Customize and Recheck Your Tracker](#use-case-2-customize-and-recheck-your-tracker)
- [Summary of Learnings](#summary-of-learnings)
- [Conclusions and Recommendations](#conclusions-and-recommendations)
- [Architecture Bootcamp Latest](#architecture-bootcamp-latest)

---

## Why This Matters

**Makers do not need to start with a blank code editor to try an app idea.** A clear description of the outcome can become a working prototype that you can open, use, and improve.

Think of the prompt as a brief you would give to a developer:
- **Without a clear specification:** the app may look convincing but count the wrong items, lose track of its controls, or be difficult to use with a keyboard.
- **With a clear specification:** the schedule, interactions, visual rules, and acceptance checks make the intended result explicit.

**Common challenges solved by this lab:**
- "I have an app idea, but I do not know where to start."
- "The generated page looks good, but how do I know it works?"
- "I want to change the design without breaking what already works."

**In 30 minutes, you will generate a small app, check its behavior, and, if time permits, refine its appearance.**

---

## Introduction

During the bootcamp, you need a simple way to track the labs you have completed across every day. Instead of maintaining a checklist by hand, you will ask Copilot Code to read the published agenda and create an interactive tracker from a supplied specification.

The tracker combines a timeline for each day, lab cards grouped by day, per-day completion counts, and an overall progress indicator. Marking a lab complete in one place must update all the others. Each day's Lunch appears in the schedule but must never count as a lab.

Copilot Code fetches the agenda while generating the app and embeds the parsed schedule in one `index.html` file. The finished app is not deployed or published and uses no external libraries, web fonts, storage, or runtime network requests. Completion progress intentionally resets on reload.

---

## Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Plain-language specification** | Describes the required content, behavior, and constraints before the app is generated. |
| **Self-contained app** | Embeds the agenda data, HTML, CSS, and JavaScript in one file, with no runtime network requests. |
| **Synchronized state** | Keeps timeline buttons, checkboxes, per-day counts, the overall completion count, and the progress bar consistent. |
| **Acceptance checks** | Turns "it looks right" into observable checks, including reverse actions and reload behavior. |
| **Accessible interaction** | Makes keyboard operation, visible focus, and status updates part of the requirements rather than afterthoughts. |
| **Iterative refinement** | Uses focused follow-up prompts to change one aspect while preserving existing behavior. |

---

## Documentation and Additional Training Links

These optional resources explain the web technologies and browser checks used in this exercise. No manual coding or DevTools use is required to complete the lab.

- [Get started with web development using Visual Studio Code](https://learn.microsoft.com/training/modules/get-started-with-web-development/)
- [Overview of Microsoft Edge DevTools](https://learn.microsoft.com/microsoft-edge/devtools/overview)
- [Accessibility-testing features in Microsoft Edge DevTools](https://learn.microsoft.com/microsoft-edge/devtools/accessibility/reference)

---

## Prerequisites

For an instructor-led bootcamp, use the provided environment and designated working folder. If completing the lab independently, arrange the following before starting:

- Access to Copilot Code in your provided environment.
- Copilot Code must be able to fetch the [published bootcamp agenda](https://microsoft.github.io/mcs-labs/events/bootcamp-latest/) while generating the app.
- A designated working folder where Copilot Code can create files.
- A browser that can open the generated HTML file.

---

## Summary of Targets

By the end of this lab, you will be able to:

- Generate a self-contained `index.html` app from the supplied prompt.
- Verify that every day's scheduled labs and Lunch match the published agenda.
- Check that timeline buttons, checkboxes, per-day counts, and overall progress indicators stay synchronized.
- Confirm that totals come from the parsed labs, Lunch is excluded from progress, and reloading resets completion.
- Check keyboard operation and the narrow-screen layout.
- If time permits, change colors or emojis with a focused follow-up prompt and recheck the behavior.

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Build and verify your tracker](#use-case-1-build-and-verify-your-tracker) | Turn a specification into a working app and check it against observable requirements. | 25 min |
| 2 | [Customize and recheck your tracker](#use-case-2-customize-and-recheck-your-tracker) | Refine the appearance while preserving working behavior. | 5 min, optional |

If generation or troubleshooting takes longer, prioritize Use Case #1 and skip the optional customization.

---

## Instructions by Use Case

---

## Use Case #1: Build and Verify Your Tracker

Generate the Bootcamp Lab Tracker from the published agenda and check that its controls work together.

| Use case | Value added | Estimated effort |
| -------- | ----------- | ---------------- |
| Build and verify your tracker | Turn a specification into a working app and check it against observable requirements. | 25 minutes |

**Summary of tasks**

Open the working folder, submit the supplied prompt, open the generated file, and perform the acceptance checks.

**Scenario:** You are attending the bootcamp and want one place to see every day's labs and mark them complete without counting Lunch or other agenda items toward your progress.

### Objective

Create a self-contained `index.html` containing the multi-day tracker and verify its agenda data, per-day and overall completion counts, reset behavior, keyboard operation, and mobile layout.

### Step-by-Step Instructions

#### Get Ready

Go to [Microsoft Copilot](https://copilot.cloud.microsoft), sign in with your workshop account, and select **Code**. Alternatively, open the Microsoft Copilot app and select **Code**.

Open the designated working folder if you are using a local project.

#### Generate Your App

Start a new conversation, paste the following **My Bootcamp Lab Tracker** prompt unchanged, and submit it. Allow file creation if prompted.

![Copilot Code with an example tracker prompt entered in a new session](assets/copilot-code.png)

The screenshot shows an earlier example prompt. Copy the current prompt below, including the agenda URL and the final instructions.

```text
Build `index.html`, "My Bootcamp Lab Tracker", for a Copilot bootcamp: one self-contained file in plain HTML, CSS and JS with nothing external (no libraries, web fonts, storage or runtime network requests). Progress lives in memory, resets on reload, and starts all unchecked.
## Schedule (source of truth)
Before building, fetch the agenda at https://microsoft.github.io/mcs-labs/events/bootcamp-latest/ and read **every day** in it.
- **Days:** keep each day's number and theme (the text after "Day N —").
- **Labs:** every item whose title starts with "Lab N:". Keep its number N, use the text after "Lab N:" as the title (with "Copilot" spelled out in full), take the start time from the agenda and calculate the end time as start + duration.
- **Lunch:** each day's "Lunch break" item, with its start and end time. It's a break, not a lab: never clickable, never counted.
- Ignore everything else, including modules, welcome/re-cap, coffee breaks, Q&A, social, and the optional "Continue on your own" labs (they have no time slot).
- The agenda has no emojis, so give each lab one distinct emoji that suits its topic. Lunch is 🥪.
- Copy the parsed data into the file as a JS array grouped by day. Don't fetch at runtime.
- Let TOTAL be the total number of labs. Use it everywhere a lab count appears; never assume a fixed number.
- If the page can't be reached or has no labs, stop and tell me instead of making up a schedule.
## Page (max 720px, centered)
1. **Sticky header:** "COPILOT BOOTCAMP" eyebrow, the title, "N of TOTAL labs complete" (aria-live), and an accessible progress bar (0–TOTAL).
2. **Bootcamp timeline:** one panel holding an HTML/CSS Gantt chart for each day, stacked in order. Each day has a heading ("DAY N", its theme and an "x/y" count of labs done that day) and its own hour axis. All days share one time range: from the whole hour at or before the earliest item on any day to the whole hour at or after the latest end, with hourly gridlines and labels. One row per item (labs and lunch) in time order, labelled emoji + "LAB N" (or "LUNCH"). Each lab bar is a toggle `<button>` that shows the lab title inside it (truncated with "…" if it doesn't fit) and has aria-pressed and a descriptive aria-label that includes the day. Bars are outlined purple when to do and solid green when done. Hover/focus shows a tooltip (emoji, Lab N, day, status, title, time, duration) and highlights its card. Lunch bars read "🥪 Lunch" and are static (role="img"). Above the panel, a small label shows the number of days and the hour range. One legend at the bottom: To do / Complete / Break.
3. **Cards:** grouped under a heading for each day (DAY N + theme), with one card per lab plus that day's Lunch card, in time order. The whole lab card is a `<label>` around a native checkbox, showing emoji + "LAB N", title, and time · duration. Done = green tint, green left border, struck-through title and a "DONE" badge. Lunch cards show 🥪 instead of a checkbox and have an italic title.
Bars, checkboxes, per-day counts, the overall counter and the progress bar always stay in sync, and labs can be unchecked.
## Style
- Dark only: background #0d0d0d, surfaces #161616/#1e1e1e, borders #2a2a2a, text #d4d4d4, headings #e8e8e8. Square corners everywhere.
- Purple #a78bfa = to do, green #4ade80 = done, amber #fbbf24 = lunch (dashed border + diagonal stripes on both bar and card).
- Visible focus outlines; respect prefers-reduced-motion.
- At ≤480px: tighter padding, timeline labels and Lunch bars show the emoji only, and day themes are hidden.
## When done
Save `index.html` in the current folder. Reply with one line confirming it, a clickable
`file:///` Markdown link to the file (spaces as `%20`), and the same URL in a code block. No
code dump.
```

#### Open Your Tracker

Open the generated `index.html` in a browser. If the generated link does not open from your environment, open the file directly.

#### Check That It Works

- Compare the tracker with the [published bootcamp agenda](https://microsoft.github.io/mcs-labs/events/bootcamp-latest/). Confirm every day's number, theme, scheduled lab numbers and titles, and Lunch appear in time order. Check that end times equal start times plus agenda durations.
- Confirm that modules, welcome/re-cap, coffee breaks, Q&A, social, and optional labs without time slots are excluded.
- Count the included labs and confirm the overall counter starts at **0 of TOTAL**, using that count rather than a fixed number. Each day's count should start at **0** with the correct daily total.
- Confirm every day's timeline uses the same hour range, rounded outward to cover the earliest start and latest end across all days.
- Click a lab's timeline bar. Its checkbox, styling, per-day count, overall completion count, and progress bar should update together.
- Toggle a card's checkbox. Its timeline bar should update too.
- Uncheck a completed lab to reverse its completion.
- Complete every included lab and confirm the counter shows **TOTAL of TOTAL**, with every day's count also complete.
- Confirm each day's Lunch cannot be toggled and never counts toward progress.
- Reload the page and confirm all labs reset to unchecked.
- Use **Tab** and **Space** to operate the controls, checking for visible keyboard focus.
- Try a browser width of **480px or less**. Confirm timeline labels and Lunch bars show only emojis and day themes are hidden.
- Confirm the app has square corners. After generation, disconnect from the network and reload the file to check it still works without fetching the agenda again.

If something does not work, flag it to your facilitator.

### Congratulations!

You have generated an app from a specification and checked its behavior rather than relying on its appearance.

### Test Your Understanding

**Key takeaways**

- **One action, several updates:** completing a lab must update both controls, its day's count, and the overall progress indicators.
- **The agenda is the source of truth:** lab counts come from the scheduled labs across every day, not a fixed number in the prompt.
- **A break is not a lab:** Lunch belongs on the schedule but not in the completion count.
- **Reload is a reset:** the file remains available, but completion state is kept only in memory.

**Lessons learned and troubleshooting tips**

- If the generated link does not open, open `index.html` directly from the working folder.
- If a check fails, tell your facilitator which action you took, what you expected, and what happened.
- Do not add storage to fix the reload reset: that reset is an explicit requirement.
- If Copilot Code cannot reach the agenda or find any labs, stop and tell your facilitator. Do not invent a schedule.

**Challenge: Apply this to your own use case**

What items would a tracker for your own workshop include, and which of them should not count toward completion?

---

## Use Case #2: Customize and Recheck Your Tracker

**Optional, if you finish early:** use a follow-up prompt to change the colors or emojis without changing the app's behavior.

| Use case | Value added | Estimated effort |
| -------- | ----------- | ---------------- |
| Customize and recheck your tracker | Refine the appearance while preserving working behavior. | 5 minutes |

**Summary of tasks**

Request one visual change in the same conversation, refresh the app, and repeat the behavior checks.

**Scenario:** Your tracker works, but you want its appearance to reflect your preferences without losing the completion behavior you just verified.

### Objective

Make one visual change through a follow-up prompt and confirm that the original acceptance checks still pass.

### Step-by-Step Instructions

1. Return to the conversation that generated your app.
2. Choose one of the following prompts and submit it.

**Change a color**

```text
Change the to-do color from purple to sky blue. Keep completed labs green, Lunch amber, and all existing behavior unchanged.
```

**Change the emojis**

```text
Replace the lab emojis with a different set of your choice. Update both the timeline and cards consistently, keeping everything else unchanged.
```

3. If prompted, allow the update to the existing `index.html`.
4. Refresh the browser and confirm the visual change appears consistently in the timeline and cards.
5. Repeat the checks from Use Case #1, including per-day and overall counts, unchecking a lab, excluding Lunch, keyboard operation, and resetting on reload.

### Congratulations!

You have refined a generated app through a focused follow-up prompt while checking that its existing behavior still works.

### Test Your Understanding

- Why does the color-change prompt explicitly say to keep existing behavior unchanged?
- If the bars change color but the cards do not, has the requested change been completed?
- Why should you repeat the behavior checks after a visual-only change?

**Challenge: Apply this to your own use case**

Describe one small visual change you would request for a different app. What would you explicitly ask Copilot Code to preserve?

---

## Summary of Learnings

The first prompt builds the app; follow-up prompts help you refine it.

- **Specify the outcome:** content, interactions, and constraints belong in the prompt.
- **Verify observable behavior:** exercise both completion and reversal, not just the initial screen.
- **Include accessibility:** keyboard and narrow-screen checks are part of reviewing the result.
- **Change one thing at a time:** keep refinement requests focused and recheck what already worked.
- **Separate files from state:** keeping `index.html` preserves the app, not its in-memory completion progress.

### Conclusions and Recommendations

- Keep the initial specification available as the reference for expected behavior.
- Open and use the generated file before treating the task as complete.
- Check excluded items, reverse actions, and reload behavior as well as the happy path.
- State what must remain unchanged in a refinement prompt.
- Report unexpected results to your facilitator instead of accepting a convincing-looking screen.

---

## Architecture Bootcamp Latest

This lab is part of [Architecture Bootcamp Latest]({{ '/events/bootcamp-latest/' | relative_url }}).
