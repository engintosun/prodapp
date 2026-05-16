# SUPABASE ÖNCESİ GÖREV LİSTESİ

**Son güncelleme:** 15 Mayıs 2026 (Seans 3)
**Kaynak:** Memory (30 kayıt) + geçmiş chat arşivi + bu seans kararları

---

## A. NAMING REFACTOR (devam)

| # | Görev | Durum | Not |
|---|---|---|---|
| A1–A5 | Fonksiyon rename (~150 fonksiyon) | ✅ Tamamlandı | 9 commit |
| A-hotfix | sicAutoResize/sicKeydown + renderSohbetListesi | ✅ Tamamlandı | |
| B1 | APP.data key rename (13 key) + localStorage migration | ✅ Tamamlandı | commit 721b9cb |
| B2 | APP.ui (11) + APP.seed (5) key rename | ✅ Tamamlandı | commit 52170c2 |
| B3 | APP.cache key rename (8 key) | ✅ Tamamlandı | commit c042148 |
| C1 | Fiş durum enum rename (5 değer) + migration | ✅ Tamamlandı | commit ec46dfc |
| C2 | Kategori enum rename (8 değer) + HTML option + migration | ✅ Tamamlandı | commit 5cdc398 |
| C3 | Avans durum enum rename | ✅ Tamamlandı | commit — ödendi>paid, bekleyen>pending |
| C4 | Sohbet tip enum rename | ✅ Tamamlandı | bireysel>direct, grup>group |
| C5 | Kira/dönem durum enum rename + CSS senkron | ✅ Tamamlandı | aktif>active, gec>overdue, yak>upcoming, iade>returned |
| C6 | Log aksiyon enum rename | ✅ Tamamlandı | olusturuldu>created, dept-onayladi>dept-approved |
| D | CSS class rename (.fis-, .sohbet-, .avans-, .donem-, .kat-) | ❓ Batch C sonrası | Bileşen sınıfları, veri enum'undan bağımsız |

---

## B. TASARIM REVİZYONU

