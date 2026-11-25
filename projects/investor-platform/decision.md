# Qaror: Investor platformasi (nomi hali tanlanmagan)

## Tanlangan konsepsiya: A — "Reestr"

## Nega aynan shu
- **Auditoriyaga mosligi:** investor telefonda o'nlab loyihani ko'zdan kechirib, summa, hudud va bosqich bo'yicha tez saralashi kerak. Reestr bir ekranda boshqa konsepsiyalarga qaraganda 4–6 barobar ko'p loyiha ko'rsatadi (B da ~1 ta karta, C da 2–3 ta yozuv sig'adi), summalar esa bitta o'ng ustunda tekislanib turadi. Tadbirkor uchun hujjat ohangi va raqamlangan forma tushunarli; marketing bezaklari yo'qligi briefdagi "uydirma statistika yo'q" talabiga to'g'ridan-to'g'ri mos keladi.
- **Biznes maqsadiga xizmati:** v1 maqsadi — birinchi aloqa (topish → "Tadbirkor bilan bog'lanish" → qabul qilinishi). A da bu yo'l eng qisqa: bosh sahifadagi reestr → qator → pastki yopishqoq tugma. Loyiha sahifasi oxirida "4. Bog'lanish" bo'limi bor, shuning uchun sahifa o'zi bog'lanish amaliga olib boradi.
- **Asosiy amallarga ta'siri:** briefdagi hal qiluvchi mezon "loyihalarni telefonda topish va solishtirish". Topishda A yaqqol oldinda (zichlik, ustun bo'yicha tartiblash, yopishqoq filtr qatori). Solishtirish "Faqat saqlanganlar" kalitchasi orqali ishlaydi: saqlangan loyihalar o'sha ustunlarda tekislanib qoladi. Shuningdek, A amalga oshirish uchun eng sodda va eng yengil konsepsiya (katalogda rasm yo'q, animatsiya deyarli yo'q). Bu sekin mobil tarmoq va ishlaydigan v1 talabi uchun muhim.

## Baholash
Ballar: 1–5. Vaznli jami = Σ(ball × vazn).

