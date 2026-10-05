"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState,useEffect} from 'react';
import {Aperture,Search,ShoppingBag,Menu,X,ArrowUpRight,ChevronDown} from 'lucide-react';
import {useStore} from './store-context';
import {Dialog} from './dialog';
const links=[['Filmentwicklung','/filmentwicklung'],['Services','/services'],['Street Gallery','/galerie'],['Über uns','/geschichte']];
export function Header(){
 const {lines,setCartOpen,setSearchOpen}=useStore();const [mobile,setMobile]=useState(false);const [menu,setMenu]=useState(false);const path=usePathname();const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{const change=()=>setScrolled(window.scrollY>42);change();window.addEventListener('scroll',change,{passive:true});return()=>window.removeEventListener('scroll',change)},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[setSearchOpen]);
 return <><a className="skip-link" href="#main">Zum Inhalt</a><div className="utility"><span>Alexanderstraße 2 · Fürth <span className="utility-extra">/ Fotografie seit 1973</span></span><span className="review-label"><i/> DEMO / OWNER REVIEW</span><Link className="utility-extra" href="/kontakt">Besuch uns im Analog Store <ArrowUpRight size={12}/></Link></div>
 <header className={`site-header ${scrolled?'scrolled':''} ${path==='/'||path==='/digitalisierung'||path==='/galerie'?'dark-header':''}`}><Link href="/" className="wordmark" aria-label="Bilderfürst Fürth Startseite"><Aperture size={34} strokeWidth={1.4}/><span>bilderfürst<small>FÜRTH · ANALOG STORE & FILM LAB</small></span></Link>
 <nav className="desktop-nav" aria-label="Hauptnavigation"><div className="shop-menu"><Link href="/shop" className={path.startsWith('/shop')?'active':''}>Shop</Link><button aria-label="Shop-Kategorien" aria-expanded={menu} onClick={()=>setMenu(!menu)}><ChevronDown size={13}/></button>{menu&&<div className="mega-menu"><span className="eyebrow">DER ANALOG STORE</span>{[['Alle Produkte','Alle'],['Filme','Filme'],['Kameras','Kameras'],['Chemie & Equipment','Labor'],['Sofortbild','Sofortbild'],['Bücher & Zines','Bücher']].map(([label,cat])=><Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} onClick={()=>setMenu(false)}>{label}<ArrowUpRight size={16}/></Link>)}</div>}</div>{links.map(([label,url])=><Link key={url} href={url} className={path===url?'active':''}>{label}</Link>)}</nav>
 <div className="header-tools"><button aria-label="Produkte suchen" onClick={()=>setSearchOpen(true)}><Search size={21}/></button><button className="cart-button" aria-label={`Warenkorb öffnen, ${lines.reduce((a,l)=>a+l.quantity,0)} Artikel`} onClick={()=>setCartOpen(true)}><ShoppingBag size={21}/><span>{lines.reduce((a,l)=>a+l.quantity,0)}</span></button><button className="mobile-menu-button" aria-label="Menü öffnen" onClick={()=>setMobile(true)}><Menu size={23}/></button></div></header>
 <Dialog open={mobile} onClose={()=>setMobile(false)} label="Navigation" className="mobile-nav-dialog"><div className="dialog-heading"><span className="wordmark">bilderfürst</span><button onClick={()=>setMobile(false)} aria-label="Menü schließen"><X/></button></div>{[['Shop','/shop'],...links,['Ladengeschäft','/kontakt']].map(([label,url])=><Link key={url} href={url} onClick={()=>setMobile(false)}>{label}<ArrowUpRight/></Link>)}</Dialog></>
}
