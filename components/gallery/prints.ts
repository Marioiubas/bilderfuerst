// Street Gallery · the twelve prints of the web representation.
// IMPORTANT: this is NOT the current exhibition. No source names the exhibition, photographers or titles
// (photostudio.de/i/galerie, live 2026-10-05). The web wall hangs genuine business photographs instead:
// one lab sample scan (the Porsche frame from the homepage developer comparison), workshop, lab,
// digitization and shop photos from photostudio.de (docs/evidence/asset-manifest.json).
// Audit M6 (2026-10-06): the Porsche motif appears once (01) — the four-developer comparison lives on /lab.
// Caption grammar: KIND · DETAIL · FILM/DATE. Camera and photographer are not published → never invented.

export type PrintPlace='fenster'|'laden';
export type Print={
 /** Two-digit position number, 01–09 window, 10–12 inside the shop. */
 id:string;
 place:PrintPlace;
 /** Human position label, e.g. "Reihe 2 · Platz 3". */
 slot:string;
 /** Grid / texture rendition (same URL is reused by the wall, the 2D window and the WebGL atlas, so it downloads once). */
 src:string;w:number;h:number;
 /** Optional middle rendition for the lightbox srcset (between src and large). */
 mid?:{src:string;w:number};
 /** Largest real rendition (lightbox; never upscaled beyond lw). */
 large:string;lw:number;lh:number;
 title:string;
 caption:string;
 alt:string;
 source:string;
 tone:'sw'|'farbe';
 /** Lab sample from the developer comparison → links to /lab. */
 lab?:true;
};

const HOME='Startseite photostudio.de';
const SHOP='Seite „Unser Geschäft“, photostudio.de';
const SLIDES='Seite „Dias digitalisieren“, photostudio.de';

