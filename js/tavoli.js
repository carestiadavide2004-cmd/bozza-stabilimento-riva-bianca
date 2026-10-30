/* Riva Bianca — piantina dei tavoli nel modulo "Prenota un tavolo" (passaggio 2).
   Zone e tavoli arrivano da config.js (RB.tavoli); stessa grafica e stesso zoom della mappa degli ombrelloni. */
(() => {
  const C = window.RB, T = C && C.tavoli, K = window.rbMapKit, F = window.rbForm;
  const ft = document.querySelector('[data-form="tavolo"]');
  if (!T || !K || !F || !ft) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = F.esc;
  const vp = $('[data-tm-viewport]', ft), cv = $('[data-tm-canvas]', ft), card = $('[data-tm-card]', ft);
  const pick = $('[data-tm-pick]', ft), input = $('[data-tm-input]', ft);

  /* ---------- Disposizione: dal mare (in alto) verso la sala ---------- */
  const W = 1000, SEA = 110, HEAD = 66, ROWH = 122, PAD = 16, GAP = 28, BAR = 92, MX = 46;
  const SIZE = { 2: [74, 100], 4: [108, 108], 6: [156, 108], rom: [118, 100] };
  let y = SEA;
  const zones = T.zone.map(z => {
    const top = y, h = HEAD + z.file.length * ROWH + PAD;
    y += h + GAP;
    return { ...z, top, h };
  });
  const H = y - GAP + BAR;
  const tables = [];
  let num = 0;
  zones.forEach(z => z.file.forEach((row, r) => row.forEach((t, i) => {
    const o = typeof t === 'object' ? t : { posti: t };
    const n = ++num, kind = o.romantico ? 'rom' : (SIZE[o.posti] ? String(o.posti) : '4');
    tables.push({
      id: `t${n}`, num: n, nome: o.nome || `Tavolo ${n}`, posti: o.posti, rom: !!o.romantico, zona: z, kind,
      w: SIZE[kind][0], h: SIZE[kind][1],
      x: MX + (W - 2 * MX) * (i + .5) / row.length, y: z.top + HEAD + r * ROWH + ROWH / 2
    });
  })));
  const byId = new Map(tables.map(t => [t.id, t]));

  /* ---------- Disegni dei tavoli visti dall'alto (colori dagli stati CSS, come gli ombrelloni) ---------- */
  const top = 'style="fill:var(--top);stroke:var(--edge)" stroke-width="2.5"';
  const chair = 'style="fill:var(--bed);stroke:var(--edge)" stroke-width="2"';
  const hatch = 'style="fill:url(#tm-hatch);opacity:var(--hatch-o)"';
  const check = 'style="stroke:#fff;opacity:var(--check-o)" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
  const seat = (x, yy, w, h) => `<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="7" ${chair}/>`;
  const board = (x, yy, w, h) => `<rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="7" ${top}/><rect x="${x}" y="${yy}" width="${w}" height="${h}" rx="7" ${hatch}/>`;
  const flame = (s = 1) => `<g transform="scale(${s})"><path d="M0-15C8-5 8 4 0 8-8 4-8-5 0-15Z" fill="#F0A33A"/><path d="M0-6C3-2 3 2 0 4-3 2-3-2 0-6Z" fill="#FFE7B0"/></g>`;
  document.body.insertAdjacentHTML('afterbegin', `<svg class="sprite" aria-hidden="true">
    <defs><radialGradient id="tm-glow"><stop offset=".35" stop-color="#F6B451" stop-opacity=".5"/><stop offset="1" stop-color="#F6B451" stop-opacity="0"/></radialGradient><pattern id="tm-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="#8C7656" stroke-width="2.4"/></pattern></defs>
    <symbol id="tm-2" viewBox="-37 -50 74 100">${seat(-19, -48, 38, 16)}${seat(-19, 32, 38, 16)}${board(-29, -29, 58, 58)}<path d="M-12 1l8 8 16-17" ${check}/></symbol>
    <symbol id="tm-4" viewBox="-54 -54 108 108">${seat(-19, -52, 38, 16)}${seat(-19, 36, 38, 16)}${seat(-52, -19, 16, 38)}${seat(36, -19, 16, 38)}${board(-33, -33, 66, 66)}<path d="M-13 1l9 9 18-19" ${check}/></symbol>
    <symbol id="tm-6" viewBox="-78 -54 156 108">${seat(-49, -52, 38, 16)}${seat(11, -52, 38, 16)}${seat(-49, 36, 38, 16)}${seat(11, 36, 38, 16)}${seat(-76, -19, 16, 38)}${seat(60, -19, 16, 38)}${board(-61, -33, 122, 66)}<path d="M-13 1l9 9 18-19" ${check}/></symbol>
    <symbol id="tm-rom" viewBox="-59 -50 118 100">
      <circle r="49" fill="url(#tm-glow)"/>
      <rect x="-57" y="-17" width="18" height="34" rx="8" ${chair}/><rect x="39" y="-17" width="18" height="34" rx="8" ${chair}/>
      <circle r="31" ${top}/><circle r="31" ${hatch}/>
      <g style="opacity:var(--num-o)"><rect x="-4" y="5" width="8" height="12" rx="1.5" fill="#fff" stroke="#C47F1E" stroke-width="1.5"/>${flame()}</g>
      <path d="M-13 1l9 9 18-19" ${check}/>
    </symbol>
    <symbol id="tm-candle-ico" viewBox="0 0 24 24"><path d="M12 2.5c3 3.4 3.2 6.6 0 8.5-3.2-1.9-3-5.1 0-8.5Z" fill="currentColor"/><rect x="9" y="13" width="6" height="8.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
  </svg>`);

  /* ---------- Sfondo: mare, sabbia, passerella, terrazza in legno, vetrate, sala, cucina ---------- */
  const wave = (yy, a) => K.wave(yy, a, W);
  const FILL = { riva: 'url(#tm-sand)', terrazza: 'url(#tm-deck)', sala: 'url(#tm-floor)' };
  const scene = () => `
    <defs>
      <linearGradient id="tm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B6673"/><stop offset=".6" stop-color="#3AA39F"/><stop offset="1" stop-color="#8ED2C9"/></linearGradient>
      <pattern id="tm-sand" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#E8D8B9"/><circle cx="5" cy="7" r="1.2" fill="#CDB48A"/><circle cx="16" cy="17" r="1" fill="#D3BC95"/></pattern>
      <pattern id="tm-deck" width="220" height="32" patternUnits="userSpaceOnUse"><rect width="220" height="32" fill="#D9C29C"/><path d="M0 31.5H220M140 0V32" stroke="#C5A97E" stroke-width="1.5"/></pattern>
      <pattern id="tm-floor" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#F2ECE1"/><path d="M0 63.5H64M63.5 0V64" stroke="#E2D8C6" stroke-width="1.2"/></pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="#EFE6D5"/>
    <rect width="${W}" height="${SEA}" fill="url(#tm-sea)"/>
    <g fill="none" stroke="#fff" stroke-linecap="round">
      <path class="bm__wave" d="${wave(40, 7)}" stroke-opacity=".25" stroke-width="2"/>
      <path class="bm__wave bm__wave--2" d="${wave(78, 8)}" stroke-opacity=".35" stroke-width="2.5"/>
    </g>
    <text x="${MX}" y="62" class="bm__sea-label">Mare Adriatico</text>
    ${zones.map((z, i) => {
      const next = zones[i + 1], gy = z.top + z.h;
      // tra due zone: vetrate se si entra in sala, altrimenti la passerella di legno
      const gap = !next ? '' : next.id === 'sala'
        ? `<rect y="${gy}" width="${W}" height="${GAP}" fill="#E4DCCD"/><path d="M0 ${gy + GAP / 2}H${W}" stroke="#9FD0D6" stroke-width="9" stroke-dasharray="170 46" stroke-dashoffset="-40"/>`
        : `<rect y="${gy}" width="${W}" height="${GAP}" fill="#CDB48A"/><path d="${Array.from({ length: Math.ceil(W / 18) }, (_, k) => `M${k * 18} ${gy}v${GAP}`).join('')}" stroke="#B89B6C" stroke-width="1.5"/>`;
      return `<rect y="${z.top}" width="${W}" height="${z.h}" fill="${FILL[z.id] || FILL.sala}"/>
        <text x="${MX}" y="${z.top + 44}" class="tm__zone">${esc(z.nome)}</text>${gap}`;
    }).join('')}
    <path class="bm__foam" d="${wave(SEA, 6)}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/>
    <rect y="${H - BAR}" width="${W}" height="${BAR}" fill="#0B2633"/>
    <text x="${W / 2}" y="${H - BAR + 56}" class="bm__bar-label">Cucina e bar</text>`;

  vp.style.aspectRatio = cv.style.aspectRatio = `${W} / ${H}`;
  cv.innerHTML = `<svg class="bm__bg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${scene()}</svg>
    <div class="bm__spots" role="group" aria-labelledby="lbl-tavolo">${tables.map(t =>
      `<button type="button" class="spot tav tav--${t.kind}" data-tav="${t.id}" aria-pressed="false" style="left:${(t.x - t.w / 2) / W * 100}%;top:${(t.y - t.h / 2) / H * 100}%;width:${t.w / W * 100}%;height:${t.h / H * 100}%"><svg viewBox="0 0 ${t.w} ${t.h}" aria-hidden="true"><use href="#tm-${t.kind}" width="${t.w}" height="${t.h}"/>${t.rom ? '' : `<text class="tav__num" x="${t.w / 2}" y="${t.h / 2}" dy=".36em">${t.num}</text>`}</svg></button>`).join('')}</div>`;
  const btns = new Map($$('[data-tav]', cv).map(b => [b.dataset.tav, b]));

  /* ---------- Disponibilità demo: casuale ma sempre uguale per la stessa data e fascia ---------- */
  let busy = new Set(), chosen = null, openId = null, wantRiva = false;
  const persone = () => +ft.persone.value || 1;
  const refresh = () => {
    const d = ft.data.value, f = ft.fascia.value || 'Cena';
    const dow = d ? new Date(`${d}T12:00:00Z`).getUTCDay() : 1;
    const base = T.occupatiDemo + (dow === 0 || dow === 5 || dow === 6 ? .1 : 0) + (f === 'Cena' ? .05 : 0);
    busy = new Set(d ? tables.filter(t => K.hash(`${d}|${f}|${t.id}`) < Math.min(.85, base + (t.rom ? .1 : 0))).map(t => t.id) : []);
    let note = '';
    if (chosen && busy.has(chosen.id)) { note = `${chosen.nome} non è libero in questa data e fascia: scegline un altro.`; chosen = null; }
    paint(note);
  };
  const paint = note => {
    tables.forEach(t => {
      const b = btns.get(t.id), isBusy = busy.has(t.id), isSel = chosen === t, small = !isBusy && !isSel && t.posti < persone();
      b.classList.toggle('is-busy', isBusy);
      b.classList.toggle('is-sel', isSel);
      b.classList.toggle('is-small', small);
      b.setAttribute('aria-pressed', isSel);
      b.setAttribute('aria-label', `${t.nome}, ${t.posti} posti, ${t.zona.nome.toLowerCase()}, ${isBusy ? 'occupato' : isSel ? 'scelto' : small ? 'troppo piccolo' : 'libero'}`);
    });
    input.value = chosen ? `${chosen.nome} (${chosen.zona.nome}, ${chosen.posti} posti)` : '';
    pick.textContent = note || (chosen ? `Hai scelto ${chosen.nome}: ${chosen.zona.nome.toLowerCase()}, ${chosen.posti} posti.` : 'Nessun tavolo scelto: lo assegniamo noi.');
    pick.classList.toggle('is-chosen', !!chosen);
    if (openId) showCard(byId.get(openId));
  };

  /* ---------- Scheda del tavolo ---------- */
  function showCard(t) {
    openId = t.id;
    const isBusy = busy.has(t.id), isSel = chosen === t, small = t.posti < persone();
    card.innerHTML = `
      <button class="bm__card-x" type="button" data-card-close aria-label="Chiudi la scheda"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
      <p class="bm__card-type">${esc(t.zona.nome)}${isBusy ? ' <em class="is-busy">occupato</em>' : isSel ? ' <em class="is-sel">scelto</em>' : ' <em>libero</em>'}</p>
      <h3 class="bm__card-title">${esc(t.nome)}</h3>
      <p class="bm__card-where">${t.rom ? `Tavolo ${t.num}, ` : ''}${t.posti} posti. ${esc(t.zona.nota || '')}</p>
      ${t.rom ? '<p class="bm__card-inc">Candele, fiori freschi e servizio dedicato per tutta la sera.</p>' : ''}
      ${isBusy ? '<p class="bm__card-busy">Già prenotato in questa data e fascia: prova un tavolo vicino o un altro orario.</p>'
        : small && !isSel ? `<p class="bm__card-busy">È un tavolo da ${t.posti}: per ${persone()} persone scegline uno più grande.</p>`
        : `<button class="btn ${isSel ? 'btn--line' : 'btn--dark'}" type="button" data-card-toggle>${isSel ? 'Togli la scelta' : 'Seleziona'}</button>`}`;
    card.hidden = false;
  }
  const hideCard = () => { card.hidden = true; openId = null; };
  card.addEventListener('click', e => {
    if (e.target.closest('[data-card-close]')) { const b = btns.get(openId); hideCard(); if (b) b.focus({ preventScroll: true }); return; }
    if (!e.target.closest('[data-card-toggle]')) return;
    const t = byId.get(openId);
    chosen = chosen === t ? null : t;
    paint();
    const b = $('[data-card-toggle]', card);
    if (b) b.focus({ preventScroll: true });
  });

  /* ---------- Zoom con + e −, trascinamento solo dentro il riquadro ---------- */
  const pz = K.panZoom(vp, cv, $('[data-tm-zoom="in"]', ft), $('[data-tm-zoom="out"]', ft), el => {
    const b = el.closest('[data-tav]');
    if (!b) return null;
    const t = byId.get(b.dataset.tav);
    return [t.x / W, t.y / H];
  });
  cv.addEventListener('click', e => {
    const b = e.target.closest('[data-tav]');
    if (!b || pz.moved()) return;
    showCard(byId.get(b.dataset.tav));
  });

  // i tavoli romantici in riva: si avvicina la zona e si apre la scheda del primo libero
  const riva = zones.find(z => z.id === 'riva');
  const focusRiva = () => {
    wantRiva = false;
    if (!riva) return;
    const small = vp.clientWidth < 600;
    pz.center(.5, (riva.top + riva.h / 2) / H, small ? 1 : 0);
    vp.classList.remove('is-rom-hint');
    vp.offsetWidth;
    vp.classList.add('is-rom-hint');
    const free = tables.find(t => t.rom && !busy.has(t.id));
    if (free) showCard(free);
    else pick.textContent = 'In questa data i tavoli in riva sono già tutti prenotati: prova un altro giorno o un tavolo in terrazza.';
  };

  /* ---------- Collegamenti con il modulo ---------- */
  ft.addEventListener('rb:step', e => {
    if (e.detail !== 1) return;
    refresh();
    requestAnimationFrame(() => { pz.apply(false); if (wantRiva) focusRiva(); });
  });
  ft.data.addEventListener('change', refresh);
  $$('input[name="fascia"]', ft).forEach(r => r.addEventListener('change', refresh));
  ft.persone.addEventListener('input', () => {
    let note = '';
    if (chosen && chosen.posti < persone()) { note = `${chosen.nome} ha ${chosen.posti} posti: per ${persone()} persone scegline uno più grande.`; chosen = null; }
    paint(note);
  });
  ft.addEventListener('reset', () => setTimeout(() => { chosen = null; hideCard(); paint(); }, 0));

  // "Prenota questo tavolo" nel riquadro della cena romantica
  const rom = $('[data-romantic]');
  if (rom) rom.addEventListener('click', () => {
    const S = ft.rbSteps;
    wantRiva = true;
    if (persone() !== 2) { ft.persone.value = 2; ft.persone.dispatchEvent(new Event('input', { bubbles: true })); }
    const head = document.querySelector('.header');
    scrollTo({ top: ft.getBoundingClientRect().top + scrollY - (head ? head.offsetHeight : 72) - 16, behavior: F.calm ? 'auto' : 'smooth' });
    if (!S) return;
    if (S.step === 1) focusRiva();
    else if (S.step === 2) S.go(1);
    else if (ft.data.value && $('input[name="ora"]:checked', ft) && S.checkStep(0)) S.go(1);
    else {
      F.setMsg(ft, 'Scegli il giorno e l\'orario: poi ti mostriamo i tavoli in riva al mare.');
      if (!ft.data.value) ft.data.focus({ preventScroll: true });
    }
  });

  paint();
})();
