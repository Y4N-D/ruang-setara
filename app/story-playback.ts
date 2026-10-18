import choreography from './story-choreography.json';
import lessonChoreography from './lesson-choreography.json';
export type StoryBeat={actor:string;start:number;end:number;text:string};
export const storyScenes=[...choreography,...lessonChoreography];
export const beatAt=(room:number,time:number):StoryBeat|undefined=>storyScenes[room].beats.find(b=>time>=b.start&&time<=b.end);
export const momentAt=(room:number,time:number)=>storyScenes[room].moments.reduce((text,m)=>time>=Number(m[0])?String(m[1]):text,'');
export type PlaybackSnapshot={room:number;time:number;revision:number;ready:boolean;ended:boolean};
/** Shared clock for actors, bubbles, panorama and replay controls. */
export function createStoryPlayback(){
 let state:PlaybackSnapshot={room:0,time:0,revision:0,ready:false,ended:false};
 const listeners=new Set<()=>void>();let publishedTime=-1;
 const publish=(next:PlaybackSnapshot)=>{state=next;listeners.forEach(fn=>fn());};
 return {
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  getSnapshot:()=>state,
  select(room:number){if(room===state.room)return;publishedTime=-1;publish({room,time:0,revision:state.revision+1,ready:false,ended:false});},
  restart(){publishedTime=-1;publish({...state,time:0,revision:state.revision+1,ended:false});},
  sync(time:number,ready:boolean){
   time=Math.max(0,Math.min(storyScenes[state.room].duration,time));const ended=time>=storyScenes[state.room].duration-.04;
   if(Math.abs(time-publishedTime)<.09&&ready===state.ready&&ended===state.ended)return;
   publishedTime=time;publish({...state,time,ready,ended});
  }
 };
}
export type StoryPlayback=ReturnType<typeof createStoryPlayback>;
