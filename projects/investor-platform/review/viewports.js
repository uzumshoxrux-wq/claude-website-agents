// Raund 1: viewport, maket, konsol/tarmoq, touch nishonlari, axe-core.
// NODE_PATH=/opt/node22/lib/node_modules AXE=<axe.min.js yo'li> node review/viewports.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SHOTS = path.join(__dirname, 'screenshots');
const AXE = fs.readFileSync(process.env.AXE, 'utf8');

const VPS = [
  { key: 'm360', viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { key: 'm390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { key: 't768', viewport: { width: 768, height: 1024 }, hasTouch: true },
  { key: 'd1280', viewport: { width: 1280, height: 800 } },
  { key: 'd1920', viewport: { width: 1920, height: 1080 } },
];

const out = { pages: [], axe: {}, extra: {} };

async function apiReg(page, role) {
  return page.evaluate(async (role) => {
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
      body: JSON.stringify({ role, name: role === 'investor' ? 'Viewport Investor' : 'Viewport Tadbirkor', email: `${role}-vp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@sinov.uz`, password: 'parol12345' }) });
    return r.status;
  }, role);
}

async function audit(page, vp, name) {
  await page.waitForTimeout(400);
  const r = await page.evaluate(({ mobile }) => {
    const de = document.documentElement;
    const overflow = de.scrollWidth - window.innerWidth;
    const small = [];
    if (mobile) {
      document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], summary').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[hidden]') || el.closest('.sr-only') || el.classList.contains('skip')) return;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) return;
        if (el.type === 'radio' || el.type === 'checkbox') return; // label maydoni alohida tekshiriladi
        if (b.width < 44 || b.height < 44) {
          // inline matn havolasi (paragraf ichida) WCAG 2.5.8 istisnosi
          const inline = el.tagName === 'A' && cs.display === 'inline' && el.parentElement && /^(P|LI|SPAN|DD)$/.test(el.parentElement.tagName);
          small.push({ tag: el.tagName, text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height), inline });
        }
      });
    }
    // kesilgan matnlar (ellipsis) va kichik shriftlar
    const ell = [];
    document.querySelectorAll('main *').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) ell.push(el.className + ': ' + el.textContent.trim().slice(0, 60));
    });
    const fontsSmall = new Set();
    document.querySelectorAll('main *').forEach((el) => {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      if (el.closest('.sr-only')) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 14) fontsSmall.add(`${el.tagName}.${el.className} ${fs}px "${el.textContent.trim().slice(0, 30)}"`);
    });
    const families = new Set();
    document.querySelectorAll('body *').forEach((el) => families.add(getComputedStyle(el).fontFamily.split(',')[0].trim()));
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName + ':' + h.textContent.trim().slice(0, 40));
    const imgsNoAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
    const brokenImgs = [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
    return { overflow, small, ell, fontsSmall: [...fontsSmall].slice(0, 15), families: [...families], heads, imgsNoAlt, brokenImgs, fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`) };
  }, { mobile: !!vp.isMobile || vp.viewport.width < 800 });
  const file = `vp-${vp.key}-${name}.png`;
  await page.screenshot({ path: path.join(SHOTS, file), fullPage: true });
  return { vp: vp.key, page: name, file, ...r };
}

async function runAxe(page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(' ') + ' | ' + (n.failureSummary || '').split('\n').slice(1, 2).join('')) }));
  });
}

(async () => {
  const browser = await chromium.launch();
  // ochiq loyiha id (namuna) va tadbirkor ma'lumotlari
  const list = await (await fetch(`${BASE}/api/projects?limit=100`)).json();
  const sampleId = list.items.find((p) => p.is_sample).id;
  for (const vp of VPS) {
    const ctx = await browser.newContext({ bypassCSP: true, viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor || 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
    page.on('requestfailed', (r) => errs.push('failed ' + r.url()));
    page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/api/auth/me')) errs.push(`${r.status()} ${r.url()}`); });
    const visit = async (url, name, wait) => {
      errs.length = 0;
      const resp = await page.goto(BASE + url);
      if (wait) await page.waitForSelector(wait, { timeout: 6000 }).catch(() => {});
      const a = await audit(page, vp, name);
      a.status = resp.status(); a.errors = [...errs];
      out.pages.push(a);
      return a;
    };
    // mehmon sahifalari
    await visit('/', 'home', '.row');
    // birinchi ekranda nima ko'rinadi
    out.extra[`${vp.key}-firstscreen`] = await page.evaluate(() => {
      const vh = innerHeight;
      const segs = [...document.querySelectorAll('.segment__btn')].map((b) => b.getBoundingClientRect().bottom <= vh);
      const rows = [...document.querySelectorAll('tr.row')].filter((r) => r.getBoundingClientRect().bottom <= vh).length;
      const samples = [...document.querySelectorAll('tr.row .tag--sample')].filter((t) => t.offsetParent).length;
      const allRows = document.querySelectorAll('tr.row').length;
      const text = document.body.innerText;
      const statLike = text.match(/\d[\d\s]*\+|\$\s?\d|\d+\s?(ta )?(investor|foydalanuvchi|muvaffaqiyat)|jalb qilindi|mln|million/gi);
      return { segsVisible: segs, rowsFullyVisible: rows, samplesVisible: samples, allRows, statLike };
    });
    if (vp.key === 'm360') {
      await page.setViewportSize({ width: 360, height: 640 });
      out.extra['m360x640-firstscreen'] = await page.evaluate(() => ({ segs: [...document.querySelectorAll('.segment__btn')].every((b) => b.getBoundingClientRect().bottom <= 640), rows: [...document.querySelectorAll('tr.row')].filter((r) => r.getBoundingClientRect().bottom <= 640).length }));
      await page.screenshot({ path: path.join(SHOTS, 'vp-m360x640-home-firstscreen.png') });
      await page.setViewportSize(vp.viewport);
    }
    await visit('/loyihalar', 'catalog', '.row');
    await visit(`/loyihalar/${sampleId}`, 'project-sample', '.doc__title');
    await visit('/kirish', 'login', 'form[data-form]');
    await visit('/royxatdan-otish', 'register', 'form[data-form]');
    await visit('/yoq-sahifa', '404', 'main h1');
    if (vp.key === 'm360' || vp.key === 'd1280') {
      out.axe[`${vp.key}-home`] = await (async () => { await page.goto(BASE + '/'); await page.waitForSelector('.row'); return runAxe(page); })();
      out.axe[`${vp.key}-project`] = await (async () => { await page.goto(BASE + `/loyihalar/${sampleId}`); await page.waitForSelector('.doc__title'); return runAxe(page); })();
      out.axe[`${vp.key}-register`] = await (async () => { await page.goto(BASE + '/royxatdan-otish'); await page.waitForSelector('form[data-form]'); return runAxe(page); })();
    }
    // mobil: filtr sheet skrinshoti
    if (vp.viewport.width < 900) {
      await page.goto(BASE + '/'); await page.waitForSelector('.row');
      const sb = await page.$('[data-sheet="hudud"]');
      if (sb && await sb.isVisible()) {
        await sb.click(); await page.waitForSelector('dialog[open]');
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(SHOTS, `vp-${vp.key}-sheet-hudud.png`) });
        out.extra[`${vp.key}-sheet`] = await page.evaluate(() => { const d = document.querySelector('dialog[open]'); const b = d.getBoundingClientRect(); const labels = [...d.querySelectorAll('label.choice')].map((l) => Math.round(l.getBoundingClientRect().height)); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: innerHeight, minLabelH: Math.min(...labels), footVisible: d.querySelector('[data-apply]').getBoundingClientRect().bottom <= innerHeight }; });
        await page.keyboard.press('Escape');
      } else out.extra[`${vp.key}-sheet`] = 'sortbar ko‘rinmaydi';
      // sticky sortbar
      await page.evaluate(() => window.scrollTo(0, 600)); await page.waitForTimeout(200);
      out.extra[`${vp.key}-sticky-sortbar`] = await page.evaluate(() => { const s = document.querySelector('.sortbar'); return s ? Math.round(s.getBoundingClientRect().top) : null; });
      await page.screenshot({ path: path.join(SHOTS, `vp-${vp.key}-home-scrolled.png`) });
    }
    // investor sessiyasi
    await page.goto(BASE + '/');
    await apiReg(page, 'investor');
    await visit('/kabinet', 'cabinet-investor', '#outgoing');
    await visit('/loyihalar?saqlangan=1', 'catalog-saved-empty', '[data-count]');
    await page.evaluate(() => fetch('/api/auth/logout', { method: 'POST', headers: { 'X-Requested-With': 'fetch' } }));
    // tadbirkor sessiyasi
    await apiReg(page, 'tadbirkor');
    await visit('/kabinet/yangi', 'form-new', 'form[data-form="project"]');
    await visit('/kabinet', 'cabinet-entrepreneur', '#my-projects');
    if (vp.key === 'm360' || vp.key === 'd1280') {
      await page.goto(BASE + '/kabinet/yangi'); await page.waitForSelector('form[data-form="project"]');
      out.axe[`${vp.key}-form`] = await runAxe(page);
    }
    await ctx.close();
  }

  // Klaviatura: desktop
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/'); await page.waitForSelector('.row');
  const tabs = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    tabs.push(await page.evaluate(() => {
      const a = document.activeElement; const cs = getComputedStyle(a);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      return `${a.tagName}${a.id ? '#' + a.id : ''} "${(a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 30)}" ring=${ring}`;
    }));
    if (i === 3) await page.screenshot({ path: path.join(SHOTS, 'kbd-d1280-focus-4.png') });
  }
  out.extra.tabOrder = tabs;
  // klaviatura bilan tartiblash: Summa sarlavhasi
  await page.focus('button[data-sortby="summa"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const ariaSort1 = await page.getAttribute('[data-sortcol="summa"]', 'aria-sort');
  await page.focus('button[data-sortby="summa"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const ariaSort2 = await page.getAttribute('[data-sortcol="summa"]', 'aria-sort');
  const amounts = await page.$$eval('tr.row .amount', (a) => a.map((x) => Number(x.textContent.replace(/\D/g, ''))));
  out.extra.kbdSort = { ariaSort1, ariaSort2, amountsAsc: amounts, focusAfter: await page.evaluate(() => document.activeElement.outerHTML.slice(0, 80)) };
  // qatorni Enter bilan ochish
  await page.focus('tr.row .row__link'); await page.keyboard.press('Enter'); await page.waitForSelector('.doc__title');
  out.extra.kbdOpenRow = { url: page.url(), focus: await page.evaluate(() => document.activeElement.tagName) };
  await page.screenshot({ path: path.join(SHOTS, 'kbd-d1280-project-focus.png') });
  // filtr selectlarini klaviatura bilan
  await page.goto(BASE + '/loyihalar'); await page.waitForSelector('.row');
  await page.focus('#f-hudud'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(500);
  out.extra.kbdFilter = { url: page.url(), count: await page.textContent('[data-count]') };
  await page.screenshot({ path: path.join(SHOTS, 'kbd-d1280-filter.png') });
  // mobil sheet: Esc va fokus qaytishi
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  await mp.goto(BASE + '/'); await mp.waitForSelector('.row');
  await mp.focus('[data-sheet="soha"]'); await mp.keyboard.press('Enter'); await mp.waitForSelector('dialog[open]');
  const inDlg = await mp.evaluate(() => !!document.activeElement.closest('dialog'));
  await mp.keyboard.press('Escape'); await mp.waitForTimeout(300);
  out.extra.sheetEsc = { focusInDialog: inDlg, closed: !(await mp.$('dialog[open]')), focusBack: await mp.evaluate(() => document.activeElement.dataset.sheet || document.activeElement.tagName) };
  // mobil: namuna loyiha sahifasida sticky CTA
  await mp.goto(BASE + `/loyihalar/${sampleId}`); await mp.waitForSelector('.doc__title');
  const cta = await mp.$('.stickycta a');
  out.extra.sampleCta = { visible: cta ? await cta.isVisible() : false };
  if (cta) { await cta.click(); await mp.waitForTimeout(500); await mp.screenshot({ path: path.join(SHOTS, 'vp-m390-sample-cta-click.png') }); out.extra.sampleCta.focus = await mp.evaluate(() => document.activeElement.outerHTML.slice(0, 120)); }
  await mctx.close();
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'viewports.json'), JSON.stringify(out, null, 2));
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
