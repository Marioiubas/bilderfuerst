"use client";
// Header: one scroll threshold. Crossing it compacts the bar (CSS) and runs a single
// red registration line across its lower edge (metaphor: frame-lock / registration).
import {animate} from 'animejs/animation';
import {duration,ease} from './tokens';
import {motionAllowed} from './reduced-motion';

export function registerSweep(line:HTMLElement|null){
 if(!line||!motionAllowed())return;
 return animate(line,{scaleX:[{from:0,to:1,duration:duration.normal,ease:ease.shutter}],opacity:[{from:1,to:0,delay:duration.normal,duration:duration.normal}]});
}

/** Observe a sentinel at the top of the page; returns a disposer. */
export function watchHeaderThreshold(onChange:(compact:boolean)=>void,threshold=56){
 let compact=window.scrollY>threshold;onChange(compact);
 let frame=0;
 const read=()=>{frame=0;const next=window.scrollY>threshold;if(next!==compact){compact=next;onChange(compact)}};
 const scroll=()=>{if(!frame)frame=requestAnimationFrame(read)};
 window.addEventListener('scroll',scroll,{passive:true});
 return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame)};
}
