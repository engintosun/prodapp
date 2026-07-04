-- KAAPA DILIM-3b: rate_catalog 2026 seed + bordro iskelet cetveli + Ek-6 profili
--                 + burden_components.kind 'parameter' + 4 guard trigger.
-- Kaynak: docs/butce/PERSONEL-MEVZUATI.md SS1+B. Sema degisikligi: kind check
-- genisledi (additive/deduction/parameter) + 4 trigger (defense-in-depth,
-- parametre cipalari hicbir kovaya giremez, ne INSERT'te ne sonradan UPDATE'te).
-- Turetilebilir sayi katalogda DURMAZ (K10): SGK 4 senaryo sayisi DOGRUDAN
-- birincil karar degeri olarak girdi (formulle turetilmedi - PERSONEL SS B'de
-- zaten 4u de ayri verilmis, alt bilesenden yeniden hesaplanmiyor).

-- ============ 0) kind check genisletme ============
alter table public.burden_components drop constraint burden_components_kind_check;
alter table public.burden_components
  add constraint burden_components_kind_check check (kind in ('additive','deduction','parameter'));

-- ============ 1) Yeni bilesenler ============
insert into public.burden_components (code, label, kind, fill_mode) values
  ('sgk_isci',                    'SGK işçi payı',                          'deduction', 'skeleton'),
  ('issizlik_isci',               'İşsizlik işçi payı',                     'deduction', 'skeleton'),
  ('issizlik_isveren',            'İşsizlik işveren payı',                  'additive',  'skeleton'),
  ('gv_ucret',                    'Gelir vergisi (ücret tarifesi)',         'deduction', 'skeleton'),
  ('sgk_isveren_borclu',          'SGK işveren payı (borçlu/teşviksiz)',    'additive',  'rate'),
  ('sgk_isveren_kultur_girisim',  'SGK işveren payı (Kültür Girişim)',      'additive',  'rate'),
  ('sgk_isveren_kultur_yatirim',  'SGK işveren payı (Kültür Yatırım)',      'additive',  'rate'),
  ('parametre_asgari_brut',           'Parametre: Asgari brüt ücret',        'parameter', 'skeleton'),
  ('parametre_sgk_tavan_katsayi',     'Parametre: SGK tavan katsayısı',      'parameter', 'skeleton')
on conflict (code) do nothing;

update public.burden_components set fill_mode = 'skeleton' where code in ('sgk_isveren','damga');

update public.rate_catalog
  set rate_percent = 19.75, note = 'DOGRULANDI - standart senaryo, imalat-disi 2 puan indirimi (VARSAYILAN)'
where component_id = (select id from public.burden_components where code = 'sgk_isveren')
  and valid_from = date '2026-01-01';

-- ============ 2) Guard: 'parameter' hicbir kovaya giremez (INSERT/UPDATE) ============
create or replace function public.fn_guard_no_parameter_kind()
returns trigger language plpgsql as $guard$
declare v_kind text;
begin
  select kind into v_kind from public.burden_components where id = new.component_id;
  if v_kind = 'parameter' then
    raise exception 'Parametre turundeki bilesen kovaya baglanamaz (tablo: %, component_id: %)',
      tg_table_name, new.component_id;
  end if;
  return new;
end; $guard$;

create trigger trg_guard_kind_item_burdens
  before insert or update on public.item_burdens
  for each row execute function public.fn_guard_no_parameter_kind();
create trigger trg_guard_kind_payment_status_burdens
  before insert or update on public.payment_status_burdens
  for each row execute function public.fn_guard_no_parameter_kind();
create trigger trg_guard_kind_payroll_profile_burdens
  before insert or update on public.payroll_profile_burdens
  for each row execute function public.fn_guard_no_parameter_kind();

-- Guard #4: kullanimdaki bir bilesen 'parameter'e SONRADAN cevrilemez
create or replace function public.fn_guard_kind_change_to_parameter()
returns trigger language plpgsql as $guard2$
begin
  if new.kind = 'parameter' and old.kind is distinct from 'parameter' then
    if exists (select 1 from public.item_burdens where component_id = new.id)
       or exists (select 1 from public.payment_status_burdens where component_id = new.id)
       or exists (select 1 from public.payroll_profile_burdens where component_id = new.id)
    then
      raise exception 'Bilesen (id: %) zaten kullanimda - kind parameter''e cevrilemez', new.id;
    end if;
  end if;
  return new;
