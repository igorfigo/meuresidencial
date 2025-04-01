
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the request is coming from an authenticated admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the Hostinger API key
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('api_key')
      .eq('service_name', 'hostinger')
      .single();

    if (apiKeyError) {
      return new Response(
        JSON.stringify({ error: 'API key not found' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = apiKeyData.api_key;

    // In a real implementation, you would make an actual API call to Hostinger
    // For now, let's mock the response with realistic data

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate realistic mock data
    const currentCpuUsage = Math.floor(Math.random() * 40) + 10; // 10-50%
    const currentRamUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
    const currentDiskUsage = Math.floor(Math.random() * 30) + 10; // 10-40%

    const vpsData = {
      hostname: 'vps123.hostinger.com',
      ipAddress: '123.456.789.012',
      status: 'running',
      os: 'Ubuntu 22.04 LTS',
      uptime: '10 days, 5 hours',
      dataCenter: 'São Paulo, Brazil',
      plan: 'Cloud Hosting Premium',
      cpu: {
        cores: 4,
        model: 'Intel Xeon E5-2680 v3',
        usage: currentCpuUsage,
      },
      memory: {
        total: 8 * 1024 * 1024 * 1024, // 8 GB
        used: (8 * 1024 * 1024 * 1024) * (currentRamUsage / 100),
        free: (8 * 1024 * 1024 * 1024) * (1 - currentRamUsage / 100),
        usagePercent: currentRamUsage,
      },
      disk: {
        total: 100 * 1024 * 1024 * 1024, // 100 GB
        used: (100 * 1024 * 1024 * 1024) * (currentDiskUsage / 100),
        free: (100 * 1024 * 1024 * 1024) * (1 - currentDiskUsage / 100),
        usagePercent: currentDiskUsage,
      },
      bandwidth: {
        total: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
        used: 500 * 1024 * 1024 * 1024, // 500 GB
        remaining: 1.5 * 1024 * 1024 * 1024 * 1024, // 1.5 TB
        usagePercent: 25,
      },
    };

    return new Response(
      JSON.stringify(vpsData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
