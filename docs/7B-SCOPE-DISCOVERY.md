# 7B — Scope Discovery: Modülü Aktive Etmek için Minimum İş

**Tarih:** 2026-05-08  
**Kapsam:** index.html HTML attribute analizi, global exposure haritası, strateji maliyet ölçümü  
**Yöntem:** Grep + satır sayımı. Kod değişikliği yok.

---

## Bölüm 1: HTML Attribute Fonksiyon Çağrıları

### 1.1 Attribute tipi sayımları

| Attribute | Satır sayısı |
|---|---|
| `onclick` | 197 |
| `oninput` | 12 |
| `onchange` | 8 |
| `onkeydown` | 1 |
| `onfocus` | 0 |
| `onblur` | 0 |
| `onsubmit` | 0 |
| `onload` | 0 |
| **Toplam** | **218** |

### 1.2 Static vs dynamic onclick

| Tip | Sayı | Açıklama |
|---|---|---|
| Static (sabit HTML) | 63 | `<button onclick="closeM('mo')">` |
| Dynamic (JS string içinde) | 134 | `'<div onclick="openFisDetay(' + f.id + ',...)'` |

Dynamic onclick'ler `innerHTML` assignment içinde string concat ile üretiliyor — event delegation olmadan `addEventListener` ile değiştirilemez.

### 1.3 Benzersiz fonksiyon envanteri (HTML attribute'tan çağrılan)

**PUBLIC (99 adet) — `_` prefix yok:**

| Fonksiyon | Attribute | Toplam çağrı |
|---|---|---|
| `closeM` | onclick | 32 |
| `saTab` | onclick | 7 |
| `sdTab` | onclick | 6 |
| `checkKiralamaBit` | oninput | 6 |
| `openFisDetay` | onclick | 5 |
| `openLBFis` | onclick | 5 |
| `closeAvMenu` | onclick | 5 |
| `accDeptTab` | onclick | 5 |
| `accUyeTab` | onclick | 3 |
| `showExportModal` | onclick | 4 |
| `toggleTheme` | onclick | 3 |
| `suNav` | onclick | 3 |
| `openNotifModal` | onclick | 3 |
| `goProjectSelect` | onclick | 3 |
| `checkUlasimLimit` | oninput+onchange | 3 |
| `checkBUlasimLimit` | oninput+onchange | 3 |
| `yeniDonem` | onclick | 2 |
| `openYeniSohbetModal` | onclick | 2 |
| `openM` | onclick | 2 |
| `openBelgesizModal` | onclick | 2 |
| `goLogin` | onclick | 2 |
| `doGaleri` | onclick | 2 |
| `closeSub` | onclick | 2 |
| `avansRedIptal` | onclick | 2 |
| `accSupheIsle` | onclick | 2 |
| `accReddet` | onclick | 2 |
| `accOnayla` | onclick | 2 |
| `accKiraIade` | onclick | 2 |
| `accAvansOpenKisi` | onclick | 1 |
| `accButceKaydet` | onclick | 1 |
| `avansRedOnay` | onclick | 1 |
| `clearSig` | onclick | 1 |
| `clearSig2` | onclick | 1 |
| `closeLB` | onclick | 1 |
| `closeNavSrch` | onclick | 1 |
| `closeSohbet` | onclick | 1 |
| `demoVeriOnay` | onclick | 1 |
| `deptAvansOnayla` | onclick | 1 |
| `deptAvansReddet` | onclick | 1 |
| `deptKiraIade` | onclick | 1 |
| `deptOnayla` | onclick | 1 |
| `deptOnaylaSecili` | onclick | 1 |
| `deptReddet` | onclick | 1 |
| `deptReddetSecili` | onclick | 1 |
| `doLogin` | onclick | 1 |
| `doOCR` | onclick | 1 |
| `donemIstisnaIzniVer` | onclick | 1 |
| `fillDemo` | onclick | 1 |
| `istisnaIzniIptal` | onclick | 1 |
| `kismiOnayla` | onclick | 1 |
| `markNotifRead` | onclick | 1 |
| `onBKatChange` | onchange | 1 |
| `onKatChange` | onchange | 1 |
| `onboardDone` | onclick | 1 |
| `onboardStep` | onclick | 1 |
| `openAccButceDuzenle` | onclick | 1 |
| `openAccDeptDetay` | onclick | 1 |
| `openAccUyeDetay` | onclick | 1 |
| `openDeptBelgesiz` | onclick | 1 |
| `openDeptOCR` | onclick | 1 |
| `openIstisnaIzniModal` | onclick | 1 |
| `openMarka` | onclick | 1 |
| `openProfil` | onclick | 1 |
| `openSaProfil` | onclick | 1 |
| `openSdProfil` | onclick | 1 |
| `openSohbet` | onclick | 1 |
| `openUyeProfil` | onclick | 1 |
| `renderAccRapor` | onclick | 1 |
| `renderDonem` | onclick | 1 |
| `saAvansSetDonem` | onclick | 1 |
| `saRaporToggleDonem` | onclick | 1 |
| `saSetDonem` | onclick | 1 |
| `sdAvansEkle` | onclick | 1 |
| `sdAvansFormAc` | onclick | 1 |
| `sdAvansFormKapat` | onclick | 1 |
| `sdGecmisSetDonem` | onclick | 1 |
| `sdSetDonem` | onclick | 1 |
| `selectProj` | onclick | 1 |
| `sendMesaj` | onclick | 1 |
| `sicAutoResize` | oninput | 1 |
| `sicKeydown` | onkeydown | 1 |
| `simGIB` | onclick | 1 |
| `sohbetGonder` | onclick | 1 |
| `srchGoTo` | onclick | 1 |
| `srchList` | oninput | 1 |
| `startOnboard` | onclick | 1 |
| `startYeniSohbet` | onclick | 1 |
| `submitAvans` | onclick | 1 |
| `submitBelgesiz` | onclick | 1 |
| `submitOCR` | onclick | 1 |
| `submitProfil` | onclick | 1 |
| `toggleAvMenu` | onclick | 1 |
| `toggleVoice` | onclick | 1 |
| `yeniGrupOlustur` | onclick | 1 |

