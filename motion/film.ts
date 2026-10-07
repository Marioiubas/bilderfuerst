"use client";
// Film-development configurator motion (owned by the lab stream).
// Every function names its photographic metaphor. Reduced motion: final state instantly.
// Mobile keeps the film advance (it is the progress indicator) and simple transitions only.
import {animate,type JSAnimation} from 'animejs/animation';
import {stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger,type Metaphor} from './tokens';
import {motionAllowed} from './reduced-motion';

const metaphor=(m:Metaphor)=>m; // documents intent at call sites; no runtime cost

/**
 * Film strip progress (Metaphor: film-advance).
 * The track is a negative strip pulled through a fixed gate. Each completed step advances the
 * strip one frame with the film-advance lever ease; the amber gate readout ticks the edge-print
 * numbers 01 → 01A → 02 while the frame travels. Resizes re-align instantly.
 * Reduced motion: the strip snaps to the frame, the readout shows the final number.
 */
export function createStripController(viewport:HTMLElement,track:HTMLElement,readout:HTMLElement|null){
 metaphor('film-advance');
 let x=0,index=0,anim:JSAnimation|undefined;
 const frames=()=>Array.from(track.querySelectorAll<HTMLElement>('[data-frame]'));
 const gateX=()=>{const g=viewport.querySelector<HTMLElement>('[data-gate]');return g?g.offsetLeft:0};
 const targetFor=(i:number)=>{const f=frames()[i];return f?gateX()-f.offsetLeft:0};
 const label=(nx:number)=>{
  const fs=frames();if(!fs.length)return '';
  const at=gateX()-nx;const lefts=fs.map(f=>f.offsetLeft);const no=(i:number)=>fs[i]?.dataset.no??'';
  if(at<lefts[0]-fs[0].offsetWidth*.5)return '00';
  for(let k=0;k<lefts.length-1;k++){
   if(at<lefts[k+1]){const frac=(at-lefts[k])/(lefts[k+1]-lefts[k]);return frac<.3?no(k):frac<.72?`${no(k)}A`:no(k+1)}
  }
  return no(lefts.length-1);
 };
 // The readout prints "BILD 02" for numbered frames; the summary frame ("Notiz") reads without prefix.
 const apply=(nx:number)=>{x=nx;track.style.transform=`translate3d(${nx.toFixed(2)}px,0,0)`;if(readout){const t=label(nx);readout.textContent=t;readout.dataset.frame=/^\d/.test(t)?'num':'text'}};
 let moving=false;
 const realign=()=>{if(!moving)apply(targetFor(index))};
 const ro=new ResizeObserver(()=>{anim?.cancel();moving=false;apply(targetFor(index))});ro.observe(viewport);
 // Frame geometry can still be transitioning when we measure (e.g. the global reduced-motion rule
 // gives every property a 1 ms transition), so re-align whenever a transition inside the strip ends.
 track.addEventListener('transitionend',realign);
 return{
  goTo(i:number,{instant=false}:{instant?:boolean}={}){
   index=i;const tx=targetFor(i);anim?.cancel();moving=false;
   if(instant||!motionAllowed()||Math.abs(tx-x)<1){apply(tx);return}
   const pitch=frames()[1]&&frames()[0]?Math.abs(frames()[1].offsetLeft-frames()[0].offsetLeft):120;
   const count=Math.max(1,Math.round(Math.abs(tx-x)/pitch));
   const proxy={x};
   moving=true;
   anim=animate(proxy,{x:tx,duration:Math.min(duration.hero,duration.normal+140*(count-1)),ease:ease.advance,onUpdate:()=>apply(proxy.x),onComplete:()=>{moving=false;realign()}});
  },
  /** Re-align without motion, optionally on another frame (format re-draw changes geometry). */
  place(i:number=index){anim?.cancel();moving=false;index=i;apply(targetFor(i))},
  destroy(){anim?.cancel();ro.disconnect();track.removeEventListener('transitionend',realign)},
 };
}

/** Format switch re-draws the strip type (Metaphor: frame-lock). Crossfade ≤ 320 ms. */
export function redrawStrip(list:HTMLElement|null){
 metaphor('frame-lock');
 if(!list||!motionAllowed())return;
 return animate(list,{opacity:[{from:.08,to:1}],duration:duration.normal-40,ease:ease.shutter});
}

/** A step was completed: its frame is exposed, the latent flash fades (Metaphor: expose). */
export function exposeFrame(frame:HTMLElement|null){
 metaphor('expose');
 const flash=frame?.querySelector<HTMLElement>('[data-expose]');
 if(!flash||!motionAllowed())return;
 return animate(flash,{opacity:[{from:.85,to:0}],duration:duration.normal+120,ease:ease.optical});
}

/**
 * Process state visual (Metaphor: develop). Chemistry rises into the tank/racks and the reel or
 * film path re-measures to the new format width. Transform-only, short, no loop.
 */
export function tankTransition(root:SVGSVGElement|null,{processChanged,formatRatio,redrawPath=false}:{processChanged:boolean;formatRatio:number;redrawPath?:boolean}){
 metaphor('develop');
 if(!root||!motionAllowed())return;
 const anims:JSAnimation[]=[];
 if(processChanged){
  const liquid=root.querySelectorAll('[data-liquid]');
  if(liquid.length)anims.push(animate(liquid,{scaleY:[{from:0,to:1}],duration:duration.section-120,delay:staggerFn(stagger.normal),ease:ease.optical}));
  const mode=root.querySelector('[data-mode]');
  if(mode)anims.push(animate(mode,{opacity:[{from:.2,to:1}],duration:duration.normal,ease:ease.shutter}));
 }
 if(processChanged||redrawPath){
  const path=root.querySelectorAll('[data-draw]');
  if(path.length)anims.push(animate(path,{strokeDashoffset:[{from:1,to:0}],duration:duration.section,ease:ease.advance}));
 }
 if(Math.abs(formatRatio-1)>.01){
  const reel=root.querySelectorAll('[data-reel]');
  if(reel.length)anims.push(animate(reel,{scaleX:[{from:formatRatio,to:1}],duration:duration.normal,ease:ease.shutter}));
 }
 return{revert(){anims.forEach(a=>a.revert())}};
}

/** Developer sample change (Metaphor: develop): low-contrast warm latent → final print, ≤ 600 ms. */
export function developSample(img:HTMLElement|null){
 metaphor('develop');
 if(!img||!motionAllowed())return;
 return animate(img,{filter:[{from:'contrast(0.32) brightness(1.32) sepia(0.35)',to:'contrast(1) brightness(1) sepia(0)'}],opacity:[{from:.55,to:1}],duration:560,ease:ease.optical});
}

/** Scan dimension lines draw in like a focus/scan pass along blue technical lines (Metaphor: scan-pass). */
export function drawDimensions(svg:SVGSVGElement|null){
 metaphor('scan-pass');
 if(!svg||!motionAllowed())return;
 const lines=svg.querySelectorAll('[data-dim]');
 if(!lines.length)return;
 return animate(lines,{strokeDashoffset:[{from:1,to:0}],duration:duration.section,delay:staggerFn(stagger.small),ease:ease.linear});
}

/** Total changed: the figure locks into place like a frame counter (Metaphor: frame-lock). */
export function lockFigure(el:HTMLElement|null){
 metaphor('frame-lock');
 if(!el||!motionAllowed())return;
 return animate(el,{translateY:[{from:-5,to:0}],opacity:[{from:.35,to:1}],duration:duration.fast,ease:ease.shutter});
}
