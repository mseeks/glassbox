#!/usr/bin/env python3
"""Capture a LinkedIn-ready showcase reel of the Interactive Lessons collection.

Runs on the host (not a container). The look is a small documentary: a custom
animated title card, then a sequence of close, moving shots of the real pages
with their animation live, each under a quiet broadcast lower-third, closing on
a card. Pipeline:

  1. A custom title bumper (its own animated HTML, not the site) opens the film.
  2. For each chosen lesson, Playwright loads the page at 1080x1920 (device scale
     2 for crisp text), brings its signature animation to life (auto-running
     heroes, or a lab whose control we trigger), frames it, and HOLDS — recording
     the live motion to a 1.5x "master" (1620x2880) so we can punch in without
     softening.
  3. ffmpeg flies a CAMERA over each master: a real zoom + pan in a direction
     that changes shot to shot (diagonals, lateral drifts, a push-in, a pull-out)
     — not a page scroll. A legible lower-third (lesson + credit, JetBrains Mono,
     plate + accent tick + outlined text) rides on top. Segments crossfade.
  4. A warm, chill, optimistic score (major-7 pad + soft arpeggio + light brushed
     percussion + an opening swell) is synthesized with numpy, loudness-normalized
     for social, and muxed in.

The helper shell script (scripts/capture_showcase.sh) provisions the venv +
chromium + the JetBrains Mono ttf used for labels.
"""

from __future__ import annotations

import argparse
import asyncio
import re
import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np
from playwright.async_api import async_playwright

SR = 48_000
W, H = 1080, 1920
# Record at native 1080x1920 (Playwright pads, doesn't upscale, when the record
# size exceeds the viewport — so a larger "master" would gray-box the frame).
# device_scale_factor=2 still sources these frames from a 2x paint, so a ~1.5x
# camera punch-in upscales cleanly enough for social.
MASTER_W, MASTER_H = W, H
FPS = 30
XFADE = 0.5  # crossfade between segments (s)

BUMPER_SECONDS = 3.8
CLOSING_SECONDS = 3.6


# --------------------------------------------------------------------------- #
# The reel. Each lesson opens on a striking, *live* animation; `move`/`zoom`
# choose the camera (see camera_vf). Heroes that auto-animate need no trigger;
# lab-driven ones name a control to click, then frame the lit-up figure.
# `label`/`credit` are the lower-third.
# --------------------------------------------------------------------------- #
SEGMENTS = [
    # The collection at a glance — a diagonal glide across the card wall.
    dict(id="index", url="/", seconds=4.0, start_frac=0.17, move="diag-tl-br",
         zoom=1.5, accent="#e8dec8"),
    # B-Trees — the card-catalog cabinet auto-cycles its drawers (light paper:
    # a deliberate jolt out of the dark). Drift laterally across the drawers.
    dict(id="b-trees", url="/?lesson=b-trees", seconds=4.2, start_frac=0.015,
         move="pan-lr", zoom=1.5, settle=1500, label="B-Trees",
         credit="Bayer & McCreight · 1970", accent="#4aa3c7"),
    # TLS — the sealed channel toggles open/sealed on its own.
    dict(id="tls", url="/?lesson=tls", seconds=4.2, start_frac=0.02,
         move="diag-tr-bl", zoom=1.4, settle=1700, label="TLS",
         credit="The sealed channel", accent="#46d6c6"),
    # Vantage-Point Trees — the sonar scope sweeps + pings forever; push in on it.
    dict(id="vp-tree", url="/?lesson=vp-tree", seconds=4.2, start_frac=0.12,
         move="push-in", zoom=1.28, zoom2=1.58, settle=1500,
         label="Vantage-Point Trees", credit="Peter Yianilos · 1993",
         accent="#ffb454"),
    # HyperLogLog — pour 20k items through; the whole register bank lights up.
    dict(id="hyperloglog", url="/?lesson=hyperloglog", seconds=4.4,
         triggers=[r"stream \+20", r"stream \+2", r"step one item"],
         center_lab=True, prime=900, move="pan-rl", zoom=1.55, settle=1500,
         label="HyperLogLog", credit="Flajolet et al. · 2007", accent="#e3a13c"),
    # SHA — run the diffusion rounds so one flipped bit floods the grid.
    dict(id="sha", url="/?lesson=sha", seconds=4.2,
         triggers=[r"run rounds", r"diffuse", r"\bplay\b", r"\brun\b"],
         center_lab=True, prime=1300, move="diag-bl-tr", zoom=1.5, settle=1800,
         label="SHA-256", credit="The one-way machine", accent="#e07a3c"),
    # Merkle Trees — the fingerprint tree builds itself on load; low settle so we
    # catch it mid-build. Travel from the root back down toward the leaves.
    dict(id="merkle-trees", url="/?lesson=merkle-trees", seconds=4.2,
         start_frac=0.0, move="diag-br-tl", zoom=1.42, settle=650,
         label="Merkle Trees", credit="Ralph C. Merkle · 1979", accent="#5bc0a3"),
    # LSM Trees — start the compaction race, let both strategies build strata,
    # then pull out to reveal the whole divergence.
    dict(id="lsm-trees", url="/?lesson=lsm-trees", seconds=4.4,
         triggers=[r"\brun\b", r"compact", r"\bplay\b"], center_lab=True,
         lab_bias=0.34, prime=6000, move="pull-out", zoom=1.28, zoom2=1.58,
         settle=1500, label="LSM Trees", credit="O’Neil et al. · 1996",
         accent="#e3582c"),
]


