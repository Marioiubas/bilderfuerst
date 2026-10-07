"""STREET GALLERY WINDOW v2 — simplified, photographic model of the shop-window bay (Blender 5.2).

blender -b --factory-startup -P scripts/blender/street_window.py -- [--quick] [--stage geo]
→ public/models/street-window.glb, public/renders/street-window.webp, docs/evidence/blender/street-window.blend.
Metres, Blender Z-up; façade front at y=0, interior towards +y (glTF: façade z=0, display box towards −z, as in
components/three/gallery-window.ts). Real 3×3 hang, bevel-cut mats, sill spots, side window with three prints —
NO signage, lettering or logos. Light baked with Cycles (METAL) into one 2048×1024 texture; glass stays runtime.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import bf_common as C
import bf_bake as K

ARGS = C.script_args(); QUICK = '--quick' in ARGS
OUT_GLB = C.path('public', 'models', 'street-window.glb')
OUT_POSTER = C.path('public', 'renders', 'street-window.webp')
EVID = C.path('docs', 'evidence', 'blender')
PREV = os.path.join(EVID, 'previews')
LM = (2048, 1024)

OPEN = (-1.05, 1.05)                    # opening bottom/top (z)
MAIN = (-1.80, 0.70)                    # main opening x-range (w 2.5)
SIDE = (1.10, 2.05)                     # narrow side window (w 0.95)
REVEAL, PROF, GLASS_Y = 0.20, 0.055, 0.23
BOX = (0.26, 0.98)                      # display box depth range (y)
FLOOR, CEIL = OPEN[0] + PROF, OPEN[1] - PROF
COLS, ROWS = (-1.36, -0.55, 0.26), (0.71, 0.10, -0.51)
FRAME = (0.66, 0.49)
ROOM = dict(x=(0.70, 3.80), y=(0.26, 3.40), z=(-1.60, 1.70))
INSIDE = dict(x=2.25, z=(0.53, 0.03, -0.47), s=0.76)
FACADE = dict(x=(-3.4, 3.7), z=(-1.9, 2.3))   # covers the camera up to 21:9 incl. pointer parallax
# frame profile (inset from the outer edge, height in front of the frame back)
FRAME_PROFILE = [(0.0, 0.0), (0.0, 0.031), (0.003, 0.035), (0.022, 0.035), (0.030, 0.029), (0.034, 0.026), (0.034, 0.012)]
MAT_IN, MAT_WIN, MAT_BEVEL, MAT_H = 0.030, 0.075, 0.002, 0.012
PHOTO_H = 0.0095

PARTS = []   # (object, lightmap weight)


def part(name, weight, mat_name):
    mb = C.MeshBuilder(name)
    mb.lm_weight, mb.mat_name = weight, mat_name
    return mb


def done(mb, sharp=30):
    ob = mb.finish(sharp_angle_deg=sharp)
    ob['lm_weight'] = mb.lm_weight
    ob['bake_mat'] = mb.mat_name
    PARTS.append(ob)
    return ob


Z4 = [(0, 0)] * 4


def quad(mb, a, b, c, d, uvs=Z4):
    vs = mb.verts([Vector(a), Vector(b), Vector(c), Vector(d)])
    return mb.face(vs, uvs, 0, smooth=False)


def front_rect(mb, x0, x1, z0, z1, y, facing=-1):
    """Axis-aligned rectangle in the XZ plane facing −y (towards the street) or +y."""
    pts = [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]
    if facing > 0:
        pts.reverse()
    return quad(mb, *pts)


def box(mb, mn, mx, skip=()):
    """Closed axis-aligned box with outward normals (faces named -x,+x,-y,+y,-z,+z can be skipped)."""
    x0, y0, z0 = mn; x1, y1, z1 = mx
    F = {
        '-y': [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)],
        '+y': [(x1, y1, z0), (x0, y1, z0), (x0, y1, z1), (x1, y1, z1)],
        '-x': [(x0, y1, z0), (x0, y0, z0), (x0, y0, z1), (x0, y1, z1)],
        '+x': [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)],
        '-z': [(x0, y1, z0), (x1, y1, z0), (x1, y0, z0), (x0, y0, z0)],
        '+z': [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)],
    }
    for k, pts in F.items():
        if k not in skip:
            quad(mb, *pts)


# ───────────────────────── façade, reveals, sill, lintel, profiles ─────────────────────────
def build_facade():
    mb = part('Facade', 0.5, 'facade')
    xs = [FACADE['x'][0], MAIN[0], MAIN[1], SIDE[0], SIDE[1], FACADE['x'][1]]
    zs = [FACADE['z'][0], OPEN[0] - 0.08, OPEN[0], OPEN[1], OPEN[1] + 0.36, FACADE['z'][1]]
    for i in range(len(xs) - 1):
        for k in range(len(zs) - 1):
            if k == 2 and i in (1, 3):
                continue            # the two openings
            front_rect(mb, xs[i], xs[i + 1], zs[k], zs[k + 1], 0.0)
    done(mb)
    # plain stone lintel band over both openings (no sign, no lettering) and a projecting sill
    st = part('StoneTrim', 0.9, 'stone')
    box(st, (MAIN[0] - 0.12, -0.014, OPEN[1]), (SIDE[1] + 0.12, 0.0, OPEN[1] + 0.36), skip=('+y',))
    sill = (MAIN[0] - 0.10, SIDE[1] + 0.10)
    box(st, (sill[0], -0.075, OPEN[0] - 0.08), (sill[1], 0.0, OPEN[0] - 0.005), skip=('+y',))
    box(st, (sill[0] + 0.02, -0.06, OPEN[0] - 0.105), (sill[1] - 0.02, 0.0, OPEN[0] - 0.08), skip=('+y', '+z'))
    for x0, x1 in (MAIN, SIDE):     # deep stone reveals
        quad(st, (x0, 0, OPEN[0]), (x0, REVEAL, OPEN[0]), (x0, REVEAL, OPEN[1]), (x0, 0, OPEN[1]))
        quad(st, (x1, REVEAL, OPEN[0]), (x1, 0, OPEN[0]), (x1, 0, OPEN[1]), (x1, REVEAL, OPEN[1]))
        quad(st, (x0, 0, OPEN[1]), (x0, REVEAL, OPEN[1]), (x1, REVEAL, OPEN[1]), (x1, 0, OPEN[1]))
        quad(st, (x0, REVEAL, OPEN[0]), (x0, 0, OPEN[0]), (x1, 0, OPEN[0]), (x1, REVEAL, OPEN[0]))
    done(st)
    pr = part('Profiles', 1.2, 'profile')
    for x0, x1 in (MAIN, SIDE):     # white window profiles round each pane
        t, y0, y1 = PROF, REVEAL, BOX[0]
        box(pr, (x0, y0, OPEN[0]), (x1, y1, OPEN[0] + t), skip=('-z', '+y'))
        box(pr, (x0, y0, OPEN[1] - t), (x1, y1, OPEN[1]), skip=('+z', '+y'))
        box(pr, (x0, y0, OPEN[0] + t), (x0 + t, y1, OPEN[1] - t), skip=('-x', '+y', '-z', '+z'))
        box(pr, (x1 - t, y0, OPEN[0] + t), (x1, y1, OPEN[1] - t), skip=('+x', '+y', '-z', '+z'))
    done(pr)


def build_display_box():
    x0, x1 = MAIN[0] + PROF, MAIN[1] - PROF
    y0, y1 = BOX
    w = part('BoxWalls', 1.0, 'wall')
    front_rect(w, x0, x1, FLOOR, CEIL, y1)                                   # back wall (faces street)
    quad(w, (x0, y0, FLOOR), (x0, y1, FLOOR), (x0, y1, CEIL), (x0, y0, CEIL))  # left wall faces +x
    quad(w, (x1, y1, FLOOR), (x1, y0, FLOOR), (x1, y0, CEIL), (x1, y1, CEIL))  # right wall faces −x
    done(w)
    f = part('BoxFloor', 1.2, 'floor')
    quad(f, (x0, y1, CEIL), (x1, y1, CEIL), (x1, y0, CEIL), (x0, y0, CEIL))    # plain painted ceiling
    quad(f, (x0, y0, FLOOR), (x1, y0, FLOOR), (x1, y1, FLOOR), (x0, y1, FLOOR))
    done(f)


def build_room():
    (x0, x1), (y0, y1), (z0, z1) = ROOM['x'], ROOM['y'], ROOM['z']
    r = part('Room', 0.25, 'room')
    front_rect(r, x0, x1, z0, z1, y1)
    quad(r, (x0, y0, z0), (x0, y1, z0), (x0, y1, z1), (x0, y0, z1))
    quad(r, (x1, y1, z0), (x1, y0, z0), (x1, y0, z1), (x1, y1, z1))
    quad(r, (x0, y1, z1), (x1, y1, z1), (x1, y0, z1), (x0, y0, z1))
    quad(r, (x0, y0, OPEN[0] + PROF), (SIDE[1], y0, OPEN[0] + PROF), (SIDE[1], 0.62, OPEN[0] + PROF), (x0, 0.62, OPEN[0] + PROF))  # inner ledge
    done(r)
    fl = part('RoomFloor', 0.2, 'room_floor')
    quad(fl, (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0))
    done(fl)


# ───────────────────────── frames, mats, photo slots ─────────────────────────
def ring(cx, cz, w, h, d, y):
    x0, x1, z0, z1 = cx - w / 2 + d, cx + w / 2 - d, cz - h / 2 + d, cz + h / 2 - d
    return [Vector((x0, y, z0)), Vector((x1, y, z0)), Vector((x1, y, z1)), Vector((x0, y, z1))]


def hang(frames, mats, backing, cx, cz, s, y_back):
    """One frame (outer w×h scaled by s) hung with its back at y_back. Returns the photo quad corners."""
    w, h = FRAME[0] * s, FRAME[1] * s
    rings = [frames.verts(ring(cx, cz, w, h, d * s, y_back - hh * s)) for d, hh in FRAME_PROFILE]
    for a, b in zip(rings, rings[1:]):
        frames.strip(a, b, [(0, 0)] * 5, [(0, 0)] * 5, 0)
    mring = [mats.verts(ring(cx, cz, w, h, d * s, y_back - hh * s)) for d, hh in
             ((MAT_IN, MAT_H), (MAT_WIN, MAT_H), (MAT_WIN + MAT_BEVEL, MAT_H - MAT_BEVEL))]
    for a, b in zip(mring, mring[1:]):
        mats.strip(a, b, [(0, 0)] * 5, [(0, 0)] * 5, 0)
    back = ring(cx, cz, w, h, (MAT_WIN + MAT_BEVEL) * s, y_back - 0.002 * s)
    backing.face(backing.verts(back), Z4, 0, smooth=False)              # backing board (hidden behind the print)
    return ring(cx, cz, w, h, (MAT_WIN + MAT_BEVEL) * s, y_back - PHOTO_H * s)


def photo_slot(name, corners):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(c) for c in corners], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name='PhotoUV')
    for loop, co in zip(me.polygons[0].loop_indices, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[loop].uv = co
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob['lm_weight'], ob['bake_mat'] = 0.45, 'photo_bake'
    PARTS.append(ob)
    return ob


def build_frames():
    frames = part('Frames', 3.2, 'frame')
    mats = part('Mats', 3.0, 'mat')
    backing = part('Backing', 0.08, 'mat')
    slots = []
    y_back = BOX[1] - 0.006
    for r, cz in enumerate(ROWS):
        for c, cx in enumerate(COLS):
            slots.append(hang(frames, mats, backing, cx, cz, 1.0, y_back))
    s, yb = INSIDE['s'], ROOM['y'][1] - 0.006
    for cz in INSIDE['z']:
        slots.append(hang(frames, mats, backing, INSIDE['x'], cz, s, yb))
    done(frames, 20); done(mats, 20); done(backing)
    return [photo_slot('Photo_%02d' % (i + 1), c) for i, c in enumerate(slots)]


# ───────────────────────── sill spots (uplights on the display floor) ─────────────────────────
SPOTS = [dict(pos=Vector((x, 0.42, FLOOR)), target=Vector((x, BOX[1], 0.30))) for x in COLS]


def spot_head_matrix(sp):
    head = sp['pos'] + Vector((0, 0, 0.085))
    q = (sp['target'] - head).normalized().to_track_quat('Z', 'Y')
    return head, Matrix.Translation(head) @ q.to_matrix().to_4x4()


def move(rings, M):
    for v in {v for rg in rings for v in rg}:   # axis rings repeat one vertex — transform each once
        v.co = M @ v.co


def build_spots():
    housing = part('SpotHousing', 1.6, 'spot')
    lens = part('SpotLens', 1.0, 'lens')
    stand = [(0.034, 0.0), (0.035, 0.004), (0.030, 0.009), (0.008, 0.010), (0.006, 0.013), (0.006, 0.085), (0.0, 0.085)]
    head = [(0.0, -0.034), (0.017, -0.034), (0.021, -0.029), (0.021, 0.034), (0.019, 0.038), (0.0165, 0.036), (0.0165, 0.030)]
    for sp in SPOTS:
        move(C.lathe_rings(housing, stand, 20, (0, 0, 1, 1), 0), Matrix.Translation(sp['pos']))
        _, M = spot_head_matrix(sp)
        move(C.lathe_rings(housing, head, 20, (0, 0, 1, 1), 0), M)
        move(C.lathe_rings(lens, [(0.0165, 0.030), (0.0, 0.030)], 20, (0, 0, 1, 1), 0), M)
    done(housing, 40); done(lens, 40)


def build_glass():
    me = bpy.data.meshes.new('Glass')
    verts, faces = [], []
    for x0, x1 in (MAIN, SIDE):
        x0, x1 = x0 + PROF * 0.5, x1 - PROF * 0.5
        k = len(verts)
        verts += [(x0, GLASS_Y, OPEN[0] + PROF * 0.5), (x1, GLASS_Y, OPEN[0] + PROF * 0.5), (x1, GLASS_Y, OPEN[1] - PROF * 0.5), (x0, GLASS_Y, OPEN[1] - PROF * 0.5)]
        faces.append((k, k + 1, k + 2, k + 3))
    me.from_pydata(verts, [], faces)
    ob = bpy.data.objects.new('Glass', me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


# ───────────────────────── bake materials (albedo + procedural detail) ─────────────────────────
def mat_facade(stone_img):
    """Ashlar courses (≈0.92 × 0.335 m, running bond) with per-block offset into the sandstone photo-texture."""
    m, nt, b = K.principled('facade', (0.5, 0.48, 0.44), 0.85)
    xz, tc = K.obj_xz(nt, 1.0)
    brick = nt.nodes.new('ShaderNodeTexBrick')
    brick.offset, brick.offset_frequency = 0.5, 2
    for k, v in (('Scale', 1.0), ('Mortar Size', 0.007), ('Mortar Smooth', 0.35), ('Bias', 0.0), ('Brick Width', 0.92), ('Row Height', 0.335)):
        brick.inputs[k].default_value = v
    brick.inputs['Color1'].default_value = (0, 0, 0, 1); brick.inputs['Color2'].default_value = (1, 1, 1, 1)
    brick.inputs['Mortar'].default_value = (0, 0, 0, 1)
    C.link(nt, xz, brick.inputs['Vector'])
    rnd = nt.nodes.new('ShaderNodeSeparateColor'); C.link(nt, brick.outputs['Color'], rnd.inputs[0])
    off = nt.nodes.new('ShaderNodeVectorMath'); off.operation = 'MULTIPLY_ADD'
    off.inputs[1].default_value = (3.7, 5.3, 0)
    C.link(nt, rnd.outputs['Red'], off.inputs[0]); C.link(nt, xz, off.inputs[2])
    scl = nt.nodes.new('ShaderNodeVectorMath'); scl.operation = 'SCALE'; scl.inputs['Scale'].default_value = 1 / 0.85
    C.link(nt, off.outputs[0], scl.inputs[0])
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = stone_img; C.link(nt, scl.outputs[0], tex.inputs[0])
    tone = nt.nodes.new('ShaderNodeMath'); tone.operation = 'MULTIPLY_ADD'; tone.inputs[1].default_value = 0.22; tone.inputs[2].default_value = 0.80
    C.link(nt, rnd.outputs['Red'], tone.inputs[0])
    shade = nt.nodes.new('ShaderNodeVectorMath'); shade.operation = 'SCALE'
    C.link(nt, tex.outputs['Color'], shade.inputs[0]); C.link(nt, tone.outputs[0], shade.inputs['Scale'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    ins = [x for x in mix.inputs if x.type == 'RGBA']; outs = [x for x in mix.outputs if x.type == 'RGBA']
    C.link(nt, brick.outputs['Fac'], mix.inputs[0])
    C.link(nt, shade.outputs[0], ins[0]); ins[1].default_value = (0.36, 0.34, 0.31, 1)   # recessed joint
    C.link(nt, outs[0], b.inputs['Base Color'])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.7; bump.inputs['Distance'].default_value = 0.004
    inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    C.link(nt, brick.outputs['Fac'], inv.inputs[1]); C.link(nt, inv.outputs[0], bump.inputs['Height'])
    C.link(nt, bump.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_stone(tooled_img):
    m, nt, b = K.principled('stone', (0.6, 0.58, 0.54), 0.8)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / 0.6, 1 / 0.6, 1 / 0.6)
    C.link(nt, tc.outputs['Object'], mp.inputs[0])
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = tooled_img; tex.projection = 'BOX'; tex.projection_blend = 0.25
    C.link(nt, mp.outputs[0], tex.inputs[0])
    lift = nt.nodes.new('ShaderNodeVectorMath'); lift.operation = 'SCALE'; lift.inputs['Scale'].default_value = 0.95
    C.link(nt, tex.outputs['Color'], lift.inputs[0]); C.link(nt, lift.outputs[0], b.inputs['Base Color'])
    return m


def mat_wall():
    """Painted display panels with a vertical seam every ≈0.6 m."""
    m, nt, b = K.principled('wall', (0.64, 0.62, 0.58), 0.7)
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    C.link(nt, tc.outputs['Object'], sep.inputs[0])
    w = nt.nodes.new('ShaderNodeTexWave'); w.wave_type = 'BANDS'; w.bands_direction = 'X'
    w.inputs['Scale'].default_value = 1.0; w.inputs['Distortion'].default_value = 0
    sc = nt.nodes.new('ShaderNodeCombineXYZ'); mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = 1 / 0.6
    C.link(nt, sep.outputs['X'], mm.inputs[0]); C.link(nt, mm.outputs[0], sc.inputs[0]); C.link(nt, sc.outputs[0], w.inputs['Vector'])
    seam = nt.nodes.new('ShaderNodeMapRange'); seam.inputs['From Min'].default_value = 0.0; seam.inputs['From Max'].default_value = 0.012
    seam.inputs['To Min'].default_value = 0.55; seam.inputs['To Max'].default_value = 1.0
    C.link(nt, w.outputs['Fac'], seam.inputs['Value'])
    col = nt.nodes.new('ShaderNodeVectorMath'); col.operation = 'SCALE'; col.inputs[0].default_value = (0.64, 0.62, 0.58)
    C.link(nt, seam.outputs['Result'], col.inputs['Scale']); C.link(nt, col.outputs[0], b.inputs['Base Color'])
    return m


def bake_materials(stone_img, tooled_img):
    mats = {'facade': mat_facade(stone_img), 'stone': mat_stone(tooled_img), 'wall': mat_wall()}
    for name, rgb, rough in (('profile', (0.74, 0.74, 0.72), 0.45), ('floor', (0.60, 0.59, 0.56), 0.5),
                             ('frame', (0.022, 0.022, 0.024), 0.4), ('mat', (0.78, 0.77, 0.74), 0.9),
                             ('spot', (0.46, 0.47, 0.48), 0.35), ('room', (0.40, 0.38, 0.35), 0.8),
                             ('room_floor', (0.09, 0.085, 0.08), 0.6), ('photo_bake', (0.88, 0.88, 0.87), 0.9)):
        mats[name] = K.principled(name, rgb, rough)[0]
    m, nt, b = K.principled('lens', (0.9, 0.85, 0.75), 0.2)
    b.inputs['Emission Color'].default_value = (1.0, 0.86, 0.68, 1); b.inputs['Emission Strength'].default_value = 2.5
    mats['lens'] = m
    return mats


# ───────────────────────── lights (gallery uplights, ceiling wash, street lamp, shop interior) ─────────────────────────
WARM = (1.0, 0.84, 0.66)


def build_lights():
    """Evening gallery light: one soft wash from the window head (falls off down the hang, the back wall
    and the reveal), three wide large-radius spots from above, barely-on sill uplights, dusk street."""
    cx = (MAIN[0] + MAIN[1]) / 2
    C.add_light('HeadWash', 'AREA', (cx, 0.32, CEIL - 0.015), Vector((cx, BOX[1], -0.35)), 15, WARM,
                shape='RECTANGLE', size=2.3, size_y=0.10, spread=math.radians(115))
    C.add_light('RevealGlow', 'AREA', (cx, 0.275, CEIL - 0.01), Vector((cx, 0.2, FLOOR)), 5, WARM,
                shape='RECTANGLE', size=2.3, size_y=0.03, spread=math.radians(150))
    for i, x in enumerate(COLS):
        C.add_light('Track_%d' % (i + 1), 'SPOT', (x, 0.34, CEIL - 0.02), Vector((x, BOX[1], ROWS[0] - 0.12)), 7.5, WARM,
                    spot_size=math.radians(100), spot_blend=1.0, shadow_soft_size=0.09)
    for i, sp in enumerate(SPOTS):
        head, M = spot_head_matrix(sp)
        C.add_light('Uplight_%d' % (i + 1), 'SPOT', M @ Vector((0, 0, 0.045)), sp['target'], 2, WARM,
                    spot_size=math.radians(110), spot_blend=1.0, shadow_soft_size=0.03)
    C.add_light('StreetLamp', 'POINT', (-5.5, -3.2, 3.8), None, 700, (1.0, 0.86, 0.68), shadow_soft_size=0.35)
    C.add_light('SkyFill', 'AREA', (0.5, -6.0, 6.0), Vector((0.5, 0, 0)), 95, (0.62, 0.70, 0.85), shape='RECTANGLE', size=10, size_y=4)
    C.add_light('ShopCeiling', 'AREA', (2.6, 2.0, ROOM['z'][1] - 0.05), Vector((2.6, 2.0, 0)), 14, (1.0, 0.9, 0.78), shape='RECTANGLE', size=2.2, size_y=1.6)
    C.add_light('ShopSpot', 'SPOT', (INSIDE['x'], 2.3, 1.55), Vector((INSIDE['x'], ROOM['y'][1], 0.03)), 14, WARM,
                spot_size=math.radians(75), spot_blend=1.0, shadow_soft_size=0.08)


# ───────────────────────── join → lightmap UV → bake ─────────────────────────
def join_static(mats):
    for ob in PARTS:
        me = ob.data
        if 'UVMap' in me.uv_layers:
            me.uv_layers['UVMap'].name = 'Lightmap'
        if 'Lightmap' not in me.uv_layers:
            me.uv_layers.new(name='Lightmap')
        attr = me.attributes.new('lm_w', 'INT', 'FACE')
        attr.data.foreach_set('value', [int(ob['lm_weight'] * 100)] * len(me.polygons))
        me.materials.append(mats[ob['bake_mat']])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in PARTS:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = PARTS[0]
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = ob.data.name = 'WindowStatic'
    ob.data.uv_layers.active = ob.data.uv_layers['Lightmap']
    return ob


def bake_light(ob, samples):
    scene = bpy.context.scene
    img = C.image('WindowBakedHDR', *LM, color=False, float_buffer=True)
    img.colorspace_settings.name = 'Linear Rec.709'   # scene-linear, so save_render applies the AgX view
    for m in ob.data.materials:
        n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; m.node_tree.nodes.active = n
    scene.cycles.samples = samples
    b = scene.render.bake
    b.margin, b.margin_type, b.use_clear, b.target = 6, 'EXTEND', True, 'IMAGE_TEXTURES'
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type='COMBINED', pass_filter={'DIRECT', 'INDIRECT', 'DIFFUSE', 'EMIT'})
    out = os.path.join(EVID, 'street-window-textures', 'street-window-baked.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    st = scene.render.image_settings
    st.file_format, st.color_mode, st.color_depth = 'PNG', 'RGB', '8'
    img.save_render(out, scene=scene)          # applies the AgX view transform → display-referred sRGB
    baked = bpy.data.images.load(out); baked.name = 'street-window-baked'
    print('BAKED lightmap', out, os.path.getsize(out))
    return baked


def setup_view(scene, exposure):
    vs = scene.view_settings
    vs.view_transform, vs.look, vs.exposure, vs.gamma = 'AgX', 'AgX - Base Contrast', exposure, 1.0


def world(scene):
    w = bpy.data.worlds.new('night'); scene.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.012, 0.015, 0.022, 1); bg.inputs[1].default_value = 1.0


def window_camera(scene):
    cam = C.camera(scene, Vector((0.13, -5.30, 0.05)), Vector((0.13, 0.40, 0.05)), 35, (1600, 900), 'Camera_Window')
    cam.data.sensor_fit = 'VERTICAL'
    cam.data.angle_y = math.radians(28)
    cam.data.clip_start, cam.data.clip_end = 0.1, 40
    return cam


# ───────────────────────── export preparation ─────────────────────────
def patch_glb():
    js, rest = K.glb_read(OUT_GLB)
    tex = next(i for i, t in enumerate(js['textures'])
               if js['images'][t.get('source', t.get('extensions', {}).get('EXT_texture_webp', {}).get('source', -1))]['name'] == 'street-window-baked')
    for m in js['materials']:
        if m['name'] == 'PhotoSlot':
            m['pbrMetallicRoughness'] = {'baseColorFactor': [0.6, 0.6, 0.6, 1.0], 'baseColorTexture': {'index': tex, 'texCoord': 1},
                                         'metallicFactor': 0.0, 'roughnessFactor': 1.0}
            m.setdefault('extensions', {})['KHR_materials_unlit'] = {}
        if m['name'] == 'Glass':
            m['alphaMode'] = 'BLEND'
            m['pbrMetallicRoughness'].update({'metallicFactor': 0.0, 'roughnessFactor': 0.04})
    js['meshes'] = [dict(m, name=m['name'].split('.')[0]) for m in js['meshes']]   # drop Blender '.001' suffixes
    js['asset']['extras'] = {'note': 'Baked: WindowStatic carries albedo×light (AgX) in TEXCOORD_0; PhotoSlot TEXCOORD_1 samples the same atlas (light on white).'}
    K.glb_write(OUT_GLB, js, rest)
    print('PATCHED', OUT_GLB, os.path.getsize(OUT_GLB))


def spot_markers(root):
    for i, sp in enumerate(SPOTS):
        _, M = spot_head_matrix(sp)
        e = bpy.data.objects.new('Spot_%02d' % (i + 1), None)
        bpy.context.scene.collection.objects.link(e)
        e.location = M @ Vector((0, 0, 0.045)); C.look_at(e, sp['target'])   # local −Z = beam direction
        e.parent = root


def main():
    stage = 'geo' if 'geo' in ARGS else 'full'
    scene = C.reset()
    C.use_cycles_metal(scene, 32)
    gen = C.path('docs', 'evidence', 'higgsfield', 'generated')
    stone = K.tileable_color(os.path.join(gen, 'sandstone-facade-A-gptimage25.webp'), 1024, 'sandstone_tile')
    tooled = K.tileable_color(os.path.join(gen, 'sandstone-tooled-C-gptimage25.webp'), 1024, 'tooled_tile')
    build_facade(); build_display_box(); build_room()
    photos = build_frames(); build_spots()
    glass = build_glass()
    build_lights(); world(scene)
    mats = bake_materials(stone, tooled)
    cam = window_camera(scene)
    setup_view(scene, -0.8)
    centers = [sum((v.co for v in p.data.vertices), Vector()) / 4 for p in photos]
    tris = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in PARTS) + 4
    print('TRIANGLES (static + photos + glass)', tris)
    if stage == 'geo':
        for ob in PARTS:
            ob.data.materials.append(mats[ob['bake_mat']])
        K.poster_glass(glass)
        scene.cycles.samples = 48
        C.render_to(scene, os.path.join(PREV, 'street-window-geo.jpg'), 'JPEG', 88, rgba=False)
        return
    static = join_static(mats)
    K.lightmap_unwrap(static, aspect=LM[0] / LM[1])
    glass.hide_render = True
    baked = bake_light(static, 96 if QUICK else 1024)
    # poster: full Cycles render with real glass (neutral blank prints, no photos)
    glass.hide_render = False
    K.poster_glass(glass)
    scene.cycles.samples = 64 if QUICK else 512
    C.render_to(scene, OUT_POSTER, 'WEBP', 82, rgba=False)
    C.render_to(scene, os.path.join(PREV, 'street-window-poster.jpg'), 'JPEG', 90, rgba=False)
    # export: unlit baked static mesh, PhotoSlot quads, runtime glass, spot markers, camera
    photos = K.split_by_material(static, 'photo_bake', centers, 'Photo_%02d', ('PhotoUV', 'Lightmap'))
    static.data.materials.clear(); static.data.materials.append(K.unlit_material('WindowBaked', baked))
    for p in static.data.polygons:
        p.material_index = 0
    slot = K.unlit_material('PhotoSlot', rgb=(0.6, 0.6, 0.6))
    for p in photos:
        p.data.materials.clear(); p.data.materials.append(slot)
    glass.data.materials.clear(); glass.data.materials.append(K.glass_material())
    for a in list(static.data.attributes):
        if a.name in ('lm_w', 'island'):
            static.data.attributes.remove(a)
    root = bpy.data.objects.new('StreetWindow', None); scene.collection.objects.link(root)
    for o in [static, glass, cam] + photos:
        o.parent = root
    spot_markers(root)
    bpy.ops.object.select_all(action='DESELECT')
    for o in [root] + list(root.children):
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', use_selection=True, export_yup=True,
                              export_image_format='WEBP', export_image_quality=84, export_texcoords=True,
                              export_normals=False, export_materials='EXPORT', export_cameras=True,
                              export_lights=False, export_extras=False, export_apply=True)
    patch_glb()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(EVID, 'street-window.blend'), compress=True)
    # QA: what the runtime sees (unlit baked colours, display-referred → Standard view, no glass)
    glass.hide_render = True
    scene.view_settings.view_transform, scene.view_settings.look = 'Standard', 'None'
    scene.cycles.samples = 8
    C.render_to(scene, os.path.join(PREV, 'street-window-baked-unlit.jpg'), 'JPEG', 90, rgba=False)


main()
