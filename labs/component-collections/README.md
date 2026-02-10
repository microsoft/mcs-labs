# Using Component Collections in Copilot Studio

Learn how to create, share, and manage reusable component collections to package topics and knowledge across multiple agents in Copilot Studio.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 300 | Maker | 30 minutes | After completing this lab, participants will be able to create component collections that package topics and knowledge into reusable bundles, share component collections across multiple agents, manage collection ownership with primary agent settings, and understand how component collections integrate with Power Platform solutions. |

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
  - [Use Case #1: Create an Agent and Build a Component Collection](#-use-case-1-create-an-agent-and-build-a-component-collection)
  - [Use Case #2: Share Component Collections Across Agents](#-use-case-2-share-component-collections-across-agents)
  - [Use Case #3: Manage Component Collections](#-use-case-3-manage-component-collections)

---

## 🤔 Why This Matters

**Makers and Architects** - Ever built a great topic or knowledge source in one agent and wished you could easily reuse it in another without duplicating work?

Think of component collections like shared libraries in software development:
- **Without Component Collections**: You manually recreate topics and knowledge in every agent that needs them, leading to duplicated effort, inconsistencies, and maintenance headaches when something needs to change
- **With Component Collections**: You package topics and knowledge into reusable bundles that can be shared across agents. Edit once, and changes automatically sync everywhere - keeping all your agents consistent and up to date

**Common challenges solved by this lab:**
- "I have the same topic in multiple agents and keeping them in sync is painful"
- "I want to share approved components with other makers without giving them full access to my agent"
- "I need to control which agents can use a shared component to prevent unauthorized reuse"
- "I want to package and distribute standard components across my organization"

**In 30 minutes, you'll learn how to create, share, and manage component collections - giving you a powerful tool for building scalable, maintainable agent architectures.**

---

## 🌐 Introduction

As organizations build more agents in Copilot Studio, the need to share and reuse components across agents becomes critical. Component collections solve this by allowing you to package topics, knowledge sources, and other components into reusable bundles that can be installed in multiple agents. When you update a component in one place, the change is reflected everywhere it is used.

**Real-world example:** A travel company has multiple agents - one for customer support, one for internal sales, and one for partner inquiries. All three need a "Request a travel brochure" topic and access to the same travel website knowledge. Instead of building and maintaining these independently in each agent, the team creates a "Travel Tools" component collection. When the brochure request process changes, they update the topic once, and all three agents automatically get the updated version.

This lab teaches you how to create component collections, share them across agents, and manage ownership and access - essential skills for scaling your Copilot Studio deployments.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Component Collections** | Reusable bundles that package topics, knowledge sources, and other components for sharing across multiple agents |
| **Primary Agent** | The designated owner of a component collection - when set, only that agent can use the collection, preventing unauthorized reuse |
| **Connected Agents** | The list of agents that have a component collection installed, allowing you to manage which agents share components |
| **Solution Awareness** | Component collections are Power Platform solution-aware, enabling ALM practices like packaging multiple collections for deployment across environments |
| **Shared Editing** | Changes made to a component in any connected agent are automatically reflected in all other agents that use the same collection |

---

## 📄 Documentation and Additional Training Links

* [Component collections overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/component-collections)
* [Create and manage component collections](https://learn.microsoft.com/en-us/microsoft-copilot-studio/manage-component-collections)

---

## ✅ Prerequisites

- Access to Microsoft Copilot Studio
- Permissions to create agents and modify settings in your environment

---

## 🎯 Summary of Targets

In this lab, you'll create a component collection from an existing agent and learn how to share and manage it across multiple agents. By the end of the lab, you will:

- Create an agent from a template and build a custom topic using AI-assisted authoring
- Package topics and knowledge into a reusable component collection
- Add a component collection to a different agent and verify shared access
- Edit a shared component and confirm changes sync across agents
- Manage component collection ownership by setting a primary agent
- Understand how component collections integrate with Power Platform solutions

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Create an Agent and Build a Component Collection](#-use-case-1-create-an-agent-and-build-a-component-collection) | Package topics and knowledge into a reusable component collection | 10 min |
| 2 | [Share Component Collections Across Agents](#-use-case-2-share-component-collections-across-agents) | Share and edit components across multiple agents with automatic sync | 10 min |
| 3 | [Manage Component Collections](#-use-case-3-manage-component-collections) | Control access, set primary agents, and explore solution awareness | 10 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Create an Agent and Build a Component Collection

Create an agent from a template, build a custom topic, and package it with knowledge into a reusable component collection.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create an Agent and Build a Component Collection | Package topics and knowledge into a reusable component collection | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to create an agent from a template, use AI-assisted authoring to build a custom topic, and then package that topic along with a knowledge source into a component collection.

**Scenario:** Your travel company needs a reusable set of travel-related tools - including a brochure request topic and travel website knowledge - that can be shared across multiple agents serving different audiences.

### Objective

Create an agent, build a custom topic, and package components into a reusable component collection.

---

### Step-by-step instructions

#### Create the Safe Travels Agent

1. Navigate to the Copilot Studio home page at https://copilotstudio.microsoft.com.

2. Click **Agents** on the left-hand menu.

3. Scroll down to the **Start with an agent template** section.

4. Select the **Safe Travels** template.

5. Click **Create** to make the agent.

#### Create a Sample Topic

6. Once your agent is provisioned, scroll down to the **Topics** overview menu.

7. Click **Add a Topic**.

8. Enter the following into the **Name your topic** field:

```
Request a travel brochure
```

9. Enter the following into the **Create a topic to...** field:

```
Let a user request a brochure by providing details by asking them if they want it via mail or email. If they select email collect their email address, but if they say via mail then collect their street address including city, state, and postal code. Always collect their first and last name and telephone number.
```

10. Click **Create**.

11. Notice that Copilot Studio has created a topic that allows the user to request a brochure, complete with branching logic for mail vs. email delivery.

12. Click **Save** to save the topic.

#### Create a Component Collection

13. Click **Settings** (in the upper right-hand corner).

14. In the left-hand navigation, click **Component Collections**.

15. Click **Create** on the Create a component collection screen.

16. Enter the following into the **Name** field:

```
Travel Tools
```

17. Enter the following into the **Description** field:

```
These are tools that assist with travel related scenarios.
```

18. Leave the **Solution** field blank.

> [!NOTE]
> If the Solution field is left blank, Copilot Studio will automatically create a new solution for you. You can also select an existing solution if you want to group multiple component collections together.

19. Click **Next**.

20. Select your **Request a travel brochure** topic and the **US Travel Website** knowledge item, then click **Next**.

21. On the **Review contents** screen, click **Create**.

22. You will now see that you have created your first component collection called **Travel Tools**.

23. Close the Settings menu by clicking the **X** in the upper right-hand corner.

24. Click **Topics** in the top menu.

25. Notice the icon at the far end of the row where it says **Request a travel brochure** - this icon indicates that the topic is part of a component collection.

---

### 🏅 Congratulations! You've completed Use Case #1!

---

### Test your understanding

**Key takeaways:**

* **AI-Assisted Topic Creation** - Copilot Studio can generate complete topics with branching logic from a natural language description, saving significant development time
* **Component Collections Bundle Components** - You can package topics and knowledge sources together into a named, reusable collection
* **Solution Awareness** - Component collections automatically create or integrate with Power Platform solutions, enabling proper ALM practices

**Lessons learned & troubleshooting tips:**

* Always save your topic before creating a component collection that includes it
* Use descriptive names and descriptions for component collections so other makers can understand their purpose
* The component collection icon on topics makes it easy to identify which topics are shared

**Challenge: Apply this to your own use case**

* What topics and knowledge in your agents would benefit from being packaged as reusable components?
* How would you name and organize your component collections for discoverability?

---

---

## 🔄 Use Case #2: Share Component Collections Across Agents

Add a component collection to a new agent and verify that shared edits sync automatically across all connected agents.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Share Component Collections Across Agents | Share and edit components across multiple agents with automatic sync | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to create a new blank agent, install an existing component collection into it, edit a shared topic, and verify that changes sync back to the original agent.

**Scenario:** Your organization is building a second agent that also needs the travel brochure request capability and travel website knowledge. Instead of rebuilding these from scratch, you'll install the existing Travel Tools component collection.

### Objective

Install a component collection in a new agent and verify that shared editing works across connected agents.

---

### Step-by-step instructions

#### Add the Component Collection to a New Agent

1. Click **Agents** on the left-hand navigation menu.

2. Click the **Create blank agent** button in the upper right-hand corner.

3. This will create a blank agent. Wait for it to be provisioned.

4. Once provisioned, go to **Settings** (in the upper right-hand corner).

5. Click **Component collections** in the left-hand navigation.

6. In the **Manage component collections** menu, select the **Available** tab.

7. Hover over the **Travel Tools** item in the list, click the **...** menu, and select **Add to agent**.

8. This adds the Travel Tools component collection to your new agent.

9. Navigate to the **Installed** tab in the menu.

10. Notice that **Travel Tools** is now listed as installed in both your new agent and the Safe Travels agent.

11. Close the Settings menu by clicking the **X** in the upper right-hand corner.

12. Notice that you now have the knowledge and topic from Safe Travels available in your new agent as well.

#### Edit a Shared Component

13. Open the **Request a travel brochure** topic.

14. Add a **Message** node to the end of the topic by clicking the **+** at the very bottom and selecting **Send a message**.

15. Enter the following text into the message:

```
Your request for a brochure has been submitted.
```

16. Click **Save**.

#### Verify Changes Sync Across Agents

17. In the **Agents** menu on the left-hand navigation, navigate back to the **Safe Travels** agent.

18. Navigate to the **Request a travel brochure** topic and click on it to open it.

19. You may need to refresh your browser, but you will see that the edit you made in the other agent is now reflected here as well.

> [!IMPORTANT]
> This is the key value of component collections - changes made in any connected agent are automatically synced to all other agents that share the same collection. This eliminates the need to manually update components in multiple places.

---

### 🏅 Congratulations! You've completed Use Case #2!

---

### Test your understanding

**Key takeaways:**

* **Install from Available** - The Available tab shows component collections in your environment that can be added to your agent
* **Shared Editing** - Editing a component in any connected agent updates it everywhere the collection is installed
* **No Duplication** - Component collections eliminate the need to recreate topics and knowledge in each agent

**Lessons learned & troubleshooting tips:**

* If you don't see changes reflected immediately, try refreshing your browser
* The Installed tab shows which agents share a component collection, helping you understand the impact of changes
* Be careful when editing shared components - your changes will affect all connected agents

**Challenge: Apply this to your own use case**

* Which of your existing agents share common topics or knowledge that could benefit from component collections?
* How would you coordinate editing shared components across a team of makers?

---

---

## 🧱 Use Case #3: Manage Component Collections

Explore component collection details, control access by setting a primary agent, and understand solution awareness for ALM practices.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Manage Component Collections | Control access, set primary agents, and explore solution awareness | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to view component collection details, add and disconnect agents, set a primary agent to restrict usage to a single agent, and explore how component collections integrate with Power Platform solutions.

**Scenario:** You need to manage which agents can use your component collections. Some collections should be widely shared, while others should be restricted to a single agent to prevent unauthorized reuse.

### Objective

Manage component collection access, set a primary agent, and explore solution integration.

---

### Step-by-step instructions

#### View Component Collection Details

1. In the left-hand navigation menu, click the **...** button and select **Component collections**.

2. In the list, click on **Office Space Entities**.

3. Review the details about the Office Space Entities component collection, including what is included in it (2 different Entities).

#### Add an Agent to a Component Collection

4. In the **Connected agents** section in the upper right, select **Add agent**.

5. Select the **Safe Travels** agent and click **Add** to connect it to this component collection.

6. In the **Agents** navigation menu on the left, go to the **Safe Travels** agent.

7. Go to **Settings**.

8. Go to **Topics** on the top menu and then select **Request Product Info**.

9. Notice that you can't make any changes as the component collection that installed it is managed.

> [!NOTE]
> Managed component collections are read-only in the consuming agent. Only the maker who owns the collection can edit its contents. This protects shared components from unintended modifications.

#### Set a Primary Agent

10. Click the **...** in the left-hand navigation menu and select **Component collections**.

11. Select **Travel Tools**.

12. In the **Connected agents** section on the upper right-hand side, click the **...** next to any agents other than the Safe Travels agent and click **Disconnect from agent** until only the Safe Travels agent is left in the list.

13. Once you have only Safe Travels in the list, click the **...** next to it and select **Set as primary agent**.

14. You will now see that Safe Travels shows as the **Primary agent** and that **Add agent** is greyed out. This means the component collection can only be used by this single agent in your environment.

> [!TIP]
> Setting a primary agent is useful when you want to make components created by others available to only one application. It allows you to hand off the development and release of a component without the worry that other agents will use the collection.

#### Explore Solution Awareness

15. In the **Details** section, click **View Solution** (Travel Tools Solution).

16. This will let you inspect the details of the solution in Power Platform, as component collections are solution-aware.

> [!NOTE]
> Multiple component collections can be placed in the same solution. This allows you to package groups of collections for common deployment to an environment. This is commonly done for corporate standards and organizational templates.

---

### 🏅 Congratulations! You've completed Use Case #3!

---

### Test your understanding

* What is the difference between a managed and unmanaged component collection?
* Why would you set a primary agent on a component collection?
* How does solution awareness help with deploying component collections across environments?

**Challenge: Apply this to your own use case**

* Which of your component collections should be restricted to a single agent?
* How would you organize component collections into solutions for your organization?
* What governance process would you establish for managing shared components?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting - so let's put your skills to the test.

To maximize the impact of component collections in Copilot Studio:

* **Package for Reuse** - Group related topics and knowledge into component collections whenever multiple agents need the same capabilities. This eliminates duplication and ensures consistency.
* **Edit Once, Update Everywhere** - Changes to a shared component automatically sync across all connected agents. Use this to your advantage for centralized maintenance.
* **Control Access with Primary Agents** - Use the primary agent setting to restrict a component collection to a single agent when you need to prevent unauthorized reuse.
* **Leverage Solution Awareness** - Component collections integrate with Power Platform solutions, enabling proper ALM practices for packaging and deploying components across environments.
* **Name and Describe Clearly** - Use descriptive names and descriptions so other makers in your organization can easily discover and understand available component collections.

---

### Conclusions and recommendations

**Component collections golden rules:**

* Package related topics and knowledge together - don't create one collection per component
* Always provide a clear description so other makers understand the purpose and contents
* Be careful when editing shared components - changes affect all connected agents
* Use primary agent settings for components that should be exclusive to one agent
* Place related component collections in the same solution for streamlined deployment
* Establish a governance process for who can create, edit, and manage shared collections

By following these principles, you'll build a scalable, maintainable agent architecture where shared capabilities are easy to create, distribute, and manage across your entire Copilot Studio deployment.

---
