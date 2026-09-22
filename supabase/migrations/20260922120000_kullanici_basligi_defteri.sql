-- KAAPA KULLANICI BASLIGI - veritabani dilimi (2026-09-22)
-- Karar: BUTCE-EKRAN-KARARLARI bolum 19 GUNCELLEME (22 Eylul 2026),
--        BUTCE-SEMA-KARARLARI KULLANICI BASLIGININ EVI.
-- Baslik projeye ve acildigi karta aittir; item_library'ye YAZILMAZ.
-- Kayit SILINMEZ (yalniz fn_delete_project ile proje giderken gider): muhurlu
-- kopya kalemin baslik kodunu tasir, adini tasimaz; ad her zaman bu tablodan
-- bulunur. Kalemi kalmamis baslik SAKLANMAZ, okurken kalemlerden hesaplanir (B18).
-- Kasa deseni (budget_cost_object_snapshot): koy-ve-bak, UPDATE/DELETE politikasi yok.
-- budget_items.heading_code kullanici basliginda bu tablonun id'sini metin olarak tasir.

-- 0) On kosul: yeni baslik denetimi bugun calisan hicbir yazma yolunu kirmamali.
--    Biri tutmazsa goc DURUR; tek islem oldugu icin hicbir sey uygulanmaz.
do $precheck$
begin
  -- a) mevcut kalemler: baslik kodu kendi kartinin kutuphane basligi
  if exists (
    select 1
      from public.budget_items bi
      join public.expense_groups eg on eg.id = bi.group_id
     where bi.heading_code is not null
       and not exists (select 1 from public.item_library h
                        where h.catalog_code = bi.heading_code
                          and h.is_group
                          and h.card_code = eg.card_code)
  ) then
    raise exception 'On kosul (a): baslik kodu kartina uymayan kalem var';
  end if;

  -- b) kutuphane: atomun basligi atomla ayni kartta (fn_add_budget_item yolu)
  if exists (
    select 1
      from public.item_library l
      join public.item_library h on h.id = l.heading_id
     where h.card_code <> l.card_code
  ) then
    raise exception 'On kosul (b): basligi baska kartta olan kutuphane atomu var';
  end if;

  -- c) etkin sablonlar: sablon kartindaki atomun basligi o kartta (fn_open_budget yolu)
  if exists (
    select 1
      from public.budget_templates t
     cross join lateral jsonb_array_elements(coalesce(t.body->'cards', '[]'::jsonb)) as c(card)
     cross join lateral jsonb_array_elements(coalesce(c.card->'items', '[]'::jsonb)) as i(item)
      join public.item_library l on l.catalog_code = i.item->>'catalog_code'
      join public.item_library h on h.id = l.heading_id
     where t.is_active
       and h.card_code is distinct from c.card->>'card_code'
  ) then
    raise exception 'On kosul (c): basligi sablon kartina uymayan sablon kalemi var';
  end if;
end $precheck$;

-- 1) Ad anahtari: Turkce buyuk-kucuk harf (I/i ayrimi dahil) ve bosluk farki ayni ad sayilir.
--    lower() kullanilmaz: sonucu sunucunun yerel ayarina baglidir.
--    Bu fonksiyon degisirse asagidaki benzersizlik indeksi yeniden kurulur (REINDEX).
create or replace function public.fn_heading_name_key(p_name text)
returns text
language sql
immutable
set search_path = public
as $namekey$
  select regexp_replace(
           btrim(translate(p_name,
             'ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZ',
             'abcçdefgğhıijklmnoöpqrsştuüvwxyz')),
           '\s+', ' ', 'g')
$namekey$;

-- 2) Tablo
create table public.budget_user_headings (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id),
  card_code   text not null,
  name        text not null check (name = btrim(name) and name <> ''),
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);

comment on table public.budget_user_headings is
  'Kullanicinin actigi baslik: projeye ve acildigi karta aittir, item_library''ye yazilmaz. Kayit silinmez (yalniz fn_delete_project). Bosluk saklanmaz, kalemlerden hesaplanir (B18).';

