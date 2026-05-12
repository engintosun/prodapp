# 7B Vars Diagnosis — Top-level `var` Modül Karşılaştırması

**Tarih:** 2026-05-08  
**Kapsam:** index.html'deki 35 top-level `var` tanımının `modules/` ağacındaki denginin tespiti  
**Yöntem:** Grep tabanlı tarama. Kod değişikliği yok.  
**Kullanım:** 7B Strategy B uygulama promptu bu raporu referans alacak.

---

## Ana Tablo (35 satır)

| NAME | DURUM | LOKASYON | ERİŞİM | NOT |
|---|---|---|---|---|
| `APP` | MEVCUT | `modules/core/state.js:13` | export | `export var APP = window.APP` — re-export pattern; initial value window.APP, not `{}` |
| `FIS_DEMO` | YOK | — | yok | saha.js:780-781 ve ocr.js:78'den bare name ile kullanılıyor → 7B blocker |
| `SA_DONEM_DEPTS` | YOK | — | yok | muhasebe.js:688,769,771,1394,1449'dan bare name ile kullanılıyor → 7B blocker |
| `_avRedPending` | YOK | — | yok | dept.js (7 ref) ve fis.service.js (1 ref) bare name ile okur/yazar; hiçbirinde tanımlı değil → 7B blocker |
| `_markaPickType` | YOK | — | yok | Marka feature hiçbir modüle taşınmamış; modüllerden referans yok → 7B blocker DEĞİL |
| `_markaPickId` | YOK | — | yok | Aynı; modüllerden referans yok → 7B blocker DEĞİL |
| `KAT_IC` | MEVCUT | `modules/core/constants.js:11` | export | Birebir aynı içerik; saha.js + donem.js import ediyor |
| `DOT` | MEVCUT | `modules/core/constants.js:52` | export | Birebir aynı içerik; saha.js + donem.js import ediyor |
| `DYN_PANEL_IDS` | MEVCUT | `modules/core/constants.js:70` | export | Birebir aynı içerik (boşluk farkı önemsiz); saha.js import ediyor |
| `_B_DEPT_MAP` | KISMEN | `modules/saha/saha.js:390` | private | Aynı içerik, private `var` (export yok); constants.js'te canonical karşılığı `DEPT_MAP` (farklı isim) |
| `_B_DEPT_KEYS` | KISMEN | `modules/saha/saha.js:391` | private | Aynı içerik, private; constants.js'te canonical karşılığı `DEPT_KEYS` (farklı isim) |
| `_DEPT_LBL_MAP` | KISMEN | `modules/dept/dept.js:30` | private | İçerik kısmen farklı: hem `Yapim` hem `yapim` key var, `diger` yok; constants.js `DEPT_MAP`'ten ayrı |
| `SD_KAT_CLR` | MEVCUT | `modules/core/constants.js:17` | export | Birebir aynı içerik; dept.js import ediyor |
| `SD_KAT_LBL` | MEVCUT | `modules/core/constants.js:23` | export | Birebir aynı içerik; dept.js + saha.js import ediyor |
| `bFotolar` | MEVCUT | `modules/shared/ocr.js:195` | export | `export var bFotolar = []`; saha.js comment'te "ocr.js modülünden" notu var, import yok (global dependency olarak bırakılmış) |
| `_istisnaDonemId` | MEVCUT | `modules/saha/donem.js:336` | private | `var _istisnaDonemId = null`; aynı initial value |
| `_gecIslemCb` | MEVCUT | `modules/saha/donem.js:453` | private | `var _gecIslemCb = null`; aynı initial value. **Özel:** `onclick="closeM(...);_gecIslemCb=null;"` module scope'ta var'a doğrudan yazıyor — window exposure veya setter gerekli |
| `_dnKapamaDonemId` | MEVCUT | `modules/saha/donem.js:454` | private | `var _dnKapamaDonemId = null`; aynı initial value |
| `_kismiPending` | MEVCUT | `modules/saha/saha.js:690` | private | `var _kismiPending = null`; aynı initial value |
| `_fisDetCtx` | MEVCUT | `modules/saha/saha.js:746` | private | `var _fisDetCtx = ''`; aynı initial value |
| `_fisDetId` | MEVCUT | `modules/saha/saha.js:747` | private | `var _fisDetId = 0`; aynı initial value |
| `_accDeptId` | MEVCUT | `modules/muhasebe/muhasebe.js:20` | private | `var _accDeptId = ''`; aynı initial value |
| `_accUyeName` | MEVCUT | `modules/muhasebe/muhasebe.js:21` | private | `var _accUyeName = ''`; aynı initial value |
| `_accUyeDept` | MEVCUT | `modules/muhasebe/muhasebe.js:22` | private | `var _accUyeDept = ''`; aynı initial value |
| `saRaporDeptId` | MEVCUT | `modules/muhasebe/muhasebe.js:23` | private | `var saRaporDeptId = ''`; aynı initial value |
| `saRaporKisiIdx` | MEVCUT | `modules/muhasebe/muhasebe.js:24` | private | `var saRaporKisiIdx = -1`; aynı initial value |
| `saRaporKisiFrom` | MEVCUT | `modules/muhasebe/muhasebe.js:25` | private | `var saRaporKisiFrom = ''`; aynı initial value |
| `saRaporSecilenDonemler` | MEVCUT | `modules/muhasebe/muhasebe.js:26` | private | `var saRaporSecilenDonemler = [2, 1, 0]`; aynı initial value |
| `_aktifSohbetId` | YOK | — | yok | Sohbet modülü hiç oluşturulmadı; modüllerden referans yok → 7B blocker DEĞİL |
| `_sicNearBottom` | YOK | — | yok | Sohbet modülü yok; modüllerden referans yok → 7B blocker DEĞİL |
| `_yeniSohbetTab` | YOK | — | yok | Sohbet modülü yok; modüllerden referans yok → 7B blocker DEĞİL |
| `_onbStep` | MEVCUT | `modules/shared/onboarding.js:13` | private | `var _onbStep = 0`; aynı initial value |
| `_onbSteps` | MEVCUT | `modules/shared/onboarding.js:14` | private | `var _onbSteps = []`; aynı initial value |
| `_ONB_SVG` | KISMEN | `modules/core/constants.js:95` | export | İsim farkı: `_ONB_SVG` → `ONB_SVG` (underscore yok). İçerik birebir aynı. onboarding.js import ediyor, index.html `_ONB_SVG` global'i kullanıyor |
| `_ONB_DATA` | KISMEN | `modules/core/constants.js:107` | export | İsim farkı: `_ONB_DATA` → `ONB_DATA`. İçerik birebir aynı. onboarding.js import ediyor |

