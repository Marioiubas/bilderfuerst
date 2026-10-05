"use client";
// /cart + /checkout: calm, static review. DEMO / OWNER REVIEW — no personal or payment data,
// no order is placed, never a fake success. Ordering happens in the existing shop.
import Link from 'next/link';
import {ArrowUpRight,LockKeyhole,ArrowRight} from 'lucide-react';
import {formatPrice} from '@/lib/catalog';
import {useStore} from './store-context';
import {DevelopBridgeRow,LabTicketLine,StoreLine,useCartLines} from './commerce/cart-lines';

const steps=[['01','Auswahl prüfen','Hier, in der Vorschau'],['02','Kontakt & Lieferung','Nur im bestehenden Shop'],['03','Zahlung','Nur im bestehenden Shop']] as const;

export function Checkout({mode='checkout'}:{mode?:'cart'|'checkout'}){
 const {setCartOpen}=useStore();
 const {store,lab,subtotal,count,films}=useCartLines();
 return <div className="checkout zone-light">
  <div className="wrap">
   <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/shop">Analog Store</Link><span aria-hidden="true">/</span><span aria-current="page">{mode==='cart'?'Warenkorb':'Auswahl prüfen'}</span></nav>
   <header className="checkout-head">
    <p className="eyebrow"><b>DEMO</b><span>Owner Review · keine Bestellung</span></p>
    <h1>{mode==='cart'?'Warenkorb':'Auswahl prüfen'}</h1>
    <p className="checkout-notice"><LockKeyhole size={16} aria-hidden="true"/><span>Diese Vorschau löst keine Bestellung aus und erfasst keine persönlichen Daten oder Zahlungsdaten. Bestellen und bezahlen kannst du ausschließlich im bestehenden Shop auf photostudio.de.</span></p>
    <ol className="checkout-steps" aria-label="Ablauf">{steps.map(([n,t,s],i)=><li key={n} data-current={i===0}><span className="mono num">{n}</span><strong>{t}</strong><span className="faint">{s}</span></li>)}</ol>
   </header>

   <div className="checkout-grid">
    <div className="checkout-lines">
     {count===0?<div className="checkout-empty"><p className="mono faint">00 Artikel</p><h2>Dein Vorschau-Warenkorb ist leer.</h2><div className="cart-empty-actions"><Link className="btn btn-ink btn-sm" href="/shop">Zum Analog Store <ArrowRight size={15} aria-hidden="true"/></Link><Link className="btn btn-ghost btn-sm" href="/filmentwicklung">Film entwickeln</Link></div></div>:<>
      {store.length>0&&<section aria-labelledby="co-store-h" className="cart-group"><h2 id="co-store-h" className="cart-group-head mono"><span>Analog Store</span><span className="num">{store.length}</span></h2><ul>{store.map(l=><StoreLine key={l.slug} line={l} readOnly/>)}</ul></section>}
      {lab.length===0&&<DevelopBridgeRow films={films}/>}
      {lab.length>0&&<section aria-labelledby="co-lab-h" className="cart-group"><h2 id="co-lab-h" className="cart-group-head mono"><span>Laborauftrag</span><span className="num">{lab.length}</span></h2><ul>{lab.map(l=><LabTicketLine key={l.slug} line={l} readOnly/>)}</ul>
       <p className="checkout-lab-note">Film im Laden in Fürth abgeben oder einschicken: <Link className="link" href="/kontakt">Abgabestellen &amp; Kontakt</Link></p></section>}
      <button type="button" className="link checkout-edit" onClick={()=>setCartOpen(true)}>Mengen im Warenkorb bearbeiten</button>
     </>}
    </div>

    <aside className="checkout-summary" aria-label="Zusammenfassung">
     <div className="cart-total"><span>Zwischensumme</span><strong className="num">{formatPrice(subtotal)}</strong></div>
     <p className="mono faint">inkl. MwSt., zzgl. Versand · Quellstand 04.10.2026</p>
     <dl className="checkout-ship">
      <dt className="mono">Versand laut AGB des bestehenden Shops</dt>
      <dd>Deutschland (UPS): 6,00 € unter 150 €, ab 150 € versandkostenfrei · DHL Packstation 8,00 € · Abholung in Fürth kostenlos</dd>
     </dl>
     <button type="button" className="btn btn-ghost btn-block" disabled><LockKeyhole size={16} aria-hidden="true"/>Zahlung in der Vorschau deaktiviert</button>
     <a className="btn btn-primary btn-block" href="https://www.photostudio.de/c/shop" target="_blank" rel="noopener noreferrer">Im bestehenden Shop bestellen <ArrowUpRight size={16} className="btn-arrow-up" aria-hidden="true"/></a>
     <p className="checkout-fine">Deine Auswahl wird nicht automatisch übertragen. Jede Zeile hat einen Link „Im Originalshop kaufen“ zum identischen Artikel. Fragen: <a className="link" href="tel:+49911774202">0911 774202</a></p>
    </aside>
   </div>
  </div>
 </div>;
}
