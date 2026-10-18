"use client";
import { useEffect, useRef, useState } from "react";
import { Scale } from "lucide-react";

type V = [number,number,number];
type M = Float32Array;
type Mesh = {data:number[];color:V;group?:number;doubleSided?:boolean};
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a:M,b:M){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
const translate=(x:number,y:number,z:number)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m;};
const rotY=(a:number)=>new Float32Array([Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1]);
const rotZ=(a:number)=>new Float32Array([Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1]);
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:V):V=>{const l=Math.hypot(...a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
const add=(a:V,b:V):V=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(v:V,s:number):V=>[v[0]*s,v[1]*s,v[2]*s];
function lookAt(eye:V,target:V){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function perspective(aspect:number){const f=1/Math.tan(34*Math.PI/360),n=.1,far=100;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0]);}
function triangle(data:number[],a:V,b:V,c:V,na?:V,nb?:V,nc?:V){const n=norm(cross(sub(b,a),sub(c,a)));if(na&&nb&&nc&&dot(n,add(add(na,nb),nc))<0){data.push(...a,...na,...c,...nc,...b,...nb);}else data.push(...a,...(na??n),...b,...(nb??n),...c,...(nc??n));}
function cylinder(a:V,b:V,ra:number,rb:number,color:V,group=0):Mesh{
 const data:number[]=[],axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u),len=Math.hypot(...sub(b,a));
 for(let i=0;i<48;i++){const angle=i/48*Math.PI*2,next=(i+1)/48*Math.PI*2;const d1=add(scale(u,Math.cos(angle)),scale(v,Math.sin(angle))),d2=add(scale(u,Math.cos(next)),scale(v,Math.sin(next)));const p1=add(a,scale(d1,ra)),p2=add(a,scale(d2,ra)),p3=add(b,scale(d1,rb)),p4=add(b,scale(d2,rb));const n1=norm(add(d1,scale(axis,(ra-rb)/len))),n2=norm(add(d2,scale(axis,(ra-rb)/len)));triangle(data,p1,p3,p2,n1,n1,n2);triangle(data,p2,p3,p4,n2,n1,n2);triangle(data,a,p2,p1,scale(axis,-1),scale(axis,-1),scale(axis,-1));triangle(data,b,p3,p4,axis,axis,axis);}return{data,color,group};
}
function sphere(center:V,r:number,color:V,group=0):Mesh{const data:number[]=[];const pt=(u:number,v:number):V=>[Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u)];for(let j=0;j<20;j++)for(let i=0;i<32;i++){const n=[pt(i/32*2*Math.PI,j/20*Math.PI),pt((i+1)/32*2*Math.PI,j/20*Math.PI),pt(i/32*2*Math.PI,(j+1)/20*Math.PI),pt((i+1)/32*2*Math.PI,(j+1)/20*Math.PI)];const p=n.map(v=>add(center,scale(v,r)));triangle(data,p[0],p[2],p[1],n[0],n[2],n[1]);triangle(data,p[1],p[2],p[3],n[1],n[2],n[3]);}return{data,color,group};}
function torus(center:V,r:number,t:number,color:V,group=0):Mesh{const data:number[]=[];const sample=(u:number,v:number)=>{const n:V=[Math.cos(u)*Math.cos(v),Math.sin(v),Math.sin(u)*Math.cos(v)];return{p:add(center,[(r+t*Math.cos(v))*Math.cos(u),t*Math.sin(v),(r+t*Math.cos(v))*Math.sin(u)] as V),n};};for(let i=0;i<48;i++)for(let j=0;j<12;j++){const a=sample(i/48*2*Math.PI,j/12*2*Math.PI),b=sample((i+1)/48*2*Math.PI,j/12*2*Math.PI),c=sample(i/48*2*Math.PI,(j+1)/12*2*Math.PI),d=sample((i+1)/48*2*Math.PI,(j+1)/12*2*Math.PI);triangle(data,a.p,b.p,c.p,a.n,b.n,c.n);triangle(data,b.p,d.p,c.p,b.n,d.n,c.n);}return{data,color,group};}
function bowl(center:V,color:V,group:number):Mesh{const data:number[]=[];const sample=(angle:number,v:number)=>{const r=.63*v,y=.29*v*v;return {p:add(center,[r*Math.cos(angle),y,r*Math.sin(angle)]),n:norm([-.58*v*Math.cos(angle),.63,-.58*v*Math.sin(angle)] as V)};};for(let i=0;i<48;i++)for(let j=0;j<12;j++){const a=sample(i/48*2*Math.PI,j/12),b=sample((i+1)/48*2*Math.PI,j/12),c=sample(i/48*2*Math.PI,(j+1)/12),d=sample((i+1)/48*2*Math.PI,(j+1)/12);triangle(data,a.p,c.p,b.p,a.n,c.n,b.n);triangle(data,b.p,c.p,d.p,b.n,c.n,d.n);}return{data,color,group,doubleSided:true};}

