// src/hooks/useRoomUnavailableDates.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { format, eachDayOfInterval, parseISO, addMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Night-based hook to get unavailable dates for calendar display
 * Shows dates where check-in is not allowed (preserves same-day turnover)
 */
export const useRoomUnavailableDates = (roomType: RoomType) => {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoading(true);
        setError(null);

        const roomId = getRoomId(roomType);
        const today = new Date();
        
        // Fetch data for 6 months ahead for calendar display
        const dateRange = {
          start: format(startOfMonth(today), 'yyyy-MM-dd'),
          end: format(endOfMonth(addMonths(today, 6)), 'yyyy-MM-dd')
        };

        // Fetch confirmed bookings and availability blocks in parallel
        const [bookingsResponse, availabilityResponse] = await Promise.all([
          fetchConfirmedBookings(roomId, dateRange),
          fetchAvailabilityBlocks(roomId, dateRange)
        ]);

        // Process unavailable dates using night-based logic
        const unavailableDatesSet = new Set<string>();

        // Process bookings with night-based logic
        processBookingUnavailability(bookingsResponse, unavailableDatesSet);

        // Process availability blocks with platform-aware logic
        processAvailabilityBlocksUnavailability(availabilityResponse, unavailableDatesSet);

        // Convert to Date objects and sort
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
  }, [roomType]);

  return {
    unavailableDates,
    loading,
    error,
    refetch: () => setLoading(true)
  };
};

/**
 * Fetch confirmed bookings for the date range
 */
const fetchConfirmedBookings = async (roomId: string, dateRange: { start: string; end: string }) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .gte('check_in', dateRange.start)
    .lte('check_in', dateRange.end);

  if (error) throw error;
  return data || [];
};

/**
 * Fetch availability blocks for the date range
 */
const fetchAvailabilityBlocks = async (roomId: string, dateRange: { start: string; end: string }) => {
  const { data, error } = await (supabase as any)
    .from('room_availability')
    .select('date, block_type, is_available')
    .eq('room_id', roomId)
    .eq('is_available', false)
    .gte('date', dateRange.start)
    .lte('date', dateRange.end);

  if (error) throw error;
  return data || [];
};

/**
 * Process confirmed bookings using night-based logic
 * Block all night start dates (same-day turnover enabled)
 */
const processBookingUnavailability = (
  bookings: Array<{ check_in: string; check_out: string }>,
  unavailableDatesSet: Set<string>
) => {
  for (const booking of bookings) {
    try {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);

      // Night-based logic: Block all nights (represented by their start dates)
      // Example: Booking 7-11 = Nights [7→8, 8→9, 9→10, 10→11]
      // Block dates: [7,8,9,10] (night start dates)
      // Leave free: [11] for same-day turnover
      const nightStartDates = eachDayOfInterval({ start: checkIn, end: checkOut })
        .slice(0, -1); // Remove checkout day (no night starts on checkout)

      nightStartDates.forEach(date => {
        unavailableDatesSet.add(format(date, 'yyyy-MM-dd'));
      });

    } catch (dateError) {
      // Skip malformed booking dates
      continue;
    }
  }
};

/**
 * Process availability blocks with platform-aware logic
 * Different behavior for 'full' vs 'prep_before' blocks
 */
const processAvailabilityBlocksUnavailability = (
  blocks: Array<{ date: string; block_type?: string; is_available: boolean }>,
  unavailableDatesSet: Set<string>
) => {
  for (const block of blocks) {
    const blockType = block.block_type || 'full'; // Default to 'full' for backward compatibility

    if (blockType === 'full') {
      // Full blocks: Completely unavailable for check-in
      unavailableDatesSet.add(block.date);
    } else if (blockType === 'prep_before') {
      // Prep blocks: Block check-in but allow checkout
      // For calendar display: Show as unavailable (user can't start new booking)
      unavailableDatesSet.add(block.date);
    }
    // Note: The distinction between 'full' and 'prep_before' is handled
    // in the availability checking logic, not calendar display
  }
};

// ===============================
// EXPECTED CALENDAR BEHAVIOR
// ===============================

/**
 * TEST CASE 1: Guest Booking 7-11 November
 * Nights: [7→8, 8→9, 9→10, 10→11]
 * Calendar shows unavailable: [7,8,9,10]
 * Calendar shows available: [11] ✅ Same-day turnover enabled
 */

/**
 * TEST CASE 2: Airbnb Prep Time 6 November  
 * Block type: prep_before
 * Calendar shows unavailable: [6] 
 * Behavior: Blocks new bookings starting on 6th, but allows checkout
 */

/**
 * TEST CASE 3: Booking.com Closure 9-14 November
 * Block type: full  
 * Calendar shows unavailable: [9,10,11,12,13]
 * Calendar shows available: [14] (end of admin closure)
 */

/**
 * VISUAL RESULT IN CALENDAR:
 * - Red/disabled dates: Cannot start new booking
 * - Green/enabled dates: Can start new booking (includes same-day turnover dates)
 * - Guest sees accurate availability without technical complexity
 */