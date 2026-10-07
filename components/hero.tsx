"use client";
// Home hero · signature experience #1 "floating film workspace".
// Layers: 0 Vanta fog (over an SSR safelight backdrop) · 1 enlarger light (Spotlight) ·
// 2 3D object scene (desktop WebGL) · 3 real photographs (DOM strip / contact sheet) ·
// 4 copy · 5 interaction (view switch "Negativ | Kontaktbogen"). Copy and CTAs are complete at first paint;
// motion only animates from visible states (motion/hero.ts).
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type KeyboardEvent} from 'react';
import {flushSync} from 'react-dom';
import {ArrowRight,ArrowUpRight} from 'lucide-react';
import {HeroFilm} from './hero-film';
import {useWebGLScene,type SceneMount} from '@/hooks/use-webgl-scene';
import {motionTier,useMotionTier} from '@/motion/setup';
import {measureFrames,playContactSheet,playHeroIntro,type Revertible} from '@/motion/hero';
import type {FilmWorkspaceApi} from './three/film-workspace';

const Darkroom=dynamic(()=>import('./darkroom'),{ssr:false});
// Desktop-only enlarger light: keep its Motion runtime out of the initial bundle.
const Spotlight=dynamic(()=>import('./ui/spotlight-new').then(m=>m.Spotlight),{ssr:false});

/** Runs during HTML parsing, before first paint: hold the intro elements at their
 *  (visible) start state so hydration does not flash. Self-heals after 3.5 s. */
const PRE_INTRO="(function(){try{var s=document.currentScript.parentNode;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){s.setAttribute('data-intro','pending');setTimeout(function(){if(s.getAttribute('data-intro')==='pending')s.setAttribute('data-intro','done')},3500)}}catch(e){}})()";

/** The two views of the eight frames. Constant labels; the checked one is the current view (APG radio group). */
const VIEWS=[
 {sheet:false,label:'Negativ',announce:'Negativ-Ansicht: Aufnahmen auf dem Filmstreifen.'},
 {sheet:true,label:'Kontaktbogen',announce:'Kontaktbogen-Ansicht: acht Aufnahmen im Raster.'},
] as const;

export function Hero(){
 const section=useRef<HTMLElement>(null);
 const workspace=useRef<HTMLDivElement>(null);
 const film=useRef<HTMLDivElement>(null);
 const radios=useRef<(HTMLButtonElement|null)[]>([]);
 const sheetRef=useRef(false);
 const api=useRef<FilmWorkspaceApi|null>(null);
 const arrangement=useRef<Revertible|undefined>(undefined);
 const [sheet,setSheet]=useState(false);
 const [announcement,setAnnouncement]=useState('');
 const tier=useMotionTier();

 useLayoutEffect(()=>{const el=section.current;if(!el)return;const intro=playHeroIntro(el,motionTier());return()=>{intro?.revert();arrangement.current?.revert()}},[]);

 const load=useCallback(async():Promise<SceneMount>=>{
  const {mountFilmWorkspace}=await import('./three/film-workspace');
  return (host,ctx)=>mountFilmWorkspace(host,ctx,{pointerTarget:section.current??host,sheet:sheetRef.current,onApi:next=>{api.current=next}});
 },[]);
 const webgl=useWebGLScene(workspace,load,{id:'hero-workspace',threshold:.05});
 // A torn-down scene (tier change, reduced motion, offscreen budget) drops its API.
 useEffect(()=>{if(webgl!=='active')api.current=null},[webgl]);

 function show(next:boolean){
  if(next===sheetRef.current)return;
  sheetRef.current=next;
  const stage=film.current;const scene=workspace.current?.dataset.webgl==='active'?api.current:null;
  const before=stage&&!scene?measureFrames(stage):undefined;
  arrangement.current?.revert();arrangement.current=undefined;
  flushSync(()=>{setSheet(next);setAnnouncement(VIEWS[next?1:0].announce)});
  if(scene)scene.setSheet(next);
  else if(stage&&before)arrangement.current=playContactSheet(stage,before,next,motionTier());
 }
 // Radio group keyboard model: arrows move focus and select (wrapping); Tab enters at the checked option.
 function onKey(e:KeyboardEvent<HTMLDivElement>){
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();
  const next=!sheetRef.current;show(next);radios.current[next?1:0]?.focus();
 }

 return <section ref={section} className="hero zone-dark grain" aria-labelledby="hero-title" suppressHydrationWarning>
  <script dangerouslySetInnerHTML={{__html:PRE_INTRO}}/>
  <div className="hero-backdrop" aria-hidden="true"/>
  <Darkroom variant="fog" className="hero-atmosphere"/>
  {tier==='desktop'&&<div className="hero-light" aria-hidden="true"><Spotlight variant="enlarger" drift={false} origin={70} spread={28} intensity={.085} gradientFirst="radial-gradient(18% 14% at 70% 0%, rgb(244 238 226 / .12), transparent 72%)" gradientSecond="radial-gradient(30% 24% at 68% 44%, rgb(244 238 226 / .05), transparent 72%)"/></div>}

  <div className="hero-inner wrap">
   <div className="hero-copy">
    <p className="hero-meta eyebrow" data-intro-step><b>DRK-00</b><span>/</span><span>Bilderfürst seit 1973 · Alexanderstraße 2, Fürth</span></p>
    <h1 id="hero-title" className="hero-title display display-xl"><span className="hero-line" data-intro-step>Analog.</span><span className="hero-line outline-type" data-intro-step>Für immer.</span></h1>
    <p className="hero-sub" data-intro-step>Dein Blick. Dein Film. Unser Handwerk.</p>
    <p className="hero-lead" data-intro-step>Filme, Kameras und ein eigenes Labor für C-41, Schwarzweiß und E-6 – mitten in Fürth.</p>
    <div className="hero-actions">
     <Link href="/filmentwicklung" className="btn btn-primary" data-intro-step>Film entwickeln <ArrowRight size={17} aria-hidden="true"/></Link>
     <Link href="/shop?category=Filme" className="btn btn-ghost" data-intro-step>Film kaufen <ArrowRight size={17} aria-hidden="true"/></Link>
    </div>
    <Link href="/digitalisierung" className="link hero-textlink" data-intro-step>Alte Medien digitalisieren <ArrowUpRight size={15} aria-hidden="true"/></Link>
   </div>
  </div>

  <div className="hero-workspace" ref={workspace} data-webgl="static" data-view={sheet?'sheet':'strip'}>
   <HeroFilm ref={film} sheet={sheet}/>
   <div className="hero-hud" aria-hidden="true"><i className="hud-c hud-tl"/><i className="hud-c hud-tr"/><i className="hud-c hud-bl"/><i className="hud-c hud-br"/></div>
   <div className="hero-controls">
    <span className="hero-counter mono" aria-hidden="true">08 Bilder<span className="hero-counter-extra"> · 135</span></span>
    <div className="hero-seg" role="radiogroup" aria-label="Ansicht der Aufnahmen" onKeyDown={onKey}>
     {VIEWS.map((v,i)=>{const checked=v.sheet===sheet;return <button key={v.label} ref={el=>{radios.current[i]=el}} type="button" role="radio" aria-checked={checked} tabIndex={checked?0:-1} className="hero-seg-opt" onClick={()=>show(v.sheet)}>
      <span className={`hero-seg-ico ${v.sheet?'hero-seg-ico-sheet':'hero-seg-ico-strip'}`} aria-hidden="true">{v.sheet?<><i/><i/><i/><i/></>:<><i/><i/><i/></>}</span>
      {v.label}
     </button>})}
    </div>
   </div>
   <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
  </div>
 </section>;
}
