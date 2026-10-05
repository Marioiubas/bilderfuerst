// Shared analog UI primitives (CSS/SVG graphics). Server-safe; no client hooks.
import type {ReactNode} from 'react';

/** Six-blade aperture mark used with the wordmark. CSS/SVG graphic, not an owner logo. */
export function ApertureMark({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden="true"><circle cx="16" cy="16" r="14.2"/><path d="M16 10.4L29.98 18.47M20.85 13.2V29.35M20.85 18.8L6.87 26.87M16 21.6L2.02 13.53M11.15 18.8V2.65M11.15 13.2L25.13 5.13"/></svg>;
}

/** The business's current "Analog Store – Bilderfürst Fürth" logo (OWNER LOGO, rights pending),
 *  rendered as a CSS mask from an alpha channel derived losslessly from the source file, so it
 *  takes the surrounding text colour. Shape and proportions are unaltered. */
export function BrandLogo({className=''}:{className?:string}){return <span className={`brand-logo ${className}`} role="img" aria-label="Analog Store – Bilderfürst Fürth"/>}

/** Section head: technical code line (zone code + label + index) and a title. */
export function SectionHead({code,label,index,title,action,id,as:Tag='h2',className=''}:{code:string;label:string;index?:string;title:ReactNode;action?:ReactNode;id?:string;as?:'h1'|'h2';className?:string}){
 return <header className={`sec-head ${className}`}>
  <p className="eyebrow"><b>{code}</b><span>{label}</span>{index&&<span className="sec-index">{index}</span>}</p>
  <Tag id={id}>{title}</Tag>
  {action&&<div className="sec-action">{action}</div>}
 </header>;
}

export type ChipKind='c41'|'bw'|'e6'|'scan'|'red';
/** Map a catalog process to its discipline accent. */
export function processKind(process:string):ChipKind|undefined{
 if(process==='C-41')return 'c41';if(process==='E-6')return 'e6';if(/schwarz|s\/w|push/i.test(process))return 'bw';return undefined;
}
export function Chip({kind,children,className=''}:{kind?:ChipKind;children:ReactNode;className?:string}){
 return <span className={`chip ${kind?`chip-${kind}`:''} ${className}`}>{children}</span>;
}

export function Sprockets({className=''}:{className?:string}){return <div className={`sprockets ${className}`} aria-hidden="true"/>}

/** Film edge print: frame numbers and codes as printed on a real negative edge (no brand names). */
export function EdgePrint({children,className=''}:{children:ReactNode;className?:string}){return <span className={`edge-print ${className}`} aria-hidden="true">{children}</span>}

export function frameNo(n:number){return String(n).padStart(2,'0')}
