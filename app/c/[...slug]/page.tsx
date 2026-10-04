import {Suspense} from 'react';
import {CatalogShop} from '@/components/catalog-shop';
import {redirect} from 'next/navigation';
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const value=slug.join('/');if(value.includes('filmentwicklungen'))redirect('/filmentwicklung');const initial=value.includes('cameras')?'Kameras':value.includes('instax')||value.includes('polaroid')?'Sofortbild':value.includes('buecher')?'Bücher':value.includes('filme')?'Filme':value==='shop'?'Alle':'Labor';return <Suspense><CatalogShop initialCategory={initial}/></Suspense>}
