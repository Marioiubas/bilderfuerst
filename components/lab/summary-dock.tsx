"use client";
// Phone total + CTA dock (UX-RESEARCH-MOBILE §8 Spec B, audit 2.4). Fixed bottom bar, ≤ 56 px +
// safe-area inset, shown from the FIRST valid choice (format): the running figure ("ab …" until the
// variant is complete, then the total) jumps to the order summary; the CTA is "Weiter: <next step>"
// until the variant is complete, then adds it to the preview cart. Hidden while the summary is on
// screen or already passed (no second total), while a text field has focus (keyboard) and while any
// dialog is open (CSS :has). CSS renders it only < 768 px and on landscape phones. Reduced motion: no slide.
import {useEffect,useState} from 'react';
import {ArrowDown,ArrowRight,Plus} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {motionAllowed} from '@/motion/reduced-motion';

export type DockNext={label:string;href:string;focusId:string};
type Props={ready:boolean;total:number|null;estimate:number|null;qty:number;canAdd:boolean;added:boolean;onAdd:()=>void;next:DockNext|null;targetId:string;focusId:string};
const FIELD='input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]),textarea,select,[contenteditable="true"]';

function jump(id:string,focusId:string){
 document.getElementById(id)?.scrollIntoView({behavior:motionAllowed()?'smooth':'auto',block:'start'});
 document.getElementById(focusId)?.focus({preventScroll:true});
}

export function SummaryDock({ready,total,estimate,qty,canAdd,added,onAdd,next,targetId,focusId}:Props){
 const [seen,setSeen]=useState(false);
 const [typing,setTyping]=useState(false);
 useEffect(()=>{
  const el=document.getElementById(targetId);
  if(!el||typeof IntersectionObserver==='undefined')return;
  const io=new IntersectionObserver(([e])=>setSeen(e.isIntersecting||e.boundingClientRect.top<0));
  io.observe(el);return()=>io.disconnect();
 },[targetId]);
 useEffect(()=>{
  const on=(e:FocusEvent)=>setTyping(e.target instanceof Element&&e.target.matches(FIELD));
  const off=()=>setTyping(false);
  document.addEventListener('focusin',on);document.addEventListener('focusout',off);
  return()=>{document.removeEventListener('focusin',on);document.removeEventListener('focusout',off)};
 },[]);
 const show=ready&&!seen&&!typing;
 const complete=total!==null;
 const figure=complete?formatPrice(total):estimate!==null?`ab ${formatPrice(estimate)}`:'—';
 return <div className="fc-dock" data-show={show} inert={!show}>
  <button type="button" className="fc-dock-sum" onClick={()=>jump(targetId,focusId)}>
   <span className="fc-dock-label">{complete?'Gesamt':'Preis je Film'} <ArrowDown size={13} aria-hidden="true"/></span>
   <span className="fc-dock-total num">{figure}</span>
   <span className="sr-only">{complete?`inkl. MwSt., ${qty} ${qty===1?'Film':'Filme'}, zur Übersicht`:'zur Übersicht'}</span>
  </button>
  {complete||!next
   ?<button type="button" className="btn btn-primary fc-dock-cta" disabled={!canAdd} onClick={onAdd}>{added?'Noch einmal hinzufügen':'In den Vorschau-Warenkorb'} <Plus size={18} aria-hidden="true"/></button>
   :<a className="btn btn-ink fc-dock-cta" href={next.href} onClick={e=>{e.preventDefault();jump(next.href.slice(1),next.focusId)}}>Weiter: {next.label} <ArrowRight size={17} aria-hidden="true"/></a>}
 </div>;
}
