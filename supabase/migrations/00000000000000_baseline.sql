--
-- PostgreSQL database dump
--

\restrict ogV05n8FualEQizM6SP0hdDSpi1fbCQIkbFPnD9kw0PO79X8OU3Lm3J2MDQnAfS

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: clear_user_claims(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clear_user_claims(p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) - 'project_id' - 'role' - 'dept_id'
  WHERE id = p_user_id;
END;
$$;


ALTER FUNCTION public.clear_user_claims(p_user_id uuid) OWNER TO postgres;

--
-- Name: fn_assign_period_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_assign_period_number() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.period_number IS NULL THEN
    SELECT COALESCE(MAX(period_number), 0) + 1
      INTO NEW.period_number
      FROM periods
      WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_assign_period_number() OWNER TO postgres;

--
-- Name: fn_create_project(text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_create_project(p_name text, p_company_name text, p_first_name text, p_last_name text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_can     boolean;
  v_project uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum yok';
  END IF;

  SELECT COALESCE((u.raw_app_meta_data ->> 'can_create_projects')::boolean, false)
    INTO v_can
    FROM auth.users u
   WHERE u.id = v_uid;

  IF NOT COALESCE(v_can, false) THEN
    RAISE EXCEPTION 'Proje acma yetkisi yok';
  END IF;

  IF btrim(COALESCE(p_name, '')) = ''
     OR btrim(COALESCE(p_company_name, '')) = ''
     OR btrim(COALESCE(p_first_name, '')) = ''
     OR btrim(COALESCE(p_last_name, '')) = '' THEN
    RAISE EXCEPTION 'Eksik alan';
  END IF;

  INSERT INTO projects (name, created_by)
  VALUES (btrim(p_name), v_uid)
  RETURNING id INTO v_project;

  INSERT INTO company_settings (project_id, company_name, project_name, updated_by)
  VALUES (v_project, btrim(p_company_name), btrim(p_name), v_uid);

  INSERT INTO profiles (user_id, project_id, role, first_name, last_name)
  VALUES (v_uid, v_project, 'muhasebe', btrim(p_first_name), btrim(p_last_name));

  RETURN v_project;
END;
$$;


ALTER FUNCTION public.fn_create_project(p_name text, p_company_name text, p_first_name text, p_last_name text) OWNER TO postgres;

--
-- Name: fn_is_budget_muhasebe(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_is_budget_muhasebe(p_budget uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from budgets b
    where b.id = p_budget and fn_is_project_muhasebe(b.project_id)
  );
$$;


ALTER FUNCTION public.fn_is_budget_muhasebe(p_budget uuid) OWNER TO postgres;

--
-- Name: fn_is_project_muhasebe(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_is_project_muhasebe(p_project uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from profiles pr
    where pr.user_id = auth.uid()
      and pr.project_id = p_project
      and pr.role = 'muhasebe' and pr.membership_status = 'active'
  );
$$;


ALTER FUNCTION public.fn_is_project_muhasebe(p_project uuid) OWNER TO postgres;

--
-- Name: fn_log_advance(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_log_advance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO advance_log (advance_id, action, actor_id, note)
  VALUES (
    NEW.id,
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN
        CASE
          WHEN NEW.status = 'approved' THEN 'approved'
          WHEN NEW.status = 'rejected' THEN 'rejected'
          WHEN NEW.status = 'settled' THEN 'settled'
          WHEN NEW.status = 'partially_settled' THEN 'partially_settled'
          ELSE 'updated'
        END
    END,
    auth.uid(),
    CASE TG_OP
      WHEN 'UPDATE' THEN NEW.settlement_note
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_log_advance() OWNER TO postgres;

--
-- Name: fn_log_budget_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_log_budget_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_old jsonb; v_new jsonb; v_budget uuid; v_row uuid;
begin
  if tg_op = 'UPDATE' then v_old := to_jsonb(old); v_new := to_jsonb(new);
  else v_old := to_jsonb(old); v_new := null; end if;
  v_row := coalesce((v_new->>'id')::uuid, (v_old->>'id')::uuid);
  v_budget := coalesce((v_new->>'budget_id')::uuid, (v_old->>'budget_id')::uuid,
    case when tg_table_name = 'budgets' then v_row end);
  insert into budget_change_log (table_name, row_id, budget_id, action, old_data, new_data, changed_by)
  values (tg_table_name, v_row, v_budget, tg_op, v_old, v_new, auth.uid());
  return null;
end; $$;


ALTER FUNCTION public.fn_log_budget_change() OWNER TO postgres;

--
-- Name: fn_log_receipt_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_log_receipt_match() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_budget uuid;
begin
  select budget_id into v_budget from budget_items
    where id = coalesce(new.budget_item_id, old.budget_item_id);
  insert into budget_change_log (table_name, row_id, budget_id, action, old_data, new_data, changed_by)
  values ('receipts', new.id, v_budget, 'UPDATE',
          jsonb_build_object('budget_item_id', old.budget_item_id),
          jsonb_build_object('budget_item_id', new.budget_item_id), auth.uid());
  return null;
end; $$;


ALTER FUNCTION public.fn_log_receipt_match() OWNER TO postgres;

--
-- Name: fn_open_budget(uuid, uuid, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_open_budget(p_project uuid, p_template uuid, p_scope text DEFAULT 'single'::text, p_episode_no integer DEFAULT NULL::integer) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_uid      uuid := auth.uid();
  v_body     jsonb;
  v_budget   uuid;
  v_today    date := current_date;
  v_stage    jsonb;
  v_card     jsonb;
  v_item     jsonb;
  v_pct      jsonb;
  v_dept     uuid;
  v_group    uuid;
  v_item_id  uuid;
  v_unit     uuid;   -- kart default birimi (3b'de set, bozulmaz)
  v_pkg      uuid;   -- kart default paketi (3b'de set, bozulmaz)
  v_item_unit uuid;  -- kalem-bazli birim (her kalemde hesaplanir)
  v_item_pkg  uuid;  -- kalem-bazli paket (her kalemde hesaplanir, yuk dongusunde kullanilir)
  v_comp     uuid;
  v_rate     numeric(7,4);
  v_item_code int;
begin
  if v_uid is null then
    raise exception 'Oturum yok';
  end if;

  -- Yetki: hedef projede muhasebe mi? (butce her seviyede yalniz muhasebe)
  if not fn_is_project_muhasebe(p_project) then
    raise exception 'Butce acma yetkisi yok';
  end if;

  -- Sablon govdesini al (system veya bu projenin sirket sablonu).
  select body into v_body from budget_templates
   where id = p_template and is_active
     and (kind = 'system' or owner_project_id = p_project);
  if v_body is null then
    raise exception 'Sablon bulunamadi veya bu projeye kapali';
  end if;

  -- Bu proje+scope+episode icin zaten butce var mi? (budgets unique nulls not distinct)
  if exists (select 1 from budgets where project_id = p_project
               and scope = p_scope and episode_no is not distinct from p_episode_no) then
    raise exception 'Bu kapsam icin butce zaten acik';
  end if;

  -- 1) Butce basligi.
  insert into budgets (project_id, scope, episode_no)
  values (p_project, p_scope, p_episode_no)
  returning id into v_budget;

  -- 2) Etaplar (stages[]). Tarih YOK (acilista null). + rezerve "Donemsiz".
  for v_stage in select * from jsonb_array_elements(coalesce(v_body->'stages', '[]'::jsonb))
  loop
    insert into budget_stages (budget_id, name, sort_order, is_undated)
    values (v_budget, v_stage->>'name',
            coalesce((v_stage->>'sort_order')::int, 0), false);
  end loop;
  -- Rezerve "Donemsiz" kovasi (her butcede bir tane; sort_order yuksek = sona).
  insert into budget_stages (budget_id, name, sort_order, is_undated)
  values (v_budget, 'Donemsiz', 9999, true);

  -- 3) Kartlar (cards[]) -> expense_groups. department_code bul-veya-olustur.
  for v_card in select * from jsonb_array_elements(coalesce(v_body->'cards', '[]'::jsonb))
  loop
    -- 3a) Departman: bul-veya-olustur. ON CONFLICT ile race-safe (iki muhasebeci
    --     ayni anda ayni code'u acabilir; ikincinin INSERT'i sessizce duser, SELECT kazanir).
    insert into departments (project_id, name, code)
    values (p_project, coalesce(v_card->>'name', v_card->>'department_code'),
            v_card->>'department_code')
    on conflict (project_id, code) do nothing;
    select id into v_dept from departments
     where project_id = p_project and code = v_card->>'department_code';

    -- 3b) default_unit/default_package kodlarini raftan coz (yoksa NULL/varsayilan).
    select id into v_unit from units where code = v_card->>'default_unit';
    select id into v_pkg  from burden_packages where code = v_card->>'default_package';

    -- 3c) Kart (expense_group). default_unit_id/default_package_id nullable, 2b'de.
    insert into expense_groups (budget_id, department_id, name, sort_order)
    values (v_budget, v_dept, v_card->>'name',
            coalesce((v_card->>'sort_order')::int, 0))
    returning id into v_group;

    -- 3d) Kalemler (items[]) -> budget_items. unit_net=0 (rakamsiz). cost_object BOS.
    --     quantity yok: Model A kararinca miktar budget_item_periods koprusunde.
    for v_item in select * from jsonb_array_elements(coalesce(v_card->'items', '[]'::jsonb))
    loop
      -- Kalem birimi: kalem kendi unit'ini soyleyebilir; yoksa kartin default (v_unit).
      -- v_item_unit ayri degisken — v_unit (kart default) bozulmaz, sonraki kalemde gerekli.
      v_item_unit := coalesce(
        (select id from units where code = v_item->>'unit'),
        v_unit
      );
      if v_item_unit is null then
        raise exception 'Birim bulunamadi: kart % kalem %',
          v_card->>'name', v_item->>'name';
      end if;

      -- Butce-bazli kalici item_code: item_code_seq monoton artirilir (geri donmez).
      -- max(item_code)+1 KULLANILMAZ — silinen kodu tekrar verir, kalici kimlik ihlali.
      update budgets set item_code_seq = item_code_seq + 1
       where id = v_budget returning item_code_seq into v_item_code;

      insert into budget_items
        (budget_id, group_id, item_code, name, detail, unit_net,
         unit_id, multiplier, package_id, sort_order)
      values
        (v_budget, v_group, v_item_code, v_item->>'name', v_item->>'detail',
         0, v_item_unit, coalesce((v_item->>'multiplier')::numeric, 1),
         coalesce((select id from burden_packages where code = v_item->>'package'), v_pkg),
         coalesce((v_item->>'sort_order')::int, 0))
      returning id into v_item_id;

      -- 3e) Paket -> item_burdens: paketin her bileseni icin GUNUN orani (rate_catalog
      --     en guncel valid_from <= bugun) kopyalanir. Paket yoksa yuk yok.
      -- v_item_pkg ayri degisken — v_pkg (kart default) bozulmaz, sonraki kalemde gerekli.
      v_item_pkg := coalesce(
        (select id from burden_packages where code = v_item->>'package'),
        v_pkg
      );
      if v_item_pkg is not null then
        for v_comp in select unnest(component_ids) from burden_packages where id = v_item_pkg
        loop
          select rate_percent into v_rate from rate_catalog
           where component_id = v_comp and valid_from <= v_today
           order by valid_from desc limit 1;
          if v_rate is not null then
            insert into item_burdens (budget_id, item_id, component_id, rate_percent)
            values (v_budget, v_item_id, v_comp, v_rate);
          end if;
        end loop;
      end if;
    end loop;
  end loop;

  -- 4) Yuzde satirlari (percent_lines[]). Yoksa varsayilan contingency 10 / profit 0.
  if v_body ? 'percent_lines' and jsonb_array_length(v_body->'percent_lines') > 0 then
    for v_pct in select * from jsonb_array_elements(v_body->'percent_lines')
    loop
      insert into budget_percent_lines (budget_id, code, label, rate_percent, is_hidden, sort_order)
      values (v_budget, v_pct->>'code', v_pct->>'label',
              coalesce((v_pct->>'rate_percent')::numeric, 0),
              coalesce((v_pct->>'is_hidden')::boolean, false),
              coalesce((v_pct->>'sort_order')::int, 0));
    end loop;
  else
    insert into budget_percent_lines (budget_id, code, label, rate_percent, sort_order)
    values (v_budget, 'contingency', 'Ongorulemeyen', 10, 1),
           (v_budget, 'profit', 'Kar', 0, 2);
  end if;

  return v_budget;
end;
$$;


ALTER FUNCTION public.fn_open_budget(p_project uuid, p_template uuid, p_scope text, p_episode_no integer) OWNER TO postgres;

--
-- Name: fn_receipt_correction_discipline(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_receipt_correction_discipline() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF OLD.correction_requested = true AND NEW.user_id = auth.uid() THEN
    IF NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.period_id IS DISTINCT FROM OLD.period_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.dept_id IS DISTINCT FROM OLD.dept_id
       OR NEW.parent_receipt_id IS DISTINCT FROM OLD.parent_receipt_id
       OR NEW.is_late_entry IS DISTINCT FROM OLD.is_late_entry
       OR NEW.gib_qr_verified IS DISTINCT FROM OLD.gib_qr_verified
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Duzeltme penceresinde bu alan degistirilemez';
    END IF;
    NEW.correction_requested := false;
    NEW.correction_note := NULL;
    NEW.status := 'submitted';
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_receipt_correction_discipline() OWNER TO postgres;

--
-- Name: fn_review_receipt(uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_review_receipt(p_receipt_id uuid, p_action text, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_role    text := public.user_role();
  v_dept    uuid := public.user_dept_id();
  v_project uuid := public.project_id();
  v_rec     receipts%ROWTYPE;
  v_status  text;
  v_log     text;
BEGIN
  IF p_action NOT IN ('approve','reject') THEN
    RAISE EXCEPTION 'Gecersiz aksiyon';
  END IF;

  SELECT * INTO v_rec FROM receipts WHERE id = p_receipt_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Fis bulunamadi'; END IF;

  IF v_rec.project_id IS DISTINCT FROM v_project THEN
    RAISE EXCEPTION 'Yetki yok: proje disi';
  END IF;

  IF v_role = 'dept' THEN
    IF v_rec.dept_id IS DISTINCT FROM v_dept OR v_rec.status <> 'dept_pending' THEN
      RAISE EXCEPTION 'Yetki yok: bu fisi inceleyemezsiniz';
    END IF;
    v_status := CASE p_action WHEN 'approve' THEN 'dept_approved' ELSE 'dept_rejected' END;
  ELSIF v_role = 'muhasebe' THEN
    IF v_rec.status NOT IN ('acc_pending','dept_approved') THEN
      RAISE EXCEPTION 'Yetki yok: fis muhasebe onayinda degil';
    END IF;
    v_status := CASE p_action WHEN 'approve' THEN 'acc_approved' ELSE 'acc_rejected' END;
  ELSE
    RAISE EXCEPTION 'Yetki yok: rol uygun degil';
  END IF;

  IF p_action = 'reject' AND (p_reason IS NULL OR btrim(p_reason) = '') THEN
    RAISE EXCEPTION 'Red sebebi zorunlu';
  END IF;

  v_log := CASE p_action WHEN 'approve' THEN 'approved' ELSE 'rejected' END;

  UPDATE receipts SET status = v_status, updated_at = now() WHERE id = p_receipt_id;

  INSERT INTO approval_log (receipt_id, approver_id, approver_role, action, reason)
  VALUES (p_receipt_id, v_uid, v_role, v_log,
          CASE WHEN p_action = 'reject' THEN btrim(p_reason) ELSE NULL END);
END;
$$;


ALTER FUNCTION public.fn_review_receipt(p_receipt_id uuid, p_action text, p_reason text) OWNER TO postgres;

--
-- Name: fn_route_receipt(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_route_receipt() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_role text := public.user_role();
  v_dept uuid := public.user_dept_id();
  v_has_chief boolean;
BEGIN
  IF v_role = 'saha' THEN
    NEW.dept_id := v_dept;
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE project_id = NEW.project_id
        AND dept_id = v_dept
        AND role = 'dept'
        AND membership_status = 'active'
    ) INTO v_has_chief;
    NEW.status := CASE WHEN v_has_chief THEN 'dept_pending' ELSE 'acc_pending' END;
  ELSIF v_role = 'dept' THEN
    NEW.dept_id := v_dept;
    NEW.status := 'acc_pending';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_route_receipt() OWNER TO postgres;

--
-- Name: fn_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at := now(); return new; end; $$;


ALTER FUNCTION public.fn_set_updated_at() OWNER TO postgres;

--
-- Name: project_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.project_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT ((auth.jwt() -> 'app_metadata') ->> 'project_id')::uuid
$$;


ALTER FUNCTION public.project_id() OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: user_dept_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_dept_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT ((auth.jwt() -> 'app_metadata') ->> 'dept_id')::uuid
$$;


ALTER FUNCTION public.user_dept_id() OWNER TO postgres;

--
-- Name: user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT (auth.jwt() -> 'app_metadata') ->> 'role'
$$;


ALTER FUNCTION public.user_role() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: advance_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advance_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    advance_id uuid NOT NULL,
    action text NOT NULL,
    actor_id uuid NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.advance_log OWNER TO postgres;

--
-- Name: advances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    period_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    status text DEFAULT 'pending'::text,
    approved_by uuid,
    approved_at timestamp with time zone,
    settlement_amount numeric(12,2),
    settlement_note text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT advances_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'settled'::text, 'partially_settled'::text])))
);


