# Bilderfürst Fürth · Analog Store & Film Lab

A complete German owner-review storefront, built from the public photostudio.de catalog and service content. Darkroom motion is concentrated in the homepage; the catalog, product selection and review cart stay calm and legible.

## Public review

- Website: https://bilderfuerst.vercel.app
- Public repository: https://github.com/Marioiubas/bilderfuerst
- Hosting: Vercel production, linked to `main`; pushed changes automatically deploy.

Published at the user's explicit request on 05 October 2026. Access requires no login. This public review retains the demo banner, dated catalog, noindex and disabled checkout described below. See [publication verification](docs/PUBLIC-DEPLOYMENT.md).

## Run locally

Node.js 24 or newer is recommended (the optional browser QA runner requires 24). No credentials are needed for this review build.

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

- Anime.js 4.5.0: contact-sheet choreography, film advancement, a scan pass, photographic reveals, dialog entrances, bounded filter feedback and the Higgsfield aperture cycle.
- Vanta.js 0.5.24 with Three.js: lazy FOG in the darkroom hero and DOTS in the digitization introduction. Destroyed offscreen, on hidden pages and with reduced motion; static on mobile/data saving.
- Higgsfield 3D Jutsu: six generic optical/media props, native poster renders and an editable Blender scene. Desktop props render on demand; real business and catalog photography remain unchanged.
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
npm run lint
npm run verify
npm run build
npm audit
node scripts/verify-routes.mjs
node scripts/browser-qa.mjs
```

The last two checks default to the local server at port 3000. The route sweep also accepts `BILDERFUERST_SITE_ORIGIN` and `BILDERFUERST_QA_OUTPUT` to verify the public deployment. The historical browser script is retained as baseline evidence; its structural selectors describe the previous layout. Final visual and interaction QA was completed directly in the Codex browser at 360–1440 px and is recorded in the final visual report. It never operates the original shop.

The installed native `agent-browser` runner stalled during some keyboard/navigation sequences. Its partial results are preserved, and the affected cart refresh, keyboard, responsive and motion checks were completed directly in the Codex browser. See the QA report for this distinction; the CLI run is not claimed as a completely passing automated suite.

- [Final visual report and Higgsfield delivery](docs/FINAL-VISUAL-REPORT.md)
- [Visual baseline audit](docs/FINAL-VISUAL-AUDIT.md)
- [QA report](docs/QA-REPORT.md)
- [Existing site audit](docs/EXISTING-SITE-AUDIT.md)
- [Commerce architecture](docs/ECOMMERCE-AUDIT.md)
- [Catalog audit](docs/PRODUCT-CATALOG-AUDIT.md)
- [Image source manifest](docs/IMAGE-ASSET-MANIFEST.md)
- [URL migration](docs/URL-MIGRATION-MAP.md)
- [Motion system](docs/MOTION-SYSTEM.md)
- [Component plan](docs/ACETERNITY-COMPONENT-PLAN.md)

`docs/evidence` contains read-only source HTML, crawl data, raw product state, image provenance, route/browser results and screenshots. `lib/catalog.json` is the normalized dated catalog. The preparation scripts are evidence tools, not an authorized live inventory integration.
