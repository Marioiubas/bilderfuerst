"use client";
// Shared helpers for the homepage chapters: motion hook, chapter list, Fürth opening hours (Europe/Berlin).
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import type {Dispose} from '@/motion/home';

/** Run a motion/home.ts function on mount and revert it on unmount. `run` must be a stable module function. */
export function useMotion<T extends HTMLElement>(run:(el:T)=>Dispose|undefined){
 const ref=useRef<T>(null);
 useEffect(()=>{const el=ref.current;return el?run(el):undefined},[run]);
 return ref;
}

/** Phone-only disclosure for a chapter's secondary content (UX-RESEARCH-MOBILE §6.3, audit M2).
 *  Mark the regions with `className="hm-extra"` and `id={more.ids[n]}`, put `data-more={more.attr}` on the section.
 *  < 768 px the regions are hidden until the 44 px button opens them; ≥ 768 px the button is not displayed and the
 *  regions are always shown. Constant label, state via aria-expanded (APG disclosure). */
export function useMore(count=1){
 const [open,setOpen]=useState(false);const base=useId();
 return {open,attr:open?'open':undefined,ids:Array.from({length:count},(_,i)=>`${base}-more-${i}`),toggle:()=>setOpen(o=>!o)};
}
export function MoreToggle({more,className='',children}:{more:ReturnType<typeof useMore>;className?:string;children:ReactNode}){
 return <button type="button" className={`hm-more ${className}`} aria-expanded={more.open} aria-controls={more.ids.join(' ')} onClick={more.toggle}>
  <span>{children}</span><i className="hm-more-icon" aria-hidden="true"/>
 </button>;
}

/** The route through the lab, numbered like frames on a roll (00 = hero darkroom). */
export const CHAPTERS=[
 {n:1,code:'LTB',label:'Lichttisch',id:'lichttisch'},
 {n:2,code:'LAB',label:'Filmlabor',id:'filmlabor'},
 {n:3,code:'STR',label:'Analog Store',id:'analog-store'},
 {n:4,code:'SCN',label:'Scanner',id:'scanner'},
 {n:5,code:'PRT',label:'Druckraum',id:'druckraum'},
 {n:6,code:'GAL',label:'Street Gallery',id:'street-gallery'},
 {n:7,code:'ARC',label:'Archiv',id:'archiv'},
 {n:8,code:'FTH',label:'Laden Fürth',id:'laden'},
] as const;
export type ChapterCode=(typeof CHAPTERS)[number]['code'];
const pad=(n:number)=>String(n).padStart(2,'0');
/** Props for SectionHead: "01 · Lichttisch" with the frame counter "Bild 01 / 08" on the right (counter and zone code are desktop-only). */
export function chapter(code:ChapterCode){
 const c=CHAPTERS.find(x=>x.code===code)!;
 return{code:c.code,label:`${pad(c.n)} · ${c.label}`,index:`Bild ${pad(c.n)} / ${pad(CHAPTERS.length)}`,sectionId:c.id};
}

/* ───────── Opening hours (source: /i/kontakt-und-oeffnungszeiten, verified 05.10.2026) ───────── */

