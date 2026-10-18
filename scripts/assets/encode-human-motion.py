import subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
for i in (list(map(int,sys.argv[1:])) or range(4)):
 folder=ROOT/f'.sites-runtime/motion-{i}';assert all((folder/f'{n:03}.jpg').exists() for n in range(25))
 dest=ROOT/f'public/stories/{i}-motion.mp4'
 # One wrapped look-ahead sample lets interpolation reach the full 4-second loop.
 extra=folder/'025.jpg';extra.write_bytes((folder/'001.jpg').read_bytes())
 try:subprocess.run(['ffmpeg','-v','error','-y','-framerate','6','-i',str(folder/'%03d.jpg'),'-vf','minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1','-t','4','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)],check=True)
 finally:extra.unlink(missing_ok=True)
 print('MOTION_ENCODED',i,dest.stat().st_size,flush=True)
