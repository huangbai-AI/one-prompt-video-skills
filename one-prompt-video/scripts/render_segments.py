"""Render a HyperFrames composition in time segments and splice them — change one part, re-render only that part.

  PROJECT=path/to/composition python3 render_segments.py render main        # every segment of the main version
  PROJECT=... python3 render_segments.py render main 3 4                    # only segments 3 and 4
  PROJECT=... python3 render_segments.py render xhs 4 5                     # a variant renders just the segments it changes
  PROJECT=... python3 render_segments.py concat xhs out.mp4                 # variant segments where they exist, main ones elsewhere

Assumes the composition layout from the skill: #root with data-duration, the talking-head <video id="av">, optional
inserted clips <video id="v_…">, and a paused GSAP timeline built as
  tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: () => renderFrame(clock.t) }, 0); renderFrame(0);

The grid is fixed (N equal, frame-aligned parts of the composition), so every variant shares it.
Each segment is a copy of index.html whose clock starts at the segment's start: the A-roll gets data-media-start,
the inserted clips are shifted or dropped, and the audio tags are removed (the full mix is muxed afterwards).
Variants set window.HB_VARIANT before the composition scripts load.
"""
import json, pathlib, re, subprocess, sys

import os
D = pathlib.Path(os.environ.get("PROJECT", ".")).resolve()
OUT = D.parent / "renders/seg"
FPS, N = 30, 8


def total_frames():
    html = (D / "index.html").read_text()
    return round(float(re.search(r'id="root"[^>]*data-duration="([\d.]+)"', html).group(1)) * FPS)


def grid():
    n = total_frames(); step = -(-n // N)
    return [(i * step, min(n, (i + 1) * step)) for i in range(N) if i * step < n]


def seg_html(f0, f1, variant):
    a, dur = f0 / FPS, (f1 - f0) / FPS
    html = (D / "index.html").read_text()
    html = re.sub(r'(id="root"[^>]*data-duration=")[\d.]+', rf"\g<1>{dur:.4f}", html)
    html = re.sub(r'(<video[^>]*id="av"[^>]*?)data-start="[\d.]+" data-duration="[\d.]+"',
                  rf'\g<1>data-start="0" data-media-start="{a:.4f}" data-duration="{dur:.4f}"', html)
    def clip(m):
        tag = m.group(0); s = float(re.search(r'data-start="([\d.]+)"', tag).group(1)); d = float(re.search(r'data-duration="([\d.]+)"', tag).group(1))
        s2, e2 = s - a, s - a + d
        if e2 <= 0 or s2 >= dur: return ""          # not in this segment: keep the wrapper, drop the video
        ms = max(0.0, -s2); s2 = max(0.0, s2); d2 = min(e2, dur) - s2
        tag = re.sub(r'data-start="[\d.]+"', f'data-start="{s2:.4f}" data-media-start="{ms:.4f}"', tag)
        return re.sub(r'data-duration="[\d.]+"', f'data-duration="{d2:.4f}"', tag)
    html = re.sub(r'<video[^>]*id="v_[^"]+"[^>]*></video>', clip, html)
    html = re.sub(r'\s*<audio[^>]*></audio>', "", html)
    old = 'tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: () => renderFrame(clock.t) }, 0);\n        renderFrame(0);'
    assert old in html, "index.html timeline block changed — update render_segments.py"
    html = html.replace(old, f'clock.t = {a:.4f}; tl.fromTo(clock, {{ t: {a:.4f} }}, {{ t: {a + dur:.4f}, duration: {dur:.4f}, ease: "none", onUpdate: () => renderFrame(clock.t) }}, 0);\n'
                             f'        renderFrame({a:.4f});')
    html = html.replace('<script src="timeline.js"></script>', f'<script>window.HB_VARIANT = "{variant}";</script>\n    <script src="timeline.js"></script>', 1)
    return html


def render(variant, which):
    g = grid(); (OUT / variant).mkdir(parents=True, exist_ok=True)
    for i in which or range(len(g)):
        f0, f1 = g[i]; name = f"_seg_{variant}_{i}.html"; (D / name).write_text(seg_html(f0, f1, variant))
        out = OUT / variant / f"seg_{i}.mp4"
        print(f"segment {i}: {f0 / FPS:.2f}–{f1 / FPS:.2f} s → {out.name}", flush=True)
        try:
            subprocess.run(["npx", "-y", "hyperframes", "render", str(D), "-c", name, "-f", str(FPS), "-w", "4",
                            "--video-frame-format", "png", "--quiet", "-o", str(out)], check=True)
        finally:
            (D / name).unlink(missing_ok=True)
        got = int(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames",
                                  "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout.strip())
        if got != f1 - f0: raise RuntimeError(f"segment {i}: {got} frames, expected {f1 - f0}")


def concat(variant, out):
    parts = []
    for i in range(len(grid())):
        f = OUT / variant / f"seg_{i}.mp4"
        if not f.exists(): f = OUT / "main" / f"seg_{i}.mp4"
        if not f.exists(): raise RuntimeError(f"segment {i} has never been rendered")
        parts.append(f)
    lst = OUT / f"_{variant}_list.txt"; lst.write_text("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-map", "0:v", "-c", "copy", str(out)], check=True)
    print(json.dumps({"variant": variant, "parts": [str(p.relative_to(OUT)) for p in parts], "out": str(out)}, ensure_ascii=False))


if __name__ == "__main__":
    cmd, variant = sys.argv[1], sys.argv[2]
    if cmd == "render": render(variant, [int(x) for x in sys.argv[3:]])
    elif cmd == "concat": concat(variant, sys.argv[3])
    elif cmd == "grid": print([(round(a / FPS, 3), round(b / FPS, 3)) for a, b in grid()])
