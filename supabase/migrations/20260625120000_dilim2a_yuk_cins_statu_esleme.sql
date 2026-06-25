-- KAAPA DILIM-2a: yuk kovasi cins + statu->bilesen eslemesi + basit stopaj orani (B20).
-- Sema degisikligi; davranis henuz DEGISMEZ (CFE cins okumasi 2c, ekran 2d).

-- 1) Yuk turleri rafina CINS: additive=net ustune biner / deduction=brutten kesilir
alter table public.burden_components add column kind text;
update public.burden_components set kind = 'deduction' where code in ('stopaj','damga');
update public.burden_components set kind = 'additive'  where code in ('sgk_isveren','ajans_komisyonu');
alter table public.burden_components
  alter column kind set not null,
  add constraint burden_components_kind_check check (kind in ('additive','deduction'));

-- 2) Telif stopaji ayri tur (smm/kira genel stopaj=20 paylasir; telif=17)
insert into public.burden_components (code, label, kind) values
  ('stopaj_telif','Stopaj (telif)','deduction')
on conflict (code) do nothing;
insert into public.rate_catalog (component_id, rate_percent, valid_from, note)
select id, 17.0, date '2026-01-01', 'TASLAK - GVK 18 telif eser belgeli'
from public.burden_components where code = 'stopaj_telif'
on conflict (component_id, valid_from) do nothing;

-- 3) Statu -> yuk esleme klasoru (veri, koda gomulmez)
create table public.payment_status_burdens (
  id uuid primary key default gen_random_uuid(),
  payment_status text not null
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama')),
  component_id uuid not null references public.burden_components(id),
  created_at timestamptz not null default now(),
  unique (payment_status, component_id)
);
insert into public.payment_status_burdens (payment_status, component_id)
select s.payment_status, c.id
from (values ('smm','stopaj'),('kira_sahis','stopaj'),('telif_belgeli','stopaj_telif'))
  as s(payment_status, code)
join public.burden_components c on c.code = s.code;
-- sirket/konaklama: satir YOK = bos kova. bordro: DILIM-3 motoru, simdilik satir YOK.

alter table public.payment_status_burdens enable row level security;
create policy sel_payment_status_burdens
  on public.payment_status_burdens for select to authenticated using (true);
grant references, trigger, truncate, maintain on table public.payment_status_burdens to anon;
grant select, references, trigger, truncate, maintain on table public.payment_status_burdens to authenticated;
grant all on table public.payment_status_burdens to service_role;

-- 4) Tek oran evi = rate_catalog. 06-24 cetvelindeki stopaj orani fazlalik -> cikar.
alter table public.payment_status_defaults drop column default_stopaj_rate;
