import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import CustomButton from '@/components/CustomButton';
import { fetchAPI } from '@/lib/fetch';
import { useWorkoutSchedule } from '@/lib/useWorkoutSchedule';

function AdminDashboardContent() {
  const { schedule, updateSchedule } = useWorkoutSchedule();

  const handleViewUsers = () => {
    router.push('/view-users');
  };

  const handleViewBookings = () => {
    router.push('/admin/AdminBookingView');
  };

  const handleEditWorkouts = () => {
    router.push('/admin/EditWorkouts');
  };

  return (
    <View style={styles.buttonContainer}>
      <CustomButton
        title="View Users"
        onPress={handleViewUsers}
        bgVariant="primary"
        textVariant="default"
        className="mb-4"
      />
      <CustomButton
        title="View Bookings"
        onPress={handleViewBookings}
        bgVariant="primary"
        textVariant="default"
        className="mb-4"
      />
      <CustomButton
        title="Edit Workout Schedule"
        onPress={handleEditWorkouts}
        bgVariant="primary"
        textVariant="default"
      />
    </View>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // console.log('Checking admin status for user:', user.id);
          const response = await fetchAPI(`/(api)/users/${user.id}`);
          // console.log('Admin check response:', JSON.stringify(response, null, 2));
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          if (response.data && typeof response.data.is_admin === 'boolean') {
            setIsAdmin(response.data.is_admin);
            // console.log('Is admin:', response.data.is_admin);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          // console.error('Error checking admin status:', error);
          setError(`Failed to verify admin status: ${error}`);
        } finally {
          setLoading(false);
        }
      } else {
        // console.log('No user found');
        setLoading(false);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!loading && isAdmin === false && !error) {
      // console.log('Redirecting non-admin user');
      router.replace('/');
    }
  }, [loading, isAdmin, router, error]);

  if (loading) {
    return (
      <AdminDashboardLayout title="Loading...">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Error">
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton
          title="Go to Home"
          onPress={() => router.replace('/')}
          bgVariant="primary"
          textVariant="default"
        />
      </AdminDashboardLayout>
    );
  }

  if (isAdmin === null || !isAdmin) {
    return null; // This will prevent any flicker before redirect
  }

  return (
    <AdminDashboardLayout title="Admin Dashboard">
      <AdminDashboardContent />
    </AdminDashboardLayout>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});