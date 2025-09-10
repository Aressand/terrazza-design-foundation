// ENHANCED: src/hooks/useRoomUnavailableDates.ts

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { format, addMonths, eachDayOfInterval, parseISO } from 'date-fns';

// 🆕 ENHANCED return type with separate date categories
export interface UnavailableDatesResult {
  trulyUnavailableDates: Date[];        // From bookings - red everywhere, not clickable
  sameDayTurnoverDates: Date[];         // From room_availability blocks - allow same-day turnover
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRoomUnavailableDates = (roomType: RoomType): UnavailableDatesResult => {
  const [trulyUnavailableDates, setTrulyUnavailableDates] = useState<Date[]>([]);
  const [sameDayTurnoverDates, setSameDayTurnoverDates] = useState<Date[]>([]);
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
        // 🆕 STEP 1: Fetch confirmed bookings (TRULY unavailable - red everywhere)
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('check_in, check_out')
          .eq('room_id', roomId)
          .eq('status', 'confirmed')
          .gte('check_in', dateRange.start)
          .lte('check_in', dateRange.end);

        if (bookingsError) throw bookingsError;

        // 🆕 STEP 2: Fetch manual/iCal availability blocks (SAME-DAY TURNOVER allowed)
        const { data: availabilityBlocks, error: availabilityError } = await supabase
          .from('room_availability')
          .select('date')
          .eq('room_id', roomId)
          .eq('is_available', false)
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);

        if (availabilityError) throw availabilityError;

        // 🆕 STEP 3: Process booking dates (TRULY unavailable)
        const trulyUnavailableSet = new Set<string>();
        if (bookings) {
          for (const booking of bookings) {
            const checkIn = parseISO(booking.check_in);
            const checkOut = parseISO(booking.check_out);
            
            // Include all dates in the booking range (check-in to check-out)
            const bookingDates = eachDayOfInterval({ start: checkIn, end: checkOut });
            bookingDates.forEach(date => {
              trulyUnavailableSet.add(format(date, 'yyyy-MM-dd'));
            });
          }
        }

        // 🆕 STEP 4: Process availability blocks (SAME-DAY TURNOVER allowed)
        const sameDayTurnoverSet = new Set<string>();
        if (availabilityBlocks) {
          availabilityBlocks.forEach(block => {
            sameDayTurnoverSet.add(block.date);
          });
        }

        // 🆕 STEP 5: Convert to Date objects and sort
        const trulyUnavailableDatesArray = Array.from(trulyUnavailableSet)
          .map(dateStr => parseISO(dateStr))
          .sort((a, b) => a.getTime() - b.getTime());

        const sameDayTurnoverDatesArray = Array.from(sameDayTurnoverSet)
          .map(dateStr => parseISO(dateStr))
          .sort((a, b) => a.getTime() - b.getTime());

        // 🆕 STEP 6: Set state with separate arrays
        setTrulyUnavailableDates(trulyUnavailableDatesArray);
        setSameDayTurnoverDates(sameDayTurnoverDatesArray);

        console.log(`📅 Room ${roomType} unavailable dates:
          - Truly unavailable (bookings): ${trulyUnavailableDatesArray.length} dates
          - Same-day turnover allowed (blocks): ${sameDayTurnoverDatesArray.length} dates`);

      } catch (err) {
        console.error('Error fetching unavailable dates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load unavailable dates');
        setTrulyUnavailableDates([]);
        setSameDayTurnoverDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableDates();
  }, [roomId, dateRange.start, dateRange.end, roomType]);

  return {
    trulyUnavailableDates,
    sameDayTurnoverDates,
    loading,
    error,
    refetch: () => {
      setLoading(true);
    }
  };
};