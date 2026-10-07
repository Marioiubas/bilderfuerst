// Real business photographs shown as frames of the hero negative strip / contact sheet.
// Sources: public/images (photostudio.de originals, see docs/ASSET-PROVENANCE.md and
// docs/BRAND-VISUAL-RESEARCH.md). Captions only name what the picture shows. Each photo appears once on
// the homepage (FINAL-COMPARATIVE-AUDIT 3.5): the 2018 corner shot lives in Street Gallery, so the strip opens
// on the window close-up instead.
export type HeroFrame={
 /** Large rendition (used by the DOM strip via srcSet). */
 src:string;
 /** 480 px rendition for the DOM strip (frames display at ~120–240 CSS px). */
 thumb:string;
 /** Small rendition (≤ 1063 px) for the WebGL texture atlas. */
 small:string;
 srcSet?:string;
 width:number;height:number;
 alt:string;
 /** Mono caption: discipline + subject, no invented claims. */
 caption:string;
 /** Film edge number printed next to the frame. */
 edge:number;
};

export const heroFrames:HeroFrame[]=[
 {src:'/images/store-front-l.webp',thumb:'/images/store-front-t.webp',small:'/images/store-front.webp',srcSet:'/images/store-front-t.webp 480w, /images/store-front-l.webp 1063w',width:1063,height:709,
  alt:'Schaufenster der Street Gallery in der Alexanderstraße 2: gerahmte Schwarzweiß-Abzüge hinter Glas',caption:'Fürth · Fenster',edge:12},
 {src:'/images/film-rolls-l.webp',thumb:'/images/film-rolls-t.webp',small:'/images/film-rolls.webp',srcSet:'/images/film-rolls-t.webp 480w, /images/film-rolls-l.webp 1600w',width:1600,height:1067,
  alt:'Belichtete Kleinbild-Farbfilme für den C-41-Prozess, aufgereiht im Labor',caption:'Labor · C-41',edge:13},
 {src:'/images/scan-adonal-l.webp',thumb:'/images/scan-adonal-t.webp',small:'/images/scan-adonal.webp',srcSet:'/images/scan-adonal-t.webp 480w, /images/scan-adonal-l.webp 1400w',width:1400,height:928,
  alt:'Laborscan eines Kodak Tri-X, entwickelt in Adonal: ein Porsche 911 in Schwarzweiß',caption:'Tri-X · Adonal',edge:14},
 {src:'/images/lab-scan-l.webp',thumb:'/images/lab-scan-t.webp',small:'/images/lab-scan.webp',srcSet:'/images/lab-scan-t.webp 480w, /images/lab-scan-l.webp 1600w',width:1600,height:1066,
  alt:'Ein 35-mm-Negativstreifen läuft in den Noritsu-Filmscanner des Labors',caption:'Scan · Noritsu',edge:15},
 {src:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',thumb:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1-t.webp',small:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',srcSet:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1-t.webp 480w, /images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp 1400w',width:1400,height:926,
  alt:'Workshop Schwarzweiß-Filmentwicklung: zwei Teilnehmer prüfen Negative am Leuchtpult',caption:'Workshop · SW',edge:16},
 {src:'/images/slide-in-glove.webp',thumb:'/images/slide-in-glove-t.webp',small:'/images/slide-in-glove.webp',srcSet:'/images/slide-in-glove-t.webp 480w, /images/slide-in-glove.webp 1400w',width:1400,height:1120,
  alt:'Ein gerahmtes Dia, gehalten mit einem weißen Baumwollhandschuh',caption:'Digital · Dia',edge:17},
 {src:'/images/film-shelf-l.webp',thumb:'/images/film-shelf-t.webp',small:'/images/film-shelf.webp',srcSet:'/images/film-shelf-t.webp 480w, /images/film-shelf-l.webp 1600w',width:1600,height:1067,
  alt:'Filmpackungen im Analog Store, unter anderem von Kodak, CineStill und Ilford',caption:'Store · Filme',edge:18},
 {src:'/images/lab-film-l.webp',thumb:'/images/lab-film.webp',small:'/images/lab-film.webp',srcSet:'/images/lab-film.webp 600w, /images/lab-film-l.webp 1600w',width:1600,height:1066,
  alt:'Belichtete Kleinbildpatronen für den C-41-Prozess, darunter Kodak Portra 800',caption:'Belichtet · Portra',edge:19},
];

/** Frame marked with the red grease pencil on the contact sheet (index into heroFrames). */
export const SELECTED_FRAME=2;
/** Contact-sheet grid: 4 columns × 2 rows. */
export const SHEET_COLUMNS=4;
