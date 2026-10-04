"use client";
import {useEffect,useRef} from 'react';
import {animate,stagger} from 'animejs';
export function Reveal({children,className=''}:{children:React.ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;let animation:ReturnType<typeof animate>|undefined;
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){animation=animate(el.querySelectorAll('[data-reveal]'),{translateY:[20,0],opacity:[.45,1],duration:550,delay:stagger(70),ease:'outCubic'});observer.disconnect()}},{threshold:.08});observer.observe(el);return()=>{observer.disconnect();animation?.revert()};},[]);
 return <div ref={ref} className={className}>{children}</div>
}
