# PRODAPP — Design System

**Amaç:** Bu dosya PRODAPP'in görsel kimliğinin tek kaynağıdır. Tüm CSS
değişiklikleri, yeni bileşenler ve UI kararları bu dosyayı referans alır.

**Kullanım:**
- Yeni bileşen eklemeden önce bu dosyada benzer örnek var mı bakılır
- Renk/font/spacing değerleri buradaki token'lardan alınır
- Dosyada olmayan yeni bir bileşen gerekirse önce kullanıcıdan onay alınır

---

## 1. RENK PALETİ

### Temel renkler
```
--bg    : #0C0A08    (warm black, ana arka plan)
--bg2   : #131110    (ikinci seviye yüzey — kart, modal)
--bg3   : #1A1816    (üçüncü seviye — input, avatar daire)
--bg4   : #222018    (dördüncü seviye — progress bg, nav)
--bo    : #2A2620    (kenar çizgileri)
--bo2   : #38322A    (daha belirgin kenar)
--tx    : #EDF0F5    (ana metin)
--tx2   : #8A9090    (ikincil metin)
--tx3   : #4A5060    (üçüncü seviye metin, placeholder)
--ac    : #E8962E    (birincil accent — turuncu)
--ac2   : #F0C080    (ikincil accent — yumuşak turuncu)
```

### Durum renkleri
```
--gr    : #22C55E    (onay — yeşil)
--gr2   : #4ADE80    (yumuşak yeşil)
--rd    : #EF4444    (red — kırmızı)
--rd2   : #F87171    (yumuşak kırmızı)
--am    : #F59E0B    (bekleme — sarı)
--am2   : #FCD34D    (yumuşak sarı)
--bl    : #3B82F6    (bilgi — mavi)
--bl2   : #60A5FA    (yumuşak mavi)
```

### Kategori renkleri (harcama)
`SD_KAT_CLR` objesi (CSS token) ve `_katRenkHex` (PDF için hex):

```
Yakıt     : var(--am)   / #F59E0B   (sarı)
Yiyecek   : var(--gr)   / #22C55E   (yeşil)
Ekipman   : var(--bl)   / #3B82F6   (mavi)
Sanat     : var(--ac)   / #E8962E   (turuncu)
Ulaşım    : var(--bl2)  / #60A5FA   (açık mavi)
Konaklama : var(--bl)   / #8B5CF6   (mor — PDF'te farklı)
Kiralama  : var(--am2)  / #F97316   (turuncu-sarı)
Diğer     : var(--tx3)  / #64748B   (gri)
```

---

## 2. TİPOGRAFİ

### Font aileleri
```
Metin     : 'DM Sans', system-ui, sans-serif   → var(--fn)
Sayı/mono : 'DM Mono', monospace               → var(--mo)
```

### Boyut ölçeği
```
Başlık 1  : 24px   — büyük bütçe rakamı (sd-butce-total, font-weight 800)
Başlık 2  : 22px   — login başlığı (ltitle, font-weight 800)
Gövde     : 14px   — body default, fgi input, btn, fis-name
Küçük     : 13px   — meta bilgiler, arama satırı, btn-sm, toast
Mini      : 11px   — uppercase etiketler, fg label, tag, durum rozeti
Micro     : 10px   — en küçük yüzde/sayaç etiketi, bütçe stat alt yazısı
```

### Ağırlıklar
```
Regular  : 400
Medium   : 500
SemiBold : 600
Bold     : 700
ExtraBold: 800
Black    : 900
```

---

## 3. SPACING & LAYOUT

```
Ekran kenar boşluğu  : 16px   (su-tab padding, sd-body padding)
Kart iç boşluğu      : 12–16px
Form grup arası       : 12px   (.fg margin-bottom)
İkon-metin gap        : 6–10px
Nav/section gap       : 7–10px

Minimum touch target  : 44px  (.ni, .su-ib, .nav-srch-x)
Viewport              : 100dvh (100vh DEĞİL)

Border radius:
  Küçük               : var(--rs) = 9px   — buton, input, küçük kart
  Orta/default        : var(--r)  = 14px  — ana kart, fis-list, modal içerik
  Büyük               : 20px             — login kartı, proje kartı, modal sheet
  Pill                : 28px             — bottom nav, arama barı, dönem pill
  Tam yuvarlak        : 50%              — avatar, icon buton
```

---

## 4. BİLEŞEN KİTAPLIĞI

### Buton (`.btn`)
```
Varsayılan arka plan : var(--bg3)
Border               : 1px solid var(--bo)
Border-radius        : var(--rs) = 9px
Font-size            : 14px
Font-weight          : 500
Padding              : 9px 16px
Gap (icon+text)      : 6px
Active               : transform: scale(.97)
Transition           : border-color .15s, color .15s
```

