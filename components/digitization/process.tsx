"use client";
// Process strip (Abgabe → Originale zurück) + manufactory facts + drop-off CTA.
// Copy from /i/negativ-digitalisierung, /i/dias-digitalisierung-1, /i/super8-…, /i/alle-videokassetten-…,
// /i/wir-digitalisieren and /i/drop-off-locations (edited 2026-08-24). Dealer COUNT is
// deliberately omitted (200 vs 300 conflict, docs/SOURCE-CONFLICTS.md #1).
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {ArrowUpRight,Phone} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {useMotionTier} from '@/motion/setup';
import {processAdvance} from '@/motion/digitization';
import {track} from '@/lib/analytics';
import {dropOffs,SOURCE_DATE} from './data';

const steps=[
 {n:'01',t:'Abgabe',d:'Im Analog Store Fürth, im Fuji-Store Nürnberg oder direkt in der Manufaktur in Fürth-Dambach.'},
 {n:'02',t:'Reinigung',d:'Negative und Dias mit Druckluft, Schmalfilm antistatisch und nass – vor und während der Digitalisierung.'},
 {n:'03',t:'Scan',d:'Farbmaterial mit ICE5 in Originalauflösung, Schmalfilm mit 18 oder 24 Bildern/s, Video auf über 200 Abspielgeräten.'},
 {n:'04',t:'Prüfung & Korrektur',d:'Semi-automatische Farb- und Bildkorrektur, Drehen, Beschriftung: jeder Film, jedes Magazin ein eigener Ordner.'},
 {n:'05',t:'Ausgabe',d:'DVD inklusive. Dein USB-Stick oder deine Festplatte zusätzlich und kostenfrei; Video auch als MP4 in HD.'},
 {n:'06',t:'Originale zurück',d:'Du bekommst dein Material zurück – Dias sogar im eigenen Magazin, in deiner Reihenfolge.'},
];
const timeline=[
 {y:'1998',d:'Die ersten Negative und Dias werden gescannt.'},
 {y:'2001',d:'Digitalisierung als Geschäft: Negative, Dias, Super 8 und die Videoformate Video8, VHS und MiniDV.'},
 {y:'2004',d:'Andere Fotohändler lassen bei uns digitalisieren.'},
 {y:'2012',d:'Eigene Firma mit eigenem Gebäude: die bilderfürst Manufaktur in Fürth-Dambach.'},
];

export function Process(){
 const tier=useMotionTier();const strip=useRef<HTMLOListElement>(null);const played=useRef(false);
 useEffect(()=>played.current?undefined:processAdvance(strip.current,tier,()=>{played.current=true}),[tier]);
 return <section className="dz-sec zone-graphite" aria-labelledby="dz-process-title">
  <div className="wrap">
   <SectionHead code="SCN" label="05 · Ablauf" index="Manufaktur Fürth-Dambach" id="dz-process-title" title={<>Sechs Stationen.<br/>Deine Originale kommen zurück.</>}/>
   <ol className="dz-steps" ref={strip}>
    {steps.map(s=><li key={s.n} className="dz-step" data-advance><span className="mono dz-step-n">{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></li>)}
   </ol>
   <div className="dz-works">
    <div className="dz-manufaktur">
     <p className="mono dz-id-code">Die Manufaktur</p>
     <h3>Digitalisierung ist bei uns kein Nebenbei.</h3>
     <p>Viele unserer Geräte haben wir weiterentwickelt, verbessert oder komplett selbst gebaut. Heute beliefert die bilderfürst Manufaktur Fotohändler – und natürlich unseren Laden in Fürth und den Fuji-Store in Nürnberg.</p>
     <ol className="dz-years">{timeline.map(t=><li key={t.y}><span className="num">{t.y}</span><span>{t.d}</span></li>)}</ol>
    </div>
    <figure className="dz-photo dz-photo-ccd">
     <img src="/images/scanner-ccd-sensor.webp" alt="CCD-Sensor im Objektivanschluss eines Scankopfs der Manufaktur" width={470} height={467} loading="lazy" decoding="async"/>
     <figcaption><span className="mono">Unsere Scan-Technik</span>CCD-Sensor im Scankopf. Foto der Quellseite „Wir digitalisieren“.</figcaption>
    </figure>
    <figure className="dz-photo dz-photo-lab">
     <img src="/images/lab-scan-l.webp" alt="Ein 35-mm-Negativstreifen läuft in den Noritsu-Scanner im Fürther Filmlabor" width={1600} height={1066} loading="lazy" decoding="async"/>
     <figcaption><span className="mono">Neuer Film statt altes Archiv?</span>Frisch entwickelte Filme scannen wir im Labor in Fürth auf dem Noritsu HS-1800. <Link className="link" href="/filmentwicklung">Filmentwicklung <ArrowUpRight size={14}/></Link></figcaption>
    </figure>
   </div>
  </div>
 </section>;
}

export function DropOff(){
 return <section className="dz-sec dz-cta zone-dark" aria-labelledby="dz-cta-title">
  <div className="wrap">
   <p className="eyebrow"><b>SCN</b><span>06 · Abgabe</span></p>
   <div className="dz-cta-grid">
    <div>
     <h2 id="dz-cta-title">Bring deine Kiste vorbei.</h2>
     <p className="lead">Unsortiert ist in Ordnung. Bring mit, was du hast, oder ruf an – wir schauen gemeinsam, was drin ist und welcher Weg passt.</p>
     <div className="dz-hero-actions">
      <Link href="/kontakt" className="btn btn-primary">Kontakt & Öffnungszeiten <ArrowUpRight size={17} className="btn-arrow-up"/></Link>
      <a href="tel:+49911774202" className="btn btn-ghost" onClick={()=>track('click_call',{area:'digitalisierung'})}><Phone size={16}/> 0911 774202</a>
     </div>
    </div>
    <ul className="dz-drops">
     {dropOffs.map(d=><li key={d.code}>
      <span className="mono dz-drop-code">{d.code}</span>
      <div><h3>{d.name}</h3><p className="dz-drop-sub">{d.sub}</p><address>{d.address}</address><p className="mono dz-drop-hours">{d.hours}</p></div>
     </li>)}
    </ul>
   </div>
   <p className="snapshot-note dz-cta-note">Adressen und Öffnungszeiten laut Quellseite Drop-Off-Locations, Stand {SOURCE_DATE}.</p>
  </div>
 </section>;
}
