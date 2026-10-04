# URL migration map

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

Retain /p/[slug] including public source variation slugs. Retain /c/shop/[...slug], /i/[slug], /l/[slug] as first-class rendered routes; navigation uses the concise primary destinations.

Source category aliases resolve to the catalog and only verified categories are navigated. /i/wir-digitalisieren → /digitalisierung; /i/galerie → /galerie; /i/unsere-geschichte → /geschichte; /i/kontakt-und-oeffnungszeiten → /kontakt. Keep service-detail URLs where no exact redesign replacement exists.

No live-domain redirect has been changed. Before production, validate the complete source URL list against staging and owner-approved destinations. Broken originals need explicit replacement mapping, never homepage blanket redirects.
