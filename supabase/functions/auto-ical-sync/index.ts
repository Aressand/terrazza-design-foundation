// supabase/functions/auto-ical-sync/index.ts
// Automatic iCal synchronization function for cron jobs

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface ParsedEvent {
  uid: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

interface AvailabilityRecord {
  room_id: string;
  date: string;
  is_available: boolean;
  created_at: string;
}

interface SyncResult {
  room_id: string;
  room_name: string;
  platform: string;
  success: boolean;
  eventsProcessed: number;
  datesBlocked: number;
  error?: string;
}

serve(async (req) => {
  console.log(`🤖 Auto iCal Sync triggered: ${req.method}`)

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 Fetching configurations that need sync...')

    // Get active configurations
    const { data: configsData, error: configsError } = await supabase
      .from('room_ical_configs')
      .select(`
        id,
        room_id,
        platform,
        ical_url,
        sync_interval_hours,
        last_sync_at,
        rooms!inner(name)
      `)
      .eq('is_active', true)

    if (configsError) {
      throw new Error(`Failed to fetch configs: ${configsError.message}`)
    }

    if (!configsData || configsData.length === 0) {
      console.log('✅ No active configurations found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active configurations found',
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter configurations that need sync
    const now = new Date()
    const pendingConfigs = configsData.filter((config: any) => {
      if (!config.last_sync_at) {
        return true // Never synced
      }
      
      try {
        const lastSync = new Date(config.last_sync_at)
        const hoursAgo = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
        return hoursAgo >= (config.sync_interval_hours || 12)
      } catch {
        return true // Invalid date
      }
    })

    console.log(`📋 Found ${pendingConfigs.length} configurations needing sync`)

    if (pendingConfigs.length === 0) {
      console.log('✅ All configurations are up to date')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All configurations up to date',
          totalConfigs: configsData.length,
          pendingConfigs: 0,
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: SyncResult[] = []

    // Process each pending configuration
    for (const config of pendingConfigs) {
      const roomName = config.rooms?.name || 'Unknown Room'
      console.log(`🔄 Syncing ${roomName} (${config.platform})...`)

      try {
        // Download iCal data
        const icalData = await downloadICalData(config.ical_url)
        
        // Parse events
        const events = parseICalEvents(icalData)
        
        // Clear existing data for this room
        await clearRoomAvailability(supabase, config.room_id)
        
        // Create new availability records
        const records = createAvailabilityRecords(events, config.room_id)
        
        // Insert new records
        if (records.length > 0) {
          await insertAvailabilityRecords(supabase, records)
        }
        
        // Update sync status
        await updateSyncStatus(supabase, config.id, true, events.length, records.length)
        
        results.push({
          room_id: config.room_id,
          room_name: roomName,
          platform: config.platform,
          success: true,
          eventsProcessed: events.length,
          datesBlocked: records.length
        })
        
        console.log(`✅ ${roomName}: ${events.length} events → ${records.length} blocked dates`)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ ${roomName} sync failed:`, errorMessage)
        
        // Update sync status with error
        await updateSyncStatus(supabase, config.id, false, 0, 0, errorMessage)
        
        results.push({
          room_id: config.room_id,
          room_name: roomName,
          platform: config.platform,
          success: false,
          eventsProcessed: 0,
          datesBlocked: 0,
          error: errorMessage
        })
      }

      // Small delay between syncs
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`🎯 Sync completed: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Sync completed: ${successCount}/${results.length} successful`,
        totalConfigs: configsData.length,
        pendingConfigs: pendingConfigs.length,
        successfulSyncs: successCount,
        failedSyncs: failCount,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Auto sync failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Auto sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper Functions
async function downloadICalData(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TerrazzaSantaChiara-AutoSync/1.0',
      'Accept': 'text/calendar, application/ics, text/plain, */*'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.text()
  
  if (!data.includes('BEGIN:VCALENDAR')) {
    throw new Error('Invalid iCal data received')
  }

  return data
}

function parseICalEvents(icalData: string): ParsedEvent[] {
  // Simple iCal parsing for Edge Function context
  const events: ParsedEvent[] = []
  const lines = icalData.split('\n')
  
  let inEvent = false
  let currentEvent: any = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
    } else if (trimmed === 'END:VEVENT' && inEvent) {
      if (currentEvent.dtstart && currentEvent.dtend) {
        try {
          const startDate = parseICalDate(currentEvent.dtstart)
          const endDate = parseICalDate(currentEvent.dtend)
          
          if (startDate && endDate && startDate < endDate) {
            events.push({
              uid: currentEvent.uid || `auto-${Date.now()}-${Math.random()}`,
              summary: currentEvent.summary || 'External Booking',
              startDate,
              endDate,
              description: currentEvent.description
            })
          }
        } catch {
          // Skip malformed events
        }
      }
      inEvent = false
    } else if (inEvent) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).toLowerCase()
        const value = trimmed.substring(colonIndex + 1)
        
        if (key.startsWith('dtstart')) {
          currentEvent.dtstart = value
        } else if (key.startsWith('dtend')) {
          currentEvent.dtend = value
        } else if (key === 'uid') {
          currentEvent.uid = value
        } else if (key === 'summary') {
          currentEvent.summary = value
        } else if (key === 'description') {
          currentEvent.description = value
        }
      }
    }
  }
  
  return events
}

function parseICalDate(dateStr: string): Date | null {
  try {
    // Handle different iCal date formats
    if (dateStr.includes('T')) {
      // DateTime format: 20241210T140000Z
      const clean = dateStr.replace(/[TZ]/g, '')
      const year = parseInt(clean.substring(0, 4))
      const month = parseInt(clean.substring(4, 6)) - 1
      const day = parseInt(clean.substring(6, 8))
      const hour = parseInt(clean.substring(8, 10) || '0')
      const minute = parseInt(clean.substring(10, 12) || '0')
      
      return new Date(year, month, day, hour, minute)
    } else {
      // Date only format: 20241210
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1
      const day = parseInt(dateStr.substring(6, 8))
      
      return new Date(year, month, day)
    }
  } catch {
    return null
  }
}

function createAvailabilityRecords(events: ParsedEvent[], roomId: string): AvailabilityRecord[] {
  const records: AvailabilityRecord[] = []
  const processedDates = new Set<string>()

  for (const event of events) {
    try {
      // Convert UTC dates to Italy timezone for accurate date calculation
      const startDateLocal = new Date(event.startDate)
      const endDateLocal = new Date(event.endDate)
      
      startDateLocal.setHours(startDateLocal.getHours() + 2)
      endDateLocal.setHours(endDateLocal.getHours() + 2)

      // Generate all days in booking period
      const allDays: Date[] = []
      const currentDate = new Date(startDateLocal)
      
      while (currentDate <= endDateLocal) {
        allDays.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Elegant logic: Handle short vs long stays
      const datesToBlock = allDays.length <= 2 
        ? [allDays[0]]           // Short stays: block first day (prevents overbooking)
        : allDays.slice(1, -1)   // Long stays: same-day turnover (optimizes revenue)

      // Process the dates to block
      for (const date of datesToBlock) {
        const dateStr = date.toISOString().split('T')[0]
        
        if (!processedDates.has(dateStr)) {
          processedDates.add(dateStr)
          records.push({
            room_id: roomId,
            date: dateStr,
            is_available: false,
            created_at: new Date().toISOString()
          })
        }
      }

    } catch (dateError) {
      continue
    }
  }

  return records
}

async function clearRoomAvailability(supabase: any, roomId: string): Promise<void> {
  const { error } = await supabase
    .from('room_availability')
    .delete()
    .eq('room_id', roomId)

  if (error) {
    throw new Error(`Failed to clear availability: ${error.message}`)
  }
}

async function insertAvailabilityRecords(supabase: any, records: AvailabilityRecord[]): Promise<void> {
  const batchSize = 100
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('room_availability')
      .insert(batch)

    if (error) {
      throw new Error(`Batch insertion failed: ${error.message}`)
    }
  }
}

async function updateSyncStatus(
  supabase: any,
  configId: string,
  success: boolean,
  eventsProcessed: number,
  datesBlocked: number,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from('room_ical_configs')
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: success ? 'success' : 'error',
      events_last_sync: eventsProcessed,
      dates_last_sync: datesBlocked,
      last_error_message: errorMessage || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', configId)

  if (error) {
    console.warn('Failed to update sync status:', error)
  }
}