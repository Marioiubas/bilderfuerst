// Digitization facts for /digitalisierung. Every value below is taken from
// docs/BUSINESS-RESEARCH-V2.md (live re-verification 2026-10-05) and the restored
// source pages in lib/source-content.json. Prices exist ONLY where the business
// publishes them (price graphics "Negativ Preise 26", "Dia Preise 26",
// "schmalfilm 26", "Video1/2/3" and the page text). Nothing here is estimated.

export const SOURCE_DATE='05.10.2026';

export type ObjectId='dia'|'negativ'|'foto'|'film'|'video'|'audio'|'platte';
export type EstimateMode='film'|'video'|'dia'|'negativ';

export type PriceTable={
 caption:string;
 /** Column headers, e.g. quantity tiers. */
 cols:string[];
 rows:{label:string;note?:string;values:string[]}[];
 extras?:string[];
 source:string;
};

export type DigiObject={
 id:ObjectId;
 code:string;
 name:string;
 /** Short line under the tile. */
 hint:string;
 /** Which technical formats the object can be (identification, general). */
 formats:string[];
 formatsNote?:string;
 /** What bilderfürst does (verified source copy, paraphrased). */
 service:string[];
 serviceLead?:string;
 stats?:{k:string;v:string}[];
 prices?:PriceTable;
 priceNote?:string;
 delivery?:string;
 estimate?:EstimateMode;
 link:{href:string;label:string};
};