| # | Görev | Durum | Not |
|---|---|---|---|
| B1 | Level 3 tasarım yönü kararı | ❓ Tartışılacak | design.md'de taslak var, kesinleşmedi. Neumorphic/premium his. "Karanlık odada altın yüzük parıltısı" metaforu |
| B2 | OCR sonuç ekranı sadeleştirme | ❓ Engin çizim yükleyecek | İmza+sesli+GİB aynı anda = kalabalık |
| B3 | Dept ekranı kart yapısı revizyonu | ❓ Engin çizim yükleyecek | |
| B4 | Muhasebe ekranı kart yapısı revizyonu | ❓ Engin çizim yükleyecek | |
| B5 | Muhasebe dashboard görünümü | ❓ Tartışılacak | Mevcut donut chart + departman kartları |
| B6 | Saha submenu bug — fiş tara sonrası kapanmıyor | ✅ Düzeltildi | commit 488a98a |
| B7 | Emoji → Lucide SVG geçişi (kalan yerler) | ⏸ Görsel tasarım revizyonu ile birlikte | Ayrı iş olarak yapılmayacak. Görsel tasarım revizyonunun parçası olarak ele alınacak. 💰, ✓, ✕, ●, ⚠️ hâlâ var. |
| B8 | Tab CSS prefix birleştirme | ⏸ Tasarım revizyonu ile birlikte | 4 farklı sistem: su-tab/dtl-tb/sa-tb/adept-tb. Şimdi yapılmaz — çift iş riski. Tasarım revizyonuyla birlikte birleştirilecek. |
| B9 | Inline style temizliği → utility class | ❓ Görsel revizyon + migration ile birlikte | 561 ref (220'si muhasebe.js). Tek başına yapılmaz — çift iş riski. Zamanlama: görsel tasarım revizyonu + Supabase migration ile eş zamanlı. |
| B10 | CSS ayrıştırma — design-tokens.css | ❓ | Level 3 tema için ön koşul |
| B11 | Kısmi onay UX revizyonu — ½ butonu fiş detay modal'ına taşınacak, listeden kaldırılacak, renk paleti düzeltme (mor→orange) | ❓ | Eski sohbette tartışıldı, kısmi onay mantığı çalışıyor ama UX sorunlu |

---

## C. FONKSİYONEL EKSİKLER / İYİLEŞTİRMELER

| # | Görev | Durum | Not |
|---|---|---|---|
| C1 | Messaging 2.0 Step C — yeni sohbet başlatma, grup oluşturma | ❓ | A4'te rename edildi ama fonksiyon henüz yarım |
| C2 | Eski sendMesaj/openMesaj sistemi kaldırma | ❓ | Step C ile birlikte |
| C3 | Mesaj erişimi — 4. nav icon'un doğru yer mi tartışması | ❓ | Saha ekranında mesaj tab'ının konumu |
| C4 | Visual consistency pass | ❓ | Rapor ekranı estetik iyileştirme |
| C5 | _formatRentalDate dead code analizi | ❓ | Tüketicisi yok — sil veya kullan |
| C6 | index.html-only fonksiyonlar — modüle taşınmamış olanlar | ❓ | Tarama gerekli |
| C7 | Core Finance Engine | ❓ | Para birimi çevirimi, bütçe hesaplamaları, KDV limitleri. **Pure function kuralı:** Tüm hesaplama fonksiyonları `APP.data`/global state'e doğrudan erişmeyecek; tüm girdi parametre, sonuç return, side-effect yok (DOM/localStorage/state mutasyonu yok). Bütçe, KDV, kur dönüşümü, limit kontrolü dahil. Amaç: CFE sonrası test harness eklemeyi trivial yapmak. |
| C8 | Data Validation katmanı | ❓ Bilinçli erteleme | Zorunlu alan, format, tip kontrolü. Supabase şemasıyla birlikte yazılacak — Batch B sonrası |
| C9 | Supabase Service Layer | ❓ Bilinçli erteleme | Supabase şema tasarımıyla birlikte tek seferde yazılacak. Kapsamı: (a) Error handling — try-catch + toast, (b) Connection state — offline queue + retry, (c) Storage service — foto/dosya Supabase Storage'a, DB'de URL only, (d) UUID — crypto.randomUUID() + migration, (e) Soft delete — deleted_at + RLS (karar alınmış), (f) Optimistic UI + debounce — buton disable/loading/re-enable, mükerrer kayıt önleme, (g) Rehydration + caching — başlangıç veri çekme stratejisi, lazy load, cache invalidation |
| C10 | Kategori listesi gözden geçirme | ❓ | Teknik silindi, mevcut 8 kategori yeterli mi, sektörel ihtiyaç analizi |
| C11 | Galeriden çoklu fotoğraf seçimi + OCR kuyruğu | ❓ | Şu an tek fotoğraf işleniyor, çoklu seçimde sıralı OCR gerekli |
| C12 | JS object property (field) rename — Türkçe→İngilizce | ❓ Supabase ile birlikte | `f.kat`→`f.category`, `f.durum`→`f.status`, `f.tutar`→`f.amount`, `f.satici`→`f.vendor`, `f.tarih`→`f.date`, `f.aciklama`→`f.description`, `f.gerekce`→`f.justification`, `f.donem`→`f.period`, `f.personel`→`f.crew` vb. **Neden şimdi değil:** Şu an veri localStorage'da bu isimlerle tutuluyor — rename yapmak migration gerektirir. Supabase geçişinde localStorage zaten kalkacak, Supabase şeması sıfırdan İngilizce yazılacak, JS tarafı mapping katmanıyla tek seferde dönecek. Şimdi yapmak = boşa migration + sonra silinen kod. CSS class rename'den farklı: class adları veri katmanından bağımsız, field adları değil. |
| C13-pre | CSS Dynamic String Audit (read-only diagnostic) | ❓ C13 öncesi yapılacak | `docs/CSS-CLASS-AUDIT.md` raporu üretilecek — `classList`, `querySelector`, `className`, `setAttribute('class',...)`, template literal/concatenation class string'leri taranacak. Tek grep oturumu, değişiklik yok, sadece rapor. Prompt hazır. |
| C13 | Element ID & CSS Class String Rename | ❓ C12 ile eş zamanlı — Supabase öncesi son adım | Kapsam: (a) Element ID'leri (`getElementById`, `querySelector('#...')`), (b) CSS class literal'leri (`classList.add/remove/toggle/contains`, `querySelector('.')`, `closest('.')`), (c) Dinamik class string'leri (template literal, concatenation, `setAttribute('class',...)`). Girdi: `docs/CSS-CLASS-AUDIT.md`. Tek Sonnet prompt'u, tek grep oturumu, aynı commit. Öncelik: 🔴 `sdtb-*`/`sd-*`, `uye-*`/`acuye-*`, `sic-*` → 🟡 `don-*`, `fis-*`, `tab-*` → 🟢 `b-*`/`f-*`. |

---

## D. i18n HAZIRLIĞI

| # | Görev | Durum | Not |
|---|---|---|---|
| D1 | UI string ayrıştırma — hardcoded TR → tr.json/en.json | ❓ | Naming refactor sonrası |
| D2 | Dil seçimi UI — ilk giriş ekranı | ❓ | Muhasebe ekip adına + birey kendi dili |
| D3 | 8 dil hedefi (EN, DE, IT, ES, FR, RU, JA, ZH) | Faz 2 | |

---

## E. ROL VE MODÜL KARARLARI

| # | Görev | Durum | Not |
|---|---|---|---|
| E1 | Yapımcı rolü eklenmesi | ❓ Karar bekliyor | Bütçe oluşturma yetkisi, Muhasebe üstü denetim. Supabase auth ile birlikte netleşir |
| E2 | Bütçe oluşturma modülü | ❓ Karar alındı, uygulama Supabase sonrası | Yapımcı/uyg.yapımcı oluşturur, muhasebeye havale |
| E3 | PDF/dosya fatura yükleme | ❓ Faz 1 ek özellik | "Galeri" → "Galeri/Dosya", e-arşiv/banka dekontu/voucher |
| E4 | "Beni hatırla" / session persistence | ❓ Supabase Auth ile birlikte | JWT session — token geçerliyse login atlanır, doğrudan proje seçimine düşer. Demo'da yok, Supabase'de implemente edilecek. |

---

## F. YASAL / UYUM

| # | Görev | Durum | Not |
|---|---|---|---|
| F1 | KVKK uyumu — pilot öncesi tamamlanmalı | ❓ | "Pilot = gerçek ürün" kararı gereği |
| F2 | Yasal harita: KVKK/GİB/TTK/İş K/TCK 230/SLA | ❓ | S1–S3 standart tiers tanımlı |
| F3 | Sözleşme hazırlığı (pilot için) | ❓ | Mock veri yok, gerçek sözleşme |

---

## G. DOKÜMANTASYON

| # | Görev | Durum | Not |
|---|---|---|---|
| G1 | STATUS.md güncelleme (A1–A5 yansıtma) | ✅ Tamamlandı | commit ec9723b |
| G2 | NAMING-INVENTORY.md repo'ya ekleme | ✅ Tamamlandı | commit ec9723b |
| G3 | CALLMAP-P0.md repo'ya ekleme | ✅ Tamamlandı | commit ec9723b |
| G4 | 7B1-CONSTANTS-DISCOVERY.md repo'ya ekleme | ✅ Tamamlandı | commit ec9723b |
| G5 | _7b_delete.js / _7b_scan.js silme | ✅ Tamamlandı | commit ec9723b |
| G6 | .claude/ → .gitignore | ✅ Tamamlandı | commit ec9723b |
| G7 | design.md güncelleme (Level 3 notları, güncel durum) | ❓ | Eski fonksiyon isimleri geçiyor olabilir |
| G8 | CLAUDE.md güncelleme | ❓ | Naming convention kuralları eklenmeli |
| G9 | ARCHITECTURE.md güncelleme | ❓ | Modüler yapı yansıtılmalı |
| G10 | SCHEMA.md güncelleme | ✅ Tamamlandı | commit 9575d1a + 5cdc398 |
| G11 | ARCHITECTURE.md eski key kontrolü + güncelleme | ❓ Batch C sonrası toplu | |
| G12 | WORKFLOWS.md eski key kontrolü + güncelleme | ❓ Batch C sonrası toplu | |
| G13 | BATCH-C-SCAN-REPORT.md güncelleme (tamamlanan adımlar) | ❓ Batch C sonrası | |

---

## H. VERİ MODELİ NOTLARI (Supabase şema tasarımında ele alınacak)

| # | Not | Kaynak |
|---|---|---|
| H1 | Sanat hem kategori hem departman adı — dept_id ve category_id ayrı tablo/enum olmalı | 14 May 2026 sohbet |
| H2 | Cross-company dedup modeli (A: silent / B: company-internal / C: consortium opt-in) | 6 May 2026 memory |
| H3 | Mixed receipt handling — "fiş çek gerisi bizde" tension | 6 May 2026 memory |

---

## ÖNCELİK ÖNERİSİ (güncel sıralama — 14 Mayıs 2026)

1. ~~G1–G6~~ ✅ — Dokümantasyon borcu
2. ~~B6~~ ✅ — Saha submenu bug
3. ~~A-B (B1–B3)~~ ✅ — Naming Batch B
4. ~~A-C (C1–C2)~~ ✅ — Naming Batch C (kısmi)
5. **A-C (C3–C6)** — Naming Batch C (devam) ← ŞU AN BURADAYIZ
6. **G11–G12** — ARCHITECTURE.md + WORKFLOWS.md senkron (Batch C sonrası toplu)
7. **B1–B5** — Tasarım revizyonu tartışması (Engin çizim yükler, birlikte karar)
8. **B7–B9** — Görsel tutarlılık (emoji, tab prefix, inline style)
9. **C1–C2** — Messaging Step C
10. **D1–D2** — i18n hazırlığı
11. **B10** — CSS tokens (Level 3 tema ön koşulu)
12. **A-D** — CSS class rename batch
13. **C7** — Core Finance Engine
14. **E1–E3** — Rol/modül kararları (Supabase ile birlikte)
15. **F1–F3** — Yasal uyum (pilot öncesi)
16. → **Supabase**

---

**Not:** Bu liste "yapılacak her şey" değil, "Supabase öncesi bilinçli olarak ele alınması gereken" konular. Bazıları "şimdi değil, bilinçli erteleme" kararıyla Supabase sonrasına bırakılabilir — ama bu bilinçli olmalı (#20 memory: "sonra ekleriz" ertelemeleri bilinçli karar olmalı).
