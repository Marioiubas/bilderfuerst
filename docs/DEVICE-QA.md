# Device QA: iPhone Safari and Android Chrome

Status: Phase 1 (research, code audit, Safari-engine checks). No app code was changed.
Date: 2026-10-07. Target: https://bilderfuerst.vercel.app (live) and this worktree's source.

## 1. What was and was not verifiable without hardware

This Mac has Xcode 26.6 (iOS 26.5 SDK) but no iOS Simulator runtime (`xcrun simctl list runtimes` is empty),
no Android emulator, and `adb` (1.0.41) with no device attached. Free disk on the Data volume is 5.2 GiB (98 % used).

Tools actually used:

- Playwright 1.63.0 WebKit build 2359 (reports `Version/26.6`), iPhone 15 descriptor: 393x659 CSS px, DPR 3,
  `isMobile`, `hasTouch`, UA of iPhone Safari. This is the Safari rendering engine on macOS. It is not iOS Safari.
- System Google Chrome 153 driven by Playwright with the Pixel 7 descriptor at 393x659. This is Chrome on macOS
  emulating a phone. It is not Android Chrome (no FreeType, no Android WebView, no system Back).
- Static audit of `app/styles/*.css`, `components/`, `app/layout.tsx` and the built CSS served by the live site.

| Topic | Verified here | Needs real hardware |
|---|---|---|
| CSS parsing and support (dvh/svh/lvh, `:has`, `inert`, `<dialog>`, `CloseWatcher`, container queries) | yes, WebKit 26.6 and Chrome 153 | support on older iOS (15.x, 16.x) |
| Layout at 393 px, horizontal overflow, sticky offsets, computed font sizes | yes, 10 routes, both engines | none |
| Font metrics, variable-font axes (wdth 62-125 %, wght 100-900), line wrapping | yes, WebKit vs Chrome identical to 1-2 px | CoreText on iOS and FreeType on Android rasterisation |
| Dialog open/close, backdrop, focus, history length, scroll lock via wheel | yes (wheel only on non-mobile WebKit context) | touch scroll, rubber-band, momentum, scroll chaining |
| dvh/svh/lvh differences | no: all three equal 659 px (no collapsing browser UI is emulated) | Safari/Chrome toolbar collapse and expand |
| Safe areas (notch, Dynamic Island, home indicator) | no: `env(safe-area-inset-*)` is 0 in emulation | any iPhone with notch/island |
| On-screen keyboard (visualViewport, covered inputs) | no | iPhone and Android phone |
| Android Back button, iOS left-edge swipe with an open dialog | no (only `history.length` was measured) | Android phone, iPhone |
| Native select pickers (iOS wheel, Android list) and iOS focus zoom | font sizes measured; the zoom itself is not reproducible | iPhone |
| Tap highlight colour, double-tap zoom, real `:hover` stickiness on iOS | stickiness reproduced in touch emulation; colour and zoom not | iPhone, Android |
| Header glass blur (`backdrop-filter`) | CSS is present and prefixed in the build; Playwright screenshots do not show the blur | any phone |
| Performance, GPU, thermal, WebGL | no | any phone |

Evidence images: `docs/evidence/final-audit/webkit/` (12 JPEGs, WebKit iPhone 15 and one landscape pair).

## 2. WebKit and Chromium findings (measured on the live site)

