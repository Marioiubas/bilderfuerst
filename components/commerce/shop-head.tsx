// Compact shop header (audit H1): one title row (title + live result count), a short meta line and the
// real film-shelf photo as a band (desktop) or a thin strip (phones). Products start right below.
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

export function ShopHead({count,noun}:{count:number;noun:string}){
 return <header className="shop-head">
  <div className="wrap shop-head-grid">
   <div className="shop-head-copy">
    <p className="eyebrow shop-eyebrow"><b>STR</b><span>Analog Store · Alexanderstraße 2 · Fürth</span></p>
    <div className="shop-title-row">
     <h1 className="shop-title">Analog Store</h1>
     <p className="shop-count mono" role="status"><span className="num">{count}</span> {noun}</p>
    </div>
    <p className="shop-meta"><span className="mono">Quellstand 04.10.2026</span><Link className="shop-lab-link link" href="/filmentwicklung">Belichteten Film entwickeln lassen <ArrowRight size={15} aria-hidden="true"/></Link></p>
   </div>
   <figure className="shop-montage">
    <img src="/images/film-shelf-l.webp" srcSet="/images/film-shelf.webp 600w, /images/film-shelf-m.webp 900w, /images/film-shelf-l.webp 1600w" sizes="(max-width: 767px) calc(100vw - 32px), 46vw" alt="Filmpackungen im Regal des Analog Store: Kodak Portra, Ektar, Tri-X, UltraMax, ColorPlus, CineStill und Ilford" width={1600} height={1067} loading="eager" decoding="async" fetchPriority="high"/>
    <figcaption className="mono">Filmregal im Laden · Fürth</figcaption>
   </figure>
  </div>
 </header>;
}
