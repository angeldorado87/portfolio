// NAV scroll shadow
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

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
