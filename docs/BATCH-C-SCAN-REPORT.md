# PRODAPP — Batch C Hazırlık Tarama Raporu

**Tarih:** 14 Mayıs 2026  
**Amaç:** Türkçe enum değerlerinin JS dışında nerelerde kullanıldığını tespit et; Batch C kapsamını belirle.  
**Yöntem:** 8 ayrı grep taraması — HTML attribute, CSS class, JS string literal

---

## ÖZET TABLO

| Kategori | Eşleşme | HTML attr | CSS class | JS literal | Migration gerekli? |
|---|---|---|---|---|---|
| `durum` (fiş) | ~30 | 0 | 0 | ~30 | ✅ Evet |
| `kat` (kategori) | ~19 | **19** (`<option value>`) | 0 | — | ✅ Evet + HTML |
| `dept` key | 1 | 1 (CSS id, zararsız) | 0 | — | ❌ Hayır |
| kira durumu (`gec/yak/iade/aktif`) | ~25 | 0 | **CSS class** olarak | ~25 | ⚠️ Bağımlı |
| sohbet tip (`bireysel/grup`) | ~14 | 0 | 0 | ~14 | ✅ Evet |
| log aksiyon (`olusturuldu` vb.) | ~10 | 0 | 0 | ~10 | ❓ Tartışmalı |
| avans durumu (`ödendi/bekleyen`) | ~30 | 0 | 0 | ~30 | ✅ Evet |
| CSS Türkçe class'lar | ~100+ | — | ✅ Var | — | 🔜 Ayrı batch |

---

## 1 — `durum` Değerleri (Fiş Durumu)

**Tarama:** `grep "bekleyen|onaylandi|reddedildi|bolundu|dept-bekleyen|acc-bekleyen" index.html | grep "class|value|data-|id="`

**HTML attribute eşleşmesi: 0**  
Durum değerleri HTML attribute'ta kullanılmıyor (hiç `value="dept-bekleyen"` yok).

**JS literal kullanımları (modules/):**

| Değer | Kullanım | Dosyalar |
|---|---|---|
| `'dept-bekleyen'` | receipts.durum ataması + karşılaştırma | ocr.js, saha.js, donem.js, fis.service.js, dept.js, report.service.js |
| `'acc-bekleyen'` | receipts.durum ataması + karşılaştırma | fis.service.js, dept.js, dept.service.js, report.service.js, donem.js |
| `'onaylandi'` | karşılaştırma + durumTxt map key | saha.js (satır 82–83, 645–647), dept.js |
| `'reddedildi'` | karşılaştırma + durumTxt map key | saha.js, dept.js, muhasebe.js |
| `'bekleyen'` | localStorage fallback karşılaştırma | report.service.js (satır 51, 125, 130) |
| `'bolundu'` | receipts.durum ataması | fis.service.js |

**Seed datada** (index.html satır 3911–3952): receipts dizisindeki objeler `durum:'dept-bekleyen'` / `durum:'acc-bekleyen'` içeriyor.

**`durumTxt` / `durumClr` haritaları** (saha.js satır 82–83, 645–647):  
```js
var durumTxt = { bekleyen:'Bekleyen', 'dept-bekleyen':'Bekleyen', 'acc-bekleyen':'Bekleyen',
                 onaylandi:'Onaylandı', reddedildi:'Reddedildi' };
```
→ KEY'ler (`dept-bekleyen` vb.) değişecek; VALUE'lar (`'Bekleyen'`, `'Onaylandı'`) **kullanıcıya gösterilen label — değişmeyecek**.

**Batch C kararı:** ✅ Rename gerekli + localStorage migration (seed datadaki mevcut kayıtlar)  
`bekleyen` eski fallback → migration bloğunda özel işlem

---

## 2 — `kat` Değerleri (Kategori)

**Tarama:** `grep "Yakit|Yiyecek|Ekipman|..." index.html | grep "class|value|option|data-"`

**HTML `<option value>` eşleşmeleri: 19 satır**

| Satır | İçerik | Form |
|---|---|---|
| 2684 | `<option value="Yakit">⛽ Yakıt</option>` | OCR modal (f-kat select) |
| 2685 | `<option value="Yiyecek">` | OCR modal |
| 2686 | `<option value="Ekipman">` | OCR modal |
| 2687 | `<option value="Ulasim">` | OCR modal |
| 2688 | `<option value="Konaklama">` | OCR modal |
| 2689 | `<option value="Kiralama">` | OCR modal |
| 2690 | `<option value="Sanat">` | OCR modal |
| 2691 | `<option value="Diger">` | OCR modal |
| 2790–2797 | Aynı 8 değer tekrar | Belgesiz harcama formu (b-kat select) |
| 2977 | `<option value="Sanat">` | 3. form (dept ek form?) |
| 2978 | `<option value="Teknik">` | 3. form — `Teknik` değeri **JS'de yok**, sadece bu HTML'de var |

