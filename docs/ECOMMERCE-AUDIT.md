# Commerce architecture

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

Evidence identifies ePages/STRATO, not Shopify or WooCommerce. Embedded public state exposes product GUIDs and REST self/variation links under /rs/shops/78046715. Those links do not establish authorization for a new production frontend.

Chosen path: preserve ePages as source of truth. Build Next.js owner-review storefront with dated source snapshot and a review-only cart. Every PDP/configuration retains an exact source product/variant link where real commerce remains available. Cart content is not claimed to transfer cross-domain.

Pending: API/export authorization, CORS/session strategy, cart/checkout adapter, tax/shipping/coupon/account integration, emails and reconciliation. No replacement backend selected and no custom payment capture.
