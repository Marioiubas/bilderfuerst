"use client";
// 03 · STR ANALOG STORE — light zone. Pentax 17 feature (Aceternity 3D card ≤ 4°, desktop + motion only; Lens on
// the real shop photo), the assortment as an archive index with live catalog counts, and the used-camera note.
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {SectionHead,frameNo} from './analog/primitives';
import {CardContainer,CardBody,CardItem} from './ui/3d-card';
import type {Lens as LensComponent} from './ui/lens';
import {bySlug,formatPrice,groupCount,shopGroupLabels,shopGroups} from '@/lib/catalog';
import {track} from '@/lib/analytics';
import {viewfinderLock} from '@/motion/home';
import {PHOTO,chapter,useMotion} from './home-shared';

/** Pentax 17 facts — all from the product description in lib/catalog.json (/p/pentax-17). */
const SPEC:[string,string][]=[
 ['Format','Halbformat 17 × 24 mm'],
 ['Bilder','72 auf einem 36er Film'],
 ['Objektiv','25 mm · f/3,5 (≈ 37 mm Kleinbild)'],
 ['ISO','50–3200'],
 ['Fokus','Zonenfokus, manuell'],
 ['Transport','Filmtransporthebel, von Hand'],
];

export function HomeStore(){
 const camera=bySlug('pentax-17');
 const finder=useMotion<HTMLDivElement>(viewfinderLock);
 const head=chapter('STR');
 const groups=shopGroups.filter(g=>g!=='Entwicklung').map(g=>({g,label:shopGroupLabels[g],n:groupCount(g)})).filter(x=>x.n>0);
 const select=()=>track('select_item',{slug:'pentax-17',list:'home_analog_store'});
 return <section className="hm-str zone-light" id={head.sectionId} aria-labelledby="hm-str-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-str-title"
    title={<>Kameras, Film,<br/>Chemie.</>}
    action={<Link className="link" href="/shop">Zum Analog Store <ArrowUpRight size={16}/></Link>}/>
   {camera&&<div className="hm-str-feature">
    <figure className="hm-str-camera">
     <div className="hm-str-finder" ref={finder}>
      <i className="hm-vf tl" data-bracket data-dx="-1" data-dy="-1" aria-hidden="true"/><i className="hm-vf tr" data-bracket data-dx="1" data-dy="-1" aria-hidden="true"/>
      <i className="hm-vf bl" data-bracket data-dx="-1" data-dy="1" aria-hidden="true"/><i className="hm-vf br" data-bracket data-dx="1" data-dy="1" aria-hidden="true"/>
      <CardContainer containerClassName="py-0 block hm-card-wrap" className="block w-full">
       <CardBody className="h-auto w-full hm-card-body">
        <CardItem translateZ={16} className="w-full hm-card-photo">
         <DesktopLens>
          <img src={PHOTO.pentax.src} width={PHOTO.pentax.w} height={PHOTO.pentax.h} loading="lazy" decoding="async" alt="Pentax 17 mit Originalkarton auf der Ladentheke in Fürth"/>
         </DesktopLens>
        </CardItem>
       </CardBody>
      </CardContainer>
     </div>
     <figcaption className="hm-cap"><span>STR · Pentax 17 im Laden Fürth</span><span className="hm-cap-hint">Lupe: Maus über das Foto</span></figcaption>
    </figure>
    <div className="hm-str-spec">
     <p className="eyebrow"><b>STR</b><span>Kamera · Halbformat</span></p>
     <h3 className="hm-str-name">Pentax 17</h3>
     <p className="hm-str-claim">Halbformat · 72 Bilder auf einem 36er Film.</p>
     <dl className="hm-spec">{SPEC.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
     <div className="hm-str-buy">
      <p className="hm-str-price num">{formatPrice(camera.price)}</p>
      <p><span className={`status ${camera.inStock?'status-ok':'status-ask'}`}>{camera.inStock?'Auf Lager':'Lieferzeit erfragen'}</span> <span className="hm-ltb-src">Quellstand 04.10.2026</span></p>
     </div>
     <Link href="/p/pentax-17" className="btn btn-ink" onClick={select}>Pentax 17 ansehen <ArrowRight size={17}/></Link>
    </div>
   </div>}
   <div className="hm-str-lower">
    <nav className="hm-index" aria-labelledby="hm-index-title">
     <p className="eyebrow" id="hm-index-title"><b>IDX</b><span>Sortiment</span><span className="sec-index">{groups.reduce((n,x)=>n+x.n,0)} Artikel · Quellstand 04.10.2026</span></p>
     <ol>
      {groups.map((x,i)=><li key={x.g}>
       <Link href={`/shop?category=${encodeURIComponent(x.g)}`}>
        <span className="hm-index-no mono">{frameNo(i+1)}</span>
        <span className="hm-index-name">{x.label}</span>
        <span className="hm-index-rule" aria-hidden="true"/>
        <span className="hm-index-count num">{x.n}<span className="sr-only"> Artikel</span></span>
        <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true"/>
       </Link>
      </li>)}
     </ol>
    </nav>
    <aside className="hm-used" aria-labelledby="hm-used-title">
     <p className="eyebrow"><b>EBY</b><span>Gebrauchte Kameras</span></p>
     <h3 id="hm-used-title" className="hm-used-title">Wir verkaufen analoge Schätze – und kaufen deine analoge Kamera an.</h3>
     <p className="hm-used-text">Kameras, Objektive und Zubehör aus zweiter Hand findest du im Laden oder in unserem eBay-Shop. Fragen? Komm vorbei oder ruf an.</p>
     <a className="link" href="https://www.ebay.de/usr/bilderfuerstfuerth" target="_blank" rel="noopener noreferrer">eBay-Shop bilderfuerstfuerth <ArrowUpRight size={16}/><span className="sr-only"> (öffnet in neuem Tab)</span></a>
    </aside>
   </div>
  </div>
 </section>;
}

/** The Aceternity Lens (and its Motion runtime) loads only on desktop with a fine pointer;
 *  everyone else gets the same photograph without the loupe and without the extra JS. */
function DesktopLens({children}:{children:React.ReactNode}){
 const [Loaded,setLoaded]=useState<typeof LensComponent|null>(null);
 useEffect(()=>{
  if(!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches)return;
  let live=true;import('./ui/lens').then(m=>{if(live)setLoaded(()=>m.Lens)});
  return()=>{live=false};
 },[]);
 return Loaded?<Loaded zoomFactor={1.9} lensSize={190}>{children}</Loaded>:<>{children}</>;
}
