"use client";
// Compare: a genuine before/after viewer (adapted from Aceternity's Compare, without
// sparkles or autoplay). Generic: two images, two labels, alt texts, an optional caption,
// a native keyboard range and pointer dragging with capture. Images may be ALIGNED for
// presentation by crop/position only (firstBox/secondBox, in % of the stage) — never
// retouched. Can be controlled (percent + onPercentChange) so a caller can choreograph an
// intro (e.g. the digitization scanner pass) and then hand control to the viewer.
// Labels sit outside the photograph (bar under the stage): no text over photographs.
import {useState,type CSSProperties,type ReactNode,type Ref} from 'react';
import {MoveHorizontal} from 'lucide-react';
import {cn} from '@/lib/utils';

/** Placement of an image inside the stage, in percent of the stage box. */
export type CompareBox={left:number;top:number;width:number;height:number};

export type CompareProps={
 firstImage?:string;secondImage?:string;
 firstLabel?:string;secondLabel?:string;
 firstAlt?:string;secondAlt?:string;
 /** Visible caption under the viewer (figcaption). */
 caption?:ReactNode;
 /** Accessible name of the range control. */
 rangeLabel?:string;
 /** CSS aspect-ratio of the stage. Default 3 / 2. */
 aspect?:string;
 /** Intrinsic pixel size for the width/height attributes. Default 1200 × 800. */
 imageWidth?:number;imageHeight?:number;
 /** Optional alignment (crop/position only) of each image inside the stage. */
 firstBox?:CompareBox;secondBox?:CompareBox;
 /** Alignment of the photos inside their box when no box is given (object-position). */
 objectPosition?:string;
 percent?:number;defaultPercent?:number;onPercentChange?:(percent:number)=>void;
 /** Fired on every user interaction (pointer down, keyboard/range input). */
 onInteract?:()=>void;
 loading?:'lazy'|'eager';
 className?:string;
 stageRef?:Ref<HTMLDivElement>;
 /** Extra state attribute for styling a choreographed intro (e.g. "scan"). */
 state?:string;
};

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const place=(box?:CompareBox):CSSProperties|undefined=>box?{left:`${box.left}%`,top:`${box.top}%`,width:`${box.width}%`,height:`${box.height}%`}:undefined;

export function Compare({
 firstImage='',secondImage='',
 firstLabel='Adox Adonal',secondLabel='Kodak D-76',
 firstAlt,secondAlt,caption,rangeLabel='Entwickleraufnahmen vergleichen',
 aspect='3 / 2',imageWidth=1200,imageHeight=800,firstBox,secondBox,objectPosition,
 percent,defaultPercent=50,onPercentChange,onInteract,loading='lazy',className,stageRef,state,
}:CompareProps){
 const [inner,setInner]=useState(defaultPercent);
 const controlled=typeof percent==='number';
 const value=clamp(controlled?percent:inner);
 const update=(next:number)=>{const v=clamp(next);if(!controlled)setInner(v);onPercentChange?.(v)};
 const move=(el:HTMLElement,x:number)=>{const r=el.getBoundingClientRect();if(r.width)update((x-r.left)/r.width*100)};
 // Legacy default alts keep the original lab callers (Kodak Tri-X developer samples) meaningful.
 const alt1=firstAlt??`Kodak Tri-X, entwickelt in ${firstLabel}`;
 const alt2=secondAlt??`Kodak Tri-X, entwickelt in ${secondLabel}`;
 const imgStyle=(box?:CompareBox):CSSProperties=>({...(place(box)??{inset:0,width:'100%',height:'100%'}),...(objectPosition?{objectPosition}:{})});
 return <figure className={cn('compare',className)} data-state={state}>
  <div ref={stageRef} className="compare-stage" style={{aspectRatio:aspect}}
   onPointerDown={e=>{if(e.button!==0)return;onInteract?.();e.currentTarget.setPointerCapture(e.pointerId);move(e.currentTarget,e.clientX)}}
   onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.currentTarget,e.clientX)}}>
   <img className="compare-img" src={secondImage} alt={alt2} width={imageWidth} height={imageHeight} loading={loading} decoding="async" draggable={false} style={imgStyle(secondBox)}/>
   <div className="compare-first" style={{clipPath:`inset(0 ${100-value}% 0 0)`}}>
    <img className="compare-img" src={firstImage} alt={alt1} width={imageWidth} height={imageHeight} loading={loading} decoding="async" draggable={false} style={imgStyle(firstBox)}/>
   </div>
   <div className="compare-line" style={{left:`${value}%`}} aria-hidden="true"><span className="compare-handle"><MoveHorizontal size={16} strokeWidth={1.6}/></span></div>
  </div>
  <div className="compare-bar">
   <span className="compare-label compare-label-first">{firstLabel}</span>
   <input className="compare-range" type="range" min={0} max={100} step={1} value={Math.round(value)} aria-label={rangeLabel} aria-valuetext={`${Math.round(value)} % ${firstLabel}, ${100-Math.round(value)} % ${secondLabel}`}
    onKeyDown={()=>onInteract?.()} onPointerDown={()=>onInteract?.()} onChange={e=>update(Number(e.target.value))}/>
   <span className="compare-label compare-label-second">{secondLabel}</span>
  </div>
  {caption&&<figcaption className="compare-caption">{caption}</figcaption>}
 </figure>;
}
