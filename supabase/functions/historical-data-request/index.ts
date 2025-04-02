
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request body
    const { matricula, type, subject, message } = await req.json();
    
    // Validate required fields
    if (!matricula || !type || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: matricula, type, subject, and message are required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Insert into the historical_data_requests table
    const { data, error } = await supabaseAdmin
      .from('historical_data_requests')
      .insert({
        matricula,
        request_type: type,
        subject,
        message,
        status: 'pending'
      })
      .select('id');
    
    if (error) {
      console.error("Error inserting historical data request:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
