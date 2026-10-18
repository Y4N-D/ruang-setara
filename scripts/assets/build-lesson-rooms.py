"""Create three learning rooms using the existing CC0 anatomical cast.
Input: human-rooms.blend, generated using the steps in STAGED-SCENES.md.
"""
import bpy,json,math,os,random
from pathlib import Path
from mathutils import Vector,Quaternion
from math import sin,cos,pi
ROOT=Path(__file__).resolve().parents[2]
specs=json.loads((ROOT/'app/lesson-choreography.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/human-rooms.blend'))
scene=bpy.context.scene;scene.frame_set(1)
scene['lesson_neutral_pose']=bpy.data.objects['Rig_Reno']['standing_pose']
seated=json.loads(bpy.data.objects['Rig_Raka']['seated_pose']);original=set(bpy.data.objects)
stone=bpy.data.materials['Ivory limestone'];white=bpy.data.materials['Chalk plaster'];blue=bpy.data.materials['Powder blue glaze'];sage=bpy.data.materials['Celadon ceramic'];coral=bpy.data.materials['Soft terracotta'];brass=bpy.data.materials['Satin brass'];dark=bpy.data.materials['Ink enamel'];wood=bpy.data.materials['Natural oak'];paper=bpy.data.materials['Warm paper']
leafmats=[bpy.data.materials['Leaf '+str(i)] for i in range(3)]
base=Path(__file__).with_name('build-gallery.py').read_text();exec(base[base.index('def finish('):base.index('rooms=[];accents=')]);room=None
def copy_tree(source,parent):
 copies={}
 for old in [source,*source.children_recursive]:
  new=old.copy()
  if old.data:new.data=old.data.copy()
  new.animation_data_clear();bpy.context.collection.objects.link(new);copies[old]=new
 for old,new in copies.items():
  new.parent=copies.get(old.parent,parent)
  for mod in new.modifiers:
   if mod.type=='ARMATURE':mod.object=copies.get(mod.object,mod.object)
 return copies[source],copies
def actor(name,spec):
 old=spec['template'];root,mapping=copy_tree(bpy.data.objects['Actor_'+old],room);root.name='Actor_'+name;root.location=(0,0,0);root.rotation_euler=(0,0,0)
 rig=mapping[bpy.data.objects['Rig_'+old]];rig.name='Rig_'+name
 for obj in mapping.values():
  if obj not in [root,rig]:obj.name=obj.name.replace('_'+old,'_'+name).split('.')[0]
 for bone in rig.data.bones:bone.name=name+'__'+bone.name.split('__',1)[1]
 for obj in mapping.values():
  if obj.type=='MESH':
   for group in obj.vertex_groups:
    if '__' in group.name:group.name=name+'__'+group.name.split('__',1)[1]
  if obj.name.startswith('Clothes_'):obj.data.materials[0]=bpy.data.materials['Tailored cotton '+spec['shirt']]
 rig['ground_z']=.07
 if name=='Hasan':
  pose=json.loads(rig['standing_pose'])
  for bone in pose:
   if bone.startswith(('upperleg','lowerleg','foot','toe')):pose[bone]=seated[bone]
  rig['seated_pose']=json.dumps(pose)
  for b in rig.pose.bones:b.rotation_quaternion=pose[b.name.split('__',1)[1]]
  bpy.context.view_layer.update();rig['seat_z']=.59-rig.pose.bones[name+'__pelvis.L'].head.z
 print('LESSON_ACTOR',name,flush=True)
shell=('Interior foundation','Interior floor','Story wall','Story accent','Side wall front','Side wall rear','Door lintel','Door jamb','Door header','Question surround','Question plaster','Question shelf','Reading stool','Ceiling edge','Ceiling rib','Front sill','Front header','Window pier','Window crossbar')
shell_source=[o for o in bpy.data.objects['Story_0'].children if any(o.name.startswith(s) for s in shell)]
def chair(x,y,color):
 box('Cushioned chair seat',(x,y,.58),(.64,.61,.13),color,.08);box('Cushioned chair back',(x,y+.27,.95),(.64,.09,.68),color,.07)
 for dx in [-.25,.25]:
  for dy in [-.23,.23]:cyl('Chair leg',(x+dx,y+dy,.28),.028,.51,wood)
def desk(x,y,w=1.5,d=.68,z=.88):
 box('Oak work surface',(x,y,z),(w,d,.10),wood,.04)
 for dx in [-w/2+.12,w/2-.12]:
  for dy in [-d/2+.1,d/2-.1]:cyl('Desk leg',(x+dx,y+dy,z/2),.035,z-.05,wood)
