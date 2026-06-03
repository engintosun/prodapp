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
    const body = await req.json().catch(() => ({}))
    const { token, email, password } = body ?? {}

    if (
      !token || typeof token !== 'string' ||
      !email || typeof email !== 'string' ||
      !password || typeof password !== 'string' ||
      password.length < 8
    ) {
      return json({ error: 'Eksik veya gecersiz alan' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const admin = createClient(supabaseUrl, serviceKey)

    // 1. Token ile daveti bul
    const { data: inv, error: invErr } = await admin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (invErr) return json({ error: 'Davet sorgusu basarisiz' }, 500)
    if (!inv) return json({ error: 'Davet bulunamadi' }, 404)

    // 2. Durum kontrolu
    if (inv.status !== 'pending') return json({ error: 'Davet gecersiz veya kullanilmis' }, 400)

    // 3. Sure kontrolu
    if (new Date(inv.expires_at) < new Date()) {
      await admin.from('invitations').update({ status: 'expired' }).eq('id', inv.id)
      return json({ error: 'Davet suresi dolmus' }, 400)
    }

    // 4. E-posta eslesme kontrolu
    if (email.toLowerCase() !== inv.email.toLowerCase()) {
      return json({ error: 'E-posta davetle eslesmiyor' }, 400)
    }

    // 5. Kullanici olustur
    const { data: newUserData, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        project_id: inv.project_id,
        role: inv.role,
        dept_id: inv.dept_id,
      },
    })

    if (createErr || !newUserData?.user) {
      return json({ error: 'Bu e-posta zaten kayitli' }, 409)
    }

    const newUserId = newUserData.user.id

    // 6. Profil ekle
    const { error: profileErr } = await admin.from('profiles').insert({
      user_id: newUserId,
      project_id: inv.project_id,
      role: inv.role,
      dept_id: inv.dept_id,
      first_name: inv.first_name,
      last_name: inv.last_name,
      membership_status: 'active',
      invited_by: inv.invited_by,
    })

    if (profileErr) {
      await admin.auth.admin.deleteUser(newUserId)
      return json({ error: 'Profil olusturulamadi' }, 500)
    }

    // 7. Daveti guncelle
    await admin
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', inv.id)

    // 8. Basari
    return json({ ok: true, email }, 200)
  } catch (_e) {
    return json({ error: 'Beklenmeyen hata' }, 500)
  }
})
