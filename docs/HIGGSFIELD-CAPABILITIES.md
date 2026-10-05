# Higgsfield capabilities — asset-studio preflight (2026-10-05)

Scope: Higgsfield is used **only as an asset studio for atmosphere/interface material** (textures, one generic prop). It never produces products, packaging, logos, text, people, storefronts, real lab machines, historical photos or anything that could pass as documentary evidence. Results of this pass: [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md), [generation log](evidence/higgsfield/generation-log.json), [model manifest](../public/models/manifest.json).

## Connection

| Check | Result |
|---|---|
| MCP server | `mcp__667d78ea-f941-4cab-80ed-ff436a49a6b5__*` (Higgsfield), deferred tools loaded via ToolSearch |
| `balance` | **OK** — `{"credits":106,"subscription_plan_type":"plus"}` |
| Workspace | one private workspace, owner, Plus plan |
| Project mechanism | Yes (`create_project` / `list_projects`). New project **"Bilderfürst — Cinematic Remake Asset Studio"** `1b1c2c3f-c022-481c-9c45-88ac11346184` holds every generation of this pass. The older 3D Jutsu project `9e1fa240-…` was left untouched. |
| Cost preflight | `get_cost: true` works for image, video and 3D (no job is submitted) |
| Licence / commercial-use info | **Not exposed** by `models_explore` (`list` and `get`) or any other tool used. Rights follow Higgsfield's and the upstream providers' terms; confirm before production. |

**Balance before: 106 credits → after: 86 credits** (20 spent = 18.9 %, cap was ~30 %). 9 image generations (cap 10), 1 3D generation (cap 2), 0 video.

Known quirk: in a 9-item `generate_image_batch`, 3 items were refused with *"Out of credits on plus (monthly) plan"* while 99+ credits remained (no job created, no charge). Resubmitting each alone succeeded. Submit paid jobs in small groups.

## Image models (`models_explore list type=image`, 44 entries, `has_more:false`)

Costs are from `get_cost` preflights at 16:9 (— = not preflighted). All accept a text prompt; "ref" = accepts reference images.

