#!/usr/bin/env python3
"""Stage A of the Glassbox reel: capture a flat, live-animating ~7s master per
lesson (1080x1920). Heroes that auto-animate need no trigger; lab-driven ones
name a control to click, then we frame the lit figure. dsf=2 for crisp masters
(the flat capture is light enough to stay drop-free); the 3D-float records that
consume these run at dsf=1."""
from __future__ import annotations
import asyncio, re, sys
from pathlib import Path
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4188"
W, H = 1080, 1920
OUT = Path("artifacts/reel/masters")
OUT.mkdir(parents=True, exist_ok=True)
HOLD = 7.0

LESSONS = [
    dict(id="index", url="/", settle=1400, start_frac=0.16),
    dict(id="sha", url="/?lesson=sha", settle=1800, prime=1300, center_lab=True,
         triggers=[r"run rounds", r"diffuse", r"\bplay\b", r"\brun\b"]),
    dict(id="hyperloglog", url="/?lesson=hyperloglog", settle=1500, prime=900, center_lab=True,
         triggers=[r"stream \+20", r"stream \+2", r"step one item"]),
    dict(id="vp-tree", url="/?lesson=vp-tree", settle=1500, start_frac=0.12),
    dict(id="swim", url="/?lesson=swim", settle=1500, start_frac=0.0),
    dict(id="lsm-trees", url="/?lesson=lsm-trees", settle=1500, prime=6000, center_lab=True,
         lab_bias=0.34, triggers=[r"\brun\b", r"compact", r"\bplay\b"]),
    dict(id="bloom-clock", url="/?lesson=bloom-clock", settle=1500, start_frac=0.0),
    dict(id="merkle-trees", url="/?lesson=merkle-trees", settle=650, start_frac=0.0),
    dict(id="tls", url="/?lesson=tls", settle=1700, start_frac=0.02),
    dict(id="b-trees", url="/?lesson=b-trees", settle=1500, start_frac=0.015),
]


async def main():
    want = sys.argv[2:] or [s["id"] for s in LESSONS]
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--force-color-profile=srgb"])
        for seg in LESSONS:
            if seg["id"] not in want:
                continue
            ctx = await b.new_context(viewport={"width": W, "height": H}, device_scale_factor=2,
                                      record_video_dir=str(OUT), record_video_size={"width": W, "height": H})
            pg = await ctx.new_page()
            await pg.goto(URL + seg["url"], wait_until="domcontentloaded", timeout=30000)
            await pg.wait_for_timeout(seg["settle"])
            hit = None
            for pat in seg.get("triggers", []):
                btn = pg.get_by_role("button", name=re.compile(pat, re.I)).first
                try:
                    if await btn.count() and await btn.is_visible():
                        await btn.scroll_into_view_if_needed(timeout=2500)
                        await pg.wait_for_timeout(200)
                        hit = await btn.element_handle()
                        await btn.click(timeout=2500)
                        break
                except Exception:
                    continue
            if hit is not None and seg.get("center_lab"):
                try:
                    await hit.evaluate("""(el,bias)=>{const f=el.closest('figure,.fig,[class*=\"fig\"]')||el;
                      const r=f.getBoundingClientRect();
                      window.scrollTo(0, Math.max(0, Math.round(window.scrollY+r.top+r.height*bias-window.innerHeight/2)));}""",
                                       seg.get("lab_bias", 0.5))
                except Exception:
                    pass
            if "start_frac" in seg:
                doc = await pg.evaluate("() => document.body.scrollHeight")
                await pg.evaluate("(y) => window.scrollTo(0, y)", int(seg["start_frac"] * doc))
            await pg.wait_for_timeout(seg.get("prime", 400))
            await asyncio.sleep(HOLD)
            vid = pg.video
            await ctx.close()
            Path(await vid.path()).rename(OUT / f"master_{seg['id']}.webm")
            print(f"captured {seg['id']}")
        await b.close()

asyncio.run(main())