function createMeshes(){
 const blue:V=[.29,.58,.81],deep:V=[.18,.42,.64],mint:V=[.41,.72,.70],yellow:V=[.98,.75,.32],coral:V=[.96,.49,.38],ivory:V=[.94,.98,1],lilac:V=[.67,.69,.88];
 const meshes:Mesh[]=[];const push=(...m:Mesh[])=>meshes.push(...m);
 push(cylinder([0,-.16,0],[0,.03,0],1.55,1.55,[.75,.85,.96]),cylinder([0,.03,0],[0,.16,0],1.52,1.5,[.89,.94,.99]),torus([0,.03,0],1.51,.03,ivory));
 push(cylinder([0,.17,0],[0,.32,0],.91,.91,lilac),cylinder([0,.32,0],[0,.42,0],.9,.75,[.79,.8,.94]),torus([0,.33,0],.86,.055,[.89,.89,.99]));
 push(cylinder([0,.42,0],[0,.62,0],.38,.27,deep),cylinder([0,.61,0],[0,3.36,0],.175,.15,blue),cylinder([0,3.2,0],[0,3.4,0],.245,.245,deep));
 push(torus([0,.63,0],.185,.035,yellow),torus([0,1.03,0],.173,.02,mint),sphere([0,3.65,0],.19,yellow),sphere([0,3.42,.04],.255,mint));
 push(cylinder([-1.89,0,0],[1.89,0,0],.095,.095,deep,1),cylinder([-1.8,.07,0],[1.8,.07,0],.05,.05,blue,1),sphere([-1.89,0,0],.13,yellow,1),sphere([1.89,0,0],.13,yellow,1));
 for(const [group,color] of [[2,coral],[3,yellow]] as [number,V][]){
  push(sphere([0,-.08,0],.08,mint,group),bowl([0,-1.55,0],color,group),torus([0,-1.26,0],.63,.055,color,group));
  for(let k=0;k<3;k++){const a=k*Math.PI*2/3+Math.PI/2;push(cylinder([0,-.1,0],[Math.cos(a)*.60,-1.25,Math.sin(a)*.60],.018,.018,[.46,.62,.7],group));}
  push(cylinder([0,-1.47,0],[0,-1.2,0],.22,.22,group===2?mint:blue,group),sphere([0,-1.2,0],.22,group===2?mint:blue,group),torus([0,-1.02,0],.09,.025,ivory,group));
 }
 return meshes;
}

