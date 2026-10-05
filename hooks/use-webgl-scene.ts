"use client";
// Lifecycle for an optional WebGL scene layered over a static, art-directed fallback.
// - client only, dynamic import, desktop tier by default
// - pauses offscreen / hidden tab, destroys on unmount, reduced motion or tier loss
// - respects the per-page context budget; any error leaves the fallback visible
import {useEffect,useRef,useState,type RefObject} from 'react';
import {motionTier,type Tier} from '@/motion/setup';
import {acquireContext,releaseContext,webglAvailable} from '@/lib/webgl';

export type SceneHandle={destroy:()=>void;pause?:()=>void;resume?:()=>void};
export type SceneMount=(host:HTMLElement,ctx:{tier:Tier;signal:AbortSignal})=>Promise<SceneHandle>;
export type SceneState='static'|'loading'|'active'|'failed';

export function useWebGLScene(ref:RefObject<HTMLElement|null>,load:()=>Promise<SceneMount>,opts:{id:string;minTier?:'desktop'|'tablet';threshold?:number}){
 const [state,setState]=useState<SceneState>('static');
 const loadRef=useRef(load);loadRef.current=load;
 const {id,minTier='desktop',threshold=0}=opts;
 useEffect(()=>{
  const host=ref.current;if(!host)return;
  let scene:SceneHandle|null=null;let controller:AbortController|null=null;let visible=false;let disposed=false;
  const set=(next:SceneState)=>{host.dataset.webgl=next;setState(next)};
  const allowed=()=>{const tier=motionTier();return tier==='desktop'||(minTier==='tablet'&&tier==='tablet')};
  const teardown=(next:SceneState='static')=>{controller?.abort();controller=null;if(scene){try{scene.destroy()}catch{/* renderer already gone */}scene=null}releaseContext(id);if(!disposed)set(next)};
  const sync=async()=>{
   if(disposed)return;
   if(!allowed()){teardown();return}
   if(scene){if(visible&&!document.hidden)scene.resume?.();else scene.pause?.();return}
   if(!visible||document.hidden||controller)return;
   if(!webglAvailable()||!acquireContext(id)){set('static');return}
   controller=new AbortController();const signal=controller.signal;set('loading');
   try{
    const mount=await loadRef.current();if(signal.aborted)return;
    const handle=await mount(host,{tier:motionTier(),signal});
    if(signal.aborted||disposed){handle.destroy();return}
    scene=handle;controller=null;set('active');
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
