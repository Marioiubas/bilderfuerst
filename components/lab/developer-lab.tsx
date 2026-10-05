"use client";
// Black-and-white developer samples: four REAL lab scans of one Kodak Tri-X subject, captions verbatim
// from the homepage slider. Developer choice is information only (by request), not a price option.
import {useRef,useState} from 'react';
import {Lens} from '@/components/ui/lens';
import {developSample} from '@/motion/film';
import {developers,type Developer} from './film-data';

export function DeveloperLab({idPrefix='dv',headingLevel='h4'}:{idPrefix?:string;headingLevel?:'h3'|'h4'}){
 const [sel,setSel]=useState<Developer>(developers[0]);
 const [loupe,setLoupe]=useState<{x:number;y:number}|null>(null);
 const stage=useRef<HTMLDivElement>(null);const pending=useRef(false);
 const H=headingLevel;
 function choose(d:Developer){if(d.id===sel.id)return;pending.current=true;setSel(d)}
 function toggleLoupe(){if(loupe){setLoupe(null);return}const r=stage.current?.getBoundingClientRect();setLoupe(r?{x:r.width/2,y:r.height/2}:{x:200,y:130})}
 return <div className="dv" id={`${idPrefix}-developers`}>
  <div className="dv-controls">
   <H className="dv-title">Wunsch-Entwickler für Schwarzweiß</H>
   <p className="dv-lead">Vier echte Laborscans desselben Motivs auf Kodak Tri-X. Die Entwicklerwahl ist kein eigener Preis: <strong>Wunsch-Entwickler bitte bei der Abgabe angeben oder im Laden anfragen.</strong></p>
   <div className="dv-list" role="group" aria-label="Entwickler-Beispiel wählen">
    {developers.map(d=><button key={d.id} type="button" aria-pressed={sel.id===d.id} onClick={()=>choose(d)}>
     <span className="dv-name">{d.name}</span><span className="dv-data mono">{d.dilution} · {d.time} Min.</span>
    </button>)}
   </div>
   <blockquote className="dv-quote">„Wir entwickeln Deinen Schwarz Weiß Film auf Anfrage in dem von Dir gewünschten Entwickler.“<cite className="mono">photostudio.de · Startseite</cite></blockquote>
  </div>
  <figure className="dv-figure">
   <div className="dv-stage" ref={stage}>
    <Lens zoomFactor={2.2} lensSize={180} isStatic={!!loupe} position={loupe??undefined}>
     <img src={`/images/scan-${sel.id}-l.webp`} alt={`Echter Laborscan, Kodak Tri-X entwickelt in ${sel.name} ${sel.dilution}, ${sel.time} Minuten`} width={1400} height={928} loading="lazy" decoding="async" onLoad={e=>{const el=e.currentTarget;if(pending.current&&!el.closest('[aria-hidden="true"]')){pending.current=false;developSample(el)}}}/>
    </Lens>
   </div>
   <figcaption>
    <span className="mono">KODAK TRI-X · {sel.name.toUpperCase()} {sel.dilution} · {sel.time} MIN.</span>
    <button type="button" className="dv-loupe" aria-pressed={!!loupe} onClick={toggleLoupe}>{loupe?'Lupe aus':'Lupe an'}</button>
   </figcaption>
  </figure>
 </div>;
}
