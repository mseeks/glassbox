#!/usr/bin/env python3
"""Prototype TRUE browser-3D 'floating page' looks: play a recorded lesson master
as a <video> inside a CSS perspective/3D-transformed glass slab (real reflection,
edge glow, shadow, orbit/hover), and record the result. The browser does genuine
3D, so the page floats in space with its animation live."""
from __future__ import annotations
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

MASTER = sys.argv[1] if len(sys.argv) > 1 else "artifacts/proto/master_sha.webm"
OUT = Path("artifacts/proto/r3d")
OUT.mkdir(parents=True, exist_ok=True)
MASTER_ABS = str(Path(MASTER).resolve())
W, H = 1080, 1920

# Each variant: perspective px, perspective-origin, slab width % (FILL the frame:
# ~100-128% so the page dominates), keyframes, dur, optional reflection, and an
# optional `vid` transform that zooms the recording itself into a close-up.
VARIANTS = {
    # Hero: a near-full-frame slab orbiting around its vertical axis.
    "css_orbit": dict(
        persp=1500, origin="50% 47%", wpct=106, dur=13, vid="",
        kf="""0%{transform:rotateY(-12deg) rotateX(4deg) translateZ(60px) translateY(-1%)}
              50%{transform:rotateY(12deg) rotateX(3deg) translateZ(120px) translateY(-3%)}
              100%{transform:rotateY(-12deg) rotateX(4deg) translateZ(60px) translateY(-1%)}""",
        reflect=""),
    # Push-through: the slab dollies from mid-distance to over-the-camera (ends filling).
    "css_dolly": dict(
        persp=1100, origin="50% 47%", wpct=110, dur=8.5, vid="",
        kf="""0%{transform:translateZ(-360px) rotateX(8deg) translateY(-2%)}
              100%{transform:translateZ(300px) rotateX(3deg) translateY(3%)}""",
        reflect=""),
    # Banking fly-over: a huge page tilted like a table, camera banks across it.
    "css_bank": dict(
        persp=1150, origin="50% 56%", wpct=132, dur=12, vid="",
        kf="""0%{transform:rotateX(31deg) rotateZ(-8deg) translateX(-4%) translateY(7%)}
              100%{transform:rotateX(26deg) rotateZ(7deg) translateX(4%) translateY(4%)}""",
        reflect=""),
    # Lifted card hover-bob, now filling the frame.
    "css_hover": dict(
        persp=1500, origin="50% 44%", wpct=106, dur=7, vid="",
        kf="""0%{transform:translateY(1.5%) rotateX(5deg) rotateY(-4deg) translateZ(40px)}
              50%{transform:translateY(-2.5%) rotateX(3deg) rotateY(4deg) translateZ(95px)}
              100%{transform:translateY(1.5%) rotateX(5deg) rotateY(-4deg) translateZ(40px)}""",
        reflect=""),
    # COMBINATION 1 — the dive: a tilted 3D hero that pushes DOWN into the page and
    # levels toward flat, ending close on the live content (float -> close-up).
    "css_dive": dict(
        persp=1300, origin="50% 42%", wpct=108, dur=11, vid="",
        kf="""0%{transform:rotateX(13deg) rotateY(-9deg) translateZ(-20px) translateY(-3%)}
              100%{transform:rotateX(3deg) rotateY(0deg) translateZ(380px) translateY(11%)}""",
        reflect=""),
    # COMBINATION 2 — 3D close-up: the recording itself zoomed onto the avalanche
    # grid, carried on a slab with a subtle dimensional drift ("like before", elevated).
    "css_closeup": dict(
        persp=1600, origin="50% 42%", wpct=102, dur=9,
        vid="transform:scale(1.95) translate(-3%,-9%);transform-origin:center center",
        kf="""0%{transform:rotateY(-5deg) rotateX(4deg) translateZ(40px) translateY(0)}
              50%{transform:rotateY(5deg) rotateX(2deg) translateZ(90px) translateY(-1%)}
              100%{transform:rotateY(-5deg) rotateX(4deg) translateZ(40px) translateY(0)}""",
        reflect=""),
}


def wrapper_html(v: dict) -> str:
    h = round(v["wpct"] / 100 * W * (H / W))  # keep 9:16
    return f"""<!doctype html><html><head><meta charset='utf-8'><style>
 html,body{{margin:0;height:100%;background:#08080d;overflow:hidden}}
 .bg{{position:fixed;inset:0;background-image:
   radial-gradient(ellipse at 24% 18%, rgba(154,184,232,.16), transparent 50%),
   radial-gradient(ellipse at 82% 28%, rgba(94,234,212,.09), transparent 54%),
   radial-gradient(ellipse at 36% 86%, rgba(253,164,175,.07), transparent 55%),
   radial-gradient(ellipse at 80% 82%, rgba(196,181,253,.10), transparent 56%);
   animation:breathe 16s ease-in-out infinite alternate}}
 @keyframes breathe{{from{{transform:scale(1)}}to{{transform:scale(1.05) translate(-1%,-1%)}}}}
 .grain{{position:fixed;inset:0;opacity:.05;mix-blend-mode:screen;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}}
 .stage{{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
   perspective:{v['persp']}px;perspective-origin:{v['origin']}}}
 .float{{width:{round(v['wpct']/100*W)}px;height:{h}px;transform-style:preserve-3d;
   animation:fl {v['dur']}s ease-in-out infinite;{v['reflect']}}}
 .slab{{position:absolute;inset:0;border-radius:14px;overflow:hidden;
   border:1px solid rgba(232,222,200,.22);
   box-shadow:0 70px 130px rgba(0,0,0,.62), 0 14px 40px rgba(0,0,0,.5),
     0 0 64px rgba(154,184,232,.10), inset 0 1px 0 rgba(255,252,240,.18)}}
 .slab video{{width:100%;height:100%;object-fit:cover;display:block;{v['vid']}}}
 /* cool chromatic edge glow */
 .glow{{position:absolute;inset:-3px;border-radius:16px;pointer-events:none;
   box-shadow:0 0 0 1px rgba(154,184,232,.30), 0 0 30px 2px rgba(196,181,253,.14)}}
 @keyframes fl{{{v['kf']}}}
</style></head><body>
 <div class='bg'></div><div class='grain'></div>
 <div class='stage'><div class='float'>
   <div class='slab'><video id='v' src='file://{MASTER_ABS}' autoplay muted loop playsinline></video>
     <div class='glow'></div></div>
 </div></div>
 <script>const v=document.getElementById('v');v.play&&v.play();</script>
</body></html>"""


async def main():
    names = sys.argv[2:] or list(VARIANTS)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--force-color-profile=srgb", "--autoplay-policy=no-user-gesture-required"])
        for name in names:
            v = VARIANTS[name]
            html = OUT / f"{name}.html"
            html.write_text(wrapper_html(v))
            ctx = await b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1,
                                      record_video_dir=str(OUT), record_video_size={"width": W, "height": H})
            pg = await ctx.new_page()
            await pg.goto(f"file://{html.resolve()}", wait_until="networkidle")
            await pg.wait_for_timeout(300)
            await pg.evaluate("() => { const v=document.getElementById('v'); if(v){v.currentTime=3.0; v.play();} }")
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=str(OUT / f"{name}_mid.png"))
            await asyncio.sleep(5.2)
            vid = pg.video
            await ctx.close()
            Path(await vid.path()).rename(OUT / f"{name}.webm")
            print(f"wrote {name}.webm + {name}_mid.png")
        await b.close()

asyncio.run(main())
