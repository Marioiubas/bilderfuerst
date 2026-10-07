// /services · four photographic disciplines (Studio · Labor · Archiv · Druck) + studio detail.
// Calm light page, no WebGL, mostly still. Server component with two client islands (tracked links,
// portrait package chooser). Facts: /i/passbilder-preise, /i/bewerbungsbilder-preise (+ price graphic),
// homepage ("kein Termin notwendig"), /p/filmentwicklung-kleinbild, /i/wir-digitalisieren, /i/preisliste.
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Phone,CalendarClock} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {TrackedLink} from './tracked';
import {PortraitPlanner} from './portrait-planner';
import {BOOKING,PHONE,SRC} from './facts';

const DISCIPLINES=[
 {code:'STU',kind:'studio',name:'Studio',title:'Pass- & Bewerbungsbilder',facts:['Passbilder ohne Termin','Bewerbungsbilder mit Termin'],href:'#studio',cta:'Zum Studio'},
 {code:'LAB',kind:'lab',name:'Labor',title:'Filmentwicklung im eigenen Labor',facts:['C-41 · Schwarzweiß · E-6','135 · 120 · 110','Scans: Noritsu HS-1800','ab 7,00 € (135 · C-41)'],href:'/filmentwicklung',cta:'Film entwickeln'},
 {code:'SCN',kind:'archive',name:'Archiv',title:'Digitalisierung in der Manufaktur',facts:['Negative · Dias · Schmalfilm','Video · Audio','Digitalisierung seit 2001','Manufaktur Fürth-Dambach'],href:'/digitalisierung',cta:'Digitalisieren'},
 {code:'PRT',kind:'print',name:'Druck',title:'FineArt & Abzüge',facts:['Abzüge ab 0,45 € (10×15)','FineArt bis A3+ in Fürth','XL-Formate in Nürnberg'],href:'/i/fineart-prints',cta:'Zum Print Room'},
] as const;

