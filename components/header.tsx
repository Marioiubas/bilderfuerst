"use client";
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Search,ShoppingBag,Menu,X,ChevronDown,ArrowUpRight} from 'lucide-react';
import {useStore} from './store-context';
import {Dialog} from './dialog';
import {BrandLogo} from './analog/primitives';
import {groupCount,shopGroupLabels,type ShopGroup} from '@/lib/catalog';
import {registerSweep,watchHeaderThreshold} from '@/motion/navigation';

export const NAV=[
 {label:'Shop',href:'/shop',code:'STR'},
 {label:'Filmentwicklung',href:'/filmentwicklung',code:'LAB'},
 {label:'Services',href:'/services',code:'STU'},
 {label:'Digitalisierung',href:'/digitalisierung',code:'SCN'},
 {label:'Street Gallery',href:'/galerie',code:'GAL'},
 {label:'Über uns',href:'/geschichte',code:'ARC'},
] as const;
/** Routes whose first screen is an immersive dark zone; the header joins that tone at the top. */
export const DARK_ROUTES=['/','/filmentwicklung','/lab','/digitalisierung','/galerie','/geschichte'];
const groups:ShopGroup[]=['Filme','Kameras','Sofortbild','Chemie','Equipment','Taschen','Bücher','Gutscheine'];
const finder=[
 ['35mm · Farbe','/shop?category=Filme&format=35mm&kind=Farbe'],
 ['35mm · Schwarzweiß','/shop?category=Filme&format=35mm&kind=Schwarzwei%C3%9F'],
 ['120 · Farbe','/shop?category=Filme&format=120&kind=Farbe'],
 ['120 · Schwarzweiß','/shop?category=Filme&format=120&kind=Schwarzwei%C3%9F'],
 ['Diafilm · E-6','/shop?category=Filme&kind=Dia'],
 ['Hohe Empfindlichkeit · ISO 800+','/shop?category=Filme&iso=800%2B'],
] as const;

