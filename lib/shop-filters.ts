// Shop filter + search model (commerce stream). Pure functions, no React.
// Facts used: lib/catalog.json fields (format, process, iso, filmKind, brand, price, inStock).
import {catalog,products,shopGroup,shopGroups,shopGroupLabels,type Product,type ShopGroup} from './catalog';

export type Category='Alle'|ShopGroup;
export type Format=''|'35mm'|'120';
export type Kind=''|'Farbe'|'Schwarzweiß'|'Dia';
export type Process=''|'C-41'|'Schwarzweiß'|'E-6';
export type IsoBucket=''|'≤100'|'200'|'400'|'800+';
export type Sort='auswahl'|'preis-auf'|'preis-ab'|'iso'|'name';
export type View='raster'|'index';
export type Filters={category:Category;q:string;format:Format;kind:Kind;iso:IsoBucket;process:Process;brand:string;stock:boolean;maxPrice:number|null;sort:Sort;view:View};
export type FacetKey='format'|'kind'|'iso'|'process'|'brand'|'stock'|'maxPrice';

export const emptyFilters:Filters={category:'Alle',q:'',format:'',kind:'',iso:'',process:'',brand:'',stock:false,maxPrice:null,sort:'auswahl',view:'raster'};
export const formats=['35mm','120'] as const;
export const kinds=['Farbe','Schwarzweiß','Dia'] as const;
export const isoBuckets=['≤100','200','400','800+'] as const;
export const processes=['C-41','Schwarzweiß','E-6'] as const;
export const sorts:Array<[Sort,string]>=[['auswahl','Unsere Auswahl'],['preis-auf','Preis ↑'],['preis-ab','Preis ↓'],['iso','ISO'],['name','Name']];
export const isoBucketLabel:Record<Exclude<IsoBucket,''>,string>={'≤100':'ISO 50 bis 100','200':'ISO 125 bis 200','400':'ISO 400','800+':'ISO 800 und höher'};
/** Tab order: everything the header links to, plus the lab services at the end. */
export const categoryOrder:Category[]=['Alle','Filme','Kameras','Sofortbild','Chemie','Equipment','Taschen','Bücher','Gutscheine','Entwicklung'];
export const categoryLabel=(c:Category)=>c==='Alle'?'Alle':shopGroupLabels[c];

/** Normalise German text for matching: lower case, ß→ss, umlauts→ae/oe/ue, no accents. */
export function norm(text:string){
 return text.toLocaleLowerCase('de-DE').replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').normalize('NFD').replace(/[̀-ͯ]/g,'');
}
const compact=(text:string)=>text.replace(/[^a-z0-9]/g,'');

/** Brand as shown on the card. Falls back to a brand printed in the product name (never invented). */
const nameBrands:Array<[RegExp,string]>=[[/^agfa/i,'Agfa Photo'],[/^ferrania/i,'Ferrania'],[/^fujicolor/i,'Fujifilm'],[/^billingham/i,'Billingham'],[/^moersch/i,'Moersch'],[/^zone imaging/i,'Zone Imaging'],[/^zine /i,'Zine']];
export function brandOf(p:Product){
 if(p.brand)return p.brand;
 for(const [re,label] of nameBrands)if(re.test(p.name))return label;
 return '';
}
export const isoValue=(p:Product)=>Number(p.iso)||0;
export function isoBucket(p:Product):IsoBucket{
 const n=isoValue(p);if(!n)return '';
 return n<=100?'≤100':n<=200?'200':n<=400?'400':'800+';
}
export const kindOf=(p:Product)=>(p.filmKind||'') as Kind;

/** Lowest orderable price: masters show "ab" the cheapest verified variant. */
export function fromPrice(p:Product){
 if(!p.isMaster||!p.variants.length)return p.price;
 const prices=p.variants.map(v=>productsBySlug(v.slug)?.price).filter((n):n is number=>typeof n==='number');
 return prices.length?Math.min(...prices):p.price;
}
let slugIndex:Map<string,Product>|null=null;
function productsBySlug(slug:string){slugIndex??=new Map(products.map(p=>[p.slug,p]));return slugIndex.get(slug)}

