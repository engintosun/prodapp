-- KAAPA MUHUR MESAJI (2026-09-23, Engin karari; BUTCE-EKRAN-KARARLARI bolum 19 UYGULAMA Dilim 2b)
-- Muhurlu versiyon asla degismez; revizyon taslakta calisilip yeniden muhurlenir ve V+1 dogar
-- (MUHUR-1). Eski mesaj islev adi tasiyor ve olmayan bir "muhru acma" adimi soyluyordu.
-- Govde 20260830140000 tanimindan birebir; YALNIZ mesaj satiri degisti. Isleve bagli yedi
-- denetim yeniden kurulmaz, ayni islevi cagirdiklari icin yeni mesaj hepsinde cikar.

create or replace function public.fn_guard_budget_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $guardfn$
declare
  v_budget_id uuid := coalesce(new.budget_id, old.budget_id);
  v_is_locked boolean;
begin
  select is_locked into v_is_locked from budgets where id = v_budget_id;
  if coalesce(v_is_locked, false) then
    raise exception 'Mühürlü bütçe değiştirilemez. Değişiklik taslakta yapılır.';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$guardfn$;
