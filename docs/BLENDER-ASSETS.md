# Blender assets (v2) · cartridge, street window, format objects

Built 2026-10-07 with **Blender 5.2.2 LTS** (headless, Cycles on the Apple M4 GPU via METAL). Every asset is produced by one
script in `scripts/blender/` from scratch — procedural modelling, explicit UVs or lightmap UVs, Cycles baking, glTF export and
the poster renders — so it can be rebuilt on demand (fixed seeds; only path-tracing noise differs). Shared helpers: `bf_common.py` (2D SDF contours, mesh builder with UV
islands + shelf packing, lathe, studio rig, camera/render) and `bf_bake.py` (EMIT/AO/NORMAL bakes, tileable textures,
lightmap unwrap, GLB read/write, material builders). `.blend` originals and QA previews: `docs/evidence/blender/`.

```sh
blender(){ "$HOME/Library/Application Support/Steam/steamapps/common/Blender/Blender.app/Contents/MacOS/Blender" "$@"; }
blender -b --factory-startup -P scripts/blender/cartridge_135.py      # → film-cartridge-v2.glb + cartridge-135.webp
blender -b --factory-startup -P scripts/blender/street_window.py      # → street-window.glb + street-window.webp
blender -b --factory-startup -P scripts/blender/format_objects.py     # → format-{135,120,110}[.@2x].webp (needs the v2 GLB)
node scripts/blender/verify-glb.mjs public/models/film-cartridge-v2.glb public/models/street-window.glb
```
`--quick` (low samples) and, for the window/cartridge, `--stage geo` (geometry preview without baking) exist for iteration.

All objects are **generic, unbranded, decorative** (no text, numbers, logos, labels, brand colours, packaging or signage) and
must never be captioned as product or documentary photography. Real photographs are never baked into any asset: the window's
photo planes are neutral placeholders that receive the real gallery photos at runtime.

## 1 · Hero cartridge v2 — `public/models/film-cartridge-v2.glb`

**Script** `scripts/blender/cartridge_135.py` · **Poster** `public/renders/cartridge-135.webp` (1200×900, transparent, 155,996 B)
· **Original** `docs/evidence/blender/cartridge-135.blend` · baked maps `docs/evidence/blender/cartridge-135-textures/*.png`
· previews `docs/evidence/blender/previews/cartridge-*`.

**What it is.** A generic 135 cassette at real proportions: brushed dark gunmetal shell Ø 24 mm with the light-trap nose,
black satin end caps Ø 25.1 mm (with the “ear” over the nose), cap-to-cap 45 mm, a keyed spool hub (+-shaped key) protruding
5.8 mm at the top, a short hollow spool stub flush with the flat bottom cap, black velvet lips lining the film slot, and a
translucent amber-brown leader: full width out of the lips, the classic leader cut down to a 16.5 mm tongue, KS perforations
cut as geometry (1.98 × 2.794 mm, r 0.5, pitch 4.75 mm, 2.01 mm from the edge). No print of any kind.

**Modelling.** The shell/nose cross-section is a 2D signed-distance field (circle ∪ rounded nose box with a 1.5 mm fillet,
minus the 0.6 mm slot) traced as an iso-contour and Douglas–Peucker-simplified; caps are offset level sets of the same field
with a 0.8 mm / 0.35 mm rounded rim; hub, stub and cap bosses are lathed; the leader outline and its perforations are one
triangulated face. Explicit UV islands, shelf-packed into one 1024² atlas (10.9 px/mm).

**Materials & bake (Cycles, METAL).** Procedural bake materials → `baseColor`, `ORM` (R = AO 512 spp, 5 mm reach, floored
at 0.25; G = roughness; B = metalness) and a tangent-space `normal`. Brushed metal: a Higgsfield brushed-steel texture
(job `b5932950-…`), FFT high-passed (σ 24 px) and cross-faded to tile, mapped cylindrically so the brushing runs round the
circumference; it modulates base colour (F0 0.25–0.34), roughness (0.24–0.42) and a bump → the anisotropic streak is
approximated by stretched normal/roughness detail (no KHR_materials_anisotropy needed). Caps: albedo 0.022, roughness
0.42–0.56 with a fine moulding grain. Felt: albedo 0.007, roughness 0.92–1, plush bump.

