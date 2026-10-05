"use client";
// Shared WebGL policy. Budget: at most two live contexts per page (e.g. Vanta atmosphere +
// one object scene). Commerce routes never acquire one. All scenes render on demand.
import type * as THREE from 'three';

export const MAX_CONTEXTS=2;
const active=new Set<string>();

export function webglAvailable(){
 try{const c=document.createElement('canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');const ok=!!gl;(gl as WebGLRenderingContext|null)?.getExtension('WEBGL_lose_context')?.loseContext();return ok}catch{return false}
}
let engaged:Promise<void>|null=null;
/** Resolves on the visitor's first pointer move, touch, wheel, key press or scroll, or after
 *  `timeout` ms. WebGL layers wait for it so the static art paints and the page becomes
 *  interactive before any GPU/shader setup runs on the main thread. */
export function whenEngaged(timeout=6000){
 if(engaged)return engaged;
 engaged=new Promise<void>(resolve=>{
  const events=['pointermove','pointerdown','touchstart','wheel','keydown','scroll'] as const;
  let timer=0;
  const done=()=>{events.forEach(e=>window.removeEventListener(e,done,true));window.clearTimeout(timer);resolve()};
  events.forEach(e=>window.addEventListener(e,done,{capture:true,passive:true}));
  timer=window.setTimeout(done,timeout);
 });
 return engaged;
}
export function acquireContext(id:string){if(active.has(id))return true;if(active.size>=MAX_CONTEXTS)return false;active.add(id);return true}
export function releaseContext(id:string){active.delete(id)}
export function liveContexts(){return active.size}

/** Device-pixel-ratio cap: lower on tablets, never above 1.5. */
export function cappedDpr(tier:'desktop'|'tablet'|'mobile'|'static'='desktop'){
 const max=tier==='desktop'?1.5:1;return Math.min(window.devicePixelRatio||1,max);
}

/** Dispose geometries, materials and textures below `root`. */
export function disposeTree(root:THREE.Object3D){
 root.traverse(object=>{
  const mesh=object as THREE.Mesh;
  if(mesh.geometry)mesh.geometry.dispose();
  const materials=mesh.material?(Array.isArray(mesh.material)?mesh.material:[mesh.material]):[];
  for(const material of materials){
   for(const value of Object.values(material)){if(value&&typeof value==='object'&&'isTexture' in value)(value as THREE.Texture).dispose()}
   material.dispose();
  }
 });
}

/** Load an image as a texture with sRGB colour space (real photographs keep their colour). */
export function loadTexture(THREEmod:typeof THREE,src:string,anisotropy=4){
 return new Promise<THREE.Texture>((resolve,reject)=>{new THREEmod.TextureLoader().load(src,t=>{t.colorSpace=THREEmod.SRGBColorSpace;t.anisotropy=anisotropy;resolve(t)},undefined,reject)});
}
