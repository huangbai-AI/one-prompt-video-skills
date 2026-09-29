// render.cjs — 无头 Chrome 逐帧渲染，JPEG 直接管道给 ffmpeg（不落盘）
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const [html = 'index.html', out = 'reel.mp4', audio = 'audio.wav', mb = '10'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(html) + `?capture&mb=${mb}`); await p.waitForFunction(() => window.__scene);
  const { duration, fps } = await p.evaluate(() => ({ duration: __scene.duration, fps: __scene.fps })), N = Math.round(duration * fps);
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await p.evaluate(t => __scene.renderFrame(t), i / fps);
    const buf = await p.locator('#c').screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
