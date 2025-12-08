import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const results = []

    // Usuário 1: Admin principal (djalmeidajunior@gmail.com)
    try {
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: 'djalmeidajunior@gmail.com',
        password: '2728',
        email_confirm: true,
        user_metadata: {
          role: 'admin'
        }
      })

      if (adminError) {
        console.log('Admin user might already exist:', adminError.message)
        results.push({ email: 'djalmeidajunior@gmail.com', status: 'exists or error', message: adminError.message })
      } else {
        // Adicionar role de admin
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: adminUser.user.id,
            role: 'admin'
          })

        if (roleError) {
          console.log('Role might already exist:', roleError.message)
        }
        results.push({ email: 'djalmeidajunior@gmail.com', status: 'created', role: 'admin' })
      }
    } catch (err) {
      console.error('Error creating admin user:', err)
      results.push({ email: 'djalmeidajunior@gmail.com', status: 'error', message: String(err) })
    }

    // Usuário 2: Editor/Colaborador (colaborador@luande.com)
    try {
      const { data: editorUser, error: editorError } = await supabaseAdmin.auth.admin.createUser({
        email: 'colaborador@luande.com',
        password: 'admin123@',
        email_confirm: true,
        user_metadata: {
          role: 'editor'
        }
      })

      if (editorError) {
        console.log('Editor user might already exist:', editorError.message)
        results.push({ email: 'colaborador@luande.com', status: 'exists or error', message: editorError.message })
      } else {
        // Adicionar role de editor
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: editorUser.user.id,
            role: 'editor'
          })

        if (roleError) {
          console.log('Role might already exist:', roleError.message)
        }
        results.push({ email: 'colaborador@luande.com', status: 'created', role: 'editor' })
      }
    } catch (err) {
      console.error('Error creating editor user:', err)
      results.push({ email: 'colaborador@luande.com', status: 'error', message: String(err) })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuários processados!',
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const error = err as Error
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
