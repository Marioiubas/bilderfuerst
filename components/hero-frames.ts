// Real business photographs shown as frames of the hero negative strip / contact sheet.
// Sources: public/images (photostudio.de originals, see docs/ASSET-PROVENANCE.md and
// docs/BRAND-VISUAL-RESEARCH.md). Captions only name what the picture shows; the 2018
// storefront keeps its year because its Fuji X signage is historic (SOURCE-CONFLICTS #9).
export type HeroFrame={
 /** Large rendition (used by the DOM strip via srcSet). */
 src:string;
 /** Small rendition (≤ 1063 px) for srcSet and the WebGL texture atlas. */
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
 {src:'/images/store-exterior-gallery-window.webp',small:'/images/store-exterior-gallery-window.webp',width:1063,height:709,
  alt:'Das Eckgeschäft Alexanderstraße 2 in Fürth mit der Schaufenster-Galerie, Aufnahme von 2018',caption:'Fürth · 2018',edge:12},
 {src:'/images/film-rolls-l.webp',small:'/images/film-rolls.webp',srcSet:'/images/film-rolls.webp 600w, /images/film-rolls-l.webp 1600w',width:1600,height:1067,
  alt:'Belichtete Kleinbild-Farbfilme für den C-41-Prozess, aufgereiht im Labor',caption:'Labor · C-41',edge:13},
 {src:'/images/scan-adonal-l.webp',small:'/images/scan-adonal.webp',srcSet:'/images/scan-adonal.webp 600w, /images/scan-adonal-l.webp 1400w',width:1400,height:928,
  alt:'Laborscan eines Kodak Tri-X, entwickelt in Adonal: ein Porsche 911 in Schwarzweiß',caption:'Tri-X · Adonal',edge:14},
 {src:'/images/lab-scan-l.webp',small:'/images/lab-scan.webp',srcSet:'/images/lab-scan.webp 600w, /images/lab-scan-l.webp 1600w',width:1600,height:1066,
  alt:'Ein 35-mm-Negativstreifen läuft in den Noritsu-Filmscanner des Labors',caption:'Scan · Noritsu',edge:15},
 {src:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',small:'/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp',width:1400,height:926,
  alt:'Workshop Schwarzweiß-Filmentwicklung: zwei Teilnehmer prüfen Negative am Leuchtpult',caption:'Workshop · SW',edge:16},
 {src:'/images/slide-in-glove.webp',small:'/images/slide-in-glove.webp',width:1400,height:1120,
  alt:'Ein gerahmtes Dia, gehalten mit einem weißen Baumwollhandschuh',caption:'Digital · Dia',edge:17},
 {src:'/images/film-shelf-l.webp',small:'/images/film-shelf.webp',srcSet:'/images/film-shelf.webp 600w, /images/film-shelf-l.webp 1600w',width:1600,height:1067,
  alt:'Filmpackungen im Analog Store, unter anderem von Kodak, CineStill und Ilford',caption:'Store · Filme',edge:18},
 {src:'/images/store-front-l.webp',small:'/images/store-front.webp',srcSet:'/images/store-front.webp 600w, /images/store-front-l.webp 1063w',width:1063,height:709,
  alt:'Schaufenster der Street Gallery mit gerahmten Schwarzweiß-Abzügen',caption:'Street Gallery',edge:19},
];

/** Frame marked with the red grease pencil on the contact sheet (index into heroFrames). */
export const SELECTED_FRAME=2;
/** Contact-sheet grid: 4 columns × 2 rows. */
export const SHEET_COLUMNS=4;
