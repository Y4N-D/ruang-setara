"""Merge same-material meshes within each animation pivot.
Keeps all character pivots and room roots. Follow with compress-choices.mjs.
"""
import bpy,os,sys
from collections import defaultdict
def optimize(out):
 bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  if o.type=='MESH':o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.object.convert(target='MESH')
 groups=defaultdict(list)
 for o in bpy.context.scene.objects:
  if o.type=='MESH':groups[(o.parent,tuple(m.name if m else '' for m in o.data.materials))].append(o)
 bpy.ops.object.select_all(action='DESELECT')
 for objects in groups.values():
  if len(objects)<2:continue
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Surface_'+(objects[0].parent.name if objects[0].parent else 'Ground')+'_'+(objects[0].data.materials[0].name if len(objects[0].data.materials) else 'Default');bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  if o.type not in {'LIGHT','CAMERA'}:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_apply=True,export_yup=True)
 print('OPTIMIZED_STORY_ASSET',os.path.getsize(out),flush=True)
if __name__=='__main__':
 root=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'));bpy.ops.wm.open_mainfile(filepath=os.path.abspath(sys.argv[1]) if len(sys.argv)>1 else os.path.join(root,'.sites-runtime/choices.blend'));optimize(os.path.join(root,'public/stories/choices.glb'));os._exit(0)
