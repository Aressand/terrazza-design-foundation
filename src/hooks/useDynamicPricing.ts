// src/hooks/useDynamicPricing.ts - Dynamic pricing with price overrides

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import type { Room } from '@/hooks/useRooms';

interface PriceOverride {
  date: string;
  price_override: number;
  room_id: string;
}

interface DynamicPriceResult {
  roomId: string;
  totalPrice: number;
  averagePricePerNight: number;
  priceBreakdown: Array<{
    date: string;
    price: number;
    isOverride: boolean;
    isHighSeason: boolean;
  }>;
}

// Helper function to determine if date is high season
const isHighSeason = (date: Date): boolean => {
  const month = date.getMonth() + 1; // 1-based month
  return month >= 6 && month <= 9; // June-September
};

// Helper function to get base price for a specific date
const getBasePriceForDate = (room: Room, date: Date): number => {
  return isHighSeason(date) ? room.high_season_price : room.base_price;
};

export const useDynamicPricing = (
  rooms: Room[], 
  checkIn: Date | null, 
  checkOut: Date | null
) => {
  return useQuery({
    queryKey: ['dynamic-pricing', rooms.map(r => r.id), checkIn, checkOut],
    queryFn: async (): Promise<DynamicPriceResult[]> => {
      if (!checkIn || !checkOut || rooms.length === 0) {
        return [];
      }

      console.log(`💰 Calculating dynamic pricing for ${rooms.length} rooms from ${format(checkIn, 'yyyy-MM-dd')} to ${format(checkOut, 'yyyy-MM-dd')}`);

      // Get all dates in the range
      const datesInRange = eachDayOfInterval({ start: checkIn, end: checkOut });
      const dateStrings = datesInRange.map(date => format(date, 'yyyy-MM-dd'));

      // Fetch price overrides for all rooms and dates
      const { data: priceOverrides, error } = await supabase
        .from('room_availability')
        .select('date, price_override, room_id')
        .in('room_id', rooms.map(r => r.id))
        .in('date', dateStrings)
        .not('price_override', 'is', null);

      if (error) {
        console.error('❌ Error fetching price overrides:', error);
        throw error;
      }

      console.log(`📊 Found ${priceOverrides?.length || 0} price overrides`);

      // Process each room
      const results: DynamicPriceResult[] = rooms.map(room => {
        const roomOverrides = (priceOverrides || []).filter(
          override => override.room_id === room.id
        );

        // Calculate price for each night
        const priceBreakdown = datesInRange.slice(0, -1).map(date => { // Exclude checkout date
          const dateStr = format(date, 'yyyy-MM-dd');
          const override = roomOverrides.find(o => o.date === dateStr);
          
          const basePrice = getBasePriceForDate(room, date);
          const finalPrice = override?.price_override || basePrice;
          
          return {
            date: dateStr,
            price: finalPrice,
            isOverride: !!override?.price_override,
            isHighSeason: isHighSeason(date)
          };
        });

        const totalPrice = priceBreakdown.reduce((sum, day) => sum + day.price, 0);
        const averagePricePerNight = priceBreakdown.length > 0 ? totalPrice / priceBreakdown.length : 0;

        console.log(`💳 ${room.name}: €${totalPrice} total (${priceBreakdown.length} nights, avg €${Math.round(averagePricePerNight)}/night)`);

        return {
          roomId: room.id,
          totalPrice,
          averagePricePerNight,
          priceBreakdown
        };
      });

      return results;
    },
    enabled: !!checkIn && !!checkOut && rooms.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000
  });
};