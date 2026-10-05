"use client";
// The accessible DOM gallery: twelve framed prints (9 window + 3 inside). On desktop/tablet with motion it
// first lies as a contact sheet and spreads into gallery frames when scrolled into view (motion/gallery.ts).
// Mobile and reduced motion render the framed wall directly. Every print is a real <button> → lightbox.
import {useEffect,useRef} from 'react';
import {FocusCards} from '@/components/ui/focus-cards';
import {motionTier} from '@/motion/setup';
import {spreadContactSheet,type Revertible} from '@/motion/gallery';
import {prints,type Print} from './prints';

export const placeLabel=(p:Print)=>p.place==='fenster'?'Schaufenster':'Im Laden';

export function PrintWall({onOpen}:{onOpen:(index:number)=>void}){
 const listRef=useRef<HTMLOListElement>(null);
 const holdRef=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  const list=listRef.current,hold=holdRef.current;if(!list||!hold)return;
  const tier=motionTier();
  // Mobile, reduced motion and an already visible wall keep the framed state (no spread, no shift).
  if((tier!=='desktop'&&tier!=='tablet')||list.getBoundingClientRect().top<window.innerHeight*.9)return;
  // Reserve the framed height first so the spread never pushes the content below it.
  hold.style.minHeight=`${hold.offsetHeight}px`;list.dataset.state='sheet';
  let spread:Revertible|undefined;
  const release=()=>{hold.style.minHeight=''};
  const io=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;io.disconnect();spread=spreadContactSheet(list,{onDone:release})},{rootMargin:'0px 0px -38% 0px'});
  io.observe(list);
  const queries=['(prefers-reduced-motion: reduce)','(min-width: 768px)'].map(q=>window.matchMedia(q));
  const bail=()=>{if(list.dataset.state!=='sheet')return;io.disconnect();list.dataset.state='framed';release()};
  const change=()=>{if(queries[0].matches||!queries[1].matches)bail()};
  const resize=()=>{if(list.dataset.state==='sheet')release()};
  queries.forEach(q=>q.addEventListener('change',change));window.addEventListener('resize',resize,{passive:true});
  return()=>{io.disconnect();queries.forEach(q=>q.removeEventListener('change',change));window.removeEventListener('resize',resize);spread?.revert();list.dataset.state='framed';release()};
 },[]);

 return <div className="gal-wall-hold" ref={holdRef}>
  <FocusCards items={prints} getKey={p=>p.id} listRef={listRef} className="gal-wall" data-state="framed" aria-label="Zwölf Abzüge: neun im Schaufenster, drei im Laden"
   itemProps={p=>({id:`druck-${p.id}`,className:'gal-print','data-place':p.place,'data-tone':p.tone})}
   render={(p,{index})=><>
    {(p.id==='01'||p.id==='10')&&<p className="gal-print-group mono" data-sheet-reveal aria-hidden="true">{p.id==='01'?<><b>Schaufenster</b> · 9 Bilder · rund um die Uhr</>:<><b>Im Laden</b> · 3 Bilder</>}</p>}
    <div className="gal-print-inner">
     <button type="button" className="gal-print-frame" onClick={()=>onOpen(index)} aria-label={`Druck ${p.id} vergrößern: ${p.title}`} aria-describedby={`druck-${p.id}-cap`}>
      <span className="gal-print-photo"><img src={p.src} width={p.w} height={p.h} alt={p.alt} loading="lazy" decoding="async"/></span>
     </button>
     <div className="gal-print-meta">
      <p className="gal-print-no"><span className="num">{p.id}</span><span data-sheet-reveal>{placeLabel(p)} · {p.slot}</span></p>
      <div className="gal-print-text" data-sheet-reveal>
       <h3 className="gal-print-title">{p.title}</h3>
       <p className="gal-print-cap" id={`druck-${p.id}-cap`}>{p.caption}</p>
      </div>
     </div>
    </div>
   </>}/>
 </div>;
}
