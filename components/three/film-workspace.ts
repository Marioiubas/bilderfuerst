"use client";
// Desktop WebGL enhancement of the home hero ("floating film workspace").
// One object scene: Higgsfield 135 cartridge (GLB) lying on a dark table, a procedural negative
// strip bent along a CatmullRom curve out of its leader slot, across an opal light table, and a
// contact-sheet paper. Real photographs ride on the strip as separate frame planes that can be
// laid out as a contact sheet. Photographic light only: softbox key, enlarger top light, one faint
// safelight rim. Rendered on demand (RAF only while Anime runs or the pointer easing settles).
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {animate} from 'animejs/animation';
import {createTimeline} from 'animejs/timeline';
import type {SceneHandle} from '@/hooks/use-webgl-scene';
import type {Tier} from '@/motion/setup';
import {cappedDpr,disposeTree} from '@/lib/webgl';
import {duration,ease,stagger} from '@/motion/tokens';
import {heroFrames,SELECTED_FRAME,SHEET_COLUMNS} from '../hero-frames';
import {glassTexture,loadImage,MONO,paperTexture,pencilTexture,photoAtlas,radialTexture,stripTexture} from './film-textures';

export type FilmWorkspaceApi={setSheet:(next:boolean)=>void};
export type FilmWorkspaceOptions={pointerTarget:HTMLElement;sheet:boolean;onApi:(api:FilmWorkspaceApi|null)=>void};
type Animatable={pause:()=>unknown;resume:()=>unknown;revert:()=>unknown;completed:boolean};

/* Scene units: the cartridge model is 1 unit long (≈ 45 mm). */
const S=1.3,FILM_W=.87,FRAME_W=FILM_W*36/35,FRAME_H=FILM_W*24/35,PITCH=FILM_W*38/35;
const LEAD=.92,SHEET_SCALE=.82;
const GLASS={x:.7,z:-.55,w:4.2,d:1.85,top:.072};
const PAPER={x:1.1,z:1.5,w:3.6,d:1.86,yaw:.026,colp:.84,rowp:.72,goy:.09};
/** Cartridge position; the film group pivots here by FILM_YAW so the strip crosses the glass diagonally. */
const CART={x:-2.25,z:-.68},FILM_YAW=-.12,FOV=22,ELEVATION=62;
/* Leader tongue tip and exit direction in GLB model space (measured from the mesh). */
const TIP=new THREE.Vector3(.085,0,-.3),EXIT=new THREE.Vector3(.78,0,-.62).normalize();

const backlightVertex='vFieldPos=(uFieldInv*modelMatrix*vec4(transformed,1.0)).xyz;vStripU=aStripU;';
/** Film materials: transmitted light where the strip lies on the glass, a latent→developed
 *  colour state and a reveal edge for the unwinding intro. */
function filmMaterial(params:THREE.MeshStandardMaterialParameters,u:{field:{value:THREE.Matrix4};reveal:{value:number};backlight:number;glow:number;develop?:{value:number}}){
 const m=new THREE.MeshStandardMaterial(params);
 const develop=u.develop??{value:1};
 m.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uFieldInv:u.field,uReveal:u.reveal,uBacklight:{value:u.backlight},uGlow:{value:u.glow},uDevelop:develop,uField:{value:new THREE.Vector3(GLASS.w/2,GLASS.d/2,GLASS.top)}});
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform mat4 uFieldInv;attribute float aStripU;varying vec3 vFieldPos;varying float vStripU;')
   .replace('#include <project_vertex>','#include <project_vertex>\n'+backlightVertex);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uReveal,uBacklight,uGlow,uDevelop;uniform vec3 uField;varying vec3 vFieldPos;varying float vStripU;')
   .replace('#include <map_fragment>','#include <map_fragment>\nif(vStripU>uReveal)discard;\nfloat lum=dot(diffuseColor.rgb,vec3(.299,.587,.114));\ndiffuseColor.rgb=mix(vec3(lum)*vec3(.62,.42,.24)+vec3(.05,.03,.01),diffuseColor.rgb,uDevelop);')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nvec2 fe=uField.xy-abs(vFieldPos.xz);float field=smoothstep(0.,.05,fe.x)*smoothstep(0.,.05,fe.y)*(1.-smoothstep(.01,.3,vFieldPos.y-uField.z));\nfield*=1.-.35*length(vFieldPos.xz/uField.xy)*.7;\ntotalEmissiveRadiance+=diffuseColor.rgb*(uBacklight*field+uGlow);');
 };
 m.customProgramCacheKey=()=>`hero-film-${u.backlight}-${u.glow}`;
 return m;
}

