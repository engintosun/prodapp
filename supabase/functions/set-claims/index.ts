import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Yetkilendirme başlığı yok' }, 401)

    const body = await req.json().catch(() => ({}))
    const projectId = body?.project_id
    if (!projectId || typeof projectId !== 'string') {
      return json({ error: 'project_id zorunlu' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) return json({ error: 'Geçersiz oturum' }, 401)
    const uid = userData.user.id

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: profile, error: profErr } = await admin
      .from('profiles')
      .select('project_id, role, dept_id')
      .eq('id', uid)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .is('soft_deleted_at', null)
      .maybeSingle()

    if (profErr) return json({ error: 'Profil sorgusu başarısız' }, 500)
    if (!profile) return json({ error: 'Bu projede aktif profiliniz yok' }, 403)

    const { error: updErr } = await admin.auth.admin.updateUserById(uid, {
      app_metadata: {
        project_id: profile.project_id,
        role: profile.role,
        dept_id: profile.dept_id,
      },
    })
    if (updErr) return json({ error: 'Claims yazılamadı' }, 500)

    return json({ ok: true, project_id: profile.project_id, role: profile.role }, 200)
  } catch (_e) {
    return json({ error: 'Beklenmeyen hata' }, 500)
  }
})
