# claude-website-agents

Claude Code uchun original veb-saytlarni briefdan boshlab yaratadigan agentlar va skill.
Har bir loyihaning ranglari, shriftlari, kompozitsiyasi va navigatsiyasi **shu loyiha
briefidan** chiqariladi — agentlarda doimiy dizayn tizimi yoki shablon yo'q.

## Tarkib

```
.claude/
├── agents/
│   ├── concept-designer.md    # 3 ta farqli konsepsiya (kompozitsiya, navigatsiya, tipografiya, vizual materiallar)
│   ├── creative-director.md   # auditoriya va biznes maqsadiga ko'ra tanlov + asos
│   ├── frontend-builder.md    # tanlangan konsepsiya asosida saytni quradi
│   └── design-reviewer.md     # brauzerda mobil/desktop va asosiy amallarni tekshiradi
└── skills/
    └── build-original-website/
        └── SKILL.md           # agentlarni shu tartibda ishga tushiradi
```

Jarayon:

```
brief → concept-designer → creative-director → frontend-builder → design-reviewer
                                                      ↑                  │
                                                      └── tuzatish (≤2) ─┘
```

Har bir loyiha natijalari `projects/<slug>/` papkasida saqlanadi:
`brief.md`, `concepts.md`, `decision.md`, `site/`, `review/`.

## Talablar

- [Claude Code](https://code.claude.com/docs)
- Node.js 18+ (lokal server va Playwright uchun)
- design-reviewer uchun Playwright va Chromium:

```bash
npm install -D playwright
```

```bash
npx playwright install chromium
```

## O'rnatish

### 1-variant: shu repoda ishlash

```bash
git clone https://github.com/uzumshoxrux-wq/claude-website-agents.git
```

```bash
cd claude-website-agents && claude
```

### 2-variant: mavjud loyihangizga qo'shish

```bash
git clone https://github.com/uzumshoxrux-wq/claude-website-agents.git /tmp/cwa
```

```bash
mkdir -p .claude && cp -r /tmp/cwa/.claude/agents /tmp/cwa/.claude/skills .claude/
```

### 3-variant: barcha loyihalar uchun (foydalanuvchi darajasida)

```bash
mkdir -p ~/.claude && cp -r /tmp/cwa/.claude/agents /tmp/cwa/.claude/skills ~/.claude/
```

Tekshirish: Claude Code ichida `/agents` buyrug'i to'rtta agentni ko'rsatishi kerak,
`/` yozganda esa `build-original-website` skill'i ro'yxatda chiqadi.

## Ishlatish

### Skill orqali (tavsiya etiladi)

```text
/build-original-website Toshkentdagi oilaviy nonvoyxona uchun landing sahifa.
Auditoriya: 25–45 yoshli onalar, asosan telefondan kiradi.
Maqsad: onlayn oldindan buyurtmalarni oshirish.
Asosiy amallar: menyuni ko'rish, buyurtma berish, manzil va ish vaqtini topish.
Til: o'zbek (lotin) va rus. Logotip va 6 ta mahsulot fotosi bor (assets/ papkasida).
```

Yoki briefni faylga yozib, yo'lini bering:

```text
/build-original-website briefs/clinic.md
```

Oddiy so'rov bilan ham ishlaydi — Claude skill tavsifiga qarab uni o'zi tanlaydi:

```text
Shu brief bo'yicha original sayt yarat: briefs/clinic.md
```

### Agentlarni alohida chaqirish

```text
concept-designer agentidan foydalanib projects/clinic/brief.md uchun 3 ta konsepsiya yoz
```

```text
design-reviewer agenti bilan http://localhost:4173 dagi saytni projects/clinic/decision.md bo'yicha tekshir
```

## Yaxshi brief uchun maslahat

Natija sifati briefga bog'liq. Imkon qadar yozing:

- **Auditoriya** — kimlar, qaysi qurilmadan, qanday vaziyatda kiradi;
- **Biznes maqsadi** — sayt nimaga erishishi kerak va qanday o'lchanadi;
- **Asosiy foydalanuvchi amallari** — 2–4 ta eng muhim harakat;
- **Kontent** — sahifalar, matnlar, tasvirlar, mavjud brend materiallari;
- **Cheklovlar** — til(lar), texnologiya, hosting, muddat, majburiy elementlar.

Brief noaniq bo'lsa, agentlar taxminlarini `concepts.md` da ochiq yozadi.
