'use strict';
// Sinov uchun "Namuna" e'lonlari. Bular haqiqiy biznes emas: nomlar va raqamlar
// to'qima bo'lib, interfeysda har doim "NAMUNA" yorlig'i bilan ko'rsatiladi.
// O'chirish: NO_SAMPLES=1 bilan yangi bazada ishga tushiring.

exports.samples = [
  {
    name: 'Quritilgan meva sexi',
    sector: 'oziq-ovqat', region: 'fargona', stage: 'ishlayotgan',
    summary: 'O‘rik va olxo‘rini quritib, 250–500 grammli qadoqlarda do‘konlarga yetkazadi.',
    description: 'Sex ikki yildan beri mavsumiy ishlaydi: yozda mahalliy fermerlardan meva olinadi, quyosh va elektr quritgichlarda quritiladi, keyin qo‘lda saralanib qadoqlanadi.\n\nHozircha mahsulot viloyatdagi do‘konlarga sotiladi. Yangi quritgich liniyasi bilan sex yil bo‘yi ishlashi va Toshkentdagi savdo tarmoqlariga chiqishi rejalashtirilgan.',
    amount: 45000,
    use: 'Elektr quritgich liniyasi — 60%\nQadoqlash uskunasi — 25%\nAylanma mablag‘ (xomashyo) — 15%',
    terms: 'Investorga biznesdagi 20% ulush taklif qilinadi. Foyda har chorakda ulushga mos ravishda taqsimlanadi. Investor yirik xaridlar bo‘yicha qarorlarda ishtirok etadi.',
  },
  {
    name: 'Issiqxona: yil bo‘yi pomidor',
    sector: 'qishloq', region: 'samarqand', stage: 'kengaytirish',
    summary: '0,5 gektarlik issiqxonada pomidor yetishtiradi, maydonni 1,5 gektarga kengaytirmoqchi.',
    description: 'Issiqxona tomchilatib sug‘orish tizimi bilan jihozlangan. Hosil ulgurji bozorlarga va restoranlarga sotiladi.\n\nKengaytirish uchun yer maydoni mavjud, loyiha hujjatlari tayyorlangan.',
    amount: 180000,
    use: 'Issiqxona konstruksiyasi va plyonka — 55%\nIsitish tizimi — 30%\nKo‘chat va o‘g‘itlar — 15%',
    terms: 'Qarz ko‘rinishida: 3 yil muddatga, yillik foiz kelishiladi. Birinchi 6 oy imtiyozli davr. Garov sifatida issiqxona uskunasi taklif etiladi.',
  },
  {
    name: 'Bolalar uchun robototexnika to‘garagi',
    sector: 'talim', region: 'toshkent-sh', stage: 'boshlangich',
    summary: '8–14 yoshli bolalarga konstruktorlar yordamida robototexnika va dasturlash asoslarini o‘rgatadi.',
    description: 'Sinov guruhlari ijaraga olingan xonada o‘tkazildi. Dastur 9 oylik, darslar haftasiga ikki marta.\n\nMablag‘ ikkinchi filial va o‘quv to‘plamlari uchun kerak.',
    amount: 9000,
    use: 'O‘quv konstruktor to‘plamlari\nNoutbuklar (4 dona)\nXona ta’miri va mebel',
    terms: 'Investorga 15% ulush yoki 2 yillik qarz (kelishuv asosida). Tadbirkor oylik hisobotlarni taqdim etadi.',
  },
  {
    name: 'Shahar ichida tez yetkazib berish',
    sector: 'logistika', region: 'andijon', stage: 'ishlayotgan',
    summary: 'Do‘kon va kafelardan buyurtmalarni velokuryerlar orqali shu kunning o‘zida yetkazadi.',
    description: 'Xizmat Andijon shahrida ishlaydi, buyurtmalar Telegram-bot orqali qabul qilinadi. Hamkorlar: mahalliy do‘konlar va kafelar.\n\nMablag‘ elektr skuterlar va buyurtmalarni boshqarish dasturi uchun kerak.',
    amount: 32000,
    use: 'Elektr skuterlar (10 dona) — 70%\nBuyurtmalarni boshqarish dasturi — 20%\nMarketing — 10%',
    terms: 'Daromaddan ulush: investor sarmoyasi qaytgunga qadar oylik tushumning 8% ini oladi, keyin 3% ini 2 yil davomida.',
  },
  {
    name: 'Mehmonxona: 12 xonali oilaviy uy',
    sector: 'turizm', region: 'buxoro', stage: 'goya',
    summary: 'Eski shahar yaqinidagi uyni sayyohlar uchun 12 xonali oilaviy mehmonxonaga aylantirish.',
    description: 'Bino tadbirkor oilasiga tegishli. Rekonstruksiya loyihasi va smeta tayyorlanmoqda.\n\nMehmonxona milliy taomlar bilan nonushta va ekskursiyalarni tashkil qilishni ham rejalashtiradi.',
    amount: 260000,
    use: 'Rekonstruksiya va kommunikatsiyalar — 65%\nMebel va jihozlar — 25%\nRuxsatnomalar va ochilish xarajatlari — 10%',
    terms: 'Investorga 35% ulush taklif qilinadi. Boshqaruv tadbirkor oilasida qoladi, investor kuzatuv kengashida ishtirok etadi.',
  },
  {
    name: 'Klinikalar uchun navbat tizimi',
    sector: 'it', region: 'toshkent-sh', stage: 'boshlangich',
    summary: 'Xususiy klinikalarga onlayn yozilish va SMS eslatmalar beruvchi bulutli dastur.',
    description: 'Dasturning birinchi versiyasi ikki klinikada sinovdan o‘tmoqda. Obuna modeli: klinika oylik to‘lov qiladi.\n\nMablag‘ jamoani kengaytirish va savdo uchun kerak.',
    amount: 75000,
    use: 'Dasturchilar maoshi (12 oy) — 60%\nServer va xavfsizlik — 15%\nSavdo va namoyishlar — 25%',
    terms: 'Konvertatsiya qilinadigan qarz yoki 12% ulush. Shartlar investor bilan alohida kelishiladi.',
  },
  {
    name: 'G‘isht zavodi uchun yangi pech',
    sector: 'qurilish', region: 'qashqadaryo', stage: 'kengaytirish',
    summary: 'Pishiq g‘isht ishlab chiqaruvchi korxona yoqilg‘ini tejaydigan yangi pech o‘rnatmoqchi.',
    description: 'Korxona 6 yildan beri ishlaydi, mahsulot viloyatdagi qurilish kompaniyalariga sotiladi. Yangi pech yoqilg‘i sarfini kamaytirishi va mavsumiylikni qisqartirishi kutilmoqda.',
    amount: 420000,
    use: 'Tunnel pech — 75%\nMontaj va ishga tushirish — 15%\nXodimlarni o‘qitish — 10%',
    terms: 'Investorga 25% ulush yoki lizing sxemasi. Moliyaviy hujjatlar so‘rov asosida taqdim etiladi.',
  },
  {
    name: 'Tikuvchilik sexi: ish kiyimlari',
    sector: 'ishlab-chiqarish', region: 'namangan', stage: 'ishlayotgan',
    summary: 'Zavod va qurilish kompaniyalari uchun buyurtma asosida ish kiyimlari tikadi.',
    description: 'Sexda 14 ta tikuv mashinasi bor. Buyurtmalar mavsumga qarab o‘zgaradi. Yangi uskuna bilan katta buyurtmalarni o‘z vaqtida bajarish mumkin bo‘ladi.',
    amount: 28000,
    use: 'Avtomatik bichish stoli — 50%\nYangi tikuv mashinalari — 35%\nMatoga aylanma mablag‘ — 15%',
    terms: 'Qarz: 18 oy, oylik teng to‘lovlar. Uskuna garov sifatida taklif qilinadi.',
  },
];
