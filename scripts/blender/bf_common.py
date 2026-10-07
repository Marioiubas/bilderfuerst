"""Shared helpers for the Bilderfürst Blender asset scripts.

Blender 5.2 LTS, run headless:  blender -b --factory-startup -P scripts/blender/<asset>.py -- [args]
Everything here is deterministic (no randomness without a fixed seed) so every asset can be rebuilt
bit-for-bit from its script. Units inside the modelling helpers are whatever the caller uses (mm for
small props, metres for the street window).
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def path(*parts):
    return os.path.join(ROOT, *parts)


def script_args():
    return sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0     # no .blend1 backups next to the originals
    return bpy.context.scene


def use_cycles_metal(scene, samples=128, denoise=True):
    """Cycles on the Apple GPU (METAL); falls back to CPU silently if no Metal device exists."""
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        gpu = False
        for d in prefs.devices:
            d.use = d.type == 'METAL'
            gpu = gpu or d.use
        scene.cycles.device = 'GPU' if gpu else 'CPU'
    except Exception as exc:  # pragma: no cover - only on machines without Metal
        print('METAL unavailable, using CPU:', exc)
        scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = denoise
    scene.cycles.seed = 7
    print('CYCLES device', scene.cycles.device)


# ───────────────────────── 2D signed distance fields (for profiles/outlines) ─────────────────────────
def v2(x, y):
    return Vector((x, y))


def sd_circle(p, c, r):
    return (p - c).length - r


def sd_round_box(p, c, ax, half, r):
    """Rounded box centred at c, local x axis = unit vector ax, half extents (hx, hy), corner radius r."""
    q = p - c
    lx, ly = q.dot(ax), q.dot(v2(-ax.y, ax.x))
    dx, dy = abs(lx) - half[0] + r, abs(ly) - half[1] + r
    return v2(max(dx, 0), max(dy, 0)).length + min(max(dx, dy), 0) - r


def smin(a, b, k):
    """Polynomial smooth minimum (concave fillet of radius ≈ k)."""
    h = max(k - abs(a - b), 0.0) / k
    return min(a, b) - h * h * k * 0.25


def grad(f, p, e=1e-4):
    return v2(f(p + v2(e, 0)) - f(p - v2(e, 0)), f(p + v2(0, e)) - f(p - v2(0, e))) / (2 * e)


def project(f, p, level=0.0, iters=40):
    for _ in range(iters):
        v = f(p) - level
        if abs(v) < 1e-8:
            break
        g = grad(f, p)
        gg = g.length_squared
        if gg < 1e-14:
            break
        p = p - g * (v / gg)
    return p


def walk_contour(f, start, step=0.03, level=0.0):
    """Trace the closed iso-line f=level counter-clockwise with a fixed step; returns a dense polyline."""
    p0 = project(f, v2(*start), level)
    pts, p, travelled = [p0], p0, 0.0
    for _ in range(400000):
        g = grad(f, p)
        t = v2(-g.y, g.x).normalized()
        p = project(f, p + t * step, level)
        travelled += step
        if travelled > 20 * step and (p - p0).length < step * 1.2:
            break
        pts.append(p)
    return pts


def simplify_closed(pts, tol):
    """Douglas–Peucker on a closed polyline (keeps sharp corners, thins straight runs)."""
    def dp(seq):
        if len(seq) < 3:
            return seq
        a, b = seq[0], seq[-1]
        ab = b - a
        L = ab.length or 1e-12
        best, bi = -1.0, 0
        for i in range(1, len(seq) - 1):
            d = abs(ab.x * (seq[i] - a).y - ab.y * (seq[i] - a).x) / L
            if d > best:
                best, bi = d, i
        if best > tol:
            return dp(seq[:bi + 1])[:-1] + dp(seq[bi:])
        return [a, b]
    # split at the point farthest from the first one so the closed curve is handled as two open runs
    far = max(range(len(pts)), key=lambda i: (pts[i] - pts[0]).length)
    first = dp(pts[:far + 1])
    second = dp(pts[far:] + [pts[0]])
    return first[:-1] + second[:-1]


def offset_ring(f, ring, d, level=0.0):
    """Move every point of an iso-line inward (d>0) to the iso-line level-d, keeping the point count."""
    out = []
    for p in ring:
        n = grad(f, p).normalized()
        out.append(project(f, p - n * d, level - d))
    return out


def arc_params(ring, closed=True):
    s, acc = [0.0], 0.0
    pts = ring + ([ring[0]] if closed else [])
    for a, b in zip(pts, pts[1:]):
        acc += (b - a).length
        s.append(acc)
    return s, acc


# ───────────────────────── bmesh builders with explicit UVs ─────────────────────────
class MeshBuilder:
    """Accumulates geometry in one bmesh with a UV layer and material indices."""

    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new('UVMap')
        self.isl = self.bm.faces.layers.int.new('island')
        self.islands, self.cur = [('default', 1.0)], 0

    def island(self, name, scale=1.0):
        """Start a UV island: following faces get local UVs (model units) that pack() places later."""
        self.islands.append((name, scale))
        self.cur = len(self.islands) - 1

    def verts(self, pts):
        return [self.bm.verts.new(p) for p in pts]

    def face(self, vs, uvs, mat=0, smooth=True):
        try:
            f = self.bm.faces.new(vs)
        except ValueError:
            return None
        for loop, uv in zip(f.loops, uvs):
            loop[self.uv].uv = uv
        f.material_index = mat
        f.smooth = smooth
        f[self.isl] = self.cur
        return f

    def strip(self, ring_a, ring_b, uv_a, uv_b, mat=0, closed=True, flip=False):
        """Quad strip between two vertex rings (same length). uv_a/uv_b: per-vertex UV lists (+1 if closed)."""
        n = len(ring_a)
        faces = []
        for i in range(n if closed else n - 1):
            j = (i + 1) % n
            quad = [ring_a[i], ring_a[j], ring_b[j], ring_b[i]]
            uvq = [uv_a[i], uv_a[i + 1], uv_b[i + 1], uv_b[i]]
            if flip:
                quad.reverse(); uvq.reverse()
            faces.append(self.face(quad, uvq, mat))
        return faces

    def fill(self, loops, uv_fn, mat=0, flip=False):
        """Triangulated planar fill of one outer loop plus optional hole loops (lists of BMVerts)."""
        edges = []
        for lp in loops:
            for a, b in zip(lp, lp[1:] + lp[:1]):
                e = self.bm.edges.get((a, b)) or self.bm.edges.new((a, b))
                edges.append(e)
        res = bmesh.ops.triangle_fill(self.bm, use_beauty=True, use_dissolve=False, edges=edges)
        faces = [g for g in res['geom'] if isinstance(g, bmesh.types.BMFace)]
        for f in faces:
            f.material_index = mat
            f.smooth = False
            f[self.isl] = self.cur
            for loop in f.loops:
                loop[self.uv].uv = uv_fn(loop.vert.co)
        if faces:
            want = -1 if flip else 1
            for f in faces:
                f.normal_update()
            # orient consistently: all faces of a fill share the requested side
            ref = faces[0].normal
            for f in faces:
                if f.normal.dot(ref) < 0:
                    f.normal_flip()
            if (faces[0].normal.z if abs(faces[0].normal.z) > 0.5 else faces[0].normal.y) * want < 0:
                for f in faces:
                    f.normal_flip()
        return faces

    def pack(self, size=1024, margin=8):
        """Shelf-pack all islands into the 0–1 square at one common texel density (× island scale)."""
        boxes = {}
        for f in self.bm.faces:
            i = f[self.isl]
            for lp in f.loops:
                u, v = lp[self.uv].uv
                b = boxes.setdefault(i, [u, v, u, v])
                b[0], b[1], b[2], b[3] = min(b[0], u), min(b[1], v), max(b[2], u), max(b[3], v)
        order = sorted(boxes, key=lambda i: -(boxes[i][3] - boxes[i][1]) * self.islands[i][1])

        def layout(s):
            x = y = row = 0.0
            pos = {}
            for i in order:
                b, k = boxes[i], self.islands[i][1]
                w, h = (b[2] - b[0]) * k * s, (b[3] - b[1]) * k * s
                if x + w + margin > size:
                    x, y, row = 0.0, y + row + margin, 0.0
                pos[i] = (x + margin, y + margin)
                x += w + margin
                row = max(row, h)
                if y + row + 2 * margin > size:
                    return None
            return pos
        lo, hi = 1e-4, 1e4
        for _ in range(60):
            mid = (lo * hi) ** 0.5
            lo, hi = (mid, hi) if layout(mid) else (lo, mid)
        s, pos = lo, layout(lo)
        for f in self.bm.faces:
            i = f[self.isl]
            b, k = boxes[i], self.islands[i][1]
            for lp in f.loops:
                u, v = lp[self.uv].uv
                lp[self.uv].uv = ((pos[i][0] + (u - b[0]) * k * s) / size, (pos[i][1] + (v - b[1]) * k * s) / size)
        self.texel_density = s
        return s

    def finish(self, sharp_angle_deg=35.0, collection=None):
        bm = self.bm
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
        lim = math.radians(sharp_angle_deg)
        for e in bm.edges:
            if len(e.link_faces) == 2:
                if e.calc_face_angle(0.0) > lim or e.link_faces[0].smooth != e.link_faces[1].smooth:
                    e.smooth = False
            else:
                e.smooth = False
        me = bpy.data.meshes.new(self.name)
        bm.to_mesh(me)
        bm.free()
        ob = bpy.data.objects.new(self.name, me)
        (collection or bpy.context.scene.collection).objects.link(ob)
        return ob


def lathe_rings(builder, profile, segs, uv_rect, mat=0, flip=False):
    """Revolve a (r, z) profile around Z. Returns the BMVert rings (one per profile point).
    UV: u = angle across uv_rect width, v = cumulative profile length across uv_rect height."""
    u0, v0, u1, v1 = uv_rect
    lens = [0.0]
    for a, b in zip(profile, profile[1:]):
        lens.append(lens[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = lens[-1] or 1.0
    rings, uvs = [], []
    for (r, z), L in zip(profile, lens):
        if r < 1e-9:
            ring = builder.verts([Vector((0, 0, z))]) * segs
        else:
            ring = builder.verts([Vector((r * math.cos(2 * math.pi * i / segs), r * math.sin(2 * math.pi * i / segs), z)) for i in range(segs)])
        rings.append(ring)
        v = v0 + (v1 - v0) * L / total
        uvs.append([(u0 + (u1 - u0) * i / segs, v) for i in range(segs + 1)])
    for k in range(len(rings) - 1):
        a, b = rings[k], rings[k + 1]
        for i in range(segs):
            j = (i + 1) % segs
            quad = [a[i], a[j], b[j], b[i]]
            uvq = [uvs[k][i], uvs[k][i + 1], uvs[k + 1][i + 1], uvs[k + 1][i]]
            # collapse degenerate quads at the axis into triangles
            vs, us = [], []
            for vv, uu in zip(quad, uvq):
                if vv not in vs:
                    vs.append(vv); us.append(uu)
            if len(vs) < 3:
                continue
            if flip:
                vs.reverse(); us.reverse()
            builder.face(vs, us, mat)
    return rings


def planar_uv(bounds, rect):
    """UV function mapping XY inside bounds=(xmin, ymin, xmax, ymax) into rect=(u0, v0, u1, v1), aspect kept."""
    xmin, ymin, xmax, ymax = bounds
    u0, v0, u1, v1 = rect
    s = min((u1 - u0) / (xmax - xmin), (v1 - v0) / (ymax - ymin))
    def fn(co):
        return (u0 + (co.x - xmin) * s, v0 + (co.y - ymin) * s)
    return fn


# ───────────────────────── materials ─────────────────────────
def new_material(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    return m, nt


def gltf_output_group():
    """The node group the glTF exporter reads for occlusion ('glTF Material Output')."""
    ng = bpy.data.node_groups.get('glTF Material Output')
    if ng:
        return ng
    ng = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
    ng.interface.new_socket('Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
    ng.interface.new_socket('Thickness', in_out='INPUT', socket_type='NodeSocketFloat')
    ng.nodes.new('NodeGroupInput')
    return ng


def image(name, w, h, color=True, alpha=False, float_buffer=False):
    img = bpy.data.images.get(name)
    if img:
        bpy.data.images.remove(img)
    img = bpy.data.images.new(name, w, h, alpha=alpha, float_buffer=float_buffer)
    img.colorspace_settings.name = 'sRGB' if color else 'Non-Color'
    return img


def pixels(img):
    import numpy as np
    a = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    return a.reshape(img.size[1], img.size[0], 4)


def set_pixels(img, arr):
    import numpy as np
    img.pixels.foreach_set(np.ascontiguousarray(arr, dtype=np.float32).ravel())
    img.update()


def save_image(img, filepath, fmt='PNG', quality=90, color_mode='RGBA'):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.filepath_raw = filepath
    img.file_format = fmt
    scene = bpy.context.scene
    s = scene.render.image_settings
    old = (s.file_format, s.color_mode, s.quality)
    s.file_format, s.color_mode = fmt, color_mode
    if fmt in ('WEBP', 'JPEG'):
        s.quality = quality
    img.save()
    s.file_format, s.color_mode, s.quality = old


def link(nt, a, b):
    nt.links.new(a, b)


def report_mesh(ob):
    me = ob.data
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    return {'name': ob.name, 'verts': len(me.vertices), 'tris': tris}


# ───────────────────────── photographic studio (softbox key, fill card, rim, contact shadow) ─────────────────────────
def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def area_light(name, loc, target, w, h, energy, color=(1.0, 0.97, 0.93)):
    li = bpy.data.lights.new(name, 'AREA')
    li.shape, li.size, li.size_y, li.energy, li.color = 'RECTANGLE', w, h, energy, color
    ob = bpy.data.objects.new(name, li)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    return ob


def studio(scene, target=(0, 0, 0), s=1.0, floor_z=0.0, key=1.0, catcher=True, world=0.03):
    """Softbox studio scaled by s (≈ object size). Key upper-left front, fill card right, rim behind."""
    t = Vector(target)
    w = scene.world or bpy.data.worlds.new('studio')
    scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get('Background') or w.node_tree.nodes.new('ShaderNodeBackground')
    bg.inputs[0].default_value = (world, world * 1.01, world * 1.04, 1)
    bg.inputs[1].default_value = 1.0
    out = w.node_tree.nodes.get('World Output') or w.node_tree.nodes.new('ShaderNodeOutputWorld')
    w.node_tree.links.new(bg.outputs[0], out.inputs[0])
    rig = [
        area_light('Softbox_Key', t + Vector((-2.4, -2.2, 2.6)) * s, t, 2.2 * s, 1.5 * s, 520 * s * s * key),
        area_light('Fill_Card', t + Vector((3.0, -1.4, 0.9)) * s, t, 2.4 * s, 2.4 * s, 70 * s * s * key, (0.95, 0.97, 1.0)),
        area_light('Rim_Strip', t + Vector((0.8, 2.6, 2.2)) * s, t, 2.6 * s, 0.35 * s, 260 * s * s * key),
        area_light('Top_Scrim', t + Vector((0.0, 0.0, 3.4)) * s, t, 3.0 * s, 3.0 * s, 35 * s * s * key),
    ]
    if catcher:
        bpy.ops.mesh.primitive_plane_add(size=40 * s, location=(t.x, t.y, floor_z))
        pl = bpy.context.object
        pl.name = 'ShadowCatcher'
        pl.is_shadow_catcher = True
        # a dark tabletop in reflections (a white default plane would mirror into metal and film)
        m, nt = new_material('catcher_table')
        bs = nt.nodes.new('ShaderNodeBsdfPrincipled'); o = nt.nodes.new('ShaderNodeOutputMaterial')
        bs.inputs['Base Color'].default_value = (0.012, 0.012, 0.013, 1); bs.inputs['Roughness'].default_value = 0.6
        link(nt, bs.outputs[0], o.inputs['Surface'])
        pl.data.materials.append(m)
    scene.render.film_transparent = True
    vs = scene.view_settings
    try:
        vs.view_transform = 'AgX'
        vs.look = 'AgX - Medium High Contrast'
    except TypeError:
        vs.view_transform = 'Standard'
    return rig


def camera(scene, loc, target, lens=85.0, res=(1200, 900), name='Camera'):
    cam = bpy.data.cameras.new(name)
    cam.lens, cam.sensor_width = lens, 36.0
    ob = bpy.data.objects.new(name, cam)
    scene.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    scene.camera = ob
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    return ob


def render_to(scene, filepath, fmt='PNG', quality=90, rgba=True):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    st = scene.render.image_settings
    st.file_format = fmt
    st.color_mode = 'RGBA' if rgba else 'RGB'
    if fmt in ('WEBP', 'JPEG'):
        st.quality = quality
    if fmt == 'PNG':
        st.color_depth = '8'
    scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)
    print('RENDERED', filepath, os.path.getsize(filepath))


def add_light(name, kind, loc, target=None, energy=10, color=(1.0, 0.84, 0.66), **kw):
    li = bpy.data.lights.new(name, kind)
    li.energy, li.color = energy, color
    for k, v in kw.items():
        setattr(li, k, v)
    ob = bpy.data.objects.new(name, li)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    if target is not None:
        look_at(ob, target)
    return ob