# --------------------------------------------------------------------------- #
# Custom title + closing cards (their own animated HTML — never the site).
# Same family glue as the lessons: dark paper, parchment ink, Fraunces /
# Cormorant / JetBrains Mono. Text rises in on a stagger; the bg breathes.
# --------------------------------------------------------------------------- #
_CARD_HEAD = """
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..500&family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%;background:#08080d;color:#e8dec8;overflow:hidden}
  *{box-sizing:border-box}
  .bg{position:fixed;inset:0;z-index:0;
      background-image:
        radial-gradient(ellipse at 22% 24%, rgba(120,150,220,.10), transparent 52%),
        radial-gradient(ellipse at 82% 82%, rgba(196,181,253,.07), transparent 56%);
      animation: breathe 13s ease-in-out infinite alternate}
  .grain{position:fixed;inset:0;z-index:0;opacity:.04;mix-blend-mode:screen;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
  @keyframes breathe{from{transform:scale(1) translate(0,0)}to{transform:scale(1.06) translate(-1.5%,-1%)}}
  @keyframes rise{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes soft{from{opacity:0}to{opacity:.46}}
</style>
"""

BUMPER_HTML = (
    "<!doctype html><html><head><meta charset='utf-8'>" + _CARD_HEAD + """
<style>
  .wrap{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column;
        justify-content:center;align-items:flex-start;text-align:left;padding:0 11%}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.34em;
           text-transform:uppercase;color:rgba(154,184,232,.78);margin:0 0 40px;
           opacity:0;animation:rise .9s .65s cubic-bezier(.2,.7,.2,1) forwards}
  h1{font-family:'Fraunces',serif;font-weight:340;font-size:106px;line-height:1.02;
     letter-spacing:-.022em;margin:0;opacity:0;
     animation:rise 1.15s 1.0s cubic-bezier(.2,.7,.2,1) forwards}
  h1 em{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;
        color:#9ab8e8}
  .rule{height:2px;width:240px;margin:46px 0 0;transform-origin:left center;transform:scaleX(0);
        background:linear-gradient(90deg,#9ab8e8,rgba(154,184,232,0));
        animation:grow 1.1s 1.7s cubic-bezier(.2,.7,.2,1) forwards}
  .line{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;
        font-size:42px;line-height:1.42;color:rgba(232,222,200,.84);max-width:21ch;
        margin:34px 0 0;opacity:0;animation:rise 1.15s 2.05s cubic-bezier(.2,.7,.2,1) forwards}
  .foot{position:absolute;bottom:118px;left:11%;font-family:'JetBrains Mono',monospace;
        font-size:21px;letter-spacing:.2em;text-transform:uppercase;color:rgba(232,222,200,.0);
        animation:soft 1.1s 2.7s forwards}
</style></head>
<body><div class='bg'></div><div class='grain'></div>
  <div class='wrap'>
    <div class='eyebrow'>For a while now, quietly —</div>
    <h1>I&rsquo;ve been building<br><em>something.</em></h1>
    <div class='rule'></div>
    <div class='line'>A way into the fundamentals you don&rsquo;t read,
      but take apart with your hands.</div>
  </div>
  <div class='foot'>Interactive Lessons</div>
</body></html>
"""
)

