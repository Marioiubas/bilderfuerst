"use client";
// Signature experience #2: film development configurator (/filmentwicklung).
// 01 Format → 02 Prozess → 03 Scan → 04 Menge → 05 Abgabe (optional) → order note ("Notiz", the summary,
// numbered outside the choice steps; count derived from STEPS, audit P4). Phones: compact intro,
// 48 px progress row instead of the sticky strip and a summary dock once a price exists (audit M4).
// Every combination resolves to a REAL catalog variant (lib/catalog.json); unsupported combinations
// are not offered. URL state: ?format=35mm|120|110&process=C-41|S/W|S/W%20Push/Pull|E-6&scan=Ohne%20Scan|JPG|TIFF&qty=n
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Minus,Plus} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {track} from '@/lib/analytics';
import {motionAllowed} from '@/motion/reduced-motion';
import {useStore} from './store-context';
import {FilmStrip,type StripFrame} from './lab/film-strip';
import {ProgressRow} from './lab/progress-row';
import {SummaryDock} from './lab/summary-dock';
import {ProcessTank} from './lab/process-tank';
import {LabTicket} from './lab/lab-ticket';
import {ScanSpecs} from './lab/scan-specs';
import {DeveloperLab} from './lab/developer-lab';
import {FormatGlyph} from './lab/format-glyph';
import {DELIVERY_IDS,FORMAT_IDS,PROCESS_IDS,SCAN_IDS,STEPS,STEP_COUNT_LABEL,SUMMARY_STEP,deliveries,encParam,findVariant,formatDelta,formats,formatsFor,megapixels,minPrice,parseFormat,parseProcess,parseQty,parseScan,processes,processesFor,scanLabel,scanSizes,stepNo,tiffPremium,type DeliveryId,type FormatId,type ProcessId,type ScanId,type Selection,type StepId} from './lab/film-data';

type Price={text:string;tone:'delta'|'abs'|'from'|'current'|'none'};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');

function PriceTag({price}:{price:Price}){
 return <span className="fc-price" data-tone={price.tone}>
  {price.tone==='current'&&<span className="fc-price-sel">gewählt</span>}
  {price.tone==='delta'&&<span className="sr-only">Preisänderung </span>}
  <span className="num">{price.text}</span>
 </span>;
}

function scanSizeLine(f:FormatId|null,s:ScanId){
 if(s==='Ohne Scan')return 'Keine Dateien';
 if(!f)return 'Pixelmaß je nach Format';
 const rows=scanSizes[f];
 if(!rows.length)return 'Auflösung nicht veröffentlicht';
 if(f==='35mm')return `${rows[0].w} × ${rows[0].h} px · ≈ ${megapixels(rows[0].w,rows[0].h)} MP (berechnet)`;
 return `${rows[0].w} × ${rows[0].h} bis ${rows[rows.length-1].w} × ${rows[rows.length-1].h} px je nach Bildformat`;
}

