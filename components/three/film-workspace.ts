"use client";
// WebGL enhancement of the home hero ("floating film workspace").
// One object scene: Blender-modelled generic 135 cartridge (GLB v2) lying on a dark table, a procedural negative
// strip bent along a curve out of its leader slot, across an opal light table, and a contact-sheet paper. Real
// photographs ride on the strip as frame quads (one merged mesh) that can be laid out as a contact sheet.
// Photographic light only: softbox key, enlarger top light, one faint safelight rim.
// Rendered on demand (rAF only while Anime runs or the pointer easing settles), at most ~60 renders/s.
// Profiles (docs/MOBILE-3D-PLAN.md §4.1): full (desktop) = PBR, 1024² GLB maps, PCF shadow map refreshed only when
// geometry moves; lite (tablets/phones) = film-cartridge-v2-mobile.glb shaded with a studio matcap (no PMREM pass),
// Lambert/Basic surfaces, half-size canvas textures, baked contact shadow + pose-driven soft lift shadows instead of a
// shadow map, DPR ≤ 1.5 + frame guard.
// Mount: assets → scene → prepareRenderer (time-sliced uploads/compiles) → first frame → ctx.onReady → intro.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {animate} from 'animejs/animation';
import {createTimeline} from 'animejs/timeline';
import type {SceneContext,SceneHandle} from '@/hooks/use-webgl-scene';
import {cappedDpr,createFrameGuard,displayCadence,disposeTree,nextFrame,prepareRenderer,releaseCanvasSource,throwIfAborted,yieldToMain} from '@/lib/webgl';
import {duration,ease,stagger} from '@/motion/tokens';
import {heroFrames,SELECTED_FRAME,SHEET_COLUMNS} from '../hero-frames';
import {glassTexture,loadImage,matcapTexture,MONO,paperTexture,pencilTexture,photoAtlas,radialTexture,stripTexture} from './film-textures';

export type FilmWorkspaceApi={setSheet:(next:boolean)=>void};
export type FilmView='strip'|'sheet';
export type FilmWorkspaceOptions={pointerTarget:HTMLElement;sheet:boolean;onApi:(api:FilmWorkspaceApi|null)=>void;
 /** The view wanted when the first frame is drawn (the visitor may switch views while the scene loads). */
 currentSheet?:()=>boolean;
 /** A view's motion has fully finished (sheet: after the grease-pencil mark). Phones hand the sheet to the DOM. */
 onSettled?:(view:FilmView)=>void};
type Animatable={pause:()=>unknown;resume:()=>unknown;revert:()=>unknown;complete:()=>unknown;completed:boolean};

/* Scene units: the cartridge model is 1 unit long (≈ 45 mm). */
const S=1.3,FILM_W=.87,FRAME_W=FILM_W*36/35,FRAME_H=FILM_W*24/35,PITCH=FILM_W*38/35;
const LEAD=.92,SHEET_SCALE=.82;
const GLASS={x:.7,z:-.55,w:4.2,d:1.85,top:.072};
const PAPER={x:1.1,z:1.5,w:3.6,d:1.86,yaw:.026,colp:.84,rowp:.72,goy:.09};
/** Cartridge position; the film group pivots here by FILM_YAW so the strip crosses the glass diagonally. */
const CART={x:-2.25,z:-.68},FILM_YAW=-.12,FOV=22,ELEVATION=62;
/* Leader tongue tip and exit direction in GLB model space (v1 fallback; v2 has the SlotExit node). */
const TIP=new THREE.Vector3(.085,0,-.3),EXIT=new THREE.Vector3(.78,0,-.62).normalize();
const MODEL={full:'/models/film-cartridge-v2.glb',lite:'/models/film-cartridge-v2-mobile.glb'} as const;
/** Baked contact shadow of the cartridge in exactly this pose (scripts/blender/cartridge_135.py, 2 × 2 model units). */
const CONTACT={src:'/textures/cartridge-contact-shadow.webp',extent:2,opacity:.72};
const KEY=new THREE.Vector3(-4.5,7.5,5.5);
const RENDER_GAP=15;              // ms between renders: 120 Hz panels draw ≤ 60 frames/s (Anime stays time-based)
const N=heroFrames.length,SEG=16,FV=(SEG+1)*2;
const clamp01=(v:number)=>Math.min(1,Math.max(0,v));

/** Film materials: transmitted light where the strip lies on the glass, a latent→developed colour state per frame
 *  (merged frame mesh: attribute aFrame indexes uDevelop) and a reveal edge for the unwinding intro.
 *  Full: MeshStandardMaterial; lite: MeshLambertMaterial (same map/emissive chunks, so the look is kept). */
