"use client";
// Estimator — ONLY where the business publishes prices (Schmalfilm, Video, Dias, Negative).
// Count / minutes × the transcribed 2026 price graphics. Clearly labelled as a non-binding
// estimate; the final price is set in the shop.
import {useId,useState} from 'react';
import {SectionHead} from '@/components/analog/primitives';
import {diaRates,estimateDia,estimateFilm,estimateNeg,estimateVideo,eur,filmRates,negRates,SOURCE_DATE,videoRates,
 type DiaKind,type EstimateMode,type FilmFormat,type NegKind,type VideoKind} from './data';

const modes:{id:EstimateMode;label:string;code:string}[]=[
 {id:'film',label:'Schmalfilm',code:'FLM'},{id:'video',label:'Videokassetten',code:'VID'},{id:'dia',label:'Dias',code:'DIA'},{id:'negativ',label:'Negative',code:'NEG'},
];
const sources:Record<EstimateMode,string>={
 film:'Preisgrafik „schmalfilm 26“, /i/super8-normal8-16mm-35mm-kino',
 video:'Preisgrafiken „Video1/2/3“, /i/alle-videokassetten-und-formate',
 dia:'Preisgrafik „Dia Preise 26“, /i/dias-digitalisierung-1',
 negativ:'Preisgrafik „Negativ Preise 26“, /i/negativ-digitalisierung',
};

function Qty({label,unit,value,min,max,rangeMax,onChange,presets}:{label:string;unit:string;value:number;min:number;max:number;rangeMax:number;onChange:(n:number)=>void;presets?:number[]}){
 const id=useId();
 const [text,setText]=useState(String(value));const [shown,setShown]=useState(value);
 if(shown!==value){setShown(value);setText(String(value))}
 const clamp=(n:number)=>Math.max(min,Math.min(max,Math.round(n)));
 return <div className="field dz-qty">
  <label htmlFor={id}>{label}</label>
  <div className="dz-qty-row">
   <input id={id} className="input num" type="number" inputMode="numeric" min={min} max={max} value={text}
    onChange={e=>{setText(e.target.value);const n=parseInt(e.target.value,10);if(Number.isFinite(n))onChange(clamp(n))}} onBlur={()=>setText(String(value))}/>
   <span className="mono dz-unit">{unit}</span>
  </div>
  <input className="dz-range" type="range" min={min} max={rangeMax} value={Math.min(value,rangeMax)} aria-label={`${label} (Schieberegler)`} onChange={e=>onChange(clamp(Number(e.target.value)))}/>
  {presets&&<div className="dz-presets">{presets.map(p=><button key={p} type="button" className="chip" aria-pressed={value===p} onClick={()=>onChange(p)}>{p.toLocaleString('de-DE')} {unit}</button>)}</div>}
 </div>;
}

function Choice<T extends string>({label,value,options,onChange}:{label:string;value:T;options:Record<T,{label:string}>;onChange:(v:T)=>void}){
 const id=useId();
 return <div className="field"><label htmlFor={id}>{label}</label>
  <select id={id} className="select" value={value} onChange={e=>onChange(e.target.value as T)}>{(Object.keys(options) as T[]).map(k=><option key={k} value={k}>{options[k].label}</option>)}</select></div>;
}