**Özel: `exportManager` objesi** (metod çağrıları — 4 onclick):  
`exportManager.pdf(...)`, `exportManager.csv(...)`, `exportManager.excel(...)`, `exportManager.png(...)` — obje window'a expose edilmeli, metodlar ayrıca expose edilmez.

---

**PRIVATE (25 adet) — `_` prefix var, yine de HTML'den çağrılıyor:**

| Fonksiyon | Attribute | Toplam çağrı |
|---|---|---|
| `_fisDetAksiyon` | onclick | 5 |
| `_fdetFotoBuyut` | onclick | 2 |
| `_markaLogoRemove` | onclick | 3 |
| `_markaPickLogo` | onclick | 2 |
| `_bFotoOnFile` | onchange | 2 |
| `_bFotoGaleri` | onclick | 1 |
| `_bFotoKamera` | onclick | 1 |
| `_bFotoBuyut` | onclick | 1 |
| `_bFotoDel` | onclick | 1 |
| `_avatarFileChange` | onchange | 1 |
| `_avatarPickFile` | onclick | 1 |
| `_avatarRemove` | onclick | 1 |
| `_dnKapamaModal` | onclick | 1 |
| `_dnKapamaUygula` | onclick | 1 |
| `_gecIslemUygula` | onclick | 1 |
| `_markaFileChange` | onchange | 1 |
| `_markaKaydet` | onclick | 1 |
| `_saRaporDept` | onclick | 1 |
| `_saRaporDeptBack` | onclick | 1 |
| `_saRaporKisi` | onclick | 1 |
| `_saRaporKisiBack` | onclick | 1 |
| `_saRaporKisiFromDept` | onclick | 1 |
| `_sdToggle` | onclick | 1 |
| `_sdToggleAll` | onclick | 1 |
| `_yeniTabSec` | onclick | 1 |

> **Not:** `_` prefix'li fonksiyonların HTML attribute'tan çağrılması mimari bir tutarsızlık — bunlar "private" görünümünde ama aslında global erişim gerektiriyor. Strategy B'de bunlar da expose edilmeli.

### 1.4 Kompozit onclick'ler (18 adet)

Zincirleme çağrı içerenlerin dağılımı:

**Tek gerçek fonksiyon + `event.stopPropagation()` (9 adet) — pratik olarak tekil:**

```
event.stopPropagation(); _sdToggle(id)
event.stopPropagation(); deptOnayla(id)
event.stopPropagation(); deptReddet(id)
event.stopPropagation(); accOnayla(id)
event.stopPropagation(); accReddet(id)
event.stopPropagation(); openLBFis(id)   × 3
```

**İki gerçek fonksiyon (8 adet):**

```
closeAvMenu(); goProjectSelect()
closeAvMenu(); toggleTheme()
closeAvMenu(); startOnboard()
closeAvMenu(); goLogin()
closeSub(); openBelgesizModal()
closeM('mprofil'); openM('md-demo-reset')
closeM('md-uye'); openFisDetay(id, 'dept')
closeM('md-acc-dept'); openFisDetay(id, 'acc')
closeM('md-acc-uye'); openFisDetay(id, 'acc')
```

