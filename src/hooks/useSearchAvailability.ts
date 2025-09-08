// src/hooks/useSearchAvailability.ts - COMPLETE implementation with dynamic pricing

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import { ROOM_MAPPING } from '@/utils/roomMapping';

interface RoomWithAvailabilityAndPricing {
  id: string;
  name: string;
  base_price: number;
  capacity: number;
  slug: string;
  roomType: string;
  isAvailable: boolean;
  // Dynamic pricing fields
  dynamicPrice?: number;
  pricePerNight?: number;
  hasOverrides?: boolean;
  priceBreakdown?: Array<{
    date: string;
    price: number;
    isOverride: boolean;
  }>;
}

interface UseSearchAvailabilityProps {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

// Helper function to determine if date is high season
const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth() + 1;
  return month >= 6 && month <= 9; // June-September
};

// Helper function to get room slug from id
const getRoomSlugById = (roomId: string): string => {
  const roomTypeEntry = Object.entries(ROOM_MAPPING).find(([, id]) => id === roomId);
  
  if (roomTypeEntry) {
    const roomType = roomTypeEntry[0];
    const slugMap: { [key: string]: string } = {
      garden: 'garden-room',
      terrace: 'terrace-apartment',
      modern: 'modern-apartment',
      stone: 'stone-vault-apartment'
    };
    return slugMap[roomType] || 'unknown-room';
  }
  
  return 'unknown-room';
};