ALTER TABLE public.advances OWNER TO postgres;

--
-- Name: approval_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    receipt_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    approver_role text NOT NULL,
    action text NOT NULL,
    reason text,
    split_amount numeric(12,2),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT approval_log_action_check CHECK ((action = ANY (ARRAY['approved'::text, 'rejected'::text, 'split'::text, 'returned'::text, 'auto_approved'::text]))),
    CONSTRAINT approval_log_approver_role_check CHECK ((approver_role = ANY (ARRAY['dept'::text, 'muhasebe'::text])))
);


ALTER TABLE public.approval_log OWNER TO postgres;

--
-- Name: budget_baselines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_baselines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    snapshot jsonb NOT NULL,
    locked_by uuid DEFAULT auth.uid() NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.budget_baselines OWNER TO postgres;

--
-- Name: budget_change_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_change_log (
    id bigint NOT NULL,
    table_name text NOT NULL,
    row_id uuid NOT NULL,
    budget_id uuid,
    action text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    changed_by uuid DEFAULT auth.uid(),
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_change_log_action_check CHECK ((action = ANY (ARRAY['UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE public.budget_change_log OWNER TO postgres;

--
-- Name: budget_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_change_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.budget_change_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: budget_cost_objects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_cost_objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    code integer NOT NULL,
    name text NOT NULL,
    note text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_cost_objects_code_check CHECK ((code > 0))
);


ALTER TABLE public.budget_cost_objects OWNER TO postgres;

--
-- Name: TABLE budget_cost_objects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.budget_cost_objects IS 'cost_object (4. eksen, §4.10): transversal is/oge etiketi. Butce-bazli kontrollu liste; kart sinirini asan rollup icin. Satir-basina TEK (Faz 1).';


--
-- Name: budget_item_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_item_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    item_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    quantity numeric(12,4) DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_item_periods_quantity_check CHECK ((quantity >= (0)::numeric))
);


ALTER TABLE public.budget_item_periods OWNER TO postgres;

--
-- Name: budget_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    group_id uuid NOT NULL,
    item_code integer NOT NULL,
    name text NOT NULL,
    detail text,
    note text,
    unit_net numeric(14,2) DEFAULT 0 NOT NULL,
    unit_id uuid NOT NULL,
    multiplier numeric(12,4) DEFAULT 1 NOT NULL,
    package_id uuid,
    variance_note text,
    external_code text,
    is_active boolean DEFAULT true NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    vat_rate numeric(5,2) DEFAULT 20 NOT NULL,
    cost_object_id uuid,
    CONSTRAINT budget_items_item_code_check CHECK ((item_code > 0)),
    CONSTRAINT budget_items_multiplier_check CHECK ((multiplier >= (0)::numeric)),
    CONSTRAINT budget_items_unit_net_check CHECK ((unit_net >= (0)::numeric)),
    CONSTRAINT budget_items_vat_rate_check CHECK ((vat_rate >= (0)::numeric))
);


ALTER TABLE public.budget_items OWNER TO postgres;

--
-- Name: COLUMN budget_items.vat_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.budget_items.vat_rate IS 'B-KDV: satir KDV orani yuzde. Ongorulen NET taban; CFE net<->brut turetir. Yuk ile AYRI eksen.';


--
-- Name: COLUMN budget_items.cost_object_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.budget_items.cost_object_id IS 'cost_object (§4.10): satirin transversal is etiketi. NULL = etiketsiz (cogu satir). Composite-FK ayni-butce; restrict = kullanimdaki is silinemez.';


--
-- Name: budget_percent_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_percent_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    rate_percent numeric(7,4) DEFAULT 0 NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_percent_lines_code_check CHECK ((code = ANY (ARRAY['contingency'::text, 'profit'::text]))),
    CONSTRAINT budget_percent_lines_rate_percent_check CHECK ((rate_percent >= (0)::numeric))
);


ALTER TABLE public.budget_percent_lines OWNER TO postgres;

--
-- Name: budget_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_date date,
    end_date date,
    is_undated boolean DEFAULT false NOT NULL,
    CONSTRAINT budget_stages_date_order CHECK ((end_date >= start_date))
);