export const objects:DigiObject[]=[
 {
  id:'dia',code:'01',name:'Dia / Dia-Magazin',hint:'Gerahmt, im Magazin oder lose',
  formats:['Kleinbild-Dia im 5 × 5-cm-Rahmen','Glasrahmen (offen)','Mittelformat-Dia','Großformat-Dia','Pocket-Dia'],
  formatsNote:'Magazine: Universal (Leitz / Einheit), Braun Paximat, Foto-Quelle, LKM, CS (Agfa, Reflekta). Kodak-Karussell-Magazine werden gegen Aufpreis umsortiert.',
  serviceLead:'Der Premium-Scan ist Standard:',
  service:[
   'Reinigung mit Druckluft vor dem Scan',
   'Staub- und Kratzerentfernung mit ICE5 direkt beim Scan (Farbdias)',
   'Originalauflösung, ca. 13–15 MP bei Kleinbild',
   'Scan direkt aus deinem Magazin – die Dias kommen in deiner Reihenfolge zurück ins Magazin',
   'Jedes Magazin ein eigener Ordner, jedes Dia mit seiner Magazinnummer',
   'Drehen ins richtige Hoch- oder Querformat, semi-automatische Farb- und Bildkorrektur',
   'DVD inklusive (ca. 900 Dias pro DVD) – dein USB-Stick oder deine Festplatte zusätzlich und kostenfrei',
  ],
  stats:[{k:'Scanzeit',v:'4:30 Min. pro Dia'},{k:'50er-Magazin',v:'knapp 4 Std.'}],
  prices:{
   caption:'Preis je Dia · laut Preisliste 2026',
   cols:['ab 1','ab 100','ab 500'],
   rows:[
    {label:'Kleinbild, gerahmt im Magazin',values:['0,50 €','0,30 €','0,30 €']},
    {label:'Kleinbild ohne Magazin',values:['0,50 €']},
    {label:'Offene Glasrahmen',values:['1,00 €']},
    {label:'Mittelformat',values:['1,50 €','1,00 €','1,00 €']},
    {label:'Großformat',values:['10,00 €','8,00 €','5,00 €']},
    {label:'Pocket',values:['0,70–2,00 €']},
   ],
   extras:['TIFF Premium: +50 %','Kodak Karussell umsortieren: +0,10 € je Dia','Trommelscan: ab 15,00 € je Kleinbild-Dia'],
   source:'Preisgrafik „Dia Preise 26“ und Seitentext, photostudio.de/i/dias-digitalisierung-1',
  },
  priceNote:'Der ältere Seitentext nennt 0,20 € ab 500 Dias. Gezeigt wird der Wert der neueren Preisgrafik 2026.',
  delivery:'10 Tage bis 1.000 Dias · 14 Tage bis 5.000 Dias',
  estimate:'dia',
  link:{href:'/i/dias-digitalisierung-1',label:'Alles zur Dia-Digitalisierung'},
 },
 {
  id:'negativ',code:'02',name:'Negativstreifen',hint:'Farbe oder Schwarzweiß',
  formats:['Kleinbild 35 mm: Streifen, einzeln geschnitten oder Einzelnegativ','Mittelformat 4 × 4 bis 6 × 9','Großformat bis 18 × 24','APS','Pocket & Minox'],
  serviceLead:'Der Premium-Scan ist Standard:',
  service:[
   'Reinigung mit Druckluft vor dem Scan',
   'Staub- und Kratzerentfernung mit ICE5 bei allem Farbmaterial – bei Schwarzweiß technisch nicht möglich',
   'Originalauflösung, ca. 13–15 MP bei Kleinbild',
   'Jeder Film ein eigener Ordner, jedes Negativ nummeriert (1–36) in der vorhandenen Sortierung',
   'Drehen ins richtige Hoch- oder Querformat, semi-automatische Farb- und Bildkorrektur',
   'DVD inklusive (ca. 900 Negative pro DVD) – dein USB-Stick oder deine Festplatte zusätzlich und kostenfrei',
  ],
  stats:[{k:'Scanzeit',v:'4:00 Min. pro Negativ'},{k:'36er-Film',v:'gut 2 Std.'}],
  prices:{
   caption:'Preis je Negativ · laut Preisliste 2026',
   cols:['ab 2','ab 100','ab 1.000'],
   rows:[
    {label:'Kleinbild, ganze Streifen',values:['0,39 €','0,29 €','0,20 €']},
    {label:'Kleinbild, einzeln aus dem Streifen',values:['0,49 €','0,39 €','0,39 €']},
    {label:'Kleinbild, Einzelnegative',values:['0,59 €','0,49 €','0,49 €']},
    {label:'Mittelformat 4 × 4 – 6 × 9',note:'24–48 MP',values:['1,59 €','1,29 €','0,99 €']},
    {label:'Großformat bis 18 × 24',values:['5,99 €','5,40 €','4,50 €']},
    {label:'Pocket / Minox',values:['0,79 €','0,59 €','0,49 €']},
    {label:'APS',note:'je Film',values:['4,95–9,95 €']},
   ],
   extras:['TIFF Premium: +50 %'],
   source:'Preisgrafik „Negativ Preise 26“, photostudio.de/i/negativ-digitalisierung',
  },
  delivery:'10 Tage bis 1.000 Negative · 20 Tage bis 5.000 Negative',
  estimate:'negativ',
  link:{href:'/i/negativ-digitalisierung',label:'Alles zur Negativ-Digitalisierung'},
 },
 {
  id:'foto',code:'03',name:'Fotos & Abzüge',hint:'Papierbilder aus Kiste und Album',
  formats:['Papierabzüge, z. B. 9 × 13, 10 × 15, 13 × 18 cm','Größere Vergrößerungen'],
  formatsNote:'Liegen die Negative noch bei? Ein Scan vom Negativ holt meist mehr aus dem Bild als ein Scan vom Abzug.',
  service:['„Bilder“ stehen in der Leistungsübersicht der Manufaktur neben Dias und Negativen.','Ablauf, Auflösung und Ausgabe besprechen wir mit dir im Laden.'],
  priceNote:'Auf der Quellseite ist kein Preis veröffentlicht – wir nennen ihn dir im Laden oder am Telefon.',
  link:{href:'/i/wir-digitalisieren',label:'Leistungsübersicht „Wir digitalisieren“'},
 },
 {
  id:'film',code:'04',name:'Filmspule',hint:'Super 8, Normal 8, 16 mm, 35 mm',
  formats:['Super 8 · Single 8','Normal 8 (Doppel-8)','16 mm','9,5 mm Pathé','35 mm Kino','mit oder ohne Ton'],
  service:[
   'Filmreinigung vor und während der Digitalisierung, antistatisch und nass',
   'Echte Digitalisierung mit 18 oder 24 Bildern pro Sekunde',
   'DVD im echten DVD-Format (kein AVI oder MPEG1), nicht schreibgeschützt – kopier- und schneidbar',
   'DVD-Menü inklusive, jede Filmrolle bekommt ihren Namen',
   'Mit oder ohne Ton, mono oder stereo: kein Aufpreis',
   'Musik von CD oder Musikkassette überspielen wir auf Wunsch mit',
  ],
  prices:{
   caption:'Preis je Minute · laut Preisliste 2026 · zzgl. 19,95 € Auftragspauschale',
   cols:['ab 1 Min.','ab 300 Min.'],
   rows:[
    {label:'Super 8 & Normal 8',note:'DVD oder Full HD',values:['1,40 €','1,20 €']},
    {label:'16 mm',note:'Full HD',values:['2,50 €','2,00 €']},
    {label:'9,5 mm Pathé',note:'DVD',values:['4,50 €','3,00 €']},
    {label:'35 mm Kino',note:'Full HD',values:['6,00 €','5,00 €']},
   ],
   extras:['Auftragspauschale 19,95 € einmalig – DVD, Einrichtung, Reinigung, ggf. Versand; egal wie viele Spulen','Kleine Spulen unter 5 Min.: +2,00 € (Pathé +5,00 €, 35 mm +10,00 €)'],
   source:'Preisgrafik „schmalfilm 26“ und Seitentext, photostudio.de/i/super8-normal8-16mm-35mm-kino',
  },
  delivery:'Bearbeitungszeit bitte im Laden erfragen',
  estimate:'film',
  link:{href:'/i/super8-normal8-16mm-35mm-kino',label:'Alles zu Super 8, Normal 8, 16 & 35 mm'},
 },
 {
  id:'video',code:'05',name:'Videokassette',hint:'VHS, Video8, MiniDV …',
  formats:['VHS · S-VHS · VHS-C','Video8 · Hi8 · Digital8','MiniDV (DV, Mini DV HD, Micro DV)','Betamax · Video 2000','Profi: Betacam (SP, Digi-Beta), DVCAM, DVCPRO, U-Matic'],
  service:[
   'Festpreis je Kassette, kein Minutenaufpreis',
   'Jede Bandlänge von 5 bis 240 Min., SP und LP',
   'Jede Fernsehnorm: PAL, NTSC, SECAM',
   'Über 200 Videoabspielgeräte im Bestand',
   'Ausgabe als DVD oder MP4 in HD (1280 × 720)',
   'HD auf Wunsch: in Originalauflösung abgenommen und rechnerisch hochskaliert (MPEG4), auf deinem USB-Stick (mind. 40 MB/s) oder deiner Festplatte',
  ],
  prices:{
   caption:'Festpreis je Kassette · laut Preisliste',
   cols:['ab 1','ab 10','ab 50'],
   rows:[
    {label:'VHS, S-VHS, VHS-C, Video8, Hi8, Digital8, MiniDV, Video 2000, Betamax',values:['19,95 €','15,00 €','12,00 €']},
    {label:'NTSC / SECAM nach PAL',values:['29,95 €','24,95 €','19,95 €']},
    {label:'Profi: Betacam, Betacam SP, Digi-Beta, DVCAM, DV, DVCPRO, U-Matic',values:['29,95 €']},
   ],
   extras:['Mengenrabatte für Profi-Formate auf Anfrage'],
   source:'Preisgrafiken „Video1/2/3“, photostudio.de/i/alle-videokassetten-und-formate',
  },
  delivery:'Bearbeitungszeit bitte im Laden erfragen',
  estimate:'video',
  link:{href:'/i/alle-videokassetten-und-formate',label:'Alle Videokassetten und Formate'},
 },
 {
  id:'audio',code:'06',name:'Tonband / Musikkassette',hint:'Spule oder MC',
  formats:['Tonband auf Spule','Musikkassette (MC)'],
  service:['Tonbänder und Musikkassetten gehören zum Digitalisierungsangebot der Manufaktur (Leistungsübersicht „Wir digitalisieren“).','Abspielweg, Ausgabeformat und Preis klären wir persönlich.'],
  priceNote:'Auf der Quellseite ist kein Preis veröffentlicht – wir nennen ihn dir im Laden oder am Telefon.',
  link:{href:'/i/wir-digitalisieren',label:'Leistungsübersicht „Wir digitalisieren“'},
 },
 {
  id:'platte',code:'07',name:'Schallplatte',hint:'Vinyl',
  formats:['LP (30 cm)','Single (17 cm)'],
  formatsNote:'Welche Plattenformate verarbeitet werden, bitte im Laden erfragen.',
  service:['Schallplatten stehen in der Leistungsübersicht „Wir digitalisieren“.','Ausgabeformat und Preis klären wir persönlich.'],
  priceNote:'Auf der Quellseite ist kein Preis veröffentlicht – wir nennen ihn dir im Laden oder am Telefon.',
  link:{href:'/i/wir-digitalisieren',label:'Leistungsübersicht „Wir digitalisieren“'},
 },
];

