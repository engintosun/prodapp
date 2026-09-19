-- KART 1600: komisyon kaleminin aidiyeti kisiden gelir (Engin karari, 20 Eylul 2026)
--
-- 1618 Ajans Komisyonu ve 1618-01 Menajer Komisyonu kutuphanede 1600-01 Ana Kast
-- basligina bagliydi. Komisyon satiri kimin icin dogarsa dogsun Ana Kast bolumunde
-- doguyordu; kisi blogu bolum sinirini gecemedigi icin satir sahibinin yaninda hic
-- gorunmuyordu (dublorun komisyonu kartin yukarisinda Ana Kast icinde kaliyordu).
-- Aidiyet hanesi bosaltiliyor: boylece iki atom 1611 Mesai ve 1616 Prova ile ayni
-- kurala giriyor - baslik kisinin bu karttaki satirindan miras alinir
-- (fn_add_budget_item, 20260919120000).

-- 1) Kutuphane
update public.item_library
   set heading_id = null
 where catalog_code in ('1618', '1618-01');

-- 2) Canlida dogmus AKTIF komisyon satirlari kisinin kendi bolumune tasinir.
--    Kural fn_add_budget_item mirasinin aynisi: once kisinin gorev satiri, yoksa
--    en eski satiri. TURETILMIS SATIR TABAN OLAMAZ: 39xx gorevli kiside komisyon
--    kodu (1618) kendi kasesinden once geldigi icin, disarida birakilmazsa satir
--    kendi bolumunu kendine taban yapar ve hicbir sey tasinmaz.
--    Kilitli butce DISARIDA: muhurlu butceye yazilmaz (trg_guard_lock_items).
update public.budget_items bi
   set heading_code = coalesce(
     (select x.heading_code
        from public.budget_items x
        join public.item_library l2 on l2.id = x.library_item_id
       where x.group_id = bi.group_id
         and x.person_object_id = bi.person_object_id
         and x.is_active
         and x.derive_rate is null
         and l2.is_duty
       order by x.sort_order
       limit 1),
     (select x.heading_code
        from public.budget_items x
       where x.group_id = bi.group_id
         and x.person_object_id = bi.person_object_id
         and x.is_active
         and x.derive_rate is null
       order by x.sort_order
       limit 1),
     bi.heading_code)
  from public.expense_groups g
  join public.budgets b on b.id = g.budget_id
 where g.id = bi.group_id
   and b.is_locked = false
   and bi.catalog_code in ('1618', '1618-01')
   and bi.is_active
   and bi.person_object_id is not null;

do $check$
begin
  if exists (select 1 from public.item_library
              where catalog_code in ('1618', '1618-01') and heading_id is not null) then
    raise exception 'Komisyon atomlarinin aidiyet hanesi bosalmadi';
  end if;
end $check$;
