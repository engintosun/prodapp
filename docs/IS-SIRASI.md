# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)

## Sıra (bağımlılığa göre)
1. ⬜ Reviewer Onayla/Reddet → statü geçişi + approval_log (+ 3c reviewer gerçek-UI testi) — döngüyü kapatır
2. ⬜ Dept/Muhasebe ev + nav (muhasebe nav layout = Engin tasarlar; "Davet" sekmesi geçici mount)
3. ⬜ C5 Dönem ekranı (kapama + grace)
4. ⬜ Rapor / Export (PDF/Excel)
5. ⬜ Avans akışı
6. ⬜ Mesajlaşma / bildirim
7. ⬜ Arama / filtre
8. ⬜ C2c kategori panelleri (§6 limit — Engin'den) + C3 belgesiz
9. ⬜ Şüpheli işlem tespiti
10. ⬜ Davet Aşama 3: üye yönetimi (liste / revoke / arşiv — membership_status)
Sonra: M4 pilot hazırlık · CFE (kur/KDV/bütçe motoru) — zamanlama TBD.

## Borçlar (yeni özellik öncesi tercihen 1 kapat)
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster
- Departman oluşturma UI (muhasebe onboarding) — davet bunu gerektiriyor
- Storage upload owner=auth.uid() gerçek testi
- dynamic-action yanlış fonksiyonu Supabase'den sil
- TECH-DEBT.md: TD-2/3/5/6 açık