end; $guard2$;

create trigger trg_guard_kind_change_burden_components
  before update on public.burden_components
  for each row execute function public.fn_guard_kind_change_to_parameter();

-- ============ 3) rate_catalog: oran satirlari ============
insert into public.rate_catalog (component_id, rate_percent, valid_from, note)
select c.id, r.rate, date '2026-01-01', r.note
from public.burden_components c
join (values
  ('sgk_isci',                   14.00, 'GVK/5510 isci SGK kesintisi'),
  ('issizlik_isci',               1.00, '4447 isci issizlik kesintisi'),
  ('issizlik_isveren',            2.00, '4447 isveren issizlik payi, tum senaryolarda sabit'),
  ('sgk_isveren_borclu',         21.75, 'Borclu/tesviksiz, MYO isveren +1 puan dahil'),
  ('sgk_isveren_kultur_girisim', 14.81, '5225 Kultur Girisim Belgeli, kalan hissenin %25i, 7 yil'),
  ('sgk_isveren_kultur_yatirim',  9.88, '5225 Kultur Yatirim Belgeli, kalan hissenin %50si, 3 yil')
) as r(code, rate, note) on r.code = c.code
on conflict (component_id, valid_from, bracket_floor) do nothing;

-- ============ 4) rate_catalog: tutar satirlari (parametre cipalari) ============
insert into public.rate_catalog (component_id, amount_tl, valid_from, value_kind, note)
select c.id, r.amount, date '2026-01-01', 'tutar', r.note
from public.burden_components c
join (values
  ('parametre_asgari_brut',       33030.00, '2026 asgari brut TL/ay'),
  ('parametre_sgk_tavan_katsayi',     9.00, '7566 sayili kanun, asgari x9 (SGK+issizlik tavani)')
) as r(code, amount, note) on r.code = c.code
on conflict (component_id, valid_from, bracket_floor) do nothing;

-- ============ 5) rate_catalog: tarife satirlari (GVK 103, 5 basamak) ============
insert into public.rate_catalog (component_id, rate_percent, bracket_floor, bracket_base_tax, valid_from, value_kind, note)
select c.id, r.rate, r.floor, r.base_tax, date '2026-01-01', 'tarife', 'GVK 103 ucret tarifesi 2026'
from public.burden_components c
join (values
  (0::numeric,       15.00, 0::numeric),
  (190000,           20.00, 28500),
  (400000,           27.00, 70500),
  (1500000,          35.00, 367500),
  (5300000,          40.00, 1697500)
) as r(floor, rate, base_tax) on true
where c.code = 'gv_ucret'
on conflict (component_id, valid_from, bracket_floor) do nothing;

-- ============ 6) Bordro iskelet kovasi: 6 bacak ============
insert into public.payment_status_burdens (payment_status, component_id)
select 'bordro', c.id from public.burden_components c
where c.code in ('sgk_isci','issizlik_isci','gv_ucret','damga','sgk_isveren','issizlik_isveren')
on conflict (payment_status, component_id) do nothing;

-- ============ 7) Ek-6 profili ============
insert into public.payroll_profiles (code, label) values
  ('ek6', 'Ek-6 (Kısmi Sigortalı Sanatçı)')
on conflict (code) do nothing;

insert into public.payroll_profile_burdens (profile_code, component_id, action)
select 'ek6', c.id, 'remove' from public.burden_components c
where c.code in ('sgk_isci','issizlik_isci','sgk_isveren','issizlik_isveren')
on conflict (profile_code, component_id, action) do nothing;

-- ============ 8) Backfill: mevcut bordro kalemlerini tazele ============
do $$ declare r record; begin
  for r in select id from public.budget_items where payment_status = 'bordro' loop
    perform public.fn_refill_item_burdens(r.id);
  end loop;
end $$;
