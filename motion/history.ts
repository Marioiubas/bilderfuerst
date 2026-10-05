"use client";
// Story / History motion · "Film roll through time".
// Anime.js v4 owns the frames, the year counter and developing images. The amber beam light itself is
// owned by components/ui/tracing-beam.tsx (Aceternity, motion/react) — one engine per element.
// Coordination: the beam light sits on the viewport centre line (scroll offset "start center"), and
// watchChronicle() activates the frame crossing that same line, so a frame develops as the light arrives.
// Reduced motion: every function is a no-op (final state); the counter swaps text instantly.
import {animate} from 'animejs/animation';
import {createTimeline} from 'animejs/timeline';
import {duration,ease} from './tokens';
import {motionAllowed} from './reduced-motion';

/** Latent image: dark, low contrast, warm, slightly soft (never a blur-up). */
export const LATENT_FILTER='brightness(0.34) contrast(0.62) sepia(0.45) blur(0.6px)';
const FINAL_FILTER='brightness(1) contrast(1) sepia(0) blur(0px)';

/** Metaphor: develop — a print in the developer tray reaches density and contrast. ≤ 600 ms. */
export function developImage(img:HTMLElement,delay=0){
 return animate(img,{filter:[LATENT_FILTER,FINAL_FILTER],opacity:[0.5,1],duration:duration.section,delay,ease:ease.optical});
}

/** Develop an image on its first load. Already-decoded (visible) images are left untouched, so there is
 *  never a flash from final → latent. Returns a disposer. */
export function developOnLoad(img:HTMLImageElement|null){
 if(!img||!motionAllowed()||img.complete)return;
 img.style.filter=LATENT_FILTER;img.style.opacity='0.5';
 let anim:ReturnType<typeof animate>|undefined;
 const run=()=>{anim=developImage(img)};
 const fail=()=>{img.style.filter='';img.style.opacity=''};
 img.addEventListener('load',run,{once:true});img.addEventListener('error',fail,{once:true});
 return()=>{img.removeEventListener('load',run);img.removeEventListener('error',fail);anim?.revert();fail()};
}

/** Put every frame that is still below the viewport (not yet seen, not yet lit) into its latent state.
 *  Frames already on screen stay final, so arming never causes a visible flash. CSS ([data-develop=latent])
 *  draws the latent look; nothing is armed without JS or with reduced motion. */
export function armFrames(frames:HTMLElement[]){
 if(!motionAllowed())return()=>{};
 const line=window.innerHeight;
 const armed=frames.filter(f=>f.getBoundingClientRect().top>line);
 armed.forEach(f=>{f.dataset.develop='latent'});
 return()=>armed.forEach(f=>{delete f.dataset.develop;delete f.dataset.run});
}

/** Metaphor: develop + frame-lock — the light reaches a frame: a brief amber edge (frame lock), edge print
 *  exposes, text and image come up from latent density. 580 ms total. The latent attribute stays on during
 *  the run (inline values win) and flips to "done" on completion. */
export function developFrame(frame:HTMLElement){
 if(frame.dataset.develop!=='latent'||frame.dataset.run||!motionAllowed())return;
 frame.dataset.run='1';
 const tl=createTimeline({defaults:{ease:ease.optical},onComplete:()=>{delete frame.dataset.run;frame.dataset.develop='done'}});
 tl.add(frame,{boxShadow:['inset 0 0 0 1px rgba(227,161,60,0.8)','inset 0 0 0 1px rgba(227,161,60,0)'],duration:duration.section},0);
 const edges=frame.querySelectorAll<HTMLElement>('.hist-edge');
 if(edges.length)tl.add(edges,{opacity:[0.28,1],duration:duration.normal,ease:ease.shutter},0);
 const body=frame.querySelector<HTMLElement>('.hist-frame-body');
 if(body)tl.add(body,{opacity:[0.22,1],duration:480},60);
 const img=frame.querySelector<HTMLElement>('.hist-frame-img img');
 if(img)tl.add(img,{filter:[LATENT_FILTER,FINAL_FILTER],opacity:[0.5,1],duration:500},80);
 return tl;
}

/** Metaphor: film-advance — the next frame number slides into the gate (forward = from below). */
export function advanceCounter(el:HTMLElement|null,direction:1|-1){
 if(!el||!motionAllowed())return;
 return animate(el,{translateY:[`${direction*38}%`,'0%'],opacity:[0,1],duration:duration.normal,ease:ease.advance});
}

/** Report the frame that crosses the viewport centre line (the beam light). Works in every tier. */
export function watchChronicle(frames:HTMLElement[],onActive:(index:number)=>void){
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){const i=frames.indexOf(entry.target as HTMLElement);if(i>=0)onActive(i)}
 },{rootMargin:'-49% 0px -50% 0px',threshold:0});
 frames.forEach(f=>io.observe(f));
 return()=>io.disconnect();
}
