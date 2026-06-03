#!/usr/bin/env python3
"""Stage D of the Glassbox reel: a driving, building, sidechained score, then mux.
Calm filtered intro under the brand bumper -> a DROP on the brand->content hand-off
(kick + bass + bright arp all enter) -> a montage groove that adds layers and lifts
-> a breakdown that resolves to a clean pad under the closing bumper. Synth-only
(numpy), so it is original and license-clean. 120 BPM, C major I-V-vi-IV."""
from __future__ import annotations
import subprocess, sys, wave
from pathlib import Path
import numpy as np

SR = 48_000
REEL = Path("artifacts/reel")
SILENT = Path(sys.argv[1]) if len(sys.argv) > 1 else REEL / "glassbox-reel-silent.mp4"
OUT = REEL / "glassbox-reel.mp4"
BPM = 120.0
BEAT = 60.0 / BPM      # 0.5s
BAR = 4 * BEAT         # 2.0s


def total_dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "default=nw=1:nk=1", str(p)], capture_output=True, text=True).stdout.strip())


def synth(total, t_drop, t_break):
    n = int(total * SR)
    buf = np.zeros(n)
    rng = np.random.default_rng(11)
    t = np.arange(n) / SR

    def place(sig, when, gain):
        s = int(when * SR)
        if s >= n or s < 0:
            return
        m = min(n - s, len(sig))
        buf[s:s + m] += sig[:m] * gain

    def env(m, a, d, sl, r):
        e = np.ones(m)
        ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
        if ai: e[:ai] = np.linspace(0, 1, ai)
        if di: e[ai:ai + di] = np.linspace(1, sl, di)
        e[ai + di:m - ri] = sl
        if ri: e[m - ri:] = np.linspace(sl, 0, ri)
        return e

    def saw(freq, dur, detune=(0.0,), a=0.005, d=0.05, sl=0.7, r=0.05, nharm=12):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        sig = np.zeros(m)
        for dt in detune:
            f = freq * (2 ** (dt / 1200.0))
            for k in range(1, nharm + 1):
                sig += np.sin(2 * np.pi * f * k * tt) / k
        sig /= len(detune)
        return np.tanh(sig * 1.4) * env(m, a, d, sl, r)

    def sine(freq, dur, a=0.004, d=0.05, sl=0.8, r=0.06):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        return np.sin(2 * np.pi * freq * tt) * env(m, a, d, sl, r)

    # --- chords: C - G - Am - F (I V vi IV) ---
    pad_ch = [[261.63, 329.63, 392.00, 493.88], [196.00, 293.66, 392.00, 493.88],
              [220.00, 329.63, 440.00, 523.25], [174.61, 261.63, 349.23, 440.00]]
    bass_root = [65.41, 49.00, 55.00, 43.65]            # C2 G1 A1 F1 (sub)
    arp_ch = [[523.25, 659.25, 783.99, 987.77], [587.33, 783.99, 987.77, 1174.66],
              [523.25, 659.25, 880.00, 1046.50], [523.25, 698.46, 880.00, 1046.50]]

    nbars = int(np.ceil(total / BAR)) + 1

    # PAD everywhere (warm bed); brighter/louder after the drop.
    for bi in range(nbars):
        when = bi * BAR
        ch = pad_ch[bi % 4]
        lvl = 0.05 if when < t_drop - 0.2 else 0.085
        for f in ch:
            place(saw(f, BAR * 0.99, detune=(-7, 7), a=0.18, d=0.2, sl=0.85, r=0.25, nharm=8), when, lvl)

    # KICK 4-on-the-floor + sidechain envelope, from the drop to the breakdown.
    def kick(dur=0.26):
        m = int(dur * SR); tt = np.arange(m) / SR
        f = 120 - 85 * np.exp(-tt * 32)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
        click = np.exp(-tt * 220) * 0.6
        return np.tanh((body + click) * 1.3)

    duck = np.ones(n)  # sidechain: dip on each kick
    beat_t = t_drop
    j = 0
    while beat_t < t_break:
        place(kick(), beat_t, 0.95)
        s = int(beat_t * SR)
        dl = int(0.32 * SR)
        seg = np.linspace(0.32, 1.0, dl) ** 1.4
        e = min(n, s + dl)
        duck[s:e] = np.minimum(duck[s:e], seg[:e - s])
        beat_t += BEAT
        j += 1
    # before the drop and after the breakdown the duck is flat (1.0)

    # CLAP on 2 & 4; HATS on 8ths; both from the drop.
    def noise_hit(dur, lp_decay, hp=False):
        m = int(dur * SR); tt = np.arange(m) / SR
        nz = rng.standard_normal(m)
        if hp:
            nz = np.diff(np.concatenate([[0], nz]))
        return nz * np.exp(-tt * lp_decay)

    beat_t = t_drop
    k = 0
    while beat_t < t_break:
        if k % 4 in (1, 3):
            place(noise_hit(0.18, 26), beat_t, 0.22)        # clap-ish
        beat_t += BEAT; k += 1
    eighth = BEAT / 2
    et = t_drop
    h = 0
    while et < t_break:
        place(noise_hit(0.04, 90, hp=True), et, 0.06 if h % 2 else 0.09)
        et += eighth; h += 1

    # BASS: root on each beat, octave-popping, sidechained.
    bt = t_drop
    bidx = int(t_drop / BAR)
    bb = 0
    while bt < t_break:
        root = bass_root[bidx % 4]
        f = root * (2 if bb % 2 else 1)
        place(saw(f, BEAT * 0.92, a=0.005, d=0.06, sl=0.8, r=0.06, nharm=10), bt, 0.34)
        bt += BEAT; bb += 1
        if bb % 4 == 0:
            bidx += 1

    # ARP: bright 16th sparkle, density/level building across the montage.
    sixt = BEAT / 4
    at = t_drop
    aidx = int(t_drop / BAR)
    a = 0
    pattern = [0, 2, 1, 3, 2, 3, 1, 2]
    while at < t_break:
        prog = (at - t_drop) / max(0.001, (t_break - t_drop))   # 0..1 build
        ch = arp_ch[aidx % 4]
        note = ch[pattern[a % 8] % 4]
        lvl = 0.05 + 0.06 * prog
        place(saw(note, sixt * 1.4, a=0.002, d=0.04, sl=0.5, r=0.04, nharm=6), at, lvl)
        at += sixt; a += 1
        if a % 16 == 0:
            aidx += 1

    # LEAD counter-melody in the last ~8s before the breakdown (the peak).
    lead_start = max(t_drop, t_break - 8)
    melody = [(0, 783.99, 0.5), (0.5, 880.00, 0.5), (1.0, 987.77, 1.0), (2.0, 880.00, 0.5),
              (2.5, 783.99, 0.5), (3.0, 659.25, 1.0), (4.0, 783.99, 1.0), (5.0, 880.00, 1.5),
              (6.5, 987.77, 1.5)]
    for off, f, ln in melody:
        place(saw(f, BEAT * ln * 0.95, detune=(-5, 5), a=0.01, d=0.1, sl=0.7, r=0.12, nharm=8),
              lead_start + off * BEAT, 0.07)

    # RISER + IMPACT into the drop.
    if t_drop > 0.6:
        m = int(t_drop * SR); tt = np.arange(m) / SR
        ramp = (tt / t_drop) ** 1.7
        shimmer = np.sin(2 * np.pi * (260 + 520 * ramp) * tt) * ramp * 0.05
        air = rng.standard_normal(m) * ramp * 0.03
        buf[:m] += shimmer + air
    place(noise_hit(0.7, 6), t_drop, 0.3)                 # crash/impact
    place(sine(65.41, 0.5, a=0.002, d=0.1, sl=0.6, r=0.2), t_drop, 0.5)   # sub boom

    # apply sidechain to the harmonic bed (pad+bass+arp+lead are already in buf,
    # but kick/clap/hat were added after; duck only the pre-percussion bed would
    # need separation — instead duck the whole mix lightly for the pump feel).
    buf *= (0.55 + 0.45 * duck)

    # FINAL resolve swell under the closing bumper.
    if t_break < total - 0.3:
        m = int((total - t_break) * SR); tt = np.arange(m) / SR
        ch = pad_ch[int(t_break / BAR) % 4]
        sw = np.zeros(m)
        for f in ch:
            sw += np.sin(2 * np.pi * f * tt)
        sw *= np.minimum(1, tt / 0.5) * 0.05
        place(sw, t_break, 1.0)

    # gentle global fades + normalize
    fi, fo = int(0.4 * SR), int(1.4 * SR)
    buf[:fi] *= np.linspace(0, 1, fi)
    buf[-fo:] *= np.linspace(1, 0, fo)
    peak = float(np.max(np.abs(buf))) or 1.0
    buf = np.tanh(buf / peak * 1.1) * 0.92

    wav = REEL / "score.wav"
    i16 = (buf * 32767).astype("<i2")
    stereo = np.repeat(i16[:, None], 2, axis=1).tobytes()
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(stereo)
    return wav


def main():
    total = total_dur(SILENT)
    t_drop = 4.2 - 0.34          # bumper_open length minus the xfade
    t_break = total - 3.9        # closing bumper start
    print(f"score: total={total:.2f}s drop@{t_drop:.2f} break@{t_break:.2f}")
    wav = synth(total, t_drop, t_break)
    subprocess.run(["ffmpeg", "-y", "-i", str(SILENT), "-i", str(wav),
                    "-filter:a", "highpass=f=32,loudnorm=I=-14:TP=-1.3:LRA=11,alimiter=limit=0.95",
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                    "-ar", "48000", "-shortest", "-movflags", "+faststart", str(OUT)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
