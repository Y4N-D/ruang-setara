// Build-time tools only: install @gltf-transform/{core,extensions,functions}@4.2.1
// and draco3dgltf@1.5.7 into an external toolchain folder. Pass that folder below.
// Run after build-choices.py and optimize-choices.py; runtime needs no npm additions.
import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(resolve(process.argv[2],'package.json'));
const {NodeIO}=await import(require.resolve('@gltf-transform/core'));
const {ALL_EXTENSIONS}=await import(require.resolve('@gltf-transform/extensions'));
const {draco,dedup}=await import(require.resolve('@gltf-transform/functions'));
const {default:draco3d}=await import(require.resolve('draco3dgltf'));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.encoder':await draco3d.createEncoderModule(),'draco3d.decoder':await draco3d.createDecoderModule()});
const file=resolve(dirname(fileURLToPath(import.meta.url)),'../../public/stories/choices.glb');
const document=await io.read(file);
await document.transform(dedup(),draco({method:'edgebreaker',quantizePosition:14,quantizeNormal:10,encodeSpeed:3,decodeSpeed:7}));
await io.write(file,document);
const verified=await io.read(file);
console.log(JSON.stringify({meshes:verified.getRoot().listMeshes().length,nodes:verified.getRoot().listNodes().length,actors:verified.getRoot().listNodes().filter(n=>n.getName().startsWith('Actor_')).length,heads:verified.getRoot().listNodes().filter(n=>n.getName().startsWith('Head_')).length}));
