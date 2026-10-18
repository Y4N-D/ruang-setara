"""Fourteen skinned humans built from MakeHuman CC0 graphical data, Blender 4.2."""
import bpy,json,math,os,re,sys
from pathlib import Path
from collections import defaultdict
from mathutils import Vector,Matrix,Quaternion
ROOT=Path(__file__).resolve().parents[2];SRC=Path(__file__).with_name('human-source')
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/wall-rooms.blend'))
scene=bpy.context.scene
for obj in bpy.data.objects['Story_0'].children_recursive:
 if obj.name.startswith(('Bench seat','Upholstery')):obj.location.z-=.12
 elif obj.name.startswith('Bench leg'):obj.location.z-=.06;obj.scale.z*=.75
for obj in [o for o in bpy.data.objects if o.name.startswith('Actor_')]:
 for child in list(obj.children_recursive):bpy.data.objects.remove(child,do_unlink=True)
 bpy.data.objects.remove(obj,do_unlink=True)
def read_obj(path):
 verts=[];uv=[];faces=[];groups=[];group=''
 for line in path.read_text().splitlines():
  s=line.split()
  if not s:continue
  if s[0]=='v':verts.append(Vector(map(float,s[1:4])))
  elif s[0]=='vt':uv.append(tuple(map(float,s[1:3])))
  elif s[0]=='g':group=s[1]
  elif s[0]=='f':faces.append([(int(v.split('/')[0])-1,int(v.split('/')[1])-1 if '/' in v and v.split('/')[1] else 0) for v in s[1:]]);groups.append(group)
 return verts,uv,faces,groups
base,base_uv,base_faces,base_groups=read_obj(SRC/'base.obj')
skel=json.loads((SRC/'default.mhskel').read_text());weights=json.loads((SRC/'default_weights.mhw').read_text())['weights'];base_weights=[{} for v in base]
for bone,entries in weights.items():
 for idx,w in entries:base_weights[idx][bone]=w
def material(name,color,rough=.7,texture=None,alpha=False,skin=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=.27
 if texture:
  t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(texture),check_existing=True)
  if skin:
   mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.7;mix.inputs[2].default_value=(.73,.53,.38,1);m.node_tree.links.new(t.outputs['Color'],mix.inputs[1]);m.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])
  else:m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
  if alpha:m.node_tree.links.new(t.outputs['Alpha'],p.inputs['Alpha']);m.surface_render_method='DITHERED';m.use_backface_culling=False
 if skin:p.inputs['Subsurface Weight'].default_value=.065;p.inputs['Subsurface Radius'].default_value=(1,.42,.24)
 return m
def texture_for(folder):
 for l in next(folder.glob('*.mhmat')).read_text().splitlines():
  if l.startswith('diffuseTexture '):return folder/l.split(None,1)[1]