// Software projection uses the same 3D meshes when a device cannot create WebGL.
function softwareScene(canvas:HTMLCanvasElement,settings:{current:{paused:boolean;balanced:boolean;resetKey:number}}){
 const ctx=canvas.getContext("2d");if(!ctx)return null;
 canvas.dataset.renderer="software-3d";
 type Face={points:V[];normal:V;center:V;color:V;group:number;doubleSided:boolean;layer:number};
 const faces:Face[]=[];
 for(const [meshIndex,mesh] of createMeshes().entries())for(let i=0;i<mesh.data.length;i+=18){const d=mesh.data,points:V[]=[[d[i],d[i+1],d[i+2]],[d[i+6],d[i+7],d[i+8]],[d[i+12],d[i+13],d[i+14]]];const normal=norm([d[i+3]+d[i+9]+d[i+15],d[i+4]+d[i+10]+d[i+16],d[i+5]+d[i+11]+d[i+17]]);faces.push({points,normal,center:scale(add(add(points[0],points[1]),points[2]),1/3),color:mesh.color,group:mesh.group??0,doubleSided:!!mesh.doubleSided,layer:Math.min(meshIndex,7)});}
 const transform=(m:M,v:V):V=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
 const direction=(m:M,v:V):V=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2],m[1]*v[0]+m[5]*v[1]+m[9]*v[2],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]];
 let frame=0,stopped=false,visible=true,dragging=false,lastX=0,lastY=0,startX=0,startY=0,dragAngle=0,elevation=0,tilt=0,clock=0,lastTime=0,lastDraw=0,dirty=true,lastReset=settings.current.resetKey,lastBalanced=settings.current.balanced,lastPaused=settings.current.paused;
 const down=(e:PointerEvent)=>{dragging=true;lastX=startX=e.clientX;lastY=startY=e.clientY;};
 const move=(e:PointerEvent)=>{if(!dragging)return;if(Math.abs(e.clientX-startX)>Math.abs(e.clientY-startY)+5||e.pointerType==="mouse"){canvas.setPointerCapture(e.pointerId);dragAngle+=(e.clientX-lastX)*.009;elevation=Math.max(-.8,Math.min(.8,elevation+(e.clientY-lastY)*.006));dirty=true;}lastX=e.clientX;lastY=e.clientY;};const up=()=>{dragging=false;};
 const key=(e:KeyboardEvent)=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home"].includes(e.key)){e.preventDefault();if(e.key==="ArrowLeft")dragAngle-=.18;if(e.key==="ArrowRight")dragAngle+=.18;if(e.key==="ArrowUp")elevation=Math.max(-.8,elevation-.1);if(e.key==="ArrowDown")elevation=Math.min(.8,elevation+.1);if(e.key==="Home"){dragAngle=0;elevation=0;}dirty=true;}};
 canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);canvas.addEventListener("keydown",key);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;dirty=true;});observer.observe(canvas);
 const resize=()=>{const ratio=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(canvas.clientWidth*ratio);canvas.height=Math.round(canvas.clientHeight*ratio);dirty=true;};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
 const light=norm([-3,6,5]),fillLight=norm([4,2,-2]);
 const render=(time:number)=>{
  if(stopped)return;frame=requestAnimationFrame(render);const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;if(!visible||document.hidden||!canvas.width||!canvas.height)return;
  const s=settings.current;if(s.resetKey!==lastReset){dragAngle=0;elevation=0;clock=0;lastReset=s.resetKey;dirty=true;}if(s.balanced!==lastBalanced||s.paused!==lastPaused){dirty=true;lastBalanced=s.balanced;lastPaused=s.paused;}
  if(!s.paused&&!dragging)clock+=dt;const target=s.balanced?0:.24;if(Math.abs(tilt-target)>.001){tilt=s.paused?target:tilt+(target-tilt)*Math.min(dt*5,1);dirty=true;}
  if(time-lastDraw<40||s.paused&&!dirty)return;lastDraw=time;dirty=false;
  const w=canvas.width,h=canvas.height,aspect=w/h,eye:V=[0,4.7+elevation,aspect<1.1?9.1:8.0],view=lookAt(eye,[0,1.95,0]),proj=perspective(aspect),vp=mul(proj,view),angle=-.28+dragAngle+(s.paused?0:Math.sin(clock*.3)*.12),root=rotY(angle);
  const matrices=[root,mul(root,mul(translate(0,3.4,0),rotZ(tilt))),mul(root,translate(-1.89*Math.cos(tilt),3.4-1.89*Math.sin(tilt),0)),mul(root,translate(1.89*Math.cos(tilt),3.4+1.89*Math.sin(tilt),0))];
  const project=(p:V):V=>{const x=vp[0]*p[0]+vp[4]*p[1]+vp[8]*p[2]+vp[12],y=vp[1]*p[0]+vp[5]*p[1]+vp[9]*p[2]+vp[13],z=vp[2]*p[0]+vp[6]*p[1]+vp[10]*p[2]+vp[14],d=vp[3]*p[0]+vp[7]*p[1]+vp[11]*p[2]+vp[15];return[(x/d*.5+.5)*w,(-y/d*.5+.5)*h,z/d];};
  const screenFaces:{p:V[];depth:number;color:string;layer:number}[]=[];
  for(const face of faces){const m=matrices[face.group],center=transform(m,face.center);let n=direction(m,face.normal);const viewVector=norm(sub(eye,center));if(dot(n,viewVector)<0){if(!face.doubleSided)continue;n=scale(n,-1);}const diffuse=Math.max(dot(n,light),0),fill=Math.max(dot(n,fillLight),0),spec=Math.pow(Math.max(dot(n,norm(add(light,viewVector))),0),45)*.22;const rgb=face.color.map(v=>Math.min(255,Math.round((v*(.57+.4*diffuse+.12*fill)+spec)*255)));const p=face.points.map(v=>project(transform(m,v)));screenFaces.push({p,layer:face.layer,depth:(p[0][2]+p[1][2]+p[2][2])/3,color:`rgb(${rgb.join(",")})`});}
  screenFaces.sort((a,b)=>a.layer-b.layer||b.depth-a.depth);ctx.clearRect(0,0,w,h);
  const shadow=project([0,-.15,0]);ctx.save();ctx.translate(shadow[0],shadow[1]);ctx.scale(1,.27);const grad=ctx.createRadialGradient(0,0,0,0,0,w*.26);grad.addColorStop(0,"rgba(67,110,155,.16)");grad.addColorStop(1,"rgba(67,110,155,0)");ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,w*.26,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.lineWidth=.45;ctx.lineJoin="round";
  for(const face of screenFaces){ctx.fillStyle=ctx.strokeStyle=face.color;ctx.beginPath();ctx.moveTo(face.p[0][0],face.p[0][1]);ctx.lineTo(face.p[1][0],face.p[1][1]);ctx.lineTo(face.p[2][0],face.p[2][1]);ctx.closePath();ctx.fill();ctx.stroke();}
 };frame=requestAnimationFrame(render);
 return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);canvas.removeEventListener("keydown",key);};
}

