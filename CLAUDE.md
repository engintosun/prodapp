# KAAPA — CLAUDE.md

**Amaç:** Her session bu dosyayla başlar. Session protokolü ve context routing burada yaşar.

-----

## Session Protokolü

### Açılış

1. STATUS.md oku (proje hafızası — neredeyiz, ne kaldı, okunacak dosyalar)
2. STATUS.md'deki dosya listesini tam oku
3. **Durum raporu çıkar** — Engin onaylamadan iş başlamaz

Durum raporu formatı:
```
DURUM RAPORU
Milestone: [aktif milestone]
Son session: [ne yapıldı]
Bugün gündem: [ne yapılacak]
Bayraklar: [tutarsızlık, eksik karar, v8 kalıntısı — yoksa "temiz"]
```

### Kapanış

STATUS.md güncellenir:
- Ne yapıldı, ne kaldı
- Açık sorular, alınan kararlar
- Sonraki session gündemi
- **Sonraki session'da okunması gereken dosyalar listesi**
- Doküman sağlık tablosu (değişen/sorunlu dokümanlar)

-----

## Proje Kimliği

KAAPA — Sinema/TV sektörü için prodüksiyon harcama yönetimi SaaS platformu.

**Tech stack:** React 19 + TypeScript + Vite + Supabase + Vercel
**Dil:** Chat Türkçe, kod İngilizce (değişken, fonksiyon, dosya, commit, yorum), dokümanlar Türkçe
**Domain terimleri kodda:** İngilizce karşılıkları → docs/GLOSSARY.md

-----

## Context Routing Tablosu

|Görev tipi|Okunacak dosyalar|
|---|---|
|Mimari karar|docs/ARCHITECTURE.md|
|Kod yazma (herhangi feature)|docs/ARCHITECTURE.md → ilgili feature dizini → docs/GLOSSARY.md|
|İsimlendirme|docs/GLOSSARY.md|
|Teknik borç|docs/TECH-DEBT.md|
|Auth / rol / izin|docs/AUTH-KARARLARI.md + supabase/SUPABASE-RLS.sql|
|DB şeması|supabase/SUPABASE-SCHEMA.sql|
|Tasarım / UI (ortak ilkeler)|docs/TASARIM-KARARLARI.md + ilgili docs/EKRAN-*.md|
|Saha ekranı|docs/EKRAN-SAHA.md + docs/TASARIM-KARARLARI.md + docs/IS-KURALLARI.md|
|Dept ekranı|docs/EKRAN-DEPT.md + docs/TASARIM-KARARLARI.md + docs/IS-KURALLARI.md|
|Muhasebe ekranı|docs/EKRAN-MUHASEBE.md + docs/TASARIM-KARARLARI.md + docs/IS-KURALLARI.md|
|İş kuralı / onay / dönem / avans / anomali|docs/IS-KURALLARI.md|
|Görev sırası / ne yapılacak|docs/IS-SIRASI.md|
|Yeni özellik|docs/ARCHITECTURE.md (Bölüm 2 — kapsam kontrolü) → ilgili feature dizini|
|Bug fix|İlgili feature dizini → docs/TECH-DEBT.md|
|Deploy|docs/ARCHITECTURE.md (Bölüm 5.6)|
|Test|İlgili feature dizini → docs/ARCHITECTURE.md (Bölüm 3.5)|

**Fallback:** Tabloda eşleşme yoksa → önce docs/ARCHITECTURE.md oku, sonra sor.

-----

## Dosya Yapısı

```
kaapa/
  CLAUDE.md              ← bu dosya
  docs/
    ARCHITECTURE.md      ← mimari anayasa + çalışma sözleşmesi
    AUTH-KARARLARI.md    ← SK-AUTH-1..9 (kimlik/yetki/üyelik)
    TASARIM-KARARLARI.md ← ekranlar-arası ortak görsel/etkileşim ilkeleri
    EKRAN-SAHA.md        ← saha ekranları (alan/akış/yerleşim)
    EKRAN-DEPT.md        ← dept ekranları
    EKRAN-MUHASEBE.md    ← muhasebe ekranları
    IS-KURALLARI.md      ← iş mantığı (onay/dönem/avans/anomali §13/kurallar)
    IS-SIRASI.md         ← görev sırası ve bağımlılıklar
    GLOSSARY.md          ← domain terimleri + tehlikeli kökler
    TECH-DEBT.md         ← teknik borç takibi
    RAKIP-ANALIZI-OCR.md ← rakip analizi (referans)
  supabase/
    SUPABASE-SCHEMA.sql  ← 17 tablo, v2.0
    SUPABASE-RLS.sql     ← RLS policy'ler, v2.0
    SUPABASE-FUNCTIONS.sql ← SECURITY DEFINER admin RPC'ler, v1.0
    BOOTSTRAP-MUSTERI.sql← müşteri onboarding template
    sql/
      full-rebuild.sql   ← canonical temiz kurulum scripti (SCHEMA+RLS+FUNCTIONS)
  src/
    App.tsx              ← root component
    main.tsx             ← Vite entry
    app/
      auth/              ← auth guard, login
      layout/            ← sayfa düzeni
    features/
      receipts/          ← fiş/fatura
      approvals/         ← onay zinciri
      advances/          ← avans
      notifications/     ← bildirimler
      detection/         ← şüpheli işlem tespiti
      export/            ← PDF/Excel çıktı
    shared/
      supabase/client.ts ← Supabase client singleton
      types/             ← TypeScript domain tipleri
      utils/             ← ortak yardımcı fonksiyonlar
```

-----

## Çalışma Kuralları

### Opus / Sonnet İş Bölümü

