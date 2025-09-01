import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Room = {
  id: string
  name: string
  slug: string
  capacity: number
  base_price: number
  high_season_price: number
  description: string
  short_description: string
  features: string[] // JSON parsed
  images: string[]   // JSON parsed
  amenities: string[] // JSON parsed
  is_active: boolean
  created_at: string
}

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('🏠 Fetching all rooms from database...')
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at')
      
      if (error) {
        console.error('❌ Rooms fetch error:', error)
        throw error
      }
      
      // Parse JSON strings to arrays - handle both JSON and plain text
      const parsedRooms = data.map(room => {
        const parseField = (field: string | null) => {
          if (!field) return [];
          
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If not JSON, treat as comma-separated string or single value
            if (field.includes(',')) {
              return field.split(',').map(item => item.trim());
            }
            return [field];
          }
        };
        
        return {
          ...room,
          features: parseField(room.features),
          images: parseField(room.images), 
          amenities: parseField(room.amenities)
        };
      }) as Room[];
      
      console.log(`✅ Fetched ${parsedRooms.length} rooms successfully`)
      return parsedRooms
    }
  })
}

// Helper function to get current season pricing
export const getCurrentPrice = (room: Room, date: Date = new Date()): number => {
  const month = date.getMonth() + 1 // 1-based month
  
  // High season: June-September (6-9)
  const isHighSeason = month >= 6 && month <= 9
  
  const price = isHighSeason ? room.high_season_price : room.base_price
  
  console.log(`💰 Price for ${room.name} in month ${month}: €${price} (${isHighSeason ? 'high' : 'low'} season)`)
  return price
}

// Helper to map room to SearchResults format
export const mapRoomForSearchResults = (room: Room) => {
  // Map features to SearchResults categories
  const getSearchFeatures = (features: string[]): string[] => {
    if (!Array.isArray(features)) return [];
    
    const featureMap: { [key: string]: string } = {
      'Private rooftop garden': 'private-garden',
      'Sunset terrace with valley views': 'panoramic-terrace', 
      'Contemporary furnishing': 'modern-luxury',
      'Original 13th century architecture': 'historic-stone'
    }
    
    return features
      .filter(f => f && typeof f === 'string') // Filter only valid strings
      .map(f => featureMap[f] || f.toLowerCase().replace(/ /g, '-'))
      .filter(Boolean)
  }
  
  // Determine room type based on capacity or name
  const getRoomType = (room: Room): string => {
    if (room.capacity <= 2 && room.name.includes('Room')) return 'private-room'
    return 'full-apartment'
  }
  
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    basePrice: getCurrentPrice(room),
    slug: room.slug,
    type: getRoomType(room),
    features: getSearchFeatures(room.features)
  }
}