ALTER TABLE public.budget_stages OWNER TO postgres;

--
-- Name: COLUMN budget_stages.is_undated; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.budget_stages.is_undated IS '"Donemsiz" rezerve kovasi (fn_open_budget yaratir). true = muhur tarih-zorlamasindan muaf.';


--
-- Name: budget_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kind text NOT NULL,
    production_type text NOT NULL,
    scope text NOT NULL,
    label text NOT NULL,
    body jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    owner_project_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_templates_check CHECK (((kind = 'system'::text) = (owner_project_id IS NULL))),
    CONSTRAINT budget_templates_kind_check CHECK ((kind = ANY (ARRAY['system'::text, 'company'::text]))),
    CONSTRAINT budget_templates_production_type_check CHECK ((production_type = ANY (ARRAY['film'::text, 'dizi'::text, 'reklam'::text, 'belgesel'::text]))),
    CONSTRAINT budget_templates_scope_check CHECK ((scope = ANY (ARRAY['single'::text, 'season'::text, 'episode'::text])))
);


ALTER TABLE public.budget_templates OWNER TO postgres;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    scope text NOT NULL,
    episode_no integer,
    item_code_seq integer DEFAULT 0 NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budgets_check CHECK (((scope = 'episode'::text) = (episode_no IS NOT NULL))),
    CONSTRAINT budgets_episode_no_check CHECK ((episode_no > 0)),
    CONSTRAINT budgets_scope_check CHECK ((scope = ANY (ARRAY['single'::text, 'season'::text, 'episode'::text])))
);


ALTER TABLE public.budgets OWNER TO postgres;

--
-- Name: burden_components; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.burden_components (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.burden_components OWNER TO postgres;

--
-- Name: burden_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.burden_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    component_ids uuid[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.burden_packages OWNER TO postgres;

--
-- Name: chat_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_participants (
    chat_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.chat_participants OWNER TO postgres;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text,
    is_group boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    company_name text,
    company_logo_url text,
    project_logo_url text,
    project_name text,
    settings jsonb DEFAULT '{}'::jsonb,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.company_settings OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    chief_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    code text
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: COLUMN departments.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.departments.code IS 'Kanonik departman kodu (sablon department_code eslemesi). fn_open_budget bul-veya-olustur anahtari. Proje-bazli benzersiz.';


--
-- Name: dept_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dept_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period_id uuid NOT NULL,
    dept_id uuid NOT NULL,
    budget_amount numeric(14,2) NOT NULL,
    set_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.dept_budgets OWNER TO postgres;

--
-- Name: dept_subcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dept_subcategories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dept_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.dept_subcategories OWNER TO postgres;

--
-- Name: direct_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direct_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    budget_item_id uuid,
    kind text NOT NULL,
    description text NOT NULL,
    counterparty text,
    gross_amount numeric(14,2) NOT NULL,
    vat_rate numeric(5,2) DEFAULT 20 NOT NULL,
    vat_amount numeric(14,2) NOT NULL,
    net_amount numeric(14,2) NOT NULL,
    is_documented boolean DEFAULT true NOT NULL,
    attachment_path text,
    paid_at date NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT direct_payments_check CHECK (((net_amount + vat_amount) = gross_amount)),
    CONSTRAINT direct_payments_gross_amount_check CHECK ((gross_amount >= (0)::numeric)),
    CONSTRAINT direct_payments_kind_check CHECK ((kind = ANY (ARRAY['invoice'::text, 'contract'::text, 'payroll'::text, 'hand'::text]))),
    CONSTRAINT direct_payments_net_amount_check CHECK ((net_amount >= (0)::numeric)),
    CONSTRAINT direct_payments_vat_amount_check CHECK ((vat_amount >= (0)::numeric)),
    CONSTRAINT direct_payments_vat_rate_check CHECK ((vat_rate >= (0)::numeric))
);


ALTER TABLE public.direct_payments OWNER TO postgres;

--
-- Name: exception_permits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exception_permits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    period_id uuid NOT NULL,
    user_id uuid NOT NULL,
    granted_by uuid NOT NULL,
    permit_type text DEFAULT 'late_entry'::text,
    reason text NOT NULL,
    expires_at timestamp with time zone,
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT exception_permits_permit_type_check CHECK ((permit_type = ANY (ARRAY['late_entry'::text, 'reopen'::text, 'limit_override'::text])))
);


ALTER TABLE public.exception_permits OWNER TO postgres;

--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name text NOT NULL,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.expense_categories OWNER TO postgres;

--
-- Name: expense_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    department_id uuid NOT NULL,
    name text NOT NULL,
    icon text,
    default_unit_id uuid,
    default_package_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expense_groups OWNER TO postgres;

--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    dept_id uuid,
    token text NOT NULL,
    invited_by uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    CONSTRAINT invitations_role_check CHECK ((role = ANY (ARRAY['saha'::text, 'dept'::text, 'muhasebe'::text]))),
    CONSTRAINT invitations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'revoked'::text])))
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: item_burdens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_burdens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid NOT NULL,
    item_id uuid NOT NULL,
    component_id uuid NOT NULL,
    rate_percent numeric(7,4) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT item_burdens_rate_percent_check CHECK ((rate_percent >= (0)::numeric))
);


