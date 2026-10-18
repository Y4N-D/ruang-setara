export type V = [number, number, number];
export type Face = { p: V[]; n: V; c: V; group: number };
export const add = (a: V, b: V): V => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub = (a: V, b: V): V => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const dot = (a: V,b: V) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross = (a: V,b: V): V => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const scale = (a: V,s: number): V => [a[0]*s,a[1]*s,a[2]*s];
export const norm = (a: V): V => scale(a,1/(Math.hypot(...a)||1));
export const rgb = (hex: string): V => [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];
export const colors = {ivory:'#fff6df',peach:'#f3b39a',coral:'#e98c72',mint:'#a8d4b3',leaf:'#65a483',green:'#327b68',blue:'#6c9dab',navy:'#34566e',gold:'#f4c96f',lilac:'#b6afd1',white:'#fffaf1',sand:'#e9dfbd'};

// Every visible architectural element is a mesh in the shared world coordinates.
// WebGL and the software renderer use this same geometry and camera path.
export function createWorld(): Face[] {
 const faces: Face[]=[];
 const face=(p: V[], c: string, group=0, n?: V)=>faces.push({p,n:n??norm(cross(sub(p[1],p[0]),sub(p[2],p[0]))),c:rgb(c),group});
 const quad=(a:V,b:V,c:V,d:V,col:string,group=0)=>face([a,b,c,d],col,group);
 function box(x:number,y:number,z:number,w:number,h:number,d:number,c:string,group=0){
  const l=x-w/2,r=x+w/2,b=y,t=y+h,f=z+d/2,k=z-d/2;
  quad([l,b,f],[r,b,f],[r,t,f],[l,t,f],c,group);quad([r,b,k],[l,b,k],[l,t,k],[r,t,k],c,group);
  quad([r,b,f],[r,b,k],[r,t,k],[r,t,f],c,group);quad([l,b,k],[l,b,f],[l,t,f],[l,t,k],c,group);
  quad([l,t,f],[r,t,f],[r,t,k],[l,t,k],c,group);quad([l,b,k],[r,b,k],[r,b,f],[l,b,f],c,group);
 }
 function cylinder(a:V,b:V,ra:number,rb:number,c:string,segments=16,group=0){
  const axis=norm(sub(b,a)),u=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);
  for(let i=0;i<segments;i++){
   const ta=i/segments*Math.PI*2,tb=(i+1)/segments*Math.PI*2;
   const da=add(scale(u,Math.cos(ta)),scale(v,Math.sin(ta))),db=add(scale(u,Math.cos(tb)),scale(v,Math.sin(tb)));
   const p=add(a,scale(da,ra)),q=add(a,scale(db,ra)),r=add(b,scale(db,rb)),s=add(b,scale(da,rb));
   face([p,s,r,q],c,group,norm(add(da,db)));face([a,p,q],c,group,scale(axis,-1));face([b,r,s],c,group,axis);
  }
 }
 function ball(x:number,y:number,z:number,rx:number,ry:number,rz:number,c:string,group=0){
  const p=(u:number,v:number):V=>[x+Math.sin(v)*Math.cos(u)*rx,y+Math.cos(v)*ry,z+Math.sin(v)*Math.sin(u)*rz];
  for(let j=0;j<7;j++)for(let i=0;i<12;i++){
   const a=i/12*2*Math.PI,b=(i+1)/12*2*Math.PI,t=j/7*Math.PI,s=(j+1)/7*Math.PI;
   const pts=[p(a,t),p(a,s),p(b,s),p(b,t)];const center=scale(pts.reduce((acc,v)=>add(acc,v),[0,0,0] as V),.25);
   face(pts,c,group,norm([(center[0]-x)/rx,(center[1]-y)/ry,(center[2]-z)/rz]));
  }
 }
 function disk(x:number,y:number,z:number,r:number,c:string,rz=r){
  for(let i=0;i<48;i++){const a=i/48*2*Math.PI,b=(i+1)/48*2*Math.PI;face([[x,y,z],[x+Math.cos(b)*r,y,z+Math.sin(b)*rz],[x+Math.cos(a)*r,y,z+Math.sin(a)*rz]],c,0,[0,1,0]);}
 }
 function shadow(x:number,z:number,w:number,d:number){disk(x+.3,.027,z-.25,w,'#97bba4',d);disk(x+.15,.03,z-.15,w*.76,'#8caf98',d*.78);}
 function arch(x:number,y:number,z:number,w:number,h:number,c:string,depth=.12){
  const radius=w/2,cy=y+h-radius,points:V[]=[[x-radius,y,z],[x+radius,y,z],[x+radius,cy,z]];
  for(let i=1;i<=12;i++){const a=i/12*Math.PI;points.push([x+Math.cos(a)*radius,cy+Math.sin(a)*radius,z]);}
  points.push([x-radius,y,z]);face(points,c,0,[0,0,1]);
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];quad(a,add(a,[0,0,-depth]),add(b,[0,0,-depth]),b,c);}
 }
 function windowAt(x:number,y:number,z:number,w:number,h:number){arch(x,y,z,w+.18,h+.1,colors.ivory);arch(x,y+.09,z+.015,w-.04,h-.08,colors.blue);box(x,y+.09,z+.032,.055,h-w/2,.045,colors.ivory);box(x,y+h-w/2,z+.033,w,.045,.05,colors.ivory);box(x,y-.08,z+.10,w+.34,.14,.3,colors.ivory);}
 function roof(x:number,y:number,z:number,w:number,d:number,c:string){
  const l=x-w/2,r=x+w/2,k=z-d/2,f=z+d/2;
  quad([l,y,f],[r,y,f],[r-.45,y+.6,k+.65],[l+.45,y+.6,k+.65],c);
  face([[l,y,f],[l+.45,y+.6,k+.65],[l,y,k]],colors.coral);face([[r,y,k],[r-.45,y+.6,k+.65],[r,y,f]],colors.coral);
  box(x,y-.12,z,w+.32,.16,d+.22,colors.ivory);
  for(let i=0;i<Math.floor(w/.36);i++){const tx=l+.18+i*.36;cylinder([tx,y+.025,f],[tx,y+.61,k+.65],.022,.022,'#c77961',5);}
 }
 function tree(x:number,z:number,size=1,kind=0){
  shadow(x,z,1.22*size,.78*size);cylinder([x,0,z],[x,2.6*size,z],.13*size,.085*size,'#ac8c64',7);
  if(kind){ball(x,2.4*size,z,.75*size,1.7*size,.75*size,colors.leaf);ball(x-.24*size,2.2*size,z+.15,.52*size,1.05*size,.6*size,colors.mint);}
  else {ball(x-.42*size,2.5*size,z,.99*size,1.0*size,.93*size,colors.leaf);ball(x+.5*size,2.75*size,z-.25,.94*size,1.1*size,.89*size,colors.green);ball(x+.1*size,3.15*size,z+.25,.9*size,1.08*size,.95*size,colors.mint);}
 }
 function bench(x:number,z:number){box(x,.49,z,1.8,.16,.65,colors.coral);box(x,.73,z-.24,1.8,.47,.14,colors.peach);for(const dx of [-.63,.63])box(x+dx,.04,z,.09,.5,.48,colors.navy);}
 function lamp(x:number,z:number){cylinder([x,.05,z],[x,2.5,z],.065,.04,colors.navy,7);ball(x,2.63,z,.19,.23,.19,colors.ivory);cylinder([x,2.4,z],[x,2.46,z],.14,.14,colors.gold,10);}
 function person(x:number,z:number,c:string){shadow(x,z,.36,.2);for(const dx of [-.13,.13])cylinder([x+dx,.08,z],[x+dx,.56,z],.095,.09,colors.navy,7);cylinder([x,.5,z],[x,1.04,z],.22,.18,c,9);ball(x,1.24,z,.19,.22,.19,'#bf8868');ball(x,1.37,z-.025,.20,.12,.20,'#5c4a44');cylinder([x-.25,.85,z],[x-.32,.55,z+.04],.08,.065,c,7);cylinder([x+.25,.85,z],[x+.32,.55,z+.04],.08,.065,c,7);}
 // A continuous, gently raised city landscape and the promenade joining its districts.
 box(5,-1.35,-3,140,.18,120,'#d4e6cf');
 cylinder([5,-1.17,-3],[5,-.14,-3],27,27,'#9ec7ad',72);
 cylinder([5,-.14,-3],[5,0,-3],27.25,27.25,'#bbd9b7',72);
 const path=[[-24,4],[-16,4],[-8,6],[0,7],[9,5],[17,2],[27,3],[30,8]];
 for(let i=0;i<path.length-1;i++){const [a,b]=[path[i],path[i+1]],dir=norm([b[0]-a[0],0,b[1]-a[1]]),right:V=[dir[2]*1.1,0,-dir[0]*1.1];const pa:V=[a[0],.02,a[1]],pb:V=[b[0],.02,b[1]];quad(sub(pa,right),add(pa,right),add(pb,right),sub(pb,right),colors.sand);disk(a[0],.022,a[1],1.1,colors.sand);}
 for(const [x,z,s,k] of [[-23,-4,1.4,1],[-21,8,1.2,0],[-19,-12,1.3,1],[-6,-12,1.3,0],[-5,1,.9,0],[6,-12,1.35,1],[9,-14,1.25,0],[19,-14,1.4,0],[31,-7,1.35,1],[31,8,1.2,0],[13,11,1.15,0],[4,13,1.2,1],[-8,12,1.1,0],[21,10,1.2,1]] as number[][])tree(x,z,s,k);
 // The school: deep arcades, tiled roofs, a clock and an Indonesian flag.
 shadow(-13,-4,6.8,4.5);box(-13,0,-5,10.8,.26,7.2,colors.ivory);box(-13,.26,-5,10,5.3,5.9,colors.peach);
 for(const x of [-17,-15,-13,-11,-9]){windowAt(x,3.25,-1.995,1.04,1.65);arch(x,.28,-1.96,1.4,2.65,colors.ivory);arch(x,.28,-1.94,1.08,2.45,colors.navy);box(x,.3,-1.86,.06,1.82,.10,colors.peach);}
 box(-13,3.03,-1.88,10.5,.18,.44,colors.ivory);box(-13,5.38,-5,10.55,.24,6.2,colors.ivory);roof(-13,5.6,-5,10.7,6.4,colors.coral);
 box(-13,5.58,-4.3,2.8,1.12,2.6,colors.peach);roof(-13,6.7,-4.3,3.15,3,colors.coral);
 ball(-13,6.25,-2.955,.36,.36,.07,colors.ivory);box(-13,6.25,-2.87,.045,.23,.03,colors.navy);box(-12.89,6.22,-2.866,.24,.045,.03,colors.navy);
 for(const x of [-18.2,-7.8]){box(x,.3,-1.93,.38,3,.6,colors.ivory);box(x,2.98,-1.93,.58,.22,.8,colors.ivory);}
 for(let j=0;j<3;j++)box(-13,j*.10,-.7-j*.27,5-j*.25,.12,.85,colors.sand);
 cylinder([-19,.05,-.1],[-19,6.3,-.1],.045,.045,colors.ivory,8);quad([-19,6.15,-.1],[-17.5,6.03,-.05],[-17.5,5.61,-.05],[-19,5.73,-.1],'#dd6153');quad([-19,5.73,-.1],[-17.5,5.61,-.05],[-17.5,5.19,-.05],[-19,5.31,-.1],colors.white);
 bench(-9.1,1.3);tree(-19.2,-6,1.1);person(-14,.1,colors.lilac);person(-12.4,.45,colors.mint);
 // Central square and the moving rights-and-duties monument.
 disk(0,.045,3,5.15,colors.sand);disk(0,.05,3,4.85,colors.ivory);
 cylinder([0,.05,3],[0,.3,3],2.65,2.65,colors.lilac,40);cylinder([0,.3,3],[0,.48,3],2.42,2.42,colors.ivory,40);
 cylinder([0,.49,3],[0,.89,3],1.08,.98,colors.peach,32);cylinder([0,.89,3],[0,1.18,3],.63,.45,colors.gold,24);
 cylinder([0,1.18,3],[0,6.3,3],.21,.16,colors.blue,16);cylinder([0,1.25,3],[0,1.39,3],.29,.29,colors.gold,16);
 ball(0,6.48,3,.38,.38,.38,colors.gold);ball(0,7.02,3,.22,.26,.22,colors.coral);
 cylinder([-2.65,0,0],[2.65,0,0],.10,.1,colors.navy,12,1);ball(-2.65,0,0,.14,.14,.14,colors.gold,1);ball(2.65,0,0,.14,.14,.14,colors.gold,1);
 for(const group of [2,3]){
  for(let k=0;k<3;k++){const a=k*2*Math.PI/3;cylinder([0,0,0],[Math.cos(a)*.82,-1.84,Math.sin(a)*.82],.018,.018,colors.navy,5,group);}
  cylinder([0,-2.06,0],[0,-1.84,0],.54,.91,group===2?colors.coral:colors.gold,24,group);cylinder([0,-1.84,0],[0,-1.77,0],.91,.91,group===2?colors.peach:colors.ivory,24,group);
  ball(0,-1.51,0,.26,.3,.26,group===2?colors.mint:colors.blue,group);
 }
 bench(-4,6);bench(4.5,4.6);person(-3.5,6.2,colors.coral);lamp(4.5,7);lamp(-6,6.7);
 // An open civic gallery, with a three-dimensional book in its forecourt.
 shadow(14,-6,6.1,4);box(14,0,-6,9.8,.28,6.2,colors.ivory);box(14,.28,-6.65,8.6,4.9,4.9,colors.mint);
 for(const x of [10.7,12.9,15.1,17.3]){arch(x,.35,-4.145,1.9,3.92,colors.ivory);arch(x,.35,-4.12,1.45,3.64,colors.navy);}
 box(14,4.63,-6,10.2,.36,6.8,colors.ivory);box(14,5.0,-6,9.6,.32,6.4,colors.mint);box(14,5.32,-6,8.8,.15,5.8,colors.gold);
 for(const x of [9.3,18.7]){cylinder([x,.28,-3.55],[x,4.65,-3.55],.23,.2,colors.ivory,12);box(x,4.35,-3.55,.6,.23,.6,colors.ivory);}
 cylinder([14,.03,-.4],[14,.5,-.4],2.15,2.15,colors.lilac,32);box(14,.5,-.4,1.2,1.5,.9,colors.ivory);box(14,1.92,-.4,2.1,.14,1.3,colors.gold);
 const book=(side:number)=>{
  const center:V=[14,2.19,-.4],outer:V=[14+side*1.54,2.6,-.4];
  quad(add(center,[0,0,.95]),add(outer,[0,0,.95]),add(outer,[0,0,-.95]),add(center,[0,0,-.95]),colors.white);
  quad(add(center,[0,-.15,.99]),add(outer,[side*.09,-.15,.99]),add(outer,[side*.09,-.15,-.99]),add(center,[0,-.15,-.99]),colors.coral);
  quad(add(center,[0,-.13,.94]),add(outer,[0,-.13,.94]),add(outer,[0,0,.94]),add(center,[0,0,.94]),colors.sand);
  for(let i=0;i<5;i++){const dz=-.53+i*.27;const a=add(center,[side*.25,.075,dz]),b=add(center,[side*1.27,.345,dz]);cylinder(a,b,.018,.018,colors.blue,4);}
 };book(-1);book(1);tree(8.2,-5.2,.9,1);bench(19,0);person(16.6,1.1,colors.coral);
 // Hall of justice with real columns, steps and a triangular pediment.
 shadow(27,-4,6.5,4.7);for(let i=0;i<4;i++)box(27,i*.16,-3.0-i*.3,10.8-i*.3,.18,6.9-i*.32,colors.ivory);
 box(27,.64,-4.7,9.2,4.5,4.1,colors.lilac);arch(27,.66,-2.58,2.2,3.7,colors.ivory);arch(27,.66,-2.55,1.8,3.45,colors.navy);
 for(const x of [23.1,25,29,30.9]){cylinder([x,.7,-1.52],[x,4.94,-1.52],.27,.23,colors.ivory,16);box(x,.66,-1.52,.66,.23,.66,colors.ivory);box(x,4.62,-1.52,.74,.29,.74,colors.ivory);}
 box(27,4.95,-3.75,10.4,.42,6,colors.ivory);face([[21.6,5.37,-.69],[32.4,5.37,-.69],[27,7.5,-.69]],colors.peach,0,[0,0,1]);face([[22.15,5.54,-.66],[31.85,5.54,-.66],[27,7.19,-.66]],colors.ivory,0,[0,0,1]);
 quad([21.5,5.37,-.8],[27,7.5,-.8],[27,7.5,-6.8],[21.5,5.37,-6.8],colors.coral);quad([27,7.5,-.8],[32.5,5.37,-.8],[32.5,5.37,-6.8],[27,7.5,-6.8],colors.peach);
 ball(27,6.2,-.59,.38,.38,.10,colors.gold);box(27,5.87,-.46,.07,.65,.08,colors.navy);box(27,6.26,-.46,.8,.07,.08,colors.navy);
 tree(21,-4.2,.95,1);tree(33,-3.2,1.1,1);bench(30.9,2);person(25,1.5,colors.blue);lamp(23,3);
 // Smaller homes complete the city silhouette without crowding the learning stops.
 for(const [x,z,w,h,c] of [[-3,-10,4.2,3.8,colors.gold],[4,-9,4.1,4.5,colors.peach],[22,-11,3.6,3.6,colors.mint]] as [number,number,number,number,string][]){box(x,.02,z,w,h,3,c);roof(x,h,z,w+.25,3.4,colors.coral);for(const dx of [-1,1])windowAt(x+dx,1.8,z+1.52,.85,1.3);arch(x,.03,z+1.55,.8,1.6,colors.navy);}
 // Light sculpted clouds live in the same perspective scene.
 for(const [x,y,z,s] of [[-17,14,-23,1.8],[8,16,-29,2],[28,13,-25,1.6],[-29,11,1,1.4]] as number[][]){ball(x,y,z,s*1.6,s*.55,s*.63,colors.white,4);ball(x-.65*s,y+.4*s,z,s*.75,s*.8,s*.68,colors.white,4);ball(x+.6*s,y+.35*s,z,s*.9,s*.68,s*.7,colors.white,4);}
 return faces;
}

export const stops = [
 {id:'beranda',label:'Pusat kota',eye:[18,13,30],target:[3,3,-1],anchor:[0,7.2,3]},
 {id:'tantangan',label:'Sekolah',eye:[-20,7.7,15],target:[-16,2.8,-3],anchor:[-13,5.9,-1.8]},
 {id:'upaya',label:'Taman setara',eye:[5.5,7.7,15.7],target:[-2,3.1,2.5],anchor:[0,7.1,3]},
 {id:'ham',label:'Galeri hak',eye:[8.9,7.5,12.6],target:[10.4,2.4,-4],anchor:[14,2.8,-.4]},
 {id:'hukum',label:'Ruang keadilan',eye:[19.9,8.3,16.1],target:[22.1,3.3,-3.3],anchor:[27,6.3,-.6]},
 {id:'latihan',label:'Tantangan akhir',eye:[33,24,37],target:[5,1.5,-1.5],anchor:[0,7.2,3]},
] as {id:string;label:string;eye:V;target:V;anchor:V}[];
