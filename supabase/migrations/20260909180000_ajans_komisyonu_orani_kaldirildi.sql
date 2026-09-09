-- KAAPA: ajans komisyonunun rate_catalog satiri kaldirilir.
-- Gerekce: Rekabet Kurulu 21.05.2026 karari orani serbest birakti; rate_catalog
-- yalniz mevzuat degerlerini tutar (DEGISMEZLER madde 5). Ekranda gorunen yuzde 10
-- ile karttaki yuzde 20 celisiyordu.
-- KAPSAM: yalniz oran satiri; bilesen ve paket kalir (Engin karari, 9 Eylul 2026).

do $$
declare v_n integer;
begin
  select
    (select count(*) from public.item_burdens ib
       join public.burden_components c on c.id = ib.component_id
      where c.code = 'ajans_komisyonu')
  + (select count(*) from public.payment_status_burdens p
       join public.burden_components c on c.id = p.component_id
      where c.code = 'ajans_komisyonu')
  + (select count(*) from public.payroll_profile_burdens pp
       join public.burden_components c on c.id = pp.component_id
      where c.code = 'ajans_komisyonu')
  into v_n;
  if v_n > 0 then
    raise exception 'Ajans komisyonu bileseni % canli kovada kullanimda, oran satiri silinmedi', v_n;
  end if;
end $$;

delete from public.rate_catalog
 where component_id = (select id from public.burden_components where code = 'ajans_komisyonu');
