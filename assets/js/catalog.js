/* =========================================================================
   Mister Cloud catalogue: the single source of truth for products.
   Rendered by assets/js/shop.js and read by scripts/shopify-sync.mjs.

   Each product: id, name, cat, age[], ageLabel, price (0 = use priceLabel),
   priceLabel?, emoji (placeholder art), img? (real photo), featured? (sort
   order for "Featured"), blurb, desc?, teaches?
   ========================================================================= */

const CATS = {
  board:  { label: 'Board Book',       theme: 'sky',    logo: 'idea' },
  book:   { label: 'Picture Book',     theme: 'blue',   logo: 'idea' },
  jungle: { label: 'Digital Jungle',   theme: 'green',  logo: 'explorer' },
  teen:   { label: 'Teen Guide',       theme: 'teal',   logo: 'idea' },
  music:  { label: 'Songs & Music',    theme: 'purple', logo: 'rainbow' },
  toy:    { label: 'Toy & Plush',      theme: 'pink',   logo: 'rainbow' },
  device: { label: 'Device & Tool',    theme: 'amber',  logo: 'lock' },
  app:    { label: 'Zero-Data App',    theme: 'indigo', logo: 'lock' },
  elder:  { label: 'Grandparent Mode', theme: 'orange', logo: 'lock' },
  edu:    { label: 'Learning Program', theme: 'slate',  logo: 'rainbow' },
  bundle: { label: 'Bundle',           theme: 'bundle', logo: 'rainbow' },
  apparel: { label: 'Apparel',         theme: 'sky',    logo: 'rainbow' },
  merch:  { label: 'Merch',            theme: 'amber',  logo: 'rainbow' },
};

