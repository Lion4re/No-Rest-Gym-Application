import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from "@clerk/clerk-expo";
import SimpleBGLayout from '@/components/SimpleBGLayout';
import CustomButton from '@/components/CustomButton';
import { formatTime } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";

const BookingConfirmed = () => {
  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const slotId = typeof params.slotId === 'string' ? parseInt(params.slotId, 10) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { bookingSlots, fetchBookingSlots } = useBookingStore();

  useEffect(() => {
    fetchBookingSlots()
      .then(() => setIsLoading(false))
      .catch(err => {
        console.error('Error fetching booking slots:', err);
        setError("Failed to load booking details");
        setIsLoading(false);
      });
  }, [fetchBookingSlots]);

  const selectedSlot = slotId !== null ? bookingSlots.find(slot => slot.id === slotId) : undefined;

  const handleReturnHome = () => {
    router.push('/(root)/(tabs)/home');
  };

  if (isLoading) {
    return (
      <SimpleBGLayout title="Booking Confirmed">
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SimpleBGLayout>
    );
  }

  if (error || !selectedSlot) {
    return (
      <SimpleBGLayout title="Booking Confirmed">
        <View style={styles.container}>
          <Text style={styles.errorText}>
            {error || `Booking details not found for slot ID: ${slotId}`}
          </Text>
          <CustomButton
            title="Return to Home"
            onPress={handleReturnHome}
            bgVariant="primary"
            textVariant="default"
            style={styles.yellowButton}
          />
        </View>
      </SimpleBGLayout>
    );
  }

  return (
    <SimpleBGLayout title="Booking Confirmed">
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/check.png')}
          style={styles.checkImage}
        />
        <Text style={styles.title}>
          Your booking is confirmed!
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{new Date(selectedSlot.date).toDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{formatTime(selectedSlot.time)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{selectedSlot.id}</Text>
          </View>
        </View>

        <Text style={styles.thankYouText}>
          Thank you for booking, {user?.firstName || 'we are waiting you in the gym'}!
        </Text>

        <CustomButton
          title="Return to Home"
          onPress={handleReturnHome}
          bgVariant="primary"
          textVariant="default"
          style={styles.button}
        />
      </View>
    </SimpleBGLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  checkImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  thankYouText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  yellowButton: {
    backgroundColor: '#FFD700',
  }
});

export default BookingConfirmed;