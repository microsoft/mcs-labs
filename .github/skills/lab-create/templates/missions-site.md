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
  prerequisites:
    - "Use your assigned **training account** in a separate browser profile or private window. Do not use your personal or production account."
    - "%%WHAT_THE_FACILITATOR_PREPARED%%"
  pacing: "Plan %%DURATION%% minutes for %%CORE_MISSION_VERBS_WITH_ARROWS%%. %%OPTIONAL_MISSIONS%% are optional extensions. These are working budgets, not guaranteed run times."
  missions:
    - id: %%MISSION_1_ID%%
      verb: %%MISSION_1_VERB%%
      title: "%%MISSION_1_TITLE%%"
      minutes: %%MISSION_1_MINUTES%%
      tool: %%MISSION_1_TOOL%%
      brief: "%%WHY_THIS_MISSION_MATTERS_IN_ONE_SENTENCE%%"
      outcome: "%%WHAT_THE_LEARNER_HAS_AT_THE_END%%"
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

Use your assigned **training account**, not a personal or production account. %%WHAT_THE_FACILITATOR_PREPARED%%

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
