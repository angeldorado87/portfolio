(function () {
  const STORAGE_KEY = 'portfolio-lang';
  const DEFAULT_LANG = 'es';

  function getPreferredLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    const browser = (navigator.language || '').slice(0, 2);
    return browser === 'en' ? 'en' : DEFAULT_LANG;
  }

  function updateLangButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[key] !== undefined) {
        el.textContent = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.dataset.i18nHtml;
      if (translations[key] !== undefined) {
        el.innerHTML = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key && translations[key] !== undefined) {
          el.setAttribute(attr, translations[key]);
        }
      });
    });
  }

  function getLocalesBase() {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path.includes('/proyectos/') ? '../locales/' : 'locales/';
  }

  function mergeLocaleObjects(...objects) {
    return Object.assign({}, ...objects);
  }

  async function loadTranslations(lang) {
    const embeddedMain = window.PORTFOLIO_LOCALES && window.PORTFOLIO_LOCALES[lang];
    const embeddedCase = window.PORTFOLIO_CASE_LOCALES && window.PORTFOLIO_CASE_LOCALES[lang];

    if (embeddedMain) {
      return mergeLocaleObjects(embeddedMain, embeddedCase || {});
    }

    const base = getLocalesBase();
    const mainRes = await fetch(`${base}${lang}.json`);
    if (!mainRes.ok) throw new Error(`Failed to load ${lang}.json`);
    const main = await mainRes.json();

    let caseData = {};
    try {
      const caseRes = await fetch(`${base}case-${lang}.json`);
      if (caseRes.ok) caseData = await caseRes.json();
    } catch (_) {
      /* case file optional */
    }

    return mergeLocaleObjects(main, caseData);
  }

  async function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;

    try {
      const translations = await loadTranslations(lang);
      document.documentElement.lang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations(translations);
      updateLangButtons(lang);
    } catch (err) {
      console.error('i18n: no se pudieron cargar las traducciones.', err);
    }
  }

  function initI18n() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
    setLanguage(getPreferredLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }

  window.setLanguage = setLanguage;
})();
