(function () {
  const STORAGE_KEY = 'portfolio-project-unlocked';
  const PASSWORD = 'adorado';
  const PROTECTED_SLUGS = ['agent-workspace', 'ai-solution-assistant'];

  let pendingUrl = null;

  function isUnlocked() {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }

  function getSlugFromPath(pathname) {
    const match = pathname.replace(/\\/g, '/').match(/\/([^/]+)\.html$/);
    return match ? match[1] : null;
  }

  function isProtectedSlug(slug) {
    return PROTECTED_SLUGS.includes(slug);
  }

  function createGateElement() {
    const gate = document.createElement('div');
    gate.id = 'project-gate';
    gate.className = 'project-gate';
    gate.setAttribute('role', 'presentation');
    gate.innerHTML = `
      <div class="project-gate-backdrop" data-gate-dismiss></div>
      <div
        class="project-gate-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-gate-title"
        aria-describedby="project-gate-desc"
      >
        <button type="button" class="project-gate-close" data-gate-dismiss aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="project-gate-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 id="project-gate-title" class="project-gate-title" data-i18n="gate.title">Proyecto privado</h2>
        <p id="project-gate-desc" class="project-gate-desc" data-i18n="gate.message">
          Este proyecto es privado y necesitas acceso. Introduce la contraseña.
        </p>
        <form class="project-gate-form" novalidate>
          <label class="project-gate-label" for="project-gate-password" data-i18n="gate.password_label">Contraseña</label>
          <div class="project-gate-password-wrap">
            <input
              type="password"
              id="project-gate-password"
              class="project-gate-input"
              name="password"
              autocomplete="current-password"
              required
            >
            <button
              type="button"
              class="project-gate-toggle-pw"
              id="project-gate-toggle-pw"
              aria-pressed="false"
              aria-label="Mostrar contraseña"
              data-i18n-attr="aria-label:gate.show_password"
            >
              <svg class="icon-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg class="icon-eye-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" hidden>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <path d="M1 1l22 22"/>
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
              </svg>
            </button>
          </div>
          <p class="project-gate-error" id="project-gate-error" hidden data-i18n="gate.error">Contraseña incorrecta. Inténtalo de nuevo.</p>
          <div class="project-gate-actions">
            <button type="button" class="gate-btn gate-btn-cancel" data-gate-dismiss data-i18n="gate.cancel">Cancelar</button>
            <button type="submit" class="gate-btn gate-btn-submit" data-i18n="gate.submit">Acceder</button>
          </div>
        </form>
      </div>
    `;
    applyGateI18n(gate);
    return gate;
  }

  function applyGateI18n(gate) {
    const lang = localStorage.getItem('portfolio-lang') || 'es';
    const translations = window.PORTFOLIO_LOCALES && window.PORTFOLIO_LOCALES[lang];
    if (!translations) return;

    gate.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[key] !== undefined) {
        el.textContent = translations[key];
      }
    });

    gate.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key && translations[key] !== undefined) {
          el.setAttribute(attr, translations[key]);
        }
      });
    });
  }

  function getGate() {
    let gate = document.getElementById('project-gate');
    if (!gate) {
      gate = createGateElement();
      document.body.appendChild(gate);
    }
    return gate;
  }

  function setGateError(gate, show) {
    const error = gate.querySelector('#project-gate-error');
    const input = gate.querySelector('#project-gate-password');
    if (error) error.hidden = !show;
    if (input) input.setAttribute('aria-invalid', show ? 'true' : 'false');
  }

  function openGate(targetUrl) {
    pendingUrl = targetUrl || null;
    const gate = getGate();
    applyGateI18n(gate);
    const input = gate.querySelector('#project-gate-password');

    gate.classList.add('is-open');
    document.body.classList.add('gate-open');

    setGateError(gate, false);
    if (input) {
      input.value = '';
      input.type = 'password';
      requestAnimationFrame(() => input.focus());
    }

    const togglePw = gate.querySelector('#project-gate-toggle-pw');
    if (togglePw) {
      const lang = localStorage.getItem('portfolio-lang') || 'es';
      const translations = window.PORTFOLIO_LOCALES && window.PORTFOLIO_LOCALES[lang];
      const showLabel = translations && translations['gate.show_password'];
      togglePw.setAttribute('aria-pressed', 'false');
      if (showLabel) togglePw.setAttribute('aria-label', showLabel);
      const eye = togglePw.querySelector('.icon-eye');
      const eyeOff = togglePw.querySelector('.icon-eye-off');
      if (eye) eye.hidden = false;
      if (eyeOff) eyeOff.hidden = true;
    }
  }

  function closeGate() {
    const gate = document.getElementById('project-gate');
    pendingUrl = null;

    if (gate) {
      gate.classList.remove('is-open');
    }

    document.body.classList.remove('gate-open', 'gate-locked');
  }

  function navigateAfterUnlock() {
    if (pendingUrl) {
      window.location.href = pendingUrl;
      return;
    }
    closeGate();
  }

  function bindGateEvents(gate) {
    gate.querySelectorAll('[data-gate-dismiss]').forEach((el) => {
      el.addEventListener('click', () => {
        if (document.body.classList.contains('gate-locked')) {
          window.location.href = document.body.dataset.gateReturn || '../index.html#proyectos';
          return;
        }
        closeGate();
      });
    });

    const togglePw = gate.querySelector('#project-gate-toggle-pw');
    const passwordInput = gate.querySelector('#project-gate-password');

    if (togglePw && passwordInput) {
      togglePw.addEventListener('click', () => {
        const willShow = passwordInput.type === 'password';
        const lang = localStorage.getItem('portfolio-lang') || 'es';
        const translations = window.PORTFOLIO_LOCALES && window.PORTFOLIO_LOCALES[lang];
        const showLabel = translations && translations['gate.show_password'];
        const hideLabel = translations && translations['gate.hide_password'];

        passwordInput.type = willShow ? 'text' : 'password';
        togglePw.setAttribute('aria-pressed', willShow ? 'true' : 'false');
        togglePw.setAttribute('aria-label', willShow ? hideLabel : showLabel);

        togglePw.querySelector('.icon-eye').hidden = willShow;
        togglePw.querySelector('.icon-eye-off').hidden = !willShow;
      });
    }

    gate.querySelector('.project-gate-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = gate.querySelector('#project-gate-password');
      const value = input ? input.value.trim() : '';

      if (value === PASSWORD) {
        unlock();
        navigateAfterUnlock();
        return;
      }

      setGateError(gate, true);
      if (input) input.focus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !gate.classList.contains('is-open')) return;

      if (document.body.classList.contains('gate-locked')) {
        window.location.href = document.body.dataset.gateReturn || '../index.html#proyectos';
        return;
      }

      closeGate();
    });
  }

  function initHomeGate() {
    document.querySelectorAll('.project-card[data-protected]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (isUnlocked()) return;

        e.preventDefault();
        openGate(card.getAttribute('href'));
      });
    });
  }

  function initCasePageGate() {
    const slug = getSlugFromPath(window.location.pathname);
    if (!slug || !isProtectedSlug(slug)) return;

    document.body.dataset.gateReturn = '../index.html#proyectos';

    if (isUnlocked()) return;

    document.body.classList.add('gate-locked');
    openGate(null);
  }

  function init() {
    const gate = getGate();
    bindGateEvents(gate);

    const slug = getSlugFromPath(window.location.pathname);
    if (slug && isProtectedSlug(slug)) {
      initCasePageGate();
      return;
    }

    initHomeGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
