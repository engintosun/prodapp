-- TD-6 (29 Mayis 2026 acildi, 14 Agustos 2026 kapandi): company_settings.project_name
-- kolonu projects.name'in OLU bir kopyasiydi. fn_create_project acilista bir kez yaziyor,
-- hicbir UPDATE yok, hicbir policy/view/trigger/index okumuyor, src/ icinde tek referans yok.
-- Proje adi degisince kolon eski adla kaliyor: ya fazlalik ya YANLIS. Yasayan kaynak projects.name.
--
-- EMSAL: ayni sorun company_name icin 20260710120000_dilim_sirket_profili.sql bolum 8'de
-- ayni desenle cozuldu (ihtiyac baska tabloya tasindi, kolon company_settings'ten dusuruldu).
-- Bu migration o deseni project_name icin tekrarlar.
--
-- Bu migration YALNIZ fn_create_project'i yeniden tanimlar ve tek kolon dusurur.
-- Baska tablo/kolon/kisit/index/RLS DEGISMEZ. Fonksiyon imzasi (text,text,text,text)
-- AYNI kalir - yeni overload dogmaz, mevcut grant'lar gecerliligini korur ama
-- 710000'deki desene uyarak revoke/grant satirlari yine de tekrarlanir.

-- ============ 1) fn_create_project: company_settings insert'i kalkti ============
-- 710000'deki surumun AYNISI, tek fark: company_settings'e yazan iki satir cikarildi.
-- Kolon dusurulecegi icin insert'in kendisi de anlamsiz - satir tamamen kaldirildi,
-- kolon listesinden cikarilarak degil.
create or replace function public.fn_create_project(
  p_name         text,
  p_company_name text,
  p_first_name   text,
  p_last_name    text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $createfn$
declare
  v_uid           uuid := auth.uid();
  v_can           boolean;
  v_project       uuid;
  v_existing_name text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  select coalesce((u.raw_app_meta_data ->> 'can_create_projects')::boolean, false)
    into v_can
    from auth.users u
   where u.id = v_uid;

  if not coalesce(v_can, false) then
    raise exception 'Proje acma yetkisi yok';
  end if;

  if btrim(coalesce(p_name, '')) = ''
     or btrim(coalesce(p_company_name, '')) = ''
     or btrim(coalesce(p_first_name, '')) = ''
     or btrim(coalesce(p_last_name, '')) = '' then
    raise exception 'Eksik alan';
  end if;

  insert into projects (name, created_by)
  values (btrim(p_name), v_uid)
  returning id into v_project;

  select company_name into v_existing_name from company_profile where user_id = v_uid;
  if not found then
    insert into company_profile (user_id, company_name, updated_by)
    values (v_uid, btrim(p_company_name), v_uid);
  elsif v_existing_name is distinct from btrim(p_company_name) then
    update company_profile
       set company_name = btrim(p_company_name), updated_at = now(), updated_by = v_uid
     where user_id = v_uid;
  end if;

  insert into profiles (user_id, project_id, role, first_name, last_name)
  values (v_uid, v_project, 'muhasebe', btrim(p_first_name), btrim(p_last_name));

  return v_project;
end;
$createfn$;

revoke execute on function public.fn_create_project(text, text, text, text) from public;
revoke execute on function public.fn_create_project(text, text, text, text) from anon;
grant  execute on function public.fn_create_project(text, text, text, text) to authenticated;

-- ============ 2) company_settings.project_name dusuruldu ============
-- Kolonun tasidigi deger projects.name'in kopyasi (ya ayni ya bayat). Kayip yok.
alter table public.company_settings drop column project_name;