const PRODUCTS = [
  // Board books (Tots)
  { id:'tap-tap', name:'“Tap, Tap, Mister Cloud”', cat:'board', age:['tots'], ageLabel:'Tots 0–3', price:9, emoji:'👆', blurb:'A gentle first look at touchscreens and the friendly icons a child taps every day.', teaches:['Recognize the screen and its basic icons','First words: yes, no, and ask'] },
  { id:'click-clack', name:'“Click, Clack, Mister Cloud”', cat:'board', age:['tots'], ageLabel:'Tots 0–3', price:9, emoji:'⌨️', blurb:'An introduction to keyboard devices and the physical sounds of digital interaction.' },
  { id:'camera-eye', img:'/assets/img/p-camera-eye.webp', featured:1, name:'The Camera Eye', cat:'board', age:['tots','kids'], ageLabel:'Tots & Kids', price:9, emoji:'📷', blurb:'Meet the little lens that can see, and learn to say “off you go” until we choose to share.', teaches:['Cameras and consent','“Wait until someone we know says hello.”'] },
  { id:'microphone-ear', img:'/assets/img/p-microphone-ear.webp', featured:2, name:'The Microphone Ear', cat:'board', age:['tots','kids'], ageLabel:'Tots & Kids', price:9, emoji:'🎤', blurb:'What can the microphone ear hear? A calm intro to when a device is listening.' },
  { id:'forever-box', img:'/assets/img/p-forever-box.webp', featured:3, name:'The Forever Box', cat:'board', age:['tots','kids'], ageLabel:'Tots & Kids', price:9, emoji:'📦', blurb:'Some things, once shared, stay forever. A gentle first idea about the permanence of posting.' },
  { id:'cloud-lock-camera', name:'“Cloud, Lock, Camera”', cat:'board', age:['tots'], ageLabel:'Tots 0–3', price:8, emoji:'🔒', blurb:'A high-contrast first-words board book of the icons that run a child’s digital world.' },
  { id:'peekaboo', name:'“Peekaboo, Mister Cloud”', cat:'board', age:['tots'], ageLabel:'Tots 0–3', price:10, emoji:'👀', blurb:'A lift-the-flap game of hide-and-seek that introduces cameras, sensors, and permission.' },

  // Physical-Internet mini-series (Kids)
  { id:'where-picture-go', name:'Where Does My Picture Go?', cat:'book', age:['kids'], ageLabel:'Kids 4–7', price:12, emoji:'🖼️', blurb:'A slider book that follows a photo from tablet to router, through a path, to a family member.', desc:'A slider book that follows a photo from tablet to router, through a path, to a family member. It ends where every Mister Cloud story ends: pause before sharing.', teaches:['The internet has a body','Pause before you share'] },
  { id:'ocean-road', name:'Under the Ocean Internet Road', cat:'book', age:['kids'], ageLabel:'Kids 4–7', price:12, emoji:'🌊', blurb:'A lift-the-flap ocean book revealing that some messages travel through cables under the sea.' },
  { id:'cloud-sleeps', name:'Where Mister Cloud Sleeps', cat:'book', age:['kids'], ageLabel:'Kids 4–7', price:12, emoji:'🏢', blurb:'A data-center book showing that “the cloud” is real computer buildings, not just sky clouds.' },
  { id:'this-town', name:'This Town, That Town', cat:'book', age:['kids'], ageLabel:'Kids 5–8', price:12, emoji:'🗺️', blurb:'A comparison book: why places with different ground infrastructure can have different internet.' },
  { id:'sky-internet', name:'Internet From the Sky', cat:'book', age:['kids'], ageLabel:'Kids 5–8', price:12, emoji:'🛰️', blurb:'A later-stage satellite book showing how new pathways reach places that are hard to wire.' },
  { id:'map-the-web', name:'Map The Web', cat:'book', age:['kids'], ageLabel:'Kids 4–12', price:13, emoji:'🕸️', blurb:'An introduction to the physical body of the internet and how data and media move around the world.' },
  { id:'message-journey-book', name:'The Message Journey Storybook', cat:'book', age:['kids'], ageLabel:'Kids 4–12', price:14, emoji:'✉️', blurb:'The printed companion to the app: follow a photo through 13 real stops from your device to grandma’s.' },
  { id:'coastal-lab', name:'Coastal Weather Lab Activity Guide', cat:'book', age:['kids'], ageLabel:'Kids 6–12', price:12, emoji:'⛅', blurb:'An explorer’s guide to reading the sky: sea breezes, rain curtains, and cloud “traffic,” all linking real clouds to Mister Cloud.' },

  // Digital Jungle (Kids)
  { id:'magic-moth', name:'The Magic Moth', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦋', blurb:'Book 1: Facial recognition. The Snapping Bird photographs everyone without asking; the Moth’s owl-eye patterns confuse the camera.', teaches:['Cameras and consent','Automated vision can be imperfect'] },
  { id:'dazzle-zebra', name:'The Dazzle Zebra', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦓', blurb:'Book 2: Data profiling. When the zebras run together their stripes become a puzzle, and the Sorting Lion drops his labels.', teaches:['Data obfuscation','Say no to unnecessary collection'] },
  { id:'quiet-chameleon', name:'The Quiet Chameleon', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦎', blurb:'Book 3: Geolocation. The Chameleon changes colors, says “No thank you,” and the Seeking Snake slides past.', teaches:['Opting out of location sharing'] },
  { id:'leopard-leaves', name:'The Leopard in the Leaves', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🐆', blurb:'Book 4: Phishing & scams. A tricky link hides like a leopard in leaves; pausing reveals the clues.', teaches:['The power of the pause','Ask a trusted grown-up'] },
  { id:'jungle-set', name:'Digital Jungle: Complete 4-Book Set', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:40, emoji:'📚', blurb:'All four Masters of Camouflage stories in one gift box.' },

  // Teens
  { id:'whats-wifi', name:'“What’s Wi-Fi?”', cat:'teen', age:['teens'], ageLabel:'Teens 13–18', price:11, emoji:'📶', blurb:'Breaking down local networking and signal privacy with Mister Cloud.' },
  { id:'whats-bluetooth', name:'“What’s Bluetooth?”', cat:'teen', age:['teens'], ageLabel:'Teens 13–18', price:11, emoji:'🔵', blurb:'Understanding device-to-device connections, proximity, and peripheral permissions.' },
  { id:'whats-vpn', name:'“What’s a VPN?”', cat:'teen', age:['teens'], ageLabel:'Teens 13–18', price:11, emoji:'🛡️', blurb:'What a private tunnel really does, and what it doesn’t hide.' },
  { id:'whats-cookie', name:'“What’s a Cookie?”', cat:'teen', age:['teens'], ageLabel:'Teens 13–18', price:11, emoji:'🍪', blurb:'Trackers, sessions, and the crumbs we leave behind as we browse.' },
  { id:'whats-cloud-really', name:'“What’s the Cloud, Really?”', cat:'teen', age:['teens'], ageLabel:'Teens 13–18', price:11, emoji:'☁️', blurb:'The teen-level truth: the cloud is someone else’s computer, in a real building, run by a real company.' },

  // Toys & Plush
  { id:'mc-plush', img:'/assets/img/p-plush.webp', featured:4, name:'Mister Cloud Plush', cat:'toy', age:['tots','kids'], ageLabel:'Tots & Kids', price:15, emoji:'🧸', blurb:'The friendly face of the whole system: soft, huggable, and always ready to pause. Machine-made.' },
  { id:'mc-plush-handmade', img:'/assets/img/p-plush.webp', name:'Hand-Stitched Mister Cloud + Book of Choice', cat:'toy', age:['tots','kids','family'], ageLabel:'Tots, Kids & Gifts', price:150, emoji:'🪡', blurb:'A hand-stitched Mister Cloud, made one at a time, paired with the Mister Cloud book of your choice.', desc:'A hand-stitched Mister Cloud, made one at a time, paired with the Mister Cloud book of your choice. A keepsake for a new baby, a grandchild, or a first library.', teaches:['A keepsake that starts the pause habit','Pick any Mister Cloud book to go with it'] },

  // Devices & Tools
  { id:'armor-pack', img:'/assets/img/p-armor-pack.webp', featured:6, name:'Mister Cloud Armor Pack', cat:'device', age:['family'], ageLabel:'Everyone', price:24, emoji:'🛡️', blurb:'Sliding camera covers, microphone blockers, and RFID-protection cases for phones, tablets, and computers.' },
  { id:'cone-silence', name:'Cone of Digital Silence', cat:'device', age:['family'], ageLabel:'Family', price:0, priceLabel:'Pre-order', emoji:'⛺', blurb:'A space-saving mesh Faraday tent for phones: slip devices inside and notifications simply stop, so families share an unbroken hour together. No jammer, just physics.' },
  { id:'no-thank-you-buttons', name:'“No Thank You” Button Pack', cat:'device', age:['kids','family'], ageLabel:'Kids & Family', price:6, emoji:'🔘', blurb:'Real press-me buttons for practicing the calm, confident “no thank you.”' },

  // Zero-Data Apps

  // Grandparent Mode
  { id:'scam-guide', name:'Scam-Spotter Field Guide', cat:'elder', age:['grandparents'], ageLabel:'Grandparents 60+', price:12, emoji:'🔎', blurb:'Recognize phishing, fake prizes, and manipulative interfaces, and the pause that stops a scam.' },
  { id:'password-kit', name:'Password Hygiene Starter Kit', cat:'elder', age:['grandparents','family'], ageLabel:'Grandparents 60+', price:14, emoji:'🔑', blurb:'A simple, paper-first system for strong passwords without the overwhelm.' },
  { id:'safety-checklist', name:'Family Device-Safety Checklist', cat:'elder', age:['grandparents','family'], ageLabel:'Grandparents & Family', price:0, priceLabel:'Free', emoji:'📋', blurb:'A free printable checklist for safer shared-device use with grandchildren.' },
  { id:'concierge-audit', name:'Concierge Device Audit', cat:'elder', age:['grandparents','family'], ageLabel:'Grandparents & Family', price:0, priceLabel:'From $79', emoji:'🤝', blurb:'A guided one-on-one session to set up and secure the whole household’s devices.' },

  // Learning programs (available now; prices to be set: price 0 + priceLabel 'Pricing soon')
  { id:'program-babies-tots', featured:7, name:'Babies and Tots', cat:'edu', age:['tots','family'], ageLabel:'Babies & Tots 0–3', price:0, priceLabel:'Pricing soon', emoji:'🍼', blurb:'A gentle first program for the youngest explorers: board books, songs and tiny daily routines that start the pause habit early.', teaches:['First words for cameras, microphones and screens','The pause before sharing, as a song and a game'] },
  { id:'program-tech-at-school', featured:8, name:'Tech At School', cat:'edu', age:['kids','teens','educators'], ageLabel:'Kids, Teens & Educators', price:0, priceLabel:'Pricing soon', emoji:'🏫', blurb:'Classroom-ready lessons that make the internet’s body visible: devices, routers, cables, data centers and the choices we make.', teaches:['The internet has a physical body','Consent, permissions and the pause'] },
  { id:'program-grandparent-mode', featured:9, name:'Grandparent Mode', cat:'edu', age:['grandparents','family'], ageLabel:'Grandparents & Family', price:0, priceLabel:'Pricing soon', emoji:'👵', blurb:'Plain-language sessions for grandparents: device setup, scam spotting, and kid-safe settings for time with the grandchildren.', teaches:['Spot scams and tricky links','Shared-device settings that protect little ones'] },
  { id:'program-home-schooler', featured:10, name:'Home Schooler’s Guide', cat:'edu', age:['kids','family','educators'], ageLabel:'Kids & Families', price:0, priceLabel:'Pricing soon', emoji:'🏡', blurb:'A flexible, self-paced guide for home-schooling families, with activities you can run at the kitchen table.', teaches:['Week-by-week activities for every age','Hands-on, off-screen discovery'] },

  // Bundles
  { id:'first-launch', name:'The First-Launch Family Bundle', cat:'bundle', age:['family','tots','kids'], ageLabel:'Family', price:45, emoji:'🎁', blurb:'The recommended starter set for a new Mister Cloud family.', desc:'The recommended starter set: the “No Thank You” board book, a Mister Cloud plush, the family privacy cards, a grandparent device-safety checklist, and the zero-data mini app.', teaches:['One shared family language across generations'] },
  { id:'armor-kit', name:'Mister Cloud Armor Kit', cat:'bundle', age:['kids','family'], ageLabel:'Kids & Family', price:55, emoji:'🧱', blurb:'The Digital Jungle four-book set plus the physical tools: camouflage caps and the Spot-the-Trick magnifying glass.' },
];
