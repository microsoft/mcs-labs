# M365 Copilot and Frontier Agents

Use the out-of-the-box frontier agents in Microsoft 365 Copilot — Researcher and Analyst — to get real analytical work out of a complex business document without building anything.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 100 | Business User | 30 minutes | After completing this lab, participants will be able to use the Researcher frontier agent to synthesize insights across a multi-section business report, and the Analyst frontier agent to perform NPV and IRR financial modelling on the same source document — understanding what Microsoft 365 Copilot delivers before any agent is built. |

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
  - [Use Case #1: Deep analysis with the Researcher agent](#-use-case-1-deep-analysis-with-the-researcher-agent)
  - [Use Case #2: Financial modeling with the Analyst agent](#-use-case-2-financial-modeling-with-the-analyst-agent)

---

## 🤔 Why This Matters

**Some capability is commodity. Consume it.**

Researcher and Analyst are reasoning agents Microsoft builds, hosts and maintains. They arrive with the licence, they improve without you doing anything, and there is no environment, no solution and no lifecycle to own. For the work they do well, that is a genuinely better deal than building — not because building is wrong, but because there is nothing left to gain from it.

Building is the right answer the moment you need something the commodity does not offer: your own grounding, a controlled process, a specific output format, or an action taken in a system of record. That is most of what the rest of this bootcamp teaches.

The skill is telling the two apart, and that starts with knowing what you already have.

## 🌐 Introduction

Microsoft 365 Copilot ships with frontier agents: specialised reasoning agents available to licensed users with nothing to deploy. Two of them do analytical heavy lifting.

**Researcher** performs multi-step research — reading long documents, reasoning across sections, and producing a structured synthesis with its work shown. **Analyst** is quantitative: it extracts figures from a document and runs real financial modelling, including calculations the source never contained.

In this lab you give both agents the same document — an annual hotel performance report — and see how differently each extracts value from it.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Frontier agents** | Microsoft-built reasoning agents in Microsoft 365 Copilot. No authoring, no deployment, available by licence. |
| **Researcher** | Multi-step research and synthesis across long or complex source material, with its reasoning visible. |
| **Analyst** | Quantitative analysis — extracts data and computes new results such as NPV and IRR that the source does not contain. |
| **Reasoning time** | These agents think for longer than chat. A slower answer is the feature, not a fault. |
| **The build/buy line** | If a frontier agent already does the job, building a custom agent is a cost with no return. |

---

## 📄 Documentation and Additional Training Links

* [Microsoft 365 Copilot documentation](https://learn.microsoft.com/microsoft-365-copilot/)
* [Researcher and Analyst agents](https://learn.microsoft.com/microsoft-365-copilot/extensibility/)
* [Microsoft 365 Copilot Chat](https://learn.microsoft.com/microsoft-365-copilot/microsoft-365-copilot-chat)

---

## ✅ Prerequisites

- A Microsoft 365 account with a Microsoft 365 Copilot licence
- Access to Microsoft 365 Copilot with the Researcher and Analyst agents enabled
- Download the sample report PDF (used by both use cases): [Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)

---

## 🎯 Summary of Targets

In this lab you'll establish what Microsoft 365 Copilot delivers before anything is built. By the end you will be able to:

- Run the **Researcher** agent against a long, multi-section business document and read its synthesis
- Use **Analyst** to compute NPV, IRR and investment prioritisation from figures inside a PDF
- Recognise the difference between conversational chat and an agent that reasons over several steps
- Judge when a frontier agent is sufficient and a custom agent would be wasted effort

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Deep analysis with the Researcher agent](#-use-case-1-deep-analysis-with-the-researcher-agent) | Use the Researcher frontier agent to synthesize insights across a complex multi-section business report | 5 min |
| 2 | [Financial modeling with the Analyst agent](#-use-case-2-financial-modeling-with-the-analyst-agent) | Use the Analyst frontier agent to perform NPV/IRR financial modeling and investment prioritization from document data | 5 min |

---

## 🛠️ Instructions by Use Case

---

## 🔬 Use Case #1: Deep analysis with the Researcher agent

Leverage the Researcher frontier agent in Microsoft 365 Copilot to perform deep, multi-section analysis of a complex business document — synthesizing insights that would take a human analyst hours to compile manually.

| Use case                                    | Value added                                                                                         | Estimated effort |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| Deep analysis with the Researcher agent     | Use the Researcher frontier agent to synthesize strategic insights across a multi-section report     | 5 minutes        |

**Summary of tasks**

In this section, you'll upload a sample hotel performance report to the Researcher agent and use two carefully crafted prompts that require the agent to reason across multiple sections, tables, and data points simultaneously. You'll observe how Researcher synthesizes information that spans financials, operations, guest satisfaction, and competitive benchmarking into cohesive executive-level analysis.

**Scenario:** You're a regional vice president reviewing the annual performance report for the Contoso Grand Hotel & Resort. Rather than reading all 18 sections yourself, you want to use the Researcher agent to quickly identify the most urgent operational issues and verify that the report's recommendations fully cover all identified problems.

### Objective

Use the Researcher agent to perform two deep-analysis tasks on a complex PDF document, demonstrating its ability to reason across multiple sections and synthesize findings.

---

### Step-by-step instructions

#### Download the sample report

1. If you haven't already, download the sample report PDF that you'll use for this exercise and the next:

   **[Download: Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)**

> [!IMPORTANT]
> Save this file to a location you can easily find (e.g., your Desktop or Downloads folder). You will need to upload it in the next step. This is a fictional ~20-page report containing tables, charts, financial data, and operational metrics across 18 sections.

#### Open the Researcher agent

2. Navigate to [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?auth=2&home=1).

3. In the **left navigation pane**, look for the **Researcher** agent — Microsoft pins it there by default (it can't be unpinned). You can also find it by:
   - Selecting the agent picker (if available) and choosing **Researcher**
   - Or typing `@Researcher` in the chat input area

> [!TIP]
> The Researcher agent is one of Microsoft's **frontier agents** — purpose-built AI agents that use advanced reasoning models. Researcher excels at deep document analysis, cross-referencing multiple sections, and synthesizing complex information. It's available to users with a Microsoft 365 Copilot license.

4. Upload the **Contoso_Grand_Hotel_Performance_Report.pdf** by selecting **Add and manage sources** (the **+** icon) in the chat input area, choosing **Upload images and files**, and selecting the file from your local machine.

#### Prompt 1: Executive briefing with root-cause analysis

5. Once the file is uploaded, copy and paste the following prompt and select **Send**:

```text
Create an executive briefing for the GM that summarizes the five most urgent operational issues, their root causes, financial impact, and recommended fixes — all sourced from this report.
```

> [!NOTE]
> Before it starts, the Researcher agent may ask a clarifying question and offer to **choose a report length** (e.g., Short or Long). Selecting a length alone does not begin generation — reply (for example, "go ahead") or answer its question to start the research. Researcher then shows a visible **Research Plan** and **Thought process** as it works.

6. **Observe** how the Researcher agent:
   - Identifies issues across multiple sections (housekeeping, WiFi, HVAC, F&B margins, elevator maintenance)
   - Traces each issue back to its root cause using data from different parts of the report
   - Quantifies the financial impact by pulling revenue, cost, and complaint data from various tables
   - Maps each issue to specific recommendations from Section 16
   - Produces a structured, executive-ready summary

> [!NOTE]
> This prompt is powerful because it requires **cross-section synthesis** — the Researcher must connect data from the occupancy analysis (Section 3), housekeeping operations (Section 6), customer satisfaction scores (Section 8), online reviews (Section 9), maintenance logs (Section 12), and the recommendations (Section 16). No single section of the report contains the full answer.

#### Prompt 2: Gap analysis — problems vs. recommendations

7. In the **same conversation** (to maintain context), copy and paste this follow-up prompt and select **Send**:

```text
Identify every metric in this report that is trending in the wrong direction or below target. For each one, trace the root cause and map it to a specific recommendation. Are there any gaps where a problem exists but no recommendation addresses it?
```

8. **Observe** how the Researcher agent:
   - Systematically scans every KPI table, satisfaction score, and operational metric in the report
   - Identifies metrics that are below target (e.g., HK SLA compliance at 77% vs. 90% target, WiFi satisfaction at 3.60 vs. 4.0 benchmark)
   - Identifies metrics trending negatively (e.g., F&B margins, linen costs, parking revenue)
   - Maps each problem to a specific recommendation (R1–R10)
   - Critically evaluates whether any gaps exist where a problem is documented but no recommendation addresses it

> [!TIP]
> This is the kind of analysis that demonstrates the true power of the Researcher agent. A human reviewer might miss connections between a declining metric buried in Appendix B and a recommendation in Section 16. Researcher performs an **exhaustive cross-reference** across the entire document. Try asking follow-up questions like "What's the strongest counterargument to your top recommendation?" to see how Researcher handles critical thinking.

---

### 🏅 Congratulations! You've used the Researcher agent for deep document analysis!

---

### Test your understanding

**Key takeaways:**

- **Researcher excels at synthesis** — It connects information across multiple tables, sections, and data points that would be tedious to cross-reference manually
- **Prompt design matters** — Asking for "root causes" and "gap analysis" forces Researcher to reason deeply rather than simply summarize
- **Follow-up prompts leverage context** — The second prompt builds on the first, allowing Researcher to refine and extend its analysis
- **Frontier agents are purpose-built** — Researcher uses advanced reasoning models optimized for deep analysis, unlike general chat which is optimized for conversational responses

**Challenge: Apply this to your own use case**

- What complex reports or documents does your team review regularly that could benefit from Researcher analysis?
- What cross-functional insights might Researcher uncover that individual department reviews miss?
- How could you use Researcher to prepare for board meetings or executive reviews?

---

---

## 📈 Use Case #2: Financial modeling with the Analyst agent

Use the Analyst frontier agent to extract data from the same hotel performance report and perform rigorous financial analysis — computing NPV, IRR, and investment prioritization that goes beyond what the original report provides.

| Use case                                       | Value added                                                                                              | Estimated effort |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| Financial modeling with the Analyst agent      | Use the Analyst frontier agent to compute NPV, IRR, and rank capital investments by financial merit      | 5 minutes        |

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

3. Upload the **Contoso_Grand_Hotel_Performance_Report.pdf** by selecting **Add and manage sources** (the **+** icon), choosing **Upload images and files**, and selecting the same file you downloaded earlier.

> [!NOTE]
> You're using the same PDF from Use Case #1, but with a completely different agent. This demonstrates how different frontier agents can extract different types of value from the same source document.

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

> [!IMPORTANT]
> The report only includes **simple payback periods** (which ignore the time value of money). The Analyst agent produces **NPV and IRR** — the gold-standard financial metrics that CFOs actually use to evaluate capital projects. This is a powerful example of how the Analyst agent can *elevate* analysis beyond the source material.

> [!NOTE]
> The Analyst runs real code to extract and model the data, so this can take a few minutes (often 40–50 reasoning steps). Its extraction is **non-deterministic**: occasionally it will try to OCR the PDF, report that it "can't read Section 16," and ask you to paste a screenshot or table. If that happens, **start a new Analyst chat, re-attach the PDF, and resend the prompt** — the recommendation data in Section 16 is machine-readable and the analysis normally succeeds on a retry.

#### Explore follow-up analysis (optional)

6. If time permits, try one or both of these follow-up prompts to explore Analyst's capabilities further:

```text
Now create a chart showing NPV vs. Investment Cost for all 10 recommendations, with bubble size representing IRR.
```

```text
Which combination of recommendations gives the highest total NPV while staying under a $1.5M total budget constraint?
```

> [!TIP]
> The second follow-up prompt is a **knapsack optimization problem** — the Analyst agent must find the combination of investments that maximizes value within a budget constraint. This is a sophisticated analytical task that would typically require a spreadsheet model to solve manually. It makes for a compelling demonstration of the Analyst agent's capabilities.

---

### 🏅 Congratulations! You've used the Analyst agent for financial modeling!

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
- How could you combine Researcher (for strategic context) and Analyst (for financial modeling) to prepare a comprehensive investment recommendation?

---

---

## 🏆 Summary of learnings

Two agents, one document, two different kinds of value — and nothing built, deployed or maintained.

**Commodity capability arrives ready.** Researcher and Analyst needed no authoring and no environment. Microsoft owns their upkeep, and they get better without a release on your side.

**Reasoning agents are not chat.** Both took longer than a chat reply because both did more — reading the whole document, working through it in steps, and showing that work. Speed is the wrong measure for this class of agent.

**The agent you pick changes the answer.** Researcher synthesised the narrative; Analyst produced numbers the report never contained. Same source, different value.

## 📌 Conclusions & Recommendations

**Check the commodity first.** Before scoping anything, ask what Microsoft 365 Copilot already does with the same material. When the answer is good enough, consuming it costs nothing to run and nothing to maintain.

**Build when you need what the commodity cannot give you** — your own grounding, a repeatable process, a controlled response, or an action written back to a system of record. Those are real requirements, and they are exactly what the harnesses in this bootcamp exist to serve.

**Set expectations on reasoning time.** Users trained on instant chat replies will read a thinking agent as a broken one unless someone tells them otherwise.
