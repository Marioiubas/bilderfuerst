# Product catalog audit

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

109 product URLs in six product sitemaps. Includes films, cameras, development, scan services, chemistry, Jobo, instant film, gift vouchers, books/zines and dated workshops. Every accessible public product is retained in the evidence set, including variation attribute values, exact IDs/slugs, prices, availability, delivery, descriptions and image URLs.

Do not count variations as independent catalog products. Past workshops are archived from primary merchandising, not silently treated as current. Configurable items are not quick-added without selection. Back-soon products remain discoverable and cannot be added to the review cart.

The source snapshot is transformed into typed storefront data in `lib/catalog.json`: 109 master/product records and 31 variation records. Variant names include exactly one real option label. Source IDs, prices, stock flags, variant relationships and exact purchase URLs are checked by `npm run verify`. The 140 product URLs remain accessible; past workshops are excluded from active merchandising.

This is not a live inventory sync. Production must refresh through owner-authorized ePages API/export.