type Day=0|1|2|3|4|5|6;
export const HOURS:{day:Day;short:string;long:string;open?:[string,string]}[]=[
 {day:1,short:'Mo',long:'Montag',open:['09:30','18:30']},
 {day:2,short:'Di',long:'Dienstag',open:['09:30','18:30']},
 {day:3,short:'Mi',long:'Mittwoch',open:['09:30','18:30']},
 {day:4,short:'Do',long:'Donnerstag',open:['09:30','18:30']},
 {day:5,short:'Fr',long:'Freitag',open:['09:30','18:30']},
 {day:6,short:'Sa',long:'Samstag',open:['09:30','16:30']},
 {day:0,short:'So',long:'Sonntag'},
];
export const HOURS_STATIC='Mo–Fr 09:30–18:30 · Sa 09:30–16:30';
const WEEKDAY:Record<string,Day>={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
const minutes=(hhmm:string)=>{const [h,m]=hhmm.split(':').map(Number);return h*60+m};

export type BerlinNow={day:Day;minutes:number};
/** Current weekday and minute of day in Fürth, independent of the visitor's time zone. */
export function berlinNow(date=new Date()):BerlinNow{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const get=(t:string)=>parts.find(p=>p.type===t)?.value||'';
 return{day:WEEKDAY[get('weekday')]??1,minutes:Number(get('hour'))*60+Number(get('minute'))};
}
export function openState(now:BerlinNow):{open:boolean;label:string}{
 const today=HOURS.find(h=>h.day===now.day);
 if(today?.open){
  const [from,to]=today.open;
  if(now.minutes>=minutes(from)&&now.minutes<minutes(to))return{open:true,label:`Heute geöffnet bis ${to}`};
  if(now.minutes<minutes(from))return{open:false,label:`Geschlossen · öffnet heute ${from}`};
 }
 for(let i=1;i<=7;i++){
  const next=HOURS.find(h=>h.day===(now.day+i)%7);
  if(next?.open)return{open:false,label:`Geschlossen · öffnet ${next.short} ${next.open[0]}`};
 }
 return{open:false,label:'Geschlossen'};
}
/** null during SSR and the first client render (static hours line), then the live Europe/Berlin state, refreshed every minute. */
export function useBerlinNow(){
 const [now,setNow]=useState<BerlinNow|null>(null);
 useEffect(()=>{const tick=()=>setNow(berlinNow());tick();const id=window.setInterval(tick,60_000);return()=>window.clearInterval(id)},[]);
 return now;
}

/** Real photographs used on the homepage: intrinsic size of `src` (width × height of the file in /public/images) and
 *  the rendition ladder from lib/image-renditions.json, so phones pick the small file and large screens the large one. */
type Photo={src:string;w:number;h:number;srcSet?:string};
export const PHOTO={
 labScan:{src:'/images/lab-scan-l.webp',w:1600,h:1066,srcSet:'/images/lab-scan.webp 600w, /images/lab-scan-l.webp 1600w'},
 filmRolls:{src:'/images/film-rolls-l.webp',w:1600,h:1067,srcSet:'/images/film-rolls.webp 600w, /images/film-rolls-l.webp 1600w'},
 pentax:{src:'/images/pentax-17.webp',w:1400,h:1050},
 slideMagazine:{src:'/images/slide-magazine-macro.webp',w:1400,h:1120,srcSet:'/images/slide-magazine-macro.webp 1400w, /images/slide-magazine-macro-l.webp 2500w'},
 slideGlove:{src:'/images/slide-in-glove.webp',w:1400,h:1120,srcSet:'/images/slide-in-glove-t.webp 480w, /images/slide-in-glove.webp 1400w, /images/slide-in-glove-l.webp 2500w'},
 printKiosk:{src:'/images/print-kiosk-screens.webp',w:1400,h:933,srcSet:'/images/print-kiosk-screens.webp 1400w, /images/print-kiosk-screens-l.webp 1600w'},
 galleryWindow:{src:'/images/store-exterior-gallery-window.webp',w:1063,h:709,srcSet:'/images/store-exterior-gallery-window-t.webp 480w, /images/store-exterior-gallery-window.webp 1063w'},
 history:{src:'/images/history-l.webp',w:1600,h:457,srcSet:'/images/history.webp 600w, /images/history-l.webp 1600w'},
 storeCorner:{src:'/images/store-exterior-corner.webp',w:1063,h:709},
} as const satisfies Record<string,Photo>;

/** `<img>` attributes for a homepage photo; `sizes` describes the rendered width (cover crops count as wider). */
export function photo(p:Photo,sizes:string){
 return {src:p.src,width:p.w,height:p.h,...(p.srcSet?{srcSet:p.srcSet,sizes}:{})};
}
