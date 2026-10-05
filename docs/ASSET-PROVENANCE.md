# Asset provenance manifest

Updated 2026-10-05. Every visual asset belongs to **exactly one** category below. Categories are strict: a generated asset is never presented as a real photo, product, place, person, lab result or historical record. Real material is used only where it is genuinely the business's own source material, and its rights are still **pending owner approval**.

| Category | Where listed | Documentary? | Rights status |
|---|---|---|---|
| REAL BUSINESS PHOTO | `asset-manifest.json` uses *Business store image* / *Genuine business lab/sample image* | yes (business's own) | owner approval pending |
| REAL PRODUCT PHOTO | `asset-manifest.json` use *Product photography* (254) | yes (catalog) | owner approval pending |
| REAL HISTORICAL PHOTO | `asset-manifest.json` use *Historical image* (1 image + larger rendition) | yes | owner approval pending |
| OWNER LOGO | — | — | **none approved** |
| HIGGSFIELD 2D | 4 textures (WebP + AVIF) | **no — decorative** | AI-generated in owner-operated account |
| HIGGSFIELD 3D | 2 GLB + 6 poster renders | **no — decorative** | AI/procedural in owner-operated account |
| HIGGSFIELD VIDEO | 0 | — | — |
| GENERATED TEXTURE | 1 (CSS SVG grain) | no — decorative | code, no third-party rights |
| CSS/SVG GRAPHIC | see section below | no | — |

## REAL BUSINESS PHOTO / REAL PRODUCT PHOTO / REAL HISTORICAL PHOTO

Source of truth: [`docs/evidence/asset-manifest.json`](evidence/asset-manifest.json) — originally **265 source images** downloaded from photostudio.de (the business's current site): 254 *Product photography*, 8 *Genuine business lab/sample image*, 2 *Business store image*, 1 *Historical image*. Each entry has `url`, `filename`, `sourcePage`, `use` and `rights`. A concurrent research pass is extending it (291 entries when this file was written: +6 store images, +6 lab/sample images, 2 "Analog Store" brand marks, the header banner as evidence only, and 11 larger `-l.webp` renditions of existing files). **Every entry is `OWNER REVIEW ONLY - owner rights approval pending`.** The manifest, not this summary, is authoritative for counts. Files live in `public/images/`. See also [IMAGE-ASSET-MANIFEST.md](IMAGE-ASSET-MANIFEST.md) and [OWNER-CONFIRMATION-LIST.md](OWNER-CONFIRMATION-LIST.md).

Key real files used in hero / lab / gallery:

| File | Category | Manifest `use` | Source page | Bytes |
|---|---|---|---|---|
| `public/images/store-front.webp` | REAL BUSINESS PHOTO | Business store image | photostudio.de/i/unser-geschaeft | 52,294 |
| `public/images/store-inside.webp` | REAL BUSINESS PHOTO | Business store image | photostudio.de/i/unser-geschaeft | 52,694 |
| `public/images/film-rolls.webp` | REAL BUSINESS PHOTO | Genuine business lab/sample image | photostudio.de/ | 16,452 |
| `public/images/film-shelf.webp` | REAL BUSINESS PHOTO | Genuine business lab/sample image | photostudio.de/ | 55,322 |
| `public/images/lab-scan.webp` | REAL BUSINESS PHOTO | Genuine business lab/sample image | photostudio.de/ | 14,232 |
| `public/images/lab-film.webp` | REAL BUSINESS PHOTO | Genuine business lab/sample image | photostudio.de/ | 14,676 |
| `public/images/scan-adonal.webp` | REAL BUSINESS PHOTO (developer sample scan) | Genuine business lab/sample image | photostudio.de/ | 62,098 |
| `public/images/scan-silvermax.webp` | REAL BUSINESS PHOTO (developer sample scan) | Genuine business lab/sample image | photostudio.de/ | 61,084 |
| `public/images/scan-d76.webp` | REAL BUSINESS PHOTO (developer sample scan) | Genuine business lab/sample image | photostudio.de/ | 54,014 |
| `public/images/scan-hc110.webp` | REAL BUSINESS PHOTO (developer sample scan) | Genuine business lab/sample image | photostudio.de/ | 57,792 |
| `public/images/history.webp` | REAL HISTORICAL PHOTO | Historical image | photostudio.de/i/unsere-geschichte | 30,286 |
| `public/images/*-l.webp` | same category as the base file | larger rendition of the same source file | as base file | — |
| Newly added store/lab files (`store-exterior-*`, `store-interior-*`, `ice-sample-*`, `slide-*`, `scanner-ccd-sensor`, `print-kiosk-screens`, `fuji-store-nuernberg-interior`) | REAL BUSINESS PHOTO | per manifest | per manifest | — |
| 254 product `public/images/*.webp` | REAL PRODUCT PHOTO | Product photography | individual `/p/…` pages | — |

Rules: never retouch real photos into new content, never mix generated material into them, never caption a generated asset as a real one.

## OWNER LOGO

**Used in the remake, owner approval pending.** Header and footer show the business's current "Analog Store – Bilderfürst Fürth" mark (bold grotesk, film-frame "A") from `logo-analog-store-white-on-black.webp` (source: photostudio.de, `A_Logo_2 10x15.jpg`, see `evidence/asset-manifest.json`). It is rendered as a CSS mask from `public/brand/analog-store-logo-mask-{320,640}.png`, an alpha channel derived losslessly from the source file's luminance and trimmed; shape, proportions and lettering are unaltered. This lets the mark take the surrounding text colour on dark and light headers. The header banner `bf.png` (logo mixed with address, hours and the cf@ email) remains evidence only. Usage rights for the logo, like all source imagery, still need the owner's confirmation; a vector original from the owner would replace the raster mask. Product brand logos inside product photos belong to those products.

## HIGGSFIELD 2D

All four were generated 2026-10-05 in Higgsfield project **"Bilderfürst — Cinematic Remake Asset Studio"** (`1b1c2c3f-c022-481c-9c45-88ac11346184`) with **GPT Image 2.5** (`gpt_image_2_5`, variant flare, quality medium, 2k), selected from two candidates each (the FLUX.2 [pro] candidates were rejected; reasons in the [generation log](evidence/higgsfield/generation-log.json)). All are **decorative, non-documentary** abstractions: no objects, devices, products, text, logos or people. Lossless originals (pixel-verified against the downloaded PNGs, sha256 in the log) are in `docs/evidence/higgsfield/generated/`. Optimized with sharp 0.35.5 (WebP q90 effort 6, AVIF q65).

| Asset | Files (WebP / AVIF bytes) | Size | Generation ID | Looks like | Intended use | Recommended treatment |
|---|---|---|---|---|---|---|
| darkroom-safelight | `public/textures/darkroom-safelight.webp` (19,828) / `.avif` (6,869) | 1920×1086 | `d8965180-9deb-40ca-8fcb-bc8388e67735` | Near-black field, one soft deep-red diffused glow centred ≈70 % x / 18 % y (peak R≈133), faint haze, fine grain | Static fallback behind the Vanta FOG hero; reduced-motion and mobile hero | Base layer at **opacity 1** under the canvas (`background-position: 70% 18%`, `background-color:#050000`); when FOG runs on top, 0.6–1 |
| scanner-light | `public/textures/scanner-light.webp` (69,348) / `.avif` (18,792) | 1920×1086 | `db15e373-73c2-47cf-a18c-ae88c42c44c6` | Dark graphite field (mean ≈#373D42) crossed by one thin soft cool blue-cyan band at ≈49 % height (peak ≈#BED6E5) | Digitization/scan hero fallback | Base layer at **0.85–1**; keep the band clear of headline text or move it with `background-position-y` |
| film-base-amber | `public/textures/film-base-amber.webp` (46,010) / `.avif` (23,121) | 1920×1086 | `26649052-4851-432a-a695-96d9f7d75284` | Translucent orange-amber negative-base abstraction (dominant ≈#C84808), soft diagonal light, sparse fine dust | Film-lab section background accent | **0.08–0.18** over dark surfaces (`mix-blend-mode: screen` or `soft-light`); never behind small body text at higher opacity |
| archival-paper | `public/textures/archival-paper.webp` (114,474) / `.avif` (31,784) | 1200×1200 | `d41a16c4-2392-4bad-85da-b4c3141518b0` | Flat warm-white/ivory fibre-paper surface (mean ≈#F7F3E9), fine fibre texture | History / print card backgrounds | **0.25–0.5** on light cards, or as `multiply` overlay at 0.15–0.3; use `background-size: cover` (not verified as a seamless tile) |

Prompts (verbatim, also in the log):

- **darkroom-safelight** — "Abstract photographic background plate. Almost completely black darkness, like the air inside a sealed analog darkroom. One single soft, deep safelight-red glow, heavily diffused and out of focus, sits off-center in the upper right third and fades smoothly into black. Faint, barely visible chemical haze in the air catching the red light. Extremely subtle, low-key, underexposed, fine natural film grain, no hard edges. No objects, no lamp, no fixtures, no people, no text, no logos, no reflections, no neon, no bokeh circles, no lens flare. Matte, quiet, minimal, shot on medium-format film."
- **scanner-light** — "Abstract minimal photographic background plate. A dark graphite-grey field with a very subtle matte texture. A single thin, soft horizontal band of cool cyan-white light crosses the full width of the frame slightly below center, gently diffused with a soft blurred falloff above and below, like the light line of a film scanner seen through frosted glass. Low contrast, calm, fine natural grain. No devices, no machines, no glass edges, no interface, no grid, no text, no logos, no neon, no sci-fi, no particles, no reflections."
- **film-base-amber** — "Extreme macro photograph of blank, unexposed orange-amber colour negative film base, backlit on a light table, filling the entire frame edge to edge. Smooth translucent amber-orange surface with soft, uneven light transmission, gentle gradients from warm honey to deeper burnt orange, faint fine dust and very subtle surface texture, shallow depth of field. Pure abstraction. No frames, no image content, no sprocket holes, no edge printing, no numbers, no letters, no text, no logos, no borders."
- **archival-paper** — "Flat top-down scan of a blank sheet of warm white, ivory fibre-based baryta photographic paper, unexposed. Very subtle natural paper fibre texture and faint tonal variation, soft even diffuse light, no shadows, no vignette, no visible edges, no folds, no stains, seamless surface filling the entire frame. No text, no watermark, no objects. Neutral, quiet, archival."

Evidence-only (not published): `docs/evidence/higgsfield/generated/film-cartridge-reference-gptimage25.webp` — generic unbranded cartridge reference image, generation `eb1a8b0f-d28d-4b0c-84e3-759cb82e5830`, used only as input to image-to-3D.

## HIGGSFIELD 3D

| Asset | File | Source | IDs | Date | Geometry / size | Use | Fallback |
|---|---|---|---|---|---|---|---|
| film-cartridge | `public/models/film-cartridge.glb` | Higgsfield **Tripo H3.1 Image to 3D** (`tripo_h3_1_image_to_3d`, face_limit 20k, PBR) from the GPT Image 2.5 reference above | 3D job `989fcdc6-e3b7-440c-a45e-fb66f0e318c5`; reference `eb1a8b0f-…` | 2026-10-05 | 18,766 triangles, 1 material, 3 × 1024² WebP textures (`EXT_texture_webp`), **551,632 B** (raw 2,828,488 B kept in evidence) | Decorative lab/hero prop | Procedural Three.js cartridge or static image |
| analog-craft (6 roots: Aperture, Reel, Cassette, VHS, Negative, Prints) — **retired from production 2026-10-05** (no longer used by the remake; removed from `public/props`, kept in git history and `docs/evidence/higgsfield/`) | formerly `public/props/analog-craft.glb` | Higgsfield **3D Jutsu** scene builder, procedural Blender script [`create-props.py`](evidence/higgsfield/create-props.py) | project `9e1fa240-ae3d-49dd-b6f6-dc114bfbfd63`, revision 1, scene sequence 0, model op `bilderfuerst-editable-props-model`, GLB etag `b6438eb9298d24e7c4d052b9e784f1d0` | committed 2026-10-05 (`fc0b93c`) | 12,772 triangles, 7 untextured materials, 8 animations, `KHR_lights_punctual`, 589,592 B; editable `docs/evidence/higgsfield/analog-craft.blend` | Optical-craft props; aperture 1400 ms open/close; tilt ≈3.4° | The six posters below |
| Poster renders (2D renders of the 3D Jutsu props) — **retired from production 2026-10-05** | formerly `public/props/aperture.webp` (11,412), `reel.webp` (13,522), `cassette.webp` (6,204), `vhs.webp` (6,570), `negative.webp` (12,418), `prints.webp` (6,624) — all 400×300 | Eevee transparent renders, render ops `bilderfuerst-prop-posters-a/b/c` | artifact ids `8a4663…`, `f90da3…`, `37a60a…`, `9c7ddd…`, `8293a8…`, `f8882d…` (full ids + etags in [provenance.json](evidence/higgsfield/provenance.json)) | 2026-10-05 | PNG originals in `docs/evidence/higgsfield/*-poster.png` | Static stand-ins for the props | — |

All 3D assets are **decorative, non-documentary**, generic and unbranded: no merchant product, no real lab machine, no restoration outcome, no historical artifact. Machine-readable details: [`public/models/manifest.json`](../public/models/manifest.json). Rejected 3D: none (one attempt, accepted).

## HIGGSFIELD VIDEO

**None.** Silent ≤6 s video was cost-checked only (cheapest: Seedance 2.0 Mini 5 s 480p = 2.5 credits) and deliberately skipped: no native seamless loop, 480p too soft full-bleed, and Vanta FOG + CSS/Anime.js already supply bounded motion with static plates for reduced motion.

## GENERATED TEXTURE

Non-AI, code-generated textures:

| Asset | Location | Method | Use |
|---|---|---|---|
| Film grain | `--grain` in `app/styles/tokens.css`, applied by `.grain::after` in `app/styles/base.css` | Inline SVG `feTurbulence` fractal noise (200 px tile, opacity .07, overlay) | Global photographic grain overlay |

(The four AI textures above are listed under HIGGSFIELD 2D, not here.)

## CSS/SVG GRAPHIC

All hand-coded for this project (no third-party artwork), decorative unless stated, `aria-hidden` where they carry no information.

| Graphic | Where | Notes |
|---|---|---|
| Aperture mark (6-blade) | `components/analog/primitives.tsx` `ApertureMark` | Interface glyph only; no longer used as a logo since the real Analog Store mark is available |
| Sprocket rows, edge print, frame numbers | `app/styles/base.css` `.sprockets`, `.edge-print`; hero, lab, history, gallery | Generic 35 mm geometry; edge print uses only frame codes, never film-brand names |
| 135 cartridge line drawing with callouts | `components/hero-film.tsx` | First-paint technical drawing of a generic cartridge |
| Light table, contact sheet, grease-pencil mark | `components/hero-film.tsx`, `app/styles/hero.css` | — |
| Film strip progress (35mm / 120 / 110) and tank schematic | `components/lab/film-strip.tsx`, `process-tank.tsx`, `format-glyph.tsx` | Captioned "Schema, kein Foto der Maschine" |
| Scan dimension diagram | `components/lab/scan-specs.tsx` | Drawn to scale from the published Noritsu HS-1800 pixel sizes |
| Media silhouettes and identification diagrams (perforations, reel holes, cassettes) | `components/digitization/silhouettes.tsx`, `identify.tsx` | General identification cues, relative scale; not product renderings |
| Lab drawer icons (router) | `components/home-router.tsx` | — |
| Biometric framing schema | `components/story/services.tsx` | Registration-mark guide lines, no face, no certification claim |
| Print stack sheets | `components/home-print-room.tsx`, `components/story/print-room.tsx` | CSS 3D; sheets show real Tri-X lab samples |
| Window map / hanging plan, 2D window fallback | `components/gallery/window-map.tsx`, `window-stage.tsx` | Diagram of positions 1–12, not a photograph |
| Aperture iris (lightbox) | `components/gallery/lightbox.tsx` | 7-blade SVG mask, the single aperture signature |
| Tracing-beam film strip | `components/ui/tracing-beam.tsx` (Aceternity, adapted) | Amber film-base light |
| Static grain | `--grain` in `app/styles/tokens.css` | SVG feTurbulence data URI, 7 % opacity, hero/history/gallery on ≥ 768 px only |
| Vanta FOG / DOTS configuration | `components/darkroom.tsx` | Library effect (Vanta.js 0.5.24, MIT) with project colours; static fallbacks use the Higgsfield textures |

## DERIVED RENDITIONS OF REAL PHOTOS

Same source files, resized only (no retouching): `*-l.webp` (larger renditions fetched from the same photostudio.de source URLs at `width=2400`, max 1600 px; originals `docs/evidence/assets/*-l.jpg.original`), `film-shelf-m.webp` (900 px, from the `-l` original), `*-t.webp` (480 px hero-strip renditions). The ICE sample pair is shown aligned by CSS positioning only (measured scale ×1.0288, offset −13.9/+23.1 px); pixels unchanged.