| Check | Result |
|---|---|
| Support (`CSS.supports`, runtime) | `100dvh`, `100svh`, `100lvh`, `:has()`, `inert`, `HTMLDialogElement`, `CloseWatcher` all present in WebKit 26.6 and Chrome 153 |
| Media queries under touch emulation | `(hover:hover)` false, `(any-hover:hover)` false, `(pointer:coarse)` true in both. `@media (hover:hover)` guards would therefore work |
| Viewport meta | `width=device-width, initial-scale=1` (Next default). No 300 ms delay issue. Pinch zoom stays enabled (good) |
| Horizontal overflow at 393 px | none on `/`, `/shop?category=Filme`, `/filmentwicklung`, `/digitalisierung`, `/geschichte`, `/kontakt`, `/p/kodak-portra-400-135-36-film`, `/checkout`, `/galerie`, `/services` (WebKit and Chrome) |
| Document height WebKit vs Chrome | identical on 5 of 10 routes, within 3 px on 9 of 10; only the home page differs by 14 px (12493 vs 12507) |
| Text geometry, 1434 matched elements on 9 routes | 0 differ by 3 px or more; 49 (3.4 %) differ by 1-2 px (rounding). No wrapping differences |
| Variable font axes | 40 px sample "Filmentwicklung in Fürth": width at wdth 62/72/100/125 % = 318.5/357.5/466.7/582.9 px in both engines; weight 400 = 431.6, 780 = 487.6 in both. Archivo renders its true condensed axis in WebKit (no faux condensing) |
| IBM Plex Mono | 400 and 500 identical (576 px). Weight 600 is synthetic bold: 602.7 px in WebKit vs 576 px in Chrome (+4.6 % advance). Used by `.cart-count` (base.css:171) |
| Sticky stack | header 60 px, compact 58 px. `.shop-bar` top 57 (1 px under header border), `.fc-strip-dock` top 58, `.hist-hud` top 56 (2 px under header). Offsets stayed constant while scrolling (shop at 900 px, filmentwicklung 1400-3000 px, geschichte 1600 and 3600 px) |
| Phone summary dock (`/filmentwicklung?format=35mm&process=C-41&scan=JPG`) | `fixed`, bottom 0, 57 px high. At y=1398 and 2200 `data-show=true`, visible. At y=3000 (order note reached) `visibility:hidden`, `inert=true`. With any dialog open it is `display:none` |
| Anchors on `/geschichte` | tapping `#kapitel-1935`: smooth scroll lands with the target at 146 px, below header (58) and chapter bar (108), as designed (`scroll-padding-top` 124 px + 24 px frame margin) |
| Dialogs (mobile menu, cart drawer, search, filter sheet) | all render in the top layer, `position:fixed`. Menu/cart/search = 393x659 (full `dvh`). Filter sheet y=79 h=580 (88 dvh) with the sticky footer button flush at the bottom. Backdrop `rgba(10,11,12,.62)` |
| Scroll position across a dialog | filter sheet opened and closed at y=898: 898 before, 898 during, 898 after |
| Scroll lock (wheel, non-mobile WebKit and Chrome at 393x659) | With the app's `html{overflow:hidden}`: wheel over the backdrop and chained wheel past the sheet end do not move the page. With the lock removed: the page scrolled 500 px through the backdrop in both engines. So the JS lock in `components/dialog.tsx` is the only thing stopping scroll-through (modal `inert` does not do it) |
| `history.length` on dialog open | unchanged (2 -> 2). Dialogs push no history entry |
| Escape and backdrop tap | Escape closes all; backdrop tap closes the filter sheet |
| Focus on open | WebKit: first control (close X) is focused and `:focus-visible` matches after a touch tap, so a 2 px red ring shows around the X in cart drawer and filter sheet (`webkit-03-...`). Chrome: no ring |
| Focus on close | WebKit: `document.activeElement` is `<body>` after closing (Safari does not focus buttons on click, so `previous` in dialog.tsx:6 is body). Chrome: returns to `.cart-trigger` |
| Sticky `:hover` | Reproduced in both engines: after tapping the cart button and closing the drawer, `.cart-trigger:hover` still matches and keeps the grey tint. 67 unguarded vs 3 guarded `:hover` rules in the home page's loaded CSS |
| Form controls | Every visible text/number/search control is 16 px or larger, except two native selects: filter-sheet brand select 14 px (WebKit computed) and PDP variant select 14.5 px. Estimator select and number input are 16 px |
| Landscape (734x343) | no overflow; header 58-60 px; dock shown fixed (53 px); strip becomes static; progress row shown; mobile menu scrolls (content 673 px in 343 px) |
| `-webkit-backdrop-filter` | present in the built CSS (build prefixes automatically), including `::backdrop` and the header. Nothing to do |
| Header glass in screenshots | text behind the dark header is visible and unblurred in Playwright screenshots (see `webkit-08`, `webkit-09`). Treat as a screenshot limitation until confirmed on a phone |

