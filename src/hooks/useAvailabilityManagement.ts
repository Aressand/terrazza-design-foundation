// src/hooks/useAvailabilityManagement.ts - EXTENDED WITH PRICE MANAGEMENT

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
  priceOverride?: number | null; // 🆕 Added price override data
}

// 🆕 Added room data interface
interface RoomData {
  id: string;
  name: string;
  base_price: number;
  high_season_price: number;
}

export const useAvailabilityManagement = (roomType: RoomType) => {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null); // 🆕 Room data state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomId = getRoomId(roomType);

  // 🆕 Fetch room data (base prices, etc.)
  const fetchRoomData = useCallback(async () => {
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name, base_price, high_season_price')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoomData(room);
      
    } catch (err) {
      console.error('Error fetching room data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load room data');
    }
  }, [roomId]);

  // Fetch availability data for next 6 months
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const sixMonthsLater = addMonths(today, 6);
      const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(sixMonthsLater), 'yyyy-MM-dd');

      // Fetch availability blocks with price overrides
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
          hasOverride: block ? !!block.price_override : false, // 🆕 Price override check
          isBooked,
          blockId: block?.id,
          priceOverride: block?.price_override // 🆕 Store price override value
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

  // 🆕 Get price for a specific date
  const getPriceForDate = useCallback((date: Date): number => {
    if (!roomData) return 0;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = availabilityData.find(day => 
      format(day.date, 'yyyy-MM-dd') === dateStr
    );
    
    // Return price override if exists, otherwise base price
    return dayData?.priceOverride || roomData.base_price;
  }, [availabilityData, roomData]);

  // 🆕 Set price override for a specific date
  const setPriceOverride = useCallback(async (date: Date, price: number | null) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      // Find if block already exists
      const existingDay = availabilityData.find(day => 
        format(day.date, 'yyyy-MM-dd') === dateStr
      );

      if (existingDay?.blockId) {
        // Update existing record
        const { error } = await supabase
          .from('room_availability')
          .update({ 
            price_override: price,
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
            is_available: true, // Default to available
            price_override: price,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Refresh data
      await fetchAvailability();

    } catch (err) {
      console.error('Error setting price override:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update price');
    }
  }, [roomId, availabilityData, fetchAvailability]);

  // 🆕 Bulk set prices for date range
  const bulkSetPrices = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    price: number
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
          is_available: true, // Default to available
          price_override: price,
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
      console.error('Error bulk setting prices:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update prices');
    }
  }, [roomId, fetchAvailability]);

  // Toggle availability for a specific date (EXISTING FUNCTION - unchanged)
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

  // Bulk toggle for date range (EXISTING FUNCTION - unchanged)
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
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  }, [roomId, fetchAvailability]);

  // Initialize data on mount or when room type changes
  useEffect(() => {
    fetchRoomData();
    fetchAvailability();
  }, [fetchRoomData, fetchAvailability]);

  return {
    availabilityData,
    roomData, // 🆕 Expose room data (base prices, etc.)
    loading,
    error,
    toggleAvailability,
    bulkToggleAvailability,
    // 🆕 NEW PRICE MANAGEMENT FUNCTIONS:
    getPriceForDate,
    setPriceOverride,
    bulkSetPrices,
    refetch: fetchAvailability
  };
};