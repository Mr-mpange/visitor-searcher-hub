import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BookingNotification {
  type: 'accommodation' | 'ride' | 'event_hall';
  serviceName: string;
  customerPhone?: string;
  customerEmail?: string;
  providerPhone?: string;
  providerEmail?: string;
  checkIn?: string;
  checkOut?: string;
  startDate?: string;
  endDate?: string;
  eventDate?: string;
  guests?: number;
  expectedGuests?: number;
  hours?: string | number;
  pickupLocation?: string;
  dropoffLocation?: string;
  eventType?: string;
  totalAmount: number;
  language?: 'en' | 'sw';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: BookingNotification = await req.json();
    const { 
      type, 
      serviceName, 
      customerPhone, 
      customerEmail,
      providerPhone, 
      providerEmail,
      totalAmount,
      checkIn,
      checkOut,
      startDate,
      endDate,
      eventDate,
      guests,
      expectedGuests,
      hours,
      pickupLocation,
      dropoffLocation,
      eventType
    } = body;

    // Get API keys from secrets
    const atApiKey = Deno.env.get('AT_API_KEY');
    const atUsername = Deno.env.get('AT_USERNAME') || 'sandbox';
    const atShortcode = Deno.env.get('AT_SHORTCODE');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const results = {
      sms: { sent: false, message: '' },
      email: { sent: false, message: '' }
    };

    const lang = body.language || 'en';

    // Build SMS message based on booking type and language
    let smsMessage = '';
    let emailSubject = '';
    let emailHtml = '';

    // Multi-language SMS templates
    const smsTemplates: Record<string, Record<string, string>> = {
      accommodation: {
        en: `SafariStay Booking Confirmed! 🦁\n\nProperty: ${serviceName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\nTotal: TSh ${totalAmount}\n\nThank you! We look forward to welcoming you back. Karibu sana!`,
        sw: `SafariStay - Malazi Yamethibitishwa! 🦁\n\nMahali: ${serviceName}\nKuingia: ${checkIn}\nKutoka: ${checkOut}\nWageni: ${guests}\nJumla: TSh ${totalAmount}\n\nAsante sana! Karibu tena wakati wowote!`,
        fr: `SafariStay - Réservation Confirmée! 🦁\n\nHébergement: ${serviceName}\nArrivée: ${checkIn}\nDépart: ${checkOut}\nPersonnes: ${guests}\nTotal: TSh ${totalAmount}\n\nMerci! Nous avons hâte de vous revoir!`,
        ar: `SafariStay - تم تأكيد الحجز! 🦁\n\nمكان الإقامة: ${serviceName}\nالوصول: ${checkIn}\nالمغادرة: ${checkOut}\nالضيوف: ${guests}\nالمجموع: ${totalAmount} شلن\n\nشكراً لكم! نتطلع لاستقبالكم مجدداً!`,
        pt: `SafariStay - Reserva Confirmada! 🦁\n\nPropriedade: ${serviceName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nHóspedes: ${guests}\nTotal: TSh ${totalAmount}\n\nObrigado! Esperamos recebê-lo novamente!`,
        so: `SafariStay - Buukinta Waa La Xaqiijiyay! 🦁\n\nGoob: ${serviceName}\nSoo gal: ${checkIn}\nKa bax: ${checkOut}\nMartida: ${guests}\nWadarta: TSh ${totalAmount}\n\nWaad ku mahadsan tahay! Soo dhowoow mar kale!`,
      },
      ride: {
        en: `SafariStay Ride Booked! 🚗\n\nVehicle: ${serviceName}\nDates: ${startDate} - ${endDate}\n${pickupLocation ? `Pickup: ${pickupLocation}\n` : ''}Total: TSh ${totalAmount}\n\nThank you! Safe travels and welcome back anytime!`,
        sw: `SafariStay - Safari Imethibitishwa! 🚗\n\nGari: ${serviceName}\nTarehe: ${startDate} - ${endDate}\n${pickupLocation ? `Mahali: ${pickupLocation}\n` : ''}Jumla: TSh ${totalAmount}\n\nAsante! Safari njema na karibu tena!`,
        fr: `SafariStay - Trajet Confirmé! 🚗\n\nVéhicule: ${serviceName}\nDates: ${startDate} - ${endDate}\n${pickupLocation ? `Départ: ${pickupLocation}\n` : ''}Total: TSh ${totalAmount}\n\nMerci! Bon voyage et à bientôt!`,
        ar: `SafariStay - تم تأكيد الرحلة! 🚗\n\nالمركبة: ${serviceName}\nالتواريخ: ${startDate} - ${endDate}\n${pickupLocation ? `نقطة الانطلاق: ${pickupLocation}\n` : ''}المجموع: ${totalAmount} شلن\n\nشكراً! رحلة آمنة ونرحب بعودتكم!`,
        pt: `SafariStay - Viagem Confirmada! 🚗\n\nVeículo: ${serviceName}\nDatas: ${startDate} - ${endDate}\n${pickupLocation ? `Embarque: ${pickupLocation}\n` : ''}Total: TSh ${totalAmount}\n\nObrigado! Boa viagem e volte sempre!`,
        so: `SafariStay - Rakaabka Waa La Xaqiijiyay! 🚗\n\nGaari: ${serviceName}\nTaariikhda: ${startDate} - ${endDate}\n${pickupLocation ? `Goobta: ${pickupLocation}\n` : ''}Wadarta: TSh ${totalAmount}\n\nWaad ku mahadsan tahay! Safar wanaagsan!`,
      },
      event_hall: {
        en: `SafariStay Venue Booked! 🎉\n\nVenue: ${serviceName}\nDate: ${eventDate}\n${eventType ? `Event: ${eventType}\n` : ''}Guests: ${expectedGuests}\nTotal: TSh ${totalAmount}\n\nThank you! We wish you a wonderful event. Welcome back anytime!`,
        sw: `SafariStay - Ukumbi Umehifadhiwa! 🎉\n\nUkumbi: ${serviceName}\nTarehe: ${eventDate}\n${eventType ? `Tukio: ${eventType}\n` : ''}Wageni: ${expectedGuests}\nJumla: TSh ${totalAmount}\n\nAsante sana! Karibu tena!`,
        fr: `SafariStay - Salle Réservée! 🎉\n\nSalle: ${serviceName}\nDate: ${eventDate}\n${eventType ? `Événement: ${eventType}\n` : ''}Invités: ${expectedGuests}\nTotal: TSh ${totalAmount}\n\nMerci! Nous vous souhaitons un événement formidable!`,
        ar: `SafariStay - تم حجز القاعة! 🎉\n\nالقاعة: ${serviceName}\nالتاريخ: ${eventDate}\n${eventType ? `الحدث: ${eventType}\n` : ''}الضيوف: ${expectedGuests}\nالمجموع: ${totalAmount} شلن\n\nشكراً! نتمنى لكم حدثاً رائعاً!`,
        pt: `SafariStay - Salão Reservado! 🎉\n\nSalão: ${serviceName}\nData: ${eventDate}\n${eventType ? `Evento: ${eventType}\n` : ''}Convidados: ${expectedGuests}\nTotal: TSh ${totalAmount}\n\nObrigado! Desejamos um evento incrível!`,
        so: `SafariStay - Qolka Waa La Kaydiyay! 🎉\n\nQolka: ${serviceName}\nTaariikhda: ${eventDate}\n${eventType ? `Munaasabadda: ${eventType}\n` : ''}Martida: ${expectedGuests}\nWadarta: TSh ${totalAmount}\n\nWaad ku mahadsan tahay! Munaasabad wanaagsan!`,
      },
    };

    smsMessage = smsTemplates[type]?.[lang] || smsTemplates[type]?.en || '';
    
    switch (type) {
      case 'accommodation':
        emailSubject = `Booking Confirmed: ${serviceName}`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C69B6D 0%, #5C4033 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 SafariStay</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Venue Confirmation</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #5C4033; margin-top: 0;">Your Venue is Booked!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">${serviceName}</h3>
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
                ${eventType ? `<p style="margin: 5px 0;"><strong>🎊 Event:</strong> ${eventType}</p>` : ''}
                <p style="margin: 5px 0;"><strong>👥 Expected Guests:</strong> ${expectedGuests}</p>
                <p style="margin: 5px 0;"><strong>⏰ Duration:</strong> ${hours} hours</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 20px;"><strong>Total: $${totalAmount}</strong></p>
              </div>
              <p style="color: #666; font-size: 14px;">Thank you for choosing SafariStay for your event!</p>
            </div>
          </div>
        `;
        break;
    }

    // Provider notification templates
    const providerSmsMessage = `New Booking Alert!\n\n` +
      `Service: ${serviceName}\n` +
      `Type: ${type.replace('_', ' ')}\n` +
      `Amount: $${totalAmount}\n\n` +
      `Check your dashboard for details.`;
    
    const providerEmailSubject = `New Booking: ${serviceName}`;
    const providerEmailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #5C4033 0%, #3a2a1d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📢 New Booking Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">SafariStay Provider Dashboard</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #5C4033; margin-top: 0;">You've received a new booking!</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333;">${serviceName}</h3>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${type.replace('_', ' ')}</p>
            <p style="margin: 5px 0; font-size: 20px;"><strong>Amount: $${totalAmount}</strong></p>
          </div>
          <p style="color: #666; font-size: 14px;">Log in to your provider dashboard to view full booking details and manage this reservation.</p>
        </div>
      </div>
    `;

    // Send SMS via Africa's Talking
    if (atApiKey && (customerPhone || providerPhone)) {
      const atUrl = atUsername === 'sandbox' 
        ? 'https://api.sandbox.africastalking.com/version1/messaging'
        : 'https://api.africastalking.com/version1/messaging';

      const recipients = [
        { phone: customerPhone, isProvider: false },
        { phone: providerPhone, isProvider: true }
      ].filter(r => r.phone);

      for (const recipient of recipients) {
        try {
          const response = await fetch(atUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'apiKey': atApiKey,
            },
            body: new URLSearchParams({
              username: atUsername,
              to: recipient.phone!,
              message: recipient.isProvider ? providerSmsMessage : smsMessage,
              ...(atShortcode ? { from: atShortcode } : {})
            }),
          });

          const result = await response.json();
          console.log(`SMS sent to ${recipient.phone}:`, result);
          results.sms.sent = true;
          results.sms.message = 'SMS notifications sent';
        } catch (smsError) {
          console.error(`Failed to send SMS to ${recipient.phone}:`, smsError);
        }
      }
    } else {
      results.sms.message = 'SMS not configured (AT_API_KEY not set)';
      console.log('SMS notification skipped - API key not configured');
    }

    // Send Email via Resend
    if (resendApiKey && (customerEmail || providerEmail)) {
      const resend = new Resend(resendApiKey);
      
      // Send to customer
      if (customerEmail) {
        try {
          const emailResponse = await resend.emails.send({
            from: 'SafariStay <noreply@safaristay.com>',
            to: [customerEmail],
            subject: emailSubject,
            html: emailHtml,
          });
          console.log('Customer email sent:', emailResponse);
          results.email.sent = true;
        } catch (emailError) {
          console.error('Failed to send customer email:', emailError);
        }
      }

      // Send to provider
      if (providerEmail) {
        try {
          const emailResponse = await resend.emails.send({
            from: 'SafariStay <noreply@safaristay.com>',
            to: [providerEmail],
            subject: providerEmailSubject,
            html: providerEmailHtml,
          });
          console.log('Provider email sent:', emailResponse);
          results.email.sent = true;
        } catch (emailError) {
          console.error('Failed to send provider email:', emailError);
        }
      }
      
      results.email.message = results.email.sent ? 'Email notifications sent' : 'Email sending failed';
    } else {
      results.email.message = 'Email not configured (RESEND_API_KEY not set)';
      console.log('Email notification skipped - API key not configured');
    }

    // Log the notification for development
    console.log('Booking notification processed:', {
      type,
      serviceName,
      customerPhone,
      customerEmail,
      providerPhone,
      providerEmail,
      totalAmount,
      results
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking notification processed',
        type,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing booking notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