| Mezon (vazn) | A — "Reestr" | B — "Tokcha" | C — "Gap-filtr va hududlar" |
|---|---|---|---|
| Telefonda loyihalarni topish va saralash: soha / hudud / bosqich / summa, bir qarashda ko'p loyiha (25%) | 5 — ekranda 6–9 loyiha, summa bitta ustunda, yopishqoq filtr qatori, summa ↑/↓ tartiblash | 3 — filtr sheet kuchli va natija soni real, lekin ekranda ~1 karta bor, uzun ro'yxatni skanerlash sekin | 3 — gap-filtr joy tejaydi, lekin zichlik past, summa bo'yicha tartiblash ikkinchi darajada qolgan, gap grammatikasi chalg'itishi mumkin |
| Telefonda saqlash va solishtirish (20%) | 4 — "Faqat saqlanganlar" qatorlari ustunlarda tekislanadi; summa / hudud / bosqich bir qarashda solishtiriladi, lekin mablag'dan foydalanish va hamkorlik shartini ko'rish uchun har birini ochish kerak | 5 — tokcha va maydonma-maydon yonma-yon ekran, hamkorlik sharti ham solishtiriladi | 2 — bir vaqtning o'zida faqat bitta loyiha ko'rinadi, foydalanuvchi oldingisini xotirada ushlab solishtiradi |
| Asosiy amallarni bajarish osonligi, mobil va desktop: ikki asosiy amal, bog'lanish, joylash, so'rov holati (20%) | 4 — ikki amal birinchi ekranda, reestr darhol ko'rinadi, bog'lanish 2 bosishda; bir sahifali uzun forma mobilda og'irroq | 5 — katta plitkalar, bosh barmoq zonasidagi tab-panel, avtomatik qoralama bilan 4 qadamli forma | 3 — navigatsiya yashirin menyuda, gap-filtr odatiy bo'lmagan boshqaruv; tadbirkor formasi ham gap ko'rinishida |
| O'qiluvchanlik va kirish imkoniyati: kontrast, shrift o'lchami, klaviatura (15%) | 4 — kontrastlar o'tadi, harakat minimal; 12px ikkinchi darajali matnni kattalashtirish kerak (pastda aniqlik kiritilgan) | 4 — Atkinson Hyperlegible kuchli; `#8A847A` fil suyagi fonida ~3.6:1, ikkinchi darajali matn uchun yetarli emas; animatsiya ko'p | 3 — 17px matn yaxshi, lekin qorong'i fon quyoshda yomon o'qiladi; hex xarita va surib solishtirish klaviatura/ekran o'quvchi uchun qo'shimcha yechim talab qiladi |
| Kontent mosligi: rasmsiz e'lonlar, "nima / qayerda / qancha", "Namuna", maxfiylik, uydirma statistika va siyqa yechimlarsiz (10%) | 5 — qatorning har satri aynan shu uch savolga javob beradi; katalogda rasm yo'q, notekislik bo'lmaydi | 4 — monogramma rasmsiz holatni yaxshi hal qiladi; 8 soha rangi "olachipor" bo'lib ketishi mumkin | 4 — matnga asoslangan va halol; "nima qiladi" 2 qatorda yaxshi, summa esa uchinchi qatorga tushib qolgan |
| Texnik va kontent cheklovlariga mos amalga oshirish: ishlaydigan v1, sekin tarmoq, ≤2 shrift oilasi, `oʻ gʻ`, nom bitta joydan (10%) | 5 — eng sodda maket, katalogda media yo'q, Plex Latin Extended qamrovi keng | 3 — solishtirish ekrani, soha ranglari tizimi (soha ro'yxatiga bog'langan), "uchib tushish" animatsiyasi qo'shimcha ish talab qiladi | 2 — har tanlovda gap grammatikasi to'g'ri qolishi kerak, SVG hex xarita, ikkala rang rejimi, surish ishoralari — v1 uchun xavfli hajm |
| **Vaznli jami** | **4.45** | **4.05** | **2.80** |

Hisob: A = 1.25 + 0.80 + 0.80 + 0.60 + 0.50 + 0.50; B = 0.75 + 1.00 + 1.00 + 0.60 + 0.40 + 0.30; C = 0.75 + 0.40 + 0.60 + 0.45 + 0.40 + 0.20.

A va B orasidagi farq (0.40) katta emas. Shuning uchun eng og'ir vaznli mezon — telefonda topish (25%) — hal qiluvchi bo'ldi, unda A 5 ball, B esa 3 ball oldi. B solishtirishda kuchliroq, lekin solishtirish uchun avval loyihani topish kerak. Brief ham topishni birinchi o'ringa qo'yadi ("Bosh sahifadayoq loyihalarni ko'rish", "kartada darhol ko'rinsin").

