# 7B.1 — Constants Discovery Report

**Tarih:** 2026-05-08  
**Kapsam:** `modules/core/constants.js` exports ↔ `index.html` karşılaştırması  
**Yöntem:** Grep + satır bazlı doğrulama. Kod değişikliği yok.

---

## Özet Tablo

| # | Export | index.html karşılığı | İçerik eşleşmesi | Modül import | Durum |
|---|---|---|---|---|---|
| 1 | `KAT_IC` | `var KAT_IC` (5060) | ✅ Birebir | saha.js, donem.js | Duplikat — aktif |
| 2 | `SD_KAT_CLR` | `var SD_KAT_CLR` (5659) | ✅ Birebir | dept.js | Duplikat — aktif |
| 3 | `SD_KAT_LBL` | `var SD_KAT_LBL` (5664) | ✅ Birebir | dept.js, saha.js | Duplikat — aktif |
| 4 | `DOT` | `var DOT` (5065) | ✅ Birebir | saha.js, donem.js | Duplikat — aktif |
| 5 | `DYN_PANEL_IDS` | `var DYN_PANEL_IDS` (5421) | ✅ Birebir | saha.js | Duplikat — aktif |
| 6 | `ONB_SVG` | `var _ONB_SVG` (10956) | ✅ Birebir | onboarding.js | İsim farkı — aktif |
| 7 | `ONB_DATA` | `var _ONB_DATA` (10968) | ✅ Birebir | onboarding.js | İsim farkı — aktif |
| 8 | `DEPT_MAP` | yok (3 ayrı yerel map) | ⚠️ Yakın, ama farklı | hiçbiri | Yalnız — import yok |
| 9 | `DEPT_KEYS` | `var _B_DEPT_KEYS` (5531) | ⚠️ İçerik aynı, isim farklı | hiçbiri | Yalnız — import yok |
| 10 | `KAT_LIMIT_DEFAULT` | `APP.seed.katLimit` (5671) | ⚠️ Aynı veri, farklı yapı | hiçbiri | Yalnız — import yok |
| 11 | `KATEGORILER` | yok | — | hiçbiri | Yalnız — import yok |
| 12 | `FIS_DURUM` | yok | — | hiçbiri | Yalnız — import yok |
| 13 | `ROL` | yok | — | hiçbiri | Yalnız — import yok |
| 14 | `UL_SEHIRICI_RATE` | inline literal `15` (5497) | ⚠️ Literal, değişken yok | hiçbiri | Yalnız — import yok |
| 15 | `UL_SEHIRDISI_RATE` | inline literal `25` (5497) | ⚠️ Literal, değişken yok | hiçbiri | Yalnız — import yok |
| 16 | `PASIF_ONAY_GUN` | inline literal `7` (8158) | ⚠️ Literal, değişken yok | hiçbiri | Yalnız — import yok |
| 17 | `PASIF_ONAY_MS` | `var yedi_gun = 7*24*60*60*1000` (8158) | ⚠️ Hesaplama var, sabit yok | hiçbiri | Yalnız — import yok |

**Toplam:** 17 export — 7 aktif duplikat, 3 yakın-ama-farklı, 7 import edilmeyen yalnız sabit.

---

## Kategori A — Birebir Duplikatlar (aktif, 2 kaynaktan okunuyor)

Bu beş sabit hem index.html global scope'unda `var X = ...` olarak tanımlı, hem constants.js'te `export var X = ...` olarak tanımlı, hem de modüller constants.js'ten import ediyor. Şu anda **iki kaynak yaşıyor**; modüller ES import'tan, index.html fonksiyonları global `var`'dan okuyor.

### `KAT_IC`

```
index.html:5060  var KAT_IC = { Yakit: '<svg...>', Yiyecek: '<svg...>', def: '<svg...>' }
constants.js:11  export var KAT_IC = { ... }   ← birebir aynı
```

**Tüketim noktaları:**

| Dosya | Satır | Bağlam |
|---|---|---|
| index.html | 5169 | `KAT_IC[d.kat] \|\| KAT_IC.def` — `renderRecent` |
| index.html | 7705 | `KAT_IC[f.kat] \|\| KAT_IC.def` — `renderDonem` |
| saha.js | 261 | `KAT_IC[d.kat] \|\| KAT_IC.def` — import'tan |
| donem.js | 119 | `KAT_IC[f.kat] \|\| KAT_IC.def` — import'tan |

### `SD_KAT_CLR`

