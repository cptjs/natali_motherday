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
  const progressCue = $('#storyCue');
  const progressLabel = $('#progressLabel');
  let rafProgress = 0;
  const updateProgress = () => {
    if (rafProgress) return;
    rafProgress = requestAnimationFrame(() => {
      const max = story.scrollHeight - story.clientHeight;
      const pct = max > 0 ? (story.scrollTop / max) * 100 : 0;
      const clamped = Math.max(0, Math.min(100, pct));
      progressBar.style.width = clamped + '%';

      if (progressCue && progressLabel) {
        const complete = clamped > 96;
        progressCue.classList.toggle('is-complete', complete);
        progressLabel.textContent = complete ? 'фінал' : 'гортай далі';
      }
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
      setTimeout(async () => {
        act1Tw.classList.add('is-typing');
        await playTypewriter(spans, 72);
        await sleep(900);
        act1Tw.classList.remove('is-typing');
      }, 700);
    }
  }

  /* ── 5. Поворот · «2025» + «02.07» + поворотна фраза ──────────────── */
  const yearEl     = $('[data-typewriter-year]');
  const dateEl     = $('[data-typewriter-md]');
  const turnLineEl = $('[data-turn-line]');
  const turnSection = $('.act--turn');
  let act3Played = false;

  const PAW_TRAIL_DURATION_MS = 1400; // лапки Бланко перед роком (зменшено)
  const YEAR_CHAR_MS = 200;
  const DATE_CHAR_MS = 120;
  const DATE_GAP_MS  = 220;
  const TURN_GAP_MS  = 320;

  function playAct3() {
    if (act3Played) return;
    act3Played = true;

    let cursor = PAW_TRAIL_DURATION_MS;

    // Рік
    let yearLen = 0;
    if (yearEl) {
      const yearText = yearEl.textContent || '2025';
      yearLen = [...yearText].length;
      const yearSpans = buildChars(yearEl, yearText);
      yearEl.classList.add('is-ready');

      if (reduced) {
        yearSpans.forEach((s) => s.classList.add('is-on'));
      } else {
        yearSpans.forEach((span, i) => {
          setTimeout(() => span.classList.add('is-on'), cursor + i * YEAR_CHAR_MS);
        });
      }
      cursor += yearLen * YEAR_CHAR_MS;
    }

    // Дата (нижче року, менший шрифт)
    if (dateEl) {
      const dateText = dateEl.textContent || '';
      const dateSpans = buildChars(dateEl, dateText);
      dateEl.classList.add('is-ready');

      if (reduced) {
        dateSpans.forEach((s) => s.classList.add('is-on'));
      } else {
        cursor += DATE_GAP_MS;
        dateSpans.forEach((span, i) => {
          setTimeout(() => span.classList.add('is-on'), cursor + i * DATE_CHAR_MS);
        });
        cursor += dateSpans.length * DATE_CHAR_MS;
      }
    }

    // Поворотна фраза
    if (turnLineEl) {
      if (reduced) {
        turnLineEl.classList.add('is-on');
      } else {
        setTimeout(() => turnLineEl.classList.add('is-on'), cursor + TURN_GAP_MS);
      }
    }
  }

  if (turnSection) {
    const ioTurn = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) playAct3(); }),
      { threshold: 0.5 }
    );
    ioTurn.observe(turnSection);
  }

  /* ── 6. АКТ 5 · Apple-style Cinematic Reveal ──────────────────────── */
  const giftSection = $('#giftReveal');
  const prelude     = $('#prelude');
  const cert        = $('#certificate');
  const cinemaFinal = $('#cinemaFinal');
  let giftRevealed = false;

  function playCinematicReveal() {
    if (giftRevealed || !giftSection) return;
    giftRevealed = true;

    if (reduced) {
      giftSection.classList.add('is-darkening', 'is-revealing');
      prelude?.classList.add('is-fading');
      cert?.classList.add('is-emerging');
      cinemaFinal?.classList.add('is-visible');
      return;
    }

    // A · Утримання прелюдії (0 → 3.8s) — користувач читає текст
    // B · Затемнення сцени + прелюдія тане вгору (3.8s → 5.3s)
    setTimeout(() => {
      giftSection.classList.add('is-darkening');
      prelude?.classList.add('is-fading');
    }, 3800);

    // C · Картка з'являється з glow (5.3s → 7.0s)
    setTimeout(() => {
      giftSection.classList.add('is-revealing');
      cert?.classList.add('is-emerging');
    }, 5300);

    // D · Іскри-sparkles вибухають з-за картки (6.1s)
    setTimeout(startSparkles, 6100);

    // E · Фінальний блок фейдиться знизу (7.4s)
    setTimeout(() => cinemaFinal?.classList.add('is-visible'), 7400);
  }

  if (giftSection) {
    const ioGift = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) playCinematicReveal(); }),
      { threshold: 0.4 }
    );
    ioGift.observe(giftSection);
  }

  /* ── 7. Sparkles — радіальний вибух золотих іскор від картки ──────── */
  let sparklesStarted = false;
  function startSparkles() {
    if (sparklesStarted || reduced) return;
    sparklesStarted = true;

    const canvas = $('#sparkles');
    if (!canvas || !cert) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width  = Math.round(r.width  * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function getOrigin() {
      const cR = cert.getBoundingClientRect();
      const sR = canvas.parentElement.getBoundingClientRect();
      return {
        x:  cR.left + cR.width  / 2 - sR.left,
        y:  cR.top  + cR.height / 2 - sR.top,
        rW: cR.width,
        rH: cR.height,
      };
    }

    const COLORS = ['#ffe6b8', '#ffd388', '#ffba66', '#fff5d8', '#ffce8a', '#ffac6d', '#ffb38a'];
    const particles = [];

    function spawn(count) {
      const o = getOrigin();
      const ringR = Math.max(o.rW, o.rH) * 0.42;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * 4.2;
        const r = ringR * (0.55 + Math.random() * 0.55);
        particles.push({
          x:  o.x + Math.cos(angle) * r * 0.65,
          y:  o.y + Math.sin(angle) * r * 0.65,
          vx: Math.cos(angle) * speed * 0.85,
          vy: Math.sin(angle) * speed * 0.85 - 0.4, // легкий апліфт
          size: 1.1 + Math.random() * 2.0,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          life: 1,
          decay: 0.006 + Math.random() * 0.012,
          tOff:  Math.random() * Math.PI * 2,
          tSpd:  0.08 + Math.random() * 0.16,
        });
      }
    }

    // вибух хвилями
    spawn(55);
    setTimeout(() => spawn(45), 250);
    setTimeout(() => spawn(35), 700);
    setTimeout(() => spawn(28), 1300);

    // тривале легке іскріння до 4.5с
    const refill = setInterval(() => {
      if (particles.length < 18) spawn(6);
    }, 500);
    setTimeout(() => clearInterval(refill), 4500);

    let t = 0;
    function tick() {
      t++;
      const w = canvas.width  / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.984;
        p.vy *= 0.984;
        p.vy += 0.006; // м'яка гравітація
        p.life -= p.decay;

        if (p.life <= 0 || p.y > h + 30 || p.x < -30 || p.x > w + 30) {
          particles.splice(i, 1);
          continue;
        }

        const twinkle = (Math.sin(t * p.tSpd + p.tOff) + 1.4) / 2.4;
        const alpha = p.life * twinkle;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── 7.5 Password gate: код «7589» розблоковує суму + код ─────────── */
  const PASSWORD = '7589';
  const passInput = $('#passInput');
  const certEl    = $('#certificate');

  if (passInput && certEl) {
    passInput.addEventListener('input', (e) => {
      // тримаємо тільки цифри
      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (cleaned !== e.target.value) e.target.value = cleaned;

      if (cleaned.length === 4) {
        if (cleaned === PASSWORD) {
          certEl.classList.add('is-unlocked');
          $('#certUnlocked')?.setAttribute('aria-hidden', 'false');
          passInput.disabled = true;
          passInput.blur();
          if (navigator.vibrate) navigator.vibrate([20, 60, 20]);
        } else {
          passInput.classList.add('is-wrong');
          if (navigator.vibrate) navigator.vibrate(40);
          setTimeout(() => {
            passInput.classList.remove('is-wrong');
            passInput.value = '';
            passInput.focus();
          }, 700);
        }
      }
    });

    // Enter — підтвердити навіть якщо коротше 4
    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });
  }

  /* ── 8. Кнопка «Скопіювати код» ───────────────────────────────────── */
  const copyBtn = $('#copyBtn');
  const certCode = $('#certCode');

  if (copyBtn && certCode) {
    const labelEl = copyBtn.querySelector('.copy-btn__label');
    const ORIG_LABEL = labelEl ? labelEl.textContent : '';

    copyBtn.addEventListener('click', async () => {
      const code = certCode.textContent.trim();
      let success = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(code);
          success = true;
        } else {
          const range = document.createRange();
          range.selectNodeContents(certCode);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          success = document.execCommand('copy');
          sel.removeAllRanges();
        }
      } catch (err) {
        success = false;
      }

      if (success) {
        copyBtn.classList.add('is-copied');
        if (labelEl) labelEl.textContent = 'Скопійовано!';
        clearTimeout(copyBtn._t);
        copyBtn._t = setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (labelEl) labelEl.textContent = ORIG_LABEL;
        }, 2200);
      } else {
        showToast('Не вдалося скопіювати');
      }
    });
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

  /* ── 11. Запобігти zoom при подвійному торканні (iOS) ─────────────── */
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
