import {Suspense} from 'react';
import {redirect} from 'next/navigation';
import {CatalogShop} from '@/components/catalog-shop';
import type {Filters} from '@/lib/shop-filters';
export const metadata={title:'Analog Store — Kategorie'};
/** Legacy ePages category URLs (/c/shop/…) resolve to the matching shop filter. */
const legacy:Array<[RegExp,Partial<Filters>]>=[
 [/kleinbildfilme-135/,{category:'Filme',format:'35mm'}],[/rollfilme-120/,{category:'Filme',format:'120'}],[/filme$/,{category:'Filme'}],
 [/cameras/,{category:'Kameras'}],[/instax|polaroid/,{category:'Sofortbild'}],[/buecher/,{category:'Bücher'}],[/fotochemie/,{category:'Chemie'}],
 [/equipment/,{category:'Equipment'}],[/billingham|taschen/,{category:'Taschen'}],[/gutschein/,{category:'Gutscheine'}],
];
export default async function Page({params,searchParams}:{params:Promise<{slug:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params;const value=slug.join('/');
 if(value.includes('filmentwicklungen'))redirect('/filmentwicklung');
 const base=legacy.find(([re])=>re.test(value))?.[1]??{};
 const initial=await searchParams;
 return <Suspense><CatalogShop initial={initial} base={base}/></Suspense>;
}
