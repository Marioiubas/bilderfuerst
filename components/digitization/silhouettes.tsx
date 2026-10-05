// Object silhouettes for the "Was hast du?" chooser. Every drawing uses the SAME scale:
// the viewBox is 240 × 180 millimetres, so a slide (50 mm) is drawn next to a VHS cassette
// (187 × 103 mm) or an LP (302 mm) exactly in proportion. The bar at the bottom is 10 cm.
// Generic technical drawings, no brand marks. Decorative: the label text carries the meaning.
import type {ObjectId} from './data';

const f=(n:number)=>n.toFixed(2);
/** Annular sector between radii r1/r2 from angle a0 to a1 (degrees) — reel windows. */
export function sector(cx:number,cy:number,r1:number,r2:number,a0:number,a1:number){
 const p=(r:number,a:number)=>`${f(cx+r*Math.cos(a*Math.PI/180))} ${f(cy+r*Math.sin(a*Math.PI/180))}`;
 return `M${p(r1,a0)}L${p(r2,a0)}A${r2} ${r2} 0 0 1 ${p(r2,a1)}L${p(r1,a1)}A${r1} ${r1} 0 0 0 ${p(r1,a0)}Z`;
}

function Scale(){return <g className="sc"><path d="M10 172H110M10 168V172M60 170V172M110 168V172"/></g>}

/** Film reel: outer flange, windows, hub and centre hole (large round = Super 8). */
function Reel({cx,cy,r}:{cx:number;cy:number;r:number}){
 const win=[0,1,2,3].map(k=>sector(cx,cy,r*.34,r*.84,k*90+14,k*90+76));
 return <g><circle className="f" cx={cx} cy={cy} r={r}/>{win.map((d,i)=><path key={i} className="d" d={d}/>)}<circle className="o" cx={cx} cy={cy} r={r*.22}/><circle className="h" cx={cx} cy={cy} r={Math.max(4,r*.1)}/></g>;
}

const strip=(()=>{
 const x0=6,y0=72,perfs:number[]=[];for(let i=0;i<48;i++)perfs.push(x0+1.1+i*4.75);
 return{x0,y0,perfs,frames:[0,1,2,3,4,5].map(j=>x0+1+j*38)};
})();

export function Silhouette({id}:{id:ObjectId}){
 return <svg className="dz-sil" viewBox="0 0 240 180" aria-hidden="true" focusable="false">
  {id==='dia'&&<g>
   <rect className="f" x="60" y="84" width="50" height="50" rx="2"/>
   <rect className="f" x="14" y="112" width="212" height="44" rx="2"/>
   <path className="o g" d={Array.from({length:49},(_,i)=>`M${f(20+i*4.2)} 112V120`).join('')}/>
   <rect className="f" x="148" y="52" width="50" height="50" rx="2"/>
   <rect className="d h" x="155" y="65" width="36" height="24"/>
  </g>}
  {id==='negativ'&&<g>
   <rect className="f" x={strip.x0} y={strip.y0} width="228" height="35"/>
   {strip.frames.map(x=><rect key={x} className="d" x={x} y={strip.y0+5.5} width="36" height="24"/>)}
   {strip.perfs.map(x=><g key={x} className="ph"><rect x={x} y={strip.y0+2} width="2.8" height="2"/><rect x={x} y={strip.y0+31} width="2.8" height="2"/></g>)}
   <path className="h" d={`M${strip.x0} ${strip.y0}H${strip.x0+228}M${strip.x0} ${strip.y0+35}H${strip.x0+228}`}/>
  </g>}
  {id==='foto'&&<g>
   <g transform="rotate(5 150 96)"><rect className="f" x="85" y="51" width="130" height="90"/><rect className="d" x="91" y="57" width="118" height="78"/></g>
   <g transform="rotate(-6 100 90)"><rect className="f" x="25" y="40" width="150" height="100"/><rect className="d h" x="31" y="46" width="138" height="88"/></g>
  </g>}
  {id==='film'&&<g><Reel cx={78} cy={88} r={63.5}/><Reel cx={184} cy={116} r={38}/></g>}
  {id==='video'&&<g>
   <rect className="f" x="26.5" y="38.5" width="187" height="103" rx="3"/>
   <rect className="d" x="62" y="56" width="116" height="38" rx="2"/>
   <circle className="h" cx="82" cy="75" r="11"/><circle className="h" cx="158" cy="75" r="11"/>
   <rect className="o" x="48" y="104" width="144" height="28"/>
  </g>}
  {id==='audio'&&<g>
   <circle className="f" cx="52" cy="92" r="89"/>
   {[0,1,2].map(k=><path key={k} className="d" d={sector(52,92,24,74,k*120+18,k*120+102)}/>)}
   <circle className="o" cx="52" cy="92" r="14"/><circle className="o" cx="52" cy="92" r="4"/>
   <rect className="f" x="128" y="58" width="100.4" height="63.8" rx="2.5"/>
   <rect className="o" x="135" y="64" width="86.4" height="38"/>
   <rect className="d" x="166" y="76" width="24" height="14"/>
   <circle className="h" cx="157.4" cy="83" r="4.5"/><circle className="h" cx="198.6" cy="83" r="4.5"/>
   <path className="o" d="M143 121.8L148 109H208L213 121.8"/>
  </g>}
  {id==='platte'&&<g>
   <circle className="f" cx="176" cy="160" r="151"/>
   {[62,74,86,98,110,122,134,146].map(r=><circle key={r} className="o g" cx="176" cy="160" r={r}/>)}
   <circle className="d" cx="176" cy="160" r="50"/>
   <circle className="h" cx="176" cy="160" r="3.6"/>
  </g>}
  <Scale/>
 </svg>;
}
