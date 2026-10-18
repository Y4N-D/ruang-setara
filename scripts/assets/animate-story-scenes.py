"""Bake the shared story timeline into articulated, interacting 3D actors."""
import bpy,json,math,os
from pathlib import Path
from mathutils import Vector,Quaternion
ROOT=Path(__file__).resolve().parents[2]
rooms=json.loads((ROOT/'app/story-choreography.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'.sites-runtime/human-rooms.blend'))
scene=bpy.context.scene;scene.render.fps=24;scene.frame_start=1;scene.frame_end=697
def ease(v):
 v=max(0,min(1,v));return v*v*(3-2*v)
def angle(a,b,t):return a+((b-a+math.pi)%(2*math.pi)-math.pi)*t
def sample(spec,t):
 keys=spec['keys'];distance=0
 for a,b in zip(keys,keys[1:]):
  length=math.hypot(b[1]-a[1],b[2]-a[2])
  if t<=b[0]:
   f=ease((t-a[0])/max(.001,b[0]-a[0]));v=[a[j]+(b[j]-a[j])*f for j in range(1,5)];v[2]=angle(a[3],b[3],f)
   return v,distance+length*f
  distance+=length
 return keys[-1][1:],distance
def set_pose(rig,pose):
 for p in rig.pose.bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=pose[p.name.split('__',1)[1]]
neutral=json.loads(bpy.data.objects['Rig_Reno']['standing_pose']);records=[];anchors=[]
for room_idx,room in enumerate(rooms):
 output={name:[] for name in room['actors']};anchors.append(output)
 for name,spec in room['actors'].items():
  actor=bpy.data.objects['Actor_'+name];rig=bpy.data.objects['Rig_'+name]
  rig.animation_data_clear();actor.animation_data_clear();actor.location=(0,0,0);actor.rotation_euler=(0,0,0)
  standing={b:Quaternion(q) for b,q in json.loads(rig['standing_pose']).items()};seated={b:Quaternion(q) for b,q in json.loads(rig['seated_pose']).items()}
  set_pose(rig,standing);bpy.context.view_layer.update()
  axes={p.name.split('__',1)[1]:{axis:p.matrix.to_quaternion().inverted()@Vector(v) for axis,v in [('x',(1,0,0)),('z',(0,0,1))]} for p in rig.pose.bones}
  records.append((room_idx,room,name,spec,rig,standing,seated,axes))
animated=['spine01','spine02','neck01','head','jaw','upperarm01.L','upperarm01.R','lowerarm01.L','lowerarm01.R','wrist.L','wrist.R','upperleg01.L','upperleg01.R','lowerleg01.L','lowerleg01.R','foot.L','foot.R','finger1-2.R']
for frame in range(1,698,4):
 t=(frame-1)/24;scene.frame_set(frame)
 for room_idx,room,name,spec,rig,standing,seated,axes in records:
  tt=min(t,room['duration']);(x,y,yaw,sit),distance=sample(spec,tt)
  before,_=sample(spec,max(0,tt-.04));after,_=sample(spec,min(room['duration'],tt+.04));dx=after[0]-before[0];dy=after[1]-before[1]
  speed=math.hypot(dx,dy)/.08;walk=ease(speed/.32)*(1-sit)*(0 if abs(after[3]-before[3])>.0001 else 1);stride=distance/1.08*math.tau
  if walk>.005:yaw=angle(yaw,math.atan2(dx,-dy),walk*.9)
  ground=.355 if room_idx==3 else .13+.135*ease((y-.86)/.18) if room_idx==2 else .07
  rig.location=(x,y,ground*(1-sit)+float(rig['seat_z'])*sit+.014*walk*math.cos(2*stride));rig.rotation_mode='XYZ';rig.rotation_euler=(0,0,yaw)
  pb={p.name.split('__',1)[1]:p for p in rig.pose.bones}
  for b,p in pb.items():p.rotation_quaternion=standing[b].slerp(seated[b],sit);p.scale=(1,1,1)
  beat=next((b for b in room['beats'] if b['actor']==name and b['start']-.25<=tt<=b['end']+.25),None)
  speaking=min(ease((tt-beat['start']+.25)/.4),ease((beat['end']+.25-tt)/.4)) if beat else 0
  def rotate(b,axis,amount):pb[b].rotation_quaternion@=Quaternion(axes[b][axis],amount)
  for side,sign in [('L',1),('R',-1)]:
   wave=math.sin(stride+(0 if side=='L' else math.pi))
   rotate('upperleg01.'+side,'x',-.42*wave*walk);rotate('lowerleg01.'+side,'x',.78*max(0,-wave)*walk);rotate('foot.'+side,'x',-.28*max(0,-wave)*walk)
   if not(rig['gesture']=='phone' and side=='R'):
    for stem in ['upperarm01','lowerarm01','wrist']:
     b=stem+'.'+side;pose=standing[b].slerp(seated[b],sit);amount=max(speaking*.85,sit*.7 if name=='Raka' else 0)
     pb[b].rotation_quaternion=Quaternion(neutral[b]).slerp(pose,amount)
    rotate('upperarm01.'+side,'x',.25*wave*walk)
  cycle=tt*math.tau/4.8
  rotate('spine02','z',.012*math.sin(cycle+room_idx));rotate('spine02','x',.16*math.sin(math.pi*sit));pb['spine01'].scale=(1+.005*math.sin(cycle),1+.005*math.sin(cycle),1)
  previous=None;target=None;change=0
  for at,who in spec['look']:
   if tt>=at:previous=target;target=who;change=at
  def gaze(who):
   if who is None:return 0
   pos,_=sample(room['actors'][who],tt);heading=math.atan2(pos[0]-x,-(pos[1]-y));delta=(heading-yaw+math.pi)%(2*math.pi)-math.pi
   return max(-.48,min(.48,delta))
  rotate('head','z',(gaze(previous)+(gaze(target)-gaze(previous))*ease((tt-change)/.7))*(1-walk*.7))
  rotate('head','x',(.018 if speaking else .04)*math.sin(tt*2.5+len(name)));rotate('jaw','x',speaking*.025*(1-math.cos(tt*13)))
  if rig['gesture']=='phone':rotate('lowerarm01.R','x',speaking*.045*math.sin(tt*2));rotate('finger1-2.R','x',speaking*.07*math.sin(tt*6))
  else:rotate('lowerarm01.R','x',speaking*.085*math.sin(tt*2.4));rotate('wrist.R','z',speaking*.07*math.sin(tt*2.4+.5))
  for b in animated:pb[b].keyframe_insert('rotation_quaternion',frame=frame)
  pb['spine01'].keyframe_insert('scale',frame=frame);rig.keyframe_insert('location',frame=frame);rig.keyframe_insert('rotation_euler',frame=frame);rig.animation_data.action.name='Scene_'+name
 bpy.context.view_layer.update()
 for room_idx,room,name,spec,rig,standing,seated,axes in records:
  if t<=room['duration']+1e-5:
   p=rig.matrix_world@rig.pose.bones[name+'__head'].tail;p.z+=.08;anchors[room_idx][name].append([round(p.x,4),round(p.z,4),round(-p.y,4)])
 if frame%48==1:print('CHOREOGRAPHY',round(t,1),flush=True)
for _,_,_,_,rig,_,_,_ in records:
 for curve in rig.animation_data.action.fcurves:
  for key in curve.keyframe_points:key.interpolation='LINEAR'
(ROOT/'app/story-anchors.json').write_text(json.dumps({'fps':6,'rooms':anchors},separators=(',',':'))+'\n')
scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'.sites-runtime/staged-rooms.blend'))
print('STAGED_ROOMS_COMPLETE',flush=True);os._exit(0)