export default function BalanceScene({paused,balanced,resetKey}:{paused:boolean;balanced:boolean;resetKey:number}){
 const canvasRef=useRef<HTMLCanvasElement>(null),settings=useRef({paused,balanced,resetKey});settings.current={paused,balanced,resetKey};const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;setFailed(false);const gl=canvas.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:false});if(!gl){const cleanup=softwareScene(canvas,settings);if(!cleanup)setFailed(true);return cleanup??undefined;}canvas.dataset.renderer="webgl";
  let program:WebGLProgram|null=null;const shaders:WebGLShader[]=[];const buffers:WebGLBuffer[]=[];let frame=0,disposed=false,visible=true,contextLost=false;
  try{
   const vs=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uView;uniform mat4 uProjection;varying vec3 vNormal;varying vec3 vWorld;void main(){vec4 world=uModel*vec4(aPosition,1.0);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uProjection*uView*world;}`;
   const fs=`precision mediump float;varying vec3 vNormal;varying vec3 vWorld;uniform vec3 uColor;uniform vec3 uEye;void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 light=normalize(vec3(-3.0,6.0,5.0));vec3 view=normalize(uEye-vWorld);float d=max(dot(n,light),0.0);float fill=max(dot(n,normalize(vec3(4.0,2.0,-2.0))),0.0);float spec=pow(max(dot(n,normalize(light+view)),0.0),52.0);float ao=0.94+0.06*smoothstep(0.1,1.0,vWorld.y);vec3 col=uColor*(0.57+0.40*d+0.12*fill)*ao+vec3(1.0,.98,.90)*spec*0.28;gl_FragColor=vec4(col,1.0);}`;
   const shader=(type:number,source:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error("Shader compilation failed");return s;};
   program=gl.createProgram()!;gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Shader link failed");gl.useProgram(program);
   const position=gl.getAttribLocation(program,"aPosition"),normal=gl.getAttribLocation(program,"aNormal"),model=gl.getUniformLocation(program,"uModel"),view=gl.getUniformLocation(program,"uView"),projection=gl.getUniformLocation(program,"uProjection"),color=gl.getUniformLocation(program,"uColor"),eyeUniform=gl.getUniformLocation(program,"uEye");
   const meshes=createMeshes().map(m=>{const buffer=gl.createBuffer()!;buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.data),gl.STATIC_DRAW);return{...m,buffer,count:m.data.length/6};});
   gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);
   let angle=-.28,dragAngle=0,tilt=0,dragging=false,lastX=0,lastY=0,startX=0,startY=0,moved=false,lastReset=resetKey,lastTime=0,clock=0,elevation=0;
   const down=(e:PointerEvent)=>{dragging=true;lastX=startX=e.clientX;lastY=startY=e.clientY;moved=false;};
   const move=(e:PointerEvent)=>{if(!dragging)return;if(Math.abs(e.clientX-startX)>Math.abs(e.clientY-startY)+5||e.pointerType==="mouse"){moved=true;canvas.setPointerCapture(e.pointerId);dragAngle+=(e.clientX-lastX)*.009;elevation=Math.max(-.8,Math.min(.8,elevation+(e.clientY-lastY)*.006));}lastX=e.clientX;lastY=e.clientY;};
   const up=()=>{dragging=false;};
   const key=(e:KeyboardEvent)=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home"].includes(e.key)){e.preventDefault();if(e.key==="ArrowLeft")dragAngle-=.18;if(e.key==="ArrowRight")dragAngle+=.18;if(e.key==="ArrowUp")elevation=Math.max(-.8,elevation-.1);if(e.key==="ArrowDown")elevation=Math.min(.8,elevation+.1);if(e.key==="Home"){dragAngle=0;elevation=0;}}};
   canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);canvas.addEventListener("keydown",key);
   const lost=(e:Event)=>{e.preventDefault();contextLost=true;setFailed(true);};canvas.addEventListener("webglcontextlost",lost);
   const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{threshold:0});observer.observe(canvas);
   const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);if(w&&h){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);}};const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
   const render=(time:number)=>{if(disposed)return;frame=requestAnimationFrame(render);const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;if(!visible||document.hidden||contextLost)return;
    if(lastReset!==settings.current.resetKey){dragAngle=0;elevation=0;clock=0;lastReset=settings.current.resetKey;}
    if(!settings.current.paused&&!dragging)clock+=dt;
    angle=-.28+dragAngle+(settings.current.paused?0:Math.sin(clock*.3)*.12);
    const target=settings.current.balanced?0:.24;tilt=settings.current.paused?target:tilt+(target-tilt)*Math.min(dt*4,1);
    const aspect=canvas.width/canvas.height;const distance=aspect<1.1?9.1:8.0;const eye:V=[0,4.7+elevation,distance];gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(view,false,lookAt(eye,[0,1.95,0]));gl.uniformMatrix4fv(projection,false,perspective(aspect));gl.uniform3fv(eyeUniform,eye);
    const root=rotY(angle),pivot=translate(0,3.4,0),beam=mul(pivot,rotZ(tilt));
    const groupMatrices=[root,mul(root,beam),mul(root,translate(-1.89*Math.cos(tilt),3.4-1.89*Math.sin(tilt),0)),mul(root,translate(1.89*Math.cos(tilt),3.4+1.89*Math.sin(tilt),0))];
    for(const m of meshes){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(model,false,groupMatrices[m.group??0]);gl.uniform3fv(color,m.color);gl.drawArrays(gl.TRIANGLES,0,m.count);}
   };frame=requestAnimationFrame(render);
   return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);canvas.removeEventListener("keydown",key);canvas.removeEventListener("webglcontextlost",lost);buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);};
  }catch(error){console.error("Scene initialization failed",error);setFailed(true);buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);}
 },[]);
 return <><canvas ref={canvasRef} className="scene-canvas" role="img" aria-label="Timbangan keadilan tiga dimensi. Geser ke samping untuk memutar. Gunakan tombol panah saat objek dipilih; Home mengatur ulang." tabIndex={0}/>{failed&&<div className="scene-fallback"><Scale size={60}/><b>{balanced?"Hak dan kewajiban berjalan seimbang":"Kewajiban diabaikan, hak orang lain terganggu"}</b><p>Tampilan 3D tidak tersedia pada perangkat ini. Materi dan simulasi melalui tombol tetap dapat digunakan.</p></div>}</>;
}
