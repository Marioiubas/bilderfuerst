"use client";
// Phone summary dock ("Configurator summary dock", UX-RESEARCH-MOBILE §8 Spec B). Fixed bottom bar,
// 56 px + safe-area inset: total, "Übersicht" (jumps to the order note) and the add-to-cart CTA.
// Shown only while a valid variant/price exists. Hidden while the order note is on screen or already
// passed (no second total), while a text field has focus (keyboard) and while any dialog is open
// (CSS :has). CSS renders it only < 768 px and on landscape phones. Reduced motion: no slide.
import {useEffect,useState} from 'react';
import {ArrowDown,Plus} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {motionAllowed} from '@/motion/reduced-motion';

type Props={total:number|null;qty:number;canAdd:boolean;added:boolean;onAdd:()=>void;targetId:string;focusId:string};
const FIELD='input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]),textarea,select,[contenteditable="true"]';

export function SummaryDock({total,qty,canAdd,added,onAdd,targetId,focusId}:Props){
 const [noteSeen,setNoteSeen]=useState(false);
 const [typing,setTyping]=useState(false);
 useEffect(()=>{
  const el=document.getElementById(targetId);
  if(!el||typeof IntersectionObserver==='undefined')return;
  const io=new IntersectionObserver(([e])=>setNoteSeen(e.isIntersecting||e.boundingClientRect.top<0));
  io.observe(el);return()=>io.disconnect();
 },[targetId]);
 useEffect(()=>{
  const on=(e:FocusEvent)=>setTyping(e.target instanceof Element&&e.target.matches(FIELD));
  const off=()=>setTyping(false);
  document.addEventListener('focusin',on);document.addEventListener('focusout',off);
  return()=>{document.removeEventListener('focusin',on);document.removeEventListener('focusout',off)};
 },[]);
 const show=total!==null&&!noteSeen&&!typing;
 function overview(){
  document.getElementById(targetId)?.scrollIntoView({behavior:motionAllowed()?'smooth':'auto',block:'start'});
  document.getElementById(focusId)?.focus({preventScroll:true});
 }
 return <div className="fc-dock" data-show={show} inert={!show}>
  <button type="button" className="fc-dock-sum" onClick={overview}>
   <span className="fc-dock-label">Übersicht <ArrowDown size={13} aria-hidden="true"/></span>
   <span className="fc-dock-total num">{total!==null?formatPrice(total):'—'}</span>
   <span className="sr-only">{`inkl. MwSt., ${qty} ${qty===1?'Film':'Filme'}, zur Auftragsnotiz`}</span>
  </button>
  <button type="button" className="btn btn-primary fc-dock-cta" disabled={!canAdd} onClick={onAdd}>{added?'Noch einmal hinzufügen':'In den Vorschau-Warenkorb'} <Plus size={18} aria-hidden="true"/></button>
 </div>;
}
