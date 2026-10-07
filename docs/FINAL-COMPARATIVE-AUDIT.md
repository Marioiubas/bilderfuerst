# Final comparative audit: OLD · CINEMATIC · CURRENT (phase 1)

Production audited: **https://bilderfuerst.vercel.app @ 496841c**, captured 2026-10-07.
This is phase 1 only: capture, compare and judge. No code was changed.

- **A · OLD**: `docs/evidence/visual-after/` (Instrument Serif era)
- **B · CINEMATIC**: `docs/evidence/remake/after/`
- **C · CURRENT**: `docs/evidence/final-audit/current/` (this audit)
- **Composites**: `docs/evidence/final-audit/compare/` (`<route>-390-full|fold.jpg`, `pdp-390-*.jpg`, `<route>-1440-full|fold.jpg`, `<route>-1280-full.jpg`)

User overrides take precedence over the brief:
1. Keep every animation.
2. 3D must run on phones if it is optimised (Vanta stays off on phones).
3. Audit the audit before acting.

## 0. Method and limitations

- **Tooling.** Screenshots were taken with agent-browser 0.38.2 on headless Chrome 154 at DPR 1.
- **Phone and tablet captures** (360–430, 768×1024, 844×390) used Chrome with `--blink-settings` touch media, so `(hover:none)` and `(pointer:coarse)` both match. Hover hints and touch wording therefore render as on a phone.
- **Desktop captures** (1024–1728) used a fine pointer, with one `mouse move` before each capture.
- **Full-page captures** were scrolled through first. The 1280/1440 full pages are downscaled to 720 px. Originals are kept outside git.
- **Coverage.** All 12 routes at 12 sizes: 144 first-viewport shots and 48 full pages. States: `state-search-390x844`, `state-search-1440x900`, `state-menu-390x844`, `state-filter-390x844`, `state-shop-filme-390x844`, `state-cart-390x844`, `state-cart-1440x900`, `state-megamenu-1024x768`, `state-geschichte-chapterbar-390x844`.
- **No real devices.** No iPhone Safari or Android Chrome was available (§51–53). Safe areas, `svh`/`dvh` and real GPU behaviour are **not verified**.
- **Artifacts in the reference sets.**
  - OLD screenshots contain blank image boxes that are lazy-load capture artifacts, not design. Proof: `visual-after/home-1280.jpg` shows an empty Pentax card and an empty "Lichtweg" box, while `home-1280-loaded.jpg` shows both filled. The same blanks appear in OLD 390 (Pentax card, Lichtweg, FineArt and "Gestern" cards, third gallery frame). Do **not** read them as OLD flaws, and do not read them as OLD "white space" either.
  - The CINEMATIC 390 shots have the sticky header and the "Zum Inhalt springen" skip link pasted mid-page. That is a full-page capture artifact.
- **Headless timing.** Headless Chrome throttles `requestAnimationFrame` in background tabs, so intro timing was judged from CSS plus at-load measurements, not from single frames.
- **One recapture.** Two captures were transient misfires and were recaptured: `p-pentax-17-375x812` (it had loaded home) and `shop-844x390` (it measured before hydration).

## 1. Measurements

### 1.1 Page height (px, document `scrollHeight`)

| Route | OLD 390 | CIN 390 | **CUR 390** | CUR 430 | CUR 1280 | CUR 360 / 768 / 844×390 |
|---|---|---|---|---|---|---|
| Home | 9,360 | 16,289 | **12,534** | 12,446 | 13,413 | 12,800 / 17,010 / 16,951 |
| Shop | 16,849 (all 107) | 19,044 | **5,333** (24-card batch) | 5,474 | 3,469 | 5,521 / 4,661 / 4,802 |
| Shop · Filme | – | – | **5,333** | 5,333 | 3,566 | 5,333 / 4,802 / 4,997 |
| PDP Pentax 17 | 1,968 | – | **4,245** | 4,169 | 3,369 | 4,443 / 4,400 / 4,515 |
| PDP Portra 400 | – | 4,773 | **4,724** | 4,641 | 3,585 | 4,867 / 5,164 / 5,349 |
| Filmentwicklung | 2,640 | 6,366 | **5,867** | 5,805 | 3,443 | 6,084 / 4,962 / 4,294 |
| Digitalisierung | 2,281 | 13,564 | **8,715** | 8,412 | 9,193 | 9,040 / 12,429 / 12,293 |
| Galerie | 3,185 | 8,143 | **8,452** | 8,412 | 6,334 | 8,594 / 7,873 / 7,978 |
| Geschichte | 2,566 | 8,784 | **8,999** | 8,838 | 7,337 | 9,369 / 8,348 / 8,473 |
| Services | 2,731 | 7,261 | **7,464** | 7,262 | 4,397 | 7,691 / 6,729 / 6,786 |
| Kontakt | 2,108 | – | **7,013** | 6,868 | 4,862 | 7,228 / 6,163 / 6,210 |
| FineArt | – | – | **5,799** | 5,659 | 4,164 | 6,031 / 5,308 / 5,261 |

No horizontal overflow at any size. The footer is **1,252 px at 390**, which is 10 % of home; the OLD footer was about 430 px. Tablet and landscape home (17,010 / 16,951) are longer than phone home.

