"use client";
import Link from 'next/link';
import {Plus,ArrowUpRight} from 'lucide-react';
import {type Product,formatPrice} from '@/lib/catalog';
import {useStore} from './store-context';
export function ProductCard({product:p,index=0}:{product:Product;index?:number}){
 const {add}=useStore();
 return <article className="product-card"><div className="product-stage"><span className="product-index">0{index+1}</span><Link href={`/p/${p.slug}`} aria-label={p.name}><img src={p.images[0]} alt={p.name} width={420} height={420} loading="lazy"/></Link>{p.inStock&&!p.isMaster?<button className="quick-add" aria-label={`${p.name} in den Vorschau-Warenkorb`} onClick={()=>add(p.slug)}><Plus size={18}/></button>:<Link className="quick-add" href={`/p/${p.slug}`} aria-label={`${p.name} Details`}><ArrowUpRight size={18}/></Link>}</div><div className="product-meta"><span>{p.brand||p.category}</span><span className={p.inStock?'stock-dot':'stock-dot unavailable'}>{p.inStock?'Auf Lager':'Anfragen'}</span></div><Link href={`/p/${p.slug}`} className="product-title">{p.name}</Link><div className="product-bottom"><span>{[p.format,p.process].filter(Boolean).join(' / ')||p.category}</span><strong>{p.isMaster?'ab ':''}{formatPrice(p.price)}</strong></div></article>
}
