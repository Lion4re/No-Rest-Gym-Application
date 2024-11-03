import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO } from 'date-fns';

interface UserBooking {
  id: string;
  user_id: string;
  booking_slot_id: string;
  booked_at: string;
  name: string;
  email: string;
}

const SlotBookingsView: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotInfo, setSlotInfo] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    fetchSlotBookings();
  }, [id]);

  const fetchSlotBookings = async () => {
    try {
      // console.log(`Fetching bookings for slot ID: ${id}, type: ${typeof id}`);
      const response = await fetchAPI(`/(api)/admin/slot-bookings?slotId=${id}`);
      // console.log('API Response:', response);
      if (response.error) throw new Error(response.error);
      if (response.data && response.data.bookings) {
        setUserBookings(response.data.bookings);
        // Assuming the first booking has the slot info
        if (response.data.bookings.length > 0) {
          const firstBooking = response.data.bookings[0];
          setSlotInfo({
            date: firstBooking.date,
            time: firstBooking.time
          });
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error('Error fetching slot bookings:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserBooking = ({ item }: { item: UserBooking }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.bookingText}>Name: {item.name}</Text>
      <Text style={styles.bookingText}>Email: {item.email}</Text>
      <Text style={styles.bookingText}>Booked at: {format(parseISO(item.booked_at), 'dd/MM/yyyy HH:mm')}</Text>
    </View>
  );

  if (loading) {
    return (
      <AdminDashboardLayout title="Slot Bookings">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Slot Bookings">
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Slot Bookings">
      <View style={styles.container}>
        {slotInfo && (
          <Text style={styles.headerText}>
            Bookings for {format(parseISO(slotInfo.date), 'dd/MM/yyyy')} at {slotInfo.time}
          </Text>
        )}
        <Text style={styles.bookingSummary}>
          Total Bookings: {userBookings.length}
        </Text>
        <FlatList
          data={userBookings}
          renderItem={renderUserBooking}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No bookings for this slot.</Text>}
        />
      </View>
    </AdminDashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  bookingSummary: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  bookingItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  bookingText: {
    fontSize: 14,
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'white',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SlotBookingsView;