| | |
|---|---|
| File | 250,568 B (target ≤ 350 KB) — no Draco/Meshopt, `EXT_texture_webp` (required) |
| Triangles | 5,412 (`Cassette` 5,290 + `Leader` 122; target ≤ 6k) |
| Textures | 3 × 1024² WebP q88: base 11,160 B · ORM 54,910 B · normal 5,370 B |
| Materials | `Cassette` (opaque, single-sided, base+ORM+normal) · `FilmBase` (BLEND α 0.9, double-sided, factors only: sRGB ≈ #633B23, roughness 0.26) |
| Nodes | `FilmCartridge` (root) → `Cassette`, `Leader`, `SlotExit`, `LeaderTip` (empties) |
| Bounds (glTF) | x −0.245…0.347 · y −0.500…0.500 · z −0.553…0.245 |

**Conventions vs v1** (`film-cartridge.glb`, kept untouched):

| | v1 (Tripo) | v2 (Blender) |
|---|---|---|
| Up axis / height | glTF Y-up, 1.0 unit tall | same — 1.0 unit = 51.25 mm (flat cap face → keyed hub end); cap-to-cap = 0.878 |
| Spool hub | +Y | +Y (flat cap −Y) |
| Leader exit direction | (0.78, 0, −0.62) | (0.782, 0, −0.624) — identical |
| Origin | bbox centre (axis off-centre by z ≈ +0.081) | **on the spool axis**, at mid height (x = z = 0 is the axis) — rotations about the axis no longer wobble |
| Leader tip | `TIP = (0.085, 0, −0.3)` (hand-measured) | node `LeaderTip` = (0.3473, −0.0522, −0.5527); slot mouth node `SlotExit` = (−0.0193, −0.0522, −0.2613) |
| Film centre height | y ≈ 0 | y = −0.0522 (film centred between the caps, below the hub) |
| Diameter | 0.494 (caps) | 0.490 (caps), shell 0.468 |
| Material | 1 PBR material, metallic=1/roughness=1 via ORM | 2 materials; metal only on the shell; caps/felt dielectric |
| Size | 18,766 tris, 551,632 B | 5,412 tris, 250,568 B |

**Integration note (hero, `components/three/film-workspace.ts`).**
1. Swap the URL: `new GLTFLoader().loadAsync('/models/film-cartridge-v2.glb')`. `model.rotation.x = π/2` and the
   bounding-box placement (`cart.position.y = -box.min.y`) work unchanged.
2. Replace the hand-measured constants with the nodes:
   `const tipNode = model.getObjectByName('LeaderTip'), exitNode = model.getObjectByName('SlotExit');`
   `TIP = tipNode.position.clone(); EXIT = TIP.clone().sub(exitNode.position).normalize();`
   (both in model space, like v1's constants). To run the procedural strip straight out of the lips, start the curve at
   `SlotExit` and hide the tongue: `model.getObjectByName('Leader').visible = false`.
3. The `traverse` that sets `envMap`, `transparent`, `opacity` and adds `EdgesGeometry` now meets two meshes; keep
   `FilmBase` transparent (α 0.9) and skip the edge lines for the `Leader` (its perforations would draw dozens of tiny loops).
4. Lighting: unlike v1 the caps are dielectric, so the body no longer goes black without an environment. Keep the existing
   PMREM `RoomEnvironment` (`environmentIntensity ≈ 0.3`, `envMapIntensity ≈ 1–1.25`) plus the softbox key; the shell reads as
   dark brushed gunmetal with streaky highlights, caps as satin black. Neutral or ACES/AgX tone mapping both work.
5. Fallback: `public/renders/cartridge-135.webp` (upright ¾ view, leader to the right, transparent, contact shadow).

*Status 2026-10-07:* the hero team's working copy of `film-workspace.ts` already loads v2, starts the strip at `SlotExit`
(read in model space before the model is rotated) and hides `Leader`; `EXIT` keeps v1's value, which equals v2's direction.

## 2 · Street gallery window v2 — `public/models/street-window.glb`

**Script** `scripts/blender/street_window.py` · **Poster** `public/renders/street-window.webp` (1600×900, dark background,
blank neutral mats, 47,990 B) · **Original** `docs/evidence/blender/street-window.blend` · baked PNG
`docs/evidence/blender/street-window-textures/street-window-baked.png` · previews `docs/evidence/blender/previews/street-window-*`
(`-poster` = Cycles with glass, `-baked-unlit` = exactly what the runtime shows: unlit baked colours, no glass).

**What it is.** The real bay at Schwabacher Str./Alexanderstr., simplified: sandstone ashlar façade (≈ 0.92 × 0.335 m courses),
deep 0.20 m tooled-stone reveals, a plain stone lintel band where the real shop has its sign (no lettering of any kind), a
projecting stone sill, white window profiles, a 0.72 m deep display box with painted panels, a 3×3 hang of black frames
(0.66 × 0.49 m, bevelled profile) with ivory mats and 2 mm bevel-cut windows, three small sill spot fixtures, and the narrow
side window looking into the dim shop with three smaller frames on the inside wall. Evening light: a soft wash from the
window head falling off down the hang and the reveal, three wide large-radius spots from above, sill uplights barely on,
cool dusk sky + one warm street lamp; the mats stay below the brightness the real photos will have.

**Bake.** All static parts are joined, smart-projected (60°), density-equalised and **weighted** (frames 3.2, mats 3.0,
profiles 1.2, box walls 1.0, stone trim 0.9, façade 0.5, photo slots 0.45, shop room 0.25/0.2, hidden backing boards 0.08),
then packed for a 2:1 texture with square texels. Cycles (METAL GPU, 1024 spp) bakes COMBINED = direct + indirect diffuse
+ emission (no glossy → view-independent) into a float image, which is written through the AgX view transform
(exposure −0.8, “Base Contrast”). **The baked colour is therefore albedo × light, already tone-mapped, in baseColor on
TEXCOORD_0** — render it unlit. Glass is excluded from the bake (it must not block light) and exported as a runtime material.
Façade and tooled stone use the Higgsfield sandstone textures (jobs `0971c483-…`, `2dfcff3a-…`) made tileable, with a
per-block random offset/tone inside a procedural ashlar (Brick) shader; joints are recessed via bump.

| | |
|---|---|
| File | 121,580 B (target ≤ 700 KB) · `EXT_texture_webp`, `KHR_materials_unlit` · no normals exported (unlit) |
| Triangles | 2,360 (target ≤ 15k) |
| Texture | 1 × 2048×1024 WebP q84 (42,686 B) — the baked atlas |
| Materials | `WindowBaked` (unlit, baked map, TEXCOORD_0) · `PhotoSlot` (unlit, 0.6 grey × baked atlas on **TEXCOORD_1**) · `Glass` (BLEND, α 0.1, roughness 0.04) |
| Nodes | `StreetWindow` (root) → `WindowStatic`, `Glass`, `Photo_01` … `Photo_12`, `Spot_01` … `Spot_03`, `Camera_Window` |
| Units / axes | metres, glTF Y-up; façade front plane z = 0, display box towards −z (back wall z = −0.98), shop wall z = −3.40 |

**Photo slots.** `Photo_01`…`Photo_09` = main window, row-major from top-left (rows y = 0.71 / 0.10 / −0.51, columns
x = −1.36 / −0.55 / 0.26); `Photo_10`…`Photo_12` = inside wall, top to bottom (x = 2.25, y = 0.53 / 0.03 / −0.47). Each is one
quad (2 triangles) with its origin at its centre, 0.506 × 0.336 m (3:2 landscape; inside ones × 0.76 = 0.385 × 0.255 m),
facing +z, 0.5 mm behind the mat's back face (seen through the bevel cut). TEXCOORD_0 is 0–1 across the quad (glTF convention: v = 0 at the top edge), TEXCOORD_1 points
into the baked atlas (“light falling on white paper” at that spot).

**Integration note (gallery, replaces the procedural build in `components/three/gallery-window.ts`).**
```ts
const gltf = await new GLTFLoader().loadAsync('/models/street-window.glb');      // plain loader, no Draco/KTX2
const root = gltf.scene;                                                          // node "StreetWindow"
const statics = root.getObjectByName('WindowStatic') as THREE.Mesh;               // MeshBasicMaterial (unlit)
(statics.material as THREE.MeshBasicMaterial).toneMapped = false;                 // colours are already tone-mapped
const baked = (statics.material as THREE.MeshBasicMaterial).map!;
const light = baked.clone(); light.channel = 1;                                   // same image, read through uv1
prints.forEach(async (p, i) => {
  const slot = root.getObjectByName(`Photo_${String(i + 1).padStart(2, '0')}`) as THREE.Mesh;
  const tex = await new THREE.TextureLoader().loadAsync(p.src);
  tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false;                       // glTF UV convention
  const a = p.w / p.h, s = 1.5;                                                   // cover-fit into the 3:2 window
  if (a > s) { tex.repeat.set(s / a, 1); tex.offset.set((1 - s / a) / 2, 0); } else { tex.repeat.set(1, a / s); tex.offset.set(0, (1 - a / s) / 2); }
  slot.material = new THREE.MeshBasicMaterial({map: tex, lightMap: light, lightMapIntensity: Math.PI * 1.25, toneMapped: false});
});
```
* `lightMapIntensity = π` reproduces the baked light exactly (three's basic shader divides by π); ×1.25 keeps the real
  photos the brightest element in the window. Without a light map (`MeshBasicMaterial({map})`) photos render at full
  brightness — also acceptable. Before photos load, the `PhotoSlot` placeholder already shows neutral grey paper in the baked light.
* Glass: keep the exported `Glass` (transparent `MeshStandardMaterial`, flat-shaded because no normals are exported) or swap
  in the existing additive reflection-streak material; it is the only non-baked surface. No scene lights are needed.
* Camera: node `Camera_Window` = the recommended view (vertical FOV 28°, position (0.13, 0.05, 5.30), looking at
  (0.13, 0.05, −0.40) — identical to the current `TARGET`/`FOV`/fit distance for 16:9). Keep the ±2.5°/±1.5° pointer
  parallax and the scroll dolly; the façade covers up to 21:9 plus parallax.
* Light-switch metaphor (`exposeLights`): animate `material.color` of `WindowStatic` (and the photo materials) from ≈0.25 to 1;
  the baked pools scale with it. `Spot_01`…`Spot_03` mark the sill fixtures (−Z = beam) if a dynamic spot is ever wanted.
* Budget: 1 context, ≈ 14 draw calls (static, glass, 12 photos) — merge photos into one atlas mesh if draw calls matter.
* Fallback: `public/renders/street-window.webp`.

## 3 · Format objects — `public/renders/format-{135,120,110}.webp`

**Script** `scripts/blender/format_objects.py` · **Original** `docs/evidence/blender/format-objects.blend` · lossless
renders `docs/evidence/blender/format-renders/*@2x.png` · side-by-side scale check `docs/evidence/blender/previews/format-family.jpg`.

One scene, real millimetres, **one camera for all three** (100 mm lens, 270 mm from a target 10 mm above the table, 28°
elevation, 32° from the left) and the same softbox rig (large key high upper-left, top scrim; fill card and rim strip light
the edges but cast no shadows; AgX Medium-High-Contrast, −1.2 EV), Cycles 384 spp with denoising, transparent film + shadow catcher (dark tabletop in
reflections) for a soft contact shadow. Because nothing is rescaled per object, the size difference is true to life.

| Object | Model | Footprint (L × W × H) | 1× (800×600) | @2x (1600×1200) |
|---|---|---|---|---|
| 135 | the v2 GLB (deliverable 1) lying on its side, rolled until the leader tongue rests on the table | 51.2 × 45.7 × 30.5 mm (cassette Ø 25.1 × 51.25 incl. hub; leader resting forward) | 27,790 B | 75,872 B |
| 120 | black plastic spool flanges Ø 24.6 at both ends (slightly larger than the Ø 23.4 paper roll; 61.7 mm between flanges for the 61.5 mm film/paper) with a keyed hub — slot across the core — on the visible end; pale off-white matte backing paper as a one-turn spiral whose overlapping wound edge is turned to the camera; an 18 mm plain seal band in muted amber (the film-base accent, never red) | 64.6 × 24.6 × 24.6 mm | 21,334 B | 54,342 B |
| 110 | generic two-chamber cartridge: round take-up lobe with toothed hub socket, squarer supply chamber, shallow bridge with the exposure gate (amber film visible), small frame-counter window on the back showing plain paper; SDF outline with 2 mm fillets, 1.2 mm rounded edges, Boolean-cut openings | 58.0 × 24.5 × 19.4 mm | 21,210 B | 56,068 B |

No labels, numbers, logos, edge print or brand colours on any of them (the 120 seal band and the 110 counter window are blank).

**Integration note (configurator).** Use them as decorative format pictograms next to the format choice, e.g.
`<img src="/renders/format-120.webp" srcset="/renders/format-120.webp 1x, /renders/format-120@2x.webp 2x" width="800" height="600" alt="" aria-hidden="true">`
(4:3, transparent; display at ≤ 400 × 300 CSS px for crisp 2× or at 800 × 600 on desktop). Keep the three at the **same
display size** so the real size difference stays legible; do not crop them individually. They sit well on both the dark
lab zone and the light stage (soft shadow only, no backdrop). They can replace or accompany the line glyphs in
`components/lab/format-glyph.tsx` (keep the glyphs for small chips).

## 4 · Verification & provenance

* `node scripts/blender/verify-glb.mjs …` parses each GLB (nodes, triangles, vertices, materials, alpha modes, embedded
  image sizes) **and loads it with three.js r186 `GLTFLoader` in Node** (images decoded through sharp): both files load,
  report the node names above and the material types `MeshStandardMaterial` (cartridge) / `MeshBasicMaterial` (window,
  via KHR_materials_unlit).
* Every preview in `docs/evidence/blender/previews/` was inspected during the build (geometry stage, bake channels, the
  unlit baked window exactly as the runtime shows it, the format family at true scale).
* Budgets: cartridge 5,412 tris / 250,568 B (≤ 6k / ≤ 350 KB) · window 2,360 tris / 121,580 B
  (≤ 15k / ≤ 700 KB) · format renders ≤ 80 KB at 1× (largest 27,790 B).
* Higgsfield: three seamless textures (10.25 credits, Ultra plan, 2026-10-07) used only as bake inputs — see
  [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md) and `docs/evidence/higgsfield/generation-log.json` (`blenderAssetPass`). No
  image-to-3D; all geometry is procedural. Machine-readable entries: `public/models/manifest.json`.
* Determinism: fixed Cycles seed, no unseeded randomness; re-running a script reproduces its outputs up to path-tracing noise.