def book(x,y,z,color,opened=False):
 box('Book cover',(x,y,z),(.38,.29,.035),color,.015);box('Book pages',(x,y,z+.035),(.35,.27,.04),paper,.012)
 if opened:
  for sign in [-1,1]:
   page=box('Open book pages',(x+sign*.095,y,z+.08),(.19,.28,.025),paper,.007);page.rotation_euler.y=sign*.13
 else:box('Book upper cover',(x,y,z+.065),(.38,.29,.018),color,.01)
random.seed(19)
for idx,spec in enumerate(specs):
 number=idx+4;room=bpy.data.objects.new('Story_'+str(number),None);bpy.context.collection.objects.link(room);room.location=(number*14-21,0,0);accent=[blue,coral,sage][idx]
 for old in shell_source:
  new,_=copy_tree(old,room);new.name=old.name.split('.')[0]+' lesson '+str(number)
  if old.name.startswith(('Story accent','Reading stool')):new.data.materials.clear();new.data.materials.append(accent)
 text(['RUANG BELAJAR','RUANG MUSYAWARAH','RUANG SIMULASI HUKUM'][idx],(2.7,4.62,4.08),.23,dark)
 text(['Hak kita. Ruang bersama.','Bicara. Dengarkan. Hargai.','Kenali peran. Hormati proses.'][idx],(2.7,4.60,3.69),.12,dark)
 plant(4.8,3.65,.82);plant(-4.7,3.7,.7)
 if idx==0:
  chair(.35,1.35,blue);desk(.35,.56,1.12,.56,.86);book(.35,.53,.925,blue,True);desk(3.3,3.85,1.8,.65,.9)
  for x in [2.8,3.8]:book(x,3.8,.97,sage)
  cyl('Balance plinth',(-1.1,3.45,.62),.48,1.15,stone);cyl('Balance upright',(-1.1,3.45,1.75),.042,1.2,brass)
  beam=bpy.data.objects.new('LessonBalanceBeam',None);bpy.context.collection.objects.link(beam);beam.parent=room;beam.location=(-1.1,3.45,2.35);box('Balance crossbar',(0,0,0),(1.45,.055,.06),brass,.024,beam)
  for x in [-.6,.6]:tube('Balance chain',[(x,0,0),(x,0,-.47)],.012,brass,beam);sphere('Balance dish',(x,0,-.5),(.31,.24,.05),brass,beam)
  for x,label in [(-1.7,'HAK'),(-.5,'KEWAJIBAN')]:text(label,(x,3.15,1.52),.09,dark)
 elif idx==1:
  desk(2.65,3.25,2.45,.86,.83);book(2.65,3.2,.9,coral,True);box('Book exhibit stand',(-.7,3.6,.72),(.70,.70,1.42),stone,.09);book(-.7,3.6,1.48,coral,True);text('UUD 1945',(-.7,3.23,1.18),.115,dark)
  for x in [1.6,2.7,3.8]:chair(x,3.86,coral)
 else:
  chair(2.55,3.1,sage);desk(2.55,2.35,2.0,.82,.99);desk(1.95,1.55,1.12,.52,.83);book(1.95,1.55,.90,blue);box('Case papers',(2.65,2.35,1.065),(.37,.3,.05),paper,.015);text('SIMULASI PEMBELAJARAN',(2.55,1.91,.84),.11,dark);box('Gavel handle',(3.14,2.25,1.09),(.29,.033,.035),wood,.015);hammer=cyl('Gavel head',(3.27,2.25,1.11),.05,.13,wood);hammer.rotation_euler.x=pi/2
 for name,info in spec['actors'].items():actor(name,info)
 for label,loc,power,col in [('Lesson daylight',(-2,-2,7),1450,(1,.95,.89)),('Lesson fill',(4,-4,4),550,(.86,.94,1))]:
  data=bpy.data.lights.new(label,'AREA');data.energy=power;data.shape='DISK';data.size=5;data.color=col;obj=bpy.data.objects.new(label,data);bpy.context.collection.objects.link(obj);obj.parent=room;obj.location=loc;obj.rotation_euler=(Vector((1.5,1,1))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
for old in original:
 if old.type!='CAMERA':bpy.data.objects.remove(old,do_unlink=True)
bpy.data.orphans_purge(do_recursive=True);scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.sites-runtime/lesson-human-rooms.blend'));print('LESSON_ROOMS_COMPLETE',flush=True);os._exit(0)
