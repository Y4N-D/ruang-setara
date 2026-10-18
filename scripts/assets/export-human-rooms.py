"""Export subdivided skinned actors without baking away their armatures."""
import bpy,os,sys
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/('.sites-runtime/staged-rooms.blend' if '--staged' in sys.argv else '.sites-runtime/human-rooms.blend')))
def in_actor(o):
 while o:
  if o.name.startswith('Actor_'):return True
  o=o.parent
 return False
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH' and not in_actor(o):
  o.select_set(True);bpy.context.view_layer.objects.active=o
bpy.ops.object.convert(target='MESH');bpy.ops.object.select_all(action='DESELECT')
groups=defaultdict(list)
for o in bpy.context.scene.objects:
 if o.type=='MESH' and not in_actor(o):groups[(o.parent,tuple(m.name for m in o.data.materials))].append(o)
for group in groups.values():
 for o in group:o.select_set(True)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.context.scene.objects):
 if o.type=='MESH' and in_actor(o):
  sub=next((m for m in o.modifiers if m.type=='SUBSURF'),None)
  if sub:
   bpy.context.view_layer.objects.active=o;o.select_set(True)
   bpy.ops.object.modifier_move_to_index(modifier=sub.name,index=0);bpy.ops.object.modifier_apply(modifier=sub.name);o.select_set(False)
for o in bpy.context.scene.objects:o.select_set(o.type not in ['LIGHT','CAMERA'])
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/stories/choices.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=True,export_animation_mode='ACTIONS',export_frame_range=True,export_frame_step=4,export_force_sampling=True,export_optimize_animation_size=True,export_skins=True,export_all_influences=False,export_yup=True)
print('GLB_EXPORTED', (ROOT/'public/stories/choices.glb').stat().st_size,flush=True);os._exit(0)
