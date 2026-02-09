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

    // Build message based on booking type
    let smsMessage = '';
    let emailSubject = '';
    let emailHtml = '';
    
    switch (type) {
      case 'accommodation':
        smsMessage = `SafariStay Booking Confirmed!\n\n` +
          `Property: ${serviceName}\n` +
          `Check-in: ${checkIn}\n` +
          `Check-out: ${checkOut}\n` +
          `Guests: ${guests}\n` +
          `Total: $${totalAmount}\n\n` +
          `Thank you for booking with SafariStay!`;
        
        emailSubject = `Booking Confirmed: ${serviceName}`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C69B6D 0%, #5C4033 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🦁 SafariStay</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Booking Confirmation</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #5C4033; margin-top: 0;">Your Stay is Confirmed!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">${serviceName}</h3>
                <p style="margin: 5px 0;"><strong>📅 Check-in:</strong> ${checkIn}</p>
                <p style="margin: 5px 0;"><strong>📅 Check-out:</strong> ${checkOut}</p>
                <p style="margin: 5px 0;"><strong>👥 Guests:</strong> ${guests}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 20px;"><strong>Total: $${totalAmount}</strong></p>
              </div>
              <p style="color: #666; font-size: 14px;">Thank you for choosing SafariStay. We hope you have an amazing experience!</p>
            </div>
          </div>
        `;
        break;
        
      case 'ride':
        smsMessage = `SafariStay Ride Booked!\n\n` +
          `Vehicle: ${serviceName}\n` +
          `Dates: ${startDate} - ${endDate}\n` +
          (pickupLocation ? `Pickup: ${pickupLocation}\n` : '') +
          (dropoffLocation ? `Dropoff: ${dropoffLocation}\n` : '') +
          `Total: $${totalAmount}\n\n` +
          `Safe travels with SafariStay!`;
        
        emailSubject = `Ride Booking Confirmed: ${serviceName}`;
        emailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #C69B6D 0%, #5C4033 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🚗 SafariStay</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Ride Confirmation</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #5C4033; margin-top: 0;">Your Ride is Confirmed!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">${serviceName}</h3>
                <p style="margin: 5px 0;"><strong>📅 From:</strong> ${startDate}</p>
                <p style="margin: 5px 0;"><strong>📅 To:</strong> ${endDate}</p>
                ${pickupLocation ? `<p style="margin: 5px 0;"><strong>📍 Pickup:</strong> ${pickupLocation}</p>` : ''}
                ${dropoffLocation ? `<p style="margin: 5px 0;"><strong>📍 Dropoff:</strong> ${dropoffLocation}</p>` : ''}
                <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="margin: 5px 0; font-size: 20px;"><strong>Total: $${totalAmount}</strong></p>
              </div>
              <p style="color: #666; font-size: 14px;">Safe travels with SafariStay!</p>
            </div>
          </div>
        `;
        break;
        
      case 'event_hall':
        smsMessage = `SafariStay Venue Booked!\n\n` +
          `Venue: ${serviceName}\n` +
          `Date: ${eventDate}\n` +
          (eventType ? `Event: ${eventType}\n` : '') +
          `Guests: ${expectedGuests}\n` +
          `Duration: ${hours}\n` +
          `Total: $${totalAmount}\n\n` +
          `Thank you for choosing SafariStay!`;
        
        emailSubject = `Venue Booking Confirmed: ${serviceName}`;
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
