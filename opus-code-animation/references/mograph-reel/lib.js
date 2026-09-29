// lib.js — 节拍、缓动、形状采样、3D 投影、文字取点、后期（运动模糊 / 故障 / 颗粒 / HUD）
const W = 1920, H = 1080, FPS = 60, BPM = 128, BEATS = 32;
const B = 60 / BPM, DURATION = BEATS * B;           // 32 拍 = 15 秒
const bt = n => n * B;                               // 拍号 → 秒

const PAL = { cream: '#efebe2', black: '#0b0b0f', red: '#ff4a1c', blue: '#2b35f0', lime: '#d7f23c', navy: '#161b6e', pink: '#ff5fb8', grey: '#8a8a8a', ink: '#141414' };
const F = { wide: '"Archivo Black"', cond: '"Anton"', mono: '"JetBrains Mono"', jp: '"Hiragino Sans","PingFang SC"' };

// ---------- 数学 ----------
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (x, a, b) => clamp01((x - a) / (b - a));            // x 在 [a,b] 的进度
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- 缓动 ----------
const E = {
  linear: x => x,
  expoOut: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  expoIn: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  expoInOut: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  cubicInOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  cubicOut: x => 1 - Math.pow(1 - x, 3),
  backOut: (x, s = 1.9) => x <= 0 ? 0 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  bounceOut: x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; },
};
// CSS cubic-bezier(x1,y1,x2,y2)：给定 x 反解 t（牛顿迭代）再求 y
function cubicBezier(x1, y1, x2, y2) {
  const bx = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const dx = (t, a, b) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { let t = x; for (let i = 0; i < 8; i++) { const d = dx(t, x1, x2); if (Math.abs(d) < 1e-6) break; t -= (bx(t, x1, x2) - x) / d; t = clamp01(t); } return bx(t, y1, y2); };
}