/* ───────── Estimator (published prices only) ───────── */

export const filmRates={
 s8:{label:'Super 8 / Normal 8',r1:1.40,r300:1.20},
 mm16:{label:'16 mm',r1:2.50,r300:2.00},
 pathe:{label:'9,5 mm Pathé',r1:4.50,r300:3.00},
 mm35:{label:'35 mm Kino',r1:6.00,r300:5.00},
} as const;
export type FilmFormat=keyof typeof filmRates;
export const FILM_FEE=19.95;

export const videoRates={
 home:{label:'Heimformat (VHS, VHS-C, Video8, Hi8, Digital8, MiniDV, Betamax, Video 2000)',tiers:[19.95,15.00,12.00]},
 ntsc:{label:'Heimformat in NTSC / SECAM, nach PAL',tiers:[29.95,24.95,19.95]},
 pro:{label:'Profi (Betacam, Digi-Beta, DVCAM, DVCPRO, U-Matic)',tiers:[29.95,29.95,29.95]},
} as const;
export type VideoKind=keyof typeof videoRates;
/** Estimator "Kassettentyp": short labels (they fit a closed select on a 360 px phone) named
 *  like the formats in the chooser; each maps to a published price group (videoRates). The
 *  full format list of the group is shown as help text under the control. */
const HOME_HELP='Heimformat, ein Festpreis für VHS, S-VHS, VHS-C, Video8, Hi8, Digital8, MiniDV, Video 2000 und Betamax.';
export const videoTypes={
 vhs:{label:'VHS / S-VHS / VHS-C',kind:'home',help:HOME_HELP},
 v8:{label:'Video8 / Hi8 / Digital8',kind:'home',help:HOME_HELP},
 minidv:{label:'MiniDV',kind:'home',help:HOME_HELP},
 beta:{label:'Betamax / Video 2000',kind:'home',help:HOME_HELP},
 ntsc:{label:'NTSC / SECAM nach PAL',kind:'ntsc',help:'Heimformat in NTSC / SECAM, nach PAL.'},
 pro:{label:'Profi-Format',kind:'pro',help:'Betacam, Betacam SP, Digi-Beta, DVCAM, DV, DVCPRO, U-Matic. Mengenrabatte für Profi-Formate auf Anfrage.'},
} as const satisfies Record<string,{label:string;kind:VideoKind;help:string}>;
export type VideoType=keyof typeof videoTypes;

