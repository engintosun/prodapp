# PRODAPP — Opus Seans Bağlam Dosyası
**Hazırlayan:** Opus (Seans 8 sonu)
**Tarih:** 17 Mayıs 2026
**Son commit:** 6a19cc7
**Amaç:** Yeni Opus seansına bağlam vermek.

---

## 1. PROJE NEDİR

PRODAPP (POY — Prodüksiyon Otomasyon Yazılımı), Türk film/dizi/reklam sektörüne özel saha harcama yönetimi ve denetim uygulaması. Mobil-first PWA, GitHub Pages'te canlı: `engintosun.github.io/prodapp`

**Engin Tosun** — 51 yaşında, İzmir, 20+ yıl film prodüksiyon deneyimi. PRODAPP'ı hem öğrenme yolculuğu hem potansiyel gelir kaynağı olarak inşa ediyor. Teknik geçmişi yok — Git'i, Claude Code'u, modüler JS mimarisini bu projede sıfırdan öğrendi.

**Rakiplerden farkı:** PRODAPP sektör-spesifik mali denetçi. Film prodüksiyonuna özgü avans/kira/istisna/dönem kapama/sahtekarlık tespiti mantığı var.

---

## 2. TEKNİK DURUM

### Mimari
- **Tek HTML dosyası** (~5300 satır): CSS + HTML shell + `<script type="module">` expose bloğu
- **14 modül dosyası** (`modules/` altında): canonical kaynak, aktif ve çalışıyor
- **Strategy B aktif:** `window.X = X` expose köprüsü, HTML onclick'ler dokunulmadı
- **Renk paleti:** warm black `#0C0A08` + orange accent `#E8962E`, Lucide SVG ikonlar, DM Sans + DM Mono
- **Build system yok**, vanilla JS

### Üç rol (+ planlanan dördüncü)
| Rol | role key | Ekran | Açıklama |
|---|---|---|---|
| Saha | `user` | `su` | Fiş tarar, harcama girer, avans alır |
| Dept | `dept` | `sd` | Departman harcamalarını onaylar |
| Muhasebe | `acc` | `sa` | Kesin onay, dashboard, raporlar |
| Yapımcı/Denetçi | TBD | TBD | Muhasebe üstü denetim — henüz kesinleşmedi |

### Veri katmanı
- **Şu an:** localStorage + seed data (demo)
- **Hedef:** Supabase (self-hosted AWS Istanbul) + Vercel + Google Vision API + Claude API

---

## 3. TAMAMLANAN İŞLER

### Faz 1 Demo (Nisan 2026)
Saha/Dept/Muhasebe üç ekran çalışır durumda. OCR mock, belgesiz harcama, avans zinciri, dönem kapama, mesajlaşma 2.0, export, bildirim, profil, light/dark tema.

### Modülerleşme (Mayıs 2026)
7A kopyalama + 7B Strategy B + 7B.1 marka/sohbet tamamlandı. index.html ~11000 → ~5300 satıra düştü.

### Naming Refactor (Mayıs 2026)
- A1-A5: ~150 fonksiyon rename ✅
- Batch B (B1-B3): APP.data/ui/seed/cache key rename ✅
- Batch C (C1-C6): Enum value rename ✅
- CSS class rename (D1-D4): 241 class, ~829 referans ✅
- CSS Dynamic String Audit: `docs/CSS-CLASS-AUDIT.md` ✅
- Sektörel terim kararları alındı: user→crew, yapim→production, Yiyecek→food, simGIB kalacak, Konaklama→accommodation, Diger→misc

### Naming Refactor — KISMEN BITMEDI
Kodda hâlâ Türkçe kalan, **C12 (JS field rename) kapsamında Supabase ile birlikte değişecek** olanlar:
- `accOnayla`, `accReddet`, `accKismi` (fis.service.js)
- `.onaylandi`, `.reddedildi` sub-key'ler (deptHistory/periodBudget)

### Seans 3 (15 Mayıs 2026)
- Doküman güncellemeleri: CLAUDE.md + Status.md + NAMING-INVENTORY.md ✅
- CFE pure function kuralı, C13 kapsam genişletme, CSS audit ✅

### Seans 4 (16 Mayıs 2026)
- `docs/PRODAPP-TASARIM-KARARLARI.md` oluşturuldu
- E4 session persistence notu eklendi

### Seans 5 (16 Mayıs 2026)
- OCR sonuç ekranı ilk implementasyon (commit 6cd05ad)

### Seans 6 (17 Mayıs 2026)
- OCR düzeltmeler: header, GİB button, per-field confidence, tipografi, kart formatı
- Tasarım kararları 3.2 güncelleme, belgesiz helper text silme
- 6 commit (eef09c2 → a33243f)

### Seans 7 (17 Mayıs 2026)
- **Grup 1** (41966b2): rejected→Reddedildi (saha.js), OCR helper text silme
- **Grup 2** (2581daf): Özel Belgeler bloğu taşındı
- **Grup 3** (9498518): Light tema + export düzeltmeleri
- **OCR title + Muhasebe rejected** (925389f): --tx3→--tx2, muhasebe.js 3 satır
- **Md senkronlama** (6336957): Status.md + SUPABASE-ONCESI + CLAUDE.md
- **G7/G11/G12 eski key düzeltme** (3f99054): ARCHITECTURE.md + WORKFLOWS.md + design.md, 46 ekleme / 44 silme