## 3. Code-audit findings (severity order)

Severity: High = likely user-visible breakage on a phone; Medium = real defect or high-probability issue to confirm
on hardware; Low = polish; Info = no action required.

### D1 High: iOS focus zoom on two native selects
- `app/styles/commerce-pdp.css:69` `.pdp-variant .select{font-size:14.5px}` (PDP variant select, `components/product-detail.tsx:58`).
- `app/styles/commerce.css:155` `.spec .select{font-size:14px}` (filter-sheet brand select, `components/commerce/shop-filters.tsx:60`).
- Cause: both have specificity 0,2,0 and beat the phone rule `base.css:128` (`.input,.select{font-size:16px}`, 0,1,0). Confirmed by computed style in WebKit.
- Effect: iOS Safari zooms the page when the select is focused and stays zoomed. The PDP select is the purchase path for lab and scan services.
- Related, same cause: `base.css:116` `.input,.select` and `commerce.css:89` `.shop-search input` are 14 px from 768 px up, so iPad Safari
  (768-1023 px portrait) is not covered by the `max-width:767px` rule.
- Fix: use a touch-based rule instead of the width-based one and place each override next to the rule it beats (cascade order across the route stylesheets is not guaranteed):
  in `commerce-pdp.css` after line 69 `@media (pointer:coarse){.pdp-variant .select{font-size:16px}}`;
  in `commerce.css` after lines 89 and 155 `@media (pointer:coarse){.shop-search input,.spec .select{font-size:16px}}`;
  in `base.css` replace line 128 by `@media (pointer:coarse){.input,.select{font-size:16px;min-height:44px}}` (covers iPad and Android tablets).

### D2 Medium: search overlay and the on-screen keyboard (hardware to confirm)
- `app/styles/commerce.css:311` `.search-index{height:100dvh}` on phones; `.si-body{overflow:auto}` (line 270).
- `dvh` does not shrink for the keyboard on iOS Safari, and not on Android Chrome by default (`interactive-widget=resizes-visual`).
  The lower part of the results list sits under the keyboard and the last rows cannot be scrolled above it.
- Fix: in `components/commerce/search-index.tsx` listen to `visualViewport` `resize`/`scroll`, write `--vvh` on the dialog, and use
  `max-height:var(--vvh,100dvh)` under `(pointer:coarse)`; add bottom padding to `.si-body`. Optional for Android only:
  `interactiveWidget:'resizes-content'` in the `viewport` export of `app/layout.tsx`.

### D3 Medium: no Back-button handling for dialogs
- `components/dialog.tsx:8` calls `showModal()` and pushes no history entry (measured: `history.length` 2 -> 2). Used by header.tsx:86 (menu),
  shop-overlays.tsx:15 (cart), search-index.tsx:83, catalog-shop.tsx:216 (filter sheet), pdp-gallery.tsx:72, developer-strip.tsx:33, gallery/lightbox.tsx:47.
- Result depends on the browser: Chrome 120+ routes system Back to the modal `<dialog>` (close watcher) and closes it; browsers without that
  (older Chrome/WebView, Samsung Internet, Firefox Android) navigate away from the page, losing e.g. the `/shop` filter state. iOS Safari left-edge
  swipe is a history back; WebKit 26.6 exposes `CloseWatcher` but whether the swipe uses it is unverified.
- Fix (after hardware test): feature-detect `CloseWatcher` and bind it while a dialog is open; fallback: `history.pushState` on open +
  `popstate` to close, and `history.back()` when closed through the UI. Keep it compatible with the `replaceState` calls in catalog-shop.tsx:53 and film-configurator.tsx:85.

### D4 Medium: sticky `:hover` on touch
- About 110 `:hover` selectors in `app/styles` (base.css 19 lines, commerce.css 30, home.css 21, lab.css 12, story.css 8, commerce-pdp.css 8, digitization.css 5, others 4).
  Only a few sit in `@media (hover:hover)` (`commerce.css:201`, `commerce-pdp.css:30`, `commerce-pdp.css:51`); three more are `(hover:none)` overrides.
