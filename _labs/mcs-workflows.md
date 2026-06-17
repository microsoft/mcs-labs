---
layout: lab
module: workflows
title: "Workflows"
order: 340
duration: 45
difficulty: 300
lab_type: local
section: advanced_labs
journeys: ["autonomous-ai", "developer"]
description: "Build an autonomous agent using Workflows — the next generation of autonomous agents in Copilot Studio — with an event-driven trigger and a non-deterministic inline agent that books calendar time and updates a to-do."

---

---

# Workflows

Build an **autonomous agent** in Microsoft Copilot Studio using **Workflows** — an agent that runs on a trigger instead of waiting for a chat, and hands real work to a non-deterministic inline agent.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 300 | Maker | 45 minutes | After completing this lab, participants will be able to create a Workflow in Copilot Studio, fire it from an event-driven **trigger**, and embed a non-deterministic **inline agent** that reasons over the trigger's data and acts through tools (Outlook calendar, Microsoft To Do, and web search) — going beyond the classic, deterministic autonomous-agent model. |

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
- [Summary of Learnings](#summary-of-learnings)
- [Conclusions & Recommendations](#conclusions--recommendations)

---

## Why This Matters

**Makers and Developers** — want your agents to *do work on their own*, in the background, the moment something happens — instead of only answering when a user types a message?

Think of Workflows as the autonomous side of Copilot Studio:
- **Classic agents** are conversational — they wait for a user turn, then respond.
- **Workflows** are event-driven — they start from a **trigger** (a schedule, or a change in an external system) and run to completion with no one watching.
- **The new agent node** lets a Workflow hand a step to a *reasoning* agent rather than a fixed, deterministic action — so the automation can decide *how* to accomplish a goal, not just replay hard-coded steps.

**Common challenges solved by this lab:**
- "I want automation that kicks off when a record changes, not when someone opens a chat."
- "My flows are rigid — I need a step that can reason about messy, real-world inputs and choose what to do."
- "I want an agent that can read my calendar, book time, and update a task — on its own."

**In 45 minutes, you'll build an autonomous Workflow whose inline agent schedules focus time on your calendar and enriches a to-do — triggered automatically by simply creating a task.**

---

## Introduction

Workflows are the next generation of autonomous agents in Microsoft Copilot Studio. Where a classic agent waits to be asked, a Workflow listens for a **trigger** and then executes — making it ideal for "when X happens, do Y" automation across Microsoft 365 and hundreds of connectors. What makes the new experience powerful is the **agent node**: a Workflow can now delegate a step to an inline, *non-deterministic* agent that reasons over the trigger's data and calls tools to get work done, rather than following a fixed script.

**Real-world example:** You keep a running list of things you need to do, but you never actually block time to do them. In this lab you'll build a Workflow that watches a Microsoft To Do list. The moment you add a task, the Workflow's inline agent reads the task, checks your Outlook calendar for an appropriate slot within your working hours, books a focus block, and then updates the to-do with a due date, a reminder, helpful notes, and a category — all autonomously. You add one task; the agent does the planning.

This lab is **Use Case #1** of a deeper Workflows module. It establishes the foundation — trigger plus inline agent plus tools — that later use cases build on.

---

## Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Workflow** | The autonomous unit in Copilot Studio. It runs on a trigger instead of a chat turn, so work happens in the background without a user present. |
| **Trigger** | What starts a Workflow. Triggers can be manual, scheduled (recurrence), or **connector-based** (an event in an external service, like a new Microsoft To Do task). |
| **Inline agent (agent node)** | A *non-deterministic* agent embedded directly in a Workflow step. Instead of a fixed action, it reasons over the input and decides how to achieve the goal. |
| **Dynamic content / `/` token** | A reference to data produced earlier in the Workflow (e.g., the trigger's to-do **Title**), inserted into the agent's instructions so it acts on the *actual* item at run time. |
| **Tools** | The capabilities you grant the agent so it can take action — here the **Work IQ Calendar** MCP (Outlook calendar), the **Update to-do** action, and **Web search**. |

---

## Documentation and Additional Training Links

* [Workflows in Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview)
* [Add an agent to a workflow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-action-agent)
* [Triggers for workflows](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-triggers)
* [Add tools to an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent)
* [Model Context Protocol (MCP) in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp)
* [Microsoft To Do](https://to-do.office.com/) · [Outlook Calendar](https://outlook.office.com/calendar/)

---

## Prerequisites

- Access to Microsoft Copilot Studio with appropriate licensing, in an environment where **Workflows** are enabled.
- A work or school **Microsoft 365 account** with **Outlook (calendar)** and **Microsoft To Do** provisioned — the agent reads and writes *this* account's calendar and tasks.
- Permission to create connections for **Microsoft To-Do (Business)** and the **Work IQ Calendar** tool.
- Basic familiarity with the Copilot Studio interface.

> [!IMPORTANT]
> Use the **same work account** for Copilot Studio, Microsoft To Do, and Outlook throughout this lab. The trigger, the agent, and the tools all act on one identity — if they don't match, the Workflow can't see your list or write to your calendar.

---

## Summary of Targets

In this lab, you'll build an autonomous Workflow that turns a new to-do into scheduled focus time. By the end, you will be able to:

- Create a **Workflow** and configure a **connector trigger** that fires on a new Microsoft To Do item.
- Embed a **non-deterministic inline agent** in a Workflow and give it goal-oriented instructions.
- Reference the trigger's data inside the agent's instructions using the **`/` dynamic-content token**.
- Equip the agent with **tools** (Work IQ Calendar, Update to-do) and **web search**.
- **Publish** the Workflow and trigger it end-to-end, then **monitor** the run and verify the agent's calendar and to-do changes.

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Automate Task Time-Blocking with a Workflow and an Inline Agent](#use-case-1-automate-task-time-blocking-with-a-workflow-and-an-inline-agent) | Build an autonomous, trigger-driven Workflow whose inline agent reasons over a task and acts across your calendar and to-do list | 45 min |

---

## Instructions by Use Case

---

## Use Case #1: Automate Task Time-Blocking with a Workflow and an Inline Agent

Build a Workflow that watches a Microsoft To Do list and, whenever a task is added, lets an inline agent autonomously block focus time on your calendar and enrich the task.

**Summary of tasks**

In this section, you'll create a To Do list to watch, build a Workflow with a To Do trigger, add a non-deterministic inline agent with goal-oriented instructions and tools, publish it, and then trigger it with a real task and verify the results.

**Scenario:** You capture work in Microsoft To Do but never actually reserve time to do it. You want an assistant that, the moment you jot down a task, finds an appropriate slot in your workday, books a calendar block, and updates the task with a due date, reminder, notes, and category — without you lifting a finger beyond adding the task.

### Objective

Create and publish the **To Do Time Block** Workflow: a To Do trigger feeds a new task to an inline agent that schedules a calendar block within your working hours and updates the to-do — then run it end-to-end and confirm the calendar event and the enriched task.

---

### Step-by-step instructions

#### Create the To-Do list that drives the workflow

1. In **Microsoft To Do** ([to-do.office.com](https://to-do.office.com)), select **New list** in the left sidebar, name it **Time Block**, and press **Enter** to create it. This is the list the workflow will watch — adding a task here is what triggers the automation.

   > [!TIP]
   > Sign in to To Do with the **same account** you use for Copilot Studio. The workflow's trigger connects to *your* To Do, so the list and the workflow must live under one identity.

   ![The new Time Block list created in Microsoft To Do](images/create-time-block-list.png)

#### Create the workflow and configure its trigger

2. In **Copilot Studio**, make sure you're in the right environment, then on the **Home** page select **Workflow** (*Automate business processes with agents and actions*). Rename the workflow from **Untitled Workflow** to **To Do Time Block** by selecting the title at the top of the designer.

   > [!TIP]
   > Workflows are the autonomous side of Copilot Studio — they run on a trigger instead of waiting for a user to chat. You'll find them in the left navigation next to **Agents**.

   ![The To Do Time Block workflow with its trigger configured](images/trigger-todo-time-block.png)

3. Select the **Start** trigger node. In the configuration panel, change **Trigger type** from **Manual** to **Connector**, then choose **Select trigger...** and search for **To Do**. Under **Microsoft To-Do (Business)**, choose **When a new to-do in a specific folder is created**. This makes the workflow fire automatically whenever a task lands in the list you specify.

   > [!IMPORTANT]
   > Pick the **(Business)** connector, not **(Consumer)** — the lab uses your work/school To Do account, which is where Copilot Studio and the calendar tools also run.

4. When prompted, select **Create new connection** and, in the account picker, sign in with the **same work account** you're using for this lab. Once the connection shows your account, set **To-do List** to **Time Block** from the dropdown.

   > [!WARNING]
   > In the connection account picker, double-check you pick *your lab account* — not a personal or other work account. The workflow will read and write *that* account's To Do and calendar.

#### Add and configure the inline agent

5. Select the **+** after the trigger and choose **Agent** to add an agent node. (Copilot Studio automatically wraps it in an **Apply to each** loop so the agent runs once per new to-do.) When prompted, **Create new connection** with your lab account. Leave the **Agent** dropdown on **New agent for this workflow** — this creates a brand-new, *non-deterministic* agent dedicated to this workflow rather than reusing an existing one.

   > [!TIP]
   > This is the heart of the lab: instead of hard-coded actions, the workflow hands the task to an agent that *reasons* about how to schedule it. The default model is **Claude Sonnet 4.6**.

   ![Agent node added with New agent for this workflow selected](images/add-new-agent-node.png)

6. In the **Instructions** box, give the agent its goal. Enter it in three parts so the agent receives the *actual* to-do title at run time:

   1. Type the first line of text:

      ```
      Find a time that is appropriate for this task 
      ```

   2. Type **`/`** to open the dynamic-content picker, then select **Title** (under *When a new to-do in a specific folder is created*). This inserts the to-do's title as a token.

   3. Continue typing the rest of the instruction right after the token:

      ```
      on my calendar in the next couple of business days and block that time on my calendar to work on this task. Then update the to-do with a due date a week out from the time block we created. Add appropriate notes and suggestions in the notes on key things I might want to consider and categorize it as blue. Also set a reminder 2 days before the due date. Make sure that the format of the Calendar notes and To-Do are formatted properly for the user to be able to read them well. Only schedule the time block within my normal working hours of 8:00 AM to 5:00 PM.
      ```

   > [!IMPORTANT]
   > The **`/Title`** token is what makes this dynamic — the agent receives each new task's real title, so its scheduling decision is grounded in the actual to-do rather than a fixed string. The final sentence constrains *when* the agent books focus time; without it, the agent may pick the first technically-free slot (even very early morning).

   ![The completed agent instructions with the Title token inserted inline](images/agent-instructions-filled.png)

7. Give the agent the tools it needs to act. In the agent panel:

   - Under **Tools**, select **+** (Add tool), search for **Work IQ Calendar**, choose **Work IQ Calendar (Preview)** — the MCP server for Outlook calendar operations — and **Create new connection** with your lab account, then **Add**.
   - Add a second tool: **+** → search **Update to-do** → under **Microsoft To-Do (Business)** choose **Update to-do** → **Add** (it reuses your To Do connection).
   - Turn on the **Web search** toggle so the agent can look things up (e.g., venue or location details referenced in a task).

   > [!TIP]
   > The **Work IQ Calendar** tool lets the agent read your free/busy and create calendar events; **Update to-do** lets it write the due date, notes, category, and reminder back onto the task.

   ![Agent configured with Work IQ Calendar and Update to-do tools and Web search enabled](images/agent-tools-web-search.png)

#### Publish, then trigger the workflow

8. Select **Save**, then **Publish**.

   > [!WARNING]
   > **Publishing is required.** A workflow only listens for its trigger once it has been published — so it will **not** run from a new to-do until you publish it. If you add the to-do before publishing, nothing happens. After publishing, the **Activity** and **Monitor** tabs become available.

   ![The published To Do Time Block workflow showing Trigger, Apply to each, and Agent nodes](images/workflow-published.png)

9. Open **Microsoft To Do**, go to the **Time Block** list, and add a new task: **Book Skull's Rainbow Room in Nashville for Next Friday**. Creating this task in the watched list is what fires the workflow's trigger.

   > [!TIP]
   > Use a task whose title implies a real-world commitment with a time and place — it gives the agent something concrete to reason about (find a slot, block the calendar, look up the venue).

   ![The new task added to the Time Block list in Microsoft To Do](images/add-todo-task.png)

#### Watch the workflow run

10. Back in the workflow, open the **Activity** tab and select **Refresh** to look for the run. When the new run appears (status **Running**), select it to open the run details and watch the workflow execute node-by-node (trigger → **Apply to each** → **Agent**).

    > [!IMPORTANT]
    > Be patient — the To Do trigger polls on a schedule, so the run can take a **few minutes** to appear. Press **Refresh** in the Activity list a few times until it shows up.

    ![The new run showing as Running in the Activity view](images/activity-run-running.png)

    ![The run executing, with the trigger succeeded and the Agent node in progress](images/run-monitor-executing.png)

11. In the run details, select the **Agent** node to expand its details. You'll see the agent's own narration of what it did — checking your free/busy, choosing a time block *inside your working hours*, creating the calendar event, finding the to-do, and updating it. This is the *non-deterministic* part: the agent decided the specifics, they aren't hard-coded in the workflow.

    > [!TIP]
    > The Agent's **Outputs / Response** is a great teaching moment — it shows the model reasoning step-by-step and calling the Work IQ Calendar and Update to-do tools on its own.

    ![The Agent node run details showing the agent's reasoning and tool actions](images/agent-run-details.png)

#### Verify the results

12. Go back to **Microsoft To Do** and refresh the **Time Block** list. Open your task — it has been updated by the agent: a **due date** (a week out), a **reminder** set 2 days before the due date, a **blue** category, and richly formatted **notes** (target date, the scheduled work block, and an action checklist).

    > [!TIP]
    > Switch the list to **List** view and open the task to see the full notes the agent wrote — it even researched the venue with web search.

    ![The to-do updated by the agent with due date, reminder, blue category, and formatted notes](images/todo-updated-details.png)

13. Open **Outlook → Calendar**. The agent has added a **time block** event to reserve time to work on the task — on the next business day it found free and **within your 8:00 AM–5:00 PM working hours** — with a body summarizing the target date and venue. The workflow ran end-to-end with no further input from you.

    ![The calendar time-block event the agent created in Outlook](images/calendar-event-details.png)

---

### Congratulations! You've built an autonomous Workflow with a reasoning inline agent.

---

## Use Case #2: Setting Up the Order Management Workflow

Configure and publish a pre-built **Order Management Workflow** that classifies incoming emails and routes them through different processing paths — then verify the setup end-to-end by testing the "Other" classification path.

**Summary of tasks**

In this section, you'll configure connection references in the Power Apps solution, transfer workflow ownership, open the workflow to verify canvas-level connections, explore the email classification categories, publish, and verify everything works by sending a test email that triggers the "Other" classification path.

**Scenario:** Your environment contains a pre-built Order Management Workflow that automatically classifies incoming emails with "Order Management" in the subject. It routes emails into one of four categories — **Quote Request**, **Supplier Delay**, **Customer Inquiry**, or **Other** — and takes different automated actions for each. Before the workflow can run, you need to configure all its connections and link them in the solution.

### Objective

Complete the setup of the **Order Management Workflow**: configure all solution connection references, transfer ownership, verify canvas-level connections, explore the classification categories, publish, and validate end-to-end by sending a test email through the "Other" path.

> [!IMPORTANT]
> This use case is the **foundation for all subsequent use cases** in this module. The connections, ownership, and publishing you complete here are required for the Customer Inquiry, Quote Request, and Supplier Delay paths covered later. Take extra care during setup — if a connection reference is missed or ownership isn't transferred correctly, later use cases will fail silently or with hard-to-diagnose errors.

---

### Step-by-step instructions

#### Take ownership and configure the solution

> [!IMPORTANT]
> **Complete the solution-level setup first.** The steps below transfer ownership and configure connection references — both of which **must** be done before the workflow can be published or tested. Skipping or rushing through these steps is the most common cause of "publish failed" errors later. Read each note carefully.

1. Open **Power Apps** ([make.powerapps.com](https://make.powerapps.com)), ensure you are in the correct environment, navigate to **Solutions**, and open the **LAB: Order Management** solution. This solution bundles the Order Management Workflow along with its connection references, agents, and related components.

   ![The LAB: Order Management solution in Power Apps](images/solution-order-management.png)

2. The workflow was originally created by a different user, so you need to **take ownership** before making any changes. From the solution's **Objects** view, navigate to the workflow's underlying Dataverse record (the **Process** entity record for "Order Management Workflow"). In the command bar, select **Assign**, choose **Assign to: Me**, and confirm.

   > [!IMPORTANT]
   > Ownership transfer ensures you have full control over the workflow — including the ability to publish, enable/disable, and monitor runs. Without ownership, the Publish button will appear blocked or produce cryptic errors. Always transfer ownership **before** configuring connections — it avoids permission issues during the remaining setup steps.

3. Back in the solution, select **Connection References** from the left sidebar (or filter the Objects view to show only Connection References). You should see multiple connection references — at minimum: **When a new email arrives** (Office 365 Outlook), **Dataverse**, **M365 Copilot**, and **Human review** (Advanced Approvals).

   ![Connection References listed in the solution](images/solution-objects.png)

4. For **each** connection reference, you need to link it to a live connection under your account. Perform the following for every row:

   1. Hover over the row to reveal the **Commands** (⋮) button, then select it.
   2. Choose **Edit** from the context menu.
   3. In the Edit panel, open the **Connection** dropdown. If a connection for your account already exists, select it. If not, select **New connection** at the top of the dropdown to create one — sign in with your lab account, then return and select the newly created connection (use the **Refresh** button if it doesn't appear immediately).
   4. Select **Save**, then confirm by clicking **Save changes** in the confirmation dialog.

   Repeat this for **all four** connection references: **When a new email arrives**, **Dataverse**, **M365 Copilot**, and **Human review**.

   > [!WARNING]
   > **Do not skip any connection reference.** Even one unlinked reference will block publishing with the error: *"A connector was imported, however the related connection references need connections created and then any dependent flows can be started."* The confirmation dialog warning that changes impact dependent apps and flows is expected — confirm it each time.

   > [!NOTE]
   > Always sign in with your **lab account** when creating connections — not a personal or different work account. All connections in this workflow must use the same identity, or the workflow will fail at runtime with permissions errors.

#### Open and explore the Order Management Workflow

5. In **Copilot Studio**, select **Workflows** from the left navigation. Locate and open the **Order Management Workflow** to view it in the canvas designer. Since you already own the workflow and have configured the solution connections, the canvas should load without ownership warnings.

   > [!NOTE]
   > The workflow has been pre-built for your lab environment. You'll see a **trigger** node ("When a new email arrives"), a **Classify** node, and several branch paths — one for each email category.

   ![The Order Management Workflow open in the canvas designer](images/order-management-workflow-overview.png)

#### Verify the trigger connection and subject filter

6. Select the **trigger** node ("When a new email arrives"). The connection should already be established from the solution-level setup (step 4). If the connection status still shows as missing, select **Create new connection** to set up an **Office 365 Outlook** connection and sign in with your lab account.

   ![The trigger node with a valid connection established](images/trigger-connection-created.png)

7. With the trigger connected, observe the **Subject Filter** expression: `@{string('Order Management')}`. This means the workflow only fires for emails whose subject contains "Order Management" — all other emails are ignored.

   > [!IMPORTANT]
   > Keep this filter in mind when testing: every test email you send **must include "Order Management" in the subject line**, or the workflow will not trigger. This is a common source of confusion when tests "don't seem to work."

   ![The subject filter expression configured on the trigger](images/subject-filter-expression.png)

#### Verify the Classify node connection and explore categories

8. Select the **Classify** node further down the workflow. The Dataverse connection should already be established from the solution-level setup. If it still shows as missing, select **Create new connection** to set up a **Microsoft Dataverse** connection and sign in with your lab account.

   ![The Classify node with Dataverse connection established](images/classify-connection-created.png)

9. With the connection established, review the four classification categories configured in the Classify node. Each category has a name and example text that the AI model uses to determine where an incoming email should be routed:

   - **Quote Request** — emails requesting pricing or quotes for products/services
   - **Supplier Delay** — notifications about delays from suppliers
   - **Customer Inquiry** — general questions from customers about orders, shipping, etc.
   - **Other** — anything that doesn't fit the above categories (spam, promotions, irrelevant)

   ![All four classification categories with their example descriptions](images/classify-categories-all.png)

   > [!TIP]
   > **Improving classification accuracy:** You can add multiple examples to each category to handle different phrasings and edge cases. For instance, a "Quote Request" might come as *"Can you send me pricing for 500 units?"* or *"We'd like a formal quotation for the attached spec."* Adding diverse examples helps the model generalize better. A good testing exercise is to try common cases **and** edge cases using the **Test** tab in the Classify node, observe how categories get assigned, and refine the category descriptions accordingly.

#### Test the classification

10. Select the **Test** tab in the Classify node to verify the classification works. Enter a sample email body — for example: *"Hi, I would like to request a quote for 500 units of Product A."* — and observe the predicted category. It should classify as **Quote Request**.

    > [!TIP]
    > Use the Test tab to experiment with different email texts before publishing. Try edge cases like a supplier email that also mentions pricing, or a customer complaint — these help you understand how the model assigns categories and whether you need to refine the category descriptions or add more examples.

    ![The classification test result showing Quote Request](images/classify-test-result.png)

#### Publish the workflow

11. Return to **Copilot Studio → Workflows**. In the Workflows list, locate **Order Management Workflow** and select the **Publish** button (the icon next to the workflow name). The status should change from **Draft** to **Published**.

    > [!IMPORTANT]
    > If publishing fails, double-check that **all four connection references** are linked (step 4) and that you have **ownership** of the workflow (step 2). These are the two most common blockers. You can verify connection references by returning to the Power Apps solution and confirming each one shows a connection in the Edit panel.

    ![The Order Management Workflow showing Published status](images/workflow-published.png)

#### Test the "Other" classification path end-to-end

12. Open **Outlook** ([outlook.office.com](https://outlook.office.com)) and compose a new email **to yourself** with the following:

    - **Subject:** `Order Management - Congratulations! Your order desk has been selected`
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

    ![Composing the test email in Outlook](images/test-other-email-compose.png)

13. Wait approximately **1–2 minutes** for the workflow to trigger and process the email. Then navigate to your **Archive** folder in Outlook. You should see the test email has been automatically moved there — confirming the "Other" classification path is working correctly.

    > [!TIP]
    > If the email doesn't appear in the Archive folder after 2 minutes, check the **Activity** tab in the workflow in Copilot Studio to see if the run triggered. If no run appears, verify the workflow is **Published** (not Draft) and that the email subject includes "Order Management."

    ![The test email moved to the Archive folder by the workflow](images/archive-other-email.png)

---

### Congratulations! The Order Management Workflow is now fully configured and operational.

You've completed the foundation that all subsequent use cases build on — the workflow is published, connections are linked, and you've verified the "Other" classification path works end-to-end.

---

## Summary of Learnings

True learning comes from doing, questioning, and reflecting — so let's put your skills to the test.

To get the most out of Workflows in Copilot Studio:

* **Trigger first, chat never** — a Workflow runs on an event (a schedule or a connector trigger), so it works in the background without a user present. Pick the trigger that matches the "when" of your automation.
* **Use an inline agent for the messy middle** — when a step needs judgment (which slot? how to phrase the notes?), the agent node lets the model reason and act, instead of forcing every decision into deterministic logic.
* **Ground the agent with dynamic content** — the `/` token feeds the agent the *actual* trigger data (the to-do **Title**), so each run acts on the real item, not a fixed example.
* **Tools are the agent's hands** — without the Work IQ Calendar and Update to-do tools (and web search), the agent could reason but not act. Grant exactly the tools the goal requires.
* **Constrain behavior in the instructions** — small additions like "only within my 8:00 AM–5:00 PM working hours" meaningfully change the agent's choices. Iterate on the instructions, then **re-publish**.
* **Publish before you test** — the trigger is only live after a publish, and changes don't take effect until you re-publish.

---

## Conclusions & Recommendations

> [!IMPORTANT]
> **Workflows golden rules:**
> * Match the **trigger** to the event that should start the work — manual for testing, recurrence for schedules, connector for "when something changes."
> * Reach for an **inline agent** when a step needs reasoning; keep deterministic actions for steps that must always behave identically.
> * Reference trigger data with the **`/` dynamic-content token** so the agent acts on the real input every run.
> * Give the agent **only the tools it needs**, and state constraints (working hours, formatting, categories) explicitly in the instructions.
> * Always **Save → Publish** before testing, and **re-publish** after any change. Use the **Activity** and **Monitor** views — and the **Agent** node's run details — to see exactly what the agent decided and did.
>
> With these foundations, you can move from agents that *talk* to agents that *act on their own* — reacting to events, reasoning over real data, and getting work done across Microsoft 365.
