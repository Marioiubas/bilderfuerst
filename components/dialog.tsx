"use client";
import {useEffect,useRef} from 'react';
import {animate} from 'animejs';
export function Dialog({open,onClose,children,label,className=''}:{open:boolean;onClose:()=>void;children:React.ReactNode;label:string;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const d=ref.current;if(!d)return;const previous=document.activeElement as HTMLElement|null;let animation:ReturnType<typeof animate>|undefined;
  if(open){d.showModal();document.documentElement.style.overflow='hidden';if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)animation=animate(d,{opacity:[0,1],translateX:className.includes('drawer')?[24,0]:0,duration:260,ease:'outCubic'});}
  else if(d.open){d.close();}
  return()=>{animation?.revert();if(d.open)d.close();document.documentElement.style.overflow='';previous?.focus()};
 },[open,className]);
 return <dialog ref={ref} className={`dialog ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target===ref.current)close.current()}}>{children}</dialog>
}
