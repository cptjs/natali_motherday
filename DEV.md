# DEV.md — технічна документація `natali_motherday`

Документ для розробника, який підхопить проєкт. README.md — для контент-овнера (як міняти фото/текст). Цей файл — як це все під капотом.

---

## TL;DR

One-page емоційний сторителлінг-сайт-листівка до Дня Матері. 27 секцій вертикального скролу зі snap-snap між ними, кінематографічні переходи, фото, текстові моменти, фінальний Apple-style reveal Yakaboo-сертифіката з password gate.

- **Тех-стек**: pure HTML5 + CSS3 + vanilla JS (ES6+). Жодних фреймворків, build tools, npm
- **Хостинг**: GitHub Pages, гілка `main`, корінь репо
- **Live**: https://cptjs.github.io/natali_motherday/
- **Targeted device**: iPhone 13/12 (390×844, 100dvh). Mobile-first, не оптимізовано під desktop спеціально

---

## Структура файлів

```
/
├── index.html         ~ 280 рядків · 27 секцій + Open Graph + інлайн SVG
├── styles.css         ~ 1300 рядків · всі стилі, design tokens, анімації
├── script.js          ~ 350 рядків · IO, typewriter, sparkles, password, share
├── README.md          ~ для контент-овнера (як міняти фото/текст)
├── DEV.md             ~ цей файл
├── .gitignore
└── assets/
    ├── blanko-1.jpg ... blanko-3.jpg
    ├── pregnancy-1.jpg, pregnancy-2.jpg
    ├── maksym-hero.jpg                 ← HERO photo #6 (newborn)
    ├── sleeping.jpg
    ├── maksym-1.jpg ... maksym-3.jpg
    ├── family.jpg
    ├── winter.jpg
    ├── blanko-baby.jpg
    ├── baby-climax.jpg                 ← FINAL HERO #14
    └── og-image.jpg                    ← link preview (1200×630 ideally)
```

Весь контент у плоскій папці `assets/`. Шрифти підвантажуються з Google Fonts (потребує інтернету).

---

## Контентна структура (27 секцій)

| # | Section / class | Mood | Тип | Що показує |
|---|---|---|---|---|
| 1 | `.act--intro` | dark | text | «Це був складний рік. Але сьогодні — твій день.» |
| 2 | `.act--blanko` | warm | text | «Спочатку ти була мамою для Бланко…» + paw peek |
| 3 | `.act--photo .act--blanko` | warm | photo | Blanko як цуценя |
| 4 | `.act--photo .act--blanko[data-blanko-nudge]` | warm | photo | Blanko teen + paw nudge animation |
| 5 | `.act--moment` | warm | text | «А інколи — отакі обличчя.» |
| 6 | `.act--photo .act--blanko` | warm | photo | Blanko смішна морда |
| 7 | `.act--moment` | warm | text | «А потім — почало щось рости…» |
| 8-9 | `.act--photo .act--blanko` | warm | photo | вагітна + Blanko (×2) |
| 10 | `.act--turn` | dark | special | paw trail → typewriter «2025» → «02.07» → turn line |
| 11 | `.act--hero` | hero | photo | newborn full-bleed |
| 12 | `.act--moment` | bright | text | «Це був важкий рік.» |
| 13 | `.act--moment` | bright | text | «Безсонні ночі. Перші зубчики о 3-й ранку.» |
| 14-15 | `.act--photo .act--maksym` | bright | photo | sleeping, mock-angry |
| 16 | `.act--moment` | bright | text | «Але ти продовжувала бути турботливою мамою.» |
| 17-19 | `.act--photo .act--maksym` | bright | photo | гойдалка, книжка, троє в ліжку |
| 20 | `.act--moment` | bright | text | «Посмішка, що ламає всі твої побоювання навпіл.» |
| 21 | `.act--photo .act--maksym` | bright | photo | зима |
| 22 | `.act--moment` | bright | text | «Вони завжди тебе вважатимуть мамою.» |
| 23 | `.act--photo .act--maksym` | bright | photo | Blanko + малий |
| 24 | `.act--moment .act--moment-final` | bright | text | «Ти неймовірна. І Максим це відчуває.» |
| 25 | `.act--hero .act--final-climax` | hero | photo | малий щасливий full-bleed |
| 26 | `.act--dedication` | warm | text | «Для найкращої мами на світі / Від: …» |
| 27 | `.act--gift` | cinematic | special | Apple reveal + Yakaboo cert + password gate |

---

## Архітектура секції

