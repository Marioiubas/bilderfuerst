"use client";
// Story motion for the calm pages (print room, storefront). Anime.js v4; mostly still by design.
// Reduced motion: every function is a no-op (final static state). Callers gate mobile/tablet themselves.
import {animate} from 'animejs/animation';
import {createAnimatable} from 'animejs/animatable';
import {stagger} from 'animejs/utils';
import {duration,ease,stagger as gap} from './tokens';
import {motionAllowed} from './reduced-motion';

/** Metaphor: print-emerge — prints slide out of the printer onto the stack, one after another. */
export function emergeSheets(sheets:Element[]){
 if(!motionAllowed()||!sheets.length)return;
 return animate(sheets,{translateY:[34,0],opacity:[0,1],duration:duration.section,delay:stagger(gap.normal*2),ease:ease.shutter});
}

/** Metaphor: print-emerge — the stack fans out (prints lifted off the table) or settles back.
 *  Animates the CSS variable --spread on the stack; slot geometry is pure CSS calc(). */
export function spreadStack(stack:HTMLElement|null,to:number){
 if(!stack||!motionAllowed())return;
 return animate(stack,{'--spread':to,duration:duration.normal,ease:ease.shutter});
}

/** Metaphor: print-emerge — the newly chosen paper rises onto the top of the stack. */
export function liftSheet(sheet:HTMLElement|null){
 if(!sheet||!motionAllowed())return;
 return animate(sheet,{translateY:[20,0],opacity:[.5,1],duration:duration.normal,ease:ease.shutter});
}

/** Metaphor: focus — a few degrees of pointer-following tilt, like turning a print to the light.
 *  Desktop only (caller checks the tier). Returns a disposer. */
export function pointerTilt(host:HTMLElement|null,target:HTMLElement|null,max=4){
 if(!host||!target||!motionAllowed())return;
 const tilt=createAnimatable(target,{rotateX:{unit:'deg'},rotateY:{unit:'deg'},duration:duration.normal,ease:ease.shutter});
 const move=(e:PointerEvent)=>{const r=host.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;tilt.rotateY(x*max*2);tilt.rotateX(-y*max*2)};
 const leave=()=>{tilt.rotateX(0);tilt.rotateY(0)};
 host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 return()=>{host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);tilt.revert()};
}

/** Metaphor: focus — one photograph split into planes by masks of the SAME image (façade, entrance,
 *  gallery window); each plane shifts a few pixels against the pointer (data-depth = max px).
 *  No geometry is invented; desktop only (caller checks the tier). Returns a disposer. */
export function storefrontDepth(host:HTMLElement|null,planes:HTMLElement[]){
 if(!host||!planes.length||!motionAllowed())return;
 const movers=planes.map(p=>({depth:Number(p.dataset.depth||0),a:createAnimatable(p,{translateX:{unit:'px'},translateY:{unit:'px'},duration:420,ease:ease.shutter})}));
 const move=(e:PointerEvent)=>{const r=host.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;movers.forEach(m=>{m.a.translateX(-x*2*m.depth);m.a.translateY(-y*2*m.depth)})};
 const leave=()=>movers.forEach(m=>{m.a.translateX(0);m.a.translateY(0)});
 host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 return()=>{host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);movers.forEach(m=>m.a.revert())};
}
