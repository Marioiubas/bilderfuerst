"use client";
// Adapted from Aceternity UI "Tracing Beam" (motion/react, scroll-linked; owned by the story stream).
// Re-drawn for Direction C as an AMBER FILM-BASE LIGHT travelling through a vertical 35 mm strip:
// a translucent dark film base with perforation lanes on both edges (the holes are real gaps in the
// base layer); the light is a band of transmitted amber that sits on the viewport centre line behind
// the base, so the base glows and the sprocket holes it passes light up; an exposed trail stays
// behind it. Children are the frames on the strip.
// Motion engine: motion/react only (useScroll + an overdamped spring, no overshoot). Desktop/tablet
// only; mobile and reduced motion get a static rail (no light, no trail animation).
import {useEffect,useRef,type ReactNode} from 'react';
import {motion,useMotionValue,useScroll,useSpring,useTransform} from 'motion/react';
import {useMotionTier} from '@/motion/setup';
import {cn} from '@/lib/utils';

const BAND=260; // px height of the light band

export function TracingBeam({children,className}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 const tier=useMotionTier();
 const live=tier==='desktop'||tier==='tablet';
 const height=useMotionValue(0);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const ro=new ResizeObserver(()=>height.set(el.offsetHeight));ro.observe(el);
  return()=>ro.disconnect();
 },[height]);
 // Progress 0 when the strip top reaches the viewport centre, 1 when its end does: the light is the centre line.
 const {scrollYProgress}=useScroll({target:ref,offset:['start center','end center']});
 // Damping ratio ≈ 2.2 → overdamped: precise, no bounce.
 const progress=useSpring(scrollYProgress,{stiffness:420,damping:64,mass:.5,restDelta:.0005});
 const y=useTransform(()=>progress.get()*height.get()-BAND/2);
 // The gate: amber ticks in both perforation lanes marking where the light crosses the strip.
 const gate=useTransform(()=>progress.get()*height.get());
 return <div ref={ref} className={cn('tbeam',className)} data-beam={live?'live':'static'}>
  <div className="tbeam-rail" aria-hidden="true">
   {live&&<motion.span className="tbeam-light" style={{y,height:BAND}}><span className="tbeam-lit tbeam-lit-start"/><span className="tbeam-lit tbeam-lit-end"/></motion.span>}
   <span className="tbeam-base"/>
   <span className="tbeam-perf tbeam-perf-start"/><span className="tbeam-perf tbeam-perf-end"/>
   <motion.span className="tbeam-trail" style={live?{scaleY:progress}:undefined}/>
  </div>
  <div className="tbeam-content">{children}</div>
  {live&&<motion.span className="tbeam-gate" style={{y:gate}} aria-hidden="true"/>}
 </div>;
}
