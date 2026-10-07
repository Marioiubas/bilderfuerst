"use client";
// Shared WebGL policy. Budget: two live contexts per page on desktop (Vanta atmosphere + one object scene), one
// on touch devices and phones. Commerce routes never acquire one. All scenes render on demand.
// Phones/tablets: only when mobileWebGLCapable() passes, with the "lite" profile (docs/MOBILE-3D-PLAN.md §4–§6):
// capped DPR with a runtime frame guard, time-sliced mount, intro only after the first presented frame.
import type * as THREE from 'three';
import {motionTier,saveData,type Tier} from '@/motion/setup';

const active=new Set<string>();
/** Live WebGL contexts allowed on this page: 2 on desktop, 1 on touch devices and phones. */
export function maxContexts(){return motionTier()==='desktop'?2:1}
export function acquireContext(id:string){if(active.has(id))return true;if(active.size>=maxContexts())return false;active.add(id);return true}
export function releaseContext(id:string){active.delete(id)}
export function liveContexts(){return active.size}

// ── One capability probe per page (iOS keeps at most 16 contexts and drops the oldest) ──
type Probe={fast:boolean;any:boolean;maxTexture:number;renderer:string};
let probed:Probe|null=null;
function probe():Probe{
 if(probed)return probed;
 const result:Probe={fast:false,any:false,maxTexture:0,renderer:''};
 const read=(gl:WebGLRenderingContext|WebGL2RenderingContext)=>{
  result.maxTexture=Number(gl.getParameter(gl.MAX_TEXTURE_SIZE))||0;
  let name=String(gl.getParameter(gl.RENDERER)||'');
  // Chromium masks RENDERER as "WebKit WebGL"; Firefox/Safari already return the (sanitised) GPU name
  if(/^WebKit WebGL$/i.test(name)){const info=gl.getExtension('WEBGL_debug_renderer_info');if(info)name=String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)||name)}
  result.renderer=name;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
 };
 try{
  const fast=document.createElement('canvas').getContext('webgl2',{failIfMajorPerformanceCaveat:true});
  if(fast){result.fast=result.any=true;read(fast)}
  else{
   // no hardware WebGL2: desktop keeps its previous behaviour (any context) — phones never use this one
   const c=document.createElement('canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');
   if(gl){result.any=true;read(gl)}
  }
 }catch{/* no WebGL */}
 return probed=result;
}
export function webglAvailable(){return probe().any}

// ── Phones and tablets ──
const LITE_OFF='bf-webgl-lite-off',LITE_OFF_MS=7*864e5;
const WEAK_GPU=/SwiftShader|llvmpipe|Mali-(4|T[6-8]|G31|G51|G52)|Adreno \(TM\) (3|4|50)\d|PowerVR/i;
let capable:boolean|null=null;
function liteOff(){try{const t=Number(localStorage.getItem(LITE_OFF));return t>0&&Date.now()-t<LITE_OFF_MS}catch{return false}}
/** Remember for 7 days that this device could not hold the lite scenes (set by the frame guard). */
export function markLiteOff(){capable=false;try{localStorage.setItem(LITE_OFF,String(Date.now()))}catch{/* storage blocked */}}
/** Hardware WebGL2 (no major performance caveat), 4096² textures, no Save-Data, ≥ 4 GB where reported, ≥ 4 cores on
 *  Android, no known-weak GPU, not turned off by the frame guard. Cached; the probe context is released at once. */
export function mobileWebGLCapable(){
 if(capable!==null)return capable;
 const nav=navigator as Navigator&{deviceMemory?:number};const p=probe();
 const android=/Android/i.test(nav.userAgent);
 capable=p.fast&&p.maxTexture>=4096&&!saveData()&&(nav.deviceMemory===undefined||nav.deviceMemory>=4)
  &&(!android||(nav.hardwareConcurrency||0)>=4)&&!WEAK_GPU.test(p.renderer)&&!liteOff();
 return capable;
}

// ── Device pixel ratio ──
const DPR_STEPS=[1.5,1.25,1] as const;let dprStep=0;
/** Desktop: ≤ 1.5. Lite (tablet/mobile tier): min(dpr, step cap, √(300 000 / CSS px)), never below 1 — at most
 *  ≈ 0.3 MP per canvas. The frame guard lowers the step cap 1.5 → 1.25 → 1 for the rest of the page view. */
export function cappedDpr(tier:Tier='desktop',cssW=0,cssH=0){
 const dpr=window.devicePixelRatio||1;
 if(tier==='desktop')return Math.min(dpr,1.5);
 const budget=cssW>0&&cssH>0?Math.sqrt(300000/(cssW*cssH)):DPR_STEPS[0];
 return Math.min(dpr,Math.max(1,Math.min(DPR_STEPS[dprStep],budget)));
}
function lowerDprStep(){if(dprStep>=DPR_STEPS.length-1)return false;dprStep++;return true}

