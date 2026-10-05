# Public review publication

Verified on 05 October 2026 following the user's explicit instruction to create a new public GitHub repository and deploy the site publicly to Vercel.

| Property | Verified value |
|---|---|
| Public website | https://bilderfuerst.vercel.app |
| Public repository | https://github.com/Marioiubas/bilderfuerst |
| Repository visibility / branch | PUBLIC / main |
| Vercel project | bilderfuerst / prj_cD8pDIKUPeykuvSAyO4DGRTA5xig |
| Vercel team | marioiubas-projects |
| Initial verified deployment | dpl_5DGPzFbBSU6nKnwmifkhXPGeg2xV |
| Deployment target / state | production / READY |
| Source commit | d855251590aea2814333bd4e9ec73f689983d752 |
| Framework / Node | Next.js / 24.x |
| Cloud build duration | 36 seconds, reported in Vercel build log |
| Git integration | Marioiubas/bilderfuerst, production branch main |
| Project SSO / password protection | disabled / disabled |
| Unauthenticated access | HTTP 200, no token or bypass URL |

GitHub accepts ASCII repository names, so the German transliteration `bilderfuerst` is used for platform names. The brand remains Bilderfürst throughout the site.

## Verification

- `evidence/public-route-qa.json`: all 189 public routes return 200 after intended redirects, with one H1, meaningful content and the review noindex directive.
- `evidence/public-headers.txt`: ordinary unauthenticated HTTP response from the public alias.
- `evidence/public-live.jpg`: direct public browser screenshot of the deployed homepage.
- Direct browser: one active desktop Vanta canvas, no horizontal overflow or broken images. The 35mm C-41/JPG configuration resolves to €12 and the exact existing-shop variant link. The preview cart and checkout render correctly. Payment is disabled; the checkout main content has zero customer/payment inputs or forms. Verification item removed afterwards.
- Direct browser console: no error entries during the checked public flow.
- Initial Vercel runtime scan, production deployment, preceding hour: no matching error/fatal log rows. This is a bounded observation, not a continuous uptime guarantee.
- Native Vercel logs remain available; no external log drains or error-tracking service are configured.

The publication notes and reusable remote route checker are pushed after this initial verified deployment. Vercel automatically builds the updated `main`; the final deployed commit is checked separately at handoff.

## Review mode

The public URL requires no login, while the site remains a labelled DEMO / OWNER REVIEW with source prices and stock dated 04 October 2026. The cart is local and creates no order; checkout collects no personal or payment data. Pages retain noindex. Public accessibility does not imply search-engine indexing or live commerce.

The original merchant site and business domain remain untouched. Asset rights, legal inconsistencies, owner API access, tax/shipping/payment behavior and sandbox order acceptance remain in `OWNER-CONFIRMATION-LIST.md`. Public review publication does not establish those approvals.

## Photographic and Higgsfield update · 05 October 2026

Visual code commit `fc0b93c8c25b21b009354f1133e3b94f4e9b36f1` reached `READY` in production as `dpl_Az9CE8JFhKwUfQQJD6jWSvDmM3xe`. The public alias serves the new optical section and six Higgsfield props. Ordinary anonymous access is HTTP 200, and all 189 public routes pass. Live aperture playback and disabled checkout were verified directly. [Evidence](evidence/visual-after/public-release.json) and [32-point visual report](FINAL-VISUAL-REPORT.md).

These evidence notes follow the verified visual code. A final Vanta cleanup guard handles an already detached canvas, with 38/38 interaction checks passing. The exact final Git-linked deployment is checked at handoff. All review, noindex and no-payment boundaries remain.

## Cinematic remake · 05–06 October 2026

Pushed to `main` at the user's request ("push to GitHub … deploy to Vercel and make visible to public"). Repository Marioiubas/bilderfuerst remains PUBLIC; Vercel's Git integration built each push to production (GitHub deployment statuses: `76c020b` production `success`, `9c6e3dc` production `success`, followed by this documentation commit). The public alias https://bilderfuerst.vercel.app answers anonymously with HTTP 200 and serves the remake; `noindex, nofollow`, the DEMO / OWNER REVIEW banner and disabled payment are unchanged. Live route sweep: **190/190** ([public-route-qa.json](evidence/remake/public-route-qa.json)). Live Lighthouse before/after: [REMAKE-REPORT.md §38](REMAKE-REPORT.md#38-performance-beforeafter). Note: this session's Vercel connector could not read the project (403/404), so deployment state was verified through GitHub deployment statuses and direct HTTP checks.
