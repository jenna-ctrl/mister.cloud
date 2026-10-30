/* /learn: printable data receipts, the "Internet has a body" slideshow,
   downloads + anonymous tally, Web Share, and the printable field note. */
(function () {
  'use strict';

  // ---- data receipts: rows "print" one by one ------------------------------
  // Without JS every row is visible; with JS we start from just the device row.
  document.querySelectorAll('[data-receipt]').forEach((card) => {
    const rows = Array.from(card.querySelectorAll('.receipt-paper .row'));
    const btn = card.querySelector('[data-print-receipt]');
    let timers = [];
    const reset = () => { timers.forEach(clearTimeout); timers = []; rows.forEach((r, i) => { r.classList.toggle('is-hidden', i > 0); r.classList.remove('is-new'); }); };
    reset();
    btn.addEventListener('click', () => {
      if (btn.dataset.state === 'done') { reset(); btn.dataset.state = ''; btn.textContent = 'Print the receipt'; return; }
      btn.disabled = true;
      rows.slice(1).forEach((r, i) => {
        timers.push(setTimeout(() => {
          r.classList.remove('is-hidden'); r.classList.add('is-new');
          if (i === rows.length - 2) { btn.disabled = false; btn.dataset.state = 'done'; btn.textContent = 'Start again'; }
        }, 260 * (i + 1)));
      });
    });
  });

  // ---- slideshow -----------------------------------------------------------
  const SLIDES = [
    ['The internet has a body.', 'Just like our bodies have organs and muscles, the internet has physical parts that work together.'],
    ['Your device', 'Your phone, laptop or tablet is where your internet journey begins.'],
    ['The router', 'The router is the doorway from your home to the internet.'],
    ['Underground fiber', 'Fiber optic cables buried underground use light to carry information across cities and continents.'],
    ['Cell tower', 'On mobile data, your request travels through the air to a cell tower.'],
    ['Data center', 'Buildings full of computers (servers) store websites, apps and videos.'],
    ['Subsea cable', 'Under the oceans, fiber cables connect the world’s internet together.'],
    ['All together', 'Device, router, fiber, towers, data centers and subsea cables each have a job.'],
    ['A stronger, brighter internet', 'Real people. Real places. Real hardware. And now you know the internet has a body!'],
  ];
  const FILES = ['the-internet-has-a-body', 'your-device', 'the-router', 'underground-fiber', 'cell-tower', 'data-center', 'subsea-cable', 'all-together', 'a-stronger-brighter-internet'];
  const pad = (n) => String(n).padStart(2, '0');
  const img = document.getElementById('slide-img');
  const caption = document.getElementById('slide-caption');
  const dots = document.getElementById('slide-dots');
  let i = 0;

  dots.innerHTML = SLIDES.map((s, k) => `<button type="button" aria-label="Slide ${k + 1}: ${MC.esc(s[0])}"><img src="/assets/img/body-${pad(k + 1)}.webp" alt="" loading="lazy"></button>`).join('');
  // warm the cache so slide changes are instant
  SLIDES.forEach((_, k) => { const im = new Image(); im.src = `/assets/img/body-${pad(k + 1)}.webp?v=3`; });

  function show(n) {
    i = (n + SLIDES.length) % SLIDES.length;
    img.src = `/assets/img/body-${pad(i + 1)}.webp?v=3`;
    img.alt = `Slide ${i + 1} of 9. ${SLIDES[i][0]} ${SLIDES[i][1]}`;
    caption.innerHTML = `<b>${i + 1} / 9 · ${MC.esc(SLIDES[i][0].replace(/\.$/, ''))}.</b> ${MC.esc(SLIDES[i][1])} <a class="link-arrow" style="margin-left:4px" href="/assets/downloads/internet-has-a-body/mister-cloud-${pad(i + 1)}-${FILES[i]}.jpg?v=3" download data-tally="slide">Save this slide</a>`;
    dots.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  }
  document.getElementById('slide-prev').addEventListener('click', () => show(i - 1));
  document.getElementById('slide-next').addEventListener('click', () => show(i + 1));
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(Array.from(dots.children).indexOf(b)); });
  const stage = document.getElementById('slide-stage');
  stage.tabIndex = 0;
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  // swipe on touch screens
  let x0 = null;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  show(0);

  // ---- tally: one anonymous tick per download type, per browser -----------
  const note = document.getElementById('tally-note');
  function afterTally(res) {
    if (res && SHOW_TALLY_PUBLICLY && typeof res.total === 'number' && res.total > 0) {
      note.textContent = `Saved or shared by ${res.total.toLocaleString()} families so far. No cookies, no tracking.`;
    }
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-tally]');
    if (!el || el.id === 'share-btn' || el.id === 'print-note') return;
    MC.tally(el.dataset.tally).then(afterTally);
  });

  // ---- share ---------------------------------------------------------------
  const shareUrl = location.origin + '/learn#body';
  const shareText = 'The internet has a body! A free nine-slide tour from Mister Cloud.';
  document.getElementById('share-btn').addEventListener('click', async () => {
    try {
      if (navigator.canShare) {
        const blob = await fetch('/assets/downloads/internet-has-a-body/mister-cloud-internet-has-a-body.gif?v=3').then((r) => r.blob());
        const file = new File([blob], 'mister-cloud-internet-has-a-body.gif', { type: 'image/gif' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'The internet has a body', text: shareText + ' ' + shareUrl });
          MC.tally('share').then(afterTally); return;
        }
      }
      if (navigator.share) { await navigator.share({ title: 'The internet has a body', text: shareText, url: shareUrl }); MC.tally('share').then(afterTally); return; }
      await navigator.clipboard.writeText(shareUrl);
      MC.toast('Link copied. Paste it anywhere to share. ☁️');
      MC.tally('share').then(afterTally);
    } catch (err) {
      if (err && err.name === 'AbortError') return;   // user closed the share sheet
      MC.toast('Copy this link to share: ' + shareUrl);
    }
  });

  // ---- print just the field note -------------------------------------------
  document.getElementById('print-note').addEventListener('click', () => {
    MC.tally('field-note');
    document.body.classList.add('print-magnet');
    const done = () => { document.body.classList.remove('print-magnet'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1500);   // Safari doesn't always fire afterprint
  });
})();
