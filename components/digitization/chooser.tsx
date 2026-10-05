"use client";
// "Was hast du?" — object-first chooser. Customers pick the THING in their hand, not a
// format name. Real radio group (fieldset + native radios styled as tiles, arrow keys work),
// silhouettes drawn to one common scale. The panel shows formats, verified service copy,
// published prices / delivery and the source detail page.
import Link from 'next/link';
import {useEffect,useRef,type RefObject} from 'react';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {panelLock,tileScan} from '@/motion/digitization';
import {objects,SOURCE_DATE,type DigiObject,type EstimateMode,type ObjectId,type PriceTable} from './data';
import {Silhouette} from './silhouettes';

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

function Detail({item,onEstimate,panelRef}:{item:DigiObject;onEstimate:(mode:EstimateMode)=>void;panelRef:RefObject<HTMLDivElement|null>}){
 const mode=item.estimate;
 return <div className="dz-detail" ref={panelRef} id="dz-detail">
  <header className="dz-detail-head" data-lock>
   <span className="mono dz-detail-code">OBJ {item.code}</span>
   <h3>{item.name}</h3>
   {mode&&<a href="#schaetzung" className="link" onClick={()=>onEstimate(mode)}>Kosten schätzen <ArrowDown size={15}/></a>}
  </header>
  <div className="dz-detail-col" data-lock>
   <h4 className="mono">Das kann es sein</h4>
   <ul className="dz-formats">{item.formats.map(f=><li key={f}>{f}</li>)}</ul>
   {item.formatsNote&&<p className="dz-note">{item.formatsNote}</p>}
  </div>
  <div className="dz-detail-col" data-lock>
   <h4 className="mono">Das machen wir</h4>
   {item.serviceLead&&<p className="dz-service-lead">{item.serviceLead}</p>}
   <ul className="dz-checks">{item.service.map(s=><li key={s}>{s}</li>)}</ul>
   {item.stats&&<dl className="dz-stats">{item.stats.map(s=><div key={s.k}><dt className="mono">{s.k}</dt><dd>{s.v}</dd></div>)}</dl>}
  </div>
  <div className="dz-detail-col" data-lock>
   <h4 className="mono">Preis & Lieferzeit</h4>
   {item.prices?<Prices table={item.prices}/>:<p className="dz-ask"><span className="status status-ask">Preis nach Absprache</span>{item.priceNote}</p>}
   {item.prices&&item.priceNote&&<p className="dz-note">{item.priceNote}</p>}
   {item.delivery&&<p className="dz-delivery"><span className="mono">Lieferzeit</span>{item.delivery}</p>}
   <Link href={item.link.href} className="link dz-detail-link">{item.link.label} <ArrowUpRight size={15}/></Link>
  </div>
 </div>;
}

export function Chooser({selected,onSelect,onEstimate}:{selected:ObjectId;onSelect:(id:ObjectId)=>void;onEstimate:(mode:EstimateMode)=>void}){
 const tiles=useRef<HTMLFieldSetElement>(null);const panel=useRef<HTMLDivElement>(null);const first=useRef(true);
 const item=objects.find(o=>o.id===selected)??objects[0];
 useEffect(()=>{
  if(first.current){first.current=false;return}
  const tile=tiles.current?.querySelector<HTMLElement>(`[data-object="${selected}"]`)??null;
  const a=tileScan(tile);const b=panelLock(panel.current);
  return()=>{a?.revert();b?.revert()};
 },[selected]);
 return <section id="was-hast-du" className="dz-sec zone-graphite" aria-labelledby="dz-chooser-title">
  <div className="wrap">
   <SectionHead code="SCN" label="01 · Was hast du?" index="Objekt wählen" id="dz-chooser-title" title={<>Du musst den Formatnamen<br/>nicht kennen.</>}/>
   <p className="lead dz-sec-lead">Wähle das Objekt, das vor dir liegt. Wir zeigen dir, welche Formate es sein kann, was wir damit machen und was es laut Preisliste kostet.</p>
   <fieldset className="dz-tiles" ref={tiles}>
    <legend className="sr-only">Welches Objekt hältst du in der Hand?</legend>
    {objects.map(o=><label key={o.id} className="dz-tile" data-object={o.id}>
     <input type="radio" name="dz-object" value={o.id} checked={selected===o.id} onChange={()=>onSelect(o.id)} className="sr-only"/>
     <span className="dz-tile-code mono" aria-hidden="true">{o.code}</span>
     <Silhouette id={o.id}/>
     <span className="dz-tile-name">{o.name}</span>
     <span className="dz-tile-hint">{o.hint}</span>
     <span className="dz-tile-scan" aria-hidden="true"/>
    </label>)}
   </fieldset>
   <p className="dz-scale-note mono" aria-hidden="true"><span className="dz-scale-bar"/>Alle Objekte im selben Maßstab gezeichnet · Balken = 10 cm</p>
   <p className="sr-only" aria-live="polite">Ausgewählt: {item.name}</p>
   <Detail item={item} onEstimate={onEstimate} panelRef={panel}/>
  </div>
 </section>;
}
