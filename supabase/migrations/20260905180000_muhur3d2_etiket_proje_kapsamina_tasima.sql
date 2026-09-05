-- MUHUR-3 dilim 2/2: kisi/is etiketleri (budget_cost_objects) butce kapsamindan
-- PROJE kapsamina tasinir. Baglam (Engin karari, 5 Eylul 2026): Uretim Kayitlari
-- sekmesi sol rayda bir durak olacak; ray duragina basildiginda kabugun elinde
-- butce YOKTUR, proje vardir (authenticated-shell projectId'yi app_metadata'dan
-- alir, budgetId yalniz /butce altinda arama parametresidir). Etiketler proje
-- kapsaminda yasamak zorunda. Dilim 1 (20260905170000, canlida) muhur kopyasini
-- kurdu (budget_cost_object_snapshot); bu dilim tasimayi yapar. Ev dosyasi:
-- docs/butce/BUTCE-SEMA-KARARLARI.md.
--
-- ONCEDEN OLCULDU (5 Eylul 2026, push oncesi salt-okuma sorgusu): ayni projede
-- iki farkli butcenin ayni code degerini tasidigi CIKMADI (sonuc bos) - proje
-- kapsaminda unique(project_id, code) kisiti guvenle konabilir.

-- ============================================================
-- (1) project_id: once nullable ac, budget_id uzerinden doldur, sonra kilitle.
-- ============================================================
alter table public.budget_cost_objects
  add column project_id uuid;

update public.budget_cost_objects co
   set project_id = b.project_id
  from public.budgets b
 where b.id = co.budget_id;

alter table public.budget_cost_objects
  alter column project_id set not null;

alter table public.budget_cost_objects
  add constraint budget_cost_objects_project_id_fkey
  foreign key (project_id) references public.projects(id) on delete restrict;

comment on column public.budget_cost_objects.project_id is
  'MUHUR-3 dilim 2 (5 Eylul 2026): etiketin ait oldugu proje. Ray duraginda (Uretim Kayitlari) butce baglami yok, proje baglami var - etiket buna gore kapsam degistirdi.';

-- ============================================================
-- (2) Kilit bekcisi dusuruldu: etiket artik projeye ait, tek butcenin muhru
--     onu dondurmaz. Muhurlu butce dilim 1'de kurulan budget_cost_object_snapshot'tan
--     okur; canli tablo proje omrunce butun butcelerle birlikte acik kalir.
-- ============================================================
drop trigger if exists trg_guard_lock_cost_objects on public.budget_cost_objects;

-- ============================================================
-- (3) budget_items'in bilesik FK'leri (id, budget_id) hedefine bagliydi; hedef
--     kalkiyor (madde 4). Once bu FK'ler dusurulur, sonra duz FK (yalniz id)
--     konur - ayni-butce garantisi ARTIK GEREKMEZ, cunku etiket butceye degil
--     projeye ait ve kalemin butcesi o projenin icindedir (proje FK'si zaten
--     bunu sinirlar); artik-eksik kalan cins ve proje eslesmesi fn_check_cost_object_kind'a
--     tasindi (madde 7).
-- ============================================================
alter table public.budget_items
  drop constraint budget_items_cost_object_fk;

alter table public.budget_items
  add constraint budget_items_cost_object_fk
  foreign key (cost_object_id) references public.budget_cost_objects(id) on delete restrict;

alter table public.budget_items
  drop constraint budget_items_person_object_fk;

alter table public.budget_items
  add constraint budget_items_person_object_fk
  foreign key (person_object_id) references public.budget_cost_objects(id) on delete restrict;

-- ============================================================
-- (4) Butce-ici kimlik (budget_id, code) proje-ici kimlige (project_id, code)
--     doner. (id, budget_id) bilesik kisiti yalniz yukaridaki FK'lerin hedefiydi,
--     artik gereksiz.
-- ============================================================
alter table public.budget_cost_objects
  drop constraint budget_cost_objects_id_budget_id_key;

alter table public.budget_cost_objects
  drop constraint budget_cost_objects_budget_id_code_key;

alter table public.budget_cost_objects
  add constraint budget_cost_objects_project_id_code_key unique (project_id, code);

-- ============================================================
-- (5) budget_id kolonu dusuruluyor. Tek-kolonluk budget_cost_objects_budget_id_fkey
--     bu kolonun icinde tamamen kapsandigi icin CASCADE gerekmeden otomatik duser.
-- ============================================================
alter table public.budget_cost_objects
  drop column budget_id;

