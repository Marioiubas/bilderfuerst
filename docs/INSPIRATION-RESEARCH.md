# Inspiration research · Bilderfürst remake (Direction C "Analog Technology")

Stand: 2026-10-05. Every site below was opened live on this date (built-in browser or fetch); non-essential cookies were declined, no forms submitted, nothing bought. Awards are listed only where an award page, agency case or award roundup confirmed them. All descriptions are paraphrased.

Format per entry: URL · category · award — **Excellent** · **Adopt** (concrete Bilderfürst page/component) · **Avoid**.

---

## 1 · Site notes

### 1.1 Film labs

**Carmencita Film Lab** — https://carmencitafilmlab.com/prices/ · lab (Valencia + 7 drop-off cities) · no award found
- **Excellent:** prices as a set of matrices: scan size (M/L/XL/XXL) × format (35/120/220), split per process group (C-41 vs B&W/E-6/ECN-2); separate small tables for processing days per process, rush tiers (1/2/4 days, €/roll), push €/stop, contact-sheet and proof-print add-ons, and a cheap "return negatives within 90 days" option.
- **Standout:** `/we-do/scanning/scan-size-samples/` — full-resolution, zoomable sample viewer toggled by scanner (Frontier/Noritsu) × format (35/645/66/67) × process × size, captioned in the form SCANNER / FORMAT / PROCESS / SIZE – px.
- **Adopt:** Filmentwicklung → "Scan-Größen vergleichen": a Noritsu HS-1800 sample viewer with format × process × size toggles and a Plex Mono px caption; link it from every scan option in the configurator.
- **Avoid:** prices only ex-VAT and spread over many tables with no running total (German B2C needs gross prices + total).

**The Darkroom** — https://thedarkroom.com/film-developing/ · US mail-in lab · no award found (trust: since-1976 story, review count)
- **Excellent:** mega-menu headline is a question (what type of film do you have?) answered with format tiles: 35mm, 120/220/620, single-use, 110/126, developed negs, sheet film. Three-step how-it-works (order online → mail film → receive scans).
- **Configurator:** numbered required steps (film type → scans → prints) with price deltas relative to the current choice (−$2 / +$4); checkboxes for E-6, cross/redscale, do-not-cut, panoramic, half-frame; push/pull as half-stop steps from −1.5 to +3; live total + roll quantity; hint to add rolls separately when options differ. State lives in the URL (`?type=35mm&scan=enhanced&prints=…`).
- **Scans page:** per-format pixel table per tier (35mm roughly 1024×1536 → 4492×6774) with the print size each tier supports. **Film Index:** sortable table of stocks (ISO, formats, saturation/latitude/grain as + meters, rating).
- **Adopt:** (a) "Was für Film hast du?" panel in the Labor mega menu; (b) price-delta labels + half-stop push/pull stepper; (c) deep-linkable configurator state so a PDP can link "Portra 400 entwickeln" pre-filled (format 135, C-41).
- **Avoid:** dropdown-heavy form; generic testimonial carousel.

**ON FILM LAB (Frankfurt) + Spieker Film Lab (Hamburg)** — https://onfilmlab.de/ · https://www.spiekerfilmlab.de/ · German labs (both reviewed by fotowissen.eu, which also lists Bilderfürst) · no award
- **Excellent:** ON FILM LAB orders as a sequential questionnaire: process (C-41/SW/ECN-2/E-6) → push/pull ±2 → format → scan size (Noritsu vs Frontier px table) → cut/uncut → scan look "Standard" vs "Benutzerdefiniert" (TIFF with own tone/contrast wishes) → contact sheet → standard vs express → negatives return / archive / dispose. Spieker: order online first, write name + order number on the bag, then post, shop drop-off or 24/7 drop box; negative disposition chosen up front.
- **Adopt:** final configurator steps "Negative" (zurücksenden / in Fürth abholen / archivieren) and "Scan-Look" (Labor-Standard vs flach/neutral). Use the established German vocabulary (Auftragsnummer, Push/Pull, Kontaktbogen, ungeschnitten).
- **Avoid:** table-only presentation with no visual of the result.

**Kamerastore** — https://kamerastore.com/pages/sending-your-film-to-us · used-camera shop + lab (Finland) · no award
- **Excellent:** develop service bought like a product (one service = one roll) → order number → mail or drop in store; recommended scan option visibly marked; certified-condition badges on used cameras.
- **Adopt:** an "Empfohlen" marker on the default scan size; mono condition grades if used cameras are added.
- **Avoid:** emoji as UI markers.

