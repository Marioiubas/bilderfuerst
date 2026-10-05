"use client";
// Commerce motion is fast and quiet: drawers, sheets, overlays. Trust over entertainment.
import {animate} from 'animejs/animation';
import {stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger} from './tokens';
import {motionAllowed} from './reduced-motion';

export type SheetKind='drawer'|'overlay'|'sheet'|'lightbox'|'full'|'default';

/** Metaphor: shutter — a short, decisive opening. */
export function openSheet(element:HTMLDialogElement,kind:SheetKind='default'){
 if(!motionAllowed())return;
 const from:Record<string,number[]>=kind==='drawer'?{translateX:[28,0]}:kind==='sheet'?{translateY:[36,0]}:kind==='overlay'?{translateY:[-12,0]}:kind==='lightbox'?{scale:[.985,1]}:{translateY:[8,0]};
 const panel=animate(element,{opacity:[.4,1],...from,duration:duration.fast+40,ease:ease.shutter});
 const rows=element.querySelectorAll('[data-stagger]');
 const list=rows.length?animate(rows,{opacity:[0,1],translateY:[6,0],duration:duration.fast,delay:staggerFn(stagger.small,{start:60}),ease:ease.shutter}):undefined;
 return{revert(){panel.revert();list?.revert()}};
}
