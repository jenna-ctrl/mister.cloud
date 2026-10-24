/* Mister Cloud · shared behaviour for every page:
   mobile nav, sticky-header shadow, newsletter forms, toast, dialogs, tally. */
(function () {
  'use strict';

  // ---- mobile nav --------------------------------------------------------
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // ---- header shadow once scrolled --------------------------------------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- toast -------------------------------------------------------------
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }

  // ---- dialogs: close on backdrop click & [data-close] -------------------
  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) { const d = closer.closest('dialog'); if (d) d.close(); return; }
    if (e.target.tagName === 'DIALOG') e.target.close(); // click on ::backdrop lands on the dialog itself
  });

  // ---- newsletter ("Keep me in the loop") --------------------------------
  document.querySelectorAll('form[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = form.parentElement.querySelector('.form-msg');
      const email = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (msg) { msg.style.color = 'var(--signal-red)'; msg.textContent = 'Please check that email address.'; }
        input.focus();
        return;
      }
      const done = (text) => {
        if (msg) { msg.style.color = ''; msg.textContent = text; }
        form.reset();
      };
      if (typeof NEWSLETTER_ENDPOINT === 'string' && NEWSLETTER_ENDPOINT) {
        const fd = new FormData();
        fd.append('email', email);
        fetch(NEWSLETTER_ENDPOINT, { method: 'POST', body: fd, mode: 'no-cors' })
          .then(() => done('Almost there. Check your inbox to confirm. ☁️'))
          .catch(() => done('Thank you! We will be in touch. ☁️'));
      } else {
        done('Thank you! Little discoveries are on the way. ☁️');
      }
    });
  });

  // ---- anonymous tally (+1 per download type; once per browser) ---------
  function tally(key) {
    try {
      const seenKey = 'mc-tally:' + key;
      if (localStorage.getItem(seenKey)) return Promise.resolve(null);
      localStorage.setItem(seenKey, '1');
    } catch (_) { /* private mode: still count */ }
    if (typeof TALLY_ENDPOINT !== 'string' || !TALLY_ENDPOINT) return Promise.resolve(null);
    return fetch(TALLY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
      keepalive: true,
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  }

  // ---- old single-page hash links → new pages ----------------------------
  // (e.g. a shared mister.cloud/#shop-final link from the soft-launch site)
  const legacy = { 'shop-final': '/shop', shop: '/shop', about: '/about', principles: '/about', company: '/about', partners: '/about', home: '/' };
  const h = location.hash.replace('#', '');
  if (location.pathname === '/' && legacy[h] && legacy[h] !== '/') location.replace(legacy[h]);

  // small helpers other page scripts use
  window.MC = { toast, openDialog, tally, esc: (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) };
})();
