-- KART 1500 Dilim 2, adim 1 (Engin kararlari 30 Eylul + 1 Ekim 2026): yonetmen alt satirlari.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 7.4.
-- Canli olcum (1 Ekim 2026): 1501 ve 1509 beser butcede; 1501-01 ve 1511 kutuphanede ve
-- budget_items'ta yok; budget_items icin muhur kopya tablosu yok (yeni haneler icin ikinci ev acilmaz).

-- 1) budget_items: uc yeni hane.
alter table public.budget_items
  add column parent_item_id uuid,
  add column person_name text,
  add column split_rate numeric(5,2)
    check (split_rate is null or (split_rate >= 0 and split_rate < 100));

alter table public.budget_items
  add constraint budget_items_parent_item_fk
  foreign key (parent_item_id, budget_id)
  references public.budget_items(id, budget_id) on delete restrict;

comment on column public.budget_items.parent_item_id is
  'ZIMBA (1 Ekim 2026): satirin altina girdigi satir (1501-01 ve 1511 -> 1501/1509). Kisi etiketi DEGIL; ayni butce bilesik FK ile, ayni kart fn_add_budget_item icinde korunur.';
comment on column public.budget_items.person_name is
  'Yonetmen satirinda yazilan kisi adi (1 Ekim 2026, Karar 2). Kalemin adindan AYRI tutulur; ekranda ad duzeni display-name.ts icinde kurulur.';
comment on column public.budget_items.split_rate is
  'Hak devri orani (1 Ekim 2026, Karar 5). Doluysa KILITLI: toplam sabit, hak devri rakami ve toplam hesaptan dogar (B18). Bossa ACIK: rakamlar elle. derive_rate (komisyon) ile KARISTIRILMAZ.';

-- 2) item_library: uc yeni hane.
alter table public.item_library
  add column name_suffix text,
  add column attaches_to text[] not null default '{}',
  add column default_split_rate numeric(5,2)
    check (default_split_rate is null or (default_split_rate >= 0 and default_split_rate < 100));

comment on column public.item_library.name_suffix is
  'Gorev adinin arkasina gelen ek (1 Ekim 2026, Karar 7): 1501 Yonetmen + Hizmet Bedeli. Ekrandaki adlar gorev adi ve ekten kurulur.';
comment on column public.item_library.attaches_to is
  'Bu atomun altina girebildigi kalemlerin katalog kodlari (1 Ekim 2026, Karar 6). Doluysa ekleme Kime? sorar ve satir o koddaki bir satira zimbalanir.';
comment on column public.item_library.default_split_rate is
  'Hak devri oraninin hazir gelen degeri (1 Ekim 2026). Yalniz bolme yapan atomda dolu.';

-- 3) Gorev adi ve ek.
update public.item_library set name = 'Yönetmen', name_suffix = 'Hizmet Bedeli' where catalog_code = '1501';
update public.item_library set name_suffix = 'Hizmet Bedeli' where catalog_code = '1509';

-- 4) Canli 1501 satirlari: adi hala eski kutuphane adi olanlar. Kullanicinin degistirdigi ada dokunulmaz.
--    Kilitli butceler disarida (emsal 20260930120000).
update public.budget_items bi
   set name = 'Yönetmen'
 where bi.catalog_code = '1501'
   and bi.name = 'Yönetmen Kaşesi'
   and exists (select 1 from public.budgets b where b.id = bi.budget_id and not b.is_locked);

-- 5) Iki yeni atom. Ingilizce ad kaynaktan alinmadigi icin bos.
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code,
   provenance, is_group, is_duty, is_derived, heading_id, card_code, aliases,
   default_derive_rate, default_split_rate, attaches_to)
values
  ('1501-01', 'Yönetmen Hak Devri',          null, 'telif_belgeli', 'flat', 'KAAPA', false, false, false, null, '1500', '{}', null, 50,   array['1501','1509']),
  ('1511',    'Yönetmen Temsilci Komisyonu', null, 'sirket',        'flat', 'KAAPA', false, false, false, null, '1500', '{}', 20,   null, array['1501','1509']);

