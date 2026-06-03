#!/usr/bin/env python3
"""Stage B of the Glassbox reel: the brand bumpers. The real index-page GlassCube
(a clear glass cube with a glowing nebula inside — "the black box, made of glass")
spins at the center while the wordmark + tagline rise in. Recorded at dsf=1."""
from __future__ import annotations
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

W, H = 1080, 1920
OUT = Path("artifacts/reel")
OUT.mkdir(parents=True, exist_ok=True)

# The GlassCube, faithfully ported from src/index-page/index-page.css (.gb-*),
# scaled up and spun a little faster so it visibly turns during a ~5s bumper.
CUBE_CSS = """
 .gb-stage{--gb-size:VAR_SIZE;--gb-half:calc(var(--gb-size)/2);position:relative;
   width:var(--gb-size);height:var(--gb-size);display:flex;align-items:center;justify-content:center}
 .gb-glow{position:absolute;inset:-18%;pointer-events:none;z-index:0;filter:blur(8px);
   background:radial-gradient(circle at 50% 48%, rgba(154,184,232,.30), transparent 52%),
     radial-gradient(circle at 40% 62%, rgba(94,234,212,.16), transparent 56%),
     radial-gradient(circle at 62% 58%, rgba(196,181,253,.20), transparent 56%);
   animation:gb-bloom 5s ease-in-out infinite alternate}
 @keyframes gb-bloom{from{opacity:.7;transform:scale(.96)}to{opacity:1;transform:scale(1.04)}}
 .gb-scene{position:relative;z-index:1;width:var(--gb-size);height:var(--gb-size);
   perspective:1100px;perspective-origin:50% 42%}
 .gb-cube{position:absolute;inset:0;transform-style:preserve-3d;animation:gb-spin 13s linear infinite}
 @keyframes gb-spin{from{transform:rotateX(-22deg) rotateY(-32deg)}to{transform:rotateX(-22deg) rotateY(328deg)}}
 .gb-face{position:absolute;top:50%;left:50%;width:var(--gb-size);height:var(--gb-size);
   margin:calc(var(--gb-half)*-1) 0 0 calc(var(--gb-half)*-1);border:1px solid rgba(232,222,200,.4);
   border-radius:7px;box-shadow:inset 0 1px 0 rgba(255,252,240,.3), inset 0 0 18px rgba(154,184,232,.06);
   background:linear-gradient(135deg, rgba(154,184,232,.06), rgba(196,181,253,.04))}
 .gb-face::after{content:'';position:absolute;inset:0;border-radius:7px;
   background:linear-gradient(125deg, transparent 45%, rgba(255,252,240,.14) 49.5%, transparent 54%)}
 .gb-front{transform:translateZ(var(--gb-half))}
 .gb-back{transform:rotateY(180deg) translateZ(var(--gb-half))}
 .gb-right{transform:rotateY(90deg) translateZ(var(--gb-half));background:linear-gradient(135deg, rgba(94,234,212,.06), rgba(154,184,232,.02))}
 .gb-left{transform:rotateY(-90deg) translateZ(var(--gb-half));background:linear-gradient(135deg, rgba(196,181,253,.06), rgba(154,184,232,.02))}
 .gb-top{transform:rotateX(90deg) translateZ(var(--gb-half));background:linear-gradient(135deg, rgba(232,222,200,.11), rgba(154,184,232,.05));border-color:rgba(232,222,200,.48)}
 .gb-bottom{transform:rotateX(-90deg) translateZ(var(--gb-half));background:linear-gradient(135deg, rgba(154,184,232,.03), rgba(10,10,15,.1));border-color:rgba(232,222,200,.18)}
 .gb-nebula{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;background-blend-mode:screen}
 .gb-nb-back{width:82%;height:82%;margin:-41% 0 0 -41%;filter:blur(10px);opacity:.55;
   background:radial-gradient(circle at 32% 40%, rgba(196,181,253,.85), transparent 48%),
     radial-gradient(circle at 70% 62%, rgba(94,234,212,.6), transparent 50%),
     radial-gradient(circle at 56% 28%, rgba(154,184,232,.7), transparent 46%),
     radial-gradient(circle at 64% 74%, rgba(253,164,175,.42), transparent 50%);
   animation:gb-nbk 6s ease-in-out infinite alternate}
 .gb-nb-front{width:66%;height:66%;margin:-33% 0 0 -33%;filter:blur(5px);
   background:radial-gradient(circle at 52% 50%, rgba(255,252,240,1), rgba(255,252,240,0) 15%),
     radial-gradient(circle at 38% 36%, rgba(196,181,253,.95), transparent 44%),
     radial-gradient(circle at 66% 54%, rgba(94,234,212,.82), transparent 46%),
     radial-gradient(circle at 56% 70%, rgba(253,164,175,.6), transparent 46%),
     radial-gradient(circle at 48% 26%, rgba(154,184,232,.9), transparent 44%);
   box-shadow:0 0 22px 2px rgba(154,184,232,.34), 0 0 48px 8px rgba(196,181,253,.14);
   animation:gb-nbf 5s ease-in-out infinite alternate, gb-pulse 4s ease-in-out infinite}
 @keyframes gb-nbk{from{transform:translateZ(calc(var(--gb-half)*-.45)) translate(3%,-2%) scale(1.05)}to{transform:translateZ(calc(var(--gb-half)*-.45)) translate(0,0) scale(1)}}
 @keyframes gb-nbf{from{transform:translateZ(calc(var(--gb-half)*.42)) translate(-4%,3%) scale(.95)}to{transform:translateZ(calc(var(--gb-half)*.42)) translate(0,0) scale(1)}}
 @keyframes gb-pulse{0%,100%{opacity:.85}50%{opacity:1}}
 .gb-stars{position:absolute;top:50%;left:50%;width:92%;height:92%;margin:-46% 0 0 -46%;border-radius:50%;pointer-events:none;
   background-image:radial-gradient(1.5px 1.5px at 22% 30%, rgba(255,252,240,.95), transparent 60%),
     radial-gradient(1.2px 1.2px at 70% 24%, rgba(255,252,240,.85), transparent 60%),
     radial-gradient(1.1px 1.1px at 38% 66%, rgba(255,252,240,.8), transparent 60%),
     radial-gradient(1.4px 1.4px at 80% 60%, rgba(196,181,253,.9), transparent 60%),
     radial-gradient(1.1px 1.1px at 56% 46%, rgba(255,252,240,.9), transparent 60%),
     radial-gradient(1.2px 1.2px at 28% 48%, rgba(154,184,232,.85), transparent 60%),
     radial-gradient(1.3px 1.3px at 48% 18%, rgba(94,234,212,.8), transparent 60%);
   animation:gb-tw 5s ease-in-out infinite}
 @keyframes gb-tw{0%,100%{opacity:.5}50%{opacity:.95}}
"""

