#!/usr/bin/env python3
"""Stage E of the Glassbox reel: assemble the silent cut. Builds each shot
(3D-float shots get a trim; the three 'flat' lessons get a cinematic ffmpeg
camera punch-in), lays an accent lower-third on each, smooths everything to a
clean 60fps with light motion-blur (kills the 25->30 judder), and crossfade-
chains bumper_open -> 10 lessons -> bumper_close. Music is muxed separately."""
from __future__ import annotations
import subprocess
from pathlib import Path

W, H, FPS, XFADE = 1080, 1920, 60, 0.34
REEL = Path("artifacts/reel")
SHOTS = REEL / "shots"
MAS = REEL / "masters"
WORK = REEL / "work"
WORK.mkdir(parents=True, exist_ok=True)
FONTB = str((REEL.parent / "fonts/JetBrainsMono-Bold.ttf").resolve())

# id, treatment(3d|flat), accent, label, credit, seconds, [flat camera move/zoom]
SHOTLIST = [
    ("index", "3d", "9ab8e8", "The Collection", "eighteen systems, one glass box", 3.4, None),
    ("sha", "3d", "e07a3c", "SHA-256", "the one-way machine", 3.3, None),
    ("hyperloglog", "flat", "e3a13c", "HyperLogLog", "Flajolet et al. · 2007", 3.3, ("pan-rl", 1.5, 1.5)),
    ("vp-tree", "3d", "ffb454", "Vantage-Point Trees", "Peter Yianilos · 1993", 3.3, None),
    ("swim", "flat", "fda4af", "SWIM", "Das · Gupta · Motivala · 2002", 3.3, ("diag-tl-br", 1.42, 1.42)),
    ("lsm-trees", "3d", "e3582c", "LSM Trees", "O’Neil et al. · 1996", 3.5, None),
    ("bloom-clock", "3d", "f5b942", "The Bloom Clock", "distributed causality", 3.3, None),
    ("merkle-trees", "flat", "5bc0a3", "Merkle Trees", "Ralph C. Merkle · 1979", 3.3, ("diag-br-tl", 1.45, 1.45)),
    ("tls", "3d", "46d6c6", "TLS", "IETF · RFC 8446", 3.3, None),
    ("b-trees", "3d", "4aa3c7", "B-Trees", "Bayer & McCreight · 1970", 3.4, None),
]
BUMP_OPEN_S, BUMP_CLOSE_S = 4.2, 3.9


def run(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        raise RuntimeError("ffmpeg failed:\n" + "\n".join(p.stdout.splitlines()[-25:]))


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "default=nw=1:nk=1", str(p)], capture_output=True, text=True).stdout.strip())


def esc(t):
    return t.replace("\\", "\\\\").replace(":", r"\:").replace("'", r"\'")


def smooth():
    return f"minterpolate=fps={FPS}:mi_mode=blend"


def camera_vf(move, z0, z1, d):
    """Eased camera (crop+pan or push/pull) over a flat master. Smoothstep on the
    pan progression for a cinematic accel/decel; push/pull eases the zoom."""
    base = f"scale={W}:{H}:flags=lanczos,setsar=1"
    d = max(d, 0.001)
    if move in ("push-in", "pull-out"):
        a, b = (z0, z1) if move == "push-in" else (z1, z0)
        u = f"(t/{d:.3f})"
        e = f"({u}*{u}*(3-2*{u}))"
        z = f"({a:.4f}+({b - a:.4f})*{e})"
        return (f"{base},scale=w='{W}*{z}':h='{H}*{z}':eval=frame:flags=lanczos,"
                f"crop={W}:{H}:(iw-{W})/2:(ih-{H})/2,setsar=1")
    z = z0
    cw = int(round(W / z)) & ~1
    ch = int(round(H / z)) & ~1
    dx, dy = W - cw, H - ch
    u = f"(t/{d:.3f})"
    e = f"({u}*{u}*(3-2*{u}))"  # smoothstep
    cx, cy = dx / 2, dy / 2
    table = {
        "diag-tl-br": (f"{dx}*{e}", f"{dy}*{e}"),
        "diag-br-tl": (f"{dx}*(1-{e})", f"{dy}*(1-{e})"),
        "diag-tr-bl": (f"{dx}*(1-{e})", f"{dy}*{e}"),
        "pan-lr": (f"{dx}*{e}", f"{cy:.1f}"),
        "pan-rl": (f"{dx}*(1-{e})", f"{cy:.1f}"),
    }
    xe, ye = table.get(move, table["pan-rl"])
    return f"{base},crop={cw}:{ch}:x='{xe}':y='{ye}',scale={W}:{H}:flags=lanczos,setsar=1"


