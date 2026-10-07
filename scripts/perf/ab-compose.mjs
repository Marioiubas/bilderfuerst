// Final A/B (brief §86): OLD | CURRENT-BEFORE-POLISH | NEW-POLISH fold composites.
// OLD and CURRENT panels are cut from docs/evidence/final-audit/compare/<name>-fold.jpg (A | B | C layout,
// 14 px gutters, 52 px label band); NEW comes from a fresh capture passed on the command line.
// Usage: node scripts/perf/ab-compose.mjs <name> <new.png> <label>
import sharp from 'sharp';
const [name,fresh,label='NEW-POLISH']=process.argv.slice(2);
const src=`docs/evidence/final-audit/compare/${name}-fold.jpg`;
const meta=await sharp(src).metadata();
const panel=Math.round((meta.width-28)/3),band=52,h=meta.height-band;
const cut=x=>sharp(src).extract({left:x,top:band,width:panel,height:h}).toBuffer();
const oldP=await cut(0),curP=await cut(meta.width-panel);
const newP=await sharp(fresh).resize({width:panel}).extract({left:0,top:0,width:panel,height:h}).toBuffer().catch(async()=>sharp(fresh).resize({width:panel,height:h,fit:'cover',position:'top'}).toBuffer());
const W=panel*3+28;
const head=(x,t,c)=>`<rect x="${x}" y="0" width="${panel}" height="${band}" fill="${c}"/><text x="${x+10}" y="32" font-family="Helvetica" font-size="${panel>500?20:15}" font-weight="700" fill="#fff">${t}</text>`;
const svg=Buffer.from(`<svg width="${W}" height="${band}" xmlns="http://www.w3.org/2000/svg">${head(0,'A · OLD','#6b5a2e')}${head(panel+14,'B · CURRENT before polish (496841c)','#1f4e79')}${head(2*panel+28,`C · ${label}`,'#7a1f16')}</svg>`);
await sharp({create:{width:W,height:h+band,channels:3,background:'#9a9a9a'}})
 .composite([{input:svg,left:0,top:0},{input:oldP,left:0,top:band},{input:curP,left:panel+14,top:band},{input:newP,left:2*panel+28,top:band}])
 .jpeg({quality:72}).toFile(`docs/evidence/final-polish/${name}-ab.jpg`);
console.log('wrote',`docs/evidence/final-polish/${name}-ab.jpg`);
