"""Bake, texture and glTF post-processing helpers shared by the Bilderfürst Blender asset scripts."""
import bpy, json, math, mathutils, os, struct
from bf_common import link, image, pixels, set_pixels, new_material


# ── textures from the Higgsfield brushed-metal source (made tileable, high-passed) ──
def tileable_highpass(src_path, size, sigma_px):
    import numpy as np
    img = bpy.data.images.load(src_path)
    img.scale(size, size)
    a = pixels(img)[..., :3].mean(axis=2)
    bpy.data.images.remove(img)
    F = np.fft.fft2(a)
    fy = np.fft.fftfreq(size)[:, None]; fx = np.fft.fftfreq(size)[None, :]
    low = np.real(np.fft.ifft2(F * np.exp(-2 * (math.pi * sigma_px) ** 2 * (fx ** 2 + fy ** 2))))
    hp = a - low
    hp /= hp.std() + 1e-6
    sh = np.roll(np.roll(hp, size // 2, 0), size // 2, 1)
    x = np.linspace(0, 1, size, endpoint=False)
    m = (np.sin(math.pi * x)[None, :] ** 2) * (np.sin(math.pi * x)[:, None] ** 2)
    out = (hp * m + sh * (1 - m)) / np.sqrt(m ** 2 + (1 - m) ** 2)
    return out


def detail_image(name, arr, gain=0.18):
    import numpy as np
    s = arr.shape[0]
    img = image(name, s, s, color=False, float_buffer=True)
    v = np.clip(0.5 + arr * gain, 0, 1)
    rgba = np.dstack([v, v, v, np.ones_like(v)])
    set_pixels(img, rgba)
    img.pack()
    return img



# ───────────────────────── Cycles bake helpers (EMIT channel / AO / NORMAL into one image) ─────────────────────────
def bake_targets(infos):
    for m, info in infos:
        node = m.node_tree.nodes.new('ShaderNodeTexImage'); node.name = 'bake_target'
        info['target'] = node
        info['emit'] = m.node_tree.nodes.new('ShaderNodeEmission')


def bake(ob, infos, img, kind, channel=None, samples=16):
    scene = bpy.context.scene
    scene.cycles.samples = samples
    for m, info in infos:
        nt = m.node_tree
        info['target'].image = img
        nt.nodes.active = info['target']
        if kind == 'EMIT':
            link(nt, info[channel], info['emit'].inputs['Color'])
            link(nt, info['emit'].outputs[0], info['out'].inputs['Surface'])
        else:
            link(nt, info['bsdf'].outputs[0], info['out'].inputs['Surface'])
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); bpy.context.view_layer.objects.active = ob
    b = scene.render.bake
    b.margin, b.margin_type, b.use_clear, b.target = 12, 'EXTEND', True, 'IMAGE_TEXTURES'
    kw = dict(type=kind)
    if kind == 'NORMAL':
        kw.update(normal_space='TANGENT')
    bpy.ops.object.bake(**kw)
    print('BAKED', kind, channel or '')





def tileable_color(src_path, size, name):
    """Downscale a photo-texture and cross-fade it with its half-shifted copy so it repeats seamlessly."""
    import numpy as np
    img = bpy.data.images.load(src_path)
    img.scale(size, size)
    a = pixels(img)[..., :3].copy()
    bpy.data.images.remove(img)
    sh = np.roll(np.roll(a, size // 2, 0), size // 2, 1)
    x = np.linspace(0, 1, size, endpoint=False)
    m = ((np.sin(math.pi * x)[None, :] ** 2) * (np.sin(math.pi * x)[:, None] ** 2))[..., None]
    out = a * m + sh * (1 - m)
    res = image(name, size, size, color=True)
    set_pixels(res, np.dstack([out, np.ones((size, size))]))
    res.pack()
    return res


def lightmap_unwrap(ob, aspect=2.0, margin=0.003):
    """Smart-project, equalise texel density, apply per-face weights (int attr 'lm_w' = weight×100),
    pre-squash U by the texture aspect and pack into 0–1 (no rotation, so texels stay square)."""
    import bmesh
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=False, scale_to_bounds=False)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.average_islands_scale()
    bm = bmesh.from_edit_mesh(ob.data)
    uv = bm.loops.layers.uv.active
    w = bm.faces.layers.int.get('lm_w')
    for f in bm.faces:
        k = (f[w] / 100.0) if w else 1.0
        for lp in f.loops:
            u, v = lp[uv].uv
            lp[uv].uv = (u * k / aspect, v * k)
    bmesh.update_edit_mesh(ob.data)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=False, scale=True, margin_method='FRACTION', margin=margin, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')


def glb_read(path):
    data = open(path, 'rb').read()
    jlen = struct.unpack_from('<I', data, 12)[0]
    js = json.loads(data[20:20 + jlen].decode('utf8'))
    rest = data[20 + jlen:]
    return js, rest


def glb_write(path, js, rest):
    raw = json.dumps(js, separators=(',', ':')).encode('utf8')
    raw += b' ' * ((4 - len(raw) % 4) % 4)
    total = 12 + 8 + len(raw) + len(rest)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(raw), 0x4E4F534A))
        f.write(raw)
        f.write(rest)


