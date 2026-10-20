# Hooks — Context, Redaction and Tool Checks

Add hooks to an agent on the GitHub Copilot harness so that a workflow runs at fixed points in every conversation: load context when a session starts, redact personal data from every prompt, and check a tool call before it runs.

---

## 🧭 Lab Details

| Level | Persona | Duration | Purpose |
| ----- | ------- | -------- | ------- |
| 200 | Maker | 30 minutes | After completing this lab, participants will be able to attach workflows to agent lifecycle events with hooks, return context to the model at session start, rewrite a user's prompt with a classifier and an inline agent before the agent sees it, and deny a tool call that breaks a business rule — and explain why each of these belongs in a hook rather than in instructions or a tool. |

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
  - [Use Case #1: Build Zava Procurement Buddy and load context at session start](#-use-case-1-build-zava-procurement-buddy-and-load-context-at-session-start)
  - [Use Case #2: Redact personal data before the agent sees it](#-use-case-2-redact-personal-data-before-the-agent-sees-it)
  - [Use Case #3: Block unapproved suppliers before the tool runs](#-use-case-3-block-unapproved-suppliers-before-the-tool-runs)
- [Bonus: Try it yourself](#-bonus-try-it-yourself)
- [Summary of learnings](#-summary-of-learnings)
- [Conclusions and recommendations](#-conclusions-and-recommendations)

---

## 🤔 Why This Matters

**Makers** — on the GitHub Copilot harness the agent decides how to approach a task and which tools to call. Instructions *guide* those decisions, but some steps must happen **every time** a particular event occurs, not only when the model judges them relevant.

That is what hooks are for. A hook binds a workflow to a moment in the agent's lifecycle — a session starting, a prompt arriving, a tool about to run — and the runtime calls it whether or not the model would have chosen to.

| | Tool | Hook |
|---|---|---|
| What starts it | The agent chooses it, based on its name and description | The event fires |
| How reliably it runs | Only when the agent judges it relevant | Every time the event occurs |
| What the response does | Gives the agent information it might use | Changes what the agent does next |

**Common challenges solved by this lab:**

- "Every conversation starts cold — the agent has to ask who I am before it can help"
- "Users paste bank details and personal email addresses into the chat, and I don't want the model to process them"
- "I wrote 'only use approved suppliers' in the instructions, and the agent still raised a request for a supplier we don't use"

**Pairs with:** the *Deep dive in modern agents* workshop.

---

## 🌐 Introduction

**Zava** is a fast-growing retailer. Its finance and procurement team wants employees to raise their own purchase requests through an agent instead of filling in forms — and it has three concerns before it lets that agent loose.

1. **Know who is asking.** Every request needs to be tied to the signed-in employee from the very first message.
2. **Keep personal data out of the model.** Employees routinely paste a supplier's IBAN, a colleague's personal phone number or their own card number into a request. Procurement does not need it, and the agent should never see it.
3. **Only buy from approved suppliers.** Zava has a short list of approved vendors. A purchase request for anyone else must be stopped *before* it is created — not politely discouraged in the instructions.

In this lab you build **Zava Procurement Buddy** on the GitHub Copilot harness and give it one tool, **Create purchase request**. Then you add three hooks, one per concern, and watch each one change what the agent does — without touching its instructions.

**What You Will Learn**

- How to add a hook to an agent and create its workflow from the **Add hook** dialog
- How **Start (pre-loop)** uses `additionalContext` to hand the model information before the first turn
- How **User prompt submitted** uses `modifiedPrompt` to replace what the user typed — here with a **Classify** node and an **inline agent**
- How **Pre tool use** uses `permissionDecision` to block a tool call and `additionalContext` to tell the agent what to do instead

---

## 🎓 Core Concepts Overview

| Concept | Why it matters |
|---------|----------------|
| **Hook** | An *event* plus an *action*. When the event fires, Copilot Studio calls the workflow bound to it and reads the workflow's response back into the conversation |
| **Hook workflow** | A workflow whose **When an agent calls the flow** inputs and **Respond to the agent** outputs match the event. Keep the starter field names — Copilot Studio uses them to decide whether a workflow fits an event |
| **`metadata`** | Sent with every hook: conversation, user, channel and agent details, including `userAadObjectId` of the signed-in user |
| **Start (pre-loop)** | Runs once when a new conversation begins. Returns `additionalContext` — background text the model receives for the session |
| **User prompt submitted** | Runs on every user message, before the agent processes it. Receives `prompt`, returns `modifiedPrompt` to replace it |
| **Pre tool use** | Runs before a tool call, receives `toolName` and `parameters`. The **only** event that can block an action, via `permissionDecision` = `deny` |
| **Classify node** | An AI step in a workflow that routes text into categories you describe — a deterministic branch driven by a model judgement |
| **Inline agent** | A non-deterministic agent embedded in a workflow step. Here it rewrites the prompt instead of following a fixed script |

---

## 📄 Documentation and Additional Training Links

* [Hooks (GitHub Copilot) (preview)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/hooks-overview)
* [Blog: Hooks in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/hooks-in-copilot-studio/)
* [Workflows in Microsoft Copilot Studio](https://learn.microsoft.com/microsoft-copilot-studio/flows-overview)
* [Add an agent to a workflow](https://learn.microsoft.com/microsoft-copilot-studio/agent-node-workflow?tabs=workflows)
* [GitHub Copilot SDK — hooks overview](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md)

---

## ✅ Prerequisites

- Access to Microsoft Copilot Studio **preview** at [copilotstudio.preview.microsoft.com](https://copilotstudio.preview.microsoft.com/) — hooks are in public preview and only available there. Confirm **Hooks** appears in the agent's **…** menu before you start.
- The **New experience** toggle on, so that **New agent** creates an agent on the **GitHub Copilot harness**.
- A Power Platform environment where you can create agents and **Workflows**.
- Signed in with your work account — the session-start hook reads your Microsoft Entra object ID from `metadata`.

> [!NOTE]
> Hooks are a preview feature and the designer is still changing. If a label in this lab differs slightly from what you see, look for the closest match — the event names, input names and output names are the stable part.

> [!IMPORTANT]
> **Save is not publish.** Selecting **Done** on a hook adds it to your *draft* agent. Save the agent to store it. The test pane uses the saved draft, so you do not need to publish the agent for this lab — but every hook **workflow** must be **published** or the hook has nothing to call.

---

## 🎯 Summary of Targets

By the end of this lab you will have:

- Built **Zava Procurement Buddy** with one workflow tool, **Create purchase request**
- Added a **Start (pre-loop)** hook that hands the model your identity before the first message
- Added a **User prompt submitted** hook that classifies every prompt and redacts personal data with an inline agent
- Added a **Pre tool use** hook that denies purchase requests for unapproved suppliers and tells the agent which suppliers are allowed

---

## 🧩 Use Cases Covered

| Step | Use Case | Value added | Effort |
|------|----------|-------------|--------|
| 1 | [Build Zava Procurement Buddy and load context at session start](#-use-case-1-build-zava-procurement-buddy-and-load-context-at-session-start) | An agent that knows who it is talking to before the first turn | 10 min |
| 2 | [Redact personal data before the agent sees it](#-use-case-2-redact-personal-data-before-the-agent-sees-it) | Personal and financial data never reaches the model | 10 min |
| 3 | [Block unapproved suppliers before the tool runs](#-use-case-3-block-unapproved-suppliers-before-the-tool-runs) | A business rule the agent cannot talk its way around | 10 min |

---

## 🛠️ Instructions by Use Case

---

## 🧱 Use Case #1: Build Zava Procurement Buddy and load context at session start

You are a maker on Zava's finance team. Before you add any hooks you need an agent and a tool for them to act on.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Build Zava Procurement Buddy and load context at session start | An agent that knows who it is talking to before the first turn | 10 minutes |

### Objective

Create the agent and its **Create purchase request** tool, then add a **Start (pre-loop)** hook that returns `additionalContext` at the beginning of every conversation.

---

### Step-by-step instructions

#### Create the agent

1. In [copilotstudio.preview.microsoft.com](https://copilotstudio.preview.microsoft.com/), select **Agents** in the left navigation, then **New agent**. This creates an agent on the **GitHub Copilot harness** — do **not** pick *Build using standard orchestration*; hooks only exist on the GitHub Copilot harness.

1. Name the agent:

    ```text
    Zava Procurement Buddy
    ```

1. Paste these **Instructions**:

    ```text
    You help Zava employees raise purchase requests.

    Collect the supplier, a short description of what is being bought, the amount, the currency and the employee's cost center, then use the Create purchase request tool to submit it. Ask only for the details that are missing. Confirm the purchase request number once it is created.

    If a request is blocked, explain why in plain language and help the employee choose an alternative.

    Be friendly and concise.
    ```

    > [!NOTE]
    > Notice what is **not** in there: nothing about personal data, nothing about approved suppliers. Those rules are about to be enforced by hooks, which run whether or not the model remembers them.

1. Select **Save**.

<!-- TODO screenshot: images/uc1-agent-created.png — Zava Procurement Buddy saved with instructions -->

#### Create the Create purchase request tool

The tool does not reach a real system. It returns a fake purchase request number so you can see whether it ran.

1. In the component rail, select **Tools** → **+ Add a tool** → **Workflow** → **New workflow**. The workflow designer opens with a **When an agent calls the flow** trigger and a **Respond to the agent** node.

1. Rename the workflow to **Create purchase request**.

1. On **When an agent calls the flow**, add these inputs:

    | Input | Type | Description |
    |-------|------|-------------|
    | `supplier` | Text | Name of the supplier to buy from |
    | `description` | Text | What is being bought |
    | `amount` | Number | Total amount of the purchase |
    | `currency` | Text | Three-letter currency code, for example EUR |
    | `costCenter` | Text | The employee's cost center |

1. On **Respond to the agent**, add a Text output named `prNumber` and set its value with this expression:

    ```text
    concat('PR-', string(rand(10000, 99999)))
    ```

1. **Save** and **Publish** the workflow, then return to the agent and confirm **Create purchase request** is listed under **Tools**. Give it this description if it has none:

    ```text
    Submits a purchase request for a Zava employee and returns the purchase request number.
    ```

1. **Save** the agent.

<!-- TODO screenshot: images/uc1-tool-workflow.png — Create purchase request workflow with five inputs and prNumber output -->

#### Add the Start (pre-loop) hook

1. On the top menu bar, select the three dots (**…**) → **Hooks** → **Create**.

1. Set **Event type** to **Start (pre-loop)** and **Name** to:

    ```text
    Load requester context
    ```

1. Select **New workflow**. The designer opens with a starter workflow: **When an agent calls the flow** already carries the `event`, `timestamp` and `metadata` inputs, and **Respond to the agent** already carries the `additionalContext` output.

    > [!TIP]
    > Keep the starter input and output names exactly as they are. If you rename or remove them, the workflow no longer matches the event and disappears from the hook's **Workflow** list.

1. Between the two nodes, add a **Compose** action. Set its input to `metadata` → `userAadObjectId` from the dynamic content picker (type **`/`**).

1. On **Respond to the agent**, set `additionalContext` to the text below, then replace `{OUTPUT}` with the **Outputs** of the **Compose** step from the dynamic content picker:

    ```text
    The SessionStart hook was executed, print this as output with lots of smileys, include the: {OUTPUT}
    ```

1. **Save** and **Publish** the workflow. When the designer closes, you are back on **Add hook** with the new workflow selected. Select **Done**, then **Save** the agent.

<!-- TODO screenshot: images/uc1-sessionstart-workflow.png — Compose of userAadObjectId feeding additionalContext -->

#### Test it

1. In the test pane, start a **new conversation** — the hook only fires when a session begins — and send:

    ```text
    Hi
    ```

1. The reply should announce that the SessionStart hook ran, with plenty of smileys and a GUID — your Microsoft Entra object ID.

1. Open the activity / trace for the turn and find the hook. You can see the `additionalContext` it returned, attached to your first message.

<!-- TODO screenshot: images/uc1-sessionstart-test.png — test pane reply with smileys and object ID, plus trace -->

> [!NOTE]
> You did not type your ID, and the instructions say nothing about smileys. The hook supplied both. In production this is where you would look up the employee's cost center, approval limit and preferred language — and the agent would simply know them.

---

### 🏅 Congratulations! You've completed Use Case #1!

---

### Test your understanding

* Why does the hook only fire when you start a new conversation, and not on every message?
* The workflow uses `userAadObjectId` rather than `userId`. What would go wrong with `userId` in Microsoft Teams?
* What would you return from this hook in a real Zava deployment?

---

## 🧱 Use Case #2: Redact personal data before the agent sees it

Employees paste whatever they have to hand into the chat — a supplier's bank details, a personal email address, a card number. Procurement does not need any of it, and Zava does not want the model to process it.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Redact personal data before the agent sees it | Personal and financial data never reaches the model | 10 minutes |

### Objective

Add a **User prompt submitted** hook whose workflow classifies every prompt. Prompts without personal data pass through unchanged; prompts with personal data are rewritten by an inline agent and returned as `modifiedPrompt`.

---

### Step-by-step instructions

#### Create the hook and its workflow

1. **…** → **Hooks** → **Create**. Set **Event type** to **User prompt submitted** and **Name** to:

    ```text
    Redact personal data
    ```

1. Select **New workflow**. The starter workflow receives `prompt` and returns `modifiedPrompt` and `suppressOutput`.

#### Classify the prompt

1. After **When an agent calls the flow**, add a **Classify** node. Pick the default model if none is selected, and set the text to classify to `prompt` from the dynamic content picker.

1. Add a category named `Contains PII` with this description:

    ```text
    The text contains personal or financial data: names of private individuals, a personal email address or phone number, a home address, a national ID or social security number, an IBAN or bank account number, or a credit card number.
    ```

1. Add a second category named `No PII` with this description:

    ```text
    The text contains no personal or financial data. Company names, supplier names, product descriptions, amounts, currencies and cost centers are not personal data.
    ```

    > [!NOTE]
    > The Classify node also creates a **Default** branch for anything that matches neither category. Treat it like **No PII** in this lab.

1. Use the **Test** tab on the Classify node with each of these and confirm the category:

    ```text
    I need 20 office chairs from Fabrikam, about 3,000 EUR, cost center ZA-4410.
    ```

    ```text
    Please pay Fabrikam to IBAN NL91 ABNA 0417 1643 00 and send the invoice to jan.devries@outlook.com.
    ```

<!-- TODO screenshot: images/uc2-classify-categories.png — Classify node with Contains PII / No PII -->

#### Pass clean prompts through

1. On the **No PII** branch (and the **Default** branch), add **Respond to the agent** and set `modifiedPrompt` to `prompt`. Leave `suppressOutput` empty.

#### Redact with an inline agent

1. On the **Contains PII** branch, add an **Agent** node. Leave the agent dropdown on **New agent for this workflow**.

1. Paste these **Instructions**, then replace `{PROMPT}` with `prompt` from the dynamic content picker (type **`/`**):

    ```text
    Rewrite the text below, replacing every piece of personal or financial data with a typed placeholder in capitals and square brackets, for example [NAME REDACTED], [EMAIL REDACTED], [PHONE REDACTED], [ADDRESS REDACTED], [NATIONAL ID REDACTED], [IBAN REDACTED], [CARD NUMBER REDACTED].

    Do not change anything else. Keep company names, supplier names, products, amounts, currencies and cost centers exactly as written.

    After the rewritten text, add one new line:
    (Note to agent: personal or financial data was removed from this message before you received it. Tell the user it was removed and ask them not to share personal or financial data in this chat.)

    Return only the rewritten text and the note. No explanation, no quotes, no formatting.

    Text:
    {PROMPT}
    ```

1. After the Agent node, add **Respond to the agent** and set `modifiedPrompt` to the agent's response from the dynamic content picker.

1. **Save** and **Publish** the workflow, select **Done**, then **Save** the agent.

<!-- TODO screenshot: images/uc2-redaction-workflow.png — Classify branches, inline agent and both Respond nodes -->

#### Test it

1. Start a new conversation in the test pane and send the clean prompt:

    ```text
    I need 20 office chairs from Fabrikam, about 3,000 EUR, cost center ZA-4410.
    ```

    The agent carries on as normal. In the trace, the hook ran and `modifiedPrompt` is identical to what you typed.

1. Now send the prompt with personal data:

    ```text
    Please order 5 laptop stands from Fabrikam for 250 EUR, cost center ZA-4410. Pay to IBAN NL91 ABNA 0417 1643 00 and send the invoice to jan.devries@outlook.com.
    ```

1. The agent tells you personal data was removed and asks you not to share it. In the trace, `modifiedPrompt` shows `[IBAN REDACTED]` and `[EMAIL REDACTED]` — that is the only version the model worked with. The supplier, amount and cost center survived.

<!-- TODO screenshot: images/uc2-redaction-test.png — trace showing original prompt vs modifiedPrompt -->

> [!IMPORTANT]
> The hook changes what the **model** sees. It does not erase what Copilot Studio has already received — the original prompt still reaches the hook workflow and can appear in transcripts. Configure transcript access and retention separately.

---

### 🏅 Congratulations! You've completed Use Case #2!

---

### Test your understanding

* Why use a Classify node first instead of sending every prompt to the inline agent?
* Why typed placeholders like `[IBAN REDACTED]` rather than asterisks?
* Could you get the same result by adding "never repeat personal data" to the agent's instructions? What is the difference?

---

## 🧱 Use Case #3: Block unapproved suppliers before the tool runs

Zava buys from five approved suppliers. A purchase request for anyone else must not be created — no matter how the conversation got there.

| Use case | Value added | Estimated effort |
|----------|-------------|------------------|
| Block unapproved suppliers before the tool runs | A business rule the agent cannot talk its way around | 10 minutes |

### Objective

Add a **Pre tool use** hook scoped to **Create purchase request**. Its workflow checks `parameters.supplier` against an approved list and returns `deny` with a reason and the list of alternatives when the supplier is not on it.

---

### Step-by-step instructions

#### Create the hook and its workflow

1. **…** → **Hooks** → **Create**. Set **Event type** to **Pre tool use** and **Name** to:

    ```text
    Check approved supplier
    ```

1. In **Tools**, select **Create purchase request**. The hook now fires only for that tool.

1. Select **New workflow**. The starter workflow receives `toolName` and `parameters` and returns `permissionDecision`, `permissionDecisionReason`, `modifiedParameters`, `additionalContext` and `suppressOutput`.

#### Load the approved supplier list

1. After the trigger, add a **Compose** action, rename it **Approved suppliers**, and paste:

    ```json
    ["Fabrikam", "Northwind Traders", "Litware", "Adventure Works", "Wide World Importers"]
    ```

#### Check the supplier

1. Add a **Condition**. Switch the left side to expression mode (**`</>`**) and paste:

    ```text
    contains(split(toLower(join(outputs('Approved_suppliers'), '|')), '|'), toLower(trim(string(triggerBody()?['parameters']?['supplier']))))
    ```

    Set the operator to **is equal to** and the right side to `true`.

    > [!TIP]
    > The expression lower-cases both sides, so `fabrikam` and `Fabrikam` match, but `Fabrikam Inc.` does not — it is an exact, case-insensitive match. If your trigger action has a different name, or `parameters` arrives as text rather than an object, pick `parameters` → `supplier` from the dynamic content picker instead, or wrap it as `json(triggerBody()?['parameters'])?['supplier']`. Check a real run in the trace if in doubt.

#### Return the decision

1. On the **True** branch (approved), add **Respond to the agent** and leave **every output empty**. Empty means *allow*: the tool runs with its original parameters.

1. On the **False** branch (not approved), add **Respond to the agent** and set:

    | Output | Value |
    |--------|-------|
    | `permissionDecision` | `deny` |
    | `permissionDecisionReason` | `This supplier is not on Zava's approved supplier list, so the purchase request was not created.` |
    | `additionalContext` | `Approved Zava suppliers: @{join(outputs('Approved_suppliers'), ', ')}. Offer these to the user and ask which one to use instead.` |

    Leave `modifiedParameters` empty and `suppressOutput` false.

1. **Save** and **Publish** the workflow, select **Done**, then **Save** the agent.

<!-- TODO screenshot: images/uc3-pretool-workflow.png — Approved suppliers compose, condition and deny branch outputs -->

#### Test it

1. Start a new conversation and send:

    ```text
    Order 10 standing desks from Tailspin Toys for 4,500 EUR, cost center ZA-4410.
    ```

1. The agent tries to call **Create purchase request**, the hook denies it, and the agent explains that Tailspin Toys is not an approved supplier and offers the five that are. No purchase request number is returned.

1. Reply:

    ```text
    Use Fabrikam instead.
    ```

1. This time the hook allows the call, the tool runs, and the agent confirms a `PR-` number.

1. Open the trace for both turns. In the first, find the **Pre tool use** hook, the proposed `parameters` with `supplier: Tailspin Toys`, and the `deny` decision — the tool itself never ran. In the second, the hook returned nothing and the tool ran.

<!-- TODO screenshot: images/uc3-pretool-deny.png — trace showing deny for Tailspin Toys -->
<!-- TODO screenshot: images/uc3-pretool-allow.png — trace showing allowed call and PR number for Fabrikam -->

> [!IMPORTANT]
> **Hooks fail open.** If the hook workflow errors or times out, the tool call goes ahead. A rule that *must* hold — such as the approved supplier list — also has to be enforced by the purchasing system behind the tool. The hook stops the agent from trying; the backend stops the purchase.

---

### 🏅 Congratulations! You've completed Use Case #3!

---

### Test your understanding

* **Pre tool use** is the only hook event that can block an action. Why does `permissionDecisionReason` alone not lead to a good user experience, and what does `additionalContext` add?
* What would happen if you left the **Tools** field empty?
* Why is the approved supplier list in the hook rather than in the agent's instructions?

---

## 🎁 Bonus: Try it yourself

Time left? Each idea below reuses what you just built. There are no step-by-step instructions — pick the event, build the workflow, test it in a new conversation and read the trace.

| Idea | Event | What to return |
|------|-------|----------------|
| **Fix instead of block.** Normalise the currency to `EUR`, or overwrite `costCenter` with the requester's real cost center, so a sloppy call is corrected rather than refused | **Pre tool use** | `modifiedParameters` with the corrected arguments |
| **Spend limit.** Deny any purchase request above 5,000 and tell the agent to route the employee to their manager | **Pre tool use** | `permissionDecision` = `deny`, a reason, and guidance in `additionalContext` |
| **Tidy the confirmation.** Add the expected approval time and approver to the purchase request result, or write every created request to a list for auditing | **Post tool use** | `modifiedResult`, or nothing (log only) |
| **Guide the retry.** Make **Create purchase request** fail when `costCenter` is empty and tell the agent to ask the user for it | **After tool failure** | `additionalContext` with the guidance |
| **A friendlier error.** Replace a generic failure with a Zava-branded message and skip the failing step | **Error** | `userNotification`, `errorHandling` = `skip` |
| **Stay on topic.** Classify prompts as *Procurement* or *Off-topic* and rewrite off-topic prompts into a polite redirect | **User prompt submitted** | `modifiedPrompt` |

---

## 🏆 Summary of learnings

* **Hooks run on events, not on judgement.** The agent never chose to load your identity, redact a prompt or check a supplier. The runtime did, because the event fired.
* **Each event changes a different thing.** Start (pre-loop) adds context, User prompt submitted replaces the prompt, Pre tool use allows, modifies or denies a tool call.
* **A hook is just a workflow with a fixed contract.** Inputs and outputs are defined by the event; between them you can use anything a workflow can — Compose, Condition, Classify, an inline agent.
* **Deny with a reason and a way forward.** The agent recovered from the blocked request because `additionalContext` told it which suppliers were allowed.
* **Instructions stayed short.** Three rules were added to the agent's behaviour without a single extra line in its instructions.

---

## 🔍 Conclusions and recommendations

* **Use a hook when it must happen every time.** If a step only sometimes matters, it belongs in a tool or a Skill. If it must run on every session, prompt or tool call, it is a hook.
* **Keep the starter field names.** They are how Copilot Studio matches a workflow to an event.
* **Classify before you transform.** A cheap classification step keeps the inline agent — and its latency — off prompts that don't need it.
* **Design for fail-open.** Hooks currently fail open. Enforce rules that must hold in the system behind the tool as well, and treat the hook as the first line, not the only one.
* **Remember what redaction does not do.** `modifiedPrompt` changes what the model sees, not what was received. Manage transcript access and retention separately.

---