ALTER TABLE public.item_burdens OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    ref_type text,
    ref_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: period_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.period_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period_id uuid NOT NULL,
    total_budget numeric(14,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    set_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.period_budgets OWNER TO postgres;

--
-- Name: period_closings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.period_closings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period_id uuid NOT NULL,
    level text NOT NULL,
    user_id uuid NOT NULL,
    dept_id uuid,
    status text DEFAULT 'open'::text,
    summary jsonb,
    total_amount numeric(12,2),
    advance_balance numeric(12,2),
    receipt_count integer DEFAULT 0,
    submitted_at timestamp with time zone,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    override_reason text,
    reopen_count integer DEFAULT 0,
    last_reopened_at timestamp with time zone,
    reopen_reason text,
    is_late boolean DEFAULT false,
    notes text,
    CONSTRAINT period_closings_level_check CHECK ((level = ANY (ARRAY['saha'::text, 'dept'::text, 'acc'::text]))),
    CONSTRAINT period_closings_status_check CHECK ((status = ANY (ARRAY['open'::text, 'submitted'::text, 'approved'::text, 'disputed'::text, 'closed_by_override'::text, 'reopened'::text])))
);


ALTER TABLE public.period_closings OWNER TO postgres;

--
-- Name: periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    period_number integer NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'open'::text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    closed_by uuid,
    saha_deadline timestamp with time zone,
    dept_deadline timestamp with time zone,
    acc_deadline timestamp with time zone,
    rules_snapshot jsonb,
    close_declared_at timestamp with time zone,
    grace_until timestamp with time zone,
    CONSTRAINT periods_status_check CHECK ((status = ANY (ARRAY['open'::text, 'partially_closed'::text, 'closing'::text, 'closed'::text, 'permanently_closed'::text])))
);


ALTER TABLE public.periods OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    dept_id uuid,
    role text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    display_name text,
    phone text,
    avatar_url text,
    membership_status text DEFAULT 'active'::text NOT NULL,
    access_until timestamp with time zone,
    revoked_at timestamp with time zone,
    invited_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_readonly_access_until CHECK (((membership_status <> 'archived_readonly'::text) OR (access_until IS NOT NULL))),
    CONSTRAINT chk_role_dept_id CHECK (((role = 'muhasebe'::text) OR (dept_id IS NOT NULL))),
    CONSTRAINT profiles_membership_status_check CHECK ((membership_status = ANY (ARRAY['active'::text, 'archived_readonly'::text, 'revoked'::text]))),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['saha'::text, 'dept'::text, 'muhasebe'::text])))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: project_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    total_budget numeric(14,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    set_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.project_budgets OWNER TO postgres;

--
-- Name: project_dept_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_dept_budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    dept_id uuid NOT NULL,
    budget_amount numeric(14,2) NOT NULL,
    set_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.project_dept_budgets OWNER TO postgres;

--
-- Name: project_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    rule_category text NOT NULL,
    rule_key text NOT NULL,
    rule_value jsonb NOT NULL,
    effective_from timestamp with time zone DEFAULT now(),
    effective_until timestamp with time zone,
    set_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.project_rules OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active'::text NOT NULL,
    closed_at timestamp with time zone,
    closed_by uuid,
    production_type text,
    CONSTRAINT projects_production_type_check CHECK ((production_type = ANY (ARRAY['film'::text, 'dizi'::text, 'reklam'::text, 'belgesel'::text]))),
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['active'::text, 'closed'::text, 'archived'::text])))
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: COLUMN projects.production_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.production_type IS 'B8 tip secimi. NULL = eski proje; butce modulu ilk acilista sorar.';


--
-- Name: rate_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rate_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    component_id uuid NOT NULL,
    rate_percent numeric(7,4) NOT NULL,
    valid_from date NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rate_catalog_rate_percent_check CHECK ((rate_percent >= (0)::numeric))
);


ALTER TABLE public.rate_catalog OWNER TO postgres;

--
-- Name: receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    period_id uuid NOT NULL,
    user_id uuid NOT NULL,
    dept_id uuid,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    vat_amount numeric(12,2),
    category_id uuid,
    dept_subcategory_id uuid,
    description text,
    vendor_name text,
    receipt_date date,
    receipt_image_url text,
    invoice_file_url text,
    gib_qr_verified boolean DEFAULT false,
    status text DEFAULT 'submitted'::text,
    is_late_entry boolean DEFAULT false,
    is_documentless boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    parent_receipt_id uuid,
    receipt_no text,
    correction_requested boolean DEFAULT false NOT NULL,
    correction_note text,
    budget_item_id uuid,
    CONSTRAINT chk_parent_not_self CHECK (((parent_receipt_id IS NULL) OR (parent_receipt_id <> id))),
    CONSTRAINT receipts_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'dept_pending'::text, 'dept_approved'::text, 'dept_rejected'::text, 'acc_pending'::text, 'acc_approved'::text, 'acc_rejected'::text, 'split'::text])))
);


ALTER TABLE public.receipts OWNER TO postgres;

--
-- Name: COLUMN receipts.budget_item_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.receipts.budget_item_id IS 'B9: muhasebe onayinda kaleme eslesme. NULL = eslesmemis havuz. Ekran dogrudan yazamaz; koruma esleme RPC''siyle Dilim 5''te baglanir.';


--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: advance_log advance_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_log
    ADD CONSTRAINT advance_log_pkey PRIMARY KEY (id);


--
-- Name: advances advances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_pkey PRIMARY KEY (id);


--
-- Name: approval_log approval_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_pkey PRIMARY KEY (id);


--
-- Name: budget_baselines budget_baselines_budget_id_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_baselines
    ADD CONSTRAINT budget_baselines_budget_id_version_key UNIQUE (budget_id, version);


--
-- Name: budget_baselines budget_baselines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_baselines
    ADD CONSTRAINT budget_baselines_pkey PRIMARY KEY (id);


--
-- Name: budget_change_log budget_change_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_change_log
    ADD CONSTRAINT budget_change_log_pkey PRIMARY KEY (id);


--
-- Name: budget_cost_objects budget_cost_objects_budget_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_cost_objects
    ADD CONSTRAINT budget_cost_objects_budget_id_code_key UNIQUE (budget_id, code);


--
-- Name: budget_cost_objects budget_cost_objects_id_budget_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_cost_objects
    ADD CONSTRAINT budget_cost_objects_id_budget_id_key UNIQUE (id, budget_id);


--
-- Name: budget_cost_objects budget_cost_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_cost_objects
    ADD CONSTRAINT budget_cost_objects_pkey PRIMARY KEY (id);


--
-- Name: budget_item_periods budget_item_periods_item_id_stage_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_item_periods
    ADD CONSTRAINT budget_item_periods_item_id_stage_id_key UNIQUE (item_id, stage_id);


--
-- Name: budget_item_periods budget_item_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_item_periods
    ADD CONSTRAINT budget_item_periods_pkey PRIMARY KEY (id);


--
-- Name: budget_items budget_items_budget_id_item_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_budget_id_item_code_key UNIQUE (budget_id, item_code);


--
-- Name: budget_items budget_items_id_budget_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_id_budget_id_key UNIQUE (id, budget_id);


--
-- Name: budget_items budget_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_pkey PRIMARY KEY (id);


--
-- Name: budget_percent_lines budget_percent_lines_budget_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_percent_lines
    ADD CONSTRAINT budget_percent_lines_budget_id_code_key UNIQUE (budget_id, code);


--
-- Name: budget_percent_lines budget_percent_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_percent_lines
    ADD CONSTRAINT budget_percent_lines_pkey PRIMARY KEY (id);


--
-- Name: budget_stages budget_stages_id_budget_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_stages
    ADD CONSTRAINT budget_stages_id_budget_id_key UNIQUE (id, budget_id);


--
-- Name: budget_stages budget_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_stages
    ADD CONSTRAINT budget_stages_pkey PRIMARY KEY (id);


--
-- Name: budget_templates budget_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_templates
    ADD CONSTRAINT budget_templates_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_project_id_scope_episode_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_project_id_scope_episode_no_key UNIQUE NULLS NOT DISTINCT (project_id, scope, episode_no);


--
-- Name: burden_components burden_components_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.burden_components
    ADD CONSTRAINT burden_components_code_key UNIQUE (code);


--
-- Name: burden_components burden_components_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.burden_components
    ADD CONSTRAINT burden_components_pkey PRIMARY KEY (id);


--
-- Name: burden_packages burden_packages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.burden_packages
    ADD CONSTRAINT burden_packages_code_key UNIQUE (code);


--
-- Name: burden_packages burden_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.burden_packages
    ADD CONSTRAINT burden_packages_pkey PRIMARY KEY (id);


