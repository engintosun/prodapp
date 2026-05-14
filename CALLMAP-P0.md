# CALLMAP-P0 — P0/★ Fonksiyon Çağrı Haritası

**Tarih:** 2026-05-08  
**Kapsam:** NAMING-INVENTORY.md'de ★ işaretli fonksiyonlar + P0 riskli enum kullanım noktaları  
**Amaç:** Rename sırasında kaçırılacak çağrı noktalarını önceden belgelemek  
**Kod değişikliği:** Yok — harita only.

Sütun anlamları: **Kaynak** = çağrıyı yapan dosya, **Satır** = index.html satır no, **Bağlam** = onclick/callback/doğrudan çağrı.

---

## 1. `deptOnayla(id)` → `deptApprove`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6094 | `onclick="deptOnayla(' + f.id + ')"` — sd-fis card butonu |
| `index.html` | 8496 | `_fisDetAksiyon` içinde `deptOnayla(_fisDetId)` — fiş detay aksiyonu |
| `modules/core/services/fis.service.js` | 17 | `export function deptOnayla(id)` — tanım |
| `modules/dept/dept.js` | 1042 | `export function deptOnayla(id)` — kopya tanım |

**Rename gerektiren:** index.html satır 6094, 8496 + fis.service.js + dept.js tanımları.

---

## 2. `deptReddet(id)` → `deptReject`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6095 | `onclick="deptReddet(' + f.id + ')"` — sd-fis card butonu |
| `index.html` | 8497 | `_fisDetAksiyon` içinde `deptReddet(_fisDetId)` |
| `modules/core/services/fis.service.js` | 74 | tanım |
| `modules/dept/dept.js` | 1092 | kopya tanım |

---

## 3. `deptOnaylaSecili()` → `deptApproveSelected`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6066 | `onclick="deptOnaylaSecili()"` — toolbar butonu |
| `index.html` | 6151 | `function deptOnaylaSecili()` — tanım |
| `modules/dept/dept.js` | 547 | kopya tanım |

---

## 4. `deptReddetSecili()` → `deptRejectSelected`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6067 | `onclick="deptReddetSecili()"` — toolbar butonu |
| `index.html` | 6209 | tanım |
| `modules/dept/dept.js` | 599 | kopya tanım |

---

## 5. `deptKismi(id, onayTutar, redNedeni)` → `deptPartial`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 8304 | `deptKismi(_kismiPending.id, t, n)` — `kismiOnayla` içinden |
| `modules/core/services/fis.service.js` | 119 | tanım |
| `modules/dept/dept.js` | 1132 | kopya tanım |

---

