import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { differenceInDays, eachDayOfInterval, format } from 'date-fns'

export type AvailabilityStatus = {
  roomId: string
  isAvailable: boolean
  unavailableDates: string[]
  totalDaysChecked: number
}

// Hook to check if a room is completely available for a date range
export const useRoomAvailabilityCheck = (roomId: string, checkIn?: Date, checkOut?: Date) => {
  return useQuery({
    queryKey: ['room-availability-check', roomId, checkIn?.toISOString(), checkOut?.toISOString()],
    queryFn: async (): Promise<AvailabilityStatus> => {
      if (!checkIn || !checkOut) {
        return {
          roomId,
          isAvailable: false,
          unavailableDates: [],
          totalDaysChecked: 0
        }
      }
      
      const startDate = format(checkIn, 'yyyy-MM-dd')
      const endDate = format(checkOut, 'yyyy-MM-dd')
      const nights = differenceInDays(checkOut, checkIn)
      
      console.log(`🔍 Checking availability for room ${roomId}: ${startDate} to ${endDate} (${nights} nights)`)
      
      // Get all dates in the range (excluding checkout day)
      const dateRange = eachDayOfInterval({ start: checkIn, end: checkOut })
        .slice(0, -1) // Remove checkout day
        .map(date => format(date, 'yyyy-MM-dd'))
      
      console.log(`📅 Checking dates:`, dateRange)
      
      // Fetch availability for all dates in range
      const { data, error } = await supabase
        .from('room_availability')
        .select('date, is_available')
        .eq('room_id', roomId)
        .in('date', dateRange)
        .order('date')
      
      if (error) {
        console.error('❌ Availability check error:', error)
        throw error
      }
      
      // Find unavailable dates
      const availabilityMap = new Map(data.map(row => [row.date, row.is_available]))
      const unavailableDates: string[] = []
      
      for (const date of dateRange) {
        const isAvailable = availabilityMap.get(date)
        if (!isAvailable) {
          unavailableDates.push(date)
        }
      }
      
      const isCompletelyAvailable = unavailableDates.length === 0
      
      console.log(`${isCompletelyAvailable ? '✅' : '❌'} Room ${roomId}: ${isCompletelyAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`)
      if (unavailableDates.length > 0) {
        console.log(`🚫 Unavailable dates: ${unavailableDates.join(', ')}`)
      }
      
      return {
        roomId,
        isAvailable: isCompletelyAvailable,
        unavailableDates,
        totalDaysChecked: dateRange.length
      }
    },
    enabled: !!roomId && !!checkIn && !!checkOut
  })
}

// Hook to check availability for multiple rooms
export const useMultiRoomAvailabilityCheck = (roomIds: string[], checkIn?: Date, checkOut?: Date) => {
  return useQuery({
    queryKey: ['multi-room-availability-check', roomIds, checkIn?.toISOString(), checkOut?.toISOString()],
    queryFn: async (): Promise<AvailabilityStatus[]> => {
      if (!checkIn || !checkOut || roomIds.length === 0) {
        return []
      }
      
      const startDate = format(checkIn, 'yyyy-MM-dd')
      const endDate = format(checkOut, 'yyyy-MM-dd')
      
      console.log(`🔍 Checking availability for ${roomIds.length} rooms: ${startDate} to ${endDate}`)
      
      // Get all dates in the range (excluding checkout day)
      const dateRange = eachDayOfInterval({ start: checkIn, end: checkOut })
        .slice(0, -1) // Remove checkout day
        .map(date => format(date, 'yyyy-MM-dd'))
      
      console.log(`📅 Checking ${dateRange.length} dates for ${roomIds.length} rooms`)
      
      // Fetch availability for all rooms and dates
      const { data, error } = await supabase
        .from('room_availability')
        .select('room_id, date, is_available')
        .in('room_id', roomIds)
        .in('date', dateRange)
        .order('room_id, date')
      
      if (error) {
        console.error('❌ Multi-room availability check error:', error)
        throw error
      }
      
      // Group data by room_id
      const roomAvailability = new Map<string, Map<string, boolean>>()
      
      for (const row of data) {
        if (!roomAvailability.has(row.room_id)) {
          roomAvailability.set(row.room_id, new Map())
        }
        roomAvailability.get(row.room_id)!.set(row.date, row.is_available)
      }
      
      // Check each room's availability
      const results: AvailabilityStatus[] = []
      
      for (const roomId of roomIds) {
        const roomDates = roomAvailability.get(roomId) || new Map()
        const unavailableDates: string[] = []
        
        for (const date of dateRange) {
          const isAvailable = roomDates.get(date)
          if (!isAvailable) {
            unavailableDates.push(date)
          }
        }
        
        const isCompletelyAvailable = unavailableDates.length === 0
        
        results.push({
          roomId,
          isAvailable: isCompletelyAvailable,
          unavailableDates,
          totalDaysChecked: dateRange.length
        })
      }
      
      const availableCount = results.filter(r => r.isAvailable).length
      console.log(`✅ Availability check complete: ${availableCount}/${roomIds.length} rooms available`)
      
      return results
    },
    enabled: !!checkIn && !!checkOut && roomIds.length > 0
  })
}