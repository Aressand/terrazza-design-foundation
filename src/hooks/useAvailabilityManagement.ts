// src/hooks/useAvailabilityManagement.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { format, addMonths, eachDayOfInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';

interface AvailabilityBlock {
  id: string;
  date: string;
  is_available: boolean;
  price_override?: number | null;
  sync_source?: string;
}

interface AvailabilityDay {
  date: Date;
  isAvailable: boolean;
  hasOverride: boolean;
  isBooked: boolean;
  blockId?: string;
}

export const useAvailabilityManagement = (roomType: RoomType) => {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomId = getRoomId(roomType);

  // Fetch availability data for next 6 months
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const sixMonthsLater = addMonths(today, 6);
      const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(sixMonthsLater), 'yyyy-MM-dd');

      // Fetch availability blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('room_availability')
        .select('*')
        .eq('room_id', roomId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (blocksError) throw blocksError;

      // Fetch bookings for the same period
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('room_id', roomId)
        .eq('status', 'confirmed')
        .gte('check_in', startDate)
        .lte('check_in', endDate);

      if (bookingsError) throw bookingsError;

      // Create a set of booked dates
      const bookedDates = new Set<string>();
      if (bookings) {
        for (const booking of bookings) {
          const checkIn = parseISO(booking.check_in);
          const checkOut = parseISO(booking.check_out);
          const bookingDates = eachDayOfInterval({ start: checkIn, end: checkOut });
          bookingDates.forEach(date => {
            bookedDates.add(format(date, 'yyyy-MM-dd'));
          });
        }
      }

      // Create blocks map
      const blocksMap = new Map<string, AvailabilityBlock>();
      if (blocks) {
        blocks.forEach(block => {
          blocksMap.set(block.date, block);
        });
      }

      // Generate all days for the next 6 months
      const allDays = eachDayOfInterval({ start: today, end: sixMonthsLater });
      
      const availabilityDays: AvailabilityDay[] = allDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const block = blocksMap.get(dateStr);
        const isBooked = bookedDates.has(dateStr);

        return {
          date,
          isAvailable: block ? block.is_available : true, // Default to available
          hasOverride: block ? !!block.price_override : false,
          isBooked,
          blockId: block?.id
        };
      });

      setAvailabilityData(availabilityDays);

    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Toggle availability for a specific date
  const toggleAvailability = useCallback(async (date: Date, currentlyAvailable: boolean) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const newAvailability = !currentlyAvailable;

      // Find if block already exists
      const existingDay = availabilityData.find(day => 
        format(day.date, 'yyyy-MM-dd') === dateStr
      );

      if (existingDay?.blockId) {
        // Update existing record
        const { error } = await supabase
          .from('room_availability')
          .update({ 
            is_available: newAvailability,
            created_at: new Date().toISOString()
          })
          .eq('id', existingDay.blockId);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('room_availability')
          .insert({
            room_id: roomId,
            date: dateStr,
            is_available: newAvailability,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Refresh data
      await fetchAvailability();

    } catch (err) {
      console.error('Error toggling availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  }, [roomId, availabilityData, fetchAvailability]);

  // Bulk toggle for date range
  const bulkToggleAvailability = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    available: boolean
  ) => {
    try {
      const dates = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize);
        
        const operations = batch.map(date => ({
          room_id: roomId,
          date: format(date, 'yyyy-MM-dd'),
          is_available: available,
          created_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('room_availability')
          .upsert(operations, {
            onConflict: 'room_id,date'
          });

        if (error) throw error;
      }

      // Refresh data
      await fetchAvailability();

    } catch (err) {
      console.error('Error bulk toggling availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to bulk update availability');
    }
  }, [roomId, fetchAvailability]);

  // Load data on mount
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availabilityData,
    loading,
    error,
    toggleAvailability,
    bulkToggleAvailability,
    refetch: fetchAvailability
  };
};