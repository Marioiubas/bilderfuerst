# Product image audit: larger renditions

Audit date: 2026-10-06. Scope: every image referenced by `lib/catalog.json` (140 products, 254 product image files in `public/images/`).

## Result

photostudio.de's image service does **not** serve larger renditions of product photos. All 73 distinct source files behind the 98 product images under 1000 px are already stored locally at the full size the shop owner uploaded. No `-l` rendition was added for any product image (0 upgrades, 0 bytes added). Very small photos (for example Kodak Portra 160, 300 x 300 px) can only be improved by **larger originals supplied by the owner**. No image was generated, upscaled or altered.

## Method

1. **Inventory.** Every catalog image was measured with `sharp` in `public/images/` and mapped through `docs/evidence/asset-manifest.json` to its source URL (all 254 have a manifest record). The local originals in `docs/evidence/assets/*.original` were compared: for every image under 1000 px the webp has exactly the size of the downloaded original (no downscaling at import). The 38 images at 1400 px come from originals up to 1920 px that were capped at import (see appendix).
2. **How product images are addressed.** Product photos are served from the legacy path `/storage/images/image?remote=<WebRoot URL>&shop=78046715[&width=600&height=2560]`, where `remote` points to `/WebRoot/Store30/Shops/78046715/.../<file>.jpg`. Only newer content images (store, lab, scans) sit in the hash store `/storage/images/<file>?hash=...`, where `width=2400` returns genuinely larger renditions. No catalog product image uses the hash store. The shop's own data (`catalog-raw.json` `image.width/height` and the product page JSON) states `"width":300,"height":300` for Portra 160.
3. **Probing** (read-only GET requests to photostudio.de only, sequential, 300 ms delay, 504 retried once). For each distinct source:
   - image service with `width=2400&height=2560`, `remote` URL unchanged;
   - the WebRoot URL directly;
   - for sources with an ePages thumbnail suffix (`...-420Wx420H.jpg`, `515Wx515H-...`) also the presumed unsuffixed original (directly and via the service).
   Total 168 requests for product images, plus 7 manual pre-tests on Portra 160, 15 for the non-product side check and 20 for the follow-up below.
4. **Acceptance rule** for an upgrade: returned size >= 1.3 x current longest side, aspect ratio within 1 %, same picture. No candidate came close.

## What the image service does

- `width=...` only shrinks (`width=150` returns 150 x 150); it never enlarges beyond the stored original. `width=2400` and `width=600` return identical bytes for product images.
- The direct WebRoot file has the same pixel size as the service output (Portra 160: WebRoot JPEG 300 x 300, 15,266 B; service 300 x 300, 14,865 B).
- The presumed unsuffixed originals do not exist: direct fetch returns `404`; the service answers `200` with an identical 400 x 400 "not found" placeholder (SHA-1 `79a193226263`, 5 times). Those responses were discarded.
- Across all 73 sources: **73 returned the same size as the local file, 0 returned larger, 0 failed.**

## Size distribution (longest side), before and after

No product image was added or changed, so before equals after.

| Longest side (px) | Product image files (254) | Primary image per product (140) |
|---|---|---|
| ≤ 300 | 4 | 4 |
| 301–400 | 0 | 0 |
| 401–600 | 28 | 22 |
| 601–800 | 66 | 54 |
| > 800 | 156 | 60 |

Under 1000 px: 98 files from 73 distinct source photos (several product variants share one photo); 80 of 140 primary images.

## Upgrades

| Product | Old size | New size | Bytes |
|---|---|---|---|
| none | | | 0 |

## Images that remain small (ask the owner for larger originals)

These source files are the largest the shop holds. Sorted by urgency, smallest first. "webp files" is the number of files in `public/images/` that come from the same source photo (variants share one photo).

### Urgent: longest side <= 300 px (4 source photos)

Visibly soft above about 150 CSS px on a 2x display. Ask for originals of at least 1200 px.

| Product | Source file | Native size | webp files |
|---|---|---|---|
| Kodak Colorplus 200 135/36 Film | `colorplus200.jpg` | 300×300 | 1 |
| Ilford SFX 200 135/36 Infrarotfilm | `Ilford-SFX200.jpg` | 300×300 | 1 |
| Kodak Gold 200 135/36 Film | `Kodak-Gold.jpg` | 300×253 | 1 |
| Kodak Portra 160 120 Rollfilm | `Kodak-Portra-160-120.jpg` | 300×300 | 1 |

### High: 301 to 600 px (24 source photos)

