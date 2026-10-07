# Final polish report · "restore the best parts of the old version without losing the new system"

Date 2026-10-07. Audit, decisions and before/after tables: [FINAL-COMPARATIVE-AUDIT.md](FINAL-COMPARATIVE-AUDIT.md) (§1–§3
measurements, §8 decisions, §9 resolution). Device code audit: [DEVICE-QA.md](DEVICE-QA.md). Mobile 3D: [MOBILE-3D-PLAN.md](MOBILE-3D-PLAN.md)
(Phase 2 has the full before/after table). User overrides applied throughout: **no animation removed**, **3D optimised to run
on phones**, the audit was audited before anything was executed. The phone version was the primary acceptance test.

## 1 · Current rendering audit
Every route was re-rendered at 390 × 844 and 1440 × 900 on a local production build (`next build` + `next start`) and in the
iOS 26.5 Simulator (Mobile Safari). There is no horizontal overflow on 11 routes at 390 or 1440. axe-core: **0 violations on 11 routes at both widths** (one
contrast issue on the ivory history chip was found and fixed during this pass).

## 2 · Old vs current comparison
See the A/B composites in `docs/evidence/final-polish/*-ab.jpg` (A · OLD | B · CURRENT before polish 496841c | C · NEW) and §28.

## 3 · What the old version did better
Serif emotion in headlines; a light, calm configurator with pictures; visible visit details on Kontakt; a Passbild price and CTA in the
first screen of Services; one-column framed gallery prints; an ivory, compact history; a shorter home with gentler colour alternation.

## 4 · What the current version does better
Shop first screen (name + price + stock at y 572 vs ≈810); PDP order (CTA in the fold); real price data and tools (estimator,
ICE slider, format ID, lab ticket); search; accessibility (44 px targets, 0 axe); motion system; 3D signature scenes; honesty (demo labels, provenance).

## 5 · What was restored
Serif display type (Instrument Serif, self-hosted, preloaded) · light photo-paper configurator surface on phones + the summary photo ·
Kontakt visit card first · Passbild price + CTA in the first Services card · one-column framed prints · ivory history with serif titles ·
calmer colour rhythm (white router, ivory archive) · one eyebrow per chapter · footer that fits a phone (accordions).

## 6 · What was intentionally not restored
Removing animations or 3D on phones (user override) · hiding the utility bar (it carries the mandatory DEMO notice; shortened below 380 px
instead) · OLD's repeated Porsche imagery · OLD page lengths where they came from missing features · Vanta on phones (continuous GPU cost; static art).

## 7 · Mobile hero changes
H1 "Analog. *Für immer.*" in serif (italic second line, solid; no outline) · eyebrow on one line "BILDERFÜRST FÜRTH · SEIT 1973" · copy
and buttons fully opaque from frame 0 (the rise animation is kept) · first strip frame no longer duplicates the Street Gallery photo ·
**3D workspace now runs on capable phones** (lite profile): no mount task ≥ 50 ms at 4× CPU, 83/83 intro frames, 7.3 MiB GPU textures
(was 57.9), fixed stage (no canvas resize on the view switch), the sheet view hands over to the readable DOM contact sheet after the pencil mark.

## 8 · Mobile typography changes
Serif for emotion/heritage (hero, Druckraum, Street Gallery, Archiv, Laden, Galerie, Geschichte, Kontakt, history chapter titles);
condensed caps for lab/shop/technical; mono only for codes, ISO, formats, prices. Product names as written (no forced caps, no clamp).
Every field is 16 px on touch (no iOS zoom). The PDP price note is one 13 px sans line.

## 9 · Mobile color-rhythm changes
Home: dark hero+status (1,030 px incl. header) → **white router** → light table → dark lab → light store → graphite scanner → light print room →
dark Street Gallery (790) → **ivory archive** → light visit → dark footer. Longest dark run 1,508 px (one chapter) instead of 1,875 + 1,808.
History chronicle ivory on phones (dark film strip kept on desktop). Configurator steps on photo paper below 900 px.

