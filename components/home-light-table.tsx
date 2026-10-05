"use client";
// 01 · LTB LIGHT TABLE — real featured films on a neutral luminous surface (glow from below, hairline rebates).
// Hover: light +4 %, image shifts 3 px, edge-print data line appears. Quick add for in-stock items (local preview cart).
import Link from 'next/link';
import {ArrowUpRight,Plus} from 'lucide-react';
import {SectionHead,Chip,processKind,frameNo} from './analog/primitives';
import {bySlug,formatPrice,type Product} from '@/lib/catalog';
import {useStore} from './store-context';
import {track} from '@/lib/analytics';
import {lightTableExpose} from '@/motion/home';
import {chapter,useMotion} from './home-shared';

/** Curated display names in edge-print order (MARKE · NAME · FORMAT); product data itself comes from the catalog. */
const FILMS:{slug:string;title:string;fmt:string;w:number;h:number}[]=[
 {slug:'kodak-portra-400-135-36-film',title:'Portra 400',fmt:'135-36',w:750,h:750},
 {slug:'cinestill-cinestill-800-t-c-41-135-36',title:'800T',fmt:'135-36',w:1080,h:1080},
 {slug:'ilford-hp5-plus-400-schwarz-weiss-film-135-36',title:'HP5 Plus 400',fmt:'135-36',w:600,h:600},
 {slug:'kodak-portra-400-120-rollfilm',title:'Portra 400',fmt:'120',w:750,h:750},
 {slug:'kodak-tri-x-400-135-36-film',title:'Tri-X 400',fmt:'135-36',w:1240,h:1000},
 {slug:'analog-store-black-und-white-film-200-iso-135-36',title:'Black & White 200',fmt:'135-36',w:810,h:1080},
];
const processLabel=(p:Product)=>p.process==='Schwarzweiß'?'SW':p.process;

export function HomeLightTable(){
 const {add}=useStore();
 const table=useMotion<HTMLDivElement>(lightTableExpose);
 const head=chapter('LTB');
 const items=FILMS.map(f=>({...f,p:bySlug(f.slug)})).filter((x):x is typeof x&{p:Product}=>!!x.p);
 return <section className="hm-ltb zone-table" id={head.sectionId} aria-labelledby="hm-ltb-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-ltb-title"
    title={<>Film für die<br/>nächste Rolle.</>}
    action={<Link className="link" href="/shop?category=Filme">Film-Finder öffnen <ArrowUpRight size={16}/></Link>}/>
   <div className="hm-ltb-table" ref={table}>
    <span className="hm-ltb-glow" data-glow aria-hidden="true"/>
    <ul className="hm-ltb-grid">
     {items.map(({p,title,fmt,w,h},i)=>{
      const kind=processKind(p.process);const code=processLabel(p);
      return <li key={p.slug} className="hm-ltb-item" data-item>
       <article className="hm-ltb-card" aria-labelledby={`hm-ltb-${i}`}>
        <Link href={`/p/${p.slug}`} className="hm-ltb-stage" onClick={()=>track('select_item',{slug:p.slug,list:'home_lichttisch',index:i+1})} tabIndex={-1} aria-hidden="true">
         <span className="hm-ltb-no mono">{frameNo(i+1)}</span>
         <img src={p.images[0]} alt="" width={w} height={h} loading="lazy" decoding="async"/>
         <span className="hm-ltb-edge edge-print">{p.brand} · ISO {p.iso} · {fmt} · {code}</span>
        </Link>
        <div className="hm-ltb-meta">
         <h3 id={`hm-ltb-${i}`} className="hm-ltb-name">
          <Link href={`/p/${p.slug}`} onClick={()=>track('select_item',{slug:p.slug,list:'home_lichttisch',index:i+1})}>
           <span className="hm-ltb-brand mono">{p.brand}</span>
           <span className="hm-ltb-title">{title} <span className="hm-ltb-fmt">{fmt}</span></span>
          </Link>
         </h3>
         <p className="hm-ltb-price num">{formatPrice(p.price)}</p>
         <p className="hm-ltb-chips"><Chip kind={kind}>{code}</Chip><Chip>ISO {p.iso}</Chip></p>
         <p className="hm-ltb-stock">
          <span className={`status ${p.inStock?'status-ok':'status-ask'}`}>{p.inStock?'Auf Lager':'Lieferzeit erfragen'}</span>
          <span className="hm-ltb-src">Quellstand 04.10.2026</span>
         </p>
         {p.inStock&&<button type="button" className="btn btn-sm btn-ghost hm-ltb-add" onClick={()=>{add(p.slug);track('add_to_cart',{slug:p.slug,list:'home_lichttisch',price:p.price})}} aria-label={`${p.name} in den Vorschau-Warenkorb legen`}>
          <Plus size={15} strokeWidth={1.8}/> In den Korb
         </button>}
        </div>
       </article>
      </li>;
     })}
    </ul>
   </div>
   <p className="hm-note mono">Preise inkl. MwSt., zzgl. Versand · Bestand laut Quellstand 04.10.2026 · Warenkorb ist eine Vorschau ohne Zahlung</p>
  </div>
 </section>;
}
