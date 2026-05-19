// NAV scroll shadow
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

function initNavMenu() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!nav || !toggle || !menu) return;

  function getMenuLabel(key) {
    const lang = localStorage.getItem('portfolio-lang') || 'es';
    const translations = window.PORTFOLIO_LOCALES && window.PORTFOLIO_LOCALES[lang];
    return translations && translations[key];
  }

  function setMenuOpen(open) {
    nav.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    const labelKey = open ? 'nav.menu_close' : 'nav.menu_open';
    const label = getMenuLabel(labelKey);
    if (label) toggle.setAttribute('aria-label', label);
    const menuIcon = toggle.querySelector('.nav-toggle-icon--menu');
    const closeIcon = toggle.querySelector('.nav-toggle-icon--close');
    if (menuIcon) menuIcon.hidden = open;
    if (closeIcon) closeIcon.hidden = !open;
    document.body.classList.toggle('nav-menu-open', open);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('nav-open'));
  });

  menu.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('nav-open')) return;
    if (!nav.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

initNavMenu();

// Fade in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeFadeIn(el) {
  if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
  fadeObserver.observe(el);
}

document.querySelectorAll('.fade-in').forEach(observeFadeIn);

if (document.body.classList.contains('case-study-page')) {
  const caseFadeTargets = document.querySelectorAll(
    '.case-hero-visual, .case-section, .case-callout'
  );
  caseFadeTargets.forEach((el, i) => {
    observeFadeIn(el);
    const delay = Math.min(i, 5);
    if (delay > 0) el.classList.add(`fade-in-delay-${delay}`);
  });
}

// Hero entrance animation
window.addEventListener('load', () => {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  heroContent.querySelectorAll(':scope > *').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1 + 0.15}s, transform 0.6s ease ${i * 0.1 + 0.15}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });

  const photoWrap = document.querySelector('.hero-photo-wrap');
  if (photoWrap) {
    photoWrap.style.opacity = '0';
    photoWrap.style.transform = 'translateY(16px)';
    photoWrap.style.transition = 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s';
    requestAnimationFrame(() => {
      photoWrap.style.opacity = '1';
      photoWrap.style.transform = 'translateY(0)';
    });
  }
});
