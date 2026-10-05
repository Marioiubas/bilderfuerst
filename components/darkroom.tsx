"use client";
import {useEffect,useRef} from 'react';
type Scene={destroy:()=>void;renderer?:{setPixelRatio:(ratio:number)=>void;dispose:()=>void;forceContextLoss:()=>void}};
export default function Darkroom({variant='fog'}:{variant?:'fog'|'dots'}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;let scene:Scene|null=null;let active=false;let disposed=false;let generation=0;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');const desktop=window.matchMedia('(min-width: 768px)');
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  const destroy=()=>{generation++;const current=scene;scene=null;const renderer=current?.renderer;
   try{current?.destroy()}catch{/* Vanta can remove a failed initialization canvas before teardown. */}
   finally{renderer?.dispose();renderer?.forceContextLoss();el.dataset.webgl='static'}
  };
  const sync=async()=>{
   if(disposed||!active||motion.matches||!desktop.matches||document.hidden||connection?.saveData){destroy();return;}
   if(scene)return;const token=++generation;
   try{const THREE=await import('three');
    // Vanta DOTS 0.5.24 reads this global at module evaluation, before its option is applied.
    (window as Window & {THREE?:typeof THREE}).THREE=THREE;
    const effect=await (variant==='fog'?import('vanta/dist/vanta.fog.min'):import('vanta/dist/vanta.dots.min'));
    if(disposed||token!==generation)return;
    const common={el,THREE,mouseControls:false,touchControls:false,gyroControls:false,scale:2.5,scaleMobile:4};
    scene=effect.default(variant==='fog'?{...common,highlightColor:0x5b2429,midtoneColor:0x202a30,lowlightColor:0x080b0e,baseColor:0x0b0d0e,blurFactor:.65,speed:.22,zoom:1.2}:{...common,backgroundColor:0x0b0d0e,color:0x35595c,color2:0x55bcc0,size:1.1,spacing:42,showLines:false});
    if(!el.querySelector('canvas'))throw new Error('Vanta renderer did not initialize');
    scene?.renderer?.setPixelRatio(Math.min(window.devicePixelRatio/2.5,1.5));el.dataset.webgl='active';
   }catch{destroy();}
  };
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;void sync()});observer.observe(el);
  const change=()=>void sync();const resize=()=>scene?.renderer?.setPixelRatio(Math.min(window.devicePixelRatio/2.5,1.5));window.addEventListener('resize',resize);document.addEventListener('visibilitychange',change);motion.addEventListener('change',change);desktop.addEventListener('change',change);
  return()=>{disposed=true;observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',change);motion.removeEventListener('change',change);desktop.removeEventListener('change',change);destroy()};
 },[variant]);
 return <div className={`darkroom-atmosphere atmosphere-${variant}`} ref={ref} aria-hidden="true" data-webgl="static"/>;
}
