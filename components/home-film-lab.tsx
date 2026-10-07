"use client";
// 02 · LAB FILM LAB — dark zone, amber accent. Real lab photographs + the verified price grid as a lab ticket.
// Sources: /p/filmentwicklung-kleinbild, -mittelformat, -pocket-110 (Quellstand 04.10.2026, re-verified live 05.10.2026).
// No turnaround times: they are not published by the shop.
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead,Chip,type ChipKind} from './analog/primitives';
import {developImages} from '@/motion/home';
import {MoreToggle,PHOTO,chapter,photo,useMore,useMotion} from './home-shared';

type Row={proc:string;kind:ChipKind;p:[number,number,number]};
const TICKET:{fmt:string;name:string;rows:Row[]}[]=[
 {fmt:'35 mm',name:'Kleinbild 135',rows:[
  {proc:'C-41',kind:'c41',p:[7,12,17]},
  {proc:'SW',kind:'bw',p:[10,15,20]},
  {proc:'SW Push/Pull',kind:'bw',p:[12.5,17.5,22.5]},
  {proc:'E-6',kind:'e6',p:[13.5,18.5,23.5]},
 ]},
 {fmt:'120',name:'Mittelformat',rows:[
  {proc:'C-41',kind:'c41',p:[9,15,20]},
  {proc:'SW',kind:'bw',p:[10,16,21]},
  {proc:'E-6',kind:'e6',p:[15,20,25]},
 ]},
 {fmt:'110',name:'Pocket',rows:[
  {proc:'C-41',kind:'c41',p:[9,25,30]},
  {proc:'SW',kind:'bw',p:[12,30,35]},
 ]},
];
const eur=(n:number)=>n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});

/** Homepage developer slider captions (all Kodak Tri-X, scanned 6774 × 4492 px) — lab samples, not a recipe table. */
const DEVELOPERS:[string,string,string][]=[
 ['Adox Adonal','1+25','7:00'],
 ['Adox Silvermax','1+19','12:00'],
 ['Kodak D-76','1+0','6:45'],
 ['Kodak HC-110','1+31','6:00'],
];

const MACHINES:{proc:string;kind?:ChipKind;text:string}[]=[
 {proc:'C-41',kind:'c41',text:'im Fujifilm-Minilab mit Fujifilm-Chemie'},
 {proc:'SW',kind:'bw',text:'individuell in der Jobo-Rotation · auf Anfrage im Entwickler deiner Wahl'},
 {proc:'E-6',kind:'e6',text:'mit CineStill-Chemie in der Rotationsmaschine'},
 {proc:'Scan',text:'Noritsu HS-1800 · 35 mm bis 6774 × 4492 px'},
];

export function HomeFilmLab(){
 const photos=useMotion<HTMLDivElement>(developImages);
 const head=chapter('LAB');
 // Phones: photo, lead, CTA and the price ticket stay open; machines + developer samples sit behind one disclosure.
 const more=useMore(2);
 return <section className="hm-lab zone-dark" id={head.sectionId} aria-labelledby="hm-lab-title" data-more={more.attr}>
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-lab-title"
    title={<>Entwickelt in Fürth. <br/>Gescannt auf Noritsu.</>}/>
   <div className="hm-lab-grid" ref={photos}>
    <figure className="hm-lab-photo hm-lab-photo-main">
     <img data-develop {...photo(PHOTO.labScan,'(min-width: 1024px) min(52vw, 840px), 92vw')} loading="lazy" decoding="async" alt="Noritsu-Scanner im Bilderfürst-Labor: ein entwickelter Kleinbild-Negativstreifen läuft in den Filmeinzug"/>
     <figcaption className="hm-cap"><span>LAB · Noritsu-Scanner, Filmeinzug</span><span>Labor Fürth</span></figcaption>
    </figure>
    <div className="hm-lab-copy">
     <p className="hm-lab-lead">Dein Film bleibt im Haus: entwickelt im eigenen Labor, gescannt auf dem Noritsu. Abgeben und abholen an der Alexanderstraße – oder per Post einschicken.</p>
     <dl className="hm-lab-machines hm-extra" id={more.ids[0]}>
      {MACHINES.map(m=><div key={m.proc}><dt>{m.kind?<Chip kind={m.kind}>{m.proc}</Chip>:<span className="chip">{m.proc}</span>}</dt><dd>{m.text}</dd></div>)}
     </dl>
     <div className="hm-lab-actions">
      <Link href="/filmentwicklung" className="btn btn-primary">Deinen Film konfigurieren <ArrowUpRight size={18} className="btn-arrow-up"/></Link>
      <Link href="/kontakt" className="link">Abgeben oder einschicken</Link>
     </div>
    </div>
    <div className="hm-ticket" role="group" aria-labelledby="hm-ticket-title">
     <div className="hm-ticket-head">
      <p id="hm-ticket-title" className="mono">Laborticket · Entwicklung je Film</p>
      <p className="mono hm-ticket-meta">EUR inkl. MwSt. · Quellstand 04.10.2026</p>
     </div>
     <table className="hm-ticket-table">
      <caption className="sr-only">Preise für Filmentwicklung je Film in Euro inklusive Mehrwertsteuer, ohne Scan oder mit Large Scan als JPG oder TIFF</caption>
      <thead><tr><th scope="col">Prozess</th><th scope="col">ohne Scan</th><th scope="col">+ Scan JPG</th><th scope="col">+ Scan TIFF</th></tr></thead>
      {TICKET.map(g=><tbody key={g.fmt}>
       <tr className="hm-ticket-group"><td colSpan={4}><span className="hm-ticket-fmt">{g.fmt}</span><span className="mono">{g.name}</span></td></tr>
       {g.rows.map(r=><tr key={r.proc}><th scope="row"><span className="sr-only">{g.fmt} </span><Chip kind={r.kind}>{r.proc}</Chip></th>{r.p.map((v,i)=><td key={i} className="num">{eur(v)}</td>)}</tr>)}
      </tbody>)}
     </table>
     <p className="hm-ticket-foot mono">Large Scan auf Noritsu HS-1800 · Push/Pull nur Schwarzweiß Kleinbild</p>
    </div>
    <MoreToggle more={more} className="hm-lab-more">Maschinen und Entwickler</MoreToggle>
    <div className="hm-lab-side hm-extra" id={more.ids[1]}>
     <figure className="hm-lab-photo">
      <img data-develop {...photo(PHOTO.filmRolls,'(min-width: 1024px) min(30vw, 480px), (min-width: 768px) 40vw, 92vw')} loading="lazy" decoding="async" alt="Kleinbildpatronen Kodak 200, Prozess C-41, aufgereiht im Labor"/>
      <figcaption className="hm-cap"><span>LAB · Patronen vor der Entwicklung</span><span>C-41</span></figcaption>
     </figure>
     <div className="hm-dev">
      <p className="mono hm-dev-head"><span>Schwarzweiß · Entwickler</span><span>Labormuster Tri-X</span></p>
      <table className="hm-dev-table">
       <caption className="sr-only">Entwicklervergleich mit Kodak Tri-X: Verdünnung und Zeit</caption>
       <thead className="sr-only"><tr><th scope="col">Entwickler</th><th scope="col">Verdünnung</th><th scope="col">Zeit</th></tr></thead>
       <tbody>{DEVELOPERS.map(([d,dil,t])=><tr key={d}><th scope="row">{d}</th><td className="num">{dil}</td><td className="num">{t} Min.</td></tr>)}</tbody>
      </table>
     </div>
    </div>
   </div>
  </div>
 </section>;
}