CLOSING_HTML = (
    "<!doctype html><html><head><meta charset='utf-8'>" + _CARD_HEAD + """
<style>
  .wrap{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column;
        justify-content:center;align-items:center;text-align:center;padding:0 12%}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:23px;letter-spacing:.32em;
           text-transform:uppercase;color:rgba(232,222,200,.42);margin:0 0 46px;
           opacity:0;animation:rise .9s .5s cubic-bezier(.2,.7,.2,1) forwards}
  h1{font-family:'Fraunces',serif;font-weight:300;font-size:112px;line-height:1.03;
     letter-spacing:-.02em;margin:0;opacity:0;
     animation:rise 1.1s .9s cubic-bezier(.2,.7,.2,1) forwards}
  h1 em{font-family:'Cormorant Garamond',serif;font-style:italic;color:rgba(232,222,200,.6)}
  .line{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:41px;line-height:1.4;
        color:rgba(232,222,200,.8);max-width:22ch;margin:52px 0 0;opacity:0;
        animation:rise 1.1s 1.5s cubic-bezier(.2,.7,.2,1) forwards}
  .foot{position:absolute;bottom:120px;font-family:'JetBrains Mono',monospace;font-size:22px;
        letter-spacing:.2em;text-transform:uppercase;color:rgba(232,222,200,0);
        animation:soft 1.1s 2.2s forwards}
</style></head>
<body><div class='bg'></div><div class='grain'></div>
  <div class='wrap'>
    <div class='eyebrow'>Go on — take it apart</div>
    <h1>Poke<br><em>the systems.</em></h1>
    <div class='line'>Notes from relearning the things I&rsquo;d taken for granted.</div>
  </div>
  <div class='foot'>Interactive Lessons</div>
</body></html>
"""
)


