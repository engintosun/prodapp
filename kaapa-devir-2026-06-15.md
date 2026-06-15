# KAAPA devir — 2026-06-15 (şablon FORMAT + KDV kararı; sırada UYGULAMA)

## Bu oturum (kod ÜRETMEDİ — mimari + araştırma + karar)
- Repo taze-klonlandı; iki migration (20260613115009 + 20260614150000) + dört doküman okundu: kart=departman + kalem<->dönem köprüsü modeli BİREBİR doğrulandı (byte-kesin). HEAD = cb0d6c4 (doc; kod e63fbb0).
- AICP (reklam) + Movie Magic (film) + dizi araştırması tamam; sonuç: yapı geçer / ABD rakamı geçmez; dizi yeni model istemez (scope ile çözülü).

## Kilitlenen kararlar (detay: TASARIM-KARARLARI.md "Şablon body FORMAT + KDV ayrıştırma")
1. body FORMAT: tek şekil tüm tür/scope; dizi=iki şablon satırı. stages[]+cards[]+items[]+percent_lines[]; B16 kasa ile aynı serileştirici.
2. Köprü açılışta BOŞ (Model A): şablon kalemi döneme bağlamaz; "ne zaman"ı kullanıcı kurar; unit_net açılışta 0.
3. Yük = paket kodu; açılışta item_burdens'e günün oranı.
4. budget_percent_lines DEĞİŞMEZ; seçilebilir-tabanlı markup gereksiz (yük zaten item_burdens'te).
5. KDV Geniş yol: budget_items'a vat_rate (şema eki); body'ye default_vat/vat; net veya brüt giriş, CFE türetir; B18 kırılmaz; nakit matrisi brüt-nakit.

## Sıradaki chat — UYGULAMA (SIRAYLA)
0. vat_rate şema eki: budget_items.vat_rate (numeric default 20, >=0). Küçük migration. supabase db push için "kabul".
1. Şablon içerik seed (body FORMAT'ında): film (Engin ödevi) + reklam (AICP 11 kart) + dizi (film örtüşür, season+episode) + belgesel sonra.
2. fn_open_budget (raftan fotokopi + günün oranı + "Dönemsiz" etabı + department_code çözümü; köprü boş) + öngörülen okuma (matris).
3. fn_lock_budget (mühür -> kasa; kapılar: en az bir dönem + tarihli + dönemsiz muafiyeti).
4. fn_match_receipt (Dilim 5).
- Tüm RPC: fn_create_project kalıbı (SECURITY DEFINER, atomik, Türkçe hata, REVOKE/GRANT), canlı doğrulanır.
- Açık bayraklar: department_code->department_id (kanonik kod/seed?) · "dönemsiz" mühür muafiyeti (is_undated?).
- Sonra Dilim 3 (kart masası, ÖNCE görsel tasarım turu).

## Açık Borç (değişmedi)
- TECH-DEBT Açık Borç 5/5 sınırda; yeni borç öncesi tercihen kapat. TD-10 card-desk ev/nav işinde kapanır.

## Kurallar (değişmedi)
Tek-blok prompt + dil etiketi yok; git checkout/pull + BRANCH YASAK + push; fresh-clone doğrulama; supabase db push için "kabul"; sormadan yeni dosya yok; tek karar + 1 cümle + kabul/itiraz.
