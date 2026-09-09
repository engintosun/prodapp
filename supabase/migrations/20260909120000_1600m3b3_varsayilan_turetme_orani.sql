-- KART 1600 M3b-3: turetilen atomun varsayilan orani icin item_library kolonu.
-- Bu oran bir MEVZUAT degeri DEGILDIR, o yuzden rate_catalog tablosuna girmez. Rekabet
-- Kurulunun 21.05.2026 karari oranin serbest oldugunu gosterir; %20 piyasa yogunlugudur
-- ve yalniz kolayliktir.

alter table public.item_library
  add column default_derive_rate numeric(5,2)
  check (default_derive_rate is null or (default_derive_rate >= 0 and default_derive_rate <= 100));

comment on column public.item_library.default_derive_rate is
  'Turetilen atomun yeni satirda ongelen orani. Satirdaki gercek oran budget_items tablosunun derive_rate kolonunda yasar.';

update public.item_library set default_derive_rate = 20 where catalog_code = '1618';
