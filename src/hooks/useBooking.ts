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
  ConflictType
} from '@/types/booking';
import { format, eachDayOfInterval, addDays } from 'date-fns';

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
        setError(err instanceof Error ? err.message : 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomType]);

  return { roomData, loading, error };
};

const generateNightDates = (checkIn: Date, checkOut: Date): string[] => {
  const nightStartDates = eachDayOfInterval({ start: checkIn, end: checkOut })
    .slice(0, -1)
    .map(date => format(date, 'yyyy-MM-dd'));

  return nightStartDates;
};

const checkExistingBookings = async (
  roomId: string,
  checkInDate: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const checkOutDate = nightDates.length > 0 
    ? format(addDays(new Date(nightDates[nightDates.length - 1]), 1), 'yyyy-MM-dd')
    : checkInDate;

  const { data: bookingConflicts, error } = await supabase
    .from('bookings')
    .select('check_in, check_out, guest_name')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .or(`and(check_in.lt.${checkOutDate},check_out.gt.${checkInDate})`);

  if (error) throw error;

  return (bookingConflicts || []).map(booking => ({
    type: 'booking' as const,
    check_in: booking.check_in,
    check_out: booking.check_out,
    guest_name: booking.guest_name
  }));
};

const checkCheckInDateBlocks = async (
  roomId: string,
  checkInDate: string
): Promise<ConflictType[]> => {
  const { data: blocks, error } = await (supabase as any)
    .from('room_availability')
    .select('date, block_type, is_available')
    .eq('room_id', roomId)
    .eq('date', checkInDate)
    .eq('is_available', false);

  if (error) throw error;

  return (blocks || []).map((block: any) => ({
    type: 'blocked' as const,
    date: block.date,
    block_type: block.block_type || 'full',
    reason: `Check-in blocked by ${block.block_type === 'prep_before' ? 'preparation time' : 'external calendar'}`
  }));
};

const checkNightDatesBlocks = async (
  roomId: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const { data: blocks, error } = await (supabase as any)
    .from('room_availability')
    .select('date, block_type, is_available')
    .eq('room_id', roomId)
    .in('date', nightDates)
    .eq('is_available', false);

  if (error) throw error;

  const fullBlocks = (blocks || []).filter((block: any) => {
    const blockType = block.block_type || 'full';
    return blockType === 'full';
  });

  return fullBlocks.map((block: any) => ({
    type: 'blocked' as const,
    date: block.date,
    block_type: 'full',
    reason: 'Night blocked by external calendar'
  }));
};

const checkNightBasedConflicts = async (
  roomId: string,
  checkInDate: string,
  nightDates: string[]
): Promise<ConflictType[]> => {
  const allConflicts: ConflictType[] = [];

  const bookingConflicts = await checkExistingBookings(roomId, checkInDate, nightDates);
  allConflicts.push(...bookingConflicts);

  const checkInConflicts = await checkCheckInDateBlocks(roomId, checkInDate);
  allConflicts.push(...checkInConflicts);

  if (nightDates.length > 0) {
    const nightConflicts = await checkNightDatesBlocks(roomId, nightDates);
    allConflicts.push(...nightConflicts);
  }

  return allConflicts;
};

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
      const nightDates = generateNightDates(checkIn, checkOut);
      const conflicts = await checkNightBasedConflicts(roomId, checkInStr, nightDates);
      const isAvailable = conflicts.length === 0;

      return {
        isAvailable,
        conflicts
      };
    } catch (err) {
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

export const usePricingCalculation = (roomType: RoomType) => {
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
      const basePrice = roomTotal / nights;
      const cleaningFee = 0;
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
      return null;
    }
  }, [roomData, getPriceForDate]);

  return { calculatePricing, loading };
};

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

      const confirmationNumber = `TSC-${Date.now().toString(36).toUpperCase()}`;

      return {
        id: data.id,
        confirmation_number: confirmationNumber,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        room_name: '',
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
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createBooking, submitting, error };
};