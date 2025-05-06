
// Versão corrigida para Deno/Edge Functions do Supabase
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Configure CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client with service role key
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

    // Verify the request is authenticated
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate the JWT is from an authenticated user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !callerUser) {
      console.error('Error getting user:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized request' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the caller is a super_admin by checking their profile
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (profileError || !callerProfile || callerProfile.role !== 'super_admin') {
      console.error('Error getting profile or not super admin:', profileError)
      return new Response(JSON.stringify({ error: 'Only super admins can create admin users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the request payload
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: 'Email, password and username are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Creating admin user: ${email}, ${username}`)

    // Create the user with admin service role
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      return new Response(JSON.stringify({ error: createUserError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!userData.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Inserir na tabela de perfis
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        username: username,
        role: 'admin'
      })

    if (profileInsertError) {
      console.error('Error creating profile:', profileInsertError)
    }

    // Create admin relationship
    const { error: relationshipError } = await supabaseAdmin
      .from('admin_relationships')
      .insert({
        super_admin_id: callerUser.id,
        admin_id: userData.user.id
      })

    if (relationshipError) {
      console.error('Error creating admin relationship:', relationshipError)
      // Even if this fails, the user has been created, so we consider this a partial success
      return new Response(JSON.stringify({ 
        user: userData.user, 
        warning: 'User created but relationship not saved' 
      }), {
        status: 207,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      user: userData.user,
      message: 'Admin user created successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in create-admin-user function:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