## 10 · Mobile homepage-length changes
12,534 → **11,589** at 390 (footer 1,252 → 903), by composition only: footer accordions, router chip index (218 → 84), Street Gallery facts and
past events behind one disclosure, opening hours as one line on phones (full table on /kontakt), borderless light-table tiles. Target was
≈10,500; the remaining ~1,000 px would need content cuts (lab price ticket, film tiles), which the audit ruled out.

## 11 · Film-configurator changes
(lab-polish agent) Light photo-paper steps below 900 px; Blender format renders in three-across tiles; two-column process tiles; total + CTA dock
from the first choice; summary photo restored (desktop too); receipt collapsed on phones; first option still y 447; page 5,867 → **4,819**;
all 27 combinations give identical variants and prices.

## 12 · Shop changes
Names in their own case, never clamped; a shouted leading brand is normalised ("PENTAX 17" → "Pentax 17", "CINESTILL CineStill" → "CineStill");
first card unchanged at y 572; search rows read title → price/stock → spec; sort/filter selects 16 px on touch; hover effects only on hover devices.

## 13 · PDP changes
Packshot fills the frame width (292 → 342 px, native 1400 px, no upscaling); price note one line; CTA 708 → 710 (still in the fold).

## 14 · Digitization changes
Solid H1 (no outline); the slide photo is in the fold (≈760 → 669); seven objects as two-column picture tiles drawn to one scale; the
detail panel still opens directly after the tapped tile's row; jump index, estimator and select labels unchanged (locked).

## 15 · Gallery changes
Serif H1; one column of large framed prints (photo 286 px in a 358 px frame), caption = title + one line, position only in the hang plan;
hang plan with 12 thumbnails; the 3D window now uses the Blender light-baked street-window GLB on desktop **and phones** (3 draws, 6 MiB on phones).

## 16 · History changes
8,999 → **7,955** at 390; ivory chronicle; serif chapter titles and H1; first paragraph + "Weiterlesen"; source notes folded; film-edge codes
desktop-only; chapter bar 52 → 40 px with scroll-padding recomputed (anchors land under the bar).

## 17 · Header/navigation changes
Notice shortened below 380 px ("DEMO · KEINE BESTELLUNGEN", no clipping at 360); wordmark and search names now contain their visible text
(label-in-name); search shortcut exposed via `aria-keyshortcuts`; cart count weight 500; footer link groups as accordions on phones.

## 18 · Motion changes
Hero text no longer fades from .4 (rise only). The WebGL intros start after the first presented frame, so they are never swallowed (desktop intro
frames drawn 35 → 84). Frame guard: lowers DPR, then hands over to the existing DOM animations on weak devices. Hover-only effects now
require a hover-capable pointer; touch gets `:active` feedback instead.

## 19 · Animations removed
**None.**

## 20 · Animations retained
All: hero intro (line drawing → shaded, lamp, strip unwind, develop), strip ⇄ contact sheet + grease pencil, pointer orbit (mouse), gallery
light-up and scroll dolly, contact-sheet spread, drawer micro-interactions, light-table expose, print emerge/fan, archive develop strip,
configurator film advance/tank/scan/receipt lock, digitization scan pass/tile scan/panel lock, history develop + counter, sheet entrances.

## 21 · Responsive differences desktop/mobile
Desktop keeps the dark lab configurator, the dark history film strip, zone codes and frame counters, Vanta atmospheres and the full 3D profile
(shadow map, PMREM). Phones get paper/ivory surfaces, one eyebrow per chapter, accordions/disclosures, the lite 3D profile.

## 22 · Accessibility results
axe-core 0 violations · 11 routes × 390 and 1440 (local production build). Focus return on Safari, no ring on dialog open, `touch-action`,
16 px fields, reduced motion = 0 canvases and final states (verified by the 3D agent).

## 23 · Real-device results
**iOS 26.5 Simulator (iPhone 17, Mobile Safari)** — not a physical device. Verified: serif hero, 3D hero renders (cartridge, strip, light table,
sepia proof sheet), Negativ → Kontaktbogen plays in 3D and lands on the readable DOM sheet with the pencil mark, Blender street window renders
with baked light on /galerie. The Simulator uses the Mac GPU, so phone frame times, thermal and memory limits are **not** measured.
No Android device or emulator was available. A checklist for real devices is in DEVICE-QA.md.

