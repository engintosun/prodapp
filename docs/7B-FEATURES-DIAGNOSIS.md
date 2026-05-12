# 7B Features Diagnosis — Marka & Mesajlaşma Modülerleşme Tanısı

**Tarih:** 2026-05-08  
**Kapsam:** 7A'da modüle taşınmamış iki feature'ın tanısı: Marka Ayarları ve Sohbet Sistemi  
**Yöntem:** Grep tabanlı tarama. Kod değişikliği yok.  
**Kullanım:** 7B Strategy B uygulama promptu bu raporu referans alacak.

---

## 1. MARKA AYARLARI (Brand Settings)

### Konum: index.html satır 4681–4792

| Öğe | Satır | Tip |
|---|---|---|
| `var _markaPickType` | 4681 | top-level var |
| `var _markaPickId` | 4682 | top-level var |
| `function openMarka()` | 4684 | entry point |
| `function _markaPickLogo(type, id)` | 4713 | internal |
| `function _markaFileChange(inp)` | 4720 | internal |
| `function _markaLogoProcess(file, type, id)` | 4725 | internal |
| `function _markaLogoRemove(type, id)` | 4758 | internal |
| `function _markaKaydet()` | 4774 | internal |

**Toplam:** 2 var + 6 fonksiyon = ~112 satır

### Modül Durumu

- `modules/` ağacında **hiçbir marka referansı yok** (grep: 0 sonuç)
- Hiçbir modül dosyasının dependency comment'inde marka fonksiyonu listelenmemiş
- **BULGU: Feature 7A'da hiç kopyalanmamış — plan dışı bırakılmış**

### HTML Attribute Referansları (static)

| Satır | Attribute | Fonksiyon |
|---|---|---|
| 2608 | `onclick="openMarka()"` | Saha ekranı ikon buton |
| 3278 | `onclick="_markaPickLogo('co','')"` | Modal: şirket logo seç |
| 3279 | `onclick="_markaLogoRemove('co','')"` | Modal: şirket logo kaldır |
| 3283 | `onchange="_markaFileChange(this)"` | Modal: file input |
| 3284 | `onclick="_markaKaydet()"` | Modal: kaydet butonu |

**Dynamic onclick:** `openMarka()` içinde 2 dynamic onclick üretiliyor (satır 4704–4705): `_markaPickLogo('proj',...)` ve `_markaLogoRemove('proj',...)`

### 7B Etkisi

| Durum | Açıklama |
|---|---|
| **7B blocker DEĞİL** | Tüm fonksiyonlar ve var'lar index.html'de kalacak; modüllerden referans yok |
| **Expose gereksinimi** | 5 static + 2 dynamic = 7 onclick referansı. `openMarka`, `_markaPickLogo`, `_markaLogoRemove`, `_markaFileChange`, `_markaKaydet` window'a expose edilmeli |
| **Var expose** | `_markaPickType` ve `_markaPickId` modüllerden okunmuyor → expose gerekmez (sadece kendi fonksiyonları kullanıyor) |

### Neden 7A'da Taşınmadı?

Muhtemel sebepler:
1. Küçük, self-contained feature (~112 satır) — öncelik düşük
2. FileReader API + canvas logo işleme — DOM-heavy, modüle taşıması zorluk ekler
3. Sadece saha ekranından erişiliyor, cross-role dependency yok

---

## 2. SOHBET SİSTEMİ (Mesajlaşma 2.0)

### Konum: index.html satır 10173–10661

