# KAAPA — İŞ SIRASI

BU DOSYA SIRADAKI İŞİ TUTMAZ. Tek kaynak: CURRENT.md "Sıradaki iş" bölümü. Burada yalnız (a) TAMAMLANAN iş referansı ve (b) UZUN VADELİ backlog (yakında başlamayacak, tarihsiz fikirler) yaşar. Bitenler silinmez (referans için kalır); tarihçe ayrıca git log'da.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi · ✅ Onboarding UI · ✅ Reviewer onay/red · ✅ Davet/rol 1a+1b+1c
✅ Bütçe DB temeli + fn_open_budget + CFE + KART 1500 ekran · ✅ DILIM-2 (basit statüler, a-e tüm alt-turlar)
✅ DILIM-3 — bordro motoru TAM: 3a şema/iskelet · 3b katalog seed · 3c CFE saf çözücü · 3d UI kablolama · 3e genel-desen sökümü (input_mode mimarisi tamamen kaldırıldı)
✅ Şirket Profili dilimi (şema+RLS+trigger+servis+UI) + SGK senaryo türetme algoritması
✅ Terminoloji devrimi K9-r2 (Miktar=süre, X=kişi/adet, Çarpan emekli)
✅ MÜHÜR-1 (fn_lock_budget çekirdeği) + MÜHÜR-2 (servis okuma çatalı, sealed_at sabitleme)
✅ R-serisi ekran refaktörü: R1 (inert parçalar) · R2 (canlı çekirdek, use-card-rows/use-edit-buffers) · R3 (servis dikişi, payroll-read.ts + getCard)
✅ KLV — İ7 klavye motoru: KLV-0/1 (motor+sabit tablo) · KLV-K6 (görüntü/taslak ayrımı) · KLV-K7 (select hücre istisnası) · KLV-K8 (dikey gezinme semantik eşdeğerlik grubu)

## Sırada (tek kaynak CURRENT.md)
Bu bölüm kasıtlı boş bırakılmıştır. "Sıradaki iş" için CURRENT.md'ye bak.

## Backlog (uzun vadeli, tarihsiz — CURRENT.md'nin "Sıradaki iş"ine henüz girmedi)
- Diğer kartlar (1100/1300/1400/1600) — 1500 modeli üzerinden geçilir.
- KABUK milestone'una taşındı (CURRENT.md Sıradaki iş #4): EV/ana ekran + navigasyon (card-desk) + bütçe rayı + iki davet kapısının yerlerinin kararlaştırılması (M1 yalnız yüzey aidiyetini mühürledi; fiziksel yer — sol ray/üst ray/kart üstü/sağ panel — açık, Engin kararı) + G6 görsel tasarım (renk/tipografi/ikonografi/dark-light; tokens.css placeholder bekliyor) + TD-13/TD-10 kapanışı + şablon-tipi ("ne bütçesi: film/reklam/dizi") yer tutucusu + açılış tutorial'ı (Engin vizyonu 2026-07-15, ekranlar son halini almadan yazılmaz).
- C5 Dönem ekranı (kapama + grace).
- Rapor/Export (PDF/Excel) — icmal PDF + EFC + dış format (Bakanlık/AICP) + amort/bölüm payı.
- Avans akışı (avans→bütçe çift-sayım + B10).
- Şüpheli işlem tespiti (FİŞ-BAZLI) — anomali motoru, ayrı tasarım oturumu.
- Mesajlaşma/bildirim (en son).
- Üye yönetimi (TD-2'ye bloke).
- m9 bütçe sol-nav alanı · şablon Türkçe karakter · Kütüphane resmîleştirme + katalog-kodu · Breakdown modülü · Tedarikçi hafızası · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · Oran yönetimi ekranı (Tanımlar içinde).
- Bütçe-yetki tablosu dilimi (M2/M3, BUTCE-EKRAN-KARARLARI davet mimarisi bölümü): kişi+kapsam yetki tablosu, RLS genişlemesi, invitations genişlemesi, bütçe-rayında davet UI — kart çoğaltma başlayınca. Hafif-bütçe yolu tasarım oturumu da bu evrede.

## Borçlar
Tüm teknik borçlar tek kaynak: docs/TECH-DEBT.md.
