// PDP sections below the buy box: film-development bridge, chemistry, same film other format, more.
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {type Product,bySlug,catalog,formatPrice,shopGroup} from '@/lib/catalog';
import {Chip} from '@/components/analog/primitives';
import {ProductCard} from '@/components/product-card';
import {configuratorProcess,developFrom,groupLabel,processChip,processLabel,sameFilmOtherFormat} from './product-meta';

const processNote:Record<string,string>={
 'C-41':'Farbfilme (C-41) entwickeln wir in einem Fujifilm Minilab mit Fujifilm Chemie.',
 'Schwarzweiß':'Schwarzweißfilme entwickeln wir individuell in Jobo Rotationsmaschinen.',
 'E-6':'Diafilme (E-6) entwickeln wir mit CineStill E-6 Chemie in einer Rotationsmaschine.',
};

/** "Diesen Film bei uns entwickeln" — deep link into the lab configurator (format + process). */
export function DevelopBridge({product:p}:{product:Product}){
 const isCamera=p.slug==='pentax-17';
 const format=(isCamera?'35mm':p.format) as '35mm'|'120';
 const process=isCamera?'C-41':p.process;
 if(format!=='35mm'&&format!=='120')return null;
 const from=developFrom(format,process);if(from==null)return null;
 const proc=configuratorProcess(process);
 const href=`/filmentwicklung?format=${format}${!isCamera&&proc?`&process=${encodeURIComponent(proc)}`:''}`;
 return <section className="pdp-bridge" aria-labelledby="pdp-bridge-h">
  <div className="pdp-bridge-ticket">
   <p className="eyebrow"><b>LAB</b><span>Hauseigenes Labor · Fürth</span></p>
   <h2 id="pdp-bridge-h">{isCamera?'Halbformat-Film bei uns entwickeln':'Diesen Film bei uns entwickeln'}</h2>
   <p className="muted">{isCamera?'Die Pentax 17 belichtet 35mm Film im Halbformat. Unsere Scans entstehen mit einem Noritsu HS-1800, im Halbformat mit 4492 × 3167 Pixeln.':`${processNote[process]??''} Scans erstellen wir mit einem Noritsu HS-1800${format==='35mm'?' (Kleinbild 6774 × 4492 Pixel)':''}.`}</p>
  </div>
  <dl className="pdp-bridge-spec">
   <div><dt className="mono">Format</dt><dd>{format==='35mm'?'35mm Kleinbild':'120 Mittelformat'}</dd></div>
   {!isCamera&&<div><dt className="mono">Prozess</dt><dd><Chip kind={processChip(process)}>{processLabel(process)}</Chip></dd></div>}
   <div><dt className="mono">Entwicklung</dt><dd className="num"><small>ab </small>{formatPrice(from)}</dd></div>
  </dl>
  <Link className="btn btn-ink" href={href}>Entwicklung planen <ArrowRight size={16} aria-hidden="true"/></Link>
 </section>;
}

const chemistry=['adox-adonal-500-ml-konzentrat-schwarz-weiss-filmentwickler','kodak-professional-d-76-zum-ansatz-von-1000-ml','adox-adostop-eco-geruchloses-stoppbad-mit-indikator-500-ml-konzentrat-adox-adostop-eco-ger','adox-adofix-plus-expressfixierer-500-ml-konzentrat-adox-adofix-plus-expressfixierer-500-ml'];

function Row({id,code,label,title,items,action}:{id:string;code:string;label:string;title:string;items:Product[];action?:React.ReactNode}){
 if(!items.length)return null;
 return <section className="pdp-row" aria-labelledby={id}>
  <header className="pdp-row-head"><div><p className="eyebrow"><b>{code}</b><span>{label}</span></p><h2 id={id}>{title}</h2></div>{action}</header>
  <div className="pdp-row-grid">{items.map((p,i)=><ProductCard key={p.slug} product={p} index={i} compact/>)}</div>
 </section>;
}

export function PdpRelated({product:p}:{product:Product}){
 const group=shopGroup(p);
 const other=sameFilmOtherFormat(p,catalog);
 const chem=group==='Filme'&&p.process==='Schwarzweiß'?chemistry.map(bySlug).filter((x):x is Product=>!!x):[];
 const taken=new Set([p.slug,...other.map(o=>o.slug),...chem.map(c=>c.slug)]);
 const more=catalog.filter(o=>!taken.has(o.slug)&&shopGroup(o)===group&&(group!=='Filme'||o.process===p.process)).sort((a,b)=>Number(b.inStock)-Number(a.inStock)).slice(0,4);
 return <div className="wrap pdp-related">
  <Row id="pdp-other-format" code="FLM" label="Gleicher Film" title="Anderes Format" items={other}/>
  <Row id="pdp-chem" code="CHM" label="Selbst entwickeln" title="Chemie für Schwarzweiß" items={chem} action={<Link className="link" href="/shop?category=Chemie">Alle Chemie <ArrowRight size={14} aria-hidden="true"/></Link>}/>
  <Row id="pdp-more" code="STR" label={groupLabel(p)} title={group==='Filme'?`Mehr ${processLabel(p.process)}-Filme`:`Mehr ${groupLabel(p)}`} items={more} action={<Link className="link" href={`/shop?category=${encodeURIComponent(group)}`}>Alle ansehen <ArrowRight size={14} aria-hidden="true"/></Link>}/>
 </div>;
}
