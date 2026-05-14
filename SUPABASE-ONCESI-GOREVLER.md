# SUPABASE ÖNCESİ GÖREV LİSTESİ

**Derlenme tarihi:** 14 Mayıs 2026
**Kaynak:** Memory (30 kayıt) + geçmiş chat arşivi + bu seans kararları

---

## A. NAMING REFACTOR (devam)

| # | Görev | Durum | Not |
|---|---|---|---|
| A1–A5 | Fonksiyon rename (~150 fonksiyon) | ✅ Tamamlandı | 9 commit |
| A-hotfix | sicAutoResize/sicKeydown + renderSohbetListesi | ✅ Tamamlandı | |
| B | APP.data / APP.ui key rename + localStorage migration script | ❓ Sırada | ~80 APP.data.fisler ref, ~58 APP.ui.aktifDon ref |
| C | durum/kat enum value rename + migration script | ❓ B'den sonra | 5 obje tipinde farklı value, gec kökü 3 anlam |

---

## B. TASARIM REVİZYONU

| # | Görev | Durum | Not |
|---|---|---|---|
| B1 | Level 3 tasarım yönü kararı | ❓ Tartışılacak | design.md'de taslak var, kesinleşmedi. Neumorphic/premium his. "Karanlık odada altın yüzük parıltısı" metaforu |
| B2 | OCR sonuç ekranı sadeleştirme | ❓ Engin çizim yükleyecek | İmza+sesli+GİB aynı anda = kalabalık |
| B3 | Dept ekranı kart yapısı revizyonu | ❓ Engin çizim yükleyecek | |
| B4 | Muhasebe ekranı kart yapısı revizyonu | ❓ Engin çizim yükleyecek | |
| B5 | Muhasebe dashboard görünümü | ❓ Tartışılacak | Mevcut donut chart + departman kartları |
| B6 | Saha submenu bug — fiş tara sonrası kapanmıyor | 🐛 Tespit edildi | closeM() veya overlay click handler eksik |
| B7 | Emoji → Lucide SVG geçişi (kalan yerler) | ❓ | 💰, ✓, ✕, ●, ⚠️ hâlâ var |
| B8 | Tab CSS prefix birleştirme | ❓ | su-tab, sd-tb, sa-tb, adept-tb, acuye-tb — 4 ayrı stil seti |
| B9 | Inline style temizliği → utility class | ❓ | Çok sayıda inline padding/margin |
| B10 | CSS ayrıştırma — design-tokens.css | ❓ | Level 3 tema için ön koşul |

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
| C7 | Core Finance Engine | ❓ | Para birimi çevirimi, bütçe hesaplamaları, KDV limitleri |
| C8 | Data Validation katmanı | ❓ Bilinçli erteleme | Zorunlu alan, format, tip kontrolü. Supabase şemasıyla birlikte yazılacak — Batch B sonrası |
| C9 | Supabase Service Layer | ❓ Bilinçli erteleme | Supabase şema tasarımıyla birlikte tek seferde yazılacak. Kapsamı: (a) Error handling — try-catch + toast, (b) Connection state — offline queue + retry, (c) Storage service — foto/dosya Supabase Storage'a, DB'de URL only, (d) UUID — crypto.randomUUID() + migration, (e) Soft delete — deleted_at + RLS (karar alınmış), (f) Optimistic UI + debounce — buton disable/loading/re-enable, mükerrer kayıt önleme, (g) Rehydration + caching — başlangıç veri çekme stratejisi, lazy load, cache invalidation |

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
| G1 | STATUS.md güncelleme (A1–A5 yansıtma) | 🎯 Sonnet'e prompt hazır | |
| G2 | NAMING-INVENTORY.md repo'ya ekleme | 🎯 G1 ile birlikte | |
| G3 | CALLMAP-P0.md repo'ya ekleme | 🎯 G1 ile birlikte | |
| G4 | 7B1-CONSTANTS-DISCOVERY.md repo'ya ekleme | 🎯 G1 ile birlikte | |
| G5 | _7b_delete.js / _7b_scan.js silme | 🎯 G1 ile birlikte | |
| G6 | .claude/ → .gitignore | 🎯 G1 ile birlikte | |
| G7 | design.md güncelleme (Level 3 notları, güncel durum) | ❓ | Eski fonksiyon isimleri geçiyor olabilir |
| G8 | CLAUDE.md güncelleme | ❓ | Naming convention kuralları eklenmeli |
| G9 | ARCHITECTURE.md güncelleme | ❓ | Modüler yapı yansıtılmalı |
| G10 | SCHEMA.md güncelleme | ❓ | Naming refactor sonrası field adları |

---

## ÖNCELİK ÖNERİSİ (sıralama)

1. **G1–G6** — Dokümantasyon borcu (prompt hazır, hemen yapılır)
2. **B6** — Saha submenu bug (küçük, hızlı fix)
3. **B1–B5** — Tasarım revizyonu tartışması (Engin çizim yükler, birlikte karar)
4. **B7–B9** — Görsel tutarlılık (emoji, tab prefix, inline style)
5. **A-B** — Naming Batch B (APP.data key rename)
6. **A-C** — Naming Batch C (enum value rename)
7. **C1–C2** — Messaging Step C
8. **D1–D2** — i18n hazırlığı
9. **B10** — CSS tokens (Level 3 tema ön koşulu)
10. **C7** — Core Finance Engine
11. **E1–E3** — Rol/modül kararları (Supabase ile birlikte)
12. **F1–F3** — Yasal uyum (pilot öncesi)
13. → **Supabase**

---

**Not:** Bu liste "yapılacak her şey" değil, "Supabase öncesi bilinçli olarak ele alınması gereken" konular. Bazıları "şimdi değil, bilinçli erteleme" kararıyla Supabase sonrasına bırakılabilir — ama bu bilinçli olmalı (#20 memory: "sonra ekleriz" ertelemeleri bilinçli karar olmalı).