| Product | Source file | Native size | webp files |
|---|---|---|---|
| Polaroid Color 600 Sofortbildfilm | `101268.jpg-C-420Wx420H.jpg` | 339×420 | 1 |
| Polaroid Color 600 Sofortbildfilm Doppelpack | `106173.jpg-420Wx420H.jpg` | 322×420 | 1 |
| Kodak Ektachrome E100 120 Dia-Rollfilm | `108413.jpg-420Wx420H.jpg` | 420×316 | 1 |
| Ilford XP 2 super 135/36 Kleinbildfilm | `60044a.JPG-420Wx420H.jpg` | 420×359 | 1 |
| Fujifilm Provia 100 F 135/36 Kleinbildfilm | `Provia_100f_135.jpg` | 420×377 | 1 |
| Kodak Ultra Max 400 135/36 Film | `Ultramax_36.jpg` | 420×300 | 1 |
| Fujifilm Velvia 100 135/36 KB-Diafilm | `Velvia_100.jpg` | 420×377 | 1 |
| Ilford Delta 3200 Professional Mittelformat | `ilford-delta-3200-44193.jpg` | 450×450 | 1 |
| CINESTILL 50D C-41 135/36 | `cinestill-dayligth50.jpg` | 480×480 | 1 |
| Agfa Photo APX 400 135/36 Film | `6D10/15A3/1.jpg` | 500×500 | 1 |
| ILFORD Pan F Plus 50 Schwarz-Weiß Film 135/36 | `6D10/81BD/1.jpg` | 500×500 | 1 |
| Kodak Ektar 100 135-36 | `Ektar100-135.jpg` | 500×500 | 1 |
| Fujifilm Instax Wide monochrome SW-Sofortbildfilm mit 10 Aufnahmen | `102048.jpg` | 472×515 | 1 |
| Fujifilm Instax WIDE EVO black EX D Sofortbildkamera | `515Wx515H-121634-01.jpg (+6 more photos)` | 515×515 | 7 |
| Polaroid B&W SX-70 | `polaroid-bw-schwarz-weiss-film-fur-sx-70-15534846464740304.jpg` | 427×525 | 1 |
| Negativ Scan (Ganze Rollen) (+4 variants) | `1256.jpg` | 536×357 | 5 |
| ILFORD HP5 Plus 400 Schwarz-Weiß Film 135/36 | `6D0B/E779/1.jpg` | 600×600 | 1 |
| ILFORD FP4 Plus 125 Schwarz-Weiß Film 135/36 | `Ilford-FP4Plus-135.jpg` | 600×484 | 1 |

### Medium: 601 to 999 px (45 source photos)

Fine for cards and the product page (about 600 px); soft in a full-screen lightbox on large displays. Ask for at least 1600 px.

