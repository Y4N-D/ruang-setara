"use client";
import {useEffect,useRef,useState} from 'react';
import {Scale,BookOpen,Compass,MapPin,Pause,Play,RotateCcw,Plus,X,Mouse,GraduationCap,HeartHandshake,Landmark,ShieldCheck,Check,Menu,ChevronLeft,ChevronRight,Grid2X2} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import GalleryScene from './gallery-scene';
import ChoiceScene from './choice-scene';
import StoryJourney from './story-journey';
import {createStoryPlayback} from './story-playback';
import type {StoryView} from './story-path';
import Lessons,{useLearningState} from './lessons';
import {articles} from './content';
import {allStoryCases,storyWings,wingForStop,type StoryWingId} from './lesson-stories';
import {stops} from './gallery-stops';

const chapters=[
 {kicker:'SELAMAT DATANG DI RUANG SETARA',line1:'Hak kita.',line2:'Ruang bersama.',description:'Sebuah perjalanan untuk memahami hak, menjalankan kewajiban, dan menghargai sesama.',cta:'Mulai perjalanan',hotspot:'Mulai menjelajah',icon:Compass},
 {kicker:'01 / PILIHAN & DAMPAK',line1:'Satu pilihan.',line2:'Banyak dampak.',description:'Di kelas, di jalan, hingga di ruang digital. Apa yang terjadi ketika hak seseorang terabaikan?',cta:'Masuk ke ruang cerita',hotspot:'Mulai dari media sosial',icon:GraduationCap},
 {kicker:'02 / KESEIMBANGAN',line1:'Hak dihormati.',line2:'Kewajiban dijalankan.',description:'Kehidupan bersama terasa lebih nyaman ketika kita saling menjaga. Coba gerakkan timbangan ini.',cta:'Masuk ke ruang Keseimbangan',hotspot:'Amati keseimbangannya',icon:HeartHandshake},
 {kicker:'03 / GALERI HAK • PAHAMI HAM',line1:'Setiap manusia.',line2:'Sama berharganya.',description:'Hak asasi melekat pada setiap orang. Buka buku konstitusi dan temukan makna Pasal 28A–28J.',cta:'Masuk ke ruang Konstitusi',hotspot:'Buka buku konstitusi',icon:BookOpen},
 {kicker:'04 / RUANG KEADILAN • KENALI PERANNYA',line1:'Hak dilindungi.',line2:'Keadilan dijaga.',description:'Siapa yang melindungi, menuntut, mengadili, dan mendampingi? Temukan peran masing-masing.',cta:'Masuk ke ruang Keadilan',hotspot:'Masuk ruang keadilan',icon:Landmark},
 {kicker:'05 / TANTANGAN AKHIR • SAATNYA MENCOBA',line1:'Sudah menjelajah.',line2:'Sekarang, tentukan sikap.',description:'Lima pertanyaan untuk menghubungkan pemahamanmu dengan pilihan dalam kehidupan sehari-hari.',cta:'Mulai tantangan',hotspot:'Cek pemahamanmu',icon:ShieldCheck},
];
const titles:Record<string,string>={tantangan:'Kenali tantangannya',upaya:'Hak & kewajiban dalam keseharian',ham:'Galeri konstitusi',hukum:'Ruang keadilan',latihan:'Tantangan akhir',sumber:'Materi & sumber belajar',peta:'Pilih tujuan perjalanan'};

