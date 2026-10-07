"use client";
// Shop filter controls: film finder bar (segmented radios, tablet/desktop) + lab-specification rail /
// bottom sheet (phones get the finder facets, quick picks and view inside the sheet: audit H1).
// Real form controls only; empty options stay visible but disabled.
import {useId,type ReactNode} from 'react';
import {X,RotateCcw} from 'lucide-react';
import {type Filters,type FacetKey,isoBucketLabel,categoryLabel} from '@/lib/shop-filters';
import {formatPrice} from '@/lib/catalog';

export type Option={value:string;label:string;count:number;title?:string};
export type FacetModel={format:Option[];kind:Option[];iso:Option[];process:Option[];brand:Option[];priceFloor:number;priceCeiling:number;stockCount:number};
export type FinderKey='format'|'kind'|'iso'|'process';
export const finderLabels:Record<FinderKey,string>={format:'Format',kind:'Typ',iso:'ISO',process:'Prozess'};
type Change=(patch:Partial<Filters>)=>void;

/** One radio group. variant "segment" = film finder, "list" = rail row list, "chips" = wrapped 44 px chips (sheet). */
export function FacetGroup({name,legend,code,options,value,onChange,variant='list'}:{name:string;legend:string;code?:string;options:Option[];value:string;onChange:(v:string)=>void;variant?:'segment'|'list'|'chips'}){
 const id=useId();
 return <fieldset className={`facet facet-${variant}`}>
  <legend className="facet-legend mono">{code&&<span className="facet-code">{code}</span>}{legend}</legend>
  <div className="facet-options">
   {options.map(o=>{const disabled=o.count===0&&o.value!==value;const oid=`${id}-${o.value||'alle'}`;
    return <label key={o.value||'alle'} htmlFor={oid} className="facet-option" data-checked={value===o.value} data-disabled={disabled} title={o.title}>
     <input type="radio" id={oid} name={`${id}-${name}`} value={o.value} checked={value===o.value} disabled={disabled} onChange={()=>onChange(o.value)}/>
     <span className="facet-mark" aria-hidden="true"/>
     <span className="facet-label">{o.label}</span>
     <span className="facet-count mono num">{o.count}</span>
    </label>})}
  </div>
 </fieldset>;
}

/** Sticky film finder bar (Filme, >= 768 px). Extra controls (quick picks) follow the facets. */
export function FilmFinder({facets,filters,onChange,keys=['format','kind','iso','process'],children}:{facets:FacetModel;filters:Filters;onChange:Change;keys?:FinderKey[];children?:ReactNode}){
 return <div className="finder" role="group" aria-label="Film finden">
  <p className="finder-title mono"><b>FLM</b> Film finden</p>
  {keys.map(k=><FacetGroup key={k} name={k} legend={finderLabels[k]} variant="segment" options={facets[k]} value={filters[k]} onChange={v=>onChange({[k]:v} as Partial<Filters>)}/>)}
  {children}
 </div>;
}

/** "Direkt zu" quick searches (Filme): finder row on desktop, filter sheet on phones. */
export function QuickPicks({picks,onPick}:{picks:Array<[string,string]>;onPick:(q:string)=>void}){
 return <div className="quick-picks" role="group" aria-label="Direkt zu"><span className="mono faint" aria-hidden="true">Direkt zu</span>{picks.map(([label,q])=><button type="button" key={q} className="quick-pick" onClick={()=>onPick(q)}>{label}</button>)}</div>;
}

/** Lab specification rail (desktop) / bottom-sheet body (mobile). */
export function FilterControls({facets,filters,onChange,onReset,finderKeys,before,after,variant='list'}:{facets:FacetModel;filters:Filters;onChange:Change;onReset:()=>void;finderKeys:FinderKey[];before?:ReactNode;after?:ReactNode;variant?:'list'|'chips'}){
 const id=useId();
 const show=(k:FinderKey)=>finderKeys.includes(k)&&(facets[k].slice(1).some(o=>o.count>0)||!!filters[k]);
 const codes:Record<FinderKey,string>={format:'01',process:'02',iso:'03',kind:'04'};
 const order:FinderKey[]=['format','process','iso','kind'];
 const ceiling=Math.max(facets.priceCeiling,filters.maxPrice??0);
 const price=filters.maxPrice??ceiling;
 return <div className="spec">
  <div className="spec-head"><span className="mono"><b>SPEC</b> Filter</span><button type="button" className="spec-reset mono" onClick={onReset}><RotateCcw size={12} aria-hidden="true"/> Zurücksetzen</button></div>
  {before}
  {order.filter(show).map(k=><FacetGroup key={k} name={k} code={codes[k]} legend={finderLabels[k].toUpperCase()} variant={variant} options={facets[k]} value={filters[k]} onChange={v=>onChange({[k]:v} as Partial<Filters>)}/>)}
  {facets.brand.length>2&&<div className="facet"><label className="facet-legend mono" htmlFor={`${id}-brand`}><span className="facet-code">05</span>MARKE</label>
   <select id={`${id}-brand`} className="select" value={filters.brand} onChange={e=>onChange({brand:e.target.value})}>
    {facets.brand.map(o=><option key={o.value||'alle'} value={o.value} disabled={o.count===0&&o.value!==filters.brand}>{o.label} ({o.count})</option>)}
   </select></div>}
  <div className="facet"><p className="facet-legend mono"><span className="facet-code">06</span>STATUS</p>
   <label className="check spec-check"><input type="checkbox" checked={filters.stock} onChange={e=>onChange({stock:e.target.checked})}/><span>Nur „Auf Lager“</span><span className="facet-count mono num">{facets.stockCount}</span></label>
  </div>
  {ceiling>facets.priceFloor&&<div className="facet"><label className="facet-legend mono" htmlFor={`${id}-price`}><span className="facet-code">07</span>PREIS</label>
   <input id={`${id}-price`} className="spec-range" type="range" min={Math.floor(facets.priceFloor)} max={ceiling} step={1} value={price} aria-valuetext={`bis ${formatPrice(price)}`} onChange={e=>{const n=Number(e.target.value);onChange({maxPrice:n>=ceiling?null:n})}}/>
   <p className="spec-range-out mono num"><span>{formatPrice(Math.floor(facets.priceFloor))}</span><output>bis {formatPrice(price)}</output></p>
  </div>}
  {after}
  <p className="spec-note">Preise inkl. MwSt., zzgl. Versand · Quellstand 04.10.2026 · Verfügbarkeit bestätigt der bestehende Shop.</p>
 </div>;
}

/** Removable active-filter chips. */
export function ActiveChips({filters,onChange,onReset}:{filters:Filters;onChange:Change;onReset:()=>void}){
 const chips:Array<[string,Partial<Filters>]>=[];
 if(filters.q)chips.push([`Suche „${filters.q}“`,{q:''}]);
 if(filters.format)chips.push([`Format ${filters.format}`,{format:''}]);
 if(filters.kind)chips.push([`Typ ${filters.kind}`,{kind:''}]);
 if(filters.iso)chips.push([isoBucketLabel[filters.iso],{iso:''}]);
 if(filters.process)chips.push([`Prozess ${filters.process}`,{process:''}]);
 if(filters.brand)chips.push([filters.brand,{brand:''}]);
 if(filters.stock)chips.push(['Auf Lager',{stock:false}]);
 if(filters.maxPrice!=null)chips.push([`bis ${formatPrice(filters.maxPrice)}`,{maxPrice:null}]);
 if(!chips.length)return null;
 return <div className="active-chips" aria-label="Aktive Filter">
  <span className="mono faint">{categoryLabel(filters.category)} ·</span>
  {chips.map(([label,patch])=><button type="button" key={label} className="active-chip" onClick={()=>onChange(patch)} aria-label={`Filter ${label} entfernen`}>{label}<X size={12} aria-hidden="true"/></button>)}
  <button type="button" className="active-reset" onClick={onReset}>Alle Filter zurücksetzen</button>
 </div>;
}
