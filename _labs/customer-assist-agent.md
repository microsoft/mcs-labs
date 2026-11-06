---
lab_format: missions
module: customer-conversation-harness
title: 'Customer Assist Agent: from intent to a specialist'
order: 122
duration: 30
difficulty: 200
lab_type: local
section: intermediate_labs
journeys:
  - developer
description: 'Build a Zava Coffee concierge and cancellation specialist, inspect real routing evidence, and test voice while distinguishing verified controls from unverified spoken behavior.'
classes: wide
author_profile: false
toc: false
unlisted: true
search: false
sitemap: false
mission_lab:
  headline: From customer intent
  headline_emphasis: to the right specialist.
  promise: 'Three core missions build a concierge, inspect cancellation routing and exercise voice. An optional mission adds enrollment, billing and delivery specialists.'
  hero_image:
    src: /labs/customer-assist-agent/images/canvas-one-subagent.webp
    alt: Zava Coffee Subscription Assistant with an intent skill connected to Subscription Cancellation with a cancellation skill.
    width: 1520
    height: 915
    caption: 'Your finish line: an unpublished Zava Coffee assistant with one cancellation specialist and a skill on each agent. This light build-canvas capture shows the artifact, not a production deployment.'
  scenario: |-
    You are building a customer-service prototype for **Zava Coffee**. Customers want to enroll, change billing, move deliveries or cancel. Build a **Customer Assist Agent** on the Customer conversation harness, then compare what the primary agent does before and after a cancellation specialist exists. **Demo Mode** simulates results; no real subscription changes.

    **Evidence boundary:** the primary-agent build and chat test passed on 6 November 2026. The original four-message cancellation sequence stalled after the reason; a fresh combined-request diagnostic retry completed. Delivery stayed with the primary. Voice connection, Listening and end-call controls were verified, but no spoken input was supplied: recognition, spell-back and spoken cancellation remain unverified. Optional specialists were not tested. Treat those checks as exercises to perform, not reported successes.

    ### Prerequisites

    > **Taking part in a proctor-led event with a pre-provisioned user account? Skip this section.** Your lab account, environment, licences, connections and sample data are already set up. Continue with the exercise inputs and sign in with your lab account when prompted. If anything is missing, ask your facilitator.

    **Running this lab in your own tenant?** Prepare these separately before the timed exercise:

    - Access to [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/) in an environment offering **Customer conversation agent**.
    - Permission to create agents in that environment.
    - Copilot Studio access and billing capacity for the preview. Building, testing and evaluating agents can consume Copilot Credits; see [usage and billing](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/overview-customer-conversation).

    No live subscription backend, production phone number or contact-center deployment is required.
  prerequisites:
    - 'Use your assigned **training account** in a separate browser profile or private window, not a personal or production account. Select the facilitator-provided environment in [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/).'
    - Keep this lab beside the browser. The fictional subscription ID **SUB-1042** and all configuration text are supplied below. Use only fictional contact and payment details; there are no exercise downloads.
    - 'For the voice exercise, have a microphone and speakers or headset, and allow microphone access in the browser. Without audio, use Web Chat or watch the facilitator, and record spoken checks as unverified.'
  pacing: 'Plan 30 minutes for Build (10) → Route (12) → Speak (8). Extend is optional and takes 15 additional minutes. These are working budgets, not measured run times or response-time guarantees. Wait for provisioning and responses; read a reveal while waiting rather than submitting duplicate requests.'
  missions:
    - id: build
      verb: Build
      title: Give the primary agent a clear job
      minutes: 10
      tool: Copilot Studio preview
      brief: 'Create a concierge, separate channel guidance, and observe a cancellation request before a specialist exists.'
      outcome: 'A saved primary agent with General and Voice instructions, an identify-caller-intent skill, and a baseline chat trace.'
      steps:
        - title: Choose the customer-conversation creation option
          instruction: 'Open [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/), sign in with your lab account and select the assigned environment. Review and dismiss any first-run notice or tour. Select **Agents** → **More create options** (the arrow beside **New agent**) → **Customer conversation agent**.'
          notice: 'Customer Assist Agents are in preview. The tested accessible name is **Customer conversation agent, uses Copilot Credits**. If it is missing, ask your facilitator; do not substitute the separate Standard or Microsoft Copilot agent options. Ask about unexpected consent or access requests.'
          screenshot:
            title: the customer-conversation creation option
            src: /labs/customer-assist-agent/images/new-agent-menu.webp
            src_dark: /labs/customer-assist-agent/images/new-agent-menu-dark.webp
            alt: More create options offers Customer conversation agent separately from Microsoft Copilot agent and Agent Standard.
            width: 480
            height: 550
            caption: Choose Customer conversation agent. The Standard and Microsoft Copilot options are different harnesses.
        - title: Create a distinctively named agent
          instruction: 'Leave the description box empty. Under **Start from scratch**, select **Create agent**. In the naming dialog, enter the name below plus your short initials, for example `Zava Coffee Subscription Assistant RS`. Select **Create** and wait until provisioning finishes and fields become editable.'
          prompt_label: Agent name
          prompt: Zava Coffee Subscription Assistant
        - title: Open the primary agent
          instruction: 'On **Build**, open the primary agent card. Leave **Human handoff** → **Handoff method** → **Needs setup** unchanged; human handoff is outside this lab.'
        - title: Describe the concierge role
          instruction: 'Select **Description**, paste the text below and select **Save** for that field.'
          prompt_label: Primary agent · Description
          prompt: 'Acts as a concierge for Zava customers, helping them enroll in new coffee subscriptions, manage account and billing details, adjust delivery preferences, or cancel subscriptions by routing each request to the right specialist.'
        - title: Set the cross-channel instructions
          instruction: 'Select **Expand instructions**. On **General**, paste the instructions below. They name four specialists, but you will initially create only cancellation. Do not add a backend or knowledge source.'
          prompt_label: Primary agent · General instructions
          prompt: |-
            ## Purpose
            You are the main voice assistant for Zava Coffee subscriptions. Your role is to greet callers, understand their needs, collect essential details, and route them seamlessly to the right specialist sub-agent for subscription enrollment, account management, delivery adjustments, or cancellations.

            ## General Guidelines
            - Be friendly, concise, and conversational.
            - Confirm understanding by paraphrasing the caller's request.
            - Collect shared prerequisites early (like `customerId`, `subscriptionId`, or `email`).
            - Route silently to the appropriate sub-agent once you have the needed details.
            - Never announce internal routing or department names.

            ## Routing Rules
            - **New Subscription Enrollment** → Route to **Subscription Enrollment & Setup** once you confirm the caller wants to start a new subscription and collect their `email`, preferred coffee type, and delivery frequency.
            - **Account or Billing Management** → Route to **Account & Billing Management** after confirming the caller's `customerId` and verifying which billing or payment detail they want to update.
            - **Delivery Changes (dates, quantities, frequency)** → Route to **Delivery Scheduling & Adjustments** once you have the `subscriptionId` and the desired change details.
            - **Pause or Skip Deliveries** → Also handled by **Delivery Scheduling & Adjustments**; confirm the `subscriptionId` and the pause duration.
            - **Cancel Subscription** → Route to **Subscription Cancellation** after confirming the `subscriptionId` and reason for cancellation.

            Shared prerequisites: `customerId`, `subscriptionId`, and `email` are required by multiple sub-agents. Collect and confirm these early, then pass them along silently to the sub-agent that needs them.

            If a caller's request doesn't match any known intent, ask one clarifying question to determine whether it relates to subscription setup, account management, delivery, or cancellation before routing.
        - title: Add voice-only guidance
          instruction: 'Select **Voice**, paste the guidance below, leave **Chat** unchanged, then select **Save**. Voice adds guidance on top of General; it does not replace it.'
          prompt_label: Primary agent · Voice instructions
          prompt: |-
            ## Voice interaction guidelines
            - Speak in short, natural turns.
            - Confirm understanding by paraphrasing.
            - Spell back critical data (names, phone numbers, confirmation codes) digit-by-digit.
            - Ask one question at a time.
            - Avoid reading long lists, URLs, or markdown aloud.
            - Gracefully handle speech-recognition errors, silence, barge-in, and requests to repeat.
          notice: The tested preview label is **Voice**; Microsoft Learn calls this tab **Speech**. Follow the label available in your preview. Saving these instructions is not proof of spoken behavior.
          screenshot:
            title: the Voice instructions editor
            src: /labs/customer-assist-agent/images/voice-instructions.webp
            src_dark: /labs/customer-assist-agent/images/voice-instructions-dark.webp
            alt: 'Voice tab with short-turn, spell-back and one-question-at-a-time instructions and a Save control.'
            width: 1560
            height: 360
            caption: Voice is extra guidance for calls. General remains active across channels.
        - title: Add the intent procedure
          instruction: 'Next to **Skills**, select **+**. In **Add skill**, select **Generative**. Set **Name** to `identify-caller-intent` and **Description** to `Determines what the caller wants to do with their coffee subscription before routing.` Paste the text below into **Instructions**, then select **Add skill**.'
          prompt_label: identify-caller-intent · Instructions
          prompt: |-
            ### Purpose
            Identify whether the caller wants to enroll, manage billing, change delivery, pause, or cancel.
            ### Steps
            1. Greet the caller and ask what they'd like help with.
            2. Listen for keywords like 'new subscription', 'billing', 'delivery', 'pause', or 'cancel'.
            3. Confirm understanding by paraphrasing.
            4. Collect shared prerequisites (`customerId`, `subscriptionId`, `email`).
            5. Route silently to the correct sub-agent.
        - title: Start with an open request
          instruction: Save your changes. Select **Preview** → **Web Chat**; the tested preview initially selected **Voice Call**. Send the message below and wait for a reply. Look for a greeting and a question that narrows the request.
          prompt_label: Web Chat · Baseline greeting
          prompt: 'Hi, I need help with my coffee subscription'
        - title: Observe the primary without a specialist
          instruction: 'Send the cancellation request, then open **Activity map**. Look for the primary asking for your subscription ID and reason, with no sub-agent invocation. Record what you actually observe; the baseline is for comparison with the next mission.'
          prompt_label: Web Chat · Before the specialist
          prompt: I want to cancel my subscription
          screenshot:
            title: the no-specialist baseline
            src: /labs/customer-assist-agent/images/test-cancel-no-subagent.webp
            src_dark: /labs/customer-assist-agent/images/test-cancel-no-subagent-dark.webp
            alt: 'The primary agent requests subscription ID and cancellation reason while Activity map shows model response generation, not a sub-agent.'
            width: 1520
            height: 915
            caption: 'Verified baseline: the primary handles the request itself. A named routing rule cannot invoke a specialist that does not exist.'
      reveal:
        title: Why did the primary keep the request?
        line: Instructions describe an intended route; the specialist must also exist.
        explanation: 'The baseline asked for an ID and reason without invoking a sub-agent. **General** establishes the concierge role, **Voice** adds channel-specific guidance, and the **Generative skill** supplies a reusable procedure. They do not create the four specialists mentioned in the instructions.'
        flow:
          - Customer request
          - Intent procedure
          - Primary response while no specialist exists
      check:
        question: Does naming Subscription Cancellation in General instructions create that specialist?
        options:
          - text: Yes; the routing rules automatically create it.
            correct: false
            feedback: No. The baseline trace has no specialist invocation because you have not created a sub-agent.
          - text: No; add the sub-agent and save its description and instructions.
            correct: true
            feedback: Correct. Routing needs an available specialist with an appropriate description; the next mission adds it.
      stuck:
        - problem: The creation option is missing or fields are disabled.
          solution: Confirm the preview URL and assigned environment. Wait for provisioning if fields are disabled. Ask the facilitator about missing access; do not change harnesses.
        - problem: Preview does not reflect an edit.
          solution: 'Save each edited field, select **Start new test session** at the top right and repeat the same scenario. Preview uses saved changes.'
    - id: route
      verb: Route
      title: Give cancellation to a specialist
      minutes: 12
      tool: Copilot Studio preview
      brief: 'Add one specialist, test the original conversation, and distinguish a successful diagnostic retry from an end-to-end pass.'
      outcome: 'A cancellation specialist with its own skill, plus an Activity map comparison of cancellation and delivery requests.'
      steps:
        - title: Create and name the specialist
          instruction: 'On **Build**, select **Add a sub-agent**. Wait for **New Sub-Agent** to finish provisioning. Select its title, enter the exact name below and select the checkmark labeled **Save name**. Keep this spelling: the primary routing rules refer to it.'
          prompt_label: Sub-agent name
          prompt: Subscription Cancellation
        - title: Describe when to route here
          instruction: 'Select **Description**, paste the text and select **Save** for that field. The primary uses this description when choosing a specialist. References to policy knowledge in the supplied text do not add a knowledge source; this lab stays in Demo Mode.'
          prompt_label: Subscription Cancellation · Description
          prompt: Handles cancellation requests; includes the `Cancel Subscription Flow` skill and uses coffee subscription policy knowledge.
        - title: Give the specialist a bounded procedure
          instruction: 'Open **Instructions**, paste the text and select **Save** for that field. Keep **Demo Mode**: it asks for confirmation and simulates a result without connecting a backend.'
          prompt_label: Subscription Cancellation · Instructions
          prompt: |-
            ### Purpose
            Assist callers in canceling their coffee subscription.
            ### General Guidelines
            - Handle only cancellation requests.
            - Required inputs: `subscriptionId` and reason for cancellation.
            - Confirm cancellation before finalizing.
            - If the caller asks about billing or delivery, route back to the root agent silently.
            ### Steps
            1. Confirm the caller's `subscriptionId`.
            2. Ask for the reason for cancellation.
            3. Confirm understanding and process cancellation.
            4. Provide confirmation code and final delivery details.
            ### Error Handling
            If the subscription cannot be canceled immediately, explain the next available cancellation date and confirm acceptance.
            ### Demo Mode
            This is a demo with no backend system. Finish the whole cancellation yourself before you return to the main conversation:
            - Once you have the `subscriptionId` and the reason, ask the caller to confirm with yes or no, and wait for the answer.
            - When the caller says yes, reply in the same turn with a simulated success: a confirmation code like ZC-12345 and that the final delivery ships within 3 business days.
            - Return to the main conversation only after you have given the confirmation code, or when the caller asks about something other than cancellation.
        - title: Add the cancellation skill
          instruction: 'In the specialist panel, select **+** beside **Skills**. In **Add skill**, select **Generative**. Set **Name** to `cancel-subscription-flow` and **Description** to `Guides callers through canceling their coffee subscription.` Paste the text into **Instructions**, then select **Add skill**.'
          prompt_label: cancel-subscription-flow · Instructions
          prompt: |-
            ### Purpose
            Help callers cancel their subscription.
            ### Steps
            1. Ask for the `subscriptionId`.
            2. Confirm the reason for cancellation.
            3. Verify and process the cancellation.
            4. Provide confirmation code and any final delivery information.
        - title: Check the saved build
          instruction: 'Confirm each edited field is saved, then close the panel. Find the primary connected to **Subscription Cancellation**, with one sub-agent and the two skills on their respective cards.'
          screenshot:
            title: the saved primary agent and specialist
            src: /labs/customer-assist-agent/images/canvas-one-subagent.webp
            src_dark: /labs/customer-assist-agent/images/canvas-one-subagent-dark.webp
            alt: Zava Coffee Subscription Assistant with an intent skill connected to Subscription Cancellation with a cancellation skill.
            width: 1520
            height: 915
            caption: 'The saved build: one primary agent and one specialist. These cards are configuration, not evidence that every conversation succeeds.'
        - title: Begin the original four-message test
          instruction: 'Select **Preview** → **Web Chat**, then **Start new test session** at the top right. Send this first message. Wait for each reply before the next message; do not paste all four together.'
          prompt_label: Web Chat · Original sequence 1 of 4
          prompt: I want to cancel my subscription
          notice: 'The original live sequence stalled after the third message, the reason. Keep this test distinct from the diagnostic retry below. A successful retry does not prove that the original sequence works end to end.'
        - title: Supply the subscription ID
          instruction: 'When asked for the subscription, send the fictional identifier below and wait for the next reply.'
          prompt_label: Web Chat · Original sequence 2 of 4
          prompt: SUB-1042
        - title: Supply the reason
          instruction: 'When asked for the reason, send the text below. Wait for the confirmation question. If the conversation remains silent for about two minutes, use the bounded diagnostic step below instead of continuing blindly.'
          prompt_label: Web Chat · Original sequence 3 of 4
          prompt: I am moving abroad
        - title: Confirm only when asked
          instruction: 'When the agent asks you to confirm cancellation, send the response below. Look for a simulated confirmation code and final delivery details. If the previous turn stalled, record the original sequence as incomplete; this confirmation is still the next intended turn, not an observed pass.'
          prompt_label: Web Chat · Original sequence 4 of 4
          prompt: 'Yes, please cancel it'
          notice: '**Expected response example — comparison only, not text to send:** a simulated code such as **ZC-10421** and final delivery within **3 business days**. Codes and wording vary. No real subscription is changed.'
        - title: Use one diagnostic retry if the original stalls
          instruction: 'Inspect both the chat and **Activity map**, not just the main **Execution summary**. Select **Start new test session** and retry once with `I want to cancel my subscription. My subscription ID is SUB-1042, and I am moving abroad.` When asked, send `Yes, please cancel it`. If this also stalls, stop and ask your facilitator.'
          notice: '**Observed retry result — comparison only:** the fresh combined request routed to the specialist; confirmation returned **ZC-12345** and final delivery within **3 business days**. Record this as a diagnostic retry, separately from the stalled original conversation. The two-minute boundary is a troubleshooting limit, not a latency guarantee.'
        - title: Read the complete trace
          instruction: 'In **Activity map**, inspect the invocation of **Subscription Cancellation**, its inputs and its return. Look for **Interpreting agent intent**, **Preparing agent inputs**, **Executing agent**, **Reviewing nested activity**, and **Return To Main Conversation Tool**. Compare the actual reply with the final return status.'
          notice: The verified diagnostic trace included an intermediate **Cancelled** tool action followed by a **Completed** return. Neither the intermediate status alone nor the top-level summary alone tells you whether the customer received a result.
          screenshot:
            title: the successful diagnostic retry
            src: /labs/customer-assist-agent/images/test-cancel-routed.webp
            src_dark: /labs/customer-assist-agent/images/test-cancel-routed-dark.webp
            alt: Combined cancellation request and confirmation produce simulated ZC-12345 while nested activity shows a Cancelled action followed by a Completed return.
            width: 1520
            height: 915
            caption: 'Diagnostic retry only, not the original four-message sequence. The chat confirms a simulated result; the trace includes both intermediate Cancelled and final Completed statuses.'
        - title: Compare with a delivery request
          instruction: 'Select **Start new test session** and send the delivery question below. Inspect **Activity map** again. The verified run stayed with the primary, asked for a subscription ID and showed no specialist invocation because no delivery specialist existed.'
          prompt_label: Web Chat · Delivery without a specialist
          prompt: Can I change my delivery date to next Friday?
      reveal:
        title: What counts as evidence of routing?
        line: Read the customer reply and the specialist lifecycle together.
        explanation: The saved **Description** helps the primary choose a specialist; **Activity map** shows the invocation and return. A simulated confirmation is not a backend write. A completed combined-request retry is also not a pass for the original four-message sequence. Keep those claims separate.
        flow:
          - Intent and required inputs
          - Specialist invocation
          - Confirmation and simulated result
          - Return to primary
      check:
        question: 'The original sequence stalls, but the fresh combined-request retry returns a code. What can you conclude?'
        options:
          - text: The original four-message sequence passed and a real subscription was canceled.
            correct: false
            feedback: 'Neither conclusion is supported. The original remained incomplete, and Demo Mode has no subscription backend.'
          - text: The diagnostic retry completed a simulated cancellation; the original sequence still needs investigation.
            correct: true
            feedback: 'Correct. Preserve the distinction and inspect chat plus the final return, including any intermediate statuses.'
      stuck:
        - problem: The cancellation does not route.
          solution: 'Check the exact specialist name and saved **Description**. Save all edits and use a fresh test session. If the single diagnostic retry also stalls, stop and ask the facilitator.'
        - problem: The test pane reports TelephonyBadRequest or another error.
          solution: 'Record the error, select **Start new test session** and retry once. If it persists, ask your facilitator; do not infer a root cause from the error alone.'
    - id: speak
      verb: Speak
      title: Test voice without overstating the result
      minutes: 8
      tool: Copilot Studio preview
      brief: Use the same agent in Voice Call and separate connection controls from actual speech checks.
      outcome: 'A voice-test record that distinguishes connection, recognition, spell-back and cancellation, followed by an ended call.'
      steps:
        - title: Prepare audio and select Voice Call
          instruction: 'Connect a microphone and speakers or a headset. In **Preview**, select **Voice Call**. Use a browser with microphone access permitted for the preview site. If audio is unavailable, use **Web Chat** or watch the facilitator; mark your own spoken checks unverified.'
          notice: 'Only connection, **Listening...**, and end-call controls were verified in the source run. No spoken input was supplied. The remaining steps teach what to test; they are not reported successes.'
          screenshot:
            title: the Voice Call panel before connection
            src: /labs/customer-assist-agent/images/voice-call-panel.webp
            src_dark: /labs/customer-assist-agent/images/voice-call-panel-dark.webp
            alt: Voice Call selected with the call control and an empty Live Transcript displaying Not connected.
            width: 1520
            height: 915
            caption: The captured panel is not connected. Connection and end-call controls were exercised separately; this image is not evidence of speech recognition or a completed cancellation.
        - title: Connect and check the transcript
          instruction: 'Select **Start voice conversation** and allow microphone access if asked. Confirm **Listening...** and **Voice call connected** in **Live Transcript**, then wait for the greeting. A connected call alone does not demonstrate recognition.'
        - title: Speak the cancellation request
          instruction: Say **“I want to cancel my subscription.”** Watch whether **Live Transcript** records what you said. Record recognition as unverified if you do not supply spoken input.
        - title: Provide details and confirm
          instruction: 'When asked, say your subscription ID, for example **“S U B one zero four two”**, then a reason such as **“I’m moving abroad”**. Confirm when asked. Use only fictional identifiers and note any recognition errors.'
        - title: 'Check the spoken behavior, not just the connection'
          instruction: 'Listen and inspect **Live Transcript** and **Activity map**. Check pauses, silent internal routing, clear identifiers and confirmation codes, one question at a time, and no markdown read aloud. Check for a simulated confirmation code. Record each mismatch rather than assuming saved Voice instructions guarantee the behavior.'
          notice: 'Recognition, spell-back, turn-taking, speech quality and spoken cancellation were not verified in the source run. Do not mark them passed merely because chat worked or the call connected.'
        - title: End the call and leave a draft
          instruction: 'Select **End conversation** and verify that **Start voice conversation** returns. Leave the agent unpublished. Do not configure production channels, triggers, schedules or a backend for this lab.'
      reveal:
        title: Why is voice a separate test?
        line: The build is shared; the channel still needs its own evidence.
        explanation: '**Voice** layers speaking guidance over **General**. Preview lets you exercise that channel without deploying a production phone number. But a connected session proves only connection, not recognition or successful spoken cancellation.'
        flow:
          - General instructions
          - Voice guidance
          - Spoken test and transcript
          - End conversation
      check:
        question: 'The call connects and shows Listening, but you say nothing. Which result is supported?'
        options:
          - text: The voice cancellation and spell-back checks passed.
            correct: false
            feedback: 'No spoken scenario ran, so neither behavior was tested.'
          - text: Connection worked; recognition and spoken cancellation remain unverified.
            correct: true
            feedback: 'Correct. Record connection separately, and end the call even when the spoken checks cannot be completed.'
      stuck:
        - problem: There is no sound or microphone input.
          solution: 'Check browser microphone permission and the selected audio device, then try the call again. If audio remains unavailable, use Web Chat or watch the facilitator, record voice checks as unverified and end any connected call.'
    - id: extend
      verb: Extend
      title: Add three optional specialists
      minutes: 15
      optional: true
      tool: Copilot Studio preview
      brief: 'Extend the concierge to enrollment, billing and delivery using the same specialist pattern.'
      outcome: 'Three additional draft specialists and a recorded routing test for each, if time permits.'
      steps:
        - title: Reuse the specialist pattern
          instruction: 'Repeat **Build** → **Add a sub-agent** for each specialist below. Wait for provisioning, rename **New Sub-Agent** with the exact supplied name and select **Save name**. Save **Description** and **Instructions** separately, then use **+** beside **Skills** → **Generative**. Use only fictional contact and payment details.'
          notice: 'These optional specialists were not created or tested in the source run. Their expected routing is a target to verify, not a verified outcome. Keep Demo Mode; references to knowledge in the supplied descriptions do not connect knowledge or a backend.'
        - title: Name the enrollment specialist
          instruction: 'Create the first optional sub-agent, enter this exact name and select **Save name**.'
          prompt_label: Enrollment · Name
          prompt: Subscription Enrollment & Setup
        - title: Describe enrollment requests
          instruction: Paste into the enrollment specialist’s **Description** and select **Save**.
          prompt_label: Enrollment · Description
          prompt: Handles new coffee subscription sign-ups; includes the `Create New Subscription` skill and uses subscription setup knowledge.
        - title: Set the enrollment instructions
          instruction: Paste into **Instructions** and select **Save**. The requested payment details must remain fictional; this is a simulated enrollment.
          prompt_label: Enrollment · Instructions
          prompt: |-
            ### Purpose
            Assist callers in enrolling in a new Zava coffee subscription.
            ### General Guidelines
            - Handle only new subscription requests.
            - Required inputs: `email`, preferred coffee type, delivery frequency, and payment method.
            - Confirm all details before finalizing enrollment.
            - If the caller asks about billing or delivery changes, route back to the root agent silently.
            ### Steps
            1. Confirm the caller wants to start a new subscription.
            2. Gather required inputs.
            3. Verify coffee preferences and delivery frequency.
            4. Confirm payment method.
            5. Summarize and confirm the subscription details.
            6. Provide a confirmation code or next delivery date.
            ### Error Handling
            If any required input is missing, ask for it clearly and confirm before proceeding.
            ### Demo Mode
            This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
        - title: Add the enrollment skill
          instruction: Select **+** beside **Skills** → **Generative**. Set **Name** to `create-new-subscription` and **Description** to `Guides callers through creating a new Zava coffee subscription.` Paste these **Instructions** and select **Add skill**.
          prompt_label: create-new-subscription · Instructions
          prompt: |-
            ### Purpose
            Help callers create a new Zava coffee subscription.
            ### Steps
            1. Ask for the caller's `email` and preferred coffee type.
            2. Confirm delivery frequency and quantity.
            3. Collect payment details.
            4. Review and confirm all information.
            5. Provide confirmation code and expected first delivery date.
        - title: Name the billing specialist
          instruction: 'Create the second optional sub-agent, enter this exact name and select **Save name**.'
          prompt_label: Billing · Name
          prompt: Account & Billing Management
        - title: Describe account and billing requests
          instruction: Paste into the billing specialist’s **Description** and select **Save**.
          prompt_label: Billing · Description
          prompt: Manages customer account and billing details; includes the `Update Payment Method` skill and uses billing procedures knowledge.
        - title: Set the billing instructions
          instruction: Paste into **Instructions** and select **Save**. Do not enter real payment details or treat the demo identity check as production authentication.
          prompt_label: Billing · Instructions
          prompt: |-
            ### Purpose
            Assist callers with updating account or billing information.
            ### General Guidelines
            - Handle only account and billing requests.
            - Required inputs: `customerId`, `email`, and payment details.
            - Confirm changes before saving.
            - If the caller asks about delivery or cancellation, route back to the root agent silently.
            ### Steps
            1. Confirm the caller's identity using `customerId`.
            2. Ask what they want to update.
            3. Collect and confirm the new payment or contact information.
            4. Save and confirm the update.
            ### Error Handling
            If payment details are incomplete, ask for the missing fields and confirm before proceeding.
            ### Demo Mode
            This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
        - title: Add the payment-method skill
          instruction: Select **+** beside **Skills** → **Generative**. Set **Name** to `update-payment-method` and **Description** to `Helps callers update the payment method on their coffee subscription.` Paste these **Instructions** and select **Add skill**.
          prompt_label: update-payment-method · Instructions
          prompt: |-
            ### Purpose
            Assist callers in updating their payment method.
            ### Steps
            1. Ask for the `customerId` and current payment method.
            2. Collect the new payment details.
            3. Confirm accuracy and save changes.
            4. Notify the caller of the successful update.
        - title: Name the delivery specialist
          instruction: 'Create the third optional sub-agent, enter this exact name and select **Save name**.'
          prompt_label: Delivery · Name
          prompt: Delivery Scheduling & Adjustments
        - title: Describe delivery requests
          instruction: Paste into the delivery specialist’s **Description** and select **Save**.
          prompt_label: Delivery · Description
          prompt: 'Handles delivery date, quantity, frequency changes, and pauses; includes the `Modify Delivery Schedule` skill and uses delivery schedule options knowledge.'
        - title: Set the delivery instructions
          instruction: Paste into **Instructions** and select **Save**. Keep the simulated success in Demo Mode.
          prompt_label: Delivery · Instructions
          prompt: |-
            ### Purpose
            Assist callers in changing delivery dates, quantities, or frequency, and pausing or skipping deliveries.
            ### General Guidelines
            - Handle only delivery-related requests.
            - Required inputs: `subscriptionId` and the desired change details.
            - Confirm all changes before saving.
            - If the caller asks about billing or cancellation, route back to the root agent silently.
            ### Steps
            1. Confirm the caller's `subscriptionId`.
            2. Ask what change they want (date, quantity, frequency, pause).
            3. Record and confirm the new schedule.
            4. Summarize and confirm the next delivery date.
            ### Error Handling
            If the requested date or quantity is unavailable, offer the nearest available option.
            ### Demo Mode
            This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
        - title: Add the delivery skill
          instruction: 'Select **+** beside **Skills** → **Generative**. Set **Name** to `modify-delivery-schedule` and **Description** to `Helps callers change, pause, or skip deliveries on their coffee subscription.` Paste these **Instructions** and select **Add skill**.'
          prompt_label: modify-delivery-schedule · Instructions
          prompt: |-
            ### Purpose
            Help callers adjust their delivery schedule.
            ### Steps
            1. Ask for the `subscriptionId`.
            2. Ask what change they want (date, quantity, frequency, pause).
            3. Confirm the new schedule.
            4. Save and confirm the update.
        - title: Test each optional route independently
          instruction: |-
            Save all fields and close the panel. Check for four specialists including cancellation. In **Preview** → **Web Chat**, select **Start new test session** before each test below. Supply fictional follow-up details when asked and inspect **Activity map**. Record the actual result separately for each.

            | Send | Expected specialist to verify |
            | --- | --- |
            | `Can I change my delivery date to next Friday? My subscription ID is SUB1042.` | Delivery Scheduling & Adjustments |
            | `I want to start a new coffee subscription. My email is alex@contoso.com, medium roast, every two weeks.` | Subscription Enrollment & Setup |
            | `I need to update my credit card. My customer ID is C-7781.` | Account & Billing Management |

            Compare delivery with the core baseline: it should now be eligible for a specialist instead of remaining with the primary. These optional test inputs are supplied for practice; none was revalidated in the source run.
          notice: 'Any confirmation is still a simulated output for comparison, not proof of enrollment, payment or delivery changes in a real system.'
      reveal:
        title: What changed when the specialists became available?
        line: The concierge can delegate more jobs without becoming every procedure.
        explanation: 'Each new specialist has a narrow description, its own instructions and a reusable skill. Compare traces before and after adding delivery; then test that unrelated requests return to the primary. Availability makes a route possible, but you still need evidence that the route was taken.'
        flow:
          - Request type
          - Matching specialist description
          - Specialist procedure
          - Simulated result and return
      check:
        question: What should demonstrate that delivery now uses its specialist?
        options:
          - text: The primary instructions mention the specialist’s name.
            correct: false
            feedback: That name was present before the specialist existed. Instructions alone do not prove execution.
          - text: A fresh delivery conversation and Activity map showing the specialist invocation and return.
            correct: true
            feedback: 'Correct. Verify the actual trace and result, and label the optional test unverified if you do not run it.'
      stuck:
        - problem: An optional request remains with the primary.
          solution: 'Verify the exact specialist name, save its **Description** and other edited fields, then start a fresh test session. Record unresolved behavior rather than claiming the optional route passed.'
  finish:
    title: Take a tested boundary with you
    message: 'Keep an unpublished Zava Coffee assistant with its cancellation specialist, and a record of what you actually tested. A useful prototype includes both working paths and honest coverage gaps.'
    takeaways:
      - label: Separate responsibility
        text: The primary identifies intent; a specialist owns a bounded job and its skill.
      - label: Inspect the route
        text: 'Use saved descriptions, the actual conversation, and the specialist invocation and return to explain behavior.'
      - label: Distinguish evidence
        text: 'Original sequence, diagnostic retry, voice connection and spoken behavior are separate test results.'
      - label: Keep the safety boundary
        text: 'Demo Mode is simulation. A code is not proof of a backend change, and no real payment details belong here.'
    reflection: 'Which customer task in your work deserves a specialist, and what evidence would you require before replacing its simulated result with a real action?'
    cleanup: 'End any voice conversation and verify **Start voice conversation** returns. Leave your agent unpublished. The verified source run left **Zava Coffee Subscription Assistant CC** with **Subscription Cancellation**, two skills and **Human handoff** still **Needs setup**; it added no triggers, publication or backend. Your own draft uses your initials. Follow the facilitator’s retention guidance rather than deleting another attendee’s agent. Credits were not measured; do not assume testing was free.'
  sources:
    - title: Create an agent with the Customer Conversation harness
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/build-new-agent-customer-conversation'
    - title: Configure details and channel-specific instructions
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/authoring-instructions-customer-conversation'
    - title: Create a Generative or Topic skill
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/skills-create-customer-conversation'
    - title: Add a sub-agent
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/sub-agents-add-customer-conversation'
    - title: 'Preview and test chat, voice and routing'
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/preview-test-customer-conversation'
    - title: 'Customer Conversation harness overview, preview and billing'
      url: 'https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/overview-customer-conversation'
