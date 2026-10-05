import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import content from '@/lib/source-content.json';
import {LegalPage} from '@/components/story/source';

const legal=new Set(['contact','cookiepolicy','privacy','tac','withdrawal','shipping']);
type Params={params:Promise<{slug:string}>};
const page=(slug:string)=>(content as Record<string,{title:string;paragraphs:string[];source:string;updated?:string}|undefined>)[slug];

export async function generateMetadata({params}:Params):Promise<Metadata>{const {slug}=await params;return {title:page(slug)?.title||'Rechtliche Information'}}
export default async function Page({params}:Params){
 const {slug}=await params;
 const p=page(slug);
 if(!p)notFound();
 if(!legal.has(slug))redirect(`/i/${slug}`);
 return <LegalPage slug={slug} page={p}/>;
}
