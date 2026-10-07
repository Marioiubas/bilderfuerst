"use client";
// "WAS HAST DU?" — object-first router (Darkroom / Legacybox pattern), built as five lab drawers.
// Each drawer: technical code, symbol (inline SVG/CSS), human label, destination, one Anime.js microinteraction.
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {drawerMotion,type DrawerKind} from '@/motion/home';
import {track} from '@/lib/analytics';
import {CHAPTERS} from './home-shared';

type Drawer={code:string;label:string;dest:string;href:string;kind:DrawerKind;symbol:React.ReactNode};

/** LAB-01 · a 35 mm strip in a film gate; frames are negatives (amber base on hover). */
function SymFilm(){
 return <span className="hm-sym hm-sym-film" aria-hidden="true">
  <span className="hm-sym-gate"><span className="hm-sym-strip" data-strip data-pitch="30">{[0,1,2,3,4].map(i=><i key={i}/>)}</span></span>
  <span className="hm-sym-mark">1A</span>
 </span>;
}
/** STR-02 · camera front with a frame-counter window that ticks 23 → 24. */
function SymCamera(){
 return <span className="hm-sym hm-sym-camera" aria-hidden="true">
  <svg viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M10 20h22l4-6h16l4 6h30v34H10z"/><circle cx="48" cy="37" r="12"/><circle cx="48" cy="37" r="7"/><path d="M16 26h10M70 26h0"/><rect x="40" y="16" width="8" height="2"/></svg>
  <span className="hm-sym-odo"><span className="hm-sym-odo-col" data-odo><b>23</b><b>24</b></span></span>
 </span>;
}
/** STU-03 · biometric guide: head oval, eye line, four corner brackets that lock. */
function SymPortrait(){
 return <span className="hm-sym hm-sym-portrait" aria-hidden="true">
  <svg viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="1.25"><ellipse cx="48" cy="30" rx="10" ry="13"/><path d="M28 60c2-10 10-15 20-15s18 5 20 15"/><path d="M33 28h30" strokeDasharray="2 3" opacity=".6"/></svg>
  <i data-bracket data-dx="-1" data-dy="-1" className="tl"/><i data-bracket data-dx="1" data-dy="-1" className="tr"/>
  <i data-bracket data-dx="-1" data-dy="1" className="bl"/><i data-bracket data-dx="1" data-dy="1" className="br"/>
 </span>;
}
/** SCN-04 · a mounted slide with the scanner line parked at the right edge of the window. */
function SymSlide(){
 return <span className="hm-sym hm-sym-slide" aria-hidden="true">
  <span className="hm-sym-mount"><span className="hm-sym-window"><span className="hm-sym-scanline" data-scan/></span></span>
 </span>;
}
/** PRT-05 · a printer slot with a sheet that emerges from it. */
function SymPrint(){
 return <span className="hm-sym hm-sym-print" aria-hidden="true">
  <span className="hm-sym-paper"><span className="hm-sym-sheet" data-sheet><i/></span></span>
  <span className="hm-sym-slot"/>
 </span>;
}

const DRAWERS:Drawer[]=[
 {code:'LAB-01',label:'Belichteter Film',dest:'Film entwickeln',href:'/filmentwicklung',kind:'advance',symbol:<SymFilm/>},
 {code:'STR-02',label:'Film oder Kamera gesucht',dest:'Analog Store',href:'/shop',kind:'tick',symbol:<SymCamera/>},
 {code:'STU-03',label:'Passbild / Bewerbung',dest:'Studio',href:'/services',kind:'lock',symbol:<SymPortrait/>},
 {code:'SCN-04',label:'Dias, Negative, Super 8, Video',dest:'Digitalisieren',href:'/digitalisierung',kind:'scan',symbol:<SymSlide/>},
 {code:'PRT-05',label:'Ein Bild zum Drucken',dest:'FineArt',href:'/i/fineart-prints',kind:'emerge',symbol:<SymPrint/>},
];

function DrawerLink({d}:{d:Drawer}){
 const ref=useRef<HTMLAnchorElement>(null);
 useEffect(()=>{const el=ref.current;return el?drawerMotion(el,d.kind):undefined},[d.kind]);
 return <Link ref={ref} href={d.href} className={`hm-drawer hm-drawer-${d.kind}`} onClick={()=>{if(d.kind==='lock')track('click_passbilder',{source:'home_router'})}}>
  <span className="hm-drawer-top" aria-hidden="true"><span className="mono">{d.code}</span><ArrowUpRight size={15} strokeWidth={1.6}/></span>
  <span className="hm-drawer-face">{d.symbol}</span>
  <span className="hm-drawer-holder"><span className="hm-drawer-label">{d.label}</span></span>
  <span className="hm-drawer-dest mono"><span aria-hidden="true">→ </span>{d.dest}</span>
  <span className="hm-drawer-pull" aria-hidden="true"/>
 </Link>;
}

/** Chapter index (UX-RESEARCH-MOBILE §6.1): not sticky, labels identical to the chapter labels of the section heads. */
function JumpIndex(){
 return <nav className="hm-jump" aria-labelledby="hm-jump-title">
  <p className="eyebrow" id="hm-jump-title"><b>IDX</b><span>Kapitel auf dieser Seite</span><span className="sec-index">{CHAPTERS.length} Stationen</span></p>
  <ol className="hm-jump-list">
   {CHAPTERS.map(c=><li key={c.id}><a href={`#${c.id}`}><span className="hm-jump-no mono" aria-hidden="true">{String(c.n).padStart(2,'0')}</span><span className="hm-jump-label">{c.label}</span></a></li>)}
  </ol>
 </nav>;
}

export function HomeRouter(){
 return <section className="hm-router zone-light" aria-labelledby="hm-router-title" id="entdecken">
  <div className="wrap">
   <header className="hm-router-head">
    <p className="eyebrow"><b>IDX</b><span>Index · Was du mitbringst</span><span className="sec-index">5 Schubladen</span></p>
    <h2 id="hm-router-title">Was hast du <br/>in der Hand?</h2>
    <p className="hm-router-lead">Fang bei dem an, was du mitbringst. Jede Schublade führt direkt an den richtigen Platz im Laden.</p>
   </header>
   <ul className="hm-drawers">
    {DRAWERS.map(d=><li key={d.code}><DrawerLink d={d}/></li>)}
   </ul>
   <JumpIndex/>
  </div>
 </section>;
}
