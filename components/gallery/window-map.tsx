"use client";
// Hängeplan: a CSS technical drawing of the corner window (positions 01–09) and the shop wall (10–12).
// Each position is a button that opens the same print as the wall. No exhibition data is implied.
import {prints,windowPrints,shopPrints,galleryFacts,type Print} from './prints';

function Slot({p,onOpen}:{p:Print;onOpen:(index:number)=>void}){
 const index=prints.indexOf(p);
 return <li><button type="button" className="gal-map-slot" onClick={()=>onOpen(index)} aria-label={`Platz ${p.id}, ${p.place==='fenster'?'Schaufenster':'im Laden'}: ${p.title} – vergrößern`}>
  <span className="gal-map-no num">{p.id}</span><span className="gal-map-name">{p.title}</span>
 </button></li>;
}

export function WindowMap({onOpen}:{onOpen:(index:number)=>void}){
 return <div className="gal-map" role="group" aria-label="Hängeplan des Schaufensters">
  <p className="gal-map-street mono" aria-hidden="true"><span>{galleryFacts.corner}</span></p>
  <div className="gal-map-facade">
   <div className="gal-map-window">
    <p className="gal-map-label mono"><b>Schaufenster</b> · 24 h</p>
    <ol className="gal-map-grid">{windowPrints.map(p=><Slot key={p.id} p={p} onOpen={onOpen}/>)}</ol>
    <span className="gal-map-sill" aria-hidden="true"><i/><i/><i/></span>
   </div>
   <div className="gal-map-shop">
    <p className="gal-map-label mono"><b>Im Laden</b></p>
    <ol className="gal-map-stack">{shopPrints.map(p=><Slot key={p.id} p={p} onOpen={onOpen}/>)}</ol>
   </div>
  </div>
  <p className="gal-map-legend mono" aria-hidden="true"><span>01–09 Schaufenster · 10–12 Laden</span><span>Plan, nicht maßstäblich</span></p>
 </div>;
}