CUBE_HTML = """<div class='gb-stage'><div class='gb-glow'></div><div class='gb-scene'><div class='gb-cube'>
 <span class='gb-face gb-front'></span><span class='gb-face gb-back'></span>
 <span class='gb-face gb-right'></span><span class='gb-face gb-left'></span>
 <span class='gb-face gb-top'></span><span class='gb-face gb-bottom'></span>
 <span class='gb-nebula gb-nb-back'></span><span class='gb-stars'></span><span class='gb-nebula gb-nb-front'></span>
</div></div></div>"""

HEAD = """<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
 html,body{margin:0;height:100%;background:#08080d;color:#e8dec8;overflow:hidden;font-synthesis:none}
 *{box-sizing:border-box}
 .bg{position:fixed;inset:0;z-index:0;background-image:
   radial-gradient(ellipse at 24% 20%, rgba(154,184,232,.13), transparent 52%),
   radial-gradient(ellipse at 80% 26%, rgba(94,234,212,.07), transparent 54%),
   radial-gradient(ellipse at 40% 84%, rgba(253,164,175,.06), transparent 55%),
   radial-gradient(ellipse at 78% 82%, rgba(196,181,253,.08), transparent 56%);
   animation:breathe 14s ease-in-out infinite alternate}
 @keyframes breathe{from{transform:scale(1)}to{transform:scale(1.05) translate(-1%,-1%)}}
 .grain{position:fixed;inset:0;z-index:0;opacity:.045;mix-blend-mode:screen;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
 .wrap{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 8%}
 @keyframes rise{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
 @keyframes cube-in{from{opacity:0;transform:scale(.74)}to{opacity:1;transform:scale(1)}}
 @keyframes soft{from{opacity:0}to{opacity:1}}
 .cubewrap{opacity:0;animation:cube-in 1.0s .15s cubic-bezier(.2,.8,.2,1) forwards}
 .eyebrow{font-family:'JetBrains Mono',monospace;letter-spacing:.32em;text-transform:uppercase;opacity:0}
 h1{font-family:'Fraunces',serif;font-weight:330;line-height:.96;letter-spacing:-.025em;margin:0;opacity:0}
 .tag{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;opacity:0;color:rgba(232,222,200,.82)}
</style>"""


