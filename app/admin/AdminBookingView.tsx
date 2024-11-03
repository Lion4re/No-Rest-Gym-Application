import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Image } from 'react-native';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { fetchAPI } from '@/lib/fetch';
import { format, parseISO, startOfDay, addDays } from 'date-fns';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

interface BookingData {
  slot_id: number;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  booking_id: number | null;
  user_id: number | null;
  clerk_id: string | null;
  user_name: string | null;
  user_email: string | null;
  booked_at: string | null;
}

interface SlotData {
  slot_id: number;
  date: string;
  time: string;
  capacity: number;
  booked: number;
}


const AdminBookingView: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchBookings(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  const fetchBookings = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAPI(`/(api)/admin/bookings?date=${date}`);
      if (response.error) throw new Error(response.error);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slots: SlotData[] = useMemo(() => {
    const uniqueSlots = bookings.reduce((acc, booking) => {
      if (!acc[booking.slot_id]) {
        acc[booking.slot_id] = {
          slot_id: booking.slot_id,
          date: booking.date,
          time: booking.time.slice(0, 5), // Remove seconds from time
          capacity: booking.capacity,
          booked: booking.booked
        };
      }
      return acc;
    }, {} as Record<number, SlotData>);
    return Object.values(uniqueSlots).sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings]);

  const handleSlotSelection = (slotId: number) => {
    setSelectedSlot(slotId);
  };

  const renderBookingSlot = ({ item }: { item: SlotData }) => (
    <TouchableOpacity style={styles.slotItem} onPress={() => handleSlotSelection(item.slot_id)}>
      <Text style={styles.slotText}>Time: {item.time}</Text>
      <Text style={styles.slotText}>Booked: {item.booked}/{item.capacity}</Text>
    </TouchableOpacity>
  );

  const renderUserBooking = ({ item }: { item: BookingData }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingName}>{item.user_name || 'N/A'}</Text>
        <Text style={styles.bookingText}>Booked: {item.booked_at ? format(parseISO(item.booked_at), 'dd/MM/yyyy HH:mm') : 'N/A'}</Text>
        <Text style={styles.bookingText}>Email: {item.user_email || 'N/A'}</Text>
        {/* Aa a line of space */}
        <Text style={styles.bookingText}></Text>
        <Text style={styles.bookingText}>User ID: {item.user_id || 'N/A'}</Text>
        <Text style={styles.bookingText}>Clerk ID: {item.clerk_id || 'N/A'}</Text>
      </View>
    </View>
  );

  const navigateDate = (days: number) => {
    setSelectedDate(prevDate => addDays(prevDate, days));
    setSelectedSlot(null);
  };

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(startOfDay(parseISO(day.dateString)));
    setShowCalendar(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <AdminDashboardLayout title="Admin Bookings">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Admin Bookings">
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </AdminDashboardLayout>
    );
  }

  const selectedSlotData = selectedSlot ? slots.find(s => s.slot_id === selectedSlot) : null;

  return (
    <AdminDashboardLayout title="Admin Bookings">
      <View style={styles.container}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate(-1)}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCalendar(true)}>
            <Text style={styles.dateText}>{format(selectedDate, 'EEE d MMM yyyy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateDate(1)}>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </View>
        {!selectedSlot ? (
          <>
            <Text style={styles.headerText}>Booking Slots</Text>
            <FlatList
              data={slots}
              renderItem={renderBookingSlot}
              keyExtractor={(item) => item.slot_id.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No booking slots available for this day.</Text>}
            />
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setSelectedSlot(null)}>
              <Text style={styles.backButton}>← Back to Slots</Text>
            </TouchableOpacity>
            {selectedSlotData && (
              <>
                <Text style={styles.headerText}>
                  Bookings for {format(parseISO(selectedSlotData.date), 'dd/MM/yyyy')} at {selectedSlotData.time}
                </Text>
                <Text style={styles.bookingSummary}>
                  Total Bookings: {selectedSlotData.booked}/{selectedSlotData.capacity}
                </Text>
              </>
            )}
            <FlatList
              data={bookings.filter(b => b.slot_id === selectedSlot && b.booking_id !== null)}
              renderItem={renderUserBooking}
              keyExtractor={(item) => item.booking_id!.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No bookings for this slot.</Text>}
            />
          </>
        )}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, selectedColor: '#FFD700' }
              }}
              theme={{
                backgroundColor: '#000000',
                calendarBackground: '#000000',
                textSectionTitleColor: '#FFD700',
                selectedDayBackgroundColor: '#FFD700',
                selectedDayTextColor: '#000000',
                todayTextColor: '#FFD700',
                dayTextColor: '#FFFFFF',
                textDisabledColor: '#444444',
                monthTextColor: '#FFFFFF',
              }}
            />
            <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
  bookingSummary: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  slotItem: {
    backgroundColor: 'black',
    borderColor: '#FFD700',
    borderWidth: 1,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  slotText: {
    fontSize: 16,
    color: 'white',
  },
  bookingItem: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  bookingText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 10,
  },
  calendarModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminBookingView;