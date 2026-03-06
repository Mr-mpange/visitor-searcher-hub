import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Snippe webhook received:', JSON.stringify(body));

    const eventType = req.headers.get('X-Webhook-Event') || body.type;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (eventType === 'payment.completed') {
      const payment = body.data;
      const bookingId = payment?.metadata?.booking_id;

      if (bookingId) {
        // Update booking status to confirmed
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        if (error) {
          console.error('Error updating booking:', error);
        } else {
          console.log(`Booking ${bookingId} confirmed via Snippe payment`);
        }

        // Fetch full booking details
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();

        if (booking && payment?.metadata) {
          const customerPhone = payment.customer_phone || payment?.customer?.phone || '';
          const customerEmail = payment.customer_email || payment?.customer?.email || '';
          const serviceName = payment.metadata.service_name || '';
          const serviceType = payment.metadata.service_type || '';
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

          // Detect language: default to Swahili for TZ numbers, English otherwise
          const language = customerPhone.startsWith('+255') ? 'sw' : 'en';

          // 1. Send thank-you SMS + email notification
          await fetch(`${supabaseUrl}/functions/v1/send-booking-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: serviceType,
              serviceName,
              customerPhone,
              customerEmail,
              totalAmount: booking.total_amount,
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              startDate: booking.start_date,
              endDate: booking.end_date,
              guests: booking.guests,
              language,
            }),
          }).catch(err => console.log('SMS notification error:', err));

          // 2. Trigger bilingual voice call (thank you + welcome back)
          if (customerPhone) {
            await fetch(`${supabaseUrl}/functions/v1/post-booking-call`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerPhone,
                serviceName,
                type: serviceType,
                totalAmount: booking.total_amount,
                checkIn: booking.check_in,
                checkOut: booking.check_out,
                startDate: booking.start_date,
                endDate: booking.end_date,
                guests: booking.guests,
                language,
              }),
            }).catch(err => console.log('Voice call trigger error:', err));
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = body.data;
      const bookingId = payment?.metadata?.booking_id;
      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        console.log(`Booking ${bookingId} cancelled due to failed payment`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
