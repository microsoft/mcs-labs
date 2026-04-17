(function () {
  'use strict';

  var STORAGE_KEY = 'mcs-labs.prefs.v1';
  var SCHEMA_VERSION = 1;
  var VALID_THEMES = ['light', 'dark', 'hc', 'system'];
  var VALID_FONT_SCALES = [0.875, 1, 1.125];
  var DEFAULT_PREFS = { schemaVersion: SCHEMA_VERSION, theme: 'system', fontScale: 1 };

  // --- Storage ---

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_PREFS);
      var p = JSON.parse(raw);
      if (!p || p.schemaVersion !== SCHEMA_VERSION) return Object.assign({}, DEFAULT_PREFS);
      if (VALID_THEMES.indexOf(p.theme) < 0) p.theme = DEFAULT_PREFS.theme;
      if (VALID_FONT_SCALES.indexOf(p.fontScale) < 0) p.fontScale = DEFAULT_PREFS.fontScale;
      return p;
    } catch (e) {
      return Object.assign({}, DEFAULT_PREFS);
    }
  }

  function savePrefs(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      // Quota or private-mode failures are non-fatal — the in-memory state
      // still drives the current page. No user-facing error.
    }
  }

  // --- Apply prefs to the document ---

  function applyTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', String(scale));
  }

  // --- Menu wiring ---

  function init() {
    var toggle = document.getElementById('a11yMenuToggle');
    var menu = document.getElementById('a11yMenu');
    if (!toggle || !menu) return;

    var prefs = loadPrefs();
    applyTheme(prefs.theme);
    applyFontScale(prefs.fontScale);

    var themeButtons = menu.querySelectorAll('[data-theme-value]');
    var fontButtons = menu.querySelectorAll('[data-font-scale]');

    function syncUI() {
      themeButtons.forEach(function (btn) {
        btn.setAttribute('aria-checked',
          btn.getAttribute('data-theme-value') === prefs.theme ? 'true' : 'false');
      });
      fontButtons.forEach(function (btn) {
        btn.setAttribute('aria-pressed',
          parseFloat(btn.getAttribute('data-font-scale')) === prefs.fontScale ? 'true' : 'false');
      });
    }

    // --- Open/close ---

    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      // Focus the currently checked theme for predictable keyboard entry.
      var checked = menu.querySelector('[aria-checked="true"]') || themeButtons[0];
      if (checked) checked.focus();
      document.addEventListener('click', onOutsideClick, true);
      document.addEventListener('keydown', onEscapeOrNav);
    }

    function closeMenu(returnFocus) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutsideClick, true);
      document.removeEventListener('keydown', onEscapeOrNav);
      if (returnFocus) toggle.focus();
    }

    function isOpen() { return !menu.hidden; }

    toggle.addEventListener('click', function () {
      if (isOpen()) closeMenu(true);
      else openMenu();
    });

    function onOutsideClick(e) {
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu(false);
    }

    function onEscapeOrNav(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        var group = document.activeElement && document.activeElement.closest('[role="radiogroup"], .a11y-menu-textsize');
        if (!group) return;
        var items = Array.prototype.slice.call(group.querySelectorAll('button'));
        var idx = items.indexOf(document.activeElement);
        if (idx < 0) return;
        e.preventDefault();
        var next = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
        items[next].focus();
      }
    }

    // --- Selection handlers ---

    themeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-theme-value');
        if (VALID_THEMES.indexOf(value) < 0) return;
        prefs.theme = value;
        applyTheme(value);
        savePrefs(prefs);
        syncUI();
      });
    });

    fontButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = parseFloat(btn.getAttribute('data-font-scale'));
        if (VALID_FONT_SCALES.indexOf(value) < 0) return;
        prefs.fontScale = value;
        applyFontScale(value);
        savePrefs(prefs);
        syncUI();
      });
    });

    // --- Live-track OS theme while in System mode ---
    // matchMedia fires on OS dark-mode toggle; the CSS @media block repaints
    // automatically because data-theme is absent — no DOM write needed.
    if (window.matchMedia) {
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { /* no-op: CSS handles repaint */ };
      if (mql.addEventListener) mql.addEventListener('change', onChange);
      else if (mql.addListener) mql.addListener(onChange);
    }

    syncUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