# --------------------------------------------------------------------------- #
# Stage 1 — capture (record a held, live-animating master per page)
# --------------------------------------------------------------------------- #
async def capture(args, work: Path) -> dict:
    out: list[dict] = []
    vp = {"width": W, "height": H}
    rec = {"width": MASTER_W, "height": MASTER_H}
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=["--force-color-profile=srgb"])

        async def record_card(html: str, name: str, hold: float) -> Path:
            ctx = await browser.new_context(
                viewport=vp, device_scale_factor=2,
                record_video_dir=str(work), record_video_size=rec,
            )
            page = await ctx.new_page()
            await page.set_content(html, wait_until="networkidle")
            await page.wait_for_timeout(int(hold * 1000))  # let fonts + entrance play
            vid = page.video
            await ctx.close()
            dst = work / name
            Path(await vid.path()).rename(dst)
            return dst

        print("   recording title + closing cards …")
        bumper = await record_card(BUMPER_HTML, "bumper.webm", BUMPER_SECONDS + 1.4)
        closing = await record_card(CLOSING_HTML, "closing.webm", CLOSING_SECONDS + 1.4)

        for i, seg in enumerate(SEGMENTS):
            ctx = await browser.new_context(
                viewport=vp, device_scale_factor=2,
                record_video_dir=str(work), record_video_size=rec,
            )
            page = await ctx.new_page()
            await page.goto(args.url + seg["url"], wait_until="domcontentloaded", timeout=30_000)
            await page.wait_for_timeout(seg.get("settle", 1400))

            start_y = 0
            hit = None
            for pat in seg.get("triggers", []):
                btn = page.get_by_role("button", name=re.compile(pat, re.I)).first
                try:
                    if await btn.count() and await btn.is_visible():
                        await btn.scroll_into_view_if_needed(timeout=2500)
                        await page.wait_for_timeout(220)
                        # Stable handle: a control like "run" relabels to "pause"
                        # on click, which would break a re-resolving locator below.
                        hit = await btn.element_handle()
                        await btn.click(timeout=2500)
                        start_y = await page.evaluate("() => Math.round(window.scrollY)")
                        break
                except Exception:
                    continue
            # Frame the lab we just lit up. `lab_bias` (0..1) picks which part of
            # the figure lands at the frame's centre — 0.5 centres the whole
            # figure, lower biases toward its top (its live panels/grid).
            if hit is not None and "center_lab" in seg:
                try:
                    await hit.evaluate(
                        """(el, bias) => {
                          const f = el.closest('figure, .fig, [class*="fig"]') || el;
                          const r = f.getBoundingClientRect();
                          const y = window.scrollY + r.top + r.height * bias - window.innerHeight / 2;
                          window.scrollTo(0, Math.max(0, Math.round(y)));
                        }""",
                        seg.get("lab_bias", 0.5),
                    )
                    start_y = await page.evaluate("() => Math.round(window.scrollY)")
                except Exception:
                    pass
            if "start_frac" in seg:
                doc = await page.evaluate("() => document.body.scrollHeight")
                start_y = int(seg["start_frac"] * doc)
                await page.evaluate("(y) => window.scrollTo(0, y)", start_y)

            # Let the triggered animation build to a rich state, then HOLD still
            # and record the live motion — the camera move is added in ffmpeg.
            await page.wait_for_timeout(seg.get("prime", 400))
            await asyncio.sleep(seg["seconds"] + 0.6)
            vid = page.video
            await ctx.close()
            dst = work / f"seg_{i:02d}_{seg['id']}.webm"
            Path(await vid.path()).rename(dst)
            out.append({**seg, "webm": dst})
            print(f"   captured {seg['id']}")

        await browser.close()
    return {"segments": out, "bumper": bumper, "closing": closing}


# --------------------------------------------------------------------------- #
# ffmpeg
# --------------------------------------------------------------------------- #
def run(cmd: list[str]) -> None:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        tail = "\n".join(p.stdout.splitlines()[-30:])
        raise RuntimeError(f"ffmpeg failed: {' '.join(cmd[:4])} …\n{tail}")


