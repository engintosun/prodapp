# KAAPA — İŞ SIRASI

Yalnızca SIRA tutar. ✅ bitti · 🔶 kısmen · ⬜ yapılmadı. Bitenler silinir; tarihçe git log.
Aktif milestone: M2 — Çekirdek Döngü.

## Yapıldı (referans)
✅ M1 altyapı+auth · ✅ Saha fiş girişi (C1 + C2b: foto→form→submitted) · ✅ yönlendirme trigger
· ✅ 3c düzeltme mekaniği · ✅ Faz-1 yazma grantları · ✅ Davet/rol 1a+1b+1c (canlı)
· ✅ Reviewer onay/red (fn_review_receipt RPC + muhasebe queue dept_approved)

## Sıra (bağımlılığa göre)
1. ⬜ Onboarding: proje oluştur → departman → dönem → minimal bütçe (proje toplamı + departman) → ekip davet.
   ✅ ÖN-KOŞUL TAMAM (2026-06-10): bütçe→proje şeması (project_budgets + project_dept_budgets) + fn_create_project memuru + servisler (createProject / setProjectBudget / setProjectDeptBudget) canlıda. Sırada: onboarding UI. Kabuk mekaniği (minimal çerçeve / card-desk) ekran tasarımında. Bütçe iskeleti, kategori/satır/import sonradan altına eklenecek şekilde kuruldu. (SK-AUTH-1/2 + 2026-06-10 kararları → CURRENT.md.)
2. ⬜ Dept/Muhasebe ev + navigasyon (reviewer onay/red'i normal akışta erişilebilir yapar). Card-desk layout burada.
3. ⬜ C5 Dönem ekranı (kapama + grace)
4. ⬜ Rapor / Export (PDF/Excel)
5. ⬜ Avans akışı (avans→bütçe çift-sayım kuralı netleşince — CURRENT.md açık)
6. ⬜ C2c kategori panelleri + C3 belgesiz
7. ⬜ Şüpheli işlem tespiti (FİŞ-BAZLI: suistimal/mükerrer) — anomali motoru. Ayrı tasarım oturumu (§13 + şirket kural değerleri). Bütçe-havuzu uyarısından (%80/%100) ayrı sistem.
8. ⬜ Mesajlaşma / bildirim (en son — kesişen)
9. ⬜ Üye yönetimi (TD-2'ye bloke)
Sonra: Zengin bütçe modülü (kategori/satır + Excel import + sapma/tahmin paneli + %80/%100 eşik uyarısı) · Tedarikçi hafızası (DÜŞÜNÜLECEK) · Yapımcı/denetçi rolü (Faz 2) · M4 pilot hazırlık · CFE (TBD).

## Borçlar (yeni özellik öncesi tercihen 1 kapat)
- Hata maskeleme: accept-invitation + signup genel mesaj → gerçek hatayı göster
- Storage upload owner=auth.uid() gerçek testi
- dynamic-action yanlış fonksiyonu Supabase'den sil
- TECH-DEBT.md: TD-2/3/5/6 açık (chief_id kullanılmıyor = TD-8)
