"use client";
// Mobile-only disclosure for secondary content (UX-RESEARCH-MOBILE §6/§9, audit M2/M5).
// Below 768 px the body collapses behind a 48 px button (APG disclosure: constant label,
// aria-expanded + chevron, no auto-scroll on expand). From 768 px the body is always shown
// and the title is a plain heading; the button is display:none there. Nothing is removed.
import {useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';

export function Fold({id,title,as:H='h4',className='',titleClassName='',children}:{id:string;title:ReactNode;as?:'h3'|'h4';className?:string;titleClassName?:string;children:ReactNode}){
 const [open,setOpen]=useState(false);
 return <div className={`dz-fold ${className}`} data-open={open?'':undefined}>
  <H className={`dz-fold-title ${titleClassName}`}>
   <span className="dz-fold-static">{title}</span>
   <button type="button" className="dz-fold-btn" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}>
    <span>{title}</span><ChevronDown size={18} strokeWidth={1.6} aria-hidden="true"/>
   </button>
  </H>
  <div id={id} className="dz-fold-body">{children}</div>
 </div>;
}
