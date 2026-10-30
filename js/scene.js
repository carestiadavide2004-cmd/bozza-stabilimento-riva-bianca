/* Riva Bianca — scene allo scorrimento (GSAP + ScrollTrigger).
   Nessuno scroll-jacking: lo scorrimento resta nativo, le scene lo seguono.
   Solo transform, opacity e clip-path. Su telefono effetti più leggeri e più brevi. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  // "Riduci movimento" o GSAP assente: il CSS mostra tutto fermo (tour a foto, dissolvenze brevi)
  if (!root.classList.contains('motion') || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // La tastiera del telefono cambia solo l'altezza: si ricalcola solo se cambia la larghezza
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
  let lastW = innerWidth, rt = 0;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    clearTimeout(rt);
    rt = setTimeout(() => ScrollTrigger.refresh(), 160);
  });

  /* ---------- Titoli lettera per lettera, dentro una maschera ---------- */
  $$('[data-chars]').forEach(el => {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    let i = 0;
    [...el.childNodes].forEach(n => {
      if (n.nodeName === 'BR') { out.append(document.createElement('br')); return; }
      if (n.nodeType !== 3) { out.append(n.cloneNode(true)); return; }
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { out.append(' '); return; }
        const w = document.createElement('span');
        w.className = 'wm';
        [...part].forEach(c => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          s.style.setProperty('--i', i++);
          w.append(s);
        });
        out.append(w);
      });
    });
    el.textContent = '';
    el.append(sr, out);
    el.classList.add('is-split');
  });

  /* ---------- Hero: ingresso dopo l'intro ---------- */
  const heroBits = $$('.hero__kicker, .hero .status, .hero__actions');
  gsap.set(heroBits, { autoAlpha: 0, y: 18 });
  (window.rbIntro || Promise.resolve()).then(() => {
    gsap.timeline({ delay: .05 })
      .fromTo('[data-hero-lines] .ln > span', { yPercent: 108, y: 0 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .12 })
      .to(heroBits, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09 }, .25);
  });

  /* ---------- Tour a capitoli video ---------- */
  const tourEl = $('[data-tour]');
  if (tourEl) tour(tourEl);

  function tour(sec) {
    const chaps = $$('.chap', sec), dots = $$('.tour__dots li', sec);
    const vids = chaps.map(c => $('video', c));
    const N = chaps.length;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    const portrait = () => innerWidth / innerHeight < 1;
    let active = 0, near = false, inView = false, mode = portrait(), z = 2;

    const load = i => {
      const v = vids[i];
      if (!v || saveData) return;
      const want = `assets/video/tour-${chaps[i].dataset.chapter}-${mode ? 'mobile' : 'desktop'}.mp4`;
      if (v.dataset.src === want) return;
      v.dataset.src = want;
      v.classList.remove('is-ready');
      v.preload = 'auto';
      v.src = want;
    };
    vids.forEach(v => v && v.addEventListener('playing', () => v.classList.add('is-ready')));

    // si carica e si riproduce solo il capitolo visibile, più il successivo in anticipo; gli altri in pausa
    const shown = c => c.style.visibility !== 'hidden' && +gsap.getProperty(c, 'opacity') > 0;
    const sync = () => {
      if (near) { load(active); if (active + 1 < N) load(active + 1); }
      vids.forEach((v, i) => {
        if (!v) return;
        if (inView && i === active && v.dataset.src) { const p = v.play(); if (p) p.catch(() => {}); }
        else if (!v.paused && (!inView || (i !== active && !shown(chaps[i])))) v.pause();
      });
    };

    gsap.set(chaps, { autoAlpha: 0, zIndex: 1 });
    gsap.set(chaps[0], { autoAlpha: 1, zIndex: z });
    const settle = i => () => {
      if (i !== active) return;
      chaps.forEach((c, k) => { if (k !== i) gsap.set(c, { autoAlpha: 0 }); });
      sync();
    };
    const go = i => {
      if (i === active) return;
      active = i;
      chaps.forEach((c, k) => c.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      const c = chaps[i], zc = +c.style.zIndex || 1;
      const cover = chaps.filter(o => o !== c && (+o.style.zIndex || 1) > zc && shown(o));
      if (shown(c) && +gsap.getProperty(c, 'opacity') > .99 && cover.length) {
        // si torna indietro mentre la dissolvenza è a metà: sfuma via ciò che sta sopra
        gsap.killTweensOf(cover);
        gsap.to(cover, { autoAlpha: 0, duration: .9, ease: 'power2.inOut', onComplete: settle(i) });
      } else {
        // il nuovo capitolo entra sopra il precedente, che resta pieno sotto: mai un buco nero
        gsap.killTweensOf(c);
        gsap.set(c, { zIndex: ++z });
        gsap.to(c, { autoAlpha: 1, duration: 1.1, ease: 'power2.inOut', onComplete: settle(i) });
      }
      sync();
    };
    // il testo del primo capitolo entra quando il tour arriva sullo schermo
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sec.classList.add('is-on'); io.disconnect(); } }, { rootMargin: '0px 0px -45% 0px' });
      io.observe(sec);
    } else sec.classList.add('is-on');

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom',
      onUpdate: self => go(Math.min(N - 1, Math.floor(self.progress * N * .9999)))
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top bottom', end: 'bottom top',
      onToggle: self => { inView = self.isActive; sync(); }
    });
    // il primo video comincia a scaricarsi quando il tour è a una schermata di distanza
    ScrollTrigger.create({
      trigger: sec, start: 'top 200%', end: 'bottom -100%',
      onToggle: self => { if (self.isActive && !near) { near = true; sync(); } }
    });
    addEventListener('resize', () => {
      if (portrait() === mode) return;
      mode = portrait();
      vids.forEach(v => { if (v && v.dataset.src) { delete v.dataset.src; v.classList.remove('is-ready'); } });
      sync();
    });
  }

  /* ---------- Tutto il resto: versione computer e versione telefono ---------- */
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 900px)', phone: '(max-width: 899px)' }, ctx => {
    const { desk } = ctx.conditions;
    const D = desk ? 1 : .7;      // durate
    const P = desk ? 1 : .4;      // parallasse
    const once = (trigger, start = 'top 86%') => ({ trigger, start, once: true });

    /* Hero: il testo sale e sfuma, il video scende più piano (profondità) */
    gsap.to('.hero__content', {
      yPercent: -12 * P, autoAlpha: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 25%', scrub: true }
    });
    gsap.to('.hero__media', {
      yPercent: 18 * P, scale: 1 + .06 * P, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* Titoli: lettere che salgono dalla maschera (fuori dal tour, che ha le sue) */
    $$('[data-chars]').filter(el => !el.closest('.tour')).forEach(el => {
      gsap.fromTo($$('.ch', el), { yPercent: 115 }, {
        yPercent: 0, duration: 1.1 * D, ease: 'expo.out', stagger: desk ? .035 : .022,
        scrollTrigger: once(el, 'top 90%')
      });
    });
    /* Titoli riga per riga */
    $$('[data-lines]').filter(el => !el.hasAttribute('data-hero-lines')).forEach(el => {
      gsap.fromTo($$('.ln > span', el), { yPercent: 108, y: 0 }, {
        yPercent: 0, duration: 1.15 * D, ease: 'expo.out', stagger: .1,
        scrollTrigger: once(el, 'top 90%')
      });
    });
    /* Testi accanto ai titoli */
    $$('.section-head__body, .book__aside > p, .chef__text, .terrace__text, .week__head, .quote-block__aside').forEach(el => {
      gsap.fromTo(el.matches('.chef__text') ? [...el.children] : el, { autoAlpha: 0, y: 26 * D }, {
        autoAlpha: 1, y: 0, duration: .9 * D, ease: 'power3.out', stagger: .08,
        scrollTrigger: once(el, 'top 88%')
      });
    });

    /* Manifesto: le parole si accendono leggendo */
    const ink = $('[data-ink]');
    if (ink) {
      if (!$('.w', ink)) {
        const words = ink.textContent.trim().split(/\s+/);
        ink.textContent = '';
        words.forEach((w, i) => {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = w;
          ink.append(s, i < words.length - 1 ? ' ' : '');
        });
      }
      gsap.fromTo($$('.w', ink), { opacity: .16 }, {
        opacity: 1, ease: 'none', stagger: .05,
        scrollTrigger: { trigger: ink, start: 'top 80%', end: 'bottom 55%', scrub: true }
      });
    }
    /* La linea della riva si disegna */
    $$('[data-riva] path').forEach(p => {
      gsap.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2 * D, ease: 'power2.inOut', scrollTrigger: once(p.ownerSVGElement, 'top 92%') });
    });
    /* Numeri che contano e linee verticali che crescono */
    $$('.stat').forEach((st, i) => {
      const num = $('[data-count]', st);
      if (!num) return;
      const to = +num.dataset.count, o = { v: 0 };
      gsap.timeline({ scrollTrigger: once(st, 'top 92%'), delay: i * .1 })
        .fromTo(st, { autoAlpha: 0, y: 30 * D, '--draw': 0 }, { autoAlpha: 1, y: 0, duration: 1 * D, ease: 'power3.out' })
        .to(st, { '--draw': 1, duration: 1.4 * D, ease: 'power2.inOut' }, '<')
        .fromTo(o, { v: 0 }, { v: to, duration: 1.9 * D, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(o.v); } }, '<');
    });

    /* Foto che entrano: di lato (alternate), a tendina dall'alto o dal basso, in diagonale, dal centro come un sipario */
    const SHUT = {
      left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)',
      top: 'inset(0% 0% 100% 0%)', bottom: 'inset(100% 0% 0% 0%)', center: 'inset(0% 50% 0% 50%)',
      diagonal: 'polygon(0% 0%, 0% 0%, -40% 100%, 0% 100%)'
    };
    $$('[data-reveal]').forEach(el => {
      const kind = SHUT[el.dataset.reveal] ? el.dataset.reveal : 'bottom';
      const media = $$('img, video', el).filter(m => !m.closest('.chap'));
      const side = kind === 'left' ? -1 : kind === 'right' ? 1 : 0;
      const tl = gsap.timeline({
        scrollTrigger: once(el, 'top 85%'),
        onComplete: () => { el.classList.add('is-in'); gsap.set(el, { clearProps: 'clipPath' }); }
      });
      tl.fromTo(el, { clipPath: SHUT[kind] }, {
        clipPath: kind === 'diagonal' ? 'polygon(0% 0%, 140% 0%, 100% 100%, 0% 100%)' : 'inset(0% 0% 0% 0%)',
        duration: (kind === 'diagonal' ? 1.8 : 1.5) * D, ease: 'expo.inOut'
      });
      if (side && desk) tl.fromTo(el, { x: side * 70 }, { x: 0, duration: 1.7, ease: 'expo.out' }, 0);
      if (media.length) tl.fromTo(media, { scale: kind === 'center' ? 1.32 : 1.2 }, { scale: 1, duration: 2 * D, ease: 'expo.out' }, .12);
    });

    /* Parallasse dentro le cornici */
    $$('[data-parallax]').forEach(inner => {
      gsap.fromTo(inner, { yPercent: -6 * P }, {
        yPercent: 6 * P, ease: 'none',
        scrollTrigger: { trigger: inner.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Parallasse a più livelli nel ristorante: scritta lenta, foto più veloci, testo fermo */
    const pillars = $('.pillars');
    if (pillars && desk) {
      const bg = $('[data-depth]', pillars);
      if (bg) gsap.fromTo(bg, { yPercent: -60, xPercent: 6 }, {
        yPercent: 60, xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: pillars, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      $$('.pillar .pic', pillars).forEach((pic, i) => {
        gsap.fromTo(pic, { y: 0 }, {
          y: i ? -90 : -45, ease: 'none',
          scrollTrigger: { trigger: pillars, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    /* Il video della spiaggia si allarga a tutto schermo */
    const grow = $('[data-grow]');
    if (grow) {
      gsap.fromTo('[data-grow-frame]',
        { clipPath: desk ? 'inset(13% 16% 13% 16% round 3px)' : 'inset(8% 5% 8% 5% round 3px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
          scrollTrigger: { trigger: grow, start: 'top 92%', end: 'top top', scrub: true } });
      gsap.fromTo('.grow__caption', { autoAlpha: 0, y: 30 * D }, {
        autoAlpha: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: grow, start: 'top 35%', end: 'top 2%', scrub: true }
      });
    }

    /* Foto della terrazza a tutto schermo che si restringe in una cornice */
    const shrink = $('[data-shrink]');
    if (shrink) {
      const frame = $('[data-shrink-frame]', shrink), img = $('img', frame);
      gsap.timeline({ scrollTrigger: { trigger: shrink, start: 'top top', end: 'bottom bottom', scrub: true } })
        .fromTo(frame, { scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)' },
          { scale: desk ? .7 : .84, clipPath: desk ? 'inset(0% 0% 0% 0% round 6px)' : 'inset(4% 0% 4% 0% round 6px)', ease: 'power1.inOut' })
        .fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'power1.inOut' }, 0);
    }

    /* Carte a ventaglio, una dopo l'altra (su telefono solo una salita leggera) */
    [$('[data-price-list]'), $('.dishes'), $('[data-event-cards]')].forEach(box => {
      const cards = box ? [...box.children] : [];
      if (!cards.length) return;
      const mid = (Math.min(cards.length, 3) - 1) / 2;
      if (desk) {
        gsap.fromTo(cards,
          { autoAlpha: 0, y: 110, rotation: i => (mid - Math.min(i, 2)) * 7, transformOrigin: '50% 190%' },
          { autoAlpha: 1, y: 0, rotation: 0, duration: 1.3, ease: 'expo.out', stagger: .13, scrollTrigger: once(box, 'top 84%'),
            onComplete: () => gsap.set(cards, { clearProps: 'transform' }) });
      } else {
        gsap.fromTo(cards, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09, scrollTrigger: once(box, 'top 88%') });
      }
    });

    /* Linee sottili che si disegnano sotto elenchi, servizi, serate e domande */
    ['.services', '[data-week]', '[data-faq]', '[data-menu] .dishlist'].forEach(sel => {
      const box = $(sel);
      if (!box) return;
      const items = [...box.children];
      if (!items.length) return;
      gsap.timeline({ scrollTrigger: once(box, 'top 85%') })
        .fromTo(items, { '--draw': 0 }, { '--draw': 1, duration: 1.3 * D, ease: 'power3.inOut', stagger: .08 })
        .fromTo(items, { autoAlpha: 0, y: 18 * D }, { autoAlpha: 1, y: 0, duration: .8 * D, ease: 'power3.out', stagger: .08 }, .1);
    });

    /* Moduli e pannello prenota: si aprono dal basso */
    $$('.book .form, .booking__card, .quote-block .form').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3 * D, ease: 'expo.inOut',
        scrollTrigger: once(el, 'top 88%'), onComplete: () => gsap.set(el, { clearProps: 'clipPath' })
      });
    });
    /* Anteprima della mappa: gli ombrelloni si aprono uno a uno */
    const umbs = $$('.booking__preview .spot-g');
    if (umbs.length) {
      gsap.fromTo(umbs, { opacity: 0, scale: .4, transformOrigin: '50% 50%' }, {
        opacity: 1, scale: 1, duration: .6, ease: 'back.out(2)', stagger: { each: desk ? .012 : .008, from: 'random' },
        scrollTrigger: once('.booking__preview', 'top 85%')
      });
    }

    /* Galleria: su computer scorre in orizzontale mentre si scende; su telefono resta un carosello */
    let cleanup;
    const gal = $('#galleria'), hs = $('[data-hs]'), track = gal && $('.gallery__grid', gal);
    if (gal && hs && track) {
      if (desk) {
        gal.classList.add('is-h');
        const imgs = $$('img', track);
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const setH = () => { hs.style.height = `${Math.round(innerHeight + dist())}px`; };
        setH();
        ScrollTrigger.addEventListener('refreshInit', setH);
        ScrollTrigger.create({ trigger: hs, start: 'top 300%', once: true, onEnter: () => imgs.forEach(im => { im.loading = 'eager'; }) });
        const slide = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: hs, start: 'top top', end: () => `+=${dist()}`, scrub: .6, invalidateOnRefresh: true }
        });
        $$('li', track).forEach(li => {
          gsap.fromTo($('img', li), { xPercent: -7, scale: 1.16 }, {
            xPercent: 7, scale: 1.16, ease: 'none',
            scrollTrigger: { trigger: li, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true }
          });
        });
        cleanup = () => {
          ScrollTrigger.removeEventListener('refreshInit', setH);
          gal.classList.remove('is-h');
          hs.style.height = '';
        };
      } else gsap.fromTo($$('li', track).slice(0, 4), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: once(track, 'top 90%') });
    }

    /* Recensioni e finale */
    const rev = $('[data-reviews]');
    if (rev) gsap.fromTo(rev, { autoAlpha: 0, y: 40 * D }, { autoAlpha: 1, y: 0, duration: 1.1 * D, ease: 'power3.out', scrollTrigger: once(rev, 'top 88%') });
    const fin = $('.finale');
    if (fin) {
      gsap.fromTo('.finale__media', { scale: 1 + .14 * P }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: fin, start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
      gsap.fromTo('.finale__content .hero__actions', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: once(fin, 'top 45%') });
    }
    return cleanup;
  });
})();
