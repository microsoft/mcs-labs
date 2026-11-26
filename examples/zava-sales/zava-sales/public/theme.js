(() => {
  let saved;
  try { saved = localStorage.getItem('zava-theme'); }
  catch (error) { console.warn('Theme preference is unavailable.', error); }
  const param = new URLSearchParams(window.location.search).get('scoutTheme');
  const choice = param === 'dark' || param === 'light' ? param : saved;
  const theme = choice === 'dark' || choice === 'light'
    ? choice
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();
