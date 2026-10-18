# Keseimbangan, Konstitusi, Keadilan

The three learning wings share the story viewer, camera turn, answer feedback,
pause/replay clock, and head-anchored dialogue with Pilihan & dampak. Full learning
material remains available through **Jelajahi materi**.

`app/lesson-choreography.json` controls ten actors in rooms 4–6. Dialogue is
illustrative. The justice room is a teaching simulation of distinct roles, not
a complete criminal procedure or an actual hearing.

## Rebuild

Use Python 3.11 with `bpy==4.2.0`, FFmpeg, and a separate Node toolchain containing
`@gltf-transform/{core,extensions,functions}@4.2.1`, `draco3dgltf@1.5.7`, and Sharp.
Run Blender stages sequentially. Set `OMP_NUM_THREADS=8 OPENBLAS_NUM_THREADS=8`.

On a fresh checkout, create base intermediates as described in STAGED-SCENES.md:

1. `python scripts/assets/build-choices.py --model-only`
2. `python scripts/assets/build-wall-rooms.py --model-only`
3. `python scripts/assets/build-human-cast.py --staged`
4. `python scripts/assets/build-lesson-rooms.py`
5. `python scripts/assets/animate-lesson-scenes.py`
6. `python scripts/assets/export-lesson-rooms.py`
7. `node scripts/assets/optimize-lesson-textures.mjs <gltf-toolchain-directory>`
8. For each room 4–6, run `STORY_RENDER_FPS=3 python scripts/assets/render-lesson-scenes.py --room=N`, then `python scripts/assets/encode-lesson-scenes.py N`.

The generated GLB must have ten skins and ten articulated clips. New head anchors
are stored in `app/lesson-anchors.json`. Preview images and cube faces must come
from these same scenes. Preserve the original rooms 0–3 and their existing assets.
Regenerate the model, videos, and anchors together when timing or motion changes.

Existing materials: six rights–duties cards, the balance demonstration,
Pasal 28A–28J, law-enforcement roles, four court environments, and the final quiz.
Answers unlock continuation even when the selected answer is incorrect.
