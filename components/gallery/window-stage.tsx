"use client";
// The window as a stage: a CSS drawing (always rendered; mobile, tablet, reduced motion, no WebGL) and,
// on desktop only, the WebGL model layered on top (hooks/use-webgl-scene.ts, id 'gallery-window').
// Both are decorative representations; the accessible gallery is the print wall below.
import {useRef} from 'react';
import {useWebGLScene} from '@/hooks/use-webgl-scene';
import {windowPrints,shopPrints,prints} from './prints';

const loadScene=async()=>{
 const {createGalleryWindow}=await import('@/components/three/gallery-window');
 return createGalleryWindow(prints.map(({src,w,h,place})=>({src,w,h,place})));
};

export function WindowStage(){
 const hostRef=useRef<HTMLDivElement>(null);
 const state=useWebGLScene(hostRef,loadScene,{id:'gallery-window',threshold:.05});
 return <figure className="gal-stage-fig">
  <div ref={hostRef} className="gal-stage">
   <div className="webgl-fallback gal-w2d" aria-hidden="true">
    <div className="gal-w2d-facade">
     <div className="gal-w2d-main">
      <div className="gal-w2d-grid">{windowPrints.map(p=><span key={p.id} className="gal-w2d-frame"><span className="gal-w2d-photo"><img src={p.src} width={p.w} height={p.h} alt="" loading="lazy" decoding="async"/></span></span>)}</div>
      <span className="gal-w2d-plinth"><i/><i/><i/></span>
      <span className="gal-w2d-glass"/>
     </div>
     <div className="gal-w2d-side">
      <div className="gal-w2d-stack">{shopPrints.map(p=><span key={p.id} className="gal-w2d-frame"><span className="gal-w2d-photo"><img src={p.src} width={p.w} height={p.h} alt="" loading="lazy" decoding="async"/></span></span>)}</div>
      <span className="gal-w2d-glass"/>
     </div>
    </div>
   </div>
   <div className="webgl-host gal-canvas" data-webgl-canvas aria-hidden="true"/>
   <p className="gal-stage-mark mono" aria-hidden="true"><span>GAL · Modell, vereinfacht</span><span>{state==='active'?'3D · Blick folgt der Maus ±2°':'Zeichnung'}</span></p>
  </div>
  <figcaption className="gal-stage-cap">
   <span className="mono">Schaufenster · Nachbildung</span>
   <span>Neun gerahmte Abzüge hinter Glas, rechts durch das schmale Fenster drei weitere im Laden. Vereinfachte Nachbildung, kein Foto – die Motive sind Labormuster und Fotos aus Laden und Labor, nicht die aktuelle Ausstellung.</span>
  </figcaption>
 </figure>;
}
