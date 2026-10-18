"use client";
import {useEffect,useRef} from 'react';
import {Check,LockKeyhole,Mouse,Lightbulb,BookOpen,Heart,ShieldCheck,MoveRight} from 'lucide-react';
import {storyWings,type StoryWingId} from './lesson-stories';
import {useLearningState,CaseEvidence} from './lessons';
import {ease,storyActors,StoryView} from './story-path';
import StoryConversation,{StoryPlaybackControls,StoryTranscript} from './story-conversation';
import type {StoryPlayback} from './story-playback';

type Props={wingId:StoryWingId;onMaterial:()=>void;playback:StoryPlayback;onTogglePlayback:()=>void;onReplay:()=>void;state:ReturnType<typeof useLearningState>;view:StoryView;still:boolean;blocked:boolean;onView:(view:StoryView)=>void;onFinish:()=>void;onSources:()=>void};
export default function StoryJourney({wingId,onMaterial,state,view,still,blocked,onView,onFinish,onSources,playback,onTogglePlayback,onReplay}:Props){
 const wing=storyWings[wingId],cases=wing.cases;
 const root=useRef<HTMLDivElement>(null),live=useRef({onView,blocked}),nav=useRef<HTMLElement>(null),scrollAnimation=useRef(0);live.current={onView,blocked};
 const {answers,setAnswers}=state,firstMissing=cases.findIndex(c=>answers[c.id]===undefined),unlocked=firstMissing<0?cases.length-1:firstMissing;
 const moveTo=(target:HTMLElement|null)=>{
  const el=root.current;if(!el||!target)return;cancelAnimationFrame(scrollAnimation.current);
  const from=el.scrollTop,to=target.getBoundingClientRect().top-el.getBoundingClientRect().top+from;
  if(still){el.scrollTop=to;return;}
  const duration=Math.max(1300,Math.min(2800,Math.abs(to-from)/el.clientHeight*700)),start=performance.now();
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/duration);el.scrollTop=from+(to-from)*ease(t);if(t<1)scrollAnimation.current=requestAnimationFrame(tick);};scrollAnimation.current=requestAnimationFrame(tick);
 };
 const visit=(i:number)=>{if(i>unlocked)return;const el=document.getElementById(`story-${cases[i].id}`);moveTo(el);el?.querySelector<HTMLHeadingElement>('h2')?.focus({preventScroll:true});};
 useEffect(()=>{
  const el=root.current;if(!el)return;let frame=0;
  const sync=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(live.current.blocked)return;
   const top=el.getBoundingClientRect().top,H=el.clientHeight,scroll=el.scrollTop,mobile=el.clientWidth<=760;
   const offset=(node:Element)=>node.getBoundingClientRect().top-top+scroll;
   const articles=Array.from(el.querySelectorAll<HTMLElement>('.story-room'));
   let room=0;articles.forEach((a,i)=>{if(offset(a)<=scroll+1)room=i;});
   const a=articles[room],q=a?.querySelector<HTMLElement>('.story-decision'),lead=a?.querySelector<HTMLElement>('.story-lead'),pass=a?.querySelector<HTMLElement>('.story-passage');if(!a||!q||!lead)return;
   const aTop=offset(a),qTop=offset(q),turnStart=aTop+(mobile?lead.offsetHeight-H*.18:H*.38),turnEnd=qTop-H*.15;
   const phase=Math.max(0,Math.min(1,(scroll-turnStart)/Math.max(1,turnEnd-turnStart)));
   const next=articles[room+1],travel=pass&&next?Math.max(0,Math.min(1,(scroll-(offset(pass)-H*.12))/(offset(next)-(offset(pass)-H*.12)))):0;
   articles.forEach((article,i)=>{article.classList.toggle('active-room',i===room);});
   a.style.setProperty('--wall-fade',String(1-ease(phase/.55)));a.style.setProperty('--wall-shift',`${-110*ease(phase)}px`);a.style.setProperty('--wall-angle',`${-24*ease(phase)}deg`);
   nav.current?.querySelectorAll('button').forEach((b,i)=>{if(i===room)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
   el.dataset.room=cases[room].id;el.dataset.phase=phase.toFixed(3);el.dataset.travel=travel.toFixed(3);el.dataset.wall=travel>.04?'passage':phase>.95?'question':phase>.03?'turn':'story';
   live.current.onView({room:room+wing.start,phase,travel,obscured:mobile&&scroll>aTop+20});
  });};
  const cancel=()=>cancelAnimationFrame(scrollAnimation.current);
  el.addEventListener('scroll',sync,{passive:true});el.addEventListener('wheel',cancel,{passive:true});el.addEventListener('touchstart',cancel,{passive:true});el.addEventListener('keydown',cancel);el.addEventListener('pointerdown',cancel);
  const ro=new ResizeObserver(sync);ro.observe(el);el.querySelectorAll('.story-room,.decision-board').forEach(a=>ro.observe(a));sync();
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(scrollAnimation.current);el.removeEventListener('scroll',sync);el.removeEventListener('wheel',cancel);el.removeEventListener('touchstart',cancel);el.removeEventListener('keydown',cancel);el.removeEventListener('pointerdown',cancel);ro.disconnect();};
 },[answers,unlocked,wing]);
 return <>
  <StoryConversation playback={playback} active={view.phase<.12&&view.travel===0&&!blocked&&!view.obscured} paused={still}/>
  <StoryPlaybackControls playback={playback} active={view.phase<.12&&view.travel===0&&!blocked&&!view.obscured} paused={still} onToggle={onTogglePlayback} onReplay={onReplay}/>
  <nav ref={nav} className="story-room-nav" aria-label={`Ruang cerita ${wing.title}`}>
   <span className="story-wing-name">{wing.title.toUpperCase()} <small>{wing.subtitle}</small></span>
   <div>{cases.map((c,i)=><button key={c.id} onClick={()=>visit(i)} disabled={i>unlocked} aria-current={i===0?'step':undefined} aria-label={`${i+1}. ${c.label}${i>unlocked?', pilih jawaban di ruang sebelumnya dahulu':''}`}><span>{answers[c.id]!==undefined?<Check size={15}/>:i>unlocked?<LockKeyhole size={13}/>:String(i+1).padStart(2,'0')}</span><b>{c.label}</b></button>)}{wing.material&&<button className="wing-material-button" onClick={onMaterial}><BookOpen size={16}/><b>Jelajahi materi</b></button>}</div>
  </nav>
  <div ref={root} className="story-scroll" tabIndex={0} aria-label="Jelajahi dinding cerita dan dinding pertanyaan" style={{overflowY:blocked?'hidden':'auto'}}>
   {cases.slice(0,unlocked+1).map((c,i)=>{const chosen=answers[c.id],answered=chosen!==undefined;return <article className={`story-room story-room-${c.id} ${i===0?'active-room':''}`} id={`story-${c.id}`} key={c.id} aria-labelledby={`story-title-${c.id}`}>
    <div className="story-introduction">
     <section className="story-lead" aria-label="Dinding pertama: cerita">
      <div className="story-caption"><p className="story-kicker">RUANG {String(i+1).padStart(2,'0')} / {String(cases.length).padStart(2,'0')} <span>DINDING 01 · {c.tag}</span></p><h2 id={`story-title-${c.id}`} tabIndex={-1}>{c.title}</h2><p className="story-context">{c.story}</p>
       <dl className="story-cast">{storyActors[i+wing.start].map(a=><div key={a.id}><dt>{a.name}</dt><dd>{a.role}</dd></div>)}</dl>
       <StoryTranscript room={i+wing.start}/><p className="story-thought">{wing.thought}</p><button className="story-scroll-cue" onClick={()=>moveTo(document.getElementById(`decision-${c.id}`))}><Mouse size={17}/>Gulir ke dinding pertanyaan</button>
      </div>
     </section>
    </div>
    <section className="story-decision" id={`decision-${c.id}`} aria-labelledby={`question-${c.id}`}>
     <div className="decision-board"><p className="story-kicker">DINDING 02 · PILIHANMU <span>{c.label}</span></p><h3 id={`question-${c.id}`}>{c.question}</h3><p className="decision-instruction">Pilih satu tindakan, lalu baca penjelasan dan catatannya.</p>
      <div className="story-options" role="group" aria-label={c.question}>{c.options.map((option,j)=><button key={option} onClick={()=>setAnswers(old=>({...old,[c.id]:j}))} aria-pressed={chosen===j} className={chosen===j?'selected':''}><span className="option-letter">{String.fromCharCode(65+j)}</span><span>{option}</span>{chosen===j&&<Check size={18}/>}</button>)}</div>
      <div aria-live="polite" aria-atomic="true">{answered&&<div className={`story-feedback ${chosen===c.correct?'is-correct':'keep-learning'}`}><Lightbulb size={21}/><div><strong>{chosen===c.correct?'Pilihan yang melindungi.':'Mari lihat dampaknya.'}</strong><p>{c.feedback[chosen]}</p></div></div>}</div>
      {answered&&<div className="story-notes"><p className="notes-heading">CATATAN PEMBELAJARAN</p><dl><div><dt><Heart size={16}/>Hak yang dihormati</dt><dd>{c.right}</dd></div><div><dt><ShieldCheck size={16}/>Kewajiban yang dijalankan</dt><dd>{c.duty}</dd></div><div><dt><BookOpen size={16}/>Kaitan dengan konstitusi</dt><dd>Pasal {c.article} UUD NRI Tahun 1945.</dd></div></dl><div className="story-small-step"><strong>Langkah kecilmu</strong><p>{c.action}</p></div>{wingId==='tantangan'&&i===1&&<CaseEvidence/>}{wing.material&&<button className="story-material-link" onClick={onMaterial}><BookOpen size={17}/>{wing.material}</button>}</div>}
      <div className="story-continue"><p>{answered?(i===cases.length-1?`Adegan sudah dijelajahi. Pelajari catatannya, lalu lanjut ke ${wing.next}.`:'Gulir lagi untuk melewati pintu ke ruang berikutnya. Kamu dapat melanjutkan, apa pun jawabanmu.'):'Pilih satu jawaban untuk membuka penjelasan, catatan, dan ruang berikutnya.'}</p><button disabled={!answered} onClick={()=>i===cases.length-1?onFinish():visit(i+1)}>{i===cases.length-1?`Lanjut ke ${wing.next}`:`Lanjut ke ${cases[i+1].label}`}</button></div>
     </div>
    </section>
    {answered&&i<cases.length-1&&<section className="story-passage" aria-label={`Perjalanan menuju ruang ${cases[i+1].label}`}><div><span>RUANG BERIKUTNYA</span><p>{cases[i+1].label}</p><small>Terus gulir untuk masuk.</small></div></section>}
   </article>;})}
   <footer className="story-end"><span>Hak setiap orang tetap perlu dihormati.</span><button onClick={onSources}>Materi & sumber belajar</button></footer>
   <div className="wall-guide" aria-hidden="true"><span className="guide-story">01 <b>Cerita</b><span/>02 <b>Pilihan</b></span><span className="guide-turn"><MoveRight size={16}/>Berputar ke dinding pertanyaan</span><span className="guide-question">02 <b>Pilihan & catatan</b></span><span className="guide-passage">Melewati pintu ke cerita berikutnya</span></div>
  </div>
 </>;
}