/** Slide tiers: from 1 / from 100 / from 500. */
export const diaRates={
 mag:{label:'Kleinbild, gerahmt im Magazin',tiers:[0.50,0.30,0.30]},
 loose:{label:'Kleinbild ohne Magazin',tiers:[0.50,0.50,0.50]},
 glass:{label:'Offene Glasrahmen',tiers:[1.00,1.00,1.00]},
 mf:{label:'Mittelformat',tiers:[1.50,1.00,1.00]},
 lf:{label:'Großformat',tiers:[10.00,8.00,5.00]},
} as const;
export type DiaKind=keyof typeof diaRates;

/** Negative tiers: from 2 / from 100 / from 1,000. */
export const negRates={
 strip:{label:'Kleinbild, ganze Streifen',tiers:[0.39,0.29,0.20]},
 cut:{label:'Kleinbild, einzeln aus dem Streifen',tiers:[0.49,0.39,0.39]},
 single:{label:'Kleinbild, Einzelnegative',tiers:[0.59,0.49,0.49]},
 mf:{label:'Mittelformat 4 × 4 – 6 × 9',tiers:[1.59,1.29,0.99]},
 lf:{label:'Großformat bis 18 × 24',tiers:[5.99,5.40,4.50]},
 pocket:{label:'Pocket / Minox',tiers:[0.79,0.59,0.49]},
} as const;
export type NegKind=keyof typeof negRates;

