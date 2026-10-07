// /i/fineart-prints + /i/preisliste · FineArt print room (server component; client islands in print-room.tsx).
// Facts: /i/fineart-prints (edited 2025-03-27), /i/preisliste (edited 2026-02-02), homepage ("Bilder vom Handy"),
// all re-verified live 2026-10-05. Conflicts: SOURCE-CONFLICTS #19 (A3+), #20 (Metallic 20×30).
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {SectionHead} from '@/components/analog/primitives';
import {PrintRoom,StandardPrints} from './print-room';
import {printLines,SERVICE_FEE,SMALL_FINEART,STANDARD_PRINTS} from './print-data';
import {SRC,euro} from './facts';

export function PrintRoomPage({focus}:{focus:'fineart'|'preisliste'}){
 const lines=printLines();
 const sizes=lines[0].rows.map(r=>r.size);
 const isList=focus==='preisliste';
 const table=<table className="prt-table">
  <caption className="sr-only">Preise großer Drucke nach Papier und Format</caption>
  <thead><tr><th scope="col">Format</th>{lines.map(l=><th key={l.id} scope="col">{l.name}</th>)}</tr></thead>
  <tbody>{sizes.map(s=><tr key={s}><th scope="row" className="num">{s}</th>{lines.map(l=>{const r=l.rows.find(x=>x.size===s)!;return <td key={l.id} className="num" data-place={r.place}>{r.price!=null?euro(r.price):'auf Anfrage'}{r.mark==='*'&&<sup>*</sup>}{r.flag&&<sup>!</sup>}</td>})}</tr>)}</tbody>
 </table>;
 return <div className="prt">
  <header className="wrap page-head prt-head">
   <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/">Start</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{isList?'Preisliste':'FineArt Prints'}</span></nav>
   <p className="eyebrow"><b>PRT</b><span>Print Room · Fürth & Nürnberg</span></p>
   <h1>{isList?'Preisliste Druck.':'FineArt Prints.'}</h1>
   <p className="lead">{isList?'Große Drucke auf Fotopapier, Metallic und FineArt von 20 × 30 bis 100 × 190 cm, dazu Standardabzüge und „Bild vom Bild“. Alle Preise laut Preisliste des Geschäfts.':'Drucke auf FineArt-Papier, Fotopapier oder Metallic. Bis A3+ direkt in Fürth, große XL-Formate druckt der Fuji-Store in Nürnberg.'}</p>
  </header>

  <section className="zone-table prt-room-zone" aria-labelledby="prt-room-title">
   <div className="wrap">
    <SectionHead code="PRT" label="Große Drucke" index={`${lines.length} Papiere · ${sizes.length} Formate`} id="prt-room-title" title="Papier wählen, Format wählen."/>
    <PrintRoom lines={lines}/>
    {isList?<div className="prt-table-wrap"><h3>Alle Preise im Überblick</h3>{table}</div>:<details className="prt-table-wrap"><summary>Alle Preise als Tabelle</summary>{table}</details>}
    <p className="snapshot-note prt-legend">* Wird im Fuji-Store Nürnberg gedruckt (laut Preisliste) · ! Angabe in der Quelle uneindeutig, bitte im Laden erfragen · Preise laut Preisliste, Stand 02.02.2026, geprüft am 05.10.2026</p>
   </div>
  </section>

  <section className="section prt-small" aria-labelledby="prt-small-title">
   <div className="wrap">
    <SectionHead code="PRT" label="Abzüge & kleine Prints" id="prt-small-title" title="Vom Handy, von SD-Karte oder USB-Stick."/>
    <div className="prt-small-grid">
     <figure className="prt-kiosk">
      <img src="/images/print-kiosk-screens-l.webp" srcSet="/images/print-kiosk-screens.webp 1400w, /images/print-kiosk-screens-l.webp 1600w" sizes="(max-width: 900px) calc(100vw - 32px), 46vw" width={1600} height={1067} loading="lazy" decoding="async" alt="Bestellterminal für Abzüge mit Bildauswahl auf dem Bildschirm, dahinter weitere Terminals"/>
      <figcaption className="mono">Bestellterminals für Abzüge · Foto von der Website des Geschäfts</figcaption>
     </figure>
     <div className="prt-small-copy">
      <p className="prt-lede">Bilder vom Handy vor Ort in Ruhe bestellen, geschützt vor fremden Blicken – und sofort mitnehmen.</p>
      <div className="prt-block">
       <h3>Standardgrößen</h3>
       <p>Auf Luster- oder Glanzpapier, pro Bild. Pro Auftrag kommt eine Servicegebühr von {euro(SERVICE_FEE)} dazu.</p>
       <dl className="prt-ledger">{STANDARD_PRINTS.map(p=><div key={p.size}><dt className="num">{p.size}</dt><dd className="num">{euro(p.price)}</dd></div>)}</dl>
       <StandardPrints prints={STANDARD_PRINTS} fee={SERVICE_FEE}/>
      </div>
      <div className="prt-block">
       <h3>Kleine FineArt Prints</h3>
       <p>Auf FineArt-Papier, glänzend oder seidenmatt, in {SMALL_FINEART.join(', ').replace(/, ([^,]*)$/,' und $1')} cm. Einen eigenen Preis dafür nennt die Website nicht – bitte im Laden erfragen.</p>
      </div>
     </div>
    </div>
   </div>
  </section>

  <section id="bild-vom-bild" className="prt-reprint" aria-labelledby="prt-reprint-title">
   <div className="wrap prt-reprint-inner">
    <p className="eyebrow"><b>PRT</b><span>Scan & Neuabzug</span></p>
    <h2 id="prt-reprint-title">Bild vom Bild.</h2>
    <p>Wir scannen deine Fotos ein und drucken neue Abzüge – mit etwas mehr Spielraum bei Größe und Bearbeitung. Auf Wunsch entfernen wir Flecken, Knicke und Bildfalten und frischen die Farben auf; was möglich ist, hängt vom Bild ab. Bring deine Fotos vorbei, wir sagen dir vorher, was wir herausholen können und was es kostet.</p>
    <div className="source-actions">
     <Link className="btn btn-ink" href="/kontakt">Mit deinen Bildern vorbeikommen <ArrowUpRight size={17} className="btn-arrow-up"/></Link>
     <a className="link" href={SRC.prices} target="_blank" rel="noopener noreferrer">Originalseite „Preisliste“ <ArrowUpRight size={15}/></a>
     <a className="link" href={SRC.fineart} target="_blank" rel="noopener noreferrer">Originalseite „FineArt Prints“ <ArrowUpRight size={15}/></a>
    </div>
   </div>
  </section>
 </div>;
}
