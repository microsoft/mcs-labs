---
layout: lab
module: workflows-latest
title: "Workflows"
order: 341
duration: 30
difficulty: 300
lab_type: local
section: advanced_labs
journeys: ["autonomous-ai", "developer"]
description: "Build a workflow using the Microsoft Copilot harness in Copilot Studio, with an event-driven trigger and a non-deterministic inline agent that books calendar time and updates a to-do."

---

# Workflows

Build an **autonomous agent** in Microsoft Copilot Studio using **Workflows** — an agent that runs on a trigger instead of waiting for a chat, and hands real work to a non-deterministic inline agent.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 300 | Maker | 30 minutes | After completing this lab, participants will be able to create a Workflow in Copilot Studio, fire it from an event-driven **trigger**, and embed a non-deterministic **inline agent** that reasons over the trigger's data and acts through tools (Outlook calendar, Microsoft To Do, and web search) — going beyond the classic, deterministic autonomous-agent model. |

> **Bootcamp Latest pacing:** Complete Use Cases #1–#3 in 30 minutes (15 + 8 + 7 minutes). Inventory management and the price-quote specialist are optional extra credit outside this allocation. The [shared lab](../mcs-workflows/) uses the same core pacing.

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
  - [Use Case #1: Automate Task Time-Blocking with a Workflow and an Inline Agent](#use-case-1-automate-task-time-blocking-with-a-workflow-and-an-inline-agent)
  - [Use Case #2: Setting Up the Order Management Workflow](#use-case-2-setting-up-the-order-management-workflow)
  - [Use Case #3: Use M365 Copilot and Add a Human-in-the-Loop in Order Management](#use-case-3-use-m365-copilot-and-add-a-human-in-the-loop-in-order-management)
  - [Extra Credit: Build an Inline Agent for Inventory Management](#extra-credit-build-an-inline-agent-for-inventory-management)
  - [Extra Credit: Call a Price Quote Specialist Agent from a Workflow](#extra-credit-call-a-price-quote-specialist-agent-from-a-workflow)
- [Clean Up](#clean-up)
- [Summary of Learnings](#summary-of-learnings)
- [Conclusions & Recommendations](#conclusions--recommendations)

---

## Why This Matters

**Makers and Developers** — want your agents to *do work on their own*, in the background, the moment something happens — instead of only answering when a user types a message?

Think of Workflows as the autonomous side of Copilot Studio:
- **Conversational agents** respond to chat turns; agents can also act autonomously through event triggers.
- **Workflows** start from a **trigger** (manual, scheduled, or an external event) and follow a defined sequence, pausing for human input when configured.
- **The new agent node** lets a Workflow hand a step to a *reasoning* agent rather than a fixed, deterministic action — so the automation can decide *how* to accomplish a goal, not just replay hard-coded steps.

**Common challenges solved by this lab:**
- "I want automation that kicks off when a record changes, not when someone opens a chat."
- "My flows are rigid — I need a step that can reason about messy, real-world inputs and choose what to do."
- "I want an agent that can read my calendar, book time, and update a task — on its own."

**The 30-minute core covers Use Cases #1–#3:** an inline agent that blocks focus time and enriches a task, and a multi-branch order-management workflow with human-in-the-loop approval. **Optional extra credit** adds an MCP-powered inventory agent and calls a published price-quote specialist agent.

> [!NOTE]
> The duration is a workshop target, not a measured completion guarantee; trigger pickup and human approval can add waiting time. Finish the core verification and [cleanup](#clean-up) before attempting extra credit.

---

## Introduction

Workflows in Microsoft Copilot Studio combine a defined automation sequence with AI-powered steps. This lab uses the **Microsoft Copilot harness** workflow experience, not standard-harness agent flows. A workflow starts from a **trigger**, making it useful for "when X happens, do Y" automation across Microsoft 365 and connectors. Its **Agent** node can delegate a step to an inline, *non-deterministic* agent that reasons over the trigger's data and calls tools, while the surrounding workflow controls the sequence and branches.

**Real-world example:** You keep a running list of things you need to do, but you never actually block time to do them. In this lab you'll build a Workflow that watches a Microsoft To Do list. The moment you add a task, the Workflow's inline agent reads the task, checks your Outlook calendar for an appropriate slot within your working hours, books a focus block, and then updates the to-do with a due date, a reminder, helpful notes, and a category — all autonomously. You add one task; the agent does the planning.

This example is covered in **Use Case 1** of this lab. It establishes the foundation — trigger plus inline agent plus tools — that the later use cases build on.

---

## Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Workflow** | The autonomous unit in Copilot Studio. It runs on a trigger instead of a chat turn, so work happens in the background without a user present. |
| **Trigger** | What starts a Workflow. Triggers can be manual, scheduled (recurrence), or **connector-based** (an event in an external service, like a new Microsoft To Do task). |
| **Inline agent (agent node)** | A *non-deterministic* agent embedded directly in a Workflow step. Instead of a fixed action, it reasons over the input and decides how to achieve the goal. |
| **Dynamic content / `/` token** | A reference to data produced earlier in the Workflow (e.g., the trigger's to-do **Title**), inserted into the agent's instructions so it acts on the *actual* item at run time. |
| **Tools** | The capabilities you grant the agent so it can take action — here the **Find meeting times** and **Create event** actions (Office 365 Outlook), the **Update to-do** action, and **Web search**. |

---

## Documentation and Additional Training Links

* [Workflows in Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview)
* [Add an inline or published agent to a workflow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/agent-node-workflow)
* [Workflow designer, testing, and run history](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flow-designer)
* [Add tools and MCP servers to an inline agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/agent-node-workflow#tools)
* [Event triggers for standard-harness agents (comparison)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about)
* [Microsoft To Do](https://to-do.office.com/) · [Outlook Calendar](https://outlook.office.com/calendar/)

---

## Prerequisites

> [!IMPORTANT]
> **Attending a CAT bootcamp or another proctor-led event with a pre-provisioned user account? You can skip the prerequisite setup: it is already prepared for you.** Your lab account, environment, licences, connections and sample data are ready. Go straight to [Use Case #1](#use-case-1-automate-task-time-blocking-with-a-workflow-and-an-inline-agent) and sign in with your lab account when prompted. If anything is missing, ask your instructor. The prerequisites below are for learners completing the lab independently.

**Running this lab in your own tenant?** Set this up first:

- Use a development or training environment, not production, with access to Copilot Studio **Workflows**, available Copilot Credits, and a work account with **Outlook**, **Microsoft To Do**, and access to **Microsoft 365 Copilot** for Use Case #3. Use that same account for every connection.
- Arrange a starter **To Do Time Block** workflow for Use Case #1. Confirm it contains the Microsoft To Do trigger before starting; the instructions below configure an existing workflow rather than create one from scratch.
- Import [LAB: Order Management Workflows](../mcs-workflows/assets/solutions/LABOrderManagementWorkflows_1_0_0_8.zip) for the **Order Management Workflow** and **Price Quote Agent**, used in Use Cases #2–#3 and the extra-credit exercises. Sign in to the connections requested during import.
- For the inventory extra credit only, import [Enhanced Task Completion](../mcs-workflows/assets/mcp-servers/EnhancedTaskCompletion_1_0_0_2.zip) for **Warehouse MCP**, and ensure Dataverse MCP can create **Task** rows.
- For the price-quote extra credit only, provide the SharePoint pricing guide and Dataverse account records for Adventure Works and Fabrikam. The packages above do not include these.

Workflows and standard-harness agent flows have different authoring experiences. The [workflow documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview) describes the experience used here; some Learn pages still use the earlier harness name.

---

## Summary of Targets

In this lab, you'll build several autonomous Workflows that act on event-driven triggers and hand real work to inline and published agents. By the end, you will be able to:

- Configure **connector-based triggers** and explain when manual or scheduled triggers would be appropriate.
- Embed a **non-deterministic inline agent** in a workflow, give it goal-oriented instructions, and reference earlier data with the **`/` dynamic-content token**.
- Equip agents with Microsoft 365 **tools** (Office 365 Outlook's **Find meeting times** and **Create event**, Update to-do, web search) and use **M365 Copilot** inside a workflow; explore **Dataverse MCP** in optional extra credit.
- Add a **human-in-the-loop approval** step so a person validates an AI-drafted action before the workflow continues.
- **Publish, run, and monitor** workflows end-to-end; optionally call a separate **published agent** from a workflow branch in extra credit.

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Automate Task Time-Blocking with a Workflow and an Inline Agent](#use-case-1-automate-task-time-blocking-with-a-workflow-and-an-inline-agent) | Build an autonomous, trigger-driven Workflow whose inline agent reasons over a task and acts across your calendar and to-do list | 15 min |
| 2 | [Setting Up the Order Management Workflow](#use-case-2-setting-up-the-order-management-workflow) | Verify connections and publish a pre-built multi-branch classification workflow | 8 min |
| 3 | [Use M365 Copilot and Add a Human-in-the-Loop](#use-case-3-use-m365-copilot-and-add-a-human-in-the-loop-in-order-management) | Validate the Customer Inquiry path: Copilot drafts a response, human approves, workflow replies | 7 min |
| EC | [Extra Credit: Build an Inline Agent for Inventory Management](#extra-credit-build-an-inline-agent-for-inventory-management) | Add an MCP-powered inline agent that checks warehouse stock and creates Dataverse tasks (Optional) | ~15 min |
| EC | [Extra Credit: Call a Price Quote Specialist Agent from a Workflow](#extra-credit-call-a-price-quote-specialist-agent-from-a-workflow) | Wire a published agent into a workflow branch to generate and send price quotes (Optional) | ~10 min |

Use Cases #1–#3 total 30 minutes (15 + 8 + 7 minutes). Both extra-credit exercises are outside this allocation.

---

## Instructions by Use Case

> [!WARNING]
> **Use only your assigned training artifacts and account.** Confirm which workflows belong to you before editing or publishing; do not modify another attendee's workflow or connection. Send test emails and approval requests only to your signed-in lab account. Check every reviewer and recipient field before enabling a workflow; keep any message intended for someone else as a draft. Calendar blocks are for your own calendar, without attendees. These tests can consume Copilot Credits.
>
> Stop each workflow when its tests are finished, and always complete [Clean Up](#clean-up) before leaving.

---

## Use Case #1: Automate Task Time-Blocking with a Workflow and an Inline Agent

Build a Workflow that watches a Microsoft To Do list and, whenever a task is added, lets an inline agent autonomously block focus time on your calendar and enrich the task.

> [!IMPORTANT]
> **This exercise requires the pre-created To Do Time Block workflow.** If it is missing, ask your facilitator for the starter. Until it is available, this use case is blocked; you can continue independently with [Use Case #2](#use-case-2-setting-up-the-order-management-workflow). Do not substitute another attendee's workflow or count the time-blocking exercise as completed.

**Summary of tasks**

In this section, you'll create a To Do list to watch, configure the pre-created To Do Time Block Workflow with a To Do trigger, add a non-deterministic inline agent with goal-oriented instructions and tools, publish it, and then trigger it with a real task and verify the results.

**Scenario:** You capture work in Microsoft To Do but never actually reserve time to do it. You want an assistant that, the moment you jot down a task, finds an appropriate slot in your workday, books a calendar block, and updates the task with a due date, reminder, notes, and category — without you lifting a finger beyond adding the task.

### Objective

Configure and publish the **To Do Time Block** Workflow: a To Do trigger feeds a new task to an inline agent that schedules a calendar block within your working hours and updates the to-do — then run it end-to-end and confirm the calendar event and the enriched task.

---

### Step-by-step instructions

#### Create the To-Do list that drives the workflow

1. Go to [Microsoft To Do](https://to-do.office.com/). The first time you open it, you need to **sign in** — use the **same account** you use for Copilot Studio.

   > [!TIP]
   > The workflow's trigger connects to *your* To Do, so the list and the workflow must live under one identity.

2. In **Microsoft To Do**, select **New list** in the left sidebar, name it **Time Block**, and press **Enter** to create it. This is the list the workflow will watch — adding a task here is what triggers the automation.

   ![The new Time Block list created in Microsoft To Do](../mcs-workflows/images/create-time-block-list.png)

#### Open the workflow and configure its trigger

3. Open [Copilot Studio](https://copilotstudio.microsoft.com/) and sign in with your lab account. Select your assigned environment, then **Workflows** in the left navigation, open your pre-created **To Do Time Block** workflow, and select **Build**.

   If a first-visit notice or environment tour appears, read it and dismiss it before continuing. If the assigned workflow is missing, ask your facilitator rather than editing another user's workflow.

   > [!TIP]
   > Workflows are the autonomous side of Copilot Studio — they run on a trigger instead of waiting for a user to chat. You'll find them in the left navigation next to **Agents**.

4. Select the **When a new to-do in a specific folder is created** trigger. Under **Connection**, select **Create new connection** and sign in with your lab account if there isn't one. In **To-do list**, switch to **Select from list** and select **Time Block**. This makes the workflow fire automatically whenever a task lands in that list.

   > [!TIP]
   > If the list picker initially appears empty, type **Time Block** and select the matching option or press **Enter** to commit the selection. Confirm the required-field/setup warning disappears before continuing.

   > [!WARNING]
   > In the connection account picker, double-check you pick *your lab account* — not a personal or other work account. The workflow will read and write *that* account's To Do and calendar.

   ![The To Do Time Block workflow with its trigger configured](../mcs-workflows/images/trigger-todo-time-block.png)

5. Delete the **Scope** node — it isn't useful for this lab.

#### Add and configure the inline agent

6. Select the **+** after the trigger and choose **Agent** to add an agent node. Reuse the connected lab-account connection, or **Create new connection** if needed. Leave the **Agent** dropdown on **New agent for this workflow** — this creates a brand-new, *non-deterministic* agent dedicated to this workflow rather than reusing an existing one.

   > [!TIP]
   > This is the heart of the lab: instead of hard-coded actions, the workflow hands the task to an agent that *reasons* about how to schedule it.

   ![Agent node added with New agent for this workflow selected](../mcs-workflows/images/add-new-agent-node.png)

7. In the **Instructions** box, give the agent its goal. Enter it in three parts so the agent receives the *actual* to-do title at run time:

   1. Type the first line of text:

      ```
      Find a time that is appropriate for this task
      ```

   2. Add a space after the text, then type **`/`** to open the dynamic-content picker and select **Title** (under *When a new to-do in a specific folder is created*). This inserts the to-do's title as a token. Copilot Studio automatically adds an **Apply to each** loop when this array-item token is inserted, so the agent runs once per new to-do; the loop need not appear when you first add the Agent node.

   3. Continue typing the rest of the instruction right after the token:

      ```
      on my calendar in the next couple of business days and block that time on my calendar to work on this task. Then update the to-do with a due date a week out from the time block we created. Add appropriate notes and suggestions in the notes on key things I might want to consider. Also set a reminder 2 days before the due date. Make sure that the format of the Calendar notes and To-Do are formatted properly for the user to be able to read them well. Only schedule the time block within my normal working hours of 8:00 AM to 5:00 PM.
      ```

   > [!IMPORTANT]
   > The **`/Title`** token is what makes this dynamic — the agent receives each new task's real title, so its scheduling decision is grounded in the actual to-do rather than a fixed string. The final sentence constrains *when* the agent books focus time; without it, the agent may pick the first technically-free slot (even very early morning).

   ![The completed agent instructions with the Title token inserted inline](../mcs-workflows/images/agent-instructions-filled.png)

8. Give the agent the tools it needs to act. In the agent panel:

   - Under **Tools**, select **+** (Add tool), search for **Find meeting times**, and choose the result whose connector is **Office 365 Outlook** (*Find meeting time suggestions based on organizer, attendee availability, and time or location constraints*). Reuse your connected lab-account connection or select **Create new connection** if needed, then **Add**.
   - Add a second tool: **+** → search **Create event** → choose the **Office 365 Outlook** result (*This operation creates a new event in a calendar*) → **Add** (it reuses the Outlook connection you just created).
   - Add a third tool: **+** → search **Update to-do** → under **Microsoft To-Do (Business)** choose **Update to-do** → reuse your lab-account connection or **Create new connection** if needed, then **Add**.
   - Turn on the **Web search** toggle so the agent can look things up (e.g., venue or location details referenced in a task).

   > [!WARNING]
   > **Check the connector, not just the tool name.** The picker returns several tools with near-identical names from unrelated connectors — searching `Create event` also returns an **Eventbrite** "Create event" and other look-alikes. Pick the row showing the **Office 365 Outlook** icon; the panel names the connector under the tool title before you select **Add**. Choosing the wrong one leaves the agent unable to reach your calendar.

   > [!TIP]
   > **Find meeting times** lets the agent read your free/busy and propose a slot; **Create event** books the focus block on your Outlook calendar; **Update to-do** writes the due date, notes, and reminder back onto the task. Granting the two calendar actions separately — rather than one broad calendar tool — gives the agent exactly the capabilities the goal needs and nothing more.

   ![Agent configured with the Find meeting times and Create event Outlook tools, Update to-do, and Web search enabled](../mcs-workflows/images/agent-tools-web-search.png)

#### Publish, then trigger the workflow

9. Select **Save**, then **Publish**. On the **Workflows** page, confirm this workflow is **Enabled** before adding the test task.

   > [!WARNING]
   > **Publish and enable before testing.** A disabled workflow keeps its definition and run history but does not start new runs. Add the test to-do only after publishing and checking **Enabled**. Use **Activity** to inspect the run.

   ![The published To Do Time Block workflow showing Trigger, Apply to each, and Agent nodes](../mcs-workflows/images/workflow-published.png)

10. Open **Microsoft To Do**, go to the **Time Block** list, and add a new task with the following title. Creating this task in the watched list is what fires the workflow's trigger.

    ```
    Book Skull's Rainbow Room in Nashville for Next Friday
    ```

    > [!TIP]
    > Use a task whose title implies a real-world commitment with a time and place — it gives the agent something concrete to reason about (find a slot, block the calendar, look up the venue).

    ![The new task added to the Time Block list in Microsoft To Do](../mcs-workflows/images/add-todo-task.png)

#### Watch the workflow run

11. Back in the workflow, open the **Activity** tab and select **Refresh** to look for the run. When the new run appears (status **Running**), select it to open the run details and watch the workflow execute node-by-node (trigger → **Apply to each** → **Agent**).

    > [!IMPORTANT]
    > Be patient — the To Do trigger polls on a schedule, so the run can take a **few minutes** to appear. Press **Refresh** in the Activity list a few times until it shows up.

    ![The new run showing as Running in the Activity view](../mcs-workflows/images/activity-run-running.png)

    ![The run executing, with the trigger succeeded and the Agent node in progress](../mcs-workflows/images/run-monitor-executing.png)

12. In the run details, select the **Agent** node to expand its details. You'll see the agent's own narration of what it did — checking your free/busy, choosing a time block *inside your working hours*, creating the calendar event, finding the to-do, and updating it. This is the *non-deterministic* part: the agent decided the specifics, they aren't hard-coded in the workflow.

    > [!TIP]
    > The Agent's **Outputs / Response** is a great teaching moment — it shows the model reasoning step-by-step and calling the Find meeting times, Create event, and Update to-do tools on its own.

    ![The Agent node run details showing the agent's reasoning and tool actions](../mcs-workflows/images/agent-run-details.png)

#### Verify the results

13. Go back to **Microsoft To Do** and refresh the **Time Block** list. Open your task — it has been updated by the agent: a **due date** (a week out), a **reminder** set 2 days before the due date, and richly formatted **notes** (target date, the scheduled work block, and an action checklist).

    > [!TIP]
    > Switch the list to **List** view and open the task to see the full notes the agent wrote — it even researched the venue with web search.

    ![The to-do updated by the agent with due date, reminder, and formatted notes](../mcs-workflows/images/todo-updated-details.png)

14. Open **Outlook → Calendar**. The agent has added a **time block** event to reserve time to work on the task — on the next business day it found free and **within your 8:00 AM–5:00 PM working hours** — with a body summarizing the target date and venue. The workflow ran end-to-end with no further input from you.

    ![The calendar time-block event the agent created in Outlook](../mcs-workflows/images/calendar-event-details.png)

15. Return to **Workflows**, turn off **Enabled** for your **To Do Time Block** workflow, and reload the page to confirm it remains disabled. Do this before moving to Use Case #2; the later exercises do not need this trigger.

---

### Congratulations! You've built an autonomous Workflow with a reasoning inline agent.

---

## Use Case #2: Setting Up the Order Management Workflow

Configure and publish a pre-built **Order Management Workflow** that classifies incoming emails and routes them through different processing paths — then verify the setup end-to-end by testing the "Other" classification path.

**Summary of tasks**

In this section, you'll open the workflow to verify its connections, explore the email classification categories, publish, and verify everything works by sending a test email that triggers the "Other" classification path.

**Scenario:** Your environment includes a pre-built Order Management Workflow that automatically classifies incoming emails with "Order Management" in the subject. It routes emails into one of four categories — **Quote Request**, **Supplier Delay**, **Customer Inquiry**, or **Other** — and takes different automated actions for each. Before the workflow can run, you need to verify its connections and publish it.

### Objective

Complete the setup of the **Order Management Workflow**: verify its connections, explore the classification categories, publish, and validate end-to-end by sending a test email through the "Other" path.

> [!IMPORTANT]
> This use case is the **foundation for all subsequent use cases** in this module. The connections and publishing you complete here are required for the Customer Inquiry, Quote Request, and Supplier Delay paths covered later. Take extra care during setup — if a connection is missed, later use cases will fail silently or with hard-to-diagnose errors.

---

### Step-by-step instructions

#### Open the workflow and verify its connections

> [!IMPORTANT]
> **Verify the connections first.** The workflow must have valid node connections before it can be published or tested. They may already be configured correctly — inspect them first.

1. In **Copilot Studio**, navigate to **Workflows**, open the starter **Order Management Workflow**, and select **Build**. In the designer header, select **More options** > **Create a copy**. Give the copy a unique name, such as **Order Management WF**, then select **Open workflow** in the confirmation. The copy opens in a **new browser tab**. Continue only in that copy, leaving the original unchanged.

   > [!NOTE]
   > Use the designer header menu, not the list row's **More actions** menu, which may offer only **Delete**. In the copy, you'll see **When a new email arrives**, **Classify**, and the category branches. References to the Order Management workflow below mean your copy.

   ![The Order Management Workflow open in the canvas designer](../mcs-workflows/images/order-management-workflow-overview.png)

2. Open each node on the canvas so its connection can resolve. Start with **When a new email arrives** and, under **Connection**, wait for your lab-account connection to load. Check the **Copilot** and **Human review** nodes as well; these can also resolve automatically.

   Reuse healthy lab-account connections. If **Human review** needs a connection, select **Create new connection**, give it a recognizable display name such as **WF Human review**, leave **Authentication Type** as **Default**, and select **Create**. This connection is marked **Premium**. Complete any sign-in with your lab account; do not replace working connections.

#### Open and explore the Order Management Workflow

3. Select **When a new email arrives**. Keep the existing **Subject filter** token, displayed as **string**. Hover over it to inspect `string('Order Management')`: the subject must contain "Order Management".

   Select **Add advanced parameter** > **From**. Enter your own signed-in lab account in the people picker and resolve the matching entry. This restricts the copy to test messages from you, rather than other people's email. Keep this sender restriction for all subsequent tests.

   > [!IMPORTANT]
   > Keep this filter in mind when testing: every test email you send **must include "Order Management" in the subject line**, or the workflow will not trigger. This is a common source of confusion when tests "don't seem to work."

4. Select the **Classify** node. If no AI model is already selected or the model chosen is flagged as "retired" in a warning message, choose the default. Review the classification categories. **Three** are configured explicitly in the node, and the panel notes that *a "Default" category is automatically created for inputs that don't match any category* — that automatic category is what the canvas shows as the **Other** branch. Each configured category has a name and example text that the AI model uses to determine where an incoming email should be routed:

   - **Quote Request** — emails requesting pricing or quotes for products/services
   - **Supplier Delay** — notifications about delays from suppliers
   - **Customer Inquiry** — general questions from customers about orders, shipping, etc.
   - **Other** — the automatic **Default** category: anything that doesn't match the three above (spam, promotions, irrelevant). You will not find it in the **Categories** list, because the Classify node creates it for you.

   ![The Classify node categories, with the three configured categories listed](../mcs-workflows/images/classify-categories-all.png)

   > [!TIP]
   > **Improving classification accuracy:** Try common requests and edge cases in the Classify node's **Run node** tab. Inspect the selected category and refine its description or examples if needed.

#### Test the classification

5. Select the Classify node's **Run node** tab to test classification before sending an email. In the inputs from **When a new email arrives**, find **Body** (*The body of the message*) and paste:

   ```
   Hi, I would like to request a quote for 500 units of Product A.
   ```

   Select **Run** and inspect the output — it should classify as **Quote Request**. This node-only test does not run the downstream quote branch or send a quote.

   ![Classify Run node panel with the sample Body input and Quote Request output; downstream nodes have not executed](images/classify-quote-result.webp)

6. Confirm the review and reply recipients resolve only to your lab account. Select **Save** (or press **Ctrl+S**), then **Publish**. Publishing enables the copy, so confirm its **Enabled** state on **Workflows** and send only the intended self-addressed tests.

#### Test the "Other" classification path end-to-end

7. Open **Outlook** ([outlook.office.com](https://outlook.office.com)). If the first-run **Your privacy matters** notice appears, read it and select **Continue**. Compose a new email **to your lab user account**; use **Check names** to resolve the recipient if needed. Enter:

   - **Subject:**

     ```
     Order Management - Congratulations! Your order desk has been selected
     ```

   - **Body:**

     ```
     Dear Order Manager,

     Congratulations! Your order management team has been selected in our monthly
     business draw and is entitled to claim an exclusive cash reward.

     To release your reward, please reply with your full name and contact details,
     and a small processing fee may apply.

     Act soon, as unclaimed rewards expire.

     Regards,
     Promotions Team
     MegaDraw Rewards
     ```

   Send the email. This spam/scam email should be classified as **Other** by the workflow.

   > [!NOTE]
   > The subject must contain **"Order Management"** to match the trigger's subject filter. The body content is intentionally irrelevant to quotes, suppliers, or customer inquiries — it should fall through to the "Other" category.

   ![The Other-path sample email in Outlook after automatic archiving](../mcs-workflows/images/test-other-email-compose.png)

8. Allow time for trigger pickup and classification, then check your **Archive** folder in Outlook. Confirm that the test email was moved there and that its run succeeded in **Activity**; delivery and processing can take several minutes.

   > [!TIP]
   > If the email doesn't appear in **Archive**, check **Activity**. If no run appears, verify the workflow is published, **Enabled**, and that the test subject includes "Order Management." Check for an existing run before sending another test.

   ![Executed Other branch leading to a successful Archive email action](images/other-path-succeeded.webp)

   The run diagram confirms the action executed; separately verify the actual email in **Archive**. If stopping here, disable your copy and reload to verify it stays off. Otherwise continue to Use Case #3.

---

### Congratulations! The Order Management Workflow is now fully configured and operational.

You've completed the foundation that all subsequent use cases build on — the workflow is published, connections are linked, and you've verified the "Other" classification path works end-to-end.

---

## Use Case #3: Use M365 Copilot and Add a Human-in-the-Loop in Order Management

Configure and validate the **Customer Inquiry** branch so the workflow drafts a response with **M365 Copilot**, pauses for a **Human review**, and only replies to the customer after approval.

**Summary of tasks**

In this section, you'll inspect the Customer Inquiry routing branch, review how the M365 Copilot and Human review nodes are configured, publish any updates if needed, and run an end-to-end test with an approval email.

**Scenario:** A customer sends a product question to the order desk. Instead of crafting the answer manually every time, the workflow uses M365 Copilot to prepare a grounded draft response, sends that draft to a human reviewer for approval, and then either replies to the customer or flags the message for follow-up depending on the approver's decision.

### Objective

Validate the **Customer Inquiry** path of the **Order Management Workflow**: confirm the M365 Copilot draft prompt, inspect the Human review approval experience, test the path with a sample customer email, approve the proposed reply, and verify the customer response lands in your inbox.

---

### Step-by-step instructions

#### Inspect the Customer Inquiry branch

1. In **Copilot Studio**, open your published Order Management copy and select **Classify**. Locate the **Customer Inquiry** branch and its draft-and-review sequence. If you previously disabled the copy and it now shows **Draft**, return to **Build** and **Publish** when ready to resume testing; the list switch alone may not re-enable it.

2. Select the **Copilot** node in that branch. Review the prompt and confirm it uses the **Customer question** input based on the incoming email body. This is the grounded draft-generation step that prepares the proposed response for the reviewer. The prompt asks M365 Copilot to read the customer's question, search the existing email threads of the user that owns the node connection (you) for any prior context or earlier reply on the same topic, and then draft a complete, ready-to-send reply — answering clearly when it finds an answer, or writing a brief holding response when it can't (without inventing product facts), always addressed "Dear Customer," and signed off as "Contoso Electronics Order Management".

   > [!NOTE]
   > **Copilot node scope:** The node uses M365 Copilot for questions that leverage Microsoft Graph (emails, Teams chats, etc.) — think of it as prompts you would send in M365 Copilot chat. Note that the operations this node performs are **read-only** — it can search and retrieve information from emails, chats, and files, but it **cannot send emails or Teams messages**. If you need those write operations, use an **Agent** node with access to the relevant Work IQ tools instead.

   > [!NOTE]
   > **A holding reply can be the correct result.** A training mailbox may have little relevant history. If the node cannot find evidence about warranty or MDM, it should acknowledge the question without inventing product details. Wording and generation time vary; assess grounding and accuracy, not an exact response.

   ![The Copilot node showing the Customer question input from the email body](../mcs-workflows/images/customer-inquiry-m365-copilot-node.png)

3. Select the **Human review** node and inspect its configuration carefully:

   - In the message, confirm the proposed reply drafted by **M365 Copilot** is inserted for the reviewer to read.
   - Confirm delivery is **Outlook** and the reviewer is assigned to the incoming **From** value. With the trigger's sender restriction, this must resolve to your own lab account for this test.
   - Confirm the single **Yes/No** input is named **Approve**, with the question **Send proposed reply?**. The approver must see the proposed reply before choosing a response.

   ![The Human review node showing the proposed M365 reply and approval options](../mcs-workflows/images/customer-inquiry-human-review-node.png)

4. Select **If/Else** after **Human review** and confirm **Approve Equals Yes**. Inspect **Reply to email**: **Message Id** comes from the trigger, **To** is the incoming **From**, and **CC** and **BCC** are empty. The **If** branch replies; **Else** routes to **Flag email**. This exercise tests **Yes**, not the rejection path.

   ![The If Else node routing Yes to reply and No to inbox flagging](../mcs-workflows/images/customer-inquiry-if-else-node.png)

#### Run an end-to-end Customer Inquiry test

5. Open **Outlook** ([outlook.office.com](https://outlook.office.com)) and send the following email **to your lab user account**:

   - **Subject:**

     ```
     Order Management - Question about iPad Air warranty and MDM
     ```

   - **Body:**

     ```
     Hi team,

     Quick question before we expand our last order. What is the standard warranty
     period on the iPad Air (M2), and can the devices be enrolled in our mobile device
     management (MDM)? I think we asked something similar a few months back but I can't
     find the reply.

     Thanks,
     Jordan Kim
     IT, Alpine Ski House
     ```

   ![The customer inquiry test email being composed in Outlook](../mcs-workflows/images/customer-inquiry-test-email.png)

6. Return to the workflow and open the **Activity** panel. Refresh until the new run appears, then open it and observe the path: **Classify → Customer Inquiry**.

   > [!IMPORTANT]
   > This path pauses at the approval step. If the run seems to stop, that is expected — the workflow is waiting for the **Human review** action to be completed from Outlook.

   ![The Activity panel showing the run entering the Customer Inquiry path](../mcs-workflows/images/customer-inquiry-activity-path.png)

7. Wait until the run reaches the **Human review** node. The preceding **Copilot** node completes after drafting the response; **Human review** remains waiting until you submit a decision. Trigger pickup, drafting, and approval-email delivery are separate steps and may take several minutes. Refresh the run and your inbox rather than assuming that a pause is a failure.

   ![The Human review node configuration for the approval request](../mcs-workflows/images/customer-inquiry-human-request-waiting.png)

8. Go to **Outlook** and open **Action Needed: Review Customer Enquiry Reply**. Read the proposed reply and check that it does not invent unsupported product details. Choose **Yes** under **Send proposed reply?**, then select **Submit**. Confirm **Your response has been successfully submitted**.

   > [!NOTE]
   > The approval card is an **actionable message**, so Outlook renders the Yes/No choice and a **Submit** button inside the email itself — approving is two clicks (pick **Yes**, then **Submit**), not one. Outlook may also show a **Trust sender** prompt above the card; the card still works without actioning it.

   > [!TIP]
   > If you don't see the approval email, refresh Outlook and inspect the workflow run first. Confirm whether **Copilot** is still drafting or **Human review** is waiting, and check the reviewer address and **Connection**. Repair the connection only if it is unresolved or incorrect, then **Save** > **Publish**. Before sending another test, check whether the original run is still waiting so you do not create duplicate approval requests.

   ![Outlook confirmation after submitting the approval response](../mcs-workflows/images/customer-inquiry-approval-email.png)

9. Return to your inbox and verify that the approved reply email lands there — it arrives with the subject **"Your inquiry - Contoso Electronics"** and opens *"Dear Customer,"*. This confirms the workflow resumed after human approval and sent the response automatically.

   > [!NOTE]
   > Allow a couple of minutes after **Submit**. The workflow has to resume from the paused Human review node before it sends, so the reply does not appear instantly.

   ![Successful Copilot, Human review, If, and Reply to email path; Flag email and Archive email are skipped](images/inquiry-path-succeeded.webp)

   Verify both the delivered email and the successful run. **Flag email** and **Archive email** are skipped on this approved path; that is expected, not a failure.

10. Turn off **Enabled** for your Order Management copy and reload **Workflows** to confirm it remains off. It may now show **Draft**, an unchecked disabled switch, and **This workflow hasn't been published and can't be enabled from this list.** If intentionally resuming later, return to **Build** > **Publish** after checking the sender and recipient restrictions. Complete [Clean Up](#clean-up).

---

### Congratulations! The Customer Inquiry path is now drafting, reviewing, and replying successfully.

You've confirmed that the workflow can generate a grounded response with M365 Copilot, pause for human approval, and then continue automatically based on the reviewer's decision.

---

## Extra Credit: Build an Inline Agent for Inventory Management

> [!NOTE]
> **Optional - Extra Credit (~15 minutes):** This exercise is outside the 30-minute core lab. Complete Use Case #2 first so the Order Management Workflow is configured and published.

> [!NOTE]
> This exercise uses **Warehouse MCP**. With a pre-provisioned event account, use the installed server; if it is missing, ask your facilitator. For your own tenant, see [Prerequisites](#prerequisites).

Extend the **Supplier Delay** branch with an inline **Agent** that uses **MCP servers** to reason over the delay notice, check current stock, and create a follow-up **Dataverse Task**.

**Summary of tasks**

In this section, you'll add a new agent node to the Supplier Delay branch, connect the Warehouse and Dataverse MCP servers, define the agent's instructions and structured output, publish the workflow, and test the scenario with a supplier delay email.

**Scenario:** A supplier warns that an incoming shipment is delayed. The workflow shouldn't just forward the email — it should reason about the impact by checking current inventory, determine urgency, and create a structured Dataverse task so the replenishment team can act immediately.

### Objective

Build and validate the **Supplier Delay** path of the **Order Management Workflow** by adding the **Inventory Task Agent**, equipping it with MCP tools, generating structured output, and verifying that it creates the expected Dataverse task after a test email is received.

---

### Step-by-step instructions

#### Add and configure the Supplier Delay agent

1. In the **Classify** node, locate the **Supplier Delay** category. Select the **+** next to that branch and choose **Agent** to add a new agent step for this path.

   ![The Supplier Delay category with the add action menu open to Agent](../mcs-workflows/images/supplier-delay-add-agent.png)

2. In the new node, leave **Agent** set to **New agent for this workflow**. This creates an inline agent dedicated to this workflow path. Keep the default AI model.

   > [!TIP]
   > A strength of AI-native nodes in Workflows is that you can choose a **different model per node**. An example is an inline agent that runs on a **Claude** model for its reasoning, while the **Classify** node uses a lighter **GPT** model — a cost-optimization pattern. Matching the model to the work each node does keeps the workflow both capable and economical.

3. Select **Expand** (the two arrows next to **...**) so you can edit the full agent configuration, then rename the node title from **Agent** to **Inventory Task Agent**.

   ![The expanded agent configuration renamed to Inventory Task Agent](../mcs-workflows/images/supplier-delay-agent-expanded.png)

4. Under **Tools**, navigate to **Model Context Protocol** (**MCP servers**), then add and connect both of these tools:

   - **Microsoft Dataverse MCP Server**
   - **Warehouse MCP Server** (shown as **Warehouse MCP** in the tool details)

   Sign in or connect as prompted so both tools show as available in the agent.

    > [!WARNING]
    > Search for **Warehouse** under **Model Context Protocol (MCP)** and select **Warehouse MCP Server**. Its detail panel is titled **Warehouse MCP**. Check that it exposes **Get restock date**; do not choose an unrelated connector action with a similar name.

   ![Searching Warehouse in the MCP tool picker returns Warehouse MCP Server](../mcs-workflows/images/warehouse-tool-picker.png)

    > [!IMPORTANT]
    > Inspect the tool's operation list as well as its **Connection**. If the operations are already listed, keep the tool and connection as they are. Only if the panel says **"No tools found"**, remove the tool from this agent and re-add it from **Model Context Protocol (MCP)**. Save and publish the change, then verify that operations appear. A successful run alone does not prove a tool performed the expected action.

   ![The agent tools panel showing Dataverse MCP and Warehouse MCP connected](../mcs-workflows/images/supplier-delay-mcp-tools.png)

5. In the **Instructions** box, paste the following agent instructions:

   ```
   Purpose
   You triage supplier shipment-delay notices into restock tasks for Contoso Electronics. A delay notice names a delayed product but does not include stock levels, so you use the Warehouse tool to find the current stock and judge how urgent the delay is, then record a task in Dataverse.

   Inputs
   Delay notice: [email body]
   Review by (Due Date): [due date]

   Guidelines
   Take the current stock and all restock details from the Warehouse tool; the email does not contain them.
   Judge urgency from the current on-hand quantity: zero on-hand means the delay causes a stockout and is urgent; low but above zero means the buffer is at risk; healthy stock means the delay is tolerable.
   The Warehouse is a sample-data service. If its next shipment date is in the past relative to the delay notice, state that the ETA is stale and must be reconfirmed. Do not invent a future shipment date or a warehouse location.

   Steps
   Read the product or SKU named in the delay notice.
   Call the Warehouse restock-date lookup once, passing the exact SKU from the notice (no extra spaces). It returns the current quantity, next shipment date, expected quantity, and supplier. Do not call the stock-check tool.
   Decide the urgency of the delay from the current on-hand quantity.
   Use Dataverse to create one row in the Task table in the current environment, setting only these columns:
   Subject: Restock delay - [product] ([SKU]).
   Description: the current on-hand quantity; the next shipment date, the expected quantity, and the supplier returned by the tool; the urgency judgement; and a one-line action for the replenishment team. Include warehouse location only if the restock lookup supplies it. Flag a stale shipment date for reconfirmation.
   Priority: High if the on-hand quantity is zero, otherwise Normal.
   Due Date (scheduledend): set this to the exact Review by (Due Date) input above, which is the trigger email's arrival date and time plus three days.

   Rules
   Create exactly one Task row and set only the columns listed above.
   If the product is not found in the Warehouse, record it as unrecognised for a person to check.
   ```

   ![The Supplier Delay agent instructions pasted into the configuration panel](../mcs-workflows/images/supplier-delay-agent-instructions.png)

   > [!NOTE]
   > The sample restock service may return a fixed shipment date (for example, April 22, 2026) and no warehouse location. These are tool-data limitations, not missing email fields. Record the actual response and flag a past ETA for confirmation; do not call the prohibited stock-check tool to fill the location. The Task's **Due Date** is independent of the shipment ETA.

6. Replace the placeholders in the instructions with dynamic content:

   1. Select **`[email body]`**, choose the **lightning** icon, search for **body**, and insert **Body** from **When a new email arrives**.
   2. Select **`[due date]`**, choose the **lightning** icon, then look above the search bar for the **diamonds** icon — **Ask Copilot to generate an expression**.
   3. Enter:

      ```
      Add 3 days to the date and time of arrival of the trigger email
      ```

   4. Confirm Copilot returns:

      ```
      addDays(triggerOutputs()?['body/receivedDateTime'], 3)
      ```

      Select **Insert**.

   ![The agent instructions showing Body and due date dynamic expressions inserted](../mcs-workflows/images/supplier-delay-dynamic-content.png)

7. Scroll to the **Output** section and change the dropdown to **Structured output**. Add these three properties and their **Description**:

   - `sku` (**Text**, JSON `string`) — *The SKU named in the delay notice*
   - `stock` (**Number**, JSON `number`) — *Current stock quantity from the warehouse for the SKU named*
   - `risk` (**Yes/No**, JSON `boolean`) — *True if current stock is zero*

   ![The structured output configuration with sku stock and risk properties](../mcs-workflows/images/supplier-delay-structured-output.png)

   > [!TIP]
   > **"Request human assistance when unsure":** Notice the button in the agent configuration panel. This feature sends a structured message to the connection owner when the agent encounters ambiguity or conflicting information — it dynamically generates questions based on the problem at hand, allowing human judgment for edge cases while keeping the automation running.

8. Minimize the view, select **Save** and **Publish**, then enable your workflow for the Supplier Delay test.

   ![The Order Management Workflow published with the Inventory Task Agent added](../mcs-workflows/images/supplier-delay-workflow-published.png)

#### Test the Supplier Delay path

9. In **Outlook**, send the following email **to your lab user account**:

   - **Subject:**

     ```
     Order Management - Shipment delay - LumiRead E-Reader
     ```

   - **Body:**

     ```
     Hello Contoso,

     We're writing to let you know that the upcoming shipment of the LumiRead E-Reader
     (16GB), SKU-LUMI, has been delayed and will not arrive on the originally planned
     date.

     We apologise for the inconvenience and will keep you updated.

     Regards,
     LumiRead Supply Team
     ```

   ![The supplier delay test email received in the lab user's Outlook inbox](../mcs-workflows/images/supplier-delay-test-email.png)

10. Return to the workflow's **Activity** panel, refresh until the run appears, and open it. Observe the path: **Classify → Supplier Delay → Inventory Task Agent**.

    ![The Activity panel showing the Supplier Delay path and Inventory Task Agent run](../mcs-workflows/images/supplier-delay-activity-path.png)

11. Select the **Inventory Task Agent** node in the run details and scroll through the tool runs. You should see the warehouse lookup and the Dataverse describe/create operations executed by the agent:

    - Using the **Warehouse MCP**, the agent looks up the current stock for the delayed product (the SKU named in the email).
    - Using **Dataverse**, it then inspects the **Task** table and creates a new row there, filling in the subject, description, priority, and due date exactly as the instructions specified.

    Together, these tool calls show how the agent turned an unstructured delay email into a concrete, trackable restock task.

    ![The Inventory Task Agent run details showing Warehouse and Dataverse tool calls](../mcs-workflows/images/supplier-delay-tool-runs.png)

12. In the same run details, review the **structured output** and confirm it contains:

    - `sku = SKU-LUMI`
    - `stock = 0`
    - `risk = true`

    ![The structured output values showing SKU-LUMI stock 0 and risk true](../mcs-workflows/images/supplier-delay-structured-output-result.png)

13. Open **Power Apps** ([make.powerapps.com](https://make.powerapps.com)), navigate to **Tables → Task**, and find the newly created row **Restock delay - LumiRead E-Reader (16GB) (SKU-LUMI)**. Refresh the grid and scroll to the row, or use the **Subject** column menu's **Filter by** option. The **+N more** control adds existing columns, not more rows; use it to show **Created On** and **Description**. If earlier tests created rows with the same subject, identify the newest by **Created On**. Verify **Due Date** equals the trigger email's arrival date and time **plus three days**, and **Priority = High**. Check the actual row even if the workflow run succeeded; a blank Due Date is not a pass. Displayed times may use your local time zone.

    ![The newest LumiRead Task is the second row, with Due Date October 24 at 5:24 PM and High priority; the earlier failed test has a blank Due Date](../mcs-workflows/images/supplier-delay-dataverse-task.png)

14. Disable your **Order Management Workflow**, reload to verify it stays off, and remove only the test Task row you just verified. Keep other attendees' records and the shared connections.

---

### Congratulations! The Supplier Delay path is now using an MCP-powered inline agent.

You've added a reasoning agent that enriches a supplier delay notice with warehouse tool data, creates a Dataverse task, and emits structured output for downstream visibility.

---

## Extra Credit: Call a Price Quote Specialist Agent from a Workflow

**Optional - Extra Credit (~10 minutes), outside the 30-minute core lab.** Complete Use Case #2 first, then connect the **Quote Request** branch to a reusable **Price Quote Agent** that combines **SharePoint knowledge**, **Dataverse account data**, and **Mail** to produce and send a professional quote. The agent ships inside the prepared solution and may already be **Published**; inspect its state and publish any changes before using it.

**Summary of tasks**

In this section, you'll inspect the existing Price Quote Agent, wire it into the Quote Request branch, pass the sender and email body as dynamic inputs, publish the workflow, and verify the generated quote email end-to-end.

**Scenario:** A customer asks for pricing on a bundle of products. Rather than rebuilding the quote logic inside the workflow, you can reuse a purpose-built agent that knows how to look up pricing guidance, combine it with product catalog data, and send a polished quote response.

### Objective

Publish the **Price Quote Agent**, configure the **Quote Request** path to use it, provide it with the email sender and request body at runtime, and verify that it completes the quote process and sends the resulting email.

---

### Step-by-step instructions

#### Inspect the reusable Price Quote Agent

1. In **Copilot Studio**, select **Agents** in the left navigation and find **Price Quote Agent**.

   ![The current Agents list showing Price Quote Agent](../mcs-workflows/images/agents-list-current.png)

2. Open **Price Quote Agent**. In the **Build** tab, inspect the agent and confirm these components are present on the right-hand panel:

   - **Tools**: **Microsoft Dataverse MCP Server** and **Mail** (formerly **Work IQ Mail (Preview)**)
   - **Knowledge**: **Order Management** (SharePoint knowledge source with pricing guidance, customer tiers, and related policy)
   - **Skills**: **price-quote** — the structured skill for composing and sending the quote email
   - On the left, the **Instructions** pane holds the agent's broad, conversational guidelines about handling price questions. Notice they stay deliberately high-level: the precise, procedural steps live in the **price-quote** skill instead — a best practice that keeps the instructions readable while the repeatable logic is encapsulated in a skill.

   ![The Price Quote Agent in the new Build experience showing instructions tools and knowledge](../mcs-workflows/images/uc5-agent-new-experience.png)

3. **Confirm each MCP tool lists its operations.** Open **Tools > Mail**, then **Tools > Microsoft Dataverse MCP Server**, and check each panel:

   - **Connection** — if it shows **Not Connected**, select **Create new connection > Create** and **Confirm**, signing in with your lab account.
   - **Tools / Inputs** — this must list the operations the server exposes. **Mail** should show operations such as **Add draft attachments**, **Update draft**, and **Send email with attachments**; **Microsoft Dataverse MCP Server** should show **Read query**, **Create record**, and **Update record** (operation identifiers `read_query`, `create_record`, and `update_record`).

   If both panels already list operations, keep the existing tools and connections. If either reads **"No tools found"**, remove only that tool from the agent's **Tools** list, choose **Add tool**, open **Model Context Protocol (MCP)**, pick the same server, then **Save and publish**. Reopen the tool to verify its operations before continuing.

   > [!IMPORTANT]
   > **Check operations as well as Connection.** A connected tool can still have an empty operation list. Do not recreate a healthy connection or remove a working tool as a routine setup step.
   >
   > If required operations are unavailable, a run may still report **Succeeded** while the agent explains that it could not use the connectors. That is not a completed quote test: verify the account lookup and actual delivered email. If the list stays empty after re-adding the tool, ask your proctor whether the Dataverse MCP and Mail servers are enabled for this tenant; inspect the run output for the exact limitation.

4. Open the **price-quote** skill and read through what it does. The skill spells out exactly how to build a quote: read the customer name and the requested items from the request, use **Dataverse** to look up the customer's account and employee count and derive their pricing **tier** (Small / Mid / Large), take each item's SKU and list price from the **Sales & Pricing Guide**, then calculate the line totals, subtotal, tier discount, and final total. It finishes by reading the payment terms and delivery lead time and using **Work IQ** to email a fully formatted quote to the customer — applying only the prices and discounts found in the knowledge, never estimates.

5. Check the agent's publication state. If it is already **Published** and you made no changes, continue. Otherwise, save and **Publish** (or **Save and publish**, as offered) before returning to the workflow.

#### Configure the Quote Request branch

6. Return to the **Order Management Workflow** and locate the **Quote Request** category in the **Classify** node.

7. Select the **+** next to **Quote Request** and choose **Agent**.

8. In the **Agent** dropdown, select **Price Quote Agent** — the agent whose publication state you verified in step 5.

   > [!IMPORTANT]
   > **Only published agents appear in the dropdown:** When using the Agent node with an existing agent, only agents that have been **published** (not just saved) will appear in the agent selection dropdown. If your agent is missing from the list, go to the agent page and publish it first.

   ![The Quote Request branch agent selector showing Price Quote Agent](../mcs-workflows/images/quote-request-select-existing-agent.png)

9. In the **Message** field, enter:

   ```
   Prepare a price quote for this customer request:
   Customer email: [email sender]
   Request: [email body]
   ```

10. Replace the placeholders with dynamic values:

   - Replace the **`[email sender]`** placeholder (select the arrow **>**), choose the **lightning** icon, search for **from**, and insert **From**.
   - Replace the **`[email body]`** placeholder (select the arrow **>**), choose the **lightning** icon, search for **body**, and insert **Body**.

   Confirm the final message contains the **From** and **Body** tokens and no literal `[email sender]` or `[email body]` text. If insertion leaves a placeholder beside the token, delete only the leftover placeholder.

   ![The Quote Request message field with From and Body dynamic tokens inserted](../mcs-workflows/images/quote-request-message-dynamic-content.png)

11. Select **Save**, then **Publish**, and enable your workflow for this test only after confirming the quote recipient is your lab account.

    ![The workflow published after wiring the Quote Request branch to Price Quote Agent](../mcs-workflows/images/quote-request-workflow-published.png)

#### Test the Quote Request path

12. In **Outlook**, send the following email **to your lab user account**:

    - **Subject:**

      ```
      Order Management - Quote request - Adventure Works
      ```

    - **Body:**

      ```
      Hello Contoso team,

      We're fitting out a new office and would like a quote for:
      - 10 Sony WH-1000XM5 headphones
      - 5 iPad Air (M2, 256GB)

      Delivery to our Santa Cruz, California office. Could you confirm your best price,
      the payment terms, and the delivery estimate?

      Thanks,
      Nancy Anderson
      Procurement, Adventure Works
      ```

    ![The quote request test email being composed in Outlook](../mcs-workflows/images/quote-request-test-email.png)

13. Return to the workflow's **Activity** panel, refresh until the run appears, and confirm the route **Classify → Quote Request → Agent completed**.

    ![The Activity panel showing the Quote Request branch run completed](../mcs-workflows/images/quote-request-activity-path.png)

14. Select the **Agent** node in the run details and read the completion message describing what the Price Quote Agent did to prepare the customer response.

    ![The Quote Request agent run details showing the completion message](../mcs-workflows/images/quote-request-agent-completion.png)

15. Open **Outlook** and verify that the generated price quote email has landed in your inbox.

    ![The completed price quote email received in Outlook](../mcs-workflows/images/quote-request-email-received.png)

16. **Bonus:** Return to **Price Quote Agent** and select the **Preview** tab (top of the new experience). As a bonus, observe how the agent reasons over a question by combining the different tools at hand. Ask:

    ```
    What are the iPad Air prices applicable to Fabrikam?
    ```

    Watch the extended reasoning — the agent issues a Dataverse `read_query` that looks up the number of employees where the account name is **Fabrikam**, then connects that result with the **SharePoint** knowledge about customer tiers: it works out that Fabrikam falls into the **Mid** tier and shows the discounts the SharePoint handbook says should apply.

    You can also try asking the following and paste the email you used to test the workflow inside the brackets:

    ```
    We have received this customer email: []
    ```

    You'll see how the agent reasons over the answer — and how, this time, it loads the **price-quote** skill to build a full quote following the skill's specified steps.

    ![The Price Quote Agent Preview tab showing the Fabrikam pricing question with reasoning](../mcs-workflows/images/uc5-bonus-agent-reasoning.png)

17. Disable your **Order Management Workflow** and reload to verify it stays off. Complete [Clean Up](#clean-up); do not leave the email trigger listening after the exercise.

---

### Congratulations! The Quote Request path is now powered by a reusable published agent.

You've connected a workflow branch to a published agent that blends knowledge, data, and mail actions — a strong pattern for reusing sophisticated business logic across multiple automations.

---

## Clean Up

1. On **Workflows**, turn off **Enabled** for each workflow you enabled: your Order Management copy and, only if you completed Use Case #1, your Time Block workflow. Reload and verify they remain off. Do not change the original starter or anyone else's workflow. If a disabled copy becomes **Draft**, leave it that way; to resume deliberately, open **Build** > **Publish** rather than relying on the list switch.
2. Inspect **Activity** for any runs still **Running** or **Waiting**. Disabling a trigger prevents new runs; it does not prove existing runs stopped. Finish your test approvals or cancel your unfinished runs before leaving. Ask your facilitator for help if a run cannot be stopped.
3. Remove your test calendar block, To Do task/list, test emails, approval requests, and drafts when no longer needed. If you completed the inventory extra credit, remove only the Dataverse Task row created by your test.
4. Leave shared starter workflows, agents, connections, MCP servers, knowledge, and sample records in place. Record **Credit usage (last 30 days)** from the **Workflows** page if available; this is a rolling total, not the cost of this individual test.

---

## Summary of Learnings

True learning comes from doing, questioning, and reflecting — so let's put your skills to the test.

To get the most out of Workflows in Copilot Studio:

* **Choose the right trigger** — workflows can start manually, on a schedule, or from a connector event. Pick the trigger that matches the "when" of your automation.
* **Use an inline agent for the messy middle** — when a step needs judgment (which slot? how to phrase the notes?), the agent node lets the model reason and act, instead of forcing every decision into deterministic logic.
* **Ground the agent with dynamic content** — the `/` token feeds the agent the *actual* trigger data (the to-do **Title**), so each run acts on the real item, not a fixed example.
* **Tools are the agent's hands** — without the Find meeting times, Create event, and Update to-do tools (and web search), the agent could reason but not act. Grant exactly the tools the goal requires.
* **Constrain behavior in the instructions** — small additions like "only within my 8:00 AM–5:00 PM working hours" meaningfully change the agent's choices. Iterate on the instructions, then **re-publish**.
* **Publish and enable before an end-to-end test** — publish changes, check **Enabled**, and create the triggering event. Node-only tests are a separate way to inspect an action without running the whole workflow.
* **Classify with examples, refine with testing** — the Classify node's accuracy depends on the quality and diversity of category examples. Test with edge cases and refine descriptions iteratively to improve routing accuracy.
* **Use M365 Copilot when you need grounded, read-only retrieval** — the M365 Copilot node is excellent for finding context in email, chats, and files, but it does not perform write actions such as sending mail. Pair it with downstream workflow actions when approval or dispatch is required.
* **Human review is the safety valve for customer-facing automation** — approval nodes let you insert AI-generated content into a reviewer-friendly message, capture a clear Yes/No decision, and keep the workflow paused until a person signs off.
* **MCP servers turn an agent into an operational worker** — by connecting the Agent node to tools like Warehouse MCP and Dataverse MCP, the workflow can retrieve live business data, make judgments, and write records into line-of-business systems.
* **Structured output makes agent reasoning reusable** — typed fields like `sku`, `stock`, and `risk` make it easier to inspect runs, pass results downstream, and design automations that combine non-deterministic reasoning with deterministic follow-up.
* **Published agents are reusable business capabilities** — once an agent is published with its knowledge, tools, and skills, you can invoke it from multiple workflows instead of rebuilding the same logic in every branch.

---

## Conclusions & Recommendations

**Workflows golden rules:**

* Match the **trigger** to the event that should start the work — manual for testing, recurrence for schedules, connector for "when something changes."
* Reach for an **inline agent** when a step needs reasoning; keep deterministic actions for steps that must always behave identically.
* Reference trigger data with the **`/` dynamic-content token** so the agent acts on the real input every run.
* Give the agent **only the tools it needs**, and state constraints (working hours, formatting, categories) explicitly in the instructions.
* **Save → Publish** and check **Enabled** before an end-to-end trigger test. Use **Activity** and the **Agent** node's run details to inspect the outcome. Disable the workflow and verify its off state when finished.
* **Classify nodes are only as good as their examples** — invest time in adding diverse, representative examples to each category and testing edge cases to improve classification accuracy.
* Use the **Copilot** node for grounded, **read-only** M365 retrieval and drafting, then pair it with other nodes when the workflow needs to send messages or update systems.
* Put **Human review** in front of customer-facing actions whenever the quality bar or business risk warrants a person-in-the-loop checkpoint.
* Use **MCP-connected agents** when the workflow needs to reason over live enterprise data and write operational outcomes such as Dataverse tasks.
* Prefer **structured output** from agents when downstream steps, monitoring, or reporting depend on predictable fields rather than free-form text.
* Reuse **published agents** for repeatable business capabilities — especially when they already combine knowledge sources, skills, and tools that multiple workflows can benefit from.

With these foundations, you can move from agents that *talk* to agents that *act on their own* — reacting to events, reasoning over real data, and getting work done across Microsoft 365.
