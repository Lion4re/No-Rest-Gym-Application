import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutSchedule {
  version: number; // Add this line
  startDate: string;
  endDate: string;
  workouts: {
    [key: string]: string;
  };
}

interface WorkoutScheduleContextType {
  schedule: WorkoutSchedule;
  updateSchedule: (newSchedule: WorkoutSchedule) => Promise<void>;
  refreshSchedule: () => Promise<void>;
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

const WorkoutScheduleContext = createContext<WorkoutScheduleContextType | undefined>(undefined);

export const WorkoutScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedule, setSchedule] = useState<WorkoutSchedule>(defaultSchedule);

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

  useEffect(() => {
    loadSchedule();
  }, []);

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

  const refreshSchedule = async () => {
    await loadSchedule();
  };

  return (
    <WorkoutScheduleContext.Provider value={{ schedule, updateSchedule, refreshSchedule }}>
      {children}
    </WorkoutScheduleContext.Provider>
  );
};

export const useWorkoutSchedule = () => {
  const context = useContext(WorkoutScheduleContext);
  if (context === undefined) {
    throw new Error('useWorkoutSchedule must be used within a WorkoutScheduleProvider');
  }
  return context;
};