export function FilmConfigurator(){
 const {add}=useStore();
 const [format,setFormat]=useState<FormatId|null>(null);
 const [process,setProcess]=useState<ProcessId|null>(null);
 const [scan,setScan]=useState<ScanId|null>(null);
 const [qty,setQty]=useState(1);
 const [qtyDone,setQtyDone]=useState(false);
 const [delivery,setDelivery]=useState<DeliveryId|null>(null);
 const [expert,setExpert]=useState(false);
 const [notice,setNotice]=useState('');
 const [added,setAdded]=useState(false);
 const [roll,setRoll]=useState(1);
 const [animate,setAnimate]=useState(false);
 const started=useRef(false);const urlSync=useRef(false);const timer=useRef<number|undefined>(undefined);
 const formatHead=useRef<HTMLHeadingElement>(null);

 const variant=format&&process&&scan?findVariant(format,process,scan):undefined;
 const estimate=minPrice({format,process,scan});
 const premium=tiffPremium(format,process);
 const missing=[!format&&'Format',!process&&'Prozess',!scan&&'Scan'].filter((x):x is string=>!!x);

 // Deep link (PDP bridge): read params once on load.
 useEffect(()=>{
  const q=new URLSearchParams(window.location.search);
  const f=parseFormat(q.get('format')),p=parseProcess(q.get('process')),s=parseScan(q.get('scan')),n=parseQty(q.get('qty'));
  if(!f&&!p&&!s&&!n)return;
  urlSync.current=true;
  let proc=p;
  if(f&&p&&!processesFor(f).includes(p)){proc=null;setNotice(`${processes[p].label} gibt es für ${formats[f].name} nicht. Bitte den Prozess wählen.`)}
  setFormat(f);setProcess(proc);setScan(s);if(n){setQty(n);setQtyDone(true)}
 },[]);
 // Keep the URL in sync (replaceState integrates with the Next.js router).
 useEffect(()=>{
  if(!urlSync.current)return;
  const parts:string[]=[];
  if(format)parts.push(`format=${encParam(format)}`);
  if(process)parts.push(`process=${encParam(process)}`);
  if(scan)parts.push(`scan=${encParam(scan)}`);
  if(qtyDone||qty!==1)parts.push(`qty=${qty}`);
  const next=`${window.location.pathname}${parts.length?`?${parts.join('&')}`:''}${window.location.hash}`;
  if(next!==`${window.location.pathname}${window.location.search}${window.location.hash}`)window.history.replaceState(null,'',next);
 },[format,process,scan,qty,qtyDone]);
 useEffect(()=>()=>window.clearTimeout(timer.current),[]);

 function touch(){
  if(!started.current){started.current=true;track('start_film_configurator',{entry:urlSync.current?'deeplink':'direct'})}
  urlSync.current=true;setAnimate(true);setAdded(false);
 }
 function chooseFormat(f:FormatId){
  touch();setFormat(f);
  if(process&&!processesFor(f).includes(process)){setNotice(`${processes[process].label} gibt es für ${formats[f].name} nicht. Bitte den Prozess neu wählen.`);setProcess(null)}else setNotice('');
 }
 function chooseProcess(p:ProcessId){touch();setProcess(p);setNotice('')}
 function chooseScan(s:ScanId){touch();setScan(s)}
 function chooseQty(n:number){if(!Number.isFinite(n))return;touch();setQty(Math.max(1,Math.min(99,Math.round(n))));setQtyDone(true)}
 function chooseDelivery(d:DeliveryId){touch();setDelivery(cur=>cur===d?null:d)}

 function addCurrent(){
  if(!variant?.inStock)return false;
  if(!started.current){started.current=true;track('start_film_configurator',{entry:'ticket'})}
  add(variant.slug,qty);
  track('finish_film_configurator',{variant:variant.slug,format:variant.format,process:variant.process,scan:variant.scan,quantity:qty,total:variant.price*qty});
  setAnimate(true);setAdded(true);
  return true;
 }
 function anotherRoll(){
  if(!addCurrent())return;
  const done=roll;
  window.clearTimeout(timer.current);
  timer.current=window.setTimeout(()=>{
   setFormat(null);setProcess(null);setScan(null);setQty(1);setQtyDone(false);setDelivery(null);setAdded(false);setRoll(done+1);
   setNotice(`Rolle ${done} liegt im Vorschau-Warenkorb. Jetzt Rolle ${done+1} konfigurieren.`);
   formatHead.current?.scrollIntoView({behavior:motionAllowed()?'smooth':'auto',block:'start'});
   formatHead.current?.focus({preventScroll:true});
  },motionAllowed()?720:0);
 }

 function priceFor(over:Selection,selected:boolean):Price{
  const sel:Selection={format,process,scan,...over};
  if(sel.format&&sel.process&&!processesFor(sel.format).includes(sel.process))sel.process=null;
  if(sel.format&&sel.process&&sel.scan){
   const v=findVariant(sel.format,sel.process,sel.scan);
   if(!v)return {text:'—',tone:'none'};
   if(selected)return {text:formatPrice(v.price),tone:'current'};
   if(variant)return {text:formatDelta(v.price-variant.price),tone:'delta'};
   return {text:formatPrice(v.price),tone:'abs'};
  }
  const m=minPrice(sel);
  return m===null?{text:'—',tone:'none'}:{text:`ab ${formatPrice(m)}`,tone:'from'};
 }

 const reqDone=[!!format,!!process,!!scan,qtyDone];
 let current=reqDone.findIndex(d=>!d);
 if(current===-1)current=delivery?5:4;
 if(added)current=5;
 const stepState:Record<StepId,{value:string;done:boolean}>={
  format:{value:format?formats[format].name:'',done:!!format},
  process:{value:process?processes[process].strip:'',done:!!process},
  scan:{value:scan?(scan==='Ohne Scan'?'Ohne':scan):'',done:!!scan},
  qty:{value:`×${qty}`,done:qtyDone},
  delivery:{value:delivery?deliveries[delivery].strip:'',done:!!delivery},
 };
 const total=variant?variant.price*qty:null;
 const frames:StripFrame[]=[
  ...STEPS.map(st=>({id:st.id,no:stepNo(st.id),label:st.label,href:st.href,optional:st.optional,...stepState[st.id]})),
  {id:'ticket',no:SUMMARY_STEP.short,label:'Gesamt',value:total!==null?formatPrice(total):'',done:added,showValue:total!==null,href:SUMMARY_STEP.href,summary:true},
 ];
 const shownProcesses=format?processesFor(format):[...PROCESS_IDS];
 const kind=process?processes[process].kind:null;

 return <div className="fc" data-expert={expert}>
  <header className="zone-dark fc-hero">
   <div className="wrap fc-hero-grid">
    <div className="fc-hero-copy">
     <p className="eyebrow"><b>LAB</b><span>Filmentwicklung im eigenen Labor<span className="fc-wide-only"> · Fürth</span></span></p>
     <h1 className="fc-title">Film entwickeln <span className="outline-type">im eigenen Labor</span></h1>
     <p className="lead fc-lead">C-41 im Fujifilm-Minilab, Schwarzweiß individuell in Jobo-Rotationsmaschinen, E-6 mit CineStill-Chemie. Gescannt wird auf dem Noritsu HS-1800. {STEP_COUNT_LABEL}, Preise direkt aus dem Shop.</p>
     <p className="lead fc-lead-short">{FORMAT_IDS.map(f=>formats[f].name).join(' · ')} · ab <span className="num">{formatPrice(minPrice({})??0)}</span> je Film</p>
    </div>
    <dl className="fc-facts">
     <div><dt>Formate</dt><dd>35mm · 120 · 110</dd></div>
     <div className="fc-fact-wide"><dt>Prozesse</dt><dd>C-41 · Schwarzweiß · E-6</dd></div>
     <div className="fc-fact-wide"><dt>Scanner</dt><dd>Noritsu HS-1800</dd></div>
     <div><dt>Preis je Film</dt><dd className="num">ab {formatPrice(minPrice({})??0)}</dd></div>
     <div><dt>Bearbeitungszeit</dt><dd>bitte im Laden erfragen</dd></div>
    </dl>
   </div>
  </header>

  <section className="zone-dark fc-bench" aria-labelledby="fc-bench-title">
   <div className="wrap">
    <div className="fc-grid">
     <div className="fc-bar">
      <h2 id="fc-bench-title" className="mono fc-bar-code"><b>LAB</b><span className="fc-bar-name">Konfigurator<span aria-hidden="true"> · </span></span><span className="fc-bar-steps">{STEP_COUNT_LABEL}</span></h2>
      <div className="fc-mode">
       <span className="fc-mode-desc" id="fc-mode-desc">{expert?'Entwickler, Scan-Tabelle und Maschinen sichtbar':'Einsteigeransicht'}</span>
       <button type="button" className="fc-toggle" aria-expanded={expert} aria-controls="fc-expert-process fc-expert-scan" aria-describedby="fc-mode-desc" onClick={()=>setExpert(e=>!e)}><span className="fc-switch" aria-hidden="true"/>Expertenmodus</button>
      </div>
     </div>
     <div className="fc-main">
      <div className="fc-strip-dock">
       <FilmStrip format={format} kind={kind} frames={frames} current={current} animate={animate}/>
       <ProgressRow frames={frames} current={current}/>
      </div>
      <p className="fc-notice" role="status">{notice}</p>

      <section className="fc-step" id="step-format" aria-labelledby="fc-h-format" data-done={!!format}>
       <header className="fc-step-head"><span className="fc-step-no" aria-hidden="true">{stepNo('format')}</span><div><h3 id="fc-h-format" ref={formatHead} tabIndex={-1}>Welchen Film hast du?</h3><p className="fc-help">Am Gehäuse erkennbar: Patrone, Rollfilm mit Schutzpapier oder Pocket-Kassette.</p></div></header>
       <div className="fc-options fc-formats" role="group" aria-labelledby="fc-h-format">
        {FORMAT_IDS.map(f=>{const sel=format===f;const clash=!!process&&!processesFor(f).includes(process);return <button type="button" key={f} className="fc-opt" aria-pressed={sel} onClick={()=>chooseFormat(f)}>
         <FormatGlyph format={f}/>
         <span className="fc-opt-title">{formats[f].name}</span>
         <span className="fc-opt-sub">{formats[f].sub} · {formats[f].object}</span>
         {formats[f].hint&&<span className="fc-opt-hint">{formats[f].hint}</span>}
         {clash&&process&&<span className="fc-opt-warn">{processes[process].label} nicht für {formats[f].name}</span>}
         <PriceTag price={priceFor({format:f},sel)}/>
        </button>})}
       </div>
      </section>

      <section className="fc-step" id="step-process" aria-labelledby="fc-h-process" data-done={!!process}>
       <header className="fc-step-head"><span className="fc-step-no" aria-hidden="true">{stepNo('process')}</span><div><h3 id="fc-h-process">Welcher Prozess?</h3><p className="fc-help">Der Prozess steht auf Packung oder Patrone. {format?`Für ${formats[format].name} im Angebot: ${processesFor(format).map(p=>processes[p].label).join(', ')}.`:'Erst das Format wählen, dann zeigen wir nur, was dafür möglich ist.'}</p></div></header>
       <div className="fc-options fc-procs" role="group" aria-labelledby="fc-h-process">
        {shownProcesses.map(p=>{const info=processes[p];const sel=process===p;const id=`fc-proc-${slug(p)}`;return <div key={p} className="fc-proc" data-kind={info.kind} data-selected={sel} data-marker={!!info.marker}>
         <button type="button" className="fc-proc-btn" aria-pressed={sel} aria-describedby={`${id}-d`} onClick={()=>chooseProcess(p)}>
          <span className="fc-proc-top"><span className={`chip chip-${info.kind}`}>{info.label}</span>{info.marker&&<span className="fc-proc-marker" aria-hidden="true">± EV</span>}</span>
          <span className="fc-opt-title">{info.title}</span>
          <PriceTag price={priceFor({process:p},sel)}/>
         </button>
         <div className="fc-proc-details" id={`${id}-d`}><div>
          <p>{info.explain}</p>
          <dl className="fc-dl">
           <div><dt>Maschine</dt><dd>{info.machine}</dd></div>
           <div><dt>Chemie</dt><dd>{info.chemistry}</dd></div>
           <div><dt>Formate</dt><dd>{formatsFor(p).map(f=><span key={f} className="fc-fmt" data-match={f===format}>{formats[f].name}</span>)}</dd></div>
          </dl>
         </div></div>
        </div>})}
       </div>
       <div id="fc-expert-process" className="fc-expert" hidden={!expert}>
        <DeveloperLab idPrefix="fc" headingLevel="h4"/>
        {process&&processes[process].kind!=='bw'&&<p className="fc-help">Die Entwicklerwahl betrifft nur Schwarzweiß.</p>}
       </div>
      </section>

      <section className="fc-step" id="step-scan" aria-labelledby="fc-h-scan" data-done={!!scan}>
       <header className="fc-step-head"><span className="fc-step-no" aria-hidden="true">{stepNo('scan')}</span><div><h3 id="fc-h-scan">Brauchst du Scans?</h3><p className="fc-help">Ohne Scan bekommst du nur die Entwicklung. Mit Scan zusätzlich Bilddateien{format==='110'?'.':', gescannt auf dem Noritsu HS-1800.'} Wie die Dateien zu dir kommen, bitte im Laden erfragen.</p></div></header>
       <div className="fc-options fc-scans" role="group" aria-labelledby="fc-h-scan">
        {SCAN_IDS.map(s=>{const sel=scan===s;return <button type="button" key={s} className="fc-opt fc-scan" aria-pressed={sel} onClick={()=>chooseScan(s)}>
         <span className="fc-opt-title">{scanLabel(format,s)}</span>
         <span className="fc-opt-sub">{s==='Ohne Scan'?'Nur Entwicklung, keine Dateien.':s==='JPG'?'Zum Ansehen und Teilen.':`Derselbe Scan als TIFF, für die Weiterbearbeitung${premium!==null?` · ${formatPrice(premium)} mehr als JPG`:''}.`}</span>
         <span className="fc-opt-spec mono">{scanSizeLine(format,s)}</span>
         <PriceTag price={priceFor({scan:s},sel)}/>
        </button>})}
       </div>
       <div id="fc-expert-scan" className="fc-expert" hidden={!expert}>
        <ScanSpecs lock={format} idPrefix="fc-scan" animate={animate}/>
       </div>
       {!expert&&<p className="fc-help fc-help-more">Alle Pixelmaße pro Bildformat zeigt der <button type="button" className="fc-inline" aria-expanded={false} aria-controls="fc-expert-process fc-expert-scan" onClick={()=>setExpert(true)}>Expertenmodus</button>.</p>}
      </section>

      <section className="fc-step" id="step-qty" aria-labelledby="fc-h-qty" data-done={qtyDone}>
       <header className="fc-step-head"><span className="fc-step-no" aria-hidden="true">{stepNo('qty')}</span><div><h3 id="fc-h-qty">Wie viele Filme?</h3><p className="fc-help">Alle Filme mit denselben Optionen. Andere Optionen: erst diese Rolle hinzufügen, dann „Weitere Rolle mit anderen Optionen“.</p></div></header>
       <div className="fc-qty">
        <button type="button" className="fc-qty-btn" aria-label="Einen Film weniger" disabled={qty<=1} onClick={()=>chooseQty(qty-1)}><Minus size={18} aria-hidden="true"/></button>
        <label className="fc-qty-field"><span className="sr-only">Anzahl Filme</span><input className="num" type="number" inputMode="numeric" min={1} max={99} value={qty} onChange={e=>{if(e.target.value!=='')chooseQty(Number(e.target.value))}}/></label>
        <button type="button" className="fc-qty-btn" aria-label="Einen Film mehr" disabled={qty>=99} onClick={()=>chooseQty(qty+1)}><Plus size={18} aria-hidden="true"/></button>
        <span className="fc-qty-unit">{qty===1?'Film':'Filme'}{variant&&<> · <span className="num">{formatPrice(variant.price)}</span> je Film</>}</span>
       </div>
      </section>

      <section className="fc-step" id="step-delivery" aria-labelledby="fc-h-delivery" data-done={!!delivery}>
       <header className="fc-step-head"><span className="fc-step-no" aria-hidden="true">{stepNo('delivery')}</span><div><h3 id="fc-h-delivery">Wie kommt der Film zu uns? <span className="fc-optional">optional · nur Info</span></h3><p className="fc-help">Keine Auswahl nötig, sie ändert nichts am Preis.</p></div></header>
       <div className="fc-options fc-deliveries" role="group" aria-labelledby="fc-h-delivery">
        {DELIVERY_IDS.map(d=><button type="button" key={d} className="fc-opt fc-delivery" aria-pressed={delivery===d} onClick={()=>chooseDelivery(d)}><span className="fc-opt-title">{deliveries[d].label}</span></button>)}
       </div>
       {delivery&&<div className="fc-delivery-info">
        <ul>{deliveries[delivery].lines.map(l=><li key={l}>{l}</li>)}</ul>
        <Link className="link" href="/kontakt">Kontakt & Abgabestellen <ArrowRight size={15} aria-hidden="true"/></Link>
       </div>}
      </section>
     </div>

     <SummaryDock total={total} qty={qty} canAdd={!!variant?.inStock} added={added} onAdd={()=>{addCurrent()}} targetId="fc-ticket" focusId="tk-title"/>

     <aside className="fc-side" aria-label="Zusammenfassung">
      <ProcessTank format={format} process={process} animate={animate}/>
      <div className="fc-ticket-dock" id="fc-ticket">
       <LabTicket format={format} process={process} scan={scan} qty={qty} delivery={delivery} variant={variant} estimate={estimate} missing={missing} roll={roll} added={added} animate={animate} onAdd={()=>{addCurrent()}} onAnother={anotherRoll}/>
      </div>
     </aside>
    </div>
   </div>
  </section>

  <section className="zone-graphite fc-after">
   <div className="wrap fc-after-grid">
    <p className="eyebrow"><b>LAB</b><span>Unser Labor</span></p>
    <h2>Maschinen, Entwickler, Preisliste</h2>
    <p className="lead">Welche Maschine welchen Film entwickelt, wie die vier Schwarzweiß-Entwickler aussehen und alle Preise auf einen Blick.</p>
    <div className="fc-after-actions"><Link className="btn btn-light" href="/lab">Unser Labor ansehen <ArrowRight size={17} aria-hidden="true"/></Link><Link className="link" href="/kontakt">Kontakt & Abgabestellen <ArrowRight size={15} aria-hidden="true"/></Link></div>
   </div>
  </section>
 </div>;
}
