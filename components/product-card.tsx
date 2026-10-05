"use client";
// Product card v2: a catalogued object on a light table.
// Hierarchy: frame no. · brand · product · image · format/process/ISO · price · availability.
import Link from 'next/link';
import {Plus,ArrowUpRight} from 'lucide-react';
import {type Product,formatPrice,shopGroup} from '@/lib/catalog';
import {track} from '@/lib/analytics';
import {Chip,frameNo} from './analog/primitives';
import {useStore} from './store-context';
import {badgeOf,brandLabel,displayName,edgeLine,priceLabel,processChip,processLabel,stockLabel,groupLabel} from './commerce/product-meta';

export function ProductCard({product:p,index=0,eager=false,compact=false}:{product:Product;index?:number;eager?:boolean;compact?:boolean}){
 const {add}=useStore();
 const name=displayName(p);const href=`/p/${p.slug}`;const badge=badgeOf(p);const price=priceLabel(p);
 const quick=p.inStock&&!p.isMaster&&!p.isPastEvent;
 const select=()=>track('select_item',{slug:p.slug,index});
 const data=[p.format,p.iso?`ISO ${p.iso}`:''].filter(Boolean);
 return <article className={`pcard${compact?' pcard-compact':''}`} data-result data-group={shopGroup(p)}>
  <Link href={href} className="pcard-stage" tabIndex={-1} aria-hidden="true" onClick={select}>
   <span className="pcard-index mono num">{frameNo(index+1)}</span>
   {badge&&<span className="pcard-badge mono">{badge}</span>}
   <img src={p.images[0]} alt="" width={420} height={420} loading={eager?'eager':'lazy'} decoding="async"/>
   <span className="pcard-edge" aria-hidden="true">{edgeLine(p)||groupLabel(p).toUpperCase()} <i>▸ {frameNo(index+1)}A</i></span>
  </Link>
  {quick?<button type="button" className="pcard-add" aria-label={`${name} in den Vorschau-Warenkorb`} onClick={()=>{add(p.slug);track('add_to_cart',{slug:p.slug,quantity:1,source:'card'})}}><Plus size={17} strokeWidth={1.8}/></button>
   :<Link href={href} className="pcard-add pcard-add-link" aria-label={`${name}: ${p.isMaster?'Optionen wählen':'Details ansehen'}`} onClick={select}><ArrowUpRight size={17} strokeWidth={1.8}/></Link>}
  <div className="pcard-body">
   <p className="pcard-brand mono">{brandLabel(p)}</p>
   <h3 className="pcard-title"><Link href={href} onClick={select}>{name}</Link></h3>
   <p className="pcard-data mono">{data.map(d=><span key={d}>{d}</span>)}{p.process&&<Chip kind={processChip(p.process)}>{processLabel(p.process)}</Chip>}{!data.length&&!p.process&&<span>{groupLabel(p)}</span>}</p>
   <div className="pcard-foot">
    <span className="pcard-price num">{price.from&&<small>ab </small>}{formatPrice(price.amount)}</span>
    <span className={`status ${p.inStock?'status-ok':'status-ask'}`}>{stockLabel(p)}</span>
   </div>
  </div>
 </article>;
}
