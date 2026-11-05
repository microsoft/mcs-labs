/*
 * Lab format v2 prototype renderer.
 *
 * Renders window.LAB (lab.js) into a mission-based lab page. Kept framework-free
 * on purpose: the same structure could become a Jekyll layout reading front
 * matter, with this file shrinking to the interactive bits (progress, predict,
 * reveal, check, copy).
 *
 * Optional URL params for reviews and screenshots (never saved):
 *   ?theme=light|dark  ?mode=guided|explorer  ?notes=on  ?demo=1  ?show=all
 */
(function () {
  'use strict';

  var LAB = window.LAB;
  if (!LAB) return;

  var root = document.getElementById('lab-v2-root');
  if (!root) return;
  var embedded = root.hasAttribute('data-site-theme-sync');
  var pageRoot = document.documentElement;
  var KEY = 'labv2:' + LAB.id;
  var PREFS = 'labv2:prefs';
  var qs = new URLSearchParams(location.search);
  // Demo mode shows a mid-lab state without overwriting the reviewer's own progress.
  var persist = qs.get('demo') !== '1';

  function load(k) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  }
  function store(k, v) {
    if (!persist && k === KEY) return;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ }
  }
  function blank() { return { done: {}, steps: {}, predict: {}, check: {}, aha: {}, prereq: {}, sort: {}, monday: '' }; }

  var state = Object.assign(blank(), load(KEY));
  var pageTheme = pageRoot.getAttribute('data-theme');
  var systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var initialTheme = pageTheme === 'light' ? 'light' : (pageTheme === 'dark' ? 'dark' : systemTheme);
  var prefs = Object.assign({ theme: initialTheme, mode: 'guided', notes: false }, load(PREFS));
  if (embedded) prefs.theme = initialTheme;
  if (qs.get('theme')) prefs.theme = qs.get('theme') === 'light' ? 'light' : 'dark';
  if (qs.get('mode')) prefs.mode = qs.get('mode') === 'explorer' ? 'explorer' : 'guided';
  if (qs.get('notes')) prefs.notes = qs.get('notes') === 'on';
  if (!persist) {
    state = blank();
    state.done = { ask: true, delegate: true };
    state.prereq = { 0: true, 1: true, 2: true };
    state.predict = { ask: 1, delegate: 2, connect: 0 };
    state.check = { ask: 1, delegate: 0 };
    state.aha = { ask: true, delegate: true };
    state.sort = { 0: 'ask', 1: 'connect' };
    [0, 1, 2, 3, 4].forEach(function (k) { state.steps['ask:' + k] = true; state.steps['delegate:' + k] = true; });
    state.steps['connect:0'] = true;
  }

  var save = function () { store(KEY, state); };
  var savePrefs = function () { store(PREFS, { theme: prefs.theme, mode: prefs.mode, notes: prefs.notes }); };

  /* ---------- Helpers ---------- */
  function $(s, el) { return (el || root).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }
  // Embedded in the site the theme already owns #main, so the lab's focus target is #lab-main.
  function mainEl() { return $('#lab-main') || $('#main'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Markdown-lite: authors get **bold** and `code`, nothing else, so content stays scannable.
  function md(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function mi(id) { for (var i = 0; i < LAB.missions.length; i++) if (LAB.missions[i].id === id) return i; return -1; }
  function doneCount() { return LAB.missions.filter(function (m) { return state.done[m.id]; }).length; }

  var ICONS = {
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.1-2.4 3.8M12 17h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    remix: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    notes: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    level: '<path d="M5 20v-5M12 20V9M19 20V4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    ladder: '<path d="M8 3v18M16 3v18M8 7h8M8 12h8M8 17h8"/>'
  };
  function icon(name, cls) {
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  var BADGE = { docx: 'W', pdf: 'PDF', pptx: 'P', xlsx: 'X', csv: 'CSV', mail: 'O', teams: 'T', crm: 'D', dv: 'DV', pa: 'PA', bi: 'BI' };
  function badge(type) { return '<span class="fb fb-' + type + '" aria-hidden="true">' + BADGE[type] + '</span>'; }

  /* ---------- Design notes: each component names the learning principle behind it ---------- */
  var NOTES = {
    hero: ['Outcome first', 'People read about 20% of a web page and scan for the payoff. The title, a one-line promise and the four artifacts answer “what do I get?” before any instruction.', 'Nielsen Norman Group, How users read on the web'],
    ladder: ['Advance organizer', 'One picture of the whole journey before the details gives every later step somewhere to land. Each mission is a rung, so learners always know where they are and why.', 'Ausubel (1960); Mayer, pre-training principle'],
    story: ['Situated learning', 'One customer, one deadline, one folder. A realistic context helps the skill transfer to Monday, and keeps four missions feeling like one story.', 'Lave & Wenger (1991)'],
    prereqs: ['Ready checks, not setup chapters', 'Three ticks replace the usual setup section. Anything a facilitator can prepare is prepared before the room fills up.', 'Carroll, minimalist instruction'],
    predict: ['Predict before you do', 'Guessing first, even wrongly, primes attention and makes the answer stick. The guess comes back in the Aha, so learners watch their own mental model change.', 'Richland, Kornell & Kao (2009), pretesting effect'],
    steps: ['Five steps, max', 'Short, verb-first steps with one action each. The real product is the screenshot, so the page doesn’t repeat it.', 'Carroll, The Nurnberg Funnel (1990); Mayer, segmenting'],
    show: ['Visuals on demand', '“Show me” opens a picture right next to the step that needs it, instead of 20 screenshots everyone scrolls past.', 'Mayer, spatial contiguity and coherence'],
    watch: ['Tell them where to look', 'Three things to notice while it runs. Signaling turns waiting time into learning time.', 'Mayer, signaling principle'],
    result: ['Show what good looks like', 'A clear picture of success lets learners judge their own output, which matters when every AI run is different.', 'Sadler (1989), formative assessment'],
    aha: ['Experience first, concept second', 'Do it, then name it: one line and one diagram. The idea lands on an experience the learner had a minute ago.', 'Kolb, experiential learning cycle'],
    check: ['One question, right after', 'Retrieving an idea strengthens memory more than rereading it. Every option explains itself, so a wrong answer still teaches.', 'Roediger & Karpicke (2006), testing effect'],
    remix: ['Fade the scaffolding', 'Same skill, no prompt provided. Slightly harder is what turns following into knowing.', 'Bjork, desirable difficulties; Renkl, fading worked examples'],
    stuck: ['Plan for errors', 'Known failure points live in one collapsed place, out of the way until someone needs them.', 'Carroll, error recovery in minimalist design'],
    mode: ['Guided or Explorer', 'Detailed steps help newcomers but slow experts down. Explorer tucks the steps behind the goal; the toggle is in the header.', 'Kalyuga et al. (2003), expertise reversal effect'],
    progress: ['Visible progress', 'The rail and the four-segment bar show how close the finish is, and people speed up as a goal gets nearer.', 'Kivetz, Urminsky & Zheng (2006), goal-gradient effect'],
    loop: ['End on a peak', 'The last step feeds your own app’s data into the Mission 3 deck. Everything connects, which is the moment people remember.', 'Kahneman, peak-end rule'],
    sort: ['Mix it up', 'Sorting new, mixed requests by rung makes learners tell the skills apart instead of repeating the last one.', 'Rohrer & Taylor (2007), interleaving'],
    monday: ['Leave with a plan', 'A specific when-then plan, written now, makes it much more likely the skill gets used next week.', 'Gollwitzer & Sheeran (2006), implementation intentions']
  };
  function note(key, on) {
    if (on === false || !NOTES[key]) return '';
    var n = NOTES[key];
    return '<aside class="dnote" aria-label="Design note"><span class="why">Why</span><div><strong>' + esc(n[0]) + '.</strong> ' + esc(n[1]) + '<span class="src">' + esc(n[2]) + '</span></div></aside>';
  }
  function na(key, on) { return on === false ? '' : ' data-note="' + key + '"'; }

  /* ---------- Product mocks (white Microsoft 365 windows) ---------- */
  function win(title, sub, body, end) {
    return '<div class="win"><div class="win-bar"><span class="app"></span>' + title +
      (sub ? '<span class="sub">· ' + sub + '</span>' : '') +
      (end ? '<span class="end">' + end + '</span>' : '') +
      '</div><div class="win-body">' + body + '</div></div>';
  }
  var MOCKS = {
    toggle: function () {
      return win('Microsoft 365 Copilot', 'Chat',
        '<div class="w-seg hl"><span class="on">Work</span><span>Web</span></div>' +
        '<div class="w-callout">Work = answers from your files, mail, meetings and chats</div>' +
        '<div class="w-input">Message Copilot<span class="send"></span></div>');
    },
    chat: function () {
      return win('Microsoft 365 Copilot', 'Chat',
        '<div class="w-user">What discount did we agree with Fabrikam for the 2026 renewal…?</div>' +
        '<div class="w-ans"><span class="av"></span><p>Fabrikam gets a <b>12% discount on a 3-year term</b> <span class="cite">1</span>, provided they sign before 30 June. <b>Claudia Mazzanti</b> approved it in the renewal kickoff <span class="cite">2</span>.</p></div>' +
        '<div class="w-src"><span>' + badge('docx') + 'Fabrikam_Renewal_Amendment_2025.docx</span><span>' + badge('teams') + 'Fabrikam renewal kickoff · recap</span></div>', 'Work');
    },
    plan: function () {
      var tick = '<span class="st done">' + icon('check') + '</span>';
      return win('Copilot Cowork', 'Fabrikam health report',
        '<div class="w-plan"><h4>Plan</h4><ol>' +
        '<li>' + tick + 'Find the 8 files in Sales/Fabrikam</li>' +
        '<li>' + tick + 'Read the contract, amendment and QBR deck</li>' +
        '<li class="run"><span class="st run"></span>Analyse tickets, NPS and usage data</li>' +
        '<li class="todo"><span class="st todo"></span>Score account health (0–100)</li>' +
        '<li class="todo"><span class="st todo"></span>Build the HTML report</li>' +
        '<li class="todo"><span class="st todo"></span>Check the report against the sources</li>' +
        '</ol><div class="w-status">Step 3 of 6 · working</div></div>', 'Running');
    },
    report: function () {
      return win('Fabrikam_Health_Report.html', '',
        '<div class="w-report"><h4>Fabrikam · Account health <small>generated by Cowork</small></h4>' +
        '<div class="ring"><div><b>72</b><small>/ 100</small></div></div>' +
        '<div class="kpis"><div><b>31</b><span>NPS</span></div><div><b>14</b><span>Open cases</span></div><div><b>+18%</b><span>Usage, Q3</span></div></div>' +
        '<div class="risks"><div><span>Price sensitivity</span><i style="--p:80%"></i></div><div><span>Support backlog</span><i style="--p:60%"></i></div><div><span>Single executive sponsor</span><i style="--p:45%"></i></div></div></div>');
    },
    plugin: function () {
      function row(type, name, detail, on) {
        return '<div' + (on ? ' class="on"' : '') + '>' + badge(type) + '<div><b>' + name + '</b><span>' + detail + '</span></div><span class="sw"></span></div>';
      }
      return win('Copilot Cowork', 'Plugins',
        '<div class="w-plug">' + row('crm', 'Contoso Sales CRM', 'Accounts, opportunities, cases · Dynamics 365', true) +
        row('pa', 'Power Apps', 'Build apps on Dataverse') + row('bi', 'Power BI', 'Reports and semantic models') + '</div>');
    },
    deck: function () {
      return win('Fabrikam_Renewal_2026.pptx', 'PowerPoint',
        '<div class="w-deck">' +
        '<div class="slide title"><b>Fabrikam renewal 2026</b></div>' +
        '<div class="slide"><b>Open pipeline</b><span class="big">$1.24M</span><span class="src">CRM · OPP-00412</span></div>' +
        '<div class="slide"><b>Opportunities</b><div class="bars"><i style="height:45%"></i><i style="height:80%"></i><i style="height:60%"></i><i style="height:95%"></i></div></div>' +
        '<div class="slide"><b>Cases, last 90 days</b><span class="big">14</span><span class="src">CRM · 14 cases</span></div>' +
        '<div class="slide"><b>Account health</b><span class="big">72</span><span class="src">Health report</span></div>' +
        '<div class="slide"><b>Next steps</b><div class="lines"><i></i><i style="width:70%"></i><i style="width:85%"></i></div></div>' +
        '</div>');
    },
    approve: function () {
      return win('Copilot Cowork', 'Approval needed',
        '<div class="w-approve"><span class="ic">!</span><div><p><b>Create an app in “Contoso Lab”?</b></p>' +
        '<p>Cowork wants to create the app “Renewal Commitments” on the Dataverse table Renewal Commitment.</p>' +
        '<div class="acts"><span class="w-btn">Deny</span><span class="w-btn pri">Approve</span></div></div></div>');
    },
    app: function () {
      return win('Renewal Commitments', 'Power Apps',
        '<div class="w-app"><div class="w-form">' +
        '<div class="f">Account<span>Fabrikam</span></div><div class="f">Commitment<span>Share 3-year pricing options</span></div>' +
        '<div class="f">Owner<span>You</span></div><div class="f">Due date<span>Thu 14 May</span></div><span class="w-btn pri">Save</span></div>' +
        '<div class="w-list"><h5>Fabrikam <span>2 open</span></h5>' +
        '<div class="w-row"><b>Share 3-year pricing options</b><span class="pill">Open</span><small>You · Thu 14 May</small></div>' +
        '<div class="w-row"><b>Book an executive sponsor call</b><span class="pill">Open</span><small>Claudia M. · Fri 15 May</small></div>' +
        '<div class="w-dv">' + icon('check') + 'Saved to Dataverse · Renewal Commitment</div></div></div>');
    }
  };
  function mock(name) { return MOCKS[name] ? MOCKS[name]() : ''; }

  /* ---------- Header ---------- */
  function header() {
    var n = doneCount();
    var segs = LAB.missions.map(function (m) { return '<span' + (state.done[m.id] ? ' class="on"' : '') + '></span>'; }).join('');
    var light = prefs.theme === 'light';
    return '<div class="wrap hdr">' +
      '<a class="hdr-progress" href="#ladder" aria-label="Progress: ' + n + ' of ' + LAB.missions.length + ' missions complete">' +
      '<span class="prog" role="progressbar" aria-label="Missions complete" aria-valuemin="0" aria-valuemax="' + LAB.missions.length + '" aria-valuenow="' + n + '">' + segs + '</span>' +
      '<span class="prog-label">' + n + '/' + LAB.missions.length + ' missions</span></a>' +
      '<div class="hdr-tools">' +
      '<span class="proto">Prototype · mock content</span>' +
      '<div class="seg" role="group" aria-label="Lab mode">' +
      '<button type="button" data-action="mode" data-v="guided" aria-pressed="' + (prefs.mode === 'guided') + '">Guided</button>' +
      '<button type="button" data-action="mode" data-v="explorer" aria-pressed="' + (prefs.mode === 'explorer') + '">Explorer</button></div>' +
      '<button type="button" class="tool" data-action="notes" aria-pressed="' + !!prefs.notes + '" aria-label="Design notes">' + icon('notes') + '<span class="lbl">Design notes</span></button>' +
      '<button type="button" class="tool icon" data-action="theme" aria-label="Switch to ' + (light ? 'dark' : 'light') + ' theme">' + icon(light ? 'moon' : 'sun') + '</button>' +
      '</div></div>';
  }

  /* ---------- Hero ---------- */
  function heroCta() {
    var n = doneCount();
    if (n === LAB.missions.length) return { href: '#finale', label: 'See your finale' };
    if (n === 0) return { href: '#m-' + LAB.missions[0].id, label: 'Start mission 1' };
    var next = LAB.missions.filter(function (m) { return !state.done[m.id]; })[0];
    return { href: '#m-' + next.id, label: 'Continue: Mission ' + (mi(next.id) + 1) };
  }
  function hero() {
    var cta = heroCta();
    var outs = LAB.missions.map(function (m, i) {
      return '<a class="out" href="#m-' + m.id + '"><div class="mini" aria-hidden="true">' + mock(m.artifact) + '</div>' +
        '<div class="out-cap">' + esc(m.outcome) + '<span>Mission ' + (i + 1) + '</span></div></a>';
    }).join('');
    return '<section class="wrap hero" id="top">' +
      '<div' + na('hero') + '>' + note('hero') +
      '<h1>' + esc(LAB.title) + ' <em>' + esc(LAB.titleEm) + '</em></h1>' +
      '<p class="promise">' + esc(LAB.promise) + '</p>' +
      '<ul class="facts" aria-label="Lab facts">' +
      '<li>' + icon('clock') + LAB.minutes + ' min</li>' +
      '<li>' + icon('level') + 'Level ' + LAB.level + '</li>' +
      '<li>' + icon('layers') + LAB.missions.length + ' missions</li>' +
      '<li>' + icon('monitor') + 'Copilot Chat + Cowork</li></ul>' +
      '<div class="hero-cta"><a class="btn btn-primary" id="hero-cta" href="' + cta.href + '">' + esc(cta.label) + icon('arrow') + '</a>' +
      '<a class="btn btn-ghost" href="#ready">Before you start</a></div></div>' +
      '<aside class="outcomes" aria-labelledby="out-h"><h2 id="out-h">You’ll walk away with</h2><div class="out-grid">' + outs + '</div></aside>' +
      '</section>';
  }

  /* ---------- Design-notes intro (visible only with notes on) ---------- */
  function words(o) {
    var skip = { id: 1, icon: 1, href: 1, answer: 1, artifact: 1, mock: 1, show: 1, note: 1, ok: 1 };
    if (typeof o === 'string') return o.split(/\s+/).filter(Boolean).length;
    if (Array.isArray(o)) return o.reduce(function (s, x) { return s + words(x); }, 0);
    if (o && typeof o === 'object') return Object.keys(o).reduce(function (s, k) { return s + (skip[k] ? 0 : words(o[k])); }, 0);
    return 0;
  }
  function notesIntro() {
    var steps = LAB.missions.reduce(function (s, m) { return s + m.steps.length; }, 0);
    var shows = LAB.missions.reduce(function (s, m) { return s + m.steps.filter(function (x) { return x.show; }).length; }, 0);
    function stat(v, l) { return '<div class="stat"><dt>' + l + '</dt><dd>' + v + '</dd></div>'; }
    return '<section class="wrap notes-intro" aria-labelledby="why-h"><div class="notes-panel">' +
      '<h2 id="why-h">Why it’s built this way</h2>' +
      '<p>Each purple note names one design choice and the research behind it. Turn Design notes off to see the page the way a learner would. Most of the words below stay folded until someone needs them.</p>' +
      '<div class="compare"><div><h3>Current Cowork lab</h3><dl>' + stat('5,532', 'words') + stat('40', 'steps') + stat('27', 'callouts') + stat('20', 'screenshots') + '</dl></div>' +
      '<div class="now"><h3>This format</h3><dl>' + stat(words(LAB).toLocaleString('en-US'), 'words') + stat(steps, 'steps') + stat('0', 'callouts') + stat(shows, 'visuals on demand') + '</dl></div></div>' +
      '<div class="global-notes">' + note('mode') + note('progress') + '</div>' +
      '</div></section>';
  }

  /* ---------- Ladder ---------- */
  function ladder() {
    var heights = [52, 68, 84, 100];
    var stairs = LAB.ladder.map(function (r, i) {
      var m = LAB.missions[i];
      return '<li class="stair' + (state.done[m.id] ? ' is-done' : '') + '" id="stair-' + r.id + '" style="--h:' + heights[i] + '%;--a:' + (0.04 + i * 0.05).toFixed(2) + ';--n:' + (i + 1) + '">' +
        '<a href="#m-' + m.id + '"><div><div class="st-top"><span>Mission ' + (i + 1) + '</span><span class="st-done">' + icon('check') + 'Done</span></div>' +
        '<p class="st-verb">' + esc(r.verb) + '</p><ul class="st-pair"><li>' + esc(r.you) + '</li><li>' + esc(r.it) + '</li></ul></div>' +
        '<div class="st-foot"><b>' + esc(r.scale) + '</b>' + esc(r.surface) + '</div></a></li>';
    }).join('');
    return '<section class="wrap section" id="ladder" aria-labelledby="ladder-h">' + note('ladder') +
      '<div' + na('ladder') + '><div class="sec-head"><h2 id="ladder-h">Four missions. One ladder.</h2>' +
      '<p>Each rung hands Copilot more of the work. You’ll climb all four with the same customer.</p></div>' +
      '<ol class="stairs">' + stairs + '</ol>' +
      '<div class="axis" aria-hidden="true"><span>Copilot does a little</span><span>Copilot does a lot</span></div></div></section>';
  }

  /* ---------- Rail ---------- */
  function rail() {
    var items = [{ id: 'scenario', small: 'Start', title: 'The scenario', dot: icon('folder') }];
    LAB.missions.forEach(function (m, i) {
      items.push({ id: 'm-' + m.id, small: 'Mission ' + (i + 1) + ' · ' + LAB.ladder[i].verb, title: m.title, mission: m.id, n: i + 1 });
    });
    items.push({ id: 'finale', small: 'Finish', title: 'Your Monday move', dot: icon('flag') });
    return '<nav class="rail" aria-label="Lab sections"><ol>' + items.map(function (it) {
      var d = it.mission && state.done[it.mission];
      return '<li><a class="rail-link' + (d ? ' done' : '') + '" href="#' + it.id + '"' + (it.mission ? ' data-m="' + it.mission + '"' : '') + '>' +
        '<span class="rail-dot">' + (it.dot || (d ? icon('check') : it.n)) + '</span>' +
        '<span><small>' + esc(it.small) + '</small><strong>' + esc(it.title) + '</strong></span></a></li>';
    }).join('') + '</ol></nav>';
  }

  /* ---------- Scenario ---------- */
  function scenario() {
    var s = LAB.story;
    var files = LAB.kit.map(function (f) { return '<li>' + badge(f.icon) + '<span class="n">' + esc(f.name) + '</span></li>'; }).join('');
    var sys = LAB.systems.map(function (f) { return '<li>' + badge(f.icon) + '<span class="n2"><span class="n">' + esc(f.name) + '</span><small>' + esc(f.detail) + '</small></span></li>'; }).join('');
    var ready = LAB.prereqs.map(function (p, k) {
      return '<li><label class="chk"><input type="checkbox" data-prereq="' + k + '"' + (state.prereq[k] ? ' checked' : '') + '><span class="chk-t">' + md(p.text) + '</span>' +
        (p.link ? '<a class="chip-btn accent" href="' + esc(p.link.href) + '" target="_blank" rel="noopener">' + esc(p.link.label) + icon('external') + '</a>' : '') +
        '</label></li>';
    }).join('');
    return '<section class="section" id="scenario" aria-labelledby="scn-h">' +
      '<div class="sec-head"><h2 id="scn-h">The scenario</h2></div>' + note('story') +
      '<div class="story"' + na('story') + '><div class="story-text">' +
      '<div class="who"><span class="avatar" aria-hidden="true">' + esc(s.who) + '</span><div><b>' + esc(s.who) + '</b><span>' + esc(s.role) + '</span></div></div>' +
      '<h3>' + esc(s.headline) + '</h3><p>' + esc(s.text) + '</p></div>' +
      '<div class="kit"><div class="kit-path">' + icon('folder') + esc(s.folder) + '</div><ul aria-label="Files in the folder">' + files + '</ul>' +
      '<div class="kit-sub">Connected systems</div><ul aria-label="Connected systems">' + sys + '</ul></div></div>' +
      note('prereqs') +
      '<div class="ready" id="ready"' + na('prereqs') + '><div class="ready-h"><h3>Before you start</h3><span>At a CAT event? Your facilitator already did this.</span></div><ul>' + ready + '</ul></div>' +
      '</section>';
  }

  /* ---------- Mission blocks ---------- */
  function predictBlock(i) {
    var m = LAB.missions[i], p = m.predict, pick = state.predict[m.id];
    var opts = p.options.map(function (o, k) {
      return '<button type="button" class="opt" data-action="predict" data-m="' + m.id + '" data-k="' + k + '" aria-pressed="' + (pick === k) + '"><span class="radio"></span>' + esc(o) + '</button>';
    }).join('');
    return '<div class="block predict" id="pred-' + m.id + '"' + na('predict', i === 0) + '>' +
      '<div class="block-h">' + icon('bulb') + 'Predict first<span class="block-hint">5 seconds · no wrong answers</span></div>' +
      '<p class="q" id="pq-' + m.id + '">' + esc(p.q) + '</p><div class="opts" role="group" aria-labelledby="pq-' + m.id + '">' + opts + '</div>' +
      '<p class="note-line">' + (pick != null ? 'Locked in. Do the steps; the reveal below will show how close you were.' : '') + '</p></div>';
  }

  function step(m, i, s, k) {
    var key = m.id + ':' + k, d = !!state.steps[key], showId = 'show-' + m.id + '-' + k;
    var actions = '';
    if (s.link) actions += '<a class="chip-btn accent" href="' + esc(s.link.href) + '" target="_blank" rel="noopener">' + esc(s.link.label) + icon('external') + '</a>';
    if (s.show) actions += '<button type="button" class="chip-btn" data-action="show" aria-expanded="false" aria-controls="' + showId + '">' + icon('eye') + '<span>Show me</span></button>';
    return '<li class="step' + (d ? ' is-done' : '') + '"' + (s.note ? na(s.note) : (i === 0 && s.show ? na('show') : '')) + '>' +
      '<label class="step-check"><input type="checkbox" data-step="' + key + '"' + (d ? ' checked' : '') + ' aria-label="Step ' + (k + 1) + ' done"><span class="tick"><span class="n">' + (k + 1) + '</span>' + icon('check') + '</span></label>' +
      '<div>' + (s.note ? note(s.note) : (i === 0 && s.show ? note('show') : '')) +
      '<p class="step-text">' + md(s.text) + '</p>' +
      (s.prompt ? '<div class="prompt"><div class="prompt-h"><span class="lbl">' + icon('sparkle') + 'Prompt</span>' +
        '<button type="button" class="copy" data-action="copy" data-m="' + m.id + '" data-k="' + k + '" aria-label="Copy prompt for step ' + (k + 1) + '">' + icon('copy') + '<span>Copy</span></button></div>' +
        '<p class="prompt-t">' + esc(s.prompt) + '</p></div>' : '') +
      '<div class="step-actions">' + actions + '</div>' +
      (s.show ? '<div class="show-panel" id="' + showId + '" hidden>' + mock(s.show) + '</div>' : '') +
      '</div></li>';
  }

  function ahaBlock(i, fresh) {
    var m = LAB.missions[i], a = m.aha;
    if (!state.aha[m.id]) {
      return '<div class="aha" id="aha-' + m.id + '"' + na('aha', i === 0) + '><button type="button" class="aha-btn" data-action="reveal" data-m="' + m.id + '" aria-expanded="false">' +
        '<span class="spark">' + icon('sparkle') + '</span><span><strong>Reveal what just happened</strong><small>Do the steps first. It lands better.</small></span>' + icon('chevron', 'chev') + '</button></div>';
    }
    var pick = state.predict[m.id];
    var guess = pick != null ? esc(m.predict.options[pick]) : 'You skipped the guess. Try one next mission: it makes the answer stick.';
    var flow = a.flow.map(function (f, k) {
      return '<li style="--i:' + k + '"><span class="node">' + esc(f) + '</span>' + (k < a.flow.length - 1 ? icon('arrow', 'arr') : '') + '</li>';
    }).join('');
    return '<div class="aha" id="aha-' + m.id + '"' + na('aha', i === 0) + '><div class="aha-panel' + (fresh ? ' is-new' : '') + '" tabindex="-1" role="region" aria-label="What just happened">' +
      '<div class="aha-guess"><div><span class="k">You guessed</span><p>' + guess + '</p></div><div><span class="k">What actually happened</span><p>' + esc(m.predict.reveal) + '</p></div></div>' +
      '<p class="aha-line">' + esc(a.line) + '</p><p class="aha-sub">' + md(a.sub) + '</p>' +
      '<ol class="flow" aria-label="How it works">' + flow + '</ol></div></div>';
  }

  function checkBlock(i) {
    var m = LAB.missions[i], c = m.check, pick = state.check[m.id];
    var opts = c.options.map(function (o, k) {
      var sel = pick === k, cls = sel ? (o.ok ? ' ok' : ' no') : '';
      return '<button type="button" class="copt' + cls + '" data-action="check" data-m="' + m.id + '" data-k="' + k + '" aria-pressed="' + sel + '"><span class="radio"></span>' + esc(o.t) + '</button>' +
        (sel ? '<p class="fb-line' + (o.ok ? '' : ' no') + '" role="status"><b>' + (o.ok ? 'Correct.' : 'Not quite.') + '</b> ' + esc(o.why) + (o.ok ? '' : ' Try another.') + '</p>' : '');
    }).join('');
    return '<div class="block check" id="chk-' + m.id + '"' + na('check', i === 0) + '>' +
      '<div class="block-h">' + icon('target') + 'Quick check<span class="block-hint">One question</span></div>' +
      '<p class="q">' + esc(c.q) + '</p><div class="check-opts">' + opts + '</div></div>';
  }

  function doneBtn(i) {
    var m = LAB.missions[i], d = !!state.done[m.id];
    return '<button type="button" id="done-' + m.id + '" class="btn ' + (d ? 'btn-done' : 'btn-primary') + '" data-action="complete" data-m="' + m.id + '" aria-pressed="' + d + '">' +
      icon('check') + (d ? 'Mission complete' : 'Mark mission complete') + '</button>';
  }

  function mission(m, i) {
    var r = LAB.ladder[i], first = i === 0, next = LAB.missions[i + 1];
    var steps = m.steps.map(function (s, k) { return step(m, i, s, k); }).join('');
    var watch = m.watch.map(function (w) { return '<li>' + md(w) + '</li>'; }).join('');
    var stuck = m.stuck.map(function (s) { return '<dt>' + md(s.q) + '</dt><dd>' + md(s.a) + '</dd>'; }).join('');
    return '<section class="mission' + (state.done[m.id] ? ' is-done' : '') + '" id="m-' + m.id + '" aria-labelledby="m-' + m.id + '-h">' +
      '<header class="m-head"><div class="m-num" aria-hidden="true">' + (i + 1) + '</div><div>' +
      '<h2 id="m-' + m.id + '-h"><span class="sr-only">Mission ' + (i + 1) + ': </span>' + esc(m.title) + '</h2>' +
      '<div class="m-meta"><span class="rung">Rung ' + (i + 1) + ' · ' + esc(r.verb) + '</span><span>' + icon('clock') + m.minutes + ' min</span><span>' + icon('monitor') + esc(m.surface) + '</span></div></div></header>' +
      '<p class="brief">' + esc(m.brief) + '</p>' +
      '<p class="makes"><b>You’ll make</b><span>' + esc(m.makes) + '</span></p>' +
      '<div class="goal">' + icon('target') + '<div><b>Goal</b>' + esc(m.goal) + '</div></div>' +
      note('predict', first) + predictBlock(i) +
      note('steps', first) +
      '<details class="steps-wrap"' + (prefs.mode === 'guided' ? ' open' : '') + na('steps', first) + '><summary>' + icon('chevron', 'chev') +
      '<span class="when-guided">Steps</span><span class="when-explorer">Need the steps?</span><span class="count">· ' + m.steps.length + ' steps</span></summary>' +
      '<ol class="steps">' + steps + '</ol></details>' +
      note('watch', first) +
      '<div class="block watch"' + na('watch', first) + '><div class="block-h">' + icon('eye') + 'Watch for</div><ul class="watch-list">' + watch + '</ul></div>' +
      note('result', first) +
      '<figure class="result"' + na('result', first) + '><div class="block-h">' + icon('check') + 'Success looks like</div>' + mock(m.result.mock) + '<figcaption>' + esc(m.result.caption) + '</figcaption></figure>' +
      note('aha', first) + ahaBlock(i, false) +
      note('check', first) + checkBlock(i) +
      note('remix', first) +
      '<div class="block remix"' + na('remix', first) + '><div class="block-h">' + icon('remix') + 'Remix it<span class="block-hint">Optional · no prompt this time</span></div><p>' + esc(m.remix) + '</p></div>' +
      note('stuck', first) +
      '<details class="stuck"' + na('stuck', first) + '><summary>' + icon('help') + 'Stuck?<span class="count">' + m.stuck.length + ' common fixes</span>' + icon('chevron', 'chev') + '</summary><dl>' + stuck + '</dl></details>' +
      '<div class="m-foot">' + doneBtn(i) +
      (next ? '<a class="btn btn-ghost" href="#m-' + next.id + '">Next: Mission ' + (i + 2) + icon('arrow') + '</a>'
            : '<a class="btn btn-ghost" href="#finale">Finish: the finale' + icon('arrow') + '</a>') +
      '</div></section>';
  }

  /* ---------- Finale ---------- */
  var RUNG_WHY = {
    ask: 'Ask: one question, answered from what already exists.',
    delegate: 'Delegate: several steps or a recurring job, so you hand over an outcome.',
    connect: 'Connect: it needs live records from a business system.',
    build: 'Build: it needs a new tool that other people will use.'
  };
  function sortRow(k) {
    var s = LAB.finale.sort[k], v = state.sort[k], ok = v === s.answer;
    var btns = LAB.ladder.map(function (r) {
      return '<button type="button" data-action="sort" data-k="' + k + '" data-v="' + r.id + '" aria-pressed="' + (v === r.id) + '">' + esc(r.verb) + '</button>';
    }).join('');
    return '<li class="sort-row' + (v ? (ok ? ' ok' : ' no') : '') + '" id="sort-' + k + '"><p>' + esc(s.s) + '</p>' +
      '<div class="seg" role="group" aria-label="Which rung?">' + btns + '</div>' +
      '<p class="sort-fb" role="status">' + (v ? '<b>' + (ok ? 'Right.' : 'Not quite.') + '</b> ' + esc(RUNG_WHY[s.answer]) : '') + '</p></li>';
  }
  function sortScore() {
    var sorts = LAB.finale.sort, n = 0, tried = 0;
    sorts.forEach(function (s, k) { if (state.sort[k]) { tried++; if (state.sort[k] === s.answer) n++; } });
    if (!tried) return 'Pick a rung for each request.';
    return n + ' of ' + sorts.length + ' right' + (n === sorts.length ? '. You can spot the rung.' : '.');
  }
  function trophy(m, i) {
    var d = !!state.done[m.id];
    return '<a class="trophy' + (d ? ' is-done' : '') + '" id="trophy-' + m.id + '" href="#m-' + m.id + '"><div class="mini" aria-hidden="true">' + mock(m.artifact) + '</div>' +
      '<div class="trophy-cap"><span>' + (d ? icon('check') + 'Done' : 'Rung ' + (i + 1) + ' · ' + esc(LAB.ladder[i].verb)) + '</span>' + esc(m.outcome) + '</div></a>';
  }
  function finaleHead() {
    var n = doneCount(), all = n === LAB.missions.length;
    return '<div class="sec-head" id="fin-head"><h2 id="fin-h">' + (all ? 'You climbed the ladder.' : 'The finish line') + '</h2>' +
      '<p>' + (all ? 'Four rungs, one customer, 45 minutes. Now make it yours.' : n + ' of ' + LAB.missions.length + ' missions complete. Each tile lights up when you finish its mission.') + '</p></div>';
  }
  function finale() {
    return '<section class="finale" id="finale" aria-labelledby="fin-h">' + finaleHead() +
      '<div class="trophies">' + LAB.missions.map(trophy).join('') + '</div>' +
      note('sort') +
      '<div class="block" id="sort"' + na('sort') + '><div class="block-h">' + icon('layers') + 'Which rung?<span class="block-hint">Four new requests</span></div>' +
      '<ul class="sort-list">' + LAB.finale.sort.map(function (s, k) { return sortRow(k); }).join('') + '</ul>' +
      '<p class="sort-score" id="sort-score">' + sortScore() + '</p></div>' +
      note('monday') +
      '<div class="block monday"' + na('monday') + '><div class="block-h">' + icon('flag') + 'Your Monday move</div>' +
      '<label class="q" for="monday">Write one sentence you’ll actually do this week.</label>' +
      '<textarea id="monday" placeholder="This week, when ___, I’ll ask Cowork to ___.">' + esc(state.monday) + '</textarea>' +
      '<p class="eg">For example: “This week, when an RFP lands, I’ll ask Cowork to draft a first response from our past proposals.”</p>' +
      '<div class="row"><button type="button" class="chip-btn accent" data-action="copy-monday">' + icon('copy') + '<span>Copy</span></button></div></div>' +
      '<div class="finale-actions"><button type="button" class="btn btn-primary" data-action="download">' + icon('download') + 'Download all prompts (.md)</button>' +
      '<button type="button" class="btn btn-quiet" data-action="reset">' + icon('reset') + 'Reset progress</button></div>' +
      '</section>';
  }

  /* ---------- Render ---------- */
  var io;
  var siteThemeObserver;
  function render() {
    applyPrefs();
    $('#site-header').innerHTML = header();
    mainEl().innerHTML = hero() + notesIntro() + ladder() +
      '<div class="wrap layout">' + rail() + '<div class="content">' + scenario() + LAB.missions.map(mission).join('') + finale() + '</div></div>';
    $('#site-footer').innerHTML = '<div class="wrap"><p>Preview lab · Contoso, Fabrikam, plugin names, UI paths and numbers are mock placeholders. ' +
      'Compare with the <a href="https://microsoft.github.io/mcs-labs/labs/cowork-plugins-hands-on/" target="_blank" rel="noopener">current Cowork + Plugins lab</a>.</p></div>';
    if (qs.get('show') === 'all') $$('[data-action="show"]').forEach(toggleShow);
    observe();
  }
  function applyPrefs() {
    root.setAttribute('data-theme', prefs.theme);
    root.setAttribute('data-mode', prefs.mode);
    root.setAttribute('data-notes', prefs.notes ? 'on' : 'off');
    if (embedded && !siteThemeObserver && 'MutationObserver' in window) {
      siteThemeObserver = new MutationObserver(function () {
        var theme = pageRoot.getAttribute('data-theme');
        prefs.theme = theme === 'light' ? 'light' : (theme === 'dark' ? 'dark' :
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        root.setAttribute('data-theme', prefs.theme);
      });
      siteThemeObserver.observe(pageRoot, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }
  function observe() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.rail-link');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    links.forEach(function (a) { var el = root.querySelector('#' + a.getAttribute('href').slice(1)); if (el) io.observe(el); });
  }
  function swap(id, html, focusSel) {
    var old = root.querySelector('#' + id);
    if (!old) return null;
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    var nu = t.content.firstElementChild;
    old.replaceWith(nu);
    if (focusSel) { var f = nu.querySelector(focusSel); if (f) f.focus(); }
    return nu;
  }
  // Everything that reflects mission completion, refreshed in place so focus and scroll stay put.
  function refreshProgress() {
    var n = doneCount(), total = LAB.missions.length;
    var bar = $('.prog');
    if (bar) {
      bar.setAttribute('aria-valuenow', n);
      $$('span', bar).forEach(function (s, k) { s.classList.toggle('on', !!state.done[LAB.missions[k].id]); });
      $('.prog-label').textContent = n + '/' + total + ' missions';
      $('.hdr-progress').setAttribute('aria-label', 'Progress: ' + n + ' of ' + total + ' missions complete');
    }
    var cta = heroCta(), c = $('#hero-cta');
    if (c) { c.setAttribute('href', cta.href); c.innerHTML = esc(cta.label) + icon('arrow'); }
    LAB.missions.forEach(function (m, i) {
      var d = !!state.done[m.id];
        var sec = root.querySelector('#m-' + m.id); if (sec) sec.classList.toggle('is-done', d);
        var st = root.querySelector('#stair-' + m.id); if (st) st.classList.toggle('is-done', d);
      var rl = $('.rail-link[data-m="' + m.id + '"]');
      if (rl) { rl.classList.toggle('done', d); $('.rail-dot', rl).innerHTML = d ? icon('check') : String(i + 1); }
      swap('trophy-' + m.id, trophy(m, i));
    });
    swap('fin-head', finaleHead());
  }

  /* ---------- Feedback ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function copyText(text) {
    function fallback() {
      var active = document.activeElement, ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      root.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (active && active.focus) active.focus();
      if (!ok) throw new Error('Copy failed');
    }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(fallback);
    return new Promise(function (resolve) { fallback(); resolve(); });
  }
  function flashCopied(btn) {
    var label = $('span', btn);
    btn.classList.add('copied');
    if (label) label.textContent = 'Copied';
    setTimeout(function () { btn.classList.remove('copied'); if (label) label.textContent = 'Copy'; }, 1600);
  }
  function toggleShow(btn) {
    var panel = root.querySelector('#' + btn.getAttribute('aria-controls'));
    if (!panel) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    $('span', btn).textContent = open ? 'Hide' : 'Show me';
  }
  function promptsMarkdown() {
    var L = ['# ' + LAB.title + ' ' + LAB.titleEm, '', '_' + LAB.promise + '_', ''];
    LAB.missions.forEach(function (m, i) {
      L.push('## Mission ' + (i + 1) + ' · ' + LAB.ladder[i].verb + ': ' + m.title, '');
      m.steps.forEach(function (s, k) {
        if (!s.prompt) return;
        L.push('**Step ' + (k + 1) + '.** ' + s.text.replace(/\*\*/g, ''), '');
        L.push(s.prompt.split('\n').map(function (l) { return '> ' + l; }).join('\n'), '');
      });
      L.push('**Remix:** ' + m.remix, '');
    });
    if (state.monday) L.push('## My Monday move', '', state.monday, '');
    return L.join('\n');
  }

  /* ---------- Events ---------- */
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var a = el.getAttribute('data-action'), id = el.getAttribute('data-m'), k = el.getAttribute('data-k'), i = id ? mi(id) : -1;

    if (a === 'mode') {
      prefs.mode = el.getAttribute('data-v');
      applyPrefs(); savePrefs();
      $$('[data-action="mode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); });
      $$('.steps-wrap').forEach(function (d) { d.open = prefs.mode === 'guided'; });
      toast(prefs.mode === 'explorer' ? 'Explorer: steps are tucked behind each goal' : 'Guided: every step is shown');
    } else if (a === 'notes') {
      prefs.notes = !prefs.notes;
      applyPrefs(); savePrefs();
      el.setAttribute('aria-pressed', String(prefs.notes));
      toast(prefs.notes ? 'Design notes on: each part explains itself' : 'Design notes off');
    } else if (a === 'theme') {
      prefs.theme = prefs.theme === 'light' ? 'dark' : 'light';
      applyPrefs(); savePrefs();
      el.setAttribute('aria-label', 'Switch to ' + (prefs.theme === 'light' ? 'dark' : 'light') + ' theme');
      el.innerHTML = icon(prefs.theme === 'light' ? 'moon' : 'sun');
    } else if (a === 'copy') {
      copyText(LAB.missions[i].steps[+k].prompt).then(function () { flashCopied(el); toast('Prompt copied. Paste it into Copilot.'); })
        .catch(function () { toast('Copy blocked by the browser. Select the text instead.'); });
    } else if (a === 'predict') {
      state.predict[id] = +k; save();
      swap('pred-' + id, predictBlock(i), '[data-k="' + k + '"]');
      if (state.aha[id]) swap('aha-' + id, ahaBlock(i, false));
    } else if (a === 'show') {
      toggleShow(el);
    } else if (a === 'reveal') {
      state.aha[id] = true; save();
      var nu = swap('aha-' + id, ahaBlock(i, true));
      if (nu) $('.aha-panel', nu).focus({ preventScroll: true });
    } else if (a === 'check') {
      state.check[id] = +k; save();
      swap('chk-' + id, checkBlock(i), '[data-k="' + k + '"]');
    } else if (a === 'complete') {
      state.done[id] = !state.done[id]; save();
      swap('done-' + id, doneBtn(i)).focus();
      refreshProgress();
      if (state.done[id]) {
        var n = doneCount();
        toast(n === LAB.missions.length ? 'All four rungs climbed. The finale is ready.' : 'Mission ' + (i + 1) + ' complete · ' + n + ' of ' + LAB.missions.length);
      }
    } else if (a === 'sort') {
      state.sort[k] = el.getAttribute('data-v'); save();
      swap('sort-' + k, sortRow(+k), '[data-v="' + el.getAttribute('data-v') + '"]');
      $('#sort-score').textContent = sortScore();
    } else if (a === 'copy-monday') {
      var ta = $('#monday'), text = ta.value.trim();
      if (!text) { ta.focus(); toast('Write your sentence first'); return; }
      copyText(text).then(function () { flashCopied(el); toast('Copied. Paste it somewhere you’ll see on Monday.'); })
        .catch(function () { toast('Copy blocked by the browser.'); });
    } else if (a === 'download') {
      var blob = new Blob([promptsMarkdown()], { type: 'text/markdown' });
      var url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'cowork-lab-prompts.md';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('Downloaded cowork-lab-prompts.md');
    } else if (a === 'reset') {
      if (!window.confirm('Reset all progress, guesses and answers in this lab?')) return;
      state = blank(); save(); render();
      mainEl().focus();
      toast('Progress reset');
    }
  });

  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-step]')) {
      var key = t.getAttribute('data-step'), id = key.split(':')[0], m = LAB.missions[mi(id)];
      state.steps[key] = t.checked; save();
      t.closest('.step').classList.toggle('is-done', t.checked);
      var all = m.steps.every(function (s, k) { return state.steps[id + ':' + k]; });
      if (all && t.checked && !state.done[id]) toast(state.aha[id] ? 'All steps done. Take the quick check.' : 'All steps done. Now reveal what just happened.');
    } else if (t.matches('[data-prereq]')) {
      state.prereq[t.getAttribute('data-prereq')] = t.checked; save();
    }
  });

  root.addEventListener('input', function (e) {
    if (e.target.id === 'monday') { state.monday = e.target.value; save(); }
  });

  render();
})();
