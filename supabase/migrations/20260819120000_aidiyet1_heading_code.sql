-- KAAPA AIDIYET-1: kalemin aidiyeti koddan cikip kendi alanina tasiniyor (dilim 1: veri yolu).
-- Ekranda hicbir sey degismez; okuma hala kod sirasina gore calisir. Oda/satir eylemi/cizim = dilim 2.
-- Karar evleri: BUTCE-SEMA-KARARLARI (REVIZYON maddesi), BUTCE-EKRAN-KARARLARI bolum 19.

alter table public.budget_items add column heading_code text;

comment on column public.budget_items.heading_code is
  'Kalemin altinda durdugu baslik: item_library.catalog_code (is_group=true). NULL = Basliksiz. AIDIYET-1.';

-- Geriye donuk doldurma. trg_log_items SURE BOYUNCA kapali: bu bir kullanici islemi degil,
-- gocun kendisi. Acikken her kaleme bir denetim satiri yaziliyor (sandbox olcumu: tek kartta
-- 502 kalem -> 500 satir / 640 kB, hepsi changed_by NULL). Kapaliyken ayni doldurma 0 satir uretti.
alter table public.budget_items disable trigger trg_log_items;

update public.budget_items bi
   set heading_code = split_part(bi.catalog_code, '-', 1)
 where bi.catalog_code is not null
   and exists (
     select 1 from public.item_library l
      where l.catalog_code = split_part(bi.catalog_code, '-', 1)
        and l.is_group
   );

alter table public.budget_items enable trigger trg_log_items;

-- Serbest kalemler (xx98-nn) bilerek NULL kalir: muhtelif blogu bir baslik degil, kullanici
-- baslik secene kadar kalem Basliksiz yasar. Kutuphanesinde is_group satiri olmayan kartlarin
-- kalemleri de NULL kalir - bugun zaten baslik cizilmiyor, davranis ayni.

do $dogrulama$
declare v_dolan int; v_bos int; v_log int;
begin
  select count(*) filter (where heading_code is not null),
         count(*) filter (where heading_code is null)
    into v_dolan, v_bos from public.budget_items;
  select count(*) into v_log from public.budget_change_log
   where table_name = 'budget_items' and changed_by is null;
  raise notice 'AIDIYET-1 SAYIM: dolan=% bos=% imzasiz_log=%', v_dolan, v_bos, v_log;
end $dogrulama$;

-- Taban: 20260815150000 (tek imza), birebir. Imza AYNI kaldigi icin drop/grant yok -
-- create or replace mevcut grant'lari korur. Uc delta: v_heading degiskeni, kutuphane
-- modunda doldurulmasi, insert listesine eklenmesi.
create or replace function public.fn_add_budget_item(
  p_group_id       uuid,
  p_catalog_code   text default null,
  p_name           text default null,
  p_payment_status text default null,
  p_unit_code      text default null,
  p_existing_code  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $addfn$
declare
  v_uid          uuid := auth.uid();
  v_budget       uuid;
  v_project      uuid;
  v_card_code    text;
  v_lib          item_library%rowtype;
  v_name         text;
  v_status       text;
  v_unit_code    text;
  v_name_en      text;
  v_library_id   uuid;
  v_code         text;
  v_heading      text;
  v_seq          int;
  v_unit         uuid;
  v_item_code    int;
  v_item_id      uuid;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select eg.budget_id, eg.card_code into v_budget, v_card_code
    from expense_groups eg where eg.id = p_group_id;
  if v_budget is null then
    raise exception 'Kart bulunamadi';
  end if;
  if v_card_code is null then
    raise exception 'Kart kodu tanimsiz';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  if p_catalog_code is not null then
    -- kutuphane modu
    if p_existing_code is not null then
      raise exception 'Katalog kodu ile mevcut-kod ayni anda verilmez';
    end if;
    if p_name is not null or p_payment_status is not null or p_unit_code is not null then
      raise exception 'Kutuphane modunda isim/statu/birim parametresi verilmez (varsayilan kutuphaneden gelir)';
    end if;
    select * into v_lib from item_library where catalog_code = p_catalog_code;
    if v_lib.id is null then
      raise exception 'Katalog kodu kutuphanede yok: %', p_catalog_code;
    end if;
    if v_lib.is_group then
      raise exception 'Baslik satiri kalem olarak eklenemez: %', p_catalog_code;
    end if;
    if substr(p_catalog_code, 1, 2) <> substr(v_card_code, 1, 2) then
      raise exception 'Katalog kodu bu kartin araligindan degil: % (kart %)', p_catalog_code, v_card_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_name_en    := v_lib.name_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
    -- AIDIYET-1: aidiyet dogarken yazilir. Doldurma gocuyle AYNI kural: tire oncesi parca
    -- kutuphanede is_group satiri olarak varsa yazilir, yoksa NULL kalir.
    select l.catalog_code into v_heading from item_library l
     where l.catalog_code = split_part(p_catalog_code, '-', 1) and l.is_group;
  else
    -- serbest / mevcut-kod ortak dogrulama (D3c-1'den beri): isim, statu, birim zorunlu.
    if p_name is null or p_payment_status is null or p_unit_code is null then
      raise exception 'Serbest kalemde isim, statu ve birim zorunlu';
    end if;
    if p_existing_code is null then
      -- serbest mod: yeni muhtelif alt-kod, sayac ARTAR
      update expense_groups set misc_code_seq = misc_code_seq + 1
       where id = p_group_id returning misc_code_seq into v_seq;
      v_code := substr(v_card_code, 1, 2) || '98-' || lpad(v_seq::text, greatest(2, length(v_seq::text)), '0');
    else
      -- D3c-2: mevcut serbest kalem - AYNI KOD ile ikinci satir, sayac ARTMAZ
      if p_existing_code !~ ('^' || substr(v_card_code, 1, 2) || '98-[0-9]{2,}$') then
        raise exception 'Mevcut kod bu kartin muhtelif blogundan degil: % (kart %)', p_existing_code, v_card_code;
      end if;
      perform 1 from budget_items bi
        where bi.group_id = p_group_id and bi.catalog_code = p_existing_code and bi.is_active
        limit 1;
      if not found then
        raise exception 'Mevcut kod bu kartta bulunamadi: %', p_existing_code;
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

  select id into v_unit from units where code = v_unit_code;
  if v_unit is null then
    raise exception 'Birim bulunamadi: %', v_unit_code;
  end if;

  update budgets set item_code_seq = item_code_seq + 1
   where id = v_budget returning item_code_seq into v_item_code;

  insert into budget_items
    (budget_id, group_id, item_code, name, name_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id, heading_code)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_name_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id, v_heading)
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
