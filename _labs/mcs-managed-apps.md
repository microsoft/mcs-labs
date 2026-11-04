---
layout: lab
module: managed-apps
title: "Managed Apps"
order: 120
duration: 30
difficulty: 200
lab_type: local
section: intermediate_labs
journeys: ["developer"]
description: "Build an app from the live bootcamp lab schedule in Copilot Studio Apps, with a focus on backend creation, connection, and saved progress."
---

# Managed Apps

Build a managed app from the live published bootcamp lab schedule in Copilot Studio Apps. Use a screenshot as a visual reference, with the main focus on creating backend storage, connecting the app, and verifying that saved progress is restored.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 30 minutes | Create an app from the live lab schedule, provision and connect backend storage, and verify saved progress before publishing. |

The 30-minute duration is a target to validate during rehearsal, not a confirmed completion time.

---

## Table of Contents

- [Why This Matters](#why-this-matters)
- [Introduction](#introduction)
- [Core Concepts Overview](#core-concepts-overview)
- [Documentation and Additional Training Links](#documentation-and-additional-training-links)
- [Prerequisites](#prerequisites)
- [Summary of Targets](#summary-of-targets)
- [Use Case Covered](#use-case-covered)
- [Instructions](#instructions)
- [Use Case: Build an App with a Persistent Backend](#use-case-build-an-app-with-a-persistent-backend)
- [Summary of Learnings](#summary-of-learnings)
- [Conclusions and Recommendations](#conclusions-and-recommendations)
- [Architecture Bootcamp Latest](#architecture-bootcamp-latest)

---

## Why This Matters

**Start simple, then choose the platform for the job.** In this bootcamp, **Copilot Code** is the approachable entry point for simple apps and quick prototypes. **Microsoft Copilot Studio (MCS)** is the platform to explore when you need more advanced agents, connections to business data and tools, and managed deployment and governance. This is a progression in solution needs, not a hard limit on either tool.

This lab connects those ideas by creating an app from the live published lab schedule in Copilot Studio Apps. **The backend is the main learning focus:** creating storage, connecting the app to it, and verifying real reads and writes. The screenshot provides a familiar visual starting point; reproducing the UI is not the final goal. This exercise does not build an advanced agent.

**A convincing preview is not the same as a working managed app.** A screenshot can communicate a design quickly, but it cannot specify where data is saved, who can access it, or what happens after a reload.

This lab separates those questions. First, build the interface using an image and a written behavior specification, with data read from the live published schedule. Then create and connect supported backend storage, verify real completion records, and deliver the app through a live link.

You will practice checking behavior rather than accepting a generated screen or an approval message as proof of success.

---

## Introduction

In Lab 3, you create a simple app in Copilot Code whose completion progress resets on reload. Here, you will create a new app in **Copilot Studio Apps** using the **live published bootcamp lab schedule** as its data source and a screenshot as a visual reference.

This is **not** an HTML import or a Code-to-Studio migration. The screenshot communicates the intended appearance; the app's initial schedule data comes from reading the live agenda URL, not copying the screenshot's lab names, times, or totals. The prompt specifies the required behavior. A reference screenshot is included, so completing the earlier lab is not a prerequisite.

The first prompt deliberately keeps completion in memory. The second asks the app-building experience to explain and provision supported backend storage in your current environment. No SharePoint list or prepared database is supplied in advance.

**Backend provisioning is the go/no-go test.** If the environment cannot create and connect the required storage, stop and resolve the blocker with your facilitator. Browser storage is not a substitute for this stage. Publishing is attempted only after backend persistence is demonstrated.

---

## Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Image-based specification** | Communicates layout and appearance without importing the earlier app's code. |
| **Live schedule input** | Reads the current published agenda when building the app rather than hardcoding schedule data from the image. |
| **In-memory progress** | Establishes a baseline that intentionally resets on reload. |
| **Backend storage and connection** | Creates supported storage and connects the app's reads and writes so completion can be restored in a later session. |
| **Provisioning and approval** | Separates proposing a resource, approving its creation, and verifying that it actually exists. |
| **Preview versus published app** | Distinguishes the authoring experience from the app learners will open through a live link. |

---

## Documentation and Additional Training Links

- [Microsoft Copilot Studio documentation](https://learn.microsoft.com/microsoft-copilot-studio/) - general product reference; it does not establish that the Apps or storage capabilities are available in your tenant.
- [Live published bootcamp agenda](https://microsoft.github.io/mcs-labs/events/bootcamp-latest/) - source of truth for the app's schedule data.

Use your facilitator's environment-specific guidance for feature access and approved storage.

---

## Prerequisites

For an instructor-led bootcamp, use the provided account and designated environment. If working independently, confirm the following before starting:

- Access to **Copilot Studio Apps**, including image upload and app preview in your environment.
- Permission for the app-building experience to read the published bootcamp agenda.
- Either the [provided app screenshot](assets/actual-app.png) or a screenshot of your current Lab 3 app, saved locally for upload.
- For the storage rehearsal, permission to create the proposed backend resources and connections in a designated training environment. If SharePoint is proposed, site and list creation may require additional permissions.
- For the publishing rehearsal, access to the app's publishing controls and an approved audience.

Do not use production sites or another learner's storage. No pre-existing SharePoint list or prepared database is required, and no VS Code setup is required for this lab.

---

## Summary of Targets

By the end of a successful rehearsal, you will be able to:

- Create an app whose schedule data comes from the live published agenda, using an image only as a visual reference.
- Confirm that its labs and Lunch match the current published agenda rather than the screenshot's historical counts.
- Explain the difference between in-memory completion and persistent backend records.
- Create supported backend storage, review its permissions, and verify the app's read and write connection.
- Verify that completing and unchecking a lab both persist after a reload.
- Publish only after persistence succeeds, then repeat the checks through the live app link.

---

## Use Case Covered

| Step | Use Case | Value added | Target effort |
| ---- | -------- | ----------- | ------------- |
| 1 | [Build an app with a persistent backend](#use-case-build-an-app-with-a-persistent-backend) | Use the live lab schedule to create an app, then provision, connect, and verify its backend before publishing. | 30 min |

Complete the steps in order in the same app. Backend storage and publishing remain provisional until rehearsal confirms the environment supports them.

---

## Instructions

---

## Use Case: Build an App with a Persistent Backend

**Scenario:** You want an app based on the live bootcamp lab schedule that saves completion to a backend. Use the provided image or your Lab 3 app screenshot as a design reference, not as the source of schedule data.

### Objective

Create an app from the live published agenda, provision supported backend storage, connect the app's reads and writes, verify saved completion, and publish the same app if rehearsal succeeds.

### Step-by-Step Instructions

#### Save and Upload the Reference Image

1. Choose your starting image: save the provided screenshot below, or take a screenshot of your current **Lab 3: Copilot Code** app. Either option works; you do not need to have completed Lab 3 to use the provided screenshot.
2. Open **Copilot Studio Apps** in your provided training environment and start a new app.
3. Attach the screenshot to the app-building conversation before submitting the first prompt.

[Open or save the reference screenshot](assets/actual-app.png)

![Reference app with a dark theme, day tabs, timeline, lab cards, and an overall progress indicator](assets/actual-app.png)

The image is a design reference, not the schedule source. Its app title, lab numbers, times, and totals may differ from the app you create. Use the app name in the prompt and read the schedule from the live agenda; do not hardcode the screenshot's data.

#### Prompt 1: Build the App from the Live Schedule

With the screenshot attached, submit this prompt exactly as written:

```text
Build a managed app called "My Bootcamp Lab App" using the
attached screenshot as a visual reference.

Reproduce its dark theme, square corners, day tabs, timeline,
lab cards, completion checkboxes, and overall progress indicator.

Fetch the current live published lab schedule from:
https://microsoft.github.io/mcs-labs/events/bootcamp-latest/

Include every day's scheduled "Lab N:" items and Lunch break.
Exclude other agenda items and optional labs. If you cannot read
the agenda, stop and tell me rather than inventing the schedule.

Keep timeline buttons, card checkboxes, per-day counts, and overall
progress synchronized. Lunch must never count toward completion.
Support keyboard interaction and visible focus.

For this first step, keep completion in memory. Do not add a
connector or data store yet. Show me the working preview.
```

#### Watch the App Take Shape

While the app is being built, follow any visible progress updates, reasoning summaries, and tool activity. Look for how it interprets the screenshot, reads the agenda, and builds the interface. Expand activity details if available, and notice any questions or approval requests. These updates can help you spot misunderstandings early, but they do not replace checking the finished app.

Wait for the preview. If the agenda cannot be read, stop and tell your facilitator; do not ask for an invented schedule.

#### Check the In-Memory Preview

- Compare every day's lab numbers, titles, and times with the live published agenda, not the screenshot. Include Lunch, but exclude other agenda items and optional labs.
- Confirm that all labs start unchecked and the overall total counts labs only.
- Toggle a timeline lab button and then a card checkbox. Both controls, the day's count, and overall progress must stay synchronized.
- Switch days and switch back. Completion should remain during the session.
- Confirm Lunch cannot be completed and never increases the completed count.
- Use the keyboard to reach and operate the tabs and completion controls. Check that focus is visible.
- Reload the preview. Completion must reset at this stage because no persistent store has been added.

Once the in-memory checks pass, continue in the same app-building conversation to add saved progress. If the preview copies outdated counts from the image or loses synchronization, correct that behavior before requesting storage.

> **Rehearsal gate:** The steps below describe what to test, not a confirmed provisioning recipe. Approval cards and generated explanations are not evidence that the backend is ready.

#### Prompt 2: Request Supported Backend Storage

In the same app-building conversation, submit:

```text
Extend this app so completion is saved and restored after
reload, rather than held only in memory.

Use persistent backend storage that this Copilot Studio Apps
experience supports creating in my current environment.
There is no pre-existing SharePoint list or prepared database.

Before changing the app, explain what storage you will use,
whether you can create it here, and any permissions or setup needed.
If you cannot provision it, stop and explain the blocker.

Do not substitute browser localStorage or sessionStorage for
backend storage. Preserve the existing interface and behavior.
```

Read the proposed storage plan before approving resource creation. Confirm which resources will be created, where they will live, how the app will read and write completion, and who will be able to access the records.

#### Review Resource Creation Requests

The supplied screenshots show one possible **SharePoint** flow. Your environment may propose a different supported backend; do not assume these exact dialogs will appear.

1. If asked where the completion list should go, use only a location approved for this training exercise. For a fresh-environment rehearsal without an existing site, test **Yes, create a new site** only if you have permission to create it.

<a href="assets/choose-site.png"><img src="assets/choose-site.png" alt="SharePoint storage location options for saving app completion" width="600" class="align-center"></a>

2. If a **Create site** approval appears, review the site name, location, and full details. Approve only the intended training resource and only if authorized.

<a href="assets/create-site.png"><img src="assets/create-site.png" alt="SharePoint Create site approval card showing the proposed training site" width="600" class="align-center"></a>

3. If a **Create lists** approval appears, review the target site and proposed fields. The screenshot includes `Title`, `LabNumber`, `Completed`, and `CompletedOn`; it is an example, not a mandatory schema for every backend.

<a href="assets/approve-site.png"><img src="assets/approve-site.png" alt="SharePoint Create lists approval card showing proposed completion fields and their types" width="600" class="align-center"></a>

4. Wait for the operations to finish. Confirm the resources actually exist and the app is connected to them. Record the resource location and any errors during rehearsal. Do not repeatedly approve duplicate creation requests to work around a failed operation.

Use storage isolated to your learner account, or an explicitly verified per-user design. If several learners share a store and the access controls are unclear, stop before entering completion data.

#### Verify Backend Persistence

1. Complete one lab. Check that its timeline button, checkbox, day count, and overall count agree.
2. Inspect the corresponding backend record using the supported data view or backend interface. Confirm that completion was written for the intended lab and learner.
3. Reload the preview. Confirm the tick and both counts are restored.
4. Uncheck the same lab. Confirm the backend record changes, then reload again. It must remain unchecked and the counts must remain correct.
5. Close and reopen the preview using the same account. Confirm the saved state is loaded again.
6. Repeat with a lab on another day and confirm Lunch is still excluded.

**Go/no-go:** Continue only if resource creation, backend writes, and restoration all succeed. A tick surviving one reload by itself is not proof of backend storage. If you cannot inspect or otherwise verify the backend writes, report persistence as unverified.

If provisioning fails, record the proposed backend, attempted action, and exact error or missing permission. Resolve the constraint before presenting saved progress as an achievable learner outcome. Do not substitute `localStorage` or `sessionStorage`.

#### Publish and Check the Live App

> **Publishing rehearsal:** Exact controls, access requirements, and the live-link behavior still need to be confirmed in the training environment.

1. After persistence passes, use the app's publishing control if it is available. If it is missing or publishing fails, stop and report the blocker.
2. Review the intended audience and permissions before publishing. Do not broaden access simply to make the link open.
3. Open the resulting live app link with the intended learner account, outside the authoring preview.
4. Repeat the completion, reload, uncheck, and reload checks through that link. Confirm the backend records change and the schedule and counts remain correct.
5. Confirm the intended audience can open the app with the expected permissions. A working authoring preview does not demonstrate a working published app.

### Congratulations!

Only after these checks pass have you demonstrated an app based on the live published schedule, connected to a persistent backend, with a working published link. If either stage is blocked, the useful rehearsal result is the documented blocker, not a claim of successful completion.

### Test Your Understanding

**Key takeaways:** The image describes appearance, the prompt defines functionality, and the agenda supplies current data. A proposed store, an approved action, an existing resource, a successful write, and a restored app state are separate checkpoints.

**Troubleshooting:** Surface permission and connection errors. Do not hide them behind an in-memory or browser-storage fallback.

**Challenge:** Identify one requirement that the screenshot alone cannot communicate. What evidence would you collect to show that a saved tick belongs to the correct learner and is restored from the backend rather than the browser?

---

## Summary of Learnings

- **Choose the platform by need:** Copilot Code offers an approachable start for simple prototypes; Copilot Studio supports the broader path toward advanced agents and managed solutions.
- **Use the live schedule for data:** read the current published agenda; use the screenshot only for design.
- **Make the backend the outcome:** create storage, connect the app, and verify real reads and writes rather than stopping at a convincing UI.
- **Establish a baseline:** verify the in-memory app before introducing a backend.
- **Review before approving:** understand what will be created and which permissions it needs.
- **Verify the whole round trip:** write, inspect, reload, undo, and reload again.
- **Separate preview from delivery:** test the live app after publishing rather than assuming preview success is enough.

### Conclusions and Recommendations

Keep the reference image and behavior requirements together. Rehearse provisioning in a fresh training environment before finalizing learner instructions. Confirm data isolation and permissions, preserve the working interface when adding storage, and report blockers explicitly.

---

## Architecture Bootcamp Latest

This lab is part of [Architecture Bootcamp Latest]({{ '/events/bootcamp-latest/' | relative_url }}).