| Model id | Name / provider | Inputs | Aspect ratios | Resolution / quality options | Cost (cr) | Proposed use here |
|---|---|---|---|---|---|---|
| `gpt_image_2_5` | GPT Image 2.5 / OpenAI | text + ref | auto, 1:1, 3:2, 2:3, 4:3, 3:4, 16:9, 9:16, 21:9, 27:16, 16:27, 9:8, 8:9, 4:5, 5:4 | 1k/2k/4k; low…max; flare/sunburst; bg auto/opaque/transparent | 0.5 (low 2k), **1 (medium 2k)** | **Winner for all four textures + 3D reference** |
| `flux_2` | FLUX.2 / Black Forest Labs | text + ref | 1:1, 4:3, 3:4, 16:9, 9:16 | 1k/2k; pro/flex/max | **1.5 (pro 2k)** | Second candidate per target (all rejected) |
| `flux_3_image` | FLUX 3 / BFL | text + up to 10 refs | auto…1:2 (15) | 768sq…4k; batch 1-4 | 3 (2k) | Alternative texture model |
| `flux_kontext` | Flux Kontext / BFL | text + ref | 1:1, 4:3, 3:4, 16:9, 9:16 | — | — | Edits / style transfer |
| `flux_2_pro_outpaint`, `outpaint` | Outpaint | image | per-side px / ratios | — | — | Extend a plate to wider ratios |
| `nano_banana_2` | Nano Banana 2 / Google | text + ref + mask | auto…21:9 | 1k/2k/4k; inpaint | 2 (2k) | Alternative; inpaint fixes |
| `nano_banana_2_lite` | Nano Banana 2 Lite / Google | text + ref + mask | auto…21:9 | 1k | — | Cheap drafts |
| `nano_banana_pro`, `nano_banana_2_shots` | Nano Banana Pro / Google | text + ref | 1:1…21:9 | 1k/2k/4k | 2 (2k) | Typography (not wanted here) |
| `nano_banana` | Nano Banana / Google | text + ref | 1:1…21:9 | — | — | Budget realistic |
| `seedream_v5_lite` | Seedream 5.0 Lite / ByteDance | text + ref | 1:1, 4:3, 3:4, 16:9, 9:16, 21:9 | basic/high | 1 | Alternative texture model |
| `seedream_5_0_flash` | Seedream 5.0 Flash / ByteDance | text + ref | auto…21:9 | 1k/1.5k/2k | — | Fast drafts |
| `seedream_v5_pro` | Seedream 5.0 Pro / ByteDance | text + ref | 1:1…21:9 | 1k/1.5k/2k; remove_bg; inpaint | 2.5 (2k) | Instruction edits |
| `seedream_v4_5` | Seedream 4.5 / ByteDance | text + ref | 1:1…21:9 | basic (4K) / high (~6K) | — | Very large plates |
| `3d_jutsu_angles` | 3D Jutsu Angles (Seedream 5 Pro) | text + ref | 1:1…21:9 | 1k–2k | — | Extra views for multi-view 3D |
| `soul_cinematic` | Soul Cinema / Higgsfield | text + 1 ref | 1:1…21:9 | 1.5k/2k | 1 (0.12 exact) | Cinematic stills (cheap) |
| `cinematic_studio_2_5` | Cinema Studio Image 2.5 / Higgsfield | text + ref | 1:1…21:9 | 1k/2k/4k | 2 (2k) | Cinematic plates |
| `cinematic_studio_image` | Cinematic Studio Image | text + ref | 1:1…21:9 | camera body/lens/focal presets required | — | Not needed |
| `soul_location`, `cinematic_studio_soul_location` | Soul Location / Higgsfield | text | 1:1…9:21 | — | — | Environments (avoid: could read as a real place) |
| `soul_2`, `soul_v2` | Soul 2.0 / Higgsfield | text + 1 ref | 1:1…2:3 | 1.5k/2k; soul_id | — | **Not used** (people/fashion) |
| `soul_cast`, `cinematic_studio_soul_cast` | Soul Cast | text | 16:9 / many | budget | — | **Not used** (characters) |
| `soul_cinema_studio` | Soul Cinema Studio | text + ref | 1:1…21:9 | 1.5k/2k; style presets | — | — |
| `z_image` | Z Image / Tongyi-MAI | text | 1:1, 4:3, 3:4, 16:9, 9:16 | — | 0.15 | Throwaway drafts |
| `kling_omni_image` | Kling O1 Image | text + ref | 1:1…21:9 | 1k/2k | — | Alternative photoreal |
| `grok_image`, `grok_image_2_0` | Grok Image / xAI | text + ref | 1:1…9:16 | 1k/2k | — | High-contrast (off-brief) |
| `ideogram_4_5` | Ideogram 4.5 | text + ref + mask | 23 ratios | 1k/2k | — | Typography (not wanted) |
| `openai_hazel` | OpenAI Hazel | text + ref | 1:1, 3:2, 2:3, auto | low/med/high | — | Text rendering (not wanted) |
| `recraft_v4_1` | Recraft V4.1 | text | 1:1…9:16 | 1k/2k; standard/vector/utility; palette | — | Possible flat SVG-like icons (not used) |
| `gpt_image_2` | GPT Image 2 / OpenAI | text + ref | 1:1…2:3 | 1k/2k/4k; low/med/high | — | Superseded by 2.5 |
| `image_auto` | Auto router | text + ref | 1:1, 4:3, 3:4, 16:9, 9:16 | — | — | Not deterministic; avoid |
| `marketing_studio_image`, `marketing_studio_2_image`, `ms_image` | Marketing Studio / DTC Ads | product refs | many | — | — | **Not used** (product/ad imagery forbidden) |
| `autosprite` | AutoSprite | character image | — | frames, size | — | Not relevant |
| `image_background_remover`, `image_decompose` | Utilities | image | — | — | — | Cut-outs / layer split |
| `topaz_image`, `topaz_image_generative`, `bytedance_image_upscale` | Upscalers | image | — | target px / 2k–4k | — | Upscale a winner if ever needed |

## Video models (`type=video`, 54 entries)

All generate MP4; most accept `start_image`/`end_image`. Notables: `cinematic_studio_3_0` (4–15 s, 480p–4k), `cinematic_studio_video` (5/10 s), `cinematic_studio_video_v2` (3–12 s, sound on/off), `seedance_2_5`, `seedance_2_0`, `seedance_2_0_mini` (480p/720p), `seedance1_5`, `kling3_0`/`kling3_0_turbo`/`kling2_6`, `wan2_6`/`wan2_7`/`wan3_0`/`wan3_0_prime`, `veo3`/`veo3_1`/`veo3_1_lite`, `minimax_hailuo`/`minimax_h3`/`minimax_h3_max`, `grok_video`/`grok_video_v15`/`grok_video_v15_lite`, `flux_3_video`, `gemini_omni`/`gemini_omni_flash_1_1`, `happy_horse_video`, `cinematic_studio_video_3_5`, `cinematic_studio_video_4_0`; edit/utility: `flux_3_video_edit`, `kling_video_edit`, `reframe`, `draw_to_video`, `hf_mult_motion_control`, `hf_mult_replace_object`, `kling3_0_motion_control`, upscalers (`topaz_video`, `topaz_hyperion_2_5`, `bytedance_video_upscale`, `video_upscale`), `video_deflicker`, `fps_boost`, `depth_anything_video`, background removal (`video_background_remover`, `sam_3_video`), audio/lipsync (`voice_change`, `dubbing`, `sync_so`), marketing/ad tools (`marketing_studio_video`, `marketing_studio_v2_video`, `marketing_studio_v2_reference2video`, `ad_multiplier`, `higgsfield_preset`, `clipify`).

