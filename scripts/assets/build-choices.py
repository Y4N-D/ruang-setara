"""Original smooth 3D story wing. Reuses the gallery's material/mesh primitives.
Run with Blender's bpy 4.2. Exports one GLB and matching accessible-mode renders.
Characters have named head/arm pivots for subtle runtime motion.
After rendering, run optimize-choices.py, then compress-choices.mjs.
"""
from pathlib import Path
base=Path(__file__).with_name('build-gallery.py').read_text()
exec(base[:base.index('rooms=[];accents=')])
OUT=os.path.join(ROOT,'public/stories');os.makedirs(OUT,exist_ok=True)
scene.cycles.samples=18;scene.render.resolution_x=1440;scene.render.resolution_y=1000
scene.view_settings.look='AgX - Medium High Contrast'
skin=mat('Warm skin','#b87c57',.61);skin2=mat('Light warm skin','#d5a47f',.62);skin3=mat('Deep warm skin','#996343',.62)
hair=mat('Dark hair','#292625',.57);cloth=mat('School white cotton','#f8f5e9',.74);navy=mat('School navy fabric','#3e5367',.77);shoe=mat('Charcoal shoes','#343e3d',.65);eye=mat('Eyes','#302a25',.34);grass=mat('Meadow','#81a36d',.9);earth=mat('Earth','#ac8a68',.85);water=mat('River glaze','#83bfc3',.2,.08);road=mat('Road','#9ca4a1',.8);red=mat('Signal red','#b97869',.5);glass=mat('Phone screen','#548898',.21,.1)
def empty(name,loc=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent if parent is not None else room;o.location=loc;return o
def ball(name,loc,scale,m,parent=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=28,ring_count=18,radius=1,location=loc);o=bpy.context.object;o.scale=scale;return finish(o,name,m,parent,True)
def limb(name,a,b,r,m,parent,r2=None):
 mid=(Vector(a)+Vector(b))/2;o=cyl(name,mid,r,(Vector(b)-Vector(a)).length,m,r2,parent);o.rotation_euler=(Vector(b)-Vector(a)).to_track_quat('Z','Y').to_euler();ball(name+' joint',a,(r,r,r),m,parent);ball(name+' end',b,(r2 or r,r2 or r,r2 or r),m,parent);return o
def torso(parent,m):
 rings=[(.85,.16,.105),(.95,.20,.12),(1.13,.205,.125),(1.30,.235,.13),(1.37,.255,.115),(1.43,.16,.095)]
 v=[];f=[];n=32
 for z,rx,ry in rings:
  for k in range(n):a=k/n*2*pi;v.append((rx*cos(a),ry*sin(a),z))
 for j in range(len(rings)-1):
  for k in range(n):a=j*n+k;b=j*n+(k+1)%n;f.append((a,b,b+n,a+n))
 f.extend([tuple(reversed(range(n))),tuple((len(rings)-1)*n+k for k in range(n))]);me=bpy.data.meshes.new('Tailored torso');me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new('Cotton shirt',me);bpy.context.collection.objects.link(o);finish(o,'Cotton shirt',m,parent,True);sub=o.modifiers.new('Cloth smoothing','SUBSURF');sub.levels=1
 for s in [-1,1]:
  o=box('Shirt collar',(s*.055,-.12,1.40),(.10,.025,.09),cloth,.02,parent);o.rotation_euler.y=s*.3
 for z in [1.05,1.17,1.29]:ball('Button',(0,-.129,z),(.013,.008,.013),paper,parent)
def hand(name,loc,m,parent):
 ball(name,loc,(.054,.036,.073),m,parent)
 for i in range(4):
  x=loc[0]+(i-1.5)*.024;limb('Finger',(x,loc[1],loc[2]-.035),(x,loc[1]-.005,loc[2]-.105+abs(i-1.5)*.009),.010,m,parent)
 ball('Thumb',(loc[0]+.049,loc[1]-.011,loc[2]-.015),(.018,.025,.042),m,parent)
def person(name,x,y,yaw=0,pose='stand',m=cloth,sk=skin,seated=False,adult=False):
 actor=empty('Actor_'+name,(x,y,-.36 if seated else .07));actor.rotation_euler.z=yaw;actor.scale=(1.10,1.10,1.10) if adult else (1,1,1);torso(actor,m)
 for s in [-1,1]:
  hip=(s*.105,0,.88);knee=(s*.13,-.36,.78) if seated else (s*.115,.01,.46);ankle=(s*.13,-.39,.40) if seated else (s*.12,-.015,.09)
  limb('Trouser thigh',hip,knee,.097,navy,actor,.085);limb('Trouser lower leg',knee,ankle,.082,navy,actor,.065);ball('Rounded shoe',(ankle[0],ankle[1]-.075,ankle[2]-.035),(.085,.16,.06),shoe,actor)
 cyl('Neck',(0,0,1.47),.065,.15,sk,parent=actor)
 head=empty('Head_'+name,(0,0,1.64),actor);head.rotation_euler.x=.18 if pose=='sad' else .07 if pose=='phone' else -.02
 ball('Face',(0,0,0),(.142,.127,.188),sk,head);ball('Hair crown',(0,.025,.13),(.149,.13,.091),hair,head)
 for s in [-1,1]:
  ball('Ear',(s*.143,0,0),(.026,.033,.045),sk,head);ball('Hair temple',(s*.132,.033,.075),(.022,.085,.067),hair,head);ball('Eye white',(s*.056,-.119,.018),(.027,.010,.015),paper,head);ball('Pupil',(s*.056,-.128,.016),(.013,.006,.013),eye,head);tube('Eyebrow',[(s*.035,-.124,.052),(s*.057,-.126,.057),(s*.079,-.116,.051)],.008,hair,head)
 ball('Nose',(0,-.130,-.011),(.023,.030,.039),sk,head);tube('Mouth',[(-.03,-.115,-.072),(0,-.124,-.078),(.03,-.115,-.072)],.006,wood,head)
 if name=='Mira':
  ball('Headscarf back',(0,.07,.075),(.162,.12,.19),sage,head);ball('Scarf shoulder drape',(0,.04,1.40),(.27,.14,.13),sage,actor)
 for s in [-1,1]:
  pivot=empty('Arm_'+name+('_L' if s<0 else '_R'),(s*.22,0,1.34),actor)
  if pose in ['phone','sad']:
   elbow=(s*.045,-.02,-.24);wrist=(s*-.035,-.31,-.15 if pose=='phone' else -.39)
  elif pose in ['help','talk'] and s<0:
   elbow=(-.05,-.12,-.19);wrist=(-.11,-.37,-.09)
  else:elbow=(s*.05,.01,-.27);wrist=(s*.03,-.05,-.51)
  limb('Sleeve',(0,0,0),tuple(Vector(elbow)*.58),.084,m,pivot,.075);limb('Forearm',tuple(Vector(elbow)*.58),elbow,.054,sk,pivot,.047);limb('Forearm lower',elbow,wrist,.047,sk,pivot,.036);hand('Hand',wrist,sk,pivot)
  if pose=='phone' and s==1:
   phone=empty('Phone_'+name,tuple(Vector(wrist)+Vector((-.015,-.02,.035))),pivot);phone.rotation_euler.x=-.65;box('Phone body',(0,-.02,0),(.16,.024,.28),shoe,.024,phone);box('Phone display',(0,-.036,0),(.135,.005,.242),glass,.014,phone)
 return actor
def bench(x,y,m=sage):
 box('Bench seat',(x,y,.49),(2.5,.7,.15),wood,.07);box('Upholstery',(x,y,.58),(2.45,.67,.12),m,.055)
 for dx in [-.9,.9]:box('Bench leg',(x+dx,y,.24),(.1,.45,.48),brass,.025)
def tree(x,y,s=1):
 cyl('Tree trunk',(x,y,.9*s),.13*s,1.8*s,wood,.1*s)
 for dx,dy,dz,k in [(-.3,0,2,1),(.32,.1,2.2,.9),(0,-.22,2.55,.95)]:ball('Soft leafy canopy',(x+dx*s,y+dy*s,dz*s),(.73*s*k,.65*s*k,.65*s*k),leafmats[int(abs(dx)*8)%3])
def board(body,x,y,z,w=2.4,m=blue):
 box('Caption panel',(x,y,z),(w,.12,.5),m,.04);text(body,(x,y-.071,z-.053),.15,dark if m==white else cloth)
def phone_exhibit(x,y):
 box('Shared screen',(x,y,2.15),(1.45,.16,2.7),dark,.14);box('Display glass',(x,y-.087,2.15),(1.27,.015,2.45),glass,.09)
 text('AKUN KELAS',(x,y-.101,3.06),.12,cloth);box('Video thumbnail',(x,y-.11,2.63),(1.04,.013,.56),lavender,.04)
 text('VIDEO TANPA IZIN',(x,y-.13,2.62),.092,cloth)
 for j,w in enumerate([.86,.70,.91]):box('Comment bubble',(x-.06,y-.115,2.16-j*.27),(w,.02,.15),paper,.05)
 text('KOMENTAR',(x,y-.137,1.30),.115,cloth);text('BERDAMPAK',(x,y-.137,1.11),.115,cloth)
 cyl('Screen support',(x,y,.4),.055,.8,brass)

rooms=[];centers=[(-7,-6),(7,-6),(-7,6),(7,6)]
for i,(cx,cy) in enumerate(centers):
 room=empty('Story_'+str(i));room.parent=None;rooms.append(room);accent=[blue,coral,sage,grass][i]
 box('Room foundation',(0,0,-.22),(12.4,10.4,.45),stone,.13);box('Story floor',(0,0,.025),(12.1,10.1,.05),stone,.02)
 box('Back wall',(0,4.91,2.15),(12.1,.22,4.3),white,.055);box('Accent wall',(2.8,4.75,2.08),(5.75,.09,4.1),accent,.035)
 box('Side wall',(-6.05,2.6,1.65),(.2,4.75,3.3),white,.045);box('Open side return',(6.05,3.4,.6),(.2,3,1.2),stone,.07)
 for x in [-4,-2,0,2,4]:box('Fine tile join',(x,0,.055),(.009,10,.008),white,0)
 for y in [-3,-1,1,3]:box('Fine tile join',(0,y,.055),(12,.009,.008),white,0)
 text(['01   MEDIA SOSIAL','02   PERUNDUNGAN','03   LALU LINTAS','04   LINGKUNGAN'][i],(2.7,4.65,3.65),.24,cloth)
 # The quiet decision alcove is part of each room, not a detached modal.
 box('Decision desk',(-3.6,.3,.86),(2.6,1.15,.13),wood,.08)
 for x in [-4.65,-2.55]:box('Desk leg',(x,.3,.42),(.12,.9,.84),brass,.035)
 box('Decision folio',(-3.6,.1,.97),(.9,.65,.035),paper,.02);cyl('Decision stool',(-3.6,-1.0,.34),.4,.68,accent);board('RUANG KEPUTUSAN',-3.6,4.70,2.7,3.2,sage)
 plant(-5,2.7,.75)
 if i==0:
  box('Woven gathering rug',(1.6,.25,.067),(5.4,4.4,.024),blue,.15);bench(.3,1.4,lavender);phone_exhibit(3.65,2.25)
  person('Raka',.05,1.13,.04,'sad',cloth,skin2,True);person('Mira',-1.05,.95,-.40,'help',cloth,skin,True)
  person('Dio',2.35,-.25,-.28,'phone',cloth,skin);person('Seno',3.55,-.20,.40,'talk',cloth,skin3)
  board('KATA-KATA PUNYA DAMPAK',.1,4.66,2.75,3.5,lavender);plant(5,3.6,.8)
 elif i==1:
  # School corridor, a worried pupil and a reachable counselling room.
  box('Counselling door',(-.8,4.66,1.38),(1.4,.13,2.7),wood,.065);box('Door glazing',(-.8,4.575,1.73),(.90,.028,1.35),blue,.035);ball('Door handle',(-.27,4.56,1.18),(.045,.04,.045),brass);board('GURU BK',-.8,4.56,3.08,1.6,sage)
  for j in range(4):
   x=2+j*.72;box('School locker',(x,4.4,1.25),(.67,.55,2.5),[blue,lavender,sage,coral][j],.05);box('Locker handle',(x+.20,4.105,1.3),(.045,.04,.24),brass,.02)
  person('Ari',.4,.5,.05,'sad',cloth,skin2);person('Bima',1.7,.8,-.9,'talk',cloth,skin3);person('Reno',3.1,1.2,-.65,'stand',cloth,skin)
  person('Nadia',-.5,-.35,.25,'help',sage,skin);person('Guru',-1.30,2.70,.06,'help',wood,skin2,False,True);bench(4,-1.5,blue)
  board('AMAN UNTUK BERCERITA',2.9,4.02,3.0,3.2,white)
 elif i==2:
  box('Road area',(1.55,-1.1,.087),(7.6,3.6,.065),road,.10)
  for j in range(7):box('Zebra crossing',(3.6,-2.65+j*.48,.125),(2.2,.23,.017),paper,.015)
  box('Pavement',(1.6,2,.14),(8.2,2.1,.23),white,.05)
  board('SEKOLAH',2.7,4.60,2.9,3.7,blue);box('Safe transport sign',(-.3,3.9,1.4),(.12,.12,2.8),brass,.02);board('ANTAR-JEMPUT',-.3,3.9,2.65,2.1,sage)
  # Parked motorcycle: the scene does not glamorise unsafe riding.
  for yy in [-.65,.65]:
   o=cyl('Motorcycle tire',(1,yy,.43),.39,.14,shoe);o.rotation_euler.y=pi/2;o=cyl('Wheel rim',(1.08,yy,.43),.26,.15,brass);o.rotation_euler.y=pi/2
  tube('Bike frame',[(1,-.65,.48),(1,-.35,1.00),(1,.48,.83),(1,.65,.44)],.065,dark);box('Motorcycle body',(1,.08,.80),(.40,.8,.38),blue,.14);box('Motorcycle seat',(1,.3,1.05),(.38,.63,.13),shoe,.06);tube('Handlebar',[(.6,-.54,1.21),(1,-.55,1.25),(1.4,-.54,1.21)],.04,brass);ball('Headlight',(1,-.71,1.04),(.15,.08,.13),paper)
  person('Siswa',2.05,-.05,-.20,'phone',cloth,skin);person('Ibu',4,2.4,-.5,'help',coral,skin2,False,True)
  box('Transport van',(2.65,3.4,.77),(2.35,1.05,1.3),sage,.20);box('Van windows',(2.65,2.86,1.02),(1.93,.025,.51),blue,.055)
  for x in [1.95,3.35]:o=cyl('Van wheel',(x,2.98,.29),.28,.14,shoe);o.rotation_euler.x=pi/2
  bench(4.5,.1,coral);ball('Safety helmet',(4.2,.1,.85),(.23,.26,.22),blue);box('Helmet visor',(4.2,-.126,.84),(.31,.025,.12),glass,.055)
 elif i==3:
  box('Living landscape',(1,1,.20),(8.6,6.8,.29),grass,.18);box('Hillside',(2.2,3,.5),(5.7,2.5,.6),grass,.4)
  for x,y,sc in [(0,3,1),(1.4,3.4,.88),(4.5,3.3,1.12),(-2,2.9,.9)]:tree(x,y,sc)
  for x,y in [(2.6,2.5),(3.6,2.4),(4,1.6)]:cyl('Tree stump',(x,y,.57),.25,.55,wood,.22);cyl('Cut trunk rings',(x,y,.86),.205,.016,paper)
  # One river connects upstream land and downstream houses.
  tube('Connected river',[(-1.3,3.2,.41),(-.8,1.7,.41),(.4,.7,.37),(.6,-.7,.37),(2,-1.8,.36),(3.9,-2.1,.36)],.22,water)
  for x in [3.2,4.0,4.8]:
   box('Downstream home',(x,-1.55,.61),(.65,.76,.85),paper,.05);bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=.6,radius2=0,depth=.45,location=(x,-1.55,1.23),rotation=(0,0,pi/4));finish(bpy.context.object,'Roof',coral);box('House window',(x,-1.945,.70),(.27,.02,.28),blue,.02)
  for x in [2.5,3.2,3.9]:
   for y in [.2,.8]:ball('Crop foliage',(x,y,.42),(.2,.17,.19),leafmats[0])
  person('Warga',-.30,-1.35,-.25,'talk',blue,skin2);person('Petani',1.8,1.4,.20,'stand',wood,skin3,False,True);person('Teman',-1.45,-.7,-.25,'help',cloth,skin)
  board('HULU',-.35,4.63,2.8,1.45,sage);board('HILIR',4.5,-2.85,.65,1.3,blue)
 room.location=(cx,cy,0)

