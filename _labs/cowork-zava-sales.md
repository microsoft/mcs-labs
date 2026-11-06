---
layout: lab
lab_format: missions
module: cowork-latest
title: "Cowork: from insights to action"
order: 114
duration: 30
difficulty: 200
lab_type: local
section: core_learning_path
journeys: ["quick-start", "business-user"]
description: "Prepare a Zava Sales pipeline review, create slides and Outlook drafts, update CRM, and turn the workflow into a reusable, scheduled skill."
classes: wide
author_profile: false
toc: false
mission_lab:
  headline: "From deal insights"
  headline_emphasis: "to action."
  promise: "One sales review. Four core missions, then two ways to go further. Discover when to ask Copilot, when to delegate to Cowork, and how to keep yourself in control."
  hero_image:
    src: /labs/cowork-zava-sales/images/pipeline-three-slides.webp
    alt: "Slide two of a real three-slide pipeline review, separating CRM facts from questions for the deal owners."
    width: 1190
    height: 705
    caption: "Your destination: a review you can use, not just an answer you can read."
  scenario: |
    You sell for **Zava**. Your manager wants a clear view of three accounts: **Northstar Teamwear, Coastal Performance Supply, and BluePeak Athletics**. Prepare the review, log a customer conversation, and make next week's preparation easier.
  prerequisites:
    - "Use your assigned **training account** in a separate browser profile or private window. Do not use your personal or production account."
    - "Open [Copilot Home](https://copilot.cloud.microsoft/home?auth=2). Your facilitator has prepared Microsoft 365 Copilot, Cowork credits, the Zava Sales data, and the plugins."
    - "Keep this lab beside Copilot. All prompts are ready to copy; customer emails must stay **drafts**."
  pacing: "Plan 30 minutes for Ask → Delegate → Act → Repeat. Improve and Specialize are optional extensions (about 14 more minutes); every scenario remains available. These are working budgets, not guaranteed run times: model and connector waits vary. Read ahead or try a quick check while Cowork works, and do not start duplicate tasks."
  missions:
    - id: ask
      verb: Ask
      title: "Find the deal behind the question"
      minutes: 3
      tool: Copilot Chat
      brief: "A useful answer starts with the right context. Find out what needs your attention before the Northstar call."
      outcome: "A grounded call brief and three questions you can actually ask."
      steps:
        - title: "Leave the smart defaults on"
          instruction: "From **Home**, select **Chat**. Open the model picker, notice the fast-answer and deeper-thinking choices, then leave **Auto** selected. Keep **Work IQ on**."
          help: |
            1. In the Home composer, choose **Chat**, not Cowork.
            2. Open **Auto**. Quick response favors speed; Think deeper spends longer on reasoning. Auto chooses based on the request.
            3. Close the picker. If the Work IQ control offers **Turn off Work IQ**, it is already on.
          screenshot:
            title: the Chat model picker
            src: /labs/cowork-zava-sales/images/chat-model-picker.webp
            src_dark: /labs/cowork-zava-sales/images/chat-model-picker-dark.webp
            alt: "Copilot Chat model picker showing Auto, Quick response and Think deeper, with Work IQ enabled."
            width: 1203
            height: 640
            caption: "Leave Auto selected for this lab. The models offered can vary by tenant."
          notice: "Work IQ connects the answer to work context you are allowed to access: files, email, meetings, Teams, and configured business data. It does **not** grant new permissions or guarantee that every source contains a match."
        - title: "Ask about the renewal"
          instruction: "Send the prompt. Watch the visible search and tool activity, then open a source to check what supports the answer."
          prompt_label: Copilot Chat
          prompt: "Help me prepare for a call about Northstar Teamwear’s $250K Pulse renewal. Where does the deal stand, what needs my attention, and what are the three most important questions to ask on the call?"
          notice: "Look for **Zava Sales** or business-data results. Distinguish a fact from a suggested question. If a source is missing, the safe answer is to say so—not invent a deal status."
      reveal:
        title: "Why is this more than a clever search?"
        line: "The answer is only as grounded as its evidence."
        explanation: "Auto decides how to tackle the question; Work IQ supplies permitted work context. Neither makes an unsupported statement true. The useful habit is **ask, inspect a source, then decide**."
        flow: ["Your question", "Permitted work context", "Evidence you check"]
      check:
        question: "Work IQ is on. Does that mean Copilot can see every record in your company?"
        options:
          - text: "Yes, switching it on unlocks all company data."
            correct: false
            feedback: "The switch does not change your permissions or configure missing data sources."
          - text: "No, it uses available sources within my access."
            correct: true
            feedback: "Source configuration, your permissions, and the available records still matter."
      stuck:
        - problem: "The response cannot find the Northstar deal."
          solution: "Check that you used the assigned training account and left Work IQ on. Open the search details. Ask the facilitator to check Zava Sales business-data access if it is missing; do not treat a generic answer as a verified CRM result. The Dataverse connection in the next mission is a separate capability."
        - problem: "My model picker looks different."
          solution: "Leave the automatic/default model choice selected. Model availability depends on your tenant; the point is the speed-versus-reasoning trade-off, not a particular model name."

    - id: delegate
      verb: Delegate
      title: "Make the review, not just a reply"
      minutes: 10
      tool: Cowork + Microsoft Dataverse
      brief: "Delegate a multi-step outcome: gather the deals, build slides, and prepare customer follow-ups. Then apply your judgment."
      outcome: "Three slides separating known facts from open questions, plus real Outlook drafts."
      steps:
        - title: "Connect Microsoft Dataverse"
          instruction: "Go to **Plugins → Cowork → Microsoft Dataverse**. Enable it and connect to the training CRM. This gives Cowork tools to work with records, including creating and updating them when you approve."
          help: |
            1. Open **Plugins**, then the **Cowork** tab.
            2. Select **Microsoft Dataverse** and turn **Enable Microsoft Dataverse** on.
            3. Select **Connect Microsoft Dataverse**.
            4. Enter `https://zavasalesdemo.crm.dynamics.com/` and select **Connect**.
            5. Confirm the connection shows **Connected**. If it already does, do not reconnect.
          screenshot:
            title: the Dataverse environment connection
            src: /labs/cowork-zava-sales/images/dataverse-connection.webp
            alt: "Microsoft Dataverse plugin connection dialog with the Zava Sales training environment URL."
            width: 815
            height: 770
            caption: "Use the supplied training environment, not a production CRM."
        - title: "Switch to Cowork and delegate"
          instruction: "Select **New**, then **Cowork** in the Home composer. Leave the model on **Auto** and effort on **Medium**. Keep this task for the remaining core missions; the optional Improve mission starts here before its separate Friday task."
          prompt_label: New Cowork task
          prompt: "I’ve got a pipeline review with my manager tomorrow. Help me get ready to talk through our biggest open deals with Northstar Teamwear, Coastal Performance Supply, and BluePeak Athletics. Put together a few slides on where we stand and what we need to do to close them, and draft any customer follow-ups I should send."
          screenshot:
            title: model and effort settings
            src: /labs/cowork-zava-sales/images/cowork-model-effort.webp
            src_dark: /labs/cowork-zava-sales/images/cowork-model-effort-dark.webp
            alt: "Cowork model and generation settings showing Auto and Medium, with the effort control ranging from faster to smarter."
            width: 760
            height: 410
            caption: "Higher effort spends more time and credits on the task. Medium is the lab default."
          notice: "Watch Cowork form a plan, query Zava Sales, create the deck, and save follow-ups in **Outlook**. Standard Copilot Chat use is included with the Microsoft 365 Copilot license; **Cowork uses metered Copilot Credits**. Available frontier models and tools depend on your tenant."
        - title: "Steer before you trust"
          instruction: "As soon as a first deck appears, open it and inspect the proposed decisions. Send the correction below in the same task. If Cowork is still working, use **Queue**; it will handle the follow-up after the current work."
          prompt_label: Same Cowork task
          prompt: "This is a good start, but you’re making a few calls I’d want to check with the deal owners first. Don’t assume we need to push Coastal to Q1 or change anyone’s forecast. Make it clear what we know and what we still need to ask. And cut it to three slides—I’ve only got five minutes with my manager."
          screenshot:
            title: the three-slide review
            src: /labs/cowork-zava-sales/images/pipeline-three-slides.webp
            alt: "Slide two of the Cowork-created PowerPoint review, showing known facts and questions for Northstar, Coastal and BluePeak."
            width: 1190
            height: 705
            caption: "The deck is edited in place. This example includes the later Riley call update; your wording, styling and live CRM values may differ."
          notice: "Confirm the deck now has **three slides**, and open the output cards marked **Saved to drafts**. Suggested email text in a chat is not the same as an Outlook draft. Do not send customer emails in this lab."
      reveal:
        title: "Where did your judgment matter?"
        line: "Delegate the work. Keep the decisions."
        explanation: "Cowork can coordinate tools, larger files and multi-step work over time. That is different from asking for a short answer. Your correction turns plausible recommendations into a review that separates **what the CRM says** from **what the deal owner must confirm**."
        flow: ["Delegate an outcome", "Inspect real outputs", "Steer the work"]
      check:
        question: "Cowork recommends moving Coastal to next quarter. What is the right next move?"
        options:
          - text: "Let it update the forecast because it has read the CRM."
            correct: false
            feedback: "Reading a record is not authority to change a business commitment."
          - text: "Ask it to separate evidence from assumptions and confirm with the owner."
            correct: true
            feedback: "You can delegate preparation without delegating the forecast decision."
      stuck:
        - problem: "The deck preview is blank or covered."
          solution: "Wait for the file to finish loading and dismiss any first-run Office privacy notice. Use the output file's open action if the embedded preview is unavailable. Do not restart the entire Cowork task."
        - problem: "It is taking longer than the mission budget."
          solution: "Check whether Cowork is waiting for your approval. If it is actively working, read the next step or queue the correction once the first deck exists. Run time varies; generating a second task duplicates work and consumes more credits."

    - id: record
      verb: Act
      title: "Turn a conversation into a commitment"
      minutes: 8
      tool: Dataverse + PowerPoint + Outlook
      brief: "Riley gives you one new fact and you make one promise. Put both into the system of record, then bring the review up to date."
      outcome: "A completed phone call and an owned follow-up task linked to the renewal, reflected in the slides and draft."
      steps:
        - title: "Log the call and the promise"
          instruction: "Send this in the same Cowork task. Review the proposed record details before approving: the **$250K Northstar renewal**, the call recap, the task owner, and the calendar date chosen for **next Friday**."
          prompt_label: Same Cowork task
          prompt: "Just spoke with Riley at Northstar about the $250K renewal. They need a phased rollout plan before final approval, and I promised to send it by next Friday. Create a completed phone call with that recap and a task for me to send the plan. Link both to the renewal."
          screenshot:
            title: the write approval
            src: /labs/cowork-zava-sales/images/dataverse-approval.webp
            alt: "Cowork asking for approval before creating a Dataverse phone call, showing its recap and relationship to the Northstar renewal."
            width: 795
            height: 510
            caption: "Read the proposed write before approving. Creating the call, completing it and creating the task can require separate approvals."
          notice: "Prefer the one-time **Approve/Allow** action while learning. A session-wide always-allow choice, if offered, reduces future prompts for that permission; it is not permission to stop reviewing what the task is doing."
        - title: "Verify the records, then refresh the outputs"
          instruction: "Check the returned records: the phone call is **Completed**; the task is assigned to you, has a due date, and both records point to the renewal. Then send the next prompt."
          prompt_label: Same Cowork task
          prompt: "Update my slides with what we learned from Riley, and change the draft email to her into a recap of our call. Mention that I’ll send the rollout plan by the deadline on my task."
          notice: "Open the updated deck and Riley's draft. The rollout-plan deadline should match the **task's actual due date**, not a fresh guess about what “next Friday” means. Keep the email unsent."
      reveal:
        title: "What changed beyond the chat?"
        line: "The promise now has an owner and a date."
        explanation: "A polished recap is useful. A linked CRM activity and task make it actionable. The approval is a moment to inspect the proposed change; the returned record is how you check it actually happened."
        flow: ["Customer conversation", "Approved CRM records", "Updated review"]
      check:
        question: "What proves the CRM work is complete?"
        options:
          - text: "Cowork says it understood the request."
            correct: false
            feedback: "An acknowledgment is not a saved business record."
          - text: "The linked records exist with the right status, owner and due date."
            correct: true
            feedback: "Verify the effect in the system of record, not just the wording of the answer."
      stuck:
        - problem: "Cowork asks which renewal or what date I meant."
          solution: "Choose Northstar's **$250K Pulse renewal**, not its other deal. Confirm the intended calendar date in your training account's time zone before approving."
        - problem: "A record creation fails."
          solution: "Read the reported error. Let Cowork correct a schema issue if it can, but do not grant wider permissions or switch environments. Check whether a record already exists before retrying so you do not create duplicates."
        - problem: "The call is saved but some fields are missing."
          solution: "Check Cowork's disclosure and the actual record. In the training run, the call recap and renewal link were saved, but caller/recipient fields failed. A completed status does not mean every field was populated; ask your facilitator before treating omitted details as complete."

    - id: repeat
      verb: Repeat
      title: "Save the method. Schedule the work."
      minutes: 9
      tool: Skills + Automations
      brief: "Stop repeating the same instructions every Monday. Give the preparation a name, then decide when it should run."
      outcome: "A Weekly Deal Review skill and one Monday 8:30 a.m. schedule with customer emails kept as drafts."
      steps:
        - title: "Make the weekly intent explicit"
          instruction: "Send the first prompt. If Cowork asks for a time zone or opens **Create recurring task**, answer and review it before continuing. Select **Schedule** to save that one Monday job; the later prompt refines it rather than creating a duplicate. Leave **Run once now** off unless you want an additional test run."
          prompt_label: Same Cowork task
          prompt: "Let’s make this my weekly pipeline review. Every Monday morning, refresh the three slides for these accounts, highlight what’s changed, and draft any follow-ups I should review."
        - title: "Save the procedure as a skill"
          instruction: "Send the next prompt and let Cowork finish creating the skill. Check that the saved instructions retain the three accounts, three slides, facts-versus-questions distinction, and draft-only customer follow-ups."
          prompt_label: Same Cowork task
          prompt: "This is how I want to prepare for my pipeline reviews. Save it as a skill called Weekly Deal Review: the same three accounts, three slides, clear separation between what we know and what we need to ask, and customer follow-up drafts for me to review."
          screenshot:
            title: your saved skill
            src: /labs/cowork-zava-sales/images/saved-skill.webp
            src_dark: /labs/cowork-zava-sales/images/saved-skill-dark.webp
            alt: "The Cowork plugins catalog with the saved weekly-deal-review skill alongside the installed Zava Sales and Microsoft Dataverse plugins."
            width: 1000
            height: 350
            caption: "Your skill can appear under its folder name, weekly-deal-review."
          notice: "A **skill is reusable instructions and a procedure**, not a newly trained model. Find it in **Plugins → Cowork**, sometimes displayed as **weekly-deal-review**. A new task discovers the saved skill; this task already has the conversation context."
        - title: "Set the time and review the schedule"
          instruction: "Send the scheduling prompt. Review the proposed changes, then confirm **Monday, 8:30 a.m., the intended time zone, your own email as the recipient, and customer emails as drafts**. Complete **Next → Review permissions → Approve** when offered. Leave only one Monday review schedule."
          prompt_label: Same Cowork task
          prompt: "Run Weekly Deal Review every Monday at 8:30 a.m. and email me the slides. Keep the customer emails as drafts for me to review."
          help: |
            1. Open the schedule card or **Automations**.
            2. Check the recurrence, time zone and account that will run it.
            3. Confirm the weekly email goes only to **you**, not to the customers.
            4. For a new schedule, select **Schedule**. When updating it, complete **Next → Review permissions → Approve** as offered; check that email permission is limited to your own account. Some tenants show **Save** or **Activate** instead. **Run once now** or a preview action lets you test without waiting for Monday; leave it off if you only want the scheduled run.
            5. If the first weekly prompt already created a schedule, update that schedule instead of keeping a duplicate.
          notice: "Creating the schedule configures future work; it does not prove a future run has succeeded. Check **Automations → Runs** afterwards. Use only your training account for any test email."
        - title: "Check the cost of the work"
          instruction: "Return to the pipeline-review task and run the command below. You have reached the end of the core lab; continue to the optional missions if time allows."
          prompt_label: Same Cowork task
          prompt: /cost
          screenshot:
            title: the task usage summary
            src: /labs/cowork-zava-sales/images/task-cost.webp
            src_dark: /labs/cowork-zava-sales/images/task-cost-dark.webp
            alt: "The /cost command returning cumulative credits used for the Cowork task, monthly usage and a View usage button."
            width: 792
            height: 230
            caption: "Example only: usage depends on the work, model, effort and retries. This is not a fixed lab cost."
          notice: "`/cost` reports approximate cumulative usage for this task; running the command is free. **One Copilot Credit is roughly US$0.01 at the standard pay-as-you-go rate**, not a guaranteed invoice amount. Pricing, discounts and tenant billing arrangements can differ."
      reveal:
        title: "Skill or schedule—which does what?"
        line: "The skill is the how. The schedule is the when."
        explanation: "The skill captures a repeatable way of working. The automation starts that work on a clock. Keeping them separate lets you improve the method without rewriting every recurring request."
        flow: ["Useful procedure", "Named skill", "Scheduled run"]
      check:
        question: "You saved Weekly Deal Review as a skill. Will it now run every Monday by itself?"
        options:
          - text: "Yes, saving the skill creates the recurrence."
            correct: false
            feedback: "Reusable instructions are not a timer. Check for an activated schedule separately."
          - text: "No, the skill still needs an activated schedule."
            correct: true
            feedback: "Verify both the saved skill and the Monday automation."
      stuck:
        - problem: "I see two Monday reviews."
          solution: "Keep one schedule with the final 8:30 a.m. settings. Pause or remove only the duplicate you created for this lab; do not change unrelated automations."
        - problem: "The skill or schedule is still being prepared."
          solution: "Wait for its confirmation and inspect the saved item. Do not assume a conversational “I will” is proof that it was created or activated."

    - id: improve
      verb: Improve
      title: "Let feedback improve the method"
      optional: true
      minutes: 6
      tool: Work IQ + skill maintenance
      brief: "Your manager's feedback should not disappear after the meeting. Ask for a sourced, reversible improvement loop—not unchecked self-improvement."
      outcome: "A separate Friday feedback-review schedule with source checks and instructions to back up the skill before changing it."
      steps:
        - title: "Give the feedback loop its guardrails"
          instruction: "Send the complete prompt in your pipeline-review task so Cowork can connect coaching to Monday's email. If asked, choose **Separate Friday task**: this experience supports one recurring schedule per task. Keep Monday at 8:30 a.m.; do not replace it or accept extra no-op runs."
          prompt_label: Same Cowork task
          prompt: |-
            Every Friday afternoon, look back at this week’s deal review and the feedback my manager gave me—in comments on the deck, the review meeting recording or transcript, Teams, and email.

            Use that feedback to improve the Weekly Deal Review skill so next week’s review gets better without me repeating the same instructions. Pick up on what they wanted more or less of, which questions they kept asking, and what helped them make decisions. Distinguish lasting preferences from requests that only apply to a particular deal or week.

            In the email you send with my weekly review, coach me based on previous feedback too: what to prepare, which questions my manager is likely to ask, and how I can present the deals more clearly. Keep it specific to that week’s deals and point out where I’ve addressed earlier feedback.

            Update the skill automatically and send me a short recap of what changed, with links to the feedback behind it. Keep the previous version so we can undo changes. Leave the accounts, permissions, and recipients unchanged. If feedback conflicts or you can’t access a source, flag it rather than guessing.
          notice: "If asked about a manager or meeting that your training account does not have, say so. Ask it to report that gap and make no unsupported skill changes. Confirm a Friday afternoon time and time zone; **4:00 p.m. Europe/Paris** is one example, not a required default."
        - title: "Give Friday its own task"
          instruction: "Review Cowork's generated handoff instructions, then copy them into **New → Cowork**. They should name **Weekly Deal Review** and your existing deck, require a backup before skill edits, keep customer emails as drafts, and send the recap only to you. Complete the Friday schedule confirmation. A handoff in the chat is not a saved schedule."
          notice: "This configures future work, not a demonstrated learning result. **No accessible feedback** is a valid result. Automatic updates depend on sources, permissions and successful runs. Skill-file changes may still wait for approval; a backup is needed before the first actual edit."
        - title: "Inspect what persists"
          instruction: "Find **Weekly Deal Review** under **Plugins → Cowork**, and review the separate Monday and Friday entries under **Automations**. Check the Friday instructions require a dated backup before edits and report missing or conflicting feedback. After a real feedback run, inspect the change recap, source links and saved previous version."
          screenshot:
            title: the two separate automations
            src: /labs/cowork-zava-sales/images/separate-automations.webp
            src_dark: /labs/cowork-zava-sales/images/separate-automations-dark.webp
            alt: "Automations showing a Friday 4 p.m. skill-improvement schedule and a separate Monday 8:30 a.m. pipeline-review schedule."
            width: 1008
            height: 336
            caption: "Two jobs, two purposes. Check your chosen time zone and pause lab-created schedules before leaving."
      reveal:
        title: "What should it learn—and what should it leave alone?"
        line: "Improve the recipe, not the boundaries."
        explanation: "“Always separate facts from assumptions” can be a lasting preference. “Add one slide about this week's exception” may not be. Sources, a short change recap and a recoverable previous version make skill edits reviewable. They do not make future improvements infallible."
        flow: ["Accessible feedback", "Sourced skill revision", "Your review and undo"]
      check:
        question: "Cowork cannot access the review meeting transcript. What should the Friday run do?"
        options:
          - text: "Infer what the manager probably said and update the skill."
            correct: false
            feedback: "That would turn a guess into a lasting instruction."
          - text: "Flag the gap and use only feedback it can substantiate."
            correct: true
            feedback: "Missing evidence is a boundary to report, not a blank to fill."
      stuck:
        - problem: "No Friday schedule was saved."
          solution: "Check whether Cowork gave you handoff instructions for a new task. Start that separate task and complete its scheduling and permission cards. Inspect Automations before retrying; do not overwrite Monday."
        - problem: "No feedback exists in this training account."
          solution: "Keep the missing-source safeguard. This mission sets up how future feedback should be handled; it does not require fabricating a manager, meeting or review."

    - id: specialize
      verb: Specialize
      title: "Give Cowork the sales team's playbook"
      optional: true
      minutes: 8
      tool: Zava Sales plugin
      brief: "A general-purpose assistant knows tools. A business plugin can also give it the team's way of using those tools."
      outcome: "A Northstar account note, a Summit Youth Sports lead with unknown contact details left unknown, and an introduction follow-up task."
      steps:
        - title: "Install Zava Sales, then start a fresh task"
          instruction: "Open **Plugins → Cowork**, search for **Zava Sales**, and install it. Start **New → Cowork** so the new task can discover its capabilities. Leave Auto / Medium selected."
          help: |
            1. Open **Plugins** and select the **Cowork** tab.
            2. Search the available plugins for **Zava Sales**.
            3. Open it, review the capabilities, and select **Install** or **Add** as offered. If it is already installed, leave it enabled.
            4. Complete a connection only if the plugin asks for one, using the supplied training environment.
            5. Start a **new Cowork task**. Do not paste this into the pipeline-review task.
          notice: "A plugin can package **skills, connectors, or both**. Zava Sales adds business-specific instructions; it does not bypass your data permissions or approval requirements."
          screenshot:
            title: the installed Zava Sales plugin
            src: /labs/cowork-zava-sales/images/zava-sales-plugin.webp
            src_dark: /labs/cowork-zava-sales/images/zava-sales-plugin-dark.webp
            alt: "The enabled Zava Sales plugin showing its zava-sales and daily-crm-update skills."
            width: 800
            height: 485
            caption: "Inspect what the plugin adds. This one includes a sales playbook and a daily CRM-update skill."
        - title: "Catch up and log what only you know"
          instruction: "Send the full prompt. If asked, confirm the three requested records, your intended follow-up date and time zone. Review each proposed write, then inspect the saved records. Follow the **Zava Sales Hub** link if Cowork recommends it."
          prompt_label: New Cowork task with Zava Sales installed
          prompt: |-
            Can you catch up on this week’s activity and help me get the CRM up to date?

            One thing I haven’t logged anywhere: I had lunch with Morgan Patel from Northstar last Friday. She said they’re planning to grow by 20% next year. Add a note to Northstar so we remember to bring that up in our next account review.

            She also mentioned her friend Jamie Chen, who runs purchasing at Summit Youth Sports. They’re adding six youth leagues next season and looking for a supplier for custom team kits. Morgan offered to introduce us next week. Can you create a lead and add a task for me to follow up with Morgan about the introduction next week. I don’t have Jamie’s contact details yet.
          notice: "Check that the **20% growth** is recorded as something Morgan told you, not independently verified fact. Jamie's email and phone should remain unknown. The follow-up is with **Morgan about an introduction**, not an invented direct outreach to Jamie."
          screenshot:
            title: the saved note, lead and task
            src: /labs/cowork-zava-sales/images/zava-created-records.webp
            src_dark: /labs/cowork-zava-sales/images/zava-created-records-dark.webp
            alt: "Cowork's readback of the Northstar account note, Jamie Chen lead with unknown contact details omitted, and the introduction follow-up task."
            width: 792
            height: 581
            caption: "Three saved records, not just suggested text. Your record IDs and calendar dates will differ."
      reveal:
        title: "Why package this as a plugin?"
        line: "Tools plus a playbook beat tools alone."
        explanation: "The connector makes business actions possible. The skill supplies repeatable guidance about how the team wants them done. A purpose-built app such as Zava Sales Hub can still be the best place to inspect and manage the resulting records."
        flow: ["Your unlogged context", "Business-specific guidance", "Reviewable CRM updates"]
      check:
        question: "Jamie has no known email address. What should you expect in the new lead?"
        options:
          - text: "A plausible email address generated from the company name."
            correct: false
            feedback: "Plausible is not known. Invented contact information makes the CRM less reliable."
          - text: "The known details, with email and phone left unknown."
            correct: true
            feedback: "The task to ask Morgan for an introduction is how you close the information gap."
      stuck:
        - problem: "Zava Sales is not in the plugin catalog."
          solution: "Confirm the assigned training account and ask your facilitator to check deployment. Do not install an unrelated plugin with a similar name."
        - problem: "I need to rerun this prompt."
          solution: "First inspect whether the note, lead or task already exists. Ask Cowork to reuse the existing records rather than making duplicates."
  finish:
    title: "You changed more than a document."
    message: "You moved from finding evidence to delegating work, approving real changes, and preserving a repeatable way of working."
    takeaways:
      - label: Copilot Chat
        text: "Ask a focused question and inspect the evidence."
      - label: Cowork
        text: "Delegate an outcome across files and tools, then steer and verify it."
      - label: Skill
        text: "Save the method you want repeated."
      - label: Automation
        text: "Choose when the work runs, then check its runs and outputs."
      - label: Plugin
        text: "Package business guidance and connected capabilities."
    reflection: "Which recurring task in your work deserves a playbook like this?"
    cleanup: "Before leaving, open **Automations** and pause the Monday review and any Friday feedback schedule **you created for this lab**, unless your facilitator asks you to keep them running. This prevents unattended credit usage and training emails. Do not change unrelated automations. Resetting the lab's checkmarks does not pause Cowork."
  sources:
    - title: Get started with Cowork
      url: https://learn.microsoft.com/en-us/copilot/cowork/get-started
    - title: Using Cowork, approvals, skills and scheduled tasks
      url: https://learn.microsoft.com/en-us/copilot/cowork/use-cowork
    - title: Cowork models and effort
      url: https://learn.microsoft.com/en-us/copilot/cowork/cowork-models
    - title: How Cowork plugins work
      url: https://learn.microsoft.com/en-us/copilot/cowork/cowork-plugins
    - title: Dataverse business data in Copilot
      url: https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-data-copilot
    - title: Understanding Copilot Credit usage and /cost
      url: https://learn.microsoft.com/en-us/copilot/implement/usage-based-billing-copilot-credits-cost
    - title: Usage-based billing overview
      url: https://learn.microsoft.com/en-us/copilot/plan/usage-based-billing-overview-copilot-credits
