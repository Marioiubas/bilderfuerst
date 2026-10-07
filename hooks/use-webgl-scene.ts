"use client";
// Lifecycle for an optional WebGL scene layered over a static, art-directed fallback.
// - client only, dynamic import; desktop by default — `minTier:'tablet'|'mobile'` also admits tablets/phones that
//   pass mobileWebGLCapable(); those mount with the "lite" profile (docs/MOBILE-3D-PLAN.md §6.2)
// - touch/lite devices wait for the first engagement and then for a quiet moment (no fling) before any GPU work
// - 'active' only once the scene reports its first presented frame (ctx.onReady), so intros are never swallowed
// - context loss → static art, then one remount when visible again; a second loss → 'failed'
// - frame guard gave up (ctx.onGiveUp) → static for this page view, the DOM animations take over
// - pauses offscreen / hidden tab, destroys on unmount, reduced motion or tier loss
// - respects the per-page context budget; any error leaves the fallback visible
import {useEffect,useRef,useState,type RefObject} from 'react';
import {motionTier,type Tier} from '@/motion/setup';
import {acquireContext,mobileWebGLCapable,releaseContext,webglAvailable,whenEngaged,whenIdle} from '@/lib/webgl';

export type SceneProfile='full'|'lite';
export type SceneHandle={destroy:()=>void;pause?:()=>void;resume?:()=>void};
export type SceneContext={
 tier:Tier;signal:AbortSignal;
 /** 'full' on desktop, 'lite' on tablets and phones (smaller assets, no shadow map, capped DPR, frame guard). */
 profile:SceneProfile;
 /** First frame rendered and presented: the hook switches to 'active' (canvas fades in); start intros after this. */
 onReady:()=>void;
 /** webglcontextlost: the hook tears the scene down to the static art and remounts once. */
 onLost:()=>void;
 /** The frame guard gave up (after the running animation finished): static art + DOM animations from now on. */
 onGiveUp:()=>void;
};
export type SceneMount=(host:HTMLElement,ctx:SceneContext)=>Promise<SceneHandle>;
export type SceneState='static'|'loading'|'active'|'failed';

export function useWebGLScene(ref:RefObject<HTMLElement|null>,load:()=>Promise<SceneMount>,opts:{id:string;minTier?:'desktop'|'tablet'|'mobile';threshold?:number}){
 const [state,setState]=useState<SceneState>('static');
 const loadRef=useRef(load);loadRef.current=load;
 const {id,minTier='desktop',threshold=0}=opts;
 useEffect(()=>{
  const host=ref.current;if(!host)return;
  let scene:SceneHandle|null=null;let controller:AbortController|null=null;let visible=false;let disposed=false;
  let losses=0;let blocked:SceneState|null=null;
  const set=(next:SceneState)=>{host.dataset.webgl=next;setState(next)};
  const allowed=()=>{
   if(blocked)return false;
   const tier=motionTier();
   if(tier==='desktop')return true;
   if(tier==='tablet')return minTier!=='desktop'&&mobileWebGLCapable();
   return tier==='mobile'&&minTier==='mobile'&&mobileWebGLCapable();
  };
  const teardown=(next:SceneState='static')=>{controller?.abort();controller=null;if(scene){try{scene.destroy()}catch{/* renderer already gone */}scene=null}releaseContext(id);if(!disposed)set(next)};
  const sync=async()=>{
   if(disposed)return;
   if(!allowed()){teardown(blocked??'static');return}
   if(scene){if(visible&&!document.hidden)scene.resume?.();else scene.pause?.();return}
   if(!visible||document.hidden||controller)return;
   const lite=motionTier()!=='desktop';
   await whenEngaged();
   if(lite)await whenIdle(1500);
   if(disposed||scene||controller||!visible||document.hidden||!allowed())return;
   if(!webglAvailable()||!acquireContext(id)){set('static');return}
   controller=new AbortController();const signal=controller.signal;set('loading');
   let ready=false;
   const markReady=()=>{if(signal.aborted||ready)return;ready=true;set('active')};
   const ctx:SceneContext={tier:motionTier(),signal,profile:lite?'lite':'full',onReady:markReady,
    onLost:()=>{
     if(signal.aborted)return;
     losses++;if(losses>1)blocked='failed';
     teardown(blocked??'static');
     if(!blocked)queueMicrotask(()=>void sync());
    },
    onGiveUp:()=>{if(signal.aborted)return;blocked='static';teardown('static')}};
   try{
    const mount=await loadRef.current();if(signal.aborted)return;
    const handle=await mount(host,ctx);
    if(signal.aborted||disposed){handle.destroy();return}
    scene=handle;controller=null;markReady();
    if(!visible||document.hidden)scene.pause?.();
   }catch(error){
    if(!signal.aborted){console.warn(`[webgl:${id}] falling back to static artwork`,error);teardown('failed')}
   }
  };
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;void sync()},{threshold});io.observe(host);
  const queries=['(prefers-reduced-motion: reduce)','(min-width: 1024px) and (pointer: fine)','(min-width: 768px)'].map(q=>window.matchMedia(q));
  const change=()=>void sync();
  queries.forEach(q=>q.addEventListener('change',change));document.addEventListener('visibilitychange',change);
  return()=>{disposed=true;io.disconnect();queries.forEach(q=>q.removeEventListener('change',change));document.removeEventListener('visibilitychange',change);teardown()};
 },[ref,id,minTier,threshold]);
 return state;
}
