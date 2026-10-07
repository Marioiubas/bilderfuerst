// /kontakt · "Das echte Geschäft hinter dem Shop." Calm light page; the only motion is a tiny optional
// depth on the real storefront photo (desktop). Facts: /i/kontakt-und-oeffnungszeiten (2026-06-18),
// /i/drop-off-locations (2026-08-24), /i/unser-geschaeft (2026-06-18), /i/galerie, /i/ebay-analoge-schaetze.
import Link from 'next/link';
import {ArrowUpRight,MapPin,Phone,Mail} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {TrackedLink} from './tracked';
import {HoursTable,OpenStatus,TodayLine} from './hours';
import {Storefront} from './storefront';
import {EMAIL,PHONE,PLACES,mapsRoute} from './facts';

const DO=[
 {code:'LAB',title:'Film abgeben & abholen',text:'Entwicklung im hauseigenen Labor: Farbe (C-41), Schwarzweiß und Dia (E-6), dazu Scans vom Noritsu HS-1800.',href:'/filmentwicklung',cta:'Filmentwicklung'},
 {code:'STR',title:'Filme, Kameras, Zubehör',text:'Kleinbildfilme 135 und Rollfilme 120, Fototaschen und Stative, analoge Kameras, Objektive und Zubehör. Fragen zu Film und Kamera? Einfach im Laden stellen.',href:'/shop',cta:'Zum Shop'},
 {code:'STU',title:'Passbilder & Bewerbungsbilder',text:'Biometrische Passbilder ohne Termin, sofort zum Mitnehmen. Bewerbungsbilder mit Termin.',href:'/services#studio',cta:'Studio'},
 {code:'PRT',title:'Drucke bis A3+',text:'Abzüge vom Handy, von SD-Karte oder USB-Stick und FineArt-Drucke bis A3+ direkt in Fürth.',href:'/i/fineart-prints',cta:'Print Room'},
 {code:'GAL',title:'Street Gallery am Fenster',text:'Neun analoge Aufnahmen im Schaufenster, rund um die Uhr zu sehen; drei weitere im Laden während der Öffnungszeiten.',href:'/galerie',cta:'Street Gallery'},
 {code:'STR',title:'Analoge Kameras: An- & Verkauf',text:'Wir kaufen deine analoge Kamera gern an. Weitere analoge Schätze gibt es im eBay-Shop.',href:'/i/ebay-analoge-schaetze',cta:'Analoge Schätze'},
] as const;