### 1.2 Fold test at 390×844 (document y, header included)

| Target | CURRENT | OLD (from pixels) | In fold? |
|---|---|---|---|
| Home primary CTA "Film entwickeln" | **469–517** (plus "Film kaufen" at the same y; "Alte Medien" at 528–572) | ≈474 | yes / yes |
| Shop first product name / price / stock | **477 / 552 / 552** (card bottom ≈571); 4 complete cards visible | name ≈810, price below fold | **CUR only** |
| Configurator first option (35MM) | **447–618**; options are 171 px tall | ≈626 | yes / yes |
| Digitization media chooser | **1,433** (fieldset); hero CTA "Objekt wählen" at 491–539 jumps to it; jump index at 984–1,130 | tiles ≈880 | no / no |
| PDP Pentax price / stock / CTA | **589–617 / 673 / 708–756** | price ≈739, CTA below fold | **CUR only** |
| PDP Portra price / stock / CTA | **538–566 / 622 / 655–703** | – | yes |
| Kontakt "Route planen" / phone | **1,058 / 1,116** | ≈630 | **OLD only** |
| Services first booking CTA | 3,379 ("Zum Studio" card link ≈828) | ≈520 (Passbild CTA) | OLD better |

In landscape (844×390), the home CTAs are inside the first screen. The lock is respected.

### 1.3 Home at 390: section sequence, background luminance, headline type

| # | Section (y, height) | Background (relative luminance) | Headline: Archivo Variable, stretch 72 % | Visible decorative codes (aria-hidden) |
|---|---|---|---|---|
| 1 | Hero (90, 802) | `#0A0B0C` **0.003 dark** | H1 67.9 px/780 "ANALOG." + **outline** "FÜR IMMER." | 17 (16) |
| 2 | Status strip (892, 142) | 0.003 dark | – | 2 (0) |
| 3 | Router "Was hast du in der Hand?" + chapter index (1,034, 931) | `#14171A` **0.008 dark** | H2 32 px/740 | 13 (11) |
| 4 | Lichttisch (1,965, 1,074) | `#F2F3F1` **0.893 light** | H2 32 px | 7 (4) |
| 5 | Filmlabor (3,039, 1,509) | 0.003 dark | H2 32 px | 4 (0) |
| 6 | Analog Store (4,548, 1,513) | `#FAFAF8` **0.955 light** | H2 32 px | 7 (0) |
| 7 | Scanner (6,060, 1,014) | 0.008 dark | H2 32 px | 4 (0) |
| 8 | Druckraum (7,074, 1,202) | 0.955 light | H2 32 px | 4 (0) |
| 9 | Street Gallery (8,277, 1,085) | 0.003 dark | H2 32 px | 4 (0) |
| 10 | Archiv (9,362, 723) | 0.008 dark | H2 32 px | 8 (4) |
| 11 | Laden Fürth (10,085, 1,197) | 0.955 light | H2 32 px | 4 (0) |
| – | Footer (11,282, 1,252) | dark | "BRING DEINEN FILM" + **outline** "NACH FÜRTH." | – |

- **Dark runs.** There are two: sections 1–3 (1,875 px, about 2.2 phone screens) and sections 9–10 (1,808 px). Dark makes up about 59 % of the main height.
- **Decorative codes.** 74 are visible in total, 35 of them aria-hidden (the film-edge frame numbers in the hero strip). That leaves **39 visible, non-hidden codes**. Every chapter header carries three: a zone code (LTB, LAB, STR …), "NN / Name" and "Bild NN / 08".
- **Fonts.** Only Archivo Variable and IBM Plex Mono are loaded; there is no serif anywhere. In `main`, IBM Plex Mono is used on **213 text elements against 157 for Archivo**. Body text is 15 px.
- **Small text.** Non-hidden informational text below 12 px: **0** on every route (lock respected).
- **Bordered boxes** (three or more borders, at least 40×24 px) per 844 px viewport on home: 4 · 2 · 9 · 11 · 9 · 5 · 3 · 1 · 3 · 0 · 2 · 6 · 0 · 2 · 0. The peaks fall in the Lichttisch product cards and lab ticket band (y 1,688–4,220); elsewhere there are 0–3. Outermost boxes only: 4 · 1 · 1 · 1 · 2 · 2 · 3 · 1 · 3 · 0 · 2 · 6 · 0 · 2 · 0.
- **Utility bar on phones.** Yes: a 30 px bar holding only "DEMO / OWNER REVIEW · KEINE BESTELLUNGEN" (address and hours are already hidden). **At 360 the text wraps to two lines inside the 30 px bar and is clipped.** Header below it: 60 px, sticky; logo, 44×44 search, cart, menu.
- **Duplicate photo.** The storefront corner photo appears **three times** on home: as the hero strip frame "Fürth · 2018", in Street Gallery, and in Laden Fürth.

### 1.4 Photography and outline per route at 390

