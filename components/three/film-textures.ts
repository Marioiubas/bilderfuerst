"use client";
// Canvas textures for the hero film workspace: photo atlas, negative strip, light-table glass,
// contact-sheet paper and the grease-pencil mark. Drawn once (the pencil redraws while it is drawn).
// `scale` sizes every canvas and its type/lines together: 1 = desktop, .5 = the lite (phone) profile
// (strip 2048×128, atlas 1024×342, paper 700×362, glass 512×256, pencil 256×192, radials 128²).
import * as THREE from 'three';
import {drawImageSliced,textureCanvas} from '@/lib/webgl';
import {heroFrames,SHEET_COLUMNS} from '../hero-frames';

export const MONO='"IBM Plex Mono", ui-monospace, monospace';
const CELL_W=512,CELL_H=342;

export function loadImage(src:string,signal:AbortSignal){
 return new Promise<HTMLImageElement>((resolve,reject)=>{
  const img=new Image();img.decoding='async';
  const abort=()=>{img.src='';reject(new DOMException('aborted','AbortError'))};
  signal.addEventListener('abort',abort,{once:true});
  img.onload=()=>{signal.removeEventListener('abort',abort);img.decode().then(()=>resolve(img),()=>resolve(img))};
  img.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error(`image ${src}`))};
  img.src=src;
 });
}

// Type, gradients and perforations use ordinary (GPU-rasterised) canvases. Canvases that receive photographs are
// CPU-backed (textureCanvas) so each photo can be rasterised in its own task (drawImageSliced).
function canvas(w:number,h:number){const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);return [c,c.getContext('2d')!] as const}
function texture(c:HTMLCanvasElement,anisotropy:number,srgb=true){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;return t}

/** Real photographs, cropped to 3:2 like a 35 mm frame, 4 × 2 cells (one photo per task). */
export async function photoAtlas(images:HTMLImageElement[],anisotropy:number,scale=1,signal?:AbortSignal){
 const cw=Math.round(CELL_W*scale),ch=Math.round(CELL_H*scale);
 const [c,g]=textureCanvas(cw*4,ch*2);g.imageSmoothingQuality='high';
 for(const [i,img] of images.entries()){
  const x=(i%4)*cw,y=Math.floor(i/4)*ch;const r=img.naturalWidth/img.naturalHeight,target=cw/ch;
  let sw=img.naturalWidth,sh=img.naturalHeight,sx=0,sy=0;
  if(r>target){sw=sh*target;sx=(img.naturalWidth-sw)/2}else{sh=sw/target;sy=(img.naturalHeight-sh)/2}
  await drawImageSliced(g,img,sx,sy,sw,sh,x,y,cw,ch,signal);
 }
 const map=texture(c,anisotropy);
 const uv=(i:number)=>{const col=i%4,row=Math.floor(i/4);return {u0:col/4,u1:(col+1)/4,v0:1-(row+1)/2,v1:1-row/2}};
 return {map,uv};
}

/** Negative strip: orange C-41 mask base, perforations (alpha), edge print and captions. */
export function stripTexture(o:{length:number;filmW:number;lead:number;pitch:number;frameW:number;frameH:number},anisotropy:number,scale=1){
 const W=4096*scale,H=256*scale,s=scale;const [c,g]=canvas(W,H);const px=W/o.length;const py=H/o.filmW;
 const base=g.createLinearGradient(0,0,0,H);base.addColorStop(0,'#7a3d14');base.addColorStop(.5,'#8a4618');base.addColorStop(1,'#7a3d14');
 g.fillStyle=base;g.fillRect(0,0,W,H);
 const top=(H-o.frameH*py)/2;
 heroFrames.forEach((f,i)=>{
  const x=(o.lead+i*o.pitch)*px;
  g.fillStyle='rgba(255,226,186,.16)';g.fillRect(x,top,o.frameW*px,o.frameH*py);
  g.strokeStyle='rgba(20,10,4,.55)';g.lineWidth=Math.max(1,2*s);g.strokeRect(x,top,o.frameW*px,o.frameH*py);
  g.font=`500 ${15*s}px ${MONO}`;g.fillStyle='#e3a13c';g.textBaseline='middle';
  g.fillText(`▸ ${f.edge}`,x+4*s,top-12*s);g.fillText(`${f.edge}A`,x+o.pitch*px*.55,top-12*s);
  g.font=`500 ${17*s}px ${MONO}`;g.fillStyle='rgba(246,226,194,.94)';
  g.fillText(`${String(i+1).padStart(2,'0')} ${f.caption.toUpperCase()}`,x+2*s,H-top+15*s);
 });
 // perforations: 8 per frame pitch, cut out of the base
 const perf=o.pitch/8*px,holeW=perf*.59,holeH=.0566*H,edge=.0854*H;
 g.globalCompositeOperation='destination-out';
 for(let x=perf*.2;x<W;x+=perf){for(const cy of [edge,H-edge]){g.beginPath();g.roundRect(x,cy-holeH/2,holeW,holeH,3*s);g.fill()}}
 g.globalCompositeOperation='source-over';
 return texture(c,anisotropy);
}