| Product | Source file | Native size | webp files |
|---|---|---|---|
| CineStill 400D Mittelformat | `Screenshot_2023-04-03_at_10-13-39_CINESTILL_400D_120.png` | 613×559 | 1 |
| Filmentwicklung Kleinbild (+12 variants) | `Filmentwicklung-Web.jpg` | 640×640 | 13 |
| Filmentwicklung Mittelformat (+9 variants) | `FilmentwicklungMF-Web.jpg` | 640×640 | 10 |
| ZINE Jason Connelly - 21 | `6D0B/1760/1.jpg (+2 more photos)` | 712×712 | 3 |
| ZINE Pete Falkous - Great British Holiday | `6D10/2A3F/1.jpg (+2 more photos)` | 712×712 | 3 |
| ZINE Alessandro Iotti & Davide Soldarini - Carpathians | `6D10/3DAF/1.jpg (+3 more photos)` | 712×712 | 4 |
| CineStill 400D 36/135 Kleinbildfilm | `68506.jpg` | 750×750 | 1 |
| ADOX ADOFIX Plus Expressfixierer 500 ml Konzentrat ADOX ADOFIX Plus Expressfixierer 500 ml | `ADOFIX-plus-500ml.jpg` | 750×750 | 1 |
| Bild 1 - ADOX ADOFLO II Netzmittel 500 ml Konzentrat ADOX ADOFLO II Netzmittel 500 ml Konzentrat | `ADOFLO.jpg` | 750×750 | 1 |
| ADOX ADONAL 500 ml Konzentrat Schwarz Weiss Filmentwickler | `ADONAL.jpg` | 750×750 | 1 |
| ADOX Adotech IV für bis zu 6 Kleinbild oder Rollfilme 100 ml Konzentrat | `Adox-Adotech-IV-Entwickler.jpg` | 750×750 | 1 |
| ADOX D-76 Filmentwickler zum Ansatz von 1000 ml | `ADOX-D-76.jpg` | 750×750 | 1 |
| ADOX XT-3 Developer zum Ansatz von 1000 ml | `ADOX-XT-DEV.jpg` | 750×750 | 1 |
| 110 Professional (HC 110) Schwarz Weiss Entwickler | `impex-110.jpg` | 750×750 | 1 |
| KODAK PROFESSIONAL D-76 zum Ansatz von 1000 ml | `Kodak-D76-1000.jpg` | 750×750 | 1 |
| KODAK EKTACOLOR PRO 160 135/36 | `kodak-ektacolor160.jpg` | 750×750 | 1 |
| KODAK EKTACOLOR PRO 800 135/36 | `kodak-ektacolor800.jpg` | 750×750 | 1 |
| Kodak Kodacolor 100 Color Negative Film 135/36 | `kodak-kodacolor100.jpg` | 750×587 | 1 |
| KODAK Kodacolor 200 Color Negative Film 135/36 | `kodak-kodacolor200.jpg` | 750×672 | 1 |
| Kodak Portra 400 120 Rollfilm | `Kodak-Portra-400-120.jpg` | 750×750 | 1 |
| Kodak Portra 400 135-36 Film | `Kodak-Portra-400.jpg` | 750×750 | 1 |
| Kodak Portra 800 135-36 Film | `Kodak-Portra-800-film.jpg (+1 more photos)` | 750×750 | 2 |
| Kodak Portra 800 120 Rollfilm | `Kodak-Portra800-120.jpg` | 750×750 | 1 |
| Kodak T-Max 400 Kleinbild 35mm ABLAUFDATUM 12/25 | `Kodak-TMAX400.jpg` | 750×750 | 1 |
| ILFORD HP5 Plus 400 Schwarzweißfilm, 120 | `lford-HP5-Rollfilm.jpg` | 750×750 | 1 |
| MOERSCH Alkalischer Fixierer ATS für Stainende Entwickler 1000 ml Konzentrat | `Moersch-ATS.jpg` | 750×750 | 1 |
| ADOX SILVERMAX Entwickler 100 ml Konzentrat | `Silvermax.jpg` | 750×750 | 1 |
| ZINE Sebastian Schweers - Urban Immobility | `6D10/2A14/1.jpg (+2 more photos)` | 769×769 | 3 |
| ZINE Bob Price - Lust to Thrive | `6D10/2AD3/1.jpg (+2 more photos)` | 769×769 | 3 |
| ILFORD Delta 400 Schwarz-Weiß Film 135/36 | `Ilford-Delta-400-135.jpg` | 800×800 | 1 |
| ILFORD Multigrade Entwickler für Schwarzweiß-Fotopapier 1 Liter | `ilford31.jpg` | 800×800 | 1 |
| ILFORD Ilfostop 500 ml | `ilford46.jpg` | 800×800 | 1 |
| ILFORD Rapid Fixer 1 Liter | `ilfordRapidFixer.jpg` | 800×800 | 1 |

Display note: until larger originals exist, the lightbox and product page should not stretch these images beyond their native pixel size (cap `max-width` at the native width or limit lightbox zoom) rather than force an enlargement.

## `lib/image-renditions.json`

The file maps 16 non-product pairs: the 11 genuine renditions that already existed (aspect ratios within 0.25 % of the small image) and the 5 added in the follow-up below. Existing: `store-front`, `store-inside`, `film-rolls`, `film-shelf`, `lab-scan`, `lab-film`, `history`, `scan-adonal`, `scan-silvermax`, `scan-d76`, `scan-hc110`. Added: `ice-sample-with`, `ice-sample-without`, `print-kiosk-screens`, `slide-in-glove`, `slide-magazine-macro`. No product images are in it because none has a larger rendition.

Note: `public/images/jobo-lab-kit-l-1500-l.webp` is **not** a rendition. It is the product photo of the "JOBO LAB Kit 1500 L" (the slug happens to end in `-l`), so it is not in the mapping.

## Follow-up (approved 2026-10-06): five non-product renditions added

The 15 hash-store images without an `-l` variant were probed first (nothing saved). Five of them have sources much larger than the 1400 px import cap. A request with `width=2400` only shows 2400 px; a request without a width parameter (or `width=6000`) returns the stored original. The five originals are byte-identical (SHA-1 checked) to the files already in `docs/evidence/assets/<name>.webp.original`; they were fetched again with read-only GETs, 4 per image, and saved as `<name>-l.jpg.original`.

