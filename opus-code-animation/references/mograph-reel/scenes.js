// scenes.js — 每个场景只由绝对时间 t（秒）决定；lb = 场景内的拍数
const bg = (g, col) => { g.fillStyle = col; g.fillRect(0, 0, W, H); };

// ---------- S0 INTRO：点 → 线 → 刻度 → 米白展开 ----------
function sIntro(g, t) {
  const b = t / B; bg(g, PAL.black);
  const pop = E.backOut(seg(b, 0.3, 0.8)), len = lerp(16, W, E.expoOut(seg(b, 1.0, 1.5)));
  const open = E.expoInOut(seg(b, 1.5, 1.8)), h = lerp(6, H + 20, open);
  g.fillStyle = '#f4f1ea';
  if (b < 1.0) { g.beginPath(); g.arc(W / 2, H / 2, 8 * pop, 0, 7); g.fill(); }
  else g.fillRect(W / 2 - len / 2, H / 2 - h / 2, len, h);
  if (b > 1.25 && open < 0.2) for (let x = 20, i = 0; x < W; x += 40, i++) {
    const k = E.expoOut(seg(b, 1.25 + i * 0.004, 1.45 + i * 0.004)), th = (i % 5 ? 10 : 22) * k;
    g.fillRect(x, H / 2 - 3 - th, 2, th);
  }
}

// ---------- S1 MOTION 标题 ----------
function sMotion(g, t) {
  const b = t / B; bg(g, PAL.cream);
  const size = 230, word = 'MOTION', ws = letterWidths(g, word, size, F.wide), total = ws.reduce((a, c) => a + c, 0) + 30 * (ws.length - 1);
  const zoom = 1 + 0.03 * seg(b, 1.8, 4); g.save(); g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2);
  let x = W / 2 - total / 2; const base = H / 2 + 20;
  g.save(); g.beginPath(); g.rect(0, base - size * 0.8, W, size * 0.84); g.clip();
  [...word].forEach((ch, i) => {
    const k = E.expoOut(seg(b, 1.8 + i * 0.09, 2.5 + i * 0.09)), y = base + (1 - k) * size;
    if (ch === 'O' && i === 4) { const r = ws[i] / 2 - 6; g.strokeStyle = PAL.red; g.lineWidth = size * 0.19; g.beginPath(); g.arc(x + ws[i] / 2, y - size * 0.36, r - size * 0.095, 0, 7); g.stroke(); }
    else txt(g, ch, x, y, size, PAL.ink, F.wide, 'left', 'alphabetic');
    x += ws[i] + 30;
  }); g.restore();
  const la = E.cubicOut(seg(b, 2.4, 2.9));
  g.globalAlpha = la; txt(g, '[SHOWREEL]', W / 2 - total / 2, base - size * 0.86, 16, PAL.ink, F.mono, 'left', 'bottom', 2); txt(g, 'VOL.04', W / 2 + total / 2, base - size * 0.86, 16, PAL.ink, F.mono, 'right', 'bottom', 2); g.globalAlpha = 1;
  const ul = E.expoOut(seg(b, 2.4, 3.0)); g.fillStyle = PAL.ink; g.fillRect(W / 2 - total / 2 * ul, base + 34, total * ul, 3);
  const sub = 'DESIGNED IN CODE · FRAME BY FRAME', n = Math.floor(sub.length * seg(b, 2.6, 3.3));
  txt(g, sub.slice(0, n), W / 2, base + 80, 16, PAL.ink, F.mono, 'center', 'middle', 6);
  g.restore();
  // 转场：橙色斜切面板 + 彩色流光
  const w = E.expoInOut(seg(b, 3.6, 4.0)); if (w > 0) {
    g.fillStyle = PAL.red; g.beginPath(); const X = W + 300 - w * (W + 700); g.moveTo(X, 0); g.lineTo(W + 10, 0); g.lineTo(W + 10, H); g.lineTo(X - 300, H); g.fill();
    const r = mulberry32(3); for (let i = 0; i < 9; i++) { const yy = r() * H, ll = 120 + r() * 400, xx = X - 200 + r() * 600 - w * 400; g.fillStyle = ['#ff8fd0', '#fff', PAL.blue][i % 3]; g.fillRect(xx, yy, ll, 5 + r() * 6); }
  }
}