--
-- Name: chat_participants chat_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_pkey PRIMARY KEY (chat_id, user_id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_project_code_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_project_code_uniq UNIQUE (project_id, code);


--
-- Name: dept_budgets dept_budgets_period_dept_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_budgets
    ADD CONSTRAINT dept_budgets_period_dept_unique UNIQUE (period_id, dept_id);


--
-- Name: dept_budgets dept_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_budgets
    ADD CONSTRAINT dept_budgets_pkey PRIMARY KEY (id);


--
-- Name: dept_subcategories dept_subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_subcategories
    ADD CONSTRAINT dept_subcategories_pkey PRIMARY KEY (id);


--
-- Name: direct_payments direct_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direct_payments
    ADD CONSTRAINT direct_payments_pkey PRIMARY KEY (id);


--
-- Name: exception_permits exception_permits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exception_permits
    ADD CONSTRAINT exception_permits_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expense_groups expense_groups_id_budget_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_id_budget_id_key UNIQUE (id, budget_id);


--
-- Name: expense_groups expense_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_token_key UNIQUE (token);


--
-- Name: item_burdens item_burdens_item_id_component_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_burdens
    ADD CONSTRAINT item_burdens_item_id_component_id_key UNIQUE (item_id, component_id);


--
-- Name: item_burdens item_burdens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_burdens
    ADD CONSTRAINT item_burdens_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: period_budgets period_budgets_period_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_budgets
    ADD CONSTRAINT period_budgets_period_unique UNIQUE (period_id);


--
-- Name: period_budgets period_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_budgets
    ADD CONSTRAINT period_budgets_pkey PRIMARY KEY (id);


--
-- Name: period_closings period_closings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_closings
    ADD CONSTRAINT period_closings_pkey PRIMARY KEY (id);


--
-- Name: periods periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periods
    ADD CONSTRAINT periods_pkey PRIMARY KEY (id);


--
-- Name: periods periods_project_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periods
    ADD CONSTRAINT periods_project_number_unique UNIQUE (project_id, period_number);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_project_id_key UNIQUE (user_id, project_id);


--
-- Name: project_budgets project_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_pkey PRIMARY KEY (id);


--
-- Name: project_budgets project_budgets_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_project_id_key UNIQUE (project_id);


--
-- Name: project_dept_budgets project_dept_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_dept_budgets
    ADD CONSTRAINT project_dept_budgets_pkey PRIMARY KEY (id);


--
-- Name: project_dept_budgets project_dept_budgets_project_id_dept_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_dept_budgets
    ADD CONSTRAINT project_dept_budgets_project_id_dept_id_key UNIQUE (project_id, dept_id);


--
-- Name: project_rules project_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_rules
    ADD CONSTRAINT project_rules_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: rate_catalog rate_catalog_component_id_valid_from_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_catalog
    ADD CONSTRAINT rate_catalog_component_id_valid_from_key UNIQUE (component_id, valid_from);


--
-- Name: rate_catalog rate_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_catalog
    ADD CONSTRAINT rate_catalog_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: units units_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_code_key UNIQUE (code);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: idx_advance_log_advance; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advance_log_advance ON public.advance_log USING btree (advance_id);


--
-- Name: idx_advances_project_dept; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advances_project_dept ON public.advances USING btree (project_id, user_id, status);


--
-- Name: idx_advances_project_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advances_project_user ON public.advances USING btree (project_id, user_id);


--
-- Name: idx_approval_log_receipt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_log_receipt ON public.approval_log USING btree (receipt_id);


--
-- Name: idx_chat_participants_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_participants_user ON public.chat_participants USING btree (user_id);


--
-- Name: idx_dept_budgets_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dept_budgets_period ON public.dept_budgets USING btree (period_id, dept_id);


--
-- Name: idx_dept_subcategories_dept; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dept_subcategories_dept ON public.dept_subcategories USING btree (dept_id);


--
-- Name: idx_exception_permits_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exception_permits_user ON public.exception_permits USING btree (project_id, user_id, period_id);


--
-- Name: idx_invitations_project_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_project_email ON public.invitations USING btree (project_id, email);


--
-- Name: idx_invitations_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invitations_token ON public.invitations USING btree (token);


--
-- Name: idx_messages_chat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_chat ON public.messages USING btree (chat_id, created_at);


--
-- Name: idx_notifications_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_id, is_read);


--
-- Name: idx_period_closings_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_period_closings_period ON public.period_closings USING btree (period_id, user_id);


--
-- Name: idx_periods_project; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_periods_project ON public.periods USING btree (project_id);


--
-- Name: idx_profiles_project; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_project ON public.profiles USING btree (project_id);


--
-- Name: idx_profiles_project_dept; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_project_dept ON public.profiles USING btree (project_id, dept_id);


--
-- Name: idx_receipts_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_parent ON public.receipts USING btree (parent_receipt_id);


--
-- Name: idx_receipts_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_period ON public.receipts USING btree (period_id);


--
-- Name: idx_receipts_project_dept; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_project_dept ON public.receipts USING btree (project_id, dept_id);


--
-- Name: idx_receipts_project_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_project_status ON public.receipts USING btree (project_id, status);


--
-- Name: idx_receipts_project_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_receipts_project_user ON public.receipts USING btree (project_id, user_id);


--
-- Name: ix_changelog_budget; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_changelog_budget ON public.budget_change_log USING btree (budget_id, changed_at DESC);


--
-- Name: ix_changelog_row; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_changelog_row ON public.budget_change_log USING btree (table_name, row_id);


--
-- Name: uq_templates_system_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_templates_system_active ON public.budget_templates USING btree (production_type, scope) WHERE ((kind = 'system'::text) AND is_active);


--
-- Name: advances trg_advance_log; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_advance_log AFTER INSERT OR UPDATE ON public.advances FOR EACH ROW EXECUTE FUNCTION public.fn_log_advance();


--
-- Name: periods trg_assign_period_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_assign_period_number BEFORE INSERT ON public.periods FOR EACH ROW EXECUTE FUNCTION public.fn_assign_period_number();


--
-- Name: budgets trg_log_budgets; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_budgets AFTER DELETE OR UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: budget_cost_objects trg_log_cost_objects; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_cost_objects AFTER DELETE OR UPDATE ON public.budget_cost_objects FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: expense_groups trg_log_groups; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_groups AFTER DELETE OR UPDATE ON public.expense_groups FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: item_burdens trg_log_item_burdens; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_item_burdens AFTER DELETE OR UPDATE ON public.item_burdens FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: budget_item_periods trg_log_item_periods; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_item_periods AFTER DELETE OR UPDATE ON public.budget_item_periods FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: budget_items trg_log_items; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_items AFTER DELETE OR UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: burden_packages trg_log_packages; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_packages AFTER DELETE OR UPDATE ON public.burden_packages FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: direct_payments trg_log_payments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_payments AFTER DELETE OR UPDATE ON public.direct_payments FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: budget_percent_lines trg_log_percent_lines; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_percent_lines AFTER DELETE OR UPDATE ON public.budget_percent_lines FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: rate_catalog trg_log_rate_catalog; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_rate_catalog AFTER DELETE OR UPDATE ON public.rate_catalog FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: receipts trg_log_receipt_match; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_receipt_match AFTER UPDATE OF budget_item_id ON public.receipts FOR EACH ROW WHEN ((old.budget_item_id IS DISTINCT FROM new.budget_item_id)) EXECUTE FUNCTION public.fn_log_receipt_match();


--
-- Name: budget_stages trg_log_stages; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_stages AFTER DELETE OR UPDATE ON public.budget_stages FOR EACH ROW EXECUTE FUNCTION public.fn_log_budget_change();


--
-- Name: receipts trg_receipt_correction_discipline; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_receipt_correction_discipline BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.fn_receipt_correction_discipline();


--
-- Name: receipts trg_route_receipt; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_route_receipt BEFORE INSERT ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.fn_route_receipt();


--
-- Name: budgets trg_upd_budgets; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_budgets BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: budget_cost_objects trg_upd_cost_objects; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_cost_objects BEFORE UPDATE ON public.budget_cost_objects FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: expense_groups trg_upd_groups; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_groups BEFORE UPDATE ON public.expense_groups FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: item_burdens trg_upd_item_burdens; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_item_burdens BEFORE UPDATE ON public.item_burdens FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: budget_item_periods trg_upd_item_periods; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_item_periods BEFORE UPDATE ON public.budget_item_periods FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: budget_items trg_upd_items; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_items BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: direct_payments trg_upd_payments; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_payments BEFORE UPDATE ON public.direct_payments FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: budget_percent_lines trg_upd_percent_lines; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_percent_lines BEFORE UPDATE ON public.budget_percent_lines FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: budget_stages trg_upd_stages; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_upd_stages BEFORE UPDATE ON public.budget_stages FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


--
-- Name: advance_log advance_log_advance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advance_log
    ADD CONSTRAINT advance_log_advance_id_fkey FOREIGN KEY (advance_id) REFERENCES public.advances(id);


--
-- Name: advances advances_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: advances advances_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: advances advances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advances
    ADD CONSTRAINT advances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: approval_log approval_log_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES auth.users(id);


--
-- Name: approval_log approval_log_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_log
    ADD CONSTRAINT approval_log_receipt_id_fkey FOREIGN KEY (receipt_id) REFERENCES public.receipts(id);


--
-- Name: budget_baselines budget_baselines_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_baselines
    ADD CONSTRAINT budget_baselines_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: budget_cost_objects budget_cost_objects_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_cost_objects
    ADD CONSTRAINT budget_cost_objects_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: budget_item_periods budget_item_periods_item_id_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_item_periods
    ADD CONSTRAINT budget_item_periods_item_id_budget_id_fkey FOREIGN KEY (item_id, budget_id) REFERENCES public.budget_items(id, budget_id) ON DELETE CASCADE;