---
# Customer Assist Agent: from intent to a specialist

Build a Zava Coffee concierge and cancellation specialist, inspect real routing evidence, and test voice while distinguishing verified controls from unverified spoken behavior.

You are building a customer-service prototype for **Zava Coffee**. Customers want to enroll, change billing, move deliveries or cancel. Build a **Customer Assist Agent** on the Customer conversation harness, then compare what the primary agent does before and after a cancellation specialist exists. **Demo Mode** simulates results; no real subscription changes.

## Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| 200 | Maker | 30 minutes | An unpublished primary agent, cancellation specialist, two skills and an honest test record. |

Plan 30 minutes for Build (10) → Route (12) → Speak (8). Extend is optional and takes 15 additional minutes. These are working budgets, not measured run times or response-time guarantees. Wait for provisioning and responses; read a reveal while waiting rather than submitting duplicate requests.

**Evidence boundary:** the primary-agent build and chat test passed on 6 November 2026. The original four-message cancellation sequence stalled after the reason; a fresh combined-request diagnostic retry completed. Delivery stayed with the primary. Voice connection, Listening and end-call controls were verified, but no spoken input was supplied: recognition, spell-back and spoken cancellation remain unverified. Optional specialists were not tested. Treat those checks as exercises to perform, not reported successes.

