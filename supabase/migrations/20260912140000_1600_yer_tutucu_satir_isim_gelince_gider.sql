-- YER TUTUCU SATIR ISIM GELINCE GIDER (Engin karari, 12 Eylul 2026).
-- Sablon karti yer tutucu satirlarla doguruyor: kast belli degilken "Basrol Oyuncu"
-- satirina ongoru rakami girilebilsin diye. Isimler gelince o satirin isi biter.
-- Bugune kadar fn_add_person_items her kisi icin YENI satir aciyor, yer tutucuya
-- bakmiyordu; kisi gelen her gorev arkasinda bos bir satir kaliyordu.
-- Bu surum, kisiler baglandiktan SONRA, bu cagrida kisi gelen her atom icin o karttaki
-- KISISIZ satirlari pasife ceker. Rakam girilmis olsa da gider (Engin: "gitmeli") -
-- her oyuncu ayri degerlendirildigi icin yer tutucudaki rakam artik kimsenin karsiligi
-- degil.
-- KAPSAM: yalniz getirme ani. Kart uzerinde bir satira elle kisi ilistirilirse yer
-- tutucu kendiliginden gitmez; bugun o yolu kullanan bir akis yok.
-- Turetilmis satirlar (komisyon) yer tutucu DEGILDIR, derive_rate ile disarida tutulur.

create or replace function public.fn_add_person_items(
  p_group_id uuid,
  p_pairs    jsonb
)
returns setof uuid
language plpgsql
security definer
set search_path = public
as $addpersonfn$
declare
  v_uid            uuid := auth.uid();
  v_budget         uuid;
  v_project        uuid;
  v_pair           jsonb;
  v_person_id      uuid;
  v_person_project uuid;
  v_item_id        uuid;
  v_code           text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select eg.budget_id into v_budget from expense_groups eg where eg.id = p_group_id;
  if v_budget is null then
    raise exception 'Kart bulunamadı';
  end if;

  select b.project_id into v_project from budgets b where b.id = v_budget;
  if not fn_is_project_muhasebe(v_project) then
    raise exception 'Kalem ekleme yetkisi yok';
  end if;

  for v_pair in select * from jsonb_array_elements(coalesce(p_pairs, '[]'::jsonb))
  loop
    v_person_id := (v_pair->>'person_object_id')::uuid;

    select co.project_id into v_person_project
      from budget_cost_objects co where co.id = v_person_id;
    if v_person_project is distinct from v_project then
      raise exception 'Kişi etiketi bu projeye ait değil: %', v_person_id;
    end if;

    v_item_id := public.fn_add_budget_item(p_group_id, v_pair->>'catalog_code');

    update budget_items set person_object_id = v_person_id where id = v_item_id;

    return next v_item_id;
  end loop;

  -- Yer tutucu temizligi: kisiler baglandiktan SONRA calisir, yoksa yeni acilan
  -- satirlar da kisisiz gorunup kendilerini silerdi.
  for v_code in
    select distinct e.pair->>'catalog_code'
      from jsonb_array_elements(coalesce(p_pairs, '[]'::jsonb)) as e(pair)
     where e.pair->>'catalog_code' is not null
  loop
    update budget_items bi
       set is_active = false
     where bi.group_id = p_group_id
       and bi.catalog_code = v_code
       and bi.person_object_id is null
       and bi.derive_rate is null
       and bi.is_active;
  end loop;

  return;
end;
$addpersonfn$;
