# Brand visual research

Research date: 2026-10-05. Evidence: the real photographs already in `public/images` (600 px previews of the live site; larger `*-l.webp` renditions were added by a parallel task and were not sampled here), the 15 new live-site assets added today (see "New assets"), and the live shop theme data. Everything here is sampled or read from the business's own material; no generated imagery and no third-party photography was used. Rights for all images remain "owner review only".

## Sources inspected

- Pages: https://www.photostudio.de/ (homepage, header banner, slider), `/i/unser-geschaeft`, `/i/galerie`, `/i/unsere-geschichte`, `/i/wir-digitalisieren`, `/i/negativ-digitalisierung`, `/i/dias-digitalisierung-1`, `/i/super8-normal8-16mm-35mm-kino`, `/i/alle-videokassetten-und-formate`, `/i/bewerbungsbilder-preise`; https://www.fuji-store.de/ (Impressum, home).
- Images viewed: `store-front`, `store-inside`, `film-rolls`, `film-shelf`, `lab-scan`, `lab-film`, `history`, `scan-adonal`, `scan-d76`, `scan-hc110`, `scan-silvermax`, four product shots (`jobo-multi-tank-2520`, `kodak-portra-400-135-36-film`, `pentax-17`, `ilford-hp5-plus-400-...`), the new store/lab images, three logo files and the header banner `bf.png`.
- Method: each image resized to 200 px, converted to CIELAB, 6-cluster k-means (k-means++ seed 7, 30 iterations), cluster colour = mean sRGB of its members, share = pixel share. Role filters (below) pick pixels by L*/chroma/hue and report the median colour. Shares of a few percent are real but small; saturated colour is rare in this business's own photography.

## Headline findings