```
index.html:5659  var SD_KAT_CLR = { Yakit:'var(--am)', ... }
constants.js:17  export var SD_KAT_CLR = { ... }   ← birebir aynı
```

**Tüketim noktaları:**

| Dosya | Satır | Bağlam |
|---|---|---|
| index.html | 6072 | `renderDeptBek` — fiş kart rengi |
| index.html | 6977 | `renderDeptGecmis` |
| index.html | 8550 | `openUyeProfil` |
| dept.js | 469, 981 | import'tan |

### `SD_KAT_LBL`

```
index.html:5664  var SD_KAT_LBL = { Yakit:'Yakıt', Ulasim:'Ulaşım', Diger:'Diğer', ... }
constants.js:23  export var SD_KAT_LBL = { ... }   ← birebir aynı
```

**Tüketim noktaları:** 7 — index.html satır 5983, 6000, 6073, 6976, 6998, 8388, 8551; dept.js satır 386, 403, 470, 980, 1000; saha.js satır 810.

### `DOT`

```
index.html:5065  var DOT = { bekleyen:'var(--am)', 'dept-bekleyen':'var(--am)', ... }
constants.js:52  export var DOT = { ... }   ← birebir aynı
```

**Tüketim noktaları:**

| Dosya | Satır | Bağlam |
|---|---|---|
| index.html | 5183 | `renderRecent` — durum noktası |
| index.html | 7735 | `renderDonem` — durum noktası |
| saha.js | 274 | import'tan |
| donem.js | 148 | import'tan |

### `DYN_PANEL_IDS`

```
index.html:5421  var DYN_PANEL_IDS = ['ul-panel','ym-panel','ko-panel','ki-panel']
constants.js:70  export var DYN_PANEL_IDS = ['ul-panel', 'ym-panel', 'ko-panel', 'ki-panel']
```

Tek fark: index.html'de virgülden sonra boşluk yok.

**Tüketim noktaları:**

| Dosya | Satır | Bağlam |
|---|---|---|
| index.html | 5424–5425 | `_hideAllDynPanels` — `getElementById(p + id)` döngüsü |
| saha.js | 282–283 | import'tan, aynı kullanım |

---

## Kategori B — İsim Farkıyla Duplikat (içerik aynı)

### `ONB_SVG` ← `_ONB_SVG`

```
index.html:10956  var _ONB_SVG = { Camera: '...', CalendarDays: '...', ... }
constants.js:95   export var ONB_SVG = { ... }   ← içerik birebir aynı
```

Tek fark: index.html'de `_` prefix var, constants.js'te yok.

**Tüketim:**
- index.html 10993: `_ONB_SVG[s.icon]` — global `var`'dan
- onboarding.js 23: `ONB_SVG[s.icon]` — import'tan

### `ONB_DATA` ← `_ONB_DATA`

```
index.html:10968  var _ONB_DATA = { user:[...], dept:[...], acc:[...] }
constants.js:107  export var ONB_DATA = { ... }   ← içerik birebir aynı
```

**Tüketim:**
- index.html 11008: `_ONB_DATA[role]` — global `var`'dan
- onboarding.js 38: `ONB_DATA[role]` — import'tan

---

## Kategori C — Yakın Ama Farklı (dikkat gerektiren)

### `DEPT_MAP` ← 3 farklı yerel map

constants.js'teki `DEPT_MAP` için index.html'de tek bir karşılık yok — üç ayrı map var, her birinin kapsam ve içerik farkı var:

| Map | Dosya:Satır | Keys | `'diger'` | Case | Fark |
|---|---|---|---|---|---|
| `_B_DEPT_MAP` | index.html:5530 | lowercase | ✅ var | lowercase only | belgesiz form dropdown için |
| `_DEPT_LBL_MAP` | index.html:5561 | **her ikisi** (Yapim + yapim) | ❌ yok | case-insensitive lookup için duplicate key | `_curDeptName()` fonksiyonu için |
| `deptNm` (local) | muhasebe.js:44 | lowercase | ❌ yok | lowercase only | `renderAccKira` içinde tek kullanım |
| `DEPT_MAP` | constants.js:72 | lowercase | ✅ var | lowercase only | hiç import edilmiyor |

**Kritik fark:** `_DEPT_LBL_MAP` hem `Yapim` hem `yapim` key'ini tutarken `DEPT_MAP` sadece `yapim` tutuyor. `_curDeptName()` caseinsensitive lookup için bunu kasıtlı yapıyor. `DEPT_MAP` ile değiştirilemez — önce `curUser.dept` normalize edilmeli.

