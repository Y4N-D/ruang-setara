"use client";
import {useSyncExternalStore} from 'react';
import {Pause,Play,RotateCcw} from 'lucide-react';
import {storyActors} from './story-path';
import {beatAt,momentAt,storyScenes,type StoryPlayback} from './story-playback';
export default function StoryConversation({playback,active,paused}:{playback:StoryPlayback;active:boolean;paused:boolean}){
 const state=useSyncExternalStore(playback.subscribe,playback.getSnapshot,playback.getSnapshot),line=beatAt(state.room,state.time);
 const speaker=line&&storyActors[state.room].find(a=>a.id===line.actor),visible=active&&state.ready&&!!line;
 return <aside className={`scene-dialogue ${visible?'dialogue-visible':''}`} data-speaker={line?.actor??''} aria-hidden={!visible} inert={!visible} aria-label="Percakapan dalam adegan">
  <div className="scene-dialogue-speaker"><strong>{speaker?.name}</strong><span>{speaker?.role}</span></div>
  <p key={line?.start??'silent'} className={paused?'':'dialogue-appear'}>{line?`“${line.text}”`:''}</p>
 </aside>;
}
export function StoryPlaybackControls({playback,active,paused,onToggle,onReplay}:{playback:StoryPlayback;active:boolean;paused:boolean;onToggle:()=>void;onReplay:()=>void}){
 const state=useSyncExternalStore(playback.subscribe,playback.getSnapshot,playback.getSnapshot),duration=storyScenes[state.room].duration;
 return <div className={`scene-playback ${active?'playback-visible':''}`} aria-hidden={!active} inert={!active} aria-label="Kontrol adegan">
  <div className="scene-playback-caption"><span>{state.ended?'Adegan selesai. Silakan gulir ke pertanyaan.':!state.ready?'Menyiapkan adegan…':momentAt(state.room,state.time)}</span><small>Dialog ilustratif · {Math.floor(state.time)} / {duration} dtk</small></div>
  <div className="scene-playback-buttons"><button onClick={onToggle} disabled={!state.ready||state.ended} aria-label={paused?'Putar adegan':'Jeda adegan'}>{paused?<Play size={15}/>:<Pause size={15}/>}<span>{paused?'Putar':'Jeda'}</span></button><button onClick={onReplay} aria-label="Ulangi adegan"><RotateCcw size={15}/><span>Ulangi adegan</span></button></div>
  <progress value={state.time} max={duration} aria-label="Kemajuan adegan"/>
 </div>;
}
export function StoryTranscript({room}:{room:number}){
 return <details className="scene-transcript"><summary>Baca percakapan</summary><p className="transcript-note">Percakapan ilustratif dalam adegan.</p><ol>{storyScenes[room].beats.map(b=><li key={b.start}><strong>{storyActors[room].find(a=>a.id===b.actor)?.name??b.actor}</strong><p>{b.text}</p></li>)}</ol></details>;
}
