-- KART 1500 hak devri: IKI KURAL (1 Ekim 2026, Engin karari; KART-KATALOGU 7.4). Kilit kalkar.
-- Kural: yazilan satir degisir, obur satir uyar. Hizmet Bedeli'ne yazilan buyukluk (hak devri
-- oranla hesaplanir, ekranda); hak devrine yazilan paylasim (toplam sabit, Hizmet Bedeli yeniden
-- yazilir). Hak devri eklenince %50 bolme = paylasimi 0'dan 50'ye cekmek.
-- 1) fn_add_budget_item: bolme yapan atom (default_split_rate dolu) ORAN 0 ile dogar; bolmeyi
--    ekran fn_set_split_share ile yapar. Toplam eklemede bir an bile ikiye katlanmaz; bolme
--    yarida kalirsa hak devri %0'da durur, rakamlar bozulmaz.
-- 2) fn_set_split_share: Hizmet Bedeli birim ve donem rakamlari + oran TEK islemde; silmede hak
--    devri ayni islemde kapanir. Rakamlari ekran hesaplar (split-share.ts), islev yalniz yazar.
-- 3) Canli veri deneme verisidir (Engin): eski hak devri ve komisyon satirlari kapatilir.

create or replace function public.fn_add_budget_item(
  p_group_id         uuid,
  p_catalog_code     text default null,
  p_name             text default null,
  p_payment_status   text default null,
  p_unit_code        text default null,
  p_existing_code    text default null,
  p_person_object_id uuid default null,
  p_parent_item_id   uuid default null
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
  v_parent           budget_items%rowtype;
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
    -- ZIMBA (20261001): altina girecegi kalemleri yazili atom bagli satirsiz eklenemez;
    -- yazili olmayan atom bir satirin altina eklenemez.
    if cardinality(v_lib.attaches_to) > 0 then
      if p_parent_item_id is null then
        raise exception 'Bu kalem bağlanacağı satır seçilmeden eklenemez: %', p_catalog_code;
      end if;
    elsif p_parent_item_id is not null then
      raise exception 'Bu kalem başka bir satırın altına eklenemez: %', p_catalog_code;
    end if;
    v_name       := v_lib.name;
    v_status     := v_lib.default_payment_status;
    v_unit_code  := v_lib.default_unit_code;
    v_name_en    := v_lib.name_en;
    v_library_id := v_lib.id;
    v_code       := p_catalog_code;
    if p_parent_item_id is not null then
      -- ZIMBA (20261001): bagli satir ayni kartta, etkin ve atomun yazili kodlarindan biri
      -- olmali; baslik bagli satirdan gelir.
      select * into v_parent from budget_items where id = p_parent_item_id;
      if v_parent.id is null then
        raise exception 'Bağlanacak satır bulunamadı: %', p_parent_item_id;
      end if;
      if not v_parent.is_active or v_parent.group_id <> p_group_id then
        raise exception 'Bağlanacak satır bu kartta etkin değil: %', p_parent_item_id;
      end if;
      if not (v_parent.catalog_code = any(v_lib.attaches_to)) then
        raise exception 'Bu kalem bu satırın altına eklenemez: % (satır %)', p_catalog_code, v_parent.catalog_code;
      end if;
      v_heading := v_parent.heading_code;
    elsif v_lib.heading_id is not null then
      -- 1600M2: aidiyet kutuphanede VERIDIR (heading_id), koddan turetilmez.
      -- Kast Operasyonu basligi hem 16xx hem 39xx atom tasidigi icin tire-oncesi
      -- parcadan turetme bu kartta calismazdi.
      select h.catalog_code into v_heading from item_library h
       where h.id = v_lib.heading_id;
    else
      -- ASKS_PERSON (20260919): aidiyeti olmayan atomda baslik kisinin bu karttaki
      -- satirlarindan turer - once gorev satiri (is_duty=true), yoksa en eski satir.
      -- KISISIZ BASLIKSIZ (1 Ekim 2026): kisi verilmemisse kalem BASLIKSIZ eklenir (v_heading null
      -- kalir). Kisi soran atom yukarida ayri kuralla kisisiz eklenemez.
      v_person_row_found := false;
      v_heading := null;
      if p_person_object_id is not null then
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
    end if;
  else
    -- serbest / mevcut-kod ortak dogrulama (D3c-1'den beri): isim, statu, birim zorunlu.
    if p_person_object_id is not null then
      raise exception 'Serbest kalemde kişi parametresi verilmez';
    end if;
    -- ZIMBA (20261001)
    if p_parent_item_id is not null then
      raise exception 'Serbest kalemde bağlı satır parametresi verilmez';
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

  -- ZIMBA (20261001): bagli satirla dogan atomda oranlar kutuphaneden hazir gelir.
  -- IKI KURAL (20261001150000): bolme yapan atom oran 0 ile dogar; %50 bolmeyi ekran yapar.
  insert into budget_items
    (budget_id, group_id, item_code, name, name_en, unit_net,
     unit_id, multiplier, payment_status, sort_order,
     catalog_code, library_item_id, heading_code, person_object_id,
     parent_item_id, derive_rate, split_rate)
  values
    (v_budget, p_group_id, v_item_code, v_name, v_name_en,
     0, v_unit, 1, v_status, 0,
     v_code, v_library_id, v_heading, p_person_object_id,
     p_parent_item_id,
     case when p_parent_item_id is not null then v_lib.default_derive_rate end,
     case when p_parent_item_id is not null and v_lib.default_split_rate is not null then 0 end)
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

revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid, uuid) from public;
revoke execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid, uuid) from anon;
grant  execute on function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid, uuid) to authenticated;

