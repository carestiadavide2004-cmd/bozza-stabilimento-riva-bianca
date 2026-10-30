/* Riva Bianca — il menù come "Libro del marinaio".
   Ogni sezione di RB.menu è una doppia pagina (computer) o una pagina (telefono).
   I piatti sono testo vero nella pagina; si sfoglia con frecce, bordo della pagina, swipe, tastiera e segnalibri. */
(() => {
  const C = window.RB;
  const box = document.querySelector('[data-libro]');
  if (!box || !C || !C.menu) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 900px)');
  const M = C.menu;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  /* ---------- Disegni a tratto: conchiglia, stella marina, onde, pesce, ancora, faro ---------- */
  const pt = (cx, cy, r, deg) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)].map(n => n.toFixed(1));
  const shell = () => {
    const a = [-72, -54, -36, -18, 0, 18, 36, 54, 72].map(d => pt(60, 56, 46, d));
    let edge = `M${a[0]}`;
    for (let i = 1; i < a.length; i++) edge += `A12 9 0 0 1 ${a[i]}`;
    return `<path d="${edge}L60 92Z"/>${a.slice(1, -1).map(p => `<path d="M60 90L${p}"/>`).join('')}<path d="M46 90l14 6 14-6-3 8H49z"/>`;
  };
  const star = () => {
    let d = '';
    for (let i = 0; i < 10; i++) d += (i ? 'L' : 'M') + pt(60, 54, i % 2 ? 17 : 44, i * 36).join(' ');
    const dots = [0, 72, 144, 216, 288].map(g => [20, 30].map(r => `<circle cx="${pt(60, 54, r, g)[0]}" cy="${pt(60, 54, r, g)[1]}" r="1.6"/>`).join('')).join('');
    return `<path d="${d}Z"/>${dots}`;
  };
  const waves = () => [34, 54, 74].map((y, i) => `<path d="M${8 + i * 6} ${y}q12-12 24 0t24 0 24 0 24 0"/>`).join('');
  const fish = () => `<path d="M12 52Q48 20 90 48l20-16-5 20 5 20-20-16Q48 86 12 52Z"/><circle cx="28" cy="48" r="3"/><path d="M40 38q7 14 0 28M52 44q4 8 0 16m10-14q4 6 0 12M58 30q10-12 22-2"/>`;
  const anchor = () => `<circle cx="60" cy="16" r="7"/><path d="M60 23v68M44 34h32M20 64q6 28 40 28t40-28M20 64l-4 10m4-10 10 3m70-3 4 10m-4-10-10 3"/>`;
  const lighthouse = () => `<path d="M48 92l6-56h12l6 56zM51 70h18M53 52h14M54 24h12v12H54zM51 24l9-10 9 10M72 30l24-8m-24 8 24 8M48 30l-24-8m24 8-24 8M24 96q9-6 18 0t18 0 18 0 18 0"/>`;
  const DRAW = [shell, star, waves, fish, anchor, shell, lighthouse];
  const art = (i, cls = 'pg__art') => `<svg class="${cls}" viewBox="0 0 120 100" aria-hidden="true">${DRAW[i % DRAW.length]()}</svg>`;
  const compass = () => {
    let d = '';
    [0, 90, 180, 270].forEach(g => { d += `M${pt(60, 60, 46, g)}L${pt(60, 60, 7, g + 45)}L60 60L${pt(60, 60, 7, g - 45)}Z`; });
    [45, 135, 225, 315].forEach(g => { d += `M${pt(60, 60, 28, g)}L${pt(60, 60, 5, g + 45)}L60 60L${pt(60, 60, 5, g - 45)}Z`; });
    const ticks = Array.from({ length: 32 }, (_, i) => `M${pt(60, 60, 50, i * 11.25)}L${pt(60, 60, i % 4 ? 53 : 56, i * 11.25)}`).join('');
    return `<svg class="cover__compass" viewBox="0 -18 120 138" aria-hidden="true"><circle cx="60" cy="60" r="56"/><circle cx="60" cy="60" r="50"/><path d="${ticks}"/><path d="${d}"/><text x="60" y="-5">N</text></svg>`;
  };

  /* ---------- Pagine ---------- */
  const price = p => `${esc(p)}${/\d$/.test(p) ? ' €' : ''}`;
  const dishes = list => `<ul class="piatti">${list.map(([n, d, p]) =>
    `<li class="piatto"><p class="piatto__head"><b>${esc(n)}</b><i aria-hidden="true"></i><em>${price(p)}</em></p><p class="piatto__desc">${esc(d)}</p></li>`).join('')}</ul>`;
  const head = (c, i) => `<header class="pg__title"><p class="pg__num">${ROMAN[i]}</p><h3 id="lb-${c.id}">${esc(c.nome)}</h3>${c.nota ? `<p class="pg__note">${esc(c.nota)}</p>` : ''}</header>`;
  const page = (side, run, body, folio) =>
    `<div class="pg pg--${side}"><p class="pg__run" aria-hidden="true">${run}</p>${body}${folio ? `<p class="pg__folio" aria-hidden="true">${folio}</p>` : ''}</div>`;
  const cover = () => `<div class="pg pg--cover"><div class="cover__frame">
      <svg class="cover__mono" aria-hidden="true"><use href="#rb-mono"/></svg>
      <p class="cover__title">Libro del marinaio</p>${compass()}
      <p class="cover__sub">Il menù di ${esc(C.nome || 'Riva Bianca')}<br>${esc((C.indirizzo && C.indirizzo.citta) || 'Pescara')}</p>
      <p class="cover__hint">Tocca per aprire</p></div></div>`;
  const blank = () => `<div class="pg pg--right pg--end"></div>`;
  const split = c => Math.max(1, Math.round(c.piatti.length / 2 - 1.2));

  let leaves = [], s = 0, opened = false, timers = [];
  const book = $('[data-libro-book]', box), marks = $('[data-libro-marks]', box);
  const where = $('[data-libro-where]', box), prev = $('[data-libro-prev]', box), next = $('[data-libro-next]', box);

  // Computer: foglio k = fronte (pagina destra della sezione k-1) + retro (pagina sinistra della sezione k).
  // Telefono: un foglio per pagina. In entrambi i casi la sezione k si legge con k+1 fogli girati.
  const build = () => {
    let html = '';
    if (wide.matches) {
      const L = M.map((c, i) => page('left', 'Libro del marinaio', head(c, i) + art(i) + dishes(c.piatti.slice(0, split(c))), 2 * i + 1));
      const R = M.map((c, i) => page('right', esc(c.nome), dishes(c.piatti.slice(split(c))), 2 * i + 2));
      const faces = [[cover(), L[0]]];
      for (let i = 1; i < M.length; i++) faces.push([R[i - 1], L[i]]);
      faces.push([R[M.length - 1], blank()]);
      html = faces.map(([f, b]) => `<div class="leaf"><div class="leaf__face leaf__front">${f}</div><div class="leaf__face leaf__back">${b}</div></div>`).join('');
    } else {
      html = [cover(), ...M.map((c, i) => page('single', esc(c.nome), head(c, i) + dishes(c.piatti) + art(i, 'pg__art pg__art--end'), i + 1))]
        .map(p => `<div class="leaf"><div class="leaf__face leaf__front">${p}</div></div>`).join('');
    }
    book.innerHTML = `<div class="libro__base" aria-hidden="true"></div>${html}
      <button class="libro__edge libro__edge--prev" type="button" tabindex="-1" aria-hidden="true" data-edge="-1"></button>
      <button class="libro__edge libro__edge--next" type="button" tabindex="-1" aria-hidden="true" data-edge="1"></button>`;
    leaves = $$('.leaf', book);
    paint(true);
  };

  const DUR = 900;
  const zFor = i => (i < s ? i + 1 : leaves.length - i);
  const paint = instant => {
    leaves.forEach((l, i) => {
      if (instant) l.style.transition = 'none';
      l.classList.toggle('is-flipped', i < s);
      l.classList.remove('is-turning');
      l.style.zIndex = zFor(i);
      l.style.removeProperty('--d');
    });
    if (instant) { book.offsetWidth; leaves.forEach(l => { l.style.transition = ''; }); }
    ui();
  };
  // stato dei comandi: libro aperto, frecce, segnalibro attivo, scritta "sezione, n di 7"
  const ui = () => {
    const k = s - 1, c = M[k];
    book.classList.toggle('is-open', s > 0);
    box.classList.toggle('is-open', s > 0);
    prev.disabled = s <= 1;
    next.disabled = s >= M.length;
    $$('.mark', marks).forEach((m, i) => m.setAttribute('aria-current', i === k ? 'true' : 'false'));
    where.textContent = c ? `${c.nome}, ${k + 1} di ${M.length}` : 'Libro chiuso';
  };

  const go = (t, user) => {
    t = Math.max(1, Math.min(M.length, t));
    if (!leaves.length || t === s) return;
    opened = true;
    timers.forEach(clearTimeout);
    timers = [];
    const from = s;
    if (calm) {
      // Riduci movimento: niente pagine che girano, solo una dissolvenza breve
      book.classList.add('is-fading');
      timers.push(setTimeout(() => { s = t; paint(true); book.classList.remove('is-fading'); }, 180));
    } else {
      const dir = t > from ? 1 : -1, turning = [];
      for (let i = from; i !== t; i += dir) turning.push(dir > 0 ? i : i - 1);
      const stag = turning.length > 1 ? Math.min(110, 520 / (turning.length - 1)) : 0;
      s = t;
      turning.forEach((i, k) => {
        const l = leaves[i], d = Math.round(k * stag);
        l.style.setProperty('--d', d + 'ms');
        // chi parte per primo resta sopra finché è in piedi, poi chi arriva dopo si posa sopra
        l.style.zIndex = 100 - k;
        timers.push(setTimeout(() => { l.style.zIndex = 100 + k; }, d + DUR / 2));
        l.classList.remove('is-turning');
        l.offsetWidth;
        l.classList.add('is-turning');
        l.classList.toggle('is-flipped', dir > 0);
      });
      timers.push(setTimeout(() => paint(false), Math.round((turning.length - 1) * stag) + DUR + 40));
      ui();
    }
    // telefono: se la pagina è più lunga dello schermo si torna all'inizio della pagina nuova
    if (user) {
      const top = book.getBoundingClientRect().top;
      if (top < 0) scrollTo({ top: scrollY + top - 96, behavior: calm ? 'auto' : 'smooth' });
    }
  };
  const step = (d, user) => go((s || 0) + d, user);

  /* ---------- Segnalibri ---------- */
  marks.innerHTML = M.map((c, i) => `<button class="mark" type="button" aria-current="false" aria-controls="libro-book" data-mark="${i}"><span>${esc(c.nome)}</span></button>`).join('');
  marks.addEventListener('click', e => {
    const b = e.target.closest('[data-mark]');
    if (!b) return;
    go(+b.dataset.mark + 1);
    // tieni in vista il segnalibro scelto scorrendo solo la fila, mai la pagina
    const l = b.offsetLeft - marks.offsetLeft, r = l + b.offsetWidth;
    if (l < marks.scrollLeft || r > marks.scrollLeft + marks.clientWidth) marks.scrollTo({ left: l - 24, behavior: calm ? 'auto' : 'smooth' });
  });

  /* ---------- Frecce, bordo della pagina, tastiera, swipe ---------- */
  prev.addEventListener('click', () => step(-1, true));
  next.addEventListener('click', () => step(1, true));
  let swipe = null, swiped = false;
  book.addEventListener('click', e => {
    if (swiped) return;
    const edge = e.target.closest('[data-edge]');
    if (s === 0) go(1);
    else if (edge) step(+edge.dataset.edge, true);
  });
  book.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1, PageDown: 1, PageUp: -1 }[e.key];
    if (d) { e.preventDefault(); step(d); }
    else if (e.key === 'Home') { e.preventDefault(); go(1); }
    else if (e.key === 'End') { e.preventDefault(); go(M.length); }
  });
  book.addEventListener('pointerdown', e => {
    swiped = false;
    if (e.pointerType !== 'mouse') swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  book.addEventListener('pointerup', e => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      step(dx < 0 ? 1 : -1);
      setTimeout(() => { swiped = false; }, 0);
    }
  });
  book.addEventListener('pointercancel', () => { swipe = null; });

  /* ---------- Si apre quando arriva sullo schermo ---------- */
  build();
  if (calm) go(1);
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timers.push(setTimeout(() => { if (!opened) go(1); }, 350));
    }, { threshold: .45 });
    io.observe(book);
  } else go(1);

  // cambio computer ↔ telefono: si ricostruiscono i fogli restando sulla stessa sezione
  wide.addEventListener('change', () => { timers.forEach(clearTimeout); build(); });
})();
