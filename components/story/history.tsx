"use client";
// /geschichte · "Film roll through time". Dark-first route (header joins the dark tone at the top).
// Signature: a vertical 35 mm strip (adapted Tracing Beam) carries one frame per chapter; an amber
// film-base light sits on the viewport centre line and each frame "develops" as it reaches the light
// (motion/history.ts). A sticky year counter (Leica-timeline reference) advances frame by frame.
// Fallbacks: all text is server-rendered HTML; "Zur Übersicht" skips to a static chapter list;
// reduced motion and phones get a static rail and fully developed frames.
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {TracingBeam} from '@/components/ui/tracing-beam';
import {SectionHead,frameNo} from '@/components/analog/primitives';
import {useMotionTier} from '@/motion/setup';
import {advanceCounter,armFrames,developFrame,developOnLoad,watchChronicle} from '@/motion/history';
import {CHAPTERS,SRC,type Chapter} from './facts';

const anchor=(c:Chapter)=>`kapitel-${c.year.toLowerCase()}`;
const TOTAL=frameNo(CHAPTERS.length);

export function HistoryPage(){
 const tier=useMotionTier();
 const animated=tier==='desktop'||tier==='tablet';
 const [active,setActive]=useState(0);
 const strip=useRef<HTMLDivElement>(null);
 const frames=useRef<HTMLElement[]>([]);
 const digits=useRef<HTMLSpanElement>(null);
 const archive=useRef<HTMLImageElement>(null);
 const previous=useRef(0);
 const runs=useRef<Array<{revert:()=>unknown}>>([]);

 useEffect(()=>developOnLoad(archive.current),[]);
 useEffect(()=>{
  frames.current=Array.from(strip.current?.querySelectorAll<HTMLElement>('.hist-frame')??[]);
  return watchChronicle(frames.current,setActive);
 },[]);
 useEffect(()=>{
  if(!animated)return;
  const disarm=armFrames(frames.current);const started=runs.current;
  return()=>{started.splice(0).forEach(r=>r.revert());disarm()};
 },[animated]);
 useEffect(()=>{
  frames.current.forEach((f,i)=>{if(i<=active){const run=developFrame(f);if(run)runs.current.push(run)}});
 },[active,animated]);
 useEffect(()=>{
  if(previous.current===active)return;
  const direction=active>previous.current?1:-1;previous.current=active;
  const run=advanceCounter(digits.current,direction);
  return()=>{run?.revert()};
 },[active]);

 const current=CHAPTERS[active];
 return <div className="hist">
  <section className="zone-dark grain hist-intro" aria-labelledby="hist-title">
   <div className="wrap">
    <p className="eyebrow"><b>ARC</b><span>Archiv · Familie Dittmer</span><span className="sec-index">1935 — heute</span></p>
    <h1 id="hist-title" className="display hist-title">Drei Generationen <span className="outline-type">auf einem Film.</span></h1>
    <div className="hist-intro-foot">
     <p className="lead">Von den Fotolaboren bei Foto Seitz in Nürnberg bis zum Analog Store mit eigenem Labor in der Alexanderstraße 2. Die Chronik der Familie Dittmer, Bild für Bild – so, wie sie das Geschäft selbst aufgeschrieben hat.</p>
     <nav className="hist-jump" aria-label="Chronik">
      <a className="btn btn-light" href={`#${anchor(CHAPTERS[0])}`}>Chronik starten <ArrowDown size={16}/></a>
      <a className="link" href="#uebersicht">Zur Übersicht</a>
     </nav>
    </div>
   </div>
   <figure className="wrap hist-archive">
    <div className="hist-archive-film">
     <div className="sprockets" aria-hidden="true"/>
     <img ref={archive} src="/images/history-l.webp" width={1600} height={457} fetchPriority="high" decoding="async" alt="Drei Archivaufnahmen nebeneinander: eine Bilderfürst-Ladenfront mit „Farbfotos in 1 Stunde“ und Datumsstempel ’88, das Schaufenster von Foto Seitz in Schwarzweiß und ein Verkaufsraum mit „Farbfotos in 1 Stunde“."/>
     <div className="sprockets" aria-hidden="true"/>
     <p className="hist-archive-edge" aria-hidden="true"><span>▸ 1</span><span>▸ 2</span><span>▸ 3</span></p>
    </div>
    <figcaption><span className="mono">Archivstreifen · drei Aufnahmen</span> 1 · Ladenfront mit Bilderfürst-Schild, Datumsstempel ’88 &nbsp;·&nbsp; 2 · Schaufenster „Foto Seitz“ &nbsp;·&nbsp; 3 · Verkaufsraum. So veröffentlicht auf der Geschichtsseite des Geschäfts; Ort und Jahr der einzelnen Bilder sind dort nicht beschriftet.</figcaption>
   </figure>
  </section>

  <section className="zone-dark hist-chronicle" aria-labelledby="chronik-title">
   <div className="wrap">
    <SectionHead code="ARC" label="Chronik" index={`${CHAPTERS.length} Kapitel`} id="chronik-title" title={<>Ein Streifen,<br/>zehn Bilder.</>} action={<a className="link" href="#uebersicht">Chronik überspringen</a>}/>
    <div className="hist-grid">
     <aside className="hist-hud" aria-label="Position in der Chronik">
      <p className="mono hist-hud-code" aria-hidden="true"><span>Kapitel {frameNo(active+1)} / {TOTAL}</span><span className="hist-hud-dot"/></p>
      <p className="hist-hud-year" aria-hidden="true"><span ref={digits} className="hist-hud-digits num">{current.year}</span></p>
      <p className="hist-hud-title" aria-hidden="true">{current.title}</p>
      <nav className="hist-index" aria-label="Kapitel anspringen">
       <ol>{CHAPTERS.map((c,i)=><li key={c.year}><a href={`#${anchor(c)}`} aria-current={i===active?'step':undefined}><span className="mono">{frameNo(i+1)}</span>{c.year}</a></li>)}</ol>
      </nav>
     </aside>
     <div className="hist-strip-wrap" ref={strip}>
      <TracingBeam className="hist-strip">
       {CHAPTERS.map((c,i)=><Frame key={c.year} chapter={c} index={i}/>)}
      </TracingBeam>
     </div>
    </div>
   </div>
  </section>

  <section id="uebersicht" className="zone-light hist-overview" aria-labelledby="uebersicht-title">
   <div className="wrap">
    <SectionHead code="ARC" label="Übersicht" index="Kontaktbogen" id="uebersicht-title" title="Alle Kapitel auf einen Blick."/>
    <div className="hist-sheet">
     <ol className="hist-list">{CHAPTERS.map((c,i)=><li key={c.year}><a href={`#${anchor(c)}`}><span className="mono">{frameNo(i+1)}</span><span className="hist-list-year num">{c.year}</span><span className="hist-list-title">{c.title}{c.historic&&<em> · historisch</em>}</span></a></li>)}</ol>
    </div>
    <div className="hist-sources">
     <p className="source-note">Chronik nach der Seite „Unsere Geschichte“ (zuletzt bearbeitet 19.11.2020), ergänzt um „Galerie“, „Wir digitalisieren“ und „Unser Geschäft“; abgerufen am 05.10.2026. Leica Boutique, Leica Store und Fuji X Store sind historische Einträge, keine heutigen Angebote des Fürther Ladens. Archivaufnahmen: Nutzungsrechte werden vom Inhaber geprüft.</p>
     <div className="source-actions">
      <Link className="btn btn-ink" href="/kontakt">Den Laden heute besuchen <ArrowUpRight size={17} className="btn-arrow-up"/></Link>
      <a className="link" href={SRC.history} target="_blank" rel="noopener noreferrer">Originalseite „Unsere Geschichte“ <ArrowUpRight size={15}/></a>
     </div>
    </div>
   </div>
  </section>
 </div>;
}

