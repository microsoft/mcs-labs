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
description: "Build an app from the live bootcamp lab schedule in Copilot Studio Apps, then save and restore completion using a CSV file in your own OneDrive."
---

# Managed Apps

Build a managed app from the live published bootcamp lab schedule in Copilot Studio Apps. Use a screenshot as a visual reference, then connect a CSV file in your own OneDrive and verify that saved progress is restored.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 30 minutes | Create an app from the live lab schedule, connect a persistent backend, and verify saved progress and error handling in the preview. |

The 30-minute duration is a target to validate during rehearsal, not a confirmed completion time.

Allow for app generation and connection approvals. If your slot ends before the persistence or error checks finish, record them as remaining checks rather than claiming the app is complete.

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

**Choose the platform for the job.** **Copilot Code** is this bootcamp's entry point for simple apps. **Microsoft Copilot Studio (MCS)** adds a path to advanced agents, business connections, and managed deployment and governance—not a hard limit on either tool.

Here, you build an app from the live lab schedule in Copilot Studio Apps. **The backend is the learning focus:** verify real reads and writes, not just a convincing interface. This exercise does not build an advanced agent.

**A preview is not proof of persistence.** The screenshot specifies appearance, not storage, access, or reload behavior.

Build the interface, prepare your OneDrive CSV, then test saved completion and visible errors. Keep the app in preview; do not publish.

---

## Introduction

Lab 3's Copilot Code app resets progress on reload. Here, build a new app in **Copilot Studio Apps** from the **live published bootcamp lab schedule**.

This is **not** an HTML import or a Code-to-Studio migration. The included screenshot supplies appearance; the agenda supplies lab names, times, and totals. You do not need to complete Lab 3 first.

Use three prompts in the same conversation. **Prompt 1** builds the app with in-memory completion. **Prompt 2** sets up the connection and CSV file without changing app code. **Prompt 3** wires the app to read and save that file, then checks persistence through the app itself. No prepared file or database is needed.

OneDrive and CSV are this exercise's implementation choices. The transferable lesson is verifying reliable storage and retrieval.

**Connection health is the go/no-go test.** Before changing app code, confirm that the connection works and the file exists. If the connection is in an error state, stop before taking other actions and report it. A failed read must never cause an existing file to be overwritten. SharePoint, Dataverse, and browser storage are not alternatives for this exercise.

---

## Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Image-based specification** | Communicates layout and appearance without importing the earlier app's code. |
| **Live schedule input** | Reads the current published agenda when building the app rather than hardcoding schedule data from the image. |
| **In-memory progress** | Establishes a baseline that intentionally resets on reload. |
| **Persistent backend** | Saves data outside the browser so the app can restore it after reload. |
| **Connection validation** | Checks connector health and data access before changing code or initializing storage. |
| **Serialized saves and explicit errors** | Saves one change at a time, restores the screen after a failed save, and offers a retry after a failed load. |

---

## Documentation and Additional Training Links

