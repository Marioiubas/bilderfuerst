"use client";
// 07 · ARC ARCHIVE — graphite zone, amber film base. A 35 mm strip with year frames from the verified history
// (/i/unsere-geschichte, edited 19.11.2020; Street Gallery: /i/galerie) and the real historic facade strip.
// Frames develop once from negative to positive. The strip scrolls horizontally inside its own region (keyboard focusable)
// when it overflows; the page itself never scrolls sideways.
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead} from './analog/primitives';
import {developStrip} from '@/motion/home';
import {PHOTO,chapter,photo} from './home-shared';

const YEARS:{year:string;place:string;text:string}[]=[
 {year:'1935',place:'Nürnberg',text:'Ernst Dittmer beginnt bei Foto Seitz, das schon eigene Fotolabore betreibt – später als Gesellschafter.'},
 {year:'1973',place:'Erlangen',text:'Die Brüder Wulf und Klaus Dittmer gründen Bilderfürst.'},
 {year:'2001',place:'Fürth',text:'Jan Dittmer übernimmt Bilderfürst in Fürth – die dritte Generation.'},
 {year:'2020',place:'Alexanderstraße',text:'Aus der Schaufenster-Galerie wird die Street Gallery mit analogen Aufnahmen.'},
];

export function HomeArchive(){
 const head=chapter('ARC');
 // The strip is a tab stop only while it actually overflows (keyboard scrolling); otherwise it is plain content.
 const scroller=useRef<HTMLDivElement>(null);const [overflows,setOverflows]=useState(false);
 useEffect(()=>{const el=scroller.current;return el?developStrip(el):undefined},[]);
 useEffect(()=>{const el=scroller.current;if(!el)return;const check=()=>setOverflows(el.scrollWidth>el.clientWidth+1);check();const ro=new ResizeObserver(check);ro.observe(el);return()=>ro.disconnect()},[]);
 return <section className="hm-arc zone-graphite grain" id={head.sectionId} aria-labelledby="hm-arc-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-arc-title"
    title={<>Drei Generationen. <br/>Fotografie seit 1935.</>}
    action={<Link className="link" href="/geschichte">Die ganze Geschichte <ArrowUpRight size={16}/></Link>}/>
   <div className="hm-strip" ref={scroller} role="region" aria-label={overflows?'Zeitleiste 1935 bis 2020, horizontal scrollbar':'Zeitleiste 1935 bis 2020'} tabIndex={overflows?0:undefined}>
    <div className="hm-strip-film">
     <div className="sprockets hm-strip-sprockets" aria-hidden="true"/>
     <ol className="hm-strip-frames">
      {YEARS.map((y,i)=><li key={y.year} className="hm-strip-frame" data-frame>
       <span className="hm-strip-edge edge-print" aria-hidden="true">ARC {String(i+1).padStart(2,'0')}A · {y.place}</span>
       <span className="hm-strip-year">{y.year}</span>
       <p className="hm-strip-text">{y.text}</p>
      </li>)}
     </ol>
     <div className="sprockets hm-strip-sprockets" aria-hidden="true"/>
    </div>
   </div>
   <figure className="hm-arc-facades">
    <img {...photo(PHOTO.history,'min(92vw, 1440px)')} loading="lazy" decoding="async" alt="Drei historische Aufnahmen: eine Bilderfürst-Filiale mit Schild „Farbfotos in 1 Stunde“ (Datumsstempel 1988), die Fassade von Foto Seitz und ein Ladeninneres mit rot-gelber Theke"/>
    <figcaption className="hm-cap"><span>ARC · Archivbilder von der Geschichtsseite</span><span>Bilderfürst-Filiale (Datumsstempel im Bild ’88) · Foto Seitz · Ladeninneres</span></figcaption>
   </figure>
  </div>
 </section>;
}
