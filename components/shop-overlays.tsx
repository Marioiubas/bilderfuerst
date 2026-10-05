"use client";
// Global commerce overlays: ⌘K archive index + cart drawer (both native <dialog> via Dialog).
import Link from 'next/link';
import {X,ArrowRight} from 'lucide-react';
import {Dialog} from './dialog';
import {useStore} from './store-context';
import {formatPrice} from '@/lib/catalog';
import {SearchIndex} from './commerce/search-index';
import {DevelopBridgeRow,LabTicketLine,StoreLine,useCartLines} from './commerce/cart-lines';

function CartDrawer(){
 const {cartOpen,setCartOpen}=useStore();
 const {store,lab,subtotal,count,films}=useCartLines();
 const close=()=>setCartOpen(false);
 return <Dialog open={cartOpen} onClose={close} label="Vorschau-Warenkorb" kind="drawer" className="cart-drawer">
  <div className="cart-shell">
   <div className="dialog-head cart-head"><p><span className="mono"><b>CRT</b> Warenkorb · Vorschau</span><span className="cart-head-count num">{count} {count===1?'Artikel':'Artikel'}</span></p><button type="button" className="icon-btn" onClick={close} aria-label="Warenkorb schließen"><X size={20}/></button></div>
   <p className="cart-review"><span className="led" aria-hidden="true"/>Vorschau · Es wird keine Bestellung ausgelöst</p>
   {count===0?<div className="cart-empty">
     <p className="mono faint">00 Artikel</p>
     <h2>Noch kein Film im Warenkorb.</h2>
     <p className="muted">Die Auswahl bleibt nur in diesem Browser gespeichert und dient der Owner-Review.</p>
     <div className="cart-empty-actions"><Link className="btn btn-ink btn-sm" href="/shop?category=Filme" onClick={close}>Filme ansehen <ArrowRight size={15} aria-hidden="true"/></Link><Link className="btn btn-ghost btn-sm" href="/filmentwicklung" onClick={close}>Film entwickeln</Link></div>
    </div>
   :<div className="cart-scroll">
     {store.length>0&&<section aria-labelledby="cart-store-h" className="cart-group"><h2 id="cart-store-h" className="cart-group-head mono"><span>Analog Store</span><span className="num">{store.length}</span></h2><ul>{store.map(l=><StoreLine key={l.slug} line={l} onNavigate={close}/>)}</ul></section>}
     {lab.length===0&&<DevelopBridgeRow films={films} onNavigate={close}/>}
     {lab.length>0&&<section aria-labelledby="cart-lab-h" className="cart-group"><h2 id="cart-lab-h" className="cart-group-head mono"><span>Laborauftrag</span><span className="num">{lab.length}</span></h2><ul>{lab.map(l=><LabTicketLine key={l.slug} line={l} onNavigate={close}/>)}</ul></section>}
    </div>}
   {count>0&&<div className="cart-summary">
    <div className="cart-total"><span>Zwischensumme</span><strong className="num">{formatPrice(subtotal)}</strong></div>
    <p className="mono faint">inkl. MwSt., zzgl. Versand · Preise &amp; Verfügbarkeit: Quellstand 04.10.2026</p>
    <Link className="btn btn-primary btn-block" href="/checkout" onClick={close}>Auswahl prüfen <ArrowRight size={16} aria-hidden="true"/></Link>
    <button type="button" className="btn btn-ghost btn-block btn-sm" onClick={close}>Weiter stöbern</button>
   </div>}
  </div>
 </Dialog>;
}

export function ShopOverlays(){
 return <><CartDrawer/><SearchIndex/></>;
}
