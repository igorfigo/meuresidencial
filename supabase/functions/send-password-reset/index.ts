
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Processando solicitação de redefinição de senha para: ${email}`);

    // Use Supabase's built-in password reset functionality
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin')}/login`,
    });

    if (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      throw error;
    }
    
    console.log('Email de redefinição de senha enviado com sucesso');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Erro ao processar solicitação de redefinição de senha:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
