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
  created_at: string;
}

interface SyncProgress {
  step: string;
  current: number;
  total: number;
}

interface SyncResult {
  success: boolean;
  eventsProcessed: number;
  datesBlocked: number;
  errors: string[];
}

export const useICalSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  /**
   * Download iCal data from URL - With CORS proxy support
   */
  const downloadICalData = useCallback(async (url: string): Promise<string> => {
    console.log('📥 Downloading iCal data from:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Check if this is a CORS-blocked service
    const urlLower = url.toLowerCase();
    const isAirbnb = urlLower.includes('airbnb');
    const isBooking = urlLower.includes('booking');
    const needsCorsProxy = isAirbnb || isBooking;

    // Use CORS proxy for problematic services
    const finalUrl = needsCorsProxy 
      ? `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      : url;

    if (needsCorsProxy) {
      console.log('🔄 Using CORS proxy for Airbnb/Booking URL');
    }

    try {
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TerrazzaSantaChiara/1.0',
          'Accept': needsCorsProxy ? 'application/json' : 'text/calendar, application/ics, text/plain, */*',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let icalData: string;
      
      if (needsCorsProxy) {
        // Parse the JSON response from CORS proxy
        const proxyResponse = await response.json();
        if (proxyResponse.status && proxyResponse.status.http_code !== 200) {
          throw new Error(`Remote server error: ${proxyResponse.status.http_code}`);
        }
        icalData = proxyResponse.contents;
        console.log('📄 Downloaded via CORS proxy:', icalData.length, 'characters');
      } else {
        // Direct download
        icalData = await response.text();
        console.log('📄 Downloaded directly:', icalData.length, 'characters');
      }

      if (!icalData || icalData.length < 50) {
        throw new Error('Downloaded data appears to be empty or too short');
      }

      // Clean and validate iCal data more flexibly
      let cleanedData = icalData.trim();
      
      // Check if data is base64 encoded (common with Airbnb)
      if (cleanedData.startsWith('data:text/calendar') && cleanedData.includes('base64,')) {
        console.log('🔍 Detected base64 encoded data URL, decoding...');
        const base64Data = cleanedData.split('base64,')[1];
        try {
          cleanedData = atob(base64Data);
          console.log('✅ Successfully decoded base64 data:', cleanedData.length, 'characters');
        } catch (decodeError) {
          console.error('❌ Failed to decode base64 data:', decodeError);
          throw new Error('Failed to decode base64 iCal data');
        }
      }
      
      const upperData = cleanedData.toUpperCase();
      
      console.log('🔍 Data validation after decoding:', {
        length: cleanedData.length,
        startsWithBegin: upperData.startsWith('BEGIN:'),
        containsVCalendar: upperData.includes('BEGIN:VCALENDAR'),
        containsVEvent: upperData.includes('BEGIN:VEVENT'),
        preview: cleanedData.substring(0, 200)
      });

      if (!upperData.includes('BEGIN:VCALENDAR') && !upperData.includes('VCALENDAR')) {
        console.error('❌ Invalid iCal format after decoding. First 500 chars:', cleanedData.substring(0, 500));
        throw new Error('Downloaded data does not appear to be valid iCal format (missing VCALENDAR)');
      }

      console.log('✅ Successfully downloaded, decoded and validated iCal data');
      return cleanedData;

    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        throw new Error(`Download failed: ${err.message}`);
      }
      throw new Error('Download failed: Unknown error');
    }
  }, []);

  /**
   * Parse iCal data using ICAL.js - Simplified approach
   */
  const parseICalEvents = useCallback((icalData: string): ParsedEvent[] => {
    console.log('🔍 Parsing iCal data with ICAL.js...');
    
    try {
      // Parse the iCal string into jCal format
      const jcalData = ICAL.parse(icalData);
      console.log('✅ Successfully parsed jCal data');
      
      // Create ICAL.Component from jCal data
      const vcalendar = new ICAL.Component(jcalData);
      console.log('✅ Created ICAL.Component');
      
      // Get all VEVENT subcomponents
      const vevents = vcalendar.getAllSubcomponents('vevent');
      console.log(`📅 Found ${vevents.length} VEVENT components`);
      
      const parsedEvents: ParsedEvent[] = [];

      // Process each VEVENT
      for (const vevent of vevents) {
        try {
          // Create ICAL.Event wrapper for easier property access
          const icalEvent = new ICAL.Event(vevent);
          
          // Check event status - skip cancelled/tentative events
          const statusProp = vevent.getFirstProperty('status');
          if (statusProp) {
            const statusValue = statusProp.getFirstValue();
            if (typeof statusValue === 'string' && 
                ['CANCELLED', 'TENTATIVE'].includes(statusValue.toUpperCase())) {
              console.log(`⏭️  Skipping ${statusValue} event: ${icalEvent.summary}`);
              continue;
            }
          }

          // Get start and end dates
          if (!icalEvent.startDate || !icalEvent.endDate) {
            console.warn(`⚠️ Skipping event with missing dates: ${icalEvent.summary}`);
            continue;
          }

          const startDate = icalEvent.startDate.toJSDate();
          const endDate = icalEvent.endDate.toJSDate();
          
          // Skip events with invalid date ranges
          if (startDate >= endDate) {
            console.warn(`⚠️ Skipping event with invalid date range: ${icalEvent.summary}`);
            continue;
          }

          // Create parsed event
          const parsedEvent: ParsedEvent = {
            uid: icalEvent.uid || `generated-${Date.now()}-${Math.random()}`,
            summary: icalEvent.summary || 'External Booking',
            startDate,
            endDate,
            description: icalEvent.description || undefined
          };

          parsedEvents.push(parsedEvent);
          console.log(`✅ Parsed: ${parsedEvent.summary} (${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')})`);

        } catch (eventError) {
          console.warn(`⚠️ Failed to parse individual event:`, eventError);
          continue;
        }
      }

      console.log(`🎉 Successfully parsed ${parsedEvents.length} valid events`);
      return parsedEvents;

    } catch (parseError) {
      console.error('❌ Failed to parse iCal data:', parseError);
      throw new Error(
        parseError instanceof Error 
          ? `iCal parsing failed: ${parseError.message}`
          : 'iCal parsing failed: Unknown error'
      );
    }
  }, []);

  /**
   * Convert events to availability records
   */
  const createAvailabilityRecords = useCallback((
    events: ParsedEvent[], 
    roomId: string
  ): AvailabilityRecord[] => {
    console.log(`🔄 Converting ${events.length} events to availability records...`);
    
    const records: AvailabilityRecord[] = [];
    const processedDates = new Set<string>();

    for (const event of events) {
      try {
        // Get all dates in the booking period
        const bookingDates = eachDayOfInterval({
          start: event.startDate,
          end: event.endDate
        });

        console.log(`📅 Processing ${event.summary}: ${bookingDates.length} dates`);

        for (const date of bookingDates) {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Skip duplicates
          if (processedDates.has(dateStr)) {
            console.log(`⏭️  Date ${dateStr} already processed, skipping`);
            continue;
          }
          
          processedDates.add(dateStr);

          records.push({
            room_id: roomId,
            date: dateStr,
            is_available: false, // External bookings block availability
            created_at: new Date().toISOString()
          });
        }

        console.log(`✅ Processed event: ${event.summary}`);

      } catch (err) {
        console.warn(`⚠️ Failed to process event ${event.uid}:`, err);
        continue;
      }
    }

    console.log(`🎉 Created ${records.length} availability records`);
    return records;
  }, []);

  /**
   * Clear existing availability data for room
   */
  const clearAvailabilityData = async (roomId: string): Promise<void> => {
    console.log('🧹 Clearing existing availability data for room:', roomId);
    
    const { error } = await supabase
      .from('room_availability')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Failed to clear existing data: ${error.message}`);
    }

    console.log('✅ Successfully cleared existing availability data');
  };

  /**
   * Insert availability records in batches
   */
  const insertAvailabilityRecords = async (records: AvailabilityRecord[]): Promise<void> => {
    if (records.length === 0) {
      console.log('ℹ️ No records to insert');
      return;
    }
    
    console.log(`💾 Inserting ${records.length} availability records...`);
    
    const batchSize = 100;
    const batches = [];
    
    // Split records into batches
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} records each`);

    // Insert each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      setProgress({
        step: 'Saving availability data',
        current: i + 1,
        total: batches.length
      });

      const { error } = await supabase
        .from('room_availability')
        .insert(batch);

      if (error) {
        throw new Error(`Batch ${i + 1} failed: ${error.message}`);
      }

      console.log(`✅ Batch ${i + 1}/${batches.length} inserted successfully`);
    }

    console.log('🎉 All availability records inserted successfully');
  };

  /**
   * Validate iCal URL accessibility - Fixed Airbnb detection
   */
  const validateICalUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      console.log('🔍 Validating iCal URL:', url);
      
      // Basic URL validation
      new URL(url); // Throws if invalid
      
      // Enhanced detection for Airbnb and Booking URLs
      const urlLower = url.toLowerCase();
      const isAirbnb = urlLower.includes('airbnb') && urlLower.includes('.ics');
      const isBooking = urlLower.includes('booking') && urlLower.includes('.ics');
      
      console.log(`🔍 URL Analysis: isAirbnb=${isAirbnb}, isBooking=${isBooking}`);
      
      if (isAirbnb || isBooking) {
        const platform = isAirbnb ? 'Airbnb' : 'Booking.com';
        console.log(`📋 Detected ${platform} URL - using format validation`);
        
        // For Airbnb/Booking, validate URL structure instead of making HTTP requests
        const hasIcsExtension = urlLower.includes('.ics');
        const hasValidStructure = isAirbnb ? 
          (urlLower.includes('/calendar/ical/') && urlLower.includes('?s=')) :
          (urlLower.includes('calendar') || urlLower.includes('ical'));
        
        console.log(`🔍 Structure check: hasIcs=${hasIcsExtension}, hasValidStructure=${hasValidStructure}`);
        
        if (hasIcsExtension && hasValidStructure) {
          console.log(`✅ ${platform} URL format validation: VALID`);
          return true;
        } else {
          console.log(`❌ ${platform} URL format validation: INVALID (missing required components)`);
          return false;
        }
      }
      
      // For non-Airbnb/Booking URLs, try actual HTTP requests
      console.log('🔗 Non-platform URL detected, attempting HTTP validation...');
      
      try {
        console.log('🔗 Trying HEAD request...');
        const headResponse = await fetch(url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'TerrazzaSantaChiara/1.0',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (headResponse.ok) {
          console.log('✅ HEAD request successful: VALID');
          return true;
        } else {
          console.log(`⚠️ HEAD request failed with status: ${headResponse.status}`);
        }
      } catch (headError) {
        console.log('⚠️ HEAD request failed:', headError);
      }
      
      // Fallback: try GET request
      try {
        console.log('🔗 Trying GET request as fallback...');
        const getResponse = await fetch(url, { 
          method: 'GET',
          headers: {
            'User-Agent': 'TerrazzaSantaChiara/1.0',
            'Accept': 'text/calendar, text/plain, */*',
          },
          signal: AbortSignal.timeout(15000)
        });
        
        if (getResponse.ok) {
          console.log('✅ GET request successful: VALID');
          return true;
        } else {
          console.log(`❌ GET request failed with status: ${getResponse.status}`);
        }
      } catch (getError) {
        console.log('❌ GET request failed:', getError);
      }
      
      console.log('❌ All validation methods failed: INVALID');
      return false;
      
    } catch (err) {
      console.log('❌ URL validation exception:', err);
      return false;
    }
  }, []);

  /**
   * Main sync function
   */
  const syncCalendar = useCallback(async (
    roomId: string,
    icalUrl: string,
    source: 'airbnb' | 'booking'
  ): Promise<SyncResult> => {
    console.log('🚀 Starting iCal sync:', { roomId, source, url: icalUrl });
    
    setLoading(true);
    setError(null);
    setProgress(null);

    const result: SyncResult = {
      success: false,
      eventsProcessed: 0,
      datesBlocked: 0,
      errors: []
    };

    try {
      // Step 1: Validate URL
      setProgress({ step: 'Validating calendar URL', current: 1, total: 5 });
      const isValid = await validateICalUrl(icalUrl);
      if (!isValid) {
        throw new Error('Invalid or inaccessible calendar URL');
      }

      // Step 2: Download iCal data
      setProgress({ step: 'Downloading calendar data', current: 2, total: 5 });
      const icalData = await downloadICalData(icalUrl);

      // Step 3: Parse events
      setProgress({ step: 'Processing calendar events', current: 3, total: 5 });
      const events = parseICalEvents(icalData);
      result.eventsProcessed = events.length;

      // Step 4: Clear existing data
      setProgress({ step: 'Clearing old availability data', current: 4, total: 5 });
      await clearAvailabilityData(roomId);

      // Step 5: Create and save new records
      setProgress({ step: 'Saving new availability data', current: 5, total: 5 });
      const records = createAvailabilityRecords(events, roomId);
      result.datesBlocked = records.length;
      
      await insertAvailabilityRecords(records);

      // Success!
      result.success = true;
      setLastSyncTime(new Date());
      console.log('🎉 iCal sync completed successfully!');
      console.log(`📊 Summary: ${result.eventsProcessed} events processed → ${result.datesBlocked} dates blocked`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      result.errors.push(message);
      setError(message);
      console.error('❌ iCal sync failed:', err);
    } finally {
      setLoading(false);
      setProgress(null);
    }

    return result;
  }, [downloadICalData, parseICalEvents, createAvailabilityRecords, validateICalUrl]);

  /**
   * Clear sync data for room
   */
  const clearSyncData = useCallback(async (roomId: string): Promise<void> => {
    console.log('🧹 Clearing sync data for room:', roomId);
    
    setLoading(true);
    setError(null);

    try {
      await clearAvailabilityData(roomId);
      setLastSyncTime(new Date());
      console.log('✅ Successfully cleared sync data');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear sync data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Functions
    syncCalendar,
    clearSyncData,
    validateICalUrl,
    
    // State
    loading,
    error,
    progress,
    lastSyncTime
  };
};