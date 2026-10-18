"use client";
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

type Settings={progress:number;entry:number;entered:boolean;still:boolean;balanced:boolean;reset:number;blocked:boolean;onMode:(light:boolean)=>void};
const clamp=THREE.MathUtils.clamp;
const smooth=(v:number)=>v*v*(3-2*v);

export default function GalleryScene(props:Settings){
 const settings=useRef(props);settings.current=props;
 const canvasRef=useRef<HTMLCanvasElement>(null),fallbackRef=useRef<HTMLDivElement>(null);
 const [ready,setReady]=useState(false),[light,setLight]=useState(false);
 const selected=props.entered?Math.round(props.progress):props.entry;
 useEffect(()=>{if(ready&&!props.entered&&!props.still)canvasRef.current?.animate([{opacity:.35},{opacity:1}],{duration:650,easing:'ease-out'});},[props.entry,props.entered,props.still,ready]);
 const [shown,setShown]=useState({selected,entered:props.entered,balanced:props.balanced});
 useEffect(()=>{setShown({selected,entered:props.entered,balanced:props.balanced});},[selected,props.entered,props.balanced]);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  let renderer:THREE.WebGLRenderer|null=null,disposed=false,failed=false,frame=0,model:THREE.Group|undefined;
  const activateLight=()=>{if(disposed)return;failed=true;setLight(true);setReady(false);settings.current.onMode(true);canvas.dataset.renderer='rendered-gallery';canvas.dataset.ready='true';};
  // All learning controls remain available even on devices without WebGL.
  let context:WebGL2RenderingContext|null=null;try{context=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});}catch{activateLight();return;}
  if(!context){activateLight();return;}
  try{renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,powerPreference:'high-performance'});}catch{activateLight();return;}
  const scene=new THREE.Scene();scene.background=new THREE.Color('#efede5');scene.fog=new THREE.Fog('#efede5',55,100);
  const camera=new THREE.PerspectiveCamera(40,1,.08,300);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const pmrem=new THREE.PMREMGenerator(renderer),roomEnv=new RoomEnvironment();const env=pmrem.fromScene(roomEnv,.045);scene.environment=env.texture;scene.environmentIntensity=.8;roomEnv.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#eaf3ff','#c5bba2',1.5));
  const sun=new THREE.DirectionalLight('#fff0d4',3.4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:45});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=4;scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight('#dceeff',1.25);scene.add(fill,fill.target);
  let orbit=0,elevation=0,down=false,lastX=0,lastY=0,pointerX=0,pointerY=0,lastTime=0,lastRender=0;
  let p=settings.current.entered?settings.current.progress:settings.current.entry,inside=settings.current.entered?1:0,tilt=0,lastReset=settings.current.reset;
  let beam:THREE.Object3D|undefined,leftBowl:THREE.Object3D|undefined,rightBowl:THREE.Object3D|undefined;
  const rooms:THREE.Object3D[]=[];
  const resize=()=>{if(!renderer)return;const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();};
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  const load=new GLTFLoader();load.load('gallery/ruang-setara.glb',gltf=>{
   if(disposed){gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});return;}
   model=gltf.scene;scene.add(model);
   model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m instanceof THREE.MeshStandardMaterial){m.envMapIntensity=.85;m.side=m.name.startsWith('Leaf')?THREE.DoubleSide:THREE.FrontSide;}});}});
   for(let i=0;i<6;i++){const r=model.getObjectByName(`Gallery_${i}`);if(r)rooms.push(r);}
   beam=model.getObjectByName('ScaleBeam');leftBowl=model.getObjectByName('ScaleBowl_-1');rightBowl=model.getObjectByName('ScaleBowl_1');
   canvas.dataset.renderer='webgl-gallery';settings.current.onMode(false);setReady(true);
  },undefined,activateLight);
  const pointerDown=(e:PointerEvent)=>{if(settings.current.blocked||e.pointerType==='touch')return;down=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);};
  const pointerMove=(e:PointerEvent)=>{if(settings.current.blocked)return;if(down){orbit=clamp(orbit+(e.clientX-lastX)*.0025,-.4,.4);elevation=clamp(elevation+(e.clientY-lastY)*.009,-.7,1.1);lastX=e.clientX;lastY=e.clientY;}else{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5;}};
  const pointerUp=()=>{down=false;};
  const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();orbit=e.key==='Home'?0:clamp(orbit+(e.key==='ArrowLeft'?-.08:.08),-.4,.4);};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('keydown',key);
  const lost=(e:Event)=>{e.preventDefault();activateLight();};canvas.addEventListener('webglcontextlost',lost);
  const eye=new THREE.Vector3(),target=new THREE.Vector3(),baseEye=new THREE.Vector3(),baseTarget=new THREE.Vector3();
  const render=(time:number)=>{
   if(disposed||failed)return;frame=requestAnimationFrame(render);const dt=Math.min(.06,(time-lastTime)/1000||.016);lastTime=time;if(document.hidden||settings.current.blocked||!model||time-lastRender<30)return;lastRender=time;
   const s=settings.current;if(s.reset!==lastReset){orbit=0;elevation=0;lastReset=s.reset;}
   const dest=s.entered?s.progress:s.entry;p=!s.entered||s.still?dest:THREE.MathUtils.damp(p,dest,5,dt);inside=s.still?(s.entered?1:0):THREE.MathUtils.damp(inside,s.entered?1:0,3.2,dt);tilt=s.still?(s.balanced?0:.18):THREE.MathUtils.damp(tilt,s.balanced?0:.18,7,dt);
   const cx=p*19;const nearest=Math.round(p);rooms.forEach((r,i)=>r.visible=s.entered?Math.abs(i-p)<1.6:i===nearest);
   const mobile=camera.aspect<.85;
   const overview=new THREE.Vector3(cx+21,21,28),interior=new THREE.Vector3(cx+(mobile?1.5:4.1),mobile?3.3:3.1,mobile?14.5:9.9);
   baseEye.copy(overview).lerp(interior,smooth(clamp(inside,0,1)));baseTarget.set(cx,.3,0).lerp(new THREE.Vector3(cx,mobile?-.4:2,-1.15),inside);
   if(mobile&&inside<.99){const d=baseEye.clone().sub(baseTarget);baseEye.copy(baseTarget).add(d.multiplyScalar(1+(1-inside)*.5));}
   const off=baseEye.clone().sub(baseTarget);off.applyAxisAngle(new THREE.Vector3(0,1,0),orbit);eye.copy(baseTarget).add(off);eye.y+=elevation;target.copy(baseTarget);
   if(!s.still){eye.x+=pointerX*.28;eye.y-=pointerY*.12;}
   camera.position.copy(eye);camera.lookAt(target);camera.fov=40+inside*13;camera.updateProjectionMatrix();
   sun.position.set(cx-6,12,8);sun.target.position.set(cx,0,0);fill.position.set(cx+7,6,4);fill.target.position.set(cx,1,-1);
   if(beam)beam.rotation.z=-tilt;
   if(leftBowl)leftBowl.position.set(-2.12*Math.cos(tilt),3.05+2.12*Math.sin(tilt),-1);
   if(rightBowl)rightBowl.position.set(2.12*Math.cos(tilt),3.05-2.12*Math.sin(tilt),-1);
   try{renderer!.render(scene,camera);}catch{activateLight();return;}
   const marker=document.getElementById('world-hotspot');if(marker){const pos=new THREE.Vector3(nearest*19,nearest===3?1.9:2.2,-1).project(camera);const x=(pos.x*.5+.5)*canvas.clientWidth,y=(-pos.y*.5+.5)*canvas.clientHeight;marker.style.left=`${x}px`;marker.style.top=`${y}px`;marker.style.visibility=s.entered&&inside>.95&&x>60&&x<canvas.clientWidth-60&&y>90&&y<canvas.clientHeight-150?'visible':'hidden';}
   canvas.dataset.progress=p.toFixed(3);canvas.dataset.camera=eye.toArray().map(v=>v.toFixed(2)).join(',');canvas.dataset.balance=s.balanced?'balanced':'tilted';canvas.dataset.ready='true';
  };frame=requestAnimationFrame(render);
  return()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost);model?.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});env.dispose();renderer?.dispose();};
 },[]);
 // The lightweight version uses renders of the exact same 3D model.
 useEffect(()=>{if(!light)return;const marker=document.getElementById('world-hotspot');if(marker){marker.style.left='57%';marker.style.top='45%';marker.style.visibility=props.entered?'visible':'hidden';}if(canvasRef.current){canvasRef.current.dataset.progress=props.progress.toFixed(3);canvasRef.current.dataset.balance=props.balanced?'balanced':'tilted';}},[light,props.entered,props.progress,props.balanced]);
 const file=shown.entered?`room-${shown.selected}${shown.selected===2&&!shown.balanced?'-tilted':''}`:`entry-${shown.selected}`;
 return <><div ref={fallbackRef} className={`gallery-fallback ${ready?'is-hidden':''} ${shown.entered?'interior-render':'entry-render'}`} aria-hidden="true"><picture key={file}>{shown.entered&&<source media="(max-width: 760px)" srcSet={`gallery/${file}-mobile.jpg`}/>}<img src={`gallery/${file}.jpg`} alt="" fetchPriority="high" draggable={false}/></picture></div><canvas ref={canvasRef} className={`city-canvas ${ready?'is-ready':''}`} tabIndex={ready?0:-1} role="img" aria-label={light?"Tampilan galeri dengan timbangan, buku konstitusi, dan palu hakim. Pilih ruang melalui navigasi.":"Galeri tiga dimensi dengan timbangan, buku konstitusi, dan palu hakim. Seret atau gunakan tombol panah kiri dan kanan untuk mengubah sudut pandang."}/>{light&&<span className="light-mode" title="Mode ringan menampilkan hasil render galeri. Semua materi dan simulasi tetap tersedia.">Mode ringan</span>}</>;
}
