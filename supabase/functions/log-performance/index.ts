import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const {
      metric_type,
      metric_name,
      value,
      unit,
      organization_id = null,
      metadata = {}
    } = await req.json();

    if (!metric_type || !metric_name || value === undefined || !unit) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw userError;

    // Log performance metric
    const { data, error } = await supabase.rpc('log_performance_metric', {
      p_metric_type: metric_type,
      p_metric_name: metric_name,
      p_value: value,
      p_unit: unit,
      p_organization_id: organization_id,
      p_metadata: metadata
    });

    if (error) throw error;

    // Check if metric is above critical thresholds and log alert
    const criticalThresholds = {
      'page_load_time': 3000,      // 3 seconds
      'query_time': 1000,          // 1 second
      'api_response': 5000,        // 5 seconds
      'memory_usage': 90,          // 90%
      'error_rate': 5              // 5%
    };

    const threshold = criticalThresholds[metric_name];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric_name} = ${value}${unit} (threshold: ${threshold}${unit})`);
      
      // Could send notification or alert here
      // await sendPerformanceAlert(metric_name, value, unit, threshold);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      metric_id: data,
      threshold_exceeded: threshold && value > threshold 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Performance logging error:", message);
    
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});