-- KART 1600 M3b-1: kisi etiketine Rol (karakter adi) ve Gorev (kisinin isi) haneleri.
-- Karar kaynagi: BUTCE-SEMA-KARARLARI "kisi etiketine ROL hanesi eklenecek" (1 Eylul 2026) +
-- KABUK-KARARLARI 12.1 GOREV HANESI (3 Eylul 2026) + GLOSSARY satir 142.
-- ETIKET INCE KALIR: yalniz ad, cins, rol, gorev. Ucret, ekipman, iletisim, sirket kunyesi
-- BURAYA YAZILMAZ (tedarikci hafizasinin isi, iki yerde yasamamali).

alter table public.budget_cost_objects
  add column role_name text,
  add column duty_code text;

comment on column public.budget_cost_objects.role_name is
  'Rol = KARAKTERIN adi (serbest metin; senaryo dokumu kurulmadigi icin kullanici yazar). Ozet satirinda gorunur. Yalnizca kind=kisi etiketlerinde dolu olur.';

comment on column public.budget_cost_objects.duty_code is
  'Gorev = KISININ isi; degeri item_library katalog atomu kodudur (basrol, yardimci oyuncu, gunluk oyuncu, dublor, dublor koordinatoru). Kart yerlesimi bu haneden okunur. ROL ile karistirilmaz. Yalnizca kind=kisi etiketlerinde dolu olur.';

-- Is etiketinde bu iki hane bos kalmak zorundadir; cins denetimi tabloda yasar.
alter table public.budget_cost_objects
  add constraint budget_cost_objects_kisi_haneleri_check
  check (kind = 'kisi' or (role_name is null and duty_code is null));
