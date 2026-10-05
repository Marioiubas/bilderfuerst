# Design System V2 · "Analog Technology"

Source of truth for code: `app/styles/tokens.css` (CSS) and `motion/tokens.ts` (motion). Shared CSS lives in `app/styles/base.css`; each area owns one stylesheet (`home`, `commerce`, `lab`, `digitization`, `gallery`, `story`). Components never hard-code hex values; they use tokens. Decision record: [DESIGN-DIRECTIONS.md](DESIGN-DIRECTIONS.md). Palette evidence: [BRAND-VISUAL-RESEARCH.md](BRAND-VISUAL-RESEARCH.md).

## 1 · Colour roles (every accent has one job)

| Token | Hex | Job | Never |
|---|---|---|---|
| `--black` | #0a0b0c | Photographic black: immersive zones (hero, lab, scanner, gallery, archive), footer | Commerce surfaces |
| `--graphite-900…500` | #14171a → #4d545a | Hardware bodies, dark panels, dark hairlines | Large light-zone text |
| `--silver-400…100` | #878f95 → #e4e7e9 | Equipment, technical UI, outline type, B&W process marker | Accent emphasis |
| `--white` | #fafaf8 | Photo-paper white: commerce, reading, product stages | Immersive zones |
| `--paper-50` | #f2f3f1 | Light-table tint, sticky filter rail, notes | — |
| `--red` / `--red-ink` / `--red-glow` | #d12f26 / #b3261e / #ff4b3e | **Interaction only**: CTA, focus ring, selected filter, active nav registration line, cart count. `red-ink` for small red text on white; `red-glow` for focus/marks on black | Decoration, section backgrounds, headings |
| `--amber` | #e3a13c | Negative film base: film products, C-41 process, chemistry, film-lab zone light | Digitization, commerce CTAs |
| `--cyan` | #4cc6cc | Scanner light: digitization zone, scan options, scan chips | Anything that is not scanning |
| `--blue` | #4c78c2 | E-6 slide process marker + technical drawing lines (scan dimension diagrams) | Links, CTAs |

Rules: one discipline accent per section; accents < 5 % of a viewport; photography stays the most colourful element. Hex values are designed from sampled business photography (black frames/equipment, white mats, silver hardware, film-base amber, red safelight convention) — they are not an owner-supplied brand palette.

Contrast (WCAG 2.x relative luminance, computed 2026-10-05): text #121416 on #fafaf8 17.67:1 · muted #555c62 on #fafaf8 6.50:1 (on stage #eceeec 5.82:1) · faint #6a7278 on #fafaf8 4.68:1 · white on red #d12f26 5.07:1 · red-ink #b3261e on #fafaf8 6.25:1 · #f4f5f3 on #0a0b0c 18.01:1 · inverse-muted #a3abb0 on #0a0b0c 8.45:1 · inverse-faint #80888e on #0a0b0c 5.47:1 · amber #e3a13c on #0a0b0c 8.84:1 · cyan #4cc6cc on #0a0b0c 9.62:1 · red-glow #ff4b3e on #0a0b0c 5.94:1 · blue #4c78c2 on #0a0b0c 4.48:1 (markers/large text only) · red #d12f26 on #0a0b0c 3.89:1 (large display or non-text only). Ink variants for small text on white: amber-ink 5.66:1, cyan-ink 4.85:1, blue-ink 6.86:1.

## 2 · Surfaces & zones

