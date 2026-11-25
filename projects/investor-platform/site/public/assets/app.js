/* Platforma mijoz ilovasi: tashqi kutubxonasiz, ES2020.
   Barcha ma'lumot /api orqali serverdan olinadi. */
(() => {
  'use strict';

  const boot = JSON.parse(document.getElementById('boot').textContent);
  const NAME = boot.platformName;
  const TAX = boot.taxonomy;
  const state = { user: boot.user, savedIds: new Set() };
  const main = document.getElementById('main');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const label = {};
  for (const k of ['sectors', 'regions', 'stages', 'amounts', 'sorts']) label[k] = Object.fromEntries(TAX[k]);

  /* ---------------------------------------------------------------- */
  /* HTML shablon yordamchilari (avtomatik ekranlash bilan)             */
  /* ---------------------------------------------------------------- */
  class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
  const raw = (s) => new Raw(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toStr = (v) => (v == null || v === false ? '' : v instanceof Raw ? v.s : Array.isArray(v) ? v.map(toStr).join('') : esc(v));
  function html(strings, ...vals) {
    let out = '';
    strings.forEach((s, i) => { out += s; if (i < vals.length) out += toStr(vals[i]); });
    return raw(out);
  }

  const fmtAmount = (n) => (n == null ? '—' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' USD');
  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s.replace(' ', 'T') + 'Z');
    if (isNaN(d)) return s;
    const p = (x) => String(x).padStart(2, '0');
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
  }
  function paras(text) {
    if (!text) return '';
    return raw(text.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join(''));
  }
  const metaLine = (p) => [label.sectors[p.sector], label.regions[p.region], label.stages[p.stage]].filter(Boolean).join(' · ');

  const STAR = raw('<svg class="star__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>');
  const sampleBadge = (p) => (p.is_sample ? html`<span class="tag tag--sample" title="Sinov uchun qo‘shilgan e’lon">Namuna</span>` : '');
  const PROJECT_STATUS = { draft: 'Qoralama', published: 'Nashr qilingan', closed: 'Yopilgan' };
  const REQUEST_STATUS = { pending: 'Kutilmoqda', accepted: 'Qabul qilindi', rejected: 'Rad etildi' };
  const statusTag = (kind, s) => html`<span class="status status--${s}">${(kind === 'req' ? REQUEST_STATUS : PROJECT_STATUS)[s]}</span>`;

  /* ---------------------------------------------------------------- */
  /* API                                                               */
  /* ---------------------------------------------------------------- */
  class ApiError extends Error {
    constructor(status, data) {
      super((data && data.error) || 'Tarmoq xatosi. Internet aloqasini tekshirib, qayta urinib ko‘ring.');
      this.status = status;
      this.errors = (data && data.errors) || {};
    }
  }
  async function api(method, url, body, opts = {}) {
    const headers = { 'X-Requested-With': 'fetch' };
    let payload;
    if (body instanceof Blob) { payload = body; headers['Content-Type'] = opts.type || body.type; }
    else if (body !== undefined) { payload = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
    let res;
    try {
      res = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' });
    } catch {
      throw new ApiError(0, null);
    }
    let data = null;
    try { data = await res.json(); } catch { /* bo'sh javob */ }
    if (!res.ok) {
      if (res.status === 401 && state.user && url !== '/api/auth/login') { state.user = null; updateAccount(); }
      throw new ApiError(res.status, data);
    }
    return data;
  }

  async function loadSaved() {
    state.savedIds = new Set();
    if (!state.user) return;
    try {
      const r = await api('GET', '/api/me/saved');
      state.savedIds = new Set(r.ids);
    } catch { /* e'tiborsiz */ }
  }

  /* ---------------------------------------------------------------- */
  /* Umumiy UI                                                         */
  /* ---------------------------------------------------------------- */
  const toastEl = document.querySelector('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 4500);
  }

  function updateAccount() {
    const a = document.querySelector('[data-account]');
    if (state.user) { a.textContent = 'Kabinet'; a.setAttribute('href', '/kabinet'); }
    else { a.textContent = 'Kirish'; a.setAttribute('href', '/kirish'); }
    const cur = location.pathname;
    a.toggleAttribute('aria-current', cur.startsWith('/kabinet') || cur === '/kirish');
    if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page');
  }

  const safeNext = (n) => (typeof n === 'string' && /^\/(?!\/)/.test(n) ? n : null);
  const here = () => location.pathname + location.search + location.hash;
  const loginUrl = (next) => `/kirish?next=${encodeURIComponent(next || here())}`;
  const registerUrl = (role, next) => `/royxatdan-otish?${new URLSearchParams({ ...(role ? { rol: role } : {}), ...(next ? { next } : {}) })}`;
  const findInvestorUrl = () => (state.user ? '/kabinet/yangi' : registerUrl('tadbirkor', '/kabinet/yangi'));

  // Modal / pastdan chiquvchi panel. <dialog> fokusni ushlab turadi va Esc bilan yopiladi.
  function openDialog(content, { sheet = true, onReady } = {}) {
    const opener = document.activeElement;
    const dlg = document.createElement('dialog');
    dlg.className = sheet ? 'sheet' : 'modal';
    dlg.innerHTML = toStr(content);
    document.body.appendChild(dlg);
    dlg.addEventListener('close', () => {
      dlg.remove();
      if (opener && document.contains(opener)) opener.focus();
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close(); // fon ustiga bosish
      if (e.target.closest('[data-close]')) dlg.close();
    });
    dlg.showModal();
    if (onReady) onReady(dlg);
    return dlg;
  }

  function promptLogin(text, next) {
    openDialog(html`
      <div class="sheet__body">
        <h2 class="sheet__title" id="dlg-title">${text}</h2>
        <p>Saqlanganlar akkauntingizga bog‘lanadi va boshqa qurilmadan kirganda ham ko‘rinadi.</p>
      </div>
      <div class="sheet__foot">
        <button type="button" class="btn" data-close>Yopish</button>
        <a class="btn btn--primary" href="${loginUrl(next)}" data-close>Kirish</a>
      </div>
      <p class="sheet__extra"><a href="${registerUrl('investor', next || here())}" data-close>Akkaunt yo‘qmi? Ro‘yxatdan o‘ting</a></p>`,
    { onReady: (d) => {
      d.setAttribute('aria-labelledby', 'dlg-title');
      // Taklif "Kirish" / "Ro'yxatdan o'ting" havolasisiz yopilsa, saqlash niyati bekor qilinadi.
      let proceed = false;
      d.addEventListener('click', (e) => { if (e.target.closest('a[href]')) proceed = true; }, true);
      d.addEventListener('close', () => { if (!proceed) sessionStorage.removeItem('pendingSave'); });
    } });
  }

  /* ---------------------------------------------------------------- */
  /* Formalar: xatolarni ko'rsatish                                     */
  /* ---------------------------------------------------------------- */
  function field({ id, name, label: lab, type = 'text', value = '', hint, required, attrs = '', options, rows }) {
    const hintId = hint ? `${id}-hint` : '';
    const req = required ? html` <span class="req">${required === true ? 'majburiy' : required}</span>` : '';
    let control;
    if (type === 'textarea') {
      control = html`<textarea id="${id}" name="${name}" rows="${rows || 4}" ${raw(attrs)} ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}>${value}</textarea>`;
    } else if (type === 'select') {
      control = html`<select id="${id}" name="${name}" ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}>
        <option value="">Tanlang</option>
        ${options.map(([k, l]) => html`<option value="${k}" ${k === value ? raw('selected') : ''}>${l}</option>`)}
      </select>`;
    } else {
      control = html`<input id="${id}" name="${name}" type="${type}" value="${value}" ${raw(attrs)} ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}>`;
    }
    return html`<div class="field" data-field="${name}">
      <label for="${id}">${lab}${req}</label>
      ${hint ? html`<p class="hint" id="${hintId}">${hint}</p>` : ''}
      ${control}
    </div>`;
  }

  function clearErrors(form) {
    form.querySelectorAll('.field-error').forEach((e) => e.remove());
    form.querySelectorAll('[aria-invalid]').forEach((e) => {
      e.removeAttribute('aria-invalid');
      const d = (e.getAttribute('aria-describedby') || '').split(' ').filter((x) => !x.endsWith('-err')).join(' ');
      if (d) e.setAttribute('aria-describedby', d); else e.removeAttribute('aria-describedby');
    });
    const sum = form.querySelector('.error-summary');
    if (sum) { sum.hidden = true; sum.innerHTML = ''; }
  }

  function showErrors(form, errors, message) {
    clearErrors(form);
    const sum = form.querySelector('.error-summary');
    const items = [];
    for (const [name, msg] of Object.entries(errors || {})) {
      const wrap = form.querySelector(`[data-field="${name}"]`);
      const ctl = wrap && (wrap.querySelector('input:not([type=radio]), textarea, select') || wrap.querySelector('input'));
      if (!wrap || !ctl) { items.push(html`<li>${msg}</li>`); continue; }
      const errId = `${ctl.id || name}-err`;
      const p = document.createElement('p');
      p.className = 'field-error';
      p.id = errId;
      p.textContent = msg;
      const lab = wrap.querySelector('label, legend');
      const hint = wrap.querySelector('.hint');
      (hint || lab).after(p);
      wrap.querySelectorAll('input, textarea, select').forEach((c) => {
        c.setAttribute('aria-invalid', 'true');
        c.setAttribute('aria-describedby', [c.getAttribute('aria-describedby'), errId].filter(Boolean).join(' '));
      });
      const target = ctl.id ? `#${ctl.id}` : '';
      const fieldLabel = lab ? lab.firstChild.textContent.trim() : name;
      items.push(html`<li><a href="${target}" data-focus="${target}">${fieldLabel}: ${msg}</a></li>`);
    }
    if (sum) {
      sum.innerHTML = toStr(html`<h2 class="error-summary__title">${message || 'Formada xatolar bor'}</h2>${items.length ? html`<ul>${items}</ul>` : ''}`);
      sum.hidden = false;
      sum.focus();
    }
  }

  /* ---------------------------------------------------------------- */
  /* Marshrutlash                                                      */
  /* ---------------------------------------------------------------- */
  const routes = [
    [/^\/$/, (m, u) => viewCatalog(u, true)],
    [/^\/loyihalar$/, (m, u) => viewCatalog(u, false)],
    [/^\/loyihalar\/(\d+)$/, (m) => viewProject(Number(m[1]))],
    [/^\/kirish$/, (m, u) => viewLogin(u)],
    [/^\/royxatdan-otish$/, (m, u) => viewRegister(u)],
    [/^\/kabinet$/, () => viewCabinet()],
    [/^\/kabinet\/yangi$/, () => viewProjectForm(null)],
    [/^\/kabinet\/loyiha\/(\d+)$/, (m) => viewProjectForm(Number(m[1]))],
  ];
  let renderToken = 0;

  function setPage(title, content) {
    main.innerHTML = toStr(content);
    document.title = title ? `${title} — ${NAME}` : NAME;
  }

  async function render({ focus = true } = {}) {
    const token = ++renderToken;
    const u = new URL(location.href);
    updateAccount();
    document.body.dataset.page = '';
    document.body.removeAttribute('data-cta');
    cat = null;
    let done = false;
    for (const [re, view] of routes) {
      const m = u.pathname.match(re);
      if (m) {
        try { await view(m, u, token); } catch (e) { if (token === renderToken) viewError(e); }
        done = true;
        break;
      }
    }
    if (!done) viewNotFound();
    if (token !== renderToken) return;
    if (u.hash && u.hash.length > 1) {
      const t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (t) { t.scrollIntoView(); focusEl(t.querySelector('h2') || t); return; }
    }
    if (focus) {
      window.scrollTo(0, 0);
      const h = main.querySelector('h1');
      focusEl(h || main);
    }
  }

  function focusEl(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: false });
  }

  function navigate(url, { replace = false } = {}) {
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
    return render();
  }
  window.addEventListener('popstate', () => render());

  const stale = (token) => token !== undefined && token !== renderToken;

  /* ---------------------------------------------------------------- */
  /* Katalog (reestr)                                                  */
  /* ---------------------------------------------------------------- */
  const FILTER_KEYS = ['soha', 'hudud', 'bosqich', 'summa', 'tartib', 'q', 'saqlangan'];
  const DIM = {
    soha: { title: 'Soha', list: 'sectors' },
    hudud: { title: 'Hudud', list: 'regions' },
    bosqich: { title: 'Bosqich', list: 'stages' },
    summa: { title: 'Summa', list: 'amounts' },
  };
  let cat = null; // joriy katalog holati

  function readFilters(u) {
    const f = {};
    for (const k of FILTER_KEYS) { const v = u.searchParams.get(k); if (v) f[k] = v; }
    if (f.saqlangan && f.saqlangan !== '1') delete f.saqlangan;
    return f;
  }
  const filtersQuery = (f) => new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();

  async function viewCatalog(u, isHome, token) {
    const f = readFilters(u);
    if (f.saqlangan && !state.user) delete f.saqlangan;
    document.body.dataset.page = 'catalog';
    const savedCount = state.savedIds.size;
    setPage(isHome ? '' : 'Loyihalar', html`
      ${isHome ? html`
        <div class="intro wrap">
          <h1 class="intro__title">O‘zbekistondagi biznes loyihalari va investorlar</h1>
          <nav class="segment" aria-label="Asosiy amallar">
            <a class="segment__btn" href="/loyihalar">Loyihalarni ko‘rish</a>
            <a class="segment__btn" href="${findInvestorUrl()}" data-action="find-investor">Biznesimga investor topish</a>
          </nav>
        </div>` : ''}
      <div class="sortbar" role="group" aria-label="Saralash va filtrlar">
        <div class="sortbar__in wrap">
          ${Object.entries(DIM).map(([k, d]) => html`<button type="button" class="sortbar__btn" data-sheet="${k}" aria-haspopup="dialog">${d.title}<span class="sr-only" data-dimval="${k}"></span><span class="caret" aria-hidden="true"></span></button>`)}
        </div>
      </div>
      <section class="reestr-wrap wrap" aria-labelledby="reestr-title">
        <div class="filterbar">
          ${Object.entries(DIM).map(([k, d]) => html`
            <div class="filterbar__item">
              <label for="f-${k}">${d.title}</label>
              <select id="f-${k}" data-filter="${k}">
                <option value="">Hammasi</option>
                ${TAX[d.list].map(([v, l]) => html`<option value="${v}">${l}</option>`)}
              </select>
            </div>`)}
          <button type="button" class="toggle toggle--bar" data-action="toggle-saved" aria-pressed="false"><span>Saqlanganlar (<span data-savedcount>${savedCount}</span>)</span></button>
        </div>
        <div class="reestr-head">
          ${isHome ? html`<h2 id="reestr-title" class="reestr-head__title">Loyihalar</h2>` : html`<h1 id="reestr-title" class="reestr-head__title">Loyihalar</h1>`}
          <p class="reestr-head__count" data-count aria-live="polite"></p>
          <button type="button" class="toggle toggle--head" data-action="toggle-saved" aria-pressed="false">
            <span class="toggle__box" aria-hidden="true"></span><span>Faqat saqlanganlar (<span data-savedcount>${savedCount}</span>)</span>
          </button>
        </div>
        <p class="active-filters" data-active hidden></p>
        <table class="reestr">
          <caption class="sr-only">Loyihalar reestri</caption>
          <thead>
            <tr>
              <th scope="col" class="c-name" data-sortcol="nom"><button type="button" data-sortby="nom">Nom<span class="sortmark" aria-hidden="true"></span></button></th>
              <th scope="col" class="c-sector">Soha</th>
              <th scope="col" class="c-region">Hudud</th>
              <th scope="col" class="c-stage">Bosqich</th>
              <th scope="col" class="c-amount" data-sortcol="summa"><button type="button" data-sortby="summa">Summa<span class="sortmark" aria-hidden="true"></span></button></th>
              <th scope="col" class="c-save"><span class="sr-only">Saqlash</span></th>
            </tr>
          </thead>
          <tbody data-rows></tbody>
        </table>
        <div class="reestr-empty" data-empty hidden></div>
        <div class="reestr-more"><button type="button" class="btn" data-action="more" hidden>Yana ko‘rsatish</button></div>
      </section>`);
    cat = { isHome, filters: f, items: [], total: 0 };
    sessionStorage.setItem('lastCatalog', isHome ? '/' : u.pathname + u.search);
    const si = document.getElementById('search-input');
    if (si) si.value = f.q || '';
    await loadCatalog(false, token);
  }

  async function loadCatalog(append, token) {
    if (!cat) return;
    const f = cat.filters;
    syncFilterControls();
    const offset = append ? cat.items.length : 0;
    let data;
    try {
      data = await api('GET', `/api/projects?${filtersQuery({ ...f, limit: 50, offset })}`);
    } catch (e) {
      if (stale(token)) return;
      const tb = main.querySelector('[data-rows]');
      if (tb) tb.innerHTML = '';
      showEmpty(html`<p>${e.message}</p><button type="button" class="btn" data-action="retry">Qayta urinish</button>`);
      return;
    }
    if (stale(token) || !cat) return;
    cat.items = append ? cat.items.concat(data.items) : data.items;
    cat.total = data.total;
    for (const it of data.items) { if (it.saved) state.savedIds.add(it.id); }
    renderRows(append ? data.items : cat.items, append);
  }

  function rowHtml(p) {
    const saved = state.savedIds.has(p.id);
    return html`<tr class="row" data-href="/loyihalar/${p.id}">
      <td class="c-name">
        <div class="row__title">${sampleBadge(p)}<a class="row__link" href="/loyihalar/${p.id}">${p.name}</a></div>
        <div class="row__meta">${metaLine(p)}</div>
        <div class="row__what">${p.summary}</div>
      </td>
      <td class="c-sector">${label.sectors[p.sector]}</td>
      <td class="c-region">${label.regions[p.region]}</td>
      <td class="c-stage">${label.stages[p.stage]}</td>
      <td class="c-amount"><span class="amount">${fmtAmount(p.amount_usd)}</span></td>
      <td class="c-save"><button type="button" class="star" data-save="${p.id}" aria-pressed="${String(saved)}" aria-label="Saqlash: ${p.name}">${STAR}</button></td>
    </tr>`;
  }

  function renderRows(items, append) {
    const tb = main.querySelector('[data-rows]');
    if (!tb) return;
    const htmlRows = toStr(items.map(rowHtml));
    if (append) tb.insertAdjacentHTML('beforeend', htmlRows);
    else {
      tb.innerHTML = htmlRows;
      if (!reduceMotion.matches) { tb.classList.remove('is-swap'); void tb.offsetWidth; tb.classList.add('is-swap'); }
    }
    const f = cat.filters;
    const count = main.querySelector('[data-count]');
    count.textContent = `${cat.total} ta loyiha`;
    const more = main.querySelector('[data-action="more"]');
    more.hidden = cat.items.length >= cat.total;
    const filtered = ['soha', 'hudud', 'bosqich', 'summa', 'q'].some((k) => f[k]);
    if (cat.total === 0) {
      if (f.saqlangan && !filtered) {
        showEmpty(html`<p><strong>Hali saqlangan loyiha yo‘q.</strong> Reestrda yulduzcha tugmasini bosib, loyihalarni saqlang.</p>
          <button type="button" class="btn" data-action="toggle-saved">Barcha loyihalarni ko‘rish</button>`);
      } else if (filtered || f.saqlangan) {
        showEmpty(html`<p><strong>Loyiha topilmadi.</strong> Tanlangan filtrlarga mos e’lon yo‘q.</p>
          <button type="button" class="btn" data-action="clear-filters">Filtrlarni tozalash</button>`);
      } else {
        showEmpty(html`<p><strong>Hozircha nashr qilingan loyiha yo‘q.</strong></p>
          <a class="btn" href="${findInvestorUrl()}" data-action="find-investor">Birinchi loyihani joylash</a>`);
      }
    } else {
      showEmpty(null);
    }
    main.querySelector('.reestr').hidden = cat.total === 0;
  }

  function showEmpty(content) {
    const el = main.querySelector('[data-empty]');
    if (!el) return;
    el.hidden = !content;
    el.innerHTML = content ? toStr(content) : '';
  }

  function syncFilterControls() {
    const f = cat.filters;
    for (const k of Object.keys(DIM)) {
      const sel = main.querySelector(`[data-filter="${k}"]`);
      if (sel) sel.value = f[k] || '';
      const btn = main.querySelector(`[data-sheet="${k}"]`);
      const active = k === 'summa' ? !!(f.summa || (f.tartib && f.tartib.startsWith('summa'))) : !!f[k];
      if (btn) {
        btn.classList.toggle('is-active', active);
        const parts = [];
        if (f[k]) parts.push(label[DIM[k].list][f[k]]);
        if (k === 'summa' && f.tartib && f.tartib.startsWith('summa')) parts.push(label.sorts[f.tartib]);
        btn.querySelector('[data-dimval]').textContent = parts.length ? `: ${parts.join(', ')}` : '';
      }
    }
    main.querySelectorAll('[data-action="toggle-saved"][aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', String(!!f.saqlangan)));
    main.querySelectorAll('[data-savedcount]').forEach((s) => { s.textContent = state.savedIds.size; });
    // Ustun sarlavhalari: aria-sort
    const sort = f.tartib || 'yangi';
    const thNom = main.querySelector('[data-sortcol="nom"]');
    const thSum = main.querySelector('[data-sortcol="summa"]');
    if (thNom) {
      thNom.setAttribute('aria-sort', sort === 'nom' ? 'ascending' : 'none');
      thSum.setAttribute('aria-sort', sort === 'summa-kamayish' ? 'descending' : sort === 'summa-osish' ? 'ascending' : 'none');
      thNom.querySelector('.sortmark').dataset.dir = sort === 'nom' ? 'asc' : '';
      thSum.querySelector('.sortmark').dataset.dir = sort === 'summa-kamayish' ? 'desc' : sort === 'summa-osish' ? 'asc' : '';
    }
    // Faol filtrlar qatori
    const act = main.querySelector('[data-active]');
    const parts = [];
    for (const k of Object.keys(DIM)) if (f[k]) parts.push(label[DIM[k].list][f[k]]);
    if (f.q) parts.push(`qidiruv: “${f.q}”`);
    if (f.saqlangan) parts.push('faqat saqlanganlar');
    if (f.tartib && f.tartib !== 'yangi') parts.push(`tartib: ${label.sorts[f.tartib].toLowerCase()}`);
    act.hidden = !parts.length;
    act.innerHTML = parts.length ? toStr(html`<span>Tanlangan: ${parts.join(' · ')}</span> <button type="button" class="linkbtn" data-action="clear-filters">Filtrlarni tozalash</button>`) : '';
  }

  function applyFilters(next) {
    if (!cat) return;
    cat.filters = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    const qs = filtersQuery(cat.filters);
    const path = cat.isHome && !qs ? '/' : cat.isHome ? `/?${qs}` : `/loyihalar${qs ? '?' + qs : ''}`;
    history.replaceState(null, '', path);
    sessionStorage.setItem('lastCatalog', path);
    return loadCatalog(false, renderToken);
  }

  function openFilterSheet(dim) {
    const d = DIM[dim];
    const f = cat.filters;
    const draft = { ...f };
    const opts = (name, list, current, allLabel) => html`
      <div class="choices">
        ${allLabel ? html`<label class="choice"><input type="radio" name="${name}" value="" ${!current ? raw('checked') : ''}><span>${allLabel}</span></label>` : ''}
        ${list.map(([k, l]) => html`<label class="choice"><input type="radio" name="${name}" value="${k}" ${current === k ? raw('checked') : ''}><span>${l}</span></label>`)}
      </div>`;
    const body = dim === 'summa'
      ? html`<fieldset><legend>Investitsiya miqdori</legend>${opts('summa', TAX.amounts, f.summa, 'Hammasi')}</fieldset>
             <fieldset><legend>Tartib</legend>${opts('tartib', TAX.sorts, f.tartib || 'yangi')}</fieldset>`
      : html`<fieldset><legend class="sr-only">${d.title}</legend>${opts(dim, TAX[d.list], f[dim], 'Hammasi')}</fieldset>`;
    const dlg = openDialog(html`
      <form class="sheet__form" method="dialog">
        <div class="sheet__head">
          <h2 class="sheet__title" id="sheet-title">${d.title}</h2>
          <button type="button" class="linkbtn" data-close>Yopish</button>
        </div>
        <div class="sheet__body">${body}</div>
        <div class="sheet__foot">
          <button type="submit" class="btn btn--primary btn--wide" data-apply>Natijalarni ko‘rsatish</button>
        </div>
      </form>`, { onReady: (dl) => dl.setAttribute('aria-labelledby', 'sheet-title') });
    const applyBtn = dlg.querySelector('[data-apply]');
    let seq = 0;
    async function recount() {
      const my = ++seq;
      try {
        const r = await api('GET', `/api/projects?${filtersQuery({ ...draft, limit: 0 })}`);
        if (my === seq) applyBtn.textContent = r.total ? `${r.total} ta loyihani ko‘rsatish` : 'Mos loyiha yo‘q — baribir qo‘llash';
      } catch { if (my === seq) applyBtn.textContent = 'Natijalarni ko‘rsatish'; }
    }
    dlg.addEventListener('change', (e) => {
      if (e.target.type === 'radio') { draft[e.target.name] = e.target.value; recount(); }
    });
    dlg.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      dlg.close();
      applyFilters(draft);
    });
    recount();
    const checked = dlg.querySelector('input:checked');
    if (checked) checked.focus();
  }

  async function toggleSave(btn, id, name) {
    if (!state.user) {
      sessionStorage.setItem('pendingSave', String(id));
      promptLogin('Saqlash uchun akkauntga kiring');
      return;
    }
    const was = state.savedIds.has(id);
    const setPressed = (v) => {
      document.querySelectorAll(`[data-save="${id}"]`).forEach((b) => {
        b.setAttribute('aria-pressed', String(v));
        const t = b.querySelector('[data-savetext]');
        if (t) t.textContent = v ? 'Saqlangan' : 'Saqlash';
      });
      document.querySelectorAll('[data-savedcount]').forEach((s) => { s.textContent = state.savedIds.size; });
    };
    if (was) state.savedIds.delete(id); else state.savedIds.add(id);
    setPressed(!was);
    try {
      await api(was ? 'DELETE' : 'PUT', `/api/saved/${id}`);
      toast(was ? `“${name}” saqlanganlardan olib tashlandi.` : `“${name}” saqlandi.`);
      if (was && cat && cat.filters.saqlangan) loadCatalog(false, renderToken);
    } catch (e) {
      if (was) state.savedIds.add(id); else state.savedIds.delete(id);
      setPressed(was);
      if (e.status === 401) promptLogin('Saqlash uchun akkauntga kiring');
      else toast(e.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Loyiha sahifasi                                                   */
  /* ---------------------------------------------------------------- */
  function fundsBlock(text) {
    const lines = text.split('\n').map((l) => l.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
    if (!lines.length) return html`<p class="muted">Ko‘rsatilmagan.</p>`;
    const re = /^(.*?)[\s]*[—–:-]\s*(\d{1,3}(?:[.,]\d+)?)\s*%$/;
    const parsed = lines.map((l) => l.match(re));
    if (parsed.every(Boolean)) {
      return html`<table class="funds">
        <thead><tr><th scope="col">Yo‘nalish</th><th scope="col" class="num">Ulush</th></tr></thead>
        <tbody>${parsed.map((m) => html`<tr><td>${m[1]}</td><td class="num">${m[2]}%</td></tr>`)}</tbody>
      </table>`;
    }
    return html`<ul class="funds-list">${lines.map((l) => html`<li>${l}</li>`)}</ul>`;
  }

  function contactBlock(p, myReq) {
    const u = state.user;
    if (p.status === 'draft') return html`<p class="note">Bu qoralama hali nashr qilinmagan, uni faqat siz ko‘rasiz.</p>`;
    if (p.status === 'closed') return html`<p class="note">Bu e’lon yopilgan: tadbirkor investor izlashni yakunlagan. Yangi so‘rov yuborib bo‘lmaydi.</p>`;
    if (p.is_own) return html`<p class="note">Bu sizning e’loningiz. Investorlardan kelgan so‘rovlar <a href="/kabinet">kabinetingizda</a> ko‘rinadi.</p>`;
    if (p.is_sample) return html`<p class="note">Bu namuna e’lon: u sinov uchun qo‘shilgan va haqiqiy biznesga tegishli emas. Namuna e’lonlarga so‘rov yuborilmaydi.</p>`;
    if (!u) {
      return html`<p>So‘rov yuborish uchun investor akkauntiga kiring.</p>
        <p class="actions">
          <a class="btn btn--primary" href="${loginUrl(`/loyihalar/${p.id}#boglanish`)}">Kirish</a>
          <a class="btn" href="${registerUrl('investor', `/loyihalar/${p.id}#boglanish`)}">Investor sifatida ro‘yxatdan o‘tish</a>
        </p>`;
    }
    if (u.role !== 'investor') return html`<p class="note">Tadbirkorga so‘rovni investor akkaunti yuboradi. Siz tadbirkor akkauntidasiz.</p>`;
    if (myReq && myReq.status !== 'rejected') {
      return html`<p class="note">Siz bu loyihaga <span class="mono">${fmtDate(myReq.created_at)}</span> kuni so‘rov yuborgansiz. Holati: ${statusTag('req', myReq.status)}</p>
        <p><a href="/kabinet">So‘rovlarim holatini kabinetda ko‘rish</a></p>`;
    }
    return html`
      ${myReq && myReq.status === 'rejected' ? html`<p class="note">Oldingi so‘rovingiz ${statusTag('req', 'rejected')}. Xohlasangiz, yangi so‘rov yuborishingiz mumkin.</p>` : ''}
      <form class="form" data-form="contact" data-id="${p.id}" novalidate>
        <div class="error-summary" tabindex="-1" role="alert" hidden></div>
        ${field({ id: 'c-message', name: 'message', label: 'Xabaringiz', type: 'textarea', rows: 5, required: true,
          hint: 'O‘zingiz va loyihaga qiziqishingiz haqida qisqacha yozing (10–1000 ta belgi).', attrs: 'maxlength="1000"' })}
        ${field({ id: 'c-contact', name: 'contact', label: 'Javob olish uchun aloqa ma’lumoti', required: true,
          hint: 'Telefon, email yoki Telegram, masalan: +998 90 123 45 67 yoki @username', attrs: 'maxlength="150" autocomplete="tel"' })}
        <button type="submit" class="btn btn--primary">So‘rovni yuborish</button>
      </form>`;
  }

  async function viewProject(id, _u, token) {
    let data;
    try {
      data = await api('GET', `/api/projects/${id}`);
    } catch (e) {
      if (stale(token)) return;
      if (e.status === 404) return viewNotFound('Loyiha topilmadi', 'Bu e’lon mavjud emas yoki hali nashr qilinmagan.');
      throw e;
    }
    if (stale(token)) return;
    const { project: p, saved, my_request: myReq } = data;
    if (saved) state.savedIds.add(p.id);
    document.body.dataset.page = 'project';
    const back = sessionStorage.getItem('lastCatalog') || '/loyihalar';
    const canSave = p.status === 'published';
    // Bog'lanish tugmasi faqat so'rov yuborish mumkin bo'lgan e'londa ko'rsatiladi (decision.md, 7-band).
    const canContact = p.status === 'published' && !p.is_sample && !p.is_own;
    setPage(p.name || 'Nomsiz qoralama', html`
      <article class="doc wrap">
        <p class="crumbs"><a href="${back}">Reestrga qaytish</a>${p.is_own ? html` · <a href="/kabinet/loyiha/${p.id}">Tahrirlash</a>` : ''}</p>
        <header class="doc__head">
          <div class="doc__tags">
            ${sampleBadge(p)}
            ${p.status !== 'published' ? statusTag('proj', p.status) : ''}
          </div>
          <h1 class="doc__title">${p.name || 'Nomsiz qoralama'}</h1>
          <p class="doc__meta">${metaLine(p)}</p>
          <dl class="facts">
            <div><dt>Kerakli investitsiya</dt><dd class="amount amount--big">${fmtAmount(p.amount_usd)}</dd></div>
            ${p.published_at ? html`<div><dt>E’lon qilingan</dt><dd class="mono">${fmtDate(p.published_at)}</dd></div>` : ''}
          </dl>
          ${canSave || canContact ? html`<div class="doc__actions">
            ${canContact ? html`<a class="btn btn--primary doc__cta" href="#boglanish" data-action="goto-contact">Tadbirkor bilan bog‘lanish</a>` : ''}
            ${canSave ? html`<button type="button" class="star star--text" data-save="${p.id}" data-name="${p.name}" aria-pressed="${String(state.savedIds.has(p.id))}">${STAR}<span data-savetext>${state.savedIds.has(p.id) ? 'Saqlangan' : 'Saqlash'}</span></button>` : ''}
          </div>` : ''}
        </header>
        <section class="doc__sec" aria-labelledby="s1">
          <h2 id="s1">1. Biznes haqida</h2>
          <p class="lede">${p.summary}</p>
          ${paras(p.description)}
          ${p.image ? html`<figure class="photo"><img src="${p.image}" alt="${p.name} — tadbirkor yuklagan rasm" loading="lazy" decoding="async"></figure>` : ''}
        </section>
        <section class="doc__sec" aria-labelledby="s2">
          <h2 id="s2">2. Mablag‘dan foydalanish</h2>
          ${fundsBlock(p.use_of_funds || '')}
        </section>
        <section class="doc__sec" aria-labelledby="s3">
          <h2 id="s3">3. Hamkorlik sharti</h2>
          ${p.terms ? paras(p.terms) : html`<p class="muted">Ko‘rsatilmagan.</p>`}
        </section>
        <section class="doc__sec doc__sec--contact" id="boglanish" aria-labelledby="s4">
          <h2 id="s4">4. Bog‘lanish</h2>
          <p class="privacy">Tadbirkorning aloqa ma’lumotlari ochiq ko‘rsatilmaydi. Xabaringiz va aloqa ma’lumotingiz faqat loyiha egasiga yuboriladi.</p>
          <div data-contact>${contactBlock(p, myReq)}</div>
        </section>
      </article>
      ${canContact ? html`<div class="stickycta">
        <a class="btn btn--primary btn--wide" href="#boglanish" data-action="goto-contact">Tadbirkor bilan bog‘lanish</a>
      </div>` : ''}`);
    document.body.toggleAttribute('data-cta', canContact);
  }

  async function submitContact(form) {
    const id = Number(form.dataset.id);
    const message = form.message.value.trim();
    const contact = form.contact.value.trim();
    const errors = {};
    if (message.length < 10) errors.message = 'Xabar kamida 10 ta belgidan iborat bo‘lsin.';
    if (contact.length < 5) errors.contact = 'Javob olish uchun telefon, email yoki Telegram manzilini yozing.';
    if (Object.keys(errors).length) return showErrors(form, errors);
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      await api('POST', `/api/projects/${id}/requests`, { message, contact });
      const box = main.querySelector('[data-contact]');
      box.innerHTML = toStr(html`<div class="confirm" tabindex="-1">
        <p><strong>So‘rovingiz yuborildi.</strong> Holati: ${statusTag('req', 'pending')}</p>
        <p>Tadbirkor so‘rovni qabul qilsa yoki rad etsa, natija <a href="/kabinet">kabinetingizda</a> ko‘rinadi.</p>
      </div>`);
      box.querySelector('.confirm').focus();
    } catch (e) {
      btn.disabled = false;
      if (e.status === 401) { location.href = loginUrl(`/loyihalar/${id}#boglanish`); return; }
      showErrors(form, e.errors, e.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Kirish va ro'yxatdan o'tish                                       */
  /* ---------------------------------------------------------------- */
  async function afterLogin(user, next) {
    state.user = user;
    await loadSaved();
    const pending = Number(sessionStorage.getItem('pendingSave'));
    sessionStorage.removeItem('pendingSave');
    if (pending && !state.savedIds.has(pending)) {
      try { await api('PUT', `/api/saved/${pending}`); state.savedIds.add(pending); toast('Loyiha saqlandi.'); } catch { /* e'lon yopilgan bo'lishi mumkin */ }
    }
    navigate(safeNext(next) || '/kabinet', { replace: true });
  }

  function alreadyIn() {
    return html`<div class="narrow wrap">
      <h1>Siz akkauntga kirgansiz</h1>
      <p>${state.user.name} · ${state.user.role === 'tadbirkor' ? 'tadbirkor' : 'investor'} akkaunti.</p>
      <p class="actions"><a class="btn btn--primary" href="/kabinet">Kabinetga o‘tish</a>
      <button type="button" class="btn" data-action="logout">Chiqish</button></p>
    </div>`;
  }

  function viewLogin(u) {
    const next = safeNext(u.searchParams.get('next'));
    if (state.user) return setPage('Kirish', alreadyIn());
    setPage('Kirish', html`<div class="narrow wrap">
      <h1>Kirish</h1>
      <form class="form" data-form="login" novalidate>
        <div class="error-summary" tabindex="-1" role="alert" hidden></div>
        ${field({ id: 'l-email', name: 'email', label: 'Email', type: 'email', attrs: 'autocomplete="email" required' })}
        ${field({ id: 'l-password', name: 'password', label: 'Parol', type: 'password', attrs: 'autocomplete="current-password" required' })}
        <input type="hidden" name="next" value="${next || ''}">
        <button type="submit" class="btn btn--primary btn--wide">Kirish</button>
      </form>
      <p class="aside">Akkauntingiz yo‘qmi? <a href="${registerUrl(null, next)}">Ro‘yxatdan o‘ting</a></p>
    </div>`);
  }

  function viewRegister(u) {
    const next = safeNext(u.searchParams.get('next'));
    const role = u.searchParams.get('rol');
    if (state.user) return setPage('Ro‘yxatdan o‘tish', alreadyIn());
    const r = (val, title, desc) => html`<label class="choice choice--card">
      <input type="radio" name="role" value="${val}" ${role === val ? raw('checked') : ''}>
      <span><strong>${title}</strong><br><span class="muted">${desc}</span></span></label>`;
    setPage('Ro‘yxatdan o‘tish', html`<div class="narrow wrap">
      <h1>Ro‘yxatdan o‘tish</h1>
      <form class="form" data-form="register" novalidate>
        <div class="error-summary" tabindex="-1" role="alert" hidden></div>
        <fieldset class="field" data-field="role">
          <legend>Akkaunt turi <span class="req">majburiy</span></legend>
          <div class="choices">
            ${r('tadbirkor', 'Tadbirkorman', 'Biznes loyihamni joylab, investor izlayman.')}
            ${r('investor', 'Investorman', 'Loyihalarni ko‘rib, tadbirkorlar bilan bog‘lanaman.')}
          </div>
        </fieldset>
        ${field({ id: 'r-name', name: 'name', label: 'Ismingiz', required: true, hint: 'So‘rov yuborganingizda tadbirkor shu ismni ko‘radi.', attrs: 'autocomplete="name" maxlength="60"' })}
        ${field({ id: 'r-email', name: 'email', label: 'Email', type: 'email', required: true, hint: 'Kirish uchun ishlatiladi va ochiq ko‘rsatilmaydi.', attrs: 'autocomplete="email" maxlength="120"' })}
        ${field({ id: 'r-password', name: 'password', label: 'Parol', type: 'password', required: true, hint: 'Kamida 8 ta belgi.', attrs: 'autocomplete="new-password" minlength="8"' })}
        <input type="hidden" name="next" value="${next || ''}">
        <button type="submit" class="btn btn--primary btn--wide">Akkaunt yaratish</button>
      </form>
      <p class="aside">Akkauntingiz bormi? <a href="${loginUrl(next || '/kabinet')}">Kirish</a></p>
    </div>`);
  }

  async function submitAuth(form, kind) {
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    const errors = {};
    if (kind === 'register') {
      if (!body.role) errors.role = 'Akkaunt turini tanlang.';
      if ((body.name || '').trim().length < 2) errors.name = 'Ismingizni kiriting.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((body.email || '').trim())) errors.email = 'To‘g‘ri email manzil kiriting, masalan: ism@pochta.uz';
      if ((body.password || '').length < 8) errors.password = 'Parol kamida 8 ta belgidan iborat bo‘lsin.';
    } else {
      if (!(body.email || '').trim()) errors.email = 'Emailni kiriting.';
      if (!body.password) errors.password = 'Parolni kiriting.';
    }
    if (Object.keys(errors).length) return showErrors(form, errors);
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const r = await api('POST', kind === 'register' ? '/api/auth/register' : '/api/auth/login', body);
      toast(kind === 'register' ? 'Akkaunt yaratildi.' : `Xush kelibsiz, ${r.user.name}.`);
      await afterLogin(r.user, body.next);
    } catch (e) {
      btn.disabled = false;
      showErrors(form, e.errors, e.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Kabinet                                                           */
  /* ---------------------------------------------------------------- */
  function needLogin(title) {
    navigate(loginUrl(location.pathname), { replace: true });
    return title;
  }

  async function viewCabinet(_m, _u, token) {
    if (!state.user) return needLogin();
    const u = state.user;
    const head = html`<header class="cab-head">
      <h1>Kabinet</h1>
      <p class="muted">${u.name} · ${u.role === 'tadbirkor' ? 'Tadbirkor' : 'Investor'} akkaunti · ${u.email}</p>
      <p class="actions"><button type="button" class="btn btn--small" data-action="refresh">Yangilash</button>
      <button type="button" class="btn btn--small" data-action="logout">Chiqish</button></p>
    </header>`;
    if (u.role === 'tadbirkor') {
      const [mine, inc] = await Promise.all([api('GET', '/api/me/projects'), api('GET', '/api/me/requests/incoming')]);
      if (stale(token)) return;
      setPage('Kabinet', html`<div class="cabinet wrap">${head}
        <section class="cab-sec" aria-labelledby="my-projects">
          <div class="cab-sec__head">
            <h2 id="my-projects">Mening e’lonlarim</h2>
            <a class="btn btn--primary" href="/kabinet/yangi">Yangi loyiha joylash</a>
          </div>
          ${mine.items.length ? html`<table class="ltable">
            <thead><tr><th scope="col">Loyiha</th><th scope="col">Holat</th><th scope="col" class="num">Summa</th><th scope="col">Yangilangan</th><th scope="col">Amallar</th></tr></thead>
            <tbody>${mine.items.map((p) => html`<tr>
              <td data-label="Loyiha"><div class="cell"><a href="/loyihalar/${p.id}">${p.name || 'Nomsiz qoralama'}</a>${p.pending_requests ? html`<br><span class="muted">${p.pending_requests} ta yangi so‘rov</span>` : ''}</div></td>
              <td data-label="Holat"><div class="cell">${statusTag('proj', p.status)}</div></td>
              <td data-label="Summa" class="num"><div class="cell"><span class="amount">${fmtAmount(p.amount_usd)}</span></div></td>
              <td data-label="Yangilangan" class="mono"><div class="cell">${fmtDate(p.updated_at)}</div></td>
              <td data-label="Amallar"><div class="cell"><div class="rowactions">
                <a class="btn btn--small" href="/kabinet/loyiha/${p.id}" aria-label="Tahrirlash: ${p.name || 'Nomsiz qoralama'}">Tahrirlash</a>
                ${p.status !== 'published' ? html`<button type="button" class="btn btn--small" data-action="publish" data-id="${p.id}">${p.status === 'closed' ? 'Qayta nashr qilish' : 'Nashr qilish'}</button>` : ''}
                ${p.status === 'published' ? html`<button type="button" class="btn btn--small" data-action="close" data-id="${p.id}" data-name="${p.name}">E’lonni yopish</button>` : ''}
                ${p.status === 'draft' ? html`<button type="button" class="btn btn--small btn--danger" data-action="delete" data-id="${p.id}" data-name="${p.name || 'Nomsiz qoralama'}">O‘chirish</button>` : ''}
              </div></div></td>
            </tr>`)}</tbody></table>`
          : html`<div class="empty"><p>Hali e’lon joylamagansiz. Loyihangizni joylang: qoralama sifatida saqlab, keyin nashr qilishingiz mumkin.</p></div>`}
        </section>
        <section class="cab-sec" aria-labelledby="incoming">
          <h2 id="incoming">So‘rovlar</h2>
          <p class="muted">Investorlarning aloqa ma’lumotlari faqat sizga ko‘rinadi.</p>
          ${inc.items.length ? html`<table class="ltable">
            <thead><tr><th scope="col">Loyiha</th><th scope="col">Investor va xabar</th><th scope="col">Investor aloqasi</th><th scope="col">Sana</th><th scope="col">Holat</th><th scope="col">Amallar</th></tr></thead>
            <tbody>${inc.items.map((r) => html`<tr data-req="${r.id}">
              <td data-label="Loyiha"><div class="cell"><a href="/loyihalar/${r.project_id}">${r.project_name}</a></div></td>
              <td data-label="Investor va xabar"><div class="cell"><strong>${r.investor_name}</strong><p class="msg">${r.message}</p></div></td>
              <td data-label="Investor aloqasi" class="contact"><div class="cell">${r.contact}</div></td>
              <td data-label="Sana" class="mono"><div class="cell">${fmtDate(r.created_at)}</div></td>
              <td data-label="Holat" data-status><div class="cell">${statusTag('req', r.status)}</div></td>
              <td data-label="Amallar"><div class="cell"><div class="rowactions" data-decide>${r.status === 'pending' ? html`
                <button type="button" class="btn btn--small btn--primary" data-action="accept" data-id="${r.id}">Qabul qilish</button>
                <button type="button" class="btn btn--small" data-action="reject" data-id="${r.id}">Rad etish</button>` : html`<span class="muted">${fmtDate(r.decided_at)}</span>`}
              </div></div></td>
            </tr>`)}</tbody></table>`
          : html`<div class="empty"><p>Hozircha so‘rov kelmagan. So‘rovlar faqat nashr qilingan e’lonlaringizga keladi.</p></div>`}
        </section>
      </div>`);
    } else {
      const [out] = await Promise.all([api('GET', '/api/me/requests/outgoing'), loadSaved()]);
      if (stale(token)) return;
      const explain = { pending: 'Tadbirkor hali javob bermagan.', accepted: 'Tadbirkor siz qoldirgan aloqa ma’lumoti orqali bog‘lanadi.', rejected: 'Tadbirkor bu so‘rovni rad etdi.' };
      setPage('Kabinet', html`<div class="cabinet wrap">${head}
        <section class="cab-sec" aria-labelledby="outgoing">
          <h2 id="outgoing">Mening so‘rovlarim</h2>
          ${out.items.length ? html`<table class="ltable">
            <thead><tr><th scope="col">Loyiha</th><th scope="col">Xabarim</th><th scope="col">Yuborilgan</th><th scope="col">Holat</th></tr></thead>
            <tbody>${out.items.map((r) => html`<tr>
              <td data-label="Loyiha"><div class="cell"><a href="/loyihalar/${r.project_id}">${r.project_name}</a>${r.project_status === 'closed' ? html`<br><span class="muted">E’lon yopilgan</span>` : ''}</div></td>
              <td data-label="Xabarim"><div class="cell"><p class="msg">${r.message}</p></div></td>
              <td data-label="Yuborilgan" class="mono"><div class="cell">${fmtDate(r.created_at)}</div></td>
              <td data-label="Holat"><div class="cell">${statusTag('req', r.status)}<p class="muted small">${explain[r.status]}</p></div></td>
            </tr>`)}</tbody></table>`
          : html`<div class="empty"><p>Hali so‘rov yubormagansiz. Loyiha sahifasidagi “Tadbirkor bilan bog‘lanish” tugmasi orqali so‘rov yuboring.</p><a class="btn" href="/loyihalar">Loyihalarni ko‘rish</a></div>`}
        </section>
        <section class="cab-sec" aria-labelledby="saved-h">
          <h2 id="saved-h">Saqlangan loyihalar</h2>
          <p>${state.savedIds.size ? `${state.savedIds.size} ta loyiha saqlangan.` : 'Hali saqlangan loyiha yo‘q.'}</p>
          <a class="btn" href="/loyihalar?saqlangan=1">Saqlanganlarni reestrda solishtirish</a>
        </section>
      </div>`);
    }
  }

  async function projectAction(btn, action) {
    const id = Number(btn.dataset.id);
    if (action === 'close' && !confirm(`“${btn.dataset.name}” e’lonini yopasizmi? U ochiq reestrdan olib tashlanadi.`)) return;
    if (action === 'delete' && !confirm(`“${btn.dataset.name}” qoralamasini o‘chirasizmi? Bu amalni qaytarib bo‘lmaydi.`)) return;
    btn.disabled = true;
    try {
      if (action === 'delete') await api('DELETE', `/api/projects/${id}`);
      else await api('POST', `/api/projects/${id}/${action}`);
      toast({ publish: 'E’lon nashr qilindi.', close: 'E’lon yopildi.', delete: 'Qoralama o‘chirildi.' }[action]);
      await render({ focus: false });
      const h = document.getElementById('my-projects');
      focusEl(h);
    } catch (e) {
      btn.disabled = false;
      if (e.status === 422) {
        toast('Nashr qilish uchun barcha majburiy maydonlarni to‘ldiring.');
        navigate(`/kabinet/loyiha/${id}?nashr=1`);
      } else toast(e.message);
    }
  }

  async function decideRequest(btn, action) {
    const id = Number(btn.dataset.id);
    const row = btn.closest('tr');
    row.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    try {
      const r = await api('POST', `/api/requests/${id}/${action}`);
      row.querySelector('[data-status]').innerHTML = toStr(statusTag('req', r.request.status));
      const dec = row.querySelector('[data-decide]');
      dec.innerHTML = '<span class="muted">Hozirgina</span>';
      toast(r.request.status === 'accepted' ? 'So‘rov qabul qilindi. Investor natijani o‘z kabinetida ko‘radi.' : 'So‘rov rad etildi.');
      focusEl(row.querySelector('[data-status]'));
    } catch (e) {
      row.querySelectorAll('button').forEach((b) => { b.disabled = false; });
      toast(e.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Loyiha formasi (yangi / tahrirlash)                                */
  /* ---------------------------------------------------------------- */
  let formState = null;

  async function viewProjectForm(id, _u, token) {
    if (!state.user) return needLogin();
    if (state.user.role !== 'tadbirkor') {
      return setPage('Ruxsat yo‘q', html`<div class="narrow wrap">
        <h1>Loyiha joylash tadbirkor akkaunti uchun</h1>
        <p>Siz investor akkauntidasiz. Biznesingizga investor topish uchun tadbirkor sifatida alohida akkaunt oching.</p>
        <p class="actions"><button type="button" class="btn btn--primary" data-action="logout-register">Chiqib, tadbirkor akkauntini ochish</button>
        <a class="btn" href="/loyihalar">Loyihalarni ko‘rish</a></p>
      </div>`);
    }
    let p = { status: 'draft', name: '', sector: '', region: '', stage: '', summary: '', description: '', amount_usd: '', use_of_funds: '', terms: '', image: null };
    if (id) {
      try {
        const d = await api('GET', `/api/projects/${id}`);
        if (!d.project.is_own) return viewNotFound();
        p = d.project;
      } catch (e) {
        if (e.status === 404) return viewNotFound('Loyiha topilmadi', 'Bu e’lon mavjud emas yoki sizga tegishli emas.');
        throw e;
      }
    }
    if (stale(token)) return;
    document.body.dataset.page = 'form';
    formState = { id, status: p.status, pendingImage: null, removeImage: false, image: p.image };
    const isPub = p.status === 'published';
    const req = 'nashr uchun majburiy';
    setPage(id ? 'E’lonni tahrirlash' : 'Yangi loyiha', html`<div class="pform wrap">
      <p class="crumbs"><a href="/kabinet">Kabinetga qaytish</a></p>
      <h1>${id ? 'E’lonni tahrirlash' : 'Yangi loyiha'}</h1>
      <p class="muted">Holati: ${statusTag('proj', p.status)} <span data-savedat></span></p>
      <nav aria-label="Forma bo‘limlari"><ol class="steps">
        <li><a href="#f1">1. Asosiy</a></li><li><a href="#f2">2. Biznes haqida</a></li><li><a href="#f3">3. Investitsiya</a></li><li><a href="#f4">4. Hamkorlik</a></li>
      </ol></nav>
      <p class="hint">Qoralamani istalgan paytda, maydonlar to‘liq bo‘lmasa ham saqlash mumkin. Nashr qilish uchun barcha majburiy maydonlar to‘ldirilishi kerak.</p>
      <form class="form" data-form="project" novalidate>
        <div class="error-summary" tabindex="-1" role="alert" hidden></div>
        <section class="pform__sec" id="f1" aria-labelledby="f1h">
          <h2 id="f1h">1. Asosiy ma’lumot</h2>
          ${field({ id: 'p-name', name: 'name', label: 'Biznes nomi', value: p.name, required: req, attrs: 'maxlength="80"' })}
          ${field({ id: 'p-sector', name: 'sector', label: 'Soha', type: 'select', options: TAX.sectors, value: p.sector || '', required: req })}
          ${field({ id: 'p-region', name: 'region', label: 'Hudud', type: 'select', options: TAX.regions, value: p.region || '', required: req })}
          ${field({ id: 'p-stage', name: 'stage', label: 'Loyiha bosqichi', type: 'select', options: TAX.stages, value: p.stage || '', required: req })}
        </section>
        <section class="pform__sec" id="f2" aria-labelledby="f2h">
          <h2 id="f2h">2. Biznes haqida</h2>
          ${field({ id: 'p-summary', name: 'summary', label: 'Qisqa tavsif', type: 'textarea', rows: 3, value: p.summary, required: req,
            hint: 'Biznes nima qiladi — bir-ikki jumlada (20–160 ta belgi). Bu matn reestr qatorida ko‘rinadi.', attrs: 'maxlength="160"' })}
          ${field({ id: 'p-description', name: 'description', label: 'Batafsil tavsif', type: 'textarea', rows: 7, value: p.description, required: 'ixtiyoriy',
            hint: 'Mahsulot yoki xizmat, mijozlar, hozirgi holat. Xatboshilarni bo‘sh qator bilan ajrating.', attrs: 'maxlength="4000"' })}
          <div class="field" data-field="image">
            <label for="p-image">Rasm <span class="req">ixtiyoriy</span></label>
            <p class="hint" id="p-image-hint">JPG, PNG yoki WebP. Rasm faqat loyiha sahifasida ko‘rsatiladi, reestrda emas. Yuklashdan oldin hajmi avtomatik kichraytiriladi.</p>
            <div class="imgbox" data-imgbox>${p.image ? html`<img src="${p.image}" alt="Joriy rasm">` : ''}</div>
            <div class="file">
              <input id="p-image" class="file__input" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="p-image-hint p-image-name">
              <label for="p-image" class="btn btn--small file__btn">Rasm tanlash</label>
              <span class="file__name" id="p-image-name" data-filename>${p.image ? 'Joriy rasm yuklangan' : 'Fayl tanlanmagan'}</span>
            </div>
            <button type="button" class="linkbtn" data-action="remove-image" ${p.image ? '' : raw('hidden')}>Rasmni olib tashlash</button>
          </div>
        </section>
        <section class="pform__sec" id="f3" aria-labelledby="f3h">
          <h2 id="f3h">3. Investitsiya</h2>
          ${field({ id: 'p-amount', name: 'amount_usd', label: 'Kerakli investitsiya miqdori, USD', value: p.amount_usd == null ? '' : String(p.amount_usd), required: req,
            hint: 'Butun son, masalan: 40000', attrs: 'inputmode="numeric" autocomplete="off" maxlength="12"' })}
          ${field({ id: 'p-use', name: 'use_of_funds', label: 'Mablag‘ nimaga ishlatiladi', type: 'textarea', rows: 5, value: p.use_of_funds, required: req,
            hint: 'Har bir bandni yangi qatordan yozing. Foiz ko‘rsatsangiz, sahifada jadval bo‘lib chiqadi: “Uskunalar — 60%”.', attrs: 'maxlength="2000"' })}
        </section>
        <section class="pform__sec" id="f4" aria-labelledby="f4h">
          <h2 id="f4h">4. Hamkorlik shartlari</h2>
          ${field({ id: 'p-terms', name: 'terms', label: 'Taklif qilinayotgan hamkorlik shartlari', type: 'textarea', rows: 5, value: p.terms, required: req,
            hint: 'Masalan: ulush, qarz, daromaddan ulush, muddatlar va investorning ishtiroki.', attrs: 'maxlength="2000"' })}
        </section>
        <div class="formbar">
          <div class="formbar__in">
            ${isPub
              ? html`<button type="submit" class="btn btn--primary" value="save">O‘zgarishlarni saqlash</button>`
              : html`<button type="submit" class="btn" value="draft">Qoralamani saqlash</button>
                     <button type="submit" class="btn btn--primary" value="publish">${p.status === 'closed' ? 'Qayta nashr qilish' : 'Nashr qilish'}</button>`}
          </div>
        </div>
      </form>
    </div>`);
  }

  async function prepareImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Faqat JPG, PNG yoki WebP rasm tanlang.');
    let bmp;
    try { bmp = await createImageBitmap(file); } catch { throw new Error('Rasmni o‘qib bo‘lmadi.'); }
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    if (!blob) throw new Error('Rasmni tayyorlab bo‘lmadi.');
    if (blob.size > 3 * 1024 * 1024) throw new Error('Rasm hajmi juda katta (3 MB dan oshmasin).');
    return blob;
  }

  async function onImageChange(input) {
    const form = input.form;
    const wrap = form.querySelector('[data-field="image"]');
    wrap.querySelectorAll('.field-error').forEach((e) => e.remove());
    input.removeAttribute('aria-invalid');
    const file = input.files[0];
    const nameEl = form.querySelector('[data-filename]');
    if (!file) return;
    nameEl.textContent = file.name;
    try {
      const blob = await prepareImage(file);
      formState.pendingImage = blob;
      formState.removeImage = false;
      const box = form.querySelector('[data-imgbox]');
      box.innerHTML = '';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.alt = 'Tanlangan rasm (saqlanganda yuklanadi)';
      box.appendChild(img);
      form.querySelector('[data-action="remove-image"]').hidden = false;
    } catch (e) {
      input.value = '';
      nameEl.textContent = formState.image && !formState.removeImage ? 'Joriy rasm yuklangan' : 'Fayl tanlanmagan';
      showErrors(form, { image: e.message });
    }
  }

  async function submitProject(form, action) {
    const fd = new FormData(form);
    const body = {};
    for (const k of ['name', 'sector', 'region', 'stage', 'summary', 'description', 'amount_usd', 'use_of_funds', 'terms']) body[k] = String(fd.get(k) || '');
    body.amount_usd = body.amount_usd.replace(/[\s ]/g, '');
    body.action = action;
    const buttons = form.querySelectorAll('.formbar button');
    buttons.forEach((b) => { b.disabled = true; });
    try {
      const r = formState.id
        ? await api('PUT', `/api/projects/${formState.id}`, body)
        : await api('POST', '/api/projects', body);
      const id = r.project.id;
      formState.id = id;
      if (formState.pendingImage) {
        try {
          await api('PUT', `/api/projects/${id}/image`, formState.pendingImage, { type: 'image/jpeg' });
          formState.pendingImage = null;
        } catch (e) { toast(`E’lon saqlandi, lekin rasm yuklanmadi: ${e.message}`); }
      } else if (formState.removeImage) {
        await api('DELETE', `/api/projects/${id}/image`);
        formState.removeImage = false;
      }
      if (action === 'publish') {
        toast('E’lon nashr qilindi va reestrda ko‘rinadi.');
        navigate('/kabinet');
        return;
      }
      if (location.pathname !== `/kabinet/loyiha/${id}`) history.replaceState(null, '', `/kabinet/loyiha/${id}`);
      clearErrors(form);
      const now = new Date();
      const at = form.ownerDocument.querySelector('[data-savedat]');
      if (at) at.textContent = `· saqlandi ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      toast(action === 'draft' ? 'Qoralama saqlandi. U reestrda ko‘rinmaydi.' : 'O‘zgarishlar saqlandi.');
    } catch (e) {
      showErrors(form, e.errors, e.status === 422 && action === 'publish' ? 'Nashr qilish uchun quyidagilarni to‘g‘rilang' : e.message);
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Xato sahifalari                                                   */
  /* ---------------------------------------------------------------- */
  function viewNotFound(title = 'Sahifa topilmadi', text = 'Bunday sahifa mavjud emas yoki o‘chirilgan.') {
    setPage(title, html`<div class="narrow wrap"><h1>${title}</h1><p>${text}</p><p><a class="btn" href="/">Bosh sahifaga qaytish</a></p></div>`);
  }
  function viewError(e) {
    if (e && e.status === 401) { navigate(loginUrl(location.pathname), { replace: true }); return; }
    if (e && e.status === 403) {
      setPage('Ruxsat yo‘q', html`<div class="narrow wrap"><h1>Ruxsat yo‘q</h1><p>${e.message}</p><p><a class="btn" href="/">Bosh sahifaga qaytish</a></p></div>`);
      return;
    }
    setPage('Xato', html`<div class="narrow wrap"><h1>Sahifani yuklab bo‘lmadi</h1><p>${(e && e.message) || 'Noma’lum xato.'}</p>
      <p><button type="button" class="btn" data-action="refresh">Qayta urinish</button></p></div>`);
  }

  /* ---------------------------------------------------------------- */
  /* Hodisalar                                                         */
  /* ---------------------------------------------------------------- */
  async function logout() {
    try { await api('POST', '/api/auth/logout'); } catch { /* baribir chiqamiz */ }
    state.user = null;
    state.savedIds = new Set();
    toast('Akkauntdan chiqdingiz.');
  }

  document.addEventListener('click', async (e) => {
    const t = e.target;
    const actionEl = t.closest('[data-action]');
    const action = actionEl && actionEl.dataset.action;

    if (action === 'find-investor') {
      e.preventDefault();
      if (document.querySelector('dialog[open]')) document.querySelector('dialog[open]').close();
      return navigate(findInvestorUrl());
    }
    const focusLink = t.closest('[data-focus]');
    if (focusLink) {
      e.preventDefault();
      const el = document.querySelector(focusLink.dataset.focus);
      if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); }
      return;
    }
    const save = t.closest('[data-save]');
    if (save) {
      e.preventDefault();
      const row = save.closest('tr');
      const name = save.dataset.name || (row && row.querySelector('.row__link') ? row.querySelector('.row__link').textContent : 'Loyiha');
      return toggleSave(save, Number(save.dataset.save), name);
    }
    if (action) {
      switch (action) {
        case 'toggle-search': {
          const bar = document.getElementById('searchbar');
          bar.hidden = !bar.hidden;
          actionEl.setAttribute('aria-expanded', String(!bar.hidden));
          if (!bar.hidden) document.getElementById('search-input').focus();
          return;
        }
        case 'toggle-saved':
          if (!state.user) { promptLogin('Saqlanganlarni ko‘rish uchun akkauntga kiring'); return; }
          return applyFilters({ ...cat.filters, saqlangan: cat.filters.saqlangan ? '' : '1' });
        case 'clear-filters': {
          const r = applyFilters({});
          const si = document.getElementById('search-input');
          if (si) si.value = '';
          return r;
        }
        case 'more': return loadCatalog(true, renderToken);
        case 'retry': return loadCatalog(false, renderToken);
        case 'refresh': return render();
        case 'goto-contact': {
          e.preventDefault();
          const sec = document.getElementById('boglanish');
          sec.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
          const first = sec.querySelector('textarea, input, a.btn, .note');
          focusEl(first || sec.querySelector('h2'));
          return;
        }
        case 'logout':
          await logout();
          return navigate('/');
        case 'logout-register':
          await logout();
          return navigate(registerUrl('tadbirkor', '/kabinet/yangi'));
        case 'publish': case 'close': case 'delete':
          return projectAction(actionEl, action);
        case 'accept': case 'reject':
          return decideRequest(actionEl, action);
        case 'remove-image': {
          formState.pendingImage = null;
          formState.removeImage = !!formState.image;
          const form = actionEl.closest('form');
          form.querySelector('[data-imgbox]').innerHTML = '';
          form.querySelector('#p-image').value = '';
          form.querySelector('[data-filename]').textContent = 'Fayl tanlanmagan';
          actionEl.hidden = true;
          toast('Rasm saqlanganda olib tashlanadi.');
          form.querySelector('#p-image').focus();
          return;
        }
        default:
      }
    }
    const sheetBtn = t.closest('[data-sheet]');
    if (sheetBtn) return openFilterSheet(sheetBtn.dataset.sheet);
    const sortBtn = t.closest('[data-sortby]');
    if (sortBtn && cat) {
      const cur = cat.filters.tartib || 'yangi';
      let next;
      if (sortBtn.dataset.sortby === 'nom') next = cur === 'nom' ? '' : 'nom';
      else next = cur === 'summa-kamayish' ? 'summa-osish' : 'summa-kamayish';
      return applyFilters({ ...cat.filters, tartib: next });
    }

    // Ichki havolalar: sahifani qayta yuklamasdan
    const a = t.closest('a[href]');
    if (a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target && !a.hasAttribute('download')) {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) return; // sahifa ichidagi langar
      const url = new URL(a.href);
      if (url.origin === location.origin && !url.pathname.startsWith('/uploads/') && !url.pathname.startsWith('/fonts/')) {
        e.preventDefault();
        if (a.closest('dialog')) a.closest('dialog').close();
        return navigate(url.pathname + url.search + url.hash);
      }
      return;
    }
    // Butun reestr qatorini bosish
    const row = t.closest('tr[data-href]');
    if (row && !t.closest('button, a, input, select')) {
      if (window.getSelection && String(window.getSelection())) return;
      navigate(row.dataset.href);
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-filter]') && cat) applyFilters({ ...cat.filters, [t.dataset.filter]: t.value });
    if (t.id === 'p-image') onImageChange(t);
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.id === 'searchbar') {
      e.preventDefault();
      const q = form.q.value.trim();
      const base = cat ? { ...cat.filters } : {};
      if (q) base.q = q; else delete base.q;
      const qs = filtersQuery(base);
      if (cat && !cat.isHome && location.pathname === '/loyihalar') { applyFilters(base); return; }
      navigate(`/loyihalar${qs ? '?' + qs : ''}`);
      return;
    }
    const kind = form.dataset.form;
    if (!kind) return;
    e.preventDefault();
    if (kind === 'contact') submitContact(form);
    else if (kind === 'login' || kind === 'register') submitAuth(form, kind);
    else if (kind === 'project') submitProject(form, (e.submitter && e.submitter.value) || 'draft');
  });

  // Klaviatura: reestr qatoridagi havola Enter bilan ochiladi (standart). Esc qidiruvni yopadi.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
      const bar = document.getElementById('searchbar');
      if (!bar.hidden && bar.contains(document.activeElement)) {
        bar.hidden = true;
        const b = document.querySelector('[data-action="toggle-search"]');
        b.setAttribute('aria-expanded', 'false');
        b.focus();
      }
    }
  });

  /* ---------------------------------------------------------------- */
  /* Ishga tushirish                                                   */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-brand]').forEach((b) => { b.textContent = NAME; });
  loadSaved().then(() => render({ focus: false }));
})();
