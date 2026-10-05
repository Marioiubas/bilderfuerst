"use client";
// Process state visual (2.5D SVG, schematic, not a photo of any machine):
// C-41 → film path through the racks of a minilab (amber); SW / SW Push/Pull / E-6 → a rotation
// tank on rollers with chemistry (silver / silver + marker / blue). Format changes reel or film width.
import {useEffect,useRef} from 'react';
import {tankTransition} from '@/motion/film';
import {formats,processes,type FormatId,type ProcessId} from './film-data';

const reelWidth:Record<FormatId,number>={'35mm':46,'120':78,'110':26};
const filmWidth:Record<FormatId,number>={'35mm':7,'120':12,'110':4};

export function ProcessTank({format,process,animate}:{format:FormatId|null;process:ProcessId|null;animate:boolean}){
 const svg=useRef<SVGSVGElement>(null);
 const prev=useRef<{format:FormatId|null;process:ProcessId|null}>({format,process});
 const info=process?processes[process]:null;
 const minilab=process==='C-41';
 const rw=reelWidth[format??'35mm'];const fw=filmWidth[format??'35mm'];

 useEffect(()=>{
  const before=prev.current;prev.current={format,process};
  if(!animate||(before.format===format&&before.process===process))return;
  const processChanged=before.process!==process;
  const ratio=!processChanged&&!minilab?reelWidth[before.format??'35mm']/rw:1;
  const t=tankTransition(svg.current,{processChanged,formatRatio:ratio,redrawPath:minilab&&before.format!==format});
  return()=>t?.revert();
 },[format,process,animate,minilab,rw]);

 const caption=info?`${info.label} · ${info.machine} · ${info.chemistry}`:'Noch kein Prozess gewählt';
 return <figure className="pt" data-kind={info?.kind??'none'} data-mode={minilab?'minilab':'rotation'}>
  <div className="pt-head"><span className="mono">Prozessmodul</span><span className="mono pt-format">{format?`${formats[format].name} · ${formats[format].sub}`:'Format offen'}</span></div>
  <svg ref={svg} viewBox="0 0 400 236" className="pt-svg" aria-hidden="true" focusable="false">
   <defs>
    <clipPath id="pt-window"><rect x="124" y="68" width="152" height="84"/></clipPath>
   </defs>
   <line x1="12" y1="222" x2="388" y2="222" className="pt-floor"/>
   {minilab?<g data-mode key="minilab">
    <rect x="34" y="62" width="332" height="142" className="pt-body"/>
    <rect x="34" y="62" width="332" height="16" className="pt-panel"/>
    {[66,136,206,276].map((x,i)=><g key={x}>
     <rect x={x} y="92" width="58" height="102" className="pt-rack"/>
     <rect x={x+1} y="118" width="56" height="75" className="pt-liquid" data-liquid style={{transitionDelay:`${i*40}ms`}}/>
     <line x1={x+1} y1="118" x2={x+57} y2="118" className="pt-meniscus"/>
    </g>)}
    <path pathLength={1} data-draw className="pt-film" strokeWidth={fw} d="M8 84 H88 V182 H102 V84 H158 V182 H172 V84 H228 V182 H242 V84 H298 V182 H312 V84 H392"/>
    {[95,165,235,305].map(x=><circle key={x} cx={x} cy="84" r="6" className="pt-roller"/>)}
    <text x="42" y="74" className="pt-text">C-41 · MINILAB</text>
   </g>:<g data-mode key="rotation">
    <rect x="70" y="176" width="260" height="30" className="pt-base"/>
    <circle cx="128" cy="172" r="12" className="pt-roller"/><circle cx="272" cy="172" r="12" className="pt-roller"/>
    <path d="M96 56 H304 A16 54 0 0 1 304 164 H96 Z" className="pt-body"/>
    <g clipPath="url(#pt-window)">
     <rect x="124" y="68" width="152" height="84" className="pt-window"/>
     {process&&<rect x="124" y="116" width="152" height="36" className="pt-liquid" data-liquid/>}
     {process&&<line x1="124" y1="116" x2="276" y2="116" className="pt-meniscus"/>}
     <g data-reel className="pt-reel">
      <ellipse cx={200-rw/2} cy="110" rx="6" ry="36" className="pt-flange"/>
      {[86,94,102,110,118,126,134].map(y=><line key={y} x1={200-rw/2} y1={y} x2={200+rw/2} y2={y} className="pt-coil"/>)}
      <ellipse cx={200+rw/2} cy="110" rx="6" ry="36" className="pt-flange"/>
      <line x1={200-rw/2-10} y1="110" x2={200+rw/2+10} y2="110" className="pt-core"/>
     </g>
    </g>
    <rect x="124" y="68" width="152" height="84" className="pt-window-frame"/>
    <ellipse cx="96" cy="110" rx="16" ry="54" className="pt-cap"/>
    <ellipse cx="96" cy="110" rx="7" ry="22" className="pt-hub"/>
    <path d="M70 72 A26 44 0 0 0 70 148" className="pt-turn" pathLength={1} data-draw/>
    <path d="M66 143 L70 150 L76 144" className="pt-turn-head"/>
    {info?.marker&&<g className="pt-marker"><rect x="232" y="30" width="78" height="20"/><text x="271" y="44" textAnchor="middle">± EV</text><line x1="271" y1="50" x2="271" y2="58"/></g>}
    <text x="104" y="48" className="pt-text">{process?'ROTATION':'TANK · LEER'}</text>
   </g>}
  </svg>
  <figcaption><span className={`chip ${info?`chip-${info.kind}`:''}`}>{info?info.label:'Prozess'}</span><span>{caption}</span><span className="pt-note">Schema, kein Foto der Maschine.</span></figcaption>
 </figure>;
}
