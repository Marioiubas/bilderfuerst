import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const bin='./node_modules/.bin/agent-browser';
const resume=process.argv.includes('--resume');
const results=resume?JSON.parse(fs.readFileSync('docs/evidence/browser-qa.json')).filter(r=>r.pass):[];
const b=(...args)=>execFileSync(bin,['--session','bilderfurst-review-final',...args],{encoding:'utf8',timeout:45000}).trim();
function read(expression){const raw=b('eval',`JSON.stringify(${expression})`);const parsed=JSON.parse(raw);return typeof parsed==='string'?JSON.parse(parsed):parsed;}
function check(name,pass,detail){results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}${detail?' '+JSON.stringify(detail):''}`);}
function open(path){b('open','http://127.0.0.1:3000'+path);b('wait','--load','networkidle');b('snapshot','-i');}
function snapshot(){b('snapshot','-i');}
try{
 b('set','viewport','1280','900');
 b('errors','--clear');
 if(!resume){
 open('/filmentwicklung');
 b('eval','localStorage.removeItem("bilderfurst-review-cart")');open('/filmentwicklung');b('wait','--fn','document.querySelector(".cart-button span")?.innerText === "0"');snapshot();
 b('click','.config-options fieldset:nth-child(3) button:nth-child(2)');snapshot();
 check('35mm C-41 JPG exact price and source variant',read('document.querySelector(".config-total strong").innerText').includes('12,00'),read('document.querySelector(".config-summary .text-link").href'));
 b('click','.config-summary .primary');snapshot();b('press','Escape');
 b('click','.option-grid button:nth-child(3)');snapshot();
 check('110 excludes unavailable E-6 and Push/Pull',read('[...document.querySelectorAll(".config-options fieldset:nth-child(2) strong")].map(e=>e.innerText)').join('|')==='C-41|S/W');
 b('click','.config-options fieldset:nth-child(3) button:nth-child(3)');snapshot();
 check('110 C-41 TIFF source price',read('document.querySelector(".config-total strong").innerText').includes('30,00'));
 b('click','.config-options fieldset:nth-child(2) button:nth-child(2)');snapshot();
 check('110 B&W TIFF source price',read('document.querySelector(".config-total strong").innerText').includes('35,00'));
 b('click','.config-summary .primary');snapshot();
 check('Review cart opens with selected readable variant',read('document.querySelector("dialog[open]").innerText').includes('Filmentwicklung Pocket 110 · Schwarz-Weiß Entwicklung mit Scan (TIFF)'));
 b('scrollintoview','.cart-line:last-child .quantity button:last-child');b('click','.cart-line:last-child .quantity button:last-child');snapshot();
 check('Cart quantity updates',read('document.querySelector(".cart-line:last-child .quantity span").innerText')==='2');
 check('Review cart stores selected quantities',JSON.parse(read('localStorage.getItem("bilderfurst-review-cart")')).reduce((sum,line)=>sum+line.quantity,0)===3);
 b('click','button[aria-label="Warenkorb schließen"]');snapshot();
 b('click','.cart-button');snapshot();
 b('scrollintoview','.cart-line:last-child .remove-line');b('click','.cart-line:last-child .remove-line');snapshot();
 check('Remove cart item updates total',!read('document.querySelector("dialog[open]").innerText').includes('Pocket 110'));
 b('screenshot','docs/evidence/cart-desktop.png');b('press','Escape');
 open('/checkout');
 check('Payment disabled and no customer/payment form',read('document.querySelector(".checkout-summary button").disabled')&&read('[...document.querySelectorAll("main input, main form")].length')===0);
 b('screenshot','docs/evidence/checkout-desktop.png');
 open('/shop?q=Kodak%20400');check('Multiword catalog search finds Portra 400',read('[...document.querySelectorAll(".product-title")].some(e=>e.innerText.includes("Portra 400"))'));
 b('select','.filter-select:nth-child(2) select','120');snapshot();
 check('120 format filter narrows actual source formats',read('[...document.querySelectorAll(".product-bottom>span")].every(e=>e.innerText.includes("120"))'));
 b('screenshot','docs/evidence/shop-desktop.png');
 b('click','.filter-heading button');snapshot();
 b('focus','.price-filter input');b('press','Home');snapshot();
 check('Price filter excludes positive-price products at zero',read('document.querySelectorAll(".product-card").length')===0);
 b('focus','.filter-heading button');snapshot();b('click','.filter-heading button');b('wait','--fn','document.querySelectorAll(".product-card").length > 90');snapshot();
 }
 check('Reset restores catalog',read('document.querySelectorAll(".product-card").length')===107);
 open('/p/cinestill-400d-36-135-kleinbildfilm');check('Unavailable product cannot be added',read('document.querySelector(".pdp-actions .primary").disabled'));
 open('/p/pentax-17');b('click','.zoom-button');snapshot();check('Lens alternative accessible lightbox opens',read('!!document.querySelector(".image-dialog[open]")'));b('press','Escape');
 b('click','button[aria-label="Produkte suchen"]');snapshot();b('fill','.search-input input','Portra 400');snapshot();check('Search dialog returns actual products',read('[...document.querySelectorAll(".search-results strong")].some(e=>e.innerText.includes("Portra 400"))'));b('press','Escape');
 for(const [path,name] of [['/','home'],['/shop','shop'],['/filmentwicklung','film-config'],['/digitalisierung','digitization'],['/i/fineart-prints','fineart'],['/services','services'],['/geschichte','history'],['/galerie','gallery'],['/kontakt','contact'],['/lab','lab'],['/p/pentax-17','product']]){
  b('set','viewport','1280','900');open(path);b('eval','[...document.images].forEach(image => image.loading = "eager")');b('wait','--load','networkidle');
  const status=read('({h1:document.querySelectorAll("h1").length,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length})');check(`${name} desktop render`,status.h1===1&&!status.overflow&&!status.broken,status);b('screenshot',`docs/evidence/${name}-desktop.png`);
  b('set','viewport','390','844');snapshot();check(`${name} mobile overflow`,!read('document.documentElement.scrollWidth>innerWidth'));b('screenshot',`docs/evidence/${name}-mobile.png`);
 }
 b('set','viewport','1280','900');open('/');
 check('Desktop one active WebGL scene',read('document.querySelectorAll("canvas").length')===1);
 b('scroll','down','1300');b('wait','--fn','document.querySelectorAll("canvas").length === 0');snapshot();check('Vanta destroyed after hero leaves viewport',read('document.querySelectorAll("canvas").length')===0);
 b('set','media','reduced-motion');open('/');check('Reduced motion visible, zero WebGL scenes',read('document.querySelectorAll("canvas").length')===0&&read('getComputedStyle(document.querySelector("h1")).opacity')==='1');
 b('focus','input[aria-label="Entwickleraufnahmen vergleichen"]');b('press','ArrowRight');snapshot();check('Compare has keyboard-operable range',read(`document.querySelector('input[aria-label="Entwickleraufnahmen vergleichen"]').value`)==='51');
 b('set','media','light');
 for(const width of [360,375,390,430,768,1024,1280,1440]){b('set','viewport',String(width),'900');open('/');check(`Homepage width ${width}`,!read('document.documentElement.scrollWidth>innerWidth'));}
 b('set','viewport','390','844');open('/');b('click','button[aria-label="Menü öffnen"]');snapshot();check('Mobile navigation opens',read('!!document.querySelector(".mobile-nav-dialog[open]")'));b('press','Escape');
 b('set','viewport','1280','900');open('/');b('click','.hero-visual-bottom button');snapshot();check('Anime contact-sheet arrangement toggles',read('document.querySelector(".hero-visual-bottom button").getAttribute("aria-pressed")')==='true');
 b('click','.hero-visual-bottom button');b('eval','[...document.images].forEach(image => image.loading = "eager"); document.activeElement.blur()');b('wait','--load','networkidle');b('screenshot','--full','docs/evidence/home-desktop-full.png');
 const errors=b('errors');check('No captured browser errors',errors==='',errors);b('set','viewport','1280','720');
}catch(error){check('QA execution',false,error.message);}
fs.writeFileSync('docs/evidence/browser-qa.json',JSON.stringify(results,null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
