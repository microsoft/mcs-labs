---
layout: lab
lab_format: missions
module: %%MODULE_SLUG%%
title: "%%TITLE%%"
order: %%ORDER%%
duration: %%DURATION%%
difficulty: %%LEVEL%%
lab_type: local
section: %%SECTION%%
journeys: [%%JOURNEYS%%]
description: "%%ONE_SENTENCE_DESCRIPTION%%"
classes: wide
author_profile: false
toc: false
# While in review, uncomment the next three lines and list the lab only in a preview event.
# unlisted: true
# search: false
# sitemap: false
mission_lab:
  headline: "%%HEADLINE_START%%"
  headline_emphasis: "%%HEADLINE_END%%"
  promise: "%%ONE_SENTENCE_PROMISE: how many missions, what the learner discovers.%%"
  hero_image:
    # Theme-neutral content (a slide, a report), not dark product chrome. No src_dark.
    src: /labs/%%SLUG%%/images/%%HERO%%.webp
    alt: "%%HERO_ALT%%"
    width: %%HERO_WIDTH%%
    height: %%HERO_HEIGHT%%
    caption: "%%HERO_CAPTION: the finish line, in one sentence.%%"
  scenario: |
    %%SCENARIO: who the learner is and what they must deliver, in two or three sentences.%%
  # TEMPLATE NOTE (delete): prepared accounts skip this expandable setup. Do not add runner checks or tenant warnings to learner steps. Test provenance belongs in logs/PRs, not lab.validation.
  self_setup: |
    %%INDEPENDENT_TENANT_SETUP_ONLY%%
  prerequisites:
    - "For an event, use the provided or pre-provisioned account; sign in when prompted and ask the organizer if anything is missing."
    # TEMPLATE NOTE (delete): keep the next line when learners check results in a business app (system of record); otherwise delete it.
    - "In another tab, open [%%SYSTEM_OF_RECORD%%](%%SYSTEM_OF_RECORD_URL%%), the %%KIND_OF_APP%% in this scenario. %%WHAT_IT_IS_IN_ONE_SENTENCE%% Use it to %%WHAT_TO_CHECK_THERE%%."
  pacing: "Plan %%DURATION%% minutes for %%CORE_MISSION_VERBS_WITH_ARROWS%%. %%OPTIONAL_MISSIONS%% are optional extensions. These are working budgets, not guaranteed run times."
  missions:
    - id: %%MISSION_1_ID%%
      verb: %%MISSION_1_VERB%%
      title: "%%MISSION_1_TITLE%%"
      minutes: %%MISSION_1_MINUTES%%
      tool: %%MISSION_1_TOOL%%
      brief: "%%WHY_THIS_MISSION_MATTERS_IN_ONE_SENTENCE%%"
      outcome: "%%WHAT_THE_LEARNER_HAS_AT_THE_END%%"
      # TEMPLATE NOTE (delete): optional; omit when outcome suffices. Plain text, not steps or a completion gate. Mirror at the mission's end in both bodies.
      result_check: "%%OBSERVABLE_RESULT_AND_WHERE_TO_VERIFY_IT%%"
      steps:
        - title: "%%STEP_TITLE%%"
          instruction: "%%VERB_FIRST_INSTRUCTION_WITH_BOLD_UI_LABELS%%"
          help: |
            1. %%DETAILED_CLICK_PATH_FOR_LEARNERS_WHO_NEED_IT%%
          screenshot:
            title: %%SHORT_NAME_FOR_THE_SCREENSHOT_BUTTON%%
            src: /labs/%%SLUG%%/images/%%IMAGE%%.webp
            src_dark: /labs/%%SLUG%%/images/%%IMAGE%%-dark.webp
            alt: "%%STATE_SHOWN_IN_THE_SCREENSHOT%%"
            width: %%IMAGE_WIDTH%%
            height: %%IMAGE_HEIGHT%%
            caption: "%%WHAT_TO_NOTICE%%"
        - title: "%%PROMPT_STEP_TITLE%%"
          instruction: "Send the prompt. %%WHAT_TO_WATCH_WHILE_IT_WORKS%%"
          prompt_label: %%WHERE_TO_PASTE_IT%%
          prompt: "%%PROMPT_VERBATIM%%"
          notice: "%%THE_ONE_THING_TO_NOTICE%%"
      reveal:
        title: "%%REVEAL_QUESTION%%"
        line: "%%REVEAL_ONE_LINER%%"
        explanation: "%%WHY_IT_WORKED_AFTER_THE_LEARNER_SAW_IT%%"
        flow: ["%%FLOW_1%%", "%%FLOW_2%%", "%%FLOW_3%%"]
      check:
        question: "%%MISCONCEPTION_AS_A_QUESTION%%"
        options:
          - text: "%%PLAUSIBLE_WRONG_ANSWER%%"
            correct: false
            feedback: "%%WHY_IT_IS_WRONG%%"
          - text: "%%RIGHT_ANSWER%%"
            correct: true
            feedback: "%%WHY_IT_IS_RIGHT%%"
      stuck:
        - problem: "%%LIKELY_PROBLEM%%"
          solution: "%%WHAT_TO_DO%%"

    - id: %%MISSION_2_ID%%
      verb: %%MISSION_2_VERB%%
      title: "%%MISSION_2_TITLE%%"
      optional: true
      minutes: %%MISSION_2_MINUTES%%
      tool: %%MISSION_2_TOOL%%
      brief: "%%BRIEF%%"
      outcome: "%%OUTCOME%%"
      steps:
        - title: "%%STEP_TITLE%%"
          instruction: "%%INSTRUCTION%%"
          prompt_label: %%WHERE_TO_PASTE_IT%%
          prompt: |-
            %%MULTILINE_PROMPT_VERBATIM%%
      reveal:
        title: "%%REVEAL_QUESTION%%"
        line: "%%REVEAL_ONE_LINER%%"
        explanation: "%%EXPLANATION%%"
        flow: ["%%FLOW_1%%", "%%FLOW_2%%"]
  finish:
    title: "%%FINISH_TITLE%%"
    message: "%%WHAT_CHANGED_FOR_THE_LEARNER%%"
    takeaways:
      - label: %%CONCEPT%%
        text: "%%ONE_LINE_TAKEAWAY%%"
    # The page stores the learner's answer only in their browser and offers Save a PDF copy.
    reflection: "%%QUESTION_THAT_TRANSFERS_THE_SKILL_TO_THEIR_WORK%%"
    cleanup: "%%HOW_TO_STOP_ANYTHING_RECURRING_THE_LAB_CREATED, or delete this key%%"
  sources:
    - title: %%LEARN_PAGE_TITLE%%
      url: %%LEARN_PAGE_URL%%