/** Opal glass of the light table (unlit, the light source itself). */
export function glassTexture(scale=1){
 const [c,g]=canvas(1024*scale,512*scale);g.scale(scale,scale);
 const r=g.createRadialGradient(470,236,40,512,256,640);r.addColorStop(0,'#f0ebe0');r.addColorStop(.5,'#ddd7c9');r.addColorStop(1,'#a9a498');
 g.fillStyle=r;g.fillRect(0,0,1024,512);
 g.strokeStyle='rgba(10,11,12,.06)';g.lineWidth=2;
 for(let i=1;i<4;i++){g.beginPath();g.moveTo(i*256,0);g.lineTo(i*256,512);g.moveTo(0,i*128);g.lineTo(1024,i*128);g.stroke()}
 g.strokeStyle='rgba(10,11,12,.4)';g.beginPath();g.moveTo(26,40);g.lineTo(54,40);g.moveTo(40,26);g.lineTo(40,54);g.stroke();
 g.font=`500 17px ${MONO}`;g.fillStyle='rgba(10,11,12,.5)';g.textAlign='right';g.fillText('LTB-01 · LEUCHTPULT',1000,44);
 return texture(c,4);
}

/** Contact-sheet paper: header, dashed slots and frame captions (printed below each slot). With `proofs`, each slot
 *  also carries a faint warm earlier proof of its frame (audit D2: the sheet never reads as an empty grid); the real
 *  frames cover them exactly when they are laid on the sheet. */
export async function paperTexture(o:{w:number;d:number;colp:number;rowp:number;goy:number;frameW:number;frameH:number},anisotropy:number,scale=1,proofs?:HTMLImageElement[],signal?:AbortSignal){
 const W=Math.round(1400*scale),H=Math.round(W*o.d/o.w);const [c,g]=proofs?textureCanvas(W,H):canvas(W,H);const k=W/o.w;const f=W/2048;
 const p=g.createLinearGradient(0,0,W,H);p.addColorStop(0,'#e9eae7');p.addColorStop(1,'#d7d9d5');g.fillStyle=p;g.fillRect(0,0,W,H);
 g.fillStyle='rgba(18,20,22,.78)';g.font=`500 ${Math.round(30*f)}px ${MONO}`;g.textBaseline='alphabetic';
 g.fillText('KONTAKTBOGEN',70*f,86*f);g.textAlign='right';g.fillStyle='rgba(18,20,22,.6)';g.fillText('135 · NR. 12–19',W-70*f,86*f);g.textAlign='left';
 g.fillStyle='rgba(18,20,22,.3)';g.fillRect(70*f,104*f,W-140*f,Math.max(1,2*scale));
 for(const [i,fr] of heroFrames.entries()){
  const col=i%SHEET_COLUMNS,row=Math.floor(i/SHEET_COLUMNS);
  const cx=W/2+(col-1.5)*o.colp*k,cy=H/2+(o.goy+(row-.5)*o.rowp)*k;const fw=o.frameW*k,fh=o.frameH*k;
  const img=proofs?.[i];
  if(img?.naturalWidth){   // cover-crop to the 3:2 slot, ~30 % on the paper, warmed by a sepia multiply
   const r=img.naturalWidth/img.naturalHeight,t=fw/fh;let sw=img.naturalWidth,sh=img.naturalHeight,sx=0,sy=0;
   if(r>t){sw=sh*t;sx=(img.naturalWidth-sw)/2}else{sh=sw/t;sy=(img.naturalHeight-sh)/2}
   g.save();g.globalAlpha=.3;await drawImageSliced(g,img,sx,sy,sw,sh,cx-fw/2,cy-fh/2,fw,fh,signal);
   g.globalAlpha=.55;g.globalCompositeOperation='multiply';g.fillStyle='#d9b98c';g.fillRect(cx-fw/2,cy-fh/2,fw,fh);g.restore();
  }
  g.setLineDash([10*f,8*f]);g.strokeStyle='rgba(18,20,22,.28)';g.lineWidth=Math.max(1,2*scale);g.strokeRect(cx-fw/2,cy-fh/2,fw,fh);g.setLineDash([]);
  g.font=`500 ${Math.round(22*f)}px ${MONO}`;g.fillStyle='rgba(18,20,22,.82)';
  g.fillText(`${String(i+1).padStart(2,'0')} ${fr.caption.toUpperCase()}`,cx-fw/2,cy+fh/2+30*f);
 }
 return texture(c,anisotropy);
}

