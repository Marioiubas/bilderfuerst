"use client";
// Digitization motion (/digitalisierung). Language: scanner light — linear, even, cyan.
// Every function names its photographic metaphor, respects the tier and returns something
// revertible. Reduced motion: nothing runs; components already render the final state.
import {animate} from 'animejs/animation';
import {createTimeline} from 'animejs/timeline';
import {set,stagger as staggerFn} from 'animejs/utils';
import {duration,ease,stagger,type Metaphor} from './tokens';
import {motionAllowed} from './reduced-motion';
import {onceVisible,type Tier} from './setup';

type Revertible={revert:()=>unknown};
/** Inventory: which photographic metaphor each export performs. */
export const metaphors:Record<string,Metaphor>={heroScanPass:'scan-pass',tileScan:'scan-pass',panelLock:'frame-lock',iceScanPass:'scan-pass',processAdvance:'film-advance'};
const moving=(tier:Tier)=>tier!=='static'&&motionAllowed();

/** Metaphor: scan-pass. One cyan light bar travels once down the real slide photo in the
 *  hero, like the lamp of a flatbed under a mounted slide. Additive (the bar starts
 *  invisible), so the photograph itself is never hidden. Desktop + tablet only. */
export function heroScanPass(bar:HTMLElement|null,tier:Tier):Revertible|undefined{
 if(!bar||!moving(tier)||tier==='mobile')return;
 const travel=bar.parentElement?.clientHeight??0;if(!travel)return;
 const pass=tier==='desktop'?2200:1600;
 return createTimeline({delay:500,defaults:{ease:ease.linear}})
  .add(bar,{opacity:[0,1],duration:duration.fast},0)
  .add(bar,{translateY:[0,travel],duration:pass},0)
  .add(bar,{opacity:[1,0],duration:duration.normal},pass-duration.normal);
}

/** Metaphor: scan-pass. Selecting an object tile sends a thin scan line across it once. */
export function tileScan(tile:HTMLElement|null):Revertible|undefined{
 const line=tile?.querySelector<HTMLElement>('.dz-tile-scan');
 if(!tile||!line||!motionAllowed())return;
 return createTimeline({defaults:{ease:ease.linear}})
  .add(line,{opacity:[0,1],duration:80},0)
  .add(line,{translateX:[0,tile.clientWidth],duration:duration.normal+120},0)
  .add(line,{opacity:[1,0],duration:120},duration.normal);
}

/** Metaphor: frame-lock. The detail panel's columns register into place after a change
 *  (short travel, decisive shutter stop). Only on user change, never on first paint. */
export function panelLock(panel:HTMLElement|null):Revertible|undefined{
 if(!panel||!motionAllowed())return;
 const parts=panel.querySelectorAll('[data-lock]');if(!parts.length)return;
 return animate(parts,{opacity:[.3,1],translateY:[6,0],duration:duration.fast+60,delay:staggerFn(stagger.small),ease:ease.shutter});
}

export type ScanPhase='pending'|'scan'|'settle'|'ready';
export type ScanController={stop:()=>number;revert:()=>void};
/** Metaphor: scan-pass, then focus. The real ICE pair: a progress value travels 0 → 100 %
 *  at constant speed (linear light travel) — the component maps it to the cyan line
 *  position, the clip-path of the ICE5 scan and the mono "SCAN 0–100 %" readout — then
 *  settles optically to 50 % and hands control to the Compare slider. */
export function iceScanPass(tier:Tier,onProgress:(value:number,phase:ScanPhase)=>void,onDone:()=>void):ScanController|undefined{
 if(!moving(tier)||tier==='mobile')return;
 const pass=tier==='desktop'?2600:1800,hold=280;
 const state={p:0};
 const tl=createTimeline({
  onUpdate:self=>onProgress(state.p,self.currentTime<pass+hold?'scan':'settle'),
  onComplete:()=>onDone(),
 })
  .add(state,{p:[0,100],duration:pass,ease:ease.linear},0)
  .add(state,{p:[100,50],duration:duration.section+120,ease:ease.optical},pass+hold);
 return{stop:()=>{tl.pause();return state.p},revert:()=>{tl.pause()}};
}

/** Metaphor: film-advance. Process stations advance into place one frame at a time when
 *  the strip enters the viewport. Desktop + tablet only. */
export function processAdvance(strip:HTMLElement|null,tier:Tier,onPlayed?:()=>void):(()=>void)|undefined{
 if(!strip||!moving(tier)||tier==='mobile')return;
 const items=strip.querySelectorAll<HTMLElement>('[data-advance]');if(!items.length)return;
 // Clip instead of fading so the text never sits at low contrast before the reveal.
 const initial=set(items,{translateX:-14,clipPath:'inset(0 0 0 100%)'});
 let run:Revertible|undefined;
 const dispose=onceVisible(strip,()=>{onPlayed?.();run=animate(items,{clipPath:'inset(0 0 0 0%)',translateX:0,duration:duration.section,delay:staggerFn(stagger.normal*2),ease:ease.advance})},.25);
 return()=>{dispose();run?.revert();initial.revert()};
}
