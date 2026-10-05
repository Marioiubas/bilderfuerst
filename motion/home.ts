"use client";
// Home motion · "a journey through the lab" (Direction C). Anime.js owns every custom motion on the homepage.
// Contract for every export:
//  · names its photographic Metaphor (motion/tokens.ts) and is documented with trigger + duration;
//  · returns a disposer (revert everything) or undefined when nothing runs;
//  · prefers-reduced-motion → returns undefined before touching the DOM, so the final static state stays;
//  · latent states are applied by JS just before observing, so SSR / no-JS / reduced motion always show the final image;
//  · reveals run once per page view on every tier (desktop, tablet, mobile); pointer microinteractions only on
//    hover-capable fine pointers. Touch never depends on them.
//  · one motion moment per section; sections are taller than a viewport, so at most one moment plays per viewport.
import {animate} from 'animejs/animation';
import {stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger,type Metaphor} from './tokens';
import {motionAllowed} from './reduced-motion';
import {onceVisible} from './setup';

type Revertible={revert:()=>unknown};
export type Dispose=()=>void;

const finePointer=()=>window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const all=(root:ParentNode,selector:string)=>Array.from(root.querySelectorAll<HTMLElement>(selector));

/** Apply inline latent styles now; revert restores whatever inline value existed before. */
function latent(elements:HTMLElement[],styles:Record<string,string>):Revertible{
 const saved=elements.map(el=>Object.keys(styles).map(prop=>[prop,el.style.getPropertyValue(prop)] as const));
 elements.forEach(el=>{for(const [prop,value] of Object.entries(styles))el.style.setProperty(prop,value)});
 return{revert(){elements.forEach((el,i)=>saved[i].forEach(([prop,value])=>value?el.style.setProperty(prop,value):el.style.removeProperty(prop)))}};
}
/** Remove animated inline values once the final state equals the stylesheet state. */
const clear=(elements:HTMLElement[],...props:string[])=>()=>elements.forEach(el=>props.forEach(p=>el.style.removeProperty(p)));

/** Shared runner: prepare the latent state, play once when `observe` is visible, revert all on dispose. */
function reveal(observe:HTMLElement,metaphor:Metaphor,prepare:()=>Revertible[],play:()=>Revertible[],threshold=.35):Dispose|undefined{
 if(!motionAllowed())return;
 observe.dataset.motion=metaphor;
 // Never ask for a ratio the element can't reach (taller/wider than the viewport), or it would stay latent forever.
 const fit=Math.min(1,innerHeight/Math.max(1,observe.offsetHeight))*Math.min(1,innerWidth/Math.max(1,observe.offsetWidth));
 const prepared=prepare();
 let played:Revertible[]=[];
 const stop=onceVisible(observe,()=>{played=play()},Math.min(threshold,fit*.8));
 return()=>{stop();played.forEach(a=>a.revert());prepared.forEach(a=>a.revert());delete observe.dataset.motion};
}

/* ───────── 00 · IDX router: lab drawers ───────── */

export type DrawerKind='advance'|'tick'|'lock'|'scan'|'emerge';

/**
 * Drawer microinteractions. Trigger: pointerenter (mouse) or keyboard focus on the drawer link.
 * Every variant plays FROM a pre-state INTO the drawer's resting state, so the static symbol is always complete.
 *  · advance — Metaphor film-advance: the strip in the gate moves one frame (320 ms, advance ease).
 *  · tick    — Metaphor film-advance: the frame counter ticks one number (180 ms, shutter ease).
 *  · lock    — Metaphor frame-lock: four biometric guide brackets close in and lock (220 ms, shutter ease).
 *  · scan    — Metaphor scan-pass: one line crosses the mounted slide (520 ms, linear light travel).
 *  · emerge  — Metaphor print-emerge: a sheet slides out of the printer slot (320 ms, shutter ease).
 * Reduced motion: nothing. Touch: nothing (links navigate on tap; symbols are static).
 */
