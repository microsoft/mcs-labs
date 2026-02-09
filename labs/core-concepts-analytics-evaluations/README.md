# Monitor Performance and Evaluate Agent Quality

Learn how to use analytics to measure agent performance, create evaluation test sets to systematically assess agent quality, and run evaluations to drive continuous improvement.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 45 minutes | After completing this lab, participants will be able to access and interpret agent analytics including conversation volume, topic performance, and user satisfaction, create evaluation test sets using quick generation, manual entry, and file import methods, configure evaluation methods including exact match, keyword match, similarity, general quality, and compare meaning, and run evaluations to compare results across runs and identify improvement opportunities. |

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
  - [Use Case #1: Monitor Agent Performance with Analytics](#-use-case-1-monitor-agent-performance-with-analytics)
  - [Use Case #2: Create and Configure Evaluation Test Sets](#-use-case-2-create-and-configure-evaluation-test-sets)
  - [Use Case #3: Run Evaluations and Interpret Results](#-use-case-3-run-evaluations-and-interpret-results)

---

## 🤔 Why This Matters

**An agent you can't measure is impossible to improve, and without systematic evaluation, you're guessing about quality.**

Think of analytics and evaluations like running a quality assurance program:
- **Without analytics**: You have no idea how many users interact with your agent, what they ask, or whether they leave satisfied - you're running blind
- **Without evaluations**: You make changes to your agent and hope they help, but you have no systematic way to verify improvements or catch regressions
- **With both**: You have data-driven insights to identify issues AND a repeatable testing framework to validate fixes - a continuous improvement cycle that ensures your agent gets better over time

**Common challenges solved by this lab:**
- "I can't tell if my agent is actually helping users"
- "I don't know which topics are failing or which questions users can't get answered"
- "I made changes to my agent but I'm not sure if they improved things"
- "I need a systematic way to test my agent's quality before deploying updates"

**In 45 minutes, you'll learn how to measure your agent's performance with analytics and build a repeatable evaluation framework for continuous quality improvement.**

---

## 🌐 Introduction

Analytics and evaluations are the two pillars of agent quality management. Analytics provide real-time visibility into how users interact with your agent - tracking conversation volumes, topic performance, satisfaction scores, and failure patterns. Evaluations provide a structured testing framework where you define expected responses, run systematic tests, and compare results across agent versions. Together, they create a complete quality management system: analytics tells you WHERE to improve, and evaluations tell you WHETHER your improvements actually worked.

**Real-world example:** A company deploys an IT support agent and uses analytics to discover that 30% of conversations about VPN setup end in user abandonment. They add VPN documentation to the agent's knowledge sources, then create an evaluation test set with 15 VPN-related questions and expected answers. After the knowledge update, they run the evaluation and confirm that pass rates improved from 40% to 90%. A week later, analytics confirm that VPN topic abandonment dropped from 30% to 5%. The combination of analytics (finding the problem) and evaluations (verifying the fix) created a measurable, data-driven improvement cycle.

This lab teaches you how to use both analytics and the Agent Evaluation feature (preview) to build a quality management practice that ensures your agents continuously improve.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Conversation Analytics** | Metrics tracking conversation volume, topic usage, and session duration - these reveal how users interact with your agent and which capabilities they value most |
| **User Satisfaction Scores** | Feedback metrics measuring whether users found the agent helpful - low satisfaction scores indicate areas needing improvement in knowledge, instructions, or conversation flows |
| **Failure Analytics** | Data showing where conversations fail, which questions go unanswered, and where users escalate or abandon - these insights directly guide improvement priorities |
| **Evaluation Test Sets** | Collections of test cases with questions and expected responses that systematically verify agent quality - these provide repeatable, objective quality measurement |
| **Evaluation Methods** | Different comparison techniques (Exact Match, Keyword Match, Similarity, General Quality, Compare Meaning) that determine how agent responses are assessed against expected answers |
| **Evaluation Results** | Pass/fail outcomes with detailed reasoning, knowledge citations, and activity maps - these reveal exactly why an agent succeeded or failed on each test case |

---

## 📄 Documentation and Additional Training Links

* [Analyze agent performance](https://learn.microsoft.com/microsoft-copilot-studio/analytics-overview)
* [Use conversation analytics](https://learn.microsoft.com/microsoft-copilot-studio/analytics-summary)
* [Agent Evaluation overview](https://learn.microsoft.com/microsoft-copilot-studio/analytics-agent-evaluation-overview)
* [Create evaluation test sets](https://learn.microsoft.com/microsoft-copilot-studio/analytics-agent-evaluation-create)
* [View and interpret evaluation results](https://learn.microsoft.com/microsoft-copilot-studio/analytics-agent-evaluation-results)

---

## ✅ Prerequisites

* Completed [Build Intelligent Agents with Knowledge Sources, Tools, and Topics](../core-concepts-agent-knowledge-tools/README.md) and [Master Variables, Multi-Agent Architectures, and Channel Deployment](../core-concepts-variables-agents-channels/README.md) labs - you need a deployed agent with conversation history for meaningful analytics
* Access to Microsoft Copilot Studio with analytics and evaluation permissions
* An agent that has been deployed and used (even test conversations count for analytics data)

---

## 🎯 Summary of Targets

In this lab, you'll use analytics to understand agent performance and build evaluation test sets to systematically measure and improve quality. By the end of the lab, you will:

* Access and interpret conversation analytics including volume, engagement, and topic metrics
* Analyze user satisfaction scores and identify improvement opportunities
* Use failure analytics to discover knowledge gaps and conversation issues
* Create evaluation test sets using quick generation, manual entry, and file import
* Configure evaluation methods appropriate for different test scenarios
* Run evaluations and interpret pass/fail results with detailed reasoning
* Compare evaluation runs to measure improvement over time
* Export evaluation results for reporting and documentation

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Monitor Agent Performance with Analytics](#-use-case-1-monitor-agent-performance-with-analytics) | Measure agent performance and identify optimization opportunities using conversation data | 15 min |
| 2 | [Create and Configure Evaluation Test Sets](#-use-case-2-create-and-configure-evaluation-test-sets) | Build systematic test cases to objectively measure agent quality with multiple evaluation methods | 15 min |
| 3 | [Run Evaluations and Interpret Results](#-use-case-3-run-evaluations-and-interpret-results) | Execute evaluations, compare runs, and use results to drive measurable agent improvements | 15 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Monitor Agent Performance with Analytics

Learn how to access agent analytics, interpret performance metrics, identify improvement opportunities, and use data to optimize agent experiences.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Monitor Agent Performance with Analytics | Measure agent performance and identify optimization opportunities using conversation data | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to access the analytics dashboard, understand conversation volume and topic metrics, analyze user satisfaction scores, identify failure patterns, and use insights to improve your agent.

**Scenario:** Your agent has been deployed for several days. You need to understand how users are interacting with it, which topics are most popular, where conversations are failing, and whether users find it helpful. Analytics provide the insights needed to prioritize improvements.

### Objective

Access and interpret agent analytics to measure performance and identify optimization opportunities.

---

### Step-by-step instructions

#### Navigate to Analytics

1. In your Copilot Studio agent, click **Analytics** in the left navigation panel.

2. Review the analytics dashboard overview, which typically includes:
   - **Summary metrics**: Total conversations, engaged conversations, resolution rate
   - **Trend charts**: Conversation volume over time
   - **Topic performance**: Which topics are used most frequently
   - **User satisfaction**: Feedback scores from users

> [!NOTE]
> Analytics data may take 24-48 hours to populate for new agents. If your agent is brand new, you may see limited or no data initially.

3. Set the date range using the date picker (typically in the top right):
   - Last 7 days
   - Last 30 days
   - Custom date range

> [!TIP]
> Use consistent date ranges when comparing performance over time. Weekly reviews with 7-day ranges work well for ongoing monitoring.

#### Understand Summary Metrics

4. Review the **Total conversations** metric:
   - This shows how many conversation sessions occurred
   - A conversation typically starts when a user sends their first message and ends after a period of inactivity

5. Review the **Engaged conversations** metric:
   - Conversations where the user sent more than one message
   - Higher engagement suggests users are finding value and continuing the conversation

6. Calculate the **Engagement rate** (if not shown automatically):
   - Engagement Rate = Engaged Conversations / Total Conversations x 100%
   - Higher engagement rates indicate the agent is providing valuable assistance

> [!NOTE]
> Low engagement might mean users get answers immediately (good) or give up after the first response (bad). Combine this metric with satisfaction scores for proper interpretation.

#### Analyze Conversation Volume Trends

7. Review the **Conversation volume** chart showing conversations over time.

8. Look for patterns and trends:
   - **Peaks**: When is demand highest? Plan capacity accordingly
   - **Valleys**: When is usage lowest? Schedule maintenance during these times
   - **Trends**: Is usage growing over time? Flat lines may indicate awareness issues

9. Consider external factors that might influence trends:
   - Business cycles (month-end, quarter-end)
   - Seasonal patterns
   - Recent communications or awareness campaigns

> [!TIP]
> Share positive growth trends with stakeholders to demonstrate adoption and value. Use declining trends as signals to refresh content or increase awareness.

#### Review Topic Performance

10. Navigate to the **Topics** section in analytics (may be a separate tab or section).

11. Review the **Topic usage** metrics showing:
    - Which topics are triggered most frequently
    - How many conversations used each topic
    - Average conversation duration per topic

12. Identify your **top topics**:
    - These represent the most common user needs
    - Ensure these topics have excellent quality and comprehensive coverage
    - Consider creating child agents for highly-used complex topics

13. Identify **unused or rarely used topics**:
    - These may indicate topics that don't match real user needs
    - Consider removing or consolidating rarely-used topics
    - Investigate if trigger phrases need improvement

> [!IMPORTANT]
> Not all topics should be equally used. Focus optimization efforts on high-volume topics that impact the most users.

#### Analyze User Satisfaction

14. Navigate to the **User satisfaction** section in analytics.

15. Review satisfaction metrics:
    - **Overall satisfaction score**: Percentage of users who rated the agent positively
    - **Satisfaction by topic**: Which topics have high/low satisfaction
    - **Feedback comments**: Qualitative feedback from users (if collected)

16. Identify topics with **low satisfaction scores**:
    - These are your highest priority for improvement
    - Common causes: incomplete knowledge, poor instructions, confusing flows

17. Investigate patterns in negative feedback:
    - Are users frustrated by specific types of questions?
    - Do certain conversation flows consistently result in low satisfaction?
    - Are there knowledge gaps or outdated information?

> [!TIP]
> A single low-satisfaction topic with high volume should be your top improvement priority - it affects many users and has measurable impact.

#### Review Escalation and Abandonment

18. Look for **Escalation rate** metrics (if available):
    - How often users request human assistance
    - High escalation rates indicate the agent can't handle common scenarios

19. Review **Abandonment metrics**:
    - Conversations where users leave without resolution
    - Points in the conversation where users drop off most frequently

20. Analyze **Unrecognized phrases** or **Unanswered questions** (if available):
    - Questions the agent didn't understand or couldn't answer
    - Direct indicators of knowledge gaps or missing topics

> [!IMPORTANT]
> Unrecognized phrases are gold mines for improvement. Each represents a real user need your agent isn't addressing. Add knowledge or topics to cover these gaps.

#### Identify Improvement Opportunities

21. Based on your analytics review, create a prioritized list of improvements:
    - **High-volume, low-satisfaction topics**: Improve knowledge or instructions
    - **Unrecognized phrases**: Add missing knowledge or create new topics
    - **High abandonment points**: Simplify conversation flows or add clarifying messages

22. Document specific actions for each improvement:
    - "Add licensing FAQ to knowledge sources" (addresses 15% of unanswered questions)
    - "Simplify mailing list topic flow" (reduce 3-step process to 2 steps)
    - "Update agent instructions" (clarify when to use child agents)

> [!TIP]
> Always measure the impact of improvements by comparing analytics before and after changes. This validates your efforts and informs future optimization.

---

### 🏅 Congratulations! You've completed Use Case 1!

---

### Test your understanding

**Key takeaways:**

* **Analytics Reveal User Behavior** – Conversation volume, engagement rates, and topic performance show how users actually interact with your agent
* **Satisfaction Scores Guide Priorities** – Low satisfaction on high-volume topics should be your top improvement priority
* **Failure Data Drives Improvements** – Unrecognized phrases and abandoned conversations directly indicate where to add knowledge or refine flows

**Lessons learned & troubleshooting tips:**

* Analytics data takes 24-48 hours to populate - don't expect instant results for new agents
* Combine multiple metrics for accurate interpretation (e.g., low engagement + high satisfaction = users getting quick answers)
* Set up regular analytics review cadence: weekly for new agents, bi-weekly for mature agents

**Challenge: Apply this to your own use case**

* What satisfaction score would indicate success for your agent?
* How often should you review analytics based on your conversation volume?
* What metrics would you share with leadership to demonstrate agent value?

---

---

## 🔄 Use Case #2: Create and Configure Evaluation Test Sets

Build systematic evaluation test sets using multiple creation methods and configure evaluation methods to objectively measure agent quality.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Create and Configure Evaluation Test Sets | Build systematic test cases to objectively measure agent quality with multiple evaluation methods | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to navigate to the Evaluation page, create test sets using AI-powered quick generation, add manual test cases with hand-crafted questions and expected responses, understand the file import format, and configure different evaluation methods for each test case.

**Scenario:** You want to systematically test your Copilot Studio Assistant to ensure it provides accurate answers about Copilot Studio features, licensing, and prompt engineering. You'll create a comprehensive evaluation test set that covers your agent's key capabilities and configure appropriate evaluation methods for different types of questions.

> [!NOTE]
> **Preview Feature:** Agent Evaluation is currently a preview feature in Copilot Studio. Features and UI may change as Microsoft iterates on the experience. Preview features are not intended for production use.

### Objective

Create evaluation test sets using multiple methods and configure appropriate evaluation criteria for systematic agent quality testing.

---

### Step-by-step instructions

#### Navigate to the Evaluation Page

1. In your Copilot Studio agent, click **Evaluation** in the left navigation panel (you may find it under **Analytics** or as a separate section).

2. Review the Evaluation page overview. This is where you'll create test sets, run evaluations, and view results.

> [!NOTE]
> If you don't see the Evaluation option, it may need to be enabled in your environment settings or may not yet be available in your region. Check [Agent Evaluation overview](https://learn.microsoft.com/microsoft-copilot-studio/analytics-agent-evaluation-overview) for availability.

#### Create a Test Set with Quick Question Set

3. Click **+ New test set** or **Create test set** to begin.

4. Select **Quick Question Set** as the creation method.

5. Copilot Studio will use AI to automatically generate approximately 10 test cases based on your agent's knowledge sources and configuration.

6. Review the generated test cases. Each includes:
   - **Question**: A user question the agent should be able to answer
   - **Expected response**: The correct or ideal answer
   - **Testing method**: The evaluation method to use

> [!TIP]
> Quick Question Set is the fastest way to get started with evaluations. The AI generates relevant test cases based on your agent's actual knowledge and capabilities.

7. Review each generated test case for accuracy and relevance. You can edit questions, expected responses, or remove irrelevant cases.

8. Give your test set a descriptive name:

```
Copilot Studio Assistant - Auto Generated
```

9. Click **Save** to save the test set.

#### Create Manual Test Cases

10. Click **+ New test set** again to create a second test set.

11. Select **Manual Entry** as the creation method.

12. Give the test set a descriptive name:

```
Copilot Studio Assistant - Manual Quality Checks
```

13. Click **+ Add test case** to create your first manual test case.

14. Enter the following test case:

**Question:**
```
How do I license Copilot Studio with pay as you go?
```

**Expected response:**
```
Copilot Studio offers pay-as-you-go licensing through Azure where you are billed based on consumption using messages as the billing unit.
```

15. Click **+ Add test case** again and enter:

**Question:**
```
What is the CARE framework for prompt engineering?
```

**Expected response:**
```
The CARE framework stands for Context, Action, Results, and Example. It provides a structured approach to writing effective prompts.
```

16. Add a third test case:

**Question:**
```
How do I create a new agent in Copilot Studio?
```

**Expected response:**
```
To create a new agent, navigate to Copilot Studio, click Create in the left navigation, select New agent, provide a name and instructions, and click Create.
```

17. Add a fourth test case:

**Question:**
```
What weather tools are available?
```

**Expected response:**
```
The MSN Weather connector provides real-time weather data including current conditions and forecasts for any location.
```

18. Add a fifth test case:

**Question:**
```
How do I join the Copilot Studio mailing list?
```

**Expected response:**
```
You can join the mailing list by providing your email address, first name, and last name when prompted by the agent.
```

> [!NOTE]
> Manual test cases give you full control over exactly what is tested and what the expected response should be. Use these for your most critical agent capabilities.

#### Understand File Import Format (Reference)

19. Note that you can also import test cases from a CSV file. The required format is:

```
Question,Expected response,Testing method
"How do I create an agent?","Navigate to Copilot Studio and click Create","Similarity"
"What is GPT-4?","GPT-4 is an advanced AI model","Keyword Match"
```

> [!TIP]
> File import is useful when you have a large number of test cases or want to maintain test cases in a spreadsheet. You can import up to 100 test cases per test set.

#### Configure Evaluation Methods

20. For each test case in your manual test set, configure the appropriate **evaluation method**. Click on a test case to see the method options:

    - **Exact Match**: Character-for-character comparison between expected and actual response. Use for questions with precise, factual answers (e.g., specific numbers or names).

    - **Keyword Match**: Checks whether key terms from the expected response appear in the actual response. Use when the exact wording doesn't matter but key concepts must be present.

    - **Similarity**: Uses cosine similarity to compare semantic meaning on a 0-1 scale with a configurable threshold. Use for questions where the meaning matters more than exact wording.

    - **General Quality**: Uses an LLM to evaluate response quality across four dimensions - relevance, groundedness, completeness, and abstention. Does NOT require an expected response. Use for open-ended questions.

    - **Compare Meaning**: Evaluates whether the intent and meaning of the actual response matches the expected response, with a configurable threshold. Use when you want semantic comparison with more nuance than cosine similarity.

21. Configure the evaluation methods for your manual test cases:
    - Test case 1 (licensing): Set to **Similarity** (threshold 0.7)
    - Test case 2 (CARE framework): Set to **Keyword Match**
    - Test case 3 (create agent): Set to **Compare Meaning** (threshold 0.7)
    - Test case 4 (weather tools): Set to **Keyword Match**
    - Test case 5 (mailing list): Set to **General Quality**

> [!IMPORTANT]
> Choose evaluation methods that match the nature of each question. Factual questions with precise answers work well with Exact Match or Keyword Match. Open-ended questions benefit from General Quality or Similarity methods.

#### Configure User Profile Authentication

22. In the test set settings, look for a **User Profile** or **Authentication** configuration.

23. Configure the authentication setting to match how your agent handles user identity during evaluations.

> [!NOTE]
> User Profile settings determine whether the evaluation runs as an authenticated user or anonymous. Configure this to match your production scenario for accurate evaluation results.

24. Click **Save** to save all test cases and configurations.

> [!IMPORTANT]
> **Key limits to remember:** Each test set supports a maximum of 100 test cases. Questions can be up to 1,000 characters. Evaluation results are retained for 89 days.

---

### 🏅 Congratulations! You've completed Use Case 2!

---

### Test your understanding

**Key takeaways:**

* **Multiple Creation Methods** – Quick Question Set (AI-generated), Manual Entry (hand-crafted), and File Import (CSV) each serve different needs for building comprehensive test sets
* **Evaluation Methods Matter** – Different question types require different evaluation approaches. Factual questions need Exact/Keyword Match; open-ended questions need General Quality or Similarity
* **General Quality Needs No Expected Response** – The LLM-based evaluation assesses relevance, groundedness, completeness, and abstention without needing a predefined answer

**Lessons learned & troubleshooting tips:**

* Start with Quick Question Set to get baseline coverage, then add manual cases for critical scenarios
* Set Similarity and Compare Meaning thresholds based on how strict you need matching to be (0.7 is a good starting point)
* Review AI-generated test cases before running evaluations - they may include irrelevant or poorly worded questions

**Challenge: Apply this to your own use case**

* What are the 10 most important questions your agent must answer correctly?
* Which evaluation method would you use for customer-facing FAQ responses?
* How would you organize test sets for different agent capabilities?

---

---

## 🧱 Use Case #3: Run Evaluations and Interpret Results

Execute evaluation test sets, analyze pass/fail results with detailed reasoning, compare runs to measure improvement, and export results for documentation.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Run Evaluations and Interpret Results | Execute evaluations, compare runs, and use results to drive measurable agent improvements | 15 minutes |

**Summary of tasks**

In this section, you'll learn how to run evaluation test sets, view and interpret pass rates, examine individual test case results with reasoning details, filter results, compare evaluation runs, provide feedback on evaluation quality, and export results.

**Scenario:** You've created evaluation test sets in the previous use case. Now you'll run them against your agent, analyze the results to identify areas for improvement, make an agent change, re-run the evaluation, and compare results to verify the improvement worked.

### Objective

Run evaluations, interpret results, make improvements, and use comparison features to verify measurable quality gains.

---

### Step-by-step instructions

#### Run Your First Evaluation

1. Navigate to the **Evaluation** page in your Copilot Studio agent.

2. Select the manual test set you created in Use Case #2 ("Copilot Studio Assistant - Manual Quality Checks").

3. Click **Evaluate** or **Run evaluation** to start the test run.

4. Wait for the evaluation to complete. The agent will process each test case, generate responses, and compare them against your expected results.

> [!NOTE]
> Evaluation time depends on the number of test cases and agent response time. A test set with 5-10 cases typically completes in 1-3 minutes.

#### View Pass Rate and Summary

5. Once the evaluation completes, review the **pass rate** displayed in the **Recent results** section.

6. The pass rate shows the percentage of test cases that met their evaluation criteria (e.g., "4/5 passed - 80%").

7. Review the summary to quickly identify:
   - How many test cases passed
   - How many test cases failed
   - The overall quality trend

#### Examine Individual Test Case Results

8. Click on an individual test case to view its detailed results.

9. For each test case, review:
   - **Question**: The original test question
   - **Expected response**: What you defined as the correct answer
   - **Actual response**: What the agent actually responded with
   - **Result**: Pass or Fail
   - **Reasoning**: An explanation of why the test passed or failed

10. For failed test cases, pay close attention to:
    - **Knowledge sources used**: Which documents or URLs the agent referenced
    - **Tools used**: Whether the agent invoked any tools
    - **Activity map**: The step-by-step conversation flow showing the agent's decision path

> [!TIP]
> The activity map is especially valuable for debugging failures. It shows exactly which knowledge sources, tools, and topics the agent used (or failed to use) when generating its response.

11. For passing test cases, verify that the agent's reasoning is sound - a test can pass for the wrong reasons if thresholds are too lenient.

#### Filter Results

12. Use the filter options to focus on specific subsets of results:
    - **All**: Show all test cases
    - **Pass**: Show only passing test cases
    - **Fail**: Show only failing test cases

13. Filtering to failed cases quickly highlights exactly where your agent needs improvement.

#### Make an Agent Improvement

14. Based on your evaluation results, identify one failing test case and determine the root cause:
    - Is the agent missing knowledge? Add or update a knowledge source
    - Are instructions unclear? Refine agent or tool instructions
    - Is a topic not triggering? Update trigger phrases

15. Make a specific improvement to address the failure. For example, if the licensing question failed:
    - Navigate to **Knowledge** and verify the licensing document is indexed
    - Update agent instructions to emphasize licensing expertise

16. Click **Save** to apply your agent changes.

> [!IMPORTANT]
> Make one change at a time so you can clearly attribute improvements to specific actions. Multiple simultaneous changes make it hard to understand what worked.

#### Re-Run the Evaluation

17. Return to the **Evaluation** page.

18. Select the same test set and click **Evaluate** again to run a new evaluation with your improved agent.

19. Wait for the evaluation to complete.

#### Compare Evaluation Runs

20. Once the second evaluation completes, look for the **Compare with** dropdown or comparison feature in the results view.

21. Select the previous evaluation run from the dropdown to compare the two runs side by side.

22. Review the comparison view:
    - **Green arrows** (or upward indicators) show test cases that improved (failed before, pass now)
    - **Red arrows** (or downward indicators) show test cases that regressed (passed before, fail now)
    - **No change** indicators show test cases with consistent results

23. Verify that your improvement addressed the specific failure without causing regressions in other test cases.

> [!TIP]
> The comparison feature is one of the most powerful aspects of Agent Evaluation. It turns agent improvement from guesswork into a measurable, data-driven process.

#### Provide Feedback on Evaluation Quality

24. For individual test case results, look for **thumbs up/thumbs down** feedback options.

25. Provide feedback on whether the evaluation's pass/fail determination was accurate:
    - **Thumbs up**: The evaluation correctly assessed the response
    - **Thumbs down**: The evaluation's assessment was wrong (false positive or false negative)

> [!NOTE]
> Your feedback helps improve the evaluation system over time. If you consistently find that a particular evaluation method gives inaccurate results, consider switching to a different method for those test cases.

#### Export Evaluation Results

26. Look for an **Export** or **Download** button on the evaluation results page.

27. Click **Export test results** to download the results as a CSV file.

28. Review the exported CSV, which includes:
    - Question, expected response, actual response
    - Pass/fail status and reasoning
    - Evaluation method used

> [!TIP]
> Exported results are valuable for stakeholder reporting, compliance documentation, and tracking quality trends over time. Consider exporting results after each major agent update.

---

### 🏅 Congratulations! You've completed Use Case 3!

---

### Test your understanding

* Why is it important to make one improvement at a time before re-running evaluations?
* How do green and red arrows in the comparison view help you understand the impact of changes?
* When would you use the General Quality evaluation method vs. Exact Match?

**Challenge: Apply this to your own use case**

* What pass rate would you set as a quality gate before deploying agent updates?
* How would you integrate evaluation runs into your agent development workflow?
* What stakeholders would benefit from seeing exported evaluation results?

---

## 🏆 Summary of learnings

True learning comes from doing, questioning, and reflecting—so let's put your skills to the test.

To maximize the impact of analytics and evaluations in Copilot Studio:

* **Measure Continuously with Analytics** – Regular analytics review identifies issues early and guides improvement priorities. Use data, not assumptions, to optimize agent performance.
* **Focus on High-Impact Improvements** – Prioritize high-volume, low-satisfaction topics over rarely-used ones. Improve what affects the most users first.
* **Build Comprehensive Test Sets** – Use Quick Question Set for baseline coverage and manual entries for critical scenarios. Cover your agent's most important capabilities.
* **Choose Evaluation Methods Wisely** – Match evaluation methods to question types. Factual questions need strict matching; open-ended questions need semantic evaluation.
* **Compare Runs to Verify Improvements** – Never assume a change helped. Run evaluations before and after changes and use the comparison feature to verify measurable improvement without regressions.
* **Close the Feedback Loop** – Analytics identifies problems, evaluations verify fixes, and continuous iteration ensures your agent gets better over time.

---

### Conclusions and recommendations

**Analytics and evaluations golden rules:**

* Review analytics weekly for new agents, bi-weekly for mature agents
* Prioritize improvements based on conversation volume multiplied by satisfaction impact
* Track unrecognized phrases and unanswered questions - these reveal knowledge gaps
* Create evaluation test sets that cover your agent's most critical capabilities
* Run evaluations before and after every significant agent change
* Make one improvement at a time to clearly attribute results
* Export and share evaluation results with stakeholders to demonstrate quality commitment
* Use the comparison feature to ensure improvements don't cause regressions elsewhere

By following these principles, you'll build a data-driven quality management practice that ensures your agents continuously improve - delivering measurable business outcomes through systematic monitoring, evaluation, and optimization.

---
