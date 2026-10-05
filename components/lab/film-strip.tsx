"use client";
// Film strip as progress indicator. Semantic step list (<ol>, aria-current="step") drawn as a
// negative strip per format: 35mm sprocket film (3:2), 120 wide film without perforation (6×6,
// backing-paper numbers), 110 small frames with one perforation per frame.
import {useEffect,useRef,useState} from 'react';
import {createStripController,exposeFrame,redrawStrip} from '@/motion/film';
import type {FormatId,ProcessKind} from './film-data';

export type StripFrame={id:string;no:string;label:string;value:string;done:boolean;href:string;optional?:boolean;showValue?:boolean};

export function FilmStrip({format,kind,frames,current,animate}:{format:FormatId|null;kind:ProcessKind|null;frames:StripFrame[];current:number;animate:boolean}){
 const viewport=useRef<HTMLDivElement>(null);const track=useRef<HTMLDivElement>(null);const list=useRef<HTMLOListElement>(null);const readout=useRef<HTMLSpanElement>(null);
 const ctrl=useRef<ReturnType<typeof createStripController>|null>(null);
 const [focusIndex,setFocusIndex]=useState<number|null>(null);
 const shown=focusIndex??current;
 const doneKey=frames.map(f=>f.done?'1':'0').join('');
 const prevDone=useRef(doneKey);const prevFormat=useRef(format);

 useEffect(()=>{
  if(!viewport.current||!track.current)return;
  const c=createStripController(viewport.current,track.current,readout.current);ctrl.current=c;c.goTo(0,{instant:true});
  return()=>{c.destroy();ctrl.current=null};
 },[]);
 // Advance (or rewind) to the shown frame. A format switch first re-draws the strip type on the
 // previous frame (new geometry, crossfade), then advances from there.
 const lastShown=useRef(0);
 useEffect(()=>{
  const c=ctrl.current;if(!c)return;
  const formatChanged=prevFormat.current!==format;prevFormat.current=format;
  if(formatChanged)c.place(lastShown.current);
  c.goTo(shown,{instant:!animate});lastShown.current=shown;
  if(!formatChanged||!animate)return;
  const a=redrawStrip(list.current);return()=>{a?.revert()};
 },[shown,format,animate]);
 // Newly completed frames get exposed.
 useEffect(()=>{
  const before=prevDone.current;prevDone.current=doneKey;
  if(!animate)return;
  const anims=doneKey.split('').map((d,i)=>d==='1'&&before[i]!=='1'?exposeFrame(list.current?.querySelector<HTMLElement>(`[data-index="${i}"]`)??null):undefined);
  return()=>anims.forEach(a=>a?.revert());
 },[doneKey,animate]);

 return <nav className="fs" aria-label="Auftragsfortschritt" data-format={format??'none'} data-kind={kind??'none'}>
  <div className="fs-viewport" ref={viewport}>
   <div className="fs-gate" data-gate aria-hidden="true"><span className="fs-readout" ref={readout}/></div>
   <div className="fs-track" ref={track}>
    <div className="fs-leader" aria-hidden="true"><span className="fs-leader-code">{format?`LAB ${format==='35mm'?'135':format}`:'LAB'}</span><span className="fs-leader-arrow">▸▸</span></div>
    <ol className="fs-frames" ref={list} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocusIndex(null)}}>
     {frames.map((f,i)=>{const state=i===current?'current':f.done?'done':'todo';return <li key={f.id} className="fs-frame" data-frame data-index={i} data-no={f.no} data-state={state}>
      <a href={f.href} aria-current={i===current?'step':undefined} onFocus={()=>setFocusIndex(i)}>
       <span className="fs-no" aria-hidden="true">{f.no}</span>
       <strong className="fs-value" aria-hidden="true">{f.done||f.showValue?f.value||'—':'—'}</strong>
       <span className="fs-label" aria-hidden="true">{f.label}{f.optional&&!f.done?' · opt.':''}</span>
       <span className="sr-only">{`Schritt ${f.no} ${f.label}${f.done||f.showValue?`: ${f.value||'offen'}`:''}${f.optional&&!f.done?' (optional)':''}, ${state==='current'?'aktueller Schritt':f.done?'erledigt':'offen'}`}</span>
       <span className="fs-expose" data-expose aria-hidden="true"/>
      </a>
      <span className="fs-edge" aria-hidden="true">{f.no}</span>
      <span className="fs-edge fs-edge-a" aria-hidden="true">{f.no}A</span>
     </li>})}
    </ol>
    <div className="fs-trailer" aria-hidden="true"><span>ENDE</span></div>
   </div>
  </div>
 </nav>;
}
