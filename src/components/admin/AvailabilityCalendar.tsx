// src/components/admin/AvailabilityCalendar.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  Check, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { useAvailabilityManagement } from '@/hooks/useAvailabilityManagement';
import type { RoomType } from '@/utils/roomMapping';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  roomType: RoomType;
  roomName: string;
  onDateClick?: (date: Date, isCurrentlyAvailable: boolean) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  roomType,
  roomName,
  onDateClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { 
    availabilityData, 
    loading, 
    error, 
    toggleAvailability 
  } = useAvailabilityManagement(roomType);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = async (date: Date) => {
    const dayData = availabilityData.find(day => 
      format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (dayData?.isBooked) {
      // Don't allow toggling booked dates
      return;
    }

    if (onDateClick) {
      onDateClick(date, dayData?.isAvailable ?? true);
    } else {
      // Default behavior: toggle availability
      await toggleAvailability(date, dayData?.isAvailable ?? true);
    }
  };

  const getDateStatus = (date: Date) => {
    const dayData = availabilityData.find(day => 
      format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (!dayData) return 'available';
    if (dayData.isBooked) return 'booked';
    if (!dayData.isAvailable) return 'blocked';
    return 'available';
  };

  const getDayModifiers = () => {
    const modifiers = {
      available: [] as Date[],
      blocked: [] as Date[],
      booked: [] as Date[],
      hasOverride: [] as Date[]
    };

    availabilityData.forEach(day => {
      if (isSameMonth(day.date, currentMonth)) {
        if (day.isBooked) {
          modifiers.booked.push(day.date);
        } else if (!day.isAvailable) {
          modifiers.blocked.push(day.date);
        } else {
          modifiers.available.push(day.date);
        }

        if (day.hasOverride) {
          modifiers.hasOverride.push(day.date);
        }
      }
    });

    return modifiers;
  };

  const modifiers = getDayModifiers();

  const modifiersStyles = {
    available: { 
      backgroundColor: 'hsl(var(--sage) / 0.1)',
      color: 'hsl(var(--sage))',
      fontWeight: '500'
    },
    blocked: { 
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
      textDecoration: 'line-through',
      fontWeight: '500'
    },
    booked: { 
      backgroundColor: 'hsl(var(--muted))',
      color: 'hsl(var(--muted-foreground))',
      fontWeight: '500'
    },
    hasOverride: {
      border: '2px solid hsl(var(--primary))',
      borderRadius: '4px'
    }
  };

  const blockedCount = availabilityData.filter(day => !day.isAvailable).length;
  const bookedCount = availabilityData.filter(day => day.isBooked).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {roomName}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sage">
              {availabilityData.length - blockedCount - bookedCount} Available
            </Badge>
            <Badge variant="outline" className="text-destructive">
              {blockedCount} Blocked
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {bookedCount} Booked
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-sage" />
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              
              <h3 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Calendar */}
            <div className="w-full">
              <Calendar
                mode="single"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                onDayClick={handleDateClick}
                disabled={(date) => date < new Date()}
                className="w-full"
                classNames={{
                  day: cn(
                    "h-9 w-9 text-center text-sm p-0 relative",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "cursor-pointer"
                  ),
                }}
              />
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Legend:</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-sage/10 border border-sage"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-destructive/10 border border-destructive"></div>
                  <span>Blocked (Click to unblock)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted border border-muted-foreground"></div>
                  <span>Booked (Cannot modify)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded border-2 border-primary"></div>
                  <span>Custom Price</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Click any available date</strong> to block it for maintenance or personal use. 
                <strong>Click blocked dates</strong> to make them available again.
                Booked dates cannot be modified.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;