| Route | `<img>` count (full-width) | Image area as % of page | Outline headlines (excluding the global footer "NACH FÜRTH.") | H1 size |
|---|---|---|---|---|
| Home | 22 (7) | 14.2 | "FÜR IMMER." | 67.9 |
| Shop / Filme | 24 (0) | 19.4 | – | 39 |
| PDP Pentax / Portra | 4 / 6 | 12.3 / 7.9 | – | 34 |
| **Filmentwicklung** | **0** | **0** | "IM EIGENEN LABOR" (in the DOM, not visible at 390) | 42.9 |
| Digitalisierung | 5 (3) | 9.2 | "HEUTE DIGITAL." | 50 |
| Galerie | 14 (2) | 9.0 | "NACH DRAUSSEN." | 48 |
| Geschichte | 3 (1) | **3.8** | "AUF EINEM FILM." | 48 |
| **Services** | **0** | **0** | – | 40 |
| Kontakt | 4 (4) | 11.7 | – | 40 |
| FineArt | 1 (1) | 3.8 | – | 40 |

The footer outline appears on every page. So home, film, digitization, gallery and history each show **two** outline moments; brief §18 asks for one.

### 1.5 Hero intro opacity (brief §45)

`app/styles/hero.css:153` sets `.hero[data-intro=pending] [data-intro-step]{opacity:.4}` on the eyebrow, the H1 lines and the sub-copy. CTAs are exempt (fix O11). A 3.5 s timeout in `components/hero.tsx:24` releases the state if JS stalls.

On a fresh headless load the intro had already finished by the load event, with text at full opacity. One capture (375×812) did catch the pending state: H1 and body text visibly dimmed, CTAs opaque.

**Verdict: the brief's claim is real but intermittent.** It hits slow or hydration-delayed phones for up to 3.5 s.

## 2. Blur test (§75) at 390: first three things noticed

| Route | OLD | CURRENT | Target: photo · headline · action |
|---|---|---|---|
| Home | Serif headline → red CTA → B&W photographic contact sheet | Condensed + outline headline → red CTA → illustrated celluloid strip and "Negativ/Kontaktbogen" toggle (photos are about 105 px tall frames at the bottom edge) | OLD ✓, CUR partial (no photo weight) |
| Shop | Headline → white space → 2 product photos | Shelf photo band → H1 → 4 product photos with prices | CUR ✓ |
| Filmentwicklung | Headline → dark film-strip card → format tiles | H1 → dark option cards → mono progress chips | Neither has a photo above the fold; CUR has **none on the page** |
| Digitalisierung | Serif teal headline → large Noritsu photo → body | Outline headline → red CTA → stat row | OLD ✓ |
| Galerie | Serif headline → large framed window print → next print | Outline headline → long paragraph → storefront photo | OLD ✓ |
| Geschichte | Serif headline → archive strip → ivory cards | Outline headline → paragraph → film-strip archive photos | Tie; CUR text-heavy |
| Services | Serif red headline → Passbild card → price | H1 → paragraph → STUDIO card (no image anywhere) | OLD ✓ |
| Kontakt | Serif headline → window photo → address and route CTA | H1 → paragraph → storefront photo (route below the fold) | OLD ✓ for action |
| PDP | Product photo → thumbnails → name | Product photo → name/price → red CTA | **CUR ✓** |

## 3. Issue table by priority (§66)

Legend: **KEEP** = keep current · **RESTORE** = restore old · **MERGE** = combine · **REDESIGN** = new solution.

### P1 Mobile hero (home 390) — see `compare/home-390-fold.jpg`, `home-390-full.jpg`

| # | Issue | OLD | CURRENT | Better | Why | Action |
|---|---|---|---|---|---|---|
| 1.1 | Headline voice | Instrument Serif "Analog. / *Für immer.*", warm and editorial | Archivo condensed 68 px, uppercase; second line outline-only | OLD | Emotion and heritage. The outline line is the lowest-contrast text in the fold. | **MERGE**: serif H1, solid, italic second line; keep the current eyebrow → sub → CTA stack and its positions. |
| 1.2 | CTA in first screen | Two CTAs ≈474 | Three actions at 469–572, landscape fixed | CUR | Locked, more routes | **KEEP** |
| 1.3 | Hero visual | Real B&W contact sheet, about 50 % of the fold | Illustrated strip, wireframe canister and toggle; small photo frames | OLD | Blur test: photography is missing in CUR | **MERGE**: keep the strip and its animation; on phones scale frames to ≥160 px tall and drop the canister line art below 400 px. |
| 1.4 | Eyebrow | One short line | "DRK-00 / Bilderfürst seit 1973 · Alexanderstraße 2, Fürth" on two mono lines | OLD | Less code noise | **MERGE**: "BILDERFÜRST · FÜRTH · SEIT 1973", one line, DRK-00 decorative or dropped on phones |
| 1.5 | Intro start state | – | Text steps at opacity .4 until the intro runs (up to 3.5 s) | – | §45/§80 | **REDESIGN, animation kept**: text at opacity 1 from frame 0; animate translate, clip or mask only. |
| 1.6 | Brand legibility | "bilderfürst" wordmark plus subline | "Analog Store" mark; "Bilderfürst Fürth" micro text is unreadable at 390 | Mixed | The name appears only in the eyebrow | **KEEP** the logo asset; make sure the eyebrow carries "Bilderfürst" (1.4). |
| 1.7 | Utility bar | Tiny address + demo | 30 px demo disclosure; **clipped two-line wrap at 360** | CUR (with bug) | The disclosure is required until launch | **KEEP** + fix: short text below 380 px |

