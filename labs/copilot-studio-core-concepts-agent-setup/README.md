# Build Your First Copilot Studio Agent with Knowledge Sources

Learn how to create an intelligent AI assistant in Microsoft Copilot Studio and enhance it with custom knowledge sources for accurate, domain-specific responses.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 30 minutes | After completing this lab, participants will be able to create a new Copilot Studio agent from scratch, configure its core settings including instructions and AI model selection, and enhance agent capabilities by adding custom knowledge sources to ground responses in organizational content. |

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
  - [Use Case #1: Create and Configure Your First Agent](#-use-case-1-create-and-configure-your-first-agent)
  - [Use Case #2: Enhance Agent Intelligence with Knowledge Sources](#-use-case-2-enhance-agent-intelligence-with-knowledge-sources)

---

## 🤔 Why This Matters

**Building AI agents can feel overwhelming** - especially when you're starting from scratch.

Think of an AI agent like hiring a new team member:
- **Without proper setup**: They give generic answers, don't understand your business context, and frustrate users with irrelevant responses
- **With proper setup**: They understand your domain, provide accurate answers grounded in your documentation, and become a trusted resource for your team

**Common challenges solved by this lab:**
- "I don't know where to start with AI agent development"
- "My agent gives generic answers that don't help users"
- "I need my agent to understand our specific policies and procedures"
- "I'm not sure how to make my agent smarter without coding"

**In just 30 minutes, you'll have a working AI agent that understands your business** - no coding required.

---

## 🌐 Introduction

Microsoft Copilot Studio empowers makers to build sophisticated AI agents without writing code. By combining intuitive visual tools with powerful AI capabilities, you can create agents that understand natural language, leverage your organization's knowledge, and provide intelligent assistance to users.

**Real-world example:** A sales team needs quick access to product information and licensing details. Instead of searching through multiple documents and websites, they interact with a Copilot Studio agent that instantly provides accurate answers grounded in the latest product documentation and licensing guides. The agent understands context, references official sources, and helps sales reps focus on closing deals instead of hunting for information.

This lab takes you through the foundational steps of agent creation - from initial setup to knowledge integration - giving you the skills to build production-ready AI assistants that truly understand your business domain.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Agent Instructions** | Define your agent's personality, expertise, and behavior - these instructions guide every interaction and ensure consistent, on-brand responses that align with your business goals |
| **AI Model Selection** | Different AI models offer varying levels of capability and cost - understanding which model to use (like GPT-4) ensures optimal performance for your specific use case |
| **Knowledge Sources** | Ground your agent in factual, domain-specific content by connecting documents, websites, and files - this transforms generic AI into a specialized expert that provides accurate, verifiable answers |
| **Suggested Prompts** | Help users discover what your agent can do by providing example questions - this improves adoption and ensures users get value from their first interaction |

---

## 📄 Documentation and Additional Training Links

* [Microsoft Copilot Studio Overview](https://learn.microsoft.com/microsoft-copilot-studio/fundamentals-what-is-copilot-studio)
* [Create and configure agents](https://learn.microsoft.com/microsoft-copilot-studio/fundamentals-get-started)
* [Add knowledge sources to your agent](https://learn.microsoft.com/microsoft-copilot-studio/nlu-generative-answers-knowledge)
* [Use generative AI with knowledge sources](https://learn.microsoft.com/microsoft-copilot-studio/nlu-boost-conversations)

---

## ✅ Prerequisites

* Access to Microsoft Copilot Studio (trial or licensed environment)
* A document to upload as a knowledge source (PDF, Word, or text file) - or use the Copilot Studio Licensing Guide from Microsoft Learn
* Basic familiarity with web browsers and form filling

---

## 🎯 Summary of Targets

In this lab, you'll build a Copilot Studio assistant from the ground up and enhance it with organizational knowledge. By the end of the lab, you will:

* Create a new Copilot Studio agent with custom instructions and configuration
* Configure agent settings including AI model selection (GPT-4)
* Add and configure suggested prompts to guide user interactions
* Upload and integrate knowledge sources (documents and websites) to ground agent responses
* Test your agent with domain-specific questions to verify knowledge integration

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Create and Configure Your First Agent](#-use-case-1-create-and-configure-your-first-agent) | Build a functional AI agent with clear instructions and optimal AI model settings | 15 min |
| 2 | [Enhance Agent Intelligence with Knowledge Sources](#-use-case-2-enhance-agent-intelligence-with-knowledge-sources) | Transform generic AI into a domain expert by grounding responses in your organization's content | 15 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Create and Configure Your First Agent

Build your first Copilot Studio agent with custom instructions, suggested prompts, and AI model configuration.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create and Configure Your First Agent | Build a functional AI agent with clear instructions and optimal AI model settings | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to create a new agent, configure its instructions and behavior, add suggested prompts, and select the appropriate AI model.

**Scenario:** You're building a "Copilot Studio Assistant" to help internal teams learn about Copilot Studio features, write effective prompts, and navigate the platform. This agent will serve as a learning companion grounded in official Microsoft documentation.

### Objective

Create a fully configured Copilot Studio agent with clear instructions, suggested prompts, and GPT-4 model selection.

---

### Step-by-step instructions

#### Create Your Agent

1. Navigate to [Microsoft Copilot Studio](https://copilotstudio.microsoft.com) and sign in with your credentials.

2. Click **Create** in the left navigation menu, then select **New agent**.

3. In the agent creation form, provide the following information:

```
Provide information and guidance on how to use Copilot Studio and prompt engineering.
```

4. Set the agent name:

```
Copilot Studio Assistant
```

5. Add detailed instructions for the agent:

```
You should help users write prompts, create PowerFX formulas, and with navigating Copilot Studio features.
```

6. Add a knowledge source URL (we'll add more knowledge in Use Case #2):

```
https://learn.microsoft.com
```

7. Click **Create** to initialize your agent.

> [!TIP]
> Clear, specific instructions help your agent understand its role and provide consistent responses. Think of instructions as the agent's job description.

#### Configure Agent Settings

8. Once your agent is created, click **Instructions** in the left panel to review the instructions you provided during setup.

9. Review how your instructions appear in the agent configuration. These instructions guide every response the agent provides.

10. Click **Knowledge** in the left panel to see the Microsoft Learn website you added as a knowledge source.

> [!NOTE]
> Knowledge sources are indexed and used by the agent to ground responses in factual content. The indexing process may take a few minutes.

11. Click **Suggested prompts** in the left panel to view default prompts. These help users understand what questions they can ask.

#### Select the AI Model

12. Navigate to **Settings** in the top navigation bar.

13. Find the **AI Model** section in the settings panel.

14. Change the model from the default to **GPT-4.1** (or the latest GPT-4 version available).

> [!IMPORTANT]
> GPT-4 models provide superior reasoning and understanding compared to earlier models. Choose GPT-4 for production scenarios where accuracy and quality matter most.

15. Click **Save** to apply the model change.

#### Test Your Agent

16. In the test panel on the right side of the screen, enter the following question:

```
How do I begin using Copilot Studio?
```

17. Review the agent's response. Notice how it references the Microsoft Learn knowledge source you provided.

18. Observe the response quality and how the agent leverages its instructions to provide helpful, contextual guidance.

---

###  🏅 Congratulations! You've completed Use Case 1!

---

### Test your understanding

**Key takeaways:**

* **Agent Instructions Define Behavior** – Clear, specific instructions act as your agent's job description and guide every interaction
* **AI Model Selection Impacts Quality** – GPT-4 models offer superior reasoning and accuracy for production scenarios
* **Knowledge Sources Ground Responses** – Connecting external content (like Microsoft Learn) helps agents provide factual, verifiable answers

**Lessons learned & troubleshooting tips:**

* If your agent gives generic responses, review and refine your instructions to be more specific about its role and expertise
* Knowledge source indexing can take 2-5 minutes - wait before testing knowledge-specific questions
* Suggested prompts improve user adoption - customize them to match your most common use cases

**Challenge: Apply this to your own use case**

* What instructions would you write for an agent in your department?
* What AI model would you choose for a high-stakes customer-facing scenario?
* What knowledge sources exist in your organization that could enhance an agent?

---

---

## 🔄 Use Case #2: Enhance Agent Intelligence with Knowledge Sources

Upload custom documents and content to transform your agent from a generic assistant into a domain-specific expert.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Enhance Agent Intelligence with Knowledge Sources | Transform generic AI into a domain expert by grounding responses in your organization's content | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to upload documents as knowledge sources and test how your agent uses that knowledge to answer domain-specific questions.

**Scenario:** Your Copilot Studio Assistant needs to answer questions about Copilot Studio licensing options, including pay-as-you-go pricing. You'll upload the official licensing guide so the agent can provide accurate, up-to-date answers grounded in Microsoft documentation.

### Objective

Add a document knowledge source to your agent and verify that it accurately answers questions using the uploaded content.

---

### Step-by-step instructions

#### Add Document Knowledge Source

1. In your Copilot Studio agent, click **Knowledge** in the left navigation panel.

2. Click **Add knowledge** or the **+ Add** button to add a new knowledge source.

3. Select **Upload files** from the knowledge source options.

4. Upload the **Copilot Studio Licensing Guide** (if you have a copy) or any relevant PDF document about Copilot Studio or a topic of your choice.

> [!TIP]
> You can upload multiple file types including PDF, Word documents (.docx), PowerPoint (.pptx), and text files. Each file can be up to 50 MB.

5. Wait for the file to upload and process. You'll see a status indicator showing the indexing progress.

> [!NOTE]
> Knowledge indexing typically takes 2-5 minutes depending on the document size. Larger documents or multiple files may take longer.

#### Configure Knowledge Source Settings

6. Once the document is indexed, click on the knowledge source to view its details.

7. Review the **Name** and **Description** fields. Update if needed to make the source easily identifiable.

8. Ensure the knowledge source is **Enabled** (toggle should be on).

> [!IMPORTANT]
> Disabled knowledge sources won't be used in agent responses. Always verify your knowledge sources are enabled after adding them.

#### Test Knowledge Integration

9. In the test panel on the right, click **Refresh** or start a new conversation to ensure the agent uses the latest knowledge.

10. Enter the following question to test the newly added knowledge:

```
How do I license Copilot Studio with pay as you go?
```

11. Review the agent's response. It should now reference the specific licensing information from the uploaded document.

12. Look for citations or references in the response that indicate which knowledge source was used.

> [!TIP]
> Agents typically show citations at the bottom of responses, indicating which knowledge sources contributed to the answer. This helps users verify information accuracy.

#### Add Additional Knowledge Sources

13. Return to the **Knowledge** panel and click **+ Add** again.

14. This time, select **Public website** as the knowledge source type.

15. Add additional relevant URLs if desired:

```
https://www.nngroup.com/articles/careful-prompts/
```

16. Wait for the website content to be indexed.

17. Test the agent with a question that would be answered by this new knowledge source.

---

###  🏅 Congratulations! You've completed Use Case 2!

---

### Test your understanding

* How does adding a document knowledge source change the agent's responses?
* Why is it important to wait for knowledge indexing to complete before testing?
* What types of content make good knowledge sources for agents?

**Challenge: Apply this to your own use case**

* What documents exist in your organization that would make valuable knowledge sources?
* How could you organize multiple knowledge sources for optimal agent performance?
* What questions would your users ask that could be answered from your documents?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of your Copilot Studio agents:

* **Start with Clear Instructions** – Well-defined agent instructions act as the foundation for all interactions. Take time to articulate the agent's role, expertise, and tone before launching.
* **Choose the Right AI Model** – GPT-4 models provide superior quality and reasoning for production scenarios. Balance capability with cost based on your use case.
* **Ground Responses in Knowledge** – Generic AI responses lack credibility. Always connect agents to authoritative knowledge sources to provide accurate, verifiable answers.
* **Test Thoroughly** – Test your agent with realistic user questions before deployment. Verify that knowledge sources are properly indexed and responses meet quality standards.
* **Iterate Based on Feedback** – Monitor agent performance and user feedback. Continuously refine instructions and knowledge sources to improve response quality.

---

### Conclusions and recommendations

**Copilot Studio agent building golden rules:**

* Always define clear, specific instructions that describe the agent's role and expertise
* Select GPT-4 models for scenarios where accuracy and quality matter most
* Upload multiple knowledge sources to cover different aspects of your domain
* Wait for knowledge indexing to complete before testing knowledge-specific questions
* Use suggested prompts to guide users toward valuable interactions
* Regularly review and update knowledge sources to keep agent responses current

By following these principles, you'll build AI agents that provide real value to your organization - transforming information access from a time-consuming search process into instant, intelligent assistance that empowers your users and drives productivity.

---
