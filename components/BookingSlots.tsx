import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFetch } from '@/lib/fetch';
import SessionCard from '@/components/SessionCard';
import { format, addDays, parseISO, isSameDay, isAfter, startOfDay, getDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useRouter } from 'expo-router';
import { isValidSlotTime } from '@/lib/slotUtils';
import { Ionicons } from '@expo/vector-icons';
import bookIcon from '@/assets/images/book-icon.png';

interface BookingSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  is_available: boolean;
}

interface BookingSlotsProps {
  onSlotSelect?: (slotId: string) => void;
}

const TIME_ZONE = 'Europe/Athens';
const REFRESH_INTERVAL = 5000; // 5 seconds

const BookingSlots: React.FC<BookingSlotsProps> = ({ onSlotSelect }) => {
  const router = useRouter();
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { data, loading, error, refetch } = useFetch<BookingSlot[]>('/(api)/booking_slots');
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const filteredSlots = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    
    return data.filter(slot => {
      const slotDate = toZonedTime(parseISO(slot.date), TIME_ZONE);
      const slotTime = parseISO(`1970-01-01T${slot.time}`);
      const slotDateTime = new Date(
        slotDate.getFullYear(),
        slotDate.getMonth(),
        slotDate.getDate(),
        slotTime.getHours(),
        slotTime.getMinutes(),
        slotTime.getSeconds()
      );

      const isValid = isValidSlotTime(format(slotDate, 'yyyy-MM-dd'), slot.time);
      const isSameSelectedDay = isSameDay(slotDateTime, selectedDate);
      const isAfterNow = isAfter(slotDateTime, now);
      
      return isValid && isSameSelectedDay && (isSameDay(slotDateTime, today) ? isAfterNow : true);
    }).sort((a, b) => {
      const timeA = parseISO(`1970-01-01T${a.time}`);
      const timeB = parseISO(`1970-01-01T${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });
  }, [data, selectedDate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refetch]);

  const manualRefetch = useCallback(async () => {
    setIsManualRefresh(true);
    await refetch();
    setIsManualRefresh(false);
  }, [refetch]);

  const handleSlotSelection = (slotId: string) => {
    setSelectedSlot(slotId);
    if (onSlotSelect) {
      onSlotSelect(slotId);
    } else {
      router.push({
        pathname: '/book-session',
        params: { slotId }
      });
    }
  };

  const renderItem = ({ item }: { item: BookingSlot }) => {
    const spotsLeft = item.capacity - item.booked;
    const progressPercentage = (item.booked / item.capacity) * 100;
    const timeString = item.time.slice(0, 5);

    return (
      <SessionCard
        item={{
          id: item.id,
          time: timeString,
          spotsLeft,
          image: bookIcon,
          isAvailable: item.is_available
        }}
        selected={selectedSlot === item.id}
        setSelected={() => handleSlotSelection(item.id)}
        progressPercentage={progressPercentage}
      />
    );
  };

  const goToPreviousDay = () => {
    let newDate = addDays(selectedDate, -1);
    while (getDay(newDate) === 0 || isAfter(today, newDate)) {
      newDate = addDays(newDate, -1);
    }
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    let newDate = addDays(selectedDate, 1);
    while (getDay(newDate) === 0) {
      newDate = addDays(newDate, 1);
    }
    setSelectedDate(newDate);
  };

  const isDayDisabled = (date: Date) => {
    return getDay(date) === 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateNavigation}>
        <TouchableOpacity 
          onPress={goToPreviousDay} 
          disabled={isSameDay(selectedDate, today)}
          style={[
            styles.navButton, 
            isSameDay(selectedDate, today) && styles.navButtonDisabled
          ]}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {format(selectedDate, 'EEEE, d MMMM yyyy')}
        </Text>
        <TouchableOpacity 
          onPress={goToNextDay}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {isDayDisabled(selectedDate) ? (
        <Text className="text-white text-center">No bookings available on Sundays.</Text>
      ) : (
        <FlatList
          data={filteredSlots}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text className="text-white text-center">No booking slots available for this date.</Text>}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isManualRefresh} onRefresh={manualRefetch} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
    paddingVertical: 10,
  },
  navButton: {
    backgroundColor: '#FFD700', // Yellow color
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 0,
    padding: 10,
  },
});

export default BookingSlots;