// types/bookingTypes.ts

export interface BookingSlot {
    id: number;  // Change this to string to match the API response
    date: string;
    time: string;
    capacity: number;
    booked: number;
    is_available: boolean;
  }
  
  export interface UserBooking {
    id: number;
    user_id: string;
    booking_slot_id: string;
    booked_at: string;
  }