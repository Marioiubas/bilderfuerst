"use client";
// Home hero motion (Anime.js v4, modular). Every function names its photographic metaphor.
// Rules: copy is complete at first paint — animations start from visible states
// (opacity ≥ .4, small translations); reduced motion = final state instantly.
// The SSR start state is held by CSS `.hero[data-intro=pending]` (app/styles/hero.css),
// which must mirror the `from` values used here.
import {createTimeline} from 'animejs/timeline';
import {animate} from 'animejs/animation';
import {stagger as staggerBy} from 'animejs/utils';
import {duration,ease,stagger,type Metaphor} from './tokens';
import type {Tier} from './setup';

export type Revertible={revert:()=>unknown};

/** Start offsets (ms) per `[data-intro-step]` in document order:
 *  metadata · headline · headline emphasis · subcopy · positioning · primary CTA · secondary CTA · text link. */
const STEP_AT=[80,140,210,300,330,360,430,470] as const;
/** Metaphor per hero motion (documentation + type check against the shared vocabulary). */
export const HERO_METAPHORS:Record<'copy'|'drawing'|'table'|'strip'|'frames'|'sheet'|'pencil',Metaphor>={copy:'frame-lock',drawing:'expose',table:'expose',strip:'film-advance',frames:'develop',sheet:'contact-sheet',pencil:'frame-lock'};
export const INTRO_RISE={copy:14,headline:22,mobile:8,film:26} as const;

/**
 * Hero entrance.
 * Metaphors: `frame-lock` (copy lines lock into register like a frame into the gate),
 * `expose` (cartridge drawing and light table are written by light),
 * `film-advance` (the negative strip is pulled out of the cartridge),
 * `develop` (photographs resolve from a warm latent veil, never a blur-up).
 */
export function playHeroIntro(root:HTMLElement,tier:Tier):Revertible|undefined{
 if(tier==='static'){root.dataset.intro='done';return}
 root.dataset.intro='pending';
 const all=(selector:string)=>Array.from(root.querySelectorAll<HTMLElement>(selector));
 const small=tier==='mobile';
 const tl=createTimeline({defaults:{ease:ease.shutter,duration:duration.section},onComplete:()=>{root.dataset.intro='done'}});
 all('[data-intro-step]').forEach((el,i)=>{
  const headline=i===1||i===2;
  const rise=small?INTRO_RISE.mobile:headline?INTRO_RISE.headline:INTRO_RISE.copy;
  // Links and buttons keep full opacity from the first frame (audit O11): only the frame-lock slide.
  const interactive=el.matches('a,button,.btn');
  const props:Record<string,number[]>=interactive?{translateY:[rise,0]}:{opacity:[.4,1],translateY:[rise,0]};
  tl.add(el,{...props,duration:headline?duration.hero:duration.section,ease:headline?ease.advance:ease.shutter},STEP_AT[i]??STEP_AT[STEP_AT.length-1]);
 });
 const film=root.querySelector<HTMLElement>('.hero-film');
 // When the WebGL scene already owns the workspace, the DOM film is hidden: skip its choreography.
 if(film&&root.querySelector('[data-webgl=active]')==null){
  const table=film.querySelector('.hero-table');
  if(table)tl.add(table,{opacity:[.6,1],duration:duration.section,ease:ease.optical},400);
  const lines=all('.hero-cartridge .hc-line path:not(.hc-hidden), .hero-cartridge .hc-line ellipse, .hero-cartridge .hc-lip path:first-child');
  if(lines.length&&!small)tl.add(lines,{strokeDashoffset:[.62,0],duration:duration.hero,ease:ease.optical,delay:staggerBy(stagger.small)},460);
  const advance=[film.querySelector('.hero-strip'),...all('.hero-frame')].filter(Boolean) as HTMLElement[];
  tl.add(advance,{translateX:[small?-INTRO_RISE.mobile*2:-INTRO_RISE.film,0],duration:duration.hero,ease:ease.advance},small?420:520);
  const veils=all('.hero-frame-latent');
  if(veils.length)tl.add(veils,{opacity:[.6,0],duration:duration.section,ease:ease.optical,delay:staggerBy(Math.round(300/Math.max(1,veils.length-1)))},500);
 }
 return tl;
}

export type FrameRect={cx:number;cy:number;w:number;r:number};

/** Visual geometry of each frame relative to the stage (includes in-flight transforms). */
export function measureFrames(film:HTMLElement):FrameRect[]{
 const stage=film.querySelector<HTMLElement>('.hero-stage')??film;const origin=stage.getBoundingClientRect();
 return Array.from(film.querySelectorAll<HTMLElement>('.hero-frame')).map(el=>{
  const box=el.getBoundingClientRect();const body=el.firstElementChild as HTMLElement|null;
  const base=body?parseFloat(getComputedStyle(body).rotate)||0:0;
  const extra=body?parseFloat(/rotate\((-?[\d.]+)deg\)/.exec(body.style.transform)?.[1]??'0'):0;
  return {cx:box.left-origin.left+box.width/2,cy:box.top-origin.top+box.height/2,w:box.width,r:base+extra};
 });
}

/**
 * Strip ⇄ contact sheet (DOM). Measured transforms (FLIP): the new layout is already
 * committed; each frame travels back from its previous visual pose.
 * Metaphor: `contact-sheet` — frames are lifted off the negative and laid out in rows;
 * the red grease pencil marks the selected frame once the sheet is complete (`frame-lock`).
 * Mobile: short fade only. Reduced motion: instant (no call needed).
 */
export function playContactSheet(film:HTMLElement,before:FrameRect[],toSheet:boolean,tier:Tier):Revertible|undefined{
 if(tier==='static')return;
 const frames=Array.from(film.querySelectorAll<HTMLElement>('.hero-frame'));
 if(tier==='mobile')return animate(frames,{opacity:[.45,1],duration:duration.normal,ease:ease.shutter});
 const after=measureFrames(film);
 const travel=tier==='desktop'?duration.hero:duration.section;
 const tl=createTimeline({defaults:{duration:travel,ease:ease.optical}});
 frames.forEach((el,i)=>{
  const b=before[i],a=after[i];if(!b||!a||!a.w)return;
  // sheet: left-to-right, row by row; back to strip: reverse order so the strip refills from the cartridge.
  const at=(toSheet?i:frames.length-1-i)*stagger.normal;
  tl.add(el,{translateX:[b.cx-a.cx,0],translateY:[b.cy-a.cy,0],scale:[b.w/a.w,1]},at);
  const body=el.firstElementChild as HTMLElement|null;
  if(body&&Math.abs(b.r-a.r)>.01)tl.add(body,{rotate:[b.r-a.r,0]},at);
 });
 const pencil=film.querySelector<SVGPathElement>('.hero-grease path');
 if(toSheet&&pencil){pencil.style.strokeDashoffset='1';tl.add(pencil,{strokeDashoffset:[1,0],duration:duration.section,ease:ease.shutter},travel+frames.length*stagger.normal-120)}
 return tl;
}
