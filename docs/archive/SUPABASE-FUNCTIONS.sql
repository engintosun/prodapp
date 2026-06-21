-- ============================================================
-- PRODAPP Server-side Admin Functions v1.0
-- Bu dosyadaki fonksiyonlar SECURITY DEFINER ile calisir.
-- Sadece service_role uzerinden cagirilabilir (Edge Functions).
-- Canli uygulama: Supabase SQL Editor > yapistir > Run (bir kerelik).
-- ============================================================

CREATE OR REPLACE FUNCTION public.clear_user_claims(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $clearfn$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) - 'project_id' - 'role' - 'dept_id'
  WHERE id = p_user_id;
END;
$clearfn$;

-- Fonksiyonu sadece service_role cagirsin (authenticated/anon erisemesin)
REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.clear_user_claims(UUID) FROM anon;
GRANT  EXECUTE ON FUNCTION public.clear_user_claims(UUID) TO service_role;
