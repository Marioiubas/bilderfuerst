"use client";
// Street Gallery · simplified (NOT photoreal) WebGL model of the shop window at
// Schwabacher Straße Ecke Alexanderstraße: dark façade, a 3×3 hang of black frames with white mats
// behind glass, gallery light pools, and through the narrow side window a dimmer shop wall with the
// three inside prints. Loaded only via hooks/use-webgl-scene.ts (dynamic import, desktop tier).
//
// Budget (documented for QA): 1 context · ~12 draw calls (façade, display box, frames [instanced],
// mats, photos [one atlas], frame shadows, light pools, uplights [instanced], interior, glass) ·
// textures: photo atlas 2048×1152 (12 cells of 512×384, each photo resized by the browser, sRGB),
// façade 256², pool 128², shadow 128², glass 512² · DPR via cappedDpr() · renders on demand
// (damped pointer/scroll loop stops when settled) · paused offscreen/hidden · full dispose on destroy.
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {SceneHandle,SceneMount} from '@/hooks/use-webgl-scene';
import {cappedDpr,disposeTree} from '@/lib/webgl';
import {exposeLights,type Revertible} from '@/motion/gallery';

export type WindowPrint={src:string;w:number;h:number;place:'fenster'|'laden'};

// ── Model units (≈ metres). Both openings share the same height. ──
const OPEN={bottom:-1.05,top:1.05};
const MAIN={cx:-.55,w:2.5};
const SIDE={cx:1.575,w:.95};
const BOX_DEPTH=.92;           // depth of the window display box
const FRAME={w:.66,h:.49,d:.035,border:.034};
const INSIDE={w:.5,h:.37,z:-3.4,cx:2.25};
const COLS=[-1.36,-.55,.26];
const ROWS=[.71,.1,-.51];
const TARGET=new THREE.Vector3(.13,.05,-.4);
const HALF={w:2.4,h:1.42};
const FOV=28;
const MAX_YAW=THREE.MathUtils.degToRad(2.5),MAX_PITCH=THREE.MathUtils.degToRad(1.5);
const CELL={w:512,h:384,cols:4};

const canvasOf=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)throw new Error('2D canvas unavailable');return{c,ctx}};
const aborted=(signal:AbortSignal)=>{if(signal.aborted)throw new DOMException('Aborted','AbortError')};

function loadImage(src:string){const img=new Image();img.decoding='async';img.src=src;return img.decode().then(()=>img)}

/** All photos in one atlas (one texture, one draw call). Each photo is contained, never cropped. */
async function photoAtlas(prints:WindowPrint[],signal:AbortSignal){
 const rows=Math.ceil(prints.length/CELL.cols);const {c,ctx}=canvasOf(CELL.w*CELL.cols,CELL.h*rows);
 ctx.fillStyle='#efefea';ctx.fillRect(0,0,c.width,c.height);
 const images=await Promise.all(prints.map(p=>loadImage(p.src)));aborted(signal);
 const uv=images.map((img,i)=>{
  const pad=6,bw=CELL.w-pad*2,bh=CELL.h-pad*2;const s=Math.min(bw/img.naturalWidth,bh/img.naturalHeight);
  const dw=Math.round(img.naturalWidth*s),dh=Math.round(img.naturalHeight*s);
  const x=(i%CELL.cols)*CELL.w+Math.round((CELL.w-dw)/2),y=Math.floor(i/CELL.cols)*CELL.h+Math.round((CELL.h-dh)/2);
  ctx.imageSmoothingQuality='high';ctx.drawImage(img,x,y,dw,dh);
  return{u0:(x+.5)/c.width,u1:(x+dw-.5)/c.width,v0:1-(y+dh-.5)/c.height,v1:1-(y+.5)/c.height,aspect:dw/dh};
 });
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return{texture,uv};
}

