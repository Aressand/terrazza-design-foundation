// src/components/booking/BookingWidget.tsx 

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import { differenceInDays, format, eachDayOfInterval } from "date-fns";
import { Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getRoomId, type RoomType } from '@/utils/roomMapping';
import { useRoomUnavailableDates } from '@/hooks/useRoomUnavailableDates';

interface BookingWidgetProps {
  roomType: RoomType;
  roomName: string;
  capacity: number;
  className?: string;
  presetCheckIn?: Date;
  presetCheckOut?: Date;
  presetGuests?: number;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
  roomType,
  roomName,
  capacity,
  className,
  presetCheckIn,
  presetCheckOut,
  presetGuests
}) => {
  // State originale
  const [checkIn, setCheckIn] = useState<Date | null>(presetCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(presetCheckOut || null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const roomId = getRoomId(roomType);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  
  // Hook originale
  const { unavailableDates, loading: unavailabilityLoading } = useRoomUnavailableDates(roomType);
  
  const canBook = checkIn && checkOut && nights > 0 && !availabilityError && roomData && pricing;

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setRoomLoading(true);
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error) throw error;
        setRoomData(data);
      } catch (err) {
        setRoomError('Failed to load room data');
      } finally {
        setRoomLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Pricing calculation
  useEffect(() => {
    if (!checkIn || !checkOut || !roomData || nights <= 0) {
      setPricing(null);
      return;
    }

    const calculatePricing = async () => {
      setPricingLoading(true);
      try {
        // SAME-DAY TURNOVER FIX: Only nights stayed for pricing too
        const stayDates = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1);
        const dateStrings = stayDates.map(date => format(date, 'yyyy-MM-dd'));
        
        const { data: priceOverrides } = await supabase
          .from('room_availability')
          .select('date, price_override')
          .eq('room_id', roomId)
          .in('date', dateStrings);

        let roomTotal = 0;
        for (const date of stayDates) {
          const dateStr = format(date, 'yyyy-MM-dd');
          const override = priceOverrides?.find(p => p.date === dateStr);
          
          const month = date.getMonth() + 1;
          const isHighSeason = month >= 6 && month <= 9;
          const basePrice = isHighSeason ? roomData.high_season_price : roomData.base_price;
          
          roomTotal += override?.price_override || basePrice;
        }

        const basePrice = roomTotal / nights;
        const cleaningFee = 0;
        const totalPrice = roomTotal + cleaningFee;

        setPricing({
          basePrice,
          nights,
          roomTotal,
          cleaningFee,
          totalPrice
        });
      } catch (error) {
        console.error('Error calculating pricing:', error);
        setPricing(null);
      } finally {
        setPricingLoading(false);
      }
    };

    calculatePricing();
  }, [checkIn, checkOut, roomData, roomId, nights]);

  // Availability check con SAME-DAY TURNOVER FIX
  useEffect(() => {
    if (!checkIn || !checkOut || nights <= 0) {
      setAvailabilityError(null);
      return;
    }

    const checkAvailability = async () => {
      try {
        setChecking(true);
        
        const checkInStr = format(checkIn, 'yyyy-MM-dd');
        const checkOutStr = format(checkOut, 'yyyy-MM-dd');

        // 🚀 SAME-DAY TURNOVER FIX: Solo notti occupate, non checkout day
        const stayDates = eachDayOfInterval({ start: checkIn, end: checkOut })
          .slice(0, -1) // ← QUESTO È L'UNICO CAMBIO PER SAME-DAY TURNOVER
          .map(date => format(date, 'yyyy-MM-dd'));

        // Check conflicting bookings
        const { data: bookingConflicts, error: bookingError } = await supabase
          .from('bookings')
          .select('check_in, check_out, guest_name')
          .eq('room_id', roomId)
          .eq('status', 'confirmed')
          .or(`and(check_in.lt.${checkOutStr},check_out.gt.${checkInStr})`);

        if (bookingError) throw bookingError;

        // Check blocked dates
        const { data: availabilityConflicts, error: availabilityError } = await supabase
          .from('room_availability')
          .select('date, is_available')
          .eq('room_id', roomId)
          .eq('is_available', false)
          .in('date', stayDates);

        if (availabilityError) throw availabilityError;

        const isAvailable = (!bookingConflicts || bookingConflicts.length === 0) && 
                           (!availabilityConflicts || availabilityConflicts.length === 0);

        if (!isAvailable) {
          const messages = [];
          if (bookingConflicts && bookingConflicts.length > 0) {
            messages.push(`${bookingConflicts.length} existing booking${bookingConflicts.length > 1 ? 's' : ''}`);
          }
          if (availabilityConflicts && availabilityConflicts.length > 0) {
            messages.push(`${availabilityConflicts.length} blocked date${availabilityConflicts.length > 1 ? 's' : ''}`);
          }
          
          setAvailabilityError(`Selected dates unavailable: ${messages.join(' and ')}.`);
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailabilityError('Unable to check availability. Please try again.');
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [checkIn, checkOut, nights, roomId]);

  // Booking handlers
  const handleBookingStart = () => {
    if (!canBook) return;
    setIsBookingOpen(true);
  };

  const handleBookingComplete = async (formData: any) => {
    if (!checkIn || !checkOut || !pricing) return;

    try {
      setSubmitting(true);

      const bookingData = {
        room_id: roomId,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_country: formData.country,
        guests_count: parseInt(formData.guests),
        total_nights: nights,
        total_price: pricing.totalPrice,
        special_requests: formData.specialRequests,
        status: 'confirmed' as const
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      const confirmationNumber = `TSC${data.id.toString().padStart(6, '0')}`;
      
      setBookingConfirmation({
        id: data.id,
        confirmation_number: confirmationNumber,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        room_name: roomName,
        check_in: data.check_in,
        check_out: data.check_out,
        total_nights: data.total_nights,
        total_price: data.total_price,
        guests_count: data.guests_count,
        special_requests: data.special_requests,
        status: data.status,
        created_at: data.created_at
      });
      
      setIsBookingComplete(true);
      setIsBookingOpen(false);
    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    setIsBookingComplete(false);
    setBookingConfirmation(null);
    setCheckIn(null);
    setCheckOut(null);
    setAvailabilityError(null);
  };

  // Loading state
  if (roomLoading || pricingLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading booking options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (roomError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{roomError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Booking complete state
  if (isBookingComplete && bookingConfirmation) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Confirmation: <span className="font-mono font-semibold">
                  {bookingConfirmation.confirmation_number}
                </span>
              </p>
              
              <div className="bg-white rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Guest:</span>
                  <span className="text-sm font-medium">{bookingConfirmation.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Room:</span>
                  <span className="text-sm font-medium">{bookingConfirmation.room_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-sm font-semibold text-green-700">
                    €{bookingConfirmation.total_price}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleNewBooking} variant="outline" size="sm">
              Book Another Stay
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main widget - UI ORIGINALE identica
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header originale */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Book Your Stay</h3>
            {roomData && (
              <span className="text-sm text-muted-foreground">
                from €{roomData.base_price}/night
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>up to {capacity} guests</span>
          </div>
        </div>

        {/* SOLO il calendario originale - NIENT'ALTRO */}
        <div className="space-y-4 mb-6">
          <BookingCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInSelect={setCheckIn}
            onCheckOutSelect={setCheckOut}
            unavailableDates={unavailableDates}
            minStay={1}
          />
          
          {checking && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Checking availability...</span>
            </div>
          )}

          {unavailabilityLoading && !unavailableDates.length && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading calendar availability...</span>
            </div>
          )}
          
          {availabilityError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Pricing originale */}
        {pricing && canBook && (
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-stone-light">
              <span className="text-sm">
                €{Math.round(pricing.basePrice)} avg × {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span className="text-sm">€{pricing.roomTotal}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-light">
              <span className="text-sm">Cleaning fee</span>
              <span className="text-sm">€{pricing.cleaningFee}</span>
            </div>
            <div className="flex justify-between items-center py-2 font-semibold">
              <span>Total</span>
              <span className="text-terracotta">€{pricing.totalPrice}</span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              💰 Pricing includes custom rates for selected dates
            </div>
          </div>
        )}

        {/* Button originale */}
        <Button
          onClick={handleBookingStart}
          disabled={!canBook || checking}
          variant="terracotta"
          size="lg"
          className="w-full mb-4"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : !checkIn || !checkOut ? (
            'Select Dates'
          ) : nights <= 0 ? (
            'Invalid Dates'
          ) : availabilityError ? (
            'Dates Unavailable'
          ) : (
            `Reserve for €${pricing?.totalPrice || 0}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You won't be charged yet
        </p>
      </CardContent>

      {/* Dialog originale */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
          </DialogHeader>
          
          <BookingForm
            nights={nights}
            totalPrice={pricing?.totalPrice || 0}
            onComplete={handleBookingComplete}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BookingWidget;