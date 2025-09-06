import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const parsePeriod = (period?: string) => {
  const end = new Date();
  let start = new Date();
  switch (period) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "30d":
    default:
      start.setDate(end.getDate() - 30);
  }
  return { start, end };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
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

    const { organizationId, eventId, period } = await req.json();
    if (!organizationId) {
      return new Response(JSON.stringify({ error: "organizationId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { start, end } = parsePeriod(period);

    // Fetch events for org
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name")
      .eq("organization_id", organizationId);

    if (eventsError) throw eventsError;

    const eventIds = (events || []).map((e) => e.id);
    const filteredEventIds = eventId ? [eventId] : eventIds;

    // Fetch participants within period
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("event_id, status, checked_in_at, ticket_category, registered_at")
      .in("event_id", filteredEventIds.length ? filteredEventIds : ["00000000-0000-0000-0000-000000000000"]) // safe empty
      .gte("registered_at", start.toISOString())
      .lte("registered_at", end.toISOString());
    if (participantsError) throw participantsError;

    // Try to fetch sessions for device stats (optional)
    let sessions: any[] = [];
    const { data: sessionsData } = await supabase
      .from("analytics_sessions")
      .select("device_type, started_at, event_id")
      .in("event_id", filteredEventIds.length ? filteredEventIds : ["00000000-0000-0000-0000-000000000000"]) // safe empty
      .gte("started_at", start.toISOString())
      .lte("started_at", end.toISOString());
    if (sessionsData) sessions = sessionsData;

    // Compute event comparison
    const byEvent: Record<string, { name: string; inscricoes: number; checkins: number; conversao: number }> = {};
    const eventName = (id: string) => events?.find((e) => e.id === id)?.name || "Evento";

    (participants || []).forEach((p) => {
      const id = p.event_id as string;
      if (!byEvent[id]) byEvent[id] = { name: eventName(id), inscricoes: 0, checkins: 0, conversao: 0 };
      byEvent[id].inscricoes += 1;
      if (p.checked_in_at) byEvent[id].checkins += 1;
    });

    Object.values(byEvent).forEach((e) => {
      e.conversao = e.inscricoes > 0 ? Math.round((e.checkins / e.inscricoes) * 1000) / 10 : 0;
    });

    // Temporal trends (group by day)
    const dateKey = (d: string) => d.slice(0, 10);
    const trendsMap: Record<string, { inscricoes: number; checkins: number }> = {};
    (participants || []).forEach((p) => {
      const key = dateKey(p.registered_at);
      if (!trendsMap[key]) trendsMap[key] = { inscricoes: 0, checkins: 0 };
      trendsMap[key].inscricoes += 1;
      if (p.checked_in_at) trendsMap[key].checkins += 1;
    });
    const temporalTrends = Object.keys(trendsMap)
      .sort()
      .map((date) => ({ date, inscricoes: trendsMap[date].inscricoes, checkins: trendsMap[date].checkins }));

    // Demographics by ticket_category
    const catMap: Record<string, number> = {};
    (participants || []).forEach((p) => {
      const cat = p.ticket_category || "Outros";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const palette = ["#3b82f6", "#06d6a0", "#f72585", "#ffd60a", "#8b5cf6", "#ef4444"];
    const demographics = Object.entries(catMap).slice(0, 6).map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));

    // Device stats
    const deviceCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      const device = (s.device_type || "Desktop").toString();
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const totalSessions = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 0;

    const totalInscricoes = (participants || []).length;
    const totalCheckins = (participants || []).filter((p) => !!p.checked_in_at).length;
    const overallConversion = totalInscricoes > 0 ? Math.round((totalCheckins / totalInscricoes) * 1000) / 10 : 0;

    const mapDevice = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("mobile") || n.includes("phone")) return "Mobile";
      if (n.includes("tablet")) return "Tablet";
      return "Desktop";
    };

    const deviceStats = ["Desktop", "Mobile", "Tablet"].map((d) => ({
      device: d,
      sessions: Object.entries(deviceCounts).reduce((sum, [k, v]) => (mapDevice(k) === d ? sum + v : sum), 0),
      conversao: overallConversion,
    })).filter((d) => d.sessions > 0);

    // Funnel & abandonment (basic from available data)
    const conversationFunnel = [
      { name: "Visualizações da página", value: totalInscricoes, color: "#3b82f6" },
      { name: "Iniciaram inscrição", value: totalInscricoes, color: "#6366f1" },
      { name: "Preencheram dados", value: totalInscricoes, color: "#8b5cf6" },
      { name: "Finalizaram inscrição", value: totalInscricoes, color: "#a855f7" },
      { name: "Fizeram check-in", value: totalCheckins, color: "#c084fc" },
    ];

    const abandonment = [
      { step: "Inscrição", abandono: Math.max(0, Math.round((1 - (totalInscricoes / Math.max(totalInscricoes, 1))) * 100)) },
      { step: "Check-in", abandono: Math.max(0, Math.round((1 - (totalCheckins / Math.max(totalInscricoes, 1))) * 100)) },
    ];

    const eventComparison = Object.values(byEvent);

    const payload = {
      conversationFunnel,
      eventComparison,
      temporalTrends,
      demographics,
      deviceStats,
      abandonment,
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
