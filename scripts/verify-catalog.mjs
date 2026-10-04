import fs from 'node:fs';
import assert from 'node:assert/strict';
const catalog=JSON.parse(fs.readFileSync('lib/catalog.json'));
const source=JSON.parse(fs.readFileSync('docs/evidence/catalog-raw.json'));
const masters=catalog.filter(p=>!p.isVariant);
assert.equal(masters.length,109,'All 109 source products must remain available');
assert.equal(new Set(catalog.map(p=>p.slug)).size,catalog.length,'Unique slugs');
for(const product of catalog){
 const original=source[product.slug];assert.ok(original,product.slug);
 assert.equal(product.id,original.productId,`Original product ID: ${product.slug}`);
 assert.equal(product.price,(original.price||original.lowestPrice).amount,`Original price: ${product.slug}`);
 assert.equal(product.source,`https://www.photostudio.de/p/${product.slug}`);
 assert.equal(product.inStock,original.availabilityText==='Auf Lager');
 for(const image of product.images)assert.ok(fs.existsSync(`public${image}`),image);
 if(product.isVariant){assert.ok(product.optionLabel,product.slug);assert.equal(product.name.split(' · ').length,2,'Variant label must occur once');}
 for(const variant of product.isMaster?product.variants:[]){const child=catalog.find(p=>p.slug===variant.slug);assert.ok(child,`Missing source variant ${variant.slug}`);assert.equal(child.masterSlug,product.slug);}
}
const checks=[['filmentwicklung-kleinbild-c-41-entwicklung-mit-large-scan-jpg',12],['filmentwicklung-kleinbild-e-6-entwicklung-mit-large-scan-tiff',23.5],['filmentwicklung-pocket-110-schwarz-weiss-entwicklung-mit-scan-tiff',35],['kodak-portra-400-135-36-film',20],['pentax-17',549]];
for(const [slug,price] of checks)assert.equal(catalog.find(p=>p.slug===slug).price,price);
console.log(`PASS: ${masters.length} master products, ${catalog.length-masters.length} variants; prices, IDs, availability, variant labels, source URLs and every product asset match evidence.`);