/** Running-bond ashlar tile (two courses) for the sandstone façade, darkened for night. */
function facadeTexture(){
 const {c,ctx}=canvasOf(256,256);let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 ctx.fillStyle='#1d1b19';ctx.fillRect(0,0,256,256);
 for(let row=0;row<2;row++)for(let col=-1;col<2;col++){
  const x=col*128+(row?64:0),y=row*128;const l=68+Math.round(rnd()*14);
  ctx.fillStyle=`rgb(${l} ${l-4} ${l-9})`;ctx.fillRect(x+2,y+2,124,124);
  ctx.fillStyle=`rgb(${l+6} ${l+2} ${l-4} / .35)`;ctx.fillRect(x+2,y+2,124,10);
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/1.2,1/.6);t.anisotropy=4;return t;
}
function radialTexture(inner:string){
 const {c,ctx}=canvasOf(128,128);const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.55,'rgb(70 56 40)');g.addColorStop(1,'#000');
 ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
/** Alpha map (white = opaque) for the soft shadow each frame casts on its wall. shadowBlur works in every engine. */
function shadowTexture(){
 const {c,ctx}=canvasOf(128,128);ctx.fillStyle='#000';ctx.fillRect(0,0,128,128);
 ctx.shadowColor='#fff';ctx.shadowBlur=16;ctx.shadowOffsetX=1000;ctx.fillStyle='#fff';ctx.fillRect(24-1000,24,80,80);
 return new THREE.CanvasTexture(c);
}
/** Cheap glass: soft diagonal reflection streaks on black, blended additively. */
function glassTexture(){
 const {c,ctx}=canvasOf(512,512);ctx.fillStyle='#000';ctx.fillRect(0,0,512,512);
 const sky=ctx.createLinearGradient(0,0,0,512);sky.addColorStop(0,'rgb(64 70 76)');sky.addColorStop(.45,'rgb(10 11 12)');sky.addColorStop(1,'#000');ctx.fillStyle=sky;ctx.fillRect(0,0,512,512);
 ctx.globalCompositeOperation='lighter';
 for(const [x,w,a] of [[150,70,.16],[260,24,.12],[420,110,.08]] as const){
  const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgb(0 0 0 / 0)');g.addColorStop(.5,`rgb(205 214 220 / ${a})`);g.addColorStop(1,'rgb(0 0 0 / 0)');
  ctx.save();ctx.translate(256,256);ctx.rotate(-.42);ctx.translate(-256,-256);ctx.fillStyle=g;ctx.fillRect(x-w,-200,w*2,912);ctx.restore();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;return t;
}

// ── Geometry helpers (merged per material to keep draw calls low) ──
type Rgb=[number,number,number];
function paint(g:THREE.BufferGeometry,color:Rgb|((x:number,y:number,z:number)=>Rgb)){
 const pos=g.getAttribute('position');const col=new Float32Array(pos.count*3);
 for(let i=0;i<pos.count;i++){const v=typeof color==='function'?color(pos.getX(i),pos.getY(i),pos.getZ(i)):color;col.set(v,i*3)}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
}
function plane(w:number,h:number,x:number,y:number,z:number,{rx=0,ry=0,seg=1}:{rx?:number;ry?:number;seg?:number}={}){
 const g=new THREE.PlaneGeometry(w,h,seg,seg);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);g.translate(x,y,z);return g;
}
function cube(w:number,h:number,d:number,x:number,y:number,z:number){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);return g}
function merge(parts:THREE.BufferGeometry[]){const g=mergeGeometries(parts);for(const p of parts)p.dispose();if(!g)throw new Error('merge failed');return g}
function uvRect(g:THREE.BufferGeometry,r:{u0:number;u1:number;v0:number;v1:number}){
 const uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)?r.u1:r.u0,uv.getY(i)?r.v1:r.v0);return g;
}
const contain=(bw:number,bh:number,aspect:number)=>bw/bh>aspect?{w:bh*aspect,h:bh}:{w:bw,h:bw/aspect};

