# Cowork Hands-On

Delegate real work to Copilot Cowork — hand it a document, let it reason over the content, and have it take action on your behalf while you get on with something else.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Business User | 45 minutes | After completing this lab, participants will be able to delegate a document-grounded task to Copilot Cowork, have it draft real output in Microsoft 365 on their behalf, and describe how the delegation loop differs from conversational chat. |

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
  - [Use Case #1: Draft an executive email with the Cowork agent from a PDF report](#-use-case-1-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report)

---

## 🤔 Why This Matters

**Chat answers you. Cowork does the work.**

Everything up to this point in the bootcamp has been conversational — you ask, it responds, you act on the response. Cowork breaks that pattern. You delegate an outcome, it works through the steps, and it hands you back something finished for review.

That shift is the whole point, and it is the one most people miss on first contact. The measure of a Cowork task is not how good the reply reads; it is whether the thing you asked for actually got done.

---

## 🌐 Introduction

Copilot Cowork takes a delegated task and works it agentically: reading source material, resolving who and what it needs from your organisation, and producing real output in Microsoft 365 — a drafted email, a document, a set of updates — for you to review before anything is sent.

In this lab you hand Cowork the same annual hotel performance report used elsewhere in the bootcamp, ask it to brief a named colleague on the most urgent operational issues, and then verify that a genuine Outlook draft was created.

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
| ------- | -------------- |
| **Delegation** | You describe an outcome, not a sequence of prompts. Cowork decides the steps. |
| **Agentic action** | It produces real artifacts in Microsoft 365 rather than text you then copy somewhere. |
| **Grounding in your content** | Uploaded documents and organisational context both feed the work. |
| **Review before send** | Output lands as a draft. The human approves — that gate is deliberate. |
| **Running in parallel** | A delegated task continues while you do something else; you are not waiting on a reply. |

---

## 📄 Documentation and Additional Training Links

* [Microsoft 365 Copilot documentation](https://learn.microsoft.com/microsoft-365-copilot/)
* [Microsoft 365 Copilot Chat](https://learn.microsoft.com/microsoft-365-copilot/microsoft-365-copilot-chat)

---

## ✅ Prerequisites

- A Microsoft 365 account with a Microsoft 365 Copilot licence
- Access to Copilot Cowork
- Outlook available to the same account, so the drafted email can be verified
- Download the sample report PDF: [Contoso Grand Hotel Performance Report](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf)

---

## 🎯 Summary of Targets

In this lab you'll delegate a real task to Cowork rather than chatting with it. By the end you will be able to:

- Upload a complex source document to Cowork and delegate an outcome against it
- Have Cowork resolve a recipient from your organisation and draft a real Outlook email
- Verify the artifact Cowork produced, and edit it before sending
- Explain where Cowork sits against Copilot Chat and a custom agent

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
| ---- | -------- | ----------- | ------ |
| 1 | [Draft an executive email with the Cowork agent from a PDF report](#-use-case-1-draft-an-executive-email-with-the-cowork-agent-from-a-pdf-report) | Cowork takes agentic action: reads the PDF, resolves the recipient, and drafts a real Outlook email on your behalf | 5 min |

---

## 🛠️ Instructions by Use Case

---

## 🤝 Use Case #1: Draft an executive email with the Cowork agent from a PDF report

If Researcher (the Researcher exercise in Lab 1) is still reasoning in the background, that's fine — you can run Cowork in parallel. Switch to the **Cowork (Frontier)** agent to do something purely conversational agents cannot: agentically read a complex business document, look up the right recipient in your organization, and draft a complete email in Outlook — ready for you to review and send.

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

1. Click **Add attachments** (the paperclip icon next to the message input), then choose **Upload images and files (PDF, Word, Excel, images)**. Select the [`Contoso_Grand_Hotel_Performance_Report.pdf`](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf) file you downloaded for the Researcher exercise in Lab 1.

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

## 🏆 Summary of learnings

**You delegated, you did not converse.** One instruction produced a finished artifact — no follow-up prompting, no copying text between windows.

**Cowork acted inside Microsoft 365.** The output was a real Outlook draft addressed to a real colleague, not a block of suggested text.

**The review gate held.** Nothing was sent. Cowork prepared the work and stopped, which is exactly the behaviour you want when an agent acts on your behalf.

---

## 📌 Conclusions & Recommendations

**Use Cowork when the job is a task, not a question.** If the outcome is an artifact — an email, a summary, a set of updates — delegation beats conversation.

**Keep the human on the approve step.** Cowork drafts; people send. Preserve that boundary as scope grows.

**Position it against the alternatives.** Chat answers, Cowork acts, and a custom agent encodes a repeatable process you own. Those three sit side by side, and picking correctly is the design skill this bootcamp is teaching.
