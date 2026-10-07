// Mobile WebGL probe: emulated phone viewport + touch + CPU throttling over CDP, optional forcing of the
// WebGL tier, WebGL counters, rAF cadence and long tasks per animation window.
// Usage: node scripts/perf/webgl-probe.mjs --scenario hero|gallery [--cpu 4] [--force true|kw1,kw2] [--block vanta]
//        [--dpr 3] [--w 390] [--h 844] [--base http://127.0.0.1:3107] [--port 9871] [--json out.json]
//        [--desktop] (no mobile/touch/UA emulation, e.g. --w 1440 --h 900 --dpr 2) [--summary] (one-line digest only)
// Needs a Chrome with --remote-debugging-port (scripts/perf/chrome.sh).
import fs from 'node:fs';
import {connect, sleep} from './cdp.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? 'true' : all[i + 1]]] : a), []));
const scenario = args.scenario || 'hero', cpu = +(args.cpu || 1), dpr = +(args.dpr || 3), W = +(args.w || 390), H = +(args.h || 844);
const base = args.base || 'http://127.0.0.1:3107';
const force = args.force === undefined ? false : args.force === 'true' ? true : args.force.split(',');
const instrument = fs.readFileSync(new URL('./instrument.js', import.meta.url), 'utf8');

const pct = (arr, p) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return +s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))].toFixed(1); };
function windowStats(frames, from, to) {
  const f = frames.filter(([t]) => t >= from && t <= to); const dt = f.map((x) => x[1]); const cb = f.map((x) => x[2]); const dr = f.map((x) => x[3]).filter((d) => d > 0);
  return {n: f.length, ms: Math.round(to - from), fps: +(f.length / ((to - from) / 1000)).toFixed(1), dtP50: pct(dt, 50), dtP95: pct(dt, 95), dtMax: pct(dt, 100), over25: dt.filter((d) => d > 25).length, over34: dt.filter((d) => d > 34).length, cbP50: pct(cb, 50), cbP95: pct(cb, 95), cbMax: pct(cb, 100), framesWithDraws: dr.length, drawsMax: Math.max(0, ...dr), drawsP50: pct(dr, 50)};
}

