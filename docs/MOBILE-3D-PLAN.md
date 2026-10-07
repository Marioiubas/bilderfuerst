# Mobile 3D plan · hero film workspace + street-gallery window on phones

Status: Phase 1 (research · measurement · plan). No app code changed. Date 2026-10-07.
Goal: both WebGL scenes render on phones **without lag** and **without removing any animation** (hero intro,
strip ⇄ contact-sheet transition + grease pencil, gallery light-up, scroll dolly). Vanta stays desktop-only.

## 0 · Verdict in one paragraph

The scenes are small (13–26 draw calls, ≤ 5.4k tris), so draw calls and triangles are not the problem. What breaks a
phone today is (1) **one 1–3 s main-thread task while the hero mounts** (shader compile/link ~0.56 s, texture uploads ~0.35 s,
runtime `EdgesGeometry` ~0.29 s, GLB parse ~0.14 s at 4× CPU). That task also **swallows the 1.4 s intro**: the Anime timeline
starts before the blocking first render, so only 6–20 of ~83 intro frames are drawn. (2) **~58 MiB of GPU textures plus
~9 MiB of framebuffer** for one hero canvas. That is an iOS memory risk. (3) **A canvas reallocation at every view switch** on
phone layouts: the workspace grows from 305 to 717 CSS px, so the canvas goes from 585×457 to 585×1075, with a 150–270 ms
long task. The fix is a "lite" profile: smaller and baked assets, no shadow map or big PMREM, time-sliced mount with
`compileAsync`, the intro started only after the first presented frame, a fixed phone stage and DPR ≤ 1.5. On top of that,
capability gating and a frame-time guard that falls back to the existing DOM animations, which never removes an animation.

## 1 · Measurements

**Method.** Headless Chrome 154 (ANGLE/Metal, Apple M4) driven over CDP by `scripts/perf/webgl-probe.mjs`. Settings:
390×844, DPR 3, `mobile:true`, touch emulation, Android UA, `Emulation.setCPUThrottlingRate` 1×/4×/6×.

How the scenes were forced on and measured:
* WebGL tier: `instrument.js` answers the desktop media query with "true". In dev this is scoped to `useWebGLScene` by call stack. In prod it applies to the whole page, with the Vanta chunk blocked.
* WebGL counters wrap the context prototype: draws, triangles, textures (bytes incl. mips), buffers, programs.
* Also recorded: rAF cadence and per-frame callback cost, long tasks, and `data-webgl` transitions.
* Windows measured: intro (active + 2.6 s), sheet (click + 2.6 s), strip (click + 2.0 s), gallery scroll (500 px touch fling), idle (1.5 s).

**Builds.**
* **prod** = `next start` on the 06:15 build: hero with **v1 GLB** (18.8k tris, 551 KB), current gallery code.
* **dev** = `next dev`: hero with **v2 GLB** (5.4k tris).

**Caveats.** Machine load average was 12–30 during the runs (Blender bakes in parallel), so values are medians of 3 where
given. GPU time could **not** be isolated: the readPixels-sync baseline was 1.4–5.8 ms, noisier than the signal. All GPU
numbers for phones below are **estimates**.

### Hero (`film-workspace.ts`), forced on a 390-wide phone layout

| metric | value |
|---|---|
| canvas | 585×457 px (CSS 390×305, DPR capped 1.5), MSAA on; **sheet view: 585×1075** (workspace 305→717 CSS px) |
| draw calls per animated frame | 23–26 (incl. PCF shadow pass); idle 0 (render-on-demand works) |
| shader programs | 19 (Standard ×n, film variants, depth/shadow, PMREM, lines, basic) |
| live textures / GPU estimate | 17 / **57.9 MiB**, broken down below |
| framebuffer estimate | ≈ 9 MiB (585×457 × MSAA4 colour+depth); ≈ 21 MiB in sheet view |
| mount (loading→active), prod 4× | median **2.8 s** (1.5–3.2), longest task **≈ 2.0 s** (1.2–2.1) |
| mount, prod 6× | 3.5 s, longest task 2.0 s |
| mount, dev v2 1× | 1.0–1.1 s, longest task 0.62–0.73 s; one first-ever run: 12.9 s with an 11.5 s task (cold shader/ANGLE cache; not reproduced) |
| mount profile, prod 4× (self time) | getProgramInfoLog + shader calls ≈ 0.56 s · texSubImage2D ≈ 0.35 s · EdgesGeometry ≈ 0.29 s · GLTF parse ≈ 0.14 s |
| intro (~1.38 s ≈ 83 frames) | **6–20 frames drawn** at 4× prod; 2–12 in dev at 4×/6× → most of the intro is skipped |
| sheet transition, 4× (3 runs) | 52–56 fps, p95 23–33 ms, 3–5 frames > 34 ms, JS/frame p50 1.1 ms · p95 9–12 ms |
| sheet transition, 6× | 50–52 fps, p95 39–47 ms, 8–9 frames > 34 ms, JS p95 17 ms |
| long task at each view switch | 150–270 ms at 4× (profile: `renderer.setSize` ← ResizeObserver, plus React flushSync) |
| JS chunks (prod, gzip) | three core 179 KB (720 KB raw, namespace import) · GLTFLoader 19 KB · film-workspace + RoomEnvironment 17 KB |