## 6. `accOnayla(id, _gecSebep)` → `accApprove`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6812 | `onclick="accOnayla(' + av.id + ')"` — avans onay butonu |
| `index.html` | 8500 | `_fisDetAksiyon` içinde `accOnayla(_fisDetId)` |
| `index.html` | 9327 | `onclick="accOnayla(' + f.id + ')"` — acc beklenen liste |
| `index.html` | 10672 | `_gecIslemModal` callback içinde `accOnayla(id, sebep)` |
| `modules/core/services/fis.service.js` | 190 | tanım |
| `modules/muhasebe/muhasebe.js` | — | import ediliyor (fis.service.js'den) |

---

## 7. `accReddet(id, _gecSebep)` → `accReject`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6813 | `onclick="accReddet(' + av.id + ')"` — avans red butonu |
| `index.html` | 8501 | `_fisDetAksiyon` içinde |
| `index.html` | 9328 | acc beklenen liste butonu |
| `index.html` | 10771 | `_gecIslemModal` callback |
| `modules/core/services/fis.service.js` | 245 | tanım |

---

## 8. `accKismi(id, onayTutar, redNedeni, _gecSebep)` → `accPartial`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 8306 | `accKismi(_kismiPending.id, t, n)` — `kismiOnayla` içinden |
| `index.html` | 10843 | `_gecIslemModal` callback |
| `modules/core/services/fis.service.js` | 298 | tanım |
| `modules/muhasebe/muhasebe.js` | — | import ediliyor |

---

## 9. `kismiOnayla()` → `partialApprove`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 3218 | `onclick="kismiOnayla()"` — modal butonu (HTML bloğu) |
| `index.html` | 8292 | `function kismiOnayla()` — tanım |
| `modules/saha/saha.js` | 725 | kopya tanım |

---

## 10. `openKismi(kaynak, id)` → `openPartial`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 8498 | `openKismi('dept', _fisDetId)` |
| `index.html` | 8502 | `openKismi('acc', _fisDetId)` |
| `index.html` | 8258 | `function openKismi(kaynak, id)` — tanım |
| `modules/saha/saha.js` | 692 | kopya tanım |

---

## 11. `openFisDetay(id, ctx)` → `openReceiptDetail`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 6080 | `onclick="openFisDetay(' + f.id + ',\'dept\')"` — sd-fis card |
| `index.html` | 8552 | `onclick="closeM('md-uye');openFisDetay(' + f.id + ',\'dept\')"` |
| `index.html` | 8695 | `onclick="closeM('md-acc-dept');openFisDetay(' + f.id + ',\'acc\')"` |
| `index.html` | 8835 | `onclick="closeM('md-acc-uye');openFisDetay(' + f.id + ',\'acc\')"` |
| `index.html` | 9319 | `onclick="openFisDetay(' + f.id + ',\'acc\')"` — acc beklenen |
| `index.html` | 8316 | `function openFisDetay(id, ctx)` — tanım |
| `modules/saha/saha.js` | 749 | kopya tanım |

**Not:** `ctx` parametresi `'dept'` veya `'acc'` string'i alıyor — zaten İngilizce, değişmez.

---

## 12. `fisThumbnail(f)` → `receiptThumbnail`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 5068 | `function fisThumbnail(f)` — tanım |
| `index.html` | 5178 | `fisThumbnail(d)` — `renderRecent` içinde |
| `index.html` | 6085 | `fisThumbnail(f)` — `renderDeptBek` içinde |
| `index.html` | 8432 | `fisThumbnail(f)` — `openFisDetay` içinde |
| `modules/saha/saha.js` | 132 | kopya tanım |

---

## 13. `renderDeptBek()` → `renderDeptPending`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 5756 | `renderDeptBek()` — `_addToDeptBekleyen` sonunda |
| `index.html` | 5851 | `renderDeptBek()` — `_addToDeptBekleyen` sonunda (istisna dalı) |
| `index.html` | 6124 | `renderDeptBek()` — `_sdToggleAll` sonunda |
| `index.html` | 6204 | `renderDeptBek(); renderDeptEkip(); renderDeptOzet()` — toplu onay sonrası |
| `index.html` | 6249 | aynı triad — toplu red sonrası |
| `index.html` | 6915 | `if (t === 'bek') renderDeptBek()` — sdTab içinde |
| `index.html` | 7097 | `renderDeptBek()` — `deptOnayla` sonrası |
| `index.html` | 7145 | `renderDeptBek()` — `deptReddet` sonrası |
| `index.html` | 6016 | `function renderDeptBek()` — tanım |
| `modules/dept/dept.js` | 419 | kopya tanım |

---

## 14. `_addToDeptBekleyen(...)` → `_addToDeptPending`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 5329 | `_addToDeptBekleyen(satici, kat, tutar, false, '')` — `submitOCR` içinde |
| `index.html` | 5348 | `_addToDeptBekleyen(sat2, kat2, tut2, false, '', [], entry.id)` |
| `index.html` | 7510 | `_addToDeptBekleyen('Belgesiz Harcama', kat, tutar, true, aciklama, fotos)` |
| `index.html` | 7542 | `_addToDeptBekleyen('Belgesiz Kiralama', bKat, bTut, true, bAciklama, fotos, bFisIdK)` |
| `index.html` | 7553 | `_addToDeptBekleyen('Belgesiz Harcama', bKat, bTut, true, bAciklama, fotos, bFisId)` |
| `index.html` | 5774 | `function _addToDeptBekleyen(...)` — tanım |
| `modules/dept/dept.js` | 202 | kopya tanım (farklı isim: `deptBekleyenEkle` — dikkat!) |

**Kritik:** index.html'deki `_addToDeptBekleyen` ile modules'deki `deptBekleyenEkle` farklı isimde aynı logic. Modül geçişinde hangisi canonical olacak netleşmeli.

---

## 15. `renderRecent()` — değişmez ama çağrı noktaları

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 4585 | `selectProj` sonrası |
| `index.html` | 5349 | `submitOCR` sonrası |
| `index.html` | 7543 | `submitBelgesiz` sonrası (kiralama dalı) |
| `index.html` | 7554 | `submitBelgesiz` sonrası (harcama dalı) |

Bu fonksiyon İngilizce kaldığı için listeye eklendi — saha modülü çıkarırken bağımlılık noktaları.

---

## 16. `renderDonem(did)` → `renderPeriod`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 4960 | `selectProj` sonrası `renderDonem(APP.ui.aktifDon)` |
| `index.html` | 5042 | `srchGoTo` içinde `renderDonem(f.donem)` |
| `index.html` | 7638 | `onclick="renderDonem(' + x.id + ')"` — dönem pill |
| `index.html` | 7887 | `yeniDonem` sonrası `renderDonem(yeniId)` |
| `index.html` | 7944 | `donemKapa` sonrası `renderDonem(donemId)` |
| `index.html` | 8081 | `_gecIslemModal` akışında `renderDonem(APP.ui.aktifDon)` |
| `index.html` | 7610 | `function renderDonem(did)` — tanım |
| `modules/saha/donem.js` | 24 | kopya tanım |

---

## 17. `yeniDonem()` → `newPeriod`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 2474 | `onclick="yeniDonem()"` — HTML bloğu, dönem yönetim butonu |
| `index.html` | 7868 | `donemKapa` içinde `yeniDonem()` çağrısı |
| `index.html` | 9206 | `onclick="yeniDonem()"` — acc dashboard butonu |
| `index.html` | 7848 | `function yeniDonem()` — tanım |
| `modules/saha/donem.js` | 228 | kopya tanım |

---

## 18. `donemKapa(donemId, sebep)` → `closePeriod`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 7868 | `donemKapa(aktif.id, 'otomatik...')` — `yeniDonem` içinde |
| `index.html` | 8153 | `donemKapa(_dnKapamaDonemId, sebep)` — `_dnKapamaUygula` içinde |
| `index.html` | 7896 | `function donemKapa(donemId, sebep)` — tanım |
| `modules/saha/donem.js` | 275 | kopya tanım |

---

## 19. `APP.ui.aktifDon` → `APP.ui.activePeriod`

**En yüksek kullanım sayısı — 54 ref index.html, 4 ref muhasebe.js**

Öne çıkan referans tipleri:

| Tip | Adet | Örnek |
|---|---|---|
| Okuma — filtre | 18 | `d.donem === APP.ui.aktifDon` |
| Okuma — buton/render çağrısı | 12 | `renderDonem(APP.ui.aktifDon)` |
| Yazma — veri oluşturma | 10 | `donem: APP.ui.aktifDon` |
| Koşul | 8 | `_isDonemKapali(APP.ui.aktifDon)` |
| Başlangıç değeri | 1 | `aktifDon: 2` (loadAppData) |
| Migrasyon | 3 | BUG-2 migration bloğu |
| muhasebe.js | 4 | okuma |

**Toplam:** ~58 referans. Bu rename **tek commit** gerektiren en büyük değişim.  
localStorage'a `APP.ui` yazılmıyor — migrasyon scripti gerekmez.

---

## 20. `APP.data.fisler` → `APP.data.receipts`

**80 referans index.html, 0 muhasebe.js (muhasebe.js accBekleyen kullanıyor)**

Kritik yazma noktaları (durum değişimi):

| Satır | İşlem |
|---|---|
| 5801 | `APP.data.fisler[_fi].durum = 'acc-bekleyen'` |
| 6186 | `APP.data.fisler[_fsi].durum = 'acc-bekleyen'` |
| 6238 | `APP.data.fisler[_srfi].durum = 'reddedildi'` |
| 7073 | `APP.data.fisler[_fi].durum = 'acc-bekleyen'` |
| 7135 | `APP.data.fisler[_rfi].durum = 'reddedildi'` |
| 7173 | `APP.data.fisler[_pfi].durum = 'bolundu'` |
| 8176 | `APP.data.fisler[fi].durum = 'onaylandi'` |

**localStorage'a yazılıyor** — key rename → migrasyon gerekir.

---

## 21. `durum` enum değerleri — tüm mutation noktaları

### `'dept-bekleyen'` / `'acc-bekleyen'` → `'dept-pending'` / `'acc-pending'`

Set noktaları (index.html):

| Satır | Bağlam |
|---|---|
| 3959–3991 | Seed data `durum: 'dept-bekleyen'` (13 kayıt) |
| 5338 | `durum: 'dept-bekleyen'` — `submitOCR` yeni fiş |
| 5532 | `durum: 'dept-bekleyen'` — kiralama fiş |
| 5548 | `durum: 'dept-bekleyen'` — belgesiz |
| 5791 | `durum: 'acc-bekleyen'` — istisna izniyle direkt acc |
| 5801 | `.durum = 'acc-bekleyen'` — fiş güncelleme |
| 6186 | `.durum = 'acc-bekleyen'` — dept onayı sonrası |
| 7073 | `.durum = 'acc-bekleyen'` |

### `'onaylandi'` → `'approved'`

| Satır | Bağlam |
|---|---|
| Seed data | `durum: 'onaylandi'` (20+ kayıt) |
| 6164 | `_mkLog('onaylandi', '')` |
| 7064 | aynı |
| 7075 | `_mkLog('dept-onayladi', '')` |
| 8176 | `.durum = 'onaylandi'` |
| 9515–9590 | rapor filtreleri `_f.durum === 'onaylandi'` |

### `'reddedildi'` → `'rejected'`

| Satır | Bağlam |
|---|---|
| Seed data | `durum: 'reddedildi'` (5 kayıt) |
| 6225 | `_mkLog('reddedildi', redNedeni)` |
| 6238 | `.durum = 'reddedildi'` |
| 7118 | `_mkLog('reddedildi', ...)` |
| 7135 | `.durum = 'reddedildi'` |
| 10778 | `_mkLog('reddedildi', ...)` |

### `'bolundu'` → `'split'`

| Satır | Bağlam |
|---|---|
| 7173 | `.durum = 'bolundu'` — kısmi onay parent fişi |
| 9153 | `_ff.durum === 'bolundu'` — acc rapor filtresi |
| 9513 | `_f.durum === 'bolundu'` |
| 9588 | aynı |

---

## 22. `kat` enum key'leri — tüm bağımlı yapılar

`'Yakit'`, `'Yiyecek'`, `'Ekipman'`, `'Sanat'`, `'Ulasim'`, `'Konaklama'`, `'Kiralama'`, `'Diger'` → `'fuel'`, `'food'`, `'equipment'`, `'art'`, `'transport'`, `'accommodation'`, `'rental'`, `'other'`

Eş zamanlı değişmesi gereken yapılar:

| Yapı | Dosya | Satır/konum |
|---|---|---|
| `KATEGORILER` dizi | `modules/core/constants.js` | satır 6–10 |
| `KAT_IC` obje key'leri | `constants.js` + `index.html:5060` | — |
| `SD_KAT_CLR` obje key'leri | `constants.js` + `index.html:5659` | — |
| `SD_KAT_LBL` obje key'leri | `constants.js` + `index.html:5664` | — |
| `KAT_LIMIT_DEFAULT[].kat` | `constants.js` + `index.html:5671` | — |
| `APP.seed.katLimit[].kat` | `index.html` | satır 5671–5679 |
| `_B_DEPT_MAP` (form default) | `index.html` | satır 5530 |
| Seed fisler `kat:` field | `index.html` | satır 3959–4005 (50+ kayıt) |
| deptBekleyen seed `kat:` | `index.html` | satır 4087–4103 |
| `<option value="">` dropdown'lar | `index.html` HTML bloğu | `f-kat`, `b-kat` select'leri |
| `_detectKatFromFis` içindeki string karşılaştırmaları | `index.html:5463` | — |
| `checkUlasimLimit` içindeki `'Ulasim'` karşılaştırması | `index.html:5519` | — |
| muhasebe.js inline `deptler`/`deptNm` map'leri | `muhasebe.js:43–45` | — |
| `_showDynPanel` içindeki `map` | `index.html:5434` | `'Ulasim'`, `'Yiyecek'`, `'Konaklama'`, `'Kiralama'` |

**localStorage'daki fis kayıtları `kat` field'ını string olarak saklıyor** — migrasyon scripti şart.

---

## 23. `accSupheIsle(id, action)` → `accSuspicionHandle`

| Kaynak | Satır | Bağlam |
|---|---|---|
| `index.html` | 9358 | `onclick="accSupheIsle(' + f.id + ',\'ok\')"` |
| `index.html` | 9359 | `onclick="accSupheIsle(' + f.id + ',\'red\')"` |
| `index.html` | 10942 | `function accSupheIsle(id, action)` — tanım |
| `modules/muhasebe/muhasebe.js` | 867 | kopya tanım |

**Not:** `action` parametresi `'ok'` veya `'red'` alıyor — bunlar accSuphe'ye özgü kısa kodlar (Section 11.3).

---

## 24. Modül Bağımlılık Zinciri — rename sırası

Rename yaparken modüller arası import bağımlılığı:

```
index.html (global scope)
  ↕ import
modules/core/state.js        (APP export)
modules/core/constants.js    (KATEGORILER, FIS_DURUM, DEPT_MAP...)
modules/core/utils.js        (_kiraDurum, _mkLog, _gunFarki...)
modules/core/services/
  storage.service.js         (saveAppData)
  fis.service.js             (deptOnayla, accOnayla...)
  dept.service.js            (deptBekleyenEkle...)
  report.service.js          (_computeRaporPersonel...)
modules/dept/dept.js         (_avGecmisEkle, _curDeptName, _avSortDesc...)
  ↑ import
modules/muhasebe/muhasebe.js (renderAccKira, renderAccDash...)
modules/saha/saha.js         (fisThumbnail, renderRecent...)
modules/saha/donem.js        (renderDonem, yeniDonem...)
modules/shared/export.js     (exportManager, showExportModal...)
modules/shared/ocr.js
modules/shared/onboarding.js
```

**Güvenli rename sırası:** constants → utils → services → dept.js → saha/donem → muhasebe → index.html

**index.html'de çift tanım riski:** Tüm fonksiyonlar hem index.html'de hem modül dosyalarında mevcut (Adım 7A kopyalama aşaması). Rename yaparken ikisi de birlikte değiştirilmeli — biri değişip diğeri değişmezse çalışma zamanı hangi tanımı aldığına göre sessiz hata oluşur.
