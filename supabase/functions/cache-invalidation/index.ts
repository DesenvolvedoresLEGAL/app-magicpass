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
    
    const {
      cacheKey,
      reason = 'manual',
      timestamp = new Date().toISOString()
    } = await req.json();

    if (!cacheKey) {
      return new Response(JSON.stringify({ error: "cacheKey is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let userId = null;
    let organizationId = null;

    // Try to get user info if auth header is provided
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData.user?.id || null;
        
        // Get organization_id if user exists
        if (userId) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('organization_id')
            .eq('auth_user_id', userId)
            .single();
          organizationId = userRecord?.organization_id || null;
        }
      } catch (error) {
        // Continue without user info if auth fails
        console.warn("Auth check failed for cache invalidation:", error);
      }
    }

    // Log cache invalidation
    const { error } = await supabase
      .from('cache_invalidations')
      .insert({
        cache_key: cacheKey,
        invalidation_reason: reason,
        triggered_by_user: userId,
        triggered_by_action: `cache_invalidation_${reason}`,
        organization_id: organizationId
      });

    if (error) {
      console.error("Failed to log cache invalidation:", error);
      // Don't fail the request if logging fails
    }

    console.log(`Cache invalidated: ${cacheKey} (reason: ${reason})`);

    return new Response(JSON.stringify({ 
      success: true,
      cached_key: cacheKey,
      reason,
      timestamp
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Cache invalidation logging error:", message);
    
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});