### Seans 8 (17 Mayıs 2026)
- **G8 + G9** (6a19cc7): CLAUDE.md + ARCHITECTURE.md naming refactor durumu senkron
  - CLAUDE.md: "Naming Refactor Kuralları (henüz uygulanmadı)" → "Naming Refactor Durumu" — A-B-C-D tamamlandı, C12+C13 Supabase ile bekliyor, DOKUNMA kuralı net
  - CLAUDE.md: Editing Guidelines’a modül önceliği + Türkçe field DOKUNMA kuralı eklendi
  - ARCHITECTURE.md 10.3: Batch A-B-C-D durumu + mapping katmanı stratejisi
  - ARCHITECTURE.md 10.5 (yeni): CSS Class Rename (Batch D) bölümü
  - ARCHITECTURE.md 10.6 (yeni): Sektörel Terim Kararları bölümü
  - 2 dosya, +81/-11 satır

---

## 4. SIRADAKİ ADIMLAR

SUPABASE-ONCESI-GOREVLER.md'den (17 Mayıs güncel):

1. ~~G1-G6~~ ✅ — Dokümantasyon borcu
2. ~~B6~~ ✅ — Saha submenu bug
3. ~~A-B (B1-B3)~~ ✅ — Naming Batch B
4. ~~A-C (C1-C6)~~ ✅ — Naming Batch C
5. ~~A-D (D1-D4)~~ ✅ — CSS class rename
6. ~~B2~~ ✅ — OCR sonuç ekranı
7. ~~G7-G12~~ ✅ — Md senkron (Seans 7-8 sonu, G8+G9 dahil)
8. **B1, B3-B5** — Tasarım revizyonu (Engin çizim yükleyecek) ← ŞU AN BURADAYIZ
9. **B7-B9** — Görsel tutarlılık
10. **C1-C2** — Messaging Step C
11. **D1-D2** — i18n hazırlığı
12. **B10** — CSS tokens
13. **C13** — Element ID & CSS Class String Rename
14. **C7** — Core Finance Engine
15. **E1-E3** — Rol/modül kararları (Supabase ile birlikte)
16. **F1-F3** — Yasal uyum (pilot öncesi)
17. → **Supabase**

### Bağımlılıklar
- Mail+dil+proje giriş akışı → Supabase Auth
- i18n → C13'ten sonra
- C12 (JS field rename — accOnayla/accReddet/accKismi + .onaylandi/.reddedildi) → Supabase ile birlikte

---

## 5. ÇALIŞMA PRENSİPLERİ

### Hibrit model
- **Opus:** Planlama, mimari, prompt hazırlama, tasarım kararları
- **Sonnet (Claude Code):** Kod, grep, commit+push

### Opus kuralları
1. İzinsiz prompt yazmaz, dosya oluşturmaz
2. Araya girmez — önce sorar
3. Bilmediğini uydurmaz
4. Tasarım kararlarını birebir yansıtır
5. Prompt sonrası tasarım kararlarıyla karşılaştırır
6. Prompt'a gereksiz tekrar koymaz

### Sonnet prompt kuralları
1. Commit checklist zorunlu
2. ETKİ ANALİZİ zorunlu
3. Prompt'lar indirilebilir dosya
4. Commit öncesi: git diff --stat

### İletişim
- 1 karar + 1 cümle + "kabul/itiraz?"
- Token = para

---

## 6. REPO DOSYA HARİTASI (hepsi güncel)

| Dosya | Amaç |
|---|---|
| `CLAUDE.md` | Sonnet çalışma kuralları |
| `Status.md` | Ne yapıldı, ne kaldı |
| `SUPABASE-ONCESI-GOREVLER.md` | A-H tam iş listesi |
| `SCHEMA.md` | APP namespace veri şeması |
| `ARCHITECTURE.md` | Tasarım ilkeleri, veri modeli |
| `WORKFLOWS.md` | 9 mali iş akışı |
| `design.md` | Görsel kimlik |
| `NAMING-INVENTORY.md` | Rename envanteri |
| `docs/PRODAPP-TASARIM-KARARLARI.md` | Tasarım kararları |
| `docs/CSS-CLASS-AUDIT.md` | CSS class referansları |
| `docs/PRODAPP-RAKIP-ANALIZI-OCR.md` | Rakip analizi |

---

## 7. PERFORMANS NOTLARI

- 4.6 modeli sorunlu (tekrar, döngü, 3x token) — 4.7'de düzeldi
- Sonnet zaten CLAUDE.md + design.md okuyor — prompt'a tekrar yazma
- "Kabul/itiraz?" sor, gereksiz soru sorma
- Çelişki yakalarsan A/B sun, döngüye girme

---

## 8. YENİ SEANS BAŞLANGIÇ

### Zorunlu
1. Bu dosya (PRODAPP-OPUS-BAGLAM.md)
2. SUPABASE-ONCESI-GOREVLER.md

### Konuya göre
- Tasarım → `docs/PRODAPP-TASARIM-KARARLARI.md`
- Veri yapısı → `SCHEMA.md`
- Mimari → `ARCHITECTURE.md`
- Rename → `NAMING-INVENTORY.md`
- Akış → `WORKFLOWS.md`

### İlk soru
"B1, B3-B5 tasarım revizyonuna mı geçiyoruz, başka önceliğin var mı? Çizim var mı?"
