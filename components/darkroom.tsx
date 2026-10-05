"use client";
// Vanta atmosphere: environmental light only, never information.
// FOG = diffused enlarger light / chemical haze (home hero). DOTS = scanner signal field (digitization).
// Client only, dynamically imported, Three passed explicitly, destroyed offscreen / hidden /
// reduced motion / below desktop / data saving, and always destroyed on unmount.
import {useEffect,useRef} from 'react';
import {motionTier} from '@/motion/setup';
import {acquireContext,releaseContext,webglAvailable,whenEngaged} from '@/lib/webgl';

type VantaScene={destroy:()=>void;renderer?:{setPixelRatio:(ratio:number)=>void;dispose:()=>void;forceContextLoss:()=>void}};
const settings={
 fog:{highlightColor:0x6e1b15,midtoneColor:0x1b1f22,lowlightColor:0x0a0b0c,baseColor:0x0a0b0c,blurFactor:.72,speed:.32,zoom:.85},
 dots:{backgroundColor:0x0a0b0c,color:0x24676b,color2:0x4cc6cc,size:1.25,spacing:38,showLines:false},
} as const;

export default function Darkroom({variant='fog',className=''}:{variant?:'fog'|'dots';className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const id=`vanta-${variant}`;let scene:VantaScene|null=null;let visible=false;let disposed=false;let generation=0;
  const pixelRatio=()=>Math.min((window.devicePixelRatio||1)/2.2,1.25);
  const destroy=()=>{generation++;const current=scene;scene=null;const renderer=current?.renderer;
   try{current?.destroy()}catch{/* Vanta may already have removed its canvas */}
   finally{try{renderer?.dispose();renderer?.forceContextLoss()}catch{/* context already lost */}releaseContext(id);el.dataset.webgl='static'}
  };
  const sync=async()=>{
   if(disposed||!visible||document.hidden||motionTier()!=='desktop'){if(scene)destroy();return}
   if(scene)return;
   const token=++generation;
   await whenEngaged();
   if(disposed||token!==generation||scene||!visible||document.hidden||motionTier()!=='desktop')return;
   if(!webglAvailable()||!acquireContext(id))return;
   el.dataset.webgl='loading';
   try{
    const THREE=await import('three');
    // Vanta DOTS 0.5.24 reads window.THREE during module evaluation.
    (window as Window&{THREE?:typeof THREE}).THREE=THREE;
    const effect=await (variant==='fog'?import('vanta/dist/vanta.fog.min'):import('vanta/dist/vanta.dots.min'));
    if(disposed||token!==generation){releaseContext(id);return}
    scene=effect.default({el,THREE,mouseControls:false,touchControls:false,gyroControls:false,scale:2,scaleMobile:4,...settings[variant]});
    if(!el.querySelector('canvas'))throw new Error('Vanta renderer did not initialize');
    scene?.renderer?.setPixelRatio(pixelRatio());el.dataset.webgl='active';
   }catch{destroy()}
  };
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;void sync()});io.observe(el);
  const queries=['(prefers-reduced-motion: reduce)','(min-width: 1024px) and (pointer: fine)'].map(q=>window.matchMedia(q));
  const change=()=>void sync();const resize=()=>scene?.renderer?.setPixelRatio(pixelRatio());
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',change);queries.forEach(q=>q.addEventListener('change',change));
  return()=>{disposed=true;io.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',change);queries.forEach(q=>q.removeEventListener('change',change));destroy()};
 },[variant]);
 return <div className={`atmosphere atmosphere-${variant} ${className}`} aria-hidden="true"><div className="atmosphere-static"/><div className="atmosphere-canvas" ref={ref} data-webgl="static"/></div>;
}
