import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutSchedule {
  version: number; // Add this line
  startDate: string;
  endDate: string;
  workouts: {
    [key: string]: string;
  };
}

const defaultSchedule: WorkoutSchedule = {
  version: 1,
  startDate: '07/10/24',
  endDate: '12/10/24',
  workouts: {
    Monday: 'Leg Day',
    Tuesday: 'Chest',
    Wednesday: 'Full-Body',
    Thursday: 'Back',
    Friday: 'Leg Day',
    Saturday: 'Full-Body',
    Sunday: 'Rest',
  },
};

export function useWorkoutSchedule() {
  const [schedule, setSchedule] = useState<WorkoutSchedule>(defaultSchedule);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const savedSchedule = await AsyncStorage.getItem('workoutSchedule');
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      }
    } catch (error) {
      console.error('Failed to load workout schedule', error);
    }
  };

  const updateSchedule = async (newSchedule: WorkoutSchedule) => {
    const updatedSchedule = {
      ...newSchedule,
      version: (newSchedule.version || 0) + 1, // Increment version
    };
    setSchedule(updatedSchedule);
    try {
      await AsyncStorage.setItem('workoutSchedule', JSON.stringify(updatedSchedule));
    } catch (error) {
      console.error('Failed to save workout schedule', error);
    }
  };

  return { schedule, updateSchedule };
}