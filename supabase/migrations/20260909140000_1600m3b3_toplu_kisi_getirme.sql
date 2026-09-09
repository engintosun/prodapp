-- KART 1600 M3b-3: toplu kisi getirme (Oyuncular listesi -> kart).
-- Bu fonksiyon fn_add_budget_item'i SARMALAR, KOPYALAMAZ - sebep N kisilik getirmede
-- N gidis-donus yerine tek gidis-donus. fn_add_budget_item her cagrida grubun
-- tamamini yeniden numaraliyor, bu dongude de tekrarlanir; olculmedi, gorunur
-- yavaslik cikarsa ayri tur.

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

  return;
end;
$addpersonfn$;

revoke execute on function public.fn_add_person_items(uuid, jsonb) from public;
revoke execute on function public.fn_add_person_items(uuid, jsonb) from anon;
grant  execute on function public.fn_add_person_items(uuid, jsonb) to authenticated;
