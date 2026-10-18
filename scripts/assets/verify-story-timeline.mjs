import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(new URL('../../app/story-playback.ts',import.meta.url));
const source=readFileSync(new URL('../../app/story-playback.ts',import.meta.url),'utf8');
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const mod={exports:{}};new Function('require','module','exports',output)(require,mod,mod.exports);
const {createStoryPlayback,storyScenes,beatAt}=mod.exports;
const originalAnchors=JSON.parse(readFileSync(new URL('../../app/story-anchors.json',import.meta.url),'utf8'));
const lessonAnchors=JSON.parse(readFileSync(new URL('../../app/lesson-anchors.json',import.meta.url),'utf8'));
const anchors={fps:originalAnchors.fps,rooms:[...originalAnchors.rooms,...lessonAnchors.rooms]};
assert.equal(storyScenes.length,7);let actors=0;
for(const [room,s] of storyScenes.entries()){
 actors+=Object.keys(s.actors).length;
 let end=0;
 for(const beat of s.beats){
  assert(beat.start>end&&beat.end>beat.start&&beat.end<=s.duration,`${s.id}: overlapping or invalid dialogue`);
  assert(s.actors[beat.actor],`${s.id}: missing speaker`);assert.equal(beatAt(room,(beat.start+beat.end)/2)?.actor,beat.actor);end=beat.end;
 }
 for(const [name,a] of Object.entries(s.actors)){
  assert.equal(a.keys[0][0],0);assert.equal(a.keys.at(-1)[0],s.duration);
  assert(a.keys.every((k,i)=>i===0||k[0]>a.keys[i-1][0]));
  const points=anchors.rooms[room][name];assert.equal(points.length,s.duration*anchors.fps+1);
  assert(points.every(p=>p.length===3&&p.every(Number.isFinite)));
 }
 const playback=createStoryPlayback();playback.select(room);const revision=playback.getSnapshot().revision;
 playback.sync(s.duration+10,true);assert.equal(playback.getSnapshot().ended,true);assert.equal(playback.getSnapshot().time,s.duration);
 playback.restart();assert.equal(playback.getSnapshot().time,0);assert.equal(playback.getSnapshot().ended,false);assert.equal(playback.getSnapshot().revision,revision+1);
 playback.sync(1,true);assert.equal(beatAt(room,playback.getSnapshot().time)?.actor,s.beats[0].actor);
 playback.select((room+1)%7);assert.equal(playback.getSnapshot().time,0);assert.equal(playback.getSnapshot().ready,false);
}
assert.equal(actors,24);
const social=storyScenes[0];
assert.deepEqual(social.beats.map(b=>b.actor),['Dio','Raka','Seno','Mira']);
for(const name of ['Raka','Mira']){
 const start=anchors.rooms[0][name][0],end=anchors.rooms[0][name].at(-1);
 assert(Math.hypot(start[0]-end[0],start[2]-end[2])>.5,`${name} must approach or leave`);
 assert(start[1]-end[1]>.3,`${name} must sit`);
}
assert(social.actors.Mira.keys.find(k=>k[4]===1)[0]<social.beats.find(b=>b.actor==='Mira').start);
for(const [i,names] of [[4,['Arga','Intan','Bayu','Arga']],[5,['Lila','Fajar','Ratih','Fajar','Lila']],[6,['Arif','Sari','Laras','Hasan']]])assert.deepEqual(storyScenes[i].beats.map(b=>b.actor),names);
for(const [room,names] of [[4,['Arga','Bayu']],[5,['Fajar','Ratih']],[6,['Arif','Sari','Laras','Hasan']]])for(const name of names){const points=anchors.rooms[room][name];assert(Math.hypot(points[0][0]-points.at(-1)[0],points[0][2]-points.at(-1)[2])>.5,`${name} must move in the scene`);}
assert(storyScenes[6].actors.Hasan.keys.find(k=>k[4]===1)[0]<=storyScenes[6].beats.at(-1).start);
console.log('PASS: seven timelines, 24 moving head anchors, ordered speakers, seating, replay after ending, and room reset.');
