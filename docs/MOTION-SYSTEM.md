# Motion ownership and tokens

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

Anime.js 4.5: hero text/foreground film entrances, section reveals, cart panel entrance and interactive film/contact grid choreography. Anime exclusively owns these outer elements. Native React state owns filters and commerce controls.

Aceternity/Motion exclusively owns internal Lens, Compare, camera tilt, tracing light, gallery parallax and Spotlight. Vanta exclusively owns the atmosphere canvas. Never animate the same element with two engines.

Reduced motion: no canvas/parallax/tilt or continuous light drift, visible content immediately, direct state changes. Mobile: static atmospheric fallback; shallow film composition; keyboard/touch alternative to hover lenses. Stop background work when hero leaves viewport or document is hidden. All effects decorative; no audio.

## Visual release · 05 October 2026

The current scoped implementation is in `motion/tokens.ts`, `hero.ts`, `photographic.ts`, `commerce.ts` and the lazy `prop-scene.ts`. Generic section fade-ups were removed. Anime now owns the reversible contact grid, scan pass, film advance, archive/sample development, shutter entrance, dialog entrance, bounded filter feedback and generic optical prop interactions. It does not animate an Aceternity-owned element.

Vanta FOG remains in the hero and DOTS is restricted to the digitization introduction. Both are lazy, observed, DPR-limited and disposed offscreen or on hidden/reduced-motion/mobile states. Higgsfield provides six stylized props, native poster fallbacks and one exported aperture cycle; props render on demand and never replace business imagery or product records. The digitization intro and its prop can briefly overlap as two contexts. The shop requests no renderer/GLTF/Vanta chunk in the observed network trace.

See [final visual report](FINAL-VISUAL-REPORT.md) for exact settings, fallback checks, size deltas and device-testing limits.