-- ============================================================
-- (6) RLS: dort politika YENIDEN YAZILDI. fn_is_budget_muhasebe(budget_id)
--     yerine fn_is_project_muhasebe(project_id) - ikisi de MEVCUT, yeni
--     fonksiyon yazilmadi.
-- ============================================================
drop policy if exists sel_cost_objects on public.budget_cost_objects;
create policy sel_cost_objects on public.budget_cost_objects for select to authenticated
  using (fn_is_project_muhasebe(project_id));

drop policy if exists ins_cost_objects on public.budget_cost_objects;
create policy ins_cost_objects on public.budget_cost_objects for insert to authenticated
  with check (fn_is_project_muhasebe(project_id));

drop policy if exists upd_cost_objects on public.budget_cost_objects;
create policy upd_cost_objects on public.budget_cost_objects for update to authenticated
  using (fn_is_project_muhasebe(project_id)) with check (fn_is_project_muhasebe(project_id));

drop policy if exists del_cost_objects on public.budget_cost_objects;
create policy del_cost_objects on public.budget_cost_objects for delete to authenticated
  using (fn_is_project_muhasebe(project_id));

-- ============================================================
-- (7) fn_check_cost_object_kind: YAMA YASAK, govde TAMAMI yeniden tanimlandi.
--     Bugunku cins denetimi AYNEN kalir. Eklenen: bilesik FK'nin (madde 3)
--     sokulmesiyle kaybolan "ayni kapsam" garantisi buraya tasindi - etiketin
--     project_id'si, satirin butcesinin project_id'siyle ayni degilse hata
--     verilir. Her dal TEK SELECT icinde okur (budgets'e join ederek), ikinci
--     sorgu acilmadi.
-- ============================================================
create or replace function public.fn_check_cost_object_kind()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind     text;
  v_mismatch boolean;
begin
  if new.cost_object_id is not null then
    select co.kind, (co.project_id is distinct from b.project_id)
      into v_kind, v_mismatch
      from public.budget_cost_objects co
      join public.budgets b on b.id = new.budget_id
     where co.id = new.cost_object_id;
    if v_kind is distinct from 'is' then
      raise exception 'İş etiketi hanesine kişi etiketi konulamaz (etiket cinsi: %)', v_kind;
    end if;
    if v_mismatch then
      raise exception 'Etiket başka bir projeye ait, bu kaleme bağlanamaz';
    end if;
  end if;
  if new.person_object_id is not null then
    select co.kind, (co.project_id is distinct from b.project_id)
      into v_kind, v_mismatch
      from public.budget_cost_objects co
      join public.budgets b on b.id = new.budget_id
     where co.id = new.person_object_id;
    if v_kind is distinct from 'kisi' then
      raise exception 'Kişi etiketi hanesine iş etiketi konulamaz (etiket cinsi: %)', v_kind;
    end if;
    if v_mismatch then
      raise exception 'Etiket başka bir projeye ait, bu kaleme bağlanamaz';
    end if;
  end if;
  return new;
end;
$$;

-- ============================================================
-- (8) budget_change_log'a project_id: etiket degisiklikleri artik budget_id
--     tasimadigi icin izi kaybetmesin diye eklendi (nullable, mevcut satirlar
--     icin). fn_log_budget_change YAMA YASAK geregi TAMAMI yeniden tanimlandi:
--     bugunku budget_id cikarimi AYNEN kalir, yanina project_id cikarimi
--     eklendi (satirda project_id varsa ondan - budget_cost_objects ve budgets
--     tablolari icin dogrudan calisir -, yoksa budget_id uzerinden budgets'ten).
-- ============================================================
alter table public.budget_change_log
  add column project_id uuid;

comment on column public.budget_change_log.project_id is
  'MUHUR-3 dilim 2 (5 Eylul 2026): budget_id tasimayan tablolarin (artik budget_cost_objects dahil) izini kaybetmemek icin eklendi. Satirda kendi project_id''si varsa ondan, yoksa budget_id uzerinden budgets''ten turer.';

create or replace function public.fn_log_budget_change() returns trigger
    language plpgsql security definer
    set search_path to 'public'
    as $$
declare
  v_old jsonb; v_new jsonb; v_budget uuid; v_row uuid; v_project uuid;
begin
  if tg_op = 'UPDATE' then v_old := to_jsonb(old); v_new := to_jsonb(new);
  else v_old := to_jsonb(old); v_new := null; end if;
  v_row := coalesce((v_new->>'id')::uuid, (v_old->>'id')::uuid);
  v_budget := coalesce((v_new->>'budget_id')::uuid, (v_old->>'budget_id')::uuid,
    case when tg_table_name = 'budgets' then v_row end);
  v_project := coalesce(
    (v_new->>'project_id')::uuid,
    (v_old->>'project_id')::uuid,
    (select b.project_id from budgets b where b.id = v_budget)
  );
  insert into budget_change_log (table_name, row_id, budget_id, project_id, action, old_data, new_data, changed_by)
  values (tg_table_name, v_row, v_budget, v_project, tg_op, v_old, v_new, auth.uid());
  return null;
end; $$;

-- ============================================================
-- (8b) EK DUZELTME (spec'te YOK, sandbox turunda bulundu - raporda ayrica
--      isaretlendi): sel_changelog politikasi "(budget_id IS NULL) OR
--      fn_is_budget_muhasebe(budget_id)" idi. budget_id NULL olan satirlar
--      BUGUNE KADAR yalniz butce-disi/global tablolara (orn. burden_packages -
--      budget_id kolonu hic yok) aitti, o yuzden herkese acik olmasi zararsizdi.
--      Bu gocten sonra budget_cost_objects satirlari da budget_id=NULL, project_id
--      DOLU olarak loglanacak - degistirilmezse KVKK kapsamindaki kisi/rol
--      adlari HERHANGI bir authenticated kullaniciya (proje uyesi olmasa da)
--      acilirdi. Politika project_id dolu satirlarda proje-muhasebe kontrolune
--      dusecek sekilde genisletildi; project_id VE budget_id ikisi de NULL
--      oldugu (bugunku global tablo) durum ONCEKI GIBI acik kalir.
-- ============================================================
drop policy if exists sel_changelog on public.budget_change_log;
create policy sel_changelog on public.budget_change_log for select to authenticated
  using (
    (budget_id is null and project_id is null)
    or fn_is_budget_muhasebe(budget_id)
    or (project_id is not null and fn_is_project_muhasebe(project_id))
  );

-- ============================================================
-- (9) fn_lock_budget: YAMA YASAK, govde TAMAMI yeniden tanimlandi (guncel govde
--     20260905170000'de). Tek degisen: etiket kopyasinin (dilim 1) ve jsonb
--     payload'daki 'cost_objects' satirinin where'i budget_id yerine
--     project_id = v_project oldu - v_project zaten SGK cozumlemesi icin
--     fonksiyonun basinda okunuyordu, ikinci degisken acilmadi. Kirpma YOK:
--     projenin TUM etiketleri kopyalanir (budget_rate_snapshot ile ayni
--     gerekce - tablo kucuk, kirpma bir hata sinifi acar).
-- ============================================================
create or replace function public.fn_lock_budget(p_budget_id uuid, p_revision_note text default null)
returns int
language plpgsql
security definer
set search_path = public
as $lockfn$
declare
  v_uid        uuid := auth.uid();
  v_project    uuid;
  v_is_locked  boolean;
  v_version_no int;
  v_version_id uuid;
  v_owner      uuid;
  v_sgk_code   text;
  v_q1         boolean;
  v_q2         boolean;
  v_q3         boolean;
  v_calendar   boolean;
  v_payload    jsonb;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  if not fn_is_budget_muhasebe(p_budget_id) then
    raise exception 'Bütçe bulunamadı veya mühürleme yetkisi yok';
  end if;

  select project_id, is_locked into v_project, v_is_locked
    from budgets where id = p_budget_id;

  if v_is_locked then
    raise exception 'Bütçe zaten mühürlü';
  end if;

  select coalesce(max(version_no), 0) + 1 into v_version_no
    from budget_versions where budget_id = p_budget_id;

  -- SGK senaryosu: kod (oran DEGIL, B20) + muhur aninin company_profile izi (B19 ruhu).
  v_sgk_code := public.fn_resolve_sgk_scenario(v_project);

  select p.created_by into v_owner from projects p where p.id = v_project;
  select cp.kultur_girisim_belgeli, cp.kultur_yatirim_belgeli, cp.sgk_borcu_yok
    into v_q1, v_q2, v_q3
    from company_profile cp where cp.user_id = v_owner;
  -- Atlama varsayimi (Engin karari 2026-07-11): profil hic acilmadiysa Q1=Hayir Q2=Hayir Q3=Evet.
  v_q1 := coalesce(v_q1, false);
  v_q2 := coalesce(v_q2, false);
  v_q3 := coalesce(v_q3, true);

  -- Takvim varsayimi: rezerve "Donemsiz" etabi HARIC tarihsiz etap var mi (Ocak-varsayimi devrede mi).
  select exists (
    select 1 from budget_stages
     where budget_id = p_budget_id
       and is_undated = true
       and name <> 'Donemsiz'
  ) into v_calendar;

  -- Payload: butceye bagli TUM kalici satirlarin tam-sadakatli kopyasi (B18: hesaplanan deger YOK).
  -- cost_objects artik PROJE kapsamli (MUHUR-3 dilim 2) - where'i project_id = v_project.
  select jsonb_build_object(
    'budget',        (select to_jsonb(b) from budgets b where b.id = p_budget_id),
    'stages',        (select coalesce(jsonb_agg(to_jsonb(s)),  '[]'::jsonb) from budget_stages s where s.budget_id = p_budget_id),
    'groups',        (select coalesce(jsonb_agg(to_jsonb(g)),  '[]'::jsonb) from expense_groups g where g.budget_id = p_budget_id),
    'cost_objects',  (select coalesce(jsonb_agg(to_jsonb(co)), '[]'::jsonb) from budget_cost_objects co where co.project_id = v_project),
    'items',         (select coalesce(jsonb_agg(to_jsonb(i)),  '[]'::jsonb) from budget_items i where i.budget_id = p_budget_id),
    'item_periods',  (select coalesce(jsonb_agg(to_jsonb(ip)), '[]'::jsonb) from budget_item_periods ip where ip.budget_id = p_budget_id),
    'item_burdens',  (select coalesce(jsonb_agg(to_jsonb(ib)), '[]'::jsonb) from item_burdens ib where ib.budget_id = p_budget_id),
    'percent_lines', (select coalesce(jsonb_agg(to_jsonb(pl)), '[]'::jsonb) from budget_percent_lines pl where pl.budget_id = p_budget_id)
  ) into v_payload;

  insert into budget_versions (
    budget_id, version_no, sealed_by, revision_note,
    sgk_component_code, sgk_q1, sgk_q2, sgk_q3, calendar_assumption, payload
  ) values (
    p_budget_id, v_version_no, v_uid, p_revision_note,
    v_sgk_code, v_q1, v_q2, v_q3, v_calendar, v_payload
  ) returning id into v_version_id;

  -- rate_catalog TAMAMI kopyalanir (pencere kirpma YOK - tablo kucuk, kirpma hata sinifi sifirlanir).
  insert into budget_rate_snapshot (
    version_id, component_id, component_code, value_kind,
    rate_percent, amount_tl, bracket_floor, bracket_base_tax, valid_from, note
  )
  select v_version_id, rc.component_id, bc.code, rc.value_kind,
         rc.rate_percent, rc.amount_tl, rc.bracket_floor, rc.bracket_base_tax, rc.valid_from, rc.note
    from rate_catalog rc
    join burden_components bc on bc.id = rc.component_id;

  -- MUHUR-3 dilim 1 (5 Eylul 2026): butcenin TUM etiketleri (kisi + is) kopyalanir.
  -- MUHUR-3 dilim 2 (5 Eylul 2026): etiket artik PROJE kapsamli, where'i degisti.
  insert into budget_cost_object_snapshot (
    version_id, cost_object_id, code, name, kind, role_name, duty_code, note, sort_order, is_active
  )
  select v_version_id, co.id, co.code, co.name, co.kind, co.role_name, co.duty_code, co.note, co.sort_order, co.is_active
    from budget_cost_objects co
    where co.project_id = v_project;

  update budgets set is_locked = true where id = p_budget_id;

  return v_version_no;
end;
$lockfn$;
-- revoke/grant execute TEKRARLANMADI: create or replace mevcut yetkileri KORUR,
-- ayni desen 20260905170000'de de uygulanmisti.

-- ============================================================
-- (10) fn_delete_project: YAMA YASAK, govde TAMAMI yeniden tanimlandi (guncel
--      govde 20260830130000_td36b'de). Tek degisen etiket silme satirinin
--      kosulu: budget_id join'i yerine project_id = p_project_id. Silme SIRASI
--      KORUNDU - budget_items etiketlere restrict ile bagli, kalemler zaten
--      etiketlerden ONCE siliniyordu (mevcut siradaki yeri degismedi).
-- ============================================================
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
