"use client";
// Street Gallery window (WebGL): the Blender-built, light-baked model of the shop window at Schwabacher Straße /
// Alexanderstraße (scripts/blender/street_window.py, docs/BLENDER-ASSETS.md §2) carrying the real gallery photographs
// on its merged `Photos` mesh (one atlas, one draw). Unlit: no scene lights — the light is baked; 3 programs, 3 draws.
// Profiles (docs/MOBILE-3D-PLAN.md §4.2): full = street-window.glb (2048×1024 bake) + 2048×1152 photo atlas;
// lite (tablets/phones) = street-window-mobile.glb (1024×512) + 1024×576 atlas, DPR ≤ 1.5 with the frame guard.
// Light-up (exposeLights): one colour scalar .25 → 1 on the baked surfaces and the photos (the baked pools scale
// with it). Scroll dolly (damped, ≤ 60 renders/s) and the mouse-only ±2.5°/±1.5° parallax are kept.
// Loaded only via hooks/use-webgl-scene.ts (dynamic import). Renders on demand, paused offscreen, full dispose.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {SceneHandle,SceneMount} from '@/hooks/use-webgl-scene';
import {cappedDpr,createFrameGuard,displayCadence,disposeTree,drawImageSliced,nextFrame,prepareRenderer,releaseCanvasSource,textureCanvas,throwIfAborted} from '@/lib/webgl';
import {exposeLights,type Revertible} from '@/motion/gallery';

export type WindowPrint={src:string;w:number;h:number;place:'fenster'|'laden'};

const MODEL={full:'/models/street-window.glb',lite:'/models/street-window-mobile.glb'} as const;
/** Photo atlas: 4 × 3 cells of 4:3 in Photo_01…12 order; the 3:2 slot fills the cell width, centred (street_window.py). */
const ATLAS={cols:4,rows:3,cell:{full:512,lite:256}};
const MAT_PAPER='#ece9e1';
const FOV=28;
/** Framing: wide stages show the whole bay; narrow ones (phones, aspect < 1.6) frame the 3 × 3 window, side window in part. */
const VIEWS={wide:{target:new THREE.Vector3(.13,.05,-.4),half:{w:2.4,h:1.42}},tight:{target:new THREE.Vector3(-.27,.02,-.4),half:{w:1.4,h:1.12}}};
const MAX_YAW=THREE.MathUtils.degToRad(2.5),MAX_PITCH=THREE.MathUtils.degToRad(1.5);
const RENDER_GAP=15;
const LIGHT_UP_MS=120+820+60;    // exposeLights delay + duration (+ slack): frame-guard sampling window

function loadImage(src:string){const img=new Image();img.decoding='async';img.src=src;return img.decode().then(()=>img)}

/** All prints in one atlas texture, each contained (never cropped) in its slot on mat-coloured paper.
 *  One photo per task (drawImageSliced), so building the atlas never blocks input. */
async function photoAtlas(prints:WindowPrint[],lite:boolean,signal:AbortSignal){
 const cw=lite?ATLAS.cell.lite:ATLAS.cell.full,ch=cw*3/4;
 const [c,ctx]=textureCanvas(cw*ATLAS.cols,ch*ATLAS.rows);
 ctx.fillStyle=MAT_PAPER;ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingQuality='high';
 const images=await Promise.all(prints.map(p=>loadImage(p.src)));throwIfAborted(signal);
 const contentH=cw*2/3,inset=Math.max(3,cw*.014);
 for(const [i,img] of images.entries()){
  const bw=cw-inset*2,bh=contentH-inset*2;const s=Math.min(bw/img.naturalWidth,bh/img.naturalHeight);
  const dw=img.naturalWidth*s,dh=img.naturalHeight*s;
  const x=(i%ATLAS.cols)*cw+(cw-dw)/2,y=Math.floor(i/ATLAS.cols)*ch+(ch-dh)/2;
  await drawImageSliced(ctx,img,0,0,img.naturalWidth,img.naturalHeight,x,y,dw,dh,signal);
 }
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;texture.anisotropy=4;
 return releaseCanvasSource(texture);
}

