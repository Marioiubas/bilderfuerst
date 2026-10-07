"use client";
// /galerie · Street Gallery (signature experience #4).
// Facts: photostudio.de/i/galerie (live 2026-10-05) + contact page hours. The physical window is real;
// the prints shown on this page are a representation with lab samples and shop/lab photos, never the
// current exhibition (no source names exhibition, photographers or titles).
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {SectionHead} from '@/components/analog/primitives';
import {track} from '@/lib/analytics';
import {WindowStage} from './window-stage';
import {PrintWall} from './print-wall';
import {PrintLightbox} from './lightbox';
import {WindowMap} from './window-map';
import {galleryFacts,DEVELOPER_COMPARISON} from './prints';

const Arrow=()=><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>;
const ArrowUp=()=><svg className="btn-arrow-up" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12L12 4M5.5 4H12v6.5"/></svg>;

export function Gallery(){
 const [open,setOpen]=useState<number|null>(null);
 const close=useCallback(()=>setOpen(null),[]);
 useEffect(()=>{track('open_gallery',{view:'page'})},[]);

 return <div className="gal-page">
  <section className="gal-intro zone-dark grain" aria-labelledby="gal-title">
   <div className="wrap gal-intro-grid">
    <div className="gal-intro-head">
     <p className="eyebrow"><b>GAL</b><span>Street Gallery · Fürth</span><span className="gal-since">seit Anfang 2020</span></p>
     <h1 id="gal-title" className="display gal-title">Bilder gehören <span className="outline-type">nach draußen.</span></h1>
     <p className="lead">Seit Anfang 2020 haben wir aus unserer Schaufenster-Galerie eine Street Gallery mit analogen Aufnahmen aufgebaut – mit wechselnden Ausstellungen an der Ecke Schwabacher Straße / Alexanderstraße.</p>
    </div>
    <figure className="gal-evidence">
     <div className="gal-evidence-photo"><img src="/images/store-exterior-gallery-window.webp" srcSet="/images/store-exterior-gallery-window-t.webp 480w, /images/store-exterior-gallery-window.webp 1063w" sizes="(max-width: 1023px) calc(100vw - 32px), 46vw" width={1063} height={709} fetchPriority="high" decoding="async"
      alt="Die Ladenecke von bilderfürst in Fürth: rechts das Schaufenster mit neun schwarz gerahmten Schwarzweiß-Abzügen in drei Reihen hinter Glas."/></div>
     <figcaption><span className="mono">Das echte Fenster · Foto vom 12.03.2018</span><span>Damalige Beschilderung und Ausstellung. Heute hängen dort neun analoge Aufnahmen, rund um die Uhr sichtbar.</span></figcaption>
    </figure>
    <div className="gal-intro-rest">
     <div className="gal-now" role="group" aria-labelledby="gal-now-label">
      <p className="gal-now-label mono" id="gal-now-label">Jetzt</p>
      <p className="status status-ok">Im Schaufenster · rund um die Uhr sichtbar</p>
      <p className="status status-ask">Im Laden · 3 weitere Bilder zu den Öffnungszeiten</p>
     </div>
     <dl className="gal-facts">
      <div><dt>Ort</dt><dd>{galleryFacts.corner}, Fürth</dd></div>
      <div><dt>Schaufenster</dt><dd>9 Bilder · 24 Stunden</dd></div>
      <div><dt>Ladengeschäft</dt><dd>3 Bilder · Mo–Fr 09:30–18:30 · Sa 09:30–16:30</dd></div>
      <div><dt>Medium</dt><dd>Alle Aufnahmen analog gefertigt</dd></div>
      <div><dt>Programm</dt><dd>Wechselnde Ausstellungen</dd></div>
     </dl>
     <div className="gal-actions">
      <a className="btn btn-primary" href="#besuch">Schaufenster besuchen <Arrow/></a>
      <a className="btn btn-ghost" href="#ausstellen">Eigene Bilder zeigen</a>
     </div>
    </div>
   </div>
  </section>

  <section className="gal-window zone-dark" aria-labelledby="gal-window-title">
   <div className="wrap"><SectionHead code="GAL" label="Schaufenster · Modell" index="01 / 04" id="gal-window-title" title="Neun Bilder hinter Glas."/></div>
   <WindowStage/>
  </section>

  <section className="gal-wall-section zone-graphite section" aria-labelledby="gal-wall-title">
   <div className="wrap">
    <SectionHead code="GAL" label="Wand · 12 Abzüge" index="02 / 04" id="gal-wall-title" title="Vom Kontaktbogen an die Wand."/>
    <div className="gal-notice"><b className="mono">Darstellung</b><p>Das ist <strong>nicht die aktuelle Ausstellung.</strong> Welche Bilder gerade im Fenster hängen, siehst du nur vor Ort – die Ausstellungen wechseln. Hier hängen ein Labormuster und Fotos aus Laden, Labor und Digitalisierung, damit du die Hängung kennenlernst.</p><p className="gal-notice-lab">Das Porsche-Motiv (01) ist ein Labormuster auf Kodak Tri-X. <Link className="link" href={DEVELOPER_COMPARISON}>Vier Entwickler im Vergleich <Arrow/></Link></p></div>
    <PrintWall onOpen={setOpen}/>
   </div>
  </section>

  <section className="gal-plan zone-dark section" aria-labelledby="gal-plan-title">
   <div className="wrap">
    <SectionHead code="GAL" label="Hängeplan" index="03 / 04" id="gal-plan-title" title="Wo was hängt."/>
    <div className="gal-plan-grid">
     <WindowMap onOpen={setOpen}/>
     <figure className="gal-evidence gal-evidence-plan">
      <div className="gal-evidence-photo"><img src="/images/store-front-l.webp" srcSet="/images/store-front.webp 600w, /images/store-front-l.webp 1063w" sizes="(max-width: 1023px) calc(100vw - 32px), 42vw" width={1063} height={709} loading="lazy" decoding="async"
       alt="Das Schaufenster aus der Nähe: neun schwarze Rahmen mit weißen Passepartouts in drei Reihen, davor drei kleine Strahler auf der Fensterbank."/></div>
      <figcaption><span className="mono">Zum Vergleich · Foto vom 12.03.2018</span><span>Drei Reihen à drei Rahmen, Strahler auf der Fensterbank. Die Nummern im Plan folgen diesem Raster.</span></figcaption>
     </figure>
    </div>
   </div>
  </section>

  <section className="gal-visit zone-dark section grain" aria-labelledby="gal-visit-title">
   <div className="wrap">
    <SectionHead code="GAL" label="Ausstellen · Besuchen" index="04 / 04" id="gal-visit-title" title="Komm mit deinen Aufnahmen vorbei."/>
    <div className="gal-visit-grid">
     <div className="gal-call" id="ausstellen">
      <h3>Du fotografierst analog?</h3>
      <p className="lead">Du fotografierst analog und möchtest deine Bilder zeigen? Komm mit deinen Aufnahmen vorbei.</p>
      <p className="gal-call-note">Im Fenster laufen wechselnde Ausstellungen, alle Aufnahmen sind analog gefertigt. Bei Interesse kommst du am besten persönlich mit deinen Bildern in den Laden – oder du meldest dich vorher bei uns.</p>
      <div className="gal-actions"><Link className="btn btn-primary" href="/kontakt">Kontakt aufnehmen <Arrow/></Link></div>
     </div>
     <div className="gal-visit-card" id="besuch">
      <h3>Besuch</h3>
      <address>Analog Store – Bilderfürst Fürth<br/>{galleryFacts.address}</address>
      <p className="gal-visit-corner"><span className="status status-ok">Schaufenster · {galleryFacts.corner} · 24 h</span></p>
      <dl className="gal-facts gal-hours">{galleryFacts.hours.map(([d,t])=><div key={d}><dt>{d}</dt><dd className="num">{t}</dd></div>)}</dl>
      <div className="gal-actions">
       <a className="btn btn-light" href={galleryFacts.maps} target="_blank" rel="noopener noreferrer" onClick={()=>track('click_maps',{from:'galerie'})}>Route in Google Maps <ArrowUp/></a>
       <a className="link" href={galleryFacts.phone.href} onClick={()=>track('click_call',{from:'galerie'})}>{galleryFacts.phone.label}</a>
      </div>
      <span className="snapshot-note">Adresse und Öffnungszeiten laut photostudio.de, Stand 05.10.2026. Google Maps lädt erst nach dem Klick.</span>
     </div>
    </div>
   </div>
  </section>

  <PrintLightbox index={open} onIndex={setOpen} onClose={close}/>
 </div>;
}