### P2 Mobile configurator (/filmentwicklung 390) — see `compare/filmentwicklung-390-full.jpg`, `-fold.jpg`

| # | Issue | OLD | CURRENT | Better | Why | Action |
|---|---|---|---|---|---|---|
| 2.1 | Surface | Light paper, calm | All dark | OLD on phone | Legibility and calm (§25) | **MERGE**: light photo-paper surface for the steps below 900 px; dark hero and dark lab section stay; desktop keeps the dark lab (§77). |
| 2.2 | Format options | Three tiles across, big numerals, one row ≈130 px | Three stacked cards, 171 px each (518 px), mono hint plus price | OLD for speed, CUR for info | Scan speed | **MERGE**: large numeral + one descriptor + price; the "auch Halbformat" hint moves to expert mode; first option stays at y447. |
| 2.3 | Process options | 2×2 tiles about 70 px | Four cards of 124 px with chips | OLD | Density | **MERGE**: two-column tiles; keep amber C-41 and blue E-6 markers. |
| 2.4 | Total + CTA reach | Summary with total and CTA ≈1,750–1,830 | "Gesamt" and CTA inside Auftragsnotiz ≈3,350–3,500. A fixed `fc-dock` (57 px) exists but sits off-screen. | OLD | Conversion | **MERGE**: show the dock (total + CTA, ≤56 px + safe area) once format is chosen; plain summary above the receipt. |
| 2.5 | Photography | Canister photo above the summary | **0 images on the page** | OLD | §29 order summary with a real film image | **RESTORE** the summary photo (desktop too). |
| 2.6 | Progress | None | Sticky 48 px 01–05 plus NOTIZ | CUR | §28 | **KEEP** |
| 2.7 | Auftragsnotiz receipt | – | Full receipt at 390 | CUR content | Brief: secondary | **KEEP**, collapsed under the summary on phones |

### P3 Mobile home rhythm (390)

| # | Issue | OLD | CURRENT | Better | Why | Action |
|---|---|---|---|---|---|---|
| 3.1 | Length | 9,360 | 12,534 (main 11,192 + footer 1,252) | OLD | Target 9,500–11,000 (§22) | **REDESIGN by composition** (not font size): footer as accordions (§64, about −550), router plus chapter index compacted (931 → ≈550), Street Gallery facts and "Vergangene Termine" collapsed, de-duplicated imagery. |
| 3.2 | Colour rhythm | Mostly alternating | Dark runs of 1,875 px and 1,808 px | OLD | §20 | **MERGE**: router (quick services) white; archive ivory. |
| 3.3 | Decorative labels | One eyebrow per section | 39 visible codes; a three-label header on every chapter | OLD | §21/§57 | **MERGE**: one eyebrow per chapter ("01 · Lichttisch"); drop "Bild NN / 08" and zone codes on phones (−16 to −22 labels, ≥40 %); keep film-edge numbers (they are part of the film image, aria-hidden). |
| 3.4 | Type roles | Serif everywhere (over-used) | Mono 213 against sans 157 text elements; all nine H2s condensed 32 px | Neither | §17 | **MERGE**: serif for Street Gallery, Archiv, Druckraum, Laden; condensed for Lichttisch, Filmlabor, Store, Scanner; mono only for ISO, formats, prices and specs. |
| 3.5 | Duplicate imagery | Porsche ×3 | Storefront ×3 | Neither | §22 | **REDESIGN**: each photo once (Street Gallery gets a print; Laden gets the corner). |
| 3.6 | Borders | Few | Concentrated in Lichttisch and the lab ticket (9–11 per viewport) | OLD (locally) | §56 | **MERGE**: borderless product tiles on the light table on phones; keep the ticket. |
| 3.7 | Big photo cadence | Full-bleed photo every second section | 7 full-width images; archive strip small | Tie | §24 | **MERGE**: archive photo full-width on phones. |

### P4 Shop cards (390) — see `compare/shop-390-fold.jpg`

| # | Issue | OLD | CURRENT | Better | Why | Action |
|---|---|---|---|---|---|---|
| 4.1 | Fold | First name ≈810, no price | Four complete cards; price ≈552 | **CUR** | Conversion, locked | **KEEP** |
| 4.2 | Product name | Sentence case, full | Uppercase condensed 14.5 px, two-line clamp truncates ("SCHWARZ-WEISS FILM…") | OLD | Readability (§32) | **MERGE**: sentence case, normal width, ≥15 px; condensed only for the price |
| 4.3 | Metadata | Brand line + mono format | Format · process chip · ISO; decorative 9 px index | CUR | Technical clarity | **KEEP** (index may go on phones) |
| 4.4 | Shop header | Editorial sentence, products pushed down | Shelf band + H1 + tabs + search/sort/filter | CUR | Fold lock | **KEEP**; a one-line sentence only if y571 holds |
| 4.5 | Search overlay | – | Title → meta → price/stock | CUR | §34 asks for price/stock before meta | **MERGE**: swap the two rows |
| 4.6 | Filter sheet | Simple | Sticky "48 Filme anzeigen", chips | CUR | Reachability | **KEEP** |

