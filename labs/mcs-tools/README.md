# Copilot Studio Tools

Learn how to extend your agents with powerful tools including connectors, agent flows, MCP servers, and custom prompts in Microsoft Copilot Studio.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 300 | Maker | 60 minutes | After completing this lab, participants will be able to use connectors to integrate external services, build deterministic business logic with agent flows, connect MCP servers for live data access, and create custom prompts for structured responses. An optional extra credit section covers Computer Using Agents (CUA) for legacy system automation. |

---

## 📚 Table of Contents

- [Why This Matters](#-why-this-matters)
- [Introduction](#-introduction)
- [Core Concepts Overview](#-core-concepts-overview)
- [Documentation and Additional Training Links](#-documentation-and-additional-training-links)
- [Prerequisites](#-prerequisites)
- [Summary of Targets](#-summary-of-targets)
- [Use Cases Covered](#-use-cases-covered)
- [Instructions by Use Case](#️-instructions-by-use-case)
  - [Use Case #1: Extend Your Agent with Connectors](#-use-case-1-extend-your-agent-with-connectors)
  - [Use Case #2: Build Deterministic Logic with Agent Flows](#-use-case-2-build-deterministic-logic-with-agent-flows)
  - [Use Case #3: Connect an MCP Server for Live Data Access](#-use-case-3-connect-an-mcp-server-for-live-data-access)
  - [Use Case #4: Create Custom Prompts for Structured Responses](#-use-case-4-create-custom-prompts-for-structured-responses)
  - [Extra Credit: Automate Legacy Systems with Computer Using Agents (CUA)](#-extra-credit-automate-legacy-systems-with-computer-using-agents-cua)

---

## 🤔 Why This Matters

**Makers and Developers** - Want to know how to go beyond basic agent capabilities and connect your agents to real data, business logic, and external systems?

Think of tools as the hands and feet of your agent:
- **Without Tools**: Your agent can only respond based on its knowledge sources and instructions - it can't take action, access live data, or execute business logic
- **With Tools**: Your agent becomes a true assistant that can query databases, run calculations, call APIs, interact with legacy systems, and deliver structured, actionable responses

**Common challenges solved by this lab:**
- "My agent can answer questions but can't actually do anything"
- "I need my agent to access live data from Dataverse and other systems"
- "I have business rules that must always produce the same result - AI alone isn't deterministic enough"
- "I need to connect to legacy systems that don't have APIs"

**In 60 minutes, you'll learn four different ways to extend your agents with tools - giving you the skills to build agents that don't just talk, but take action.**

---

## 🌐 Introduction

Tools are what transform a conversational agent into a powerful business assistant. Microsoft Copilot Studio offers multiple types of tools, each designed for different integration scenarios. Connectors provide pre-built integrations with hundreds of services. Agent flows enable deterministic, rule-based business logic using Power Fx. MCP (Model Context Protocol) servers provide real-time access to data sources like Dataverse. Custom prompts structure agent responses for consistent, business-relevant outputs. And for systems without APIs, Computer Using Agents (CUA) can simulate human interaction with graphical interfaces.

**Real-world example:** A sales organization needs an agent that can calculate commissions based on fixed business rules (agent flow), look up account details from Dataverse in real time (MCP server), send notifications through Teams or email (connectors), present data in a consistent format (custom prompts), and even pull data from a legacy portfolio system with no API (CUA). Each tool type addresses a different integration need, and together they create a comprehensive, capable agent.

This lab teaches you how to use each tool type through hands-on scenarios.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Connectors** | Pre-built integrations with hundreds of Microsoft and third-party services, enabling agents to take actions like sending emails, creating records, or querying external APIs |
| **Agent Flows** | Deterministic, rule-based workflows that process inputs and produce predictable outputs using Power Fx - essential for business logic that must always be consistent |
| **MCP Servers** | Model Context Protocol servers that provide real-time, dynamic access to data sources like Dataverse, enabling natural language queries against live business data |
| **Custom Prompts** | Structured prompt templates that standardize agent responses by pulling specific fields from data sources, ensuring consistent and relevant output formats |
| **Computer Using Agents (CUA)** | Agents that simulate human interaction with graphical user interfaces, enabling automation of legacy systems that lack API connectivity |

---

## 📄 Documentation and Additional Training Links

* [Tools overview in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/tools-overview)
* [Agent Flows in Microsoft Copilot Studio](https://learn.microsoft.com/microsoft-copilot-studio/agent-flows)
* [Connect to Dataverse with Model Context Protocol (MCP)](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/mcp)
* [Use prompts to make your agent perform specific tasks](https://learn.microsoft.com/en-us/microsoft-copilot-studio/prompts)
* [Use connectors in Copilot Studio](https://learn.microsoft.com/microsoft-copilot-studio/advanced-connectors)
* [Automate web and desktop apps with Computer use](https://learn.microsoft.com/microsoft-copilot-studio/computer-use)

---

## ✅ Prerequisites

- Access to Microsoft Copilot Studio with appropriate licensing
- Power Platform environment enabled for Copilot Studio
- Basic familiarity with the Copilot Studio interface
- Office 365 environment with Outlook integration enabled (for CUA extra credit)

---

## 🎯 Summary of Targets

In this lab, you'll extend agents with multiple tool types to address different integration scenarios. By the end of the lab, you will:

- Use connectors to integrate external services with your agent
- Build an agent flow with deterministic business logic for commission calculations
- Connect a Dataverse MCP server for real-time natural language data access
- Create custom prompts that structure agent responses with specific data fields
- (Extra Credit) Configure a Computer Using Agent to automate a legacy system without API access

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Extend Your Agent with Connectors](#-use-case-1-extend-your-agent-with-connectors) | Integrate external services and take actions through pre-built connectors | 15 min |
| 2 | [Build Deterministic Logic with Agent Flows](#-use-case-2-build-deterministic-logic-with-agent-flows) | Implement business rules that always produce consistent, predictable results | 15 min |
| 3 | [Connect an MCP Server for Live Data Access](#-use-case-3-connect-an-mcp-server-for-live-data-access) | Enable natural language queries against live Dataverse business data | 20 min |
| 4 | [Create Custom Prompts for Structured Responses](#-use-case-4-create-custom-prompts-for-structured-responses) | Standardize agent outputs for consistent, business-relevant responses | 10 min |
| EC | [Extra Credit: Automate Legacy Systems with CUA](#-extra-credit-automate-legacy-systems-with-computer-using-agents-cua) | Automate systems that lack API connectivity using desktop simulation (Optional) | ~20 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Extend Your Agent with Connectors

Learn how to add pre-built connectors to your agent to integrate with external services and take actions on behalf of users.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Extend Your Agent with Connectors | Integrate external services and take actions through pre-built connectors | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to browse and add connectors to your agent, configure connector authentication, and use connectors as tools that the agent can invoke during conversations.

**Scenario:** Your agent needs to integrate with external services like Outlook, SharePoint, or third-party APIs to take actions on behalf of users.

### Objective

Add and configure connectors as tools in your agent to enable integration with external services.

---

### Step-by-step instructions

> [!NOTE]
> **Coming Soon:** This section is currently under development. Connector tool configuration content will be added in a future update.

---

### 🏅 Congratulations! You've completed Use Case #1!

---

---

## 🔄 Use Case #2: Build Deterministic Logic with Agent Flows

Build a Sales Commission Calculator using agent flows to implement deterministic business logic that always produces consistent, predictable results.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Build Deterministic Logic with Agent Flows | Implement business rules that always produce consistent, predictable results | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to create an agent flow with deterministic business logic, implement tier-based commission calculations using Power Fx, build a conversational topic that collects inputs and calls the flow, and test multiple scenarios to validate business rules.

**Scenario:** Contoso Electronics has a sales team that needs instant visibility into their commission earnings. Commission calculations involve performance tiers with different percentage rates and product mix bonuses - rules that must always produce the same result for the same inputs. Agent flows are the ideal tool because they provide deterministic, rule-based processing rather than AI-generated responses.

### Objective

Create an agent flow that calculates sales commissions using deterministic business rules, build a conversational topic to collect inputs, and test the complete workflow.

---

### Step-by-step instructions

#### Create a New Agent

1. Navigate to **Microsoft Copilot Studio** at https://copilotstudio.microsoft.com.

2. Click **Create** in the left navigation.

3. Select **New agent**.

4. Enter the following details:
   - **Name:** `Sales Commission Assistant`
   - **Description:** `Calculates sales commissions based on performance data`

5. Click **Create**.

> [!TIP]
> The agent creation may take 30-60 seconds. You'll see a loading indicator while your agent is being provisioned.

#### Create the Agent Flow

6. In the top navigation panel, click **Tools**.

7. Click **+ Add a tool**.

8. Under Create new, select **Agent flow**.

9. Click **Publish**.

10. Configure the flow by clicking **Edit** under **Details**:
    - **Flow name:** `Calculate Sales Commission`
    - **Description:** `Deterministic commission calculation with tiers, bonuses, and accelerators`
    - **Express mode:** `Enabled`

11. Click **Save**.

#### Define Input Parameters

12. In the flow designer, click **When an agent calls the inputs** at the top.

13. Click **+ Add input** for each parameter below:

| Parameter Name | Type | Description | Sample Value |
|----------------|------|-------------|--------------|
| `SalesRepName` | String | Sales representative's name | Sarah Johnson |
| `AnnualRevenue` | Number | Total annual sales revenue | 325000 |
| `QuotaAmount` | Number | Annual quota target | 300000 |
| `StrategicProductRevenue` | Number | Revenue from strategic products | 120000 |

14. Click **Save** after adding all inputs.

> [!IMPORTANT]
> Ensure parameter names match exactly (case-sensitive) as they'll be referenced in formulas.

#### Initialize Variables

15. Click **+ Add node** in the flow canvas.

16. Select **Variable management** > **Set a variable value**.

17. Create the following variables (add multiple Set variable nodes):

| Variable name | Type | Initial Value |
|---------------|------|---------------|
| `CommissionTier` | String | (leave empty) |
| `CommissionRate` | Float | `0` |
| `BaseCommission` | Float | `0` |
| `ProductMixBonus` | Float | `0` |
| `TotalCommission` | Float | `0` |

#### Determine Commission Tier and Rate

18. Click **+ Add node**.

19. Search for **Condition** and select **Condition** under **Control** > **Branch based on a condition**.

20. Set **Condition name:** `Determine Commission Tier`

> [!NOTE]
> The input variable Annual Revenue is referred to as `triggerBody()?['number']` in Power Fx.

21. Configure the following branches:

**Branch 1: Tier 3 (Revenue > $500,000)**
- Click **Add condition** and set: `AnnualRevenue > 500000`
- Add **Set variable** nodes: `CommissionTier` = `"Tier 3"`, `CommissionRate` = `0.12`

**Branch 2: Tier 2 ($250,001 - $500,000)**
- Add another condition branch: `And(AnnualRevenue > 250000, AnnualRevenue <= 500000)`
- Add **Set variable** nodes: `CommissionTier` = `"Tier 2"`, `CommissionRate` = `0.10`

**Branch 3: Tier 1 ($100,001 - $250,000)**
- Add another condition branch: `And(AnnualRevenue > 100000, AnnualRevenue <= 250000)`
- Add **Set variable** nodes: `CommissionTier` = `"Tier 1"`, `CommissionRate` = `0.05`

**Branch 4: Tier 0 ($0 - $100,000)**
- Click **All other conditions** branch
- Add **Set variable** nodes: `CommissionTier` = `"Tier 0"`, `CommissionRate` = `0.00`

> [!NOTE]
> The condition branches are evaluated top-to-bottom. The first matching condition will execute.

#### Calculate Commissions

22. After the tier condition node (ensure all branches converge), click **+ Add node**.

23. Select **Variable management** > **Set a variable value** and configure:
    - **Variable name:** `BaseCommission`
    - **Value (Power Fx):** `mul(triggerBody()?['number'], variables('CommissionRate'))`

24. Click **+ Add node** and select **Condition** > **Branch based on a condition**.

25. Set **Condition name:** `Calculate Product Mix Bonus`

26. Set the condition to check if strategic product revenue is >= 30% of annual revenue:
    - **Power Fx:** `div(float(triggerBody()?['number_2']),float(triggerBody()?['number']))` >= 0.30
    - **If true:** Set `ProductMixBonus` = `3000`
    - **All other conditions:** Set `ProductMixBonus` = `0`

27. Click **+ Add node** and set `TotalCommission` using Power Fx:
    ```
    add(variables('BaseCommission'), variables('ProductMixBonus'))
    ```

#### Create the Response Message

28. Click **+ Add node** and select **Agent action** > **Create a response**.

29. In the message box, enter the following Power Fx expression:

```
concat('COMMISSION CALCULATION REPORT
===================================

SALES REPRESENTATIVE: ', triggerBody()?['text'], '

PERFORMANCE SUMMARY
-----------------------------------
Annual Revenue: $', formatNumber(triggerBody()?['number'], '#,##0.00'), '
Annual Quota: $', formatNumber(triggerBody()?['number_1'], '#,##0.00'), '
Strategic Product Revenue: $', formatNumber(triggerBody()?['number_2'], '#,##0.00'), '

COMMISSION BREAKDOWN
-----------------------------------
Commission Tier: ', variables('CommissionTier'), '
Commission Rate: ', formatNumber(mul(variables('CommissionRate'), 100), '#,##0.0'), '%
Base Commission: $', formatNumber(variables('BaseCommission'), '#,##0.00'), '

BONUS
-----------------------------------
', if(greater(variables('ProductMixBonus'), 0), concat('Product Mix Bonus: $', formatNumber(variables('ProductMixBonus'), '#,##0.00'), ' (Strategic products >=30%)'), 'Product Mix Bonus: $0.00 (Strategic products <30%)'), '

TOTAL COMMISSION
-----------------------------------
$', formatNumber(variables('TotalCommission'), '#,##0.00'), '

===================================
Calculation Date: ', formatDateTime(utcNow(), 'MMM dd, yyyy'))
```

30. Click **+ Add node** and select **Flow management** > **End flow**.

31. Click **Save** to save the entire flow.

![Agent Flow](images/agentflow.jpg)

#### Build the Conversation Topic

32. In the left navigation, click **Topics**.

33. Click **+ Add** > **Topic** > **From blank**.

34. Name the topic: `Calculate My Commission`

35. In the **Trigger phrases** section, click **Edit** and add the following phrases:

```
Calculate my commission
What's my commission
How much commission did I earn
Check commission
Commission calculator
Show my earnings
Calculate earnings
```

36. Click **Save**.

37. Under the trigger phrase node, add an **Ask with adaptive card** node. Under Properties, click **Edit adaptive card** and paste the following into the **Card payload editor**:

```json
{
    "type": "AdaptiveCard",
    "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.5",
    "body": [
        {
            "type": "Input.Text",
            "label": "What is your name",
            "placeholder": "SalesRepName",
            "id": "SalesRepName"
        },
        {
            "type": "Input.Number",
            "label": "What is your total annual revenue? (Number only)",
            "placeholder": "AnnualRevenue",
            "id": "AnnualRevenue"
        },
        {
            "type": "Input.Number",
            "label": "What is your annual quota target? (Number only)",
            "placeholder": "QuotaAmount",
            "id": "QuotaAmount"
        },
        {
            "type": "Input.Number",
            "label": "How much revenue came from strategic products? (Number only)",
            "placeholder": "StrategicProductRevenue",
            "id": "StrategicProductRevenue"
        },
        {
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Calculate Commission"
                }
            ]
        }
    ]
}
```

![Adaptive Card](images/adaptivecard.jpg)

38. Click **+ Add node** > **Call an action** and select the **Agent Flows** tab.

39. Select your flow: **Calculate Sales Commission** and map the inputs:
    - `SalesRepName` > Select variable `SalesRepName`
    - `AnnualRevenue` > Select variable `AnnualRevenue`
    - `QuotaAmount` > Select variable `QuotaAmount`
    - `StrategicProductRevenue` > Select variable `StrategicProductRevenue`

40. Click **Save**.

![Topic](images/topic.jpg)

#### Test Your Commission Calculator

41. Click **Test** in the upper right-hand corner of Copilot Studio.

42. Type `Calculate my commission` and fill in the adaptive card with the following test data:
    - **Name:** `Jennifer Rodriguez`
    - **Annual Revenue:** `675000`
    - **Annual Quota:** `400000`
    - **Strategic Product Revenue:** `250000`

43. Verify the results:
    - Commission Tier: Tier 3 (12% rate)
    - Base Commission: $81,000.00
    - Product Mix Bonus: $3,000.00 (250K/675K = 37%, above 30%)
    - **Total Commission: $84,000.00**

![Testing](images/test.jpg)

44. Reset the conversation and test with a below-quota scenario:
    - **Name:** `David Park`
    - **Annual Revenue:** `75000`
    - **Annual Quota:** `100000`
    - **Strategic Product Revenue:** `10000`

45. Verify: Commission Tier: Tier 0 (0% rate), Total Commission: $0.00

---

### 🏅 Congratulations! You've completed Use Case #2!

---

### Test your understanding

**Key takeaways:**

* **Deterministic Logic** - Same inputs always produce the same commission outputs with no AI variability, which is critical for financial calculations
* **Power Fx Formulas** - Used to calculate percentages, apply rates, and aggregate totals within the flow
* **Agent Flows vs. AI** - Use agent flows for business rules that must be predictable and auditable; use AI for open-ended, conversational responses

**Lessons learned & troubleshooting tips:**

* Parameter names in agent flows are case-sensitive - ensure they match exactly between the flow and topic
* Use the Express mode for simpler flows that don't require complex error handling
* Test with edge cases (zero revenue, exactly at tier boundaries) to validate business rules

---

---

## 🧱 Use Case #3: Connect an MCP Server for Live Data Access

Create a Copilot Agent that connects to the Dataverse MCP Server for real-time natural language access to business data.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Connect an MCP Server for Live Data Access | Enable natural language queries against live Dataverse business data | 20 minutes |

**Summary of tasks**

In this section, you'll learn how to create a Copilot Agent, configure it with proper instructions and suggested prompts, integrate the Dataverse MCP Server as a tool, and test natural language queries against live Account and Contact data.

**Scenario:** A sales team at Contoso needs to quickly access and update account and contact information without leaving their Teams environment. The Dataverse MCP Server enables natural language access to critical business data stored in Dataverse.

### Objective

Create and configure a Copilot Agent with Dataverse MCP Server integration that can read and query account and contact information using natural language.

---

### Step-by-step instructions

#### Create and Configure the Agent

1. Browse to [Copilot Studio](https://copilotstudio.microsoft.com/). Ensure you are logged in using the credentials for the lab and are in the correct environment.

![Step 1: Navigate to Copilot Studio](images/step1-copilot-studio-navigation.png)

2. Click on **+ New Agent**.

![Step 2: Create new agent](images/step2-create-agent.png)

3. Click on **Configure** and fill in the Name, Description, and Instructions:

   **Name:** `Contoso Agent`

   **Description:** `This agent will help Contoso sales reps update their accounts and contacts using the Dataverse MCP Server.`

   **Instructions:**
   ```
   This agent will:
   Read accounts and contact information from the Account and Contact Tables in Dataverse using the Dataverse MCP Server.
   Update accounts and contact information from the Account and Contact Tables in Dataverse using the Dataverse MCP Server.
   Create new accounts and contact information in the Account and Opportunity Tables in Dataverse using the Dataverse MCP Server.
   Do not use outside knowledge. Only use the Dataverse MCP Tool to create, read, update and delete.
   ```

   ![Agent Configuration](images/step3-agent-configuration.png)

4. Click **+ Add suggested prompts** and add the following prompts, then click **Save**:
   - **Title:** Account Search | **Prompt:** `List all accounts in Redmond`
   - **Title:** Contact Search | **Prompt:** `List all contacts from Coho Winery`

   ![Suggested prompts configuration](images/step4b-suggested-prompts-search.png)

> [!TIP]
> You can configure up to six suggested prompts that customers can choose from to start a conversation. In Teams and in Copilot Chat, suggested prompts appear on the agent's welcome page before you start a new chat. You can't see or use them when you test your agent in Copilot Studio.

5. Click **Create**.

#### Add the Dataverse MCP Server as a Tool

6. Scroll down to the **Tools** section and click **+ Add tool**.

   ![Add tool](images/step6-add-tool.png)

7. Click **Model Context Protocol** and then click **+ New tool** or **Dataverse MCP Server (Preview)** if it shows up in the recommendations.

   ![Select MCP Dataverse](images/step7-mcp-dataverse.png)

8. If there is no Dataverse Connection yet, click on the dropdown to create a new connection using **Authentication Type** as **OAuth** and using your lab credentials. Then click **Add** and **configure**.

   ![Add authentication](images/step8-add-auth.png)

> [!IMPORTANT]
> The Dataverse MCP Server will allow you natural language access to your tables in Dataverse. We have sample data in the Accounts and Contacts tables that we will use. The tools available are: list tables, describe table, read data, create record, update record, list prompts, execute prompt, list knowledge sources, and retrieve knowledge.

9. Review the tools available for the Dataverse MCP Server. You can select and deselect which tools are available to the agent. When the tool is executed, the list is dynamically updated from the MCP Server.

    ![Review MCP tools](images/step9-review-mcp.png)

> [!NOTE]
> You cannot call an MCP Server from a Topic. MCP tools are invoked by the agent's orchestrator during natural language conversations.

#### Test Your Agent

10. In the testing panel, ask the following question: `List the accounts in the state of WA.`

11. For the first run, you will get a Consent dialog as by default the tool is configured to use "End user credentials". Click **Allow** to continue.

    ![Allow MCP access](images/step11a-allow-mcp.png)

> [!NOTE]
> If you are using Service Principals or Client Certification Auth to connect to Dataverse, you may need to use "Maker-provided credentials". To change this, go to the Details section > Additional details section > Credentials to use.

   ![Test agent](images/step11b-test-agent.png)

> [!TIP]
> Click on the **Activity Map** at the top of the agent testing panel to track what topics or tools the agent is using. You can see that the Dataverse MCP server is initiated and then which tools are being used - list_tables, describe_tables, read_query.

   ![Activity map tracking](images/step11c-activity-map.png)

12. If you click on the tool that was used, you will see the **Inputs** and **Outputs** of the tool.

    ![Tool inputs and outputs](images/step11d-inputs-outputs.png)

13. Continue testing by asking: `Who are the contacts for City Power & Light (sample)?`

    ![Test contacts query](images/step12-test-contacts.png)

---

### 🏅 Congratulations! You've completed Use Case #3!

---

### Test your understanding

**Key takeaways:**

* **MCP Server Integration** - The Dataverse MCP Server provides dynamic, real-time access to business data through natural language queries
* **Activity Tracking** - The Activity Map helps troubleshoot agent behavior by showing which tools are executed and their inputs/outputs
* **Agent Configuration** - Proper instructions and descriptions help the agent understand its role and limitations, ensuring it uses only the specified tools

**Lessons learned & troubleshooting tips:**

* You must create your agent before adding MCP Servers as tools
* Use Activity Map to debug and understand tool execution flow
* Suggested prompts help guide users but don't appear in Copilot Studio testing

---

---

## 🔄 Use Case #4: Create Custom Prompts for Structured Responses

Create custom prompts that ensure consistent, structured responses from your agent by pulling specific fields from Dataverse.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create Custom Prompts for Structured Responses | Standardize agent outputs for consistent, business-relevant responses | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to create custom prompts that structure agent responses to show specific Dataverse fields and provide consistent output formats.

**Scenario:** Different users might get varying levels of detail when querying account information. By creating structured prompts, you ensure all users receive consistent, relevant account details that support their business decisions.

### Objective

Create custom prompts that standardize agent responses with specific data fields from Dataverse.

---

### Step-by-step instructions

> [!NOTE]
> **Coming Soon:** This section is currently under development. Custom prompt configuration content will be added in a future update.

---

### 🏅 Congratulations! You've completed Use Case #4!

---

---

## 🧱 Extra Credit: Automate Legacy Systems with Computer Using Agents (CUA)

> [!NOTE]
> **Optional - Extra Credit (~20 minutes):** This use case is optional and not included in the 60-minute lab time. Complete it if you have additional time or want to explore advanced autonomous agent capabilities.

Build an autonomous agent that retrieves financial portfolio data from a legacy system without API connectivity using Computer Using Agents (CUA).

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Automate Legacy Systems with CUA | Automate systems that lack API connectivity using desktop simulation | ~20 minutes |

**Summary of tasks**

In this section, you'll learn how to create an autonomous agent with email triggers, configure the Computer use tool to simulate GUI-based data retrieval, set up email response capabilities, and test the complete workflow.

**Scenario:** A financial advisor needs quick access to portfolio details - such as client name, portfolio value, and assigned manager - but the data resides in a legacy system that lacks an API. Traditional RPA tools rely on fragile screen-scraping and require constant maintenance. Computer Using Agents provide a smarter, more resilient approach to automating legacy system access.

### Objective

Create an autonomous agent that uses the Computer use tool to retrieve portfolio data from a legacy web interface and responds via email.

---

### Step-by-step instructions

#### Create the Agent and Configure Email Trigger

1. Navigate to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com).

2. Make sure you're in the correct environment by looking at the top right-hand corner. The environment name should start with **'DEV - '**.

3. Go to the **Solutions** menu (located in the left-hand menu under the ellipsis **...**).

4. Select the solution you created previously for your labs.

5. Select **New** and choose **Agent**.

6. Select **Configure** to bypass the initial setup wizard.

7. Name your agent `Portfolio Lookup Agent`.

8. Select **Create**.

#### Configure Email Triggers

9. Scroll down to the triggers section and click **+ Add trigger**.

10. Search and select `When a new email arrives (V3) (Office 365 Outlook)`.

11. Select **Next**.

12. Rename the trigger to `When a portfolio lookup email arrives`.

13. Select **Next**.

14. In the **Subject Filter (Optional)** field, enter `Portfolio` to filter emails that contain the word "Portfolio" in the subject line.

15. Click **Create trigger**.

#### Configure the Computer Use Tool

16. Navigate to **Tools** in the top-level menu.

17. Select **+ Add a tool**.

18. Select **+ New tool**.

19. Select **Computer use**.

20. Add the following **Instructions**:

```
1. Go to https://computerusedemos.blob.core.windows.net/web/Portfolio/index.html.
2. Enter the Portfolio ID in the "Enter Portfolio ID" search field and click on the "Search" button.
3. Retrieve the "Client Name", "Portfolio Value" and "Manager" values exactly as shown.
4. Return those three values as the final output.

If no portfolio data is found, reply that you couldn't find a portfolio with the specified ID.
```

21. Keep the box **Use hosted browser** checked to create a connection to the hosted browser.

22. Select **Add and configure**.

23. Update the **Name** of the Computer use tool to `Look up portfolio data`.

24. Update the **Description** to `Search and retrieve financial portfolio data`.

25. In the **Inputs** section, select **+ Add input**.

26. Enter name `Portfolio ID` and description `The ID of the portfolio` and select **Done**.

> [!TIP]
> During execution, Computer use combines your instructions with the input values to complete the task.

27. Select **Save**.

#### Test the Computer Use Tool

28. In the **Instructions** section, select the **Test** button on the right.

29. Add the sample value `44123BCD` and select **Test now**.

30. Observe the Computer use tool logging into the computer and performing the requested actions:
    - The left panel shows your instructions and a step-by-step log of the tool's reasoning and actions
    - The right panel shows a preview of the actions on the machine

![CUA Test](images/test_CUA.jpg)

31. Select **Finish testing**.

> [!TIP]
> If the result isn't what you expect, refine your instructions with more details and test again. Allow sufficient time between tests to ensure the previous Computer use task has been fully completed before starting a new one.

#### Set Up Email Response

32. Return to the **Tools** tab and select **+ Add a tool**.

33. Search for `Send an email (V2) (Office 365 Outlook)` and select it.

34. Select **Add and configure**.

35. Update the name to `Reply to email`.

36. Update the description to: `Use this operation to reply to the email received`

37. Under **Additional details**, set **Credentials to use** to **Maker-provided credentials**.

38. Customize the input descriptions:
    - **To:** `Use the "from" email of the triggering received email.`
    - **Subject:** `Write the email subject.`
    - **Body:** `Write the email body using HTML and highlight the requested data.`

39. Click **Save**.

#### Configure Agent Instructions

40. Navigate to the **Overview** tab and click **Edit** on the **Instructions**.

41. Paste the following instructions:

```
When a financial portfolio related request is received, identify the Portfolio ID and search for the requested data using (replace this text). Once you have gathered the financial portfolio information, use the (replace this text) tool to reply to the original email you received. Do not respond with data beyond what was requested.
```

42. For each `(replace this text)` placeholder in the instructions, select the placeholder, type `/` to open the dropdown menu, and select the corresponding tool:
    - First placeholder: Select **Look up portfolio data**
    - Second placeholder: Select **Reply to email**

> [!IMPORTANT]
> Using the `/` reference technique creates a direct link between your instructions and the configured tools, ensuring the agent knows exactly which tools to invoke.

![Agent Instructions](images/agent_instructions.jpg)

43. **Save** the instructions.

44. Go to the agent's **Settings**, and in the Knowledge section **disable** the **Use general knowledge** option to ground agent responses only to data retrieved from CUA.

45. **Save** the settings.

#### Test the Complete Workflow

46. Send a test email from an email address of your preference to your training user's email account with:
    - **Subject:** `Portfolio data request`
    - **Body:**

```
Hi!

I hope you're doing well!
I'm looking for the portfolio manager and value of portfolio #44123BCD.

Much appreciated.
Thanks!
```

47. Make sure you receive the email in your training user's inbox at outlook.office.com.

48. In the **Overview** tab, go to the **Triggers** section and select **Test trigger**.

49. Select the trigger instance and then **Start testing**.

![Test Trigger](images/test_trigger.jpg)

50. Check your emails for the agent's reply.

> [!TIP]
> - Monitor the Computer use tool's actions in the Test chat window or through the agent's **Activity** page.
> - In the **Activity** page, select the current run and switch from **Activity map** to **Transcript** for a real-time view of all Computer use tool steps with screenshots.

---

### 🏅 Congratulations! You've completed the Extra Credit section!

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting - so let's put your skills to the test.

To maximize the impact of tools in Copilot Studio:

* **Choose the Right Tool Type** - Connectors for pre-built service integrations, agent flows for deterministic business logic, MCP servers for live data access, custom prompts for structured responses, and CUA for legacy system automation
* **Use Agent Flows for Predictable Logic** - Financial calculations, compliance rules, and other business logic that must be auditable and consistent should use deterministic flows, not AI
* **Leverage MCP for Real-Time Data** - The Dataverse MCP Server provides natural language access to live business data without building custom APIs or connectors
* **Standardize with Custom Prompts** - Use structured prompts to ensure all users get consistent, relevant responses with the specific data fields they need
* **Test Thoroughly** - Use the Activity Map to understand tool execution flow, validate calculations with edge cases, and verify end-to-end workflows

---

### Conclusions and recommendations

**Copilot Studio tools golden rules:**

* Match the tool type to the integration need - don't force one approach for all scenarios
* Use agent flows for any business logic that must produce the same result every time
* Always configure proper agent instructions that specify which tools to use and when
* Use Activity Map to debug and optimize tool execution
* Test with realistic data and edge cases before deploying
* Structure agent responses with custom prompts when consistency matters for business decisions

By following these principles, you'll build agents that go beyond conversation - they take action, access live data, execute business logic, and integrate with the systems your organization relies on.

---