room=None;box('Studio floor',(0,0,-.58),(160,160,.22),white,.03)
def area(name,loc,power,size,col,target):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=col;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for cx,cy in centers:area('Soft daylight',(cx-3,cy-2,10),1650,7,(1,.92,.82),(cx,cy,0));area('Window fill',(cx+5,cy-4,7),950,6,(.84,.94,1),(cx,cy+1,1))
d=bpy.data.lights.new('Sun','SUN');d.energy=1.4;d.angle=.20;o=bpy.data.objects.new('Sun',d);bpy.context.collection.objects.link(o);o.rotation_euler=(.5,-.35,-.6)
camd=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',camd);bpy.context.collection.objects.link(cam);scene.camera=cam;camd.clip_end=300
def aim(eye,target,lens):cam.location=eye;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();camd.lens=lens
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.data.objects):
 if o.type in {'CURVE','FONT'}:
  bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
for o in bpy.data.objects:
 if o.type not in {'LIGHT','CAMERA'}:o.select_set(True)
import sys
if '--model-only' in sys.argv:
 os.makedirs(os.path.join(ROOT,'.sites-runtime'),exist_ok=True)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'.sites-runtime/choices.blend'));os._exit(0)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'choices.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'.sites-runtime/choices.blend'))
aim((26,-34,28),(0,0,-.5),34);scene.render.filepath=os.path.join(OUT,'preview.jpg');bpy.ops.render.render(write_still=True)
for i,(cx,cy) in enumerate(centers):
 for j,r in enumerate(rooms):
  for o in [r]+list(r.children_recursive):o.hide_render=j!=i
 for phase in ['scene','decision']:
  aim((cx+(8 if phase=='scene' else 6),cy-(13 if phase=='scene' else 10.7),6.8 if phase=='scene' else 4.6),(cx+.6,cy+.3,1.1),34)
  scene.render.resolution_x=1440;scene.render.resolution_y=1000;camd.sensor_fit='AUTO';scene.render.filepath=os.path.join(OUT,f'{i}-{phase}.jpg');bpy.ops.render.render(write_still=True)
  scene.render.resolution_x=750;scene.render.resolution_y=1334;camd.sensor_fit='VERTICAL';camd.sensor_height=24
  aim((cx+8,cy-20,8.5),(cx+1,cy+.5,-1.2),26);scene.render.filepath=os.path.join(OUT,f'{i}-{phase}-mobile.jpg');bpy.ops.render.render(write_still=True)
print('STORY_ASSETS_COMPLETE',flush=True)
os._exit(0)
