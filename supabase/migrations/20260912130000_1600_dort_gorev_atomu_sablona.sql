-- KART 1600: dort gorev atomu cekirdek sablona giriyor (Engin karari, 12 Eylul 2026).
-- Sablona giren: 1607, 3903, 3904, 3917. Kutuphanede kalan: 1608, 3916, 1612, 3914.
-- TABAN CANLIDIR: aktif sablonun govdesi okunur; 1100/1500 kartlari ve 1600'un
-- mevcut 13 atomu YENIDEN YAZILMAZ. Dort atomun adi, ingilizce karsiligi, statusu
-- ve birimi item_library'den okunur - ezberden yazilmaz.
-- Emsal: 20260905160000 eski surumu pasife cekip yenisini insert ediyordu, ayni desen.
-- Sira: atomlar kartin baslik duzenine gore dizilir (Ana Kast, Dublor, Arkaplan,
-- Kast Operasyonu); sort_order 1..17 olarak bastan verilir.

do $tpl$
declare
  v_body     jsonb;
  v_card_idx int;
  v_card     jsonb;
  v_cur      jsonb;
  v_items    jsonb := '[]'::jsonb;
  v_order    text[] := array['1601','1602','1603','1604','1606','1607',
                             '3901','3902','3903','3904','3917',
                             '1605','1609','1610','1613','1615','1619'];
  v_code     text;
  v_ord      int := 0;
  v_obj      jsonb;
  v_lib      public.item_library%rowtype;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  select (e.idx - 1), e.c into v_card_idx, v_card
    from jsonb_array_elements(v_body->'cards') with ordinality as e(c, idx)
   where e.c->>'card_code' = '1600';
  if v_card is null then
    raise exception '1600 karti aktif sablon govdesinde yok';
  end if;

  v_cur := v_card->'items';

  foreach v_code in array v_order loop
    v_ord := v_ord + 1;

    select e.it into v_obj
      from jsonb_array_elements(v_cur) as e(it)
     where e.it->>'catalog_code' = v_code;

    if v_obj is null then
      select * into v_lib from public.item_library where catalog_code = v_code;
      if v_lib.id is null then
        raise exception 'Katalog kodu kutuphanede yok: %', v_code;
      end if;
      if v_lib.is_group then
        raise exception 'Baslik satiri sablona kalem olarak giremez: %', v_code;
      end if;
      v_obj := jsonb_build_object(
        'ref',            'i' || v_code,
        'name',           v_lib.name,
        'detail',         v_lib.name_en,
        'unit',           v_lib.default_unit_code,
        'payment_status', v_lib.default_payment_status,
        'multiplier',     1
      );
    end if;

    v_items := v_items || jsonb_build_array(
                 jsonb_set(v_obj, '{sort_order}', to_jsonb(v_ord))
                 || jsonb_build_object('catalog_code', v_code));
  end loop;

  if jsonb_array_length(v_items) <> jsonb_array_length(v_cur) + 4 then
    raise exception 'Atom sayisi beklenmedik: eski %, yeni %',
      jsonb_array_length(v_cur), jsonb_array_length(v_items);
  end if;

  v_body := jsonb_set(v_body, array['cards', v_card_idx::text, 'items'], v_items);

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1500+1600 v2',
     v_body, true);
end;
$tpl$;

do $tpl_check$
begin
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;

  if (select jsonb_array_length(t.body->'cards')
        from public.budget_templates t
       where t.kind = 'system' and t.production_type = 'film'
         and t.scope = 'single' and t.is_active) <> 3 then
    raise exception 'Aktif govdede 3 kart bekleniyordu';
  end if;

  if exists (
    select 1
      from public.budget_templates t,
           jsonb_array_elements(t.body->'cards') c,
           jsonb_array_elements(c->'items') i
     where t.kind = 'system' and t.production_type = 'film'
       and t.scope = 'single' and t.is_active
       and c->>'card_code' = '1600'
       and (i->>'name' is null or i->>'unit' is null
            or i->>'payment_status' is null or i->>'catalog_code' is null)
  ) then
    raise exception '1600 kartinda alani bos atom var';
  end if;
end;
$tpl_check$;