### P5 Header and navigation

| # | Issue | OLD | CURRENT | Better | Action |
|---|---|---|---|---|---|
| 5.1 | Phone header | Logo, search, cart, menu | Same at 44 px targets, dark on dark routes | CUR | **KEEP** |
| 5.2 | Phone menu | Small | Plain German labels, large; codes decorative | CUR | **KEEP** (§42 is already met) |
| 5.3 | Mega menu at 1024 | – | No wrap; orphan "→" under "Hohe Empfindlichkeit · ISO 800+"; featured-card meta wraps | CUR | **KEEP** + polish |
| 5.4 | History chapter bar | – | Sticky 52 px under the 56 px header = 108 px of chrome (12.8 % of the viewport) | – | **MERGE**: ≤40 px, or hide on downward scroll (§38) |

### P6 Digitization (390) — see `compare/digitalisierung-390-full.jpg`

| # | Issue | OLD | CURRENT | Better | Action |
|---|---|---|---|---|---|
| 6.1 | Hero | Serif teal italic + large Noritsu photo in the fold | Outline H1 + two CTAs + stat row; slide photo from ≈760 | OLD for emotion | **MERGE**: solid or serif H1, slide photo above the stat row |
| 6.2 | Object chooser | Four illustrated 2×2 tiles | Seven-row line-icon list at y1,433 | OLD look, CUR scope | **MERGE**: two-column picture tiles for all seven objects, short labels; position and detail-after-selection unchanged (locked) |
| 6.3 | Tools | None | Estimator, ICE5 slider, format ID, six stations, three locations | **CUR** | **KEEP** |
| 6.4 | Cyan | Teal headline | Localized to labels and numbers | CUR | **KEEP** |

### P7 PDP (390) — see `compare/pdp-390-fold.jpg`

| # | Issue | OLD | CURRENT | Better | Action |
|---|---|---|---|---|---|
| 7.1 | Order and fold | Price ≈739, CTA below the fold | IMAGE → NAME → PRICE → STOCK → QTY+CTA, all ≤756 | **CUR** | **KEEP** (§61 is already met) |
| 7.2 | Image size | Large | Pentax 1400×1050 displayed about 292×214 inside a 358 px frame | OLD | **MERGE**: fill the frame width (natural size allows it, no upscaling); keep CTA ≤844 |
| 7.3 | Price meta line | Small sans | Two-line mono uppercase "INKL. MWST… QUELLSTAND" | OLD | **MERGE**: one line, 13 px sans |

### P8 Gallery and history — see `compare/galerie-390-full.jpg`, `geschichte-390-full.jpg`

| # | Issue | OLD | CURRENT | Better | Action |
|---|---|---|---|---|---|
| 8.1 | Prints | One column, about 320 px black-framed prints, one-line captions (but the Porsche repeated 4 of 6 times) | Two-column, about 150 px prints, four or five metadata lines each | OLD layout, CUR content | **MERGE**: one-column large prints with the current 12 varied images; caption = title + one line; Reihe/Platz only in the hang plan; Porsche 2/26 kept |
| 8.2 | 3D window on phones | – | 2D "Modell, vereinfacht" (0 canvases on phones) | – | **REDESIGN (override)**: 2D stays as the poster; 3D starts on tap or visibility, DPR ≤1.5, on-demand frames, pauses off-screen |
| 8.3 | Hang plan | – | Twelve empty numbered boxes | – | **MERGE**: thumbnails inside the plan cells |
| 8.4 | History surface | Ivory, compact, serif chapter titles, 2,566 px | Dark film strip, 9 chapters, 8,999 px, only 3 images (3.8 %), "BF-ARC · 1935 · 01A" codes | OLD look, CUR content | **MERGE**: ivory on phones, large year, serif title, first paragraph + "mehr"; sources collapsed; strip edges desktop-only; 9 chapters and anchor offsets kept |

### Other phone routes