### 1.2 Analog shops & film brands

**Analogue Wonderland** — https://analoguewonderland.co.uk/collections/buy-35mm-film · UK film shop · no award
- **Excellent:** facets Availability, Price, Film Type (colour, B&W, slide, infrared, ECN-2, expired), Format (35/120/110/127/620/LF/instant), ISO, Brand and a use-case facet "Perfect for" (low light, portraits, landscapes). Cards show per-roll price for multipacks and review count.
- **PDP:** pack-size selector with per-roll price; delivery-date countdown with a 3-step mini timeline (ordered → processing → delivered); structured spec list (format, type/process, ISO, grain, contrast, colour balance, latitude, DX coding); credited sample shots; FAQ; cross-sell to the same emulsion in other formats; a note catching a common misspelling for search.
- **Adopt:** shop facets in this order — Format → Typ (Farbe/SW/Dia/Sofortbild) → ISO → Prozess → Marke → Einsatz (Wenig Licht, Porträt, Street, Einsteiger). PDP spec ledger + row "Gleicher Film, anderes Format".
- **Avoid:** three promo badges on one card; competition banners on PDP.

**Fotoimpex** — https://www.fotoimpex.com/films/ · Berlin analog specialist · no award
- **Excellent:** deep facets (ISO 6–3200, length in exposures/metres/sheets, 40+ makers); rows show ISO, format, exposures, stock state and a marker for stock in the Berlin store.
- **Adopt:** "Im Laden in Fürth" marker on cards + facet "Heute abholbar".
- **Avoid:** 60-item dense pages and 25 € price buckets — utilitarian, no brand.

**Lomography shop** — https://shop.lomography.com/eu/film · brand shop · no award
- **Excellent:** strict naming (name + format + ISO) on every film; intent collections (low ISO, short-dated & expired, develop & scan at home).
- **Adopt:** normalise all ~107 product titles to an edge-print pattern `MARKE · NAME · ISO · FORMAT-BELICHTUNGEN` (e.g. KODAK · PORTRA · 400 · 135-36); intent collections "Kurz datiert", "Selbst entwickeln".
- **Avoid:** marketing blurbs on cards.

**CineStill** — https://cinestillfilm.com/ · film + chemistry brand · no award
- **Excellent:** top-level IA follows the workflow — Shoot / Process / Scan — not product types; chemistry kits named by the simplification they offer.
- **Adopt:** workflow nav for Bilderfürst: Fotografieren (Shop) · Entwickeln (Labor) · Digitalisieren · Drucken · Besuchen; Jobo/Adox/Ilford chemistry + tanks as "Selbst entwickeln", bridging shop and lab.
- **Avoid:** specs only inside long titles.

**Polaroid — instant film** — https://www.polaroid.com/en_de/film · brand shop · polaroid.com elements featured on Awwwards (inspiration, not an award)
- **Excellent:** big grotesk H1; mono caps label above a row of film-pack thumbnails used as category chips (i-Type, 600, SX-70, Go, 8×10, packs, subscription); a film-compatibility toggle; "FILTERS · 0" button; tiles in a hairline-bordered grid.
- **Adopt:** Sofortbild category: chip row with real pack images (instax mini/wide/square, Polaroid i-Type/600/SX-70) + "Welcher Film passt in meine Kamera?" lookup.
- **Avoid:** cookie modal blocking the grid.

**Polaroid I-2 microsite** — https://i2-camera.polaroid.com/ · camera launch · **Awwwards SOTD 21 Oct 2023 + Developer Award** (Build in Amsterdam)
- **Excellent:** every camera mode (aperture, shutter, auto) is proven by a named photographer's real image; f-stop range explained as creative control; ends in bundles + compare page.
- **Adopt:** Pentax 17 / instax PDPs: "Was die Kamera kann" — each feature paired with a real frame shot on it and scanned in Fürth (credited); bundle "Kamera + 2 Filme + Entwicklung".
- **Avoid:** video-first intro before the buy box.

### 1.3 Institutions, archives, timelines

