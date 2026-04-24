# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PRODAPP v8.0** — A Turkish-language, mobile-first film/production crew expense management PWA. The entire application is a single self-contained file: `index.html`. There is no build system, no package manager, no bundler, and no server-side code.

To run: open `index.html` directly in a browser. No build step required.

## Proje Bağlamı

Bu uygulama **film prodüksiyon ekiplerinin saha harcamalarını** yönetmesi için tasarlanmıştır. Hedef pazar **Türkiye**'dir; tüm arayüz metinleri, bildirimler ve iş akışları Türkçedir.

### Kullanıcı Rolleri

| Rol | `curUser.role` | Açıklama |
|---|---|---|
| Saha | `user` | Fiş tarar, harcama girer, avans alır |
| Dept | `dept` | Departman harcamalarını görür ve onaylar |
| Muhasebe | `acc` | Tüm projelerin muhasebe görünümü |

Her rol, `selectProj()` içinde farklı bir ekrana yönlendirilir (`su` → `sd` → `sa`). `dept` ve `acc` ekranları henüz geliştirme aşamasındadır.

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

### Gelecek Hedef: Supabase Entegrasyonu

Mevcut tüm demo verisi (`USERS`, `PROJS`, `DONEMLER`, `DATA`, `FIS_DEMO`) ileride Supabase ile değiştirilecek. Yeni özellikler eklerken bu geçişi kolaylaştıracak şekilde veri erişimini fonksiyon içine izole et — veri objesine script genelinde doğrudan erişmek yerine bir okuma fonksiyonu üzerinden geç.

---

## Architecture

Everything lives in `index.html` in three sequential sections:

1. **CSS** (`<style>` block, lines ~11–1280) — all styles inline, organized by screen with `/* ══ SECTION ══ */` banner comments.
2. **HTML** (lines ~1280–1292) — thin shell; most UI is rendered via JS `innerHTML`.
3. **JavaScript** (`<script>` block, lines ~1292–end) — organized by feature with `/* ═══ SECTION ═══ */` banners.

### Screen System

Screens are `<div class="scr">` elements. Only one is visible at a time. `.scr.on` sets `display:flex`. Navigation uses:
- `showScr(id)` — hides all, shows the target screen
- `hideAll()` — removes `.on` from every `.scr`

Screen IDs: `sl` (login), `sp` (project select), `su` (field/saha — main), `sd` (dept), `sa` (accounting).

### State

All app state is plain `var` globals at the top of the script block:
- `USERS` / `UMAP` / `PROJS` / `DONEMLER` / `DATA` / `FIS_DEMO` — static demo data
- `curUser`, `curProj` — currently authenticated user and selected project
- `aktifDon` — active period ID
- `isRec`, `speechRecog` — voice recording state
- `longTimer`, `longFired` — long-press gesture state for the OCR button

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

- The JS block uses `var` and `function` declarations (ES5 style) — maintain this style; do not introduce `let`/`const`/arrow functions/classes unless refactoring the whole file.
- UI is rendered by setting `innerHTML` strings directly — no templating engine.
- Adding a new screen: add a `<div id="sX" class="scr">` in HTML, add CSS under a new banner section, call `showScr('sX')` to navigate to it.
- Adding a new feature section in JS: place it after the nearest related section, delimited with `/* ═══ FEATURE NAME ═══ */`.

---

## Çalışma Kuralları

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