| Öğe | Satır | Tip |
|---|---|---|
| `function _fmtSohbetZaman(ts)` | 10175 | internal utility |
| `function _getSohbetAdi(sohbet, userKey)` | 10189 | internal utility |
| `function _getSohbetOkunmamis(sohbet, userKey)` | 10199 | internal utility |
| `function _getSonMesaj(sohbet)` | 10210 | internal utility |
| `function _sohbetFiltre(userKey)` | 10215 | internal utility |
| `function _sohbetAvHtml(sohbet, userKey)` | 10232 | internal utility |
| `function renderSohbetListesi(containerEl, userKey)` | 10243 | public render |
| `var _aktifSohbetId` | 10275 | top-level var |
| `var _sicNearBottom` | 10276 | top-level var |
| `function openSohbet(id)` | 10286 | entry point |
| `function closeSohbet()` | 10327 | entry point |
| `function _sohbetMarkRead(sohbet, userKey)` | 10333 | internal |
| `function _renderSohbetIci(sohbet, userKey)` | 10346 | internal render |
| `function sohbetGonder()` | 10393 | entry point |
| `function _refreshSohbetListeler()` | 10441 | internal refresh |
| `function _yeniSohbetAliciListe(userKey)` | 10516 | internal |
| `var _yeniSohbetTab` | 10552 | top-level var |
| `function openYeniSohbetModal()` | 10554 | entry point |
| `function _renderYeniSohbetTabs(userKey)` | 10567 | internal render |
| `function startYeniSohbet(hedefKey)` | 10642 | entry point |

**Toplam:** 3 var + 17 fonksiyon = ~489 satır

### Modül Durumu

- `modules/` ağacında **sohbet modülü yok** (modules/shared/ altında sadece export.js, ocr.js, onboarding.js)
- Modül dosyalarındaki sohbet referansları **sadece dependency comment'lerinde**:
  - `muhasebe.js:34` — `renderSohbetListesi, openYeniSohbetModal` (global olarak çağırıyor)
  - `muhasebe.js:1494-1499` — sohbet HTML render + `renderSohbetListesi()` bare name çağrısı
  - `dept.js:19` — `renderDeptMesaj` comment (sohbet bölümünden)
  - `saha.js:12` — `_escHtml` comment (sohbet bölümünden)
- **BULGU: Feature 7A'da hiç kopyalanmamış — plan dışı bırakılmış**

### HTML Attribute Referansları (static)

| Satır | Attribute | Fonksiyon |
|---|---|---|
| 3229 | `onclick="closeSohbet()"` | Sohbet geri butonu |
| 3237 | `onclick="sohbetGonder()"` | Sohbet gönder butonu |

**Dynamic onclick:** Modül ve index.html JS kodunda üretilen dynamic onclick'ler:

| Üretici | Satır | Dynamic onclick |
|---|---|---|
| `renderSohbetListesi()` | 10258 | `openSohbet('...')` |
| `_refreshSohbetListeler()` Dept | 10478 | `openYeniSohbetModal()` |
| `_refreshSohbetListeler()` Acc | 10508 | `openYeniSohbetModal()` |
| `_yeniSohbetAliciListe()` | 10588 | `startYeniSohbet('...')` |
| `muhasebe.js:1496` | modül | `openYeniSohbetModal()` (bare name) |

### Cross-Module Bağımlılık

| Modül | Fonksiyon | Kullanım | Bare Name? |
|---|---|---|---|
| `muhasebe.js` | `renderSohbetListesi()` | satır 1499: doğrudan çağırıyor | ✅ bare name |
| `muhasebe.js` | `openYeniSohbetModal()` | satır 1496: onclick string içinde | onclick (window gerekli) |

**⚠️ muhasebe.js `renderSohbetListesi()` çağrısı 7B blocker olabilir** — bu fonksiyon index.html'de tanımlı, modülden bare name ile çağrılıyor. `<script type="module">` geçişinde `window.renderSohbetListesi` olması gerekir.

### 7B Etkisi

| Durum | Açıklama |
|---|---|
| **7B partial blocker** | `muhasebe.js` bare name ile `renderSohbetListesi()` çağırıyor — window expose gerekli |
| **Expose gereksinimi** | Static: `closeSohbet`, `sohbetGonder`. Dynamic: `openSohbet`, `openYeniSohbetModal`, `startYeniSohbet`. muhasebe.js bare name: `renderSohbetListesi`. **Toplam: 6 fonksiyon expose** |
| **Var expose** | `_aktifSohbetId`, `_sicNearBottom`, `_yeniSohbetTab` — modüllerden doğrudan okunmuyor, kendi fonksiyonları kullanıyor → expose gerekmez |

### Neden 7A'da Taşınmadı?

Muhtemel sebepler:
1. Büyük feature (~489 satır, 17 fonksiyon) — kendi başına bir modül gerektirir
2. Cross-role kullanım: saha, dept ve muhasebe ekranlarının üçünden de çağrılıyor
3. `_escHtml` gibi utility bağımlılığı sohbet bölümünde tanımlı — taşıma sırasında dependency çözümlemesi gerekir
4. Yoğun DOM manipülasyonu ve event binding (scroll listener, keydown) — modül izolasyonu zorlaştırır

---

## 3. Özet Tablo

| Feature | Satır Sayısı | Fonksiyon | Var | Modül Durumu | 7B Blocker |
|---|---|---|---|---|---|
| Marka Ayarları | ~112 | 6 | 2 | Hiç kopyalanmadı | Hayır |
| Sohbet Sistemi | ~489 | 17 | 3 | Hiç kopyalanmadı | Kısmen (`renderSohbetListesi` bare name) |

---

## 4. 7B Uygulama Promptu İçin Özet

### Ek Expose Satırları (mevcut 126 listeye eklenmeli)

**Marka (5 fonksiyon):**
```
window.openMarka = openMarka;
window._markaPickLogo = _markaPickLogo;
window._markaLogoRemove = _markaLogoRemove;
window._markaFileChange = _markaFileChange;
window._markaKaydet = _markaKaydet;
```

**Sohbet (6 fonksiyon):**
```
window.renderSohbetListesi = renderSohbetListesi;
window.openSohbet = openSohbet;
window.closeSohbet = closeSohbet;
window.sohbetGonder = sohbetGonder;
window.openYeniSohbetModal = openYeniSohbetModal;
window.startYeniSohbet = startYeniSohbet;
```

**Toplam ek:** 11 satır → expose listesi 126 + 11 = **137 satır**

### Yeni 7B Blocker

| Var/Fonksiyon | Modül | Satır | Sorun | Çözüm |
|---|---|---|---|---|
| `renderSohbetListesi` | muhasebe.js | 1499 | bare name fonksiyon çağrısı | `window.renderSohbetListesi` expose yeterli (fonksiyon index.html'de kalıyor, window üzerinden erişilir) |

**Not:** `muhasebe.js:1499`'daki `renderSohbetListesi(...)` çağrısı, `<script type="module">` geçişinde `ReferenceError` **vermez** — çünkü çağrı muhasebe modülü içindedir ve modül fonksiyonu çalıştığında index.html'deki expose bloğu zaten yüklenmiş olacaktır. Ancak modül strict mode'da bare name olarak çağırması, `window.renderSohbetListesi` üzerinden olması gerekir. **dept.js ve saha.js'teki sohbet comment'leri sadece yorum — bare name çağrı yok.**

### muhasebe.js Patch Gereksinimi

`muhasebe.js:1499` satırındaki:
```js
renderSohbetListesi(document.getElementById('sa-sohbet-liste'), 'm');
```
→ module scope'ta `renderSohbetListesi` tanımlı olmadığından, ya:
- A) `window.renderSohbetListesi(...)` olarak değiştir (1 satır patch)
- B) Modül başına `var renderSohbetListesi = window.renderSohbetListesi;` alias ekle

**Tavsiye A** — minimal değişiklik, 7B patch kapsamında.

---

## 5. Güncellenmiş Toplam 7B Maliyet Tahmini

| Kalem | Sayı |
|---|---|
| Expose satırları (7B-SCOPE-DISCOVERY) | 126 |
| Marka + Sohbet ek expose | +11 |
| 7B-VARS-DIAGNOSIS blocker expose | +5 |
| **Toplam expose** | **~142** |
| Modül bare name patch (dept.js + fis.service.js + muhasebe.js) | ~10 satır |
| `<script>` → `<script type="module">` dönüşümü | 1 değişiklik |