// ---------- S2 MOVE：速度线 ----------
function sMove(g, t) {
  const b = t / B - 4; bg(g, PAL.red);
  const size = 250, word = 'MOVE', ws = letterWidths(g, word, size, F.wide), total = ws.reduce((a, c) => a + c, 0);
  let x0 = W / 2 - total / 2; const base = H / 2 + 90;
  [...word].forEach((ch, i) => {
    const u = seg(b, i * 0.06, 0.62 + i * 0.06), k = E.expoOut(u), off = (1 - k) * -1500, vel = u < 1 ? Math.pow(2, -10 * u) : 0;
    const x = x0 + off;
    if (vel > 0.02) { const r = mulberry32(i + 7); g.fillStyle = PAL.ink; for (let j = 0; j < 7; j++) { const yy = base - size * 0.7 + r() * size * 0.7, ll = vel * (600 + r() * 900); g.globalAlpha = 0.85; g.fillRect(x - ll, yy, ll, 6 + r() * 12); } g.globalAlpha = 1; }
    txt(g, ch, x, base, size, PAL.ink, F.wide, 'left', 'alphabetic'); x0 += ws[i];
  });
  const r = mulberry32(11), fade = 1 - seg(b, 0.5, 1); g.fillStyle = PAL.ink;   // 余韵速度线
  for (let j = 0; j < 12; j++) { const yy = base - 20 + r() * 150, ll = (200 + r() * 700) * fade, xx = ((r() * W - b * 1800) % (W + 800) + W + 800) % (W + 800) - 400; g.globalAlpha = 0.9 * fade; g.fillRect(xx, yy, ll, 4 + r() * 8); }
  g.globalAlpha = 1;
}