- **Opus (Claude.ai):** Mimari, planlama, karar alma, prompt hazırlama. Kod yazmaz.
- **Sonnet (Claude Code):** Kod yazar, commit atar, push eder. Mimari karar almaz.
- **Handoff:** Opus prompt hazırlar → Sonnet tek commit hedefler → commit sonrası session kapatılır.
- **Geri dönüş:** Sonnet beklenmedik durumla karşılaşırsa commit atmaz, bulgusunu raporlar, Opus'a dönülür.

### Commit Disiplini

- Format: `tip(kapsam): açıklama`
- Tip seti: feat, fix, refactor, docs, chore, test
- Bir commit = bir tamamlanmış iş. Yarım iş commit edilmez.
- Kod değiştiyse ilgili md dosyası AYNI commit'te güncellenir.

### Dur Kuralları

Aşağıdaki durumlarda çalışma durur, değerlendirme yapılır:

- Tek commit'te 5'ten fazla dosya değişecekse
- Tek dosya 300 satırı geçecekse
- Aynı iş mantığı ikinci yerde yazılmak üzereyse (mantık tekrarı)
- Başlanan iş tanımının dışına çıkılıyorsa (scope creep)
- Kalıcı karar dosyasında karşılığı olmayan seçim yapılması gerekiyorsa

### Doküman ve Karar Disiplini

- **Versiyon dili yasak:** Kararın kendisi yazılır, kaynağı (eski sürüm/demo) yazılmaz. "Hangi versiyonda ne" karmaşası önlenir.
- **Modüler karar dosyaları:** Her ekran/konu kendi dosyasında (docs/EKRAN-*, docs/IS-KURALLARI.md). Görev listesi (docs/IS-SIRASI.md) sadece durum tutar, karar detayı tutmaz. Bilgi tek evde yaşar, tekrarlanmaz — başka dosya yalnızca referans verir.
- **Sistem-genel etki analizi:** Hiçbir karar tek dosyaya bakılarak verilmez veya yazılmaz. Bir konuya başlamadan ilgili tüm dosyalar taranır; karar, etkilediği tüm dosyalara aynı anda yansıtılır.
- **Dayanıklı/kararsız katman ayrımı:** Yerleşim + akış + mantık yazılır (dayanıklı). Renk + sunum estetiği açık slot bırakılır (kararsız), ayrı oturumda doldurulur.

### Teknik Kurallar

- **SSOT:** Supabase tek gerçek kaynak. Client önbellek/kopya. Çakışmada Supabase kazanır.
- **Sessiz hata yasak:** throw veya kullanıcıya bildirim zorunlu. Boş catch, sessiz return yok.
- **Doküman kazanır:** Kod-doküman çelişkisinde önce doküman güncellenir, sonra kod düzeltilir.
- **Katman ayrımı:** Veri erişim (Supabase) → İş mantığı (saf fonksiyonlar) → UI (React) → Orkestrasyon. Katman atlama yasak.
- **Saf fonksiyonlar:** Hesaplama, validasyon, dönüşüm = parametre alır, return eder, side-effect yok.

### İsimlendirme

- DB (Supabase): `snake_case` → `receipt_status`
- JS değişken/fonksiyon: `camelCase` → `receiptStatus`
- Dosya adları: `kebab-case` → `receipt-service.ts`
- Domain terimleri: docs/GLOSSARY.md'deki İngilizce karşılık
- **Tehlikeli kökler** (gec, tip, durum, kat): docs/GLOSSARY.md'de ayrı bölüm — bu kökleri kodda Türkçe kullanma

### Deploy Checklist

Sonnet commit sonrası, Engin canlıya almadan önce:

1. **tsc --noEmit** — Sonnet çalıştırır, hata varsa commit atmaz, raporlar
2. **GRANT kontrolü** — Yeni tablo eklendiyse SQL Editor'de GRANT çalıştırılmalı (veya default_privileges ayarlanmalı)
3. **Edge Function doğrulama** — Code sekmesinden deploy edilen kodun import satırları ve içeriği doğrulanır
4. **Canlı test** — Deploy sonrası prodapp-navy.vercel.app'te uçtan uca akış doğrulanır
5. **Repo-canlı senkron** — Edge Function repo kodu ile canlı kod aynı olmalı; fark varsa repo güncellenir

### Satır Numarası Uyuşmazlığı

Prompt'taki satır numarası dosyada başka bir şey gösteriyorsa:

- DUR
- "Satır X'te beklenen Y bulamadım, gerçek içerik Z" diye raporla
- Tahmin ederek değişiklik yapma
- Kullanıcı onay bekle

-----

## Faz 1 Kapsamı (özet)

Listede yoksa Faz 1'de yoktur. Tam liste: docs/ARCHITECTURE.md Bölüm 2.1

- Davetiye ile kullanıcı kaydı + rol bazlı erişim
- Fiş/fatura fotoğrafı yükleme + OCR
- Harcama kaydı oluşturma/düzenleme
- Onay zinciri (Saha → Dept → Muhasebe)
- Avans talebi, kapama, bakiye takibi
- Şüpheli işlem tespiti (kural bazlı)
- Listeleme, filtreleme, arama
- PDF/Excel export
- Mesajlaşma (onay sürecine bağlı bildirimler)
- Çoklu proje desteği

**Faz 1'de YOK:** CFE (kur/KDV motoru), e-fatura/GİB entegrasyonu, bütçe oluşturma modülü, envanter, çoklu dil altyapısı, super-admin rolü, cross-company veri paylaşımı.

-----

## Meta-prensip

> Hiçbir şey "öyle olmaz." Her şey bilinçli karar ile olur, kaydedilir, denetlenebilir.