/* ───────── URL params ───────── */
type Getter=(key:string)=>string|null|undefined;
const pick=<T extends string>(value:string,table:Record<string,T>):T|''=>table[norm(value).trim()]??'';
const categoryAliases:Record<string,Category>=Object.fromEntries([
 ...shopGroups.map(g=>[norm(g),g]),...shopGroups.map(g=>[norm(shopGroupLabels[g]),g]),
 ['alle','Alle'],['kamera','Kameras'],['cameras','Kameras'],['instax','Sofortbild'],['polaroid','Sofortbild'],['fotochemie','Chemie'],['labor-equipment','Equipment'],['zubehoer','Equipment'],['buecher','Bücher'],['zines','Bücher'],['gutschein','Gutscheine'],['entwicklung','Entwicklung'],['labor','Entwicklung'],
]);
const formatAliases:Record<string,Exclude<Format,''>>={'35mm':'35mm','35':'35mm','135':'35mm','kleinbild':'35mm','kb':'35mm','120':'120','mittelformat':'120','rollfilm':'120'};
const kindAliases:Record<string,Exclude<Kind,''>>={farbe:'Farbe',color:'Farbe',colour:'Farbe',schwarzweiss:'Schwarzweiß',sw:'Schwarzweiß','s/w':'Schwarzweiß',bw:'Schwarzweiß','b&w':'Schwarzweiß',dia:'Dia','e-6':'Dia',e6:'Dia',slide:'Dia'};
const isoAliases:Record<string,Exclude<IsoBucket,''>>={'≤100':'≤100','<=100':'≤100','bis100':'≤100','100':'≤100','50':'≤100','80':'≤100','-100':'≤100','100-':'≤100','125':'200','160':'200','200':'200','400':'400','800':'800+','800+':'800+','3200':'800+'};
const processAliases:Record<string,Exclude<Process,''>>={'c-41':'C-41',c41:'C-41',schwarzweiss:'Schwarzweiß',sw:'Schwarzweiß','s/w':'Schwarzweiß',bw:'Schwarzweiß','e-6':'E-6',e6:'E-6'};
const sortKeys=new Set(sorts.map(([k])=>k));

export function parseFilters(get:Getter,base:Partial<Filters>={}):Filters{
 const f:Filters={...emptyFilters,...base};
 const v=(k:string)=>(get(k)??'').trim();
 if(v('category'))f.category=categoryAliases[norm(v('category'))]??f.category;
 if(v('q'))f.q=v('q').slice(0,80);
 if(v('format'))f.format=pick(v('format'),formatAliases);
 if(v('kind'))f.kind=pick(v('kind'),kindAliases);
 if(v('iso'))f.iso=pick(v('iso'),isoAliases);
 if(v('process'))f.process=pick(v('process'),processAliases);
 if(v('brand')){const b=norm(v('brand'));f.brand=allBrands.find(x=>norm(x)===b)??''}
 if(/^(1|true|ja)$/i.test(v('stock')))f.stock=true;
 const price=Number(v('preis'));if(Number.isFinite(price)&&price>0)f.maxPrice=Math.round(price);
 if(sortKeys.has(v('sort') as Sort))f.sort=v('sort') as Sort;
 if(v('view')==='index')f.view='index';
 return f;
}
export function serializeFilters(f:Filters){
 const p=new URLSearchParams();
 if(f.category!=='Alle')p.set('category',f.category);
 if(f.format)p.set('format',f.format);
 if(f.kind)p.set('kind',f.kind);
 if(f.iso)p.set('iso',f.iso==='≤100'?'bis100':f.iso);
 if(f.process)p.set('process',f.process);
 if(f.brand)p.set('brand',f.brand);
 if(f.stock)p.set('stock','1');
 if(f.maxPrice!=null)p.set('preis',String(f.maxPrice));
 if(f.sort!=='auswahl')p.set('sort',f.sort);
 if(f.view==='index')p.set('view','index');
 if(f.q.trim())p.set('q',f.q.trim());
 return p.toString();
}

/* ───────── Matching ───────── */
export const allBrands=Array.from(new Set(catalog.map(brandOf).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'de'));
const groupRank=new Map<ShopGroup,number>(shopGroups.map((g,i)=>[g,i]));
const featuredRank=new Map(['kodak-portra-400-135-36-film','ilford-hp5-plus-400-schwarz-weiss-film-135-36','cinestill-cinestill-800-t-c-41-135-36','kodak-gold-200-135-36-film','kodak-tri-x-400-135-36-film','pentax-17'].map((s,i)=>[s,i]));
const catalogRank=new Map(catalog.map((p,i)=>[p.slug,i]));

export function matchesFacets(p:Product,f:Filters,skip?:FacetKey|'category'){
 if(skip!=='category'&&f.category!=='Alle'&&shopGroup(p)!==f.category)return false;
 if(skip!=='format'&&f.format&&p.format!==f.format)return false;
 if(skip!=='kind'&&f.kind&&kindOf(p)!==f.kind)return false;
 if(skip!=='iso'&&f.iso&&isoBucket(p)!==f.iso)return false;
 if(skip!=='process'&&f.process&&p.process!==f.process)return false;
 if(skip!=='brand'&&f.brand&&brandOf(p)!==f.brand)return false;
 if(skip!=='stock'&&f.stock&&!p.inStock)return false;
 if(skip!=='maxPrice'&&f.maxPrice!=null&&fromPrice(p)>f.maxPrice)return false;
 return true;
}

/** Full filter: facets + free-text query (alias aware). */
export function applyFilters(list:Product[],f:Filters,skip?:FacetKey|'category'){
 const hits=f.q.trim()?new Set(searchProducts(f.q,list).results.map(p=>p.slug)):null;
 return list.filter(p=>(!hits||hits.has(p.slug))&&matchesFacets(p,f,skip));
}

export function sortProducts(list:Product[],sort:Sort){
 const out=[...list];
 const base=(a:Product,b:Product)=>(catalogRank.get(a.slug)??0)-(catalogRank.get(b.slug)??0);
 if(sort==='preis-auf')return out.sort((a,b)=>fromPrice(a)-fromPrice(b)||base(a,b));
 if(sort==='preis-ab')return out.sort((a,b)=>fromPrice(b)-fromPrice(a)||base(a,b));
 if(sort==='name')return out.sort((a,b)=>a.name.localeCompare(b.name,'de',{sensitivity:'base'}));
 if(sort==='iso')return out.sort((a,b)=>(isoValue(a)||1e6)-(isoValue(b)||1e6)||base(a,b));
 return out.sort((a,b)=>(featuredRank.get(a.slug)??99)-(featuredRank.get(b.slug)??99)||Number(b.inStock)-Number(a.inStock)||(groupRank.get(shopGroup(a))??9)-(groupRank.get(shopGroup(b))??9)||base(a,b));
}

/* ───────── Search: aliases, typo repair, facet parsing ───────── */
export type RouteHint='digitalisierung'|'services'|'filmentwicklung'|'scan'|'galerie'|'kontakt';
export type ParsedQuery={text:string[];format?:Exclude<Format,''>;kind?:Exclude<Kind,''>;process?:Exclude<Process,''>;iso:number[];routes:RouteHint[];understood:string[];raw:string};

const phrase:Array<[RegExp,string]>=[
 [/\bs\s*\/\s*w\b/g,' sw '],[/\bb\s*[&/]\s*w\b/g,' sw '],[/\bschwarz[\s-]*weiss\w*/g,' sw '],[/\bsuper[\s-]?8\b/g,' super8 '],[/\bnormal[\s-]?8\b/g,' normal8 '],
 [/\bc[\s-]?41\b/g,' c41 '],[/\be[\s-]?6\b/g,' e6 '],[/\btri[\s-]?x\b/g,' trix '],[/\bt[\s-]?max\b/g,' tmax '],[/\bhp[\s-]?5\b/g,' hp5 '],[/\bfp[\s-]?4\b/g,' fp4 '],
 [/\b35\s*mm\b/g,' 35mm '],[/\bmini[\s-]?dv\b/g,' minidv '],[/\bhi[\s-]?8\b/g,' hi8 '],[/\b135\s*[/-]\s*36\b/g,' 35mm '],[/\biso\s*(\d{2,4})\b/g,' $1 '],[/\b(\d{2,4})\s*iso\b/g,' $1 '],
];
const typos:Record<string,string>={porta:'portra',protra:'portra',portr:'portra',ilfort:'ilford',ilfrod:'ilford',ilfor:'ilford',kodack:'kodak',kodac:'kodak',cinestil:'cinestill',cinstill:'cinestill',polariod:'polaroid',polaroit:'polaroid',instacks:'instax',instaks:'instax',fujfilm:'fujifilm',jobbo:'jobo',billigham:'billingham',ektachrom:'ektachrome',velvja:'velvia'};
const facetWords:Record<string,{format?:Exclude<Format,''>;kind?:Exclude<Kind,''>;process?:Exclude<Process,''>}>={
 '35mm':{format:'35mm'},'35':{format:'35mm'},'135':{format:'35mm'},kleinbild:{format:'35mm'},kb:{format:'35mm'},kleinbildfilm:{format:'35mm'},
 '120':{format:'120'},mittelformat:{format:'120'},rollfilm:{format:'120'},mf:{format:'120'},
 sw:{kind:'Schwarzweiß'},bw:{kind:'Schwarzweiß'},schwarzweiss:{kind:'Schwarzweiß'},monochrom:{kind:'Schwarzweiß'},
 farbe:{kind:'Farbe'},farbfilm:{kind:'Farbe'},color:{kind:'Farbe'},colour:{kind:'Farbe'},farbnegativ:{kind:'Farbe'},
 dia:{kind:'Dia'},diafilm:{kind:'Dia'},slide:{kind:'Dia'},umkehrfilm:{kind:'Dia'},e6:{kind:'Dia',process:'E-6'},
 c41:{process:'C-41'},
};
const routeWords:Record<string,RouteHint>={super8:'digitalisierung',normal8:'digitalisierung','8mm':'digitalisierung','16mm':'digitalisierung',vhs:'digitalisierung',video:'digitalisierung',videokassette:'digitalisierung',videos:'digitalisierung',dias:'digitalisierung',digitalisieren:'digitalisierung',digitalisierung:'digitalisierung',minidv:'digitalisierung',hi8:'digitalisierung',schmalfilm:'digitalisierung',kassette:'digitalisierung',kassetten:'digitalisierung',schallplatte:'digitalisierung',tonband:'digitalisierung',
 pass:'services',passbild:'services',passbilder:'services',passfoto:'services',passfotos:'services',bewerbung:'services',bewerbungsbild:'services',bewerbungsbilder:'services',bewerbungsfoto:'services',biometrisch:'services',biometrische:'services',fotostudio:'services',
 entwickeln:'filmentwicklung',entwicklung:'filmentwicklung',filmentwicklung:'filmentwicklung',labor:'filmentwicklung',lab:'filmentwicklung',
 scan:'scan',scans:'scan',scannen:'scan',negativscan:'scan',
 galerie:'galerie',gallery:'galerie',ausstellung:'galerie',streetgallery:'galerie',
 kontakt:'kontakt',oeffnungszeiten:'kontakt',adresse:'kontakt',anfahrt:'kontakt',laden:'kontakt'};
/** Route words that never describe a product: excluded from product text matching. */
const serviceOnly=new Set(Object.entries(routeWords).filter(([,r])=>r==='digitalisierung'||r==='services'||r==='galerie'||r==='kontakt').map(([w])=>w));
const isoSet=new Set(catalog.map(isoValue).filter(Boolean));

type Indexed={p:Product;name:string;nameC:string;full:string;fullC:string;desc:string};
let index:Indexed[]|null=null;let vocab:string[]|null=null;
function getIndex(){
 if(!index){
  index=products.filter(p=>!p.isPastEvent).map(p=>{
   const name=norm(`${brandOf(p)} ${p.name}`);
   const full=norm(`${name} ${shopGroupLabels[shopGroup(p)]} ${p.format} ${p.process} ${p.filmKind} ${p.iso?`iso ${p.iso}`:''} ${p.optionLabel}`);
   return {p,name,nameC:compact(name),full,fullC:compact(full),desc:norm(p.description)};
  });
  vocab=Array.from(new Set(index.flatMap(i=>i.name.split(/[^a-z0-9-]+/)).filter(w=>w.length>=4&&!/^\d+$/.test(w))));
 }
 return index;
}
function distance(a:string,b:string){
 if(Math.abs(a.length-b.length)>2)return 9;
 const row=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const tmp=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=tmp}}
 return row[b.length];
}

export function parseQuery(raw:string):ParsedQuery{
 let q=` ${norm(raw)} `;for(const [re,rep] of phrase)q=q.replace(re,rep);
 const out:ParsedQuery={text:[],iso:[],routes:[],understood:[],raw};
 getIndex();
 for(let token of q.split(/[\s,;]+/).filter(Boolean)){
  token=token.replace(/^[^a-z0-9]+|[^a-z0-9+]+$/g,'');if(!token)continue;
  if(typos[token]){out.understood.push(`${token} → ${typos[token]}`);token=typos[token]}
  const facet=facetWords[token];
  if(facet){
   if(facet.format&&!out.format){out.format=facet.format;out.understood.push(`Format ${facet.format}`)}
   if(facet.kind&&!out.kind){out.kind=facet.kind;out.understood.push(`Typ ${facet.kind}`)}
   if(facet.process&&!out.process){out.process=facet.process;out.understood.push(`Prozess ${facet.process}`)}
   continue;
  }
  const route=routeWords[token];
  if(route&&!out.routes.includes(route))out.routes.push(route);
  if(serviceOnly.has(token))continue;
  if(/^\d+$/.test(token)&&isoSet.has(Number(token))){out.iso.push(Number(token));out.understood.push(`ISO ${token}`);continue}
  out.text.push(token);
 }
 // Typo repair: a word that matches nothing in the catalog is replaced by the closest catalog word.
 const idx=getIndex();
 out.text=out.text.map(t=>{
  if(t.length<4||/\d/.test(t)||routeWords[t])return t;
  if(idx.some(i=>i.full.includes(t)||i.fullC.includes(compact(t))||i.desc.includes(t)))return t;
  let best='';let score=9;for(const w of vocab!){const d=distance(t,w.slice(0,Math.max(t.length,Math.min(w.length,t.length+1))));if(d<score){score=d;best=w}}
  if(best&&score<=(t.length>=7?2:1)){out.understood.push(`${t} → ${best}`);return best}
  return t;
 });
 return out;
}

function facetOk(p:Product,pq:ParsedQuery){
 if(pq.format&&p.format!==pq.format)return false;
 if(pq.kind){const k=kindOf(p);if(k?k!==pq.kind:!(pq.kind==='Schwarzweiß'?/schwarz|s\/w|monochrom|b&w/i.test(p.name):pq.kind==='Dia'?/dia|e-6/i.test(p.name+' '+p.optionLabel):/farb|color/i.test(p.name+' '+p.optionLabel)))return false}
 if(pq.process&&p.process!==pq.process&&!new RegExp(pq.process==='C-41'?'c-?41':'e-?6','i').test(p.name+' '+p.optionLabel))return false;
 return true;
}

/** Alias-aware product search shared by the shop query field and the ⌘K archive index. */
export function searchProducts(raw:string,pool:Product[]=catalog){
 const pq=parseQuery(raw);
 const allowed=new Set(pool.map(p=>p.slug));
 const idx=getIndex().filter(i=>allowed.has(i.p.slug));
 const empty=!pq.text.length&&!pq.iso.length&&!pq.format&&!pq.kind&&!pq.process;
 if(empty)return {parsed:pq,results:[] as Product[]};
 const run=(withDesc:boolean)=>idx.map(i=>{
  if(!facetOk(i.p,pq))return null;
  let score=0;
  for(const n of pq.iso){if(isoValue(i.p)===n)score+=12;else if(new RegExp(`\\b${n}\\b`).test(i.name))score+=6;else return null}
  for(const t of pq.text){
   const tc=compact(t);
   if(i.name.includes(t)||(tc.length>2&&i.nameC.includes(tc)))score+=i.name.startsWith(t)||i.name.includes(` ${t}`)?14:10;
   else if(i.full.includes(t)||(tc.length>2&&i.fullC.includes(tc)))score+=5;
   else if(withDesc&&i.desc.includes(t))score+=1;
   else return null;
  }
  if(i.p.inStock)score+=3;if(shopGroup(i.p)==='Filme'&&(pq.format||pq.kind||pq.iso.length))score+=2;
  return {p:i.p,score};
 }).filter((x):x is {p:Product;score:number}=>!!x);
 let hits=run(false);if(!hits.length)hits=run(true);
 hits.sort((a,b)=>b.score-a.score||(featuredRank.get(a.p.slug)??99)-(featuredRank.get(b.p.slug)??99)||(catalogRank.get(a.p.slug)??999)-(catalogRank.get(b.p.slug)??999));
 return {parsed:pq,results:hits.map(h=>h.p)};
}
