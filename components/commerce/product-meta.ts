// Display helpers for catalog products (commerce stream). Derived only from catalog fields.
import {type Product,shopGroup,shopGroupLabels,products} from '@/lib/catalog';
import {brandOf,fromPrice} from '@/lib/shop-filters';
import {processKind,type ChipKind} from '@/components/analog/primitives';

/** Source names carry ePages artefacts ("Bild 1 - …", a repeated second half, double spaces). */
export function displayName(p:Product){
 let n=p.name.replace(/^Bild\s*\d+\s*-\s*/i,'').replace(/\s{2,}/g,' ').trim();
 const words=n.split(' ');
 if(words.length>5){const head=words.slice(0,2).join(' ');const at=n.indexOf(` ${head}`,head.length);if(at>12)n=n.slice(0,at).trim()}
 return n;
}
export const processLabel=(process:string)=>process==='Schwarzweiß'?'S/W':process;
export const processChip=(process:string):ChipKind|undefined=>process?processKind(process):undefined;
export const groupLabel=(p:Product)=>shopGroupLabels[shopGroup(p)];
export const brandLabel=(p:Product)=>brandOf(p)||groupLabel(p);
export function stockLabel(p:Product){return p.inStock?'Auf Lager':/originalshop/i.test(p.stock)?'Im Originalshop prüfen':'Lieferzeit anfragen'}
export function deliveryText(p:Product){return p.delivery?`Lieferzeit laut Originalshop: ${p.delivery.replace('-','–')} Tage`:''}
/** Mono data line, edge-print order: brand · format · process · ISO. */
export function edgeLine(p:Product){
 return [brandOf(p),p.format,processLabel(p.process),p.iso?`ISO ${p.iso}`:''].filter(Boolean).join(' · ').toUpperCase();
}
/** At most one badge, only from facts printed in the source name/category. */
export function badgeOf(p:Product){
 const expiry=p.name.match(/ablaufdatum\s*(\d{2}\/\d{2})/i);if(expiry)return `Ablauf ${expiry[1]}`;
 if(/infrarot/i.test(p.name))return 'Infrarot';
 if(shopGroup(p)==='Entwicklung')return 'Laborauftrag';
 return '';
}
export const priceLabel=(p:Product)=>({from:p.isMaster,amount:fromPrice(p)});

/* Lab orders (cart envelope tickets + configurator deep links) */
export type LabTicket={title:string;format:string;process:string;scan:string;formatParam:string;processParam:string};
export const isLabSlug=(slug:string)=>slug.startsWith('filmentwicklung-')||slug.startsWith('negativ-scan-');
export function labTicket(p:Product):LabTicket|null{
 if(!p.masterSlug||!isLabSlug(p.slug))return null;
 const o=p.optionLabel;
 const scan=/ohne Scan/i.test(o)?'Ohne Scan':`${/Large/i.test(o)||p.masterSlug==='negativ-scan-ganze-rollen'?'Large Scan':'Scan'} ${/TIFF/i.test(o)?'TIFF':'JPG'}`;
 if(p.masterSlug==='negativ-scan-ganze-rollen'){
  const mf=/Mittelformat/i.test(o);
  return {title:'Negativ-Scan · ganze Rolle',format:mf?'120 Mittelformat (max. 6×12)':'35mm Kleinbild',process:'Nur Scan · ungeschnitten',scan,formatParam:mf?'120':'35mm',processParam:''};
 }
 const format=p.masterSlug==='filmentwicklung-kleinbild'?'35mm Kleinbild':p.masterSlug==='filmentwicklung-mittelformat'?'120 Mittelformat':'110 Pocket';
 const formatParam=p.masterSlug==='filmentwicklung-kleinbild'?'35mm':p.masterSlug==='filmentwicklung-mittelformat'?'120':'110';
 const process=/^C-41/i.test(o)?'C-41':/^E-6/i.test(o)?'E-6':/Push\/Pull/i.test(o)?'S/W Push/Pull':'Schwarzweiß';
 const processParam=process==='C-41'?'C-41':process==='E-6'?'E-6':'S/W';
 return {title:'Filmentwicklung',format,process,scan,formatParam,processParam};
}

/** Verified development prices ("ohne Scan") read from the lab variants in lib/catalog.json. */
export function developFrom(format:'35mm'|'120',process:string){
 const master=format==='35mm'?'filmentwicklung-kleinbild':'filmentwicklung-mittelformat';
 const prefix=process==='C-41'?'C-41':process==='E-6'?'E-6':'Schwarz-Weiß Entwicklung';
 const v=products.find(x=>x.masterSlug===master&&x.optionLabel.startsWith(prefix)&&/ohne Scan/i.test(x.optionLabel)&&!/Push/i.test(x.optionLabel));
 return v?.price;
}
export const configuratorProcess=(process:string)=>process==='C-41'?'C-41':process==='E-6'?'E-6':process==='Schwarzweiß'?'S/W':'';

/** Same emulsion in the other format (e.g. Portra 400 135 ↔ 120): shared distinctive word + same ISO + process. */
const stop=new Set(['kodak','ilford','cinestill','fujifilm','adox','film','filme','rollfilm','kleinbild','kleinbildfilm','mittelformat','35mm','135','36','120','135-36','135/36','120/36','120/rollfilm','schwarz','weiss','weiß','schwarz-weiss','schwarz-weiß','schwarzweißfilm','schwarzweissfilm','professional','plus','pro','iso','color','negative','kb','dia','diafilm','dia-rollfilm','c-41','the','und','ablaufdatum','12/25','daylight','photo']);
const words=(p:Product)=>new Set(p.name.toLowerCase().replace(/[,()]/g,' ').split(/\s+/).filter(w=>w&&!stop.has(w)&&!/^\d+$/.test(w)));
export function sameFilmOtherFormat(p:Product,pool:Product[]){
 if(shopGroup(p)!=='Filme'||!p.format)return [];
 const mine=words(p);
 return pool.filter(o=>o.slug!==p.slug&&shopGroup(o)==='Filme'&&o.format&&o.format!==p.format&&o.iso===p.iso&&o.process===p.process&&brandOf(o)===brandOf(p)&&[...words(o)].some(w=>mine.has(w)));
}