| Image | Native | Old webp | New `-l` webp | `-l` bytes | Original bytes |
|---|---|---|---|---|---|
| `ice-sample-with` | 2500×2000 | 1400×1120 | 2000×1600 | 78,860 | 373,784 |
| `ice-sample-without` | 2500×2000 | 1400×1120 | 2000×1600 | 82,380 | 371,740 |
| `print-kiosk-screens` | 6000×4000 | 1400×933 | 1600×1067 | 56,242 | 1,761,596 |
| `slide-in-glove` | 2500×2000 | 1400×1120 | 1600×1280 | 66,420 | 456,655 |
| `slide-magazine-macro` | 2500×2000 | 1400×1120 | 1600×1280 | 69,516 | 374,797 |

Encoding: Lanczos3 resize only, WebP quality 81, no sharpening. Fidelity against a lossless resize of the original: PSNR 40.5 to 42.0 dB, max per-channel difference 16 to 19 on the ICE pair. The existing `<name>.webp` files were not touched. The two slide images gain only 1.14× linear (1400 to 1600 px) because of the 1600 px cap; their native 2500 px allows more if wanted.

The other 10 probed images (`store-exterior-*`, `store-interior-*`, `fuji-store-nuernberg-interior`, `scanner-ccd-sensor`, `logo-analog-store-*`) already match their original size, so no larger rendition exists. (`header-banner-logo-address` has no local webp; its source is 1200×300.)

### ICE pair registration (with vs without ICE5)

The scanner section aligns the without-ICE scan onto the ICE5 scan with scale × 1.0288 and offset (-13.9 px, +23.1 px) at 1400×1120 (components/digitization/ice-scan.tsx). The offset is stored there in percent of the image, so it carries over to any resolution of the same crop. Both new files are 2500×2000 at source and 2000×1600 after the resize, the same 5:4 crop with no cropping, so the relationship is unchanged by construction. It was also measured: least-squares / normalized cross-correlation on blurred greyscale, coarse-to-fine, starting from identity (no assumed values), same blur in proportion to width.

| Pair | scale | offset x | offset y | NCC |
|---|---|---|---|---|
| documented, 1400×1120 | 1.0288 | -13.9 px = -0.993 % of W | +23.1 px = +2.062 % of H | n/a |
| measured, existing 1400×1120 webps | 1.0295 | -14.0 px = -1.00 % | +19.6 px = +1.75 % | 0.99939 |
| measured, native 2500×2000 | 1.0292 | -24.6 px = -0.985 % | +35.3 px = +1.76 % | 0.99942 |
| measured, 2000×1600 `-l` webps | 1.0281 to 1.0292 (flat ridge) | -0.93 to -0.99 % | +1.76 to +1.84 % | 0.99939 |

Same normalized parameters give the same correlation at every size (documented values: 0.99905 at 1400, 0.99904 at 2000, 0.99907 at 2500). So the ~2.9 % scale difference and the relative x offset hold at the larger size. One difference to the documented numbers: the y offset measures about +1.75 % of the height (+19.6 px at 1400, +35.3 px at 2500, consistent across resolutions), which is 0.3 % of the height (about 3.5 px at 1400, 6 px at 2500) smaller than the documented +2.06 %. Blur and metric variations at 1400 gave +19.7 to +20.6 px, so this is not noise. The correlation difference is tiny (0.99905 vs 0.99939), so both look aligned, but the component's y offset may sit a few pixels low; worth a visual check at the larger size. The component was not changed. At 2500 px (native) the least-squares optimum for the percent form is: scale 1.0292, offset x -0.985 % of W, offset y +1.76 % of H.

## Appendix: 1400 px cap

38 catalog images (CineStill, Pentax 17, Phoenix, Fujicolor, workshop) were capped at 1400 px at import, as were the five non-product images above; their originals (up to 1920 x 718 or 1669 x 1080) are in `docs/evidence/assets/`. They are above 1000 px and outside this brief. If wanted, `-l` files up to native size can be re-encoded offline from them with no network access.

## Confirmation: image content unchanged

- No image was generated, upscaled, sharpened, retouched or otherwise altered; no AI tooling was used. The five new `-l.webp` files are plain Lanczos3 downscales of the shop's own originals.
- `public/images/<name>.webp` files and all existing `docs/evidence/assets/*` files are unchanged. New: five `public/images/*-l.webp`, five `docs/evidence/assets/*-l.jpg.original`, five records in `docs/evidence/asset-manifest.json` (the 291 existing records are unchanged).
- Other probe responses were used only for size comparison and are not in the repository.
- Also new: `lib/image-renditions.json` and this document.
- Access was read-only GET requests to `www.photostudio.de` (no forms, cart or login).
