# Mister Cloud — Soft-Launch Handoff

> **Oct 2026 redesign:** the single-page tab site was replaced by six real pages
> (`/`, `/about`, `/play`, `/learn`, `/shop`, `/nearme`) built from the new mockups and the Brand &
> Design Kit. Config moved to `assets/js/config.js`, products to `assets/js/catalog.js`; see the
> README "What's inside". Old `/#shop-final`-style links redirect to the new pages. Sections 1–2
> below describe the previous single-page build and are kept for history.
>
> **Availability:** books, learning programs, apparel and merch are sold now; everything else is a
> pre-order for the official launch on Jan 1, 2027. Controlled by `AVAILABLE_NOW` in `assets/js/config.js`.

**Status: LIVE** at **https://mister.cloud**. Last updated at workspace close (Oct 2026).

This doc is the single place to get up to speed. Everything described here is in the repo
(`github.com/jenna-ctrl/mister.cloud`). Pull `main` and you have the current site.

---

## 1. What this is

A polished **single-page static marketing + pre-order site** for Mister Cloud, a new family
digital-safety brand (books, songs, toys, tools; privacy/anti-fraud education for the youngest and
oldest in a family). Soft-launch: social channels + family wearing merch internationally drive
curious people to the site; everything is **pre-order**.

- **No build step.** It's `index.html` + `styles.css` + static assets.
- **Hosting:** Vercel. **Production branch = `main`** → every push to `main` auto-deploys (~1–2 min).
- **Domains:** `mister.cloud` (this site, Vercel) and `shop.mister.cloud` (reserved for Shopify, not
  wired). **DNS is managed in the Vercel dashboard** (domain is on Vercel nameservers), NOT at the
  registrar — edits at the registrar do nothing.

### Pages (tab-based SPA, deep-linkable via `#hash`)
- **Home** — welcome landing + a **first-visit overlay** ("How did you trace the cloud home?") that
  fires a Plausible event + posts to a form endpoint (attribution for otherwise-"Direct" traffic).
- **About** — leads with the founder trust story (big-tech auditor, patented bot-detection since
  2017; child-development specialist spouse). Then mission + product ecosystem (books / apps / tools).
- **Principles** — the "why": developmental habits ladder (Early/Kids/Adolescents), the four "skies"
  mascot family (Cumi/Alto/Ciri/Nimbus), and four belief cards (sky→cloud, jungle-game privacy,
  content-over-hours, child safety/anti-CSAM).
- **Company** — team/credentials, Clear Sky IP link, curriculum-by-audience (8 tappable tiles that
  open an interstitial modal), and regions (Mister Cloud / Señor Nube / Badal Sahib).
- **Partners** — co-brand program (the "branded water bottle" idea for banks/insurers/cybersecurity/
  pediatric), schools & organizations licensing, sponsor/give-back, investors. All CTAs are `mailto`.
- **Shop** — 49 pre-order products, filters, product modal, "Founding Family" callout, "Cloud Club"
  newsletter signup.

---

## 2. Where things live (all in `index.html` unless noted)

- **`index.html`** — markup + an inline `<style>` block ("launch utilities") + **4 inline `<script>`
  blocks** (tab/intro logic, storefront, curriculum, Plausible stub).
  - **LAUNCH CONFIG** (top of the storefront script) — edit these, nothing else needed:
    - `FOUNDING_FAMILIES` — momentum counter; **0 = hidden** (don't ship a fake number; set to the
      real pre-order count once orders land).
    - `SHIP_DATE` / `SHIP_DATE_REST` / `shipDateFor(p)` — books & apparel = **October 2026**,
      everything else = **January 2027**.
    - `CONTACT_EMAIL` = `info@futureprooftmt.com` (data room, licensing, early-access mail).
    - `SHOP_URL` = `https://shop.mister.cloud` (for when buttons point at Shopify).
    - `FORM_ENDPOINT` — attribution/"how did you find us" log (unset).
    - `NEWSLETTER_ENDPOINT` — Cloud Club signup; paste the **MailerLite** form action here (unset).
    - `STRIPE_LINKS` — `{ productId: 'https://buy.stripe.com/...' }`. Empty entries degrade to a
      friendly "link being added" message. **Paste Stripe Payment Links here to enable checkout.**
  - **`PRODUCTS`** (49 items) and **`CURRICULUM`** (8 audiences) arrays — edit copy/prices here; the
    grid + modals re-render automatically.
