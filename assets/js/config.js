/* =========================================================================
   LAUNCH CONFIG. Edit these; no other code changes needed.
   Loaded on every page before site.js.
   ========================================================================= */

// "Founding Family" momentum line on /shop. Set to your REAL pre-order count
// once orders land. 0 keeps it hidden; never ship a fabricated number.
const FOUNDING_FAMILIES = 0;

// Official launch. Everything that isn't "available now" is a pre-order that
// ships from PREORDER_SHIPS.
const LAUNCH_DATE = 'January 1, 2027';
const PREORDER_SHIPS = 'January 2027';

// AVAILABLE NOW: products people can buy today (not pre-order). List CATS keys
// (see assets/js/catalog.js) and/or single product ids. `except` keeps a
// product as pre-order even when its category is available now.
const AVAILABLE_NOW = {
  cats: ['board', 'book', 'jungle', 'teen', 'edu', 'apparel', 'merch'],   // books, learning programs, apparel & merch
  ids: ['mc-plush', 'mc-plush-handmade'],
  except: [],
};

// Licensing, "suggest a place", "host a discovery", and free-guide mail.
const CONTACT_EMAIL = 'info@futureprooftmt.com';

// Shopify storefront (not wired yet; Stripe Payment Links are used below).
const SHOP_URL = 'https://shop.mister.cloud';

// Newsletter ("Keep me in the loop"): paste your MailerLite form ACTION URL.
// Turn on DOUBLE OPT-IN in MailerLite. Sends `email` as form data.
// Left '', the form says thank-you and collects nothing.
const NEWSLETTER_ENDPOINT = '';

// Download tally on /learn: an anonymous +1 counter per download type.
// No cookies, no IPs, nothing about the person. See api/tally.js.
const TALLY_ENDPOINT = '/api/tally';
// Show "Saved by N families" under the downloads once the count is real.
const SHOW_TALLY_PUBLICLY = false;

// STRIPE PAYMENT LINKS: one Stripe Payment Link per product id (see
// assets/js/catalog.js). Available-now products use it as "Buy now", the rest
// as "Pre-order now". Empty entries show a friendly "link being added"
// message instead of a broken button.
const STRIPE_LINKS = {
  'tap-tap': '', 'click-clack': '', 'camera-eye': '', 'microphone-ear': '',
  'forever-box': '', 'cloud-lock-camera': '', 'peekaboo': '',
  'where-picture-go': '', 'ocean-road': '', 'cloud-sleeps': '', 'this-town': '',
  'sky-internet': '', 'map-the-web': '', 'message-journey-book': '', 'coastal-lab': '',
  'magic-moth': '', 'dazzle-zebra': '', 'quiet-chameleon': '', 'leopard-leaves': '', 'jungle-set': '',
  'whats-wifi': '', 'whats-bluetooth': '', 'whats-vpn': '', 'whats-cookie': '', 'whats-cloud-really': '',
  'mc-plush': '', 'mc-plush-handmade': '',
  'program-babies-tots': '', 'program-tech-at-school': '', 'program-grandparent-mode': '', 'program-home-schooler': '',
  'armor-pack': '', 'cone-silence': '', 'no-thank-you-buttons': '',
  'scam-guide': '', 'password-kit': '', 'concierge-audit': '',
  'first-launch': '', 'armor-kit': '',
  // (safety-checklist = free, educator kits = contact; handled without a link)
};
