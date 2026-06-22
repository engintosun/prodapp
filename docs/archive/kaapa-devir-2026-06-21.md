# KAAPA devir — 2026-06-21 (cost_object şema + fn_open_budget; sırada 2b)

## Bu oturum (kod ÜRETTİ — 2 commit canlı)
- cost_object şema dilimi (Dilim 0) → 2f72ecc: budget_cost_objects (bütçe-bazlı, muhasebe-only RLS, B19/updated_at) + budget_items.cost_object_id (nullable composite-FK, on delete restrict, MATCH SIMPLE). vat_rate ZATEN canlıydı (CURRENT düzeltildi).
- fn_open_budget (Dilim 2a) → 13f8e4f öncesi migration 20260620140000: raftan fotokopi RPC (stages+cards+items[unit_net=0]+percent_lines+paket→item_burdens günün oranı+"Dönemsiz") + departments.code + budget_stages.is_undated. fn_create_project kalıbı (SECURITY DEFINER, atomik, Türkçe hata, REVOKE/GRANT).
- Uçtan-uca test: 8 assertion exit 0 (stages=2, undated=true, departments=1, expense_groups=1, budget_items=2, item_code_seq=2, budget_item_periods=0, percent_lines=1) + cost_object çapraz-bütçe composite-FK REDDEDİLDİ (gerçek veriyle). HEAD = 13f8e4f.

## Kilitlenen kararlar (detay: TASARIM-KARARLARI.md "### F. fn_open_budget kararları")
1. department_code → departments.code kanonik anahtar; fn_open_budget bul-veya-oluştur (ON CONFLICT race-safe). İsim-eşleme reddedildi.
2. "Dönemsiz" = budget_stages.is_undated; rezerve etap (sort_order 9999); mühür muafiyeti fn_lock_budget'ta.
3. Model A doğrulandı CANLI: köprü boş, unit_net=0, cost_object boş açılır.
4. item_code = item_code_seq monoton (max+1 DEĞİL — kalıcı kimlik); B-serisi korundu.
5. cost_object çapraz-bütçe garantisi composite-FK ile gerçek veriyle kanıtlandı.

## Süreç dersleri (sonraki oturum BAŞTAN uygula)
- Uzun SQL blokları terminal/önizlemede satır ÇİFTLER (yapıştırma/heredoc/create_file fark etmez). Çözüm: Sonnet dosyayı KENDİ yazsın + çalıştırmadan önce `grep -c` ile kritik satır sayısını doğrulasın; çift ise yeniden yaz. Test bloklarını assertion'lı yaz (`if ... raise exception 'FAIL'`), çünkü `supabase db query` NOTICE döndürmez — exit kodu tek kanıt.
- Test izole olsun: profiles.user_id auth.users FK'sı ister; gerçek kullanıcı KULLANMA, geçici auth.users insert/delete.

## Sıradaki chat — 2b (tek kartın çalışan giriş UI'i)
- fn_open_budget'ın açtığı bütçeyi düzenleyen ekran: kalem gir (ad/net/adet/birim/cost_object) + canlı toplam, DB'ye bağlı. İlk React + canlı Supabase dilimi.
- Açık kararlar (2b başında netleşecek): kalem girişi optimistic mi; cost_object dropdown nasıl beslenir (budget_cost_objects registry); canlı toplam nerede (CFE pure fn mi UI mı); unit_net=0 başlangıç UX'i.
- Sonra 2c (öngörülen okuma: köprü + CFE → matris), sonra Dilim 2 mühür (fn_lock_budget).

## Açık Borç (değişmedi)
- TECH-DEBT 5/5 sınırda; 2a borç eklemedi. Yeni borç öncesi tercihen kapat.

## Kurallar (değişmedi)
Tek-blok prompt + dil etiketi yok; git checkout/pull + BRANCH YASAK + push; supabase db push için "kabul"; sormadan yeni dosya yok; tek karar + 1 cümle + kabul/itiraz. EK: uzun SQL'i Sonnet kendi yazsın + grep doğrula (çiftlenme).