- [Microsoft Copilot Studio documentation](https://learn.microsoft.com/microsoft-copilot-studio/) - general product reference.
- [OneDrive for Business connector reference](https://learn.microsoft.com/connectors/onedriveforbusiness/) - connector actions and connection requirements.
- [Manage connections in Power Apps](https://learn.microsoft.com/power-apps/maker/canvas-apps/add-manage-connections) - creating and deleting connections.
- [Live published bootcamp agenda](https://microsoft.github.io/mcs-labs/events/bootcamp-latest/) - source of truth for the app's schedule data.

Use your facilitator's environment-specific guidance for feature access and connector availability.

---

## Prerequisites

> [!IMPORTANT]
> **Attending a CAT bootcamp or another proctor-led event with a pre-provisioned user account? You can skip the prerequisite setup: it is already prepared for you.** Your lab account, environment, licences, connections and sample data are ready. Go straight to [Use Case #1](#use-case-build-an-app-with-a-persistent-backend) and sign in with your lab account when prompted. If anything is missing, ask your instructor. The prerequisites below are for learners completing the lab independently.

**Running this lab in your own tenant?** Set this up first:

- Access to **Copilot Studio Apps**, including image upload and app preview in your environment.
- Permission for the app-building experience to read the published bootcamp agenda.
- Your own OneDrive for Business and permission to read, create, and update files in it.
- Access to the OneDrive for Business connector in your training environment, with permission to create a connection using your account if needed.

Use your own account and OneDrive, not another learner's connection or file. No pre-existing CSV file, SharePoint list, prepared database, or VS Code setup is required. Publishing is outside this exercise.

---

## Summary of Targets

By the end of a successful rehearsal, you will be able to:

- Create an app whose schedule data comes from the live published agenda, using an image only as a visual reference.
- Confirm that its labs and Lunch match the current published agenda rather than the screenshot's historical counts.
- Set up a healthy connection and a CSV file containing one row per scheduled lab before changing app code.
- Verify that completing and unchecking a lab update the CSV and persist after a reload.
- Verify reads and saves through the app itself, not just direct connector calls.
- Check disabled controls during loading, serialized saves, save-failure rollback, and load-error retry.
- Keep the app in preview until you are explicitly instructed to publish.

---

## Use Case Covered

| Step | Use Case | Value added | Target effort |
| ---- | -------- | ----------- | ------------- |
| 1 | [Build an app with a persistent backend](#use-case-build-an-app-with-a-persistent-backend) | Use the live lab schedule to create an app, then connect and verify OneDrive CSV storage in the preview. | 30 min |

Submit Prompts 1, 2, and 3 in order in the same conversation, checking each stage before continuing. Test the connection, CSV contents, persistence, and error handling in preview. Do not publish until instructed.

---

## Instructions

---

## Use Case: Build an App with a Persistent Backend

**Scenario:** You want an app based on the live bootcamp lab schedule that saves completion to a CSV file in your own OneDrive. Use the provided image or your Lab 3 app screenshot as a design reference, not as the source of schedule data.

### Objective

Create an app from the live published agenda, connect its reads and writes to your OneDrive CSV file, and verify saved completion and error handling without publishing.

### Step-by-Step Instructions

#### Save and Upload the Reference Image

1. Choose your starting image: save the provided screenshot below, or take a screenshot of your current **Lab 3: Copilot Code** app. Either option works; you do not need to have completed Lab 3 to use the provided screenshot.
2. Open [Copilot Studio](https://copilotstudio.microsoft.com) and sign in with your lab account. Select your assigned environment. If **Welcome from your admin** appears, read the terms, select **I have read and agree to the Terms of use**, then **Close**. Dismiss any teaching bubbles with **Got it**.
3. Select **Apps (Preview)**, then **New app**.
4. In the new app's chat, select **Add attachments**, then **Upload images and files**, and choose the reference image. Wait until its thumbnail appears above **Chat input** before sending Prompt 1.

![Reference image attached in the new app conversation](assets/reference-attached.png)

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
connector or data store yet. Do not publish, deploy, or share
the app. Show me the working preview.
```

#### Watch the App Take Shape

While the app is being built, follow any visible progress updates, reasoning summaries, and tool activity. Look for how it interprets the screenshot, reads the agenda, and builds the interface. Expand activity details if available, and notice any questions or approval requests. These updates can help you spot misunderstandings early, but they do not replace checking the finished app.

Wait for the preview. If the agenda cannot be read, stop and tell your facilitator; do not ask for an invented schedule.

If activity starts **App publish** before you authorize publishing, select **Stop generating response** and tell Copilot to keep the app in preview only. Ask your facilitator to check the app's status: stopping an in-flight action does not guarantee that it made no changes.

#### Check the In-Memory Preview

- Compare every day's lab numbers, titles, and times with the live published agenda, not the screenshot. Include Lunch, but exclude other agenda items and optional labs.
- Confirm that all labs start unchecked and the overall total counts labs only.
- Toggle a timeline lab button and then a card checkbox. Both controls, the day's count, and overall progress must stay synchronized.
- Switch days and switch back. Completion should remain during the session.
- Confirm Lunch cannot be completed and never increases the completed count.
- Use the keyboard to reach and operate the tabs and completion controls. Check that focus is visible.
- Select **Reload preview** in the app toolbar. Completion must reset at this stage because no persistent store has been added.

![App preview with a completed lab, synchronized day and overall counts, and visible keyboard focus on its timeline button](assets/completion-focus.png)

The Studio shell is shown in light mode; the app itself uses the dark theme requested in Prompt 1. Your generated layout and current agenda totals may differ.

Once the in-memory checks pass, continue in the same app-building conversation to add saved progress. If the preview copies outdated counts from the image or loses synchronization, correct that behavior before requesting storage.

> **Connection gate:** If the OneDrive for Business connection is in an error state, stop and report it before taking any other action. Do not treat a failed file read as proof that the file is missing.

#### Prompt 2: Set Up Storage

In the same app-building conversation, submit:

```text
Set up storage for saving lab completion. Don't change the app's
code yet.

Use a CSV file in my own OneDrive, accessed through the OneDrive
for Business connector. Do not use SharePoint, Dataverse, browser
localStorage or sessionStorage.

You are authorized to create the OneDrive for Business connection
with my account if I don't have a working one. If the connection
is in an error state, stop and tell me before doing anything else.

File:
- Path: /Apps/My Bootcamp Lab App/lab-completion.csv
- Create it if it doesn't exist: one row per scheduled lab, using
  lab-N IDs from the live agenda's lab numbers, all incomplete.
  Lunch is never in the file.
- Columns: labId, completed (true/false), updatedAt (ISO time).
- If it already exists, don't change it.

Connect the app to OneDrive for Business so it can read and write
this file.

Then report: the connection state, whether the file was created or
already existed, and its current rows.
```

The CSV rows must match the labs read from the live agenda, not a fixed count or the reference image. Each `labId` uses the scheduled lab number, such as `lab-1`. Lunch and optional labs must not have rows.

#### Confirm the Connection and File

1. Confirm the OneDrive for Business connection belongs to your account and works. If no connection exists, allow creation with your account. If an existing connection is in an error state, pause the app build, report it, and follow [Troubleshoot a Broken Connection](#troubleshoot-a-broken-connection) before continuing.

   For the **Create connection** prompt shown below, confirm the service is OneDrive for Business (the card may display **Onedriveforbusiness**), then select **Approve** and sign in with your training account if requested. An existing working connection may be reused without another sign-in.

   <a href="assets/onedrive-connection.png"><img src="assets/onedrive-connection.png" alt="Create connection prompt for OneDrive for Business with an Approve button" width="370" class="align-center"></a>

2. Confirm this file exists in your own OneDrive before the app code is changed:

   ```text
   /Apps/My Bootcamp Lab App/lab-completion.csv
   ```

   If the folder is missing and a **Create folder?** prompt appears, confirm the name is **My Bootcamp Lab App** and the destination is `/Apps` in your own OneDrive, then select **Create**.

   If `/Apps` itself is missing, Copilot may first request **Create folder?** with **Name** set to `Apps`. Confirm it is creating that parent folder in your own OneDrive, then approve creation of the app folder inside it.

   <a href="assets/create-folder.png"><img src="assets/create-folder.png" alt="OneDrive Create folder prompt for the lab app folder with a Create button" width="370" class="align-center"></a>

   For a confirmed missing CSV, review the **Upload file content** request for **lab-completion.csv**. Expand **View details**, confirm the destination is your own app folder, and check that a name conflict will **stop**, not overwrite an existing file. If the destination shows **Location name unavailable**, confirm the actual destination before selecting **Approve**; stop if you cannot verify it. Do not approve a new-file upload when the CSV already exists.

   <a href="assets/upload-file-content.png"><img src="assets/upload-file-content.png" alt="Upload file content approval for lab-completion.csv with name-conflict behavior set to stop" width="370" class="align-center"></a>

3. For a newly created file, verify the columns are `labId`, `completed`, and `updatedAt`, with one row per scheduled lab, `false` completion values, and ISO timestamps. If a file already exists, preserve its saved values.
4. Review the setup report: the connection state, whether the file was created or already existed, and its current rows. Confirm the app has the connection available and that its code has not been changed yet.

If access or creation fails, stop and record the error. Do not switch to SharePoint, Dataverse, `localStorage`, or `sessionStorage` to make the preview appear successful.

At this stage, storage is ready but the app still uses its in-memory behavior. Completion is not expected to survive a reload until Prompt 3 has wired the app to the file.

#### Troubleshoot a Broken Connection

If the OneDrive for Business connection remains in an error state, ask your facilitator before changing it. Repair the connection on the **Power Apps** side; do not delete a shared connection to make this lab work:

1. Open [Power Apps](https://make.powerapps.com), select the same environment used by your app, and open **Connections** (under **Data** if shown).
   If **Welcome to Power Apps** asks for a country/region and **Get started**, ask your facilitator to complete the account setup before proceeding.
2. Find your broken **OneDrive for Business** connection. Open its **…** menu and try updating its credentials. If repair fails, have your facilitator confirm that no other apps or flows use it before selecting **Delete**. Never delete another learner's connection.
3. If a replacement is needed, select **New connection**, choose **OneDrive for Business**, and reconnect with your own training account.

**Keep your CSV file intact.** Return to Copilot Studio Apps and rerun **Prompt 2** to connect the app to the working connection and confirm the existing file and rows. Continue with **Prompt 3** only after those checks pass. If reconnection fails, stop and report the error rather than repeatedly deleting connections.

#### Prompt 3: Wire the App to the File

Once the connection and file checks pass, submit this in the same conversation:

```text
Now make lab completion save to and restore from that OneDrive CSV.

Reading the file:
- Request the file content as raw bytes, not with content-type
  inference (for "Get file content", set inferContentType to false).
  A .csv returned as text/csv can be rejected by the app's data
  layer before your code sees it.
- The content may still come back as text, base64 or raw bytes;
  handle all three and treat anything else as an error.

App behavior:
- On open, read the file and restore completion. Keep checkboxes
  and timeline buttons disabled until the load finishes.
- If the file is missing for the current user, create it;
  never overwrite an existing file on a failed read.
- On each change, rewrite the whole file. Run saves one at a time
  so the file never goes backwards. Show "Saving…" while saving.
- If a save fails, undo the change on screen and show a message.
- If loading fails, show an error with a Try again button, and log
  which step failed (metadata, read, create or save).
- Keep the existing interface and behavior unchanged: timeline,
  checkboxes, day counts and overall progress stay in sync, and
  Lunch never counts toward completion.

Before you report done, confirm the read and save work through
the app itself, not only by calling the connector directly. If you
can't verify this yourself, say so and list it as a remaining check.

When done, tell me how to test it in the preview (tick, reload,
check the CSV). Don't publish until I say so.
```

Ask Copilot to confirm that the app's **Get file content** call sets `inferContentType` to `false` and handles text, base64, and raw-byte responses. A failed read or unsupported response must be an error, not a reason to initialize or overwrite the file.

#### Verify CSV Persistence in Preview

Use one open preview for these checks.

1. Open the preview. Confirm that checkboxes and timeline buttons stay disabled until the CSV has loaded, then reflect its saved values.
2. Complete one lab. Check that its timeline button, checkbox, day count, and overall count agree. Watch for **Saving…** and wait for the save to finish.
3. Inspect the CSV in your OneDrive. Confirm the correct `labId` has `completed` set to `true` and `updatedAt` contains an ISO timestamp.
4. Reload the preview. Confirm the tick and both counts are restored from the file.
5. Uncheck the same lab and wait for saving to finish. Confirm its CSV value changes to `false`, then reload again. It must remain unchecked with the correct counts.
6. Change multiple labs in quick succession and wait for all saves to finish. Confirm the CSV and screen agree with the final choices rather than an earlier state.
7. Close and reopen the preview with the same account. Confirm the saved state is loaded again.
8. Confirm the CSV still has exactly one row per scheduled lab and no Lunch or optional-lab rows.

**Persistence evidence:** Test through the app and check the actual CSV as well as the screen. A successful direct connector call or a tick surviving a reload by itself is not proof that the app reads and saves correctly. If Copilot cannot verify the app's read and save path, treat that as a remaining check and perform it in preview.

#### Check Load and Save Errors

Use facilitator-approved test conditions; do not delete or corrupt an existing CSV to force an error.

- **Load failure:** Check that the app shows an error and a **Try again** button, leaves completion controls disabled, and does not overwrite the file. Inspect the logged failure step: `metadata`, `read`, `create`, or `save`. After the connection or access problem is resolved, retry and confirm the saved values load.
- **Unsupported file response:** Confirm an unexpected content format is reported as an error, not treated as an empty file.
- **Save failure:** Check that the attempted change is undone on screen, all counts and controls return to the prior saved state, and a message appears. Resolve the failure before retrying and verify the CSV.
- **Missing file:** Only a confirmed missing-file result may trigger creation for the current user. Do not treat permission or connection failures as a missing file.

#### Finish in Preview

Stop after the preview checks and report any failed connection, load, or save test to your facilitator. Do not publish until explicitly instructed.

### Congratulations!

Once these checks pass, you have demonstrated an app based on the live published schedule with completion saved to your OneDrive CSV and restored in preview. If a check fails, record the blocker rather than claiming successful persistence.

### Test Your Understanding

**Key takeaways:** The image describes appearance, the prompt defines functionality, and the agenda supplies current data. A working connection, an existing CSV, a successful save, and a restored screen are separate checkpoints.

**Storage is not app wiring:** Prompt 2 prepares the connection and file; Prompt 3 changes the app's read and save behavior. Both must work before persistence is complete.

**Troubleshooting:** Surface permission and connection errors. Do not hide them behind an in-memory or browser-storage fallback.

**Challenge:** Why is a failed read different from a missing file? What evidence shows that completion was restored from your own OneDrive CSV rather than browser storage?

---

## Summary of Learnings

- **Choose the platform by need:** Copilot Code offers an approachable start for simple prototypes; Copilot Studio supports the broader path toward advanced agents and managed solutions.
- **Use the live schedule for data:** read the current published agenda; use the screenshot only for design.
- **Make the backend the outcome:** connect the app to persistent data and verify real reads and writes rather than stopping at a convincing UI.
- **Establish a baseline:** verify the in-memory app before introducing a backend.
- **Check access first:** verify the connection and file before changing app code.
- **Separate setup from integration:** prepare storage with Prompt 2, then wire and test the app with Prompt 3.
- **Handle failures explicitly:** serialize saves, undo failed changes, offer load retry, and never overwrite a file because a read failed.
- **Verify the whole round trip:** write, inspect, reload, undo, and reload again.
- **Keep preview separate from publishing:** do not publish until explicitly instructed.

### Conclusions and Recommendations

Keep the reference image and behavior requirements together. Use your own OneDrive connection and CSV file, derive its rows from the live schedule, and preserve the working interface when adding storage. Check the file after ticking, reloading, and unchecking, surface failures explicitly, and leave publishing for a separate instruction.

---

## Architecture Bootcamp Latest

This lab is part of [Architecture Bootcamp Latest]({{ '/events/bootcamp-latest/' | relative_url }}).
