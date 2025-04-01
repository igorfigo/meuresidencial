
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

serve(async (req) => {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // First, check if there's an existing unique_email_per_condominium constraint
    const { data: constraintExists, error: checkError } = await supabaseAdmin
      .from('residents')
      .select('email')
      .eq('matricula', 'check_constraint_existence')
      .limit(1);

    // If there was no error for a specific error code related to constraint violation, 
    // we assume the constraint doesn't exist
    const constraintDoesNotExist = !checkError || !checkError.message.includes('unique_email_per_condominium');

    if (constraintDoesNotExist) {
      // Create a unique constraint on email per matricula
      // This query creates a unique constraint for the combination of matricula and email
      const { error: createError } = await supabaseAdmin.rpc('execute_sql', {
        sql: `
          ALTER TABLE public.residents
          ADD CONSTRAINT unique_email_per_condominium 
          UNIQUE (matricula, email);
        `
      });

      if (createError) {
        console.error("Error creating constraint:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create constraint", details: createError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Resident email constraints updated successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-resident-constraints function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