// ---------- 形状：统一用 N 个点，从正上方顺时针开始，点点对应做形变 ----------
const NPTS = 240;
function resamplePoly(verts, n = NPTS) {
  const segs = verts.map((v, i) => { const w = verts[(i + 1) % verts.length]; return { a: v, b: w, l: Math.hypot(w[0] - v[0], w[1] - v[1]) }; });
  const total = segs.reduce((s, q) => s + q.l, 0), out = [];
  for (let i = 0; i < n; i++) { let d = i / n * total, k = 0; while (d > segs[k].l) { d -= segs[k].l; k++; } const q = segs[k], u = d / q.l; out.push([lerp(q.a[0], q.b[0], u), lerp(q.a[1], q.b[1], u)]); }
  return out;
}
const regular = (k, r, rot = 0) => Array.from({ length: k }, (_, i) => { const a = -Math.PI / 2 + rot + i / k * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; });
const SHAPES = {
  circle: Array.from({ length: NPTS }, (_, i) => { const a = -Math.PI / 2 + i / NPTS * Math.PI * 2; return [Math.cos(a) * 200, Math.sin(a) * 200]; }),
  square: resamplePoly([[0, -190], [190, -190], [190, 190], [-190, 190], [-190, -190]]),
  triangle: resamplePoly(regular(3, 250)),
  star: resamplePoly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i / 10 * Math.PI * 2, r = i % 2 ? 110 : 270; return [Math.cos(a) * r, Math.sin(a) * r]; })),
};
const morph = (A, Bp, k) => A.map((p, i) => [lerp(p[0], Bp[i][0], k), lerp(p[1], Bp[i][1], k)]);
function polyPath(ctx, pts, cx, cy, s = 1, rot = 0) {
  const c = Math.cos(rot), sn = Math.sin(rot); ctx.beginPath();
  pts.forEach(([x, y], i) => { const X = cx + (x * c - y * sn) * s, Y = cy + (x * sn + y * c) * s; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath();
}

// ---------- 3D：手写透视 ----------
const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
const project = ([x, y, z], f = 900, cx = W / 2, cy = H / 2) => { const k = f / Math.max(1, z); return [cx + x * k, cy + y * k, k]; };

// ---------- 文字取点：离屏画字 → 读像素 → 拾取约 n 个点 ----------
function textPoints(str, font, size, cx, cy, n = 5000, seed = 1) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(str, cx, cy);
  const d = g.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (d[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
  const r = mulberry32(seed); for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  return pts.slice(0, n);
}

// ---------- 文字 ----------
function txt(ctx, s, x, y, size, color, font = F.wide, align = 'center', base = 'middle', spacing = 0) {
  ctx.font = `${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px'; ctx.fillText(s, x, y); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}
function letterWidths(ctx, s, size, font) { ctx.font = `${size}px ${font}`; return [...s].map(ch => ctx.measureText(ch).width); }

// ---------- 后期 ----------
const grainTiles = (() => { const t = []; for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), id = g.createImageData(256, 256), r = mulberry32(900 + k);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); t.push(c); } return t; })();
function grainVignette(ctx, frame, dark = 0.4) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07; const r = mulberry32(frame + 1);
  ctx.translate(-Math.floor(r() * 256), -Math.floor(r() * 256)); ctx.fillStyle = ctx.createPattern(grainTiles[frame % 6], 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.0); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${dark})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
// 故障：RGB 分离 + 横向切片错位
const gl = { src: document.createElement('canvas'), ch: [0, 1, 2].map(() => document.createElement('canvas')) };
[gl.src, ...gl.ch].forEach(c => { c.width = W; c.height = H; });
function glitch(ctx, amt, seed) {
  if (amt <= 0.01) return; const r = mulberry32(seed), s = gl.src.getContext('2d'); s.globalCompositeOperation = 'copy'; s.drawImage(ctx.canvas, 0, 0);
  ['#f00', '#0f0', '#00f'].forEach((col, i) => { const g = gl.ch[i].getContext('2d'); g.globalCompositeOperation = 'copy'; g.drawImage(gl.src, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, W, H); });
  ctx.save(); ctx.globalCompositeOperation = 'copy'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
  const off = 26 * amt; ctx.drawImage(gl.ch[0], -off, 0); ctx.drawImage(gl.ch[1], 0, 0); ctx.drawImage(gl.ch[2], off, 0); ctx.restore();
  s.drawImage(ctx.canvas, 0, 0); const n = Math.floor(6 + 10 * amt);
  for (let i = 0; i < n; i++) { const y = Math.floor(r() * H), h = Math.floor(8 + r() * 80), dx = (r() - 0.5) * 240 * amt; ctx.drawImage(gl.src, 0, y, W, h, dx, y, W, h); }
}
// HUD：difference 混合，任何底色都可读
function hud(ctx, t, info) {
  const f = Math.floor(t * FPS), sec = Math.floor(t), ff = f % FPS, beat = Math.min(32, Math.floor(t / B) + 1);
  ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  const m = 34, L = 22; [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + L * sy); ctx.lineTo(x, y); ctx.lineTo(x + L * sx, y); ctx.stroke(); });
  txt(ctx, 'CLAUDE / MOTION REEL 04', m + 34, m + 6, 15, '#fff', F.mono, 'left', 'top', 1);
  txt(ctx, `TC 00:00:${String(sec).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - m - 34, m + 6, 15, '#fff', F.mono, 'right', 'top', 1);
  for (let i = 0; i < 4; i++) { ctx.globalAlpha = i === info.dot ? 1 : 0.35; ctx.fillRect(W / 2 - 30 + i * 16, m + 8, 7, 7); } ctx.globalAlpha = 1;
  txt(ctx, `${info.num} — ${info.name}`, m + 34, H - m - 20, 15, '#fff', F.mono, 'left', 'bottom', 1);
  ctx.fillRect(m + 34, H - m - 8, 260 * info.prog, 2); ctx.globalAlpha = 0.3; ctx.fillRect(m + 34, H - m - 8, 260, 2); ctx.globalAlpha = 1;
  txt(ctx, `1920×1080 · 60FPS · 128BPM · BEAT ${String(beat).padStart(2, '0')}/32`, W - m - 34, H - m - 20, 15, '#fff', F.mono, 'right', 'bottom', 1);
  if (info.credit) { ctx.globalAlpha = info.credit; txt(ctx, 'REMAKE · INSPIRED BY @aiehon_aya', W - m - 34, H - m - 44, 13, '#fff', F.mono, 'right', 'bottom', 1); }
  ctx.restore();
}
