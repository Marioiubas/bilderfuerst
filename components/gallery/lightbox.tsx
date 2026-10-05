"use client";
// Lightbox for one print, opened through the Street Gallery's signature aperture (only used on /galerie).
// Escape, backdrop click and the close button run the quick closing iris, then close the native <dialog>.
import {useCallback,useEffect,useRef,type CSSProperties,type KeyboardEvent} from 'react';
import {Dialog} from '@/components/dialog';
import {track} from '@/lib/analytics';
import {apertureClose,apertureHold,apertureOpen,type Revertible} from '@/motion/gallery';
import {prints} from './prints';
import {placeLabel} from './print-wall';

const Arrow=({dir}:{dir:'l'|'r'})=><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={dir==='r'?'M2 8h11M9 4l4 4-4 4':'M14 8H3M7 4L3 8l4 4'}/></svg>;

export function PrintLightbox({index,onIndex,onClose}:{index:number|null;onIndex:(i:number)=>void;onClose:()=>void}){
 const svgRef=useRef<SVGSVGElement>(null);const imgRef=useRef<HTMLImageElement>(null);
 const closing=useRef<Revertible|null>(null);const opened=useRef(false);
 const p=index===null?null:prints[index];

 useEffect(()=>{
  if(index===null){opened.current=false;return}
  const svg=svgRef.current,img=imgRef.current;if(!img)return;
  const fast=opened.current;opened.current=true;
  track('open_gallery',{view:'print',print:prints[index].id});
  let anim:Revertible|undefined;let done=false;
  const run=()=>{if(done)return;done=true;img.style.opacity='';anim=apertureOpen(svg,img,{fast})};
  if(img.complete&&img.naturalWidth)run();
  else{apertureHold(svg,img);img.addEventListener('load',run,{once:true});img.addEventListener('error',run,{once:true})}
  const timeout=window.setTimeout(run,900);
  return()=>{done=true;window.clearTimeout(timeout);img.removeEventListener('load',run);img.removeEventListener('error',run);anim?.revert();img.style.opacity=''};
 },[index]);

 const requestClose=useCallback(()=>{
  if(closing.current)return;
  closing.current=apertureClose(svgRef.current,()=>{closing.current=null;onClose()});
 },[onClose]);
 useEffect(()=>()=>closing.current?.revert(),[]);

 const step=(d:number)=>{if(index!==null)onIndex((index+d+prints.length)%prints.length)};
 const key=(e:KeyboardEvent)=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}};

 return <Dialog open={index!==null} onClose={requestClose} kind="lightbox" className="gal-lightbox" label={p?`Druck ${p.id} von ${prints.length}: ${p.title}`:'Galeriebild'}>
  {p&&<div className="gal-lb" onKeyDown={key}>
   <div className="gal-lb-stage" style={{'--ar':p.lw/p.lh} as CSSProperties}>
    <img ref={imgRef} key={p.id} src={p.large} width={p.lw} height={p.lh} alt={p.alt} decoding="async"/>
    <svg ref={svgRef} key={`iris-${p.id}`} className="gal-iris" aria-hidden="true" focusable="false"><path data-iris="mask" fillRule="evenodd" d="M0 0H9999V9999H0Z"/><path data-iris="edges"/></svg>
   </div>
   <div className="gal-lb-side">
    <div className="gal-lb-top">
     <p className="mono"><span className="num">{p.id} / {prints.length}</span> · {placeLabel(p)}</p>
     <button type="button" className="icon-btn gal-lb-close" onClick={requestClose} aria-label="Lightbox schließen"><svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15"/></svg></button>
    </div>
    <h2 className="gal-lb-title">{p.title}</h2>
    <p className="gal-lb-cap">{p.caption}</p>
    <dl className="gal-lb-data">
     <div><dt>Hängung</dt><dd>{placeLabel(p)} · {p.slot}</dd></div>
     <div><dt>Quelle</dt><dd>{p.source}</dd></div>
     <div><dt>Kamera · Fotograf</dt><dd>nicht angegeben</dd></div>
    </dl>
    <p className="gal-lb-note">Darstellung mit Labormustern und Fotos aus Laden und Labor – nicht die aktuelle Ausstellung im Fenster.</p>
    <div className="gal-lb-nav">
     <button type="button" className="btn btn-ghost btn-sm" onClick={()=>step(-1)}><Arrow dir="l"/> Vorheriges</button>
     <button type="button" className="btn btn-ghost btn-sm" onClick={()=>step(1)}>Nächstes <Arrow dir="r"/></button>
    </div>
   </div>
  </div>}
 </Dialog>;
}
