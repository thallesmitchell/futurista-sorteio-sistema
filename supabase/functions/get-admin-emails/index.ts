
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
    
    // Get the admin IDs from the request body
    const { adminIds } = await req.json();
    
    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Admin IDs são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get user data for each admin ID
    const userData = [];
    
    for (const id of adminIds) {
      try {
        // Get the user by ID
        const { data: user, error } = await supabase.auth.admin.getUserById(id);
        
        if (!error && user) {
          userData.push({
            id: user.user.id,
            email: user.user.email
          });
        } else {
          console.log('User not found:', id);
          userData.push({
            id: id,
            email: 'Email não disponível'
          });
        }
      } catch (userError) {
        console.error('Error getting user:', id, userError);
        userData.push({
          id: id,
          email: 'Erro ao buscar email'
        });
      }
    }
    
    return new Response(
      JSON.stringify(userData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting admin emails:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