def lower_third(label, credit, accent):
    hexc = accent
    y0 = H - 300
    vf = [
        f"drawbox=x=58:y={y0 - 26}:w=666:h=158:color=0x09090f@0.5:t=fill",
        f"drawbox=x=58:y={y0 - 26}:w=6:h=158:color=0x{hexc}@0.95:t=fill",
        f"drawbox=x=86:y={y0}:w=300:h=4:color=0x{hexc}@0.9:t=fill",
        (f"drawtext=fontfile='{FONTB}':text='{esc(label.upper())}':x=86:y={y0 + 22}:"
         f"fontsize=56:fontcolor=0x{hexc}:borderw=4:bordercolor=0x05050a@0.92:"
         f"shadowcolor=0x000000@0.55:shadowx=0:shadowy=3"),
    ]
    if credit:
        vf.append(f"drawtext=fontfile='{FONTB}':text='{esc(credit)}':x=88:y={y0 + 92}:"
                  f"fontsize=30:fontcolor=0xe8dec8:borderw=3:bordercolor=0x05050a@0.9:"
                  f"shadowcolor=0x000000@0.45:shadowx=0:shadowy=2")
    return vf


def make_shot(item):
    lid, treat, accent, label, credit, secs, cam = item
    dst = WORK / f"s_{lid}.mp4"
    if treat == "flat":
        src = MAS / f"master_{lid}.webm"
        ss = max(0.0, dur(src) - secs - 0.4)
        vf = [camera_vf(cam[0], cam[1], cam[2], secs)] + lower_third(label, credit, accent)
    else:
        src = SHOTS / f"{lid}_3d.webm"
        ss = max(0.0, dur(src) - secs - 0.2)
        vf = [f"scale={W}:{H}:flags=lanczos,setsar=1"] + lower_third(label, credit, accent)
    vf += [smooth(), "format=yuv420p"]
    run(["ffmpeg", "-y", "-ss", f"{ss:.3f}", "-i", str(src), "-t", f"{secs:.3f}", "-an",
         "-vf", ",".join(vf), "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium", str(dst)])
    print(f"  shot {lid} ({treat}, {secs}s)")
    return dst, secs


def make_bumper(name, secs, fade_out):
    src = REEL / f"{name}.webm"
    dst = WORK / f"{name}.mp4"
    vf = [f"scale={W}:{H}:flags=lanczos,setsar=1", "fade=t=in:st=0:d=0.6:color=0x05050a"]
    if fade_out:
        vf.append(f"fade=t=out:st={secs - 0.7:.2f}:d=0.7:color=0x05050a")
    vf += [smooth(), "format=yuv420p"]
    run(["ffmpeg", "-y", "-ss", "0.4", "-i", str(src), "-t", f"{secs:.3f}", "-an",
         "-vf", ",".join(vf), "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium", str(dst)])
    print(f"  bumper {name} ({secs}s)")
    return dst, secs


def xfade_concat(clips, out):
    inputs = []
    for p, _ in clips:
        inputs += ["-i", str(p)]
    fc, prev, off, total = [], "0:v", 0.0, clips[0][1]
    for i in range(1, len(clips)):
        off += clips[i - 1][1] - XFADE
        total += clips[i][1] - XFADE
        lbl = f"x{i}"
        fc.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[{lbl}]")
        prev = lbl
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", f"[{prev}]",
         "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", str(out)])
    return total


def main():
    print("[1/3] building shots …")
    clips = [make_bumper("bumper_open", BUMP_OPEN_S, False)]
    for item in SHOTLIST:
        clips.append(make_shot(item))
    clips.append(make_bumper("bumper_close", BUMP_CLOSE_S, True))
    print("[2/3] crossfade-chaining …")
    out = REEL / "glassbox-reel-silent.mp4"
    total = xfade_concat(clips, out)
    print(f"[3/3] done: {out}  (~{total:.1f}s)")


if __name__ == "__main__":
    main()
