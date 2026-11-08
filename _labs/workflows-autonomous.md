---
lab_format: missions
module: workflows-latest
title: "Workflows"
order: 342
duration: 30
difficulty: 300
lab_type: local
section: advanced_labs
journeys: ["autonomous-ai", "developer"]
description: "Safely copy an Order Management workflow, test email classification, approve a grounded reply, and verify both outcomes and cleanup."
classes: wide
author_profile: false
toc: false
mission_lab:
  headline: "One incoming email."
  headline_emphasis: "A verified, human-approved action."
  promise: "Leave with your own disabled Order Management copy, evidence of an archived test email, and a grounded reply that you reviewed before delivery."
  hero_image:
    src: /labs/workflows-autonomous/images/inquiry-path-succeeded.webp
    alt: "Successful Copilot, Human review, If, and Reply to email steps; Flag email and Archive email are skipped."
    width: 875
    height: 160
    caption: "A real approved Customer Inquiry run. The diagram proves the route executed; separately check the delivered email."
  scenario: |-
    Your order desk receives unrelated promotions, customer questions, supplier delays, and quote requests. A workflow classifies the message; a grounded draft and human decision protect the customer-facing reply.

    This is the **Microsoft Copilot harness** workflow experience. **Standard harness** remains a separate experience; it has not been renamed. Only the former GitHub Copilot harness name changed. Keep supplied working instructions unchanged.
  self_setup: |-
    Use a development/training environment with Copilot Studio **Workflows**, available Copilot Credits, Outlook, and Microsoft Copilot access. Arrange the Order Management starter and connections before starting the timer. In Mission 1, use the linked solution only if it is not already provisioned. Optional extensions need their additional assets; none is a prerequisite for the core.
  validation: |-
    **Verified boundary:** the 6 November 2026 training run tested the original quote sample in **Run node**, archived the exact Other sample, and completed the exact Customer Inquiry sample through **Yes → Submit** to a received holding reply. The original starter was untouched and the copy was disabled after reload. The rejection branch, inventory MCP, and specialist quote delivery were not exercised.
  prerequisites:
    - "Sign in to [Copilot Studio](https://copilotstudio.microsoft.com/) with your provided training account and select its assigned environment. Ask the proctor if an asset is missing; do not import replacements or edit another attendee's workflow."
    - "Open [Outlook](https://outlook.office.com/) with the same account. Keep Studio and this lab side by side."
    - "Use synthetic self-addressed messages only. Check ownership, sender restriction, reviewer, To, CC, and BCC before publishing; publication can start a trigger and consume Copilot Credits."
  pacing: "30-minute core: Isolate (6) → Route (6) → Review (13) → Stop (5). Optional extensions follow: Time-block (15), Inventory (15), Specialist (10). These are working budgets, not timing guarantees; trigger pickup, generation, and approvals vary. Inspect the existing run rather than sending duplicates."
  missions:
    - id: isolate
      verb: Isolate
      title: "Copy the workflow and constrain its reach"
      minutes: 6
      tool: Copilot Studio · Workflows
      brief: "Work in your own copy with healthy connections and a self-only sender filter."
      outcome: "An owned draft ready for a node-only classification test; the starter is unchanged."
      steps:
        - title: "Open the assigned starter"
          instruction: |
            Select **Workflows → Order Management Workflow → Build** in your assigned environment. Review and dismiss any first-visit notice or environment tour.

            With a provided event account, ask the proctor if the starter is missing. For self-paced setup only, import [LAB: Order Management Workflows](../mcs-workflows/assets/solutions/LABOrderManagementWorkflows_1_0_0_8.zip) and sign in to the requested connections before continuing. This includes the starter and Price Quote Agent, not the optional SharePoint pricing data.
        - title: "Create a copy from the designer header"
          instruction: |
            Select the designer header's **More options → Create a copy**. Keep the default **Title**, **Order Management Workflow - Copy**, and select **Create**; if a confirmation offers **Open workflow**, select it. The copy opens in a **new browser tab**. Continue only in that copy.

            Do not use the list row's **More actions** menu, which may offer only **Delete**. Leave the original unchanged.
        - title: "Resolve connections without replacing healthy ones"
          instruction: |
            Open **When a new email arrives**, **Copilot**, and **Human review** and wait for each lab-account connection to resolve. Reuse healthy connections.

            Only if Human review lacks a connection, select **Create new connection**, give it a recognizable display name such as **Human review**, leave **Authentication Type: Default**, and select **Create**. This connection is marked **Premium**. Complete any sign-in with your training account, not another identity.
        - title: "Restrict the trigger to your own messages"
          instruction: |
            In **When a new email arrives**, retain the **Subject filter** token displayed as **string**. Hover to inspect `string('Order Management')`; do not replace it or assume an expression-mode switch.

            Select **Add advanced parameter → From**, enter your signed-in training email in the people picker, and resolve the matching entry. Every test must come from you and contain **Order Management** in its subject. Do not publish yet.
      reveal:
        title: "Isolation comes before automation"
        line: "A copy protects the starter; sender and recipient checks protect people."
        explanation: "The subject filter selects the scenario, not the sender. Restricting From narrows the trigger to your synthetic tests. Connections determine whose mailbox and data the nodes can access."
        flow: ["Owned copy", "Healthy own-account connections", "Subject and sender restriction"]
      check:
        question: "Which setup is safe before any end-to-end test?"
        options:
          - text: "An owned copy, retained subject token, resolved own-account From restriction, and checked recipients."
            correct: true
            feedback: "Correct. Isolation and all dispatch/reviewer checks must precede publication."
          - text: "The original starter with only the Order Management subject filter."
            correct: false
            feedback: "A subject alone does not isolate senders, and the shared starter must remain unchanged."
    - id: route
      verb: Route
      title: "Separate a node test from a real mailbox action"
      minutes: 6
      tool: Classify · Outlook · Activity
      brief: "Classify a quote without dispatching it, then prove the Other branch archives one test."
      outcome: "Quote Request node output plus a separate successful Other run and actual archived message."
      steps:
        - title: "Inspect categories and run the quote sample"
          instruction: |
            Select **Classify**. Keep the current/default available model; replace a model only if missing or flagged as retired. Inspect the three configured categories: **Quote Request**, **Supplier Delay**, and **Customer Inquiry**. **Other** is the automatically created Default category, not a fourth configured category.

            Select **Run node**. Under **When a new email arrives**, paste the sample into **Body**, then select **Run**. Expect **Quote Request**. This does not execute the downstream agent or send a quote.
          prompt_label: Classify · Run node · Body
          prompt: |-
            Hi, I would like to request a quote for 500 units of Product A.
          screenshot:
            src: /labs/workflows-autonomous/images/classify-quote-result.webp
            src_dark: /labs/workflows-autonomous/images/classify-quote-result-dark.webp
            title: "Node-only quote classification"
            alt: "Classify Run node panel with the original Body sample and Quote Request output."
            width: 1405
            height: 505
            caption: "Genuine light/dark captures of the node test. No quote specialist or downstream delivery ran."
        - title: "Check recipients before publication"
          instruction: |
            Inspect **Human review**: reviewer is incoming **From**, delivery is **Outlook**, and the proposed reply is visible. Inspect **Reply to email**: **Message Id** is from the trigger, **To** is incoming **From**, and **CC/BCC** are empty. With the sender restriction, both reviewer and recipient must resolve only to you. Leave untested branches alone.

            Select **Save** (or **Ctrl+S**) then **Publish**. Publishing automatically enables the copy; confirm **Enabled** on **Workflows** before sending a test.
        - title: "Address the Other test to yourself"
          instruction: |
            Open Outlook. If **Your privacy matters** appears, read it and select **Continue**. Compose a message to your own training account and use **Check names** if necessary. Paste this subject; do not send until the next step supplies the body.
          prompt_label: Outlook · Other test · Subject
          prompt: |-
            Order Management - Congratulations! Your order desk has been selected
        - title: "Send the synthetic Other sample"
          instruction: "Paste this body, recheck the resolved self-recipient, and **Send**. This is a deliberately irrelevant synthetic spam sample; do not follow its requests or send it to anyone else."
          prompt_label: Outlook · Other test · Body
          prompt: |-
            Dear Order Manager,

            Congratulations! Your order management team has been selected in our monthly
            business draw and is entitled to claim an exclusive cash reward.

            To release your reward, please reply with your full name and contact details,
            and a small processing fee may apply.

            Act soon, as unclaimed rewards expire.

            Regards,
            Promotions Team
            MegaDraw Rewards
        - title: "Verify both Activity and Archive"
          instruction: |
            Open **Activity**, refresh, and inspect the new run. Expect **Other → Archive email** and **Succeeded**. Separately find the exact message in Outlook's **Archive**.

            Trigger pickup and processing vary. If no run appears, check publication, Enabled, the sender restriction, and subject spelling. Inspect for an existing run before resending. If stopping here, disable your copy and reload; otherwise continue to Review.
          screenshot:
            src: /labs/workflows-autonomous/images/other-path-succeeded.webp
            src_dark: /labs/workflows-autonomous/images/other-path-succeeded-dark.webp
            title: "Other branch executed"
            alt: "Executed Other branch leading to a successful Archive email action."
            width: 420
            height: 90
            caption: "Real run evidence, not a mailbox screenshot. The original run also had a separately verified archived email."
      reveal:
        title: "Classification is not delivery"
        line: "A node test proves routing output; an end-to-end test proves an action."
        explanation: "Quote Request was a node-only result. The separate Other email exercised the connector trigger and Archive action. A green run does not replace checking the destination mailbox."
        flow: ["Body sample → category", "Self-email → trigger", "Other → Archive → mailbox verification"]
      check:
        question: "Does the Quote Request result prove the Price Quote Agent sent mail?"
        options:
          - text: "No. Run node tested classification only; downstream delivery needs a separate verified test."
            correct: true
            feedback: "Correct. Keep node output, executed workflow paths, and received messages distinct."
          - text: "Yes. A successful category test executes every action in that branch."
            correct: false
            feedback: "Run node did not execute the specialist or send a quote."
    - id: review
      verb: Review
      title: "Approve a grounded reply, then verify delivery"
      minutes: 13
      tool: Copilot · Human review · Outlook
      brief: "Inspect the draft-and-approval path and send the exact Customer Inquiry sample to yourself."
      outcome: "A reviewed answer or holding reply, a successful approved run, and its received email."
      steps:
        - title: "Inspect the grounded drafting step"
          instruction: |
            In your copy, open **Classify → Customer Inquiry → Copilot**. Confirm **Customer question** uses the incoming email **Body**. Read the supplied prompt in place: it searches the connection owner's earlier email threads, drafts an answer when evidence exists, and otherwise drafts a holding reply without invented facts, addressed **Dear Customer,** and signed **Contoso Electronics Order Management**.

            The complete preconfigured prompt is not reproduced here because its exact text was not supplied in the run evidence. Do not replace it with this summary. The Copilot node provides read-only Microsoft 365 retrieval/drafting; the downstream reply node performs dispatch.
        - title: "Inspect the human decision and reply fields"
          instruction: |
            In **Human review**, confirm the message includes the Copilot draft, delivery is **Outlook**, reviewer is incoming **From**, and the single **Yes/No** input is **Approve**, question **Send proposed reply?**.

            In **If/Else**, confirm **Approve Equals Yes**. In **Reply to email**, confirm trigger **Message Id**, **To = From**, and empty **CC/BCC**. Yes replies; Else routes to **Flag email**. This exercise tests Yes only, not rejection.

            Save and publish any changes after checking the self-only restriction. If a previously disabled copy is now **Draft**, deliberately resume through **Build → Publish**; the list switch alone may not re-enable it.
        - title: "Prepare the inquiry subject"
          instruction: "Compose a new Outlook message addressed only to your resolved training account. Paste this subject; add the body in the next step before sending."
          prompt_label: Outlook · Customer Inquiry · Subject
          prompt: |-
            Order Management - Question about iPad Air warranty and MDM
        - title: "Send the customer question to yourself"
          instruction: "Paste this body and **Send** only after rechecking the recipient. The fictional signature is sample content, not permission to contact a real customer."
          prompt_label: Outlook · Customer Inquiry · Body
          prompt: |-
            Hi team,

            Quick question before we expand our last order. What is the standard warranty
            period on the iPad Air (M2), and can the devices be enrolled in our mobile device
            management (MDM)? I think we asked something similar a few months back but I can't
            find the reply.

            Thanks,
            Jordan Kim
            IT, Alpine Ski House
        - title: "Wait for the draft, then review it"
          instruction: |
            Open **Activity**, refresh, and select the new **Customer Inquiry** run. **Copilot** drafts first; **Human review** then waits for your response. Trigger pickup, drafting, and approval-email delivery are separate waits.

            In Outlook, open **Action Needed: Review Customer Enquiry Reply**. Read the proposed response before choosing. A holding reply is valid when the mailbox lacks warranty/MDM evidence; do not approve invented product facts. The verified training run produced a grounded holding reply, not a factual warranty promise.

            If the draft is safe, choose **Yes** under **Send proposed reply?**, then **Submit**. Confirm **Your response has been successfully submitted**. A **Trust sender** prompt may appear; the tested card worked without actioning it. If the draft is unsafe, do not approve for the sake of completion; stop and ask the proctor to inspect the run. The No branch is not a validated fallback in this exercise.
        - title: "Verify the reply and the completed route"
          instruction: |
            Allow the workflow to resume. Verify the received reply in Outlook; the tested reply used subject **Your inquiry - Contoso Electronics** and opened **Dear Customer,**. Assess grounding and actual delivery, not exact generated wording or elapsed time.

            In **Activity**, confirm **Succeeded** and **Copilot → Human review → If → Reply to email** executed. **Flag email** and **Archive email** are skipped on this approved route; that is expected.

            If the approval is missing, inspect whether Copilot is still drafting or Human review is waiting, then check reviewer and Connection. Repair only an unresolved/incorrect connection and republish. Check the original run before sending another message to avoid duplicate approvals.
          screenshot:
            src: /labs/workflows-autonomous/images/inquiry-path-succeeded.webp
            src_dark: /labs/workflows-autonomous/images/inquiry-path-succeeded-dark.webp
            title: "Approved inquiry route"
            alt: "Successful Copilot, Human review, If, and Reply to email steps; Flag email and Archive email are skipped."
            width: 875
            height: 160
            caption: "Real light/dark run captures. The parent run separately verified a received holding reply; no No/rejection run was performed."
      reveal:
        title: "Grounding and approval solve different problems"
        line: "Evidence constrains the draft; a person authorizes the send."
        explanation: "The Copilot node retrieves and drafts but does not send. Human review pauses the workflow, and the If branch allows the reply only after Yes is submitted. Sparse training data can correctly produce a holding response."
        flow: ["Question → grounded draft", "Human review → Yes + Submit", "Reply → received message + successful run"]
      check:
        question: "The mailbox has no evidence about the warranty. What is an acceptable draft?"
        options:
          - text: "A holding reply that acknowledges the question without inventing warranty or MDM facts."
            correct: true
            feedback: "Correct. Grounding matters more than a confident or specific answer."
          - text: "A specific warranty period invented to make the test look complete."
            correct: false
            feedback: "Never approve unsupported facts. The verified run used a holding reply."
    - id: stop
      verb: Stop
      title: "Prove the trigger is off before leaving"
      minutes: 5
      tool: Workflows · Activity
      brief: "Close the core with durable off-state and run-status checks."
      outcome: "Your copy is disabled after reload and has no unattended running or waiting test."
      steps:
        - title: "Disable your copy and reload"
          instruction: |
            On **Workflows**, turn off **Enabled** for your Order Management copy. Reload and verify the switch stays off. Do not change the original.

            The verified copy returned to **Draft** with an unchecked disabled switch and **This workflow hasn't been published and can't be enabled from this list.** Leave it disabled. To resume an optional test intentionally, recheck sender and recipients, then use **Build → Publish**, not a toggle-only assumption.
        - title: "Check outstanding runs and keep only intended artifacts"
          instruction: |
            Inspect **Activity** for **Running** or **Waiting** tests. Disabling the trigger prevents new starts; it does not prove existing runs stopped. Finish safe test approvals or cancel your unfinished runs; ask the proctor if one cannot be stopped.

            Remove only your synthetic emails, approval requests, replies, and drafts when no longer needed. Keep shared connections, agents, MCP servers, knowledge, and starters. Record **Credit usage (last 30 days)** if available, but label it a rolling total, not this run's measured cost.
      reveal:
        title: "Cleanup is an observable result"
        line: "An off switch after reload and settled runs are the finish line."
        explanation: "A saved definition or completed test does not stop future trigger pickup. Rechecking state after reload catches an automation left listening; inspecting Activity covers runs already started."
        flow: ["Disable own trigger", "Reload → still off", "Activity → no unattended tests"]
      check:
        question: "Does disabling the trigger prove a waiting approval run stopped?"
        options:
          - text: "No. Inspect Activity and finish or cancel your outstanding test runs."
            correct: true
            feedback: "Correct. Existing runs and future trigger starts are separate responsibilities."
          - text: "Yes. The off switch automatically proves all earlier runs are gone."
            correct: false
            feedback: "Verify the actual run states; do not infer them from the trigger switch."
    - id: time-block
      verb: Time-block
      title: "Time-block a new task with an inline agent"
      minutes: 15
      optional: true
      tool: Microsoft To Do · Inline Agent · Outlook Calendar
      brief: "Optional extension: create your own To Do Time Block workflow that watches your default Tasks list."
      outcome: "One verified personal calendar block and enriched task, with the workflow disabled afterwards."
      steps:
        - title: "Open To Do and create the workflow"
          instruction: |
            In [Microsoft To Do](https://to-do.office.com/), sign in with the same training account. The workflow watches your default **Tasks** list, so no new list is needed.

            In Copilot Studio, select **Workflows → New workflow**. It opens as **Untitled workflow** in **Draft**. Rename it **To Do Time Block**: select the name in the designer header (*Click to rename*), type it, and press **Enter**.
        - title: "Switch to a To Do trigger and add an inline agent"
          instruction: |
            Select the **Start** node and switch **Trigger type** from **Manual** to **Connector**. Select **Select trigger...**, search `to-do`, and under **Microsoft To-Do (Business)** select **When a new to-do in a specific folder is created**. In **Connection**, select **Create new connection → Create** and sign in with your training account. In **To-do list**, select **Tasks**; the **Needs setup** badge clears.

            Select **+ → Agent**, reuse the connected training identity, and retain **New agent for this workflow**.
          screenshot:
            title: the To Do trigger on your Tasks list
            src: /labs/workflows-autonomous/images/uc1-trigger-tasks-list.webp
            src_dark: /labs/workflows-autonomous/images/uc1-trigger-tasks-list-dark.webp
            alt: "Trigger When a new to-do in a specific folder is created under Microsoft To-Do (Business), with To-do list set to Tasks."
            width: 1240
            height: 355
            caption: "Pick the Business trigger; the Consumer one targets personal Microsoft accounts."
        - title: "Start the goal in Instructions"
          instruction: "Paste this first fragment into the inline agent's **Instructions**. Add a space, type **/**, and insert the trigger's **Title** dynamic token before the next fragment. An **Apply to each** loop can appear when this array-item token is inserted."
          prompt_label: Inline Agent · Instructions · Before Title token
          prompt: |-
            Find a time that is appropriate for this task
        - title: "Complete the goal after the Title token"
          instruction: "Add a separating space after the actual **Title** token and continue with this exact fragment. Do not leave a literal placeholder instead of the token."
          prompt_label: Inline Agent · Instructions · After Title token
          prompt: |-
            on my calendar in the next couple of business days and block that time on my calendar to work on this task. Then update the to-do with a due date a week out from the time block we created. Add appropriate notes and suggestions in the notes on key things I might want to consider. Also set a reminder 2 days before the due date. Make sure that the format of the Calendar notes and To-Do are formatted properly for the user to be able to read them well. Only schedule the time block within my normal working hours of 8:00 AM to 5:00 PM.
          screenshot:
            title: the inline agent's instructions
            src: /labs/workflows-autonomous/images/uc1-agent-instructions.webp
            src_dark: /labs/workflows-autonomous/images/uc1-agent-instructions-dark.webp
            alt: "Inline agent Instructions with the trigger Title token between the two fragments."
            width: 1240
            height: 465
            caption: "The Title chip can display its expression instead of the word Title."
        - title: "Grant the specific tools and publish deliberately"
          instruction: |
            In **Tools → +**, add **Find meeting times** and **Create event** from **Office 365 Outlook**, plus **Update to-do** from **Microsoft To-Do (Business)**. Check connector names; similarly named Eventbrite actions are not calendar tools. Reuse healthy own-account connections. Enable **Web search**.

            Confirm calendar writes target only your own calendar, without attendees. **Save → Publish** and verify **Enabled** before adding the task. This test can create a real personal calendar event and consume credits.
          screenshot:
            title: the published To Do Time Block workflow
            src: /labs/workflows-autonomous/images/uc1-workflow-published.webp
            src_dark: /labs/workflows-autonomous/images/uc1-workflow-published-dark.webp
            alt: "Published To Do Time Block workflow with Trigger, Apply to each and Agent nodes."
            width: 1536
            height: 820
            caption: "Apply to each appears automatically when the Title token is inserted."
        - title: "Create the original sample task"
          instruction: "In your **Tasks** list, add this task title. It requests a personal planning block, not a booking or invitation to a venue. Do not authorize external reservations or outreach."
          prompt_label: Microsoft To Do · Tasks · Task title
          prompt: |-
            Book Skull's Rainbow Room in Nashville for Next Friday
        - title: "Verify actual calendar and task writes, then stop"
          instruction: |
            Refresh **Activity** until the polled trigger appears; inspect **Trigger → Apply to each → Agent**, tool calls, and output. Check for a personal block within **8:00 AM–5:00 PM**, a task due date one week after that block, a reminder two days before the due date, and readable notes.

            Open the real task and Outlook Calendar to verify those fields and the event, not only the agent's narration. Disable your To Do Time Block workflow and reload to verify it stays off; otherwise every new task in **Tasks** starts another run. If the switch reports *Couldn't change the enabled state*, use [Power Automate](https://make.powerautomate.com/) **My flows → More commands (…) → Turn off** in the same environment. Inspect outstanding runs, then remove only your test event and task when no longer needed.
      reveal:
        title: "Dynamic data turns a goal into a per-item action"
        line: "Title supplies the task; tools supply the capabilities; verification supplies the evidence."
        explanation: "An inline agent can choose how to satisfy a goal rather than replay one fixed action. Calendar and task checks remain necessary."
        flow: ["New task → Title token", "Agent → calendar and task tools", "Verify writes → disable"]
      check:
        question: "You finished testing To Do Time Block. Why disable it?"
        options:
          - text: "It watches your default Tasks list, so every new task would start another run and consume credits."
            correct: true
            feedback: "Correct. Stop the trigger once you have checked the calendar block and the task."
          - text: "Disabling deletes the run history you just inspected."
            correct: false
            feedback: "A disabled workflow keeps its definition and run history; it only stops starting new runs."
    - id: inventory
      verb: Inventory
      title: "Turn a supplier delay into one verifiable Task"
      minutes: 15
      optional: true
      tool: Inline Agent · Warehouse MCP · Dataverse MCP
      brief: "Unexercised extension: ground a stock decision in tool data and inspect the resulting Dataverse row."
      outcome: "If prerequisites work, one Task with a verified arrival-plus-three-days due date and matching structured output."
      steps:
        - title: "Check assets and operations before building"
          instruction: |
            **Not live-exercised in the reviewed run.** Event attendees use installed assets and ask the proctor if missing. For self-paced setup, import [Enhanced Task Completion](../mcs-workflows/assets/mcp-servers/EnhancedTaskCompletion_1_0_0_2.zip) for Warehouse MCP and ensure Dataverse MCP can create **Task** rows.

            In your disabled Order Management copy, select **Classify → Supplier Delay → + → Agent**. Keep **New agent for this workflow** and the default available model. Select **Expand** and name the node **Inventory Task Agent**.

            Under **Tools → Model Context Protocol (MCP servers)**, add **Microsoft Dataverse MCP Server** and **Warehouse MCP Server** (detail title **Warehouse MCP**). Verify **Get restock date** and Dataverse operations as well as Connection. Reuse working connections. Only for **No tools found**, remove the affected tool from this agent, re-add it, save/publish safely, and recheck operations. If still absent, stop and ask the proctor.
        - title: "Set the inventory agent's instructions"
          instruction: "Paste the complete original block into **Instructions**. It limits the lookup and the columns written. Replace its two input placeholders with real dynamic content in the next step."
          prompt_label: Inventory Task Agent · Instructions
          prompt: |-
            Purpose
            You triage supplier shipment-delay notices into restock tasks for Contoso Electronics. A delay notice names a delayed product but does not include stock levels, so you use the Warehouse tool to find the current stock and judge how urgent the delay is, then record a task in Dataverse.

            Inputs
            Delay notice: [email body]
            Review by (Due Date): [due date]

            Guidelines
            Take the current stock and all restock details from the Warehouse tool; the email does not contain them.
            Judge urgency from the current on-hand quantity: zero on-hand means the delay causes a stockout and is urgent; low but above zero means the buffer is at risk; healthy stock means the delay is tolerable.
            The Warehouse is a sample-data service. If its next shipment date is in the past relative to the delay notice, state that the ETA is stale and must be reconfirmed. Do not invent a future shipment date or a warehouse location.

            Steps
            Read the product or SKU named in the delay notice.
            Call the Warehouse restock-date lookup once, passing the exact SKU from the notice (no extra spaces). It returns the current quantity, next shipment date, expected quantity, and supplier. Do not call the stock-check tool.
            Decide the urgency of the delay from the current on-hand quantity.
            Use Dataverse to create one row in the Task table in the current environment, setting only these columns:
            Subject: Restock delay - [product] ([SKU]).
            Description: the current on-hand quantity; the next shipment date, the expected quantity, and the supplier returned by the tool; the urgency judgement; and a one-line action for the replenishment team. Include warehouse location only if the restock lookup supplies it. Flag a stale shipment date for reconfirmation.
            Priority: High if the on-hand quantity is zero, otherwise Normal.
            Due Date (scheduledend): set this to the exact Review by (Due Date) input above, which is the trigger email's arrival date and time plus three days.

            Rules
            Create exactly one Task row and set only the columns listed above.
            If the product is not found in the Warehouse, record it as unrecognised for a person to check.
        - title: "Insert the body and generate the due-date expression"
          instruction: |
            Replace **[email body]** using the **lightning** dynamic-content picker with trigger **Body**. Replace **[due date]** using the lightning picker and the **diamonds → Ask Copilot to generate an expression** control above its search bar. Enter this expression-generation request.
          prompt_label: Ask Copilot to generate an expression · Due Date request
          prompt: |-
            Add 3 days to the date and time of arrival of the trigger email
        - title: "Compare the generated expression and configure typed output"
          instruction: |
            Compare the returned expression with this reference output, then select **Insert** only when it represents the trigger arrival plus three days:

            ```output
            addDays(triggerOutputs()?['body/receivedDateTime'], 3)
            ```

            This is a generated-expression reference, not a message to send. The Task due date is independent of the shipment ETA. If tool data has a past ETA, flag it for reconfirmation; do not invent a future date or warehouse location.

            Set **Output → Structured output**: `sku` **Text** (the SKU named in the delay notice), `stock` **Number** (current warehouse stock for that SKU), and `risk` **Yes/No** (true if stock is zero). If offered, inspect **Request human assistance when unsure** as an ambiguity mechanism, not a substitute for tool verification.
        - title: "Prepare the supplier delay subject"
          instruction: |
            Recheck self-only sender/reviewer/recipient restrictions, **Save → Publish**, and verify Enabled. In Outlook, address a new message only to yourself and paste this subject.
          prompt_label: Outlook · Supplier Delay · Subject
          prompt: |-
            Order Management - Shipment delay - LumiRead E-Reader
        - title: "Send the supplier delay body"
          instruction: "Paste the body and **Send** after checking the self-recipient. Use the existing run if one is already processing; repeated samples can create duplicate Tasks."
          prompt_label: Outlook · Supplier Delay · Body
          prompt: |-
            Hello Contoso,

            We're writing to let you know that the upcoming shipment of the LumiRead E-Reader
            (16GB), SKU-LUMI, has been delayed and will not arrive on the originally planned
            date.

            We apologise for the inconvenience and will keep you updated.

            Regards,
            LumiRead Supply Team
        - title: "Prove the tool calls and the actual Task, then stop"
          instruction: |
            In **Activity**, inspect **Classify → Supplier Delay → Inventory Task Agent**, the warehouse lookup, Dataverse describe/create operations, and structured output. Expected sample values are `sku = SKU-LUMI`, `stock = 0`, `risk = true` only if the actual lookup still returns zero stock. Preserve actual tool data rather than manufacturing the expected sample.

            Open [Power Apps](https://make.powerapps.com/) in the same environment, **Tables → Task**. Find your new **Restock delay - LumiRead E-Reader (16GB) (SKU-LUMI)** row. Use Subject **Filter by** and **Created On** to distinguish duplicates; **+N more** exposes columns, not more rows.

            Verify Description against the lookup, Priority **High** only for zero stock, and **Due Date = trigger arrival + three days** (accounting for displayed timezone). A blank due date or missing row is not a pass even if the run succeeded. Disable/reload your workflow, inspect outstanding runs, and remove only your verified test Task.
      reveal:
        title: "Structured output is not proof of persistence"
        line: "The tool result, typed output, and actual Task must agree."
        explanation: "A sample warehouse can return stale dates. Preserve that limitation, keep the arrival-derived review date separate, and verify the actual Dataverse write rather than accepting a completion message."
        flow: ["Delay → exact SKU lookup", "Stock → urgency + typed output", "Create one Task → inspect its fields"]
      check:
        question: "Which date should the Task's Due Date use?"
        options:
          - text: "The triggering email's arrival date and time plus three days."
            correct: true
            feedback: "Correct. That deadline is separate from the supplier's shipment ETA."
          - text: "A future shipment date invented when the warehouse ETA is stale."
            correct: false
            feedback: "Flag stale tool data; never invent it or use it as the review deadline."
    - id: specialist
      verb: Reuse
      title: "Call a published price-quote specialist"
      minutes: 10
      optional: true
      tool: Published Agent · SharePoint knowledge · Mail · Dataverse
      brief: "Unexercised extension: reuse the assigned specialist and prove knowledge-backed pricing and self-only delivery."
      outcome: "If prerequisites work, a real quote received by your training account with traceable pricing and account lookup."
      steps:
        - title: "Inspect the assigned specialist, not another attendee's agent"
          instruction: |
            **Not live-exercised:** the earlier Quote Request node test did not run this agent. Use only your assigned **Price Quote Agent** under **Agents → Build**. Self-paced users must provide the SharePoint Sales & Pricing Guide and Dataverse Adventure Works/Fabrikam account records; these are not in the solution package. Ask the proctor for missing event assets.

            Inspect **Tools: Microsoft Dataverse MCP Server and Mail**, **Knowledge: Order Management** (SharePoint), and **Skills: price-quote**. The broad instructions describe the role; the skill defines account/employee lookup, tier, SKU/list price, discounts, terms, lead time, and sending. Read it before running because it can send mail.

            Verify operation lists as well as connections: Mail can include **Add draft attachments**, **Update draft**, **Send email with attachments**; Dataverse should expose **Read query**, **Create record**, **Update record**. Reuse healthy connections. For **Not Connected**, connect your account. Only for **No tools found**, re-add that affected tool from MCP, save/publish, and recheck. Stop if operations remain absent; Succeeded with an inability explanation is not quote completion.

            Keep the agent **Published**; save/publish changes if needed. Only published agents appear in the workflow selector.
        - title: "Pass the request to the published agent"
          instruction: |
            In your Order Management copy, select **Classify → Quote Request → + → Agent**, then choose the published **Price Quote Agent**. Paste this template into **Message**.

            Replace **[email sender]** via the arrow **>** / **lightning** picker with trigger **From**, and **[email body]** with trigger **Body**. Delete leftover literal placeholders, not the tokens. Confirm that the resolved email recipient is your training account before **Save → Publish**; publishing enables the trigger.
          prompt_label: Quote Request · Agent · Message template
          prompt: |-
            Prepare a price quote for this customer request:
            Customer email: [email sender]
            Request: [email body]
        - title: "Prepare the quote request subject"
          instruction: "Compose an Outlook message only to your resolved training account. Paste this subject before adding the body."
          prompt_label: Outlook · Quote Request · Subject
          prompt: |-
            Order Management - Quote request - Adventure Works
        - title: "Send the original quote request"
          instruction: "Paste the original fictional request and **Send** after verifying self-only recipients. Neither the sample signature nor its office location authorizes outreach elsewhere."
          prompt_label: Outlook · Quote Request · Body
          prompt: |-
            Hello Contoso team,

            We're fitting out a new office and would like a quote for:
            - 10 Sony WH-1000XM5 headphones
            - 5 iPad Air (M2, 256GB)

            Delivery to our Santa Cruz, California office. Could you confirm your best price,
            the payment terms, and the delivery estimate?

            Thanks,
            Nancy Anderson
            Procurement, Adventure Works
        - title: "Check account lookup, pricing, and delivery"
          instruction: |
            Inspect **Activity → Classify → Quote Request → Agent**. Read the actual tool calls and completion output. Verify the account/employee lookup, knowledge-backed tier and prices, quantities, line totals, subtotal, discount, terms, and lead time; no estimates or invented handbook facts.

            Open Outlook to confirm the actual quote arrived at your account. A claimed send or a green run with missing operations is insufficient. If required knowledge or tools are unavailable, record the blocker instead of claiming success.
        - title: "Optionally inspect the Fabrikam pricing answer"
          instruction: |
            In the assigned agent's **Preview**, ask this original bonus question. Inspect Dataverse `read_query` for Fabrikam employee count and the SharePoint tier/discount evidence. The classic sample expects **Mid** tier, but verify current data rather than assuming it. Keep tool recipients constrained; do not authorize mail to real customers.
          prompt_label: Price Quote Agent · Preview · Pricing question
          prompt: |-
            What are the iPad Air prices applicable to Fabrikam?
        - title: "Optionally reuse the sample email, then disable"
          instruction: |
            This original template can invoke the sending skill. Only with self-only recipient scope verified, replace the brackets with the exact synthetic quote-test email above in Preview. Inspect whether **price-quote** loads and verify any real outcome; do not infer completion from narration.

            Finish by disabling your workflow and reloading to confirm it stays off. Inspect outstanding runs; remove only your test messages/drafts when no longer needed, and retain shared agents/connections.
          prompt_label: Price Quote Agent · Preview · Customer email template
          prompt: |-
            We have received this customer email: []
      reveal:
        title: "Reuse the capability, verify the result"
        line: "Publication exposes the specialist; its knowledge and tools still need evidence."
        explanation: "A reusable agent separates repeatable quote procedure from the workflow's routing. Its success criterion is a grounded calculation and received self-only email, not merely appearing in the selector or returning Succeeded."
        flow: ["Published specialist → From/Body tokens", "Account + pricing knowledge → quote", "Mail action → actual received message"]
      check:
        question: "Why might the assigned Price Quote Agent be absent from the selector?"
        options:
          - text: "It has been saved but not published."
            correct: true
            feedback: "Correct. Verify publication before wiring the branch."
          - text: "The workflow's Message field contains dynamic data."
            correct: false
            feedback: "Dynamic From and Body tokens are intended; they do not replace the publication requirement."
  stuck:
    - problem: "The event account lacks a workflow or optional asset."
      solution: "Ask the proctor for the assigned asset. Do not import into the shared environment, edit another attendee's copy, or count a blocked extension as complete."
    - problem: "No new email-triggered run appears."
      solution: "Check Enabled/publication, the resolved From restriction, subject token, and connection identity. Inspect Activity for an existing run before resending."
    - problem: "The inquiry appears paused."
      solution: "Inspect whether Copilot is drafting or Human review is waiting. Check reviewer/connection and Outlook; approve a safe draft with Yes then Submit. Never send duplicate tests just to bypass a waiting approval."
    - problem: "The disabled copy cannot be enabled from the list."
      solution: "The reviewed copy returned to Draft. Resume only deliberately through Build → Publish after rechecking sender and recipients, then disable/reload again after testing."
  finish:
    title: "A verified action is more than a green run"
    message: "Core complete means an isolated copy, node-only classification evidence, an archived Other email, a reviewed and received inquiry reply, and a disabled copy with settled runs. Optional extensions are separate; skipped or blocked work is not a pass."
    takeaways:
      - label: "Route"
        text: "Classify chooses a branch; its node-only test does not execute downstream actions."
      - label: "Review"
        text: "Read-only grounding and human authorization precede the reply action."
      - label: "Verify"
        text: "Check both Activity and the actual mailbox or record, then disable and reload."
      - label: "Extend"
        text: "Inline agents, MCP tools, and published specialists are optional capabilities with separate prerequisites and unverified outcomes here."
    reflection: "Which action in your own workflow needs a human decision, and what external evidence would prove the action really happened?"
    cleanup: |
      Disable only workflows you enabled and reload to verify their off state. Inspect Running/Waiting tests and finish safe approvals or cancel your unfinished runs; ask the proctor if necessary. Disabling does not prove existing runs stopped.

      Remove only your synthetic messages, approvals, drafts, optional calendar event/To Do task, and optional Dataverse Task when no longer needed. Preserve original starters, other attendees' work, shared connections, MCP servers, knowledge, and agents. Leave a Draft/disabled copy off; future testing may require Build → Publish. Rolling credit totals are not per-run cost measurements.
  sources:
    - title: "Workflows in Microsoft Copilot Studio"
      url: https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview
    - title: "Workflow designer, testing, and run history"
      url: https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flow-designer
    - title: "Add inline or published agents and tools to a workflow"
      url: https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/agent-node-workflow
    - title: "Event triggers for Standard harness agents (comparison)"
      url: https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about
---

# Workflows

Follow this lab in [Architecture Bootcamp](https://microsoft.github.io/mcs-labs/events/architecture-bootcamp/).

One incoming email. A verified, human-approved action. Leave with your own disabled Order Management copy, evidence of an archived test email, and a grounded reply you reviewed before delivery.

![Successful Copilot, Human review, If, and Reply to email steps; Flag email and Archive email are skipped.](images/inquiry-path-succeeded.webp)

*A real approved Customer Inquiry run. The diagram proves the route executed; separately check the delivered email.*

## Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| 300 | Maker / Developer | 30 minutes core | An isolated Order Management copy, two verified mailbox outcomes, and durable disabled state |

**Pacing:** Isolate (6) → Route (6) → Review (13) → Stop (5) = **30 minutes**. Optional extensions follow: Time-block (15), Inventory (15), Specialist (10). These are working budgets, not timing guarantees; trigger pickup, generation, and approvals vary. Inspect the existing run rather than sending duplicates.

**Scenario:** Your order desk receives unrelated promotions, customer questions, supplier delays, and quote requests. A workflow classifies the message; a grounded draft and human decision protect the customer-facing reply.

<details class="lab-validation" markdown="1">
<summary>What was tested</summary>

**Verified boundary:** the 6 November 2026 training run tested the original quote sample in **Run node**, archived the exact Other sample, and completed the exact Customer Inquiry sample through **Yes → Submit** to a received holding reply. The original starter was untouched and the copy was disabled after reload. The rejection branch, inventory MCP, and specialist quote delivery were not exercised. Screenshots are genuine, privacy-reviewed light/dark captures of those three tested states, not proof of untested branches.

</details>

This is the **Microsoft Copilot harness** workflow experience. **Standard harness** remains a separate experience; it has not been renamed. Only the former GitHub Copilot harness name changed. Supplied working instructions remain unchanged. The [classic Workflows lab](../mcs-workflows-latest/) remains available.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Mission 1: Isolate](#mission-1-isolate)
- [Mission 2: Route](#mission-2-route)
- [Mission 3: Review](#mission-3-review)
- [Mission 4: Stop](#mission-4-stop)
- [Optional: Time-block](#optional-time-block)
- [Optional: Inventory](#optional-inventory)
- [Optional: Specialist](#optional-specialist)
- [Troubleshooting](#troubleshooting)
- [Finish and Clean Up](#finish-and-clean-up)
- [Sources](#sources)

## Prerequisites

<p class="lab-setup-note">At a proctor-led event with a provided, pre-provisioned account? <strong>You're ready to start.</strong></p>

<details class="lab-setup" markdown="1">
<summary>Using your own tenant? View setup requirements</summary>

Use a development/training environment with Copilot Studio **Workflows**, available Copilot Credits, Outlook, and Microsoft Copilot access. Arrange the Order Management starter and connections before starting the timer. Mission 1 links the solution for self-paced import only if needed. Optional extensions require their additional assets; none is a prerequisite for the core.

</details>

Ask the proctor if an asset is missing. Do not import replacements or edit another attendee's workflow.

- Sign in to [Copilot Studio](https://copilotstudio.microsoft.com/) with the provided training account and select the assigned environment.
- Open [Outlook](https://outlook.office.com/) with the same account. Keep Studio and this lab side by side.
- Use synthetic self-addressed messages only. Check ownership, sender restriction, reviewer, To, CC, and BCC before publishing. Publication can start a trigger and consume Copilot Credits.

## Mission 1: Isolate

**6 minutes · Copilot Studio / Workflows**

**Outcome:** an owned draft with healthy connections and a self-only sender filter; the starter is unchanged.

1. Select **Workflows → Order Management Workflow → Build**. Review and dismiss any first-visit notice or environment tour. Event attendees ask the proctor if the starter is missing. For self-paced setup only, import [LAB: Order Management Workflows](../mcs-workflows/assets/solutions/LABOrderManagementWorkflows_1_0_0_8.zip) and sign in to requested connections. It includes the starter and Price Quote Agent, not optional SharePoint pricing data.
2. Select the **designer header's More options → Create a copy**. Keep the default **Title**, **Order Management Workflow - Copy**, and select **Create**; if offered, **Open workflow** opens a **new browser tab**; continue only in that copy. The list row's **More actions** may offer only Delete; leave the original unchanged.
3. Open **When a new email arrives**, **Copilot**, and **Human review**, waiting for each lab-account connection to resolve. Reuse healthy connections. Only if Human review lacks one, select **Create new connection**, name it (for example **Human review**), retain **Authentication Type: Default**, and **Create**. It is marked **Premium**; sign in with the training account.
4. In the trigger, retain **Subject filter → string**. Hover to inspect `string('Order Management')`; do not replace it or assume an expression-mode switch. Select **Add advanced parameter → From**, enter your training email in the people picker, and resolve it. Every test must come from you and contain **Order Management** in the subject. Do not publish yet.

**Reveal — Isolation comes before automation:** A copy protects the starter; sender and recipient checks protect people. The subject selects the scenario, not the sender. Connections determine whose mailbox/data the nodes access. **Owned copy → own-account connections → subject and sender restriction.**

**Knowledge check:** Which setup is safe before an end-to-end test?
- **Correct:** An owned copy, retained subject token, resolved own-account From restriction, and checked recipients. These checks precede publication.
- **Incorrect:** The original starter with only the subject filter. A subject does not isolate senders; the starter must remain unchanged.

## Mission 2: Route

**6 minutes · Classify / Outlook / Activity**

**Outcome:** Quote Request node output, plus a separate successful Other run and actual archived message.

1. Open **Classify**. Keep the current/default available model; replace one only if missing or flagged retired. Inspect **Quote Request**, **Supplier Delay**, and **Customer Inquiry**. **Other** is the automatic Default category, not a fourth configured category. Select **Run node**, paste into trigger **Body**, and select **Run**.

**Classify · Run node · Body**

```text
Hi, I would like to request a quote for 500 units of Product A.
```

Expect **Quote Request**. This node-only test does not execute the downstream agent or send a quote.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/classify-quote-result-dark.webp"><img src="images/classify-quote-result.webp" alt="Classify Run node panel with the original Body sample and Quote Request output."></picture>

*Genuine light/dark node-test captures. No quote specialist or downstream delivery ran.*

2. Before publication, inspect **Human review**: reviewer is incoming **From**, delivery is **Outlook**, and the proposed reply is visible. Inspect **Reply to email**: trigger **Message Id**, **To = From**, empty **CC/BCC**. With the sender restriction, reviewer and recipient must resolve only to you. Leave untested branches alone. **Save** (or **Ctrl+S**) → **Publish** automatically enables the copy; confirm **Enabled** on Workflows.
3. In Outlook, review **Your privacy matters → Continue** if shown. Compose to your training account, using **Check names** if needed. Paste the subject, then the body before sending.

**Outlook · Other test · Subject**

```text
Order Management - Congratulations! Your order desk has been selected
```

**Outlook · Other test · Body**

```text
Dear Order Manager,

Congratulations! Your order management team has been selected in our monthly
business draw and is entitled to claim an exclusive cash reward.

To release your reward, please reply with your full name and contact details,
and a small processing fee may apply.

Act soon, as unclaimed rewards expire.

Regards,
Promotions Team
MegaDraw Rewards
```

4. Recheck the resolved self-recipient and **Send**. This is deliberately irrelevant synthetic spam; do not follow its requests or send it elsewhere.
5. Refresh **Activity** and inspect the new run: expect **Other → Archive email**, **Succeeded**. Separately find the exact message in Outlook **Archive**. Processing varies; check publication, Enabled, sender restriction, subject, and existing runs before resending. If stopping here, disable/reload your copy; otherwise continue.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/other-path-succeeded-dark.webp"><img src="images/other-path-succeeded.webp" alt="Executed Other branch leading to a successful Archive email action."></picture>

*Real run evidence, not a mailbox screenshot. The original run also had a separately verified archived email.*

**Reveal — Classification is not delivery:** Node output proves a category; an end-to-end test proves an action. **Body → category; self-email → trigger → Other → Archive → mailbox verification.**

**Knowledge check:** Does Quote Request output prove the specialist sent mail?
- **Correct:** No; Run node tested classification only. Downstream delivery needs a separate verified test.
- **Incorrect:** Yes; a category test executes every branch action. No specialist or quote dispatch ran here.

## Mission 3: Review

**13 minutes · Copilot / Human review / Outlook**

**Outcome:** a reviewed answer or holding reply, a successful approved run, and its received email.

1. In your copy, open **Classify → Customer Inquiry → Copilot**. Confirm **Customer question** uses trigger **Body**. Read the supplied prompt in place: search the connection owner's earlier email threads, answer when evidence exists, otherwise write a holding reply without invented facts, addressed **Dear Customer,** and signed **Contoso Electronics Order Management**. The full preconfigured prompt was not supplied verbatim in the evidence; do not replace it with this summary. Copilot retrieves/drafts read-only; the reply node dispatches.
2. In **Human review**, confirm the message contains the draft, delivery is **Outlook**, reviewer is incoming **From**, and the single **Yes/No** input is **Approve**, question **Send proposed reply?**. Confirm **If/Else → Approve Equals Yes**. Check **Reply to email**: trigger **Message Id**, **To = From**, empty **CC/BCC**. Yes replies; Else flags. This exercise tests Yes only. Save/publish changes after checking self-only scope. If a previously disabled copy is **Draft**, resume deliberately through **Build → Publish**, not the list switch alone.
3. Compose to your resolved training account with this subject and body. The fictional signature is not authorization to contact a real customer.

**Outlook · Customer Inquiry · Subject**

```text
Order Management - Question about iPad Air warranty and MDM
```

**Outlook · Customer Inquiry · Body**

```text
Hi team,

Quick question before we expand our last order. What is the standard warranty
period on the iPad Air (M2), and can the devices be enrolled in our mobile device
management (MDM)? I think we asked something similar a few months back but I can't
find the reply.

Thanks,
Jordan Kim
IT, Alpine Ski House
```

4. Recheck the recipient and **Send**. Refresh **Activity**, select the new **Customer Inquiry** run, and distinguish the waits: trigger pickup, **Copilot** drafting, then **Human review** waiting for your decision.
5. In Outlook, open **Action Needed: Review Customer Enquiry Reply**. Read the draft. A holding reply is valid if the mailbox lacks warranty/MDM evidence; do not approve invented facts. The verified run produced a grounded holding reply, not a factual warranty promise. If safe, choose **Yes**, then **Submit**; confirm **Your response has been successfully submitted**. The tested card worked without actioning a possible **Trust sender** prompt. If unsafe, do not approve just to finish; stop and ask the proctor. No/rejection is not a validated fallback here.
6. Allow resumption and verify the actual received reply. The tested email used **Your inquiry - Contoso Electronics** and **Dear Customer,**; assess grounding and delivery, not exact generated wording or elapsed time. Confirm **Succeeded** and **Copilot → Human review → If → Reply to email** in Activity. **Flag email** and **Archive email** are expected skipped nodes on this path.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/inquiry-path-succeeded-dark.webp"><img src="images/inquiry-path-succeeded.webp" alt="Successful Copilot, Human review, If, and Reply to email steps; Flag email and Archive email are skipped."></picture>

*Real light/dark run captures. The parent run separately verified a received holding reply; no No/rejection run was performed.*

If approval is missing, inspect whether Copilot is drafting or Human review is waiting, then check reviewer and Connection. Repair only an unresolved/incorrect connection and republish. Check the original run before resending to avoid duplicate approvals.

**Reveal — Grounding and approval solve different problems:** Evidence constrains the draft; a person authorizes the send. **Question → grounded draft → Human review → Yes + Submit → reply → received message and successful run.**

**Knowledge check:** What is acceptable when the mailbox lacks warranty evidence?
- **Correct:** A holding reply without invented warranty/MDM facts. Grounding matters more than specificity.
- **Incorrect:** An invented warranty period to make the test complete. Never approve unsupported facts.

## Mission 4: Stop

**5 minutes · Workflows / Activity**

**Outcome:** your copy stays disabled after reload and has no unattended running/waiting test.

1. On **Workflows**, turn off **Enabled** for your copy, reload, and verify it stays off. Do not change the original. The verified copy returned to **Draft**, with an unchecked disabled switch and **This workflow hasn't been published and can't be enabled from this list.** Leave it disabled. Resume an optional test only intentionally through **Build → Publish** after rechecking restrictions.
2. Inspect **Activity** for **Running/Waiting** tests. Disabling prevents new starts; it does not prove existing runs stopped. Finish safe approvals or cancel unfinished tests; ask the proctor if one cannot be stopped.
3. Remove only your synthetic emails, approvals, replies, and drafts when no longer needed. Keep shared connections, agents, MCP servers, knowledge, and starters. Record **Credit usage (last 30 days)** if available as a rolling total, not measured per-run cost.

**Reveal — Cleanup is observable:** **Disable own trigger → reload/still off → Activity/no unattended tests.** A completed run does not stop future pickup.

**Knowledge check:** Does disabling prove a waiting approval stopped?
- **Correct:** No; inspect Activity and finish or cancel outstanding tests.
- **Incorrect:** Yes; the switch proves earlier runs are gone. Trigger state and existing runs are separate.

## Optional: Time-block

**15 additional minutes · Microsoft To Do / Inline Agent / Outlook Calendar**

**Outcome:** one verified personal calendar block and enriched task, with the workflow disabled afterwards.

1. In [Microsoft To Do](https://to-do.office.com/), sign in with the same training account. The workflow watches your default **Tasks** list; no new list is needed.
2. In Copilot Studio, select **Workflows → New workflow**; it opens as **Untitled workflow** in **Draft**. Rename it **To Do Time Block**: select the name in the designer header (*Click to rename*), type it, and press **Enter**.
3. In the **Start** node, switch **Trigger type** from **Manual** to **Connector**, select **Select trigger...**, search `to-do`, and under **Microsoft To-Do (Business)** select **When a new to-do in a specific folder is created**. **Connection → Create new connection → Create** with your training account, then **To-do list → Tasks**; the **Needs setup** badge clears. **+ → Agent**, reuse the training identity, and retain **New agent for this workflow**.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/uc1-trigger-tasks-list-dark.webp"><img src="images/uc1-trigger-tasks-list.webp" alt="Trigger When a new to-do in a specific folder is created under Microsoft To-Do (Business), with To-do list set to Tasks."></picture>
4. Paste the first Instructions fragment, add a space, type **/** and insert trigger **Title**. An **Apply to each** can appear when this array-item token is inserted.

**Inline Agent · Instructions · Before Title token**

```text
Find a time that is appropriate for this task
```

5. Add a separating space after the actual Title token, then paste the second fragment. Do not leave a literal placeholder.

**Inline Agent · Instructions · After Title token**

```text
on my calendar in the next couple of business days and block that time on my calendar to work on this task. Then update the to-do with a due date a week out from the time block we created. Add appropriate notes and suggestions in the notes on key things I might want to consider. Also set a reminder 2 days before the due date. Make sure that the format of the Calendar notes and To-Do are formatted properly for the user to be able to read them well. Only schedule the time block within my normal working hours of 8:00 AM to 5:00 PM.
```

<picture><source media="(prefers-color-scheme: dark)" srcset="images/uc1-agent-instructions-dark.webp"><img src="images/uc1-agent-instructions.webp" alt="Inline agent Instructions with the trigger Title token between the two fragments."></picture>

6. Under **Tools → +**, add **Find meeting times** and **Create event** from **Office 365 Outlook**, plus **Update to-do** from **Microsoft To-Do (Business)**. Check connector names; Eventbrite look-alikes are wrong. Reuse healthy own-account connections and enable **Web search**. Confirm calendar writes target only your calendar with no attendees. **Save → Publish** and verify **Enabled** before creating the task.

<picture><source media="(prefers-color-scheme: dark)" srcset="images/uc1-workflow-published-dark.webp"><img src="images/uc1-workflow-published.webp" alt="Published To Do Time Block workflow with Trigger, Apply to each and Agent nodes."></picture>

7. Add the original title to **Tasks**. It requests a personal planning block, not a reservation or invitation to a venue; do not authorize external booking/outreach.

**Microsoft To Do · Tasks · Task title**

```text
Book Skull's Rainbow Room in Nashville for Next Friday
```

8. Refresh **Activity** until the polled trigger appears; inspect **Trigger → Apply to each → Agent**, tool calls and output. Check for a personal block within **8:00 AM–5:00 PM**, task due one week after that block, reminder two days before due, and readable notes. Open the real task and Outlook Calendar to verify, not just the narration.
9. Disable your To Do Time Block workflow, reload/still off, and inspect outstanding runs; otherwise every new task in **Tasks** starts another run. If the switch reports *Couldn't change the enabled state*, use [Power Automate](https://make.powerautomate.com/) **My flows → More commands (…) → Turn off** in the same environment. Remove only your test event and task when no longer needed.

**Reveal — Dynamic data makes the goal per-item:** **New task → Title token → agent/tools → verify writes → disable.**

**Knowledge check:** Why disable To Do Time Block after testing?
- **Correct:** It watches your default Tasks list, so every new task would start another run and consume credits.
- **Incorrect:** Disabling deletes the run history. A disabled workflow keeps its definition and history; it only stops new runs.

## Optional: Inventory

**15 additional minutes · Inline Agent / Warehouse MCP / Dataverse MCP**

**Outcome:** if prerequisites work, one verified Task with arrival-plus-three-days due date and matching structured output.

> **Not live-exercised in the reviewed run.** Event attendees use installed assets and ask the proctor if missing. Self-paced users import [Enhanced Task Completion](../mcs-workflows/assets/mcp-servers/EnhancedTaskCompletion_1_0_0_2.zip) for Warehouse MCP and ensure Dataverse MCP can create **Task** rows.

1. In your disabled copy, **Classify → Supplier Delay → + → Agent**. Keep **New agent for this workflow**, default available model, **Expand**, and name it **Inventory Task Agent**.
2. Under **Tools → Model Context Protocol (MCP servers)** add **Microsoft Dataverse MCP Server** and **Warehouse MCP Server** (detail title **Warehouse MCP**). Verify **Get restock date**, Dataverse operations, and Connection. Reuse working connections. Only for **No tools found**, remove the affected tool from this agent, re-add it, save/publish safely, and recheck. If still missing, stop and ask the proctor.
3. Paste these exact instructions; replace its two input placeholders next.

**Inventory Task Agent · Instructions**

```text
Purpose
You triage supplier shipment-delay notices into restock tasks for Contoso Electronics. A delay notice names a delayed product but does not include stock levels, so you use the Warehouse tool to find the current stock and judge how urgent the delay is, then record a task in Dataverse.

Inputs
Delay notice: [email body]
Review by (Due Date): [due date]

Guidelines
Take the current stock and all restock details from the Warehouse tool; the email does not contain them.
Judge urgency from the current on-hand quantity: zero on-hand means the delay causes a stockout and is urgent; low but above zero means the buffer is at risk; healthy stock means the delay is tolerable.
The Warehouse is a sample-data service. If its next shipment date is in the past relative to the delay notice, state that the ETA is stale and must be reconfirmed. Do not invent a future shipment date or a warehouse location.

Steps
Read the product or SKU named in the delay notice.
Call the Warehouse restock-date lookup once, passing the exact SKU from the notice (no extra spaces). It returns the current quantity, next shipment date, expected quantity, and supplier. Do not call the stock-check tool.
Decide the urgency of the delay from the current on-hand quantity.
Use Dataverse to create one row in the Task table in the current environment, setting only these columns:
Subject: Restock delay - [product] ([SKU]).
Description: the current on-hand quantity; the next shipment date, the expected quantity, and the supplier returned by the tool; the urgency judgement; and a one-line action for the replenishment team. Include warehouse location only if the restock lookup supplies it. Flag a stale shipment date for reconfirmation.
Priority: High if the on-hand quantity is zero, otherwise Normal.
Due Date (scheduledend): set this to the exact Review by (Due Date) input above, which is the trigger email's arrival date and time plus three days.

Rules
Create exactly one Task row and set only the columns listed above.
If the product is not found in the Warehouse, record it as unrecognised for a person to check.
```

4. Replace **[email body]** using **lightning** with trigger **Body**. For **[due date]**, open lightning, then **diamonds → Ask Copilot to generate an expression** above search. Enter:

**Ask Copilot to generate an expression · Due Date request**

```text
Add 3 days to the date and time of arrival of the trigger email
```

5. Compare the returned expression with this **reference output**, then **Insert** only if it represents trigger arrival plus three days. This is not a message to send:

```output
addDays(triggerOutputs()?['body/receivedDateTime'], 3)
```

The Task due date is independent of shipment ETA. Flag a past tool-data ETA for reconfirmation; never invent future dates or locations.

6. Set **Output → Structured output**: `sku` **Text** (SKU named in notice), `stock` **Number** (current warehouse stock for that SKU), `risk` **Yes/No** (true when zero stock). If offered, inspect **Request human assistance when unsure** as an ambiguity mechanism, not a substitute for tool verification.
7. Recheck self-only sender/reviewer/recipients, **Save → Publish**, verify Enabled. In Outlook, address yourself and paste the subject/body. Send after checking the recipient; repeated tests can create duplicate Tasks.

**Outlook · Supplier Delay · Subject**

```text
Order Management - Shipment delay - LumiRead E-Reader
```

**Outlook · Supplier Delay · Body**

```text
Hello Contoso,

We're writing to let you know that the upcoming shipment of the LumiRead E-Reader
(16GB), SKU-LUMI, has been delayed and will not arrive on the originally planned
date.

We apologise for the inconvenience and will keep you updated.

Regards,
LumiRead Supply Team
```

8. Inspect **Activity → Classify → Supplier Delay → Inventory Task Agent**, warehouse lookup, Dataverse describe/create operations, and structured output. Expected sample values `sku = SKU-LUMI`, `stock = 0`, `risk = true` apply only if the actual lookup still returns zero. Preserve real tool data, not a manufactured expected result.
9. In [Power Apps](https://make.powerapps.com/) / same environment, **Tables → Task**, find your new **Restock delay - LumiRead E-Reader (16GB) (SKU-LUMI)** row. Use Subject **Filter by** and **Created On** to distinguish duplicates; **+N more** exposes columns, not rows. Check Description against lookup, High priority only for zero stock, and **Due Date = trigger arrival + three days**, accounting for displayed timezone. A blank date or missing row is not a pass even if the run succeeded.
10. Disable/reload your workflow, inspect outstanding runs, and remove only your verified test Task.

**Reveal — Typed output is not proof of persistence:** **Exact SKU lookup → stock/urgency/typed output → create one Task → inspect fields.** Preserve stale-data limitations and keep review date separate.

**Knowledge check:** Which date belongs in Due Date?
- **Correct:** Trigger arrival plus three days, independent of shipment ETA.
- **Incorrect:** An invented future shipment date when ETA is stale. Flag stale data instead.

## Optional: Specialist

**10 additional minutes · Published Agent / SharePoint knowledge / Mail / Dataverse**

**Outcome:** if prerequisites work, a real self-received quote with traceable pricing and account lookup.

> **Not live-exercised:** the Quote Request node test did not run this agent. Use only your assigned Price Quote Agent. Self-paced users provide the SharePoint Sales & Pricing Guide and Dataverse Adventure Works/Fabrikam accounts; the solution does not contain them. Event attendees ask the proctor for missing assets.

1. Open **Agents → Price Quote Agent → Build**. Inspect **Tools: Microsoft Dataverse MCP Server and Mail**, **Knowledge: Order Management** (SharePoint), **Skills: price-quote**. Read the skill: account/employee lookup, tier, SKU/list price, discounts, terms, lead time, and sending. It can send mail. Broad instructions describe the role; procedural logic belongs to the skill.
2. Verify operations and connections. Mail can include **Add draft attachments**, **Update draft**, **Send email with attachments**; Dataverse should expose **Read query**, **Create record**, **Update record**. For **Not Connected**, connect your account. Only for **No tools found**, re-add that affected MCP tool, save/publish, and recheck. Preserve healthy tools/connections. Stop if operations stay absent; Succeeded with an inability explanation is not quote completion.
3. Verify the agent is **Published**; save/publish changes if needed. In your workflow copy, **Classify → Quote Request → + → Agent**, choose **Price Quote Agent**. Only published agents appear. Paste into **Message**:

**Quote Request · Agent · Message template**

```text
Prepare a price quote for this customer request:
Customer email: [email sender]
Request: [email body]
```

4. Replace **[email sender]** using arrow **>** / **lightning** with trigger **From**, and **[email body]** with **Body**. Delete leftover literal placeholders, not tokens. Confirm the resolved quote recipient is your training account before **Save → Publish**, which enables the trigger.
5. Compose in Outlook only to your resolved training account. Paste subject and body, recheck, and **Send**. The fictional signature/location does not authorize outreach elsewhere.

**Outlook · Quote Request · Subject**

```text
Order Management - Quote request - Adventure Works
```

**Outlook · Quote Request · Body**

```text
Hello Contoso team,

We're fitting out a new office and would like a quote for:
- 10 Sony WH-1000XM5 headphones
- 5 iPad Air (M2, 256GB)

Delivery to our Santa Cruz, California office. Could you confirm your best price,
the payment terms, and the delivery estimate?

Thanks,
Nancy Anderson
Procurement, Adventure Works
```

6. Inspect **Activity → Classify → Quote Request → Agent**, actual tool calls, and output. Verify account/employee lookup, knowledge-backed tier/prices, quantities, line totals, subtotal, discounts, terms, lead time; no estimates or invented handbook facts. Confirm the actual quote in your Outlook inbox. Claimed sending or green status with missing operations is insufficient; record blockers honestly.
7. Optional bonus: in the assigned agent's **Preview**, ask the original question. Inspect Dataverse `read_query` for Fabrikam employee count and SharePoint tier/discount evidence. The classic sample expects **Mid** tier, but verify current data. Keep tool recipients constrained; do not authorize mail to real customers.

**Price Quote Agent · Preview · Pricing question**

```text
What are the iPad Air prices applicable to Fabrikam?
```

8. This original template can invoke the sending skill. Only with self-only recipient scope verified, replace the brackets with the exact synthetic quote-test email above in Preview. Inspect whether **price-quote** loads and verify any real outcome; narration alone is insufficient.

**Price Quote Agent · Preview · Customer email template**

```text
We have received this customer email: []
```

9. Disable/reload your workflow, inspect outstanding runs, and remove only your test messages/drafts when no longer needed. Keep shared agents and connections.

**Reveal — Reuse the capability, verify the result:** **Published specialist + From/Body → account/pricing knowledge → quote → Mail → actual received message.** Publication exposes the agent; knowledge and tool results still need evidence.

**Knowledge check:** Why might the assigned agent be absent from the selector?
- **Correct:** Saved but not published. Verify publication.
- **Incorrect:** Message contains dynamic data. From/Body tokens are intended and do not replace publication.

## Troubleshooting

| Problem | Next check |
| --- | --- |
| Event workflow or optional asset missing | Ask the proctor. Do not import into the shared environment, edit another attendee's asset, or count blocked work complete. |
| No email-triggered run | Check publication/Enabled, resolved From, subject token, identity, and existing Activity before resending. |
| Inquiry paused | Distinguish Copilot drafting from Human review waiting; check reviewer/connection and Outlook. Safe approval requires Yes then Submit. |
| Disabled copy cannot enable from the list | The reviewed copy became Draft. Resume only deliberately through Build → Publish after safety checks; disable/reload again afterwards. |

## Finish and Clean Up

**Core complete:** isolated copy, node-only classification evidence, archived Other email, reviewed and received inquiry reply, and disabled copy with settled runs. Optional extensions are separate; skipped or blocked work is not a pass.

- **Route:** Classify picks a branch; its node-only test does not execute downstream actions.
- **Review:** Read-only grounding and human authorization precede dispatch.
- **Verify:** Check Activity and the actual mailbox/record, then disable and reload.
- **Extend:** Inline agents, MCP tools, and published specialists have separate prerequisites and unverified outcomes here.

**Reflection:** Which action in your workflow needs a human decision, and what external evidence would prove it really happened?

Disable only workflows you enabled and reload to verify they stay off. Inspect **Running/Waiting** tests; finish safe approvals or cancel unfinished runs, asking the proctor if necessary. Disabling does not prove existing runs stopped.

Remove only your synthetic messages, approvals, drafts, optional calendar event/To Do task, and optional Dataverse Task when no longer needed. Preserve original starters, other attendees' work, shared connections, MCP servers, knowledge, and agents. Leave Draft/disabled copies off; future testing may require **Build → Publish**. Rolling credit totals are not per-run cost measurements.

## Sources

- [Workflows in Microsoft Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flows-overview)
- [Workflow designer, testing, and run history](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/flow-designer)
- [Add inline or published agents and tools to a workflow](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/agent-node-workflow)
- [Event triggers for Standard harness agents (comparison)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about)
