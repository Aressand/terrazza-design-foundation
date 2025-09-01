// src/components/booking/BookingWidget.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingCalendar from './BookingCalendar';
import PricingCalculator from './PricingCalculator';
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
  const { calculatePricing } = usePricingCalculation();

  // Calculated values
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const pricing = calculatePricing(roomData, checkIn, checkOut);
  const canBook = checkIn && checkOut && nights > 0 && !availabilityError && roomData;

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
              ? 'These dates are not available due to existing bookings'
              : 'These dates are not available'
          );
        } else {
          setAvailabilityError(null);
        }
      } catch (err) {
        setAvailabilityError('Unable to verify availability. Please try again.');
      }
    };

    checkDatesAvailability();
  }, [checkIn, checkOut, roomType, checkAvailability, nights]);

  const handleBookingStart = () => {
    if (canBook) {
      setIsBookingOpen(true);
    }
  };

  const handleBookingComplete = async (formData: BookingFormData) => {
    if (!checkIn || !checkOut || !pricing) return;

    const confirmation = await createBooking(
      roomType,
      checkIn,
      checkOut,
      formData,
      pricing.totalPrice
    );

    if (confirmation) {
      setBookingConfirmation(confirmation);
      setIsBookingComplete(true);
    }
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    if (isBookingComplete) {
      setIsBookingComplete(false);
      setBookingConfirmation(null);
    }
  };

  // Loading states
  if (roomLoading) {
    return (
      <Card className={`sticky top-8 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-sage" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error states
  if (roomError) {
    return (
      <Card className={`sticky top-8 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load room information. Please refresh the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!roomData) {
    return null;
  }

  return (
    <>
      <Card className={`sticky top-8 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-playfair text-sage mb-2">
              Reserve Your {roomName}
            </h3>
            <div className="text-3xl font-bold text-terracotta mb-1">
              From €{roomData.base_price}
              <span className="text-base font-normal text-muted-foreground">/night</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Up to {capacity} guest{capacity > 1 ? 's' : ''}
            </p>
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

          {/* Pricing Display */}
          {pricing && canBook && (
            <div className="mb-6 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-stone-light">
                <span className="text-sm">€{pricing.basePrice} × {nights} night{nights > 1 ? 's' : ''}</span>
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
              'Not Available'
            ) : (
              `Reserve for €${pricing?.totalPrice || 0}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You won't be charged yet
          </p>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={handleCloseBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isBookingComplete ? 'Booking Confirmed!' : `Book ${roomName}`}
            </DialogTitle>
          </DialogHeader>

          {isBookingComplete && bookingConfirmation ? (
            // Confirmation View
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Thank you, {bookingConfirmation.guest_name.split(' ')[0]}!
                </h3>
                <p className="text-muted-foreground">Your booking has been confirmed</p>
              </div>

              <div className="bg-stone-light rounded-lg p-6">
                <h4 className="font-semibold mb-4">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confirmation Number:</span>
                    <span className="font-mono font-semibold">
                      {bookingConfirmation.confirmation_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>{bookingConfirmation.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{bookingConfirmation.guest_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{bookingConfirmation.room_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{bookingConfirmation.guests_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-3">
                    <span>Total Paid:</span>
                    <span className="text-terracotta">€{bookingConfirmation.total_price}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sage/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">What's Next?</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Confirmation email sent to {bookingConfirmation.guest_email}</li>
                  <li>✓ Check-in instructions will be sent 48 hours before arrival</li>
                  <li>✓ Our team will contact you if needed</li>
                </ul>
              </div>

              <Button onClick={handleCloseBooking} variant="terracotta" className="w-full">
                Close
              </Button>
            </div>
          ) : (
            // Booking Form
            <>
              {bookingError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{bookingError}</AlertDescription>
                </Alert>
              )}
              
              <BookingForm
                totalPrice={pricing?.totalPrice || 0}
                nights={nights}
                onComplete={handleBookingComplete}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingWidget;