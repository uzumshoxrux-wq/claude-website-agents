# Konsepsiyalar: Investor platformasi (nomi hali tanlanmagan)

## Briefdan olingan xulosalar
- **Auditoriya:** ikki tomon. 1) Investorlar: loyihalarni ko'radi, saralaydi, solishtiradi, saqlaydi va tadbirkorga so'rov yuboradi. Asosiy kontekst telefon (briefdagi asosiy mezon: "loyihalarni telefonda topish va solishtirish"). 2) O'zbekistondagi tadbirkorlar: uzun formani to'ldiradi, qoralama saqlaydi, nashr qiladi, so'rovlarni qabul yoki rad etadi. Ikkala tomon ham o'zbek tilida, lotin yozuvida o'qiydi.
- **Biznes maqsadi:** v1 da investor bilan tadbirkor o'rtasida birinchi aloqa o'rnatish. O'lchanadigan natija: katalogdan loyiha topish → "Tadbirkor bilan bog'lanish" → so'rov qabul qilinishi. To'lov funksiyalari yo'q.
- **Asosiy foydalanuvchi amallari:** 1) Loyihalarni ko'rish (mehmon sifatida ham), soha / hudud / bosqich / summa bo'yicha saralash, saqlash va solishtirish. 2) Biznesga investor topish: ro'yxatdan o'tish, loyiha joylash, boshqarish. 3) So'rov yuborish va uning holatini (kutilmoqda / qabul qilindi / rad etildi) kuzatish.
- **Kontent:** loyiha kartasi = nima qiladi, qayerda, qancha USD. Batafsil sahifa = tavsif, mablag'dan foydalanish rejasi, hamkorlik sharti. Rasm ixtiyoriy, shuning uchun ko'p loyihada rasm **bo'lmaydi**. Dizayn rasmsiz holatda ham to'liq ishlashi kerak.
- **Cheklovlar:**
  - O'zbek lotin yozuvi. Shrift `oʻ`, `gʻ` (U+02BB) va tutuq belgisi `'` (U+2019 / U+02BC) belgilarini to'g'ri chiqarishi kerak. Har bir tanlangan shrift shu belgilarga tekshiriladi, aks holda tizim shriftidagi o'rinbosar ko'rinib qoladi.
  - Platforma nomi bitta joydan o'zgaradi. Logotip so'z belgisi (wordmark) emas, oddiy matnli nom bo'lishi kerak: rasmli logotip yo'q, nom joylashuvi uzun-qisqaligidan qat'i nazar buzilmasin.
  - Bosh sahifada ikki asosiy amal va darhol loyihalar ko'rinsin.
  - Sinov e'lonlarida "Namuna" belgisi bo'lsin. Uydirma statistika bo'lmasin: "1000+ investor", "$5M jalb qilindi", jilmayuvchi "muvaffaqiyat hikoyalari", yasama sharhlar yo'q.
  - Aloqa ma'lumotlari ochiq katalogda ko'rinmaydi. Vizual jihatdan "maxfiy / faqat so'rov orqali" holati aniq bo'lishi kerak.
- **Sohada siyqasi chiqqan yechimlar (ulardan qochamiz):** to'q ko'k + oltin "moliya" palitrasi, qo'l siqish va osmono'par bino stok-fotolari, raketa va o'sish grafigi ikonkalari, "Raised $X" progress-barlari, markazlashgan hero + 3 ta afzallik kartasi, mahalliy brend uchun avtomatik ikat/suzani naqshlari va Registon fotosi.
- **Taxminlar:**
  1. "Solishtirish" briefda alohida funksiya sifatida yozilmagan, lekin dizayn mezoni sifatida berilgan. Taxmin: solishtirish saqlangan loyihalar orqali amalga oshadi, alohida murakkab vosita v1 da shart emas. Har bir konsepsiya buni o'z yo'li bilan hal qiladi.
  2. Hududlar ro'yxati: 12 viloyat + Qoraqalpog'iston Respublikasi + Toshkent shahri (14 birlik).
  3. Bosqichlar: g'oya, prototip/boshlang'ich, ishlayotgan biznes, kengaytirish (aniq ro'yxatni ishlab chiquvchi belgilaydi).
  4. Summa diapazonlari USD da, filtrlar oraliq ko'rinishida (masalan: 10 000 gacha, 10–50 ming, 50–200 ming, 200 ming+).
  5. Kirill yozuvi talab qilinmagan. Shriftlar Kirillni ham qo'llasa yaxshi, lekin bu tanlov mezoni emas.
  6. Mobil tarmoq sekin bo'lishi mumkin. Og'ir media va veb-shrift sonini kam ushlash kerak (har konsepsiyada ko'pi bilan 2 oila).

---

## Konsepsiya A — "Reestr"
**G'oya (1–2 jumla):** Katalog — bu birja jadvali kabi zich, tekislangan reestr. Har bir loyiha bitta qator, raqamlar bir ustunda turadi, shuning uchun investor telefonda barmog'ini pastga surib, summalarni ko'z bilan solishtiradi.

**Kompozitsiya:**
- Hero yo'q. Birinchi ekranda: tepada matnli nom, ostida ikki amal teng kenglikdagi ikki segmentli tugma sifatida ("Loyihalarni ko'rish" | "Biznesimga investor topish"). Undan keyin ~120px dan so'ng darhol reestr boshlanadi.
- Reestr qatori (mobil, 2 satr): 1-satr — biznes nomi (qalin) + o'ngda summa (tekislangan raqamlar, o'ngga tekislangan). 2-satr — soha · hudud · bosqich (kichik, kulrang). Qator balandligi ~64px, bir telefon ekranida 8–9 loyiha.
- Qator ostidagi bir satrli izoh: "nima qiladi" (tavsifdan 1 qator, kesilgan). Shu tufayli briefdagi "nima, qayerda, qancha" bitta qarashda o'qiladi.
- Desktopda reestr haqiqiy jadvalga aylanadi: Nom | Soha | Hudud | Bosqich | Summa | Saqlash. 12 ustunli grid emas, ma'lumot ustunlariga asoslangan grid.
- Loyiha sahifasi hujjat uslubida: raqamlangan bo'limlar "1. Biznes haqida", "2. Mablag'dan foydalanish", "3. Hamkorlik sharti", "4. Bog'lanish". Mablag'dan foydalanish rejasi foizli jadval yoki bandlar ro'yxati, grafik emas.
- Ritm: tor vertikal ritm (8px), ingichka chiziqlar bilan ajratilgan qatorlar, bo'sh joy bezak sifatida emas, faqat guruhlash uchun ishlatiladi.

**Navigatsiya (desktop / mobil):**
- Mobil: yuqorida yopishqoq (sticky) panel: nom, qidiruv ikonkasi, "Kirish/Kabinet". Uning ostida reestr ustidagi yopishqoq **saralash qatori**: "Soha ▾ Hudud ▾ Bosqich ▾ Summa ▾" — har biri pastdan chiquvchi panel (bottom sheet) ochadi. Ustun sarlavhasini bosish = shu ustun bo'yicha tartiblash (summa ↑/↓).
- Saqlangan loyihalar alohida sahifa emas, reestrning filtri: "Faqat saqlanganlar" kalitchasi. Bu solishtirishni ham hal qiladi: saqlanganlar bir xil ustunlarda tekislanib turadi.
- Desktop: chap tomonda emas, jadval tepasida ochiq filtr paneli (hammasi bitta qatorda), o'ngda "Saqlanganlar (n)".
- Asosiy amalga yo'l: bosh sahifa → (filtr, ixtiyoriy) → qatorni bosish → "Tadbirkor bilan bog'lanish" (pastki yopishqoq tugma). 2 ta bosish + forma.

**Tipografiya:**
- **IBM Plex Sans** (OFL) — interfeys, sarlavhalar, matn. Muhandislik xarakteriga ega, Latin Extended qamrovi keng, zich jadvalda yaxshi o'qiladi.
- **IBM Plex Mono** (OFL) — faqat summa, sana va so'rov holatlari uchun. Monoshirin raqamlar ustunda millimetrgacha tekislanadi, solishtirish shunga tayanadi.
- Juftlik mantig'i: bitta oilaning ikki "ovozi". Ma'lumot (mono) va til (sans) vizual ajraladi, lekin bir tizimga tegishli.
- Shkala (mobil, 1.2 nisbat, kichik): 12 / 14 / 16 / 19 / 23px. Eng katta sarlavha 23px, chunki bu ish vositasi, vitrina emas. Desktop: 13 / 15 / 18 / 22 / 28px.
- Xarakter: kichik harflar bilan yozilgan ustun yorliqlari (letter-spacing +4%), qalinlik faqat 400 va 600.

**Vizual materiallar:**
- Palitra:
  - `#F4F2EC` — fon (qog'oz, quyoshda telefonda oq ekrandan kamroq ko'zni charchatadi)
  - `#16201C` — asosiy matn (siyoh)
  - `#6B6F69` — ikkinchi darajali matn (soha · hudud · bosqich)
  - `#D6D1C6` — qator ajratgich chiziqlar
  - `#0F5C55` — yagona amal rangi (tugmalar, faol filtr, havolalar)
  - `#B4471F` — "Namuna" belgisi va rad etilgan holat (zang rangi)
  - `#2F7D4F` — "qabul qilindi" holati