export const prints:Print[]=[
 {id:'01',place:'fenster',slot:'Reihe 1 · Platz 1',src:'/images/scan-adonal.webp',w:600,h:398,large:'/images/scan-adonal-l.webp',lw:1400,lh:928,lab:true,
  title:'Porsche 911 · Adonal',caption:'Labormuster · Kodak Tri-X · Adox Adonal 1+25 · 7:00 Min.',tone:'sw',source:'Entwickler-Vergleich, Startseite photostudio.de',
  alt:'Schwarzweiß-Aufnahme: Porsche 911 mit Martini-Streifen vor einem Holzzaun, Labormuster auf Kodak Tri-X, entwickelt in Adox Adonal.'},
 {id:'02',place:'fenster',slot:'Reihe 1 · Platz 2',src:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1-t.webp',w:480,h:317,large:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',lw:1400,lh:926,
  title:'Negative am Leuchttisch',caption:'Workshop-Seite · Sichtung am Leuchttisch · Schwarzweiß',tone:'sw',source:'Workshop-Seite „Schwarz-Weiß-Filmentwicklung“, photostudio.de',
  alt:'Zwei Personen beugen sich im abgedunkelten Raum über einen Leuchttisch mit Negativstreifen.'},
 {id:'03',place:'fenster',slot:'Reihe 1 · Platz 3',src:'/images/lab-scan.webp',w:600,h:400,large:'/images/lab-scan-l.webp',lw:1600,lh:1066,
  title:'Negativ im Scanner',caption:'Laborfoto · Kleinbild-Negativstreifen im Noritsu-Scanner · Farbe',tone:'farbe',source:HOME,
  alt:'Ein Kleinbild-Negativstreifen läuft in einen weißen Noritsu-Filmscanner.'},
 {id:'04',place:'fenster',slot:'Reihe 2 · Platz 1',src:'/images/film-rolls.webp',w:600,h:400,large:'/images/film-rolls-l.webp',lw:1600,lh:1067,
  title:'Patronen in Reihe',caption:'Laborfoto · Kleinbildpatronen, vorn ein Kodak-Farbnegativfilm ISO 200 · Farbe',tone:'farbe',source:HOME,
  alt:'Makroaufnahme: eine Reihe Kleinbildpatronen, vorn eine gelbe Kodak-Patrone mit 200 ISO.'},
 {id:'05',place:'fenster',slot:'Reihe 2 · Platz 2',src:'/images/slide-in-glove-t.webp',w:480,h:384,mid:{src:'/images/slide-in-glove.webp',w:1400},large:'/images/slide-in-glove-l.webp',lw:2500,lh:2000,
  title:'Dia im Handschuh',caption:'Digitalisierung · gerahmtes Kleinbild-Dia, mit Handschuh gehalten · Farbe',tone:'farbe',source:SLIDES,
  alt:'Eine Hand im weißen Baumwollhandschuh hält ein gerahmtes Kleinbild-Dia mit einer Straßenszene in der Abenddämmerung.'},
 {id:'06',place:'fenster',slot:'Reihe 2 · Platz 3',src:'/images/lab-film.webp',w:600,h:400,large:'/images/lab-film-l.webp',lw:1600,lh:1066,
  title:'Belichtet, C-41',caption:'Laborfoto · Kleinbildpatronen, u. a. Kodak Portra 800 · Farbe',tone:'farbe',source:HOME,
  alt:'Mehrere Kleinbildpatronen auf weißem Grund, darunter Kodak Portra 800 und Patronen mit C-41-Aufklebern.'},
 {id:'07',place:'fenster',slot:'Reihe 3 · Platz 1',src:'/images/scanner-ccd-sensor.webp',w:470,h:467,large:'/images/scanner-ccd-sensor.webp',lw:470,lh:467,
  title:'Sensor im Scankopf',caption:'Manufakturfoto · CCD-Sensor im Objektivanschluss eines Scankopfs · Farbe',tone:'farbe',source:'Seite „Wir digitalisieren“, photostudio.de',
  alt:'Nahaufnahme: ein rechteckiger CCD-Sensor im runden Objektivanschluss eines Scankopfs.'},
 {id:'08',place:'fenster',slot:'Reihe 3 · Platz 2',src:'/images/slide-magazine-macro.webp',w:1400,h:1120,large:'/images/slide-magazine-macro-l.webp',lw:2500,lh:2000,
  title:'Dias im Magazin',caption:'Digitalisierung · nummeriertes Diamagazin, ein Dia gezogen · Farbe',tone:'farbe',source:SLIDES,
  alt:'Nahaufnahme eines Diamagazins mit nummerierten Fächern; ein gerahmtes Dia ist herausgezogen.'},
 {id:'09',place:'fenster',slot:'Reihe 3 · Platz 3',src:'/images/print-kiosk-screens.webp',w:1400,h:933,large:'/images/print-kiosk-screens-l.webp',lw:1600,lh:1067,
  title:'Bestellterminals',caption:'Druck · Bestellterminals für Abzüge, Bildauswahl auf dem Bildschirm · Farbe',tone:'farbe',source:HOME,
  alt:'Bestellterminal für Abzüge mit Bildauswahl auf dem Bildschirm, dahinter weitere Terminals.'},
 {id:'10',place:'laden',slot:'Innen · Platz 1',src:'/images/film-shelf.webp',w:600,h:400,mid:{src:'/images/film-shelf-m.webp',w:900},large:'/images/film-shelf-l.webp',lw:1600,lh:1067,
  title:'Filmschachteln',caption:'Ladenfoto · Filmschachteln von Kodak, CineStill, Ilford u. a. · Farbe',tone:'farbe',source:HOME,
  alt:'Eine Wand aus Filmschachteln, darunter Kodak Portra, Ektar, Tri-X, CineStill und Ilford.'},
 {id:'11',place:'laden',slot:'Innen · Platz 2',src:'/images/store-inside.webp',w:600,h:400,large:'/images/store-inside-l.webp',lw:1063,lh:709,
  title:'Blick zum Eingang',caption:'Ladenfoto · Verkaufsraum mit Blick zum Eingang · Aufnahme März 2018',tone:'farbe',source:SHOP,
  alt:'Verkaufsraum mit Blick zum Eingang und „bilderfürst“-Schild über der Tür, März 2018.'},
 {id:'12',place:'laden',slot:'Innen · Platz 3',src:'/images/store-interior-xserie-wall.webp',w:1063,h:709,large:'/images/store-interior-xserie-wall.webp',lw:1063,lh:709,
  title:'Die X-Serie-Wand',caption:'Ladenfoto · damalige Fujifilm-X-Serie-Wand · Aufnahme März 2018',tone:'farbe',source:SHOP,
  alt:'Beleuchtete Vitrinenwand mit dem Schriftzug „X-Serie“: Kameras und Objektive in Fächern, davor Bilderrahmen, März 2018.'},
];

export const windowPrints=prints.filter(p=>p.place==='fenster');
export const shopPrints=prints.filter(p=>p.place==='laden');

/** The four-developer comparison (same Tri-X frame, four developers) has its own lab context. */
export const DEVELOPER_COMPARISON='/lab#lp-dev-title';

/** Verified facts (photostudio.de/i/galerie and /i/kontakt-und-oeffnungszeiten, live 2026-10-05). */
export const galleryFacts={
 corner:'Schwabacher Straße Ecke Alexanderstraße',
 address:'Alexanderstraße 2, 90762 Fürth',
 hours:[['Mo–Fr','09:30–18:30'],['Sa','09:30–16:30']] as const,
 phone:{label:'0911 774202',href:'tel:+49911774202'},
 maps:'https://www.google.com/maps/dir/?api=1&destination=Alexanderstra%C3%9Fe+2%2C+90762+F%C3%BCrth',
};
