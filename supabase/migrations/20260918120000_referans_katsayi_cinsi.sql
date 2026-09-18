-- KAAPA: REFERANS CETVELINDE KATSAYI CINSI (Engin karari 18 Eylul 2026).
-- rate_catalog.value_kind kumesine dorduncu cins eklenir: katsayi. SGK tavan
-- katsayisi satiri o cinse alinir. Sayi amount_tl kolonunda KALIR - katsayiyi
-- kendi kolonuna tasima yolu BUGUN REDDEDILDI (BUTCE-SEMA-KARARLARI.md).
--
-- AYNI CHECK CIFTININ KOPYASI budget_rate_snapshot tablosundadir (MUHUR-1,
-- 20260711140000). fn_lock_budget rc.value_kind degerini suzmeden kopyalar
-- (20260905180000), dorduncu cins orada da acilmazsa muhur ilk kilitlemede
-- CHECK ihlaliyle patlar. Snapshot bugun bos (0 satir, olculdu 18 Eylul 2026),
-- bu yuzden genisletmenin mevcut veriye etkisi yoktur.
--
-- RLS / grant / trigger: DEGISIKLIK YOK - yeni tablo ve yeni kolon yok.
-- trg_log_rate_catalog asagidaki UPDATE icin denetim izini kendisi yazar (B19).

-- 1) rate_catalog: cins kumesi
alter table public.rate_catalog
  drop constraint rate_catalog_value_kind_check;
alter table public.rate_catalog
  add constraint rate_catalog_value_kind_check
    check (value_kind in ('oran','tutar','tarife','katsayi'));

-- 2) rate_catalog: bicim kisiti. Katsayi dali TUTAR dali ile ayni sekli tasir
--    (amount_tl dolu, digerleri bos), cunku sayi tutar kolonunda kaliyor.
alter table public.rate_catalog
  drop constraint rate_catalog_value_kind_shape;
alter table public.rate_catalog
  add constraint rate_catalog_value_kind_shape check (
    (value_kind = 'oran'    and rate_percent is not null and amount_tl is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tutar'   and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'katsayi' and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tarife'  and rate_percent is not null and bracket_floor is not null and bracket_base_tax is not null and amount_tl is null)
  );

-- 3) budget_rate_snapshot: ayni iki kisit (muhur kopyasi)
alter table public.budget_rate_snapshot
  drop constraint budget_rate_snapshot_value_kind_check;
alter table public.budget_rate_snapshot
  add constraint budget_rate_snapshot_value_kind_check
    check (value_kind in ('oran','tutar','tarife','katsayi'));

alter table public.budget_rate_snapshot
  drop constraint budget_rate_snapshot_value_kind_shape;
alter table public.budget_rate_snapshot
  add constraint budget_rate_snapshot_value_kind_shape check (
    (value_kind = 'oran'    and rate_percent is not null and amount_tl is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tutar'   and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'katsayi' and amount_tl is not null and rate_percent is null and bracket_floor is null and bracket_base_tax is null)
    or (value_kind = 'tarife'  and rate_percent is not null and bracket_floor is not null and bracket_base_tax is not null and amount_tl is null)
  );

-- 4) Tavan katsayisi satiri yeni cinse alinir. TEK satir (olculdu: 2026-01-01,
--    vintage yok). parametre_asgari_brut TUTAR olarak KALIR - o gercekten TL.
update public.rate_catalog
   set value_kind = 'katsayi'
 where component_id = (select id from public.burden_components
                        where code = 'parametre_sgk_tavan_katsayi');
