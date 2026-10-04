# Review build verification

Source snapshot: 04 October 2026. Final verification: 05 October 2026. Local optimized build at http://127.0.0.1:3000. No original-shop cart, booking or order was submitted.

## Build and source integrity

| Check | Result |
|---|---|
| Next.js optimized production build | Passed |
| TypeScript | Passed |
| Catalog/evidence verification | Passed: 109 master/product records and 31 variants |
| Exact source prices, IDs, stock, option labels, links and product assets | Passed |
| Route sweep | 189/189 HTTP 200 after intended alias redirects; exactly one H1, noindex and meaningful content |
| npm dependency audit, including development dependencies | Zero reported vulnerabilities |

The shop renders at request time so its initial HTML includes the heading and catalog rather than just a loading placeholder. Source-derived prices are a dated snapshot, not evidence of live inventory synchronization.

## Browser and visual checks

Desktop and mobile render checks covered the homepage, shop, development configurator, digitization, FineArt, services, history, gallery, contact, lab and Pentax product detail. All eleven views had no horizontal overflow; desktop images loaded successfully and each view had one primary heading. Screenshots are retained in `evidence`. The homepage, mobile hero, development configurator, product detail and illuminated gallery were visually inspected.

Verified interaction results:

- 35mm C-41/JPG resolves to the exact source variant at €12; 110 C-41/TIFF €30 and 110 B&W/TIFF €35. Unsupported 110 E-6/Push-Pull options are absent.
- Cart addition, readable variant labels, quantity changes, subtotal calculation, item removal, storage and actual page-refresh persistence work. Direct browser check: two €12 development items remain after refresh, total €24. Escape closes the dialog and restores focus to the add button.
- Checkout payment control is disabled and the main content has no customer/payment input or form. Unavailable products cannot be added.
- Multiword search finds real Portra 400 products; 120 and zero-price filters narrow results. Reset restores all 107 active review products.
- Product image enlargement and search dialog work. Gallery prints open an accessible enlarged view. Mobile navigation and filter panel open correctly.
- FineArt selection of 30 × 45 cm displays the source €24.50 price. Digitization selection switches to Audio and its real service description.
- One active Vanta canvas on desktop; zero after the hero scrolls offscreen; zero on mobile. Reduced motion leaves the heading visible and gallery frames static, with zero WebGL canvases.
- Compare's native keyboard slider changes from 50 to 51 with ArrowRight. Anime contact-sheet arrangement changes its accessible pressed state.
- Homepage widths 360, 375, 390, 430, 768, 1024, 1280 and 1440 have no horizontal overflow.

The native `agent-browser` CLI stalled during several keyboard/navigation sequences. Its successful checks and timeout are preserved in `evidence/browser-qa.json`; this is **not a completely passing CLI suite**. The affected flows and remaining motion/responsive checks were verified using the independent Codex in-app browser and recorded in `evidence/direct-browser-qa.json`. No application changes were inferred from a stalled driver. A reduced-motion hydration warning found earlier was corrected by keeping the first gallery render consistent with the server.

## Production gates

This remains an owner-review storefront. No live backend, payment, shipping/tax computation, inventory update, customer account, email receipt or order reconciliation has been integrated or accepted. Source legal text and image permissions require owner review. The conflicting legal emails/VAT IDs and unpublished shipping page are documented. Calenso and Maps links were verified without submitting a booking.

No Safari/iOS hardware run, WCAG certification, measured Core Web Vitals or production performance score is claimed. No original business domain was moved. See `OWNER-CONFIRMATION-LIST.md` for the concrete full-commerce launch gates.

## Public publication update · 05 October 2026

At the user's explicit request, the review site was published to https://bilderfuerst.vercel.app and the source to the public https://github.com/Marioiubas/bilderfuerst repository. Vercel reports a READY production deployment. Access protection is disabled for this project, and an unauthenticated HTTP request returns 200.

The public route sweep passes 189/189 routes. Direct browser checks confirm one active desktop Vanta canvas, no horizontal overflow or broken images, the real €12 C-41/JPG variant, a working preview cart and a disabled checkout with zero customer/payment forms. The browser console contains no errors in this check; the initial Vercel error/fatal log scan has no matching rows. No external log drain or continuous monitoring service is configured. See `PUBLIC-DEPLOYMENT.md` and `evidence/public-*` for the publication record. This publication does not enable live orders or establish pending asset rights.
