// Generic source pages (/i/[slug]), legal pages (/l/[slug]) and the 404 view. Calm, typographic, server-only.
// Source text is rendered unchanged; only layout is applied (short lines ending in ":" or "?" or very
// short labels become sub-heads, price lines become ledger rows). Legal text keeps every paragraph as <p>.
import Link from 'next/link';
import type {ReactNode} from 'react';
import {ArrowUpRight,CalendarClock,Phone} from 'lucide-react';
import {TrackedLink} from './tracked';
import {BOOKING,PHONE} from './facts';

type Source={title:string;paragraphs:string[];source:string;updated?:string};
const isPrice=(t:string)=>t.length<90&&/\d+,\d{2}\s?€\s*$/.test(t);
const isSub=(t:string)=>/^[A-ZÄÖÜ0-9]/.test(t)&&!isPrice(t)&&((t.length<=64&&/[:?]$/.test(t))||(t.length<=30&&!/[.,;!]$/.test(t)));
const dateDe=(iso?:string)=>iso?iso.split('-').reverse().join('.'):'04.10.2026';

type Related={code:string;label:string;links:ReactNode};
function related(slug:string):Related{
 const contact=<Link className="link" href="/kontakt">Persönlich nachfragen <ArrowUpRight size={15}/></Link>;
 const booking=<TrackedLink href={BOOKING} event="book_bewerbungsbilder" payload={{source:slug}} className="btn btn-primary">Termin online buchen <CalendarClock size={17}/></TrackedLink>;
 const call=<TrackedLink href={PHONE.href} event="click_call" payload={{source:slug}} className="link">{PHONE.display} <Phone size={14}/></TrackedLink>;
 switch(slug){
  case 'passbilder-preise':return {code:'STU',label:'Studio · Passbilder',links:<><TrackedLink href="/services#studio" event="click_passbilder" payload={{target:'services',source:slug}} className="btn btn-primary">Passbilder im Überblick <ArrowUpRight size={17} className="btn-arrow-up"/></TrackedLink><TrackedLink href="/kontakt" event="click_passbilder" payload={{target:'kontakt',source:slug}} className="link">Ohne Termin vorbeikommen <ArrowUpRight size={15}/></TrackedLink></>};
  case 'bewerbungsbilder-preise':case 'online-terminvergabe':return {code:'STU',label:'Studio · Bewerbungsbilder',links:<>{booking}<Link className="link" href="/services#bewerbung">Pakete & Preise <ArrowUpRight size={15}/></Link>{call}</>};
  case 'negativ-digitalisierung':case 'dias-digitalisierung-1':case 'super8-normal8-16mm-35mm-kino':case 'alle-videokassetten-und-formate':return {code:'SCN',label:'Archiv · Digitalisierung',links:<><Link className="btn btn-ink" href="/digitalisierung">Zur Digitalisierung <ArrowUpRight size={17} className="btn-arrow-up"/></Link>{contact}</>};
  case 'ebay-analoge-schaetze':return {code:'STR',label:'Store · Analoge Schätze',links:<><a className="btn btn-ink" href="https://www.ebay.de/usr/bilderfuerstfuerth" target="_blank" rel="noopener noreferrer">eBay-Shop öffnen <ArrowUpRight size={17} className="btn-arrow-up"/></a>{contact}</>};
  default:return {code:'FTH',label:'Serviceinformation',links:contact};
 }
}

