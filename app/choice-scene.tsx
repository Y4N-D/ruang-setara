"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createStoryPanorama} from './story-panorama';
import {allStoryCases as cases} from './lesson-stories';
import originalAnchors from './story-anchors.json';
import lessonAnchors from './lesson-anchors.json';
const anchorData={fps:originalAnchors.fps,rooms:[...originalAnchors.rooms,...lessonAnchors.rooms]};
import {beatAt,storyScenes,type StoryPlayback} from './story-playback';
import {ease,roomCenters,storyActors,storyPose,StoryView} from './story-path';

type Settings=StoryView&{playback:StoryPlayback;entered:boolean;still:boolean;blocked:boolean;onMode:(light:boolean)=>void};
export default function ChoiceScene(props:Settings){
 const ref=useRef<HTMLCanvasElement>(null),panorama=useRef<HTMLDivElement>(null),labels=useRef<HTMLDivElement>(null),settings=useRef(props);settings.current=props;
 const lessonScene=props.room>=4;
 const [ready,setReady]=useState(false),[light,setLight]=useState(false);
 useEffect(()=>{
  const canvas=ref.current,panoramaHost=panorama.current;if(!canvas||!panoramaHost)return;
  setReady(false);setLight(false);
  let mixer:THREE.AnimationMixer|undefined,renderer:THREE.WebGLRenderer|undefined,model:THREE.Group|undefined,env:THREE.WebGLRenderTarget|undefined,disposed=false,failed=false,frame=0;
  const camera=new THREE.PerspectiveCamera(68,1,.06,250),scene=new THREE.Scene();scene.background=new THREE.Color('#efede5');
  // CPU-rendered panoramas share the live scene's eye position and rotate without WebGL.
  const pano=createStoryPanorama(panoramaHost);
  const fallback=()=>{if(disposed)return;failed=true;setLight(true);setReady(false);settings.current.onMode(true);canvas.dataset.renderer='panorama-story';};
  let gl:WebGL2RenderingContext|null=null;try{gl=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance'});}catch{}
  if(gl){try{renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true});}catch{fallback();}}else fallback();
  const rooms:{node:THREE.Object3D;index:number}[]=[],actions:THREE.AnimationAction[]=[];
  const disposeModel=(root:THREE.Object3D)=>{const textures=new Set<THREE.Texture>();root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{Object.values(m).forEach(v=>{if(v instanceof THREE.Texture)textures.add(v);});m.dispose();});}});textures.forEach(t=>t.dispose());};
  const sun=new THREE.DirectionalLight('#fff1d9',2.6),fill=new THREE.DirectionalLight('#e7f3ff',1.1);scene.add(sun,sun.target,fill,fill.target);scene.add(new THREE.HemisphereLight('#f4faff','#d6cdbc',2.1));
  const draco=new DRACOLoader().setDecoderPath('stories/draco/').setWorkerLimit(2);
  if(renderer){
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   const pmrem=new THREE.PMREMGenerator(renderer),roomEnv=new RoomEnvironment();env=pmrem.fromScene(roomEnv,.055);scene.environment=env.texture;scene.environmentIntensity=.78;roomEnv.dispose();pmrem.dispose();
   sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:15,bottom:-15,near:.5,far:55});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;
   new GLTFLoader().setDRACOLoader(draco).load(lessonScene?'stories/lessons.glb?v=lesson-02':'stories/choices.glb?v=stage-03',g=>{
    if(disposed){disposeModel(g.scene);return;}
    model=g.scene;scene.add(model);model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;if(o instanceof THREE.SkinnedMesh)o.frustumCulled=false;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m instanceof THREE.MeshStandardMaterial){m.envMapIntensity=.72;if(/^(Leaf|Hair|Natural_eyebrows)/.test(m.name))m.side=THREE.DoubleSide;}});}});
    mixer=new THREE.AnimationMixer(model);g.animations.forEach(clip=>{const action=mixer!.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();actions.push(action);});canvas.dataset.clips=String(g.animations.length);
    for(let i=0;i<7;i++){const r=model.getObjectByName(`Story_${i}`);if(r)rooms.push({node:r,index:i});}setReady(true);settings.current.onMode(false);canvas.dataset.renderer='webgl-story';
   },undefined,fallback);
  }
  const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;renderer?.setSize(w,h,false);pano.resize(w,h);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  const onVisibility=()=>{if(document.hidden)pano.pause();};document.addEventListener('visibilitychange',onVisibility);
  const lost=(e:Event)=>{e.preventDefault();fallback();};canvas.addEventListener('webglcontextlost',lost);
  let last=0,lastDraw=0,initialized=false,wasEntered=false,yaw=0,pitch=0,fov=68,sceneTime=0,playbackRevision=-1;
  const eye=new THREE.Vector3(),look=new THREE.Vector3(),projected=new THREE.Vector3();
  const actorAnchors=anchorData.rooms as Partial<Record<string,number[][]>>[];
  const anchor=(name:string,t:number)=>{const points=actorAnchors[settings.current.room][name];if(!points)return null;const at=Math.min(points.length-1,t*anchorData.fps),lo=Math.floor(at),a=points[lo],b=points[Math.min(lo+1,points.length-1)],f=at-lo;return new THREE.Vector3(...a.map((v,i)=>v+(b[i]-v)*f) as [number,number,number]);};
  const draw=(time:number)=>{
   if(disposed)return;frame=requestAnimationFrame(draw);const dt=Math.min(.05,(time-last)/1000||.016);last=time;
   if(document.hidden||settings.current.blocked){pano.pause();lastDraw=time;return;}
   if(time-lastDraw<24)return;const elapsed=Math.min(.1,(time-lastDraw)/1000||.033);lastDraw=time;
   const s=settings.current;
   s.playback.select(s.room);if(s.entered&&!wasEntered)s.playback.restart();
   const playback=s.playback.getSnapshot();if(playback.revision!==playbackRevision){sceneTime=playback.time;playbackRevision=playback.revision;actions.forEach(action=>action.reset().play());}
   const playing=s.entered&&!s.still&&!s.obscured&&s.phase<.12&&s.travel===0&&!playback.ended;
   const mobile=canvas.clientWidth<=760,pose=storyPose(s,mobile),cx=roomCenters[s.room],mix=s.still||!initialized||s.entered&&!wasEntered?1:1-Math.exp(-7*dt);
   if(mobile&&s.entered&&s.phase<.12){const speaker=beatAt(s.room,sceneTime)?.actor,p=speaker&&anchor(speaker,sceneTime);if(p)pose.yaw=THREE.MathUtils.lerp(pose.yaw,Math.atan2(p.x-pose.eye.x,pose.eye.z-p.z),.6*(1-ease(s.phase/.12)));}
   if(!s.entered){if(lessonScene){pose.eye.set(cx+9,11,13);pose.fov=43;if(mobile)pose.eye.set(cx+13,18,24);}else{pose.eye.set(36,33,43);pose.fov=41;if(mobile)pose.eye.multiplyScalar(1.65);}pose.yaw=0;}
   eye.lerp(pose.eye,mix);yaw=THREE.MathUtils.lerp(yaw,pose.yaw,mix);fov=THREE.MathUtils.lerp(fov,pose.fov,mix);camera.position.copy(eye);camera.fov=fov;
   pitch=THREE.MathUtils.lerp(pitch,mobile&&s.entered?.18*(1-ease(s.phase/.4)):0,mix);
   if(s.entered){look.set(eye.x+Math.sin(yaw),eye.y+Math.tan(pitch),eye.z-Math.cos(yaw));camera.lookAt(look);}else camera.lookAt(lessonScene?cx:0,0,0);
   camera.updateProjectionMatrix();camera.updateMatrixWorld();initialized=true;wasEntered=s.entered;
   if(renderer&&model&&!failed){
    pano.pause();
    // Both sides of a doorway stay in the same scene throughout the passage.
    rooms.forEach(({node,index})=>{node.visible=!s.entered?(lessonScene?index===s.room:true):Math.abs(roomCenters[index]-eye.x)<23;});
    sun.position.set(eye.x-5,13,8);sun.target.position.set(eye.x,0,0);fill.position.set(eye.x+5,7,6);fill.target.position.set(eye.x,1,0);
    if(playing)sceneTime=Math.min(storyScenes[s.room].duration,sceneTime+elapsed);
    mixer?.setTime(s.entered?sceneTime:0);s.playback.sync(sceneTime,true);
    try{renderer.render(scene,camera);}catch{fallback();}
   }
   if(!model||failed){
    const video=pano.render(yaw,fov,s.room,ease((s.travel-.40)/.24),playing,playback.revision,sceneTime,pitch);sceneTime=video.ended?storyScenes[s.room].duration:video.time;s.playback.sync(sceneTime,video.ready);
   }
   const taken:{x:number;y:number;width:number;height:number}[]=[],alpha=s.obscured?0:(1-ease((s.phase-.08)/.45))*(1-ease(s.travel/.1));
   const w=canvas.clientWidth,h=canvas.clientHeight,navBottom=document.querySelector('.story-room-nav')?.getBoundingClientRect().bottom??170;
   const anchors=Array.from(labels.current?.querySelectorAll<HTMLElement>('[data-actor]')??[]).map(el=>{
    const actor=storyActors[s.room].find(a=>a.id===el.dataset.actor);if(!actor)return null;
    projected.copy(anchor(actor.id,sceneTime)??new THREE.Vector3(cx+actor.at[0],actor.at[1]+.18,actor.at[2])).project(camera);
    return{el,x:(projected.x+1)*w/2,y:(1-projected.y)*h/2,z:projected.z};
   }).filter((a):a is NonNullable<typeof a>=>a!==null);
   if(mobile)anchors.sort((a,b)=>a.x-b.x);
   const bubble=document.querySelector<HTMLElement>('.scene-dialogue'),speaker=beatAt(s.room,sceneTime)?.actor;
   const speakerAnchor=anchors.find(a=>a.el.dataset.actor===speaker);
   if(speakerAnchor&&bubble&&s.phase<.12){
    const bw=bubble.offsetWidth,bh=bubble.offsetHeight;let bx=Math.max(10,Math.min(w-bw-10,speakerAnchor.x-bw/2));const by=Math.max(navBottom+(mobile?110:8),speakerAnchor.y-bh-(mobile?24:40));
    const caption=document.querySelector('.active-room .story-caption')?.getBoundingClientRect();if(!mobile&&caption&&by+bh>caption.top&&by<caption.bottom)bx=Math.max(bx,Math.min(w-bw-10,caption.right+12));
    bubble.style.left=`${bx}px`;bubble.style.top=`${by}px`;bubble.style.setProperty('--speaker-tail',`${Math.max(18,Math.min(bw-18,speakerAnchor.x-bx))}px`);
    bubble.dataset.anchorX=speakerAnchor.x.toFixed(1);bubble.dataset.anchorY=speakerAnchor.y.toFixed(1);
    if(!mobile)taken.push({x:bx+bw/2,y:by+bh,width:bw,height:bh});
   }
   anchors.forEach((a,i)=>{
    const speaking=speaker===a.el.dataset.actor&&s.phase<.12;
    a.el.classList.toggle('is-speaking',speaking);
    const x=mobile?(i+.5)*w/anchors.length:a.x;
    let y=mobile?Math.max(navBottom+60,Math.min(a.y-22,navBottom+85)):a.y-36;
    const labelWidth=a.el.offsetWidth,labelHeight=a.el.offsetHeight;
    if(!mobile)for(let attempt=0;attempt<6&&taken.some(p=>Math.abs(p.x-x)<(p.width+labelWidth)/2+8&&y>p.y-p.height-8&&y-labelHeight<p.y+8);attempt++)y-=labelHeight+10;
    const visible=!speaking&&s.entered&&alpha>.01&&a.z>-1&&a.z<1&&a.x>0&&a.x<w&&y>navBottom+42&&y<h-40;
    a.el.style.opacity=visible?String(alpha):'0';a.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;
    a.el.style.width=mobile?`${Math.min(114,w/anchors.length-5)}px`:'';a.el.style.minWidth=mobile?'0':'';
    a.el.style.setProperty('--stem',`${Math.hypot(a.x-x,a.y-y)}px`);a.el.style.setProperty('--stem-angle',`${-Math.atan2(a.x-x,a.y-y)}rad`);
    if(visible)taken.push({x,y,width:labelWidth,height:labelHeight});
   });
   canvas.dataset.room=cases[s.room].id;canvas.dataset.phase=s.phase.toFixed(3);canvas.dataset.travel=s.travel.toFixed(3);canvas.dataset.camera=[eye.x,eye.y,eye.z,yaw].map(v=>v.toFixed(3)).join(',');canvas.dataset.motion=playing?'animated':'paused';canvas.dataset.sceneTime=sceneTime.toFixed(3);canvas.dataset.speaker=speaker??'';canvas.dataset.ready='true';
  };frame=requestAnimationFrame(draw);
  return()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();canvas.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',onVisibility);mixer?.stopAllAction();if(model){mixer?.uncacheRoot(model);disposeModel(model);}env?.dispose();draco.dispose();renderer?.dispose();pano.dispose();};
 },[lessonScene]);
 return <div className={`story-scene ${props.entered?'entered-story':'story-preview'} ${props.obscured?'scene-obscured':''}`} style={{'--story-viewport':`${60+40*ease(props.phase)}svh`} as CSSProperties}>
  <img className={`story-overview ${props.entered||ready?'hidden':''}`} src={lessonScene?`stories/${props.room}-preview.jpg?v=lesson-02`:"stories/preview.jpg?v=stage-03"} alt="" draggable={false}/>
  <div ref={panorama} className={`story-panorama ${props.entered&&!ready?'visible':''}`} aria-hidden="true"/>
  <canvas ref={ref} className={ready?'is-ready':''} role="img" aria-label={props.entered?`Ruang tiga dimensi ${cases[props.room].label}. Dinding cerita dan dinding pertanyaan dihubungkan oleh putaran kamera. ${storyActors[props.room].map(a=>`${a.name}: ${a.role}`).join('. ')}.`:lessonScene?`Pratinjau ruang ${cases[props.room].label}, dengan tokoh dan lingkungan yang sama seperti adegannya.`:'Pratinjau empat ruang cerita dengan dinding cerita, dinding pertanyaan, dan pintu penghubung.'}/>
  <div ref={labels} className="actor-labels" aria-hidden="true">{storyActors[props.room].map(a=><div className="actor-label" key={a.id} data-actor={a.id}><strong>{a.name}</strong><span>{a.role}</span></div>)}</div>
  {light&&<span className="light-mode" title="Panorama animasi dari adegan 3D yang sama. Gerakan dapat dijeda melalui tombol di bagian atas.">Mode panorama</span>}
 </div>;
}
