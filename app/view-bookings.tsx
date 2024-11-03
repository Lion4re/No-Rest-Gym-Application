import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BookingSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  is_available: boolean;
}

interface UserBooking {
  id: string;
  user_id: string;
  booking_slot_id: string;
  booked_at: string;
  name: string;
  email: string;
}

const TIME_ZONE = 'Europe/Athens';

export default function ViewBookings() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const slotsResponse = await fetchAPI(`/(api)/booking_slots?date=${formattedDate}`);
      const bookingsResponse = await fetchAPI(`/(api)/user_bookings?date=${formattedDate}`);
      
      if (slotsResponse.error) throw new Error(slotsResponse.error);
      if (bookingsResponse.error) throw new Error(bookingsResponse.error);

      setSlots(slotsResponse.data);
      setUserBookings(bookingsResponse.data);
    } catch (err) {
      setError('Failed to load booking data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const slotDate = toZonedTime(parseISO(slot.date), TIME_ZONE);
      return isSameDay(slotDate, selectedDate);
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [slots, selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderSlot = ({ item }: { item: BookingSlot }) => (
    <TouchableOpacity
      style={styles.slotItem}
      onPress={() => setSelectedSlot(item)}
    >
      <Text style={styles.slotTime}>{item.time.slice(0, 5)}</Text>
      <Text style={styles.slotInfo}>Booked: {item.booked}/{item.capacity}</Text>
    </TouchableOpacity>
  );

  const renderUserBookings = () => {
    if (!selectedSlot) return null;
    const slotBookings = userBookings.filter(booking => booking.booking_slot_id === selectedSlot.id);
    
    return (
      <Modal
        visible={!!selectedSlot}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Bookings for {selectedSlot.time.slice(0, 5)}</Text>
          <FlatList
            data={slotBookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bookingItem}>
                <Text style={styles.bookingText}>Name: {item.name}</Text>
                <Text style={styles.bookingText}>Email: {item.email}</Text>
                <Text style={styles.bookingText}>Booked at: {format(parseISO(item.booked_at), 'dd/MM/yyyy HH:mm')}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No bookings for this slot.</Text>}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedSlot(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <AdminDashboardLayout title="View Bookings">
        <Text style={styles.loadingText}>Loading booking data...</Text>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="View Bookings">
        <Text style={styles.errorText}>{error}</Text>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="View Bookings">
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>
            {format(selectedDate, 'dd/MM/yyyy')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <FlatList
          data={filteredSlots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No slots available for this date.</Text>}
        />
        {renderUserBookings()}
      </View>
    </AdminDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  dateButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  slotItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slotTime: {
    color: '#fff',
    fontSize: 16,
  },
  slotInfo: {
    color: '#ccc',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
  },
  bookingItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  bookingText: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#0286FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
  },
});