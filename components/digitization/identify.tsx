// "Nicht sicher?" — general, factual identification cues drawn as hairline technical
// diagrams (millimetre viewBoxes, true proportions). No prices here. A path, not a
// prerequisite: placed after the estimate; on phones each card is a 48 px disclosure (Fold).
import type {CSSProperties,ReactNode} from 'react';
import {SectionHead} from '@/components/analog/primitives';
import {sector} from './silhouettes';
import {Fold} from './fold';
import {sectionLabel} from './jump-index';

const range=(n:number)=>Array.from({length:n},(_,i)=>i);
const Y0=3,LEN=30;

/** 8 mm / 16 mm film strips at one scale (1 unit = 1 mm). Standard dimensions:
 *  Normal 8: perf 1.83 × 1.27 on the frame line, pitch 3.81, frame 4.88 × 3.68.
 *  Super 8: perf 0.91 × 1.14 beside the frame centre, pitch 4.23, frame 5.69 × 4.01.
 *  16 mm: perf 1.83 × 1.27 on the frame line (here double perf), pitch 7.62, frame 10.26 × 7.49. */
function Perforations(){
 const n8=range(9).map(k=>Y0+k*3.81),s8=range(8).map(k=>Y0+k*4.234),m16=range(5).map(k=>Y0+k*7.62);
 return <svg className="dz-diagram" viewBox="0 0 62 42" role="img" aria-labelledby="dz-perf-t">
  <title id="dz-perf-t">Perforation von Normal 8, Super 8 und 16 mm im gleichen Maßstab</title>
  <defs>{[4,22,40].map((x,i)=><clipPath key={x} id={`dz-strip-${i}`}><rect x={x} y={Y0} width={i===2?16:8} height={LEN}/></clipPath>)}</defs>
  <g clipPath="url(#dz-strip-0)"><rect className="f" x="4" y={Y0} width="8" height={LEN}/>
   {n8.map(y=><rect key={y} className="fr" x="6.9" y={y+.065} width="4.88" height="3.68"/>)}
   {n8.map(y=><rect key={y} className="pf" x="4.6" y={y-.635} width="1.83" height="1.27"/>)}</g>
  <g clipPath="url(#dz-strip-1)"><rect className="f" x="22" y={Y0} width="8" height={LEN}/>
   {s8.map(y=><rect key={y} className="fr" x="23.55" y={y+.11} width="5.69" height="4.01"/>)}
   {s8.map(y=><rect key={y} className="pf" x="22.51" y={y+2.117-.572} width=".914" height="1.143"/>)}
   <rect className="mg" x="29.3" y={Y0} width=".6" height={LEN}/></g>
  <g clipPath="url(#dz-strip-2)"><rect className="f" x="40" y={Y0} width="16" height={LEN}/>
   {m16.map(y=><rect key={y} className="fr" x="42.87" y={y+.065} width="10.26" height="7.49"/>)}
   {m16.map(y=><g key={y}><rect className="pf" x="40.9" y={y-.635} width="1.83" height="1.27"/><rect className="pf" x="53.27" y={y-.635} width="1.83" height="1.27"/></g>)}</g>
  <g className="lbl"><text x="8" y="38.6">NORMAL 8</text><text x="26" y="38.6">SUPER 8</text><text x="48" y="38.6">16 MM</text></g>
 </svg>;
}

function Hub({cx,square}:{cx:number;square:boolean}){
 return <g><circle className="f" cx={cx} cy="25" r="22"/>{range(3).map(k=><path key={k} className="d" d={sector(cx,25,10,19,k*120+20,k*120+100)}/>)}
  <circle className="o" cx={cx} cy="25" r="8.5"/>{square?<rect className="pf" x={cx-3.5} y="21.5" width="7" height="7"/>:<circle className="pf" cx={cx} cy="25" r="6.4"/>}</g>;
}
function ReelHoles(){
 return <svg className="dz-diagram" viewBox="0 0 120 58" role="img" aria-labelledby="dz-hub-t">
  <title id="dz-hub-t">Spulenmitte: kleines eckiges Loch gegenüber großem runden Loch</title>
  <Hub cx={30} square/><Hub cx={90} square={false}/>
  <g className="lbl"><text x="30" y="55">NORMAL 8 · 16 MM</text><text x="90" y="55">SUPER 8</text></g>
 </svg>;
}

