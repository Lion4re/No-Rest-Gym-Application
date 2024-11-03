import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useWorkoutSchedule } from '@/components/workoutScheduleContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutsScreen() {
  const { schedule, refreshSchedule } = useWorkoutSchedule();
  const navigation = useNavigation();

  useEffect(() => {
    console.log('WorkoutsScreen rendered', schedule);
  }, [schedule.version]);

  useFocusEffect(
    React.useCallback(() => {
      // console.log('WorkoutsScreen focused');
      refreshSchedule();
    }, [])
  );

  return (
    <ImageBackground
      source={require('@/assets/images/splash.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>This Week's Workout</Text>
        </View>
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
        <View style={styles.bottomOverlay} />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
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
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35, // Adjustable pantenta
    backgroundColor: 'black',
  },
});