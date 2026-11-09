---
slug: cowork-zava-sales
permalink: /labs/cowork-zava-sales/
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
description: "Find a proposal in Copilot Chat, act through the Zava Sales Hub agent and its MCP App, then delegate a branded pipeline review to Cowork and save the workflow."
classes: wide
author_profile: false
toc: false
mission_lab:
  headline: "From deal insights"
  headline_emphasis: "to action."
  promise: "One sales scenario. Four core missions, then three optional extensions. Discover when to ask Copilot Chat, use a specialist agent, or delegate to Cowork."
  hero_image:
    src: /labs/cowork-zava-sales/images/pipeline-three-slides.webp
    alt: "A Zava-branded slide from the verified three-slide pipeline review, separating CRM facts from questions for the deal owners."
    width: 2688
    height: 1512
    caption: "Your destination: a review you can use, not just an answer you can read."
  scenario: |-
    You sell for **Zava**. First, find an earlier **Northwind Trader** proposal for your boss. Then prepare for a **Northstar Teamwear** renewal call and capture a new lead. Finally, build a branded pipeline review covering **Northstar Teamwear, Coastal Performance Supply, and BluePeak Athletics**, and make next week's preparation easier.
  self_setup: |-
    Arrange Copilot access with Work IQ, the sample Northwind proposal, Cowork credits, and Zava Sales training data before starting. Make the **Zava Sales Hub agent with its lead-creation MCP App** available in Chat, and provide the **Microsoft Dataverse** and **Zava PowerPoint** plugins in Cowork. The separate **Zava Sales** Cowork plugin is needed only for the optional Specialize mission. These are demo assets to obtain from your facilitator, not built-in capabilities to recreate during this lab.
  prerequisites:
    - "Ask your proctor if Copilot access, credits, the sample proposal, the **Zava Sales Hub** agent or plugins are missing. Do not spend the lab provisioning them."
    - "Use your assigned **training account** in a separate browser profile or private window. Do not use your personal or production account."
    - "Open [Microsoft Copilot](https://copilot.cloud.microsoft/home?auth=2). Start in **Chat, not Cowork**. You will explicitly switch to Cowork after the first two missions."
    - "In another tab, open [Zava Sales Hub](https://aka.ms/ZavaSalesHub), the CRM in this scenario. It is a Copilot Managed Runtime app and Copilot Studio agent built on Dataverse sample sales data: accounts, contacts, leads, opportunities and activities. On first use, check that the Microsoft Dataverse consent shows your assigned training account, then select **Allow**. Wait for **Live CRM** before checking records."
    - "All prompts are ready to copy; customer emails must stay **drafts**."
  pacing: "The 30-minute core is Ask (3) → Act (7) → Delegate (11) → Repeat (9). The Riley call and CRM update, Friday feedback loop, and Zava Sales plugin exercise remain available as optional extensions: 8 + 6 + 8 minutes, about 52 minutes for everything. Budgets include reviewing results, but model and connector waits vary. At minute 21, move toward saving and scheduling the review; skip extensions, not approvals or output checks. Read ahead while Cowork works and do not start duplicate tasks."
  missions:
    - id: ask
      verb: Ask
      title: "Find the proposal behind the question"
      minutes: 3
      tool: Copilot Chat
      brief: "Your boss wants the old Northwind proposal, its economic buyer, and the decision criteria. Start with a question about a work file, not live CRM records."
      outcome: "The source proposal and a summary you can check against it."
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
            width: 1032
            height: 1146
            caption: "Leave Auto selected for this lab. The models offered can vary by tenant."
          notice: "Work IQ connects the answer to work context you are allowed to access, such as files, email, meetings and Teams. It does **not** grant new permissions. Finding a proposal does not prove that Chat can retrieve a live CRM deal."
        - title: "Find the Northwind proposal"
          instruction: "Send the prompt in **Copilot Chat**, not Cowork or an agent conversation. Open the proposal citation and check the economic buyer and decision criteria against the document."
          prompt_label: Copilot Chat
          prompt: "Can you help me find and summarize the proposal we made to Northwind Trader a few month back? who was the economic buyer again, what was their decision criteria? my boss is asking..."
          screenshot:
            title: a proposal-grounded answer
            src: /labs/cowork-zava-sales/images/proposal-answer.webp
            src_dark: /labs/cowork-zava-sales/images/proposal-answer-dark.webp
            alt: "Copilot Chat cites Commercial_Proposal_Northwind_Traders and summarizes the proposal, economic buyer and decision criteria."
            width: 2025
            height: 785
            caption: "Check the cited proposal, not just the fluent summary. A past proposal is not evidence of today's CRM status."
          notice: "The sample file is `Commercial_Proposal_Northwind_Traders`. Verify the buyer and criteria in your copy; do not memorize an example answer or infer the current deal status from an old document."
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
        - problem: "The response cannot find the Northwind proposal."
          solution: "Check the assigned training account and Work IQ setting. Ask your facilitator to check access to `Commercial_Proposal_Northwind_Traders`. Missing sample content is not a reason to provision Dataverse or invent a buyer."
        - problem: "My model picker looks different."
          solution: "Leave the automatic/default model choice selected. Model availability depends on your tenant; the point is the speed-versus-reasoning trade-off, not a particular model name."

    - id: agent
      verb: Act
      title: "Let the sales agent finish the job"
      minutes: 7
      tool: Copilot Chat + Zava Sales Hub
      brief: "A work-file answer and a live CRM brief are different jobs. Watch Chat hand off to a specialist agent, then use an interactive form inside that conversation."
      outcome: "A grounded Northstar call brief and a reviewed John Doe lead created through the agent's MCP App."
      steps:
        - title: "Start a new Chat for the renewal"
          instruction: "Select **New**, then confirm **Chat**, not Cowork. This is a **new Copilot Chat session**, separate from the Northwind proposal conversation. Send the prompt and inspect what Chat can substantiate."
          prompt_label: New Copilot Chat session
          prompt: "Help me prepare for a call about Northstar Teamwear’s $250K Pulse renewal. Where does the deal stand, what needs my attention, and what are the three most important questions to ask on the call?"
          notice: "In this training experience, Chat may not retrieve the live deal and can recommend **Zava Sales Hub** instead. That is the handoff to explore, not proof that Dataverse is unavailable in every Copilot Chat tenant. Do not accept a generic call plan as a verified CRM brief."
        - title: "Follow the Zava Sales Hub recommendation"
          instruction: "Select the recommendation to **Try Zava Sales Hub**. Check that the same renewal prompt is carried into the agent conversation; send it if it is only prefilled. Confirm that you are now talking to **Zava Sales Hub**, then review its deal status, attention points and three call questions against the returned records."
          notice: "The recommendation's wording can vary. If no card appears, open **Agents & Plugins → Chat**, find the facilitator-provided **Zava Sales Hub** agent, and paste the same prompt there. Some sessions shorten the sidebar label to **Plugins**. If Chat starts a research task instead, select **Stop task** on that task card before opening the agent; do not wait for a separate research run in this exercise. If the agent is unavailable, ask the proctor; do not install a lookalike or invent the CRM answer."
        - title: "Create a lead in the MCP App"
          instruction: "In the **same Zava Sales Hub agent conversation**, send the follow-up. Select **Confirm** when prompted, complete and review the embedded lead form, then select **Accept and save** once. This interactive form inside the agent is an **MCP App**, not a switch to Cowork."
          prompt_label: Follow-up in Zava Sales Hub
          prompt: "Thanks, btw can you help me create a new lead for them? John Doe mentioned a $50,000 project in the Denver area, details to be sent in a couple of weeks."
          help: |
            1. Review the confirmation: the target is the **Lead** table and the source text describes the new Northstar project. Select **Confirm**.
            2. In the lead form, titled **Create new lead record** or **Create new record for Northstar Teamwear**, review **First name: John**, **Last name: Doe**, **Company name: Northstar Teamwear**, and **City: Denver**.
            3. Complete **Lead Name** if blank, for example `Northstar Teamwear - Denver project`. Fill **Topic** with the known project details, including that more details are expected in a couple of weeks.
            4. Scroll **inside the form** and check **Estimated value: 50000**. If it is blank or the form warns that it could not fill `$50,000`, enter `50000` without the currency symbol or comma. Leave unknown email, phone and other details empty; a company-name string is not proof that the **Account** lookup is linked.
            5. Select **Accept and save** once. Look for **Your changes have been saved successfully**; the form becomes **Update lead record**. Use **Open** to inspect the saved record if needed.
          screenshot:
            title: the interactive lead form
            src: /labs/cowork-zava-sales/images/lead-mcp-app.webp
            src_dark: /labs/cowork-zava-sales/images/lead-mcp-app-dark.webp
            alt: "The Zava Sales Hub MCP App inside the agent conversation, with John Doe, Northstar Teamwear and Denver suggested, and an Accept and save button."
            width: 2232
            height: 1905
            caption: "Review the suggested values and fill any missing known details before saving. Scroll inside the form to check the estimated value."
          notice: "Review **John Doe**, **$50,000**, **Denver**, and the Northstar context before saving. Keep unknown contact details unknown. The $50,000 lead is separate from the $250K renewal; do not overwrite the renewal amount. Check the saved lead before retrying to avoid duplicates."
      reveal:
        title: "Why did switching conversations help?"
        line: "The specialist supplies the tools. The MCP App supplies the form."
        explanation: "Copilot Chat can locate a useful agent without having that agent's CRM capabilities itself. The Zava Sales Hub agent provides the business context and connected tools; its MCP App lets you inspect and complete an action in the conversation. Your permissions and approvals still apply."
        flow: ["Chat recommendation", "Grounded agent brief", "Reviewed MCP App action"]
      check:
        question: "The agent shows a lead form. What proves the new lead is ready?"
        options:
          - text: "The form appeared, so the record must already be saved."
            correct: false
            feedback: "An interactive form is not a save confirmation. Inspect the proposed fields and the resulting record."
          - text: "I reviewed the fields, saved once, and checked the resulting lead."
            correct: true
            feedback: "Verify the effect in CRM, including the distinction between the new lead and the existing renewal."
      stuck:
        - problem: "Chat answers directly instead of recommending an agent."
          solution: "Check its sources, then open the provided Zava Sales Hub agent explicitly for the MCP App step. The exercise does not require making Chat fail; routing and data access can differ by tenant."
        - problem: "The agent does not show the interactive form."
          solution: "Confirm the conversation is with Zava Sales Hub, not standard Chat or Cowork. Ask the facilitator to check the agent's MCP App deployment. Plain suggested field values are not the interactive-form experience."

    - id: delegate
      verb: Delegate
      title: "Make the review, not just a reply"
      minutes: 11
      tool: Cowork + Microsoft Dataverse + Zava PowerPoint
      brief: "Now switch to Cowork. Delegate a multi-step outcome using live CRM data and the company's presentation guidance, then apply your judgment."
      outcome: "A Zava-branded three-slide review separating known facts from open questions, plus real Outlook drafts."
      steps:
        - title: "Connect Microsoft Dataverse"
          instruction: "Go to **Agents & Plugins → Cowork → Microsoft Dataverse**. Enable it and connect to the training CRM. This is Cowork's connection, separate from the Chat agent you just used; it gives Cowork tools to work with records when you approve."
          help: |
            1. Open **Agents & Plugins** (shown as **Plugins** in some sessions), then the **Cowork** tab.
            2. Select **Microsoft Dataverse** and turn **Enable Microsoft Dataverse** on.
            3. Select **Connect Microsoft Dataverse**.
            4. Enter `https://zavasalesdemo.crm.dynamics.com/` and select **Connect**.
            5. Confirm the connection shows **Connected**. If it already does, do not reconnect.
          screenshot:
            title: the Dataverse connection URL
            src: /labs/cowork-zava-sales/images/dataverse-connection.webp
            src_dark: /labs/cowork-zava-sales/images/dataverse-connection-dark.webp
            alt: "Connect Microsoft Dataverse dialog with https://zavasalesdemo.crm.dynamics.com/ entered in the Dataverse environment URL field."
            width: 1500
            height: 738
            caption: "Enter https://zavasalesdemo.crm.dynamics.com/, select Connect, then confirm Connected. Use the supplied training environment, not a production CRM."
        - title: "Enable the Zava PowerPoint plugin"
          instruction: "Still in **Agents & Plugins → Cowork**, open **Zava PowerPoint** and enable it. Inspect the company-branding guidance it supplies. If it is already enabled, leave it enabled; do not confuse it with the optional **Zava Sales** plugin."
          screenshot:
            title: the company-branding plugin
            src: /labs/cowork-zava-sales/images/zava-powerpoint-plugin.webp
            src_dark: /labs/cowork-zava-sales/images/zava-powerpoint-plugin-dark.webp
            alt: "The enabled Zava PowerPoint plugin supplies corporate branding and the zava-powerpoint-brand skill."
            width: 2400
            height: 1280
            caption: "The plugin supplies brand guidance and assets; Cowork combines it with presentation-authoring tools. It is separate from the Dataverse connection."
          notice: "Finish both plugin checks **before starting the new Cowork task**, so it can discover their capabilities. Missing Zava PowerPoint is a facilitator setup issue, not a reason to silently substitute a generic deck."
        - title: "Switch to Cowork and delegate"
          instruction: "Select **New**, then explicitly select **Cowork** in the Home composer. Leave the model on **Auto** and effort on **Medium**. Keep this task for Repeat and the optional Riley call; Improve starts here before its separate Friday task."
          prompt_label: New Cowork task
          prompt: "I've got a pipeline review with my manager at the office tomorrow. Build me a new Zava-branded PowerPoint deck covering our biggest open deals with Northstar Teamwear, Coastal Performance Supply and BluePeak Athletics: where each stands and what we need to do to close. Then draft the customer follow-up emails I should send."
          screenshot:
            title: model and effort settings
            src: /labs/cowork-zava-sales/images/cowork-model-effort.webp
            src_dark: /labs/cowork-zava-sales/images/cowork-model-effort-dark.webp
            alt: "Cowork model and generation settings showing Auto and Medium, with the effort control ranging from faster to smarter."
            width: 2046
            height: 726
            caption: "Higher effort spends more time and credits on the task. Medium is the lab default."
          notice: "Watch Cowork discover and use **Zava PowerPoint** for the branded presentation, query CRM through **Microsoft Dataverse**, and save follow-ups in **Outlook**. Check the visible plugin/skill activity as well as the deck; saying “Zava” on a title slide is not proof of plugin use."
        - title: "Steer before you trust"
          instruction: "As soon as a first deck appears, open it and inspect the proposed decisions. Send the correction below in the same task. If Cowork is still working, use **Queue**; it will handle the follow-up after the current work."
          prompt_label: Same Cowork task
          prompt: "This is a good start, but you’re making a few calls I’d want to check with the deal owners first. Don’t assume we need to push Coastal to Q1 or change anyone’s forecast. Make it clear what we know and what we still need to ask. And cut it to three slides—I’ve only got five minutes with my manager."
          screenshot:
            title: the three-slide review
            src: /labs/cowork-zava-sales/images/pipeline-three-slides.webp
            alt: "Slide two of the Zava-branded three-slide review, showing CRM facts and questions for the owners of the Coastal, BluePeak and Northstar deals."
            width: 2688
            height: 1512
            caption: "A real result after the steering prompt, with Zava branding retained. Inspect your deck and the plugin activity; wording and CRM values will differ."
          notice: "Confirm the deck has **three slides** and follows the **Zava PowerPoint** branding guidance. The biggest open Northstar deal can differ from the $250K renewal in your call brief; inspect the record links rather than assuming they are the same. Open the output cards marked **Saved to drafts**: suggested email text in chat is not an Outlook draft. Do not send customer emails in this lab."
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
          solution: "Wait for the file to finish loading and dismiss any first-run Office privacy notice. Select **Open in PowerPoint** if the embedded preview stays blank, then wait for each slide to finish rendering before judging its layout. Do not restart the entire Cowork task."
        - problem: "It is taking longer than the mission budget."
          solution: "Check whether Cowork is waiting for your approval. If it is actively working, read the next step or queue the correction once the first deck exists."

    - id: repeat
      verb: Repeat
      title: "Save the method. Schedule the work."
      minutes: 9
      tool: Skills + Automations
      brief: "Stop repeating the same instructions every Monday. Give the preparation a name, then decide when it should run."
      outcome: "A Weekly Deal Review skill and one Monday 8:30 a.m. schedule with customer emails kept as drafts."
      steps:
        - title: "Make the weekly intent explicit"
          instruction: "Send the first prompt. If Cowork asks for a time zone or opens **Create recurring task**, answer and review it before continuing. Clear **Run once now** unless you want an additional test run; it may be selected by default. Then select **Schedule** to save that one Monday job; the later prompt refines it rather than creating a duplicate."
          prompt_label: Same Cowork task
          prompt: "Let’s make this my weekly pipeline review. Every Monday morning, refresh the three slides for these accounts, highlight what’s changed, and draft any follow-ups I should review."
        - title: "Save the procedure as a skill"
          instruction: "Send the next prompt and let Cowork finish creating the skill. Check that the saved instructions retain the three accounts, three slides, facts-versus-questions distinction, Zava PowerPoint branding guidance, and draft-only customer follow-ups."
          prompt_label: Same Cowork task
          prompt: "This is how I want to prepare for my pipeline reviews. Save it as a skill called Weekly Deal Review: the same three accounts, three slides, clear separation between what we know and what we need to ask, and customer follow-up drafts for me to review."
          help: |
            If a **Copy file** approval appears, check that its destination is your Cowork folder's `skills/weekly-deal-review` before approving. In a scheduled task, **Always allow Copy artifact** grants ongoing copy permission to that task; do not approve unexpected destinations or overwrites.

            If the first save proposes **Overwrite: Yes**, cancel that approval and inspect the destination in OneDrive. If the skill does not exist, ask Cowork to copy it with **overwrite disabled** and stop on a conflict. If it already exists, inspect it before deciding whether to reuse or revise it; do not delete it to make the approval succeed.

            Open **Agents & Plugins → Cowork → Manage all → weekly-deal-review**. If the tile is offscreen in the Added row, use its right arrow or **Manage all**. To inspect the actual instructions, open **OneDrive → My files → Documents → Cowork → skills → weekly-deal-review → SKILL.md** in the training account. An inventory entry alone does not verify the file contents.
          screenshot:
            title: your saved skill
            src: /labs/cowork-zava-sales/images/saved-skill.webp
            src_dark: /labs/cowork-zava-sales/images/saved-skill-dark.webp
            alt: "The saved weekly-deal-review skill in the Cowork Manage all list, with its description and more-actions menu."
            width: 2400
            height: 288
            caption: "Manage all lists the saved skill under its folder name, weekly-deal-review. Open SKILL.md in OneDrive to inspect the instructions."
          notice: "A **skill is reusable instructions and a procedure**, not a newly trained model. Find it in **Agents & Plugins → Cowork**, sometimes displayed as **weekly-deal-review**. A new task discovers the saved skill; this task already has the conversation context."
        - title: "Set the time and review the schedule"
          instruction: "Send the scheduling prompt. Review the proposed changes, then confirm **Monday, 8:30 a.m., the intended time zone, your own email as the recipient, and customer emails as drafts**. Complete **Next → Review permissions → Approve** when offered. Leave only one Monday review schedule."
          prompt_label: Same Cowork task
          prompt: "Run Weekly Deal Review every Monday at 8:30 a.m. and email me the slides. Keep the customer emails as drafts for me to review."
          help: |
            1. Open the schedule card or **Automations**.
            2. Check the recurrence, time zone and account that will run it. Compare **Next run** with the recurrence; if they disagree, flag it with your facilitator before relying on delivery.
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
            width: 2370
            height: 360
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
        - problem: "The skill page says it could not verify SKILL.md in OneDrive."
          solution: "Reload once, then inspect the existing file in OneDrive using the path above. Do not delete Cowork folders or create duplicate skills to clear it. If the file is absent or unreadable, ask your facilitator before continuing to skill reuse."

    - id: record
      verb: Record
      title: "Turn a conversation into a commitment"
      optional: true
      minutes: 8
      tool: Dataverse + PowerPoint + Outlook
      brief: "Riley gives you one new fact and you make one promise. Put both into the system of record, then bring the review up to date. This is an extension beyond the 30-minute core."
      outcome: "A completed phone call and an owned follow-up task linked to the renewal, reflected in the slides and draft."
      steps:
        - title: "Log the call and the promise"
          instruction: "Return to the **pipeline-review Cowork task**, not the Zava Sales Hub agent chat. Review the proposed record details before approving: the **$250K Northstar renewal**, the call recap, the task owner, and the calendar date chosen for **next Friday**."
          prompt_label: Same Cowork task
          prompt: "Just spoke with Riley at Northstar about the $250K renewal. They need a phased rollout plan before final approval, and I promised to send it by next Friday. Create a completed phone call with that recap and a task for me to send the plan. Link both to the renewal."
          screenshot:
            title: the approved CRM actions
            src: /labs/cowork-zava-sales/images/dataverse-approval.webp
            src_dark: /labs/cowork-zava-sales/images/dataverse-approval-dark.webp
            alt: "Cowork history showing approved Dataverse creation and update actions, followed by the saved phone call and task with disclosed omissions."
            width: 2370
            height: 954
            caption: "This example is already approved. Expand each action to check completion, then review the saved details and any disclosed omissions."
          notice: "Prefer the one-time **Approve/Allow** action while learning. A session-wide always-allow choice, if offered, reduces future prompts for that permission; it is not permission to stop reviewing what the task is doing."
        - title: "Verify the records, then refresh the outputs"
          instruction: "Check the returned records: the phone call is **Completed**; the task is assigned to you, has a due date, and both records point to the renewal. Then send the next prompt."
          prompt_label: Same Cowork task
          prompt: "Update my slides with what we learned from Riley, and change the draft email to her into a recap of our call. Mention that I’ll send the rollout plan by the deadline on my task."
          notice: "Open the updated deck and Riley's draft. The rollout-plan deadline should match the **task's actual due date**, not a fresh guess about what “next Friday” means. CRM can display a different time zone from Cowork. If the earlier Northstar draft was for another contact and deal, Cowork may create a separate Riley draft rather than replace it. Check the recipient and keep both emails unsent."
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
          solution: "Check Cowork's disclosure and the actual record. A completed status does not mean every field was populated; ask your facilitator before treating omitted details as complete."

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
          instruction: "Cowork may open **Create recurring task** directly with **Run in: New conversation**. Review that Friday job rather than creating another. If it provides handoff text instead, review it and copy it into **New → Cowork**. In either route, the instructions should name **Weekly Deal Review** and your existing deck, require a backup before skill edits, preserve accounts and permissions, keep customer emails as drafts, and send the recap only to you. Complete the Friday schedule confirmation, clearing **Run once now** so it does not immediately execute. A handoff in the chat is not a saved schedule."
          notice: "This configures future work, not a demonstrated learning result. **No accessible feedback** is a valid result. Automatic updates depend on sources, permissions and successful runs. Skill-file changes may still wait for approval; a backup is needed before the first actual edit."
        - title: "Inspect what persists"
          instruction: "Find **Weekly Deal Review** under **Agents & Plugins → Cowork**, and review the separate Monday and Friday entries under **Automations**. Check the Friday instructions require a dated backup before edits and report missing or conflicting feedback. After a real feedback run, inspect the change recap, source links and saved previous version."
          screenshot:
            title: the two separate automations
            src: /labs/cowork-zava-sales/images/separate-automations.webp
            src_dark: /labs/cowork-zava-sales/images/separate-automations-dark.webp
            alt: "Automations showing separate Friday 3:00 p.m. feedback-review and Monday 8:30 a.m. pipeline-review schedules, both paused."
            width: 3120
            height: 820
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
          instruction: "Open **Agents & Plugins → Cowork**, search for **Zava Sales**, and install it if your facilitator has supplied it. This optional plugin is separate from the **Zava Sales Hub agent** and the **Zava PowerPoint plugin** already used. Install and connect its **Business apps (preview)** prerequisite as described below, then start **New → Cowork** and leave Auto / Medium selected."
          help: |
            1. Open **Agents & Plugins** and select the **Cowork** tab.
            2. Search the available plugins for **Zava Sales**.
            3. Open it, review the capabilities, and select **Install** or **Add** as offered. If it is already installed, leave it enabled.
            4. Check its prerequisites: the workshop plugin requires **Business apps (preview)**, published by **Microsoft Corporation**. Search for **Business apps**, install it if needed, and select **Connect** using your training identity. Verify **Connected** and leave it enabled. The **Microsoft Dataverse** connection from Delegate is separate and does not satisfy this dependency. Use only the supplied training environment and your own connection.
            5. Start a **new Cowork task**. Do not paste this into the pipeline-review task.
          notice: "A plugin can package **skills, connectors, or both**. Zava Sales adds business-specific instructions; it does not bypass your data permissions or approval requirements."
          screenshot:
            title: the installed Zava Sales plugin
            src: /labs/cowork-zava-sales/images/zava-sales-plugin.webp
            src_dark: /labs/cowork-zava-sales/images/zava-sales-plugin-dark.webp
            alt: "The enabled Zava Sales plugin showing its zava-sales and daily-crm-update skills."
            width: 2370
            height: 1470
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
            width: 2355
            height: 1518
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
          solution: "Skip this optional extension and ask your facilitator to check deployment. The core lab needs Zava Sales Hub, Microsoft Dataverse and Zava PowerPoint, not this additional plugin. Do not install an unrelated plugin with a similar name."
        - problem: "I need to rerun this prompt."
          solution: "First inspect whether the note, lead or task already exists. Ask Cowork to reuse the existing records rather than making duplicates."
  finish:
    title: "You changed more than a document."
    message: "You moved from finding evidence to delegating work, approving real changes, and preserving a repeatable way of working."
    takeaways:
      - label: Copilot Chat
        text: "Find work-file evidence; do not assume that also proves live CRM access."
      - label: Agent + MCP App
        text: "Use specialist business tools and an interactive form without leaving the agent conversation."
      - label: Cowork
        text: "Delegate an outcome across files and tools, then steer and verify it."
      - label: Skill
        text: "Save the method you want repeated."
      - label: Automation
        text: "Choose when the work runs, then check its runs and outputs."
      - label: Plugin
        text: "Supply connected capabilities and company guidance, such as Zava's PowerPoint branding."
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

