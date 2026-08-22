-- Proje yasam dongusu: arsivleme ve raftan indirme.
-- Karar: SK-AUTH-12 (docs/AUTH-KARARLARI.md). Sil bu dilimde YOK.
-- Iz ayri defterde tutulur; projects.closed_at / closed_by kolonlarina DOKUNULMAZ.
-- Trigger YOK: projects tablosunda client UPDATE policy yok, tek giris kapisi bu iki
-- fonksiyon. Arka kapi olmadigi icin bekci gereksiz.

create table public.project_lifecycle_log (
  id         bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id),
  action     text not null check (action in ('archive', 'restore')),
  reason     text not null check (btrim(reason) <> ''),
  acted_by   uuid not null default auth.uid(),
  acted_at   timestamptz not null default now()
);

comment on table public.project_lifecycle_log is
  'SK-AUTH-12: proje arsivleme/geri alma defteri. Yalniz fn_archive_project ve fn_restore_project yazar; client INSERT policy YOKTUR.';

alter table public.project_lifecycle_log enable row level security;

create policy project_lifecycle_log_read on public.project_lifecycle_log
  for select using (exists (
    select 1 from public.profiles p
     where p.project_id = project_lifecycle_log.project_id
       and p.user_id = auth.uid()
       and p.role = 'muhasebe'
       and p.membership_status = 'active'));

grant select on public.project_lifecycle_log to authenticated;

-- Gorunurluk: arsivli proje listeden dusmesin diye status sarti KALKTI.
-- Eski hali: status = 'active' AND (uyelik kontrolu). Yeni: yalniz uyelik kontrolu.
drop policy projects_own_list on public.projects;

create policy projects_own_list on public.projects
  for select using (exists (
    select 1 from public.profiles p
     where p.project_id = projects.id
       and p.user_id = auth.uid()
       and p.membership_status = 'active'));

create or replace function public.fn_archive_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $archivefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekce zorunlu';
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
    raise exception 'Proje bulunamadi';
  end if;

  if v_status <> 'active' then
    raise exception 'Proje zaten arsivde';
  end if;

  update projects set status = 'archived' where id = p_project_id;

  insert into project_lifecycle_log (project_id, action, reason, acted_by)
  values (p_project_id, 'archive', btrim(p_reason), v_uid);
end; $archivefn$;

create or replace function public.fn_restore_project(
  p_project_id uuid,
  p_reason     text
) returns void
language plpgsql
security definer
set search_path = public
as $restorefn$
declare
  v_uid    uuid := auth.uid();
  v_status text;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if btrim(coalesce(p_reason, '')) = '' then
    raise exception 'Gerekce zorunlu';
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
    raise exception 'Proje bulunamadi';
  end if;

  if v_status <> 'archived' then
    raise exception 'Proje arsivde degil';
  end if;

  update projects set status = 'active' where id = p_project_id;

  insert into project_lifecycle_log (project_id, action, reason, acted_by)
  values (p_project_id, 'restore', btrim(p_reason), v_uid);
end; $restorefn$;

revoke execute on function public.fn_archive_project(uuid, text) from public;
revoke execute on function public.fn_archive_project(uuid, text) from anon;
grant  execute on function public.fn_archive_project(uuid, text) to authenticated;

revoke execute on function public.fn_restore_project(uuid, text) from public;
revoke execute on function public.fn_restore_project(uuid, text) from anon;
grant  execute on function public.fn_restore_project(uuid, text) to authenticated;