Кожна секція — `<section class="act ...">` з:

```css
.act {
  position: relative;
  min-height: 100vh; /* fallback */
  min-height: 100dvh; /* iOS 15.4+ */
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ...;
  overflow: hidden;
  isolation: isolate;
}
```

`#story` контейнер — `scroll-snap-type: y proximity` (forgiving snap, не mandatory). Snap-stop = початок кожної `.act`.

### `data-mood` атрибут
Контролює фон/колір тексту секції. Значення:
- `dark` — Act 1 (intro), Act 3 (turn): радіальний темний градієнт + dust particles
- `warm` — Бланко-era: кремовий
- `bright` — Максим-era: світлий теплий
- `hero` — full-bleed photo: чорний фон під фото
- `cinematic` — Act 5: радіальний фіолетово-чорний (стартовий стан, потім is-darkening)

---

## Дизайн-система (`:root` в `styles.css`)

### Кольори
```css
--cream: #f5ebd9;        --cream-soft: #faf3e6;
--warm-bg: #1a0f08;      --warm-bg-2: #2a1d12;
--ink: #2c1f17;          --ink-soft: #4a382c;
--gold: #c9a064;         --gold-soft: #ddc296;     --gold-deep: #a07c44;
--rose: #c79292;
```

### Типографіка
- `--font-display`: **Cormorant Garamond** (italic, 300-600) — display-копірайт, italic-моменти
- `--font-body`: **Inter** (300-500) — body, overline, кнопки
- `--font-mono` (inline): **JetBrains Mono** — код cert

### Розмірна шкала
```
--fs-display-sm: clamp(1.25rem, 5.2vw, 1.7rem)
--fs-display-md: clamp(1.6rem, 6.8vw, 2.3rem)
--fs-display-lg: clamp(1.85rem, 7.6vw, 2.8rem)
--fs-year:       clamp(3.6rem, 20vw, 6.4rem)   ← дуже великий, для «2025»
```

### Easing
- `--ease-soft`: `cubic-bezier(.25, .8, .35, 1)` — універсальне
- `--ease-cinema`: `cubic-bezier(.2, .8, .2, 1)` — драматичні моменти

---

## Ключові паттерни

### 1. Universal reveal
Один IntersectionObserver на всі `.act`-секції. При threshold ≥0.28 додає `.is-visible` на секцію → CSS-селектори `.is-visible .reveal { opacity: 1 }` фейдять контент.

```js
const ioReveal = new IntersectionObserver(/* ... */, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
$$('.act').forEach(act => ioReveal.observe(act));
```

`data-reveal-delay="ms"` на елементі задає індивідуальну затримку.

### 2. Photo reveal
Окремі класи з більш драматичною анімацією:
- `.reveal-photo` — opacity + slight scale (1.04 → 1)
- `.reveal-hero` — повільніше, більший scale (1.08 → 1) для full-bleed photos

### 3. Typewriter (Act 1 opening)
Елемент із `data-typewriter` атрибутом і `data-text="..."`. JS:
- Будує `<span>` для кожного UTF-16 character (Cyrillic — все в BMP, .split('') works)
- Послідовно додає `.is-on` через setTimeout
- Паузи на `,`, `.`, `…` довші — натуральний ритм читання

### 4. Turn-секція (Act 3)
Найскладніша анімація, послідовно:
1. Лапки Бланко (CSS keyframe `pawStep`, чотири з затримками 0.5s, 1.0s, 1.5s, 2.0s) — стартують при `.is-visible`
2. JS чекає `PAW_TRAIL_DURATION_MS` (1400ms), починає typewriter «2025» (по символу через `YEAR_CHAR_MS`=200ms)
3. Після року + `DATE_GAP_MS`=220ms — typewriter «02.07» (`DATE_CHAR_MS`=120ms/char)
4. Після дати + `TURN_GAP_MS`=320ms — fade-in `[data-turn-line]` («Все змінилось…»)

`visibility:hidden` на `.year-mark` і `.year-mark__date` за замовчуванням → JS додає `.is-ready` після побудови spans (запобігає flash unstyled тексту).

Tuning тайминги: константи `PAW_TRAIL_DURATION_MS`, `YEAR_CHAR_MS`, `DATE_CHAR_MS`, `DATE_GAP_MS`, `TURN_GAP_MS` в `script.js` секції 5.

### 5. Apple-style cinematic reveal (Act 5)
Окремий IntersectionObserver на `#giftReveal`, threshold 0.4. При спрацюванні `playCinematicReveal()` запускає setTimeout-ланцюжок:

| Час | Що відбувається |
|---|---|
| 0s | prelude видна (текст «І тому ти заслуговуєш…») |
| 1.8s | `.is-darkening` на `.act--gift` → `.cinema-bg` opacity 1, `.cinema-glow` росте |
| 1.8s | `.is-fading` на prelude → opacity 0 + translateY(-30px) |
| 3.3s | `.is-revealing` → glow scale 2.4, `.is-emerging` на cert → scale 0.32 → 1, blur 18 → 0 |
| 4.1s | `startSparkles()` — canvas-вибух |
| 5.4s | `.is-visible` на `.cinema-final` → buttons fade in |

Easing для cert: `cubic-bezier(0.16, 1, 0.3, 1)` — Apple ease-out-quint.

### 6. Sparkles (canvas)
`<canvas id="sparkles">` всередині `.act--gift`. Радіальний вибух з центру cert:
- 4 хвилі: 55+45+35+28 частинок з відсотковими затримками
- Continuous refill 6 частинок кожні 500ms впродовж 4.5s
- Кожна частинка: position, velocity, life, twinkle phase
- Twinkle через `Math.sin(t * tSpd + tOff)` для коливання opacity
- Палітра: 7 теплих gold/coral hex
- `mix-blend-mode: screen` — світяться на темному

### 7. Password gate (Yakaboo cert)
Const `PASSWORD = '7589'` в `script.js` (soft gate, не криптографія — код у source).

Default state (всі бачать):
- yakaboo header (видалено в останній версії)
- overline «подарунковий сертифікат»
- recipient «для: Мама Наталія»
- note «Для найкращої мами на світі — обери собі книжки і трохи тиші, щоб їх прочитати.»
- `.cert-lock` — input для коду

При correct input:
- `.is-unlocked` на `#certificate`
- `.cert-lock` collapse (max-height 0 + opacity 0)
- `.cert-unlocked` expand (max-height 380 + opacity 1) → з'являються амуант, code-box, copy button, validity

Wrong input: `.is-wrong` клас → CSS keyframe `shakeInput`, `navigator.vibrate(40)`, очистка через 700ms.

### 8. Blanko paw easter eggs
Три моменти, всі CSS-driven через `.is-visible` на parent section:

1. **Paw peek** (`.paw--peek`) — у Blanko-інтро секції (Act 2). SVG лапка позиціонується за межами правого краю, fade+slide на is-visible
2. **Paw nudge** (`.paw--nudge` всередині `.photo-frame`) — на 2-му фото Бланко. Атрибут `[data-blanko-nudge]` на секції тригерить:
   - `photoNudge` keyframe на `.photo-frame` — wobble (rotate ±1.6deg + translateX)
   - `pawNudge` keyframe на `.paw--nudge` — fade in зі scale + translate, тримається, fade out
   - `overflow:visible` override на `.photo-frame` для виходу лапки за рамку
3. **Paw trail** (`.paw-trail` з 4 SVG лапками) — у turn-секції перед роком. CSS-keyframe `pawStep` зі staggered animation-delays (0.5s, 1.0s, 1.5s, 2.0s)

### 9. Web Share / Copy
`navigator.share` з fallback на `navigator.clipboard.writeText`, ще fallback на `document.execCommand('copy')`. Toast-notification через `.toast` div (live-region) + class `.is-on`.

---

## iOS Safari quirks (що нас турбує)

