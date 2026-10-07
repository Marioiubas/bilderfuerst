"use client";
// Digitization hero: graphite + scanner cyan (the only cyan zone of the site).
// Atmosphere: Vanta DOTS (desktop only, via darkroom.tsx; static scanner-light fallback).
// Foreground: REAL photographs from the source pages (a mounted slide, a slide magazine),
// served responsively: 480 / 1400 / 2500 px candidates with `sizes` matching the layout, so
// phones never fetch the 2500 px files and only large, dense screens do.
import dynamic from 'next/dynamic';
import {useEffect,useRef} from 'react';
import {ArrowDown} from 'lucide-react';
import {useMotionTier} from '@/motion/setup';
import {heroScanPass} from '@/motion/digitization';

const Darkroom=dynamic(()=>import('@/components/darkroom'),{ssr:false});

const readout=[
 {k:'Seit',v:'2001',d:'Digitalisierung als Geschäft, erste Scans 1998'},
 {k:'Eigene Firma',v:'2012',d:'bilderfürst Manufaktur in Fürth-Dambach'},
 {k:'Farbe',v:'ICE5',d:'Staub- und Kratzerentfernung beim Scan'},
 {k:'Video',v:'200+',d:'Abspielgeräte für jede Kassette'},
];

export function DigitizationHero(){
 const tier=useMotionTier();
 const bar=useRef<HTMLSpanElement>(null);const played=useRef(false);
 // One pass per visit: a later tier change (window resize) never replays it.
 useEffect(()=>{if(played.current)return;const run=heroScanPass(bar.current,tier);if(run)played.current=true;return()=>{run?.revert()}},[tier]);
 return <section className="dz-hero zone-dark grain" aria-labelledby="dz-title">
  <Darkroom variant="dots"/>
  <div className="wrap dz-hero-grid">
   <div className="dz-hero-copy">
    <p className="eyebrow"><b>SCN</b><span>Digitalisierung</span><span aria-hidden="true">/</span><span>bilderfürst Manufaktur Fürth</span></p>
    <h1 id="dz-title" className="display dz-title"><span>Gestern belichtet.</span><span className="dz-title-2">Heute digital<i className="dz-dot">.</i></span></h1>
    <p className="lead">Dias, Negative, Schmalfilm, Videokassetten, Tonband und Schallplatte: Seit 2001 digitalisieren wir analoges Material – heute in der eigenen bilderfürst Manufaktur in Fürth-Dambach, die auch für andere Fotohändler arbeitet.</p>
    <div className="dz-hero-actions">
     <a href="#was-hast-du" className="btn btn-primary">Objekt wählen <ArrowDown size={17}/></a>
     <a href="#abgabe" className="btn btn-ghost">Abgabe & Kontakt <ArrowDown size={17}/></a>
    </div>
    <dl className="dz-readout">
     {readout.map(r=><div key={r.k}><dt className="mono">{r.k}</dt><dd><span className="dz-readout-v">{r.v}</span><span className="dz-readout-d">{r.d}</span></dd></div>)}
    </dl>
   </div>
   <div className="dz-hero-object">
    <figure className="dz-plate reg">
     <figcaption className="dz-plate-bar mono"><span>Vorlage 01 · KB-Dia 5 × 5 cm</span><span className="dz-signal" aria-hidden="true">Signal</span></figcaption>
     <div className="dz-plate-img">
      <img src="/images/slide-in-glove.webp" srcSet="/images/slide-in-glove-t.webp 480w, /images/slide-in-glove.webp 1400w, /images/slide-in-glove-l.webp 2500w" sizes="(min-width: 1024px) min(36vw, 540px), (min-width: 680px) 600px, 90vw" alt="Gerahmtes Kleinbild-Dia, mit einem Baumwollhandschuh gehalten" width={1400} height={1120} fetchPriority="high" decoding="async"/>
      <span className="dz-hero-scan" ref={bar} aria-hidden="true"/>
     </div>
     <p className="dz-plate-bar dz-plate-credit mono">Foto der Quellseite</p>
    </figure>
    <figure className="dz-plate dz-plate-sm">
     <img src="/images/slide-magazine-macro.webp" srcSet="/images/slide-magazine-macro.webp 1400w, /images/slide-magazine-macro-l.webp 2500w" sizes="(min-width: 1024px) min(16vw, 240px), 1px" alt="Dia-Magazin mit nummerierten Fächern, ein Dia wird entnommen" width={1400} height={1120} loading="lazy" decoding="async"/>
     <figcaption className="mono">Magazin · nummerierte Fächer</figcaption>
    </figure>
   </div>
  </div>
 </section>;
}