`.zone-dark` (black), `.zone-graphite` (#14171a), `.zone-light` (photo white), `.zone-table` (light table). A zone re-maps `--line`, `--text-muted`, `--text-faint` so components work in both. Grain (`.grain`) is static SVG noise at 7 % — allowed only in hero, history, gallery; never on product stages, checkout or inputs.

## 3 · Typography

| Role | Spec |
|---|---|
| Display (`.display`, `.display-xl`) | Archivo Variable, `font-stretch:72%`, weight 760–780, uppercase, leading .86, tracking −0.012em, `clamp(46px,7.2vw,112px)` / `clamp(60px,10.4vw,172px)` — the condensed bold of film-box typography |
| H1 / H2 | Archivo 72 % stretch, 740–760, uppercase, `clamp(40px,5.6vw,84px)` / `clamp(32px,4.2vw,60px)` |
| H3 / H4 | Archivo 88 % / 100 %, 650–680, sentence case, 20–26 px / 17 px |
| Body | Archivo 100 %, 15 px / 1.6; lead 18 px / 1.55, max 52ch |
| Technical (`.mono`, `.eyebrow`, `.code`, chips) | IBM Plex Mono 500, 10–11 px, uppercase, tracking .08em — film edge print: process, ISO, format, frame numbers, codes |
| Outline (`.outline-type`) | Transparent fill, 1.5 px stroke — second headline lines on dark zones only |

German-first copy; product names keep source spelling. Numbers use tabular figures (`.num`).

## 4 · Space, containers, grid

4 px base: `--s-1` 4 … `--s-10` 128. Gutter `clamp(16px,4vw,56px)` (16 px on phones). `.wrap` max 1440 px, `.wrap-narrow` 960 px. Section rhythm `--section: clamp(72px,9vw,144px)`. Layout grid: 12 columns, 24 px gap on desktop; 4 columns on mobile. Header 72 px (58 compact, 60 mobile) + 30 px utility bar.

## 5 · Geometry, borders, shadows, focus

Radius 0 / 2 px / 3 px only — equipment is rectangular. Hairlines 1 px (`--line` / `--line-dark`). Shadows: `--shadow-print` (paper lifting off a table), `--shadow-frame` (gallery frame on a wall), `--shadow-drawer`. Focus: 2 px red ring, 3 px offset (red-glow on dark). Registration crosses (`.reg`) mark technical frames; never more than one framed object per viewport.

## 6 · Motion

Durations: fast 180 · normal 320 · section 580 · hero 820 ms. Staggers: small 25 · normal 55 ms. Easings: `shutter` cubic-bezier(.2,.75,.1,1) for decisive mechanical stops; `optical` (.62,0,.32,1) for aperture/focus/contact-sheet travel; `advance` (.33,0,.15,1) for film advance; linear for scanner light. Character: mechanical, optical, precise, tactile — never bouncy, springy or floaty. Every custom animation names a metaphor (`Metaphor` type in `motion/tokens.ts`): film-advance, shutter, aperture, contact-sheet, develop, scan-pass, print-emerge, frame-lock, focus, expose. Anime.js owns custom motion (modules in `motion/`); Aceternity components keep their internal Motion; Vanta owns atmosphere; one engine per element. Tiers: desktop full, tablet moderate, mobile reduced (no pointer parallax, no 3D tilt, no Vanta, no large choreography), reduced-motion static. Full inventory: [MOTION-SYSTEM.md](MOTION-SYSTEM.md).

## 7 · Light

Light is a material, not decoration: enlarger cone (hero Spotlight), safelight (red, hero fog only), light table (even white glow behind products, +4 % on hover), gallery spot (top-down pools on frames), scanner bar (cyan, digitization only), film-base transmission (amber, lab/history). No neon, no rim-light glow, no iridescence.

## 8 · Components

| Component | Spec |
|---|---|
| Buttons `.btn` | 48 px (38 small), 2 px radius, 14 px/620. `btn-primary` red/white (dark+light zones), `btn-ink` black on paper, `btn-light` white on black, `btn-ghost` hairline. Hover: arrow shifts 3 px, a 2 px registration line draws under the button, primary gains a tiny exposure lift (brightness 1.08). No magnetic buttons, no scale. |
| Links `.link` | 14 px/620 with 1 px underline; hover recolours the line red and nudges the arrow. |
| Section head `SectionHead` | Mono code line (`ZONE` code in red + label + index) over a hairline, then the title; optional action on the right. Zone codes: DRK darkroom · LTB light table · LAB film lab · STR store · SCN scanner · PRT print room · GAL gallery · ARC archive · FTH Fürth store · STU studio. |
| Technical chips `.chip` | Mono 10 px uppercase, 22 px tall, hairline. Process variants: `chip-c41` amber square, `chip-bw` split black/silver, `chip-e6` blue, `chip-scan` cyan, `chip-red` selected. |
| Status `.status` | Filled square = available (Auf Lager, Quellstand); outlined square = ask/lead time. Text always present. |
| Photo frames | Gallery: black frame (12–16 px), white mat (8–10 % of image width), `--shadow-frame`. Contact-sheet frames: thin black rebate, mono frame number below. |
| Film frames / strip | `.sprockets` rows (35mm only), amber `edge-print` codes, frames 3:2 (35mm), 1:1 (120 6×6), 4:3 (110). 120 has no sprockets; 110 has one perforation per frame. |
| Product card | Index · brand · name · image (dominant, on `--surface-stage` light table) · format / process chip / ISO · price · availability. Image never cropped (contain). Hover: stage light +4 %, image shifts 3 px, technical row appears; no lift/scale. |
| Technical badge rows | `dl` grids with mono `dt` and sans `dd`, hairline separators — used for scan specs, developer data, product specs. |
| Form controls | `.input`/`.select` 44 px, hairline, 2 px radius; `.check` square with red fill; range uses red accent. Real form controls for all filters. |
| Filters | Desktop: sticky rail styled as lab specification controls (FORMAT / PROCESS / ISO / BRAND / STATUS mono labels, red selected marker). Mobile: bottom sheet (`Dialog kind="sheet"`). |
| Dialogs | Native `<dialog>` via `components/dialog.tsx`, kinds: drawer (cart), overlay (search), sheet (mobile filters), lightbox, full (mobile nav). Escape/backdrop close, focus return, shutter entrance ≤ 220 ms. |
| Drawers | Cart drawer 470 px, photo-white, no WebGL, fast. |

## 9 · Imagery

Real business photography (store, window, lab, scans, products) is evidence and is never altered beyond cropping/optimization. Generated assets (Higgsfield textures, 3D props) are decorative, `alt=""`/`aria-hidden`, and never resemble products, people, storefronts or historic material. See [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md).

## 10 · WebGL & 3D

Max two live contexts per page (`lib/webgl.ts`), render on demand, DPR ≤ 1.5 (≤ 1 tablet), desktop tier only by default, pause offscreen/hidden, destroy on unmount/reduced-motion, always over a static art-directed fallback (`hooks/use-webgl-scene.ts`, `data-webgl` state). No WebGL on shop, PDP, cart, checkout, legal, filters.
