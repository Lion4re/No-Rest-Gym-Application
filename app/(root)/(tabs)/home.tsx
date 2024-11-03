import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import BookingSlots from '@/components/BookingSlots';
import { fetchAPI } from '@/lib/fetch';

export default function Page() {
  const { user } = useUser();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [firstName, setFirstName] = useState<string>('');

  const checkUserApproval = useCallback(async () => {
    if (user) {
      try {
        const response = await fetchAPI(`/(api)/users/${user.id}`);
        if (response.data) {
          setIsApproved(response.data.is_approved !== undefined ? response.data.is_approved : false);
          
          // Process the name to get the first name
          if (response.data.name) {
            const fullName = response.data.name.trim();
            const firstNameFromDb = fullName.split(' ')[0];
            setFirstName(firstNameFromDb);
          }
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error checking user approval:', error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    checkUserApproval();
  }, [checkUserApproval]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkUserApproval();
    setRefreshing(false);
  }, [checkUserApproval]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!isApproved) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center px-4">
          Your account is pending approval. Please contact the gym administrator.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-gray-400">Welcome back 🔥</Text>
              <Text className="text-white text-2xl font-bold">
                {firstName || user?.firstName || user?.emailAddresses[0].emailAddress.split('@')[0]}
              </Text>
            </View>
            <Image
              source={{ uri: user?.imageUrl || 'https://via.placeholder.com/40' }}
              className="w-10 h-10 rounded-full"
            />
          </View>
          
          <Text className="text-white text-2xl font-bold mb-4">Book your session</Text>
        </View>

        <BookingSlots />
      </ScrollView>
    </SafeAreaView>
  );
}