import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface NotificationRequest {
  type: 'email' | 'webhook' | 'push';
  organizationId: string;
  eventId?: string;
  participantId?: string;
  title: string;
  message: string;
  metadata?: any;
  templateType?: string;
  recipientEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      organizationId,
      eventId,
      participantId,
      title,
      message,
      metadata = {},
      templateType,
      recipientEmail
    }: NotificationRequest = await req.json();

    console.log('Processing notification:', { type, organizationId, title });

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        organization_id: organizationId,
        event_id: eventId,
        participant_id: participantId,
        type,
        title,
        message,
        metadata,
        status: 'pending'
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    let result;

    switch (type) {
      case 'email':
        result = await sendEmail(notification, recipientEmail, templateType);
        break;
      case 'webhook':
        result = await sendWebhook(notification, eventId);
        break;
      case 'push':
        result = await sendPushNotification(notification);
        break;
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null
      })
      .eq('id', notification.id);

    return new Response(JSON.stringify({ success: result.success, id: notification.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmail(notification: any, recipientEmail?: string, templateType?: string) {
  try {
    if (!recipientEmail) {
      // Get participant email if not provided
      if (notification.participant_id) {
        const { data: participant } = await supabase
          .from('participants')
          .select('email')
          .eq('id', notification.participant_id)
          .single();
        
        recipientEmail = participant?.email;
      }
    }

    if (!recipientEmail) {
      throw new Error('No recipient email found');
    }

    // Get email template if specified
    let subject = notification.title;
    let htmlContent = `<p>${notification.message}</p>`;

    if (templateType) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', notification.organization_id)
        .eq('type', templateType)
        .eq('active', true)
        .single();

      if (template) {
        subject = template.subject;
        htmlContent = template.html_content;
        
        // Replace variables in template
        Object.keys(notification.metadata || {}).forEach(key => {
          const placeholder = `{{${key}}}`;
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), notification.metadata[key]);
          subject = subject.replace(new RegExp(placeholder, 'g'), notification.metadata[key]);
        });
      }
    }

    const emailResponse = await resend.emails.send({
      from: 'Eventos <onboarding@resend.dev>',
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);
    return { success: true };

  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendWebhook(notification: any, eventId?: string) {
  try {
    if (!eventId) {
      throw new Error('Event ID required for webhook notifications');
    }

    // Get webhook configs for the event
    const { data: webhooks } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('event_id', eventId)
      .eq('active', true);

    if (!webhooks || webhooks.length === 0) {
      console.log('No active webhooks found for event');
      return { success: true };
    }

    const promises = webhooks.map(async (webhook) => {
      try {
        const payload = {
          event_id: eventId,
          notification_id: notification.id,
          type: 'notification',
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata,
          timestamp: new Date().toISOString()
        };

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret || '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }

        console.log(`Webhook sent successfully to: ${webhook.url}`);
        return { success: true };

      } catch (error) {
        console.error(`Webhook error for ${webhook.url}:`, error);
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const allSuccessful = results.every(r => r.success);

    return { 
      success: allSuccessful,
      error: allSuccessful ? null : 'Some webhooks failed'
    };

  } catch (error) {
    console.error('Error processing webhooks:', error);
    return { success: false, error: error.message };
  }
}

async function sendPushNotification(notification: any) {
  // Placeholder for push notification implementation
  // This would integrate with a service like Firebase Cloud Messaging
  console.log('Push notification placeholder:', notification.title);
  return { success: true };
}