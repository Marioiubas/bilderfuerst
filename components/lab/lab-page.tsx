// /lab — "Unser Labor". Real photographs, the machine lineup as technical spec cards, the genuine
// developer samples (+ Compare), the price grid from the catalog and the way into the configurator.
// Outline type only in the page entrance; supporting headings are solid (audit P1).
import Link from 'next/link';
import {ArrowRight,ArrowUpRight} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {SectionHead} from '@/components/analog/primitives';
import {DeveloperLab} from './developer-lab';
import {ScanSpecs} from './scan-specs';
import {PriceGrid} from './price-grid';
import {LabMotion} from './lab-motion';
import {LabCompare} from './lab-compare';
import {formats,formatsFor,minPrice,processes,type ProcessId} from './film-data';

const fmt=(p:ProcessId)=>formatsFor(p).map(f=>formats[f].name).join(' · ');

const stations=[
 {code:'LAB-01',kind:'c41' as const,chip:'C-41',title:'Fujifilm-Minilab',rows:[['Prozess','C-41 Farbnegativ'],['Chemie','Fujifilm'],['Formate',fmt('C-41')]],quote:processes['C-41'].quote},
 {code:'LAB-02',kind:'bw' as const,chip:'Schwarzweiß',title:'Jobo-Rotationsmaschinen',rows:[['Prozess','Schwarzweiß, individuell'],['Entwickler','Wunsch-Entwickler auf Anfrage'],['Formate',fmt('S/W')],['Push/Pull',fmt('S/W Push/Pull')]],quote:processes['S/W'].quote},
 {code:'LAB-03',kind:'e6' as const,chip:'E-6',title:'Rotationsmaschine',rows:[['Prozess','E-6 Diafilm'],['Chemie','CineStill E-6'],['Formate',fmt('E-6')]],quote:processes['E-6'].quote},
 {code:'LAB-04',kind:null,chip:'Scan',title:'Noritsu HS-1800',rows:[['Kleinbild','6774 × 4492 px'],['Halbformat','4492 × 3167 px'],['120','4800 × 3500 bis 7100 × 4900 px'],['Dateien','JPG oder TIFF']],quote:'Unsere Scans werden mit einem Noritsu HS-1800 für beste Ergebnisse erstellt.'},
];

