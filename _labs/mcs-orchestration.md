---
layout: lab
title: "Orchestration with Copilot Studio"
order: 800
duration: 60
difficulty: 300
lab_type: local
section: core_learning_path
journeys: ["developer"]
bootcamp_order: "8"
description: "Apply Module 9 concepts hands-on: explore how Copilot Studio's generative orchestration engine routes requests, see the impact of Instructions and Descriptions on the planner, and enable Enhanced Task Completion to change orchestration behavior."

---

---

# Orchestration with Copilot Studio

Apply Module 9 concepts hands-on: explore how Copilot Studio's generative orchestration engine routes requests, see the impact of Instructions and Descriptions on the planner, and enable Enhanced Task Completion to change orchestration behavior.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 300 | Maker | 60 minutes | After completing this lab, participants will understand how Copilot Studio's generative orchestration engine selects tools and child/connected agents, see firsthand how Instructions and Descriptions shape that selection, and enable Enhanced Task Completion to alter orchestration behavior. |

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

**Pairs with:** Module 9 — Orchestration and Dynamic Chaining Concepts (the 45-minute session immediately preceding this lab).

---

## Introduction

Welcome to the Copilot Studio Orchestration lab. This is the hands-on companion to **Module 9 — Orchestration and Dynamic Chaining Concepts**.

You'll start by ensuring a sample connected agent is configured and working in your environment, then walk through changing Instructions and Descriptions to see how the planner's choices shift, and finally enable Enhanced Task Completion to compare orchestration behavior with and without it.

**What You Will Learn**

