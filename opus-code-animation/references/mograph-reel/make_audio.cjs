// make_audio.cjs — 128BPM · 32 拍 · 15 秒，所有事件用拍号写，和画面共用同一张时间表
const fs = require('fs');
const SR = 44100, BPM = 128, B = 60 / BPM, DUR = 32 * B, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N), DUCK = new Float32Array(N).fill(1);
let seed = 1; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const bt = n => n * B;
// bus: 'dry' 不被侧链，'duck' 被底鼓压
const SIDE = { L: new Float32Array(N), R: new Float32Array(N) };
function add(t0, len, fn, { pan = 0, gain = 1, bus = 'dry' } = {}) {
  const s0 = Math.floor(t0 * SR), n = Math.floor(len * SR), tl = bus === 'duck' ? SIDE.L : L, tr = bus === 'duck' ? SIDE.R : R;
  for (let i = 0; i < n; i++) { const k = s0 + i; if (k < 0 || k >= N) continue; const v = fn(i / SR, i) * gain; tl[k] += v * Math.min(1, 1 - pan); tr[k] += v * Math.min(1, 1 + pan); }
}
// ---- 乐器 ----
const kick = (t) => { const f = 45 + 120 * Math.exp(-t * 28); return Math.sin(2 * Math.PI * (45 * t + 120 * (1 - Math.exp(-t * 28)) / 28)) * Math.exp(-t * 6) + (t < 0.004 ? rnd() * 0.4 : 0); };
function noiseShaped(hpA, decay) { let lp = 0, prev = 0; return t => { const n = rnd(); lp += (n - lp) * hpA; const hp = n - lp; return hp * Math.exp(-t * decay); }; }
const hat = () => noiseShaped(0.25, 55);
const snare = () => { const nz = noiseShaped(0.12, 16); return t => nz(t) * 0.8 + Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22) * 0.5; };
const clap = () => { const nz = noiseShaped(0.15, 24); return t => nz(t) * (t < 0.03 ? (Math.floor(t / 0.009) % 2 ? 0.4 : 1) : 1); };
function whoosh(len, up = true) { let lp = 0; return t => { const u = t / len, cut = up ? 0.01 + 0.5 * u * u : 0.5 - 0.49 * u; lp += (rnd() - lp) * cut; return lp * Math.sin(Math.PI * u) * 1.6; }; }
function supersaw(freqs, len) { // 每个音 7 根失谐锯齿波 + 一阶低通
  const det = [-0.021, -0.013, -0.006, 0, 0.006, 0.013, 0.021], ph = freqs.map(() => det.map(() => (rnd() + 1) / 2)); let lp = 0;
  return (t) => { let v = 0; freqs.forEach((f, i) => det.forEach((d, j) => { ph[i][j] = (ph[i][j] + f * (1 + d) / SR) % 1; v += ph[i][j] * 2 - 1; }));
    v /= freqs.length * 7; const env = Math.min(1, t / 0.02) * Math.min(1, (len - t) / 0.05); lp += (v - lp) * 0.18; return lp * env; };
}
const bass = f => { let ph = 0, lp = 0; return (t) => { ph = (ph + f / SR) % 1; const saw = ph * 2 - 1; lp += (saw - lp) * 0.08; return (lp * 1.4 + Math.sin(2 * Math.PI * f * t) * 0.6) * Math.min(1, t * 300) * Math.exp(-t * 5); }; };
const blip = (f1, f2, d = 14) => t => Math.sin(2 * Math.PI * (f1 * t + (f2 - f1) * t * t * 3)) * Math.exp(-t * d);
const crush = t => (Math.round(rnd() * 3) / 3) * Math.exp(-t * 10);

