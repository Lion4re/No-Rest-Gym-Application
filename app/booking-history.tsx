import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import SimpleBGLayout from '@/components/SimpleBGLayout';
import { fetchAPI } from '@/lib/fetch';
import { formatTime } from "@/lib/utils";
import { format, parseISO, startOfDay, isBefore } from 'date-fns';

interface Booking {
    id: number;
    booking_slot_id: number;
    booked_at: string;
    date: string;
    time: string;
    capacity: number;
    booked: number;
    is_available: boolean;
}

const BookingHistory: React.FC = () => {
    const { user } = useUser();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async () => {
        if (!user) return;

        try {
            const response = await fetchAPI(`/(api)/user_bookings?userId=${user.id}`);
            if ('error' in response) {
                throw new Error(response.error);
            }
            setBookings(response.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Failed to fetch bookings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleCancelBooking = async (bookingId: number, bookingSlotId: number) => {
        try {
            setIsLoading(true);
            // console.log('Attempting to cancel booking:', { bookingId, bookingSlotId });
    
            const url = `/(api)/user_bookings/${bookingId}`;
            // console.log('DELETE request URL:', url);
    
            const response = await fetchAPI(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingSlotId }),
            });
    
            // console.log('Cancel booking response:', response);
    
            if ('error' in response) {
                throw new Error(response.error);
            }
    
            Alert.alert('Success', 'Your booking has been cancelled.');
            fetchBookings(); // Refresh the bookings list
        } catch (err) {
            console.error('Error cancelling booking:', err);
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel booking. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderBookingItem = ({ item }: { item: Booking }) => {
        const bookingDate = parseISO(item.date);
        const today = startOfDay(new Date());
        const isPast = isBefore(bookingDate, today);

        return (
            <View style={[styles.bookingItem, isPast ? styles.pastBookingItem : styles.upcomingBookingItem]}>
                <View style={styles.bookingInfo}>
                    <Text style={styles.dayText}>{format(bookingDate, 'EEEE')}</Text>
                    <Text style={styles.dateText}>{format(bookingDate, 'MMMM d, yyyy')}</Text>
                    <Text style={styles.timeText}>{formatTime(item.time)}</Text>
                    <Text style={styles.spotsText}>Spots: {item.booked}/{item.capacity}</Text>
                    <Text style={[styles.statusText, isPast ? styles.pastText : styles.upcomingText]}>
                        {isPast ? 'Past' : 'Upcoming'}
                    </Text>
                </View>
                {!isPast && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            Alert.alert(
                                'Cancel Booking',
                                'Are you sure you want to cancel this booking?',
                                [
                                    { text: 'No', style: 'cancel' },
                                    { text: 'Yes', onPress: () => handleCancelBooking(item.id, item.booking_slot_id) }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SimpleBGLayout title="Booking History">
                <ActivityIndicator size="large" color="#ffffff" />
            </SimpleBGLayout>
        );
    }

    if (error) {
        return (
            <SimpleBGLayout title="Booking History">
                <Text style={styles.errorText}>{error}</Text>
            </SimpleBGLayout>
        );
    }

    return (
        <SimpleBGLayout title="Booking History">
            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
            />
        </SimpleBGLayout>
    );
};

const styles = StyleSheet.create({
    bookingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    pastBookingItem: {
        borderColor: '#888',
        borderWidth: 1,
    },
    upcomingBookingItem: {
        borderColor: '#FFD700',
        borderWidth: 1,
    },
    bookingInfo: {
        flex: 1,
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    timeText: {
        fontSize: 16,
        color: '#bbb',
        marginBottom: 5,
    },
    spotsText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 5,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    pastText: {
        color: '#888',
    },
    upcomingText: {
        color: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 80,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default BookingHistory;