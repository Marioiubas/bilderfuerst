"use client";
// Order summary as a lab envelope / order ticket on photo-white paper. Printable as a note to bring
// along (no order number, not binding, no payment). Prices come from the resolved catalog variant.
import {useEffect,useRef} from 'react';
import {ArrowUpRight,Plus,Printer,RotateCcw} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {lockFigure} from '@/motion/film';
import {SOURCE_DATE,deliveries,formats,masterSource,processes,scanLabel,scanSizes,type DeliveryId,type FormatId,type ProcessId,type ScanId,type Variant} from './film-data';

type Props={format:FormatId|null;process:ProcessId|null;scan:ScanId|null;qty:number;delivery:DeliveryId|null;variant?:Variant;estimate:number|null;missing:string[];roll:number;added:boolean;animate:boolean;onAdd:()=>void;onAnother:()=>void};

export function LabTicket({format,process,scan,qty,delivery,variant,estimate,missing,roll,added,animate,onAdd,onAnother}:Props){
 const total=variant?variant.price*qty:null;
 const totalRef=useRef<HTMLElement>(null);const dateRef=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(!animate)return;const a=lockFigure(totalRef.current);return()=>{a?.revert()}},[total,animate]);
 // Date on the printed note, also when printing via the browser menu.
 useEffect(()=>{const stamp=()=>{if(dateRef.current)dateRef.current.textContent=new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})};window.addEventListener('beforeprint',stamp);return()=>window.removeEventListener('beforeprint',stamp)},[]);
 const p=process?processes[process]:null;
 const sizes=format&&scan&&scan!=='Ohne Scan'?scanSizes[format]:[];
 const size=sizes.length?(sizes.length>2?`${sizes[0].w} × ${sizes[0].h} bis ${sizes[sizes.length-1].w} × ${sizes[sizes.length-1].h} px`:`${sizes[0].w} × ${sizes[0].h} px`):'';
 const open=<span className="tk-open">noch wählen</span>;
 function print(){window.print()}
 return <section className="tk-ticket" aria-labelledby="tk-title" data-complete={!!variant}>
  <div className="tk-flap" aria-hidden="true"/>
  <header className="tk-head">
   <span className="tk-frame mono" aria-hidden="true">06</span>
   <div><h2 id="tk-title" className="tk-title">Auftragsnotiz</h2><p className="mono tk-sub">Labor · Analog Store Fürth · Rolle {roll}</p></div>
  </header>
  <p className="tk-print-only">Notiz zum Mitbringen – kein verbindlicher Auftrag, keine Auftragsnummer, keine Zahlung. Erstellt am <span ref={dateRef}/>.</p>
  <dl className="tk-fields">
   <div><dt>Format</dt><dd>{format?<>{formats[format].name} <span>{formats[format].sub}</span></>:open}</dd></div>
   <div><dt>Prozess</dt><dd>{p?<><span className={`chip chip-${p.kind}`}>{p.label}</span> <span>{p.machine}</span></>:open}</dd></div>
   <div><dt>Scan</dt><dd>{scan?<>{scanLabel(format,scan)}{size&&<span className="num"> · {size}</span>}{scan!=='Ohne Scan'&&format==='110'&&<span> · Auflösung nicht veröffentlicht</span>}</>:open}</dd></div>
   <div><dt>Menge</dt><dd className="num">{qty} {qty===1?'Film':'Filme'}</dd></div>
   <div><dt>Abgabe</dt><dd>{delivery?deliveries[delivery].label:<span className="tk-open">optional</span>}</dd></div>
  </dl>
  <div className="tk-tear" aria-hidden="true"/>
  <div className="tk-stub">
   <p className="tk-variant"><span className="mono">Variante</span>{variant?variant.name:'Wird aus Format, Prozess und Scan bestimmt'}</p>
   <dl className="tk-price">
    <div><dt>Einzelpreis</dt><dd className="num">{variant?formatPrice(variant.price):estimate!==null?`ab ${formatPrice(estimate)}`:'—'}</dd></div>
    <div className="tk-total"><dt>Gesamt</dt><dd className="num"><strong ref={totalRef}>{total!==null?formatPrice(total):'—'}</strong><span>inkl. MwSt.</span></dd></div>
   </dl>
   <p className="tk-meta">Bearbeitungszeit bitte im Laden erfragen.</p>
   <div className="tk-cta">
    <button type="button" className="btn btn-primary btn-block" disabled={!variant?.inStock} onClick={onAdd} aria-describedby={missing.length?'tk-missing':undefined}>{added?'Noch einmal hinzufügen':'In den Vorschau-Warenkorb'} <Plus size={18} aria-hidden="true"/></button>
    {missing.length>0&&<p id="tk-missing" className="tk-missing">Noch wählen: {missing.join(', ')}</p>}
    {added&&<p className="tk-added" role="status">Im Vorschau-Warenkorb. Keine Zahlung in dieser Vorschau.</p>}
   </div>
   <div className="tk-actions">
    <a className="tk-act" href={variant?.source??masterSource(format)} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14} aria-hidden="true"/> {variant?'Diese Entwicklung im Originalshop':'Filmentwicklung im Originalshop'} <span className="sr-only">(öffnet neues Fenster)</span></a>
    <button type="button" className="tk-act" disabled={!variant?.inStock} onClick={onAnother}><RotateCcw size={14} aria-hidden="true"/> Weitere Rolle mit anderen Optionen</button>
    <button type="button" className="tk-act" onClick={print} aria-describedby="tk-fine"><Printer size={14} aria-hidden="true"/> Auftragsnotiz drucken</button>
    <p className="tk-fine" id="tk-fine">Notiz zum Mitbringen – kein verbindlicher Auftrag, keine Auftragsnummer.</p>
   </div>
   <p className="snapshot-note">Quellstand {SOURCE_DATE} · Keine Zahlung in dieser Vorschau</p>
  </div>
 </section>;
}
