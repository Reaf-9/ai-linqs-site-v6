/* 共通の動き。JavaScript が無効でも、全ページの内容とリンクはそのまま使えます。 */
(() => {
  'use strict';
  const d = document;
  d.documentElement.classList.add('js');

  // 右下に固定の LINE ボタン（全ページ共通。スクロールしても常に見える）
  const fab = d.createElement('a');
  fab.className = 'line-fab';
  fab.href = 'contact.html#contact';
  fab.setAttribute('data-line-cta', '');
  const icon = d.querySelector('.btn--line svg');
  if (icon) fab.appendChild(icon.cloneNode(true));
  const fabText = d.createElement('span');
  fabText.innerHTML = 'LINEで<br>相談';
  fab.appendChild(fabText);
  d.body.appendChild(fab);

  // LINE のボタン：リンク先を公式アカウントに差し替え（JS無効時はお問い合わせページへ）
  const LINE_URL = 'https://lin.ee/XFEkgJS';
  d.querySelectorAll('[data-line-cta]').forEach(link => {
    link.href = LINE_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  // スマホ用メニュー
  const burger = d.getElementById('burger');
  const menu = d.getElementById('spMenu');
  function setMenu(open, restoreFocus) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    if (restoreFocus) burger.focus();
    updateSticky();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false, true); });
    d.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.site-header')) setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 1100 && !menu.hidden) setMenu(false); });
  }

  // スマホ下部の固定ボタン：冒頭を過ぎたら出し、締め・フッターでは隠す
  const sticky = d.getElementById('stickyCta');
  const first = d.querySelector('.hero, .page-band');
  const hideNear = d.querySelectorAll('.closing, .footer, [data-hide-sticky]');
  let ticking = false;
  function inView(el) {
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }
  function updateSticky() {
    ticking = false;
    if (!sticky) return;
    const past = first ? first.getBoundingClientRect().bottom <= 0 : true;
    const near = Array.prototype.some.call(hideNear, inView);
    sticky.hidden = !(past && !near && (!menu || menu.hidden));
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(updateSticky); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  updateSticky();

  // スクロールでふわっと表示
  const targets = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('is-in'));
  }

  // テスト版の印：テスト公開（github.io）と手元でだけ表示。本番ドメインでは出ない
  const badge = d.getElementById('testBadge');
  if (badge && /(\.github\.io|localhost|127\.0\.0\.1)$/.test(location.hostname) || (badge && location.protocol === 'file:')) {
    badge.hidden = false;
  }
})();
