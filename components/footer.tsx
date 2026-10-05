import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {ApertureMark} from './analog/primitives';
const legal=[['Impressum','contact'],['Datenschutz','privacy'],['Cookies','cookiepolicy'],['AGB','tac'],['Widerruf','withdrawal']];
export function Footer(){
 return <footer className="site-footer">
  <div className="wrap">
   <div className="footer-top">
    <p className="footer-claim">Bring deinen Film<br/><span>nach Fürth.</span></p>
    <div className="footer-visit">
     <Link href="/" className="wordmark" aria-label="Bilderfürst Fürth – Startseite"><ApertureMark/><span><span className="wordmark-name">bilderfürst</span><span className="wordmark-sub">Fürth · Analog Store &amp; Film Lab</span></span></Link>
     <address>Alexanderstraße 2<br/>90762 Fürth</address>
     <div style={{display:'flex',flexWrap:'wrap',gap:12}}><Link className="btn btn-light" href="/kontakt">Laden &amp; Drop-off <ArrowUpRight size={17} className="btn-arrow-up"/></Link><a className="btn btn-ghost" href="tel:+49911774202">0911 774202</a></div>
    </div>
   </div>
   <div className="footer-cols">
    <div><h2>Analog Store</h2><Link href="/shop?category=Filme">Filme 35mm &amp; 120</Link><Link href="/shop?category=Kameras">Kameras</Link><Link href="/shop?category=Sofortbild">Sofortbild</Link><Link href="/shop?category=Chemie">Chemie &amp; Labor-Equipment</Link><Link href="/shop?category=Gutscheine">Gutscheine</Link><a href="https://www.ebay.de/usr/bilderfuerstfuerth" target="_blank" rel="noopener noreferrer">Analoge Schätze auf eBay ↗</a></div>
    <div><h2>Labor &amp; Studio</h2><Link href="/filmentwicklung">Film entwickeln</Link><Link href="/lab">Unser Labor</Link><Link href="/digitalisierung">Digitalisierung</Link><Link href="/services">Pass- &amp; Bewerbungsbilder</Link><Link href="/i/fineart-prints">FineArt Prints</Link></div>
    <div><h2>Bilderfürst</h2><Link href="/galerie">Street Gallery</Link><Link href="/geschichte">Geschichte seit 1935</Link><Link href="/kontakt">Laden, Kontakt &amp; Drop-off</Link><a href="https://www.instagram.com/bilderfuerstfuerth/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div>
    <div><h2>Öffnungszeiten</h2><span>Mo–Fr 09:30–18:30</span><span>Sa 09:30–16:30</span><a href="mailto:info@analog-store.de">info@analog-store.de</a></div>
   </div>
   <div className="footer-bottom"><span>© 2026 bilderfürst Fürth</span><nav aria-label="Rechtliches">{legal.map(([l,s])=><Link key={s} href={`/l/${s}`}>{l}</Link>)}</nav><span>Vorschau zur Inhaberprüfung · keine Bestellungen · noindex</span></div>
  </div>
 </footer>;
}