create or replace function public.fn_set_split_share(
  p_split_item_id      uuid,
  p_rate               numeric,
  p_anchor_unit_net    numeric,
  p_anchor_period_nets jsonb default '{}'::jsonb,
  p_close_split        boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $sharefn$
declare
  v_split   budget_items%rowtype;
  v_anchor  budget_items%rowtype;
  v_project uuid;
  v_key     text;
  v_val     numeric;
  v_n       int;
begin
  if auth.uid() is null then
    raise exception 'Oturum yok';
  end if;

  select * into v_split from budget_items where id = p_split_item_id;
  if v_split.id is null or not v_split.is_active then
    raise exception 'Hak devri satırı bulunamadı: %', p_split_item_id;
  end if;
  if v_split.parent_item_id is null then
    raise exception 'Bu satır bir satıra bağlı değil: %', p_split_item_id;
  end if;
  select * into v_anchor from budget_items where id = v_split.parent_item_id;
  if v_anchor.id is null or not v_anchor.is_active then
    raise exception 'Bağlı satır bulunamadı';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_split.budget_id;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Paylaşım değiştirme yetkisi yok';
  end if;

  if not exists (select 1 from item_library l
                  where l.id = v_split.library_item_id and l.default_split_rate is not null) then
    raise exception 'Bu satır bölme yapan bir kalem değil';
  end if;

  if p_rate is null or p_rate < 0 or p_rate >= 100 then
    raise exception 'Oran 0 ile 100 arasında olmalı (100 hariç)';
  end if;
  if p_anchor_unit_net is null or p_anchor_unit_net < 0 then
    raise exception 'Geçersiz Hizmet Bedeli rakamı';
  end if;

  update budget_items set unit_net = p_anchor_unit_net where id = v_anchor.id;

  for v_key, v_val in
    select key, value::numeric from jsonb_each_text(coalesce(p_anchor_period_nets, '{}'::jsonb))
  loop
    if v_val < 0 then
      raise exception 'Geçersiz dönem rakamı';
    end if;
    update budget_item_periods set unit_net_override = v_val
     where item_id = v_anchor.id and stage_id = v_key::uuid;
    get diagnostics v_n = row_count;
    if v_n <> 1 then
      raise exception 'Hizmet Bedeli dönemi bulunamadı: %', v_key;
    end if;
  end loop;

  if p_close_split then
    -- SILME (Karar 9): hak devrinin rakami Hizmet Bedeli'ne doner (oran 0 ile yeniden yazim
    -- yukarida) ve hak devri AYNI islemde kapanir.
    update budget_items set is_active = false, person_object_id = null where id = v_split.id;
  else
    update budget_items set split_rate = p_rate where id = v_split.id;
  end if;
end;
$sharefn$;

revoke execute on function public.fn_set_split_share(uuid, numeric, numeric, jsonb, boolean) from public;
revoke execute on function public.fn_set_split_share(uuid, numeric, numeric, jsonb, boolean) from anon;
grant  execute on function public.fn_set_split_share(uuid, numeric, numeric, jsonb, boolean) to authenticated;

-- Canli veri deneme verisidir (Engin, 31 Agustos ve 1 Ekim 2026): eski modelle kurulmus hak devri
-- ve komisyon satirlari kapatilir; deneme yeni duzende sifirdan kurulur.
update public.budget_items bi
   set is_active = false, person_object_id = null
 where bi.catalog_code in ('1501-01', '1511')
   and bi.is_active
   and exists (select 1 from public.budgets b where b.id = bi.budget_id and not b.is_locked);

do $check$
declare
  v_n int;
begin
  select count(*) into v_n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'fn_add_budget_item';
  if v_n <> 1 then raise exception 'fn_add_budget_item tek imza olmali'; end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'fn_add_budget_item'
                and p.prosrc like '%then v_lib.default_split_rate end%') then
    raise exception 'Ekleme islevi hala hazir oranla aciyor';
  end if;
  select count(*) into v_n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'fn_set_split_share';
  if v_n <> 1 then raise exception 'fn_set_split_share tek imza olmali'; end if;
end $check$;
