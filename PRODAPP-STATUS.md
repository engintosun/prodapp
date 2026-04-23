# PRODAPP — Durum Raporu

**Son güncelleme:** 19 Nisan 2026
**Aktif sürüm:** v8.x (canlı)
**Repo:** https://github.com/engintosun/prodapp
**Deploy:** https://engintosun.github.io/prodapp/
**Son commit:** 3f7252b — marka ayarları + PDF başlık & footer

---

## Proje Genel Bilgisi

- **Teknoloji:** Tek HTML dosya PWA, GitHub Pages deploy
- **Roller:** Saha (fiş girişi) / Dept (onay) / Muhasebe (kesin onay + dashboard)
- **Tasarım:** Warm black #0C0A08 + orange accent #E8962E, Lucide SVG icons

---

## Hibrit Çalışma Modeli (Opus + Sonnet)

**Opus (Claude.ai) için:**
- Planlama, öncelik sıralaması
- Prompt hazırlama
- Karmaşık tanı yorumlama
- Mimari kararlar
- Strateji (pazar, ürün yönü, rekabet)
- Trade-off kararları

**Sonnet (Claude Code) için:**
- Kod yazma, edit uygulama
- Dosya okuma, grep
- Commit + push
- Syntax check
- Mekanik raporlar

**Akış:** Opus prompt hazırlar → Sonnet uygular → çıktıyı Opus yorumlar → yeni prompt → döngü