- Reproduced: after a tap the hover tint of `.icon-btn` (base.css:140) stays; `.btn:hover::after` (base.css:67) leaves the red underline and arrow shift on in-page buttons such as "Weiter stöbern"; same for `.facet-option`, `.active-chip`, `.quick-pick`.
- Fix: wrap hover rules in `@media (hover:hover)`. Mechanical option: a tiny PostCSS plugin after `@tailwindcss/postcss` in `postcss.config.mjs` that moves rules whose selector contains `:hover` into `@media (hover:hover)` (split selector lists that also contain `:focus-visible`). Review the diff in base.css first.

### D5 Medium: focus is not returned to the opener in Safari
- `components/dialog.tsx:6` stores `document.activeElement` at open time; Safari (macOS and iOS) does not focus a `<button>` on click/tap, so this is `<body>` and `previous?.focus()` (line 10) does nothing. Measured: `activeElement` is body after closing the cart in WebKit, the trigger in Chrome. VoiceOver and keyboard users restart from the top of the page.
- Fix: remember the opener explicitly (capture `pointerdown`/`click` target on the nearest button, or pass a `returnFocus` ref from the opener) and focus it in the cleanup.

### D6 Medium (verify): double-tap zoom on quantity steppers
- No `touch-action:manipulation` anywhere (only `.compare-stage{touch-action:pan-y}`, digitization.css:7). Steppers: PDP `.stepper` (commerce-pdp.css:73), cart lines (`components/commerce/cart-lines.tsx:24`), configurator `.fc-qty-btn` (`film-configurator.tsx:248`). Rapid taps on + or - can trigger iOS double-tap zoom.
- Fix: in base.css reset add `button,a,summary,label,select,input{touch-action:manipulation}`.

### D7 Low: autofocus ring on dialog open (WebKit)
- `showModal()` focuses the first control, the close button; WebKit shows `:focus-visible` after a touch tap (`webkit-03-cart-drawer-autofocus-ring.jpg`). Real iOS behaviour to confirm.
- Fix: give each dialog a focus target that is not a control, e.g. `autofocus tabindex="-1"` on the heading/container, with `[tabindex="-1"]:focus{outline:none}`.

### D8 Low: scroll lock implementation
- `components/dialog.tsx:8,10` writes `documentElement.style.overflow` directly. It is not reference-counted (a second dialog closing would unlock the first; no nested dialogs exist today), the cleanup wipes any other writer, and on desktop the vanishing scrollbar shifts layout (no `scrollbar-gutter`). The dialog scroll areas (`.dialog-sheet`, `.dialog-overlay`, `.dialog-full`, base.css:134-137, and the lightboxes) lack `overscroll-behavior:contain`; only `.si-body` and `.cart-scroll` set it (commerce.css:270, 334).
- Fix: pure CSS `html:has(dialog[open]){overflow:hidden}` (the site already relies on `:root:has(dialog[open])` at lab.css:277, Safari 15.4+) and `.dialog{overscroll-behavior:contain}` in base.css:131. Keep `html{scrollbar-gutter:stable}` as a desktop-only follow-up.

### D9 Low: tap feedback
- No `-webkit-tap-highlight-color` and zero `:active` rules in `app/styles`. iOS Safari paints its default grey flash on links and buttons; Android Chrome its own highlight. Combined with D4 a tapped control can show both.
- Fix: `html{-webkit-tap-highlight-color:transparent}` only together with `:active` states for `.btn`, `.icon-btn`, `.facet-option`, `.shop-tab`, `.quick-pick`.

### D10 Low: large-viewport `vh`
- `app/styles/gallery.css:43` `clamp(520px,74vh,820px)`, `commerce.css:387` `min-height:60vh`, `commerce.css:256` `top:clamp(0px,7vh,80px)` (desktop only, phone rule overrides it). `vh` is the large viewport on iOS/Android, so the gallery stage is taller than the visible area while the toolbar is expanded.
- Fix: `74svh` and `60svh`. Everything else already uses `svh` (hero.css:5/12/14, digitization.css:56) or `dvh` (dialogs, lightboxes).

