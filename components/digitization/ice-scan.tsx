"use client";
// Signature: the scanner pass over the REAL ICE5 sample pair from /i/negativ-digitalisierung
// (same slide crop scanned without and with ICE5; 1400 × 1120, plus 2000 × 1600 renditions of
// the same 5 : 4 crop via srcSet for large / high-density screens). Desktop/tablet: the raw
// scan enters, a cyan scan line travels at constant speed revealing the ICE5 scan behind it
// with a mono "SCAN 0–100 %" readout, then settles at 50 % and hands control to Compare.
// Mobile / reduced motion: the final Compare is shown directly. This is the page's only
// before/after; it is a sample of the manufactory's own scan, not a customer image.
//
// Alignment (crop/position only, least-squares / NCC on blurred greyscale at native 2500 px,
// docs/PRODUCT-IMAGE-AUDIT.md): the without-ICE file shows the slide ~2.9 % smaller and
// shifted; mapped onto the ICE file it is scaled × 1.0292 with its top-left corner at
// −0.985 % of the width and +1.76 % of the height (= −13.8 px, +19.7 px at 1400 × 1120; the
// earlier +2.06 % sat ~3.5 px low). Percentages hold for every rendition of the same crop.
// Both are cropped to the common area x 15–1385, y 24–1120 of the ICE file (1370 × 1096,
// 5 : 4). No pixel is retouched.
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {SectionHead} from '@/components/analog/primitives';
import {Compare,type CompareBox} from '@/components/ui/compare';
import {useMotionTier,onceVisible} from '@/motion/setup';
import {iceScanPass,type ScanController,type ScanPhase} from '@/motion/digitization';
import {track} from '@/lib/analytics';
import {sectionLabel} from './jump-index';

const CROP={x:15,y:24,w:1370,h:1096};
const box=(x:number,y:number,w:number,h:number):CompareBox=>({left:(x-CROP.x)/CROP.w*100,top:(y-CROP.y)/CROP.h*100,width:w/CROP.w*100,height:h/CROP.h*100});
const W=1400,H=1120,SCALE=1.0292,DX=-.00985,DY=.0176;
/** ICE5 scan: native position. */
const ICE_BOX=box(0,0,W,H);
/** Raw scan: scaled × 1.0292 and positioned to register with the ICE5 scan. */
const RAW_BOX=box(DX*W,DY*H,W*SCALE,H*SCALE);
/** Rendered width ≈ 1.06 × stage: 8/12 of the wrap from 1024 px, else the full wrap. Phones
 *  (≤ 3× DPR) resolve to the 1400 px file; the 2000 px files go to large / dense screens. */
const SIZES='(min-width: 1024px) min(62vw, 960px), 98vw';
const set=(name:string)=>`/images/${name}.webp 1400w, /images/${name}-l.webp 2000w`;
const pad=(n:number)=>String(Math.round(n)).padStart(3,'0');

