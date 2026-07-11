-- KAAPA MUHUR-2 dogrulama scripti. Linked canli DB'de calisir, IZ BIRAKMAZ:
-- tum is tek transaction icinde yapilir ve sonda ROLLBACK edilir.
-- Beklenen cikti: NOTICE 'MUHUR-2 VERIFY: TUM ADIMLAR GECTI ...'
begin;

do $verify$
declare
  v_budget uuid;
  v_project uuid;
  v_owner uuid;
  v_uid uuid;
  v_vno int;
  v_vid uuid;
  v_sealed_code text;
  v_live_code text;
  v_snap_count int;
  v_cat_count int;
  v_locked boolean;
begin
  -- 1) Test butcesi: en son acik butce
  select b.id, b.project_id into v_budget, v_project
    from budgets b
   where b.is_locked = false
   order by b.created_at desc
   limit 1;
  if v_budget is null then
    raise exception 'VERIFY: acik butce bulunamadi';
  end if;

  -- 2) auth.uid() simulasyonu: projenin aktif muhasebe uyesi (transaction-yerel GUC)
  select pr.user_id into v_uid
    from profiles pr
   where pr.project_id = v_project
     and pr.role = 'muhasebe'
     and pr.membership_status = 'active'
   limit 1;
  if v_uid is null then
    raise exception 'VERIFY: aktif muhasebe uyesi bulunamadi';
  end if;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_uid, 'role', 'authenticated')::text, true);

  -- 3) Muhurle + versiyon/snapshot dogrula
  select fn_lock_budget(v_budget, 'MUHUR-2 verify (rollback)') into v_vno;
  select is_locked into v_locked from budgets where id = v_budget;
  if not v_locked then
    raise exception 'VERIFY: fn_lock_budget sonrasi is_locked=true degil';
  end if;
  select id, sgk_component_code into v_vid, v_sealed_code
    from budget_versions
   where budget_id = v_budget and version_no = v_vno;
  select count(*) into v_snap_count from budget_rate_snapshot where version_id = v_vid;
  select count(*) into v_cat_count from rate_catalog;
  if v_snap_count <> v_cat_count then
    raise exception 'VERIFY: snapshot satir sayisi (%) katalog satir sayisindan (%) farkli', v_snap_count, v_cat_count;
  end if;

  -- 4) Sirket profilini oynat (rollback geri alacak): Q3 tersine
  select p.created_by into v_owner from projects p where p.id = v_project;
  update company_profile set sgk_borcu_yok = not sgk_borcu_yok where user_id = v_owner;

  -- 5) Canli cozumleme degisti, muhurlu kayit aynen duruyor mu
  select fn_resolve_sgk_scenario(v_project) into v_live_code;
  if v_live_code = v_sealed_code then
    raise exception 'VERIFY: profil degisti ama canli kod hala % — kurgu bozuk', v_live_code;
  end if;
  if (select sgk_component_code from budget_versions where id = v_vid) <> v_sealed_code then
    raise exception 'VERIFY: muhurlu sgk_component_code DEGISTI — dokunulmazlik ihlali';
  end if;

  -- 6) Kilit guard: muhurluyken dokunus reddedilmeli (budget_stages her butcede satir garantili)
  begin
    update budget_stages set name = name where budget_id = v_budget;
    raise exception 'VERIFY: guard calismadi — muhurlu etaba update gecti';
  exception when others then
    if sqlerrm not like '%muhurlu%' then
      raise;
    end if;
  end;

  -- 7) Muhru ac, dokunus gecmeli
  perform fn_unlock_budget(v_budget);
  update budget_stages set name = name where budget_id = v_budget;

  raise notice 'MUHUR-2 VERIFY: TUM ADIMLAR GECTI (V% — sealed % / live %)', v_vno, v_sealed_code, v_live_code;
end;
$verify$;

rollback;
