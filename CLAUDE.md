# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PRODAPP v8.0** — A Turkish-language, mobile-first film/production crew expense management PWA. Core application lives in `index.html`; a parallel `modules/` tree is being built incrementally (see Modülerleşme Gerçeği below). No build system, no package manager, no bundler, no server-side code.

To run: `python -m http.server 8000` (veya VS Code Live Server) gerekli — ES6 module CORS kuralı nedeniyle `file://` ile açmak artık çalışmıyor.

## Proje Bağlamı

Bu uygulama **film prodüksiyon ekiplerinin saha harcamalarını** yönetmesi için tasarlanmıştır. Hedef pazar **Türkiye**'dir; tüm arayüz metinleri, bildirimler ve iş akışları Türkçedir.

### Kullanıcı Rolleri

| Rol | `curUser.role` | Açıklama |
|---|---|---|
| Saha | `user` | Fiş tarar, harcama girer, avans alır |
| Dept | `dept` | Departman harcamalarını görür ve onaylar |
| Muhasebe | `acc` | Tüm projelerin muhasebe görünümü |

Her rol, `selectProj()` içinde farklı bir ekrana yönlendirilir (`su` → `sd` → `sa`). Üç ekran da tam çalışır durumda.

### Renk Paleti

Tüm renkler `:root` CSS değişkeni olarak tanımlıdır. **Asla doğrudan hex kodu kullanma**, her zaman değişkeni kullan:

| Değişken | Hex | Kullanım |
|---|---|---|
| `--bg` | `#0C0A08` | Ana koyu arka plan |
| `--ac` | `#E8962E` | Turuncu aksan, birincil butonlar |
| `--gr` | `#22C55E` | Onay / başarı |
| `--rd` | `#EF4444` | Hata / red |
| `--am` | `#F59E0B` | Uyarı / bekleyen |
| `--bl` | `#3B82F6` | Bilgi |

### Geliştirme Dili Standardı

- **Vanilla JS, ES5 stili** korunacak: `var`, `function` bildirimleri, `function(x) {}` callbacks.
- `let`, `const`, arrow function (`=>`), class, template literal kullanılmayacak.
- Dış kütüphane veya framework eklenmeyecek.

**Modül istisnası (7B Strategy B sonrası):** `modules/*.js` dosyalarında `import`/`export` ifadeleri ve modül entry point'inde (`<script type="module">` bloğu) `window.X = X` expose satırları ES6 sözdizimi gerektirir — bu satırlar istisnadır. Fonksiyon gövdeleri ve `var` bildirimleri yine ES5 kalır.

### Gelecek Hedef: Supabase Entegrasyonu

Mevcut tüm demo verisi (`USERS`, `PROJS`, `DONEMLER`, `DATA`, `FIS_DEMO`) ileride Supabase ile değiştirilecek. Yeni özellikler eklerken bu geçişi kolaylaştıracak şekilde veri erişimini fonksiyon içine izole et — veri objesine script genelinde doğrudan erişmek yerine bir okuma fonksiyonu üzerinden geç.

---

## Architecture

Uygulama iki katmanlı:

**Aktif katman — `index.html` (~11077 satır):**
1. **CSS** (`<style>` block, lines ~11–3346) — all styles inline, organized by screen with `/* ══ SECTION ══ */` banner comments.
2. **HTML** (lines ~3346–3415) — thin shell; most UI is rendered via JS `innerHTML`.
3. **JavaScript** (`<script>` block, lines ~3415–11060) — organized by feature with `/* ═══ SECTION ═══ */` banners. **Bu blok tüm çalışan kodu içeriyor.**
4. **Module entry** (`<script type="module">`, satır ~11062) — sadece import + console.log; şu an pasif.

**Modül katmanı — `modules/` (14 dosya, 6167 satır — şu an dead code):**
Adım 1–7A kopyalama aşaması tamamlandı. 7B Strategy B uygulanana kadar bu dosyalar çalışmıyor — sadece `state.js` aktif (`window.APP` yazıyor). Detay: docs/7B-SCOPE-DISCOVERY.md.

### Screen System

Screens are `<div class="scr">` elements. Only one is visible at a time. `.scr.on` sets `display:flex`. Navigation uses:
- `showScr(id)` — hides all, shows the target screen
- `hideAll()` — removes `.on` from every `.scr`

Screen IDs: `sl` (login), `sp` (project select), `su` (field/saha — main), `sd` (dept), `sa` (accounting).

### State

All app state lives under the `APP` namespace object:
- `APP.seed.*` — static demo/config data (users, projs, donemler, deptEkip, katLimit)
- `APP.data.*` — runtime data (fisler, deptBekleyen, accBekleyen, accGecmis, deptGecmis, accAvansGecmis, donemButce, accDepts, globalInbox, sohbetler, deptKira, accKiralamalar, accSuphe)
- `APP.ui.*` — UI state (curUser, curUserKey, curProj, aktifDon, sdSec, notiflar, etc.)
- `APP.cache.*` — computed/derived data (accDeptKatlar, accRaporPersonel, etc.)