![Zava Coffee Subscription Assistant with an intent skill connected to Subscription Cancellation with a cancellation skill.](images/canvas-one-subagent.webp)

*Your finish line: an unpublished Zava Coffee assistant with one cancellation specialist and a skill on each agent. This light build-canvas capture shows the artifact, not a production deployment.*

## Table of Contents

- [Prerequisites](#prerequisites)
- [Exercise inputs](#exercise-inputs)
- [Build: Give the primary agent a clear job](#build-give-the-primary-agent-a-clear-job)
- [Route: Give cancellation to a specialist](#route-give-cancellation-to-a-specialist)
- [Speak: Test voice without overstating the result](#speak-test-voice-without-overstating-the-result)
- [Extend: Add three optional specialists (optional)](#extend-add-three-optional-specialists-optional)
- [Take it with you](#take-it-with-you)
- [Product guidance](#product-guidance)

## Prerequisites

> **Taking part in a proctor-led event with a pre-provisioned user account? Skip this section.** Your lab account, environment, licences, connections and sample data are already set up. Continue with the exercise inputs and sign in with your lab account when prompted. If anything is missing, ask your facilitator.

**Running this lab in your own tenant?** Prepare these separately before the timed exercise:

- Access to [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/) in an environment offering **Customer conversation agent**.
- Permission to create agents in that environment.
- Copilot Studio access and billing capacity for the preview. Building, testing and evaluating agents can consume Copilot Credits; see [usage and billing](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/overview-customer-conversation).

No live subscription backend, production phone number or contact-center deployment is required.

## Exercise inputs

- Use your assigned **training account** in a separate browser profile or private window, not a personal or production account. Select the facilitator-provided environment in [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/).
- Keep this lab beside the browser. The fictional subscription ID **SUB-1042** and all configuration text are supplied below. Use only fictional contact and payment details; there are no exercise downloads.
- For the voice exercise, have a microphone and speakers or headset, and allow microphone access in the browser. Without audio, use Web Chat or watch the facilitator, and record spoken checks as unverified.

## Build: Give the primary agent a clear job

**10 minutes · Copilot Studio preview**

Create a concierge, separate channel guidance, and observe a cancellation request before a specialist exists.

**Outcome:** A saved primary agent with General and Voice instructions, an identify-caller-intent skill, and a baseline chat trace.

### 1. Choose the customer-conversation creation option

Open [Copilot Studio preview](https://copilotstudio.preview.microsoft.com/), sign in with your lab account and select the assigned environment. Review and dismiss any first-run notice or tour. Select **Agents** → **More create options** (the arrow beside **New agent**) → **Customer conversation agent**.

Customer Assist Agents are in preview. The tested accessible name is **Customer conversation agent, uses Copilot Credits**. If it is missing, ask your facilitator; do not substitute the separate Standard or Microsoft Copilot agent options. Ask about unexpected consent or access requests.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/new-agent-menu-dark.webp"><img src="images/new-agent-menu.webp" alt="More create options offers Customer conversation agent separately from Microsoft Copilot agent and Agent Standard."></picture>

*Choose Customer conversation agent. The Standard and Microsoft Copilot options are different harnesses.*

### 2. Create a distinctively named agent

Leave the description box empty. Under **Start from scratch**, select **Create agent**. In the naming dialog, enter the name below plus your short initials, for example `Zava Coffee Subscription Assistant RS`. Select **Create** and wait until provisioning finishes and fields become editable.

**Agent name**

```text
Zava Coffee Subscription Assistant
```

### 3. Open the primary agent

On **Build**, open the primary agent card. Leave **Human handoff** → **Handoff method** → **Needs setup** unchanged; human handoff is outside this lab.

### 4. Describe the concierge role

Select **Description**, paste the text below and select **Save** for that field.

**Primary agent · Description**

```text
Acts as a concierge for Zava customers, helping them enroll in new coffee subscriptions, manage account and billing details, adjust delivery preferences, or cancel subscriptions by routing each request to the right specialist.
```

### 5. Set the cross-channel instructions

Select **Expand instructions**. On **General**, paste the instructions below. They name four specialists, but you will initially create only cancellation. Do not add a backend or knowledge source.

**Primary agent · General instructions**

```text
## Purpose
You are the main voice assistant for Zava Coffee subscriptions. Your role is to greet callers, understand their needs, collect essential details, and route them seamlessly to the right specialist sub-agent for subscription enrollment, account management, delivery adjustments, or cancellations.

## General Guidelines
- Be friendly, concise, and conversational.
- Confirm understanding by paraphrasing the caller's request.
- Collect shared prerequisites early (like `customerId`, `subscriptionId`, or `email`).
- Route silently to the appropriate sub-agent once you have the needed details.
- Never announce internal routing or department names.

## Routing Rules
- **New Subscription Enrollment** → Route to **Subscription Enrollment & Setup** once you confirm the caller wants to start a new subscription and collect their `email`, preferred coffee type, and delivery frequency.
- **Account or Billing Management** → Route to **Account & Billing Management** after confirming the caller's `customerId` and verifying which billing or payment detail they want to update.
- **Delivery Changes (dates, quantities, frequency)** → Route to **Delivery Scheduling & Adjustments** once you have the `subscriptionId` and the desired change details.
- **Pause or Skip Deliveries** → Also handled by **Delivery Scheduling & Adjustments**; confirm the `subscriptionId` and the pause duration.
- **Cancel Subscription** → Route to **Subscription Cancellation** after confirming the `subscriptionId` and reason for cancellation.

Shared prerequisites: `customerId`, `subscriptionId`, and `email` are required by multiple sub-agents. Collect and confirm these early, then pass them along silently to the sub-agent that needs them.

If a caller's request doesn't match any known intent, ask one clarifying question to determine whether it relates to subscription setup, account management, delivery, or cancellation before routing.
```

### 6. Add voice-only guidance

Select **Voice**, paste the guidance below, leave **Chat** unchanged, then select **Save**. Voice adds guidance on top of General; it does not replace it.

**Primary agent · Voice instructions**

```text
## Voice interaction guidelines
- Speak in short, natural turns.
- Confirm understanding by paraphrasing.
- Spell back critical data (names, phone numbers, confirmation codes) digit-by-digit.
- Ask one question at a time.
- Avoid reading long lists, URLs, or markdown aloud.
- Gracefully handle speech-recognition errors, silence, barge-in, and requests to repeat.
```

The tested preview label is **Voice**; Microsoft Learn calls this tab **Speech**. Follow the label available in your preview. Saving these instructions is not proof of spoken behavior.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/voice-instructions-dark.webp"><img src="images/voice-instructions.webp" alt="Voice tab with short-turn, spell-back and one-question-at-a-time instructions and a Save control."></picture>

*Voice is extra guidance for calls. General remains active across channels.*

### 7. Add the intent procedure

Next to **Skills**, select **+**. In **Add skill**, select **Generative**. Set **Name** to `identify-caller-intent` and **Description** to `Determines what the caller wants to do with their coffee subscription before routing.` Paste the text below into **Instructions**, then select **Add skill**.

**identify-caller-intent · Instructions**

```text
### Purpose
Identify whether the caller wants to enroll, manage billing, change delivery, pause, or cancel.
### Steps
1. Greet the caller and ask what they'd like help with.
2. Listen for keywords like 'new subscription', 'billing', 'delivery', 'pause', or 'cancel'.
3. Confirm understanding by paraphrasing.
4. Collect shared prerequisites (`customerId`, `subscriptionId`, `email`).
5. Route silently to the correct sub-agent.
```

### 8. Start with an open request

Save your changes. Select **Preview** → **Web Chat**; the tested preview initially selected **Voice Call**. Send the message below and wait for a reply. Look for a greeting and a question that narrows the request.

**Web Chat · Baseline greeting**

```text
Hi, I need help with my coffee subscription
```

### 9. Observe the primary without a specialist

Send the cancellation request, then open **Activity map**. Look for the primary asking for your subscription ID and reason, with no sub-agent invocation. Record what you actually observe; the baseline is for comparison with the next mission.

**Web Chat · Before the specialist**

```text
I want to cancel my subscription
```

<picture><source media="(prefers-color-scheme: dark)" srcset="images/test-cancel-no-subagent-dark.webp"><img src="images/test-cancel-no-subagent.webp" alt="The primary agent requests subscription ID and cancellation reason while Activity map shows model response generation, not a sub-agent."></picture>

*Verified baseline: the primary handles the request itself. A named routing rule cannot invoke a specialist that does not exist.*

### Reveal: Why did the primary keep the request?

**Instructions describe an intended route; the specialist must also exist.**

The baseline asked for an ID and reason without invoking a sub-agent. **General** establishes the concierge role, **Voice** adds channel-specific guidance, and the **Generative skill** supplies a reusable procedure. They do not create the four specialists mentioned in the instructions.

Customer request → Intent procedure → Primary response while no specialist exists

### Quick check

Does naming Subscription Cancellation in General instructions create that specialist?

- Yes; the routing rules automatically create it.

- No; add the sub-agent and save its description and instructions.

<details>
<summary>Check your answer</summary>

- **Not quite: Yes; the routing rules automatically create it.** No. The baseline trace has no specialist invocation because you have not created a sub-agent.
- **Correct: No; add the sub-agent and save its description and instructions.** Correct. Routing needs an available specialist with an appropriate description; the next mission adds it.

</details>

### If you get stuck

- **The creation option is missing or fields are disabled.** Confirm the preview URL and assigned environment. Wait for provisioning if fields are disabled. Ask the facilitator about missing access; do not change harnesses.

- **Preview does not reflect an edit.** Save each edited field, select **Start new test session** at the top right and repeat the same scenario. Preview uses saved changes.

## Route: Give cancellation to a specialist

**12 minutes · Copilot Studio preview**

Add one specialist, test the original conversation, and distinguish a successful diagnostic retry from an end-to-end pass.

**Outcome:** A cancellation specialist with its own skill, plus an Activity map comparison of cancellation and delivery requests.

### 1. Create and name the specialist

On **Build**, select **Add a sub-agent**. Wait for **New Sub-Agent** to finish provisioning. Select its title, enter the exact name below and select the checkmark labeled **Save name**. Keep this spelling: the primary routing rules refer to it.

**Sub-agent name**

```text
Subscription Cancellation
```

### 2. Describe when to route here

Select **Description**, paste the text and select **Save** for that field. The primary uses this description when choosing a specialist. References to policy knowledge in the supplied text do not add a knowledge source; this lab stays in Demo Mode.

**Subscription Cancellation · Description**

```text
Handles cancellation requests; includes the `Cancel Subscription Flow` skill and uses coffee subscription policy knowledge.
```

### 3. Give the specialist a bounded procedure

Open **Instructions**, paste the text and select **Save** for that field. Keep **Demo Mode**: it asks for confirmation and simulates a result without connecting a backend.

**Subscription Cancellation · Instructions**

```text
### Purpose
Assist callers in canceling their coffee subscription.
### General Guidelines
- Handle only cancellation requests.
- Required inputs: `subscriptionId` and reason for cancellation.
- Confirm cancellation before finalizing.
- If the caller asks about billing or delivery, route back to the root agent silently.
### Steps
1. Confirm the caller's `subscriptionId`.
2. Ask for the reason for cancellation.
3. Confirm understanding and process cancellation.
4. Provide confirmation code and final delivery details.
### Error Handling
If the subscription cannot be canceled immediately, explain the next available cancellation date and confirm acceptance.
### Demo Mode
This is a demo with no backend system. Finish the whole cancellation yourself before you return to the main conversation:
- Once you have the `subscriptionId` and the reason, ask the caller to confirm with yes or no, and wait for the answer.
- When the caller says yes, reply in the same turn with a simulated success: a confirmation code like ZC-12345 and that the final delivery ships within 3 business days.
- Return to the main conversation only after you have given the confirmation code, or when the caller asks about something other than cancellation.
```

### 4. Add the cancellation skill

In the specialist panel, select **+** beside **Skills**. In **Add skill**, select **Generative**. Set **Name** to `cancel-subscription-flow` and **Description** to `Guides callers through canceling their coffee subscription.` Paste the text into **Instructions**, then select **Add skill**.

**cancel-subscription-flow · Instructions**

```text
### Purpose
Help callers cancel their subscription.
### Steps
1. Ask for the `subscriptionId`.
2. Confirm the reason for cancellation.
3. Verify and process the cancellation.
4. Provide confirmation code and any final delivery information.
```

### 5. Check the saved build

Confirm each edited field is saved, then close the panel. Find the primary connected to **Subscription Cancellation**, with one sub-agent and the two skills on their respective cards.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/canvas-one-subagent-dark.webp"><img src="images/canvas-one-subagent.webp" alt="Zava Coffee Subscription Assistant with an intent skill connected to Subscription Cancellation with a cancellation skill."></picture>

*The saved build: one primary agent and one specialist. These cards are configuration, not evidence that every conversation succeeds.*

### 6. Begin the original four-message test

Select **Preview** → **Web Chat**, then **Start new test session** at the top right. Send this first message. Wait for each reply before the next message; do not paste all four together.

**Web Chat · Original sequence 1 of 4**

```text
I want to cancel my subscription
```

The original live sequence stalled after the third message, the reason. Keep this test distinct from the diagnostic retry below. A successful retry does not prove that the original sequence works end to end.

### 7. Supply the subscription ID

When asked for the subscription, send the fictional identifier below and wait for the next reply.

**Web Chat · Original sequence 2 of 4**

```text
SUB-1042
```

### 8. Supply the reason

When asked for the reason, send the text below. Wait for the confirmation question. If the conversation remains silent for about two minutes, use the bounded diagnostic step below instead of continuing blindly.

**Web Chat · Original sequence 3 of 4**

```text
I am moving abroad
```

### 9. Confirm only when asked

When the agent asks you to confirm cancellation, send the response below. Look for a simulated confirmation code and final delivery details. If the previous turn stalled, record the original sequence as incomplete; this confirmation is still the next intended turn, not an observed pass.

**Web Chat · Original sequence 4 of 4**

```text
Yes, please cancel it
```

**Expected response example — comparison only, not text to send:** a simulated code such as **ZC-10421** and final delivery within **3 business days**. Codes and wording vary. No real subscription is changed.

### 10. Use one diagnostic retry if the original stalls

Inspect both the chat and **Activity map**, not just the main **Execution summary**. Select **Start new test session** and retry once with `I want to cancel my subscription. My subscription ID is SUB-1042, and I am moving abroad.` When asked, send `Yes, please cancel it`. If this also stalls, stop and ask your facilitator.

**Observed retry result — comparison only:** the fresh combined request routed to the specialist; confirmation returned **ZC-12345** and final delivery within **3 business days**. Record this as a diagnostic retry, separately from the stalled original conversation. The two-minute boundary is a troubleshooting limit, not a latency guarantee.

### 11. Read the complete trace

In **Activity map**, inspect the invocation of **Subscription Cancellation**, its inputs and its return. Look for **Interpreting agent intent**, **Preparing agent inputs**, **Executing agent**, **Reviewing nested activity**, and **Return To Main Conversation Tool**. Compare the actual reply with the final return status.

The verified diagnostic trace included an intermediate **Cancelled** tool action followed by a **Completed** return. Neither the intermediate status alone nor the top-level summary alone tells you whether the customer received a result.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/test-cancel-routed-dark.webp"><img src="images/test-cancel-routed.webp" alt="Combined cancellation request and confirmation produce simulated ZC-12345 while nested activity shows a Cancelled action followed by a Completed return."></picture>

*Diagnostic retry only, not the original four-message sequence. The chat confirms a simulated result; the trace includes both intermediate Cancelled and final Completed statuses.*

### 12. Compare with a delivery request

Select **Start new test session** and send the delivery question below. Inspect **Activity map** again. The verified run stayed with the primary, asked for a subscription ID and showed no specialist invocation because no delivery specialist existed.

**Web Chat · Delivery without a specialist**

```text
Can I change my delivery date to next Friday?
```

### Reveal: What counts as evidence of routing?

**Read the customer reply and the specialist lifecycle together.**

The saved **Description** helps the primary choose a specialist; **Activity map** shows the invocation and return. A simulated confirmation is not a backend write. A completed combined-request retry is also not a pass for the original four-message sequence. Keep those claims separate.

Intent and required inputs → Specialist invocation → Confirmation and simulated result → Return to primary

### Quick check

The original sequence stalls, but the fresh combined-request retry returns a code. What can you conclude?

- The original four-message sequence passed and a real subscription was canceled.

- The diagnostic retry completed a simulated cancellation; the original sequence still needs investigation.

<details>
<summary>Check your answer</summary>

- **Not quite: The original four-message sequence passed and a real subscription was canceled.** Neither conclusion is supported. The original remained incomplete, and Demo Mode has no subscription backend.
- **Correct: The diagnostic retry completed a simulated cancellation; the original sequence still needs investigation.** Correct. Preserve the distinction and inspect chat plus the final return, including any intermediate statuses.

</details>

### If you get stuck

- **The cancellation does not route.** Check the exact specialist name and saved **Description**. Save all edits and use a fresh test session. If the single diagnostic retry also stalls, stop and ask the facilitator.

- **The test pane reports TelephonyBadRequest or another error.** Record the error, select **Start new test session** and retry once. If it persists, ask your facilitator; do not infer a root cause from the error alone.

## Speak: Test voice without overstating the result

**8 minutes · Copilot Studio preview**

Use the same agent in Voice Call and separate connection controls from actual speech checks.

**Outcome:** A voice-test record that distinguishes connection, recognition, spell-back and cancellation, followed by an ended call.

### 1. Prepare audio and select Voice Call

Connect a microphone and speakers or a headset. In **Preview**, select **Voice Call**. Use a browser with microphone access permitted for the preview site. If audio is unavailable, use **Web Chat** or watch the facilitator; mark your own spoken checks unverified.

Only connection, **Listening...**, and end-call controls were verified in the source run. No spoken input was supplied. The remaining steps teach what to test; they are not reported successes.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/voice-call-panel-dark.webp"><img src="images/voice-call-panel.webp" alt="Voice Call selected with the call control and an empty Live Transcript displaying Not connected."></picture>

*The captured panel is not connected. Connection and end-call controls were exercised separately; this image is not evidence of speech recognition or a completed cancellation.*

### 2. Connect and check the transcript

Select **Start voice conversation** and allow microphone access if asked. Confirm **Listening...** and **Voice call connected** in **Live Transcript**, then wait for the greeting. A connected call alone does not demonstrate recognition.

### 3. Speak the cancellation request

Say **“I want to cancel my subscription.”** Watch whether **Live Transcript** records what you said. Record recognition as unverified if you do not supply spoken input.

### 4. Provide details and confirm

When asked, say your subscription ID, for example **“S U B one zero four two”**, then a reason such as **“I’m moving abroad”**. Confirm when asked. Use only fictional identifiers and note any recognition errors.

### 5. Check the spoken behavior, not just the connection

Listen and inspect **Live Transcript** and **Activity map**. Check pauses, silent internal routing, clear identifiers and confirmation codes, one question at a time, and no markdown read aloud. Check for a simulated confirmation code. Record each mismatch rather than assuming saved Voice instructions guarantee the behavior.

Recognition, spell-back, turn-taking, speech quality and spoken cancellation were not verified in the source run. Do not mark them passed merely because chat worked or the call connected.

### 6. End the call and leave a draft

Select **End conversation** and verify that **Start voice conversation** returns. Leave the agent unpublished. Do not configure production channels, triggers, schedules or a backend for this lab.

### Reveal: Why is voice a separate test?

**The build is shared; the channel still needs its own evidence.**

**Voice** layers speaking guidance over **General**. Preview lets you exercise that channel without deploying a production phone number. But a connected session proves only connection, not recognition or successful spoken cancellation.

General instructions → Voice guidance → Spoken test and transcript → End conversation

### Quick check

The call connects and shows Listening, but you say nothing. Which result is supported?

- The voice cancellation and spell-back checks passed.

- Connection worked; recognition and spoken cancellation remain unverified.

<details>
<summary>Check your answer</summary>

- **Not quite: The voice cancellation and spell-back checks passed.** No spoken scenario ran, so neither behavior was tested.
- **Correct: Connection worked; recognition and spoken cancellation remain unverified.** Correct. Record connection separately, and end the call even when the spoken checks cannot be completed.

</details>

### If you get stuck

- **There is no sound or microphone input.** Check browser microphone permission and the selected audio device, then try the call again. If audio remains unavailable, use Web Chat or watch the facilitator, record voice checks as unverified and end any connected call.

## Extend: Add three optional specialists (optional)

**Optional · 15 minutes · Copilot Studio preview**

Extend the concierge to enrollment, billing and delivery using the same specialist pattern.

**Outcome:** Three additional draft specialists and a recorded routing test for each, if time permits.

### 1. Reuse the specialist pattern

Repeat **Build** → **Add a sub-agent** for each specialist below. Wait for provisioning, rename **New Sub-Agent** with the exact supplied name and select **Save name**. Save **Description** and **Instructions** separately, then use **+** beside **Skills** → **Generative**. Use only fictional contact and payment details.

These optional specialists were not created or tested in the source run. Their expected routing is a target to verify, not a verified outcome. Keep Demo Mode; references to knowledge in the supplied descriptions do not connect knowledge or a backend.

### 2. Name the enrollment specialist

Create the first optional sub-agent, enter this exact name and select **Save name**.

**Enrollment · Name**

```text
Subscription Enrollment & Setup
```

### 3. Describe enrollment requests

Paste into the enrollment specialist’s **Description** and select **Save**.

**Enrollment · Description**

```text
Handles new coffee subscription sign-ups; includes the `Create New Subscription` skill and uses subscription setup knowledge.
```

### 4. Set the enrollment instructions

Paste into **Instructions** and select **Save**. The requested payment details must remain fictional; this is a simulated enrollment.

**Enrollment · Instructions**

```text
### Purpose
Assist callers in enrolling in a new Zava coffee subscription.
### General Guidelines
- Handle only new subscription requests.
- Required inputs: `email`, preferred coffee type, delivery frequency, and payment method.
- Confirm all details before finalizing enrollment.
- If the caller asks about billing or delivery changes, route back to the root agent silently.
### Steps
1. Confirm the caller wants to start a new subscription.
2. Gather required inputs.
3. Verify coffee preferences and delivery frequency.
4. Confirm payment method.
5. Summarize and confirm the subscription details.
6. Provide a confirmation code or next delivery date.
### Error Handling
If any required input is missing, ask for it clearly and confirm before proceeding.
### Demo Mode
This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
```

### 5. Add the enrollment skill

Select **+** beside **Skills** → **Generative**. Set **Name** to `create-new-subscription` and **Description** to `Guides callers through creating a new Zava coffee subscription.` Paste these **Instructions** and select **Add skill**.

**create-new-subscription · Instructions**

```text
### Purpose
Help callers create a new Zava coffee subscription.
### Steps
1. Ask for the caller's `email` and preferred coffee type.
2. Confirm delivery frequency and quantity.
3. Collect payment details.
4. Review and confirm all information.
5. Provide confirmation code and expected first delivery date.
```

### 6. Name the billing specialist

Create the second optional sub-agent, enter this exact name and select **Save name**.

**Billing · Name**

```text
Account & Billing Management
```

### 7. Describe account and billing requests

Paste into the billing specialist’s **Description** and select **Save**.

**Billing · Description**

```text
Manages customer account and billing details; includes the `Update Payment Method` skill and uses billing procedures knowledge.
```

### 8. Set the billing instructions

Paste into **Instructions** and select **Save**. Do not enter real payment details or treat the demo identity check as production authentication.

**Billing · Instructions**

```text
### Purpose
Assist callers with updating account or billing information.
### General Guidelines
- Handle only account and billing requests.
- Required inputs: `customerId`, `email`, and payment details.
- Confirm changes before saving.
- If the caller asks about delivery or cancellation, route back to the root agent silently.
### Steps
1. Confirm the caller's identity using `customerId`.
2. Ask what they want to update.
3. Collect and confirm the new payment or contact information.
4. Save and confirm the update.
### Error Handling
If payment details are incomplete, ask for the missing fields and confirm before proceeding.
### Demo Mode
This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
```

### 9. Add the payment-method skill

Select **+** beside **Skills** → **Generative**. Set **Name** to `update-payment-method` and **Description** to `Helps callers update the payment method on their coffee subscription.` Paste these **Instructions** and select **Add skill**.

**update-payment-method · Instructions**

```text
### Purpose
Assist callers in updating their payment method.
### Steps
1. Ask for the `customerId` and current payment method.
2. Collect the new payment details.
3. Confirm accuracy and save changes.
4. Notify the caller of the successful update.
```

### 10. Name the delivery specialist

Create the third optional sub-agent, enter this exact name and select **Save name**.

**Delivery · Name**

```text
Delivery Scheduling & Adjustments
```

### 11. Describe delivery requests

Paste into the delivery specialist’s **Description** and select **Save**.

**Delivery · Description**

```text
Handles delivery date, quantity, frequency changes, and pauses; includes the `Modify Delivery Schedule` skill and uses delivery schedule options knowledge.
```

### 12. Set the delivery instructions

Paste into **Instructions** and select **Save**. Keep the simulated success in Demo Mode.

**Delivery · Instructions**

```text
### Purpose
Assist callers in changing delivery dates, quantities, or frequency, and pausing or skipping deliveries.
### General Guidelines
- Handle only delivery-related requests.
- Required inputs: `subscriptionId` and the desired change details.
- Confirm all changes before saving.
- If the caller asks about billing or cancellation, route back to the root agent silently.
### Steps
1. Confirm the caller's `subscriptionId`.
2. Ask what change they want (date, quantity, frequency, pause).
3. Record and confirm the new schedule.
4. Summarize and confirm the next delivery date.
### Error Handling
If the requested date or quantity is unavailable, offer the nearest available option.
### Demo Mode
This is a demo with no backend system. After the caller confirms, simulate success: give a confirmation code like ZC-12345.
```

### 13. Add the delivery skill

Select **+** beside **Skills** → **Generative**. Set **Name** to `modify-delivery-schedule` and **Description** to `Helps callers change, pause, or skip deliveries on their coffee subscription.` Paste these **Instructions** and select **Add skill**.

**modify-delivery-schedule · Instructions**

```text
### Purpose
Help callers adjust their delivery schedule.
### Steps
1. Ask for the `subscriptionId`.
2. Ask what change they want (date, quantity, frequency, pause).
3. Confirm the new schedule.
4. Save and confirm the update.
```

### 14. Test each optional route independently

Save all fields and close the panel. Check for four specialists including cancellation. In **Preview** → **Web Chat**, select **Start new test session** before each test below. Supply fictional follow-up details when asked and inspect **Activity map**. Record the actual result separately for each.

| Send | Expected specialist to verify |
| --- | --- |
| `Can I change my delivery date to next Friday? My subscription ID is SUB1042.` | Delivery Scheduling & Adjustments |
| `I want to start a new coffee subscription. My email is alex@contoso.com, medium roast, every two weeks.` | Subscription Enrollment & Setup |
| `I need to update my credit card. My customer ID is C-7781.` | Account & Billing Management |

Compare delivery with the core baseline: it should now be eligible for a specialist instead of remaining with the primary. These optional test inputs are supplied for practice; none was revalidated in the source run.

Any confirmation is still a simulated output for comparison, not proof of enrollment, payment or delivery changes in a real system.

### Reveal: What changed when the specialists became available?

**The concierge can delegate more jobs without becoming every procedure.**

Each new specialist has a narrow description, its own instructions and a reusable skill. Compare traces before and after adding delivery; then test that unrelated requests return to the primary. Availability makes a route possible, but you still need evidence that the route was taken.

Request type → Matching specialist description → Specialist procedure → Simulated result and return

### Quick check

What should demonstrate that delivery now uses its specialist?

- The primary instructions mention the specialist’s name.

- A fresh delivery conversation and Activity map showing the specialist invocation and return.

<details>
<summary>Check your answer</summary>

- **Not quite: The primary instructions mention the specialist’s name.** That name was present before the specialist existed. Instructions alone do not prove execution.
- **Correct: A fresh delivery conversation and Activity map showing the specialist invocation and return.** Correct. Verify the actual trace and result, and label the optional test unverified if you do not run it.

</details>

### If you get stuck

- **An optional request remains with the primary.** Verify the exact specialist name, save its **Description** and other edited fields, then start a fresh test session. Record unresolved behavior rather than claiming the optional route passed.

## Take it with you

Keep an unpublished Zava Coffee assistant with its cancellation specialist, and a record of what you actually tested. A useful prototype includes both working paths and honest coverage gaps.

- **Separate responsibility:** The primary identifies intent; a specialist owns a bounded job and its skill.

- **Inspect the route:** Use saved descriptions, the actual conversation, and the specialist invocation and return to explain behavior.

- **Distinguish evidence:** Original sequence, diagnostic retry, voice connection and spoken behavior are separate test results.

- **Keep the safety boundary:** Demo Mode is simulation. A code is not proof of a backend change, and no real payment details belong here.

**Reflect:** Which customer task in your work deserves a specialist, and what evidence would you require before replacing its simulated result with a real action?

**Cleanup:** End any voice conversation and verify **Start voice conversation** returns. Leave your agent unpublished. The verified source run left **Zava Coffee Subscription Assistant CC** with **Subscription Cancellation**, two skills and **Human handoff** still **Needs setup**; it added no triggers, publication or backend. Your own draft uses your initials. Follow the facilitator’s retention guidance rather than deleting another attendee’s agent. Credits were not measured; do not assume testing was free.

## Product guidance

- [Create an agent with the Customer Conversation harness](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/build-new-agent-customer-conversation)

- [Configure details and channel-specific instructions](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/authoring-instructions-customer-conversation)

- [Create a Generative or Topic skill](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/skills-create-customer-conversation)

- [Add a sub-agent](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/sub-agents-add-customer-conversation)

- [Preview and test chat, voice and routing](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/preview-test-customer-conversation)

- [Customer Conversation harness overview, preview and billing](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/overview-customer-conversation)

Product UI and available capabilities can vary by tenant. These reviewed light/dark captures show the source training experience; generated replies can differ. Microsoft Learn uses Speech where the tested preview uses Voice. The original classic lab remains available separately.
