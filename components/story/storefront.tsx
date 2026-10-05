"use client";
// The real storefront (March 2018) with an optional 2.5D depth: the SAME photograph is masked into three
// planes (façade, entrance + gable sign, gallery window) that shift a few pixels against the pointer.
// No invented geometry; desktop + motion only (motion/story.ts storefrontDepth). Otherwise a still photo.
import {useEffect,useRef} from 'react';
import {useMotionTier} from '@/motion/setup';
import {storefrontDepth} from '@/motion/story';

export function Storefront(){
 const tier=useMotionTier();const live=tier==='desktop';
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current;if(!live||!el)return;
  return storefrontDepth(el,Array.from(el.querySelectorAll<HTMLElement>('[data-depth]')));
 },[live]);
 return <figure className="vis-front">
  <div className="vis-photo" ref={host}>
   <div className="vis-planes" data-live={live||undefined}>
    <img className="vis-plane" data-depth={live?'1.5':undefined} src="/images/store-exterior-corner.webp" width={1063} height={709} fetchPriority="high" decoding="async" alt="Das Eckgeschäft Alexanderstraße 2 in Fürth: Eingang mit Giebelschild „bilderfürst“, schwarze Schautafeln und das Galerie-Schaufenster mit gerahmten Schwarzweiß-Abzügen"/>
    {live&&<>
     <span className="vis-plane vis-plane-entrance" data-depth="3" aria-hidden="true"/>
     <span className="vis-plane vis-plane-window" data-depth="4.5" aria-hidden="true"/>
    </>}
   </div>
  </div>
  <figcaption className="mono">Alexanderstraße 2, Ecke Schwabacher Straße · Aufnahme März 2018 · Beschilderung von damals</figcaption>
 </figure>;
}