type Cassette={id:string;name:string;w:number;h:number;cue:string;draw:ReactNode};
const cassettes:Cassette[]=[
 {id:'vhs',name:'VHS',w:187,h:103,cue:'Groß wie ein Taschenbuch. S-VHS hat dieselbe Größe.',draw:<><rect className="d" x="47" y="18" width="93" height="34" rx="2"/><circle className="pf" cx="66" cy="35" r="9"/><circle className="pf" cx="121" cy="35" r="9"/><rect className="o" x="18" y="64" width="151" height="30"/></>},
 {id:'vhsc',name:'VHS-C',w:92,h:59,cue:'Kamerakassette mit VHS-Band, ein sichtbarer Wickel.',draw:<><rect className="d" x="22" y="12" width="48" height="22" rx="1.5"/><circle className="pf" cx="36" cy="23" r="7"/><circle className="o" cx="59" cy="23" r="4"/><rect className="o" x="10" y="40" width="72" height="13"/></>},
 {id:'v8',name:'Video8 · Hi8 · Digital8',w:95,h:62.5,cue:'Eine Kassettengröße für drei Systeme – den Unterschied verrät der Aufdruck oder die Kamera.',draw:<><rect className="o" x="8" y="8" width="79" height="24"/><rect className="d" x="34" y="38" width="27" height="10"/><path className="o" d="M4 56H91"/></>},
 {id:'minidv',name:'MiniDV',w:66,h:48,cue:'Die kleinste im Vergleich, digitales Band.',draw:<><rect className="o" x="6" y="6" width="54" height="18"/><rect className="d" x="22" y="28" width="22" height="8"/><path className="o" d="M3 43H63"/></>},
 {id:'mc',name:'Musikkassette (MC)',w:100.4,h:63.8,cue:'Fast so groß wie Video8 – aber mit zwei offenen Wickellöchern und offener Bandkante unten.',draw:<><rect className="o" x="7" y="6" width="86.4" height="38"/><rect className="d" x="38" y="18" width="24" height="14"/><circle className="pf" cx="29.2" cy="25" r="4.5"/><circle className="pf" cx="71.2" cy="25" r="4.5"/><path className="o" d="M15 63.8L20 51H80.4L85.4 63.8"/></>},
];

export function Identify(){
 return <section id="erkennen" className="dz-sec zone-dark" aria-labelledby="dz-identify-title">
  <div className="wrap">
   <SectionHead code="SCN" label={sectionLabel('03')} index="Nicht sicher?" id="dz-identify-title" title={<>Woran du dein<br/>Material erkennst.</>}/>
   <p className="lead dz-sec-lead">Allgemeine Faustregeln, gezeichnet im echten Größenverhältnis. Im Zweifel bring das Stück einfach mit – wir schauen es uns an.</p>
   <div className="dz-id-grid">
    <article className="dz-id-card">
     <p className="mono dz-id-code">ID-A · Lochung</p>
     <Fold id="dz-id-a" as="h3" title="Normal 8, Super 8 oder 16 mm?">
     <Perforations/>
     <ul className="dz-cues">
      <li><b>Normal 8:</b> größere Löcher, genau auf der Bildkante zwischen zwei Bildern.</li>
      <li><b>Super 8:</b> kleine, schmale Löcher neben der Bildmitte – dafür ein größeres Bild.</li>
      <li><b>16 mm:</b> doppelt so breit; Löcher an einer oder an beiden Seiten.</li>
      <li><b>Bräunlicher Streifen am Rand:</b> meist eine Magnettonspur. Mit oder ohne Ton kostet bei uns gleich viel.</li>
     </ul>
     </Fold>
    </article>
    <article className="dz-id-card">
     <p className="mono dz-id-code">ID-B · Spulenmitte</p>
     <Fold id="dz-id-b" as="h3" title="Kleines oder großes Loch?">
     <ReelHoles/>
     <ul className="dz-cues">
      <li><b>Kleines, eckiges Mittelloch:</b> meist Normal 8 oder 16 mm.</li>
      <li><b>Großes, rundes Mittelloch:</b> meist Super 8.</li>
      <li><b>Faustregel Laufzeit:</b> Eine kleine 15-m-Spule Super 8 läuft bei 18 Bildern/s gut 3 Minuten, eine 60-m-Spule gut 13 Minuten.</li>
     </ul>
     </Fold>
    </article>
    <article className="dz-id-card dz-id-wide">
     <p className="mono dz-id-code">ID-C · Kassetten im Größenvergleich</p>
     <Fold id="dz-id-c" as="h3" title="Welche Kassette ist das?">
     <div className="dz-lineup"><div className="dz-lineup-row">
      {cassettes.map(c=><figure key={c.id} className="dz-cassette" style={{'--w':c.w} as CSSProperties}>
       <svg className="dz-diagram" viewBox={`0 0 ${c.w} ${c.h}`} aria-hidden="true" focusable="false"><rect className="f" x=".5" y=".5" width={c.w-1} height={c.h-1} rx="2.5"/>{c.draw}</svg>
       <figcaption><span className="dz-cassette-name">{c.name}</span><span className="mono">{String(c.w).replace('.',',')} × {String(c.h).replace('.',',')} mm</span><span className="dz-cassette-cue">{c.cue}</span></figcaption>
      </figure>)}
      </div>
      <div className="dz-ruler" aria-hidden="true"><svg viewBox="0 0 100 6" preserveAspectRatio="none"><path d={`M0 .5H100${range(11).map(i=>`M${i*10} .5V${i%5===0?6:3.5}`).join('')}`}/></svg><span className="mono">10 cm</span></div>
     </div>
     </Fold>
    </article>
   </div>
  </div>
 </section>;
}
