// src/hooks/useICalSync.ts - TYPESCRIPT FIXED (Type assertion solution)
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import ICAL from 'ical.js';

// Simplified interfaces
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

export const useICalSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  /**
   * Download iCal data via Edge Function
   */
  const downloadICalData = useCallback(async (url: string): Promise<string> => {
    console.log('Downloading iCal via Edge Function:', url);
    
    const { data, error } = await supabase.functions.invoke('ical-proxy', {
      body: { url },
      headers: { 'Content-Type': 'application/json' }
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Edge Function failed');
    }

    console.log(`Downloaded ${data.size} characters from ${data.source}`);
    return data.data;
  }, []);

  /**
   * Parse iCal data using ICAL.js
   */
  const parseICalEvents = useCallback((icalData: string): ParsedEvent[] => {
    console.log('Parsing iCal data...');
    
    try {
      const jcalData = ICAL.parse(icalData);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents('vevent');
      
      console.log(`Found ${vevents.length} VEVENT components`);
      
      const parsedEvents: ParsedEvent[] = [];

      for (const vevent of vevents) {
        try {
          const icalEvent = new ICAL.Event(vevent);
          
          if (!icalEvent.startDate || !icalEvent.endDate) {
            continue;
          }

          const startDate = icalEvent.startDate.toJSDate();
          const endDate = icalEvent.endDate.toJSDate();

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
          console.warn(`Failed to parse event:`, eventError);
          continue;
        }
      }

      console.log(`Successfully parsed ${parsedEvents.length} valid events`);
      return parsedEvents;

    } catch (parseError) {
      console.error('Failed to parse iCal data:', parseError);
      throw new Error(`iCal parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  }, []);

  /**
   * Convert events to availability records (FIXED: excludes checkout date)
   */
  const createAvailabilityRecords = useCallback((
    events: ParsedEvent[], 
    roomId: string
  ): AvailabilityRecord[] => {
    console.log(`Converting ${events.length} events to availability records...`);
    
    const records: AvailabilityRecord[] = [];
    const processedDates = new Set<string>();

    for (const event of events) {
      try {
        const allDates = eachDayOfInterval({
          start: event.startDate,
          end: event.endDate
        });

        // Exclude checkout date (last day) - FIX for checkout bug
        const bookingDates = allDates.slice(0, -1);

        for (const date of bookingDates) {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          if (processedDates.has(dateStr)) {
            continue;
          }
          
          processedDates.add(dateStr);

          records.push({
            room_id: roomId,
            date: dateStr,
            is_available: false,
            created_at: new Date().toISOString()
          });
        }

      } catch (err) {
        console.warn(`Failed to process event ${event.uid}:`, err);
        continue;
      }
    }

    console.log(`Created ${records.length} availability records`);
    return records;
  }, []);

  /**
   * Get active calendar configurations - FIXED WITH TYPE ASSERTION
   */
  const getActiveConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    console.log('Fetching active calendar configurations...');
    
    try {
      // TYPE ASSERTION FIX: Cast supabase to any to bypass type check
      const supabaseAny = supabase as any;
      
      // Step 1: Get room_ical_configs
      const { data: configsData, error: configsError } = await supabaseAny
        .from('room_ical_configs')
        .select('*')
        .eq('is_active', true)
        .order('room_id');

      if (configsError) {
        throw new Error(`Failed to fetch configurations: ${configsError.message}`);
      }

      if (!configsData || configsData.length === 0) {
        console.log('No active configurations found');
        return [];
      }

      // Step 2: Get room names separately
      const roomIds = configsData.map((config: any) => config.room_id);
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds);

      if (roomsError) {
        console.warn('Failed to fetch room names:', roomsError);
      }

      // Step 3: Manually combine data
      const roomNameMap = new Map();
      if (roomsData) {
        roomsData.forEach((room: any) => {
          roomNameMap.set(room.id, room.name);
        });
      }

      // Step 4: Create final config objects
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

      console.log(`Found ${configs.length} active configurations`);
      return configs;

    } catch (err) {
      console.error('Failed to fetch configurations:', err);
      throw err;
    }
  }, []);

  /**
   * Clear existing availability data for room
   */
  const clearAvailabilityData = useCallback(async (roomId: string): Promise<void> => {
    console.log(`Clearing availability data for room: ${roomId}`);
    
    const { error } = await supabase
      .from('room_availability')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Failed to clear data: ${error.message}`);
    }

    console.log('Availability data cleared');
  }, []);

  /**
   * Insert availability records in batches
   */
  const insertAvailabilityRecords = useCallback(async (records: AvailabilityRecord[]): Promise<void> => {
    if (records.length === 0) {
      console.log('No records to insert');
      return;
    }
    
    console.log(`Inserting ${records.length} availability records...`);
    
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('room_availability')
        .insert(batch);

      if (error) {
        throw new Error(`Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`);
      }
    }

    console.log('All records inserted successfully');
  }, []);

  /**
   * Update configuration with sync result - FIXED WITH TYPE ASSERTION
   */
  const updateSyncResult = useCallback(async (
    configId: string,
    success: boolean,
    eventsProcessed: number = 0,
    datesBlocked: number = 0,
    errorMessage?: string
  ): Promise<void> => {
    try {
      // TYPE ASSERTION FIX: Cast supabase to any
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
        console.warn('Failed to update sync result:', error);
      } else {
        console.log('Sync result updated successfully');
      }

    } catch (updateError) {
      console.warn('Failed to update sync result:', updateError);
    }
  }, []);

  /**
   * Sync single calendar configuration
   */
  const syncSingleConfig = useCallback(async (config: CalendarConfig): Promise<RoomSyncResult> => {
    const startTime = Date.now();
    console.log(`Syncing ${config.room_name} (${config.platform})`);
    
    try {
      // Download iCal data
      const icalData = await downloadICalData(config.ical_url);
      
      // Parse events
      const events = parseICalEvents(icalData);
      
      // Clear existing data
      await clearAvailabilityData(config.room_id);
      
      // Create and insert new records
      const records = createAvailabilityRecords(events, config.room_id);
      await insertAvailabilityRecords(records);
      
      const executionTime = Date.now() - startTime;
      
      // Update database
      await updateSyncResult(config.id, true, events.length, records.length);
      
      console.log(`${config.room_name} (${config.platform}): ${events.length} events → ${records.length} dates`);
      
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      console.error(`${config.room_name} (${config.platform}) failed:`, errorMessage);
      
      // Update database with error
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
   * Manual sync of all active calendars
   */
  const syncAllCalendars = useCallback(async (): Promise<MultiRoomSyncResult> => {
    console.log('Starting manual multi-room sync');
    
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
      // Get active configurations
      const configs = await getActiveConfigs();
      result.totalConfigs = configs.length;
      
      if (configs.length === 0) {
        throw new Error('No active calendar configurations found');
      }

      // Sync each configuration
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

        // Small delay between rooms (1 second for manual sync)
        if (i < configs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      result.success = result.successfulSyncs > 0;
      setLastSyncTime(new Date());

      console.log(`Manual sync completed: ${result.successfulSyncs}/${result.totalConfigs} successful`);

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
   * Get configurations that need sync (client-side filtering)
   */
  const getPendingConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    console.log('Checking for configurations that need sync...');
    
    const allConfigs = await getActiveConfigs();
    const now = new Date();
    
    const pendingConfigs = allConfigs.filter(config => {
      if (!config.last_sync_at) {
        return true; // Never synced
      }
      
      try {
        const lastSync = new Date(config.last_sync_at);
        const hoursAgo = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        return hoursAgo >= config.sync_interval_hours;
      } catch {
        return true; // Invalid date, needs sync
      }
    });

    console.log(`Found ${pendingConfigs.length} configurations needing sync`);
    return pendingConfigs;
  }, [getActiveConfigs]);

  /**
   * Process automatic sync (for cron jobs)
   */
  const processAutomaticSync = useCallback(async (): Promise<MultiRoomSyncResult> => {
    console.log('Processing automatic sync...');
    
    const result: MultiRoomSyncResult = {
      success: false,
      totalConfigs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Get configurations that need sync
      const configs = await getPendingConfigs();
      result.totalConfigs = configs.length;

      if (configs.length === 0) {
        console.log('No configurations need sync at this time');
        result.success = true;
        return result;
      }

      // Process each configuration (no delay for automatic sync)
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
      console.log(`Automatic sync completed: ${result.successfulSyncs}/${result.totalConfigs} successful`);

    } catch (err) {
      console.error('Automatic sync failed:', err);
    }

    return result;
  }, [getPendingConfigs, syncSingleConfig]);

  /**
   * Get sync status for monitoring
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
   * DEBUGGING: Test if table exists
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
      
      console.log('Table access test successful:', data);
      return true;
    } catch (err) {
      console.error('Table access test exception:', err);
      return false;
    }
  }, []);

  return {
    // Primary functions
    syncAllCalendars,
    processAutomaticSync,
    
    // Configuration management
    getActiveConfigs,
    getPendingConfigs,
    getSyncStatus,
    
    // Debugging
    testTableAccess,
    
    // State
    loading,
    error,
    progress,
    lastSyncTime
  };
};