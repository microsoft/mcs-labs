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
    root.querySelector('[data-saving-note]').textContent =
      'Progress cannot be saved in this browser. You can still use the whole lab and download its prompts.';
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
  }

  function applyTheme() {
    const siteTheme = document.documentElement.dataset.theme;
    root.dataset.theme = ['light', 'dark', 'hc'].includes(siteTheme) ? siteTheme :
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  root.querySelectorAll('button[hidden]').forEach(button => { button.hidden = false; });
  root.querySelectorAll('[data-quiz]').forEach(quiz => showQuizAnswer(quiz, state.answers[quiz.dataset.quiz]));
  const reflection = root.querySelector('#lab-reflection');
  reflection.value = state.reflection;
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

  function downloadPrompts() {
    const sections = missions.map(mission => {
      const prompts = [...mission.querySelectorAll('[data-prompt]')].map(prompt => prompt.textContent);
      return `## ${mission.querySelector('h2').textContent}${mission.dataset.optional === 'true' ? ' (optional)' : ''}\n\n${prompts.join('\n\n---\n\n')}`;
    });
    const text = `${document.title}\n\n${sections.join('\n\n')}\n\nMy next use case:\n${state.reflection}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${root.dataset.labId}-prompts.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Your prompts and reflection have been downloaded.');
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
    } else if (button.dataset.action === 'download') {
      downloadPrompts();
    } else if (button.dataset.action === 'reset') {
      if (!window.confirm('Reset this lab’s checkmarks, quiz answers and reflection on this browser? Your Copilot work is not affected.')) return;
      state.done = [];
      state.steps = [];
      state.answers = {};
      state.reflection = '';
      reflection.value = '';
      root.querySelectorAll('[data-quiz] input').forEach(input => { input.checked = false; });
      root.querySelectorAll('[data-feedback]').forEach(feedback => { feedback.hidden = true; });
      root.querySelectorAll('.quiz-option').forEach(label => label.classList.remove('correct', 'incorrect'));
      root.querySelectorAll('[data-quiz-announcement]').forEach(region => { region.textContent = ''; });
      save();
      renderProgress();
      announce('Lab progress reset. Your Copilot work has not changed.');
    }
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
