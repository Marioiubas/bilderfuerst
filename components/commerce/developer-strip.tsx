"use client";
// Real in-house Kodak Tri-X lab scans in four B&W developers (source: photostudio.de homepage slider).
// Only rendered on the two Tri-X PDPs — that is what the samples show.
import Link from 'next/link';
import {useState} from 'react';
import {X,ChevronLeft,ChevronRight} from 'lucide-react';
import {Dialog} from '@/components/dialog';
import {frameNo} from '@/components/analog/primitives';

const samples=[
 {img:'scan-adonal',dev:'Adox Adonal',ratio:'1+25',time:'7:00',product:'adox-adonal-500-ml-konzentrat-schwarz-weiss-filmentwickler'},
 {img:'scan-silvermax',dev:'Adox Silvermax',ratio:'1+19',time:'12:00',product:'adox-silvermax-entwickler-100-ml-konzentrat'},
 {img:'scan-d76',dev:'Kodak D-76',ratio:'1+0',time:'6:45',product:'kodak-professional-d-76-zum-ansatz-von-1000-ml'},
 {img:'scan-hc110',dev:'Kodak HC-110',ratio:'1+31',time:'6:00',product:'110-professional-hc-110-schwarz-weiss-entwickler'},
];
const caption=(s:typeof samples[number])=>`Kodak Tri-X · ${s.dev} ${s.ratio} · ${s.time} Min.`;

export function DeveloperStrip(){
 const [open,setOpen]=useState<number|null>(null);
 const s=open==null?null:samples[open];
 return <section className="dev-strip wrap" aria-labelledby="dev-strip-h">
  <header className="pdp-sec-head"><p className="eyebrow"><b>LAB</b><span>Laborscans · Kodak Tri-X</span></p><h2 id="dev-strip-h">Ein Film, vier Entwickler</h2>
   <p className="muted">Echte Scans aus unserem Labor (Noritsu HS-1800): derselbe Kodak Tri-X in vier Schwarzweiß-Entwicklern. Schwarzweißfilm entwickeln wir auf Anfrage in dem Entwickler, den du dir wünschst.</p></header>
  <ol className="contact-strip">
   {samples.map((x,i)=><li key={x.img}>
    <button type="button" className="contact-frame" onClick={()=>setOpen(i)} aria-haspopup="dialog" aria-label={`${caption(x)} – vergrößern`}>
     <img src={`/images/${x.img}.webp`} alt="" width={600} height={398} loading="lazy" decoding="async"/>
    </button>
    <p className="contact-cap"><span className="mono num">{frameNo(i+1)}A</span> {x.dev} <span className="mono">{x.ratio} · {x.time} Min.</span></p>
    <Link className="contact-link mono" href={`/p/${x.product}`}>Entwickler im Shop →</Link>
   </li>)}
  </ol>
  <Dialog open={open!=null} onClose={()=>setOpen(null)} label="Laborscan Großansicht" kind="lightbox" className="pdp-lightbox">
   {s&&open!=null&&<div className="lightbox-frame lightbox-dark">
    <div className="lightbox-bar"><span className="mono">{frameNo(open+1)}A · {caption(s)}</span><button type="button" className="icon-btn" onClick={()=>setOpen(null)} aria-label="Großansicht schließen"><X size={20}/></button></div>
    <img src={`/images/${s.img}-l.webp`} alt={`Laborscan eines Porsche 911 auf Kodak Tri-X, entwickelt in ${s.dev} ${s.ratio}, ${s.time} Minuten`} width={1400} height={928} decoding="async"/>
    <div className="lightbox-nav"><button type="button" className="btn btn-light btn-sm" onClick={()=>setOpen((open+3)%4)}><ChevronLeft size={16}/>Zurück</button><span className="mono">{caption(s)}</span><button type="button" className="btn btn-light btn-sm" onClick={()=>setOpen((open+1)%4)}>Weiter<ChevronRight size={16}/></button></div>
   </div>}
  </Dialog>
 </section>;
}