---

# %%TITLE%%

%%ONE_SENTENCE_DESCRIPTION%%

## Lab Details

| Level | Persona | Duration | Finish line |
| --- | --- | --- | --- |
| %%LEVEL%% | %%PERSONA%% | %%DURATION%% minutes | %%FINISH_LINE%% |

For an event, use the provided or pre-provisioned account and sign in when prompted; ask the organizer if anything is missing. Use a separate browser profile or private window; do not use a personal or production account.

In your own tenant only: %%MINIMUM_REQUIRED_TENANT_SETUP%%

<!-- TEMPLATE NOTE (delete): keep the next paragraph when learners check results in a business app; otherwise delete it. Mirror it in the README. -->
Keep [%%SYSTEM_OF_RECORD%%](%%SYSTEM_OF_RECORD_URL%%) open in another tab. It is the %%KIND_OF_APP%% in this scenario: %%WHAT_IT_IS%%. Use it to %%WHAT_TO_CHECK_THERE%%.

Plan **%%DURATION%% minutes for the core missions**. %%OPTIONAL_MISSIONS%% are **optional extensions**. These are working budgets, not guaranteed run times.

## Table of Contents

- [%%MISSION_1_VERB%%: %%MISSION_1_SHORT%%](#%%MISSION_1_ANCHOR%%)
- [%%MISSION_2_VERB%%: %%MISSION_2_SHORT%% (optional)](#%%MISSION_2_ANCHOR%%)
- [Take it with you](#take-it-with-you)

## %%MISSION_1_VERB%%: %%MISSION_1_SHORT%%

**%%MISSION_1_MINUTES%% minutes · %%MISSION_1_TOOL%%**

1. %%VERB_FIRST_INSTRUCTION_WITH_BOLD_UI_LABELS%%
2. Send:

```text
%%PROMPT_VERBATIM%%
```

%%WHAT_TO_NOTICE%%

<picture><source media="(prefers-color-scheme: dark)" srcset="images/%%IMAGE%%-dark.webp"><img src="images/%%IMAGE%%.webp" alt="%%SHORT_ALT%%"></picture>

**Quick check:** %%MISCONCEPTION_AS_A_QUESTION%% **%%ANSWER%%.** %%WHY%%

**If %%LIKELY_PROBLEM%%:** %%WHAT_TO_DO%%

<!-- TEMPLATE NOTE (delete): omit this paragraph if result_check is not used. -->
**Check your result:** %%OBSERVABLE_RESULT_AND_WHERE_TO_VERIFY_IT%%

## %%MISSION_2_VERB%%: %%MISSION_2_SHORT%%

**Optional · %%MISSION_2_MINUTES%% minutes · %%MISSION_2_TOOL%%**

Send:

```text
%%MULTILINE_PROMPT_VERBATIM%%
```

## Take it with you

%%TAKEAWAYS_IN_ONE_PARAGRAPH%%

%%REFLECTION_QUESTION%%

![%%HERO_ALT%%](images/%%HERO%%.webp)

### Product guidance

- [%%LEARN_PAGE_TITLE%%](%%LEARN_PAGE_URL%%)

Product UI and available capabilities can vary by tenant. Screenshots show the training experience; generated results will differ.