--
-- Name: budget_item_periods budget_item_periods_stage_id_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_item_periods
    ADD CONSTRAINT budget_item_periods_stage_id_budget_id_fkey FOREIGN KEY (stage_id, budget_id) REFERENCES public.budget_stages(id, budget_id) ON DELETE RESTRICT;


--
-- Name: budget_items budget_items_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: budget_items budget_items_cost_object_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_cost_object_fk FOREIGN KEY (cost_object_id, budget_id) REFERENCES public.budget_cost_objects(id, budget_id) ON DELETE RESTRICT;


--
-- Name: budget_items budget_items_group_id_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_group_id_budget_id_fkey FOREIGN KEY (group_id, budget_id) REFERENCES public.expense_groups(id, budget_id) ON DELETE RESTRICT;


--
-- Name: budget_items budget_items_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.burden_packages(id);


--
-- Name: budget_items budget_items_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: budget_percent_lines budget_percent_lines_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_percent_lines
    ADD CONSTRAINT budget_percent_lines_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: budget_stages budget_stages_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_stages
    ADD CONSTRAINT budget_stages_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: budget_templates budget_templates_owner_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_templates
    ADD CONSTRAINT budget_templates_owner_project_id_fkey FOREIGN KEY (owner_project_id) REFERENCES public.projects(id);


--
-- Name: budgets budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: chat_participants chat_participants_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- Name: chat_participants chat_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_participants
    ADD CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: chats chats_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: company_settings company_settings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: departments departments_chief_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_chief_id_fkey FOREIGN KEY (chief_id) REFERENCES auth.users(id);


--
-- Name: departments departments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: dept_budgets dept_budgets_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_budgets
    ADD CONSTRAINT dept_budgets_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id);


--
-- Name: dept_budgets dept_budgets_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_budgets
    ADD CONSTRAINT dept_budgets_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: dept_subcategories dept_subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_subcategories
    ADD CONSTRAINT dept_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: dept_subcategories dept_subcategories_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dept_subcategories
    ADD CONSTRAINT dept_subcategories_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id);


--
-- Name: direct_payments direct_payments_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direct_payments
    ADD CONSTRAINT direct_payments_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: direct_payments direct_payments_budget_item_id_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direct_payments
    ADD CONSTRAINT direct_payments_budget_item_id_budget_id_fkey FOREIGN KEY (budget_item_id, budget_id) REFERENCES public.budget_items(id, budget_id) ON DELETE RESTRICT;


--
-- Name: exception_permits exception_permits_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exception_permits
    ADD CONSTRAINT exception_permits_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: exception_permits exception_permits_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exception_permits
    ADD CONSTRAINT exception_permits_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: exception_permits exception_permits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exception_permits
    ADD CONSTRAINT exception_permits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: expense_categories expense_categories_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: expense_groups expense_groups_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE RESTRICT;


--
-- Name: expense_groups expense_groups_default_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_default_package_id_fkey FOREIGN KEY (default_package_id) REFERENCES public.burden_packages(id);


--
-- Name: expense_groups expense_groups_default_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_default_unit_id_fkey FOREIGN KEY (default_unit_id) REFERENCES public.units(id);


--
-- Name: expense_groups expense_groups_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_groups
    ADD CONSTRAINT expense_groups_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: invitations fk_invitations_dept; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT fk_invitations_dept FOREIGN KEY (dept_id) REFERENCES public.departments(id);


--
-- Name: invitations invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id);


--
-- Name: invitations invitations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: item_burdens item_burdens_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_burdens
    ADD CONSTRAINT item_burdens_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.burden_components(id);


--
-- Name: item_burdens item_burdens_item_id_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_burdens
    ADD CONSTRAINT item_burdens_item_id_budget_id_fkey FOREIGN KEY (item_id, budget_id) REFERENCES public.budget_items(id, budget_id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id);


--
-- Name: notifications notifications_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id);


--
-- Name: period_budgets period_budgets_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_budgets
    ADD CONSTRAINT period_budgets_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: period_closings period_closings_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.period_closings
    ADD CONSTRAINT period_closings_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: periods periods_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periods
    ADD CONSTRAINT periods_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: profiles profiles_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: project_budgets project_budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_dept_budgets project_dept_budgets_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_dept_budgets
    ADD CONSTRAINT project_dept_budgets_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id);


--
-- Name: project_dept_budgets project_dept_budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_dept_budgets
    ADD CONSTRAINT project_dept_budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_rules project_rules_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_rules
    ADD CONSTRAINT project_rules_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: rate_catalog rate_catalog_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_catalog
    ADD CONSTRAINT rate_catalog_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.burden_components(id);


--
-- Name: receipts receipts_budget_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_budget_item_id_fkey FOREIGN KEY (budget_item_id) REFERENCES public.budget_items(id) ON DELETE RESTRICT;


--
-- Name: receipts receipts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id);


--
-- Name: receipts receipts_dept_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_dept_id_fkey FOREIGN KEY (dept_id) REFERENCES public.departments(id);


--
-- Name: receipts receipts_dept_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_dept_subcategory_id_fkey FOREIGN KEY (dept_subcategory_id) REFERENCES public.dept_subcategories(id);


--
-- Name: receipts receipts_parent_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_parent_receipt_id_fkey FOREIGN KEY (parent_receipt_id) REFERENCES public.receipts(id);


--
-- Name: receipts receipts_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.periods(id);


--
-- Name: receipts receipts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: receipts receipts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: advance_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.advance_log ENABLE ROW LEVEL SECURITY;

--
-- Name: advance_log advance_log_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY advance_log_select ON public.advance_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.advances a
  WHERE ((a.id = advance_log.advance_id) AND (a.project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR (a.user_id = auth.uid()) OR ((public.user_role() = 'dept'::text) AND (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.user_id = a.user_id) AND (p.project_id = public.project_id()) AND (p.dept_id = public.user_dept_id()))))))))));


--
-- Name: advances; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

--
-- Name: advances advances_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY advances_insert ON public.advances FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'saha'::text) AND (user_id = auth.uid())));


--
-- Name: advances advances_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY advances_select ON public.advances FOR SELECT USING (((project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = advances.user_id) AND (p.project_id = public.project_id()) AND (p.dept_id = public.user_dept_id()))))) OR (user_id = auth.uid()))));


--
-- Name: advances advances_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY advances_update ON public.advances FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: approval_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.approval_log ENABLE ROW LEVEL SECURITY;

--
-- Name: approval_log approval_log_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY approval_log_select ON public.approval_log FOR SELECT USING (((public.user_role() = 'muhasebe'::text) OR (EXISTS ( SELECT 1
   FROM public.receipts r
  WHERE ((r.id = approval_log.receipt_id) AND (r.project_id = public.project_id()) AND ((r.user_id = auth.uid()) OR ((public.user_role() = 'dept'::text) AND (r.dept_id = public.user_dept_id()))))))));


--
-- Name: budget_baselines; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_baselines ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_change_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_change_log ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_cost_objects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_cost_objects ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_item_periods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_item_periods ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_percent_lines; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_percent_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_stages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: burden_components; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.burden_components ENABLE ROW LEVEL SECURITY;

--
-- Name: burden_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.burden_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_participants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_participants chat_participants_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_participants_insert ON public.chat_participants FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.chats c
  WHERE ((c.id = chat_participants.chat_id) AND (c.project_id = public.project_id()) AND ((c.created_by = auth.uid()) OR (public.user_role() = 'muhasebe'::text))))));


--
-- Name: chat_participants chat_participants_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_participants_select ON public.chat_participants FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chat_participants my_cp
  WHERE ((my_cp.chat_id = chat_participants.chat_id) AND (my_cp.user_id = auth.uid())))));


--
-- Name: chats; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

--
-- Name: chats chats_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chats_insert ON public.chats FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (created_by = auth.uid())));


--
-- Name: chats chats_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chats_select ON public.chats FOR SELECT USING (((project_id = public.project_id()) AND (EXISTS ( SELECT 1
   FROM public.chat_participants cp
  WHERE ((cp.chat_id = chats.id) AND (cp.user_id = auth.uid()))))));


--
-- Name: company_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: company_settings company_settings_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY company_settings_insert ON public.company_settings FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: company_settings company_settings_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY company_settings_select ON public.company_settings FOR SELECT USING ((project_id = public.project_id()));


--
-- Name: company_settings company_settings_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY company_settings_update ON public.company_settings FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: item_burdens del_burdens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_burdens ON public.item_burdens FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_cost_objects del_cost_objects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_cost_objects ON public.budget_cost_objects FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: expense_groups del_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_groups ON public.expense_groups FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_item_periods del_item_periods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_item_periods ON public.budget_item_periods FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_items del_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_items ON public.budget_items FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_stages del_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY del_stages ON public.budget_stages FOR DELETE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_insert ON public.departments FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: departments departments_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_select ON public.departments FOR SELECT USING ((project_id = public.project_id()));


