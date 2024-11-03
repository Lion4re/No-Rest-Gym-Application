// store/useBookingStore.ts
import { create } from 'zustand';
import { fetchAPI } from '@/lib/fetch';
import { BookingSlot, UserBooking } from '@/types/bookingTypes';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface BookingStore {
  bookingSlots: BookingSlot[];
  userBookings: UserBooking[];
  fetchBookingSlots: () => Promise<void>;
  fetchUserBookings: (userId: string) => Promise<void>;
  updateBookingSlot: (id: number, updates: Partial<BookingSlot>) => Promise<void>;
  addUserBooking: (userId: string, bookingSlotId: number) => Promise<void>;
  cancelUserBooking: (bookingId: number) => Promise<void>;
}

const TIME_ZONE = 'Europe/Athens'; // Replace with your timezone

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookingSlots: [],
  userBookings: [],

  fetchBookingSlots: async () => {
    // console.log('Fetching booking slots');
    try {
      const response = await fetchAPI('/(api)/booking_slots');
      // console.log('Booking slots response:', response);
      if ('error' in response) throw new Error(response.error);
      
      const adjustedSlots = response.data.map((slot: BookingSlot) => {
        const slotDate = toZonedTime(parseISO(slot.date), TIME_ZONE);
        return {
          ...slot,
          date: format(slotDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        };
      });
      
      set({ bookingSlots: adjustedSlots });
    } catch (error) {
      console.error('Error fetching booking slots:', error);
      throw error;
    }
  },

  fetchUserBookings: async (userId: string) => {
    // console.log('Fetching user bookings for user:', userId);
    try {
      const response = await fetchAPI(`/(api)/user_bookings?userId=${userId}`);
      // console.log('User bookings response:', response);
      if ('error' in response) throw new Error(response.error);
      set({ userBookings: response.data });
      // console.log('User bookings updated:', response.data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  updateBookingSlot: async (id: number, updates: Partial<BookingSlot>) => {
    // console.log('Updating booking slot:', id, 'with updates:', updates);
    try {
      const response = await fetchAPI(`/(api)/booking_slots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      // console.log('Update booking slot response:', response);
      if ('error' in response) throw new Error(response.error);
      set((state) => ({
        bookingSlots: state.bookingSlots.map((slot) =>
          slot.id === id ? { ...slot, ...response.data } : slot
        ),
      }));
      // console.log('Booking slots updated after update');
    } catch (error) {
      console.error('Error updating booking slot:', error);
      throw error;
    }
  },

  addUserBooking: async (userId: string, bookingSlotId: number) => {
    // console.log('Adding user booking for user:', userId, 'slot:', bookingSlotId);
    try {
      const bookingResponse = await fetchAPI('/(api)/user_bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookingSlotId }),
      });
      // console.log('Add user booking response:', bookingResponse);
      if ('error' in bookingResponse) throw new Error(bookingResponse.error);
      
      const slotResponse = await fetchAPI(`/(api)/booking_slots/${bookingSlotId}`);
      // console.log('Get updated slot response:', slotResponse);
      if ('error' in slotResponse) throw new Error(slotResponse.error);
      
      set((state: BookingStore) => ({
        userBookings: [...state.userBookings, bookingResponse.data],
        bookingSlots: state.bookingSlots.map((slot: BookingSlot) =>
          slot.id === bookingSlotId ? slotResponse.data : slot
        ),
      }));
      // console.log('User bookings and booking slots updated after adding booking');
    } catch (error) {
      console.error('Error adding user booking:', error);
      throw error;
    }
  },

  cancelUserBooking: async (bookingId: number) => {
    try {
      const response = await fetchAPI(`/(api)/user_bookings?id=${bookingId}`, {
        method: 'DELETE',
      });
      if ('error' in response) throw new Error(response.error);
      
      const booking = get().userBookings.find((b) => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');
      
      const slotResponse = await fetchAPI(`/(api)/booking_slots/${booking.booking_slot_id}`);
      if ('error' in slotResponse) throw new Error(slotResponse.error);
      
      set((state: BookingStore) => ({
        userBookings: state.userBookings.filter((b) => b.id !== bookingId),
        bookingSlots: state.bookingSlots.map((slot: BookingSlot) =>
          slot.id === parseInt(booking.booking_slot_id, 10) ? slotResponse.data : slot
        ),
      }));
    } catch (error) {
      console.error('Error cancelling user booking:', error);
      throw error;
    }
  },
}));