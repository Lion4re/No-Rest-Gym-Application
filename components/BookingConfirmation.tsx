import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { useUser } from '@clerk/clerk-expo';

interface BookingSlot {
  id: number;
  date: string;
  time: string;
  capacity: number;
  booked: number;
}

const API_URL = 'http://localhost:3000'; // We'll change this for production

const BookingConfirmation = () => {
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/test-db`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();
      setBookingSlots(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingSlots();
  }, []);

  if (loading) return <Text className="text-white">Loading sessions...</Text>;
  if (error) return <Text className="text-white">Error loading sessions: {error}</Text>;

  return (
    <SafeAreaView className="flex-1 bg-black px-4">
      <Text className="text-white text-2xl font-bold mb-4">Available Sessions</Text>
      <FlatList
        data={bookingSlots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-gray-800 p-4 mb-4 rounded-xl">
            <Text className="text-white text-lg">{new Date(item.date).toDateString()} at {item.time}</Text>
            <Text className="text-green-400">{item.capacity - item.booked} spots left</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default BookingConfirmation;