create unique index budget_user_headings_name_key
  on public.budget_user_headings (project_id, card_code, public.fn_heading_name_key(name));

-- 3) Yetki: budget_cost_object_snapshot ile ayni GRANT seti; okuma ve ekleme proje muhasebesine
grant references, trigger, truncate, maintain on table public.budget_user_headings to anon;
grant select, insert, references, trigger, truncate, maintain on table public.budget_user_headings to authenticated;
grant all on table public.budget_user_headings to service_role;

alter table public.budget_user_headings enable row level security;

create policy sel_budget_user_headings on public.budget_user_headings for select to authenticated
  using (fn_is_project_muhasebe(project_id));
create policy ins_budget_user_headings on public.budget_user_headings for insert to authenticated
  with check (fn_is_project_muhasebe(project_id));

-- 4) Degisiklik kaydi (B19): fn_log_budget_change project_id'yi satirdan okur
create trigger trg_log_user_headings after update or delete on public.budget_user_headings
  for each row execute function fn_log_budget_change();

-- 5) Baslik denetimi. BUTCE-SEMA-KARARLARI "NEDEN METIN, NEDEN FK DEGIL"
--    maddesindeki butunluk denetimi bugune kadar yazilmamisti; burada konur.
create or replace function public.fn_check_item_heading()
returns trigger
language plpgsql
security definer
set search_path = public
as $headingchk$
declare
  v_card    text;
  v_project uuid;
begin
  if new.heading_code is null then
    return new;
  end if;

  select eg.card_code, b.project_id into v_card, v_project
    from expense_groups eg
    join budgets b on b.id = eg.budget_id
   where eg.id = new.group_id;

  -- kutuphane basligi: bu kartin is_group satiri
  if exists (select 1 from item_library h
              where h.catalog_code = new.heading_code
                and h.is_group
                and h.card_code = v_card) then
    return new;
  end if;

  -- kullanici basligi: once kodun bicimi, sonra kayit. Ic ice IF bilincli:
  -- AND'in degerlendirme sirasi garanti degil; bicimsiz kod uuid'e cevrilmeye
  -- kalkarsa anlasilmaz bir hata cikar.
  if new.heading_code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    if exists (select 1 from budget_user_headings uh
                where uh.id = new.heading_code::uuid
                  and uh.project_id = v_project
                  and uh.card_code = v_card) then
      return new;
    end if;
  end if;

  raise exception 'Başlık bu karta ait değil: %', new.heading_code;
end;
$headingchk$;

create trigger trg_check_item_heading
  before insert or update of heading_code, group_id on public.budget_items
  for each row execute function fn_check_item_heading();

comment on column public.budget_items.heading_code is
  'Kalemin basligi: kutuphane basliginda item_library.catalog_code (is_group=true), kullanici basliginda budget_user_headings.id (metin). Gecerliligi trg_check_item_heading denetler.';

