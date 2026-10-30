/* /play: filterable activities + activity dialog. */
(function () {
  'use strict';

  // type: hands-on | songs   ages: tots | k47 | k812 | together
  const ACTIVITIES = [
    {
      id: 'spot-the-sensor', img: '/assets/img/activity-sensor.webp', alt: 'Felt toys: a camera, a microphone and a phone.',
      eyebrow: 'Look around', title: 'Spot the sensor', meta: 'Ages 3+ · Play together',
      types: ['hands-on'], ages: ['tots', 'k47', 'together'],
      intro: 'Devices have little eyes and ears. Go on a calm treasure hunt to find them.',
      need: ['A room with a few devices (phone, tablet, TV, speaker)', 'Sticky notes or paper stars'],
      steps: ['Pick one room and walk around it slowly together.', 'Point to anything with a camera eye or a microphone ear. Place a star beside it.', 'Count the stars. Were there more than you guessed?', 'Choose one device and find where its camera or microphone setting lives.'],
      talk: 'Which of these can see? Which can hear? When do we want them to?',
    },
    {
      id: 'trace-a-message', img: '/assets/img/activity-trace.webp', alt: 'A wooden lacing board threaded with coloured yarn.',
      eyebrow: 'Follow a message', title: 'Trace a message', meta: 'Ages 4+ · Hands-on',
      types: ['hands-on'], ages: ['k47', 'k812', 'together'],
      intro: 'A message is not magic. It travels along real paths, and you can trace one with yarn.',
      need: ['Yarn or string', 'Four paper cards: Device, Router, Data center, Family', 'Tape'],
      steps: ['Tape the four cards around the room, far apart.', 'Start at Device. Unroll the yarn to Router, then Data center, then Family.', 'Walk the path together, saying each stop out loud.', 'Ask: if we cut the yarn, would the message still arrive?'],
      talk: 'Where do you think a photo goes after you press send?',
    },
    {
      id: 'practice-the-pause', img: '/assets/img/activity-pause.webp', alt: 'Hands holding a card that reads “Pause before you share.”',
      eyebrow: 'Good habits together', title: 'Practice the pause', meta: 'All ages · Everyday habit',
      types: ['hands-on', 'songs'], ages: ['tots', 'k47', 'k812', 'together'],
      intro: 'One calm breath before sharing. Practice it like a game until it becomes a habit.',
      need: ['A “Pause” card (draw one, or print one from the Learn page)'],
      steps: ['Pretend to take a photo, send a message, or answer a pop-up.', 'Before you “press,” hold up the Pause card and take one slow breath.', 'Ask together: what is it, who sees it, do we want to share?', 'Say it with a smile: “No thank you, Mister Cloud,” or “Yes, we choose to share.”'],
      talk: 'What is one thing we would always pause before sharing?',
    },
    {
      id: 'story-time', img: '/assets/img/card-books.webp?v=3', alt: 'Three felt-covered board books.',
      eyebrow: 'Read & wonder', title: 'Story time: The Camera Eye', meta: 'Ages 0–3 · Read together',
      types: ['songs'], ages: ['tots', 'together'],
      intro: 'A gentle first story about the little lens that can see, and how we choose when to share.',
      need: ['Any picture book, or The Camera Eye board book', 'A phone or tablet to point at'],
      steps: ['Read the story slowly, pointing at each picture.', 'Find the camera eye on a real device nearby.', 'Cover it with your hand and say “off you go” together.'],
      talk: 'Who would we like to say hello to through a camera?',
      cta: { href: '/shop?tab=books', label: 'See the board books' },
    },
    {
      id: 'tech-tea', img: '/assets/img/card-together.webp?v=3', alt: 'A grandmother and child reading a tablet together.',
      eyebrow: 'Learn together', title: 'Grandparent tech tea', meta: 'All ages · Together',
      types: ['hands-on'], ages: ['k812', 'together'],
      intro: 'Swap roles: the child becomes the guide and shows a grandparent one setting, one sensor and one pause.',
      need: ['A cup of tea', 'One shared device', 'Twenty calm minutes'],
      steps: ['The child picks one device and explains what it can see or hear.', 'Together, find one privacy setting and read it aloud.', 'Grandparent shares one thing they would never post, and why.'],
      talk: 'What did each of us learn from the other today?',
    },
  ];

  const grid = document.getElementById('activity-grid');
  const chips = document.querySelectorAll('#play-filters .chip');
  let type = 'all';
  let age = null;

  function card(a) {
    return `<article class="card">
      <div class="card-media"><img src="${a.img}" alt="${MC.esc(a.alt)}" loading="lazy"${a.pos ? ` style="object-position:${a.pos}"` : ''}></div>
      <div class="card-body">
        <span class="card-eyebrow">${MC.esc(a.eyebrow)}</span>
        <h3 class="card-title">${MC.esc(a.title)}</h3>
        <p class="card-meta">${MC.esc(a.meta)}</p>
        <button class="link-arrow" type="button" data-activity="${a.id}">See the activity</button>
      </div>
    </article>`;
  }

  function render() {
    const list = ACTIVITIES.filter((a) => (type === 'all' || a.types.includes(type)) && (!age || a.ages.includes(age)));
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="empty-state"><strong>Nothing here yet</strong>More activities are on the way. Try another filter.</div>';
    chips.forEach((c) => {
      const on = c.dataset.type ? c.dataset.type === type : c.dataset.age === age;
      c.setAttribute('aria-pressed', String(on));
    });
  }

  chips.forEach((c) => c.addEventListener('click', () => {
    if (c.dataset.type) type = c.dataset.type;
    else age = age === c.dataset.age ? null : c.dataset.age;   // age chips toggle
    render();
  }));

  document.getElementById('show-hands-on').addEventListener('click', () => {
    type = 'hands-on'; age = null; render();
    document.getElementById('activities').scrollIntoView();
  });

  document.querySelectorAll('[data-focus-newsletter]').forEach((a) => a.addEventListener('click', () => {
    setTimeout(() => document.getElementById('nl-email').focus({ preventScroll: true }), 400);
  }));

  // ---- dialog ----
  const dlg = document.getElementById('activity-modal');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-activity]');
    if (!btn) return;
    const a = ACTIVITIES.find((x) => x.id === btn.dataset.activity);
    if (!a) return;
    const $ = (id) => document.getElementById(id);
    $('am-img').src = a.img; $('am-img').alt = a.alt;
    $('am-eyebrow').textContent = a.eyebrow;
    $('am-title').textContent = a.title;
    $('am-meta').textContent = a.meta;
    $('am-intro').textContent = a.intro;
    $('am-need').innerHTML = a.need.map((n) => `<li>${MC.esc(n)}</li>`).join('');
    $('am-steps').innerHTML = a.steps.map((s) => `<li>${MC.esc(s)}</li>`).join('');
    $('am-talk').textContent = a.talk;
    $('am-cta').innerHTML = a.cta ? `<a class="btn btn-primary" href="${a.cta.href}">${MC.esc(a.cta.label)}</a>` : '';
    MC.openDialog(dlg);
  });

  render();
})();
