// src/hooks/useBooking.ts 

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
  PricingCalculation,
  ConflictType // 🆕 Import new type
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
 * 🆕 FIXED Hook to check room availability for given dates
 * Now checks both bookings table AND room_availability table to prevent overbooking
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

      // 🆕 Generate array of all nights in the stay (check-in to check-out exclusive)
      const stayDates = eachDayOfInterval({ start: checkIn, end: checkOut })
        .slice(0, -1) // Remove checkout day (not a night stayed)
        .map(date => format(date, 'yyyy-MM-dd'));

      // Check 1: Conflicting bookings in bookings table
      const { data: bookingConflicts, error: bookingError } = await supabase
        .from('bookings')
        .select('check_in, check_out, guest_name')
        .eq('room_id', roomId)
        .eq('status', 'confirmed')
        .or(`and(check_in.lt.${checkOutStr},check_out.gt.${checkInStr})`);

      if (bookingError) throw bookingError;

      // Check 2: 🆕 Blocked dates in room_availability table (iCal sync blocks)
      const { data: availabilityConflicts, error: availabilityError } = await supabase
        .from('room_availability')
        .select('date, is_available')
        .eq('room_id', roomId)
        .eq('is_available', false)
        .in('date', stayDates);

      if (availabilityError) throw availabilityError;

      // 🆕 Combine all conflicts
      const allConflicts: ConflictType[] = [
        ...(bookingConflicts || []).map(booking => ({
          type: 'booking' as const,
          check_in: booking.check_in,
          check_out: booking.check_out,
          guest_name: booking.guest_name
        })),
        ...(availabilityConflicts || []).map(block => ({
          type: 'blocked' as const,
          date: block.date,
          reason: 'Admin blocked or external calendar sync'
        }))
      ];

      const isAvailable = allConflicts.length === 0;

      // 🆕 Enhanced logging for debugging
      if (!isAvailable) {
        console.log(`🚫 Availability check FAILED for room ${roomId} (${checkInStr} to ${checkOutStr})`);
        console.log(`📅 Nights checked: ${stayDates.join(', ')}`);
        console.log(`🔴 Booking conflicts: ${bookingConflicts?.length || 0}`);
        console.log(`🔴 Blocked dates: ${availabilityConflicts?.length || 0}`);
        console.log('🔍 All conflicts:', allConflicts);
      } else {
        console.log(`✅ Availability check PASSED for room ${roomId} (${checkInStr} to ${checkOutStr})`);
      }

      return {
        isAvailable,
        conflicts: allConflicts
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
 * Hook to calculate pricing with dynamic price overrides
 */
export const usePricingCalculation = (roomType: RoomType) => {
  // Use the availability management hook to get price function
  const { getPriceForDate, roomData, loading } = useAvailabilityManagement(roomType);

  const calculatePricing = useCallback((
    checkIn: Date | null,
    checkOut: Date | null
  ): PricingCalculation | null => {
    if (!checkIn || !checkOut || !roomData || !getPriceForDate) {
      return null;
    }

    try {
      const stayDates = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1);
      
      let roomTotal = 0;
      for (const date of stayDates) {
        roomTotal += getPriceForDate(date);
      }

      const nights = stayDates.length;
      const basePrice = roomTotal / nights; // Average nightly rate
      const cleaningFee = 0; // No cleaning fee for now
      const totalPrice = roomTotal + cleaningFee;

      return {
        basePrice,
        nights,
        roomTotal,
        cleaningFee,
        totalPrice,
        priceBreakdown: {
          nightlyRate: basePrice,
          totalNights: nights,
          subtotal: roomTotal,
          fees: cleaningFee,
          total: totalPrice
        }
      };
    } catch (error) {
      console.error('Error calculating pricing:', error);
      return null;
    }
  }, [roomData, getPriceForDate]);

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
      const nights = eachDayOfInterval({ start: checkIn, end: checkOut }).length - 1;

      const bookingData: BookingSubmission = {
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

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // 🆕 Generate confirmation number (not stored in database)
      const confirmationNumber = `TSC-${Date.now().toString(36).toUpperCase()}`;

      return {
        id: data.id,
        confirmation_number: confirmationNumber,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        room_name: '', // Will be filled by caller
        check_in: data.check_in,
        check_out: data.check_out,
        total_nights: data.total_nights,
        total_price: data.total_price,
        guests_count: data.guests_count,
        special_requests: data.special_requests || '',
        status: data.status || 'confirmed',
        created_at: data.created_at || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createBooking, submitting, error };
};