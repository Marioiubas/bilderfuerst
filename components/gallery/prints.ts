// Street Gallery · the twelve prints of the web representation.
// IMPORTANT: this is NOT the current exhibition. No source names the exhibition, photographers or titles
// (photostudio.de/i/galerie, live 2026-10-05). The web wall hangs genuine business photographs instead:
// lab sample scans (homepage developer comparison), workshop, lab and digitization photos from photostudio.de.
// Caption grammar: KIND · FILM · DEVELOPER/DETAIL. Camera and photographer are not published → never invented.

export type PrintPlace='fenster'|'laden';
export type Print={
 /** Two-digit position number, 01–09 window, 10–12 inside the shop. */
 id:string;
 place:PrintPlace;
 /** Human position label, e.g. "Reihe 2 · Platz 3". */
 slot:string;
 /** Grid / texture rendition (same URL is reused by the 2D window and the WebGL atlas, so it downloads once). */
 src:string;w:number;h:number;
 /** Lightbox rendition. */
 large:string;lw:number;lh:number;
 title:string;
 caption:string;
 alt:string;
 source:string;
 tone:'sw'|'farbe';
};

const DEV='Entwickler-Vergleich, Startseite photostudio.de';

export const prints:Print[]=[
 {id:'01',place:'fenster',slot:'Reihe 1 · Platz 1',src:'/images/scan-adonal.webp',w:600,h:398,large:'/images/scan-adonal-l.webp',lw:1400,lh:928,
  title:'Porsche 911 · Adonal',caption:'Labormuster · Kodak Tri-X · Adox Adonal 1+25 · 7:00 Min.',tone:'sw',source:DEV,
  alt:'Schwarzweiß-Aufnahme: Porsche 911 mit Martini-Streifen vor einem Holzzaun, Labormuster auf Kodak Tri-X, entwickelt in Adox Adonal.'},
 {id:'02',place:'fenster',slot:'Reihe 1 · Platz 2',src:'/images/scan-silvermax.webp',w:600,h:398,large:'/images/scan-silvermax-l.webp',lw:1400,lh:928,
  title:'Porsche 911 · Silvermax',caption:'Labormuster · Kodak Tri-X · Adox Silvermax 1+19 · 12:00 Min.',tone:'sw',source:DEV,
  alt:'Das gleiche Motiv als Labormuster auf Kodak Tri-X, entwickelt in Adox Silvermax.'},
 {id:'03',place:'fenster',slot:'Reihe 1 · Platz 3',src:'/images/scan-d76.webp',w:600,h:398,large:'/images/scan-d76-l.webp',lw:1400,lh:928,
  title:'Porsche 911 · D-76',caption:'Labormuster · Kodak Tri-X · Kodak D-76 1+0 · 6:45 Min.',tone:'sw',source:DEV,
  alt:'Das gleiche Motiv als Labormuster auf Kodak Tri-X, entwickelt in Kodak D-76.'},
 {id:'04',place:'fenster',slot:'Reihe 2 · Platz 1',src:'/images/scan-hc110.webp',w:600,h:398,large:'/images/scan-hc110-l.webp',lw:1400,lh:928,
  title:'Porsche 911 · HC-110',caption:'Labormuster · Kodak Tri-X · Kodak HC-110 1+31 · 6:00 Min.',tone:'sw',source:DEV,
  alt:'Das gleiche Motiv als Labormuster auf Kodak Tri-X, entwickelt in Kodak HC-110.'},
 {id:'05',place:'fenster',slot:'Reihe 2 · Platz 2',src:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',w:1400,h:926,large:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',lw:1400,lh:926,
  title:'Negative am Leuchttisch',caption:'Workshop-Seite · Sichtung am Leuchttisch · Schwarzweiß',tone:'sw',source:'Workshop-Seite „Schwarz-Weiß-Filmentwicklung“, photostudio.de',
  alt:'Zwei Personen beugen sich im abgedunkelten Raum über einen Leuchttisch mit Negativstreifen.'},
 {id:'06',place:'fenster',slot:'Reihe 2 · Platz 3',src:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-2.webp',w:1400,h:933,large:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-2.webp',lw:1400,lh:933,
  title:'Tür mit Startnummer',caption:'Labormuster, Ausschnitt · Kodak Tri-X · Adox Adonal 1+25 · 7:00 Min.',tone:'sw',source:'Workshop-Seite „Schwarz-Weiß-Filmentwicklung“, photostudio.de',
  alt:'Ausschnitt aus dem Adonal-Labormuster: Fahrertür des Porsche mit Martini-Schriftzug und Startnummer 701.'},
 {id:'07',place:'fenster',slot:'Reihe 3 · Platz 1',src:'/images/lab-scan.webp',w:600,h:400,large:'/images/lab-scan-l.webp',lw:1600,lh:1066,
  title:'Negativ im Scanner',caption:'Laborfoto · Kleinbild-Negativstreifen im Noritsu-Scanner · Farbe',tone:'farbe',source:'Startseite photostudio.de',
  alt:'Ein Kleinbild-Negativstreifen läuft in einen weißen Noritsu-Filmscanner.'},
 {id:'08',place:'fenster',slot:'Reihe 3 · Platz 2',src:'/images/film-rolls.webp',w:600,h:400,large:'/images/film-rolls-l.webp',lw:1600,lh:1067,
  title:'Patronen in Reihe',caption:'Laborfoto · Kleinbildpatronen, vorn ein Kodak-Farbnegativfilm ISO 200 · Farbe',tone:'farbe',source:'Startseite photostudio.de',
  alt:'Makroaufnahme: eine Reihe Kleinbildpatronen, vorn eine gelbe Kodak-Patrone mit 200 ISO.'},
 {id:'09',place:'fenster',slot:'Reihe 3 · Platz 3',src:'/images/slide-in-glove.webp',w:1400,h:1120,large:'/images/slide-in-glove.webp',lw:1400,lh:1120,
  title:'Dia im Handschuh',caption:'Digitalisierung · gerahmtes Kleinbild-Dia, mit Handschuh gehalten · Farbe',tone:'farbe',source:'Seite „Dias digitalisieren“, photostudio.de',
  alt:'Eine Hand im weißen Baumwollhandschuh hält ein gerahmtes Kleinbild-Dia mit einer Straßenszene in der Abenddämmerung.'},
 {id:'10',place:'laden',slot:'Innen · Platz 1',src:'/images/lab-film.webp',w:600,h:400,large:'/images/lab-film-l.webp',lw:1600,lh:1066,
  title:'Belichtet, C-41',caption:'Laborfoto · Kleinbildpatronen, u. a. Kodak Portra 800 · Farbe',tone:'farbe',source:'Startseite photostudio.de',
  alt:'Mehrere Kleinbildpatronen auf weißem Grund, darunter Kodak Portra 800 und Patronen mit C-41-Aufklebern.'},
 {id:'11',place:'laden',slot:'Innen · Platz 2',src:'/images/film-shelf.webp',w:600,h:400,large:'/images/film-shelf-l.webp',lw:1600,lh:1067,
  title:'Filmschachteln',caption:'Ladenfoto · Filmschachteln von Kodak, CineStill, Ilford u. a. · Farbe',tone:'farbe',source:'Startseite photostudio.de',
  alt:'Eine Wand aus Filmschachteln, darunter Kodak Portra, Ektar, Tri-X, CineStill und Ilford.'},
 {id:'12',place:'laden',slot:'Innen · Platz 3',src:'/images/slide-magazine-macro.webp',w:1400,h:1120,large:'/images/slide-magazine-macro.webp',lw:1400,lh:1120,
  title:'Dias im Magazin',caption:'Digitalisierung · nummeriertes Diamagazin, ein Dia gezogen · Farbe',tone:'farbe',source:'Seite „Dias digitalisieren“, photostudio.de',
  alt:'Nahaufnahme eines Diamagazins mit nummerierten Fächern; ein gerahmtes Dia ist herausgezogen.'},
];

export const windowPrints=prints.filter(p=>p.place==='fenster');
export const shopPrints=prints.filter(p=>p.place==='laden');

/** Verified facts (photostudio.de/i/galerie and /i/kontakt-und-oeffnungszeiten, live 2026-10-05). */
export const galleryFacts={
 corner:'Schwabacher Straße Ecke Alexanderstraße',
 address:'Alexanderstraße 2, 90762 Fürth',
 hours:[['Mo–Fr','09:30–18:30'],['Sa','09:30–16:30']] as const,
 phone:{label:'0911 774202',href:'tel:+49911774202'},
 maps:'https://www.google.com/maps/dir/?api=1&destination=Alexanderstra%C3%9Fe+2%2C+90762+F%C3%BCrth',
};
