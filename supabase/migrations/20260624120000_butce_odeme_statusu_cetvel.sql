-- KAAPA — Butce odeme statusu + statu oranlari cetveli (B20). Additive ek; davranis degismez.
-- Oranlar TASLAK: mali musavir teyidi sonrasi kesinlesecek (docs/butce/VERGI-MEVZUATI.md).

alter table public.budget_items
  add column payment_status text not null default 'sirket'
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama')),
  add column stopaj_rate numeric(7,4)
    check (stopaj_rate is null or (stopaj_rate >= 0 and stopaj_rate < 100)),
  add column vat_deductible boolean not null default true;

alter table public.budget_item_periods
  add column unit_net_override numeric(14,2)
    check (unit_net_override is null or unit_net_override >= 0);

create table public.payment_status_defaults (
  id uuid primary key default gen_random_uuid(),
  payment_status text not null
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama')),
  default_stopaj_rate numeric(7,4) not null default 0
    check (default_stopaj_rate >= 0 and default_stopaj_rate < 100),
  applies_sgk boolean not null default false,
  default_vat_rate numeric(7,4) not null default 0
    check (default_vat_rate >= 0),
  valid_from date not null,
  note text,
  created_at timestamptz not null default now()
);

insert into public.payment_status_defaults
  (payment_status, default_stopaj_rate, applies_sgk, default_vat_rate, valid_from, note) values
  ('bordro',        0,  true,  0,  '2026-01-01', 'ucret; SGK isveren payi biner; KDV yok'),
  ('smm',           20, false, 20, '2026-01-01', 'serbest meslek yuzde 20; oyuncu/serbest ekip'),
  ('telif_belgeli', 17, false, 0,  '2026-01-01', 'GVK 18 eser belgeli yuzde 17; KDV alici sorumlu/istisna'),
  ('sirket',        0,  false, 20, '2026-01-01', 'sirket faturasi Ltd/AS'),
  ('kira_sahis',    20, false, 0,  '2026-01-01', 'sahis kira yuzde 20; sahis KDV mukellefi degil'),
  ('konaklama',     0,  false, 10, '2026-01-01', 'konaklama/yemek yuzde 10 KDV');

alter table public.payment_status_defaults enable row level security;

-- RLS: burden_components ile ayni global-referans-cetveli mantigi (baseline'dan birebir).
create policy sel_payment_status_defaults
  on public.payment_status_defaults
  for select to authenticated using (true);

grant references, trigger, truncate, maintain on table public.payment_status_defaults to anon;
grant select, references, trigger, truncate, maintain on table public.payment_status_defaults to authenticated;
grant all on table public.payment_status_defaults to service_role;