**Limit-dostu prompt disiplini:**
- "Sadece şu fonksiyonları oku: X, Y, Z. Dosyanın geri kalanına dokunma."
- "Kod değiştirme, sadece raporla" (tanı prompt'larında)
- Tek commit, tek iş prensibi

---

## ✅ TAMAMLANAN

### Akış & İşlevsellik
- [x] Saha → dept → muhasebe onay zinciri (fisId senkronu ile)
- [x] Muhasebe onay/red → saha bildirimi + durum güncellemesi
- [x] Dept red → saha senkronu
- [x] Avans onay zinciri (saha → dept → muhasebe → bildirim)
- [x] Ret nedeni zorunlu + redNedeni kaydı
- [x] Dept bekleyen toplu seçim
- [x] Kiralama workflow (gecikme, ceza, ana ekran kartı)
- [x] Mesajlaşma 2.0 (Adım A+B+C + polish)

### Form & Giriş
- [x] Belgesiz harcama formu tamamlandı
- [x] İş kanıtı fotoğrafı
- [x] OCR form, saha/dept ortak akış
- [x] Galeri/belgesiz hızlı butonlar
- [x] Ulaşım km bazlı tutar denetimi
- [x] OCR animasyonu (2.6sn, 4 adım) + güven skoru
- [x] GİB karekod mock animasyonu (simGIB, 1.1sn)

### Raporlar & Dashboard
- [x] Muhasebe raporlar canlı (personel + dept)
- [x] Muhasebe dashboard canlı (accDepts _recomputeAccDepts)
- [x] Dept aktif dönem geçmişi
- [x] Tarih sıralaması (string → Date)
- [x] Kendi SVG donut grafikleri (_svgDonut)
- [x] Dönem #1 kapama özeti, belgeler, onay/red fişleri

### Bütçe & Limit
- [x] Bütçe limiti takibi (kategori alt limit)
- [x] Bütçe barında harcama/limit tutarı gösterimi
- [x] accButceKaydet entegrasyonu

### UI & UX
- [x] Açık/koyu tema geçişi (localStorage kalıcı)
- [x] Bildirim sistemi (GLOBAL_INBOX, rozet, okundu/okunmadı)
- [x] Arama dropdown
- [x] Lightbox detay paneli, fiş thumbnail SVG, profil ekranı
- [x] Detay modalları, ekip profil, bildirim içerikleri
- [x] Mobile viewport 100dvh
- [x] Kullanıcı avatar fotoğraf upload (Canvas 256x256 + localStorage)
- [x] Marka ayarları — şirket + proje ad/logo (PDF başlığına yansır)

### Altyapı
- [x] APP namespace refactor
- [x] APP.data için localStorage kalıcılığı
- [x] runtime donem hard-code → aktifDon
- [x] Seed fisler çeşitlendirme (multi-personel demo data)

---

## ❌ YAPILMAMIŞ (Faz 1 kalan)

### P0 — Demo için şart
- [ ] **Çoklu format export sistemi** (PDF/Excel/CSV/PNG) *(L — 1+ gün)*
  - Şu an window.print() kullanılıyor, güvenilmez
  - jsPDF + SheetJS + html2canvas ile yeniden yaz
  - "Dışa Aktar" butonu → format seçimi → dosya indir
  - PDF'te şirket/proje logosu + PRODAPP footer korunur
  - Raporlar estetik yenileme bu iş içinde
- [ ] **Kısmi onay akışı** (dept, tek fişin bir kısmını onay/reddet) *(L)*

### P1 — Çok iyi olur, esnek
- [ ] **Onboarding tutorial** (3 rol × 3 adım, skip'lenebilir) *(L)*

---

## 🔄 FAZ 1 SONRASI — MODÜLERLEŞME PLANI

Faz 1'in 3 P0/P1 maddesi bitince hemen bu iş başlar. Faz 2 (backend) öncesi şart.

### Hedef dizin yapısı

```
/prodapp
  /modules
    /saha        → saha.js, saha.css, saha.html
    /dept        → dept.js, dept.css, dept.html
    /muhasebe    → muhasebe.js, muhasebe.css, muhasebe.html
    /core
      state.js         (APP namespace)
      constants.js     (renk, kategori, DONEM_BUTCE, SD_KAT_CLR)
      utils.js
      ocr.js
      export.js        (Faz 1'deki çoklu export ile birlikte)
      /services
        fis.service.js      (createFis, approveFis, rejectFis)
        dept.service.js
        report.service.js   (_computeRaporPersonel, _computeRaporDeptFis)
        storage.service.js  (Faz 2'de Supabase swap için hazır katman)
    /shared
      styles.css
      design-tokens.css
  index.html           (iskelet, ~200 satır)
```

### Modülerleşme kontrol listesi

- **ES6 modules** (`import/export`), build step yok
- **APP namespace** `/core/state.js`'te, tüm modüller oradan import eder
- **Servis katmanı** — UI servisleri çağırır, servisler veriyi yönetir
  - `storage.service.js`: Faz 2'de Supabase'e swap, UI değişmez
- **ARCHITECTURE.md** çıkar — bağımlılık grafiği
- **Sabit migration** — tüm global sabitler `/core/constants.js`'te
- **Event pattern** — veri değişiminde ilgili modül yeniden render
- **Taşınma denetimi** — eski index.html'deki fonksiyon isimlerini grep et

### Deploy notu

- GitHub Pages ES6 modules destekliyor
- Local test için HTTP server gerek: `python -m http.server 8000` veya VS Code Live Server
- `file://` ile açıp test artık çalışmaz (CORS)

---

## ⏸ ERTELENMİŞ (bilinçli karar)

- Belgesiz alt-kategori ağacı
- accGecmis şeması (muhasebe kesin onay kalıcı izi)
- Demo data tekrarı düzeltmesi (partial yapıldı)
- Mevcut accPDF/expPDF — çoklu export sistemi geldiğinde silinecek
- Tam proje yönetimi (yeni proje oluşturma) — Faz 2
- GİB gerçek entegrasyon — Faz 2
- Backend geçişi: Supabase + Auth + Realtime — Faz 2
- Gerçek OCR (Google Vision/Textract) — Faz 2

---

## 📝 KARAR NOTLARI

- **Muhasebe rolü fiş girmez** — sadece onaylar
- **Her kullanıcı kendi adına fiş girer**
- **GİB:** Phase 1 MVP QR kod public sorgu, Phase 2 integrator
- **Pazarlama stratejisi yönü:** yapım şirketleri değil, **fon veren kurumlar**
  (Kültür Bakanlığı Sinema Genel Müdürlüğü, Eurimages, TRT, İKSV)
- **Pitch deck:** Faz 1 bitince + ilk 3-5 pilot kullanıcı metriği sonrası
- **Skills / GitHub ekosistem:** Claude Skills PRODAPP için pek işe yaramaz
  (genel docx/pptx skill'leri senin işin değil). GitHub Issues ve branches
  Faz 2'de kullan, şu an erken.

---

## 🔧 TEKNİK NOTLAR

- Tek HTML ~6000+ satır, Faz 1 sonrası modülerleşme şart
- Source of truth: `APP.data.fisler` + `deptBekleyen` + `accBekleyen`
- localStorage kalıcılığı var — seed değişince `localStorage.clear()` gerek
- Modülerleşmeden önce: "sadece şu fonksiyonları oku" prompt disiplini

---

## 📋 DESIGN SYSTEM

`design.md` dosyası ayrı — mevcut index.html'in görsel kimliği (renk paleti,
font, bileşen CSS'leri). CSS değişikliklerinde referans alınır. Yeni bileşen
gerekirse önce onay alınır.

İlk oluşum: Sonnet'e "index.html'i oku ve design.md şablonunu doldur" prompt'u
verilecek. Şablon bu dosyayla birlikte sağlandı: `design.md.template`
