// Film-development data for the configurator and the lab page.
// Prices, variant names and source URLs come ONLY from lib/catalog.json (the real ePages variants).
// Process, machine, scan and developer facts: docs/BUSINESS-RESEARCH-V2.md (verified 2026-10-05).
import {bySlug,formatPrice} from '@/lib/catalog';

export const FORMAT_IDS=['35mm','120','110'] as const;
export const PROCESS_IDS=['C-41','S/W','S/W Push/Pull','E-6'] as const;
export const SCAN_IDS=['Ohne Scan','JPG','TIFF'] as const;
export const DELIVERY_IDS=['laden','post','dropoff'] as const;
export type FormatId=(typeof FORMAT_IDS)[number];
export type ProcessId=(typeof PROCESS_IDS)[number];
export type ScanId=(typeof SCAN_IDS)[number];
export type DeliveryId=(typeof DELIVERY_IDS)[number];
export type ProcessKind='c41'|'bw'|'e6';

export const SOURCE_DATE='04.10.2026';

/** Configurator choice steps: ONE source for the step count in lead, bar, strip, progress row and
 * ticket (audit P4). The order note is the summary, numbered outside the choice steps ("Notiz"). */
export type StepId='format'|'process'|'scan'|'qty'|'delivery';
export type StepDef={id:StepId;label:string;href:string;optional?:boolean};
export const STEPS:readonly StepDef[]=[
 {id:'format',label:'Format',href:'#step-format'},
 {id:'process',label:'Prozess',href:'#step-process'},
 {id:'scan',label:'Scan',href:'#step-scan'},
 {id:'qty',label:'Menge',href:'#step-qty'},
 {id:'delivery',label:'Abgabe',href:'#step-delivery',optional:true},
];
export const SUMMARY_STEP={label:'Auftragsnotiz',short:'Notiz',href:'#fc-summary'} as const;
export const STEP_COUNT_LABEL=`${STEPS.length} Schritte + ${SUMMARY_STEP.label}`;
export const stepNo=(id:StepId)=>String(STEPS.findIndex(s=>s.id===id)+1).padStart(2,'0');

/** short = the one descriptor on the format tile; object + hint are technical (expert mode). code = render file. */
export const formats:Record<FormatId,{master:string;name:string;short:string;sub:string;object:string;hint?:string;code:string}>={
 '35mm':{master:'filmentwicklung-kleinbild',name:'35mm',short:'Kleinbild',sub:'Kleinbild · 135',object:'Filmpatrone',hint:'Auch Halbformat, z. B. Pentax 17',code:'135'},
 '120':{master:'filmentwicklung-mittelformat',name:'120',short:'Mittelformat',sub:'Mittelformat · Rollfilm',object:'Spule mit Schutzpapier',hint:'6×4,5 bis 6×9',code:'120'},
 '110':{master:'filmentwicklung-pocket-110',name:'110',short:'Pocket',sub:'Pocket',object:'Kassette',hint:'Kleine Pocket-Kassette',code:'110'},
};

/** Exact machine/chemistry wording from the product pages (live 2026-10-05). */
export const processes:Record<ProcessId,{label:string;strip:string;title:string;kind:ProcessKind;machine:string;chemistry:string;explain:string;quote:string;marker?:string}>={
 'C-41':{label:'C-41',strip:'C-41',title:'Farbnegativ',kind:'c41',machine:'Fujifilm-Minilab',chemistry:'Fujifilm-Chemie',explain:'Für die meisten Farbnegativfilme, etwa Kodak Portra oder Gold. Steht „C-41“ auf Packung oder Patrone, bist du hier richtig.',quote:'Farbfilme (C41) werden in einem Fujifilm Minilab und Fujifilm Chemie entwickelt.'},
 'S/W':{label:'Schwarzweiß',strip:'SW',title:'Schwarzweiß-Negativ',kind:'bw',machine:'Jobo-Rotationsmaschinen',chemistry:'individuell, Wunsch-Entwickler auf Anfrage',explain:'Für klassische Schwarzweiß-Negativfilme wie Ilford HP5 oder Kodak Tri-X.',quote:'Schwarz Weiss Filme entwickeln wir individuell in Jobo Rotationsmaschinen.'},
 'S/W Push/Pull':{label:'SW Push/Pull',strip:'SW ±',title:'Schwarzweiß, gepusht oder gepullt',kind:'bw',machine:'Jobo-Rotationsmaschinen',chemistry:'Entwicklung an die Belichtung angepasst',explain:'Für Schwarzweißfilm, den du mit höherer oder niedrigerer ISO belichtet hast als aufgedruckt. Möglichen Bereich bitte im Laden erfragen.',quote:'Schwarz Weiss Filme entwickeln wir individuell in Jobo Rotationsmaschinen.',marker:'PUSH/PULL'},
 'E-6':{label:'E-6',strip:'E-6',title:'Diafilm',kind:'e6',machine:'Rotationsmaschine',chemistry:'CineStill-E-6-Chemie',explain:'Für Dia- bzw. Umkehrfilm wie Fujifilm Velvia oder Provia: Du bekommst Positive statt Negative.',quote:'Dia Filme (E6) werden in Cinestill E 6 Chemie in einer Rotationsmaschine entwickelt.'},
};

