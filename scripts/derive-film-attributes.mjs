// Re-derives the *derived* film fields (format, process, iso, filmKind) in lib/catalog.json
// from each product's own source name and source description. Source fields (id, price,
// availability, description, images, URLs) are never touched. The previous extraction used a
// name-only regex that mislabelled e.g. Kodak T-Max and CineStill BWxx as C-41 and the
// Instax WIDE EVO camera ("black") as Schwarzweiß. Run: node scripts/derive-film-attributes.mjs
import fs from 'node:fs';
const file='lib/catalog.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
const changes=[];
const isFilmCategory=p=>p.category==='FILME'||(p.category==='Shop'&&/film|135\/36|rollfilm/i.test(p.name)&&!/entwickler|developer|d-76|d 96/i.test(p.name));
const BW=/schwarz-?\s?wei(ß|ss)|schwarz\/weiss|\bsw[ -]film|\bsw film|panchromatisch sensibilisierter sw|black (&|and|und) white|\bb&w\b|bwxx|tri-x|t-max|\bhp5\b|\bfp4\b|delta|pan f|\bapx\b|\bp30\b|\bsfx\b|xp ?2/i;
const SLIDE=/ektachrome|provia|velvia|diafilm|dia-rollfilm|\be100\b/i;
function derive(p){
 if(p.isVariant)return {format:p.format,process:p.process,iso:p.iso,filmKind:p.filmKind??''};
 if(!isFilmCategory(p))return {format:p.category==='FILMENTWICKLUNGEN'||/35mm tank/i.test(p.name)?p.format:'',process:'',iso:'',filmKind:''};
 const text=`${p.name} ${p.description}`;
 const format=/\b120\b|rollfilm|mittelformat/i.test(p.name)?'120':/135|kleinbild|35\s?mm/i.test(p.name)?'35mm':p.format;
 const chromogenicBW=/xp ?2/i.test(p.name);
 const filmKind=SLIDE.test(p.name)?'Dia':(chromogenicBW||BW.test(p.name)||BW.test(p.description.slice(0,160)))?'Schwarzweiß':'Farbe';
 const process=filmKind==='Dia'?'E-6':chromogenicBW?'C-41':filmKind==='Schwarzweiß'?'Schwarzweiß':'C-41';
 const nameIso=p.name.match(/\b(\d{2,4})\s?(?:D\b|ASA\b|T\b)/i)?.[1]||p.name.match(/\bE(\d{3})\b/)?.[1]||p.name.match(/\b(50|80|100|125|160|200|400|800|1600|3200)\b(?!\s?(ml|x))/i)?.[1];
 const descIso=text.match(/ISO\s?(\d{2,4})\/\d{2}°/)?.[1];
 const iso=nameIso||descIso||'';
 return {format,process,iso,filmKind};
}
for(const p of catalog){
 const d=derive(p);
 const before={format:p.format,process:p.process,iso:p.iso,filmKind:p.filmKind??''};
 if(before.format!==d.format||before.process!==d.process||before.iso!==d.iso||before.filmKind!==d.filmKind)changes.push({slug:p.slug,before,after:d});
 Object.assign(p,d);
}
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
fs.writeFileSync('docs/evidence/catalog-derivation-changes.json',JSON.stringify({generated:new Date().toISOString(),method:'name + first 160 characters of the source description; source fields untouched',changes},null,1)+'\n');
console.log(`${changes.length} derived-field corrections written; see docs/evidence/catalog-derivation-changes.json`);