Preflighted (get_cost only, nothing submitted), 5 s silent 16:9: `seedance_2_0_mini` 480p **2.5 cr**, `grok_video_v15_lite` 480p 5 cr, `wan3_0` 480p 5 cr, `kling3_0_turbo` 720p 7.5 cr.
**Decision: no video.** None produces a seamless loop natively; 480p is too soft full-bleed; Vanta FOG + CSS/Anime.js already supply bounded motion and the static plates cover reduced-motion/mobile.

## 3D models (`type=3d`, 17 entries — all output GLB)

| Model id | Provider | Input | Key params | Cost (cr) | Note |
|---|---|---|---|---|---|
| `tripo_h3_1_image_to_3d` | Tripo | 1 image | face_limit 1k–2M, texture, pbr, quality std/detailed, quad | **9** (20k faces, PBR) | **Used — accepted** |
| `tripo_h3_1_multiview_to_3d` | Tripo | 2–4 views | same | — | Better geometry with views |
| `tripo_3d` | Tripo | text | face_limit, texture, pbr | 5 (30k) | Text-to-3D fallback |
| `sam_3_3d` | Meta | 1 image | detection_threshold, textured GLB | 1 | Cheap fallback (not needed) |
| `image_to_3d` / `meshy_image_to_3d` | Meshy | 1 image | should_texture, target_polycount, pbr, remesh | 30 textured / 20 untextured (20k) | Too costly |
| `multi_image_to_3d` / `meshy_multi_image_to_3d` | Meshy | 1–4 images | same | — | — |
| `meshy_v7_image_to_3d` | Meshy 7 | image | lowpoly/standard, ultra_mode | 38 | Too costly |
| `meshy_v6_text_to_3d` | Meshy 6 | text | preview/full, lowpoly | — | — |
| `hunyuan3d_v3_image_to_3d` | Tencent | 1+ images | Normal/LowPoly/Geometry, face_count ≥40k | 18 (LowPoly 40k) | Too costly, too dense |
| `hunyuan3d_v3_1_text_to_3d` | Tencent | text | std/pro | — | — |
| `meshy_v5_remesh`, `meshy_v5_retexture` | Meshy | GLB URL | polycount / style prompt | — | Post-processing |
| `3d_rigging` / `meshy_rigging`, `sam_3_3d_body` | Meshy / Meta | GLB / person image | — | — | **Not relevant** (characters/people) |

Higgsfield also exposes **3D Jutsu / scene builder** tools (`scene_builder_3d_*`: create project, run/query Python in Blender, render, export GLB/.blend), which made the earlier props.

## Prior Higgsfield work (unchanged)

From [provenance.json](evidence/higgsfield/provenance.json) and the "Higgsfield delivery" section of [FINAL-VISUAL-REPORT.md](FINAL-VISUAL-REPORT.md): 3D Jutsu project `9e1fa240-ae3d-49dd-b6f6-dc114bfbfd63`, revision 1, scene sequence 0. Six generic stylized roots (Aperture, Reel, Cassette, VHS, Negative, Prints) built procedurally ([create-props.py](evidence/higgsfield/create-props.py)) → `public/props/analog-craft.glb` (589,592 B, 12,772 triangles, 7 untextured materials, 8 animations, `KHR_lights_punctual` required) + editable `analog-craft.blend` + six 400×300 transparent Eevee posters converted to WebP in `public/props/`. One combined render timed out and was rolled back; smaller renders succeeded. Purpose recorded there: "Generic stylized illustrations only."

## This pass — results

| Asset | Path | Model | Bytes | Status |
|---|---|---|---|---|
| darkroom-safelight | `public/textures/darkroom-safelight.{webp,avif}` 1920×1086 | gpt_image_2_5 | 19,828 / 6,869 | accepted |
| scanner-light | `public/textures/scanner-light.{webp,avif}` 1920×1086 | gpt_image_2_5 | 69,348 / 18,792 | accepted |
| film-base-amber | `public/textures/film-base-amber.{webp,avif}` 1920×1086 | gpt_image_2_5 | 46,010 / 23,121 | accepted |
| archival-paper | `public/textures/archival-paper.{webp,avif}` 1200×1200 | gpt_image_2_5 | 114,474 / 31,784 | accepted |
| film-cartridge | `public/models/film-cartridge.glb` (18,766 tris, 3×1024² WebP) | tripo_h3_1_image_to_3d | 551,632 | accepted |
| 4 FLUX.2 candidates | `docs/evidence/higgsfield/generated/*-A-flux2.rejected-preview.jpg` | flux_2 | — | rejected (see log) |
