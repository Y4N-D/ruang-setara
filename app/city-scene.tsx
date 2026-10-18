"use client";
import {useEffect,useRef,useState} from 'react';
import {createWorld,stops,add,sub,dot,cross,norm,scale,type V,type Face} from './world';

type M=Float32Array;
type Settings={progress:number;still:boolean;balanced:boolean;reset:number;blocked:boolean};
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const translation=(x:number,y:number,z:number)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m;};
const rotation=(t:number)=>new Float32Array([Math.cos(t),Math.sin(t),0,0,-Math.sin(t),Math.cos(t),0,0,0,0,1,0,0,0,0,1]);
function mul(a:M,b:M){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
const point=(m:M,p:V):V=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const direction=(m:M,p:V):V=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2],m[1]*p[0]+m[5]*p[1]+m[9]*p[2],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]];
const lerp=(a:V,b:V,t:number):V=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const smooth=(t:number)=>t*t*(3-2*t);
function lookAt(eye:V,target:V){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function perspective(aspect:number){const f=1/Math.tan(43*Math.PI/360),n=.2,far=220;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0]);}

type Renderer={draw:(eye:V,target:V,matrices:M[])=>void;resize:()=>void;dispose:()=>void};
function gpu(canvas:HTMLCanvasElement,faces:Face[]):Renderer|null{
 const gl=canvas.getContext('webgl',{antialias:true,alpha:true,powerPreference:'low-power'});if(!gl)return null;
 const shaders:WebGLShader[]=[],buffers:WebGLBuffer[]=[];
 const vertex=`attribute vec3 position;attribute vec3 normal;attribute vec3 color;uniform mat4 model;uniform mat4 vp;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;void main(){vec4 w=model*vec4(position,1.0);vWorld=w.xyz;vNormal=mat3(model)*normal;vColor=color;gl_Position=vp*w;}`;
 const fragment=`precision mediump float;varying vec3 vNormal;varying vec3 vColor;varying vec3 vWorld;uniform vec3 eye;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.6,1.0,.7));float diffuse=max(dot(n,light),0.0);float fill=max(dot(n,normalize(vec3(.8,.5,-.4))),0.0);float ambient=.70+.10*max(n.y,0.0);vec3 c=vColor*(ambient+.25*diffuse+.07*fill);float fog=smoothstep(38.,100.,length(eye-vWorld))*.48;gl_FragColor=vec4(mix(c,vec3(.81,.91,.92),fog),1.0);}`;
 const shader=(type:number,source:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Scene shader failed');return s;};
 const program=gl.createProgram()!;gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Scene program failed');gl.useProgram(program);
 const groupData=Array.from({length:5},()=>[] as number[]);
 for(const f of faces)for(let i=1;i<f.p.length-1;i++)for(const p of [f.p[0],f.p[i],f.p[i+1]])groupData[f.group].push(...p,...f.n,...f.c);
 const meshes=groupData.map(data=>{const buffer=gl.createBuffer()!;buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{buffer,count:data.length/9};});
 const pos=gl.getAttribLocation(program,'position'),normal=gl.getAttribLocation(program,'normal'),color=gl.getAttribLocation(program,'color');[pos,normal,color].forEach(v=>gl.enableVertexAttribArray(v));
 const model=gl.getUniformLocation(program,'model'),vp=gl.getUniformLocation(program,'vp'),eyeU=gl.getUniformLocation(program,'eye');gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 canvas.dataset.renderer='webgl-3d';
 return{
  resize(){const dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);},
  draw(eye,target,matrices){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(vp,false,mul(perspective(canvas.width/canvas.height),lookAt(eye,target)));gl.uniform3fv(eyeU,eye);meshes.forEach((mesh,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,36,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,36,12);gl.vertexAttribPointer(color,3,gl.FLOAT,false,36,24);gl.uniformMatrix4fv(model,false,matrices[i]);gl.drawArrays(gl.TRIANGLES,0,mesh.count);});},
  dispose(){buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);}
 };
}

function software(canvas:HTMLCanvasElement,faces:Face[]):Renderer|null{
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;canvas.dataset.renderer='software-3d';
 const light=norm([-.6,1,.7]),fill=norm([.8,.5,-.4]);
 const prepared=faces.map(f=>({...f,center:scale(f.p.reduce((acc,p)=>add(acc,p),[0,0,0] as V),1/f.p.length)}));
 let image:ImageData,depth:Float32Array,pixels:Uint32Array;
 return {
  resize(){const ratio=Math.min(devicePixelRatio||1,1);canvas.width=Math.round(canvas.clientWidth*ratio);canvas.height=Math.round(canvas.clientHeight*ratio);image=ctx.createImageData(canvas.width,canvas.height);depth=new Float32Array(canvas.width*canvas.height);pixels=new Uint32Array(image.data.buffer);},
  draw(eye,target,matrices){
   const w=canvas.width,h=canvas.height,focal=h/(2*Math.tan(43*Math.PI/360));const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
   depth.fill(0);pixels.fill(0);
   const toCamera=(p:V):V=>{const v=sub(p,eye);return[dot(v,right),dot(v,up),dot(v,forward)];};
   const triangle=(a:V,b:V,c:V,col:number)=>{
    let area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<.015)return;
    if(area<0){const tmp=b;b=c;c=tmp;area=-area;}
    const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    if(x0>x1||y0>y1)return;
    const ax=c[1]-b[1],ay=b[0]-c[0],bx=a[1]-c[1],by=c[0]-a[0],cx=b[1]-a[1],cy=a[0]-b[0];
    // Edge functions are negative inside this clockwise screen-space triangle.
    let rowA=(x0+.5-b[0])*ax+(y0+.5-b[1])*ay,rowB=(x0+.5-c[0])*bx+(y0+.5-c[1])*by,rowC=(x0+.5-a[0])*cx+(y0+.5-a[1])*cy;
    const za=-1/(a[2]*area),zb=-1/(b[2]*area),zc=-1/(c[2]*area);
    for(let y=y0;y<=y1;y++){let ea=rowA,eb=rowB,ec=rowC,index=y*w+x0;for(let x=x0;x<=x1;x++,index++,ea+=ax,eb+=bx,ec+=cx){if(ea<=.0001&&eb<=.0001&&ec<=.0001){const z=ea*za+eb*zb+ec*zc;if(z>depth[index]){depth[index]=z;pixels[index]=col;}}}rowA+=ay;rowB+=by;rowC+=cy;}
   };
   for(const face of prepared){
    const m=matrices[face.group],center=face.group?point(m,face.center):face.center,n=face.group?direction(m,face.n):face.n;
    if(dot(n,sub(eye,center))<-.001)continue;
    let p=face.p.map(v=>toCamera(face.group?point(m,v):v));if(p.every(v=>v[2]<.3))continue;
    if(p.some(v=>v[2]<.3)){const clipped:V[]=[];for(let j=0;j<p.length;j++){const a=p[j],b=p[(j+1)%p.length];if(a[2]>=.3)clipped.push(a);if((a[2]>=.3)!==(b[2]>=.3))clipped.push(lerp(a,b,(.3-a[2])/(b[2]-a[2])));}p=clipped;}
    if(p.length<3)continue;p=p.map(v=>[w/2+v[0]/v[2]*focal,h/2-v[1]/v[2]*focal,v[2]] as V);
    if(p.every(v=>v[0]<0)||p.every(v=>v[0]>w)||p.every(v=>v[1]<0)||p.every(v=>v[1]>h))continue;
    const shade=.70+.1*Math.max(n[1],0)+.25*Math.max(dot(n,light),0)+.07*Math.max(dot(n,fill),0),fog=Math.max(0,Math.min(1,(Math.hypot(...sub(eye,center))-38)/62))*.48;
    const c=face.c.map((v,i)=>Math.round(Math.min(1,v*shade*(1-fog)+[.81,.91,.92][i]*fog)*255));const color=(255<<24)|(c[2]<<16)|(c[1]<<8)|c[0];
    for(let j=1;j<p.length-1;j++)triangle(p[0],p[j],p[j+1],color);
   }
   ctx.putImageData(image,0,0);
  },dispose(){}
 };
}

