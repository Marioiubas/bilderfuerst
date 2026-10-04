"use client";
import {useEffect,useRef} from 'react';
export default function Darkroom(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;let scene:{destroy:()=>void}|null=null;let active=false;let disposed=false;let generation=0;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');const desktop=window.matchMedia('(min-width: 768px)');
  const destroy=()=>{generation++;scene?.destroy();scene=null;el.dataset.webgl='static'};
  const sync=async()=>{
   if(disposed||!active||motion.matches||!desktop.matches||document.hidden){destroy();return;}
   if(scene)return;const token=++generation;
   try{const [THREE,{default:FOG}]=await Promise.all([import('three'),import('vanta/dist/vanta.fog.min')]);
    if(disposed||token!==generation)return;
    scene=FOG({el,THREE,mouseControls:false,touchControls:false,gyroControls:false,highlightColor:0x5a3525,midtoneColor:0x25271e,lowlightColor:0x111810,baseColor:0x111610,blurFactor:.6,speed:.28,zoom:.8,scale:2.5,scaleMobile:4});el.dataset.webgl='active';
   }catch{destroy();}
  };
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;void sync()});observer.observe(el);
  const change=()=>void sync();document.addEventListener('visibilitychange',change);motion.addEventListener('change',change);desktop.addEventListener('change',change);
  return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',change);motion.removeEventListener('change',change);desktop.removeEventListener('change',change);destroy()};
 },[]);
 return <div className="darkroom-atmosphere" ref={ref} aria-hidden="true" data-webgl="static"/>;
}
