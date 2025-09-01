// src/utils/roomMapping.ts

export type RoomType = 'garden' | 'stone' | 'terrace' | 'modern';

export const ROOM_MAPPING = {
  garden: 'bb65fd59-a6f0-457e-95ea-d1670170dd89',    // Garden Room Sanctuary
  stone: 'af699476-dba5-4a96-a949-572c64f8a729',     // Historic Stone Vault Apartment  
  terrace: 'e25ee58b-f5a1-4db8-9556-00d91956b7fa',   // Panoramic Terrace Apartment
  modern: 'c11ffff7-625e-48d9-8be3-4528cb4ac407'     // Contemporary Luxury Apartment
} as const;

export const ROOM_NAMES = {
  garden: 'Garden Room Sanctuary',
  stone: 'Historic Stone Vault Apartment',  
  terrace: 'Panoramic Terrace Apartment',
  modern: 'Contemporary Luxury Apartment'
} as const;

/**
 * Get database ID from room type
 */
export const getRoomId = (roomType: RoomType): string => {
  return ROOM_MAPPING[roomType];
};

/**
 * Get room type from database ID
 */
export const getRoomTypeFromId = (roomId: string): RoomType | null => {
  const entry = Object.entries(ROOM_MAPPING).find(([, id]) => id === roomId);
  return entry ? (entry[0] as RoomType) : null;
};

/**
 * Get full room name from room type
 */
export const getRoomName = (roomType: RoomType): string => {
  return ROOM_NAMES[roomType];
};

/**
 * Validate if room type is valid
 */
export const isValidRoomType = (roomType: string): roomType is RoomType => {
  return Object.keys(ROOM_MAPPING).includes(roomType);
};