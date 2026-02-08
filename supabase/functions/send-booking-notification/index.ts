import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingNotification {
  type: 'accommodation' | 'ride' | 'event_hall';
  serviceName: string;
  customerPhone?: string;
  providerPhone?: string;
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
      providerPhone, 
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

    // Get Africa's Talking credentials from secrets
    const apiKey = Deno.env.get('AT_API_KEY');
    const username = Deno.env.get('AT_USERNAME') || 'sandbox';
    const shortcode = Deno.env.get('AT_SHORTCODE');

    // Build message based on booking type
    let message = '';
    
    switch (type) {
      case 'accommodation':
        message = `SafariStay Booking Confirmed!\n\n` +
          `Property: ${serviceName}\n` +
          `Check-in: ${checkIn}\n` +
          `Check-out: ${checkOut}\n` +
          `Guests: ${guests}\n` +
          `Total: $${totalAmount}\n\n` +
          `Thank you for booking with SafariStay!`;
        break;
        
      case 'ride':
        message = `SafariStay Ride Booked!\n\n` +
          `Vehicle: ${serviceName}\n` +
          `Dates: ${startDate} - ${endDate}\n` +
          (pickupLocation ? `Pickup: ${pickupLocation}\n` : '') +
          (dropoffLocation ? `Dropoff: ${dropoffLocation}\n` : '') +
          `Total: $${totalAmount}\n\n` +
          `Safe travels with SafariStay!`;
        break;
        
      case 'event_hall':
        message = `SafariStay Venue Booked!\n\n` +
          `Venue: ${serviceName}\n` +
          `Date: ${eventDate}\n` +
          (eventType ? `Event: ${eventType}\n` : '') +
          `Guests: ${expectedGuests}\n` +
          `Duration: ${hours}\n` +
          `Total: $${totalAmount}\n\n` +
          `Thank you for choosing SafariStay!`;
        break;
    }

    // Provider notification message
    const providerMessage = `New Booking Alert!\n\n` +
      `Service: ${serviceName}\n` +
      `Type: ${type.replace('_', ' ')}\n` +
      `Amount: $${totalAmount}\n\n` +
      `Check your dashboard for details.`;

    // If Africa's Talking API key is configured, send SMS
    if (apiKey && (customerPhone || providerPhone)) {
      const atUrl = username === 'sandbox' 
        ? 'https://api.sandbox.africastalking.com/version1/messaging'
        : 'https://api.africastalking.com/version1/messaging';

      const recipients = [customerPhone, providerPhone].filter(Boolean);

      for (const phone of recipients) {
        const isProvider = phone === providerPhone;
        
        try {
          const response = await fetch(atUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'apiKey': apiKey,
            },
            body: new URLSearchParams({
              username,
              to: phone!,
              message: isProvider ? providerMessage : message,
              ...(shortcode ? { from: shortcode } : {})
            }),
          });

          const result = await response.json();
          console.log(`SMS sent to ${phone}:`, result);
        } catch (smsError) {
          console.error(`Failed to send SMS to ${phone}:`, smsError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Booking notification sent via SMS',
          type 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // If no API key, log the notification (for development/demo)
    console.log('Booking notification (SMS not configured):', {
      type,
      serviceName,
      customerPhone,
      providerPhone,
      totalAmount,
      message
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking notification logged (SMS not configured)',
        type,
        notification: message
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
