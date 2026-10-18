import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {stat} from 'node:fs/promises';
const require=createRequire(resolve(process.argv[2]||'.','package.json'));
const {NodeIO}=require('@gltf-transform/core'),{ALL_EXTENSIONS}=require('@gltf-transform/extensions'),{draco,dedup,textureCompress,resample}=require('@gltf-transform/functions');
const draco3d=require('draco3dgltf'),sharp=require('sharp');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.encoder':await draco3d.createEncoderModule(),'draco3d.decoder':await draco3d.createDecoderModule()});
const path=resolve('public/stories/choices.glb');let doc=await io.read(path);
if(!process.argv.includes('--verify-only')){
 for(const animation of doc.getRoot().listAnimations())for(const channel of animation.listChannels()){
  const accessor=channel.getSampler().getOutput(),array=accessor.getArray(),size=accessor.getElementSize(),kind=channel.getTargetPath();
  if(!['translation','rotation','scale'].includes(kind))continue;
  let constant=true;for(let i=size;i<array.length;i++)if(Math.abs(array[i]-array[i%size])>1e-6){constant=false;break;}
  if(constant){const value=Array.from(array.slice(0,size)),node=channel.getTargetNode();if(kind==='translation')node.setTranslation(value);if(kind==='rotation')node.setRotation(value);if(kind==='scale')node.setScale(value);channel.dispose();}
 }
 await doc.transform(resample({tolerance:1e-5}),dedup(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:87,effort:30}),draco({method:'edgebreaker',quantizePosition:14,quantizeNormal:10,encodeSpeed:3,decodeSpeed:7}));
 await io.write(path,doc);doc=await io.read(path);
}
const root=doc.getRoot(),report={bytes:(await stat(path)).size,skins:root.listSkins().length,animations:root.listAnimations().map(a=>({name:a.getName(),tracks:a.listChannels().length})),actors:root.listNodes().filter(n=>n.getName().startsWith('Actor_')).length};
if(report.skins!==14||report.animations.length!==14||report.actors!==14||report.animations.some(a=>a.tracks<4))throw new Error('Missing character rig or motion');
console.log(JSON.stringify(report));