| Route | Finding | Better | Action |
|---|---|---|---|
| Services | **0 photos** at 390; the Passbild schematic is ≈600 px of empty guides; first booking CTA at 3,379 | OLD (photo; CTA ≈520) | **REDESIGN**: compact schematic or owner studio photo; Passbild price + CTA in the first card |
| Kontakt | Route and phone at 1,058 / 1,116 | OLD (≈630) | **RESTORE OLD order**: Besuch card (today's hours, route, phone) directly under the H1; photo after |
| FineArt | Light and clear; 17 bordered format boxes; one photo | CUR | **KEEP**; add real print photography when the owner supplies it |

### Desktop (§76) — see `compare/home-1440-*.jpg`, `shop-1440-*.jpg`, `filmentwicklung-1440-*.jpg`, `*-1280-full.jpg`

| # | Issue | OLD | CURRENT | Better | Action |
|---|---|---|---|---|---|
| D1 | Home length at 1440 | 6,279 | 14,187 (≈ CIN 14,167) | OLD | Spacing pass, no feature cuts (§76) |
| D2 | Hero sheets | Photo contact sheet | Three.js strip over two **blank grid light-table sheets** (read as placeholders) | OLD | **MERGE**: fill them with contact-sheet frames, or fade them |
| D3 | Street Gallery "Schaufenster 24 h" | – | Twelve empty wireframe frames (home and /galerie) | – | **MERGE**: thumbnails |
| D4 | Outline | – | Hero + every route H1 + footer | – | **MERGE**: one outline moment; preferred: footer sign-off only, serif hero (A/B per §86) |
| D5 | Film desktop | Light, compact, photo | Dark lab, 3,512 px, sticky receipt, 0 photos | CUR structure | **KEEP** dark (§77) + **RESTORE** the summary photo |
| D6 | Shop desktop / mega menu | – | Clean; no wrap at 1024 | CUR | **KEEP** |

## 4. Where the brief is wrong, overstated or already done

1. **"OLD was cleaner" is partly a capture artifact.** The OLD screenshots contain blank lazy-load boxes. OLD pages were also short because they had far less function: digitization 2,281 px with no estimator, ID or scan probe; shop 16,849 px with all 107 products. Height comparisons are not like for like.
2. **OLD had real flaws.**
   - Shop: first price below the fold.
   - PDP: CTA below the fold.
   - The Porsche repeated (4 of 6 gallery prints on phone, 3× on home).
   - Serif on every heading, including the footer's "Komm vorbei".
   - The configurator showed no prices per option.

   Restoring OLD wholesale would regress conversion.
3. **§40 "collapse the redundant utility bar".** On phones it only carries the demo disclosure, which is not redundant before launch. The real bug is the clipped wrap at 360.
4. **§42 plain-German mobile nav**: already implemented.
5. **§61 PDP order**: already implemented. Only image size and the meta line need work.
6. **§12/§21 "cards and borders everywhere": overstated.** Measured 0–3 bordered boxes per viewport outside one band (Lichttisch and lab ticket, 9–11). The real density drivers are the three-label chapter headers (39 visible codes), mono outnumbering sans, and long chapters.
7. **§31 "larger perceived image" in shop cards: overstated.** Images already fill the card. The real issue is the uppercase, truncated names.
8. **§45 opacity starts**: real in CSS (opacity .4 pending state, up to 3.5 s) but intermittent. CTAs are already fixed.
9. **§13 serif**: agreed for the hero. But OLD over-used serif, so follow the §17 role split, not a wholesale restore.
10. **§20 rhythm**: agreed. Concretely, two dark runs need breaking (router → white, archive → ivory).

## 5. Conflicts with the user overrides

- **Animations (override 1).** Brief §43/44/79 ("fewer animations, delete redundant motion on phones") is **not applied**. Every action above keeps the motion and changes only start state (text opaque), timing, stagger and trigger. Action 1.5 converts opacity fades into transform/mask motion; it does not remove them.
- **3D on phones (override 2).** Brief §15/§36/§46 ("no runtime Three.js on phones") is **overridden**. Today phones and tablets render **0 canvases**: WebGL is gated to `(min-width:1024px) and (pointer:fine)` in `hooks/use-webgl-scene.ts:44` and `motion/setup.ts:18`. To honour the override:
  - Lazy-load the hero strip and gallery window on phones after first engagement or visibility.
  - Cap DPR at 1.5 and use on-demand frame loops.
  - Pause off-screen with IntersectionObserver.
  - Keep the 2D poster as the LCP.
  - Keep reduced motion at 0 canvases.
  - Keep Vanta off on phones.

  Risk: this collides with the locked performance budget (home mobile about 81), so it must be measured before shipping.
- **"Research and audit the audit" (override 3)** is satisfied by sections 0, 1 and 4.

## 6. OLD did better / CURRENT does better (§90 items 2–4)

**OLD did better:**
- Emotional serif hero.
- Photographic contact sheet in the hero.
- Light, compact configurator with a summary photo and total + CTA by about y1,800.
- One-column photography-first gallery.
- Ivory, compact history with serif titles.
- Contact route and phone inside the first screen.
- A photo on services.
- Illustrated object tiles for digitization.
- Compact footer (about 430 px).
- Fewer label rows.

**CURRENT does better:**
- Shop fold: 4 complete cards against 0.
- PDP fold: price, stock, quantity and CTA all ≤ y756.
- Search overlay, cart drawer, and filter sheet with a sticky result CTA.
- Plain-German mobile menu with 44–48 px targets.
- No non-hidden text below 12 px.
- Configurator depth, y447 start and 48 px sticky progress.
- Digitization tools: estimator, ICE5 compare, format ID, jump nav.
- History with 9 sourced chapters.
- Gallery with 12 varied images and a hang plan.
- Photographic palette, landscape fold, and the desktop cinematic identity (3D hero, dark lab, sticky receipt).

## 7. Top actions ranked by phone impact

1. Configurator steps on a light photo-paper surface with compact tiles (MERGE, 2.1–2.3).
2. Configurator: visible total + CTA dock after the first choice, plus a summary photo (MERGE/RESTORE, 2.4–2.5).
3. Home hero: serif H1, no outline on phones, one-line eyebrow (MERGE, 1.1/1.4).
4. Hero intro: text opaque from frame 0, motion via transform/mask (REDESIGN, animation kept, 1.5).
5. Home colour rhythm: router white, archive ivory (MERGE, 3.2).
6. Home label diet: one eyebrow per chapter, drop "Bild NN/08" and zone codes on phones (MERGE, 3.3).
7. Home length 12,534 → about 10,500 by composition: footer accordions, router/index compaction, de-duplicated photos (REDESIGN, 3.1/3.5).
8. Shop card names in sentence case, untruncated (MERGE, 4.2).
9. Gallery: one-column large framed prints, short captions (MERGE, 8.1).
10. History: ivory surface, serif chapter titles, collapsed narrative, chapter bar ≤40 px (MERGE, 8.4/5.4).
11. Kontakt: Besuch card above the photo (RESTORE, Kontakt).
12. Digitization: picture tiles for the seven objects (MERGE, 6.2).
13. Hero strip: larger photographic frames on phones (MERGE, 1.3).
14. Services: replace the 600 px schematic, Passbild CTA early (REDESIGN).
15. Optimised 3D on phones (override), behind engagement and a performance budget; fix the 360 utility wrap alongside (REDESIGN, 8.2 / §5).

## 8. Lead review of the brief and decisions (2026-10-07)

Audit-of-the-audit: the brief was checked against these measurements, docs/DEVICE-QA.md (WebKit + code audit) and the user's explicit overrides. Decisions:

| Brief item | Verdict | Decision |
|---|---|---|
| §13/§17 serif emotional headlines | **Accepted** | Self-hosted Instrument Serif (already a dependency) for the home hero H1, Street Gallery, Archiv/history, Druckraum, Laden; Archivo condensed stays for lab/shop/technical; mono only for ISO/format/price/spec/codes. |
| §18 outline type | **Accepted, narrowed** | One outline moment: the footer sign-off. Hero H1 becomes solid serif (italic second line). |
| §43/§44/§79 fewer/removed mobile animations | **Rejected (user override)** | Every animation stays on every device; only *how* they start changes (§80: critical text at opacity 1 from frame 0, motion via transform/clip/mask). |
| §15/§36/§46 no runtime 3D on phones | **Reversed (user override)** | Hero workspace and the Street Gallery window become mobile-capable with mobile LOD assets and budgets from docs/MOBILE-3D-PLAN.md; static art remains the first paint and the fallback. Vanta stays desktop-only (§45, not overridden). |
| §12/§20/§21/§58 mobile density, colour rhythm, labels | **Accepted** | Router white, archive ivory; one eyebrow per chapter; zone codes and "Bild NN/08" decorative-only and hidden on phones (film-edge numbers stay — they are part of the film image). |
| §22/§72 home ≈ 9,500–11,000 px | **Accepted** | By composition only: footer accordions on phones, compact router + index, each photo once, Street Gallery/archive detail collapsed. |
| §25–29 configurator hybrid | **Accepted** | Light photo-paper steps below 900 px (test 768/900), format tiles use the new Blender format renders (135/120/110), two-column process tiles, total+CTA dock after the first choice, summary photo restored (desktop too), receipt collapsed on phones; first option stays ≈ y447; dark lab on desktop. |
| §30–34 shop/search | **Accepted, narrowed** | Shop first screen locked; product names sentence case (no uppercase transform, no truncation); search rows title → price/stock → metadata. |
| §36/§37 gallery | **Accepted + override** | One-column large framed prints on phones; hang plan with thumbnails; 3D window rebuilt on the Blender street-window.glb (baked light) for desktop and, per override, phones. |
| §38/§39 history | **Accepted** | Ivory surface on phones, large year, serif chapter title, first paragraph + "mehr", chapter bar ≤ 40 px (anchor offsets recomputed). |
| §40 hide utility bar on phones | **Rejected** | It carries the mandatory DEMO / OWNER REVIEW notice; shortened text below 380 px to fix the 360 px clipping. |
| §42 mobile nav, §61 PDP order, shop fold | **Already done** | Keep; PDP image fills its frame width (native size permitting) and a one-line price meta. |
| §49–53 devices | **Partially possible** | iOS 26.5 Simulator (Mobile Safari) installed with the user's approval — tested there and labelled as simulator, not a physical iPhone; no Android device/emulator available (stated). DEVICE-QA fixes D1–D12 applied (select 16 px on touch, keyboard-safe search overlay, hover rules only for hover-capable pointers, Safari focus return, no focus ring on open, touch-action, :active states, contained overscroll, svh, cart-count weight). D3 (Back closes dialogs): Android Back already closes our native modal `<dialog>`s via CloseWatcher (Chrome 120+), so no history entry is pushed. A pushState shim was rejected because the Next App Router reloads or traverses on foreign popstate entries. iOS has no Back button, and edge-swipe stays normal page navigation. |
| "OLD looked cleaner" | **Partly an artifact** | Old screenshots contain never-loaded image boxes and fewer features; we restore specific decisions, not the old pages. |

## 9. Resolution (phase 2, 2026-10-07)

Measured on the dev server (`next dev`, port 3107) in the app's browser pane with viewport emulation. "Before" is
the measurement in §1–§3 above (or the owning agent's own before-measurement), "after" is the same probe after the changes.
Every animation is kept; where a start state changed it is listed in the last table.

### 9.1 Phone (390 × 844 unless noted)

| Row | Before | After |
|---|---|---|
| Home height (3.1) | 12,534 | **11,545** (footer 1,252 → 903; at 360: 1,290 → 1,017) |
| Home dark runs (3.2) | 1,875 + 1,808 px | header+hero+status 1,030 px; then white router; Street Gallery 790 px then ivory archive. Longest dark section: Filmlabor 1,508 px |
| Visible decorative codes in `main` (3.3) | 39 | **1** |
| Chapter eyebrow (3.3) | "LTB · 01 / LICHTTISCH · BILD 01 / 08" | "01 · LICHTTISCH" (code and counter desktop-only) |
| Serif (3.4, 1.1) | none loaded | Instrument Serif (normal + italic, self-hosted, preloaded): hero H1, Druckraum/Street Gallery/Archiv/Laden H2s, Galerie/Geschichte/Kontakt H1s, history chapter titles |
| Outline type (D4) | hero, 5 route H1s, scanner year, footer | **footer sign-off only** |
| Hero intro (1.5, §80) | text steps from opacity .4 | opacity 1 from frame 0; the rise (translateY) is kept |
| Hero eyebrow (1.4) | "DRK-00 / BILDERFÜRST SEIT 1973 · ALEXANDERSTRASSE 2, FÜRTH" (2 lines) | "BILDERFÜRST FÜRTH · SEIT 1973" (1 line) |
| Duplicate photo (3.5) | 2018 corner/window shot ×3 | each photo once: strip opens on the window close-up, Street Gallery keeps the 2018 window photo, Laden keeps the corner |
| Router (3.1/3.2) | 931 px, graphite | 797 px, white; chapter index = one swipeable chip row (218 → 84 px) |
| Configurator (2.x) | first option 447, process 1,133, dock after 3rd choice, 0 photos, 5,867 px | first option 447, process 782, dock after 1st choice, summary photo restored, **4,805 px** (lab-polish agent) |
| Shop card names (4.2) | uppercase, clamped to 2 lines | as written (shouted leading brand normalised: "PENTAX 17" → "Pentax 17", "CINESTILL CineStill …" → "CineStill …"), never clamped; first name+price still y 572 (lock ≈571) |
| Search rows (§31) | title → spec → price | title → price/stock → spec, no clamp |
| PDP (7.2/7.3) | image 292 × 214 in a 358 frame; price note 2 mono lines | image 342 × 256 (native 1400 px, no upscaling); 1 sans line; CTA 708 → 710 |
| Digitalisierung (6.1/6.2) | outline H1; slide photo ≈760; 7-row icon list | solid H1; slide photo **669** (in the fold); two-column picture tiles, detail still opens after the tapped tile's row |
| Galerie (8.1/8.3) | two columns, ≈150 px prints, 4–5 meta lines; empty plan cells | one column, 286 px photo in a 358 px frame, title + one caption line; 12 thumbnails in the hang plan (same files as the wall) |
| Geschichte (8.4/5.4) | 8,999 px, dark chronicle, chapter bar 52 px | **7,942 px**, ivory chronicle, serif titles, first paragraph + "Weiterlesen", bar **40 px**, scroll-padding 112 px (anchors still land under the bar) |
| Kontakt | route 1,058 · phone 1,116 | route **731** · phone **789** (visit card before the photo) |
| Services | first Passbild CTA 3,379; 600 px schematic | CTA **790** in the studio card with the 20,00 € price; schematic 200 px wide, after the copy |
| Utility bar at 360 | wraps and clips | "DEMO · KEINE BESTELLUNGEN", one line (scrollWidth = clientWidth) |

### 9.2 Desktop (1440 × 900)

| Row | Before | After |
|---|---|---|
| D1 Home length | 14,187 | **13,539** (home-only spacing pass) |
| D2 Hero sheets | blank light-table sheets | see MOBILE-3D-PLAN Phase 2 (scene owner) |
| D3 Street Gallery window | 12 empty wireframes | 12 framed thumbnails from one 59 KB contact sheet (`gallery-prints-sheet.webp`) |
| D4 Outline | everywhere | footer only |
| D5 Film summary photo | none | restored above the receipt |
| Horizontal overflow, 11 routes | 0 | 0 |

### 9.3 Device QA (docs/DEVICE-QA.md)

D1 every select/input 16 px on coarse pointers · D2 search sheet sized to `visualViewport` · D3 handled natively (see §8) · D4 106 `:hover` selectors moved into `@media (hover:hover)` (scripts/wrap-hover.mjs) · D5 Safari focus return via last pressed control · D6 `touch-action:manipulation` · D7 dialogs focus themselves unless `[autofocus]` · D8 `overscroll-behavior:contain` on dialogs · D9 `:active` states + no grey tap flash · D10 `svh` for stage/overlay/checkout heights · D11 unchanged (intentional) · D12 cart count weight 500.
