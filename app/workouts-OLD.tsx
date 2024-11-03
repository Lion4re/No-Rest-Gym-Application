import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useWorkoutSchedule } from '@/components/workoutScheduleContext';
import { useFocusEffect } from '@react-navigation/native';
import GymBookingLayout from '@/components/GymBookingLayout';

export default function WorkoutsScreen() {
  const { schedule, refreshSchedule } = useWorkoutSchedule();

  useEffect(() => {
    console.log('WorkoutsScreen rendered', schedule);
  }, [schedule.version]); // Change this line

  useFocusEffect(
    React.useCallback(() => {
      console.log('WorkoutsScreen focused');
      refreshSchedule();
    }, [])
  );

  return (
    <GymBookingLayout title="Today's Workout" key={schedule.version}>
      <ImageBackground
        source={require('@/assets/images/splash.png')}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <Text style={styles.dateRange}>
              {schedule.startDate} - {schedule.endDate}
            </Text>
            {Object.entries(schedule.workouts).map(([day, workout]) => (
              <View key={day} style={styles.workoutItem}>
                <Text style={styles.dayText}>{day}:</Text>
                <Text style={styles.workoutText}>{workout}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </GymBookingLayout>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  dateRange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutItem: {
    marginBottom: 15,
  },
  dayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  workoutText: {
    fontSize: 16,
    color: 'white',
  },
});