// src/types/booking.ts

export interface RoomData {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  high_season_price: number;
  capacity: number;
  description: string | null;
  short_description: string | null;
  amenities: any;
  features: any;
  images: any;
  is_active: boolean;
  created_at: string;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  guests: string;
  specialRequests: string;
  agreeToTerms: boolean;
}

export interface BookingSubmission {
  room_id: string;
  check_in: string;  // ISO date string
  check_out: string; // ISO date string
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  guests_count: number;
  total_nights: number;
  total_price: number;
  special_requests: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface BookingConfirmation {
  id: string;
  confirmation_number: string;
  guest_name: string;
  guest_email: string;
  room_name: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  total_price: number;
  guests_count: number;
  special_requests: string;
  status: string;
  created_at: string;
}

// Platform-aware conflict types for availability checking
export interface BookingConflict {
  type: 'booking';
  check_in: string;
  check_out: string;
  guest_name?: string;
}

export interface BlockedDateConflict {
  type: 'blocked';
  date: string;
  block_type?: string; // 'full' | 'prep_before' - Platform-aware block type
  reason: string;
}

export type ConflictType = BookingConflict | BlockedDateConflict;

// Availability check result interface
export interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts: ConflictType[];
}

export interface PricingCalculation {
  basePrice: number;
  nights: number;
  roomTotal: number;
  cleaningFee: number;
  totalPrice: number;
  priceBreakdown: {
    nightlyRate: number;
    totalNights: number;
    subtotal: number;
    fees: number;
    total: number;
  };
}