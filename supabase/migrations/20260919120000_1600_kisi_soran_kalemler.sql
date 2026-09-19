-- KART 1600: kisiye yapisan kalemler icin kisi sorma kurali (asks_person).
-- Karar evi: docs/butce/KART-KATALOGU.md 7.5 "GOREV DISI ATOMLARDA KISI SORMA KURALI"
-- + docs/butce/BUTCE-SEMA-KARARLARI.md "GOREV DISI ATOMLARDA KISI SORMA KURALI -
-- asks_person (5 Eylul 2026, Engin karari - HENUZ UYGULANMADI)".
-- Amac: 1611 Mesai, 1616 Prova, 1614 Tekrar Telifi, 1620 ADR Hak Devri kutuphaneden
-- eklenirken kullaniciya "kime?" sorulsun; aidiyet hanesi bos olan kalemler (1611/1616)
-- kisinin bu karttaki satirindan turer.

-- a) SEMA: kisiye sorma bayragi.
alter table public.item_library
  add column asks_person boolean not null default false;

comment on column public.item_library.asks_person is
  'true ise bu atom elle eklenirken kime ait oldugu sorulur (fn_add_budget_item
   p_person_object_id zorunlu olur). Gorev atomlari (is_duty=true) bu bayragi
   TASIMAZ - kisiyi zaten kendileri yaratir.';

-- b) Kisi soran atomlar. Yalniz bu dordu: mesai/prova/tekrar telifi/ADR hak devri
--    bir oyuncunun kalemi olarak dogar, hangi oyuncu oldugu doguma sorulmali.
update public.item_library
   set asks_person = true
 where catalog_code in ('1611', '1614', '1616', '1620');

-- c) Aidiyet hanesi bosaltiliyor: mesai ve prova belli bir bolumun kalemi degildir,
--    kisinin bulundugu bolumde dogar. 1614 Tekrar Telifi'nin heading_id degeri
--    DEGISMEZ (Ana Kast'ta kalir).
update public.item_library
   set heading_id = null
 where catalog_code in ('1611', '1616');

-- d) 1620 ADR Hak Devri aidiyeti Ana Kast olur (Kast Operasyonu'ndan tasinir).
update public.item_library
   set heading_id = (select id from public.item_library where catalog_code = '1600-01' and is_group)
 where catalog_code = '1620';

-- e) Isim duzeltmeleri (name_en DEGISMEZ).
update public.item_library set name = 'Cast Operasyonu' where catalog_code = '1600-04';
update public.item_library set name = 'Cast Sorumlusu'  where catalog_code = '3914';

-- f) fn_add_budget_item yeniden tanimlanir. Taban: 20260905150000 icindeki GUNCEL govde,
--    birebir. TEK IMZA DOKTRINI: parametre sayisi 6'dan 7'ye cikiyor, eski imza AYNI
--    migration'da drop edilir, overload birakilmaz (emsal: 20260815150000, 5->6 gecisi).
drop function public.fn_add_budget_item(uuid, text, text, text, text, text);