### Key Features & Their Functions

| Feature | Entry point | Notes |
|---|---|---|
| Auth | `doLogin()` | Accepts username alias (`saha`/`dept`/`muhasebe`) or short key |
| Project select | `selectProj(pid)` | Routes to different screens by `curUser.role` |
| Expense list | `renderRecent()` | Filters `DATA` by current user + active period |
| OCR / receipt scan | `openOCR(idx)` | Simulated; cycles through `FIS_DEMO` array |
| Long-press sub-menu | `openSub()` / `closeSub()` | Triggered by 500 ms hold on OCR button |
| Signature | `initSig(canvasId, statusId)` | Canvas-based, mouse + touch |
| Voice input | `toggleVoice()` / `stopVoice()` | Web Speech API (`webkitSpeechRecognition`) |
| GIB verification | `simGIB()` | Simulated delay + success toast |
| Period report | `renderDonem(did)` | Reads `DONEMLER` by id |
| PDF export | `expPDF()` | Browser `window.print()` based |
| Modals | `openM(id)` / `closeM(id)` | Toggles `.on` class |
| Toasts | `notif(msg, type)` | types: `'green'` `'amber'` `'blue'` `'red'` |
| Dept approval    | `deptOnayla(id)`, `deptReddet(id)` | Single + bulk (`deptOnaylaSecili`, `deptReddetSecili`) |
| Partial approval | `deptKismi(id,t,r)`, `accKismi(id,t,r,s)` | Parent → 'bolundu', 2 child records |
| Acc approval     | `accOnayla(id)`, `accReddet(id)` | Final approval/rejection + accGecmis archive |
| Period mgmt      | `yeniDonem()`, `donemKapa(id,s)` | Asymmetric close (saha/dept locked, acc soft) |
| Passive approval | `_checkPasifOnay()` | Auto-approve after 7 days, rental exempt |
| Late processing  | `_gecIslemModal(id,t,cb)` | Closed period intervention with mandatory reason |
| Messaging        | `renderSohbetListesi()`, `openSohbet(id)` | Individual + group chat, read tracking |

### CSS Conventions

- CSS custom properties (`--bg`, `--ac`, `--gr`, `--rd`, `--am`, `--bl` and their `2` variants) defined in `:root` — always use these, never hardcode colors.
- Utility classes: `.btn`, `.btn-p` (primary), `.btn-g` (green), `.btn-r` (red), `.btn-sm`, `.btn-full`; `.fg`/`.fgi` for form groups/inputs; `.al-am`/`.al-rd`/`.al-gr`/`.al-bl` for alert banners; `.tag-gr`/`.tag-am`/`.tag-rd` for status pills.

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Saha Personeli | `saha` | `1234` |
| Dept. Sorumlusu | `dept` | `1234` |
| Muhasebe | `muhasebe` | `1234` |

## Editing Guidelines

- The JS block uses `var` and `function` declarations (ES5 style) — maintain this style; do not introduce `let`/`const`/arrow functions/classes unless refactoring the whole file. **Exception:** module entry-level statements in `modules/*.js` (`import`/`export`/`window.X = X`) require ES6 syntax and are exempt from this rule.
- UI is rendered by setting `innerHTML` strings directly — no templating engine.
- Adding a new screen: add a `<div id="sX" class="scr">` in HTML, add CSS under a new banner section, call `showScr('sX')` to navigate to it.
- Adding a new feature section in JS: place it after the nearest related section, delimited with `/* ═══ FEATURE NAME ═══ */`.

---

## Modülerleşme Gerçeği (8 Mayıs 2026)

**Şu anki durum:** Modüller dead code. Ana `<script>` bloğu `type="module"` değil, modüllerden import edemiyor. 14 modül dosyası kopyalanmış ama sadece `state.js` aktif (`window.APP = APP` yazıyor). Adım 7A "kopyalama" idi, "aktive etme" değildi.

**7B Strategy B uygulanana kadar:**
- Tüm gerçek kod index.html'de — hem index.html hem modüller aynı kodu çalıştırmıyor, sadece index.html çalışıyor.
- Modül dosyalarına kod ekleme/düzenleme yapma — henüz etkisi yok.
- index.html'deki `<script>` bloğuna normal şekilde yaz.

**7B Strategy B uygulandıktan sonra:**
- HTML attribute'lara (`onclick`, `onchange`, `oninput`) DOKUNMA — bunlar `window.X` üzerinden çalışmaya devam eder.
- `_` prefix'li fonksiyonlar HTML'den çağrılıyor — bunlar da window'a expose edilecek, davranış değişmez.
- Dynamic onclick'ler (`innerHTML` string içinde) Strategy B ile zaten çalışır.
- `_gecIslemCb` özel: var ataması olan tek onclick (`_gecIslemCb=null`) — window üzerinden erişilebilir yapılmış olacak.

