"use client";
// "Was hast du?" — object-first chooser. Customers pick the THING in their hand, not a
// format name. Real radio group (fieldset + native radios styled as tiles, arrow keys work),
// silhouettes drawn to one common scale. The panel shows formats, verified service copy,
// published prices / delivery and the source detail page.
//
// The detail panel sits INSIDE the tile grid, directly after the row of the chosen tile
// (audit M5): tiles get order 0,2,4…; the panel gets the order of its row's last tile + 1,
// per breakpoint (7 columns ≥ 1181 px, 4 columns ≥ 768 px, a one-column list on phones, so
// on phones the panel opens right under the tile). When the panel moves, the scroll position
// is corrected so the tapped tile stays under the finger; if the panel head is then below
// the fold, the page scrolls the tile to the top (smooth only when motion is allowed).
// Until the first choice no radio is checked: from 768 px the panel previews the first
// object (its tile marked as preview); on phones the list starts collapsed (accordion), so
// all seven objects fit one screen and nothing splits the list before a choice.
import Link from 'next/link';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {panelLock,tileScan} from '@/motion/digitization';
import {motionAllowed} from '@/motion/reduced-motion';
import {objects,SOURCE_DATE,type DigiObject,type EstimateMode,type ObjectId,type PriceTable} from './data';
import {Silhouette} from './silhouettes';
import {Fold} from './fold';
import {sectionLabel} from './jump-index';

function Prices({table}:{table:PriceTable}){
 return <div className="dz-prices-wrap">
  <table className="dz-prices">
   <caption className="mono">{table.caption}</caption>
   <thead><tr><th scope="col"><span className="sr-only">Material</span></th>{table.cols.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead>
   <tbody>{table.rows.map(r=><tr key={r.label}><th scope="row">{r.label}{r.note&&<span className="dz-prices-note">{r.note}</span>}</th>{r.values.length===1?<td colSpan={table.cols.length}>{r.values[0]}</td>:r.values.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody>
  </table>
  {table.extras&&<ul className="dz-extras">{table.extras.map(x=><li key={x}>{x}</li>)}</ul>}
  <p className="dz-source">Quelle: {table.source} · gelesen am {SOURCE_DATE}</p>
 </div>;
}

function Detail({item,onEstimate,panelRef,style}:{item:DigiObject;onEstimate:(mode:EstimateMode)=>void;panelRef:RefObject<HTMLDivElement|null>;style:CSSProperties}){
 const mode=item.estimate;
 return <div className="dz-detail" ref={panelRef} id="dz-detail" style={style}>
  <header className="dz-detail-head" data-lock>
   <span className="mono dz-detail-code">OBJ {item.code}</span>
   <h3>{item.name}</h3>
   {mode&&<a href="#schaetzung" className="link dz-hit" onClick={()=>onEstimate(mode)}>Kosten schätzen <ArrowDown size={15}/></a>}
  </header>
  <div className="dz-detail-col" data-lock>
   <Fold id={`dz-fold-formats-${item.id}`} title="Das kann es sein" titleClassName="mono">
    <ul className="dz-formats">{item.formats.map(f=><li key={f}>{f}</li>)}</ul>
    {item.formatsNote&&<p className="dz-note">{item.formatsNote}</p>}
   </Fold>
  </div>
  <div className="dz-detail-col" data-lock>
   <Fold id={`dz-fold-service-${item.id}`} title="Das machen wir" titleClassName="mono">
    {item.serviceLead&&<p className="dz-service-lead">{item.serviceLead}</p>}
    <ul className="dz-checks">{item.service.map(s=><li key={s}>{s}</li>)}</ul>
    {item.stats&&<dl className="dz-stats">{item.stats.map(s=><div key={s.k}><dt className="mono">{s.k}</dt><dd>{s.v}</dd></div>)}</dl>}
   </Fold>
  </div>
  <div className="dz-detail-col dz-detail-price" data-lock>
   <h4 className="mono">Preis & Lieferzeit</h4>
   {item.prices?<Prices table={item.prices}/>:<p className="dz-ask"><span className="status status-ask">Preis nach Absprache</span>{item.priceNote}</p>}
   {item.prices&&item.priceNote&&<p className="dz-note">{item.priceNote}</p>}
   {item.delivery&&<p className="dz-delivery"><span className="mono">Lieferzeit</span>{item.delivery}</p>}
   <Link href={item.link.href} className="link dz-detail-link dz-hit">{item.link.label} <ArrowUpRight size={15}/></Link>
  </div>
 </div>;
}

/** Last tile index of the row that holds tile i in a grid of `cols` columns. */
const rowEnd=(i:number,cols:number)=>Math.min(objects.length-1,Math.floor(i/cols)*cols+cols-1);

export function Chooser({selected,onSelect,onEstimate}:{selected:ObjectId;onSelect:(id:ObjectId)=>void;onEstimate:(mode:EstimateMode)=>void}){
 const tiles=useRef<HTMLFieldSetElement>(null);const panel=useRef<HTMLDivElement>(null);const first=useRef(true);
 const anchor=useRef<{id:ObjectId;top:number}|null>(null);
 const [picked,setPicked]=useState(false);
 const index=Math.max(0,objects.findIndex(o=>o.id===selected));
 const item=objects[index];
 const tileOf=(id:ObjectId)=>tiles.current?.querySelector<HTMLElement>(`[data-object="${id}"]`)??null;
 const choose=(id:ObjectId)=>{const t=tileOf(id);anchor.current=t?{id,top:t.getBoundingClientRect().top}:null;setPicked(true);onSelect(id)};
 // Keep the chosen tile where the finger is; then reveal the panel head if it is off-screen.
 useLayoutEffect(()=>{
  const a=anchor.current;anchor.current=null;
  const t=a&&tileOf(a.id);if(!a||!t)return;
  const delta=t.getBoundingClientRect().top-a.top;
  if(Math.abs(delta)>.5)window.scrollBy({top:delta,behavior:'instant'});
  const p=panel.current;if(!p||p.getBoundingClientRect().top<=window.innerHeight-140)return;
  const bar=document.querySelector('.site-header')?.getBoundingClientRect().bottom??0;
  window.scrollBy({top:t.getBoundingClientRect().top-Math.max(0,bar)-16,behavior:motionAllowed()?'smooth':'instant'});
 },[selected,picked]);
 useEffect(()=>{
  if(first.current){first.current=false;return}
  const a=tileScan(tileOf(selected));const b=panelLock(panel.current);
  return()=>{a?.revert();b?.revert()};
 },[selected,picked]);
 const at=(cols:number)=>rowEnd(index,cols)*2+1;
 return <section id="was-hast-du" className="dz-sec zone-graphite" aria-labelledby="dz-chooser-title">
  <div className="wrap">
   <SectionHead code="SCN" label={sectionLabel('01')} index="Was hast du?" id="dz-chooser-title" title={<>Du musst den Formatnamen<br/>nicht kennen.</>}/>
   <p className="lead dz-sec-lead">Wähle das Objekt, das vor dir liegt. Wir zeigen dir direkt darunter, welche Formate es sein kann, was wir damit machen und was es laut Preisliste kostet.</p>
   <fieldset className="dz-tiles" ref={tiles} data-picked={picked?'':undefined}>
    <legend className="sr-only">Welches Objekt hältst du in der Hand?</legend>
    {objects.map((o,i)=><label key={o.id} className="dz-tile" data-object={o.id} data-state={selected===o.id?(picked?'on':'preview'):undefined} style={{order:i*2}}>
     <input type="radio" name="dz-object" value={o.id} checked={picked&&selected===o.id} onChange={()=>choose(o.id)} className="sr-only"/>
     <span className="dz-tile-code mono" aria-hidden="true">{o.code}</span>
     <Silhouette id={o.id}/>
     <span className="dz-tile-name">{o.name}</span>
     <span className="dz-tile-hint">{o.hint}</span>
     <span className="dz-tile-scan" aria-hidden="true"/>
    </label>)}
    <Detail item={item} onEstimate={onEstimate} panelRef={panel} style={{'--o-xl':at(7),'--o-md':at(4),'--o-sm':at(1)} as CSSProperties}/>
   </fieldset>
   <div className="dz-tiles-foot">
    <p className="dz-scale-note mono" aria-hidden="true"><span className="dz-scale-bar"/>Alle Objekte im selben Maßstab gezeichnet · Balken = 10 cm</p>
    <a href="#erkennen" className="link dz-hit dz-unsure">Nicht sicher? Format erkennen <ArrowDown size={15}/></a>
   </div>
   <p className="sr-only" aria-live="polite">{picked?`Ausgewählt: ${item.name}`:''}</p>
  </div>
 </section>;
}