Find a proposal in Copilot Chat, prepare a live deal brief with the Zava Sales Hub agent, and create a lead in its MCP App. Then delegate a Zava-branded pipeline review to Cowork and turn the procedure into a reusable, scheduled skill.

## Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| 200 | Business user | 30 minutes core; about 52 with all extensions | A cited proposal, an agent-assisted brief and lead, a branded deck, draft follow-ups, a reusable skill and scheduled preparation. |

Use your assigned **training account**, not a personal or production account. Your facilitator prepares Copilot access, credits, the sample Northwind proposal, Zava Sales data, the Zava Sales Hub agent and plugins. Start in **Chat, not Cowork**. Keep customer emails as **drafts**.

Open [Zava Sales Hub](https://aka.ms/ZavaSalesHub). It is the CRM in this scenario: a Copilot Managed Runtime app and Copilot Studio agent built on Dataverse sample sales data (accounts, contacts, leads, opportunities and activities). On first use, check that the Microsoft Dataverse consent shows your assigned training account, then select **Allow**. Wait for **Live CRM** before checking what Copilot finds and the records you create.

Plan **30 minutes for the four core missions**: Ask (3) → Act (7) → Delegate (11) → Repeat (9). The Riley call and CRM update, Friday feedback loop, and Zava Sales plugin exercise remain as **optional extensions: 8 + 6 + 8 minutes**, about 52 minutes for everything. These are working budgets, not guaranteed run times. At minute 21, move toward saving and scheduling the review; skip extensions, not approvals or output checks. Read ahead while Cowork works; do not start duplicate tasks.

## Prerequisites

<p class="lab-setup-note">At a proctor-led event with a provided, pre-provisioned account? <strong>You're ready to start.</strong></p>

<details class="lab-setup" markdown="1">
<summary>Using your own tenant? View setup requirements</summary>

Arrange Copilot access with Work IQ, the sample Northwind proposal, Cowork credits, and Zava Sales training data before starting. Make the **Zava Sales Hub agent with its lead-creation MCP App** available in Chat, and provide the **Microsoft Dataverse** and **Zava PowerPoint** plugins in Cowork. The separate **Zava Sales** Cowork plugin is needed only for the optional Specialize mission. These are demo assets to obtain from your facilitator, not built-in capabilities to recreate during this lab.

</details>



## Table of Contents

- [Prerequisites](#prerequisites)
- [Ask: find the proposal](#ask-find-the-proposal)
- [Act: use the sales agent and MCP App](#act-use-the-sales-agent-and-mcp-app)
- [Delegate: make the review](#delegate-make-the-review)
- [Repeat: save and schedule](#repeat-save-and-schedule)
- [Record: log the call and commitment (optional)](#record-log-the-call-and-commitment)
- [Improve: learn from feedback (optional)](#improve-learn-from-feedback)
- [Specialize: use the Zava Sales plugin (optional)](#specialize-use-the-zava-sales-plugin)
- [Take it with you](#take-it-with-you)

## Ask: find the proposal

**3 minutes · Copilot Chat**

1. Open [Microsoft Copilot](https://copilot.cloud.microsoft/home?auth=2) with your assigned training account.
2. Select **Chat, not Cowork** in the Home composer. Explore the model picker, then leave **Auto** selected. Quick response favors speed; Think deeper spends longer reasoning.
3. Keep **Work IQ on**. It uses work context such as files, email, meetings and Teams within your permissions. Finding a proposal does not prove that Chat can retrieve a live CRM deal.
4. Send:

```text
Can you help me find and summarize the proposal we made to Northwind Trader a few month back? who was the economic buyer again, what was their decision criteria? my boss is asking...
```

Open the proposal citation and check the economic buyer and decision criteria against the document. The sample file is **Commercial_Proposal_Northwind_Traders**. A past proposal is not evidence of today's CRM status.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/chat-model-picker-dark.webp"><img src="images/chat-model-picker.webp" alt="Copilot Chat model picker"></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="images/proposal-answer-dark.webp"><img src="images/proposal-answer.webp" alt="Copilot Chat cites the Northwind proposal and summarizes its economic buyer and decision criteria"></picture>

**Quick check:** Does Work IQ unlock every company record? **No.** Source configuration, your permissions and available data still apply.

**If the proposal is missing:** check the assigned account and Work IQ, then ask the facilitator to check access to the sample file. Do not provision Dataverse or invent a buyer.

## Act: use the sales agent and MCP App

**7 minutes · Copilot Chat and Zava Sales Hub**

Select **New**, then confirm **Chat**, not Cowork. Start this in a **new Copilot Chat session**, separate from the Northwind conversation:

```text
Help me prepare for a call about Northstar Teamwear’s $250K Pulse renewal. Where does the deal stand, what needs my attention, and what are the three most important questions to ask on the call?
```

In this training experience, Chat may not retrieve the live deal and can recommend **Zava Sales Hub** instead. Select the recommendation to **Try Zava Sales Hub**. Check that the same prompt is carried into the agent conversation; send it if it is only prefilled. Confirm that you are now talking to **Zava Sales Hub**, then check the deal status, attention points and three call questions against its returned records.

The recommendation's wording can vary. If no card appears, open **Agents & Plugins → Chat**, find the facilitator-provided **Zava Sales Hub** agent, and paste the same prompt there. Some sessions shorten the sidebar label to **Plugins**. If Chat starts a research task instead, select **Stop task** on that task card before opening the agent; do not wait for a separate research run in this exercise. If Chat answers directly, inspect its sources, then open the agent for the next step anyway. The lab does not require making Chat fail, and this result does **not** establish that Dataverse is unavailable in every Copilot Chat tenant.

In the **same Zava Sales Hub agent conversation**, follow up:

```text
Thanks, btw can you help me create a new lead for them? John Doe mentioned a $50,000 project in the Denver area, details to be sent in a couple of weeks.
```

Confirm when prompted, then complete and review the embedded lead form. **This interactive form inside the agent is an MCP App**, not a switch to Cowork. Review **John Doe**, **$50,000**, **Denver**, and the Northstar context before saving. Keep unknown contact details unknown. This lead is separate from the **$250K renewal**; do not overwrite the renewal amount.

In the lead form, titled **Create new lead record** or **Create new record for Northstar Teamwear**, complete **Lead Name** if blank, for example `Northstar Teamwear - Denver project`. Fill **Topic** with the known project details, including that more details are expected in a couple of weeks. Scroll **inside the form** to check **Estimated value: 50000**. If it is blank or the form warns that it could not fill `$50,000`, enter `50000` without the currency symbol or comma. A company-name string is not proof that the **Account** lookup is linked. Select **Accept and save** once, then look for **Your changes have been saved successfully** and **Update lead record**. Use **Open** to inspect the saved record if needed.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/lead-mcp-app-dark.webp"><img src="images/lead-mcp-app.webp" alt="The interactive Zava Sales Hub lead form inside the agent, with John Doe, Northstar Teamwear and Denver suggested, and an Accept and save button"></picture>

Check the saved lead before retrying to avoid duplicates. If the agent or form is missing, ask the proctor to check the deployment; do not install a lookalike or treat plain suggested field values as an interactive form.

**Quick check:** Does seeing a lead form prove the record exists? **No. Review the fields, save once, and verify the resulting CRM record.**

## Delegate: make the review

**11 minutes · Cowork, Microsoft Dataverse and Zava PowerPoint**

1. Go to **Agents & Plugins → Cowork → Microsoft Dataverse**. Some sessions shorten the sidebar label to **Plugins**. This is Cowork's connection, separate from the Chat agent.
2. Turn **Enable Microsoft Dataverse** on, then **Connect Microsoft Dataverse**.
3. Enter `https://zavasalesdemo.crm.dynamics.com/`, select **Connect**, and confirm **Connected**. If already connected, leave it alone.

   <picture><source media="(prefers-color-scheme: dark)" srcset="images/dataverse-connection-dark.webp"><img src="images/dataverse-connection.webp" alt="Connect Microsoft Dataverse dialog with https://zavasalesdemo.crm.dynamics.com/ in the environment URL field"></picture>

4. Still in **Agents & Plugins → Cowork**, enable **Zava PowerPoint** and inspect its company-branding guidance. If already enabled, leave it enabled. This is not the optional **Zava Sales** plugin. Ask the facilitator if it is missing; do not silently substitute a generic deck.

   <picture><source media="(prefers-color-scheme: dark)" srcset="images/zava-powerpoint-plugin-dark.webp"><img src="images/zava-powerpoint-plugin.webp" alt="The enabled Zava PowerPoint plugin with its corporate-branding guidance and zava-powerpoint-brand skill"></picture>

5. After both plugin checks, select **New → Cowork** explicitly. Leave **Auto / Medium** selected. Higher effort spends more time and credits. Cowork uses metered Copilot Credits; available models and tools depend on the tenant.

   <picture><source media="(prefers-color-scheme: dark)" srcset="images/cowork-model-effort-dark.webp"><img src="images/cowork-model-effort.webp" alt="Cowork model and effort settings"></picture>

6. Send the following. Keep the **same Cowork task for Repeat and the optional Riley call**. Improve starts here before its separate Friday task:

```text
I've got a pipeline review with my manager at the office tomorrow. Build me a new Zava-branded PowerPoint deck covering our biggest open deals with Northstar Teamwear, Coastal Performance Supply and BluePeak Athletics: where each stands and what we need to do to close. Then draft the customer follow-up emails I should send.
```

Watch Cowork discover and use **Zava PowerPoint** for the branded deck, query CRM through **Microsoft Dataverse**, and create Outlook drafts. Check the visible plugin/skill activity as well as the deck; saying “Zava” on a title slide is not proof of plugin use. As soon as a first deck exists, inspect it and send the correction below. If still working, use **Queue**:

```text
This is a good start, but you’re making a few calls I’d want to check with the deal owners first. Don’t assume we need to push Coastal to Q1 or change anyone’s forecast. Make it clear what we know and what we still need to ask. And cut it to three slides—I’ve only got five minutes with my manager.
```

![Cowork and the three-slide pipeline review](images/pipeline-three-slides.webp)

The image is a real result after the steering prompt, with Zava branding retained. Your wording and CRM values will differ. The biggest open Northstar deal can differ from the $250K renewal in your call brief; inspect the record links rather than assuming they are the same. Verify **three slides**, the **Zava PowerPoint branding guidance**, and actual output cards marked **Saved to drafts**, not just suggested email text. Customer emails stay unsent. If the preview is blank, dismiss a first-run Office notice or select **Open in PowerPoint**. Wait for each slide to finish rendering before judging its layout; do not restart the task.

**Quick check:** Should a CRM-informed recommendation automatically change a forecast? **No.** Confirm assumptions with the owner. Delegate preparation, not unchecked business decisions.

## Repeat: save and schedule

**9 minutes · Skills and Automations**

Send each prompt in order in the same task:

```text
Let’s make this my weekly pipeline review. Every Monday morning, refresh the three slides for these accounts, highlight what’s changed, and draft any follow-ups I should review.
```

If asked for a time zone, confirm the one you intend. If **Create recurring task** appears, review it. Clear **Run once now** unless you want an extra test run; it may be selected by default. Then select **Schedule** before continuing. The later prompt refines this same Monday job rather than creating a duplicate.

```text
This is how I want to prepare for my pipeline reviews. Save it as a skill called Weekly Deal Review: the same three accounts, three slides, clear separation between what we know and what we need to ask, and customer follow-up drafts for me to review.
```

If a **Copy file** approval appears, check that its destination is your Cowork folder's `skills/weekly-deal-review` before approving. In a scheduled task, **Always allow Copy artifact** grants ongoing copy permission to that task; do not approve unexpected destinations or overwrites.

If the first save proposes **Overwrite: Yes**, cancel that approval and inspect the destination in OneDrive. If the skill does not exist, ask Cowork to copy it with **overwrite disabled** and stop on a conflict. If it already exists, inspect it before deciding whether to reuse or revise it; do not delete it to make the approval succeed.

Let skill creation finish. Inspect the saved instructions: the same three accounts, three slides, facts versus questions, Zava PowerPoint branding guidance, and draft-only customer follow-ups. Find skills under **Agents & Plugins → Cowork**; this one may appear as **weekly-deal-review**. A skill is reusable instructions and a procedure, **not model retraining**.

<details>
<summary>Help: find and inspect the saved skill</summary>

Open **Agents & Plugins → Cowork → Manage all → weekly-deal-review**. If its tile is offscreen in the Added row, use the right arrow or **Manage all**. Inspect the actual instructions in **OneDrive → My files → Documents → Cowork → skills → weekly-deal-review → SKILL.md** in your training account.

If the skill page says it could not verify `SKILL.md` in OneDrive, reload once, then check the existing file there. An inventory entry alone does not verify its contents. Do not delete Cowork folders or create duplicate skills to clear the warning. If the file is absent or unreadable, ask your facilitator before continuing to skill reuse.

</details>

<picture><source media="(prefers-color-scheme: dark)" srcset="images/saved-skill-dark.webp"><img src="images/saved-skill.webp" alt="The saved weekly-deal-review skill"></picture>

```text
Run Weekly Deal Review every Monday at 8:30 a.m. and email me the slides. Keep the customer emails as drafts for me to review.
```

Review the schedule card or **Automations**. Check **Monday, 8:30 a.m., the intended time zone, your own email recipient, and customer emails kept as drafts**. Compare **Next run** with the recurrence; if they disagree, flag it with your facilitator before relying on delivery. For an update, complete **Next → Review permissions → Approve** when offered, with email permission limited to your account. A new schedule uses **Schedule**; some tenants show **Save** or **Activate** instead. Keep only one Monday review schedule.

When offered, **Run once now**, **Activate and run now**, or a preview lets you test without waiting for Monday. Leave it off if you only want the scheduled run. Any test email goes only to your training account. Check **Automations → Runs** afterwards; setup is not proof of future execution.

**Quick check:** Does saving a skill start a recurrence? **No. The skill is the how; an activated schedule is the when.**

Return to the task and check its cost:

```text
/cost
```

The command is free and shows **approximate cumulative task usage**, not an invoice or advance estimate. One Copilot Credit is roughly **US$0.01 at the standard pay-as-you-go rate**; pricing, discounts and tenant arrangements vary.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/task-cost-dark.webp"><img src="images/task-cost.webp" alt="Example cumulative task usage, not a fixed lab cost"></picture>

**Core lab complete.** [Take it with you](#take-it-with-you), or continue with the optional missions below.

## Record: log the call and commitment

**Optional · 8 minutes · Dataverse, PowerPoint and Outlook**

Return to the **pipeline-review Cowork task**, not the Zava Sales Hub agent chat. Send:

```text
Just spoke with Riley at Northstar about the $250K renewal. They need a phased rollout plan before final approval, and I promised to send it by next Friday. Create a completed phone call with that recap and a task for me to send the plan. Link both to the renewal.
```

Review the **$250K Northstar renewal**, recap, task owner and calendar date for **next Friday** before approving. Prefer one-time **Approve/Allow** while learning. Session-wide always-allow, if offered, reduces future prompts for that permission; it does not remove your responsibility to review.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/dataverse-approval-dark.webp"><img src="images/dataverse-approval.webp" alt="Cowork history after approval, with separate Dataverse actions and the saved phone-call and task details"></picture>

This example shows the actions **after approval**, followed by the saved records and disclosed omissions.

Creating the call, completing it and creating the task can need separate approvals. Verify the phone call is **Completed**, the task is assigned to you with the right date, and both records are linked to the renewal. If a write fails, read the error and check for an existing record before retrying.

Check any disclosed omissions too. A completed status does not mean every field was populated; ask your facilitator before treating omitted details as complete.

Then send:

```text
Update my slides with what we learned from Riley, and change the draft email to her into a recap of our call. Mention that I’ll send the rollout plan by the deadline on my task.
```

Check the updated slides and Riley's unsent draft. The deadline must match the **saved task**, not a new interpretation of “next Friday.” CRM can display a different time zone from Cowork. If the earlier Northstar draft was for another contact and deal, Cowork may create a separate Riley draft rather than replace it. Check the recipient and keep both emails unsent.

**Quick check:** What proves completion? **The returned records and their actual status, owner, due date and relationship**, not just an acknowledgment.

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

Cowork may open **Create recurring task** directly with **Run in: New conversation**. Review that Friday job rather than creating another. If it provides handoff text instead, review it and copy it into **New → Cowork**. In either route, check the instructions name **Weekly Deal Review** and your existing deck, require a backup before skill edits, preserve accounts and permissions, keep customer emails as drafts, and send the recap only to you. Complete the Friday schedule confirmation, clearing **Run once now** so it does not immediately execute. Handoff text alone is not a saved schedule.

This configures future work, not a demonstrated learning result. **No accessible feedback** is valid; invented feedback is not. Automatic changes depend on available sources, permissions and successful runs. Skill-file changes may still wait for approval.

Find **Weekly Deal Review** under **Agents & Plugins → Cowork** and the separate Monday and Friday schedules under **Automations**. Check the Friday instructions require a dated backup before edits and report missing or conflicting feedback. After a real feedback run, inspect the change recap, source links and saved previous version.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/separate-automations-dark.webp"><img src="images/separate-automations.webp" alt="Separate Monday pipeline-review and Friday skill-improvement schedules"></picture>

**Quick check:** If a transcript cannot be accessed, should Cowork infer the feedback? **No. Flag the gap and use only substantiated feedback.**

## Specialize: use the Zava Sales plugin

**Optional · 8 minutes · New Cowork task**

1. Open **Agents & Plugins → Cowork**, search for **Zava Sales**, and install/add it if your facilitator has supplied it. If already installed, leave it enabled. This optional plugin is separate from the **Zava Sales Hub agent** and the **Zava PowerPoint plugin** already used.
2. Review its skills, connections and prerequisites. The workshop plugin requires **Business apps (preview)**, published by **Microsoft Corporation**. Search for **Business apps**, install it if needed, and select **Connect** using your training identity. Verify **Connected** and leave it enabled. The **Microsoft Dataverse** connection from Delegate is separate and does not satisfy this dependency. Use only the supplied training environment and your own connection.
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

A plugin can combine **skills, connectors, or both**. It supplies business guidance as well as tools, without bypassing your permissions. Follow the **Zava Sales Hub** link if recommended, or open [Zava Sales Hub](https://aka.ms/ZavaSalesHub): a purpose-built app can be the best place to manage the results.

If Zava Sales is missing from the catalog, skip this optional extension and ask your facilitator rather than installing a lookalike. The core lab needs Zava Sales Hub, Microsoft Dataverse and Zava PowerPoint, not this additional plugin. Before rerunning the prompt, check for existing records to avoid duplicates.

**Quick check:** Should Cowork generate a plausible email address for Jamie? **No. Unknown details remain unknown.**

## Take it with you

**Copilot Chat** finds work-file evidence. A specialist **agent** provides business tools, and an **MCP App** lets you review and complete an action inside its conversation. **Cowork** coordinates work across files and tools. A **skill** saves the method, an **automation** schedules it, and a **plugin** supplies connected capabilities and guidance such as Zava's PowerPoint branding.

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
