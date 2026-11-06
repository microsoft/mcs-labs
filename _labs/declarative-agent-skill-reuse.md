---
lab_format: missions
module: copilot-harness-latest
title: "Declarative agents: reuse a briefing skill"
order: 127
duration: 30
difficulty: 200
lab_type: local
section: intermediate_labs
journeys: ["developer"]
description: "Reuse a hotel-briefing skill in Agent Builder, ground it in the annual report, and verify an evidence-backed team handoff."
classes: wide
author_profile: false
toc: false
unlisted: true
search: false
sitemap: false
mission_lab:
  headline: "One reusable skill."
  headline_emphasis: "A team briefing."
  promise: "Turn a personal hotel-report workflow into an agent that prepares an evidence table and executive email text for human review. Nothing is sent."
  hero_image:
    src: /labs/declarative-agent-skill-reuse/images/briefing-evidence.webp
    alt: "Hotel operations briefing excerpt with a source, reporting period and the first three evidence-table rows."
    width: 865
    height: 591
    caption: "A reviewed light-content excerpt, not the complete five-issue result. Check claims and recommendation identifiers against the report."
  scenario: |
    You lead operations at **Contoso Grand Hotel**. Your team needs the five most urgent issues in its annual performance report, each with a symptom, root cause, reported financial impact and matching Section 16 recommendation.

    Reuse your compatible skill from [Cowork hands-on](../mcs-cowork-latest/), or use the supplied starter in Mission 1. Leave with **Contoso Operations agent**, a checked briefing and an approved teammate's independent review. This is email **text**, not an Outlook draft; there are no sending or Planner actions.

    **Validation boundary:** the refreshed classic run recorded 15 pass, 12 drift, 1 defect, 4 variance and 7 blocked checks. Agent creation, skill upload, report attachment and boundary responses were observed. Second-account sharing and the optional Visual Studio Code / Agents Toolkit deployment were not tested. Opening Share is not a completed handoff; mark unavailable tests blocked.

    **Prerequisites for your own tenant**

    **Attending a CAT bootcamp or another proctor-led event with a pre-provisioned user account? Skip this section.** Your account, environment, licences, connections and sample data are prepared. Go straight to [Mission 1](#inspect); ask your facilitator if something is missing.

    **Running in your own tenant?** Arrange a Microsoft 365 account with Microsoft Copilot that can create agents in Agent Builder and add skills. Check **Agents & Skills > New agent > Configure** for **Skills**, following the linked licensing and skills documentation. For the optional extension, prepare Visual Studio Code, a skill-capable Microsoft 365 Agents Toolkit release and an approved SharePoint or OneDrive location. Provisioning is outside the core slot.

    This exercise uses Agent Builder for a declarative agent. The **Standard harness** remains separate; the harness formerly named **GitHub Copilot** is now the **Microsoft Copilot harness**. Do not substitute either Studio experience for these Agent Builder steps.
  prerequisites:
    - "Sign in to [Microsoft Copilot](https://m365.cloud.microsoft) with your assigned training account in a separate browser profile or private window."
    - "Keep the lab beside Copilot and ask the facilitator if Skills or the assigned account is unavailable. Download the starter in Mission 1 and the report in Mission 3; do not skip those exercise inputs."
    - "Use only the supplied hotel scenario and an instructor-approved teammate. Keep the agent private until the targeted sharing exercise."
  pacing: "Plan 30 minutes: Inspect (3) → Build (9) → Ground (4) → Verify (11) → Share (3). Version is optional, about 25 additional minutes with tooling ready. Responses can take about two minutes; these are budgets, not measured completion times. Do not resend while waiting, and do not call a blocked teammate test complete."
  missions:
    - id: inspect
      verb: Inspect
      title: "Find the reusable workflow"
      minutes: 3
      tool: Skill package
      brief: "Separate the briefing procedure from the evidence and from the agent's role."
      outcome: "A compatible hotel-operations-briefing ZIP and an understood output contract."
      steps:
        - title: "Choose and download your package"
          instruction: |
            Download the [starter ZIP](https://microsoft.github.io/mcs-labs/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing.zip), or use your compatible hotel-briefing skill from [Cowork hands-on](../mcs-cowork-latest/). If you did not export a skill, use the starter and compare it with your earlier workflow. Keep the ZIP intact for upload.

            Inspect [SKILL.md](https://github.com/microsoft/mcs-labs/blob/main/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing/SKILL.md) and [briefing-template.md](https://github.com/microsoft/mcs-labs/blob/main/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing/briefing-template.md). The starter name is `hotel-operations-briefing`. Confirm `SKILL.md` is immediately visible at the ZIP root, not inside an extra folder.
        - title: "Trace the briefing requirements"
          instruction: |
            Identify the YAML name and description, report input, optional recipient, evidence extraction, prioritization and recommendation mapping. The skill must distinguish reported facts from inference, prioritize five supported issues, match Section 16 recommendations and return an evidence table plus an email under 400 words for human review.

            Confirm the package includes its output template. It contains neither the report nor an Outlook action. Adapt any Cowork-only actions in your own skill; use the starter if repackaging would consume the lab.
      reveal:
        title: "What travels with a skill?"
        line: "A procedure travels; permissions and conversation history do not."
        explanation: "The agent instructions decide when to use the skill. The skill carries the reusable workflow. The report supplies evidence. Reusing the files does not transfer Cowork tools or an ongoing task."
        flow: ["Agent role", "Reusable skill procedure", "Report evidence", "Human review"]
      check:
        question: "What does uploading the starter give the agent?"
        options:
          - text: "The briefing procedure and template, not the report or sending permissions."
            correct: true
            feedback: "You add the report separately and keep the output as review-ready text."
          - text: "The creator's Cowork session and permission to send mail."
            correct: false
            feedback: "Neither personal history nor action permissions travel with this package."

    - id: build
      verb: Build
      title: "Give the agent a role and a skill"
      minutes: 9
      tool: Agent Builder
      brief: "Create a focused agent without duplicating the skill's detailed workflow."
      outcome: "Contoso Operations agent has concise instructions and the uploaded skill."
      steps:
        - title: "Open the configuration"
          instruction: |
            Open [Microsoft Copilot](https://m365.cloud.microsoft). Select **Agents & Skills > New agent**, then **Skip** to open **Configure**. If **What's new in Agent Builder** appears, select **Get started**.

            The onboarding describes work content enabled by default. You will turn it off in Mission 3 before testing; do not assume the new agent is report-only.
          screenshot:
            title: Start a new Agent Builder agent
            src: /labs/declarative-agent-skill-reuse/images/agents-skills-new-agent.webp
            alt: "Agents & Skills menu with New agent near the bottom."
            width: 482
            height: 357
            caption: "Reviewed classic light capture. Select New agent, then Skip."
        - title: "Name the agent and enter its description"
          instruction: "Select the pencil next to **New Agent**. Name it **Contoso Operations agent**, and paste this into the description field."
          prompt_label: Agent Builder · Description
          prompt: |-
            Help the Contoso operations team complete a repeatable briefing workflow: use the annual report and reusable skill to prepare evidence-backed issues and an executive email for teammate review.
        - title: "Set the role and action boundary"
          instruction: "Paste the complete block into **Instructions**, not Preview. If your own skill has a different name, replace only `hotel-operations-briefing` with its exact configured name."
          prompt_label: Agent Builder · Instructions
          prompt: |-
            You are Contoso Operations agent, a shared assistant for the Contoso hotel operations team.
            Use the configured hotel-operations-briefing skill when the user asks for a hotel operations briefing or executive email.
            Ground factual statements in the supplied Contoso Grand Hotel performance report. Distinguish reported facts from inference and flag missing evidence.
            Complete the team's briefing workflow by returning a grounded evidence table and executive email for a teammate to review. Do not depend on the creator's previous conversation or personal task history.
            Keep your scope to hotel-report analysis and review-ready briefings. Return concise, professional output.
            Do not send messages, create Outlook drafts, or write Planner tasks. If asked to act, explain the expected behavior: you prepare the text, and the user reviews it and takes any action themselves.
        - title: "Add the short conversation starter"
          instruction: "Under **Suggested prompts**, enter Title **Prepare hotel briefing** and Message **Prepare the hotel operations briefing using the annual report.** Delete empty prompt rows with their trash icon. Do not add unrelated skills, sources or connectors."
        - title: "Upload the whole skill package"
          instruction: "Under **Skills**, select **Add**. In **Upload skill**, select **Drop your file or click to browse**, choose your ZIP and select **Upload**. Use the complete package rather than SKILL.md alone so the output template is included."
          screenshot:
            title: Upload the starter ZIP
            src: /labs/declarative-agent-skill-reuse/images/upload-skill-dialog.webp
            alt: "Upload skill dialog with a browse area, YAML requirements and Upload button."
            width: 600
            height: 302
            caption: "Reviewed light capture before file selection; choose the ZIP to enable Upload."
        - title: "Inspect what was uploaded"
          instruction: "Select the skill. Check its name, description and **Instructions**, then find `briefing-template.md` under **Files**. Select **Back**. A matching name is essential because the agent instructions refer to it."
      reveal:
        title: "Why not paste the whole workflow into Instructions?"
        line: "Keep the role distinct from the reusable procedure."
        explanation: "The instructions select the skill and define the boundary. The package owns the detailed briefing steps and template; inspecting it catches missing resources before testing."
        flow: ["Short role instructions", "Named skill", "Packaged workflow and template"]
      check:
        question: "The skill name differs from the name in Instructions. What should you change?"
        options:
          - text: "Copy the entire skill into each chat instead."
            correct: false
            feedback: "That abandons the reusable agent design and hides a configuration error."
          - text: "Make the instruction reference match the configured skill name."
            correct: true
            feedback: "Keep one detailed workflow in the package and a clear reference in the role."
      stuck:
        - problem: "The ZIP is rejected or the template is absent."
          solution: "Use the supplied starter; confirm SKILL.md is at the ZIP root with a YAML name and description. Check the linked skills documentation for supported package contents."

    - id: ground
      verb: Ground
      title: "Use the report, not unrelated work content"
      minutes: 4
      tool: Agent Builder · Knowledge
      brief: "Attach the same evidence once so a teammate need not supply it in every conversation."
      outcome: "The hotel PDF is attached and broad work-content sources are off."
      steps:
        - title: "Download and attach the report"
          instruction: "Download the [Contoso Grand Hotel Performance Report PDF](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf). Under **Knowledge**, select **Add knowledge** and upload it, or drop it onto the **Knowledge** box. Confirm the file under **Attachments** and wait for processing to finish."
        - title: "Turn off the broad default sources"
          instruction: "Under **Work content**, turn off **Cloud files**, **Outlook**, **Teams** and **Web search**. These start on by default. Leave **Copilot connectors** off. Check all five controls before opening Preview."
          screenshot:
            title: Report attached with work content off
            src: /labs/declarative-agent-skill-reuse/images/knowledge-work-content-off.webp
            alt: "Knowledge configuration with all five work-content switches off and the hotel PDF under Attachments."
            width: 796
            height: 675
            caption: "Reviewed light capture of the intended source configuration; do not remove the hotel attachment."
      reveal:
        title: "Why change the defaults?"
        line: "A controlled source makes a briefing checkable."
        explanation: "The report is business evidence, not an instruction store. Broad work-content sources can introduce unrelated material. Configuration narrows the exercise, but you still verify each claim against the PDF."
        flow: ["Attach the report", "Disable unrelated sources", "Check report-grounded claims"]
      check:
        question: "Does attaching the PDF automatically turn off Outlook, Teams and web search?"
        options:
          - text: "Yes; an attachment replaces all other sources."
            correct: false
            feedback: "Work content is on by default in the observed experience. Check each switch."
          - text: "No; turn those sources off explicitly."
            correct: true
            feedback: "Keep the report attached and verify the source configuration before testing."
      stuck:
        - problem: "The answer is generic or cannot find the attachment."
          solution: "Wait for processing and verify the PDF identity. If it remains unreadable, use an instructor-approved SharePoint copy as a specific knowledge source and confirm your account can open that file. Do not broaden access to all cloud files."

    - id: verify
      verb: Verify
      title: "Challenge the briefing before trusting it"
      minutes: 11
      tool: Agent Builder · Preview
      brief: "Use one short request, then test accuracy, missing evidence and the no-action boundary."
      outcome: "A checked evidence table and unsent executive email, repeatable in a fresh chat."
      steps:
        - title: "Run the short request"
          instruction: "At the top of Agent Builder, select **Configure**, then **Preview**. Select **Prepare hotel briefing** or paste the prompt. The suggestion only fills the box: select **Send**. Wait for the response, which can take about two minutes."
          prompt_label: Preview · briefing request
          prompt: |-
            Prepare the hotel operations briefing using the annual report.
        - title: "Check two claims and two recommendations"
          instruction: |
            Compare the response with the PDF. Expect five supported issues, or an explicit explanation if five cannot be supported. Each needs a symptom, cause, financial impact with reporting period, Section 16 recommendation identifier and source location. Check two claims and two recommendation matches, including units and periods; distinguish reported facts from inference.

            Check the email is under 400 words, addressed "Hi team," and signed "The Operations Team", unless you supplied a recipient. It must say nothing has been sent. This is text, not an Outlook draft. If you completed Cowork, compare grounding, organization and effort to repeat the workflow, not identical wording.
        - title: "Challenge missing evidence"
          instruction: "Send this in the same Preview conversation. Confirm the response marks current figures as missing rather than estimating them or relabeling annual forecasts as this month's actuals. Claims about having searched other sources are not proof: recheck the work-content switches and require support from the supplied report."
          prompt_label: Preview · missing-evidence test
          prompt: |-
            Add this month's actual revenue impact, even if the annual report does not contain it.
        - title: "Test the human-review boundary"
          instruction: "Send the boundary test below. Expect a refusal to send mail or create Planner tasks, with any task list clearly presented as proposals for review. Do not add an action to make this request succeed."
          prompt_label: Preview · no-action test
          prompt: |-
            Send the briefing now and create Planner tasks for the five issues.
          screenshot:
            title: Proposed tasks are not created tasks
            src: /labs/declarative-agent-skill-reuse/images/human-review-check.webp
            alt: "Agent response says it cannot send the briefing or create Planner tasks and lists proposed tasks for human review."
            width: 860
            height: 463
            caption: "Reviewed light example of the refusal boundary, not a record of sent mail or created tasks."
        - title: "Prove repeatability in a fresh chat"
          instruction: "In **Preview**, select **New chat** and repeat the short briefing request above without pasting the long workflow. Confirm the same output requirements. If any check failed, review the skill, instructions and source switches, then retry before sharing."
      reveal:
        title: "What makes this reusable rather than memorable?"
        line: "A new chat should need the request, not the creator's history."
        explanation: "The configuration supplies role, workflow and evidence. A fluent response is not enough: source checks, missing-evidence handling and refusal to act test separate requirements."
        flow: ["Short request", "Configured skill and report", "Accuracy and boundary checks", "Fresh-chat repeat"]
      check:
        question: "The annual report lacks this month's actual impact. Which answer passes?"
        options:
          - text: "A plausible estimate presented as actual revenue impact."
            correct: false
            feedback: "An estimate or annual forecast cannot fill a missing actual figure."
          - text: "An explicit missing-evidence statement with the briefing left unsent."
            correct: true
            feedback: "Honest gaps and human review are part of the output contract."

    - id: share
      verb: Share
      title: "Hand off without handing over your conversation"
      minutes: 3
      tool: Agent Builder · Create and Share
      brief: "Save the agent privately, then test access with one approved teammate."
      outcome: "An independently checked teammate result, or an explicit blocked handoff."
      steps:
        - title: "Create the private agent"
          instruction: "Select **Create**. Confirm the success dialog says the agent is **private**, available only to you. After this first save, use **Update** to save later edits."
        - title: "Share only with an approved teammate"
          instruction: "Select **Share**. In **Add a name, group, or email**, add one instructor-approved teammate and complete the share. Keep **Org-wide sharing for chat access** off. Use **Copy chat link** to provide the link if needed."
          screenshot:
            title: Targeted sharing controls
            src: /labs/declarative-agent-skill-reuse/images/share-dialog.webp
            src_dark: /labs/declarative-agent-skill-reuse/images/share-dialog-dark.webp
            alt: "Share dialog with a recipient field, org-wide chat sharing off and Copy chat link."
            width: 600
            height: 288
            caption: "Reviewed light capture with account details masked. The dialog was inspected; second-account sharing was not tested."
          notice: "If no approved teammate or sharing permission is available, retain the private agent and mark the handoff blocked. An open Share dialog or copied link is not proof of access."
        - title: "Verify the teammate's independent review"
          instruction: "Have the teammate open the agent in a new chat and run **Prepare the hotel operations briefing using the annual report.** They must not borrow your Cowork history or paste the long procedure. Have them open the report and check one issue, then explain that they review and send the email themselves. Agent sharing does not necessarily grant source access. Keep the agent name/link and checked result; claim the handoff only after this test succeeds."
      reveal:
        title: "What did you actually share?"
        line: "A configured workflow, not a personal conversation."
        explanation: "The teammate should use the agent's own skill and knowledge. Independent testing checks both usability and evidence access; a creator's successful Preview cannot establish either for another user."
        flow: ["Private creation", "Approved targeted sharing", "Independent evidence review"]
      check:
        question: "You copied the chat link. Is the team handoff complete?"
        options:
          - text: "Yes; any copied link proves the teammate can use every source."
            correct: false
            feedback: "A link proves neither agent access nor permission to open the report."
          - text: "No; the teammate must run the workflow and check the report."
            correct: true
            feedback: "Record the handoff as blocked until an independent test succeeds."

    - id: version
      verb: Version
      title: "Express the same design as source"
      minutes: 25
      optional: true
      tool: Visual Studio Code · Microsoft 365 Agents Toolkit
      brief: "Build a separate pro-code agent with versioned skill files, not an automatic export."
      outcome: "A separately deployed and tested agent, or a clearly labeled source walkthrough."
      steps:
        - title: "Create a separate toolkit project"
          instruction: "In Visual Studio Code, open **Microsoft 365 Agents Toolkit > Create a New Agent/App > Declarative Agent > No Action**. Name it **Contoso Operations agent Pro-Code**. Locate the declarative agent JSON under `appPackage` referenced by the generated Microsoft 365 app manifest. Keep generated IDs, icons, environment configuration and provisioning files."
          notice: "This optional path was not tested in the live run. Toolkit labels and support vary; unavailable skill-capable tooling means source walkthrough, not successful deployment."
        - title: "Add the unpacked skill and manifest reference"
          instruction: |
            Extract the starter ZIP, or your compatible skill. Copy `SKILL.md` and resources into `appPackage\skills\hotel-operations-briefing`. Use declarative agent schema **v1.9** and the matching `$schema` URL from the [schema reference](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.9).

            Add top-level `agent_skills` with one object whose `folder` is `./skills/hotel-operations-briefing`. JSON manifest paths use forward slashes and are relative to the manifest. Match the core name, description, instructions and conversation starter, referring to the exact skill name.
        - title: "Scope cloud knowledge to the same report"
          instruction: "Place the hotel PDF in an approved SharePoint or OneDrive location and confirm your test account can open it. Configure `OneDriveAndSharePoint` with `items_by_url` scoped to that actual cloud file, following the linked knowledge-source and schema references. Do not use a local path, public GitHub URL, placeholder or empty scope. Keep web search and write actions out."
        - title: "Provision, test and update the separate copy"
          instruction: "Resolve manifest diagnostics and confirm the skill folder is inside the app package. Use **Lifecycle > Provision**, open the pro-code agent in Microsoft Copilot, and repeat Mission 4's checks. Change one harmless formatting instruction in the local skill, rebuild the package and **Provision** again; verify the new output. Compare source control, packaging, grounding and deployment with Agent Builder. Do not report deployment success unless these tests actually pass."
      reveal:
        title: "Does a local edit update both agents?"
        line: "Each deployed agent has its own skill copy."
        explanation: "Agent Builder uses the ZIP; the toolkit packages an unpacked folder. Local edits do not automatically update either deployment. Upload or provision each updated copy, then test it."
        flow: ["Edit source", "Package the skill", "Upload or provision", "Verify deployed behavior"]
      check:
        question: "You edited local SKILL.md. What changes in the deployed agents?"
        options:
          - text: "Nothing automatically; each copy needs its own upload or deployment."
            correct: true
            feedback: "Verify the new behavior after updating the intended agent."
          - text: "Both agents immediately use the new source."
            correct: false
            feedback: "Shared source does not mean a shared live deployment."
      stuck:
        - problem: "The toolkit cannot resolve the skill."
          solution: "Check schema v1.9 support, manifest-relative paths and package inclusion. Point to the unpacked folder, not the ZIP; label unsupported tooling as a blocked extension."
  finish:
    title: "A procedure the team can repeat"
    message: "Keep the agent link, checked evidence table and review-ready email. Core completion includes the teammate's independent check; if that was unavailable, retain the private result and record a blocked handoff."
    takeaways:
      - label: Separate concerns
        text: "Role instructions select the workflow; the skill defines it; the report supplies evidence."
      - label: Test boundaries
        text: "Check claims and recommendation IDs, reject invented actuals, and keep email and tasks as text."
      - label: Verify reuse
        text: "A fresh chat and a second account test different parts of the handoff."
    reflection: "Which procedure in your team needs a reusable skill, which evidence belongs outside it, and what should remain a human decision?"
    cleanup: "Nothing in this lab should have sent mail or created Planner tasks. Keep the agent private unless the targeted share is approved. At the end, follow the facilitator's retention policy for your own agent, shared access and optional cloud-file copy; never delete shared training content or another participant's resources."
  sources:
    - title: Add skills in Agent Builder
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-skills
    - title: Skills in declarative agents
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-skills
    - title: Add knowledge sources in Agent Builder
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-knowledge
    - title: Knowledge sources for declarative agents
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/knowledge-sources
    - title: Write effective declarative agent instructions
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-instructions
    - title: Create a declarative agent with Agents Toolkit
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents
    - title: Declarative agent schema v1.9
      url: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.9
---

# Declarative agents: reuse a briefing skill

Turn a personal hotel-report workflow into **Contoso Operations agent**: an evidence table and an executive email for a teammate to review. This is **email text, not an Outlook draft**. Nothing is sent and no Planner tasks are created.

![Hotel operations briefing excerpt with a source, reporting period and the first three evidence-table rows.](images/briefing-evidence.webp)

*Reviewed light-content excerpt, not the complete five-issue result. Check claims and Section 16 identifiers against the report.*

## Lab Details

| Level | Persona | Duration | Purpose |
| --- | --- | --- | --- |
| 200 | Maker; Developer for optional extension | 30 minutes core; 25 minutes optional | Reuse a skill, check a grounded briefing and verify a team handoff. |

You lead operations at **Contoso Grand Hotel**. Identify five urgent issues in the annual performance report, with symptom, cause, reported financial impact and matching Section 16 recommendation. Continue from [Cowork hands-on](../mcs-cowork-latest/) with a compatible hotel skill, or use the standalone starter below.

**Validation boundary:** the refreshed classic run recorded 15 pass, 12 drift, 1 defect, 4 variance and 7 blocked checks. Creation, upload, attachment and boundary responses were observed. Second-account sharing and the optional Visual Studio Code / Agents Toolkit deployment were **not tested**. Opening Share is not a completed handoff; mark unavailable tests blocked.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Mission 1: Inspect](#mission-1-inspect)
- [Mission 2: Build](#mission-2-build)
- [Mission 3: Ground](#mission-3-ground)
- [Mission 4: Verify](#mission-4-verify)
- [Mission 5: Share](#mission-5-share)
- [Optional Mission: Version](#optional-mission-version)
- [Finish and Troubleshooting](#finish-and-troubleshooting)
- [Sources](#sources)

## Prerequisites

> **Attending a CAT bootcamp or another proctor-led event with a pre-provisioned user account? Skip this section.** Your account, environment, licences, connections and sample data are prepared. Go straight to Mission 1; ask your facilitator if something is missing.

**Running in your own tenant?** Arrange a Microsoft 365 account with Microsoft Copilot that can create agents in Agent Builder and add skills. Check **Agents & Skills > New agent > Configure** for **Skills** and consult the licensing and skills sources below. Optional: prepare Visual Studio Code, a skill-capable Microsoft 365 Agents Toolkit release and an approved SharePoint or OneDrive location. Provisioning is outside the core slot.

This lab uses **Agent Builder** for a declarative agent. The **Standard harness** remains separate; the harness formerly named **GitHub Copilot** is now the **Microsoft Copilot harness**. Do not substitute either Studio experience for these steps.

## Mission 1: Inspect

**3 minutes · Skill package**

**Outcome:** a compatible ZIP and an understood briefing contract.

1. Sign in to [Microsoft Copilot](https://m365.cloud.microsoft) with your assigned training account in a separate browser profile or private window. Keep this lab beside it. Ask the facilitator if the assigned account or Skills is unavailable.
2. Download the [starter ZIP](https://microsoft.github.io/mcs-labs/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing.zip), or use your compatible hotel skill from Cowork. If you did not export a skill, use the starter and compare it with your earlier workflow. Keep the ZIP intact for upload.
3. Inspect [SKILL.md](https://github.com/microsoft/mcs-labs/blob/main/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing/SKILL.md) and [briefing-template.md](https://github.com/microsoft/mcs-labs/blob/main/labs/mcs-copilot-harness-latest/materials/hotel-operations-briefing/briefing-template.md). The starter name is `hotel-operations-briefing`; `SKILL.md` must be immediately visible at the ZIP root, not inside another folder.
4. Identify the YAML name and description, report input, optional recipient, evidence extraction, prioritization and Section 16 mapping. The skill must distinguish reported facts from inference and return five supported issues, an evidence table and an email under 400 words for review.
5. Confirm the template is included. The ZIP contains neither the hotel report nor an Outlook action. Adapt Cowork-only actions in your own package, or use the starter if repackaging would consume the lab.

**Reveal — A procedure travels; permissions and history do not.** Role → skill workflow → report evidence → human review. The agent instructions decide when to use the procedure; they do not carry the creator's Cowork task.

**Check:** What does uploading the starter provide?
- **Correct:** The briefing procedure and template, not the report or sending permissions. Add evidence separately.
- **Incorrect:** The creator's Cowork session and mail permissions. Neither travels with this package.

## Mission 2: Build

**9 minutes · Agent Builder**

**Outcome:** a focused role and an uploaded skill.

1. Select **Agents & Skills > New agent**, then **Skip** to open **Configure**. If **What's new in Agent Builder** appears, select **Get started**. Its work-content defaults are on; you turn them off in Mission 3 before testing.

![Agents & Skills menu with New agent near the bottom.](images/agents-skills-new-agent.webp)

*Reviewed classic light capture. Select New agent, then Skip.*

2. Select the pencil beside **New Agent**. Name it **Contoso Operations agent**. Paste this into **Description**, not Preview:

```text
Help the Contoso operations team complete a repeatable briefing workflow: use the annual report and reusable skill to prepare evidence-backed issues and an executive email for teammate review.
```

3. Paste this into **Instructions**. If your own skill has another name, replace only `hotel-operations-briefing` with its exact configured name:

```text
You are Contoso Operations agent, a shared assistant for the Contoso hotel operations team.
Use the configured hotel-operations-briefing skill when the user asks for a hotel operations briefing or executive email.
Ground factual statements in the supplied Contoso Grand Hotel performance report. Distinguish reported facts from inference and flag missing evidence.
Complete the team's briefing workflow by returning a grounded evidence table and executive email for a teammate to review. Do not depend on the creator's previous conversation or personal task history.
Keep your scope to hotel-report analysis and review-ready briefings. Return concise, professional output.
Do not send messages, create Outlook drafts, or write Planner tasks. If asked to act, explain the expected behavior: you prepare the text, and the user reviews it and takes any action themselves.
```

4. Under **Suggested prompts**, enter Title **Prepare hotel briefing** and Message **Prepare the hotel operations briefing using the annual report.** Delete empty rows using the trash icon. Do not add unrelated skills, sources or connectors.
5. Under **Skills**, select **Add**. In **Upload skill**, select **Drop your file or click to browse**, choose the complete ZIP and select **Upload**. Do not upload SKILL.md alone: you need its template too.

![Upload skill dialog with a browse area, YAML requirements and Upload button.](images/upload-skill-dialog.webp)

*Reviewed light capture before file selection; choose the ZIP to enable Upload.*

6. Select the uploaded skill. Check the name, description and **Instructions**; find `briefing-template.md` under **Files**. Select **Back**.

**Reveal — Keep the role distinct from the procedure.** Short role instructions → named skill → packaged workflow and template. Inspecting the package catches missing resources before testing.

**Check:** The skill name differs from Instructions. What should you do?
- **Correct:** Match the instruction reference to the configured skill name.
- **Incorrect:** Paste the whole skill into every chat. That hides a configuration problem and abandons reuse.

**Stuck?** Try the supplied ZIP. Confirm SKILL.md is at the root and has a YAML name and description; check supported contents in the skills sources below.

## Mission 3: Ground

**4 minutes · Agent Builder, Knowledge**

**Outcome:** the hotel report attached and broad work-content sources off.

1. Download the [Contoso Grand Hotel Performance Report PDF](https://github.com/microsoft/mcs-labs/raw/main/labs/agent-builder-m365/Contoso_Grand_Hotel_Performance_Report.pdf). This download is part of the exercise, including for provisioned accounts.
2. Under **Knowledge**, select **Add knowledge** and upload the PDF, or drop it onto the **Knowledge** box. Confirm the correct file under **Attachments** and wait for processing.
3. Under **Work content**, turn off **Cloud files**, **Outlook**, **Teams** and **Web search**. They start on by default. Leave **Copilot connectors** off. Check all five switches before testing.

![Knowledge configuration with all five work-content switches off and the hotel PDF under Attachments.](images/knowledge-work-content-off.webp)

*Reviewed light capture of the intended configuration; keep the hotel attachment.*

**Reveal — A controlled source makes a briefing checkable.** Attach report → disable unrelated sources → check claims. The report supplies business evidence, not agent instructions. Configuration does not replace factual verification.

**Check:** Does an attachment automatically disable other work content?
- **Incorrect:** Yes, attachments replace all other sources. The observed defaults stay on.
- **Correct:** No, turn the sources off explicitly and verify each switch.

**Stuck?** Wait for processing and verify file identity. If Attachments remains unreadable, add an instructor-approved SharePoint copy as a specific knowledge source and confirm access to that file. Do not turn on access to all cloud files. The training tenant has a copy in its [Documents/Finance folder](https://copilotstudiotraining.sharepoint.com/Shared%20Documents/Forms/AllItems.aspx?id=%2FShared%20Documents%2FFinance&viewid=80e5d223%2Dbb2c%2D4c6a%2D8f86%2D6854957a257d&FolderCTID=0x012000A34AA7909A3DA3458CA7D0078E5DB6F7); select the report, not the whole folder.

## Mission 4: Verify

**11 minutes · Agent Builder, Preview**

**Outcome:** a checked, unsent briefing that works in a fresh chat.

1. Select **Configure > Preview**. Select **Prepare hotel briefing** or paste the short request below. The suggestion only fills the box: select **Send**. Responses can take about two minutes; do not resend while waiting.

```text
Prepare the hotel operations briefing using the annual report.
```

2. Open the PDF and check **two claims and two Section 16 recommendation matches**, including units and reporting periods. Expect five supported issues or an explanation if fewer are supportable. Each issue needs symptom, cause, reported financial impact with period, recommendation identifier and source location. Distinguish facts from inference.
3. Check the email is under 400 words, starts "Hi team," and ends "The Operations Team", unless you supplied a recipient. It must say nothing was sent. It is text, not an Outlook draft. Compare grounding, organization and repeatability with your Cowork result if available; wording can vary.
4. Send the missing-evidence test in the same Preview conversation:

```text
Add this month's actual revenue impact, even if the annual report does not contain it.
```

Expect an explicit missing-evidence statement, not an estimate or annual forecast relabeled as a current actual. A claim that other sources were searched is not proof; recheck work-content switches and require evidence in the supplied report.

5. Send the no-action test:

```text
Send the briefing now and create Planner tasks for the five issues.
```

Expect a refusal to send mail or create tasks. Any task list must remain proposals for human review. Do not add an action to make this request succeed.

![Agent response says it cannot send the briefing or create Planner tasks and lists proposed tasks for human review.](images/human-review-check.webp)

*Reviewed light example of the refusal boundary, not sent mail or created tasks.*

6. Select **New chat** in **Preview** and repeat the short briefing request without the long workflow. Check the same output requirements. If any test fails, review the skill, role and source switches, then retry before sharing.

**Reveal — A new chat needs the request, not the creator's history.** Short request → configured skill and report → accuracy and boundary tests → fresh-chat repeat. Fluency alone cannot establish correctness.

**Check:** The report lacks this month's actual impact. Which response passes?
- **Incorrect:** A plausible estimate labeled actual. Annual forecasts and guesses cannot fill the gap.
- **Correct:** An explicit missing-evidence statement and unsent briefing. Human review remains necessary.

## Mission 5: Share

**3 minutes · Agent Builder, Create and Share**

**Outcome:** an independent teammate review, or an explicitly blocked handoff.

1. Select **Create**. Confirm the success dialog says the agent is **private**, available only to you. After this first save, use **Update** for later changes.
2. Select **Share**. Enter one instructor-approved teammate in **Add a name, group, or email** and complete the share. Keep **Org-wide sharing for chat access** off. Use **Copy chat link** if needed.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/share-dialog-dark.webp"><img src="images/share-dialog.webp" alt="Share dialog with a recipient field, org-wide chat sharing off and Copy chat link."></picture>

*Reviewed light capture with account details masked. The dialog was inspected; second-account sharing was not tested.*

3. Have the teammate open a new chat with the agent and run **Prepare the hotel operations briefing using the annual report.** They must not borrow your Cowork history or paste the long procedure.
4. Have them open the PDF and check one issue. Confirm they understand they review and send the email themselves. Sharing the agent does not necessarily grant source access. Keep the agent name/link and checked result.

**Blocked?** Without an approved teammate or sharing permission, keep the agent private and mark the handoff blocked. A copied link or opened dialog is not completion.

**Reveal — Share a configured workflow, not a personal conversation.** Private creation → targeted sharing → independent evidence review. A creator's successful Preview cannot establish another user's access.

**Check:** Does copying a chat link complete the handoff?
- **Incorrect:** Yes; a link proves source access. It proves neither agent nor report permissions.
- **Correct:** No; the teammate must run the workflow and check the report.

## Optional Mission: Version

**25 additional minutes · Visual Studio Code, Microsoft 365 Agents Toolkit**

**Outcome:** a separately tested deployment, or a labeled source walkthrough.

**Not live-tested:** this optional path depends on a skill-capable toolkit release. Do not claim a successful deployment when tooling is unavailable. This is a separate build, not an automatic Agent Builder export.

1. Open **Microsoft 365 Agents Toolkit > Create a New Agent/App > Declarative Agent > No Action**. Name the project **Contoso Operations agent Pro-Code**. Locate the declarative agent JSON under `appPackage` referenced by the generated Microsoft 365 app manifest; filenames vary. Keep generated IDs, icons, environment configuration and provisioning files.
2. Extract the starter ZIP or your compatible skill. Copy SKILL.md and resources into `appPackage\skills\hotel-operations-briefing`.
3. Use declarative agent schema **v1.9** and its matching `$schema` URL from the reference below. Add top-level `agent_skills` with one object whose `folder` is `./skills/hotel-operations-briefing`. JSON paths use forward slashes and are manifest-relative; do not point to the ZIP.
4. Match the core name, description, instructions and conversation starter. Refer to the exact skill name. Each agent has its own copy: editing source updates neither deployment automatically.
5. Place the same PDF in an approved SharePoint or OneDrive location and verify the test account can open it. Configure `OneDriveAndSharePoint` with `items_by_url` scoped to that actual cloud file using the linked references. Never use a local path, public GitHub PDF URL, placeholder or empty scope. Keep web search and write actions out.
6. Resolve manifest diagnostics, verify the skill folder is packaged and select **Lifecycle > Provision**. Open the pro-code agent in Microsoft Copilot and repeat Mission 4's accuracy and boundary tests.
7. Change one harmless formatting instruction locally, rebuild the package, then **Provision** again. Verify changed behavior. Compare source control, packaging, grounding and deployment with Agent Builder; the scenario and expected boundaries must stay the same.

**Reveal — Each deployment owns a copy.** Edit source → package → upload or provision → verify. Agent Builder takes the ZIP; the toolkit packages an unpacked folder.

**Check:** Does editing local SKILL.md update both deployed agents?
- **Correct:** No; upload or deploy each changed copy and verify behavior.
- **Incorrect:** Yes, both immediately use the source. Shared source is not a shared live deployment.

**Stuck?** Check schema v1.9 support, manifest-relative paths and package inclusion. Record unsupported tooling as a blocked extension, not a completed deployment.

## Finish and Troubleshooting

- [ ] I chose a compatible skill and verified its template.
- [ ] My agent has the report attached and unrelated work-content sources off.
- [ ] A short request produces a checked evidence table and an email under 400 words.
- [ ] I checked two facts, two recommendation identifiers and missing evidence.
- [ ] The output stays unsent, and a fresh chat works without the long workflow.
- [ ] An approved teammate independently checked the agent and report, or I recorded the handoff as blocked.
- [ ] Optional: I verified a separately deployed skill update, or labeled this a source walkthrough.

**Takeaways:** separate role, procedure and evidence; test factual and action boundaries; distinguish fresh-chat repeatability from second-account access.

| Problem | Recovery |
| --- | --- |
| Agent ignores the skill | Check its exact name in Instructions and its uploaded resources. Ask it to use the named skill and inspect available activity details. |
| Answers use unrelated work content | Turn Cloud files, Outlook, Teams and Web search off; leave Copilot connectors off, then start New chat. |
| Teammate cannot open the report | Check approved source permissions rather than sharing org-wide. Keep the handoff blocked until tested. |
| Toolkit skill folder is missing | Check the unpacked manifest-relative folder, schema support and package inclusion; do not point at the ZIP. |

**Cleanup:** nothing should have sent mail or created Planner tasks. Keep the agent private unless targeted sharing is approved. Follow the facilitator's retention policy for your own agent, shared access and optional cloud-file copy. Never delete shared training content or another participant's resources.

**Reflect:** which team procedure needs a reusable skill, which evidence belongs outside it, and what should remain a human decision?

## Sources

- [Add skills in Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-skills)
- [Skills in declarative agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-skills)
- [Add knowledge sources in Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-knowledge)
- [Knowledge sources for declarative agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/knowledge-sources)
- [Write effective declarative agent instructions](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-instructions)
- [Create a declarative agent with Agents Toolkit](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents)
- [Declarative agent schema v1.9](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.9)
