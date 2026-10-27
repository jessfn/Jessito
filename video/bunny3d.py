# Conejo 3D estilo caricatura para Blender (se ejecuta sin pantalla).
# Uso: blender -b -P bunny3d.py -- rig.json salida/ f_inicio f_fin paso
import bpy, bmesh, json, math, sys, os, time
from mathutils import Vector, Quaternion

argv = sys.argv[sys.argv.index('--') + 1:]
RIG = json.load(open(argv[0]))
OUT = argv[1]
F0, F1, STEP = int(argv[2]), int(argv[3]), int(argv[4])
SAMPLES = int(argv[5]) if len(argv) > 5 else 12
os.makedirs(OUT, exist_ok=True)
U = 0.01  # 1 px = 0.01 unidades


def P3(x, y, d=0.0):
    """pixeles de pantalla (x,y hacia abajo) -> Blender (X derecha, Y profundidad, Z arriba)"""
    return Vector(((x - 540) * U, d, (960 - y) * U))


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------------- materiales ----------------
def mat(name, color, rough=0.7, sss=0.0, emit=None, metallic=0.0, sheen=0.0, spec=0.5, bump=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Specular IOR Level'].default_value = spec
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.4)
        b.inputs['Subsurface Scale'].default_value = 0.08
    if sheen:
        b.inputs['Sheen Weight'].default_value = sheen
        b.inputs['Sheen Roughness'].default_value = 0.5
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = 6.0
    if bump:  # microrelieve tipo pelusa
        n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 90; n.inputs['Detail'].default_value = 6
        bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = bump; bm.inputs['Distance'].default_value = 0.02
        nt.links.new(n.outputs['Fac'], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return m


def outline_mat():
    m = bpy.data.materials.new('tinta'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.20, 0.12, 0.34, 1); em.inputs['Strength'].default_value = 1.0
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(geo.outputs['Backfacing'], mix.inputs['Fac'])
    nt.links.new(tr.outputs['BSDF'], mix.inputs[1]); nt.links.new(em.outputs['Emission'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    return m


M = dict(
    fur=mat('pelo', (0.97, 0.95, 1.0), 0.9, sss=0.04, sheen=0.12, bump=0.05),
    belly=mat('panza', (1.0, 0.82, 0.90), 0.9, sss=0.04, sheen=0.1),
    pink=mat('rosa', (1.0, 0.55, 0.74), 0.6, sss=0.1),
    pinkE=mat('rosaoreja', (1.0, 0.62, 0.80), 0.8, sss=0.2),
    eye=mat('ojo', (0.03, 0.015, 0.08), 0.12, spec=1.0),
    iris=mat('iris', (0.28, 0.16, 0.55), 0.15, spec=1.0),
    hl=mat('brillo', (1, 1, 1), 1.0, emit=(1, 1, 1)),
    mouth=mat('boca', (0.42, 0.04, 0.16), 0.5),
    dark=mat('trazo', (0.20, 0.12, 0.34), 0.6),
    bow=mat('mono', (1.0, 0.22, 0.52), 0.35, spec=0.8),
    tongue=mat('lengua', (1.0, 0.45, 0.60), 0.5),
    blush=mat('rubor', (1.0, 0.50, 0.66), 0.9),
    white=mat('blanco', (1, 1, 1), 0.5),
)
INK = outline_mat()
OUTLINE_W = 0.045

# ---------------- mallas ----------------
def ellipsoid_mesh(name, rx, ry, rz, seg=40, rings=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    for v in bm.verts:
        v.co.x *= rx; v.co.y *= ry; v.co.z *= rz
    for f in bm.faces:
        f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return me


def part(name, dims, material, parent=None, outline=True, loc=(0, 0, 0), rot=(0, 0, 0), seg=40, rings=24, w=OUTLINE_W):
    outline = False  # el contorno de tinta se dibuja al componer (ver anim3.html)
    me = ellipsoid_mesh(name, *dims, seg=seg, rings=rings)
    me.materials.append(M[material])
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    ob.rotation_mode = 'QUATERNION'
    if outline:
        sm = ob.modifiers.new('tinta', 'SOLIDIFY')
        sm.thickness = w; sm.offset = 1.0; sm.use_flip_normals = True
        sm.material_offset = 1
    if parent is not None:
        ob.parent = parent
    ob.location = loc
    ob.rotation_euler = rot if parent is not None else (0, 0, 0)
    return ob


# ---------------- construccion del personaje ----------------
torso = part('torso', (1.16, 1.0, 1.7), 'fur')
belly = part('panza', (0.74, 0.16, 1.05), 'belly', parent=torso, outline=False, loc=(0, -0.86, -0.12))
head = part('cabeza', (1.52, 1.25, 1.20), 'fur', w=0.05)
tail = part('cola', (0.48, 0.48, 0.48), 'fur')
ear = [[part('oreja%d_%d' % (s, j), (r, 0.23, hl), 'fur') for j, (r, hl) in enumerate([(0.50, 0.78), (0.47, 0.82), (0.35, 0.84)])] for s in range(2)]
earin = [[part('oreja_in%d_%d' % (s, j), (r, 0.10, hl), 'pinkE', outline=False) for j, (r, hl) in enumerate([(0.30, 0.66), (0.28, 0.70), (0.19, 0.70)])] for s in range(2)]
upper = [part('brazo%d' % s, (0.25, 0.25, 0.62), 'fur') for s in range(2)]
fore = [part('antebrazo%d' % s, (0.23, 0.23, 0.58), 'fur') for s in range(2)]
elbow = [part('codo%d' % s, (0.26, 0.26, 0.26), 'fur', outline=False) for s in range(2)]
hand = [part('mano%d' % s, (0.34, 0.28, 0.36), 'fur') for s in range(2)]
fing = [[part('dedo%d_%d' % (s, k), (0.12, 0.12, 0.13), 'fur', outline=False, parent=hand[s], loc=((k - 1) * 0.17, -0.18, -0.30 + (0.04 if k == 1 else 0))) for k in range(3)] for s in range(2)]
bean = [part('almohadilla%d' % s, (0.17, 0.05, 0.14), 'pink', outline=False, parent=hand[s], loc=(0, -0.27, -0.02)) for s in range(2)]
thigh = [part('muslo%d' % s, (0.36, 0.36, 0.62), 'fur') for s in range(2)]
shin = [part('pierna%d' % s, (0.32, 0.32, 0.62), 'fur') for s in range(2)]
knee = [part('rodilla%d' % s, (0.35, 0.35, 0.35), 'fur', outline=False) for s in range(2)]
foot = [part('pie%d' % s, (0.68, 0.52, 0.34), 'fur') for s in range(2)]
toes = [[part('dedop%d_%d' % (s, k), (0.17, 0.15, 0.15), 'fur', outline=True, w=0.03, parent=foot[s], loc=((k - 1) * 0.36, -0.46, -0.10)) for k in range(3)] for s in range(2)]
pad = [part('pata%d' % s, (0.26, 0.06, 0.20), 'pink', outline=False, parent=foot[s], loc=(0, -0.48, -0.06)) for s in range(2)]
# moño
bowL = part('monoL', (0.34, 0.11, 0.26), 'bow', w=0.03)
bowR = part('monoR', (0.34, 0.11, 0.26), 'bow', w=0.03)
bowC = part('monoC', (0.15, 0.13, 0.15), 'bow', w=0.03)
# cara
eyeO, irisO, hl1, hl2, joyO = [], [], [], [], []
for s in range(2):
    sd = -1 if s == 0 else 1
    eyeO.append(part('ojo%d' % s, (0.34, 0.14, 0.44), 'eye', parent=head, outline=False, loc=(sd * 0.58, -1.08, 0.04)))
    irisO.append(part('iris%d' % s, (0.27, 0.07, 0.36), 'iris', parent=eyeO[s], outline=False, loc=(0, -0.10, -0.03)))
    hl1.append(part('brillo%d' % s, (0.13, 0.07, 0.14), 'hl', parent=eyeO[s], outline=False, loc=(-0.10, -0.14, 0.16)))
    hl2.append(part('brillob%d' % s, (0.07, 0.05, 0.07), 'hl', parent=eyeO[s], outline=False, loc=(0.11, -0.14, -0.15)))
# ojo feliz ^ ^ : arco construido con una curva
def arc_curve(name, pts, bevel, matname):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = bevel; cu.bevel_resolution = 6; cu.resolution_u = 14
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, (co, hl_, hr_) in zip(sp.bezier_points, pts):
        bp.co = co; bp.handle_left = hl_; bp.handle_right = hr_
    cu.materials.append(M[matname])
    ob = bpy.data.objects.new(name, cu); sc.collection.objects.link(ob)
    return ob
joy = []
for s in range(2):
    sd = -1 if s == 0 else 1
    ob = arc_curve('felizojo%d' % s, [((-0.30, 0, -0.10), (-0.38, 0, 0.02), (-0.22, 0, 0.22)), ((0.30, 0, -0.10), (0.22, 0, 0.22), (0.38, 0, 0.02))], 0.055, 'dark')
    ob.parent = head; ob.location = (sd * 0.58, -1.12, 0.06); joy.append(ob)
nose = part('nariz', (0.17, 0.12, 0.12), 'pink', parent=head, loc=(0, -1.19, -0.27), w=0.03)
noseh = part('narizbrillo', (0.05, 0.03, 0.03), 'hl', parent=nose, outline=False, loc=(-0.06, -0.10, 0.05))
pf = [part('hocico%d' % s, (0.40, 0.22, 0.32), 'fur', parent=head, outline=False, loc=((-1 if s == 0 else 1) * 0.26, -1.06, -0.52)) for s in range(2)]
mouth_open = part('bocaabierta', (0.3, 0.07, 0.3), 'mouth', parent=head, outline=False, loc=(0, -1.20, -0.58))
tongue = part('lengua', (0.20, 0.05, 0.12), 'tongue', parent=mouth_open, outline=False, loc=(0, -0.045, -0.16))
teeth = part('dientes', (0.20, 0.03, 0.06), 'white', parent=mouth_open, outline=False, loc=(0, -0.05, 0.22))
smile = arc_curve('sonrisa', [((-0.30, 0, 0.10), (-0.36, 0, 0.14), (-0.22, 0, -0.06)), ((0, 0, -0.04), (-0.08, 0, -0.04), (0.08, 0, -0.04)), ((0.30, 0, 0.10), (0.22, 0, -0.06), (0.36, 0, 0.14))], 0.04, 'dark')
smile.parent = head; smile.location = (0, -1.23, -0.52)
# ceja
brow = [part('ceja%d' % s, (0.27, 0.07, 0.065), 'dark', parent=head, outline=False, loc=((-1 if s == 0 else 1) * 0.58, -1.02, 0.60)) for s in range(2)]
blush = [part('rubor%d' % s, (0.30, 0.06, 0.20), 'blush', parent=head, outline=False, loc=((-1 if s == 0 else 1) * 0.98, -0.80, -0.36), rot=(0, 0, (1 if s == 0 else -1) * 0.5)) for s in range(2)]
tuft = [part('mechon%d' % k, (0.15, 0.10, 0.36), 'fur', parent=head, loc=((k - 0.5) * 0.28, -0.15, 1.20), rot=(0, (k - 0.5) * 0.9, 0), w=0.03) for k in range(2)]
ctuft = [part('patilla%d' % s, (0.28, 0.12, 0.13), 'fur', parent=head, outline=False, loc=((-1 if s == 0 else 1) * 1.45, -0.35, -0.12), rot=(0, 0, (1 if s == 0 else -1) * 0.35)) for s in range(2)]
whisk = []
for s in range(2):
    sd = -1 if s == 0 else 1
    ws = []
    for k, a in enumerate((-0.25, 0.0, 0.25)):
        w = part('bigote%d_%d' % (s, k), (0.55, 0.012, 0.012), 'dark', parent=head, outline=False, loc=(sd * 1.12, -0.78, -0.50 + k * 0.03), seg=8, rings=6)
        w.rotation_mode = 'XYZ'
        ws.append((w, a))
    whisk.append(ws)

# ---------------- escena ----------------
cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'; cam_d.ortho_scale = 10.8; cam_d.sensor_fit = 'HORIZONTAL'
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); cam.location = (0, -30, 0); cam.rotation_euler = (math.pi / 2, 0, 0); sc.camera = cam
def light(name, kind, loc, energy, size, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, kind); l.energy = energy; l.color = color
    if kind == 'AREA': l.size = size
    ob = bpy.data.objects.new(name, l); sc.collection.objects.link(ob); ob.location = loc
    d = (Vector((0, 0, 0)) - Vector(loc)); ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return ob
light('clave', 'AREA', (-6, -9, 7), 760, 7, (1.0, 0.95, 0.88))
light('relleno', 'AREA', (7, -8, 2), 160, 8, (0.8, 0.88, 1.0))
light('borde', 'AREA', (3, 6, 7), 450, 6, (1.0, 0.92, 0.96))
w = bpy.data.worlds.new('mundo'); sc.world = w; w.use_nodes = True
nt = w.node_tree; bg = nt.nodes['Background']
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); ramp = nt.nodes.new('ShaderNodeValToRGB'); mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1; mr.inputs['From Max'].default_value = 1
ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (0.30, 0.36, 0.30, 1)   # rebote del pasto
ramp.color_ramp.elements[1].position = 0.7; ramp.color_ramp.elements[1].color = (0.70, 0.80, 0.98, 1)      # cielo
nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], mr.inputs['Value']); nt.links.new(mr.outputs['Result'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 0.55

sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'; sc.cycles.max_bounces = 3; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 2
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.05
sc.render.resolution_x = 1080; sc.render.resolution_y = 1920; sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
sc.render.use_border = True; sc.render.use_crop_to_border = True
sc.render.threads_mode = 'FIXED'; sc.render.threads = int(os.environ.get('BTHREADS', '2'))


# ---------------- posar un cuadro ----------------
def quat_z(d):
    return d.normalized().to_track_quat('Z', 'Y')


def seg(ob, a, b, depth=0.0):
    A, B = Vector(a), Vector(b)
    ob.location = (A + B) / 2
    ob.rotation_quaternion = quat_z(B - A)


def pose_frame(fr):
    d = RIG[fr]; P = d['P']; S = 1.0
    def Q(pt, dep=0.0): return P3(pt[0], pt[1], dep)
    # torso
    hip, chest = Q(d['hip']), Q(d['chest'])
    mid = (hip + chest) / 2 + Vector((0, 0.0, -0.08))
    torso.location = mid + Vector((0, 0.05, 0))
    torso.rotation_quaternion = Quaternion((0, 1, 0), P['lean'] * 1.0)
    ln = (chest - hip).length
    torso.scale = (P['sx'] * (1 + d['bel']), 1.0, max(0.5, (ln / 2 + 0.64) / 1.7 + 0.0))
    # cabeza
    hd = Q(d['head']); head.location = hd
    head.rotation_quaternion = Quaternion((0, 1, 0), P['tilt'] + P['lean'] * 0.4)
    head.scale = (1.0 / math.sqrt(P['sy']), 1.0, math.sqrt(P['sy']))
    # cola (resorte)
    tail.location = hip + Vector((0.88 * P['sx'] + d['tail'][0] * U, 0.75, 0.28 - d['tail'][1] * U))
    # moño
    bc = chest + Vector((0, -1.0, -0.38))
    bow_ang = d['bow']
    for ob, sx_ in ((bowL, -1), (bowR, 1)):
        ob.location = bc + Vector((sx_ * 0.30, 0, 0))
        ob.rotation_quaternion = Quaternion((0, 1, 0), bow_ang + sx_ * 0.12)
    bowC.location = bc
    # orejas
    for s in range(2):
        pts = [Q(p, 0.10) for p in d['ears'][s]]
        for j in range(3):
            seg(ear[s][j], pts[j], pts[j + 1])
            a, b = pts[j], pts[j + 1]
            seg(earin[s][j], a + Vector((0, -0.18, 0)), b + Vector((0, -0.18, 0)))
    # brazos
    for s in range(2):
        sh, el, hnd = [Q(p, -0.62) for p in d['arms'][s]]
        seg(upper[s], sh, el); seg(fore[s], el, hnd)
        elbow[s].location = el
        hand[s].location = hnd + Vector((0, -0.05, 0))
        ang = math.atan2((hnd - el).x, -(hnd - el).z)
        hand[s].rotation_quaternion = Quaternion((0, 1, 0), -ang)
    # piernas
    for s in range(2):
        a, k, f = [Q(p, -0.30) for p in d['legs'][s]]
        seg(thigh[s], a, k); seg(shin[s], k, f)
        knee[s].location = k
        foot[s].location = f + Vector((0, -0.18, -0.02))
        foot[s].rotation_quaternion = Quaternion((0, 1, 0), (0.15 if P['air'] > 0.5 else 0.0) * (1 if s else -1))
    # cara
    eo = max(0.06, P['eye']); joy_on = P['joy'] > 0.5
    for s in range(2):
        happy = joy_on or (s == 0 and P['winkL'] > 0.5)
        eyeO[s].hide_render = happy; joy[s].hide_render = not happy
        eyeO[s].scale = (1, 1, eo)
        sh_x = P['lookX'] * 0.07; sh_z = -P['lookY'] * 0.07
        hl1[s].location = (-0.10 + sh_x, -0.14, 0.16 + sh_z); hl2[s].location = (0.11 + sh_x, -0.14, -0.15 + sh_z)
        brow_sd = -1 if s == 0 else 1
        brow[s].location = (brow_sd * 0.58, -1.02, 0.60 + (-P['brow']) * 0.07 + (0.06 if P['eye'] > 1 else 0))
        brow[s].rotation_quaternion = Quaternion((0, 1, 0), -brow_sd * P['browTilt'] * 0.45 + brow_sd * (0.18 * -P['brow'] if P['brow'] < 0 else 0))
        blush[s].scale = (1, 1, 1)
    tk = P['talk']; mouth_kind = P['mouth']
    talk_on = tk > 0.07
    open_on = talk_on or mouth_kind in ('open', 'grin', 'o')
    mouth_open.hide_render = not open_on
    tongue.hide_render = True; teeth.hide_render = True
    smile.hide_render = open_on or mouth_kind == 'ouch'
    if open_on:
        if talk_on:
            w_, h_ = 0.28 + 0.12 * min(1, tk * 1.2), 0.07 + 0.32 * tk
        elif mouth_kind == 'grin':
            w_, h_ = 0.42, 0.30
        elif mouth_kind == 'o':
            w_, h_ = 0.16, 0.20
        else:
            w_, h_ = 0.30, 0.26
        mouth_open.scale = (w_ / 0.3, 1, h_ / 0.3)
        mouth_open.location = (0, -1.20, -0.46 - h_ * 0.9)
        tongue.hide_render = h_ < 0.20; teeth.hide_render = h_ < 0.16
    # bigotes
    for s in range(2):
        sd = -1 if s == 0 else 1
        for w_, a in whisk[s]:
            w_.rotation_euler = (0, sd * (a + d['wh'] * 0.9) * -1, 0)
            w_.location = (sd * 1.12 + sd * 0.45 * math.cos(a), -0.78, -0.50 + math.sin(a) * 0.45)
    bpy.context.view_layer.update()
    return d


def set_border(d):
    x0, y0, x1, y1 = d['bbox']
    x0 += 100; y0 += 100; x1 -= 100; y1 -= 100  # recorte mas ajustado = render mas rapido
    x0 = max(0, x0); y0 = max(0, y0); x1 = min(1080, x1); y1 = min(1920, y1)
    sc.render.border_min_x = x0 / 1080; sc.render.border_max_x = x1 / 1080
    sc.render.border_min_y = 1 - y1 / 1920; sc.render.border_max_y = 1 - y0 / 1920
    return [round(x0), round(y0), round(x1), round(y1)]


MF = os.path.join(OUT, 'meta_%s.json' % os.environ.get('TAG', F0))
meta = {}
if os.path.exists(MF):
    meta = json.load(open(MF))
t0 = time.time()
FRAMES = json.load(open(os.environ['FRAMES'])) if os.environ.get('FRAMES') else range(F0, F1 + 1, STEP)
for fr in FRAMES:
    d = pose_frame(fr)
    meta[str(fr)] = set_border(d)
    sc.render.filepath = os.path.join(OUT, 'b%04d.png' % fr)
    bpy.ops.render.render(write_still=True)
    json.dump(meta, open(MF, 'w'))
    print('RESULT frame', fr, round(time.time() - t0, 1), 's', flush=True)