1. **The physical evidence is neutral.** Store, signage, equipment and the B&W scans are black, graphite, grey and white (mean chroma 0 to 9 on the store and scan images). Colour comes only from products: Kodak yellow, Jobo red-orange, film-base brown, Fuji green, CineStill purple.
2. **The cream / olive / sage / terracotta family is not supported by the physical evidence.** No sampled image contains an olive, sage or terracotta field. Warm tones that do exist are small and specific: Kodak/film yellow (#E2A211), C-41 film mask brown (#703203, #744538), oak table (about #9D8E79) and sandstone facade (about #99918B, a warm grey). A khaki-tan cluster appears only in the Nürnberg store photo (#A29565, 6 %), most likely the third-party Billingham bag wall. The original shop's own theme is also monochrome: accent hsl(0, 0.8%, 48.6%) = #7D7B7B, border #060606, footer #EAEFF1, font Roboto Slab (theme "epages.essence:fresh"). Note: `docs/BRAND-DIRECTION.md` still describes warm paper #f5f3ec / ink #151611 / safelight orange #dc4d22, which is the same unsupported warm family; the committed CSS at HEAD (`app/photographic.css`: black #0b0d0e, graphite #15191c, silver #bbc1c2, print #fafaf7, red #c6322a, amber #d6a541, cyan #55bcc0) and the untracked `app/styles/tokens.css` already move toward black/graphite/silver with red/amber/cyan.
3. **Cyan has almost no physical basis.** Saturated teal/cyan pixels (chroma 22 or more) reach at most 0.2 % in any image (teal LED edge in `store-interior-aisle`, #4F8F86). The real "scan" colour is the desaturated steel blue of the scanned alpine slide (#496574, #516E7D in `ice-sample-with`) and the Noritsu logo blue (#1F3BAD to #314BB2). A saturated scanner cyan would be a UI choice, not brand evidence.
4. **The logo situation is split.** The site header uses a banner image (`bf.png`, 1200 x 300) that combines a wordmark "der bilderfürst fürth" with company address, phone, an email, opening hours, Instagram/eBay handles and four service labels, so it cannot serve as a logo. The actual current mark is the black-and-white "Analog Store - Bilderfürst Fürth" film-strip wordmark used in homepage graphics. The shop's favicon path (`/WebRoot/Store30/Shops/78046715//WebRoot/StoreTypes/7.23.0/Strato/favicon.ico`) returns 404; only the generic platform favicon exists at `/WebRoot/StoreTypes/7.23.0/Strato/favicon.ico` (894 bytes, not brand-specific).

## Per-image sampled palettes

### Existing real photos (`public/images`, 600 px previews)

| Image | Content / size | Mean L* / chroma | 6 dominant colours (hex, share) |
|---|---|---|---|
| `store-front` | 600x400 · Street window, black signage, FUJIFILM sign, framed prints | 42 / 4 | `#101012` 22% `#565655` 18% `#AAA6A3` 17% `#7D7C79` 16% `#363433` 14% `#D6D9DB` 13% |
| `store-inside` | 600x400 · Interior, black display wall, oak table, grey floor | 37 / 5 | `#0A0B0C` 29% `#A9A7A5` 18% `#7C7C79` 15% `#53524F` 15% `#2E2E2D` 15% `#E3D7CA` 9% |
| `film-rolls` | 600x400 · 35 mm cartridges macro on white shelf | 52 / 9 | `#CDC8BD` 29% `#A8A59D` 21% `#1E1F1E` 19% `#66655E` 14% `#493F2F` 10% `#A37928` 6% |
| `film-shelf` | 600x400 · Wall of film boxes (Kodak, CineStill, Fuji, Ilford) | 44 / 39 | `#792718` 25% `#3A2E2B` 21% `#6D659B` 21% `#E2A211` 20% `#C4B8B2` 9% `#1F8041` 4% |
| `lab-scan` | 600x400 · Noritsu scanner film gate with C-41 strip | 59 / 5 | `#D9D7D4` 30% `#06090D` 24% `#F3F3F1` 23% `#B0A5A0` 11% `#362E34` 8% `#744538` 4% |
| `lab-film` | 600x400 · Cartridges on white seamless | 80 / 3 | `#F3F2F2` 78% `#181918` 14% `#868785` 4% `#9A6416` 2% `#DD9F0F` 2% `#D7C08E` 1% |
| `history` | 600x171 · Triptych of old shopfront photos | 54 / 9 | `#626260` 25% `#A3A1A3` 23% `#E0DBD8` 18% `#2E2F2D` 18% `#B69B80` 12% `#914435` 5% |
| `scan-adonal` | 600x398 · B&W scan, Porsche 911, Adonal | 53 / 0 | `#878787` 26% `#686868` 20% `#E8E8E8` 18% `#434343` 14% `#B4B4B4` 11% `#171717` 11% |
| `scan-d76` | 600x398 · B&W scan, D-76 | 57 / 0 | `#8D8D8D` 24% `#6B6B6B` 20% `#EDEDED` 18% `#B6B6B6` 16% `#434343` 16% `#1B1B1B` 7% |
| `scan-hc110` | 600x398 · B&W scan, HC-110 | 50 / 0 | `#6D6D6D` 30% `#464646` 21% `#F0F0F0` 17% `#1F1F1F` 14% `#969696` 10% `#BFBFBF` 9% |
| `scan-silvermax` | 600x398 · B&W scan, Silvermax | 55 / 0 | `#8F8F8F` 27% `#6D6D6D` 19% `#EAEAEA` 17% `#464646` 14% `#B7B7B7` 12% `#171717` 10% |

### Existing product shots (for equipment and film colour only)

| Image | Content / size | Mean L* / chroma | 6 dominant colours (hex, share) |
|---|---|---|---|
| `jobo-multi-tank-2520` | product, Jobo tank | 58 / 14 | `#FEFEFE` 44% `#080505` 30% `#D43B22` 15% `#C86F60` 4% `#574F4D` 4% `#B5A9A5` 3% |
| `kodak-portra-400-135-36-film` | product, Portra 400 | 69 / 16 | `#FDFDFD` 50% `#161411` 22% `#E3B520` 12% `#7C594E` 9% `#DEAB20` 7% `#A6762B` 1% |
| `pentax-17` | product, Pentax 17 camera | 55 / 10 | `#CACBCA` 28% `#C5A56D` 21% `#1F1E1B` 21% `#969492` 16% `#797165` 8% `#4D4D49` 7% |
| `ilford-hp5-plus-400-schwarz-weiss-film-135-36` | product, Ilford HP5 box | 89 / 4 | `#F6F6F7` 73% `#D1D0CE` 14% `#4F4D4C` 7% `#0ED179` 4% `#51CB91` 1% `#ADE7CA` 1% |

### New assets (higher resolution)

| Image | Content / size | Mean L* / chroma | 6 dominant colours (hex, share) |
|---|---|---|---|
| `store-exterior-corner` | 1063x709 · Corner building, gable sign | 51 / 4 | `#AAABAA` 22% `#898885` 22% `#666562` 16% `#414140` 14% `#181B1F` 14% `#D4D4D2` 12% |
| `store-exterior-gallery-window` | 1063x709 · Window gallery, nine framed prints | 47 / 4 | `#BDBCBB` 20% `#7E7C78` 19% `#9B9A99` 18% `#16181B` 16% `#5A5A58` 14% `#383A3A` 13% |
| `store-interior-wide` | 1063x709 · Interior with X-SERIE wall, oak table | 38 / 4 | `#757574` 25% `#918D89` 23% `#0D0E0E` 18% `#525250` 16% `#2F3030` 14% `#CDD7DE` 4% |
| `store-interior-xserie-wall` | 1063x709 · X-SERIE display wall close-up | 33 / 5 | `#0D0D0E` 31% `#5F5B59` 21% `#343435` 20% `#8A8D8F` 12% `#BBBCBA` 10% `#C2A777` 7% |
| `store-interior-aisle` | 1063x709 · Interior aisle, teal LED edge | 46 / 5 | `#959594` 35% `#6F6F6C` 18% `#131315` 17% `#424242` 17% `#A99983` 8% `#D1D8DA` 6% |
| `fuji-store-nuernberg-interior` | 1000x667 · Fuji-Store Nürnberg interior | 40 / 8 | `#919187` 23% `#68655F` 22% `#3C3A37` 21% `#171413` 20% `#D0D0C0` 8% `#A29565` 6% |
| `print-kiosk-screens` | 1400x933 · Print kiosk screens, bokeh | 70 / 6 | `#E8E8E6` 45% `#C6CDCF` 20% `#0F0F0E` 11% `#B4AA90` 10% `#413A37` 8% `#81776A` 7% |
| `scanner-ccd-sensor` | 470x467 · CCD sensor in lens-mount ring | 38 / 5 | `#151518` 35% `#494E53` 26% `#8D9398` 17% `#E7E8E8` 16% `#575436` 3% `#331616` 2% |
| `slide-in-glove` | 1400x1120 · Mounted slide in cotton glove | 76 / 5 | `#FCFCF7` 36% `#F0ECF5` 28% `#605C60` 13% `#9E9AA0` 11% `#222021` 9% `#455384` 2% |
| `slide-magazine-macro` | 1400x1120 · Slide magazine macro, numbered slots | 62 / 4 | `#7C7C7E` 26% `#C4C2BF` 25% `#393735` 25% `#F8F8F9` 23% `#4585E0` 1% `#263762` 0% |
| `ice-sample-with` | 1400x1120 · Scanned slide crop, with ICE5 | 61 / 7 | `#A7A9AD` 31% `#ABADB5` 28% `#496574` 17% `#516E7D` 12% `#768B95` 7% `#909BA0` 4% |
| `ice-sample-without` | 1400x1120 · Scanned slide crop, without ICE | 57 / 8 | `#A5A7AC` 35% `#9FA2A6` 21% `#3F5B70` 20% `#48657A` 14% `#6E8391` 7% `#88939C` 4% |
| `logo-analog-store-white-on-black` | 1176x784 · Analog Store logo, white on black | 13 / 0 | `#000000` 85% `#FEFEFE` 10% `#363636` 1% `#626262` 1% `#CACACA` 1% `#969696` 1% |
| `logo-analog-store-black-on-white` | 614x403 · Analog Store logo, black on white | 93 / 0 | `#FFFFFF` 89% `#1E1E1C` 7% `#DBDBDA` 1% `#7A7A7A` 1% `#AEAEAE` 1% `#444443` 1% |

## Material samples (camera-rendered, exposure dependent)

| Material | Sample | Where |
|---|---|---|
| Black glossy signage panel (acrylic/glass, white text) | `#0B1015` | `store-exterior-gallery-window` |
| Sandstone facade (beige-grey ashlar) | about `#99918B` | `store-exterior-gallery-window` |
| Solid oak table top with black steel legs | about `#9D8E79` | `store-interior-wide` |
| Speckled granite-effect floor tile | about `#747775` | `store-interior-wide` |
| Photographic black (display wall, cabinets) | `#0A0B0C` (29 % of `store-inside`), `#0D0D0E` (31 % of `store-interior-xserie-wall`) | store interior |

## Materials

- **Black:** glossy black acrylic or glass signage panels with white lettering and visible reflections; black laminate display wall with white "X-SERIE" lettering; black steel table legs and thin black steel partition profiles; black rubber floor mat printed in white ("Wir digitalisieren ... Super 8, Normal 8, 9,5 Pathé, 16mm Film, Video-Kassetten, Dias, Bilder, Negative").
- **White:** white powder-coated window frames, white mats inside thin black frames (nine prints in a 3 x 3 grid), white lacquered cabinets, the white Noritsu machine body (#F3F3F1), white seamless backgrounds in product shots.
- **Silver and glass:** brushed stainless-steel cylinder under the oak table, steel hooks and shelf rails, full-height glass shopfront and glass partitions, silver camera top plates, grey slide magazines, the silver CCD lens-mount ring.
- **Floors and wood:** speckled grey granite-effect tiles (Fürth); polished resin/concrete with an oak stair (Nürnberg); solid light oak table tops.
- **Facade:** warm grey-beige sandstone ashlar corner building with white window frames, cobblestone pavement, a dark awning.

## Light characteristics

- Interior: flat, high-key ambient light from linear cool-white LED strips in a low white ceiling; cool grey cast on tiles; no dramatic shadows. Display cabinets are lit warm-white inside with a thin teal-green LED edge line on the Fuji X-SERIE cabinet (also visible as a green wall panel in the Nürnberg store).
- Street window: the nine prints are lit by small spot lights on the sill; mats read as pale panels inside black frames; glass shows street reflections (shot in overcast daylight on 2018-03-12).
- Product and lab shots: studio-white seamless, soft shadows (mean L* 69 to 89), or macro with shallow depth of field on a white shelf (`film-rolls`, L* 52); the Noritsu photo is bright white with a hard black film gate.
- B&W scans: wide tonal range from #171717 to #E8E8E8, no tint (chroma 0); the Tri-X street scenes were shot in diffuse daylight.

## Typographic patterns seen

- Signage: heavy lowercase grotesque sans "bilderfürst" (white on black gable, with a smaller bold "Digitale Bilder Sofort"), small light-weight white sans service list on black panels ("Bilderservice, Passbilder, Bewerbungsbilder, Digitalisierung, Geschenkartikel, Fotozubehör"), a script-like "fine Art Printing" mark.
- Current logo: extra-heavy geometric sans "Analog" over a larger "Store", with a small regular-weight "Bilderfürst Fürth" at right; the capital A carries a film-perforation strip on its left stroke. Strictly black and white.
- Header banner: bold italic Arial-style "der bilderfürst fürth" with centred small body text; spreadsheet screenshots (Arial) for all price tables.
- Digitization banner: light white sans "Wir digitalisieren" with a film-leader countdown (3, 2, 1) on a grey filmstrip, black background.
- Wide-tracked uppercase sans for "X-SERIE"; product packaging supplies the colour typography (Kodak black on yellow, Ilford black/green, CineStill script).
- The original shop theme sets all text in Roboto Slab (serif), unrelated to the physical signage.

## Equipment colours

Noritsu scanner: white body #F3F3F1, black metal film gate #06090D to #0B0D12, blue "NORITSU" logo (#1F3BAD to #314BB2). Jobo Multi Tank: black body (#080505) with red-orange lid (#D83A1F). Slide magazines: mid-grey plastic (#7C7C7E to #C4C2BF) with white numerals. Pentax 17: near-black body (#1F1E1B) with mid-grey metal parts (#969492), photographed on an oak surface (#C5A56D). CCD sensor ring: silver (#8D9398) around a black housing (#151518). Fuji displays: black cabinets, warm-white shelf light, teal-green edge line. Print kiosk: white and pale-grey housings.

## Store architecture

Fürth: ground-floor corner shop at Schwabacher Straße / Alexanderstraße in a sandstone corner building; a gable-shaped black sign over a recessed glass entrance, two black signage panels flanking the door, a corner shop window (the Street Gallery) with a white fascia and "X Store / FUJIFILM" signs, a second narrower window with an awning. Interior: one deep room with a low white ceiling and linear lights, glass-and-steel partition to the lab area at the back, a black X-SERIE wall on the right, an oak table in the middle. Nürnberg (Fuji-Store, Adlerstraße 34): double-height space with an oak stair and mezzanine, bag wall with Billingham bags, green accent wall.

## Historic motifs

`history.webp` (undated triptych): a white shopfront with red-yellow "Farbfotos" signage, a black-and-white "FOTO" facade, an interior with a red-and-yellow counter. Palette: grey #626260, ivory #E0DBD8 / #F2E8DB, warm tan #B69B80, sign red #9D3322 / #914435. Use as monochrome archive imagery (the preview already applies grayscale).

## Technical motifs

Film perforations and sprocket strips (logo, banner, scanner photo), numbered slide-magazine slots, CCD sensor in a mount ring, Noritsu film gate, countdown leader numerals, reel-size infographics (grey reels with red measurement lines on black), spreadsheet-style price grids, Jobo rotation tank dials.

## Film-specific visual language

C-41 negatives carry an orange-brown mask (#744538 / #703203); Kodak packaging is saturated yellow with black type (#E2A211, #E2B31F); Ilford uses white with green (#0ED179); Portra boxes purple; CineStill purple/blue/white; Fujifilm green (#01943D / #1F8041). The wall of boxes (`film-shelf`) is the single multi-colour image the business owns: red #792718, near-black #3A2E2B, violet #6D659B, yellow #E2A211, green #1F8041. Slide film shows as blue-cast transparency inside white/grey frames; B&W scans are pure neutral.

## Candidate colour roles (sampled, not invented)

| Role | Candidate 1 | Candidate 2 | Candidate 3 | Notes |
|---|---|---|---|---|
| Photographic black | `#0A0B0C` (store-inside, 29 %) | `#0D0D0E` (store-interior-xserie-wall, 31 %) | `#101012` (store-front, 22 %) | Cool blue-black on glossy panels (#0B1015); matches current token #0a0b0c. |
| Graphite | `#343230` (fuji-store-nuernberg-interior) | `#333436` (store-interior-xserie-wall) | `#2E2E2D` (store-inside) | `#494E53` (scanner-ccd-sensor) is the lighter equipment graphite. |
| Photo-paper white | `#F3F3F1` (Noritsu body, lab-scan) | `#F6F6F6` (lab-film seamless) | `#FCFCF7` (slide-in-glove, mount) | Also `#F6F6F7` (Ilford box). Never pure #FFFFFF except logos. |
| Silver | `#A9A7A5` (store-inside, tile/glass) | `#8D9398` (scanner-ccd-sensor, mount ring) | `#C4C2BF` (slide-magazine-macro) | `#969492` (pentax-17 metal parts) for mid-grey metal. |
| Darkroom red | `#D83A1F` (jobo-multi-tank-2520 lid) | `#CC2B23` (film-shelf box) | `#9D3322` (history sign) | Red-orange equipment red; the store itself has no red. A deep safelight red has no direct sample. |
| Negative amber | `#E2A211` (film-shelf, Kodak yellow) | `#E2B31F` (kodak-portra-400 box) | `#DD9B0C` (lab-film cartridge) | Film-base brown `#703203` (film-shelf), `#744538` (lab-scan strip) as the dark end. |
| Scanner cyan | `#4F8F86` (store-interior-aisle LED, 0.2 %) | `#496574` (ice-sample-with, scanned slide blue-teal) | `#314BB2` (Noritsu logo blue) | Weak physical evidence; use sparingly and label as a UI device. Fuji green `#01943D` is a partner colour. |
| Archival ivory | `#E0D9CD` (print-kiosk-screens) | `#DBD3C4` (film-rolls highlights) | `#F2E8DB` (history, paper) | Small shares (1 to 5 %); `#F9F8EB` (slide frame, slide-in-glove). Use for archive/history panels only. |

## New assets added today (rights: owner review only)

All derivatives are WebP in `public/images` (max 1400 px wide, quality 82; logos lossless); originals are in `docs/evidence/assets/<name>.original`; records appended to `docs/evidence/asset-manifest.json`.

| Derivative | Shows | Source URL (no width parameter = native size) | Native size |
|---|---|---|---|
| `ice-sample-without.webp` | Slide crop scanned WITHOUT ICE (dust, hairs, scratches visible) | https://www.photostudio.de/storage/images/ice%20aus%20Semi%20Korrektur%20aus%20Auschnitt.jpg?hash=29aec5ebb7418f473aeeb12eb0d3d46aec4d1fe0&shop=78046715 | 2500x2000 |
| `ice-sample-with.webp` | Same slide area scanned WITH ICE5 (clean) | https://www.photostudio.de/storage/images/ice%20an%20Semi%20Korrektur%20aus%20Auschnitt.jpg?hash=b211e005b6f6b0fe86c922b75a9000abd00a7819&shop=78046715 | 2500x2000 |
| `store-exterior-corner.webp` | Fürth corner building, gable sign, door, signage panels (2018-03-12) | https://www.photostudio.de/storage/images/DSCF3616_20180312.jpg?hash=11cdcb0dc765794f6161a1bf2a6b9e307a3def57&shop=78046715 | 1063x709 |
| `store-exterior-gallery-window.webp` | Street Gallery window with nine framed prints, Fuji X Store signs (2018-03-12) | https://www.photostudio.de/storage/images/DSCF3617_20180312.jpg?hash=2429f957a8ccb6382a30b6f03460437e3b224817&shop=78046715 | 1063x709 |
| `store-interior-wide.webp` | Interior with X-SERIE wall, oak table, glass partition (2018) | https://www.photostudio.de/storage/images/DSCF3620_20180312.jpg?hash=adcfb5d92ef3a4ba70a71a141147ac0cbf13c8c3&shop=78046715 | 1063x709 |
| `store-interior-xserie-wall.webp` | X-SERIE display wall and frames (2018) | https://www.photostudio.de/storage/images/DSCF3625_20180312.jpg?hash=f03913dd24bc445589fa0d8474ef7e6b9c91ca10&shop=78046715 | 1063x709 |
| `store-interior-aisle.webp` | Second interior angle with teal LED edge (2018) | https://www.photostudio.de/storage/images/DSCF3629_20180312.jpg?hash=3689f3027e7e2cc0fd7c235471db849ebc246407&shop=78046715 | 1063x709 |
| `fuji-store-nuernberg-interior.webp` | Fuji-Store Nürnberg interior with Billingham bag wall, oak table, stair | https://www.photostudio.de/storage/images/001.jpg?hash=b3b08e579f0c4df060f9b7931f8b4aa70c15f1fa&shop=78046715 | 1000x667 |
| `print-kiosk-screens.webp` | Print kiosk screens, soft bokeh | https://www.photostudio.de/storage/images/Filmentwicklung5.jpg?hash=05d6e1975c8a958a01b35973255a1d6ab36fe327&shop=78046715 | 6000x4000 |
| `scanner-ccd-sensor.webp` | CCD sensor in a lens-mount ring (scanner head) | https://www.photostudio.de/storage/images/ccd1.jpg?hash=21128dd763853e7414694c671f941a115a82c3a1&shop=78046715 | 470x467 |
| `slide-in-glove.webp` | Mounted slide held in a cotton glove | https://www.photostudio.de/storage/images/Dia%20wei%C3%9Fe%20Seite%202500x2000.jpg?hash=bdcc48889a04c5a51327a4ae066bda903fe9ba30&shop=78046715 | 2500x2000 |
| `slide-magazine-macro.webp` | Slide magazine with numbered slots and a slide | https://www.photostudio.de/storage/images/dia%20richtig%20im%20Magazin%202500x2000.jpg?hash=f788b41bf3a46b1998e4114900663333d2e974ed&shop=78046715 | 2500x2000 |
| `logo-analog-store-white-on-black.webp` | Current logo, white on black (brand mark, not a photograph) | https://www.photostudio.de/storage/images/A_Logo_2%2010x15.jpg?hash=d415f46ea57dbded6b2e2da58704cdf77cd526de&shop=78046715 | 1176x784 |
| `logo-analog-store-black-on-white.webp` | Current logo, black on white (brand mark) | https://www.photostudio.de/storage/images/neues%20Logo.jpg?hash=cae7b8296a81c18ad60cbb0f0eb75eab52728808&shop=78046715 | 614x403 |
| (evidence only) `header-banner-logo-address.webp.original` | Header banner mixing logo, address, hours, email, handles; not for UI | https://www.photostudio.de/storage/images/bf.png?hash=c818ac288ab2361743062b46fd0d9b312c53507a&shop=78046715 | 1200x300 |

### ICE before/after pair: usage notes

- Genuine matched pair published by the business on `/i/negativ-digitalisierung` and `/i/dias-digitalisierung-1`: "Ausschnitt aus einem Dia (ca 15% des Dias von oben rechts)", "Es ist ein reales Bild und es wurde nichts verändert." Without ICE: dust, hairs and scratches clearly visible; with ICE5: nearly all gone. Subject: a blue-grey alpine ridge, no people.
- The two crops are not pixel-aligned: the "without" frame sits about 80 px higher at 2500 x 2000 (about 3.2 % of the height) with roughly 2 % scale difference (estimated by grid search). For a slider, shift the "without" image down about 3.2 % and scale about 1.02, or crop both by 5 % per edge; otherwise the ridge line will jump between layers.
- ICE works for colour material only; the pages state it is not possible for B&W.
- The credit on the page ("Aufnahme Olaf Wolf, Leica Kamera AG") relates to the full sample slide; confirm before publishing with an attribution.
- Existing high-resolution opportunity: the homepage developer samples are published at 6774 x 4492 px; the preview uses 600 px derivatives.

## Assets deliberately not downloaded

Unsplash stock images on the passport page, the alfo passport banner (model), the Vernissage poster (person), Kodak slide stock photo ("Dia gekauft"), the ARRIFLEX camera cut-out (573 x 371, unknown owner), the mixing-console photo (`unspecified.jpg`), and tiny thumbnails (120 to 300 px).
