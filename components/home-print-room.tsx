"use client";
// 05 · PRT PRINT ROOM — light paper zone. Real shop photo + a CSS print stack drawn to scale (1 cm = --cm).
// Prices: /i/preisliste (FineArt 20×30 11,50 · 30×40 22,50 · 30×45 24,50, edited 02.02.2026). Scope: /i/fineart-prints.
// Sheet motifs are real Kodak Tri-X lab samples (homepage developer slider); archival-paper texture only on the paper ground.
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead} from './analog/primitives';
import {printEmerge,printFan} from '@/motion/home';
import {PHOTO,chapter,photo} from './home-shared';

const SHEETS=[
 {w:45,h:30,size:'30 × 45 cm',price:'24,50 €',img:'/images/scan-hc110.webp',alt:'Druckbeispiel mit Tri-X-Labormuster (Porsche 911), entwickelt in Kodak HC-110'},
 {w:40,h:30,size:'30 × 40 cm',price:'22,50 €',img:'/images/scan-d76.webp',alt:'Druckbeispiel mit Tri-X-Labormuster (Porsche 911), entwickelt in Kodak D-76'},
 {w:30,h:20,size:'20 × 30 cm',price:'11,50 €',img:'/images/scan-adonal.webp',alt:'Druckbeispiel mit Tri-X-Labormuster (Porsche 911), entwickelt in Adox Adonal'},
];

export function HomePrintRoom(){
 const stack=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=stack.current;if(!el)return;const a=printEmerge(el),b=printFan(el);return()=>{b?.();a?.()}},[]);
 const head=chapter('PRT');
 return <section className="hm-prt zone-light" id={head.sectionId} aria-labelledby="hm-prt-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-prt-title"
    title={<>Vom Negativ <br/>aufs Papier.</>}
    action={<Link className="link" href="/i/fineart-prints">FineArt-Drucke <ArrowUpRight size={16}/></Link>}/>
   <div className="hm-prt-grid">
    <figure className="hm-prt-photo">
     <img {...photo(PHOTO.printKiosk,'(min-width: 1024px) min(68vw, 1080px), 92vw')} loading="lazy" decoding="async" alt="Bestellterminal für Fotoabzüge im Laden, im Hintergrund der Drucker"/>
     <figcaption className="hm-cap"><span>PRT · Bestellterminal im Laden</span><span>Abzüge vom Handy, von SD-Karte oder USB</span></figcaption>
    </figure>
    <div className="hm-prt-copy">
     <p className="hm-prt-lead">FineArt-Drucke bis A3+ direkt in Fürth, große Formate im Fuji-Store Nürnberg.</p>
     <p className="hm-prt-text">Kleine Formate von 9 × 13 bis 20 × 30 cm auf glänzendem oder seidenmattem FineArt-Papier, gedruckt im Laden.</p>
     <div className="hm-prt-stack" ref={stack} tabIndex={0} role="group" aria-label="FineArt-Formate maßstäblich: 30 × 45, 30 × 40 und 20 × 30 Zentimeter">
      {SHEETS.map((s,i)=><div key={s.size} className={`hm-sheet hm-sheet-${i}`} data-sheet style={{'--w':s.w,'--h':s.h} as React.CSSProperties}>
       <span className="hm-sheet-size mono" aria-hidden="true">{s.size}</span>
       <span className="hm-sheet-image"><img src={s.img} width={600} height={398} loading="lazy" decoding="async" alt={s.alt}/></span>
      </div>)}
     </div>
     <ul className="hm-prt-sizes">
      {[...SHEETS].reverse().map(s=><li key={s.size}><span className="mono">FineArt</span><span className="hm-prt-size">{s.size}</span><span className="hm-prt-dots" aria-hidden="true"/><span className="num hm-prt-price">{s.price}</span></li>)}
     </ul>
     <p className="hm-note mono">Formate maßstäblich · Motive: Tri-X-Labormuster · Preise je Druck inkl. MwSt. · Quellstand 04.10.2026</p>
    </div>
   </div>
  </div>
 </section>;
}
