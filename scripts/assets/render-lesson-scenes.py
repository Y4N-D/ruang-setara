"""Render the same staged timeline for browsers without a WebGL context."""
import bpy,json,math,os,sys,time
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/stories';rooms=json.loads((ROOT/'app/lesson-choreography.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/lesson-staged-rooms.blend'))
scene=bpy.context.scene;camera=scene.camera
room=int(next((a.split('=')[1] for a in sys.argv if a.startswith('--room=')),'4'))
scene.render.engine='CYCLES';scene.cycles.samples=2;scene.cycles.use_denoising=True;scene.cycles.max_bounces=3
scene.render.use_persistent_data=True;scene.render.threads_mode='FIXED';scene.render.threads=int(os.environ.get('STORY_RENDER_THREADS','8'));scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
camera.data.type='PERSP';camera.data.sensor_fit='HORIZONTAL';camera.data.sensor_width=36
preview=False
if not preview:
 for i in range(4,7):
  if i!=room:
   for o in list(bpy.data.objects[f'Story_{i}'].children_recursive):bpy.data.objects.remove(o,do_unlink=True)
 bpy.data.orphans_purge(do_recursive=True)
def aim(eye,target,lens):camera.location=eye;camera.rotation_euler=(Vector(target)-Vector(eye)).to_track_quat('-Z','Y').to_euler();camera.data.lens=lens
def render(path,w,h):
 scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
if preview:
 scene.frame_set(1)
 for o in scene.objects:
  for m in o.modifiers:
   if m.type=='SUBSURF':m.render_levels=0
  if o.name.startswith(('Ceiling edge','Ceiling rib')):o.hide_render=True
 aim((36,-43,33),(0,0,0),33);render(OUT/'preview.jpg',1440,1000);os._exit(0)
cx=room*14-21;eye=Vector((cx,-3.3,2.2));scene.frame_set(1)
if '--movies-only' not in sys.argv:
 for o in scene.objects:
  if o.name.startswith(('Ceiling edge','Ceiling rib')):o.hide_render=True
 aim((cx+9,-13,11),(cx,0,0),35);render(OUT/f'{room}-preview.jpg',1440,1000)
 for o in scene.objects:
  if o.name.startswith(('Ceiling edge','Ceiling rib')):o.hide_render=False
 for face,delta in [('px',(1,0,0)),('nx',(-1,0,0)),('py',(0,0,1)),('ny',(0,0,-1)),('pz',(0,-1,0)),('nz',(0,1,0))]:
  if '--front-only' in sys.argv and face!='nz':continue
  aim(eye,eye+Vector(delta),18)
  if face=='py':camera.rotation_euler=(0,math.pi,math.pi)
  if face=='ny':camera.rotation_euler=(0,0,0)
  render(OUT/f'{room}-cube-{face}.jpg',1024,1024)
 aim(eye,(cx,0,2.2),36/(2*math.tan(math.radians(68)/2)*1.44));render(OUT/f'{room}-scene.jpg',1440,1000)
if '--stills-only' not in sys.argv:
 aim(eye,eye+Vector((0,1,0)),18);dest=ROOT/f'.sites-runtime/staged-motion-{room}';dest.mkdir(parents=True,exist_ok=True)
 fps=int(os.environ.get('STORY_RENDER_FPS','6'));assert fps in (3,4,6,8,12,24)
 settings=dest/'settings.json'
 if '--resume' in sys.argv and settings.exists():assert json.loads(settings.read_text())['fps']==fps, 'Resume must use the same sampling rate'
 settings.write_text(json.dumps({'fps':fps}))
 for n in range(round(rooms[room-4]['duration']*fps)+2):
  output=dest/f'{n:04}.jpg'
  if '--resume' in sys.argv and output.is_file() and output.stat().st_size>10000:continue
  scene.frame_set(min(865,round(n*24/fps)+1));render(output,576,576)
  if n%12==0:print('STORY_FRAME',room,n,flush=True)
print('SCENE_RENDER_COMPLETE',room,flush=True);os._exit(0)
