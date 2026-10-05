"use client";
// Shared motion/runtime setup: device tiers, visibility helpers and cleanup scopes.
// Responsive motion: desktop = full, tablet = moderate, mobile = reduced.
import {useEffect,useState} from 'react';
import {motionAllowed} from './reduced-motion';

export type Tier='static'|'mobile'|'tablet'|'desktop';

type NetworkInfo={saveData?:boolean;effectiveType?:string};
export function saveData(){
 const c=(navigator as Navigator&{connection?:NetworkInfo}).connection;
 return !!c?.saveData||/(^|-)2g$/.test(c?.effectiveType||'');
}

/** Resolve the motion tier for the current device and preference. */
export function motionTier():Tier{
 if(typeof window==='undefined'||!motionAllowed())return 'static';
 if(window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches)return saveData()?'tablet':'desktop';
 if(window.matchMedia('(min-width: 768px)').matches)return 'tablet';
 return 'mobile';
}

export function useMotionTier(){
 const [tier,setTier]=useState<Tier>('static');
 useEffect(()=>{
  const queries=['(prefers-reduced-motion: reduce)','(min-width: 1024px) and (pointer: fine)','(min-width: 768px)'].map(q=>window.matchMedia(q));
  const sync=()=>setTier(motionTier());sync();queries.forEach(q=>q.addEventListener('change',sync));
  return()=>queries.forEach(q=>q.removeEventListener('change',sync));
 },[]);
 return tier;
}

/** Run `enter` once when the element becomes visible. Returns a disposer. */
export function onceVisible(el:Element,enter:()=>void|(()=>void),threshold=.2){
 let cleanup:void|(()=>void);
 const io=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){io.disconnect();cleanup=enter()}},{threshold});
 io.observe(el);
 return()=>{io.disconnect();if(typeof cleanup==='function')cleanup()};
}

/** Track visibility continuously (used to pause WebGL/Vanta offscreen). */
export function whileVisible(el:Element,change:(visible:boolean)=>void,threshold=0){
 const io=new IntersectionObserver(([entry])=>change(entry.isIntersecting),{threshold});
 io.observe(el);
 return()=>io.disconnect();
}

/** Collects revertible animations/disposers so a component can clean up in one call. */
export function motionScope(){
 const items:Array<{revert?:()=>unknown;pause?:()=>unknown}|(()=>void)>=[];
 return{
  add<T extends {revert?:()=>unknown;pause?:()=>unknown}|(()=>void)|undefined|void>(item:T):T{if(item)items.push(item as never);return item},
  revert(){for(const item of items.splice(0)){if(typeof item==='function')item();else if(item.revert)item.revert();else item.pause?.()}},
 };
}
