"""Replace words in a voice track with a 1 kHz bleep (for platform versions that can't name a tool or model).

  python3 bleep.py voice.wav out.wav 71.01-71.31 77.99-78.25

Find the times by cutting the suspected region into short slices and transcribing each slice — forced
alignment is often off by a word around laughs and English names. Re-transcribe the output to confirm.
"""
import subprocess, sys

FADE = 0.012   # the tone starts/ends a hair inside the muted span, so there is no click


def main():
    src, dst, spans = sys.argv[1], sys.argv[2], [tuple(map(float, s.split("-"))) for s in sys.argv[3:]]
    mute = "*".join(f"(1-between(t,{a},{b}))" for a, b in spans)
    tone = "+".join(f"between(t,{a + FADE},{b - FADE})" for a, b in spans)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=48000",
                    "-filter_complex", f"[0:a]volume='{mute}':eval=frame,aformat=channel_layouts=stereo[v];"
                                       f"[1:a]volume='0.18*({tone})':eval=frame,aformat=channel_layouts=stereo[b];[v][b]amix=inputs=2:normalize=0:duration=first[o]",
                    "-map", "[o]", "-ar", "48000", dst], check=True)
    print(dst)


if __name__ == "__main__":
    main()
