// Price grid for all film-development variants, straight from lib/catalog.json. Each price links
// into the configurator pre-filled (deep link). Server-safe.
import Link from 'next/link';
import {bySlug,formatPrice} from '@/lib/catalog';
import {FORMAT_IDS,SCAN_IDS,SOURCE_DATE,configHref,findVariant,formats,processes,processesFor,scanLabel,tiffPremium} from './film-data';

export function PriceGrid(){
 const wholeRoll=['negativ-scan-ganze-rollen-kleinbild-film-35mm','negativ-scan-ganze-rollen-tiff-kleinbild-film-35mm','negativ-scan-ganze-rollen-mittelformat-film-120-maximal-6x12','negativ-scan-ganze-rollen-tiff-mittelformat-film-120-maximal-6x12'].map(bySlug);
 const premium=tiffPremium();
 return <div className="pg">
  <div className="pg-scroll"><table className="pg-table">
   <caption>Preis je Film inkl. MwSt. · Quellstand {SOURCE_DATE} · Klick auf einen Preis öffnet den Konfigurator</caption>
   <thead><tr><th scope="col">Format</th><th scope="col">Prozess</th>{SCAN_IDS.map(s=><th key={s} scope="col">{s==='Ohne Scan'?'Ohne Scan':`Scan ${s}`}</th>)}</tr></thead>
   <tbody>{FORMAT_IDS.flatMap(f=>processesFor(f).map((p,i)=>{const info=processes[p];return <tr key={`${f}-${p}`} data-first={i===0}>
    <th scope="row" data-label="Format">{formats[f].name} <span>{formats[f].sub}</span></th>
    <td data-label="Prozess"><span className={`chip chip-${info.kind}`}>{info.label}</span></td>
    {SCAN_IDS.map(s=>{const v=findVariant(f,p,s);return <td key={s} data-label={scanLabel(f,s)} className="num">{v?<Link href={configHref({format:f,process:p,scan:s})} aria-label={`${formats[f].name} ${info.label} ${scanLabel(f,s)}: ${formatPrice(v.price)}, im Konfigurator öffnen`}>{formatPrice(v.price)}</Link>:'—'}</td>})}
   </tr>}))}</tbody>
  </table></div>
  <p className="pg-note">{premium!==null&&`TIFF kostet in jeder Kombination ${formatPrice(premium)} mehr als JPG. `}110 gibt es nur in C-41 und Schwarzweiß, Push/Pull nur für 35mm Schwarzweiß.
   {wholeRoll.every(Boolean)&&<> Nur scannen, ungeschnittene ganze Rolle: 35mm {formatPrice(wholeRoll[0]!.price)} (JPG) / {formatPrice(wholeRoll[1]!.price)} (TIFF), 120 bis 6×12 {formatPrice(wholeRoll[2]!.price)} / {formatPrice(wholeRoll[3]!.price)} – <a className="pg-src" href="https://www.photostudio.de/p/negativ-scan-ganze-rollen" target="_blank" rel="noopener noreferrer">Negativ Scan (Ganze Rollen) ↗</a>.</>}
  </p>
 </div>;
}
