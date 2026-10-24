/* /nearme: design-preview discovery finder. Listings are illustrative examples
   until a real listings source is connected (see LISTINGS below). */
(function () {
  'use strict';

  // kind: event | space | tour.  minAge/maxAge drive the Age filter.
  const LISTINGS = [
    {
      n: 1, kind: 'event', kindLabel: 'Example event', title: 'Follow a Message Workshop',
      meta: 'Library activity · Ages 4–8', link: 'View event details',
      img: '/assets/img/listing-workshop.webp', alt: 'A felt tablet showing a Wi-Fi sign, wrapped in yarn.',
      minAge: 4, maxAge: 8, free: true, when: 'week', access: ['step-free', 'sensory'],
      desc: 'Children trace a message with yarn from a tablet to a router, a data center and back to family, then practice the pause.',
      facts: ['45 minutes, with a grown-up', 'Free, booking recommended', 'Step-free and sensory-friendly room'],
    },
    {
      n: 2, kind: 'space', kindLabel: 'Example learning space', title: 'Networks Discovery Lab',
      meta: 'Hands-on exhibits · Family visit', link: 'Explore the space',
      img: '/assets/img/listing-lab.webp', alt: 'A felt house and a cell tower connected by yarn to servers.',
      minAge: 6, maxAge: 99, free: false, when: 'any', access: ['step-free'],
      desc: 'A science-center gallery where families send signals between towers, peek inside a router and see fiber light up.',
      facts: ['Drop in during opening hours', 'Included with museum entry', 'Step-free access'],
    },
    {
      n: 3, kind: 'tour', kindLabel: 'Example tour', title: 'Inside a Data Center',
      meta: 'Guided visit · Age limits vary', link: 'Check tour requirements',
      img: '/assets/img/listing-datacenter.webp', alt: 'A felt data center with an open door and rows of servers.',
      minAge: 13, maxAge: 99, free: true, when: 'month', access: [],
      desc: 'A guided walk through the cooling, power and server halls that keep “the cloud” running. Photo ID and advance booking are usually required.',
      facts: ['Advance booking and photo ID usually required', 'Minimum age set by the host', 'Ask the host about access'],
    },
  ];

  const $ = (id) => document.getElementById(id);
  const list = $('listings');
  const results = $('results');
  const state = { kind: 'all', age: '', date: '', free: '', access: '' };

  function matches(l) {
    if (state.kind !== 'all' && l.kind !== state.kind) return false;
    if (state.age) { const [lo, hi] = state.age.split('-').map(Number); if (hi < l.minAge || lo > l.maxAge) return false; }   // age ranges overlap
    if (state.date === 'week' && l.when !== 'week') return false;
    if (state.date === 'month' && l.when === 'any') return false;
    if (state.free === 'free' && !l.free) return false;
    if (state.access && !l.access.includes(state.access)) return false;
    return true;
  }

  function render() {
    const items = LISTINGS.filter(matches);
    list.innerHTML = items.length ? items.map((l) => `
      <article class="card listing" data-n="${l.n}">
        <div class="listing-media"><img src="${l.img}" alt="${MC.esc(l.alt)}" loading="lazy"><span class="pin-num" aria-hidden="true">${l.n}</span></div>
        <div>
          <span class="badge badge-sky">${MC.esc(l.kindLabel)}</span>
          <h3>${MC.esc(l.title)}</h3>
          <p class="card-meta">${MC.esc(l.meta)}</p>
          <button class="link-arrow" type="button" data-listing="${l.n}" style="margin-top:10px">${MC.esc(l.link)}</button>
        </div>
      </article>`).join('')
      : '<div class="empty-state"><strong>No example listings match</strong>In the live version you’ll see every nearby discovery here. Try clearing a filter.</div>';
    document.querySelectorAll('#kind-chips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === state.kind)));
    document.querySelectorAll('.map-ring').forEach((r) => r.style.display = items.some((l) => String(l.n) === r.dataset.ring) ? '' : 'none');
  }

  // highlight the matching pin while a listing is hovered/focused
  function ring(n) { document.querySelectorAll('.map-ring').forEach((r) => r.classList.toggle('is-on', r.dataset.ring === String(n))); }
  list.addEventListener('mouseover', (e) => { const c = e.target.closest('.listing'); ring(c ? c.dataset.n : null); document.querySelectorAll('.listing').forEach((x) => x.classList.toggle('is-active', x === c)); });
  list.addEventListener('mouseleave', () => { ring(null); document.querySelectorAll('.listing').forEach((x) => x.classList.remove('is-active')); });
  list.addEventListener('focusin', (e) => { const c = e.target.closest('.listing'); if (c) ring(c.dataset.n); });

  // filters
  $('kind-chips').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { state.kind = c.dataset.kind; render(); } });
  [['f-age', 'age'], ['f-date', 'date'], ['f-free', 'free'], ['f-access', 'access']].forEach(([id, key]) => {
    $(id).addEventListener('change', (e) => { state[key] = e.target.value; render(); });
  });

  // search
  $('near-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = $('zip').value.trim();
    if (!/^\d{5}$/.test(zip)) { MC.toast('Please enter a 5-digit ZIP code.'); $('zip').focus(); return; }
    $('zip-label').textContent = zip;
    MC.toast(`Live listings near ${zip} are coming soon. Showing examples for now. ☁️`);
    $('results-title').scrollIntoView({ block: 'start' });
  });
  $('zip').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5); });

  // list / map view
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    const map = b.dataset.view === 'map';
    results.classList.toggle('map-only', map);
    results.classList.toggle('list-only', !map);
    document.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  // listing dialog
  const dlg = $('listing-modal');
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-listing]'); if (!b) return;
    const l = LISTINGS.find((x) => String(x.n) === b.dataset.listing);
    $('lm-img').src = l.img; $('lm-img').alt = l.alt;
    $('lm-kind').textContent = l.kindLabel;
    $('lm-title').textContent = l.title;
    $('lm-meta').textContent = l.meta;
    $('lm-desc').textContent = l.desc;
    $('lm-facts').innerHTML = l.facts.map((f) => `<li>${MC.esc(f)}</li>`).join('');
    MC.openDialog(dlg);
  });

  // host CTAs → email
  const mail = (subject, body) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  $('suggest-link').href = mail('Suggest a place for Mister Cloud Near Me', 'Place name:\nAddress or ZIP:\nWhat families can discover there:\nWebsite:\n');
  $('host-link').href = mail('Host a Mister Cloud discovery', 'Organization:\nType (library, museum, school, infrastructure site…):\nWhat you would like to host:\nAge range:\nAccessibility details:\n');

  render();
})();
