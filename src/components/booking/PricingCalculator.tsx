import React from 'react';
import { format, differenceInDays, getMonth } from "date-fns";

interface PricingCalculatorProps {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  roomType: 'garden' | 'stone' | 'terrace' | 'modern';
  className?: string;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  checkIn,
  checkOut,
  roomType,
  className
}) => {
  // Pricing logic based on season
  const getRoomPricing = (roomType: string) => {
    const pricing = {
      garden: {
        low: 85,    // Nov-Feb
        mid: 95,    // Mar-May, Oct
        high: 120   // Jun-Sep
      },
      stone: {
        low: 75,
        mid: 85,
        high: 110
      },
      terrace: {
        low: 95,
        mid: 105,
        high: 140
      },
      modern: {
        low: 110,
        mid: 125,
        high: 140
      }
    };
    return pricing[roomType as keyof typeof pricing] || pricing.garden;
  };

  const getSeasonRate = (date: Date, roomType: string) => {
    const month = getMonth(date);
    const pricing = getRoomPricing(roomType);
    
    // High season: June (5) - September (8)
    if (month >= 5 && month <= 8) {
      return pricing.high;
    }
    // Low season: November (10) - February (1)
    if (month >= 10 || month <= 1) {
      return pricing.low;
    }
    // Mid season: March-May, October
    return pricing.mid;
  };

  const calculateStayPricing = () => {
    if (!checkIn || !checkOut) return null;
    
    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) return null;

    let totalRoomCost = 0;
    const currentDate = new Date(checkIn);
    
    // Calculate cost for each night (in case it spans multiple seasons)
    for (let i = 0; i < nights; i++) {
      const nightRate = getSeasonRate(currentDate, roomType);
      totalRoomCost += nightRate;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const cleaningFee = 25;
    const subtotal = totalRoomCost;
    const total = subtotal + cleaningFee;

    // Average nightly rate for display
    const avgNightlyRate = Math.round(totalRoomCost / nights);

    return {
      nights,
      avgNightlyRate,
      roomTotal: totalRoomCost,
      cleaningFee,
      subtotal,
      total
    };
  };

  const pricing = calculateStayPricing();

  if (!pricing) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select your dates to see pricing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Dates Summary */}
        <div className="border-b border-border pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Check-in</span>
            <span className="font-medium">{format(checkIn!, "MMM dd, yyyy")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Check-out</span>
            <span className="font-medium">{format(checkOut!, "MMM dd, yyyy")}</span>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              €{pricing.avgNightlyRate} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}
            </span>
            <span className="font-medium">€{pricing.roomTotal}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Cleaning fee</span>
            <span className="font-medium">€{pricing.cleaningFee}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-terracotta">€{pricing.total}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Including all fees and taxes
          </p>
        </div>

        {/* Season Info */}
        <div className="bg-stone-light rounded-lg p-3">
          <p className="text-xs text-muted-foreground text-center">
            {getMonth(checkIn!) >= 5 && getMonth(checkIn!) <= 8 ? (
              <>🌞 High season pricing • Peak summer rates</>
            ) : getMonth(checkIn!) >= 10 || getMonth(checkIn!) <= 1 ? (
              <>❄️ Low season pricing • Winter special rates</>
            ) : (
              <>🌸 Mid season pricing • Spring/fall rates</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;