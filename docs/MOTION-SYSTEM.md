# Motion system · Remake 2026-10-05

Anime.js 4.5.0 is the primary motion language, imported per module (`animejs/animation`, `/timeline`, `/utils`, `/layout`, `/events`, `/easings`). Motion is centralised in `motion/`; components only call these functions in effects and revert them on cleanup. One engine per element: Aceternity components keep their internal Motion (`motion/react`), Vanta owns the atmosphere canvas, Three.js scenes are driven by Anime progress objects and render in `onUpdate`.

## Architecture

| Module | Owns |
|---|---|
| `motion/tokens.ts` | Durations (fast 180 · normal 320 · section 580 · hero 820 ms), staggers (25 / 55 ms), easings (`shutter` (.2,.75,.1,1), `optical` (.62,0,.32,1), `advance` (.33,0,.15,1), linear), the `Metaphor` type |
| `motion/setup.ts` | Tiers (`static` / `mobile` / `tablet` / `desktop`), `onceVisible`, `whileVisible`, `motionScope`, data-saving detection |
| `motion/reduced-motion.ts` | `motionAllowed`, `useMotionAllowed`, live preference watching |
| `motion/navigation.ts` | Header threshold + registration sweep |
| `motion/commerce.ts` | Dialog/drawer/sheet/overlay shutter entrance |
| `motion/hero.ts` | Hero intro timeline, strip ⇄ contact sheet (DOM + WebGL) |
| `motion/home.ts` | Homepage chapter reveals and lab-drawer micro-interactions |
| `motion/products.ts` | Shop filter feedback, card edge-print |
| `motion/film.ts`, `motion/lab.ts` | Film-strip progress, process/tank state, developer develop, scan lines |
| `motion/digitization.ts` | Scanner passes, chooser feedback, process advance |
| `motion/gallery.ts` | Contact sheet → framed wall, aperture iris |
| `motion/history.ts`, `motion/story.ts` | Film-base beam, year counter, image develop, print emerge, storefront depth |

Rules: every animation names a photographic metaphor; nothing bouncy, springy or floaty; copy and CTAs are never hidden behind an animation; still sections between motion moments; one motion moment per viewport.

## Tiers

Desktop (≥ 1024 px, fine pointer): full. Tablet: no WebGL, no pointer parallax, shorter choreography. Mobile: important reveals, film progress, scanner line (home/digitization, simplified) and drawers only; no Vanta, 3D, tilt or pointer depth. `prefers-reduced-motion: reduce`: every module renders its final state immediately; CSS transitions are disabled globally; Vanta, 3D, parallax, aperture, film advance, scanner lines, beam and gallery spread are off. Nothing relies on motion to be understood.

## WebGL lifecycle

All WebGL waits for the visitor's first pointer move, touch, wheel, key or scroll (or 6 s idle) via `whenEngaged()` in `lib/webgl.ts`, so the static art paints and the page is interactive first. `hooks/use-webgl-scene.ts`: desktop only, max two contexts per page, pause offscreen/hidden, destroy on unmount/reduced motion/tier loss, static fallback on any error. Vanta (`components/darkroom.tsx`) follows the same rules and is destroyed offscreen.

## Complete animation inventory

