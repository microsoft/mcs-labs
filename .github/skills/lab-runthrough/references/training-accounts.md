# Training accounts

Workshop and bootcamp tenants hand out throwaway user accounts. A run-through on one of
them tests the lab exactly as an attendee meets it: a new user, a fresh environment and
the event's licenses. This page records how to claim one and what to do with the
credentials. Seen in November 2026; date anything new you add.

## Ground rules

- Claim an account only when the person asked for a run-through on that event's tenant,
  and only with the event code they gave you. One account is enough for a whole curriculum:
  reuse it across labs instead of claiming more.
- Fill the registration form with the values the person gives you. Use a job title that
  identifies the run as automated testing, so the event team can tell it apart from
  attendees.
- Credentials never go into chat, logs, commits, PR bodies or the repository. Write them to
  a JSON file in a temporary folder outside the repository (`username`, `password`; keep a
  changed password's predecessor under another `*password*` key so it stays masked) and set
  `LAB_CREDENTIALS` to its path. `capture.cjs` masks them in everything it prints.
- Delete the credential file and its run-owned temporary folder only after the last
  dependent lab is done. Do not remove another run's files or a shared parent folder.

## Claiming through the Lab Assistant

The event page (for example the bootcamp's `aka.ms` link) has a side-panel agent, the Lab
Assistant. The flow, in a windowed private browser:

1. Open the event page and start the side-panel agent.
2. Enter the event code.
3. Choose **Get a User Account**, tick **I confirm I've read and agree to these terms**, and
   choose **Consent and create account**.
4. Fill the registration form. The **Industry** option reads
   **Technology (software & services)**. Submit.
5. The agent replies with the user name, a temporary password and a **Get Started** link.
   Copy them straight into the credentials file. The link text can end with a zero-width
   space (U+200B); strip it before you navigate. The link resolves to a getting-started
   page on the event tenant.
6. Sign in on that page with the temporary password. If a password change is required,
   follow the person's explicit event instructions; do not assume one event's password
   convention applies elsewhere. Save the new one in the file before submitting it,
   and keep the old one under `oldPassword` so both remain masked.
7. Answer **Stay signed in?** with **Yes**.
8. The getting-started page walks through each service (Microsoft Copilot, Teams,
   Outlook, OneDrive, Copilot Studio). Open each once: first visits trigger one-time
   dialogs that would otherwise interrupt the first lab. At the bottom, **Labs** links to
   the labs site and the event.

The agent's form and wording change between events; if the flow differs, follow what is on
screen and update this page.

## After the claim

- Each account gets a developer environment named after the user (for example
  `DEV - User AB12CD34`). Labs that say "select your environment" mean that one.
- Copilot Studio's first visit shows **Welcome from your admin** (accept the terms, then
  **Close**) and a **Find your environments here** bubble (**Got it**). Accept them once,
  windowed or headless; they do not come back.
- From then on, runs can sign in with `capture.cjs login` in the authorized browser/mode
  (see `browser-session.md`). Do not switch a requested desktop Edge run to headless.
  Pass `--forbid` with the host user's own name or alias so a run
  that lands in the wrong account stops at once.
- If sign-in starts asking for MFA, stop and hand the window to the person: do not register
  an authenticator yourself.
