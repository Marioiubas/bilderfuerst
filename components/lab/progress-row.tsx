// Phone progress row (audit M4): replaces the sticky film strip below 768 px and on landscape phones.
// 48 px: frame counter + current step label + a mini strip of the same frames (links to each step,
// 44 px tall). Same step list semantics as the strip (<nav><ol>, aria-current="step").
import {SUMMARY_STEP} from './film-data';
import {frameText,type FrameState,type StripFrame} from './film-strip';

export function ProgressRow({frames,current}:{frames:StripFrame[];current:number}){
 const steps=frames.filter(f=>!f.summary).length;
 const cur=frames[current]??frames[0];
 return <nav className="fc-progress" aria-label="Auftragsfortschritt">
  <p className="fc-progress-now" aria-hidden="true">
   <span className="fc-progress-no">{cur.summary?SUMMARY_STEP.short:`${cur.no} / ${String(steps).padStart(2,'0')}`}</span>
   <strong className="fc-progress-label">{cur.summary?SUMMARY_STEP.label:cur.label}</strong>
  </p>
  <ol className="fc-progress-strip">
   {frames.map((f,i)=>{const state:FrameState=i===current?'current':f.done?'done':'todo';return <li key={f.id} data-state={state} data-summary={f.summary?'true':undefined} data-optional={f.optional&&!f.done?'true':undefined}>
    <a href={f.href} aria-current={i===current?'step':undefined}><span className="fc-progress-frame" aria-hidden="true">{f.no}</span><span className="sr-only">{frameText(f,state,steps)}</span></a>
   </li>})}
  </ol>
 </nav>;
}