| # | Area | Element | Trigger | Metaphor | Duration · easing | Reduced motion |
|---|---|---|---|---|---|---|
| 1 | Global | Header compact + red registration line sweep | scroll threshold 56 px | frame-lock | 320 · shutter | class switch only |
| 2 | Global | Nav underline | hover/focus/active | registration | 320 CSS | static line on active |
| 3 | Global | Buttons: arrow shift + registration line | hover | registration | 180–320 CSS | none |
| 4 | Global | Dialogs (drawer, sheet, overlay, lightbox, full) | open | shutter | ~220 · shutter, rows 25 ms stagger | instant |
| 5 | Hero | Metadata, headline lines, sub, lead, CTAs | load | frame-lock | 80–470 ms starts, 580–820 · shutter/advance | final state |
| 6 | Hero | Light table, cartridge line drawing | load | expose | 400/460 ms, 580–820 · optical | final state |
| 7 | Hero | Strip advance out of cartridge; frames lose latent veil | load | film-advance / develop | 500–800 ms, 580–820 | final state |
| 8 | Hero | WebGL entry: lamp on, line drawing → shaded cartridge, strip unwinds | WebGL active | develop / film-advance | 580–1060 | no WebGL |
| 9 | Hero | Strip ⇄ contact sheet (DOM measured transforms / WebGL progress) + grease pencil | button | contact-sheet / frame-lock | 820 desktop, 580 tablet, 320 fade mobile; pencil 580 | instant switch |
| 10 | Hero | Camera pointer response | mouse move | focus | eased, ≤ 2.4° / 1.4° | none |
| 11 | Home | Lichttisch lights up | in view | expose | 580 | none |
| 12 | Home | Film lab photos develop | in view | develop | 600 | none |
| 13 | Home | Pentax viewfinder brackets lock | in view | frame-lock | 320 | none |
| 14 | Home | Scanner line wipes veil | in view | scan-pass | 1500 linear | none |
| 15 | Home | Print sheets slide out / fan | in view / hover | print-emerge | 580 / 320 | none |
| 16 | Home | Archive frames negative → positive | in view | develop | 560 each | none |
| 17 | Home | Lab drawers (frame advance, frame tick, guide lock, scan line, paper reveal) | hover/focus (mouse) | per drawer | 180–520 | none |
| 18 | Shop | Visible results fade to .15, swap | filter change | expose | ~90 | instant |
| 19 | Shop | First visible set (≤ 8 cards) rises 6 px | after swap | develop | 180, 25 ms stagger | none |
| 20 | Shop | Card edge-print line, stage light +4 %, image 3 px | hover | edge-print | 320 CSS | none |
| 21 | PDP | 2.5D stack / main image change | thumbnail | focus | 580 / 320 | flat / instant |
| 22 | Lab | Film strip advance + gate readout 01 → 01A → 02 | step done | film-advance | 320–820 · advance | snaps |
| 23 | Lab | Strip format redraw | format change | frame-lock | 280 crossfade | instant |
| 24 | Lab | Frame flash | step done | expose | 440 | none |
| 25 | Lab | Tank chemistry, film path, reel width | process/format | develop | ≤ 580 | static |
| 26 | Lab | Developer sample swap | developer chosen | develop | 560 | instant |
| 27 | Lab | Scan dimension lines | expert table shown | scan-pass | 580 | static |
| 28 | Lab | Ticket total | total change | frame-lock | 180 | static |
| 29 | Lab page | Spec card rules / photos | in view | frame-lock / develop | 580 / 560 | static |
| 30 | Digitization | Hero scan line | load (desktop/tablet) | scan-pass | 2200 linear | off |
| 31 | Digitization | Tile sweep | select object | scan-pass | 440 | off |
| 32 | Digitization | Detail panel | after change | frame-lock | 240 | off |
| 33 | Digitization | ICE scan pass → Compare settle | in view | scan-pass / focus | 2600 + 700 | final Compare |
| 34 | Digitization | Process stations (clip + slide) | in view | film-advance | 580, staggered | off |
| 35 | Gallery | Contact sheet → framed wall, captions | in view | contact-sheet / frame-lock | 760 + 25 stagger, captions 320 | framed directly |
| 36 | Gallery | Print spotlight / dimming (Focus Cards) | hover/focus | gallery spot | 320 CSS | instant |
| 37 | Gallery | Aperture iris lightbox | open/close | aperture | 280 / 160 (220 switching) | 120 fade |
| 38 | Gallery | 3D window lights / camera | WebGL active / mouse, scroll | expose / focus | 820 / damped | no WebGL |
| 39 | History | Amber beam, sprocket holes, trail | scroll | film-base light | overdamped, no bounce | static rail |
| 40 | History | Frame develop | beam reaches frame | develop + frame-lock | 580 | static |
| 41 | History | Year counter | chapter change | film-advance | 320 | instant |
| 42 | Store | Storefront planes (same photo) | pointer (desktop) | focus | 420, ≤ 4.5 px | none |
| 43 | Print room | Stack emerge / spread / tilt | scroll / pointer | print-emerge / focus | 580 / 320 / 320, ≤ 3.5° | none |
| 44 | Atmosphere | Vanta FOG (home), DOTS (digitization) | engaged + visible (desktop) | expose (light) | continuous, slow | off |

No page transition framework, no scroll hijacking, no Lenis, no audio, no sparkles. See [DESIGN-SYSTEM-V2.md](DESIGN-SYSTEM-V2.md) §6.
