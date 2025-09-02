// src/hooks/useSearchAvailability.ts

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import type { RoomType } from '@/utils/roomMapping';

interface AvailableRoom {
  id: string;
  name: string;
  base_price: number;
  capacity: number;
  slug: string;
  roomType: RoomType;
  isAvailable: boolean;
}

interface UseSearchAvailabilityProps {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

const getRoomTypeFromSlug = (slug: string): RoomType | null => {
  switch (slug) {
    case 'garden-room': return 'garden';
    case 'stone-vault-apartment': return 'stone';
    case 'terrace-apartment': return 'terrace';
    case 'modern-apartment': return 'modern';
    default: return null;
  }
};

export const useSearchAvailability = ({ checkIn, checkOut, guests }: UseSearchAvailabilityProps) => {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
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
        console.log(`🔍 Search availability: ${searchParams.checkInStr} to ${searchParams.checkOutStr} for ${searchParams.guests} guests`);

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
        const dateRange = eachDayOfInterval({ start: checkIn!, end: checkOut! })
          .slice(0, -1) // Remove checkout day
          .map(date => format(date, 'yyyy-MM-dd'));

        console.log(`📅 Checking ${dateRange.length} dates for availability`);

        // Process rooms with comprehensive availability checking
        const roomsWithAvailability: AvailableRoom[] = [];

        for (const room of allRooms) {
          const roomType = getRoomTypeFromSlug(room.slug);
          if (!roomType) {
            console.log(`⚠️ Skipping room ${room.name} - unknown room type for slug: ${room.slug}`);
            continue;
          }

          try {
            // 🔴 CRITICAL FIX: Check BOTH bookings AND admin blocks

            // 1️⃣ Check for conflicting bookings
            const { data: bookingConflicts, error: bookingsError } = await supabase
              .from('bookings')
              .select('id, check_in, check_out')
              .eq('room_id', room.id)
              .eq('status', 'confirmed')
              .lt('check_in', searchParams.checkOutStr)
              .gt('check_out', searchParams.checkInStr);

            if (bookingsError) {
              console.error(`❌ Error checking bookings for room ${room.name}:`, bookingsError);
              roomsWithAvailability.push({
                id: room.id,
                name: room.name,
                base_price: room.base_price,
                capacity: room.capacity,
                slug: room.slug,
                roomType,
                isAvailable: false // Assume unavailable on error for safety
              });
              continue;
            }

            // 2️⃣ Check for admin availability blocks 
            const { data: availabilityBlocks, error: blocksError } = await supabase
              .from('room_availability')
              .select('date, is_available')
              .eq('room_id', room.id)
              .in('date', dateRange);

            if (blocksError) {
              console.error(`❌ Error checking availability blocks for room ${room.name}:`, blocksError);
              roomsWithAvailability.push({
                id: room.id,
                name: room.name,
                base_price: room.base_price,
                capacity: room.capacity,
                slug: room.slug,
                roomType,
                isAvailable: false // Assume unavailable on error for safety
              });
              continue;
            }

            // 3️⃣ Determine final availability
            let isAvailable = true;
            let unavailableReason = '';

            // Check booking conflicts
            if (bookingConflicts && bookingConflicts.length > 0) {
              isAvailable = false;
              unavailableReason = `Booking conflict (${bookingConflicts.length} booking${bookingConflicts.length > 1 ? 's' : ''})`;
            }

            // Check admin blocks (only if no booking conflicts yet)
            if (isAvailable && availabilityBlocks && availabilityBlocks.length > 0) {
              const blockedDates = availabilityBlocks.filter(block => !block.is_available);
              if (blockedDates.length > 0) {
                isAvailable = false;
                unavailableReason = `Admin blocked (${blockedDates.length} date${blockedDates.length > 1 ? 's' : ''})`;
              }
            }

            console.log(`${isAvailable ? '✅' : '❌'} ${room.name}: ${isAvailable ? 'AVAILABLE' : unavailableReason}`);

            roomsWithAvailability.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: room.slug,
              roomType,
              isAvailable
            });

          } catch (error) {
            console.error(`💥 Exception checking room ${room.name}:`, error);
            // On exception, assume unavailable for safety
            roomsWithAvailability.push({
              id: room.id,
              name: room.name,
              base_price: room.base_price,
              capacity: room.capacity,
              slug: room.slug,
              roomType,
              isAvailable: false
            });
          }
        }

        const availableCount = roomsWithAvailability.filter(r => r.isAvailable).length;
        console.log(`🏁 Search complete: ${availableCount}/${roomsWithAvailability.length} rooms available`);

        setRooms(roomsWithAvailability);

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