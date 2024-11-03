import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import GymBookingLayout from '@/components/GymBookingLayout';
import CustomButton from '@/components/CustomButton';
import { formatTime } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";
import { BookingSlot } from '@/types/bookingTypes';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO } from 'date-fns';

const BookSession = () => {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const slotId = typeof params.slotId === 'string' ? parseInt(params.slotId, 10) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { bookingSlots, fetchBookingSlots } = useBookingStore();
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);

  const previousSpotsLeft = useRef<number | null>(null);

  const loadSlotData = async () => {
    try {
      if (slotId === null || !user) {
        throw new Error("Invalid slot ID or user not authenticated");
      }

      await fetchBookingSlots();
      const slot = bookingSlots.find(slot => slot.id === slotId);

      if (!slot) {
        throw new Error("Session not found");
      }

      setSelectedSlot(slot);

      const response = await fetchAPI(`/(api)/user_bookings?userId=${user.id}&bookingSlotId=${slotId}`);

      if ('error' in response) {
        throw new Error(`Failed to fetch user bookings: ${response.error}`);
      }

      if (Array.isArray(response.data) && response.data.length > 0) {
        setIsAlreadyBooked(true);
        setError("You have already booked this session. Please choose a different time.");
      } else {
        setIsAlreadyBooked(false);
        setError(null);
      }

      const currentSpotsLeft = slot.capacity - slot.booked;
      if (previousSpotsLeft.current !== currentSpotsLeft) {
        previousSpotsLeft.current = currentSpotsLeft;
      }

    } catch (err) {
      console.error('Error loading slot data:', err);
      setError(err instanceof Error ? err.message : "Failed to load session data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlotData();

    const intervalId = setInterval(() => {
      loadSlotData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [slotId, user]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !user) {
      setError("Unable to confirm booking. Please try again.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const bookingResponse = await fetchAPI('/(api)/user_bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          bookingSlotId: selectedSlot.id
        }),
      });
  
      if ('error' in bookingResponse) {
        throw new Error(bookingResponse.error);
      }
  
      await fetchBookingSlots();
  
      router.push({
        pathname: '/booking-confirmed' as const,
        params: { slotId: selectedSlot.id.toString() }
      });
    } catch (err) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof Error) {
        if (err.message === "You have already booked this slot") {
          errorMessage = "You have already booked this session. Please choose a different time.";
          setIsAlreadyBooked(true);
        } else {
          errorMessage = `Failed to confirm booking: ${err.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd-MM-yyyy');
  };

  if (!selectedSlot) {
    return (
      <GymBookingLayout title="Book Session">
        <Text className="text-white text-center">{error || "Session not found"}</Text>
      </GymBookingLayout>
    );
  }

  const spotsLeft = selectedSlot.capacity - selectedSlot.booked;

  return (
    <GymBookingLayout title="Book Session">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-white mb-6 text-center">
          Session Information
        </Text>

        <View className="bg-gray-800 rounded-lg p-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg text-white font-semibold">Date</Text>
            <Text className="text-lg text-white">{formatDate(selectedSlot.date)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg text-white font-semibold">Time</Text>
            <Text className="text-lg text-white">{formatTime(selectedSlot.time)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-white font-semibold">Spots Left</Text>
            <Text className="text-lg text-white">{spotsLeft}</Text>
          </View>
        </View>

        {error && (
          <Text className="text-red-500 text-center mb-6">{error}</Text>
        )}

        {spotsLeft === 0 ? (
          <Text className="text-red-500 text-center mb-6">This session is fully booked.</Text>
        ) : (
          !isAlreadyBooked && !error && (
            <CustomButton
              title="Confirm Session"
              onPress={handleConfirmBooking}
              bgVariant="success"
              textVariant="default"
              disabled={isLoading}
            />
          )
        )}
      </View>
    </GymBookingLayout>
  );
};

export default BookSession;