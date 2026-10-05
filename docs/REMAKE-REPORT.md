# Bilderfürst Fürth · Cinematic remake report

Remake of the owner-review preview, 05–06 October 2026. Live: **https://bilderfuerst.vercel.app** (public, no login, still **DEMO / OWNER REVIEW**, `noindex, nofollow`, no payment). Repository: https://github.com/Marioiubas/bilderfuerst (`main`; remake branch `claude/bilderfuerst-cinematic-remake-45ff9b`; baseline tag `remake-baseline-2026-10-05` = `6c9c213`).

Built as a coordinated team: three research specialists (live business research, Higgsfield asset studio, award-site study) followed by seven page teams with exclusive file ownership (hero, homepage, commerce, film lab, digitization, Street Gallery, history/services/store), integrated and QA'd by the lead.

## 01 Existing site audit
Baseline `6c9c213` (live until this release) already used black/graphite/red, Instrument Serif headlines and one red accent everywhere. Findings: editorial-magazine look rather than a lab; lab, scanning, store and archive visually indistinguishable; 15 image preloads on the homepage (React 19 auto-preloads every non-lazy `<img>`); shop mobile LCP 6.0 s; homepage accessibility 88; a `Suspense` fallback in the shop; derived catalog data errors (see 04); 17 of 18 `/i/` service pages rendering only a title because the extractor read the wrong ePages field. Before screenshots: `docs/evidence/visual-after/` (that release = this remake's "before").

## 02 Original business research
Live re-check of photostudio.de on 2026-10-05 (23 pages + 35 lab/scan products identical to the 04.10 snapshot), Google Maps (JS shell, nothing extractable beyond the earlier browser check), Instagram (public bio only). Details: [BUSINESS-RESEARCH-V2.md](BUSINESS-RESEARCH-V2.md), [BRAND-VISUAL-RESEARCH.md](BRAND-VISUAL-RESEARCH.md). New from the live site: Noritsu HS-1800 scan dimensions per format, 2026 digitization price graphics, application-photo packages, the hidden `/i/galerie` page, the current "Analog Store – Bilderfürst Fürth" logo, a genuine ICE5 before/after slide pair and 14 further business photographs.

## 03 Source conflicts
23 rows in [SOURCE-CONFLICTS.md](SOURCE-CONFLICTS.md) with field, sources, freshness, explanation, displayed value, owner flag and safe wording — dealer count 200 vs 300 (no number shown), three emails, two VAT IDs, Street Gallery 2018 vs 2020, spin-off 2011 vs 2012, Fuji-Store Adlerstraße 34 (current) vs Trödelmarkt 11 (2020 history), Leica/Fuji X status (history only), 6×9 resolution, slide price 0,20 vs 0,30 €, Metallic 20×30, phone 774201/774202, HRB/HRA, eBay handles, third-party imagery.

## 04 Business facts used
Address Alexanderstraße 2, 90762 Fürth (corner Schwabacher Straße); phone 0911 774202; info@analog-store.de; Mo–Fr 09:30–18:30, Sa 09:30–16:30; C-41 in the Fujifilm minilab, B&W in Jobo rotation, E-6 with CineStill chemistry; Noritsu HS-1800 (35mm 6774 × 4492 px, half frame 4492 × 3167, 120 6×4.5 → 6×9 sizes); the full lab price grid (27 variants from the catalog); four B&W developers with dilution/time on Kodak Tri-X; digitization since 2001 (ICE5 colour only, 13–15 MP, delivery 10/20 and 10/14 days, Super 8 19,95 € + 1,40 €/min, video 19,95/15/12 €, 2026 price graphics); passport 20 / 25 €; application photos 20 / 30 / 40 €; FineArt/Fotopapier/Metallic price list with Nürnberg markers; Street Gallery facts from `/i/galerie`; drop-off points (Fürth, Fuji-Store Nürnberg, Manufaktur Fürth-Dambach); verified history 1935–2020; 109 products with source prices/stock dated 04.10.2026. Catalog fix: shop grouping and film process/ISO/type re-derived from each product's own name and description (62 corrections logged in `docs/evidence/catalog-derivation-changes.json`; prices, IDs, stock untouched).

## 05 Business facts withheld
Dealer counts; turnaround times; Push/Pull stop range; mail-in procedure; file size/bit depth; 110 scan resolution; current exhibition, photographers, titles; 2018 as a standalone history milestone (ambiguous year); Leica/Fuji X as current operations; VAT IDs; Metallic 20×30 price (shown "auf Anfrage"); any review score; holiday hours. Each is phrased "im Laden erfragen" or omitted.

## 06 Design directions explored
A Modern Darkroom, B Archival Lab, C Analog Technology — palettes, typography and every page treatment in [DESIGN-DIRECTIONS.md](DESIGN-DIRECTIONS.md).

## 07 Final visual direction
**C · Analog Technology**, implemented without averaging: graphite/photographic black immersive zones, photo-white commerce, darkroom red only for interaction, one discipline accent per section. It is confirmed by the business's own logo (bold grotesk, film-frame "A") and the sampled photographs. Award-site study: [INSPIRATION-RESEARCH.md](INSPIRATION-RESEARCH.md) (24 sites; Awwwards SOTD "35mm", Foam, Carmencita, The Darkroom, Analogue Wonderland, Leica timeline, Legacybox).

## 08 Color system
Black #0a0b0c, graphite #14171a–#4d545a, silver #878f95–#e4e7e9, photo white #fafaf8; red #d12f26 (ink #b3261e, glow #ff4b3e), amber #e3a13c, cyan #4cc6cc, blue #4d72d4 (from the sampled Noritsu blue #314bb2). Roles, rules and computed contrast in [DESIGN-SYSTEM-V2.md](DESIGN-SYSTEM-V2.md) §1. The previous cream/olive family has no support in the physical evidence.

## 09 Typography system
Archivo Variable (OFL, self-hosted and preloaded) — width axis: 72 % condensed uppercase for display (film-box typography), 100 % for UI; IBM Plex Mono for film edge print (codes, ISO, process, frame numbers). Serif removed. Scale and leading in DESIGN-SYSTEM-V2 §3.

## 10 Component system
Tokens (`app/styles/tokens.css`), shared base (`base.css`: zones, buttons, links, chips, status, registration marks, sprockets, forms, dialogs, header, footer, atmosphere), primitives (`components/analog/primitives.tsx`: BrandLogo, SectionHead, Chip, EdgePrint, Sprockets), native dialog shell, area stylesheets per route. Rectangular 0–2 px geometry, hairlines, zone codes (DRK, LTB, LAB, STR, SCN, PRT, GAL, ARC, FTH, STU).

## 11 Anime.js architecture
Anime.js 4.5.0, modular imports, centralised in `motion/` (tokens, setup, reduced-motion, navigation, commerce, hero, home, products, film, lab, digitization, gallery, history, story). `createLayout` for FLIP moves, progress objects drive Three.js. See [MOTION-SYSTEM.md](MOTION-SYSTEM.md).

## 12 Complete animation inventory
44 entries with trigger, metaphor, duration/easing and reduced-motion behaviour: [MOTION-SYSTEM.md](MOTION-SYSTEM.md#complete-animation-inventory).

## 13 Vanta implementation
`components/darkroom.tsx`: FOG on the home hero (highlight 0x6e1b15, midtone 0x1b1f22, base 0x0a0b0c, blur .72, speed .32, zoom .85), DOTS on the digitization hero (0x24676b / 0x4cc6cc, size 1.25, spacing 38, no lines). Client only, dynamically imported, Three passed explicitly, mouse/touch/gyro off, DPR ≈ device/2.2 capped at 1.25, desktop tier only, starts after first engagement, destroyed offscreen/hidden/reduced motion/unmount, counts toward the two-context budget.

## 14 Vanta fallback
Static art-directed layers under every Vanta host: Higgsfield `darkroom-safelight` (FOG) and `scanner-light` (DOTS) textures in AVIF/WebP plus CSS gradients/dot grid. Shown on mobile, tablet, reduced motion, data saving, no WebGL and before engagement.

## 15 Aceternity components used
Spotlight (hero enlarger, static, desktop, lazy), Lens (hardware PDPs, home Pentax on desktop, lab developer samples), Compare (genuine ICE5 pair; Adonal vs D-76), Tracing Beam (history film-base light), Focus Cards (Street Gallery wall; added via the registry), 3D Card (Pentax 17, ≤ 4°, desktop). All restyled to the system. [ACETERNITY-SELECTION.md](ACETERNITY-SELECTION.md).

## 16 Aceternity components rejected
Parallax Scroll (removed: Focus Cards chosen), Animated Modal (native dialog), Container Scroll, Hero Parallax, Resizable Navbar, classic Spotlight, Layout Grid, Images Slider, Card Spotlight, Canvas Reveal, beams/sparkles/aurora/meteors — reasons in ACETERNITY-SELECTION.

## 17 Higgsfield models available
Connection verified (balance 106 → 86 credits): 44 image, 17 3D, 54 video models enumerated live (e.g. GPT Image 2.5, FLUX.2 pro, Seedream 5, Tripo H3.1, Hunyuan3D, Meshy, Seedance 2.0). No licence/commercial-use field is exposed. [HIGGSFIELD-CAPABILITIES.md](HIGGSFIELD-CAPABILITIES.md).

## 18 Higgsfield assets generated
Accepted: `public/textures/darkroom-safelight`, `scanner-light`, `film-base-amber`, `archival-paper` (GPT Image 2.5, AVIF+WebP, 7–114 KB) and `public/models/film-cartridge.glb` (GPT Image 2.5 reference → Tripo H3.1, 18,766 triangles, 552 KB, WebP textures). All decorative, unbranded, non-documentary.

## 19 Higgsfield assets rejected
Four FLUX.2 texture candidates (lumpy painterly glow, plaster texture with wide white band, too-yellow debris-laden film base, watercolour paper). No video generated (no seamless loop, 480 p too soft, CSS/WebGL covers motion). The earlier 3D Jutsu props were retired from production in this release (kept as evidence). Log: `docs/evidence/higgsfield/generation-log.json`.

## 20 3D asset manifest
`public/models/manifest.json`: film-cartridge (in production: home hero) and analog-craft (retired), with generation IDs, prompt, triangles, texture sizes, bytes, usage, fallback, provenance.

## 21 3D runtime implementation
Plain Three.js 0.186 (no React Three Fiber). Hero `components/three/film-workspace.ts`: GLB cartridge with RoomEnvironment/PMREM, curved CatmullRom film strip carrying real photographs in a canvas texture, light table, contact sheet, softbox/enlarger/faint safelight lighting; ~20k triangles, ~13 draw calls (+10 shadow), DPR ≤ 1.5, ≈ 45–50 MB GPU. Gallery `components/three/gallery-window.ts`: simplified window with 3×3 framed prints, glass, sill lights and the inside wall; 10 draw calls, 2048×1152 photo atlas. Both via `hooks/use-webgl-scene.ts`: desktop only, after first engagement, render on demand, pause offscreen/hidden, full dispose, max two contexts per page (Vanta + one scene on home).

## 22 3D fallbacks
Hero: SVG line drawing of the cartridge + DOM film strip of real photos + contact sheet (also the mobile/tablet/reduced-motion experience). Gallery: CSS window drawing with the same prints. Never a blank canvas; any error falls back to static.

## 23 Homepage rebuild
Journey with numbered chapters: 3D film workspace hero → live opening status → "Was hast du?" lab drawers → 01 Lichttisch (light-table products) → 02 Filmlabor (price ticket, machines, scan size, developer samples) → 03 Analog Store (Pentax 17, category index, used cameras) → 04 Scanner (cyan) → 05 Druckraum (print stack) → 06 Street Gallery (uncropped window photo + 3×3 map + community log of past events) → 07 Archiv (film strip of years + historic facades) → 08 Laden Fürth (hours with today, call, route, Instagram quote). Dark/light rhythm, still sections between motion moments.

## 24 Shop rebuild
Compact "ANALOG STORE" header with the real film-shelf band and count; category tabs with counts; Filme film-finder bar (Format / Typ / ISO / Prozess, live counts, disabled empties, quick picks); lab-specification filter rail (desktop) and bottom sheet (mobile); five sorts; optional Film-Index table; light-table product cards (frame no., brand, edge-print title, process chip, ISO, price, stock text); URL-synced filters for header deep links; bounded first-row filter animation.

## 25 Product page rebuild
Large stage, 2.5D stack for 3+ real images, Lens only for hardware, lightbox with focus return, buy box (variants, quantity, preview cart, source link), spec ledger from real fields, development bridge deep-linking into the configurator, real Tri-X developer contact strip on Tri-X pages, chemistry/other-format/related rows.

## 26 Filter / search UX
Search is an archive index (⌘K / Ctrl+K): grouped results (Film, Kamera, Sofortbild, Chemie, Equipment, Labor & Service), typo/alias parsing ("porta" → Portra, "sw", "kleinbild", "120", "dia", ISO numbers, "super8", "pass"), edge-print result rows, arrow-key navigation, "Was hast du?" empty state. Shopper test: Portra 400 in one search or two clicks; 120 B&W in one header click; stock always as text; development and passport photos reachable from search, header, PDP and cart.

## 27 Film development experience
Signature #2. Film strip as progress indicator drawn per format (35mm sprockets, 120 backing-paper numbers, 110 single perforation), process modules C-41 amber / SW silver / Push-Pull / E-6 blue with machine info and price deltas, schematic tank state, scan step with real Noritsu dimensions (diagram to scale, 6×9 conflict footnoted), expert mode with developer samples and Lens, optional drop-off step, envelope "Auftragsnotiz" ticket (printable, explicitly non-binding), URL state, all 27 combinations verified against catalog variants.

## 28 Digitalization experience
Signature #3. Vanta DOTS hero with real slide photos; object-first chooser (radio group of seven physical objects drawn to scale); "Nicht sicher?" identification diagrams; estimator only where prices are published; scanner pass over the genuine ICE5 pair handing over to Compare (alignment by positioning only: scale ×1.0288, offset −13.9/+23.1 px); process strip from drop-off to originals returned; drop-off addresses.

## 29 Street Gallery experience
Signature #4. Facts from the real gallery page; 3D window reconstruction (desktop) over a CSS window drawing; contact sheet → framed wall transition; Focus Cards with keyboard focus; the single aperture iris lightbox; hanging plan 1–9 window + 10–12 inside next to the real 2018 window photo; repeated, explicit "not the current exhibition"; call for entries and visit block.

## 30 History experience
Amber film-base light travels a vertical 35mm strip (adapted Tracing Beam); sticky year counter; nine chapters develop as the light arrives; uncropped historic facade strip; Leica/Fuji X/Nürnberg chapters marked historical; 2012 notes "Ende 2011"; 2018 kept as a note; static overview list and skip link.

## 31 Services experience
Four disciplines with distinct identities — Studio (photo white), Labor (amber), Archiv (cyan → digitization), Druck (paper). Passport photos with a registration-mark framing schema (no face, no certification claim), document list and prices; application portraits with package chooser, outfit advice and the real Calenso booking link.

## 32 FineArt experience
CSS 3D print-sheet stack (emerges on scroll, fans on pointer), paper → size → price selector with print location (Fürth / Nürnberg / erfragen), full price table, standard-print calculator (+0,99 € service fee), kiosk photo, "Bild vom Bild". No upload or online ordering.

## 33 Store experience
"Das echte Geschäft hinter dem Shop": storefront photo with subtle 2.5D planes cut from the same photo (desktop), live open/closed status with today highlighted, call and route actions (no map loaded before a click), what you can do in the shop, three drop-off cards, 2018 interior photos captioned as archive.

## 34 Cart / preview experience
Drawer on photo paper, no WebGL; lines grouped Analog Store vs Laborauftrag (envelope tickets with format/process/scan/quantity), development reminder when films are in the cart, source purchase links, Quellstand note. Checkout is nearly static: DEMO notice, 0 inputs, 0 forms, payment button disabled, link to the existing shop; no fake success.

## 35 Mobile experience
Copy-first hero with the DOM film strip; stacked lab drawers; bottom-sheet filters; full-height mobile navigation with zone codes; no Vanta, 3D, tilt or pointer depth; reduced choreography; grain off; 480 px hero renditions and a 900 px shop band. Verified at 360–430 px: no horizontal overflow.

## 36 Accessibility QA
axe-core (via agent-browser): **0 violations on 14 audited routes** (home, shop, PDP, configurator, lab, digitization, gallery, history, services, store, FineArt, checkout, legal, passport). Lighthouse accessibility 100 on home/film lab/digitization/gallery (shop 95 → an unlabelled sort select, fixed in the final commit). One H1 per page on all 190 routes, landmarks, real form controls, radio-group chooser, `aria-pressed` toggles, live regions, native dialogs with focus return, visible red focus rings, decorative canvases/textures `aria-hidden`. Not a full WCAG certification.

## 37 Reduced motion QA
With `prefers-reduced-motion: reduce`: 0 canvases on home/digitization/gallery (all `data-webgl=static`), all headings/copy/CTAs at full opacity, transitions globally disabled, final states rendered (hero, configurator, gallery wall, history list); only decorative 75 %-opacity edge-print labels remain dimmed by design.

## 38 Performance before/after
Lighthouse 13.5, live site, mobile = median of 3 after (before = single run on 05.10):

| Page | Perf before → after | LCP before → after | TBT before → after | CLS before → after | A11y before → after |
|---|---|---|---|---|---|
| Home mobile | 76 → **81** | 5.8 s → **4.8 s** | 32 → **2 ms** | 0.002 → **0** | 88 → **100** |
| Shop mobile | 76 → **91** | 6.0 s → **3.5 s** | 2 → 7 ms | 0 → **0** | 96 → 95 (fixed) |
| Filmentwicklung mobile | 89 → **91** | 3.6 s → **3.4 s** | 0 → 7 ms | 0 → 0 | 96 → **100** |
| Home desktop | 98 → **100** | 1.0 s → **0.7 s** | 19 → **0 ms** | 0.028 → **0** | 88 → **100** |
| Digitalisierung desktop | 99 → 99 | 0.84 → 0.96 s | 29 → 0 ms | 0.001 → 0 | 91 → **100** |
| Galerie desktop | 100 → 100 | 0.50 → 0.74 s | 0 → 0 ms | 0.001 → 0 | 96 → **100** |

Key fixes: image preloads 15 → 1 on home; WebGL deferred to first engagement (desktop TBT 581 → 0 ms in testing); shop `Suspense` fallback removed (CLS 0.687 → 0.04 locally); self-hosted, preloaded Archivo; right-sized images; area CSS per route. Raw reports: `docs/evidence/remake/lighthouse-before/`, `lighthouse-after-final/`. Single Lighthouse runs vary ±10 points on mobile; INP was not measured (lab tool).

## 39 Bundle size before/after
All emitted JS chunks: 1,999,438 B raw / 539,780 B gzip → 2,380,964 B / 668,337 B (Three.js loaders, scenes and the larger interactive modules, all lazy). Initial JS transfer (Lighthouse): home 274 → 329 KB, shop 273 → 314 KB, film lab 273 → 306 KB. CSS: 86,531 B / 17,995 B gzip global → 231 KB / 50 KB gzip total, but loaded per route: 23–35 KB gzip per page. Three.js (184 KB gzip) is never in an initial bundle.

## 40 WebGL performance
Home: two contexts max (Vanta FOG + hero scene), started only after engagement, 0 draw calls when idle or offscreen, disposed on teardown; gallery: one context, 10 draw calls, verified 0 leaked canvases across four navigations; digitization: one context (Vanta DOTS). No WebGL on shop, PDP, cart, checkout, legal, configurator. No physical low-end GPU or FPS benchmark is claimed (headless/SwiftShader only).

## 41 Responsive QA
Full-page captures at 1440 and 390 for all key routes (`docs/evidence/remake/after/`), plus agent checks at 360/768/1024/1280; no horizontal overflow; route sweep 190/190 locally and live.

## 42 Source provenance
Every claim maps to [BUSINESS-RESEARCH-V2.md](BUSINESS-RESEARCH-V2.md) (fact → exact value → source URL → live/snapshot), product data to `lib/catalog.json` (source URL, ID, price, stock per product, Quellstand 04.10.2026), source page text to `lib/source-content.json` (restored from the live extract), legal text unchanged.

## 43 Generated-asset provenance
[ASSET-PROVENANCE.md](ASSET-PROVENANCE.md) separates REAL BUSINESS / PRODUCT / HISTORICAL PHOTO, OWNER LOGO, HIGGSFIELD 2D/3D/VIDEO, GENERATED TEXTURE and CSS/SVG GRAPHIC, with generation IDs, model, date, prompt and decorative status; derived renditions of real photos are resized only.

## 44 Owner confirmations needed
[OWNER-CONFIRMATION-LIST.md](OWNER-CONFIRMATION-LIST.md) items 1–20: logo approval, image rights (incl. the Leica-credited ICE sample), history wording, unpublished lab facts, scan-resolution conflict, prices read from graphics, contact/legal data, gallery page and exhibition data, catalog derivations, holiday hours.

## 45 Launch blockers
Unchanged commerce gates: owner API/export and real commerce adapter, live prices/stock/tax/shipping/payment, sandbox orders and reconciliation, legal review, image and logo rights, consent/analytics IDs, production domain and SEO metadata (site stays noindex until authorised). Plus the remake's owner confirmations (44). The preview remains non-transactional.

## 46 Screenshot comparison

| View | Before (`docs/evidence/visual-after/`) | After (`docs/evidence/remake/after/`) |
|---|---|---|
| Home hero | [hero-1280](evidence/visual-after/hero-1280.jpg) | [home-hero-webgl-1440](evidence/remake/after/home-hero-webgl-1440.jpg), [contact sheet](evidence/remake/after/home-hero-contact-sheet-1440.jpg) |
| Home (full) | [home-1280](evidence/visual-after/home-1280.jpg) | [home-1440](evidence/remake/after/home-1440.jpg) |
| Home mobile | [home-390](evidence/visual-after/home-390.jpg) | [home-390](evidence/remake/after/home-390.jpg) |
| Shop | [shop-1280](evidence/visual-after/shop-1280.jpg) | [shop-1440](evidence/remake/after/shop-1440.jpg) |
| Shop mobile | [shop-390](evidence/visual-after/shop-390.jpg) | [shop-390](evidence/remake/after/shop-390.jpg) |
| PDP | [p-pentax-17-1280](evidence/visual-after/p-pentax-17-1280.jpg) | [p-pentax-17-1440](evidence/remake/after/p-pentax-17-1440.jpg), [Tri-X](evidence/remake/after/p-kodak-tri-x-400-135-36-film-1440.jpg) |
| Film development | [filmentwicklung-1280](evidence/visual-after/filmentwicklung-1280.jpg) | [filmentwicklung-1440](evidence/remake/after/filmentwicklung-1440.jpg) |
| Digitization | [digitalisierung-1280](evidence/visual-after/digitalisierung-1280.jpg) | [digitalisierung-1440](evidence/remake/after/digitalisierung-1440.jpg) |
| Street Gallery | [galerie-1280](evidence/visual-after/galerie-1280.jpg) | [galerie-1440](evidence/remake/after/galerie-1440.jpg), [3D window](evidence/remake/after/galerie-3d-window-1440.jpg) |
| History | [geschichte-1280](evidence/visual-after/geschichte-1280.jpg) | [geschichte-1440](evidence/remake/after/geschichte-1440.jpg) |
| Services | [services-1280](evidence/visual-after/services-1280.jpg) | [services-1440](evidence/remake/after/services-1440.jpg) |
| Store | [kontakt-1280](evidence/visual-after/kontakt-1280.jpg) | [kontakt-1440](evidence/remake/after/kontakt-1440.jpg) |
| FineArt | [i-fineart-prints-1280](evidence/visual-after/i-fineart-prints-1280.jpg) | [i-fineart-prints-1440](evidence/remake/after/i-fineart-prints-1440.jpg) |

## Final adversarial review
- *Generic photography website?* No: the first screen is the business's own logo, Alexanderstraße 2, a 135 cartridge and a negative of the real shop window, lab and scans; every section carries a lab zone code and verified numbers.
- *Analog expertise instantly?* C-41/SW/E-6 with the actual machines, Noritsu pixel dimensions, developer dilutions and the lab price grid appear on the homepage.
- *Connected to the Fürth shop / Street Gallery important?* Live hours, the corner photo, the 3×3 window map on home and a dedicated 3D window page.
- *Commerce easy?* Products above the fold on /shop, Portra 400 in one search, 120 B&W in one header click, stock always written out, calm drawer and checkout.
- *Digitization understandable without format names?* Object-first chooser and identification diagrams.
- *History real?* Only source chronology, conflicts noted, no invented imagery.
- *AI assets non-documentary / products real?* Generated textures and the cartridge are decorative and unbranded; all product and business images are the source photographs.
- *3D helping, Vanta atmospheric?* 3D is reserved for the hero object and the gallery window, starts after engagement, and both fall back to strong static art; Vanta sits behind at ~60 % over a static safelight.
- *Without motion / reduced motion / mobile?* Fully legible static states; 0 canvases with reduced motion and on mobile.
- *Owner-review protection?* DEMO banner, noindex/nofollow, no payment, dated catalog — unchanged.
- *Remaining weak spots:* mobile initial JS is ~55 KB heavier than before (catalog JSON + interactive modules hydrate on every page); live Lighthouse mobile scores vary run to run; several owner facts (turnaround, exhibition data, logo/image rights) are still open.
