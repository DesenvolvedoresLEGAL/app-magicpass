import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, event_id, participant_id, data } = body;

    console.log('Processing webhook event:', { type, event_id, participant_id });

    switch (type) {
      case 'participant.checkin':
        await handleCheckinWebhook(event_id, participant_id, data);
        break;
      case 'participant.checkout':
        await handleCheckoutWebhook(event_id, participant_id, data);
        break;
      case 'participant.registration':
        await handleRegistrationWebhook(event_id, participant_id, data);
        break;
      default:
        console.log('Unknown webhook type:', type);
    }

    // Send webhooks to configured endpoints
    await sendWebhooksForEvent(event_id, {
      type,
      event_id,
      participant_id,
      data,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckinWebhook(eventId: string, participantId: string, data: any) {
  console.log('Processing check-in webhook');
  
  // Get participant and event details
  const { data: participant } = await supabase
    .from('participants')
    .select('*, events(*)')
    .eq('id', participantId)
    .single();

  if (!participant) {
    throw new Error('Participant not found');
  }

  // Send check-in confirmation email
  await supabase.functions.invoke('send-notification', {
    body: {
      type: 'email',
      organizationId: participant.events.organization_id,
      eventId: eventId,
      participantId: participantId,
      title: 'Check-in Confirmado',
      message: `Olá ${participant.name}, seu check-in no evento "${participant.events.name}" foi confirmado com sucesso!`,
      recipientEmail: participant.email,
      templateType: 'checkin_confirmation',
      metadata: {
        participant_name: participant.name,
        event_name: participant.events.name,
        checkin_time: new Date().toISOString()
      }
    }
  });
}

async function handleCheckoutWebhook(eventId: string, participantId: string, data: any) {
  console.log('Processing check-out webhook');
  
  // Similar logic for check-out notifications
  const { data: participant } = await supabase
    .from('participants')
    .select('*, events(*)')
    .eq('id', participantId)
    .single();

  if (participant) {
    // Send check-out notification if needed
    console.log(`Check-out processed for ${participant.name}`);
  }
}

async function handleRegistrationWebhook(eventId: string, participantId: string, data: any) {
  console.log('Processing registration webhook');
  
  const { data: participant } = await supabase
    .from('participants')
    .select('*, events(*)')
    .eq('id', participantId)
    .single();

  if (!participant) {
    throw new Error('Participant not found');
  }

  // Send registration confirmation
  await supabase.functions.invoke('send-notification', {
    body: {
      type: 'email',
      organizationId: participant.events.organization_id,
      eventId: eventId,
      participantId: participantId,
      title: 'Inscrição Confirmada',
      message: `Olá ${participant.name}, sua inscrição no evento "${participant.events.name}" foi confirmada!`,
      recipientEmail: participant.email,
      templateType: 'registration_confirmation',
      metadata: {
        participant_name: participant.name,
        event_name: participant.events.name,
        registration_time: new Date().toISOString(),
        qr_code: participant.qr_code
      }
    }
  });
}

async function sendWebhooksForEvent(eventId: string, payload: any) {
  try {
    // Get all active webhooks for this event
    const { data: webhooks } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('event_id', eventId)
      .eq('active', true)
      .contains('events', [payload.type]);

    if (!webhooks || webhooks.length === 0) {
      console.log('No webhooks configured for event type:', payload.type);
      return;
    }

    // Send to all configured webhooks
    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret || '',
            'X-Event-Type': payload.type,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log(`Webhook sent successfully to: ${webhook.url}`);
        return { success: true, url: webhook.url };

      } catch (error) {
        console.error(`Webhook failed for ${webhook.url}:`, error);
        
        // Implement retry logic if needed
        if (webhook.retry_count > 0) {
          // Could implement exponential backoff retry here
        }
        
        return { success: false, url: webhook.url, error: error.message };
      }
    });

    await Promise.all(webhookPromises);

  } catch (error) {
    console.error('Error sending webhooks:', error);
  }
}