export function ServicesPage(){
 return <div className="svc">
  <header className="wrap page-head svc-head">
   <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/">Start</Link><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
   <p className="eyebrow"><b>STU</b><span>Services · Alexanderstraße 2 · Fürth</span></p>
   <h1>Studio, Labor, Archiv, Druck.</h1>
   <p className="lead">Vier fotografische Handwerke: im Laden in der Alexanderstraße 2 und in der bilderfürst Manufaktur in Fürth-Dambach. Vom biometrischen Passbild über entwickelte Negative bis zum FineArt-Print.</p>
  </header>

  <section className="wrap svc-disciplines" aria-labelledby="svc-disc-title">
   <h2 id="svc-disc-title" className="sr-only">Die vier Disziplinen</h2>
   <ol className="svc-tiles">
    {DISCIPLINES.map((d,i)=>{
     const body=<>
      <span className="svc-tile-code mono"><b>{d.code}</b><span>0{i+1} / 04</span></span>
      <span className="svc-tile-name">{d.name}</span>
      <h3>{d.title}</h3>
      <ul className="svc-tile-facts">{d.facts.map(f=><li key={f} className="mono">{f}</li>)}</ul>
     </>;
     // Studio is the most asked-for service: its card carries the Passbild price and a direct CTA (OLD had it at ≈520 px).
     return <li key={d.code} className={`svc-tile svc-tile-${d.kind}`}>
      {d.kind==='studio'?<div className="svc-tile-link svc-tile-card">{body}
       <p className="svc-tile-price"><span className="mono">Passbild · 4er Set</span><strong className="num">20,00 €</strong></p>
       <span className="svc-tile-actions">
        <TrackedLink href="/kontakt" event="click_passbilder" payload={{target:'kontakt',source:'tile'}} className="btn btn-primary btn-sm">Ohne Termin vorbeikommen <ArrowRight size={15}/></TrackedLink>
        <Link className="link" href={d.href}>Details</Link>
       </span>
      </div>:<Link href={d.href} className="svc-tile-link">{body}<span className="svc-tile-cta">{d.cta} <ArrowRight size={15}/></span></Link>}
     </li>;
    })}
   </ol>
  </section>

  <section id="studio" className="section svc-studio" aria-labelledby="svc-pass-title">
   <div className="wrap">
    <SectionHead code="STU" label="Studio · Passbilder" index="01 / 02" id="svc-pass-title" title="Passbilder ohne Termin."/>
    <div className="svc-pass">
     <figure className="svc-bio">
      <div className="svc-bio-card reg">
       <svg viewBox="0 0 350 450" fill="none" aria-hidden="true">
        <rect x=".5" y=".5" width="349" height="449" stroke="currentColor" opacity=".55"/>
        <path d="M175 0v450" stroke="currentColor" strokeDasharray="3 5" opacity=".45"/>
        <g stroke="currentColor" strokeDasharray="6 4" opacity=".7"><path d="M40 52h270"/><path d="M40 196h270"/><path d="M40 360h270"/></g>
        <g stroke="currentColor" opacity=".6"><path d="M0 52h12M338 52h12M0 196h12M338 196h12M0 360h12M338 360h12"/></g>
       </svg>
       <span className="svc-bio-label mono" style={{top:'11.5%'}}>Scheitel</span>
       <span className="svc-bio-label mono" style={{top:'43.5%'}}>Augenlinie</span>
       <span className="svc-bio-label mono" style={{top:'80%'}}>Kinn</span>
       <span className="svc-bio-axis mono">Mitte</span>
      </div>
      <figcaption className="mono">Schema · Bildausschnitt eines Passbilds. Fotografiert und zugeschnitten wird im Laden.</figcaption>
     </figure>
     <div className="svc-pass-copy">
      <p className="svc-lede">Biometrische Fotos für jedes Dokument: Personalausweis, Reisepass, Bootsführerschein, Fahrkarte, Studentenausweis oder Visum – für jedes Land.</p>
      <dl className="svc-specs">
       <div><dt>Termin</dt><dd>Nicht nötig. Während der Öffnungszeiten vorbeikommen, die Bilder gibt es sofort zum Mitnehmen.</dd></div>
       <div><dt>Ablauf</dt><dd>In der Regel 2–3 Aufnahmen, die wir zusammen anschauen und anpassen. Nicht zufrieden? Dann fotografieren wir gern noch einmal.</dd></div>
       <div><dt>Wünsche</dt><dd>Etwas Besonderes vor? Sprich uns einfach an.</dd></div>
      </dl>
      <dl className="svc-prices">
       <div><dt>4er Set mit Zuschnitt oder QR-Code fürs Amt<small>pro Person</small></dt><dd className="num">20,00 €</dd></div>
       <div><dt>In digitaler Form</dt><dd className="num">25,00 €</dd></div>
      </dl>
      <div className="svc-actions">
       <TrackedLink href="/kontakt" event="click_passbilder" payload={{target:'kontakt'}} className="btn btn-primary">Vorbeikommen: Weg & Öffnungszeiten <ArrowRight size={17}/></TrackedLink>
       <TrackedLink href="/i/passbilder-preise" event="click_passbilder" payload={{target:'details'}} className="link">Alle Angaben zu Passbildern <ArrowUpRight size={15}/></TrackedLink>
      </div>
     </div>
    </div>
   </div>
  </section>

  <section id="bewerbung" className="section svc-portrait" aria-labelledby="svc-portrait-title">
   <div className="wrap">
    <SectionHead code="STU" label="Studio · Bewerbungsbilder" index="02 / 02" id="svc-portrait-title" title="Bewerbungsbilder mit Termin."/>
    <div className="svc-portrait-grid">
     <div className="svc-portrait-copy">
      <p className="svc-lede">Mit Termin nehmen wir uns mehr Zeit: Wir fotografieren in Ruhe und suchen die Aufnahmen danach gemeinsam aus.</p>
      <div className="svc-advice">
       <h3>Was anziehen?</h3>
       <p>Am besten etwas Ordentliches und Schlichtes. Ein Hemd wirkt souveräner als ein T-Shirt oder ein Hoodie – erst recht, wenn ein Schriftzug darauf ist. Wie formell es sein soll, hängt von deiner Branche ab.</p>
      </div>
      <div className="svc-actions">
       <TrackedLink href={BOOKING} event="book_bewerbungsbilder" payload={{source:'services'}} className="btn btn-primary">Termin online buchen <CalendarClock size={17}/></TrackedLink>
       <TrackedLink href={PHONE.href} event="click_call" payload={{source:'bewerbungsbilder'}} className="btn btn-ghost">Oder anrufen: {PHONE.display} <Phone size={16}/></TrackedLink>
      </div>
      <p className="snapshot-note">Buchung über den externen Dienst Calenso · öffnet in einem neuen Tab</p>
     </div>
     <PortraitPlanner/>
    </div>
    <p className="snapshot-note svc-source">Pakete und Preise: Preisgrafik der Seite „Bewerbungsbilder / Preise“, gelesen am 05.10.2026 · <a href={SRC.bewerbung} target="_blank" rel="noopener noreferrer">Quelle</a></p>
   </div>
  </section>

  <section className="section svc-more" aria-labelledby="svc-more-title">
   <div className="wrap">
    <SectionHead code="FTH" label="Außerdem im Laden" id="svc-more-title" title="Weitere Services."/>
    <ul className="svc-more-list">
     <li><span className="mono">PRT</span><h3>Bild vom Bild</h3><p>Wir scannen deine Abzüge und drucken sie neu. Flecken, Knicke und Bildfalten können wir je nach Bild entfernen und Farben auffrischen. Was möglich ist und was es kostet, sagen wir dir, wenn du die Fotos mitbringst.</p><Link className="link" href="/i/preisliste#bild-vom-bild">Zum Print Room <ArrowUpRight size={15}/></Link></li>
     <li><span className="mono">STR</span><h3>Analoge Kameras: An- & Verkauf</h3><p>Kameras, Objektive und Zubehör gibt es im Laden und im eBay-Shop. Deine analoge Kamera kaufen wir gern an.</p><Link className="link" href="/i/ebay-analoge-schaetze">Analoge Schätze <ArrowUpRight size={15}/></Link></li>
     <li><span className="mono">FTH</span><h3>Abgabestellen</h3><p>Film und Material abgeben: in Fürth, im Fuji-Store Nürnberg und in der bilderfürst Manufaktur in Fürth-Dambach.</p><Link className="link" href="/kontakt#abgabestellen">Adressen & Zeiten <ArrowUpRight size={15}/></Link></li>
    </ul>
    <p className="snapshot-note svc-source">Angaben laut Website des Geschäfts, abgerufen am 05.10.2026. Preise vor einem Auftrag im Laden bestätigen.</p>
   </div>
  </section>
 </div>;
}
