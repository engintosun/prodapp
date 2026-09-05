-- Uretim Kayitlari (6 Eylul 2026): budget_cost_objects'e ajans/menajer haneleri.
-- Karar kaynagi: docs/KABUK-KARARLARI.md 12.1b + 4 GEVSEME, docs/butce/BUTCE-EKRAN-KARARLARI.md 20
-- URETIM KAYITLARI - LISTE KARARLARI. Bu dilimde tikler YALNIZ VERIDIR: hicbir butce satiri
-- dogurmaz, hicbir butce tablosuna yazmaz. Komisyon satirinin dogumu ayri bir dilimdir.

alter table public.budget_cost_objects
  add column has_agency boolean not null default false,
  add column agency_name text,
  add column has_manager boolean not null default false,
  add column manager_name text;

comment on column public.budget_cost_objects.has_agency is
  'Uretim Kayitlari (6 Eylul 2026): oyuncunun ajansi var mi. Tik VERIDIR - bu dilimde hicbir butce satiri dogurmaz; komisyon satirinin dogumu ayri bir dilimdir.';
comment on column public.budget_cost_objects.agency_name is
  'Ajans adi (serbest metin, tik isaretliyken dolar). Tedarikci kutuphanesi geldiginde kayda isaret edecek - BUTCE-SEMA-KARARLARI 180.';
comment on column public.budget_cost_objects.has_manager is
  'Menajer tiki. has_agency ile ayni doktrin: bu dilimde yalniz veri.';
comment on column public.budget_cost_objects.manager_name is
  'Menajer adi (serbest metin, tik isaretliyken dolar).';

-- Mevcut kisi-hane kisitinin yanina ayni desende ikinci kisit: dort hane yalniz
-- kind='kisi' etiketlerinde anlamlidir (emsal: budget_cost_objects_kisi_haneleri_check).
alter table public.budget_cost_objects
  add constraint budget_cost_objects_temsilci_haneleri_check
  check (kind = 'kisi' or (has_agency = false and agency_name is null and has_manager = false and manager_name is null));
