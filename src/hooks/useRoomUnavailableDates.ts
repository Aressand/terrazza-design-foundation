// src/hooks/useRoomUnavailableDates.ts

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { format, addMonths, eachDayOfInterval, parseISO } from 'date-fns';

export const useRoomUnavailableDates = (roomType: RoomType) => {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range: today to 6 months from now
  const dateRange = useMemo(() => {
    const today = new Date();
    const sixMonthsLater = addMonths(today, 6);
    return {
      start: format(today, 'yyyy-MM-dd'),
      end: format(sixMonthsLater, 'yyyy-MM-dd')
    };
  }, []);

  const roomId = getRoomId(roomType);

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch confirmed bookings for the room in the date range
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('check_in, check_out')
          .eq('room_id', roomId)
          .eq('status', 'confirmed')
          .gte('check_in', dateRange.start)
          .lte('check_in', dateRange.end);

        if (bookingsError) throw bookingsError;

        // Fetch manual availability blocks for the room in the date range  
        const { data: availabilityBlocks, error: availabilityError } = await supabase
          .from('room_availability')
          .select('date')
          .eq('room_id', roomId)
          .eq('is_available', false)
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);

        if (availabilityError) throw availabilityError;

        const unavailableDatesSet = new Set<string>();

        // Add all dates from confirmed bookings
        if (bookings) {
          for (const booking of bookings) {
            const checkIn = parseISO(booking.check_in);
            const checkOut = parseISO(booking.check_out);
            
            // 🚀 COMPLETE SAME-DAY TURNOVER: Include only overnight nights (exclude both check-in and checkout days)
            // This allows: checkout morning + check-in afternoon on SAME DAY for different bookings
            const bookingDates = eachDayOfInterval({ start: checkIn, end: checkOut })
              .slice(1, -1); // Remove BOTH check-in AND checkout day for full same-day turnover
              
            bookingDates.forEach(date => {
              unavailableDatesSet.add(format(date, 'yyyy-MM-dd'));
            });
          }
        }

        // Add manually blocked dates
        if (availabilityBlocks) {
          availabilityBlocks.forEach(block => {
            unavailableDatesSet.add(block.date);
          });
        }

        // Convert to Date objects
        const unavailableDatesArray = Array.from(unavailableDatesSet)
          .map(dateStr => parseISO(dateStr))
          .sort((a, b) => a.getTime() - b.getTime());

        setUnavailableDates(unavailableDatesArray);

      } catch (err) {
        console.error('Error fetching unavailable dates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load unavailable dates');
        setUnavailableDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableDates();
  }, [roomId, dateRange.start, dateRange.end]);

  return {
    unavailableDates,
    loading,
    error,
    refetch: () => {
      setLoading(true);
    }
  };
};