export function drawerMotion(drawer:HTMLElement,kind:DrawerKind):Dispose|undefined{
 if(!motionAllowed())return;
 let current:Revertible[]=[];
 const play=()=>{
  if(kind==='advance'){
   const strip=drawer.querySelector<HTMLElement>('[data-strip]');if(!strip)return;
   const pitch=Number(strip.dataset.pitch||30);
   current=[animate(strip,{translateX:[pitch,0],duration:duration.normal,ease:ease.advance})];
  }else if(kind==='tick'){
   const col=drawer.querySelector<HTMLElement>('[data-odo]');if(!col)return;
   current=[animate(col,{translateY:['0%','-50%'],duration:duration.fast,ease:ease.shutter})];
  }else if(kind==='lock'){
   current=all(drawer,'[data-bracket]').map(b=>animate(b,{translateX:[Number(b.dataset.dx||0)*6,0],translateY:[Number(b.dataset.dy||0)*6,0],opacity:[.25,1],duration:duration.fast+40,ease:ease.shutter}));
  }else if(kind==='scan'){
   const line=drawer.querySelector<HTMLElement>('[data-scan]');const gate=line?.parentElement;if(!line||!gate)return;
   const travel=gate.clientWidth-line.offsetWidth;
   current=[animate(line,{translateX:[-travel,0],duration:520,ease:ease.linear})];
  }else{
   const sheet=drawer.querySelector<HTMLElement>('[data-sheet]');if(!sheet)return;
   current=[animate(sheet,{translateY:['100%','0%'],duration:duration.normal,ease:ease.shutter})];
  }
 };
 const onPointer=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&finePointer())play()};
 const onFocus=()=>{if(drawer.matches(':focus-visible'))play()};
 drawer.addEventListener('pointerenter',onPointer);
 drawer.addEventListener('focus',onFocus);
 return()=>{drawer.removeEventListener('pointerenter',onPointer);drawer.removeEventListener('focus',onFocus);current.forEach(a=>a.revert())};
}

/* ───────── 01 · LTB light table ───────── */

/**
 * Metaphor expose — the light-table lamp switches on under the film boxes; each box reads as the light reaches it.
 * Trigger: table 25 % visible, once. Glow 0.12 → 1 (580 ms, optical); items 0.55 → 1 (320 ms, 55 ms stagger).
 * Hover light (+4 %) and the edge-print line are CSS on inner elements — never on the animated ones.
 */
export function lightTableExpose(table:HTMLElement){
 const glow=all(table,'[data-glow]'),items=all(table,'[data-item]');
 return reveal(table,'expose',
  ()=>[latent(glow,{opacity:'0.12'}),latent(items,{opacity:'0.55'})],
  ()=>[
   animate(glow,{opacity:[.12,1],duration:duration.section,ease:ease.optical,onComplete:clear(glow,'opacity')}),
   animate(items,{opacity:[.55,1],duration:duration.normal,delay:staggerFn(stagger.normal,{start:140}),ease:ease.shutter,onComplete:clear(items,'opacity')}),
  ],.25);
}

/* ───────── 02 · LAB film lab / 07 · ARC archive photographs ───────── */

const LATENT='contrast(0.45) sepia(0.6) brightness(1.16) saturate(0.7)';
const FIXED='contrast(1) sepia(0) brightness(1) saturate(1)';
/**
 * Metaphor develop — each photograph arrives from a warm, low-contrast latent state to the final image (never a blur-up).
 * Trigger: each image 35 % visible, once (images are observed one by one, so on stacked mobile layouts an image never
 * develops off-screen). 600 ms, optical ease. The final state is the untouched photograph (inline filter removed).
 */
export function developImages(root:HTMLElement){
 if(!motionAllowed())return;
 const disposers=all(root,'[data-develop]').map(img=>reveal(img,'develop',
  ()=>[latent([img],{filter:LATENT})],
  ()=>[animate(img,{filter:[LATENT,FIXED],duration:600,ease:ease.optical,onComplete:clear([img],'filter')})]));
 return()=>disposers.forEach(d=>d?.());
}

const NEGATIVE='invert(1) sepia(0.55) contrast(0.85)';
const POSITIVE='invert(0) sepia(0) contrast(1)';
/**
 * Metaphor develop (negative → positive) — the year frames on the archive strip turn from an inverted
 * negative into the positive, frame after frame along the strip, passing through a flat latent grey.
 * Trigger: the strip's visible scroller 35 % in view, once (observing the scroller, not the wider film,
 * so the reveal also fires when the strip overflows on small screens). 560 ms per frame, 160 ms stagger.
 */
export function developStrip(scroller:HTMLElement){
 const frames=all(scroller,'[data-frame]');if(!frames.length)return;
 return reveal(scroller,'develop',
  ()=>[latent(frames,{filter:NEGATIVE})],
  ()=>[animate(frames,{filter:[NEGATIVE,POSITIVE],duration:560,delay:staggerFn(160,{start:80}),ease:ease.optical,onComplete:clear(frames,'filter')})]);
}

