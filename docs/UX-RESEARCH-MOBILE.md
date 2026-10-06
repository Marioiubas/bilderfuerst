# UX research · Mobile fixes (Direction C "Analog Technology")

Stand: 2026-10-06. Companion to [DESIGN-SYSTEM-V2.md](DESIGN-SYSTEM-V2.md) and [INSPIRATION-RESEARCH.md](INSPIRATION-RESEARCH.md). Purpose: evidence-based, implementable specs for the external audit findings H1–H3, M1–M6, P1–P5 and the "other observations". Nothing here changes code; the Fix column names the tokens/classes to touch.

**Evidence tags.** `[P]` primary spec/guideline page fetched · `[R]` NN/g or Baymard free article fetched (Baymard's paid guideline bodies are not readable, only their free articles/summaries) · `[S]` search-result excerpt only, page itself not machine-readable (Apple HIG body, Material 3) · `[M]` measured by me on the live site or a competitor, 2026-10-06, Chromium emulation 390x844 (no touch emulation, no real phone) · `[A]` design assumption/judgement, not from a source. Paraphrased throughout; short quotes only where wording is the evidence.

**Limits that matter.** (1) Like the audit, my measurements are Chromium width emulation: `(hover:none)`/`(pointer:coarse)` do not match there, so touch-only CSS looks absent when it is not (see P-obs "Lupe"). (2) 844 px is the full device height; Safari/Chrome toolbars leave less (the *small viewport*, `svh`). I could not find a primary source for exact toolbar heights, so budgets below are set against **640 px from the top of the page** `[A]` (roughly an iPhone-class Safari window with toolbars) and also checked at 844. (3) Baymard conversion statistics quoted by vendors (e.g. sticky add-to-cart lifts) are not primary evidence; treat as hypotheses to A/B on this shop.

---

## 0 · Target numbers (one table, used everywhere below)

| Topic | Hard floor | Target on this site | Evidence |
|---|---|---|---|
| Tap target, **primary/frequent** controls | 24x24 CSS px + spacing (WCAG AA) | **44x44 px**; primary CTAs 48 px (already `.btn`); text links that are *standalone* count as controls | WCAG 2.5.8 `[P]` w3.org/WAI/WCAG22/Understanding/target-size-minimum.html · 2.5.5 (AAA 44x44) `[P]` .../target-size-enhanced.html · Apple 44x44 pt `[P]` developer.apple.com/design/tips/ + HIG button hit region `[S]` · Material 48 dp, 8 dp apart `[S]` m3.material.io/foundations/designing/structure · web.dev 48 px / 8 px `[P]` web.dev/articles/accessible-tap-targets · NN/g about 1 cm, bigger for primary CTA `[R]` nngroup.com/articles/touch-target-size/ |
| Gap between adjacent targets | 24 px circle must not overlap (2.5.8 spacing exception) | >= 8 px between 44 px targets; chip rows 8 px row gap | WCAG 2.5.8, Material, web.dev |
| Informational text | 12 px | mono 12 px (uppercase, tracking .05-.06em); sans 14-16 px; price 16-17 px | Lighthouse legacy audit: 60 % of text >= 12 px `[P]` developer.chrome.com/docs/lighthouse/seo/font-size (discontinued in Lighthouse 13) · Apple min 11 pt `[P]` · NN/g body 14-16 px `[S]` · WCAG sets **no** minimum size, only 200 % resize `[P]` .../resize-text.html |
| Form-control text | 16 px | 16 px for `input/select/textarea` | iOS Safari zooms the page on focus below 16 px `[S]` css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/ (verify on device; never fix with `maximum-scale`, that breaks 1.4.4) |
| Decorative edge print, frame numbers, index "01" | 8 px | may stay 8-10 px if `aria-hidden`, duplicated elsewhere at >= 12 px, not interactive; <= 10 % of text nodes per viewport | `[A]` (see section 4) |
| Shop first screen | - | row 1 of the grid shows **name + price + availability** with its price bottom <= 640 px (and <= 844); chrome above first card <= 250-300 px | Baymard #452 price is essential in lists `[R]` · NN/g listing guidance `[R]` · competitors fail it (section 1) `[M]` |
| Sticky chrome budget | - | top sticky layers <= 20 % of 640 px (~128 px); top + bottom dock <= 27 % (~172 px) | NN/g sticky headers: minimise height, opaque `[R]` `[A]` for the % |
| Bottom dock | - | 56 px + `env(safe-area-inset-bottom)`, one price, one action | Smashing sticky menus: compact, 44-48 px targets `[R]`; NN/g floating/persistent action `[R]` |
| Anchor offset | - | `scroll-margin-top` = (all sticky layers) + 16 px; `scroll-padding-bottom` = dock height | MDN `[P]` developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top · WCAG 2.4.11 `[P]` .../focus-not-obscured-minimum.html |
| Viewport units | - | first-screen heroes `svh`; fixed sheets `max-height: min(88svh, ...)`; full-screen dialogs `100dvh` (existing); never bare `vh` | MDN length `[P]` · web.dev/blog/viewport-units `[P]` (the two sources lean differently: MDN calls `svh` the safe default, web.dev uses `dvh` for full-height bars; both agree `vh` is the trap) |
| Source image for primary product view | - | >= 1000x1000 px (>= 1500 for lightbox); today's smallest is 300x300 | web.dev responsive images: pixels = CSS width x DPR `[S]`; Baymard: fetch higher-res on zoom `[R]` |
| Page length | - | home <= ~10,500 px, digitization <= ~9,000 px, shop initial render <= ~9,000 px at 390 | `[A]` = -35 % from measured 16,267 / 13,566 / 19,046 px |

---

## 1 · H1 + "Mobile shop entrance pattern" (/shop at 390)

**Finding.** First screen is banner, title, 10 categories, search, sort, filter, then products.
**Baseline `[M]` /shop at 390x844:** demo bar 30 + header 60 + montage ~95 + eyebrow/H1/count/link ~150 + 3 chip rows (36 px each, 372-480) + search 327x40 (498) + sort 148x40 / Filter 86x38 (549) -> first card top **602**, card 179x313, title at 808, **price below 844**. Page 19,046 px (107 cards, all rendered).

**What competitors do on a phone `[M]`** (cookie banners declined; nothing submitted):

| Site | Chrome before products | First name / price | Controls | Page height |
|---|---|---|---|---|
| Analogue Wonderland film listing | app-install banner + promo bar + header + H1 + clamped intro ("View more") | card top 658; name 814 (bottom edge); **price 870 = below the fold** | one row: Filter (65x48), Sort, grid/list toggle; 15 px text | 8,660 |
| Fotoimpex films | phone bar, header, search, breadcrumb | single column, name 752, price ~810 | Filters/Sort buttons **56x23 / 57x23** (too small) | **37,450** |
| Lomography EU film | banner + logo + nav + breadcrumb + H1 + paragraph | 2-col, name 564 (3 bold lines), price 827 (12.6 px) | **no filters on first screen**; card pitch ~470 px | 18,243 |
| Bilderfürst today | see baseline | name 808, price below fold | chips 36 px, filter 38 px | 19,046 |

Reading: even the category's best-known analog shop pushes price off the first screen; the product-first target below is stricter than any competitor and is a differentiator. The one pattern worth copying is Analogue Wonderland's single **Filter / Sort row, 48 px high** with a text label.

**Evidence for the pattern.**
- Baymard: show title, price and category-specific attributes in the list item; price "essential" on desktop and mobile (guideline 452) `[R]` baymard.com/guidelines/452-price-clarity-in-product-lists-and-search-results · baymard.com/research-articles/product-listing-information (titles should not run past 3-4 lines on mobile).
- Baymard PLP: mobile filters in a drawer opened by a fixed **Filter** button; show applied filters; return users to their list position `[R]` baymard.com/blog/product-listing-page-plp-ux · mobile filtering benchmark: back-and-forth between list and filter UI is the main pain `[R]` baymard.com/mcommerce-usability/benchmark/mobile-page-types/filtering-options.
- NN/g mobile faceted search: text label ("Filter") beats an icon; overlay tray keeps results behind it; result count always visible; update results live `[R]` nngroup.com/articles/mobile-faceted-search/.
- NN/g listing pages: subcategories above the list raise discoverability; show enough to judge an item before the click `[R]` nngroup.com/articles/ecommerce-homepages-listing-pages/.
- NN/g scrollable nav carousels have weak information scent; items must be signalled by an "illusion of continuity" (a clipped next item) and a non-scrolling alternative should exist `[R]` nngroup.com/articles/mobile-navigation-patterns/ · .../mobile-carousels/ `[S]` · .../horizontal-scrolling/ `[R]` (desktop-focused).
- Baymard (mobile homepage): do not hide top-level categories behind a "categories" link `[S]` baymard.com/blog/mobile-homepage-provide-full-scope.

**Recommended pattern (rectangular, mono labels, red = selected/interaction only):**

1. **Compact title row** (<= 56 px): `ANALOG STORE` display at 40 px on the left, `107 PRODUKTE` mono 12 px on the right, baseline-aligned. On <640: hide the montage image (or move it below the grid as an editorial strip), hide the "Quellstand" line (move to footer note), drop `.shop-lab-link` (the "Entwicklung & Scan" chip already routes there). (The review demo bar stays preview-only; the budget counts it.)
2. **Category chips: one horizontally scrolling row**, not a select and not three wrapped rows. Chip = 44 px tall hit area (visual 36 px + 4 px invisible padding via `::before`), label 14 px/560 + count in mono 12 px, 8 px gap, red 2 px underline for the selected one (existing `.shop-tab` language). Order by use: Alle, Filme, Sofortbild, Kameras, Chemie, Labor-Equipment, Entwicklung & Scan, Bücher & Zines, Taschen, Gutscheine. Cues so nothing is hidden: the last visible chip is **clipped by >= 24 px** at 390 (peek), right edge fades via a 24 px gradient (opaque `--white` -> transparent, not a hard cut), `scroll-snap-type: x proximity`, `overscroll-behavior-x: contain`, scrollbar hidden, selected chip auto-scrolled into view on load (`scrollIntoView({inline:'center', block:'nearest', behavior:'auto'})`; `block:'nearest'` so the page does not jump vertically). **Alternative route** so the pattern never hides a category: the same list is the first facet ("Kategorie") in the filter sheet. Why not a `<select>`: hides all options behind a tap, GOV.UK calls selects a last resort `[P]` design-system.service.gov.uk/components/select/, NN/g prefers visible options for few choices `[R]` nngroup.com/articles/drop-down-menus/. Why not wrapped rows: 108 px of chrome for one filter. Note INSPIRATION anti-pattern 6 ("horizontal scroll as primary navigation") is about **site navigation**; a category filter row with peek + alternative route is not that.
3. **Results bar** (52 px, `position: sticky; top: var(--header-h)`, opaque `--white`, 1 px hairline): `[Suchen 44x44 icon] [Sortieren ▾ select, flex 1, 44 px] [Filter · n  44 px]`. One search entry only (header icon or this one, not the 327x40 field plus a header icon as today). **Filter** is a text button with a mono active-count (`FILTER · 2`, count in `--red-ink`), opens the existing `Dialog kind="sheet"`. Active filters show as removable chips in a row under the bar **only when n > 0** (Baymard: 28 % of sites fail to show applied filters `[R]`). The grid/film-index view toggle moves into the sheet on <640 (rarely changed; the toolbar earns its 52 px with search/sort/filter).
4. **Card (2-col, 179 px wide) budget**: image 1:1 contain (179), body: title 2 lines 14.5 px/650 uppercase-condensed (33), spec line mono 12 px `135 · C-41 · ISO 400` (16), price row = price 17 px/700 left, availability mono 12 px with filled/outlined square right (24); padding 10; **no separate brand line** (title already starts with the brand, e.g. "KODAK / KODAK PORTRA 400 ..."; saves ~21 px). Card ~300 px. Quick-add stays top-right but gets a 44x44 hit area (34 px visual + `::after` inset -5 px). Hover-only edge print stays desktop-only (`@media (hover:hover) and (pointer:fine)`, already so).
5. **Budget check** `[A]` (px from page top): demo 30, header 60 (90), title row 56 (146), chips 44 (190), results bar 52 + 8 gap (250; allow ~270 with 8 px paddings), card row 1: image 179 (429), title + spec + price (~122) -> **price bottom ~ 520-560** (<= 640 at Safari-like, <= 844 certain); cards start at ~250 instead of 602. Row 2 titles appear by ~730 at 844.
6. **List length:** "Mehr laden" instead of 107 cards at once. Batch 24 (12 rows of 2), counter "24 von 107 angezeigt" (mono 12), button 48 px full width, restore batch + scroll on Back. Baymard prefers "Load more" with sensible batches and positional return; infinite scroll is singled out as harmful for search results and on mobile and blocks the footer `[R]` baymard.com/blog/product-listing-page-plp-ux, smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons `[S]`; NN/g: show total, shown, remaining; preserve position after pogo-sticking `[R]` nngroup.com/articles/alternatives-pagination-listing-pages/. Keep `?n=` or `sessionStorage` so filters + batch survive Back; the on-page search must still search all 107, not only rendered ones.

**Pitfalls.** Sticky stack > 128 px (header 60 + bar 52 = 112 is the ceiling; optionally hide the header on scroll-down and show on scroll-up, 300-400 ms slide, NN/g partially persistent header `[R]` nngroup.com/articles/sticky-headers/). Translucent sticky backgrounds (current `.finder-wrap` .96 alpha + blur, `.site-header` .94) let photos bleed through: NN/g asks for opaque, strongly contrasting sticky bars `[R]`; this is also the audit's "pale sticky header" note. Chip row without a clipped next chip reads as "that's all". Selecting a chip must not scroll the page to top (keep results bar in view, announce the new count via `role=status`, WCAG 4.1.3 `[P]` .../status-messages.html). `position: sticky` fails inside any ancestor with `overflow` set. Do not gate size increases behind `pointer: coarse` for the phone layout (see H3).

---

## 2 · H2 · type size and hierarchy

**Finding.** Utility text far smaller than copy: 7 px/8.4 px hero captions, many 10-11 px mono labels.
**Baseline `[M]` at 390:** /shop **768 of 1,024 text elements (75 %) are < 12 px** (8.5 px x 321 `.pcard-edge`/`.status`, 10 px x 274 `.pcard-data`/`.pcard-brand`, 9.5 px x 114 `.pcard-index`/facet counts, 9 px x 54 `.chip`); home 255 of 485 (53 %) incl. 6-8 px contact-sheet captions/frame numbers. Stock ("Auf Lager", 8.5 px) and process chips (9 px) carry decision information. Competitor reference: Medienrettung home has 3 of 240 text elements < 12 px (1.3 %); Analogue Wonderland card text is 15 px; Lomography price 12.6 px `[M]`.

**Rules** (full floor table in section 4):
- **Information must be >= 12 px** (price, stock, format, process, ISO, scan option names and their px, step titles, field `dt`, error/hint text, evidence-photo captions, legal).
- Hierarchy by weight/colour/position, not by shrinking: L1 name 14.5/650 · L2 price 17/700 tabular · L3 availability mono 12 + square marker (filled = available, outlined = ask, per DESIGN-SYSTEM §8) · L4 spec line mono 12 muted `#555c62` (6.5:1).
- Tokens: at `max-width:767px` set `--fs-mono-s: 12px; --fs-mono: 12px;` tracking `--track-mono` .08em -> .06em (mono at 12 px is ~7.9 px/char with tracking, 20 chars fit a 159 px card line: keep the spec line <= 20 chars, e.g. `135 · C-41 · ISO 400`, wrap don't ellipsise). `.chip` 22 -> 24 px tall, 12 px text. Facet/tab counts 12 px.
- Scan options in the configurator: option name 15/620, delta `+4,00 €` 14/700 right-aligned tabular, px spec mono 12 muted, "EMPFOHLEN" outline chip 12 mono (not red: red stays interaction).
- Form controls 16 px (search input and selects are 14 px today `[M]`: iOS zoom on focus).
- Pitfalls: all-caps + wide tracking at 12 px costs width, not legibility, if tracking <= .06em; do not "fix" by `zoom`/transform scale (WCAG 1.4.4 only needs 200 % resize to work `[P]`). Text inside scaled stages (hero sheet) has a computed size unrelated to the rendered size; check the rendered box, not `font-size`.

---

## 3 · H3 · tap targets

**Measured `[M]` (390 px) and fix:**

| Control | Now | Fix (class) |
|---|---|---|
| Header search button | 33x38 | 44x44 like cart/menu (`.icon-btn`) |
| `.shop-lab-link` "Belichteten Film ..." | 240x26 | remove on mobile (see H1) or `min-height:44px;display:inline-flex;align-items:center` |
| Hero text link "Alte Medien digitalisieren" | 188x26 | same 44 px min-height (stand-alone link = control, not inline-in-text) |
| History "Zur Übersicht" | 88x26 | 44 px |
| Search overlay "Alle Treffer im Shop →" | 142x13 | full-width 48 px footer row |
| `.shop-tab` chips | 36 high, 0 row gap | 44 hit area, 8 px gap (section 1) |
| `.view-toggle` button / sort / filter | 38 | 44 (`.shop-filter-btn`, `.shop-sort .select` min-height 44) |
| Film-index sort buttons (`thead button`) | ~16 high | make the whole `th` the button: `min-height:44px;width:100%;padding-inline:8px` |
| Filter sheet radio rows (`.spec .facet-option`) | 358x32 | `min-height:48px`, full-row label hit area, 16 px control box |
| Card quick-add | 34x34 | 44x44 hit (`::after{inset:-5px}`) |
| Hero toggle | 164x40 | 44 |
| PDP qty stepper buttons | 42x46 | 44x46 minimum (widen by 2 px) |
| Active filter chips | 28 high | keep 28 visible, 44 hit via `::before`, 8 px gap (passes 2.5.8) |

**Method.** Targets under 44 px are acceptable only when (a) >= 24 px and (b) their 24 px circles do not overlap neighbours (2.5.8 spacing exception `[P]`), and never for primary/frequent controls. Enlarge hit area without enlarging the look with `min-height` + padding or a pseudo-element (web.dev technique `[P]`). Inline links inside sentences are exempt (2.5.8 inline exception).
**Pitfalls.** web.dev suggests enlarging only under `any-pointer: coarse`; **do not** gate the phone layout that way: Chromium width emulation (the audit's and CI's likely method) and many hybrids would not show it. Use width breakpoints for <= 767 and add `@media (pointer:coarse)` for tablets/hybrids >= 768. Adjacent enlarged targets must not overlap (extend on the free side). Dense thumbs-first rows (chips, steppers) need >= 8 px gaps (Material/web.dev).

---

## 4 · "Typography floor" (what may stay < 12 px)

| Class | Examples in code | Min | Condition |
|---|---|---|---|
| **Information** | price, `.status`, `.chip` (process), ISO/format line, `.facet-count`, scan option px, `dz-prices-note`, `dz-plate-sm figcaption` (9 px), `.fc-optional`, form labels, `dt` ledgers, `.pdp-lens-hint`, `.contact-cap .mono` | **12 px** | no exceptions |
| **Chrome labels that name a control** | `.eyebrow`, section code lines (`STR/LAB/SCN`), `.finder-title`, footer-bottom | **11 px** (12 preferred) | only if the control's own accessible name is separate |
| **Decorative print** | `.pcard-index` "01", `.pcard-edge` (hover only), contact-sheet frame numbers (`hero-frame-no`, "12A"), sprocket codes, `.hist-archive-edge`, `.dz-diagram .lbl` inside SVG, `.hero-table-tag` | **8 px** | `aria-hidden="true"` or `role="presentation"`; the same fact exists elsewhere at >= 12 px; not clickable; contrast still >= 4.5:1 if it is text; <= 10 % of text nodes in a viewport; `.pcard-edge` only on `(hover:hover) and (pointer:fine)` |
| **Keyboard hints** | `kbd ⌘K`, "ESC" | hide on touch | `@media (hover:none){display:none}` |

Targets by route at 390 `[A]`: information < 12 px = **0**; total < 12 px <= 10 % (today /shop 75 %, home 53 %). Hero contact sheet on mobile: the *sheet title* ("KONTAKTBOGEN · 135 · NR. 12-19") becomes one 12 px line under the sheet; frame numbers stay decorative (>= 8 px, aria-hidden); a tap on a frame opens the enlarged view (loupe metaphor). Alternative the audit names (two-column larger sheet) is fine if frames then render >= 150 px wide.

---

## 5 · M1 · product image resolution (Portra 160 120 = 300x300)

**Evidence.** Baymard: ~14 % of shops show grainy product images and ~11 % allow too little zoom; mobile may start with lighter images but **zooming must fetch a higher-resolution version**; shoppers read poor imagery as "they don't care" `[R]` baymard.com/blog/ensure-sufficient-image-resolution-and-zoom. Physical pixels = CSS width x device pixel ratio `[S]` web.dev/articles/responsive-images.
**Measured `[M]`.** PDP stage on a phone is ~292-358 CSS px wide -> **876-1,074 device px at 3x**. Files in `public/images` (304 webp, incl. a few non-product site images): 4 product images are **300 px** (`kodak-portra-160-120-rollfilm`, `kodak-gold-200-135-36-film` 300x253, `kodak-colorplus-200-135-36-film`, `ilford-sfx-200-135-36-infrarotfilm`), 35 are 400-599 px, 81 are 600-999 px, 184 are >= 1000 px (and `kodak-portra-160-kleinbild-35mm` is 1080x1080, so a same-brand source exists). `kodak-portra-400-135-36-film` is 750 px.
**Spec.** Do not invent or AI-upscale (DESIGN-SYSTEM §9: business photography is evidence). (1) Request from the owner/distributor a >= 1000x1000 neutral-background packshot for every product < 600 px, starting with the four 300 px items (two are first-page cards). (2) Until delivered, cap the displayed size at the intrinsic size: set `width`/`height` attributes to the intrinsic size and use `width:auto;max-width:100%` inside the letterboxed stage, and **disable the lightbox zoom** for files < 600 px (show the stage image only; no 2x enlargement that makes it softer). (3) Add `sizes="(max-width:767px) 100vw, 50vw"` and a `srcset` ladder 480/750/1080 for files that have them. Pitfall: `object-fit: contain` on the stage with `mix-blend-mode:multiply` hides low-res edges on the grid card but not on the PDP.

---

## 6 · M2 + "Long service pages"

**Baseline `[M]`:** home 16,267 px (19 screens at 844), digitization 13,566 (chooser section 3,149 px, estimator starts **5,317 px after** the chooser), history 8,786, configurator 6,368, shop 19,046. Competitor lab prices page: Carmencita 13,155 px with 23 tables and no jump nav; Medienrettung home 18,506 px `[M]` - long service pages are normal, unannounced length is the problem.

**Evidence.**
- NN/g table of contents: for long pages give an overview + quick access; on small screens move it into the body, make it collapsible or sticky-collapsed, **but testing showed users often miss sticky collapsible TOCs on mobile**; keep link text identical to section headings; use real link styling `[R]` nngroup.com/articles/table-of-contents/.
- NN/g accordions on mobile: help against long pages and act as mini-IA, but expanding content can scroll to the top and disorient (users press Back); fixes: sticky headers, no auto-scroll on expand, plain language `[R]` nngroup.com/articles/mobile-accordions/.
- NN/g back-to-top: for pages > ~4 screens, one persistent labelled button, bottom right, shown after scroll-down + scroll-up gesture `[R]` nngroup.com/articles/back-to-top/.
- Anchor offsets: `scroll-margin-top` on targets / `scroll-padding-top` on the scroller `[P]` MDN; WCAG 2.4.11 lists scroll-padding as the technique that keeps focus from being hidden under sticky bars `[P]`.

**Pattern (compatible with the zone/section grammar):**
1. **In-body jump index at the top** (not sticky): 4-7 anchors as mono labels with numbers matching the existing section codes (`01 FORMATE · 02 PREISE · 03 ABLAUF`), wrapped in a 2-column grid of 44 px rectangular links with hairlines, link text = exact `h2` text. This is the "service index" the audit asks for. Home: use the chapter numbers `01 / LABOR ... 09 / LADEN` as the index (INSPIRATION §2.1 chapter grammar; 7-9 items = 2 columns, ~4-5 rows, ~190-240 px).
2. **No sticky local nav bar on phones** (cost: chrome; risk: missed per NN/g). Instead one **dock link** on task pages (digitization: "Schätzung" once an object is chosen, see section 8).
3. **Rhythm:** mobile `--section` from `clamp(72px,9vw,144px)` (72 px floor) to **48 px** at <= 767 and `--s-7` 48 px inside sections -> about -430 px on the home page from padding alone (9 section boundaries x 48 px); the rest of the ~5,700 px needed for the target must come from content cuts, fewer repeated large headers (P1) and collapsed secondary content `[A]`. One display-size heading per screen (see P1). Secondary content (FAQ, "Hintergrund", legal-ish notes) in `<details>` with a 44 px summary, label never changes between states (APG disclosure uses `aria-expanded` and an icon, not a label swap `[P]` w3.org/WAI/ARIA/apg/patterns/disclosure/), sticky summary not needed below 2 screens.
4. **Back to top**: one 44 px "Nach oben" mono button bottom right (above the dock if any), appearing after > 4 screens when the user scrolls up.
5. Anchor mechanics: define `--sticky-top` per page (`--header-h` + local sticky layers) and set `scroll-margin-top: calc(var(--sticky-top) + 16px)` on every anchor target; keep the global `html{scroll-padding-top}` (today `--header-h + 24px` = 84 px) for pages without a local sticky bar.
**Targets** `[A]`: home <= 10,500 px, digitization <= 9,000 px; every anchor reachable from the index; no section > 1.5 screens without a sub-anchor or a collapsed part.
**Pitfalls.** An index that only repeats the nav; index labels that differ from headings (NN/g); smooth scroll + sticky heights computed before fonts load (use CSS variables, not JS pixel values); `details` that hold the primary price/CTA; a back-to-top that overlaps the dock.

---

## 7 · M3 · search results rows

**Baseline `[M]`** (search overlay, query "portra", 390 px): row 374x63; line 2 is one nowrap mono line `KODAK · 120 · C-41 · ISO 160 · 16,50 …` **ellipsised so the price is cut off**; stock is not shown; a right-hand `C41·120` chip repeats part of line 2; 5 of 6 film rows showed empty grey thumbnail boxes at capture time (lazy loading?); footer link "Alle Treffer im Shop →" 142x13.
**Evidence.** Price is an essential list-item attribute and missing/obscured price makes users drop items `[R]` Baymard 452 + list-item-info article (titles <= 3-4 lines on mobile; styling secondary details subtly); default autocomplete elements are image, title, price `[S]` baymard.com/mcommerce-usability/benchmark/mobile-page-types/search-autocomplete.
**Spec (row, 56 px thumb + text, min-height 64, tap area full row):**
- Line 1: title 15/650, up to **2 lines**, ellipsis only on line 2.
- Line 2: **price 16/700 (tabular) left, availability right** (mono 12, filled/outlined square) - never inside a truncated string.
- Line 3: spec string mono 12 muted, **wraps** (max 2 lines): `KODAK · 135 · C-41 · ISO 400`. Drop the duplicate right-hand chip < 480 px.
- Reserve the thumb box (56x56, `aspect-ratio`, `loading="eager"` for the first 6 rows) so grey placeholders do not read as missing; if no image, show the format glyph (`fg-` family), not an empty box.
- Hint row (`⌘K`, `ESC`, "ENTER") only on `(hover:hover) and (pointer:fine)`; footer "Alle Treffer im Shop" becomes a 48 px full-width button.
- Label: button/`aria-label` **"Suchen"** (or "Shop durchsuchen"), placeholder "Film, Marke oder ISO suchen"; keep "Archiv-Index" only as the mono eyebrow. NN/g: plain text labels beat clever/cryptic ones `[R]` mobile-faceted-search. Input 16 px.
**Pitfalls.** `white-space:nowrap` on the same line as the price; truncating by character count (German product names run long); relying on hover to show price; results list scroll under the on-screen keyboard (keep list `max-height: calc(100svh - header - input - keyboard)`; use `interactive-widget=resizes-content` via the Next `viewport` export, `interactiveWidget` is in this Next 16 type `[M]` `extra-types.d.ts`).

---

## 8 · M4 + P4 + "Configurator summary dock" (/filmentwicklung)

**Baseline `[M]` 390x844:** hero 434 px (eyebrow + 2-line H1 incl. outline line + 4-line lead + 3-row facts), mode switch bar 84 px, **sticky filmstrip dock 126 px at y=657**, step head at 795, **first format card top at 924 (80 px below the 844 fold; ~280 px below a 644 px window)**. When the strip is sticky: header 60 + strip 126 = **186 px (22 % of 844, 29 % of 640)**. The receipt/ticket (`.fc-side`) starts at **y = 3,562**, after all steps; `.fc-ticket-dock` is sticky only at >= 1024 px and min-height 860. Copy says "Fünf Schritte"/"5 SCHRITTE" (hard-coded in `film-configurator.tsx` lines 153, 168) but the receipt lists a numbered sixth entry.
**Competitor `[M]`.** The Darkroom mobile order page (`thedarkroom.com/shop/product/film-developing/`): H1, one-line hint, then three numbered steps each a 64 px select - the first control is at y = 297 and all three steps are on the first screen; page 2,818 px; **no sticky bar; "Total $0.00" sits at the very bottom**, shown as 0 before any choice. ON FILM LAB is reported (page text only, not verified visually) to keep a fixed "Warenkorb Gesamt ... inkl. 19 % USt." summary. Carmencita keeps price matrices as small 3-column tables that fit 390 px without horizontal scroll (16 px cells, 45 px rows) `[M]`.

**Evidence for a dock.** NN/g: floating/persistent element suits the single most important action; keep full-width bars compact; accessible tap size; Smashing: on mobile forms the virtual keyboard takes roughly 60 % of the screen, so do not keep sticky bars up while it is open `[R]` smashingmagazine.com/2023/05/sticky-menus-ux-guidelines/; NN/g: sticky bars cost screen real estate everywhere, keep them opaque and minimal `[R]` nngroup.com/articles/sticky-headers/. NN/g bottom sheets: always include a visible Close button, support Back, no stacking `[R]` nngroup.com/articles/bottom-sheet/; accidental overlay dismissal: keep user progress `[R]` .../accidental-overlay-dismissal/. WCAG 2.4.11 (don't hide focused element) `[P]`, 4.1.3 status messages (announce price changes politely) `[P]`. Thumb reach: bottom area is the easy zone `[S]` smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users.

**Spec A · shorter start (M4).**
1. Mobile intro <= 300 px: eyebrow (12 px), H1 **one** display block `FILM ENTWICKELN` at `clamp(40px,11vw,48px)` (the outline second line moves to >= 768, see P1), lead <= 2 lines (move the equipment sentence to a `<details>` "Wie arbeitet das Labor?"), facts as one mono line `AB 7,00 € JE FILM · 35MM · 120 · 110`, "Bearbeitungszeit: bitte im Laden erfragen" folded into the first-step help.
2. Mode switch (Einsteiger/Experte) leaves the first screen: after step 1 as a 44 px text toggle "Expertenmodus" (a switch: constant label + `aria-checked`, APG switch `[P]` .../patterns/switch/), or a link inside the lead.
3. **Progress row replaces the sticky filmstrip on phones**: 48 px, `SCHRITT 2 VON 5 · PROZESS` mono 12 + five 2-px segments (amber = done, red-glow = current), tapping opens a step list sheet; the filmstrip artwork stays >= 768 px. Sticky chrome 60 + 48 = **108 px (17 % of 640)**. Update `--strip-h` mobile 122 -> 48 so `.fc-step{scroll-margin-top}` follows; keep `@media (max-height:700px){.fc-strip-dock{position:static}}` (today 620).
4. **Target:** first selectable format card fully visible with top <= 400 px at 390 (Darkroom ≈ 300), step options 149-169 px tall cards stay (touch rows >= 44), first card's price/hint visible.
5. **P4 step count:** derive "N Schritte" from the same `STEPS.length` that drives the strip and receipt. Either the sixth item is a real step (copy: "6 Schritte, der letzte optional", numbered "06 · OPTIONAL" with `.fc-optional`) or it is not numbered (receipt line "Notiz zum Auftrag", unnumbered, outside the strip). Recommended: **5 numbered required steps + unnumbered "Prüfen & Notiz" block**; progress UI and receipt must agree (NN/g/Baymard checkout consistency, `[A]`).

**Spec B · summary dock (once a valid price exists).**
- **Show only when** every required step so far is valid and a price > 0 exists. Before that: no dock (no "0,00 €" - the Darkroom pattern misleads), the progress row alone carries state.
- **Anatomy** (fixed bottom, 56 px + `env(safe-area-inset-bottom)`, opaque `--graphite-900` in this dark zone, 1 px `--line-dark-strong` top border, radius 0, no shadow): left half is a 44+ px button "ÜBERSICHT" (mono 12, muted) over the **price 20/700 tabular** `23,50 €` and `inkl. MwSt. · 1 Film` (12); right half primary CTA 48 px red/white: **"In den Warenkorb"** when valid, else **"Weiter: Scan"** (jumps to the next incomplete step with `scroll-margin`). Tapping the left half opens the receipt in a bottom sheet (`Dialog kind="sheet"`, existing) with the lines, deltas, notes, Close button, same CTA.
- **Behaviour:** appears with the shutter easing in <= 180 ms (fast token), no bounce; hides while a text field has focus or `visualViewport.height < 0.75 x innerHeight` (keyboard), while any dialog is open, and when the inline receipt (`.fc-side`) is on screen (IntersectionObserver) to avoid two totals. Page gets `padding-bottom` = dock height; `html{scroll-padding-bottom: var(--dock-h)}` so focused fields are not covered (2.4.11). Single `aria-live="polite"` region on the price, debounced ~600 ms, so screen readers hear the total once. Z-index between `--z-sticky` and `--z-header`; do not use `100vh`.
- **Budget:** top 60 + 48 plus dock 56 = 164 px = **26 % of 640** while a price exists. If that is too heavy on short phones, `@media (max-height:700px)` makes the progress row static (dock stays).
- **Same dock for digitization:** label `SCHÄTZUNG`, value `ab 120 €`, action "Zur Berechnung" (anchor to `#schaetzung` with offset) after the first object is chosen (section 9).
- **Pitfalls.** `viewport-fit=cover` is needed for non-zero `env(safe-area-inset-*)` (MDN env `[P]`); `app/layout.tsx` exports `viewport` without it today, so `.filter-sheet-foot`'s `env()` is a harmless no-op; enable `viewportFit:'cover'` only if top/side insets are also handled (header padding, `.wrap` gutters). Two bottom layers (dock + toast + cookie) stacking; dock hiding the "Auftrag senden" focus target; announcing every keystroke-driven price update; red used for anything but the CTA.

---

## 9 · M5 · digitization chooser, estimate, select names

**Baseline `[M]`:** `#was-hast-du` 3,149 px tall (7 tiles, 178x~229 each in 2 columns, last full width) starting at y=1,070; `#schaetzung` at 6,387; the one `<select>` ("Kleinbild, gerahmt im Magazin", <= 29 chars) at 6,832, 316 px wide, **14 px text**.
**Evidence.** NN/g mobile accordions/mini-IA: reveal detail where the choice is, avoid jumping the user, offer sticky headers `[R]`; NN/g TOC: users miss content far down `[R]`; GOV.UK: selects are a last resort, hard to scroll/close `[P]`; NN/g: radios for few options, native pickers on mobile, labels disappear when a dropdown opens `[R]` nngroup.com/articles/drop-down-menus/.
**Spec.**
1. **Selection -> detail adjacent.** Tapping a tile marks it (red 2 px frame, `aria-pressed`) and opens the detail panel **inline directly below the tile's row** (`grid-column:1/-1` inserted after the row's last tile; or a bottom sheet "DIA-MAGAZIN · Details" with Close), not after the 7-tile grid. Scroll the panel into view with `scroll-margin-top = header + 16` **only if it is not already visible** (NN/g: do not auto-scroll to the top on expand).
2. **Estimate reachable:** after the first valid choice show the **dock** (section 8): `SCHÄTZUNG ab 120 € · Zur Berechnung`. Optionally render a compact live line inside the detail panel (`Anzahl x Preis = Summe`) so the user does not need to leave the object they chose.
3. **Recognition guide is a path, not a prerequisite:** link "Nicht sicher? Format erkennen" as a 44 px row under the tile grid that opens the guide in a sheet (or a collapsed `<details>` placed **after** the estimate), so it stops adding 1,000+ px between choice and price.
4. **Select options:** keep the visible label <= 28 characters at 16 px in a full-width (358 px) control (~38 chars fit; 28 leaves margin for German compounds); move qualifiers to helper text under the control or an `optgroup`; if <= 6 options use radio cards (44-48 px rows, price delta right) instead of a select. Set `font-size:16px` on every select/input.
**Pitfalls.** Detail panel inserted above the tapped tile (layout jump under the finger); `scrollIntoView` that hides the tile; two different "estimate" places; a `<select>` whose option names differ from the tile names for the same thing.

---

## 10 · M6 · gallery model/sample wall repetition

`[A]` editorial + honesty, no external study needed. UX consequences on a phone: a repeated motif reads as placeholder content and weakens the "evidence, not decoration" rule (DESIGN-SYSTEM §9). Spec: <= 1 occurrence of the same photographic motif per viewport and per section; every sample carries the one caption grammar `© NAME · ORT · JAHR · KAMERA · FILM` (Magnum model, INSPIRATION §2.0 #15) at 12 px mono; provenance chip (`MUSTER`, `BEISPIEL`, `STUDIO-MOTIV`) wherever an image is a stand-in; give the developer comparison its own lab context (developer strip, tank, negative, not the Porsche frame); keep the honesty notes (12 px, not footnote-sized). Tapping a print opens the lightbox (no hover-zoom on touch).

---

## 11 · P1-P5

**P1 heading rhythm.** `[A]` + NN/g hierarchy principle. Heavy uppercase + outlined second line = **one per page, the H1/entrance only** (home hero, lab, digitization, gallery, history keep it at their top). Supporting sections: solid `h2` (`--fs-h2` clamp(32px,4.2vw,60px) -> 28-32 px on phone, one line where possible, no `.outline-type`), then `h3` sentence case. Outline at <= 40 px has a 1.5 px stroke that thins on phones: on <= 767 render the second line **solid silver-300** (dark zones) instead of outline, or keep outline only >= 48 px. At most one display-weight heading per 844 px of scroll.
**P2 desktop mega menu at 1280.** `[A]`: 1280x800 is a standard laptop; test at 1280 and 1366. Atomic labels never wrap: `white-space:nowrap` on top-level items (`Film entwickeln`) and on `.chip`/badge text (`E-6 ...` must not break inside); shrink `gap`/padding first (`clamp`), then switch to the compact (icon/short-label) layout below 1360 rather than wrap; use `min-width: max-content` columns with `grid-template-columns: repeat(auto-fit, minmax(max-content, 1fr))`.
**P3 hero toggle label.** APG: for a toggle button, "it is critical" the label does not change when state changes; if the text must change, it is not a toggle (no `aria-pressed`) `[P]` w3.org/WAI/ARIA/apg/patterns/button/ and /switch/; NN/g: labels must say what happens, not be neutral/ambiguous `[R]` nngroup.com/articles/toggle-switch-guidelines/. The current button is `aria-pressed={sheet}` with constant "Im Raster ansehen" - correct for AT but it shows the *action* even after it was taken. **Recommended: two-state segmented control** `[ Negativ | Kontaktbogen ]`, two buttons with constant labels, `aria-pressed` on the active one (or `role=radiogroup`), active segment gets the red 2 px bottom line + `--paper`/graphite fill (visible state, 44 px high), existing `role=status` announcement kept. Alternative: plain command button without `aria-pressed` whose label is the next action ("Als Kontaktbogen ansehen" / "Als Negativ ansehen"). Never combine a changing label with `aria-pressed`.
**P5 history sticky stack + anchors.** **Baseline `[M]` 390:** header 60; `.hist-hud` sticky `top:56px` (**4 px overlap**), height 52 -> stack bottom at **108 px**; `html{scroll-padding-top}` is **84 px**; `.hist-frame{scroll-margin-top:0}`; jump targets `#kapitel-1935` etc. So a chapter's small label (it sits ~23 px above its frame box) lands under the bar. "Zur Übersicht" is 88x26.
**Spec:** `.hist-hud{top:var(--header-h)}`; define `--sticky-top: calc(var(--header-h) + var(--hud-h))` (60 + 52 = 112) on `.hist-chronicle`; `.hist-frame{scroll-margin-top: calc(var(--sticky-top) + 16px)}` (= 128 px) and include the label's offset (apply the margin to the label wrapper or `padding-top:24px` on the frame so the label is the first thing under the bar); keep `scroll-padding-top` for hash loads. Test: click each chapter link, assert `label.getBoundingClientRect().top >= hud.bottom`. Pitfall: if the header hides on scroll-down, the always-present layer is only the hud (use the smaller offset in that mode or keep the header fixed on this page).

---

## 12 · Other observations

- **Pale sticky header.** Opaque, strongly contrasting sticky bars (NN/g `[R]`): header `background: var(--white)` (light zones) / `var(--black)` (dark), keep the hairline; drop `backdrop-filter` on phones (cheaper too).
- **Hero contact sheet captions** -> section 4 (decorative vs informational).
- **PDP at 390 `[M]`** (/p/kodak-portra-400-135-36-film): breadcrumb, stage 308 px, price y=598, stock 662, qty stepper row 694 (42x46 buttons), CTA 751-799 (48), "Im bestehenden Shop kaufen" 813-861 (48): **CTA bottom 799 is below a 640-px window**. NN/g: name, image, price, availability, add-to-cart straightforward `[R]` nngroup.com/articles/ecommerce-product-pages/. Spec: qty stepper (132 px) and CTA on **one row** (CTA flex 1, 48 px) -> saves ~58 px; the real-shop link becomes a text-link row (44 px) after the spec ledger, or a secondary button below; breadcrumb collapses to "‹ Filme" on <640 (44 px back link, saves ~20 px). If CTA bottom still > 640, add a **sticky buy bar** (thumb 40, price, CTA 48, 56 px) shown when the inline CTA leaves the viewport (IntersectionObserver), same keyboard/dialog rules as the dock; vendor lifts for this pattern are unverified `[S]`, A/B it.
- **Pentax description density.** Chunk (NN/g scanning principle `[A]`): "Auf einen Blick" spec ledger (`dl`, mono 12 `dt`, 5-6 rows: Sensor/Format, Objektiv, Film, Halbformat, Maße, Preis), then 2-3 paragraphs of <= 60 words with `h3` ("Was die Kamera kann", "Film und Entwicklung", "Gut zu wissen"), source facts unchanged, "Quelle" line 12 px.
- **Touch wording ("Lupe: Maus über das Foto").** CSS already hides `.hm-cap-hint` on `(hover:none)` and `.pdp-lens-hint` on `(hover:none),(pointer:coarse)`; the audit saw it because Chromium width emulation reports a mouse (`hover:hover`) `[M]`. Still make the default **touch-first, neutral** and add mouse wording only where a fine pointer exists: two spans, `.hint-touch` ("Foto antippen für Lupe") visible by default, `.hint-mouse` ("Lupe: Maus über das Foto") shown only under `@media (hover:hover) and (pointer:fine)`. Hybrids report only the *primary* input (MDN `[P]`), so hide nothing critical behind either query; tap/click must always work. Pure CSS (no `navigator.maxTouchPoints` at render: hydration mismatch in Next).
- **"Archiv durchsuchen"** -> section 7 (label "Suchen").
- **History desktop entrance.** First viewport at 1440x900 should include at least one archive photo above the fold (title block <= 40 % of height) `[A]`; mobile is covered by P1/P5.
- **Film-index sort controls, filter-sheet rows** -> section 3.
- **Partially revealed content during transitions.** NN/g response times: 0.1 s feels instantaneous, 1 s keeps flow `[R]` nngroup.com/articles/response-times-3-important-limits/. Rule: controls (search, filter, chips, CTA, toggle) are in their final state **at first paint** (no opacity-0 entrance, no `IntersectionObserver` reveal on controls); decorative reveals <= 180 ms fast token; sticky-header slide 300-400 ms only for partial persistence; `prefers-reduced-motion` = no reveal. Capture tests must wait for `networkidle` + 400 ms and assert opacity 1 on `button, a, input`.

---

## 13 · Acceptance checks (automatable)

Viewports 360x640, 390x664, 390x844, 430x932 with **touch emulation on** (`hasTouch`, `isMobile`, DPR 3) and also off. 1) Tap audit: every visible `a, button, input, select, summary, [role=button]` outside inline text: `min(w,h) >= 24` fail; `< 44` fail for items tagged primary/frequent (search, cart, menu, chips, filter, sort, steppers, CTAs, toggles, sheet rows). 2) Text audit: no visible text node < 12 px unless `aria-hidden` ancestor; share < 12 px <= 10 %. 3) First screen: `.pcard-price` of card 1 has `bottom <= 640` on /shop. 4) Configurator: first `.fc-format` top <= 400; sticky stack <= 108; dock shown only with price > 0. 5) Anchors: after clicking each in-page link, target heading `top >= bottom of last sticky layer`. 6) Inputs `font-size >= 16`. 7) No `white-space:nowrap` ellipsis on price rows. 8) Page heights at 390: home <= 10,500, digitization <= 9,000. 9) Real-device smoke test on one iPhone (Safari) and one Android (Chrome) before sign-off: toolbar heights, keyboard + dock, focus zoom, safe-area.