- How **Instructions** and **Descriptions** shape standard generative orchestration, and the priority order the planner uses
- How to use the **activity tracker** and **Get rationale** to debug and tune planner decisions
- What **Enhanced Task Completion**'s Reasoning Loop changes about orchestration
- When to choose standard orchestration vs. Enhanced Task Completion

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
- A Power Platform environment where you can edit Dataverse table views and toggle environment settings (System Administrator or System Customizer)
- Sample data loaded into the Account and Contact Dataverse tables (the (sample) records used throughout Use Cases #1 and #2)
- The pre-loaded **Account Data Lookup Agent** available in your environment (Use Case #1 verifies and publishes it)
- For Use Case #3 only: an environment where Enhanced Task Completion (preview), Dataverse Intelligence (Work IQ), and Dataverse MCP servers can be turned on

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
| 2 | [See the Impact of Instructions and Descriptions on the Planner](#use-case-2-see-the-impact-of-instructions-and-descriptions-on-the-planner) | Build intuition for how planner decisions track with Instructions and Descriptions | 20 min |
| 3 | [Enable Enhanced Task Completion](#use-case-3-enable-enhanced-task-completion) | Compare orchestration behavior with and without Enhanced Task Completion | 30 min |

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

1. In the Dataverse search section, verify that **both** check boxes are enabled:
   - **Turn on search indexing to support Dataverse intelligence (Work IQ) in AI and agent experiences**
   - **Show global search bar in all model driven apps and turn on search indexing to support search-only experiences**

    ![Dataverse Search Settings](images/image-28.png)

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
   - Address 1: State/Province
   - Address1: Postal Code
   - Address1: City
   - Annual Revenue
   - Currency

1. To add any that are missing select **+ View column** and then select the column from the list.

    ![Account View](images/image-20.png)

1. Add the ability to search on certain fields by making sure that the following items are in the **Find by** on the bottom right. Select the **Edit find table columns** option to check:
   - Address 1: State/Province
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

#### Test and Publish the Account Data Lookup Agent

1. In the Copilot Studio tab in your browser, go to the **Account Data Lookup Agent**

1. Open the Test chat by Selecting **Test** in the upper right-hand corner

1. Enter `What are the accounts in Texas?`

1. Verify that you get a response showing that the agent is working and the data is indexed

    ![Test Account Lookup](images/image-24.png)

1. Select **Settings** in the upper right menu

1. Make sure that the setting in the Generative AI menu in the Connected Agents section for **Let other agents connect to and use this one** is set to **On**

1. Close the Settings menu by Selecting the **X** in the upper right-hand corner

1. Select **Publish**. In the **Publish this agent** dialog, make sure **Force newest version** is checked, then select **Publish** to confirm.

    ![Publish this agent](images/image-29.png)

> [!IMPORTANT]
> You can't connect to an agent unless it is published. Forcing the newest version ensures any agent that connects to it picks up your latest changes.

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
| See the Impact of Instructions and Descriptions on the Planner | Build intuition for how planner decisions track with Instructions and Descriptions | 20 minutes |

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
   - Read the agent-level **Instructions** text. These are top-level instructions for the agent itself — they describe its purpose, behavioral rules, and any cross-cutting constraints.

    ![Instructions in Overview](images/image-30.png)

   - **Instructions run on every turn.** Unlike a tool description (which the planner only reads when deciding *whether* to use that tool), agent-level Instructions are appended to the planner's context for **every** turn of the conversation. That makes them the right place for rules that should always apply, regardless of which tool or child agent gets called.
   - In the screenshot above, notice the two kinds of guidance:
     - **Argument-handling rule** — *"If (sample) is provided in the name of a contact or account name include it when passing it to other tools."* This tells the planner how to clean up a value before handing it off, on every turn.
     - **Formatting / behavior rules** — under `#Formatting Rules`, *"Never offer to export or create a file."* This is a hard restriction on agent output applied to every response.

   > [!TIP]
   > Agent-level Instructions are powerful but expensive: they consume planner context on every turn. Use them for rules that genuinely apply everywhere. For rules that only apply when a specific tool or child agent runs, prefer a description on that tool / child instead.

1. **Child Agents**
   - Select **Agents** from the top navigation
   - Notice the child agents inside this connected agent: **Account Agent** and **Contact Agent**, both with a **Child** relationship. Each represents a specialized capability — looking up Accounts vs. looking up Contacts. The planner picks one of these children for each step that requires data lookup.

    ![Child Agents — Account Agent and Contact Agent](images/image-32.png)

1. **Descriptions in Child Agents**
   - Open the **Account Agent** child agent and look at the **Details** panel — specifically the **Name** and **Description** fields.

    ![Child Agent Details — Name and Description](images/image-31.png)

   - **Names get higher priority than descriptions** in the planner's routing decision. A clear, intent-revealing name (e.g., *"Account Agent"*) does most of the work — the planner will match user intent against the name before it weighs description content.
   - **Descriptions add context and handling information** that names alone can't carry. They're the right place for *what kind of work this agent does* (e.g., *"This agent provides information and performs tasks for accounts"*), special handling rules, and anything that helps the planner pick correctly when two child agent names sound similar.
   - Explore **both** child agents inside the Account Data Lookup Agent. For each one, compare its Name and Description, and consider: if a user asked "show me the contacts for Coho Winery", which child agent's Name + Description combination most clearly signals it should handle the request? That's the same reasoning the planner does at runtime.

   > [!TIP]
   > If two child agents have similar names, the description becomes the tiebreaker. If you ever see the planner route to the wrong child, the first thing to check is whether the names are distinct enough — fix the name before fixing the description.

1. **Instructions in Child Agents**
   - On the same child agent, select **Instructions** from the left panel.

    ![Account Agent — Instructions](images/image-33.png)

   - **Child-level Instructions only run when this child agent runs.** Where the parent's Instructions apply to every turn, a child's Instructions narrow scope — they're appended to the planner's context only when this specific child has been selected for a step. That makes them the right place for rules and tool-selection guidance that should fire *only* inside this child's responsibilities.
   - In the screenshot, the **Account Agent**'s Instructions reference two specific tools — **Find Account** and **Get Account Details** — by name, and tell the planner exactly when to use each:
     - *"Use **Find Account** to find account to lookup the details of"* — when the user's intent is *locate an account*, this tool is the dispatch target.
     - *"Use **Get Account Details** to get the details of an account"* — when the user's intent is *expand details on an account already in context*, this tool is the dispatch target.
     - *"When asked for the details on an account provide all details content in the list provided back that is in data provided from **Get Account Details**"* — a formatting / response rule: don't summarize, return the full detail list.
   - The green pills (`Find Account`, `Get Account Details`) you see in the screenshot are not free text — they are explicit tool references inserted from a picker. The planner reads these as hard pointers to specific tools, not as suggestions.

   > [!TIP]
   > If you can't get what you're looking for by updating the tool **name** or **description**, then using **Instructions** is a good way to force the child agent to properly leverage the right tool. Treat Instructions as a stronger lever — reach for the tool's own name and description first, and use child-level Instructions to lock in the behavior when name and description tuning aren't enough.

1. **Descriptions in Tools**
   - Select **Tools** from the top navigation, then open the **Find Account** tool.

   > [!IMPORTANT]
   > If you see a **red exclamation** on the tool, the connection isn't set. Set the **Connection** (top-right of the tool's Details panel), select **Save**, then **close the tool and reopen it** so the changes apply.

   - Review the **Details** panel — the **Name** and **Description** fields.

    ![Find Account tool — Details](images/image-34.png)

   - **Tool Name and Description follow the same priority pattern as child agents** — **Name takes priority, Description adds context.** A short, intent-revealing tool name (*"Find Account"*) is what the planner matches against first. The description is the place to add what the name alone can't carry.
   - **The description is where you tell the planner what the tool actually does — and what inputs it accepts in plain language.** Notice this tool's description:

     > *"This tool allows a user to find an account by the information provided in the account such as city, account name, primary contact, state, and other account related details."*

     It does two important jobs:
     - **Names the operation** — *"find an account"* — so the planner can match the user's intent.
     - **Hints at the inputs in natural language** — *"city, account name, primary contact, state…"* — so when a user says "accounts in Texas" or "the Coho Winery account", the planner can recognize that those values map to inputs this tool accepts, *before* it even reads the formal input parameter list in step 6.
   - Notice the tool is **Available to: Account Agent** — tool availability is scoped to specific child agents, which keeps the planner's candidate set small and routing decisions cleaner.

   > [!TIP]
   > If the planner keeps failing to call a tool when a user's intent obviously matches it, the tool's description is usually missing the right vocabulary. Add the user's likely phrasing to the description (intent verbs + filterable attributes) before reaching for harder fixes like child Instructions.

1. **Descriptions in Inputs**
   - Still in the **Find Account** tool, select **Inputs** from the left panel. Expand the **search** input.

    ![Find Account tool — Inputs](images/image-35.png)

   - **Input descriptions tell the planner what value belongs in the input *and how to format it*.** The planner uses this text to translate a user's words into the exact value the tool expects to receive. Vague input descriptions are the most common reason a tool gets called with the wrong argument — even when the right tool was picked.
   - Read the description on the `search` input carefully:

     > *"Search query that includes state in the format of two digit state code in all caps, 5 digit zip code, city, the account name, and/or the primary contact name"*

     Notice how strict the **state code formatting requirement** is: *"two digit state code in all caps"*. That single phrase tells the planner to translate the user's word *"Texas"* into `TX`, not `texas`, not `Texas`, not `Tex`. Dataverse search only matches if the value comes in correctly cased and formatted — so this description is what makes the difference between *"agent returned all Texas accounts"* and *"agent returned no results."*
   - **The `Fill using` column** (left of the Value column) controls how each input gets its value at runtime. The options include **Custom value** (the planner fills it from the conversation, guided by the description) and **dynamically filled** options that pull from variables or **outputs of an earlier tool**. The description matters in either case — when the value is dynamically filled from another tool's output, the description tells the planner *how to reshape that output* to match this input's expected format.

   > [!IMPORTANT]
   > Input descriptions are the foundation of **dynamic chaining** — the pattern where the orchestrator uses one tool's output as another tool's input across turns. For dynamic chaining to work, every input in the chain needs a description clear enough for the planner to know what shape the value should arrive in. Skip this, and the planner has to *guess* how to transform data between steps; with good input descriptions, the transformation is deterministic.

   > [!TIP]
   > When you author your own tool, write input descriptions in the form *"&lt;what the value is&gt; in the format of &lt;exact format&gt;"*. The `search` input above is a good template — it names the field (state, zip, city, account name) and then specifies the format the field must arrive in. That two-part pattern is what gives the planner enough to format correctly across both user-driven and chained inputs.

#### Demonstration

> [!TIP]
> As you run the demonstration below, watch for moments where the right answer depends on one of the descriptions reviewed above being clear. If the planner ever picks wrong, the fix is almost always at one of those levels — not at the user's prompt.

1. Open the Test chat by selecting **Test** in the upper-right corner.

1. Select the **+** in the Test chat to start a **new conversation** so no prior context influences the planner.

   > [!IMPORTANT]
   > Run the following prompts in order **without resetting the conversation again** between turns. Several prompts depend on the planner remembering earlier results (e.g., "them", "the 2nd one"), and resetting partway through will break those references.

   After each response, expand the **activity panel** in the test chat to see which child agent and which tool the planner chose, and what arguments it passed.

1. **Find accounts by location.** Uses the **Address 1: State/Province** column we indexed in Use Case #1.

    ```text
    What are the accounts in Texas?
    ```

    Expand the **activity tracker** for this turn. You should see all three planner decisions land correctly, and — most importantly — see the input value transformation in action.

    ![Activity tracker — Find Account input shows search: TX](images/image-36.png)

    Notice in the screenshot:
    - **Right child agent picked**: `Account Agent` (left column). The name + description from step 3 of the review made this decision possible.
    - **Right tool picked**: `Find Account` (left column, under Account Agent). The tool's name + description from step 5 of the review steered the planner to this tool over any other Account tool.
    - **Input value optimized to the required format**: in the Inputs panel on the right, the `"search"` value is `"TX"` — not `"Texas"`. The user typed *"Texas"*, but the **input description we reviewed in step 6** (*"two digit state code in all caps"*) told the planner to translate the user's word into the format Dataverse search requires. Without that description, the search would have run with `"search": "Texas"` and returned nothing.

    > [!NOTE]
    > This single turn shows every layer of the review working together: parent Instructions set the always-on rules, child agent Name + Description routed to the right child, tool Name + Description routed to the right tool, and the input Description formatted the value. Each layer is doing its own job, and the right answer only emerges when all four are clear.

1. **Carry context across turns.** Asks for more fields on the same accounts.

    ```text
    What are all the details on them?
    ```

    Expand the **activity tracker** for this turn. You should see something like the screenshot below — the planner did **not** re-run the search; instead it took the 4 accounts from the previous turn and called **Get Account Details** once per account.

    ![Activity tracker — 4 Get Account Details calls under Account Agent](images/image-37.png)

    Notice in the screenshot:
    - **Same child agent**: still `Account Agent` — the planner stayed in the same child for a related follow-up question.
    - **Different tool, different pattern**: the previous turn called `Find Account` (search). This turn calls `Get Account Details` — a different tool whose description told the planner *"use me when expanding details on an account already in context"*.
    - **Four parallel calls, one per account**: `Total 4`. The planner walked the 4-account result from the previous turn and issued one details call per account, using each account's identifier from the conversation context as the input.
    - **Pronoun resolution worked**: the word *"them"* was never sent to a tool. The planner resolved it to the specific 4 accounts and made the data flow deterministic.

    > [!TIP]
    > This **find → details** pattern is one of the most important design choices in agent authoring. The search tool returns a minimal record per match (just enough to identify it). The details tool fetches the full payload **only for the specific items the user asks about**. The alternative — having one tool that returns every field for every match — would dump a huge amount of data into the LLM's context on every search, blowing the token budget and making the prompt unmanageable. Splitting the work across two tools means **only the data the user actually needs ever reaches the LLM**.

1. **Drill into a related entity.** Moves from Accounts to Contacts.

    ```text
    What is the job title of the primary contact of the 2nd one?
    ```

    Expand the **activity tracker** for this turn and click into the child agent block. You should see something like the screenshot below — the planner switched from `Account Agent` to `Contact Agent`, and constructed a concrete task input from the conversation context.

    ![Activity tracker — Contact Agent dispatch with resolved Task input](images/image-38.png)

    Notice in the screenshot:
    - **Right child agent picked**: the planner moved out of `Account Agent` and into `Contact Agent`. The Contact Agent's **Description** (*"This agent provide ability to get information on contacts and perform actions on contacts"*) is what told the planner this child is the right home for a primary-contact / job-title question.
    - **Context fully resolved into a concrete Task**: the user said *"the primary contact of the 2nd one."* Look at the **Task** input the parent's planner sent to the Contact Agent — it isn't *"the 2nd one"*; it's *"Get the job title of Nancy Anderson (sample), the primary contact for Adventure Works (sample)."* The parent did the context resolution **before** dispatching to the child:
      - *"the 2nd one"* → `Adventure Works (sample)` (item 2 in the previous turn's account list)
      - *"the primary contact of"* → `Nancy Anderson (sample)` (resolved from the account record retrieved earlier)
    - **Child agents take a natural-language Task, not structured parameters**: the input to a child agent is a sentence describing what to do. That keeps the parent → child handoff flexible — the child decides which of its own tools to use to fulfill the Task.
    - **Summary output shows the reasoning trace**: the Outputs panel returns a Summary that names the tool the child called (`Get-Contact-Details`) and the answer (`'Purchasing Assistant'`). That summary is what the parent agent uses to compose its reply to the user.

1. **Use a derived field.** Asks for a value (`age`) that doesn't exist in the database — it has to be **calculated** from a value that does (`birthdate`).

    ```text
    How old are they?
    ```

    Expand the **activity tracker**, click into the `Contact Agent` block, and look at the **Outputs** Summary. You should see something like the screenshot below — the agent didn't just hand back a birthday, it **calculated the actual age in years** using today's date.

    ![Activity tracker — Contact Agent computing age from birthdate](images/image-39.png)

    Notice in the screenshot:
    - **The Task input asks for age, not birthdate**: the parent's planner translated *"How old are they?"* into the Task *"Retrieve the age of Nancy Anderson (sample), the primary con[tact for Adventure Works]"*. Even though the underlying Dataverse column is **Birthdate**, the parent didn't lower the user's intent to match the column — it kept the Task at the *intent* level (`age`).
    - **The Summary walks through the derivation step-by-step**: *"Her birthdate was retrieved as April 22, 1960, and it was calculated that as of May 10, 2026, she is 66 years old."* That sentence is the LLM showing its work — fetch raw data, compute the derived value, return the answer.
    - **No "age" tool exists**: the Contact Agent never called a `Get-Contact-Age` tool, because there isn't one. It called `Get-Contact-Details`, retrieved the birthdate, and the LLM did the date math itself before composing the Summary.
    - **Context still carrying**: *"they"* resolved to Nancy Anderson from the previous turn, with no explicit re-introduction.

    > [!TIP]
    > This turn shows an important orchestration capability: the planner is happy to **derive answers from raw data** rather than expecting a tool for every possible question. You don't need a `Get-Contact-Age` tool — exposing `Birthdate` is enough, because the LLM can reason about dates. Reach for a tool only when the calculation is something the LLM *can't* do reliably (large datasets, exact business rules, anything requiring secrets or signed calls). For everything else, raw fields plus a clear Summary are usually all the planner needs.

1. **Use a status field, then ask the planner to explain itself.** Marital Status is one of the columns indexed in Use Case #1.

    ```text
    Are they married?
    ```

    Confirm the agent answers correctly (Nancy Anderson is married). Now scroll to the bottom of the activity tracker item for this turn and select **Get rationale**. The agent will produce a plain-language explanation of *why* it chose the tools it chose and *how* it built the plan.

    ![Activity tracker — Get rationale showing planner's plan in plain language](images/image-40.png)

    Notice in the screenshot:
    - **The Summary at the top recaps what happened across the recent turns** — it names the accounts, the contact, and the specific values the agent retrieved (`Purchasing Assistant`, `66`, `married`).
    - **The Rationale section breaks the plan into discrete reasoning steps**, in the planner's own words:
      - *"Identify all accounts based in Texas from the provided data."*
      - *"Extract and list all available details for each Texas-based account."*
      - *"Confirm and present the job title of the primary contact for Adventure Works (sample)."*
    - **This is the planner's interpretation of your prompts back to you** — not a generic post-hoc explanation. It tells you exactly which goals the planner thinks it was solving and the order it solved them in.

    > [!TIP]
    > **Get rationale is the most useful tuning tool in the entire orchestration story.** When the planner does the wrong thing — picks the wrong tool, summarizes a value incorrectly, skips a step — the rationale tells you *why* it thought that was right. Read it side-by-side with your Instructions and Descriptions. If the rationale reflects the meaning you intended, your descriptions are doing their job. If it reflects something subtly wrong (*"identify the largest account"* when you meant *"the most recently updated account"*), you have a precise pointer to which description needs sharper wording. Treat the rationale as a debugger trace for your descriptions.

1. **Pivot directly to a contact.** Up to this point every prompt has started from accounts. This one enters from the **contact** side.

    ```text
    What is Susanna Stubberod's phone number?
    ```

    Expand the **activity tracker** for this turn and notice that the planner went **directly to the Contact Agent** — there is no `Account Agent` block, and no `Find Account` call.

    ![Activity tracker — direct dispatch to Contact Agent for Susanna Stubberod's phone number](images/image-41.png)

    Notice in the screenshot:
    - **No Account Agent in the activity trace.** The planner read the user's request, recognized that the subject is a *person* (`Susanna Stubberod`), and dispatched straight to the `Contact Agent`. It didn't search accounts first because the question doesn't require one.
    - **The Task input names both the contact and their account context**: *"Retrieve the phone number for Susanna Stubberod (sample), who is the primary contact for Litware, Inc. (sample)."* The planner enriched the Task with the related account information it discovered along the way, so the Contact Agent has full context for its lookup.
    - **The Summary mirrors the answer back to the parent** with the same enrichment, naming both Susanna and Litware, Inc.
    - **Two Contact Agent calls visible** — the activity tracker still shows the previous turn's Contact Agent invocation as well, since the test session is the same conversation.

    > [!NOTE]
    > **This is the payoff of designing the agent the way it's been designed.** Because Account Agent and Contact Agent are *peer* child agents — neither one calls the other — the planner can enter from whichever side the user's question naturally starts at:
    >
    > - *"What are the accounts in Texas?"* → `Account Agent`
    > - *"Who's the primary contact for Adventure Works?"* → `Account Agent` → `Contact Agent` (chained)
    > - *"What is Susanna Stubberod's phone number?"* → `Contact Agent` directly
    > - *"What's the phone number of every primary contact in Texas?"* → `Account Agent` → `Contact Agent` (looped, one contact per account)
    >
    > The same set of tools answers every direction of question. **You don't write a tool for each pivot — you write good descriptions on each tool, and the planner finds the path.** That's the difference between an agent you have to extend for every new question and one that flexes to whatever the user asks.

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

Build a new **Sales Account Assistant** agent, enable **Enhanced Task Completion** on it, attach a set of tools the planner can orchestrate, and test how the agent behaves with the feature turned on.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Enable Enhanced Task Completion | Show how Enhanced Task Completion changes orchestration behavior | 30 minutes |

**Summary of tasks**

In this section, you'll enable the **Dataverse Intelligence (Work IQ)** and **Dataverse MCP server** features required for this lab's scenarios, create a new Sales Account Assistant agent, attach a sample knowledge file, turn on Enhanced Task Completion, build the tools the agent will orchestrate, and run a series of tests to see the feature in action.

**Scenario:** You're building a Sales Account Assistant that needs to complete multi-step tasks for sales associates without prompting them at every step. Enhanced Task Completion changes how the planner drives the conversation toward the user's end goal, so the same prompts produce noticeably different behavior with the feature on versus a baseline agent.

### Objective

Stand up a new agent with Enhanced Task Completion enabled and validate the feature's impact on orchestration behavior.

---

### Step-by-step instructions

#### Enable Dataverse Intelligence (Work IQ) and Dataverse MCP servers

> [!NOTE]
> The features below are required for the rest of this Use Case to work, but they are **not** required by Enhanced Task Completion itself. They're separate environment-level prerequisites — the Sales Account Assistant relies on **Dataverse Intelligence (Work IQ)** for AI-aware Dataverse access and on **Dataverse MCP servers** for the MCP-based tools you'll build later in this Use Case.

1. Navigate to the **Power Platform admin center** the same way you did in [Use Case #1](#use-case-1-get-the-sample-connected-agent-working) — in Copilot Studio, select the **Gear** icon in the upper right, then **Go to Power Platform admin center**.

1. In the left navigation, select **Manage** → **Environments**, choose your environment, then select **Settings** in the top menu.

1. Expand **Product** and select **Features**.

1. Scroll to the **Dataverse intelligence** section and verify that **Turn on Dataverse intelligence (Work IQ) for agents and AI experiences** is checked.

1. Scroll to the **Dataverse Model Context Protocol** section. Under **Step 1: Decide whether or not you'll allow MCP client access**, verify that **both** options are checked:
   - **Allow MCP clients to interact with Dataverse MCP server (GA version)**
   - **Allow MCP clients to interact with Dataverse MCP server (Preview version)**

1. Use the screenshot below to confirm your settings match. Three check boxes should be on — one Work IQ box and two MCP boxes.

    ![WorkIQ + Dataverse MCP feature settings](images/image-42.png)

1. Select **Save** if you made any changes.

> [!TIP]
> If you don't see the **Dataverse Model Context Protocol** section at all, your environment hasn't received that release yet. The Use Case will still work for the parts that don't depend on MCP tooling, but specific steps in the *Create the tools* section may need adjustment for non-MCP equivalents.

#### Create the Sales Account Assistant

You'll build a brand-new agent for this Use Case. It is **separate** from the Account Data Lookup Agent used in Use Cases #1 and #2 — keeping them apart makes the Enhanced Task Completion behavior easier to compare against the baseline you've already seen.

1. In Copilot Studio, select **Agents** in the left navigation pane.

1. On the Agents page, select **+ Create blank agent** in the upper-right corner.

    ![Agents page with the Create blank agent button](images/image-43.png)

1. In the **Name your agent** dialog, enter:

    ```text
    Sales Account Assistant
    ```

    Leave **Agent settings (Optional)** collapsed — the defaults are fine for this Use Case.

    ![Name your agent — Sales Account Assistant](images/image-44.png)

1. Select **Create**.

1. Wait for the agent to finish provisioning, then confirm you're on the new Sales Account Assistant's **Overview** page (the agent name should appear at the top of the page).

> [!NOTE]
> **Why a blank agent rather than the description-driven creation flow?** Starting blank means we begin with no instructions, no tools, and no knowledge sources. That's the right baseline for this Use Case — every behavior you observe later in the test phase is the direct result of a setting *you* turn on, not something the description-driven setup added on your behalf. Easier to attribute the changes to Enhanced Task Completion when nothing else has been auto-configured.

#### Add knowledge to the agent

Add the workshop's sample policy document so the agent has a body of knowledge to reason against during the test phase. The document is already published to the workshop's **OnePlace** SharePoint site, so the fastest path is to pick it from there as a SharePoint knowledge source — that path queries SharePoint live via Work IQ and avoids the Dataverse indexing wait of an uploaded file.

1. On the Sales Account Assistant's **Overview** page, scroll down to the **Knowledge** section.

1. Select **+ Add knowledge** in the upper-right of the Knowledge section.

1. In the **Add knowledge** dialog, locate the **SharePoint** card labeled **Powered by Work IQ** (further down in the knowledge-source list — **not** the SharePoint shortcut inside the *Upload file* card at the top, which uploads to Dataverse and requires indexing). Select that card.

1. Select **Browse items**.

1. In the file picker, navigate to **OnePlace → Documents → HR**, then select **company_policies_sample.pdf** and choose **Confirm selection**.

1. Select **Add to agent**. The file appears in the Knowledge section with status **Ready** almost immediately (no Dataverse indexing required).

    ![Knowledge section showing company_policies_sample.pdf with Ready status](images/image-58.png)

> [!NOTE]
> **Why Work IQ SharePoint instead of file upload.** The *Upload file* card at the top of the Add knowledge dialog also offers a SharePoint shortcut, but that path **uploads a copy into Dataverse** and waits on Dataverse indexing (often several minutes in shared environments). The **SharePoint - Powered by Work IQ** card lower in the list **queries SharePoint live** through Work IQ, so the file is Ready immediately and stays in sync with the source document. Use Upload-to-Dataverse only when the file lives on your local machine and isn't already in a SharePoint location the agent's user can read.

#### Enable Enhanced Task Completion

1. With the **Sales Account Assistant** open, select **Settings** in the top toolbar (between **Publish** and the **...** menu).

    ![Settings button in the agent's top toolbar](images/image-45.png)

1. In the Settings panel, select the **Generative AI** tab on the left.

1. Scroll to the **Orchestration** section and turn **Enhanced task completion** to **On**.

1. A confirmation dialog will appear. Read it carefully — it lists exactly which capabilities are supported and which are *unsupported* while Enhanced Task Completion is enabled.

    ![Enhanced task completion — supported / unsupported confirmation dialog](images/image-46.png)

    The current dialog states:

    **Supported** with Enhanced Task Completion:
    - **Tools** (MCP / connectors / Agent Flows)
    - **Knowledge**
    - **Connected agents**

    **Unsupported** with Enhanced Task Completion:
    - **Topics** — your topic-driven dialogs won't run while ETC is on
    - **Evaluation / Analytics** — evaluation runs and analytics dashboards aren't applicable
    - **Child agents** — peer-child orchestration like the Account Agent / Contact Agent pattern from Use Case #2 is not supported
    - **Activity history** — the activity tracker / "Get rationale" view you used in Use Case #2 is not available the same way

    > [!IMPORTANT]
    > Enhanced Task Completion is an **experimental** feature and is not yet supported for production use. The supported / unsupported list above reflects the current Preview build — **expect this list to change as the feature moves toward general availability**. Always read the in-product dialog at the time you enable it; do not rely solely on this lab's snapshot.

1. Select **Confirm** to accept the trade-offs and proceed.

1. Back in the Settings panel, you should see the **Enhanced task completion** toggle in the **On** state with the **Experimental** badge, and a banner at the top confirming *"Enhanced task completion is enabled. Some features are not currently supported."* Select **Save** at the bottom of the panel.

    ![Settings panel showing Enhanced task completion enabled, with Save button](images/image-47.png)

1. Close the Settings panel by selecting the **X** in the upper-right corner.

1. Notice that the **Test pane on the right side of the canvas is now larger and takes up roughly half of the screen** — and the **Activity Tracker** view you used throughout Use Case #2 has been replaced by this expanded Test pane. The new orchestrator surfaces its work directly inside the Test pane rather than in a separate Activity Tracker panel.

    ![Sales Account Assistant Overview with the expanded Test pane after enabling ETC](images/image-48.png)

> [!IMPORTANT]
> The familiar **Activity Tracker** UI from Use Case #2 — the per-turn breakdown showing which child agent and tool the planner chose, plus **Get rationale** — is **not available** while Enhanced Task Completion is on. The expanded Test pane is the new surface for inspecting agent behavior under ETC. If you ever need to compare against standard-orchestration behavior, you'll need to toggle Enhanced Task Completion off, save, and reload — at which point the Activity Tracker comes back.

> [!NOTE]
> **What you just turned on.** Enabling Enhanced Task Completion swaps the orchestrator under the hood. Standard generative orchestration — the planner you watched in Use Case #2 — uses a single-pass approach where it picks a tool / child / knowledge source per turn based on user intent. Enhanced Task Completion replaces that with a **Reasoning Loop**: the agent plans, calls a tool, observes the result, decides whether the user's task is complete, and iterates. The same prompt that produced one tool call under standard orchestration may now produce several iterations of plan-act-observe before the agent responds. That's the change you'll observe in the test phase.

#### Create the tools the agent will orchestrate

You'll add three tools to the Sales Account Assistant — a public weather connector, the **Work IQ Mail** MCP server (so the agent can read mail context), and the **Microsoft Dataverse MCP Server** (so the agent can reach Dataverse data). Together they give the Reasoning Loop enough surface area to demonstrate Enhanced Task Completion's behavior.

##### Turn on Work IQ for the agent

1. Return to the agent's **Overview** page and scroll down to the **Tools** section.

1. Toggle **Work IQ** to **Enabled**. This is the intelligence layer that personalizes the agent against the signed-in user's Microsoft 365 context (mail, files, calendar, Teams).

    ![Overview — Tools section with Work IQ enabled and Add tool button](images/image-49.png)

##### Add the Weather tool

1. In the **Tools** section, select **Add tool**.

1. In the search box at the top of the Add tool dialog, type:

    ```text
    Weather
    ```

1. Under the **MSN Weather** heading, select **Get current weather**.

    ![Add tool — Weather search with MSN Weather Get current weather highlighted](images/image-50.png)

1. The next screen prompts for a **Connection**. Open the **Connection** dropdown and select **+ Create new connection**.

    ![Get current weather — Create new connection](images/image-51.png)

1. Select **Create** to create the MSN Weather connection. Once it shows as connected, return to the Add tool flow and select **Add and configure**.

1. The tool's Details panel opens. Scroll to **Additional details** and locate **Credentials to use**. Change the dropdown to **Maker-provided credentials**.

    ![Get current weather — Maker-provided credentials in Additional details](images/image-52.png)

    > [!NOTE]
    > **Why Maker-provided credentials for this tool.** The MSN Weather connector doesn't require a per-user identity — it's effectively an anonymous / public-data API. With **Maker-provided credentials**, *your* connection (the maker's) is reused for every end user, so users never see a connection prompt. This is the right pattern for any tool that authenticates anonymously, with an API key, or with a service account. For tools that act *as the user* (their mail, their files, their account data), use the default **End-user credentials** instead so each user authenticates with their own identity.

1. In the left panel of the tool's configuration, select **Inputs**.

1. Find the **Units** input. Change **Fill using** from the default to **Custom value**, then enter the value:

    ```text
    Metric
    ```

    (Or `Imperial` if you'd rather see Fahrenheit / mph in your tests.)

    ![Get current weather — Inputs with Units set to Custom value: Metric](images/image-53.png)

1. Leave **Location** set to **Dynamically fill with AI** so the planner can populate it from conversation context.

1. Select **Save** in the top-right of the tool configuration.

##### Add the Work IQ Mail MCP tool

1. Go back to the agent's **Overview** page (or **Tools** in the top nav) and select **Add tool** again.

1. In the search box, type:

    ```text
    work iq
    ```

1. Apply the **Model Context Protocol** filter at the top of the dialog so the results are scoped to MCP servers.

1. Under the **Work IQ Mail MCP** heading, select **Work IQ Mail (Preview)**.

    ![Add tool — Work IQ Mail (Preview) under Work IQ Mail MCP](images/image-54.png)

1. The **Connect to Work IQ Mail MCP** dialog opens. Leave the **Authentication type** as **Login with Microsoft Entra ID** — this MCP server acts on behalf of the signed-in user, so end-user credentials are correct here (the opposite of what we did for Weather).

    ![Connect to Work IQ Mail MCP — Login with Microsoft Entra ID](images/image-55.png)

1. Select **Create**, then **Add and configure** when the connection completes.

1. On the tool's Details panel, leave the defaults — the auto-populated description from the MCP server is sufficient for this Use Case. Select **Save**.

##### Add the Microsoft Dataverse MCP Server tool

1. Select **Add tool** again.

1. In the search box, type:

    ```text
    Dataverse
    ```

1. Apply the **Model Context Protocol** filter.

1. Select **Microsoft Dataverse MCP Server** — the **Connector action** card on the left, marked *"Provides Remote MCP Server access to Dataverse."*

    > [!IMPORTANT]
    > Pick the **Microsoft Dataverse MCP Server** card, **not** the *(Deprecated)* or *(Preview)* variants you'll see beside it in the search results. The preview and deprecated entries are older builds and may behave inconsistently with what this lab shows.

    ![Add tool — Microsoft Dataverse MCP Server selected (not Deprecated / not Preview)](images/image-56.png)

1. Create the connection (sign in if prompted), select **Create**, then **Add and configure**.

1. On the Details panel, leave the defaults and select **Save**.

##### Verify your tool list

1. From the top navigation of the Sales Account Assistant, select **Tools**.

1. Confirm your tools list looks like the screenshot below — the three tools you added (**Get current weather**, **Work IQ Mail (Preview)**, **Microsoft Dataverse MCP Server**) plus any additional Work IQ MCP tools that come along when Work IQ is enabled (such as **Work IQ Copilot** and **Work IQ User**).

    ![Sales Account Assistant — Tools list with weather, Work IQ, and Dataverse MCP](images/image-57.png)

> [!NOTE]
> If you see additional Work IQ entries in your list that aren't in the screenshot, that's expected — turning on Work IQ in the previous step exposes a family of MCP servers and the exact set may differ as the feature evolves. The Use Case's test phase only relies on the three tools you added explicitly above.

#### Test agent capabilities

> [!IMPORTANT]
> Before running these tests, confirm the **company_policies_sample.pdf** knowledge file shows **Ready** (not *In progress*) on the Overview page. Until Dataverse finishes indexing the file, prompts that depend on policy content will return inconsistent results.

You'll exercise the Sales Account Assistant with six prompts that progressively show what the **Reasoning Loop** under Enhanced Task Completion can do. Each one is intentionally chosen to stretch the agent across multiple tools — knowledge, Dataverse, weather, and Work IQ Mail — in a single turn.

The Test pane (now occupying roughly half the canvas after enabling Enhanced Task Completion) will surface the planner's intermediate steps inline as it iterates plan → act → observe.

1. **Multi-tool reasoning across knowledge, Dataverse, and weather.** Send the following prompt:

    ```text
    I need to get a gift for the primary account contact for Litware. Can you purpose an appropriate gift that takes in consideration our gifting policies and their weather to make some good recommendations for an appropriate gift.
    ```

    Watch the Test pane. The Reasoning Loop should drive the agent through several distinct steps without prompting you back:
    - Look up the primary contact for **Litware, Inc.** in Dataverse (via the Microsoft Dataverse MCP Server) and resolve to the contact's name and city.
    - Retrieve the **gifting policy section** from the `company_policies_sample.pdf` knowledge file.
    - Call **Get current weather** for the contact's city.
    - Synthesize all three signals into one or more gift recommendations that are policy-compliant and weather-appropriate.

    > [!TIP]
    > This single prompt would have been difficult to fulfill under standard generative orchestration — each tool call would typically end its turn and wait for you. Under Enhanced Task Completion, the planner keeps iterating until it has enough information to satisfy the *complete task*, not just the next reasonable step.

1. **Refine using prior context + create a draft via Work IQ Mail.** Send the following prompt:

    ```text
    This looks good can you please create an email draft to Susana that asks her if one of the gift options that doesn't require manager approval is preferable to her and make sure that she doesn't have any policies that would prevent her from being able to accept the gift.  Thank her for her continued support of our products and company and state that we look forward to working with her more in the future.
    ```

    Notice several things in the Test pane:
    - **Pronoun + name resolution**. The user wrote *"Susana"* (one *n*), but the agent recognized the contact as **Susanna Stubberod (sample)** from the previous turn. Enhanced Task Completion's reasoning is robust to user typos.
    - **Filter applied from policy knowledge**. The agent re-reads the gifting policy to identify which gift options *don't* require manager approval and includes only those in the email.
    - **Compose via Work IQ Mail**. The agent uses the **Work IQ Mail (Preview)** MCP tool to create the draft using the signed-in user's identity (the End-user-credentials choice you made earlier when adding that tool).

1. **Inspect the result.** \***Open Outlook to view the draft you just had the agent create.** You don't need to leave the browser — Copilot Studio runs inside the Microsoft 365 app surface, so Outlook is one click away:

    - Select the **app launcher** (the waffle / 9-dot icon) in the upper-left of the Copilot Studio header.
    - From the app menu that appears, select **Outlook**.

    ![Microsoft 365 app launcher with Outlook highlighted](images/image-59.png)

    Once Outlook is open, navigate to **Drafts** in the left navigation. Open the draft addressed to Susanna and confirm its content matches the agent's response — it should contain:
    - The gift options that don't require manager approval (per policy)
    - A note that none of Susanna's company policies prevent her from accepting
    - A thank-you for her continued support, and a forward-looking close

    > [!NOTE]
    > **Why this matters.** A standard-orchestration agent could *describe* the email it would write and ask you to confirm before drafting. The Reasoning Loop drafts directly because completing the task is the goal, not stopping at the boundary of the next tool. The end-user identity that owns the draft is the one signed in to Copilot Studio — exactly the right behavior for an agent acting on the user's behalf, and exactly why the draft shows up in *your* Outlook Drafts folder.

1. **Pivot to a structured-data ask.** Send the following prompt:

    ```text
    Give me table with all the accounts that are in Texas
    ```

    The agent should use the **Microsoft Dataverse MCP Server** to query Account records filtered to Texas, then format the response as a Markdown table inline in the Test pane. Notice this turn does **not** require the gift-policy or weather context from the previous turns — the planner correctly scopes the work to just Dataverse.

1. **Modify the previous result without re-running the search.** Send the following prompt:

    ```text
    Add the account number to the list
    ```

    The agent should re-render the table with an **Account Number** column added, **without re-querying Dataverse**. The Reasoning Loop has the previous result set in conversation context, so it can reformat in place. (Same conversation-context behavior you saw in Use Case #2's *"What are all the details on them?"* prompt — but here it carries through the new orchestrator as well.)

    > [!TIP]
    > **Account number is just one example — you can ask for any field.** Try requesting other columns from the Account table that you're curious about: city, state, primary contact, annual revenue, industry, last modified date, anything that lives on the Account record. Each ask is a chance to confirm the planner is reformatting from context and **not** re-issuing a Dataverse query. Watching the Test pane during these turns is the cheapest way to internalize what *"Reasoning Loop using prior context"* actually feels like in practice.

1. **Chain to a file-creation step.** Send the following prompt:

    ```text
    Give me that table in an excel file
    ```

    Watch the **train of thought** in the Test pane carefully on this turn. You should see the agent reach for **Bash** to complete the task — it executes a short shell / Python step that converts the in-conversation table into an `.xlsx` workbook and returns a download link.

    Open the workbook and confirm the columns and rows match what the previous turn rendered.

    > [!NOTE]
    > **Why Bash shows up here.** Enhanced Task Completion's Reasoning Loop has access to a **code-execution surface** in addition to the connector / MCP / knowledge tools you explicitly added. When the planner decides the cheapest path to the user's goal is "run a small script," it can. That's how it gets from a Markdown table sitting in conversation context to an actual `.xlsx` file you can download — there's no formal "table-to-Excel" tool in the agent's tool list, so the planner improvises with code. This is a meaningful capability difference vs. standard generative orchestration, where the planner is constrained to the tools you wired up explicitly. It's also a behavior to be aware of from a governance perspective: review the train of thought when authoring an ETC agent so you know when code execution is in play and decide whether that fits your scenario.

1. **Inspect a single step in the train of thought.** Scroll back up through the Test pane to any of the previous turns and find a **green check mark** next to a tool name in the agent's reasoning trace (e.g., `read_query` on the Texas-accounts turn). Select the green check mark to expand that step.

    ![Expanded train-of-thought step — read_query showing parameters and result](images/image-60.png)

    The expanded panel shows you exactly what the planner did at that step:

    - **parameters** — the input the planner sent to the tool. For `read_query` on the Texas accounts turn, you'll see the actual generated SQL: `SELECT name, address1_line1, address1_city, address1_stateorprovince, address1_postalcode, telephone1, emailaddress1 FROM account WHERE address1_stateorprovince = 'TX'`. That string is the planner's interpretation of *"all the accounts in Texas"* compiled down to a Dataverse MCP query.
    - **result** — the raw payload the tool returned, exactly as the planner saw it (JSON in this case). This is what the planner reasoned over to produce the next step in the loop.

    > [!NOTE]
    > **The Activity Tracker isn't entirely gone — it's just inline.** Earlier in this Use Case (right after enabling ETC) we noted that the formal **Activity Tracker** panel from Use Case #2 isn't available under Enhanced Task Completion. That's still true: there's no separate per-turn panel, and **Get rationale** in its UC #2 form isn't here. But the green check marks in the Test pane's reasoning trace give you the same kind of step-level visibility you used for debugging in UC #2 — the parameters going *in* to a tool and the data coming *out*. When an ETC agent does the wrong thing, expanding the relevant step is your debugger trace: read the parameters to see whether the planner translated user intent into the right tool inputs, and read the result to see whether the tool returned what the planner expected.

> [!TIP]
> **What you've now seen across these six prompts** — multi-tool reasoning in a single turn, robust pronoun / typo resolution, knowledge-driven content filtering, fluent pivots between unrelated data domains, in-conversation result reformatting, and tool-chaining to produce file deliverables. None of these are *new* capabilities introduced by Enhanced Task Completion — but the **Reasoning Loop** lets the planner combine them aggressively in a single turn, so the user gets a finished result instead of a series of intermediate confirmations. The trade-off is the loss of granular Activity Tracker / Get rationale visibility (covered in the previous subsection's IMPORTANT callout). Use Enhanced Task Completion for agents whose users want results, not transparency; keep standard orchestration when authors and users both need to inspect each step.

---

### Congratulations! You've completed Use Case #3!

---

### Test your understanding

**Key takeaways:**

* **Enhanced Task Completion replaces the orchestrator with a Reasoning Loop.** The planner iterates plan → act → observe within a single turn until the user's task is complete, instead of stopping at the next tool call.
* **The trade-off is visibility.** Activity Tracker and Get rationale (the inspectable surface from Use Case #2) are not available while ETC is on. The expanded Test pane surfaces intermediate steps inline, but the per-step deep dive is gone.
* **ETC is currently experimental and excludes Topics, Evaluation / Analytics, Child agents, and Activity history.** That list is expected to change — always read the live confirmation dialog when enabling the feature in your tenant.
* **The right pattern for tool credentials depends on whether the tool acts on the user's behalf.** Public / API-key / service-account tools (like MSN Weather) belong on **Maker-provided credentials**. Tools that act *as the user* (like Work IQ Mail) belong on **End-user credentials**.
* **Knowledge files must be Ready before testing.** Dataverse indexing is asynchronous — agent behavior with an *In progress* file is not representative.

**Lessons learned & troubleshooting tips:**

* If the agent gives inconsistent answers to policy-related prompts, confirm the knowledge file shows **Ready**, not *In progress*.
* If a tool prompts every end user for a connection when you didn't expect it to, check the **Credentials to use** dropdown — it likely needs **Maker-provided credentials**.
* If you wanted Activity Tracker / Get rationale back, toggle Enhanced Task Completion **Off**, **Save**, and reload the agent. The classic orchestrator's surfaces return.
* If you don't see the **Dataverse MCP Server** option, verify that both Dataverse MCP server checkboxes are still on in the Power Platform admin center (the *"Enable Dataverse Intelligence (Work IQ) and Dataverse MCP servers"* subsection earlier in this Use Case).

**Challenge: Apply this to your own use case**

* Identify a workflow in your organization that requires a user to gather information from multiple disconnected systems and then take an action (compose an email, draft a document, file a ticket). Sketch the tools that workflow would need and decide whether Enhanced Task Completion is the right fit — does the user want a finished outcome, or do they need to inspect each step?
* For the workflow you sketched, decide for each tool whether **Maker-provided credentials** or **End-user credentials** is the right pattern, and write down *why* in one sentence per tool.

---

## Summary of learnings

True learning comes from doing, questioning, and reflecting. Across this lab, you've seen Copilot Studio's orchestration engine from two distinct angles:

* **Standard generative orchestration** (Use Case #2) — a single-pass planner that picks one tool / child / knowledge source per turn based on the user's intent. Highly inspectable: every decision shows up in the activity tracker, and *Get rationale* lets you read the planner's reasoning back to you. Tunable through agent Instructions, child-agent and tool Names + Descriptions, and input-parameter Descriptions.
* **Enhanced Task Completion** (Use Case #3) — the new Reasoning Loop. Plans, acts, observes, iterates within a single turn until the task is complete. Better when users want finished outcomes; worse when authors and users need step-by-step transparency. Currently experimental and excludes Topics, Child agents, Evaluation / Analytics, and Activity history.

**The single most important shift between the two**: standard orchestration optimizes for *the next correct step*; Enhanced Task Completion optimizes for *the user's end goal*. Pick the orchestrator based on which behavior your users actually want.

---

### Conclusions and recommendations

**Orchestration golden rules:**

* **Names route, Descriptions explain, Instructions force.** Tune the cheapest signal first (a tool's name), then the description, then escalate to child or parent Instructions when name + description tuning isn't enough.
* **Input descriptions are the foundation of dynamic chaining.** Without clear input descriptions, the planner has to guess how to reshape one tool's output into another tool's input.
* **Use Get rationale as a debugger trace for your descriptions.** When the planner makes the wrong decision, the rationale points you at exactly which description needs sharper wording.
* **Match credential pattern to tool intent.** Anonymous / API-key / service-account tools belong on **Maker-provided credentials**. Tools that act as the user belong on **End-user credentials**.
* **Choose your orchestrator deliberately.** Standard orchestration where transparency matters; Enhanced Task Completion where finished outcomes matter.

By following these principles, you'll build agents that route to the right work the first time, and you'll know exactly which lever to pull when they don't.

---
