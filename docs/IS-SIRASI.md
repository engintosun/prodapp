# KAAPA — İŞ SIRASI ve BAĞIMLILIKLAR

**Versiyon:** 3.0 | **Tarih:** 28 Mayıs 2026
**Bu dosya yalnızca SIRA ve BAĞIMLILIK tutar.** Ne yapılacağı, ne zaman, hangi sıra, neye bağlı. Tasarım/işleyiş kararları kendi dosyalarındadır (EKRAN-*.md, IS-KURALLARI.md — anomali IS-KURALLARI §13). Madde numaraları master checklist (197) ile eşleşir.

**Durum:** ✅ tamam · 🔶 kısmen · ⬜ yapılmadı
**Aktif milestone: M2** (çekirdek döngü). M1 kapandı.

---

## MILESTONE HARİTASI

```
M1 ✅  Temel altyapı + auth            → KAPANDI (v0.1-auth)
M2 🔶  Çekirdek döngü                  → AKTİF (henüz inşa başlamadı)
M3 ⬜  Tam Faz 1 (OCR/avans/mesaj/...)  → sırada
M4 ⬜  Pilot hazırlık                   → sonra
CFE ⬜ Core Finance Engine             → ayrı, zamanlama TBD
```

---

## M1 — TEMEL ALTYAPI ✅ (referans)
Tamamlanan zincir: DB şeması (A1) → RLS → client → scaffold (B1) → login (B2) → proje seçimi (B3) → set-claims (A3.1) → clear-claims → profiles remodel → üç-hâl App.tsx → Vercel prod (H1.1, H1.4). Kararlar: G4/G5/G7.

---

## M2 — ÇEKİRDEK DÖNGÜ (tek fiş uçtan uca onay)

**M2 hedefi:** bir fiş, saha girişinden muhasebe onayına kadar tüm zincirden geçebilmeli. OCR/avans/mesaj/arama/export/anomali/split YOK (M3). Manuel form, minimal dönem.

**M2 inşa felsefesi:** sıralı — temel önce, sonra Saha tam, sonra Dept tam, sonra Muhasebe tam.

### M2.0 — Karar kapatma (kod ÖNCESİ) ⬜
Bu kararlar verilmeden ilgili ekran kodlanamaz:
- ✅ **G1** — KAPANDI: iade kaldırıldı; sahaya geri dönüş tek aksiyon = reddet (kanıt olarak donar). Tekrar giriş yalnız muhasebe → bağlı yeni fiş (parent_receipt_id). 'returned' gereksiz, 9 statü korunur. Detay: IS-KURALLARI §3.
- ✅ **G3** — KAPANDI: pasif onay (7 gün) Faz 1'de VAR. Bekleyen fiş 7 günde auto_approved (şüpheli bayrağı kalır, sorumluluk muhasebede, kiralama istisna). Dönem kapama ilanından 7 gün sonra kapanır (grace). Detay: IS-KURALLARI §5.
- ⬜ **Status geçiş yeri** — submitted→dept_pending/acc_pending trigger mı frontend mi
- ⬜ **G6 başlangıcı** — token yapısı için renk yaklaşımı (değerler sonra, yapı şimdi)
> Not: G2 (dijital imza) ve kategori panelleri M2 çekirdek için zorunlu değil; M2'de basit/placeholder geçilebilir.

### M2.1 — Görsel + yapısal temel ⬜ (her ekranın ön koşulu)
Bağımlılık: M2.0 (renk yaklaşımı)
- ⬜ **[Frontend]** tokens.css iskeleti (placeholder değerler, yapı sabit)
- ⬜ **[Frontend]** B4.1 Header · B4.2 Avatar menü · B4.3 Alt nav (rol bazlı içerik) · B4.5 Tema · B4.6 100dvh · B4.7 touch target
- ⬜ **[Frontend]** B5.1–B5.7 paylaşılan bileşenler (error boundary, loading, empty, bağlantı yok, hata mesajı, confirm, toast)
- 🔶 **[Frontend]** A6 tip tanımları (M2 kapsamı kadar genişlet)

### M2.2 — Storage + dönem ön koşulu ⬜
Bağımlılık: yok (paralel yapılabilir)
- ⬜ **[Supabase]** A2.1 receipts bucket + A2.4/A2.6 RLS (saha yükler, muhasebe görür) — *fiş fotosu için, C2 bunu bekler*
- ⬜ **[Supabase]** B4 dönem bootstrap: BOOTSTRAP-MUSTERI.sql'e ilk açık dönem — *dönem yoksa fiş girilemez*
- 🔶 **[Supabase]** A7.1/A7.2 trigger doğrulama (canlıda çalışıyor mu)

