// supabase/functions/ical-proxy/index.ts - FIX AUTORIZZAZIONE
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  console.log(`📥 Edge Function called: ${req.method}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling CORS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body - SEMPLIFICATO
    console.log('🔍 Parsing request body...');
    const requestBody = await req.json();
    console.log('✅ Request parsed:', { hasUrl: !!requestBody?.url });

    const { url } = requestBody;
    
    if (!url || typeof url !== 'string') {
      console.error('❌ URL parameter missing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'URL parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🌐 Processing URL: ${url}`);

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (urlError) {
      console.error('❌ Invalid URL format:', urlError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid URL format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Security check - expanded whitelist
    const hostname = parsedUrl.hostname.toLowerCase();
    const allowedHosts = [
      // Airbnb
      'airbnb.com', 'airbnb.it', 'airbnb.co.uk', 'airbnb.fr', 'airbnb.de',
      // Booking
      'booking.com', 'booking.it', 'ical.booking.com',
      // Google Calendar
      'calendar.google.com',
      // Microsoft
      'outlook.live.com', 'outlook.office365.com',
      // Development/Testing
      'raw.githubusercontent.com', 'github.com'
    ];
    
    const isAllowed = allowedHosts.some(host => 
      hostname === host || hostname.endsWith(`.${host}`)
    );
    
    if (!isAllowed) {
      console.error(`❌ Unauthorized host: ${hostname}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unauthorized calendar source: ${hostname}` 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Host authorized: ${hostname}`);

    // Fetch calendar data
    console.log('🔍 Fetching calendar data...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TerrazzaSantaChiara-CalendarSync/1.0',
        'Accept': 'text/calendar, text/plain, application/ics, */*',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📊 Fetch response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ HTTP error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Remote server error: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Read response data
    console.log('🔍 Reading response data...');
    const icalData = await response.text();
    console.log(`📄 Read ${icalData.length} characters`);

    if (!icalData || icalData.length < 10) {
      console.error('❌ Empty calendar data');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Empty or invalid calendar data' 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Basic validation
    const upperData = icalData.toUpperCase();
    const hasVCalendar = upperData.includes('BEGIN:VCALENDAR');
    const hasEvents = upperData.includes('BEGIN:VEVENT');
    
    console.log(`📋 Validation: hasVCalendar=${hasVCalendar}, hasEvents=${hasEvents}`);
    
    if (!hasVCalendar) {
      console.error('❌ Invalid iCal format');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid iCal format - missing VCALENDAR' 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Successfully processed calendar`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: icalData,
        size: icalData.length,
        source: hostname,
        hasEvents: hasEvents,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      }
    );

  } catch (error) {
    console.error('❌ Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});