"use client";
// Street Gallery motion (/galerie). Anime.js only; every function names its photographic metaphor.
// Reduced motion: callers skip the spread and the 3D scene entirely; the aperture becomes a 120 ms fade.
import {animate} from 'animejs/animation';
import {createLayout} from 'animejs/layout';
import {stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger,type Metaphor} from './tokens';
import {motionAllowed} from './reduced-motion';

export type Revertible={revert:()=>void};
const none:Revertible={revert(){}};

/* ───────── Contact sheet → street gallery ───────── */

export const SPREAD_METAPHOR:Metaphor[]=['contact-sheet','frame-lock'];

/**
 * Metaphor: contact-sheet → frame-lock. The wall starts as a tight contact sheet (small frames, thin
 * black rebate, mono frame numbers on a dark sheet). On entering the viewport the frames separate
 * and lock into black gallery frames with white mats (FLIP via Anime createLayout; frame border,
 * mat padding and mat colour are interpolated by the layout timeline). Captions arrive after the lock.
 * `root` is the <ol data-state="sheet"> list of `.gal-print` items.
 */
export function spreadContactSheet(root:HTMLElement,{onDone}:{onDone?:()=>void}={}):Revertible{
 const reveal=[...root.querySelectorAll<HTMLElement>('[data-sheet-reveal]')];
 const finish=()=>{root.dataset.state='framed';delete root.dataset.moving;for(const el of reveal)el.style.opacity='';onDone?.()};
 if(!motionAllowed()){finish();return none}
 let fade:ReturnType<typeof animate>|undefined;let finished=false;
 // Every box between the list item and the photograph is a layout target, so the print scales
 // continuously; only the caption text cross-fades (Anime's default swap).
 const layout=createLayout(root,{children:['.gal-print','.gal-print-inner','.gal-print-frame','.gal-print-photo','.gal-print-photo img'],properties:['padding','boxShadow','borderWidth']});
 const timeline=layout.update(()=>{root.dataset.state='framed';root.dataset.moving='true';for(const el of reveal)el.style.opacity='0'},{
  duration:duration.section+180,
  delay:staggerFn(stagger.small),
  ease:ease.optical,
  onComplete:()=>{
   fade=animate(reveal,{opacity:[0,1],duration:duration.normal,delay:staggerFn(stagger.small),ease:ease.shutter,onComplete:()=>{finished=true;finish()}});
  },
 });
 return{revert(){if(finished)return;timeline.pause();layout.revert();fade?.pause();finish()}};
}

/* ───────── Aperture (lightbox only) ───────── */

const BLADES=7;
type Iris={svg:SVGSVGElement;mask:SVGPathElement;edges:SVGPathElement;w:number;h:number};

function measureIris(svg:SVGSVGElement):Iris|null{
 const mask=svg.querySelector<SVGPathElement>('[data-iris=mask]');const edges=svg.querySelector<SVGPathElement>('[data-iris=edges]');
 const box=svg.getBoundingClientRect();if(!mask||!edges||!box.width||!box.height)return null;
 svg.setAttribute('viewBox',`0 0 ${box.width.toFixed(1)} ${box.height.toFixed(1)}`);
 return{svg,mask,edges,w:box.width,h:box.height};
}

/** Draw the iris at opening k (0 closed … 1 fully open beyond the print's corners). */
function drawIris({mask,edges,w,h}:Iris,k:number){
 const cx=w/2,cy=h/2;const R=Math.hypot(w,h)/2/Math.cos(Math.PI/BLADES)+2;
 const r=R*k;const turn=(1-k)*-.95;const pts:Array<[number,number]>=[];
 for(let i=0;i<BLADES;i++){const a=turn+i*2*Math.PI/BLADES-Math.PI/2;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}
 const f=(n:number)=>n.toFixed(1);
 mask.setAttribute('d',`M0 0H${f(w)}V${f(h)}H0Z M${pts.map(([x,y])=>`${f(x)} ${f(y)}`).join(' L')}Z`);
 // Each blade edge is one side of the polygon, continued past its end vertex (straight blade edges).
 const L=R*1.4;let d='';
 for(let i=0;i<BLADES;i++){const [x1,y1]=pts[i];const [x2,y2]=pts[(i+1)%BLADES];const dx=x2-x1,dy=y2-y1;const len=Math.hypot(dx,dy);if(len<.5)continue;d+=`M${f(x1)} ${f(y1)}L${f(x2+dx/len*L)} ${f(y2+dy/len*L)}`}
 edges.setAttribute('d',d);
}

/**
 * Metaphor: aperture. Seven blades open over the print (≤ 300 ms, ease.optical), rotating as they
 * widen like a lens iris. No flash, no sound. Reduced motion: the print fades in over 120 ms.
 */
export function apertureOpen(svg:SVGSVGElement|null,image:HTMLElement|null,{fast=false}:{fast?:boolean}={}):Revertible{
 if(!svg)return none;
 if(!motionAllowed()){
  svg.style.visibility='hidden';
  if(!image)return none;
  const fadeIn=animate(image,{opacity:[0,1],duration:120,ease:'linear'});
  return{revert(){fadeIn.pause();image.style.opacity=''}};
 }
 const iris=measureIris(svg);if(!iris){svg.style.visibility='hidden';return none}
 const state={k:0};drawIris(iris,0);svg.style.visibility='visible';
 const anim=animate(state,{k:1,duration:fast?220:280,ease:ease.optical,onUpdate:()=>drawIris(iris,state.k),onComplete:()=>{svg.style.visibility='hidden'}});
 return{revert(){anim.pause();svg.style.visibility='hidden'}};
}

/** Holds the iris closed (visible) while the print loads, so the opening never reveals an empty stage. */
export function apertureHold(svg:SVGSVGElement|null,image:HTMLElement|null){
 if(!svg)return;
 if(!motionAllowed()){svg.style.visibility='hidden';if(image)image.style.opacity='0';return}
 const iris=measureIris(svg);if(!iris)return;drawIris(iris,0);svg.style.visibility='visible';
}

/** Metaphor: aperture (closing). Blades close quickly (160 ms, ease.shutter), then `done` runs. */
export function apertureClose(svg:SVGSVGElement|null,done:()=>void):Revertible{
 const iris=svg&&motionAllowed()?measureIris(svg):null;
 if(!iris){done();return none}
 const state={k:1};drawIris(iris,1);iris.svg.style.visibility='visible';
 let called=false;const finish=()=>{if(!called){called=true;done()}};
 const anim=animate(state,{k:0,duration:160,ease:ease.shutter,onUpdate:()=>drawIris(iris,state.k),onComplete:finish});
 return{revert(){anim.pause();finish()}};
}

/* ───────── 3D window lights ───────── */

/**
 * Metaphor: expose. The window's gallery lights come up the way an image builds on paper:
 * a single 820 ms optical ramp of `level.k` from 0 to 1; `onUpdate` re-renders the scene on demand.
 */
export function exposeLights(level:{k:number},onUpdate:()=>void):Revertible{
 const anim=animate(level,{k:[0,1],duration:duration.hero,delay:120,ease:ease.optical,onUpdate});
 return{revert(){anim.pause();level.k=1;onUpdate()}};
}
