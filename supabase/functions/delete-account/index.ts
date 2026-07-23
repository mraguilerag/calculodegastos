// Edge Function: borra por completo la cuenta del usuario que llama (no acepta
// un userId externo — siempre borra "quien soy yo" segun el JWT verificado).
//
// Al borrar la fila de auth.users, el "on delete cascade" de profiles/
// categories/expenses (ver supabase/schema.sql) limpia el resto de los datos
// automaticamente.
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los provee Supabase automaticamente
// a toda Edge Function desplegada - no hace falta configurarlos a mano.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Falta autenticacion.' }, 401)
  }

  try {
    // Cliente con el JWT de quien llama: sirve solo para verificar su identidad.
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      return jsonResponse({ error: 'Sesion invalida o expirada.' }, 401)
    }

    // Cliente con la service role: el unico con permiso para borrar usuarios.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return jsonResponse({ error: deleteError.message }, 500)
    }

    return jsonResponse({ ok: true }, 200)
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error inesperado.' }, 500)
  }
})
