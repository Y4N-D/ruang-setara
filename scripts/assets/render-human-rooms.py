"""Render matching overview, cube panoramas and looping character motion."""
import bpy,math,os,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/stories'
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/human-rooms.blend'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=5;scene.cycles.use_denoising=True;scene.cycles.max_bounces=3
scene.render.use_persistent_data=True;scene.render.threads_mode='FIXED';scene.render.threads=8;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
camera=scene.camera;camera.data.type='PERSP';camera.data.sensor_fit='HORIZONTAL';camera.data.sensor_width=36
selected=next((int(a.split('=')[1]) for a in sys.argv if a.startswith('--room=')),None)
movies_only='--movies-only' in sys.argv;stills_only='--stills-only' in sys.argv
rooms=[bpy.data.objects['Story_'+str(i)] for i in range(4)]
def aim(eye,target,lens):
 camera.location=eye;camera.rotation_euler=(Vector(target)-Vector(eye)).to_track_quat('-Z','Y').to_euler();camera.data.lens=lens
def render(path,w,h):
 scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
if not movies_only and '--no-preview' not in sys.argv and selected in [None,0]:
 scene.frame_set(1);mods=[];ceilings=[]
 for o in scene.objects:
  for m in o.modifiers:
   if m.type=='SUBSURF':mods.append((m,m.render_levels));m.render_levels=0
  if o.name.startswith(('Ceiling edge','Ceiling rib')):ceilings.append((o,o.hide_render));o.hide_render=True
 aim((36,-43,33),(0,0,0),33);render(OUT/'preview.jpg',1440,1000)
 for m,l in mods:m.render_levels=l
 for o,h in ceilings:o.hide_render=h
 if '--preview-only' in sys.argv:print('PREVIEW_COMPLETE',flush=True);os._exit(0)
for i in ([selected] if selected is not None else range(4)):
 if selected is not None:
  for j,room in enumerate(rooms):
   if j!=i:
    for o in list(room.children_recursive):bpy.data.objects.remove(o,do_unlink=True)
  bpy.data.orphans_purge(do_recursive=True)
 for j,room in enumerate(rooms):
  for o in room.children_recursive:o.hide_render=j!=i
 cx=[-21,-7,7,21][i];eye=Vector((cx,-3.3,2.2));scene.frame_set(1)
 if not movies_only:
  for face,delta in [('px',(1,0,0)),('nx',(-1,0,0)),('py',(0,0,1)),('ny',(0,0,-1)),('pz',(0,-1,0)),('nz',(0,1,0))]:
   aim(eye,eye+Vector(delta),18)
   if face=='py':camera.rotation_euler=(0,math.pi,math.pi)
   if face=='ny':camera.rotation_euler=(0,0,0)
   render(OUT/f'{i}-cube-{face}.jpg',1024,1024)
  for label,target,fov in [('scene',(cx,0,2.2),68),('decision',(cx+6,-3.3,2.2),58)]:
   aim(eye,target,36/(2*math.tan(math.radians(fov)/2)*1.44));render(OUT/f'{i}-{label}.jpg',1440,1000)
 if not stills_only:
  dest=ROOT/f'.sites-runtime/motion-{i}';dest.mkdir(parents=True,exist_ok=True);aim(eye,eye+Vector((0,1,0)),18)
  for n,f in enumerate(range(1,98,4)):scene.frame_set(f);render(dest/f'{n:03}.jpg',1024,1024)
 print('ROOM_RENDER_COMPLETE',i,flush=True)
os._exit(0)