### `DEPT_KEYS` ← `_B_DEPT_KEYS`

```
index.html:5531  var _B_DEPT_KEYS = ['yapim','kamera','sanat','ses','kostum','diger']
constants.js:81  export var DEPT_KEYS = ['yapim', 'kamera', 'sanat', 'ses', 'kostum', 'diger']
```

İçerik birebir aynı, isim ve prefix farklı. `DEPT_KEYS` hiç import edilmiyor; `_B_DEPT_KEYS` sadece `openBelgesizModal` içinde kullanılıyor (satır 5546).

### `KAT_LIMIT_DEFAULT` ← `APP.seed.katLimit`

```
constants.js:30   export var KAT_LIMIT_DEFAULT = [{ kat:'Yakit', lbl:'Yakıt', limit:5000, clr:'...' }, ...]
index.html:5671   APP.seed.katLimit = [{ kat:'Yakit', lbl:'Yakıt', limit:5000, clr:'...' }, ...]
```

**İçerik başlangıçta aynı, ama semantik olarak farklı:**

- `KAT_LIMIT_DEFAULT` → statik default — kullanıcı değiştirse bile bu değer sıfırlanmaz
- `APP.seed.katLimit` → runtime mutable — `accButceKaydet()` (satır 9131) bu diziyi yerinde günceller, `saveAppData()` localStorage'a yazar

`KAT_LIMIT_DEFAULT` `APP.seed.katLimit`'i başlatmak için hiç kullanılmıyor — iki değer bağımsız yaşıyor. `loadAppData` da bunu restore etmiyor.

---

## Kategori D — Yalnız Sabitler (constants.js'te var, index.html'de karşılığı yok, hiç import edilmiyor)

### `KATEGORILER`

```js
export var KATEGORILER = ['Yakit', 'Yiyecek', 'Ekipman', 'Sanat', 'Ulasim', 'Konaklama', 'Kiralama', 'Diger'];
```

index.html'de bu dizi yok. Kategori listesi `APP.seed.katLimit` üzerinden dolaylı yürütülüyor. `KATEGORILER` hiçbir modül tarafından import edilmiyor, kullanılmıyor.

### `FIS_DURUM`

```js
export var FIS_DURUM = {
  DEPT_BEKLEYEN: 'dept-bekleyen',
  ACC_BEKLEYEN:  'acc-bekleyen',
  ONAYLANDI:     'onaylandi',
  REDDEDILDI:    'reddedildi',
  BOLUNDU:       'bolundu'
};
```

index.html'de karşılığı yok. **Hiçbir modül import etmiyor.** Kod genelinde `FIS_DURUM.ONAYLANDI` yerine `'onaylandi'` string literal'ı doğrudan yazılıyor. Bu sabit şu anda etkinleştirilmemiş.

### `ROL`

```js
export var ROL = { SAHA: 'user', DEPT: 'dept', MUHASEBE: 'acc' };
```

index.html'de karşılığı yok. Hiçbir modül import etmiyor. Rol karşılaştırmaları kod genelinde `curUser.role === 'user'` gibi string literal ile yapılıyor.

### `UL_SEHIRICI_RATE` / `UL_SEHIRDISI_RATE`

```js
export var UL_SEHIRICI_RATE  = 15;  // ₺/km
export var UL_SEHIRDISI_RATE = 25;  // ₺/km
```

index.html'de named constant yok. Değerler iki yerde inline:
- Satır 5497: `var rate = tipEl.value === 'dis' ? 25 : 15;`
- Satır 2706–2707, 2812–2813: HTML `<option>` label'larında `"max 15₺/km"`, `"max 25₺/km"`

Hiçbir modül import etmiyor.

### `PASIF_ONAY_GUN` / `PASIF_ONAY_MS`

```js
export var PASIF_ONAY_GUN = 7;
export var PASIF_ONAY_MS  = 7 * 24 * 60 * 60 * 1000;
```

index.html'de named constant yok. Tek kullanım:
- Satır 8158: `var yedi_gun = 7 * 24 * 60 * 60 * 1000;`

`PASIF_ONAY_MS` bu hesaplamanın sabit versiyonu. Hiçbir modül import etmiyor.

---

## Bulgular

### 1. Aktif çift kaynak — modüller ve index.html ayrı kopyadan okuyor