export const deliveries:Record<DeliveryId,{label:string;strip:string;lines:string[]}>={
 laden:{label:'Im Laden abgeben',strip:'Laden',lines:['Analog Store · Alexanderstraße 2, 90762 Fürth','Mo–Fr 9:30–18:30 · Sa 9:30–16:30']},
 post:{label:'Per Post einschicken',strip:'Post',lines:['Adresse, Verpackung und Rückweg bitte vorab erfragen.','Telefon 0911 774202 · info@analog-store.de']},
 dropoff:{label:'Drop-off-Stelle',strip:'Drop-off',lines:['Fuji-Store Nürnberg / home of x photography · Adlerstraße 34, 90403 Nürnberg · Mo–Sa 10:00–18:30','bilderfürst Manufaktur · Mittlere Str. 11, 90768 Fürth-Dambach · Mo–Fr 8:00–17:00','Laut Drop-off-Seite, Stand 05.10.2026. Bedingungen bitte im Laden erfragen.']},
};

export type Variant={slug:string;name:string;optionLabel:string;format:FormatId;process:ProcessId;scan:ScanId;price:number;inStock:boolean;source:string};

function processOf(label:string):ProcessId|null{
 if(/^Schwarz-Weiß Push\/Pull/.test(label))return 'S/W Push/Pull';
 if(/^Schwarz-Weiß/.test(label))return 'S/W';
 if(/^C-41/.test(label))return 'C-41';
 if(/^E-6/.test(label))return 'E-6';
 return null;
}
function scanOf(label:string):ScanId|null{
 if(/ohne Scan/i.test(label))return 'Ohne Scan';
 if(/\(JPG\)/.test(label))return 'JPG';
 if(/\(TIFF\)/.test(label))return 'TIFF';
 return null;
}

/** Every development variant from the catalog, parsed from its option label. */
export const variants:Variant[]=FORMAT_IDS.flatMap(format=>{
 const master=bySlug(formats[format].master);
 return (master?.variants??[]).flatMap(ref=>{
  const p=bySlug(ref.slug);if(!p)return [];
  const process=processOf(p.optionLabel),scan=scanOf(p.optionLabel);
  if(!process||!scan)return [];
  return [{slug:p.slug,name:p.name,optionLabel:p.optionLabel,format,process,scan,price:p.price,inStock:p.inStock,source:p.source}];
 });
});

export const masterSource=(f:FormatId|null)=>bySlug(formats[f??'35mm'].master)?.source??'https://www.photostudio.de/';
export const findVariant=(f:FormatId,p:ProcessId,s:ScanId)=>variants.find(v=>v.format===f&&v.process===p&&v.scan===s);
export const processesFor=(f:FormatId)=>PROCESS_IDS.filter(p=>variants.some(v=>v.format===f&&v.process===p));
export const formatsFor=(p:ProcessId)=>FORMAT_IDS.filter(f=>variants.some(v=>v.format===f&&v.process===p));
export type Selection={format?:FormatId|null;process?:ProcessId|null;scan?:ScanId|null};
export function matching(sel:Selection){return variants.filter(v=>(!sel.format||v.format===sel.format)&&(!sel.process||v.process===sel.process)&&(!sel.scan||v.scan===sel.scan))}
export function minPrice(sel:Selection){const list=matching(sel);return list.length?Math.min(...list.map(v=>v.price)):null}

