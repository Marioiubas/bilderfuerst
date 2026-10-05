"use client";
// Client island that runs the lab page motion inventory (motion/lab.ts) on server-rendered content.
import {useEffect,useRef,type ReactNode} from 'react';
import {motionScope,motionTier} from '@/motion/setup';
import {developPhotos,lockSpecFrames,windStrip} from '@/motion/lab';

export function LabMotion({children,className,kind}:{children:ReactNode;className?:string;kind:'specs'|'photos'|'strip'}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const tier=motionTier();if(tier==='static')return;
  const scope=motionScope();const el=ref.current;
  if(kind==='specs')scope.add(lockSpecFrames(el));
  if(kind==='photos'&&tier!=='mobile')scope.add(developPhotos(el));
  if(kind==='strip'&&tier==='desktop')scope.add(windStrip(el?.querySelector<HTMLElement>('[data-wind]')??null));
  return()=>scope.revert();
 },[kind]);
 return <div ref={ref} className={className}>{children}</div>;
}
