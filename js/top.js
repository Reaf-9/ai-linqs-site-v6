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
})();
