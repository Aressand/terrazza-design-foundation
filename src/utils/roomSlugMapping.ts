// src/utils/roomSlugMapping.ts
import { ROOM_MAPPING } from '@/utils/roomMapping';

// Map room types to their slugs for URL generation
export const ROOM_SLUG_MAPPING = {
  garden: 'garden-room',
  terrace: 'terrace-apartment',
  modern: 'modern-apartment',
  stone: 'stone-vault-apartment'
} as const;

// Reverse mapping from room ID to slug
export const getRoomSlugById = (roomId: string): string => {
  // Find the room type by ID
  const roomTypeEntry = Object.entries(ROOM_MAPPING).find(([, id]) => id === roomId);
  
  if (roomTypeEntry) {
    const roomType = roomTypeEntry[0] as keyof typeof ROOM_SLUG_MAPPING;
    return ROOM_SLUG_MAPPING[roomType] || 'unknown-room';
  }
  
  // Fallback: generate slug from room name if available
  return 'unknown-room';
};

// Get room type from slug (reverse lookup)
export const getRoomTypeFromSlug = (slug: string): keyof typeof ROOM_MAPPING | null => {
  const entry = Object.entries(ROOM_SLUG_MAPPING).find(([, roomSlug]) => roomSlug === slug);
  return entry ? entry[0] as keyof typeof ROOM_MAPPING : null;
};

// Validate if a slug is valid
export const isValidRoomSlug = (slug: string): boolean => {
  return Object.values(ROOM_SLUG_MAPPING).includes(slug as any);
};