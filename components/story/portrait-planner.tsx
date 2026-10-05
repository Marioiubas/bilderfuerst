"use client";
// Bewerbungsbilder: package chooser with a contact-sheet graphic (no portraits exist, so none are shown).
// Packages and prices: price graphic on /i/bewerbungsbilder-preise, read 2026-10-05 (BUSINESS-RESEARCH-V2).
import {useState} from 'react';
import {euro} from './facts';

const PACKAGES=[
 {id:'standard',name:'Standard',price:20,motifs:['A','A','A','A'],items:['4 Bilder','1 Motiv','Retusche']},
 {id:'digital',name:'Standard + digital',price:30,motifs:['A','A','A','A'],items:['4 Bilder','1 Motiv','Retusche','Digital inkl. USB-Stick und Bildrechten']},
 {id:'premium',name:'Premium',price:40,motifs:['A','A','B','B'],items:['4 Bilder','2 Motive','Retusche','Digital'],extra:'Jedes weitere Motiv 15,00 €'},
] as const;

export function PortraitPlanner(){
 const [id,setId]=useState<(typeof PACKAGES)[number]['id']>('standard');
 const pkg=PACKAGES.find(p=>p.id===id)!;
 return <div className="svc-planner">
  <div className="svc-planner-controls">
   <p className="field-label" id="svc-pkg-label">Paket wählen</p>
   <div className="svc-pkgs" role="group" aria-labelledby="svc-pkg-label">
    {PACKAGES.map(p=><button key={p.id} type="button" className="svc-pkg" aria-pressed={p.id===id} onClick={()=>setId(p.id)}>
     <span className="svc-pkg-name">{p.name}</span><span className="svc-pkg-price num">{euro(p.price)}</span>
    </button>)}
   </div>
   <dl className="svc-ledger" aria-live="polite">
    <div><dt>Paket</dt><dd>{pkg.name}</dd></div>
    <div><dt>Umfang</dt><dd>{pkg.items.join(' · ')}</dd></div>
    {'extra' in pkg&&<div><dt>Zusatz</dt><dd>{pkg.extra}</dd></div>}
    <div className="svc-ledger-total"><dt>Preis</dt><dd className="num">{euro(pkg.price)}</dd></div>
   </dl>
  </div>
  <figure className="svc-sheet" aria-hidden="true">
   <div className="svc-sheet-grid">
    {pkg.motifs.map((m,i)=><div key={i} className="svc-sheet-frame" data-motif={m}>
     <svg viewBox="0 0 30 40" fill="none" stroke="currentColor" strokeWidth=".35"><path d="M15 3v34M4 13h22M4 31h22"/><path d="M2 2h4M2 2v4M28 2h-4M28 2v4M2 38h4M2 38v-4M28 38h-4M28 38v-4" strokeWidth=".6"/></svg>
     <span className="mono">{String(i+1).padStart(2,'0')} · Motiv {m}</span>
    </div>)}
   </div>
   <figcaption className="mono">Kontaktbogen · {pkg.motifs.length} Bilder · {new Set(pkg.motifs).size} {new Set(pkg.motifs).size>1?'Motive':'Motiv'}{pkg.id!=='standard'?' · digital':''}</figcaption>
  </figure>
 </div>;
}
