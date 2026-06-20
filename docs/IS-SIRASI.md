# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)
· ✅ Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved)
· ✅ Onboarding UI (proje ac girisi + departman→donem→butce→davet kurulum akisi, 2026-06-10)

## Sıra (bağımlılığa göre)
1. Bütçe modülü — kavram + şema + KART MİMARİSİ (1100-1600) + cost_object (4. eksen) KİLİTLİ (B1-B19). Sıra:
   1a. ✅ DB temeli (14 tablo + RLS + değişiklik izi + sözlük seed) — b89d67e, 2026-06-13.
   >> 2026-06-20: KART MİMARİSİ 1100-1600 + cost_object (4. eksen) KİLİTLİ. ÖNCELİK (1b'den önce): (a) cost_object ŞEMA dilimi — budget_cost_objects + budget_items.cost_object_id nullable + restrict-silme + RLS muhasebe-only + baseline kapsamı (DDL onayı, L1-L3); (b) bütçe runtime DİKEY-DİLİMİ — fn_open_budget + TEK kartın çalışan giriş yüzeyi (ad/net/adet/birim/cost_object + canlı toplam, DB-bağlı), kart-yürüyüşünden öncelikli, yığını gerçek kartta doğrular.
   1b. ⬜ Servis + CFE dilim 1 + sınav düzeneği (cevap anahtarlı testler). RPC: bütçe-aç / kilit-vur / fiş-eşle. [Arada: şablon içerikleri seed'i + görsel tasarım turu.]
   1c. ⬜ Giriş yüzeyi: kart masası + kalem tablosu (§19). Kuruluma tip seçimi eki (B8).
   1d. ⬜ Okuma yüzeyi: icmal + gerçekleşen + tanımlar.
   1e. ⬜ Eşleşme + doğrudan ödeme: kalem önerisi + eşleşmemiş havuz + ödeme girişi + önceki projeden kopyala.
   (KDV/stopaj/yuvarlama hesabı = CFE'nin ilk dilimi, 1b'de doğar.)
2. ⬜ Dept/Muhasebe ev + navigasyon (reviewer onay/red'i normal akışta erişilebilir yapar). Card-desk layout burada; TD-10 burada kapanır.
3. ⬜ C5 Dönem ekranı (kapama + grace)
4. ⬜ Rapor / Export (PDF/Excel) — icmal PDF + EFC + dış format eşlemeleri (Bakanlık/AICP) + amort/bölüm-başı pay raporu
5. ⬜ Avans akışı (avans→bütçe çift-sayım + B10 etiket mekaniği)
6. ⬜ C2c kategori panelleri + C3 belgesiz
7. ⬜ Şüpheli işlem tespiti (FİŞ-BAZLI) — anomali motoru. Ayrı tasarım oturumu. Bütçe-havuzu uyarısından ayrı sistem.
8. ⬜ Mesajlaşma / bildirim (en son — kesişen)
9. ⬜ Üye yönetimi (TD-2'ye bloke)
Sonra: Kütüphane resmîleştirme + katalog-kodu (her katalog kalemine kod; 1600 dahil kodlar orada kesinleşir, cost_object oto-etiketi buna bağlı) · Breakdown modülü (gelecek; cost_object'i otomatik besler) · Tedarikçi hafızası (DÜŞÜNÜLECEK) · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · CFE (TBD).

## Borçlar (yeni özellik öncesi tercihen 1 kapat)
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster
- Storage upload owner=auth.uid() gerçek testi
- dynamic-action yanlış fonksiyonu Supabase'den sil
- TECH-DEBT.md: TD-2/3/5/6 açık (chief_id kullanılmıyor = TD-8)
