import type {Metadata} from 'next';
import {StoreProvider} from '@/components/store-context';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {ShopOverlays} from '@/components/shop-overlays';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './globals.css';
import './photographic.css';
export const metadata:Metadata={title:{default:'bilderfürst Fürth — Analog Store & Film Lab',template:'%s · bilderfürst Fürth'},description:'Analoge Fotografie in Fürth. Filme, Kameras, Filmentwicklung im eigenen Labor, Scans und FineArt Prints in der Alexanderstraße 2.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="de"><body><StoreProvider><Header/><main id="main">{children}</main><Footer/><ShopOverlays/></StoreProvider></body></html>}
