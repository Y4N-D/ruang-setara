"""Encode the rendered 3D story with a smooth, exact-duration playback clock."""
import json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];rooms=json.loads((ROOT/'app/story-choreography.json').read_text())
selected=[int(sys.argv[1])] if len(sys.argv)>1 else range(len(rooms))
for room in selected:
 dest=ROOT/f'public/stories/{room}-motion.mp4'
 settings=ROOT/f'.sites-runtime/staged-motion-{room}/settings.json'
 fps=json.loads(settings.read_text())['fps'] if settings.exists() else 6
 subprocess.run(['/usr/bin/ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y','-framerate',str(fps),'-i',str(ROOT/f'.sites-runtime/staged-motion-{room}/%04d.jpg'),'-vf','minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1','-t',str(rooms[room]['duration']),'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(dest)],check=True)
 assert dest.stat().st_size>10000, 'Empty rendered movie'
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(dest)]))
 assert abs(duration-rooms[room]['duration'])<.1, f'Incomplete movie: {duration}'
 print('STAGED_VIDEO_COMPLETE',room,dest.stat().st_size,duration,flush=True)
