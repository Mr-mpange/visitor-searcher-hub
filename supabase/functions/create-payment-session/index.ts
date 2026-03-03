import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SNIPPE_API_URL = 'https://api.snippe.sh';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub;

    const SNIPPE_API_KEY = Deno.env.get('SNIPPE_API_KEY');
    if (!SNIPPE_API_KEY) {
      return new Response(JSON.stringify({ error: 'SNIPPE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { 
      bookingId, serviceName, serviceType, totalAmount, currency = 'TZS',
      customerName, customerPhone, customerEmail,
      // booking details for confirmation page
      checkIn, checkOut, startDate, endDate, eventDate, guests, expectedGuests,
      providerName
    } = body;

    if (!totalAmount || !serviceName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookUrl = `${supabaseUrl}/functions/v1/snippe-webhook`;

    // Build metadata to pass booking context through payment
    const metadata: Record<string, string> = {
      booking_id: bookingId || '',
      user_id: userId,
      service_type: serviceType || '',
      service_name: serviceName,
    };

    // Create Snippe payment session
    const sessionResponse = await fetch(`${SNIPPE_API_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SNIPPE_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': bookingId || crypto.randomUUID(),
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount),
        currency,
        allowed_methods: ['mobile_money', 'card', 'qr'],
        customer: {
          name: customerName || '',
          phone: customerPhone || '',
          email: customerEmail || '',
        },
        redirect_url: `${body.redirectUrl || ''}`,
        webhook_url: webhookUrl,
        description: `Booking: ${serviceName}`,
        metadata,
        expires_in: 3600,
        line_items: [{
          name: serviceName,
          quantity: 1,
          amount: Math.round(totalAmount),
        }],
        display: {
          show_line_items: true,
          show_description: true,
          theme: 'light',
          success_message: 'Payment successful! Your booking is confirmed.',
          button_text: 'Pay Now',
        },
      }),
    });

    const sessionData = await sessionResponse.json();

    if (!sessionResponse.ok) {
      console.error('Snippe session creation failed:', sessionData);
      return new Response(JSON.stringify({ error: 'Payment session creation failed', details: sessionData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Snippe session created:', sessionData.data?.reference);

    return new Response(JSON.stringify({
      success: true,
      checkout_url: sessionData.data?.checkout_url,
      reference: sessionData.data?.reference,
      payment_link_url: sessionData.data?.payment_link_url,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
