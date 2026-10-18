/** A small CPU cube-map viewer for browsers without a WebGL context.
 * It uses the exact Blender room renders and the live tour's camera angles.
 * Only changed frames are painted; still rooms use no pixel-rendering work.
 */
export function createStoryPanorama(host:HTMLElement){
 const canvas=document.createElement('canvas');canvas.className='panorama-canvas';host.appendChild(canvas);
 const ctx=canvas.getContext('2d',{alpha:false})!;
 const size=1024,faces=['px','nx','py','ny','pz','nz'];
 const maps=new Map<number,(Uint32Array|undefined)[]>();let dead=false,version=0;
 const movies=new Map<number,{video:HTMLVideoElement;surface:HTMLCanvasElement;ctx:CanvasRenderingContext2D;tick:number;revision:number}>();
 function movie(room:number){
  if(movies.has(room))return;const video=document.createElement('video');video.muted=true;video.loop=false;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.className='panorama-motion-source';video.dataset.room=String(room);video.src=`stories/${room}-motion.mp4?v=${room>=4?'lesson-02':'stage-03'}`;host.appendChild(video);
  const surface=document.createElement('canvas');surface.width=surface.height=size;movies.set(room,{video,surface,ctx:surface.getContext('2d',{willReadFrequently:true})!,tick:-1,revision:-1});
 }
 function animate(room:number,running:boolean,revision:number,time:number){
  movie(room);
  for(const [id,m] of movies){
   if(id===room&&m.revision!==revision&&m.video.readyState>=1){m.video.currentTime=Math.min(time,Math.max(0,m.video.duration-.01));m.tick=-1;m.revision=revision;}
   if(id===room&&running&&m.video.readyState>=2&&!m.video.ended){if(m.video.paused)void m.video.play().catch(()=>{});}else m.video.pause();
   const tick=Math.floor(m.video.currentTime*24);
   if(id===room&&m.video.readyState>=2&&m.tick!==tick){m.ctx.drawImage(m.video,0,0,size,size);const textures=maps.get(room);if(textures){textures[5]=new Uint32Array(m.ctx.getImageData(0,0,size,size).data.buffer);version++;m.tick=tick;}}
   if(Math.abs(id-room)>1){m.video.pause();m.video.removeAttribute('src');m.video.load();m.video.remove();movies.delete(id);}
  }
 }
 let width=1,height=1,aspect=1,output:ImageData,pixels:Uint32Array,lastKey='';
 function load(room:number){
  if(room>6||maps.has(room))return;const textures:(Uint32Array|undefined)[]=new Array(6);maps.set(room,textures);
  faces.forEach((face,i)=>{const img=new Image();img.onload=()=>{if(dead)return;const off=document.createElement('canvas');off.width=off.height=size;const c=off.getContext('2d',{willReadFrequently:true})!;c.drawImage(img,0,0,size,size);textures[i]=new Uint32Array(c.getImageData(0,0,size,size).data.buffer);version++;};img.src=`stories/${room}-cube-${face}.jpg?v=${room>=4?'lesson-02':'stage-03'}`;});
 }
 const resize=(w:number,h:number)=>{aspect=w/Math.max(1,h);width=Math.min(960,Math.round(w));height=Math.max(1,Math.round(width/aspect));canvas.width=width;canvas.height=height;output=ctx.createImageData(width,height);pixels=new Uint32Array(output.data.buffer);lastKey='';};
 const render=(yaw:number,fov:number,room:number,blend:number,running=false,revision=0,time=0,pitch=0)=>{
  load(room);load(room+1);animate(room,running,revision,time);const current=movies.get(room)!,state={time:current.video.readyState>=2?current.video.currentTime:time,ready:current.video.readyState>=2,ended:current.video.ended};const a=maps.get(room),b=maps.get(room+1);
  const key=[yaw.toFixed(4),pitch.toFixed(4),fov.toFixed(3),room,blend.toFixed(3),version].join(':');if(key===lastKey||!output)return state;lastKey=key;
  const tan=Math.tan(fov*Math.PI/360),sin=Math.sin(yaw),cos=Math.cos(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),mix=Math.round(blend*256),inv=256-mix;
  let at=0;
  for(let y=0;y<height;y++){
   const dy=(1-(y+.5)/height*2)*tan,ry=dy*cp+sp,zLocal=dy*sp-cp,ay=Math.abs(ry);
   for(let x=0;x<width;x++){
    const dx=((x+.5)/width*2-1)*tan*aspect,rx=dx*cos-zLocal*sin,rz=dx*sin+zLocal*cos,ax=Math.abs(rx),az=Math.abs(rz);
    let face:number,u:number,v:number;
    if(ax>=ay&&ax>=az){face=rx>0?0:1;u=(rx>0?rz:-rz)/ax;v=-ry/ax;}
    else if(ay>=az){face=ry>0?2:3;u=rx/ay;v=(ry>0?-rz:rz)/ay;}
    else{face=rz>0?4:5;u=(rz>0?-rx:rx)/az;v=-ry/az;}
    const tx=Math.max(0,Math.min(size-1,Math.floor((u+1)*.5*size))),ty=Math.max(0,Math.min(size-1,Math.floor((v+1)*.5*size))),p=ty*size+tx;
    const c1=a?.[face]?.[p]??0xffe5edef,c2=b?.[face]?.[p]??c1;
    if(mix===0)pixels[at++]=c1;
    else pixels[at++]=0xff000000|(((((c1&255)*inv+(c2&255)*mix)>>8)&255))|(((((c1>>>8&255)*inv+(c2>>>8&255)*mix)>>8)&255)<<8)|(((((c1>>>16&255)*inv+(c2>>>16&255)*mix)>>8)&255)<<16);
   }
  }
  ctx.putImageData(output,0,0);return state;
 };
 const pause=()=>movies.forEach(m=>m.video.pause());
 return {resize,render,pause,dispose:()=>{dead=true;pause();movies.forEach(m=>{m.video.removeAttribute('src');m.video.load();m.video.remove();});movies.clear();maps.clear();canvas.remove();}};
}