export function LabPage(){
 return <div className="lp">
  <header className="zone-dark lp-hero">
   <div className="wrap lp-hero-grid">
    <div className="lp-hero-copy">
     <p className="eyebrow"><b>LAB</b><span>Unser Labor · Alexanderstraße 2, Fürth</span></p>
     <h1 className="display">Unser Labor</h1>
     <blockquote className="lp-quote"><p>„Wir entwickeln deine Filme! Analoges Fotolabor im Herzen Fürths“</p><cite className="mono">Instagram · @bilderfuerstfuerth</cite></blockquote>
     <p className="lead">C-41 im Fujifilm-Minilab, Schwarzweiß in Jobo-Rotationsmaschinen, E-6 mit CineStill-Chemie, Scans vom Noritsu HS-1800. 35mm, 120 und 110, ab {formatPrice(minPrice({})??0)} je Film.</p>
     <div className="lp-actions"><Link className="btn btn-primary" href="/filmentwicklung">Film entwickeln <ArrowRight size={17} aria-hidden="true"/></Link><a className="link" href="#preise">Alle Preise <ArrowRight size={15} aria-hidden="true"/></a></div>
    </div>
    <figure className="lp-hero-photo">
     <img src="/images/lab-scan-l.webp" alt="Noritsu-Scanner im Labor: ein entwickelter 35mm-Negativstreifen läuft in die Filmbühne" width={1600} height={1066} fetchPriority="high" decoding="async"/>
     <figcaption className="mono">Noritsu-Scanner · 35mm-Negativ · Labor Fürth</figcaption>
    </figure>
   </div>
  </header>

  <section className="zone-dark section lp-stations" aria-labelledby="lp-stations-title">
   <div className="wrap">
    <SectionHead code="LAB" label="Maschinen & Prozesse" index="01" id="lp-stations-title" title={<>Vier Stationen</>}/>
    <LabMotion kind="specs" className="lp-cards">
     {stations.map(s=><article key={s.code} className="lp-card" data-kind={s.kind??'scan'}>
      <span className="lp-card-rule" data-rule aria-hidden="true"/>
      <p className="lp-card-code mono"><span>{s.code}</span><span className={`chip ${s.kind?`chip-${s.kind}`:''}`}>{s.chip}</span></p>
      <h3>{s.title}</h3>
      <dl className="lp-dl">{s.rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <blockquote className="lp-card-quote">„{s.quote}“</blockquote>
     </article>)}
    </LabMotion>
    <p className="lp-source mono">Wortlaut: Produktseiten Filmentwicklung, photostudio.de · Stand 05.10.2026 · Bearbeitungszeit nicht veröffentlicht, bitte im Laden erfragen</p>
   </div>
  </section>

  <section className="zone-graphite section lp-photos" aria-labelledby="lp-photos-title">
   <div className="wrap">
    <SectionHead code="LAB" label="Aus dem Labor" index="02" id="lp-photos-title" title={<>Film, Patrone, Scan</>}/>
    <LabMotion kind="photos" className="lp-contact">
     <figure className="lp-ph lp-ph-a"><img data-develop src="/images/film-rolls-l.webp" alt="Belichtete 35mm-Filmpatronen im Labor, Nahaufnahme" width={1600} height={1067} loading="lazy" decoding="async"/><figcaption className="mono"><span>01</span>Belichtete Patronen · Labor Fürth</figcaption></figure>
     <figure className="lp-ph lp-ph-b"><img data-develop src="/images/lab-film-l.webp" alt="Filmpatronen, darunter Kodak Portra 800, auf weißem Grund" width={1600} height={1066} loading="lazy" decoding="async"/><figcaption className="mono"><span>02</span>Filme zur Entwicklung · u. a. Portra 800</figcaption></figure>
     <figure className="lp-ph lp-ph-c"><img data-develop src="/images/scanner-ccd-sensor.webp" alt="CCD-Sensor in einem Objektivring eines Scannerkopfs" width={470} height={467} loading="lazy" decoding="async"/><figcaption className="mono"><span>03</span>CCD-Sensor eines Scannerkopfs · Bild der Manufaktur-Seite „Wir digitalisieren“ · <Link href="/digitalisierung">Digitalisierung</Link></figcaption></figure>
     <figure className="lp-ph lp-ph-d"><img data-develop src="/images/workshop-schwarz-weiss-filmentwicklung-am-samstag-den-19-07-2025-1.webp" alt="Schwarzweiß-Foto: zwei Personen betrachten Negativstreifen auf einem Leuchttisch in einem abgedunkelten Raum" width={1400} height={926} loading="lazy" decoding="async"/><figcaption className="mono"><span>04</span>Workshop Schwarzweiß-Filmentwicklung, Juli 2025 · vergangene Veranstaltung (Odd Squad Studios Nürnberg, mit dem Analog-Store)</figcaption></figure>
    </LabMotion>
   </div>
  </section>

  <section className="zone-dark section lp-dev" aria-labelledby="lp-dev-title">
   <div className="wrap">
    <SectionHead code="LAB" label="Schwarzweiß-Entwickler" index="03" id="lp-dev-title" title={<>Ein Film, vier Entwickler</>}/>
    <DeveloperLab idPrefix="lp" headingLevel="h3"/>
    <div className="lp-compare">
     <div className="lp-compare-copy">
      <h3>Adonal gegen D-76</h3>
      <p>Derselbe Kodak Tri-X, links Adox Adonal 1+25 (7:00 Min.), rechts Kodak D-76 1+0 (6:45 Min.). Echte Laborscans, nichts simuliert. Regler ziehen oder mit den Pfeiltasten vergleichen.</p>
     </div>
     <LabCompare/>
    </div>
   </div>
  </section>

  <section className="zone-dark section lp-scan" aria-labelledby="lp-scan-title">
   <div className="wrap">
    <SectionHead code="LAB" label="Noritsu HS-1800" index="04" id="lp-scan-title" title={<>Scan-Größen</>}/>
    <ScanSpecs idPrefix="lp-scan"/>
   </div>
  </section>

  <section className="zone-light section lp-prices" id="preise" aria-labelledby="lp-prices-title">
   <div className="wrap">
    <SectionHead code="LAB" label="Preisliste Filmentwicklung" index="05" id="lp-prices-title" title={<>Preise je Film</>} action={<Link className="btn btn-primary" href="/filmentwicklung">Konfigurator öffnen <ArrowRight size={17} aria-hidden="true"/></Link>}/>
    <PriceGrid/>
   </div>
  </section>

  <section className="zone-dark lp-cta" aria-labelledby="lp-cta-title">
   <div className="wrap lp-cta-grid">
    <h2 id="lp-cta-title">Film abgeben,<br/><span className="lp-cta-sub">Rest machen wir</span></h2>
    <div>
     <p className="lead">Im Laden in der Alexanderstraße 2 abgeben, einschicken oder an einer Drop-off-Stelle lassen. Bearbeitungszeit bitte im Laden erfragen.</p>
     <div className="lp-actions"><Link className="btn btn-primary" href="/filmentwicklung">Film entwickeln <ArrowRight size={17} aria-hidden="true"/></Link><Link className="link" href="/kontakt">Kontakt & Abgabestellen <ArrowUpRight size={15} aria-hidden="true"/></Link></div>
    </div>
   </div>
  </section>
 </div>;
}
