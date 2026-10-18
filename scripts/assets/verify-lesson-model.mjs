import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(resolve(process.argv[2]||'../story-tools','package.json'));
const {NodeIO}=require('@gltf-transform/core'),{ALL_EXTENSIONS}=require('@gltf-transform/extensions'),draco3d=require('draco3dgltf');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const root=(await io.read('public/stories/lessons.glb')).getRoot();
assert.equal(root.listSkins().length,10);assert.equal(root.listAnimations().length,10);
const movements={};
for(const animation of root.listAnimations()){
 assert(animation.getName().startsWith('Scene_'));
 let duration=0,travel=0,bones=0;
 for(const channel of animation.listChannels()){
  const sampler=channel.getSampler(),times=sampler.getInput().getArray();duration=Math.max(duration,times[times.length-1]);
  if(channel.getTargetNode().getName().includes('__'))bones++;
  if(channel.getTargetPath()==='translation'&&channel.getTargetNode().getName().startsWith('Rig_')){
   const a=sampler.getOutput().getArray();let d=0;for(let i=3;i<a.length;i+=3)d+=Math.hypot(a[i]-a[i-3],a[i+1]-a[i-2],a[i+2]-a[i-1]);travel+=d;
  }
 }
 assert(duration>=28,animation.getName()+': incomplete timeline');assert(bones>=4,animation.getName()+': missing articulated motion');
 movements[animation.getName().slice(6)]=Number(travel.toFixed(2));
}
for(const name of ['Arga','Bayu','Lila','Fajar','Ratih','Arif','Sari','Laras','Hasan'])assert(movements[name]>.3,name+': root must change position');
console.log('PASS: 10 articulated full-length clips. Travel in metres:',JSON.stringify(movements));
