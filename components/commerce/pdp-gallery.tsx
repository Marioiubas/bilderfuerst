"use client";
// PDP visual stage: real packshots only. Multiple images → subtle 2.5D stack (CSS transforms,
// desktop + fine pointer only). Lens only for hardware. Tap/click on the photo or the zoom button opens
// the lightbox (touch/keyboard path, focus returns). Audit M1: a photo is never drawn larger than its
// source pixels (stage + lightbox use the natural size as the box, centred, object-fit: contain).
import {useCallback,useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {ZoomIn,X,ChevronLeft,ChevronRight} from 'lucide-react';
import {Lens} from '@/components/ui/lens';
import {Dialog} from '@/components/dialog';
import {frameNo} from '@/components/analog/primitives';
import {imageSize} from './image-sizes';

const FALLBACK:[number,number]=[900,900];

export function PdpGallery({images,name,lens=false}:{images:string[];name:string;lens?:boolean}){
 const [active,setActive]=useState(0);const [box,setBox]=useState(false);
 const [loaded,setLoaded]=useState<Record<string,[number,number]>>({});
 const [capped,setCapped]=useState(false);const [boxCapped,setBoxCapped]=useState(false);
 const thumbs=useRef<HTMLDivElement>(null);const plate=useRef<HTMLDivElement>(null);const lightStage=useRef<HTMLDivElement>(null);const img=useRef<HTMLImageElement>(null);
 const count=images.length;const multi=count>1;
 const src=images[active];
 const [w,h]=imageSize(src)??loaded[src]??FALLBACK;
 const go=(i:number)=>setActive((i+count)%count);
 const onThumbKey=(e:KeyboardEvent<HTMLDivElement>)=>{
  const dir=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
  if(!dir&&e.key!=='Home'&&e.key!=='End')return;
  e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?count-1:(active+dir+count)%count;
  setActive(next);thumbs.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
 };
 // Images outside the generated size table: read the real pixels once loaded (also when cached before hydration).
 const learn=useCallback((el:HTMLImageElement|null)=>{if(el&&el.complete&&el.naturalWidth&&!imageSize(el.getAttribute('src')??'')){const s=el.getAttribute('src')!;setLoaded(m=>m[s]?m:{...m,[s]:[el.naturalWidth,el.naturalHeight]})}},[]);
 useEffect(()=>{learn(img.current)},[src,learn]);
 // "Originalgröße" note only when the source is smaller than the stage plate at this viewport.
 useEffect(()=>{
  const el=plate.current;if(!el)return;
  const check=()=>setCapped(w<el.clientWidth-1&&h<el.clientHeight-1);
  check();const ro=new ResizeObserver(check);ro.observe(el);return()=>ro.disconnect();
 },[src,w,h]);
 useEffect(()=>{
  if(!box)return;
  const id=requestAnimationFrame(()=>{const el=lightStage.current;if(el)setBoxCapped(w<el.clientWidth-1&&h<window.innerHeight*.78-1)});
  return()=>cancelAnimationFrame(id);
 },[box,w,h]);
 const alt=(i:number)=>multi?`${name}, Produktbild ${i+1} von ${count}`:name;
 const offset=(i:number)=>{let d=i-active;if(d>count/2)d-=count;if(d<-count/2)d+=count;return d};
 const front=<img ref={img} className="pdp-plate-img" src={src} alt={alt(active)} width={w} height={h} loading="eager" fetchPriority={active===0?'high':'auto'} decoding="async" onLoad={e=>learn(e.currentTarget)}/>;
 return <div className="pdp-gallery">
  <div className="pdp-stage" data-multi={count>2}>
   <span className="pdp-stage-code mono num" aria-hidden="true">{frameNo(active+1)}/{frameNo(count)}</span>
   {count>2&&<div className="pdp-stack" aria-hidden="true">
    {images.map((s,i)=>{const d=offset(i);if(d===0||Math.abs(d)>2)return null;
     return <img key={s} className="pdp-plate pdp-plate-back" data-offset={d} src={s} alt="" width={900} height={900} loading="lazy" decoding="async"/>})}
   </div>}
   <div ref={plate} className="pdp-plate pdp-plate-front" key={src} onClick={()=>setBox(true)}>
    {lens?<Lens zoomFactor={2} lensSize={220} className="pdp-lens">{front}</Lens>:front}
   </div>
   <button type="button" className="pdp-zoom icon-btn" onClick={()=>setBox(true)} aria-label="Produktbild vergrößern" aria-haspopup="dialog"><ZoomIn size={18}/></button>
   {multi&&<div className="pdp-stage-nav">
    <button type="button" className="icon-btn" onClick={()=>go(active-1)} aria-label="Vorheriges Bild"><ChevronLeft size={18}/></button>
    <button type="button" className="icon-btn" onClick={()=>go(active+1)} aria-label="Nächstes Bild"><ChevronRight size={18}/></button>
   </div>}
  </div>
  {multi&&<div className="pdp-thumbs" ref={thumbs} role="group" aria-label="Produktbilder" onKeyDown={onThumbKey}>
   {images.map((s,i)=><button type="button" key={s} aria-pressed={active===i} aria-label={`Bild ${i+1} von ${count} zeigen`} tabIndex={active===i?0:-1} onClick={()=>setActive(i)}>
    <img src={s} alt="" width={96} height={96} loading="lazy" decoding="async"/><span className="mono num" aria-hidden="true">{frameNo(i+1)}</span>
   </button>)}
  </div>}
  {(lens||capped)&&<p className="pdp-hint mono">
   {lens&&<><span className="hint-mouse">Lupe: mit der Maus über das Foto fahren · Klick öffnet die Großansicht</span><span className="hint-touch">Tippen zum Vergrößern</span></>}
   {capped&&<span className="pdp-native">Produktfoto in Originalgröße der Quelle · {w} × {h} px</span>}
  </p>}
  <Dialog open={box} onClose={()=>setBox(false)} label={`${name} – Großansicht`} kind="lightbox" className="pdp-lightbox">
   <div className="lightbox-frame">
    <div className="lightbox-bar"><span className="mono">{frameNo(active+1)} / {frameNo(count)} · {name}</span><button type="button" className="icon-btn" onClick={()=>setBox(false)} aria-label="Großansicht schließen"><X size={20}/></button></div>
    <div className="lightbox-stage" ref={lightStage}><img src={src} alt={alt(active)} width={w} height={h} decoding="async"/></div>
    {boxCapped&&<p className="lightbox-note mono">Originalgröße der Quelle · {w} × {h} px · nicht hochgerechnet</p>}
    {multi&&<div className="lightbox-nav"><button type="button" className="btn btn-light btn-sm" onClick={()=>go(active-1)}><ChevronLeft size={16}/>Zurück</button><button type="button" className="btn btn-light btn-sm" onClick={()=>go(active+1)}>Weiter<ChevronRight size={16}/></button></div>}
   </div>
  </Dialog>
 </div>;
}