export function Header(){
 const {lines,setCartOpen,setSearchOpen}=useStore();
 const path=usePathname();
 const [mobile,setMobile]=useState(false);const [mega,setMega]=useState(false);const [compact,setCompact]=useState(false);
 const scan=useRef<HTMLSpanElement>(null);const megaRef=useRef<HTMLDivElement>(null);
 const count=lines.reduce((a,l)=>a+l.quantity,0);
 const dark=DARK_ROUTES.includes(path)&&!compact;
 const isActive=(href:string)=>href==='/shop'?path.startsWith('/shop')||path.startsWith('/p/')||path.startsWith('/c/'):path===href||(href==='/geschichte'&&path==='/kontakt');

 useEffect(()=>watchHeaderThreshold(next=>{setCompact(next);if(next)registerSweep(scan.current)}),[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}if(e.key==='Escape')setMega(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[setSearchOpen]);
 useEffect(()=>{setMega(false);setMobile(false)},[path]);
 useEffect(()=>{if(!mega)return;const away=(e:PointerEvent)=>{if(!megaRef.current?.contains(e.target as Node))setMega(false)};document.addEventListener('pointerdown',away);return()=>document.removeEventListener('pointerdown',away)},[mega]);

 return <>
  <a className="skip-link" href="#main">Zum Inhalt springen</a>
  <div className="utility" role="region" aria-label="Ladeninformation und Vorschau-Hinweis">
   <span className="utility-addr">Alexanderstraße 2 · 90762 Fürth</span>
   <span className="review-flag"><i className="led"/>Demo / Owner Review · keine Bestellungen</span>
   <Link className="utility-extra" href="/kontakt">Mo–Fr 9:30–18:30 · Sa 9:30–16:30 <ArrowUpRight size={11}/></Link>
  </div>
  <header className={`site-header ${compact?'is-compact':''}`} data-tone={dark?'dark':'light'} ref={megaRef}>
   <Link href="/" className="wordmark" aria-label="Analog Store – Bilderfürst Fürth, Startseite"><BrandLogo/><span className="brand-lab" aria-hidden="true">Film Lab<br/>Fürth</span></Link>
   <nav className="primary-nav" aria-label="Hauptnavigation">
    <button className="nav-trigger" aria-expanded={mega} aria-controls="mega-shop" data-active={isActive('/shop')} onClick={()=>setMega(v=>!v)}>Shop <ChevronDown size={14} style={{transform:mega?'rotate(180deg)':undefined,transition:'transform .2s'}}/></button>
    {NAV.slice(1).map(n=><Link key={n.href} href={n.href} aria-current={isActive(n.href)?'page':undefined}>{n.label}</Link>)}
   </nav>
   <div className="header-tools">
    <button className="search-trigger" onClick={()=>setSearchOpen(true)} aria-label="Produkte suchen (Strg+K)"><Search size={17}/><span>Archiv durchsuchen</span><kbd>⌘K</kbd></button>
    <button className="icon-btn cart-trigger" onClick={()=>setCartOpen(true)} aria-label={`Vorschau-Warenkorb öffnen, ${count} Artikel`}><ShoppingBag size={20}/><span className="cart-count" data-empty={count===0}>{count}</span></button>
    <button className="icon-btn menu-trigger" onClick={()=>setMobile(true)} aria-label="Menü öffnen" aria-haspopup="dialog"><Menu size={22}/></button>
   </div>
   <span className="header-scan" ref={scan} aria-hidden="true"/>
   {mega&&<div className="mega" id="mega-shop">
    <div className="wrap mega-inner">
     <div className="mega-col"><p className="eyebrow"><b>STR</b> Sortiment</p>
      <Link className="mega-link" href="/shop" onClick={()=>setMega(false)}>Alle Produkte <span className="mono">↗</span></Link>
      {groups.map(g=><Link key={g} className="mega-link" href={`/shop?category=${encodeURIComponent(g)}`} onClick={()=>setMega(false)}>{shopGroupLabels[g]}<span className="mono num">{String(groupCount(g)).padStart(2,'0')}</span></Link>)}
     </div>
     <div className="mega-col"><p className="eyebrow"><b>FLM</b> Film finden</p>
      {finder.map(([label,href])=><Link key={href} className="mega-link" href={href} onClick={()=>setMega(false)}>{label}<span className="mono">→</span></Link>)}
     </div>
     <div className="mega-col"><p className="eyebrow"><b>LAB</b> Labor &amp; Service</p>
      <Link className="mega-link" href="/filmentwicklung" onClick={()=>setMega(false)}>Film entwickeln <span className="mono">C-41 · SW · E-6</span></Link>
      <Link className="mega-link" href="/p/negativ-scan-ganze-rollen" onClick={()=>setMega(false)}>Negative scannen <span className="mono">ab 5 €</span></Link>
      <Link className="mega-link" href="/digitalisierung" onClick={()=>setMega(false)}>Digitalisierung <span className="mono">Dia · Super8 · VHS</span></Link>
      <a className="mega-link" href="https://www.ebay.de/usr/bilderfuerstfuerth" target="_blank" rel="noopener noreferrer">Gebrauchte Kameras <span className="mono">eBay ↗</span></a>
     </div>
     <Link className="mega-feature" href="/p/kodak-portra-400-135-36-film" onClick={()=>setMega(false)}><Image src="/images/kodak-portra-400-135-36-film.webp" alt="Kodak Portra 400, 35mm, 36 Aufnahmen" width={240} height={240}/><span><span className="eyebrow">Meistgesucht</span><span className="h4" style={{display:'block',marginTop:8}}>Kodak Portra 400</span><span className="mono muted">35mm · C-41 · ISO 400</span></span></Link>
    </div>
   </div>}
  </header>
  <Dialog open={mobile} onClose={()=>setMobile(false)} label="Navigation" kind="full">
   <div className="mobile-nav">
    <div className="dialog-head"><Link href="/" className="wordmark" aria-label="Startseite" onClick={()=>setMobile(false)}><BrandLogo/></Link><button className="icon-btn" onClick={()=>setMobile(false)} aria-label="Menü schließen"><X/></button></div>
    <nav aria-label="Mobile Navigation">{[...NAV,{label:'Laden & Kontakt',href:'/kontakt',code:'FTH'}].map((n,i)=><Link key={n.href} href={n.href} data-stagger aria-current={isActive(n.href)?'page':undefined} onClick={()=>setMobile(false)}><span className="mono">{String(i+1).padStart(2,'0')} / {n.code}</span>{n.label}<ArrowUpRight size={20}/></Link>)}</nav>
    <div className="mobile-nav-foot"><span className="mono">Alexanderstraße 2 · 90762 Fürth</span><a href="tel:+49911774202">0911 774202</a><span>Mo–Fr 9:30–18:30 · Sa 9:30–16:30</span></div>
   </div>
  </Dialog>
 </>;
}