export default function CityScene(props:Settings){
 const canvasRef=useRef<HTMLCanvasElement>(null),settings=useRef(props);settings.current=props;const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;const faces=createWorld();let renderer:Renderer|null=null;
  try{renderer=gpu(canvas,faces)??software(canvas,faces);}catch{setFailed(true);}if(!renderer){setFailed(true);return;}
  let frame=0,stopped=false,clock=0,lastTime=0,lastDraw=0,progress=settings.current.progress,tilt=0,drag=0,dragY=0,pointerX=0,pointerY=0,dragging=false,lastX=0,lastY=0,reset=settings.current.reset,dirty=true;
  const resize=()=>{renderer!.resize();dirty=true;};const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const down=(e:PointerEvent)=>{if(settings.current.blocked||e.pointerType!=='mouse')return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(settings.current.blocked)return;if(dragging){drag=Math.max(-.48,Math.min(.48,drag+(e.clientX-lastX)*.003));dragY=Math.max(-2,Math.min(2,dragY+(e.clientY-lastY)*.012));lastX=e.clientX;lastY=e.clientY;dirty=true;}else if(e.pointerType==='mouse'){pointerX=(e.clientX/window.innerWidth-.5)*2;pointerY=(e.clientY/window.innerHeight-.5)*2;}};
  const up=()=>{dragging=false;};const key=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();drag=e.key==='Home'?0:Math.max(-.48,Math.min(.48,drag+(e.key==='ArrowLeft'?-.08:.08)));dirty=true;};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('keydown',key);
  const lost=(e:Event)=>{e.preventDefault();setFailed(true);};canvas.addEventListener('webglcontextlost',lost);
  let lastSignature='';
  const render=(time:number)=>{
   if(stopped)return;frame=requestAnimationFrame(render);const dt=Math.min((time-lastTime)/1000,.08);lastTime=time;
   if(document.hidden||!canvas.width||settings.current.blocked)return;
   const s=settings.current;if(reset!==s.reset){drag=0;dragY=0;reset=s.reset;dirty=true;}
   const signature=`${s.progress.toFixed(4)},${s.still},${s.balanced},${drag},${dragY}`;if(signature!==lastSignature){dirty=true;lastSignature=signature;}
   if(time-lastDraw<(canvas.dataset.renderer==='software-3d'?45:24))return;
   const delta=s.progress-progress;progress=s.still?s.progress:Math.abs(delta)<.0002?s.progress:progress+delta*Math.min(dt*12,1);if(Math.abs(delta)>.0002)dirty=true;
   const targetTilt=s.balanced?0:.2;if(Math.abs(tilt-targetTilt)>.0002){tilt=s.still?targetTilt:tilt+(targetTilt-tilt)*Math.min(dt*7,1);dirty=true;}
   if(s.still&&!dirty)return;dirty=false;lastDraw=time;if(!s.still)clock+=dt;
   const i=Math.min(4,Math.floor(progress)),t=smooth(Math.max(0,Math.min(1,progress-i))),a=stops[i],b=stops[i+1];let eye=lerp(a.eye,b.eye,t),target=lerp(a.target,b.target,t);
   const mobile=canvas.clientWidth<760;if(mobile){const dv=sub(eye,target);const anchor=lerp(a.anchor,b.anchor,t);target[0]=anchor[0];target[1]+=1.9;eye=add(target,scale(dv,1.35));}
   const dv=sub(eye,target);eye=add(target,[dv[0]*Math.cos(drag)+dv[2]*Math.sin(drag),dv[1]+dragY,-dv[0]*Math.sin(drag)+dv[2]*Math.cos(drag)]);
   if(!s.still){eye[0]+=pointerX*.32;eye[1]-=pointerY*.13;}
   const matrices=[I(),mul(translation(0,6.45,3),rotation(tilt)),translation(-2.65*Math.cos(tilt),6.45-2.65*Math.sin(tilt),3),translation(2.65*Math.cos(tilt),6.45+2.65*Math.sin(tilt),3),translation(Math.sin(clock*.06)*.8,0,0)];
   renderer!.draw(eye,target,matrices);
   const index=Math.round(s.progress),anchor=stops[index].anchor,v=sub(anchor,eye),forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),z=dot(v,forward),f=canvas.clientHeight/(2*Math.tan(43*Math.PI/360));
   const marker=document.getElementById('world-hotspot');if(marker){const x=canvas.clientWidth/2+dot(v,right)/z*f,y=canvas.clientHeight/2-dot(v,up)/z*f;marker.style.left=`${x}px`;marker.style.top=`${y}px`;marker.style.visibility=z>.2&&x>70&&x<canvas.clientWidth-70&&y>95&&y<canvas.clientHeight-150?'visible':'hidden';}
   canvas.dataset.camera=eye.map(v=>v.toFixed(2)).join(',');canvas.dataset.progress=progress.toFixed(3);canvas.dataset.balance=s.balanced?'balanced':'tilted';canvas.dataset.ready='true';
  };frame=requestAnimationFrame(render);
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();renderer?.dispose();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost);};
 },[]);
 return <><canvas ref={canvasRef} className="city-canvas" tabIndex={0} role="img" aria-label="Kota tiga dimensi: sekolah, timbangan hak dan kewajiban, galeri konstitusi, dan ruang keadilan. Gulir untuk berpindah. Seret dengan tetikus atau gunakan panah kiri dan kanan untuk mengubah sudut pandang."/>{failed&&<div className="render-notice" role="status">Tampilan kota tidak tersedia. Semua materi tetap dapat dibuka melalui navigasi di bawah.</div>}</>;
}
