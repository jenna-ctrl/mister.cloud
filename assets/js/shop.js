/* /shop: renders the catalogue (assets/js/catalog.js) in two groups:
   "Available now" (AVAILABLE_NOW in config.js) and "Pre-order 2027".
   Age chips, availability chips, type tabs and sort narrow it down; the product
   dialog handles Buy now / Pre-order / licensing / free-guide buttons.
   Deep links: /shop?avail=now|preorder   /shop?age=tots|kids|teens|grownups|educators
               /shop?tab=books|play|tools|merch   /shop?cat=<CATS key, e.g. music>
               /shop?product=<id> opens that product */
(function () {
  'use strict';

  const TABS = {
    all: null,
    books: ['board', 'book', 'jungle', 'teen'],
    play: ['toy', 'music'],
    programs: ['edu'],
    tools: ['device', 'elder', 'bundle', 'app'],
    merch: ['apparel', 'merch'],
  };
  const AGES = {
    all: null,
    tots: ['tots'], kids: ['kids'], teens: ['teens'],
    grownups: ['family', 'grandparents'], educators: ['educators'],
  };
  // Placeholder art tint per category (Clear Sky pastel tints, lightened).
  const TINT = {
    board: '#D3E3EC', book: '#D6DEE5', jungle: '#DCE3D3', teen: '#DADDE7', music: '#E3DDE9',
    toy: '#F1DED5', device: '#EFE3CF', elder: '#F2E0CF', edu: '#E5E2DA', bundle: '#E7E1EE', app: '#DADDE7',
    apparel: '#D6E4EE', merch: '#F1E6D2',
  };

  const isNow = (p) => !AVAILABLE_NOW.except.includes(p.id) && (AVAILABLE_NOW.ids.includes(p.id) || AVAILABLE_NOW.cats.includes(p.cat));
  const NOW_COUNT = PRODUCTS.filter(isNow).length;
  const PRE_COUNT = PRODUCTS.length - NOW_COUNT;

  const params = new URLSearchParams(location.search);
  const pick = (key, table) => (table[params.get(key)] !== undefined ? params.get(key) : 'all');
  const state = {
    age: pick('age', AGES),
    tab: pick('tab', TABS),
    avail: ['now', 'preorder'].includes(params.get('avail')) ? params.get('avail') : null,
    cat: CATS[params.get('cat')] ? params.get('cat') : null,   // narrow deep-link filter
    sort: 'featured',
  };
  const ORDER = new Map(PRODUCTS.map((p, i) => [p.id, i]));
  const priceLabel = (p) => p.priceLabel || (p.price > 0 ? '$' + (Number.isInteger(p.price) ? p.price : p.price.toFixed(2)) : 'Free');

  function actionFor(p) {
    const now = isNow(p);
    const url = STRIPE_LINKS[p.id];
    if (p.cat === 'edu' && !(p.price > 0)) return { kind: 'program', label: 'Ask about this program' };   // until its price is set
    if (/contact|licens/i.test(p.priceLabel || '')) return { kind: 'contact', label: 'Contact for licensing' };
    if ((p.priceLabel || '').toLowerCase() === 'free') return { kind: 'free', label: 'Request the free guide' };
    if (url) return { kind: 'stripe', url, label: now ? 'Buy now' : 'Pre-order now' };
    return { kind: 'soon', label: now ? 'Buy now' : 'Pre-order now' };
  }
  const badgeFor = (p) => (isNow(p) ? '<span class="badge badge-now badge-float">Available now</span>' : '<span class="badge badge-sage badge-float">Pre-order</span>');

  function media(p, big) {
    if (p.img) return `<img src="${p.img}" alt="${MC.esc(p.name)}" loading="lazy">`;
    return `<div class="product-ph" style="--ph:${TINT[p.cat] || '#F6EFE3'}">
      <span class="ph-emoji" aria-hidden="true" style="${big ? 'font-size:96px' : ''}">${p.emoji || '☁️'}</span>
      <img class="ph-mark" src="/assets/img/mark-512.webp?v=3" alt="" aria-hidden="true">
    </div>`;
  }

  function visible() {
    const list = PRODUCTS.filter((p) => {
      if (state.cat && p.cat !== state.cat) return false;
      if (TABS[state.tab] && !TABS[state.tab].includes(p.cat)) return false;
      if (AGES[state.age] && !p.age.some((a) => AGES[state.age].includes(a))) return false;
      if (state.avail === 'now' && !isNow(p)) return false;
      if (state.avail === 'preorder' && isNow(p)) return false;
      return true;
    });
    const num = (p) => (p.price > 0 ? p.price : Infinity);
    const by = {
      featured: (a, b) => (a.featured || 999) - (b.featured || 999) || ORDER.get(a.id) - ORDER.get(b.id),
      'price-asc': (a, b) => num(a) - num(b),
      'price-desc': (a, b) => (b.price || -1) - (a.price || -1),
      name: (a, b) => a.name.replace(/[“”"]/g, '').localeCompare(b.name.replace(/[“”"]/g, '')),
    };
    return list.slice().sort(by[state.sort]);
  }

  const card = (p) => `
      <article class="card product-card">
        <div class="card-media">${media(p)}${badgeFor(p)}</div>
        <div class="card-body">
          <div>
            <span class="card-eyebrow">${MC.esc(CATS[p.cat].label)}</span>
            <h3 class="card-title">${MC.esc(p.name)}</h3>
            <p class="product-price">${MC.esc(priceLabel(p))}</p>
          </div>
          <button class="btn btn-primary btn-sm" type="button" data-product="${p.id}" aria-label="View details: ${MC.esc(p.name)}">View details</button>
        </div>
      </article>`;

  function group(id, badge, title, sub, list, more) {
    return `<section class="shop-group" id="${id}" aria-labelledby="${id}-title">
      <div class="group-head">${badge}<h3 class="h3" id="${id}-title">${title}</h3><p class="muted">${sub}</p></div>
      <div class="grid-3">${list.map(card).join('')}</div>
      ${more ? `<div class="show-all"><button class="btn btn-outline" type="button" data-avail-more="${more.avail}">${more.label}</button></div>` : ''}
    </section>`;
  }

  const results = document.getElementById('shop-results');
  const count = document.getElementById('shop-count');

  function render() {
    const filtered = state.age !== 'all' || state.tab !== 'all' || state.cat || state.avail;
    const list = visible();

    if (!filtered && state.sort === 'featured') {
      // Default view: a few highlights from each group, so visitors see what they can buy today first.
      const now = list.filter(isNow), pre = list.filter((p) => !isNow(p));
      const top = (arr) => arr.slice(0, 3);   // already sorted featured-first
      count.textContent = `${NOW_COUNT} available now · ${PRE_COUNT} in pre-order for ${LAUNCH_DATE}`;
      results.innerHTML =
        group('available-now', '<span class="badge badge-now">Available now</span>', 'Start today',
          'Books, learning programs and the Mister Cloud plush. Order now; these don’t wait for launch day.', top(now), { avail: 'now', label: `See all ${NOW_COUNT} available now` }) +
        group('preorder', '<span class="badge badge-sage">Pre-order</span>', `The 2027 collection`,
          `Reserve yours now. Official launch ${LAUNCH_DATE}; pre-orders ship from ${PREORDER_SHIPS}.`, top(pre), { avail: 'preorder', label: `See all ${PRE_COUNT} pre-order products` });
    } else {
      const label = state.avail === 'now' ? ' available now' : state.avail === 'preorder' ? ' in pre-order' : '';
      count.textContent = `Showing ${list.length} of ${PRODUCTS.length} products${label}${state.cat ? ` · ${CATS[state.cat].label}` : ''}`;
      results.innerHTML = list.length
        ? `<div class="grid-3">${list.map(card).join('')}</div>`
        : '<div class="empty-state"><strong>Nothing here yet</strong>Try another age, product type or availability.</div>';
    }

    document.querySelectorAll('#shop-chips [data-age]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.age === state.age)));
    document.querySelectorAll('#shop-chips [data-avail]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.avail === state.avail)));
    document.querySelectorAll('#type-tabs .tab').forEach((t) => {
      t.setAttribute('aria-selected', String(t.dataset.tab === state.tab));
      if (t.dataset.tab === 'merch') t.hidden = !PRODUCTS.some((p) => TABS.merch.includes(p.cat));   // appears once merch exists
    });

    // keep the URL shareable without adding history entries
    const q = new URLSearchParams();
    if (state.avail) q.set('avail', state.avail);
    if (state.age !== 'all') q.set('age', state.age);
    if (state.tab !== 'all') q.set('tab', state.tab);
    if (state.cat) q.set('cat', state.cat);
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
  }

  document.getElementById('shop-chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    if (c.dataset.age) state.age = c.dataset.age;
    if (c.dataset.avail) state.avail = state.avail === c.dataset.avail ? null : c.dataset.avail;   // toggles
    render();
  });
  document.getElementById('type-tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab'); if (!t) return;
    state.tab = t.dataset.tab; state.cat = null; render();
  });
  const sortEl = document.getElementById('sort');
  sortEl.addEventListener('change', () => { state.sort = sortEl.value; render(); });

  // hero buttons + "See all …" buttons switch to that availability
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-avail-more]'); if (!b) return;
    e.preventDefault();
    state.avail = b.dataset.availMore; render();
    document.getElementById('products').scrollIntoView();
  });

  // ---- product dialog ----
  const dlg = document.getElementById('product-modal');
  results.addEventListener('click', (e) => {
    const b = e.target.closest('[data-product]'); if (!b) return;
    openProduct(b.dataset.product);
  });

  function openProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id); if (!p) return;
    const now = isNow(p);
    const $ = (i) => document.getElementById(i);
    $('pm-media').innerHTML = media(p, true);
    $('pm-cat').textContent = CATS[p.cat].label;
    $('pm-age').textContent = p.ageLabel;
    $('pm-title').textContent = p.name;
    $('pm-desc').textContent = p.desc || p.blurb;
    $('pm-teaches').innerHTML = p.teaches && p.teaches.length
      ? `<p class="label" style="margin-bottom:8px">What it teaches</p><ul class="checklist">${p.teaches.map((t) => `<li>${MC.esc(t)}</li>`).join('')}</ul>`
      : '';
    $('pm-price').textContent = priceLabel(p);

    const a = actionFor(p);
    const buy = $('pm-buy'), tag = $('pm-tag'), fine = $('pm-fine');
    buy.textContent = a.label;
    tag.className = 'badge ' + (now ? 'badge-now' : 'badge-sage');
    tag.textContent = now ? 'Available now' : `Pre-order · ships from ${PREORDER_SHIPS}`;
    tag.hidden = a.kind === 'free';
    if (a.kind === 'stripe') {
      fine.textContent = now
        ? 'Available now. Secure checkout via Stripe.'
        : `You’ll be charged today to reserve your order. Official launch ${LAUNCH_DATE}; ships from ${PREORDER_SHIPS}. Secure checkout via Stripe.`;
      buy.onclick = () => window.open(a.url, '_blank', 'noopener');
    } else if (a.kind === 'program') {
      fine.textContent = 'Available now. Pricing is being finalized; email us and we’ll get your family or class started.';
      buy.onclick = () => { location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Learning program: ' + p.name)}`; };
    } else if (a.kind === 'contact') {
      fine.textContent = 'Available now for schools, libraries and care settings. We’ll reply with licensing options and pricing.';
      buy.onclick = () => { location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Licensing enquiry: ' + p.name)}`; };
    } else if (a.kind === 'free') {
      fine.textContent = 'We’ll email you the free guide.';
      buy.onclick = () => { location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Free guide request: ' + p.name)}`; };
    } else {
      const what = now ? 'checkout' : 'pre-order';
      fine.textContent = `The ${what} link is being added. Join the list below and we’ll email you the moment it’s ready.`;
      buy.onclick = () => { dlg.close(); MC.toast(`The ${what} link is being added. Join the list below. ☁️`); document.getElementById('nl-email').focus(); };
    }
    MC.openDialog(dlg);
  }

  // ---- config-driven bits ----
  document.querySelectorAll('[data-launch]').forEach((el) => { el.textContent = LAUNCH_DATE; });
  const fc = document.getElementById('founding-count');
  if (fc && typeof FOUNDING_FAMILIES === 'number' && FOUNDING_FAMILIES > 0) {
    fc.textContent = `Join ${FOUNDING_FAMILIES.toLocaleString()} founding families and counting ☁️`;
    fc.hidden = false;
  }

  render();
  if (params.get('product')) openProduct(params.get('product'));
})();