### D11 Info: viewport and safe areas
- `app/layout.tsx:19` `viewport={themeColor,colorScheme:'light'}`; no `viewportFit`. `env(safe-area-inset-bottom)` at `commerce.css:316`, `commerce.css:440` and `lab.css:275` is therefore 0 (harmless). Safari keeps the page inside the safe area, including letterboxing in landscape.
- Do not add `viewport-fit=cover` unless side insets are added to header, `.wrap`, dialogs and the dock; otherwise landscape content runs under the notch.
- iOS 26 floating bottom bar: confirm on hardware that `.fc-dock` (lab.css:275) is not covered by it.

### D12 Info: synthetic bold on the mono face
- Only IBM Plex Mono 400 and 500 are loaded (`app/layout.tsx:7-8`); `.cart-count` uses 600 (base.css:171) so engines fake bold (WebKit +4.6 % advance). Use 500, or load 600.

### D13 Info: browser support floor
- `<dialog>` and `:has()` 15.4, `dvh/svh` 15.4, `inert` 15.5, `overflow-x:clip` on `body` (base.css:7) 16.0, `@container` 16.0, `color-mix` (story.css) 16.2, `text-wrap:balance` (home.css:13) 17.5 (progressive). Practical floor is iOS 16.4; iOS 15 may scroll horizontally.

### Already correct (verified, no action)
- Hero and DZ hero use `svh`; dialogs and lightboxes use `dvh`; no `100vh` for full-height UI.
- Phone summary dock hides while a dialog is open, while typing and at the order note; `inert` follows visibility.
- `<select>` uses `appearance:none` with a CSS chevron; the native pickers still open.
- `.compare-stage{touch-action:pan-y}` with pointer capture: horizontal drag does not fight page scroll.
- No smooth-scroll library, no non-passive touch/wheel listeners; scroll listeners are passive.
- `html{-webkit-text-size-adjust:100%}` is set; build adds `-webkit-backdrop-filter`.
- Anchors use `scroll-padding-top` plus per-section margins and land correctly.

## 4. Real-device checklist

Run on the public URL. Record device, OS version, browser version, pass/fail and a short screen recording
(iPhone: Control Center screen recording; Android: Quick Settings screen recorder) per failing item.
Test at least: one small iPhone (375 px wide), one current iPhone with Dynamic Island, one Pixel/Samsung with Chrome.
Do each item once with the browser toolbar expanded and once collapsed (scroll down a little), portrait first.

### iPhone Safari

| ID | Steps | Pass when |
|---|---|---|
| I1 | Open `/`. Scroll down 150 px and up again several times | no jump or flicker of hero or header while the toolbar collapses; hero CTAs reachable |
| I2 | Rotate to landscape on `/`, `/shop?category=Filme`, `/filmentwicklung`; rotate back | no horizontal scroll; nothing under the notch or island; layout re-flows without a zoomed page |
| I3 | Open `/filmentwicklung?format=35mm&process=C-41&scan=JPG`, scroll to the middle | bottom dock fully above the home indicator and the Safari bar, CTA tappable in both toolbar states; dock disappears at the order note |
| I4 | Same page: tap the 01..05 boxes in the progress row | target heading lands below header plus progress row; no gap flashes between header and row |
| I5 | `/shop?category=Filme`, scroll 900 px | search/sort/filter bar sticks right under the header; no 1 px gap or overlap while the header compacts |
| I6 | `/geschichte`, scroll to a late chapter; tap a chapter link | chapter bar stays; anchor target lands below header and bar |
| I7 | `/p/negativ-scan-ganze-rollen`: tap the "Entwicklung & Scan wählen" select | picker opens and the page does NOT zoom in (D1); chosen option updates price and enables the CTA |
| I8 | `/shop?category=Filme` -> Filter -> MARKE select | no page zoom (D1) |
| I9 | `/digitalisierung` estimator: select, number field, slider | no zoom; numeric keypad on the number field; slider drags without scrolling the page |
| I10 | Scroll to 900 px, open Menu, Cart, Search, Filter (one at a time). Drag a finger on the dimmed area and at the end of the sheet/list | page behind never moves; closing returns to the same scroll position; Safari bar does not jump |
| I11 | Search: type "portra" with the keyboard open, scroll the results to the end | last result reachable above the keyboard (D2); "Alle Treffer im Shop" button usable |
| I12 | Open the filter sheet, then swipe from the left screen edge | note what happens: sheet closes, or the page navigates back (D3). Report which |
| I13 | Rotate with a dialog open (menu, filter sheet) | dialog resizes, content scrolls, nothing clipped |
| I14 | Tap the + button of a quantity stepper 4 times quickly (PDP after choosing an option, cart line) | page does not zoom (D6) |
| I15 | Tap links and buttons; tap the cart icon, close the drawer | note any grey tap flash (D9); icon must not stay tinted after closing (D4) |
| I16 | Open and close the cart drawer, then check where VoiceOver focus lands (or Tab with a keyboard) | focus returns to the cart button (D5) |
| I17 | Check headings (Archivo condensed), mono labels and prices against `docs/evidence/final-audit/webkit/` | same line breaks; headings condensed, not stretched; dark header shows glass blur |
| I18 | Safari "aA" -> larger text size (e.g. 150 %) on `/` and `/shop` | no overlapping or clipped text |
| I19 | Low Power Mode on; scroll `/geschichte` and `/filmentwicklung` | stays smooth; 3D/animation degrade gracefully |

