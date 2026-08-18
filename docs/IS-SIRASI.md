# KAAPA — İŞ SIRASI

**Son güncelleme:** 18 Ağustos 2026

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
✅ KART 1100: 1100-A (resmi_odeme statüsü · is_group bayrağı · 47 kütüphane tohumu · şablon kartı · tek imza doktrini) · 1100-B (başlık çizimi, başlık başına üç rakam, Başlıksız bloğu, kalemi olmayan başlık çizilmez)

## Sırada (tek kaynak CURRENT.md)
Bu bölüm kasıtlı boş bırakılmıştır. "Sıradaki iş" için CURRENT.md'ye bak.

## Backlog (uzun vadeli, tarihsiz — CURRENT.md'nin "Sıradaki iş"ine henüz girmedi)
- Diğer kartlar (1100/1300/1400/1600) — 1500 modeli üzerinden geçilir.
- **DÜZELTME (17 Ağustos 2026, Engin):** yukarıdaki "1500 modeli üzerinden geçilir" cümlesi artık TÜM kartlar için geçerli DEĞİLDİR. 1500 ÇOĞU kartın modelidir; KART 1100 ve Oyuncu kartı (1600) kendi şekillerine sahiptir ve ikisi de 1500'den farklıdır. Somut fark: 1100'ün kodları iki seviyelidir (1101 başlık + 1101-01 atom, dokuz başlık), 1500'ünkiler düzdür (1501-1505, başlık satırı yok) — bu yüzden 1100 başlıklı çizilir, 1500 düz kalır. Model kart olmak "her kart aynı şekle girer" demek değildir.
- G6 görsel tasarım (renk/tipografi/ikonografi/tema; tokens.css placeholder bekliyor) — KABUK'tan AYRI turdur (bkz. docs/TASARIM-KARARLARI.md §3, iki tema eşitliği kararı).
- Şablon-tipi ("ne bütçesi: film/reklam/dizi") yer tutucusu.
- Açılış tutorial'ı (Engin vizyonu 2026-07-15, ekranlar son halini almadan yazılmaz).
(Aktif KABUK tanımı ve iş sırası artık burada YAŞAMAZ: docs/KABUK-KARARLARI.md + CURRENT.md Sıradaki iş.)
- C5 Dönem ekranı (kapama + grace).
- Rapor/Export (PDF/Excel) — icmal PDF + EFC + dış format (Bakanlık/AICP) + amort/bölüm payı.
- Avans akışı (avans→bütçe çift-sayım + B10).
- Şüpheli işlem tespiti (FİŞ-BAZLI) — anomali motoru, ayrı tasarım oturumu.
- Mesajlaşma/bildirim (en son).
- Üye yönetimi (TD-2'ye bloke).
- m9 bütçe sol-nav alanı · şablon Türkçe karakter · Kütüphane resmîleştirme + katalog-kodu · Breakdown modülü · Tedarikçi hafızası · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · Oran yönetimi ekranı (Tanımlar içinde).
- Bütçe-yetki tablosu dilimi (M2/M3, BUTCE-EKRAN-KARARLARI davet mimarisi bölümü): kişi+kapsam yetki tablosu, RLS genişlemesi, invitations genişlemesi, bütçe-rayında davet UI — kart çoğaltma başlayınca. Hafif-bütçe yolu tasarım oturumu da bu evrede.
- Kart toplam satırı (2026-07-21, Engin notu — kart masası ekranı)
- Kart içerik grafikleri (2026-07-21, Engin notu — kart masası ekranı)
- Autocomplete "diğer kartlarda ara" genişletmesi: başka kartın kalemini isim/varsayılanlarıyla kopyalar, kodu bu kartın muhtelif kuyruğundan verir (2026-07-21, park kararı — Faz 1 dışı)
- Serbest kalem mini istasyonunda bulanık/yakın eşleşme önerisi: "bunu mu demek istediniz: X?" (2026-07-21, park kararı — Faz 1 dışı; içeren-eşleşme çoğu durumu zaten karşılıyor)
- Etap adlandırma revizyonu (Engin, 5 Ağustos 2026, ertelendi): mevcut Beş Etap yerine önerilen genişletilmiş isimlendirme — Geliştirme · Ön Hazırlık · Çekim · Post Prodüksiyon · Dağıtım ve Yayın, + tartışmaya açık iki ek: Finansman, Kapanış/Tasfiye. GLOSSARY'nin güncel isim standardına dokunmadan, ayrı bir oturumda ele alınacak.

## Borçlar
Tüm teknik borçlar tek kaynak: docs/TECH-DEBT.md.
