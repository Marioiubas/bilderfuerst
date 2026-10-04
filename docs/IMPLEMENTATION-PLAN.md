# Implementation plan

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

1. Complete public sitemap/navigation/product and variation audit, save raw evidence.
2. Verify Anime.js/Vanta/Three official sources and npm versions; initialize shadcn registry and install six selected components before design implementation.
3. Build Next.js/TypeScript App Router with source-backed catalog data and exact source links.
4. Build darkroom homepage, calm searchable/filterable shop, product routes, genuine variant-based development configurator, review cart and disabled checkout.
5. Build source-derived service/history/gallery/contact/legal destinations.
6. Apply motion ownership, WebGL lifecycle and reduced-motion/touch fallbacks.
7. Validate production build/types, desktop/mobile key flows, all routes/assets, no-payment behavior and focus management.
8. Deliver local review URL, source evidence, validation result and explicit production blockers. No deployment or original-domain changes inferred.

Completed: the owner-review build and optimized local preview are implemented. All 189 routes pass the production sweep, source catalog checks/types/build pass, and visual plus direct browser checks cover the core flows and motion fallbacks. See `QA-REPORT.md` for evidence and the CLI-driver limitation. Production commerce remains gated on owner access and acceptance.
