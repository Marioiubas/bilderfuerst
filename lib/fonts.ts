// Route-level font preloads. Instrument Serif is preloaded only where it sets an above-the-fold headline (home hero,
// Galerie, Geschichte, Kontakt); elsewhere it loads on demand (font-display: swap), so it never competes with a
// route's LCP image (shop/film regressed when it was preloaded globally, 2026-10-07).
import {preload} from 'react-dom';
export function preloadSerif(){
 preload('/fonts/instrument-serif-latin-400-normal.woff2',{as:'font',type:'font/woff2',crossOrigin:'anonymous'});
 preload('/fonts/instrument-serif-latin-400-italic.woff2',{as:'font',type:'font/woff2',crossOrigin:'anonymous'});
}
