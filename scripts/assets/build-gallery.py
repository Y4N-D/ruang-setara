"""Reproducible original gallery geometry, glTF and CPU rendered access mode.
Requires Blender Python (bpy 4.2). This creates actual meshes, not AI images.
"""
import bpy, math, random, os
from mathutils import Vector
from math import sin,cos,pi
random.seed(21)
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'));OUT=os.path.join(ROOT,'public/gallery');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5
scene.render.threads_mode='FIXED';scene.render.threads=6
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=88
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.85,.93,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4

def rgba(h):
    vals=[int(h[i:i+2],16)/255 for i in (1,3,5)];return tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in vals)+(1,)
def mat(name,color,rough=.5,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgba(color);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
stone=mat('Ivory limestone','#e4e1d6',.65);white=mat('Chalk plaster','#efede5',.8);blue=mat('Powder blue glaze','#82abb4',.25);sage=mat('Celadon ceramic','#93b3a3',.32);coral=mat('Soft terracotta','#d8997d',.42);lavender=mat('Periwinkle plaster','#a9afd0',.55);brass=mat('Satin brass','#c6a360',.26,.8);dark=mat('Ink enamel','#29434a',.4);wood=mat('Natural oak','#b68b61',.4);paper=mat('Warm paper','#fff6df',.75)
leafmats=[mat('Leaf '+str(i),c,.5) for i,c in enumerate(['#467650','#527e5b','#74966b'])]
for m,strength,scalev in [(stone,.055,52),(white,.022,90),(wood,.08,8)]:
    nt=m.node_tree;p=nt.nodes.get('Principled BSDF');n=nt.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=scalev;n.inputs['Detail'].default_value=2;b=nt.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=strength;b.inputs['Distance'].default_value=.045;nt.links.new(n.outputs['Fac'],b.inputs['Height']);nt.links.new(b.outputs['Normal'],p.inputs['Normal'])
room=None

def finish(o,name,m,parent=None,smooth=False):
    o.name=name
    if m:o.data.materials.append(m)
    o.parent=parent if parent is not None else room
    if smooth and o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o

def box(name,loc,size,m,bevel=.06,parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,name,m,parent)
    if bevel:
        mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=4;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def cyl(name,loc,r,depth,m,r2=None,parent=None):
    bpy.ops.mesh.primitive_cone_add(vertices=64,radius1=r,radius2=r if r2 is None else r2,depth=depth,location=loc);o=finish(bpy.context.object,name,m,parent,True);mod=o.modifiers.new('Rounded rim','BEVEL');mod.width=min(.03,depth*.2);mod.segments=3;return o

def sphere(name,loc,scale,m,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,radius=1,location=loc);o=bpy.context.object;o.scale=scale;return finish(o,name,m,parent,True)

def tube(name,points,r,m,parent=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3;s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);return finish(o,name,m,parent)

def text(body,loc,size,m=dark,rot=(pi/2,0,0)):
    c=bpy.data.curves.new(body,'FONT');c.body=body;c.size=size;c.align_x='CENTER';c.extrude=.0012;c.space_character=1.15;o=bpy.data.objects.new(body,c);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=rot;return finish(o,body,m)

def arch(x,y,m):
    r=2.48;thick=.25;h=2.6;d=.36
    for s in [-1,1]:box('Alcove pier',(x+s*(r+thick/2),y,h/2),(thick,d,h),m,.04)
    verts=[];faces=[];steps=72
    for i in range(steps+1):
        a=pi*i/steps
        for yy in [-d/2,d/2]:
            for rr in [r,r+thick]:verts.append((x+rr*cos(a),y+yy,h+rr*sin(a)))
    for i in range(steps):
        a=i*4;b=(i+1)*4;faces.extend([(a,b,b+1,a+1),(a+2,a+3,b+3,b+2),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
    mesh=bpy.data.meshes.new('Vault');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Vault',mesh);bpy.context.collection.objects.link(o);finish(o,'Continuous smooth vault',m,smooth=True);mod=o.modifiers.new('Arch bevel','BEVEL');mod.width=.02;mod.segments=3

def plant(x,y,s=1):
    cyl('Ceramic planter',(x,y,.35*s),.43*s,.7*s,stone,.53*s)
    for j in range(7):
        a=j*2.4;h=(1.45+random.random()*.8)*s;dx=cos(a)*.7*s;dy=sin(a)*.7*s;tube('Stem',[(x,y,.7*s),(x+dx*.22,y+dy*.22,h*.65),(x+dx,y+dy,h)],.016*s,leafmats[0]);v=[];f=[]
        for k in range(13):
            t=k/12;center=Vector((x+dx+t*cos(a)*.72*s,y+dy+t*sin(a)*.72*s,h+.3*sin(pi*t)*s-.24*t*s));w=.22*sin(pi*t)*s
            for side in [-1,0,1]:v.append(tuple(center+Vector((-sin(a)*w*side,cos(a)*w*side,-abs(side)*.055*s*sin(pi*t)))))
        for k in range(12):
            for q in range(2):b=k*3+q;f.append((b,b+1,b+4,b+3))
        mesh=bpy.data.meshes.new('leaf');mesh.from_pydata(v,[],f);mesh.update();o=bpy.data.objects.new('Leaf',mesh);bpy.context.collection.objects.link(o);finish(o,'Curved leaf',leafmats[j%3],smooth=True);so=o.modifiers.new('Leaf thickness','SOLIDIFY');so.thickness=.009*s

def plaque(body,y=-.7,z=.56,w=2.9):
    box('Exhibit label',(0,y,z),(w,.05,.4),white,.02);text(body,(0,y-.035,z-.052),.14)

rooms=[];accents=[sage,coral,blue,coral,sage,lavender];labels=['RUANG SETARA','PILIHAN & DAMPAK','KESEIMBANGAN','KONSTITUSI','KEADILAN','REFLEKSI']
for idx in range(6):
    room=bpy.data.objects.new('Gallery_'+str(idx),None);bpy.context.collection.objects.link(room);rooms.append(room);accent=accents[idx]
    box('Gallery foundation',(0,0,-.26),(13.8,11,.5),stone,.12);box('Floor',(0,0,.013),(13.6,10.8,.035),stone,.015)
    for x in [-4.5,-2.25,0,2.25,4.5]:box('Tile joint',(x,0,.034),(.009,10.6,.004),white,0)
    for y in [-3.6,-1.8,0,1.8,3.6]:box('Tile joint',(0,y,.034),(13.5,.009,.004),white,0)
    box('Back wall',(0,5.18,2.9),(13.65,.25,5.8),white,.07);box('Colored backdrop',(0,4.98,2.85),(5.9,.12,5.65),accent,.06);arch(0,4.71,stone)
    box('Side return',(-6.62,2.25,2.6),(.27,5.85,5.2),white,.07)
    for k in range(16):box('Oak slat',(-5.5+k*.17,4.97,2.2),(.085,.2,4.4),wood,.035)
    box('Low wall',(6.61,3,.85),(.26,4.4,1.7),stone,.08)
    for k in range(3):cyl('Column',(5.9,4-k*2.2,2.4),.18,4.8,stone)
    box('Cornice',(5.9,1.8,4.83),(.55,5,.2),stone,.09)
    text(labels[idx],(0,4.5,4.45),.21);text(str(idx).zfill(2),(-5.9,4.78,4.47),.32)
    box('Oak bench',(-4.2,1.7,.48),(2.5,.8,.16),wood,.07)
    for x in [-5.1,-3.3]:box('Bench leg',(x,1.7,.23),(.14,.55,.5),brass,.02)
    box('Bench cushion',(-4.2,1.7,.62),(2.4,.76,.18),accent,.085);plant(4.7,3.7,1.25);plant(-5.2,-2.2,.78)
    for x in [-3.8,3.8]:tube('Pendant wire',[(x,1,4.6),(x,1,5.8)],.013,brass);cyl('Pendant',(x,1,4.6),.58,.1,brass);cyl('Diffuser',(x,1,4.54),.52,.03,paper)
    if idx==0:
        cyl('Atrium plinth',(0,1,.45),1.7,.9,stone)
        for j,m in enumerate([sage,brass]):
            bpy.ops.mesh.primitive_torus_add(major_segments=112,minor_segments=24,location=(0,1,2.25),rotation=(pi/2,0,.12 if j==0 else pi/2-.25),major_radius=1.12,minor_radius=.16 if j==0 else .12);finish(bpy.context.object,'Equal dignity sculpture',m,smooth=True)
        plaque('HAK  /  KEWAJIBAN')
        for x in [-3,3]:cyl('Upholstered stool',(x,-1.4,.42),.65,.8,coral)
    elif idx==1:
        for j in range(4):
            x=(j-1.5)*2.6;box('Situation monolith',(x,1.2,1.32),(1.62,.65,2.64),[sage,blue,coral,lavender][j],.22);sphere('Choice marker',(x,.81,2.01),(.26,.085,.26),brass);text(str(j+1).zfill(2),(x,.71,1.94),.23);text(['SEKOLAH','DIGITAL','JALAN RAYA','KERAGAMAN'][j],(x,.82,1.02),.14);box('Base',(x,1.2,.13),(1.9,1.1,.26),stone,.09)
    elif idx==2:
        cyl('Scale plinth',(0,1,.4),1.68,.8,stone);cyl('Scale base',(0,1,.89),.62,.18,brass);cyl('Base top',(0,1,1.02),.43,.14,brass,.32);cyl('Scale column',(0,1,2.06),.10,2.05,brass,.074)
        for zz in [1.13,2.72,3.03]:cyl('Turned collar',(0,1,zz),.17,.095,brass)
        sphere('Finial',(0,1,3.29),(.16,.16,.22),brass)
        pivot=bpy.data.objects.new('ScaleBeam',None);bpy.context.collection.objects.link(pivot);pivot.parent=room;pivot.location=(0,1,3.05);box('Rounded beam',(0,0,0),(4.5,.13,.14),brass,.065,parent=pivot)
        for side in [-1,1]:
            sphere('Beam end',(side*2.15,0,0),(.12,.12,.12),brass,parent=pivot);bowl=bpy.data.objects.new('ScaleBowl_'+str(side),None);bpy.context.collection.objects.link(bowl);bowl.parent=room;bowl.location=(side*2.12,1,3.05)
            for a in [pi/2,pi*7/6,pi*11/6]:tube('Suspension',[(0,0,-.04),(.68*cos(a),.68*sin(a),-1.05)],.012,brass,parent=bowl)
            v=[];f=[];n=80
            for k in range(13):
                t=k/12
                for j in range(n):a=j/n*2*pi;v.append((.72*t*cos(a),.72*t*sin(a),-1.38+.3*t*t))
            for k in range(12):
                for j in range(n):a=k*n+j;b=k*n+(j+1)%n;f.append((a,b,b+n,a+n))
            me=bpy.data.meshes.new('Bowl');me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new('Bowl',me);bpy.context.collection.objects.link(o);finish(o,'Smooth ceramic bowl',blue if side<0 else coral,parent=bowl,smooth=True);o.modifiers.new('Porcelain thickness','SOLIDIFY').thickness=.035
            bpy.ops.mesh.primitive_torus_add(major_segments=80,minor_segments=12,location=(0,0,-1.08),major_radius=.72,minor_radius=.025);finish(bpy.context.object,'Gilt rim',brass,parent=bowl,smooth=True)
        plaque('HAK  /  KEWAJIBAN')
    elif idx==3:
        box('Book pedestal',(0,.9,.75),(3.5,2.2,1.5),stone,.1)
        for side in [-1,1]:
            for layer in range(4):
                v=[];f=[]
                for a in range(41):
                    t=a/40
                    for b in [0,1]:v.append((side*(.02+1.46*t),.9+(b-.5)*1.9,1.66+.22*sin(pi*t*.86)+layer*.018))
                for a in range(40):f.append((a*2,a*2+1,a*2+3,a*2+2))
                me=bpy.data.meshes.new('Page');me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new('Page',me);bpy.context.collection.objects.link(o);finish(o,'Curved open page',paper,smooth=True);o.modifiers.new('Page thickness','SOLIDIFY').thickness=.015
            box('Bound cover',(side*.76,.9,1.6),(1.52,2.02,.07),dark,.03)
        text('UUD 1945',(-.77,.86,1.985),.24,rot=(0,0,0));text('PASAL 28A - 28J',(.75,.86,1.985),.13,rot=(0,0,0));plaque('HAK ASASI MANUSIA',y=-.24,z=.8)
        for side in [-1,1]:
            for j in range(7):box('Printed line',(side*.77,.55-j*.09,1.98),(1.02,.008,.003),wood,0)
    elif idx==4:
        box('Justice pedestal',(0,1,.65),(3.7,2.3,1.3),stone,.12);cyl('Gavel block',(-.35,.8,1.4),.9,.18,wood);cyl('Block rim',(-.35,.8,1.51),.78,.06,brass)
        o=cyl('Oak gavel head',(-.25,1.05,1.96),.38,1.45,wood);o.rotation_euler[1]=pi/2
        for x in [-.83,.33]:o=cyl('Gavel collar',(x,1.05,1.96),.391,.1,brass);o.rotation_euler[1]=pi/2
        o=cyl('Turned handle',(.3,-.03,1.97),.082,2.4,wood,.135);o.rotation_euler[0]=pi/2;o.rotation_euler[2]=-.24;sphere('Handle grip',(.55,-1.17,1.97),(.13,.19,.13),wood);plaque('SETARA DI HADAPAN HUKUM',y=-.2,z=.72,w=3.35)
    else:
        for j in range(5):
            x=(j-2)*1.4;h=.45+j*.22;cyl('Reflection pedestal',(x,1,h/2),.51,h,stone);sphere('Reflection orb',(x,1,h+.44),(.43,.43,.43),[sage,coral,blue,brass,lavender][j]);text(str(j+1),(x,.52,h+.36),.23)
        plaque('PAHAMI. PILIH. LAKUKAN.',y=-.95,z=.31,w=3.7)
    room.location.x=idx*19
room=None;box('Studio ground',(40,0,-.62),(240,140,.18),white,.03)
def area(name,loc,power,size,col,target):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=col;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for idx in range(6):
    x=idx*19;area('Daylight',(x-4,-2,11),2100,8,(1,.91,.78),(x,1,0));area('Window fill',(x+5,-4,7),1300,7,(.8,.9,1),(x,2,2))
d=bpy.data.lights.new('Sun','SUN');d.energy=1.2;d.angle=.12;o=bpy.data.objects.new('Sun',d);bpy.context.collection.objects.link(o);o.rotation_euler=(.5,-.35,-.6)
d=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',d);bpy.context.collection.objects.link(cam);scene.camera=cam;d.clip_end=400

def aim(eye,target,lens):cam.location=eye;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();d.lens=lens
# Convert curve and text objects to actual exportable meshes.
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.data.objects):
    if o.type in {'CURVE','FONT'}:
        bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
for o in bpy.data.objects:
    if o.type not in {'LIGHT','CAMERA'}:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'ruang-setara.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
os.makedirs(os.path.join(ROOT,'.sites-runtime'),exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'.sites-runtime/gallery.blend'))
def render_mobile(idx,tilted=False):
    scene.render.resolution_x=750;scene.render.resolution_y=1334;scene.cycles.samples=16;d.sensor_fit='VERTICAL';d.sensor_height=24
    aim((idx*19+1.5,-14.5,3.3),(idx*19,1.15,2),24)
    scene.render.filepath=os.path.join(OUT,'room-'+str(idx)+('-tilted' if tilted else '')+'-mobile.jpg');bpy.ops.render.render(write_still=True)
    scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.cycles.samples=20;d.sensor_fit='AUTO'

for idx in range(6):
    x=idx*19
    for j,r in enumerate(rooms):
        for ob in [r]+list(r.children_recursive):ob.hide_render=j!=idx
    aim((x+16,-21,16),(x,0,-.5),30);scene.render.filepath=os.path.join(OUT,f'entry-{idx}.jpg');bpy.ops.render.render(write_still=True)
    aim((x+4.1,-9.9,3.1),(x,1.15,2.0),34);scene.render.filepath=os.path.join(OUT,f'room-{idx}.jpg');bpy.ops.render.render(write_still=True);render_mobile(idx)
    if idx==2:
        a=.18;bpy.data.objects['ScaleBeam'].rotation_euler[1]=a
        for side in [-1,1]:bpy.data.objects['ScaleBowl_'+str(side)].location=(side*2.12*cos(a),1,3.05-side*2.12*sin(a))
        aim((x+4.1,-9.9,3.1),(x,1.15,2),34);scene.render.filepath=os.path.join(OUT,'room-2-tilted.jpg');bpy.ops.render.render(write_still=True);render_mobile(idx,True);bpy.data.objects['ScaleBeam'].rotation_euler[1]=0
        for side in [-1,1]:bpy.data.objects['ScaleBowl_'+str(side)].location=(side*2.12,1,3.05)
print('GALLERY_ASSETS_COMPLETE',flush=True)

# bpy 4.2 may crash during interpreter teardown after a completed render.
os._exit(0)