/** TIFF surcharge over JPG, derived from the catalog (must be identical for every format/process pair). */
export function tiffPremium(f?:FormatId|null,p?:ProcessId|null){
 const diffs=variants.filter(v=>v.scan==='TIFF'&&(!f||v.format===f)&&(!p||v.process===p)).map(t=>{const j=findVariant(t.format,t.process,'JPG');return j?Math.round((t.price-j.price)*100)/100:null}).filter((d):d is number=>d!==null);
 return diffs.length&&diffs.every(d=>d===diffs[0])?diffs[0]:null;
}

export function formatDelta(d:number){if(Math.abs(d)<.005)return '±0,00 €';return `${d>0?'+':'−'}${formatPrice(Math.abs(d))}`}

/** Scan label exactly as the catalog names it ("Large Scan" for 35mm/120, "Scan" for 110). */
export function scanLabel(f:FormatId|null,s:ScanId){if(s==='Ohne Scan')return 'Ohne Scan';return `${f==='110'?'Scan':'Large Scan'} (${s})`}

/** Noritsu HS-1800 output in px as published on the development product pages. 110: none published. */
export type ScanSize={id:string;label:string;w:number;h:number;note?:string;conflict?:boolean};
export const scanSizes:Record<FormatId,ScanSize[]>={
 '35mm':[{id:'kb',label:'Kleinbild',w:6774,h:4492},{id:'hf',label:'Halbformat',w:4492,h:3167,note:'z. B. Pentax 17'}],
 '120':[{id:'645',label:'6×4,5',w:4800,h:3500},{id:'66',label:'6×6',w:4700,h:4700},{id:'67',label:'6×7',w:5900,h:4800},{id:'68',label:'6×8',w:6600,h:4900},{id:'69',label:'6×9',w:7100,h:4900,conflict:true}],
 '110':[],
};
export const WHOLE_ROLL_69='5028 × 7505';
export const megapixels=(w:number,h:number)=>(w*h/1e6).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
export const px=(n:number)=>String(n);

/** Kodak Tri-X sample scans from the homepage slider; captions verbatim (dilution, time). */
export const developers=[
 {id:'adonal',name:'Adox Adonal',dilution:'1+25',time:'7:00'},
 {id:'silvermax',name:'Adox Silvermax',dilution:'1+19',time:'12:00'},
 {id:'d76',name:'Kodak D-76',dilution:'1+0',time:'6:45'},
 {id:'hc110',name:'Kodak HC-110',dilution:'1+31',time:'6:00'},
] as const;
export type Developer=(typeof developers)[number];

/** Lenient URL parsing for deep links (PDP bridge): ?format=35mm&process=C-41&scan=JPG&qty=2 */
export function parseFormat(v:string|null):FormatId|null{if(!v)return null;const s=v.trim().toLowerCase();if(['35mm','35','135','kleinbild'].includes(s))return '35mm';if(['120','mittelformat'].includes(s))return '120';if(['110','pocket'].includes(s))return '110';return null}
export function parseProcess(v:string|null):ProcessId|null{if(!v)return null;const s=v.trim().toLowerCase().replace(/\s+/g,' ');if(['c-41','c41'].includes(s))return 'C-41';if(['e-6','e6'].includes(s))return 'E-6';if(/push|pull/.test(s))return 'S/W Push/Pull';if(['s/w','sw','schwarzweiß','schwarzweiss','schwarz-weiß','bw'].includes(s))return 'S/W';return null}
export function parseScan(v:string|null):ScanId|null{if(!v)return null;const s=v.trim().toLowerCase();if(['ohne scan','ohne','none','0'].includes(s))return 'Ohne Scan';if(['jpg','jpeg'].includes(s))return 'JPG';if(['tiff','tif'].includes(s))return 'TIFF';return null}
export function parseQty(v:string|null){if(!v)return null;const n=Number.parseInt(v,10);return Number.isFinite(n)&&n>=1&&n<=99?n:null}
/** Encode a param value but keep "/" readable (process=S/W%20Push/Pull). */
export const encParam=(v:string)=>encodeURIComponent(v).replace(/%2F/gi,'/');
export const configHref=(sel:{format:FormatId;process:ProcessId;scan:ScanId})=>`/filmentwicklung?format=${encParam(sel.format)}&process=${encParam(sel.process)}&scan=${encParam(sel.scan)}`;
