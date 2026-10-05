// Compact shop header: display title, count, category line, one real montage band.
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

export function ShopHead({count}:{count:number}){
 return <header className="shop-head">
  <div className="wrap shop-head-grid">
   <div className="shop-head-copy">
    <p className="eyebrow"><b>STR</b><span>Analog Store · Alexanderstraße 2 · Fürth</span></p>
    <h1 className="shop-title">Analog Store</h1>
    <p className="shop-count mono"><span className="num">{count}</span> Produkte <span aria-hidden="true">·</span> <span>Quellstand 04.10.2026</span></p>
    <p className="shop-cats">Filme · Kameras · Sofortbild · Chemie · Labor-Equipment · Taschen · Bücher · Gutscheine</p>
    <Link className="shop-lab-link link" href="/filmentwicklung">Belichteten Film entwickeln lassen <ArrowRight size={15} aria-hidden="true"/></Link>
   </div>
   <figure className="shop-montage">
    <img src="/images/film-shelf-l.webp" alt="Filmpackungen im Regal des Analog Store: Kodak Portra, Ektar, Tri-X, UltraMax, ColorPlus, CineStill und Ilford" width={1600} height={1067} loading="eager" decoding="async" fetchPriority="high"/>
    <figcaption className="mono">Filmregal im Laden · Fürth</figcaption>
   </figure>
  </div>
 </header>;
}