**Özel durum — fonksiyon çağrısı + global var ataması (1 adet):**

```
closeM('md-gec-islem'); _gecIslemCb=null;
```

`_gecIslemCb` bir global `var` — module scope'a geçince bu atama kırılır. Fonksiyon expose'u değil, var expose'u veya setter fonksiyonu gerektirir.

---

## Bölüm 2: Global Window Beklentilerinin Haritası

### 2.1 `window.X` referansları

| Referans | Tip | Satır | Amaç |
|---|---|---|---|
| `window.XLSX` | OKUMA | 3648, 3653, 3660, 3662, 3663 | SheetJS kütüphanesi |
| `window.jspdf` | OKUMA | 3668, 3672 | jsPDF kütüphanesi |
| `window.jsPDF` | OKUMA | 3672 | destructure |
| `window.event` | OKUMA | 3845 | export modal için |
| `window.innerHeight` | OKUMA | 3853 | PDF export |
| `window.SpeechRecognition` | OKUMA | 7404 | Web Speech API |
| `window.webkitSpeechRecognition` | OKUMA | 7404 | Safari fallback |
| `window.APP` | YAZMA | state.js:18 | modül state re-export |

**Toplam:** 8 okuma, 1 yazma (state.js'te, index.html'de değil).

Kütüphane referansları (`window.XLSX`, `window.jspdf`) zaten `defer` yüklenen harici script'lerden geliyor — bunlar module scope sorunuyla ilgisiz, global kalacak.

### 2.2 Top-level `var` tanımları (35 adet)

Ana `<script>` bloğundaki `var`'lar global scope'a yazılıyor; module scope'a geçince private olur.

```
var APP              (3423)   — state.js window.APP zaten handle ediyor
var FIS_DEMO         (4007)   — demo seed data
var SA_DONEM_DEPTS   (4263)   — acc rapor seed
var _avRedPending    (4467)   — modal state
var _markaPickType   (4681)   — marka modal state
var _markaPickId     (4682)   — marka modal state
var KAT_IC           (5060)   — constants duplikatı
var DOT              (5065)   — constants duplikatı
var DYN_PANEL_IDS    (5421)   — constants duplikatı
var _B_DEPT_MAP      (5530)   — dept label map
var _B_DEPT_KEYS     (5531)   — dept key list
var _DEPT_LBL_MAP    (5561)   — dept display name map
var SD_KAT_CLR       (5659)   — constants duplikatı
var SD_KAT_LBL       (5664)   — constants duplikatı
var bFotolar         (7446)   — foto upload state
var _istisnaDonemId  (7958)   — modal state
var _gecIslemCb      (8085)   — callback state
var _dnKapamaDonemId (8086)   — modal state
var _kismiPending    (8256)   — modal state
var _fisDetCtx       (8313)   — modal state
var _fisDetId        (8314)   — modal state
var _accDeptId       (8618)   — modal state
var _accUyeName      (8773)   — modal state
var _accUyeDept      (8774)   — modal state
var saRaporDeptId    (9057)   — rapor drill-down state
var saRaporKisiIdx   (9058)   — rapor drill-down state
var saRaporKisiFrom  (9059)   — rapor drill-down state
var saRaporSecilenDonemler (9060) — rapor state
var _aktifSohbetId   (10275)  — sohbet state
var _sicNearBottom   (10276)  — sohbet UI state
var _yeniSohbetTab   (10552)  — yeni sohbet tab state
var _onbStep         (10953)  — onboarding state
var _onbSteps        (10954)  — onboarding state
var _ONB_SVG         (10956)  — constants duplikatı
var _ONB_DATA        (10968)  — constants duplikatı
```

### 2.3 Module scope'a geçince kırılan var'lar

HTML attribute'lardan doğrudan referans edilen top-level var'lar:

| Var | Nerede referans | Sorun |
|---|---|---|
| `APP` | onclick: `_dnKapamaModal(' + APP.ui.aktifDon + ')`, `showExportModal('acc-' + APP.ui.saRaporTip)` | Dinamik onclick string içinde runtime'da erişiliyor — module scope'ta `window.APP` olduğu sürece çalışır (state.js zaten yazıyor) |
| `_gecIslemCb` | onclick: `closeM('md-gec-islem');_gecIslemCb=null;` | Doğrudan var ataması — module scope'ta kırılır, `window._gecIslemCb` veya setter fonksiyon gerekir |