/** Ribbon/frame strip geometry: `segments` columns × 2 rows (far edge v=1, near edge v=0). */
function stripGeometry(segments:number,uv:(a:number,far:boolean)=>[number,number],stripU:(a:number)=>number){
 const n=segments+1;const g=new THREE.BufferGeometry();
 const pos=new Float32Array(n*2*3),uvs=new Float32Array(n*2*2),su=new Float32Array(n*2);const index:number[]=[];
 for(let j=0;j<n;j++){const a=j/segments;for(const far of [true,false]){const k=j*2+(far?0:1);const [uu,vv]=uv(a,far);uvs[k*2]=uu;uvs[k*2+1]=vv;su[k]=stripU(a)}
  if(j<segments){const f=j*2,nr=j*2+1,f2=j*2+2,n2=j*2+3;index.push(f,nr,f2,f2,nr,n2)}}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uvs,2));g.setAttribute('aStripU',new THREE.BufferAttribute(su,1));g.setIndex(index);
 return g;
}

export async function mountFilmWorkspace(host:HTMLElement,{tier,signal}:{tier:Tier;signal:AbortSignal},opts:FilmWorkspaceOptions):Promise<SceneHandle>{
 const fonts=Promise.race([document.fonts.load(`500 20px ${MONO}`).catch(()=>[]),new Promise(r=>setTimeout(r,1200))]);
 const [gltf,images]=await Promise.all([new GLTFLoader().loadAsync('/models/film-cartridge.glb'),Promise.all(heroFrames.map(f=>loadImage(f.small,signal))),fonts]);
 if(signal.aborted){disposeTree(gltf.scene);throw new DOMException('aborted','AbortError')}

 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});
 renderer.setPixelRatio(cappedDpr(tier==='desktop'?'desktop':'tablet'));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=true;
 const layer=document.createElement('div');layer.className='webgl-host hero-canvas';layer.setAttribute('aria-hidden','true');
 renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.tabIndex=-1;layer.appendChild(renderer.domElement);host.appendChild(layer);
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());

 const scene=new THREE.Scene();
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04).texture;room.dispose();
 scene.environment=env;scene.environmentIntensity=.32;
 const camera=new THREE.PerspectiveCamera(FOV,1,.1,60);
 const ws=new THREE.Group();scene.add(ws);
 const film=new THREE.Group();film.position.set(CART.x,0,CART.z);film.rotation.y=FILM_YAW;ws.add(film);

 // Lights: softbox key (shadows), enlarger above the glass, one faint safelight rim.
 const key=new THREE.DirectionalLight(0xfff2e2,1.25);key.position.set(-4.5,7.5,5.5);key.castShadow=true;
 Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-5,near:1,far:22});key.shadow.mapSize.set(1024,1024);key.shadow.radius=5;key.shadow.bias=-.0004;key.shadow.normalBias=.02;
 scene.add(key,key.target);
 const enlarger=new THREE.SpotLight(0xfff1de,34,0,.46,.85,2);enlarger.position.set(GLASS.x,6.4,GLASS.z-.2);ws.add(enlarger,enlarger.target);enlarger.target.position.set(GLASS.x,0,GLASS.z);
 const safelight=new THREE.PointLight(0xff3020,2.2,0,2);safelight.position.set(-4.6,1.7,-3.4);ws.add(safelight);

 // Table (fades into the Vanta fog), light spill, light-table housing + glass.
 const fade=radialTexture(.2,1);
 const table=new THREE.Mesh(new THREE.PlaneGeometry(15,11).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x101214,roughness:.88,metalness:0,transparent:true,alphaMap:fade,depthWrite:false}));
 table.position.set(GLASS.x,0,GLASS.z+1);table.receiveShadow=true;ws.add(table);
 const spill=new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w*1.9,GLASS.d*2.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf3e6cf,alphaMap:radialTexture(0,1),transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
 spill.position.set(GLASS.x,.003,GLASS.z);ws.add(spill);
 const housing=new THREE.Mesh(new THREE.BoxGeometry(GLASS.w+.2,GLASS.top,GLASS.d+.2),new THREE.MeshStandardMaterial({color:0x1b1f22,roughness:.5,metalness:.35}));
 housing.position.set(GLASS.x,GLASS.top/2-.001,GLASS.z);housing.receiveShadow=true;ws.add(housing);
 const glassMat=new THREE.MeshBasicMaterial({map:glassTexture(),toneMapped:false});
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w,GLASS.d).rotateX(-Math.PI/2),glassMat);glass.position.set(GLASS.x,GLASS.top+.0005,GLASS.z);ws.add(glass);
 const fieldFrame=new THREE.Object3D();fieldFrame.position.set(GLASS.x,0,GLASS.z);ws.add(fieldFrame);

 // Cartridge: lying on its side, spool towards the camera, leader slot turned to exit down-right.
 const cart=new THREE.Group();const spin=new THREE.Group();const model=gltf.scene;
 model.rotation.x=Math.PI/2;spin.rotation.z=THREE.MathUtils.degToRad(-60);spin.add(model);cart.add(spin);cart.scale.setScalar(S);
 film.add(cart);ws.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(model);const wsInv=new THREE.Matrix4().copy(film.matrixWorld).invert();
 box.applyMatrix4(wsInv);cart.position.y=-box.min.y;ws.updateMatrixWorld(true);
 const cartMats:THREE.MeshStandardMaterial[]=[];const edges:THREE.LineSegments[]=[];
 model.traverse(o=>{const mesh=o as THREE.Mesh;if(!mesh.isMesh)return;mesh.castShadow=true;mesh.receiveShadow=true;
  const mat=mesh.material as THREE.MeshStandardMaterial;mat.envMap=env;mat.envMapIntensity=1.25;mat.transparent=true;mat.opacity=0;mat.depthWrite=true;cartMats.push(mat);
  const line=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,32),new THREE.LineBasicMaterial({color:0xcfd4d7,transparent:true,opacity:.85,depthWrite:false}));mesh.add(line);edges.push(line)});
 const tip=model.localToWorld(TIP.clone()).applyMatrix4(wsInv);
 const dir=EXIT.clone().transformDirection(model.matrixWorld).transformDirection(wsInv);dir.z=0;dir.normalize();

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
 const at=(s:number,offset:number,out:THREE.Vector3)=>{const u=Math.min(1,Math.max(0,s/L));const p=curve.getPointAt(u);const t=curve.getTangentAt(u);return out.set(p.x-t.y*offset,p.y+t.x*offset,zc)};

 const field={value:new THREE.Matrix4()};const reveal={value:-.01};
 const updateField=()=>{fieldFrame.updateMatrixWorld(true);field.value.copy(fieldFrame.matrixWorld).invert()};updateField();
 const stripMap=stripTexture({length:L,filmW:FILM_W,lead:LEAD,pitch:PITCH,frameW:FRAME_W,frameH:FRAME_H},aniso);
 const ribbonGeo=stripGeometry(520,(a,far)=>[a,far?1:0],a=>a);
 {const p=ribbonGeo.attributes.position as THREE.BufferAttribute;const v=new THREE.Vector3();for(let j=0;j<=520;j++){at(j/520*L,0,v);p.setXYZ(j*2,v.x,v.y,zc-FILM_W/2);p.setXYZ(j*2+1,v.x,v.y,zc+FILM_W/2)}ribbonGeo.computeVertexNormals()}
 const ribbon=new THREE.Mesh(ribbonGeo,filmMaterial({map:stripMap,alphaTest:.5,side:THREE.DoubleSide,roughness:.42,metalness:0},{field,reveal,backlight:1.05,glow:.03}));
 ribbon.receiveShadow=true;film.add(ribbon);

 // Frames: strip pose (bent on the curve) ⇄ sheet pose (flat on the paper), CPU-morphed.
 const atlas=photoAtlas(images,aniso);const SEG=16;const filmInv=wsInv;
 const frames=heroFrames.map((_,i)=>{
  const c=atlas.uv(i);const s0=LEAD+i*PITCH+(PITCH-FRAME_W)/2;
  const geo=stripGeometry(SEG,(a,far)=>[c.u0+a*(c.u1-c.u0),far?c.v1:c.v0],a=>(s0+a*FRAME_W)/L);
  const develop={value:0};
  const mesh=new THREE.Mesh(geo,filmMaterial({map:atlas.map,roughness:.55,metalness:0},{field,reveal,backlight:.5,glow:.24,develop}));
  film.add(mesh);
  const strip=new Float32Array((SEG+1)*6),sheet=new Float32Array((SEG+1)*6);const v=new THREE.Vector3();
  const col=i%SHEET_COLUMNS,row=Math.floor(i/SHEET_COLUMNS);const ox=(col-1.5)*PAPER.colp,oz=PAPER.goy+(row-.5)*PAPER.rowp;const sw=FRAME_W*SHEET_SCALE,sh=FRAME_H*SHEET_SCALE;
  const cy=Math.cos(PAPER.yaw),sy=Math.sin(PAPER.yaw);const w=new THREE.Vector3();
  for(let j=0;j<=SEG;j++){const a=j/SEG;at(s0+a*FRAME_W,.0035,v);
   for(const near of [0,1]){const k=(j*2+near)*3;const dz=near?FRAME_H/2:-FRAME_H/2;strip[k]=v.x;strip[k+1]=v.y;strip[k+2]=zc+dz;
    const lx=ox+(a-.5)*sw,lz=oz+(near?sh/2:-sh/2);w.set(PAPER.x+lx*cy+lz*sy,.0075,PAPER.z-lx*sy+lz*cy).applyMatrix4(filmInv);sheet[k]=w.x;sheet[k+1]=w.y;sheet[k+2]=w.z}}
  return {mesh,strip,sheet,develop};
 });

 const paperMat=new THREE.MeshStandardMaterial({map:paperTexture({w:PAPER.w,d:PAPER.d,colp:PAPER.colp,rowp:PAPER.rowp,goy:PAPER.goy,frameW:FRAME_W*SHEET_SCALE,frameH:FRAME_H*SHEET_SCALE},aniso),roughness:.94,metalness:0});
 const paper=new THREE.Mesh(new THREE.PlaneGeometry(PAPER.w,PAPER.d).rotateX(-Math.PI/2),paperMat);
 paper.position.set(PAPER.x,.004,PAPER.z);paper.rotation.y=PAPER.yaw;paper.receiveShadow=true;ws.add(paper);
 const pencil=pencilTexture();const pencilMesh=new THREE.Mesh(new THREE.PlaneGeometry(FRAME_W*SHEET_SCALE*1.24,FRAME_H*SHEET_SCALE*1.34).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:pencil.map,transparent:true,depthWrite:false,toneMapped:false}));
 {const col=SELECTED_FRAME%SHEET_COLUMNS,row=Math.floor(SELECTED_FRAME/SHEET_COLUMNS);const ox=(col-1.5)*PAPER.colp,oz=PAPER.goy+(row-.5)*PAPER.rowp;
  pencilMesh.position.set(PAPER.x+ox*Math.cos(PAPER.yaw)+oz*Math.sin(PAPER.yaw),.009,PAPER.z-ox*Math.sin(PAPER.yaw)+oz*Math.cos(PAPER.yaw));pencilMesh.rotation.y=PAPER.yaw;ws.add(pencilMesh)}

 // ── Poses ──
 const progress={value:opts.sheet?1:0};const travel=duration.hero,gap=stagger.normal*1.6,total=travel+gap*(frames.length-1);
 const applyPoses=()=>{const t=progress.value*total;
  frames.forEach((f,i)=>{const k=ease.optical(Math.min(1,Math.max(0,(t-i*gap)/travel)));const lift=Math.sin(Math.PI*k)*.55;
   const p=f.mesh.geometry.attributes.position as THREE.BufferAttribute;const arr=p.array as Float32Array;
   for(let q=0;q<arr.length;q+=3){arr[q]=f.strip[q]+(f.sheet[q]-f.strip[q])*k;arr[q+1]=f.strip[q+1]+(f.sheet[q+1]-f.strip[q+1])*k+lift;arr[q+2]=f.strip[q+2]+(f.sheet[q+2]-f.strip[q+2])*k}
   p.needsUpdate=true;f.mesh.geometry.computeVertexNormals();f.mesh.geometry.computeBoundingSphere()});
  paperMat.color.setScalar(.46+.54*progress.value);
 };
 applyPoses();pencil.draw(opts.sheet?1:0);

 // ── Camera: nearly static; pointer = at most ±2.4° / ±1.4°, eased; mouse only ──
 const target=new THREE.Vector3(.2,0,.42);
 const view={az:0,el:0,taz:0,tel:0,dist:12};
 const fit=()=>{const w=host.clientWidth||1,h=host.clientHeight||1;camera.aspect=w/h;
  const tanV=Math.tan(THREE.MathUtils.degToRad(FOV/2));view.dist=Math.max(3.02/(tanV*camera.aspect),2.2/tanV);camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
 const place=()=>{const el=THREE.MathUtils.degToRad(ELEVATION)+view.el,az=view.az;
  camera.position.set(target.x+view.dist*Math.cos(el)*Math.sin(az),target.y+view.dist*Math.sin(el),target.z+view.dist*Math.cos(el)*Math.cos(az));camera.lookAt(target)};
 fit();place();

 // ── Render on demand ──
 let raf=0,paused=false,lost=false;
 const render=()=>{if(!lost)renderer.render(scene,camera)};
 const tick=()=>{raf=0;view.az+=(view.taz-view.az)*.08;view.el+=(view.tel-view.el)*.08;place();render();
  if(Math.abs(view.taz-view.az)>1e-4||Math.abs(view.tel-view.el)>1e-4)request()};
 const request=()=>{if(!paused&&!raf)raf=requestAnimationFrame(tick)};
 const running=new Set<Animatable>();
 const track=<T extends Animatable>(a:T)=>{running.forEach(r=>{if(r.completed)running.delete(r)});running.add(a);return a};
 const drop=(a:Animatable|null)=>{if(a){a.pause();running.delete(a)}};

 // Intro (the canvas fades in over the DOM film): line drawing develops into the shaded object,
 // the lamp comes on, the strip unwinds from the slot, the photographs develop.
 const lamp={value:.35};glassMat.color.setScalar(lamp.value);
 const intro=track(createTimeline({defaults:{ease:ease.optical},onUpdate:request,onComplete:()=>{
  reveal.value=1.01;ribbon.castShadow=true;frames.forEach(f=>{f.mesh.castShadow=true});cartMats.forEach(m=>{m.transparent=false;m.opacity=1;m.needsUpdate=true});edges.forEach(e=>{e.visible=false});request();
 }}));
 intro.add(lamp,{value:1,duration:duration.section,onUpdate:()=>glassMat.color.setScalar(lamp.value)},0)
  .add(cartMats,{opacity:1,duration:duration.hero},140)
  .add(edges.map(e=>e.material as THREE.LineBasicMaterial),{opacity:0,duration:duration.hero},220)
  .add(reveal,{value:1.01,duration:duration.hero+240,ease:ease.advance},300);
 frames.forEach((f,i)=>intro.add(f.develop,{value:1,duration:duration.section},500+i*43));

 // Strip ⇄ contact sheet. Metaphor: contact-sheet (frames lifted off the negative, laid in rows);
 // the grease pencil marks the selected frame once the sheet is complete (frame-lock).
 let move:Animatable|null=null;let mark:Animatable|null=null;
 const setSheet=(next:boolean)=>{
  if(!intro.completed)intro.complete();
  drop(move);drop(mark);
  const ink={value:next?0:1};
  move=track(animate(progress,{value:next?1:0,duration:Math.max(240,total*Math.abs((next?1:0)-progress.value)),ease:'linear',onUpdate:()=>{applyPoses();request()},
   onComplete:()=>{if(next)mark=track(animate(ink,{value:1,duration:duration.section,ease:ease.shutter,onUpdate:()=>{pencil.draw(ink.value);request()}}))}}));
  if(!next)pencil.draw(0);request();
 };
 opts.onApi({setSheet});

 // Pointer (mouse only): bounded orbit offsets.
 const pointerTarget=opts.pointerTarget;
 const onMove=(e:PointerEvent)=>{if(e.pointerType!=='mouse')return;const r=pointerTarget.getBoundingClientRect();
  const nx=((e.clientX-r.left)/r.width)*2-1,ny=((e.clientY-r.top)/r.height)*2-1;
  view.taz=THREE.MathUtils.degToRad(2.4)*Math.max(-1,Math.min(1,nx));view.tel=-THREE.MathUtils.degToRad(1.4)*Math.max(-1,Math.min(1,ny));request()};
 const onLeave=()=>{view.taz=0;view.tel=0;request()};
 pointerTarget.addEventListener('pointermove',onMove,{passive:true});pointerTarget.addEventListener('pointerleave',onLeave);
 const ro=new ResizeObserver(()=>{fit();place();request()});ro.observe(host);
 const onLost=(e:Event)=>{e.preventDefault();lost=true;host.dataset.webgl='failed'};
 renderer.domElement.addEventListener('webglcontextlost',onLost);

 render();
 return {
  pause(){paused=true;if(raf){cancelAnimationFrame(raf);raf=0}running.forEach(a=>{if(!a.completed)a.pause()})},
  resume(){paused=false;running.forEach(a=>{if(!a.completed)a.resume()});request()},
  destroy(){
   paused=true;if(raf)cancelAnimationFrame(raf);running.forEach(a=>a.revert());running.clear();opts.onApi(null);
   pointerTarget.removeEventListener('pointermove',onMove);pointerTarget.removeEventListener('pointerleave',onLeave);ro.disconnect();
   renderer.domElement.removeEventListener('webglcontextlost',onLost);
   disposeTree(scene);env.dispose();pmrem.dispose();renderer.renderLists.dispose();renderer.dispose();
   try{renderer.forceContextLoss()}catch{/* already lost */}
   layer.remove();
  },
 };
}
