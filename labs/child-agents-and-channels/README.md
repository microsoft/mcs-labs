# Child Agents and Channels

Extra credit. Take a Standard-harness agent further — delegate work to child agents, then publish it to the channels your users actually live in.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 25 minutes | After completing this lab, participants will be able to create and orchestrate child agents so one agent can delegate to specialists, and deploy an agent across channels including Microsoft Teams and a demo website. |

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
  - [Use Case #1: Create and Orchestrate Child Agents](#-use-case-1-create-and-orchestrate-child-agents)
  - [Use Case #2: Deploy Your Agent Across Channels](#-use-case-2-deploy-your-agent-across-channels)

---

## 🤔 Why This Matters

**An agent nobody can reach is not in production.**

The component model gets you a capable agent. Two things turn it into something an organisation actually uses: the ability to hand work to specialists rather than growing one agent forever, and a route to the surfaces where your users already work.

This is extra credit — the bootcamp covers both topics in the talk track, but the timetable does not have room for the hands-on. Do it on your own time; it is the natural next step after building the component model.

---

## 🌐 Introduction

**Child agents** let a main agent delegate a scoped job to a specialist. Rather than one agent that knows everything badly, you get a main agent that routes and specialists that are each good at one thing.

**Channels** are where the agent is published — Microsoft Teams, a website, and the other surfaces Copilot Studio supports. The same agent, reachable where the work happens.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Child agent** | A scoped specialist the main agent can hand a job to. |
| **Delegation** | Routing by description — the main agent picks the specialist from what it says it does. |
| **Channels** | The surfaces an agent is published to, without rebuilding it per surface. |
| **Publish** | Nothing reaches a channel until the agent is published; drafts stay private. |

---

## 📄 Documentation and Additional Training Links

* [Microsoft Copilot Studio documentation](https://learn.microsoft.com/microsoft-copilot-studio/)
* [Add child agents](https://learn.microsoft.com/microsoft-copilot-studio/authoring-add-child-agent)
* [Publish your agent to channels](https://learn.microsoft.com/microsoft-copilot-studio/publication-fundamentals-publish-channels)

---

## ✅ Prerequisites

- Access to Microsoft Copilot Studio with permission to create and publish agents
- An agent to build on — the one from *Standard Harness — Component Model* is ideal
- Microsoft Teams access, to verify the Teams channel

---

## 🎯 Summary of Targets

In this extra-credit lab you'll take a Standard-harness agent from working to reachable. By the end you will be able to:

- Create child agents and have a main agent delegate to them
- Explain how the main agent chooses which specialist handles a request
- Publish an agent to Microsoft Teams and to a demo website
- Describe what publishing does, and what stays private until you do

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Create and Orchestrate Child Agents](#-use-case-1-create-and-orchestrate-child-agents) | Delegate scoped work to specialists instead of growing one agent indefinitely | 13 min |
| 2 | [Deploy Your Agent Across Channels](#-use-case-2-deploy-your-agent-across-channels) | Make the agent reachable on the surfaces your users already use | 12 min |

---

## 🛠️ Instructions by Use Case

---

## 🔄 Use Case #1: Create and Orchestrate Child Agents

Build specialized child agents with focused knowledge and instructions to create modular, scalable agent architectures.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create and Orchestrate Child Agents | Build specialized sub-agents with focused expertise to create modular, scalable solutions | 13 minutes |

**Summary of tasks**

In this section, you'll learn how to create child agents, configure their specialized knowledge and instructions, set up orchestration rules in the parent agent, and test multi-agent interactions.

**Scenario:** Your Copilot Studio Assistant needs specialized expertise in prompt engineering frameworks. Instead of overloading the main agent with all knowledge, you'll create a child agent called "CARE Prompt Guidance" that specializes in the CARE framework for prompt writing. This child agent will be automatically invoked when users ask about general prompt guidance.

### Objective

Create a specialized child agent and configure the parent agent to orchestrate conversations appropriately.

---

### Step-by-step instructions

#### Create a Child Agent

1. In your Copilot Studio Assistant agent, Select  **Agents**  in the agent top navigation bar.

1. Select  **Add an agent**.

1. In the **Create a child agent** section, Select **New child agent**.

1. Enter  **CARE Prompt Guidance** in the **Name** field.

1. Input the following for the **Description**
    ```
    This agent provides information on the CARE Prompt guidance.
    ```

    > [!NOTE]
    > The description helps the parent agent understand when to route conversations to this child agent. Be specific and clear.

1. Select  **Save** to initialize the child agent.

#### Configure Child Agent Instructions

1. Once save of the child agent has completed, input the following into the **Instructions** section.
    ```
    This agent should help users with understanding information about the prompt guidance framework and how they can leverage it to make their agents better.
    ```

    > [!TIP]
    > Child agent instructions should be focused and specific to their domain of expertise. Avoid generic instructions - be precise about what this agent knows and does.

1. Select  **Save** to apply the instruction changes to the agent.

#### Add Knowledge Sources to Child Agent

1. In the child agent, scroll down to the **Knowledge** section or select **Knowledge** in the child agent left navigation. 

1. Select  **+ Add knowledge** to add a knowledge source.

1. Select **Upload files** as the knowledge source type.

1. Download the [CAREful Prompts Printable Guide (PDF)](https://media.nngroup.com/media/articles/attachments/CAREful_Prompts_-_Printable-2.pdf) and upload it to the child agent as a knowledge source.

    > [!IMPORTANT]
    > Child agents can have their own dedicated knowledge sources. This keeps knowledge organized and prevents one agent from being overloaded with unrelated content.

1. Wait for the knowledge source to be indexed.

1. Select  **Save** to finalize the child agent configuration.

#### Configure Parent Agent Orchestration

1. Go to your **parent agent** (the main Copilot Studio Assistant) by selecting **Overview** in the top navigation bar.

1. In the parent agent's **Instructions** field on the Overview page, select **Edit** in the upper right corner of the **Instructions** section.

1. Add the following orchestration instructions just before the # General Guidlines paragraph of the instructions. Notice the `(replace this text)` placeholder — you'll replace it with a direct reference to the child agent in the next step.

    ```
    # Prompt Guidance
    Use (replace this text) when asked to provide just general guidance around prompt building. Never use it when asked to analyze a prompt.
    ```

1. Select the **`(replace this text)`** placeholder in the paragraph you just added, then type `/` to open the dropdown menu. This lists your agent's available tools, topics, child agents, knowledge sources, and more. Select **CARE Prompt Guidance** from the list to create a direct reference to the child agent, replacing the placeholder text.

    > [!TIP]
    > Using `/` references in your agent instructions creates explicit links to specific items in your agent configuration. This ensures the agent knows exactly which tool, topic, or child agent you're referring to — rather than relying on plain text name matching.

    > [!IMPORTANT]
    > Orchestration instructions are critical for proper agent routing. Be explicit about WHEN to use each child agent and WHEN NOT to use them. This prevents confusion and ensures the right agent handles each request.

1. Select **Save** to apply the orchestration instructions.

#### Review Agent Relationships

1. In the parent agent, select **Agents** in the top navigation bar for the parent agent.

1. Verify that the **CARE Prompt Guidance** child agent appears in the list of available agents.

1. Check that the child agent is **Enabled** (toggle should be on).

    > [!NOTE]
    > Disabled child agents won't be invoked by the parent agent. Always verify child agents are enabled after creation.

#### Test the Child Agent

1. In the parent agent's test panel, start a new conversation.

1. Ask a question that should trigger the child agent:

    ```
    How does the CARE prompt guidance help write prompts?
    ```

1. Observe the agent's response. It should:
    - Recognize that this is a general prompt guidance question
    - Route the conversation to the "CARE Prompt Guidance" child agent
    - Provide an answer grounded in the CARE framework knowledge

1. Look for indicators in the test panel showing which agent responded (some interfaces show "Responded by: CARE Prompt Guidance" or similar).

#### Test Orchestration Logic

1. Now test the orchestration instructions by asking a question that should NOT use the child agent:

    ```
    Analyze this prompt for improvements: Write a summary of the quarterly report.
    ```

1. Verify that the parent agent uses the Prompt Analyzer tool (from the previous lab) instead of routing to the child agent.

    > [!TIP]
    > This demonstrates proper orchestration - the parent agent understands the difference between "general prompt guidance" (child agent) and "analyze a specific prompt" (tool).

#### Explore Child Agent Capabilities

1. Ask several different questions to test the child agent's knowledge:
    - "What is the CARE framework?"
    - "How do I write better prompts?"
    - "Use the CARE framework to improve this weak prompt: 'write me something about sales'."

1. Verify that the child agent consistently provides accurate answers from its knowledge source.

1. Return to the child agent's configuration and review how you could:
    - Add more knowledge sources
    - Refine instructions for better responses
    - Create additional child agents for other domains

---

### 🏅 Congratulations! You've completed Use Case 2!

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

---

---

## 🧱 Use Case #2: Deploy Your Agent Across Channels

Learn how to configure and deploy your agent to channels, understand channel-specific settings, and implement appropriate security controls.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Deploy Your Agent To Channels | Make your agent accessible via Teams and Microsoft 365 Copilot  | 12 minutes |

**Summary of tasks**

In this section, you'll learn how to navigate the Channels interface, configure your agent to deploy to Microsoft Teams and Microsoft 365 Copilot, and understand channel capabilities and limitations.

**Scenario:** Your Copilot Studio Assistant is ready for users. You need to make it available for your company's users for easy access in Microsoft Teams and Microsoft 365 Copilot where most employees spend their day. 

### Objective

Deploy your agent to Teams and Microsoft 365 Copilot channels with proper configuration and security.

---

### Step-by-step instructions

#### Navigate to Channels

1. In your Copilot Studio agent, select **Channels** in the top navigation bar.

1. Review the Channels overview page to see available channel options:
   - **Microsoft Teams**: Native Teams integration
   - **Demo website**: Test website for quick agent testing
   - **Custom website**: Embeddable web widget for your sites
   - **Mobile app**: iOS and Android integration
   - **Custom channel**: Direct Line API for custom applications
   - Additional channels may include Facebook, Slack, etc.

    > [!NOTE]
    > Available channels depend on your Copilot Studio license and environment settings. Some channels require additional configuration or premium licenses.


#### Explore Channel Capabilities

1. Review the description and capabilities of each channel type:
   - **Teams**: Full authentication, rich adaptive cards, deep Microsoft 365 integration
   - **Web**: Customizable appearance, flexible security, easy embedding
   - **Mobile**: Native app experience with push notifications
   - **Custom**: Full API control for advanced integrations

    > [!TIP]
    > Choose channels based on where your users already work. Don't force users to adopt new tools - bring the agent to their existing environment.

1. Consider the limitations of each channel:
   - Some features (like certain adaptive cards) may not work on all channels
   - Authentication requirements vary by channel
   - Customization options differ across channels

#### Deploy to Microsoft Teams and Microsoft 365 Copilot

1. Before you can deploy to a channel, you must first publish your agent.  Select **Publish** from the top right corner of the screen.  Follow the prompts.
1. Return to the Channels page and select **Teams and Microsoft 365 Copilot**.

1. Review the **Agent preview** section that shows how users will see your agent.
    - **App name**: How the agent appears in Teams
    - **App icon**: Visual branding in Teams
    - **Availability**: Who can access the agent

1. Select **Add channel** in the bottom right corner of the panel to start activation of this channel.

1. Select **Edit details** and make adjustments. For example, change the short description to something like **Assist users building agents**

1. Select **Save** to save your changes.

1. Select **Publish** to publish your agent and make it available.

1. Select **Turn on Teams** or **Enable** to activate the Teams channel.

1. Select **Availability options** and review what is available:

1. After reviewing the options select the back arrow to return to the prior panel.

1. Select **See agent in Teams**, this will load a new browser tab with the Teams web application.

1. If prompted to **Open Microsoft Teams?**, select **Cancel** and after the dialog closes select the **Use the web app instead**

1. If this is your first visit to Teams, you may be prompted with some other dialogs, after you dismiss them you may have to go back to Copilot Studio and re-select **See agent in Teams**

1. You should now see a dialog presenting your agent for you to review before you add it to your Teams session. After reviewing the details, select **Add**

1. You should next see a **Added successfully** message select **Open** to use your agent.

1. Once your agent loads, ask it a question like **How do I build a good prompt?**

1. Compare the experience between Teams and the web demo site:
    - Notice how the UI differs
    - Test the same questions on the channel

    > [!TIP]
    > Always test your agent on each deployed channel. Some features or formatting may work differently across channels.

---

### 🏅 Congratulations! You've completed Use Case 3!

---

### Test your understanding

**Key takeaways:**

* **Channels Enable Access** – Deploy to channels where your users already work to maximize adoption and minimize friction
* **Security Settings Matter** – Always configure appropriate authentication and domain restrictions to protect data and ensure compliance
* **Channel Capabilities Vary** – Test thoroughly on each channel and design agents that work within the limitations of your target platforms
* **Demo Sites Accelerate Feedback** – Use demo websites for quick testing and stakeholder review before full production deployment

**Lessons learned & troubleshooting tips:**

* If your agent doesn't appear in Teams after deployment, check with your IT admin about app approval policies
* Domain restrictions prevent unauthorized embedding - always configure allowed domains for production
* Test authentication flows on each channel to ensure proper security enforcement
* Some rich UI features may not work on all channels - design for compatibility

**Challenge: Apply this to your own use case**

* Which channels would provide the most value for your users?
* What security settings are appropriate for your agent's data sensitivity?
* How would you roll out your agent - pilot with a team first or organization-wide immediately?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of variables, child agents, and channels in Copilot Studio:

* **Variables Provide Memory** – Use topic-level variables for localized data and global variables for shared context. This creates agents that remember user information and maintain conversation continuity.
* **Scope Variables Appropriately** – Don't make everything global. Topic variables keep data organized and prevent namespace pollution while global variables enable cross-topic coordination.
* **Child Agents Enable Specialization** – Build focused child agents with dedicated knowledge and instructions rather than overloading a single agent with all content.
* **Orchestration Instructions Matter** – Clear, explicit orchestration rules in the parent agent ensure proper routing and prevent confusion between child agents.
* **Deploy Where Users Work** – Meet users in their existing environments (Teams, web, mobile) rather than forcing them to adopt new tools. This maximizes adoption and minimizes friction.
* **Security Comes First** – Always configure appropriate authentication and domain restrictions based on data sensitivity. Test security settings thoroughly before production deployment.

---

### Conclusions and recommendations

**Variables, child agents, and channels golden rules:**

* Use descriptive variable names that clearly indicate their purpose and content
* Choose the appropriate variable scope - default to topic-level unless you need global access
* Create child agents when knowledge domains are distinct and specialized
* Write explicit orchestration instructions that clarify when to use each child agent
* Deploy to channels where users already spend their time - don't ask users to go somewhere new
* Always configure security settings appropriate for your data sensitivity level
* Test multi-agent interactions and multi-channel deployment thoroughly before production rollout

By following these principles, you'll build sophisticated agent solutions that scale with your organization's complexity - combining conversation memory, specialized intelligence, and strategic deployment to deliver accurate, contextual, and valuable user experiences wherever your users need them.

---

---

## 🏆 Summary of learnings

**Delegation scales better than growth.** A main agent that routes to specialists stays comprehensible; one agent that absorbs every scenario does not.

**Descriptions do the routing.** The main agent picks a child by what that child says it does — the same lesson as tool and skill selection elsewhere in the bootcamp.

**Publishing is a deliberate act.** Until you publish, nothing you built is reachable by anyone else.

---

## 📌 Conclusions & Recommendations

**Split by ownership, not by size.** Child agents work best when each has a clear owner and a clear job, not when one agent simply got long.

**Pick channels by where the work happens.** Teams for internal, a website for customers — publishing to everything by default just widens your support surface.

**Come back to this after the component model lab.** Delegation and channels make far more sense once you have built the agent they apply to.