`APP` zaten `state.js` tarafından `window.APP`'e yazılıyor → sorun yok.  
`_gecIslemCb` tek sorunlu var ataması.

---

## Bölüm 3: Üç Strateji Maliyet Analizi

### Strateji A — Tüm onclick'leri addEventListener'a Çevir

**Maliyet bileşenleri:**

| Kalem | Sayı | Not |
|---|---|---|
| Static HTML attribute değişikliği | 63 | Her birinde: ID bul, attribute sil, JS'de listener ekle |
| Dynamic (innerHTML) onclick kaldırma | 134 | `renderDeptBek`, `renderRecent` vb. içindeki string'lerden temizle; event delegation yaz |
| Delegation yazılacak render fonksiyonu | ~25–30 | Her dynamic onclick üreten render fn için bir delegation bloğu |
| Kompozit onclick ayrıştırması | 18 | Birden fazla çağrıyı tek listener'a taşı |
| `_gecIslemCb=null` özel durumu | 1 | Var atamasını fonksiyona çevir |
| Test yüzeysi | 218 olay bağlantısı | — |

**Tahmini ek satır:** ~300–400 yeni `addEventListener` + delegation bloğu  
**Risk:** Yüksek — dynamic innerHTML'ler için parent delegation seçicileri; dinamik ID'ler için `data-*` attribute pattern gerekebilir.

### Strateji B — Window Exposure Köprüsü

HTML attribute'lar değişmez. Module bloğuna expose satırları eklenir.

**Expose edilecek öğe sayısı:**