export default function Page(){
 const learning=useLearningState();
 const [storyPlayback]=useState(createStoryPlayback);
 const replayScene=()=>{setStill(false);storyPlayback.restart();};
 const [storyWing,setStoryWing]=useState<StoryWingId>('tantangan');
 const [storyOpen,setStoryOpen]=useState(false),[storyView,setStoryView]=useState<StoryView>({room:0,phase:0,travel:0});
 const [leavingStory,setLeavingStory]=useState(false);
 const finishStory=()=>{setLeavingStory(true);window.setTimeout(()=>{go(stops.findIndex(s=>s.id===storyWing)+1);setLeavingStory(false);},still?0:600);};
 const storyRef=useRef(storyOpen);storyRef.current=storyOpen;
 const [entered,setEntered]=useState(false),[entry,setEntry]=useState(0),[light,setLight]=useState(false);
 const enteredRef=useRef(entered);enteredRef.current=entered;
 const [progress,setProgress]=useState(0),[still,setStill]=useState(false),[balanced,setBalanced]=useState(true),[reset,setReset]=useState(0),[panel,setPanel]=useState<string|null>(null),[opened,setOpened]=useState<string[]>([]);
 const panelRef=useRef(panel),stateRef=useRef({progress,balanced,panel,activeCase:storyOpen?allStoryCases[storyView.room].id:learning.activeCase,article:learning.article,qIndex:learning.qIndex,done:learning.done});panelRef.current=panel;stateRef.current={progress,balanced,panel,activeCase:storyOpen?allStoryCases[storyView.room].id:learning.activeCase,article:learning.article,qIndex:learning.qIndex,done:learning.done};
 const current=Math.min(5,Math.max(0,Math.round(entered?progress:entry))),chapter=chapters[current],Icon=chapter.icon;
 const go=(index:number)=>{setPanel(null);setProgress(index);setEntered(true);const wing=wingForStop(index);setStoryOpen(!!wing);if(wing){setStoryWing(wing);setStoryView({room:storyWings[wing].start,phase:0,travel:0});setOpened(v=>v.includes(wing)?v:[...v,wing]);}requestAnimationFrame(()=>document.getElementById(stops[index].id)?.scrollIntoView({behavior:'instant',block:'start'}));};
 const enter=(index=entry)=>go(index);
 const exit=()=>{setEntry(Math.round(progress));setStoryOpen(false);setEntered(false);setReset(v=>v+1);};
 useEffect(()=>{document.body.style.overflow=!entered||storyOpen?'hidden':'';return()=>{document.body.style.overflow='';};},[entered,storyOpen]);
 const open=(id:string)=>{setPanel(id);if(id!=='sumber'&&id!=='peta')setOpened(v=>v.includes(id)?v:[...v,id]);};
 const action=()=>current===0?go(1):wingForStop(current)?go(current):open(stops[current].id);
 useEffect(()=>{
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');setStill(mq.matches);const preference=()=>setStill(mq.matches);mq.addEventListener('change',preference);
  let frame=0;
  const sync=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(panelRef.current||!enteredRef.current||storyRef.current)return;const nodes=stops.map(s=>document.getElementById(s.id));let p=0;for(let i=0;i<5;i++){const a=nodes[i]?.offsetTop??0,b=nodes[i+1]?.offsetTop??innerHeight*(i+1);if(scrollY>=a)p=i+Math.min(1,(scrollY-a)/(b-a||1));}const nearest=Math.round(p),wing=wingForStop(nearest);if(wing&&Math.abs(p-nearest)<.45){setStoryWing(wing);setStoryOpen(true);setStoryView({room:storyWings[wing].start,phase:0,travel:0});setProgress(nearest);}else setProgress(Math.max(0,Math.min(5,p)));});};
  window.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync();
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',sync);window.removeEventListener('resize',sync);mq.removeEventListener('change',preference);};
 },[]);
 useEffect(()=>{
  const context=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>unknown}}).modelContext;if(!context?.registerTool)return;const controller=new AbortController();
  const registry=[{name:'read_learning_state',description:'Read the current gallery room, open lesson and balance simulation.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({...stateRef.current,chapter:stops[Math.round(stateRef.current.progress)].id})},{name:'navigate_lesson',description:'Move to a gallery room and open its learning material.',inputSchema:{type:'object',properties:{section:{type:'string',enum:stops.slice(1).map(s=>s.id)},article:{type:'string',enum:articles.map(a=>a.id)}},required:['section'],additionalProperties:false},execute:async(input:unknown)=>{const p=input as {section:string;article?:string};if(p.article){if(p.section!=='ham'||!articles.some(a=>a.id===p.article))throw new Error('Pasal tidak valid');learning.setArticle(p.article);}const index=stops.findIndex(s=>s.id===p.section);if(index<1)throw new Error('Bagian tidak valid');go(index);if(!wingForStop(index))open(p.section);else if(p.article)open(p.section);return{section:p.section};}},{name:'set_balance_simulation',description:'Set the balance of the rights and duties monument.',inputSchema:{type:'object',properties:{balanced:{type:'boolean'}},required:['balanced'],additionalProperties:false},execute:(input:unknown)=>{const p=input as {balanced:boolean};if(typeof p.balanced!=='boolean')throw new Error('Pilihan tidak valid');setBalanced(p.balanced);return{balanced:p.balanced};}}];
  registry.forEach(tool=>{try{void Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}});return()=>controller.abort();
 },[]);
 return <div className={`experience ${still?'still':''} ${entered?'inside-gallery':'gallery-entry'} ${light?'light-render':''} ${storyOpen?'story-tour':''} stop-${current}`}>
  <a href="#tantangan" className="skip-link" onClick={e=>{e.preventDefault();go(1);}}>Langsung ke materi</a>
  <div className="cinema-stage" aria-hidden={panel?true:undefined}>
   <div className="sky-wash"/>
   {(!entered&&wingForStop(entry))||storyOpen?<ChoiceScene playback={storyPlayback} entered={storyOpen} {...(storyOpen?storyView:{room:storyWings[wingForStop(entry)!].start,phase:0,travel:0})} still={still} blocked={!!panel} onMode={setLight}/>:<GalleryScene progress={progress} entry={entry} entered={entered} still={still} balanced={balanced} reset={reset} blocked={!!panel} onMode={setLight}/>}
   <div className={`scene-scrim ${current===0?'intro-scrim':''}`}/>
   <div className="world-coordinate" aria-hidden="true"><span>RUANG SETARA</span><span>RUANG {String(current+1).padStart(2,'0')} / 06</span></div>
   <button id="world-hotspot" className={`world-hotspot ${current===0?'intro-hotspot':''}`} onClick={action} aria-label={chapter.hotspot}><span className="hotspot-dot"><Plus size={19}/></span><span className="hotspot-label">{chapter.hotspot}</span></button>
  </div>
  <div className={`story-exit-veil ${leavingStory?'visible':''}`} aria-hidden="true"/>
  <header className="experience-header">
   <a className="wordmark" href="#beranda" onClick={e=>{e.preventDefault();exit();}} aria-label="Ruang Setara, awal perjalanan"><span className="wordmark-icon"><Scale size={22} strokeWidth={1.6}/></span>ruang<span>setara.</span></a>
   <div className="course-label">GALERI PEMBELAJARAN <span>KELAS IX</span></div>
   <div className="header-actions">{entered&&<button className="back-to-galleries" aria-label="Pilih galeri" onClick={exit}><Grid2X2 size={16}/><span>Pilih galeri</span></button>}<button className="round-control" onClick={()=>setStill(!still)} aria-label={still?'Aktifkan gerakan otomatis':'Jeda gerakan otomatis'} aria-pressed={still} title={still?'Aktifkan gerakan otomatis':'Jeda gerakan otomatis'}>{still?<Play size={16}/>:<Pause size={16}/>}</button><button className="contents-button" aria-label="Daftar materi" onClick={()=>open('peta')}><Menu size={17}/><span>Daftar materi</span></button></div>
  </header>
  {!entered&&<div className="gallery-welcome">
   <div className="entry-intro"><p>PENDIDIKAN PANCASILA</p><h1>Selamat datang di Ruang Setara.</h1></div>
   <button className="room-switch room-previous" aria-label="Galeri sebelumnya" onClick={()=>setEntry(v=>(v+5)%6)}><ChevronLeft size={22}/><span>{stops[(entry+5)%6].label}</span></button>
   <button className="room-switch room-next" aria-label="Galeri berikutnya" onClick={()=>setEntry(v=>(v+1)%6)}><span>{stops[(entry+1)%6].label}</span><ChevronRight size={22}/></button>
   <div className="entry-selection" key={entry}><p className="entry-number">GALERI {String(entry+1).padStart(2,'0')} / 06</p><h2>{stops[entry].label}</h2><p>{stops[entry].subtitle}</p><button className="enter-gallery" onClick={()=>enter()}>Masuk galeri</button></div>
   <div className="entry-footer"><span>Hak, kewajiban, dan ruang untuk memahami.</span><div className="gallery-pagination" role="group" aria-label="Pilih pratinjau galeri">{stops.map((s,i)=><button key={s.id} aria-label={`Pratinjau ${s.label}`} aria-pressed={i===entry} onClick={()=>setEntry(i)}><span/></button>)}</div><button onClick={()=>open('sumber')}>Tentang materi</button></div>
  </div>}
  {storyOpen&&<StoryJourney key={storyWing} wingId={storyWing} onMaterial={()=>open(storyWing)} playback={storyPlayback} onTogglePlayback={()=>setStill(v=>!v)} onReplay={replayScene} state={learning} view={storyView} still={still} blocked={!!panel} onView={setStoryView} onFinish={finishStory} onSources={()=>open('sumber')}/>}
  <main id="journey" className="journey-track" aria-label="Perjalanan belajar melalui enam galeri">
   {stops.map((stop,i)=><section id={stop.id} className="scroll-stop" key={stop.id} aria-label={`${i+1}. ${stop.label}`}><span className="sr-only">{chapters[i].line1} {chapters[i].line2}</span></section>)}
  </main>
  <div className={`narrative ${current===0?'narrative-intro':''}`} key={current} style={{opacity:Math.max(.35,1-Math.abs(progress-current)*1.4)}}>
   <p className="scene-eyebrow"><span className="eyebrow-rule"/>{chapter.kicker}</p>
   {current===0?<h1>{chapter.line1}<br/><span>{chapter.line2}</span></h1>:<h2>{chapter.line1}<br/><em>{chapter.line2}</em></h2>}
   <div className="narrative-detail"><p>{chapter.description}</p>
    {current===2&&<div className="scale-interaction"><div role="group" aria-label="Simulasi timbangan hak dan kewajiban"><button aria-pressed={balanced} onClick={()=>setBalanced(true)}>Seimbang</button><button aria-pressed={!balanced} onClick={()=>setBalanced(false)}>Kewajiban diabaikan</button></div><p aria-live="polite">{balanced?'Saling menghormati menjaga hak semua orang.':'Kewajiban yang diabaikan dapat mengganggu hak orang lain.'}</p><small>HAM tetap melekat pada setiap orang.</small></div>}
    <button className="journey-cta" onClick={action}><Icon size={18}/>{chapter.cta}</button>
    {current===5&&<button className="text-control" onClick={()=>go(0)}>Kembali ke atrium</button>}
   </div>
  </div>
  <aside className="view-tools" aria-label="Kontrol sudut pandang"><span><Mouse size={15}/>Gulir untuk menjelajah</span><button onClick={()=>setReset(v=>v+1)} aria-label="Atur ulang sudut pandang" disabled={light} title={light?"Mode ringan menggunakan sudut galeri tetap":"Atur ulang sudut pandang"}><RotateCcw size={17}/></button></aside>
  <div className="journey-footer">
   <div className="journey-status"><span><MapPin size={14}/>{stops[current].label}</span><span className="journey-note">Tantangan Pemenuhan Hak dan Kewajiban Warga Negara</span><button onClick={()=>open('sumber')}>Sumber belajar</button></div>
   <nav className="journey-nav" aria-label="Tujuan perjalanan">{stops.map((stop,i)=><button key={stop.id} onClick={()=>go(i)} className={i===current?'active':''} aria-current={i===current?'step':undefined} aria-label={`${i+1}. ${stop.label}`}><span className="nav-index">{opened.includes(stop.id)?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><span>{stop.label}</span><span className="nav-fill" style={{transform:`scaleX(${Math.min(1,Math.max(0,progress-i+1))})`}}/></button>)}</nav>
  </div>
  <Dialog open={panel!==null} onOpenChange={v=>{if(!v)setPanel(null);}}>
   <DialogContent className={`study-dialog ${panel==='peta'?'map-dialog':''}`} showCloseButton={false} onCloseAutoFocus={e=>{e.preventDefault();document.querySelector<HTMLButtonElement>(storyRef.current?'.story-room-nav button[aria-current=step]':enteredRef.current?'.journey-cta':'.contents-button')?.focus();}}>
    <div className="study-toolbar"><div><DialogTitle>{panel?titles[panel]:''}</DialogTitle><DialogDescription>Ruang Setara · Pendidikan Pancasila Kelas IX</DialogDescription></div><DialogClose asChild><button className="close-study" aria-label="Tutup materi dan kembali ke galeri"><X size={21}/></button></DialogClose></div>
    <div className="study-scroll">
     {panel==='peta'?<div className="map-content"><p className="map-heading">Ke mana kita<br/><em>menjelajah hari ini?</em></p><p>Pilih galeri untuk meneruskan perjalanan. Materi dapat dipelajari dengan urutan yang kamu perlukan.</p><div className="destination-list">{stops.map((stop,i)=>{const DestinationIcon=chapters[i].icon;return <button key={stop.id} onClick={()=>go(i)}><span className="destination-number">0{i+1}</span><DestinationIcon size={24}/><div><strong>{stop.label}</strong><span>{i===0?'Awal perjalanan':chapters[i].cta}</span></div>{i===current&&<span className="here-label">Di sini</span>}</button>;})}</div><button className="text-control" onClick={()=>open('sumber')}>Lihat materi dan sumber belajar</button></div>:<Lessons section={panel??''} state={learning} balanced={balanced} onBalance={setBalanced} onNavigate={id=>{if(id==='tantangan'){go(1);return;}open(id);document.querySelector('.study-scroll')?.scrollTo({top:0,behavior:'instant'});}}/>}
    </div>
   </DialogContent>
  </Dialog>
 </div>;
}
