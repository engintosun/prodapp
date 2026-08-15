-- KAAPA DILIM 1100-A (bolum 1): resmi_odeme odeme statusu.
-- Kisit adlari canli DB'den dogrulandi (2026-08-15): budget_items_payment_status_check,
-- payment_status_defaults_payment_status_check, payment_status_burdens_payment_status_check.
-- payment_status_burdens'e SATIR EKLENMEZ: bos kova = sifir yuk (sirket/konaklama emsali).

alter table public.budget_items
  drop constraint budget_items_payment_status_check,
  add constraint budget_items_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','resmi_odeme'));

alter table public.payment_status_defaults
  drop constraint payment_status_defaults_payment_status_check,
  add constraint payment_status_defaults_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','resmi_odeme'));

alter table public.payment_status_burdens
  drop constraint payment_status_burdens_payment_status_check,
  add constraint payment_status_burdens_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','resmi_odeme'));

-- default_stopaj_rate kolonu 20260625120000'de dusuruldu; INSERT listesine KONMADI.
insert into public.payment_status_defaults
  (payment_status, applies_sgk, default_vat_rate, valid_from, note) values
  ('resmi_odeme', false, 0, '2026-01-01', 'harc/vergi: kamuya odeme; stopaj yok, SGK yok, KDV yok');
