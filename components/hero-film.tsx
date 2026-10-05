// DOM/CSS film workspace for the home hero: light table, 135 cartridge line drawing,
// negative strip with real business photographs and an empty contact sheet.
// This is the first paint on every device and the complete mobile / tablet /
// reduced-motion / no-WebGL experience. Geometry lives in app/styles/hero.css (cqw units).
import type {CSSProperties,Ref} from 'react';
import {Sprockets,frameNo} from './analog/primitives';
import {heroFrames,SELECTED_FRAME,SHEET_COLUMNS} from './hero-frames';

type Vars=CSSProperties&Record<`--${string}`,string|number>;
const slot=(i:number):Vars=>({'--i':i,'--col':i%SHEET_COLUMNS,'--row':Math.floor(i/SHEET_COLUMNS)});

/** 135 cartridge as a technical drawing: silver hairlines, amber callouts.
 *  Lying on the table, near end cap towards the viewer, felt lip on the right where the film exits. */
function CartridgeDrawing(){
 return <svg className="hero-cartridge" viewBox="0 0 250 310" fill="none" aria-hidden="true" focusable="false">
  <g className="hc-line">
   {/* far end cap: visible arc solid, hidden arc dashed */}
   <path pathLength={1} d="M54 60 A68 21 0 0 1 190 60"/>
   <path className="hc-hidden" d="M54 60 A68 21 0 0 0 190 60"/>
   {/* spool stub on the far end */}
   <path pathLength={1} d="M106 56 V36 M138 56 V36 M106 36 A16 5 0 0 1 138 36 A16 5 0 0 1 106 36"/>
   {/* body silhouette */}
   <path pathLength={1} d="M60 64 V246 M184 64 V246"/>
   {/* near end cap with flange and spool hub */}
   <path pathLength={1} d="M54 250 A68 21 0 0 0 190 250 A68 21 0 0 0 54 250 Z"/>
   <path pathLength={1} d="M54 250 V242 M190 250 V242 M54 242 A68 21 0 0 0 190 242"/>
   <ellipse pathLength={1} cx="122" cy="253" rx="20" ry="6.4"/>
   <ellipse pathLength={1} cx="122" cy="253" rx="8" ry="2.6"/>
  </g>
  {/* turned-metal body hatching */}
  <g className="hc-hatch"><path d="M78 70 V238 M96 66 V242 M148 66 V242 M166 70 V238"/></g>
  {/* felt light-trap lip along the slot */}
  <g className="hc-lip"><path pathLength={1} d="M184 70 H194 V240 H184"/><path d="M186 82 L192 76 M186 100 L192 94 M186 118 L192 112 M186 136 L192 130 M186 154 L192 148 M186 172 L192 166 M186 190 L192 184 M186 208 L192 202 M186 226 L192 220"/></g>
  {/* amber callouts */}
  <g className="hc-callout">
   <path d="M122 253 L84 288 H18"/><circle cx="122" cy="253" r="2.2"/>
   <path d="M193 226 L212 290 H140"/><circle cx="193" cy="226" r="2.2"/>
   <path d="M122 36 L96 14 H20"/><circle cx="122" cy="36" r="2.2"/>
   <path className="hc-dim" d="M30 70 V240 M24 70 H36 M24 240 H36"/>
  </g>
  <g className="hc-text">
   <text x="18" y="282">SPULE</text>
   <text x="142" y="284">FILZLIPPE</text>
   <text x="20" y="10">135 · PATRONE</text>
   <text x="22" y="160" transform="rotate(-90 22 160)" textAnchor="middle">35 MM</text>
  </g>
 </svg>;
}

export function HeroFilm({sheet,ref}:{sheet:boolean;ref?:Ref<HTMLDivElement>}){
 return <div ref={ref} className="hero-film webgl-fallback" data-view={sheet?'sheet':'strip'}>
  <div className="hero-stage">
   <div className="hero-table" aria-hidden="true"><span className="hero-table-tag">LTB-01 · Leuchtpult</span><i className="hero-table-reg"/></div>
   <div className="hero-sheet" aria-hidden="true">
    <span className="hero-sheet-head"><b>Kontaktbogen</b><span>135 · Nr. 12–19</span></span>
    {heroFrames.map((f,i)=><span key={f.src} className="hero-slot" style={slot(i)}/>)}
   </div>
   <CartridgeDrawing/>
   <div className="hero-strip" aria-hidden="true">
    <Sprockets className="hero-perfs"/>
    <span className="hero-strip-edge">{heroFrames.map((f,i)=><span key={f.edge} style={slot(i)}><b>▸ {f.edge}</b><span>{f.edge}A</span></span>)}</span>
    <span className="hero-strip-windows">{heroFrames.map((f,i)=><i key={f.edge} style={slot(i)}/>)}</span>
    <Sprockets className="hero-perfs hero-perfs-b"/>
   </div>
   <ol className="hero-frames" aria-label="Kontaktbogen mit acht Aufnahmen aus Laden, Labor und Werkstatt">
    {heroFrames.map((f,i)=><li key={f.src} className="hero-frame" style={slot(i)} data-selected={i===SELECTED_FRAME||undefined}>
     <figure className="hero-frame-body">
      <span className="hero-frame-img">
       <img src={f.thumb} srcSet={f.srcSet} sizes="(min-width: 1024px) 16vw, 32vw" alt={f.alt} width={f.width} height={f.height} decoding="async" {...(i===0?{fetchPriority:'high' as const}:{loading:'lazy' as const})}/>
       <span className="hero-frame-latent" aria-hidden="true"/>
      </span>
      <figcaption><span className="hero-frame-no">{frameNo(i+1)}</span> {f.caption}</figcaption>
     </figure>
    </li>)}
   </ol>
   <svg className="hero-grease" style={slot(SELECTED_FRAME)} viewBox="0 0 120 86" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength={1} d="M6 9 C30 4 78 5 113 7 C116 26 115 58 112 80 C80 83 34 82 8 79 C5 58 4 30 7 6 L14 4"/></svg>
  </div>
 </div>;
}
