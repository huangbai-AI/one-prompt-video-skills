"""Frame and pause check for a talking-head edit (needs ffmpeg + numpy).

  python3 check_frames.py video.mp4 [--sheet out_dir] [--from 0] [--min-freeze 2]

Prints:
  - frame count vs duration × fps (a mismatch means a piece lost or gained frames)
  - every run of ≥ N identical frames (freeze → then a jump = the "卡一下" viewers notice)
  - every silence ≥ 0.25 s in the audio (the pauses after each sentence)
With --sheet, also writes one contact sheet per 72 s (a frame every 2 s) to look through by eye.
"""
import argparse, json, pathlib, re, subprocess
import numpy as np


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
                          "stream=nb_read_frames,r_frame_rate:format=duration", "-of", "json", str(path)], capture_output=True, text=True).stdout
    j = json.loads(out); s = j["streams"][0]; num, den = s["r_frame_rate"].split("/")
    return int(s["nb_read_frames"]), float(j["format"]["duration"]), float(num) / float(den)


def freezes(path, start, min_run, w=160, h=90):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    d = np.abs(np.diff(x, axis=0)).mean((1, 2))
    runs, run = [], 0
    for i, v in enumerate(list(d) + [1.0]):
        if v < 0.02: run += 1
        else:
            if run >= min_run: runs.append((i + 1 - run, run, float(d[i]) if i < len(d) else 0.0))
            run = 0
    return [(a, n, j) for a, n, j in runs if a >= start]


def silences(path, db=-38, dur=0.25):
    err = subprocess.run(["ffmpeg", "-i", str(path), "-af", f"silencedetect=n={db}dB:d={dur}", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = [float(v) for v in re.findall(r"silence_start: ([\d.]+)", err)]; e = [float(v) for v in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(s, e))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--sheet"); ap.add_argument("--from", dest="start", type=float, default=0.0)
    ap.add_argument("--min-freeze", type=int, default=2); a = ap.parse_args()
    n, dur, fps = probe(a.video)
    print(f"frames {n}  duration {dur:.3f}s × {fps:g} fps = {round(dur * fps)}  {'OK' if abs(n - round(dur * fps)) <= 1 else 'MISMATCH'}")
    fr = freezes(a.video, int(a.start * fps), a.min_freeze)
    print(f"freezes (≥{a.min_freeze} identical frames): {len(fr)}")
    for f0, k, jump in fr: print(f"  {f0 / fps:8.2f}s  {k} frames  then jump {jump:.2f}")
    print("pauses (voice silent ≥ 0.25 s; with music mixed in, run this on the voice-only file):")
    for s, e in silences(a.video): print(f"  {s:8.2f}–{e:8.2f}  {e - s:.2f}s")
    if a.sheet:
        out = pathlib.Path(a.sheet); out.mkdir(parents=True, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", "fps=0.5,scale=480:-1,tile=6x6", str(out / "sheet_%02d.jpg")], check=True)
        print(f"contact sheets → {out}")


if __name__ == "__main__":
    main()
