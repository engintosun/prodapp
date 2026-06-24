# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)
· ✅ Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved)
· ✅ Onboarding UI (proje ac girisi + departman→donem→butce→davet kurulum akisi, 2026-06-10)

## Sıra (bağımlılığa göre)

### DILIM-2 — Basit statüler (2a Engin onayi bekliyor)
> NOT: 2a başlamadan Engin onayı alınacak (basit statüler şimdi, bordro motoru DILIM-3 ayrı faz).
- 2a. ⬜ ŞEMA: `burden_components.kind` (additive/deduction) + statü→bileşen eşleme tablosu + `rate_catalog`'a basit oranlar (smm%20, telif%17, kira%20 vb.) — **SEMA DEĞİŞİKLİĞİ, db push gerekir.**
- 2b. ⬜ Statü seç → bütçe aç → kovayı snapshot (fn_open_budget statüye göre `item_burdens` doldurur).
- 2c. ⬜ CFE brüt'ü cinse göre hesaplar: `additive` → ×(1+oran); `deduction` → /(1−oran). Net+Brüt ayrı CFE fonksiyonu; cevap-anahtarlı test.
- 2d. ⬜ Ekran: Net + Brüt ayrı kolon; KDV ayrı kolon/havuz (geri-alınabilir gösterimi); Yük = Yasal Yük, brüt−net farkı (TL); döküm statüye göre.

### Bağımsız UI düzeltmeleri (DILIM-2 ile paralel yürüyebilir)
- m2. ⬜ Dönem-satırı hizalama: net → Birim-net kolonunun altına; miktar → Adet kolonunun altına.
- m3. ⬜ Açıklama hücresi: tıkla/odakta genişle, çıkınca daral.
- m5+m6. ⬜ Birim seçilebilir dropdown (adet/kişi/gün/hafta/ay; kaleme göre varsayılan; üstüne tıklayınca değişir).

### DILIM-3 — Bordro motoru (ayrı faz, DILIM-2 bittikten sonra)
- ⬜ Parametre DB derinleştirme: GVK 103 dilimler + SGK taban/tavan + damga + asgari ücret istisnası (versiyonlu, `valid_from`'lu).
- ⬜ Kümülatif matrah algoritması (kişi-bazlı hafıza, aylık, dilim atlama).
- ⬜ Dönem-bazlı aylık işleyiş (aylık fringe değişimi modeli).
- ⬜ Payroll-base listesi (bütçeci düzenler).
- ⬜ Parametre yönetim paneli (SGK-işveren Şirket-Profili checkbox: %19,75 varsayılan / %15,5 bakanlık-bölgesel / %21,75 borçlu-teşviksiz).

### Diğer kartlar (DILIM-2 + UI düzeltmeleri bittikten sonra)
- ⬜ 1100, 1300, 1400, 1600 — 1500 modeli üzerinden geçilir.

### Ana sıra (geri kalan)
1. ✅ Bütçe modülü DB temeli + fn_open_budget + CFE temel + KART 1500 giris UI 6 kolon.
2. ⬜ DILIM-2 (yukarıda) + bağımsız UI düzeltmeleri.
3. ⬜ DILIM-3 bordro motoru.
4. ⬜ Diğer kartlar (1100/1300/1400/1600).
5. ⬜ Dept/Muhasebe ev + navigasyon. Card-desk layout burada; TD-10 kapanır.
6. ⬜ C5 Dönem ekranı (kapama + grace).
7. ⬜ Rapor / Export (PDF/Excel) — icmal PDF + EFC + dış format (Bakanlık/AICP) + amort/bölüm pay.
8. ⬜ Avans akışı (avans→bütçe çift-sayım + B10).
9. ⬜ C2c kategori panelleri + C3 belgesiz.
10. ⬜ Şüpheli işlem tespiti (FİŞ-BAZLI) — anomali motoru. Ayrı tasarım oturumu.
11. ⬜ Mesajlaşma / bildirim (en son).
12. ⬜ Üye yönetimi (TD-2'ye bloke).

Backlog (sonraya): m9 bütçe sol-nav alanı · şablon Türkçe karakter (seed + mevcut bütçe isimleri) · dönem-net soluk/koyu kontrast görsel teyidi · Kütüphane resmîleştirme + katalog-kodu · Breakdown modülü · Tedarikçi hafızası · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · Oran yönetimi ekranı (kullanıcı stopaj/KDV/SGK standart oranlarını UI'dan günceller; payment_status_defaults/rate_catalog cetveline valid_from'lu yazar; bütçe modülü oturduktan sonra).

## Borçlar
Tüm teknik borçlar tek kaynak: docs/TECH-DEBT.md.
