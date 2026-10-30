/* Riva Bianca — logica del sito. Tutti i dati arrivano da config.js */
(() => {
  const C = window.RB;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Se GSAP non arriva dal CDN il contenuto resta visibile e statico
  if (!window.gsap || !window.ScrollTrigger) root.classList.remove('motion');

  /* ---------- Date e orari (fuso di Pescara) ---------- */
  const TZ = C.fusoOrario || 'Europe/Rome';
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = () => {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    return { ymd: `${p.year}-${p.month}-${p.day}`, y: +p.year, min: +p.hour * 60 + +p.minute, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
  };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const hhmm = t => t.replace(/^0/, '');
  const dowOf = ymd => new Date(ymd + 'T12:00:00Z').getUTCDay();
  const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fmt = (ymd, o) => new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', ...o }).format(new Date(ymd + 'T12:00:00Z'));
  const dayLong = ymd => fmt(ymd, { weekday: 'long', day: 'numeric', month: 'long' });
  const dayMonth = ymd => fmt(ymd, { day: 'numeric', month: 'long' });

  const R = C.orari.ristorante;
  const B = C.orari.spiaggia;
  const isClosedDay = d => R.giorniChiusura.includes(d);
  const season = () => {
    const n = now();
    let y = n.y;
    if (n.ymd > `${y}-${C.stagione.fine}`) y += 1;
    const start = `${y}-${C.stagione.inizio}`, end = `${y}-${C.stagione.fine}`;
    return { start, end, y, open: n.ymd >= start && n.ymd <= end };
  };

  /* ---------- Dati di contatto ---------- */
  const A = C.indirizzo;
  const addr = `${A.via}, ${A.cap} ${A.citta} (${A.provincia})`;
  const waBase = `https://wa.me/${C.whatsapp}`;
  const waLink = text => `${waBase}?text=${encodeURIComponent(text)}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(A.mappa || addr)}`;

  $$('[data-cfg="indirizzo"]').forEach(e => { e.textContent = addr; });
  $$('[data-cfg-tel]').forEach(a => { a.href = `tel:${C.telefono.link}`; a.textContent = `Tel. ${C.telefono.testo}`; });
  $$('[data-cfg-tel-short]').forEach(a => { a.href = `tel:${C.telefono.link}`; });
  $$('[data-wa]').forEach(a => { a.href = waLink(`Ciao ${C.nome}, vorrei qualche informazione.`); });
  $$('[data-cfg-mail]').forEach(a => { a.href = `mailto:${C.email}`; a.textContent = C.email; });
  $$('[data-maps]').forEach(a => { a.href = mapsLink; });
  $$('[data-cfg="chefNome"]').forEach(e => { e.textContent = C.chef.nome; });
  $$('[data-cfg="chefCitazione"]').forEach(e => { e.textContent = C.chef.citazione; });
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });

  const socialIcons = { instagram: 'i-ig', facebook: 'i-fb', tiktok: 'i-tt' };
  const socialNames = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
  $$('[data-social]').forEach(ul => {
    ul.innerHTML = Object.entries(C.social).map(([k, url]) =>
      `<li><a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${socialNames[k] || k}"><svg aria-hidden="true"><use href="#${socialIcons[k] || 'i-arrow'}"/></svg></a></li>`).join('');
  });

  /* ---------- Aperto ora / Chiuso ---------- */
  function updateStatus() {
    const el = $('[data-status]');
    if (!el) return;
    const n = now();
    let open = false, head = 'Chiuso ora', tail = '';
    if (!isClosedDay(n.dow)) {
      const cur = R.fasce.find(f => n.min >= toMin(f.da) && n.min < toMin(f.a));
      if (cur) { open = true; head = 'Aperto ora'; tail = `cucina fino alle ${hhmm(cur.a)}`; }
      else {
        const next = R.fasce.find(f => n.min < toMin(f.da));
        if (next) tail = `riapre alle ${hhmm(next.da)}`;
      }
    } else head = `Chiuso il ${GIORNI[n.dow]}`;
    if (!tail) {
      for (let i = 1; i <= 7; i++) {
        const d = (n.dow + i) % 7;
        if (!isClosedDay(d)) { tail = `riapre ${i === 1 ? 'domani' : GIORNI[d]} alle ${hhmm(R.fasce[0].da)}`; break; }
      }
    }
    el.classList.toggle('is-open', open);
    $('[data-status-text]', el).textContent = `${head}, ${tail}`;
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  const s0 = season();
  $$('[data-season]').forEach(p => {
    const n = now();
    let t = `Stagione dal ${dayMonth(s0.start)} al ${dayMonth(s0.end)}, tutti i giorni dalle ${hhmm(B.da)} alle ${hhmm(B.a)}.`;
    if (!s0.open) t += ` Ora siamo fuori stagione: le prenotazioni per il ${s0.y} sono aperte.`;
    else if (n.min >= toMin(B.da) && n.min < toMin(B.a)) t += ' La spiaggia è aperta adesso.';
    p.textContent = t;
  });

  /* ---------- Orari ---------- */
  const closedTxt = R.giorniChiusura.map(d => GIORNI[d]).join(' e ');
  const restoRows = R.fasce.map(f => `<dt>${esc(f.nome)}</dt><dd>${hhmm(f.da)} – ${hhmm(f.a)}</dd>`).join('') +
    (closedTxt ? `<dt>Chiuso</dt><dd>il ${closedTxt}</dd>` : '');
  $$('[data-hours-resto]').forEach(dl => { dl.innerHTML = restoRows; });
  $$('[data-hours-all]').forEach(dl => {
    dl.innerHTML = `<dt class="hours__sep">Ristorante, tutto l'anno</dt>${restoRows}` +
      `<dt class="hours__sep">Spiaggia</dt><dt>Stagione</dt><dd>${dayMonth(s0.start)} – ${dayMonth(s0.end)}</dd><dt>Tutti i giorni</dt><dd>${hhmm(B.da)} – ${hhmm(B.a)}</dd>`;
  });

  /* ---------- Contenuti generati da config ---------- */
  $$('[data-stats]').forEach(dl => {
    dl.innerHTML = C.numeri.map(x =>
      `<div class="stat"><dt><span data-count="${x.valore}">${x.valore}</span>${x.unita ? `<small>${esc(x.unita)}</small>` : ''}</dt><dd>${esc(x.testo)}</dd></div>`).join('');
  });

  $$('[data-services]').forEach(ul => {
    ul.innerHTML = C.servizi.map(s => `<li><svg aria-hidden="true"><use href="#i-${s.icona}"/></svg><b>${esc(s.nome)}</b><span>${esc(s.testo)}</span></li>`).join('');
  });

  $$('[data-price-list]').forEach(box => {
    box.innerHTML = C.listino.map(p => `<article class="price"><h4>${esc(p.nome)}</h4><p>${esc(p.nota)}</p><dl>${
      p.righe.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></article>`).join('');
  });

  // Menù a schede
  const tabsBox = $('[data-tabs]'), menuBox = $('[data-menu]');
  if (tabsBox && menuBox) {
    const SHOW = 4;
    tabsBox.innerHTML = C.menu.map((c, i) =>
      `<button class="tab" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.nome)}</button>`).join('');
    menuBox.innerHTML = C.menu.map((c, i) => `
      <div class="menu__panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" tabindex="0" ${i ? 'hidden' : ''}>
        <ul class="dishlist">${c.piatti.map(([n, d, p], k) =>
          `<li${k >= SHOW ? ' class="is-extra"' : ''}><b>${esc(n)}</b><em>${esc(p)}${/\d$/.test(p) ? ' €' : ''}</em><span>${esc(d)}</span></li>`).join('')}</ul>
        ${c.piatti.length > SHOW ? `<button class="btn btn--line-light btn--sm menu__more" type="button" aria-expanded="false" data-more>Vedi tutto <span>(${c.piatti.length})</span></button>` : ''}
      </div>`).join('');
    const tabs = $$('[role="tab"]', tabsBox);
    const select = (t, focus) => {
      tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus({ preventScroll: true });
      // porta in vista la scheda scorrendo solo la fila delle schede, mai la pagina
      const l = t.getBoundingClientRect().left - tabsBox.getBoundingClientRect().left + tabsBox.scrollLeft, r = l + t.offsetWidth;
      if (l < tabsBox.scrollLeft || r > tabsBox.scrollLeft + tabsBox.clientWidth) tabsBox.scrollTo({ left: l - 16, behavior: calm ? 'auto' : 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        select(tabs[(k + tabs.length) % tabs.length], true);
      });
    });
    $$('[data-more]', menuBox).forEach(b => b.addEventListener('click', () => {
      const panel = b.closest('.menu__panel');
      const all = panel.classList.toggle('is-all');
      b.setAttribute('aria-expanded', all);
      b.firstChild.textContent = all ? 'Mostra meno ' : 'Vedi tutto ';
    }));
  }

  // Eventi
  $$('[data-event-cards]').forEach(box => {
    box.innerHTML = C.eventi.map(e => {
      const [f, s, l] = e.foto;
      const h = l === 1600 ? 1066 : 1800;
      return `<article class="ecard"><div class="pic"><img src="assets/img/${f}-${s}.webp" srcset="assets/img/${f}-${s}.webp ${s}w, assets/img/${f}-${l}.webp ${l}w" sizes="(min-width: 900px) 380px, 78vw" width="${l}" height="${h}" alt="${esc(e.titolo)}" loading="lazy" decoding="async"></div><h3>${esc(e.titolo)}</h3><p>${esc(e.testo)}</p></article>`;
    }).join('');
  });
  $$('[data-event-types]').forEach(sel => {
    sel.insertAdjacentHTML('beforeend', C.eventi.map(e => `<option>${esc(e.titolo)}</option>`).join('') + '<option>Altro</option>');
  });
  $$('[data-week]').forEach(ol => {
    ol.innerHTML = C.serate.map(s => `<li><b>${esc(s.giorno)}</b><span>${esc(s.titolo)}</span><em>${esc(s.ora)}</em></li>`).join('');
  });

  // Recensioni
  const revBox = $('[data-reviews]');
  if (revBox) {
    revBox.innerHTML = C.recensioni.map((r, i) =>
      `<article class="review" aria-label="Recensione ${i + 1} di ${C.recensioni.length}"><blockquote><p>${esc(r.testo)}</p></blockquote><footer><b>${esc(r.nome)}</b><span>${esc(r.origine)}</span></footer></article>`).join('');
    const count = $('[data-rev-count]');
    const n = C.recensioni.length;
    const idx = () => Math.round(revBox.scrollLeft / (revBox.clientWidth + 40));
    const upd = () => { count.textContent = `${idx() + 1} / ${n}`; };
    upd();
    revBox.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    const go = d => {
      const i = (idx() + d + n) % n;
      revBox.scrollTo({ left: i * (revBox.clientWidth + 40), behavior: calm ? 'auto' : 'smooth' });
    };
    $('[data-rev-prev]').addEventListener('click', () => go(-1));
    $('[data-rev-next]').addEventListener('click', () => go(1));
  }

  // Domande frequenti
  $$('[data-faq]').forEach(box => {
    box.innerHTML = C.faq.map(([q, a]) => `<details name="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  });

  // Dati strutturati per Google
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: C.nome,
    description: C.slogan,
    url: C.url,
    image: C.url + 'assets/img/og.jpg',
    telephone: C.telefono.link,
    email: C.email,
    servesCuisine: ['Pesce', 'Cucina di mare', 'Pizza gourmet'],
    priceRange: '€€€',
    acceptsReservations: true,
    hasMenu: C.url + '#menu',
    address: { '@type': 'PostalAddress', streetAddress: A.via, postalCode: A.cap, addressLocality: A.citta, addressRegion: A.provincia, addressCountry: 'IT' },
    openingHoursSpecification: R.fasce.map(f => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAYS_EN.filter((_, d) => !isClosedDay(d)),
      opens: f.da, closes: f.a
    })),
    sameAs: Object.values(C.social)
  };
  const ldTag = document.createElement('script');
  ldTag.type = 'application/ld+json';
  ldTag.textContent = JSON.stringify(ld);
  document.head.appendChild(ldTag);

  /* ---------- Intro (una volta per sessione) ---------- */
  window.rbIntro = new Promise(done => {
    const intro = $('[data-intro]');
    if (!root.classList.contains('has-intro') || !intro) { intro && intro.remove(); done(); return; }
    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      intro.remove();
      root.classList.remove('has-intro');
      try { sessionStorage.setItem('rb-intro', '1'); } catch (e) { /* storage non disponibile */ }
      done();
    };
    intro.addEventListener('animationend', e => { if (e.target === intro) end(); });
    const skip = () => { if (!ended) intro.classList.add('is-skip'); };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, skip, { once: true, passive: true }));
    setTimeout(end, 1450);
  });

  /* ---------- Header e menu su telefono ---------- */
  const header = $('[data-header]');
  const hero = $('.hero');
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const limit = (hero ? hero.offsetHeight : 400) - header.offsetHeight;
    header.classList.toggle('is-solid', y > limit);
    if (!root.classList.contains('nav-open')) {
      if (y > lastY + 6 && y > limit + 200) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < limit) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const burger = $('[data-burger]'), mnav = $('[data-mnav]');
  const setNav = open => {
    root.classList.toggle('nav-open', open);
    root.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', open);
    $('[data-burger-label]').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    mnav.inert = !open;
  };
  burger.addEventListener('click', () => setNav(!root.classList.contains('nav-open')));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('nav-open')) { setNav(false); burger.focus(); } });

  /* ---------- Video: verticale su telefono, orizzontale su computer ---------- */
  const portrait = () => innerWidth / innerHeight < 1;
  const vids = $$('video[data-video]');
  const srcFor = v => `assets/video/${v.dataset.video}-${portrait() ? 'mobile' : 'desktop'}.mp4`;
  const loadVid = v => {
    const s = srcFor(v);
    if (v.dataset.cur === s) return;
    v.dataset.cur = s;
    v.classList.remove('is-ready');
    v.src = s;
  };
  const playVid = v => {
    if (calm || v.dataset.user === 'off') return;
    loadVid(v);
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  vids.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    if (calm) v.removeAttribute('autoplay');
    v.addEventListener('playing', () => v.classList.add('is-ready'));
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) playVid(e.target); else e.target.pause();
    }), { rootMargin: '25% 0px' });
    vids.forEach(v => io.observe(v));
  } else vids.forEach(playVid);

  const toggle = $('[data-vid-toggle]');
  if (toggle) {
    const v = $(`video[data-video="${toggle.dataset.vidToggle}"]`);
    const sync = () => {
      const paused = v.paused || !v.dataset.cur;
      toggle.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-label', paused ? 'Riproduci il video' : 'Metti in pausa il video');
    };
    if (calm) v.dataset.user = 'off';
    toggle.addEventListener('click', () => {
      if (v.paused || !v.dataset.cur) {
        v.dataset.user = 'on';
        loadVid(v);
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else { v.dataset.user = 'off'; v.pause(); }
    });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    sync();
  }

  // Ricalcola solo se cambia la larghezza (la tastiera del telefono cambia solo l'altezza)
  let vw = innerWidth, wasPortrait = portrait();
  addEventListener('resize', () => {
    if (innerWidth === vw) return;
    vw = innerWidth;
    if (portrait() !== wasPortrait) {
      wasPortrait = portrait();
      vids.forEach(v => { if (v.dataset.cur && !v.paused) { loadVid(v); playVid(v); } else if (v.dataset.cur) delete v.dataset.cur; });
    }
  });

  /* ---------- Fascia di testo: ferma quando non si vede ---------- */
  const ribbon = $('[data-ribbon]');
  if (ribbon && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => ribbon.classList.toggle('is-paused', !e.isIntersecting)).observe(ribbon);
  }

  /* ---------- Caroselli ---------- */
  $$('[data-rail]').forEach(rail => {
    const track = $('.rail__track', rail);
    const step = d => track.scrollBy({ left: d * track.clientWidth * .8, behavior: calm ? 'auto' : 'smooth' });
    const p = $('[data-rail-prev]', rail), n = $('[data-rail-next]', rail);
    p && p.addEventListener('click', () => step(-1));
    n && n.addEventListener('click', () => step(1));
  });

  /* ---------- Galleria e lightbox ---------- */
  const dlg = $('[data-lb-dialog]');
  const shots = $$('[data-lb]');
  let cur = 0;
  const show = i => {
    cur = (i + shots.length) % shots.length;
    const a = shots[cur], alt = $('img', a).alt;
    // l'immagine nasce alla prima apertura: nessun <img> vuoto nella pagina
    let img = $('.lb__img', dlg);
    if (!img) { img = document.createElement('img'); img.className = 'lb__img'; dlg.prepend(img); }
    img.src = a.getAttribute('href');
    img.alt = alt;
    $('[data-lb-cap]', dlg).textContent = `${cur + 1} di ${shots.length}. ${alt}`;
  };
  const openLb = i => {
    show(i);
    root.classList.add('is-locked');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  };
  shots.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); openLb(i); }));
  if (dlg) {
    dlg.addEventListener('close', () => root.classList.remove('is-locked'));
    $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
    $('[data-lb-prev]', dlg).addEventListener('click', () => show(cur - 1));
    $('[data-lb-next]', dlg).addEventListener('click', () => show(cur + 1));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    let x0 = null;
    dlg.addEventListener('pointerdown', e => { x0 = e.clientX; });
    dlg.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  }
  const allBtn = $('[data-gallery-all]');
  if (allBtn) allBtn.addEventListener('click', () => {
    const g = $('#galleria');
    if (innerWidth >= 900 && !g.classList.contains('is-all')) {
      g.classList.add('is-all');
      allBtn.textContent = 'Apri la galleria a schermo intero';
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    } else openLb(0);
  });

  /* ---------- Mappa caricata solo su richiesta ---------- */
  $$('[data-map-load]').forEach(btn => btn.addEventListener('click', () => {
    const box = btn.closest('[data-map]');
    const f = document.createElement('iframe');
    f.src = `https://www.google.com/maps?q=${encodeURIComponent(A.mappa || addr)}&output=embed`;
    f.title = `Mappa: ${C.nome}, ${addr}`;
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.replaceChildren(f);
    box.classList.add('is-loaded');
  }));

  /* =========================================================
     MODULI: Web3Forms + alternativa WhatsApp
     ========================================================= */
  const KEY = (C.web3formsKey || '').trim();
  const today = now().ymd;

  const fieldOf = el => el.closest('.field') || el.closest('.check') || el.parentElement;
  const setErr = (el, msg) => {
    const f = fieldOf(el);
    let e = $(':scope > .err', f);
    if (!msg) { f.classList.remove('is-invalid'); if (e) e.remove(); return; }
    f.classList.add('is-invalid');
    if (!e) { e = document.createElement('small'); e.className = 'err'; f.appendChild(e); }
    e.textContent = msg;
  };
  const messageFor = el => {
    const v = el.validity;
    if (v.customError) return el.validationMessage;
    if (v.valueMissing) {
      if (el.type === 'checkbox') return 'Serve il consenso per inviare la richiesta.';
      if (el.type === 'radio') return 'Scegli un\'opzione.';
      if (el.tagName === 'SELECT') return 'Scegli un\'opzione.';
      return 'Campo obbligatorio.';
    }
    if (v.typeMismatch) return 'Indirizzo email non valido.';
    if (v.rangeUnderflow || v.rangeOverflow) return `Inserisci un numero tra ${el.min} e ${el.max}.`;
    return 'Controlla questo campo.';
  };
  const telOk = el => el.value.replace(/\D/g, '').length >= 6;

  // Controlla i campi di un contenitore senza far scorrere la pagina
  const validate = (box, { skipConsent = false } = {}) => {
    let first = null;
    const seen = new Set();
    $$('input, select, textarea', box).forEach(el => {
      if (el.name === 'botcheck' || el.disabled) return;
      if (el.type === 'radio') { if (seen.has(el.name)) return; seen.add(el.name); }
      if (skipConsent && el.hasAttribute('data-consent')) { setErr(el, ''); return; }
      if (el.type === 'tel') el.setCustomValidity(el.value && !telOk(el) ? 'Numero di telefono non valido.' : '');
      const msg = el.checkValidity() ? '' : messageFor(el);
      setErr(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus({ preventScroll: true });
    return !first;
  };

  const setMsg = (f, text, error) => {
    const m = $('[data-msg]', f);
    m.textContent = text;
    m.classList.toggle('is-error', !!error);
  };

  async function send(f, subject, data, onDone) {
    if (!KEY) {
      setMsg(f, 'Modalità demo: la richiesta non è stata inviata. Per provarla davvero usa "Invia su WhatsApp".');
      return;
    }
    const btn = $('[type="submit"]', f);
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Invio in corso…';
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: KEY, subject, from_name: `Sito ${C.nome}`, botcheck: f.botcheck.checked, ...data })
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      setMsg(f, 'Richiesta inviata. Ti contattiamo entro poche ore per confermare.');
      f.reset();
      if (onDone) onDone();
    } catch (err) {
      setMsg(f, `Invio non riuscito. Riprova, chiamaci al ${C.telefono.testo} o scrivici su WhatsApp.`, true);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  const openWa = lines => { window.open(waLink(lines.filter(Boolean).join('\n')), '_blank', 'noopener'); };

  $$('[data-form]').forEach(f => {
    f.insertAdjacentHTML('afterbegin', '<input type="checkbox" name="botcheck" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true">');
    if (!KEY) $('[data-demo]', f).hidden = false;
    // ricontrolla un campo appena viene corretto
    f.addEventListener('change', e => { if (fieldOf(e.target).classList.contains('is-invalid')) validate(fieldOf(e.target)); });
    f.addEventListener('input', e => { if (fieldOf(e.target).classList.contains('is-invalid')) validate(fieldOf(e.target)); });
  });

  /* --- Prenota l'ombrellone --- */
  const fo = $('[data-form="ombrellone"]');
  if (fo) {
    const s = season();
    const min = s.start > today ? s.start : today;
    const dal = fo.dal, al = fo.al;
    [dal, al].forEach(i => { i.min = min; i.max = s.end; });
    const range = () => {
      const out = `La spiaggia è aperta dal ${dayMonth(s.start)} al ${dayMonth(s.end)} ${s.y}.`;
      dal.setCustomValidity(dal.value && (dal.value < min || dal.value > s.end) ? (dal.value < today ? 'Scegli una data da oggi in poi.' : out) : '');
      al.setCustomValidity(al.value && (al.value > s.end || al.value < min) ? out : (al.value && dal.value && al.value < dal.value ? 'La data di fine viene dopo quella di inizio.' : ''));
    };
    dal.addEventListener('change', () => { if (dal.value) al.min = dal.value; range(); });
    al.addEventListener('change', range);
    const periodo = () => al.value && al.value !== dal.value ? `dal ${dayLong(dal.value)} al ${dayLong(al.value)}` : dayLong(dal.value);
    fo.addEventListener('submit', e => {
      e.preventDefault();
      range();
      if (!validate(fo)) { setMsg(fo, 'Controlla i campi evidenziati.', true); return; }
      send(fo, `Prenotazione ombrellone – ${C.nome}`, {
        Periodo: periodo(), Fila: fo.fila.value, Lettini: fo.lettini.value, Nome: fo.nome.value, Telefono: fo.telefono.value
      });
    });
    $('[data-wa-send]', fo).addEventListener('click', () => {
      range();
      if (!validate(fo, { skipConsent: true })) { setMsg(fo, 'Controlla i campi evidenziati.', true); return; }
      setMsg(fo, '');
      openWa([`Ciao ${C.nome}, vorrei prenotare un ombrellone.`, `Periodo: ${periodo()}`, `Fila: ${fo.fila.value}`, `Lettini: ${fo.lettini.value}`, `Nome: ${fo.nome.value}`, `Telefono: ${fo.telefono.value}`]);
    });
  }

  /* --- Prenota un tavolo (a passaggi) --- */
  const ft = $('[data-form="tavolo"]');
  if (ft) {
    const steps = $$('[data-step]', ft), dots = $$('[data-step-dot]', ft);
    const prev = $('[data-prev]', ft), next = $('[data-next]', ft), submit = $('[data-submit]', ft), wa = $('[data-wa-send]', ft);
    const date = $('[data-table-date]', ft), slots = $('[data-slots]', ft);
    let step = 0;

    date.min = today;
    date.max = addDays(today, 180);
    const checkDate = () => {
      const v = date.value;
      let msg = '';
      if (v && v < today) msg = 'Scegli una data da oggi in poi.';
      else if (v && v > date.max) msg = 'Si prenota fino a sei mesi prima.';
      else if (v && isClosedDay(dowOf(v))) msg = `Il ${GIORNI[dowOf(v)]} siamo chiusi: scegli un altro giorno.`;
      date.setCustomValidity(msg);
    };

    const renderSlots = () => {
      const fascia = ft.fascia.value || 'Cena';
      const chosen = ft.ora ? ft.ora.value : '';
      const n = now();
      const isToday = date.value === n.ymd;
      const list = C.turni[fascia] || [];
      const html = list.map(t => {
        const off = isToday && toMin(t) < n.min + 30;
        return `<label><input type="radio" name="ora" value="${t}" required ${off ? 'disabled' : ''} ${!off && t === chosen ? 'checked' : ''}><span>${t}</span></label>`;
      }).join('');
      const anyFree = list.some(t => !(isToday && toMin(t) < n.min + 30));
      slots.innerHTML = html + (anyFree ? '' : `<p class="chips__empty">Per oggi a ${fascia.toLowerCase()} non ci sono più orari: prova un altro giorno.</p>`);
    };
    renderSlots();
    date.addEventListener('change', () => { checkDate(); renderSlots(); });
    $$('input[name="fascia"]', ft).forEach(r => r.addEventListener('change', renderSlots));

    const pp = ft.persone;
    $('[data-step-minus]', ft).addEventListener('click', () => { pp.value = Math.max(1, (+pp.value || 1) - 1); });
    $('[data-step-plus]', ft).addEventListener('click', () => { pp.value = Math.min(12, (+pp.value || 1) + 1); });

    const checkStep = i => {
      if (i === 0) {
        checkDate();
        let ok = validate(steps[0]);
        if (ok && !$('input[name="ora"]:checked', ft)) { setErr(slots, 'Scegli un orario.'); ok = false; }
        return ok;
      }
      return validate(steps[i], { skipConsent: true });
    };

    const summary = () => {
      const s = $('[data-summary]', ft);
      s.textContent = `${dayLong(date.value)}, ore ${ft.ora.value} (${ft.fascia.value.toLowerCase()}), ${pp.value} ${+pp.value === 1 ? 'persona' : 'persone'}, ${ft.preferenza.value.toLowerCase()}.`;
    };

    const go = i => {
      step = i;
      steps.forEach((s, k) => { s.hidden = k !== i; });
      dots.forEach((d, k) => { d.classList.toggle('is-current', k === i); d.classList.toggle('is-done', k < i); });
      const last = i === steps.length - 1;
      prev.hidden = i === 0;
      next.hidden = last;
      submit.hidden = !last;
      wa.hidden = !last;
      if (last) summary();
      setMsg(ft, '');
      steps[i].tabIndex = -1;
      steps[i].focus({ preventScroll: true });
    };
    next.addEventListener('click', () => { if (checkStep(step)) go(step + 1); });
    prev.addEventListener('click', () => go(step - 1));

    const allOk = skipConsent => {
      for (let i = 0; i < steps.length; i++) {
        const ok = i === steps.length - 1 ? validate(steps[i], { skipConsent }) : checkStep(i);
        if (!ok) { if (i !== step) go(i); return false; }
      }
      return true;
    };
    const data = () => ({
      Data: dayLong(date.value), Orario: `${ft.ora.value} (${ft.fascia.value})`, Persone: pp.value,
      Preferenza: ft.preferenza.value, Nome: ft.nome.value, Telefono: ft.telefono.value, Note: ft.note.value
    });
    ft.addEventListener('submit', e => {
      e.preventDefault();
      if (!allOk(false)) { setMsg(ft, 'Controlla i campi evidenziati.', true); return; }
      send(ft, `Prenotazione tavolo – ${C.nome}`, data(), () => { renderSlots(); go(0); });
    });
    wa.addEventListener('click', () => {
      if (!allOk(true)) { setMsg(ft, 'Controlla i campi evidenziati.', true); return; }
      const d = data();
      openWa([`Ciao ${C.nome}, vorrei prenotare un tavolo.`, `Data: ${d.Data}`, `Orario: ${d.Orario}`, `Persone: ${d.Persone}`, `Preferenza: ${d.Preferenza}`, `Nome: ${d.Nome}`, `Telefono: ${d.Telefono}`, d.Note && `Note: ${d.Note}`]);
    });
  }

  /* --- Preventivo evento --- */
  const fe = $('[data-form="evento"]');
  if (fe) {
    const d = $('[data-future-date]', fe);
    d.min = today;
    d.max = addDays(today, 730);
    d.addEventListener('change', () => d.setCustomValidity(d.value && d.value < today ? 'Scegli una data da oggi in poi.' : ''));
    const data = () => ({
      Evento: fe.tipo.value, Data: d.value ? dayLong(d.value) + ' ' + d.value.slice(0, 4) : '', Ospiti: fe.ospiti.value,
      Nome: fe.nome.value, Telefono: fe.telefono.value, Email: fe.email.value, Messaggio: fe.messaggio.value
    });
    fe.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(fe)) { setMsg(fe, 'Controlla i campi evidenziati.', true); return; }
      send(fe, `Richiesta preventivo evento – ${C.nome}`, data());
    });
    $('[data-wa-send]', fe).addEventListener('click', () => {
      if (!validate(fe, { skipConsent: true })) { setMsg(fe, 'Controlla i campi evidenziati.', true); return; }
      setMsg(fe, '');
      const x = data();
      openWa([`Ciao ${C.nome}, vorrei un preventivo per un evento.`, `Tipo: ${x.Evento}`, `Data indicativa: ${x.Data}`, `Ospiti: ${x.Ospiti}`, `Nome: ${x.Nome}`, `Telefono: ${x.Telefono}`, x.Email && `Email: ${x.Email}`, x.Messaggio && `Dettagli: ${x.Messaggio}`]);
    });
  }

  /* ---------- Movimento ridotto: solo dissolvenze brevi ---------- */
  if (calm && 'IntersectionObserver' in window) {
    const els = $$('.section-head, .split, .chef, .pillar, .terrace, .pricing, .booking, .week, .quote-block, .stats');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => { el.setAttribute('data-fade', ''); io.observe(el); });
  }
})();
