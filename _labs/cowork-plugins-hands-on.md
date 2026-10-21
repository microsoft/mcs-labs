---
layout: lab
module: ghcp-in-a-day-cowork
title: "Cowork + Plugins Hands-On Lab"
order: 116
duration: 30
difficulty: 200
lab_type: local
section: core_learning_path
journeys: ["quick-start", "business-user"]
description: "Use Copilot Cowork to draft emails and build a SharePoint sales dashboard in 30 minutes, with optional Extra Credit on skills and plugins."

---

---

# Cowork + Plugins Hands-On Lab

Delegate real work to Copilot Cowork — hand it a document, let it reason over the content, and have it take action on your behalf while you get on with something else.

---

## Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Business User | 30 minutes | After completing this lab, participants will be able to delegate document-grounded tasks to Copilot Cowork, create an interactive dashboard from SharePoint data, and verify Outlook drafts before sending. |

---

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Use Cases Covered](#use-cases-covered)
- [Instructions by Use Case](#instructions-by-use-case)
  - [Use Case #1: Draft an executive email with the Cowork agent from a PDF report](#use-case-1-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report)
  - [Use Case #2: Build an interactive sales dashboard from SharePoint and draft the summary email](#use-case-2-build-an-interactive-sales-dashboard-from-sharepoint-and-draft-the-summary-email)
  - [Extra Credit: Using skills and plugins in Copilot Cowork](#extra-credit-using-skills-and-plugins-in-copilot-cowork)

---

## Introduction

This lab accompanies [Cowork (+ skills, + plugins)]({{ '/modules/ghcp-in-a-day-cowork/' | relative_url }}) in the **Deep dive in modern agents** workshop.

Copilot Cowork takes a delegated task and works it agentically: reading source material, resolving who and what it needs from your organisation, and producing real output in Microsoft 365 — a drafted email, a document, a set of updates — for you to review before anything is sent.

In this lab you ask Cowork to draft an executive email from a hotel performance report, then start a separate task to find sales data in SharePoint, build an interactive dashboard, and draft a summary email with a graphic attached. In both use cases, you verify the output in Outlook without sending it.

The optional Extra Credit exercise adds a shared RFP Response plugin to Cowork and uses its bundled skill to generate a proposal as Markdown and PDF files. It is outside the 30-minute core lab.

---

## Prerequisites

- A Microsoft 365 account with a Microsoft 365 Copilot licence
- Access to Copilot Cowork
- Outlook available to the same account, so the drafted email can be verified
- A colleague named Dewain Robinson who resolves in the tenant directory, or a facilitator-provided recipient substituted consistently in both use cases
- Download the sample report PDF: [Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)
- For Use Case #2: a sales tracker Excel workbook in a SharePoint document library the account can reach, with columns covering month, region, product line, and sales rep — the reference tenant uses `Sales.xlsx` in the `Sales Lab1b` document library
- For Use Case #2: access to **Claude > Opus 5** in the Cowork model picker, as used in the dashboard instructions
- For optional Extra Credit only: the **RFP Response** plugin published by the facilitator and shared with your account in Cowork. Confirm it appears under **Customize > Plugins > Shared with me** before starting; if it is missing, ask the facilitator to share it. You do not need to complete the Skills lab or create a Copilot Studio agent or workflow.

---

## Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Draft an executive email with the Cowork agent from a PDF report](#use-case-1-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report) | Cowork takes agentic action: reads the PDF, resolves the recipient, and drafts a real Outlook email on your behalf | 10 min |
| 2 | [Build an interactive sales dashboard from SharePoint and draft the summary email](#use-case-2-build-an-interactive-sales-dashboard-from-sharepoint-and-draft-the-summary-email) | Cowork locates the workbook through Work IQ, extracts the data, builds an interactive HTML dashboard, and drafts an email with a graphic attached | 20 min |
| EC | [Extra Credit: Using skills and plugins in Copilot Cowork](#extra-credit-using-skills-and-plugins-in-copilot-cowork) | Install a shared plugin and use its bundled skill to generate an RFP response (Optional) | ~6 min |

---

## Instructions by Use Case

---

## Use Case #1: Draft an executive email with the Cowork agent from a PDF report

If Researcher (the Researcher exercise in Lab 1) is still reasoning in the background, that's fine — you can run Cowork in parallel. Switch to **Cowork** to do something purely conversational agents cannot: agentically read a complex business document, look up the right recipient in your organization, and draft a complete email in Outlook — ready for you to review and send.

| Use case                                       | Value added                                                                                                       | Estimated effort |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| Draft an executive email with Cowork           | Cowork takes agentic action: reads the PDF, resolves the recipient, and drafts a real Outlook email on your behalf | 10 minutes       |

**Summary of tasks**

In this section, you'll upload the same Contoso PDF to the Cowork agent, ask it to draft an email to a specific colleague summarizing the most urgent operational issues, and then verify the draft was created in Outlook.

**Scenario:** You're an operations lead at the Contoso Grand Hotel and need to brief your colleague Dewain on the most pressing issues from the annual performance report. Rather than writing the email yourself, you'll let Cowork extract the key facts from the report and draft the email — addressed to Dewain, ready for you to review, edit, and send.

### Objective

Use the Cowork agent to read the [same PDF report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) you uploaded to Researcher, identify five operational issues with root causes and recommendations, and have Cowork draft a real Outlook email to a named recipient (Dewain Robinson).

---

### Step-by-step instructions

#### Open the Cowork agent

1. From the same Microsoft 365 Copilot page (`https://m365.cloud.microsoft/chat/?auth=2&home=1`), select **Cowork** on the **Chat / Cowork** toggle at the top of the Copilot panel.

   ![The Cowork surface in Microsoft 365 Copilot](images/cowork-landing.png)

   Take a moment to orient before you type anything. The message input reads **Start a task…**, not "ask me anything" — and that wording is the distinction this whole lab is about: you are handing over an outcome, not opening a conversation. In the left rail, **My tasks** is where delegated work appears while it runs, **Automations** is for work you want to recur, and below those Cowork lists your previous sessions.

   > [!TIP]
   > Cowork is generally available in Microsoft 365 Copilot and is purpose-built for *agentic action-taking*: it can read documents, look up people in your tenant, and create real Outlook drafts / Word docs / Teams messages on your behalf. While Researcher excels at deep analysis and Analyst at data and computation, Cowork excels at completing multi-step tasks that span several Microsoft 365 surfaces.

#### Upload the report and ask Cowork to draft an email

1. Click **Add attachments** (the paperclip icon next to the message input), then choose **Upload images and files (PDF, Word, Excel, images)**. Select the [`Contoso_Grand_Hotel_Performance_Report.pdf`](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) file you downloaded for the Researcher exercise in Lab 1.

1. Wait for the upload to complete — the PDF will appear as a chip above the message input.

   > [!TIP]
   > Uploading is not the only way to give Cowork a file. While editing a prompt, press `#` to pick one straight from OneDrive — and in Use Case #2 you'll use a third route, where Cowork finds the file itself and you never name a location at all.

1. Paste the following prompt into the message input and press **Send**:

    ```text
    Create a draft email in my Outlook mailbox addressed to Dewain Robinson summarizing the five most urgent operational issues from the attached hotel performance report. Use the Outlook draft tool — do not just write the email text in chat.

    For each issue, include in one short bullet: the symptom, the root cause, the estimated financial impact, and the matching recommendation (Section 16 R-number).

    Address the email "Hi Dewain," and sign it from "The Operations Team". Keep the total email under 400 words. Use the PDF as the only source.
    ```

    > [!TIP]
    > Cowork executes this as a **multi-step task**: (1) reads the attached PDF, (2) looks up "Dewain Robinson" through Work IQ, (3) drafts a new email in your Outlook mailbox, (4) reports back in chat when done. Unlike Researcher, Cowork rarely asks clarifying questions — when the prompt is clear, it just acts, and typically completes in ~2–3 minutes.

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
> By now, head back to the Researcher exercise in Lab 1 and check whether Researcher has finished. If it has, compare the two outputs side-by-side: Researcher gives you a deep analytical breakdown, Cowork gives you an actionable email ready to send. Each is the right tool for a different job.

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

---

## Use Case #2: Build an interactive sales dashboard from SharePoint and draft the summary email

Use Case #1 handed Cowork a file you uploaded and asked for one artifact. This one gives it neither. You don't say where the file is, and a single instruction has to carry Cowork across four surfaces — find, extract, build, draft.

| Use case                                                | Value added                                                                                                                                                  | Estimated effort |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Build a sales dashboard and draft the summary email     | Cowork locates the workbook through Work IQ, extracts the data, builds an interactive HTML dashboard, and drafts an email with a graphic attached             | 20 minutes       |

**Summary of tasks**

In this section, you'll give Cowork one instruction that spans four surfaces: it locates a sales tracker workbook in SharePoint using Work IQ, extracts the data, builds an interactive HTML dashboard, and drafts an Outlook email to a named colleague with a chart from that dashboard attached.

**Scenario:** You're a sales operations analyst. The sales tracker lives somewhere in SharePoint, and Dewain Robinson needs a readable summary with a sales visual he can preview without opening and interpreting the source workbook. Rather than building the charts yourself and assembling the email in Outlook, you'll delegate the whole chain in one prompt and watch Cowork work through it.

### Objective

Have Cowork find the sales tracker workbook in SharePoint without you naming its location, build an interactive HTML dashboard covering sales by month, region, product line, and sales rep, and draft an Outlook email to Dewain Robinson that summarizes the data with a graphic from the dashboard attached.

---

### Step-by-step instructions

#### Open the Cowork agent

1. From the Microsoft 365 Copilot page, select **Cowork** on the **Chat / Cowork** toggle at the top of the Copilot panel.

1. Select **New Task** to start a fresh Cowork session, so this use case doesn't continue the conversation from Use Case #1.

1. Open the model picker at the top of the panel (it reads **Auto** by default), choose **Claude**, then **Opus 5**.

   > [!IMPORTANT]
   > Cowork writes the dashboard code itself, so the model you pick changes what you get. On **Opus 5** the dashboard comes back with cross-filtering charts and a detail table, as described below. On **Auto** the same prompt has produced a filters-only dashboard with no table. Pick Opus 5 so your result matches the lab.

1. Paste the following prompt into the message input and press **Send**:

    ```text
    Find the sales tracker excel document in the document library and create an interactive html dashboard highlighting the sales by month, region, product line, and sales rep. Draft an email to Dewain Robinson with a summary of the data and attach the sales graphic from the dashboard to the email
    ```

    > [!TIP]
    > Note what this prompt does *not* contain: a file path, a site name, or a sequence of steps. You named an outcome and a recipient. Everything between those two things — locating the workbook, deciding what the charts should be, choosing which graphic belongs in the email — is Cowork's to work out.

#### Observe how Cowork works

1. **Watch the execution trace.** Cowork works through the task in stages, and each one is worth pausing on:

   - It first uses **Work IQ** and **SharePoint** to find the sales tracker — you never told it where the file lives
   - It opens the spreadsheet and extracts the data
   - It builds the dashboard layout in **HTML**, adding interactive controls rather than static images
   - It moves on to drafting the email while the dashboard is already available

1. **Click the dashboard in the output pane while the email draft is still being created.**

   > [!TIP]
   > This is the moment that separates delegation from chat. You are reading a finished artifact while the agent is still working on the next one. Nothing is blocked on your attention, and nothing was blocked on the agent's.

1. **Observe** the dashboard in the side panel: dropdown filters for region, product line, sales rep and fiscal period, KPI tiles, charts that cross-filter the whole view when you click a bar, and a monthly detail table. This is a working artifact, not a picture of one — try a filter before you move on, then click a single bar and watch every other chart and tile redraw around it.

   ![The generated dashboard open in the Cowork side panel](images/cowork-dashboard-sidepanel.png)

   > [!NOTE]
   > Cowork designs this dashboard from scratch each run, so the exact layout, chart types and tile set will differ from the screenshot. Filters and charts are reliably there; extras such as a records tile or a second summary table come and go.

   > [!TIP]
   > Read the line under the dashboard title — it cites its own source, along the lines of *"Source: Sales.xlsx · Sales Lab1b document library · Jul 2023 – Jun 2025."* That is the fastest confirmation that Cowork found the right workbook and read all of it, and you never have to leave the panel to check.

#### Verify the draft in Outlook

1. Open the app launcher (the 3×3 "waffle" icon at the top-left) and select **Outlook**, then click the **Drafts** folder.

1. Open the draft Cowork created and check:

   - **Recipient:** Dewain Robinson, resolved as a contact pill
   - **Body:** a written summary of the sales data, not just a chart
   - **Graphic:** the sales visual from the dashboard is attached to the email and can be previewed

   ![The Cowork-drafted email open in Outlook, with Dewain Robinson resolved and the sales graphic attached](images/cowork-uc2-outlook-draft.png)

1. Leave it as a draft. As in Use Case #1, nothing needs to be sent.

   > [!TIP]
   > Pick one figure from the email summary and check it against the source workbook in SharePoint. The dashboard and the email were both generated from the same extraction, so a number that disagrees with the spreadsheet tells you something went wrong upstream — and this is exactly the check you would run before sending this to a colleague.

---

### Congratulations! You've had Cowork find, analyze, visualize, and draft — from one instruction!

---

### Test your understanding

**Key takeaways:**

- **One prompt, four surfaces** — Search, extraction, visualization, and drafting. You described an outcome; Cowork decided the sequence and executed it without asking you to confirm each step.
- **Work IQ did the finding** — You never supplied a path or a site name. Locating the file was part of the problem you delegated, not part of the prompt you wrote.
- **The dashboard is a live artifact, not a picture** — It has interactive controls and opens in the side panel. Cowork built a working thing, then attached a still from it to the email.
- **Work continues while you explore** — Clicking into the dashboard mid-run doesn't pause the email draft. That parallelism is the delegation model doing exactly what it promises.
- **The review gate held again** — The email is a draft. Cowork prepared the work and stopped.

**Challenge: Apply this to your own use case**

- Which spreadsheet do you manually chart and email on a schedule today?
- If the tracker updated weekly, would you re-run this by hand — or is this a job for a scheduled agent you build yourself?
- Where in your reporting would an interactive dashboard beat the static chart everyone currently pastes into a mail?

---

---

## Extra Credit: Using skills and plugins in Copilot Cowork

> [!NOTE]
> **Optional - Extra Credit (~6 minutes):** This use case is optional and not included in the 30-minute lab time. Complete it if you have additional time or want to see how a plugin adds a reusable skill to Cowork.

### Step-by-step instructions

#### Open Cowork and find Customize

1. Go to [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?auth=2&home=1) and select the
    **Cowork** tab at the top of the left navigation.

1. Select **Customize** in the left navigation. The page has two tabs - **Plugins** and **Skills** -
    and describes plugins as extending Cowork "by connecting to external tools, services, and
    bundled skills".

    ![The Cowork Customize page with the Plugins and Skills tabs](images/uc3-customize-page.png)

    > [!NOTE]
    > Select the **Skills** tab and look at **Built-in**. Cowork ships with skills of its own - PDF, Word, Excel - that cannot be disabled. **Your skills** is empty until you add one, and a skill that arrives inside a plugin appears through that plugin rather than as a separate upload.

#### Install the RFP Response plugin

1. On the **Plugins** tab, find **RFP Response** under **Shared with me** - "Drafts RFP responses
    grounded in the Aventra product catalog".

    ![The RFP Response plugin listed under Shared with me](images/uc3-shared-plugin.png)

    > [!NOTE]
    > The plugin is published once for the whole tenant and shared with you, so you install it rather than upload it. **Add plugin** in the top right is how a maker publishes a `.zip` package of their own - worth opening to see, even though you will not use it here.

    > [!IMPORTANT]
    > A plugin's **manifest ID is unique across the tenant**. If everyone in a shared training tenant uploads the same sample package, the first upload claims the ID and every later one is refused with *"This manifest ID already belongs to a plugin someone else owns."* Publishing centrally and sharing avoids that entirely. To publish your own copy, change `id` to a fresh GUID and give `name.short` a distinct value first.

1. Select the **RFP Response** card, then choose **Install**.

    ![The RFP Response plugin detail page with the Install button](images/uc3-plugin-detail.png)

1. After it installs, the page shows a **Skills** section listing **rfp-response** - the reusable
    playbook bundled with the plugin. The toggle beside the plugin name controls whether Cowork
    may use it; ensure it is enabled before continuing.

    ![The installed plugin showing the bundled rfp-response skill](images/uc3-plugin-installed-skill.png)

    > [!IMPORTANT]
    > **This is the point of the exercise.** The plugin's `manifest.json` is a Teams app manifest whose `agentSkills` entry points at a `skills/rfp-response` folder containing `SKILL.md`, `references/`, `assets/` and `scripts/`. A skill can be attached to an agent directly, or packaged inside a plugin and distributed through the app catalog. One authored capability, reused across surfaces, governed and versioned like any other app.

#### Run an RFP through Cowork

1. Select **New task**. Download the sample solicitation
    [05-ironwood-legacy-modernization.md](https://github.com/Dewain27/AgentDudeSamples/blob/main/samples/RFP%20Skill/test-rfps/05-ironwood-legacy-modernization.md)
    - Ironwood Manufacturing replacing a shop floor control system. Choose **Add attachments** and
    **Upload images and files**, select the file, then type:

    ```text
    We are bidding on this RFP. Draft our response.
    ```

    ![A new Cowork task with the Ironwood RFP attached](images/uc3-cowork-task-input.png)

1. Send the task. Cowork names the task itself, then announces
    *"I'll use the RFP response skill for this"* and shows **Reviewed custom skill · RFP Response**
    before it reads anything.

    ![Cowork announcing it will use the RFP response skill](images/uc3-cowork-skill-loading.png)

    > [!TIP]
    > You never named the skill or the plugin. Cowork matched your request against the skill's **description** and loaded its playbook. The right rail lists what it is working with under **Skills & Plugins** and **References**.

1. Let the run finish - it takes several minutes. Cowork drafts the proposal, uses the tools
    available to it to render it as a PDF, and publishes both files. They appear under
    **Output** in the details pane - an `Aventra ... IW-2026-SHOPFLOOR` markdown file and the
    matching `.pdf`. The exact filename varies slightly between runs.

    ![The finished Cowork task with the generated proposal files in the Output folder](images/uc3-cowork-output.png)

    > [!IMPORTANT]
    > Unlike the email-drafting exercises above, this task returns proposal files under **Output**. Open both the Markdown and PDF files and review their contents before sharing them.

    > [!TIP]
    > Read the closing summary. It matches Legacy Application Modernization to Ironwood's "no hard cutover" constraint, prices the engagement against their stated budget, writes to their 35% technical-approach weighting, and closes with a short list of items needing sign-off - typically including that Aventra holds SOC 2 and ISO 27001 but **not** IEC 62443 for plant-floor networks. The figures and the flag count differ from run to run; the structure and the candour do not. The bundled skill supplies the response procedure and guardrails.

### Congratulations! You've completed the Extra Credit: Using skills and plugins in Copilot Cowork!

---

## Summary of learnings

**You delegated, you did not converse.** Two instructions produced two Outlook drafts and an interactive dashboard — no copying content between windows.

**Cowork acted inside Microsoft 365.** The outputs were real drafts in your mailbox and a real dashboard you could explore — not blocks of suggested text you then had to place somewhere.

**It found its own inputs.** In Use Case #2 you never said where the workbook lived. Locating it was part of what you delegated, not part of what you specified.

**The review gate held in both use cases.** Both emails stayed in Outlook Drafts for you to inspect. Check the report facts, workbook figures, recipients, and attachment before sending anything.

**Optional: a plugin added a reusable skill.** If you completed Extra Credit, you installed the shared RFP Response plugin, observed Cowork select its skill without being told to, and reviewed the generated Markdown and PDF proposal files.

---

## Conclusions & Recommendations

**Use Cowork when the job is a task, not a question.** If the outcome is an artifact — an email or an interactive dashboard — delegation beats conversation.

**Review before sending.** Verify the generated emails against the source report and workbook, confirm the recipient and attached graphic, and leave both emails as drafts for this lab.

**Position it against the alternatives.** Chat answers, Cowork acts, and a custom agent encodes a repeatable process you own. Those three sit side by side, and picking correctly is the design skill this bootcamp is teaching.