export function Estimator({mode,onMode}:{mode:EstimateMode;onMode:(m:EstimateMode)=>void}){
 const [film,setFilm]=useState<FilmFormat>('s8');const [minutes,setMinutes]=useState(60);
 const [video,setVideo]=useState<VideoKind>('home');const [tapes,setTapes]=useState(10);
 const [dia,setDia]=useState<DiaKind>('mag');const [slides,setSlides]=useState(500);const [diaTiff,setDiaTiff]=useState(false);const [karussell,setKarussell]=useState(false);
 const [neg,setNeg]=useState<NegKind>('strip');const [negs,setNegs]=useState(360);const [negTiff,setNegTiff]=useState(false);
 const result=mode==='film'?estimateFilm(film,minutes):mode==='video'?estimateVideo(video,tapes):mode==='dia'?estimateDia(dia,slides,diaTiff,dia==='mag'&&karussell):estimateNeg(neg,negs,negTiff);
 const outId=useId();
 return <section id="schaetzung" className="dz-sec zone-graphite" aria-labelledby="dz-estimate-title">
  <div className="wrap">
   <SectionHead code="SCN" label="03 · Schätzung" index="Veröffentlichte Preise" id="dz-estimate-title" title={<>Was kostet<br/>meine Kiste?</>}/>
   <div className="dz-estimator">
    <form className="dz-est-controls" onSubmit={e=>e.preventDefault()} aria-describedby={`${outId}-note`}>
     <fieldset className="dz-modes">
      <legend className="field-label">Material</legend>
      {modes.map(m=><label key={m.id} className="dz-mode"><input type="radio" name="dz-est-mode" value={m.id} checked={mode===m.id} onChange={()=>onMode(m.id)} className="sr-only"/><span className="mono">{m.code}</span>{m.label}</label>)}
     </fieldset>
     {mode==='film'&&<>
      <Choice label="Filmformat" value={film} options={filmRates} onChange={setFilm}/>
      <Qty label="Gesamtlaufzeit" unit="Min." value={minutes} min={1} max={3000} rangeMax={600} onChange={setMinutes} presets={[15,30,60,120,300]}/>
      <p className="dz-hint">Laufzeit unbekannt? Faustregel Super 8 bei 18 Bildern/s: kleine 15-m-Spule gut 3 Min., 60-m-Spule gut 13 Min.</p>
     </>}
     {mode==='video'&&<>
      <Choice label="Kassettentyp" value={video} options={videoRates} onChange={setVideo}/>
      <Qty label="Anzahl Kassetten" unit="Stk." value={tapes} min={1} max={2000} rangeMax={100} onChange={setTapes} presets={[1,10,50]}/>
      <p className="dz-hint">Festpreis je Kassette, egal ob 5 oder 240 Minuten. Staffel ab 10 und ab 50 Kassetten.</p>
     </>}
     {mode==='dia'&&<>
      <Choice label="Dia-Art" value={dia} options={diaRates} onChange={setDia}/>
      <Qty label="Anzahl Dias" unit="Stk." value={slides} min={1} max={20000} rangeMax={3000} onChange={setSlides} presets={[50,100,500,1000]}/>
      <div className="dz-checks-row">
       <label className="check"><input type="checkbox" checked={diaTiff} onChange={e=>setDiaTiff(e.target.checked)}/>TIFF Premium (+50 %)</label>
       {dia==='mag'&&<label className="check"><input type="checkbox" checked={karussell} onChange={e=>setKarussell(e.target.checked)}/>Kodak-Karussell-Magazin (+0,10 € je Dia)</label>}
      </div>
     </>}
     {mode==='negativ'&&<>
      <Choice label="Negativ-Art" value={neg} options={negRates} onChange={setNeg}/>
      <Qty label="Anzahl Negative" unit="Stk." value={negs} min={2} max={20000} rangeMax={3000} onChange={setNegs} presets={[36,100,360,1000]}/>
      <div className="dz-checks-row"><label className="check"><input type="checkbox" checked={negTiff} onChange={e=>setNegTiff(e.target.checked)}/>TIFF Premium (+50 %)</label></div>
     </>}
    </form>
    <div className="dz-est-out">
     <p className="mono dz-est-code"><span>EST · {modes.find(m=>m.id===mode)?.code}</span><span>Quellstand {SOURCE_DATE}</span></p>
     <output className="dz-total num" aria-live="polite"><span className="dz-total-approx" aria-hidden="true">≈</span>{eur(result.total)}<span className="sr-only"> geschätzt</span></output>
     <ul className="dz-lines">{result.lines.map(l=><li key={l.label}><span>{l.label}</span><span className="num">{eur(l.value)}</span></li>)}</ul>
     {result.delivery&&<p className="dz-est-delivery"><span className="mono">Lieferzeit</span>{result.delivery}</p>}
     <p className="dz-est-note" id={`${outId}-note`}>Unverbindliche Schätzung auf Basis der veröffentlichten Preise · Endpreis im Laden</p>
     <p className="dz-source">Quelle: {sources[mode]} · Fotos, Tonband und Schallplatte: Preis nach Absprache.</p>
    </div>
   </div>
  </div>
 </section>;
}
