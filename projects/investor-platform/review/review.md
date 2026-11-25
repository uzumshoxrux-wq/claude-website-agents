# Tekshiruv: Investor platformasi ("Loyihalar reestri") — 2026-11-25, raund 1

## Xulosa
Holat: TUZATISH KERAK
Kritik: 0, Muhim: 3, Kichik: 4

Briefdagi yakuniy sinov brauzerda ikki marta to'liq o'tdi. Har safar ikki yangi akkaunt va ikki alohida brauzer konteksti ishlatildi:
- **Oqim A:** tadbirkor mobil 390×844 da, investor desktop 1280×800 da; so'rov **qabul qilindi**.
- **Oqim B:** tadbirkor desktop 1280×800 da, investor mobil 360×740 da; so'rov **rad etildi**.

Ikkala oqimda quyidagilar ishladi:
- ro'yxatdan o'tish;
- qoralama → nashr (A da ixtiyoriy rasm bilan);
- katalogda filtr va tartiblash;
- saqlash, so'rov yuborish, qaror qabul qilish, natijani ko'rish;
- tahrirlash va e'lonni yopish.

Ruxsat tekshiruvlari, aloqa ma'lumotlari maxfiyligi, "Namuna" belgisi va uydirma statistika yo'qligi ham o'tdi. Tuzatish kerak bo'lgan muammolar asosan ko'rinishda:
- mobil qatorda hudud kesilib qoladi;
- desktopda "Tadbirkor bilan bog'lanish" tugmasi yo'q;
- mobilda yopilgan yoki namuna e'londa bog'lanish tugmasi faol turadi.

Muhit:
- Server toza vaqtinchalik bazada ishga tushirildi: `DATA_DIR=<scratchpad>/data PORT=3100 npm start`.
- Tekshiruv Playwright 1.63 va Chromium bilan, axe-core 4.x orqali o'tkazildi.
- `site/data/` ga tegilmadi. Tekshiruv oxirida server to'xtatildi.

## Asosiy foydalanuvchi amallari
| Amal | Mobil | Desktop | Izoh |
|---|---|---|---|
| 1. Mehmon bosh sahifani ochadi (360×640) | ✅ | ✅ | Ikki amal tugmasi va 3 ta to'liq qator skrollsiz ko'rinadi (360×740 da 4 ta, 1280×800 da 7 ta). "NAMUNA" 8/8 qatorda bor, statistikaga o'xshash matn topilmadi. Mobilda hudud kesiladi (R-1). |
| 2. Hudud ▾ → Summa ▾ kamayish | ✅ | ✅ | Mobil: bottom sheet ochiladi va tugmada real son chiqadi ("1 ta loyihani ko'rsatish"). Faol filtr amal rangida, URL `?soha=…&hudud=…&tartib=summa-kamayish`. Desktop: select + "Summa" sarlavhasi (`aria-sort` descending/ascending). Mobilda 3 sheet × 3 bosish, desktopda 3 amal. |
| 3. Saqlash, "Faqat saqlanganlar", boshqa qurilma | ✅ | ✅ | Saqlangan loyiha uchinchi kontekstda (boshqa "qurilma") `?saqlangan=1` da ko'rindi. Mehmon yulduzchani bossa, kirish taklifi chiqadi va Esc bilan yopiladi. Lekin yopilgan taklifdagi loyiha keyin avtomatik saqlanib qoladi (R-4). |
| 4. "Tadbirkor bilan bog'lanish" → xabar + aloqa | ✅ | ⚠️ | Mobil: yopishqoq CTA ekran pastida turadi va fokusni `#c-message` ga olib boradi. Bo'sh yuborishda 2 ta xato maydon yonida chiqadi. Yuborilgach "So'rovingiz yuborildi. Holati: Kutilmoqda". Takroriy so'rov 409. Desktopda bu nomli tugma yo'q, investor "4. Bog'lanish" bo'limigacha skroll qiladi (R-2). |
| 5. Tadbirkor: ro'yxat → qoralama → nashr | ✅ | ✅ | "Biznesimga investor topish" → rol oldindan tanlangan → forma (2 qadam). Qisman to'ldirilgan qoralama ochiq API da yo'q, mehmonga 404. To'liq bo'lmagan holda nashr qilinganda 6 ta xato maydon yonida va xulosa blokida chiqadi. To'ldirilib nashr qilingach katalogda ko'rinadi. Rasm yuklandi (`/uploads/*.jpg`, 200) va loyiha sahifasida chiqdi. |
| 6. Tadbirkor qabul / rad etadi → investor ko'radi | ✅ | ✅ | So'rov faqat egasida ko'rinadi: ism, xabar va investor aloqasi bilan. "Qabul qilindi" / "Rad etildi" matn bilan yoziladi. Investor "Yangilash" bosgach natijani ko'radi. |
| 7. Tahrirlash va e'lonni yopish | ✅ | ✅ | Summa tahrirlandi va ochiq API da yangilandi. Yopishda confirm chiqadi, kabinetda "Yopilgan", e'lon ochiq katalogdan yo'qoladi. Investor kabinetida "E'lon yopilgan" ko'rinadi. Mobilda yopilgan sahifada CTA faol (R-3). |
| 8. Desktop, faqat klaviatura | — | ✅ | Tab tartibi mantiqiy, barcha 32 to'xtashda fokus halqasi bor. Filtrni select va strelka bilan o'zgartirish ishlaydi. Sarlavhada Enter → `aria-sort` o'zgaradi, fokus tugmada qoladi. Qatorda Enter → loyiha ochiladi va fokus H1 ga tushadi. Sheet/modal Esc bilan yopiladi, fokus ochgan tugmaga qaytadi. |

