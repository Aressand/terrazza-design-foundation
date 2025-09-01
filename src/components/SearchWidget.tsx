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
import { useRoomAvailability, isDateAvailable } from '@/hooks/useAvailability';

const SearchWidget = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Real availability data for next 3 months
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);
  
  const GARDEN_ROOM_ID = "bb65fd59-a6f0-457e-95ea-d1670170dd89";
  
  const { data: availabilityData, isLoading: isLoadingAvailability } = useRoomAvailability(
    GARDEN_ROOM_ID,
    startDate,
    endDate
  );

  const handleSearch = async () => {
    if (!checkIn || !checkOut || !guests) return;
    
    setIsLoading(true);
    
    // Create URL parameters for search results
    const searchParams = new URLSearchParams({
      checkIn: checkIn.toISOString().split('T')[0], // Format: YYYY-MM-DD
      checkOut: checkOut.toISOString().split('T')[0],
      guests: guests
    });
    
    // Navigate to search results page with parameters
    navigate(`/search-results?${searchParams.toString()}`);
    
    setIsLoading(false);
  };

  const isFormValid = checkIn && checkOut && guests;

  // Real date disable logic
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (date < new Date()) return true;
    
    // Disable if we have availability data and date is not available
    if (availabilityData && availabilityData.length > 0) {
      return !isDateAvailable(availabilityData, date);
    }
    
    return false;
  };

  return (
    <div className="bg-white rounded-2xl shadow-elegant p-6 lg:p-8 w-full max-w-4xl mx-auto animate-scale-in">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* Check-in Date */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Check-in
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                  !checkIn && "text-muted-foreground"
                )}
              >
                <CalendarIcon size={18} className="mr-3" />
                {checkIn ? format(checkIn, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={isDateDisabled}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Check-out
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 border-2 hover:border-sage focus:border-sage transition-colors",
                  !checkOut && "text-muted-foreground"
                )}
              >
                <CalendarIcon size={18} className="mr-3" />
                {checkOut ? format(checkOut, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => 
                  isDateDisabled(date) || 
                  (checkIn && date <= checkIn)
                }
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Guests
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-12 border-2 hover:border-sage focus:border-sage transition-colors">
              <div className="flex items-center">
                <Users size={18} className="mr-3" />
                <SelectValue placeholder="Select guests" />
              </div>
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="1">1 Guest</SelectItem>
              <SelectItem value="2">2 Guests</SelectItem>
              <SelectItem value="3">3 Guests</SelectItem>
              <SelectItem value="4">4 Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="flex-1 lg:flex-initial">
          <label className="block text-sm font-medium text-transparent mb-2 lg:hidden">
            Search
          </label>
          <Button
            onClick={handleSearch}
            disabled={!isFormValid || isLoading || isLoadingAvailability}
            variant="terracotta"
            size="lg"
            className="w-full lg:w-auto lg:px-8 h-12 font-semibold text-base lg:mt-7 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Searching...
              </div>
            ) : isLoadingAvailability ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Loading availability...
              </div>
            ) : (
              <div className="flex items-center">
                <Search size={18} className="mr-2" />
                Find Perfect Room
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          🏛️ Only 30 meters from Santa Chiara Basilica • ✨ Authentic Umbrian experience awaits
        </p>
        {isLoadingAvailability && (
          <p className="text-xs text-sage mt-1">📅 Loading real availability...</p>
        )}
        {availabilityData && (
          <p className="text-xs text-sage mt-1">
            📅 Real-time availability: {availabilityData.length} days loaded
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchWidget;