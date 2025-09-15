// src/components/booking/BookingCalendar.tsx - IMPROVED: Continuous Date Selection
import React, { useState } from 'react';
import { format, addDays, differenceInDays, isAfter, isBefore, isWithinInterval } from "date-fns";
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onCheckInSelect: (date: Date | undefined) => void;
  onCheckOutSelect: (date: Date | undefined) => void;
  unavailableDates?: Date[];
  minStay?: number;
  className?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  onCheckInSelect,
  onCheckOutSelect,
  unavailableDates = [],
  minStay = 1,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'check-in' | 'check-out'>('check-in');

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return isWithinInterval(date, { start: checkIn, end: checkOut });
  };

  const isDateInTentativeRange = (date: Date, hoverDate: Date | null) => {
    if (!checkIn || !hoverDate || checkOut) return false;
    const start = isBefore(checkIn, hoverDate) ? checkIn : hoverDate;
    const end = isAfter(checkIn, hoverDate) ? checkIn : hoverDate;
    return isWithinInterval(date, { start, end });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selectionMode === 'check-in' || !checkIn) {
      // First click: Set check-in
      onCheckInSelect(date);
      onCheckOutSelect(undefined); // Clear checkout
      setSelectionMode('check-out');
      
      // Calendar stays open for checkout selection
    } else if (selectionMode === 'check-out') {
      // Second click: Set check-out
      if (isBefore(date, checkIn)) {
        // If selected date is before check-in, swap them
        onCheckInSelect(date);
        onCheckOutSelect(checkIn);
      } else if (date <= addDays(checkIn, minStay - 1)) {
        // If too close, set minimum stay
        onCheckOutSelect(addDays(checkIn, minStay));
      } else {
        onCheckOutSelect(date);
      }
      
      // Close calendar after both dates are selected
      setIsOpen(false);
      setSelectionMode('check-in');
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectionMode('check-in');
    }
  };

  const handleClearDates = () => {
    onCheckInSelect(undefined);
    onCheckOutSelect(undefined);
    setSelectionMode('check-in');
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const getButtonText = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, "MMM dd")} - ${format(checkOut, "MMM dd")}`;
    } else if (checkIn) {
      return `${format(checkIn, "MMM dd")} - Select checkout`;
    } else {
      return "Select dates";
    }
  };

  const getButtonVariant = (): "default" | "outline" | "destructive" | "secondary" | "ghost" | "link" | "terracotta" | "sage-outline" | "stone" => {
    if (checkIn && !checkOut) return "outline"; // Partial selection
    return "outline";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Single Date Range Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {selectionMode === 'check-in' ? 'Select check-in date' : 'Select check-out date'}
        </label>
        
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant={getButtonVariant()}
              className={cn(
                "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                !checkIn && "text-muted-foreground",
                checkIn && !checkOut && "border-sage bg-sage/5" // Highlight during selection
              )}
            >
              <CalendarIcon size={18} className="mr-3 text-sage" />
              {getButtonText()}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectionMode === 'check-in' ? checkIn : checkOut}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  date < new Date() || 
                  isDateUnavailable(date) ||
                  date > addDays(new Date(), 365) ||
                  (selectionMode === 'check-out' && checkIn && date <= checkIn) ||
                  (selectionMode === 'check-out' && checkIn && date < addDays(checkIn, minStay))
                }
                weekStartsOn={1}
                initialFocus
                className="pointer-events-auto"
                modifiers={{
                  unavailable: unavailableDates,
                  inRange: isDateInRange
                }}
                modifiersStyles={{
                  unavailable: { 
                    color: 'hsl(var(--destructive))',
                    textDecoration: 'line-through',
                    backgroundColor: 'hsl(var(--destructive) / 0.1)',
                    opacity: 0.5
                  },
                  inRange: {
                    backgroundColor: '#e6e8d9'
                  }
                }}
              />

              {/* Action Buttons */}
              {(checkIn || checkOut) && (
                <div className="mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearDates}
                    className="text-muted-foreground hover:text-destructive w-full"
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="text-center p-3 bg-stone-light rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-sage">{nights} night{nights > 1 ? 's' : ''}</span>
            {minStay > 1 && nights < minStay && (
              <span className="text-destructive ml-2">
                (Minimum {minStay} nights required)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;