-- Film sablonuna dorduncu donem (Engin karari, 3 Ekim 2026): "Dağıtım ve Pazarlama".
-- Son donemin adi yapim turune gore: sinemada Dagitim ve Pazarlama, dizi ve reklamda
-- Teslim ve Kapanis (o sablonlar kurulurken). Donem adlari sablonun icindedir
-- (body.stages); fn_open_budget donemleri sirayla kurar, Donemsiz 9999'da kalir.
-- Karar evi: docs/butce/KART-KATALOGU.md bolum 1.
-- Emsal: 20261003130000 (sablon govdesi canlidan okunur, yeni surum olarak yazilir).

do $tpl$
declare
  v_body   jsonb;
  v_stages jsonb;
begin
  select t.body into v_body
    from public.budget_templates t
   where t.kind = 'system' and t.production_type = 'film'
     and t.scope = 'single' and t.is_active;
  if v_body is null then
    raise exception 'Aktif sistem sablonu bulunamadi';
  end if;

  v_stages := coalesce(v_body->'stages', '[]'::jsonb);
  if exists (select 1 from jsonb_array_elements(v_stages) s
              where s->>'ref' = 's4' or s->>'name' = 'Dağıtım ve Pazarlama'
                 or (s->>'sort_order')::int = 4) then
    raise exception 'Dorduncu donem zaten var';
  end if;
  if not exists (select 1 from jsonb_array_elements(v_stages) s
                  where s->>'ref' = 's3' and s->>'name' = 'Yapım Sonrası') then
    raise exception 'Sablonda s3 Yapim Sonrasi bulunamadi';
  end if;

  v_body := jsonb_set(v_body, '{stages}', v_stages || jsonb_build_array(
    jsonb_build_object('ref', 's4', 'name', 'Dağıtım ve Pazarlama', 'sort_order', 4)));

  update public.budget_templates
     set is_active = false
   where kind = 'system' and production_type = 'film'
     and scope = 'single' and is_active;

  insert into public.budget_templates
    (kind, production_type, scope, label, body, is_active)
  values
    ('system','film','single',
     'KAAPA Sistem - Film (Tek) - 1100+1300+1500+1600 v7',
     v_body, true);
end;
$tpl$;

do $check$
begin
  if (select count(*) from public.budget_templates
       where kind = 'system' and production_type = 'film'
         and scope = 'single' and is_active) <> 1 then
    raise exception 'Aktif sistem sablonu tek olmali';
  end if;
  if not exists (select 1
                   from public.budget_templates t, jsonb_array_elements(t.body->'stages') s
                  where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
                    and t.is_active and s->>'ref' = 's4'
                    and s->>'name' = 'Dağıtım ve Pazarlama' and (s->>'sort_order')::int = 4) then
    raise exception 'Sablonda s4 Dagitim ve Pazarlama yok';
  end if;
  if not exists (select 1
                   from public.budget_templates t, jsonb_array_elements(t.body->'cards') c
                  where t.kind = 'system' and t.production_type = 'film' and t.scope = 'single'
                    and t.is_active and c->>'card_code' = '1300' and c->>'name' = 'Senaryo Yazımı') then
    raise exception 'Sablon kartlari bozulmus';
  end if;
end $check$;