Xavfsizlik va maxfiylik tekshiruvlari (ikkala oqimda ham o'tdi):
- **Mehmon:**
  - `GET /api/projects` va `GET /api/projects/:id` javoblarida investor aloqasi, investor emaili va tadbirkor emaili yo'q;
  - bu javoblarda `email` va `contact` maydonlari ham yo'q.
- **Investor sessiyasi:** loyiha API sida tadbirkor aloqasi yo'q.
- **Investor begona resurslarga:** PUT/close loyiha, so'rovni qabul qilish va `incoming` ni o'qish — hammasi 403.
- **Begona tadbirkor:**
  - PUT/close loyiha, rasmni DELETE qilish, so'rovni rad etish — 404;
  - uning `incoming` ro'yxatida so'rov yo'q;
  - UI da `/kabinet/loyiha/<id>` ochilganda "Loyiha topilmadi" chiqadi.
- **CSRF:** `X-Requested-With` sarlavhasisiz yozish so'rovlari 403 bilan rad etiladi.

## Topilmalar

### R-1 [Muhim] Mobil reestr qatorida hudud (va nom) kesilib, "qayerda" ko'rinmaydi
- Viewport: 360×740, 390×844 (768 va undan kengda muammo yo'q)
- Qadamlar: `/` ni oching va reestr qatorlariga qarang.
- Kutilgan: briefga ko'ra "har bir kartada … qayerda joylashgani darhol ko'rinsin". Konsepsiya A bo'yicha 2-satr "soha · hudud · bosqich".
- Haqiqiy:
  - `.row__meta` bitta satrda `text-overflow: ellipsis` bilan kesiladi: "Sanoat ishlab chiqarishi · Namang…", "Qurilish va materiallar · Qashqa…", "Turizm va mehmondo'stlik · Bux…".
  - 360px da 8 ta qatorning 8 tasida hudud to'liq ko'rinmaydi, bosqich esa umuman ko'rinmaydi.
  - Nom ham kesiladi ("Tikuvchilik sexi: ish…", "Mehmonxona: 12 …"), chunki NAMUNA yorlig'i va summa bilan bitta satrda turadi.
- Dalil: `review/screenshots/vp-m360x640-home-firstscreen.png`, `vp-m360-home.png`, `vp-m390-home.png`, `flow-b-I04-filtered.png`
- Taklif:
  - meta satrini ikki qatorgacha o'rashga ruxsat bering yoki hududni sohadan oldinga qo'ying;
  - uzun soha nomi o'rniga qisqa yorliq ishlating;
  - nom uchun ikki satrga ruxsat bering yoki NAMUNA yorlig'ini meta satriga ko'chiring.

### R-2 [Muhim] Desktopda loyiha sahifasida "Tadbirkor bilan bog'lanish" tugmasi yo'q
- Viewport: 1280×800, 1920×1080 (≥900px)
- Qadamlar: investor sifatida kiring → katalogdan loyihani oching.
- Kutilgan: brief: "Loyiha sahifasida 'Tadbirkor bilan bog'lanish' tugmasi bo'lsin".
- Haqiqiy:
  - `.stickycta` faqat `max-width: 899.98px` da ko'rsatiladi (`display:none` desktopda).
  - Desktopda bu nomdagi tugma ham, sahifa boshida "4. Bog'lanish" ga havola ham yo'q.
  - Forma sahifaning eng pastida, birinchi ekrandan tashqarida turadi.
- Dalil: `review/screenshots/flow-a-I05-project.png` (1280px, sahifa yuqorisida faqat "Saqlangan" tugmasi bor)
- Taklif: desktopda sarlavha blokiga (summa va "Saqlash" yoniga) `#boglanish` ga olib boradigan "Tadbirkor bilan bog'lanish" tugmasini qo'shing.

### R-3 [Muhim] Mobilda yopilgan, namuna va o'z e'lonida yopishqoq "Tadbirkor bilan bog'lanish" faol turadi
- Viewport: 360×740, 390×844
- Qadamlar:
  1. Tadbirkor e'lonni yopadi.
  2. Investor mobilda `/loyihalar/<id>` ni ochadi (havola yoki "Mening so'rovlarim" orqali).
  3. Yoki istalgan NAMUNA e'lonni ochadi.
- Kutilgan: `decision.md` 7-band: "…'Yopilgan' deb belgilanadi va bog'lanish tugmasi o'chadi". Namuna va o'z e'lonida ham amal bajarib bo'lmaydi, shuning uchun tugma faol turmasligi kerak.
- Haqiqiy:
  - Ekran pastidagi to'q yashil "Tadbirkor bilan bog'lanish" tugmasi ko'rinadi va bosiladi.
  - Bosilganda faqat "Bu e'lon yopilgan…" yoki "Bu namuna e'lon…" izohiga skroll qiladi. Asosiy amal tugmasi yolg'on va'da beradi.
- Dalil: `review/screenshots/flow-b-I11-closed-project.png`, `vp-m390-sample-cta-click.png`
- Taklif: `p.status !== 'published' || p.is_sample || p.is_own` bo'lsa, CTA ni yashiring yoki `aria-disabled` holatda, "E'lon yopilgan" / "Namuna e'lon" matni bilan ko'rsating.

### R-4 [Kichik] Mehmon yopgan kirish taklifidagi loyiha keyin avtomatik saqlanadi
- Viewport: 1280×800 va 360×740 (ikkala oqimda takrorlandi)
- Qadamlar:
  1. Mehmon reestrda yulduzchani bosadi.
  2. "Saqlash uchun akkauntga kiring" oynasini Esc yoki "Yopish" bilan yopadi.
  3. Keyinroq boshqa yo'l bilan ro'yxatdan o'tadi.
- Kutilgan: taklif rad etilgan bo'lsa, saqlash niyati bekor qilinadi.
- Haqiqiy: `sessionStorage.pendingSave` tozalanmaydi. Ro'yxatdan o'tgach loyiha jimgina saqlanadi va "Loyiha saqlandi." toast chiqadi. Test API da `saved=[1]` qaytdi.
- Dalil: `review/flow-a.json`, `flow-b.json` (tekshiruv "mehmon yopgan kirish taklifidagi loyiha avtomatik saqlanmagan" — FAIL), `screenshots/flow-b-I04-filtered.png` (toast)
- Taklif: dialog "Kirish" / "Ro'yxatdan o'ting" havolasisiz yopilganda `pendingSave` ni o'chiring.

### R-5 [Kichik] Ba'zi touch nishonlari 44px dan past
- Viewport: 360, 390, 768
- Haqiqiy:
  - Footer havolalari ("Loyihalarni ko'rish", "Biznesimga investor topish", "Kabinet") 41px balandlikda.
  - "Reestrga qaytish" va "Kabinetga qaytish" ham 41px.
  - Reestrdagi nom havolasi 22px, lekin butun qator (`tr[data-href]`) bosiladi, shuning uchun amalda to'siq emas.
- Dalil: `review/viewports.json` (`small` maydonlari), `screenshots/vp-m360-project-sample.png`
- Taklif: bu havolalarga `min-height: 44px; display: inline-flex; align-items: center` bering.

### R-6 [Kichik] Desktopda ustun va filtr yorliqlari 12px
- Viewport: 1280, 1920
- Kutilgan: konsepsiya A desktop shkalasi 13 / 15 / 18 / 22 / 28px.
- Haqiqiy: filtr yorliqlari ("Soha", "Hudud", …) va jadval sarlavhalari (NOM, SOHA, …) 12px. Mobilda NAMUNA yorlig'i 12px (mobil shkalada 12 bor, qabul qilsa bo'ladi).
- Taklif: desktop yorliqlarini 13px ga ko'taring.

### R-7 [Kichik] Rasm tanlash maydoni brauzer tilida ("Choose File / No file chosen")
- Viewport: hammasi
- Haqiqiy: forma 2-bo'limida standart `<input type=file>` ishlatilgan. Inglizcha Chromium'da matn inglizcha chiqadi, qolgan interfeys esa o'zbekcha.
- Dalil: `review/screenshots/flow-a-T03-publish-errors.png`
- Taklif: inputni yashirib, o'zbekcha yozuvli `<label>` tugma ("Rasm tanlash") va tanlangan fayl nomini ko'rsating.

## Kirish imkoniyati
- **axe-core** (`wcag2a/aa`, `wcag21aa`, `wcag22aa`, `best-practice`) quyidagi sahifalarda 0 ta buzilish topdi: bosh sahifa, loyiha sahifasi, ro'yxatdan o'tish va yangi loyiha formasi (360 va 1280 da). Kontrast muammosi aniqlanmadi.
- **Sarlavhalar ierarxiyasi** to'g'ri: H1 → H2 (raqamlangan bo'limlar).
- **Rasmlar:** `alt` siz rasm yo'q, buzilgan rasm yo'q.
- **Formalar:**
  - barcha maydonlarda label bor;
  - xatolar maydon yonida va `role=alert` xulosa blokida chiqadi.
- **Klaviatura:**
  - skip-link bor;
  - fokus halqasi hamma joyda ko'rinadi;
  - dialog fokusni ushlaydi va Esc bilan yopiladi, fokus qaytadi.
- **Holatlar** matn bilan yoziladi (Kutilmoqda / Qabul qilindi / Rad etildi / Yopilgan), faqat rangga tayanmaydi.

## Maket, konsol va tarmoq
- **Gorizontal skroll:** 5 ta viewport × 10 ta sahifa bo'yicha hech birida yo'q (`scrollWidth - innerWidth = 0`).
- **Konsol va tarmoq:** sahifalarni ko'rishda konsol xatosi va muvaffaqiyatsiz so'rov yo'q. Uchragan xatolarning hammasi kutilgan edi: `/yoq-sahifa` uchun 404; testdagi ataylab qilingan 403/409; to'liq bo'lmagan nashrdagi 422.
- **Shriftlar:** faqat IBM Plex Sans va Plex Mono (400/600) yuklanadi, `oʻ gʻ ʼ` to'g'ri chiqadi.
- **Katalog:** rasm yuklanmaydi.
- **Mobil:**
  - yopishqoq saralash qatori skrolldan keyin `top: 56px` da qoladi;
  - bottom sheet tanlov qatorlari 48px balandlikda;
  - "Natijalarni ko'rsatish" tugmasi ekranda ko'rinadi.

## Konsepsiyaga muvofiqlik (A — "Reestr")
- **Mos keladi:**
  - hero yo'q, matnli nom va ikki segmentli amal tugmasi, darhol reestr;
  - desktopda haqiqiy jadval (Nom | Soha | Hudud | Bosqich | Summa | Saqlash), filtr paneli bitta qatorda va "Saqlanganlar (n)";
  - mobilda yopishqoq "Soha ▾ Hudud ▾ Bosqich ▾ Summa ▾" va bottom sheet;
  - summalar Plex Mono da, o'ng ustunda tekislangan;
  - zang rangli to'rtburchak "NAMUNA" yorlig'i;
  - raqamlangan bo'limli hujjat uslubidagi loyiha sahifasi, mablag' rejasi foizli jadval;
  - maxfiylik izohi bloki;
  - palitra (qog'oz fon, siyoh, yagona amal rangi `#0F5C55`);
  - marketing bloklari, stok-foto va ikonkalar yo'q;
  - platforma nomi `config.js` dagi bitta qiymatdan olinadi.
- **Chetlanishlar:**
  - mobil qatorda "nima / qayerda / qancha" ning "qayerda" qismi kesiladi (R-1);
  - desktopda bog'lanish tugmasi yo'q (R-2);
  - yopilgan e'londa bog'lanish tugmasi o'chmaydi (R-3);
  - desktop shrift shkalasi 12px ga tushadi (R-6).

## Skrinshotlar
Barchasi `review/screenshots/` da:
- **Oqim A** (tadbirkor mobil 390, investor desktop 1280, qabul):
  - tadbirkor: `flow-a-T01…T08`;
  - investor: `flow-a-I01…I11`;
  - begona tadbirkor: `flow-a-X01-foreign-edit.png`.
- **Oqim B** (tadbirkor desktop 1280, investor mobil 360, rad): `flow-b-T01…T08`, `flow-b-I01…I11` (`I03-sheet-soha` — bottom sheet), `flow-b-X01`.
- **Viewportlar** (`<vp>` = m360 / m390 / t768 / d1280 / d1920): `vp-<vp>-{home, catalog, project-sample, login, register, 404, cabinet-investor, catalog-saved-empty, form-new, cabinet-entrepreneur}.png`.
- **Qo'shimcha:**
  - `vp-m360x640-home-firstscreen.png`;
  - `vp-<mobil/planshet>-sheet-hudud.png`, `vp-*-home-scrolled.png`;
  - `vp-m390-sample-cta-click.png`;
  - `kbd-d1280-*.png`.
- **Skriptlar va xom natijalar:** `review/flow.js` (ikki akkauntli oqim), `review/viewports.js` (viewport, axe, klaviatura), `review/flow-a.json`, `review/flow-b.json`, `review/viewports.json`.

---

# Tekshiruv: Investor platformasi ("Loyihalar reestri") — 2026-11-25, raund 2

## Xulosa
Holat: TUZATISH KERAK
Kritik: 0, Muhim: 1, Kichik: 0

R-1…R-7 ning hammasi brauzerda tuzatilgani tasdiqlandi. Asosiy oqimda regressiya yo'q. Lekin R-1 tuzatilganidan keyin mobil reestr qatori 84–88px dan 103–145px gacha o'sdi (R-8). Bu `decision.md` dagi zichlik qaroridan sezilarli chetlanish.

Briefdagi yakuniy oqim uch marta to'liq bajarildi. Har safar ikki yangi akkaunt va ikki alohida brauzer konteksti ishlatildi (tadbirkor joylaydi → investor katalogdan topadi → xabar yuboradi → tadbirkor qaror qiladi → investor natijani ko'radi → tahrirlash → yopish):

| Oqim | Tadbirkor | Investor | Qaror | Qadamlar (T / I) | Tekshiruvlar |
|---|---|---|---|---|---|
| A | mobil 390×844 | desktop 1280×800 | qabul | 14 / 12 | 67, 65 tasi o'tdi |
| B | desktop 1280×800 | mobil 360×740 | rad | 13 / 13 | 60, 58 tasi o'tdi |
| C | mobil 360×740 | mobil 390×844 | qabul | 13 / 13 | 60, 58 tasi o'tdi |

Har oqimda "muvaffaqiyatsiz" chiqqan 2 ta tekshiruv tarmoq xatolari ro'yxatiga tegishli. Ularning hammasi test ataylab chaqirgan javoblar:
- to'liq bo'lmagan nashrda 422;
- takroriy so'rovda 409;
- begona resursga murojaatda 403.

Kutilmagan konsol xatosi ham, muvaffaqiyatsiz tarmoq so'rovi ham yo'q.

Muhit:
- `DATA_DIR=<scratchpad>/data-r2 PORT=3100 npm start` (toza baza).
- Playwright va Chromium, axe-core 4.x.
- `site/data/` ga tegilmadi, kod o'zgartirilmadi. Tekshiruv oxirida server to'xtatildi.
- Ro'yxatdan o'tish uchun limit bor: bitta IP dan 10 daqiqada 20 ta. Viewport skripti bu limitga urildi (429), shuning uchun server bir marta qayta ishga tushirildi. Bu kutilgan himoya, nuqson emas.

## R-1…R-7 tasdig'i
| # | Holat | Dalil |
|---|---|---|
| R-1 Mobil qatorda hudud kesiladi | ✅ Tuzatildi | 360/390 da 8/8 qatorda `.row__meta` va nom kesilmaydi (`scrollWidth ≤ clientWidth`), summa bilan ustma-ust tushmaydi. "soha · hudud · bosqich" to'liq ko'rinadi. Faqat "nima qiladi" satri konsepsiya bo'yicha bir qatorda kesiladi. Lekin qator balandligi o'sdi, R-8 ga qarang. `round2/vp-m360x640-home-firstscreen.png` |
| R-2 Desktopda bog'lanish tugmasi yo'q | ✅ Tuzatildi | 1280 da sarlavha blokida "Tadbirkor bilan bog‘lanish" tugmasi bor: y=291, 226×44, birinchi ekranda. Bosilganda fokus `#c-message` ga tushadi. Mobilda bu tugma yashirin, faqat yopishqoq CTA qoladi (dublikat yo'q). `round2/flow-a-I05b-project-firstscreen.png` |
| R-3 Yopilgan, namuna va o'z e'lonida CTA faol | ✅ Tuzatildi | Bog'lanish tugmasi quyidagi holatlarda yo'q: yopilgan e'lon (360, 390, 1280), namuna (390, 1280), o'z e'loni (390, 1280, 360). Yopilgan sahifada footerda ortiqcha 88px pastki joy ham qolmagan. `round2/flow-b-I11-closed-project.png`, `flow-*-T04b-own-project.png` |
| R-4 Yopilgan taklifdan keyin avtomatik saqlash | ✅ Tuzatildi | Taklif Esc yoki "Yopish" bilan yopilganda `pendingSave` o'chadi va ro'yxatdan o'tgach `saved=[]` (A, B, C). Ijobiy yo'l ham ishlaydi: yulduzcha → "Kirish" → login → loyiha saqlangan (`saved=[6]`). `round2/r4-after-login.png` |
| R-5 Touch nishonlari <44px | ✅ Tuzatildi | Footer, "Reestrga qaytish" va "Kabinetga qaytish" havolalari endi 44px. 360/390/768 dagi sahifalarda faqat reestrdagi nom havolalari qoldi (42px yoki 22px). Ularda butun qator bosiladi, buni Raund 1 da ham qabul qilganmiz. |
| R-6 Desktopda 12px yorliqlar | ✅ Tuzatildi | 1280 va 1920 da eng kichik shrift 13px. Mobilda 12px faqat NAMUNA yorlig'ida qoldi (mobil shkalada bor). |
| R-7 "Choose File" inglizcha | ✅ Tuzatildi | "Rasm tanlash" tugmasi (44px) va "Fayl tanlanmagan" yozuvi bor, standart input ko'rinmaydi. Tugma bosilganda fayl tanlash oynasi ochiladi, fayl nomi ko'rsatiladi; uzun nom o'raladi va gorizontal skroll chiqarmaydi. Klaviatura: Tab bilan yetib boriladi, tugmada 3px fokus halqasi chiqadi, Space oynani ochadi. "Rasmni olib tashlash" bosilsa yozuv "Fayl tanlanmagan" ga qaytadi, fokus inputga o'tadi va klaviaturada halqa ko'rinadi. Noto'g'ri tur (.txt) tanlansa "Faqat JPG, PNG yoki WebP rasm tanlang." xatosi chiqadi. `round2/r7-*.png`, `flow-a-T03b-image-picked.png` |

## Asosiy foydalanuvchi amallari
| Amal | Mobil | Desktop | Izoh |
|---|---|---|---|
| 1. Mehmon bosh sahifani ochadi (360×640) | ✅ | ✅ | Ikki amal tugmasi va 2 ta to'liq qator ko'rinadi (Raund 1 da 3 ta edi). 360×740 da 3, 390×844 da 4, 1280×800 da 7 ta qator. NAMUNA 8/8 qatorda bor, uydirma statistika yo'q. |
| 2. Filtr va tartiblash | ✅ | ✅ | Mobilda bottom sheet ishlaydi, tugmada real natija soni chiqadi. Desktopda select va `aria-sort`. URL `?soha=…&hudud=…&tartib=summa-kamayish`, loyiha topiladi. |
| 3. Saqlash va boshqa qurilma | ✅ | ✅ | Saqlangan loyiha uchinchi kontekstda `?saqlangan=1` da ko'rinadi. R-4 tuzatilgan. |
| 4. "Tadbirkor bilan bog'lanish" → xabar | ✅ | ✅ | Desktopda endi tugma bor (R-2). Validatsiya 2 ta xato chiqaradi. Yuborilgach "Kutilmoqda", takroriy so'rovga 409. |
| 5. Tadbirkor: ro'yxat → qoralama → nashr | ✅ | ✅ | Qoralama ochiq katalogda yo'q va mehmonga 404. To'liq bo'lmagan nashrda 6 ta xato. Rasm yangi tugma orqali yuklandi (200, image/jpeg). |
| 6. Qabul / rad → investor natijani ko'radi | ✅ | ✅ | A va C da "Qabul qilindi", B da "Rad etildi". Natija ikkala kabinetda ham ko'rinadi. |
| 7. Tahrirlash va yopish | ✅ | ✅ | Summa yangilanadi. Yopilgan e'lon katalogdan yo'qoladi, CTA yo'q, investor kabinetida "E’lon yopilgan". |
| 8. Desktop, faqat klaviatura | — | ✅ | Tab tartibi va fokus halqasi Raund 1 dagidek; skip-linkdan oldingi BODY to'xtashi bundan mustasno. Sarlavhada Enter `aria-sort` ni descending → ascending qiladi. Qator Enter bilan ochiladi, fokus H1 ga tushadi. Sheet Esc bilan yopiladi, fokus `soha` tugmasiga qaytadi. |

Ruxsat va maxfiylik tekshiruvlari uchala oqimda ham o'tdi:
- ochiq API da email va aloqa yo'q;
- investor va begona tadbirkor PUT, close, accept/reject, rasmni DELETE va `incoming` so'rovlarida 403/404 oladi;
- UI da begona tahrirlash sahifasi ochilmaydi, "Sahifa topilmadi" chiqadi.

## Topilmalar

### R-8 [Muhim] Regressiya: mobil reestr qatori 103–145px gacha o'sdi, ekranga 3 ta loyiha sig'adi
- Viewport: 360×740, 360×640, 390×844 (768 da muammo yo'q, qator 86px).
- Qadamlar: `/` ni oching va reestr qatorlari balandligini o'lchang.
- Kutilgan: `decision.md` 47-band: "qator uch satrli, balandligi ~84–88px, ekranda ~6–7 loyiha". Zichlik tanlangan konsepsiya A ning asosiy afzalligi: hal qiluvchi mezon, vazni 25%.
- Haqiqiy:
  - 360px: qator balandliklari 145, 145, 125, 125, 125, 125, 125, 123px. 360×740 da 3 ta, 360×640 da 2 ta to'liq qator ko'rinadi (Raund 1 da 4 va 3 ta).
  - 390px: 125px (bittasi 103px), 390×844 da 4 ta qator (Raund 1 da 6 ta).
  - Sabab: `.row__meta` faqat chap ustunda turadi (360 da 224px, 390 da 254px). Shu sababli "soha · hudud · bosqich" 2–3 satrga o'raladi. O'ng ustunda summa ostida yulduzchadan boshqa narsa yo'q, joy bo'sh qoladi. Nom ham NAMUNA yorlig'i bilan 2 satrga o'tadi.
- Dalil: `review/screenshots/round2/vp-m360x640-home-firstscreen.png` (Raund 1 bilan solishtiring: `review/screenshots/vp-m360x640-home-firstscreen.png`), `round2/vp-m360-home.png`, `round2/vp-m390-home.png`, `review/viewports2.json` (`rows`).
- Taklif:
  - mobilda meta satrini to'liq kenglikka yoying (`grid-column: 1 / -1`) yoki yulduzchani "nima qiladi" satri qatoriga o'tkazing. Shunda meta 1–2 satrga tushadi.
  - yoki meta da qisqa soha yorlig'idan foydalaning ("Sanoat ishlab chiqarishi" → "Sanoat"), hududni "viloyati" so'zisiz yozing.
  - Maqsad: R-1 yechimini saqlagan holda qator ~88–105px bo'lsin.

## Maket, kirish imkoniyati, konsol
- **Gorizontal skroll:** 5 ta viewport × 10 ta sahifa bo'yicha hech birida yo'q.
- **axe-core** (wcag2a/aa, 21aa, 22aa, best-practice) bosh sahifa, loyiha sahifasi, ro'yxatdan o'tish va yangi loyiha formasida (360 va 1280) 0 ta buzilish topdi.
- **Rasmlar:** `alt` siz yoki buzilgan rasm yo'q.
- **Konsol va tarmoq:** sahifalarni ko'rishda xato yo'q. Faqat `/yoq-sahifa` uchun 404 chiqdi, bu kutilgan.
- **Mobil:** yopishqoq saralash qatori `top: 56px` da qoladi. Sheet qatorlari 48px, pastki tugma ekranda ko'rinadi.

## Konsepsiyaga muvofiqlik (A — "Reestr")
Raund 1 dagi chetlanishlar yopildi:
- "qayerda" ko'rinadi (R-1);
- desktopda bog'lanish tugmasi bor (R-2);
- yopilgan, namuna va o'z e'lonida CTA yo'q (R-3);
- desktop shkalasi 13px dan boshlanadi (R-6);
- forma to'liq o'zbekcha (R-7).

Yangi chetlanish: mobil zichlik decision.md da belgilangandan ancha past (R-8). Qolgan jihatlar Raund 1 dagidek mos keladi: hero yo'q, jadval, Plex Mono summalar, NAMUNA yorlig'i, raqamlangan hujjat sahifasi, palitra.

## Skrinshotlar
Barchasi `review/screenshots/round2/` da:
- **Oqimlar:** `flow-{a,b,c}-T01…T08`, `T03b-image-picked` (faqat A), `T04b-own-project`, `flow-{a,b,c}-I01…I11`, `I05b-project-firstscreen`, `X01-foreign-edit`.
- **Viewportlar:** `vp-{m360,m390,t768,d1280,d1920}-*.png`, `vp-m360x640-home-firstscreen.png`, `vp-*-sheet-hudud.png`, `kbd-d1280-*.png`.
- **R-4 va R-7:** `r4-after-login.png`, `r7-file-{focus,picked,removed,removed-kbd,wrongtype}-{d1280,m360}.png`.
- **Skriptlar va xom natijalar:** `review/flow2.js`, `review/viewports2.js`, `review/flow2-{a,b,c}.json`, `review/viewports2.json`.
