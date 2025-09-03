// src/components/booking/BookingWidget.tsx - COMPLETELY FIXED

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import { differenceInDays } from "date-fns";
import { Calendar, Euro, Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import { 
  useRoomData, 
  useAvailabilityCheck, 
  useCreateBooking,
  usePricingCalculation 
} from '@/hooks/useBooking';
import { useRoomUnavailableDates } from '@/hooks/useRoomUnavailableDates';
import type { RoomType } from '@/utils/roomMapping';
import type { BookingFormData, BookingConfirmation } from '@/types/booking';

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
  // State
  const [checkIn, setCheckIn] = useState<Date | null>(presetCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(presetCheckOut || null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Hooks
  const { roomData, loading: roomLoading, error: roomError } = useRoomData(roomType);
  const { unavailableDates, loading: unavailabilityLoading } = useRoomUnavailableDates(roomType);
  const { checkAvailability, checking } = useAvailabilityCheck();
  const { createBooking, submitting, error: bookingError } = useCreateBooking();
  const { calculatePricing, loading: pricingLoading } = usePricingCalculation(roomType);

  // Calculated values
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const pricing = calculatePricing(checkIn, checkOut);
  const canBook = checkIn && checkOut && nights > 0 && !availabilityError && roomData && pricing;

  // Check availability when dates change
  useEffect(() => {
    const checkDatesAvailability = async () => {
      if (!checkIn || !checkOut || nights <= 0) {
        setAvailabilityError(null);
        return;
      }

      try {
        const result = await checkAvailability(roomType, checkIn, checkOut);
        
        if (!result.isAvailable) {
          setAvailabilityError(
            result.conflicts && result.conflicts.length > 0 
              ? `Selected dates conflict with existing booking`
              : 'Selected dates are not available'
          );
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        console.error('Availability check failed:', error);
        setAvailabilityError('Failed to check availability. Please try again.');
      }
    };

    checkDatesAvailability();
  }, [checkIn, checkOut, nights, roomType, checkAvailability]);

  const handleBookingStart = () => {
    if (!canBook) return;
    setIsBookingOpen(true);
  };

  // ✅ FIXED: Correct BookingForm callback
  const handleBookingComplete = async (formData: BookingFormData) => {
    if (!checkIn || !checkOut || !pricing) return;

    try {
      const confirmation = await createBooking(
        roomType,
        checkIn,
        checkOut,
        formData,
        pricing.totalPrice
      );

      if (confirmation) {
        setBookingConfirmation({
          ...confirmation,
          room_name: roomName
        });
        setIsBookingComplete(true);
        setIsBookingOpen(false);
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
    }
  };

  const handleNewBooking = () => {
    setIsBookingComplete(false);
    setBookingConfirmation(null);
    setCheckIn(null);
    setCheckOut(null);
    setAvailabilityError(null);
  };

  // Show loading state while room data or pricing data loads
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

  // Show error state
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

  return (
    <>
      <Card className={className}>
        <CardContent className="p-6">
          {/* Header */}
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

          {/* Date Selection */}
          <div className="space-y-4 mb-6">
            <BookingCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInSelect={setCheckIn}
              onCheckOutSelect={setCheckOut}
              unavailableDates={unavailableDates}
              minStay={1}
            />
            
            {/* Availability checking indicator */}
            {checking && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Checking availability...</span>
              </div>
            )}

            {/* Unavailable dates loading */}
            {unavailabilityLoading && !unavailableDates.length && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading calendar availability...</span>
              </div>
            )}
            
            {/* Availability errors */}
            {availabilityError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{availabilityError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Dynamic Pricing Display */}
          {pricing && canBook && (
            <div className="mb-6 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-stone-light">
                <span className="text-sm">
                  €{pricing.basePrice} avg × {nights} night{nights > 1 ? 's' : ''}
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

          {/* Booking Button */}
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
            ) : pricingLoading ? (
              'Loading Prices...'
            ) : (
              `Reserve for €${pricing?.totalPrice || 0}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You won't be charged yet
          </p>
        </CardContent>
      </Card>

      {/* ✅ FIXED: Booking Form Dialog with correct props */}
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
    </>
  );
};

export default BookingWidget;