const b = await connect(+(args.port || 9871));
const pg = await b.page();
const {s, evaluate} = pg;
try {
  await s('Page.enable'); await s('Runtime.enable');
  var errors = []; b.on((m) => { if (m.sessionId !== pg.sessionId) return; if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 240)); if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 240)); });
  const desktop = !!args.desktop;
  await s('Emulation.setDeviceMetricsOverride', {width: W, height: H, deviceScaleFactor: dpr, mobile: !desktop});
  if (!desktop) {
    await s('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
    await s('Emulation.setUserAgentOverride', {userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'});
  }
  if (args.block) {
    const pats = args.block.split(',');
    await s('Fetch.enable', {patterns: pats.map((p) => ({urlPattern: `*${p}*`}))});
    b.on((m) => { if (m.sessionId === pg.sessionId && m.method === 'Fetch.requestPaused') s('Fetch.failRequest', {requestId: m.params.requestId, errorReason: 'BlockedByClient'}).catch(() => {}); });
  }
  // every run starts without a remembered frame-guard give-up (the probe profile keeps localStorage between runs)
  await s('Page.addScriptToEvaluateOnNewDocument', {source: `try{localStorage.removeItem('bf-webgl-lite-off')}catch(e){}`});
  await s('Page.addScriptToEvaluateOnNewDocument', {source: `window.__PROBE_OPTS__=${JSON.stringify({force, logStacks: !!args.stacks, gpuSync: !!args.gpu, ctxAttrs: args.aa === 'off' ? {antialias: false} : null})};\n${instrument}`});
  await s('Emulation.setCPUThrottlingRate', {rate: cpu});
  const path = scenario === 'gallery' ? '/galerie' : '/';
  const load = pg.waitEvent('Page.loadEventFired', 60000);
  const t0 = Date.now();
  await s('Page.navigate', {url: base + path});
  await load; const loadMs = Date.now() - t0;
  await sleep(400);
  if (args.css) await evaluate(`(()=>{const st=document.createElement('style');st.textContent=${JSON.stringify(args.css)};document.head.appendChild(st);return true})()`);
  const sel = scenario === 'gallery' ? '.gal-stage' : '.hero-workspace';
  if (args.profile && !['sheet', 'scroll'].includes(args.profile)) { await s('Profiler.enable'); await s('Profiler.setSamplingInterval', {interval: 400}); await s('Profiler.start'); }
  await evaluate(`document.querySelector('${sel}')?.scrollIntoView({block:'center'});window.__probe.mark('scrolled');true`);
  // wait for the scene to become active (or fail / stay static)
  let state = 'static', waited = 0;
  while (waited < 30000) { state = await evaluate(`document.querySelector('${sel}')?.dataset.webgl`); if (state === 'active' || state === 'failed') break; await sleep(250); waited += 250; }
  await evaluate(`window.__probe.mark('active')`);
  let profile = null;
  const summarize = async () => {
    // self time per function (incl. native WebGL calls such as getProgramParameter / texImage2D)
    if (args.profile === 'full') await sleep(2600);
    const {profile: pr} = await s('Profiler.stop');
    const self = new Map(); const byId = new Map(pr.nodes.map((n) => [n.id, n]));
    pr.samples.forEach((id, k) => { const n = byId.get(id); const cf = n.callFrame; const key = `${cf.functionName || '(anon)'} ${(cf.url || '').split('/').pop().slice(0, 40)}:${cf.lineNumber}`; self.set(key, (self.get(key) || 0) + (pr.timeDeltas[k] || 0) / 1000); });
    profile = [...self.entries()].filter(([k]) => !k.startsWith('(idle)') && !k.startsWith('(program)')).sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => `${v.toFixed(0)}ms ${k}`);
    profile.unshift(`program+idle: ${[...self.entries()].filter(([k]) => k.startsWith('(idle)') || k.startsWith('(program)')).map(([k, v]) => k.split(' ')[0] + '=' + v.toFixed(0)).join(' ')}`);
  };
  if (args.profile && !['sheet', 'scroll'].includes(args.profile)) await summarize();
  const startProfile = async (w) => { if (args.profile === w) { await s('Profiler.enable'); await s('Profiler.setSamplingInterval', {interval: 400}); await s('Profiler.start'); } };
  const stopProfile = async (w) => { if (args.profile === w) await summarize(); };
  const windows = {};
  if (state === 'active') {
    if (scenario === 'hero') {
      await sleep(2600); await evaluate(`window.__probe.mark('introEnd')`);
      await startProfile('sheet');
      await evaluate(`[...document.querySelectorAll('.hero-seg-opt')][1].click();window.__probe.mark('sheet')`);
      await sleep(2600); await evaluate(`window.__probe.mark('sheetEnd')`);
      await stopProfile('sheet');
      await evaluate(`[...document.querySelectorAll('.hero-seg-opt')][0].click();window.__probe.mark('strip')`);
      await sleep(2000); await evaluate(`window.__probe.mark('stripEnd')`);
      await sleep(1500); await evaluate(`window.__probe.mark('idleEnd')`);
    } else {
      await sleep(1600); await evaluate(`window.__probe.mark('introEnd')`);
      await startProfile('scroll');
      await evaluate(`window.__probe.mark('scroll')`);
      await s('Input.synthesizeScrollGesture', {x: Math.round(W / 2), y: Math.round(H * .7), yDistance: -500, speed: 600, gestureSourceType: 'touch'});
      await sleep(1200); await evaluate(`window.__probe.mark('scrollEnd')`);
      await stopProfile('scroll');
      await sleep(1500); await evaluate(`window.__probe.mark('idleEnd')`);
    }
  }
  const P = await evaluate(`({frames:__probe.frames,longtasks:__probe.longtasks,states:__probe.states,marks:__probe.marks,ctx:__probe.snapshot(),gpu:__probe.gpu,canvases:__probe.canvases(),stacks:__probe.stacks,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null})`);
  const m = P.marks; const st = P.states;
  const target = scenario === 'gallery' ? 'gal-stage' : 'hero-workspace';
  const tLoading = st.find(([, c, v]) => c === target && v === 'loading')?.[0], tActive = st.find(([, c, v]) => c === target && v === 'active')?.[0];
  const lt = (a, z) => P.longtasks.filter(([t]) => t >= a && t <= z);
  const res = {scenario, cpu, dpr, viewport: [W, H], force, block: args.block || null, loadMs, state,
    mount: tLoading && tActive ? {loadingAt: tLoading, activeAt: tActive, mountMs: tActive - tLoading, longTasks: lt(tLoading, tActive), longTaskSum: lt(tLoading, tActive).reduce((a, [, d]) => a + d, 0)} : null,
    scrolledToActive: tActive && m.scrolled ? tActive - m.scrolled : null,
    contexts: P.ctx, canvases: P.canvases, heapMB: P.heap, statesSeen: st.map(([t, c, v]) => `${t}:${c}=${v}`).slice(0, 12),
    totalLongTasks: P.longtasks.length, stacks: P.stacks, errors: errors.slice(0, 8), profile, title: await evaluate('document.title')};
  if (state === 'active') {
    const introFrom = tActive ?? m.active;
    if (scenario === 'hero') Object.assign(windows, {intro: windowStats(P.frames, introFrom, m.introEnd), sheet: windowStats(P.frames, m.sheet, m.sheetEnd), strip: windowStats(P.frames, m.strip, m.stripEnd), idle: windowStats(P.frames, m.stripEnd, m.idleEnd)});
    else Object.assign(windows, {intro: windowStats(P.frames, introFrom, m.introEnd), scroll: windowStats(P.frames, m.scroll, m.scrollEnd), idle: windowStats(P.frames, m.scrollEnd, m.idleEnd)});
    res.windows = windows;
    if (args.gpu) { const g = (a, z) => P.gpu.filter(([t]) => t >= a && t <= z); const gs = (a, z) => { const x = g(a, z); return {n: x.length, syncP50: pct(x.map((r) => r[1]), 50), syncP95: pct(x.map((r) => r[1]), 95), cbGpuP50: pct(x.map((r) => r[2]), 50), cbGpuP95: pct(x.map((r) => r[2]), 95), cbGpuMax: pct(x.map((r) => r[2]), 100)}; };
      res.gpuWindows = scenario === 'hero' ? {intro: gs(m.active, m.introEnd), sheet: gs(m.sheet, m.sheetEnd), strip: gs(m.strip, m.stripEnd)} : {intro: gs(m.active, m.introEnd), scroll: gs(m.scroll, m.scrollEnd)}; }
    res.longTasksAfterActive = lt(m.active, m.idleEnd);
  }
  if (args.gpu) {
    // readPixels round-trip baseline on a trivial context of the same size (subtract from syncP50)
    res.syncBaseline = await evaluate(`(async()=>{const c=document.createElement('canvas');c.__probeCal=1;const src=[...document.querySelectorAll('canvas')].pop();c.width=src?.width||585;c.height=src?.height||457;const gl=c.getContext('webgl2',{antialias:true});const px=new Uint8Array(4);const t=[];for(let i=0;i<24;i++){await new Promise(r=>requestAnimationFrame(r));const a=performance.now();gl.clearColor(Math.random(),0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);t.push(performance.now()-a)}gl.getExtension('WEBGL_lose_context')?.loseContext();t.sort((a,b)=>a-b);return {p50:+t[12].toFixed(2),p95:+t[22].toFixed(2)}})()`);
  }
  if (args.json) fs.writeFileSync(args.json, JSON.stringify({...res, frames: P.frames}, null, 1));
  // one-line digest: mount (loading→active) and its longest task, intro frames drawn, GPU-side counters, view-switch tasks
  // the scene's context = the one with the most linked programs (Vanta has one)
  const c = [...(res.contexts || [])].sort((x, y) => y.programs - x.programs)[0] || {};
  const w = res.windows || {}; const maxLt = (a) => Math.max(0, ...(a || []).map(([, d]) => d));
  const sw = (n) => (m[n] && m[n + 'End'] ? lt(m[n], m[n + 'End']) : []);
  res.summary = {state, mountMs: res.mount?.mountMs ?? null, mountLongest: maxLt(res.mount?.longTasks), mountLongSum: res.mount?.longTaskSum ?? null,
    introDrawn: w.intro?.framesWithDraws ?? null, introP95: w.intro?.dtP95 ?? null, texMB: c.texMB, liveTex: c.liveTextures, programs: c.programs, drawsP50: w.intro?.drawsP50,
    canvas: (res.canvases || []).filter((x) => /hero-canvas|gal-canvas|webgl-host/.test(x.cls || '')).map((x) => `${x.w}x${x.h}`).join(','),
    guardGaveUp: !!(await evaluate(`localStorage.getItem('bf-webgl-lite-off')`)), finalState: await evaluate(`document.querySelector('${sel}')?.dataset.webgl`),
    sheetLongest: maxLt(sw('sheet')), stripLongest: maxLt(sw('strip')), sheetP95: w.sheet?.dtP95, sheetOver34: w.sheet?.over34, scrollP95: w.scroll?.dtP95, idleDraws: w.idle?.framesWithDraws, errors: res.errors.length};
  console.log(args.summary ? JSON.stringify({scenario, cpu, desktop, ...res.summary}) : JSON.stringify(res, null, 1));
} finally { await pg.close().catch(() => {}); b.close(); }
