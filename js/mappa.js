/* Riva Bianca — "Prenota l'ombrellone" con la mappa della spiaggia vista dall'alto.
   File, prezzi e postazioni speciali arrivano da config.js (RB.mappa). */
(() => {
  const C = window.RB, M = C && C.mappa, F = window.rbForm;
  const dlg = document.querySelector('[data-map-dialog]');
  if (!M || !F || !dlg) return;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const euro = n => `${n.toLocaleString('it-IT')} €`;

  /* ---------- Geometria (unità del disegno) ---------- */
  const N = M.ombrelloniPerFila, CELL = 72, AISLE = 72, ML = 52, MR = 44;
  const W = ML + N * CELL + AISLE + MR;
  const SEA = 168, ROW0 = 292, ROWH = 84;
  const BACK = ROW0 + M.file.length * ROWH + 26;   // postazioni speciali dietro l'ultima fila
  const BAR = BACK + 78;
  const H = BAR + 72;
  const AISLE_X = ML + M.passerella * CELL;
  const colX = c => ML + (c - .5) * CELL + (c > M.passerella + .5 ? AISLE : 0);

  const ORD = ['Prima', 'Seconda', 'Terza', 'Quarta', 'Quinta', 'Sesta', 'Settima', 'Ottava'];
  const spots = [];
  M.file.forEach((f, r) => {
    for (let c = 1; c <= N; c++) {
      spots.push({ id: `o${f.fila}-${c}`, tipo: 'ombrellone', num: c, fila: f.fila, prezzo: f.prezzo, x: colX(c), y: ROW0 + r * ROWH, w: CELL, h: ROWH });
    }
  });
  M.speciali.forEach(s => {
    const size = s.tipo === 'gazebo' ? 118 : 100;
    spots.push({ id: `${s.tipo}-${s.numero}`, tipo: s.tipo, num: s.numero, prezzo: M.tipi[s.tipo].prezzo, x: colX(s.colonna), y: BACK, w: size, h: size });
  });
  const byId = new Map(spots.map(s => [s.id, s]));
  const filaNome = f => `${ORD[f - 1] || `Fila ${f}`}${ORD[f - 1] ? ' fila' : ''}`;
  const nome = s => `${M.tipi[s.tipo].nome} ${s.num}`;
  const dove = s => (s.tipo === 'ombrellone' ? filaNome(s.fila) : 'Dietro le file, zona più riservata');
  const etichetta = (s, stato) => (s.tipo === 'ombrellone' ? `Fila ${s.fila}, ombrellone ${s.num}, ${stato}` : `${nome(s)}, ${stato}`);

  /* ---------- Disegni: ombrellone, palma e gazebo visti dall'alto ---------- */
  const state = 'style="fill:var(--top);stroke:var(--edge)"';
  const hatch = 'style="stroke:var(--hatch);opacity:var(--hatch-o)" fill="none" stroke-width="2"';
  const check = 'style="stroke:#fff;opacity:var(--check-o)" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  const bed = 'style="fill:var(--bed)"';
  const leaves = [0, 52, 104, 156, 208, 260, 312].map(a => `<path transform="rotate(${a})" d="M0 0C9-7 24-7 34 0 24 5 9 5 0 0Z"/>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg class="sprite" aria-hidden="true">
    <symbol id="bm-umb" viewBox="-36 -42 72 84">
      <rect x="-15" y="8" width="12" height="28" rx="3" ${bed}/><rect x="3" y="8" width="12" height="28" rx="3" ${bed}/>
      <circle r="24" ${state} stroke-width="2"/>
      <path d="M0-24V24M-24 0H24M-17-17 17 17M17-17-17 17" style="stroke:var(--rib)" stroke-width="1.2" fill="none"/>
      <path d="M-15.6-15.6 15.6 15.6M-9-20 20 9M-20-9 9 20M0-22 22 0M-22 0 0 22" ${hatch}/>
      <path d="M-9 1l6 6 12-13" ${check}/>
    </symbol>
    <symbol id="bm-palm" viewBox="-50 -50 100 100">
      <rect x="-42" y="-42" width="84" height="84" rx="18" ${state} stroke-width="2"/>
      <rect x="6" y="-4" width="12" height="30" rx="3" ${bed}/><rect x="22" y="-4" width="12" height="30" rx="3" ${bed}/>
      <rect x="-30" y="16" width="26" height="12" rx="3" ${bed}/><circle cx="12" cy="33" r="5" ${bed}/>
      <g transform="translate(-14 -14)" fill="#6F7F4E" opacity=".92">${leaves}<circle r="5" fill="#5A6840"/></g>
      <path d="M-40-40 40 40M-10-40 40 10M-40-10 10 40M20-40 40-20M-40 20-20 40" ${hatch}/>
      <path d="M-11 4l7 7 15-16" ${check}/>
    </symbol>
    <symbol id="bm-gaz" viewBox="-59 -59 118 118">
      <rect x="-40" y="40" width="14" height="16" rx="3" ${bed}/><rect x="-20" y="40" width="14" height="16" rx="3" ${bed}/>
      <rect x="6" y="40" width="14" height="16" rx="3" ${bed}/><rect x="26" y="40" width="14" height="16" rx="3" ${bed}/>
      <rect x="-46" y="-46" width="92" height="92" rx="5" ${state} stroke-width="2"/>
      <g style="stroke:var(--rib)" stroke-width="1.6" fill="none"><rect x="-13" y="-13" width="26" height="26" rx="2"/><path d="M-45-45-13-13M45-45 13-13M45 45 13 13M-45 45-13 13"/></g>
      <path d="M-44-44 44 44M-14-44 44 14M-44-14 14 44M16-44 44-16M-44 16-16 44" ${hatch}/>
      <path d="M-13 2l8 8 18-19" ${check}/>
    </symbol>
  </svg>`);
  const sym = { ombrellone: 'bm-umb', palma: 'bm-palm', gazebo: 'bm-gaz' };

  // Onde: tratti periodici (120 unità) che scorrono piano; la riva respira
  const wave = (y, a) => { let d = `M-120 ${y}q30 ${-a} 60 0`; for (let x = -60; x < W + 120; x += 60) d += 't60 0'; return d; };
  const scene = () => `
    <defs>
      <linearGradient id="bm-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B6673"/><stop offset=".55" stop-color="#3AA39F"/><stop offset="1" stop-color="#8ED2C9"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#EFE6D5"/>
    <rect width="${W}" height="${SEA + 26}" fill="#E3D5BC"/>
    <rect width="${W}" height="${SEA}" fill="url(#bm-sea)"/>
    <g class="bm__waves" fill="none" stroke="#fff" stroke-linecap="round">
      <path class="bm__wave" d="${wave(46, 7)}" stroke-opacity=".22" stroke-width="2"/>
      <path class="bm__wave bm__wave--2" d="${wave(88, 8)}" stroke-opacity=".3" stroke-width="2"/>
      <path class="bm__wave bm__wave--3" d="${wave(128, 9)}" stroke-opacity=".42" stroke-width="2.5"/>
    </g>
    <path class="bm__foam" d="${wave(SEA, 6)}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/>
    <text x="${ML}" y="72" class="bm__sea-label">Mare Adriatico</text>
    <rect x="${AISLE_X + 16}" y="${SEA + 40}" width="${AISLE - 32}" height="${BAR - SEA - 40}" rx="4" fill="#DCCAA8"/>
    <path d="M${AISLE_X + AISLE / 2} ${SEA + 52}V${BAR - 10}" stroke="#C9B48E" stroke-width="2" stroke-dasharray="10 12"/>
    <text x="22" y="${ROW0 - 50}" class="bm__row-label bm__row-label--small">fila</text>
    ${M.file.map((f, r) => `<text x="22" y="${ROW0 + r * ROWH + 9}" class="bm__row-label">${f.fila}</text>`).join('')}
    <rect y="${BAR}" width="${W}" height="${H - BAR}" fill="#0B2633"/>
    <text x="${W / 2}" y="${BAR + 44}" class="bm__bar-label">Bar, docce e ristorante</text>`;

  /* ---------- Disponibilità simulata: casuale ma sempre uguale per la stessa data ---------- */
  const hash = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    // rimescolamento finale: date e posti vicini danno risultati davvero diversi
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const busyFor = (key, n, weekend) => s => {
    let r = M.occupatiDemo + (weekend ? .1 : 0) + Math.min(.18, (n - 1) * .015);
    r += s.tipo === 'ombrellone' ? (s.fila === 1 ? .12 : s.fila === 2 ? .05 : 0) : .08;
    return hash(`${key}|${s.id}`) < Math.min(r, .8);
  };

  // Anteprima nella sezione spiaggia (solo disegno)
  const preview = $('[data-map-preview]');
  if (preview) {
    const demo = busyFor('anteprima', 1, false);
    preview.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${scene()}${spots.map(s =>
      `<use href="#${sym[s.tipo]}" class="spot-g${demo(s) ? ' is-busy' : ''}" x="${s.x - s.w / 2}" y="${s.y - s.h / 2}" width="${s.w}" height="${s.h}"/>`).join('')}</svg>`;
  }

  /* ---------- Pannello ---------- */
  const vp = $('[data-bm-viewport]', dlg), cv = $('[data-bm-canvas]', dlg), veil = $('[data-bm-veil]', dlg);
  const from = $('[data-bm-from]', dlg), to = $('[data-bm-to]', dlg);
  const card = $('[data-bm-card]', dlg), sumText = $('[data-bm-sum]', dlg), go = $('[data-bm-go]', dlg);
  const main = $('[data-bm-main]', dlg), side = $('.bm__side', dlg), form = $('[data-form="ombrellone"]', dlg);
  const zoomIn = $('[data-bm-zoom="in"]', dlg), zoomOut = $('[data-bm-zoom="out"]', dlg);
  vp.style.aspectRatio = cv.style.aspectRatio = `${W} / ${H}`;
  dlg.style.setProperty('--bm-ratio', (W / H).toFixed(4));
  cv.innerHTML = `<svg class="bm__bg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${scene()}</svg>
    <div class="bm__spots" role="group" aria-label="Mappa della spiaggia: il mare è in alto, la prima fila è la più vicina all'acqua">${spots.map(s =>
      `<button type="button" class="spot spot--${s.tipo}" data-spot="${s.id}" disabled aria-pressed="false" style="left:${(s.x - s.w / 2) / W * 100}%;top:${(s.y - s.h / 2) / H * 100}%;width:${s.w / W * 100}%;height:${s.h / H * 100}%"><svg viewBox="0 0 ${s.w} ${s.h}" aria-hidden="true"><use href="#${sym[s.tipo]}" width="${s.w}" height="${s.h}"/></svg></button>`).join('')}</div>`;
  const btns = new Map($$('[data-spot]', cv).map(b => [b.dataset.spot, b]));

  /* --- Date --- */
  const s0 = F.season();
  const today = F.now().ymd;
  const min = s0.start > today ? s0.start : today;
  [from, to].forEach(i => { i.min = min; i.max = s0.end; });
  const ymdDays = (a, b) => Math.round((new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`)) / 864e5) + 1;
  const giorni = () => (from.value ? ymdDays(from.value, to.value && to.value > from.value ? to.value : from.value) : 0);
  const datesOk = () => {
    const out = `La spiaggia è aperta dal ${F.dayMonth(s0.start)} al ${F.dayMonth(s0.end)} ${s0.y}.`;
    let a = '', b = '';
    if (from.value) a = from.value < today ? 'Scegli una data da oggi in poi.' : (from.value < min || from.value > s0.end ? out : '');
    if (to.value) b = from.value && to.value < from.value ? 'La data di fine viene dopo quella di inizio.' : (to.value > s0.end || to.value < min ? out : '');
    F.setErr(from, a);
    F.setErr(to, b);
    return !!from.value && !a && !b;
  };
  const periodo = () => {
    const y = from.value.slice(0, 4), n = giorni();
    return n > 1 ? `dal ${F.dayLong(from.value)} al ${F.dayLong(to.value)} ${y}` : `${F.dayLong(from.value)} ${y}`;
  };

  /* --- Stato dei posti --- */
  let busy = new Set();
  const sel = new Map();
  const paint = () => {
    const ready = !!busy.ready;
    spots.forEach(s => {
      const b = btns.get(s.id), isBusy = busy.has(s.id), isSel = sel.has(s.id);
      b.disabled = !ready;
      b.classList.toggle('is-busy', ready && isBusy);
      b.classList.toggle('is-sel', isSel);
      b.setAttribute('aria-pressed', isSel);
      b.setAttribute('aria-label', etichetta(s, !ready ? 'scegli prima la data' : isBusy ? 'occupato' : isSel ? 'selezionato' : 'libero'));
    });
    veil.hidden = ready;
    vp.classList.toggle('is-ready', ready);
  };
  const refresh = () => {
    if (!datesOk()) { busy = new Set(); paint(); hideCard(); summary(); return; }
    const n = giorni();
    let weekend = false;
    for (let i = 0; i < Math.min(n, 60); i++) { const d = F.addDays(from.value, i); const w = new Date(`${d}T12:00:00Z`).getUTCDay(); if (w === 0 || w === 6) weekend = true; }
    const test = busyFor(`${from.value}_${n}`, n, weekend);
    busy = new Set(spots.filter(test).map(s => s.id));
    busy.ready = true;
    let dropped = 0;
    sel.forEach((s, id) => { if (busy.has(id)) { sel.delete(id); dropped++; } });
    paint();
    summary(dropped ? `${dropped === 1 ? 'Un posto scelto non è libero' : `${dropped} posti scelti non sono liberi`} nelle nuove date ed è stato tolto.` : '');
    if (!card.hidden) showCard(byId.get(card.dataset.id));
  };
  from.addEventListener('change', () => { if (from.value && (!to.value || to.value < from.value)) to.min = from.value; refresh(); });
  to.addEventListener('change', refresh);
  veil.addEventListener('click', () => { try { from.showPicker(); } catch (e) { from.focus(); } });

  /* --- Scheda del posto --- */
  function showCard(s) {
    const t = M.tipi[s.tipo], n = giorni(), isBusy = busy.has(s.id), isSel = sel.has(s.id);
    card.dataset.id = s.id;
    card.innerHTML = `
      <button class="bm__card-x" type="button" data-card-close aria-label="Chiudi la scheda"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
      <p class="bm__card-type">${t.nome}${isBusy ? ' <em class="is-busy">occupato</em>' : isSel ? ' <em class="is-sel">selezionato</em>' : ' <em>libero</em>'}</p>
      <h3 class="bm__card-title">${s.tipo === 'ombrellone' ? `Posto ${s.num}` : nome(s)}</h3>
      <p class="bm__card-where">${dove(s)}</p>
      <p class="bm__card-inc">Comprende ${t.comprende.join(', ')}.</p>
      <p class="bm__card-price">${euro(s.prezzo)} <small>al giorno</small>${n > 1 ? `<span>${n} giorni: ${euro(s.prezzo * n)}</span>` : ''}</p>
      ${isBusy ? '<p class="bm__card-busy">Già prenotato in questa data: prova un posto vicino o un altro giorno.</p>'
        : `<button class="btn ${isSel ? 'btn--line' : 'btn--dark'}" type="button" data-card-toggle>${isSel ? 'Togli dalla selezione' : 'Seleziona'}</button>`}`;
    card.hidden = false;
    side.classList.add('has-card');
  }
  function hideCard() { card.hidden = true; side.classList.remove('has-card'); }
  card.addEventListener('click', e => {
    if (e.target.closest('[data-card-close]')) { const b = btns.get(card.dataset.id); hideCard(); if (b) b.focus({ preventScroll: true }); return; }
    if (!e.target.closest('[data-card-toggle]')) return;
    const s = byId.get(card.dataset.id);
    if (sel.has(s.id)) sel.delete(s.id); else sel.set(s.id, s);
    paint();
    summary();
    showCard(s);
  });

  /* --- Riepilogo --- */
  const totale = () => [...sel.values()].reduce((a, s) => a + s.prezzo, 0) * Math.max(giorni(), 1);
  function summary(note) {
    const list = [...sel.values()], n = giorni();
    sumText.innerHTML = list.length
      ? `<b>${list.length} ${list.length === 1 ? 'posto' : 'posti'}${n > 1 ? `, ${n} giorni` : ''}</b><span>Totale ${euro(totale())}</span>
         <ul class="bm__picked">${list.map(s => `<li>${nome(s)}${s.tipo === 'ombrellone' ? `, ${filaNome(s.fila).toLowerCase()}` : ''}<em>${euro(s.prezzo)}</em></li>`).join('')}</ul>`
      : (note || (busy.ready ? 'Tocca un posto libero sulla mappa' : 'Nessun posto scelto'));
    if (note && list.length) sumText.insertAdjacentHTML('beforeend', `<small class="bm__note">${note}</small>`);
    go.disabled = !list.length;
  }

  /* --- Tocco sui posti --- */
  let moved = false;
  cv.addEventListener('click', e => {
    const b = e.target.closest('[data-spot]');
    if (!b || moved) return;
    showCard(byId.get(b.dataset.spot));
  });

  /* --- Ingrandimento con + e −, spostamento col dito dentro il riquadro --- */
  const LEVELS = [1, 1.6, 2.3, 3];
  let z = 0, tx = 0, ty = 0;
  const apply = anim => {
    const w = vp.clientWidth, h = vp.clientHeight, s = LEVELS[z];
    tx = Math.min(0, Math.max(w - w * s, tx));
    ty = Math.min(0, Math.max(h - h * s, ty));
    cv.style.transition = anim && !F.calm ? 'transform .45s cubic-bezier(.16, 1, .3, 1)' : 'none';
    cv.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    vp.classList.toggle('is-zoomed', z > 0);
    zoomOut.disabled = z === 0;
    zoomIn.disabled = z === LEVELS.length - 1;
  };
  const zoomTo = (nz, cx = vp.clientWidth / 2, cy = vp.clientHeight / 2) => {
    const k = LEVELS[nz] / LEVELS[z];
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    z = nz;
    apply(true);
  };
  zoomIn.addEventListener('click', () => zoomTo(Math.min(z + 1, LEVELS.length - 1)));
  zoomOut.addEventListener('click', () => zoomTo(Math.max(z - 1, 0)));
  let drag = null;
  vp.addEventListener('pointerdown', e => {
    if (z === 0 || e.button > 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, tx, ty };
  });
  vp.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) { moved = true; vp.setPointerCapture(e.pointerId); vp.classList.add('is-dragging'); }
    tx = drag.tx + dx;
    ty = drag.ty + dy;
    apply(false);
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    vp.classList.remove('is-dragging');
    setTimeout(() => { moved = false; }, 0);
  };
  vp.addEventListener('pointerup', endDrag);
  vp.addEventListener('pointercancel', endDrag);
  // la tastiera può spostare il riquadro: si torna al disegno e si centra il posto
  vp.addEventListener('scroll', () => { vp.scrollLeft = 0; vp.scrollTop = 0; });
  cv.addEventListener('focusin', e => {
    const b = e.target.closest('[data-spot]');
    if (!b || z === 0 || drag) return;
    const s = byId.get(b.dataset.spot), w = vp.clientWidth, h = vp.clientHeight;
    const px = s.x / W * w * LEVELS[z] + tx, py = s.y / H * h * LEVELS[z] + ty;
    if (px < 40 || px > w - 40 || py < 40 || py > h - 40) { tx = w / 2 - s.x / W * w * LEVELS[z]; ty = h / 2 - s.y / H * h * LEVELS[z]; apply(true); }
  });
  let vw = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== vw) { vw = innerWidth; z = 0; tx = ty = 0; apply(false); } });

  /* --- Passaggio ai dati e invio --- */
  const showForm = on => {
    main.hidden = on;
    side.hidden = on;
    form.hidden = !on;
    dlg.classList.toggle('is-form', on);
    dlg.scrollTop = 0;
  };
  const posti = () => [...sel.values()].map(s => `${nome(s)}${s.tipo === 'ombrellone' ? ` (${filaNome(s.fila).toLowerCase()})` : ''}`);
  go.addEventListener('click', () => {
    if (!sel.size) return;
    const n = giorni();
    $('[data-bm-recap]', form).innerHTML = `<dl>
      <div><dt>${n > 1 ? 'Periodo' : 'Giorno'}</dt><dd>${periodo()}</dd></div>
      <div><dt>Posti</dt><dd>${posti().join(', ')}</dd></div>
      <div><dt>Totale indicativo</dt><dd>${euro(totale())}${n > 1 ? ` per ${n} giorni` : ''}</dd></div></dl>`;
    showForm(true);
    $('[data-msg]', form).textContent = '';
    // su telefono niente tastiera che si apre da sola
    const target = matchMedia('(hover: hover)').matches ? form.nome : $('h3', form);
    target.tabIndex = target === form.nome ? 0 : -1;
    target.focus({ preventScroll: true });
  });
  $('[data-bm-back]', form).addEventListener('click', () => { showForm(false); go.focus({ preventScroll: true }); });
  const dati = () => ({ Periodo: periodo(), Giorni: giorni(), Posti: posti().join(', '), Totale: euro(totale()), Nome: form.nome.value, Telefono: form.telefono.value });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!F.validate(form)) { F.setMsg(form, 'Controlla i campi evidenziati.', true); return; }
    F.send(form, `Prenotazione in spiaggia – ${C.nome}`, dati(), () => { sel.clear(); paint(); summary(); hideCard(); });
  });
  $('[data-wa-send]', form).addEventListener('click', () => {
    if (!F.validate(form, { skipConsent: true })) { F.setMsg(form, 'Controlla i campi evidenziati.', true); return; }
    F.setMsg(form, '');
    const d = dati();
    F.openWa([`Ciao ${C.nome}, vorrei prenotare in spiaggia.`, `${d.Giorni > 1 ? 'Periodo' : 'Giorno'}: ${d.Periodo}`, `Posti: ${d.Posti}`, `Totale indicativo: ${d.Totale}`, `Nome: ${d.Nome}`, `Telefono: ${d.Telefono}`]);
  });

  /* --- Apertura e chiusura --- */
  const chooser = $('[data-chooser]'), dockMain = $('.dock__main');
  const closeChooser = () => { if (!chooser) return; chooser.hidden = true; if (dockMain) dockMain.setAttribute('aria-expanded', 'false'); };
  const open = e => {
    if (e) e.preventDefault();
    closeChooser();
    showForm(false);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    root.classList.add('is-locked');
    requestAnimationFrame(() => apply(false));
  };
  $$('[data-open-map]').forEach(el => el.addEventListener('click', open));
  $('[data-map-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => root.classList.remove('is-locked'));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  // "Prenota" nella barra in basso: piccola scelta tra tavolo e ombrellone
  if (chooser && dockMain) {
    dockMain.setAttribute('aria-haspopup', 'true');
    dockMain.setAttribute('aria-expanded', 'false');
    dockMain.addEventListener('click', e => {
      e.preventDefault();
      const show = chooser.hidden;
      chooser.hidden = !show;
      dockMain.setAttribute('aria-expanded', show);
      if (show) $('a, button', chooser).focus({ preventScroll: true });
    });
    $('[data-chooser-close]', chooser).addEventListener('click', closeChooser);
    document.addEventListener('click', e => { if (!chooser.hidden && !chooser.contains(e.target) && !dockMain.contains(e.target)) closeChooser(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !chooser.hidden) { closeChooser(); dockMain.focus(); } });
  }

  paint();
  summary();
})();
