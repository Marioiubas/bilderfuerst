"""FORMAT OBJECTS — 135 / 120 / 110 studio renders for the film-development configurator (Blender 5.2).

blender -b --factory-startup -P scripts/blender/format_objects.py -- [--quick]
Outputs public/renders/format-{135,120,110}.webp (800×600) and @2x (1600×1200), transparent background,
softbox light, contact shadow; docs/evidence/blender/format-objects.blend + previews.

All three objects sit at real size (millimetres) in ONE scene under ONE camera, so the size difference is
legible: 135 = the v2 GLB (deliverable 1, imported), 120 = flanged spool with plain backing paper and an
unprinted seal band, 110 = generic two-chamber cartridge with exposure gate and frame-counter window.
Generic and unbranded: no text, numbers, logos, labels or brand colours.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bf_common as C
import bf_bake as K
from bf_common import v2

QUICK = '--quick' in C.script_args()
OUT = C.path('public', 'renders')
EVID = C.path('docs', 'evidence', 'blender')
PREV = os.path.join(EVID, 'previews')
P_PLASTIC, P_PAPER, P_BAND, P_FILM, P_DARK, P_COUNTER = range(6)


def materials():
    defs = [('fmt_plastic', (0.022, 0.022, 0.024), 0.48), ('fmt_paper', (0.60, 0.59, 0.555), 0.86),
            ('fmt_band', (0.30, 0.165, 0.05), 0.6), ('fmt_film', (0.11, 0.04, 0.015), 0.25),
            ('fmt_dark', (0.006, 0.006, 0.007), 0.7), ('fmt_counter', (0.62, 0.60, 0.55), 0.8)]
    out = []
    for name, rgb, rough in defs:
        m, nt, b = K.principled(name, rgb, rough)
        if name in ('fmt_paper', 'fmt_plastic', 'fmt_band'):     # fibre / moulding micro texture
            tc = nt.nodes.new('ShaderNodeTexCoord'); nz = nt.nodes.new('ShaderNodeTexNoise')
            nz.inputs['Scale'].default_value = 2.5 if name == 'fmt_plastic' else 6.0; nz.inputs['Detail'].default_value = 6
            bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.05 if name == 'fmt_plastic' else 0.12
            bp.inputs['Distance'].default_value = 0.02
            C.link(nt, tc.outputs['Object'], nz.inputs['Vector']); C.link(nt, nz.outputs['Fac'], bp.inputs['Height'])
            C.link(nt, bp.outputs['Normal'], b.inputs['Normal'])
        out.append(m)
    return out


def finish(mb, mats, name):
    ob = mb.finish(sharp_angle_deg=35)
    ob.name = name
    for m in mats:
        ob.data.materials.append(m)
    return ob


# ───────────────────────── 120: flanged spool, plain backing paper, unprinted seal band ─────────────────────────
R120 = dict(flange=12.3, paper=11.7, band=11.9, half=30.85, band_w=18.0, step=0.22)
EDGE_AT = math.radians(205)   # overlap edges turned towards the camera (front-top of the lying roll)


def spiral(mb, r0, step, z0, z1, segs, mat, edge_mat, a0=0.0):
    """Outer paper layer as a one-turn spiral: radius grows by `step`, leaving the overlapping paper edge."""
    lo, hi = [], []
    for i in range(segs + 1):
        a = a0 + 2 * math.pi * i / segs
        r = r0 + step * i / segs
        lo.append(Vector((r * math.cos(a), r * math.sin(a), z0))); hi.append(Vector((r * math.cos(a), r * math.sin(a), z1)))
    vl, vh = mb.verts(lo), mb.verts(hi)
    for i in range(segs):
        mb.face([vl[i], vl[i + 1], vh[i + 1], vh[i]], [(0, 0)] * 4, mat)
    # the visible edge where the layer ends (step back down to r0)
    a, b = vl[-1], vh[-1]
    c = mb.verts([Vector((r0 * math.cos(a0), r0 * math.sin(a0), z1)), Vector((r0 * math.cos(a0), r0 * math.sin(a0), z0))])
    mb.face([b, a, c[1], c[0]], [(0, 0)] * 4, edge_mat)
    return vl, vh


def build_120(mats):
    r = R120
    mb = C.MeshBuilder('Roll120')
    spiral(mb, r['paper'], r['step'], -r['half'], r['half'], 160, P_PAPER, P_PAPER, EDGE_AT)
    # paper roll end faces (between core and paper), seen only through the flange gap
    for z, flip in ((-r['half'], True), (r['half'], False)):
        C.lathe_rings(mb, [(r['paper'] + r['step'], z), (5.6, z)], 64, (0, 0, 1, 1), P_DARK, flip=flip)
    spiral(mb, r['band'], r['step'] * 0.6, -r['band_w'] / 2, r['band_w'] / 2, 160, P_BAND, P_BAND, EDGE_AT + 0.35)
    for z, flip in ((-r['band_w'] / 2, True), (r['band_w'] / 2, False)):   # band edges (paper thickness)
        C.lathe_rings(mb, [(r['band'] + 0.12, z), (r['paper'] + 0.08, z)], 96, (0, 0, 1, 1), P_BAND, flip=flip)
    for sgn in (1, -1):                       # flanges with a keyed hub end
        h = r['half']
        prof = [(11.2, h + 0.05), (12.05, h + 0.05), (12.3, h + 0.3), (12.3, h + 1.05), (12.05, h + 1.3),
                (4.4, h + 1.22), (4.1, h + 1.5), (3.8, h + 1.7), (1.4, h + 1.7), (1.2, h + 1.45), (1.2, h - 2.0), (0, h - 2.0)]
        if sgn < 0:
            prof = [(a, -z) for a, z in prof]
        C.lathe_rings(mb, prof, 64, (0, 0, 1, 1), P_PLASTIC, flip=sgn < 0)
        for w, l in ((1.4, 6.8),):            # key slot across the hub end
            zt = sgn * (h + 1.7)
            k = mb.verts([Vector((x, y, zt + sgn * 0.01)) for x, y in ((-l / 2, -w / 2), (l / 2, -w / 2), (l / 2, w / 2), (-l / 2, w / 2))])
            if sgn < 0:
                k.reverse()
            mb.face(k, [(0, 0)] * 4, P_DARK)
    ob = finish(mb, mats, 'Roll120')
    ob.rotation_euler = (0, math.radians(90), 0)          # roll axis along X, resting on its flanges
    ob.location = (0, 0, r['flange'])
    return ob


# ───────────────────────── 110: generic two-chamber cartridge ─────────────────────────
H110 = 19.0                                   # height along the spool axes (16 mm film + walls)
HUB = v2(-17.0, -6.0)


def f110(p):
    lobe_l = min(C.sd_circle(p, HUB, 12.0), C.sd_round_box(p, v2(-11.0, -6.0), v2(1, 0), (6.0, 12.0), 0.0))
    lobe_r = C.sd_round_box(p, v2(19.5, -6.0), v2(1, 0), (9.5, 12.0), 3.0)
    bridge = C.sd_round_box(p, v2(0.0, 1.5), v2(1, 0), (12.0, 4.5), 0.6)
    return C.smin(C.smin(lobe_l, bridge, 2.0), lobe_r, 2.0)


def rounded_slab(mb, f, height, r, segs=3, mat=0):
    base = C.simplify_closed(C.walk_contour(f, (-32.0, -6.0), 0.03), 0.01)
    area = sum(a.x * b.y - b.x * a.y for a, b in zip(base, base[1:] + base[:1]))
    if area < 0:
        base.reverse()
    prof = [(r - r * math.sin(math.radians(90 * k / segs)), r - r * math.cos(math.radians(90 * k / segs))) for k in range(segs + 1)]
    prof += [(d, height - z) for d, z in reversed(prof)]
    rings = [mb.verts([Vector((p.x, p.y, z)) for p in (C.offset_ring(f, base, d) if d > 1e-6 else base)]) for d, z in prof]
    for a, b in zip(rings, rings[1:]):
        mb.strip(a, b, [(0, 0)] * (len(base) + 1), [(0, 0)] * (len(base) + 1), mat)
    mb.fill([rings[0]], lambda co: (0, 0), mat, flip=True)
    mb.fill([rings[-1]], lambda co: (0, 0), mat)


def cutter(name, mn, mx, cyl=None):
    if cyl:
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=cyl[0], depth=cyl[1], location=mn)
    else:
        bpy.ops.mesh.primitive_cube_add(size=1, location=[(a + b) / 2 for a, b in zip(mn, mx)])
        bpy.context.object.scale = [b - a for a, b in zip(mn, mx)]
    ob = bpy.context.object; ob.name = name
    return ob


def build_110(mats):
    mb = C.MeshBuilder('Cart110')
    rounded_slab(mb, f110, H110, 1.2, 3, P_PLASTIC)
    body = finish(mb, mats, 'Cart110')
    cuts = [cutter('gate', (-7.8, -4.0, 3.2), (7.8, -1.6, 15.8)),                       # exposure gate on the bridge front
            cutter('hub', (HUB.x, HUB.y, H110), None, cyl=(4.6, 6.0)),                   # take-up hub socket (top)
            cutter('counter', (19.0, 5.0, 8.0), (25.0, 7.2, 11.5))]                       # frame-counter window (back)
    for c in cuts:
        mod = body.modifiers.new(c.name, 'BOOLEAN'); mod.operation, mod.object, mod.solver = 'DIFFERENCE', c, 'EXACT'
    bpy.context.view_layer.objects.active = body
    for c in cuts:
        bpy.ops.object.modifier_apply(modifier=c.name)
        bpy.data.objects.remove(c)
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    d = C.MeshBuilder('Cart110Detail')
    film = d.verts([Vector(v) for v in ((-7.8, -1.65, 3.2), (7.8, -1.65, 3.2), (7.8, -1.65, 15.8), (-7.8, -1.65, 15.8))])
    d.face(film, [(0, 0)] * 4, P_FILM)                                                     # film in the gate
    paper = d.verts([Vector(v) for v in ((25.0, 5.05, 8.0), (19.0, 5.05, 8.0), (19.0, 5.05, 11.5), (25.0, 5.05, 11.5))])
    d.face(paper, [(0, 0)] * 4, P_COUNTER)                                                 # plain backing paper behind the window
    hub_prof = [(6.1, H110), (6.0, H110 + 0.35), (4.9, H110 + 0.35), (4.6, H110), (4.6, H110 - 3.0), (2.7, H110 - 3.0),
                (2.7, H110 - 0.9), (2.4, H110 - 0.7), (0.0, H110 - 0.7)]
    rings = C.lathe_rings(d, hub_prof, 48, (0, 0, 1, 1), P_PLASTIC)
    for v in {v for rg in rings for v in rg}:
        v.co.x += HUB.x; v.co.y += HUB.y
    for ang in (0, 60, 120):                                                               # toothed core key
        ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        pts = [(-2.3, -0.35), (2.3, -0.35), (2.3, 0.35), (-2.3, 0.35)]
        k = d.verts([Vector((HUB.x + x * ca - y * sa, HUB.y + x * sa + y * ca, H110 - 0.68)) for x, y in pts])
        d.face(k, [(0, 0)] * 4, P_DARK)
    detail = finish(d, mats, 'Cart110Detail')
    return body, detail


# ───────────────────────── 135: the v2 hero GLB, lying on its side, leader resting on the table ─────────────────────────
def build_135():
    bpy.ops.import_scene.gltf(filepath=C.path('public', 'models', 'film-cartridge-v2.glb'))
    root = bpy.data.objects['FilmCartridge']
    root.scale = (51.25,) * 3                                  # 1 unit = 51.25 mm (full height incl. hub)
    root.rotation_mode = 'ZYX'
    tip, cass = bpy.data.objects['LeaderTip'], bpy.data.objects['Cassette']
    r_cap = 12.55
    best = None
    for k in range(1440):                                       # roll about the spool axis until the tongue touches the table
        phi = math.radians(k / 4)
        root.rotation_euler = (0, math.radians(-90), phi)
        bpy.context.view_layer.update()
        t = tip.matrix_world.translation
        if t.y < 0:
            err = abs(t.z - (-r_cap + 0.15))
            if best is None or err < best[0]:
                best = (err, phi)
    root.rotation_euler = (0, math.radians(-90), best[1])
    root.location = (0, 0, r_cap)
    bpy.context.view_layer.update()
    return [root] + list(root.children)


def center_on_table(objs):
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == 'MESH' for c in o.bound_box]
    mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)])
    shift = Vector((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z))
    for o in objs:
        if o.parent is None:
            o.location += shift
    return mx - mn


def render_formats(scene, sets):
    cam_t = Vector((0, 0, 10.0))
    el, az, d = math.radians(28), math.radians(-32), 270.0
    C.camera(scene, cam_t + Vector((d * math.cos(el) * math.sin(az), -d * math.cos(el) * math.cos(az), d * math.sin(el))),
             cam_t, 100, (1600, 1200), 'FormatCam')
    scene.cycles.samples = 48 if QUICK else 384
    allobjs = [o for objs in sets.values() for o in objs]
    for name, objs in sets.items():
        for o in allobjs:
            o.hide_render = o not in objs
        png = os.path.join(EVID, 'format-renders', 'format-%s@2x.png' % name)
        C.render_to(scene, png, 'PNG')
        img = bpy.data.images.load(png)
        vs = scene.view_settings; old = (vs.view_transform, vs.look)
        vs.view_transform, vs.look = 'Standard', 'None'       # pixels are already display-referred
        st = scene.render.image_settings
        st.file_format, st.color_mode, st.quality = 'WEBP', 'RGBA', 84
        img.save_render(os.path.join(OUT, 'format-%s@2x.webp' % name), scene=scene)
        img.scale(800, 600)
        st.quality = 88
        img.save_render(os.path.join(OUT, 'format-%s.webp' % name), scene=scene)
        vs.view_transform, vs.look = old
        for f in ('format-%s.webp' % name, 'format-%s@2x.webp' % name):
            print('WEBP', f, os.path.getsize(os.path.join(OUT, f)))
    for o in allobjs:
        o.hide_render = False


def family_preview(scene, sets):
    xs = {'120': -78.0, '135': 0.0, '110': 76.0}
    for name, objs in sets.items():
        for o in objs:
            if o.parent is None:
                o.location.x += xs[name]
    cam = C.camera(scene, Vector((0, -470, 260)), Vector((0, 0, 8)), 85, (1800, 900), 'FamilyCam')
    scene.render.film_transparent = False
    scene.cycles.samples = 48 if QUICK else 160
    C.render_to(scene, os.path.join(PREV, 'format-family.jpg'), 'JPEG', 88, rgba=False)


def main():
    scene = C.reset()
    C.use_cycles_metal(scene, 64)
    mats = materials()
    roll = build_120(mats)
    body, detail = build_110(mats)
    c135 = build_135()
    sets = {'135': c135, '120': [roll], '110': [body, detail]}
    for name, objs in sets.items():
        size = center_on_table(objs)
        print('SIZE %s mm' % name, tuple(round(v, 1) for v in size))
    C.studio(scene, (0, 0, 10), 55.0, 0.0)
    scene.view_settings.exposure = -1.2        # paper and black plastic at their real tone (rig is tuned for dark metal)
    key = bpy.data.objects['Softbox_Key']        # higher, larger key → a short, soft contact shadow under each object
    key.location = Vector((0, 0, 10)) + Vector((-1.4, -1.8, 3.8)) * 55.0
    C.look_at(key, (0, 0, 10)); key.data.size, key.data.size_y = 3.4 * 55.0, 2.6 * 55.0
    for name in ('Rim_Strip', 'Fill_Card'):        # edge light only — no long shadows towards the camera
        bpy.data.objects[name].data.use_shadow = False
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(EVID, 'format-objects.blend'), compress=True)
    render_formats(scene, sets)
    family_preview(scene, sets)


main()
