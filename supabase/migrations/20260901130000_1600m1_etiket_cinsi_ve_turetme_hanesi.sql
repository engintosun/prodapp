-- KART 1600 M1: etiket cinsi (kisi/is), kaleme ikinci etiket bagi, turetme orani hanesi,
-- Temsilci Komisyonu atomu, birim cetveli 5 -> 7.
-- Karar kaynagi: KART-KATALOGU 7.5 "KART 1600 TASARIM KARARLARI" (22 Agustos 2026) +
-- BUTCE-SEMA-KARARLARI "ACIK SEMA SORUSU" (21 Agustos 2026).

-- 1) Etiketin cinsi. Bugune kadar cost_object tek cinsti (transversal is: Stunt, VFX).
--    KART 1600 ayni satirda hem kisi etiketi hem is etiketi istiyor; ikisi tek alana sigmaz.
--    Varsayilan 'is': mevcut satirlarin tamami transversal is etiketidir.
alter table public.budget_cost_objects
  add column kind text not null default 'is'
  check (kind in ('kisi', 'is'));

comment on column public.budget_cost_objects.kind is
  'Etiket cinsi. is = kart sinirini asan transversal is/oge (Stunt, VFX). kisi = bir kisiyi temsil eden etiket (KART 1600 ozet satiri). Satir basina her cinsten EN COK BIR bag.';

-- 2) Kaleme ikinci bag. cost_object_id is etiketini, person_object_id kisi etiketini tasir.
--    Composite FK ile ayni-butce garantisi (cost_object_id ile ayni desen).
alter table public.budget_items
  add column person_object_id uuid;

alter table public.budget_items
  add constraint budget_items_person_object_fk
  foreign key (person_object_id, budget_id)
  references public.budget_cost_objects(id, budget_id) on delete restrict;

comment on column public.budget_items.person_object_id is
  'KISI etiketi bagi (KART 1600 ikinci baslik anahtari). Ayni kisiye ait satirlari bir arada tutar; ozet satiri bu etiketin gorunumudur. Kod veya yazilan isim DEGIL, etiket baglar.';

-- 3) Cins denetimi. FK sabit deger tasiyamadigi icin tetikle korunur.
create or replace function public.fn_check_cost_object_kind()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
begin
  if new.cost_object_id is not null then
    select kind into v_kind from public.budget_cost_objects where id = new.cost_object_id;
    if v_kind is distinct from 'is' then
      raise exception 'İş etiketi hanesine kişi etiketi konulamaz (etiket cinsi: %)', v_kind;
    end if;
  end if;
  if new.person_object_id is not null then
    select kind into v_kind from public.budget_cost_objects where id = new.person_object_id;
    if v_kind is distinct from 'kisi' then
      raise exception 'Kişi etiketi hanesine iş etiketi konulamaz (etiket cinsi: %)', v_kind;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_cost_object_kind on public.budget_items;
create trigger trg_check_cost_object_kind
  before insert or update of cost_object_id, person_object_id on public.budget_items
  for each row execute function public.fn_check_cost_object_kind();

-- 4) Turetme orani. B18: hesaplanmis TUTAR saklanmaz, ORAN saklanir; tutar her bakista
--    hesaptan dogar. Bugun tek kullanicisi temsilci komisyonudur; 1300/1400 ayni haneyi kullanacak.
alter table public.budget_items
  add column derive_rate numeric(5,2)
  check (derive_rate is null or derive_rate >= 0);

comment on column public.budget_items.derive_rate is
  'B18: turetilen tutar SAKLANMAZ, oran saklanir. Dolu ise satirin birim neti kardes satirlarin Ara toplam degerlerinin toplamindan bu oranla dogar. Bos ise satir normal girilir.';

-- 5) Kutuphanede turetilen atom isareti. is_group basligi gizler; is_derived turetilen atomu
--    kalem ekleme listesinden gizler (kullanici elle eklemez, turetme dogurur).
alter table public.item_library
  add column is_derived boolean not null default false;

comment on column public.item_library.is_derived is
  'true ise atom kalem ekleme listesinde GORUNMEZ; yalnizca turetme mekanizmasi dogurur (emsal: is_group basliklari gizler).';

-- 6) Temsilci Komisyonu atomu. Tek atom yeter: ajans ile menajer farki STATUDE yasar
--    (statu satir bazinda secilir), ayri atom gerektirmez. Varsayilan statu Fatura, birim sabit
--    (ajans faturasi tek kalemdir, miktar x carpan = 1 x 1).
--    Kod 1618: 1617 Koster'de "Contractuals" olarak dolu ve item_burdens'a gidiyor, bu yuzden
--    atom KAAPA-atamalidir (emsal: 1605, 1609, 1610).
insert into public.item_library
  (catalog_code, name, name_en, default_payment_status, default_unit_code, provenance, is_derived)
values
  ('1618', 'Temsilci Komisyonu', 'Agency / Management Commission', 'sirket', 'flat', 'KAAPA', true);

-- 7) Birim cetveli 5 -> 7: film ve saat eklenir, sabit en sona alinir.
update public.units set sort_order = 7 where code = 'flat';
insert into public.units (code, label, sort_order) values
  ('film', 'film', 5),
  ('hour', 'saat', 6)
on conflict (code) do nothing;
