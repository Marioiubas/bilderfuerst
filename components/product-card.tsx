"use client";
// Product card v2: a catalogued object on a light table.
// Hierarchy (audit H2/H3): image · name (brand line only when the name does not start with it) ·
// spec line format · process · ISO (wraps) · price + availability in one row. Quick add has a 44 px hit area.
import Link from 'next/link';
import {Plus,ArrowUpRight} from 'lucide-react';
import {type Product,formatPrice,shopGroup} from '@/lib/catalog';
import {brandOf} from '@/lib/shop-filters';
import {track} from '@/lib/analytics';
import {Chip,frameNo} from './analog/primitives';
import {useStore} from './store-context';
import {badgeOf,displayName,edgeLine,nameHasBrand,priceLabel,processChip,processLabel,stockLabel,groupLabel} from './commerce/product-meta';

export function ProductCard({product:p,index=0,eager=false,compact=false}:{product:Product;index?:number;eager?:boolean;compact?:boolean}){
 const {add}=useStore();
 const name=displayName(p);const href=`/p/${p.slug}`;const badge=badgeOf(p);const price=priceLabel(p);
 const brand=brandOf(p);const showBrand=!!brand&&!nameHasBrand(name,brand);
 const quick=p.inStock&&!p.isMaster&&!p.isPastEvent;
 const select=()=>track('select_item',{slug:p.slug,index});
 const spec=!!(p.format||p.process||p.iso);
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
   {showBrand&&<p className="pcard-brand mono">{brand}</p>}
   <h3 className="pcard-title"><Link href={href} onClick={select}>{name}</Link></h3>
   <p className="pcard-data mono">{p.format&&<span>{p.format}</span>}{p.process&&<Chip kind={processChip(p.process)}>{processLabel(p.process)}</Chip>}{p.iso&&<span>ISO {p.iso}</span>}{!spec&&<span>{groupLabel(p)}</span>}</p>
   <div className="pcard-foot">
    <span className="pcard-price num">{price.from&&<small>ab </small>}{formatPrice(price.amount)}</span>
    <span className={`status ${p.inStock?'status-ok':'status-ask'}`}>{stockLabel(p)}</span>
   </div>
  </div>
 </article>;
}
