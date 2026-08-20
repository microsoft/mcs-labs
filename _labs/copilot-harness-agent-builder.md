---
layout: lab
module: copilot-harness
title: "Copilot Harness — Agent Builder"
order: 125
duration: 45
difficulty: 200
lab_type: local
section: core_learning_path
journeys: ["quick-start", "business-user"]
bootcamp_order: "3"
description: "Build declarative agents in the Copilot harness with Agent Builder — grounded in web content and in your own SharePoint, with code interpreter and image generation."

---

# Copilot Harness — Agent Builder

Build declarative agents in the Copilot harness with Agent Builder — grounding them in web content and in your own SharePoint, without leaving Microsoft 365.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Business User / Maker | 45 minutes | After completing this lab, participants will be able to build a declarative agent in Agent Builder grounded in public web sources, extend a second agent with SharePoint knowledge, code interpreter and image generation, and describe where the Copilot harness sits against the Standard and GitHub Copilot harnesses. |

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
  - [Use Case #1: Create a web-based learning assistant](#use-case-1-create-a-web-based-learning-assistant)
  - [Use Case #2: Build an advanced SharePoint-integrated sales assistant](#use-case-2-build-an-advanced-sharepoint-integrated-sales-assistant)

---

## Why This Matters

**This is the harness most of your users will actually meet first.**

Agent Builder lives inside Microsoft 365 Copilot. There is no environment to provision, no solution to manage, and no publishing pipeline — a business user describes what they want in natural language and has a working declarative agent minutes later.

That accessibility is the point and also the boundary. Knowing what the Copilot harness does well, and precisely where it runs out, is what stops a team building the wrong thing in the wrong place.

---

## Introduction

The Copilot harness covers declarative agents built and run inside Microsoft 365 Copilot: Agent Builder for makers working in natural language, pro-code declarative agents for developers, and declarative agents authored in Copilot Studio.

This lab takes the maker path. You build two agents — one grounded in public documentation, one grounded in your own SharePoint and extended with code interpreter and image generation — and in doing so cover the harness's full range from simplest to most capable.

---

## Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Declarative agent** | Defined by instructions and knowledge rather than authored logic — no topics, no flows. |
| **Agent Builder** | The natural-language authoring surface inside Microsoft 365 Copilot. |
| **Grounding** | Web sources or SharePoint content the agent answers from, with citations. |
| **Code interpreter** | Lets the agent compute over uploaded data instead of describing it. |
| **The harness boundary** | Declarative gets you a long way; process, state and system-of-record actions need the Standard or GitHub Copilot harness. |

---

## Documentation and Additional Training Links

* [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/microsoft-365-copilot/extensibility/)
* [Declarative agents overview](https://learn.microsoft.com/microsoft-365-copilot/extensibility/overview-declarative-agent)
* [Choose your harness before you build](https://learn.microsoft.com/microsoft-copilot-studio/harnesses-overview)

---

## Prerequisites

- A Microsoft 365 account with a Microsoft 365 Copilot licence
- Access to Agent Builder in Microsoft 365 Copilot
- Access to a SharePoint site with sample sales data (for Use Case #2)
- Basic understanding of Excel data structures (for Use Case #2)

---

## Summary of Targets

In this lab you'll build declarative agents in the Copilot harness from the simplest case to the most capable. By the end you will be able to:

- Create a web-grounded agent in Agent Builder using natural language alone
- Ground an agent in SharePoint content and return cited answers from it
- Use code interpreter and image generation to turn source data into analysis and visuals
- State where the Copilot harness stops and another harness has to take over

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Create a web-based learning assistant](#use-case-1-create-a-web-based-learning-assistant) | Build foundational skills by creating an instructional agent grounded in trusted documentation | 10 min |
| 2 | [Build an advanced SharePoint-integrated sales assistant](#use-case-2-build-an-advanced-sharepoint-integrated-sales-assistant) | Master advanced features including SharePoint integration, code interpretation, and image generation for business intelligence | 10 min |

---

## Instructions by Use Case

---


## Use Case #1: Create a web-based learning assistant

Build your first Copilot agent that helps users learn about Microsoft Copilot capabilities, grounded in official documentation.

| Use case                              | Value added                                                                                    | Estimated effort |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| Create a web-based learning assistant | Build foundational skills by creating an instructional agent grounded in trusted documentation | 10 minutes       |

**Summary of tasks**

In this section, you'll test basic Copilot functionality, then create a teacher-style agent that explains Copilot concepts using grounded knowledge sources. You'll learn to configure agent behavior, tone, and knowledge sources.

**Scenario:** Your organization is rolling out Microsoft Copilot and needs a learning resource. Build a teacher-style agent that can answer questions about Copilot capabilities, clarify key distinctions (like Microsoft 365 Copilot vs. Copilot Chat, or Declarative vs. Custom Engine agents), and guide users with accurate, contextual responses grounded in Microsoft documentation.

### Objective

Create, configure, and test a web-based Copilot agent that serves as a knowledgeable guide for learning about Microsoft Copilot.

---

### Step-by-step instructions

#### Navigate to Microsoft 365 Copilot

1. Navigate to [Microsoft 365 Copilot home page](https://m365.cloud.microsoft/chat/?auth=2&home=1)

<!--

> [!IMPORTANT]
> - If the Microsoft 365 Copilot URL is `https://copilot.cloud.microsoft/` or if the Copilot pane is on the right-hand side, this means you're on the **wrong** page.
>
>   ![alt text](images/wrong-copilot-page.png)
>
> - To fix this, **close** the tab, then **go back to the SharePoint** page. Select the app launcher, and choose **Microsoft 365 Copilot** from there.
>
>   ![alt text](images/app-launcher.png)
>
> - The Copilot pane should be on the left-hand side of the page, and the URL should be `https://m365.cloud.microsoft/`. If you see this, you're on the right page:
>
>   ![alt text](images/correct-copilot-page.png)
>
> - Make sure the **logged in user** is the fictitious one used in the lab. If you need your normal work user account, **select** the name and toggle to the fictitious user account.
>
>   ![alt text](images/logged-in-user.png)

 -->

> [!TIP]  
> Both Microsoft 365 Copilot and Copilot Chat are designed for internal, employee-facing (B2E) experiences.
>
> - Users who have **only Copilot Chat** will **not see any toggle** in the interface – this is expected.
> - Users who have **both** Microsoft 365 Copilot and Copilot Chat will see a **toggle** that lets them switch between the **Work** (Microsoft 365 Copilot) and **Web** (Copilot Chat) experiences.
>
> ![Microsoft 365 Copilot](images/m365-copilot.png)
>
> **Microsoft 365 Copilot** is a per-user license with premium features:
>
> - Advanced agents like the research and analysts Frontier ones, grounded on enterprise data and using the latest reasoning models
> - Knowledge sources (e.g., your enterprise data from Outlook, Teams, SharePoint, or Copilot connectors)
>
> **Copilot Chat** is the enterprise version of ChatGPT included with many Microsoft 365 licenses at no extra cost. It uses the same underlying models and can access web data to generate answers.
>
> - Copilot Chat can leverage premium capabilities like organization-tenant grounding for answers when tied to a pay-as-you-go Azure subscription.
>
> Two types of agents can appear in Microsoft 365 Copilot or Copilot Chat:
>
> - **Declarative agents**: These rely on Copilot’s built-in orchestration, search, and reasoning. They define their behavior through instructions, pre-defined prompts, knowledge sources, and actions. Ideal for scoped knowledge retrieval or task-specific use cases.
> - **Custom engine agents**: These do **not** use Copilot as their core engine. They include their own orchestration, knowledge, and skills, and may run on a different platform than Microsoft Copilot. Ideal for advanced or complex scenarios.

#### Test the Microsoft 365 Copilot experience

2. Select **New chat** in the left navigation pane if not already selected.

> [!IMPORTANT]
> **Optional:** If you have an account in the CopilotStudioTraining tenant with a Microsoft 365 Copilot license, try the following steps to experience the Work tab firsthand.

   - 2a. Make sure you are on the **Work** tab.

   - 2b. Type the following prompt and select **Send**:
   
     ```text
     Tell me about labs that my organization has available to learn about Copilot Studio
     ```
   
   - 2c. Observe the results:
      - The response is **grounded in SharePoint** content from your organization
      - Citations reference documents in the organization's SharePoint site.
      - This demonstrates how the **Work** tab provides an intelligent experience that automatically searches your organization's SharePoint data

#### Test the Copilot Chat experience

3. If you have Microsoft 365 Copilot license, make sure you are in the **Web** tab (if you don't see any tab for Work/Web, this means you only have access to Copilot Chat).

4. Test the basic experience by typing the following into the Message Copilot input area and then selecting send:

```
What are new features in the Microsoft Copilot Studio roadmap?
```

![Response from Copilot showing the roadmap](images/simple-copilot-search.png)

5. Select **Start a new chat** (top right icon) to reset. Notice how your history of converations is saved on the left side navigation pane.

#### Create your learning assistant agent

6. On the left side navigation pane, select **Agents** to open the **Agent Store**, then select **Create agent** (or the **New agent** card)


7. Notice that you can explore existing available templates. But for this lab, paste the following prompt into the **Message Agent Builder** input area on the initial screen, and then select Send. (The **Describe**, **Configure**, and **Preview** tabs appear once the conversation begins.)

```
I want to build a teacher-style agent that helps users learn about Copilot, including the differences between Microsoft 365 Copilot and Copilot Chat, Declarative Agents vs. Custom Engine Agents, and how to use Agent Builder in Microsoft 365. The agent should ask questions to validate and reinforce user understanding, encourage exploration, and act as a knowledgeable guide grounded in Microsoft documentation.
```

> [!TIP]  
> From here, you will find that the conversational creation experience might differ from the below step-by-step instructions, as it's using generative AI and it is by nature non-deterministic. The core concepts remain the same, but the UI may change slightly. Just adjust to the questions and options presented to you.

8. _If_ the proposed agent has a name other than Copilot Teacher input the following prompt to adjust the name and other details and press send:

```
The name of the agent should be Copilot Teacher. Your tone should be friendly, personal, and emphatic. You can make jokes, use subtle irony and emojis when appropriate.
```

9. _If_ asked about how the agent should handle **questions that are directly related to Copilot**, or how the agent should handle **situations where the user provides incorrect information or demonstrates a misunderstanding**, reply with:

```
It shouldn't answer questions that are not related to Microsoft 365 Copilot, Copilot Chat, or Copilot Studio. Always guide users towards the correct solution based on your knowledge.
```

10. Agent Builder will attempt to identify knowledge sources but may attempt to use too specific of a URL for Learn. Input the following prompt to provide specific URLs:

```
Use https://learn.microsoft.com/en-us/microsoft-365-copilot/ and https://learn.microsoft.com/en-us/microsoft-copilot-studio/ as knowledge sources
```

> [!TIP]  
> You can set URLs with up to 2 levels of depth for grounding. E.g., https://www.domain.com/level1/level2. Just like folders in a file system. That way, all pages under that URL will be used as grounding sources. E.g., https://www.domain.com/level1/level2/page1.html, https://www.domain.com/level1/level2/page2.html, etc.

#### Finalize configuration

11. Now let's head over to the **Configure** tab. Notice how all of your previous interactions have built the configuration of your agent, its name, description, instructions, knowledge sources and starter prompts. Feel free to tweak them!

12. In the **Knowledge** section, after adding knowledge sources, turn **Only use specified sources** **on** (it is not enabled automatically) so that the agent uses the configured websites when providing answers, and not its own large language model knowledge.

13. Fix any issue like max character limit for starter prompt titles.

14. You can test your agent in the test pane. When ready, select **Create** in the upper right corner to finish creating your agent.

![Agent Builder test pane](images/agent-builder.png)

#### Share and test your agent

15. You can use the generated link to share your agents with other users.

16. Select **Start chat** to open and test your agent.

17. Try your agent by selecting one of the prompts or by pasting the following prompt and selecting Send:

```
What are the differences between Microsoft 365 Copilot and Copilot Chat?
```

<!--

> [!TIP]
> If your training tenant is getting throttled because of lack of AI capacity (to prioritize production workloads), you may see a message like this: `Sorry, I wasn't able to respond to that. Is there something else I can help with?`. It's OK, **just test your agent while configuring it**, and not after you created it. You may try again later.
>
> ![alt text](images/copilot-error.png)

 -->

![Results from testing your agent](images/declarative-agent-test.png)

> [!IMPORTANT]  
> If you need to update a declarative agent, select `...` next to the agent name and select **Edit**, or go to **New agent** then select **Agent Builder** in the breadcrumbs and then Copilot Teacher from the list of your agents.

---

### Congratulations! You've created your first web-based Copilot agent!

---

### Test your understanding

**Key takeaways:**

- **Copilot Chat vs. Microsoft 365 Copilot** – One is grounded in your Microsoft 365 data (Work), the other in the web by default. Understanding the difference helps you choose the right foundation for your agents.
- **Agent types matter** – Declarative agents are simple and instruction-based. Custom Engine agents are complex and fully orchestrated. Most business use cases are perfectly served by declarative agents.
- **Documentation is your friend** – Grounding agents on trusted content ensures more reliable, relevant answers and minimizes hallucinations.
- **Conversational creation** – The agent creation process uses AI itself, which means the flow may vary but the concepts remain consistent.

**Lessons learned & troubleshooting tips:**

- Use clear, short prompt titles to encourage user engagement
- If your agent gives generic responses, double-check the grounding sources and whether the priority toggle is enabled
- Remember: you can always revise prompts, tone, or behavior by editing the agent settings later
- Test your agent while configuring to avoid throttling issues in busy training environments

**Challenge: Apply this to your own use case**

- What tone and personality would you give an agent aimed at helping your team or department?
- Which public websites or internal resources would you use to ground its responses?
- What kind of test questions could your agent ask to validate users' understanding?

---

---


## Use Case #2: Build an advanced SharePoint-integrated sales assistant

Take your skills to the next level by creating an agent that integrates SharePoint data and uses advanced AI capabilities like code interpretation and image generation.

| Use case                                                | Value added                                                                                                                    | Estimated effort |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Build an advanced SharePoint-integrated sales assistant | Master advanced features including SharePoint integration, code interpretation, and image generation for business intelligence | 10 minutes       |

**Summary of tasks**

In this section, you'll prepare SharePoint data sources, create a Sales Admin Assistant with advanced capabilities, and test code interpretation for data analysis and image generation for visual content.

**Scenario:** Your sales operations team needs an intelligent assistant that can analyze sales data from SharePoint Excel files, answer questions about sales policies, generate dynamic charts and visualizations, and create professional visual content for presentations—all through natural language requests.

### Objective

Build a sophisticated Sales Admin Assistant that integrates organizational data and advanced AI capabilities to transform sales operations.

---

### Step-by-step instructions

#### Access and prepare SharePoint documents

1. Navigate to your organization's SharePoint site
   - Go to the **Documents** tab
   - Open the **Sales** folder

> [!IMPORTANT]
> The URL of the SharePoint site is available in [**Lab Resources**](https://copilotstudiotraining.sharepoint.com/sites/Workshop/SitePages/Lab-Assets.aspx) (specific per training).

![SharePoint documents](images/sales-docs.png)

2. Locate the following sample files:

   - **Sales Excel file**: A spreadsheet containing sales data with columns for dates, product lines, revenue, and quarters
   - **Sales policy document**: A Word document containing sales policies, procedures, and guidelines

3. Open the **Excel file** and review the data structure:

   - Ensure it contains sales data across multiple quarters/years
   - Verify product line categorization
   - Note the column headers and data format
   - On the list of files in Documents, with the file Selected, Select Copy link in the toolboar, save the link in notepad for use later in the lab

4. Open the **Word policy document** and review:
   - Sales procedures and guidelines
   - Policy information that might inform sales decisions
   - Any specific requirements or compliance information
   - On the list of files in Documents, with the file Selected, Select Copy link in the toolboar, save the link in notepad for use later in the lab

#### Create the Sales Admin Assistant agent

5. Return to [Microsoft 365 Copilot Chat](https://m365.cloud.microsoft/chat/?auth=2&home=1).

6. On the left side pane, select **Agents** to open the **Agent Store**, then select **Create agent** (or the **New agent** card).

7. Paste the following prompt into the **Message Agent Builder** input area and select Send (the **Describe** tab appears after your first message):

```
You are a Sales Admin Assistant. Your job is to help sales managers track revenue and identify trends across product lines. You understand product hierarchies, time periods (e.g. quarters, fiscal years), and sales metrics. Users can ask questions like 'Graph the sales for the last 2 years with a breakdown per product line and quarter'. You always respond in a friendly and professional tone, aiming to be helpful and insightful.
```

8. **Confirm** the suggested agent name if prompted.

#### Configure knowledge sources

9. Select the **Configure** tab.

10. Scroll down to the **Knowledge** section:
    - Under **Knowledge**, Paste the Sales.xlsx URL that you copied earlier in the lab and then select Enter to add the file as knowledge to your agent
    - Repeat that for the Sales Policy Document.docx
    - You will see them being added as SharePoint documents in the knowledge section of the agent

![Files added to agent knowledge](images/add-files.png)


#### Enable advanced capabilities

11. Under **Capabilities**, check that the following are enabled, and if not, turn them on with the toggle:
    - **Create documents, charts, and code** (for data analysis and chart generation)
    - **Create images** (for creating visual content)

![SharePoint files configured as knowledge](images/configured-sources-and-settings.png)

> [!TIP]  
> You can explore additional **knowledge** capabilities:
>
> - All **websites** (or specific ones)
> - All **SharePoint** data (or specific files or sites)
> - Organization-wide knowledge sources enabled through **Copilot Connectors** (e.g., ServiceNow)
>
> If your account has a **Microsoft 365 Copilot** license, you can also access:
>
> - **My Teams chats and meetings**
> - **My emails**

#### Finalize and create

12. Review the **Configure** tab to refine:

    - Agent name and description
    - Instructions
    - Starter prompts

13. When satisfied with the configuration, select **Create** in the upper right corner.

#### Test policy knowledge

14. Select **Start chat** to open the agent and start testing.

15. First, test the agent's **knowledge** of your sales policy, copy/paste the following prompt in the Message Copilot area and select Send:

```
What are the key guidelines in our sales policy regarding customer discounts?
```

16. Verify the agent references your SharePoint policy document and provides accurate information.

![Results of your test prompt](images/sales-policy-question.png)

#### Test code interpreter with data analysis

17. **Start a new chat** and test the **code interpreter** capability with a data analysis request:

```
How are sales trending for home appliances?
```

18. After scrolling to the end of the details, you may be offered some starter prompts to get a visual chart, select one of the starter prompts or enter a prompt such as **Show a sales graph for Home Appliances**.

![Visual produced by agent](images/sales-data-analysis.png)

19. **Observe** how the agent:
    - Accesses your Excel data
    - Uses code interpreter to process the data
    - Generates dynamic charts and visualizations
    - Provides insights based on the analysis

#### Test image generation

20. Select **Start a new chat** icon in the upper right corner of the screen and test the **image generation** capability with a relevant request:

```
Design a professional badge for the first place winner of our sales contest. It should look modern and premium, with gold colors, the text '1st Place – Sales Contest', and a ribbon or trophy element.
```

![Badge created by agent](images/image-generator.png)


---

### Congratulations! You've created an advanced SharePoint-integrated Copilot agent!

---

### Test your understanding

**Key takeaways:**

- **SharePoint Integration** – Connecting agents to organizational documents transforms them from general assistants to business-specific tools that understand your data
- **Code Interpreter Power** – Enables dynamic data analysis and chart generation without requiring users to know programming or complex Excel formulas
- **Image Generation Utility** – Creates professional visual content on-demand, eliminating the need for design tools or skills for many common use cases
- **Knowledge Source Flexibility** – Agents can combine multiple knowledge types (documents, websites, SharePoint sites, Teams conversations) for comprehensive responses

**Lessons learned & troubleshooting tips:**

- Always review your source data before creating agents—understanding data structure helps you craft better instructions
- Test each capability separately to understand what works and identify any issues
- Use "Start a new chat" between tests to ensure clean context
- If files aren't visible in the selector, use the SharePoint URL method or download/upload approach

**Challenge: Apply this to your own use case**

- What SharePoint data sources in your organization would benefit from agent integration?
- What types of data analysis questions does your team frequently ask that could be automated?
- What visual content does your team create repeatedly that an agent could generate on-demand?
- How could you combine multiple capabilities (data analysis + image generation) to create comprehensive reports?

---

---

## Summary of learnings

**Two agents, no code, no environment.** Both were described in natural language and grounded in sources the maker already had access to.

**Grounding is the design decision.** The first agent is only as good as the documentation behind it; the second is only as good as the SharePoint content it can reach. Neither is improved by better prompting alone.

**Capability has a ceiling here.** Code interpreter and image generation are genuinely powerful, but nothing in this lab held state, ran a process, or wrote to a system of record. That boundary is the reason the other harnesses exist.

---

## Conclusions & Recommendations

**Start makers here.** The Copilot harness has the shortest path from idea to working agent, and most business-user scenarios never need more.

**Escalate deliberately.** When a scenario needs a defined process, variables, connectors or autonomous execution, that is a harness decision — not a reason to fight the tooling you are in.

**Watch the grounding, not the agent.** Most disappointing declarative agents are a content problem wearing an agent costume.
