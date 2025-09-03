// src/components/admin/PriceCalendar.tsx - FIXED VERSION

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isPast,
  isToday
} from 'date-fns';
import { type RoomType } from '@/utils/roomMapping';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';
import PriceEditModal from './PriceEditModal';

interface PriceCalendarProps {
  roomType: RoomType;
  basePrice: number;
  priceData: any[]; // This will be ignored, we'll use the hook data
}

const PriceCalendar: React.FC<PriceCalendarProps> = ({ 
  roomType, 
  basePrice,
  priceData // This is ignored - we get data from the hook
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Use the extended hook with price management
  const { 
    availabilityData,
    roomData,
    loading,
    getPriceForDate,
    setPriceOverride 
  } = useAvailabilityManagement(roomType);

  // Navigation functions
  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  // Get base price from room data or fallback
  const currentBasePrice = roomData?.base_price || basePrice;

  // Check if date is booked (using real data)
  const isDateBooked = (date: Date): boolean => {
    const dayData = availabilityData.find(d => isSameDay(d.date, date));
    return dayData?.isBooked || false;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isPast(date) || isDateBooked(date)) return;
    setSelectedDate(date);
    setEditModalOpen(true);
  };

  // Handle price update (using real database function)
  const handlePriceUpdate = async (date: Date, newPrice: number | null) => {
    try {
      await setPriceOverride(date, newPrice);
      console.log(`✅ Price updated for ${format(date, 'yyyy-MM-dd')} to €${newPrice || 'BASE'}`);
      setEditModalOpen(false);
    } catch (error) {
      console.error('❌ Failed to update price:', error);
      // Error will be handled by the modal
      throw error;
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Show loading state
  if (loading || !roomData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading price data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="flex items-center"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Day Headers */}
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const price = getPriceForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isPastDate = isPast(date) && !isToday(date);
          const isBookedDate = isDateBooked(date);
          const isTodayDate = isToday(date);
          const hasCustomPrice = price !== currentBasePrice;
          
          // Determine cell styling
          let cellClasses = "relative p-1 text-center text-xs border border-gray-200 min-h-[60px] transition-colors ";
          
          if (!isCurrentMonth) {
            cellClasses += "bg-gray-50 text-gray-400 ";
          } else if (isPastDate) {
            cellClasses += "bg-gray-100 text-gray-500 cursor-not-allowed ";
          } else if (isBookedDate) {
            cellClasses += "bg-red-100 text-red-700 cursor-not-allowed ";
          } else {
            cellClasses += "bg-white hover:bg-sage/10 cursor-pointer ";
          }
          
          if (isTodayDate) {
            cellClasses += "ring-2 ring-sage ring-inset ";
          }

          return (
            <div
              key={index}
              className={cellClasses}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-medium mb-1">
                {format(date, 'd')}
              </div>
              
              {isCurrentMonth && (
                <div className="space-y-0.5">
                  {isBookedDate ? (
                    <div className="text-xs font-medium text-red-600">
                      BOOKED
                    </div>
                  ) : isPastDate ? (
                    <div className="text-xs text-gray-500">
                      €{price}
                    </div>
                  ) : (
                    <div className={`text-xs font-medium ${hasCustomPrice ? 'text-orange-600' : 'text-green-600'}`}>
                      €{price}
                    </div>
                  )}
                  
                  {/* Price Override Indicator */}
                  {hasCustomPrice && !isBookedDate && (
                    <div className="w-1 h-1 bg-orange-400 rounded-full mx-auto"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-200"></div>
          <span>Base Price (€{currentBasePrice})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-200 relative">
            <div className="w-1 h-1 bg-orange-400 rounded-full absolute top-1 left-1"></div>
          </div>
          <span>Custom Price</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-200"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200"></div>
          <span>Past Date</span>
        </div>
      </div>

      {/* Price Edit Modal */}
      <PriceEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        date={selectedDate}
        currentPrice={selectedDate ? getPriceForDate(selectedDate) : currentBasePrice}
        basePrice={currentBasePrice}
        onUpdate={handlePriceUpdate}
      />
    </div>
  );
};

export default PriceCalendar;