"use client";
// ⌘K search ("Archiv-Index"): products + lab/service pages, grouped like an archive register.
// Rows (audit M3): title (max. 2 lines) / spec line that wraps / price + availability on their own row,
// nothing ellipsised away. Arrow keys move the active option; Enter opens it.
// Alias/typo parsing lives in lib/shop-filters.ts (parseQuery/searchProducts).
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useId,useMemo,useRef,useState,type KeyboardEvent} from 'react';
import {Search,X,ArrowRight,CornerDownLeft} from 'lucide-react';
import {Dialog} from '@/components/dialog';
import {catalog,formatPrice,shopGroup,type Product,type ShopGroup} from '@/lib/catalog';
import {norm,searchProducts,type RouteHint} from '@/lib/shop-filters';
import {track} from '@/lib/analytics';
import {useStore} from '@/components/store-context';
import {displayName,edgeLine,priceLabel,stockLabel} from './product-meta';

type Entry={id:string;href:string;code:string;title:string;line:string;image?:string;product?:Product;price?:string;stock?:string;inStock?:boolean};
type Group={key:string;label:string;entries:Entry[];total:number;more?:string};

const groupOf:Record<ShopGroup,string>={Filme:'FILM',Kameras:'KAMERA',Sofortbild:'SOFORTBILD',Chemie:'CHEMIE',Equipment:'EQUIPMENT',Taschen:'EQUIPMENT',Bücher:'BÜCHER & GUTSCHEINE',Gutscheine:'BÜCHER & GUTSCHEINE',Entwicklung:'LABOR & SERVICE'};
const groupOrder=['LABOR & SERVICE','FILM','KAMERA','SOFORTBILD','CHEMIE','EQUIPMENT','BÜCHER & GUTSCHEINE'];
const groupLimit:Record<string,number>={FILM:8};
const filmCode=(p:Product)=>(p.process==='C-41'?'C41':p.process==='E-6'?'E6':p.process==='Schwarzweiß'?'SW':'')+(p.format==='120'?'·120':p.format==='35mm'?'·135':'');

/** Static lab & service entries (pages of this site). Keywords are matched by prefix. */
const services:Array<{route:RouteHint;href:string;code:string;title:string;line:string;words:string[]}>=[
 {route:'filmentwicklung',href:'/filmentwicklung',code:'LAB',title:'Filmentwicklung',line:'C-41 · S/W · E-6 · 35MM · 120 · 110 · AB 7,00 €',words:['film','entwickeln','entwicklung','filmentwicklung','labor','c41','e6','sw','konfigurator','kleinbild','mittelformat','pocket','110','push','pull']},
 {route:'scan',href:'/p/negativ-scan-ganze-rollen',code:'SCN',title:'Negativ-Scan · ganze Rollen',line:'NORITSU HS-1800 · UNGESCHNITTEN · AB 5,00 €',words:['scan','scannen','scans','negativ','negative','rolle','noritsu','tiff','jpg']},
 {route:'digitalisierung',href:'/digitalisierung',code:'DIG',title:'Digitalisierung',line:'DIAS · NEGATIVE · SUPER 8 · NORMAL 8 · 16MM · VHS · MINIDV',words:['digitalisierung','digitalisieren','dias','dia','negative','super8','normal8','8mm','16mm','vhs','video','minidv','hi8','kassette','schmalfilm','tonband','schallplatte','fotos']},
 {route:'services',href:'/services',code:'STU',title:'Passbilder & Bewerbungsbilder',line:'BIOMETRISCH · OHNE TERMIN · BEWERBUNG AB 20,00 €',words:['pass','passbild','passbilder','passfoto','bewerbung','bewerbungsbild','bewerbungsbilder','biometrisch','fotostudio','portrait','portraet']},
 {route:'galerie',href:'/galerie',code:'GAL',title:'Street Gallery',line:'SCHAUFENSTER · SCHWABACHER STRASSE ECKE ALEXANDERSTRASSE',words:['galerie','gallery','street','ausstellung','schaufenster']},
 {route:'kontakt',href:'/kontakt',code:'FTH',title:'Laden & Kontakt',line:'ALEXANDERSTRASSE 2 · MO–FR 9:30–18:30 · SA 9:30–16:30',words:['kontakt','laden','oeffnungszeiten','adresse','anfahrt','telefon','abgabe','fuerth']},
];
const router=[
 {label:'Belichteter Film',hint:'Entwickeln lassen',href:'/filmentwicklung',code:'LAB'},
 {label:'Film kaufen',hint:'35mm · 120 · Sofortbild',href:'/shop?category=Filme',code:'STR'},
 {label:'Alte Medien',hint:'Dias · Super 8 · Video',href:'/digitalisierung',code:'DIG'},
 {label:'Passbild',hint:'Biometrisch · Bewerbung',href:'/services',code:'STU'},
];
const popular=['Portra 400','HP5','120 Farbe','Instax Mini'];

export function SearchIndex(){
 const {searchOpen,setSearchOpen}=useStore();
 const nav=useRouter();
 const [q,setQ]=useState('');const [cursor,setCursor]=useState(0);
 const input=useRef<HTMLInputElement>(null);const list=useRef<HTMLDivElement>(null);
 const uid=useId();
 const close=()=>{setSearchOpen(false);setQ('');setCursor(0)};

 // Dialog (child) has already called showModal() when this effect runs, so focus is safe here.
 useEffect(()=>{if(searchOpen)input.current?.focus()},[searchOpen]);
 // Phone keyboards shrink only the visual viewport; size the sheet to it so results never sit under the keyboard (DEVICE-QA D2).
 useEffect(()=>{const vv=window.visualViewport;const el=document.querySelector<HTMLElement>('dialog.search-index');if(!searchOpen||!vv||!el)return;
  const fit=()=>el.style.setProperty('--vvh',`${Math.round(vv.height)}px`);fit();vv.addEventListener('resize',fit);
  return()=>{vv.removeEventListener('resize',fit);el.style.removeProperty('--vvh')};
 },[searchOpen]);
 useEffect(()=>{if(!q.trim())return;const t=window.setTimeout(()=>track('search',{q:q.trim(),source:'index'}),700);return()=>window.clearTimeout(t)},[q]);

 const {groups,parsed,flat}=useMemo(()=>{
  const query=q.trim();
  if(!query)return {groups:[] as Group[],parsed:null,flat:[] as Entry[]};
  const {results,parsed}=searchProducts(query);
  const tokens=norm(query).split(/[\s,;/]+/).filter(t=>t.length>=2);
  const svc=services.filter(s=>parsed.routes.includes(s.route)||tokens.some(t=>s.words.some(w=>w.startsWith(t)||(t.length>=4&&t.startsWith(w))))).map<Entry>(s=>({id:s.href,href:s.href,code:s.code,title:s.title,line:s.line}));
  const buckets=new Map<string,Entry[]>();
  for(const p of results){
   const g=groupOf[shopGroup(p)];
   const price=priceLabel(p);
   const e:Entry={id:p.slug,href:`/p/${p.slug}`,code:filmCode(p),title:displayName(p),line:edgeLine(p),image:p.images[0],product:p,price:`${price.from?'ab ':''}${formatPrice(price.amount)}`,stock:stockLabel(p),inStock:p.inStock};
   buckets.set(g,[...(buckets.get(g)??[]),e]);
  }
  if(svc.length)buckets.set('LABOR & SERVICE',[...svc,...(buckets.get('LABOR & SERVICE')??[])]);
  const order=parsed.routes.length?groupOrder:[...groupOrder.slice(1),groupOrder[0]];
  const gs:Group[]=order.filter(k=>buckets.has(k)).map(k=>{const all=buckets.get(k)!;const lim=groupLimit[k]??4;const cat=Object.entries(groupOf).find(([,v])=>v===k)?.[0];
   return {key:k,label:k,entries:all.slice(0,lim),total:all.length,more:all.length>lim&&cat?`/shop?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(query)}`:undefined}});
  return {groups:gs,parsed,flat:gs.flatMap(g=>g.entries)};
 },[q]);

 const active=flat[Math.min(cursor,flat.length-1)];
 useEffect(()=>{list.current?.querySelector('[aria-selected=true]')?.scrollIntoView({block:'nearest'})},[cursor]);
 const go=(href:string)=>{close();nav.push(href)};
 const onKey=(e:KeyboardEvent<HTMLInputElement>)=>{
  if(e.key==='ArrowDown'){e.preventDefault();setCursor(c=>Math.min(c+1,Math.max(flat.length-1,0)))}
  else if(e.key==='ArrowUp'){e.preventDefault();setCursor(c=>Math.max(c-1,0))}
  else if(e.key==='Enter'){e.preventDefault();if(active)go(active.href);else if(q.trim())go(`/shop?q=${encodeURIComponent(q.trim())}`)}
 };
 let n=0;
 return <Dialog open={searchOpen} onClose={close} label="Suche" kind="overlay" className="search-index">
  <div className="si-head">
   <p className="mono si-code"><b>IDX</b> Suche · {catalog.length} Produkte<span className="si-code-tail"> · Labor &amp; Service</span></p>
   <button type="button" className="icon-btn" onClick={close} aria-label="Suche schließen"><X size={20}/></button>
  </div>
  <div className="si-field">
   <Search size={20} aria-hidden="true"/>
   <input ref={input} value={q} onChange={e=>{setQ(e.target.value);setCursor(0)}} onKeyDown={onKey} placeholder="Filme, Kameras, Labor-Services suchen" aria-label="Filme, Kameras und Labor-Services suchen" role="combobox" aria-expanded={flat.length>0} aria-controls={`${uid}-list`} aria-activedescendant={active?`${uid}-${active.id}`:undefined} aria-autocomplete="list" autoComplete="off" spellCheck={false} enterKeyHint="go"/>
   <kbd className="mono si-kbd" aria-hidden="true">esc</kbd>
  </div>
  {parsed&&parsed.understood.length>0&&<p className="si-parsed mono" aria-live="polite">Gelesen als: {parsed.understood.map(u=><span key={u}>{u}</span>)}</p>}

  <div className="si-body" ref={list}>
   {!q.trim()?<div className="si-empty">
     <p className="mono si-label">Was hast du?</p>
     <ul className="si-router">{router.map((r,i)=><li key={r.href} data-stagger><Link href={r.href} onClick={close}><span className="mono num">{String(i+1).padStart(2,'0')} · {r.code}</span><strong>{r.label}</strong><span className="muted">{r.hint}</span><ArrowRight size={16} aria-hidden="true"/></Link></li>)}</ul>
     <p className="mono si-label">Beispielsuchen</p>
     <p className="si-popular">{popular.map(p=><button type="button" key={p} data-stagger onClick={()=>{setQ(p);setCursor(0);input.current?.focus()}}>{p}</button>)}</p>
    </div>
   :!flat.length?<div className="si-empty">
     <p className="si-none">Kein Treffer für „{q.trim()}“.</p>
     <p className="muted">Versuch es mit Filmname, Format (35mm, 120), ISO oder Prozess (C-41, SW, E-6) – oder frag im Laden nach.</p>
     <ul className="si-router">{router.map((r,i)=><li key={r.href}><Link href={r.href} onClick={close}><span className="mono num">{String(i+1).padStart(2,'0')} · {r.code}</span><strong>{r.label}</strong><span className="muted">{r.hint}</span><ArrowRight size={16} aria-hidden="true"/></Link></li>)}</ul>
    </div>
   :<div id={`${uid}-list`} role="listbox" aria-label="Suchergebnisse">
     {groups.map(g=><div key={g.key} role="group" aria-labelledby={`${uid}-${g.key}`} className="si-group">
      <p id={`${uid}-${g.key}`} className="si-group-head mono"><span>{g.label}</span><span className="num">{g.total}</span></p>
      {g.entries.map(e=>{const i=n++;const sel=active?.id===e.id;
       return <Link key={e.id} id={`${uid}-${e.id}`} href={e.href} role="option" aria-selected={sel} tabIndex={-1} className="si-row" onClick={close} onMouseMove={()=>{if(cursor!==i)setCursor(i)}}>
        <span className="si-no mono num" aria-hidden="true">{String(i+1).padStart(3,'0')}</span>
        <span className="si-thumb" aria-hidden="true">{e.image?<img src={e.image} alt="" width={44} height={44} loading={i<6?'eager':'lazy'} decoding="async"/>:<span className="mono">{e.code}</span>}</span>
        <span className="si-text"><strong className="si-title">{e.title}</strong>
         {e.price&&<span className="si-buy"><span className="si-price num">{e.price}</span><span className={`status ${e.inStock?'status-ok':'status-ask'}`}>{e.stock}</span></span>}
         {e.line&&<span className="si-line mono">{e.line}</span>}</span>
        <span className="si-code-col mono" aria-hidden="true">{e.product?e.code:''}{sel&&<CornerDownLeft size={14}/>}</span>
       </Link>})}
      {g.more&&<Link className="si-more mono" href={g.more} onClick={close}>+ {g.total-g.entries.length} weitere im Shop →</Link>}
     </div>)}
    </div>}
  </div>
  <div className="si-foot">
   <span className="si-hints mono" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> wählen · <kbd>↵</kbd> öffnen · <kbd>esc</kbd> schließen</span>
   {q.trim()&&<Link className="si-all" href={`/shop?q=${encodeURIComponent(q.trim())}`} onClick={close}>Alle Treffer im Shop <ArrowRight size={16} aria-hidden="true"/></Link>}
  </div>
 </Dialog>;
}
