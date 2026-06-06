# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)
· ✅ Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved)

## Sıra (bağımlılığa göre)
1. ⬜ Muhasebe onboarding çatısı: departman oluştur → dönem aç → ekip davet et (SK-AUTH-2). Minimal bütçe-limit giriş yolu buraya katlanır. Card-desk layout için Engin girdisi alındı (CURRENT.md'de kilitli).
2. ⬜ Dept/Muhasebe ev + navigasyon (mevcut reviewer onay/red'i normal akışta erişilebilir yapar)
3. ⬜ C5 Dönem ekranı (kapama + grace)
4. ⬜ Rapor / Export (PDF/Excel)
5. ⬜ Avans akışı
6. ⬜ C2c kategori panelleri + C3 belgesiz
7. ⬜ Şüpheli işlem tespiti (ayrı tasarım oturumu — §13 + şirket kural değerleri)
8. ⬜ Mesajlaşma / bildirim (en son — kesişen)
9. ⬜ Üye yönetimi (TD-2'ye bloke)
Sonra: M4 pilot hazırlık · CFE (zamanlama TBD).

## Borçlar (yeni özellik öncesi tercihen 1 kapat)
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster
- Departman oluşturma UI (muhasebe onboarding) — davet bunu gerektiriyor
- Storage upload owner=auth.uid() gerçek testi
- dynamic-action yanlış fonksiyonu Supabase'den sil
- TECH-DEBT.md: TD-2/3/5/6 açık
