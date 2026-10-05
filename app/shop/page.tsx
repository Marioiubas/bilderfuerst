import {CatalogShop} from '@/components/catalog-shop';
export const metadata={title:'Analog Store — Filme, Kameras & Labor',description:'Kodak, Ilford, CineStill und Fujifilm Filme in 35mm und 120, Sofortbildfilm, Fotochemie, Jobo-Equipment und Kameras aus dem Analog Store in Fürth.'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const initial=await searchParams;
 // Dynamic route (awaits searchParams): no Suspense fallback, so the catalog is in the first HTML
 // and nothing swaps in later (a streamed fallback caused a large layout shift).
 return <CatalogShop initial={initial}/>;
}