Texture breakdown (RGBA8 + mips unless noted):
* PMREM: 2 × 768×1024 half-float = 12 MiB. The ping-pong target is kept until `destroy`.
* Shadow targets: 2 × 1024² = 8 MiB.
* GLB base/ORM/normal: 3 × 1024² = 16 MiB.
* Strip 4096×256: 5.3 MiB.
* Photo atlas 2048×684: 7.1 MiB.
* Paper 1400×723: 5.2 MiB.
* Glass 1024×512: 2.7 MiB.
* Pencil 512×384: 1.0 MiB.
* Radials: 0.7 MiB.

### Gallery (`gallery-window.ts`, current procedural build), forced on a phone

| metric | value |
|---|---|
| canvas / draws / programs | 585×414 · 10 draws/frame · 8 programs; idle 0 draws |
| textures | 8 live, **13.8 MiB** (photo atlas 2048×1152 + mips ≈ 12 MiB) |
| mount, prod 4× | 1.1 s, longest task 0.85 s (texture upload 0.21 s, shader 0.17 s); first run 4.4 s (cold) |
| light-up intro (~0.94 s ≈ 56 frames) | 25–52 frames drawn at 4×/6× (8 on the cold run) → partly skipped |
| scroll dolly, 4× / 6× | 57.6–59.8 fps, p95 18–21 ms, JS p95 ≈ 4 ms |

**Vanta FOG** was forced and un-hidden on the phone layout for measurement only. Today it is `display:none` below 1024 px and gated to the desktop tier.
* Canvas 292×601 (0.18 MP, ratio 0.75), 1 draw per frame, about 0.5 ms JS per frame at 4×.
* It renders **every frame, forever**: no on-demand mode.

**Estimates (not measured).**
* Mid-range phone GPU (A14/A15, Tensor/Mali-G78, Adreno 6xx, Mali-G68): about 5–10× slower than M4.
* For today's hero at 0.27 MP, roughly 3–8 ms GPU per frame: fine. Sheet view at 0.63 MP roughly doubles that, and an uncapped DPR 3 (1.1 MP) would be 12–30 ms.
* Low-end (Mali-G52, Adreno 610): about 3× worse again, hence the runtime frame guard below.

### Findings

* **F1 · Mount long task.** It blocks input for 1–3 s and skips the intro. Cause: sync shader checks (`checkShaderErrors`
  defaults to true, so `getProgramInfoLog` blocks), all uploads in one task, and runtime `EdgesGeometry`.
* **F2 · GPU memory.** 58 MiB of textures for a 390 px stage, of which 20 MiB is PMREM and shadow targets that a phone does not need.
* **F3 · Canvas resize on view switch** (phone layout only): a long task, 2.35× the pixels, and a camera re-fit to portrait.
* **F4 · Shadow pass on every frame** (`shadowMap.autoUpdate=true`), even for camera-only frames on desktop.
* **F5 · Per-frame JS is small** (p50 ≈ 1 ms at 4×). Jank during transitions comes from long tasks, not steady per-frame cost.
* **F6 · The gallery is already light**, except the 12 MiB atlas and the first-render compile.
  The GLB integration note in `BLENDER-ASSETS.md` uses 12 full-size photo textures (up to 1400×1120, about 8 MiB each with mips) — **not acceptable on phones**.
* **F7 · Render-on-demand and pause-offscreen work.** Idle frames draw nothing in both scenes.

## 2 · Research digest (sources)