def ffprobe_dur(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace(":", r"\:").replace("'", r"\\'")


def camera_vf(move: str, z0: float, z1: float, dur: float) -> str:
    """A live camera over the 1620x2880 master → a 1080x1920 shot.

    Pan presets crop a fixed-zoom window and translate it (x,y animate per
    frame); push-in / pull-out animate the zoom about the centre. No page
    scrolling — this is a lens move over a held, animating frame.
    """
    base = f"fps={FPS},scale={MASTER_W}:{MASTER_H}:flags=lanczos,setsar=1"
    d = max(dur, 0.001)
    if move in ("push-in", "pull-out"):
        a, b = (z0, z1) if move == "push-in" else (z1, z0)
        zexpr = f"({a:.4f}+({b - a:.4f})*t/{d:.3f})"
        # master == output, so the scale factor is the zoom itself (>1 upscales
        # then a centre-crop keeps W x H).
        f = f"({zexpr})"
        return (f"{base},scale=w='{MASTER_W}*{f}':h='{MASTER_H}*{f}':eval=frame:flags=lanczos,"
                f"crop={W}:{H}:(iw-{W})/2:(ih-{H})/2,setsar=1")
    z = z0
    cw = int(round(MASTER_W / z)) & ~1
    ch = int(round(MASTER_H / z)) & ~1
    dx, dy = MASTER_W - cw, MASTER_H - ch
    p = f"(t/{d:.3f})"
    cx, cy = dx / 2, dy / 2
    table = {
        "diag-tl-br": (f"{dx}*{p}", f"{dy}*{p}"),
        "diag-br-tl": (f"{dx}*(1-{p})", f"{dy}*(1-{p})"),
        "diag-tr-bl": (f"{dx}*(1-{p})", f"{dy}*{p}"),
        "diag-bl-tr": (f"{dx}*{p}", f"{dy}*(1-{p})"),
        "pan-lr": (f"{dx}*{p}", f"{cy:.1f}"),
        "pan-rl": (f"{dx}*(1-{p})", f"{cy:.1f}"),
        "pan-tb": (f"{cx:.1f}", f"{dy}*{p}"),
        "pan-bt": (f"{cx:.1f}", f"{dy}*(1-{p})"),
    }
    xe, ye = table.get(move, table["pan-lr"])
    return f"{base},crop={cw}:{ch}:x='{xe}':y='{ye}',scale={W}:{H}:flags=lanczos,setsar=1"


def make_clip(src: Path, dst: Path, seconds: float, *, font: Path,
              label: str | None, credit: str | None, accent: str,
              move: str, z0: float, z1: float, from_start: bool = False,
              fade_in: bool = False, fade_out: bool = False) -> None:
    """One finished segment: trim → camera move → lower-third → (fades)."""
    dur = ffprobe_dur(src)
    # Cards keep their opening (the entrance animation); lesson holds keep their
    # tail (the richest, most-settled motion). Both skip the first 0.5s of any
    # load/flash.
    ss = 0.5 if from_start else max(0.0, dur - seconds)
    vf = [camera_vf(move, z0, z1, seconds)]
    if label:
        hexc = accent.lstrip("#")
        y0 = H - 312
        # A quiet broadcast lower-third that stays legible over busy frames: a
        # dark plate, an accent tick + rule, and outlined + shadowed type.
        vf.append(f"drawbox=x=58:y={y0 - 26}:w=626:h=156:color=0x09090f@0.46:t=fill")
        vf.append(f"drawbox=x=58:y={y0 - 26}:w=6:h=156:color=0x{hexc}@0.95:t=fill")
        vf.append(f"drawbox=x=86:y={y0}:w=300:h=4:color=0x{hexc}@0.9:t=fill")
        vf.append(
            f"drawtext=fontfile='{font}':text='{esc(label.upper())}':x=86:y={y0 + 22}:"
            f"fontsize=56:fontcolor=0x{hexc}:borderw=4:bordercolor=0x05050a@0.92:"
            f"shadowcolor=0x000000@0.55:shadowx=0:shadowy=3"
        )
        if credit:
            vf.append(
                f"drawtext=fontfile='{font}':text='{esc(credit)}':x=88:y={y0 + 92}:"
                f"fontsize=30:fontcolor=0xe8dec8:borderw=3:bordercolor=0x05050a@0.9:"
                f"shadowcolor=0x000000@0.45:shadowx=0:shadowy=2"
            )
    if fade_in:
        vf.append("fade=t=in:st=0:d=0.6:color=0x05050a")
    if fade_out:
        vf.append(f"fade=t=out:st={seconds - 0.7:.2f}:d=0.7:color=0x05050a")
    vf.append("format=yuv420p")
    run(["ffmpeg", "-y", "-ss", f"{ss:.3f}", "-i", str(src), "-t", f"{seconds:.3f}", "-an",
         "-vf", ",".join(vf), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-r", str(FPS), str(dst)])


def xfade_concat(clips: list[tuple[Path, float]], out: Path) -> float:
    """Crossfade-chain the clips. Returns the final total duration."""
    inputs: list[str] = []
    for p, _ in clips:
        inputs += ["-i", str(p)]
    fc = []
    prev = "0:v"
    offset = 0.0
    total = clips[0][1]
    for i in range(1, len(clips)):
        offset += clips[i - 1][1] - XFADE
        total += clips[i][1] - XFADE
        lbl = f"x{i}"
        fc.append(
            f"[{prev}][{i}:v]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}[{lbl}]"
        )
        prev = lbl
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc),
         "-map", f"[{prev}]", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", str(out)])
    return total


# --------------------------------------------------------------------------- #
# Stage — chill, optimistic score (numpy)
# --------------------------------------------------------------------------- #
def synth_score(path: Path, total: float, bumper: float) -> None:
    """A warm major-7 pad + soft arpeggio + bass + light brushed percussion."""
    n = int(total * SR)
    audio = np.zeros(n)
    rng = np.random.default_rng(7)

    def place(sig: np.ndarray, when: float, gain: float) -> None:
        s = int(when * SR)
        if s >= n:
            return
        m = min(n - s, len(sig))
        audio[s : s + m] += sig[:m] * gain

    def tone(freq, dur, *, partials=(1, 2, 3), amps=(1, 0.4, 0.18), decay=3.0, soft=0.004):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        sig = sum(a * np.sin(2 * np.pi * freq * k * tt) for k, a in zip(partials, amps))
        env = (1 - np.exp(-tt / soft)) * np.exp(-tt * decay)
        return sig * env

    # Warm progression: Cmaj7 – Em7 – Am7 – Fmaj7 (optimistic, gentle), 4s/chord.
    chords = [
        [261.63, 329.63, 392.00, 493.88],   # Cmaj7
        [329.63, 392.00, 493.88, 587.33],   # Em7
        [220.00, 261.63, 329.63, 392.00],   # Am7
        [349.23, 440.00, 523.25, 659.25],   # Fmaj7
    ]
    bar = 4.0  # seconds per chord
    # Soft sustained pad per chord.
    ci = 0
    when = 0.0
    while when < total:
        chord = chords[ci % len(chords)]
        m = int(bar * SR)
        tt = np.arange(m) / SR
        pad = np.zeros(m)
        for f in chord:
            pad += np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)
        pad /= len(chord)
        swell = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * tt - np.pi / 2)  # slow breath
        env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar - tt) / 0.6)
        place(pad * swell * env, when, 0.16)
        when += bar
        ci += 1

    # Gentle arpeggio over the chords — a hopeful, plucky sparkle (starts after
    # the bumper so the open is calm, then the collection "lights up").
    eighth = bar / 8
    ci = 0
    when = max(bumper - 0.5, 0.0)
    k = 0
    while when < total:
        chord = chords[ci % len(chords)]
        note = chord[[0, 2, 1, 3, 2, 3, 1, 2][k % 8]] * 2  # an octave up, bright
        place(tone(note, eighth * 1.6, partials=(1, 2), amps=(1, 0.3), decay=5.5), when, 0.07)
        k += 1
        when += eighth
        if k % 8 == 0:
            ci += 1

    # Soft round bass on the chord roots.
    ci = 0
    when = 0.0
    while when < total:
        root = chords[ci % len(chords)][0] / 2
        place(tone(root, bar * 0.92, partials=(1, 2), amps=(1, 0.15), decay=1.4), when, 0.12)
        when += bar
        ci += 1

    # Light brushed percussion: a soft heartbeat kick + an airy shaker — quiet,
    # chill, never driving. Eases in after the bumper.
    def kick(dur=0.22):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        f = 110 - 70 * np.exp(-tt * 30)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 11)

    def shaker(dur=0.08):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        return np.diff(rng.standard_normal(m + 1)) * np.exp(-tt * 55)

    beat = bar / 4  # quarter notes
    when = bumper
    j = 0
    while when < total:
        place(kick(), when, 0.18)
        place(shaker(), when + beat * 0.5, 0.05)
        if j % 2 == 1:
            place(shaker(0.06), when + beat * 0.25, 0.03)
        when += beat
        j += 1

    # Opening swell: a soft upward shimmer through the bumper into the first pan.
    if bumper > 0.4:
        m = int(bumper * SR)
        tt = np.arange(m) / SR
        ramp = (tt / bumper) ** 1.6
        shimmer = np.sin(2 * np.pi * (220 + 220 * ramp) * tt) * ramp * 0.06
        air = np.diff(rng.standard_normal(m + 1)) * ramp * 0.02
        audio[:m] += shimmer + air

    # Gentle global fades.
    fi = int(0.5 * SR)
    fo = int(1.2 * SR)
    audio[:fi] *= np.linspace(0, 1, fi)
    audio[-fo:] *= np.linspace(1, 0, fo)

    peak = float(np.max(np.abs(audio))) or 1.0
    audio = (audio / peak) * 0.9
    i16 = (audio * 32767).astype("<i2")
    stereo = np.repeat(i16[:, None], 2, axis=1).tobytes()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo)