**Foam Fotografiemuseum Amsterdam** — https://www.foam.org/ · museum · **Awwwards SOTD + CSS Design Awards winner** (site by Build in Amsterdam per Dutch Digital Design case; identity later refreshed by W+K)
- **Excellent:** live opening status under the welcome line (closed until tomorrow 10:00) + one "plan your visit" button; compact red banner (taken from the building facade) as header that unfolds into four quick tabs on scroll (what's on / tickets / magazine / shop); images never cropped, no type over images; pill tag + "until <date>", artist roman / title italic. Case study: walk-past-the-walls horizontal browsing and a keyword "Connections" network instead of "related".
- **Adopt:** header live status "Heute geöffnet bis 18:00 · Street Gallery beleuchtet"; Street Gallery prints uncropped with caption column beside.
- **Avoid:** horizontal scroll as core navigation on mobile.

**C/O Berlin** — https://co-berlin.org/de · exhibition house (German) · no award found
- **Excellent:** header always shows TODAY's hours; condensed heavy italic caps for artist names, bold date ranges; filled-dot section label with tabs "aktuell / demnächst"; secondary nav with Leichte Sprache, Kontrast, Schriftgröße; "Besuch" groups hours, travel, tickets, accessibility.
- **Adopt:** German micro-copy model; "aktuell / demnächst / Archiv" tabs for Street Gallery rotations; accessibility toggles in secondary nav.
- **Avoid:** carousel hero.

**Leica — Witness to a Century** — https://timeline.leica-camera.com · brand history · **Webby Awards 2026 nominee, Best Use of Photography** (The Good Shit Land)
- **Excellent:** scroll travels through years; the current year is a fixed centred anchor; scene behind it; "open timeframe" button opens the era's detail; index icon to jump; optional sound.
- **Adopt:** Geschichte: fixed year counter (1935 → 1973 → 2001 → 2020) in Archivo condensed, amber film-base light travelling a strip, "Zeitraum öffnen" drawer with documents per era.
- **Avoid:** cartoon avatars; scroll-jacking without a skip link.

**Peter Lindbergh tribute** — https://peterlindbergh.obys.agency/ · photographer memorial · **Awwwards SOTD + HM, FWA SOTD, CSSDA SOTD + UI/UX Innovation** (Obys; per award roundups)
- **Excellent:** biography as numbered chapters 01–07 with year labels and a "next chapter" hand-off; huge caps type; magazine covers as a marquee.
- **Adopt:** chapter grammar "01 / LABOR", "02 / STORE" with year/frame label for the homepage route and history.
- **Avoid:** in our test it sat on a near-black loader for 7+ s — never gate commerce behind a preloader.

**The Surfer's Journal Archives** — https://archives.surfersjournal.com/ · magazine archive · Siteinspire feature 29 Sep 2026 (studio TEACHER)
- **Excellent:** one object per screen, centred; year fixed bottom-left, issue no. bottom-right, "All (187)" switches to grid; background tint sampled from each cover so scrolling feels like flipping a shelf.
- **Adopt:** Zines + archive: object-at-a-time browsing with mono corner counters (JAHR / NR.) and "Alle (n)" → contact-sheet grid; tint stays within graphite/photo-white.
- **Avoid:** serif-only identity (conflicts with Direction C).

**Magnum Photos** — https://www.magnumphotos.com/ · agency + store · no award found
- **Excellent:** consistent attribution on every image; store and editorial cross-linked; newsletter preferences by interest.
- **Adopt:** one caption grammar for all photos: `© NAME · ORT · JAHR · KAMERA · FILM` (customer scans, Street Gallery, PDP samples).
- **Avoid:** dense grids of small thumbnails.

### 1.4 WebGL / object heroes

**35mm (Canon F-1)** — https://35mm-one.vercel.app/ (redirects to lab.chakibmzn.com/35mm) · experimental · **Awwwards SOTD 19 Jun 2025** (Chakib Mazouni)
- **Excellent:** graphite field framed by viewfinder corner brackets, centre crosshair and a REC-style timecode; the camera is a white line-drawn 3D model rotating with scroll; amber leader lines label parts; exploded lens where hovering a ring turns it amber and opens a mono spec note; finale flies through the viewfinder into a film-roll gallery.
- **Adopt:** hero + film-lab zone: 135 cartridge / Pentax 17 / Jobo tank as silver-hairline 3D with amber callouts; exploded Jobo tank on "Selbst entwickeln"; viewfinder brackets as loading/transition frame. Matches the palette rules exactly.
- **Avoid:** 6+ screens of scroll before any content; no reduced-motion path.

**Teenage Engineering EP-133** — https://teenage.engineering/products/ep-133 · hardware PDP (adjacent reference, award not checked)
- **Excellent:** plain grouped spec lists, exploded component diagram, dimension drawing, neutral backgrounds, short repeated buy box.
- **Adopt:** PDP "Technische Daten" with a dimension drawing for cameras/tanks and an exploded diagram for developing tanks.
- **Avoid:** novelty navigation.

### 1.5 Digitization services

**Legacybox** — https://legacybox.com/ · US digitization · no award (trust: own facility, family count)
- **Excellent:** media tiles that list sub-formats in plain words (tapes: VHS, Hi8, Digital8, MiniDV, Betamax · reels: 8mm, Super 8, 16mm · audio · photos/negatives/slides); box sizes by item count with mix & match; three steps; facility story (all under one roof, tracked per step). Their guides identify film by sprocket-hole shape, reel centre-hole size and magnetic sound stripe.
- **Adopt:** Digitalisierung chooser tiles with sub-format lists; trust block "Digitalisiert in Fürth — nichts wird ausgelagert"; identification cues as compare cards.
- **Avoid:** permanent-sale pricing and urgency banners.

**Kodak Digitizing** — https://www.kodakdigitizing.com/ · digitization · no award
- **Excellent:** you fill / we digitize / you enjoy; tracking emails across a stated multi-week window; output (USB / DVD / download) chosen up front.
- **Adopt:** order status timeline Eingang → Sichtung → Digitalisierung → Kontrolle → Rückgabe with expected dates; output step in the chooser.
- **Avoid:** discount banners dominating.

**iMemories** — https://www.imemories.com/ · digitization · no award
- **Excellent:** removes sorting anxiety (no sorting or labelling needed); per-unit prices (per tape, per 50 ft of film, per photo) allow rough self-estimates; free quote.
- **Adopt:** path "Ich weiß nicht, was ich habe" → unsorted Sammelauftrag + Kostenvoranschlag before work starts.
- **Avoid:** cloud-subscription upsell.

**Medienrettung (Berlin)** — https://www.medienrettung.de/ · German digitization lab · no award (trust: thousands of reviews, archive clients)
- **Excellent:** icon menu Video / Film / Dia / Negativ / Foto / Tonträger; "Sorglos-Paket" — send mixed media unsorted, staff assess and quote; quality tiers Eco / Standard / Premium; per-unit prices with quantity discounts; drop-off at the lab or DHL.
- **Adopt:** German category names; "Sorglos" path; quantity-discount ruler; "Abgabe im Laden" as a first-class option.
- **Avoid:** stock-icon look, long SEO text blocks.

---

## 2 · Patterns for Bilderfürst

### 2.0 Top 15 by impact
1. **"Was hast du?" object-first router** — Labor mega menu, homepage band, ⌘K empty state and Digitalisierung entry all start from the physical thing in the customer's hand (Darkroom, Legacybox).
2. **Film-development configurator** — film-strip steps, price delta on every option, live total, half-stop push/pull, negative handling, URL state, "weitere Rolle mit anderen Optionen" (Darkroom, ON FILM LAB).
3. **Scan-size table + sample viewer** — px per format per tier, print-size guidance, Noritsu HS-1800 samples by format × process × size (Carmencita, Darkroom).
4. **Film finder bar** on /shop film listing — Format / Typ / ISO / Prozess segmented controls + Einsatz chips with live counts (Analogue Wonderland, Fotoimpex).
5. **Edge-print naming + card data line** — `MARKE · NAME · ISO · FORMAT-BEL.` + process colour dot, per-roll price, "Im Laden" marker (Lomography, Fotoimpex).
6. **Shop ↔ lab bridge** — PDP "Diesen Film bei uns entwickeln" deep-link pre-filled; cart row "Entwicklung dazu?" when films are in the cart.
7. **Live status in the header** — "Heute bis 18:00 geöffnet · Street Gallery beleuchtet" (Foam, C/O Berlin).
8. **⌘K archive index with alias parsing** — "portra 400 120", "sw 400", "super8", "pass".
9. **Digitization identification + estimator** — compare cards (sprockets, centre hole, cartridge, sound stripe, cassette sizes), per-unit price ruler, Sorglos path, status timeline (Legacybox, Medienrettung, iMemories, Kodak).
10. **Mail-in kit** — printable Auftragsschein/envelope with order number + QR, packing steps, Abgabe im Laden (Spieker, Kamerastore).
11. **PDP spec ledger + in-house sample contact strip** (Analogue Wonderland, Polaroid I-2).
12. **Line-drawn 3D hero objects** — silver hairline + amber callouts, static SVG first paint, WebGL only after interaction-ready (35mm).
13. **Street Gallery** — uncropped prints, side captions, 3×3 window map, aktuell / demnächst / Archiv (Foam, C/O Berlin).
14. **History** — fixed year counter + numbered chapters + amber strip; object-at-a-time archive (Leica, Lindbergh, Surfer's Journal).
15. **One caption grammar** for every photograph (Magnum).

### 2.1 Homepage narrative & hero
- Keep the Direction C route through the lab but number it like chapters: `01 / LABOR` … `09 / LADEN`, frame counter in Plex Mono (Lindbergh, 35mm).
- Hero: one silver-line 3D object (135 cartridge + negative strip) inside viewfinder brackets on graphite. First paint = static SVG drawing; Three.js hydrates later. Above the fold without scroll: red CTA "Film entwickeln", secondary "Film kaufen", text link "Digitalisieren".
- Directly under the hero: a live status strip (hours today, lab turnaround per process from the owner, Street Gallery lit) and a "Was hast du?" band: Belichteter Film · Alte Dias & Negative · Super 8 & Video · Passbild · Druck.
- Proof section: real customer frames in a contact-sheet strip with the caption grammar (Carmencita "Best of", Magnum).

### 2.2 Navigation / mega menu
- Workflow IA (CineStill): **Shop · Labor · Digitalisieren · Studio · Galerie · Besuch**; right side: live status dot, ⌘K, cart with item count.
- Labor panel: headline "Was für Film hast du?" + format tiles drawn to scale (135 / 120 / Halbformat / only formats the lab truly processes) + "Preise & Laufzeiten" + "Film einsenden".
- Shop panel: column Format, column Typ, short "Beliebt" list (e.g. Portra 400, HP5, Gold 200) and a chip row of instant packs (Polaroid).
- Digitalisieren panel: object tiles (Dias, Negative, Fotos, Schmalfilm, Video, Audio, Schallplatte) + "Nicht sicher?" link.
- Mobile: full-height sheet, the "Was hast du?" tiles first, accessibility toggles at the bottom (C/O).

### 2.3 Search (⌘K archive index)
- One index over products, lab options, digitization formats, services, FAQ, gallery prints, history entries; results grouped with mono labels FILM · LABOR · DIGITAL · STUDIO · GALERIE · HILFE.
- Query parsing to facets: numbers → ISO; 135/Kleinbild/35mm → 135; 120/Mittelformat → 120; sw/s/w/schwarzweiß → B&W; Dia → slide/E-6; super8/normal8/vhs/minidv → digitization formats; pass/bewerbung → studio.
- Aliases and misspellings (Porta → Portra, Ilfort → Ilford, Instax → instax) as Analogue Wonderland does on PDPs.
- Result row looks like edge print: `KODAK PORTRA 400 · 135-36 · C-41 · 12,90 € · IM LADEN`. Enter opens, ⌘Enter adds to cart for products.
- Empty state = "Was hast du?" router + 4 popular queries. Mobile: full-screen sheet.

### 2.4 Shop filters & product cards
- Sticky **film finder bar** at the top of the film listing: Format (135 · 120 · 110 · Sofortbild) · Typ (Farbe · SW · Dia) · ISO (≤100 · 200 · 400 · 800+) · Prozess (C-41 · SW · E-6 · ECN-2) + chips Einsatz (Wenig Licht · Porträt · Street · Einsteiger · Kurz datiert). Live counts per option; empty options disabled, not hidden. "Portra 400" or "120 SW" is two taps.
- Toggle grid ↔ **Film-Index table** (Darkroom): columns ISO, Formate, Körnung, Kontrast, Spielraum, Preis/Rolle — for enthusiasts.
- Card: product photo on photo-white, title in edge-print pattern, mono data line, process colour dot (amber C-41, silver SW, blue E-6), price + per-roll price for packs, "Im Laden" marker, one badge max, quick add.
- Sorting: Beliebt · Preis · ISO.

### 2.5 PDP (film specs)
- Spec ledger in mono, hairline rows: Format · Typ · Prozess · ISO · Belichtungen · Körnung · Kontrast · Farbbalance (Tageslicht/Kunstlicht) · Belichtungsspielraum · DX · Push-tauglich bis (Analogue Wonderland).
- In-house samples: a contact strip of frames shot on this film and scanned on the HS-1800, click → loupe; caption grammar (Polaroid I-2 logic: prove the claim with real frames).
- Bridge row: "Bei uns entwickeln — ab X € (135, C-41)" deep-link pre-filled; "Gleicher Film, anderes Format".
- Pack-size selector with per-roll price; expiry note; pickup/delivery date estimate (Analogue Wonderland countdown, stated calmly).
- Cameras/tanks: dimension drawing + exploded view (Teenage Engineering, 35mm).

### 2.6 Film-development ordering flow
- Entry from "Was hast du?" → configurator; progress = film strip whose frames are the steps (Direction C).
- Steps: 1 Format → 2 Prozess (C-41 / SW with developer choice Adonal · Silvermax · D-76 · HC-110, each with a one-line character note confirmed by the lab / E-6) → 3 Push/Pull (half-stop EV dial, €/stop, grain/contrast hint) → 4 Scan (tier table with px for this format, print-size guidance, "Empfohlen" marker, link to sample viewer) → 5 Extras (Kontaktbogen, Abzüge, ungeschnitten, Halbformat flag for Pentax 17 which doubles frame count) → 6 Negative (zurück / abholen / archivieren) → 7 Abgabe (im Laden / per Post) → envelope-ticket summary.
- Every option shows its price delta; live total sits in the envelope ticket; "Weitere Rolle mit anderen Optionen" adds a second ticket.
- Laufzeiten table per process + express if offered (Carmencita); all prices gross.
- Mail-in: printable Auftragsschein with order number + QR, packing rules (name + order no. on each canister, zip bag, padded envelope), address, photo of how to pack; drop-off alternative in shop (Spieker, Kamerastore).
- Configuration persisted in the URL for sharing and PDP deep links (Darkroom).

### 2.7 Digitization chooser (object-first)
- Tiles with photographed objects: Dia-Magazin, Negativstreifen, Fotoalbum/Abzüge, Super-8/Normal-8-Spule, 16mm, 35mm Kino, VHS/VHS-C, Video8/Hi8, MiniDV, Tonband/Kassette, Schallplatte — each lists its sub-formats (Legacybox).
- "Nicht sicher?" → compare cards drawn at 1:1 scale: perforation shape (Normal 8 vs Super 8 vs 16mm), centre-hole size (the finger test), cartridge vs open spool, brown magnetic stripe = sound; reel diameter → approximate minutes; cassette silhouettes VHS / VHS-C / Video8 / MiniDV with a ruler.
- Estimator: count × per-unit price, reel size → minutes → price, quantity-discount ruler (iMemories, Medienrettung).
- Quality tiers with a before/after scanner-pass slider in scanner cyan; output step Download / USB / beides; originals always returned.
- "Sorglos" path: unsorted box, Kostenvoranschlag before work (Medienrettung, iMemories).
- Status timeline after ordering (Kodak Digitizing); trust block "in Fürth digitalisiert, nichts ausgelagert" with named equipment (Legacybox).

### 2.8 Gallery presentation (Street Gallery)
- Black wall, uncropped prints, white mats, caption column beside not over the image (Foam).
- Tabs aktuell / demnächst / Archiv (C/O); a 3×3 window map shows where each of the 9 prints hangs; inside prints listed separately.
- Each print: photographer, title, camera, film, print method, "bis <Datum>"; status "Schaufenster beleuchtet · 24/7".
- Archive in contact-sheet grid with "Alle (n)"; click → loupe, not hover-zoom on touch.

### 2.9 History / archive timeline
- Fixed year counter (Leica) moving 1935 Foto Seitz → 1973 Erlangen → 2001 Fürth → 2020 Street Gallery; chapters numbered 01–0n with "Nächstes Kapitel" (Lindbergh).
- Amber film-base light travels along a strip as scroll progress; each era opens a drawer of documents/photos shown one object at a time with corner counters (Surfer's Journal).
- Always a "Zur Übersicht" skip link and a static fallback list.

### 2.10 Services (passport / application photos)
- Calm photo-white page, no WebGL. Top facts row: price set / digital with authority QR (per BUSINESS-FACTS), duration, "Termin buchen" (existing Calenso) + "ohne Termin?" answer from the owner.
- Sections: Für welche Dokumente · Was mitbringen/anziehen · Ablauf in 3 Schritten · Bewerbungsbilder (look options with real examples).
- One illustrative sheet with biometric guide lines drawn as registration marks.

### 2.11 Store / visit page
- Live status + hours table with today highlighted (C/O, Foam); address, phone, static map image that loads an interactive map only on click.
- "Was du im Laden machen kannst": Film abgeben/abholen, Passbild, Beratung, Street Gallery am Fenster.
- Travel/parking/accessibility block (facts from owner); photo of the facade for recognition.

### 2.12 Cart
- Group lines by fulfilment: Versand · Laborauftrag · Abholung in Fürth; lab and digitization items render as envelope tickets with config summary and "Bearbeiten" (returns to URL state).
- Per-group date estimate; gross prices; VAT/shipping note; pickup option.
- One bridge row: films in cart → "Entwicklung gleich mitbestellen?"; no carousels.

---

## 3 · Signature micro-interactions (photographic metaphors)
1. **Viewfinder brackets** as focus/selection frame: four red corner brackets snap around the focused element (35mm HUD).
2. **Film advance**: configurator step change advances the strip one frame with a sprocket tick; frame number increments 1 → 1A → 2 in mono.
3. **Aperture iris** wipe on route change (≤300 ms; reduced motion = 120 ms fade).
4. **Exploded-view hover**: hovering a part of the 3D tank/camera turns it amber and opens a mono spec note (35mm).
5. **Scanner pass**: cyan line sweeps a digitization sample, revealing the restored scan behind it.
6. **Loupe**: click a contact-sheet frame → circular loupe with grain detail; Esc closes.
7. **Developing reveal**: images arrive from a low-contrast warm latent state to final (≤600 ms), never a blur-up.
8. **EV dial** for push/pull: detented scale −1…+3 in half stops, price delta updates live.
9. **Corner counters** (JAHR / NR. / FRAME) that update with scroll (Surfer's Journal).
10. **Grease-pencil mark**: selecting a print/film draws a red rectangle around the frame, like marking a contact sheet.
11. **Live status dot**: safelight-red pulse in the header while the lab is open; steady grey when closed (Foam, C/O).
12. **Edge-print reveal** on card hover: the mono data line slides in like edge markings along a negative.

## 4 · Anti-patterns to avoid
1. **Preloaders and scroll-jacked intros** before commerce (Lindbergh test, 35mm length). First paint must show "Film entwickeln" and "Film kaufen".
2. **Type over photographs, cropped prints, filters/duotones on customer images** (Foam rules the opposite).
3. **Generic agency/SaaS kit**: pill cards, gradient blobs, glassmorphism, stock "happy family" photos, emoji as UI.
4. **Badge and discount clutter**, perpetual sale countdowns (Analogue Wonderland cards, Legacybox) — erodes the craft position.
5. **Hidden price or turnaround** (ex-VAT tables with no total, quote-only flows) — always gross price, running total and Bearbeitungszeit.
6. (bonus) **Horizontal scroll as primary navigation on mobile** and WebGL inside calm commerce zones.

## 5 · Sources checked (2026-10-05)
Carmencita prices + scan samples · The Darkroom developing, configurator, /scans/, /film-index/ · onfilmlab.de · spiekerfilmlab.de · meinfilmlab.de · fotowissen.eu German lab list · kamerastore.com · analoguewonderland.co.uk (35mm list, Portra 400 PDP) · fotoimpex.com/films · shop.lomography.com · cinestillfilm.com · polaroid.com/en_de/film · i2-camera.polaroid.com + awwwards.com/sites/polaroid-i-2 · foam.org + dutchdigital.design/cases/foam-org · co-berlin.org · timeline.leica-camera.com + Webby 2026 entry · peterlindbergh.obys.agency · archives.surfersjournal.com + siteinspire listing · magnumphotos.com · 35mm-one.vercel.app + awwwards.com/sites/35mm · teenage.engineering EP-133 · legacybox.com + film-identification guide · kodakdigitizing.com · imemories.com · medienrettung.de. Not reachable / skipped: fotomuseum.ch (bot check, not bypassed), ilfordphoto.com (403), digmypics.com (connection refused).