export function createGalleryWindow(prints:WindowPrint[]):SceneMount{
 return async(host,{tier,signal})=>{
  const mount=host.querySelector<HTMLElement>('[data-webgl-canvas]')??host;
  const atlas=await photoAtlas(prints,signal);aborted(signal);
  const scene=new THREE.Scene();
  const level={k:0};

  // Façade with two openings.
  const shape=new THREE.Shape([new THREE.Vector2(-6.4,-3.6),new THREE.Vector2(6.6,-3.6),new THREE.Vector2(6.6,3.6),new THREE.Vector2(-6.4,3.6)]);
  for(const o of [MAIN,SIDE]){const l=o.cx-o.w/2,r=o.cx+o.w/2;shape.holes.push(new THREE.Path([new THREE.Vector2(l,OPEN.bottom),new THREE.Vector2(l,OPEN.top),new THREE.Vector2(r,OPEN.top),new THREE.Vector2(r,OPEN.bottom)]))}
  scene.add(new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshLambertMaterial({map:facadeTexture()})));

  // Display box, plinth, side-window reveals and white window profiles (one Lambert mesh, vertex-tinted).
  const H=OPEN.top-OPEN.bottom,ml=MAIN.cx-MAIN.w/2,mr=MAIN.cx+MAIN.w/2,sl=SIDE.cx-SIDE.w/2,sr=SIDE.cx+SIDE.w/2;
  const wall:Rgb=[.11,.105,.1],plinth:Rgb=[.62,.62,.6],profile:Rgb=[.9,.9,.88],reveal:Rgb=[.2,.19,.18];
  const shell=[
   paint(plane(MAIN.w,H,MAIN.cx,0,-BOX_DEPTH,{seg:6}),wall),
   paint(plane(BOX_DEPTH,H,ml,0,-BOX_DEPTH/2,{ry:Math.PI/2}),wall),
   paint(plane(BOX_DEPTH,H,mr,0,-BOX_DEPTH/2,{ry:-Math.PI/2}),wall),
   paint(plane(MAIN.w,BOX_DEPTH,MAIN.cx,OPEN.top,-BOX_DEPTH/2,{rx:Math.PI/2}),wall),
   paint(cube(MAIN.w,.2,BOX_DEPTH-.06,MAIN.cx,OPEN.bottom+.1,-BOX_DEPTH/2-.03),plinth),
   paint(plane(.3,H,sl,0,-.15,{ry:Math.PI/2}),reveal),paint(plane(.3,H,sr,0,-.15,{ry:-Math.PI/2}),reveal),
   paint(plane(SIDE.w,.3,SIDE.cx,OPEN.top,-.15,{rx:Math.PI/2}),reveal),paint(plane(SIDE.w,.3,SIDE.cx,OPEN.bottom,-.15,{rx:-Math.PI/2}),plinth),
  ];
  for(const o of [MAIN,SIDE]){const l=o.cx-o.w/2,r=o.cx+o.w/2,t=.055;
   shell.push(paint(cube(o.w+t*2,t,t,o.cx,OPEN.top-t/2,-.03),profile),paint(cube(o.w+t*2,t,t,o.cx,OPEN.bottom+t/2,-.03),profile),paint(cube(t,H,t,l+t/2,0,-.03),profile),paint(cube(t,H,t,r-t/2,0,-.03),profile));
  }
  scene.add(new THREE.Mesh(merge(shell),new THREE.MeshLambertMaterial({vertexColors:true})));

  // Shop interior behind the side window: baked light (vertex colours), unaffected by scene lights.
  const glow=(x:number,y:number)=>Math.exp(-(((x-INSIDE.cx)/.75)**2+((y-.05)/1)**2));
  const interior=merge([
   paint(plane(3.6,3.4,2.3,.6,INSIDE.z,{seg:14}),(x,y)=>{const v=.018+.07*glow(x,y)+.02*Math.max(0,(y-1.4));return[v,v*.96,v*.9]}),
   paint(plane(3.6,3.1,2.3,OPEN.bottom,INSIDE.z/2-.15,{rx:-Math.PI/2,seg:8}),(x,y,z)=>{const v=.012+.025*Math.max(0,1+z/3.4);return[v,v,v*.95]}),
  ]);
  scene.add(new THREE.Mesh(interior,new THREE.MeshBasicMaterial({vertexColors:true})));

  // Frames: one instanced box mesh for all twelve.
  const slots=prints.map((p,i)=>{
   if(p.place==='fenster'){const n=i;return{x:COLS[n%3],y:ROWS[Math.floor(n/3)%3],z:-BOX_DEPTH+.03,w:FRAME.w,h:FRAME.h,lit:1}}
   const n=i-9;return{x:INSIDE.cx,y:.53-n*.5,z:INSIDE.z+.025,w:INSIDE.w,h:INSIDE.h,lit:.42};
  });
  const frames=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,FRAME.d),new THREE.MeshStandardMaterial({color:0x0c0d0e,roughness:.36,metalness:0}),slots.length);
  const m=new THREE.Matrix4();slots.forEach((s,i)=>frames.setMatrixAt(i,m.compose(new THREE.Vector3(s.x,s.y,s.z),new THREE.Quaternion(),new THREE.Vector3(s.w,s.h,1))));
  scene.add(frames);

  // Mats, photos (atlas), soft frame shadows.
  const mats:THREE.BufferGeometry[]=[],photos:THREE.BufferGeometry[]=[],shadows:THREE.BufferGeometry[]=[];
  slots.forEach((s,i)=>{
   const front=s.z+FRAME.d/2;const scale=s.w/FRAME.w;const mw=s.w-FRAME.border*2*scale,mh=s.h-FRAME.border*2*scale;
   mats.push(paint(plane(mw,mh,s.x,s.y,front+.001),[s.lit,s.lit,s.lit]));
   const margin=mw*.085;const fit=contain(mw-margin*2,mh-margin*2,atlas.uv[i].aspect);
   const p=s.lit;photos.push(paint(uvRect(plane(fit.w,fit.h,s.x,s.y,front+.002),atlas.uv[i]),[p,p,p]));
   shadows.push(plane(s.w+.17*scale,s.h+.17*scale,s.x+.01,s.y-.035*scale,s.z-FRAME.d/2+.004));
  });
  const matMaterial=new THREE.MeshLambertMaterial({color:0xf1f1ed,vertexColors:true,emissive:0x18181a});
  const photoMaterial=new THREE.MeshBasicMaterial({map:atlas.texture,vertexColors:true,toneMapped:false});
  scene.add(new THREE.Mesh(merge(mats),matMaterial),new THREE.Mesh(merge(photos),photoMaterial));
  scene.add(new THREE.Mesh(merge(shadows),new THREE.MeshBasicMaterial({color:0x000000,alphaMap:shadowTexture(),transparent:true,opacity:.62,depthWrite:false})));

  // Baked gallery light: uplight washes on the back panel + pools on the plinth (additive quads).
  const pools=merge([
   ...COLS.map(x=>paint(plane(1,1.9,x,-.2,-BOX_DEPTH+.004),[.42,.36,.28])),
   ...COLS.map(x=>paint(plane(.56,.4,x,OPEN.bottom+.201,-.34,{rx:-Math.PI/2}),[.5,.43,.33])),
  ]);
  const poolMaterial=new THREE.MeshBasicMaterial({map:radialTexture('rgb(255 236 210)'),vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0});
  scene.add(new THREE.Mesh(pools,poolMaterial));
  const fixtures=new THREE.InstancedMesh(new THREE.CylinderGeometry(.026,.032,.085,14),new THREE.MeshStandardMaterial({color:0x9aa1a6,roughness:.32,metalness:.75}),COLS.length);
  COLS.forEach((x,i)=>fixtures.setMatrixAt(i,m.compose(new THREE.Vector3(x,OPEN.bottom+.24,-.24),new THREE.Quaternion().setFromEuler(new THREE.Euler(-.55,0,0)),new THREE.Vector3(1,1,1))));
  scene.add(fixtures);

  // Glass: additive reflection streaks; their offset follows the camera for a little parallax.
  const glassTex=glassTexture();
  const glass=merge([plane(MAIN.w,H,MAIN.cx,0,-.045),plane(SIDE.w,H,SIDE.cx,0,-.045)]);
  scene.add(new THREE.Mesh(glass,new THREE.MeshBasicMaterial({map:glassTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.75,toneMapped:false})));

  // Lights (physically based units, so ≈π× the legacy values): dim street ambience + one warm gallery spot inside the window head.
  scene.add(new THREE.HemisphereLight(0x9ca2a6,0x15120f,1.6));
  const street=new THREE.DirectionalLight(0xa8b3bc,.95);street.position.set(-3,4,6);scene.add(street);
  const spot=new THREE.SpotLight(0xffecd6,0,4.2,.9,.85,1.15);spot.position.set(MAIN.cx,OPEN.top-.08,-.16);spot.target.position.set(MAIN.cx,-.2,-BOX_DEPTH);scene.add(spot,spot.target);

  // Renderer + camera.
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power',stencil:false});
  renderer.setPixelRatio(cappedDpr(tier));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.setClearColor(0x0a0b0c,1);
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');mount.appendChild(canvas);
  const camera=new THREE.PerspectiveCamera(FOV,1,.1,40);
  let fitDistance=6;
  const cur={yaw:0,pitch:0,dolly:1},tgt={yaw:0,pitch:0,dolly:1};

  const applyLevel=()=>{const k=level.k;spot.intensity=7.5*k;poolMaterial.opacity=k;photoMaterial.color.setScalar(.22+.78*k);matMaterial.emissive.setScalar(.03+.05*k)};
  const place=()=>{
   const d=fitDistance*cur.dolly;
   camera.position.set(TARGET.x+d*Math.sin(cur.yaw)*Math.cos(cur.pitch),TARGET.y+d*Math.sin(cur.pitch),TARGET.z+d*Math.cos(cur.yaw)*Math.cos(cur.pitch));
   camera.lookAt(TARGET);glassTex.offset.set(cur.yaw*2.4,cur.pitch*1.6);
  };
  let paused=false,lost=false,raf=0,last=0;
  const draw=()=>{if(lost)return;applyLevel();place();renderer.render(scene,camera)};
  const step=(now:number)=>{
   raf=0;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;const a=1-Math.exp(-dt*6.5);
   let moving=false;for(const key of ['yaw','pitch','dolly'] as const){const delta=tgt[key]-cur[key];if(Math.abs(delta)>1e-5){cur[key]+=delta*a;moving=true}else cur[key]=tgt[key]}
   draw();if(moving&&!paused)raf=requestAnimationFrame(step);else last=0;
  };
  const invalidate=()=>{if(!raf&&!paused&&!lost)raf=requestAnimationFrame(step)};

  const resize=()=>{
   const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;
   const t=Math.tan(THREE.MathUtils.degToRad(FOV/2));fitDistance=Math.max(HALF.h/t,HALF.w/(t*camera.aspect));camera.updateProjectionMatrix();if(!paused)draw();
  };
  const scroll=()=>{const r=host.getBoundingClientRect();const vh=window.innerHeight||1;const p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));tgt.dolly=1.06-.1*p;invalidate()};
  const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=host.getBoundingClientRect();const nx=((e.clientX-r.left)/r.width)*2-1,ny=((e.clientY-r.top)/r.height)*2-1;tgt.yaw=Math.max(-1,Math.min(1,nx))*MAX_YAW;tgt.pitch=-Math.max(-1,Math.min(1,ny))*MAX_PITCH;invalidate()};
  const leave=()=>{tgt.yaw=0;tgt.pitch=0;invalidate()};
  const contextLost=(e:Event)=>{e.preventDefault();lost=true;if(raf)cancelAnimationFrame(raf);raf=0;host.dataset.webgl='failed'};

  const ro=new ResizeObserver(resize);ro.observe(host);
  host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
  window.addEventListener('scroll',scroll,{passive:true});canvas.addEventListener('webglcontextlost',contextLost);
  resize();scroll();cur.dolly=tgt.dolly;draw();canvas.dataset.drawCalls=String(renderer.info.render.calls);
  const lights:Revertible=exposeLights(level,invalidate);

  const handle:SceneHandle={
   pause(){paused=true;if(raf)cancelAnimationFrame(raf);raf=0;last=0},
   resume(){if(!paused)return;paused=false;scroll();resize()},
   destroy(){
    paused=true;if(raf)cancelAnimationFrame(raf);raf=0;lights.revert();
    ro.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);
    window.removeEventListener('scroll',scroll);canvas.removeEventListener('webglcontextlost',contextLost);
    frames.dispose();fixtures.dispose();disposeTree(scene);scene.clear();
    renderer.dispose();renderer.forceContextLoss();canvas.remove();
   },
  };
  return handle;
 };
}
