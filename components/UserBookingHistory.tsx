// components/UserBookingHistory.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import { format, parseISO } from 'date-fns';
import { fetchAPI } from '@/lib/fetch';

interface Booking {
  id: string;
  booked_at: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
}

const UserBookingHistory: React.FC = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetchAPI(`/(api)/user-bookings?userId=${user.id}`);
        if ('error' in response) {
          throw new Error(response.error);
        }
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text className="text-red-500 text-center">{error}</Text>;
  }

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View className="bg-gray-800 p-4 mb-4 rounded-xl">
      <Text className="text-white text-lg">
        {format(parseISO(item.date), 'MMMM d, yyyy')} at {item.time}
      </Text>
      <Text className="text-gray-400">
        Booked on: {format(parseISO(item.booked_at), 'MMMM d, yyyy HH:mm')}
      </Text>
      <Text className="text-green-400">
        {item.capacity - item.booked} spots left out of {item.capacity}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black p-4">
      <Text className="text-white text-2xl font-bold mb-4">Your Booking History</Text>
      {bookings.length === 0 ? (
        <Text className="text-white text-center">No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default UserBookingHistory;