/* トップページ専用の動き。JavaScript が無効でも内容はすべて表示されます。 */
(() => {
  'use strict';
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  d.documentElement.classList.add('top-anim');

  // 画面に入ったら is-in を付ける（見出しの青帯・グラフ・右上がりの図）
  const once = d.querySelectorAll('.sec-title, .sec-en, .chart, .growth-stage, .stats');
  const lines = d.querySelectorAll('.chart .line');
  lines.forEach(l => {
    const len = Math.ceil(l.getTotalLength());
    l.style.setProperty('--len', len);
    l.style.strokeDasharray = len;
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.classList.contains('stats')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -18% 0px' });
  once.forEach(el => io.observe(el));

  // 数字を数え上げる
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(el => {
      const from = Number(el.dataset.from || 0), to = Number(el.dataset.count), t0 = performance.now(), dur = 1400;
      (function tick(now) {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  // ヒーロー：スクロールに合わせて背景と人物をわずかにずらす
  const bg = d.querySelector('.kv-bg'), people = d.querySelector('.kv-people'), kv = d.querySelector('.kv');
  let ticking = false;
  function parallax() {
    ticking = false;
    const y = scrollY;
    if (!kv || y > kv.offsetHeight) return;
    if (bg) bg.style.translate = '0 ' + (y * 0.16).toFixed(1) + 'px';
    if (people) people.style.translate = '0 ' + (y * -0.05).toFixed(1) + 'px';
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });

  // ヒーロー：背景の上で、光の点と線がゆっくり動く（背景画像のネットワークを動きにしたもの）
  const photo = d.querySelector('.kv-photo');
  if (photo) {
    const cv = d.createElement('canvas');
    cv.className = 'kv-net';
    cv.setAttribute('aria-hidden', 'true');
    photo.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, pts = [], run = true, raf = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = photo.clientWidth; H = photo.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, Math.max(36, W / 13)));
      pts = Array.from({ length: n }, () => {
        // 右上がりの帯に集める（背景の絵と同じ流れ）
        const x = Math.random() * W, band = H * (0.82 - 0.62 * (x / W));
        return { x, y: band + (Math.random() - 0.5) * H * 0.7, vx: (Math.random() - 0.5) * 0.28 + 0.12, vy: (Math.random() - 0.5) * 0.22 - 0.05, r: Math.random() * 2.2 + 0.8, p: Math.random() * 6.28 };
      });
    }
    function draw(t) {
      raf = 0;
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      const link = Math.max(90, Math.min(170, W / 9));
      for (const a of pts) {
        a.x += a.vx; a.y += a.vy;
        if (a.x > W + 20) a.x = -20; if (a.x < -20) a.x = W + 20;
        if (a.y > H + 20) a.y = -20; if (a.y < -20) a.y = H + 20;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let k = i + 1; k < pts.length; k++) {
          const a = pts[i], b = pts[k], dx = a.x - b.x, dy = a.y - b.y, q = dx * dx + dy * dy;
          if (q < link * link) {
            ctx.strokeStyle = 'rgba(120,215,255,' + (0.5 * (1 - Math.sqrt(q) / link)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const a of pts) {
        const g = 0.55 + 0.45 * Math.sin(t / 900 + a.p);
        ctx.fillStyle = 'rgba(170,235,255,' + (0.25 * g).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * 3.4, 0, 6.29); ctx.fill();
        ctx.fillStyle = 'rgba(225,250,255,' + (0.55 + 0.45 * g).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.29); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    size();
    addEventListener('resize', size);
    // 帯と人物の登場が終わってから動かし始める
    setTimeout(() => {
      new IntersectionObserver(es => { run = es[0].isIntersecting; if (run && !raf) raf = requestAnimationFrame(draw); }).observe(photo);
      d.addEventListener('visibilitychange', () => { run = !d.hidden; if (run && !raf) raf = requestAnimationFrame(draw); });
    }, 2200);
  }
})();
