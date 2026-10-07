// Page-side instrumentation injected before any page script (Page.addScriptToEvaluateOnNewDocument).
// Expects `__PROBE_OPTS__` = {force:boolean|string[], logStacks:boolean}. Read back via window.__probe.
(() => {
  const O = window.__PROBE_OPTS__ || {};
  const now = () => performance.now();
  const P = (window.__probe = {opts: O, frames: [], cbs: [], longtasks: [], states: [], ctxs: [], stacks: [], marks: {}});

  // ── 1. Optional tier forcing: answer the desktop query with "true" (scoped by call-stack keywords). ──
  if (O.force) {
    const mm = window.matchMedia.bind(window);
    window.matchMedia = function (q) {
      if (typeof q === 'string' && q.includes('(min-width: 1024px) and (pointer: fine)')) {
        const st = new Error().stack || '';
        if (O.logStacks && P.stacks.length < 12) P.stacks.push(st.split('\n').slice(1, 6).join(' | '));
        const hit = O.force === true || O.force.some((k) => st.includes(k));
        if (hit) return mm('(min-width: 0px)');
      }
      return mm(q);
    };
  }

  // ── 1b. Optional context-attribute override (e.g. antialias:false) to A/B MSAA cost without code changes. ──
  if (O.ctxAttrs) {
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) { if (/webgl/.test(type) && !this.__probeCal) attrs = {...(attrs || {}), ...O.ctxAttrs}; return gc.call(this, type, attrs); };
  }

  // ── 2. rAF cadence + callback cost (all callbacks: Anime engine, scene ticks, React, Motion). ──
  const raf = window.requestAnimationFrame.bind(window);
  let frameDraws = 0, frameCbMs = 0, lastFrame = 0, totalDraws = 0, lastInfo = null; P.gpu = []; const px = new Uint8Array(4);
  window.requestAnimationFrame = function (cb) {
    return raf((t) => {
      const a = now(), before = totalDraws;
      try { cb(t); } finally {
        // optional: force GPU completion of the frame just submitted (1-px readPixels) to time CPU+GPU
        if (O.gpuSync && totalDraws > before && lastInfo) { const g = now(); try { lastInfo.gl.readPixels(0, 0, 1, 1, 6408, 5121, px); } catch {} P.gpu.push([+(now()).toFixed(0), +(now() - g).toFixed(2), +(now() - a).toFixed(2), totalDraws - before]); }
        frameCbMs += now() - a;
      }
    });
  };
  const loop = () => {
    const t = now();
    if (lastFrame) P.frames.push([+(t).toFixed(1), +(t - lastFrame).toFixed(2), +frameCbMs.toFixed(2), frameDraws]);
    lastFrame = t; frameCbMs = 0; frameDraws = 0; raf(loop);
  };
  raf(loop);

  // ── 3. Long tasks. ──
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => P.longtasks.push([+e.startTime.toFixed(0), +e.duration.toFixed(0)]))).observe({type: 'longtask', buffered: true}); } catch {}

  // ── 4. data-webgl state transitions (scene lifecycle + time to first 3D frame). ──
  const mo = new MutationObserver((ms) => ms.forEach((m) => {
    const el = m.target; const v = el.getAttribute('data-webgl');
    P.states.push([+now().toFixed(0), (el.className && String(el.className).split(' ')[0]) || el.tagName, v]);
  }));
  document.addEventListener('DOMContentLoaded', () => mo.observe(document.documentElement, {subtree: true, attributes: true, attributeFilter: ['data-webgl']}));

  // ── 5. WebGL counters per context: draws, textures (estimated bytes), buffers, programs, RBOs. ──
  const ctxInfo = new Map();
  const bpp = (fmt, type) => {
    // rough bytes per texel by internal format / type
    const G = WebGL2RenderingContext;
    if (type === G.FLOAT || fmt === G.RGBA32F) return 16; if (type === G.HALF_FLOAT || fmt === G.RGBA16F) return 8;
    if (fmt === G.DEPTH24_STENCIL8 || fmt === G.DEPTH_COMPONENT24 || fmt === G.DEPTH_COMPONENT32F || fmt === G.DEPTH_COMPONENT) return 4;
    if (fmt === G.RGB || fmt === G.RGB8 || fmt === G.SRGB8) return 4; return 4;
  };
  function info(gl) {
    let i = ctxInfo.get(gl);
    if (!i) {
      const c = gl.canvas; i = {gl, id: P.ctxs.length, created: +now().toFixed(0), canvasClass: c.parentElement?.className || '', attrs: gl.getContextAttributes(), draws: 0, tris: 0, texBytes: 0, texCount: 0, texMax: [0, 0], texList: [], bufBytes: 0, programs: 0, shaders: 0, rboBytes: 0, mips: 0, lost: false, bound: new Map(), unit: 0, sizes: new Map(), live: new Set()};
      ctxInfo.set(gl, i); P.ctxs.push(i);
      c.addEventListener('webglcontextlost', () => { i.lost = true; });
      try { const d = gl.getExtension('WEBGL_debug_renderer_info'); i.gpu = d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); i.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE); } catch {}
    }
    return i;
  }
  const wrap = (proto, name, fn) => { const orig = proto[name]; if (!orig) return; proto[name] = function (...a) { fn.call(this, info(this), a); return orig.apply(this, a); }; };
  for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const drawCount = (mode, count, inst = 1) => (mode === 4 ? count / 3 : mode === 5 || mode === 6 ? Math.max(0, count - 2) : 0) * inst;
    wrap(proto, 'drawElements', (i, a) => { i.draws++; frameDraws++; totalDraws++; lastInfo = i; i.tris += drawCount(a[0], a[1]); });
    wrap(proto, 'drawArrays', (i, a) => { i.draws++; frameDraws++; totalDraws++; lastInfo = i; i.tris += drawCount(a[0], a[2]); });
    wrap(proto, 'drawElementsInstanced', (i, a) => { i.draws++; frameDraws++; totalDraws++; lastInfo = i; i.tris += drawCount(a[0], a[1], a[4]); });
    wrap(proto, 'drawArraysInstanced', (i, a) => { i.draws++; frameDraws++; totalDraws++; lastInfo = i; i.tris += drawCount(a[0], a[2], a[3]); });
    wrap(proto, 'activeTexture', (i, a) => { i.unit = a[0]; });
    wrap(proto, 'bindTexture', (i, a) => { i.bound.set(i.unit + ':' + a[0], a[1]); });
    const texSize = (i, target, w, h, bytes, levels = 1) => {
      const face = target >= 0x8515 && target <= 0x851A;
      const tex = i.bound.get(i.unit + ':' + (face ? 0x8513 : target));
      const base = w * h * bytes;
      if (tex) { const rec = i.sizes.get(tex) || {base: 0, mip: levels > 1, faces: 0}; if (face) { rec.base += base; rec.faces++; } else rec.base = base; if (levels > 1) rec.mip = true; i.sizes.set(tex, rec); i.live.add(tex); }
      i.texCount++; if (w * h > i.texMax[0] * i.texMax[1]) i.texMax = [w, h];
      if (i.texList.length < 60) i.texList.push(`${w}x${h}${levels > 1 ? 'm' : ''}`);
    };
    wrap(proto, 'texImage2D', (i, a) => {
      if (a[1] !== 0) return; let w, h;
      if (a.length >= 8) { w = a[3]; h = a[4]; } else { const src = a[5]; w = src.width || src.naturalWidth || src.videoWidth; h = src.height || src.naturalHeight || src.videoHeight; }
      texSize(i, a[0], w, h, bpp(a[2], a.length >= 8 ? a[7] : a[4]));
    });
    wrap(proto, 'texStorage2D', (i, a) => texSize(i, a[0], a[3], a[4], bpp(a[2]), a[1]));
    wrap(proto, 'compressedTexImage2D', (i, a) => { if (a[1] === 0) texSize(i, a[0], a[3], a[4], 1); });
    wrap(proto, 'generateMipmap', (i, a) => { i.mips++; const tex = i.bound.get(i.unit + ':' + a[0]); const r = tex && i.sizes.get(tex); if (r) r.mip = true; });
    wrap(proto, 'deleteTexture', (i, a) => { i.sizes.delete(a[0]); i.live.delete(a[0]); });
    wrap(proto, 'createTexture', (i) => { i.texCreated = (i.texCreated || 0) + 1; });
    wrap(proto, 'bufferData', (i, a) => { const d = a[1]; i.bufBytes += typeof d === 'number' ? d : d?.byteLength || 0; });
    wrap(proto, 'linkProgram', (i) => { i.programs++; });
    wrap(proto, 'compileShader', (i) => { i.shaders++; });
    wrap(proto, 'renderbufferStorage', (i, a) => { i.rboBytes += a[2] * a[3] * 4; });
    wrap(proto, 'renderbufferStorageMultisample', (i, a) => { i.rboBytes += a[3] * a[4] * 4 * Math.max(1, a[1]); });
  }
  P.snapshot = () => P.ctxs.map(({gl, bound, sizes, live, texList, ...rest}) => ({...rest, texBytes: [...sizes.values()].reduce((a, r) => a + r.base * (r.mip ? 4 / 3 : 1), 0), liveTextures: sizes.size, texList: texList.join(' '), texMB: +([...sizes.values()].reduce((a, r) => a + r.base * (r.mip ? 4 / 3 : 1), 0) / 1048576).toFixed(1), bufKB: +(rest.bufBytes / 1024).toFixed(0), rboMB: +(rest.rboBytes / 1048576).toFixed(1)}));
  P.canvases = () => [...document.querySelectorAll('canvas')].map((c) => ({cls: c.parentElement?.className, w: c.width, h: c.height, css: [c.clientWidth, c.clientHeight]}));
  P.mark = (k) => { P.marks[k] = +now().toFixed(0); };
})();
