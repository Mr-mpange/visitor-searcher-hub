import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

interface USSDResponse {
  response: string;
}

// Simple in-memory session storage (in production, use a database)
const sessions: Record<string, { state: string; data: Record<string, any> }> = {};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    const sessionId = formData.get('sessionId') as string;
    const serviceCode = formData.get('serviceCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const text = formData.get('text') as string;

    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });

    // Parse user input
    const inputs = text ? text.split('*') : [];
    const latestInput = inputs[inputs.length - 1] || '';
    const inputLevel = inputs.length;

    // Get or create session
    if (!sessions[sessionId]) {
      sessions[sessionId] = { state: 'main', data: {} };
    }
    const session = sessions[sessionId];

    let response = '';

    // Main Menu
    if (text === '') {
      response = `CON Welcome to SafariStay!\n` +
        `Your African Adventure Awaits\n\n` +
        `1. Find Accommodation\n` +
        `2. Book a Ride\n` +
        `3. Event Venues\n` +
        `4. My Bookings\n` +
        `5. Help`;
    }
    // Accommodation Menu
    else if (text === '1') {
      session.state = 'accommodation';
      response = `CON Select Location:\n\n` +
        `1. Nairobi\n` +
        `2. Dar es Salaam\n` +
        `3. Cape Town\n` +
        `4. Zanzibar\n` +
        `0. Back`;
    }
    // Accommodation - Location Selected
    else if (text.startsWith('1*') && inputLevel === 2) {
      const locations = ['Nairobi', 'Dar es Salaam', 'Cape Town', 'Zanzibar'];
      const locationIndex = parseInt(latestInput) - 1;
      
      if (locationIndex >= 0 && locationIndex < locations.length) {
        session.data.location = locations[locationIndex];
        response = `CON Accommodations in ${locations[locationIndex]}:\n\n` +
          `1. Safari Lodge - $250/night\n` +
          `2. Beach Resort - $180/night\n` +
          `3. City Hotel - $120/night\n` +
          `0. Back`;
      } else if (latestInput === '0') {
        response = `CON Welcome to SafariStay!\n\n` +
          `1. Find Accommodation\n` +
          `2. Book a Ride\n` +
          `3. Event Venues\n` +
          `4. My Bookings\n` +
          `5. Help`;
      } else {
        response = `END Invalid selection. Please try again.`;
      }
    }
    // Accommodation - Property Selected
    else if (text.startsWith('1*') && inputLevel === 3) {
      const properties = ['Safari Lodge', 'Beach Resort', 'City Hotel'];
      const propertyIndex = parseInt(latestInput) - 1;
      
      if (propertyIndex >= 0 && propertyIndex < properties.length) {
        session.data.property = properties[propertyIndex];
        response = `CON ${properties[propertyIndex]}\n` +
          `Location: ${session.data.location}\n\n` +
          `Enter number of nights (1-30):`;
      } else if (latestInput === '0') {
        response = `CON Select Location:\n\n` +
          `1. Nairobi\n` +
          `2. Dar es Salaam\n` +
          `3. Cape Town\n` +
          `4. Zanzibar\n` +
          `0. Back`;
      } else {
        response = `END Invalid selection.`;
      }
    }
    // Accommodation - Nights Entered
    else if (text.startsWith('1*') && inputLevel === 4) {
      const nights = parseInt(latestInput);
      
      if (nights >= 1 && nights <= 30) {
        session.data.nights = nights;
        const prices: Record<string, number> = { 'Safari Lodge': 250, 'Beach Resort': 180, 'City Hotel': 120 };
        const total = (prices[session.data.property] || 150) * nights;
        session.data.total = total;
        
        response = `CON Booking Summary:\n\n` +
          `${session.data.property}\n` +
          `${session.data.location}\n` +
          `${nights} night(s)\n` +
          `Total: $${total}\n\n` +
          `1. Confirm Booking\n` +
          `0. Cancel`;
      } else {
        response = `END Invalid number of nights. Please enter 1-30.`;
      }
    }
    // Accommodation - Confirm Booking
    else if (text.startsWith('1*') && inputLevel === 5) {
      if (latestInput === '1') {
        // In production, save booking to database
        const bookingRef = `SF${Date.now().toString().slice(-6)}`;
        
        response = `END Booking Confirmed!\n\n` +
          `Ref: ${bookingRef}\n` +
          `${session.data.property}\n` +
          `${session.data.nights} night(s)\n` +
          `Total: $${session.data.total}\n\n` +
          `SMS confirmation sent to ${phoneNumber}`;
        
        // Clean up session
        delete sessions[sessionId];
      } else {
        response = `END Booking cancelled.`;
        delete sessions[sessionId];
      }
    }
    // Rides Menu
    else if (text === '2') {
      session.state = 'rides';
      response = `CON Select Vehicle Type:\n\n` +
        `1. Safari Vehicle - $150/day\n` +
        `2. Airport Transfer - $80\n` +
        `3. City Tour - $45/tour\n` +
        `4. Minibus (15 seats) - $200/day\n` +
        `0. Back`;
    }
    // Rides - Vehicle Selected
    else if (text.startsWith('2*') && inputLevel === 2) {
      const vehicles = [
        { name: 'Safari Vehicle', price: 150, unit: 'day' },
        { name: 'Airport Transfer', price: 80, unit: 'trip' },
        { name: 'City Tour', price: 45, unit: 'tour' },
        { name: 'Minibus', price: 200, unit: 'day' }
      ];
      const vehicleIndex = parseInt(latestInput) - 1;
      
      if (vehicleIndex >= 0 && vehicleIndex < vehicles.length) {
        session.data.vehicle = vehicles[vehicleIndex];
        response = `CON ${vehicles[vehicleIndex].name}\n` +
          `$${vehicles[vehicleIndex].price}/${vehicles[vehicleIndex].unit}\n\n` +
          `1. Book Now\n` +
          `2. View Details\n` +
          `0. Back`;
      } else if (latestInput === '0') {
        response = `CON Welcome to SafariStay!\n\n` +
          `1. Find Accommodation\n` +
          `2. Book a Ride\n` +
          `3. Event Venues\n` +
          `4. My Bookings\n` +
          `5. Help`;
      } else {
        response = `END Invalid selection.`;
      }
    }
    // Rides - Book Now
    else if (text.startsWith('2*') && inputLevel === 3 && latestInput === '1') {
      const bookingRef = `SR${Date.now().toString().slice(-6)}`;
      
      response = `END Ride Booked!\n\n` +
        `Ref: ${bookingRef}\n` +
        `${session.data.vehicle.name}\n` +
        `$${session.data.vehicle.price}\n\n` +
        `Our driver will contact you shortly at ${phoneNumber}`;
      
      delete sessions[sessionId];
    }
    // Events Menu
    else if (text === '3') {
      session.state = 'events';
      response = `CON Event Venues:\n\n` +
        `1. Grand Ballroom (500 guests)\n` +
        `2. Conference Room (200 guests)\n` +
        `3. Garden Pavilion (400 guests)\n` +
        `4. Boardroom (25 guests)\n` +
        `0. Back`;
    }
    // My Bookings
    else if (text === '4') {
      // In production, fetch from database
      response = `CON My Recent Bookings:\n\n` +
        `1. Safari Lodge - Pending\n` +
        `2. Airport Transfer - Confirmed\n` +
        `3. No more bookings\n\n` +
        `0. Back`;
    }
    // Help
    else if (text === '5') {
      response = `END SafariStay Help\n\n` +
        `Call: +254 700 123 456\n` +
        `Email: help@safaristay.com\n` +
        `Web: www.safaristay.com\n\n` +
        `For urgent matters, call our 24/7 helpline.`;
    }
    else {
      response = `END Invalid option. Please dial ${serviceCode} to start again.`;
      delete sessions[sessionId];
    }

    console.log('USSD Response:', response);

    return new Response(response, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/plain'
      },
    });

  } catch (error) {
    console.error('USSD Error:', error);
    return new Response('END An error occurred. Please try again later.', {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'text/plain'
      },
    });
  }
});
