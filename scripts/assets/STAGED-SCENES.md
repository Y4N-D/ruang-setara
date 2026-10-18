# Pilihan & dampak: staged scenes

`app/story-choreography.json` is the shared script for the 14 actors in four rooms. Dialogue times, position keys and gaze targets use seconds. Position keys contain `[time, x, y, yaw, seatedAmount]` in each Blender room's local coordinates. The camera tour, learning cases, questions and feedback remain independent of scene replay.

Build with Blender's Python module (`bpy==4.2.0`) and the committed CC0 MakeHuman source data:

On a fresh checkout, create the base intermediates first with `python scripts/assets/build-choices.py --model-only` and `python scripts/assets/build-wall-rooms.py --model-only`. These steps preserve the existing optimized GLB and published still images.

1. `python scripts/assets/build-human-cast.py --staged`
2. `python scripts/assets/animate-story-scenes.py`
3. `python scripts/assets/export-human-rooms.py --staged`
4. `node scripts/assets/optimize-human-textures.mjs <gltf-transform-dependency-directory>`
5. For each room index 0–3, sequentially: `python scripts/assets/render-staged-scenes.py --room=N`, then `python scripts/assets/encode-staged-scenes.py N`.
6. `python scripts/assets/render-staged-scenes.py --preview`
7. `node scripts/assets/verify-story-timeline.mjs`

Run heavy Blender operations sequentially in an 8 GB environment. Set `OMP_NUM_THREADS=8 OPENBLAS_NUM_THREADS=8`. Generated `.blend` files and image sequences are reproducible intermediates in `.sites-runtime/`; ship the optimized GLB, panoramas, MP4s and sampled head anchors.

Use `--movies-only --resume` to continue a frame sequence. `STORY_RENDER_THREADS` limits render threads. `STORY_RENDER_FPS` controls panorama source sampling (default 6); the encoder reads the recorded sampling rate and generates 24 fps output with motion interpolation. The WebGL model and its shared scene clock remain independent of this fallback sampling rate. Use `--stills-only --front-only` to update the front panorama and room poster when the other five room faces are unchanged.

The browser uses a single scene clock. In WebGL it controls every animation clip; in panorama mode it follows the actual video's playback time, including buffering. Bubble anchors are interpolated from the same baked poses. Leaving the story wall pauses the scene. Replay resets actors, dialogue and elapsed time without changing answers. The transcript remains available when motion is paused.

Validation: check the social sequence Dio → Raka → Seno → Mira; Raka leaves while Seno speaks; Mira sits before her line. Check speech and head tracking in all rooms, pause/resume, replay after completion, a wrong answer unlocking the next room, the camera turn and passage, and the mobile layout. The GLB must retain 14 skinned rigs and 14 `Scene_` animation clips with translation and articulated movement.
