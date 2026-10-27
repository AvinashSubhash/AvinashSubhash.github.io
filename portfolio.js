(() => {
  const button = document.querySelector('.theme-toggle');
  const label = button.querySelector('.theme-label');
  const preference = window.matchMedia('(prefers-color-scheme: light)');
  const currentTheme = () => document.documentElement.dataset.theme || (preference.matches ? 'light' : 'dark');
  function update() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    label.textContent = next === 'light' ? 'Light mode' : 'Dark mode';
  }
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('portfolio-theme', next); } catch (e) { /* The theme still works for this visit. */ }
    update();
  });
  preference.addEventListener('change', update);
  update();
})();
