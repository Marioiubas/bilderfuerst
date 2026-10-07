"use client";
// Native <dialog> with focus return, Escape/backdrop close and a short shutter entrance.
import {useEffect,useRef} from 'react';
import {openSheet,type SheetKind} from '@/motion/commerce';
// Safari/iOS don't focus buttons on click, so document.activeElement is <body> when a dialog opens from a tap.
// Remember the last pressed control so focus can still return to it on close (DEVICE-QA D5).
let lastPressed:HTMLElement|null=null;
if(typeof window!=='undefined')window.addEventListener('pointerdown',e=>{const t=(e.target as Element|null)?.closest?.<HTMLElement>('a,button,[role=button],summary,input,select,label');if(t)lastPressed=t},{capture:true,passive:true});
export function Dialog({open,onClose,children,label,kind='default',className=''}:{open:boolean;onClose:()=>void;children:React.ReactNode;label:string;kind?:SheetKind;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const d=ref.current;if(!d)return;const active=document.activeElement as HTMLElement|null;const previous=active&&active!==document.body?active:lastPressed;let animation:ReturnType<typeof openSheet>;
  if(open){if(!d.open)d.showModal();
   // Without an explicit [autofocus], start on the dialog itself instead of ringing the close button (D7); Tab still enters it.
   if(!d.querySelector('[autofocus]'))d.focus({preventScroll:true});
   document.documentElement.style.overflow='hidden';animation=openSheet(d,kind);}
  else if(d.open){d.close();}
  return()=>{animation?.revert();if(d.open)d.close();document.documentElement.style.overflow='';if(open&&previous?.isConnected)previous.focus({preventScroll:true})};
 },[open,kind]);
 return <dialog ref={ref} tabIndex={-1} className={`dialog dialog-${kind} ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target===ref.current)close.current()}}>{children}</dialog>
}