### Android Chrome

| ID | Steps | Pass when |
|---|---|---|
| A1 | Items I1-I6 (same URLs) with gesture navigation and again with 3-button navigation | same pass criteria; dock above the gesture bar and above the 3 buttons |
| A2 | Open the filter sheet on `/shop?category=Filme`, press system Back (gesture and button) | sheet closes, URL stays `/shop?...`. If it navigates away, D3 is confirmed |
| A3 | Repeat A2 for Menu, Cart, Search, PDP image lightbox, `/galerie` lightbox | same |
| A4 | Open Search, type "portra" | results list not hidden by the keyboard (D2); address bar does not resize the dialog |
| A5 | PDP variant select, filter brand select, estimator select | native Android list opens; options legible in dark zones (digitalisierung) and light zones |
| A6 | I10, I13, I14, I15 equivalents | same pass criteria; tap highlight colour noted |
| A7 | Settings -> Display -> Font size 130 % and 200 %, plus Chrome Settings -> Accessibility -> Text scaling | no overflow, no clipped buttons |
| A8 | Chrome menu -> "Desktop site" on, then off | layout switches without breakage |
| A9 | Samsung Internet (if available): dark-mode-for-websites on | site stays readable (it declares `color-scheme: light`) |

## 5. Options to enable real tests from this Mac

### (a) Android phone with USB debugging (no download; fastest)

1. Phone: Settings -> About phone -> tap Build number 7 times -> back to Settings -> System -> Developer options -> enable USB debugging.
2. Connect with a data cable, unlock the phone, accept "Allow USB debugging" and tick "Always allow from this computer".
3. Mac terminal: `adb devices`. `adb` is at `/opt/homebrew/bin/adb` (1.0.41). The device must show `device`; if `unauthorized` or `offline`, run `adb kill-server && adb start-server`, replug, accept the prompt again.
4. On the phone open Chrome and load https://bilderfuerst.vercel.app (public; no tunnel needed).
5. On the Mac open Chrome -> `chrome://inspect/#devices` -> tick "Discover USB devices" -> the phone's tabs appear -> "inspect". You get a live screencast, element inspector with computed styles, console and network of the real phone.
6. For a local dev server on the phone: in the same page use Port forwarding (`localhost:3000`) or run `adb reverse tcp:3000 tcp:3000` and open `http://localhost:3000` on the phone.
7. To let Claude run the checks, say when step 3 works. Then these commands drive the real device:
   - `adb exec-out screencap -p > shot.png` (real screenshots), `adb shell wm size`, `adb shell wm density`.
   - `adb shell input keyevent KEYCODE_BACK` (hardware Back with an open dialog: the key test for D3), `adb shell input swipe x1 y1 x2 y2 300`, `adb shell input tap x y`.
   - `adb forward tcp:9222 localabstract:chrome_devtools_remote`, then Playwright `chromium.connectOverCDP('http://localhost:9222')` to rerun the Phase 1 probes (computed font sizes, sticky rects, scroll lock, focus, history) on Android Chrome itself.
