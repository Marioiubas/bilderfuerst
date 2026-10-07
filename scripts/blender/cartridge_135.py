"""HERO CARTRIDGE v2 — generic, unbranded 135 film cassette (Blender 5.2 procedural script).

blender -b --factory-startup -P scripts/blender/cartridge_135.py -- [--quick]
Outputs: public/models/film-cartridge-v2.glb, public/renders/cartridge-135.webp,
         public/textures/cartridge-contact-shadow.webp,
         docs/evidence/blender/cartridge-135.blend (+ previews/ and the baked PNG originals).
  -- --variant mobile   phone build (MOBILE-3D-PLAN B1): public/models/film-cartridge-v2-mobile.glb — coarser
                        outlines/lathes (≤ 2.5k tris), 512² base (AO multiplied in) + ORM, no normal map;
                        identical node names, markers and bounds.
  -- --stage export     re-export the desktop GLB from the saved .blend (adds CartridgeEdges) and re-render
                        the contact shadow, without re-baking.
Both GLBs carry `CartridgeEdges`: the feature lines (≥ 32°, as three's EdgesGeometry) as glTF LINES.

Modelled in millimetres around a Z-up spool axis (z=0 = flat cap face), then normalised to 1.0
unit total height and exported glTF Y-up, matching the v1 conventions (spool hub +Y, leader exiting
towards -Z/+X along (0.78, 0, -0.62)). Real proportions: shell Ø24, caps Ø25.1, cap-to-cap 45 mm,
keyed spool hub +5.8 mm, felt light-trap lips, leader tongue with KS perforations (1.98 × 2.794 mm,
pitch 4.75 mm). No text, logos, labels or brand colours anywhere.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bf_common as C
import bf_bake as K
from bf_common import v2

ARGS = C.script_args()
QUICK = '--quick' in ARGS
MOBILE = '--variant' in ARGS and 'mobile' in ARGS
OUT_GLB = C.path('public', 'models', 'film-cartridge-v2-mobile.glb' if MOBILE else 'film-cartridge-v2.glb')
OUT_POSTER = C.path('public', 'renders', 'cartridge-135.webp')
OUT_SHADOW = C.path('public', 'textures', 'cartridge-contact-shadow.webp')
EVID = C.path('docs', 'evidence', 'blender')
PREV = os.path.join(EVID, 'previews')
TEX = 512 if MOBILE else 1024
# Mesh resolution. The outlines are Douglas–Peucker simplifications of the same SDF contours, so the
# mobile build keeps the extents (bounds), the slot and every marker; only the facet count changes.
RES = (dict(step=0.03, tol=0.05, lathe=20, inner=2, outer=3, margin=6) if MOBILE else
       dict(step=0.025, tol=0.01, lathe=40, inner=3, outer=4, margin=10))
EDGE_DEG = 32.0          # feature-line angle, identical to the runtime EdgesGeometry(geo, 32) it replaces

# ── dimensions (mm) ──
R = 12.0                 # metal shell radius (Ø24)
CAP_OFF = 0.55           # cap outline = shell outline grown by this (Ø25.1)
CT = 2.0                 # cap thickness
Z_TOP = 45.0             # cap-to-cap length
SHELL_Z = (1.2, 43.8)    # shell ends are hidden inside the caps
FILM_W, FILM_ZC = 35.0, 22.5
D = v2(0.78, 0.62).normalized()          # leader exit direction (v1 EXIT, Blender XY)
N = v2(-D.y, D.x)                        # outward side normal of the film line
H0 = R - 0.9                             # film centre line distance from the spool axis
S_EXIT = math.sqrt(R * R - H0 * H0)      # where the film line leaves the shell circle
S_MOUTH = S_EXIT + 3.0                   # mouth (lip) end along D
NOSE_HW, NOSE_R, SLOT_HW = 1.6, 0.7, 0.3


def nose_box(p):
    c = N * H0 + D * ((S_EXIT - 3.5 + S_MOUTH) / 2)
    return C.sd_round_box(p, c, D, ((S_MOUTH - (S_EXIT - 3.5)) / 2, NOSE_HW), NOSE_R)


def f_body(p):   # shell + light-trap nose, filleted (no slot)
    return C.smin(C.sd_circle(p, v2(0, 0), R), nose_box(p), 1.5)


def f_shell(p):  # with the film slot cut into the nose
    c = N * H0 + D * ((S_EXIT - 3.0 + S_MOUTH + 1.0) / 2)
    slot = C.sd_round_box(p, c, D, ((S_MOUTH + 1.0 - (S_EXIT - 3.0)) / 2, SLOT_HW), 0.0)
    return max(f_body(p), -slot)


def f_cap(p):
    return f_body(p) - CAP_OFF


def local(p):    # (along D from the mouth, across from the film line)
    return p.dot(D) - S_MOUTH, p.dot(N) - H0


def contour(f, step=0.03, tol=0.012):
    pts = C.walk_contour(f, (-R - 2, 0.0), step)
    pts = C.simplify_closed(pts, tol)
    # walk_contour goes counter-clockwise when the gradient points outward; enforce CCW
    area = sum(a.x * b.y - b.x * a.y for a, b in zip(pts, pts[1:] + pts[:1]))
    return pts if area > 0 else list(reversed(pts))


# ───────────────────────── geometry ─────────────────────────
MAT_SHELL, MAT_PLASTIC, MAT_FELT = 0, 1, 2


def is_felt(p):
    a, h = local(p)
    return a > -3.6 and abs(h) < SLOT_HW + 1.05


def ring_uv(ring):
    s, total = C.arc_params(ring)
    return s, total


def build_shell(mb):
    ring2 = contour(f_shell, step=RES['step'], tol=RES['tol'])
    s, total = ring_uv(ring2)
    mb.island('shell')
    z0, z1 = SHELL_Z
    bot = mb.verts([Vector((p.x, p.y, z0)) for p in ring2])
    top = mb.verts([Vector((p.x, p.y, z1)) for p in ring2])
    n = len(ring2)
    for i in range(n):
        j = (i + 1) % n
        mid = (ring2[i] + ring2[j]) * 0.5
        mat = MAT_FELT if is_felt(mid) else MAT_SHELL
        mb.face([bot[i], bot[j], top[j], top[i]], [(s[i], z0), (s[i + 1], z0), (s[i + 1], z1), (s[i], z1)], mat)
    return len(ring2)


def cap_profile(bottom):
    """(inset, z) from the inner face edge round the rim to the outer face edge."""
    prof = []
    ni, no = RES['inner'], RES['outer']
    for k in range(ni):                      # inner edge, r = 0.35
        a = math.radians(90 * k / (ni - 1))
        prof.append((0.35 - 0.35 * math.sin(a), CT - 0.35 + 0.35 * math.cos(a)))
    for k in range(no):                      # outer edge, r = 0.8
        b = math.radians(90 * k / (no - 1))
        prof.append((0.8 - 0.8 * math.cos(b), 0.8 - 0.8 * math.sin(b)))
    if not bottom:
        prof = [(d, Z_TOP - z) for d, z in prof]
    return prof


def build_cap(mb, bottom, base_ring):
    tag = 'B' if bottom else 'T'
    prof = cap_profile(bottom)
    rings_pts = [C.offset_ring(f_cap, base_ring, d) if d > 1e-6 else list(base_ring) for d, _ in prof]
    s, total = ring_uv(base_ring)
    mb.island('cap%s_rim' % tag)
    rings, acc = [], 0.0
    vcoord = [0.0]
    for (d0, z0), (d1, z1) in zip(prof, prof[1:]):
        vcoord.append(vcoord[-1] + math.hypot(d1 - d0, z1 - z0))
    for pts, (_, z) in zip(rings_pts, prof):
        rings.append(mb.verts([Vector((p.x, p.y, z)) for p in pts]))
    for k in range(len(rings) - 1):
        uva = [(si, vcoord[k]) for si in s]
        uvb = [(si, vcoord[k + 1]) for si in s]
        mb.strip(rings[k], rings[k + 1], uva, uvb, MAT_PLASTIC, flip=bottom)
    # inner face (towards the shell, mostly hidden): small island
    mb.island('cap%s_inner' % tag, 0.35)
    xs = [p.x for p in base_ring]; ys = [p.y for p in base_ring]
    bounds = (min(xs), min(ys), max(xs), max(ys))
    mb.fill([rings[0]], lambda co: (co.x, co.y), MAT_PLASTIC, flip=not bottom)
    return rings[-1], bounds


def build_bottom_center(mb, outer_loop):
    prof = [(7.0, 0.0), (6.8, 0.2), (5.0, 0.2), (4.75, -0.25), (4.55, -0.45), (3.55, -0.45), (3.3, -0.2), (3.3, 5.0), (0.0, 5.0)]
    mb.island('bottom_center')
    L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(prof, prof[1:]))
    rings = C.lathe_rings(mb, prof, RES['lathe'], (0, 0, 2 * math.pi * 7.0, L), MAT_PLASTIC, flip=True)
    mb.island('capB_face')
    mb.fill([outer_loop, rings[0]], lambda co: (co.x, co.y), MAT_PLASTIC, flip=True)


def cross_outline(w=0.75, a=2.9):
    return [(a, w), (w, w), (w, a), (-w, a), (-w, w), (-a, w), (-a, -w), (-w, -w), (-w, -a), (w, -a), (w, -w), (a, -w)]


def build_top_center(mb, outer_loop):
    zt = Z_TOP
    prof = [(6.8, zt), (6.5, zt + 0.3), (5.3, zt + 0.3), (5.0, zt), (4.65, zt), (4.65, zt - 0.3), (4.35, zt - 0.3),
            (4.35, zt + 5.4), (4.05, zt + 5.75), (3.9, zt + 5.8)]
    mb.island('top_center')
    L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(prof, prof[1:]))
    rings = C.lathe_rings(mb, prof, RES['lathe'], (0, 0, 2 * math.pi * 6.8, L), MAT_PLASTIC)
    mb.island('capT_face')
    mb.fill([outer_loop, rings[0]], lambda co: (co.x, co.y), MAT_PLASTIC)
    # keyed hub end: cross recess
    zh, depth = zt + 5.8, 1.6
    cross = cross_outline()
    top = mb.verts([Vector((x, y, zh)) for x, y in cross])
    low = mb.verts([Vector((x, y, zh - depth)) for x, y in cross])
    mb.island('hub_top')
    mb.fill([rings[-1], top], lambda co: (co.x, co.y), MAT_PLASTIC)
    mb.island('hub_key', 0.8)
    cr = [v2(x, y) for x, y in cross]
    s, _ = C.arc_params(cr)
    mb.strip(top, low, [(si, depth) for si in s], [(si, 0.0) for si in s], MAT_PLASTIC, flip=False)
    mb.island('hub_key_floor', 0.8)
    mb.fill([low], lambda co: (co.x, co.y), MAT_PLASTIC)
    return zh


def build_cassette():
    mb = C.MeshBuilder('Cassette')
    n_shell = build_shell(mb)
    base = contour(f_cap, step=RES['step'], tol=RES['tol'])
    bot_face, _ = build_cap(mb, True, base)
    top_face, _ = build_cap(mb, False, base)
    build_bottom_center(mb, bot_face)
    z_hub = build_top_center(mb, top_face)
    density = mb.pack(TEX, margin=RES['margin'])
    ob = mb.finish(sharp_angle_deg=40)
    print('CASSETTE outline pts', n_shell, 'cap pts', len(base), 'texel px/mm %.2f' % density)
    return ob, z_hub


# ── leader tongue: full width out of the lips, classic cut down to the lower tongue, KS perforations ──
LEAD = dict(x_in=-3.2, x1=6.0, x2=14.0, x_end=24.0, y_tongue=-1.0, r_top=4.0, r_bot=1.5)
KS = dict(w=1.98, h=2.794, r=0.5, pitch=4.75, edge=2.01, x0=1.2)


def leader_outline():
    L = LEAD; hw = FILM_W / 2
    pts = [(L['x_in'], -hw)]
    def arc(cx, cy, r, a0, a1, n):
        return [(cx + r * math.cos(a0 + (a1 - a0) * k / n), cy + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]
    pts += arc(L['x_end'] - L['r_bot'], -hw + L['r_bot'], L['r_bot'], -math.pi / 2, 0, 3)
    pts += arc(L['x_end'] - L['r_top'], L['y_tongue'] - L['r_top'], L['r_top'], 0, math.pi / 2, 6)
    for k in range(13):   # leader cut: smooth cosine ramp up to the full-width top edge
        x = L['x2'] - (L['x2'] - L['x1']) * k / 12
        y = L['y_tongue'] + (hw - L['y_tongue']) * (0.5 - 0.5 * math.cos(math.pi * k / 12))
        pts.append((x, y))
    pts.append((L['x_in'], hw))
    return pts


def top_edge(x):
    L = LEAD; hw = FILM_W / 2
    if x <= L['x1']:
        return hw
    if x >= L['x2']:
        return L['y_tongue']
    t = (L['x2'] - x) / (L['x2'] - L['x1'])
    return L['y_tongue'] + (hw - L['y_tongue']) * (0.5 - 0.5 * math.cos(math.pi * t))


def perforations():
    hw = FILM_W / 2
    holes = []
    for row in (1, -1):
        y0 = row * (hw - KS['edge'] - KS['h'] / 2)
        for k in range(12):
            xc = KS['x0'] + k * KS['pitch']
            xa, xb = xc - KS['w'] / 2, xc + KS['w'] / 2
            if xb > LEAD['x_end'] - 1.6:
                break
            if row > 0 and min(top_edge(xa), top_edge(xb)) < y0 + KS['h'] / 2 + 0.5:
                continue
            w, h, r = KS['w'] / 2, KS['h'] / 2, KS['r']
            poly = []
            for cx, cy, a0 in ((w - r, h - r, 0), (-w + r, h - r, 90), (-w + r, -h + r, 180), (w - r, -h + r, 270)):
                for a in (a0, a0 + 45, a0 + 90):
                    poly.append((xc + cx + r * math.cos(math.radians(a)), y0 + cy + r * math.sin(math.radians(a))))
            holes.append(poly)
    return holes


def film_point(x, y):
    p = N * H0 + D * (S_MOUTH + x)
    return Vector((p.x, p.y, FILM_ZC + y))


def build_leader():
    mb = C.MeshBuilder('Leader')
    outer = mb.verts([film_point(x, y) for x, y in leader_outline()])
    holes = [mb.verts([film_point(x, y) for x, y in h]) for h in perforations()]
    span = LEAD['x_end'] - LEAD['x_in']
    mb.fill([outer] + holes, lambda co: ((co - film_point(LEAD['x_in'], -FILM_W / 2)).dot(Vector((D.x, D.y, 0))) / span,
                                          (co.z - FILM_ZC + FILM_W / 2) / FILM_W), 0)
    ob = mb.finish(sharp_angle_deg=80)
    print('LEADER holes', len(holes))
    return ob


def empty(name, co, parent=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 2.0
    e.location = co
    bpy.context.scene.collection.objects.link(e)
    if parent:
        e.parent = parent
    return e


# ───────────────────────── bake materials (procedural, high detail) ─────────────────────────
def mat_shell(detail):
    m, nt = C.new_material('bake_shell')
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    C.link(nt, tc.outputs['Object'], sep.inputs[0])
    ang = nt.nodes.new('ShaderNodeMath'); ang.operation = 'ARCTAN2'
    C.link(nt, sep.outputs['Y'], ang.inputs[0]); C.link(nt, sep.outputs['X'], ang.inputs[1])
    u = nt.nodes.new('ShaderNodeMath'); u.operation = 'MULTIPLY'; u.inputs[1].default_value = 2.0 / (2 * math.pi)  # 2 tiles round
    C.link(nt, ang.outputs[0], u.inputs[0])
    v = nt.nodes.new('ShaderNodeMath'); v.operation = 'MULTIPLY'; v.inputs[1].default_value = 1.0 / 37.7
    C.link(nt, sep.outputs['Z'], v.inputs[0])
    comb = nt.nodes.new('ShaderNodeCombineXYZ'); C.link(nt, u.outputs[0], comb.inputs[0]); C.link(nt, v.outputs[0], comb.inputs[1])
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = detail; tex.interpolation = 'Cubic'
    C.link(nt, comb.outputs[0], tex.inputs[0])
    # slow tonal drift of the brushed sheet
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 0.06; noise.inputs['Detail'].default_value = 3
    C.link(nt, tc.outputs['Object'], noise.inputs['Vector'])
    base = nt.nodes.new('ShaderNodeMix'); base.data_type = 'RGBA'
    sock = lambda coll, name: [x for x in coll if x.name == name and x.type == 'RGBA'][0]
    sock(base.inputs, 'A').default_value = (0.25, 0.255, 0.262, 1); sock(base.inputs, 'B').default_value = (0.34, 0.345, 0.352, 1)
    mixf = nt.nodes.new('ShaderNodeMath'); mixf.operation = 'MULTIPLY_ADD'
    C.link(nt, tex.outputs['Color'], mixf.inputs[0]); mixf.inputs[1].default_value = 0.5; C.link(nt, noise.outputs['Fac'], mixf.inputs[2])
    C.link(nt, mixf.outputs[0], base.inputs[0])
    rough = nt.nodes.new('ShaderNodeMapRange'); rough.inputs['To Min'].default_value = 0.24; rough.inputs['To Max'].default_value = 0.42
    C.link(nt, tex.outputs['Color'], rough.inputs['Value'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.35; bump.inputs['Distance'].default_value = 0.02
    C.link(nt, tex.outputs['Color'], bump.inputs['Height'])
    metal = nt.nodes.new('ShaderNodeValue'); metal.outputs[0].default_value = 1.0
    C.link(nt, sock(base.outputs, 'Result'), bsdf.inputs['Base Color']); C.link(nt, rough.outputs['Result'], bsdf.inputs['Roughness'])
    C.link(nt, metal.outputs[0], bsdf.inputs['Metallic']); C.link(nt, bump.outputs['Normal'], bsdf.inputs['Normal'])
    C.link(nt, bsdf.outputs[0], out.inputs['Surface'])
    return m, dict(base=sock(base.outputs, 'Result'), rough=rough.outputs['Result'], metal=metal.outputs[0], out=out, bsdf=bsdf)


def mat_simple(name, base_rgb, rough_lo, rough_hi, scale, bump_strength, detail=4.0):
    m, nt = C.new_material(name)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = scale; noise.inputs['Detail'].default_value = detail
    C.link(nt, tc.outputs['Object'], noise.inputs['Vector'])
    rgb = nt.nodes.new('ShaderNodeRGB'); rgb.outputs[0].default_value = (*base_rgb, 1)
    rough = nt.nodes.new('ShaderNodeMapRange'); rough.inputs['To Min'].default_value = rough_lo; rough.inputs['To Max'].default_value = rough_hi
    C.link(nt, noise.outputs['Fac'], rough.inputs['Value'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = bump_strength; bump.inputs['Distance'].default_value = 0.02
    C.link(nt, noise.outputs['Fac'], bump.inputs['Height'])
    metal = nt.nodes.new('ShaderNodeValue'); metal.outputs[0].default_value = 0.0
    C.link(nt, rgb.outputs[0], bsdf.inputs['Base Color']); C.link(nt, rough.outputs['Result'], bsdf.inputs['Roughness'])
    C.link(nt, metal.outputs[0], bsdf.inputs['Metallic']); C.link(nt, bump.outputs['Normal'], bsdf.inputs['Normal'])
    C.link(nt, bsdf.outputs[0], out.inputs['Surface'])
    return m, dict(base=rgb.outputs[0], rough=rough.outputs['Result'], metal=metal.outputs[0], out=out, bsdf=bsdf)


def mat_film():
    m, nt = C.new_material('FilmBase')
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.125, 0.044, 0.017, 1)   # amber-brown film base (sRGB ≈ #633B23)
    bsdf.inputs['Roughness'].default_value = 0.26
    bsdf.inputs['Alpha'].default_value = 0.9
    C.link(nt, bsdf.outputs[0], out.inputs['Surface'])
    m.use_backface_culling = False
    m.surface_render_method = 'BLENDED'
    return m


# ───────────────────────── bake ─────────────────────────
def bake_all(ob, infos):
    import numpy as np
    scene = bpy.context.scene
    C.use_cycles_metal(scene, 16, denoise=False)
    scene.world = scene.world or bpy.data.worlds.new('bake_world')
    scene.world.light_settings.distance = 5.0          # AO reach in mm
    kinds = ('base', 'rough', 'metal', 'ao') + (() if MOBILE else ('normal',))
    imgs = {k: C.image('cart_' + k, TEX, TEX, color=(k == 'base'), float_buffer=(k != 'base')) for k in kinds}
    K.bake_targets(infos)
    K.bake(ob, infos, imgs['base'], 'EMIT', 'base', 4)
    K.bake(ob, infos, imgs['rough'], 'EMIT', 'rough', 4)
    K.bake(ob, infos, imgs['metal'], 'EMIT', 'metal', 1)
    if not MOBILE:
        K.bake(ob, infos, imgs['normal'], 'NORMAL', samples=8 if QUICK else 32)
    K.bake(ob, infos, imgs['ao'], 'AO', samples=64 if QUICK else 512)
    ao = C.pixels(imgs['ao'])[..., 0]
    ao = 0.25 + 0.75 * np.clip(ao, 0, 1) ** 0.85          # keep occlusion photographic, never pitch black
    rough, metal = C.pixels(imgs['rough'])[..., 0], C.pixels(imgs['metal'])[..., 0]
    if MOBILE:
        # phones: no occlusion texture (no aoMap sampling) → AO multiplied into the sRGB base colour (in linear)
        base = C.pixels(imgs['base']).copy()
        lin = np.where(base[..., :3] <= 0.04045, base[..., :3] / 12.92, ((base[..., :3] + 0.055) / 1.055) ** 2.4)
        lin *= (0.35 + 0.65 * ao)[..., None]
        base[..., :3] = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * np.power(np.maximum(lin, 0), 1 / 2.4) - 0.055)
        C.set_pixels(imgs['base'], base)
        orm = np.dstack([np.ones_like(ao), rough, metal, np.ones_like(ao)])
    else:
        orm = np.dstack([ao, rough, metal, np.ones_like(ao)])
    out = {'base': imgs['base']}
    if not MOBILE:
        out['normal'] = imgs['normal']
    out['orm'] = C.image('cart_orm', TEX, TEX, color=False)
    C.set_pixels(out['orm'], orm)
    os.makedirs(os.path.join(EVID, 'cartridge-135-textures'), exist_ok=True)
    tag = 'cartridge-mobile-%s.png' if MOBILE else 'cartridge-%s.png'
    for k in list(out):
        img = out[k]
        if img.is_float:   # store 8-bit copies (what the GLB carries)
            fixed = C.image('cart_%s_8' % k, TEX, TEX, color=False)
            C.set_pixels(fixed, C.pixels(img)); img = out[k] = fixed
        C.save_image(img, os.path.join(EVID, 'cartridge-135-textures', tag % k), 'PNG', color_mode='RGB')
        img.filepath = os.path.join(EVID, 'cartridge-135-textures', tag % k); img.source = 'FILE'; img.reload()
        img.colorspace_settings.name = 'sRGB' if k == 'base' else 'Non-Color'
    return out


def export_material(tex):
    m, nt = C.new_material('Cassette')
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tb = nt.nodes.new('ShaderNodeTexImage'); tb.image = tex['base']
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = tex['orm']
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    C.link(nt, tb.outputs['Color'], bsdf.inputs['Base Color'])
    C.link(nt, to.outputs['Color'], sep.inputs[0])
    C.link(nt, sep.outputs['Green'], bsdf.inputs['Roughness']); C.link(nt, sep.outputs['Blue'], bsdf.inputs['Metallic'])
    if 'normal' in tex:     # desktop only: occlusion (ORM.r) + tangent-space normal map
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = tex['normal']
        nm = nt.nodes.new('ShaderNodeNormalMap')
        grp = nt.nodes.new('ShaderNodeGroup'); grp.node_tree = C.gltf_output_group()
        C.link(nt, sep.outputs['Red'], grp.inputs['Occlusion'])
        C.link(nt, tn.outputs['Color'], nm.inputs['Color']); C.link(nt, nm.outputs['Normal'], bsdf.inputs['Normal'])
    C.link(nt, bsdf.outputs[0], out.inputs['Surface'])
    m.use_backface_culling = True          # closed, opaque → glTF doubleSided: false
    return m


def assign_single(ob, mat):
    ob.data.materials.clear(); ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.material_index = 0


def normalise(objs, empties, z_min, z_max):
    """1.0 unit = full height (flat cap face to keyed hub end); origin on the spool axis at mid height."""
    H, zc = z_max - z_min, (z_min + z_max) / 2
    for ob in objs:
        for v in ob.data.vertices:
            v.co = Vector((v.co.x / H, v.co.y / H, (v.co.z - zc) / H))
        ob.data.update()
    for e in empties:
        e.location = Vector((e.location.x / H, e.location.y / H, (e.location.z - zc) / H))
    return H, zc


def export_glb(root):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in [root] + list(root.children):
        ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', use_selection=True, export_yup=True,
                              export_image_format='WEBP', export_image_quality=88, export_texcoords=True,
                              export_normals=True, export_tangents=False, export_materials='EXPORT',
                              export_cameras=False, export_lights=False, export_extras=False, export_apply=True,
                              use_mesh_edges=True)   # loose edges → glTF LINES (CartridgeEdges)
    print('EXPORTED', OUT_GLB, os.path.getsize(OUT_GLB))


def feature_edges(src, root):
    """`CartridgeEdges`: the cassette's feature lines (dihedral ≥ EDGE_DEG plus open borders) as loose edges →
    glTF LINES. Baked twin of three's EdgesGeometry(geometry, 32), which cost ≈ 0.29 s at 4× CPU per mount."""
    bm = bmesh.new(); bm.from_mesh(src.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    lim = math.radians(EDGE_DEG) - 1e-6
    keep = [e for e in bm.edges if len(e.link_faces) != 2 or e.calc_face_angle(0.0) >= lim]
    index, verts, edges = {}, [], []
    for e in keep:
        pair = []
        for v in e.verts:
            if v.index not in index:
                index[v.index] = len(verts); verts.append(tuple(v.co))
            pair.append(index[v.index])
        edges.append(tuple(pair))
    bm.free()
    old = bpy.data.objects.get('CartridgeEdges')
    if old:
        bpy.data.objects.remove(old)
    me = bpy.data.meshes.new('CartridgeEdges'); me.from_pydata(verts, edges, []); me.update()
    ob = bpy.data.objects.new('CartridgeEdges', me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = root
    print('EDGES CartridgeEdges segments', len(edges))
    return ob


# ── hero pose → contact shadow (MOBILE-3D-PLAN B3) ──
# components/three/film-workspace.ts: model.rotation.x = π/2 (lying, spool hub to the camera), spin.rotation.z = −60°
# (rolled about the spool axis), film group rotation.y = FILM_YAW; key light (DirectionalLight) at (−4.5, 7.5, 5.5)
# aimed at the origin. three is Y-up; A maps Blender (Z-up) coordinates to glTF/three ones.
HERO_YAW, HERO_ROLL, KEY_POS = -0.12, math.radians(-60.0), Vector((-4.5, 7.5, 5.5))
SHADOW_EXTENT, SHADOW_PX = 2.0, 256     # square plane (model units) centred on the spool-axis origin


def contact_shadow(root, cass, lead):
    """Shadow-catcher bake of the cartridge in the hero pose under the softbox key, top-down orthographic,
    256² WebP with alpha (black, alpha = shadow). Runtime: a SHADOW_EXTENT×SHADOW_EXTENT plane (× the hero's
    cartridge scale) centred under the cart origin, axis-aligned to the world (the pose already includes FILM_YAW)."""
    from mathutils import Matrix
    scene = bpy.context.scene
    A = Matrix(((1, 0, 0), (0, 0, 1), (0, -1, 0)))
    rot = Matrix.Rotation(HERO_YAW, 3, 'Y') @ Matrix.Rotation(HERO_ROLL, 3, 'Z') @ Matrix.Rotation(math.pi / 2, 3, 'X')
    saved = root.matrix_world.copy()
    root.matrix_world = (A.transposed() @ rot @ A).to_4x4()
    bpy.context.view_layer.update()
    # rest on the table like the hero (Box3.setFromObject counts the hidden leader too)
    low = min((o.matrix_world @ v.co).z for o in (cass, lead) for v in o.data.vertices)
    root.location.z -= low
    bpy.context.view_layer.update()
    hidden = []
    for o in scene.objects:
        if o.type in ('MESH', 'LIGHT', 'CAMERA') and o not in (cass,):
            hidden.append((o, o.hide_render)); o.hide_render = True
    cass.visible_camera = False                       # casts the shadow, never seen
    bpy.ops.mesh.primitive_plane_add(size=SHADOW_EXTENT * 4, location=(0, 0, 0))
    catcher = bpy.context.object; catcher.name = 'ShadowBakeCatcher'; catcher.is_shadow_catcher = True
    sun_data = bpy.data.lights.new('ShadowKey', 'SUN'); sun_data.energy = 3.0; sun_data.angle = math.radians(7.0)
    sun = bpy.data.objects.new('ShadowKey', sun_data); scene.collection.objects.link(sun)
    sun.location = A.transposed() @ KEY_POS; C.look_at(sun, Vector((0, 0, 0)))
    world = scene.world or bpy.data.worlds.new('shadow_world'); scene.world = world; world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    old_bg = (tuple(bg.inputs[0].default_value), bg.inputs[1].default_value)
    bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = 0.45   # soft sky → contact occlusion
    cam_data = bpy.data.cameras.new('ShadowCam'); cam_data.type = 'ORTHO'; cam_data.ortho_scale = SHADOW_EXTENT
    cam = bpy.data.objects.new('ShadowCam', cam_data); scene.collection.objects.link(cam)
    cam.location = (0, 0, 4.0); cam.rotation_euler = (0, 0, 0)
    old = (scene.camera, scene.render.resolution_x, scene.render.resolution_y, scene.render.film_transparent, scene.cycles.samples)
    scene.camera = cam
    scene.render.resolution_x = scene.render.resolution_y = SHADOW_PX
    scene.render.film_transparent = True
    C.use_cycles_metal(scene, 64 if QUICK else 256)
    C.render_to(scene, OUT_SHADOW, 'WEBP', 90)
    # restore
    scene.camera, scene.render.resolution_x, scene.render.resolution_y, scene.render.film_transparent, scene.cycles.samples = old
    bg.inputs[0].default_value = old_bg[0]; bg.inputs[1].default_value = old_bg[1]
    for o in (catcher, sun, cam):
        bpy.data.objects.remove(o)
    cass.visible_camera = True
    for o, h in hidden:
        o.hide_render = h
    root.matrix_world = saved
    bpy.context.view_layer.update()
    print('SHADOW', OUT_SHADOW, os.path.getsize(OUT_SHADOW), 'extent', SHADOW_EXTENT)


# ───────────────────────── renders ─────────────────────────
def preview_views(scene, tag, unit, center, samples=48, only=None):
    """QA views (JPEG, dark grey backdrop). unit = model size (1.0 after normalising, H before)."""
    scene.cycles.samples = samples
    scene.render.film_transparent = False
    c = Vector(center)
    views = {
        'three-quarter': (Vector((1.6, -3.4, 1.4)), 85, (1200, 900)),
        'mouth-closeup': (Vector((-0.2, 1.9, 0.5)), 85, (1200, 900)),
        'top-key': (Vector((0.15, -0.6, 3.8)), 85, (1000, 1000)),
        'lying-hero': (Vector((2.6, -2.2, 3.2)), 85, (1200, 900)),
    }
    for name, (off, lens, res) in views.items():
        if only and name not in only:
            continue
        cam = C.camera(scene, c + off * unit, c, lens, res, 'Cam_' + name)
        if name == 'mouth-closeup':
            m = N * H0 + D * S_MOUTH
            k = 1.0 if unit > 2 else 1.0 / 51.25
            tgt = Vector((m.x * k, m.y * k, c.z + (FILM_ZC - 25.0) * k))
            cam.location = tgt + (Vector((D.x, D.y, 0)) * 0.95 + Vector((N.x, N.y, 0)) * 0.5 + Vector((0, 0, 0.3))) * unit
            cam.data.lens = 100
            C.look_at(cam, tgt)
            lead = bpy.data.objects.get('Leader')
            if lead:
                lead.hide_render = True
        C.render_to(scene, os.path.join(PREV, 'cartridge-%s-%s.jpg' % (tag, name)), 'JPEG', 88, rgba=False)
        bpy.data.objects.remove(cam)
        if bpy.data.objects.get('Leader'):
            bpy.data.objects['Leader'].hide_render = False


def poster(scene, root):
    root.rotation_euler = (0, 0, math.radians(-58.5))
    scene.cycles.samples = 64 if QUICK else 384
    scene.render.film_transparent = True
    C.camera(scene, Vector((0.10, -3.9, 1.18)), Vector((0.12, 0, -0.02)), 85, (1200, 900), 'PosterCam')
    C.render_to(scene, OUT_POSTER, 'WEBP', 88)
    C.render_to(scene, os.path.join(PREV, 'cartridge-135-poster.png'), 'PNG')
    root.rotation_euler = (0, 0, 0)


def export_stage():
    """Re-export the desktop GLB from the saved .blend (no re-bake): adds CartridgeEdges, renders the contact shadow."""
    bpy.ops.wm.open_mainfile(filepath=os.path.join(EVID, 'cartridge-135.blend'))
    scene = bpy.context.scene
    root, cass, lead = (bpy.data.objects[n] for n in ('FilmCartridge', 'Cassette', 'Leader'))
    feature_edges(cass, root)
    export_glb(root)
    C.studio(scene, (0, 0, 0), 1.0, -0.5, catcher=False)
    contact_shadow(root, cass, lead)


def main():
    stage = ('geo' if 'geo' in ARGS else 'export' if 'export' in ARGS else 'full') if '--stage' in ARGS else 'full'
    if stage == 'export':
        return export_stage()
    scene = C.reset()
    C.use_cycles_metal(scene, 48)
    src = C.path('docs', 'evidence', 'higgsfield', 'generated', 'brushed-metal-A-gptimage25.webp')
    detail = K.detail_image('brushed_detail', K.tileable_highpass(src, 1024, 24.0))
    cass, z_hub = build_cassette()
    lead = build_leader()
    shell, i_shell = mat_shell(detail)
    plastic, i_plastic = mat_simple('bake_plastic', (0.022, 0.022, 0.024), 0.42, 0.56, 3.0, 0.05)
    felt, i_felt = mat_simple('bake_felt', (0.007, 0.007, 0.008), 0.92, 1.0, 14.0, 0.55, 8.0)
    for m in (shell, plastic, felt):
        cass.data.materials.append(m)
    film = mat_film()
    lead.data.materials.append(film)
    z_min = min(v.co.z for v in cass.data.vertices)
    mouth = N * H0 + D * S_MOUTH
    e_exit = empty('SlotExit', (mouth.x, mouth.y, FILM_ZC))
    tip = N * H0 + D * (S_MOUTH + LEAD['x_end'])
    e_tip = empty('LeaderTip', (tip.x, tip.y, FILM_ZC))
    tris = sum(len(p.vertices) - 2 for o in (cass, lead) for p in o.data.polygons)
    print('TRIANGLES', tris, 'z range', z_min, z_hub)
    if '--count' in ARGS:   # geometry budget check only
        return
    if stage == 'geo':
        C.studio(scene, (0, 0, 22), 51.0, z_min, catcher=False)
        preview_views(scene, 'geo', 51.0, (0, 0, 24))
        return
    tex = bake_all(cass, [(shell, i_shell), (plastic, i_plastic), (felt, i_felt)])
    assign_single(cass, export_material(tex))
    H, zc = normalise([cass, lead], [e_exit, e_tip], z_min, z_hub)
    root = bpy.data.objects.new('FilmCartridge', None)
    scene.collection.objects.link(root)
    for ob in (cass, lead, e_exit, e_tip):
        ob.parent = root
    print('NORMALISED H=%.3f mm zc=%.3f SlotExit=%s LeaderTip=%s' % (H, zc, tuple(round(x, 4) for x in e_exit.location), tuple(round(x, 4) for x in e_tip.location)))
    feature_edges(cass, root)
    export_glb(root)
    if MOBILE:   # phone build: GLB + one QA view (no .blend, poster or shadow — those come from the desktop build)
        C.studio(scene, (0, 0, 0), 1.0, -0.5)
        preview_views(scene, 'mobile', 1.0, (0, 0, 0.02), 32 if QUICK else 64, only=('lying-hero', 'three-quarter'))
        return
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(EVID, 'cartridge-135.blend'), compress=True)
    C.studio(scene, (0, 0, 0), 1.0, -0.5)
    poster(scene, root)
    contact_shadow(root, cass, lead)
    preview_views(scene, 'final', 1.0, (0, 0, 0.02), 64 if QUICK else 128)


main()
