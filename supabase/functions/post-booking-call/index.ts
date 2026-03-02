import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CallRequest {
  customerPhone: string;
  serviceName: string;
  type: 'accommodation' | 'ride' | 'event_hall';
  totalAmount: number;
  checkIn?: string;
  checkOut?: string;
  startDate?: string;
  endDate?: string;
  eventDate?: string;
  guests?: number;
  expectedGuests?: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const contentType = req.headers.get('content-type') || '';

  // AT Voice callback - returns TTS XML
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const isActive = params.get('isActive');

    // Get the message from the URL query params (we pass it when initiating the call)
    const url = new URL(req.url);
    const message = url.searchParams.get('message') || 'Thank you for booking with SafariStay!';

    if (isActive === '1') {
      // Call is active, speak the message
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="en-US-Standard-F">${message}</Say>
</Response>`;
      return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Call ended
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }

  // JSON request - initiate the call
  try {
    const body: CallRequest = await req.json();
    const { customerPhone, serviceName, type, totalAmount, checkIn, checkOut, startDate, endDate, eventDate, guests, expectedGuests } = body;

    if (!customerPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Customer phone number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const atApiKey = Deno.env.get('AT_API_KEY');
    const atUsername = Deno.env.get('AT_USERNAME') || 'sandbox';

    if (!atApiKey) {
      console.log('AT_API_KEY not configured, skipping voice call');
      return new Response(
        JSON.stringify({ success: false, message: 'Voice calling not configured (AT_API_KEY not set)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Build TTS message based on booking type
    let ttsMessage = '';
    switch (type) {
      case 'accommodation':
        ttsMessage = `Hello! Thank you for booking with SafariStay. Your stay at ${serviceName} has been confirmed. ` +
          `Check-in is on ${checkIn}, and check-out is on ${checkOut}. ` +
          (guests ? `We have reserved for ${guests} guests. ` : '') +
          `The total amount is ${totalAmount} dollars. ` +
          `We look forward to welcoming you. Have a wonderful trip!`;
        break;
      case 'ride':
        ttsMessage = `Hello! Thank you for booking with SafariStay. Your ride with ${serviceName} has been confirmed. ` +
          `Your rental starts on ${startDate} and ends on ${endDate}. ` +
          `The total amount is ${totalAmount} dollars. ` +
          `Safe travels and enjoy your journey!`;
        break;
      case 'event_hall':
        ttsMessage = `Hello! Thank you for booking with SafariStay. Your venue ${serviceName} has been booked. ` +
          `Your event is scheduled for ${eventDate}. ` +
          (expectedGuests ? `We are preparing for ${expectedGuests} guests. ` : '') +
          `The total amount is ${totalAmount} dollars. ` +
          `We wish you a fantastic event!`;
        break;
    }

    // Build the callback URL with message as query param
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/post-booking-call?message=${encodeURIComponent(ttsMessage)}`;

    // Initiate the call via Africa's Talking Voice API
    const atVoiceUrl = atUsername === 'sandbox'
      ? 'https://voice.sandbox.africastalking.com/call'
      : 'https://voice.africastalking.com/call';

    const callResponse = await fetch(atVoiceUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': atApiKey,
      },
      body: new URLSearchParams({
        username: atUsername,
        to: customerPhone,
        ...(atUsername !== 'sandbox' ? { from: Deno.env.get('AT_PHONE_NUMBER') || '' } : {}),
        callbackUrl: callbackUrl,
      }),
    });

    const result = await callResponse.json();
    console.log('Voice call initiated:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Voice call initiated', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error initiating voice call:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
