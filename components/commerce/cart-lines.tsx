"use client";
// Cart line rendering shared by the drawer and /cart · /checkout.
// Store lines vs. lab orders (filmentwicklung-* / negativ-scan-* variants as envelope tickets).
import Link from 'next/link';
import {Minus,Plus,X,ArrowUpRight,ArrowRight} from 'lucide-react';
import {bySlug,formatPrice,shopGroup,type Product} from '@/lib/catalog';
import {useStore} from '@/components/store-context';
import {brandLabel,developFrom,displayName,edgeLine,isLabSlug,labTicket} from './product-meta';

export type Line={slug:string;quantity:number;product:Product};
export function useCartLines(){
 const {lines,update}=useStore();
 const all=lines.map(l=>({...l,product:bySlug(l.slug)})).filter((l):l is Line=>!!l.product);
 const store=all.filter(l=>!isLabSlug(l.slug));const lab=all.filter(l=>isLabSlug(l.slug));
 const subtotal=all.reduce((s,l)=>s+l.product.price*l.quantity,0);
 const count=all.reduce((s,l)=>s+l.quantity,0);
 const films=store.filter(l=>shopGroup(l.product)==='Filme');
 return {all,store,lab,subtotal,count,films,update};
}

function Stepper({line,onChange,readOnly}:{line:Line;onChange:(q:number)=>void;readOnly?:boolean}){
 const name=displayName(line.product);
 if(readOnly)return <span className="mono num cart-qty-ro">{line.quantity} ×</span>;
 return <div className="stepper stepper-sm" role="group" aria-label={`Menge ${name}`}>
  <button type="button" aria-label={`${name}: Menge verringern`} onClick={()=>onChange(line.quantity-1)}><Minus size={12}/></button>
  <output className="num" aria-live="polite">{line.quantity}</output>
  <button type="button" aria-label={`${name}: Menge erhöhen`} disabled={line.quantity>=99} onClick={()=>onChange(line.quantity+1)}><Plus size={12}/></button>
 </div>;
}

export function StoreLine({line,onNavigate,readOnly}:{line:Line;onNavigate?:()=>void;readOnly?:boolean}){
 const {update}=useStore();const p=line.product;const name=displayName(p);
 return <li className="cart-line">
  <Link href={`/p/${p.slug}`} className="cart-thumb" onClick={onNavigate} tabIndex={-1} aria-hidden="true"><img src={p.images[0]} alt="" width={84} height={84} loading="lazy" decoding="async"/></Link>
  <div className="cart-line-main">
   <p className="mono cart-line-brand">{brandLabel(p)}</p>
   <Link href={`/p/${p.slug}`} className="cart-line-name" onClick={onNavigate}>{name}</Link>
   {edgeLine(p)&&<p className="mono cart-line-edge">{edgeLine(p)}</p>}
   <div className="cart-line-row"><Stepper line={line} onChange={q=>update(p.slug,q)} readOnly={readOnly}/><span className="mono faint num">à {formatPrice(p.price)}</span></div>
   <a className="cart-source" href={p.source} target="_blank" rel="noopener noreferrer">Im Originalshop kaufen <ArrowUpRight size={12} aria-hidden="true"/></a>
  </div>
  <div className="cart-line-side"><strong className="num">{formatPrice(p.price*line.quantity)}</strong>{!readOnly&&<button type="button" className="icon-btn cart-remove" aria-label={`${name} entfernen`} onClick={()=>update(p.slug,0)}><X size={15}/></button>}</div>
 </li>;
}

export function LabTicketLine({line,onNavigate,readOnly}:{line:Line;onNavigate?:()=>void;readOnly?:boolean}){
 const {update}=useStore();const p=line.product;const t=labTicket(p);const master=p.masterSlug?bySlug(p.masterSlug):undefined;
 const edit=t?`/filmentwicklung?format=${t.formatParam}${t.processParam?`&process=${encodeURIComponent(t.processParam)}`:''}`:`/p/${p.slug}`;
 return <li className="lab-ticket">
  <div className="lab-ticket-head"><span className="mono"><b>LAB</b> {t?.title??'Laborauftrag'}</span><strong className="num">{formatPrice(p.price*line.quantity)}</strong></div>
  <dl className="lab-ticket-spec">
   <div><dt className="mono">Format</dt><dd>{t?.format??displayName(master??p)}</dd></div>
   <div><dt className="mono">Prozess</dt><dd>{t?.process??'–'}</dd></div>
   <div><dt className="mono">Scan</dt><dd>{t?.scan??'–'}</dd></div>
   <div><dt className="mono">Menge</dt><dd>{readOnly?<span className="num">{line.quantity} {line.quantity===1?'Film':'Filme'}</span>:<Stepper line={line} onChange={q=>update(p.slug,q)}/>}</dd></div>
  </dl>
  <div className="lab-ticket-foot">
   <span className="mono faint num">à {formatPrice(p.price)}</span>
   {!readOnly&&<Link className="cart-source" href={edit} onClick={onNavigate}>Bearbeiten <ArrowRight size={12} aria-hidden="true"/></Link>}
   <a className="cart-source" href={p.source} target="_blank" rel="noopener noreferrer">Im Originalshop kaufen <ArrowUpRight size={12} aria-hidden="true"/></a>
   {!readOnly&&<button type="button" className="icon-btn cart-remove" aria-label={`${t?.title??'Laborauftrag'} ${t?.process??''} entfernen`} onClick={()=>update(p.slug,0)}><X size={15}/></button>}
  </div>
 </li>;
}

export function DevelopBridgeRow({films,onNavigate}:{films:Line[];onNavigate?:()=>void}){
 if(!films.length)return null;
 const formats=new Set(films.map(f=>f.product.format).filter(Boolean));
 const href=formats.size===1?`/filmentwicklung?format=${[...formats][0]}`:'/filmentwicklung';
 return <Link className="cart-bridge" href={href} onClick={onNavigate}>
  <span className="mono"><b>LAB</b> Hauseigenes Labor</span>
  <strong>Filme im Warenkorb – Entwicklung gleich mitplanen?</strong>
  <span className="muted">C-41 · Schwarzweiß · E-6 · ab {formatPrice(developFrom('35mm','C-41')??7)}</span>
  <ArrowRight size={16} aria-hidden="true"/>
 </Link>;
}
