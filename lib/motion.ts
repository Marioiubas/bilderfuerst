"use client";
import {useEffect,useState} from 'react';
export function useMotionEnabled(){
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setEnabled(!query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 return enabled;
}