-- 6) Aktif sablon govdesi: 1500 kalemleri kutuphaneden yeniden kurulur (1501 adi Yonetmen olur).
--    Emsal ve kod 20260930120000 ile ayni; yalniz 1500 karti yeniden kurulur, misc_prefix korunur.
do $tpl$
declare
  v_body   jsonb;
  v_cards  jsonb := '[]'::jsonb;
  v_card   jsonb;
  v_items  jsonb;
  v_codes  text[] := array['1501','1502','1503','1504','1506'];
  v_code   text;
  v_ord    int;
  v_lib    public.item_library%rowtype;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  for v_card in select * from jsonb_array_elements(v_body->'cards')
  loop
    if v_card->>'card_code' = '1500' then
      v_items := '[]'::jsonb;
      v_ord := 0;
      foreach v_code in array v_codes loop
        v_ord := v_ord + 1;
        select * into v_lib from public.item_library where catalog_code = v_code;
        if v_lib.id is null then
          raise exception 'Katalog kodu kutuphanede yok: %', v_code;
        end if;
        if v_lib.is_group or v_lib.card_code <> '1500' then
          raise exception '1500 kalemi degil: %', v_code;
        end if;
        v_items := v_items || jsonb_build_array(jsonb_build_object(
          'ref',            'i' || v_code,
          'name',           v_lib.name,
          'detail',         v_lib.name_en,
          'unit',           v_lib.default_unit_code,
          'payment_status', v_lib.default_payment_status,
          'multiplier',     1,
          'sort_order',     v_ord,
          'catalog_code',   v_code));
      end loop;
      v_card := jsonb_set(v_card, '{items}', v_items);
    end if;
    v_cards := v_cards || jsonb_build_array(v_card);
  end loop;

  v_body := jsonb_set(v_body, '{cards}', v_cards);

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1500+1600 v4',
     v_body, true);
end;
$tpl$;

-- 7) Hak devri uyari esigi (emsal: parametre_sgk_tavan_katsayi, 20260704204946).
insert into public.burden_components (code, label, kind, fill_mode)
values ('parametre_hak_devri_esik', 'Parametre: Hak devri uyarı eşiği', 'parameter', 'skeleton')
on conflict (code) do nothing;

insert into public.rate_catalog (component_id, rate_percent, valid_from, value_kind, note)
select c.id, 50.0000, date '2026-01-01', 'oran',
       'Avrupa fonlari gizli maas (salaire deguise) esigi: hak devri toplamin bu oranini gecince uyari'
  from public.burden_components c
 where c.code = 'parametre_hak_devri_esik';

-- 8) fn_add_budget_item: zimbalanacak satir parametresi. Taban: 20260919120000 icindeki GUNCEL
--    govde, birebir; degisenler ZIMBA etiketli. TEK IMZA DOKTRINI: 7 -> 8 parametre, eski imza
--    AYNI gocte drop edilir. fn_add_person_items iki konumsal parametreyle cagirir, etkilenmez.
drop function public.fn_add_budget_item(uuid, text, text, text, text, text, uuid);

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
     case when p_parent_item_id is not null then v_lib.default_split_rate end)
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

-- 9) Dogrulama (NOTICE'e bagli degil; goc ayrica db query ile dogrulanir).
do $check$
declare
  v_n int;
begin
  if not exists (select 1 from public.item_library
                  where catalog_code = '1501-01' and card_code = '1500'
                    and default_split_rate = 50 and default_derive_rate is null
                    and attaches_to = array['1501','1509']) then
    raise exception '1501-01 beklenen haliyle yok';
  end if;
  if not exists (select 1 from public.item_library
                  where catalog_code = '1511' and card_code = '1500'
                    and default_derive_rate = 20 and default_split_rate is null
                    and attaches_to = array['1501','1509']) then
    raise exception '1511 beklenen haliyle yok';
  end if;
  if not exists (select 1 from public.item_library
                  where catalog_code = '1501' and name = 'Yönetmen' and name_suffix = 'Hizmet Bedeli') then
    raise exception '1501 adi ve eki beklenen halde degil';
  end if;
  if not exists (select 1 from public.item_library
                  where catalog_code = '1509' and name_suffix = 'Hizmet Bedeli') then
    raise exception '1509 eki beklenen halde degil';
  end if;
  if exists (select 1 from public.budget_items bi join public.budgets b on b.id = bi.budget_id
              where not b.is_locked and bi.catalog_code = '1501' and bi.name = 'Yönetmen Kaşesi') then
    raise exception 'Kilitsiz butcede eski adli 1501 satiri kaldi';
  end if;
  if not exists (select 1 from public.rate_catalog r join public.burden_components c on c.id = r.component_id
                  where c.code = 'parametre_hak_devri_esik' and c.kind = 'parameter'
                    and r.value_kind = 'oran' and r.rate_percent = 50) then
    raise exception 'Hak devri esigi oran cetvelinde yok';
  end if;
  if not exists (select 1 from public.budget_templates t, jsonb_array_elements(t.body->'cards') c,
                        jsonb_array_elements(c->'items') i
                  where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
                    and t.is_active and c->>'card_code' = '1500'
                    and i->>'catalog_code' = '1501' and i->>'name' = 'Yönetmen') then
    raise exception 'Aktif sablonda 1501 adi Yonetmen degil';
  end if;
  select count(*) into v_n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'fn_add_budget_item';
  if v_n <> 1 then
    raise exception 'fn_add_budget_item tek imza olmali';
  end if;
end $check$;
