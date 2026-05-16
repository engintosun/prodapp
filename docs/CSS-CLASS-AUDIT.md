# CSS Dynamic String Audit — C13 Hazırlık Raporu

**Tarih:** 16 Mayıs 2026
**Kapsam:** JS içindeki tüm CSS class referansları (statik + dinamik)
**Yöntem:** Read-only grep taraması — hiçbir dosya değiştirilmedi

---

## 1. Statik Class Referansları — `classList.*`

Toplam: **43** çağrı

| Dosya | Satır | Pattern | Class İsmi | Türkçe? |
|-------|-------|---------|------------|---------|
| modules/saha/saha.js | 125 | classList.add | `rcpt-hl` | — |
| modules/saha/saha.js | 126 | classList.remove | `rcpt-hl` | — |
| modules/saha/saha.js | 561 | classList.add | `signed` | — |
| modules/saha/saha.js | 578 | classList.remove | `signed` | — |
| modules/saha/saha.js | 585 | classList.remove | `signed` | — |
| modules/saha/saha.js | 619 | classList.add | `rec` | — |
| modules/saha/saha.js | 633 | classList.remove | `rec` | — |
| modules/saha/saha.js | 665 | classList.add | `on` | — |
| modules/saha/saha.js | 671 | classList.remove | `on` | — |
| modules/saha/saha.js | 676 | classList.remove | `on` | — |
| modules/saha/saha.js | 677 | classList.remove | `on` | — |
| modules/saha/saha.js | 686 | classList.add | `on` | — |
| modules/saha/saha.js | 687 | classList.remove | `on` | — |
| modules/saha/saha.js | 42 | classList.add | `on` | — |
| modules/saha/saha.js | 53 | classList.remove | `on` | — |
| modules/saha/saha.js | 58 | classList.remove | `on` | — |
| modules/saha/saha.js | 66 | classList.remove | `on` | — |
| modules/saha/saha.js | 78 | classList.add | `on` | — |
| modules/saha/saha.js | 106 | classList.add | `on` | — |
| modules/dept/dept.js | 505 | classList.toggle | `secili` | ✓ |
| modules/dept/dept.js | 919 | classList.remove | `on` | — |
| modules/dept/dept.js | 922 | classList.add | `on` | — |
| modules/muhasebe/muhasebe.js | 362 | classList.remove | `on` | — |
| modules/muhasebe/muhasebe.js | 364 | classList.add | `on` | — |
| modules/muhasebe/muhasebe.js | 523 | classList.add | `on` | — |
| modules/muhasebe/muhasebe.js | 521 | classList.remove | `on` | — |
| modules/muhasebe/muhasebe.js | 617 | classList.remove | `on` | — |
| modules/muhasebe/muhasebe.js | 618 | classList.add | `on` | — |
| modules/shared/export.js | 431 | classList.add | `on` | — |
| modules/shared/export.js | 439 | classList.remove | `on` | — |
| modules/shared/ocr.js | 97 | classList.add | `scanning` | — |
| modules/shared/ocr.js | 106 | classList.remove | `scanning` | — |
| modules/shared/sohbet.js | 289 | classList.contains | `on` | — |

**Türkçe olan:** 1 → `secili` (dept.js:505, `classList.toggle`)

---

## 2. `className` Doğrudan Atama

Toplam: **7** atama

| Dosya | Satır | Kod | Türkçe class var mı? |
|-------|-------|-----|----------------------|
| modules/dept/dept.js | 507 | `cb.className = 'dtl-cb' + (sel ? ' on' : '')` | — |
| modules/dept/dept.js | 534 | `info.className = selCnt > 0 ? 'dtl-pending-sel-info has-sel' : 'dtl-pending-sel-info'` | — |
| modules/dept/dept.js | 542 | `cbAll.className = allSel ? 'dtl-cb on' : (partSel ? 'dtl-cb part' : 'dtl-cb')` | — |
| modules/saha/saha.js | 360 | `uyEl.className = 'al al-rd'` | — |
| modules/saha/saha.js | 366 | `uyEl.className = 'al al-am'` | — |
| modules/shared/sohbet.js | 136 | `avEl.className = 'chat-view-av chat-view-av-grup'` | — |
| modules/shared/sohbet.js | 139 | `avEl.className = 'chat-view-av'` | — |

**Türkçe olan:** 0

