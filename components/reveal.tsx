"use client";
import {useEffect,useRef} from 'react';
import {settleFrames} from '@/motion/photographic';
export function Reveal({children,className=''}:{children:React.ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;let animation:ReturnType<typeof settleFrames>;
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){animation=settleFrames(el);observer.disconnect()}},{threshold:.08});observer.observe(el);return()=>{observer.disconnect();animation?.revert()};},[]);
 return <div ref={ref} className={className}>{children}</div>
}