def open_html() -> str:
    return f"""<!doctype html><html><head><meta charset='utf-8'>{HEAD}
<style>
 {CUBE_CSS.replace("VAR_SIZE", "430px")}
 .eyebrow{{font-size:23px;color:rgba(154,184,232,.85);margin:0 0 54px;animation:soft 1s 1.7s forwards}}
 h1{{font-size:138px;margin:46px 0 0;animation:rise 1.1s .65s cubic-bezier(.2,.8,.2,1) forwards}}
 .tag{{font-size:46px;margin:22px 0 0;animation:rise 1.1s 1.15s cubic-bezier(.2,.8,.2,1) forwards}}
</style></head><body><div class='bg'></div><div class='grain'></div>
 <div class='wrap'>
   <div class='eyebrow'>The black box &mdash; made of glass</div>
   <div class='cubewrap'>{CUBE_HTML}</div>
   <h1>Glassbox</h1>
   <div class='tag'>hard topics, made clear</div>
 </div></body></html>"""


def close_html() -> str:
    return f"""<!doctype html><html><head><meta charset='utf-8'>{HEAD}
<style>
 {CUBE_CSS.replace("VAR_SIZE", "300px")}
 h1{{font-size:104px;margin:30px 0 0;animation:rise 1.1s .5s cubic-bezier(.2,.8,.2,1) forwards}}
 h1 em{{font-family:'Cormorant Garamond',serif;font-style:italic;color:rgba(232,222,200,.62)}}
 .tag{{font-size:42px;margin:20px 0 0;animation:rise 1.1s 1.0s cubic-bezier(.2,.8,.2,1) forwards}}
 .eyebrow{{font-size:22px;color:rgba(232,222,200,.5);margin:48px 0 0;animation:soft 1.1s 1.6s forwards}}
</style></head><body><div class='bg'></div><div class='grain'></div>
 <div class='wrap'>
   <div class='cubewrap'>{CUBE_HTML}</div>
   <h1>See straight <em>through.</em></h1>
   <div class='tag'>eighteen systems you can poke, prod, and see through</div>
   <div class='eyebrow'>Glassbox</div>
 </div></body></html>"""


async def main():
    cards = {"bumper_open": open_html(), "bumper_close": close_html()}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--force-color-profile=srgb"])
        for name, html in cards.items():
            ctx = await b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1,
                                      record_video_dir=str(OUT), record_video_size={"width": W, "height": H})
            pg = await ctx.new_page()
            await pg.set_content(html, wait_until="networkidle")
            await pg.wait_for_timeout(600)  # let webfonts + entrance settle
            await pg.screenshot(path=str(OUT / f"{name}_mid.png"))
            await asyncio.sleep(5.4)
            vid = pg.video
            await ctx.close()
            Path(await vid.path()).rename(OUT / f"{name}.webm")
            print(f"wrote {name}.webm")
        await b.close()

asyncio.run(main())