/** Grease pencil around the selected frame; `draw(t)` renders the stroke up to t ∈ [0,1]. */
export function pencilTexture(scale=1){
 const [c,g]=canvas(512*scale,384*scale);g.scale(scale,scale);const t=texture(c,4);
 const path=new Path2D('M26 40 C128 18 333 22 482 31 C495 115 490 256 478 352 C341 365 145 361 34 348 C21 256 17 132 30 26 L60 18');
 const length=1900;
 const draw=(progress:number)=>{g.clearRect(0,0,512,384);if(progress<=0){t.needsUpdate=true;return}
  g.strokeStyle='#d12f26';g.lineWidth=11;g.lineCap='round';g.lineJoin='round';g.setLineDash([length*progress,length]);g.stroke(path);t.needsUpdate=true};
 return {map:t,draw};
}

/** Soft radial alpha used to fade the table into the atmosphere, for the light spill and the lift shadows. */
export function radialTexture(inner:number,outer:number,size=256){
 const h=size/2;const [c,g]=canvas(size,size);const r=g.createRadialGradient(h,h,inner*h,h,h,outer*h);r.addColorStop(0,'#fff');r.addColorStop(1,'#000');
 g.fillStyle=r;g.fillRect(0,0,size,size);return texture(c,1,false);
}

/** Studio matcap for the lite cartridge (view-space shading without lights or an environment pass): a graphite sphere
 *  with the softbox key upper left, a small fill on the right, a faint safelight glint and a cool rim — close to the
 *  desktop PBR read of the brushed shell (the base colour darkens the caps and felt). */
export function matcapTexture(size=128){
 const [c,g]=canvas(size,size);const s=size/2;g.scale(s,s);g.translate(1,1);
 const base=g.createRadialGradient(-.15,-.2,.1,0,0,1);base.addColorStop(0,'#8f959b');base.addColorStop(.55,'#52575d');base.addColorStop(1,'#1c1f23');
 g.fillStyle=base;g.fillRect(-1,-1,2,2);
 const spot=(x:number,y:number,r:number,a:number)=>{const h=g.createRadialGradient(x,y,0,x,y,r);h.addColorStop(0,`rgba(255,250,242,${a})`);h.addColorStop(1,'rgba(255,250,242,0)');g.fillStyle=h;g.fillRect(-1,-1,2,2)};
 spot(-.42,-.48,.62,.95);spot(.55,-.3,.3,.4);
 const safe=g.createRadialGradient(-.9,.15,0,-.9,.15,.45);safe.addColorStop(0,'rgba(255,60,40,.22)');safe.addColorStop(1,'rgba(255,60,40,0)');g.fillStyle=safe;g.fillRect(-1,-1,2,2);
 const rim=g.createRadialGradient(0,0,.78,0,0,1);rim.addColorStop(0,'rgba(170,182,192,0)');rim.addColorStop(1,'rgba(170,182,192,.28)');g.fillStyle=rim;g.fillRect(-1,-1,2,2);
 return texture(c,1);
}