export function IceScan(){
 const tier=useMotionTier();
 const [percent,setPercent]=useState(50);
 const [phase,setPhase]=useState<ScanPhase>('ready');
 const [scanned,setScanned]=useState(100);
 const stage=useRef<HTMLDivElement>(null);
 const ctl=useRef<ScanController|null>(null);
 const pending=useRef<(()=>void)|null>(null);
 const tracked=useRef(false);
 const played=useRef(false);

 useEffect(()=>{
  if(played.current||(tier!=='desktop'&&tier!=='tablet'))return;
  const el=stage.current;if(!el)return;
  setPhase('pending');setPercent(0);setScanned(0);
  pending.current=onceVisible(el,()=>{
   pending.current=null;
   ctl.current=iceScanPass(tier,(p,ph)=>{setPercent(p);setPhase(ph);if(ph==='scan')setScanned(p);else setScanned(100)},()=>{ctl.current=null;played.current=true;setPercent(50);setScanned(100);setPhase('ready')})??null;
   if(!ctl.current){setPercent(50);setScanned(100);setPhase('ready')}
  },.45);
  return()=>{pending.current?.();pending.current=null;ctl.current?.revert();ctl.current=null;setPercent(50);setScanned(100);setPhase('ready')};
 },[tier]);

 const interact=()=>{
  played.current=true;
  if(phase!=='ready'){
   pending.current?.();pending.current=null;
   const p=ctl.current?.stop();ctl.current=null;
   if(typeof p==='number')setPercent(p);
   setScanned(100);setPhase('ready');
  }
  if(!tracked.current){tracked.current=true;track('compare_digitization',{sample:'ice5'})}
 };

 const scanning=phase==='pending'||phase==='scan';
 return <section id="scan-probe" className="dz-sec zone-dark" aria-labelledby="dz-ice-title">
  <div className="wrap">
   <SectionHead code="SCN" label={sectionLabel('04')} index="ICE5 · echtes Musterbild" id="dz-ice-title" title={<>Ein Dia.<br/>Zwei Scans.</>}/>
   <div className="dz-ice">
    <div className="dz-ice-copy">
     <p className="lead">Derselbe Ausschnitt eines gerahmten Kleinbild-Dias, einmal ohne und einmal mit ICE5 gescannt. Staub, Fusseln und Kratzer verschwinden direkt beim Scan – per Hardware, nicht per Retusche.</p>
     <dl className="dz-spec">
      <div><dt className="mono">Vorlage</dt><dd>Kleinbild-Dia, gerahmt im Magazin</dd></div>
      <div><dt className="mono">Ausschnitt</dt><dd>ca. 15 % des Dias, oben rechts</dd></div>
      <div><dt className="mono">ICE5</dt><dd>bei Farbnegativen und Farbdias – bei Schwarzweiß technisch nicht möglich</dd></div>
      <div><dt className="mono">Scanzeit</dt><dd>ICE kostet Zeit: 4:00 Min. pro Negativ, 4:30 Min. pro Dia</dd></div>
     </dl>
     <p className="dz-note">Woher der Staub kommt? Aus jedem Diaabend: Das Gebläse des Projektors zog ihn an, im Lichtkegel war er zu sehen – und er setzte sich auf den Dias ab.</p>
    </div>
    <div className="dz-ice-stage">
     <div className="dz-hud mono" aria-hidden="true">
      <span className="dz-hud-scan">Scan <b>{pad(scanned)}</b> %</span>
      <span className="dz-hud-meter"><i style={{transform:`scaleX(${scanned/100})`}}/></span>
      <span>{phase==='ready'?'Vergleich: ziehen oder Pfeiltasten':phase==='settle'?'ICE5 · fertig':'ICE5 · Hardware'}</span>
     </div>
     <Compare className="compare-scan" state={scanning?'scan':phase}
      firstImage="/images/ice-sample-with.webp" secondImage="/images/ice-sample-without.webp"
      firstSrcSet={set('ice-sample-with')} secondSrcSet={set('ice-sample-without')} sizes={SIZES}
      firstLabel="Mit ICE5" secondLabel="Ohne ICE"
      firstAlt="Dia-Ausschnitt einer Berglandschaft im Dunst, gescannt mit ICE5: Staub und Kratzer sind entfernt"
      secondAlt="Derselbe Dia-Ausschnitt ohne ICE gescannt: Staubkörner, Fusseln und Kratzer sind deutlich sichtbar"
      rangeLabel="Scan mit ICE5 und ohne ICE vergleichen"
      aspect="5 / 4" imageWidth={W} imageHeight={H} firstBox={ICE_BOX} secondBox={RAW_BOX}
      percent={percent} onPercentChange={setPercent} onInteract={interact} stageRef={stage}
      caption={<><span>Echter Ausschnitt eines Dias, gescannt ohne und mit ICE5 – Musterbild der Quellseite <Link className="link" href="/i/negativ-digitalisierung">Negativ-Digitalisierung</Link>. Nicht retuschiert; für den Vergleich nur deckungsgleich ausgerichtet (Ausschnitt und Position).</span><span className="mono">Aufnahme laut Quellseite: Olaf Wolf, Leica Camera AG · Scan aus dem laufenden Prozess 2010</span></>}/>
    </div>
   </div>
  </div>
 </section>;
}
