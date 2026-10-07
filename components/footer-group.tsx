"use client";
// Footer link group: an open list from 768 px up, a collapsed <details> accordion on phones (≈550 px less footer).
// Server-rendered open, so desktop and no-JS always show the links; phones collapse after hydration (below the fold, no CLS).
import {useEffect,useRef} from 'react';
const PHONE='(max-width:767px)';
export function FooterGroup({title,children}:{title:string;children:React.ReactNode}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const d=ref.current;const summary=d?.querySelector('summary');if(!d||!summary)return;const mq=matchMedia(PHONE);
  const sync=()=>{d.open=!mq.matches;summary.tabIndex=mq.matches?0:-1};
  sync();mq.addEventListener('change',sync);return()=>mq.removeEventListener('change',sync);
 },[]);
 return <details ref={ref} className="footer-group" open>
  <summary onClick={e=>{if(!matchMedia(PHONE).matches)e.preventDefault()}}><h2>{title}</h2></summary>
  <div>{children}</div>
 </details>;
}
