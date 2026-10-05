import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import content from '@/lib/source-content.json';
import {PrintRoomPage} from '@/components/story/fineart';
import {SourcePage} from '@/components/story/source';

// Old source URLs that now live on dedicated pages.
const aliases:Record<string,string>={'wir-digitalisieren':'/digitalisierung','galerie':'/galerie','unsere-geschichte':'/geschichte','kontakt-und-oeffnungszeiten':'/kontakt','unser-geschaeft':'/kontakt','drop-off-locations':'/kontakt','fotostudio':'/services','pass-und-bewerbung':'/services','ueber-uns':'/geschichte'};
const legal=new Set(['contact','cookiepolicy','privacy','tac','withdrawal','shipping']);
type Params={params:Promise<{slug:string}>};
const page=(slug:string)=>(content as Record<string,{title:string;paragraphs:string[];source:string;updated?:string}|undefined>)[slug];

export async function generateMetadata({params}:Params):Promise<Metadata>{
 const {slug}=await params;
 if(slug==='fineart-prints')return {title:'FineArt Prints — Fotopapier, Metallic, FineArt bis 100 × 190 cm'};
 if(slug==='preisliste')return {title:'Preisliste Druck — FineArt, Fotopapier, Metallic, Abzüge'};
 return {title:page(slug)?.title||'Service'};
}
export default async function Page({params}:Params){
 const {slug}=await params;
 if(aliases[slug])redirect(aliases[slug]);
 if(legal.has(slug))redirect(`/l/${slug}`);
 const p=page(slug);
 if(!p)notFound();
 if(slug==='fineart-prints'||slug==='preisliste')return <PrintRoomPage focus={slug==='preisliste'?'preisliste':'fineart'}/>;
 return <SourcePage slug={slug} page={p}/>;
}
