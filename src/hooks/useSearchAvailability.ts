// src/hooks/useSearchAvailability.ts

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
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
          setRooms([]);
          setLoading(false);
          return;
        }

        // Process rooms with availability checking
        const roomsWithAvailability: AvailableRoom[] = [];

        for (const room of allRooms) {
          const roomType = getRoomTypeFromSlug(room.slug);
          if (!roomType) continue;

          try {
            // Check for conflicting bookings
            const { data: conflicts, error: conflictsError } = await supabase
              .from('bookings')
              .select('id')
              .eq('room_id', room.id)
              .eq('status', 'confirmed')
              .lt('check_in', searchParams.checkOutStr)
              .gt('check_out', searchParams.checkInStr);

            if (conflictsError) {
              // On error, assume unavailable for safety
              roomsWithAvailability.push({
                id: room.id,
                name: room.name,
                base_price: room.base_price,
                capacity: room.capacity,
                slug: room.slug,
                roomType,
                isAvailable: false
              });
              continue;
            }

            const isAvailable = !conflicts || conflicts.length === 0;

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

        setRooms(roomsWithAvailability);

      } catch (err) {
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