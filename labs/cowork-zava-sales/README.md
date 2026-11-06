# Cowork: from insights to action

Prepare a Zava Sales pipeline review, create real slides and Outlook drafts, update CRM, and turn the procedure into a reusable, scheduled skill.

## 🧭 Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| 200 | Business user | 30 minutes | A reviewed deck, draft follow-ups, linked CRM records, a reusable skill and scheduled preparation. |

Use your assigned **training account**, not a personal or production account. Your facilitator prepares Cowork access, credits, Zava Sales data and plugins. Keep customer emails as **drafts**.

Plan **30 minutes for the four core missions**: Ask → Delegate → Act → Repeat. Improve and Specialize are **optional extensions, about 14 more minutes**; no scenario has been removed. These are working budgets, not guaranteed run times. Read ahead or try a quick check while Cowork works; do not start duplicate tasks.

## 📚 Table of Contents

- [Ask: find the deal](#-ask-find-the-deal)
- [Delegate: make the review](#-delegate-make-the-review)
- [Act: record the commitment](#-act-record-the-commitment)
- [Repeat: save and schedule](#-repeat-save-and-schedule)
- [Improve: learn from feedback (optional)](#-improve-learn-from-feedback)
- [Specialize: use the Zava Sales plugin (optional)](#-specialize-use-the-zava-sales-plugin)
- [Take it with you](#-take-it-with-you)

## 🔎 Ask: find the deal

**3 minutes · Copilot Chat**

1. Open [Copilot Home](https://copilot.cloud.microsoft/home?auth=2) with your assigned training account.
2. Select **Chat**. Explore the model picker, then leave **Auto** selected. Quick response favors speed; Think deeper spends longer reasoning.
3. Keep **Work IQ on**. It grounds answers in available work context within your permissions, including configured business data. It does not unlock all company data.
4. Send:

```text
Help me prepare for a call about Northstar Teamwear’s $250K Pulse renewal. Where does the deal stand, what needs my attention, and what are the three most important questions to ask on the call?
```

Watch the visible search/tool activity. Look for Zava Sales business-data results and open a source. Separate deal facts from suggested questions.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/chat-model-picker-dark.webp"><img src="images/chat-model-picker.webp" alt="Copilot Chat model picker"></picture>

**Quick check:** Does Work IQ unlock every company record? **No.** Source configuration, your permissions and available data still apply.

**If the deal is missing:** check the account and Work IQ setting, then ask the facilitator to check Zava Sales business-data access. Do not treat a generic answer as a verified CRM result. The next mission's Dataverse connection is a separate capability.

## 🛠️ Delegate: make the review

**10 minutes · Cowork**

1. Go to **Plugins → Cowork → Microsoft Dataverse**.
2. Turn **Enable Microsoft Dataverse** on, then **Connect Microsoft Dataverse**.
3. Enter `https://zavasalesdemo.crm.dynamics.com/`, select **Connect**, and confirm **Connected**. If already connected, leave it alone.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/dataverse-connection-dark.webp"><img src="images/dataverse-connection.webp" alt="Microsoft Dataverse enabled and Connected"></picture>

4. Select **New → Cowork**. Leave **Auto / Medium** selected. Higher effort spends more time and credits. Standard Copilot Chat use is included with the Microsoft 365 Copilot license; Cowork uses metered Copilot Credits. Available models and tools depend on the tenant.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/cowork-model-effort-dark.webp"><img src="images/cowork-model-effort.webp" alt="Cowork model and effort settings"></picture>

5. Send the following. Keep the **same Cowork task for the remaining core missions**. The optional Improve mission starts here before its separate Friday task:

```text
I’ve got a pipeline review with my manager tomorrow. Help me get ready to talk through our biggest open deals with Northstar Teamwear, Coastal Performance Supply, and BluePeak Athletics. Put together a few slides on where we stand and what we need to do to close them, and draft any customer follow-ups I should send.
```

Watch the plan, data retrieval, PowerPoint creation and Outlook draft creation. As soon as a first deck exists, inspect it and send the correction below. If still working, use **Queue**:

```text
This is a good start, but you’re making a few calls I’d want to check with the deal owners first. Don’t assume we need to push Coastal to Q1 or change anyone’s forecast. Make it clear what we know and what we still need to ask. And cut it to three slides—I’ve only got five minutes with my manager.
```

![Cowork and the three-slide pipeline review](images/pipeline-three-slides.webp)

Verify **three slides** and actual output cards marked **Saved to drafts**, not just suggested email text. Customer emails stay unsent. If the preview is blank, dismiss a first-run Office notice or use the file's open action; do not restart the task.

**Quick check:** Should a CRM-informed recommendation automatically change a forecast? **No.** Confirm assumptions with the owner. Delegate preparation, not unchecked business decisions.

## ✅ Act: record the commitment

**8 minutes · Dataverse, PowerPoint and Outlook**

Send in the same task:

```text
Just spoke with Riley at Northstar about the $250K renewal. They need a phased rollout plan before final approval, and I promised to send it by next Friday. Create a completed phone call with that recap and a task for me to send the plan. Link both to the renewal.
```

Review the **$250K Northstar renewal**, recap, task owner and calendar date for **next Friday** before approving. Prefer one-time **Approve/Allow** while learning. Session-wide always-allow, if offered, reduces future prompts for that permission; it does not remove your responsibility to review.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/dataverse-approval-dark.webp"><img src="images/dataverse-approval.webp" alt="Cowork history after approval, with separate Dataverse actions and the saved phone-call and task details"></picture>

This example shows the actions **after approval**, followed by the saved records and disclosed omissions.

Creating the call, completing it and creating the task can need separate approvals. Verify the phone call is **Completed**, the task is assigned to you with the right date, and both records are linked to the renewal. If a write fails, read the error and check for an existing record before retrying.

Check any disclosed omissions too. In the training run, the call recap and renewal link were saved but caller/recipient fields failed. A completed status does not mean every field was populated; ask your facilitator before treating omitted details as complete.

Then send:

```text
Update my slides with what we learned from Riley, and change the draft email to her into a recap of our call. Mention that I’ll send the rollout plan by the deadline on my task.
```

Check the updated slides and Riley's unsent draft. The deadline must match the **saved task**, not a new interpretation of “next Friday.”

**Quick check:** What proves completion? **The returned records and their actual status, owner, due date and relationship**, not just an acknowledgment.

## 🔁 Repeat: save and schedule

**9 minutes · Skills and Automations**

Send each prompt in order in the same task:

```text
Let’s make this my weekly pipeline review. Every Monday morning, refresh the three slides for these accounts, highlight what’s changed, and draft any follow-ups I should review.
```

If asked for a time zone, confirm the one you intend. If **Create recurring task** appears, review it and select **Schedule** before continuing. Leave **Run once now** off unless you want an extra test run. The later prompt refines this same Monday job rather than creating a duplicate.

```text
This is how I want to prepare for my pipeline reviews. Save it as a skill called Weekly Deal Review: the same three accounts, three slides, clear separation between what we know and what we need to ask, and customer follow-up drafts for me to review.
```

Let skill creation finish. Inspect the saved instructions: the same three accounts, three slides, facts versus questions, and draft-only customer follow-ups. Find skills under **Plugins → Cowork**; this one may appear as **weekly-deal-review**. A skill is reusable instructions and a procedure, **not model retraining**.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/saved-skill-dark.webp"><img src="images/saved-skill.webp" alt="The saved weekly-deal-review skill"></picture>

```text
Run Weekly Deal Review every Monday at 8:30 a.m. and email me the slides. Keep the customer emails as drafts for me to review.
```

Review the schedule card or **Automations**. Check **Monday, 8:30 a.m., the intended time zone, your own email recipient, and customer emails kept as drafts**. For an update, complete **Next → Review permissions → Approve** when offered, with email permission limited to your account. A new schedule uses **Schedule**; some tenants show **Save** or **Activate** instead. Keep only one Monday review schedule.

When offered, **Run once now**, **Activate and run now**, or a preview lets you test without waiting for Monday. Leave it off if you only want the scheduled run. Any test email goes only to your training account. Check **Automations → Runs** afterwards; setup is not proof of future execution.

**Quick check:** Does saving a skill start a recurrence? **No. The skill is the how; an activated schedule is the when.**

Return to the task and check its cost:

```text
/cost
```

The command is free and shows **approximate cumulative task usage**, not an invoice or advance estimate. One Copilot Credit is roughly **US$0.01 at the standard pay-as-you-go rate**; pricing, discounts and tenant arrangements vary.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/task-cost-dark.webp"><img src="images/task-cost.webp" alt="Example cumulative task usage, not a fixed lab cost"></picture>

**Core lab complete.** [Take it with you](#-take-it-with-you), or continue with the optional missions below.

## 🧠 Improve: learn from feedback

**Optional · 6 minutes · Work IQ and skill maintenance**

Send the complete prompt in the same task:

```text
Every Friday afternoon, look back at this week’s deal review and the feedback my manager gave me—in comments on the deck, the review meeting recording or transcript, Teams, and email.

Use that feedback to improve the Weekly Deal Review skill so next week’s review gets better without me repeating the same instructions. Pick up on what they wanted more or less of, which questions they kept asking, and what helped them make decisions. Distinguish lasting preferences from requests that only apply to a particular deal or week.

In the email you send with my weekly review, coach me based on previous feedback too: what to prepare, which questions my manager is likely to ask, and how I can present the deals more clearly. Keep it specific to that week’s deals and point out where I’ve addressed earlier feedback.

Update the skill automatically and send me a short recap of what changed, with links to the feedback behind it. Keep the previous version so we can undo changes. Leave the accounts, permissions, and recipients unchanged. If feedback conflicts or you can’t access a source, flag it rather than guessing.
```

If asked, choose **Separate Friday task**. This experience supports one recurring schedule per task: keep Monday at 8:30 a.m., rather than replacing it or adding extra no-op runs. If your training account has no configured manager or review meeting, say so and require it to report the gap without unsupported skill changes. Confirm a Friday afternoon time and time zone; **4:00 p.m. Europe/Paris** is one example.

Review Cowork's generated handoff, then copy it into **New → Cowork**. Check it names **Weekly Deal Review** and your existing deck, requires a backup before skill edits, preserves accounts and permissions, keeps customer emails as drafts, and sends the recap only to you. Complete the Friday schedule confirmation. Handoff text alone is not a saved schedule.

This configures future work, not a demonstrated learning result. **No accessible feedback** is valid; invented feedback is not. Automatic changes depend on available sources, permissions and successful runs. Skill-file changes may still wait for approval.

Find **Weekly Deal Review** under **Plugins → Cowork** and the separate Monday and Friday schedules under **Automations**. Check the Friday instructions require a dated backup before edits and report missing or conflicting feedback. After a real feedback run, inspect the change recap, source links and saved previous version.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/separate-automations-dark.webp"><img src="images/separate-automations.webp" alt="Separate Monday pipeline-review and Friday skill-improvement schedules"></picture>

**Quick check:** If a transcript cannot be accessed, should Cowork infer the feedback? **No. Flag the gap and use only substantiated feedback.**

## 🧩 Specialize: use the Zava Sales plugin

**Optional · 8 minutes · New Cowork task**

1. Open **Plugins → Cowork**, search for **Zava Sales**, and install/add it. If already installed, leave it enabled.
2. Review its skills and connections. Complete any requested connection only in the supplied training environment.
3. Start **New → Cowork** so the task discovers the plugin. Leave **Auto / Medium** selected.
4. Send:

<picture><source media="(prefers-color-scheme: dark)" srcset="images/zava-sales-plugin-dark.webp"><img src="images/zava-sales-plugin.webp" alt="The enabled Zava Sales plugin and its two skills"></picture>

```text
Can you catch up on this week’s activity and help me get the CRM up to date?

One thing I haven’t logged anywhere: I had lunch with Morgan Patel from Northstar last Friday. She said they’re planning to grow by 20% next year. Add a note to Northstar so we remember to bring that up in our next account review.

She also mentioned her friend Jamie Chen, who runs purchasing at Summit Youth Sports. They’re adding six youth leagues next season and looking for a supplier for custom team kits. Morgan offered to introduce us next week. Can you create a lead and add a task for me to follow up with Morgan about the introduction next week. I don’t have Jamie’s contact details yet.
```

If asked, confirm the three requested records, your intended follow-up date and time zone. Review each proposed write and inspect the saved account note, lead and task. The **20% growth** is attributed to Morgan; Jamie's email and phone stay unknown; the introduction follow-up is with **Morgan**.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/zava-created-records-dark.webp"><img src="images/zava-created-records.webp" alt="Readback of the saved Northstar note, Jamie Chen lead and introduction follow-up task"></picture>

A plugin can combine **skills, connectors, or both**. It supplies business guidance as well as tools, without bypassing your permissions. Follow the **Zava Sales Hub** link if recommended: a purpose-built app can be the best place to manage the results.

If Zava Sales is missing from the catalog, ask your facilitator rather than installing a lookalike. Before rerunning the prompt, check for existing records to avoid duplicates.

**Quick check:** Should Cowork generate a plausible email address for Jamie? **No. Unknown details remain unknown.**

## 🚀 Take it with you

**Copilot Chat** helps you answer a focused question. **Cowork** coordinates work across files and tools. A **skill** saves the method, an **automation** schedules it, and a **plugin** packages connected capabilities and business guidance.

Which recurring task in your own work deserves a playbook like this?

Explore more scenarios in the **[Cowork Demo Hub](https://aka.ms/CoworkDemoHub)**.

**Before leaving:** open **Automations** and pause the Monday review and any Friday feedback schedule **you created for this lab**, unless your facilitator asks you to keep them running. This prevents unattended credit usage and training emails. Do not change unrelated automations. Resetting the lab's checkmarks does not pause Cowork.

### Product guidance

- [Get started with Cowork](https://learn.microsoft.com/en-us/copilot/cowork/get-started)
- [Using Cowork, approvals, skills and scheduled tasks](https://learn.microsoft.com/en-us/copilot/cowork/use-cowork)
- [Models and effort](https://learn.microsoft.com/en-us/copilot/cowork/cowork-models)
- [Plugins](https://learn.microsoft.com/en-us/copilot/cowork/cowork-plugins)
- [Dataverse data in Copilot](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-data-copilot)
- [Copilot Credits and /cost](https://learn.microsoft.com/en-us/copilot/implement/usage-based-billing-copilot-credits-cost)

Product UI and available capabilities can vary by tenant. Screenshots show the training experience; generated results and calendar dates will differ.
