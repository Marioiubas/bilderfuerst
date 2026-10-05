"use client";
// Lab page motion (owned by the lab stream). Content is always fully visible without motion;
// these functions only add mechanical emphasis once a block scrolls into view.
import {animate} from 'animejs/animation';
import {stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger} from './tokens';
import {motionAllowed} from './reduced-motion';
import {onceVisible} from './setup';

/**
 * Machine spec cards (Metaphor: frame-lock): the hairline rule above each card draws across and
 * the mono station code locks in, like a frame registering in the gate. Desktop + tablet + mobile.
 * Reduced motion: nothing runs; rules are drawn by CSS.
 */
export function lockSpecFrames(root:HTMLElement|null){
 if(!root||!motionAllowed())return;
 const rules=root.querySelectorAll('[data-rule]');
 if(!rules.length)return;
 return onceVisible(root,()=>{
  const a=animate(rules,{scaleX:[{from:0,to:1}],duration:duration.section,delay:staggerFn(stagger.normal),ease:ease.shutter});
  return()=>{a.revert()};
 },.25);
}

/**
 * Real lab photographs (Metaphor: develop): arrive from a low-contrast warm latent state to the
 * untouched final image (≤ 600 ms), never a blur-up. Desktop/tablet only (caller decides tier).
 */
export function developPhotos(root:HTMLElement|null){
 if(!root||!motionAllowed())return;
 const imgs=Array.from(root.querySelectorAll<HTMLElement>('[data-develop]'));
 const disposers=imgs.map(img=>onceVisible(img,()=>{
  const a=animate(img,{filter:[{from:'contrast(0.4) brightness(1.25) sepia(0.3)',to:'contrast(1) brightness(1) sepia(0)'}],duration:560,ease:ease.optical});
  return()=>{a.revert()};
 },.35));
 return()=>disposers.forEach(d=>d());
}

/**
 * Contact strip on the lab page (Metaphor: film-advance): the strip of real photos advances by a
 * fraction of a frame once, as if the lever was wound. Desktop only (caller decides tier).
 */
export function windStrip(strip:HTMLElement|null){
 if(!strip||!motionAllowed())return;
 return onceVisible(strip,()=>{
  const a=animate(strip,{translateX:[{from:48,to:0}],duration:duration.section+120,ease:ease.advance});
  return()=>{a.revert()};
 },.2);
}
