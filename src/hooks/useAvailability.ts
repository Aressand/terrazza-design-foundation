import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type RoomAvailability = {
  id: string
  room_id: string
  date: string
  is_available: boolean
  price_override: number | null
  created_at: string
}

export const useRoomAvailability = (roomId: string, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['room-availability', roomId, startDate?.toISOString().split('T')[0], endDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!startDate || !endDate) {
        console.log('📅 No date range provided, skipping query')
        return []
      }
      
      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]
      
      console.log(`🔍 Fetching availability for room ${roomId} from ${start} to ${end}`)
      
      const { data, error } = await supabase
        .from('room_availability')
        .select('*')
        .eq('room_id', roomId)
        .gte('date', start)
        .lte('date', end)
        .order('date')
      
      if (error) {
        console.error('❌ Availability query error:', error)
        throw error
      }
      
      console.log(`✅ Availability fetched: ${data?.length} days`)
      return data as RoomAvailability[]
    },
    enabled: !!roomId && !!startDate && !!endDate
  })
}

// Helper function to check if a specific date is available
export const isDateAvailable = (availabilityData: RoomAvailability[], date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0]
  const dateRecord = availabilityData.find(record => record.date === dateStr)
  const available = dateRecord?.is_available ?? false
  
  console.log(`📅 Checking ${dateStr}: ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`)
  return available
}

// Helper to get all unavailable dates for calendar
export const getUnavailableDates = (availabilityData: RoomAvailability[]): Date[] => {
  const unavailableDates = availabilityData
    .filter(record => !record.is_available)
    .map(record => new Date(record.date))
  
  console.log(`🔒 Found ${unavailableDates.length} unavailable dates`)
  return unavailableDates
}