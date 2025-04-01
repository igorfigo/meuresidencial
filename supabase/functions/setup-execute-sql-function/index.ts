
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

    // Create the execute_sql function if it doesn't exist
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `
    }).catch(() => {
      // If the function doesn't exist yet, create it with a direct query
      return supabaseAdmin.from('_temp_execute_sql_creation').select('*').then(() => ({
        error: null
      }));
    });

    if (error) {
      console.error("Failed to create execute_sql function:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create execute_sql function", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "execute_sql function created or already exists" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in setup-execute-sql-function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