- **`styles.css`** — precompiled/**purged** Tailwind. ⚠️ Adding a NEW Tailwind class won't have a
  rule unless you (a) add it to the inline `<style>` "launch utilities" block, or (b) recompile
  (see README). Several utilities are already patched inline.
- **`vercel.json`** — clean URLs, security headers, caching, and the **daily-email cron**.
- **`api/daily-analytics-email.js`** — Vercel Cron → Plausible Stats API → Resend email (device/
  browser/OS/geo breakdowns). Returns **500 until env vars are set** (see below).
- **`scripts/shopify-sync.mjs`** — standalone Shopify product-sync tool (reads PRODUCTS from
  index.html). **Safe by default: dry-run unless `--apply`, creates DRAFTS, idempotent by SKU.**
  Not wired into the site; only needed if you move checkout to Shopify.
- **`.env.example`** — env template for the analytics email.
- **`README.md`** — the full launch-package reference (deploy steps, DNS, analytics setup, Shopify
  sync usage, pre-order config).

---

## 3. Key decisions already made

- **Checkout = Stripe Payment Links** (per-item, no backend). A Shopify Advanced account exists but
  is **not** wired; Stripe was chosen to launch faster. The site is config-driven so switching to
  Shopify later is a small change (`SHOP_URL` is ready).
- **Ship dates split by category** (books/apparel Oct 2026, rest Jan 2027).
- **Analytics = Plausible** (privacy-first, cookie-free), **not** Vercel Web Analytics — chosen
  because Vercel can't send the required **daily email** to `shailin@futureprooftmt.com` (our cron does).
- **Newsletter = MailerLite** with **double opt-in**; branded as **"the Cloud Club"**; collects
  name + email.
- **Contact mail → `info@futureprooftmt.com`** (real inbox; no forwarding set up).
- **Founder story is intentionally unnamed.**
- **Copy:** em-dashes removed and AI-writing tells softened (brand voice pass).

---

## 4. OPEN ITEMS — what the next person should pick up (prioritized)

1. **MailerLite** — create a form, enable double opt-in, paste its **form action URL** into
   `NEWSLETTER_ENDPOINT`. (Form + name field + "check your inbox" copy already built.)
2. **Stripe Payment Links** — create one per product in the Stripe dashboard, paste URLs into
   `STRIPE_LINKS`. Until then, "Pre-order Now" shows a "link being added" message.
3. **Plausible + daily email** — create a Plausible account, add site `mister.cloud`; set these env
   vars in **Vercel → Settings → Environment Variables**: `PLAUSIBLE_SITE_ID`, `PLAUSIBLE_API_KEY`,
   `RESEND_API_KEY`, `REPORT_TO`, `REPORT_FROM`, `CRON_SECRET` (template in `.env.example`). Verify a
   sending domain in Resend. `/api/daily-analytics-email` is 500 until this is done.
4. **Product images** — listings use emoji placeholders. Needs a small data-model + modal upgrade to
   support real images (NOT built yet). Biggest lever for pre-order conversion.
5. **YouTube** — three "YouTube · soon" chips (welcome overlay, footer) become real links once the
   channel exists.
6. **Legal / compliance** (from a regulator-lens review done in this workspace — NOT built):
   - Privacy Policy + **COPPA** statement, Terms of Service, and **Pre-order / Refund / Cancellation**
     policy pages, linked in the footer (charging now for goods shipping 4–16 months out needs clear
     cancel/refund terms per the FTC Mail/Internet Order Rule).
   - Substantiate or soften claims: **"patented"** bot-detection, **"zero-data / no data ever leaves
     your phone,"** "100% offline," "globally recognized."
   - Clarify the **legal seller identity + a business address** (footer says ClearSkyIP / Clear Sky
     IP Holdings; contact routes to Future Proof TMT).
   - Add **securities disclaimers** to the investor section (public "Request Data Room" can be a
     general solicitation — get securities counsel).
   - Children's-product safety (CPSIA / ASTM / choking warnings / age grading) attaches when products
     ship. Accessibility (WCAG) audit recommended.
7. **Shopify (optional)** — if moving checkout there: put store domain + Admin API token in
   `.context/shopify.env` (gitignored) and run `node scripts/shopify-sync.mjs --apply`.
8. **Placeholder regional logos** — Señor Nube & Badal Sahib currently reuse the Mister Cloud mark.

---

## 5. How to make a change

```bash
# edit index.html (or styles/assets), then:
git add -A && git commit -m "…"
git push origin HEAD:main        # production branch → Vercel auto-deploys
# verify live (~1–2 min later):
curl -s https://mister.cloud | grep "<title>"
```
- New Tailwind class → add to the inline `<style>` "launch utilities" block (or recompile styles.css).
- DNS changes → **Vercel dashboard** (not the registrar).

---

## 6. Source materials (⚠️ local-only, NOT in the repo)

The concept briefs and review screenshots used to build this live in **`.context/attachments/`**,
which is **gitignored** — they will NOT be on another machine via `git pull`. If they're needed, get
them from the original workspace / shared drive. They include: the Shopify + Printify brief, the
social-launch cheat sheet, the Tower Catcher one-pager, the Cloud Metaphors doc (Cumi/Alto/Ciri/
Nimbus), the Coastal Weather Lab doc, the Digital Jungle Camouflage doc, and mobile-review
screenshots. (Ask if you'd like these committed into `docs/` so they travel with the repo.)

---

## 7. Full work history (commits, newest first)

```
b7af247 Copy pass: remove all em-dashes and soften machine-writing tells
0fcc108 Curriculum note: "Expand any tile to see more information"
afaa237 Curriculum cards: "Full curriculum →" → "Expand For More →"
e15cc94 Add Partners/Co-Brand page + Founding Family framing
48866dd Fixes from mobile review: dedup socials, declutter apps, split ship dates, Cloud Club, About creds
8043c29 Contact emails → info@futureprooftmt.com; newsletter name field + double opt-in scaffold
d369822 Socials: add YouTube (coming soon) chip; capitalize Reddit handle
b75f9c3 Principles: developmental habits ladder + four guiding beliefs
57aa35a About founder trust story; app early-access 2027; zero-data def; Principles cloud family
6045d6f Device cards: branded SVG art + corrected copy; zero-data tooltip; Badal Sahib fix
28f67e9 Company: replace empty "team & concept image" placeholder with expertise strip
449dee4 Curriculum: preview-card tiles that open a full-curriculum interstitial
16dd1bf Add social links to welcome overlay and home landing
d4b2d08 Restructure site: welcome/attribution intro + 3 pages + Shop
e8596fc Update footer social links with real handles
98018a2 Add device/browser/OS/screen breakdowns to daily analytics email
508af98 Add Plausible analytics + daily email report
db26a1a Add Mister Cloud pre-order soft-launch site
d622ddf Initial commit
```
