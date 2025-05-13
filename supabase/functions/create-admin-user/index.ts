
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define Supabase client options
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// CORS headers for browser-based requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const corsResponse = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  try {
    // Initialize the Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the email from the request body
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Email válido é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Generate a random password
    const password = Math.random().toString(36).slice(2, 10) + 
                     Math.random().toString(36).slice(2, 10).toUpperCase() + 
                     Math.random().toString(36).slice(2, 4) + 
                     '!@#';
    
    // Check if the user exists
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId;
    
    if (!fetchError && existingUser) {
      // User exists - use their ID
      userId = existingUser.user.id;
      console.log('User exists:', userId);
    } else {
      // Create a new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { role: 'admin' }
      });
      
      if (createError || !newUser?.user) {
        throw new Error(createError?.message || 'Failed to create user');
      }
      
      userId = newUser.user.id;
      console.log('Created user:', userId);
      
      // Create a profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          role: 'admin',
          username: `Admin (${email.split('@')[0]})` 
        });
        
      if (profileError) {
        throw new Error(profileError.message || 'Failed to create profile');
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Admin user created or found'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
