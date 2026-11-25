// Raund 3: R-8 (mobil qator balandligi) va R-1 (kesilmaslik) mustaqil o'lchovi.
// NODE_PATH=/opt/node22/lib/node_modules node review/r8-measure3.js
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SHOTS = path.join(__dirname, 'screenshots', 'round3');
const VPS = [
  { key: 'm360x740', w: 360, h: 740, mob: true }, { key: 'm360x640', w: 360, h: 640, mob: true },
  { key: 'm390x844', w: 390, h: 844, mob: true }, { key: 'm375x667', w: 375, h: 667, mob: true },
  { key: 'm412x915', w: 412, h: 915, mob: true }, { key: 't768', w: 768, h: 1024, mob: true },
];
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const v of VPS) {
    const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, isMobile: v.mob, hasTouch: v.mob, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    for (const url of ['/', '/loyihalar']) {
      await p.goto(BASE + url); await p.waitForSelector('tr.row');
      await p.waitForTimeout(300);
      const r = await p.evaluate(() => {
        const lines = (el) => { if (!el) return null; const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3; return Math.round(el.getBoundingClientRect().height / lh); };
        const clip = (el) => el ? (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) : null;
        const rows = [...document.querySelectorAll('tr.row')].map((tr) => {
          const rb = tr.getBoundingClientRect();
          const meta = tr.querySelector('.row__meta'); const name = tr.querySelector('.row__name, a');
          const amt = tr.querySelector('.row__amount, .num, [class*=amount]');
          const desc = tr.querySelector('.row__desc, .row__what, .row__summary');
          const mb = meta && meta.getBoundingClientRect(); const ab = amt && amt.getBoundingClientRect(); const nb = name && name.getBoundingClientRect();
          const overlap = (a, c) => a && c && !(a.right <= c.left || c.right <= a.left || a.bottom <= c.top || c.bottom <= a.top);
          return {
            h: Math.round(rb.height), name: name && name.textContent.trim().slice(0, 40), nameLines: lines(name), nameClip: clip(name),
            meta: meta && meta.innerText.replace(/\s+/g, ' ').trim(), metaW: mb && Math.round(mb.width), metaLines: lines(meta), metaClip: clip(meta),
            metaFont: meta && getComputedStyle(meta).fontSize, descClip: desc ? clip(desc) : 'no-desc-el', descEllipsis: desc ? getComputedStyle(desc).textOverflow : null,
            amt: amt && amt.textContent.trim(), amtClip: clip(amt), overlapNameAmt: overlap(nb, ab), overlapMetaAmt: overlap(mb, ab),
            bottom: Math.round(rb.bottom),
          };
        });
        const first = document.querySelector('tr.row'); const above = first ? Math.round(first.getBoundingClientRect().top + scrollY) : null;
        const vis = rows.filter((x) => x.bottom <= innerHeight).length;
        return { above, visible: vis, rows, sw: document.documentElement.scrollWidth, iw: innerWidth };
      });
      out[`${v.key}${url}`] = r;
      if (url === '/') await p.screenshot({ path: path.join(SHOTS, `r8-${v.key}-firstscreen.png`) });
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'r8-measure3.json'), JSON.stringify(out, null, 2));
  for (const k in out) { const o = out[k]; console.log(k, 'above=', o.above, 'visible=', o.visible, 'hs=', o.sw > o.iw, 'h=', o.rows.map((x) => x.h).join(','), 'metaLines=', o.rows.map((x) => x.metaLines).join(','), 'nameLines=', o.rows.map((x) => x.nameLines).join(','), 'clip=', o.rows.filter((x) => x.metaClip || x.nameClip || x.amtClip || x.overlapMetaAmt || x.overlapNameAmt).length); }
  await b.close();
})();
