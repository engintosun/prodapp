-- KAAPA DILIM-3d: giris modu (4 giris noktasi) + stopaj_rate tetigi genisleme.
-- calculation_type YOK - yon input_mode'dan turer (unit_gross/total_gross -> gross_to_net;
-- null/total_net -> net_to_gross). Servis + UI kablolamasi ayni dilimde, ayri commit'te.

-- 1) 4 giris noktasi icin tek cift kolon
alter table public.budget_items
  add column input_mode text null
    check (input_mode is null or input_mode in ('unit_gross','total_net','total_gross')),
  add column input_value numeric(14,2) null
    check (input_value is null or input_value >= 0);
alter table public.budget_items
  add constraint budget_items_input_mode_value_pair
    check ((input_mode is null) = (input_value is null));
comment on column public.budget_items.input_mode is
  'NULL = kaynak unit_net (bugunku davranis). Doluysa: unit_gross/total_net/total_gross - input_value o modun ham degeridir. calculation_type YOK, yon buradan turer (unit_gross/total_gross -> gross_to_net; null/total_net -> net_to_gross).';

-- 2) stopaj_rate degisince de kova tazelensin (3a borcu, PERSONEL-MEVZUATI H soru izini kapatir)
drop trigger if exists trg_refill_on_status on public.budget_items;
create trigger trg_refill_on_status
  after update of payment_status, payroll_profile, stopaj_rate on public.budget_items
  for each row
  when (
    new.payment_status is distinct from old.payment_status
    or new.payroll_profile is distinct from old.payroll_profile
    or new.stopaj_rate is distinct from old.stopaj_rate
  )
  execute function public.fn_trg_refill_burdens();
