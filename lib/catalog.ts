import data from './catalog.json';
export type Product = (typeof data)[number];
export const products = data;
export const catalog = products.filter(p=>!p.isVariant && !p.isPastEvent);
export const formatPrice = (amount:number) => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(amount);
export const bySlug = (slug:string) => products.find(p=>p.slug===slug);
export const featured = ['kodak-portra-400-135-36-film','cinestill-cinestill-800-t-c-41-135-36','ilford-hp5-plus-400-schwarz-weiss-film-135-36','analog-store-black-und-white-film-200-iso-135-36'].map(bySlug).filter((p):p is Product=>!!p);
export function matchesQuery(p:Product,query:string){
 const text=`${p.name} ${p.brand} ${p.category} ${p.format} ${p.process} ${p.iso} ${p.description}`.toLocaleLowerCase('de-DE');
 return query.trim().toLocaleLowerCase('de-DE').split(/\s+/).every(token=>text.includes(token));
}
