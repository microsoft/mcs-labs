/* Progressive enhancement only: the server-rendered lab owns all learning content. */
(() => {
  'use strict';
  const root = document.getElementById('lab-v2-root');
  if (!root) return;

  const key = `mcs-labs:missions:${root.dataset.labId}:v1`;
  const missions = [...root.querySelectorAll('[data-mission]')];
  const coreMissions = missions.filter(element => element.dataset.optional !== 'true');
  const missionIds = new Set(missions.map(element => element.dataset.mission));
  const progressIds = new Set([...root.querySelectorAll('[data-progress-id]')].map(element => element.dataset.progressId));
  const state = { done: [], steps: [], answers: {}, reflection: '' };
  const toast = root.querySelector('.toast');
  let toastTimer;
  let persistenceAvailable = true;

  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
  }

  function storageError(error) {
    console.warn('Mission lab progress could not be stored or restored.', error);
    if (!persistenceAvailable) return;
    persistenceAvailable = false;
    // Each note carries its own fallback so the warning sits where people read or type.
    root.querySelectorAll('[data-saving-note]').forEach(note => {
      if (note.dataset.savingNote) note.textContent = note.dataset.savingNote;
    });
    announce('Progress is available for this visit only. Browser storage is unavailable.');
  }

  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object') {
      state.done = Array.isArray(saved.done) ? [...new Set(saved.done.filter(id => missionIds.has(id)))] : [];
      state.steps = Array.isArray(saved.steps) ? saved.steps.filter(id => progressIds.has(id)) : [];
      state.answers = saved.answers && typeof saved.answers === 'object' && !Array.isArray(saved.answers) ? saved.answers : {};
      state.reflection = typeof saved.reflection === 'string' ? saved.reflection : '';
    }
  } catch (error) {
    storageError(error);
  }

  function save() {
    if (!persistenceAvailable) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      storageError(error);
    }
  }

  function showQuizAnswer(quiz, value, speak = false) {
    const selected = [...quiz.querySelectorAll('input[type="radio"]')].find(input => input.value === value);
    if (!selected) return;
    selected.checked = true;
    quiz.querySelectorAll('[data-feedback]').forEach(feedback => {
      feedback.hidden = feedback.dataset.feedback !== value;
    });
    quiz.querySelectorAll('.quiz-option').forEach(label => label.classList.remove('correct', 'incorrect'));
    selected.closest('.quiz-option').classList.add(selected.dataset.correct === 'true' ? 'correct' : 'incorrect');
    if (speak) quiz.querySelector('[data-quiz-announcement]').textContent =
      [...quiz.querySelectorAll('[data-feedback]')].find(feedback => !feedback.hidden).textContent;
  }

  function renderProgress() {
    missions.forEach(mission => {
      const done = state.done.includes(mission.dataset.mission);
      mission.classList.toggle('is-done', done);
      const button = mission.querySelector('[data-complete]');
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? 'Mission complete — undo' : 'Mark mission complete';
    });
    root.querySelectorAll('[data-mission-link]').forEach(link => {
      link.classList.toggle('is-done', state.done.includes(link.dataset.missionLink));
    });
    root.querySelectorAll('[data-progress-segment]').forEach(segment => {
      segment.classList.toggle('is-done', state.done.includes(segment.dataset.progressSegment));
    });
    const coreDone = coreMissions.filter(mission => state.done.includes(mission.dataset.mission)).length;
    root.querySelector('.progress-label').textContent = `${coreDone} / ${coreMissions.length} core complete`;
    root.querySelector('[data-progress]').setAttribute('aria-label',
      `${coreDone} of ${coreMissions.length} core missions complete; ${state.done.length - coreDone} optional missions complete`);
    root.querySelectorAll('[data-progress-id]').forEach(input => {
      input.checked = state.steps.includes(input.dataset.progressId);
    });
    updatePrintStamp(coreDone);
  }

  // The PDF copy is the only way to keep notes off this device, so it states when and how far.
  function updatePrintStamp(coreDone = coreMissions.filter(mission => state.done.includes(mission.dataset.mission)).length) {
    const stamp = root.querySelector('[data-print-stamp]');
    if (!stamp) return;
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    stamp.textContent = `Your copy, saved ${date}. ${coreDone} of ${coreMissions.length} core missions complete.`;
  }

  function applyTheme() {
    const siteTheme = document.documentElement.dataset.theme;
    root.dataset.theme = ['light', 'dark', 'hc'].includes(siteTheme) ? siteTheme :
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  root.querySelectorAll('button[hidden], [data-requires-script]').forEach(element => { element.hidden = false; });
  if (typeof window.print !== 'function') root.querySelectorAll('[data-action="print"]').forEach(button => { button.closest('.keep-copy').hidden = true; });
  root.querySelectorAll('[data-quiz]').forEach(quiz => showQuizAnswer(quiz, state.answers[quiz.dataset.quiz]));
  const reflection = root.querySelector('#lab-reflection');
  const reflectionPrint = root.querySelector('[data-reflection-print]');
  // A textarea prints clipped to its box; a plain-text mirror prints the whole note.
  function mirrorReflection() {
    if (reflectionPrint) reflectionPrint.textContent = reflection.value;
  }
  reflection.value = state.reflection;
  mirrorReflection();
  renderProgress();

  root.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.dataset.progressId) {
      state.steps = state.steps.filter(id => id !== input.dataset.progressId);
      if (input.checked) state.steps.push(input.dataset.progressId);
      save();
    } else if (input.type === 'radio') {
      const quiz = input.closest('[data-quiz]');
      if (!quiz) return;
      state.answers[quiz.dataset.quiz] = input.value;
      showQuizAnswer(quiz, input.value, true);
      save();
    }
  });
  reflection.addEventListener('input', () => {
    state.reflection = reflection.value;
    mirrorReflection();
    save();
  });

  async function copyPrompt(id) {
    const prompt = document.getElementById(id);
    if (!prompt || !root.contains(prompt)) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.');
      await navigator.clipboard.writeText(prompt.textContent);
      announce('Prompt copied. Paste it into your training task.');
    } catch (error) {
      console.warn('Mission prompt could not be copied automatically.', error);
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      announce('Automatic copying is blocked. The prompt is selected; use Ctrl+C or Command+C.');
    }
  }

  root.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.copy) {
      void copyPrompt(button.dataset.copy);
    } else if (button.dataset.complete) {
      const id = button.dataset.complete;
      state.done = state.done.includes(id) ? state.done.filter(item => item !== id) : [...state.done, id];
      save();
      renderProgress();
      announce(root.querySelector('[data-progress]').getAttribute('aria-label') + '.');
    } else if (button.dataset.action === 'print') {
      window.print();
    } else if (button.dataset.action === 'reset') {
      if (!window.confirm('Reset this lab’s checkmarks, quiz answers and note on this browser? They are stored only here, so save a PDF copy first if you want to keep them. Your Copilot work is not affected.')) return;
      state.done = [];
      state.steps = [];
      state.answers = {};
      state.reflection = '';
      reflection.value = '';
      mirrorReflection();
      root.querySelectorAll('[data-quiz] input').forEach(input => { input.checked = false; });
      root.querySelectorAll('[data-feedback]').forEach(feedback => { feedback.hidden = true; });
      root.querySelectorAll('.quiz-option').forEach(label => label.classList.remove('correct', 'incorrect'));
      root.querySelectorAll('[data-quiz-announcement]').forEach(region => { region.textContent = ''; });
      save();
      renderProgress();
      announce('Lab progress reset. Your Copilot work has not changed.');
    }
  });

  // Print every explanation the learner might have left closed; screenshots and troubleshooting stay out of the copy.
  // Accumulate: some browsers fire beforeprint more than once before afterprint.
  let openedForPrint = [];
  window.addEventListener('beforeprint', () => {
    root.querySelectorAll('details:not([open]):not(.visual):not(.stuck)').forEach(details => {
      details.open = true;
      openedForPrint.push(details);
    });
    mirrorReflection();
    updatePrintStamp();
  });
  window.addEventListener('afterprint', () => {
    openedForPrint.forEach(details => { details.open = false; });
    openedForPrint = [];
  });

  // A single visible section drives both navigation rails; content never depends on observation.
  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const active = missions.find(mission => visible.has(mission.id));
      if (!active) return;
      root.querySelectorAll('[data-mission-link]').forEach(link => {
        if (link.dataset.missionLink === active.id) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    missions.forEach(mission => observer.observe(mission));
  }
})();