// ── Scheduling: keep every mount step short so input, scrolling and the first frames stay responsive ──
const abortError=()=>new DOMException('aborted','AbortError');
export function throwIfAborted(signal?:AbortSignal){if(signal?.aborted)throw abortError()}
/** Give the main thread back (scheduler.yield where supported, else a message-channel macrotask). */
export function yieldToMain():Promise<void>{
 const s=(globalThis as {scheduler?:{yield?:()=>Promise<void>}}).scheduler;
 if(s?.yield)return s.yield();
 return new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=()=>{c.port1.close();resolve()};c.port2.postMessage(null)});
}
/** Resolves on the next animation frame (i.e. after the previous frame was presented); rejects on abort. */
export function nextFrame(signal?:AbortSignal){
 return new Promise<number>((resolve,reject)=>{
  if(signal?.aborted){reject(abortError());return}
  const abort=()=>{cancelAnimationFrame(id);reject(abortError())};
  const id=requestAnimationFrame(t=>{signal?.removeEventListener('abort',abort);resolve(t)});
  signal?.addEventListener('abort',abort,{once:true});
 });
}
/** Resolves after `ms` without scroll / touch / wheel input, so GPU setup never lands in the middle of a fling. */
export function whenIdle(ms=1500){
 return new Promise<void>(resolve=>{
  const events=['scroll','touchstart','touchmove','wheel','pointerdown'] as const;let timer=0;
  const done=()=>{events.forEach(e=>window.removeEventListener(e,bump,true));resolve()};
  const bump=()=>{window.clearTimeout(timer);timer=window.setTimeout(done,ms)};
  events.forEach(e=>window.addEventListener(e,bump,{capture:true,passive:true}));bump();
 });
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
/** Median rAF interval over `n` frames: the display/power cadence (≈ 33 ms in iOS Low Power Mode). */
export async function displayCadence(n=8,signal?:AbortSignal){
 const t:number[]=[];let last=await nextFrame(signal);
 for(let i=0;i<n;i++){const now=await nextFrame(signal);t.push(now-last);last=now}
 t.sort((a,b)=>a-b);return t[Math.floor(t.length/2)]||16.7;
}

/** CPU-backed 2D canvas for texture building: draws can be flushed per image (see drawImageSliced). */
export function textureCanvas(w:number,h:number){
 const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);
 const g=c.getContext('2d',{willReadFrequently:true});if(!g)throw new Error('2D canvas unavailable');
 return [c,g] as const;
}
/** Draw one photo and rasterise it now (a 1-px read flushes the recorded draw), then yield: canvas draws are otherwise
 *  rasterised together at the end of the task — 12 photo downscales were one 130–140 ms task at 4× CPU. */
export async function drawImageSliced(g:CanvasRenderingContext2D,img:CanvasImageSource,sx:number,sy:number,sw:number,sh:number,dx:number,dy:number,dw:number,dh:number,signal?:AbortSignal){
 g.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);g.getImageData(Math.max(0,Math.floor(dx)),Math.max(0,Math.floor(dy)),1,1);
 await yieldToMain();throwIfAborted(signal);
}

/** GPU warm-up before the first visible frame, one short task at a time: texture uploads, then program creation
 *  per mesh (lights/environment from `scene`), then `compileAsync` (KHR_parallel_shader_compile) waits for linking
 *  off the main thread. Shader error checks (sync info-log reads) stay on in development only. */
export async function prepareRenderer(renderer:THREE.WebGLRenderer,scene:THREE.Scene,camera:THREE.Camera,signal?:AbortSignal){
 renderer.debug.checkShaderErrors=process.env.NODE_ENV!=='production';
 const textures=new Set<THREE.Texture>();const drawables:THREE.Object3D[]=[];
 scene.traverse(o=>{
  const m=(o as THREE.Mesh).material;if(!m)return;drawables.push(o);
  for(const mat of Array.isArray(m)?m:[m])for(const v of Object.values(mat)){const t=v as THREE.Texture|null;if(t&&typeof t==='object'&&t.isTexture&&!t.isRenderTargetTexture)textures.add(t)}
 });
 for(const t of textures){renderer.initTexture(t);await yieldToMain();throwIfAborted(signal)}
 for(const o of drawables){renderer.compile(o,camera,scene);await yieldToMain();throwIfAborted(signal)}
 await renderer.compileAsync(scene,camera);throwIfAborted(signal);
}

/** Free the CPU copy of a texture right after its upload (iOS caps total canvas memory at ≈ 384 MB): canvases
 *  shrink to 0×0, ImageBitmaps are closed. Never use on textures that are redrawn (the grease pencil). */
export function releaseCanvasSource<T extends THREE.Texture>(texture:T):T{
 texture.onUpdate=()=>{
  const img=texture.image as unknown;
  if(typeof HTMLCanvasElement!=='undefined'&&img instanceof HTMLCanvasElement){img.width=0;img.height=0}
  else if(typeof ImageBitmap!=='undefined'&&img instanceof ImageBitmap)img.close();
  texture.onUpdate=null;
 };
 return texture;
}

export type FrameGuard={frame:(now:number)=>void;reset:()=>void};
/** Lite-profile frame-time guard. Samples rendered-frame intervals only while an animation runs (call reset() when
 *  it ends). After ≥ 20 samples: p75 above max(22 ms, 1.25 × cadence) → one DPR step down (onStep); already at
 *  DPR 1 and above max(28 ms, 1.6 × cadence) → onGiveUp() once (the scene lets the running animation finish, then
 *  hands over to the DOM animations). `cadence` = displayCadence(), so a 30 fps Low Power Mode is not overload. */
export function createFrameGuard({cadence=16.7,onStep,onGiveUp}:{cadence?:number;onStep:()=>void;onGiveUp:()=>void}):FrameGuard{
 let samples:number[]=[];let last=0;let done=false;
 const step=Math.max(22,cadence*1.25),limit=Math.max(28,cadence*1.6);
 return{
  frame(now){
   if(done)return;
   if(last&&now-last<250)samples.push(now-last);
   last=now;if(samples.length<20)return;
   const p75=[...samples].sort((a,b)=>a-b)[Math.floor(samples.length*.75)];samples=[];
   if(p75<=step)return;
   if(lowerDprStep())onStep();
   else if(p75>limit){done=true;markLiteOff();onGiveUp()}
  },
  reset(){last=0;samples=[]},
 };
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
