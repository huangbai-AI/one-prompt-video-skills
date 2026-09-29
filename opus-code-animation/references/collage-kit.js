// collage-kit.js — 拼贴纸艺质感工具（纯 Canvas2D，无外部依赖，结果只由 seed 决定）
// 用法：<script src="collage-kit.js"></script> 之后调用 window.Collage.*
// 核心思路：所有“材质”都在启动时预渲染到离屏 canvas（贵的只做一次），每帧只做 drawImage + 变换。
(function () {
  const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

  // 1D 分形噪声：撕纸边缘的高低起伏（大波浪 + 细锯齿）
  function edgeNoise(n, seed, rough = 1) {
    const r = mulberry32(seed), oct = [[0.02, 14], [0.08, 5], [0.35, 2.2 * rough], [1.2, 1.2 * rough]];
    const ph = oct.map(() => r() * 1000);
    return i => oct.reduce((s, [f, a], k) => s + Math.sin(i * f + ph[k]) * a + (k > 1 ? (r() - 0.5) * a : 0), 0);
  }

  // 纸张纹理：纤维 + 颗粒 + 轻微色斑。返回可重复平铺的 canvas
  function paperTexture(size = 512, seed = 1, strength = 1) {
    const c = mk(size, size), g = c.getContext('2d'), r = mulberry32(seed);
    g.fillStyle = '#808080'; g.fillRect(0, 0, size, size);                    // 中性灰 → 适合 overlay/soft-light
    for (let i = 0; i < 90; i++) {                                             // 大色斑
      const x = r() * size, y = r() * size, rad = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const v = r() < .5 ? 0 : 255; gr.addColorStop(0, `rgba(${v},${v},${v},${0.05 * strength})`); gr.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 1400; i++) {                                           // 纤维
      const x = r() * size, y = r() * size, a = r() * 6.28, l = 4 + r() * 18;
      g.strokeStyle = `rgba(${r() < .5 ? 60 : 230},${r() < .5 ? 60 : 230},${r() < .5 ? 60 : 230},${0.10 * strength})`; g.lineWidth = 0.6 + r();
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l / 2, y + Math.sin(a + 1) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const id = g.getImageData(0, 0, size, size), d = id.data;                  // 颗粒
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 36 * strength; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(id, 0, 0); return c;
  }

  // 给当前路径覆盖纸纹：先 fill 颜色，再 clip + overlay 纸纹
  function texturize(ctx, tex, alpha = 0.55, mode = 'overlay') {
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha;
    ctx.fillStyle = ctx.createPattern(tex, 'repeat'); ctx.fillRect(-4000, -4000, 8000, 8000); ctx.restore();
  }

  // 撕纸条：横向一条，顶边撕裂；带白色纸芯边、投影、纸纹。返回预渲染 canvas（宽 w，高 h+margin）
  function tornStrip({ w, h, color, seed = 1, tex, rim = 5, rough = 1, bottomEdge = false, shadow = 14 }) {
    const pad = 40, c = mk(w + pad * 2, h + pad * 2), g = c.getContext('2d'), n = edgeNoise(w, seed, rough), n2 = edgeNoise(w, seed + 99, rough);
    const path = off => { g.beginPath(); g.moveTo(pad, pad + 20 + n(0) + off);
      for (let x = 0; x <= w; x += 3) g.lineTo(pad + x, pad + 20 + n(x) + off);
      if (bottomEdge) for (let x = w; x >= 0; x -= 3) g.lineTo(pad + x, pad + h - 20 + n2(x) - off);
      else { g.lineTo(pad + w, pad + h + pad); g.lineTo(pad, pad + h + pad); } g.closePath(); };
    g.save(); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = shadow; g.shadowOffsetY = shadow * 0.35;
    path(-rim); g.fillStyle = '#f3ede0'; g.fill(); g.restore();                // 白色撕口（纸芯）
    if (tex) { path(-rim); texturize(g, tex, 0.5); }
    path(0); g.fillStyle = color; g.fill(); if (tex) { path(0); texturize(g, tex, 0.6); }
    return c;
  }

  // 蜡笔/彩铅填充：在 path 内叠很多半透明短笔触。drawPath(g) 负责建路径（坐标相对离屏 canvas）
  function crayonFill(g, drawPath, base, stroke, { seed = 3, density = 1, w = 600, h = 600, angle = -0.6 } = {}) {
    drawPath(g); g.fillStyle = base; g.fill();
    g.save(); drawPath(g); g.clip(); const r = mulberry32(seed);
    for (let i = 0; i < 2600 * density; i++) {
      const x = r() * w, y = r() * h, l = 6 + r() * 16, a = angle + (r() - 0.5) * 0.5;
      g.strokeStyle = r() < 0.5 ? stroke : 'rgba(255,255,255,0.10)'; g.globalAlpha = 0.06 + r() * 0.1; g.lineWidth = 1 + r() * 2.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;
  }

  // 贴纸化：把任意透明底素材加一圈白色模切边 + 柔和投影（案例 7 角色的核心质感）
  function stickerize(src, border = 10, shadow = 18) {
    const pad = border + shadow * 2, c = mk(src.width + pad * 2, src.height + pad * 2), g = c.getContext('2d');
    const sil = mk(c.width, c.height), s = sil.getContext('2d');
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; s.drawImage(src, pad + Math.cos(a) * border, pad + Math.sin(a) * border); }
    s.globalCompositeOperation = 'source-in'; s.fillStyle = '#fbf7ee'; s.fillRect(0, 0, c.width, c.height);
    g.save(); g.shadowColor = 'rgba(20,10,0,0.35)'; g.shadowBlur = shadow; g.shadowOffsetY = shadow * 0.5; g.drawImage(sil, 0, 0); g.restore();
    g.drawImage(src, pad, pad); c.pad = pad; return c;
  }

  // 发光：月亮/灯笼/屏幕。用 'lighter' 叠加径向渐变
  function glow(ctx, x, y, r, color = '255,214,150', a = 0.55) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(0.35, `rgba(${color},${a * 0.35})`); gr.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }

  // 景深：按层与焦平面的距离决定模糊半径。layers = [{canvas, depth, draw?}]
  function drawLayerDOF(ctx, layerCanvas, depth, focus, maxBlur = 14) {
    const b = Math.min(maxBlur, Math.abs(depth - focus) * maxBlur);
    ctx.save(); if (b > 0.4) ctx.filter = `blur(${b.toFixed(1)}px)`; ctx.drawImage(layerCanvas, 0, 0); ctx.restore();
  }

  // 散景光斑（虚化城市灯）
  function bokeh(ctx, W, H, seed, t, { n = 26, cols = ['255,190,110', '255,120,90', '255,230,170'], alpha = 0.35 } = {}) {
    const r = mulberry32(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const x = r() * W, y = r() * H * 0.8, rad = 30 + r() * 90, c = cols[i % cols.length], f = 0.6 + 0.4 * Math.sin(t * (0.5 + r()) + i);
      const gr = ctx.createRadialGradient(x, y, rad * 0.6, x, y, rad); gr.addColorStop(0, `rgba(${c},${alpha * f})`); gr.addColorStop(0.9, `rgba(${c},${alpha * f * 0.8})`); gr.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  // 调色 + 暗角 + 胶片颗粒（每帧最后调用）。grain 用预生成的 4 张噪声图按帧轮换，保证确定性
  const grainTiles = [];
  function finish(ctx, W, H, t, { tint = 'rgba(255,190,120,0.06)', shadowTint = 'rgba(20,20,60,0.10)', vignette = 0.45, grain = 0.07, fps = 24 } = {}) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = shadowTint; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,5,20,${vignette})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (!grainTiles.length) for (let k = 0; k < 4; k++) { const c = mk(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256), r = mulberry32(500 + k);
      for (let i = 0; i < id.data.length; i += 4) { const n = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = n; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); grainTiles.push(c); }
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain; ctx.fillStyle = ctx.createPattern(grainTiles[Math.floor(t * fps) % 4], 'repeat'); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // 相机：关键帧 [{t, x, y, zoom, rot}]，平滑插值；返回应用到 ctx 的变换
  function camera(keys, t) {
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; break; }
    const u = b.t === a.t ? 0 : Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const L = (p, q) => p + (q - p) * e;
    return { x: L(a.x, b.x), y: L(a.y, b.y), zoom: L(a.zoom, b.zoom), rot: L(a.rot || 0, b.rot || 0) };
  }
  function applyCamera(ctx, cam, W, H) { ctx.translate(W / 2, H / 2); ctx.rotate(cam.rot); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y); }

  window.Collage = { mulberry32, mk, edgeNoise, paperTexture, texturize, tornStrip, crayonFill, stickerize, glow, drawLayerDOF, bokeh, finish, camera, applyCamera };
})();
