// src/components/SearchWidget.tsx - FIXED Calendar auto-close issue

import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// 🔴 FIX: Format date safely without timezone issues  
const formatDateSafely = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SearchWidget = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States for popover open/close control
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const handleSearch = async () => {
    if (!checkIn || !checkOut || !guests) return;
    
    setIsLoading(true);
    
    // 🔴 FIX: Create URL parameters using safe date formatting (no timezone issues)
    const searchParams = new URLSearchParams({
      checkIn: formatDateSafely(checkIn),
      checkOut: formatDateSafely(checkOut),
      guests: guests
    });
    
    navigate(`/search-results?${searchParams.toString()}`);
    setIsLoading(false);
  };

  const isFormValid = checkIn && checkOut && guests;

  // 🔴 FIX: Only disable past dates (no room-specific restrictions)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-stone-light max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Check-in Date - EXACT same structure as BookingCalendar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-dark">Check-in</label>
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
                {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  setCheckIn(date);
                  setIsCheckInOpen(false);
                }}
                disabled={isDateDisabled}
                weekStartsOn={1}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date - EXACT same structure as BookingCalendar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-dark">Check-out</label>
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
                {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  setCheckOut(date);
                  setIsCheckOutOpen(false);
                }}
                disabled={(date) => 
                  isDateDisabled(date) || 
                  (checkIn && date <= checkIn)
                }
                weekStartsOn={1}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-dark">Guests</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-12">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select guests" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Guest</SelectItem>
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="3">3 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-transparent">Search</label>
          <Button
            onClick={handleSearch}
            disabled={!isFormValid || isLoading}
            className="w-full h-12 bg-terracotta hover:bg-terracotta/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-stone-medium mt-4 text-center">
        Select your dates and number of guests to find available rooms
      </p>
    </div>
  );
};

export default SearchWidget;