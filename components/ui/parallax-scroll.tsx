"use client";
// Official Aceternity Parallax Scroll adapted to page scroll and illuminated frames.
import { useScroll, useTransform, useReducedMotion, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
export function ParallaxScroll({images,onSelect}:{images:{src:string;caption:string}[];onSelect?:(src:string)=>void}){
 const ref=useRef<HTMLDivElement>(null); const reduced=useReducedMotion();
 const [mounted,setMounted]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(min-width: 768px) and (pointer: fine)');const update=()=>setMounted(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
 const up=useTransform(scrollYProgress,[0,1],[35,-35]);const down=useTransform(scrollYProgress,[0,1],[-25,25]);
 return <div ref={ref} className="gallery-grid">{images.map((im,i)=><motion.figure key={im.src} style={{y:!mounted||reduced?0:i%2?down:up}} className="gallery-frame"><button onClick={()=>onSelect?.(im.src)} aria-label={`${im.caption} vergrößern`}><img src={im.src} alt={im.caption} width={1000} height={700} loading="lazy"/></button><figcaption><span>0{i+1}</span>{im.caption}</figcaption></motion.figure>)}</div>
}
