"use client";
// PDP: large visual stage (left) + buy box and spec ledger (right). Facts from lib/catalog.json only.
import Link from 'next/link';
import {useEffect,useId,useMemo,useState} from 'react';
import {ArrowUpRight,Plus,Minus,ArrowRight} from 'lucide-react';
import {type Product,bySlug,formatPrice,shopGroup} from '@/lib/catalog';
import {brandOf,fromPrice} from '@/lib/shop-filters';
import {track} from '@/lib/analytics';
import {Chip} from './analog/primitives';
import {useStore} from './store-context';
import {PdpGallery} from './commerce/pdp-gallery';
import {DeveloperStrip} from './commerce/developer-strip';
import {DevelopBridge,PdpRelated} from './commerce/pdp-sections';
import {deliveryText,displayName,groupLabel,labTicket,processChip,processLabel,stockLabel} from './commerce/product-meta';

const TRI_X=new Set(['kodak-tri-x-400-135-36-film','kodak-tri-x-400-120-rollfilm']);
const HARDWARE=new Set(['Kameras','Equipment','Taschen']);

export function ProductDetail({product:p}:{product:Product}){
 const {add}=useStore();const vid=useId();
 const [variant,setVariant]=useState('');const [qty,setQty]=useState(1);
 const group=shopGroup(p);const name=displayName(p);
 const master=p.masterSlug?bySlug(p.masterSlug):undefined;
 const variants=useMemo(()=>p.isMaster?p.variants.map(v=>bySlug(v.slug)).filter((x):x is Product=>!!x):[],[p]);
 const selected=variant?bySlug(variant):p.isMaster?undefined:p;
 const ticket=labTicket(selected??p);
 const isLab=group==='Entwicklung'||!!ticket;
 const price=selected?selected.price:fromPrice(p);
 const canAdd=!!selected&&selected.inStock&&!selected.isMaster&&!p.isPastEvent;
 useEffect(()=>{track('view_item',{slug:p.slug,group})},[p.slug,group]);

 const grouped=useMemo(()=>{const m=new Map<string,Product[]>();for(const v of variants){const k=labTicket(v)?.process??'Optionen';m.set(k,[...(m.get(k)??[]),v])}return [...m]},[variants]);
 const ledger:Array<[string,React.ReactNode]>=[
  ['Format',p.format?(p.format==='35mm'?'35mm Kleinbild':p.format==='120'?'120 Mittelformat':p.format):ticket?.format??''],
  ['Typ',p.filmKind||''],
  ['Prozess',p.process?<Chip kind={processChip(p.process)}>{p.process}</Chip>:ticket?.process??''],
  ['ISO',p.iso],
  ['Kategorie',groupLabel(p)],
  ['Marke',brandOf(p)],
  ['Optionen',p.isMaster?`${variants.length} Varianten`:''],
  ['Lieferzeit',deliveryText(p).replace('Lieferzeit laut Originalshop: ','')],
  ['Artikel-ID',<span key="id" className="mono pdp-id">{p.id}</span>],
 ];
 const configHref=ticket?`/filmentwicklung?format=${ticket.formatParam}${ticket.processParam?`&process=${encodeURIComponent(ticket.processParam)}`:''}`:p.slug==='filmentwicklung-kleinbild'?'/filmentwicklung?format=35mm':p.slug==='filmentwicklung-mittelformat'?'/filmentwicklung?format=120':p.slug==='filmentwicklung-pocket-110'?'/filmentwicklung?format=110':'';

 return <div className="pdp zone-light">
  <nav className="wrap breadcrumbs" aria-label="Brotkrumen"><Link href="/shop">Analog Store</Link><span aria-hidden="true">/</span><Link href={`/shop?category=${encodeURIComponent(group)}`}>{groupLabel(p)}</Link>{master&&<><span aria-hidden="true">/</span><Link href={`/p/${master.slug}`}>{displayName(master)}</Link></>}<span aria-hidden="true">/</span><span aria-current="page">{p.optionLabel||name}</span></nav>
  <div className="wrap pdp-grid">
   <PdpGallery images={p.images} name={name} lens={HARDWARE.has(group)}/>
   <div className="pdp-buy">
    <p className="pdp-kicker mono">{[brandOf(p)||groupLabel(p),p.format,p.iso?`ISO ${p.iso}`:''].filter(Boolean).join(' · ')}{p.process&&<Chip kind={processChip(p.process)}>{processLabel(p.process)}</Chip>}</p>
    <h1 className="pdp-title">{name}</h1>
    <p className="pdp-price num">{!selected&&p.isMaster&&<small>ab </small>}{formatPrice(price)}</p>
    <p className="pdp-price-note mono">inkl. MwSt., zzgl. Versand · Quellstand 04.10.2026</p>
    <p className="pdp-stock"><span className={`status ${(selected??p).inStock?'status-ok':'status-ask'}`}>{p.isPastEvent?'Veranstaltung vorbei':stockLabel(selected??p)}</span>{deliveryText(p)&&<span className="faint">{deliveryText(p)}</span>}</p>

    {p.isMaster&&<div className="field pdp-variant"><label htmlFor={vid}>{group==='Entwicklung'?'Entwicklung & Scan wählen':'Option wählen'}</label>
     <select id={vid} className="select" value={variant} onChange={e=>setVariant(e.target.value)}>
      <option value="">Bitte wählen · ab {formatPrice(fromPrice(p))}</option>
      {grouped.map(([label,list])=><optgroup key={label} label={label}>{list.map(v=><option key={v.slug} value={v.slug} disabled={!v.inStock}>{v.optionLabel} — {formatPrice(v.price)}</option>)}</optgroup>)}
     </select></div>}
    {ticket&&selected&&<dl className="pdp-ticket"><div><dt className="mono">Format</dt><dd>{ticket.format}</dd></div><div><dt className="mono">Prozess</dt><dd>{ticket.process}</dd></div><div><dt className="mono">Scan</dt><dd>{ticket.scan}</dd></div></dl>}

    <div className="pdp-actions">
     <div className="stepper" role="group" aria-label="Menge">
      <button type="button" aria-label="Menge verringern" disabled={qty<=1||!canAdd} onClick={()=>setQty(q=>Math.max(1,q-1))}><Minus size={14}/></button>
      <output aria-live="polite" className="num">{qty}</output>
      <button type="button" aria-label="Menge erhöhen" disabled={qty>=99||!canAdd} onClick={()=>setQty(q=>Math.min(99,q+1))}><Plus size={14}/></button>
     </div>
     <button type="button" className="btn btn-primary pdp-cta" disabled={!canAdd} onClick={()=>{if(!selected)return;add(selected.slug,qty);track('add_to_cart',{slug:selected.slug,quantity:qty,source:'pdp'})}}>
      {p.isPastEvent?'Veranstaltungsarchiv':p.isMaster&&!selected?'Erst Option wählen':canAdd?'In den Vorschau-Warenkorb':'Derzeit nicht bestellbar'}<Plus size={17} aria-hidden="true"/>
     </button>
    </div>
    {!p.inStock&&!p.isPastEvent&&<p className="pdp-ask">Lieferzeit im Laden erfragen: <a className="link" href="tel:+49911774202">0911 774202</a></p>}
    <a className="btn btn-ghost pdp-source" href={(selected??p).source} target="_blank" rel="noopener noreferrer">Im bestehenden Shop kaufen <ArrowUpRight size={16} className="btn-arrow-up" aria-hidden="true"/></a>
    {isLab&&configHref&&<Link className="link pdp-config" href={configHref}>Im Filmentwicklungs-Konfigurator planen <ArrowRight size={14} aria-hidden="true"/></Link>}
    <p className="pdp-review"><span className="led" aria-hidden="true"/>Vorschau · Es wird keine Bestellung ausgelöst. Bestellung und Zahlung nur im bestehenden Shop.</p>

    <dl className="ledger" aria-label="Technische Daten">
     {ledger.filter(([,v])=>v!==''&&v!=null).map(([k,v])=><div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}
    </dl>
   </div>
  </div>

  <section className="wrap pdp-desc" aria-labelledby="pdp-desc-h">
   <p className="eyebrow"><b>TXT</b><span>Beschreibung · Quelltext des bestehenden Shops</span></p>
   <h2 id="pdp-desc-h" className="sr-only">Beschreibung</h2>
   <p className="pdp-desc-text">{(selected??p).description||p.description}</p>
  </section>

  {(group==='Filme'||p.slug==='pentax-17')&&<div className="wrap"><DevelopBridge product={p}/></div>}
  {TRI_X.has(p.slug)&&<DeveloperStrip/>}
  <PdpRelated product={p}/>
 </div>;
}
