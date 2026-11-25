// Raund 2 (flow.js asosida): ikki akkaunt, ikki alohida brauzer konteksti bilan to'liq oqim.
// Ishga tushirish: NODE_PATH=/opt/node22/lib/node_modules node review/flow2.js <run> <entViewport> <invViewport> <decision>
// run: a | b ; viewport: m360 | m390 | d1280 ; decision: accept | reject
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SHOTS = path.join(__dirname, 'screenshots', 'round2');
const RUN = process.argv[2] || 'a';
const ENT_VP = process.argv[3] || 'm390';
const INV_VP = process.argv[4] || 'd1280';
const DECISION = process.argv[5] || 'accept';
fs.mkdirSync(SHOTS, { recursive: true });

const VP = {
  m360: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  m390: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  d1280: { viewport: { width: 1280, height: 800 } },
};
const isMob = (k) => k.startsWith('m');

const log = [];
const checks = [];
function step(who, msg) { log.push(`[${who}] ${msg}`); console.log(`[${who}] ${msg}`); }
function check(name, ok, detail = '') { checks.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`); }
const shot = async (page, name, full = true) => { const p = path.join(SHOTS, `flow-${RUN}-${name}.png`); await page.screenshot({ path: p, fullPage: full }); return p; };

function attach(page, who) {
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errs.push(`requestfailed: ${r.url()} ${r.failure() && r.failure().errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`); });
  page.on('request', (r) => { if (r.url().includes('/api/')) log.push(`[${who}] API ${r.method()} ${r.url().replace(BASE, '')}`); });
  page.on('dialog', (d) => { step(who, `confirm(): "${d.message()}" -> accept`); d.accept(); });
  return errs;
}

(async () => {
  const browser = await chromium.launch();
  const stamp = Date.now().toString(36);
  const ent = { email: `tadbirkor-${RUN}-${stamp}@sinov.uz`, name: `Tadbirkor ${RUN.toUpperCase()}`, pw: 'parol12345' };
  const inv = { email: `investor-${RUN}-${stamp}@sinov.uz`, name: `Investor ${RUN.toUpperCase()}`, pw: 'parol12345' };
  const projName = RUN === 'a' ? `Non sexi Chilonzor ${stamp}` : `Tikuv sexi Qarshi ${stamp}`;
  const sector = RUN === 'a' ? 'oziq-ovqat' : 'ishlab-chiqarish';
  const region = RUN === 'a' ? 'toshkent-sh' : 'qashqadaryo';
  const stage = 'ishlayotgan';
  const contact = RUN === 'a' ? '+998 90 111 22 33 (investor-maxfiy)' : '@investor_maxfiy_b';
  const message = 'Assalomu alaykum. Loyihangiz qiziqarli, shartlarni batafsil muhokama qilmoqchiman.';

  const ctxE = await browser.newContext({ ...VP[ENT_VP], locale: 'uz-UZ' });
  const ctxI = await browser.newContext({ ...VP[INV_VP], locale: 'uz-UZ' });
  const pe = await ctxE.newPage();
  const pi = await ctxI.newPage();
  const errE = attach(pe, 'T');
  const errI = attach(pi, 'I');
  let entSteps = 0; let invSteps = 0;
  const E = (m) => { entSteps++; step('T', m); };
  const I = (m) => { invSteps++; step('I', m); };

  // ---------------- 1. Tadbirkor: ro'yxatdan o'tish ----------------
  await pe.goto(BASE + '/');
  await pe.waitForSelector('.row');
  E('Bosh sahifa ochildi');
  await pe.click('a[data-action="find-investor"]');
  E('"Biznesimga investor topish" bosildi');
  await pe.waitForSelector('form[data-form="register"]');
  check(`${RUN}: find-investor -> ro'yxat sahifasi`, pe.url().includes('/royxatdan-otish'), pe.url());
  const roleChecked = await pe.$eval('input[name=role][value=tadbirkor]', (e) => e.checked);
  check(`${RUN}: tadbirkor roli oldindan tanlangan`, roleChecked);
  if (!roleChecked) await pe.check('input[name=role][value=tadbirkor]');
  // bo'sh forma validatsiyasi
  await pe.click('form[data-form="register"] button[type=submit]');
  await pe.waitForTimeout(300);
  const regErrs = await pe.$$eval('.field-error', (els) => els.map((e) => e.textContent.trim()));
  check(`${RUN}: ro'yxat bo'sh forma xatolari maydon yonida`, regErrs.length >= 2, JSON.stringify(regErrs));
  await shot(pe, 'T01-register-errors');
  await pe.fill('#r-name', ent.name);
  await pe.fill('#r-email', ent.email);
  await pe.fill('#r-password', ent.pw);
  await pe.click('form[data-form="register"] button[type=submit]');
  E('Ro\'yxat formasi to\'ldirildi va yuborildi');
  await pe.waitForSelector('form[data-form="project"]', { timeout: 8000 });
  check(`${RUN}: ro'yxatdan keyin yangi loyiha formasi`, pe.url().includes('/kabinet/yangi'), pe.url());
  await shot(pe, 'T02-new-form');

  // ---------------- 2. Qoralama ----------------
  await pe.fill('#p-name', projName);
  await pe.selectOption('#p-sector', sector);
  E('Qisman to\'ldirildi: nom + soha');
  await pe.click('button[value=draft]');
  E('"Qoralamani saqlash" bosildi');
  await pe.waitForFunction(() => /\/kabinet\/loyiha\/\d+/.test(location.pathname), null, { timeout: 8000 });
  const projId = Number(pe.url().match(/loyiha\/(\d+)/)[1]);
  check(`${RUN}: qoralama saqlandi, id=${projId}`, projId > 0);
  // mehmon katalogida yo'q
  const guestList1 = await (await fetch(`${BASE}/api/projects?limit=100`)).json();
  check(`${RUN}: qoralama ochiq katalog API da yo'q`, !guestList1.items.some((p) => p.id === projId));
  const guestDraft = await fetch(`${BASE}/api/projects/${projId}`);
  check(`${RUN}: qoralama /api/projects/:id mehmonga 404`, guestDraft.status === 404, String(guestDraft.status));

  // to'liq bo'lmagan holda nashr
  await pe.click('button[value=publish]');
  E('To\'liq bo\'lmagan qoralamada "Nashr qilish" bosildi');
  await pe.waitForSelector('.field-error', { timeout: 5000 }).catch(() => {});
  const pubErrs = await pe.$$eval('.field-error', (els) => els.map((e) => ({ t: e.textContent.trim(), field: (e.closest('[data-field]') || {}).dataset ? e.closest('[data-field]').dataset.field : null })));
  check(`${RUN}: nashr urinishida majburiy maydon xatolari maydon yonida`, pubErrs.length >= 5, JSON.stringify(pubErrs.map((e) => e.field)));
  const summaryVisible = await pe.$eval('.error-summary', (e) => !e.hidden).catch(() => false);
  check(`${RUN}: xato xulosasi ko'rinadi`, summaryVisible);
  await shot(pe, 'T03-publish-errors');

  // to'ldirish
  await pe.selectOption('#p-region', region);
  await pe.selectOption('#p-stage', stage);
  await pe.fill('#p-summary', RUN === 'a' ? 'Tandir non va patir yopib, Chilonzordagi do‘kon va kafelarga har kuni yetkazadi.' : 'Maktab formasi va ish kiyimlarini tikib, Qashqadaryo bozorlariga ulgurji sotadi.');
  await pe.fill('#p-description', 'Sex ikki yildan beri ishlaydi.\n\nYangi uskunalar bilan ishlab chiqarish ikki baravar oshadi.');
  await pe.fill('#p-amount', RUN === 'a' ? '35 000' : '120000');
  await pe.fill('#p-use', 'Uskunalar — 60%\nXomashyo — 25%\nTa’mirlash — 15%');
  await pe.fill('#p-terms', 'Investorga 15% ulush, foyda har chorakda taqsimlanadi.');
  E('Qolgan maydonlar to\'ldirildi');
  if (RUN === 'a') {
    // ixtiyoriy rasm: brauzerda yaratilgan PNG
    const png = await pe.screenshot({ clip: { x: 0, y: 0, width: 300, height: 200 } });
    const lbl = pe.locator('label.file__btn');
    check(`${RUN}: R-7 rasm tugmasi o'zbekcha`, (await lbl.innerText()).trim() === 'Rasm tanlash', await lbl.innerText());
    const lb = await lbl.boundingBox();
    check(`${RUN}: R-7 rasm tugmasi >=44px`, lb && lb.height >= 44, JSON.stringify(lb));
    check(`${RUN}: R-7 boshlang'ich holat "Fayl tanlanmagan"`, (await pe.textContent('[data-filename]')).trim() === 'Fayl tanlanmagan');
    const nativeVisible = await pe.$eval('#p-image', (i) => { const b = i.getBoundingClientRect(); return b.width > 2 && getComputedStyle(i).opacity !== '0'; });
    check(`${RUN}: R-7 brauzer standart file input ko'rinmaydi`, !nativeVisible);
    const [fc] = await Promise.all([pe.waitForEvent('filechooser', { timeout: 5000 }), lbl.click()]);
    await fc.setFiles({ name: 'sex.png', mimeType: 'image/png', buffer: png });
    await pe.waitForSelector('[data-imgbox] img', { timeout: 5000 });
    E('"Rasm tanlash" bosildi, fayl tanlandi (preview chiqdi)');
    check(`${RUN}: R-7 tanlangan fayl nomi ko'rinadi`, (await pe.textContent('[data-filename]')).trim() === 'sex.png', await pe.textContent('[data-filename]'));
    await pe.locator('.file').scrollIntoViewIfNeeded();
    await shot(pe, 'T03b-image-picked', false);
  }
  await pe.click('button[value=publish]');
  E('"Nashr qilish" bosildi');
  await pe.waitForFunction(() => location.pathname === '/kabinet', null, { timeout: 8000 });
  await pe.waitForSelector('#my-projects');
  const entRowStatus = await pe.$eval('.ltable tbody tr', (tr) => tr.textContent.replace(/\s+/g, ' '));
  check(`${RUN}: kabinetda e'lon Nashr qilingan`, /Nashr/i.test(entRowStatus), entRowStatus.slice(0, 120));
  await shot(pe, 'T04-cabinet-published');
  const pub = await (await fetch(`${BASE}/api/projects/${projId}`)).json();
  check(`${RUN}: nashrdan keyin mehmon API ko'radi`, pub.project && pub.project.status === 'published');
  if (RUN === 'a') check(`${RUN}: rasm saqlandi`, !!pub.project.image, pub.project.image);
  if (pub.project.image) {
    const ir = await fetch(BASE + pub.project.image);
    check(`${RUN}: rasm fayli yuklanadi`, ir.status === 200, `${ir.status} ${ir.headers.get('content-type')}`);
  }

  await pe.goto(`${BASE}/loyihalar/${projId}`);
  await pe.waitForSelector('.doc__title');
  const ownCta = await pe.evaluate(() => [...document.querySelectorAll('.stickycta a, .doc__cta')].filter((e) => e.offsetParent || getComputedStyle(e).position === 'fixed' && e.getClientRects().length).length);
  check(`${RUN}: R-3 o'z e'lonida bog'lanish tugmasi yo'q`, ownCta === 0, String(ownCta));
  await shot(pe, 'T04b-own-project', false);
  await pe.goto(`${BASE}/kabinet`);
  await pe.waitForSelector('#my-projects');

  // ---------------- 3. Investor (boshqa qurilma): mehmon sifatida ----------------
  await pi.goto(BASE + '/');
  await pi.waitForSelector('.row');
  I('Bosh sahifa mehmon sifatida ochildi');
  check(`${RUN}: mehmon bosh sahifada reestrni ko'radi`, (await pi.$$('.row')).length > 0);
  // mehmon saqlashni bosadi
  const guestStarId = await pi.$eval('tr.row:last-child .star', (b) => Number(b.dataset.save));
  await pi.click('tr.row:last-child .star');
  await pi.waitForSelector('dialog[open]', { timeout: 3000 }).catch(() => {});
  const dlgTxt = await pi.$eval('dialog[open]', (d) => d.textContent).catch(() => '');
  check(`${RUN}: mehmon yulduzcha -> kirish taklifi`, /kiring/i.test(dlgTxt), dlgTxt.slice(0, 80));
  await shot(pi, 'I01-guest-save-prompt', false);
  await pi.keyboard.press('Escape');
  await pi.waitForTimeout(200);
  check(`${RUN}: dialog Esc bilan yopiladi`, !(await pi.$('dialog[open]')));
  // ro'yxatdan o'tish
  await pi.goto(BASE + '/royxatdan-otish?rol=investor');
  await pi.waitForSelector('form[data-form="register"]');
  await pi.fill('#r-name', inv.name);
  await pi.fill('#r-email', inv.email);
  await pi.fill('#r-password', inv.pw);
  await pi.click('form[data-form="register"] button[type=submit]');
  I('Investor sifatida ro\'yxatdan o\'tdi');
  await pi.waitForFunction(() => location.pathname === '/kabinet', null, { timeout: 8000 });
  await pi.waitForSelector('#outgoing');
  await shot(pi, 'I02-cabinet-empty');
  const savedAfterReg = await pi.evaluate(async () => (await (await fetch('/api/me/saved')).json()).ids);
  check(`${RUN}: R-4 mehmon yopgan kirish taklifidagi loyiha avtomatik saqlanmagan`, !savedAfterReg.includes(guestStarId), `guestStarId=${guestStarId} saved=${JSON.stringify(savedAfterReg)}`);

  // katalogdan filtr bilan topish
  await pi.click('.topbar a.brand');
  await pi.waitForSelector('.row');
  I('Bosh sahifaga qaytdi');
  if (isMob(INV_VP)) {
    // mobil: bottom sheet
    await pi.click('[data-sheet="soha"]');
    await pi.waitForSelector('dialog[open] input[type=radio]');
    I('"Soha" sheet ochildi');
    await pi.check(`dialog[open] input[name=soha][value="${sector}"]`);
    await pi.waitForTimeout(500);
    const btnTxt1 = await pi.$eval('dialog[open] [data-apply]', (b) => b.textContent.trim());
    check(`${RUN}: sheet tugmasida real natija soni`, /\d+ ta loyihani/.test(btnTxt1), btnTxt1);
    await shot(pi, 'I03-sheet-soha', false);
    await pi.click('dialog[open] [data-apply]');
    I('Soha qo\'llandi');
    await pi.waitForTimeout(400);
    await pi.click('[data-sheet="hudud"]');
    await pi.waitForSelector('dialog[open] input[type=radio]');
    await pi.check(`dialog[open] input[name=hudud][value="${region}"]`);
    await pi.waitForTimeout(500);
    await pi.click('dialog[open] [data-apply]');
    I('Hudud qo\'llandi');
    await pi.waitForTimeout(400);
    await pi.click('[data-sheet="summa"]');
    await pi.waitForSelector('dialog[open] input[type=radio]');
    await pi.check('dialog[open] input[name=tartib][value="summa-kamayish"]');
    await pi.waitForTimeout(300);
    await pi.click('dialog[open] [data-apply]');
    I('Summa: kamayish tartibi qo\'llandi');
    await pi.waitForTimeout(400);
  } else {
    await pi.selectOption('#f-soha', sector);
    I('Soha filtri tanlandi');
    await pi.waitForTimeout(400);
    await pi.selectOption('#f-hudud', region);
    I('Hudud filtri tanlandi');
    await pi.waitForTimeout(400);
    await pi.click('button[data-sortby="summa"]');
    I('Summa ustuni bo\'yicha tartiblandi');
    await pi.waitForTimeout(400);
  }
  const url = pi.url();
  check(`${RUN}: filtrlar URL da`, url.includes(`soha=${sector}`) && url.includes(`hudud=${region}`) && url.includes('tartib=summa-kamayish'), url);
  const names = await pi.$$eval('.row .row__link', (as) => as.map((a) => a.textContent.trim()));
  check(`${RUN}: filtrdan keyin loyiha topildi`, names.includes(projName), JSON.stringify(names));
  const countTxt = await pi.$eval('[data-count]', (e) => e.textContent);
  check(`${RUN}: natija soni ko'rsatilgan`, /\d+ ta loyiha/.test(countTxt), countTxt);
  await shot(pi, 'I04-filtered');
  // saqlash
  const row = pi.locator('tr.row', { hasText: projName });
  check(`${RUN}: saqlashdan oldin yulduzcha bo'sh`, (await row.locator('.star').getAttribute('aria-pressed')) === 'false');
  await row.locator('.star').click();
  I('Yulduzcha bilan saqlandi');
  await pi.waitForTimeout(500);
  check(`${RUN}: yulduzcha aria-pressed=true`, (await row.locator('.star').getAttribute('aria-pressed')) === 'true');
  // loyiha sahifasi
  await row.locator('.row__link').click();
  I('Loyiha sahifasi ochildi');
  await pi.waitForSelector('.doc__title');
  const docText = await pi.$eval('main', (m) => m.innerText);
  check(`${RUN}: loyiha sahifasida tadbirkor emaili yo'q`, !docText.includes(ent.email));
  check(`${RUN}: raqamlangan bo'limlar`, ['1. Biznes haqida', '2. Mablag‘dan foydalanish', '3. Hamkorlik sharti', '4. Bog‘lanish'].every((s) => docText.includes(s)));
  check(`${RUN}: maxfiylik izohi`, /aloqa ma’lumotlari ochiq ko‘rsatilmaydi/i.test(docText));
  check(`${RUN}: foiz jadvali`, !!(await pi.$('table.funds')));
  if (RUN === 'a') {
    const imgOk = await pi.$eval('figure.photo img', (i) => i.complete && i.naturalWidth > 0).catch(() => false);
    check(`${RUN}: loyiha sahifasida rasm chiqdi`, imgOk);
  }
  const savedTxt = await pi.$eval('[data-savetext]', (e) => e.textContent).catch(() => '');
  check(`${RUN}: loyiha sahifasida "Saqlangan"`, savedTxt === 'Saqlangan', savedTxt);
  await shot(pi, 'I05-project');
  // sticky CTA
  const sticky = await pi.$('.stickycta a');
  const stickyVis = !!sticky && await sticky.isVisible();
  const docCta = await pi.$('.doc__cta');
  const docCtaVis = !!docCta && await docCta.isVisible();
  if (!isMob(INV_VP)) {
    const db = docCtaVis ? await docCta.boundingBox() : null;
    check(`${RUN}: R-2 desktopda "Tadbirkor bilan bog'lanish" tugmasi birinchi ekranda`, docCtaVis && db.y + db.height <= VP[INV_VP].viewport.height, JSON.stringify(db));
    check(`${RUN}: R-2 desktop tugma matni`, docCtaVis && (await docCta.innerText()).trim() === 'Tadbirkor bilan bog‘lanish');
    await shot(pi, 'I05b-project-firstscreen', false);
  } else {
    check(`${RUN}: mobilda faqat bitta CTA (doc__cta yashirin)`, stickyVis && !docCtaVis, `sticky=${stickyVis} doc=${docCtaVis}`);
    await shot(pi, 'I05b-project-firstscreen', false);
  }
  const cta = isMob(INV_VP) ? sticky : docCta;
  const ctaVisible = isMob(INV_VP) ? stickyVis : docCtaVis;
  if (isMob(INV_VP)) {
    const box = ctaVisible ? await cta.boundingBox() : null;
    check(`${RUN}: mobil yopishqoq CTA ekranda pastda`, box && box.y + box.height <= VP[INV_VP].viewport.height + 1 && box.y > VP[INV_VP].viewport.height - 120, JSON.stringify(box));
  }
  if (ctaVisible) { await cta.click(); I('"Tadbirkor bilan bog\'lanish" bosildi'); } else { await pi.locator('#boglanish').scrollIntoViewIfNeeded(); I('Bog\'lanish bo\'limiga skroll'); }
  await pi.waitForTimeout(600);
  const focused = await pi.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName));
  check(`${RUN}: CTA fokusni forma maydoniga olib boradi`, focused === 'c-message', focused);
  // bo'sh yuborish
  await pi.click('form[data-form="contact"] button[type=submit]');
  await pi.waitForTimeout(300);
  const cErrs = await pi.$$eval('form[data-form="contact"] .field-error', (els) => els.map((e) => e.textContent.trim()));
  check(`${RUN}: bog'lanish formasi validatsiyasi`, cErrs.length === 2, JSON.stringify(cErrs));
  await shot(pi, 'I06-contact-errors', false);
  await pi.fill('#c-message', message);
  await pi.fill('#c-contact', contact);
  await pi.click('form[data-form="contact"] button[type=submit]');
  I('Xabar va aloqa yuborildi');
  await pi.waitForSelector('.confirm', { timeout: 5000 });
  const conf = await pi.$eval('.confirm', (e) => e.innerText);
  check(`${RUN}: yuborilgandan keyin tasdiq + Kutilmoqda`, /yuborildi/.test(conf) && /Kutilmoqda/.test(conf), conf.replace(/\s+/g, ' '));
  await shot(pi, 'I07-contact-sent', false);
  // takroriy so'rov
  const dup = await pi.evaluate(async (id) => (await fetch(`/api/projects/${id}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: JSON.stringify({ message: 'yana bir marta yozyapman', contact: '+99890' }) })).status, projId);
  check(`${RUN}: takroriy so'rov rad etiladi (409)`, dup === 409, String(dup));

  // ochiq API da investor aloqasi yo'q
  const pubList = await (await fetch(`${BASE}/api/projects?limit=100`)).text();
  const pubOne = await (await fetch(`${BASE}/api/projects/${projId}`)).text();
  check(`${RUN}: investor aloqasi ochiq katalog API da yo'q`, !pubList.includes(contact) && !pubList.includes(inv.email) && !pubList.includes(ent.email));
  check(`${RUN}: investor aloqasi ochiq loyiha API da yo'q`, !pubOne.includes(contact) && !pubOne.includes(inv.email) && !pubOne.includes(ent.email) && !/owner_id|email|contact/.test(pubOne), pubOne.slice(0, 0));
  const invOne = await pi.evaluate(async (id) => await (await fetch(`/api/projects/${id}`)).text(), projId);
  check(`${RUN}: investor sessiyasida ham loyiha API da tadbirkor aloqasi yo'q`, !invOne.includes(ent.email) && !/email|contact/.test(invOne));

  // investor kabinet: Kutilmoqda
  await pi.click('[data-account]');
  await pi.waitForSelector('#outgoing');
  I('Kabinet ochildi');
  const invRow1 = await pi.locator('.ltable tr', { hasText: projName }).innerText();
  check(`${RUN}: investor kabinetida "Kutilmoqda"`, /Kutilmoqda/.test(invRow1), invRow1.replace(/\s+/g, ' '));
  await shot(pi, 'I08-cabinet-pending');

  // ---------------- 4. Tadbirkor: so'rovni ko'rish va qaror ----------------
  await pe.reload();
  await pe.waitForSelector('#incoming');
  E('Kabinet yangilandi');
  const reqRow = pe.locator('tr[data-req]', { hasText: projName });
  const reqTxt = await reqRow.innerText();
  check(`${RUN}: tadbirkor so'rovni ko'radi (xabar, aloqa, ism)`, reqTxt.includes(contact) && reqTxt.includes(inv.name) && reqTxt.includes('Assalomu'), reqTxt.replace(/\s+/g, ' ').slice(0, 200));
  await shot(pe, 'T05-incoming');
  const reqId = Number(await reqRow.getAttribute('data-req'));
  await reqRow.locator(`button[data-action="${DECISION}"]`).click();
  E(DECISION === 'accept' ? '"Qabul qilish" bosildi' : '"Rad etish" bosildi');
  await pe.waitForTimeout(600);
  const after = await reqRow.innerText();
  const expected = DECISION === 'accept' ? 'Qabul qilindi' : 'Rad etildi';
  check(`${RUN}: tadbirkor kabinetida holat "${expected}"`, after.includes(expected), after.replace(/\s+/g, ' ').slice(0, 200));
  await shot(pe, 'T06-decided');

  // ---------------- 5. Investor: natija ----------------
  await pi.click('[data-action="refresh"]');
  await pi.waitForSelector('#outgoing');
  I('Kabinetda "Yangilash" bosildi');
  await pi.waitForTimeout(400);
  const invRow2 = await pi.locator('.ltable tr', { hasText: projName }).innerText();
  check(`${RUN}: investor kabinetida "${expected}"`, invRow2.includes(expected), invRow2.replace(/\s+/g, ' '));
  await shot(pi, 'I09-cabinet-result');
  // saqlanganlar boshqa qurilmada: yangi kontekstda kirish
  const ctxI2 = await browser.newContext({ ...VP[isMob(INV_VP) ? 'd1280' : 'm390'] });
  const pi2 = await ctxI2.newPage();
  await pi2.goto(BASE + '/kirish');
  await pi2.fill('#l-email', inv.email); await pi2.fill('#l-password', inv.pw);
  await pi2.click('form[data-form="login"] button[type=submit]');
  await pi2.waitForFunction(() => location.pathname === '/kabinet');
  await pi2.goto(BASE + '/loyihalar?saqlangan=1');
  await pi2.waitForSelector('[data-count]');
  await pi2.waitForTimeout(500);
  const savedNames = await pi2.$$eval('.row .row__link', (as) => as.map((a) => a.textContent.trim()));
  check(`${RUN}: saqlangan loyiha 3-qurilmada ham ko'rinadi`, savedNames.includes(projName), JSON.stringify(savedNames));
  await shot(pi2, 'I10-saved-other-device');
  await ctxI2.close();

  // ---------------- 6. Begona foydalanuvchi ----------------
  const asInv = (u, m, b) => pi.evaluate(async ([u, m, b]) => { const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: b ? JSON.stringify(b) : undefined }); return r.status; }, [u, m, b]);
  check(`${RUN}: investor begona loyihani tahrirlay olmaydi`, [403, 404].includes(await asInv(`/api/projects/${projId}`, 'PUT', { name: 'hack', action: 'save' })));
  check(`${RUN}: investor begona loyihani yopa olmaydi`, [403, 404].includes(await asInv(`/api/projects/${projId}/close`, 'POST')));
  check(`${RUN}: investor so'rovni qabul qila olmaydi`, [403, 404, 409].includes(await asInv(`/api/requests/${reqId}/accept`, 'POST')));
  check(`${RUN}: investor kiruvchi so'rovlarni o'qiy olmaydi`, [401, 403].includes(await asInv('/api/me/requests/incoming', 'GET')));
  // ikkinchi tadbirkor
  const ctxX = await browser.newContext();
  const px = await ctxX.newPage();
  await px.goto(BASE + '/');
  const asX = (u, m, b) => px.evaluate(async ([u, m, b]) => { const r = await fetch(u, { method: m, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, t: await r.text() }; }, [u, m, b]);
  await asX('/api/auth/register', 'POST', { role: 'tadbirkor', name: 'Begona', email: `begona-${RUN}-${stamp}@sinov.uz`, password: 'parol12345' });
  check(`${RUN}: begona tadbirkor loyihani tahrirlay olmaydi`, [403, 404].includes((await asX(`/api/projects/${projId}`, 'PUT', { name: 'hack', action: 'save' })).s));
  check(`${RUN}: begona tadbirkor loyihani yopa olmaydi`, [403, 404].includes((await asX(`/api/projects/${projId}/close`, 'POST')).s));
  check(`${RUN}: begona tadbirkor rasmini o'chira olmaydi`, [403, 404].includes((await asX(`/api/projects/${projId}/image`, 'DELETE')).s));
  check(`${RUN}: begona tadbirkor so'rovni rad eta olmaydi`, [403, 404].includes((await asX(`/api/requests/${reqId}/reject`, 'POST')).s));
  const xInc = await asX('/api/me/requests/incoming', 'GET');
  check(`${RUN}: begona tadbirkor kiruvchilarida so'rov yo'q`, !xInc.t.includes(contact), xInc.t.slice(0, 80));
  await px.goto(`${BASE}/kabinet/loyiha/${projId}`);
  await px.waitForSelector('main h1');
  const xH1 = await px.$eval('main h1', (h) => h.textContent);
  check(`${RUN}: begona tadbirkor tahrirlash sahifasini ocholmaydi (UI)`, /topilmadi/i.test(xH1), xH1);
  await shot(px, 'X01-foreign-edit', false);
  await ctxX.close();

  // ---------------- 7. Tahrirlash va yopish ----------------
  await pe.click(`a[href="/kabinet/loyiha/${projId}"]`);
  await pe.waitForSelector('form[data-form="project"]');
  E('Tahrirlash ochildi');
  await pe.fill('#p-amount', RUN === 'a' ? '42000' : '125000');
  await pe.click('button[value=save]');
  E('"O\'zgarishlarni saqlash" bosildi');
  await pe.waitForTimeout(800);
  const ed = await (await fetch(`${BASE}/api/projects/${projId}`)).json();
  check(`${RUN}: tahrir saqlandi va ochiq sahifada yangilandi`, ed.project.amount_usd === (RUN === 'a' ? 42000 : 125000) && ed.project.status === 'published', `${ed.project.amount_usd} ${ed.project.status}`);
  await shot(pe, 'T07-edit-saved');
  await pe.goto(BASE + '/kabinet');
  await pe.waitForSelector('#my-projects');
  await pe.click(`button[data-action="close"][data-id="${projId}"]`);
  E('"E\'lonni yopish" bosildi (confirm)');
  await pe.waitForTimeout(800);
  const closedRow = await pe.locator('.ltable tbody tr', { hasText: projName }).first().innerText();
  check(`${RUN}: kabinetda "Yopilgan"`, /Yopilgan/.test(closedRow), closedRow.replace(/\s+/g, ' ').slice(0, 120));
  await shot(pe, 'T08-closed');
  const l2 = await (await fetch(`${BASE}/api/projects?limit=100`)).json();
  check(`${RUN}: yopilgan e'lon ochiq katalogda yo'q`, !l2.items.some((p) => p.id === projId));
  // investor yopilgan sahifani ko'radi
  await pi.goto(`${BASE}/loyihalar/${projId}`);
  await pi.waitForSelector('.doc__title');
  const closedDoc = await pi.$eval('main', (m) => m.innerText);
  check(`${RUN}: yopilgan sahifada izoh`, /yopilgan/i.test(closedDoc));
  const ctaClosedVis = await pi.evaluate(() => [...document.querySelectorAll('.stickycta a, .doc__cta')].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'));
  const footPad = await pi.$eval('.footer', (f) => getComputedStyle(f).paddingBottom);
  check(`${RUN}: R-3 yopilgan sahifada footer ortiqcha pastki joysiz`, parseFloat(footPad) < 80, footPad);
  check(`${RUN}: R-3 yopilgan e'londa "Tadbirkor bilan bog'lanish" tugmasi o'chgan/yashirin`, !ctaClosedVis, `visible=${ctaClosedVis}`);
  await shot(pi, 'I11-closed-project');
  await pi.goto(BASE + '/kabinet');
  await pi.waitForSelector('#outgoing');
  const invRow3 = await pi.locator('.ltable tr', { hasText: projName }).innerText();
  check(`${RUN}: investor kabinetida "E'lon yopilgan" belgisi`, /yopilgan/i.test(invRow3), invRow3.replace(/\s+/g, ' '));

  check(`${RUN}: tadbirkor brauzerida konsol/tarmoq xatolari yo'q`, errE.length === 0, JSON.stringify(errE));
  check(`${RUN}: investor brauzerida konsol/tarmoq xatolari yo'q`, errI.filter((e) => !e.includes('/requests')).length === 0, JSON.stringify(errI));

  await browser.close();
  const out = { run: RUN, entVp: ENT_VP, invVp: INV_VP, decision: DECISION, projId, entSteps, invSteps, log, checks };
  fs.writeFileSync(path.join(__dirname, `flow2-${RUN}.json`), JSON.stringify(out, null, 2));
  const fails = checks.filter((c) => !c.ok);
  console.log(`\nJAMI: ${checks.length} tekshiruv, ${fails.length} muvaffaqiyatsiz`);
})().catch((e) => { console.error('XATO:', e); process.exit(1); });
