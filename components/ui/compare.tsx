"use client";
// Aceternity Compare, adapted from the official registry: no sparkles/autoplay,
// genuine sample labels, native keyboard range and pointer capture.
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Compare({firstImage='',secondImage='',className,firstLabel='Adox Adonal',secondLabel='Kodak D-76'}:{firstImage?:string;secondImage?:string;className?:string;firstLabel?:string;secondLabel?:string}) {
 const [percent,setPercent]=useState(50); const ref=useRef<HTMLDivElement>(null);
 function move(x:number){const r=ref.current?.getBoundingClientRect(); if(r)setPercent(Math.max(0,Math.min(100,(x-r.left)/r.width*100)));}
 return <div className={cn('compare',className)}>
  <div ref={ref} className="compare-images" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientX)}} onPointerMove={e=>{if(e.buttons===1)move(e.clientX)}}>
   <img src={secondImage} alt={`Kodak Tri-X, entwickelt in ${secondLabel}`} width={1200} height={800}/>
   <motion.div className="compare-first" style={{clipPath:`inset(0 ${100-percent}% 0 0)`}}><img src={firstImage} alt={`Kodak Tri-X, entwickelt in ${firstLabel}`} width={1200} height={800}/></motion.div>
   <div className="compare-line" style={{left:`${percent}%`}}><span><MoveHorizontal size={18}/></span></div>
   <span className="compare-label left">{firstLabel}</span><span className="compare-label right">{secondLabel}</span>
  </div>
  <label className="compare-range">Zwei Entwickler. Ein Motiv.<input type="range" min="0" max="100" value={percent} onChange={e=>setPercent(Number(e.target.value))} aria-label="Entwickleraufnahmen vergleichen"/></label>
 </div>
}
