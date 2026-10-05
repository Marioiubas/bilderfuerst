# Design directions · Remake 2026-10-05

Three directions were defined before implementation and evaluated against the actual business: a specialist analog store, an in-house film lab (C-41 Fujifilm minilab, B&W Jobo rotation, E-6), a separate digitization manufactory (negatives, slides, Super8/Normal8/16mm/35mm, video, audio), a physical Street Gallery window and three generations of family photography history.

Baseline before this remake (commit `6c9c213`, tag `remake-baseline-2026-10-05`): the live preview had already moved away from the earlier cream/olive/sage/terracotta family to a black/graphite/red editorial look. It still read as an *editorial photography magazine*: Instrument Serif headlines, one red accent everywhere, near-identical dark/light section splits, and no visual separation between lab, scanning, store and archive. Screenshots: `docs/evidence/visual-after/` (the previous release = this remake's "before").

## Direction A · Modern Darkroom

| Aspect | Treatment |
|---|---|
| Palette | Photographic black, silver, photo white, deep safelight red, a trace of chemistry tint |
| Typography | High-contrast serif display + neutral grotesk + mono |
| Homepage | Long dark scroll; sections separated by light leaks; red safelight as the only accent |
| Hero | Full-bleed black, enlarger cone, floating negative |
| Shop | Black header strip, white cards |
| Filmentwicklung | Red-lit darkroom panel |
| Digitization | Same red language (no distinct identity) |
| Street Gallery | Black wall, white mats |
| History | Serif editorial, monochrome |
| Commerce | White, red buttons |

Evaluation: strongest mood, weakest information architecture. Digitization (a whole manufactory business) would look identical to the lab. Close to the current baseline, so the risk is "just darker". Red everywhere repeats the existing problem.

## Direction B · Archival Lab

| Aspect | Treatment |
|---|---|
| Palette | Dark charcoal, ivory photo paper, silver metal, amber film base, deep burgundy |
| Typography | Old-style serif + humanist sans, archival labels |
| Homepage | Archive boxes, index cards, paper stacks |
| Hero | Contact sheet on ivory, loupe |
| Shop | Ivory catalogue cards |
| Filmentwicklung | Lab ticket on paper |
| Digitization | Archive boxes to files |
| Street Gallery | Ivory mats, burgundy wall |
| History | Strong fit (archive) |
| Commerce | Ivory surfaces |

Evaluation: perfect for history, wrong for the rest. Ivory + burgundy re-introduces the warm "organic café / editorial" family the brief wants removed and lowers commerce contrast. The store is not an antiques archive; it sells current Kodak/Ilford/CineStill film and runs modern machines (Noritsu HS-1800, Fujifilm minilab).

## Direction C · Analog Technology — **CHOSEN**

| Aspect | Treatment |
|---|---|
| Palette | Graphite + photographic black for immersive zones, photo white for commerce, darkroom red as the single interaction accent, film amber (film/chemistry), scanner cyan (digitization only), controlled industrial blue (E-6 slide process + technical drawing lines), silver for hardware/technical UI |
| Typography | Engineered grotesk with a width axis (Archivo Variable: condensed for display, normal for UI) + film edge-print mono (IBM Plex Mono) for codes, frame numbers, ISO, process |
| Homepage | A route through the lab: Darkroom → Light table → Film lab → Analog store → Scanner → Print room → Street Gallery → Archive → Physical store. Each zone has one discipline accent and one mechanical motif |
| Hero | 3D film workspace: cartridge object, negative strip carrying real business photographs through an enlarger light field, contact-sheet rearrangement |
| Shop | Calm photo-white light table, graphite type, silver hairlines, red only for selection/CTA |
| Filmentwicklung | Film strip as progress indicator (35mm sprockets / 120 wide / 110 small), process modules colour-coded C-41 amber · B&W silver · E-6 blue, lab-envelope order ticket |
| Digitization | Graphite + scanner cyan signal language, physical-media chooser, scanner pass revealing real scans |
| Street Gallery | Black wall, black frames, white mats, gallery spots; 3D window reconstruction |
| History | Film roll through time: frames on a strip, amber film-base light travels along it |
| Commerce | Photo white, no WebGL, fast drawers |

Evaluation: the only direction that gives each real business discipline its own legible identity while sharing one mechanical grammar (frames, registration marks, codes, sprockets, edge print). It is "technologically advanced without futurism" because every accent maps to a real material: red safelight, amber film base, the cool light source of a film scanner, the blue tradition of E-6 slide chemistry, silver lens and camera hardware.

Decision: **Direction C**, implemented as defined. No averaging: no serif display face, no ivory/burgundy surfaces, no red everywhere. History uses graphite + photo white + amber film base (not ivory) to keep the archive inside the same system.

## Rules derived from the decision

1. Photography is the most colourful element on any screen. Accents occupy < 5 % of a viewport.
2. One discipline accent per section. Red is reserved for interaction (focus, selection, CTA, active nav) everywhere.
3. Immersive (dark) zones: hero, film lab, scanner, gallery, archive. Calm (light) zones: shop, PDP, cart, checkout, services lists, legal.
4. Geometry is rectangular and mechanical: 0–2 px radii, hairline rules, registration crosses, frame counters. No pill-shaped SaaS cards.
