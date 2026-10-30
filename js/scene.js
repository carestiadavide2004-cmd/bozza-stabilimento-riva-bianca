/* Riva Bianca — scene allo scorrimento (GSAP + ScrollTrigger).
   Nessuno scroll-jacking: lo scorrimento resta nativo, le scene lo seguono. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tourEl = $('[data-tour]');

  if (calm || !window.gsap || !window.ScrollTrigger) {
    if (tourEl) tourEl.classList.add('is-static');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // La tastiera del telefono cambia solo l'altezza: si ricalcola solo se cambia la larghezza
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    ScrollTrigger.refresh();
  });
  const small = () => innerWidth < 900;

  /* ---------- Hero ---------- */
  const heroBits = $$('.hero__kicker, .hero .status, .hero__actions');
  gsap.set(heroBits, { autoAlpha: 0, y: 18 });
  (window.rbIntro || Promise.resolve()).then(() => {
    gsap.timeline({ delay: .05 })
      .fromTo('[data-hero-lines] .ln > span', { yPercent: 108, y: 0 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .12 })
      .to(heroBits, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09 }, .25);
  });
  gsap.to('.hero__content', {
    yPercent: -10, autoAlpha: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true }
  });
  gsap.to('.hero__media', {
    yPercent: 16, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- Titoli riga per riga ---------- */
  $$('[data-lines]').forEach(el => {
    gsap.fromTo($$('.ln > span', el), { yPercent: 108, y: 0 }, {
      yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: .1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- Manifesto: le parole si accendono leggendo ---------- */
  const ink = $('[data-ink]');
  if (ink) {
    const words = ink.textContent.trim().split(/\s+/);
    ink.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      ink.append(s, i < words.length - 1 ? ' ' : '');
    });
    gsap.fromTo($$('.w', ink), { opacity: .16 }, {
      opacity: 1, ease: 'none', stagger: .05,
      scrollTrigger: { trigger: ink, start: 'top 80%', end: 'bottom 55%', scrub: true }
    });
  }

  /* ---------- Linea della riva che si disegna ---------- */
  $$('[data-riva] path').forEach(p => {
    gsap.to(p, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: p.ownerSVGElement, start: 'top 92%', once: true } });
  });

  /* ---------- Numeri che contano ---------- */
  $$('.stat').forEach((st, i) => {
    const num = $('[data-count]', st);
    const to = +num.dataset.count;
    const o = { v: 0 };
    num.textContent = '0';
    gsap.timeline({ scrollTrigger: { trigger: st, start: 'top 92%', once: true } })
      .fromTo(st, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', delay: i * .08 })
      .to(o, { v: to, duration: 1.9, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(o.v); } }, '<');
  });

  /* ---------- Foto a tendina + parallasse dentro la cornice ---------- */
  $$('[data-curtain]').forEach(fig => {
    const img = $('img', fig);
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 86%', once: true } });
    tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
    if (img) tl.fromTo(img, { scale: 1.16 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, .1);
  });
  $$('[data-parallax]').forEach(inner => {
    gsap.fromTo(inner, { yPercent: -5 }, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: inner.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Il video della spiaggia si allarga a tutto schermo ---------- */
  const grow = $('[data-grow]');
  if (grow) {
    gsap.fromTo('[data-grow-frame]',
      { clipPath: () => small() ? 'inset(8% 5% 8% 5% round 3px)' : 'inset(13% 16% 13% 16% round 3px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: grow, start: 'top 92%', end: 'top top', scrub: true, invalidateOnRefresh: true } });
    gsap.fromTo('.grow__caption', { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: grow, start: 'top 35%', end: 'top 2%', scrub: true }
    });
  }

  /* ---------- Carte e serate: ingresso leggero ---------- */
  $$('.price, .ecard, .week__list li, .dish').forEach(el => {
    gsap.fromTo(el, { autoAlpha: 0, y: 36 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 94%', once: true }
    });
  });

  /* ---------- Tour: sequenza di fotogrammi su canvas ---------- */
  if (tourEl) tour(tourEl);

  function tour(sec) {
    const canvas = $('[data-tour-canvas]', sec);
    const ctx = canvas.getContext('2d');
    const stages = $$('[data-stage]', sec);
    const bar = $('[data-tour-bar]', sec);
    const N = 100;
    const bounds = [0, .265, .5, .735, 1.01];       // dove cambia tappa (centro delle dissolvenze)
    const pad = i => String(i + 1).padStart(3, '0');
    const modeNow = () => (innerWidth / innerHeight < 1 ? 'm' : 'd');

    let mode = null, frames = [], ready = [], target = 0, current = 0, drawn = -1, raf = 0, errors = 0, okCount = 0, stage = -1;

    const fallback = () => {
      sec.classList.add('is-static');
      st.kill();
      ScrollTrigger.refresh();
    };

    const nearest = i => {
      for (let d = 0; d < N; d++) {
        if (ready[i - d]) return i - d;
        if (ready[i + d]) return i + d;
      }
      return -1;
    };
    const draw = force => {
      const i = nearest(Math.round(current));
      if (i < 0 || (i === drawn && !force)) return;
      const img = frames[i];
      const cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s, h = ih * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = i;
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.imageSmoothingQuality = 'high';
      draw(true);
    };
    const tick = () => {
      current += (target - current) * .2;
      if (Math.abs(target - current) < .02) current = target;
      draw();
      raf = current !== target ? requestAnimationFrame(tick) : 0;
    };

    // Caricamento progressivo: prima un fotogramma ogni 8, poi si riempiono i buchi
    const load = m => {
      mode = m; frames = []; ready = []; drawn = -1; okCount = 0;
      const order = [];
      [8, 4, 2, 1].forEach(step => { for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i); });
      let k = 0;
      const next = () => {
        if (k >= order.length || mode !== m) return;
        const i = order[k++];
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (mode !== m) return;
          ready[i] = true;
          okCount++;
          if (drawn < 0 || Math.abs(i - current) < Math.abs(drawn - current)) draw(true);
          next();
        };
        img.onerror = () => { if (++errors > 12) fallback(); else next(); };
        img.src = `assets/tour/${m}/${pad(i)}.webp`;
        frames[i] = img;
      };
      for (let c = 0; c < 6; c++) next();
    };

    const setStage = p => {
      const k = bounds.findIndex((b, j) => p >= b && p < bounds[j + 1]);
      if (k === stage) return;
      stage = k;
      sec.dataset.stage = k + 1;
      stages.forEach((s, j) => s.classList.toggle('is-active', j === k));
    };
    setStage(0);

    const st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom',
      onUpdate: self => {
        const p = self.progress;
        target = p * (N - 1);
        if (!raf) raf = requestAnimationFrame(tick);
        bar.style.transform = `scaleY(${p})`;
        setStage(p);
      }
    });

    // Parte quando il tour si avvicina: niente peso inutile all'apertura della pagina
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      size();
      load(modeNow());
      setTimeout(() => { if (!okCount) fallback(); }, 12000);
    };
    if ('IntersectionObserver' in window) {
      // prima il video dell'hero, poi i fotogrammi quando il tour è a una schermata di distanza
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
      }, { rootMargin: '100% 0px' });
      io.observe(sec);
    } else start();

    let w0 = innerWidth;
    addEventListener('resize', () => {
      if (!started || innerWidth === w0) return;
      w0 = innerWidth;
      if (modeNow() !== mode) load(modeNow());
      size();
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
