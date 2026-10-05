"use client";
// Commerce result motion (owned by the commerce stream). Quiet, fast, never on more than
// the first visible set of cards. Reduced motion: every function is a no-op (final state).
import {animate} from 'animejs/animation';
import {stagger as staggerFn,set} from 'animejs/utils';
import {duration,ease,stagger} from './tokens';
import {motionAllowed} from './reduced-motion';

const MAX_ANIMATED=8;

/** Cards whose box intersects the viewport, capped at MAX_ANIMATED. */
export function visibleItems(container:HTMLElement,selector='[data-result]'){
 const vh=window.innerHeight;const out:HTMLElement[]=[];
 for(const el of Array.from(container.querySelectorAll<HTMLElement>(selector))){
  const r=el.getBoundingClientRect();
  if(r.bottom>0&&r.top<vh&&r.width>0)out.push(el);
  if(out.length>=MAX_ANIMATED||r.top>vh)break;
 }
 return out;
}

/** Metaphor: expose — the old print is pulled back before the next exposure (1 → .15).
 *  Calls `done` when the dim finishes (or immediately when motion is not allowed). */
export function dimResults(container:HTMLElement|null,done:()=>void){
 if(!container||!motionAllowed()||document.hidden){done();return}
 const items=visibleItems(container);
 if(!items.length){done();return}
 const ms=Math.round(duration.fast*.5);
 let finished=false;const finish=()=>{if(finished)return;finished=true;window.clearTimeout(guard);done()};
 const a=animate(items,{opacity:.15,duration:ms,ease:ease.shutter,onComplete:finish});
 // Results must never wait on a frame loop (background tab, throttled rAF): hard deadline.
 const guard=window.setTimeout(finish,ms+80);
 return{revert(){a.revert()},cancel(){finished=true;window.clearTimeout(guard);a.pause();a.revert()}};
}

/** Metaphor: develop — the first visible frames of the new set come up from the developer
 *  (opacity 0 → 1, y 6 → 0, 25 ms stagger). Only the first viewport set (≤ 8 cards). */
export function revealResults(container:HTMLElement|null){
 if(!container||!motionAllowed()||document.hidden)return;
 const items=visibleItems(container);if(!items.length)return;
 set(items,{opacity:0,translateY:6});
 const a=animate(items,{opacity:[0,1],translateY:[6,0],duration:duration.fast,delay:staggerFn(stagger.small),ease:ease.shutter});
 return{revert(){a.revert()}};
}

/** Clears inline opacity left by an interrupted dim on every result. */
export function clearResultStyles(container:HTMLElement|null){
 if(!container)return;
 for(const el of Array.from(container.querySelectorAll<HTMLElement>('[data-result]'))){el.style.removeProperty('opacity');el.style.removeProperty('transform')}
}
