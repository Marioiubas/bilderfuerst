"use client";
import {useEffect,useRef} from 'react';
import type {PropScene} from '@/motion/prop-scene';
export type AnalogProp='Aperture'|'Reel'|'Cassette'|'VHS'|'Negative'|'Prints';
export function PropPoster({kind,className=''}:{kind:AnalogProp;className?:string}){
 return <div className={`prop-poster ${className}`} aria-hidden="true"><img src={`/props/${kind.toLowerCase()}.webp`} alt="" width={480} height={360} loading="lazy"/></div>;
}
export function HiggsfieldProp({kind}:{kind:AnalogProp}){
 const ref=useRef<HTMLDivElement>(null);const sceneRef=useRef<PropScene|null>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;let disposed=false,active=false,generation=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const desktop=window.matchMedia('(min-width: 768px) and (pointer: fine)');
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  const destroy=()=>{generation++;sceneRef.current?.destroy();sceneRef.current=null;el.dataset.scene='static'};
  const sync=async()=>{
   if(disposed||!active||reduced.matches||!desktop.matches||document.hidden||connection?.saveData){destroy();return;}
   if(sceneRef.current)return;const token=++generation;
   try{const {mountProp}=await import('@/motion/prop-scene');if(disposed||token!==generation)return;
    const scene=await mountProp(el,kind);if(disposed||token!==generation){scene.destroy();return;}sceneRef.current=scene;el.dataset.scene='active';scene.play();
   }catch{destroy();}
  };
  const io=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;void sync()},{threshold:.25});io.observe(el);
  const onVisibility=()=>void sync();document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onVisibility);desktop.addEventListener('change',onVisibility);
  return()=>{disposed=true;io.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onVisibility);desktop.removeEventListener('change',onVisibility);destroy()};
 },[kind]);
 return <div className="higgsfield-prop" ref={ref} data-scene="static" aria-label="Stilisierte optische 3D-Illustration"><img src={`/props/${kind.toLowerCase()}.webp`} alt="" width={480} height={360} loading="lazy"/><div className="prop-registration" aria-hidden="true"><span>{kind==='Aperture'?'OPTIK / LICHTWEG':'ANALOG / MEDIUM'}</span><span>01 : 01</span></div>{kind==='Aperture'&&<button className="prop-action" onClick={()=>sceneRef.current?.play()}>Blende öffnen ↗</button>}</div>;
}
