"use client";
// Reduced-motion contract: when the user prefers reduced motion, every module must
// render its final static state instantly. Vanta, 3D auto movement, parallax,
// aperture masks, film advancement, scanner lines, beams and gallery spreads are off.
import {useEffect,useState} from 'react';

const QUERY='(prefers-reduced-motion: reduce)';

export function motionAllowed(){
 if(typeof window==='undefined')return false;
 return !window.matchMedia(QUERY).matches;
}

/** SSR-safe: false on the server and first paint, then the real preference. */
export function useMotionAllowed(){
 const [allowed,setAllowed]=useState(false);
 useEffect(()=>{const q=window.matchMedia(QUERY);const sync=()=>setAllowed(!q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync)},[]);
 return allowed;
}

/** Calls `onChange` whenever the preference flips (e.g. to tear down canvases live). */
export function watchReducedMotion(onChange:(reduced:boolean)=>void){
 const q=window.matchMedia(QUERY);const fn=()=>onChange(q.matches);q.addEventListener('change',fn);return()=>q.removeEventListener('change',fn);
}
