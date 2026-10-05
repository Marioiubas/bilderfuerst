# Bilderfürst Fürth · Analog Store & Film Lab

A German owner-review storefront for the analog-photography business Bilderfürst / Analog Store in Fürth, rebuilt on 05–06 October 2026 as a "digital analog-photography space": design direction **Analog Technology** (graphite darkroom zones, photo-white commerce, darkroom red for interaction, amber film, cyan scanning). Content comes from the business's public site photostudio.de, re-verified live; the catalog, prices and stock are a dated source snapshot.

- Website: https://bilderfuerst.vercel.app (public, no login)
- Repository: https://github.com/Marioiubas/bilderfuerst — `main` deploys to Vercel production automatically
- Full report (46 sections, before/after metrics and screenshots): [docs/REMAKE-REPORT.md](docs/REMAKE-REPORT.md)

## Four signature experiences

1. **3D film / contact-sheet hero** — a technical line drawing of a 135 cartridge and a negative strip of real shop, lab and scan photographs; on desktop the Higgsfield cartridge model and the strip render in Three.js, and "Im Raster ansehen" rearranges the frames into a contact sheet.
2. **Film-strip development configurator** (`/filmentwicklung`) — progress drawn as 35mm / 120 / 110 film, process modules, Noritsu HS-1800 scan sizes, expert developer mode, printable order note; every option maps to a real catalog variant.
3. **Scanner-driven digitization** (`/digitalisierung`) — object-first chooser, identification diagrams, published-price estimator and a scanner pass over a genuine ICE5 before/after sample.
4. **Street Gallery window** (`/galerie`) — a simplified 3D reconstruction of the real 3×3 shop-window gallery, contact sheet → framed wall, aperture lightbox.

## Stack

Next.js 16 (App Router), React 19, TypeScript. Anime.js 4.5 (all custom motion, `motion/`), Vanta.js 0.5.24 + Three.js 0.186 (atmosphere and two object scenes, desktop only, after first engagement), Aceternity UI via the shadcn registry (Spotlight, Lens, Compare, Tracing Beam, Focus Cards, 3D Card), Archivo Variable + IBM Plex Mono (self-hosted). Higgsfield produced four decorative textures and one unbranded 3D cartridge; all product and business imagery is the business's own photography.

## Run locally

Node.js 22+ (24 recommended). No credentials are needed.

```sh
npm ci
npm run dev
```

Production build: `npm run build && npm run start`.

## Verification

```sh
npm run typecheck
npm run lint
npm run verify
npm run build
node scripts/verify-routes.mjs
```

`verify-routes.mjs` defaults to `http://127.0.0.1:3000`; set `BILDERFUERST_SITE_ORIGIN` to check another origin (190 routes: status, one H1, noindex, content). `node scripts/derive-film-attributes.mjs` re-derives film process/ISO/type from the source product text.

## Review boundary

This is explicitly **DEMO / OWNER REVIEW**: pages are `noindex, nofollow`, the cart is stored locally and creates no order, checkout collects no data and payment is disabled; product links lead to the existing shop. Catalog prices and availability are the source snapshot of 04.10.2026. Production needs owner-authorised commerce integration, tax/shipping/payment validation, legal review and image/logo rights — see [owner confirmations](docs/OWNER-CONFIRMATION-LIST.md) and [source conflicts](docs/SOURCE-CONFLICTS.md).

## Documentation

[Design directions](docs/DESIGN-DIRECTIONS.md) · [Design system V2](docs/DESIGN-SYSTEM-V2.md) · [Motion system](docs/MOTION-SYSTEM.md) · [Aceternity selection](docs/ACETERNITY-SELECTION.md) · [Higgsfield capabilities](docs/HIGGSFIELD-CAPABILITIES.md) · [Asset provenance](docs/ASSET-PROVENANCE.md) · [Business research](docs/BUSINESS-RESEARCH-V2.md) · [Brand visual research](docs/BRAND-VISUAL-RESEARCH.md) · [Inspiration research](docs/INSPIRATION-RESEARCH.md) · [Public deployment](docs/PUBLIC-DEPLOYMENT.md)