// ---------- S3 SHAPE：描边字堆叠滚动 ----------
function sShape(g, t) {
  const b = t / B - 5; bg(g, PAL.cream); const size = 190, word = 'SHAPE';
  const scroll = (b * 120) % 170; g.lineWidth = 2.2; g.strokeStyle = PAL.ink;
  g.font = `${size}px ${F.wide}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let k = -4; k <= 4; k++) { if (k === 0) continue; const y = H / 2 + k * 170 - scroll + 85 * Math.sign(k) * 0; const a = E.cubicOut(seg(b, 0.02 * Math.abs(k), 0.3 + 0.02 * Math.abs(k)));
    g.globalAlpha = a * (1 - Math.abs(k) * 0.12); g.strokeText(word, W / 2, y); } g.globalAlpha = 1;
  g.fillStyle = PAL.cream; g.fillRect(0, H / 2 - 95, W, 190);
  const ws = letterWidths(g, word, size, F.wide), total = ws.reduce((a, c) => a + c, 0); let x = W / 2 - total / 2;
  [...word].forEach((ch, i) => { const k = E.backOut(seg(b, 0.1 + i * 0.07, 0.45 + i * 0.07)); g.save(); g.translate(x + ws[i] / 2, H / 2 + 8); g.scale(k, k);
    txt(g, ch, 0, 0, size, ch === 'A' ? PAL.blue : PAL.ink, F.wide); g.restore(); x += ws[i]; });
}

// ---------- S4 TIME：表盘 + 翻牌字 ----------
function sTime(g, t) {
  const b = t / B - 6; bg(g, PAL.blue); const cx = W / 2, cy = H / 2;
  g.strokeStyle = 'rgba(239,235,226,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 320, 0, 7); g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 10 : 26; g.lineWidth = i % 5 ? 2 : 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * (300 - l), cy + Math.sin(a) * (300 - l)); g.lineTo(cx + Math.cos(a) * 300, cy + Math.sin(a) * 300); g.stroke(); }
  const size = 330, word = 'TIME', ws = letterWidths(g, word, size, F.cond), total = ws.reduce((a, c) => a + c, 0) + 20 * 3; let x = cx - total / 2;
  [...word].forEach((ch, i) => { const k = E.backOut(seg(b, i * 0.08, 0.35 + i * 0.08)); g.save(); g.translate(x + ws[i] / 2, cy + 20); g.scale(1, Math.max(0.001, k)); txt(g, ch, 0, 0, size, PAL.cream, F.cond); g.restore(); x += ws[i] + 20; });
  const a = -Math.PI / 2 + E.expoOut(seg(b, 0, 1)) * Math.PI * 2 * 1.25; g.strokeStyle = PAL.red; g.lineWidth = 5;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 290, cy + Math.sin(a) * 290); g.stroke(); g.fillStyle = PAL.red; g.beginPath(); g.arc(cx, cy, 10, 0, 7); g.fill();
}

// ---------- S5 RHYTHM：弹跳落字 + 白闪匹配剪辑 ----------
function sRhythm(g, t) {
  const b = t / B - 7; bg(g, PAL.lime); const size = 300, word = 'RHYTHM', ws = letterWidths(g, word, size, F.cond), total = ws.reduce((a, c) => a + c, 0) + 12 * 5;
  let x = W / 2 - total / 2; const base = H / 2 + 120;
  [...word].forEach((ch, i) => { const k = E.bounceOut(seg(b, i * 0.06, 0.5 + i * 0.06)); txt(g, ch, x, lerp(-200, base, k), size, i ? PAL.ink : PAL.blue, F.cond, 'left', 'alphabetic'); x += ws[i] + 12; });
  const f = E.expoOut(seg(b, 0.55, 1.0)); if (f > 0) { const r = lerp(0, 420, f); const gr = g.createRadialGradient(W / 2, H / 2, r * 0.5, W / 2, H / 2, r * 1.25); gr.addColorStop(0, '#fff'); gr.addColorStop(0.75, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(W / 2, H / 2, r * 1.25, 0, 7); g.fill(); }
}

// ---------- S6 SHAPE MORPH：240 点形变 + HUD ----------
const MORPH_KEYS = [[8, 'circle', '#f4f1ea'], [8.9, 'square', PAL.red], [9.9, 'triangle', PAL.blue], [10.9, 'star', PAL.lime], [11.45, 'circle', '#f4f1ea']];
function morphState(b) {
  let pts = SHAPES.circle, col = '#f4f1ea', name = 'CIRCLE', rot = 0;
  for (let i = 1; i < MORPH_KEYS.length; i++) {
    const [kb, shp, c] = MORPH_KEYS[i], [, pshp, pc] = MORPH_KEYS[i - 1], u = seg(b, kb, kb + 0.4);
    if (b >= kb) { pts = morph(SHAPES[pshp], SHAPES[shp], E.backOut(u, 1.2)); col = u < 0.5 ? pc : c; name = shp.toUpperCase(); rot += E.expoOut(u) * Math.PI / 2; }
  }
  return { pts, col, name, rot };
}
function sMorph(g, t) {
  const b = t / B; bg(g, PAL.black); const cx = W / 2, cy = H / 2, st = morphState(b);
  const shrink = 1 - E.expoIn(seg(b, 11.7, 12.0)) * 0.97, intro = E.expoOut(seg(b, 8, 8.4));
  // 背景 HUD
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, 470, 0, 7); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2 + b * 0.15; g.beginPath(); g.arc(cx + Math.cos(a) * 340 * intro, cy + Math.sin(a) * 340 * intro, 2.6, 0, 7); g.fill(); }
  g.save(); g.translate(cx, cy); g.rotate(b * 0.35); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.strokeRect(-275, -275, 550, 550); g.rotate(-b * 0.6); g.strokeRect(-240, -240, 480, 480); g.restore();
  [[PAL.blue, 0], [PAL.lime, 2.1], [PAL.red, 4.2]].forEach(([c, ph]) => { for (let k = 0; k < 16; k++) { const a = ph + b * 1.6 - k * 0.035; g.globalAlpha = 1 - k / 16; g.fillStyle = c; g.beginPath(); g.arc(cx + Math.cos(a) * 300, cy + Math.sin(a) * 300, 5, 0, 7); g.fill(); } }); g.globalAlpha = 1;
  for (const side of [-1, 1]) for (let c = 0; c < 3; c++) for (let r = 0; r < 18; r++) { const on = (Math.floor(b * 4) + r * 7 + c * 3) % 5; g.fillStyle = on ? 'rgba(255,255,255,0.18)' : st.col; g.beginPath(); g.arc(cx + side * (760 + c * 28), 190 + r * 40, 3, 0, 7); g.fill(); }
  // 形状
  g.save(); g.shadowColor = st.col; g.shadowBlur = 40 * (1 - shrink) + 6; g.fillStyle = st.col; polyPath(g, st.pts, cx, cy, shrink * (0.2 + 0.8 * intro), st.rot); g.fill(); g.restore();
  // 标签 + 引线
  if (shrink > 0.5) { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx + 190, cy - 190); g.lineTo(cx + 330, cy - 330); g.lineTo(cx + 470, cy - 330); g.stroke();
    txt(g, st.name, cx + 340, cy - 345, 18, '#fff', F.mono, 'left', 'bottom', 2); txt(g, 'VERTICES 240 / EASE BACK', cx + 340, cy - 318, 12, 'rgba(255,255,255,0.6)', F.mono, 'left', 'top', 1); }
}

// ---------- S7 DEPTH：透视隧道 + 线框立方体 ----------
const CUBE = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const CUBE_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const STREAKS = (() => { const r = mulberry32(21); return Array.from({ length: 160 }, () => ({ a: r() * 6.283, rad: 250 + r() * 900, z0: r() * 3000 })); })();
function sTunnel(g, t, grow = 1) {
  bg(g, PAL.black); const cols = ['#f4f1ea', PAL.red, PAL.blue, PAL.lime], speed = 1500, span = 3200;
  g.lineCap = 'round';
  STREAKS.forEach(s => { const z = ((s.z0 - t * speed * 1.6) % span + span) % span + 60; const p1 = project([Math.cos(s.a) * s.rad, Math.sin(s.a) * s.rad, z]), p2 = project([Math.cos(s.a) * s.rad, Math.sin(s.a) * s.rad, z + 260]);
    g.strokeStyle = `rgba(255,255,255,${0.5 * clamp01(1 - z / span)})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); });
  const frames = []; for (let i = 0; i < 12; i++) { const z = ((i * span / 12 - t * speed) % span + span) % span + 80; frames.push({ i, z }); }
  frames.sort((a, b) => b.z - a.z).forEach(({ i, z }) => {
    const rot = i * 0.22 + t * 0.5 + z * 0.0003, hw = 760 * grow, hh = 440 * grow;
    const pts = [[-hw, -hh, z], [hw, -hh, z], [hw, hh, z], [-hw, hh, z]].map(p => project(rotZ(p, rot)));
    const k = pts[0][2]; g.strokeStyle = cols[i % 4]; g.globalAlpha = clamp01(1.3 - z / span) * clamp01(z / 300); g.lineWidth = Math.max(1, 26 * k);
    g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
  }); g.globalAlpha = 1;
  [[1, 0], [0.72, 0.78]].forEach(([s, off], n) => {
    const Pz = CUBE.map(p => { const q = rotZ(rotX(rotY(p.map(v => v * 170 * s * grow), t * 1.1 + off), t * 0.7 + off), t * 0.3); return project([q[0], q[1], q[2] + 900]); });
    CUBE_E.forEach(([a, c], j) => { g.strokeStyle = cols[(j + n) % 4]; g.lineWidth = 2.5; g.beginPath(); g.moveTo(Pz[a][0], Pz[a][1]); g.lineTo(Pz[c][0], Pz[c][1]); g.stroke(); });
    g.fillStyle = '#fff'; Pz.forEach(p => { g.beginPath(); g.arc(p[0], p[1], 5, 0, 7); g.fill(); });
  });
}
function sDepth(g, t) {
  const b = t / B - 12, grow = E.expoOut(seg(b, 0, 0.6)); sTunnel(g, t, 0.02 + 0.98 * grow);
  const a = seg(b, 0.8, 1.3) * (1 - seg(b, 2.8, 3.4)); if (a > 0) { const s = 1 + b * 0.06; g.save(); g.globalAlpha = a; g.translate(W / 2, H / 2); g.scale(s, s);
    g.font = `170px ${F.cond}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeStyle = PAL.lime; g.lineWidth = 3; g.strokeText('DEPTH', 0, 0);
    txt(g, 'Z-SPACE · PERSPECTIVE', 0, 150, 14, 'rgba(255,255,255,0.7)', F.mono, 'center', 'middle', 3); g.restore(); }
  if (b < 0.5) { const gl = 1 - seg(b, 0, 0.5); g.fillStyle = `rgba(255,255,255,${gl})`; g.beginPath(); g.arc(W / 2, H / 2, 14, 0, 7); g.fill(); }
}

// ---------- S8 TIMING：图形编辑器 ----------
function win(g, x, y, w, h, title) {
  g.fillStyle = 'rgba(0,0,0,0.10)'; g.beginPath(); g.roundRect(x + 8, y + 10, w, h, 14); g.fill();
  g.fillStyle = '#fbf9f4'; g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); g.roundRect(x, y, w, h, 14); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x, y + 44); g.lineTo(x + w, y + 44); g.lineWidth = 2; g.stroke();
  txt(g, title, x + 20, y + 23, 14, PAL.ink, F.mono, 'left', 'middle', 1);
  [PAL.red, PAL.blue, PAL.ink].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x + w - 70 + i * 22, y + 22, 7, 0, 7); g.fill(); });
}
function cursor(g, x, y) { g.save(); g.translate(x, y); g.fillStyle = '#fff'; g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.lineTo(9, 26); g.lineTo(16, 40); g.lineTo(22, 37); g.lineTo(15, 23); g.lineTo(27, 23); g.closePath(); g.fill(); g.stroke(); g.restore(); }
function sGraph(g, t) {
  const b = t / B - 16; bg(g, PAL.cream);
  const slide = i => (1 - E.expoOut(seg(b, i * 0.12, 0.7 + i * 0.12))) * 900;
  const P1 = [lerp(0.30, 0.75, E.cubicInOut(seg(b, 0.8, 1.6))), lerp(0.30, 0.00, E.cubicInOut(seg(b, 0.8, 1.6)))];
  const P2 = [lerp(0.70, 0.25, E.cubicInOut(seg(b, 1.7, 2.4))), lerp(0.70, 1.00, E.cubicInOut(seg(b, 1.7, 2.4)))];
  const curve = cubicBezier(P1[0], P1[1], P2[0], P2[1]), u = seg(b, 2.5, 3.8), val = curve(u);
  // 大窗口
  const gx = 150, gy = 110 + slide(0), gw = 1010, gh = 850; win(g, gx, gy, gw, gh, 'GRAPH EDITOR — VALUE / TIME');
  const px = gx + 90, py = gy + 150, pw = gw - 200, ph = gh - 250; g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(px + pw * i / 10, py); g.lineTo(px + pw * i / 10, py + ph); g.moveTo(px, py + ph * i / 10); g.lineTo(px + pw, py + ph * i / 10); g.stroke(); }
  g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py - 10); g.lineTo(px, py + ph); g.lineTo(px + pw + 10, py + ph); g.stroke();
  txt(g, 'VALUE ↑', px + 10, py - 4, 12, PAL.ink, F.mono, 'left', 'top'); txt(g, 'TIME →', px + pw, py + ph + 24, 12, PAL.ink, F.mono, 'right', 'middle');
  const changed = b > 0.8; txt(g, `cubic-bezier(${P1[0].toFixed(2)}, ${P1[1].toFixed(2)}, ${P2[0].toFixed(2)}, ${P2[1].toFixed(2)})`, gx + 34, gy + 90, 22, changed ? PAL.red : PAL.ink, F.mono, 'left', 'middle');
  const S = ([x, y]) => [px + x * pw, py + ph - y * ph];
  const [a0, a1, a2, a3] = [S([0, 0]), S(P1), S(P2), S([1, 1])];
  g.setLineDash([6, 6]); g.strokeStyle = PAL.blue; g.lineWidth = 2; g.beginPath(); g.moveTo(...a0); g.lineTo(...a1); g.moveTo(...a3); g.lineTo(...a2); g.stroke(); g.setLineDash([]);
  g.strokeStyle = PAL.red; g.lineWidth = 5; g.beginPath(); g.moveTo(...a0); g.bezierCurveTo(...a1, ...a2, ...a3); g.stroke();
  [a1, a2].forEach(p => { g.fillStyle = PAL.blue; g.beginPath(); g.arc(p[0], p[1], 11, 0, 7); g.fill(); }); [a0, a3].forEach(p => { g.fillStyle = PAL.ink; g.beginPath(); g.arc(p[0], p[1], 9, 0, 7); g.fill(); });
  if (b > 2.5) { const hx = px + u * pw, hy = py + ph - val * ph; g.strokeStyle = PAL.blue; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, py); g.lineTo(hx, py + ph); g.stroke(); g.fillStyle = PAL.blue; g.beginPath(); g.arc(hx, hy, 9, 0, 7); g.fill(); }
  const tx = px + pw + 60; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, py); g.lineTo(tx, py + ph); g.stroke();
  for (let i = 0; i <= 5; i++) { g.beginPath(); g.arc(tx, py + ph * i / 5, 8, 0, 7); g.stroke(); }
  g.fillStyle = PAL.lime; g.strokeStyle = PAL.ink; g.beginPath(); g.arc(tx, py + ph - val * ph, 16, 0, 7); g.fill(); g.stroke();
  if (b > 0.6 && b < 2.5) { const cp = b < 1.65 ? a1 : a2; cursor(g, cp[0] + 6, cp[1] + 6); }
  // 右侧三个窗口
  const rx = 1220, rw = 550;
  const y1 = 110 + slide(1); win(g, rx, y1, rw, 270, 'PROGRESS'); txt(g, String(Math.round(val * 100)).padStart(3, '0'), rx + 40, y1 + 165, 130, PAL.ink, F.wide, 'left', 'middle');
  txt(g, '%', rx + 400, y1 + 190, 44, PAL.red, F.wide, 'left', 'middle'); g.fillStyle = PAL.blue; g.fillRect(rx + 40, y1 + 238, (rw - 80) * val, 8);
  const y2 = 410 + slide(2); win(g, rx, y2, rw, 270, 'STAGGER ×12'); const bc = [PAL.red, PAL.blue, PAL.lime, PAL.ink];
  for (let i = 0; i < 12; i++) { const r = mulberry32(i + 40)(), idle = 0.25 + 0.2 * Math.abs(Math.sin(b * Math.PI + i)), k = b > 2.5 ? curve(seg(u, i * 0.04, i * 0.04 + 0.5)) : 0; const h = 170 * lerp(idle, 0.35 + 0.65 * r, k);
    g.fillStyle = bc[i % 4]; g.fillRect(rx + 40 + i * 40, y2 + 240 - h, 30, h); }
  const y3 = 710 + slide(3); win(g, rx, y3, rw, 250, 'DURATION'); g.lineWidth = 14; g.strokeStyle = 'rgba(0,0,0,0.1)'; g.beginPath(); g.arc(rx + 90, y3 + 150, 40, 0, 7); g.stroke();
  g.strokeStyle = PAL.red; g.beginPath(); g.arc(rx + 90, y3 + 150, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, u)); g.stroke();
  txt(g, 'TIMING', rx + 160, y3 + 150, 58, PAL.ink, F.wide, 'left', 'middle'); txt(g, `${(u * 0.8).toFixed(2)}s / 0.80s`, rx + 162, y3 + 205, 14, PAL.ink, F.mono, 'left', 'middle');
}

// ---------- S9 SYSTEMS：四宫格 ----------
const MB = { c: document.createElement('canvas') }; MB.c.width = 320; MB.c.height = 180; MB.g = MB.c.getContext('2d'); MB.img = MB.g.createImageData(320, 180);
function metaballs(g, w, h, t) {
  const balls = Array.from({ length: 6 }, (_, i) => [160 + Math.sin(t * (0.9 + i * 0.23) + i * 2) * (60 + i * 12), 90 + Math.cos(t * (1.1 + i * 0.17) + i) * (40 + i * 5), 20 + (i % 3) * 8]);
  const d = MB.img.data;
  for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) { let f = 0; for (const [bx, by, r] of balls) { const dx = x - bx, dy = y - by; f += r * r / (dx * dx + dy * dy + 1); }
    const a = clamp01((f - 0.9) / 0.35), k = clamp01((x / 320) * 0.6 + (1 - y / 180) * 0.4), i = (y * 320 + x) * 4;
    d[i] = lerp(255, 170, k * k); d[i + 1] = lerp(160, 90, k); d[i + 2] = lerp(90, 255, k); d[i + 3] = a * 255; }
  MB.g.putImageData(MB.img, 0, 0); bg(g, PAL.black); g.imageSmoothingEnabled = true; g.drawImage(MB.c, 0, 0, w, h);
}
function ballPanel(g, w, h, t) { bg(g, PAL.blue); const ph = (t / B * 2) % 1, y = h - 110 - Math.sin(ph * Math.PI) * 300, c = Math.max(0, 1 - Math.sin(ph * Math.PI) * 6);
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(w * 0.3, h - 70, w * 0.4, 2); g.save(); g.translate(w / 2, y + 40); g.scale(1 + 0.35 * c, 1 - 0.35 * c); g.fillStyle = PAL.lime; g.beginPath(); g.arc(0, -40, 40, 0, 7); g.fill(); g.restore(); }
function wavePanel(g, w, h, t) { bg(g, PAL.lime); g.lineWidth = 2; g.strokeStyle = PAL.ink;
  for (let r = 0; r < 18; r++) { const y0 = 80 + r * 26; g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= w; x += 6) { const c1 = w / 2 + Math.sin(t * 1.3 + r * 0.7) * 120, amp = Math.exp(-((x - c1) ** 2) / 12000) * (40 + 30 * Math.sin(t * 3 + r)) + Math.exp(-((x - w * 0.3) ** 2) / 4000) * 18 * Math.sin(t * 5 + r * 1.3); g.lineTo(x, y0 - Math.max(0, amp)); }
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fillStyle = PAL.lime; g.fill(); g.beginPath(); g.moveTo(0, y0);
    for (let x = 0; x <= w; x += 6) { const c1 = w / 2 + Math.sin(t * 1.3 + r * 0.7) * 120, amp = Math.exp(-((x - c1) ** 2) / 12000) * (40 + 30 * Math.sin(t * 3 + r)) + Math.exp(-((x - w * 0.3) ** 2) / 4000) * 18 * Math.sin(t * 5 + r * 1.3); g.lineTo(x, y0 - Math.max(0, amp)); } g.stroke(); } }
function loopPanel(g, w, h, t) { bg(g, PAL.cream); const s = 'LOOP — LOOP — LOOP — LOOP — LOOP — LOOP — ', size = 70; g.font = `${size}px ${F.wide}`; g.textBaseline = 'middle'; g.textAlign = 'left'; const unit = g.measureText('LOOP — ').width;
  for (let r = 0; r < 6; r++) { const dir = r % 2 ? 1 : -1, x = ((dir * t * 260) % unit + unit) % unit - unit, y = 50 + r * 90, style = r % 4;
    if (style === 1 || style === 3) { g.strokeStyle = style === 1 ? PAL.ink : PAL.red; g.lineWidth = 2; g.strokeText(s, x, y); } else { g.fillStyle = style === 2 ? PAL.red : PAL.ink; g.fillText(s, x, y); } } }
const PANELS = [['SQUASH & STRETCH', ballPanel], ['005 / METABALLS', metaballs], ['SEAMLESS LOOP', loopPanel], ['WAVEFORM', wavePanel]];
const QUAD = [[0, 0], [1, 0], [1, 1], [0, 1]];   // 顺时针位置：TL TR BR BL
function sGrid(g, t) {
  const b = t / B - 20, sw = E.expoInOut(seg(b, 2, 2.5)), zoom = E.expoInOut(seg(b, 3.4, 4.0));
  bg(g, PAL.black);
  PANELS.forEach(([label, fn], i) => {
    const q0 = QUAD[i], q1 = QUAD[(i + 1) % 4]; let x = lerp(q0[0], q1[0], sw) * W / 2, y = lerp(q0[1], q1[1], sw) * H / 2, w = W / 2, h = H / 2;
    if (i === 1 && zoom > 0) return;   // 放大时由 drawMetaTop 画在最上层
    g.save(); g.beginPath(); g.rect(x + 3, y + 3, w - 6, h - 6); g.clip(); g.translate(x + 3, y + 3); fn(g, w - 6, h - 6, t);
    txt(g, label, 60, 64, 13, i === 2 || i === 3 ? PAL.ink : '#fff', F.mono, 'left', 'top', 2); g.restore();
  });
}
function drawMetaTop(g, t) { const b = t / B - 20, zoom = E.expoInOut(seg(b, 3.4, 4.0)); if (zoom <= 0) return;
  const q = QUAD[2], x = lerp(q[0] * W / 2, 0, zoom), y = lerp(q[1] * H / 2, 0, zoom), w = lerp(W / 2, W, zoom), h = lerp(H / 2, H, zoom); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y); metaballs(g, w, h, t); g.restore(); }

// ---------- S10 MONTAGE：半拍一切 ----------
function starShape(g, cx, cy, s, rot) { polyPath(g, SHAPES.star, cx, cy, s, rot); }
function sMontage(g, t) {
  const b = t / B - 24, k = Math.min(7, Math.floor(b * 2)), lb = b * 2 - k, punch = 1 + 0.08 * (1 - E.expoOut(lb)), cx = W / 2, cy = H / 2;
  g.save(); g.translate(cx, cy); g.scale(punch, punch); g.translate(-cx, -cy);
  const counter = (col) => txt(g, `${String(k + 1).padStart(2, '0')} / 15`, cx, cy + 230, 14, col, F.mono, 'center', 'middle', 3);
  if (k === 0) { bg(g, PAL.cream); txt(g, 'DESIGN', cx, cy, 220, PAL.ink, F.wide); counter(PAL.ink); }
  if (k === 1) { bg(g, PAL.black); g.strokeStyle = PAL.lime; g.lineWidth = 2; starShape(g, cx, cy, 1.25, -0.4 + lb * 0.3); g.stroke(); g.fillStyle = PAL.lime; starShape(g, cx, cy, 1, lb * 0.4); g.fill(); }
  if (k === 2) { bg(g, PAL.red); g.font = `900 440px ${F.jp}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = PAL.cream; g.fillText('動', cx, cy - 10); counter(PAL.cream); }
  if (k === 3) { sTunnel(g, t + 3, 1); }
  if (k === 4) { bg(g, PAL.lime); g.save(); g.translate(cx, cy); g.rotate(0.3 + lb * 0.3); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.strokeRect(-260, -260, 520, 520); g.rotate(-0.15); g.fillStyle = PAL.ink; g.fillRect(-200, -200, 400, 400); g.restore(); }
  if (k === 5) { bg(g, PAL.cream); g.strokeStyle = PAL.red; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 300 + lb * 20, 0, 7); g.stroke(); g.fillStyle = PAL.red; g.beginPath(); g.arc(cx, cy, 220, 0, 7); g.fill(); }
  if (k === 6) { bg(g, PAL.red); g.strokeStyle = PAL.ink; g.lineWidth = 3; starShape(g, cx, cy, 1.45, -0.2 - lb * 0.3); g.stroke(); g.fillStyle = PAL.ink; starShape(g, cx, cy, 1.05, 0.1 + lb * 0.2); g.fill(); }
  if (k === 7) { const f = seg(lb, 0, 0.6); bg(g, `rgb(${lerp(150, 12, f)},${lerp(150, 12, f)},${lerp(150, 20, f)})`); }
  g.restore();
}

