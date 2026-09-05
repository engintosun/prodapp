-- MUHUR-3 dilim 1/2: muhurlu butce icin etiket (budget_cost_objects) kopyasi.
-- Baglam (Engin karari, 5 Eylul 2026): kisi/is etiketleri ileride (DILIM 2, bu
-- migration'in KAPSAMI DISINDA) butce kapsamindan proje kapsamina tasinacak.
-- Tasima gunu fn_guard_budget_lock govdesi coalesce(new.budget_id, old.budget_id)
-- okur; kolon gidince v_budget_id NULL doner, coalesce(v_is_locked,false) false
-- olur ve bekci HATA VERMEDEN gecer -> muhurlu butcenin etiketi sessizce
-- degistirilebilir hale gelirdi. Karar: muhur "o gun buydu" demektir, muhurlu
-- butce etiketlerini KENDI KOPYASINDAN okur. Bu dilim o kopyayi delik acilmadan
-- ONCE kurar. Ev dosyasi: docs/butce/BUTCE-SEMA-KARARLARI.md.
--
-- Desen emsali BIREBIR budget_rate_snapshot'tir (20260711140000_muhur1_fn_lock_budget.sql):
-- ayni kasa deseni (koy-ve-bak, UPDATE/DELETE politikasi yok), ayni GRANT seti,
-- ayni RLS bicimi (version_id uzerinden budget_versions'a join, fn_is_budget_muhasebe).
--
-- Bu goc TASIMA YAPMAZ: budget_cost_objects.budget_id yerinde kalir,
-- trg_guard_lock_cost_objects yerinde kalir, budget_items'in bilesik FK'leri
-- yerinde kalir. Tamamen EKLEMEDIR.

-- ============================================================
-- (A) budget_cost_object_snapshot
--     Kirpma YOK: budget_cost_objects'in muhurde anlam tasiyan TUM kolonlari
--     tasinir (kaynak: 20260620120000 govde kolonlari + 20260901130000 kind +
--     20260903120000 role_name/duty_code). created_by/created_at/updated_at
--     KOPYALANMAZ - bunlar canli satirin kendi denetim izidir (ne zaman
--     eklendi), "o gun butce boyleydi" fotografinin bir parcasi degil; ayni
--     ayrim budget_rate_snapshot'ta da var (rate_catalog'un kendi id/zaman
--     damgalari kopyalanmadi, yalniz anlam tasiyan alanlar kopyalandi).
--     cost_object_id FK DEGILDIR (budget_rate_snapshot.component_id emsali):
--     mühürlü kopya, canli satir yarin silinse/tasinsa bile kendi ayaklari
--     uzerinde durmali.
-- ============================================================
create table public.budget_cost_object_snapshot (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.budget_versions(id) on delete cascade,
  cost_object_id uuid not null,
  code int not null,
  name text not null,
  kind text not null check (kind in ('kisi', 'is')),
  role_name text,
  duty_code text,
  note text,
  sort_order int not null,
  is_active boolean not null
);

comment on table public.budget_cost_object_snapshot is
  'MUHUR-3 dilim 1: muhur aninda budget_cost_objects''in TAMAMININ kopyasi (kirpma YOK, tablo kucuk - budget_rate_snapshot ile ayni gerekce). Etiketler proje/sirket kapsamina tasindiginda (DILIM 2) muhurlu butce buradan okur, canli tablodan degil.';
comment on column public.budget_cost_object_snapshot.cost_object_id is
  'Canli budget_cost_objects.id izi. FK DEGIL (budget_rate_snapshot.component_id ile ayni desen) - canli satir ileride tasinsa/silinse de muhurlu kopya bagimsiz kalir.';

create index ix_budget_cost_object_snapshot_version on public.budget_cost_object_snapshot(version_id);

grant references, trigger, truncate, maintain on table public.budget_cost_object_snapshot to anon;
grant select, insert, references, trigger, truncate, maintain on table public.budget_cost_object_snapshot to authenticated;
grant all on table public.budget_cost_object_snapshot to service_role;

alter table public.budget_cost_object_snapshot enable row level security;

-- Kasa deseni (B16/B17): koy-ve-bak. UPDATE/DELETE politikasi YOK - muhurlu kopya ASLA degismez.
create policy sel_budget_cost_object_snapshot on public.budget_cost_object_snapshot for select to authenticated
  using (exists (
    select 1 from public.budget_versions v
    where v.id = budget_cost_object_snapshot.version_id and fn_is_budget_muhasebe(v.budget_id)
  ));
create policy ins_budget_cost_object_snapshot on public.budget_cost_object_snapshot for insert to authenticated
  with check (exists (
    select 1 from public.budget_versions v
    where v.id = budget_cost_object_snapshot.version_id and fn_is_budget_muhasebe(v.budget_id)
  ));

-- ============================================================
-- (B) fn_lock_budget: YAMA YASAK - govde TAMAMI yeniden tanimlanir.
--     Tek fark 20260830140000_td36c_butce_turkce_metin.sql'deki guncel govdeye
--     karsi: budget_rate_snapshot doldurulduktan sonra, "update budgets set
--     is_locked = true" satirindan ONCE, budget_cost_objects satirlari
--     budget_cost_object_snapshot'a kopyalanir. jsonb payload'daki mevcut
--     cost_objects arsivine DOKUNULMADI, o ayri bir sey ve ayni kaliyor.
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
  select jsonb_build_object(
    'budget',        (select to_jsonb(b) from budgets b where b.id = p_budget_id),
    'stages',        (select coalesce(jsonb_agg(to_jsonb(s)),  '[]'::jsonb) from budget_stages s where s.budget_id = p_budget_id),
    'groups',        (select coalesce(jsonb_agg(to_jsonb(g)),  '[]'::jsonb) from expense_groups g where g.budget_id = p_budget_id),
    'cost_objects',  (select coalesce(jsonb_agg(to_jsonb(co)), '[]'::jsonb) from budget_cost_objects co where co.budget_id = p_budget_id),
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

  -- MUHUR-3 dilim 1 (5 Eylul 2026, Engin karari): butcenin TUM etiketleri
  -- (kisi + is) kopyalanir - kirpma yok, tablo kucuk (budget_rate_snapshot ile
  -- ayni gerekce). Etiketler proje/sirket kapsamina tasindiginda (DILIM 2)
  -- guard trigger'in coalesce(new.budget_id, old.budget_id) govdesi ise
  -- yaramaz hale gelecek; bu kopya o delik acilmadan once kurulur.
  insert into budget_cost_object_snapshot (
    version_id, cost_object_id, code, name, kind, role_name, duty_code, note, sort_order, is_active
  )
  select v_version_id, co.id, co.code, co.name, co.kind, co.role_name, co.duty_code, co.note, co.sort_order, co.is_active
    from budget_cost_objects co
    where co.budget_id = p_budget_id;

  update budgets set is_locked = true where id = p_budget_id;

  return v_version_no;
end;
$lockfn$;
-- revoke/grant execute TEKRARLANMADI: create or replace mevcut yetkileri KORUR
-- (muhur1'de bir kez verildi), 20260830140000_td36c'nin guncel govdesi de
-- fn_lock_budget'i yeniden tanimlarken bu satirlari tekrarlamiyor - ayni desen.
