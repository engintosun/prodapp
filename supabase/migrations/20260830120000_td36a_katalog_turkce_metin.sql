-- TD-36a: kullaniciya gorunen exception metni Turkce karakterli yazilir.
-- Govde, 20260704204946_dilim3b_katalog_2026_seed.sql icindeki canli tanimin
-- BIREBIR kopyasidir; yalnizca raise exception metni degismistir.
-- Fonksiyonun parametresi yok (returns trigger); tetikleyici bagi
-- create or replace ile korunur (sandbox turunda dogrulandi, 30 Agustos 2026).

create or replace function public.fn_guard_no_parameter_kind()
returns trigger language plpgsql as $guard$
declare v_kind text;
begin
  select kind into v_kind from public.burden_components where id = new.component_id;
  if v_kind = 'parameter' then
    raise exception 'Parametre türündeki bileşen kovaya bağlanamaz (tablo: %, component_id: %)',
      tg_table_name, new.component_id;
  end if;
  return new;
end; $guard$;

-- SAGLAMA: imza kaymasinda Postgres eskiyi degistirmez, YANINA ikinci bir
-- fonksiyon koyar ve sessizce basarili olur (sandbox turunda uretildi).
-- Bu blok o durumu migration'in kendi icinde hataya cevirir.
do $check$
declare n int;
begin
  select count(*) into n from pg_proc where proname = 'fn_guard_no_parameter_kind';
  if n <> 1 then
    raise exception 'TD-36a saglama: fn_guard_no_parameter_kind sayisi % (1 olmali) — imza kaymis', n;
  end if;
end $check$;