| Tip | Sayı | Örnek |
|---|---|---|
| Public fonksiyonlar | 99 | `window.deptOnayla = deptOnayla;` |
| Private fonksiyonlar (HTML'den çağrılan) | 25 | `window._fisDetAksiyon = _fisDetAksiyon;` |
| Obje (`exportManager`) | 1 | `window.exportManager = exportManager;` |
| Var (`_gecIslemCb`) | 1 | getter/setter veya doğrudan `window._gecIslemCb` |
| **Toplam expose satırı** | **126** | — |

**Ek adım:** `<script>` → `<script type="module">` dönüşümü (tek tag değişikliği).

**Maliyet:** 126 mekanik satır + tek tag değişikliği.  
**Risk:** Düşük — mevcut davranış korunuyor, sadece source canonical kaynak değişiyor.

### Strateji C — Hybrid (Kademeli)

| Faz | İş | Maliyet |
|---|---|---|
| Faz 1 | Strateji B (köprü) | 126 expose satırı |
| Faz 2+ | Expose'ları birer birer addEventListener ile değiştir, window satırını sil | Strateji A maliyeti — ama dağıtılmış, feature bazlı |

Faz 1 sonrası uygulama çalışıyor; Faz 2+ isteğe bağlı cleanup.

---

## Bölüm 4: Kompozit onclick Derinlik Analizi

| Zincir tipi | Adet | Strategy A notu |
|---|---|---|
| `event.stopPropagation()` + 1 fn | 9 | Delegation'da `e.stopPropagation()` listener içine taşınır |
| 2 gerçek fonksiyon | 8 | Tek listener'da iki çağrı |
| 2 fonksiyon + var ataması (`_gecIslemCb=null`) | 1 | Var ataması fonksiyon haline getirilmeli |

`_gecIslemCb` ataması tek gerçek "var'a doğrudan erişim" noktası — Strategy B'de `window._gecIslemCb = null` şeklinde çalışmaya devam edebilir (var `window` üzerinden erişilebilir olursa).

---

## Bölüm 5: Mevcut `<script type="module">` Bloğunun Durumu

```html
<script type="module">
  import * as CONST    from './modules/core/constants.js';
  import { APP }       from './modules/core/state.js';
  import * as UTILS    from './modules/core/utils.js';
  import * as STORAGE  from './modules/core/services/storage.service.js';
  import * as DEPT_SVC from './modules/core/services/dept.service.js';
  import * as FIS_SVC  from './modules/core/services/fis.service.js';
  import * as REPORT   from './modules/core/services/report.service.js';
  console.log('[PRODAPP] Modülerleşme aktif — Adım 3');
  console.log('[PRODAPP] Sabitler:', Object.keys(CONST).length);
  console.log('[PRODAPP] State anahtarları:', Object.keys(APP.data).length);
  console.log('[PRODAPP] Utils:', Object.keys(UTILS).length);
  console.log('[PRODAPP] Services:', ...);
</script>
```

**Durum:** Sadece import + console.log. Hiçbir iş yapmıyor, hiçbir şeyi expose etmiyor. Şu an tamamen pasif — modüller yükleniyor ama çıktıları kullanılmıyor. Bu blok Strategy B'nin genişletileceği yerdir.

**Mevcut module bloğu kapsıyor:** CONST, APP, UTILS, STORAGE, DEPT_SVC, FIS_SVC, REPORT — bu 7 modülün export'ları burada mevcut. saha.js, dept.js, muhasebe.js, donem.js, onboarding.js bu bloğa henüz import edilmemiş.

---

## Bölüm 6: Modüllerin Şu Anki Durumu

### Dosya listesi ve satır sayıları

| Dosya | Satır | Durum |
|---|---|---|
| `modules/muhasebe/muhasebe.js` | 1533 | Adım 7A kopyası — kullanılmıyor |
| `modules/dept/dept.js` | 1308 | Adım 6 kopyası — kullanılmıyor |
| `modules/saha/saha.js` | 961 | Adım 5 kopyası — kullanılmıyor |
| `modules/saha/donem.js` | 593 | Adım 5 kopyası — kullanılmıyor |
| `modules/shared/export.js` | 457 | Adım 4 kopyası — kullanılmıyor |
| `modules/core/services/fis.service.js` | 362 | Adım 3 — kullanılmıyor |
| `modules/shared/ocr.js` | 265 | Adım 4 kopyası — kullanılmıyor |
| `modules/core/services/report.service.js` | 157 | Adım 3 — kullanılmıyor |
| `modules/core/utils.js` | 151 | Adım 2 — import'ta var ama output kullanılmıyor |
| `modules/core/constants.js` | 123 | Adım 1 — import'ta var ama output kullanılmıyor |
| `modules/core/services/dept.service.js` | 113 | Adım 3 — kullanılmıyor |
| `modules/shared/onboarding.js` | 60 | Adım 4 — kullanılmıyor |
| `modules/core/services/storage.service.js` | 46 | Adım 3 — import'ta var ama output kullanılmıyor |
| `modules/core/state.js` | 38 | Adım 2 — `window.APP` yazıyor, tek aktif iş |
| **Toplam** | **6167** | — |

**Aktif çalışan modül:** Yalnızca `state.js` (`window.APP = APP` satırı).  
**Pasif yüklenen:** constants.js, utils.js, tüm services — console.log için import ediliyor, başka etkisi yok.  
**Hiç import edilmeyen:** muhasebe.js, dept.js, saha.js, donem.js, export.js, ocr.js, onboarding.js.

---

## Özet Tablo

| Soru | Cevap |
|---|---|
| Toplam `onclick` sayısı | 197 |
| Toplam `onchange` sayısı | 8 |
| Toplam `oninput` sayısı | 12 |
| Toplam `onkeydown` sayısı | 1 |
| **Toplam event attribute** | **218** |
| Benzersiz public fonksiyon (HTML attr'dan çağrılan) | 99 |
| Benzersiz private fonksiyon (HTML attr'dan çağrılan) | 25 |
| `exportManager` objesi | 1 |
| **Strategy B expose satırı** | **126** |
| Kompozit onclick sayısı | 18 |
| Static onclick | 63 |
| Dynamic onclick (JS string içinde) | 134 |
| Top-level `var` sayısı | 35 |
| HTML'den erişilen var (module scope kırılır) | 1 (`_gecIslemCb`) |
| HTML'den erişilen var (sorunsuz — `window.APP` var) | 1 (`APP`) |
| `window.X` okuma sayısı | 8 |
| `window.X` yazma sayısı | 1 (state.js — mevcut) |
| Modüllerdeki toplam satır | 6167 |
| Aktif çalışan modül sayısı | 1 (state.js) |
| Pasif yüklenen modül sayısı | 13 |

---

## Sonuç

**Minimum yol: Strategy B.**

Ana `<script>` tag'i `type="module"` yapılır. Module bloğuna 126 expose satırı eklenir. Tek blocker: `_gecIslemCb` var ataması — ya `window._gecIslemCb` erişilebilir yapılır ya da bir setter fonksiyon eklenir (1 satır).

Bu yaklaşım:
- Mevcut 218 event attribute'u dokunmadan bırakır
- 6167 satır modül kodunu canonical hale getirir (index.html artık kaynak değil)
- Tek commit'e sığar
- Strategy A'ya kademeli geçişi engellemiyor

**Strategy A doğrudan seçilirse:** 134 dynamic onclick nedeniyle event delegation altyapısı kurulması gerekiyor — tahminen 2–3 oturumluk ek iş.