// ---------- S11 SIGNATURE：粒子爆炸 → 聚成 CLAUDE ----------
let PARTS = null;
function initParticles() {
  const tp = textPoints('CLAUDE', F.wide, 250, W / 2, H / 2 - 30, 5000, 5), r = mulberry32(77), cols = [PAL.red, '#7b86ff', PAL.lime, PAL.pink, '#f4f1ea'];
  PARTS = tp.map(([tx, ty]) => { const a = r() * 6.283, r0 = 110 + r() * 90; return { tx, ty, a, r0, d: 120 + r() * 520, spin: (r() - 0.5) * 1.2, col: cols[Math.floor(r() * 5)], delay: clamp01((tx - 560) / 800) * 0.7 + r() * 0.12 }; });
}
function sSign(g, t) {
  const b = t / B - 28; if (!PARTS) initParticles();
  const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100); gr.addColorStop(0, '#2a31a8'); gr.addColorStop(1, '#0a0d45'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const solid = E.cubicOut(seg(b, 2.05, 2.45));
  for (const p of PARTS) {
    const ex = E.expoOut(seg(b, 0, 1.2)), a = p.a + p.spin * ex, rr = p.r0 + p.d * ex;
    const sx = W / 2 + Math.cos(a) * rr * 1.35, sy = H / 2 + Math.sin(a) * rr * 0.8, c = E.expoInOut(seg(b, 0.6 + p.delay, 1.35 + p.delay));
    const x = lerp(sx, p.tx, c), y = lerp(sy, p.ty, c);
    g.globalAlpha = (1 - solid * 0.9) * (b < 0.05 ? b / 0.05 : 1); g.fillStyle = c > 0.9 ? '#f4f1ea' : p.col; const ps = c > 0.9 ? 3 : 4.2; g.fillRect(x - ps / 2, y - ps / 2, ps, ps);
  } g.globalAlpha = 1;
  if (solid > 0) { g.globalAlpha = solid; txt(g, 'CLAUDE', W / 2, H / 2 - 30, 250, '#f4f1ea', F.wide); g.globalAlpha = 1; }
  const ul = E.expoOut(seg(b, 2.2, 2.7)); g.fillStyle = PAL.red; g.fillRect(W / 2 - 380 * ul, H / 2 + 105, 760 * ul, 5);
  const s = 'MOTION DESIGNER — SHOWREEL 2026', n = Math.floor(s.length * seg(b, 2.4, 3.1)); if (b > 2.35) {
    g.font = `20px ${F.mono}`; if ('letterSpacing' in g) g.letterSpacing = '5px'; const tw = g.measureText(s).width; if ('letterSpacing' in g) g.letterSpacing = '0px';
    txt(g, s.slice(0, n), W / 2 - tw / 2, H / 2 + 165, 20, '#f4f1ea', F.mono, 'left', 'middle', 5);
    g.font = `20px ${F.mono}`; if ('letterSpacing' in g) g.letterSpacing = '5px'; const cw = g.measureText(s.slice(0, n)).width; if ('letterSpacing' in g) g.letterSpacing = '0px';
    if (Math.floor(t * 4) % 2 === 0 || n < s.length) { g.fillStyle = PAL.lime; g.fillRect(W / 2 - tw / 2 + cw + 4, H / 2 + 152, 12, 26); } }
  const pill = E.backOut(seg(b, 3.1, 3.45)); if (pill > 0) { g.save(); g.translate(W / 2, H / 2 + 235); g.scale(pill, pill); g.strokeStyle = '#f4f1ea'; g.lineWidth = 2; g.beginPath(); g.roundRect(-150, -24, 300, 48, 24); g.stroke();
    g.fillStyle = PAL.lime; g.beginPath(); g.arc(-118, 0, 7, 0, 7); g.fill(); txt(g, 'AVAILABLE FOR WORK', 12, 1, 15, '#f4f1ea', F.mono, 'center', 'middle', 2); g.restore(); }
}

// ---------- 时间表 ----------
const SCENES = [[0, 1.8, sIntro], [1.8, 4, sMotion], [4, 5, sMove], [5, 6, sShape], [6, 7, sTime], [7, 8, sRhythm], [8, 12, sMorph], [12, 16, sDepth], [16, 20, sGraph], [20, 24, (g, t) => { sGrid(g, t); drawMetaTop(g, t); }], [24, 28, sMontage], [28, 32.1, sSign]];
const CHAPTERS = [[0, 5, '00', 'INTRO', 0], [5, 8, '01', 'KINETIC TYPE', 1], [8, 12, '02', 'SHAPE MORPH', 2], [12, 16, '03', 'DIMENSION', 3], [16, 20, '04', 'TIMING', 0], [20, 24, '05', 'SYSTEMS', 1], [24, 28, '06', 'MONTAGE', 2], [28, 32.1, '07', 'SIGNATURE', 3]];
const GLITCH = [[19.8, 20.2, 1], [21.0, 21.12, 0.6], [23.0, 23.12, 0.6], [24.45, 24.55, 0.5], [25.45, 25.55, 0.5], [26.45, 26.55, 0.5], [27.4, 27.6, 0.8]];
