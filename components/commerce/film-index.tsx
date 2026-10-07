"use client";
// Film-Index: table view for enthusiasts (real catalog fields only). Sort headers are full-cell
// buttons (>= 44 px, audit O9); every row is rendered (compact, no "Mehr laden").
import Link from 'next/link';
import {type Product,formatPrice} from '@/lib/catalog';
import {type Sort,brandOf,fromPrice} from '@/lib/shop-filters';
import {Chip} from '@/components/analog/primitives';
import {displayName,nameHasBrand,processChip,processLabel,stockLabel} from './product-meta';

export function FilmIndex({items,sort,onSort}:{items:Product[];sort:Sort;onSort:(s:Sort)=>void}){
 const head=(label:string,key:Sort|null,cls='')=>{
  if(!key)return <th scope="col" className={cls}><span className="fi-th">{label}</span></th>;
  const active=sort===key||(key==='preis-auf'&&sort==='preis-ab');
  const next:Sort=key==='preis-auf'&&sort==='preis-auf'?'preis-ab':key;
  return <th scope="col" className={`fi-sortable ${cls}`} aria-sort={active?(sort==='preis-ab'?'descending':'ascending'):undefined}><button type="button" onClick={()=>onSort(next)} data-active={active}>{label}<span aria-hidden="true">{active?(sort==='preis-ab'?'↓':'↑'):'↕'}</span></button></th>;
 };
 return <div className="film-index">
  <table>
   <caption className="sr-only">Film-Index: {items.length} Produkte mit ISO, Format, Prozess, Preis und Status</caption>
   <thead><tr>{head('Film','name')}{head('ISO','iso','num-col')}{head('Format',null,'opt-col')}{head('Prozess',null,'opt-col')}{head('Preis','preis-auf','num-col')}{head('Status',null)}</tr></thead>
   <tbody>{items.map(p=>{const name=displayName(p);const brand=brandOf(p);
    return <tr key={p.slug} data-result>
     <th scope="row"><Link href={`/p/${p.slug}`}>{brand&&!nameHasBrand(name,brand)&&<span className="mono faint">{brand}</span>}{name}</Link><span className="fi-mobile mono">{[p.format,processLabel(p.process)].filter(Boolean).join(' · ')}</span></th>
     <td className="num-col mono num">{p.iso||'–'}</td>
     <td className="opt-col mono">{p.format||'–'}</td>
     <td className="opt-col">{p.process?<Chip kind={processChip(p.process)}>{processLabel(p.process)}</Chip>:'–'}</td>
     <td className="num-col num">{formatPrice(fromPrice(p))}</td>
     <td><span className={`status ${p.inStock?'status-ok':'status-ask'}`}>{stockLabel(p)}</span></td>
    </tr>})}</tbody>
  </table>
 </div>;
}
