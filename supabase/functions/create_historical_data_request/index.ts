
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

// This is a Supabase Edge Function that will create a historical data request
// It bypasses RLS policies by using the service role key

Deno.serve(async (req) => {
  try {
    const { p_matricula, p_request_type, p_status } = await req.json();

    // Validate the input
    if (!p_matricula || !p_request_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Insert the request using the admin client
    const { data, error } = await supabaseAdmin
      .from('historical_data_requests')
      .insert([{
        matricula: p_matricula,
        request_type: p_request_type,
        status: p_status || 'pending'
      }]);

    if (error) {
      console.error("Error creating historical data request:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
