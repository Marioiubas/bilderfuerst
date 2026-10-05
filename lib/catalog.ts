import data from './catalog.json';
export type Product = (typeof data)[number];
export const products = data;
export const catalog = products.filter(p=>!p.isVariant && !p.isPastEvent);
export const formatPrice = (amount:number) => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(amount);
export const bySlug = (slug:string) => products.find(p=>p.slug===slug);
export const featured = ['kodak-portra-400-135-36-film','cinestill-cinestill-800-t-c-41-135-36','ilford-hp5-plus-400-schwarz-weiss-film-135-36','analog-store-black-und-white-film-200-iso-135-36'].map(bySlug).filter((p):p is Product=>!!p);
export function matchesQuery(p:Product,query:string){
 const text=`${p.name} ${p.brand} ${p.category} ${p.format} ${p.process} ${p.iso} ${p.description} ${shopGroup(p)}`.toLocaleLowerCase('de-DE');
 return query.trim().toLocaleLowerCase('de-DE').split(/\s+/).every(token=>text.includes(token));
}

/** Customer-facing shop groups. The source "Shop" category mixes cameras, film, bags and
 *  chemistry, so grouping uses category first and falls back to name/format evidence. */
export const shopGroups=['Filme','Kameras','Sofortbild','Chemie','Equipment','Taschen','Bücher','Gutscheine','Entwicklung'] as const;
export type ShopGroup=(typeof shopGroups)[number];
export const shopGroupLabels:Record<ShopGroup,string>={Filme:'Filme',Kameras:'Kameras',Sofortbild:'Sofortbild',Chemie:'Chemie',Equipment:'Labor-Equipment',Taschen:'Taschen',Bücher:'Bücher & Zines',Gutscheine:'Gutscheine',Entwicklung:'Entwicklung & Scan'};
const chemistry=/entwickler|developer|fixierer|fixer|stoppbad|ilfostop|netzmittel|adoflo|d-76|d 96|hc-110|pyro|xt-3|adotech/i;
export function shopGroup(p:Product):ShopGroup{
 const c=p.category;
 if(c==='FILMENTWICKLUNGEN')return 'Entwicklung';
 if(c==='GUTSCHEIN'||/gutschein/i.test(p.name))return 'Gutscheine';
 if(c==='INSTAX FILME'||c==='POLAROID')return 'Sofortbild';
 if(c==='BÜCHER & ZINES')return 'Bücher';
 if(c==='CAMERAS'||/kamera|pentax 17/i.test(p.name))return /instax|polaroid/i.test(p.name)&&c!=='CAMERAS'?'Sofortbild':'Kameras';
 if(c==='FOTOCHEMIE'||chemistry.test(p.name))return 'Chemie';
 if(c==='ANALOG ENTWICKLUNGS-EQUIPMENT')return 'Equipment';
 if(/billingham|tasche|bag/i.test(p.name))return 'Taschen';
 if(c==='FILME'||/film|135\/36|rollfilm|120/i.test(p.name))return 'Filme';
 return 'Equipment';
}
export function groupCount(group:ShopGroup){return catalog.filter(p=>shopGroup(p)===group).length}

/** Film colour family for the film finder. */
export function filmKind(p:Product):'Farbe'|'Schwarzweiß'|'Dia'|''{
 if(shopGroup(p)!=='Filme')return '';
 if(p.process==='E-6')return 'Dia';
 if(p.process==='Schwarzweiß')return 'Schwarzweiß';
 if(p.process==='C-41')return 'Farbe';
 return /schwarz|black|b&w|apx|hp5|delta|fp4|pan f|tri-x|t-max|p30|bwxx/i.test(p.name)?'Schwarzweiß':/velvia|provia|ektachrome|dia/i.test(p.name)?'Dia':'Farbe';
}