## 24 · Performance before/after
Lighthouse 13 against production, run back to back: the previous deployment (496841c, its own Vercel URL) against the new one, same
machine, same minute. **Caveat:** the machine was heavily loaded (load average 10 → 46 during the runs), so single runs vary by ±10 points.

| Page | Old (496841c) | New (4320264) |
|---|---|---|
| Home · mobile | 89 / 80 (LCP 3.6 s) | 81 / 74 (LCP 4.0–5.5 s, text LCP = serif H1) |
| Shop · mobile | 97 / 93 (LCP 2.4–3.1 s) | 76 / 91 (LCP 3.4–3.7 s) |
| Filmentwicklung · mobile | 88 / 91 | 93 / 92 |
| Home · desktop | 99 | 99 |

Accessibility 100 and Best Practices 100 on all four. CLS is 0.000 everywhere.

Found and fixed during this pass: global serif preloads competed with the shop's LCP image (4320264 moves them to the four serif routes).

Still open: home mobile LCP is the serif headline, which waits for the web font (≈2.2 s element render delay under throttling).
A smaller hero-only subset of the serif would reduce it.

WebGL (emulated phone, 4× CPU): see §7/§15 and MOBILE-3D-PLAN Phase 2.

## 25 · Current page heights (390 × 844, before → after)
Home 12,534 → 11,589 · Shop 5,333 → 5,067 · Shop/Filme 5,333 → 5,085 · PDP Pentax 4,245 → 3,950 · Filmentwicklung 5,867 → 4,819 ·
Digitalisierung 8,715 → 8,767 · Galerie 8,452 → 10,313 (larger one-column prints, by decision) · Geschichte 8,999 → 7,955 ·
Services 7,464 → 6,493 · Kontakt 7,013 → 6,716 · FineArt 5,799 → 5,463. Desktop home 1440: 14,187 → 13,539.

## 26 · Current first-action positions (390 × 844, document y)
Home "Film entwickeln" ≈465 · Shop first name/price ≈477/572 · Configurator first option 447 · PDP CTA 710 · Digitalisierung "Objekt wählen"
≈491, slide photo 669 · Kontakt "Route planen" 731, phone 789 · Services Passbild CTA 790.

## 27 · Current tap-target verification
Sweep of all links/buttons/fields at 390 on 9 routes. After fixes, the only boxes under 44 px tall are text links whose destination has a
≥ 44 px equivalent on the same card (product-name links next to the full-card stage), and the 34 px quick-add buttons, which carry a
44 px `::after` hit area. Fixed in this pass: wordmark (30 → 44), footer links (42 → 44), legal links on touch (19 → 44), hours mail link,
Instagram link.

## 28 · Screenshot comparison
`docs/evidence/final-polish/`: home-390, home-1440, shop-390, shop-1440, filmentwicklung-390, filmentwicklung-1440, digitalisierung-390,
galerie-390, geschichte-390, kontakt-390, services-390 (`*-ab.jpg`, fold, A | B | C).

## 29 · Remaining weak points
Home mobile Lighthouse is lower than before (serif LCP headline, see §24) · Home is still ≈1,000 px above the 10,500 target · the gallery page is longer at 390 (one-column prints) · real-phone GPU/thermal behaviour of the
3D scenes is unmeasured (Simulator only) · phone GLBs exceed their byte targets (115 KB / 88 KB, uncompressed geometry) · route pages other than home
still show zone codes on phones (by design, fewer per screen) · the DOM hero strip frames on phones without WebGL are unchanged in size.

## 30 · Owner-dependent items
Real studio/Passbild photography for Services · real print photography for FineArt · current Street Gallery exhibition (titles/photographers) ·
image rights for all source photographs (OWNER-CONFIRMATION-LIST.md) · go-live decisions (indexing, payment) — the site stays DEMO / noindex.
