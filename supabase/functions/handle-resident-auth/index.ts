
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handle = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables for Supabase');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { residentId, userId, matricula } = await req.json();
    
    if (!residentId || !userId || !matricula) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: residentId, userId, and matricula are required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // First, update the resident record with the user_id
    const { error: residentError } = await supabase
      .from('residents')
      .update({ user_id: userId })
      .eq('id', residentId);
    
    if (residentError) {
      console.error('Error updating resident:', residentError);
      throw new Error('Failed to update resident with user_id');
    }
    
    // Then, create a role entry for the resident
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'resident',
        matricula: matricula
      }, { onConflict: 'user_id,role' });
    
    if (roleError) {
      console.error('Error creating user role:', roleError);
      throw new Error('Failed to create user role');
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Resident authentication setup completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handle-resident-auth:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

Deno.serve(handle);
