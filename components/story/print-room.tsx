"use client";
// Print room: a 2.5D stack of real paper lines (CSS 3D, no WebGL) + a print selector (paper → size → price,
// Fürth vs. Nürnberg). Signature: the stack "emerges" like prints leaving a printer when it scrolls into view
// and fans out under the pointer (motion/story.ts, metaphor print-emerge). Desktop: pointer spread + tilt;
// tablet: emerge only; phone + reduced motion: static fanned stack. All information is in the form output.
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {onceVisible,useMotionTier} from '@/motion/setup';
import {emergeSheets,liftSheet,pointerTilt,spreadStack} from '@/motion/story';
import {euro} from './facts';
import type {PaperId,PaperLine,PrintPlace,PrintRow} from './print-data';

const PLACE:Record<PrintPlace,{code:string;text:string}>={
 fth:{code:'FTH',text:'Druck direkt in Fürth'},
 nbg:{code:'NBG *',text:'Druck im Fuji-Store Nürnberg'},
 ask:{code:'ERFRAGEN',text:'Druckort bitte im Laden erfragen'},
};
const FINISH:Record<PaperId,string>={foto:'im Laden erfragen',metallic:'Metallic',fineart:'verschiedene FineArt-Oberflächen'};
const FLAG:Record<NonNullable<PrintRow['flag']>,string>={
 a3plus:'In der Preisliste ohne *-Markierung, aber größer als A3+ – laut FineArt-Seite druckt Fürth bis A3+. Wo gedruckt wird, bitte im Laden erfragen.',
 plus:'In der Preisliste mit „+“ statt „*“ markiert. Wo gedruckt wird, bitte im Laden erfragen.',
 typo:'Der Preis in der Preisliste liegt unter Fotopapier im selben Format und wird gerade vom Inhaber geprüft. Bitte im Laden erfragen.',
};
const priceText=(r:PrintRow)=>r.price!=null?euro(r.price):'auf Anfrage';
const ratioOf=(r:PrintRow)=>Math.min(r.w,r.h)/Math.max(r.w,r.h);

