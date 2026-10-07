import type {Metadata,Viewport} from 'next';
import {preload} from 'react-dom';
import {StoreProvider} from '@/components/store-context';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {ShopOverlays} from '@/components/shop-overlays';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
// Area stylesheets load with their routes; commerce stays global for the search/cart overlays.
import './styles/commerce.css';
export const metadata:Metadata={
 title:{default:'bilderfürst Fürth — Analog Store & Film Lab',template:'%s · bilderfürst Fürth'},
 description:'Analoge Fotografie in Fürth: Filme, Kameras, Filmentwicklung im eigenen Labor (C-41, Schwarzweiß, E-6), Noritsu-Scans, Digitalisierung und FineArt Prints. Alexanderstraße 2.',
 // Owner-review preview: must stay out of search engines until explicitly authorised.
 robots:{index:false,follow:false,googleBot:{index:false,follow:false}},
};
export const viewport:Viewport={themeColor:'#0a0b0c',colorScheme:'light'};
export default function Layout({children}:{children:React.ReactNode}){
 // The display face carries the LCP headline on most routes: fetch it with the document.
 preload('/fonts/archivo-latin-wdth-normal.woff2',{as:'font',type:'font/woff2',crossOrigin:'anonymous'});
 return <html lang="de"><body><StoreProvider><Header/><main id="main">{children}</main><Footer/><ShopOverlays/></StoreProvider></body></html>;
}
