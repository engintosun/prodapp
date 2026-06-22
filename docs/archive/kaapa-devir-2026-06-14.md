# KAAPA devir — 2026-06-14 (bütçe göçü canlıya alındı)

## Bu oturumda canlıya alınan
- Bütçe göçü migration'ı yazıldı + CANLI DB'ye uygulandı. Commit e63fbb0 (kod HEAD). supabase db push temiz, migration list Local=Remote.
- Şema değişikliği: expense_groups.stage_id kalktı + department_id NOT NULL; budget_stages'a start/end_date (nullable) + tarih sıra check'i; budget_items.quantity kalktı; YENİ budget_item_periods köprüsü + GRANT + RLS (muhasebe-only) + iz/updated_at tetikleyicileri.

## Bu oturumda kilitlenen kararlar (detay: TASARIM-KARARLARI.md)
- Köprü modeli A: her kalem-dönem çifti tek satır, miktar köprüde, birim/adet/yük kalemde sabit, satır toplamı türetilir.
- Dönem tarihi nullable; "tarihli olmalı" + "en az bir dönem" zorlamaları MÜHÜRDE (fn_lock_budget), iskelette değil.

## Sıradaki (yeni chat) — SIRAYLA
1. Şablon body jsonb FORMAT kararı (yeni modele göre: kart=departman + köprü). MİMARİ iş, önce bu.
2. Engin'in ödevi: film tipi şablon içeriği, (1)'in formatında (ayrı seed).
3. fn_open_budget (raftan fotokopi + günün oranları) + öngörülen okuma servisi (köprüyü okur).
4. fn_lock_budget (mühür): CFE toplamları gömülü fotoğraf -> kasa; mühür kapıları = en az bir dönem + dönem tarihli.
5. fn_match_receipt (B9 öneri + tek dokunuş, Dilim 5).
- Tüm RPC'ler fn_create_project kalıbı: SECURITY DEFINER, atomik, Türkçe hata, REVOKE/GRANT. Canlı doğrulanır (UI testi yok).
- Sonra Dilim 3 (kart masası + kalem tablosu, ÖNCE görsel tasarım turu).

## Açık Borç (değişmedi)
- TD-11: React efekt hijyeni (toast.tsx) — 5/5 sınırda, ayrı tur + elle doğrulama.

## Kurallar (değişmedi)
Tek-blok prompt, dil etiketi yok, git checkout/pull + BRANCH YASAK + push, fresh-clone doğrulama, supabase db push için "kabul", sormadan yeni dosya üretme.