- **`100dvh`** — динамічний viewport, реагує на URL-bar. Завжди давати fallback `100vh`. Підтримка iOS 15.4+
- **Snap scroll** — `proximity` (не `mandatory`!). Mandatory дає jank і блокує внутрішнє скролення
- **Auto-zoom on focus** — input повинен мати `font-size ≥16px`. У нас input 1.4rem ≈ 22px ✓
- **Numeric keyboard** — `inputmode="numeric" pattern="[0-9]*"` (не `type="number"` — некрасиві стрілочки на desktop, дозволяє букви на iOS)
- **Touch tap zoom** — `user-scalable=no` у viewport meta + `touchend` handler який блокує double-tap (script.js #11)
- **Tap highlight** — `-webkit-tap-highlight-color: transparent` на інтерактивних
- **Smooth scroll** — `-webkit-overflow-scrolling: touch` на `#story` (legacy, але в деяких WebViews ще треба)
- **Safe area** — `env(safe-area-inset-*)` у padding всіх секцій + `viewport-fit=cover`

---

## Локальний запуск

```powershell
cd e:\scripts\md26
python -m http.server 8000
```

Або `npx serve .`. Відкрити `http://localhost:8000` в Safari/Chrome.

З телефона по локальній мережі: знайти IP комп'ютера (`ipconfig`), на телефоні зайти `http://<IP>:8000`. Те саме Wi-Fi обов'язково.

---

## Деплой

GitHub Pages автоматично з гілки `main`:

```powershell
git push origin main
```

Через ~1-2 хвилини оновиться live на `https://cptjs.github.io/natali_motherday/`.

Налаштування Pages: Settings → Pages → Source: «Deploy from a branch» → Branch: `main` / `(root)`.

Власний домен: додати `CNAME` файл в корінь з доменом + DNS A-records. Поки не налаштовано.

---

## Часті правки контенту

### Замінити фото
1. Файл у `assets/` — той самий ім'ям, просто перезаписати
2. Стиснути спочатку: long side 1400px, MozJPEG quality 82, цільова вага ~150 КБ. Швидкий шлях — https://squoosh.app
3. Орієнтація: всі портретні (4:5 фрейм). Особливо критично для photos #6 і #14 (full-bleed)

### Змінити текст моменту
В `index.html` шукати по українському тексту або по класу `.act--moment`. Кожен такий момент — `<p class="display ... reveal">`.

### Змінити дані сертифіката
В `index.html`, секція `id="certificate"`:
- `.yakaboo-cert__recipient em` — ім'я отримувача
- `.yakaboo-cert__note` — особиста присвята всередині
- `.yakaboo-cert__value` — сума
- `#certCode` — код
- `.yakaboo-cert__validity` — термін дії

### Змінити пароль gate
`script.js` секція 7.5: `const PASSWORD = '7589';`. Зараз 4-digit, якщо хочеш інше — змінити також `maxlength="4"` на input.

### Додати/прибрати секцію
Просто додати/видалити `<section class="act ...">` в потрібному місці `index.html`. Snap-scroll і IO самі підхоплять.

### Змінити OG-прев'ю
`og-image.jpg` в `assets/`. Розмір 1200×630 рекомендований. `<meta property="og:title">`, `<meta property="og:description">` в `<head>`.

---

## Known gotchas

- **LF/CRLF warnings** при коміті на Windows — git auto-converts, ігнорувати
- **iOS aggressive caching** — після pushed змін може треба pull-to-refresh або reload без кешу. У `index.html` `<link>` і `<script>` без cache-busting hashes; для критичних змін можна додати `?v=N` суфікси
- **Шрифти Google** — потребує інтернету. Для офлайн-режиму — скачати локально й inline `@font-face`
- **Photo aspect-ratio 4:5** — landscape photos обріжуться по бокам. Якщо є важливі деталі по краях — пре-крокпити вручну
- **Password у source code** — soft gate. Користувач, який знає dev tools, знайде. Достатньо для друзів/родичів, не для серйозного захисту
- **Сума і код також у DOM** (під `display:none/max-height:0`) — той самий висновок: soft privacy
- **`prefers-reduced-motion`** — респектована, але деякі переходи через `setTimeout` не пропускаються (revealGift все ж має reduced gate). Якщо треба краще respectувати — пройтися ще раз по `script.js`

---

## Roadmap (не зроблено, на майбутнє)

- [ ] Service Worker для офлайн-кешу шрифтів і фото
- [ ] Loading skeleton для фото під час завантаження
- [ ] Підказка про password (наприклад через 8 секунд бездіяльності)
- [ ] Аудіо-доріжка з mute toggle
- [ ] WebP/AVIF з фолбеком на JPG (`<picture>` element)
- [ ] Кешбастінг через `?v=hash` для критичних релізів
- [ ] Серверна верифікація password (якщо переходити на справжній бекенд)

---

## Контекст для AI-асистента

Якщо передаєш проєкт іншій сесії Claude Code:
- Цей файл (`DEV.md`) описує high-level архітектуру
- `README.md` — інструкції для контент-овнера
- Принципи дизайну: cinematic, Apple keynote feel, NOT generic «Happy Mother's Day clipart»
- Все спілкування з користувачем — українською
- Користувач: Олег (`gkassper@gmail.com`), GitHub `cptjs`, дружина — Наталія
- Код у двох мовах: коментарі в JS/CSS змішано (UA для крупних блоків, EN для дрібниць), користувацький UI — лише українською
- Працюємо на Windows + PowerShell, але `Bash` tool також доступний
