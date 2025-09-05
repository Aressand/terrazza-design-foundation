// supabase/functions/ical-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`📥 Edge Function called: ${req.method} from ${req.headers.get('origin')}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { url } = await req.json()
    console.log(`🌐 Processing iCal URL: ${url}`)
    
    if (!url) {
      console.error('❌ URL parameter missing')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'URL parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      console.error('❌ Invalid URL format')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid URL format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Security check - only allow known calendar services
    const hostname = parsedUrl.hostname.toLowerCase()
    const allowedHosts = [
      'airbnb.com', 'airbnb.it', 'airbnb.co.uk', 'airbnb.fr', 'airbnb.de',
      'booking.com', 'booking.it',
      'ical.booking.com', // Specifico per Booking iCal
      'calendar.google.com',
      'outlook.live.com', 'outlook.office365.com'
    ]
    
    const isAllowed = allowedHosts.some(host => 
      hostname === host || hostname.endsWith(`.${host}`)
    )
    
    if (!isAllowed) {
      console.error(`❌ Unauthorized calendar source: ${hostname}`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unauthorized calendar source: ${hostname}` 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`✅ Authorized host: ${hostname}`)
    console.log(`🔄 Fetching iCal data...`)

    // Fetch the iCal data with proper headers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TerrazzaSantaChiara-CalendarSync/1.0',
        'Accept': 'text/calendar, application/ics, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
        'Cache-Control': 'no-cache', // Force fresh data
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Remote server error: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const icalData = await response.text()
    console.log(`📄 Downloaded ${icalData.length} characters`)
    
    if (!icalData || icalData.length < 50) {
      console.error('❌ Empty or invalid calendar data')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Empty or invalid calendar data' 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Basic iCal format validation
    const upperData = icalData.toUpperCase()
    if (!upperData.includes('BEGIN:VCALENDAR')) {
      console.error('❌ Invalid iCal format - missing VCALENDAR')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid iCal format - missing VCALENDAR' 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`✅ Successfully fetched and validated iCal data`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: icalData,
        size: icalData.length,
        source: hostname,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    
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
    )
  }
})