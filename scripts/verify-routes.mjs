import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync('docs/evidence/crawl.json'));
const source=JSON.parse(fs.readFileSync('lib/source-content.json'));
const catalog=JSON.parse(fs.readFileSync('lib/catalog.json'));
const origin=process.env.BILDERFUERST_SITE_ORIGIN||'http://127.0.0.1:3000';
const output=process.env.BILDERFUERST_QA_OUTPUT||'docs/evidence/route-qa.json';
const urls=[...new Set(['/', '/shop','/filmentwicklung','/digitalisierung','/services','/lab','/galerie','/geschichte','/kontakt','/checkout','/cart',...catalog.map(p=>'/p/'+p.slug),...Object.values(source).map(p=>new URL(p.source).pathname),...evidence.filter(p=>p.status===200&&p.url.includes('/c/')).map(p=>new URL(p.url).pathname)])];
const pending=[...urls];const result=[];
async function worker(){while(pending.length){const path=pending.shift();try{const response=await fetch(origin+path,{signal:AbortSignal.timeout(30000)});const html=await response.text();result.push({path,status:response.status,resolved:new URL(response.url).pathname,h1:(html.match(/<h1[ >]/g)||[]).length,noindex:html.includes('noindex'),hasContent:html.length>1000});}catch(error){result.push({path,error:error.message})}}}
await Promise.all([worker(),worker(),worker(),worker()]);
fs.writeFileSync(output,JSON.stringify(result,null,2));
const failures=result.filter(r=>r.status!==200||r.h1!==1||!r.noindex||!r.hasContent);
console.log(JSON.stringify({origin,routes:result.length,passed:result.length-failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
