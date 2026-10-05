import type {Metadata,Viewport} from 'next';
import {StoreProvider} from '@/components/store-context';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {ShopOverlays} from '@/components/shop-overlays';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/home.css';
import './styles/commerce.css';
import './styles/lab.css';
import './styles/digitization.css';
import './styles/gallery.css';
import './styles/story.css';
export const metadata:Metadata={
 title:{default:'bilderfürst Fürth — Analog Store & Film Lab',template:'%s · bilderfürst Fürth'},
 description:'Analoge Fotografie in Fürth: Filme, Kameras, Filmentwicklung im eigenen Labor (C-41, Schwarzweiß, E-6), Noritsu-Scans, Digitalisierung und FineArt Prints. Alexanderstraße 2.',
 // Owner-review preview: must stay out of search engines until explicitly authorised.
 robots:{index:false,follow:false,googleBot:{index:false,follow:false}},
};
export const viewport:Viewport={themeColor:'#0a0b0c',colorScheme:'light'};
export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="de"><body><StoreProvider><Header/><main id="main">{children}</main><Footer/><ShopOverlays/></StoreProvider></body></html>;
}
