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
  language?: 'en' | 'sw'; // English or Swahili
}

// Build TTS message in English
function buildEnglishMessage(body: CallRequest): string {
  const { serviceName, type, totalAmount, checkIn, checkOut, startDate, endDate, eventDate, guests, expectedGuests } = body;
  let msg = '';
  switch (type) {
    case 'accommodation':
      msg = `Hello! Thank you so much for booking with SafariStay. ` +
        `Your stay at ${serviceName} has been confirmed. ` +
        `Check-in is on ${checkIn}, and check-out is on ${checkOut}. ` +
        (guests ? `We have reserved for ${guests} guests. ` : '') +
        `The total amount is ${totalAmount} shillings. ` +
        `We look forward to welcoming you. ` +
        `Thank you for choosing SafariStay and we hope to serve you again soon. Karibu sana!`;
      break;
    case 'ride':
      msg = `Hello! Thank you for booking your ride with SafariStay. ` +
        `Your vehicle ${serviceName} has been confirmed. ` +
        `Your rental starts on ${startDate} and ends on ${endDate}. ` +
        `The total amount is ${totalAmount} shillings. ` +
        `Safe travels and enjoy your journey! ` +
        `We appreciate your trust in SafariStay. Welcome back anytime!`;
      break;
    case 'event_hall':
      msg = `Hello! Thank you for choosing SafariStay for your event. ` +
        `Your venue ${serviceName} has been booked. ` +
        `Your event is scheduled for ${eventDate}. ` +
        (expectedGuests ? `We are preparing for ${expectedGuests} guests. ` : '') +
        `The total amount is ${totalAmount} shillings. ` +
        `We wish you a fantastic event! Thank you and welcome to use our service again!`;
      break;
  }
  return msg;
}

// Build TTS message in Swahili
function buildSwahiliMessage(body: CallRequest): string {
  const { serviceName, type, totalAmount, checkIn, checkOut, startDate, endDate, eventDate, guests, expectedGuests } = body;
  let msg = '';
  switch (type) {
    case 'accommodation':
      msg = `Habari! Asante sana kwa kuchagua SafariStay. ` +
        `Malazi yako katika ${serviceName} yamethibitishwa. ` +
        `Utaingia tarehe ${checkIn}, na kutoka tarehe ${checkOut}. ` +
        (guests ? `Tumekuhifadhia wageni ${guests}. ` : '') +
        `Jumla ya gharama ni shilingi ${totalAmount}. ` +
        `Tunakukaribisha kwa furaha kubwa. ` +
        `Asante kwa kutumia SafariStay. Karibu tena wakati wowote!`;
      break;
    case 'ride':
      msg = `Habari! Asante kwa kupanga safari yako na SafariStay. ` +
        `Gari lako ${serviceName} limethibitishwa. ` +
        `Kukodi kunaanza tarehe ${startDate} na kuishia tarehe ${endDate}. ` +
        `Jumla ya gharama ni shilingi ${totalAmount}. ` +
        `Safari njema na furahia safari yako! ` +
        `Tunashukuru kwa imani yako kwetu. Karibu tena!`;
      break;
    case 'event_hall':
      msg = `Habari! Asante kwa kuchagua SafariStay kwa tukio lako. ` +
        `Ukumbi wako ${serviceName} umehifadhiwa. ` +
        `Tukio lako limepangwa kwa tarehe ${eventDate}. ` +
        (expectedGuests ? `Tunajiandaa kwa wageni ${expectedGuests}. ` : '') +
        `Jumla ya gharama ni shilingi ${totalAmount}. ` +
        `Tunakutakia tukio zuri sana! Asante na karibu kutumia huduma zetu tena!`;
      break;
  }
  return msg;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const contentType = req.headers.get('content-type') || '';

  // AT Voice callback - returns TTS XML
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const isActive = params.get('isActive');

    const url = new URL(req.url);
    const messageEn = url.searchParams.get('message_en') || '';
    const messageSw = url.searchParams.get('message_sw') || '';
    const lang = url.searchParams.get('lang') || 'en';

    if (isActive === '1') {
      // Deliver message in selected language, then repeat in the other language
      const primaryMsg = lang === 'sw' ? messageSw : messageEn;
      const secondaryMsg = lang === 'sw' ? messageEn : messageSw;
      const primaryVoice = lang === 'sw' ? 'sw-KE-Standard-A' : 'en-US-Standard-F';
      const secondaryVoice = lang === 'sw' ? 'en-US-Standard-F' : 'sw-KE-Standard-A';

      // Build XML with both languages
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>`;
      if (primaryMsg) {
        xml += `\n  <Say voice="${primaryVoice}">${primaryMsg}</Say>`;
      }
      if (secondaryMsg) {
        xml += `\n  <Pause length="1"/>`;
        xml += `\n  <Say voice="${secondaryVoice}">${secondaryMsg}</Say>`;
      }
      xml += `\n</Response>`;

      return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }

  // JSON request - initiate the call
  try {
    const body: CallRequest = await req.json();
    const { customerPhone, language = 'en' } = body;

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
        JSON.stringify({ success: false, message: 'Voice calling not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Build messages in both languages
    const messageEn = buildEnglishMessage(body);
    const messageSw = buildSwahiliMessage(body);

    // Build callback URL with both messages
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/post-booking-call?` +
      `lang=${encodeURIComponent(language)}` +
      `&message_en=${encodeURIComponent(messageEn)}` +
      `&message_sw=${encodeURIComponent(messageSw)}`;

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
    console.log('Bilingual voice call initiated:', result);

    return new Response(
      JSON.stringify({ success: true, message: `Voice call initiated (${language})`, result }),
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