# ───────────────────────── material builders (bake-time and glTF export) ─────────────────────────
def principled(name, rgb, rough=0.6):
    m, nt = new_material(name)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    link(nt, b.outputs[0], out.inputs['Surface'])
    return m, nt, b


def obj_xz(nt, scale):
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    link(nt, tc.outputs['Object'], sep.inputs[0])
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    for i, k in ((0, 'X'), (1, 'Z')):
        mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = scale
        link(nt, sep.outputs[k], mm.inputs[0]); link(nt, mm.outputs[0], comb.inputs[i])
    return comb.outputs[0], tc


def poster_glass(glass):
    m, nt = new_material('poster_glass')
    out = nt.nodes.new('ShaderNodeOutputMaterial'); mix = nt.nodes.new('ShaderNodeMixShader')
    fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs['IOR'].default_value = 1.52
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.02
    link(nt, fr.outputs[0], mix.inputs[0]); link(nt, tr.outputs[0], mix.inputs[1]); link(nt, gl.outputs[0], mix.inputs[2])
    link(nt, mix.outputs[0], out.inputs['Surface'])
    glass.data.materials.clear(); glass.data.materials.append(m)


def unlit_material(name, img=None, rgb=None):
    m, nt = new_material(name)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    if img is not None:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img
        link(nt, t.outputs['Color'], out.inputs['Surface'])     # colour → output = KHR_materials_unlit
    else:
        c = nt.nodes.new('ShaderNodeRGB'); c.outputs[0].default_value = (*rgb, 1)
        link(nt, c.outputs[0], out.inputs['Surface'])
    m.use_backface_culling = True
    return m


def glass_material():
    m, nt = new_material('Glass')
    out = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.86, 0.91, 0.92, 1); b.inputs['Roughness'].default_value = 0.04
    b.inputs['Alpha'].default_value = 0.1
    link(nt, b.outputs[0], out.inputs['Surface'])
    m.surface_render_method = 'BLENDED'; m.use_backface_culling = True
    return m


def split_by_material(static, mat_name, centers, pattern, uv_order):
    """Separate the faces using `mat_name` into one object per loose part, named pattern % (nearest centre + 1),
    with UV layers reordered to uv_order (→ TEXCOORD_0, TEXCOORD_1) and origins at their bounds centre."""
    for me in [m for m in bpy.data.meshes if m.users == 0]:   # free the joined parts' old mesh names
        bpy.data.meshes.remove(me)
    bpy.ops.object.select_all(action='DESELECT')
    static.select_set(True); bpy.context.view_layer.objects.active = static
    idx = [i for i, m in enumerate(static.data.materials) if m.name == mat_name][0]
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.object.mode_set(mode='OBJECT')
    for p in static.data.polygons:
        p.select = p.material_index == idx
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
    photos_ob = [o for o in bpy.context.selected_objects if o is not static][0]
    bpy.ops.object.select_all(action='DESELECT'); photos_ob.select_set(True); bpy.context.view_layer.objects.active = photos_ob
    bpy.ops.mesh.separate(type='LOOSE')
    out = {}
    for o in list(bpy.context.selected_objects):
        c = sum((v.co for v in o.data.vertices), mathutils.Vector()) / len(o.data.vertices)
        i = min(range(len(centers)), key=lambda k: (centers[k] - c).length)
        o.name = o.data.name = pattern % (i + 1)
        me = o.data   # reorder UVs → TEXCOORD_0 = PhotoUV (0–1), TEXCOORD_1 = Lightmap
        data = {n: [tuple(d.uv) for d in me.uv_layers[n].data] for n in uv_order}
        for n in list(me.uv_layers.keys()):
            me.uv_layers.remove(me.uv_layers[n])
        for n in uv_order:
            lay = me.uv_layers.new(name=n)
            for d, uv in zip(lay.data, data[n]):
                d.uv = uv
        out[o.name] = o
    for o in out.values():
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    if uv_order[0] in static.data.uv_layers:
        static.data.uv_layers.remove(static.data.uv_layers[uv_order[0]])
    return [out[k] for k in sorted(out)]
