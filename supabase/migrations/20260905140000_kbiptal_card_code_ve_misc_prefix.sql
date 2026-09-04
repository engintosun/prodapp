-- K-B IPTALI: kart aidiyeti katalog kodunun ilk iki hanesinden TURETILMIYOR
-- artik, atomun kendi satirinda VERI olarak duruyor (item_library.card_code).
-- Ayni gerekce dun geceki heading_id kararinin (aidiyet veridir) devami:
-- KART 1600 iki koken blogu tasiyor (16xx + 39xx), onek turetmesi bu kartta
-- hicbir zaman calismadi ve genisletilerek de duzelmez. Karar evi:
-- BUTCE-SEMA-KARARLARI §I (K-B iptali), DEGISMEZLER md.2.

-- 1) item_library.card_code. Gecici olarak NULL-a acilir, geriye donuk
--    doldurulur, sonra NOT NULL yapilir.
alter table public.item_library add column card_code text;

comment on column public.item_library.card_code is
  'Atomun ait oldugu kart. Aidiyet veridir, katalog kodunun onekinden
   turetilmez (K-B iptali, 5 Eylul 2026). Tekildir: bir atom tek karta
   aittir; cok-karta uyan kavram her kart icin AYRI atom olur.';

-- Geriye donuk doldurma: mevcut satirlarda onek kurali hala DOGRU cevabi
-- veriyor (11xx -> '1100', 15xx -> '1500', 16xx -> '1600'), tek seferlik
-- veri tasimasi olarak kullanilir.
update public.item_library
   set card_code = substr(catalog_code, 1, 2) || '00'
 where card_code is null;

-- 39xx atomlari bu kuralla '3900' alir ama KART 1600'e aittir, ELLE duzeltilir.
update public.item_library set card_code = '1600'
 where catalog_code like '39%';

do $card_code_check$
begin
  if exists (select 1 from public.item_library where card_code is null) then
    raise exception 'K-B iptali: card_code dolmayan satir kaldi';
  end if;
end $card_code_check$;

alter table public.item_library alter column card_code set not null;

-- 2) MUHTELIF ONEKI kartin AYRI ozelligi olur. KART 1600'de kart-kodu
--    onekiyle (16) muhtelif uretmek MMB'nin kendi 1600 Talent blogundaki
--    1698 Miscellaneous / 1699 Fringe ile CAKISIR (15 Agustos karari zaten
--    bu yuzden serbest kalemi 39xx'e yonlendirmisti). Bu yuzden muhtelif
--    oneki artik expense_groups'un kendi hanesi.
alter table public.expense_groups add column misc_prefix text;

update public.expense_groups set misc_prefix = substr(card_code, 1, 2)
 where misc_prefix is null;
update public.expense_groups set misc_prefix = '39' where card_code = '1600';

do $misc_prefix_check$
begin
  if exists (select 1 from public.expense_groups where misc_prefix is null) then
    raise exception 'K-B iptali: misc_prefix dolmayan expense_groups satiri kaldi';
  end if;
end $misc_prefix_check$;

alter table public.expense_groups alter column misc_prefix set not null;

comment on column public.expense_groups.misc_prefix is
  'Serbest kalem (x98) kodunun onek hanesi. Kart kodunun ilk iki hanesinden
   FARKLI olabilir (KART 1600: kart kodu 16, muhtelif oneki 39 - MMB 1698/
   1699 cakismasindan kacinmak icin, 15 Agustos 2026 karari). Sablon
   govdesinde acilir, dogumda kopyalanir (budget_items.catalog_code deseniyle
   ayni); sablonda yoksa fn_open_budget substr(card_code,1,2) ile GECICI
   geri-dusum uygular - bu geri-dusum sablon turunde kalkacak.';
