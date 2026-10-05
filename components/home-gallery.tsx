"use client";
// 06 · GAL STREET GALLERY — black wall, still by design (motion needs contrast). The 2018 window photo is shown
// uncropped and labelled as the window, not the current exhibition. Facts: /i/galerie (edited 01.04.2022, live 05.10.2026).
// Community log: past events from the shop (homepage poster, catalog past events) — dated, never presented as upcoming.
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead} from './analog/primitives';
import {track} from '@/lib/analytics';
import {PHOTO,chapter} from './home-shared';

const FACTS:[string,string][]=[
 ['Seit','Anfang 2020 Street Gallery mit analogen Aufnahmen'],
 ['Schaufenster','9 Bilder, 24 Stunden sichtbar'],
 ['Im Laden','3 weitere während der Öffnungszeiten'],
 ['Ausstellungen','wechselnd · alle Aufnahmen analog'],
 ['Ort','Ecke Schwabacher Straße / Alexanderstraße'],
];
const LOG:[string,string,string][]=[
 ['15.03.2026','Vernissage','„GRAIN!“ · Matthias Welker'],
 ['19.07.2025','Workshop','Schwarzweiß-Filmentwicklung · Odd Squad Studios Nürnberg'],
 ['23.03.2024','Photowalk','im Shop ausgeschrieben'],
];

export function HomeGallery(){
 const head=chapter('GAL');
 return <section className="hm-gal zone-dark grain" id={head.sectionId} aria-labelledby="hm-gal-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-gal-title"
    title={<>Neun Bilder.<br/><span className="outline-type">Rund um die Uhr.</span></>}
    action={<Link className="link" href="/galerie" onClick={()=>track('open_gallery',{source:'home'})}>Zur Street Gallery <ArrowUpRight size={16}/></Link>}/>
   <div className="hm-gal-grid">
    <figure className="hm-gal-photo">
     <div className="hm-gal-mat"><img src={PHOTO.galleryWindow.src} width={PHOTO.galleryWindow.w} height={PHOTO.galleryWindow.h} loading="lazy" decoding="async" alt="Schaufenster des Ladens an der Alexanderstraße 2 mit neun gerahmten Schwarzweiß-Fotografien in drei Reihen"/></div>
     <figcaption className="hm-cap"><span>GAL · Schaufenster Alexanderstraße 2 · Aufnahme 12.03.2018</span><span>Zeigt das Fenster, nicht die aktuelle Ausstellung</span></figcaption>
    </figure>
    <div className="hm-gal-side">
     <div className="hm-window" role="img" aria-label="Schema der Street Gallery: neun Bilder im Schaufenster in drei Reihen zu je drei, drei weitere Bilder im Laden">
      <p className="hm-window-label mono" aria-hidden="true"><span>Schaufenster · 24 h</span><span>3 × 3</span></p>
      <div className="hm-window-pane" aria-hidden="true">{Array.from({length:9},(_,i)=><span key={i} className="hm-window-frame"><span className="mono">{String(i+1).padStart(2,'0')}</span></span>)}</div>
      <p className="hm-window-label mono" aria-hidden="true"><span>Im Laden · Öffnungszeiten</span><span>+3</span></p>
      <div className="hm-window-inside" aria-hidden="true">{[10,11,12].map(n=><span key={n} className="hm-window-frame"><span className="mono">{n}</span></span>)}</div>
     </div>
     <p className="hm-gal-invite">Du fotografierst analog? Komm mit deinen Aufnahmen in den Laden oder schreib uns.</p>
    </div>
   </div>
   <dl className="hm-gal-facts">{FACTS.map(([k,v])=><div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
   <div className="hm-log">
    <p className="eyebrow" id="hm-log-title"><b>LOG</b><span>Zuletzt in der Community</span><span className="sec-index">vergangene Termine</span></p>
    <ol className="hm-log-list" aria-labelledby="hm-log-title">{LOG.map(([date,kind,what])=><li key={date}><time className="mono num" dateTime={date.split('.').reverse().join('-')}>{date}</time><span className="hm-log-kind">{kind}</span><span className="hm-log-what">{what}</span></li>)}</ol>
   </div>
  </div>
 </section>;
}