---

# Cowork: from insights to action

Prepare a Zava Sales pipeline review, create real slides and Outlook drafts, update CRM, and turn the procedure into a reusable, scheduled skill.

## Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| 200 | Business user | 30 minutes | A reviewed deck, draft follow-ups, linked CRM records, a reusable skill and scheduled preparation. |

Use your assigned **training account**, not a personal or production account. Your facilitator prepares Cowork access, credits, Zava Sales data and plugins. Keep customer emails as **drafts**.

Plan **30 minutes for the four core missions**: Ask → Delegate → Act → Repeat. Improve and Specialize are **optional extensions, about 14 more minutes**; no scenario has been removed. These are working budgets, not guaranteed run times. Read ahead or try a quick check while Cowork works; do not start duplicate tasks.

## Table of Contents

- [Ask: find the deal](#ask-find-the-deal)
- [Delegate: make the review](#delegate-make-the-review)
- [Act: record the commitment](#act-record-the-commitment)
- [Repeat: save and schedule](#repeat-save-and-schedule)
- [Improve: learn from feedback (optional)](#improve-learn-from-feedback)
- [Specialize: use the Zava Sales plugin (optional)](#specialize-use-the-zava-sales-plugin)
- [Take it with you](#take-it-with-you)

## Ask: find the deal

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

## Delegate: make the review

**10 minutes · Cowork**

1. Go to **Plugins → Cowork → Microsoft Dataverse**.
2. Turn **Enable Microsoft Dataverse** on, then **Connect Microsoft Dataverse**.
3. Enter `https://zavasalesdemo.crm.dynamics.com/`, select **Connect**, and confirm **Connected**. If already connected, leave it alone.

![Dataverse connection dialog](images/dataverse-connection.webp)

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

## Act: record the commitment

**8 minutes · Dataverse, PowerPoint and Outlook**

Send in the same task:

```text
Just spoke with Riley at Northstar about the $250K renewal. They need a phased rollout plan before final approval, and I promised to send it by next Friday. Create a completed phone call with that recap and a task for me to send the plan. Link both to the renewal.
```

Review the **$250K Northstar renewal**, recap, task owner and calendar date for **next Friday** before approving. Prefer one-time **Approve/Allow** while learning. Session-wide always-allow, if offered, reduces future prompts for that permission; it does not remove your responsibility to review.

![Dataverse approval before creating the phone call](images/dataverse-approval.webp)

Creating the call, completing it and creating the task can need separate approvals. Verify the phone call is **Completed**, the task is assigned to you with the right date, and both records are linked to the renewal. If a write fails, read the error and check for an existing record before retrying.

Check any disclosed omissions too. In the training run, the call recap and renewal link were saved but caller/recipient fields failed. A completed status does not mean every field was populated; ask your facilitator before treating omitted details as complete.

Then send:

```text
Update my slides with what we learned from Riley, and change the draft email to her into a recap of our call. Mention that I’ll send the rollout plan by the deadline on my task.
```

Check the updated slides and Riley's unsent draft. The deadline must match the **saved task**, not a new interpretation of “next Friday.”

**Quick check:** What proves completion? **The returned records and their actual status, owner, due date and relationship**, not just an acknowledgment.

## Repeat: save and schedule

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

**Core lab complete.** [Take it with you](#take-it-with-you), or continue with the optional missions below.

## Improve: learn from feedback

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

## Specialize: use the Zava Sales plugin

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

## Take it with you

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
