# Master Variables and Multi-Agent Architectures

Learn how to manage conversation state with variables and build specialized child agents to create modular, scalable agent solutions.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 40 minutes | After completing this lab, participants will be able to create and manage both topic-level and global variables to maintain conversation state, use variables to pass data between topic nodes, create child agents with specialized knowledge and instructions, and understand when to use child agents versus single agents for complex scenarios. |

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
  - [Use Case #1: Work with Variables](#-use-case-1-work-with-variables)
  - [Use Case #2: Create and Configure Child Agents](#-use-case-2-create-and-configure-child-agents)

---

## 🤔 Why This Matters

**Agents need memory and specialization to handle complex scenarios.**

Think of variables and child agents like organizing a company:
- **Without variables**: Your agent forgets information between conversation steps, forcing users to repeat themselves - like having no memory of what was said 30 seconds ago
- **Without child agents**: One agent tries to do everything, leading to confused responses and poor performance - like a single employee trying to be an expert in every department

**With variables and child agents**: Your agent remembers context, passes data between steps, and delegates to specialists when needed - like a well-organized team with shared knowledge and clear expertise.

**Common challenges solved by this lab:**
- "My agent forgets what users told it earlier in the conversation"
- "I need to reuse collected data across multiple topic nodes"
- "My agent is overwhelmed trying to be an expert in too many areas"
- "I want specialized sub-agents with focused knowledge bases"

**In 40 minutes, you'll transform your agent from a stateless chatbot into a sophisticated, memory-enabled system with specialized capabilities.**

---

## 🌐 Introduction

Variables and child agents are the keys to building enterprise-grade agent solutions. Variables act as your agent's memory - storing user information, preferences, and conversation context that can be accessed and modified throughout the conversation. Child agents enable modular architecture where specialized sub-agents handle specific domains, each with their own knowledge sources and instructions, while the parent agent orchestrates and routes conversations appropriately.

**Real-world example:** An IT support agent collects a user's employee ID, department, and issue category at the start of the conversation. These details are stored in variables and used throughout the interaction - personalizing responses, pre-filling forms, and routing to appropriate backend systems. When the user asks about password policies, the parent agent delegates to a specialized "Security Policies" child agent with deep knowledge of authentication standards. When they ask about hardware requests, a different "Hardware Support" child agent takes over. Variables maintain context while child agents provide expertise.

This lab teaches you how to architect sophisticated agent solutions that scale with your organization's complexity - combining conversation memory with specialized intelligence.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Topic-Level Variables** | Store data within a single topic's scope - perfect for collecting and using information during a specific conversation flow without polluting the global namespace |
| **Global Variables** | Maintain data across the entire conversation and all topics - essential for user preferences, session information, and context that persists throughout the interaction |
| **Variable Types** | Different data types (text, number, boolean, table) enable proper data handling and validation - using the right type prevents errors and enables advanced logic |
| **Set Variable Node** | Modify variable values during conversation flows - this allows dynamic data transformation, calculations, and state management |
| **Child Agents** | Specialized sub-agents with focused knowledge and instructions - these enable modular architecture, domain expertise, and scalable agent development |
| **Agent Orchestration** | Parent agents route conversations to appropriate child agents based on context - this creates seamless multi-agent experiences that leverage specialized knowledge |

---

## 📄 Documentation and Additional Training Links

* [Use variables to store and reuse information](https://learn.microsoft.com/microsoft-copilot-studio/authoring-variables)
* [Create and manage child agents](https://learn.microsoft.com/microsoft-copilot-studio/advanced-use-skills)
* [Multi-agent architectures in Copilot Studio](https://learn.microsoft.com/microsoft-copilot-studio/advanced-multi-agent)
* [Pass data between topics with variables](https://learn.microsoft.com/microsoft-copilot-studio/authoring-variables-data-flow)

---

## ✅ Prerequisites

* Completed Lab 2 (Tools and Topics) or familiarity with Copilot Studio topics
* An existing Copilot Studio agent with at least one topic
* Basic understanding of data types and variables (helpful but not required)
* Access to file upload capabilities for child agent knowledge sources

---

## 🎯 Summary of Targets

In this lab, you'll implement conversation memory with variables and build a multi-agent architecture with specialized child agents. By the end of the lab, you will:

* Understand the difference between topic-level and global variables
* Create and configure variables with appropriate data types
* Use the Set Variable node to modify data during conversations
* Pass data between topic nodes using variables
* Create child agents with specialized knowledge and instructions
* Configure agent-level orchestration to route conversations to child agents appropriately
* Test multi-agent interactions to ensure seamless handoffs

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Work with Variables](#-use-case-1-work-with-variables) | Implement conversation memory to maintain context and reuse data across topic nodes | 20 min |
| 2 | [Create and Configure Child Agents](#-use-case-2-create-and-configure-child-agents) | Build specialized sub-agents with focused expertise to create modular, scalable solutions | 20 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Work with Variables

Learn how to create, configure, and use variables to maintain conversation state and pass data between topic nodes.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Work with Variables | Implement conversation memory to maintain context and reuse data across topic nodes | 20 minutes |

**Summary of tasks**

In this section, you'll learn how to create topic-level and global variables, configure variable properties, use the Set Variable node to modify values, and understand variable scope and lifetime.

**Scenario:** In your mailing list topic (from Lab 2), you need to store the user's email address as a variable, display it back to them for confirmation, and potentially use it in other parts of the conversation. You'll also explore global variables that persist across topics.

### Objective

Master variable creation, configuration, and usage to build agents with conversation memory.

---

### Step-by-step instructions

#### Open the Mailing List Topic

1. In your Copilot Studio agent, navigate to **Topics** in the left panel.

2. Open the **Join Copilot Studio Mailing List** topic that you created in Lab 2 (or any topic that collects user information).

> [!NOTE]
> If you don't have this topic, create a simple topic with a question node that asks for the user's email address.

#### Review Existing Variable

3. Find the **Question** node where you collect the user's email address.

4. Click on the question node to expand its properties panel.

5. Look for the **Save response as** or **Variable** section. You'll see that Copilot Studio automatically created a variable to store the email address.

6. Note the variable name (likely something like `emailAddress` or `userEmail`).

> [!TIP]
> Whenever you create a question node, Copilot Studio automatically creates a variable to store the user's response. This variable is scoped to the topic by default.

#### Explore Variable Properties

7. Click on the variable name to open the variable properties panel.

8. Review the variable configuration:
   - **Name**: The variable identifier used in the topic
   - **Type**: Data type (Text, Number, Boolean, etc.)
   - **Scope**: Topic-level or Global
   - **Description**: Documentation for the variable's purpose

9. Notice that this variable is **Topic-level** by default, meaning it only exists within this topic.

#### Convert to Global Variable (Optional)

10. To make this variable available across all topics, change the scope from **Topic** to **Global**.

11. Notice how the variable name changes to include a namespace (like `Global.emailAddress`).

> [!IMPORTANT]
> Use global variables sparingly. They persist throughout the entire conversation and can be accessed by any topic. Only make variables global when you need to share data across multiple topics.

12. For this exercise, keep the variable as **Topic-level** to understand the difference.

#### View All Variables

13. Click **Variables** in the left navigation panel (or look for a Variables section in your topic).

14. Review the **Topic variables** section showing all variables in the current topic.

15. Review the **Global variables** section showing variables available across the entire agent.

> [!NOTE]
> The Variables view gives you a centralized place to see all variables, their types, and their values during testing.

#### Add a Set Variable Node

16. Return to your topic canvas.

17. After the email collection question, click **+** to add a new node.

18. Select **Set a variable value** from the node options.

19. Configure the Set Variable node:
    - **Variable**: Select an existing variable or create a new one
    - **Value**: Set the value using text, another variable, or a formula

20. For this example, create a new variable called `confirmationMessage` and set its value using a formula:

```
"Thank you! We'll send announcements to " & Topic.emailAddress
```

> [!TIP]
> The `&` operator concatenates text strings. This formula combines static text with the collected email address variable.

#### Use the Variable in a Message

21. Click **+** after the Set Variable node to add a new node.

22. Select **Send a message** from the node options.

23. In the message text, reference your confirmation message variable:

```
{Topic.confirmationMessage}
```

24. Alternatively, you can directly reference the email variable in the message:

```
Thank you! We'll send Copilot Studio announcements to {Topic.emailAddress}.
```

> [!NOTE]
> Use curly braces `{}` to reference variables in message text. This dynamically inserts the variable value when the message is displayed.

25. Click **Save** to save your topic changes.

#### Test Variable Usage

26. In the test panel, start a new conversation.

27. Trigger the mailing list topic by saying:

```
I want to join the mailing list.
```

28. When prompted for your email, provide:

```
user@example.com
```

29. Observe how the agent displays the confirmation message using the variable value you provided.

30. Notice how the variable persists throughout the topic and can be referenced in multiple nodes.

#### Explore Variable Values During Testing

31. While in a test conversation, click **Variables** in the test panel (or look for a Variables icon).

32. Review the current values of all variables in the conversation.

33. Notice how variables update in real-time as you progress through the conversation.

> [!TIP]
> Monitoring variables during testing is essential for debugging complex conversation flows and understanding data flow.

---

###  🏅 Congratulations! You've completed Use Case 1!

---

### Test your understanding

**Key takeaways:**

* **Topic Variables Scope Locally** – Topic-level variables exist only within a single topic, preventing namespace pollution and keeping data organized
* **Global Variables Share Context** – Global variables persist across all topics and the entire conversation, enabling cross-topic data sharing
* **Set Variable Nodes Transform Data** – Use Set Variable nodes to perform calculations, concatenations, and transformations during conversation flows
* **Variables Enable Personalization** – Referencing variables in messages creates dynamic, personalized user experiences

**Lessons learned & troubleshooting tips:**

* If a variable isn't available in a message or node, check its scope - topic variables can't be accessed from other topics
* Always give variables descriptive names - `emailAddress` is better than `var1`
* Use the Variables panel during testing to verify data is stored correctly
* Consider variable lifetime - topic variables reset when the topic ends, global variables persist until the conversation ends

**Challenge: Apply this to your own use case**

* What user information would you collect and store in variables?
* Which variables should be global vs. topic-level in your agent?
* How could you use variables to personalize messages or pre-fill forms?

---

---

## 🔄 Use Case #2: Create and Configure Child Agents

Build specialized child agents with focused knowledge and instructions to create modular, scalable agent architectures.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create and Configure Child Agents | Build specialized sub-agents with focused expertise to create modular, scalable solutions | 20 minutes |

**Summary of tasks**

In this section, you'll learn how to create child agents, configure their specialized knowledge and instructions, set up orchestration rules in the parent agent, and test multi-agent interactions.

**Scenario:** Your Copilot Studio Assistant needs specialized expertise in prompt engineering frameworks. Instead of overloading the main agent with all knowledge, you'll create a child agent called "CARE Prompt Guidance" that specializes in the CARE framework for prompt writing. This child agent will be automatically invoked when users ask about general prompt guidance.

### Objective

Create a specialized child agent and configure the parent agent to orchestrate conversations appropriately.

---

### Step-by-step instructions

#### Create a Child Agent

1. In your Copilot Studio agent, locate the **Agents** or **Skills** section in the left navigation panel.

2. Click **+ Add agent** or **Create child agent** (terminology may vary).

3. Select **Child agent** as the agent type.

4. Configure the child agent with the following details:

**Name:**
```
CARE Prompt Guidance
```

**Description:**
```
This agent provides information on the CARE Prompt guidance.
```

> [!NOTE]
> The description helps the parent agent understand when to route conversations to this child agent. Be specific and clear.

5. Click **Create** to initialize the child agent.

#### Configure Child Agent Instructions

6. Once the child agent is created, navigate to its **Instructions** section.

7. Add the following instructions:

```
This agent should help users with understanding information about the prompt guidance framework and how they can leverage it to make their agents better.
```

> [!TIP]
> Child agent instructions should be focused and specific to their domain of expertise. Avoid generic instructions - be precise about what this agent knows and does.

8. Click **Save** to apply the instructions.

#### Add Knowledge Sources to Child Agent

9. In the child agent, navigate to **Knowledge** in the left panel.

10. Click **+ Add knowledge** to add a knowledge source.

11. Select **Upload files** and upload a PDF about the CARE prompt framework (if you have one), or use the URL:

```
https://www.nngroup.com/articles/careful-prompts/
```

12. Alternatively, upload any document related to prompt engineering best practices.

> [!IMPORTANT]
> Child agents can have their own dedicated knowledge sources. This keeps knowledge organized and prevents one agent from being overloaded with unrelated content.

13. Wait for the knowledge source to be indexed.

14. Click **Save** to finalize the child agent configuration.

#### Configure Parent Agent Orchestration

15. Return to your **parent agent** (the main Copilot Studio Assistant).

16. Navigate to the agent's **Instructions** or **Overview** section.

17. Add orchestration instructions to help the parent agent understand when to use the child agent:

```
Use CARE Prompt Guidance when asked to provide just general guidance around prompt building. Never use it when asked to analyze a prompt.
```

> [!IMPORTANT]
> Orchestration instructions are critical for proper agent routing. Be explicit about WHEN to use each child agent and WHEN NOT to use them. This prevents confusion and ensures the right agent handles each request.

18. Click **Save** to apply the orchestration instructions.

#### Review Agent Relationships

19. In the parent agent, navigate to the **Agents** or **Skills** panel.

20. Verify that the "CARE Prompt Guidance" child agent appears in the list of available agents.

21. Check that the child agent is **Enabled** (toggle should be on).

> [!NOTE]
> Disabled child agents won't be invoked by the parent agent. Always verify child agents are enabled after creation.

#### Test the Child Agent

22. In the parent agent's test panel, start a new conversation.

23. Ask a question that should trigger the child agent:

```
How does the CARE prompt guidance help write prompts?
```

24. Observe the agent's response. It should:
    - Recognize that this is a general prompt guidance question
    - Route the conversation to the "CARE Prompt Guidance" child agent
    - Provide an answer grounded in the CARE framework knowledge

25. Look for indicators in the test panel showing which agent responded (some interfaces show "Responded by: CARE Prompt Guidance" or similar).

#### Test Orchestration Logic

26. Now test the orchestration instructions by asking a question that should NOT use the child agent:

```
Analyze this prompt for improvements: Write a summary of the quarterly report.
```

27. Verify that the parent agent uses the Prompt Analyzer tool (from Lab 2) instead of routing to the child agent.

> [!TIP]
> This demonstrates proper orchestration - the parent agent understands the difference between "general prompt guidance" (child agent) and "analyze a specific prompt" (tool).

#### Explore Child Agent Capabilities

28. Ask several different questions to test the child agent's knowledge:
    - "What is the CARE framework?"
    - "How do I write better prompts?"
    - "What does the A stand for in CARE?"

29. Verify that the child agent consistently provides accurate answers from its knowledge source.

30. Return to the child agent's configuration and review how you could:
    - Add more knowledge sources
    - Refine instructions for better responses
    - Create additional child agents for other domains

---

###  🏅 Congratulations! You've completed Use Case 2!

---

### Test your understanding

* When should you create a child agent vs. adding more knowledge to the parent agent?
* How do orchestration instructions help the parent agent make routing decisions?
* What happens if orchestration instructions are ambiguous or missing?

**Challenge: Apply this to your own use case**

* What specialized domains in your organization would benefit from dedicated child agents?
* How would you organize knowledge across parent and child agents for optimal performance?
* What orchestration rules would you write to ensure proper routing in a multi-agent system?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of variables and child agents in Copilot Studio:

* **Variables Provide Memory** – Use topic-level variables for localized data and global variables for shared context. This creates agents that remember user information and maintain conversation continuity.
* **Scope Variables Appropriately** – Don't make everything global. Topic variables keep data organized and prevent namespace pollution while global variables enable cross-topic coordination.
* **Child Agents Enable Specialization** – Build focused child agents with dedicated knowledge and instructions rather than overloading a single agent with all content.
* **Orchestration Instructions Matter** – Clear, explicit orchestration rules in the parent agent ensure proper routing and prevent confusion between child agents.
* **Test Multi-Agent Flows** – Verify that conversations seamlessly transition between parent and child agents, maintaining context and providing accurate responses.

---

### Conclusions and recommendations

**Variables and child agents golden rules:**

* Use descriptive variable names that clearly indicate their purpose and content
* Choose the appropriate variable scope - default to topic-level unless you need global access
* Create child agents when knowledge domains are distinct and specialized
* Write explicit orchestration instructions that clarify when to use each child agent
* Test multi-agent interactions thoroughly to ensure proper routing and context preservation
* Monitor variable values during testing to verify data flows correctly through your topics

By following these principles, you'll build sophisticated agent solutions that scale with your organization's complexity - combining conversation memory with specialized intelligence to deliver accurate, contextual, and valuable user experiences.

---
