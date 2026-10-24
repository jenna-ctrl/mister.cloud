#!/usr/bin/env node
/**
 * Mister Cloud → Shopify product sync
 * ----------------------------------------------------------------------------
 * Creates the Mister Cloud catalogue in a Shopify store from the single source
 * of truth: the PRODUCTS array in ../assets/js/catalog.js.
 *
 * SAFE BY DEFAULT:
 *   - Runs a DRY RUN unless you pass --apply.
 *   - Creates products as DRAFT (status: DRAFT) so nothing goes live until you
 *     review and publish in the Shopify admin.
 *   - Idempotent: skips a product if one with the same SKU (= product id)
 *     already exists, so re-running won't create duplicates.
 *
 * CREDENTIALS (never committed — read from env or ../.context/shopify.env):
 *   SHOPIFY_STORE        e.g. mister-cloud.myshopify.com   (the *.myshopify.com admin domain)
 *   SHOPIFY_ADMIN_TOKEN  Admin API access token from a custom app
 *   SHOPIFY_API_VERSION  optional, defaults below
 *
 * USAGE:
 *   node scripts/shopify-sync.mjs             # dry run: prints the mapping
 *   node scripts/shopify-sync.mjs --apply     # creates draft products in Shopify
 *   node scripts/shopify-sync.mjs --apply --only mc-plush,tap-tap   # subset
 * ----------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const onlyArg = args[args.indexOf('--only') + 1];
const ONLY = args.includes('--only') && onlyArg ? new Set(onlyArg.split(',').map(s => s.trim())) : null;

// ---- load .context/shopify.env if present (KEY=value lines) ----------------
(function loadEnvFile() {
  const p = path.join(ROOT, '.context', 'shopify.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

// ---- pull PRODUCTS + CATS out of assets/js/catalog.js (source of truth) ----
function loadCatalogue() {
  const html = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'catalog.js'), 'utf8');
  const grab = (name) => {
    const m = html.match(new RegExp(`const ${name}\\s*=\\s*(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\});`, 'm'));
    if (!m) throw new Error(`Could not find ${name} in assets/js/catalog.js`);
    // eslint-disable-next-line no-eval
    return eval('(' + m[1] + ')');
  };
  return { PRODUCTS: grab('PRODUCTS'), CATS: grab('CATS') };
}

const AGE_LABELS = {
  tots: 'Tots 0-3', kids: 'Kids 4-12', teens: 'Teens 13-18',
  family: 'Parents & Family', grandparents: 'Grandparents 60+', educators: 'Educators',
};

// Map one site product → a Shopify product payload.
function toShopify(p, CATS) {
  const cat = CATS[p.cat] || { label: 'Product' };
  const tags = ['Mister Cloud', 'Pre-order', 'Ships October 2026', cat.label];
  for (const a of p.age || []) tags.push(AGE_LABELS[a] || a);

  const teaches = (p.teaches && p.teaches.length)
    ? `<p><strong>What it teaches</strong></p><ul>${p.teaches.map(t => `<li>${t}</li>`).join('')}</ul>`
    : '';
  const descriptionHtml =
    `<p>${p.desc || p.blurb}</p>${teaches}` +
    `<p><em>Pre-order &mdash; ships October 2026.</em></p>`;

  // Licensing / free items aren't standard paid variants.
  const isContact = p.cat === 'edu' || /contact|licens/i.test(p.priceLabel || '');
  const isFree = (p.priceLabel || '').toLowerCase() === 'free';
  const price = p.price > 0 ? p.price.toFixed(2) : (isFree ? '0.00' : null);

  return {
    id: p.id,
    title: p.name.replace(/[“”]/g, '"'),
    descriptionHtml,
    vendor: 'Mister Cloud',
    productType: cat.label,
    tags,
    status: 'DRAFT',
    sku: p.id,
    price,               // null → needs a manual price / contact
    isContact,
    isFree,
    // Pre-order = allow selling with no stock on hand.
    inventoryPolicy: 'CONTINUE',
  };
}

// ---- Shopify GraphQL client ------------------------------------------------
async function gql(query, variables) {
  const store = process.env.SHOPIFY_STORE;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  const res = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function skuExists(sku) {
  const data = await gql(
    `query($q:String!){ productVariants(first:1, query:$q){ nodes{ id } } }`,
    { q: `sku:${sku}` }
  );
  return data.productVariants.nodes.length > 0;
}

async function createProduct(sp) {
  const data = await gql(
    `mutation($product: ProductCreateInput!) {
       productCreate(product: $product) {
         product { id title variants(first:1){ nodes{ id } } }
         userErrors { field message }
       }
     }`,
    {
      product: {
        title: sp.title, descriptionHtml: sp.descriptionHtml, vendor: sp.vendor,
        productType: sp.productType, tags: sp.tags, status: sp.status,
      },
    }
  );
  const r = data.productCreate;
  if (r.userErrors.length) throw new Error(JSON.stringify(r.userErrors));
  const variantId = r.product.variants.nodes[0].id;

  // Set SKU + price + pre-order inventory policy on the default variant.
  const upd = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
         userErrors { field message }
       }
     }`,
    {
      productId: r.product.id,
      variants: [{
        id: variantId,
        price: sp.price || '0.00',
        inventoryPolicy: sp.inventoryPolicy,
        inventoryItem: { sku: sp.sku },
      }],
    }
  );
  if (upd.productVariantsBulkUpdate.userErrors.length) {
    throw new Error(JSON.stringify(upd.productVariantsBulkUpdate.userErrors));
  }
  return r.product;
}

// ---- main ------------------------------------------------------------------
(async () => {
  const { PRODUCTS, CATS } = loadCatalogue();
  let items = PRODUCTS.map(p => toShopify(p, CATS));
  if (ONLY) items = items.filter(i => ONLY.has(i.id));

  console.log(`\nMister Cloud → Shopify sync  (${APPLY ? 'APPLY' : 'DRY RUN'}, API ${API_VERSION})`);
  console.log(`Products: ${items.length}\n`);

  if (!APPLY) {
    for (const i of items) {
      const priceStr = i.isContact ? 'CONTACT' : i.isFree ? 'FREE' : i.price ? `$${i.price}` : '—';
      console.log(`  • ${i.id.padEnd(22)} ${priceStr.padEnd(8)} ${i.productType.padEnd(16)} ${i.title}`);
    }
    console.log(`\nDry run only. Re-run with --apply (and credentials set) to create draft products.`);
    console.log(`Tags applied to each: Mister Cloud, Pre-order, Ships October 2026, <category>, <age groups>.`);
    return;
  }

  if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ADMIN_TOKEN) {
    console.error('Missing SHOPIFY_STORE / SHOPIFY_ADMIN_TOKEN (env or .context/shopify.env).');
    process.exit(1);
  }

  let created = 0, skipped = 0, failed = 0;
  for (const i of items) {
    try {
      if (await skuExists(i.sku)) { console.log(`  = skip (exists): ${i.id}`); skipped++; continue; }
      const prod = await createProduct(i);
      console.log(`  + created draft: ${i.id}  →  ${prod.id}`);
      created++;
    } catch (e) {
      console.error(`  ! failed: ${i.id}  →  ${e.message}`);
      failed++;
    }
  }
  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`);
  console.log('Products are DRAFT — review and publish them in the Shopify admin.');
})();
