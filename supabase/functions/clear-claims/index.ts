import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Yetkilendirme yok' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'Kullanici bulunamadi' }, 401)

    const currentMeta = (user.app_metadata ?? {}) as Record<string, unknown>
    const { project_id: _p, role: _r, dept_id: _d, ...rest } = currentMeta

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { error: updErr } = await adminClient.auth.admin.updateUserById(user.id, {
      app_metadata: rest,
    })
    if (updErr) return json({ error: 'Claims temizlenemedi' }, 500)

    return json({ ok: true }, 200)
  } catch (_e) {
    return json({ error: 'Beklenmeyen hata' }, 500)
  }
})
