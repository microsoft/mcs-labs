# Run-through evidence and coverage

Use this vocabulary in every run-through log and handoff. A completed run is not the same
as a passing run, and an observed variation is not automatically a defect.

| Status | Use when |
| --- | --- |
| **passed** | The step ran and the expected learner-visible result was independently checked. |
| **drift** | Product behavior or wording changed and the lab would now mislead the learner. |
| **defect** | The lab instruction or expected outcome was wrong or incomplete. |
| **variance** | Generated output differs but still meets the stated goal. |
| **blocked** | A prerequisite, permission, service or environment prevented the check. |
| **untested** | The step was not exercised, including voice without supplied speech or a route intentionally skipped. |
| **unverified** | An action occurred, but the result was not independently confirmed at its source or boundary. |

Keep the distinction between **core** and **optional** routes. Report coverage and counts
separately. A blocked or failed optional route does not make the core route fail; an
incomplete run must not receive an unconditional "works" verdict. A model's answer that it
searched a disabled source is not proof; a hidden sandbox trace remains unverified even if
an output file is usable. A classifier unit test does not prove the full workflow. A saved
skill accompanied by a verification warning is not a verified or loaded plugin. Retaining
existing instructions at a user's request is not a fresh pass. If feedback or a manager
handoff is absent, mark the learning/backup route untested rather than inferring success.

## Verify outcomes at their source

- Read cited source documents and inspect generated files; do not rely only on a chat
  summary or a link the model claims it created.
- Verify business records in the system of record. Check required fields, owner,
  relationships and timezone. Distinguish actuals from projections, record known-missing
  values and identify fields or writes that failed.
- Confirm an Outlook draft exists and remains unsent. A drafted schedule is not an
  executed schedule; verify the saved entry's time and timezone after save settles and
  after reload. Distinguish a schedule entry's state from the saved skill file's content.
- For a saved skill or plugin, check verification status and its actual attached tool,
  including the exact input names and descriptions. A source-editor description alone
  does not prove the connected tool has it.
- Test source switches directly. A claim that disabled sources were searched is not
  evidence of retrieval.
- Use the same short prompt in a fresh chat to test reuse; repeating a long procedure in
  the original context does not show that the saved instruction carries the behavior.
- A private create/Share dialog is not a second-account handoff. A specialist receiving a
  request does not prove that the user saw a distinct confirmation or clean final output.
- Verify positive and rejected paths separately: the executed branch and the persisted
  mailbox/record effect must agree. A safe rejection is not the positive outcome. Check
  suggested recovery against the same constraints; it must not reintroduce a refused action.
- For agent integration, distinguish discovery/connection from runtime invocation and
  the returned business result. Transport success can still contain `needs_information`.
  A "Used skill" label and correct fixture answer do not prove external reference-file
  reads; that claim needs service-side evidence. Record an unavailable boundary as unverified.

## Approval, ownership and recovery

- Imported tools can reference a connection owned by another training identity. Inspect
  the actual owner before publishing or executing. Repair only a copy you own with an
  authorized identity; otherwise record the path as blocked. Never delete or alter
  another runner's connection.
- A list's **Owner** field does not prove designer authoring or publish permission.
  Check the actual restriction before changing an asset. Use a copy only when the lab
  offers that fallback and your identity is authorized; verify its connections separately.
  A successful copy does not make the blocked original a pass or bypass another owner's rights.
- For upload or create approvals, an unresolved destination is not approval. Cancel a
  pending card first if queued questions cannot be answered, verify the destination and
  evidence that the target file/record is absent, then request a fresh fail-on-conflict
  operation. Never overwrite existing data to force a test.
- Prefer one-time permissions and revoke only permissions introduced by this run.
- When a tool hook needs recovery, publish the workflow, save the agent again, then start
  a **new** preview. Check the exact input names and descriptions on the attached tool.
  Do not silently remove a broken hook and report success.
- Failure injection must be non-destructive and prove the intended request was
  intercepted. Remove interception in `finally`; a mismatched endpoint proves nothing.
  Do not delete or corrupt live data to manufacture an error.

## Generated apps and user experience

Compare app results with the actual source dataset. Exercise values below, at and above
stated thresholds; keyboard focus and navigation; accessible names and decorative emoji;
reduced motion; narrow-screen overflow; persistence, undo and rapid saves; and error
recovery or rollback when relevant. A DOM accessibility check does not prove what a
screen-reader user hears.

Keep supplied prompts unchanged. If a repair is permitted, bound it to the same session,
republish and test the actual published version. Embedded Preview and the deployed app can
differ; publication alone may leave a stale app, where the user must select **New version
available** and **Refresh**. State which version and routes were actually tested.

## Report requirements

Every result should say what was tested, what was observed, how it was verified and what
remains untested or unverified. Keep actual behavior separate from product claims and
recommendations. Do not use "all passed" for a completed run with blocked, skipped or
unverified coverage.

Capture each attempt's reply, settled tool inputs/outputs and independent check before
starting the next turn: virtualized traces can move or disappear. Use distinct evidence
files per attempt, retaining failures alongside retries rather than overwriting them.
Keep instructor/service provenance separate from actions the learner must perform.