Kategori A'daki 5 sabit (`KAT_IC`, `SD_KAT_CLR`, `SD_KAT_LBL`, `DOT`, `DYN_PANEL_IDS`) şu anda **iki bağımsız kopya** olarak yaşıyor: index.html fonksiyonları global `var`'ı, modüller ES import'u kullanıyor. Modülerleşme tam tamamlanana kadar bu senkronda kalmalı; biri değişirse diğeri de değişmeli.

### 2. `ONB_SVG`/`ONB_DATA` underscore tutarsızlığı

index.html `_ONB_SVG` diyorken constants.js `ONB_SVG` diyor — aynı veri, farklı isim. index.html'deki `_onbRender` global `_ONB_SVG`'yi okuyor; onboarding.js import'tan `ONB_SVG`'yi okuyor. Şu an çalışıyor çünkü global scope'taki `_ONB_SVG` index.html'de tanımlı ve onboarding.js `<script type="module">` olarak yükleniyor (global'e erişmez; import'tan okur). İkisi de kendi kaynağından doğru okuyor.

### 3. `FIS_DURUM` ve `ROL` — etkinleştirilmemiş sabitler

Bu ikisi constants.js'te tanımlandı ama hiçbir kod henüz bunları kullanmıyor. Kod genelinde string literal `'onaylandi'`, `'dept'`, `'user'` devam ediyor. constants.js'te Adım 1'de yer tutucu olarak tanımlandılar.

### 4. Üç farklı dept map — birleştirme riski var

`_B_DEPT_MAP`, `_DEPT_LBL_MAP`, `muhasebe.js:deptNm` aynı veriyi üç farklı şekilde tutuyor. `DEPT_MAP` (constants.js) birleştirmek için uygun aday ama `_DEPT_LBL_MAP`'in case-insensitive lookup davranışı kaybedilmeden değiştirilemez.

### 5. `KAT_LIMIT_DEFAULT` ↔ `APP.seed.katLimit` bağlantısı kopuk

`KAT_LIMIT_DEFAULT` constants.js'te tanımlı ama `APP.seed.katLimit`'i initialize etmek için kullanılmıyor. `loadAppData()` localStorage'dan restore ederken de `KAT_LIMIT_DEFAULT`'u referans almıyor. Değer değişirse iki yer ayrı ayrı güncellenmeli.

### 6. `UL_SEHIRICI_RATE`, `PASIF_ONAY_GUN` — HTML label'larına kadar sızıyor

Bu sabitler `<option>` text'lerinde de hard-coded (`"max 15₺/km"`). Named constant kullanıma alınsa bile HTML label'ları JS ile güncellenmediği için değer değişirse iki yerde tutarsızlık oluşur.

---

## Öneri Matrisi (7B scope)

| Sabit | Eylem | Risk |
|---|---|---|
| `KAT_IC`, `SD_KAT_CLR`, `SD_KAT_LBL`, `DOT`, `DYN_PANEL_IDS` | index.html `var`'ını sil, modüller zaten import ediyor | 🟠 Orta — index.html fonksiyonları global'i doğrudan kullanıyor; `<script type="module">` scope sorununa dikkat |
| `ONB_SVG`, `ONB_DATA` | index.html'deki `_ONB_SVG`/`_ONB_DATA`'yı sil, `_onbRender` import'tan okusun | 🟡 Düşük — içerik aynı |
| `DEPT_KEYS` / `_B_DEPT_KEYS` | `_B_DEPT_KEYS`'i `DEPT_KEYS` import ile değiştir | 🟡 Düşük |
| `FIS_DURUM`, `ROL` | Tüm string literal kullanımlarını enum referansına dönüştür | 🔴 Yüksek — geniş kapsam, localStorage etkisi |
| `KATEGORILER` | `APP.seed.katLimit` ile bağla veya dropdown doldurmada kullan | 🟡 Düşük |
| `KAT_LIMIT_DEFAULT` | `loadAppData` içinde katLimit restore için kaynak yap | 🟠 Orta — localStorage migration |
| `DEPT_MAP` | `_B_DEPT_MAP` + `_DEPT_LBL_MAP` + `muhasebe.js:deptNm`'yi birleştir; önce `curUser.dept` normalize | 🟠 Orta |
| `UL_SEHIRICI_RATE`, `UL_SEHIRDISI_RATE` | inline `25:15`'i import'la değiştir + HTML label'larını güncelle | 🟡 Düşük |
| `PASIF_ONAY_GUN`, `PASIF_ONAY_MS` | `_checkPasifOnay` içindeki `yedi_gun` değişkenini import'la değiştir | 🟢 Minimal |