## Tanlanmaganlar
- **B — "Tokcha":** solishtirish va mobil navigatsiyada eng yaxshi konsepsiya. Lekin ekranda bitta karta bo'lgani uchun loyihalar ko'paygan sari topish sekinlashadi. Soha ranglari tizimi, animatsiya va alohida solishtirish ekrani v1 hajmini oshiradi, ikkinchi darajali matn kontrasti ham yetarli emas.
- **C — "Gap-filtr va hududlar":** eng o'ziga xos konsepsiya, uzun tavsiflarni o'qish uchun ham yaxshi. Ammo hal qiluvchi mezonda — telefonda solishtirishda — eng zaif (bir vaqtda bitta loyiha ko'rinadi). Qorong'i fon kunduzi o'qilishini qiyinlashtiradi, gap grammatikasi va hex xarita esa v1 uchun texnik xavf tug'diradi.

## Quruvchi uchun yo'riqnoma

### Albatta saqlanishi kerak bo'lgan elementlar
- **Hero yo'q.** Birinchi ekranda: matnli platforma nomi → ikki amalning teng kenglikdagi segmentli tugmasi ("Loyihalarni ko'rish" | "Biznesimga investor topish") → darhol reestr. Ikki amal tugmasi va reestrning birinchi qatori 360×640 ekranda skrollsiz ko'rinsin.
- **Reestr qatori (mobil):** nom (Plex Sans 600) + o'ngga tekislangan summa (Plex Mono) / "soha · hudud · bosqich" / "nima qiladi" (1 qator, kesilgan). Qatorlar ingichka `#D6D1C6` chiziq bilan ajratiladi.
- **Desktop:** haqiqiy jadval — Nom | Soha | Hudud | Bosqich | Summa | Saqlash. Filtr paneli jadval tepasida bitta qatorda, o'ngda "Saqlanganlar (n)".
- **Mobil navigatsiya:** yopishqoq yuqori panel (nom, qidiruv, "Kirish"/"Kabinet") va uning ostida yopishqoq saralash qatori "Soha ▾ Hudud ▾ Bosqich ▾ Summa ▾". Har biri pastdan chiquvchi panel (bottom sheet) ochadi.
- **Saqlanganlar = reestr filtri:** "Faqat saqlanganlar" kalitchasi. Alohida solishtirish vositasi qurilmaydi.
- **Loyiha sahifasi:** raqamlangan bo'limlar "1. Biznes haqida", "2. Mablag'dan foydalanish" (bandlar yoki foizli jadval, grafik emas), "3. Hamkorlik sharti", "4. Bog'lanish". Mobilda pastda yopishqoq "Tadbirkor bilan bog'lanish" tugmasi turadi. Rasm (bo'lsa) faqat shu sahifada, matndan keyin, 4:3 ramkada ko'rsatiladi.
- **Shriftlar:** faqat IBM Plex Sans (400, 600) va IBM Plex Mono (summa, sana, so'rov holati). Boshqa oila qo'shilmaydi.
- **Palitra (o'zgartirilmaydi):** fon `#F4F2EC`, matn `#16201C`, ikkinchi darajali matn `#6B6F69`, chiziq `#D6D1C6`, amal rangi `#0F5C55` (ustida oq matn), "Namuna" va rad etilgan holat `#B4471F`, qabul qilingan holat `#2F7D4F`.
- **"Namuna" yorlig'i:** qator boshida to'rtburchak ramkali "NAMUNA" yozuvi (mono, zang rangida). U katalog qatorida ham, loyiha sahifasida ham ko'rinadi.
- **Ikonalar:** saqlash uchun yulduzcha va ▾ strelka. Qolgan hammasi matn bilan beriladi.
- **Harakat:** qatorlar almashishi 120ms, bottom sheet 200ms. `prefers-reduced-motion` yoqilganda bular ham o'chadi.

### Aniqlik kiritilgan joylar (va sababi)
1. **Mobil qator balandligi.** Konsepsiyada "2 satr, ~64px" deyilgan, lekin unga uchinchi "nima qiladi" satri ham qo'shilgan. Uch satr 64px ga sig'maydi. Qaror: qator uch satrli, balandligi ~84–88px, ekranda ~6–7 loyiha. *Sabab:* briefdagi "nima, qayerda, qancha darhol ko'rinsin" talabi zichlikdan muhimroq.
2. **Mobilda minimal shrift o'lchami.** "Soha · hudud · bosqich" va "nima qiladi" satrlari 14px dan kichik bo'lmasin. 12px faqat bosh harfli yorliqlar uchun qoladi ("NAMUNA", desktop ustun sarlavhalari). *Sabab:* `#6B6F69` rangi `#F4F2EC` fonida ~4.6:1 kontrast beradi, ya'ni chegarada. Ikkinchi darajali matn uchun 12px o'qiluvchanlik mezoniga to'g'ri kelmaydi.
3. **Holatlar faqat rang bilan berilmaydi.** "Kutilmoqda / Qabul qilindi / Rad etildi" doim matn bilan yoziladi. `#2F7D4F` va `#B4471F` qo'shimcha belgi sifatida ishlatiladi. *Sabab:* `#2F7D4F` fonda ~4.5:1, ya'ni chegarada; rangni ajrata olmaydigan foydalanuvchilar ham holatni tushunishi kerak.
4. **Maxfiylik izohi matni.** Konsepsiyadagi "Aloqa ma'lumotlari faqat tadbirkor so'rovni qabul qilgandan so'ng ochiladi" jumlasi briefda yo'q funksiyani va'da qiladi. Qaror: tavsiya etilgan matn — "Tadbirkorning aloqa ma'lumotlari ochiq ko'rsatilmaydi. Xabaringiz va aloqa ma'lumotingiz faqat loyiha egasiga yuboriladi." Agar quruvchi qabul qilingandan keyin tadbirkor kontaktini investorga ko'rsatishni ham amalga oshirsa, asl matnni qoldirish mumkin. *Sabab:* interfeys faqat haqiqatda ishlaydigan narsani va'da qilishi kerak.
5. **Saqlash akkaunt talab qiladi.** Mehmon yulduzchani bossa, "Saqlash uchun kiring" taklifi chiqadi va kirgandan keyin u o'sha joyga qaytariladi. Saqlanganlar serverda investor akkauntiga bog'lab saqlanadi. *Sabab:* brief saqlashni investor funksiyasi deb belgilaydi va boshqa qurilmadan ham ko'rinishini talab qiladi.
6. **Filtr panelida real natija soni.** Bottom sheet tugmasida "N ta loyihani ko'rsatish" yoziladi (N — haqiqiy hisob). Bu B konsepsiyasidan olingan yagona element. *Sabab:* bo'sh natijaga tushib qolishning oldini oladi, reestr uslubini buzmaydi va uydirma statistika emas.
7. **Tadbirkor formasi mobilda.** Bir sahifali forma va tepadagi 1–4 qadamlar indeksi saqlanadi. Qo'shimcha talablar: pastda yopishqoq "Qoralamani saqlash" va "Nashr qilish" tugmalari; qoralama to'liq bo'lmagan maydonlar bilan ham saqlanadi; nashr qilishda majburiy maydonlar tekshirilib, xatolar maydon yonida ko'rsatiladi. *Sabab:* uzun forma mobilda ma'lumot yo'qotish xavfini tug'diradi.
8. **Klaviatura va ekran o'quvchi.** Desktopda jadval sarlavhalari `<button>` sifatida qilinadi va `aria-sort` oladi. Har qatorda nom haqiqiy havola bo'ladi (butun qatorni bosish ham mumkin). Yulduzcha `aria-pressed` holatli tugma, teginish maydoni ≥44×44px. Bottom sheet fokusni ushlab turadi, Esc va "Yopish" tugmasi bilan yopiladi, yopilgach fokus ochgan tugmaga qaytadi. *Sabab:* kirish imkoniyati mezoni.
9. **Yopishqoq elementlar balandligi.** Yuqori panel ≤56px, saralash qatori ≤44px bo'lsin. Loyiha sahifasida yopishqoq saralash qatori ko'rsatilmaydi, faqat pastki bog'lanish tugmasi qoladi. *Sabab:* kichik telefonda kontentga joy qolishi kerak.
10. **Bo'sh holatlar.** "Loyiha topilmadi — filtrlarni tozalash" va "Hali saqlangan loyiha yo'q" holatlari bo'lsin. Boshlang'ich davrda "NAMUNA" belgili sinov e'lonlari qo'shiladi.
11. **Summa formati.** Ko'rinish "40 000 USD": minglar bo'shliq bilan ajratiladi va o'ngga tekislanadi. Filtr diapazonlari: 10 000 gacha, 10–50 ming, 50–200 ming, 200 ming+.
12. **Shrift tekshiruvi.** Plex Sans va Plex Mono ichida `oʻ gʻ Oʻ Gʻ` (U+02BB) va `ʼ` / `'` (U+02BC / U+2019) belgilari bo'lishi tekshirilsin. Shriftlar o'z serverdan, kerakli subset bilan va `font-display: swap` bilan yuklansin. Interfeys matnlarida apostrof uchun ASCII `'` emas, to'g'ri belgi ishlatilsin.
13. **Platforma nomi.** U bitta konfiguratsiya qiymatidan olinadi va sarlavha, `<title>`, footer hamda xatlarda shu qiymat ishlatiladi. Yuqori panelda uzun nom qisqartirilmay qatorga o'raladi yoki ellipsis bilan kesiladi, ammo tugmalarni siqib chiqarmaydi.

### Sahifalar / bo'limlar ro'yxati
1. **Bosh sahifa** (`/`): nom, ikki amal segmenti, yopishqoq saralash qatori, reestr (mehmon uchun ochiq).
2. **Katalog** (`/loyihalar`): bosh sahifadagi reestrning o'zi, filtrlar URL parametrlarida saqlanadi. "Faqat saqlanganlar" kalitchasi shu yerda.
3. **Loyiha sahifasi** (`/loyihalar/:id`): 1–4 bo'limlar, maxfiylik izohi, "Tadbirkor bilan bog'lanish".
4. **Bog'lanish formasi** (loyiha sahifasida bottom sheet yoki alohida sahifa): qisqa xabar + javob uchun aloqa ma'lumoti (telefon / e-mail / Telegram). Kirish talab qilinadi.
5. **Kirish / Ro'yxatdan o'tish**: rol tanlanadi (tadbirkor / investor). Kirgandan keyin foydalanuvchi boshlagan amaliga qaytariladi.
6. **Tadbirkor kabineti**: "Mening e'lonlarim" jadvali (holati: Qoralama / Nashr qilingan / Yopilgan; amallar: tahrirlash, nashr qilish, yopish) va "So'rovlar" jadvali (loyiha, xabar, investor aloqasi, holat, "Qabul qilish" / "Rad etish" tugmalari).
7. **Loyiha formasi** (yangi / tahrirlash): biznes nomi, soha, hudud (14 birlik), bosqich, qisqa tavsif, summa (USD), mablag' nimaga ishlatilishi, hamkorlik shartlari, ixtiyoriy rasm.
8. **Investor kabineti**: "Mening so'rovlarim" holat jadvali (mono holat yorliqlari) va saqlanganlarga havola.
9. **404 / ruxsat yo'q** sahifalari: oddiy matn va bosh sahifaga havola.

### Tekshiriladigan asosiy foydalanuvchi amallari (design-reviewer uchun)
1. **Mehmon bosh sahifani 360×640 telefonda ochadi.** — Kutilgan natija: ikki amal tugmasi va kamida bitta reestr qatori skrollsiz ko'rinadi. Qatorda nom, summa, "soha · hudud · bosqich" va "nima qiladi" satrlari bor. Sinov e'lonlarida "NAMUNA" yorlig'i ko'rinadi. Hech qayerda uydirma son yoki statistika yo'q.
2. **Mehmon telefonda "Hudud ▾" orqali viloyat tanlaydi, keyin "Summa ▾" bo'yicha kamayish tartibida saralaydi.** — Kutilgan natija: bottom sheet ochiladi, tugmada real natija soni yoziladi, reestr yangilanadi, summalar o'ng ustunda tekislangan holda kamayib boradi. Faol filtr amal rangida belgilanadi.
3. **Investor kirib, 3 ta loyihani yulduzcha bilan saqlaydi va "Faqat saqlanganlar"ni yoqadi.** — Kutilgan natija: faqat 3 ta qator qoladi va ularning summa / hudud / bosqich ustunlari bir-birining ostida tekislanib turadi. Boshqa qurilmadan kirganda ham shu 3 ta loyiha saqlangan bo'ladi. Mehmon yulduzchani bossa, kirish taklifi chiqadi.
4. **Investor loyiha sahifasini ochib, "Tadbirkor bilan bog'lanish" orqali xabar va aloqa ma'lumotini yuboradi.** — Kutilgan natija: tugma mobilda pastda yopishqoq turadi. Sahifada tadbirkorning telefoni yoki e-maili ko'rinmaydi, maxfiylik izohi esa ko'rinadi. Yuborilgandan keyin tasdiq chiqadi va investor kabinetida so'rov "Kutilmoqda" holatida paydo bo'ladi.
5. **Tadbirkor (boshqa akkauntda) "Biznesimga investor topish" orqali ro'yxatdan o'tadi, formani qisman to'ldirib qoralama saqlaydi, keyin to'ldirib nashr qiladi.** — Kutilgan natija: qoralama katalogda ko'rinmaydi, nashr qilingan e'lon esa ko'rinadi. To'ldirilmagan majburiy maydonda nashr qilishga urinilganda xato maydon yonida chiqadi.
6. **Tadbirkor kabinetida kelgan so'rovni qabul qiladi, investor o'z kabinetini yangilaydi.** — Kutilgan natija: so'rov faqat shu loyiha egasida ko'rinadi. Investorda holat matn bilan "Qabul qilindi" deb ko'rsatiladi (yashil rang faqat qo'shimcha belgi). Rad etilganda "Rad etildi" yoziladi.
7. **Tadbirkor e'lonni yopadi.** — Kutilgan natija: e'lon ochiq katalogdan yo'qoladi (yoki "Yopilgan" deb belgilanadi va bog'lanish tugmasi o'chadi), kabinetda holati "Yopilgan" bo'ladi.
8. **Desktopda (≥1280px) faqat klaviatura bilan ishlash:** filtr → ustun bo'yicha tartiblash → qatorni ochish → bog'lanish formasi. — Kutilgan natija: fokus doim ko'rinadi, sarlavha tugmalari `aria-sort` holatini o'zgartiradi, bottom sheet / modal Esc bilan yopiladi va fokus qaytadi.

### Qabul mezonlari
- Bosh sahifada ikki asosiy amal va reestr birinchi ekranda (360×640 va 1280×800).
- Mobil reestr qatorida "nima / qayerda / qancha" uchala savolga javob bor, summalar o'ng ustunda tekislangan (Plex Mono).
- Soha, hudud, bosqich va summa bo'yicha filtrlash hamda summa ↑/↓ tartiblash mobil va desktopda ishlaydi, filtrlar URL da saqlanadi.
- "Faqat saqlanganlar" ishlaydi, saqlanganlar serverda turadi va qurilmalar orasida bir xil ko'rinadi.
- Matn kontrasti ≥4.5:1. Mobilda o'qiladigan matn ≥14px, asosiy matn 16px. Teginish maydonlari ≥44×44px. Barcha amallar klaviatura bilan bajariladi.
- Faqat ikkita shrift oilasi (Plex Sans, Plex Mono) ishlatiladi. `oʻ gʻ ʼ` belgilari o'rinbosar shriftsiz chiqadi.
- Platforma nomi bitta konfiguratsiya qiymatidan olinadi, rasmli logotip yo'q.
- Sinov e'lonlarida "NAMUNA" yorlig'i bor. Uydirma statistika, sharhlar, stok-foto, raketa/grafik ikonkalari, ko'k-oltin palitra yo'q.
- Aloqa ma'lumotlari ochiq katalogda ham, loyiha sahifasida ham ko'rinmaydi. Investorning aloqa ma'lumoti faqat tegishli loyiha egasining kabinetida ko'rinadi.
- So'rov holatlari matn bilan yoziladi (Kutilmoqda / Qabul qilindi / Rad etildi), faqat rangga tayanmaydi.
- Katalog sahifasida rasm yuklanmaydi. Animatsiyalar ≤200ms va `prefers-reduced-motion` ni hurmat qiladi.
- Ikki akkaunt bilan to'liq sinov o'tadi: tadbirkor joylaydi → investor topadi → xabar yuboradi → tadbirkor qabul qiladi → investor natijani ko'radi.