--
-- Name: departments departments_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY departments_update ON public.departments FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: dept_budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dept_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: dept_budgets dept_budgets_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_budgets_insert ON public.dept_budgets FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = dept_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: dept_budgets dept_budgets_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_budgets_select ON public.dept_budgets FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = dept_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: dept_budgets dept_budgets_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_budgets_update ON public.dept_budgets FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = dept_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: dept_subcategories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dept_subcategories ENABLE ROW LEVEL SECURITY;

--
-- Name: dept_subcategories dept_subcategories_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_subcategories_insert ON public.dept_subcategories FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.departments d
  WHERE ((d.id = dept_subcategories.dept_id) AND (d.project_id = public.project_id())))) AND ((dept_id = public.user_dept_id()) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: dept_subcategories dept_subcategories_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_subcategories_select ON public.dept_subcategories FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.departments d
  WHERE ((d.id = dept_subcategories.dept_id) AND (d.project_id = public.project_id())))) AND ((dept_id = public.user_dept_id()) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: dept_subcategories dept_subcategories_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY dept_subcategories_update ON public.dept_subcategories FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.departments d
  WHERE ((d.id = dept_subcategories.dept_id) AND (d.project_id = public.project_id())))) AND ((dept_id = public.user_dept_id()) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: direct_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.direct_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: exception_permits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.exception_permits ENABLE ROW LEVEL SECURITY;

--
-- Name: exception_permits exception_permits_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exception_permits_insert ON public.exception_permits FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = ANY (ARRAY['muhasebe'::text, 'dept'::text]))));


--
-- Name: exception_permits exception_permits_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exception_permits_select ON public.exception_permits FOR SELECT USING (((project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR (user_id = auth.uid()))));


--
-- Name: exception_permits exception_permits_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exception_permits_update ON public.exception_permits FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: expense_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: expense_categories expense_categories_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expense_categories_insert ON public.expense_categories FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: expense_categories expense_categories_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expense_categories_select ON public.expense_categories FOR SELECT USING ((project_id = public.project_id()));


--
-- Name: expense_categories expense_categories_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expense_categories_update ON public.expense_categories FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: expense_groups; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_baselines ins_baselines; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_baselines ON public.budget_baselines FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budgets ins_budgets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_budgets ON public.budgets FOR INSERT TO authenticated WITH CHECK (public.fn_is_project_muhasebe(project_id));


--
-- Name: item_burdens ins_burdens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_burdens ON public.item_burdens FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_cost_objects ins_cost_objects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_cost_objects ON public.budget_cost_objects FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: expense_groups ins_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_groups ON public.expense_groups FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_item_periods ins_item_periods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_item_periods ON public.budget_item_periods FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_items ins_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_items ON public.budget_items FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: direct_payments ins_payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_payments ON public.direct_payments FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_percent_lines ins_plines; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_plines ON public.budget_percent_lines FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_stages ins_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ins_stages ON public.budget_stages FOR INSERT TO authenticated WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: invitations invitations_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_insert ON public.invitations FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (invited_by = auth.uid()) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id()) AND (role = 'saha'::text)))));


--
-- Name: invitations invitations_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_select ON public.invitations FOR SELECT USING (((project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id())))));


--
-- Name: invitations invitations_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY invitations_update ON public.invitations FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: item_burdens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.item_burdens ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY messages_insert ON public.messages FOR INSERT WITH CHECK (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.chat_participants cp
  WHERE ((cp.chat_id = messages.chat_id) AND (cp.user_id = auth.uid()))))));


--
-- Name: messages messages_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY messages_select ON public.messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chat_participants cp
  WHERE ((cp.chat_id = messages.chat_id) AND (cp.user_id = auth.uid())))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (((project_id = public.project_id()) AND (recipient_id = auth.uid())));


--
-- Name: notifications notifications_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (((project_id = public.project_id()) AND (recipient_id = auth.uid())));


--
-- Name: period_budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.period_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: period_budgets period_budgets_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY period_budgets_insert ON public.period_budgets FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = period_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: period_budgets period_budgets_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY period_budgets_select ON public.period_budgets FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = period_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: period_budgets period_budgets_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY period_budgets_update ON public.period_budgets FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = period_budgets.period_id) AND (p.project_id = public.project_id())))) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: period_closings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.period_closings ENABLE ROW LEVEL SECURITY;

--
-- Name: period_closings period_closings_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY period_closings_select ON public.period_closings FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = period_closings.period_id) AND (p.project_id = public.project_id())))) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id())) OR (user_id = auth.uid()))));


--
-- Name: period_closings period_closings_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY period_closings_update ON public.period_closings FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = period_closings.period_id) AND (p.project_id = public.project_id())))) AND (((user_id = auth.uid()) AND (level = public.user_role())) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: periods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

--
-- Name: periods periods_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY periods_insert ON public.periods FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: periods periods_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY periods_select ON public.periods FOR SELECT USING ((project_id = public.project_id()));


--
-- Name: periods periods_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY periods_update ON public.periods FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: profiles profiles_own_list; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_own_list ON public.profiles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (((project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id())) OR (user_id = auth.uid()))));


--
-- Name: profiles profiles_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (((project_id = public.project_id()) AND ((user_id = auth.uid()) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: project_budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: project_budgets project_budgets_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_budgets_insert ON public.project_budgets FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_budgets project_budgets_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_budgets_select ON public.project_budgets FOR SELECT USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_budgets project_budgets_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_budgets_update ON public.project_budgets FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_dept_budgets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.project_dept_budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: project_dept_budgets project_dept_budgets_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_dept_budgets_insert ON public.project_dept_budgets FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_dept_budgets project_dept_budgets_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_dept_budgets_select ON public.project_dept_budgets FOR SELECT USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_dept_budgets project_dept_budgets_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_dept_budgets_update ON public.project_dept_budgets FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_rules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.project_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: project_rules project_rules_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_rules_insert ON public.project_rules FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: project_rules project_rules_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_rules_select ON public.project_rules FOR SELECT USING ((project_id = public.project_id()));


--
-- Name: project_rules project_rules_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY project_rules_update ON public.project_rules FOR UPDATE USING (((project_id = public.project_id()) AND (public.user_role() = 'muhasebe'::text)));


--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: projects projects_own_list; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY projects_own_list ON public.projects FOR SELECT USING (((status = 'active'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.project_id = projects.id) AND (p.user_id = auth.uid()) AND (p.membership_status = 'active'::text))))));


--
-- Name: rate_catalog; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rate_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: receipts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: receipts receipts_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY receipts_insert ON public.receipts FOR INSERT WITH CHECK (((project_id = public.project_id()) AND (public.user_role() = ANY (ARRAY['saha'::text, 'dept'::text])) AND (user_id = auth.uid()) AND (status = ANY (ARRAY['submitted'::text, 'dept_pending'::text, 'acc_pending'::text])) AND ((EXISTS ( SELECT 1
   FROM public.periods p
  WHERE ((p.id = receipts.period_id) AND (p.project_id = public.project_id()) AND (p.status = ANY (ARRAY['open'::text, 'closing'::text]))))) OR (EXISTS ( SELECT 1
   FROM public.exception_permits ep
  WHERE ((ep.period_id = receipts.period_id) AND (ep.user_id = auth.uid()) AND (ep.project_id = public.project_id()) AND (ep.permit_type = 'late_entry'::text) AND (ep.is_used = false) AND ((ep.expires_at IS NULL) OR (ep.expires_at > now()))))))));


--
-- Name: receipts receipts_saha_correction; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY receipts_saha_correction ON public.receipts FOR UPDATE TO authenticated USING (((user_id = auth.uid()) AND (correction_requested = true) AND (EXISTS ( SELECT 1
   FROM public.periods pp
  WHERE ((pp.id = receipts.period_id) AND (pp.status = ANY (ARRAY['open'::text, 'closing'::text]))))))) WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.periods pp
  WHERE ((pp.id = receipts.period_id) AND (pp.status = ANY (ARRAY['open'::text, 'closing'::text])))))));


--
-- Name: receipts receipts_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY receipts_select ON public.receipts FOR SELECT USING (((project_id = public.project_id()) AND ((public.user_role() = 'muhasebe'::text) OR ((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id())) OR (user_id = auth.uid()))));


--
-- Name: receipts receipts_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY receipts_update ON public.receipts FOR UPDATE USING (((project_id = public.project_id()) AND (((public.user_role() = 'dept'::text) AND (dept_id = public.user_dept_id()) AND (status = 'dept_pending'::text)) OR (public.user_role() = 'muhasebe'::text))));


--
-- Name: budget_baselines sel_baselines; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_baselines ON public.budget_baselines FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budgets sel_budgets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_budgets ON public.budgets FOR SELECT TO authenticated USING (public.fn_is_project_muhasebe(project_id));


--
-- Name: item_burdens sel_burdens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_burdens ON public.item_burdens FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_change_log sel_changelog; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_changelog ON public.budget_change_log FOR SELECT TO authenticated USING (((budget_id IS NULL) OR public.fn_is_budget_muhasebe(budget_id)));


--
-- Name: burden_components sel_components; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_components ON public.burden_components FOR SELECT TO authenticated USING (true);


