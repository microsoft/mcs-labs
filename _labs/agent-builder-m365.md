---
layout: lab
module: agent-builder
title: "Build Progressive AI Assistants with Agent Builder in Microsoft 365"
order: 140
duration: 30
difficulty: 100
lab_type: local
section: core_learning_path
journeys: ["quick-start", "business-user"]
bootcamp_order: "1"
description: "Master agent creation from basic web-grounded assistants to advanced SharePoint-integrated agents with code interpreter and image generation capabilities."

---

# Build Progressive AI Assistants with Agent Builder in Microsoft 365

Master agent creation from basic web-grounded assistants to advanced SharePoint-integrated agents with code interpreter and image generation capabilities.

---

## Lab Details

| Level   | Persona                       | Duration   | Purpose                                                                                                                                                                                                                                                                                              |
| ------- | ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 100-200 | Maker (Basic to Intermediate) | 30 minutes | After completing this lab, attendees will be able to create progressively sophisticated Copilot agents, starting with simple web-based knowledge sources, advancing to SharePoint integration, and mastering advanced AI capabilities like code interpretation, data analysis, and image generation. |

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
  - [Use Case #3: Deep analysis with the Researcher agent](#use-case-3-deep-analysis-with-the-researcher-agent)
  - [Use Case #4: Financial modeling with the Analyst agent](#use-case-4-financial-modeling-with-the-analyst-agent)
  - [Use Case #5: Draft an executive email with the Cowork agent from a PDF report](#use-case-5-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report)
- [Summary of Learnings](#summary-of-learnings)
- [Conclusions & Recommendations](#conclusions--recommendations)

---

## Why This Matters

**For makers and citizen developers:** You don't need to be a programmer to create powerful AI assistants that can transform how your team works.

Think of building agents like teaching a new team member:

- **Without structured training**: They fumble through tasks, give inconsistent answers, and waste everyone's time
- **With progressive skill development**: They become increasingly valuable, handling simple queries at first, then complex analysis and creative tasks

**Common challenges solved by this lab:**

- "Our team keeps asking the same questions about our products and policies"
- "We need to analyze sales data quickly, but most people don't know Excel formulas"
- "We want AI assistance grounded in our actual business documents, not generic responses"
- "We need professional visuals for presentations but don't have design resources"

**This 30-minute investment will teach you skills you'll use repeatedly** to create agents for any department or use case.

---

## Introduction

This lab takes you on a journey from your first simple agent to a sophisticated business assistant. You'll start by testing Microsoft 365 Copilot's basic capabilities, then build a web-based learning assistant grounded in Microsoft documentation. Finally, you'll create an advanced Sales Admin Assistant that integrates SharePoint data, performs code-based analysis, and generates professional visuals.

**Real-world example:** A sales operations team struggled with repetitive questions about policies and data analysis requests. After completing this lab, they created two agents: one for onboarding that answers policy questions, and another that analyzes sales trends from their SharePoint Excel files and generates presentation-ready charts. What used to take hours of manual work now happens in seconds with natural language requests.

The progressive approach ensures you understand core concepts before adding complexity, building confidence and practical skills at each step.

---

## Core Concepts Overview

| Concept                                    | Why it matters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent**                                  | An Agent is a customized digital assistant that can answer questions, retrieve information, and guide users through tasks based on configured instructions, prompts, and knowledge sources. Understanding agents is fundamental to automating knowledge work.                                                                                                                                                                                                                                                                                                                      |
| **Microsoft 365 Copilot vs. Copilot Chat** | Microsoft 365 Copilot is grounded in your organization's data (emails, meetings, documents) while Copilot Chat comes for free with select [Microsoft 365, Office 365, and Microsoft Teams plans](https://learn.microsoft.com/en-us/copilot/manage#microsoft-365--chat-eligibility) and uses public web data by default. Knowing which to use determines your agent's capabilities and data access. Copilot Chat can be extended with some premium capabilities with a pay-as-you-go subscription and/or with Copilot Credits (pre-purchased capacity). |
| **Declarative Agent**                      | A simple type of Copilot agent built through instructions, prompts, and knowledge sources. Perfect for most business use cases where you need to scope behavior and ground responses in specific data.                                                                                                                                                                                                                                                                                                                                                                 |
| **Grounding**                              | Anchoring agent responses to specific data sources (websites, SharePoint, files) to ensure accuracy and minimize hallucinations. This is what makes your agent trustworthy and business-ready.                                                                                                                                                                                                                                                                                                                                                                         |
| **Code Interpreter**                       | An advanced feature that writes and executes code in real-time to analyze data, generate charts, and perform calculations. Transforms your agent from information retrieval to data analysis powerhouse.                                                                                                                                                                                                                                                                                                                                                               |
| **Image Generator**                        | AI capability that creates original images from text descriptions, useful for creating presentation visuals, badges, diagrams, and marketing materials without design skills.                                                                                                                                                                                                                                                                                                                                                                                          |
| **Knowledge Sources**                      | The data your agent uses to answer questions—can include websites, SharePoint sites, Teams conversations, or organization-wide connectors. The right knowledge sources make or break your agent's usefulness.                                                                                                                                                                                                                                                                                                                                                          |

---

## Documentation and Additional Training Links

- [Overview of Microsoft 365 Copilot Chat](https://learn.microsoft.com/en-us/copilot/overview)
- [What is Microsoft 365 Copilot?](https://learn.microsoft.com/en-us/microsoft-365-copilot)
- [Declarative Agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent)
- [Use Agent Builder in Microsoft 365 to Build Agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder-build-agents)
- [Microsoft Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)

---

## Prerequisites

- Access to Microsoft 365 Copilot or Copilot Chat
- Ability to create and configure Copilot agents
- Access to a SharePoint site with sample sales data (for Use Case #2)
- Basic understanding of Excel data structures (for Use Case #2)
- Access to Microsoft 365 Copilot with the Researcher, Analyst, and Cowork (Frontier) frontier agents (for Use Cases #3, #4, and #5)
- Download the sample report PDF (for Use Cases #3, #4, and #5): [Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)

---

## Summary of Targets

In this lab, you'll progress from basic agent creation to advanced AI capabilities. By the end of the lab, you will:

- **Understand** the differences between Microsoft 365 Copilot and Copilot Chat and when to use each
- **Create** a web-based learning assistant grounded in official Microsoft documentation
- **Configure** agent behavior, tone, and knowledge sources for specific use cases
- **Build** an advanced SharePoint-integrated agent with code interpreter and image generation
- **Analyze** sales data and generate professional charts through natural language requests
- **Research** complex documents using the Researcher agent for deep multi-section synthesis (and submit-and-come-back-later workflows)
- **Model** financial scenarios using the Analyst agent to compute NPV, IRR, and investment prioritization from report data
- **Draft** an executive email with the Cowork agent that reads a PDF report and creates the email directly in Outlook
- **Apply** best practices for agent design, grounding strategies, and knowledge source selection

---

## Use Cases Covered

| Step | Use Case                                                                                                                        | Value added                                                                                                                    | Effort |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1    | [Create a web-based learning assistant](#use-case-1-create-a-web-based-learning-assistant)                                     | Build foundational skills by creating an instructional agent grounded in trusted documentation                                 | 10 min |
| 2    | [Build an advanced SharePoint-integrated sales assistant](#use-case-2-build-an-advanced-sharepoint-integrated-sales-assistant) | Master advanced features including SharePoint integration, code interpretation, and image generation for business intelligence | 10 min |
| 3    | [Deep analysis with the Researcher agent](#use-case-3-deep-analysis-with-the-researcher-agent)                                | Use the Researcher frontier agent to synthesize insights across a complex multi-section business report (submit-and-come-back) | 5 min to send · 10–25 min for results |
| 4    | [Financial modeling with the Analyst agent](#use-case-4-financial-modeling-with-the-analyst-agent)                             | Use the Analyst frontier agent to perform NPV/IRR financial modeling and investment prioritization from document data          | 5 min  |
| 5    | [Draft an executive email with the Cowork agent from a PDF report](#use-case-5-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report) | Use the Cowork frontier agent to read a PDF and draft a real Outlook email summarizing key issues for a specific recipient    | 5 min  |

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

5. Select **New chat** (top right icon) to reset. Notice how your history of conversations is saved on the left side navigation pane.

#### Create your learning assistant agent

6. On the left side navigation pane, select **Agents** to open the **Agent Store**, then select **Create agent** (or the **New agent** card)


7. Notice that you can explore existing available templates. For this lab, paste the following into the **Describe the agent you want to create** input area at the top of the form (the describe textbox is the primary input — there is no separate tab to select), and then select Send.

    ```
    I want to build a teacher-style agent that helps users learn about Copilot, including the differences between Microsoft 365 Copilot and Copilot Chat, Declarative Agents vs. Custom Engine Agents, and how to use Agent Builder in Microsoft 365. The agent should ask questions to validate and reinforce user understanding, encourage exploration, and act as a knowledgeable guide grounded in Microsoft documentation.
    ```

    > [!TIP]  
    > From here, you will find that the conversational creation experience might differ from the below step-by-step instructions, as it's using generative AI and it is by nature non-deterministic. The core concepts remain the same, but the UI may change slightly. Just adjust to the questions and options presented to you.

8. Input the following prompt to set the agent's name and tone, then press send. (This will rename the agent if Agent Builder proposed a different name, and apply the desired tone in either case.)

    ```
    The name of the agent should be Copilot Teacher. Your tone should be friendly, personal, and emphatic. You can make jokes, use subtle irony and emojis when appropriate.
    ```

9. _If_ asked about how the agent should handle **questions that are directly related to Copilot**, or how the agent should handle **situations where the user provides incorrect information or demonstrates a misunderstanding**, reply with:

    ```
    It shouldn't answer questions that are not related to Microsoft 365 Copilot, Copilot Chat, or Copilot Studio. Always guide users towards the correct solution based on your knowledge.
    ```

10. Agent Builder will attempt to identify knowledge sources but may attempt to use too specific of a URL for Learn. Send the following two prompts in sequence — entering both URLs in a single prompt has been observed to register only one of them, so split them up:

    First prompt:

    ```
    Use https://learn.microsoft.com/en-us/microsoft-365-copilot/ as a knowledge source
    ```

    Second prompt (after the first has been processed):

    ```
    Also add https://learn.microsoft.com/en-us/microsoft-copilot-studio/ as a knowledge source
    ```

    > [!TIP]
    > After both prompts, review the **Configure** pane on the right and confirm both URLs appear under the agent's knowledge sources before continuing.

> [!TIP]  
> You can set URLs with up to 2 levels of depth for grounding. E.g., https://www.domain.com/level1/level2. Just like folders in a file system. That way, all pages under that URL will be used as grounding sources. E.g., https://www.domain.com/level1/level2/page1.html, https://www.domain.com/level1/level2/page2.html, etc.

#### Finalize configuration

11. Now review the **Configure** tab on the right side of Agent Builder. Notice how all of your previous interactions have built the configuration of your agent, its name, description, instructions, knowledge sources and starter prompts — populated incrementally during the conversational creation. Feel free to tweak them!

12. In the **Knowledge** section, after adding knowledge sources, turn **Only use specified sources** **on** (it is not enabled automatically) so that the agent uses the configured websites when providing answers, and not its own large language model knowledge.

13. Fix any issue like max character limit for starter prompt titles.

14. You can test your agent in the test pane. When ready, select **Create** in the upper right corner to finish creating your agent.

![Agent Builder test pane](images/agent-builder.png)

#### Share and test your agent

15. You can use the generated link to share your agents with other users.

16. Select **Go to agent**.

17. Try your agent by selecting one of the prompts or by pasting the following prompt and selecting Send:

```
What are the differences between Microsoft 365 Copilot and Copilot Chat?
```

> [!TIP]
> If your training tenant is getting throttled because of lack of AI capacity (to prioritize production workloads), you may see a message like this: `Sorry, I wasn't able to respond to that. Is there something else I can help with?`. It's OK, **just test your agent while configuring it**, and not after you created it. You may try again later.
>
> ![alt text](images/copilot-error.png)

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

1. Navigate to the workshop SharePoint site at [https://copilotstudiotraining.sharepoint.com/](https://copilotstudiotraining.sharepoint.com/)
   - Click **Documents** in the left navigation
   - Open the **Sales** folder

    > [!IMPORTANT]
    > The Sales folder lives in the tenant-root site's Shared Documents, not under the `/sites/Workshop` site. The URL of the SharePoint site is also available in [**Lab Resources**](https://copilotstudiotraining.sharepoint.com/sites/Workshop/SitePages/Lab-Assets.aspx) (specific per training).

    ![SharePoint documents](images/sales-docs.png)

2. Locate the following sample files:

   - **Sales Excel file**: A spreadsheet containing sales data with columns for dates, product lines, revenue, and quarters
   - **Sales policy document**: A Word document containing sales policies, procedures, and guidelines

3. Open the **Excel file** and review the data structure:

   - Ensure it contains sales data across multiple quarters/years
   - Verify product line categorization
   - Note the column headers and data format
   - On the list of files in Documents, with the file Selected, Select Copy link in the toolbar, save the link in notepad for use later in the lab

4. Open the **Word policy document** and review:
   - Sales procedures and guidelines
   - Policy information that might inform sales decisions
   - Any specific requirements or compliance information
   - On the list of files in Documents, with the file Selected, Select Copy link in the toolbar, save the link in notepad for use later in the lab

#### Create the Sales Admin Assistant agent

5. Return to [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?auth=2&home=1).

6. On the left side pane, select **Agents** to open the **Agent Store**, then select **Create agent** (or the **New agent** card).

7. In the **Describe the agent you want to create** textbox at the top of the new agent page, paste the following prompt and press Send (or Enter). The describe textbox is the primary input — there is no separate tab to select.

    ```
    You are a Sales Admin Assistant. Your job is to help sales managers track revenue and identify trends across product lines. You understand product hierarchies, time periods (e.g. quarters, fiscal years), and sales metrics. Users can ask questions like 'Graph the sales for the last 2 years with a breakdown per product line and quarter'. You always respond in a friendly and professional tone, aiming to be helpful and insightful.
    ```

8. **Confirm** the suggested agent name if prompted.

#### Configure knowledge sources

9. The agent's **Configure** panel appears automatically on the right side of the page (or as a `Chat | Configure` tab pair in the chat pane depending on viewport).

10. Scroll the Configure panel to the **Knowledge** section:
    - Under **Knowledge**, Paste the Sales.xlsx URL that you copied earlier in the lab and then select Enter to add the file as knowledge to your agent
    - Repeat that for the Sales Policy Document.docx
    - You will see them being added as SharePoint documents in the knowledge section of the agent

![Files added to agent knowledge](images/add-files.png)


#### Enable advanced capabilities

11. Under **Capabilities**, verify these toggles are enabled (they are usually pre-enabled — enable them if not):
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

12. Review the **Configure** panel to refine:

    - Agent name and description
    - Instructions
    - Starter prompts

13. When satisfied with the configuration, select **Create** in the upper right corner.

#### Test policy knowledge

14. Select **Go to agent** to start testing, then click the **Try It** tab to open the test chat for your agent.

15. First, test the agent's **knowledge** of your sales policy. Copy/paste the following prompt into the **Type your message** input area in the Try It panel and select Send:

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

20. Select the **New chat** button at the top of the Try It panel to reset, then test the **image generation** capability with a relevant request:

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

## Use Case #3: Deep analysis with the Researcher agent

Leverage the Researcher frontier agent in Microsoft 365 Copilot to perform deep, multi-section analysis of a complex business document — synthesizing insights that would take a human analyst hours to compile manually.

| Use case                                    | Value added                                                                                         | Estimated effort                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Deep analysis with the Researcher agent     | Use the Researcher frontier agent to synthesize strategic insights across a multi-section report     | 5 min to send · 10–25 min for results     |

**Summary of tasks**

In this section, you'll upload a sample hotel performance report to the Researcher agent and use two carefully crafted prompts that require the agent to reason across multiple sections, tables, and data points simultaneously. You'll observe how Researcher synthesizes information that spans financials, operations, guest satisfaction, and competitive benchmarking into cohesive executive-level analysis.

**Scenario:** You're a regional vice president reviewing the annual performance report for the Contoso Grand Hotel & Resort. Rather than reading all 18 sections yourself, you want to use the Researcher agent to quickly identify the most urgent operational issues and verify that the report's recommendations fully cover all identified problems.

### Objective

Use the Researcher agent to perform two deep-analysis tasks on a complex PDF document, demonstrating its ability to reason across multiple sections and synthesize findings.

> [!IMPORTANT]
> **Researcher is a deep-reasoning frontier agent** — on a ~20-page PDF like this one, a single prompt typically takes **10–25 minutes** to produce a complete response, and may sometimes enter a long "thinking" loop before converging. **You will be notified in the chat list when Researcher finishes — you do not need to sit and wait.** Send each prompt, then move on to the next use case (Cowork) and come back when Researcher signals it's done. If a response appears stuck after ~25 minutes, press **Stop** and use the partial result.

---

### Step-by-step instructions

#### Download the sample report

1. If you haven't already, download the sample report PDF that you'll use for this exercise and the next two:

   **[Download: Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)**

> [!IMPORTANT]
> Save this file to a location you can easily find (e.g., your Desktop or Downloads folder). You will need to upload it for Use Cases #3, #4, and #5. This is a fictional ~20-page report containing tables, charts, financial data, and operational metrics across 18 sections.

#### Open the Researcher agent

1. Navigate to [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?auth=2&home=1).

1. In the **left-side** sidebar agent list, look for the **Researcher** agent. You can also open it by typing `@Researcher` in the chat input area.

    > [!TIP]
    > The Researcher agent is one of Microsoft's **frontier agents** — purpose-built AI agents that use advanced reasoning models. Researcher excels at deep document analysis, cross-referencing multiple sections, and synthesizing complex information. It's available to users with a Microsoft 365 Copilot license.

1. (Recommended) In the Researcher chat header (top right), click the **mode picker pill** (defaults to **Auto**) and switch to **Critique** (`GPT responses, refined by Claude (Frontier)`). Critique mode produces more reliable convergence on long PDFs than Auto in the current product. The other options (`Model Council`, `Claude`) are also valid but tend to be slower.

1. Upload the [**Contoso_Grand_Hotel_Performance_Report.pdf**](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) by clicking the **+** (Add and manage sources) button next to the message input, choosing **Upload images and files**, and selecting the file from your local machine. Wait for the upload confirmation before continuing.

#### Prompt 1: Executive briefing with root-cause analysis

1. Once the file is uploaded, copy and paste the following prompt and select **Send**:

    ```text
    Create an executive briefing for the GM that summarizes the five most urgent operational issues, their root causes, financial impact, and recommended fixes — all sourced from this report.
    ```

    > [!NOTE]
    > Researcher will likely ask a clarifying follow-up about audience/tone, urgency definition, and report length. **Click one of the suggestion chips** (or type `go ahead` / `proceed`) and press **Send** — clicking a chip only fills the message box; it does **not** auto-submit. Once you reply, Researcher begins reasoning.
    >
    > **Don't wait for Researcher to finish before moving on.** The chat list (left rail) will show the conversation update when the response is complete. Open the next use case (Cowork) now and come back to Researcher later.

1. **Move on to the next use case now.** When the Researcher reply appears in the chat list (left rail), come back and **observe** how the agent:
   - Identifies issues across multiple sections (housekeeping, WiFi, HVAC, F&B margins, elevator maintenance)
   - Traces each issue back to its root cause using data from different parts of the report
   - Quantifies the financial impact by pulling revenue, cost, and complaint data from various tables
   - Maps each issue to specific recommendations from Section 16
   - Produces a structured, executive-ready summary

1. To export the response, click **Edit in Pages** at the bottom of the message. The response opens in the Pages side-panel editor, where the **Create** menu (top toolbar) offers **Document** (Word) and **PDF** exports. (Earlier versions of Researcher offered a "Convert to" menu with Infographic / HTML / YAML / C# options — those have been retired; Document/PDF via Pages is the current export path.)

> [!NOTE]
> This prompt is powerful because it requires **cross-section synthesis** — the Researcher must connect data from the occupancy analysis (Section 3), housekeeping operations (Section 6), customer satisfaction scores (Section 8), online reviews (Section 9), maintenance logs (Section 12), and the recommendations (Section 16). No single section of the report contains the full answer.

> [!TIP]
> This is the kind of analysis that demonstrates the true power of the Researcher agent. A human reviewer might miss connections between a declining metric buried in Appendix B and a recommendation in Section 16. Researcher performs an **exhaustive cross-reference** across the entire document. Try asking follow-up questions like "What's the strongest counterargument to your top recommendation?" to see how Researcher handles critical thinking.

---

### Congratulations! You've used the Researcher agent for deep document analysis!

---

### Test your understanding

**Key takeaways:**

- **Researcher excels at synthesis** — It connects information across multiple tables, sections, and data points that would be tedious to cross-reference manually
- **Prompt design matters** — Asking for "root causes" and "gap analysis" forces Researcher to reason deeply rather than simply summarize
- **Follow-up prompts leverage context** — The second prompt builds on the first, allowing Researcher to refine and extend its analysis
- **Frontier agents are purpose-built** — Researcher uses advanced reasoning models optimized for deep analysis, unlike general chat which is optimized for conversational responses
- **Mode matters for long PDFs** — Critique mode tends to converge more reliably than Auto on large documents. And because Researcher is *slow* by design, treat its prompts as fire-and-forget: submit, switch tasks, come back when the chat list signals completion.

**Challenge: Apply this to your own use case**

- What complex reports or documents does your team review regularly that could benefit from Researcher analysis?
- What cross-functional insights might Researcher uncover that individual department reviews miss?
- How could you use Researcher to prepare for board meetings or executive reviews?

---

## Use Case #4: Financial modeling with the Analyst agent

While Researcher (Use Case #3) is still reasoning in the background, switch to the **Analyst** frontier agent to extract data from the same hotel performance report and perform rigorous financial analysis — computing NPV, IRR, and investment prioritization that goes beyond what the original report provides.

| Use case                                       | Value added                                                                                              | Estimated effort |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| Financial modeling with the Analyst agent      | Use the Analyst frontier agent to compute NPV, IRR, and rank capital investments by financial merit      | 8–10 minutes     |

**Summary of tasks**

In this section, you'll use the Analyst agent to extract the investment and return data from the report's ten recommendations, then perform a discounted cash flow analysis that the original report doesn't include. This demonstrates how the Analyst agent can *elevate* analysis beyond what a source document provides.

**Scenario:** The Contoso Grand Hotel's report recommends $2.975 million in capital investments across ten initiatives, but only provides simple payback periods. As the CFO, you need proper NPV and IRR analysis before approving the capital program. You'll use the Analyst agent to build this analysis from the report data.

### Objective

Use the Analyst agent to perform a detailed ROI analysis with NPV, IRR, and discounted payback calculations for each of the report's ten recommendations.

---

### Step-by-step instructions

#### Open the Analyst agent

1. Navigate to [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?auth=2&home=1).

2. Select the **Analyst** agent. You can find it by:
   - Selecting the agent picker and choosing **Analyst**
   - Or typing `@Analyst` in the chat input area

    > [!TIP]
    > The Analyst agent is another **frontier agent** in Microsoft 365 Copilot. While Researcher excels at reasoning and synthesis, Analyst is purpose-built for **data-heavy work** — extracting tables from documents, performing calculations, building models, generating visualizations, and producing structured outputs like Excel files. Think of Researcher as your strategic advisor and Analyst as your financial modeler.

3. Upload the [**Contoso_Grand_Hotel_Performance_Report.pdf**](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) by selecting the **+** (Add and manage sources) button next to the message input, choosing **Upload images and files**, and selecting the same PDF you downloaded earlier.

> [!NOTE]
> You're using the [same PDF](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) from Use Case #3, but with a completely different agent. This demonstrates how different frontier agents can extract different types of value from the same source document.

#### Run the financial analysis prompt

4. Copy and paste the following prompt and select **Send**:

    ```text
    Using the recommendation data from Section 16 of this hotel performance report, build a detailed ROI analysis for each of the 10 recommendations (R1 through R10). For each recommendation, extract the investment cost and estimated annual ROI from the report, then calculate:

    1. Net Present Value (NPV) at an 8% discount rate over a 5-year horizon
    2. Internal Rate of Return (IRR)
    3. Payback period (both simple and discounted)
    4. 5-year cumulative net benefit (total returns minus investment)

    Assume that annual ROI figures begin in Year 1 and remain constant over the 5-year period. For the elevator modernization (R5), assume the $1.2M investment is split evenly across Year 0 and Year 1, with returns beginning in Year 2. For ongoing annual programs (R7, R10), treat the annual investment as a recurring cost each year.

    Present the results in a ranked table sorted by NPV (highest to lowest). Include a column indicating whether each recommendation creates or destroys value at the 8% hurdle rate. Then provide a summary recommendation on which investments should be approved, which are marginal, and which should be deferred — based purely on the financial analysis.
    ```

5. **Observe** how the Analyst agent:
   - Extracts investment costs and annual returns from Section 16's ten recommendations
   - Builds a discounted cash flow model for each recommendation
   - Computes NPV at the specified 8% discount rate
   - Calculates IRR for each investment
   - Determines both simple and discounted payback periods
   - Ranks all ten recommendations by financial merit
   - Identifies which investments create or destroy value at the hurdle rate
   - Provides a clear approve/defer recommendation

   ![Analyst ranked NPV table](images/analyst-npv-ranked-table.png)

> [!IMPORTANT]
> The report only includes **simple payback periods** (which ignore the time value of money). The Analyst agent produces **NPV and IRR** — the gold-standard financial metrics that CFOs actually use to evaluate capital projects. This is a powerful example of how the Analyst agent can *elevate* analysis beyond the source material.

#### Explore follow-up analysis (optional)

6. If time permits, try one or both of these follow-up prompts to explore Analyst's capabilities further:

```text
Now create a chart showing NPV vs. Investment Cost for all 10 recommendations, with bubble size representing IRR.
```

![NPV vs Investment Cost bubble chart](images/analyst-bubble-chart.png)

```text
Which combination of recommendations gives the highest total NPV while staying under a $1.5M total budget constraint?
```

> [!TIP]
> The second follow-up prompt is a **knapsack optimization problem** — the Analyst agent must find the combination of investments that maximizes value within a budget constraint. This is a sophisticated analytical task that would typically require a spreadsheet model to solve manually. It makes for a compelling demonstration of the Analyst agent's capabilities.

---

### Congratulations! You've used the Analyst agent for financial modeling!

---

### Test your understanding

**Key takeaways:**

- **Analyst extracts and computes** — It pulls structured data from documents, performs calculations, and generates outputs that go beyond the source material
- **NPV/IRR vs. simple payback** — Simple payback ignores the time value of money. Analyst can produce the rigorous financial analysis that decision-makers actually need
- **Researcher vs. Analyst** — Researcher reasons and synthesizes (strategic advisor); Analyst computes and models (financial modeler). They complement each other
- **Follow-up prompts unlock depth** — Budget-constrained optimization and visualization requests demonstrate that Analyst can handle multi-step analytical workflows

**Challenge: Apply this to your own use case**

- What capital investment decisions does your organization face that could benefit from automated NPV/IRR analysis?
- What reports or proposals do you review that only include simple payback and could be elevated with proper DCF analysis?
- How could you combine Cowork (for agentic drafting — Use Case #5) and Analyst (for financial modeling) to prepare a comprehensive investment recommendation — Analyst builds the NPV/IRR analysis, then Cowork drafts the executive email or memo presenting it?

---

## Use Case #5: Draft an executive email with the Cowork agent from a PDF report

If Researcher (Use Case #3) is still reasoning in the background, that's fine — you can run Cowork in parallel. Switch to the **Cowork (Frontier)** agent to do something purely conversational agents cannot: agentically read a complex business document, look up the right recipient in your organization, and draft a complete email in Outlook — ready for you to review and send.

| Use case                                       | Value added                                                                                                       | Estimated effort |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| Draft an executive email with Cowork           | Cowork takes agentic action: reads the PDF, resolves the recipient, and drafts a real Outlook email on your behalf | 5 minutes        |

**Summary of tasks**

In this section, you'll upload the same Contoso PDF to the Cowork agent, ask it to draft an email to a specific colleague summarizing the most urgent operational issues, and then verify the draft was created in Outlook.

**Scenario:** You're an operations lead at the Contoso Grand Hotel and need to brief your colleague Dewain on the most pressing issues from the annual performance report. Rather than writing the email yourself, you'll let Cowork extract the key facts from the report and draft the email — addressed to Dewain, ready for you to review, edit, and send.

### Objective

Use the Cowork agent to read the [same PDF report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) you uploaded to Researcher, identify five operational issues with root causes and recommendations, and have Cowork draft a real Outlook email to a named recipient (Dewain Robinson).

---

### Step-by-step instructions

#### Open the Cowork agent

1. From the same Microsoft 365 Copilot page (`https://m365.cloud.microsoft/chat/?auth=2&home=1`), locate **Cowork (Frontier)** in the left-side sidebar agent list and click it.

   ![Cowork in the sidebar agent list](images/cowork-sidebar.png)

   > [!TIP]
   > Cowork is a **frontier agent** in Microsoft 365 Copilot, purpose-built for *agentic action-taking*: it can read documents, look up people in your tenant, and create real Outlook drafts / Word docs / Teams messages on your behalf. While Researcher excels at deep analysis and Analyst at data and computation, Cowork excels at completing multi-step tasks that span several Microsoft 365 surfaces.

1. On the Cowork landing page, note the heading **"What should we tackle next?"** and four workflow suggestion chips (Organize my inbox, Arrange my week, Prep for a meeting, Research a company).

   ![Cowork landing page](images/cowork-landing.png)

#### Upload the report and ask Cowork to draft an email

1. Click **Add attachments** (the paperclip icon next to the message input), then choose **Upload images and files (PDF, Word, Excel, images)**. Select the [`Contoso_Grand_Hotel_Performance_Report.pdf`](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) file you downloaded for Use Case #3.

1. Wait for the upload to complete — the PDF will appear as a chip above the message input.

1. Paste the following prompt into the message input and press **Send**:

    ```text
    Create a draft email in my Outlook mailbox addressed to Dewain Robinson summarizing the five most urgent operational issues from the attached hotel performance report. Use the Outlook draft tool — do not just write the email text in chat.

    For each issue, include in one short bullet: the symptom, the root cause, the estimated financial impact, and the matching recommendation (Section 16 R-number).

    Address the email "Hi Dewain," and sign it from "The Operations Team". Keep the total email under 400 words. Use the PDF as the only source.
    ```

    > [!TIP]
    > Cowork executes this as a **multi-step task**: (1) reads the attached PDF, (2) looks up "Dewain Robinson" in the M365 People graph, (3) drafts a new email in your Outlook mailbox, (4) reports back in chat when done. Unlike Researcher, Cowork rarely asks clarifying questions — when the prompt is clear, it just acts, and typically completes in ~2–3 minutes.

1. **Observe** how the Cowork agent:

   - Streams execution updates (e.g., "Reading PDF", "Searching for Dewain Robinson", "Drafting email in Outlook")
   - Confirms the recipient resolved correctly (e.g., "Drafted email to Dewain Robinson")
   - Reports back inline in chat with a summary of the email it created and ends with **"Open it in Outlook to review, edit, or send"**

   ![Cowork drafting the email](images/cowork-email-confirmation.png)

#### Verify the draft in Outlook

1. **Open the app launcher** (the 3×3 dot "waffle" icon at the **top-left** of the page) and select **Outlook**. Outlook opens in a **new browser tab**.

   ![M365 app launcher with Outlook highlighted](images/m365-app-launcher-open.png)

   > [!IMPORTANT]
   > On your first Outlook visit, a "Your privacy matters" prompt may appear — click **Continue** to dismiss it. After that, the Outlook UI is ready for use.

1. In the Outlook left rail, click the **Drafts** folder. Find the email Cowork just created at the top of the list — the subject will mention the Contoso Grand Hotel performance report and the urgent operational issues (Cowork phrases the subject conversationally, so the exact wording varies). Click it to open.

   ![Cowork's draft email open in Outlook](images/cowork-outlook-draft.png)

1. **Review** the draft:

   - **Recipient:** Dewain Robinson (resolved as a contact pill — hover or click the pill to see the SMTP address)
   - **Subject:** mentions the Contoso Grand Hotel report and the urgent operational issues (Cowork-generated wording — exact text varies)
   - **Body:** five bullets, each covering symptom + root cause + financial impact + recommendation R-number
   - **Sign-off:** "Best regards, The Operations Team"
   - Total: approximately 300–400 words

1. From here you can **edit, send, or delete** the draft as you would any other Outlook email. For this lab, leave it as a draft (or delete it) — no need to actually send.

   > [!TIP]
   > Cowork appends a `Sent by Copilot Cowork` footer to drafts it creates. You can remove that line before sending if you prefer a clean signature.

> [!TIP]
> By now, head back to Use Case #3 and check whether Researcher has finished. If it has, compare the two outputs side-by-side: Researcher gives you a deep analytical breakdown, Cowork gives you an actionable email ready to send. Each is the right tool for a different job.

---

### Congratulations! You've used Cowork to draft an executive email from a PDF report!

---

### Test your understanding

**Key takeaways:**

- **Cowork takes agentic action** — It doesn't just summarize. It reads a document, resolves a person in your org, and creates real artifacts (an Outlook draft, a Word doc, a Teams message) that are ready for you to review.
- **No clarifying-question round-trip** — When the prompt is clear and directive ("Draft an email to X about Y, address as Z, sign as W"), Cowork proceeds without asking follow-ups. The cost of being specific is a faster, more deterministic result.
- **Cross-app integration** — The result lives in **Outlook**, not in the chat. Cowork pivots the M365 experience from "answer in chat" to "complete the task in the right app".
- **Parallel work pays off** — Cowork is a great companion to Researcher: while Researcher reasons in the background, Cowork drafts a real artifact you can ship in a fraction of the time.

**Challenge: Apply this to your own use case**

- What weekly emails do you draft from the same source data? Could Cowork generate the first draft?
- Which Microsoft 365 documents would you ask Cowork to read — project status reports, meeting notes, customer feedback summaries?
- Beyond email, Cowork can draft Word documents and Teams messages — what scenarios in your work would benefit from that kind of agentic drafting?

---

## Summary of Learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of your Copilot agents:

- **Start simple, then advance** – Build foundational understanding with web-based agents before adding complexity with SharePoint integration and advanced features. This progressive approach builds confidence and ensures you master core concepts.

- **Ground relentlessly** – Always anchor your agents to specific, trusted knowledge sources. Grounding is the difference between an unreliable chatbot and a trustworthy business tool. Prioritize configured knowledge over general AI knowledge.

- **Match capabilities to use cases** – Not every agent needs code interpreter or image generation. Choose features based on what your users actually need. Simple instruction-based agents are often more effective than feature-laden ones.

- **Use frontier agents for deep work** – The Researcher, Analyst, and Cowork frontier agents are purpose-built for tasks that go beyond conversational chat. Researcher excels at deep document analysis and cross-section synthesis. Analyst excels at data extraction, computation, and financial modeling. Cowork excels at agentic action-taking across Microsoft 365 surfaces (drafting Outlook emails, Word docs, Teams messages from source content). Use them when you need to *reason*, *compute*, or *complete* a task that goes beyond what conversational chat can do on its own.

- **Prompt design drives quality** – The difference between a mediocre and a powerful result often comes down to prompt specificity. Asking for "root causes," "gap analysis," or "NPV at an 8% discount rate" forces the agent to reason deeply rather than provide surface-level summaries.

- **Combine agents for comprehensive results** – Use Analyst to quantify the financial impact of strategic recommendations, then use Cowork to draft the executive email that delivers the findings. This combination mirrors how a real consulting team works — analysts build the business case, communicators package and deliver it.

- **Test systematically** – Test each capability independently before combining them. Use "Start a new chat" between tests. Verify that agents reference the correct knowledge sources in their responses.

- **Design for your audience** – Tailor tone, language, and starter prompts to your users' context and expertise level. A sales team needs different guidance than an IT team.

- **Iterate based on feedback** – Agents improve through use. Monitor how users interact, what questions they ask, and where agents struggle. Update instructions and knowledge sources accordingly.

- **Balance automation and control** – Code interpreter and advanced features provide powerful automation, but ensure you understand what they're doing. Review generated charts and validate data interpretations.

---

## Conclusions & Recommendations

**Copilot agent golden rules:**

- **Purpose before features** – Define what problem your agent solves before selecting capabilities. Features should serve purpose, not the other way around.

- **Quality over quantity in knowledge sources** – Five highly relevant documents beat fifty tangentially related ones. Curate your knowledge sources carefully.

- **Test edge cases** – Don't just test happy paths. Ask questions your agent shouldn't answer, request data that doesn't exist, or provide ambiguous queries to see how it handles uncertainty.

- **Document your agents** – Keep a record of agent purposes, knowledge sources, and intended audiences. This documentation helps with governance and future updates.

- **Share and standardize** – Once you've built effective agents, share them across your organization. Create templates and patterns others can follow.

- **Monitor and maintain** – Agents aren't set-and-forget. Knowledge sources change, organizational needs evolve, and Microsoft adds new capabilities. Schedule regular reviews.

- **Security and compliance first** – Ensure your agents only expose data to users who should have access. Review knowledge sources for sensitive information. Understand how Microsoft 365's security model applies to your agents.

By following these principles, you'll create Copilot agents that don't just answer questions — they transform how your organization accesses knowledge, analyzes data, and accomplishes work. You've progressed from basic declarative agents to advanced SharePoint integration, and then experienced the power of frontier agents (Cowork and Analyst) for agentic action-taking and financial modeling. Together, these capabilities form a complete toolkit for solving real business problems with AI.

---