def mux(video: Path, wav: Path, out: Path) -> None:
    run(["ffmpeg", "-y", "-i", str(video), "-i", str(wav),
         "-filter:a", "highpass=f=35,loudnorm=I=-15:TP=-1.5:LRA=11,alimiter=limit=0.9",
         "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac",
         "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
         str(out)])


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #
async def main_async() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--url", default="http://127.0.0.1:4173")
    ap.add_argument("--output", default="artifacts/interactive-lessons-showcase.mp4")
    ap.add_argument("--font", default="artifacts/fonts/JetBrainsMono-Bold.ttf")
    ap.add_argument("--workdir", default="artifacts/showcase-work")
    ap.add_argument("--rebuild", action="store_true",
                    help="reuse the recordings already in --workdir (skip capture)")
    ap.add_argument("--no-audio", action="store_true")
    ap.add_argument("--keep-work", action="store_true")
    args = ap.parse_args()

    work = Path(args.workdir)
    font = Path(args.font).resolve()

    if args.rebuild:
        print("[1/5] reusing recordings in workdir (skipping capture) …")
        cap = {
            "bumper": work / "bumper.webm",
            "closing": work / "closing.webm",
            "segments": [
                {**seg, "webm": work / f"seg_{i:02d}_{seg['id']}.webm"}
                for i, seg in enumerate(SEGMENTS)
            ],
        }
    else:
        if work.exists():
            shutil.rmtree(work)
        work.mkdir(parents=True, exist_ok=True)
        print(f"[1/5] recording cards + {len(SEGMENTS)} live holds …")
        cap = await capture(args, work)

    print("[2/5] flying the camera + labeling clips …")
    clips: list[tuple[Path, float]] = []
    bumper_clip = work / "c_bumper.mp4"
    make_clip(cap["bumper"], bumper_clip, BUMPER_SECONDS, font=font, label=None, credit=None,
              accent="#e8dec8", move="push-in", z0=1.02, z1=1.12, from_start=True, fade_in=True)
    clips.append((bumper_clip, BUMPER_SECONDS))
    for i, seg in enumerate(cap["segments"]):
        dst = work / f"c_{i:02d}_{seg['id']}.mp4"
        make_clip(seg["webm"], dst, seg["seconds"], font=font,
                  label=seg.get("label"), credit=seg.get("credit"),
                  accent=seg.get("accent", "#e8dec8"), move=seg.get("move", "pan-lr"),
                  z0=seg.get("zoom", 1.5), z1=seg.get("zoom2", seg.get("zoom", 1.5)))
        clips.append((dst, seg["seconds"]))
    closing_clip = work / "c_closing.mp4"
    make_clip(cap["closing"], closing_clip, CLOSING_SECONDS, font=font, label=None, credit=None,
              accent="#e8dec8", move="push-in", z0=1.02, z1=1.10, from_start=True, fade_out=True)
    clips.append((closing_clip, CLOSING_SECONDS))

    print("[3/5] crossfading segments …")
    video_only = work / "video.mp4"
    total = xfade_concat(clips, video_only)
    print(f"      total ~{total:.1f}s")

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    if args.no_audio:
        shutil.copy(video_only, out)
    else:
        print("[4/5] synthesizing chill score …")
        wav = work / "score.wav"
        synth_score(wav, total, BUMPER_SECONDS)
        print("[5/5] muxing …")
        mux(video_only, wav, out)

    final = ffprobe_dur(out)
    print(f"\nwrote {out}  ({final:.1f}s, {out.stat().st_size // 1024} KB, {W}x{H})")
    if not args.keep_work and not args.rebuild:
        shutil.rmtree(work, ignore_errors=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main_async()))
