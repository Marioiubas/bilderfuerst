import {Suspense} from 'react';
import {connection} from 'next/server';
import {CatalogShop} from '@/components/catalog-shop';
export const metadata={title:'Analog Store — Filme, Kameras & Labor'};
export default async function Page(){await connection();return <Suspense fallback={<p className="section-wrap">Der Analog Store wird geladen …</p>}><CatalogShop/></Suspense>}