---

## Özet

| Kategori | Sayı | Listesi |
|---|---|---|
| **MEVCUT** | 22 | APP, KAT_IC, DOT, DYN_PANEL_IDS, SD_KAT_CLR, SD_KAT_LBL, bFotolar, _istisnaDonemId, _gecIslemCb, _dnKapamaDonemId, _kismiPending, _fisDetCtx, _fisDetId, _accDeptId, _accUyeName, _accUyeDept, saRaporDeptId, saRaporKisiIdx, saRaporKisiFrom, saRaporSecilenDonemler, _onbStep, _onbSteps |
| **KISMEN** | 5 | _B_DEPT_MAP, _B_DEPT_KEYS, _DEPT_LBL_MAP, _ONB_SVG, _ONB_DATA |
| **YOK** | 8 | FIS_DEMO, SA_DONEM_DEPTS, _avRedPending, _markaPickType, _markaPickId, _aktifSohbetId, _sicNearBottom, _yeniSohbetTab |
| **Toplam** | **35** | |

---

## 7B Uygulama Risk Analizi

### Gerçek Blockerlar (modül kodu bare name ile kullanıyor, tanımlı değil)

Şu 3 YOK var, modül dosyalarında `window.` prefix'i olmadan bare name ile kullanılıyor. `<script type="module">` geçişinde `ReferenceError` üretir:

#### 1. `FIS_DEMO`
- **Kullananlar:** `modules/saha/saha.js:780-781`, `modules/shared/ocr.js:78`
- **Modül dependency notu:** `ocr.js:5` yorum satırında `// FIS_DEMO, notif, openM...` şeklinde global bağımlılık listesi var
- **7B çözümü:** Expose bloğuna `window.FIS_DEMO = FIS_DEMO;` ekle (index.html global'i window'a sabitle)

#### 2. `SA_DONEM_DEPTS`
- **Kullananlar:** `modules/muhasebe/muhasebe.js:688,769,771,1394,1449`
- **Modül dependency notu:** `muhasebe.js:33` yorum satırında `// showExportModal, SA_DONEM_DEPTS, _avRedPending,...` listesi var
- **7B çözümü:** Expose bloğuna `window.SA_DONEM_DEPTS = SA_DONEM_DEPTS;` ekle