**Owner confirmations needed:** larger originals for the 39 files < 600 px in `public/images` (4 at 300 px, 35 at 400-599 px; a few are site imagery, not products; priority: the four 300 px product files); whether production hides the demo/review bar; whether lab turnaround time can replace "bitte im Laden erfragen" in the configurator facts.

## 14 · Sources opened 2026-10-06

W3C WCAG 2.2 Understanding: target-size-minimum, target-size-enhanced, focus-not-obscured-minimum, resize-text, status-messages · W3C ARIA APG: button, switch, tabs, disclosure · Apple Design Tips (developer.apple.com/design/tips/) · Material 3 foundations (m3.material.io/foundations/designing/structure) · web.dev accessible-tap-targets, viewport-units · Chrome Lighthouse font-size audit · MDN scroll-margin-top, length (viewport units), @media pointer/hover, env() · NN/g: touch-target-size, mobile-faceted-search, mobile-navigation-patterns, horizontal-scrolling, sticky-headers, table-of-contents, mobile-accordions, alternatives-pagination-listing-pages, ecommerce-homepages-listing-pages, ecommerce-product-pages, bottom-sheet, accidental-overlay-dismissal, back-to-top, response-times-3-important-limits, drop-down-menus, toggle-switch-guidelines · Baymard: product-listing-page-plp-ux, guideline 452, product-listing-information, mobile filtering benchmark, ensure-sufficient-image-resolution-and-zoom (+ search excerpts: mobile homepage scope, autocomplete) · GOV.UK select · Smashing Magazine sticky menus (+ excerpt: thumb zone, load-more study). Competitors measured at 390x844: analoguewonderland.co.uk/collections/buy-35mm-film, fotoimpex.com/films, shop.lomography.com/eu/film, thedarkroom.com/shop/product/film-developing, carmencitafilmlab.com/prices, medienrettung.de (partial: cookie dialog blocked screenshots, DOM measured), onfilmlab.de (text only). Own site: bilderfuerst.vercel.app `/`, `/shop`, `/p/kodak-portra-400-135-36-film`, `/filmentwicklung`, `/digitalisierung`, `/geschichte`. No form submitted, nothing bought, cookies declined or essential-only.
