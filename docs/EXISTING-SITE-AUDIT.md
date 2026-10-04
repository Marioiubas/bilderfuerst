# Existing site audit

Audit date: 2026-10-04. Public, read-only evidence is in `evidence/crawl.json` and its referenced HTML files. This is an owner-review build; prices and availability are a dated source snapshot. No payments or live orders are enabled.

Source: https://www.photostudio.de

Crawl combines the complete XML sitemap index, navigation, internal links and product variation links. The sitemap publishes 109 master/product URLs; variation URLs are additionally enumerated. Public crawl cannot establish unpublished/admin-only pages. Desktop and 390px mobile source storefront were visually inspected. Existing UX has a large image-based contact header, wrapping navigation, stacked service cards and no clear separation between lab, shop and heritage.

Identified ePages essence storefront, shop 78046715, STRATO WebRoot and legacy EP6 account/checkout paths. Five linked category URLs return 404: billingham-taschen, fineart-papiere, kleinbildfilme-135, rahmen, rollfilme-120. Shipping legal page says Nicht veröffentlicht. The appointment scheduler is absent from the HTML text but its real Calenso embed appears in the public hydration data. The direct widget was opened and verified visually; no booking was submitted.

Final catalog: 109 source master/product records plus 31 genuine variation records, 140 exact product URLs. 265 original image assets were downloaded successfully and optimized locally. The public crawl retains 196 response records, including repeated final cart/robots requests; this is not a count of independent products.

No order was placed, no product added to the original cart, no login attempted, and no owner systems changed.