**⚠️ Kritik:** `<option value>` değerleri `f.kat` field değerleriyle birebir eşleşmeli.  
Kat değerleri rename edilirse HTML `<option value>` da güncellenmeli, **aksi halde form submit sonrası kat eşleşmez**.

**⚠️ Kritik:** Satır 2978'deki `"Teknik"` — JS'de kategori enum'unda **yok** (`constants.js`'te veya `KATEGORILER`'de). Mevcut bir tutarsızlık. Batch C'de kapsama alınmalı.

**Batch C kararı:** ✅ Rename gerekli (JS + HTML option value birlikte) + localStorage migration

---

## 3 — `dept` Key Değerleri

**Tarama:** `grep "yapim|kamera|sanat|kostum" index.html | grep "class|value|option|data-|id="`

**Eşleşme: 1 satır**

| Satır | İçerik | Tür |
|---|---|---|
| 2873 | `id="b-foto-kamera-in"` | HTML element ID — `kamera` burada dept key değil, `kamera` kelimesinin geçtiği element adı |

**Batch C kararı:** ❌ Bu satır dept key rename kapsamı dışı (element ID, veri değeri değil)  
**NOT:** Dept key değerleri (`'yapim'`, `'kamera'` vb.) Batch B/C kapsam dışında bırakıldı — sektörel terim kararı bekliyor (STATUS.md'deki karar tablosu).

---

## 4 — Kira Durum Değerleri (`'aktif'`, `'yak'`, `'gec'`, `'iade'`)

**Tarama:** `grep "'aktif'|'yak'|'gec'|'iade'" index.html modules/**/*.js`

**Eşleşmeler:**

### `'aktif'`
- **index.html satır 3903:** `durum:'aktif'` — APP.seed.periods dizisindeki dönem objesi (runtime durum, localStorage'a yazılmaz)
- **donem.js satır 53, 176, 178, 184, 234, 255, 390, 404, 427:** dönem/izin durumu karşılaştırmaları
- `durum:'aktif'` **iki farklı obje** üzerinde kullanılıyor: `APP.seed.periods[i].durum` ve `exceptionPermits[i].durum` — farklı enum ise ayrı rename

### `'gec'`, `'yak'`, `'iade'`
- **dept.js satır 831, 845–861:** `_rentalStatus()` fonksiyonu dönüş değerleri
- **muhasebe.js satır 52–168:** rental status karşılaştırmaları
- Bu değerler `APP.data.deptRentals[i]` üzerinde **hesaplanır** (`_rentalStatus` tarafından), **stored değil**

### CSS class bağımlılığı — ⚠️ KRİTİK
```css
.sd-kira-card.gec  { border-color: rgba(239,68,68,.4); }  /* satır 1771 */
.sd-kira-card.yak  { border-color: rgba(245,158,11,.35); } /* satır 1772 */
.sd-kira-card.iade { opacity: .55; }                       /* satır 1773 */
.sa-kira-card.gec  { ... }                                 /* satır 1791 */
.sa-kira-card.yak  { ... }                                 /* satır 1792 */
.sd-kira-tag-yak   { ... }                                 /* satır 1781 */
.sd-kira-tag-gec   { ... }                                 /* satır 1782 */
```

dept.js satır 860: `var cardCls = 'sd-kira-card' + (dur === 'gec' ? ' gec' : dur === 'yak' ? ' yak' : dur === 'iade' ? ' iade' : '');`

→ `'gec'`/`'yak'`/`'iade'` hem **JS string literal** hem **CSS class modifier** olarak kullanılıyor.  
Eğer rename edilirse CSS class'lar da güncellenmeli — **CSS + JS birlikte değişmeli**.

**Batch C kararı:** ⚠️ Bağımlı (CSS + JS birlikte) — ayrı alt batch önerilir. Stored değil (computed) ama CSS coupling var.

---

## 5 — Sohbet Tip Değerleri (`'bireysel'`, `'grup'`)

**Tarama:** `grep "'bireysel'|'grup'" ...`

**Eşleşmeler: ~14 satır**

| Dosya | Satırlar | Kullanım |
|---|---|---|
| index.html | 5161, 5170, 5178 | Seed data: `tip:'bireysel'`, `tip:'grup'` |
| sohbet.js | 24, 60, 67, 135, 213, 375, 380, 393, 458, 470, 479 | `sohbet.tip === 'bireysel'` / `=== 'grup'` karşılaştırmaları + atama |

**`APP.data.chats` seed verisinde stored** — localStorage migration gerekli.

**Batch C kararı:** ✅ Rename gerekli + migration  
Öneri: `'bireysel'` → `'direct'`, `'grup'` → `'group'`

---

## 6 — Log Aksiyon Değerleri

**Tarama:** `grep "'olusturuldu'|'dept-onayladi'|..." ...`

**Eşleşmeler:**

| Değer | Satırlar | Kullanım |
|---|---|---|
| `'olusturuldu'` | dept.service.js:35,83 / dept.js:223,265 / saha.js:452,468 / ocr.js:173 | `_mkLog('olusturuldu', ...)` çağrısı |
| `'dept-onayladi'` | fis.service.js:43 / dept.js:565,1068 | log.aksiyon değeri |
| `'acc-bekleyen'` log context | — | yukarıda sayıldı |

**saha.js satır 859:** `var ico = icoMap[le.aksiyon] || icoMap['olusturuldu'];`  
→ log.aksiyon değerleri UI'da ikon gösterimi için kullanılıyor, display değil key

**Batch C kararı:** ❓ Tartışmalı  
Log değerleri localStorage'a yazılıyor (receipts.log array). Rename edilirse migration gerekli ama kullanıcıya gösterilmiyor. Düşük öncelik — Batch C'nin ayrı alt adımı olabilir.

---

## 7 — Avans Durum Değerleri (`'ödendi'`, `'bekleyen'`)

**Tarama:** `grep "'ödendi'|'bekleyen'" ...`

**Eşleşmeler: ~30 satır**

### `'ödendi'`
- index.html satır 4072–4082: `accAdvanceHistory` seed data (`durum:'ödendi'`)
- index.html satır 4241–4334: `memberHistory` cache seed data (`durum:'ödendi'`)
- fis.service.js:207, report.service.js:148, dept.js:682, 761, 1023, 1315, 1346 / muhasebe.js:251, 255, 440, 579, 1144, 1315, 1347

### `'bekleyen'`
- index.html satır 4251, 4270, 4327, 4329, 4333 (memberHistory cache seed)
- muhasebe.js:250, 1144 (`durum === 'bekleyen'`)
- report.service.js:51, 125, 130 (fiş durum fallback — `receipts.durum`)

**⚠️ Dikkat:** `'bekleyen'` iki farklı context'te:
1. `accAdvanceHistory.durum` = avans durumu
2. `receipts.durum` = eski localStorage fallback (ARCHITECTURE gerekliliği)
→ Migration için bu iki use case ayrı ele alınmalı.

**`'ödendi'` özelliği:** Türkçe karakter içeriyor (`ö`). Unicode sorunu olabilir.

**Batch C kararı:** ✅ Rename gerekli + migration  
Öneri: `'ödendi'` → `'paid'`, `'bekleyen'` → `'pending'`

---

## 8 — CSS Class'larda Türkçe

**Tarama:** `grep "durum-|kat-|donem-|avans-|kira-|sohbet-|fis-|bekleyen|onaylandi|reddedildi" index.html | grep "class|\..*{"`

**Bulgular (seçilmiş önemli olanlar):**

| CSS Class | Satır | Açıklama |
|---|---|---|
| `.fis-*` (fis-hd, fis-row, fis-meta vb.) | 585–638 | `fis` → Turkish; 15+ class |
| `.avans-btn`, `.avans-btn-*` | 681–693 | `avans` → Turkish |
| `.sd-donem-*`, `.sa-donem-*` | 1040–1105 | `donem` → Turkish; pill/bar comps |
| `.sd-kat-*`, `.su-kat-*` | 1608–1629 | `kat` → Turkish |
| `.sohbet-*` | 2068–2140 | `sohbet` → Turkish; 10+ class |
| `.sd-kira-card.gec/.yak/.iade` | 1771–1783 | **JS string bağımlı** (yukarıda #4) |
| `.sa-av-durum-ok/.bek/.red` | 1805–1807 | avans durum CSS — `bek` zaten İngilizce kısaltma |
| `.sa-fis-dur-on/.bek/.red` | 1743–1746 | fiş durum CSS |

**NOT:** Çoğu CSS class (`fis-`, `avans-`, `sohbet-`, `donem-`, `kat-`) UI bileşen sınıfları — bunlar veriye değil, bileşen yapısına bağlı. Ayrı bir **CSS Rename batch**'i (D veya E) gerektirir.

**Batch C kararı:** 🔜 CSS class'lar Batch C kapsamı dışı — ayrı batch önerilir.  
**Tek istisna:** `.gec`/`.yak`/`.iade` modifiers JS string'e bağlı — #4 ile birlikte ele alınmalı.

---

## BATCH C KAPSAM ÖNERİSİ

### C1 — Fiş durum değerleri (HIGH)
| Eski | Öneri | Migration |
|---|---|---|
| `'dept-bekleyen'` | `'dept-pending'` | ✅ receipts.durum |
| `'acc-bekleyen'` | `'acc-pending'` | ✅ receipts.durum |
| `'onaylandi'` | `'approved'` | ✅ receipts.durum + accHistory.islem |
| `'reddedildi'` | `'rejected'` | ✅ receipts.durum + accHistory.islem |
| `'bolundu'` | `'split'` | ✅ receipts.durum |
| `'bekleyen'` | fallback — koru | (eski kayıtlar için) |

### C2 — Kategori değerleri (HIGH) — HTML + JS birlikte
| Eski | Öneri | Migration | HTML |
|---|---|---|---|
| `'Yakit'` | `'fuel'` | ✅ receipts.kat | ✅ option value |
| `'Yiyecek'` | `'catering'` veya `'food'` | ✅ | ✅ |
| `'Ekipman'` | `'equipment'` | ✅ | ✅ |
| `'Ulasim'` | `'transport'` | ✅ | ✅ |
| `'Konaklama'` | `'accommodation'` veya `'lodging'` | ✅ | ✅ |
| `'Kiralama'` | `'rental'` | ✅ | ✅ |
| `'Sanat'` | `'art'` | ✅ | ✅ |
| `'Diger'` | `'other'` veya `'misc'` | ✅ | ✅ |
| `'Teknik'` | ? (sadece HTML'de var — JS tutarsızlık) | ⚠️ önce araştır | ✅ |

### C3 — Avans durum değerleri (MEDIUM)
| Eski | Öneri | Migration |
|---|---|---|
| `'ödendi'` | `'paid'` | ✅ accAdvanceHistory.durum |
| `'bekleyen'` (avans) | `'pending'` | ✅ accAdvanceHistory.durum (receipts fallback'ten ayır) |

### C4 — Sohbet tip değerleri (MEDIUM)
| Eski | Öneri | Migration |
|---|---|---|
| `'bireysel'` | `'direct'` | ✅ chats.tip |
| `'grup'` | `'group'` | ✅ chats.tip |

### C5 — Kira durum değerleri (LOW — CSS coupling)
| Eski | Öneri | Not |
|---|---|---|
| `'aktif'` | `'active'` | Periods + exceptionPermits — iki ayrı obje |
| `'gec'` | `'overdue'` | CSS class `.gec` da değişmeli |
| `'yak'` | `'upcoming'` | CSS class `.yak` da değişmeli |
| `'iade'` | `'returned'` | CSS class `.iade` da değişmeli |

### C6 — Log aksiyon değerleri (LOW)
| Eski | Öneri | Not |
|---|---|---|
| `'olusturuldu'` | `'created'` | localStorage'da stored |
| `'dept-onayladi'` | `'dept-approved'` | localStorage'da stored |

---

## AÇIK SORULAR (Batch C prompt'u yazılmadan önce karar gerekiyor)

1. **`'Yiyecek'`** → `'food'` mü `'catering'` mı? (STATUS.md karar tablosunda bekliyor)
2. **`'Konaklama'`** → `'accommodation'` mü `'lodging'` mı? (STATUS.md karar tablosunda bekliyor)
3. **`'Diger'`** → `'other'` mü `'misc'` mı? (STATUS.md karar tablosunda bekliyor)
4. **`'Teknik'` kategorisi** — sadece HTML satır 2978'de var, JS'de yok. Mevcut bir bug mu? Silinmeli mi?
5. **`'aktif'` çakışması** — `periods[i].durum` ve `exceptionPermits[i].durum` aynı `'aktif'` değerini kullanıyor. Aynı enum mu, ayrı ayrı mı rename edilmeli?
6. **Log değerleri (C6)** — migration maliyeti var, kullanıcıya gösterilmiyor. Batch C'ye dahil mi?
7. **CSS class batch sırası** — CSS Türkçe class'lar (`.fis-`, `.sohbet-` vb.) Batch C ile mi yoksa ayrı batch D ile mi?

---

*Bu rapor sadece tarama sonucudur. Hiçbir dosya değiştirilmedi.*