/** Cheap glass: soft diagonal reflection streaks on black, blended additively. */
function glassTexture(size:number){
 const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');if(!ctx)throw new Error('2D canvas unavailable');
 ctx.scale(size/512,size/512);ctx.fillStyle='#000';ctx.fillRect(0,0,512,512);
 const sky=ctx.createLinearGradient(0,0,0,512);sky.addColorStop(0,'rgb(64 70 76)');sky.addColorStop(.45,'rgb(10 11 12)');sky.addColorStop(1,'#000');ctx.fillStyle=sky;ctx.fillRect(0,0,512,512);
 ctx.globalCompositeOperation='lighter';
 for(const [x,w,a] of [[150,70,.16],[260,24,.12],[420,110,.08]] as const){
  const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgb(0 0 0 / 0)');g.addColorStop(.5,`rgb(205 214 220 / ${a})`);g.addColorStop(1,'rgb(0 0 0 / 0)');
  ctx.save();ctx.translate(256,256);ctx.rotate(-.42);ctx.translate(-256,-256);ctx.fillStyle=g;ctx.fillRect(x-w,-200,w*2,912);ctx.restore();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;return releaseCanvasSource(t);
}

/** Fallback for a GLB without `Photos`: merge Photo_01…12 (node matrices baked in), uv0 remapped to the atlas cells. */
function mergePhotoSlots(root:THREE.Object3D){
 const parts:THREE.BufferGeometry[]=[];const pad=(1-(2/3)/(3/4))/2/ATLAS.rows;root.updateMatrixWorld(true);
 for(let i=0;i<ATLAS.cols*ATLAS.rows;i++){
  const slot=root.getObjectByName(`Photo_${String(i+1).padStart(2,'0')}`) as THREE.Mesh|undefined;if(!slot)continue;
  const g=slot.geometry.clone().applyMatrix4(slot.matrixWorld);const uv=g.getAttribute('uv');
  const u0=(i%ATLAS.cols)/ATLAS.cols,vt=Math.floor(i/ATLAS.cols)/ATLAS.rows+pad,du=1/ATLAS.cols,dv=1/ATLAS.rows-2*pad;
  for(let k=0;k<uv.count;k++)uv.setXY(k,u0+uv.getX(k)*du,vt+uv.getY(k)*dv);
  parts.push(g);
 }
 const merged=mergeGeometries(parts);parts.forEach(p=>p.dispose());if(!merged)throw new Error('photo slots missing');
 return new THREE.Mesh(merged);
}

export function createGalleryWindow(prints:WindowPrint[]):SceneMount{
 return async(host,ctx)=>{
  const {signal}=ctx;const lite=ctx.profile==='lite';
  const mount=host.querySelector<HTMLElement>('[data-webgl-canvas]')??host;
  const [gltf,atlas,cadence]=await Promise.all([
   new GLTFLoader().loadAsync(MODEL[ctx.profile]),photoAtlas(prints,lite,signal),
   lite?displayCadence(8,signal).catch(()=>16.7):Promise.resolve(16.7),
  ]);
  if(signal.aborted){disposeTree(gltf.scene);atlas.dispose();throw new DOMException('aborted','AbortError')}

  const undo:(()=>void)[]=[];const destroyAll=()=>{for(const fn of undo.splice(0).reverse()){try{fn()}catch{/* best effort */}}};
  const scene=new THREE.Scene();undo.push(()=>{disposeTree(scene);atlas.dispose();scene.clear()});
  const root=gltf.scene;scene.add(root);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,stencil:false,powerPreference:'default',failIfMajorPerformanceCaveat:lite});
  undo.push(()=>{const lostAlready=renderer.getContext().isContextLost();renderer.renderLists.dispose();renderer.dispose();if(!lostAlready)try{renderer.forceContextLoss()}catch{/* already lost */}});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.setClearColor(0x0a0b0c,1);
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');mount.appendChild(canvas);undo.push(()=>canvas.remove());
  try{
   // Baked surfaces: unlit, already tone-mapped colours. The bake is also the photos' light map (uv1); the clone
   // shares the image source and GL texture with the original, so it costs no second upload.
   const statics=root.getObjectByName('WindowStatic') as THREE.Mesh;
   const bakedMat=statics.material as THREE.MeshBasicMaterial;bakedMat.toneMapped=false;
   const baked=bakedMat.map;if(!baked)throw new Error('baked map missing');releaseCanvasSource(baked);
   const light=baked.clone();light.channel=1;
   let photos=root.getObjectByName('Photos') as THREE.Mesh|undefined;
   if(!photos){photos=mergePhotoSlots(root);root.add(photos)}
   const slots:THREE.Object3D[]=[];root.traverse(o=>{if(/^Photo_\d\d$/.test(o.name))slots.push(o)});   // desktop GLB keeps them alongside
   for(const o of slots){o.removeFromParent();disposeTree(o)}
   (photos.material as THREE.Material).dispose();
   const photoMat=new THREE.MeshBasicMaterial({map:atlas,lightMap:light,lightMapIntensity:Math.PI*1.25,toneMapped:false});
   photos.material=photoMat;
   // Glass: the additive reflection-streak material on the GLB panes (UVs planar over both panes).
   const glass=root.getObjectByName('Glass') as THREE.Mesh;
   {const g=glass.geometry;g.computeBoundingBox();const b=g.boundingBox!;const p=g.getAttribute('position');const uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i++){uv[i*2]=(p.getX(i)-b.min.x)/(b.max.x-b.min.x)*1.6;uv[i*2+1]=(p.getY(i)-b.min.y)/(b.max.y-b.min.y)}
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
   (glass.material as THREE.Material).dispose();
   const glassTex=glassTexture(lite?256:512);
   glass.material=new THREE.MeshBasicMaterial({map:glassTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.75,toneMapped:false});
   glass.renderOrder=1;

   const level={k:0};
   const applyLevel=()=>{const c=.25+.75*level.k;bakedMat.color.setScalar(c);photoMat.color.setScalar(c)};
   const camera=new THREE.PerspectiveCamera(FOV,1,.1,40);const target=new THREE.Vector3();
   let fitDistance=6;
   const cur={yaw:0,pitch:0,dolly:1},tgt={yaw:0,pitch:0,dolly:1};
   const place=()=>{
    const d=fitDistance*cur.dolly;
    camera.position.set(target.x+d*Math.sin(cur.yaw)*Math.cos(cur.pitch),target.y+d*Math.sin(cur.pitch),target.z+d*Math.cos(cur.yaw)*Math.cos(cur.pitch));
    camera.lookAt(target);glassTex.offset.set(cur.yaw*2.4,cur.pitch*1.6);
   };
   let paused=false,lost=false,raf=0,last=0,lastRender=-1e9,scrollDirty=true,givingUp=false,lightUntil=0;
   const guard=lite?createFrameGuard({cadence,onStep:()=>{resize(true);invalidate()},onGiveUp:()=>{givingUp=true}}):null;
   const readScroll=()=>{const r=host.getBoundingClientRect();const vh=window.innerHeight||1;const p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));tgt.dolly=1.06-.1*p};
   const draw=(now:number,sample:boolean)=>{if(lost)return;lastRender=now;applyLevel();place();renderer.render(scene,camera);if(guard&&sample)guard.frame(now)};
   const step=(now:number)=>{
    raf=0;if(now-lastRender<RENDER_GAP){raf=requestAnimationFrame(step);return}
    if(scrollDirty){scrollDirty=false;readScroll()}   // one layout read per rendered frame, not per scroll event
    const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;const a=1-Math.exp(-dt*6.5);
    let moving=false;for(const key of ['yaw','pitch','dolly'] as const){const delta=tgt[key]-cur[key];if(Math.abs(delta)>1e-5){cur[key]+=delta*a;moving=true}else cur[key]=tgt[key]}
    const lighting=now<lightUntil;
    draw(now,moving||lighting);
    if(moving&&!paused)raf=requestAnimationFrame(step);
    else{last=0;if(!lighting){guard?.reset();if(givingUp){givingUp=false;ctx.onGiveUp()}}}
   };
   function invalidate(){if(!raf&&!paused&&!lost)raf=requestAnimationFrame(step)}
   // Light-up frames draw in a microtask after Anime's frame callback (a rAF from inside it would land a frame late and
   // only on every other frame); the camera loop above keeps its own rAF.
   let drawQueued=false;
   const redraw=()=>{if(drawQueued||paused||lost)return;drawQueued=true;
    queueMicrotask(()=>{drawQueued=false;if(paused||lost)return;const now=performance.now();if(raf||now-lastRender<RENDER_GAP){invalidate();return}draw(now,now<lightUntil)})};
   undo.push(()=>{paused=true;if(raf)cancelAnimationFrame(raf);raf=0});
   let devW=0,devH=0;
   function resize(force=false){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;
    const v=camera.aspect<1.6?VIEWS.tight:VIEWS.wide;target.copy(v.target);
    const t=Math.tan(THREE.MathUtils.degToRad(FOV/2));fitDistance=Math.max(v.half.h/t,v.half.w/(t*camera.aspect));camera.updateProjectionMatrix();
    const dpr=cappedDpr(ctx.tier,w,h);const dw=Math.round(w*dpr),dh=Math.round(h*dpr);
    if(force||Math.abs(dw-devW)>=2||Math.abs(dh-devH)>=2){devW=dw;devH=dh;renderer.setPixelRatio(dpr);renderer.setSize(w,h,false)}
   }
   const onScroll=()=>{scrollDirty=true;invalidate()};
   const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();const nx=((e.clientX-r.left)/r.width)*2-1,ny=((e.clientY-r.top)/r.height)*2-1;tgt.yaw=Math.max(-1,Math.min(1,nx))*MAX_YAW;tgt.pitch=-Math.max(-1,Math.min(1,ny))*MAX_PITCH;invalidate()};
   const leave=()=>{tgt.yaw=0;tgt.pitch=0;invalidate()};
   const contextLost=(e:Event)=>{e.preventDefault();lost=true;paused=true;if(raf)cancelAnimationFrame(raf);raf=0;ctx.onLost()};
   let sizeRaf=0;
   const ro=new ResizeObserver(()=>{if(!sizeRaf)sizeRaf=requestAnimationFrame(()=>{sizeRaf=0;resize();invalidate()})});ro.observe(host);
   host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
   window.addEventListener('scroll',onScroll,{passive:true});canvas.addEventListener('webglcontextlost',contextLost);
   undo.push(()=>{ro.disconnect();if(sizeRaf)cancelAnimationFrame(sizeRaf);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',onScroll);canvas.removeEventListener('webglcontextlost',contextLost)});

   // Mount: warm-up in short tasks → first (dim) frame → ready → the lights come up.
   resize(true);readScroll();cur.dolly=tgt.dolly;place();
   await prepareRenderer(renderer,scene,camera,signal);
   draw(performance.now(),false);canvas.dataset.drawCalls=String(renderer.info.render.calls);
   await nextFrame(signal);
   ctx.onReady();
   lightUntil=performance.now()+LIGHT_UP_MS;
   const lights:Revertible=exposeLights(level,redraw);undo.push(()=>lights.revert());
   const lightsDone=window.setTimeout(invalidate,LIGHT_UP_MS+20);undo.push(()=>window.clearTimeout(lightsDone));   // guard hand-over check

   const handle:SceneHandle={
    pause(){paused=true;if(raf)cancelAnimationFrame(raf);raf=0;last=0;guard?.reset()},
    resume(){if(!paused||lost)return;paused=false;scrollDirty=true;resize();invalidate()},
    destroy:destroyAll,
   };
   return handle;
  }catch(error){destroyAll();throw error}
 };
}
