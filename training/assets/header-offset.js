(() => {
  function applyOffset() {
    const header = document.querySelector('header.topbar');
    const h = header ? Math.ceil(header.getBoundingClientRect().height) : 96;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  }
  window.addEventListener('load', applyOffset, { once: true });
  window.addEventListener('resize', () => {
    clearTimeout(window.__mbccTopbarT);
    window.__mbccTopbarT = setTimeout(applyOffset, 120);
  });
})();
