"use client";
import {createContext,useContext,useEffect,useState} from 'react';
import {bySlug} from '@/lib/catalog';
type Line={slug:string;quantity:number};
type Store={lines:Line[];add:(slug:string,quantity?:number)=>void;update:(slug:string,quantity:number)=>void;cartOpen:boolean;setCartOpen:(v:boolean)=>void;searchOpen:boolean;setSearchOpen:(v:boolean)=>void};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}){
 const [lines,setLines]=useState<Line[]>([]);const [ready,setReady]=useState(false);const [cartOpen,setCartOpen]=useState(false);const [searchOpen,setSearchOpen]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('bilderfurst-review-cart')||'[]');if(Array.isArray(saved))setLines(saved.filter(l=>l&&typeof l.slug==='string'&&bySlug(l.slug)?.inStock&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=99).slice(0,100))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('bilderfurst-review-cart',JSON.stringify(lines))}catch{}},[lines,ready]);
 const add=(slug:string,quantity=1)=>{const p=bySlug(slug);if(!p?.inStock||p.isMaster)return;setLines(ls=>ls.some(l=>l.slug===slug)?ls.map(l=>l.slug===slug?{...l,quantity:Math.min(99,l.quantity+quantity)}:l):[...ls,{slug,quantity:Math.max(1,Math.min(99,quantity))}]);setCartOpen(true)};
 const update=(slug:string,quantity:number)=>setLines(ls=>quantity<=0?ls.filter(l=>l.slug!==slug):ls.map(l=>l.slug===slug?{...l,quantity:Math.min(99,quantity)}:l));
 return <Context.Provider value={{lines,add,update,cartOpen,setCartOpen,searchOpen,setSearchOpen}}>{children}</Context.Provider>
}
export function useStore(){const s=useContext(Context);if(!s)throw new Error('StoreProvider missing');return s;}