function filmMaterial(lite:boolean,params:{map:THREE.Texture;roughness:number;alphaTest?:number;side?:THREE.Side},u:{field:{value:THREE.Matrix4};reveal:{value:number};backlight:number;glow:number;develop?:{value:number[]}}){
 const {roughness,...base}=params;
 const m=lite?new THREE.MeshLambertMaterial(base):new THREE.MeshStandardMaterial({...base,roughness,metalness:0});
 if(u.develop)m.defines={HERO_FRAMES:''};
 m.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uFieldInv:u.field,uReveal:u.reveal,uBacklight:{value:u.backlight},uGlow:{value:u.glow},uField:{value:new THREE.Vector3(GLASS.w/2,GLASS.d/2,GLASS.top)}},u.develop?{uDevelop:u.develop}:{});
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform mat4 uFieldInv;attribute float aStripU;varying vec3 vFieldPos;varying float vStripU;\n#ifdef HERO_FRAMES\nattribute float aFrame;varying float vFrame;\n#endif')
   .replace('#include <project_vertex>','#include <project_vertex>\nvFieldPos=(uFieldInv*modelMatrix*vec4(transformed,1.0)).xyz;vStripU=aStripU;\n#ifdef HERO_FRAMES\nvFrame=aFrame;\n#endif');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nuniform float uReveal,uBacklight,uGlow;uniform vec3 uField;varying vec3 vFieldPos;varying float vStripU;\n#ifdef HERO_FRAMES\nuniform float uDevelop[${N}];varying float vFrame;\n#endif`)
   .replace('#include <map_fragment>','#include <map_fragment>\nif(vStripU>uReveal)discard;\n#ifdef HERO_FRAMES\nfloat lum=dot(diffuseColor.rgb,vec3(.299,.587,.114));\ndiffuseColor.rgb=mix(vec3(lum)*vec3(.62,.42,.24)+vec3(.05,.03,.01),diffuseColor.rgb,uDevelop[int(vFrame+.5)]);\n#endif')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec2 fe=uField.xy-abs(vFieldPos.xz);float field=smoothstep(0.,.05,fe.x)*smoothstep(0.,.05,fe.y)*(1.-smoothstep(.01,.3,vFieldPos.y-uField.z));\nfield*=1.-.35*length(vFieldPos.xz/uField.xy)*.7;\ntotalEmissiveRadiance+=diffuseColor.rgb*(uBacklight*field+uGlow);');
 };
 m.customProgramCacheKey=()=>`hero-film-${lite?'l':'s'}-${u.develop?'f':'r'}-${u.backlight}-${u.glow}`;
 return m;
}

/** Ribbon strip geometry: `segments` columns × 2 rows (far edge v=1, near edge v=0). */
function stripGeometry(segments:number,uv:(a:number,far:boolean)=>[number,number],stripU:(a:number)=>number){
 const n=segments+1;const g=new THREE.BufferGeometry();
 const pos=new Float32Array(n*2*3),uvs=new Float32Array(n*2*2),su=new Float32Array(n*2);const index:number[]=[];
 for(let j=0;j<n;j++){const a=j/segments;for(const far of [true,false]){const k=j*2+(far?0:1);const [uu,vv]=uv(a,far);uvs[k*2]=uu;uvs[k*2+1]=vv;su[k]=stripU(a)}
  if(j<segments){const f=j*2,nr=j*2+1,f2=j*2+2,n2=j*2+3;index.push(f,nr,f2,f2,nr,n2)}}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2));g.setAttribute('aStripU',new THREE.BufferAttribute(su,1));g.setIndex(index);
 return g;
}

export async function mountFilmWorkspace(host:HTMLElement,ctx:SceneContext,opts:FilmWorkspaceOptions):Promise<SceneHandle>{
 const {signal}=ctx;const lite=ctx.profile==='lite';const k=lite?.5:1;
 const fonts=Promise.race([document.fonts.load(`500 20px ${MONO}`).catch(()=>[]),new Promise(r=>setTimeout(r,1200))]);
 const [gltf,images,contactMap,cadence]=await Promise.all([
  new GLTFLoader().loadAsync(MODEL[ctx.profile]),
  // lite: the 480 px renditions the DOM strip already loaded (cells are 256 px wide)
  Promise.all(heroFrames.map(f=>loadImage(lite?f.thumb:f.small,signal))),
  lite?new THREE.TextureLoader().loadAsync(CONTACT.src):Promise.resolve(null),
  lite?displayCadence(8,signal).catch(()=>16.7):Promise.resolve(16.7),
  fonts,
 ]);
 if(signal.aborted){disposeTree(gltf.scene);contactMap?.dispose();throw new DOMException('aborted','AbortError')}

 const undo:(()=>void)[]=[];   // teardown in reverse creation order (also used when the mount is aborted)
 const scene=new THREE.Scene();undo.push(()=>disposeTree(scene));
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,stencil:false,powerPreference:'default',failIfMajorPerformanceCaveat:lite});
 undo.push(()=>{const lostAlready=renderer.getContext().isContextLost();renderer.renderLists.dispose();renderer.dispose();if(!lostAlready)try{renderer.forceContextLoss()}catch{/* already lost */}});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=!lite;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
 const layer=document.createElement('div');layer.className='webgl-host hero-canvas';layer.setAttribute('aria-hidden','true');
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.tabIndex=-1;layer.appendChild(canvas);host.appendChild(layer);undo.push(()=>layer.remove());
 const destroyAll=()=>{for(const fn of undo.splice(0).reverse()){try{fn()}catch{/* best effort */}}};
 try{
  const aniso=Math.min(lite?4:8,renderer.capabilities.getMaxAnisotropy());
  renderer.debug.checkShaderErrors=process.env.NODE_ENV!=='production';
  await yieldToMain();throwIfAborted(signal);
  // Full: environment for the PBR cartridge — a 128 PMREM, generator (and its ping-pong target) freed at once.
  // Lite: no PMREM at all (its GGX prefilter pass was one 50–60 ms task at 4× CPU); the cartridge uses a matcap.
  let env:THREE.Texture|null=null;
  if(!lite){
   const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();
   const envRT=pmrem.fromScene(room,.04,.1,100,{size:128});room.dispose();pmrem.dispose();undo.push(()=>envRT.dispose());
   env=envRT.texture;scene.environment=env;scene.environmentIntensity=.32;
   await yieldToMain();throwIfAborted(signal);
  }
  const matcap=lite?releaseCanvasSource(matcapTexture(128)):null;

  const camera=new THREE.PerspectiveCamera(FOV,1,.1,60);
  const ws=new THREE.Group();scene.add(ws);
  const film=new THREE.Group();film.position.set(CART.x,0,CART.z);film.rotation.y=FILM_YAW;ws.add(film);

  // Lights: softbox key (full: shadows), enlarger above the glass, one faint safelight rim.
  const key=new THREE.DirectionalLight(0xfff2e2,1.25);key.position.copy(KEY);
  if(!lite){key.castShadow=true;Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-5,near:1,far:22});key.shadow.mapSize.set(1024,1024);key.shadow.radius=5;key.shadow.bias=-.0004;key.shadow.normalBias=.02}
  scene.add(key,key.target);
  const enlarger=new THREE.SpotLight(0xfff1de,34,0,.46,.85,2);enlarger.position.set(GLASS.x,6.4,GLASS.z-.2);ws.add(enlarger,enlarger.target);enlarger.target.position.set(GLASS.x,0,GLASS.z);
  const safelight=new THREE.PointLight(0xff3020,2.2,0,2);safelight.position.set(-4.6,1.7,-3.4);ws.add(safelight);

  // Table (fades into the atmosphere), light spill, light-table housing + glass. Lite: unlit Basic surfaces.
  const fade=releaseCanvasSource(radialTexture(.2,1,256*k));
  const table=new THREE.Mesh(new THREE.PlaneGeometry(15,11).rotateX(-Math.PI/2),lite
   ?new THREE.MeshBasicMaterial({color:0x0c0d0f,transparent:true,alphaMap:fade,depthWrite:false,toneMapped:false})
   :new THREE.MeshStandardMaterial({color:0x101214,roughness:.88,metalness:0,transparent:true,alphaMap:fade,depthWrite:false}));
  table.position.set(GLASS.x,0,GLASS.z+1);table.receiveShadow=!lite;ws.add(table);
  const spill=new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w*1.9,GLASS.d*2.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf3e6cf,alphaMap:releaseCanvasSource(radialTexture(0,1,256*k)),transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  spill.position.set(GLASS.x,.003,GLASS.z);ws.add(spill);
  const housing=new THREE.Mesh(new THREE.BoxGeometry(GLASS.w+.2,GLASS.top,GLASS.d+.2),lite
   ?new THREE.MeshBasicMaterial({color:0x24292c,toneMapped:false})
   :new THREE.MeshStandardMaterial({color:0x1b1f22,roughness:.5,metalness:.35}));
  housing.position.set(GLASS.x,GLASS.top/2-.001,GLASS.z);housing.receiveShadow=!lite;ws.add(housing);
  const glassMat=new THREE.MeshBasicMaterial({map:releaseCanvasSource(glassTexture(k)),toneMapped:false});
  await yieldToMain();throwIfAborted(signal);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w,GLASS.d).rotateX(-Math.PI/2),glassMat);glass.position.set(GLASS.x,GLASS.top+.0005,GLASS.z);ws.add(glass);
  const fieldFrame=new THREE.Object3D();fieldFrame.position.set(GLASS.x,0,GLASS.z);ws.add(fieldFrame);

  // Cartridge: lying on its side, spool towards the camera, leader slot turned to exit down-right.
  const cart=new THREE.Group();const spin=new THREE.Group();const model=gltf.scene;
  // The procedural strip starts at the named SlotExit; the model's own short leader is dropped so strip width and
  // perforations stay continuous (it still counts for the resting height, as before).
  model.updateMatrixWorld(true);
  const slot=model.getObjectByName('SlotExit');const tipLocal=slot?slot.getWorldPosition(new THREE.Vector3()):TIP.clone();
  const ownLeader=model.getObjectByName('Leader');
  const bakedEdges=model.getObjectByName('CartridgeEdges') as THREE.LineSegments|undefined;
  model.rotation.x=Math.PI/2;spin.rotation.z=THREE.MathUtils.degToRad(-60);spin.add(model);cart.add(spin);cart.scale.setScalar(S);
  film.add(cart);ws.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(model);const wsInv=new THREE.Matrix4().copy(film.matrixWorld).invert();
  box.applyMatrix4(wsInv);cart.position.y=-box.min.y;ws.updateMatrixWorld(true);
  if(ownLeader){ownLeader.removeFromParent();disposeTree(ownLeader)}
  const cartMats:(THREE.MeshStandardMaterial|THREE.MeshMatcapMaterial)[]=[];
  model.traverse(o=>{const mesh=o as THREE.Mesh;if(!mesh.isMesh)return;mesh.castShadow=!lite;mesh.receiveShadow=!lite;
   const std=mesh.material as THREE.MeshStandardMaterial;
   if(std.map)releaseCanvasSource(std.map);
   if(matcap){   // lite: base colour (AO baked in) × studio matcap; the ORM map is never uploaded
    for(const t of [std.roughnessMap,std.metalnessMap,std.aoMap,std.normalMap])if(t){(t.image as {close?:()=>void}|null)?.close?.();t.dispose()}
    const mat=new THREE.MeshMatcapMaterial({matcap,map:std.map,transparent:true,opacity:0,depthWrite:true});std.dispose();
    mesh.material=mat;cartMats.push(mat);return;
   }
   for(const t of [std.roughnessMap,std.metalnessMap,std.aoMap,std.normalMap])if(t)releaseCanvasSource(t);
   std.envMap=env;std.envMapIntensity=1.25;std.transparent=true;std.opacity=0;std.depthWrite=true;cartMats.push(std)});
  // Line drawing for the intro: the baked feature lines (glTF LINES `CartridgeEdges`), runtime EdgesGeometry as fallback.
  const edgeMat=new THREE.LineBasicMaterial({color:0xcfd4d7,transparent:true,opacity:.85,depthWrite:false});
  const edges:THREE.LineSegments[]=[];
  if(bakedEdges){(bakedEdges.material as THREE.Material).dispose();bakedEdges.material=edgeMat;edges.push(bakedEdges)}
  else{const meshes:THREE.Mesh[]=[];model.traverse(o=>{if((o as THREE.Mesh).isMesh)meshes.push(o as THREE.Mesh)});
   for(const m of meshes){const line=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,32),edgeMat);m.add(line);edges.push(line)}}
  const tip=model.localToWorld(tipLocal.clone()).applyMatrix4(wsInv);
  const dir=EXIT.clone().transformDirection(model.matrixWorld).transformDirection(wsInv);dir.z=0;dir.normalize();
  if(contactMap){   // lite: baked contact shadow instead of the shadow map (square to the world, centred under the spool axis)
   contactMap.colorSpace=THREE.SRGBColorSpace;releaseCanvasSource(contactMap);
   const e=CONTACT.extent*S;const quad=new THREE.Mesh(new THREE.PlaneGeometry(e,e).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,opacity:CONTACT.opacity,depthWrite:false,toneMapped:false}));
   const at=cart.getWorldPosition(new THREE.Vector3());quad.position.set(at.x,.0015,at.z);quad.renderOrder=1;ws.add(quad);
  }
  await yieldToMain();throwIfAborted(signal);

  // Film path: out of the slot, down onto the glass, across it, over the far edge onto the table.
  // film-local: x along the strip, z across; the glass edge is found along the yawed path.
  const zc=0,y=GLASS.top+.006,right=(GLASS.x+GLASS.w/2-CART.x)/Math.cos(FILM_YAW);
  const V=(x:number,yy:number)=>new THREE.Vector3(x,yy,zc);const land=tip.x+.8;
  const curve=new THREE.CurvePath<THREE.Vector3>();
  curve.add(new THREE.CubicBezierCurve3(tip.clone().setZ(zc),tip.clone().setZ(zc).addScaledVector(dir,.26),V(land-.34,y),V(land,y)));
  curve.add(new THREE.LineCurve3(V(land,y),V(right-.08,y)));
  curve.add(new THREE.CubicBezierCurve3(V(right-.08,y),V(right+.16,y),V(right+.22,.006),V(right+.5,.006)));
  curve.add(new THREE.LineCurve3(V(right+.5,.006),V(right+5,.006)));
  const L=curve.getLength();
  const at=(s:number,offset:number,out:THREE.Vector3)=>{const u=clamp01(s/L);const p=curve.getPointAt(u);const t=curve.getTangentAt(u);return out.set(p.x-t.y*offset,p.y+t.x*offset,zc)};

  const field={value:new THREE.Matrix4()};const reveal={value:-.01};
  fieldFrame.updateMatrixWorld(true);field.value.copy(fieldFrame.matrixWorld).invert();
  const stripMap=releaseCanvasSource(stripTexture({length:L,filmW:FILM_W,lead:LEAD,pitch:PITCH,frameW:FRAME_W,frameH:FRAME_H},aniso,k));
  await yieldToMain();throwIfAborted(signal);
  const ribbonGeo=stripGeometry(520,(a,far)=>[a,far?1:0],a=>a);
  {const p=ribbonGeo.attributes.position as THREE.BufferAttribute;const v=new THREE.Vector3();for(let j=0;j<=520;j++){at(j/520*L,0,v);p.setXYZ(j*2,v.x,v.y,zc-FILM_W/2);p.setXYZ(j*2+1,v.x,v.y,zc+FILM_W/2)}ribbonGeo.computeVertexNormals()}
  const ribbon=new THREE.Mesh(ribbonGeo,filmMaterial(lite,{map:stripMap,alphaTest:.5,side:THREE.DoubleSide,roughness:.42},{field,reveal,backlight:1.05,glow:.03}));
  ribbon.receiveShadow=!lite;film.add(ribbon);
  await yieldToMain();throwIfAborted(signal);

  // Frames (one mesh, one draw): strip pose (bent on the curve) ⇄ sheet pose (flat on the paper), CPU-morphed.
  const atlas=await photoAtlas(images,aniso,k,signal);releaseCanvasSource(atlas.map);
  const develop=heroFrames.map(()=>({value:0}));const developU={value:develop.map(()=>0)};
  const syncDevelop=()=>{for(let i=0;i<N;i++)developU.value[i]=develop[i].value};
  const fPos=new Float32Array(N*FV*3),fUv=new Float32Array(N*FV*2),fSu=new Float32Array(N*FV),fId=new Float32Array(N*FV),fIdx:number[]=[];
  const stripPose=new Float32Array(N*FV*3),sheetPose=new Float32Array(N*FV*3);
  const ground={strip:[] as THREE.Vector3[],sheet:[] as THREE.Vector3[]};
  {const cy=Math.cos(PAPER.yaw),sy=Math.sin(PAPER.yaw);const v=new THREE.Vector3(),w=new THREE.Vector3();const sw=FRAME_W*SHEET_SCALE,sh=FRAME_H*SHEET_SCALE;
   heroFrames.forEach((_,i)=>{
    const c=atlas.uv(i);const s0=LEAD+i*PITCH+(PITCH-FRAME_W)/2;
    const col=i%SHEET_COLUMNS,row=Math.floor(i/SHEET_COLUMNS);const ox=(col-1.5)*PAPER.colp,oz=PAPER.goy+(row-.5)*PAPER.rowp;
    for(let j=0;j<=SEG;j++){const a=j/SEG;at(s0+a*FRAME_W,.0035,v);
     for(const near of [0,1]){const q=i*FV+j*2+near;
      fUv[q*2]=c.u0+a*(c.u1-c.u0);fUv[q*2+1]=near?c.v0:c.v1;fSu[q]=(s0+a*FRAME_W)/L;fId[q]=i;
      stripPose[q*3]=v.x;stripPose[q*3+1]=v.y;stripPose[q*3+2]=zc+(near?FRAME_H/2:-FRAME_H/2);
      const lx=ox+(a-.5)*sw,lz=oz+(near?sh/2:-sh/2);w.set(PAPER.x+lx*cy+lz*sy,.0075,PAPER.z-lx*sy+lz*cy).applyMatrix4(wsInv);sheetPose[q*3]=w.x;sheetPose[q*3+1]=w.y;sheetPose[q*3+2]=w.z}
     if(j<SEG){const f=i*FV+j*2;fIdx.push(f,f+1,f+2,f+2,f+1,f+3)}}
    ground.strip.push(at(s0+FRAME_W/2,.0045,new THREE.Vector3()));   // just above the frames on the strip
    ground.sheet.push(new THREE.Vector3(PAPER.x+ox*cy+oz*sy,.0085,PAPER.z-ox*sy+oz*cy).applyMatrix4(wsInv));
   })}
  const frameGeo=new THREE.BufferGeometry();const posAttr=new THREE.BufferAttribute(fPos,3);
  frameGeo.setAttribute('position',posAttr);frameGeo.setAttribute('uv',new THREE.BufferAttribute(fUv,2));frameGeo.setAttribute('aStripU',new THREE.BufferAttribute(fSu,1));frameGeo.setAttribute('aFrame',new THREE.BufferAttribute(fId,1));frameGeo.setIndex(fIdx);
  const frames=new THREE.Mesh(frameGeo,filmMaterial(lite,{map:atlas.map,roughness:.55},{field,reveal,backlight:.5,glow:.24,develop:developU}));
  frames.frustumCulled=false;film.add(frames);

  // Lite: soft "lift" shadows under the frames (one instanced draw), driven by the same pose as the frames:
  // offset away from the key, size and opacity grow with the lift, invisible while a frame lies flat.
  let lifts:THREE.InstancedMesh|null=null;
  const away=new THREE.Vector3(-KEY.x,0,-KEY.z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),-FILM_YAW);const reach=Math.hypot(KEY.x,KEY.z)/KEY.y;
  if(lite){
   const m=new THREE.MeshBasicMaterial({color:0x000000,alphaMap:releaseCanvasSource(radialTexture(0,1,64)),transparent:true,depthWrite:false,toneMapped:false});
   m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\n#ifdef USE_COLOR\ndiffuseColor.a*=vColor.r;\n#endif')};
   m.customProgramCacheKey=()=>'hero-lift';
   lifts=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),m,N);lifts.frustumCulled=false;lifts.renderOrder=1;film.add(lifts);
  }
  const lm=new THREE.Matrix4(),lp=new THREE.Vector3(),ls=new THREE.Vector3(),lq=new THREE.Quaternion(),lc=new THREE.Color();

  const paperMat=lite?new THREE.MeshLambertMaterial({map:null}):new THREE.MeshStandardMaterial({roughness:.94,metalness:0});
  paperMat.map=releaseCanvasSource(await paperTexture({w:PAPER.w,d:PAPER.d,colp:PAPER.colp,rowp:PAPER.rowp,goy:PAPER.goy,frameW:FRAME_W*SHEET_SCALE,frameH:FRAME_H*SHEET_SCALE},aniso,k,images,signal));
  await yieldToMain();throwIfAborted(signal);
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(PAPER.w,PAPER.d).rotateX(-Math.PI/2),paperMat);
  paper.position.set(PAPER.x,.004,PAPER.z);paper.rotation.y=PAPER.yaw;paper.receiveShadow=!lite;ws.add(paper);
  const pencil=pencilTexture(k);const pencilMesh=new THREE.Mesh(new THREE.PlaneGeometry(FRAME_W*SHEET_SCALE*1.24,FRAME_H*SHEET_SCALE*1.34).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:pencil.map,transparent:true,depthWrite:false,toneMapped:false}));
  {const col=SELECTED_FRAME%SHEET_COLUMNS,row=Math.floor(SELECTED_FRAME/SHEET_COLUMNS);const ox=(col-1.5)*PAPER.colp,oz=PAPER.goy+(row-.5)*PAPER.rowp;
   pencilMesh.position.set(PAPER.x+ox*Math.cos(PAPER.yaw)+oz*Math.sin(PAPER.yaw),.009,PAPER.z-ox*Math.sin(PAPER.yaw)+oz*Math.cos(PAPER.yaw));pencilMesh.rotation.y=PAPER.yaw;ws.add(pencilMesh)}
  const drawInk=(t:number)=>{pencil.draw(t);pencilMesh.visible=t>0};

  // ── Poses ──
  let shadowDirty=!lite;
  const progress={value:opts.sheet?1:0};const travel=duration.hero,gap=stagger.normal*1.6,total=travel+gap*(N-1);
  const applyPoses=()=>{const t=progress.value*total;let lifting=false;
   for(let i=0;i<N;i++){const kk=ease.optical(clamp01((t-i*gap)/travel));const lift=Math.sin(Math.PI*kk)*.55;
    for(let q=i*FV*3,end=(i+1)*FV*3;q<end;q+=3){fPos[q]=stripPose[q]+(sheetPose[q]-stripPose[q])*kk;fPos[q+1]=stripPose[q+1]+(sheetPose[q+1]-stripPose[q+1])*kk+lift;fPos[q+2]=stripPose[q+2]+(sheetPose[q+2]-stripPose[q+2])*kk}
    if(lifts){const o=lift>.002?.42*Math.min(1,lift/.2):0;lifting||=o>0;
     lp.lerpVectors(ground.strip[i],ground.sheet[i],kk).addScaledVector(away,lift*reach);
     const grow=(1+lift*1.6)*(1+(SHEET_SCALE-1)*kk);ls.set(FRAME_W*grow,1,FRAME_H*grow);
     lifts.setMatrixAt(i,lm.compose(lp,lq,ls));lifts.setColorAt(i,lc.setRGB(o,o,o))}}
   posAttr.needsUpdate=true;frameGeo.computeVertexNormals();
   if(lifts){lifts.instanceMatrix.needsUpdate=true;if(lifts.instanceColor)lifts.instanceColor.needsUpdate=true;lifts.visible=lifting}
   paperMat.color.setScalar(.46+.54*progress.value);shadowDirty=!lite;
  };
  applyPoses();drawInk(opts.sheet?1:0);

  // ── Camera: nearly static; pointer = at most ±2.4° / ±1.4°, eased; mouse only ──
  const target=new THREE.Vector3(.2,0,.42);
  const view={az:0,el:0,taz:0,tel:0,dist:12};
  let devW=0,devH=0;
  const sizeTo=(force=false)=>{const w=layer.clientWidth||1,h=layer.clientHeight||1;camera.aspect=w/h;
   const tanV=Math.tan(THREE.MathUtils.degToRad(FOV/2));view.dist=Math.max(3.02/(tanV*camera.aspect),2.2/tanV);camera.updateProjectionMatrix();
   // the drawing buffer is only reallocated when its device size really changes (≥ 2 px) or the DPR step changed
   const dpr=cappedDpr(ctx.tier,w,h);const dw=Math.round(w*dpr),dh=Math.round(h*dpr);
   if(force||Math.abs(dw-devW)>=2||Math.abs(dh-devH)>=2){devW=dw;devH=dh;renderer.setPixelRatio(dpr);renderer.setSize(w,h,false)}};
  const place=()=>{const el=THREE.MathUtils.degToRad(ELEVATION)+view.el,az=view.az;
   camera.position.set(target.x+view.dist*Math.cos(el)*Math.sin(az),target.y+view.dist*Math.sin(el),target.z+view.dist*Math.cos(el)*Math.cos(az));camera.lookAt(target)};
  sizeTo(true);place();

  // ── Render on demand ──
  let raf=0,paused=false,lost=false,lastRender=-1e9,givingUp=false;
  const running=new Set<Animatable>();
  const animating=()=>{for(const a of running)if(!a.completed)return true;return false};
  const guard=lite?createFrameGuard({cadence,onStep:()=>{sizeTo(true);request()},onGiveUp:()=>{givingUp=true}}):null;
  const render=(now:number)=>{if(lost)return;lastRender=now;if(shadowDirty){renderer.shadowMap.needsUpdate=true;shadowDirty=false}renderer.render(scene,camera);if(guard&&animating())guard.frame(now)};
  const tick=(now:number)=>{raf=0;if(now-lastRender<RENDER_GAP){request();return}
   view.az+=(view.taz-view.az)*.08;view.el+=(view.tel-view.el)*.08;place();render(now);
   if(Math.abs(view.taz-view.az)>1e-4||Math.abs(view.tel-view.el)>1e-4)request()};
  function request(){if(!paused&&!lost&&!raf)raf=requestAnimationFrame(tick)}
  // Anime updates draw in a microtask at the end of the engine's frame callback (still before paint). Scheduling a rAF
  // from inside Anime's callback lands one frame late and — because Anime's own rAF is registered first — on every
  // other frame only (the old loop drew ~35 of ~83 intro frames even on desktop).
  let drawQueued=false;
  const invalidate=()=>{if(drawQueued||paused||lost)return;drawQueued=true;
   queueMicrotask(()=>{drawQueued=false;if(paused||lost)return;const now=performance.now();if(now-lastRender<RENDER_GAP){request();return}place();render(now)})};
  undo.push(()=>{paused=true;if(raf)cancelAnimationFrame(raf);raf=0});
  const track=<T extends Animatable>(a:T)=>{running.forEach(r=>{if(r.completed)running.delete(r)});running.add(a);return a};
  const drop=(a:Animatable|null)=>{if(a){a.pause();running.delete(a)}};
  undo.push(()=>{running.forEach(a=>a.revert());running.clear()});
  /** After a view's motion fully finished: report it, end guard sampling, hand over if the guard gave up. */
  const settle=()=>queueMicrotask(()=>{if(lost||animating())return;guard?.reset();opts.onSettled?.(progress.value>.5?'sheet':'strip');if(givingUp)ctx.onGiveUp()});

  // Intro (after the first presented frame; the canvas fades in over the DOM film): the line drawing develops into
  // the shaded object, the lamp comes on, the strip unwinds from the slot, the photographs develop.
  const lamp={value:.35};glassMat.color.setScalar(lamp.value);
  let intro:Animatable|null=null;
  const finishIntro=()=>{reveal.value=1.01;develop.forEach(d=>{d.value=1});syncDevelop();lamp.value=1;glassMat.color.setScalar(1);
   if(!lite){ribbon.castShadow=true;frames.castShadow=true;shadowDirty=true}
   cartMats.forEach(m=>{m.opacity=1});edges.forEach(e=>{e.visible=false});request();settle()};
  const playIntro=()=>{
   const tl=createTimeline({autoplay:false,defaults:{ease:ease.optical},onUpdate:()=>{syncDevelop();invalidate()},onComplete:finishIntro});
   tl.add(lamp,{value:1,duration:duration.section,onUpdate:()=>glassMat.color.setScalar(lamp.value)},0)
    .add(cartMats,{opacity:1,duration:duration.hero},140)
    .add(edgeMat,{opacity:0,duration:duration.hero},220)
    .add(reveal,{value:1.01,duration:duration.hero+240,ease:ease.advance},300);
   develop.forEach((d,i)=>tl.add(d,{value:1,duration:duration.section},500+i*43));
   intro=track(tl);tl.play();
  };

  // Strip ⇄ contact sheet. Metaphor: contact-sheet (frames lifted off the negative, laid in rows);
  // the grease pencil marks the selected frame once the sheet is complete (frame-lock).
  let move:Animatable|null=null;let mark:Animatable|null=null;
  const setSheet=(next:boolean)=>{
   if(intro&&!intro.completed)intro.complete();
   drop(move);drop(mark);
   const ink={value:next?0:1};
   move=track(animate(progress,{value:next?1:0,duration:Math.max(240,total*Math.abs((next?1:0)-progress.value)),ease:'linear',onUpdate:()=>{applyPoses();invalidate()},
    onComplete:()=>{if(next)mark=track(animate(ink,{value:1,duration:duration.section,ease:ease.shutter,onUpdate:()=>{drawInk(ink.value);invalidate()},onComplete:settle}));else settle()}}));
   if(!next)drawInk(0);request();
  };

  // Pointer (mouse only): bounded orbit offsets.
  const pointerTarget=opts.pointerTarget;
  const onMove=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=pointerTarget.getBoundingClientRect();
   const nx=((e.clientX-r.left)/r.width)*2-1,ny=((e.clientY-r.top)/r.height)*2-1;
   view.taz=THREE.MathUtils.degToRad(2.4)*Math.max(-1,Math.min(1,nx));view.tel=-THREE.MathUtils.degToRad(1.4)*Math.max(-1,Math.min(1,ny));request()};
  const onLeave=()=>{view.taz=0;view.tel=0;request()};
  pointerTarget.addEventListener('pointermove',onMove,{passive:true});pointerTarget.addEventListener('pointerleave',onLeave);
  undo.push(()=>{pointerTarget.removeEventListener('pointermove',onMove);pointerTarget.removeEventListener('pointerleave',onLeave)});
  // Resizes are coalesced to one per frame; the phone stage has a fixed height, so the view switch never resizes.
  let sizeRaf=0;
  const ro=new ResizeObserver(()=>{if(!sizeRaf)sizeRaf=requestAnimationFrame(()=>{sizeRaf=0;sizeTo();place();request()})});ro.observe(layer);
  undo.push(()=>{ro.disconnect();if(sizeRaf)cancelAnimationFrame(sizeRaf)});
  const onLost=(e:Event)=>{e.preventDefault();lost=true;paused=true;if(raf){cancelAnimationFrame(raf);raf=0}running.forEach(a=>{if(!a.completed)a.pause()});ctx.onLost()};
  canvas.addEventListener('webglcontextlost',onLost);undo.push(()=>canvas.removeEventListener('webglcontextlost',onLost));

  // ── Mount: warm up the GPU in short tasks, draw the first frame, then report ready and start the intro ──
  await prepareRenderer(renderer,scene,camera,signal);
  const sheetNow=opts.currentSheet?.()??opts.sheet;
  progress.value=sheetNow?1:0;applyPoses();drawInk(sheetNow?1:0);
  sizeTo();place();render(performance.now());
  await nextFrame(signal);
  ctx.onReady();opts.onApi({setSheet});undo.push(()=>opts.onApi(null));
  playIntro();

  return {
   pause(){paused=true;if(raf){cancelAnimationFrame(raf);raf=0}running.forEach(a=>{if(!a.completed)a.pause()});guard?.reset()},
   resume(){if(lost)return;paused=false;running.forEach(a=>{if(!a.completed)a.resume()});request()},
   destroy:destroyAll,
  };
 }catch(error){destroyAll();throw error}
}
