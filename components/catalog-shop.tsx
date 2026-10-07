"use client";
// /shop + /c/*: calm photo-white light table. URL is the single source of filter state (+ ?n= batch size).
// Phones (audit H1): compact title row, one scrolling category row, a sticky 52 px results bar
// (search · sort · "Filter · n"); finder facets, quick picks and the view switch live in the sheet.
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
import {ActiveChips,FacetGroup,FilmFinder,FilterControls,QuickPicks,type FacetModel,type FinderKey,type Option} from './commerce/shop-filters';

type Initial=Record<string,string|string[]|undefined>;
const first=(v:string|string[]|undefined)=>Array.isArray(v)?v[0]:v;
const quickPicks:Array<[string,string]>=[['Portra 400','portra 400'],['HP5 Plus','hp5'],['Tri-X','tri-x'],['Gold 200','gold 200'],['CineStill 800T','800t']];
/** Cards per batch ("Mehr laden"). The Film-Index table always shows every row. */
const PAGE=24;
const MAX_N=Math.ceil(catalog.length/PAGE)*PAGE;
const parseN=(v:string|null|undefined)=>{const n=Number(v);return Number.isFinite(n)&&n>PAGE?Math.min(Math.ceil(n/PAGE)*PAGE,MAX_N):PAGE};
const queryFor=(f:Filters,n:number)=>{const p=new URLSearchParams(serializeFilters(f));if(n>PAGE)p.set('n',String(n));return p.toString()};

export function CatalogShop({initial={},base={}}:{initial?:Initial;base?:Partial<Filters>}){
 const params=useSearchParams();const pathname=usePathname();
 // Live URL first: after Back, the cached server props can predate our replaceState writes (filters, ?n=).
 const read=(k:string)=>params.get(k)??first(initial[k]);
 const [filters,setFilters]=useState<Filters>(()=>parseFilters(read,base));
 const [shown,setShown]=useState<Filters>(filters);
 const [limit,setLimit]=useState(()=>parseN(read('n')));
 const [sheet,setSheet]=useState(false);
 const [qDraft,setQDraft]=useState(filters.q);
 const [searchOpen,setSearchOpen]=useState(!!filters.q);
 const grid=useRef<HTMLDivElement>(null);
 const tabs=useRef<HTMLDivElement>(null);
 const searchInput=useRef<HTMLInputElement>(null);
 const written=useRef(params.toString());
 const filtersRef=useRef(filters);
 const limitRef=useRef(limit);
 const focusFrom=useRef(-1);
 const dim=useRef<ReturnType<typeof dimResults>>(undefined);
 const firstReveal=useRef(true);
 const baseKey=JSON.stringify(base);

 useEffect(()=>{filtersRef.current=filters},[filters]);
 useEffect(()=>{limitRef.current=limit},[limit]);

 const write=useCallback((f:Filters,n:number)=>{
  const qs=queryFor(f,n);written.current=qs;
  window.history.replaceState(null,'',qs?`${pathname}?${qs}`:pathname);
 },[pathname]);

 // External navigation (header links, back/forward) → re-read the URL.
 const paramString=params.toString();
 useEffect(()=>{
  if(paramString===written.current)return;
  written.current=paramString;
  const sp=new URLSearchParams(paramString);
  const next=parseFilters(k=>sp.get(k),JSON.parse(baseKey) as Partial<Filters>);
  setFilters(next);setQDraft(next.q);setLimit(parseN(sp.get('n')));
  if(next.q)setSearchOpen(true);
 },[paramString,baseKey]);

 // Any filter/sort/view change starts again with the first batch.
 const commit=useCallback((next:Filters)=>{setFilters(next);setLimit(PAGE);write(next,PAGE)},[write]);
 const change=useCallback((patch:Partial<Filters>)=>commit({...filtersRef.current,...patch}),[commit]);
 const reset=useCallback(()=>{setQDraft('');commit({...emptyFilters,category:filtersRef.current.category,sort:filtersRef.current.sort,view:filtersRef.current.view})},[commit]);
 const setCategory=(category:Category)=>{const f=filtersRef.current;commit({...emptyFilters,category,q:f.q,stock:f.stock,sort:f.sort,view:category==='Filme'?f.view:'raster'})};
 const pick=(q:string)=>{setQDraft(q);setSearchOpen(true);change({q});setSheet(false)};
 const loadMore=()=>{const n=Math.min(limitRef.current+PAGE,MAX_N);focusFrom.current=limitRef.current;setLimit(n);write(filtersRef.current,n)};

 // Debounced query → URL.
 useEffect(()=>{
  if(qDraft.trim()===filtersRef.current.q)return;
  const t=window.setTimeout(()=>change({q:qDraft.trim()}),220);
  return()=>window.clearTimeout(t);
 },[qDraft,change]);
 useEffect(()=>{if(searchOpen&&!filtersRef.current.q)searchInput.current?.focus()},[searchOpen]);

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

 // "Mehr laden": move focus to the first newly shown product (keyboard + screen reader continuity).
 useEffect(()=>{
  if(focusFrom.current<0)return;
  const link=grid.current?.querySelectorAll<HTMLElement>('[data-result]')[focusFrom.current]?.querySelector<HTMLElement>('.pcard-title a');
  focusFrom.current=-1;link?.focus({preventScroll:false});
 },[limit]);

 // Category row: keep the selected chip in view (horizontal only, never scrolls the page) + edge fade state.
 const syncTabs=useCallback(()=>{
  const row=tabs.current;const wrap=row?.parentElement;if(!row||!wrap)return;
  wrap.dataset.overflow=String(row.scrollWidth>row.clientWidth+2);
  wrap.dataset.end=String(row.scrollLeft+row.clientWidth>=row.scrollWidth-2);
 },[]);
 const firstTabs=useRef(true);
 useEffect(()=>{
  const row=tabs.current;const el=row?.querySelector<HTMLElement>('[aria-pressed=true]');
  if(row&&el&&row.scrollWidth>row.clientWidth){
   const left=Math.max(0,el.offsetLeft-(row.clientWidth-el.offsetWidth)/2);
   const smooth=!firstTabs.current&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   row.scrollTo({left,behavior:smooth?'smooth':'auto'});
  }
  firstTabs.current=false;syncTabs();
 },[filters.category,syncTabs]);
 useEffect(()=>{window.addEventListener('resize',syncTabs);return()=>window.removeEventListener('resize',syncTabs)},[syncTabs]);

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
 const indexView=shown.view==='index'&&shown.category==='Filme';
 const visible=indexView?results:results.slice(0,limit);
 const rest=results.length-visible.length;
 const finderKeys:FinderKey[]=isFilm||filters.category==='Alle'||filters.category==='Entwicklung'?['format','process','iso','kind']:[];
 const railKeys:FinderKey[]=isFilm?[]:finderKeys;
 const activeCount=[filters.format,filters.kind,filters.iso,filters.process,filters.brand].filter(Boolean).length+Number(filters.stock)+Number(filters.maxPrice!=null);
 const noun=isFilm?(now.length===1?'Film':'Filme'):(now.length===1?'Produkt':'Produkte');
 const categoryOptions:Option[]=categoryOrder.map(c=>({value:c,label:categoryLabel(c),count:tabCounts[c]}));
 const viewToggle=<div className="view-toggle" role="group" aria-label="Ansicht">
  <button type="button" aria-pressed={filters.view==='raster'} onClick={()=>change({view:'raster'})}><LayoutGrid size={15} aria-hidden="true"/>Raster</button>
  <button type="button" aria-pressed={filters.view==='index'} onClick={()=>change({view:'index'})}><Rows3 size={15} aria-hidden="true"/>Film-Index</button>
 </div>;

 return <div className="shop zone-light">
  <ShopHead count={now.length} noun={noun}/>
  <div className="wrap shop-body">
   <div className="shop-tabs-wrap">
    <div ref={tabs} className="shop-tabs" role="group" aria-label="Kategorie" onScroll={syncTabs}>
     {categoryOrder.map(c=><button type="button" key={c} aria-pressed={filters.category===c} className="shop-tab" onClick={()=>setCategory(c)} disabled={tabCounts[c]===0&&filters.category!==c}>
      {categoryLabel(c)}<span className="mono num">{tabCounts[c]}</span></button>)}
    </div>
   </div>

   {isFilm&&<div className="finder-wrap">
    <FilmFinder facets={facets} filters={filters} onChange={change}><QuickPicks picks={quickPicks} onPick={pick}/></FilmFinder>
   </div>}

   <div className="shop-bar">
    <div className="shop-toolbar">
     <button type="button" className="icon-btn shop-search-toggle" aria-label="Im Analog Store suchen" aria-expanded={searchOpen} aria-controls="shop-search" onClick={()=>setSearchOpen(o=>!o)}><Search size={19} aria-hidden="true"/></button>
     <div className="shop-search" id="shop-search" data-open={searchOpen}><Search size={17} aria-hidden="true"/>
      <input ref={searchInput} type="search" value={qDraft} onChange={e=>setQDraft(e.target.value)} placeholder="Film, Marke, ISO oder Format" aria-label="Im Analog Store suchen" enterKeyHint="search"/>
      {qDraft&&<button type="button" className="icon-btn" aria-label="Suchbegriff löschen" onClick={()=>{setQDraft('');change({q:''});searchInput.current?.focus()}}><X size={16}/></button>}
     </div>
     <label className="shop-sort"><span className="mono">Sortieren</span>
      <select className="select" aria-label="Sortieren" value={filters.sort} onChange={e=>change({sort:e.target.value as Filters['sort']})}>{sorts.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
     </label>
     {isFilm&&<div className="shop-view">{viewToggle}</div>}
     <button type="button" className="btn btn-ghost shop-filter-btn" aria-haspopup="dialog" aria-expanded={sheet} onClick={()=>setSheet(true)}><SlidersHorizontal size={16} aria-hidden="true"/>Filter{activeCount>0&&<span className="mono num"><span aria-hidden="true">·</span> {activeCount}<span className="sr-only"> aktiv</span></span>}</button>
    </div>
   </div>
   <ActiveChips filters={filters} onChange={patch=>{if('q' in patch){setQDraft('');setSearchOpen(false)}change(patch)}} onReset={reset}/>

   <div className="shop-layout">
    <aside className="shop-rail" aria-label="Produktfilter"><FilterControls facets={facets} filters={filters} onChange={change} onReset={reset} finderKeys={railKeys}/></aside>
    <section className="shop-results" aria-labelledby="shop-results-h">
     <h2 id="shop-results-h" className="sr-only">{categoryLabel(shown.category)}: {results.length} {results.length===1?'Ergebnis':'Ergebnisse'}</h2>
     <div ref={grid} className={indexView?'shop-index':'shop-grid'}>
      {results.length===0?<div className="shop-empty">
        <p className="mono faint">00 Treffer</p>
        <h3>Für diese Kombination haben wir nichts im Regal.</h3>
        <p className="muted">Nimm einen Filter heraus oder setze alles zurück. Nach Lieferzeiten fragst du am besten im Laden in Fürth: <a className="link" href="tel:+49911774202">0911 774202</a>.</p>
        <button type="button" className="btn btn-ink btn-sm" onClick={reset}>Filter zurücksetzen</button>
       </div>
       :indexView?<FilmIndex items={results} sort={shown.sort} onSort={sort=>change({sort})}/>
       :visible.map((p,i)=><ProductCard key={p.slug} product={p} index={i} eager={i===0}/>)}
     </div>
     {!indexView&&results.length>PAGE&&<div className="shop-more">
      <p className="mono"><span className="num">{visible.length}</span> von <span className="num">{results.length}</span> angezeigt</p>
      {rest>0&&<button type="button" className="btn btn-ghost btn-block" onClick={loadMore}>Mehr laden <span className="mono num">(noch {rest})</span></button>}
     </div>}
    </section>
   </div>
   <p className="shop-notes mono">Preise inkl. MwSt., zzgl. Versand · Quellstand 04.10.2026 · Vorschau ohne Zahlungsfunktion</p>
  </div>

  <Dialog open={sheet} onClose={()=>setSheet(false)} label="Produktfilter" kind="sheet" className="filter-sheet">
   <div className="dialog-head"><span className="mono"><b>SPEC</b> Filter · {categoryLabel(filters.category)}</span><button type="button" className="icon-btn" onClick={()=>setSheet(false)} aria-label="Filter schließen"><X size={20}/></button></div>
   <div className="filter-sheet-body"><FilterControls facets={facets} filters={filters} onChange={change} onReset={reset} finderKeys={finderKeys} variant="chips"
    before={<div className="sheet-phone"><FacetGroup name="category" legend="KATEGORIE" code="00" variant="chips" options={categoryOptions} value={filters.category} onChange={v=>setCategory(v as Category)}/>
     {isFilm&&<div className="facet"><p className="facet-legend mono"><span className="facet-code">FLM</span>DIREKT ZU</p><QuickPicks picks={quickPicks} onPick={pick}/></div>}</div>}
    after={isFilm?<div className="sheet-phone"><div className="facet"><p className="facet-legend mono"><span className="facet-code">08</span>ANSICHT</p>{viewToggle}</div></div>:undefined}/></div>
   <div className="filter-sheet-foot">{activeCount>0&&<button type="button" className="btn btn-ghost" onClick={reset}>Zurücksetzen</button>}<button type="button" className="btn btn-primary" onClick={()=>setSheet(false)}>{now.length} {noun} anzeigen</button></div>
  </Dialog>
 </div>;
}