create or replace function public.fn_add_budget_item(
  p_group_id         uuid,
  p_catalog_code     text default null,
  p_name             text default null,
  p_payment_status   text default null,
  p_unit_code        text default null,
  p_existing_code    text default null,
  p_person_object_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $addfn$
declare
  v_uid              uuid := auth.uid();
  v_budget           uuid;
  v_project          uuid;
  v_card_code        text;
  v_misc_prefix      text;
  v_lib              item_library%rowtype;
  v_name             text;
  v_status           text;
  v_unit_code        text;
  v_name_en          text;
  v_library_id       uuid;
  v_code             text;
  v_heading          text;
  v_seq              int;
  v_unit             uuid;
  v_item_code        int;
  v_item_id          uuid;
  v_person_project   uuid;
  v_person_row_found boolean;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select eg.budget_id, eg.card_code, eg.misc_prefix into v_budget, v_card_code, v_misc_prefix
    from expense_groups eg where eg.id = p_group_id;
  if v_budget is null then
    raise exception 'Kart bulunamadı';
  end if;
  if v_card_code is null then
    raise exception 'Kart kodu tanımsız';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  if p_catalog_code is not null then
    -- kutuphane modu
    if p_existing_code is not null then
      raise exception 'Katalog kodu ile mevcut-kod aynı anda verilmez';
    end if;
    if p_name is not null or p_payment_status is not null or p_unit_code is not null then
      raise exception 'Kütüphane modunda isim/statü/birim parametresi verilmez (varsayılan kütüphaneden gelir)';
    end if;
    select * into v_lib from item_library where catalog_code = p_catalog_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kütüphanede yok: %', p_catalog_code;
    end if;
    -- ASKS_PERSON (20260919): kisiye yapisan atom kisisiz eklenemez.
    if v_lib.asks_person and p_person_object_id is null then
      raise exception 'Bu kalem bir kişiye bağlanmadan eklenemez: %', p_catalog_code;
    end if;
    if v_lib.is_group then
      raise exception 'Başlık satırı kalem olarak eklenemez: %', p_catalog_code;
    end if;
    if v_lib.card_code <> v_card_code then
      raise exception 'Katalog kodu bu kartın aralığından değil: % (kart %)', p_catalog_code, v_card_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_name_en    := v_lib.name_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
    -- 1600M2: aidiyet kutuphanede VERIDIR (heading_id), koddan turetilmez.
    -- Kast Operasyonu basligi hem 16xx hem 39xx atom tasidigi icin tire-oncesi
    -- parcadan turetme bu kartta calismazdi.
    if v_lib.heading_id is not null then
      select h.catalog_code into v_heading from item_library h
       where h.id = v_lib.heading_id;
    else
      -- ASKS_PERSON (20260919): aidiyeti olmayan atomda baslik kisinin bu karttaki
      -- satirlarindan turer - once gorev satiri (is_duty=true), yoksa en eski satir.
      if p_person_object_id is null then
        raise exception 'Aidiyeti olmayan kalem kişisiz eklenemez';
      end if;
      v_person_row_found := false;
      v_heading := null;
      select bi.heading_code into v_heading
        from budget_items bi
        join item_library l on l.id = bi.library_item_id
       where bi.group_id = p_group_id
         and bi.person_object_id = p_person_object_id
         and bi.is_active
         and l.is_duty = true
       order by bi.sort_order
       limit 1;
      if found then
        v_person_row_found := true;
      else
        select bi.heading_code into v_heading
          from budget_items bi
         where bi.group_id = p_group_id
           and bi.person_object_id = p_person_object_id
           and bi.is_active
         order by bi.sort_order
         limit 1;
        if found then
          v_person_row_found := true;
        end if;
      end if;
      if not v_person_row_found then
        raise exception 'Bu kişinin bu kartta satırı yok: %', p_person_object_id;
      end if;
    end if;
  else
    -- serbest / mevcut-kod ortak dogrulama (D3c-1'den beri): isim, statu, birim zorunlu.
    if p_person_object_id is not null then
      raise exception 'Serbest kalemde kişi parametresi verilmez';
    end if;
    if p_name is null or p_payment_status is null or p_unit_code is null then
      raise exception 'Serbest kalemde isim, statü ve birim zorunlu';
    end if;
    if p_existing_code is null then
      -- serbest mod: yeni muhtelif alt-kod, sayac ARTAR
      update expense_groups set misc_code_seq = misc_code_seq + 1
       where id = p_group_id returning misc_code_seq into v_seq;
      v_code := v_misc_prefix || '98-' || lpad(v_seq::text, greatest(2, length(v_seq::text)), '0');
    else
      -- D3c-2: mevcut serbest kalem - AYNI KOD ile ikinci satir, sayac ARTMAZ
      if p_existing_code !~ ('^' || v_misc_prefix || '98-[0-9]{2,}$') then
        raise exception 'Mevcut kod bu kartın muhtelif bloğundan değil: % (kart %)', p_existing_code, v_card_code;
      end if;
      perform 1 from budget_items bi
        where bi.group_id = p_group_id and bi.catalog_code = p_existing_code and bi.is_active
        limit 1;
      if not found then
        raise exception 'Mevcut kod bu kartta bulunamadı: %', p_existing_code;
      end if;
      v_code := p_existing_code;
    end if;
    v_name       := p_name;
    v_status     := p_payment_status;
    v_unit_code  := p_unit_code;
    v_name_en    := null;
    v_library_id := null;
    -- AIDIYET-1: serbest kalemde aidiyet kullanicinin secimidir, dilim 2'ye kadar bos.
    v_heading    := null;
  end if;

  -- ASKS_PERSON (20260919): kisi etiketi verilmisse projesi kartin projesiyle uyusmali
  -- (fn_add_person_items icindeki ayni kontrol - is distinct from, iki bagimsiz zincir).
  if p_person_object_id is not null then
    select co.project_id into v_person_project from budget_cost_objects co where co.id = p_person_object_id;
    if v_person_project is distinct from v_project then
      raise exception 'Kişi etiketi bu projeye ait değil: %', p_person_object_id;
    end if;
  end if;

  select id into v_unit from units where code = v_unit_code;
  if v_unit is null then
    raise exception 'Birim bulunamadı: %', v_unit_code;
  end if;

  update budgets set item_code_seq = item_code_seq + 1
   where id = v_budget returning item_code_seq into v_item_code;

  insert into budget_items
    (budget_id, group_id, item_code, name, name_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id, heading_code, person_object_id)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_name_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id, v_heading, p_person_object_id)
  returning id into v_item_id;

  perform public.fn_refill_item_burdens(v_item_id);

  -- D2-e: kartin tum satirlari kod-sirasina yeniden numaralanir (es kodda item_code ayristirir, K-D bitisiklik).
  -- AIDIYET-1 NOTU: siralama bu dilimde DEGISMEZ, hala catalog_code'a gore. heading_code'un
  -- siralamaya girmesi dilim 2'nin isidir.
  update budget_items bi
     set sort_order = t.rn
    from (select id, row_number() over (order by catalog_code, item_code) as rn
            from budget_items where group_id = p_group_id) t
   where t.id = bi.id
     and bi.sort_order is distinct from t.rn;

  return v_item_id;
end;
$addfn$;

revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid) from public;
revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid) from anon;
grant  execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid) to authenticated;

-- g) SALT-OKUMA dogrulama (raise notice - db push cikisinda okunur, migration'i durdurmaz).
do $verify$
declare
  v_count        int;
  v_codes        text;
  v_bosluk       int;
  v_1620_heading text;
  v_1600_04_name text;
  v_3914_name    text;
begin
  select count(*), string_agg(catalog_code, ', ' order by catalog_code)
    into v_count, v_codes
    from item_library where asks_person = true;
  raise notice 'asks_person=true atom sayisi: % (kodlar: %)', v_count, v_codes;

  select count(*) into v_bosluk
    from item_library where catalog_code in ('1611', '1616') and heading_id is null;
  raise notice 'heading_id null olan 1611/1616 sayisi: %', v_bosluk;

  select h.catalog_code into v_1620_heading
    from item_library l join item_library h on h.id = l.heading_id
   where l.catalog_code = '1620';
  raise notice '1620 heading_id -> %', v_1620_heading;

  select name into v_1600_04_name from item_library where catalog_code = '1600-04';
  select name into v_3914_name    from item_library where catalog_code = '3914';
  raise notice '1600-04 adi: % / 3914 adi: %', v_1600_04_name, v_3914_name;
end $verify$;
