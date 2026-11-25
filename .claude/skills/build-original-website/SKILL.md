---
name: build-original-website
description: Briefdan boshlab original veb-sayt yaratadi — concept-designer (3 ta farqli konsepsiya), creative-director (tanlov va asos), frontend-builder (qurish) va design-reviewer (brauzerda mobil/desktop tekshiruv) agentlarini shu tartibda ishga tushiradi. Foydalanuvchi yangi sayt, landing sahifa yoki veb-sahifa uchun brief berganda ishlating.
argument-hint: "[brief matni yoki brief fayliga yo'l]"
---

# Original veb-sayt yaratish

Bu skill bitta loyiha uchun to'rt bosqichli jarayonni boshqaradi. Siz (asosiy sessiya)
orkestratorsiz: bosqichlarni o'zingiz bajarmaysiz, har birini tegishli subagentga
**Agent** vositasi orqali topshirasiz va natijalarni fayllar orqali keyingi bosqichga
uzatasiz.

Kirish: `$ARGUMENTS` — brief matni yoki brief fayliga yo'l. Bo'sh bo'lsa, foydalanuvchidan
brief so'rang.

## O'zgarmas qoidalar

1. **Dizayn qarorlari faqat shu loyiha briefidan chiqadi.** Hech bir agentga doimiy rang,
   shrift, uslub, komponent kutubxonasi yoki sahifa maketini bermang va o'zingiz ham
   taklif qilmang. Agent promptlariga faqat brief va oldingi bosqich fayllarining
   yo'llarini bering.
2. Har bir loyiha o'z papkasida: `projects/<slug>/`. Boshqa loyihalarning fayllarini
   namuna sifatida uzatmang.
3. Bosqichlar ketma-ket bajariladi; keyingisi oldingisi faylini yozib bo'lgachgina boshlanadi.
4. Subagent natijasini foydalanuvchiga yetkazish sizning vazifangiz — subagent javobi
   foydalanuvchiga avtomatik ko'rinmaydi.

## 0-bosqich. Tayyorgarlik

1. Briefdan qisqa lotin harfli `slug` yasang (masalan, `bakery-landing`). Shunday papka
   mavjud bo'lsa, yangi nom tanlang yoki foydalanuvchidan davom ettirish kerakmi deb so'rang.
2. `projects/<slug>/brief.md` ga briefni **o'zgartirmasdan** yozing.
3. Briefda quyidagilar umuman bo'lmasa, foydalanuvchiga bitta ixcham savollar ro'yxati
   bilan murojaat qiling: auditoriya, biznes maqsadi, asosiy foydalanuvchi amallari,
   til(lar), majburiy kontent yoki brend materiallari. Javob kelmasa yoki foydalanuvchi
   "o'zing hal qil" desa, davom eting — taxminlar concept-designer tomonidan ochiq yoziladi.

## 1-bosqich. Konsepsiyalar — `concept-designer`

Agent vositasini `subagent_type: "concept-designer"` bilan chaqiring. Promptda bering:
- brief fayli yo'li: `projects/<slug>/brief.md`;
- natija fayli: `projects/<slug>/concepts.md`;
- vazifa: kompozitsiya, navigatsiya, tipografiya va vizual materiallar bo'yicha bir-biridan
  farq qiladigan 3 ta konsepsiya.

Tekshiring: fayl mavjud, 3 ta konsepsiya va farqlanish matritsasi bor. Agar ikkita
konsepsiya biror o'qda deyarli bir xil bo'lsa, agentni o'sha o'q bo'yicha qayta ishlashga
bir marta qayta chaqiring.

## 2-bosqich. Tanlov — `creative-director`

`subagent_type: "creative-director"`. Promptda bering:
- `projects/<slug>/brief.md` va `projects/<slug>/concepts.md`;
- natija fayli: `projects/<slug>/decision.md`.

Foydalanuvchiga qisqa xabar bering: 3 ta konsepsiyaning bir qatorlik mazmuni, tanlangan
konsepsiya va asosiy sabab. Agar foydalanuvchi oldindan "tanlovni men qilaman" degan
bo'lsa, shu yerda to'xtab, uning tanlovini kuting va `decision.md` ga yozdiring.

## 3-bosqich. Qurish — `frontend-builder`

`subagent_type: "frontend-builder"`. Promptda bering:
- `brief.md`, `concepts.md`, `decision.md` yo'llari;
- kod papkasi: `projects/<slug>/site/`;
- talab: lokal ishga tushirish buyrug'ini va portni qaytarish.

## 4-bosqich. Tekshiruv — `design-reviewer`

`subagent_type: "design-reviewer"`. Promptda bering:
- `brief.md`, `concepts.md`, `decision.md` yo'llari;
- frontend-builder qaytargan ishga tushirish buyrug'i / URL;
- hisobot fayli: `projects/<slug>/review/review.md`, raund raqami.

## Tuzatish sikli

- Hisobotda holat "TUZATISH KERAK" bo'lsa, `frontend-builder` ni hisobot yo'li bilan qayta
  chaqiring (faqat topilmalarni tuzatish), so'ng `design-reviewer` ni keyingi raund bilan
  qayta chaqiring.
- Ko'pi bilan **2 ta tuzatish raundi**. Shundan keyin ham Kritik/Muhim topilmalar qolsa,
  to'xtang va ularni foydalanuvchiga ochiq ayting.

## Yakuniy hisobot foydalanuvchiga

Qisqa yozing:
- tanlangan konsepsiya va nega u tanlangani (1–2 jumla);
- sayt papkasi va ishga tushirish buyrug'i;
- tekshiruv holati, qolgan topilmalar (bo'lsa) va skrinshotlar papkasi;
- almashtirilishi kerak bo'lgan o'rinbosar materiallar;
- loyiha fayllari: `brief.md`, `concepts.md`, `decision.md`, `review/review.md`.