export function SourcePage({slug,page}:{slug:string;page:Source}){
 const r=related(slug);
 const empty=!page.paragraphs.length;
 return <article className="wrap src">
  <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/">Start</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></nav>
  <header className="src-head">
   <p className="eyebrow"><b>{r.code}</b><span>{r.label}</span><span className="sec-index">Quellarchiv</span></p>
   <h1>{page.title}</h1>
  </header>
  <div className="src-grid">
   <div className="src-prose">
    {empty?<p>{slug==='online-terminvergabe'?'Termine für Bewerbungsbilder vergibt der Laden online über Calenso oder telefonisch.':'Für diese Seite liegt im Quellarchiv kein Text vor.'}</p>:page.paragraphs.map((t,i)=>isPrice(t)?<p key={i} className="src-price num">{t}</p>:isSub(t)?<h2 key={i} className="src-sub">{t}</h2>:<p key={i}>{t}</p>)}
   </div>
   <aside className="src-aside">
    <p className="source-note">Text der Website des Geschäfts, abgerufen am {dateDe(page.updated)}. Aktuelle Preise und Abläufe bitte vor einem Auftrag bestätigen.</p>
    <div className="src-actions">{r.links}</div>
    <a className="link src-origin" href={page.source} target="_blank" rel="noopener noreferrer">Originalseite ansehen <ArrowUpRight size={15}/></a>
   </aside>
  </div>
 </article>;
}

const LEGAL=[['contact','Impressum'],['privacy','Datenschutz'],['cookiepolicy','Cookies'],['tac','AGB'],['withdrawal','Widerruf']] as const;
export function LegalPage({slug,page}:{slug:string;page:Source}){
 return <article className="wrap src src-legal">
  <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/">Start</Link><span aria-hidden="true">/</span><span>Rechtliches</span><span aria-hidden="true">/</span><span aria-current="page">{page.title}</span></nav>
  <header className="src-head">
   <p className="eyebrow"><b>DOC</b><span>Originaldokument · Inhaberprüfung</span></p>
   <h1>{page.title}</h1>
  </header>
  <div className="src-grid">
   <div className="src-prose src-prose-legal">
    <div className="source-note">Unveränderter Text der Quellwebsite (04.10.2026). Für diesen Entwurf ist vor Veröffentlichung eine gesonderte Freigabe nötig. Die Vorschau nutzt nur lokale Warenkorb-Persistenz; keine Zahlungs- oder Analysefunktionen sind aktiv.</div>
    {page.paragraphs.length?page.paragraphs.map((t,i)=><p key={i} className={t.length<=64&&/:$/.test(t)?'src-label':undefined}>{t}</p>):<p>Diese Seite ist im Quellshop nicht veröffentlicht. Angaben müssen vom Inhaber ergänzt werden.</p>}
    <a className="link src-origin" href={page.source} target="_blank" rel="noopener noreferrer">Originaldokument ansehen <ArrowUpRight size={15}/></a>
   </div>
   <nav className="src-aside src-docs" aria-label="Rechtliche Dokumente">
    <p className="field-label">Dokumente</p>
    <ul>{LEGAL.map(([s,l])=><li key={s}><Link href={`/l/${s}`} aria-current={s===slug?'page':undefined}>{l}</Link></li>)}</ul>
   </nav>
  </div>
 </article>;
}

export function NotFoundView(){
 return <section className="wrap nf" aria-labelledby="nf-title">
  <div className="nf-frame" aria-hidden="true">
   <div className="sprockets"/>
   <div className="nf-blank"><span className="mono">00 · unbelichtet</span><span className="nf-reg"/></div>
   <div className="sprockets"/>
   <p className="edge-print">▸ 404 &nbsp; ▸ 404A &nbsp; ▸ 405</p>
  </div>
  <div className="nf-copy">
   <p className="eyebrow"><b>404</b><span>Bild nicht gefunden</span></p>
   <h1 id="nf-title">Dieses Bild wurde nie belichtet.</h1>
   <p className="lead">Die Seite gibt es hier nicht – vielleicht hat sie sich beim Umzug der Website verschoben.</p>
   <div className="source-actions">
    <Link className="btn btn-primary" href="/">Zur Startseite <ArrowUpRight size={17} className="btn-arrow-up"/></Link>
    <Link className="link" href="/shop">Analog Store</Link>
    <Link className="link" href="/filmentwicklung">Filmentwicklung</Link>
    <Link className="link" href="/kontakt">Laden & Kontakt</Link>
   </div>
  </div>
 </section>;
}
