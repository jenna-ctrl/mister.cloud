# Mister Cloud — Launch Package (mister.cloud)

A complete, production-ready **static website** for **mister.cloud**. Drop these files into your
project (or deploy the folder as-is) and point the domain at it. No build step required to run.

Built from the reviewed `mistercloud-demo` site, hardened for launch: precompiled CSS (no runtime
CDN), full SEO + social meta, favicons, manifest, sitemap, robots, a branded 404, and host config.

---

## What's inside

```
index.html            The site (single page; tabs: Home, Our Mission, For You, About, Partners, Regions, Shop)
styles.css            Precompiled + minified Tailwind (replaces the old cdn.tailwindcss.com script)
404.html              Branded not-found page (self-contained)
robots.txt            Allows indexing; points to the sitemap
sitemap.xml           Single-URL sitemap (https://mister.cloud/)
site.webmanifest      PWA manifest (name, icons, theme color)
favicon.ico           Multi-size icon (16/32/48)
favicon-16.png        Favicons
favicon-32.png
apple-touch-icon.png  180px iOS home-screen icon
icon-192.png          PWA / Android icons
icon-512.png
og-image.png          1200×630 social share card (Facebook, X, iMessage, etc.)
vercel.json           Static hosting config: clean URLs, security headers, caching
logos/
  mister-cloud-mark.png   The official cloud mark (used in-page + favicons)
```

> The store data lives in a `PRODUCTS` array inside `index.html` (near the bottom, in the storefront
> `<script>`). Edit product name/price/blurb/emoji there and the grid + modal update automatically.

---

## Deploy (Vercel — recommended, you already use it)

**Option A — drag & drop (fastest):**
1. Go to vercel.com → **Add New → Project → Deploy** (or use the "Deploy static files" flow).
2. Drag this whole folder in. Vercel detects a static site (no framework, no build).
3. In **Project → Settings → Domains**, add `mister.cloud` (and `www.mister.cloud` → redirect to apex).

**Option B — CLI:**
```bash
cd mister-cloud-launch
npx vercel          # preview
npx vercel --prod   # production
```

**Option C — Git:** commit these files to your mister.cloud repo, import it in Vercel, deploy.

### DNS for mister.cloud
At your domain registrar, point the domain to Vercel (Vercel shows exact values under Domains):
- **Apex** `mister.cloud` → `A` record to Vercel's IP, **or** use Vercel nameservers.
- **www** `www.mister.cloud` → `CNAME` to `cname.vercel-dns.com` (then set it to redirect to the apex).
SSL is issued automatically. Allow up to ~an hour for DNS to propagate.

> Any static host works too (Netlify, Cloudflare Pages, GitHub Pages, S3+CloudFront). On non-Vercel
> hosts, `vercel.json` is ignored — replicate the headers/redirects in that host's config if you want them.

---

## Editing after launch (important)

The CSS is **precompiled**. If you edit `index.html` and add **new Tailwind classes**, you must
recompile so the new styles exist:

```bash
# from the ClearSkyIP repo (which has the tailwindcss CLI), or `npm i -D tailwindcss@3`
npx tailwindcss -i input.css -o styles.css --minify \
  --content ./index.html
# input.css contains:  @tailwind base; @tailwind components; @tailwind utilities;
```
Editing existing text/prices/products needs **no** rebuild. Fonts load from Google Fonts (fine as-is;
self-host later if you want zero third-party requests).

---

## ☁️ Soft-launch (pre-order) configuration

The site is now framed as a **new brand in pre-order — everything ships October 2026.** All the
pre-order plumbing is driven by a single **LAUNCH CONFIG** block at the top of the storefront
`<script>` in `index.html`. Edit those constants; no other code changes needed.

- **`STRIPE_LINKS`** — a map of `product id → Stripe Payment Link URL`. Create one Payment Link per
  product in the Stripe Dashboard (Products → Payment links) and paste each URL here. A product left
  `''` shows a friendly "pre-order link being added" message instead of a broken button — so you can
  launch with a few links live and fill in the rest as you go.
- **`FORM_ENDPOINT`** — the "Follow along / keep me posted" email form posts here. Paste a form
  endpoint from Formspree / Getform / Basin (`https://formspree.io/f/xxxx`). Left `''`, the form just
  shows a thank-you and collects nothing.
- **`CONTACT_EMAIL`** — where "Contact for licensing" (educator kits) and free-guide requests go via
  `mailto:`. Defaults to `hello@mister.cloud` — **confirm this inbox exists.**
- **`SHIP_DATE`** — the ship month shown everywhere (`October 2026`).

**How each product button behaves:** if it has a Stripe link → "Pre-order Now" opens Stripe checkout;
educator kits → "Contact for licensing" (mailto); the free checklist → "Request the free guide"
(mailto); anything else → "pre-order link being added" toast. The old multi-item cart was removed —
Stripe Payment Links are per-item, so each product pre-orders individually.

> **Shopify (Advanced plan):** the store lives at **`shop.mister.cloud`** while this marketing site
> stays on Vercel at `mister.cloud`. Products are created via `scripts/shopify-sync.mjs` (see below).
> You can keep Stripe Payment Links for the soft-launch, or later swap the pre-order buttons to Shopify
> product pages (`SHOP_URL` is already set in the config) — a config-driven, one-line-per-product swap.
> See `.context/…/mister-cloud-shopify-printify-brief.md`.