-- 6) Proje silme: fonksiyon butun olarak yeniden yazilir; tek fark budget_user_headings satiri.
--    create or replace mevcut yetkileri KORUR, revoke/grant tekrarlanmaz.
create or replace function public.fn_delete_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $deletefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekçe zorunlu';
  end if;

  if not exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.user_id = v_uid
       and p.role = 'muhasebe'
       and p.membership_status = 'active'
  ) then
    raise exception 'Bu projede yetkiniz yok';
  end if;

  select status into v_status from projects where id = p_project_id;
  if not found then
    raise exception 'Proje bulunamadı';
  end if;

  if v_status <> 'archived' then
    raise exception 'Yalnız arşivdeki proje silinebilir';
  end if;

  if exists (select 1 from receipts where project_id = p_project_id) then
    raise exception 'Projede fiş var, silinemez';
  end if;

  if exists (select 1 from advances where project_id = p_project_id) then
    raise exception 'Projede avans var, silinemez';
  end if;

  if exists (
    select 1 from budget_versions bv
      join budgets b on b.id = bv.budget_id
     where b.project_id = p_project_id
  ) then
    raise exception 'Projede mühürlü bütçe var, silinemez';
  end if;

  if exists (
    select 1 from profiles p
     where p.project_id = p_project_id
       and p.membership_status = 'active'
       and p.user_id <> v_uid
  ) then
    raise exception 'Projede başka üye var, silinemez';
  end if;

  -- Zincir yapraktan koke: eksik birakilan tablo FK tarafindan reddedilir (RESTRICT/NO ACTION),
  -- islem tek transaction icinde oldugu icin butun zincir ya tam biter ya da hic uygulanmaz.

  -- fis/avans denetim defterleri (gecikmeler icin bos olmak zorunda, yine de zincire girer)
  delete from approval_log where receipt_id in (select id from receipts where project_id = p_project_id);
  delete from advance_log where advance_id in (select id from advances where project_id = p_project_id);
  delete from receipts where project_id = p_project_id;

  -- butce alti (yapraktan koke)
  delete from direct_payments where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_item_periods where budget_id in (select id from budgets where project_id = p_project_id);
  delete from item_burdens where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_items where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_cost_objects where project_id = p_project_id;
  delete from budget_user_headings where project_id = p_project_id;
  delete from budget_percent_lines where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_stages where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budget_versions where budget_id in (select id from budgets where project_id = p_project_id);
  delete from expense_groups where budget_id in (select id from budgets where project_id = p_project_id);
  delete from budgets where project_id = p_project_id;

  -- sablon (proje sahipli)
  delete from budget_templates where owner_project_id = p_project_id;

  -- departman alti
  delete from dept_subcategories where dept_id in (select id from departments where project_id = p_project_id);
  delete from dept_budgets where dept_id in (select id from departments where project_id = p_project_id);
  delete from invitations where project_id = p_project_id;
  delete from project_dept_budgets where project_id = p_project_id;
  delete from departments where project_id = p_project_id;

  -- donem alti
  delete from advances where project_id = p_project_id;
  delete from exception_permits where project_id = p_project_id;
  delete from period_budgets where period_id in (select id from periods where project_id = p_project_id);
  delete from period_closings where period_id in (select id from periods where project_id = p_project_id);
  delete from periods where project_id = p_project_id;

  -- sohbet alti
  delete from chat_participants where chat_id in (select id from chats where project_id = p_project_id);
  delete from messages where chat_id in (select id from chats where project_id = p_project_id);
  delete from chats where project_id = p_project_id;

  -- proje-duzeyi kalan
  delete from company_settings where project_id = p_project_id;
  delete from expense_categories where project_id = p_project_id;
  delete from project_budgets where project_id = p_project_id;
  delete from project_rules where project_id = p_project_id;
  delete from notifications where project_id = p_project_id;
  delete from project_lifecycle_log where project_id = p_project_id;
  delete from profiles where project_id = p_project_id;

  -- en son
  delete from projects where id = p_project_id;
end; $deletefn$;

-- 7) Salt-okuma dogrulama (db push ciktisinda okunur)
do $verify$
declare
  v_pol int; v_log int; v_chk int; v_del int;
begin
  select count(*) into v_pol from pg_policy where polrelid = 'public.budget_user_headings'::regclass;
  raise notice 'budget_user_headings politika sayisi: % (beklenen 2)', v_pol;
  select count(*) into v_log from pg_trigger where tgname = 'trg_log_user_headings';
  raise notice 'trg_log_user_headings: % (beklenen 1)', v_log;
  select count(*) into v_chk from pg_trigger where tgname = 'trg_check_item_heading';
  raise notice 'trg_check_item_heading: % (beklenen 1)', v_chk;
  select count(*) into v_del from pg_proc where proname = 'fn_delete_project' and prosrc like '%budget_user_headings%';
  raise notice 'fn_delete_project yeni tabloyu siliyor: % (beklenen 1)', v_del;
end $verify$;
