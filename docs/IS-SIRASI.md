# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)
· ✅ Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved)
· ✅ Onboarding UI (proje ac girisi + departman→donem→butce→davet kurulum akisi, 2026-06-10)

## Sıra (bağımlılığa göre)
1. ⬜ Dept/Muhasebe ev + navigasyon (reviewer onay/red'i normal akışta erişilebilir yapar). Card-desk layout burada.
2. ⬜ C5 Dönem ekranı (kapama + grace)
3. ⬜ Rapor / Export (PDF/Excel)
4. ⬜ Avans akışı (avans→bütçe çift-sayım kuralı netleşince — CURRENT.md açık)
5. ⬜ C2c kategori panelleri + C3 belgesiz
6. ⬜ Şüpheli işlem tespiti (FİŞ-BAZLI: suistimal/mükerrer) — anomali motoru. Ayrı tasarım oturumu (§13 + şirket kural değerleri). Bütçe-havuzu uyarısından (%80/%100) ayrı sistem.
7. ⬜ Mesajlaşma / bildirim (en son — kesişen)
8. ⬜ Üye yönetimi (TD-2'ye bloke)
Sonra: Zengin bütçe modülü (kategori/satır + Excel import + sapma/tahmin paneli + %80/%100 eşik uyarısı) · Tedarikçi hafızası (DÜŞÜNÜLECEK) · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · CFE (TBD).

## Borçlar (yeni özellik öncesi tercihen 1 kapat)
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster
- Storage upload owner=auth.uid() gerçek testi
- dynamic-action yanlış fonksiyonu Supabase'den sil
- TECH-DEBT.md: TD-2/3/5/6 açık (chief_id kullanılmıyor = TD-8)
