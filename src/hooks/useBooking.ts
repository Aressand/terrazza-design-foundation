// src/hooks/useBooking.ts - UPDATED with Dynamic Pricing

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';
import type { 
  RoomData, 
  BookingFormData, 
  BookingSubmission, 
  BookingConfirmation,
  AvailabilityCheck,
  PricingCalculation 
} from '@/types/booking';
import { format, eachDayOfInterval } from 'date-fns';

/**
 * Hook to fetch room data and pricing
 */
export const useRoomData = (roomType: RoomType) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const roomId = getRoomId(roomType);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        
        setRoomData(data);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomType]);

  return { roomData, loading, error };
};

/**
 * Hook to check room availability for given dates
 */
export const useAvailabilityCheck = () => {
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(async (
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date
  ): Promise<AvailabilityCheck> => {
    try {
      setChecking(true);
      
      const roomId = getRoomId(roomType);
      const checkInStr = format(checkIn, 'yyyy-MM-dd');
      const checkOutStr = format(checkOut, 'yyyy-MM-dd');

      // Check for conflicting bookings
      const { data: conflicts, error } = await supabase
        .from('bookings')
        .select('check_in, check_out, guest_name')
        .eq('room_id', roomId)
        .eq('status', 'confirmed')
        .or(`and(check_in.lt.${checkOutStr},check_out.gt.${checkInStr})`);

      if (error) throw error;

      const isAvailable = !conflicts || conflicts.length === 0;

      return {
        isAvailable,
        conflicts: conflicts || []
      };
    } catch (err) {
      console.error('Error checking availability:', err);
      return {
        isAvailable: false,
        conflicts: []
      };
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkAvailability, checking };
};

/**
 * 🆕 UPDATED Hook to calculate pricing with dynamic price overrides
 */
export const usePricingCalculation = (roomType: RoomType) => {
  // 🆕 Use the availability management hook to get price function
  const { getPriceForDate, roomData, loading } = useAvailabilityManagement(roomType);

  const calculatePricing = useCallback((
    checkIn: Date | null,
    checkOut: Date | null
  ): PricingCalculation | null => {
    // Wait for room data to load
    if (!roomData || !checkIn || !checkOut || loading) return null;

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return null;

    // 🆕 Calculate price for each night using dynamic pricing
    const dateRange = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1); // Exclude checkout day
    
    let totalRoomCost = 0;
    let nightlyRates: number[] = [];
    
    for (const date of dateRange) {
      const nightPrice = getPriceForDate(date);
      totalRoomCost += nightPrice;
      nightlyRates.push(nightPrice);
    }

    const avgNightlyRate = Math.round(totalRoomCost / nights);
    const cleaningFee = 25; // Fixed cleaning fee
    const totalPrice = totalRoomCost + cleaningFee;

    console.log(`💰 Dynamic pricing calculation for ${roomType}:`, {
      dates: dateRange.map(d => format(d, 'yyyy-MM-dd')),
      nightlyRates,
      totalRoomCost,
      avgNightlyRate,
      totalPrice
    });

    return {
      basePrice: avgNightlyRate, // Average price across all nights
      nights,
      roomTotal: totalRoomCost,
      cleaningFee,
      totalPrice,
      priceBreakdown: {
        nightlyRate: avgNightlyRate,
        totalNights: nights,
        subtotal: totalRoomCost,
        fees: cleaningFee,
        total: totalPrice
      }
    };
  }, [getPriceForDate, roomData, loading]);

  return { calculatePricing, loading };
};

/**
 * Hook to create a new booking
 */
export const useCreateBooking = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (
    roomType: RoomType,
    checkIn: Date,
    checkOut: Date,
    formData: BookingFormData,
    totalPrice: number
  ): Promise<BookingConfirmation | null> => {
    try {
      setSubmitting(true);
      setError(null);

      const roomId = getRoomId(roomType);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const bookingData: Omit<BookingSubmission, 'id'> = {
        room_id: roomId,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_country: formData.country,
        guests_count: parseInt(formData.guests),
        total_nights: nights,
        total_price: totalPrice,
        special_requests: formData.specialRequests,
        status: 'confirmed'
      };

      console.log('🔄 Creating booking with data:', bookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('*')
        .single();

      if (error) throw error;

      // Generate confirmation
      const confirmation: BookingConfirmation = {
        id: data.id,
        confirmation_number: `TSC-${Date.now().toString(36).toUpperCase()}`,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        room_name: 'Room', // This will be populated by the component
        check_in: data.check_in,
        check_out: data.check_out,
        total_nights: data.total_nights,
        total_price: data.total_price,
        guests_count: data.guests_count,
        special_requests: data.special_requests,
        status: data.status,
        created_at: data.created_at
      };

      console.log('✅ Booking created successfully:', confirmation);
      return confirmation;

    } catch (err) {
      console.error('❌ Booking creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createBooking, submitting, error };
};