export function PrintRoom({lines}:{lines:PaperLine[]}){
 const tier=useMotionTier();
 const [paper,setPaper]=useState<PaperId>('fineart');
 const [size,setSize]=useState(lines[0].rows[0].size);
 const line=lines.find(l=>l.id===paper)!;
 const row=line.rows.find(r=>r.size===size)??line.rows[0];
 const order=[line,...lines.filter(l=>l.id!==paper)];
 const stage=useRef<HTMLDivElement>(null);const tilt=useRef<HTMLDivElement>(null);const stack=useRef<HTMLDivElement>(null);
 const sheets=useRef<Partial<Record<PaperId,HTMLDivElement|null>>>({});
 const lifted=useRef(false);

 // print-emerge: only armed when the stage is still below the fold (no flash), desktop + tablet.
 useEffect(()=>{
  const el=stage.current;if(!el||(tier!=='desktop'&&tier!=='tablet'))return;
  if(el.getBoundingClientRect().top<window.innerHeight)return;
  el.dataset.emerge='armed';let run:ReturnType<typeof emergeSheets>;
  const off=onceVisible(el,()=>{run=emergeSheets(Array.from(el.querySelectorAll('.prt-sheet')))},.35);
  return()=>{off();run?.revert();delete el.dataset.emerge};
 },[tier]);
 // pointer: sheets separate while the pointer is over the stage; a few degrees of tilt (desktop only).
 useEffect(()=>{
  const host=stage.current;const target=stack.current;if(!host||tier!=='desktop')return;
  const enter=()=>{spreadStack(target,1)};const leave=()=>{spreadStack(target,0)};
  host.addEventListener('pointerenter',enter);host.addEventListener('pointerleave',leave);
  const off=pointerTilt(host,tilt.current,3.5);
  return()=>{host.removeEventListener('pointerenter',enter);host.removeEventListener('pointerleave',leave);off?.();target?.style.removeProperty('--spread')};
 },[tier]);
 // the chosen paper rises onto the top of the stack
 useEffect(()=>{
  if(!lifted.current){lifted.current=true;return}
  const run=liftSheet(sheets.current[paper]??null);
  return()=>{run?.revert()};
 },[paper]);

 return <div className="prt-room">
  <div className="prt-stage" ref={stage} aria-hidden="true">
   <div className="prt-tilt" ref={tilt}>
    <div className="prt-stack" ref={stack} style={{'--ratio':ratioOf(row)} as CSSProperties}>
     {order.map((l,depth)=>{const r=l.rows.find(x=>x.size===size)??l.rows[0];return <div key={l.id} className="prt-slot" style={{'--i':depth,zIndex:3-depth} as CSSProperties}>
      <div className={`prt-sheet prt-sheet-${l.id}`} ref={el=>{sheets.current[l.id]=el}}>
       <p className="prt-sheet-head mono"><span>PRT · {l.name}</span><span>{r.size}</span></p>
       <span className="prt-wedge"/>
       <dl className="prt-sheet-data">
        <div><dt>Papier</dt><dd>{l.name}</dd></div>
        <div><dt>Format</dt><dd>{r.size}</dd></div>
        <div><dt>Oberfläche</dt><dd>{FINISH[l.id]}</dd></div>
        <div className="prt-sheet-price"><dt>Preis</dt><dd className="num">{priceText(r)}</dd></div>
       </dl>
       <p className="prt-sheet-edge mono">{l.name} · {r.size} · {priceText(r)} · {PLACE[r.place].code}</p>
      </div>
     </div>})}
    </div>
   </div>
  </div>

  <form className="prt-selector" aria-label="Druckpreis ermitteln" onSubmit={e=>e.preventDefault()}>
   <fieldset className="prt-field">
    <legend className="field-label">1 · Papier</legend>
    <div className="prt-papers">{lines.map(l=>{const priced=l.rows.filter(r=>r.price!=null).map(r=>r.price as number);return <label key={l.id} className="prt-paper">
     <input type="radio" name="prt-paper" value={l.id} checked={paper===l.id} onChange={()=>setPaper(l.id)}/>
     <span className="prt-paper-name">{l.name}</span><span className="mono">ab {euro(Math.min(...priced))}</span>
    </label>})}</div>
   </fieldset>
   <fieldset className="prt-field">
    <legend className="field-label">2 · Format <span className="prt-legend-note">Seitenverhältnis · Preis · Druckort</span></legend>
    <div className="prt-sizes">{line.rows.map(r=><label key={r.size} className="prt-size" data-place={r.place}>
     <input type="radio" name="prt-size" value={r.size} checked={size===r.size} onChange={()=>setSize(r.size)}/>
     <span className="prt-glyph" style={{'--ratio':ratioOf(r)} as CSSProperties} aria-hidden="true"/>
     <span className="prt-size-name num">{r.size}</span>
     <span className="prt-size-price num">{r.price!=null?euro(r.price):'–'}</span>
     <span className="prt-size-place mono">{PLACE[r.place].code}{r.flag?' !':''}</span>
    </label>)}</div>
   </fieldset>
   <output className="prt-result" aria-live="polite">
    <span className="mono">3 · Ergebnis · {line.name} · {row.size}</span>
    <strong className="num">{row.price!=null?euro(row.price):'Preis auf Anfrage'}</strong>
    <span className={`prt-place prt-place-${row.place}`}><i aria-hidden="true"/>{PLACE[row.place].text}</span>
    {row.flag&&<span className="prt-flag"><b>Hinweis</b> {FLAG[row.flag]}</span>}
   </output>
   <p className="snapshot-note">* = wird laut Preisliste im Fuji-Store Nürnberg gedruckt · Kein Upload, keine Online-Bestellung in dieser Vorschau</p>
  </form>
 </div>;
}

export function StandardPrints({prints,fee}:{prints:readonly {size:string;price:number}[];fee:number}){
 const [size,setSize]=useState(prints[0].size);const [qty,setQty]=useState(24);
 const p=prints.find(x=>x.size===size)??prints[0];
 const n=Math.max(1,Math.min(999,Math.floor(qty)||1));
 return <form className="prt-calc" aria-label="Rechenbeispiel Standardabzüge" onSubmit={e=>e.preventDefault()}>
  <fieldset className="prt-field">
   <legend className="field-label">Format · pro Bild</legend>
   <div className="prt-calc-sizes">{prints.map(x=><label key={x.size} className="prt-paper">
    <input type="radio" name="prt-std" value={x.size} checked={size===x.size} onChange={()=>setSize(x.size)}/>
    <span className="prt-paper-name num">{x.size}</span><span className="mono num">{euro(x.price)}</span>
   </label>)}</div>
  </fieldset>
  <label className="field prt-calc-qty"><span>Anzahl Bilder</span><input className="input num" type="number" inputMode="numeric" min={1} max={999} value={qty} onChange={e=>setQty(Number(e.target.value))}/></label>
  <output className="prt-calc-out" aria-live="polite">
   <span className="mono num">{n} × {euro(p.price)} + {euro(fee)} Servicegebühr</span>
   <strong className="num">{euro(Math.round((n*p.price+fee)*100)/100)}</strong>
  </output>
 </form>;
}
