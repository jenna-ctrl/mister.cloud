/* =========================================================================
   PRODUCTS UNDER DEVELOPMENT (internal; NOT served on mister.cloud)
   -------------------------------------------------------------------------
   Hidden from the shop on 2026-10-30 for a later revisit. This folder (docs/)
   is excluded from deploys by .vercelignore, so nothing here reaches visitors.
   Note: the GitHub repo is public, so treat this list as visible to anyone
   browsing the repo.

   TO BRING ONE BACK: move its line into PRODUCTS in assets/js/catalog.js
   (and, for checkout, add its id to STRIPE_LINKS in assets/js/config.js).
   The Digital Jungle books use cat:'jungle'; that category still exists.
   ========================================================================= */

const PRODUCTS_UNDER_DEVELOPMENT = [
  // Digital Jungle (Kids): "Masters of Camouflage" series
  { id:'magic-moth', name:'The Magic Moth', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦋', blurb:'Book 1: Facial recognition. The Snapping Bird photographs everyone without asking; the Moth’s owl-eye patterns confuse the camera.', teaches:['Cameras and consent','Automated vision can be imperfect'] },
  { id:'dazzle-zebra', name:'The Dazzle Zebra', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦓', blurb:'Book 2: Data profiling. When the zebras run together their stripes become a puzzle, and the Sorting Lion drops his labels.', teaches:['Data obfuscation','Say no to unnecessary collection'] },
  { id:'quiet-chameleon', name:'The Quiet Chameleon', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🦎', blurb:'Book 3: Geolocation. The Chameleon changes colors, says “No thank you,” and the Seeking Snake slides past.', teaches:['Opting out of location sharing'] },
  { id:'leopard-leaves', name:'The Leopard in the Leaves', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:12, emoji:'🐆', blurb:'Book 4: Phishing & scams. A tricky link hides like a leopard in leaves; pausing reveals the clues.', teaches:['The power of the pause','Ask a trusted grown-up'] },
  { id:'jungle-set', name:'Digital Jungle: Complete 4-Book Set', cat:'jungle', age:['kids'], ageLabel:'Kids 4–12', price:40, emoji:'📚', blurb:'All four Masters of Camouflage stories in one gift box.' },

  // Plush
  { id:'mc-plush-handmade', img:'/assets/img/p-plush.webp', name:'Hand-Stitched Mister Cloud + Book of Choice', cat:'toy', age:['tots','kids','family'], ageLabel:'Tots, Kids & Gifts', price:150, emoji:'🪡', blurb:'A hand-stitched Mister Cloud, made one at a time, paired with the Mister Cloud book of your choice.', desc:'A hand-stitched Mister Cloud, made one at a time, paired with the Mister Cloud book of your choice. A keepsake for a new baby, a young family member, or a first library.', teaches:['A keepsake that starts the pause habit','Pick any Mister Cloud book to go with it'] },
];
