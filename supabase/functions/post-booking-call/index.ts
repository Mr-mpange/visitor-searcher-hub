import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type Lang = 'en' | 'sw' | 'fr' | 'ar' | 'pt' | 'so';

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
  language?: Lang;
}

// TTS voice IDs for Africa's Talking / Google TTS
const voiceMap: Record<Lang, string> = {
  en: 'en-US-Standard-F',
  sw: 'sw-KE-Standard-A',
  fr: 'fr-FR-Standard-A',
  ar: 'ar-XA-Standard-A',
  pt: 'pt-BR-Standard-A',
  so: 'en-US-Standard-F', // Somali TTS not natively supported, fallback to English voice with Somali text
};

function buildMessage(lang: Lang, body: CallRequest): string {
  const { serviceName, type, totalAmount, checkIn, checkOut, startDate, endDate, eventDate, guests, expectedGuests } = body;
  const amt = totalAmount.toLocaleString();

  const templates: Record<Lang, Record<string, () => string>> = {
    en: {
      accommodation: () => `Hello! Thank you for booking with SafariStay. Your stay at ${serviceName} is confirmed. Check-in: ${checkIn}, check-out: ${checkOut}. ${guests ? `Reserved for ${guests} guests. ` : ''}Total: ${amt} shillings. We look forward to welcoming you back. Karibu sana!`,
      ride: () => `Hello! Thank you for booking with SafariStay. Your vehicle ${serviceName} is confirmed from ${startDate} to ${endDate}. Total: ${amt} shillings. Safe travels and welcome back anytime!`,
      event_hall: () => `Hello! Thank you for choosing SafariStay. Your venue ${serviceName} is booked for ${eventDate}. ${expectedGuests ? `Preparing for ${expectedGuests} guests. ` : ''}Total: ${amt} shillings. We wish you a fantastic event!`,
    },
    sw: {
      accommodation: () => `Habari! Asante sana kwa kuchagua SafariStay. Malazi yako katika ${serviceName} yamethibitishwa. Kuingia: ${checkIn}, kutoka: ${checkOut}. ${guests ? `Wageni ${guests}. ` : ''}Jumla: shilingi ${amt}. Karibu tena wakati wowote!`,
      ride: () => `Habari! Asante kwa kupanga safari yako na SafariStay. Gari ${serviceName} limethibitishwa kuanzia ${startDate} hadi ${endDate}. Jumla: shilingi ${amt}. Safari njema na karibu tena!`,
      event_hall: () => `Habari! Asante kwa kuchagua SafariStay. Ukumbi ${serviceName} umehifadhiwa kwa ${eventDate}. ${expectedGuests ? `Wageni ${expectedGuests}. ` : ''}Jumla: shilingi ${amt}. Tunakutakia tukio zuri sana!`,
    },
    fr: {
      accommodation: () => `Bonjour! Merci d'avoir réservé avec SafariStay. Votre séjour à ${serviceName} est confirmé. Arrivée: ${checkIn}, départ: ${checkOut}. ${guests ? `Pour ${guests} personnes. ` : ''}Total: ${amt} shillings. Nous avons hâte de vous revoir. Bienvenue!`,
      ride: () => `Bonjour! Merci pour votre réservation SafariStay. Votre véhicule ${serviceName} est confirmé du ${startDate} au ${endDate}. Total: ${amt} shillings. Bon voyage et à bientôt!`,
      event_hall: () => `Bonjour! Merci d'avoir choisi SafariStay. Votre salle ${serviceName} est réservée pour le ${eventDate}. ${expectedGuests ? `Pour ${expectedGuests} invités. ` : ''}Total: ${amt} shillings. Nous vous souhaitons un événement formidable!`,
    },
    ar: {
      accommodation: () => `مرحبا! شكراً لحجزك مع SafariStay. إقامتك في ${serviceName} مؤكدة. تسجيل الوصول: ${checkIn}، المغادرة: ${checkOut}. ${guests ? `لعدد ${guests} ضيوف. ` : ''}المجموع: ${amt} شلن. نتطلع لاستقبالك مجدداً!`,
      ride: () => `مرحبا! شكراً لحجزك مع SafariStay. سيارتك ${serviceName} مؤكدة من ${startDate} إلى ${endDate}. المجموع: ${amt} شلن. رحلة آمنة ونرحب بعودتك!`,
      event_hall: () => `مرحبا! شكراً لاختيارك SafariStay. قاعتك ${serviceName} محجوزة بتاريخ ${eventDate}. ${expectedGuests ? `لعدد ${expectedGuests} ضيف. ` : ''}المجموع: ${amt} شلن. نتمنى لك حدثاً رائعاً!`,
    },
    pt: {
      accommodation: () => `Olá! Obrigado por reservar com SafariStay. Sua estadia em ${serviceName} está confirmada. Check-in: ${checkIn}, check-out: ${checkOut}. ${guests ? `Para ${guests} hóspedes. ` : ''}Total: ${amt} xelins. Esperamos recebê-lo novamente. Bem-vindo!`,
      ride: () => `Olá! Obrigado pela reserva na SafariStay. Seu veículo ${serviceName} está confirmado de ${startDate} a ${endDate}. Total: ${amt} xelins. Boa viagem e volte sempre!`,
      event_hall: () => `Olá! Obrigado por escolher SafariStay. Seu salão ${serviceName} está reservado para ${eventDate}. ${expectedGuests ? `Para ${expectedGuests} convidados. ` : ''}Total: ${amt} xelins. Desejamos um evento incrível!`,
    },
    so: {
      accommodation: () => `Salaan! Waad ku mahadsan tahay inaad la degto SafariStay. Deganaansigaaga ${serviceName} waa la xaqiijiyay. Soo gal: ${checkIn}, ka bax: ${checkOut}. ${guests ? `Martida ${guests}. ` : ''}Wadarta: ${amt} shilin. Waxaan rajaynaynaa inaan ku soo dhoweynno mar kale!`,
      ride: () => `Salaan! Waad ku mahadsan tahay SafariStay. Gaariigaaga ${serviceName} waa la xaqiijiyay ${startDate} ilaa ${endDate}. Wadarta: ${amt} shilin. Safar wanaagsan oo soo noqo mar kale!`,
      event_hall: () => `Salaan! Waad ku mahadsan tahay SafariStay. Qolkaaga ${serviceName} waa la kaydiyay ${eventDate}. ${expectedGuests ? `Martida la filayo ${expectedGuests}. ` : ''}Wadarta: ${amt} shilin. Waxaan kuu rajaynaynaa munaasabad wacan!`,
    },
  };

  const typeName = type === 'event_hall' ? 'event_hall' : type;
  return (templates[lang]?.[typeName] || templates.en[typeName])();
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
    const message = url.searchParams.get('message') || 'Thank you for booking with SafariStay!';
    const voice = url.searchParams.get('voice') || 'en-US-Standard-F';

    if (isActive === '1') {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${message}</Say>
</Response>`;
      return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
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

    const lang = (language || 'en') as Lang;
    const ttsMessage = buildMessage(lang, body);
    const voice = voiceMap[lang] || voiceMap.en;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/post-booking-call?` +
      `message=${encodeURIComponent(ttsMessage)}` +
      `&voice=${encodeURIComponent(voice)}`;

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
        callbackUrl,
      }),
    });

    const result = await callResponse.json();
    console.log(`Voice call initiated (${lang}):`, result);

    return new Response(
      JSON.stringify({ success: true, message: `Voice call initiated (${lang})`, result }),
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
