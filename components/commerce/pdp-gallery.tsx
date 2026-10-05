"use client";
// PDP visual stage: real packshots only. Multiple images → subtle 2.5D stack (CSS transforms,
// desktop + fine pointer only). Lens only for hardware. Lightbox for touch/keyboard (focus returns).
import {useRef,useState,type KeyboardEvent} from 'react';
import {ZoomIn,X,ChevronLeft,ChevronRight} from 'lucide-react';
import {Lens} from '@/components/ui/lens';
import {Dialog} from '@/components/dialog';
import {frameNo} from '@/components/analog/primitives';

export function PdpGallery({images,name,lens=false}:{images:string[];name:string;lens?:boolean}){
 const [active,setActive]=useState(0);const [box,setBox]=useState(false);
 const thumbs=useRef<HTMLDivElement>(null);
 const count=images.length;const multi=count>1;
 const go=(i:number)=>setActive((i+count)%count);
 const onThumbKey=(e:KeyboardEvent<HTMLDivElement>)=>{
  const dir=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
  if(!dir&&e.key!=='Home'&&e.key!=='End')return;
  e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?count-1:(active+dir+count)%count;
  setActive(next);thumbs.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
 };
 const alt=(i:number)=>multi?`${name}, Produktbild ${i+1} von ${count}`:name;
 const offset=(i:number)=>{let d=i-active;if(d>count/2)d-=count;if(d<-count/2)d+=count;return d};
 const front=<img className="pdp-plate-img" src={images[active]} alt={alt(active)} width={900} height={900} loading="eager" fetchPriority={active===0?'high':'auto'} decoding="async"/>;
 return <div className="pdp-gallery">
  <div className="pdp-stage" data-multi={count>2}>
   <span className="pdp-stage-code mono num" aria-hidden="true">{frameNo(active+1)}/{frameNo(count)}</span>
   {count>2&&<div className="pdp-stack" aria-hidden="true">
    {images.map((src,i)=>{const d=offset(i);if(d===0||Math.abs(d)>2)return null;
     return <img key={src} className="pdp-plate pdp-plate-back" data-offset={d} src={src} alt="" width={900} height={900} loading="lazy" decoding="async"/>})}
   </div>}
   <div className="pdp-plate pdp-plate-front" key={images[active]}>
    {lens?<Lens zoomFactor={2} lensSize={220} className="pdp-lens">{front}</Lens>:front}
   </div>
   <button type="button" className="pdp-zoom icon-btn" onClick={()=>setBox(true)} aria-label="Produktbild vergrößern" aria-haspopup="dialog"><ZoomIn size={18}/></button>
   {multi&&<div className="pdp-stage-nav">
    <button type="button" className="icon-btn" onClick={()=>go(active-1)} aria-label="Vorheriges Bild"><ChevronLeft size={18}/></button>
    <button type="button" className="icon-btn" onClick={()=>go(active+1)} aria-label="Nächstes Bild"><ChevronRight size={18}/></button>
   </div>}
  </div>
  {multi&&<div className="pdp-thumbs" ref={thumbs} role="group" aria-label="Produktbilder" onKeyDown={onThumbKey}>
   {images.map((src,i)=><button type="button" key={src} aria-pressed={active===i} aria-label={`Bild ${i+1} von ${count} zeigen`} tabIndex={active===i?0:-1} onClick={()=>setActive(i)}>
    <img src={src} alt="" width={96} height={96} loading="lazy" decoding="async"/><span className="mono num">{frameNo(i+1)}</span>
   </button>)}
  </div>}
  {lens&&<p className="pdp-lens-hint mono faint">Mit der Maus über das Bild fahren: Lupe · Klick auf <ZoomIn size={11} aria-hidden="true"/> öffnet die Großansicht</p>}
  <Dialog open={box} onClose={()=>setBox(false)} label={`${name} – Großansicht`} kind="lightbox" className="pdp-lightbox">
   <div className="lightbox-frame">
    <div className="lightbox-bar"><span className="mono">{frameNo(active+1)} / {frameNo(count)} · {name}</span><button type="button" className="icon-btn" onClick={()=>setBox(false)} aria-label="Großansicht schließen"><X size={20}/></button></div>
    <img src={images[active]} alt={alt(active)} width={1400} height={1400} decoding="async"/>
    {multi&&<div className="lightbox-nav"><button type="button" className="btn btn-light btn-sm" onClick={()=>go(active-1)}><ChevronLeft size={16}/>Zurück</button><button type="button" className="btn btn-light btn-sm" onClick={()=>go(active+1)}>Weiter<ChevronRight size={16}/></button></div>}
   </div>
  </Dialog>
 </div>;
}
