// In-body service index (UX-RESEARCH-MOBILE §6.1, audit M2/M5): not sticky, right after the
// hero. Link text = the section label in each section's eyebrow ("01 · Objekt wählen" …), so
// the words a visitor taps are the words they land on. Targets carry scroll-margin-top
// (sticky header + 16 px) in digitization.css.
export const sections=[
 {n:'01',label:'Objekt wählen',href:'#was-hast-du'},
 {n:'02',label:'Kosten schätzen',href:'#schaetzung'},
 {n:'03',label:'Format erkennen',href:'#erkennen'},
 {n:'04',label:'Scan-Probe',href:'#scan-probe'},
 {n:'05',label:'Ablauf',href:'#ablauf'},
 {n:'06',label:'Abgabe & Kontakt',href:'#abgabe'},
] as const;

/** Eyebrow label of section n, e.g. "02 · Kosten schätzen" (same words as the index). */
export const sectionLabel=(n:(typeof sections)[number]['n'])=>{const s=sections.find(x=>x.n===n);return s?`${s.n} · ${s.label}`:n};

export function JumpIndex(){
 return <nav className="dz-index zone-graphite" aria-label="Auf dieser Seite">
  <div className="wrap">
   <ol className="dz-index-list">
    {sections.map(s=><li key={s.n}><a href={s.href} className="dz-index-link"><span className="mono dz-index-n" aria-hidden="true">{s.n}</span><span>{s.label}</span></a></li>)}
   </ol>
  </div>
 </nav>;
}
