---
layout: lab
title: "Orchestration with Copilot Studio"
order: 800
duration: 45
difficulty: 200
lab_type: local
section: core_learning_path
journeys: ["developer"]
bootcamp_order: "7"
description: "Apply Module 8 concepts hands-on: explore how Copilot Studio's generative orchestration engine routes requests, see the impact of Instructions and Descriptions on the planner, and enable Enhanced Task Completion to change orchestration behavior."

---

---

# Orchestration with Copilot Studio

Apply Module 8 concepts hands-on: explore how Copilot Studio's generative orchestration engine routes requests, see the impact of Instructions and Descriptions on the planner, and enable Enhanced Task Completion to change orchestration behavior.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 45 minutes | After completing this lab, participants will understand how Copilot Studio's generative orchestration engine selects tools and child/connected agents, see firsthand how Instructions and Descriptions shape that selection, and enable Enhanced Task Completion to alter orchestration behavior. |

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
  - [Use Case #1: Get the Sample Connected Agent Working](#use-case-1-get-the-sample-connected-agent-working)
  - [Use Case #2: See the Impact of Instructions and Descriptions on the Planner](#use-case-2-see-the-impact-of-instructions-and-descriptions-on-the-planner)
  - [Use Case #3: Enable Enhanced Task Completion](#use-case-3-enable-enhanced-task-completion)

---

## Why This Matters

**Makers and Architects** — The generative orchestration engine in Copilot Studio decides which tool, knowledge source, child agent, or connected agent should handle each turn. The quality of those decisions depends almost entirely on the **descriptions** and **instructions** you provide and on whether features like **Enhanced Task Completion** are enabled. Getting orchestration right is the difference between a copilot that "feels smart" and one that hallucinates or routes to the wrong place.

**Common challenges solved by this lab:**

- "My agent picked the wrong tool"
- "I don't know how Instructions vs Descriptions affect routing"
- "What does Enhanced Task Completion actually change?"

**Pairs with:** Module 8 — Orchestration and Dynamic Chaining Concepts (the 45-minute session immediately preceding this lab).

---

## Introduction

Welcome to the Copilot Studio Orchestration lab. This is the hands-on companion to **Module 8 — Orchestration and Dynamic Chaining Concepts**.

You'll start by ensuring a sample connected agent is configured and working in your environment, then walk through changing Instructions and Descriptions to see how the planner's choices shift, and finally enable Enhanced Task Completion to compare orchestration behavior with and without it.

**What You Will Learn**

- How the generative orchestration engine evaluates available tools, agents, and knowledge
- How agent **Instructions** and tool/agent **Descriptions** shape planner decisions
- What **Enhanced Task Completion** changes about orchestration behavior

---

## Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Generative Orchestration** | The engine that decides which tool, knowledge source, child agent, or connected agent handles each turn |
| **Instructions** | Top-level guidance for the parent agent — shapes overall behavior and how the planner approaches each request |
| **Descriptions** | Per-tool / per-agent metadata the planner reads when deciding what to route to |
| **Enhanced Task Completion** | A feature that changes how the orchestrator drives multi-step task completion |

---

## Documentation and Additional Training Links

* [Generative Orchestration](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-generative-orchestration)
* [Configure generative actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions)
* [Multi-Agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents)

---

## Prerequisites

- Access to Microsoft Copilot Studio
- Dataverse search enabled in environment
- Access to Dataverse unbound action connector
- Sample data loaded into Dataverse tables
- Access to Account / Contact table in environment
- Access to modify views and create search indexes on Account / Contact table

---

## Summary of Targets

In this lab, you'll explore how Copilot Studio's generative orchestration engine makes decisions and how to influence those decisions. By the end of the lab, you will:

- Have a working sample connected agent (the Account Data Lookup Agent) verified in your environment
- Understand the impact of Instructions and Descriptions on the planner
- Have enabled Enhanced Task Completion and observed how orchestration behavior changes

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Get the Sample Connected Agent Working](#use-case-1-get-the-sample-connected-agent-working) | Confirm the prebuilt connected agent and its data are ready before working with it | 10 min |
| 2 | [See the Impact of Instructions and Descriptions on the Planner](#use-case-2-see-the-impact-of-instructions-and-descriptions-on-the-planner) | Build intuition for how planner decisions track with Instructions and Descriptions | 15 min |
| 3 | [Enable Enhanced Task Completion](#use-case-3-enable-enhanced-task-completion) | Compare orchestration behavior with and without Enhanced Task Completion | 20 min |

---

## Instructions by Use Case

---

## Use Case #1: Get the Sample Connected Agent Working

Verify that the Account and Contact Information agent (the sample connected agent we'll build on throughout this lab) is fully configured to work in your environment.

> [!NOTE]
> If you've already completed this verification in another lab (such as the **Multi-Agent lab**), you can skip this Use Case and continue to [Use Case #2](#use-case-2-see-the-impact-of-instructions-and-descriptions-on-the-planner).

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Get the Sample Connected Agent Working | Confirm the prebuilt connected agent and its data are ready before working with it | 10 minutes |

**Summary of tasks**

In this section, you'll confirm that Dataverse Search is enabled, the Account and Contact tables are indexed, and the Account Data Lookup Agent is published and discoverable.

**Scenario:** Before exploring how Instructions and Descriptions shape orchestration, you need to make sure the agent and its underlying data are properly configured.

### Objective

Confirm the environment is ready and the sample connected agent is published.

---

### Step-by-step instructions

#### Make sure that Dataverse Search is set to on

1. In the upper right corner of Copilot Studio, Select the **Gear** icon

1. Select **Go to Power Platform admin center**

1. In the left navigation, select **Manage** then select **Environments**

1. Select your environment from the list

1. Select **Settings** in the top menu

1. Expand **Product** and select **Features**

1. In the Dataverse search section, ensure **Dataverse search** is turned **On**

1. Select **Save** if you made any changes

#### Ensure that indexes are in place for our connected agent

> [!IMPORTANT]
> This is not required for a connected agent to work, but to make sure that the one we have pre-loaded for you will return results we must index a few tables in your environment.

1. Go to the Power Apps maker portal [https://make.powerapps.com](https://make.powerapps.com)

    ![Open Power Apps](images/image-19.png)

1. In the left menu select **Tables**

1. Select the **Account** table from the list

1. Select **Views** from the Data experiences section

1. Select **Quick Find Active Accounts** option from the list of Views

1. Select **View Column** to verify the following list of columns are in the view, you may have to scroll to see all of the included columns:
   - Address1: State or Providence
   - Address1: Postal Code
   - Address1: City
   - Annual Revenue
   - Currency

1. To add any that are missing select **+ View column** and then select the column from the list.

    ![Account View](images/image-20.png)

1. Add the ability to search on certain fields by making sure that the following items are in the **Find by** on the bottom right. Select the **Edit find table columns** option to check:
   - Address1: State or Providence
   - Address1: Postal Code
   - Address1: City

    ![Add Account Searchable Columns](images/image-21.png)

1. Select **Edit find table columns** to add any missing columns.

1. Select **Save and publish** to update the index

    > [!IMPORTANT]
    > DO NOT navigate away until the save and publish is completed!

1. Select **Back** in the upper left corner to go back to the Views list

1. Select on **Tables** in the Views screen to go back to the list of Tables

    ![Go to Tables](images/image-22.png)

1. Select **Contact** table from the list

1. Select **Views** from the Data experiences section

1. Select **Quick Find Active Contacts** option from the list of Views

1. Select **View Column** to verify the following columns are in the view:
   - Anniversary
   - Birthday
   - Job Title
   - Marital Status

    ![Column Add Contact](images/image-23.png)

1. Select **+ View column** to add any that are missing.

1. Select **Save and publish** to update the index

    > [!IMPORTANT]
    > DO NOT navigate away until the save and publish is completed!

#### Test and Publish the Account and Contact Information Agent

1. In the Copilot Studio tab in your browser, go to the **Account Data Lookup Agent**

1. Open the Test chat by Selecting **Test** in the upper right-hand corner

1. Enter `What are the accounts in Texas?`

1. Verify that you get a response showing that the agent is working and the data is indexed

    ![Test Account Lookup](images/image-24.png)

1. Select **Settings** in the upper right menu

1. Make sure that the setting in the Generative AI menu in the Connected Agents section for **Let other agents connect to and use this one** is set to **On**

1. Close the Settings menu by Selecting the **X** in the upper right-hand corner

1. Select **Publish** and make sure that your agent publishes

> [!IMPORTANT]
> You can't connect to an agent unless it is published

---

### Congratulations! You've completed Use Case #1!

---

### Test your understanding

**Key takeaways:**

* **Dataverse Search must be enabled** – Connected agents that look up Dataverse data depend on Dataverse Search being on at the environment level.
* **Quick Find indexes drive what's searchable** – The columns added to the Quick Find view determine which fields the agent can filter on at runtime.
* **Publishing + sharing must both be on** – A connected agent must be published and have "Let other agents connect to and use this one" enabled before it can be connected.

**Lessons learned & troubleshooting tips:**

* If Dataverse search returns no results, verify the Quick Find views have the correct columns added and the view is saved and published.
* If the agent can't find account data, check that Dataverse Search is enabled in the Power Platform admin center for your environment.

---

---

## Use Case #2: See the Impact of Instructions and Descriptions on the Planner

Walk through where **Instructions** and **Descriptions** live in the Account Data Lookup Agent, then run a series of test queries to observe how the generative orchestration planner uses them to pick the right child agent, tool, and inputs at each turn.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| See the Impact of Instructions and Descriptions on the Planner | Build intuition for how planner decisions track with Instructions and Descriptions | 15 minutes |

**Summary of tasks**

In this section, you'll review the four levels at which the planner reads agent metadata, then run a multi-turn test conversation. Each turn is designed to highlight a different planner decision — which child agent to delegate to, which tool to call, and which input values to pass.

**Scenario:** You verified the Account Data Lookup Agent in Use Case #1. Now you want to understand *how* the planner decides what to do at each turn. The answer lives in the Instructions and Descriptions configured throughout the agent.

### Objective

Build intuition for how the generative orchestration planner reads Instructions and Descriptions to assemble a correct plan.

---

### Step-by-step instructions

#### Review where Instructions and Descriptions are configured

Open the **Account Data Lookup Agent** in Copilot Studio and walk through each of the following locations. Each one is a hook the planner reads when deciding what to do next.

1. **Instructions in Overview**
   - Select the **Overview** page of the Account Data Lookup Agent
   - Read the agent-level Instructions text. These describe the agent's purpose and shape every planning decision the orchestrator makes for this agent.

1. **Child Agents**
   - Select **Agents** from the top navigation
   - Notice the child agents inside this connected agent. Each represents a specialized capability — for example, looking up Accounts vs. looking up Contacts. The planner picks one of these children for each step that requires data lookup.

1. **Instructions in Child Agents**
   - Open one of the child agents and review its Instructions
   - Child-level Instructions narrow scope. The planner uses them once a child has been selected to decide *how* it should handle the current step.

1. **Descriptions in Child Agents**
   - On the same child agent, locate the **Description** field
   - The Description is what the planner reads when deciding *which* child agent to delegate to. Treat it like a label the orchestrator picks from — clear, specific descriptions lead to correct routing.

1. **Descriptions in Tools**
   - Select **Tools** from the top navigation
   - Open a tool and review its Description
   - The planner uses tool descriptions to decide which tool inside a child agent to call for a given step.

1. **Descriptions in Inputs**
   - Inside the same tool, expand each **Input** parameter and read its Description
   - Input descriptions tell the planner what value belongs there at runtime. Vague input descriptions are the most common reason a tool gets called with the wrong argument — even when the right tool was picked.

> [!TIP]
> As you run the demonstration below, watch for moments where the right answer depends on one of these descriptions being clear. If the planner ever picks wrong, the fix is almost always at one of the four levels above — not at the user's prompt.

#### Demonstration

1. Open the Test chat by selecting **Test** in the upper-right corner.

1. Select the **+** in the Test chat to start a **new conversation** so no prior context influences the planner.

> [!IMPORTANT]
> Run the following prompts in order **without resetting the conversation again** between turns. Several prompts depend on the planner remembering earlier results (e.g., "them", "the 2nd one"), and resetting partway through will break those references.

After each response, expand the **activity panel** in the test chat to see which child agent and which tool the planner chose, and what arguments it passed.

1. **Find accounts by location.** Uses the **Address1: State or Providence** column we indexed in Use Case #1.

    ```text
    What are the accounts in Texas?
    ```

    > [!NOTE]
    > Watch the activity panel: the planner picks the **Account** child agent, then chooses the search tool, then puts `Texas` into the right input parameter. The **input description** is what tells the planner where `Texas` belongs.

1. **Carry context across turns.** Asks for more fields on the same accounts.

    ```text
    What are all the details on them?
    ```

    > [!NOTE]
    > "Them" requires the planner to keep the previous account list in context. Notice it does **not** re-search — it expands the previous results using the additional fields available on the Account tool.

1. **Drill into a related entity.** Moves from Accounts to Contacts.

    ```text
    What is the job title of the primary contact of the 2nd one?
    ```

    > [!NOTE]
    > Here the planner has to switch child agents — from the Account child to the Contact child. The **child agent Description** is what makes that decision possible. Without a clear Contact child Description, this turn would either fail or wrongly call the Account child.

1. **Use a derived field.** Age is computed from the indexed **Birthday** column.

    ```text
    How old are they?
    ```

    > [!NOTE]
    > The Contact tool's input description for Birthday is what tells the planner this is a date it can use to compute age. The planner reads "Birthday" from a description and reasons "I can derive age from this."

1. **Use a status field.** Marital Status is one of the columns indexed in Use Case #1.

    ```text
    Are they married?
    ```

    > [!NOTE]
    > Notice the planner maps the colloquial "married" to the structured **Marital Status** field. That mapping is driven by the field's description, not by the user's wording.

1. **Find an account by name.** Different filter than location.

    ```text
    Who is the contact for Coho Winery?
    ```

    > [!NOTE]
    > The planner now searches by account **name** rather than by city/state, then chains into the Contact child agent to retrieve the contact. This whole plan — search-by-name → switch child → contact lookup — was assembled entirely from the Descriptions you reviewed at the start of this Use Case.

---

### Congratulations! You've completed Use Case #2!

---

### Test your understanding

**Key takeaways:**

* **Instructions shape behavior; Descriptions shape routing.** Instructions are how an agent (parent or child) behaves once selected. Descriptions are how the planner decides whether to select it in the first place.
* **The planner reads descriptions at four levels** — agent, child agent, tool, and input. Weakness at any one level cascades into wrong routing or wrong arguments.
* **Conversation context carries through orchestration.** Pronouns like "them" and ordinals like "the 2nd one" are resolved against prior turns, then handed to the right tool with the right argument — without the user repeating themselves.

**Lessons learned & troubleshooting tips:**

* If the planner picks the wrong child agent, the **child's Description** is usually the place to fix it.
* If a tool gets called with the wrong argument, it's almost always an **input Description** issue, not the user's wording.
* If the planner re-searches when it should have used context, your tool descriptions may be unclear about which inputs are required vs. optional.

---

---

## Use Case #3: Enable Enhanced Task Completion

Enable Enhanced Task Completion on a sample agent and demonstrate how orchestration behavior changes with the feature on versus off.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Enable Enhanced Task Completion | Show how Enhanced Task Completion changes orchestration behavior | 20 minutes |

> [!NOTE]
> **Author content pending.** This Use Case will guide participants through enabling Enhanced Task Completion on a sample agent, building tools to be orchestrated, and demonstrating how the orchestration engine's behavior changes when the feature is enabled. Detailed authoring instructions to follow.

---

## Summary of learnings

> [!NOTE]
> **Author content pending** — to be written once Use Cases #2 and #3 are detailed.

---