/* ───────── 03 · STR analog store ───────── */

/**
 * Metaphor frame-lock — four viewfinder brackets close in on the Pentax 17 and lock, like focus confirmation.
 * Trigger: feature 40 % visible, once. 320 ms, shutter ease. The 3D card and Lens inside keep their own engine.
 */
export function viewfinderLock(frame:HTMLElement){
 const marks=all(frame,'[data-bracket]');if(!marks.length)return;
 return reveal(frame,'frame-lock',
  ()=>[latent(marks,{opacity:'0'})],
  ()=>marks.map(m=>animate(m,{opacity:[0,1],translateX:[Number(m.dataset.dx||0)*18,0],translateY:[Number(m.dataset.dy||0)*18,0],duration:duration.normal,delay:120,ease:ease.shutter,onComplete:clear([m],'opacity','transform')})),.4);
}

/* ───────── 04 · SCN scanner ───────── */

/**
 * Metaphor scan-pass — a single scanner line travels across the slide once; behind it the image is read out
 * at full density (a graphite veil is wiped away in sync). Trigger: frame 45 % visible, once.
 * 1500 ms linear travel, 240 ms line fade. Runs on mobile too. Reduced motion: no line, no veil.
 */
export function scanPass(frame:HTMLElement){
 const line=frame.querySelector<HTMLElement>('[data-scanline]'),veil=frame.querySelector<HTMLElement>('[data-veil]');
 if(!line||!veil)return;
 const travel=1500;
 return reveal(frame,'scan-pass',
  ()=>[latent([veil,line],{opacity:'1'})],
  ()=>{
   const width=frame.clientWidth-line.offsetWidth;
   const fade=animate(line,{opacity:[1,0],duration:240,delay:travel,ease:ease.linear});
   return[
    animate(line,{translateX:[0,width],duration:travel,ease:ease.linear}),
    animate(veil,{clipPath:['inset(0% 0% 0% 0%)','inset(0% 0% 0% 100%)'],duration:travel,ease:ease.linear}),
    fade,
   ];
  },.45);
}

/* ───────── 05 · PRT print room ───────── */

/**
 * Metaphor print-emerge — the three sheets slide out one after another and settle at their stacked offsets.
 * Trigger: stack 40 % visible, once. 580 ms each, 110 ms stagger, shutter ease.
 */
export function printEmerge(stack:HTMLElement){
 const sheets=all(stack,'[data-sheet]');if(!sheets.length)return;
 return reveal(stack,'print-emerge',
  ()=>[latent(sheets,{opacity:'0',transform:'translateY(32px)'})],
  ()=>[animate(sheets,{opacity:[0,1],translateY:[32,0],duration:duration.section,delay:staggerFn(110),ease:ease.shutter,onComplete:()=>{clear(sheets,'opacity')();stack.dataset.settled='true'}})],.4);
}

/**
 * Metaphor print-emerge (hover) — the stack fans out a few millimetres, like lifting the top prints off the pile.
 * Trigger: pointer enter/leave (fine pointers) or focus within. 320 ms, shutter ease. Reduced motion / touch: none.
 */
export function printFan(stack:HTMLElement):Dispose|undefined{
 if(!motionAllowed()||!finePointer())return;
 const sheets=all(stack,'[data-sheet]');
 let open=false;
 // Wait until the print-emerge reveal has settled, so the two never fight over the same transform.
 const set=(next:boolean)=>{if(next===open||(stack.dataset.motion==='print-emerge'&&!stack.dataset.settled))return;open=next;sheets.forEach((s,i)=>animate(s,{translateX:next?i*14:0,translateY:next?-i*8:0,duration:duration.normal,ease:ease.shutter}))};
 const enter=()=>set(true),leave=()=>set(false);
 const focusOut=(e:FocusEvent)=>{if(!stack.contains(e.relatedTarget as Node))leave()};
 stack.addEventListener('pointerenter',enter);stack.addEventListener('pointerleave',leave);
 stack.addEventListener('focusin',enter);stack.addEventListener('focusout',focusOut);
 return()=>{stack.removeEventListener('pointerenter',enter);stack.removeEventListener('pointerleave',leave);stack.removeEventListener('focusin',enter);stack.removeEventListener('focusout',focusOut);sheets.forEach(s=>s.style.removeProperty('transform'))};
}