export const eur=(n:number)=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
const cents=(n:number)=>Math.round(n*100)/100;
const tierIndex=(count:number,steps:[number,number])=>count>=steps[1]?2:count>=steps[0]?1:0;

export type EstimateLine={label:string;value:number};
export type Estimate={total:number;lines:EstimateLine[];delivery?:string};

export function estimateFilm(format:FilmFormat,minutes:number):Estimate{
 const r=filmRates[format];const rate=minutes>=300?r.r300:r.r1;
 const scan=cents(minutes*rate);
 return{total:cents(FILM_FEE+scan),lines:[{label:'Auftragspauschale (einmalig)',value:FILM_FEE},{label:`${minutes} Min. × ${eur(rate)}${minutes>=300?' (ab 300 Min.)':''}`,value:scan}]};
}
export function estimateVideo(kind:VideoKind,count:number):Estimate{
 const per=videoRates[kind].tiers[tierIndex(count,[10,50])];
 return{total:cents(count*per),lines:[{label:`${count} Kassette${count===1?'':'n'} × ${eur(per)}`,value:cents(count*per)}]};
}
function deliveryFor(count:number,kind:'dia'|'negativ'){
 if(count<=1000)return 'Lieferzeit laut Quelle: 10 Tage (bis 1.000 Stück)';
 if(count<=5000)return `Lieferzeit laut Quelle: ${kind==='dia'?14:20} Tage (bis 5.000 Stück)`;
 return 'Lieferzeit über 5.000 Stück bitte im Laden erfragen';
}
export function estimateDia(kind:DiaKind,count:number,tiff:boolean,karussell:boolean):Estimate{
 const base=diaRates[kind].tiers[tierIndex(count,[100,500])];
 const per=cents(base*(tiff?1.5:1));
 const lines:EstimateLine[]=[{label:`${count} Dia${count===1?'':'s'} × ${eur(per)}${tiff?' (TIFF +50 %)':''}`,value:cents(count*per)}];
 if(karussell)lines.push({label:`Karussell umsortieren: ${count} × 0,10 €`,value:cents(count*.1)});
 return{total:cents(lines.reduce((a,l)=>a+l.value,0)),lines,delivery:deliveryFor(count,'dia')};
}
export function estimateNeg(kind:NegKind,count:number,tiff:boolean):Estimate{
 const base=negRates[kind].tiers[tierIndex(count,[100,1000])];
 const per=cents(base*(tiff?1.5:1));
 return{total:cents(count*per),lines:[{label:`${count} Negativ${count===1?'':'e'} × ${eur(per)}${tiff?' (TIFF +50 %)':''}`,value:cents(count*per)}],delivery:deliveryFor(count,'negativ')};
}

/* ───────── Drop-off (page /i/drop-off-locations, edited 2026-08-24) ───────── */
export const dropOffs=[
 {code:'FTH',name:'Analog Store Fürth',sub:'Unser Geschäft',address:'Alexanderstraße 2, 90762 Fürth',hours:'Mo–Fr 9:30–18:30 · Sa 9:30–16:30'},
 {code:'NBG',name:'Fuji-Store Nürnberg',sub:'home of x photography',address:'Adlerstraße 34, 90403 Nürnberg',hours:'Mo–Sa 10:00–18:30'},
 {code:'MNF',name:'bilderfürst Manufaktur',sub:'Fürth-Dambach',address:'Mittlere Straße 11, 90768 Fürth',hours:'Mo–Fr 8:00–17:00'},
] as const;
