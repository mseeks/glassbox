# Glassbox showcase reel — build pipeline

A vertical 1080×1920 LinkedIn reel: GlassCube brand bumpers, per-lesson shots
(3D-float style + classic ffmpeg close-ups), accent lower-thirds, and an
original driving synth score. The newer evolution of `capture_showcase.py`.

## Provision (once)

`scripts/capture_showcase.sh` sets up the venv + chromium + JetBrains Mono
(`artifacts/.capture-venv`, `artifacts/fonts`). Serve the built site:

    npm run build
    python3 -m http.server 4188 --bind 127.0.0.1 --directory dist &   # robust vs OOM

## Run (from project root; uses artifacts/.capture-venv/bin/python)

    scripts/_capture_masters.py <url>   # A: ~7s live master per lesson  -> artifacts/reel/masters
    scripts/_bumpers.py                 # B: GlassCube open/close bumpers -> artifacts/reel
    scripts/_shots3d.py                 # C: per-lesson 3D-float shots (accent glow) -> artifacts/reel/shots
    scripts/_assemble.py                # E: cameras + lower-thirds + 60fps smooth + crossfades -> silent reel
    scripts/_music.py                   # D: driving score + mux -> artifacts/reel/glassbox-reel.mp4

`scripts/_float3d.py` renders 3D-float _style variants_ on one master (the look
exploration). Capture at device_scale_factor=1 + a clean 60fps (blend) is what
keeps the 3D motion judder-free. All `artifacts/` output is gitignored.
