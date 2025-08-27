import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BookingCalendar from './BookingCalendar';
import PricingCalculator from './PricingCalculator';
import BookingForm from './BookingForm';
import { differenceInDays } from "date-fns";
import { Calendar, Euro, Users, Check } from 'lucide-react';

interface BookingWidgetProps {
  roomType: 'garden' | 'stone' | 'terrace' | 'modern';
  roomName: string;
  capacity: number;
  className?: string;
}

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  guests: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
  roomType,
  roomName,
  capacity,
  className
}) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const canBook = checkIn && checkOut && nights > 0;

  // Calculate pricing
  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0;
    
    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) return 0;

    // Simple pricing logic (match PricingCalculator)
    const baseRate = roomType === 'garden' ? 95 : roomType === 'stone' ? 85 : 105;
    const roomTotal = baseRate * nights;
    const cleaningFee = 25;
    return roomTotal + cleaningFee;
  };

  const totalPrice = calculateTotalPrice();

  const handleBookingStart = () => {
    if (canBook) {
      setIsBookingOpen(true);
    }
  };

  const handleBookingComplete = (formData: BookingFormData) => {
    // Generate confirmation number
    const confirmation = `TSC${Date.now().toString().slice(-6)}`;
    setConfirmationNumber(confirmation);
    setBookingData(formData);
    setIsBookingComplete(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    if (isBookingComplete) {
      // Reset state if needed
      setIsBookingComplete(false);
      setBookingData(null);
      setConfirmationNumber('');
    }
  };

  const getMinimumStay = () => {
    // Weekend minimum 2 nights logic could be added here
    return 1;
  };

  return (
    <>
      <Card className={`sticky top-8 shadow-elegant ${className}`}>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-playfair text-sage mb-2">
              Reserve Your {roomName}
            </h3>
            <div className="text-3xl font-bold text-terracotta mb-1">
              From €{roomType === 'garden' ? 95 : roomType === 'stone' ? 85 : 105}
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
              minStay={getMinimumStay()}
            />
          </div>

          {/* Pricing Display */}
          {canBook && (
            <div className="mb-6">
              <PricingCalculator
                checkIn={checkIn}
                checkOut={checkOut}
                roomType={roomType}
              />
            </div>
          )}

          {/* Booking Button */}
          <Button
            onClick={handleBookingStart}
            disabled={!canBook}
            variant="terracotta"
            size="lg"
            className="w-full mb-4"
          >
            {canBook ? (
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                Book Now - €{totalPrice}
              </div>
            ) : (
              'Select Dates to Book'
            )}
          </Button>

          {!canBook && (
            <p className="text-sm text-muted-foreground text-center mb-4">
              Choose your check-in and check-out dates above
            </p>
          )}

          {/* Trust Signals */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sage" />
              <span className="text-sm text-muted-foreground">Free cancellation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sage" />
              <span className="text-sm text-muted-foreground">Best rate guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sage" />
              <span className="text-sm text-muted-foreground">Instant confirmation</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at<br/>
              <a href="mailto:info@terrazzasantachiara.it" className="text-sage hover:underline">
                info@terrazzasantachiara.it
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-playfair text-sage">
              {isBookingComplete ? 'Booking Confirmed!' : `Book ${roomName}`}
            </DialogTitle>
          </DialogHeader>

          {isBookingComplete && bookingData ? (
            // Confirmation View
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank you, {bookingData.firstName}!</h3>
                <p className="text-muted-foreground">Your booking has been confirmed</p>
              </div>

              <div className="bg-stone-light rounded-lg p-6">
                <h4 className="font-semibold mb-4">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confirmation Number:</span>
                    <span className="font-mono font-semibold">{confirmationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>{bookingData.firstName} {bookingData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{bookingData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{roomName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{bookingData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-3">
                    <span>Total Paid:</span>
                    <span className="text-terracotta">€{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sage/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">What's Next?</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ Confirmation email sent to {bookingData.email}</li>
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
            <BookingForm
              totalPrice={totalPrice}
              nights={nights}
              onComplete={handleBookingComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingWidget;