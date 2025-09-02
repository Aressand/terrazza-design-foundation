// src/components/booking/BookingCalendar.tsx - ONLY ADDED weekStartsOn={1}

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
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return isWithinInterval(date, { start: checkIn, end: checkOut });
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    onCheckInSelect(date);
    if (date && checkOut && isBefore(checkOut, addDays(date, minStay))) {
      onCheckOutSelect(addDays(date, minStay));
    }
    setIsCheckInOpen(false);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    onCheckOutSelect(date);
    setIsCheckOutOpen(false);
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-in Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Check-in
          </label>
          <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon size={18} className="mr-3 text-sage" />
                {checkIn ? format(checkIn, "PPP") : "Select check-in date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={handleCheckInSelect}
                disabled={(date) => 
                  date < new Date() || 
                  isDateUnavailable(date) ||
                  date > addDays(new Date(), 365)
                }
                weekStartsOn={1}
                initialFocus
                className="p-3 pointer-events-auto"
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
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Check-out
          </label>
          <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon size={18} className="mr-3 text-sage" />
                {checkOut ? format(checkOut, "PPP") : "Select check-out date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={handleCheckOutSelect}
                disabled={(date) => 
                  date < new Date() || 
                  (checkIn && date <= checkIn) ||
                  (checkIn && date < addDays(checkIn, minStay)) ||
                  isDateUnavailable(date) ||
                  date > addDays(new Date(), 365)
                }
                weekStartsOn={1}
                initialFocus
                className="p-3 pointer-events-auto"
                classNames={{
                  day_today: "bg-transparent text-foreground font-normal", // 🔴 FIX: Remove today highlighting
                  day_selected: "bg-transparent text-foreground font-normal", // 🔴 FIX: Remove check-in transparency in check-out calendar
                  day: "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                }}
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
            </PopoverContent>
          </Popover>
        </div>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-sage rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-destructive rounded-full opacity-50"></div>
          <span>Unavailable</span>
        </div>
        {checkIn && checkOut && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e6e8d9' }}></div>
            <span>Selected period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;