### M2.3 — SAHA ekranı (sıralı inşa: ilk rol) ⬜
Bağımlılık: M2.1 + M2.2. Detay: EKRAN-SAHA.md
- ⬜ **[Frontend]** C1 ana ekran (disk + kamera + galeri + belgesiz submenu + scroll altı; bütçe/kategori widget M2'de placeholder)
- ⬜ **[Frontend]** C1.6–C1.9 kamera/galeri foto + Storage upload + receipt_image_url
- ⬜ **[Frontend]** C2 fiş formu (M2: OCR yok → manuel form; confidence/raw/GİB/imza placeholder)
- ⬜ **[Frontend]** C3 belgesiz form (is_documentless)
- ⬜ **[Frontend/Supabase]** C4.1–C4.4 fiş durum (draft INSERT/düzenle/sil/submit) + status geçiş (M2.0 kararına göre)
- ⬜ **[Frontend]** C5 dönem ekranı (pill, özet kart, fiş listesi, filtre, kapama submit minimal; PDF/avans M3)
- ⬜ **[Frontend]** C6 fiş detay (saha görünümü, işlem geçmişi)
> M2 dışı (M3): C2 OCR/sesli not, C6 arama tab, C7 avans, C8 bildirim

### M2.4 — DEPT ekranı (sıralı inşa: ikinci rol) ⬜
Bağımlılık: M2.3 (fişler dept_pending'e düşmüş olmalı). Detay: EKRAN-DEPT.md
- ⬜ **[Frontend]** D1.1–D1.6 onay duvarı (bekleyen liste, detay, onayla/reddet)
- ⬜ **[Frontend/Supabase]** D1.9 approval_log doğrulama
- ⬜ **[Frontend]** dept bütçe kartı (M2'de sayılar; bütçe limiti M3)
- ⬜ **[Frontend]** D3 dönem (dept özet + kapatma)
> M2 dışı (M3): D1.7 kategori düzeltme, D1.8 toplu onay, D2 ekip, D4 avans, D5 bütçe, D6 izinler, D7 kiralama

### M2.5 — MUHASEBE ekranı (sıralı inşa: üçüncü rol) ⬜
Bağımlılık: M2.4 (dept'ten geçen fişler). Detay: EKRAN-MUHASEBE.md
- ⬜ **[Frontend]** E2.1–E2.4 onay (acc_pending liste, detay, onayla/reddet)
- ⬜ **[Frontend/Supabase]** E2.7 approval_log doğrulama
- ⬜ **[Frontend]** E1 dashboard minimal (özet + departman kartları; drill-down M3)
- ⬜ **[Frontend]** E4.1–E4.4 dönem yönetimi (aç/kapat, kademeli kapanış minimal)
> M2 dışı (M3): E2.5 muhasebe tekrar-giriş izni (bağlı yeni fiş), E2.6 split, E3 avans, E5 departman, E6 kategori, E7 bütçe, E8 kullanıcı, E9 rapor, E10 marka, E11 kişi detay, E12 onboarding, şüpheli tab, kiralama tab

### M2 ÇIKIŞ KRİTERİ
Tek fiş: saha girer → (dept varsa) dept onaylar → muhasebe onaylar → dönem kapanır. Uçtan uca, canlıda.

---

## M3 — TAM FAZ 1

Bağımlılık: M2 tamam. Sıra önerisi (bağımlılığa göre):

### M3.1 — OCR ⬜ (saha deneyiminin kalbi)
Bağımlılık: A5.5 Vision API key, A2.1 bucket
- ⬜ **[Supabase]** A5.5 Vision API key · A5.1/A5.3 Edge altyapı tamam
- ⬜ **[Edge Function]** A4.1 OCR (foto→Vision→parse→confidence→kayıt)
- ⬜ **[Edge Function]** A4.5 GİB QR doğrulama
- ⬜ **[Frontend]** C2 OCR State 1/2 davranışı + confidence + raw + sesli not + GİB butonu (placeholder'lar gerçeğe döner)

### M3.2 — Avans ⬜
Bağımlılık: yeni storage bucket (dekont)
- ⬜ **[Supabase]** dekont bucket + RLS
- ⬜ **[Edge Function]** A4.4 hassas hesaplama (avans bakiye)
- ⬜ **[Frontend]** C7 (saha) · D4 (dept onayla→muhasebe) · E3 (muhasebe onayla&aktar→paid) · nakit akışı + dekont + kilit (IS-KURALLARI.md §9)

### M3.3 — Bildirim + Realtime ⬜
- ⬜ **[Edge Function]** A4.3 bildirim üretme
- ⬜ **[Frontend]** B6.1–B6.3 realtime · C8 (saha) + dept/muhasebe bildirim ekranları

### M3.4 — Anomali / Şüpheli ⬜
Bağımlılık: IS-KURALLARI §13 (anomali) ayrı oturumda detaylandırılmalı + şirket kuralı yapılandırması
- ⬜ **[Edge Function]** A4.2 şüpheli tespit (kural seti tasarlandıktan sonra)
- ⬜ **[Frontend]** muhasebe şüpheli tab + dashboard şüpheli kartı

### M3.5 — Yönetim ekranları (muhasebe) ⬜
- ⬜ **[Frontend]** E5 departman · E6 kategori · E7 bütçe · E8 kullanıcı (+ A3.2 send-invite, A3.3 accept-invite, A5.4 Resend) · E10 marka · E12 onboarding
- ⬜ **[Frontend]** D2 ekip · D5 bütçe · D6 izinler (dept)
- ⬜ **[Edge Function]** A3.4 create-project

### M3.6 — Kiralama ⬜
Bağımlılık: IS-KURALLARI.md §6
- ⬜ **[Frontend]** D7 (dept) · muhasebe kiralama tab · ceza hesabı + gecikme durumları

### M3.7 — Rapor + Export ⬜
- ⬜ **[Frontend]** E9 rapor (4 mod) · C5.7/PDF · F6 export · E9.3/E9.4 PDF/Excel

### M3.8 — Mesajlaşma ⬜
Bağımlılık: M3.3 realtime, mesaj yetki matrisi tanımı
- ⬜ **[Frontend]** F1–F10 (sohbet, 1-1, grup, baloncuk, okundu, XSS, otomatik mesaj, realtime)

### M3.9 — Kalan kurallar ⬜
- ⬜ split (E2.6, G10 kararı) · kategori panelleri (C2/C3) · vergi sayaçları · dönem disiplini (7 gün pasif onay + kapanış grace) · kişi detay (E11)

---

## M4 — PİLOT HAZIRLIK ⬜
Bağımlılık: M3 tamam.
- ⬜ **[Frontend]** H2 PWA (manifest, service worker, kamera, ana ekrana ekle)
- ⬜ **[Vercel]** H1.2/H1.3 dev+staging ortamı
- ⬜ **[Supabase]** H3.1 seed · H3.3 metrikler · H4.1 KVKK · H4.2 performans · H4.3 güvenlik · H4.5 hard delete
- ⬜ **[Frontend]** H3.2 hata raporlama · H3.4 onboarding rehberi · H3.5 admin dashboard
- ⬜ **[Edge Function]** H4.4 OCR eşik kalibrasyon · A4.6 period_closings Edge
- ⬜ H5.1–H5.6 pilot (onboarding, 1 hafta, başarı kriterleri, geri bildirim, bug fix, rapor)

---

## CFE — CORE FINANCE ENGINE ⬜ (ayrı milestone)
Kur dönüşümü · KDV · bütçe hesabı. Pure functions, A4.4'e bağlanır. Zamanlama TBD.

---

## TEKNİK BORÇ ⬜ (5/5 dolu — yeni özellik öncesi 1 kapat)
Açık teknik borç tek kaynak: docs/TECH-DEBT.md (TD-2, TD-3, TD-5, TD-6 = 4/5). README + favicon → G6/M2.1 todo'su (borç değil, IS-SIRASI M2.1 altında).

---

## BAĞIMLILIK ÖZETİ (kritik oklar)
```
M2.0 (kararlar) ───┐
                   ├──→ M2.1 (tokens+shell) ──┐
M2.0 (renk) ───────┘                          ├──→ M2.3 Saha ──→ M2.4 Dept ──→ M2.5 Muhasebe ──→ M2 ÇIKIŞ
M2.2 (storage+dönem) ─────────────────────────┘

M2 ÇIKIŞ ──→ M3.1 OCR
         ──→ M3.2 Avans
         ──→ M3.3 Bildirim ──→ M3.4 Anomali (+ayrı kural tasarımı)
                            ──→ M3.8 Mesaj
         ──→ M3.5 Yönetim (+davet Edge)
         ──→ M3.6 Kiralama / M3.7 Rapor / M3.9 Kalan
M3 ──→ M4 Pilot
```
