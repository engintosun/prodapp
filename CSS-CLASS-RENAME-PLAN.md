# CSS CLASS RENAME BATCH PLANI

## Amaç
Tüm Türkçe CSS class prefix'lerini İngilizce'ye çevirmek.
Kapsam: index.html (CSS tanımları + HTML) + modules/ altındaki tüm .js dosyaları.

## Toplam: 241 class, ~829 referans, 4 batch

---

## ✅ BATCH D1 — `sd-*` → `dtl-*` (144 class, ~400 ref)

En büyük batch. Alt-prefix'ler dahil.

### Üst prefix
`sd-` → `dtl-` (detail)

### Alt-prefix mapping

| Mevcut | → Yeni | Açıklama | Class sayısı | Ref sayısı |
|--------|--------|----------|-------------|-----------|
| `sd-av-` | `dtl-advance-` | Dept avans detay | 23 | 48 |
| `sd-avans-` | `dtl-advance-` | Avans kart wrapper (birleştir) | 1 | 2 |
| `sd-gec-` | `dtl-hist-` | Geçmiş dönem sekmesi | 20 | 55 |
| `sd-ges-` | `dtl-phist-` | Dönem içi geçmiş işlemler (period history) | 9 | 25 |
| `sd-butce-` | `dtl-budget-` | Bütçe kartları | 15 | 33 |
| `sd-kira-` | `dtl-rental-` | Kiralama kartları | 14 | 37 |
| `sd-fis-` | `dtl-rcpt-` | Fiş detayları (receipt) | 10 | 23 |
| `sd-kat-` | `dtl-cat-` | Kategori kartları | 9 | 17 |
| `sd-uye-` | `dtl-member-` | Üye satırları | 7 | 14 |
| `sd-don-` | `dtl-period-summary-` | Dönem özet istatistikleri | 6 | 13 |
| `sd-donem-` | `dtl-period-nav-` | Dönem seçici pill'leri | 5 | 15 |
| `sd-bek-` | `dtl-pending-` | Bekleyen onay | 6 | 22 |
| `sd-ekip-` | `dtl-team-` | Ekip kartı | 1 | 2 |
| `sd-mesaj-` | `dtl-msg-` | Mesaj alanı | 1 | 2 |
| `sd-hd-` | `dtl-hd-` | Header (zaten İngilizce kök) | 4 | 18 |

### Tekil sd- class'ları (alt-prefix'e girmeyen)

| Mevcut | → Yeni | Açıklama |
|--------|--------|----------|
| `sd-body` | `dtl-body` | Ana gövde |
| `sd-bot` | `dtl-bot` | Alt kısım |
| `sd-cb` | `dtl-cb` | Checkbox |
| `sd-ok` | `dtl-ok` | Onay butonu |
| `sd-rd` | `dtl-rd` | Red butonu |
| `sd-sec` | `dtl-sec` | Section header |
| `sd-tabs` | `dtl-tabs` | Tab bar |
| `sd-tb` | `dtl-tb` | Tab butonu |
| `sd-tb-bj` | `dtl-tb-bj` | Tab badge |
| `sd-ozet` | `dtl-summary` | Özet alanı |
| `sd-pnl` | `dtl-pnl` | Panel |
| `sd-badge` | `dtl-badge` | Badge |
| `sd-sohbet` | `dtl-chat` | Sohbet paneli |

### Dikkat noktaları
- `sd-avans-card` → `dtl-advance-card` (sd-av- ailesiyle birleştir)
- `sd-av-gec-*` → `dtl-advance-history-*` (3 katmanlı nesting)
- `sd-gec-fis-*` → `dtl-hist-rcpt-*` (geçmiş dönem fiş kartları)
- `sd-gec-don-*` → `dtl-hist-period-*` (geçmiş dönem pill'leri)
- `sd-gec-av-card` → `dtl-hist-advance-card`
- `sd-gec-stat-*` → `dtl-hist-stat-*`
- `sd-don-ozet-past` → `dtl-period-summary-past`
- `sd-don-stat-*` → `dtl-period-summary-stat-*`

### Etkilenen dosyalar
- `index.html` — CSS tanımları + HTML template
- `modules/dept/dept.js` — ana kullanım
- `modules/shared/sohbet.js` — sd-pnl, sd-sohbet referansları

---

## ✅ BATCH D2 — `uye-*` → `member-*` + `profil-*` → `profile-*` (49 class, ~205 ref)

### uye- → member- (34 class, ~156 ref)

| Mevcut alt-prefix | → Yeni |
|-------------------|--------|
| `uye-av-` | `member-advance-` |
| `uye-hist-` | `member-history-` |
| `uye-don-` | `member-period-` |
| `uye-prof-` | `member-prof-` |
| `uye-stat-` | `member-stat-` |
| `uye-sec-hd` | `member-sec-hd` |
| `uye-msg-btn` | `member-msg-btn` |

### profil- → profile- (15 class, ~49 ref)

Direkt prefix değişimi, alt yapı aynı.

### Etkilenen dosyalar
- `index.html`
- `modules/muhasebe/muhasebe.js` — ana kullanım

---

## BATCH D3 — `sohbet-*` → `chat-list-*` + `sic-*` → `chat-view-*` + `yeni-*` → `new-*` (32 class, ~104 ref)

### sohbet- → chat-list- (12 class, ~39 ref)

Sohbet listesi ekranı.

### sic- → chat-view- (10 class, ~31 ref)

Aktif sohbet görünümü (chat modal).

### yeni- → new- (10 class, ~34 ref)

Yeni sohbet/grup oluşturma ekranı.

### Etkilenen dosyalar
- `index.html`
- `modules/shared/sohbet.js` — ana kullanım

---

## BATCH D4 — `fis-*` → `rcpt-*` + `avans-*` → `adv-*` (16 class, ~120 ref)

### fis- → rcpt- (12 class, ~108 ref)

Saha fiş listesi kartları. **Not:** `sd-fis-` zaten D1'de `dtl-rcpt-` olarak çevrildi, bu batch sadece üst seviye `fis-*` class'ları.

### avans- → adv- (4 class, ~12 ref)

Saha ana ekrandaki avans butonları. **Not:** `sd-av-*` ve `sd-avans-*` zaten D1'de `dtl-advance-*` olarak çevrildi.

### Etkilenen dosyalar
- `index.html`
- `modules/saha/saha.js`
- `modules/saha/donem.js`

---

## GENEL KURALLAR

1. Her batch bir Sonnet seansı = bir commit.
2. Sıralama: D1 → D2 → D3 → D4 (bağımlılık yok ama D1 en büyük, önce bitsin).
3. Her batch sonrası smoke test: ilgili ekranları aç, class'lar doğru mu, stil kırılmış mı.
4. CSS tanımı + HTML class attribute + JS string hepsi aynı commit'te değişmeli.
5. Sadece class adı değişiyor, stil kurallarının içeriği (property/value) değişmiyor.
6. `getElementById` ile erişilen ID'ler bu batch'te DEĞİŞMEZ (ayrı iş).

## ID'LER — BU BATCH'TE DEĞİŞMEYEN

Aşağıdaki element ID'leri Türkçe ama bu batch'in kapsamı dışında:
- `sd-donem-sec`, `sdtb-gecmis`, `sic-mesajlar`, `fis-list` vb.
- ID rename ayrı bir batch olarak planlanacak (CSS class'lardan bağımsız).