### Connecting `shop.mister.cloud` (Shopify domain + DNS)
1. Shopify admin → **Settings → Domains → Connect existing domain** → enter `shop.mister.cloud`.
2. At your registrar, add a **CNAME**: `shop` → `shops.myshopify.com`.
3. Shopify verifies and issues SSL automatically (allow up to ~48h; usually much faster).
4. Note: `SHOPIFY_STORE` for the sync script is the **`*.myshopify.com` admin domain** (e.g.
   `mister-cloud.myshopify.com`), *not* `shop.mister.cloud`. The Admin API always uses the myshopify.com host.

### Running the product sync
```bash
node scripts/shopify-sync.mjs            # dry run — prints the 47-product mapping
node scripts/shopify-sync.mjs --apply    # creates DRAFT products (needs .context/shopify.env)
```
Credentials load from `.context/shopify.env` (gitignored) or env vars:
`SHOPIFY_STORE`, `SHOPIFY_ADMIN_TOKEN`, optional `SHOPIFY_API_VERSION`.

## 📊 Analytics & daily email

**Privacy-friendly (no cookies, no consent banner) via Plausible + a daily email to
`shailin@futureprooftmt.com`.** Two parts:

**Login / dashboard (view any time):**
1. Create a [Plausible](https://plausible.io) account, add the site **`mister.cloud`**. The tracking
   script is already in `index.html` — it reports as soon as the site is deployed on that domain.
2. Give Shailin access: Plausible → site **Settings → Visibility** → either add a **team member**
   (`shailin@futureprooftmt.com`) or enable a **shared dashboard link** to send them.

**Daily email (`api/daily-analytics-email.js`, scheduled in `vercel.json`):**
A Vercel Cron runs once a day (13:00 UTC), pulls yesterday's stats from the Plausible Stats API, and
emails a branded summary via [Resend](https://resend.com): visitors, pageviews, bounce, avg visit, top
pages, sources, countries, plus **device type, browser, OS, and screen size**. Note: Plausible is
privacy-first, so it does **not** expose IP / ISP / network connection type — those aren't available by
design (it's what keeps the site cookie- and consent-banner-free). Set these env vars in **Vercel →
Project → Settings → Environment
Variables** (template in `.env.example`):

| Var | Where to get it |
|---|---|
| `PLAUSIBLE_SITE_ID` | `mister.cloud` |
| `PLAUSIBLE_API_KEY` | Plausible → Settings → API Keys (Stats API key) |
| `RESEND_API_KEY` | Resend → API Keys |
| `REPORT_TO` | `shailin@futureprooftmt.com` (default; comma-separate for more) |
| `REPORT_FROM` | e.g. `Mister Cloud Analytics <analytics@mister.cloud>` — **verify the domain in Resend first** |
| `CRON_SECRET` | any long random string (Vercel sends it so only the cron can trigger the route) |

Test it after deploy: `curl -H "Authorization: Bearer $CRON_SECRET" https://mister.cloud/api/daily-analytics-email`.
Note: Vercel Cron requires a deployed project; on the Hobby plan crons run about once per day (fine here).

## ✅ Still to do before / around launch

- [ ] **Create the Stripe Payment Links** and paste them into `STRIPE_LINKS` (see above).
- [ ] **Wire `FORM_ENDPOINT`** so launch-news signups are actually captured.
- [ ] **Confirm social handles** — the footer links to Instagram/TikTok/Facebook/Reddit using the
      handles from the social cheat sheet. Verify each URL is live (marked with a `TODO` in the HTML).
- [ ] **Analytics** — set up Plausible + the daily-email cron (see "Analytics & daily email" below).
- [ ] **Product images** — tiles use emoji placeholders. Add v1 / prototype photos when available.
- [ ] **Regional brands** — Señor Nube & Badal Sahib cards use the Mister Cloud mark as a placeholder.
- [ ] **Legal (recommended for a kids-facing brand taking payment)** — add **Privacy** + **Terms**
      pages and confirm COPPA posture. Not built in this pass; say the word and I'll add them.
- [ ] **Domain in metadata** — `<head>` canonical/OG URLs + `sitemap.xml`/`robots.txt` assume
      `https://mister.cloud/`. Update if the live host differs.
- [ ] **Apps section** — the Home "Apps [Zero-Data]" cards are now labelled *"in development · preview
      coming soon"* (they're not in the pre-order catalogue). Keep as concept showcase, or trim.

---

## What's already handled for you

- **No CDN dependency** — Tailwind is compiled to `styles.css` (faster, works without JS, no console warning).
- **SEO** — title, meta description, canonical, robots, sitemap.
- **Social sharing** — Open Graph + Twitter card with a 1200×630 image (`og-image.png`).
- **Icons** — favicon.ico, PNG favicons, Apple touch icon, PWA manifest + icons.
- **Security headers & caching** — via `vercel.json`.
- **Accessibility** — skip link, aria labels, focus states, reduced-motion support (carried from the demo).
- **Branded 404.**

---

## Brand assets

Logos, color palette (HEX/RGB/CMYK), typography, and the vector masters live in the **Mister Cloud
Brand & Design Kit** (in the ClearSkyIP repo under `public/brand/`). Core colors: Mister Cloud Blue
`#0A8CF5`, Cloud Navy `#0B4EA6`, Cloud Coral `#FC4D4A`, Ink `#0A1B2E`, Sky Mist `#F0F9FF`.
Fonts: **Fredoka** (display) + **Nunito** (body).

*Protecting little footprints across the globe. — Clear Sky IP Holdings*
