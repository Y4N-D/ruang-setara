import lessonChoreography from './lesson-choreography.json';
import {CatmullRomCurve3, MathUtils, Vector3} from 'three';
export type StoryView={room:number;phase:number;travel:number;obscured?:boolean};
export const roomCenters=[-21,-7,7,21,35,49,63];
export const roomEye=[0,2.2,3.3] as const;
export const ease=(v:number)=>{const t=MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
const passage=new CatmullRomCurve3([
 new Vector3(...roomEye),new Vector3(4.5,2.2,2.8),new Vector3(5.25,2.2,-3.17),
 new Vector3(8.45,2.2,-3.17),new Vector3(10.1,2.2,-1.5),new Vector3(10.3,2.2,2.7),new Vector3(14,2.2,3.3),
],false,'centripetal');
const headings=[Math.PI/2,Math.PI*.14,Math.PI/2,Math.PI/2,Math.PI*.9,Math.PI*.5,0];
export function storyPose(view:StoryView,mobile=false){
 const phase=ease(view.phase),cx=roomCenters[view.room];
 let eye=new Vector3(cx+roomEye[0],roomEye[1],roomEye[2]);
 let yaw=MathUtils.lerp(mobile?.20:0,Math.PI/2,phase);
 let fov=MathUtils.lerp(mobile?96:68,mobile?77:58,phase);
 if(view.travel>0){
  const t=ease(view.travel),segment=Math.min(5,Math.floor(t*6)),local=ease(t*6-segment);
  eye=passage.getPoint(t);eye.x+=cx;
  yaw=MathUtils.lerp(headings[segment],segment===5&&mobile?.20:headings[segment+1],local);
  fov=MathUtils.lerp(mobile?77:58,mobile?96:68,t);
 }
 return {eye,yaw,fov};
}
const choiceActors=[
 [
  {id:'Raka',name:'Raka',role:'Korban',at:[.05,1.42,-1.13]},
  {id:'Mira',name:'Mira',role:'Teman pendamping',at:[-.60,1.42,-1.23]},
  {id:'Dio',name:'Dio',role:'Pelaku unggahan',at:[2.35,1.97,.25]},
  {id:'Seno',name:'Seno',role:'Saksi',at:[3.3,1.97,-1.4]},
 ],
 [
  {id:'Ari',name:'Ari',role:'Korban',at:[.4,1.97,-.5]},
  {id:'Bima',name:'Bima',role:'Pelaku tekanan',at:[1.7,1.97,-.8]},
  {id:'Reno',name:'Reno',role:'Teman sebaya',at:[3.1,1.97,-1.2]},
  {id:'Nadia',name:'Nadia',role:'Teman pendamping',at:[-.5,1.97,.35]},
  {id:'Guru',name:'Guru',role:'Guru BK',at:[-1.3,2.14,-2.7]},
 ],
 [
  {id:'Siswa',name:'Siswa',role:'Pengendara',at:[2.05,2.03,.05]},
  {id:'Ibu',name:'Ibu',role:'Orang tua',at:[4,2.335,-2.4]},
 ],
 [
  {id:'Warga',name:'Warga',role:'Warga hilir',at:[-.3,2.255,.55]},
  {id:'Petani',name:'Petani',role:'Pengelola lahan',at:[1.8,2.425,-1.4]},
  {id:'Teman',name:'Teman',role:'Pendamping warga',at:[-1.45,2.255,-.1]},
 ],
];

export const storyActors=[...choiceActors,...lessonChoreography.map(scene=>Object.entries(scene.actors).map(([id,a])=>({id,name:id==='Ratih'?'Bu Ratih':id,role:a!.role,at:[a!.keys[0][1],1.9,-a!.keys[0][2]]})))];