### Buton varyantları
```
.btn-p   → background: var(--ac); border-color: var(--ac); color: #0C0A08; font-weight: 700
.btn-g   → background: rgba(34,197,94,.1); border-color: var(--gr); color: var(--gr2)
.btn-r   → background: rgba(239,68,68,.1); border-color: var(--rd); color: var(--rd2)
.btn-sm  → padding: 6px 12px; font-size: 13px
.btn-full → width: 100%; justify-content: center

Login butonu (.lbtn):
  → width: 100%; padding: 14px; font-size: 15px; font-weight: 700
  → background: var(--ac); color: #0C0A08; border: none; border-radius: var(--rs)
```

### Kart (`.rc` — son harcamalar mini kart)
```
Width         : 112px (flex-shrink: 0)
Background    : var(--bg2)
Border        : 1px solid var(--bo)
Border-radius : 14px
Padding       : 12px
İkon boyutu   : 36×36px, border-radius 8px
Active        : transform: scale(.97)
Varyantlar    : .rc.warn (border var(--am)), .rc.err (border var(--rd)), .rc.blgsz (border var(--bl))
```

### Fiş liste satırı (`.fis-row`)
```
Padding       : 12px 13px
Gap           : 11px
Border-bottom : 1px solid var(--bo)
Active        : background: var(--bg3)
İkon (.fis-ic): 38×38px, border-radius 8px, bg var(--bg3)
Küçük resim   : 38×48px, border-radius 7px, border 1.5px solid var(--bo)
```

### Input alanları
```
.fgi (genel input/textarea/select):
  padding       : 11px 13px
  background    : var(--bg3)
  border        : 1px solid var(--bo)
  border-radius : var(--rs) = 9px
  font-size     : 14px
  outline       : none
  focus         : border-color: var(--ac)
  placeholder   : color: var(--tx3)

.lfi (login input):
  padding       : 12px 14px
  border        : 1.5px solid var(--bo)
  font-size     : 15px
  margin-bottom : 12px
```

### Avatar
```
.su-av (saha header, yuvarlak):
  38×38px, border-radius: 50%
  background: var(--ac), color: #0C0A08
  font-size: 12px, font-weight: 700
  Fotoğraflı: <img> object-fit: cover, border-radius: 50%

.sd-hd-av / .sa-hd-av (dept/muhasebe, köşeli):
  38×38px, border-radius: 11px
  background: var(--ac), color: #0C0A08
  font-size: 12px, font-weight: 800
```

### Bildirim rozeti (`.su-badge`)
```
position     : absolute, top: 3px, right: 3px
min-width    : 16px; height: 16px; border-radius: 8px
background   : var(--rd)
border       : 1.5px solid var(--bg)
font-size    : 10px; font-weight: 700; color: #fff
display      : none (varsayılan) — JS ile gösterilir
```

### Durum noktaları (`.rc-dot`, `.fis-dot`, `.sd-fis-dot`)
```
7×7px (veya 8×8px dept), border-radius: 50%
Renk JS tarafından inline style ile atanır:
  onaylandi   → var(--gr)
  bekleyen    → var(--am)
  reddedildi  → var(--rd)
```

### Progress bar
```
Saha bütçe (.su-bw-track):
  height: 5px; background: var(--bg3); border-radius: 3px
  Dolgu: transition: width .3s

Dept bütçe (.sd-butce-bar-wrap):
  height: 8px; background: var(--bg3); border-radius: 4px
  Dolgu: transition: width .4s ease

Kategori barı (.sd-kat-bar-wrap / .su-kat-bar):
  height: 5px; background: var(--bg3); border-radius: 3px
  Dolgu: transition: width .3s
```

### Modal
```
Arka plan (.mo):
  position: fixed; inset: 0
  background: rgba(0,0,0,.75)
  backdrop-filter: blur(4px)
  display: none → .mo.on: display: flex
  align-items: flex-end (bottom sheet)

Sheet (.ms):
  background: var(--bg2)
  border-radius: 20px 20px 0 0
  width: 100%; max-width: 500px; max-height: 92dvh
  overflow-y: auto
  animation: mslide .28s ease
  padding-bottom: max(24px, var(--safe-bot))

Drag handle (.mh): 36×4px, background: var(--bo2), border-radius: 2px, margin: 10px auto 12px
Başlık (.mhd):     padding: 0 16px 12px; border-bottom: 1px solid var(--bo)
Title (.mtitle):   font-size: 16px; font-weight: 700
Gövde (.mbody):    padding: 14px 16px 0
```

