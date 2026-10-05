# Visual transformation baseline · 05 October 2026

Checkpoint: `pre-higgsfield-2026-10-05`, commit `c11e784`. Before implementation, the optimized production build, TypeScript and catalog/evidence verification pass. No lint script existed: the attempted baseline lint command reports that omission. A real ESLint configuration is being added for the final verification.

## Rendered baseline

`evidence/visual-before` contains all eight primary routes and Pentax detail at 360, 390, 430, 768, 1024, 1280 and 1440 pixels, plus lab, FineArt, search, cart, mobile filters and navigation. 65 route/width observations have one H1 and no horizontal overflow. Full-page captures do not necessarily load every offscreen lazy image; loaded images are checked separately in the final pass.

The existing strengths are real products and source images, technical catalog filters, correct variant selection, the contact-sheet hero concept, the Street Gallery's illuminated frames, and a working nontransactional cart. Preserve these. The lab and shop information architecture is already strong.

The rendered homepage repeatedly uses warm paper, large serif headings and flat two-column sections. The hero atmosphere is confined to a rectangular visual; warm olive/brown Vanta settings do not create a convincing darkroom. The lab is another pale split panel. Digitization has one source photo beside ordinary icon rows, with little scanning identity. Gallery frames are good but the surrounding green-black and terracotta headings weaken the photographic identity. History has a large area of empty paper below its single archive photograph. Service cards lack a clear physical-medium or optical language. Commerce itself should remain quieter than these story sections.

## Palette and typography decision

Old: paper `#F5F3EC`, ink `#1B1D17`, muted `#777A6F`, universal orange `#DC4D22`, with olive/khaki surfaces. New direction: photographic black `#0B0D0E`, graphite `#15191C`, panel `#1D2225`, print white `#FAFAF7`, paper `#F4F3EE`, silver `#BBC1C2`. Safelight red `#C6322A` is the primary button fill; brighter red is reserved for nontext illumination. Cyan `#55BCC0` belongs to scanning; amber `#D6A541` to film/process metadata.

This is a designed palette, not a claim of official brand colors. The original storefront, interior and scanner are dominated by dark signage, black/silver equipment and white photographic mats; the films bring localized amber. The original site and Maps destination were reopened; the Maps short link resolves to the real Bilderfürst Fürth listing. `source-palette.json` records quantized samples of four genuine source photographs, without recoloring those photographs.

Keep DM Sans, Instrument Serif and technical mono. Serif remains for the emotional hero, history and gallery. Shop, configurator steps, product headings and service controls move toward a stronger grotesk hierarchy. The current aperture mark is a temporary interface mark, not an approved official logo. Existing Analog Store product logos are product assets, not a supplied Bilderfürst vector logo.

## Motion and Higgsfield scope

Anime.js owns contact-sheet layout, scanner passes, film advancement, photo development, search/cart entrances and bounded first-row filter changes. Aceternity retains ownership of its internal Lens/Compare/Tracing Beam/Parallax/3D Card/Spotlight motion. Vanta owns background atmosphere only.

Higgsfield 3D Jutsu supplies six editable stylized props: an optical aperture, reel, audio cassette, video cassette, negative contact sheet and print stack. These are generic visual metaphors, never catalogue products, lab equipment claims, restored scans or historical/business photography. The committed Blender scene, GLB, static poster renders and exact provenance will be recorded. Animated 3D is lazy, bounded, disabled for mobile/reduced motion/data saving and destroyed offscreen; static posters remain visible.

No new history facts, photographic restoration claims, prices, stock or order behavior are introduced. The original catalog/source files, source photographs and merchant links are preserved. Review label, noindex/nofollow and disabled payment remain.