// ---- 编曲 ----
const CH = [[57, [69, 72, 76]], [53, [65, 69, 72]], [48, [67, 72, 76]], [55, [67, 71, 74]]];   // Am F C G
const chordAt = b => CH[Math.floor(b / 4) % 4];
// 前奏
add(bt(0.3), 0.3, blip(1400, 2200, 20), { gain: 0.35 });
add(bt(0.9), bt(0.7), whoosh(bt(0.7)), { gain: 0.5 });
add(bt(1.8), 0.5, kick, { gain: 0.6 }); add(bt(1.8), bt(2.2), supersaw(CH[0][1].map(midi), bt(2.2)), { gain: 0.35, bus: 'duck' });
for (let n = 2; n < 4; n += 0.5) add(bt(n), 0.1, hat(), { gain: 0.25, pan: 0.3 });
// 主体 b4 – b27.75
for (let n = 4; n < 28; n++) {
  const [bn, ch] = chordAt(n), mont = n >= 24;
  add(bt(n), 0.45, kick, { gain: 1 });
  const s0 = Math.floor(bt(n) * SR); for (let i = 0; i < 0.3 * SR && s0 + i < N; i++) DUCK[s0 + i] = Math.min(DUCK[s0 + i], 1 - 0.85 * Math.exp(-i / SR / 0.09));
  if (n % 2 === 1) add(bt(n), 0.3, n >= 8 ? clap() : snare(), { gain: 0.55 });
  add(bt(n + 0.5), 0.08, hat(), { gain: 0.4, pan: 0.25 }); if (n >= 8) { add(bt(n + 0.25), 0.05, hat(), { gain: 0.18, pan: -0.3 }); add(bt(n + 0.75), 0.05, hat(), { gain: 0.18, pan: -0.3 }); }
  add(bt(n + 0.5), bt(0.45), bass(midi(bn - 12)), { gain: 0.5, bus: 'duck' }); if (mont) add(bt(n), bt(0.45), bass(midi(bn - 12)), { gain: 0.45, bus: 'duck' });
  if (n % 4 === 0) add(bt(n), bt(4), supersaw(ch.map(midi), bt(4)), { gain: 0.42, bus: 'duck' });
  if (mont) add(bt(n + 0.5), 0.3, kick, { gain: 0.5 });
}
for (let n = 26; n < 27.75; n += 0.25) add(bt(n), 0.15, snare(), { gain: 0.25 + 0.3 * (n - 26) / 1.75 });   // 军鼓滚奏
add(bt(25.5), bt(2.28), whoosh(bt(2.28)), { gain: 0.55 });                                                  // 起势
// 转场与冲击
[3.6, 7.5, 11.6, 15.7, 19.7, 23.6].forEach(b => add(bt(b), bt(0.45), whoosh(bt(0.45)), { gain: 0.6, pan: 0.2 }));
[8, 12, 16, 20, 24].forEach(b => { add(bt(b), 0.6, t => Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 4), { gain: 0.5 }); add(bt(b), 0.8, noiseShaped(0.3, 5), { gain: 0.15 }); });
[[19.8, 0.4], [21.0, 0.12], [23.0, 0.12], [24.45, 0.1], [25.45, 0.1], [26.45, 0.1], [27.4, 0.2]].forEach(([b, l]) => add(bt(b), bt(l), crush, { gain: 0.3 }));
[8.9, 9.9, 10.9, 11.45].forEach((b, i) => add(bt(b), 0.3, blip(500 + i * 200, 1200 + i * 250, 10), { gain: 0.3 }));  // 形变
for (let i = 0; i < 12; i++) add(bt(16.2 + i * 0.05), 0.05, blip(1800, 1600, 60), { gain: 0.12 });                   // 窗口入场
// 结尾：b27.78–b28 完全静音，然后爆点
add(bt(28), 0.8, kick, { gain: 1.3 }); add(bt(28), 1.2, t => Math.sin(2 * Math.PI * (60 * t - 20 * t * t)) * Math.exp(-t * 2.5), { gain: 0.8 });
add(bt(28), 2.5, noiseShaped(0.4, 1.8), { gain: 0.35 });                                                    // crash
add(bt(28), bt(4), supersaw([57, 64, 69, 72, 76].map(midi), bt(4)), { gain: 0.5 });
for (let i = 0; i < 40; i++) { const tt = bt(28.1) + Math.abs(rnd()) * bt(1.8); add(tt, 0.2, blip(2000 + rnd() * 800, 2600, 25), { gain: 0.06, pan: rnd() * 0.8 }); }   // 粒子闪烁
for (let i = 0; i < 12; i++) add(bt(30.4) + i * bt(0.7) / 12, 0.03, noiseShaped(0.5, 150), { gain: 0.25 });                        // 打字
add(bt(31.1), 0.25, blip(900, 1500, 16), { gain: 0.35 });
add(bt(30), 0.5, kick, { gain: 0.7 }); add(bt(30), bt(2), bass(midi(33)), { gain: 0.35 });

// ---- 混音：侧链 + 静音窗 + 限幅 ----
const silence0 = Math.floor(bt(27.78) * SR), silence1 = Math.floor(bt(28) * SR);
let peak = 0; const outL = new Float32Array(N), outR = new Float32Array(N);
for (let i = 0; i < N; i++) { let l = L[i] + SIDE.L[i] * DUCK[i], r = R[i] + SIDE.R[i] * DUCK[i]; if (i >= silence0 && i < silence1) l = r = 0;
  const fade = Math.min(1, (N - i) / (SR * 0.35)); outL[i] = Math.tanh(l * 0.9) * fade; outR[i] = Math.tanh(r * 0.9) * fade; peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i])); }
const buf = Buffer.alloc(44 + N * 4), g = 0.95 / peak;
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(outL[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(outR[i] * g * 32767), 46 + i * 4); }
fs.writeFileSync('audio.wav', buf); console.log('audio.wav', DUR.toFixed(3) + 's');
