// Does the hero view switch resize the WebGL drawing buffer on a phone viewport? (forced WebGL tier)
import fs from 'node:fs';
import {connect, sleep} from './cdp.mjs';
const base = process.argv[2] || 'http://127.0.0.1:3199';
const b = await connect(); const pg = await b.page(); const {s, evaluate} = pg;
await s('Page.enable'); await s('Runtime.enable');
await s('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 3, mobile: true});
await s('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
await s('Page.addScriptToEvaluateOnNewDocument', {source: `window.__PROBE_OPTS__={force:true};\n${fs.readFileSync(new URL('./instrument.js', import.meta.url), 'utf8')}`});
const load = pg.waitEvent('Page.loadEventFired', 60000); await s('Page.navigate', {url: base + '/'}); await load; await sleep(300);
await evaluate(`document.querySelector('.hero-workspace').scrollIntoView({block:'center'})`);
for (let i = 0; i < 80; i++) { if (await evaluate(`document.querySelector('.hero-workspace').dataset.webgl`) === 'active') break; await sleep(250); }
const size = () => evaluate(`(()=>{const c=document.querySelector('.hero-canvas canvas');const w=document.querySelector('.hero-workspace');return {canvas:[c.width,c.height],workspace:[w.clientWidth,w.clientHeight]}})()`);
console.log('strip', JSON.stringify(await size()));
await evaluate(`document.querySelectorAll('.hero-seg-opt')[1].click()`); await sleep(400);
console.log('sheet+400ms', JSON.stringify(await size())); await sleep(2000);
console.log('sheet+2.4s', JSON.stringify(await size()));
await pg.close(); b.close();