---

## 3. Dinamik Class Değişkenleri (`cls` / `Cls` pattern'i)

Bu satırlar C13 rename'de risk taşır — class adı sabit string değil, değişken üzerinden geçiyor.

| Dosya | Satır | Dinamik İfade | Risk |
|-------|-------|--------------|------|
| modules/dept/dept.js | 449 | `var infoCls = selCnt > 0 ? 'dtl-pending-sel-info has-sel' : 'dtl-pending-sel-info'` | Düşük |
| modules/dept/dept.js | 451 | `var cbAllCls = allSel ? 'dtl-cb on' : (partSel ? 'dtl-cb part' : 'dtl-cb')` | Düşük |
| modules/dept/dept.js | 472 | `var cbCls = 'dtl-cb' + (sel ? ' on' : '')` | Düşük |
| modules/dept/dept.js | 473 | `var fisCls = 'dtl-rcpt' + (sel ? ' secili' : '')` | ✓ `secili` Türkçe |
| modules/dept/dept.js | 860 | `var cardCls = 'dtl-rental-card' + (dur === 'overdue' ? ' overdue' : ...)` | Düşük |
| modules/muhasebe/muhasebe.js | 440 | `var tagCls = ... 'member-advance-tag member-advance-tag-ok' : 'member-advance-tag member-advance-tag-bek'` | ✓ `-bek` Türkçe kısaltma |
| modules/muhasebe/muhasebe.js | 579 | `var tagCls = ... 'member-advance-tag-ok' : 'member-advance-tag-bek'` | ✓ `-bek` Türkçe kısaltma |
| modules/muhasebe/muhasebe.js | 847 | `var tagCls = f.durum === 'bek' ? 'sa-suphe-tag-bek' : (... 'sa-suphe-tag-inc' : 'sa-suphe-tag-red')` | ✓ `suphe`, `bek` Türkçe |
| modules/muhasebe/muhasebe.js | 901 | `var durCls = ... 'sa-fis-dur-on' : ... 'sa-fis-dur-red' : ... 'sa-fis-dur-inc' : 'sa-fis-dur-bek'` | ✓ `fis`, `bek` Türkçe |
| modules/saha/saha.js | 261 | `var cls = 'rc' + (d.duplikat ? ' err' : d.belgesiz ? ' blgsz' : d.uyari ? ' warn' : '')` | ✓ `blgsz`=belgesiz kısaltma |

---

## 4. `querySelectorAll` / `querySelector` İçindeki Class Seçiciler

Toplam: **6** çağrı

| Dosya | Satır | Seçici | Türkçe? |
|-------|-------|--------|---------|
| modules/saha/saha.js | 25 | `.su-nav .ni` | — |
| modules/saha/saha.js | 27 | `.su-tab` | — |
| modules/saha/saha.js | 45 | `.su-nav .ni` | — |
| modules/saha/saha.js | 122 | `#fis-list .rcpt-row` | ✓ `fis-list` ID Türkçe |
| modules/muhasebe/muhasebe.js | 616 | `.sa-tb` | — |
| modules/shared/sohbet.js | 454 | `#mnew-liste .new-chk:checked` | — |

**Türkçe olan:** 1 → `fis-list` (ID referansı — C13 ID rename kapsamında)

---

## 5. `sa-*` Prefix Ailesi — Muhasebe Modülü (C13 Büyük Kapsamı)

`muhasebe.js` içinde üretilen **101 benzersiz** `sa-*` prefixli class — CSS class rename (D1–D4) kapsamına **girmemişti**, çünkü `sa-` prefix'i Türkçe değil. Ancak içindeki segment'ler Türkçe kısaltma:

| Segment | Anlam | Örnekler | Adet |
|---------|-------|---------|------|
| `sa-fis-*` | fiş (receipt) | `sa-fis-item`, `sa-fis-dur-bek` | 9 |
| `sa-kira-*` | kiralama (rental) | `sa-kira-card`, `sa-kira-ozet` | 8 |
| `sa-av-*` | avans (advance) | `sa-av-row`, `sa-av-name` | 8 |
| `sa-suphe-*` | şüpheli (suspicious) | `sa-suphe-card`, `sa-suphe-tag-bek` | 7 |
| `sa-dc-butce-*` | bütçe (budget) | `sa-dc-butce-fill`, `sa-dc-butce-row` | 5 |
| `sa-donem-*` | dönem (period) | `sa-donem-bar`, `sa-donem-pill` | 3 |
| `sa-donut-*` | donut chart | `sa-donut-wrap`, `sa-donut-legend` | 7 |
| `sa-don-*` | dönem (period) | `sa-don-sec`, `sa-don-tbl` | 6 |
| `sa-genel-*` | genel (general) | `sa-genel-stat`, `sa-genel-row` | 6 |
| `sa-rep-*` | rapor (report) | `sa-rep-hd`, `sa-rep-kisi-*` | 15 |
| `sa-dc-uye` | üye (member) | — | 1 |
| diğer | — | `sa-onay-bar-*`, `sa-rapor-*` | ~26 |

**Bu 101 class D1–D4 batch'lerine dahil edilmedi** — `sa-` prefix'i Türkçe değil, içindeki segment'ler Türkçe. C13 kapsamında değerlendirilmeli.

---

## 6. Özel Durumlar

### `secili` — Türkçe state class'ı
- `dept.js:473`: `'dtl-rcpt' + (sel ? ' secili' : '')` — dinamik
- `dept.js:505`: `classList.toggle('secili', ...)` — statik
- CSS'te tanımı: `.dtl-fis.secili { ... }` (D1'den önce `.sd-fis.secili`)
- C13'te `selected` olarak rename edilmeli

### `blgsz` — Kısaltma (belgesiz)
- `saha.js:261`: `'rc' + (... d.belgesiz ? ' blgsz' : ...)` — saha fiş listesi
- `blgsz` → `no-doc` veya `docless` önerilir

### `member-advance-tag-bek`
- `muhasebe.js:440,579`: `bek` = bekleyen (pending)
- D2'de `member-advance-*` prefix'e dönüştü ama soneki Türkçe kaldı
- C13'te `-bek` → `-pending` olmalı

### `sa-fis-dur-bek` / `sa-suphe-tag-bek`
- `bek` = bekleyen → `-pending`
- `fis` = fiş → `-rcpt` (D4'te yapıldı ama `sa-` ailesi atlandı)

---

## 7. Özet

| Kategori | Adet | Türkçe | C13 Kapsamı |
|----------|------|--------|-------------|
| classList.add/remove/toggle/contains | 43 | 1 (`secili`) | ✓ |
| className doğrudan atama | 7 | 0 | — |
| Dinamik cls değişkenleri | 10 | 5 (`secili`, `bek`, `suphe`, `fis`, `blgsz`) | ✓ |
| querySelectorAll/querySelector | 6 | 1 (`fis-list` ID) | C13 ID batch |
| `sa-*` prefixli class ailesi (muhasebe) | 101 | ~50 (segment bazında) | ✓ Yeni kapsam |

**Toplam statik class referansı (classList + className):** ~50
**Türkçe class referansı (statik):** 1 kesin (`secili`) + 1 kısmi (`blgsz`)
**Dinamik (kırılma riski):** 5 → `cls` değişkeni üzerinden geçiyor, rename'de ikisi de (CSS + JS) değişmeli
**`sa-*` ailesi (D1–D4'te atlanmış):** 101 class, ~50'si Türkçe segment içeriyor — C13'e eklenecek

**C13 rename kapsamına giren toplam:** ~55 (classList/dinamik) + 101 (sa- ailesi) = **~156 referans**

---

## 8. Öneri: C13 Batch Sıralaması

1. `secili` → `selected` (1 classList.toggle + template + CSS tanımı)
2. `blgsz` → `docless` (1 dinamik cls)
3. `member-advance-tag-bek` → `member-advance-tag-pending` (2 cls değişkeni)
4. `sa-fis-*` → `sa-rcpt-*` (D4 mantığını `sa-` ailesine uygula)
5. `sa-suphe-*` → `sa-suspicious-*`
6. `sa-kira-*` → `sa-rental-*`
7. `sa-av-*` → `sa-advance-*`
8. `sa-don-*` / `sa-donem-*` → `sa-period-*`
9. `sa-dc-butce-*` → `sa-dc-budget-*`
10. `sa-genel-*` → `sa-general-*`
11. `sa-rep-*` → (kısmen zaten İngilizce — kontrol gerekli)
12. ID rename'ler (C13 ID batch — `sdtb-*`, `uye-*`, vb.)