### Bottom navigation
```
Sarıcı (.su-nav-wrap):
  position: fixed; bottom: 0; left: 0; right: 0
  padding: 8px 16px + max(16px, safe-bot)
  background: linear-gradient(to top, var(--bg) 55%, transparent)

Nav pill (.su-nav):
  background: rgba(19,17,16,.88)
  border: 1px solid rgba(255,255,255,.07)
  border-radius: 28px; padding: 10px 0
  backdrop-filter: blur(16px)

Nav item (.ni):
  flex: 1; flex-direction: column; gap: 3px
  min-height: 44px
  color: var(--tx3) → .ni.on: color: var(--ac)
  SVG: 20×20px, stroke: currentColor

Aktif gösterge (.ni-dot):
  3×3px daire, background: transparent → .ni.on: background: var(--ac)
```

### Toast bildirimi (`.nf`)
```
Container (#nc): position: fixed; bottom: ~90px+safe; left: 50%; transform: translateX(-50%)
Toast (.nf):
  background: var(--bg2); border: 1px solid var(--bo)
  border-radius: var(--rs) = 9px; padding: 11px 15px
  gap: 8px; font-size: 13px
  box-shadow: var(--sh)
  animation: nfin .25s ease
  Renk noktası: 8×8px daire — green/amber/blue/red CSS token'ı
```

### Alert banner (`.al`)
```
padding       : 10px 13px; border-radius: var(--rs); font-size: 13px
.al-am → background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.25); color: var(--am2)
.al-rd → background: rgba(239,68,68,.08);  border: 1px solid rgba(239,68,68,.25);  color: var(--rd2)
.al-gr → background: rgba(34,197,94,.08);  border: 1px solid rgba(34,197,94,.25);  color: var(--gr2)
.al-bl → background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.25); color: var(--bl2)
```

### Tag / durum pill (`.tag`)
```
display: inline-flex; padding: 2px 8px; border-radius: 20px
font-size: 11px; font-weight: 600
.tag-gr → background: rgba(34,197,94,.15);  color: var(--gr2)
.tag-am → background: rgba(245,158,11,.15); color: var(--am2)
.tag-rd → background: rgba(239,68,68,.15);  color: var(--rd2)
```

---

## 5. İKONLAR

**Kaynak:** Inline SVG, Lucide tarzı stroke ikonlar. Harici kütüphane import'u YOK.

```
stroke-width    : 1.5  (genel) / 1.8 (durum ikonları) / 2 (bazı aksiyon)
stroke-linecap  : round
stroke-linejoin : round
viewBox         : 0 0 24 24
fill            : none
```

### Kullanılan ikonlar (Lucide karşılıkları)

| İkon | Lucide adı | Kullanım yeri |
|------|-----------|---------------|
| `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18..."/>` | Bell | Bildirim butonu (header) |
| `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>` | Moon | Koyu tema ikonu |
| `<circle cx="12" cy="12" r="5"/>` + ışınlar | Sun | Açık tema ikonu |
| `<path d="M20 21v-2a4 4 0 0 0-4-4H8..."/><circle cx="12" cy="7" r="4"/>` | User | Avatar menü profil |
| `<path d="m15 18-6-6 6-6"/>` | ChevronLeft | Geri butonu |
| `<polyline points="9 18 15 12 9 6"/>` | ChevronRight | Yönlendirme oku |
| `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>` | Search | Arama |
| `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>` | X | Kapatma / iptal |
| `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>` | Plus | Yeni ekle |
| `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5..."/><polyline points="9 22 9 12 15 12 15 22"/>` | Home | Nav — ana ekran |
| `<rect x="3" y="4" width="18" height="18" rx="2"..."/>` | Calendar | Nav — dönem |
| `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5..."/>` | MessageSquare | Nav — sohbet |
| `<path d="M14 2H6a2 2 0 0 0-2 2v16..."/><polyline points="14 2 14 8 20 8"/>` | FileText | Belge / PDF |
| `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>...` | Image | Fotoğraf/resim |
| `<path d="M9 21H5a2 2 0 0 1-2-2V5..."/><polyline points="16 17 21 12 16 7"/>` | LogOut | Çıkış yap |
| `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>...` | Info | Bilgi / uyarı |
| `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>` | HelpCircle | Yardım |
| `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>` | CheckCircle | Onaylama |
| `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>...` | XCircle | Reddetme |
| `<path d="M12 1a3 3 0 0 0-3 3v8..."/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>` | Mic | Ses kaydı |
| `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>` | Shield | GİB doğrulama |
| `<path d="M17 21v-2a4 4 0 0 0-4-4H5..."/><path d="M23 21v-2..."/>` | Users | Ekip listesi |
| OCR scan frame (4 köşe path) | — | OCR tarama çerçevesi |
| `<path d="M3 22V6l9-4 9 4v16"/>...` | Building / Yakıt simgesi | Yakıt kategorisi |
| `<path d="M3 11l19-9-9 19-2-8-8-2z"/>` | Send | Yiyecek kategorisi |
| `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4..."/>` | Package | Varsayılan kategori |

---