- Tasvirlar: katalogda umuman rasm yo'q (rasm ixtiyoriy bo'lgani uchun aralash rasmli/rasmsiz qatorlar notekis ko'rinmasin). Rasm faqat loyiha sahifasida, matndan keyin, 4:3 ramkada.
- Ikonalar: deyarli yo'q. Saqlash uchun bitta yulduzcha belgisi, filtr uchun ▾ strelka. Qolgani matn.
- "Namuna": qator boshida to'rtburchak ramkali kichik bosh harfli "NAMUNA" yorlig'i (mono shriftda), zang rangida.
- Maxfiylik: loyiha sahifasida aloqa o'rniga "Aloqa ma'lumotlari faqat tadbirkor so'rovni qabul qilgandan so'ng ochiladi" degan kulrang izoh bloki.
- Harakat: deyarli yo'q. Saralash o'zgarganda qatorlar 120ms da shunchaki almashadi, bottom sheet 200ms. Sekin tarmoq va past darajali telefonlar uchun.

**Asosiy amal oqimi:**
- Investor: bosh sahifa (reestr shu yerda) → "Summa ▾" bilan saralash → 2–3 qatorni yulduzcha bilan saqlash → "Faqat saqlanganlar" → summalarni ustunda solishtirish → qatorni ochish → "Tadbirkor bilan bog'lanish" → kirish → xabar + aloqa → kabinetda holat jadvali.
- Tadbirkor: "Biznesimga investor topish" → ro'yxatdan o'tish → raqamlangan bir sahifali forma (bo'limlar 1–4, yon tomonda emas, tepada qadamlar indeksi) → "Qoralama" / "Nashr qilish" → kabinetda "Mening e'lonlarim" va "So'rovlar" jadvallari.

**Briefga bog'liqlik:**
- "Telefonda topish va solishtirish" → bir ekranda maksimal qator soni, summalar bir vertikal ustunda.
- "Kartada nima, qayerda, qancha darhol ko'rinsin" → qatorning har bir satri aynan shu uch savolga javob beradi.
- "Rasm ixtiyoriy" → katalogni rasmsiz qurish, notekislik muammosi yo'qoladi.
- "Uydirma statistika yo'q" → hujjat ohangi, marketing bloklari umuman yo'q.
- "Nom keyin o'zgaradi" → matnli nom, Plex Sans 600 da.

**Kuchli tomonlari / xavflari:**
- Kuchli: solishtirish eng tez; yengil sahifa; rasmsiz e'lonlar zaif ko'rinmaydi; ko'p loyiha bo'lganda ham kengayadi.
- Xavf: emotsional jalb kam, birinchi marta kelgan tadbirkorga "quruq" tuyulishi mumkin; loyihalar kam bo'lgan boshlang'ich davrda bo'sh jadval ko'zga tashlanadi (yechim: bo'sh holat matni va "Namuna" qatorlari).

---

## Konsepsiya B — "Tokcha"
**G'oya (1–2 jumla):** Har bir loyiha — qo'lda ushlanadigan katta, rangli kartochka. Investor ularni tasmada varaqlaydi, yoqqanini ekran pastidagi "tokcha"ga qo'yadi va tokchadagi ikki loyihani yonma-yon ochib solishtiradi.

**Kompozitsiya:**
- Birinchi ekran ikki qismga bo'lingan: yuqori ~40% — ikki katta plitka (ikki asosiy amal), har biri to'liq kenglikda, bosh barmoq bilan bosishga qulay (minimal 72px balandlik). Pastki qism — gorizontal soha chiplari va darhol birinchi loyiha kartasining yuqori qismi ko'rinadi (skrollga undaydi).
- Lenta: bir ustunli vertikal tasma, karta ekranning ~70% ini egallaydi. Karta tuzilishi:
  - yuqori "bosh" qism: soha rangidagi blok + biznes nomining bosh harflaridan avtomatik yasalgan monogramma (rasm bo'lsa, rasm shu blokni egallaydi);
  - uchta katta fakt: **summa** (eng katta), **hudud**, **bosqich**;
  - "nima qiladi" — 2 qatorli tavsif;
  - pastda "Tokchaga qo'yish" tugmasi.
- Desktop: 3 ustunli bir xil balandlikdagi karta to'ri (masonry emas — teng balandlik solishtirishga yordam beradi) + o'ngda yopishqoq tokcha ustuni.
- Solishtirish ekrani: ikki ustun, chap va o'ng karta, ostida maydonlar qatorma-qator tekislangan (summa / hudud / bosqich / mablag' nimaga / hamkorlik sharti). Mobil ekranda ikki tor ustun; ikkinchi ustun gorizontal suriladi — tokchadagi keyingi loyiha bilan almashadi, birinchisi qotib turadi.

**Navigatsiya (desktop / mobil):**
- Mobil: **pastki tab-panel** (bosh barmoq zonasida), 4 ta: "Loyihalar", "Tokcha (n)", "Joylash", "Kabinet". Tepada faqat nom va qidiruv.
- Tokcha tab-paneli ustida suzib turuvchi yupqa tasma ham bo'ladi: "2 ta loyiha tokchada · Solishtirish →" — u kamida 2 ta loyiha saqlanganda paydo bo'ladi.
- Filtrlar: "Saralash" tugmasi to'liq balandlikdagi bottom sheet ochadi: soha (rangli chiplar), hudud (ro'yxat), bosqich (segment), summa (ikki tutqichli slayder + qo'lda kiritish). Natija soni tugmada: "12 ta loyihani ko'rsatish" (real hisob, uydirma emas).
- Desktop: chap tomonda tor vertikal rels (ikonalar + yozuv), markazda to'r, o'ngda tokcha.
- Asosiy amalga yo'l: lenta → karta → loyiha sahifasi → pastki yopishqoq "Tadbirkor bilan bog'lanish". Solishtirish yo'li: 2 ta "Tokchaga" → "Solishtirish" (3 bosish).

**Tipografiya:**
- **Bricolage Grotesque** (OFL, o'zgaruvchan shrift, optik o'lcham o'qi bor) — sarlavhalar va kartadagi summa. Katta o'lchamda xarakterli, jonli; "rasmiy bank" ohangidan uzoqlashtiradi va tadbirkorlik energiyasini beradi.
- **Atkinson Hyperlegible Next** (OFL) — matn, forma yorliqlari, interfeys. Kichik ekranda o'xshash belgilarni (1/l/I, 0/O) aniq ajratadi — summa va forma maydonlari uchun muhim.
- Juftlik mantig'i: ifodali sarlavha + maksimal o'qiluvchan matn. Summa raqamlari uchun `font-variant-numeric: tabular-nums` (solishtirish ekranida tekislanish uchun).
- Shkala (mobil, 1.333 nisbat, katta kontrast): 14 / 16 / 21 / 28 / 37px. Kartadagi summa 28px, sarlavha 21px.
- Xarakter: qalin (700) qisqa sarlavhalar, matn 400, yorliqlar 600.

**Vizual materiallar:**
- Palitra (asos):
  - `#FBF7F0` — fon (fil suyagi)
  - `#22201C` — matn va asosiy tugma (qora pill tugma, oq yozuv)
  - `#FFD23F` — tokcha va "saqlangan" belgisi (yagona yorqin aksent)
  - `#8A847A` — "Namuna" belgisi (punktir ramka) va ikkinchi darajali matn
  - `#E9E2D6` — karta chegaralari va bo'sh holatlar
- Soha ranglari (kartaning "bosh" qismi va chiplar uchun; har biri oq matn bilan kamida 4.5:1 kontrastga tekshiriladi):
  - Qishloq xo'jaligi `#3F7D3A` · Ishlab chiqarish `#3D5A99` · Savdo `#B5502A` · IT va raqamli xizmatlar `#6A3FB5` · Xizmatlar `#0E7490` · Turizm va ovqatlanish `#A8325E` · Qurilish `#6B635A` · Ta'lim va sog'liq `#8A6A12`
- Tasvirlar: fotosurat faqat tadbirkor yuklagan bo'lsa. Yuklamaganlarda — monogramma (bosh harflar Bricolage 700) + soha ikonasi. Natijada rasmsiz kartalar ham "to'liq" ko'rinadi va soha rangidan lenta tez skanerlanadi.
- Ikonalar: soha uchun 8 ta oddiy chiziqli ikona (masalan: ochiq kodli Lucide yoki Tabler to'plamidan, 2px chiziq). Raketa/grafik/qo'l siqish ikonalari ishlatilmaydi.
- "Namuna": karta bosh qismining burchagida punktir ramkali "Namuna" yorlig'i; soha rangiga qaramay doimo oq fonda.
- Maxfiylik: loyiha sahifasida qulf ikonali kulrang blok "Aloqa so'rov qabul qilingach ko'rinadi".
- Harakat: "Tokchaga" bosilganda karta miniaturasi pastki tasmaga 250ms da "uchib" tushadi (amal natijasini ko'rsatadi); solishtirishdagi ikkinchi ustun scroll-snap bilan almashadi. `prefers-reduced-motion` da hammasi o'chadi.

**Asosiy amal oqimi:**
- Investor: bosh sahifa → soha chipini bosish → lentani varaqlash → 2–3 kartani "Tokchaga" → pastki tasma "Solishtirish" → yonma-yon maydonlar → bittasini ochish → "Tadbirkor bilan bog'lanish" → kirish → xabar → "Kabinet" tabida holat kartochkasi (rangli holat yorlig'i).
- Tadbirkor: "Joylash" tabi → ro'yxatdan o'tish → 4 qadamli forma, har qadam alohida ekran (1. Biznes; 2. Soha, hudud, bosqich; 3. Summa va mablag'dan foydalanish; 4. Hamkorlik sharti + ixtiyoriy rasm), har qadamda avtomatik qoralama → yakunda kartaning jonli ko'rinishi (preview) → "Nashr qilish".

**Briefga bog'liqlik:**
- "Telefonda solishtirish" → tokcha + ikki ustunli solishtirish ekrani; pastki tab-panel bosh barmoq zonasida.
- "Investor qiziqqan loyihalarni saqlab qo'ya olsin" → saqlash funksiyasi markaziy navigatsiya elementiga aylantirildi.
- "Rasm qo'shish ixtiyoriy" → monogramma + soha rangi tizimi, rasm yo'qligi kamchilik bo'lib ko'rinmaydi.
- "Bosh sahifada ikki asosiy amal" → ikki katta plitka birinchi ekranda.
- Tadbirkorlar texnik bilimi turlicha → formani qadamlarga bo'lish va jonli preview.

**Kuchli tomonlari / xavflari:**
- Kuchli: eng "mobil-tabiiy" va jalb qiluvchi; solishtirish aniq vosita sifatida bor; rasmsiz e'lonlar uchun eng yaxshi yechim.
- Xavf: bir ekranda kam loyiha (1–1.5 ta), uzoq ro'yxatda skanerlash sekinroq; 8 ta soha rangi brendni "olachipor" qilishi mumkin; soha ro'yxati o'zgarsa rang tizimini qayta ko'rish kerak.

---

## Konsepsiya C — "Gap-filtr va hududlar"
**G'oya (1–2 jumla):** Qidiruv shakl emas, o'zbekcha gap: "Men [Qishloq xo'jaligi] sohasida, [Samarqand viloyati]da, [50 000 USD] gacha loyiha izlayman". Natijalar ostida jurnal sahifasidagi qisqa maqolalar kabi o'qiladi, hudud bo'yicha qidirish uchun esa sxematik hudud xaritasi bor.

**Kompozitsiya:**
- Birinchi ekran qorong'i fonda: tepada matnli nom va bitta "Menyu" tugmasi. Markazda emas, chapga tekislangan katta serif gap-filtr (har bir to'rtburchak qavs ichidagi so'z — bosiladigan tanlov). Gap ostida ikki asosiy amal matnli, tagiga chizilgan katta havolalar sifatida: "Loyihalarni ko'rish ↓" va "Biznesimga investor topish →".
- Gap ostidan darhol natijalar boshlanadi — kartalar emas, **jurnal yozuvlari**: chapda kichik yorliq "Soha · Hudud", serif sarlavha (biznes nomi), 2 qatorli tavsif, ostida bitta qatorda "Izlanmoqda: 40 000 USD · Bosqich: ishlayotgan biznes". Yozuvlar ingichka gorizontal chiziqlar bilan ajratilgan, bir ustunli, keng chetlar.
- Alternativ ko'rinish "Xaritada": O'zbekistonning 14 hududi teng olti burchaklar (hex) bilan sxematik joylashtirilgan (geografik aniq emas, tanib bo'ladigan). Hududni bosish → gapdagi hudud so'zi shunga almashadi va ro'yxat yangilanadi. Hex ichida faqat hudud nomining qisqartmasi; sonlar ko'rsatilmaydi (boshlang'ich davrda sonlar "Namuna" e'lonlari bilan aralashib chalg'itmasin).
- Loyiha sahifasi: uzun o'qiladigan maqola formati — kirish abzatsi, "Mablag' nimaga ketadi" (bandlar, har biri summa bilan), "Tadbirkorning taklifi" (iqtibos uslubidagi blok). Desktopda o'ng tomonda yopishqoq qisqa ma'lumot qutisi (summa, hudud, bosqich, bog'lanish tugmasi).
- Ritm: keng, havodor; mobil chetlar 20px, abzatslar orasida 1.5 qator. Zichlik past, lekin har yozuv to'liq o'qiladi.

**Navigatsiya (desktop / mobil):**
- Mobil: yagona "Menyu" tugmasi **to'liq ekranli menyu** ochadi (Loyihalar, Saqlanganlar, Loyiha joylash, Kabinet, Kirish) — katta serif bandlar. Tab-panel yo'q, ekran kontentga to'liq beriladi.
- Asosiy navigatsiya vositasi — gap-filtr: so'zni bosish → shu maydon uchun to'liq ekranli tanlov ro'yxati (qidiruvli). Skroll paytida gap ixcham satrga aylanib tepada yopishib qoladi: "Qishloq xo'jaligi · Samarqand · ≤50k".
- Solishtirish: loyiha sahifasida "Qisqa ro'yxatga qo'shish". Qisqa ro'yxatdagi loyihalar sahifasida **chapga-o'ngga surish** bilan bir loyihadan boshqasiga o'tiladi; barcha sahifalarda bo'limlar bir xil tartibda va bir xil joyda turadi, ma'lumot qutisi qotib qoladi — investor "varaqlab" solishtiradi. Desktopda qisqa ro'yxat ikki maqolani yonma-yon ochadi.
- Desktop: tepada gorizontal panel: nom, gap-filtr ixcham holatda, "Saqlanganlar", "Kirish". To'liq ekran menyu ishlatilmaydi.
- Asosiy amalga yo'l: gapdagi 1–3 so'zni tanlash → yozuvni ochish → "Tadbirkor bilan bog'lanish". 

**Tipografiya:**
- **Literata** (OFL, o'zgaruvchan, optik o'lcham o'qi bilan; ekranda uzoq o'qish uchun yaratilgan) — gap-filtr, sarlavhalar va tavsif matni. Serif loyiha tavsifini "e'lon" emas, jiddiy hujjat/hikoya sifatida o'qitadi, ishonchni bezaksiz oshiradi.
- **Archivo** (OFL, kenglik o'qi bor) — yorliqlar, tugmalar, raqamlar uchun SemiCondensed kengligida. Tor ekranda "Izlanmoqda: 40 000 USD · Bosqich: ..." qatori bir satrga sig'adi.
- Juftlik mantig'i: o'qiladigan matn = serif, boshqariladigan element = siqiq grotesk. Foydalanuvchi qaysi matn bosiladi, qaysi o'qiladi — shriftdan farqlaydi.
- Shkala (mobil, 1.25 nisbat, katta yuqori qism): matn 17px (serif uchun biroz kattaroq), 13 / 17 / 21 / 27 / 34px; gap-filtr 27–34px. Desktop: gap-filtr 48px gacha.
- Xarakter: gap-filtrdagi tanlanadigan so'zlar kursiv + pastki chiziq; sarlavhalar Literata 600, matn 400; Archivo faqat 500 va 700, bosh harflar bilan yorliqlar.

**Vizual materiallar:**
- Palitra (qorong'i asos — telefonda kechki ko'rish va OLED ekranlar uchun; yorug' rejim ham bo'ladi):
  - `#14171F` — fon
  - `#1E2230` — yuza (ma'lumot qutisi, bottom sheet)
  - `#ECE8E1` — asosiy matn
  - `#9AA0B4` — ikkinchi darajali matn, "Namuna" belgisi
  - `#F2A65A` — amal rangi (gap-filtrdagi so'zlar, "Bog'lanish" tugmasi) — o'rik rangi
  - hex xarita tonlari: `#2B3A67` (oddiy) → `#4E63A8` (hover) → `#F2A65A` (tanlangan)
  - `#6FCF97` qabul qilindi / `#EB7A6B` rad etildi
  - Yorug' rejim: fon `#F7F5F0`, matn `#1A1C22`, amal rangi `#B5651D` (kontrast uchun to'qroq)
- Tasvirlar: asosiy vizual — tipografiyaning o'zi va hex hudud xaritasi (loyiha ichida SVG sifatida chiziladi). Fotosurat faqat loyiha sahifasida, maqola ichida keng ramkada; katalog yozuvlarida rasm yo'q.
- Ikonalar: minimal, faqat strelkalar (↓ →), qulf va xatcho'p. Ikat/suzani naqshlari va milliy bezaklar ataylab ishlatilmaydi.
- "Namuna": yozuv yorlig'i oldida kursiv kichik "Namuna —" so'zi va butun yozuvning chap tomonida ingichka punktir vertikal chiziq.
- Maxfiylik: ma'lumot qutisida "Aloqa: so'rov qabul qilingach" satri.
- Harakat: gap so'zi almashganda ro'yxat yumshoq so'nib-yonib yangilanadi (180ms); hex tanlanganda rang to'ldiriladi; sahifalar orasida surish ishorasi. `prefers-reduced-motion` hurmat qilinadi.

**Asosiy amal oqimi:**
- Investor: bosh sahifa → gapdagi "[soha]" so'zini bosish → tanlash → (yoki "Xaritada" → hududni bosish) → ro'yxatdan yozuvni ochish → "Qisqa ro'yxatga" → boshqasini ham → qisqa ro'yxatda surib solishtirish → "Tadbirkor bilan bog'lanish" → kirish → xabar → kabinetda "Mening so'rovlarim" xronologik ro'yxati.
- Tadbirkor: "Biznesimga investor topish →" → ro'yxatdan o'tish → forma ham gap tamoyilida boshlanadi ("Biznesim [soha] sohasida, [hudud]da, [bosqich] bosqichida") → keyin uzun matn maydonlari (tavsif, mablag'dan foydalanish, hamkorlik sharti) maqola tahrirchisi ko'rinishida → "Qoralama" / "Nashr qilish".

**Briefga bog'liqlik:**
- "Soha, hudud, bosqich, summa bo'yicha saralash" → to'rt filtr bitta o'zbekcha gapga birlashtirildi: mobil ekranda filtr paneli joy egallamaydi va o'zbek tili interfeysning tabiiy qismiga aylanadi.
- "O'zbekiston bozori", "hudud" filtri → hududni vizual tanlash (hex xarita).
- "Batafsil tavsif, mablag'dan foydalanish rejasi, hamkorlik taklifi" → loyiha sahifasi o'qiladigan maqola, serif matn.
- "Uydirma statistika yo'q" → xaritada sonlar yo'q, ishonch tipografika orqali quriladi.
- "Telefonda solishtirish" → bir xil tuzilishli sahifalar orasida surish.

**Kuchli tomonlari / xavflari:**
- Kuchli: eng o'ziga xos va esda qoladigan; o'zbek tilidan interfeys sifatida foydalanadi; uzun tavsiflar sifatli o'qiladi; filtrlar joy egallamaydi.
- Xavf: gap-filtr grammatikasi (qo'shimchalar: "-da", "-dagi") har bir tanlovda to'g'ri qolishi kerak — matnlarni ehtiyotkorlik bilan yozish lozim; surib solishtirish bir vaqtda faqat bitta loyihani ko'rsatadi; qorong'i fon kunduzi quyoshda yomonroq o'qiladi (yorug' rejim zarur); summa bo'yicha tartiblash gapda ikkinchi darajali bo'lib qoladi.

---

## Farqlanish matritsasi
| O'q | A — "Reestr" | B — "Tokcha" | C — "Gap-filtr va hududlar" |
|---|---|---|---|
| Kompozitsiya | Hero yo'q; zich jadval-qatorlar, ekranda 8–9 loyiha; summa bitta o'ng ustunda; hujjat uslubidagi raqamlangan loyiha sahifasi | Ikki katta amal plitkasi + bir ustunli katta kartalar lentasi (ekranda ~1 karta); ikki ustunli yonma-yon solishtirish ekrani | Qorong'i fonda katta serif gap-filtr; ostida jurnal yozuvlari; alternativ hex hudud xaritasi; maqola formatidagi loyiha sahifasi |
| Navigatsiya | Yopishqoq yuqori panel + ustun sarlavhalari bo'yicha saralash qatori va bottom sheet filtrlar; saqlanganlar = reestr filtri | Pastki tab-panel (4 band) + suzuvchi "Solishtirish" tasmasi; to'liq balandlikdagi filtr sheet; desktopda chap rels | Yagona "Menyu" → to'liq ekran menyu; navigatsiya gap ichidagi bosiladigan so'zlar orqali; qisqa ro'yxatda surib varaqlash |
| Tipografiya | IBM Plex Sans + IBM Plex Mono; bitta oilaning ikki ovozi; kichik shkala (1.2), maks. 23px | Bricolage Grotesque + Atkinson Hyperlegible Next; ifodali grotesk + maksimal o'qiluvchanlik; katta kontrastli shkala (1.333) | Literata (serif) + Archivo SemiCondensed; o'qiladigan = serif, boshqariladigan = siqiq grotesk; matn 17px, gap 27–48px |
| Vizual materiallar | Qog'oz `#F4F2EC` + siyoh `#16201C` + yagona choy-yashil `#0F5C55`; katalogda rasm yo'q; deyarli ikonsiz; harakat minimal | Fil suyagi `#FBF7F0` + sariq tokcha `#FFD23F` + 8 ta soha rangi; rasm o'rnida avtomatik monogramma; chiziqli soha ikonalari; "uchib tushish" animatsiyasi | Qorong'i `#14171F` + o'rik `#F2A65A` + ko'k hex tonlari; tasvir = tipografika va SVG hex xarita; faqat strelka/qulf ikonlari; yumshoq so'nish va surish |

**O'z-o'zini tekshirish:** to'rt o'qning har birida uchta konsepsiya boshqa-boshqa yechimga ega: zichlik (yuqori / past-kartali / past-matnli), navigatsiya joyi (tepa / past / gap ichida + to'liq ekran), shrift turi (mono+sans / ifodali grotesk + gumanist sans / serif + siqiq grotesk), fon (yorug' issiq qog'oz / yorug' fil suyagi ko'p rangli / qorong'i). A va C ikkalasi ham katalogda rasmsiz, lekin A ma'lumot jadvali (raqam markazda), C esa o'qiladigan matn va xarita (so'z markazda) — vizual tili, rangi va shrifti butunlay farq qiladi. Solishtirish usullari ham uch xil: ustun bo'yicha ko'z bilan (A), yonma-yon maxsus ekran (B), bir xil tuzilishli sahifalar orasida surish (C).

**Tanlov uchun eslatma (briefdagi mezon bo'yicha):** "telefonda topish va solishtirish" mezoniga ko'ra A tez skanerlash va summa bo'yicha solishtirishda, B saqlash va maydonma-maydon solishtirishda kuchliroq; C ko'proq ijodiy va o'qishga yo'naltirilgan, solishtirishda eng zaif. Har uch konsepsiya uchun umumiy majburiy tekshiruv: tanlangan shriftlarda `oʻ gʻ` (U+02BB) va `'` belgilarini tekshirish, "Namuna" belgisining ko'rinishi, ochiq katalogda aloqa ma'lumotlari yo'qligi.