--
-- Name: budget_cost_objects sel_cost_objects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_cost_objects ON public.budget_cost_objects FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: expense_groups sel_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_groups ON public.expense_groups FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_item_periods sel_item_periods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_item_periods ON public.budget_item_periods FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_items sel_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_items ON public.budget_items FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: burden_packages sel_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_packages ON public.burden_packages FOR SELECT TO authenticated USING (true);


--
-- Name: direct_payments sel_payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_payments ON public.direct_payments FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_percent_lines sel_plines; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_plines ON public.budget_percent_lines FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: rate_catalog sel_rates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_rates ON public.rate_catalog FOR SELECT TO authenticated USING (true);


--
-- Name: budget_stages sel_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_stages ON public.budget_stages FOR SELECT TO authenticated USING (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_templates sel_templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_templates ON public.budget_templates FOR SELECT TO authenticated USING (((kind = 'system'::text) OR ((owner_project_id IS NOT NULL) AND public.fn_is_project_muhasebe(owner_project_id))));


--
-- Name: units sel_units; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sel_units ON public.units FOR SELECT TO authenticated USING (true);


--
-- Name: units; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

--
-- Name: budgets upd_budgets; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_budgets ON public.budgets FOR UPDATE TO authenticated USING (public.fn_is_project_muhasebe(project_id)) WITH CHECK (public.fn_is_project_muhasebe(project_id));


--
-- Name: item_burdens upd_burdens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_burdens ON public.item_burdens FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_cost_objects upd_cost_objects; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_cost_objects ON public.budget_cost_objects FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: expense_groups upd_groups; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_groups ON public.expense_groups FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_item_periods upd_item_periods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_item_periods ON public.budget_item_periods FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_items upd_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_items ON public.budget_items FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: direct_payments upd_payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_payments ON public.direct_payments FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_percent_lines upd_plines; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_plines ON public.budget_percent_lines FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: budget_stages upd_stages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY upd_stages ON public.budget_stages FOR UPDATE TO authenticated USING (public.fn_is_budget_muhasebe(budget_id)) WITH CHECK (public.fn_is_budget_muhasebe(budget_id));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION clear_user_claims(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.clear_user_claims(p_user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.clear_user_claims(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION fn_create_project(p_name text, p_company_name text, p_first_name text, p_last_name text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.fn_create_project(p_name text, p_company_name text, p_first_name text, p_last_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fn_create_project(p_name text, p_company_name text, p_first_name text, p_last_name text) TO authenticated;


--
-- Name: FUNCTION fn_open_budget(p_project uuid, p_template uuid, p_scope text, p_episode_no integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.fn_open_budget(p_project uuid, p_template uuid, p_scope text, p_episode_no integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fn_open_budget(p_project uuid, p_template uuid, p_scope text, p_episode_no integer) TO authenticated;


--
-- Name: FUNCTION fn_review_receipt(p_receipt_id uuid, p_action text, p_reason text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.fn_review_receipt(p_receipt_id uuid, p_action text, p_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.fn_review_receipt(p_receipt_id uuid, p_action text, p_reason text) TO authenticated;


--
-- Name: TABLE advance_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.advance_log TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.advance_log TO authenticated;
GRANT ALL ON TABLE public.advance_log TO service_role;


--
-- Name: TABLE advances; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.advances TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.advances TO authenticated;
GRANT ALL ON TABLE public.advances TO service_role;


--
-- Name: TABLE approval_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.approval_log TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.approval_log TO authenticated;
GRANT ALL ON TABLE public.approval_log TO service_role;


--
-- Name: TABLE budget_baselines; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_baselines TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_baselines TO authenticated;
GRANT ALL ON TABLE public.budget_baselines TO service_role;


--
-- Name: TABLE budget_change_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_change_log TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_change_log TO authenticated;
GRANT ALL ON TABLE public.budget_change_log TO service_role;


--
-- Name: TABLE budget_cost_objects; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_cost_objects TO anon;
GRANT ALL ON TABLE public.budget_cost_objects TO authenticated;
GRANT ALL ON TABLE public.budget_cost_objects TO service_role;


--
-- Name: TABLE budget_item_periods; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_item_periods TO anon;
GRANT ALL ON TABLE public.budget_item_periods TO authenticated;
GRANT ALL ON TABLE public.budget_item_periods TO service_role;


--
-- Name: TABLE budget_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_items TO anon;
GRANT ALL ON TABLE public.budget_items TO authenticated;
GRANT ALL ON TABLE public.budget_items TO service_role;


--
-- Name: TABLE budget_percent_lines; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_percent_lines TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.budget_percent_lines TO authenticated;
GRANT ALL ON TABLE public.budget_percent_lines TO service_role;


--
-- Name: TABLE budget_stages; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_stages TO anon;
GRANT ALL ON TABLE public.budget_stages TO authenticated;
GRANT ALL ON TABLE public.budget_stages TO service_role;


--
-- Name: TABLE budget_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_templates TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budget_templates TO authenticated;
GRANT ALL ON TABLE public.budget_templates TO service_role;


--
-- Name: TABLE budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.budgets TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.budgets TO authenticated;
GRANT ALL ON TABLE public.budgets TO service_role;


--
-- Name: TABLE burden_components; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.burden_components TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.burden_components TO authenticated;
GRANT ALL ON TABLE public.burden_components TO service_role;


--
-- Name: TABLE burden_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.burden_packages TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.burden_packages TO authenticated;
GRANT ALL ON TABLE public.burden_packages TO service_role;


--
-- Name: TABLE chat_participants; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.chat_participants TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.chat_participants TO authenticated;
GRANT ALL ON TABLE public.chat_participants TO service_role;


--
-- Name: TABLE chats; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.chats TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.chats TO authenticated;
GRANT ALL ON TABLE public.chats TO service_role;


--
-- Name: TABLE company_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.company_settings TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.company_settings TO authenticated;
GRANT ALL ON TABLE public.company_settings TO service_role;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.departments TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;


--
-- Name: TABLE dept_budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.dept_budgets TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.dept_budgets TO authenticated;
GRANT ALL ON TABLE public.dept_budgets TO service_role;


--
-- Name: TABLE dept_subcategories; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.dept_subcategories TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.dept_subcategories TO authenticated;
GRANT ALL ON TABLE public.dept_subcategories TO service_role;


--
-- Name: TABLE direct_payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.direct_payments TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.direct_payments TO authenticated;
GRANT ALL ON TABLE public.direct_payments TO service_role;


--
-- Name: TABLE exception_permits; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.exception_permits TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.exception_permits TO authenticated;
GRANT ALL ON TABLE public.exception_permits TO service_role;


--
-- Name: TABLE expense_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.expense_categories TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.expense_categories TO authenticated;
GRANT ALL ON TABLE public.expense_categories TO service_role;


--
-- Name: TABLE expense_groups; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.expense_groups TO anon;
GRANT ALL ON TABLE public.expense_groups TO authenticated;
GRANT ALL ON TABLE public.expense_groups TO service_role;


--
-- Name: TABLE invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.invitations TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.invitations TO authenticated;
GRANT ALL ON TABLE public.invitations TO service_role;


--
-- Name: TABLE item_burdens; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.item_burdens TO anon;
GRANT ALL ON TABLE public.item_burdens TO authenticated;
GRANT ALL ON TABLE public.item_burdens TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.messages TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.notifications TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE period_budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.period_budgets TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.period_budgets TO authenticated;
GRANT ALL ON TABLE public.period_budgets TO service_role;


--
-- Name: TABLE period_closings; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.period_closings TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.period_closings TO authenticated;
GRANT ALL ON TABLE public.period_closings TO service_role;


--
-- Name: TABLE periods; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.periods TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.periods TO authenticated;
GRANT ALL ON TABLE public.periods TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.profiles TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE project_budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.project_budgets TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.project_budgets TO authenticated;
GRANT ALL ON TABLE public.project_budgets TO service_role;


--
-- Name: TABLE project_dept_budgets; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.project_dept_budgets TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.project_dept_budgets TO authenticated;
GRANT ALL ON TABLE public.project_dept_budgets TO service_role;


--
-- Name: TABLE project_rules; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.project_rules TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.project_rules TO authenticated;
GRANT ALL ON TABLE public.project_rules TO service_role;


--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.projects TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;


--
-- Name: TABLE rate_catalog; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.rate_catalog TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.rate_catalog TO authenticated;
GRANT ALL ON TABLE public.rate_catalog TO service_role;


--
-- Name: TABLE receipts; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.receipts TO anon;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.receipts TO authenticated;
GRANT ALL ON TABLE public.receipts TO service_role;


--
-- Name: TABLE units; Type: ACL; Schema: public; Owner: postgres
--

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.units TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.units TO authenticated;
GRANT ALL ON TABLE public.units TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict ogV05n8FualEQizM6SP0hdDSpi1fbCQIkbFPnD9kw0PO79X8OU3Lm3J2MDQnAfS


CREATE EVENT TRIGGER ensure_rls ON ddl_command_end WHEN TAG IN ('CREATE TABLE','CREATE TABLE AS','SELECT INTO') EXECUTE FUNCTION public.rls_auto_enable();