function Frame({chapter:c,index}:{chapter:Chapter;index:number}){
 const id=anchor(c);const no=frameNo(index+1);
 return <article className="hist-frame" id={id} aria-labelledby={`${id}-t`}>
  <p className="hist-edge hist-edge-top" aria-hidden="true"><span>{no}</span><span>▸ BF·ARC · {c.year}</span><span>{no}A</span></p>
  <p className="hist-edge hist-edge-side" aria-hidden="true">BF ARCHIV ▸ {c.year} ▸ {no}A</p>
  <div className="hist-frame-body">
   <p className="mono hist-kicker">Kapitel {no} · {c.year}{c.historic&&<span className="chip">Historischer Eintrag</span>}</p>
   <p className="hist-frame-year num" aria-hidden="true">{c.year}</p>
   <h3 id={`${id}-t`}>{c.title}</h3>
   {c.image&&<figure className="hist-frame-img">
    <img src={c.image.src} width={c.image.w} height={c.image.h} alt={c.image.alt} loading="lazy" decoding="async"/>
    <figcaption className="mono">{c.image.caption}</figcaption>
   </figure>}
   <div className="hist-copy">{c.body.map(t=><p key={t}>{t}</p>)}</div>
   {c.note&&<p className="hist-note"><span className="mono">Quellenhinweis</span>{c.note}</p>}
   {c.links&&<p className="hist-links">{c.links.map(l=><Link key={l.href} className="link" href={l.href}>{l.label} <ArrowUpRight size={15}/></Link>)}</p>}
  </div>
 </article>;
}