export const useSearchAvailability = ({ checkIn, checkOut, guests }: UseSearchAvailabilityProps) => {
  const [rooms, setRooms] = useState<RoomWithAvailabilityAndPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stabilize the search parameters to prevent infinite loops
  const searchParams = useMemo(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return null;
    }
    
    return {
      checkInStr: format(checkIn, 'yyyy-MM-dd'),
      checkOutStr: format(checkOut, 'yyyy-MM-dd'),
      guests
    };
  }, [checkIn?.getTime(), checkOut?.getTime(), guests]);

  // Track fetched params to prevent duplicate calls
  const lastFetchedParams = useRef<string | null>(null);
  const currentParamsKey = searchParams ? JSON.stringify(searchParams) : null;

  useEffect(() => {
    if (!searchParams) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches for same parameters
    if (lastFetchedParams.current === currentParamsKey) {
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      lastFetchedParams.current = currentParamsKey;

      try {
        console.log(`🔍 Search availability with dynamic pricing - Check-in: ${searchParams.checkInStr}, Check-out: ${searchParams.checkOutStr}, Guests: ${searchParams.guests}`);

        // Get all active rooms that fit capacity
        const { data: allRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .gte('capacity', searchParams.guests);

        if (roomsError) {
          throw roomsError;
        }

        if (!allRooms || allRooms.length === 0) {
          console.log('📋 No rooms found matching capacity criteria');
          setRooms([]);
          setLoading(false);
          return;
        }

        console.log(`🏨 Found ${allRooms.length} rooms matching capacity`);

        // Get all dates we need to check (excluding checkout day)
        const dateRange = eachDayOfInterval({ start: checkIn!, end: checkOut! });
        const stayDates = dateRange.slice(0, -1); // Remove checkout date
        const dateStrings = dateRange.map(date => format(date, 'yyyy-MM-dd'));

        const roomsWithAvailabilityAndPricing: RoomWithAvailabilityAndPricing[] = [];

        // Process each room
        for (const room of allRooms) {
          // Generate proper slug for the room
          const roomSlug = getRoomSlugById(room.id);
          
          // Map room to RoomType for internal processing
          const roomTypeEntry = Object.entries(ROOM_MAPPING).find(([, id]) => id === room.id);
          const roomType = roomTypeEntry ? roomTypeEntry[0] : 'unknown';

          try {
            let isAvailable = true;
            let unavailableReason = '';
            let dynamicPrice: number | undefined;
            let pricePerNight: number | undefined;
            let hasOverrides = false;
            let priceBreakdown: Array<{date: string; price: number; isOverride: boolean}> = [];

            // Check for booking conflicts
            const { data: conflictingBookings, error: bookingError } = await supabase
              .from('bookings')
              .select('check_in, check_out, guests_count')
              .eq('room_id', room.id)
              .eq('status', 'confirmed')
              .or(`and(check_in.lt.${searchParams.checkOutStr},check_out.gt.${searchParams.checkInStr})`);

            if (bookingError) throw bookingError;

            if (conflictingBookings && conflictingBookings.length > 0) {
              isAvailable = false;
              unavailableReason = `Booked (${conflictingBookings.length} conflict${conflictingBookings.length > 1 ? 's' : ''})`;
            }

            // Check admin availability blocks and get pricing data
            let availabilityBlocks: any[] = [];
            if (isAvailable) {
              const { data: blocks, error: availError } = await supabase
                .from('room_availability')
                .select('date, is_available, price_override')
                .eq('room_id', room.id)
                .in('date', dateStrings);

              if (availError) throw availError;

              availabilityBlocks = blocks || [];

              // Check admin blocks
              const blockedDates = availabilityBlocks.filter(block => !block.is_available);
              if (blockedDates.length > 0) {
                isAvailable = false;
                unavailableReason = `Admin blocked (${blockedDates.length} date${blockedDates.length > 1 ? 's' : ''})`;
              }
            }

            // Calculate dynamic pricing (only if available)
            if (isAvailable) {
              priceBreakdown = stayDates.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const override = availabilityBlocks.find(block => 
                  block.date === dateStr && block.price_override
                );
                
                const basePrice = isHighSeason(date) ? room.high_season_price : room.base_price;
                const finalPrice = override?.price_override || basePrice;
                
                if (override?.price_override) {
                  hasOverrides = true;
                }
                
                return {
                  date: dateStr,
                  price: finalPrice,
                  isOverride: !!override?.price_override
                };
              });

              dynamicPrice = priceBreakdown.reduce((sum, day) => sum + day.price, 0);
              pricePerNight = priceBreakdown.length > 0 ? dynamicPrice / priceBreakdown.length : room.base_price;

              console.log(`💰 ${room.name}: €${dynamicPrice} total, €${Math.round(pricePerNight)}/night avg ${hasOverrides ? '(with overrides)' : ''}`);
            } else {
              // Not available - still show base pricing for display
              pricePerNight = room.base_price;
              console.log(`📅 ${room.name}: Not available, showing base price €${pricePerNight}/night`);
            }

            console.log(`${isAvailable ? '✅' : '❌'} ${room.name}: ${isAvailable ? 'AVAILABLE' : unavailableReason}`);

            roomsWithAvailabilityAndPricing.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: roomSlug,
              roomType,
              isAvailable,
              // Dynamic pricing data
              dynamicPrice,
              pricePerNight: pricePerNight || room.base_price,
              hasOverrides,
              priceBreakdown
            });

          } catch (error) {
            console.error(`💥 Exception checking room ${room.name}:`, error);
            // On exception, assume unavailable for safety
            roomsWithAvailabilityAndPricing.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: roomSlug,
              roomType,
              isAvailable: false,
              pricePerNight: room.base_price
            });
          }
        }

        const availableCount = roomsWithAvailabilityAndPricing.filter(r => r.isAvailable).length;
        console.log(`🏁 Search complete: ${availableCount}/${roomsWithAvailabilityAndPricing.length} rooms available`);

        setRooms(roomsWithAvailabilityAndPricing);

      } catch (err) {
        console.error('💥 Search availability error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    
  }, [searchParams, currentParamsKey]);

  const availableRooms = rooms.filter(room => room.isAvailable);
  const unavailableRooms = rooms.filter(room => !room.isAvailable);

  return {
    allRooms: rooms,
    availableRooms,
    unavailableRooms,
    loading,
    error,
    refetch: () => {
      lastFetchedParams.current = null;
      setLoading(true);
    }
  };
};