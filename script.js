/* ─────────────────────────────────────────────────────────────────────
   Для тебе — сценарій історії
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const story = document.getElementById('story');

  /* ── helpers ──────────────────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ── 1. універсальний reveal на скрол ─────────────────────────────── */
  const ioReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          $$('[data-reveal-delay]', entry.target).forEach((el) => {
            el.style.setProperty('--reveal-delay', `${el.dataset.revealDelay}ms`);
          });
        }
      });
    },
    { threshold: 0.28, rootMargin: '0px 0px -8% 0px' }
  );
  $$('.act').forEach((act) => ioReveal.observe(act));

  /* ── 2. progress bar ───────────────────────────────────────────────── */
  const progressBar = $('#progressBar');
  let rafProgress = 0;
  const updateProgress = () => {
    if (rafProgress) return;
    rafProgress = requestAnimationFrame(() => {
      const max = story.scrollHeight - story.clientHeight;
      const pct = max > 0 ? (story.scrollTop / max) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      rafProgress = 0;
    });
  };
  story.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ── 3. typewriter (по символах) ──────────────────────────────────── */
  function buildChars(el, text) {
    el.textContent = '';
    const frag = document.createDocumentFragment();
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char;
      if (char === ' ') span.style.whiteSpace = 'pre';
      frag.appendChild(span);
    }
    el.appendChild(frag);
    return Array.from(el.children);
  }

  function pauseFor(char, base) {
    if (char === ',' || char === ';') return base * 4.5;
    if (char === '.' || char === '!' || char === '?') return base * 6;
    if (char === '—' || char === '–') return base * 2.5;
    if (char === '…') return base * 10;
    if (char === ' ') return base * 0.6;
    return base;
  }

  async function playTypewriter(spans, base = 70) {
    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.add('is-on');
      await sleep(pauseFor(spans[i].textContent, base));
    }
  }

  /* ── 4. Акт 1 · вступний typewriter ────────────────────────────────── */
  const act1Tw = $('[data-typewriter]');
  if (act1Tw) {
    const text = act1Tw.dataset.text || act1Tw.textContent;
    const spans = buildChars(act1Tw, text);
    act1Tw.classList.add('is-ready');

    if (reduced) {
      spans.forEach((s) => s.classList.add('is-on'));
    } else {
      // запуск після короткої паузи на «вдих»
      setTimeout(async () => {
        act1Tw.classList.add('is-typing');
        await playTypewriter(spans, 72);
        await sleep(900);
        act1Tw.classList.remove('is-typing');
      }, 700);
    }
  }

  /* ── 5. Акт 3 · «2025» + «Ти стала мамою» ─────────────────────────── */
  const yearEl     = $('[data-typewriter-year]');
  const turnLineEl = $('[data-turn-line]');
  const turnSection = $('.act--turn');
  let act3Played = false;

  function playAct3() {
    if (act3Played) return;
    act3Played = true;

    if (yearEl) {
      const yearText = yearEl.textContent || '2025';
      const yearSpans = buildChars(yearEl, yearText);
      yearEl.classList.add('is-ready');

      if (reduced) {
        yearSpans.forEach((s) => s.classList.add('is-on'));
        if (turnLineEl) turnLineEl.classList.add('is-on');
        return;
      }

      yearSpans.forEach((span, i) => {
        setTimeout(() => span.classList.add('is-on'), 500 + i * 240);
      });

      if (turnLineEl) {
        const total = 500 + yearSpans.length * 240 + 1100;
        setTimeout(() => turnLineEl.classList.add('is-on'), total);
      }
    } else if (turnLineEl) {
      turnLineEl.classList.add('is-on');
    }
  }

  if (turnSection) {
    const ioTurn = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) playAct3(); });
      },
      { threshold: 0.5 }
    );
    ioTurn.observe(turnSection);
  }

  /* ── 6. Конверт ───────────────────────────────────────────────────── */
  const envelope    = $('#envelope');
  const giftReveal  = $('#giftReveal');
  let envelopeOpen = false;

  if (envelope) {
    envelope.addEventListener('click', () => {
      if (envelopeOpen) {
        // якщо вже відкритий — просто проскролити до сертифіката
        giftReveal && giftReveal.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      envelopeOpen = true;
      envelope.classList.add('is-open');

      // м'який скрол до наступної секції коли клапан розкривається
      setTimeout(() => {
        giftReveal && giftReveal.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }, reduced ? 0 : 750);
    });
  }

  /* ── 7. Розкриття подарунка ───────────────────────────────────────── */
  const certificate  = $('#certificate');
  const finalMessage = $('.final-message');
  const actions      = $('.actions');
  const signature    = $('.signature');
  let giftRevealed = false;

  function revealGift() {
    if (giftRevealed) return;
    giftRevealed = true;

    const t = (ms, fn) => setTimeout(fn, reduced ? Math.min(ms, 100) : ms);

    t(180,  () => certificate?.classList.add('is-visible'));
    t(700,  () => startConfetti());
    t(1300, () => finalMessage?.classList.add('is-visible'));
    t(1900, () => {
      actions?.classList.add('is-visible');
      signature?.classList.add('is-visible');
    });
  }

  if (giftReveal) {
    const ioGift = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) revealGift(); }),
      { threshold: 0.35 }
    );
    ioGift.observe(giftReveal);
  }

  /* ── 8. Конфеті (canvas) ──────────────────────────────────────────── */
  let confettiStarted = false;
  function startConfetti() {
    if (confettiStarted || reduced) return;
    confettiStarted = true;

    const canvas = $('#confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const colors = ['#c9a064', '#ddc296', '#c79292', '#f4e2c4', '#9a3a3a', '#a07c44'];
    const particles = [];

    function spawn(count, originY = -10) {
      const w = canvas.width / dpr;
      for (let i = 0; i < count; i++) {
        particles.push({
          x:    Math.random() * w,
          y:    originY - Math.random() * 60,
          vx:   (Math.random() - 0.5) * 3.4,
          vy:   Math.random() * 1.6 + 0.8,
          rot:  Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.22,
          size: Math.random() * 6 + 4,
          color: colors[(Math.random() * colors.length) | 0],
          shape: Math.random() < 0.55 ? 'rect' : (Math.random() < 0.7 ? 'circle' : 'streamer'),
          life: 1,
        });
      }
    }

    spawn(70);
    setTimeout(() => spawn(55), 350);
    setTimeout(() => spawn(40), 850);

    let running = true;
    function tick() {
      if (!running) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055; // гравітація
        p.vx *= 0.992; // невеликий супротив
        p.rot += p.rotV;

        // згасання внизу екрана
        if (p.y > h * 0.78) p.life = Math.max(0, 1 - (p.y - h * 0.78) / (h * 0.25));
        if (p.y > h + 40 || p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // довгий «стример»
          ctx.fillRect(-p.size / 2, -1, p.size, 2);
        }
        ctx.restore();
      }

      if (particles.length > 0) requestAnimationFrame(tick);
      else running = false;
    }
    requestAnimationFrame(tick);
  }

  /* ── 9. Кнопка «Поділитися» ───────────────────────────────────────── */
  const shareBtn = $('#shareBtn');
  const toast    = $('#toast');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-on'), 2300);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const data = {
        title: 'Для тебе',
        text:  'Маленька історія, яку я зробив для неї.',
        url:   window.location.href,
      };
      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Посилання скопійовано');
        } else {
          showToast(window.location.href);
        }
      } catch (err) {
        // користувач скасував — нічого не робимо
        if (err && err.name !== 'AbortError') {
          showToast('Не вдалося поділитися');
        }
      }
    });
  }

  /* ── 10. «Прочитати знову» ────────────────────────────────────────── */
  const restartBtn = $('#restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      story.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ── 11. Запобігти зайвому zoom при подвійному торканні (iOS) ─────── */
  let lastTouch = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouch < 320) e.preventDefault();
      lastTouch = now;
    },
    { passive: false }
  );
})();
