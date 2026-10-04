import {notFound} from 'next/navigation';
import {bySlug} from '@/lib/catalog';
import {ProductDetail} from '@/components/product-detail';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=bySlug(slug);return {title:p?.name||'Produkt nicht gefunden',description:p?.description.slice(0,155)}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=bySlug(slug);if(!p)notFound();return <ProductDetail product={p}/>}
