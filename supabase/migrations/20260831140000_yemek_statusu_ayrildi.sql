-- KAAPA 31 Agustos 2026: `konaklama` statusu ikiye ayrildi, `yemek` kendi kodunu aldi.
-- Vergi rejimi IKISINDE DE AYNI (stopaj 0, SGK yok, KDV %10); ayrim anlam ayrimidir.
-- Kisit adlari 20260815130000'de canli DB'den dogrulanmisti, ayni adlar kullaniliyor.
-- payment_status_burdens'e SATIR EKLENMEZ: bos kova = sifir yuk (sirket/konaklama emsali).
-- fn_open_budget DEGISMEZ: fonksiyonda statu listesi kopyasi yok, eslesme satiri
-- bulunmayan statude kovayi zaten bos birakiyor (20260625130000 satir 112-113).

alter table public.budget_items
  drop constraint budget_items_payment_status_check,
  add constraint budget_items_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','yemek','resmi_odeme'));

alter table public.payment_status_defaults
  drop constraint payment_status_defaults_payment_status_check,
  add constraint payment_status_defaults_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','yemek','resmi_odeme'));

alter table public.payment_status_burdens
  drop constraint payment_status_burdens_payment_status_check,
  add constraint payment_status_burdens_payment_status_check
    check (payment_status in ('bordro','smm','telif_belgeli','sirket','kira_sahis','konaklama','yemek','resmi_odeme'));

-- default_stopaj_rate kolonu 20260625120000'de dusuruldu; INSERT listesine KONMADI
-- (ayni duzeltme 20260815130000'de resmi_odeme icin de uygulanmisti).
insert into public.payment_status_defaults
  (payment_status, applies_sgk, default_vat_rate, valid_from, note) values
  ('yemek', false, 10, '2026-01-01', 'restoran/lokanta/set catering yuzde 10 KDV');

-- Mevcut konaklama satirinin notu artik yemegi kapsamiyor.
update public.payment_status_defaults
  set note = 'otel/pansiyon geceleme yuzde 10 KDV'
  where payment_status = 'konaklama';