## 6. ANİMASYON

### Süreler
```
Kısa   : 150ms / .15s  — hover, input focus, nav renk
Orta   : 120ms / .12s  — kart active, checkbox, tab geçişi
Modal  : 280ms / .28s  — mslide (modal açılış)
Bütçe  : 300–500ms     — progress bar genişleme
OCR    : 650ms × 4     — tarama adımları
Toast  : 3000ms        — dismiss beklemesi
GİB   : 1100ms         — doğrulama simülasyonu
Pulse  : 2500ms ∞      — OCR butonu nabız
Scan   : 1500ms ∞      — tarama çizgisi
```

### Easing
```
ease            — genel varsayılan (modal mslide, toast nfin, fisHl)
ease-in-out     — ileri-geri hareketler (scanmove tarama çizgisi)
linear          — sürekli döngü animasyonları (pulse)

Transition kısaltmaları:
  border-color .15s          — buton, input focus
  color .15s                 — nav item, tab
  background .12s            — kart hover/active
  background .12s, border-color .12s  — checkbox, sd-fis seçim
  all .15s                   — pill/tab genel
  transform: scale(.97)      — kart ve buton active basma

@keyframes tanımları:
  pulse      → box-shadow 2.5s infinite (OCR butonu)
  mslide     → translateY(100%) → translateY(0), .28s ease
  nfin       → opacity 0 + translateY(8px) → tam görünür, .25s ease
  scanmove   → top 0 → top 100%, 1.5s ease-in-out infinite
  fisHl      → rgba(232,150,46,.18) → transparent, 2s ease forwards
```

---

## 7. REHBER

### Yeni bileşen ekleme protokolü

1. Gereksinim netleşir
2. Benzer bileşen var mı — bu dosyada ara
3. Yoksa: kullanıcıdan onay al → renkler/spacing/typography mevcut token'lardan seç
4. Bileşen eklendiğinde bu dosya güncellenir

### Yasaklı şeyler

- `100vh` (yerine `100dvh`)
- Harici CSS framework'ü (Tailwind, Bootstrap vs.)
- Harici ikon kütüphanesi import'u (Lucide, FontAwesome — inline SVG kullan)
- Hardcoded renk kodu (her zaman `var(--xxx)` kullan)
- Hardcoded font-size (token'lardan seç)

### İzin verilen istisnalar

- PDF export HTML'i (bağımsız pencere, CSS değişkenleri run-time okunur)
- Inline SVG `fill`/`stroke` renk kodları

---

## 8. TEMA

Projede **açık** ve **koyu** tema var. Koyu tema default.
CSS değişkenleri `:root` ve `[data-theme="light"]` üzerinden tanımlı.
Tema geçişi `toggleTheme()` fonksiyonu ile, `localStorage`'da `prodapp-theme`
anahtarıyla saklanır.

### Açık tema override'ları (`[data-theme="light"]`)
```
--bg    : #F5F3F0    (krem beyaz)
--bg2   : #EDEAE4
--bg3   : #E4E0D8
--bg4   : #DAD5CC
--bo    : #C4BDB0
--bo2   : #ADA69A
--tx    : #1A1714    (çok koyu — neredeyse siyah)
--tx2   : #55504A
--tx3   : #8A857E
--ac    : #E8962E    (değişmez — marka rengi)
--ac2   : #CF7A10    (daha koyu turuncu — kontrast için)
--gr    : #16A34A    (daha derin yeşil)
--gr2   : #166534
--rd    : #DC2626
--rd2   : #991B1B
--am    : #D97706
--am2   : #92400E
--bl    : #2563EB
--bl2   : #1E3A8A
--sh    : 0 8px 32px rgba(0,0,0,.10)   (koyu temada .60)
```

Tema ikonları `.theme-icon-dark` ve `.theme-icon-light` class'ı ile toggle edilir;
`[data-theme="light"]` varlığında dark gizlenir, light gösterilir.

---

## 9. ERİŞİLEBİLİRLİK

- **Minimum touch target:** 44px — `.ni`, `.su-ib`, `.nav-srch-x` (padding ile)
- **Focus göstergesi:** Tarayıcı varsayılanı (outline: none override edilmiş — `.fgi:focus { border-color: var(--ac) }` ile görsel geri bildirim sağlanır)
- **Ekran okuyucu:** `aria-label` kullanımı OCR ve ses butonlarında mevcut
- **Kontrast:** `--tx` (#EDF0F5) üzerinde `--ac` (#E8962E) → AA sınırında; `--ac` üzerinde `#0C0A08` → AAA geçer (btn-p, lbtn, avatar)
- **Kaydırma:** `-webkit-overflow-scrolling: touch` tüm scroll alanlarda
- **Zoom engeli:** `user-scalable=no` viewport meta + `touch-action: manipulation` OCR butonunda