**Budgets**
* Draw calls: about 100–200 on low-end mobile ([PlayCanvas](https://developer.playcanvas.com/user-manual/optimization/guidelines/)); about 100 per frame, DPR ≤ 2 ([utsubo 2026](https://www.utsubo.com/blog/threejs-best-practices-100-tips)).
* DPR is the main cost lever: clamp about 1.5 for fill-bound scenes ([three forum 2025](https://discourse.threejs.org/t/hidpi-fractional-scaling-performance-pitfalls-and-best-practices/87114)); adapt DPR at runtime ([PlayCanvas](https://developer.playcanvas.com/user-manual/optimization/runtime-devicepixelratio/)).

**MSAA and powerPreference**
* MSAA is comparatively cheap on tile-based GPUs, where samples resolve on-chip ([Apple TT 606](https://developer.apple.com/videos/play/tech-talks/606/)). Whether the WebGL backbuffer gets this benefit is **unverified**, so A/B it on devices.
* `powerPreference:'high-performance'` dropped an iPhone 12 to 20 fps, fixed in WebKit in Aug 2024 ([WebKit 276959](https://bugs.webkit.org/show_bug.cgi?id=276959)). Keep `'default'`.

**Shadows and environment**
* r186: `shadowMap.autoUpdate` defaults to true; with render-on-demand, set it false and use `needsUpdate` ([WebGLShadowMap.js](https://cdn.jsdelivr.net/npm/three@0.186.0/src/renderers/webgl/WebGLShadowMap.js)).
* Baked or contact shadows are the performant choice for static scenes ([forum](https://discourse.threejs.org/t/performant-soft-shadows-three-js/27777), [drei](https://drei.docs.pmnd.rs/staging/contact-shadows)).
* PMREM `fromScene(scene, σ, near, far, {size})`, default 256: the output is 768×1024 half-float, and the ping-pong target lives until `dispose()` ([PMREMGenerator.js](https://cdn.jsdelivr.net/npm/three@0.186.0/src/extras/PMREMGenerator.js)).

**Compression**
* KTX2/Basis transcoder ≈ 245 KB gzip (wasm) — not worth it for 1–3 small WebP textures ([McCurdy 2024](https://www.donmccurdy.com/2024/02/11/web-texture-formats/)).
* Meshopt decoder ≈ 8 KB gzip vs Draco ≈ 80 KB, so meshopt for small GLBs ([gltf-transform](https://gltf-transform.dev/modules/extensions/classes/EXTMeshoptCompression)).

**Render loop and throttling**
* Render-on-demand pattern ([three manual](https://threejs.org/manual/#en/rendering-on-demand)).
* iOS Low Power Mode caps rAF at 30 fps by design ([WebKit 215745](https://bugs.webkit.org/show_bug.cgi?id=215745)). Our animations are time-based, so they still finish on time.
* No thermal API on mobile web; Compute Pressure is desktop Chrome only ([Chrome](https://developer.chrome.com/docs/web-platform/compute-pressure)).

**iOS**
* WebGL2 since Safari 15 ([WebKit](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/)); 16 active contexts, oldest dropped ([WebKit test](https://webkit.googlesource.com/WebKit/+/master/LayoutTests/webgl/max-active-contexts-oldest-context-lost-expected.txt)).
* Context loss on background/lock in iOS 16.7/17.0 ([WebKit 261331](https://bugs.webkit.org/show_bug.cgi?id=261331)); texture-heavy pages killed and reloaded on iOS 18 ([WebKit 300782](https://bugs.webkit.org/show_bug.cgi?id=300782)).
* About 384 MB total canvas memory; release source canvases ([pqina](https://www.pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/)).
* MAX_TEXTURE_SIZE: 4096 is effectively universal on Android ([web3dsurvey](https://web3dsurvey.com/webgl2/parameters/MAX_TEXTURE_SIZE)).
* OffscreenCanvas WebGL since Safari 17 ([WebKit](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)). Not needed if mount is time-sliced.

**Capability signals**
* `deviceMemory` is Chromium-only ([MDN](https://developer.mozilla.org/docs/Web/API/Navigator/deviceMemory)).
* iOS reports the GPU only as "Apple GPU" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info)), so tier at runtime by frame time, not by name.
* `failIfMajorPerformanceCaveat` rejects software rendering ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)).

**Anime.js 4**
* Own rAF engine that sleeps when idle. `engine.useDefaultMainLoop=false` with `engine.update()` is supported, and `engine.fps` caps it ([docs](https://animejs.com/documentation/engine/engine-methods/update)).

**Vanta**
* Unmaintained since March 2024, its own rAF loop with no cap ([#184](https://github.com/tengbao/vanta/issues/184)), banding on high-DPI ([#60](https://github.com/tengbao/vanta/issues/60)), breaks with newer three ([#177](https://github.com/tengbao/vanta/issues/177)).

## 3 · Mobile budgets ("lite" profile)

| budget | hero lite | gallery lite | today (hero / gallery) |
|---|---|---|---|
| canvas pixels | ≤ 0.30 MP, **fixed** stage, DPR ≤ 1.5 (guard steps 1.5→1.25→1.0) | ≤ 0.30 MP | 0.27 (0.63 sheet) / 0.24 MP |
| draw calls / frame | ≤ 16 (≈ 10 with merged frames), no shadow pass | ≤ 4 | 23–26 / 10 |
| triangles / frame | ≤ 8k (cartridge ≤ 2.5k) | ≤ 3k | ≈ 13k incl. shadow pass (v2) / ≈ 1.1k |
| shader programs | ≤ 8 | ≤ 3 | 19 / 8 |
| GPU textures | ≤ 12 MiB (plan: ≈ 9 MiB) | ≤ 8 MiB (plan: ≈ 6 MiB) | 58 / 14 MiB |
| framebuffer | ≤ 9 MiB | ≤ 9 MiB | 9–21 / 8 MiB |
| download (assets) | GLB ≤ 100 KB | GLB ≤ 90 KB + photos already on page | 251 KB / procedural |
| main thread at mount | no task > 50 ms at 4× (≤ 100 ms at 6×); total ≤ 400 ms | same | 2.0 s / 0.85 s longest |
| per-frame JS | p95 ≤ 4 ms at 4× | p95 ≤ 3 ms | 9–12 / 4 ms |
| frame time during animations | p50 ≤ 16.8 ms, p95 ≤ 20 ms at 4× (≤ 25 ms at 6×), ≤ 1 frame > 34 ms per window | same | p95 23–33 / 18–21 |
| intro frames drawn | ≥ 90 % of expected | ≥ 90 % | 7–24 % / 45–93 % |
| idle | 0 draws, no rAF | 0 draws | ✓ / ✓ |

## 4 · Per-scene mobile profile

**Who gets 3D.** Phones and tablets get 3D when `mobileWebGLCapable()` passes (see §6.1). Every other device keeps today's static art and DOM animations.

### 4.1 Hero film workspace — lite

Rendered:
* Cartridge (`film-cartridge-v2-mobile.glb`).
* Procedural strip (520 segments, kept).
* 8 photo frames.
* Light-table glass, housing, paper, grease pencil.
* Table as an unlit gradient plane.

Lighting:
* Key, enlarger and safelight lights stay (cheap with Lambert).
* Small environment via `PMREMGenerator.fromScene(room, .04, .1, 100, {size: 64})`, then `pmrem.dispose()` straight away (≈ 0.4 MiB).

Removed or replaced:
* Shadow map → baked `cartridge-contact-shadow.webp` quad, plus 8 instanced soft "lift" shadows driven by the same pose progress (offset/scale/opacity ∝ lift). The frames still visibly leave the strip.
* Runtime `EdgesGeometry` → baked `CartridgeEdges` LINES primitive.
* Table/housing/paper `MeshStandardMaterial` → Basic/Lambert.
* Film `onBeforeCompile` injections move onto `MeshLambertMaterial`. It has `map_fragment` and `emissivemap_fragment` too, so backlight, reveal and develop behave identically.

Textures (`film-textures.ts` `scale=.5`):
* Strip 2048×128, atlas 1024×342 (256×171 cells), paper 700×362, glass 512×256, pencil 256×192, radials 128².
* Anisotropy ≤ 4.
* Source canvases are shrunk to 0×0 after upload, except the pencil (iOS canvas memory).

Stage:
* Fixed phone stage: canvas height = strip-view height (≈ `clamp(240px, 78vw, 360px)`), never resized by the view switch.
* Sheet view on phones: the 3D lift-and-lay plays inside the stage. When the pencil mark completes ("frame-lock"), the canvas cross-fades (320 ms) to the readable DOM contact sheet, keeping the audit's readable mobile sheet. Back to "Negativ": the DOM fades, the canvas fades in, and the reverse 3D move plays.

Optional:
* Merge the 8 frame meshes into one draw (`aFrame` attribute + `uDevelop[8]`).
* Precompute strip/sheet normals and lerp them; drop per-frame `computeVertexNormals`/`computeBoundingSphere`, with `frustumCulled=false` on the frames.

Mount order (lite and desktop):
1. Assets: fetch, decode, build.
2. `prepareRenderer`: `checkShaderErrors=false` in prod; `initTexture` per texture with a yield between each; `await compileAsync(scene, camera)`.
3. First `render()`, then `await nextFrame()`.
4. Report ready: the hook sets `active` and the canvas fades in.
5. **Only now** create and play the intro timeline (`autoplay:false` → `.play()`).

The full 1.38 s intro is then always seen.

Expected cost (estimate):
* ≈ 9 MiB textures, ≈ 8 programs, 10–16 draws.
* Mount split into ≤ 50 ms slices.
* GPU 2–5 ms per frame on mid-range phones.

### 4.2 Street-gallery window — lite (moves to `street-window.glb`, desktop too)

* **Scene.** `street-window-mobile.glb`: baked 1024×512, `WindowStatic` unlit, `toneMapped=false`.
* **Photos.**
  * One merged `Photos` mesh: one draw, one **atlas** of 1024×576 (4×3 cells of 256×192).
  * Never 12 full-size textures on phones. Desktop: atlas 2048×1152 with the merged mesh too.
  * The light map is the baked texture through uv1, as in `BLENDER-ASSETS.md`.
* **Glass.** The existing additive streak `MeshBasicMaterial` (256² on lite). No scene lights at all, so programs ≤ 3 and draws 3.
* **Light-up** (`exposeLights`). Animate `color` scalar .25 → 1 on `WindowStatic` and the photo material. The baked pools scale with it, so the animation is preserved and needs no spot light.
* **Camera.** Fit to the phone stage (aspect ≈ 1.41). Optional `Camera_Window_Mobile` from Blender. Scroll dolly unchanged; pointer parallax stays mouse-only.
* **Mount.** Same `prepareRenderer` sequence; `exposeLights` starts after the first presented frame.
* **Expected cost (estimate).** ≈ 6 MiB textures, 3 draws, ≤ 2.5k tris, mount < 300 ms in ≤ 50 ms slices.

### 4.3 Shared runtime rules (lite)

* **Renderer:** `{antialias:true, alpha:(hero only), stencil:false, powerPreference:'default', failIfMajorPerformanceCaveat:true}`.
* **DPR:** `min(devicePixelRatio, 1.5, sqrt(300000/(cssW·cssH)))`, floor 1.
* **Render cap:** skip a render if < 15 ms since the last one, so 120 Hz Android panels render ≤ 60 fps. Anime stays time-based, so durations are unchanged.
* **Pause:** offscreen and hidden-tab pause stays (works today). One live context per page on phones.
* **Context loss:**
  * `webglcontextlost` → `preventDefault`, pause, `ctx.onLost()`.
  * The hook tears down to static and remounts once when visible again.
  * A second loss → `failed` (static art).
* **Frame guard** (lite, sampling only while an animation runs):
  * After ≥ 20 frames, if p75 > 22 ms → DPR one step down (1.5 → 1.25 → 1.0).
  * At 1.0 and still p75 > 28 ms → let the running animation finish, then hand over to the DOM scene (whose `playContactSheet` / CSS animations already exist), so no animation disappears.
  * Remember it in `localStorage` (`bf-webgl-lite-off`, 7 days, wrapped in try/catch).

## 5 · Asset variants Blender must produce

| # | asset | spec |
|---|---|---|
| B1 | `public/models/film-cartridge-v2-mobile.glb` | ≤ 2,500 tris (fewer lathe/bevel segments, simplified spool keys and felt lips). **Identical node names, transforms and bounds** (`FilmCartridge`, `Cassette`, `Leader`, `LeaderTip`, `SlotExit`) so the strip attaches unchanged. 512² WebP: base (AO multiplied in) and ORM (or constants). **No normal map** (the 1024² normal is 5 KB, i.e. near-flat). ≤ 90 KB |
| B2 | `CartridgeEdges` in **both** cartridge GLBs | Feature edges ≥ 32° (matches `EdgesGeometry(geo, 32)`), exported as glTF LINES (loose edges). Desktop ≤ 3k segments, mobile ≤ 1.2k. Removes the 0.29 s runtime build at 4× |
| B3 | `public/textures/cartridge-contact-shadow.webp` | 256² alpha (WebP with alpha). Shadow-catcher bake of the cartridge in the hero pose (lying, spool to camera, −60° spin) under the softbox key. Document plane extents in model units |
| B4 | `public/models/street-window-mobile.glb` | Same nodes; baked atlas **1024×512** WebP q80. **`Photos` merged mesh** (12 quads, uv0 = fixed 4×3 atlas cells in Photo_01…12 order, cell aspect 4:3 with 3:2 content, uv1 = light map), kept alongside or instead of the Photo_NN quads. Glass as one mesh. ≤ 60 KB |
| B5 | `street-window.glb` (desktop) | Add the same merged `Photos` mesh (12 → 1 draw). Keep the 2048×1024 bake |
| B6 (opt.) | `Camera_Window_Mobile` node | Framing for a 1.41:1 phone stage (main 3×3 window ≈ 90 % of width, side window partly visible) |
| B7 (opt.) | meshopt pass on all GLBs | `gltf-transform meshopt` (EXT_meshopt_compression + KHR_mesh_quantization). The v2 cartridge geometry is ≈ 180 KB of 251 KB; needs `MeshoptDecoder` (≈ 8 KB gzip). Check whether Vercel compresses `model/gltf-binary` |
| B8 (opt.) | 1× posters | `public/renders/street-window@1x.webp` (≈ 800 px) and `cartridge-135@1x.webp` for the static phone path |

No KTX2/Basis: the transcoder (≈ 245 KB gzip) outweighs the savings for 1–3 small textures.

## 6 · Code changes (exact list, Phase 2)

### 6.1 `lib/webgl.ts`

`mobileWebGLCapable()`, cached:
* WebGL2 with `failIfMajorPerformanceCaveat:true`.
* `MAX_TEXTURE_SIZE ≥ 4096`.
* `!saveData()`.
* `deviceMemory` undefined or ≥ 4.
* Android `hardwareConcurrency` ≥ 4.
* Renderer not matching `/SwiftShader|llvmpipe|Mali-(4|T[6-8]|G31|G51|G52)|Adreno \(TM\) (3|4|50)\d|PowerVR/`.
* `bf-webgl-lite-off` not set.
* Release the probe context. Reuse it inside `webglAvailable()` so only one probe context is ever made.

`maxContexts()`: 2 on desktop, 1 on touch/phone.

`cappedDpr(tier, cssW, cssH)`: add the mobile formula from §4.3, plus a module `dprStep` lowered by the guard.

New helpers:
* `yieldToMain()` (`scheduler.yield` ?? MessageChannel), `nextFrame()`, `whenIdle(ms)`.
* `prepareRenderer(renderer, scene, camera, textures)`: sets `debug.checkShaderErrors` (false in prod), `initTexture` with yields, then `await compileAsync`.
* `createFrameGuard({onStep, onGiveUp})`.
* `releaseCanvasSource(tex)`.

### 6.2 `hooks/use-webgl-scene.ts`

* `minTier` accepts `'mobile'`. `allowed()` = desktop ‖ (tablet && minTier ≠ desktop) ‖ (mobile && minTier = mobile && `mobileWebGLCapable()`). Reduced motion still → static.
* The ctx passed to mount gains:
  * `profile:'full'|'lite'` (lite unless desktop),
  * `onReady()`: set `active` only now,
  * `onLost()`: teardown + one remount,
  * `onGiveUp()`: static, with the DOM fallback visible.
* On touch devices: `await whenEngaged()` then `await whenIdle(1500)`, so mount never overlaps a fling.

### 6.3 `components/hero.tsx` + `app/styles/hero.css`

* `useWebGLScene(..., {minTier:'mobile'})`.
* Phone CSS: `.hero-canvas` becomes a fixed stage at the top of `.hero-workspace` (height `--hero-stage-h`). It is never resized by `data-view`.
* `[data-webgl=active][data-view=sheet][data-settled]` → the DOM `.hero-film` sheet is visible and the canvas is faded out.
* Pass `onSettled(view)` in `FilmWorkspaceOptions` to set `data-settled` after the pencil mark.

### 6.4 `components/three/film-workspace.ts`

Lite profile per §4.1:
* GLB path by profile; edge lines from `CartridgeEdges`; no runtime `EdgesGeometry`.
* PMREM with `size` (64 lite / 128 full), then `pmrem.dispose()` right after generation.
* Lite: `shadowMap.enabled=false`, plus the contact-shadow quad and instanced lift shadows.
* Full: `shadowMap.autoUpdate=false`, with `needsUpdate=true` only in `applyPoses`/intro updates.
* Lambert/Basic materials on lite.
* Mount order: `prepareRenderer` → render → `nextFrame` → `ctx.onReady()` → `intro.play()`.
* Render cap; rAF-coalesced resize that only calls `setSize` when the device size changes ≥ 2 px.
* `webglcontextlost` → `ctx.onLost()`; remove the direct `dataset.webgl='failed'`.
* Frame guard around intro and `setSheet`; `onSettled` callback.
* Optional: merged frames, lerped normals.

### 6.5 `components/three/film-textures.ts`

* A `scale` parameter for every canvas texture (sizes and font sizes).
* Returns its canvases so the scene can release them after upload.

### 6.6 `components/three/gallery-window.ts`

* Replace the procedural build with the GLB (desktop `street-window.glb`, lite `street-window-mobile.glb`).
* Photo atlas (lite 1024×576) on the merged `Photos` mesh. Fallback: merge `Photo_01…12` at runtime with `mergeGeometries` after baking node matrices.
* Additive glass streaks; no lights; `exposeLights` drives the colour scalar.
* Same mount order, render cap, context loss and frame guard as the hero.
* `getBoundingClientRect` once per rendered frame instead of per scroll event.
* `powerPreference:'default'`.

### 6.7 Other files

* `components/gallery/window-stage.tsx`: `minTier:'mobile'`; the stage label on touch reads "3D · Blick folgt dem Scrollen".
* `components/darkroom.tsx`: no change. Vanta stays desktop-only and is still `display:none` below 1024 px.
* **Bundle (verify):** check whether named three imports shrink the 179 KB gzip core chunk.

## 7 · Every animation is kept

| animation | desktop today | phone (lite) |
|---|---|---|
| hero intro: line drawing → shaded, lamp on, strip unwinds, photos develop | Anime timeline, often skipped on slow CPUs (F1) | same timeline, **started after the first presented frame**; baked edge lines; never skipped |
| strip ⇄ contact sheet (lift, travel, lay down) | CPU morph + shadow pass | same morph; lift read from instanced soft shadows; fixed stage, no resize |
| grease-pencil frame-lock | canvas redraw + upload | same (256×192 canvas), then hand-off to the readable DOM sheet |
| pointer orbit ±2.4°/±1.4° | mouse only | unchanged (mouse only; no new motion added) |
| gallery light-up (`exposeLights`) | spot + pools + photo brightness | colour scalar on baked surfaces and photos, same easing and duration |
| gallery scroll dolly | damped loop on scroll | unchanged, render-capped at 60 fps |
| guard fallback | — | when the device can't hold 36 fps, the **existing DOM animations** (`playContactSheet`, CSS) take over — no animation is removed |

## 8 · Vanta on phones — assessment

Measured when forced: 0.18 MP and 1 draw per frame, about 0.5 ms JS per frame at 4×. So it is affordable per frame.

Reasons to keep it off on phones:
* It renders **every frame for as long as it is visible**: no on-demand mode, no fps cap. That is continuous GPU, battery and heat while the hero sits idle.
* It needs a second WebGL context.
* `antialias` is hard-coded.
* It bands on high-DPI screens.
* It is unmaintained and pinned to old three.

**Keep it off on phones** (as the brief says). If an animated atmosphere is ever wanted on phones, the honest path is a single fog quad (about 3 fbm octaves at 0.25× resolution) **inside the hero's own context**, drawn only while hero animations run. The static `darkroom-safelight` image remains the default.

## 9 · Verification protocol

Tools are in `scripts/perf/`:
* `chrome.sh` — private headless Chrome on CDP port 9871. **Never reuse a port another session owns.**
* `webgl-probe.mjs` — emulated phone, CPU throttling, WebGL counters, window stats, `--profile`.
* `resize-check.mjs` — canvas size across the view switch.

Steps:
1. Production build: `npm run build && npx next start --hostname 127.0.0.1 --port 3199`. Then `scripts/perf/chrome.sh 9871 "$TMPDIR/bf-perf"`.
2. Run hero and gallery, 3 runs each at 4× and 6×, **without `--force`** (the lite path must activate by itself):
   `node scripts/perf/webgl-probe.mjs --base http://127.0.0.1:3199 --scenario hero --cpu 4`
   Add `--profile 1` (mount) or `--profile sheet|scroll` for hotspots.
3. Pass criteria are the §3 budgets, using medians of 3:
   * intro frames drawn ≥ 75 of ≈ 83 (hero) and ≥ 50 of ≈ 56 (gallery);
   * longest mount task ≤ 50 ms at 4×;
   * no long task at the view switch;
   * animation windows p95 ≤ 20 ms at 4× and ≤ 25 ms at 6×;
   * idle draws 0;
   * texture MiB and program counts within budget;
   * `resize-check.mjs` reports an unchanged canvas size.
4. Desktop regression: same probe with `--w 1440 --h 900 --dpr 2` and no throttle. The intro must be fully drawn and the shadow pass must not appear on camera-only frames.
5. Real devices (required; the emulation cannot measure GPU):
   * iPhone 12/13 Safari: Web Inspector → Timelines (frames, JS) and Memory.
   * Pixel 6a / Galaxy A54 Chrome: remote DevTools Performance with the GPU track.
   * Repeat in iOS Low Power Mode (30 fps: animations must still finish on time).
   * Context loss: `gl.getExtension('WEBGL_lose_context').loseContext()` → static, then `restoreContext()` → remount once. Also background/foreground the tab on iOS.
   * Thermal: 20 view switches back to back; the last 5 must have p95 within 20 % of the first 5.
6. Gating: reduced motion → static; Save-Data → static; software GL (`--disable-gpu`) → static; `bf-webgl-lite-off` set → static.

## Phase 2 · Implementation result (2026-10-07)

### What shipped

**Assets** (Blender 5.2.2, same generator scripts, verified with `scripts/blender/verify-glb.mjs`; details in
[BLENDER-ASSETS.md §5](BLENDER-ASSETS.md), provenance in `public/models/manifest.json` and ASSET-PROVENANCE.md):

| # | asset | result |
|---|---|---|
| B1 | `film-cartridge-v2-mobile.glb` | 2,246 tris (budget 2.5k), 2 × 512² WebP (base with AO multiplied in, ORM), no normal map; node names, `SlotExit`/`LeaderTip` and bounds identical to v2. **115,716 B** raw / 53 KB gzip (target 90 KB, see deviations) |
| B2 | `CartridgeEdges` (glTF LINES) | desktop 1,156 segments, phone 835 (≤ 3k / ≤ 1.2k); the runtime `EdgesGeometry` is gone |
| B3 | `textures/cartridge-contact-shadow.webp` | 256² alpha, 11,668 B; plane 2 × 2 model units centred on the spool axis, world-aligned |
| B4 | `street-window-mobile.glb` | same bake at 1024×512 q80 + merged `Photos` (uv0 = 4 × 3 atlas cells, uv1 = light map), 2,360 tris, **87,500 B** raw / 49 KB gzip (target 60 KB) |
| B5 | `street-window.glb` | + merged `Photos` (Photo_NN kept alongside), 124,016 B |
| B6–B8 | — | not built (B6 = two framing constants in code; B7 skipped by decision; B8 posters are not used on the phone path) |

**Code**
* `lib/webgl.ts`: one capability probe per page (`mobileWebGLCapable()`: hardware WebGL2 via `failIfMajorPerformanceCaveat`,
  4096² textures, Save-Data, `deviceMemory`, Android cores, weak-GPU regex, 7-day `bf-webgl-lite-off`); `maxContexts()` 2/1;
  `cappedDpr(tier,w,h)` with the √(300 000/px) budget and guard steps 1.5 → 1.25 → 1; `yieldToMain`, `nextFrame`, `whenIdle`,
  `displayCadence`; `prepareRenderer` (texture uploads one per task → program creation one mesh per task → `compileAsync`);
  `releaseCanvasSource` (via three's `onUpdate`, after the upload); `createFrameGuard`; `textureCanvas`/`drawImageSliced`.
* `hooks/use-webgl-scene.ts`: `minTier:'mobile'`, `ctx.profile` full|lite, `onReady` (→ `active`), `onLost` (static + one
  remount, second loss → `failed`), `onGiveUp` (static for the page view); touch/lite waits for engagement + 1.5 s quiet.
* `components/three/film-workspace.ts`: lite profile per §4.1; merged frame mesh (8 → 1 draw, `aFrame` + `uDevelop[8]`) for
  both profiles; mount order prepare → render → `nextFrame` → `onReady` → intro; ≤ 60 renders/s; resize coalesced and only
  on ≥ 2 device px; context loss → `onLost`; frame guard; `onSettled`; full profile: shadow map refreshed only when geometry
  moves, PMREM 128 freed at once.
* `components/three/gallery-window.ts`: the GLB window (desktop integration of `street-window.glb` completed), photo atlas on
  `Photos`, bake as light map (shared GL texture), additive streak glass, no lights, `exposeLights` → one colour scalar,
  one layout read per rendered frame, same mount order / guard / context-loss handling.
* `components/hero.tsx` + `app/styles/hero.css` (block "Mobile 3D stage"): `minTier:'mobile'`, `currentSheet`, `onSettled` →
  `data-settled`; phone canvas fixed at the strip-view size, cross-fade to the readable DOM contact sheet after the pencil.
* `components/gallery/window-stage.tsx`: `minTier:'mobile'`, touch label "3D · Blick folgt dem Scrollen".
* Audit D2 (lead request): the contact-sheet paper prints the 8 frames as a faint warm earlier proof (30 %, sepia multiply)
  in its grid, so the sheet never reads empty in strip view; the laid frames cover them exactly. One draw per photo, sliced.

### Measured before / after

Same method as §1 (`scripts/perf/webgl-probe.mjs`, headless Chrome 154, 390×844 DPR 3, touch, Android UA; desktop
1440×900 DPR 2 without throttling, Vanta chunk blocked so the hero context is measured alone). **Dev server** (`next dev`,
no production build allowed on this machine), medians of 3 (before gallery 6× and desktop gallery: 2). Before = old code
with the WebGL tier forced on phones (`--force useWebGLScene`); after = no forcing (the lite path activated by itself).
"Longest task" counts Long Tasks ≥ 50 ms only, so "—" means none. Machine load average was 12–20 during the before runs and
≈ 4 during the after runs; the changes below are structural (tasks removed or split, frames no longer skipped), not noise.

| metric | before | after |
|---|---|---|
| hero 4× · longest task in mount (loading → active) | 931 ms (577–1534) | — (none ≥ 50 ms in 3 runs) |
| hero 6× · longest task in mount | 1378 ms (791–1425) | — (one run 50 ms) |
| hero 4× / 6× · mount duration | 1263 / 1691 ms | 379 / 474 ms |
| hero 4× / 6× · intro frames drawn / ≈ 83 | 24 / 15 | **83 / 81** |
| hero lite · GPU textures | 57.9 MiB | **7.3 MiB** |
| hero lite · programs linked | 19 | 10 (no PMREM, no shadow pass) |
| hero lite · draws per frame (p50) | 15 (+ shadow pass) | 10 |
| hero 4× / 6× · longest task at the view switch (sheet / strip) | 53 / 84 · 86 / 77 ms | — / — |
| hero phone canvas across the view switch | 585×457 → 585×1075 (reallocated) | 585×457 fixed |
| hero 4× sheet move · frame time p95 | 18.0 ms | 17.6 ms |
| gallery 4× · longest task in mount | 452 ms (341–4890 cold) | — |
| gallery 6× · longest task in mount | 546 ms | 53 ms |
| gallery 4× / 6× · light-up frames drawn after `active` (≈ 50–56) | 53 (3–71) / 45 (27–62) | 51 / 51 |
| gallery lite · textures / programs / draws | 13.8 MiB / 8 / 10 | **6.0 MiB / 3 / 3** |
| gallery 4× scroll dolly · frame time p95 | 17.7 ms | 17.4 ms |
| **desktop** hero · longest task in mount / mount | 413 ms / 559 ms | — / 246 ms |
| **desktop** hero · intro frames drawn / ≈ 83 | **35** | **84** |
| desktop hero · textures / programs / draws | 57.9 MiB / 19 / 15 | 47.4 MiB / 18 / 9 |
| desktop gallery · longest task / light-up frames | 221 ms / 50 | — / 71 |
| desktop gallery · textures / programs / draws | 13.8 MiB / 8 / 10 (procedural) | 24.0 MiB / 3 / 3 (GLB bake 2048×1024 + photo atlas) |
| idle draws (both scenes) | 0 | 0 |
| console errors / WebGL warnings | 0 | 0 |

Further checks: context loss (`WEBGL_lose_context`) → static, remount after the quiet period → `active`; second loss →
`failed` (no warnings after the fix that skips `forceContextLoss` on a lost context). Reduced motion → 0 canvases, static.
CPU 20× → the frame guard stepped the DPR down, then handed over to the DOM fallback and set `bf-webgl-lite-off`.
Tablet 768×1024 and landscape 844×390 render and hand over correctly. `npx tsc --noEmit` and `npx eslint` on the touched
files: 0 errors. **Not measurable here:** phone GPU time, iOS memory pressure, Low Power Mode — the emulation runs on an
M4 GPU; the iOS Simulator / real-device pass (§9 step 5) is still required.

### Deviations from the plan (and why)

1. **Lite cartridge uses a studio matcap instead of a 64 PMREM.** r186 PMREM prefilters with a 256-sample GGX shader; even at
   size 64 `fromScene` was one 50–60 ms task at 4× (sync link at first draw, also without shader checks). The matcap
   (procedural 128² canvas) × the baked base colour keeps the brushed-metal read; desktop keeps PBR + PMREM 128.
2. **Anime-driven frames render in a microtask** at the end of Anime's engine callback instead of a new rAF. Requesting a rAF
   from inside Anime's callback landed a frame late and, because Anime's own rAF is registered first, only every other frame:
   the old desktop intro drew 35 of ~83 frames. This is the main reason desktop now draws the full intro.
3. **Photo canvases are CPU-backed and filled one photo per task** (`drawImageSliced`). Chrome rasterises recorded canvas
   draws together at the end of the task: 12 photo downscales were one 130–140 ms task at 4×. Type/gradient canvases stay
   GPU-rasterised (CPU raster of the 4096-px strip cost desktop ≈ 60 ms).
4. **Canvas release via three's `texture.onUpdate`** rather than returning canvases from `film-textures.ts` (same effect:
   0×0 after upload, ImageBitmaps closed; the pencil is kept).
5. **Lite programs = 10, not ≤ 8:** table/spill, housing, glass, contact shadow/pencil, matcap, edge lines, ribbon, frames,
   lift shadows, paper. Not merged further to avoid shader hacks; no PMREM/shadow programs remain.
6. **GLB bytes over target** (B1 115.7 KB vs 90 KB, B4 87.5 KB vs 60 KB): both are float32 geometry; meshopt/quantisation
   (B7) was skipped by decision. Over the wire (gzip) 53 KB and 49 KB.
7. **Frame-guard thresholds scale with the measured display cadence** (`max(22 ms, 1.25 × cadence)` /
   `max(28 ms, 1.6 × cadence)`), so a 30 fps iOS Low Power Mode is not mistaken for overload.
8. **`whenIdle(1500)`** waits for 1.5 s without scroll/touch/wheel input counted from the call (no history of earlier input).
9. **Desktop gallery textures rose to 24 MiB** because the GLB bake (2048×1024) replaces the procedural shading — this is the
   pending desktop integration of `street-window.glb`; phones get the 1024×512 build (6 MiB total).
10. Lerped normals (optional) not done: `computeVertexNormals` on the merged 272-vertex frame mesh is negligible.
