"use client";
// 08 · FTH PHYSICAL STORE — light zone, still by design. Real corner photo (2018), address, hours with today highlighted
// (Europe/Berlin, client-side), call/route/contact actions, Instagram bio as a short quote.
// Sources: /i/kontakt-und-oeffnungszeiten (edited 18.06.2026), Instagram profile bio (fetched 05.10.2026).
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Phone,MapPin} from 'lucide-react';
import {SectionHead} from './analog/primitives';
import {track} from '@/lib/analytics';
import {HOURS,PHOTO,chapter,openState,useBerlinNow} from './home-shared';

const ROUTE='https://www.google.com/maps/dir/?api=1&destination=Alexanderstra%C3%9Fe+2%2C+90762+F%C3%BCrth';

export function HomeVisit(){
 const now=useBerlinNow();
 const state=now?openState(now):null;
 const head=chapter('FTH');
 return <section className="hm-fth zone-light" id={head.sectionId} aria-labelledby="hm-fth-title">
  <div className="wrap">
   <SectionHead code={head.code} label={head.label} index={head.index} id="hm-fth-title"
    title={<>Der Laden <br/>an der Ecke.</>}/>
   <div className="hm-fth-grid">
    <figure className="hm-fth-photo">
     <img src={PHOTO.storeCorner.src} width={PHOTO.storeCorner.w} height={PHOTO.storeCorner.h} loading="lazy" decoding="async" alt="Eckhaus an der Alexanderstraße 2 in Fürth mit dem bilderfürst-Giebelschild über dem Eingang und dem Galerie-Schaufenster"/>
     <figcaption className="hm-cap"><span>FTH · Ecke Schwabacher Straße / Alexanderstraße</span><span>Aufnahme 2018, damalige Beschilderung</span></figcaption>
    </figure>
    <div className="hm-fth-info">
     <address className="hm-fth-address">
      <span className="mono">Analog Store · bilderfürst Fürth</span>
      <span className="hm-fth-street">Alexanderstraße 2<br/>90762 Fürth</span>
     </address>
     <div className="hm-hours">
      <p className="hm-hours-state mono" data-open={state?state.open:undefined}>
       <span className="hm-status-dot" aria-hidden="true"/>
       <span suppressHydrationWarning>{state?state.label:'Öffnungszeiten'}</span>
      </p>
      <table className="hm-hours-table">
       <caption className="sr-only">Öffnungszeiten des Ladens in Fürth</caption>
       <tbody>
        {HOURS.map(h=>{const today=now?.day===h.day;return <tr key={h.day} aria-current={today?'date':undefined} className={today?'is-today':undefined}>
         <th scope="row"><span className="hm-hours-day">{h.long}</span>{today&&<span className="hm-hours-today mono">Heute</span>}</th>
         <td className="num">{h.open?`${h.open[0]} – ${h.open[1]}`:'geschlossen'}</td>
        </tr>})}
       </tbody>
      </table>
      <p className="hm-note mono">An Feiertagen bitte vorher anrufen</p>
     </div>
     <div className="hm-fth-actions">
      <a className="btn btn-primary" href="tel:+49911774202" onClick={()=>track('click_call',{source:'home'})}><Phone size={17}/> 0911 774202</a>
      <a className="btn btn-ink" href={ROUTE} target="_blank" rel="noopener noreferrer" onClick={()=>track('click_maps',{source:'home'})}><MapPin size={17}/> Route planen<span className="sr-only"> (Google Maps, neuer Tab)</span></a>
      <Link className="link" href="/kontakt">Film abgeben oder einschicken <ArrowRight size={16}/></Link>
     </div>
     <blockquote className="hm-fth-quote">
      <p>„Wir entwickeln deine Filme! Analoges Fotolabor im Herzen Fürths“</p>
      <footer className="mono"><a href="https://www.instagram.com/bilderfuerstfuerth/" target="_blank" rel="noopener noreferrer">@bilderfuerstfuerth auf Instagram <ArrowUpRight size={13}/></a></footer>
     </blockquote>
    </div>
   </div>
  </div>
 </section>;
}
