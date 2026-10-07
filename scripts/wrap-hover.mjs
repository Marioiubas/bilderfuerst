// Moves :hover selectors of a stylesheet into @media (hover:hover) so touch devices don't keep
// a "stuck" hover state after a tap (docs/DEVICE-QA.md D4). Non-hover selectors stay in place.
// Usage: node scripts/wrap-hover.mjs app/styles/<file>.css   (idempotent)
import fs from 'node:fs';
import postcss from 'postcss';
const file=process.argv[2];
const root=postcss.parse(fs.readFileSync(file,'utf8'));
const inHoverMedia=n=>{for(let p=n.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media'&&/hover\s*:\s*hover/.test(p.params))return true;return false};
let moved=0;
root.walkRules(rule=>{
 if(!rule.selector.includes(':hover')||inHoverMedia(rule))return;
 if(rule.parent.type==='atrule'&&rule.parent.name==='keyframes')return;
 const sels=rule.selectors;const hover=sels.filter(s=>s.includes(':hover'));const rest=sels.filter(s=>!s.includes(':hover'));
 const media=postcss.atRule({name:'media',params:'(hover:hover)'});
 media.append(rule.clone({selectors:hover}));
 rule.after(media);
 if(rest.length)rule.selectors=rest;else rule.remove();
 moved+=hover.length;
});
fs.writeFileSync(file,root.toString().replaceAll('@media (hover:hover){\n.','@media (hover:hover){.'));
console.log(`${file}: ${moved} hover selectors wrapped`);
