/*
 * Mock content for the "Lab format v2" prototype.
 *
 * The shape deliberately mirrors the front matter a future Jekyll
 * `lab-mission` layout could read from `_labs/<slug>.md`, so authors would
 * write structured fields (brief, predict, steps, aha...) instead of free
 * prose. Everything here is fictional: Contoso, Fabrikam, the plugin names
 * and the UI paths are placeholders until the real lab details exist.
 */
window.LAB = {
  id: 'cowork-question-to-app',
  title: 'From a question',
  titleEm: 'to a working app.',
  promise: 'One customer renewal. Four missions. Watch Copilot go from answering your questions to building your tools.',
  minutes: 45,
  level: 200,

  story: {
    who: 'You',
    role: 'Account manager · Contoso',
    headline: 'Fabrikam renews on Friday.',
    text: 'Your largest customer is up for renewal and you have 45 minutes to get ready. Everything you need is somewhere in Microsoft 365, and in the CRM.',
    folder: 'OneDrive › Documents › Sales › Fabrikam'
  },

  kit: [
    { icon: 'docx', name: 'Fabrikam_Renewal_Amendment_2025.docx' },
    { icon: 'pdf', name: 'Fabrikam_MSA_2024.pdf' },
    { icon: 'pptx', name: 'QBR_Q3_Fabrikam.pptx' },
    { icon: 'xlsx', name: 'Support_Tickets_Fabrikam_Q3.xlsx' },
    { icon: 'xlsx', name: 'NPS_Survey_2026_Fabrikam.xlsx' },
    { icon: 'csv', name: 'Product_Usage_Fabrikam.csv' },
    { icon: 'mail', name: 'Email · “Fabrikam: pricing concerns”' },
    { icon: 'teams', name: 'Teams recap · “Fabrikam renewal kickoff”' }
  ],
  systems: [
    { icon: 'crm', name: 'Dynamics 365 · Fabrikam account', detail: '3 opportunities, 14 cases' },
    { icon: 'dv', name: 'Dataverse · Renewal Commitment table', detail: 'Empty, waiting for your app' }
  ],

  prereqs: [
    { text: 'Signed in to **Microsoft 365 Copilot** with your lab account', link: { label: 'Open Copilot', href: 'https://copilot.cloud.microsoft/chat?auth=2' } },
    { text: 'The **Fabrikam** folder is in OneDrive › Documents › Sales (8 files)' },
    { text: 'Plugins **Contoso Sales CRM** and **Power Apps** appear in Cowork' }
  ],

  ladder: [
    { id: 'ask', verb: 'Ask', you: 'You ask a question', it: 'It answers, with sources', scale: 'Seconds', surface: 'Copilot Chat' },
    { id: 'delegate', verb: 'Delegate', you: 'You hand over an outcome', it: 'It plans and does the work', scale: 'Minutes', surface: 'Cowork' },
    { id: 'connect', verb: 'Connect', you: 'You plug in a system', it: 'It works with live data', scale: 'Your business', surface: 'Cowork + plugin' },
    { id: 'build', verb: 'Build', you: 'You describe a tool', it: 'It builds the tool', scale: 'Software', surface: 'Cowork + Power Apps' }
  ],

  missions: [
    {
      id: 'ask',
      title: 'The answer you never filed',
      minutes: 8,
      surface: 'Copilot Chat',
      makes: 'A sourced answer, a 3-slide brief and a meeting',
      artifact: 'chat',
      outcome: 'A sourced answer',
      brief: 'Your manager pings you: “What discount did we promise Fabrikam last year?” You weren’t in that meeting, and you have no idea which file it’s in.',
      goal: 'Find the agreed Fabrikam discount with sources, turn it into a 3-slide brief, and book a review with Claudia.',
      predict: {
        q: 'Where will Copilot find the answer?',
        options: ['The contract PDF', 'An email thread', 'A Teams meeting recap', 'Nowhere: you’ll have to attach the file'],
        reveal: 'In two places: the renewal amendment (§4.2) and the kickoff meeting recap. Copilot cross-checked them, and you attached nothing.'
      },
      steps: [
        { text: 'Open **Copilot Chat** and check that **Work** is selected, not Web.', link: { label: 'Open Copilot Chat', href: 'https://copilot.cloud.microsoft/chat?auth=2' }, show: 'toggle' },
        { text: 'Ask the question. Don’t attach anything.', prompt: 'What discount did we agree with Fabrikam for the 2026 renewal, under what conditions, and who approved it?' },
        { text: 'Hover a citation number to see exactly where the answer came from.' },
        { text: 'Turn it into slides.', prompt: 'Turn that into a 3-slide PowerPoint for my manager: the agreed terms, the risk if Fabrikam signs for only one year, and what we need from her.' },
        { text: 'Book the review.', prompt: 'Set up a 30-minute Teams meeting with Claudia Mazzanti on Thursday afternoon to review the Fabrikam renewal. Attach the deck and suggest an agenda.' }
      ],
      watch: [
        'The **sources** under the answer: files you’ve never opened.',
        'Copilot keeps context: “that” in step 4 means the discount.',
        'It **drafts** the invite. Nothing is sent until you click Send.'
      ],
      result: { mock: 'chat', caption: 'An answer with numbered sources from the Fabrikam folder.' },
      aha: {
        line: 'You never told it where to look.',
        sub: '**Work IQ** grounds Copilot in your files, mail, meetings and people (only what you can already access) and shows its sources so you can check.',
        flow: ['Your question', 'Work IQ', 'Files · Mail · Meetings', 'Answer + sources']
      },
      check: {
        q: 'Copilot answered from a file you’d never opened. What made that possible?',
        options: [
          { t: 'It searched the public web', why: 'The Work toggle keeps it inside your Microsoft 365 content.' },
          { t: 'Work IQ searched the Microsoft 365 content you can already access', ok: true, why: 'Right: grounding, with your permissions. It can’t see what you can’t.' },
          { t: 'Someone shared the file with Copilot', why: 'Copilot inherits your access. There is nothing extra to share.' }
        ]
      },
      remix: 'Without a ready-made prompt: find out who at Contoso has been in touch with Fabrikam most this month, and what they discussed.',
      stuck: [
        { q: 'The answer comes from the web.', a: 'Switch the toggle at the top of the chat to **Work** and ask again.' },
        { q: '“I couldn’t find information about…”', a: 'Check that the Fabrikam folder is in your OneDrive. New files can take a few minutes to be searchable.' },
        { q: 'No PowerPoint file appears.', a: 'Ask: “Create it as a PowerPoint file.” Then open it from the link in the reply.' }
      ]
    },
    {
      id: 'delegate',
      title: 'Hand over the homework',
      minutes: 12,
      surface: 'Copilot Cowork',
      makes: 'An interactive HTML account health report',
      artifact: 'report',
      outcome: 'An HTML health report',
      brief: 'Before Friday you need the full picture: eight files, three months of tickets, a survey and a usage export. You have twelve minutes.',
      goal: 'Have Cowork read the whole Fabrikam folder and build an interactive HTML account health report.',
      predict: {
        q: 'Cowork gets eight files and one paragraph of instructions. What does it do first?',
        options: ['Starts writing the report', 'Asks you clarifying questions', 'Writes itself a plan', 'Opens the biggest file'],
        reveal: 'It writes a plan: a to-do list it then works through, ticking items off. That plan is the difference between answering and working.'
      },
      steps: [
        { text: 'Switch to **Cowork** with the Chat / Cowork toggle.', link: { label: 'Open Copilot Cowork', href: 'https://copilot.cloud.microsoft/cowork?auth=2' } },
        { text: 'Hand over the brief.', prompt: 'Build an interactive HTML account health report for Fabrikam from all the files in my OneDrive folder Documents/Sales/Fabrikam.\n\nInclude an overall health score (0–100) and how you calculated it, the top 3 risks and top 3 opportunities with evidence from the files, a timeline of this year’s key events, and a one-paragraph renewal recommendation.\n\nMake it a single self-contained HTML file in Contoso colours and save it to the same folder.', show: 'plan' },
        { text: 'If Cowork shows you its plan, read it, then approve.' },
        { text: 'Step away. Answer the quick check below while it works.' },
        { text: 'Open the HTML file Cowork saved and click around.' }
      ],
      watch: [
        'The **plan**: Cowork’s own to-do list, ticked off as it goes.',
        'Which **files** it opens, and in what order.',
        'A **self-check** before it hands the work back.'
      ],
      result: { mock: 'report', caption: 'Yours will differ: every run reasons afresh. Look for a score, evidence and a recommendation.' },
      aha: {
        line: 'Chat answers. Cowork works.',
        sub: 'You handed over an **outcome**, not a question. Cowork planned, read eight files, built a working artifact and checked it, while you did something else.',
        flow: ['Your brief', 'Plan', 'Read · Reason · Build', 'Self-check', 'Artifact']
      },
      check: {
        q: 'Which request belongs in Cowork rather than Chat?',
        options: [
          { t: '“What’s our travel policy for Europe?”', why: 'One quick answer: Chat is perfect for that.' },
          { t: '“Read the 12 supplier contracts in this folder and build a comparison dashboard.”', ok: true, why: 'Many sources, several steps, a real deliverable. That’s Cowork.' },
          { t: '“Make this sentence sound more formal.”', why: 'One step, instant result: stay in Chat.' }
        ]
      },
      remix: 'Ask Cowork to refresh this report every Monday at 8:00 and email you only what changed.',
      stuck: [
        { q: 'Cowork can’t find the folder.', a: 'Type **#** in the prompt box and pick the Fabrikam folder from OneDrive.' },
        { q: 'It has been running for 6+ minutes.', a: 'Normal for eight files. Open **My tasks** to watch its progress.' },
        { q: 'The report looks plain.', a: 'Ask: “Make it look like a polished executive dashboard.” Iterating is part of the job.' }
      ]
    },
    {
      id: 'connect',
      title: 'Bring in the live numbers',
      minutes: 12,
      surface: 'Cowork + CRM plugin',
      makes: 'A 6-slide renewal deck built on live CRM data',
      artifact: 'deck',
      outcome: 'A live-data deck',
      brief: 'Your manager wants a renewal deck with real pipeline numbers. Those aren’t in any file. They live in Dynamics 365.',
      goal: 'Turn on the Contoso Sales CRM plugin and have Cowork build a 6-slide renewal deck from live CRM data and your health report.',
      predict: {
        q: 'Without a plugin, you ask Cowork for Fabrikam’s open pipeline. What happens?',
        options: ['It invents plausible numbers', 'It says it can’t reach the CRM', 'It finds an old spreadsheet', 'It asks you to paste them'],
        reveal: 'Usually it can’t reach them, or it falls back on whatever stale file it finds. A plugin swaps that guesswork for live records.'
      },
      steps: [
        { text: 'Try it **without** the plugin first. Note what you get.', prompt: 'What is Fabrikam’s open pipeline value right now?' },
        { text: 'Open **Plugins** in Cowork and turn on **Contoso Sales CRM**.', show: 'plugin' },
        { text: 'Ask again, then hand over the deck.', prompt: 'Using the Contoso Sales CRM plugin, build a 6-slide renewal deck for Fabrikam: account snapshot, open opportunities and pipeline value, support cases from the last 90 days, highlights from the Fabrikam health report you created, our renewal proposal, and next steps.\n\nCite the CRM record behind every number. Save it to Documents/Sales/Fabrikam.' },
        { text: 'Open the deck. Pick any number and trace it to its CRM record.' }
      ],
      watch: [
        '**Tool calls** to the plugin, such as “get opportunities”.',
        'It **reuses** your Mission 2 report: work builds on work.',
        'Every figure comes with its **source record**.'
      ],
      result: { mock: 'deck', caption: 'Six slides, real numbers, every figure traceable to a CRM record.' },
      aha: {
        line: 'Now it knows your business, not just your documents.',
        sub: 'A **plugin** packages skills and connections to a system like Dynamics 365. Same Cowork, now with live data, inside your permissions.',
        flow: ['Your brief', 'Cowork', 'Plugin → Dynamics 365', 'Live records', 'Deck']
      },
      check: {
        q: 'What does a plugin add to Cowork?',
        options: [
          { t: 'A smarter AI model', why: 'The model doesn’t change. What changes is what it can reach and do.' },
          { t: 'Skills and connections to business systems', ok: true, why: 'Exactly: know-how plus access, packaged and shareable.' },
          { t: 'A slide template', why: 'A template can live inside a skill, but a plugin is about capabilities and data.' }
        ]
      },
      remix: 'Ask Cowork to update the Fabrikam opportunity’s next step in the CRM. Notice that it asks before it writes.',
      stuck: [
        { q: 'I don’t see the plugin.', a: 'Plugins are shared by an admin or a colleague. Ask your facilitator for **Contoso Sales CRM**.' },
        { q: 'A number looks wrong.', a: 'Ask: “Show me the CRM records behind slide 2.” Checking is part of the workflow.' }
      ]
    },
    {
      id: 'build',
      title: 'Build the tool that’s missing',
      minutes: 13,
      surface: 'Cowork + Power Apps',
      makes: 'A Dataverse app, and a deck that reads its data',
      artifact: 'app',
      outcome: 'A working app',
      brief: 'At every renewal meeting, commitments get scribbled in notebooks and lost. Build a small app that captures them in Dataverse, where the CRM can see them.',
      goal: 'Have Cowork build a “Renewal Commitments” app on a Dataverse table, add two records, then watch them land in your deck.',
      predict: {
        q: 'How much code will you write?',
        options: ['A few hundred lines', 'Some formulas', 'None', 'It depends on the table'],
        reveal: 'None. You describe the app and Cowork builds it. Your job is to review it, test it and decide whether to publish.'
      },
      steps: [
        { text: 'In Cowork, turn on the **Power Apps** plugin.' },
        { text: 'Describe the app.', prompt: 'Build a simple app called “Renewal Commitments” that stores records in the Dataverse table Renewal Commitment in my environment.\n\nColumns: Account, Commitment, Owner, Due date, Status (Open or Done). Give me a form to add a commitment and a list I can filter by account.\n\nThen publish it and send me the link.' },
        { text: 'Approve when Cowork asks to create the app in your environment.', show: 'approve' },
        { text: 'Open the link and add **two commitments** for Fabrikam.' },
        { text: 'Close the loop: go back to your Mission 3 task.', prompt: 'Add a slide to the Fabrikam deck listing the open renewal commitments from Dataverse.', note: 'loop' }
      ],
      watch: [
        'Cowork **reads the table schema** before it builds.',
        'It **asks before** creating anything in your environment.',
        'The two rows you typed appear **in the deck**.'
      ],
      result: { mock: 'app', caption: 'A working form, your rows in Dataverse, and the same rows on a new slide.' },
      aha: {
        line: 'From a question to software, in 45 minutes.',
        sub: 'The data you typed into your own app now flows into the next deck. Ask, delegate, connect, build: that’s the whole ladder.',
        flow: ['Your idea', 'Cowork', 'Power Apps + Dataverse', 'Your app', 'Your deck']
      },
      check: {
        q: 'Where did your two commitments go?',
        options: [
          { t: 'An Excel file in OneDrive', why: 'Not this time: the app writes to a governed table, not a file.' },
          { t: 'A Dataverse table', ok: true, why: 'Yes: the same data platform the CRM uses. That’s why the deck could read them.' },
          { t: 'Only inside the app', why: 'The app is just a window onto the table. The data lives in Dataverse.' }
        ]
      },
      remix: 'Ask Cowork to email each owner two days before their commitment is due.',
      stuck: [
        { q: 'Cowork says it can’t create apps.', a: 'Check that the **Power Apps** plugin is on and that you picked the lab environment.' },
        { q: 'The table doesn’t exist.', a: 'Ask Cowork to create it, or ask your facilitator for the lab environment name.' }
      ]
    }
  ],

  finale: {
    sort: [
      { s: '“Summarise what was decided in yesterday’s steering meeting.”', answer: 'ask' },
      { s: '“Every Monday, read the new support tickets and send me a triage table.”', answer: 'delegate' },
      { s: '“Put this quarter’s open opportunities from the CRM into a forecast slide.”', answer: 'connect' },
      { s: '“Give field teams a form to log site visits into our database.”', answer: 'build' }
    ]
  }
};
