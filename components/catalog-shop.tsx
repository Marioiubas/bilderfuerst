"use client";
// /shop + /c/*: calm photo-white light table. URL is the single source of filter state.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {Search,X,SlidersHorizontal,LayoutGrid,Rows3} from 'lucide-react';
import {catalog,shopGroup} from '@/lib/catalog';
import {track} from '@/lib/analytics';
import {type Category,type Filters,type FacetKey,applyFilters,categoryLabel,categoryOrder,emptyFilters,formats,fromPrice,isoBucketLabel,isoBuckets,kinds,matchesFacets,parseFilters,processes,searchProducts,serializeFilters,sortProducts,sorts,brandOf,allBrands} from '@/lib/shop-filters';
import {dimResults,revealResults,clearResultStyles} from '@/motion/products';
import {ProductCard} from './product-card';
import {Dialog} from './dialog';
import {ShopHead} from './commerce/shop-head';
import {FilmIndex} from './commerce/film-index';
import {ActiveChips,FilmFinder,FilterControls,type FacetModel,type FinderKey,type Option} from './commerce/shop-filters';

type Initial=Record<string,string|string[]|undefined>;
const first=(v:string|string[]|undefined)=>Array.isArray(v)?v[0]:v;
const quickPicks:Array<[string,string]>=[['Portra 400','portra 400'],['HP5 Plus','hp5'],['Tri-X','tri-x'],['Gold 200','gold 200'],['CineStill 800T','800t']];

export function CatalogShop({initial={},base={}}:{initial?:Initial;base?:Partial<Filters>}){
 const params=useSearchParams();const pathname=usePathname();
 const [filters,setFilters]=useState<Filters>(()=>parseFilters(k=>first(initial[k]),base));
 const [shown,setShown]=useState<Filters>(filters);
 const [sheet,setSheet]=useState(false);
 const [qDraft,setQDraft]=useState(filters.q);
 const grid=useRef<HTMLDivElement>(null);
 const written=useRef(params.toString());
 const filtersRef=useRef(filters);
 const dim=useRef<ReturnType<typeof dimResults>>(undefined);
 const firstReveal=useRef(true);
 const baseKey=JSON.stringify(base);

 useEffect(()=>{filtersRef.current=filters},[filters]);

 // External navigation (header links, back/forward) → re-read the URL.
 const paramString=params.toString();
 useEffect(()=>{
  if(paramString===written.current)return;
  written.current=paramString;
  const next=parseFilters(k=>new URLSearchParams(paramString).get(k),JSON.parse(baseKey) as Partial<Filters>);
  setFilters(next);setQDraft(next.q);
 },[paramString,baseKey]);

 const commit=useCallback((next:Filters)=>{
  setFilters(next);
  const qs=serializeFilters(next);written.current=qs;
  window.history.replaceState(null,'',qs?`${pathname}?${qs}`:pathname);
 },[pathname]);
 const change=useCallback((patch:Partial<Filters>)=>commit({...filtersRef.current,...patch}),[commit]);
 const reset=useCallback(()=>{setQDraft('');commit({...emptyFilters,category:filtersRef.current.category,sort:filtersRef.current.sort,view:filtersRef.current.view})},[commit]);
 const setCategory=(category:Category)=>{const f=filtersRef.current;commit({...emptyFilters,category,q:f.q,stock:f.stock,sort:f.sort,view:category==='Filme'?f.view:'raster'})};

 // Debounced query → URL.
 useEffect(()=>{
  if(qDraft.trim()===filtersRef.current.q)return;
  const t=window.setTimeout(()=>change({q:qDraft.trim()}),220);
  return()=>window.clearTimeout(t);
 },[qDraft,change]);

 // Analytics (debounced, no PII: only facet values).
 useEffect(()=>{
  const t=window.setTimeout(()=>{
   const {q,...rest}=filters;
   track('filter',{category:rest.category,format:rest.format,kind:rest.kind,iso:rest.iso,process:rest.process,brand:rest.brand,stock:rest.stock,sort:rest.sort,view:rest.view});
   if(q)track('search',{q,source:'shop'});
  },800);
  return()=>window.clearTimeout(t);
 },[filters]);

 // Motion: dim the visible set, then swap results; reveal only the first visible set.
 useEffect(()=>{
  if(shown===filters)return;
  dim.current?.cancel();
  const target=filters;
  dim.current=dimResults(grid.current,()=>setShown(target));
 },[filters,shown]);
 useLayoutEffect(()=>{
  if(firstReveal.current){firstReveal.current=false;return}
  dim.current?.revert();dim.current=undefined;clearResultStyles(grid.current);
  const r=revealResults(grid.current);
  return()=>r?.revert();
 },[shown]);

 // Facet model with live counts (each facet ignores its own value).
 const pool=useMemo(()=>filters.q?searchProducts(filters.q).results:catalog,[filters.q]);
 const facets=useMemo<FacetModel>(()=>{
  const count=(patch:Partial<Filters>)=>pool.filter(p=>matchesFacets(p,{...filters,...patch})).length;
  const opts=<T extends string>(key:FacetKey,values:readonly T[],label:(v:T)=>string=v=>v,title?:(v:T)=>string):Option[]=>[{value:'',label:'Alle',count:count({[key]:''} as Partial<Filters>)},...values.map(v=>({value:v,label:label(v),count:count({[key]:v} as Partial<Filters>),title:title?.(v)}))];
  const prices=pool.filter(p=>filters.category==='Alle'||shopGroup(p)===filters.category).map(fromPrice);
  const brandsHere=allBrands.filter(b=>pool.some(p=>brandOf(p)===b&&(filters.category==='Alle'||shopGroup(p)===filters.category)));
  return {
   format:opts('format',formats),kind:opts('kind',kinds),iso:opts('iso',isoBuckets,v=>v,v=>isoBucketLabel[v]),process:opts('process',processes,v=>v==='Schwarzweiß'?'S/W':v),
   brand:opts('brand',brandsHere),stockCount:count({stock:true}),
   priceFloor:prices.length?Math.min(...prices):0,priceCeiling:prices.length?Math.ceil(Math.max(...prices)):0,
  };
 },[pool,filters]);
 const tabCounts=useMemo(()=>Object.fromEntries(categoryOrder.map(c=>[c,pool.filter(p=>matchesFacets(p,{...emptyFilters,stock:filters.stock,category:c})).length])) as Record<Category,number>,[pool,filters.stock]);

 const now=useMemo(()=>applyFilters(catalog,filters),[filters]);
 const results=useMemo(()=>sortProducts(applyFilters(catalog,shown),shown.sort),[shown]);
 const isFilm=filters.category==='Filme';
 const finderKeys:FinderKey[]=isFilm||filters.category==='Alle'||filters.category==='Entwicklung'?['format','process','iso','kind']:[];
 const railKeys:FinderKey[]=isFilm?[]:finderKeys;
 const activeCount=[filters.format,filters.kind,filters.iso,filters.process,filters.brand].filter(Boolean).length+Number(filters.stock)+Number(filters.maxPrice!=null);
 const noun=isFilm?(now.length===1?'Film':'Filme'):(now.length===1?'Produkt':'Produkte');

 return <div className="shop zone-light">
  <ShopHead count={catalog.length}/>
  <div className="wrap shop-body">
   <div className="shop-tabs" role="group" aria-label="Kategorie">
    {categoryOrder.map(c=><button type="button" key={c} aria-pressed={filters.category===c} className="shop-tab" onClick={()=>setCategory(c)} disabled={tabCounts[c]===0&&filters.category!==c}>
     {categoryLabel(c)}<span className="mono num">{tabCounts[c]}</span></button>)}
   </div>

   {isFilm&&<div className="finder-wrap">
    <div className="finder-desktop"><FilmFinder facets={facets} filters={filters} onChange={change}/></div>
    <div className="finder-mobile"><FilmFinder facets={facets} filters={filters} onChange={change} keys={['format','kind']}/></div>
   </div>}
   {isFilm&&<p className="quick-picks"><span className="mono faint">Direkt zu</span>{quickPicks.map(([label,q])=><button type="button" key={q} className="quick-pick" onClick={()=>{setQDraft(q);change({q})}}>{label}</button>)}</p>}

   <div className="shop-toolbar">
    <div className="shop-search"><Search size={17} aria-hidden="true"/>
     <input type="search" value={qDraft} onChange={e=>setQDraft(e.target.value)} placeholder="Film, Marke, ISO, Format … z. B. Portra 400, 120 SW" aria-label="Im Analog Store suchen" enterKeyHint="search"/>
     {qDraft&&<button type="button" className="icon-btn" aria-label="Suchbegriff löschen" onClick={()=>{setQDraft('');change({q:''})}}><X size={16}/></button>}
    </div>
    <p className="shop-result-count mono" aria-live="polite"><span className="num">{now.length}</span> {noun}</p>
    <label className="shop-sort"><span className="mono">Sortieren</span>
     <select className="select" value={filters.sort} onChange={e=>change({sort:e.target.value as Filters['sort']})}>{sorts.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
    </label>
    {isFilm&&<div className="view-toggle" role="group" aria-label="Ansicht">
     <button type="button" aria-pressed={filters.view==='raster'} onClick={()=>change({view:'raster'})}><LayoutGrid size={15} aria-hidden="true"/>Raster</button>
     <button type="button" aria-pressed={filters.view==='index'} onClick={()=>change({view:'index'})}><Rows3 size={15} aria-hidden="true"/>Film-Index</button>
    </div>}
    <button type="button" className="btn btn-ghost btn-sm shop-filter-btn" aria-haspopup="dialog" aria-expanded={sheet} onClick={()=>setSheet(true)}><SlidersHorizontal size={15} aria-hidden="true"/>Filter{activeCount>0&&<span className="mono num">({activeCount})</span>}</button>
   </div>
   <ActiveChips filters={filters} onChange={patch=>{if('q' in patch)setQDraft('');change(patch)}} onReset={reset}/>

   <div className="shop-layout">
    <aside className="shop-rail" aria-label="Produktfilter"><FilterControls facets={facets} filters={filters} onChange={change} onReset={reset} finderKeys={railKeys}/></aside>
    <section className="shop-results" aria-labelledby="shop-results-h">
     <h2 id="shop-results-h" className="sr-only">{categoryLabel(shown.category)}: {results.length} {results.length===1?'Ergebnis':'Ergebnisse'}</h2>
     <div ref={grid} className={shown.view==='index'&&shown.category==='Filme'?'shop-index':'shop-grid'}>
      {results.length===0?<div className="shop-empty">
        <p className="mono faint">00 Treffer</p>
        <h3>Für diese Kombination haben wir nichts im Regal.</h3>
        <p className="muted">Nimm einen Filter heraus oder setze alles zurück. Nach Lieferzeiten fragst du am besten im Laden in Fürth: <a className="link" href="tel:+49911774202">0911 774202</a>.</p>
        <button type="button" className="btn btn-ink btn-sm" onClick={reset}>Filter zurücksetzen</button>
       </div>
       :shown.view==='index'&&shown.category==='Filme'?<FilmIndex items={results} sort={shown.sort} onSort={sort=>change({sort})}/>
       :results.map((p,i)=><ProductCard key={p.slug} product={p} index={i} eager={i===0}/>)}
     </div>
    </section>
   </div>
   <p className="shop-notes mono">Preise inkl. MwSt., zzgl. Versand · Quellstand 04.10.2026 · Vorschau ohne Zahlungsfunktion</p>
  </div>

  <Dialog open={sheet} onClose={()=>setSheet(false)} label="Produktfilter" kind="sheet" className="filter-sheet">
   <div className="dialog-head"><span className="mono"><b>SPEC</b> Filter · {categoryLabel(filters.category)}</span><button type="button" className="icon-btn" onClick={()=>setSheet(false)} aria-label="Filter schließen"><X size={20}/></button></div>
   <div className="filter-sheet-body"><FilterControls facets={facets} filters={filters} onChange={change} onReset={reset} finderKeys={finderKeys}/></div>
   <div className="filter-sheet-foot"><button type="button" className="btn btn-primary btn-block" onClick={()=>setSheet(false)}>{now.length} {noun} anzeigen</button></div>
  </Dialog>
 </div>;
}
