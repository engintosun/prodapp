-- KAAPA KULLANICI BASLIGI - baslik acma islevi (2026-09-23)
-- Karar: BUTCE-SEMA-KARARLARI KULLANICI BASLIGININ EVI, GUNCELLEME 23 Eylul 2026.
-- "Ayni ad ayni basliktir" kuralinin hakemi veritabanidir: ad anahtari
-- fn_heading_name_key yalniz burada yasar, istemcide ikinci kopyasi yazilmaz.
-- security invoker: budget_user_headings uzerindeki iki politika (okuma, ekleme;
-- proje muhasebesi) aynen gecerlidir, yeni yetki acilmaz.
-- Tablo ve veri DEGISMEZ; yalniz islev eklenir.

create or replace function public.fn_open_user_heading(
  p_project   uuid,
  p_card_code text,
  p_name      text
) returns uuid
language plpgsql
security invoker
set search_path = public
as $openheading$
declare
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_id   uuid;
begin
  if v_name = '' then
    raise exception 'Başlık adı boş olamaz';
  end if;

  if not exists (select 1 from expense_groups eg
                   join budgets b on b.id = eg.budget_id
                  where b.project_id = p_project
                    and eg.card_code = p_card_code) then
    raise exception 'Kart bu projede yok';
  end if;

  insert into budget_user_headings (project_id, card_code, name)
  values (p_project, p_card_code, v_name)
  on conflict (project_id, card_code, fn_heading_name_key(name)) do nothing
  returning id into v_id;

  if v_id is null then
    select uh.id into v_id
      from budget_user_headings uh
     where uh.project_id = p_project
       and uh.card_code = p_card_code
       and fn_heading_name_key(uh.name) = fn_heading_name_key(v_name);
  end if;

  if v_id is null then
    raise exception 'Başlık açılamadı: %', v_name;
  end if;

  return v_id;
end;
$openheading$;

revoke execute on function public.fn_open_user_heading(uuid, text, text) from public;
revoke execute on function public.fn_open_user_heading(uuid, text, text) from anon;
grant  execute on function public.fn_open_user_heading(uuid, text, text) to authenticated;
