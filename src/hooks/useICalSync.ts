// src/hooks/useICalSync.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import ICAL from 'ical.js';

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
  block_type: string;
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

interface NightBasedStrategy {
  strategy: 'night_based' | 'complete_block';
  blockType: string;
  reason: string;
}

export const useICalSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const downloadICalData = useCallback(async (url: string): Promise<string> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authenticated session found');
      }

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
        let errorMessage = `Edge Function HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Edge Function reported failure');
      }

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

  const parseICalEvents = useCallback((icalData: string): ParsedEvent[] => {
    try {
      const jcalData = ICAL.parse(icalData);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents('vevent');
      
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
          continue;
        }
      }

      return parsedEvents;

    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new Error(`iCal parsing failed: ${message}`);
    }
  }, []);

  const determineNightBasedStrategy = (event: ParsedEvent): NightBasedStrategy => {
    const summary = event.summary.toLowerCase().trim();
    
    if (summary.includes('airbnb')) {
      if (summary.includes('not available')) {
        return {
          strategy: 'complete_block',
          blockType: 'prep_before',
          reason: 'Airbnb preparation time'
        };
      }
      
      return {
        strategy: 'night_based',
        blockType: 'full',
        reason: 'Airbnb guest booking'
      };
    }
    
    if (summary.includes('booking') || summary.includes('closed') || summary.includes('not available')) {
      return {
        strategy: 'complete_block',
        blockType: 'full',
        reason: 'Administrative closure'
      };
    }
    
    return {
      strategy: 'night_based',
      blockType: 'full',
      reason: 'Guest booking'
    };
  };

  const applyNightBasedBlocking = (allDays: Date[], strategy: NightBasedStrategy): Date[] => {
    if (strategy.strategy === 'complete_block') {
      return allDays;
    }
    
    if (strategy.strategy === 'night_based') {
      return allDays;
    }
    
    return allDays;
  };

  const createAvailabilityRecords = useCallback((events: ParsedEvent[], roomId: string): AvailabilityRecord[] => {
    const records: AvailabilityRecord[] = [];
    const processedDates = new Set<string>();

    for (const event of events) {
      try {
        const startDateLocal = new Date(event.startDate);
        const endDateLocal = new Date(event.endDate);
        
        startDateLocal.setHours(startDateLocal.getHours() + 2);
        endDateLocal.setHours(endDateLocal.getHours() + 2);

        const standardDays = eachDayOfInterval({
          start: startDateLocal,
          end: endDateLocal
        }).slice(0, -1);

        if (standardDays.length === 0) continue;

        const blockingStrategy = determineNightBasedStrategy(event);
        const datesToBlock = applyNightBasedBlocking(standardDays, blockingStrategy);

        for (const date of datesToBlock) {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          if (!processedDates.has(dateStr)) {
            processedDates.add(dateStr);
            
            records.push({
              room_id: roomId,
              date: dateStr,
              is_available: false,
              block_type: blockingStrategy.blockType,
              created_at: new Date().toISOString()
            });
          }
        }

      } catch (dateError) {
        continue;
      }
    }

    return records;
  }, []);

  const getActiveConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    try {
      const supabaseAny = supabase as any;
      
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

      const roomIds = configsData.map((config: any) => config.room_id);
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds);

      if (roomsError) {
        // Continue without room names
      }

      const roomNameMap = new Map();
      if (roomsData) {
        roomsData.forEach((room: any) => {
          roomNameMap.set(room.id, room.name);
        });
      }

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
      throw err;
    }
  }, []);

  const clearAvailabilityData = useCallback(async (roomId: string): Promise<void> => {
    const { error } = await supabase
      .from('room_availability')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Failed to clear availability data: ${error.message}`);
    }
  }, []);

  const insertAvailabilityRecords = useCallback(async (records: AvailabilityRecord[]): Promise<void> => {
    if (records.length === 0) {
      return;
    }
    
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const batchWithDefaults = batch.map(record => ({
        room_id: record.room_id,
        date: record.date,
        is_available: record.is_available,
        block_type: record.block_type || 'full',
        created_at: record.created_at
      }));
      
      const { error } = await supabase
        .from('room_availability')
        .insert(batchWithDefaults);

      if (error) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        throw new Error(`Batch ${batchNumber} insertion failed: ${error.message}`);
      }
    }
  }, []);

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
        // Silent warning
      }

    } catch (updateError) {
      // Silent warning
    }
  }, []);

  const syncSingleConfig = useCallback(async (config: CalendarConfig): Promise<RoomSyncResult> => {
    const startTime = Date.now();
    
    try {
      const icalData = await downloadICalData(config.ical_url);
      const events = parseICalEvents(icalData);
      await clearAvailabilityData(config.room_id);
      const records = createAvailabilityRecords(events, config.room_id);
      await insertAvailabilityRecords(records);
      
      const executionTime = Date.now() - startTime;
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

  const getPendingConfigs = useCallback(async (): Promise<CalendarConfig[]> => {
    const allConfigs = await getActiveConfigs();
    const now = new Date();
    
    const pendingConfigs = allConfigs.filter(config => {
      if (!config.last_sync_at) {
        return true;
      }
      
      try {
        const lastSync = new Date(config.last_sync_at);
        const hoursAgo = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
        return hoursAgo >= config.sync_interval_hours;
      } catch {
        return true;
      }
    });

    return pendingConfigs;
  }, [getActiveConfigs]);

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
      const configs = await getActiveConfigs();
      result.totalConfigs = configs.length;
      
      if (configs.length === 0) {
        throw new Error('No active calendar configurations found');
      }

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

        if (i < configs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      result.success = result.successfulSyncs > 0;
      setLastSyncTime(new Date());

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      setError(message);
    } finally {
      setLoading(false);
      setProgress(null);
    }

    return result;
  }, [getActiveConfigs, syncSingleConfig]);

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
      const configs = await getPendingConfigs();
      result.totalConfigs = configs.length;

      if (configs.length === 0) {
        result.success = true;
        return result;
      }

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
      // Silent error handling
    }

    return result;
  }, [getPendingConfigs, syncSingleConfig]);

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

  const testTableAccess = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('room_ical_configs')
        .select('id')
        .limit(1);
      
      if (error) {
        return false;
      }
      
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  return {
    syncAllCalendars,
    processAutomaticSync,
    getActiveConfigs,
    getPendingConfigs,
    getSyncStatus,
    downloadICalData,
    parseICalEvents,
    clearAvailabilityData,
    createAvailabilityRecords,
    testTableAccess,
    loading,
    error,
    progress,
    lastSyncTime
  };
};