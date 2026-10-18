"""Turn the existing story sets into connected interiors and render CPU panoramas.
The six panorama faces use the same eye position as the live Three.js tour.
Then run optimize-choices.py .sites-runtime/wall-rooms.blend and compress-choices.mjs.
"""
import bpy, os, math, random, sys
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/stories'
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/choices.blend'))
scene=bpy.context.scene
base=(Path(__file__).with_name('build-gallery.py')).read_text()
stone=bpy.data.materials['Ivory limestone'];white=bpy.data.materials['Chalk plaster'];blue=bpy.data.materials['Powder blue glaze'];sage=bpy.data.materials['Celadon ceramic'];coral=bpy.data.materials['Soft terracotta'];lavender=bpy.data.materials['Periwinkle plaster'];brass=bpy.data.materials['Satin brass'];dark=bpy.data.materials['Ink enamel'];wood=bpy.data.materials['Natural oak'];paper=bpy.data.materials['Warm paper'];cloth=bpy.data.materials['School white cotton'];leafmats=[bpy.data.materials['Leaf '+str(i)] for i in range(3)]
exec(base[base.index('def finish('):base.index('rooms=[];accents=')])
rooms=[bpy.data.objects['Story_'+str(i)] for i in range(4)]
ceilings=[]
for i,room in enumerate(rooms):
 room.location=(i*14-21,0,0)
 for o in list(room.children_recursive):
  n=o.name.split('.')[0]
  if n in ['Back wall','Accent wall','Side wall','Open side return','Room foundation','Story floor','Decision desk','Decision folio','Decision stool','Desk leg','RUANG KEPUTUSAN'] or (n=='Caption panel' and o.location.x < -3):
   bpy.data.objects.remove(o,do_unlink=True)
 accent=[blue,coral,sage,bpy.data.materials['Meadow']][i]
 box('Interior foundation',(0,-.6,-.22),(12.4,11.6,.45),stone,.1)
 box('Interior floor',(0,-.6,.025),(12.1,11.5,.06),stone,.025)
 box('Story wall',(0,4.91,2.65),(12.1,.22,5.3),white,.055)
 box('Story accent',(2.8,4.75,2.45),(5.7,.09,4.9),accent,.035)
 box('Context frame',(-3.45,4.72,2.5),(4.15,.16,3.72),wood,.04)
 box('Context paper',(-3.45,4.61,2.5),(3.98,.045,3.56),paper,.025)
 # Side walls share doors at the rear; the camera traverses their open space.
 for x in [-6.06,6.06]:
  box('Side wall front',(x,-2.2,2.65),(.22,8.4,5.3),white,.035)
  box('Side wall rear',(x,4.67,2.65),(.22,.7,5.3),white,.035)
  box('Door lintel',(x,3.17,4.25),(.22,2.3,2.1),white,.04)
  for yy in [2.04,4.30]:box('Door jamb',(x,yy,1.60),(.30,.12,3.2),wood,.025)
  box('Door header',(x,3.17,3.23),(.30,2.4,.14),wood,.025)
 # This is on the adjacent (right) wall, perpendicular to the story wall.
 box('Question surround',(5.88,-3.3,2.42),(.14,5.12,4.2),wood,.04)
 box('Question plaster',(5.79,-3.3,2.42),(.035,4.96,4.05),paper,.035)
 box('Question shelf',(5.44,-3.3,.38),(.75,5.1,.15),wood,.055)
 for yy in [-5.1,-1.5]:box('Reading stool',(4.65,yy,.34),(.7,.7,.65),accent,.13)
 # A high clerestory and soft ceiling make the viewpoint feel inside a room.
 for x in [-5.9,5.9]:ceilings.append(box('Ceiling edge',(x,-.6,5.33),(.42,11.6,.20),white,.06))
 for y in [-6.18,4.85]:ceilings.append(box('Ceiling edge',(0,y,5.33),(12.2,.42,.20),white,.06))
 for x in [-4.6,-1.6,1.6,4.6]:ceilings.append(box('Ceiling rib',(x,-.6,5.5),(.12,11.6,.16),wood,.035))
 # Visible front return, with broad daylight openings, keeps all panoramas coherent.
 box('Front sill',(0,-6.25,.54),(12.2,.25,1.08),white,.05)
 box('Front header',(0,-6.25,4.83),(12.2,.25,1.1),white,.05)
 for x in [-6,-2,2,6]:box('Window pier',(x,-6.25,2.7),(.19,.25,3.6),white,.03)
 for x in [-4,0,4]:box('Window crossbar',(x,-6.22,2.7),(3.85,.10,.06),wood,.02)
 if i==0:bpy.data.objects['Actor_Seno'].location=(3.3,1.4,.07)
 if i==3:
  for name in ['Actor_Warga','Actor_Teman']:bpy.data.objects[name].location.y+=.8
 # Lighting is local to each room instead of the former two-by-two model.
 for name,loc,power,col in [('Interior daylight',(-2,-2,7),1450,(1,.94,.85)),('Interior fill',(4,-4,4),550,(.83,.93,1))]:
  d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=5;d.color=col;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=Vector(room.location)+Vector(loc);o.rotation_euler=(Vector(room.location)+Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
room=None
for i in range(3):
 x=i*14-14
 box('Connecting passage floor',(x,3.17,.025),(2.0,2.30,.06),stone,.025)
 for y in [2.04,4.30]:box('Connecting passage wall',(x,y,2.1),(2.0,.15,4.2),white,.03)
 box('Connecting passage ceiling',(x,3.17,3.65),(2.0,2.3,.15),white,.04)
# Remove the old lamps rather than doubling the light levels.
for o in list(bpy.data.objects):
 if o.type=='LIGHT' and (o.name.startswith('Soft daylight') or o.name.startswith('Window fill')):bpy.data.objects.remove(o,do_unlink=True)
scene.cycles.samples=10;scene.cycles.use_denoising=True;scene.cycles.max_bounces=4
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=86
cam=scene.camera;camd=cam.data;camd.type='PERSP';camd.sensor_fit='HORIZONTAL';camd.sensor_width=36
def aim(eye,target,lens):
 cam.location=eye;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();camd.lens=lens
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.sites-runtime/wall-rooms.blend'))
# Export a fresh optimized GLB later; keep this editable scene as its source.
if '--model-only' in sys.argv:os._exit(0)
scene.render.resolution_x=1440;scene.render.resolution_y=1000
for o in ceilings:o.hide_render=True
aim((36,-43,33),(0,0,0),33)
scene.render.filepath=str(OUT/'preview.jpg');bpy.ops.render.render(write_still=True)
for o in ceilings:o.hide_render=False
faces=[('px',(1,0,0)),('nx',(-1,0,0)),('py',(0,0,1)),('ny',(0,0,-1)),('pz',(0,-1,0)),('nz',(0,1,0))]
for i,room in enumerate(rooms):
 if '--only-room=0' in sys.argv and i!=0:continue
 cx=room.location.x;eye=Vector((cx,-3.3,2.2))
 scene.render.resolution_x=1024;scene.render.resolution_y=1024;camd.sensor_fit='HORIZONTAL'
 for name,direction in faces:
  aim(eye,eye+Vector(direction),18)
  # The up/down CSS cube faces use an explicit roll to match their seams.
  if name=='py':cam.rotation_euler=(0,pi,pi)
  if name=='ny':cam.rotation_euler=(0,0,0)
  scene.render.filepath=str(OUT/f'{i}-cube-{name}.jpg');bpy.ops.render.render(write_still=True)
 scene.render.resolution_x=1440;scene.render.resolution_y=1000
 aim(eye,(cx,0,2.2),36/(2*math.tan(math.radians(68)/2)*1.44));scene.render.filepath=str(OUT/f'{i}-scene.jpg');bpy.ops.render.render(write_still=True)
 aim(eye,(cx+6,-3.3,2.2),36/(2*math.tan(math.radians(58)/2)*1.44));scene.render.filepath=str(OUT/f'{i}-decision.jpg');bpy.ops.render.render(write_still=True)
print('WALL_ROOM_ASSETS_COMPLETE',flush=True)
os._exit(0)
