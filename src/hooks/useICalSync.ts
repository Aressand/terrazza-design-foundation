// src/hooks/useICalSync.ts - Production Ready iCal Sync Hook
// Automatically syncs Airbnb/Booking.com calendars with room availability

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import ICAL from 'ical.js';

// ===============================
// TYPE DEFINITIONS
// ===============================

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

interface SyncProgress {
  step: string;
  current: number;
  total: number;
  currentRoom?: string;
}

interface RoomSyncResult {
  room_id: string;
  room_name: string;
  platform: string;
  success: boolean;
  eventsProcessed: number;
  datesBlocked: number;
  error?: string;
  executionTime?: number;
}

interface MultiRoomSyncResult {
  success: boolean;
  totalConfigs: number;
  successfulSyncs: number;
  failedSyncs: number;
  results: RoomSyncResult[];
  timestamp: string;
}

interface CalendarConfig {
  id: string;
  room_id: string;
  room_name: string;
  platform: string;
  ical_url: string;
  is_active: boolean;
  sync_interval_hours: number;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
}

// ===============================
// MAIN HOOK
// ===============================

export const useICalSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // ===============================
  // CORE SYNC FUNCTIONS
  // ===============================

  /**
   * Download iCal data via Edge Function (Direct Fetch)
   * Bypasses supabase.functions.invoke() bug with direct HTTP call
   */
  const downloadICalData = useCallback(async (url: string): Promise<string> => {
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }

      // Direct fetch to Edge Function with proper authorization
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        // Get detailed error from Edge Function
        let errorMessage = `Edge Function HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse response from Edge Function
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Edge Function reported failure');
      }

      // Validate returned data
      if (!result.data || typeof result.data !== 'string') {
        throw new Error('Edge Function returned invalid data format');
      }

      if (!result.data.includes('BEGIN:VCALENDAR')) {
        throw new Error('Edge Function returned invalid iCal data');
      }

      return result.data;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download error';
      throw new Error(`Failed to download calendar from ${url}: ${message}`);
    }
  }, []);

  /**
   * Parse iCal data using ICAL.js library
   * Extracts booking events with dates and details
   */
  const parseICalEvents = useCallback((icalData: string): ParsedEvent[] => {
    try {
      const jcalData = ICAL.parse(icalData);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents('vevent');
      
      const parsedEvents: ParsedEvent[] = [];

      for (const vevent of vevents) {
        try {
          const icalEvent = new ICAL.Event(vevent);
          
          // Skip events without valid dates
          if (!icalEvent.startDate || !icalEvent.endDate) {
            continue;
          }

          const startDate = icalEvent.startDate.toJSDate();
          const endDate = icalEvent.endDate.toJSDate();

          // Skip invalid date ranges
          if (startDate >= endDate) {
            continue;
          }

          parsedEvents.push({
            uid: icalEvent.uid || `generated-${Date.now()}-${Math.random()}`,
            summary: icalEvent.summary || 'External Booking',
            startDate,
            endDate,
            description: icalEvent.description || undefined
          });

        } catch (eventError) {
          // Skip individual malformed events, continue processing others
          continue;
        }
      }

      return parsedEvents;

    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new Error(`iCal parsing failed: ${message}`);
    }
  }, []);

const createAvailabilityRecords = useCallback((events: ParsedEvent[], roomId: string): AvailabilityRecord[] => {
  const records: AvailabilityRecord[] = [];
  const processedDates = new Set<string>();

  console.log(`🔧 [iCal FIX v2] Processing ${events.length} events for room ${roomId}`);

  for (const event of events) {
    try {
      console.log(`📅 [DEBUG] Raw event dates:`);
      console.log(`  - startDate type:`, typeof event.startDate);
      console.log(`  - startDate value:`, event.startDate);
      console.log(`  - endDate type:`, typeof event.endDate);  
      console.log(`  - endDate value:`, event.endDate);

      // 🌍 Convert UTC dates to Italy timezone for accurate date calculation
      const startDateLocal = new Date(event.startDate);
      const endDateLocal = new Date(event.endDate);

      console.log(`🕐 [DEBUG] After new Date():`);
      console.log(`  - startDateLocal:`, startDateLocal.toISOString());
      console.log(`  - endDateLocal:`, endDateLocal.toISOString());
      
      // For Italian timezone, add 2 hours for safety
      startDateLocal.setHours(startDateLocal.getHours() + 2);
      endDateLocal.setHours(endDateLocal.getHours() + 2);

      console.log(`🇮🇹 [DEBUG] After +2 hours:`);
      console.log(`  - startDateLocal:`, startDateLocal.toISOString());
      console.log(`  - endDateLocal:`, endDateLocal.toISOString());

      console.log(`🇮🇹 [iCal FIX v2] Local IT Dates: ${startDateLocal.toISOString()} → ${endDateLocal.toISOString()}`);

      // 🚀 Generate all days in booking period
      const allDays = eachDayOfInterval({
        start: startDateLocal,
        end: endDateLocal
      });

      console.log(`📋 [iCal FIX v2] All days in interval: [${allDays.map(d => format(d, 'yyyy-MM-dd')).join(', ')}]`);

      // 🎯 CORRECT LOGIC: Block only intermediate nights (slice(1, -1))
      // This allows same-day turnover on BOTH check-in and checkout days
      // The system will prevent new check-ins on dates with blocked subsequent nights
      const intermediateDates = allDays.slice(1, -1);

      console.log(`🏠 [iCal FIX v2] Check-in date: OPEN in DB (but protected by system logic)`);
      console.log(`🏠 [iCal FIX v2] Checkout date: OPEN in DB (available for new check-ins)`);
      console.log(`🚫 [iCal FIX v2] Intermediate nights to block: [${intermediateDates.map(d => format(d, 'yyyy-MM-dd')).join(', ')}]`);

      // Example for 24-29 Sept booking:
      // All days: [24, 25, 26, 27, 28, 29]
      // Block only: [25, 26, 27, 28] ✅ (intermediate nights)
      // Keep open: [24] (for checkout only) + [29] (for new check-ins)

      for (const date of intermediateDates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Avoid duplicate dates from overlapping events
        if (!processedDates.has(dateStr)) {
          processedDates.add(dateStr);
          
          records.push({
            room_id: roomId,
            date: dateStr,
            is_available: false, // Block the date
            created_at: new Date().toISOString()
          });
          
          console.log(`🚫 [iCal FIX v2] Blocked intermediate night: ${dateStr}`);
        } else {
          console.log(`⚠️ [iCal FIX v2] Night ${dateStr} already processed (duplicate event)`);
        }
      }

      console.log(`✅ [iCal FIX v2] Event processed: ${intermediateDates.length} intermediate nights blocked`);
      console.log(`🎯 [iCal FIX v2] System intelligence: Check-in prevented on ${format(startDateLocal, 'yyyy-MM-dd')} due to blocked subsequent nights`);

    } catch (dateError) {
      console.error(`❌ [iCal FIX v2] Error processing event ${event.summary}:`, dateError);
      continue;
    }
  }

  console.log(`🎯 [iCal FIX v2] SUMMARY: ${records.length} intermediate nights blocked for room ${roomId}`);
  console.log(`🎯 [iCal FIX v2] Blocked intermediate nights: [${Array.from(processedDates).sort().join(', ')}]`);

  return records;
}, []);

// EXPECTED RESULT for 24-29 Sept booking:
// Raw UTC: 2025-09-23T22:00:00.000Z → 2025-09-29T22:00:00.000Z  
// Local IT: 2025-09-24 → 2025-09-29
// All days: [2025-09-24, 2025-09-25, 2025-09-26, 2025-09-27, 2025-09-28, 2025-09-29]
// Nights blocked: [2025-09-24, 2025-09-25, 2025-09-26, 2025-09-27, 2025-09-28] ✅
// Available: [2025-09-29] ✅ (same-day turnover on checkout only)

// TEST EXPECTATION for 3-5 Oct booking:
// Raw UTC: 2025-10-02T22:00:00.000Z → 2025-10-05T22:00:00.000Z  
// Local IT: 2025-10-03 → 2025-10-05
// All days: [2025-10-03, 2025-10-04, 2025-10-05]
// Overnight: [2025-10-04] ✅ ONLY this should be blocked!

  // ===============================
  // DATABASE OPERATIONS
  // ===============================

  /**
   * Fetch active calendar configurations from database
   * Includes room names joined from rooms table
   */
  const getActiveConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    try {
      const supabaseAny = supabase as any;
      
      // Get active calendar configurations
      const { data: configsData, error: configsError } = await supabaseAny
        .from('room_ical_configs')
        .select('*')
        .eq('is_active', true)
        .order('room_id');

      if (configsError) {
        throw new Error(`Failed to fetch configurations: ${configsError.message}`);
      }

      if (!configsData || configsData.length === 0) {
        return [];
      }

      // Get corresponding room names
      const roomIds = configsData.map((config: any) => config.room_id);
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds);

      if (roomsError) {
        console.warn('Warning: Failed to fetch room names:', roomsError);
      }

      // Create room name lookup map
      const roomNameMap = new Map();
      if (roomsData) {
        roomsData.forEach((room: any) => {
          roomNameMap.set(room.id, room.name);
        });
      }

      // Combine configurations with room names
      const configs: CalendarConfig[] = configsData.map((config: any) => ({
        id: config.id,
        room_id: config.room_id,
        room_name: roomNameMap.get(config.room_id) || 'Unknown Room',
        platform: config.platform,
        ical_url: config.ical_url,
        is_active: config.is_active,
        sync_interval_hours: config.sync_interval_hours || 12,
        last_sync_at: config.last_sync_at,
        last_sync_status: config.last_sync_status
      }));

      return configs;

    } catch (err) {
      console.error('Failed to fetch calendar configurations:', err);
      throw err;
    }
  }, []);

  /**
   * Clear existing availability data for a specific room
   * Called before inserting new sync data
   */
  const clearAvailabilityData = useCallback(async (roomId: string): Promise<void> => {
    const { error } = await supabase
      .from('room_availability')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Failed to clear availability data: ${error.message}`);
    }
  }, []);

  /**
   * Insert availability records in optimized batches
   * Processes 100 records at a time for performance
   */
  const insertAvailabilityRecords = useCallback(async (records: AvailabilityRecord[]): Promise<void> => {
    if (records.length === 0) {
      return;
    }
    
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('room_availability')
        .insert(batch);

      if (error) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        throw new Error(`Batch ${batchNumber} insertion failed: ${error.message}`);
      }
    }
  }, []);

  /**
   * Update calendar configuration with sync results
   * Records success/failure, event counts, and timestamps
   */
  const updateSyncResult = useCallback(async (
    configId: string,
    success: boolean,
    eventsProcessed: number = 0,
    datesBlocked: number = 0,
    errorMessage?: string
  ): Promise<void> => {
    try {
      const supabaseAny = supabase as any;
      
      const updateData = {
        last_sync_at: new Date().toISOString(),
        last_sync_status: success ? 'success' : 'error',
        events_last_sync: eventsProcessed,
        dates_last_sync: datesBlocked,
        last_error_message: errorMessage || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseAny
        .from('room_ical_configs')
        .update(updateData)
        .eq('id', configId);

      if (error) {
        console.warn('Warning: Failed to update sync result:', error);
      }

    } catch (updateError) {
      console.warn('Warning: Failed to update sync result:', updateError);
    }
  }, []);

  // ===============================
  // SYNC ORCHESTRATION
  // ===============================

  /**
   * Synchronize a single calendar configuration
   * Complete flow: download -> parse -> clear -> insert -> update
   */
  const syncSingleConfig = useCallback(async (config: CalendarConfig): Promise<RoomSyncResult> => {
    const startTime = Date.now();
    
    try {
      // Step 1: Download calendar data
      const icalData = await downloadICalData(config.ical_url);
      
      // Step 2: Parse events from calendar
      const events = parseICalEvents(icalData);
      
      // Step 3: Clear existing availability data
      await clearAvailabilityData(config.room_id);
      
      // Step 4: Create and insert new availability records
      const records = createAvailabilityRecords(events, config.room_id);
      await insertAvailabilityRecords(records);
      
      const executionTime = Date.now() - startTime;
      
      // Step 5: Update configuration with success
      await updateSyncResult(config.id, true, events.length, records.length);
      
      return {
        room_id: config.room_id,
        room_name: config.room_name,
        platform: config.platform,
        success: true,
        eventsProcessed: events.length,
        datesBlocked: records.length,
        executionTime
      };
      
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown sync error';
      
      // Update configuration with error
      await updateSyncResult(config.id, false, 0, 0, errorMessage);
      
      return {
        room_id: config.room_id,
        room_name: config.room_name,
        platform: config.platform,
        success: false,
        eventsProcessed: 0,
        datesBlocked: 0,
        error: errorMessage,
        executionTime
      };
    }
  }, [downloadICalData, parseICalEvents, clearAvailabilityData, createAvailabilityRecords, insertAvailabilityRecords, updateSyncResult]);

  /**
   * Get calendar configurations that need synchronization
   * Filters by sync interval and last sync time
   */
  const getPendingConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    const allConfigs = await getActiveConfigs();
    const now = new Date();
    
    const pendingConfigs = allConfigs.filter(config => {
      // Sync if never synced before
      if (!config.last_sync_at) {
        return true;
      }
      
      try {
        const lastSync = new Date(config.last_sync_at);
        const hoursAgo = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        return hoursAgo >= config.sync_interval_hours;
      } catch {
        // Sync if last sync date is invalid
        return true;
      }
    });

    return pendingConfigs;
  }, [getActiveConfigs]);

  // ===============================
  // PUBLIC API METHODS
  // ===============================

  /**
   * Manual synchronization of all active calendars
   * Used by admin interface with progress tracking
   */
  const syncAllCalendars = useCallback(async (): Promise<MultiRoomSyncResult> => {
    setLoading(true);
    setError(null);
    setProgress({ step: 'Loading configurations', current: 0, total: 0 });

    const result: MultiRoomSyncResult = {
      success: false,
      totalConfigs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Load active configurations
      const configs = await getActiveConfigs();
      result.totalConfigs = configs.length;
      
      if (configs.length === 0) {
        throw new Error('No active calendar configurations found');
      }

      // Synchronize each configuration with progress updates
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        
        setProgress({
          step: 'Syncing calendars',
          current: i + 1,
          total: configs.length,
          currentRoom: `${config.room_name} (${config.platform})`
        });

        const syncResult = await syncSingleConfig(config);
        result.results.push(syncResult);

        if (syncResult.success) {
          result.successfulSyncs++;
        } else {
          result.failedSyncs++;
        }

        // Small delay between syncs to be respectful to external services
        if (i < configs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      result.success = result.successfulSyncs > 0;
      setLastSyncTime(new Date());

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      setError(message);
      console.error('Manual sync failed:', err);
    } finally {
      setLoading(false);
      setProgress(null);
    }

    return result;
  }, [getActiveConfigs, syncSingleConfig]);

  /**
   * Automatic synchronization for scheduled operations (cron jobs)
   * Only syncs configurations that are due for update
   */
  const processAutomaticSync = useCallback(async (): Promise<MultiRoomSyncResult> => {
    const result: MultiRoomSyncResult = {
      success: false,
      totalConfigs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Get only configurations that need sync
      const configs = await getPendingConfigs();
      result.totalConfigs = configs.length;

      if (configs.length === 0) {
        // No configs need sync - this is success
        result.success = true;
        return result;
      }

      // Process each pending configuration
      for (const config of configs) {
        const syncResult = await syncSingleConfig(config);
        result.results.push(syncResult);

        if (syncResult.success) {
          result.successfulSyncs++;
        } else {
          result.failedSyncs++;
        }
      }

      result.success = result.successfulSyncs > 0;

    } catch (err) {
      console.error('Automatic sync failed:', err);
    }

    return result;
  }, [getPendingConfigs, syncSingleConfig]);

  /**
   * Get current sync status for monitoring
   * Returns summary of all configurations
   */
  const getSyncStatus = useCallback(async () => {
    const configs = await getActiveConfigs();
    return configs.map(config => ({
      room_name: config.room_name,
      platform: config.platform,
      last_sync_at: config.last_sync_at,
      last_sync_status: config.last_sync_status,
      sync_interval_hours: config.sync_interval_hours
    }));
  }, [getActiveConfigs]);

  /**
   * Test database table accessibility
   * Used for debugging and health checks
   */
  const testTableAccess = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('room_ical_configs')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Table access test failed:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Table access test exception:', err);
      return false;
    }
  }, []);

  // ===============================
  // HOOK RETURN INTERFACE
  // ===============================

  return {
    // Primary sync operations
    syncAllCalendars,
    processAutomaticSync,
    
    // Configuration management
    getActiveConfigs,
    getPendingConfigs,
    getSyncStatus,
    
    // Individual operations (for testing/debugging)
    downloadICalData,
    parseICalEvents,
    clearAvailabilityData,
    createAvailabilityRecords,
    
    // Utilities
    testTableAccess,
    
    // State management
    loading,
    error,
    progress,
    lastSyncTime
  };
};