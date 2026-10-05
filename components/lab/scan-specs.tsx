"use client";
// Noritsu HS-1800 scan sizes per format as published on the development product pages,
// with a to-scale dimension diagram in blue technical lines. Megapixels are calculated.
import {useEffect,useRef,useState} from 'react';
import {drawDimensions} from '@/motion/film';
import {FORMAT_IDS,WHOLE_ROLL_69,formats,megapixels,scanSizes,type FormatId} from './film-data';

const S=300/7100; // one shared scale so 35mm and 120 frames compare honestly
const OX=56,OY=226;

export function ScanSpecs({lock,idPrefix='ss',animate=true}:{lock?:FormatId|null;idPrefix?:string;animate?:boolean}){
 const [tab,setTab]=useState<FormatId>('35mm');
 const format=lock??tab;
 const rows=scanSizes[format];
 const [active,setActive]=useState(0);
 const svg=useRef<SVGSVGElement>(null);
 const act=Math.max(0,Math.min(active,rows.length-1));
 const a=rows[act];
 const key=`${format}-${a?.id??'none'}`;
 useEffect(()=>{if(!animate)return;const d=drawDimensions(svg.current);return()=>{d?.revert()}},[key,animate]);

 return <div className="ss" id={`${idPrefix}-specs`}>
  {!lock&&<div className="ss-tabs" role="group" aria-label="Filmformat für die Scan-Tabelle">
   {FORMAT_IDS.map(f=><button key={f} type="button" aria-pressed={format===f} onClick={()=>{setTab(f);setActive(0)}}>{formats[f].name}</button>)}
  </div>}
  {rows.length?<div className="ss-grid">
   <table className="ss-table">
    <caption>Large Scan · Noritsu HS-1800 · {formats[format].name} {formats[format].sub}</caption>
    <thead><tr><th scope="col">Bildformat</th><th scope="col">Pixel</th><th scope="col">Megapixel <span>(berechnet)</span></th></tr></thead>
    <tbody>{rows.map((r,i)=><tr key={r.id} data-active={i===act} onMouseEnter={()=>setActive(i)}>
     <th scope="row"><button type="button" aria-pressed={i===act} onClick={()=>setActive(i)} onFocus={()=>setActive(i)}>{r.label}{r.conflict&&<sup>*</sup>}</button>{r.note&&<small>{r.note}</small>}</th>
     <td className="num">{r.w} × {r.h} px</td>
     <td className="num">≈ {megapixels(r.w,r.h)} MP</td>
    </tr>)}</tbody>
   </table>
   <figure className="ss-diagram">
    <svg ref={svg} viewBox="0 0 380 262" aria-hidden="true" focusable="false">
     <line x1={OX} y1={OY} x2={OX+310} y2={OY} className="ss-axis"/>
     <line x1={OX} y1={OY} x2={OX} y2={OY-218} className="ss-axis"/>
     {rows.map((r,i)=>i===act?null:<rect key={r.id} x={OX} y={OY-r.h*S} width={r.w*S} height={r.h*S} className="ss-frame"/>)}
     {a&&<g key={key}>
      <rect x={OX} y={OY-a.h*S} width={a.w*S} height={a.h*S} className="ss-frame ss-frame-active" pathLength={1} data-dim/>
      <line x1={OX} y1={OY+16} x2={OX+a.w*S} y2={OY+16} className="ss-dim" pathLength={1} data-dim/>
      <line x1={OX} y1={OY+10} x2={OX} y2={OY+22} className="ss-tick"/><line x1={OX+a.w*S} y1={OY+10} x2={OX+a.w*S} y2={OY+22} className="ss-tick"/>
      <text x={OX+a.w*S/2} y={OY+32} textAnchor="middle" className="ss-label">{a.w} px</text>
      <line x1={OX-16} y1={OY} x2={OX-16} y2={OY-a.h*S} className="ss-dim" pathLength={1} data-dim/>
      <line x1={OX-22} y1={OY} x2={OX-10} y2={OY} className="ss-tick"/><line x1={OX-22} y1={OY-a.h*S} x2={OX-10} y2={OY-a.h*S} className="ss-tick"/>
      <text x={OX-24} y={OY-a.h*S/2} textAnchor="middle" className="ss-label" transform={`rotate(-90 ${OX-24} ${OY-a.h*S/2})`}>{a.h} px</text>
      <text x={OX+a.w*S-6} y={OY-a.h*S+16} textAnchor="end" className="ss-label ss-label-strong">{a.label}</text>
     </g>}
    </svg>
    <figcaption className="mono">Maßstabsgetreu · {a?`${a.label} ${a.w} × ${a.h} px ≈ ${megapixels(a.w,a.h)} MP (berechnet)`:''}</figcaption>
   </figure>
  </div>:<p className="ss-empty">Für 110 ist keine Scan-Auflösung veröffentlicht. Bitte im Laden erfragen.</p>}
  <ul className="ss-notes">
   <li>JPG und TIFF: derselbe Scan, TIFF für die Weiterbearbeitung. Dateigrößen und Farbtiefe sind nicht veröffentlicht.</li>
   {format==='35mm'&&<li>Halbformat-Kameras (z. B. Pentax 17) laufen über Kleinbild; pro Halbformat-Bild 4492 × 3167 px.</li>}
   {format==='120'&&<li><sup>*</sup> Quellkonflikt: Die Entwicklungsseite nennt für 6×9 7100 × 4900 px, das Produkt „Negativ Scan (Ganze Rollen)“ {WHOLE_ROLL_69} px (Beispiel 6×9). Gezeigt ist der Wert der Entwicklungsseite; im Zweifel im Laden fragen.</li>}
  </ul>
 </div>;
}