8. Afterwards revoke access: Developer options -> Revoke USB debugging authorizations, then switch USB debugging off. USB debugging gives the Mac a shell on the phone; use it only with a trusted computer.

### (b) iOS Simulator runtime (needs the owner's approval: not run, not started)

- Command: `xcodebuild -downloadPlatform iOS` (add `-buildVersion 26.5` to match the installed SDK). Alternative: Xcode -> Settings -> Components -> iOS 26.5 Simulator -> Get.
- Size: the runtime is a download of roughly 8 GB and needs more than that on disk while unpacking. Xcode shows the exact size before it starts.
- Blocker: the Data volume has only 5.2 GiB free (98 % used). At least 20 GB must be freed first, otherwise the download fails or fills the disk for every other process on the machine.
- After install: `xcrun simctl list runtimes`, `xcrun simctl boot "iPhone 17"` (name from `xcrun simctl list devicetypes`), `xcrun simctl openurl booted https://bilderfuerst.vercel.app` opens the real iOS Safari in the simulator. The session's iOS Simulator tool can then tap, swipe, type and screenshot; Safari -> Develop -> Simulator gives Web Inspector; Cmd+K toggles the software keyboard (tests D2).
- Still not covered by the simulator: real touch pressure and momentum feel, hardware performance, thermal behaviour; the iOS system Back swipe is limited.

### (c) Optional: real iPhone with Safari Web Inspector (no download)

iPhone: Settings -> Apps -> Safari -> Advanced -> Web Inspector on. Mac Safari: Settings -> Advanced -> "Show features for web developers". Connect by USB, tap Trust, open the site in iPhone Safari, then Mac Safari -> Develop -> (iPhone name) -> page. This gives manual inspection and screenshots but no automation by Claude.

## 6. Reproducing the Phase 1 probes

Scripts live in the session scratchpad (not committed): Playwright 1.63.0 installed in a temp dir with `npx playwright install webkit`; routes loaded with `waitUntil:'networkidle'` and `document.fonts.ready`; iPhone 15 descriptor for WebKit, Pixel 7 descriptor at 393x659 for Chrome (`channel:'chrome'`). Wheel input is unsupported in mobile WebKit, so the scroll-lock test used a non-mobile WebKit context at the same viewport. If the probes should be kept in the repo, they can be added under `scripts/device-qa/` on request.

## Resolution (2026-10-07)

| # | Status | Where |
|---|---|---|
| D1 selects < 16 px | fixed: every `.input`/`.select` is 16 px on `(pointer:coarse)` and below 768 px | base.css, commerce.css, commerce-pdp.css |
| D2 search sheet vs keyboard | fixed: `--vvh` from `visualViewport.height` while the search is open | search-index.tsx, commerce.css |
| D3 Back closes dialogs | no change: native `<dialog>` + CloseWatcher already covers Android Back (Chrome 120+). A pushState shim was rejected because the Next App Router treats foreign history entries as navigations | dialog.tsx |
| D4 sticky hover on touch | fixed: 106 `:hover` selectors moved into `@media (hover:hover)` (scripts/wrap-hover.mjs, idempotent) | all area stylesheets |
| D5 Safari focus return | fixed: the last pressed control is remembered on pointerdown and focused on close when `activeElement` was `<body>` | dialog.tsx |
| D6 double-tap delay | fixed: `touch-action:manipulation` on links, buttons, fields, labels, summaries | base.css |
| D7 focus ring on open | fixed: without `[autofocus]` the dialog itself takes focus (`tabIndex=-1`, no outline); Tab enters the content | dialog.tsx, base.css |
| D8 scroll chaining | fixed: `overscroll-behavior:contain` on dialogs (JS scroll lock kept) | base.css |
| D9 no press feedback | fixed: `:active` states for buttons, links, icon buttons; grey tap flash removed | base.css |
| D10 `vh` | fixed: `svh` for the gallery stage, search top offset and checkout min-height | gallery.css, commerce.css |
| D11 viewport-fit | unchanged by design | — |
| D12 cart count weight | fixed: 600 → 500 (Plex Mono ships 400/500 only) | base.css |