export function ContactPage(){
 const fth=PLACES[0];
 return <div className="vis">
  <header className="wrap page-head vis-head">
   <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/">Start</Link><span aria-hidden="true">/</span><span aria-current="page">Laden & Kontakt</span></nav>
   <p className="eyebrow"><b>FTH</b><span>Fürth · Ladengeschäft · Abgabestellen</span></p>
   <h1 className="vis-title h-serif">Das echte Geschäft <em>hinter dem Shop.</em></h1>
   <p className="lead">Alexanderstraße 2, Ecke Schwabacher Straße. Film abgeben, Passbild machen, Fragen stellen – und im Schaufenster hängt die Street Gallery.</p>
  </header>

  <section className="wrap vis-main" aria-labelledby="vis-visit-title">
   <Storefront/>
   <div className="vis-card">
    <p className="eyebrow"><b>FTH</b><span>Besuch</span></p>
    <h2 id="vis-visit-title" className="vis-card-title">{fth.name}</h2>
    <OpenStatus placeId="fuerth"/>
    <address className="vis-address">{fth.street}<br/>{fth.city}</address>
    <div className="vis-actions">
     <TrackedLink href={mapsRoute(`${fth.street}, ${fth.city}`)} event="click_maps" payload={{place:'fuerth'}} className="btn btn-primary">Route planen <MapPin size={17}/></TrackedLink>
     <TrackedLink href={PHONE.href} event="click_call" payload={{source:'kontakt'}} className="btn btn-ghost">{PHONE.display} <Phone size={16}/></TrackedLink>
    </div>
    <p className="snapshot-note">Route öffnet Google Maps in einem neuen Tab · auf dieser Seite wird keine Karte geladen</p>
    <HoursTable placeId="fuerth"/>
    <p className="vis-mail"><Mail size={15} aria-hidden="true"/><a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
   </div>
  </section>

  <section className="section vis-inside" aria-labelledby="vis-inside-title">
   <div className="wrap">
    <SectionHead code="FTH" label="Im Laden" index="Alexanderstraße 2" id="vis-inside-title" title="Was du hier machen kannst."/>
    <ul className="vis-do">{DO.map(d=><li key={d.title}>
     <p className="mono vis-do-code"><b>{d.code}</b></p>
     <h3>{d.title}</h3>
     <p>{d.text}</p>
     <Link className="link" href={d.href}>{d.cta} <ArrowUpRight size={15}/></Link>
    </li>)}</ul>
   </div>
  </section>

  <section id="abgabestellen" className="section zone-table vis-drop" aria-labelledby="vis-drop-title">
   <div className="wrap">
    <SectionHead code="FTH" label="Abgabestellen" index={`${PLACES.length} Orte`} id="vis-drop-title" title="Dein Film findet zu uns."/>
    <ol className="vis-places">{PLACES.map(p=><li key={p.id} className="vis-place">
     <p className="mono vis-place-code"><b>{p.code}</b><span>{p.role}</span></p>
     <h3>{p.name}</h3>
     <address>{p.street}<br/>{p.city}</address>
     <p className="mono vis-place-hours">{p.hoursText}</p>
     <TodayLine placeId={p.id}/>
     {p.note&&<p className="vis-place-note">{p.note}</p>}
     {p.id==='nuernberg'&&<figure className="vis-place-photo">
      <img src="/images/fuji-store-nuernberg-interior.webp" width={1000} height={667} loading="lazy" decoding="async" alt="Innenraum des Fuji-Store Nürnberg mit Taschenwand, Holztisch und Treppe zur Galerie"/>
      <figcaption className="mono">Fuji-Store Nürnberg · Foto von der Website des Geschäfts</figcaption>
     </figure>}
     <TrackedLink href={mapsRoute(`${p.street}, ${p.city}`)} event="click_maps" payload={{place:p.id}} className="link vis-place-route">Route planen <ArrowUpRight size={15}/></TrackedLink>
    </li>)}</ol>
    <p className="snapshot-note vis-source">Adressen und Zeiten laut Website (Abgabestellen: Stand 24.08.2026, Kontakt: Stand 18.06.2026), geprüft am 05.10.2026. Laufzeiten nennt die Website nicht. Feiertage und Sonderzeiten bitte telefonisch erfragen.</p>
   </div>
  </section>

  <section className="section vis-archive" aria-labelledby="vis-archive-title">
   <div className="wrap">
    <SectionHead code="ARC" label="Aus dem Archiv · 2018" id="vis-archive-title" title="Der Laden im März 2018."/>
    <p className="lead vis-archive-lead">Archivaufnahmen mit der damaligen Fuji-X-Ausstattung. Heute ist das Ladengeschäft auf analoge Fotografie spezialisiert.</p>
    <ul className="vis-archive-strip">
     <li><figure><img src="/images/store-inside-l.webp" srcSet="/images/store-inside.webp 600w, /images/store-inside-l.webp 1063w" sizes="(max-width: 620px) calc(100vw - 32px), 46vw" width={1063} height={709} loading="lazy" decoding="async" alt="Verkaufsraum mit Blick zum Eingang und „bilderfürst“-Schild über der Tür, März 2018"/><figcaption className="mono">Archivaufnahme 2018 · Blick zum Eingang</figcaption></figure></li>
     <li><figure><img src="/images/store-interior-wide.webp" width={1063} height={709} loading="lazy" decoding="async" alt="Verkaufsraum mit Holztisch und der damaligen Fujifilm-X-Serie-Wand, März 2018"/><figcaption className="mono">Archivaufnahme 2018 · damalige X-Serie-Wand</figcaption></figure></li>
    </ul>
   </div>
  </section>
 </div>;
}
