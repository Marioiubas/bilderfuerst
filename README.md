# Bilderfürst Fürth · Analog Store & Film Lab

A complete German owner-review storefront, built from the public photostudio.de catalog and service content. Darkroom motion is concentrated in the homepage; the catalog, product selection and review cart stay calm and legible.

## Run locally

Node.js 22 or newer is required. No credentials are needed for this review build.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. To run the optimized build:

```sh
npm run build
npm run start
```

## Included

- Anime.js 4.5.0: hero entrances, floating film/contact-grid choreography, section reveals and cart entrance.
- Vanta.js 0.5.24 with Three.js: one lazy darkroom FOG scene, destroyed offscreen and disabled on mobile or with reduced motion.
- Six official Aceternity components: Spotlight, Lens, Compare, Tracing Beam, Parallax Scroll and 3D Card. Source was installed through the official registry before custom UI work and adapted for this brand.
- 109 source master/product records and 31 authentic variants, with real source prices, inventory snapshots, descriptions, IDs and purchase links.
- Search, category/brand/format/process/ISO/stock/price filters, sorting, product galleries, development configuration, persistent review cart and checkout preview.
- Digitization, photo services, FineArt print selection, history, gallery, contact/drop-off and preserved legal/service URLs.
- Real Calenso booking and Google Maps destination links. Neither is embedded or loaded before a user chooses the external service.
- Local fonts and 265 optimized genuine source images. No generated photographs or invented restoration results.

## Review boundary

This is explicitly **DEMO / OWNER REVIEW**. Catalog prices and availability are the source snapshot of 04 October 2026. The cart is stored locally and creates no order. Checkout is disabled and collects no personal or payment data. Exact source product/variant links let a reviewer continue in the existing shop; cart contents do not transfer across domains.

The original ePages/STRATO store remains untouched. Production requires owner-authorized API/export access and a real commerce adapter, verified tax/shipping/payment behavior, sandbox orders and reconciliation, image rights approval and legal review. See [owner confirmations](docs/OWNER-CONFIRMATION-LIST.md). Review pages are noindex; production SEO metadata and structured data require a verified deployment origin and live catalog.

Compare shows genuine Adonal versus D-76 developer samples of the same subject. The illuminated gallery is inspired by the real Street Gallery, with source sample prints explicitly labelled; it does not claim to display the current exhibition.

## Verification and evidence

```sh
npm run typecheck
npm run verify
npm run build
npm audit
node scripts/verify-routes.mjs
node scripts/browser-qa.mjs
```

The last two checks require the local server at port 3000. Browser QA uses its own named browser session and resets that session's review cart; it never operates the original shop.

The installed native `agent-browser` runner stalled during some keyboard/navigation sequences. Its partial results are preserved, and the affected cart refresh, keyboard, responsive and motion checks were completed directly in the Codex browser. See the QA report for this distinction; the CLI run is not claimed as a completely passing automated suite.

- [QA report](docs/QA-REPORT.md)
- [Existing site audit](docs/EXISTING-SITE-AUDIT.md)
- [Commerce architecture](docs/ECOMMERCE-AUDIT.md)
- [Catalog audit](docs/PRODUCT-CATALOG-AUDIT.md)
- [Image source manifest](docs/IMAGE-ASSET-MANIFEST.md)
- [URL migration](docs/URL-MIGRATION-MAP.md)
- [Motion system](docs/MOTION-SYSTEM.md)
- [Component plan](docs/ACETERNITY-COMPONENT-PLAN.md)

`docs/evidence` contains read-only source HTML, crawl data, raw product state, image provenance, route/browser results and screenshots. `lib/catalog.json` is the normalized dated catalog. The preparation scripts are evidence tools, not an authorized live inventory integration.