#### 3. `_avRedPending`
- **Kullananlar:** `modules/dept/dept.js` (7 ref: okuma + yazma), `modules/core/services/fis.service.js:254` (yazma)
- **Modül dependency notu:** `dept.js:20` yorum: `// _avRedPending (global var)`. `fis.service.js:11` yorum: `// _curDeptName, _avRedPending, openM...`
- **Ek karmaşıklık:** İki farklı modül YAZAR — cross-module mutable state. `window._avRedPending = null` ile expose edilirse, modül kodunun `window._avRedPending` şeklinde okuması/yazması gerekir. Ama mevcut modül kodu `_avRedPending` bare name kullanıyor.
- **7B çözümü seçenekleri:**
  - A) Expose bloğuna `window._avRedPending = null;` ekle VE dept.js + fis.service.js içindeki bare name `_avRedPending` referanslarını `window._avRedPending` ile değiştir (patch gerektirir)
  - B) dept.js'te `var _avRedPending = null;` tanımla, fis.service.js import etsin — daha temiz ama modül içi değişiklik
  - **Tavsiye A** — 7B patch kapsamında minimal değişiklik

---

### KISMEN varların 7B etkisi

| Var | 7B Etkisi |
|---|---|
| `_B_DEPT_MAP` | saha.js'te private `var` olarak self-contained — 7B sonrası sorunsuz çalışır. index.html global `_B_DEPT_MAP` orphan olur (sorun değil) |
| `_B_DEPT_KEYS` | Aynı şekilde self-contained — sorun yok |
| `_DEPT_LBL_MAP` | dept.js'te private, self-contained — sorun yok |
| `_ONB_SVG` | onboarding.js zaten `ONB_SVG` import ediyor. index.html'de kalan `_onbRender` fonksiyonu global `_ONB_SVG`'yi kullanıyor — 7B expose bloğuna `window._ONB_SVG = _ONB_SVG;` (veya index.html `_onbRender` → onboarding.js'e taşınırsa gereksiz) |
| `_ONB_DATA` | Aynı: `window._ONB_DATA = _ONB_DATA;` gerekebilir index.html `_onbRender` için |

---

### MEVCUT private varların 7B özel durumu

| Var | Özel Durum |
|---|---|
| `_gecIslemCb` | `onclick="closeM('md-gec-islem');_gecIslemCb=null;"` — HTML'den bare name ile module-private var'a atama. Modül scope'a geçince `ReferenceError`. Expose bloğuna `window._gecIslemCb = null;` + onclick'te yazma için `window._gecIslemCb = null` ya da `resetGecIslemCb()` setter fonksiyonu gerekli. (Zaten CLAUDE.md ve 7B-SCOPE-DISCOVERY'de belgelenmiş) |

---

### ARCHITECTURE 10.4 Tutarlılık Kontrolü

7B1-CONSTANTS-DISCOVERY ve ARCHITECTURE 10.4'te "Aktif duplikat" olarak işaretlenen 7 var için durum:

| Var | ARCHITECTURE 10.4 | Bu Rapor | Tutarlı? |
|---|---|---|---|
| `KAT_IC` | Aktif duplikat — 7B sonrası index.html `var` silinecek | MEVCUT / export | ✅ |
| `SD_KAT_CLR` | Aktif duplikat — silinecek | MEVCUT / export | ✅ |
| `SD_KAT_LBL` | Aktif duplikat — silinecek | MEVCUT / export | ✅ |
| `DOT` | Aktif duplikat — silinecek | MEVCUT / export | ✅ |
| `DYN_PANEL_IDS` | Aktif duplikat — silinecek | MEVCUT / export | ✅ |
| `_ONB_SVG` | İsim farkıyla duplikat — 7B sırasında silinecek | KISMEN / export (ONB_SVG) | ✅ (isim farkı zaten belgelenmişti) |
| `_ONB_DATA` | İsim farkıyla duplikat — 7B sırasında silinecek | KISMEN / export (ONB_DATA) | ✅ |

Tüm 7 var ARCHITECTURE 10.4 ile tutarlı.

---

## 7B Uygulama Promptu için Özet

**7B öncesi yapılacak (veya 7B içinde patch):**

1. `FIS_DEMO` → `window.FIS_DEMO = FIS_DEMO;` expose bloğuna ekle
2. `SA_DONEM_DEPTS` → `window.SA_DONEM_DEPTS = SA_DONEM_DEPTS;` expose bloğuna ekle
3. `_avRedPending` → Seçenek A: `window._avRedPending = null;` expose + dept.js ve fis.service.js'teki bare name referansları `window._avRedPending`'e çevir (7 + 1 = 8 satır patch)
4. `_gecIslemCb` → `window._gecIslemCb = null;` expose + onclick'te doğrudan atama için setter (zaten biliniyordu)
5. `_ONB_SVG` / `_ONB_DATA` → index.html'deki `_onbRender` hâlâ bunları kullanıyorsa expose; onboarding.js'e taşınırsa gereksiz

**126 expose satırı + bu 5 ek satır = toplam ~131 satır.**
