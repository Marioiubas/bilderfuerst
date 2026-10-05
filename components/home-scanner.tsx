"use client";
// 04 · SCN SCANNER — graphite zone; cyan appears only in this chapter (scanner light).
// Facts: /i/wir-digitalisieren, /i/negativ-digitalisierung, /i/dias-digitalisierung-1, /i/super8-normal8-16mm-35mm-kino,
// /i/alle-videokassetten-und-formate (verified live 05.10.2026).
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead} from './analog/primitives';
import {scanPass} from '@/motion/home';
import {PHOTO,chapter,useMotion} from './home-shared';

const FACTS:[string,string][]=[
 ['Dias & Negative','Scan in Originalauflösung, ca. 13–15 MP bei Kleinbild · ICE5-Staub- und Kratzerentfernung bei Farbmaterial'],
 ['Super 8 / Normal 8','19,95 € Auftragspauschale + 1,40 € pro Minute'],
 ['Videokassetten','Festpreis je Kassette · VHS, VHS-C, Video8, Hi8, MiniDV und mehr'],
];

export function HomeScanner(){
 const frame=useMotion<HTMLDivElement>(scanPass);
 const head=chapter('SCN');
 return <section className="hm-scn zone-graphite" id={head.sectionId} aria-labelledby="hm-scn-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-scn-title"
    title={<>Dias, Negative,<br/><span className="outline-type">Super 8, Video.</span></>}
    action={<Link className="link" href="/digitalisierung">Digitalisierung ansehen <ArrowUpRight size={16}/></Link>}/>
   <div className="hm-scn-grid">
    <figure className="hm-scn-main">
     <div className="hm-scn-frame" ref={frame}>
      <img src={PHOTO.slideMagazine.src} width={PHOTO.slideMagazine.w} height={PHOTO.slideMagazine.h} loading="lazy" decoding="async" alt="Diamagazin mit nummerierten Fächern, ein gerahmtes Farbdia wird herausgezogen"/>
      <span className="hm-scn-veil" data-veil aria-hidden="true"/>
      <span className="hm-scn-line" data-scanline aria-hidden="true"/>
     </div>
     <figcaption className="hm-cap"><span>SCN · Diamagazin, nummerierte Fächer</span><span>Digitalisierung</span></figcaption>
    </figure>
    <div className="hm-scn-copy">
     <p className="hm-scn-since"><span className="mono">Wir digitalisieren seit</span><span className="hm-scn-year">2001</span></p>
     <p className="hm-scn-lead">Dias aus dem Magazin, Negativstreifen, Schmalfilm und Videokassetten – vom Original in eine Datei, die bleibt.</p>
     <dl className="hm-scn-facts">{FACTS.map(([k,v])=><div key={k}><dt><span className="chip chip-scan">{k}</span></dt><dd>{v}</dd></div>)}</dl>
     <figure className="hm-scn-side">
      <img src={PHOTO.slideGlove.src} width={PHOTO.slideGlove.w} height={PHOTO.slideGlove.h} loading="lazy" decoding="async" alt="Gerahmtes Kleinbilddia, gehalten mit einem weißen Baumwollhandschuh"/>
      <figcaption className="hm-cap"><span>SCN · Kleinbilddia im Rahmen</span><span>mit Handschuh</span></figcaption>
     </figure>
    </div>
   </div>
  </div>
 </section>;
}