skins={sex:material('Natural skin '+sex,(.7,.45,.3),.59,texture_for(SRC/f'skins/young_asian_{sex}'),skin=True) for sex in ['male','female']}
shirts={n:material('Tailored cotton '+n,c,.88) for n,c in {'school':(.82,.85,.81),'sage':(.33,.50,.41),'blue':(.24,.40,.57),'ochre':(.57,.40,.20),'coral':(.64,.34,.28)}.items()}
normal=bpy.data.images.load(str(SRC/'clothes/male_casualsuit01/male_casualsuit01_normal.png'),check_existing=True);normal.colorspace_settings.name='Non-Color'
for m in shirts.values():
 t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=normal;n=m.node_tree.nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=.38;m.node_tree.links.new(t.outputs['Color'],n.inputs['Color']);m.node_tree.links.new(n.outputs['Normal'],m.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
pants=material('Navy woven trousers',(.038,.060,.090),.94);shoes=material('Soft black shoes',(.022,.028,.028),.85)
eyes=material('Natural brown eyes',(1,1,1),.38,SRC/'eyes/materials/brown_eye.png')
hair={h:material('Hair '+h,(.025,.019,.016),.7,texture_for(SRC/f'hair/{h}'),True) for h in ['short01','short04','ponytail01']}
brows=material('Natural eyebrows',(1,1,1),.85,texture_for(SRC/'eyebrows/eyebrow003'),True)
phone_mat=material('Graphite phone case',(.018,.026,.032),.4);screen_mat=material('Phone glass',(.16,.31,.40),.24)
def update():bpy.context.view_layer.update()
def proxy_data(folder,coords):
 lines=next(folder.glob('*.mhclo')).read_text().splitlines();scale=[1.,1.,1.];references=[];deleted=set();mode=''
 for l in lines:
  s=l.split()
  if not s or s[0].startswith('#'):continue
  if s[0] in ['x_scale','y_scale','z_scale']:
   axis='xyz'.index(s[0][0]);scale[axis]=abs(coords[int(s[1])][axis]-coords[int(s[2])][axis])/float(s[3])
  elif s[0]=='obj_file':obj=folder/s[1]
  elif s[0]=='verts':mode='verts'
  elif s[0]=='delete_verts':mode='delete'
  elif s[0][0].isalpha():continue
  elif mode=='verts':references.append(s)
  elif mode=='delete':
   for match in re.finditer(r'(\d+)(?:\s*-\s*(\d+))?',l):
    a=int(match[1]);b=int(match[2] or a);deleted.update(range(a,b+1))
 points=[];vw=[]
 for s in references:
  if len(s)==1:ids=[int(s[0])];mix=[1.];offset=Vector((0,0,0))
  else:ids=list(map(int,s[:3]));mix=list(map(float,s[3:6]));offset=Vector([float(s[6+i])*scale[i] for i in range(3)])
  points.append(sum((coords[idx]*w for idx,w in zip(ids,mix)),Vector())+offset);wts=defaultdict(float)
  for idx,w in zip(ids,mix):
   for b,v in base_weights[idx].items():wts[b]+=w*v
  vw.append(wts)
 _,uv,faces,groups=read_obj(obj)
 return points,uv,faces,vw,deleted
def mesh(name,points,uv,faces,vw,rig,convert,mats,clothes=False):
 used=sorted({v for f in faces for v,t in f});remap={v:i for i,v in enumerate(used)};data=bpy.data.meshes.new(name);data.from_pydata([convert(points[v]) for v in used],[],[[remap[v] for v,t in f] for f in faces]);data.update()
 obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.parent=rig
 for m in mats:data.materials.append(m)
 layer=data.uv_layers.new(name='UVMap')
 for poly,f in zip(data.polygons,faces):
  poly.use_smooth=True
  if clothes:
   u=sum(uv[t][0] for v,t in f)/len(f);v=sum(uv[t][1] for v,t in f)/len(f);poly.material_index=1 if .35<u<.715 else 2 if u<.34 and v>.69 else 0
  for loop,(v,t) in zip(poly.loop_indices,f):layer.data[loop].uv=uv[t]
 by_bone=defaultdict(list)
 for old in used:
  values={b:max(0,w) for b,w in vw[old].items() if w>1e-5};total=sum(values.values())
  for b,w in values.items():by_bone[b].append((remap[old],w/total))
 for b,entries in by_bone.items():
  vg=obj.vertex_groups.new(name=b)
  for idx,w in entries:vg.add([idx],w,'REPLACE')
 mod=obj.modifiers.new('Anatomical deformation','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=True
 sub=obj.modifiers.new('Smooth skin and fabric','SUBSURF');sub.levels=sub.render_levels=1
 return obj
def make_actor(name,room,x,y,yaw,pose,sex,adult,shirt,height):
 coords=[v.copy() for v in base]
 for age,factor in [('young',1. if adult else .78),('child',0. if adult else .22)]:
  for l in (SRC/f'asian-{sex}-{age}.target').read_text().splitlines():
   s=l.split()
   if s and not s[0].startswith('#'):coords[int(s[0])]+=Vector(map(float,s[1:4]))*factor
 body_indices={v for f,g in zip(base_faces,base_groups) if g=='body' for v,t in f};low=min(coords[i].y for i in body_indices);scale=height/(max(coords[i].y for i in body_indices)-low)
 def convert(v):return Vector((v.x*scale,-v.z*scale,(v.y-low)*scale))
 ground=.355 if room==3 else .265 if name=='Ibu' else .13 if room==2 else .07
 actor=bpy.data.objects.new('Actor_'+name,None);bpy.context.collection.objects.link(actor);actor.parent=bpy.data.objects['Story_'+str(room)];actor.location=(x,y,ground);actor.rotation_euler.z=yaw
 data=bpy.data.armatures.new('Skeleton_'+name);rig=bpy.data.objects.new('Rig_'+name,data);bpy.context.collection.objects.link(rig);rig.parent=actor;bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 joints={j:convert(sum((coords[i] for i in ids),Vector())/len(ids)) for j,ids in skel['joints'].items()}
 for b,info in skel['bones'].items():
  bone=data.edit_bones.new(b);bone.head=joints[info['head']];bone.tail=joints[info['tail']];plane=skel['planes'].get(info['rotation_plane'])
  if plane:
   a,c,d=(joints[j] for j in plane);normal=(c-a).cross(d-a)
   if normal.length>1e-8:bone.align_roll(normal)
 for b,info in skel['bones'].items():
  if info['parent']:data.edit_bones[b].parent=data.edit_bones[info['parent']]
 bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
 suit=proxy_data(SRC/'clothes/male_casualsuit01',coords);shoe=proxy_data(SRC/'clothes/shoes01',coords);hidden=suit[4]|shoe[4];faces=[f for f,g in zip(base_faces,base_groups) if g=='body' and not all(v in hidden for v,t in f)]
 mesh('Body_'+name,coords,base_uv,faces,base_weights,rig,convert,[skins[sex]])
 mesh('Clothes_'+name,*suit[:4],rig,convert,[shirts[shirt],pants,shoes],True);mesh('Shoes_'+name,*shoe[:4],rig,convert,[shoes])
 haircut='ponytail01' if sex=='female' else ('short04' if name in ['Seno','Guru','Petani','Siswa'] else 'short01')
 for label,folder,mat in [('Hair',f'hair/{haircut}',hair[haircut]),('Eyes','eyes/high-poly',eyes),('Eyebrows','eyebrows/eyebrow003',brows)]:
  p=proxy_data(SRC/folder,coords);mesh(label+'_'+name,*p[:4],rig,convert,[mat])
 update();pb=rig.pose.bones
 def turn(b,vector):
  update();bone=pb[b];end={'upperarm01':'lowerarm01','lowerarm01':'wrist','upperleg01':'lowerleg01','lowerleg01':'foot'};stem,side=b.rsplit('.',1);tail=pb[end[stem]+'.'+side].head if stem in end else bone.tail
  q=(tail-bone.head).rotation_difference(Vector(vector));matrix=q.to_matrix().to_4x4()@bone.matrix;matrix.translation=bone.head;bone.matrix=matrix;update()
 def local(b,axis,angle):pb[b].rotation_mode='QUATERNION';pb[b].rotation_quaternion=pb[b].rotation_quaternion@Quaternion(Vector(axis),angle);update()
 def world(b,axis,angle):
  p=pb[b];m=Quaternion(Vector(axis),angle).to_matrix().to_4x4()@p.matrix;m.translation=p.head;p.matrix=m;update()
 for side,sign in [('L',1),('R',-1)]:
  up=(pb['lowerarm01.'+side].head-pb['upperarm01.'+side].head).length;leg=(pb['lowerleg01.'+side].head-pb['upperleg01.'+side].head).length
  turn('upperleg01.'+side,(sign*.018,-.028,-leg));turn('lowerleg01.'+side,(sign*.005,.008,-.42));local('foot.'+side,(0,1,0),sign*.07)
  u=(sign*.04,-.02,-up);f=(sign*.018,-.055,-.26)
  if pose=='phone' and side=='R':u=(sign*.06,-.025,-up);f=(.065,-.22,.105)
  elif pose in ['help','talk'] and side=='R':u=(-.10,-.06,-up);f=(-.045,-.24,.045)
  elif pose=='sad':u=(sign*.025,-.06,-up);f=(-sign*.04,-.11,-.21)
  turn('upperarm01.'+side,u);turn('lowerarm01.'+side,f);turn('wrist.'+side,Vector(f).normalized()*.12)
  for digit in range(1,6):
   for part in range(1,4):local(f'finger{digit}-{part}.{side}',(1,0,0),.12 if part==1 else .19)
 if pose=='phone':
  update();p=pb['wrist.R'];u=pb['finger2-1.R'].head-pb['finger5-1.R'].head;f=pb['finger3-1.R'].head-p.head;f.normalize();u=(u-f*u.dot(f)).normalized();n=u.cross(f);tf=Vector((1,-.12,.08)).normalized();tu=(Vector((0,0,1))-tf*tf.z).normalized();tn=tu.cross(tf)
  q=Matrix((tu,tf,tn)).transposed()@Matrix((u,f,n)).transposed().inverted();m=q.to_4x4()@p.matrix;m.translation=p.head;p.matrix=m;update()
  for digit in range(2,6):
   for part,angle in enumerate([-.15,-1.,-.65],1):world(f'finger{digit}-{part}.R',(0,0,1),angle)
  for part in range(1,4):local(f'finger1-{part}.R',(1,0,0),.25)
 if pose=='sad':local('neck01',(1,0,0),.14);local('head',(0,0,1),-.06)
 elif pose=='phone':local('neck01',(1,0,0),.09);local('head',(1,0,0),.1)
 else:local('head',(0,0,1),-.13 if name in ['Mira','Nadia'] else .11)
 standing={p.name:list(p.rotation_quaternion) for p in pb}
 if name in ['Raka','Mira']:
  for side,sign in [('L',1),('R',-1)]:
   turn('upperleg01.'+side,(sign*.015,-.42,-.04));turn('lowerleg01.'+side,(sign*.006,-.02,-.40))
   if name=='Raka':turn('upperarm01.'+side,(sign*.04,-.1,-.26));turn('lowerarm01.'+side,(-sign*.06,-.2,-.15))
  actor.location.z=.60-pb['pelvis.L'].head.z
 if pose=='phone':
  update();center=(pb['finger3-1.R'].head+pb['finger4-1.R'].head)/2+Vector((.020,-.018,.026));bpy.ops.mesh.primitive_cube_add(size=1,location=center);phone=bpy.context.object;phone.name='Handset_'+name;phone.dimensions=(.073,.011,.147);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);phone.rotation_euler=(.06,0,0);phone.data.materials.append(phone_mat);mod=phone.modifiers.new('Rounded handset','BEVEL');mod.width=.008;mod.segments=4
  update();matrix=phone.matrix_world.copy();phone.parent=rig;phone.parent_type='BONE';phone.parent_bone='wrist.R';update();phone.matrix_world=actor.matrix_world@matrix
  bpy.ops.mesh.primitive_cube_add(size=1);screen=bpy.context.object;screen.name='Screen_'+name;screen.parent=phone;screen.location=(0,-.006,0);screen.dimensions=(.06,.002,.126);screen.data.materials.append(screen_mat);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 rig['standing_pose']=json.dumps(standing);rig['seated_pose']=json.dumps({p.name:list(p.rotation_quaternion) for p in pb});rig['seat_z']=actor.location.z;rig['ground_z']=ground;rig['gesture']=pose
 update();rest={p.name:p.rotation_quaternion.copy() for p in pb};scene.render.fps=24;scene.frame_start=1;scene.frame_end=97
 for frame in ([] if '--staged' in sys.argv else range(1,98,4)):
  cycle=(frame-1)/96*math.tau
  for p in pb:p.rotation_mode='QUATERNION';p.rotation_quaternion=rest[p.name]
  def animate(b,axis,angle):pb[b].rotation_quaternion=rest[b]@Quaternion(Vector(axis),angle)
  animate('spine02',(0,0,1),.018*math.sin(cycle));animate('neck01',(1,0,0),.025*math.sin(cycle+.4));animate('head',(0,1,0),.055*math.sin(cycle));pb['head'].rotation_quaternion@=Quaternion((1,0,0),.03*math.sin(2*cycle))
  if pose in ['help','talk']:animate('lowerarm01.R',(1,0,0),.095*math.sin(cycle));animate('wrist.R',(0,1,0),.08*math.sin(cycle+.5));animate('jaw',(1,0,0),.026*(1-math.cos(4*cycle)))
  if pose=='phone':animate('lowerarm01.R',(1,0,0),.045*math.sin(cycle));animate('finger1-2.R',(1,0,0),.12*(.5+.5*math.sin(3*cycle)))
  pb['spine01'].scale=(1+.009*math.sin(cycle),1+.008*math.sin(cycle),1)
  for p in pb:p.keyframe_insert('rotation_quaternion',frame=frame)
  pb['spine01'].keyframe_insert('scale',frame=frame)
 if rig.animation_data and rig.animation_data.action:rig.animation_data.action.name='Life_'+name
 for b in data.bones:b.name=name+'__'+b.name
 scene.frame_set(1);update();print('BUILT',name,len(rig.data.bones),flush=True)
cast=[('Raka',0,.05,1.13,.04,'sad','male',False,'school',1.71),('Mira',0,-.60,1.23,-.4,'help','female',False,'school',1.66),('Dio',0,2.35,-.25,-.28,'phone','male',False,'school',1.75),('Seno',0,3.3,1.4,.4,'talk','male',False,'school',1.76),('Ari',1,.4,.5,.05,'sad','male',False,'school',1.66),('Bima',1,1.7,.8,-.9,'talk','male',False,'school',1.79),('Reno',1,3.1,1.2,-.65,'idle','male',False,'school',1.72),('Nadia',1,-.5,-.35,.25,'help','female',False,'sage',1.69),('Guru',1,-1.3,2.7,.06,'help','male',True,'ochre',1.83),('Siswa',2,2.05,-.05,-.20,'phone','male',False,'school',1.74),('Ibu',2,4,2.4,-.5,'help','female',True,'coral',1.77),('Warga',3,-.3,-.55,-.25,'talk','male',True,'blue',1.76),('Petani',3,1.8,1.4,.20,'idle','male',True,'ochre',1.80),('Teman',3,-1.45,.1,-.25,'help','female',True,'school',1.71)]
for c in cast:make_actor(*c)
scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.sites-runtime/human-rooms.blend'));os._exit(0)
