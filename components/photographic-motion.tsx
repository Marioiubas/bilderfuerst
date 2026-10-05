"use client";
import {useEffect,useRef} from 'react';
import {animate} from 'animejs';
import {motionAllowed,easing} from '@/motion/tokens';
import {developImages,shutterOpen} from '@/motion/photographic';

export function PhotoDevelop({src,alt,className=''}:{src:string;alt:string;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;let a:ReturnType<typeof animate>|undefined;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){a=developImages(el);io.disconnect()}},{threshold:.15});io.observe(el);return()=>{io.disconnect();a?.revert()}},[]);
 return <div className={`photo-develop ${className}`} ref={ref}><img data-develop src={src} alt={alt} width={1000} height={750} loading="lazy"/></div>;
}

export function ScannerPanel(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el||!motionAllowed())return;let a:ReturnType<typeof animate>|undefined;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){a=animate(el.querySelectorAll('.scan-pass'),{translateY:['-100%','110%'],opacity:[0,.85,0],duration:1600,ease:'inOutQuad'});io.disconnect()}},{threshold:.35});io.observe(el);return()=>{io.disconnect();a?.revert()}},[]);
 return <div className="scanner-panel" ref={ref}><img src="/images/lab-scan.webp" alt="Echte Scanservice-Aufnahme von der Bilderfürst-Website" width={1000} height={750}/><div className="scan-pass" aria-hidden="true"/><div className="scanner-meta"><span>ANALOG → DIGITAL</span><span>LICHT. ZEILE FÜR ZEILE.</span></div></div>;
}

export function FilmAdvance({format,process,step}:{format:string;process:string;step:number}){
 const strip=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!strip.current||!motionAllowed())return;const a=animate(strip.current,{translateX:-(step-1)*28,duration:420,ease:easing});return()=>{a.revert()}},[step,format,process]);
 return <div className={`film-advance format-${format} ${process.includes('S/W')?'monochrome':process==='E-6'?'slide-film':''}`} aria-hidden="true"><div className="film-advance-label"><span>{format} / {process}</span><b>FRAME 0{step}</b></div><div className="film-advance-window"><div className="film-advance-strip" ref={strip}>{[1,2,3,4,5,6].map(i=><div className="advance-frame" key={i}><span>0{i}</span><i/></div>)}</div></div><div className="film-advance-caption">BELICHTEN → ENTWICKELN → SCANNEN → BEWAHREN</div></div>;
}

export function ShutterImage({src,alt}:{src:string;alt:string}){
 const ref=useRef<HTMLImageElement>(null);
 useEffect(()=>{if(!ref.current)return;const a=shutterOpen(ref.current);return()=>{a?.revert()}},[src]);
 return <img ref={ref} src={src} alt={alt} width={1400} height={950}/>;
}