---

## Naming Refactor Kuralları (henüz uygulanmadı)

Naming envanteri 3 raporda: `NAMING-INVENTORY.md`, `CALLMAP-P0.md`, `7B1-CONSTANTS-DISCOVERY.md`.

**Bulk replace YASAK — özellikle şu kökler için:**

| Kök | Neden tehlikeli |
|---|---|
| `gec` | 3 anlam: kira overdue (`'gec'`), geçmiş kayıtlar (`gecmis`), geç işlem (`gecIslem`) |
| `tip` | 4 alan: sohbet type, item type (avans), export type, rapor type — value'lar karışır |
| `durum` | 5 obje tipinde farklı value setleri (fis/donem/istisna/avans/accSuphe) |
| `kat` | 12 yapıda eş zamanlı değişmeli (KAT_IC, SD_KAT_CLR, katLimit, dropdown option value'ları...) |

**Sektörel terim kararları alınmadan refactor başlatılmaz** — 6 karar STATUS.md'de bekliyor.

---

## Çalışma Kuralları

### 1. Kapsam Kontrolü

Her prompt'ta "Kapsam Özeti" bölümü olacak. Sadece o kapsamdaki dosyalara dokunulur. Kapsamda olmayan dosyalara dokunma, yorum yapma, refactor etme.

### 2. Tek Commit Prensibi

Her prompt = tek iş = tek commit. Birden fazla iş birleştirilmez. Commit mesajı Türkçe, kısa ve net.

### 3. Doküman Disiplini

Kod değişirse ilgili md dosyası AYNI commit'te güncellenir. Md güncellenmeden commit atılmaz. Güncellenecek md'ler: SCHEMA.md (field değişikliği), WORKFLOWS.md (akış değişikliği), ARCHITECTURE.md (mimari karar), STATUS.md (iş tamamlama).

### 4. Tanı vs Uygulama Prompt'ları

Prompt "SADECE OKU VE RAPORLA" veya "değişiklik yapma" diyorsa:
- Hiçbir dosyayı değiştirme
- git commit atma
- git push yapma
- Sadece raporu ver

Prompt uygulama prompt'uysa:
- Değişiklikleri yap
- Commit at (tek)
- Push et
- Özet raporu ver

### 5. Satır Numarası Uyuşmazlığı

Prompt'taki satır numarası dosyada başka bir şey gösteriyorsa:
- DUR
- "Satır X'te beklenen Y bulamadım, gerçek içerik Z" diye raporla
- Tahmin ederek benzer yerde değişiklik yapma
- Kullanıcı onay bekle

### 6. İletişim Dili

- Türkçe yaz
- Kısa ve net ol
- "Yapabilir miyim?", "Uygun mu?" gibi fazla nezaket yerine doğrudan bulguyu sun

---

## ETKİ ANALİZİ KURALI (her kod değişikliğinde zorunlu)

### ADIM 0 — Analiz (kod değiştirmeden ÖNCE)
1. Değişecek veri yapılarını / fonksiyonları belirle
2. grep -n "değişenŞey" index.html → tüm kullanım noktalarını listele
3. Her kullanım için tek satırda raporla:
   Satır no | fonksiyon adı | okuma/yazma/filtre/render | etkilenir mi?
4. Etkilenen noktaların HEPSİNİN fix kapsamında olduğunu teyit et

### ADIM 0.5 — Karar ve bildirim
Etki analizinde orijinal görev dışında etkilenen nokta bulursan:

A) KÜÇÜK yan etki (aynı field, aynı pattern, mekanik düzeltme):
   - Düzelt
   - Konsola bildir: "⚠️ YAN ETKİ FIX: [fonksiyon:satır] — [ne yapıldı]"
   - Commit mesajına ekle

B) BÜYÜK yan etki (farklı akış, risk belirsiz):
   - DOKUNMA
   - Konsola bildir: "🛑 YAN ETKİ BULUNDU: [detay] — onay bekleniyor"
   - Orijinal fix'i uygula, yan etkiyi YAPMA

Küçük/büyük ayrımı: Aynı field, aynı pattern, aynı fix → küçük.
Farklı akış, farklı fonksiyon grubu, belirsiz sonuç → büyük.

### ADIM SON — Dokümantasyon (commit ÖNCE)
1. git diff --stat ile değişen dosyaları listele
2. Etki analizinde bulunan yan etkiler (fix'lenen veya bekleyen)
   → STATUS.md "Teknik Notlar" bölümüne ekle
3. Veri yapısı değiştiyse → SCHEMA.md güncelle
4. Mimari kural değiştiyse → ARCHITECTURE.md güncelle
5. Tüm güncellenen md dosyaları AYNI commit'e dahil et

Bu üç adımdan herhangi biri atlanırsa commit YAPILMAZ.
