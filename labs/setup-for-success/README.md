# Set yourself up for success & discover ALM best practices

Build agents with confidence. Deploy with control. Master the lifecycle of your Microsoft Copilot Studio agents with best practices.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200   | Maker   | 20 minutes | After completing this lab, participants will be able to apply Application Lifecycle Management (ALM) best practices to their Microsoft Copilot Studio solutions. They will know how to structure their work using solutions and publishers, configure environment variables and connection references for deployment readiness. |

---

## 📚 Table of Contents

- [Why Start with ALM?](#-why-start-with-alm)
- [Introduction](#-introduction)
- [Core Concepts Overview](#-core-concepts-overview)
- [Documentation and Additional Training Links](#-documentation-and-additional-training-links)
- [Prerequisites](#-prerequisites)
- [Summary of Targets](#-summary-of-targets)
- [Use Cases Covered](#-use-cases-covered)
- [Instructions by Use Case](#️-instructions-by-use-case)
  - [Use Case #1: Create a solution and custom publisher](#-use-case-1-create-a-solution-and-custom-publisher)
  - [Use Case #2: Create environment variables and connection references](#-use-case-2-create-environment-variables-and-connection-references)

---

## 🤔 Why Start with ALM?

**New to Power Platform or Copilot Studio?** You might be eager to start building agents right away, but taking a few minutes to set up Application Lifecycle Management (ALM) first will save you hours of headaches later!

Think of ALM as preparing your kitchen before cooking a complex meal:
- **Without ALM**: Ingredients scattered across counters, no recipe plan, impromptu grocery trips mid-cooking
- **With ALM**: Ingredients organized, recipe prepared, everything measured and ready

**Common beginner challenges solved by ALM:**
- "I built something great in dev, but can't easily move it to production"
- "Someone changed my agent and now it's broken - who did it and how do I fix it?"
- "I need to update my agent but I'm afraid of breaking what works"
- "My team members keep overwriting each other's changes"

**The few minutes ALM setup in this lab prevents all these problems!**

---

## 🌐 Introduction

Application Lifecycle Management (ALM) ensures that your solutions evolve safely and efficiently as they move from development to production. This lab will walk you through the foundational best practices of ALM in Microsoft Copilot Studio—from structuring your solution to managing configurations and source control.

**Real-world example:** Imagine you've built a great customer service agent in your development environment. Without proper ALM:
1. Moving to production means manually recreating all your work
2. If something breaks, you can't easily roll back to a working version
3. When multiple team members make changes, work gets overwritten

With the ALM practices in this lab, you'll avoid these pitfalls and set yourself up for success!

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Solution** | A standard way in Microsoft Power Platform to package and ship components—including Microsoft Copilot Studio agent components like topics, knowledge sources, and tools—across environments alongside flows, prompts, environment variables, connection references, and any other solution-aware component types. |
| **Publisher** | A metadata element that identifies the creator of solution components. Using a custom publisher improves traceability and supports cleaner prefixes in naming conventions. |
| **Environment** | A workspace in Power Platform where no-code, low-code, or pro-code artifacts—such as agents, flows, and data—reside. ALM best practices typically involve multiple environments (e.g., dev, test, prod) to manage lifecycle stages. For admins, environments also provide governance controls to limit what makers can do, which connectors or knowledge sources can be used, and how assets are secured and deployed. |
| **Environment variable** | A reusable setting (like a URL, API key, or ID) that can vary between environments without modifying individual components. Supports automation and portability. For secrets, use the Secret data type to retrieve values securely from Azure Key Vault. |
| **Connection reference** | An abstraction that links connectors (e.g., SharePoint, Dataverse, ServiceNow, etc.) to credentials and environment-specific settings—allowing reuse and cleaner ALM processes. |
| **Managed solution** | A read-only version of a solution used for deployment to downstream environments. Managed solutions support clean, controlled, and incremental updates, can be uninstalled, and prevent direct modifications to components in the target environment. |
| **Unmanaged solution** | Editable solution used in development. Changes can be versioned and exported for deployment. Should not be used in test or production. |
| **Solution-aware** | A component or setting that is part of a solution and can be deployed with it across environments. Not all Copilot Studio settings are solution-aware. |
| **Source control** | The practice of tracking and managing changes to your assets over time. Git integration with Azure DevOps enables auditing, collaboration, and versioning. |
| **CI/CD** | Continuous Integration / Continuous Deployment. Automates the process of testing and deploying solutions using tools like Azure DevOps pipelines or GitHub Actions. |                                                                                          

---

## 📄 Documentation and Additional Training Links

* [ALM overview - Microsoft Power Platform](https://learn.microsoft.com/power-platform/alm/alm-overview)
* [Publish and deploy your agent](https://learn.microsoft.com/copilot-studio/publish-deploy)
* [Webinar: Microsoft Copilot Studio ALM](https://aka.ms/MCSALMWebinar)
* [Environment variables in solutions](https://learn.microsoft.com/power-apps/maker/data-platform/environmentvariables)
* [Connection references in a solution](https://learn.microsoft.com/power-apps/maker/data-platform/create-connection-reference)

---

## ✅ Prerequisites

* Access to Microsoft Copilot Studio.
* A Microsoft Power Platform environment with at least an Environment Maker security role.

---

## 🎯 Summary of Targets

In this lab, you'll configure your ALM foundation for working with Microsoft Copilot Studio like a pro. By the end of the lab, you will:

* Create and configure a structured solution for your customizations.
* Set up a custom publisher to track ownership and maintain ALM hygiene.
* Add environment variables and connection references for better portability.

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Create a solution and custom publisher](#-use-case-1-create-a-solution-and-custom-publisher) | Structure your success – Group, manage, and deploy all your agent components with clarity and control. | 10 min |
| 2 | [Create environment variables and connection references](#-use-case-2-create-environment-variables-and-connection-references) | Adapt with flexibility – Environment variables future-proof your agents for seamless multi-environment deployments. Manage credentials and services cleanly across dev, test, and prod. | 10 min |

---

## 🛠️ Instructions by Use Case

## 🧱 Use Case #1: Create a solution and custom publisher

Use a structured container to group all agents components for better lifecycle management.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create a solution and custom publisher | Structure your success – Group, manage, and deploy all your agent components with clarity and control. | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to access the Solutions area of Copilot Studio, create a new solution, new publisher, and set the solution as default.

**Scenario:** Properly setup your development environment so that you can later easily package and deploy your agents to other environments.

### Objective

Set up your development environment by creating a solution and custom publisher in Microsoft Copilot Studio.

---

### Step-by-step instructions

#### Open the Solutions area

1. Go to the [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com/).

2. Confirm you are in the correct environment (top-right corner).

#### Create a solution

3. In the left navigation (under the `...` menu), select **Solutions**

    ![alt text](images/solutions.png)

4. Select **New solution**.

5. Enter a display name.

> [!TIP]
>  * Avoid names like `DEV`, `TEST`, `PROD`, `POC`, `MVP` or anything tied to a project lifecycle phase.
>  * Use a descriptive, project-based name.
>  * For example, if this is specific to this training and lab, use `Training Workshop Agents`

#### Create a publisher

6. If this is your first solution, click **+ New publisher** to create one.

> [!TIP]
>  * You may use your organization’s name.
>  * While the **Display name** may contain spaces, the **Name** can't contain special characters and spaces.
>  * Define a short prefix for use in technical names.

> [!IMPORTANT]
> Avoid using the default publisher or the default solution. Custom publishers ensure cleaner component names and better ALM hygiene.

#### Set and create

7. Check **Set as your preferred solution** (so any new component goes into it by default).
8. Click **Create**.

---

###  🏅 Congratulations! You've created your solution!

---

### Test your understanding

**Key takeaways:**

* **Solutions first** – Solutions help manage your agent and related components across environments.
* **Lifecycle readiness** – Structuring up front simplifies governance, updates, and deployment.
* **Naming matters** – Use clean, environment-agnostic names.

**Lessons learned & troubleshooting tips:**

* Avoid names like `Dev` or `Test` in your solution name—they’re misleading.
* If save fails, ensure publisher name is unique and valid.
* Keep solution names business-focused, not technical-phase focused.

**Challenge: Apply this to your own use case**

* What would you name your solution?
* How might you use solutions to organize future agent components?
* Try making another solution for a separate department or use case.

---

## 🧩 Use Case #2: Create environment variables and connection references

Use reusable variables and connection abstractions for seamless multi-environment deployments.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create environment variables and connection references | Adapt with flexibility – Environment variables future-proof your agents for seamless multi-environment deployments. Manage credentials and services cleanly across dev, test, and prod. | 10 minutes |

**Summary of tasks**

In this section, you'll learn how to create environment variables and connection references in your solution.

**Scenario:** Configure your environment by anticipating future elements that will need to be updated as your solution moves from development to production.

### Step-by-step instructions

1. Open the solution you created in Use Case #1.

2. Select **+ New**, then go to **More** and choose **Environment variable**.

![alt text](images/environment-variable-connection-reference.png)

3. In **Name**, enter: `Custom Knowledge Endpoint`

4. In **Data Type**, select **Text**.

5. Leave **Default Value** blank, but under **Current Value**, select **+ New Value**, and enter the endpoint URL found in the Lab Resources.

> [!IMPORTANT]
>  * For configuration, use the provided values in the **Lab Resources** (specific per training).

> [!TIP]
>  * Notice how, under **Advanced**, you can set whether the current value can follow through with your solution deployment, or if it should be reset each time the solution is deployed to a new environment

6. Click **Save**.

> [!TIP]
>  * Environment variables can also be of type **Secret** to retrieve secure values like API keys from Azure Key Vault at runtime.

7. In the solution, select **New**, then go to **More** and choose **Connection reference**.

8. Use the connector name, `ServiceNow`, as the name. Optionally, prefix with your project name.

> [!TIP]
> In other locales, the connector name may be localized.

9. Select the connector **ServiceNow**.

10. In the connection dropdown, choose **New connection** if none exists.

11. Log in through Power Apps in a new tab if needed, then return to Copilot Studio.

> [!IMPORTANT]
>  * For **ServiceNow** configuration values, use the provided values in the **Lab Resources** (specific per training).
>  * For **ServiceNow**'s `Instance` configuration, be sure to scroll down in the connection screen.

12. Above the **Connection** dropdown, select **Refresh** and choose the newly created connection.

> [!TIP]
>  * If the **Create** button is grayed out, it's just because you pasted the display name. Type an extra character in the display name field and remove it to be able to create. 

---

###  🏅 Congratulations! You've created environment variables and connection references!

---

### Test your understanding

* Do you understand the value of using **environment variables** instead of hardcoding values like URLs, API keys, or record IDs?
* Do you see the importance of using **descriptive, well-scoped names** for environment variables (e.g. `Base API URL`, `Support Team Email`)?
* Have you identified **which variables should change across environments** (e.g. dev, test, prod)?

**Challenge: Apply this to your own use case**

* List the environment variables your agent needs (e.g. external API base URLs, system emails, etc.).
* Define clear naming conventions to help your team manage them consistently.
* Try creating a **Secret**-type environment variable that securely references a value in Azure Key Vault (e.g. an API key or client secret).

---

</details>

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of your ALM setup in Copilot Studio:

* **Use solutions as your foundation** – Keep all your components within a solution to simplify lifecycle management and ensure clean deployment.
* **Name wisely** – Adopt a consistent naming convention and always use a custom publisher to avoid default clutter.
* **Plan for portability** – Use environment variables and connection references to ensure your agent configurations adapt across dev, test, and production.
* **Document post-deployment steps** – Track settings that aren't part of the solution (e.g., authentication, channels, sharing) so nothing is missed.
* **Leverage source control** – Use Git integration to track, audit, and collaborate—setting the stage for CI/CD without complex tooling.
* **Automate where it counts** – Consider using pipelines with Azure DevOps or GitHub for streamlined, repeatable deployments.

---

### Conclusions and recommendations

**ALM golden rules:**

* Work in the context of solutions.
* Create separate solutions only if you need to deploy components independently.
* Use a custom publisher and prefix to maintain clarity and traceability.
* Use environment variables for settings and secrets that change across environments.
* Export and deploy solutions as managed, unless you're setting up a dev environment.
* Avoid customizing outside of dev.
* Consider automating ALM for source control and CI/CD pipelines.

By following these principles, you'll establish a robust, scalable foundation for managing Copilot agents and Power Platform assets across their full lifecycle.

---
