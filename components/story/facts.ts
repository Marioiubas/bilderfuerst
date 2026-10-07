// Story area · verified facts (client-safe: no JSON imports).
// Every value is taken from the live source pages as documented in docs/BUSINESS-RESEARCH-V2.md
// (re-verified 2026-10-05) and follows the safe wording in docs/SOURCE-CONFLICTS.md.

export const SRC={
 history:'https://www.photostudio.de/i/unsere-geschichte',
 gallery:'https://www.photostudio.de/i/galerie',
 digitization:'https://www.photostudio.de/i/wir-digitalisieren',
 store:'https://www.photostudio.de/i/unser-geschaeft',
 contact:'https://www.photostudio.de/i/kontakt-und-oeffnungszeiten',
 dropoff:'https://www.photostudio.de/i/drop-off-locations',
 passbilder:'https://www.photostudio.de/i/passbilder-preise',
 bewerbung:'https://www.photostudio.de/i/bewerbungsbilder-preise',
 fineart:'https://www.photostudio.de/i/fineart-prints',
 prices:'https://www.photostudio.de/i/preisliste',
 home:'https://www.photostudio.de/',
} as const;

/** Real Calenso booking widget of the shop (source: /i/online-terminvergabe). */
export const BOOKING='https://widget.calenso.com/?partner=bilderfuerstfuerth&type=appointment&isFrame=true&lang=de_CH';
export const PHONE={display:'0911 774202',href:'tel:+49911774202'} as const;
/** SOURCE-CONFLICTS #2: the contact page address is the single address shown in custom UI. */
export const EMAIL='info@analog-store.de';
export const mapsRoute=(destination:string)=>`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

/** Opening hours per weekday, Monday = 0. Minutes after midnight; null = no hours published. */
export type Week=[number,number]|null;
export type Hours=readonly [Week,Week,Week,Week,Week,Week,Week];
const h=(a:number,b:number):[number,number]=>[a,b];
export const WEEKDAYS=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'] as const;

export type Place={id:'fuerth'|'nuernberg'|'manufaktur';code:string;name:string;role:string;street:string;city:string;hours:Hours;hoursText:string;note?:string};
export const PLACES:readonly Place[]=[
 {id:'fuerth',code:'FTH',name:'Analog Store · bilderfürst Fürth',role:'Unser Geschäft',street:'Alexanderstraße 2',city:'90762 Fürth',hours:[h(570,1110),h(570,1110),h(570,1110),h(570,1110),h(570,1110),h(570,990),null],hoursText:'Mo–Fr 09:30–18:30 · Sa 09:30–16:30'},
 {id:'nuernberg',code:'NBG',name:'Fuji-Store Nürnberg / home of x photography',role:'Abgabestelle Nürnberg',street:'Adlerstraße 34',city:'90403 Nürnberg',hours:[h(600,1110),h(600,1110),h(600,1110),h(600,1110),h(600,1110),h(600,1110),null],hoursText:'Mo–Sa 10:00–18:30',note:'Abgabestelle laut Website. Zu Laufzeiten macht die Quelle keine Angabe.'},
 {id:'manufaktur',code:'MFK',name:'bilderfürst Manufaktur',role:'Digitalisierung · Abgabestelle',street:'Mittlere Str. 11',city:'90768 Fürth-Dambach',hours:[h(480,1020),h(480,1020),h(480,1020),h(480,1020),h(480,1020),null,null],hoursText:'Mo–Fr 08:00–17:00',note:'Hier arbeitet die Digitalisierung. Als Abgabestelle auf der Website gelistet.'},
];

export const fmtTime=(m:number)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
export const euro=(n:number)=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);

/* ───────── History: verified chronology (source /i/unsere-geschichte, edited 2020-11-19) ───────── */
export type ChapterImage={src:string;srcSet?:string;w:number;h:number;alt:string;caption:string};
export type Chapter={year:string;title:string;body:readonly string[];note?:string;historic?:boolean;image?:ChapterImage;links?:readonly {href:string;label:string}[]};
export const CHAPTERS:readonly Chapter[]=[
 {year:'1935',title:'Foto Seitz, Nürnberg',body:['Ernst Dittmer, Großvater des heutigen Inhabers, war Mitarbeiter der Firma Foto Seitz in Nürnberg und wurde später Gesellschafter.','Foto Seitz betrieb damals schon eigene Fotolabore und Kopiervorrichtungen für Negative.','In den Kriegsjahren war Ernst Dittmer als Fotograf in der Luftwaffe tätig – mit einer Leica.']},
 {year:'1945',title:'Wiederaufbau',body:['Die Firma Foto Seitz wurde wieder aufgebaut. Später folgte die Übernahme der Gesellschaftsanteile.']},
 {year:'1973',title:'Bilderfürst in Erlangen',body:['Die Brüder Wulf und Klaus Dittmer gründeten die Firma Bilderfürst in Erlangen.','In den Jahren darauf kamen weitere Standorte dazu: zweimal in Nürnberg und in Fürth.']},
 {year:'2001',title:'Die dritte Generation',body:['Jan Dittmer kaufte Bilderfürst in Fürth. Damit ist die dritte Generation der Familie Dittmer als Unternehmer in der Fotografie tätig.']},
 {year:'2010',title:'Leica Boutique in Fürth',body:['In Fürth eröffnete die Leica Boutique – nach Angabe der Geschichtsseite die erste offizielle Leica Boutique der Welt.'],historic:true},
 {year:'2012',title:'Die Manufaktur',body:['Der Digitalisierungsbereich wurde in eine eigene Firma ausgegliedert: die bilderfürst Manufaktur in Fürth-Dambach.'],note:'Die Seite „Wir digitalisieren“ datiert die Ausgliederung mit eigenem Gebäude auf Ende 2011.',links:[{href:'/digitalisierung',label:'Digitalisierung heute'}]},
 {year:'2017',title:'Nürnberg und der Umbau in Fürth',body:['In Nürnberg eröffneten der Leica Store und die Leica Galerie, als Filiale der bilderfürst Fürth GmbH & Co KG.','Im selben Jahr wurde das Hauptgeschäft in der Alexanderstraße 2 für FineArt Printing und als 1. Fuji X Store umgebaut.'],historic:true,image:{src:'/images/store-exterior-corner.webp',w:1063,h:709,alt:'Das Eckgeschäft Alexanderstraße 2 im März 2018 mit „fine Art Printing“-Tafeln, „X Store“- und Fujifilm-Beschilderung',caption:'Alexanderstraße 2 nach dem Umbau · Aufnahme März 2018 · Beschilderung von damals'}},
 {year:'2020',title:'home of X photography · Street Gallery',body:['In Nürnberg eröffnete home of X photography, der Fuji-Store.','Seit Anfang 2020 zeigt die Schaufenster-Galerie in Fürth als Street Gallery analoge Aufnahmen – neun Bilder im Fenster, rund um die Uhr.'],note:'Die Geschichtsseite nennt für 2020 den Trödelmarkt 11. Heute ist der Fuji-Store in der Adlerstraße 34, 90403 Nürnberg. Ein Galerie-Schaufenster gab es schon vorher (Aufnahme März 2018); die Geschichtsseite erwähnt eine „Fuji X-Street Galerie“, das Jahr ist dort nicht eindeutig angegeben.',image:{src:'/images/store-front-l.webp',srcSet:'/images/store-front.webp 600w, /images/store-front-l.webp 1063w',w:1063,h:709,alt:'Schaufenster mit neun gerahmten Schwarzweiß-Abzügen und dem Schild „Street Galerie“, März 2018',caption:'Das Galerie-Schaufenster · Aufnahme März 2018'},links:[{href:'/galerie',label:'Zur Street Gallery'},{href:'/kontakt#abgabestellen',label:'Fuji-Store als Abgabestelle'}]},
 {year:'Heute',title:'Analog Store mit eigenem Labor',body:['Das kleine Ladengeschäft in der Alexanderstraße 2 hat sich auf analoge Fotografie spezialisiert: Filmentwicklung im hauseigenen Labor, Kleinbildfilme 135 und Rollfilme 120, Drucke bis A3+, Fototaschen und Stative, Pass- und Bewerbungsbilder. Analoge Kameras kauft der Laden auch an.','Im Labor: Farbfilm (C-41) im Fujifilm Minilab, Schwarzweiß individuell in Jobo-Rotationsmaschinen, Dia (E-6) mit CineStill-Chemie. Gescannt wird mit dem Noritsu HS-1800.'],links:[{href:'/filmentwicklung',label:'Film entwickeln lassen'},{href:'/kontakt',label:'Laden besuchen'}]},
];
