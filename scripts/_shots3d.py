#!/usr/bin/env python3
"""Stage C of the Glassbox reel: render the per-lesson 3D-float shots. Each lesson
master plays as live video on a CSS-3D glass slab (true perspective + reflection +
an accent-tinted edge glow) floating in the brand void. dsf=1 for steady 25fps."""
from __future__ import annotations
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

W, H = 1080, 1920
MAS = Path("artifacts/reel/masters")
OUT = Path("artifacts/reel/shots")
OUT.mkdir(parents=True, exist_ok=True)

MOVES = {
    "bank": dict(persp=1150, origin="50% 56%", wpct=132, dur=12, vid="",
        kf="0%{transform:rotateX(31deg) rotateZ(-8deg) translateX(-4%) translateY(7%)}"
           "100%{transform:rotateX(26deg) rotateZ(7deg) translateX(4%) translateY(4%)}"),
    "orbit": dict(persp=1500, origin="50% 47%", wpct=106, dur=13, vid="",
        kf="0%{transform:rotateY(-12deg) rotateX(4deg) translateZ(60px) translateY(-1%)}"
           "50%{transform:rotateY(12deg) rotateX(3deg) translateZ(120px) translateY(-3%)}"
           "100%{transform:rotateY(-12deg) rotateX(4deg) translateZ(60px) translateY(-1%)}"),
    "dive": dict(persp=1300, origin="50% 42%", wpct=108, dur=11, vid="",
        kf="0%{transform:rotateX(13deg) rotateY(-9deg) translateZ(-20px) translateY(-3%)}"
           "100%{transform:rotateX(3deg) rotateY(0deg) translateZ(380px) translateY(11%)}"),
    "hover": dict(persp=1500, origin="50% 44%", wpct=106, dur=7, vid="",
        kf="0%{transform:translateY(1.5%) rotateX(5deg) rotateY(-4deg) translateZ(40px)}"
           "50%{transform:translateY(-2.5%) rotateX(3deg) rotateY(4deg) translateZ(95px)}"
           "100%{transform:translateY(1.5%) rotateX(5deg) rotateY(-4deg) translateZ(40px)}"),
    "closeup": dict(persp=1600, origin="50% 42%", wpct=102, dur=9,
        vid="transform:scale(1.95) translate(-3%,-9%);transform-origin:center center",
        kf="0%{transform:rotateY(-5deg) rotateX(4deg) translateZ(40px) translateY(0)}"
           "50%{transform:rotateY(5deg) rotateX(2deg) translateZ(90px) translateY(-1%)}"
           "100%{transform:rotateY(-5deg) rotateX(4deg) translateZ(40px) translateY(0)}"),
}

# lesson id -> (move, accent hex). The seven 3D shots; the move varies so the reel
# never repeats a gesture back-to-back, and the glow takes each lesson's accent.
JOBS = [
    ("index", "bank", "9ab8e8"),
    ("sha", "closeup", "e07a3c"),
    ("vp-tree", "orbit", "ffb454"),
    ("lsm-trees", "dive", "e3582c"),
    ("bloom-clock", "hover", "f5b942"),
    ("tls", "orbit", "46d6c6"),
    ("b-trees", "bank", "4aa3c7"),
]


def wrapper(v: dict, master_abs: str, accent: str) -> str:
    h = round(v["wpct"] / 100 * W * (H / W))
    return f"""<!doctype html><html><head><meta charset='utf-8'><style>
 html,body{{margin:0;height:100%;background:#08080d;overflow:hidden}}
 .bg{{position:fixed;inset:0;background-image:
   radial-gradient(ellipse at 24% 18%, rgba(154,184,232,.15), transparent 50%),
   radial-gradient(ellipse at 82% 28%, rgba(94,234,212,.08), transparent 54%),
   radial-gradient(ellipse at 36% 86%, #{accent}14, transparent 55%),
   radial-gradient(ellipse at 80% 82%, rgba(196,181,253,.10), transparent 56%);
   animation:breathe 16s ease-in-out infinite alternate}}
 @keyframes breathe{{from{{transform:scale(1)}}to{{transform:scale(1.05) translate(-1%,-1%)}}}}
 .grain{{position:fixed;inset:0;opacity:.05;mix-blend-mode:screen;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}}
 .stage{{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
   perspective:{v['persp']}px;perspective-origin:{v['origin']}}}
 .float{{width:{round(v['wpct']/100*W)}px;height:{h}px;transform-style:preserve-3d;
   animation:fl {v['dur']}s ease-in-out infinite}}
 .slab{{position:absolute;inset:0;border-radius:14px;overflow:hidden;
   border:1px solid rgba(232,222,200,.20);
   box-shadow:0 70px 130px rgba(0,0,0,.62), 0 14px 40px rgba(0,0,0,.5),
     0 0 70px #{accent}24, inset 0 1px 0 rgba(255,252,240,.16)}}
 .slab video{{width:100%;height:100%;object-fit:cover;display:block;{v['vid']}}}
 .glow{{position:absolute;inset:-3px;border-radius:17px;pointer-events:none;
   box-shadow:0 0 0 1px #{accent}5c, 0 0 34px 3px #{accent}33, 0 0 78px 10px #{accent}1c}}
 @keyframes fl{{{v['kf']}}}
</style></head><body>
 <div class='bg'></div><div class='grain'></div>
 <div class='stage'><div class='float'>
   <div class='slab'><video id='v' src='file://{master_abs}' autoplay muted loop playsinline></video>
     <div class='glow'></div></div>
 </div></div>
 <script>const v=document.getElementById('v');v.play&&v.play();</script>
</body></html>"""


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--force-color-profile=srgb", "--autoplay-policy=no-user-gesture-required"])
        for lesson, move, accent in JOBS:
            master = (MAS / f"master_{lesson}.webm").resolve()
            if not master.exists():
                print(f"SKIP {lesson}: no master"); continue
            v = MOVES[move]
            html = OUT / f"_{lesson}.html"
            html.write_text(wrapper(v, str(master), accent))
            ctx = await b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1,
                                      record_video_dir=str(OUT), record_video_size={"width": W, "height": H})
            pg = await ctx.new_page()
            await pg.goto(f"file://{html.resolve()}", wait_until="networkidle")
            await pg.wait_for_timeout(250)
            await pg.evaluate("() => { const v=document.getElementById('v'); if(v){v.currentTime=2.6; v.play();} }")
            await pg.wait_for_timeout(300)
            await asyncio.sleep(5.6)
            vid = pg.video
            await ctx.close()
            Path(await vid.path()).rename(OUT / f"{lesson}_3d.webm")
            print(f"rendered {lesson}_3d ({move}, #{accent})")
        await b.close()

asyncio.run(main())
